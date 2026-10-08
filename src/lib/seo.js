import vercelConfig from '../../vercel.json' with { type: 'json' }

export const SITE_NAME = 'WebNest Studio'
export const SITE_URL = 'https://www.webneststudio.co.in'
export const DEFAULT_DESCRIPTION = 'WebNest Studio is a web & AI software development company in Gurugram, Haryana, building websites, AI integrations and custom software.'
// 1200x630 social card; favicon.png stays the square Organization logo.
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

export function canonicalUrl(path = '/') {
  const pathname = new URL(path || '/', SITE_URL).pathname.replace(/\/+$/, '')
  return `${SITE_URL}${pathname || '/'}`
}

export function plainText(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => ({
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ',
  })[entity]).replace(/\s+/g, ' ').trim()
}

export function summarize(value, limit = 160) {
  const text = plainText(value)
  if (text.length <= limit) return text
  return `${text.slice(0, limit - 1).replace(/\s+\S*$/, '')}…`
}

// Use a conservative editorial threshold for public blog pages. Word count is
// only a screening rule; publishers still need to review usefulness and originality.
export const BLOG_INDEXABLE_WORD_COUNT = 800
// vercel.json is the single source of truth for redirected blog slugs.
export const BLOG_REDIRECT_SLUGS = new Set(vercelConfig.redirects
  .map((redirect) => redirect.source.match(/^\/blog\/([a-zA-Z0-9_-]+)$/)?.[1])
  .filter(Boolean))

// Returns null when the payload carries neither word_count nor content (e.g. a
// summary-only list item), so callers don't mistake "unknown" for "thin".
export function blogWordCount(post) {
  if (Number.isFinite(Number(post?.word_count)) && Number(post.word_count) > 0) {
    return Number(post.word_count)
  }
  if (!post?.content) return null
  return plainText(post.content).split(/\s+/).filter(Boolean).length
}

// Unknown length counts as indexable: the detail page re-checks against the full
// post, and prerender drops any sitemap entry whose page turns out noindex.
export function isBlogIndexable(post) {
  const words = blogWordCount(post)
  return words === null || words >= BLOG_INDEXABLE_WORD_COUNT
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.label, item: canonicalUrl(item.to),
    })),
  }
}

export function validLastmod(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) return undefined
  const date = new Date(value)
  if (!Number.isFinite(date.getTime()) || date > new Date() || date.toISOString().slice(0, 10) !== value.slice(0, 10)) return undefined
  return date.toISOString().slice(0, 10)
}
