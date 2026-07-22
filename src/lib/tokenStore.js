// Access token lives only in memory (cleared on full page reload) to reduce XSS exposure.
// Refresh token falls back to localStorage because the backend currently returns it in the
// JSON body rather than setting an httpOnly cookie (see API integration guide, Section 3).
const REFRESH_KEY = 'wns_refresh_token'

let accessToken = null
let user = null
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn({ accessToken, user }))
}

export function getAccessToken() {
  return accessToken
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function getUser() {
  return user
}

export function setSession({ accessToken: at, refreshToken: rt, user: u } = {}) {
  accessToken = at ?? null
  if (rt) localStorage.setItem(REFRESH_KEY, rt)
  if (u !== undefined) user = u
  notify()
}

export function setUser(u) {
  user = u
  notify()
}

export function clearSession() {
  accessToken = null
  user = null
  localStorage.removeItem(REFRESH_KEY)
  notify()
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
