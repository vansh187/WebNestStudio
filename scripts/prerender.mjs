// Build-time static prerendering for public routes.
//
// Why: this app is 100% client-side-rendered (index.html is just <div id="root">).
// Googlebot renders JS but on a delayed, budget-limited second pass; many AI answer-
// engine crawlers and social link-preview bots don't execute JS at all. Those visitors
// currently see an empty shell instead of real content/meta tags.
//
// What this does: after `vite build`, spin up the built app, visit each public route
// in headless Chromium, wait for the useSeo/useStructuredData effects (src/hooks/useSeo.js)
// to actually commit, and write the fully-rendered HTML into dist/<route>/index.html.
// Vercel serves these static files directly (filesystem match wins over the SPA catch-all
// rewrite in vercel.json), so crawlers get real HTML on the first request. Real users still
// get the full SPA - main.jsx uses createRoot (not hydrateRoot), so React simply replaces
// this static shell with its own render once the JS bundle runs. No hydration mismatch risk,
// but expect a visible flash on very slow connections - that's an accepted tradeoff since the
// static HTML's audience is non-JS-executing crawlers, not a perceived-perf win for humans.
//
// Known limitation: prerendered blog/portfolio HTML is a snapshot from build time. Posts
// publish/expire on a ~2-day cycle server-side, so the static snapshot can drift from the
// live API between Vercel deploys. Real users always see live data (the SPA re-fetches on
// top), so this only affects non-JS crawlers, bounded by the interval between deploys. Not
// solved here - a future scheduled/webhook-triggered redeploy could close that window.
//
// Failure handling: a backend outage/timeout while enumerating dynamic slugs is non-fatal -
// we skip dynamic-route prerendering and continue with static routes only (mirrors the
// existing FALLBACK_POSTS/FALLBACK_FAQS "backend down is not a hard failure" pattern).

import { preview } from 'vite'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.VITE_API_BASE_URL || 'https://webneststudiobackend-n00h.onrender.com'
// Must match src/hooks/useSeo.js's SITE_URL exactly - this is what the canonical-tag
// wait-check below compares against. The apex domain 308-redirects to www, so this
// has to be the www form (the domain that actually serves the page).
const SITE_URL = 'https://www.webneststudio.co.in'
const BACKEND_TIMEOUT_MS = 60000 // matches apiClient.js's COLD_START_TIMEOUT for Render free-tier cold starts
const PER_ROUTE_TIMEOUT_MS = 15000
const DIST_DIR = path.resolve(process.cwd(), 'dist')

// Vercel's build container is a minimal Amazon Linux image missing the shared
// libraries (libnss3, libatk, libx11, ...) a normal desktop-Linux Chromium needs to
// even launch - full Playwright's bundled browser exits immediately there (exit
// code 127). @sparticuz/chromium ships a build compiled specifically to run in that
// kind of constrained/serverless environment. Locally (and in any other CI), the
// full `playwright` package with its own bundled browser works fine and needs no
// special handling - only swap to the serverless build when actually on Vercel.
async function launchBrowser() {
  if (process.env.VERCEL) {
    const [{ chromium }, sparticuzChromium] = await Promise.all([
      import('playwright-core'),
      import('@sparticuz/chromium').then((m) => m.default),
    ])
    return chromium.launch({
      args: sparticuzChromium.args,
      executablePath: await sparticuzChromium.executablePath(),
      headless: true,
    })
  }
  const { chromium } = await import('playwright')
  return chromium.launch()
}

// Mirrors the public (non-auth, non-admin) branch of src/App.jsx exactly. /login, /portal,
// and /admin/* are deliberately excluded - noindexed or auth-gated, no reason to prerender.
const STATIC_ROUTES = ['/', '/about', '/services', '/portfolio', '/blog', '/faqs', '/contact']

async function fetchJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function getDynamicRoutes() {
  try {
    const [posts, portfolioItems] = await Promise.all([
      fetchJson(`${BASE_URL}/api/blog`),
      fetchJson(`${BASE_URL}/api/portfolio`),
    ])
    return [
      ...posts.map((p) => `/blog/${p.slug}`),
      ...portfolioItems.map((p) => `/portfolio/${p.slug}`),
    ]
  } catch (err) {
    console.warn(`[prerender] Skipping dynamic routes - backend unreachable: ${err.message}`)
    return []
  }
}

async function prerenderRoute(page, baseOrigin, route) {
  const url = `${baseOrigin}${route}`
  try {
    try {
      // 'networkidle' is the strong guarantee (waits out any async data fetch on
      // dynamic detail pages) - but a page with a persistently-polling embed (e.g.
      // /portfolio's live iframe previews) never goes idle. Fall back to 'load' for
      // just that case rather than special-casing routes by name.
      await page.goto(url, { waitUntil: 'networkidle', timeout: PER_ROUTE_TIMEOUT_MS })
    } catch {
      await page.goto(url, { waitUntil: 'load', timeout: PER_ROUTE_TIMEOUT_MS })
    }
    const expectedCanonical = `${SITE_URL}${route}`
    await page.waitForFunction(
      (expected) => document.querySelector('link[rel="canonical"]')?.href === expected,
      expectedCanonical,
      { timeout: PER_ROUTE_TIMEOUT_MS }
    )
    const html = await page.content()

    const outDir = route === '/' ? DIST_DIR : path.join(DIST_DIR, route)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, 'index.html'), html, 'utf-8')
    console.log(`[prerender] ✓ ${route}`)
  } catch (err) {
    console.warn(`[prerender] ✗ ${route} - ${err.message}`)
  }
}

async function main() {
  const dynamicRoutes = await getDynamicRoutes()
  const routes = [...STATIC_ROUTES, ...dynamicRoutes]

  const server = await preview({ preview: { port: 4174, strictPort: true } })
  const baseOrigin = server.resolvedUrls.local[0].replace(/\/$/, '')

  const browser = await launchBrowser()
  const page = await browser.newPage()

  // Sequential on purpose - a single shared page/browser context keeps this simple
  // and the route count is small enough that parallelizing isn't worth the complexity.
  for (const route of routes) {
    await prerenderRoute(page, baseOrigin, route)
  }

  await browser.close()
  await new Promise((resolve, reject) => {
    server.httpServer.close((err) => (err ? reject(err) : resolve()))
  })

  console.log(`[prerender] Done - ${routes.length} routes attempted.`)
}

main().catch((err) => {
  console.error('[prerender] Fatal error:', err)
  process.exit(1)
})
