const KEYS = ['utm_source', 'utm_medium', 'utm_campaign']
const STORAGE_KEY = 'wns_utm_params'

// Captured once on first page load, before any client-side navigation can strip the query string.
export function captureUtmParams() {
  const params = new URLSearchParams(window.location.search)
  const found = {}
  KEYS.forEach((key) => {
    const value = params.get(key)
    if (value) found[key] = value
  })
  if (Object.keys(found).length) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found))
  }
}

export function getUtmParams() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}
