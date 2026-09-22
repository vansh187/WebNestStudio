import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { FALLBACK_POSTS } from '../src/data/blogContent.js'
import { SAMPLE_COURSES, SAMPLE_LESSONS, SAMPLE_PROBLEMS } from '../src/data/codelabDefaults.js'

const SITE_URL = 'https://www.webneststudio.co.in'
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://webneststudiobackend-n00h.onrender.com'
const OUTPUT_PATH = path.resolve(process.cwd(), 'public', 'sitemap.xml')
const TODAY = new Date().toISOString().slice(0, 10)
const FETCH_TIMEOUT_MS = 15000

const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/our-story', changefreq: 'monthly', priority: '0.7' },
  { path: '/services', changefreq: 'monthly', priority: '0.8' },
  { path: '/portfolio', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/faqs', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-and-conditions', changefreq: 'yearly', priority: '0.3' },
  { path: '/disclaimer', changefreq: 'yearly', priority: '0.3' },
  { path: '/card', changefreq: 'monthly', priority: '0.5' },
  { path: '/codelab', changefreq: 'weekly', priority: '0.8' },
  { path: '/codelab/playground', changefreq: 'monthly', priority: '0.6' },
  { path: '/codelab/problems', changefreq: 'weekly', priority: '0.7' },
  { path: '/learn', changefreq: 'weekly', priority: '0.8' },
]

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function normalizePath(routePath) {
  if (!routePath || routePath === '/') return '/'
  return `/${String(routePath).replace(/^\/+|\/+$/g, '')}`
}

function createUrl(route) {
  const routePath = normalizePath(route.path)
  return {
    loc: `${SITE_URL}${routePath === '/' ? '' : routePath}`,
    lastmod: route.lastmod || TODAY,
    changefreq: route.changefreq || 'monthly',
    priority: route.priority || '0.5',
  }
}

async function fetchJson(endpoint) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

async function getLiveRoutes() {
  try {
    const [posts, portfolioItems, problemsResponse] = await Promise.all([
      fetchJson('/api/blog'),
      fetchJson('/api/portfolio'),
      fetchJson('/api/codelab/problems'),
    ])
    const problems = Array.isArray(problemsResponse?.items) ? problemsResponse.items : problemsResponse

    return [
      ...posts
        .filter((post) => post?.slug)
        .map((post) => ({
          path: `/blog/${post.slug}`,
          lastmod: (post.updated_at || post.published_at || TODAY).slice(0, 10),
          changefreq: 'monthly',
          priority: '0.7',
        })),
      ...portfolioItems
        .filter((item) => item?.slug)
        .map((item) => ({
          path: `/portfolio/${item.slug}`,
          lastmod: (item.updated_at || item.created_at || TODAY).slice(0, 10),
          changefreq: 'monthly',
          priority: '0.7',
        })),
      ...(Array.isArray(problems) ? problems : [])
        .filter((problem) => problem?.slug)
        .map((problem) => ({
          path: `/codelab/problems/${problem.slug}`,
          lastmod: (problem.updated_at || problem.created_at || TODAY).slice(0, 10),
          changefreq: 'monthly',
          priority: '0.6',
        })),
    ]
  } catch (error) {
    console.warn(`[sitemap] Live API routes skipped: ${error.message}`)
    return []
  }
}

function getLocalRoutes() {
  const lessonIds = Object.keys(SAMPLE_LESSONS).filter((id) => SAMPLE_LESSONS[id]?.id === id)

  return [
    ...FALLBACK_POSTS.map((post) => ({
      path: `/blog/${post.slug}`,
      lastmod: (post.updated_at || post.published_at || TODAY).slice(0, 10),
      changefreq: 'monthly',
      priority: '0.7',
    })),
    ...SAMPLE_COURSES.map((course) => ({
      path: `/learn/${course.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
    })),
    ...lessonIds.map((id) => ({
      path: `/learn/lessons/${id}`,
      changefreq: 'monthly',
      priority: '0.6',
    })),
    ...SAMPLE_PROBLEMS.map((problem) => ({
      path: `/codelab/problems/${problem.slug}`,
      changefreq: 'monthly',
      priority: '0.6',
    })),
  ]
}

function uniqueRoutes(routes) {
  const byPath = new Map()
  for (const route of routes) {
    const routePath = normalizePath(route.path)
    byPath.set(routePath, { ...route, path: routePath })
  }
  return [...byPath.values()]
}

function toXml(routes) {
  const urls = uniqueRoutes(routes).map(createUrl)
  urls.sort((a, b) => a.loc.localeCompare(b.loc))

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
    <changefreq>${escapeXml(url.changefreq)}</changefreq>
    <priority>${escapeXml(url.priority)}</priority>
  </url>`).join('\n')}
</urlset>
`
}

async function main() {
  const liveRoutes = await getLiveRoutes()
  const routes = [...STATIC_ROUTES, ...getLocalRoutes(), ...liveRoutes]
  await writeFile(OUTPUT_PATH, toXml(routes), 'utf8')
  console.log(`[sitemap] Wrote ${uniqueRoutes(routes).length} URLs to ${OUTPUT_PATH}`)
}

main().catch((error) => {
  console.error('[sitemap] Failed:', error)
  process.exit(1)
})
