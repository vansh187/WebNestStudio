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

// vercel.json is the single source of truth for redirected blog slugs. Blog
// visibility is otherwise editorial: a post the API serves has been published by
// a person, so it is listed, indexable and in the sitemap; anything else is a 404.
export const BLOG_REDIRECT_SLUGS = new Set(vercelConfig.redirects
  .map((redirect) => redirect.source.match(/^\/blog\/([a-zA-Z0-9_-]+)$/)?.[1])
  .filter(Boolean))

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
