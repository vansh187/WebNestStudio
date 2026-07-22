import axios from 'axios'
import { getAccessToken, getRefreshToken, setSession, clearSession } from './tokenStore'

// Falls back to the known production backend if VITE_API_BASE_URL isn't set on the
// hosting platform (e.g. a missing env var in Vercel/Netlify build settings) — otherwise
// axios defaults to a relative path on the current origin, which has no /api routes.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://webneststudiobackend.onrender.com'

// Render free-tier cold start can take 30-50s on the very first request of a session.
const COLD_START_TIMEOUT = 60000
const WARM_TIMEOUT = 10000
const SLOW_REQUEST_THRESHOLD = 5000

let hasCompletedFirstRequest = false
const slowListeners = new Set()
let pendingSlowCount = 0

function notifySlow() {
  slowListeners.forEach((fn) => fn(pendingSlowCount > 0))
}

export function subscribeSlowRequest(fn) {
  slowListeners.add(fn)
  return () => slowListeners.delete(fn)
}

// Endpoints that must never trigger a token-refresh retry loop.
const AUTH_FREE_PATHS = ['/api/auth/login', '/api/auth/signup', '/api/auth/refresh', '/api/auth/verify-otp']

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: COLD_START_TIMEOUT,
})

let refreshPromise = null

async function performRefresh() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refresh_token: refreshToken })
    setSession({ accessToken: data.access_token, refreshToken: data.refresh_token })
    return true
  } catch {
    return false
  }
}

api.interceptors.request.use((config) => {
  config.timeout = hasCompletedFirstRequest ? WARM_TIMEOUT : COLD_START_TIMEOUT

  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`

  pendingSlowCount += 1
  config._slowTimer = setTimeout(() => notifySlow(), SLOW_REQUEST_THRESHOLD)

  return config
})

function clearSlowTracking(config) {
  if (config?._slowTimer) clearTimeout(config._slowTimer)
  pendingSlowCount = Math.max(0, pendingSlowCount - 1)
  notifySlow()
}

api.interceptors.response.use(
  (response) => {
    hasCompletedFirstRequest = true
    clearSlowTracking(response.config)
    return response
  },
  async (error) => {
    const { config, response } = error
    if (!config) return Promise.reject(error)

    hasCompletedFirstRequest = true
    clearSlowTracking(config)

    const status = response?.status
    const path = config.url?.replace(BASE_URL, '') ?? ''
    const isAuthFreePath = AUTH_FREE_PATHS.some((p) => path.startsWith(p))

    // Auto-retry once on 503 (DB temporarily unavailable) after a short backoff.
    if (status === 503 && !config._retried503) {
      config._retried503 = true
      await new Promise((r) => setTimeout(r, 2000))
      return api(config)
    }

    // On 401 for an authenticated call, try a single token refresh then retry.
    if (status === 401 && !config._retriedAuth && !isAuthFreePath && getRefreshToken()) {
      config._retriedAuth = true
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null
        })
      }
      const refreshed = await refreshPromise
      if (refreshed) {
        config.headers.Authorization = `Bearer ${getAccessToken()}`
        return api(config)
      }
      clearSession()
    }

    // 403 while authenticated means the token's role claim is stale — force a clean re-login
    // rather than showing a confusing permissions error (per API integration guide, Section 9).
    if (status === 403 && getAccessToken()) {
      clearSession()
      if (typeof window !== 'undefined') window.location.assign('/login')
    }

    return Promise.reject(error)
  }
)

export function getErrorDetail(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (!data) return fallback
  if (Array.isArray(data.errors) && data.errors.length) {
    return data.errors.map((e) => e.msg).join(' ')
  }
  return data.detail || fallback
}

// Maps backend 422 `errors[].loc` entries onto react-hook-form field names via setError.
export function applyFieldErrors(error, setError, fieldMap = {}) {
  const errors = error?.response?.data?.errors
  if (!Array.isArray(errors)) return false
  let applied = false
  for (const e of errors) {
    const loc = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : null
    const field = fieldMap[loc] || loc
    if (field) {
      setError(field, { type: 'server', message: e.msg })
      applied = true
    }
  }
  return applied
}
