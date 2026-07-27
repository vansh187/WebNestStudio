import { useEffect } from 'react'

export const SITE_NAME = 'WebNest Studio'
// The apex domain 308-redirects here - canonical/OG URLs must point to the domain
// that actually serves the page, not one that immediately redirects away from it.
export const SITE_URL = 'https://www.webneststudio.co.in'

function upsertTag(selector, create, content) {
  if (!content) return null
  let el = document.head.querySelector(selector)
  const wasCreated = !el
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  const previousContent = el.getAttribute('content') ?? el.getAttribute('href')
  if (el.tagName === 'LINK') el.setAttribute('href', content)
  else el.setAttribute('content', content)
  return () => {
    if (wasCreated) el.remove()
    else if (previousContent !== null) {
      if (el.tagName === 'LINK') el.setAttribute('href', previousContent)
      else el.setAttribute('content', previousContent)
    }
  }
}

/**
 * Sets per-page <title>, meta description, canonical URL, and Open Graph /
 * Twitter card tags - restoring the previous values on unmount so route
 * changes never leak one page's metadata into another's.
 *
 * `path` should be the route path (e.g. '/about') so the canonical URL is
 * stable regardless of which host/preview deployment served the page.
 */
export function useSeo({ title, description, path = '', image, type = 'website', noindex = false, keywords }) {
  useEffect(() => {
    // Some titles (e.g. a backend-supplied blog meta_title) already end with some
    // form of the brand name - sometimes the full site name, sometimes just
    // "Webnest" without "Studio" - so match on the brand word alone rather than
    // the exact SITE_NAME string, or we double it up into "... | Webnest | WebNest Studio".
    const alreadyBranded = title?.toLowerCase().includes('webnest')
    const fullTitle = title ? (alreadyBranded ? title : `${title} | ${SITE_NAME}`) : document.title
    const canonicalUrl = `${SITE_URL}${path}`
    const previousTitle = document.title
    if (title) document.title = fullTitle

    const restoreFns = [
      upsertTag('link[rel="canonical"]', () => {
        const link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        return link
      }, canonicalUrl),
      upsertTag('meta[name="description"]', () => {
        const meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        return meta
      }, description),
      upsertTag('meta[name="robots"]', () => {
        const meta = document.createElement('meta')
        meta.setAttribute('name', 'robots')
        return meta
      }, noindex ? 'noindex, nofollow' : 'index, follow'),
      upsertTag('meta[property="og:title"]', () => {
        const meta = document.createElement('meta')
        meta.setAttribute('property', 'og:title')
        return meta
      }, fullTitle),
      upsertTag('meta[property="og:description"]', () => {
        const meta = document.createElement('meta')
        meta.setAttribute('property', 'og:description')
        return meta
      }, description),
      upsertTag('meta[property="og:url"]', () => {
        const meta = document.createElement('meta')
        meta.setAttribute('property', 'og:url')
        return meta
      }, canonicalUrl),
      upsertTag('meta[property="og:type"]', () => {
        const meta = document.createElement('meta')
        meta.setAttribute('property', 'og:type')
        return meta
      }, type),
      upsertTag('meta[property="og:site_name"]', () => {
        const meta = document.createElement('meta')
        meta.setAttribute('property', 'og:site_name')
        return meta
      }, SITE_NAME),
      upsertTag('meta[name="twitter:card"]', () => {
        const meta = document.createElement('meta')
        meta.setAttribute('name', 'twitter:card')
        return meta
      }, image ? 'summary_large_image' : 'summary'),
      upsertTag('meta[name="twitter:title"]', () => {
        const meta = document.createElement('meta')
        meta.setAttribute('name', 'twitter:title')
        return meta
      }, fullTitle),
      upsertTag('meta[name="twitter:description"]', () => {
        const meta = document.createElement('meta')
        meta.setAttribute('name', 'twitter:description')
        return meta
      }, description),
    ]

    if (image) {
      restoreFns.push(
        upsertTag('meta[property="og:image"]', () => {
          const meta = document.createElement('meta')
          meta.setAttribute('property', 'og:image')
          return meta
        }, image),
        upsertTag('meta[name="twitter:image"]', () => {
          const meta = document.createElement('meta')
          meta.setAttribute('name', 'twitter:image')
          return meta
        }, image)
      )
    }

    if (keywords?.length) {
      restoreFns.push(
        upsertTag('meta[name="keywords"]', () => {
          const meta = document.createElement('meta')
          meta.setAttribute('name', 'keywords')
          return meta
        }, keywords.join(', '))
      )
    }

    return () => {
      document.title = previousTitle
      restoreFns.forEach((restore) => restore?.())
    }
  }, [title, description, path, image, type, noindex, keywords])
}

// Tracks how many mounted useStructuredData() instances currently depend on each
// schema @type, so the tag is only removed once nothing needs it anymore - see
// useStructuredData's cleanup below for why a plain "did I create it" flag isn't enough.
const structuredDataRefCounts = new Map()

/**
 * Injects a JSON-LD script tag for the lifetime of the calling component.
 *
 * Reuses an existing tag for the same schema `@type` if one's already present
 * (e.g. baked into a prerendered static HTML snapshot for this route, or another
 * mounted component using the same @type) instead of appending a duplicate -
 * React's createRoot() only replaces the #root subtree, so anything a prerender
 * pass put in <head> is still there when the client-side app boots and re-runs
 * this hook. Reference-counted per @type so that if two components ever share a
 * schema type concurrently, one unmounting doesn't delete the tag out from under
 * the other still-mounted one.
 */
export function useStructuredData(data) {
  useEffect(() => {
    if (!data) return undefined
    const schemaType = data['@type']
    let script = document.head.querySelector(`script[type="application/ld+json"][data-schema-type="${schemaType}"]`)
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-schema-type', schemaType)
      document.head.appendChild(script)
    }
    script.text = JSON.stringify(data)
    structuredDataRefCounts.set(schemaType, (structuredDataRefCounts.get(schemaType) || 0) + 1)

    return () => {
      const remaining = (structuredDataRefCounts.get(schemaType) || 1) - 1
      if (remaining <= 0) {
        structuredDataRefCounts.delete(schemaType)
        script.remove()
      } else {
        structuredDataRefCounts.set(schemaType, remaining)
      }
    }
  }, [data])
}
