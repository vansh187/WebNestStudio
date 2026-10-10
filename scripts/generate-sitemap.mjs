import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { FALLBACK_POSTS } from '../src/data/blogContent.js'
import { SAMPLE_COURSES, SAMPLE_LESSONS, SAMPLE_PROBLEMS } from '../src/data/codelabDefaults.js'
import { getLessonVideo } from '../src/data/lessonVideos.js'

import { SITE_URL, validLastmod, isBlogIndexable, BLOG_REDIRECT_SLUGS } from '../src/lib/seo.js'
import { SERVICE_PAGES } from '../src/data/servicePages.js'
import { CASE_STUDIES } from '../src/data/caseStudies.js'
import { COMMERCIAL_PAGES } from '../src/data/commercialPages.js'
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://webneststudiobackend-n00h.onrender.com'
const OUTPUT_PATH = path.resolve(process.cwd(), 'public', 'sitemap.xml')
// Lesson content lives in code, so its lastmod is tracked by content hash: a lesson's
// date only moves when its rendered page changes. Only `npm run sitemap` (which
// passes --write-lastmod) rewrites it; commit the file after regenerating.
const LESSON_LASTMOD_PATH = path.resolve(process.cwd(), 'scripts', 'lesson-lastmod.json')
const WRITE_LASTMOD = process.argv.includes('--write-lastmod')
const FETCH_TIMEOUT_MS = 15000

const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/our-story', changefreq: 'monthly', priority: '0.7' },
  { path: '/authors/webnest-studio', changefreq: 'monthly', priority: '0.5' },
  { path: '/services', changefreq: 'monthly', priority: '0.8' },
  { path: '/portfolio', changefreq: 'weekly', priority: '0.8' },
  { path: '/case-studies', changefreq: 'monthly', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/faqs', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-and-conditions', changefreq: 'yearly', priority: '0.3' },
  { path: '/disclaimer', changefreq: 'yearly', priority: '0.3' },
  // Still prerendered so the QR link works, but kept out of the sitemap.
  { path: '/card', noindex: true },
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
    lastmod: validLastmod(route.lastmod),
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
  const endpoints = [
    ['/api/blog', '/blog'], ['/api/portfolio', '/portfolio'], ['/api/codelab/problems', '/codelab/problems'],
  ]
  const results = await Promise.allSettled(endpoints.map(async ([endpoint, prefix]) => {
    const response = await fetchJson(endpoint)
    const items = Array.isArray(response) ? response : response?.items
    if (!Array.isArray(items)) throw new Error(`Invalid list from ${endpoint}`)
    return items.filter((item) => /^[a-zA-Z0-9_-]+$/.test(item?.slug || '')
      && !(prefix === '/blog' && BLOG_REDIRECT_SLUGS.has(item.slug))
      && !(prefix === '/codelab/problems' && item.slug === 'sum-two-smoke')).map((item) => ({
      path: `${prefix}/${item.slug}`, lastmod: item.updated_at || item.published_at || item.created_at,
      required: false,
      noindex: prefix === '/blog' && !isBlogIndexable(item),
    }))
  }))
  return results.flatMap((result, index) => {
    if (result.status === 'fulfilled') return result.value
    console.warn(`[sitemap] ${endpoints[index][0]} unavailable: ${result.reason.message}`)
    return []
  })
}

const shortHash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16)

// Covers everything LessonDetail renders: the whole lesson record (body, examples,
// practice, resources...) plus any spliced-in video.
const lessonHash = (id) => shortHash([SAMPLE_LESSONS[id], getLessonVideo(id)])
// Pre-2026-10-08 manifests hashed only these fields; matching one keeps its date
// instead of bumping every lesson at once. Safe to drop once the manifest is rewritten.
const legacyLessonHash = (lesson) => shortHash([lesson.seo_title, lesson.description, lesson.content.body])

// Builds only read the committed manifest. A lesson whose hash no longer matches
// gets no <lastmod> at all (rather than the deploy date) until someone runs
// `npm run sitemap` locally and commits scripts/lesson-lastmod.json.
async function getLessonLastmods(lessonIds) {
  let previous = {}
  try {
    previous = JSON.parse(await readFile(LESSON_LASTMOD_PATH, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const today = new Date().toISOString().slice(0, 10)
  const next = {}
  const stale = []
  for (const id of lessonIds) {
    const hash = lessonHash(id)
    const known = previous[id]
    if (known && (known.hash === hash || known.hash === legacyLessonHash(SAMPLE_LESSONS[id]))) {
      next[id] = { hash, lastmod: known.lastmod }
    } else {
      stale.push(id)
      next[id] = { hash, lastmod: WRITE_LASTMOD ? today : undefined }
    }
  }
  if (WRITE_LASTMOD) {
    await writeFile(LESSON_LASTMOD_PATH, `${JSON.stringify(next, null, 2)}\n`)
    if (stale.length) console.log(`[sitemap] Updated lastmod for ${stale.length} lesson(s); commit scripts/lesson-lastmod.json`)
  } else if (stale.length) {
    console.warn(`[sitemap] ${stale.length} lesson(s) changed since scripts/lesson-lastmod.json was written; omitting their lastmod. Run \`npm run sitemap\` and commit the manifest.`)
  }
  return next
}

async function getLocalRoutes() {
  const lessonIds = Object.keys(SAMPLE_LESSONS).filter((id) => SAMPLE_LESSONS[id]?.id === id && SAMPLE_LESSONS[id].indexable)
  const lessonLastmods = await getLessonLastmods(lessonIds)

  return [
    ...COMMERCIAL_PAGES.map((page) => ({ path: page.path, priority: '0.9', local: true })),
    ...SERVICE_PAGES.map((service) => ({ path: `/services/${service.slug}`, local: true })),
    ...CASE_STUDIES.map((study) => ({ path: `/case-studies/${study.slug}`, priority: '0.8', local: true })),
    ...FALLBACK_POSTS.map((post) => ({
      path: `/blog/${post.slug}`,
      lastmod: post.updated_at || post.published_at,
      changefreq: 'monthly',
      priority: '0.7',
      noindex: !isBlogIndexable(post),
    })),
    ...SAMPLE_COURSES.map((course) => ({
      path: `/learn/${course.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
    })),
    ...lessonIds.map((id) => ({
      path: `/learn/lessons/${id}`,
      lastmod: lessonLastmods[id].lastmod,
      changefreq: 'monthly',
      priority: '0.6',
    })),
    ...SAMPLE_PROBLEMS.filter((problem) => problem.slug !== 'sum-two-smoke').map((problem) => ({
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
  const urls = uniqueRoutes(routes).filter((route) => !route.noindex).map(createUrl)
  urls.sort((a, b) => a.loc.localeCompare(b.loc))

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
${url.lastmod ? `    <lastmod>${escapeXml(url.lastmod)}</lastmod>\n` : ''}    <changefreq>${escapeXml(url.changefreq)}</changefreq>
    <priority>${escapeXml(url.priority)}</priority>
  </url>`).join('\n')}
</urlset>
`
}

async function main() {
  const liveRoutes = await getLiveRoutes()
  const routes = [...STATIC_ROUTES, ...await getLocalRoutes(), ...liveRoutes]
  await writeFile(OUTPUT_PATH, toXml(routes), 'utf8')
  await mkdir('.seo-build', { recursive: true })
  await writeFile('.seo-build/routes.json', JSON.stringify(uniqueRoutes(routes), null, 2))
  console.log(`[sitemap] Wrote ${uniqueRoutes(routes).length} URLs to ${OUTPUT_PATH}`)
}

main().catch((error) => {
  console.error('[sitemap] Failed:', error)
  process.exit(1)
})
