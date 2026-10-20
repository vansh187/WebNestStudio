import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { ADSENSE_CLIENT, canonicalUrl } from '../src/lib/seo.js'
import { EXTRA_HTML_FILES, missingRouteProblem, snapshotProblems } from './prerender-checks.mjs'

const dist = path.resolve('dist')
const manifest = JSON.parse(await readFile('.seo-build/routes.json', 'utf8'))
const report = JSON.parse(await readFile('.seo-build/prerender-report.json', 'utf8').catch(() => '{"failures":[]}'))
const failedPaths = new Set((report.failures ?? []).map((failure) => failure.path))
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8').catch(() => '')
const assets = await readdir(path.join(dist, 'assets'))
const logos = assets.filter((name) => /^logo-[A-Za-z0-9_-]+\.png$/.test(name))
if (logos.length !== 1) throw new Error(`Expected one current hashed logo in dist/assets; found ${logos.join(', ') || 'none'}`)
const currentLogo = `/assets/${logos[0]}`
const homeCanonical = canonicalUrl('/')
const titles = new Map()
const hashes = new Map()
const errors = []
const skipped = []

const fileOf = (routePath) => (routePath === '/' ? path.join(dist, 'index.html') : path.join(dist, `${routePath.slice(1)}.html`))

for (const route of manifest) {
  const file = fileOf(route.path)
  const canonical = canonicalUrl(route.path)
  let html
  try { html = await readFile(file, 'utf8') } catch {
    const problem = missingRouteProblem(route, { failedPaths, sitemap, canonical })
    if (problem) errors.push(`${route.path}: ${problem} ${path.relative(dist, file)}`)
    else skipped.push(route.path)
    continue
  }
  for (const problem of snapshotProblems(html, { path: route.path, client: ADSENSE_CLIENT, canonical, homeCanonical, currentLogo })) {
    errors.push(`${route.path}: ${problem}`)
  }
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim()
  if (title) {
    if (titles.has(title)) errors.push(`${route.path}: title duplicates ${titles.get(title)}: ${title}`)
    else titles.set(title, route.path)
  }
  const priorRoute = hashes.get(html)
  if (priorRoute) errors.push(`${route.path}: byte-identical HTML duplicates ${priorRoute}`)
  else hashes.set(html, route.path)
}

// Walk dist so unexpected standalone HTML cannot slip past the route inventory.
async function walk(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await walk(full))
    else if (entry.isFile() && entry.name.endsWith('.html')) result.push(full)
  }
  return result
}
const routeFiles = new Set(manifest.map((route) => path.resolve(fileOf(route.path))))
const extraFiles = new Set(EXTRA_HTML_FILES.map((name) => path.resolve(dist, name)))
for (const file of await walk(dist)) {
  if (routeFiles.has(path.resolve(file)) || extraFiles.has(path.resolve(file))) continue
  errors.push(`unexpected HTML file outside route inventory: ${path.relative(dist, file)}`)
}

if (skipped.length) console.warn(`[verify-prerender] ${skipped.length} optional route(s) failed to prerender and were dropped from the sitemap: ${skipped.join(', ')}`)
if (errors.length) {
  console.error(`[verify-prerender] ${errors.length} issue(s):\n- ${errors.join('\n- ')}`)
  process.exitCode = 1
} else {
  console.log(`[verify-prerender] Verified ${manifest.length - skipped.length} route snapshots; current logo ${logos[0]}`)
}
