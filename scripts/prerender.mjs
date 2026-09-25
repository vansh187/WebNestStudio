// Snapshot the same canonical inventory that generates the sitemap.
import { preview } from 'vite'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { launchBrowser } from './browser.mjs'
import { canonicalUrl } from '../src/lib/seo.js'

const dist = path.resolve('dist')
const manifest = JSON.parse(await readFile('.seo-build/routes.json', 'utf8'))
const shell = await readFile(path.join(dist, 'app.html'), 'utf8').catch(() => readFile(path.join(dist, 'index.html'), 'utf8'))
await writeFile(path.join(dist, 'app.html'), shell)
const server = await preview({ preview: { port: 4174, strictPort: true } })
const origin = server.resolvedUrls.local[0].replace(/\/$/, '')
let browser
const failures = []
const completed = []
try {
  browser = await launchBrowser()
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  await context.addInitScript(() => { window.__PRERENDER__ = true })
  // Serve the original shell on every navigation. Previously the home snapshot
  // could leak its schema/meta into every later snapshot through SPA fallback.
  await context.route('**/*', async (route) => {
    const request = route.request()
    if (request.isNavigationRequest()) {
      if (request.frame().parentFrame()) return route.abort()
      if (new URL(request.url()).origin === origin) return route.fulfill({ contentType: 'text/html', body: shell })
    }
    if (/googlesyndication|google-analytics|vercel-insights/.test(request.url())) return route.abort()
    return route.continue()
  })
  const queue = [...manifest, { path: '/404', required: true, noindex: true }]
  async function worker() {
    const page = await context.newPage()
    while (queue.length) {
      const entry = queue.shift()
      try {
        await page.goto(`${origin}${entry.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
        await page.waitForFunction(({ expected, noindex }) => {
          const robots = document.querySelector('meta[name="robots"]')?.content || ''
          return document.querySelector('link[rel="canonical"]')?.href === expected
            && !!document.querySelector('h1')?.textContent.trim()
            && (noindex || !robots.includes('noindex'))
        }, { expected: canonicalUrl(entry.path), noindex: entry.noindex }, { timeout: 65000 })
        // Local lessons need no API data. Give API-backed public pages time to settle.
        if (!entry.path.startsWith('/learn') && !entry.path.startsWith('/services/')) {
          await page.waitForLoadState('networkidle', { timeout: 65000 })
        }
        if (!entry.noindex && await page.locator('meta[name="robots"]').getAttribute('content').then((value) => value.includes('noindex'))) throw new Error('Page is noindex or unavailable')
        await page.evaluate(() => {
          document.body.style.overflow = ''
          document.documentElement.style.overflow = ''
          // Reveal animations must not hide the delivered content without JavaScript.
          document.querySelectorAll('[style]').forEach((element) => {
            if (element.style.opacity === '0') { element.style.opacity = '1'; element.style.transform = 'none' }
          })
        })
        const output = entry.path === '/' ? path.join(dist, 'index.html') : path.join(dist, `${entry.path.slice(1)}.html`)
        await mkdir(path.dirname(output), { recursive: true })
        await writeFile(output, await page.content(), 'utf8')
        completed.push(entry.path)
        if (completed.length % 25 === 0) console.log(`[prerender] ${completed.length}/${manifest.length + 1} rendered`)
      } catch (error) {
        failures.push({ ...entry, error: error.message })
        console.warn(`[prerender] Failed ${entry.path}: ${error.message}`)
      }
    }
    await page.close()
  }
  await Promise.all([worker(), worker(), worker()])
} finally {
  await browser?.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
await writeFile('.seo-build/prerender-report.json', JSON.stringify({ completed, failures }, null, 2))
// A failed optional live detail must not remain advertised in the sitemap.
if (failures.length) {
  let sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const failure of failures) {
    sitemap = sitemap.replace(/  <url>[\s\S]*?<\/url>\n/g, (block) => block.includes(`<loc>${canonicalUrl(failure.path)}</loc>`) ? '' : block)
  }
  await writeFile(path.join(dist, 'sitemap.xml'), sitemap)
}
console.log(`[prerender] ${completed.length} rendered; ${failures.length} failed`)
if (failures.some((entry) => entry.required !== false)) process.exitCode = 1
