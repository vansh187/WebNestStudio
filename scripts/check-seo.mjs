import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { preview } from 'vite'
import { launchBrowser } from './browser.mjs'
import { canonicalUrl } from '../src/lib/seo.js'
import { SAMPLE_LESSONS } from '../src/data/codelabDefaults.js'

const dist = path.resolve('dist')
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8')
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
const titles = new Map()
const descriptions = new Map()
const warnings = []
const canonicalPaths = new Set(urls.map((url) => new URL(url).pathname))
for (const url of process.argv.includes('--browser-only') ? [] : urls) {
  const pathname = new URL(url).pathname
  const html = await readFile(pathname === '/' ? path.join(dist, 'index.html') : path.join(dist, `${pathname.slice(1)}.html`), 'utf8')
  assert.ok(html.includes(`rel="canonical" href="${canonicalUrl(pathname)}"`), `${pathname}: canonical`)
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${pathname}: one H1`)
  assert.ok(!/<meta name="robots" content="noindex/.test(html), `${pathname}: indexable`)
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1]
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]
  assert.ok(title && description, `${pathname}: metadata`)
  assert.ok(html.includes('property="og:image"'), `${pathname}: social image`)
  for (const [value, map, label] of [[title, titles, 'title'], [description, descriptions, 'description']]) {
    if (map.has(value)) warnings.push(`Duplicate ${label}: ${map.get(value)}, ${pathname}`)
    map.set(value, pathname)
  }
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    assert.ok(JSON.parse(match[1])['@type'], `${pathname}: valid JSON-LD`)
  }
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = match[1]
    if (!href.startsWith('/') || href.startsWith('//')) continue
    const target = new URL(href, canonicalUrl()).pathname.replace(/\/$/, '') || '/'
    const accountLink = /^\/(login|admin|portal|projects|s|delete-account)(\/|$)/.test(target) || target === '/codelab/dashboard'
    assert.ok(canonicalPaths.has(target) || accountLink, `${pathname}: broken internal link ${target}`)
  }
}
assert.ok(!urls.some((url) => /\/(login|admin|portal|projects|s\/|codelab\/dashboard)/.test(new URL(url).pathname)))
assert.equal(urls.length, new Set(urls).size)
console.log(`[seo] ${process.argv.includes('--browser-only') ? 0 : urls.length} snapshots checked: metadata, canonicals, H1, JSON-LD and indexability`)

const server = await preview({ preview: { port: 4175, strictPort: true } })
const origin = server.resolvedUrls.local[0].replace(/\/$/, '')
let browser
try {
  browser = await launchBrowser()
  const context = await browser.newContext()
  await context.addInitScript(() => { window.__PRERENDER__ = true })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const pythonLesson = SAMPLE_LESSONS.lesson_python_syntax
  const lessonPath = `/learn/lessons/${pythonLesson.id}`
  await page.goto(`${origin}${lessonPath}`)
  await page.waitForFunction(() => document.querySelectorAll('script[data-schema-type="TechArticle"]').length === 1)
  await page.getByRole('link', { name: /^Try .+ in Webnest Codelab$/ }).first().click()
  await page.waitForURL('**/codelab/playground?*')
  await page.waitForFunction(() => document.querySelector('link[rel="canonical"]')?.href.endsWith('/codelab/playground'))
  assert.equal(await page.locator('script[data-schema-type="TechArticle"]').count(), 0, 'Lesson schema removed on navigation')
  const saved = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes(':lesson:')).map((key) => JSON.parse(localStorage.getItem(key))))
  assert.ok(saved.some((session) => session.files[0].content === pythonLesson.examples[0].code), 'Exact Python example transferred')
  await page.getByRole('link', { name: `Back to ${pythonLesson.title}`, exact: true }).click()
  await page.waitForURL(`**${lessonPath}`)
  assert.equal(await page.locator('h1').count(), 1)
  assert.equal(await page.locator('script[data-schema-type="TechArticle"]').count(), 1)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: '.seo-build/lesson-mobile.png', fullPage: true })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'No mobile horizontal overflow')
  await page.goto(`${origin}/learn/lessons/missing-lesson`)
  await page.waitForFunction(() => document.querySelector('meta[name="robots"]')?.content.includes('noindex'))
  await page.goto(`${origin}/services/web-development`)
  await page.waitForFunction(() => document.querySelector('script[data-schema-type="Service"]'))
  assert.equal(await page.locator('script[data-schema-type="TechArticle"]').count(), 0)
  assert.equal(await page.locator('h1').innerText(), 'Custom Website Development')
  assert.deepEqual(errors, [], 'No browser runtime errors')
  const noJs = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await noJs.newPage()
  await staticPage.goto(`${origin}${lessonPath}`)
  assert.equal(await staticPage.locator('h1').count(), 1)
  assert.ok(await staticPage.locator('article').innerText().then((text) => text.length > 500), 'Lesson readable without JavaScript')
  console.log('[seo] Browser checks passed: example transfer, schema cleanup, mobile layout, missing lessons, services and no-JS content')
} finally {
  await browser?.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
await writeFile('.seo-build/validation.json', JSON.stringify({ snapshotCount: process.argv.includes('--browser-only') ? 0 : urls.length, warnings, browserChecks: 'passed' }, null, 2))
warnings.forEach((warning) => console.warn(`[seo] ${warning}`))
