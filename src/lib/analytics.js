import { track } from '@vercel/analytics'

const ALLOWED_FIELDS = new Set(['course_slug', 'lesson_id', 'service_slug', 'source', 'language', 'problem_slug'])

export function trackEvent(name, properties = {}) {
  if (typeof window === 'undefined' || window.__PRERENDER__) return
  // Never send form values, code, notes, email addresses or arbitrary query strings.
  const safe = Object.fromEntries(Object.entries(properties).filter(([key, value]) => ALLOWED_FIELDS.has(key) && typeof value === 'string'))
  try { track(name, safe) } catch { /* Measurement must never interrupt a user action. */ }
  if (typeof window.gtag === 'function') {
    try { window.gtag('event', name, safe) } catch { /* Optional existing GA4 installation. */ }
  }
}
