// Pure checks for prerendered snapshots, used by verify-prerender.mjs and unit-tested in
// tests/prerender-checks.test.mjs.

// HTML files the build writes that are not routes of the inventory: the SPA shells and
// the 404 page prerender.mjs adds to its queue.
export const EXTRA_HTML_FILES = ['app.html', 'app-private.html', '404.html']

// The AdSense <script> tag must be async, anonymous-crossorigin, carry the id useSeo looks
// for, and come after the inline script that pauses ad requests. Attribute order is free:
// page.content() serialises attributes in whatever order the shell had them.
export function adsenseScriptProblems(html, client) {
  const tags = [...html.matchAll(/<script\b[^>]*\bsrc="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=([^"&]+)"[^>]*>/g)]
  if (tags.length === 0) return ['missing AdSense script']
  const problems = []
  if (tags.length > 1) problems.push(`AdSense script appears ${tags.length} times`)
  const [tag] = tags
  if (tag[1] !== client) problems.push(`AdSense script uses client ${tag[1]}, expected ${client}`)
  if (!/\sasync(?:=""|\s|>|\/)/.test(tag[0])) problems.push('AdSense script is not async')
  if (!/\scrossorigin="anonymous"/.test(tag[0])) problems.push('AdSense script lacks crossorigin="anonymous"')
  if (!/\sid="adsbygoogle-js"/.test(tag[0])) problems.push('AdSense script lacks id="adsbygoogle-js"')
  const pause = html.search(/\.pauseAdRequests\s*=\s*1/)
  if (pause === -1 || pause > tag.index) problems.push('ad requests are not paused before the AdSense script')
  return problems
}

export function snapshotProblems(html, { path, client, canonical, homeCanonical, currentLogo }) {
  const problems = []
  if (!html.includes(`<meta name="google-adsense-account" content="${client}">`)) problems.push('missing AdSense publisher meta')
  if (!html.includes(`href="${canonical}"`)) problems.push(`canonical does not match ${canonical}`)
  const home = homeCanonical.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
  if (path !== '/' && new RegExp(`<link[^>]+rel="canonical"[^>]+href="${home}"`).test(html)) problems.push('canonical incorrectly points to home')
  if (currentLogo && !html.includes(currentLogo)) problems.push(`does not reference current logo ${currentLogo}`)
  problems.push(...adsenseScriptProblems(html, client))
  const h1Count = [...html.matchAll(/<h1\b/gi)].length
  if (h1Count !== 1) problems.push(`expected exactly one h1; found ${h1Count}`)
  if (!html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim()) problems.push('missing title')
  return problems
}

// A route with no snapshot is only acceptable when it is optional (required: false), its
// prerender failure was reported, and it was dropped from the sitemap.
export function missingRouteProblem(route, { failedPaths, sitemap, canonical }) {
  if (route.required !== false) return 'missing prerender output'
  if (!failedPaths.has(route.path)) return 'missing prerender output (optional route, but prerender did not report it as failed)'
  if (sitemap.includes(`<loc>${canonical}</loc>`)) return 'optional route failed to prerender but is still listed in sitemap.xml'
  return null
}
