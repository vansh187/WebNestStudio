import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { EXTRA_HTML_FILES, adsenseScriptProblems, missingRouteProblem, snapshotProblems } from '../scripts/prerender-checks.mjs'

const CLIENT = 'ca-pub-123'
const PAUSE = '<script>(window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 1</script>'
// What page.content() serialises: boolean attributes as async="", src last.
const SERIALISED_TAG = `<script id="adsbygoogle-js" async="" crossorigin="anonymous" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}"></script>`

const page = (head = `${PAUSE}${SERIALISED_TAG}`, body = '<h1>Lesson</h1>') => `<!doctype html><html><head>
<meta name="google-adsense-account" content="${CLIENT}">${head}
<title>Lesson | WebNest Studio</title><link rel="canonical" href="https://www.webneststudio.co.in/learn/x">
<link rel="icon" href="/assets/logo-abc.png"></head><body>${body}</body></html>`
const ctx = { path: '/learn/x', client: CLIENT, canonical: 'https://www.webneststudio.co.in/learn/x', homeCanonical: 'https://www.webneststudio.co.in/', currentLogo: '/assets/logo-abc.png' }

test('the serialised AdSense tag passes whatever its attribute order', () => {
  assert.deepEqual(adsenseScriptProblems(`${PAUSE}${SERIALISED_TAG}`, CLIENT), [])
  const sourceOrder = `${PAUSE}<script id="adsbygoogle-js" async crossorigin="anonymous" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}"></script>`
  assert.deepEqual(adsenseScriptProblems(sourceOrder, CLIENT), [])
})

test('AdSense tag problems are reported', () => {
  assert.deepEqual(adsenseScriptProblems('<head></head>', CLIENT), ['missing AdSense script'])
  assert.ok(adsenseScriptProblems(SERIALISED_TAG, CLIENT).includes('ad requests are not paused before the AdSense script'))
  assert.ok(adsenseScriptProblems(`${SERIALISED_TAG}${PAUSE}`, CLIENT).includes('ad requests are not paused before the AdSense script'))
  assert.ok(adsenseScriptProblems(`${PAUSE}${SERIALISED_TAG.replace(' async=""', '')}`, CLIENT).includes('AdSense script is not async'))
  assert.ok(adsenseScriptProblems(`${PAUSE}${SERIALISED_TAG.replace(' id="adsbygoogle-js"', '')}`, CLIENT).includes('AdSense script lacks id="adsbygoogle-js"'))
  assert.ok(adsenseScriptProblems(`${PAUSE}${SERIALISED_TAG}${SERIALISED_TAG}`, CLIENT).includes('AdSense script appears 2 times'))
  assert.ok(adsenseScriptProblems(`${PAUSE}${SERIALISED_TAG}`, 'ca-pub-999')[0].startsWith('AdSense script uses client'))
})

test('a good snapshot has no problems; bad ones are named', () => {
  assert.deepEqual(snapshotProblems(page(), ctx), [])
  assert.ok(snapshotProblems(page(undefined, '<h1>a</h1><h1>b</h1>'), ctx).includes('expected exactly one h1; found 2'))
  const home = page().replace('href="https://www.webneststudio.co.in/learn/x"', 'href="https://www.webneststudio.co.in/"')
  assert.ok(snapshotProblems(home, ctx).includes('canonical incorrectly points to home'))
})

test('the shipped index.html pauses ads before the AdSense script', async () => {
  const html = (await readFile(new URL('../index.html', import.meta.url), 'utf8')).replaceAll('%ADSENSE_CLIENT%', CLIENT)
  assert.deepEqual(adsenseScriptProblems(html, CLIENT), [])
})

test('the 404 page and both shells are allowed outside the inventory', () => {
  assert.deepEqual([...EXTRA_HTML_FILES].sort(), ['404.html', 'app-private.html', 'app.html'])
})

test('only reported, de-listed optional routes may be missing', () => {
  const canonical = 'https://www.webneststudio.co.in/blog/a'
  const optional = { path: '/blog/a', required: false }
  const failedPaths = new Set(['/blog/a'])
  assert.equal(missingRouteProblem(optional, { failedPaths, sitemap: '<urlset></urlset>', canonical }), null)
  assert.match(missingRouteProblem(optional, { failedPaths, sitemap: `<loc>${canonical}</loc>`, canonical }), /still listed/)
  assert.match(missingRouteProblem(optional, { failedPaths: new Set(), sitemap: '', canonical }), /did not report/)
  assert.equal(missingRouteProblem({ path: '/blog/a' }, { failedPaths, sitemap: '', canonical }), 'missing prerender output')
})
