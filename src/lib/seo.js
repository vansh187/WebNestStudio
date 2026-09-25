export const SITE_NAME = 'WebNest Studio'
export const SITE_URL = 'https://www.webneststudio.co.in'
export const DEFAULT_DESCRIPTION = 'WebNest Studio is an IT consultancy in New Delhi, India, building websites, AI integrations and full-stack software.'
export const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`

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
