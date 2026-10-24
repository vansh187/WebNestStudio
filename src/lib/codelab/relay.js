// Which URLs go through the backend's API relay (CODELAB_API_RELAY_FRONTEND.md), and what to
// tell the learner when the relay refuses. Pure: unit-tested in Node (tests/relay.test.mjs).
const HOST = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/
const IP_LITERAL = /^\d+(\.\d+)*$/
const MAX_PROVIDERS = 50
const MAX_DETAIL = 300
export const DEFAULT_RELAY_PATH = '/api/codelab/relay'
export const RELAY_ERROR_HEADER = 'X-WebNest-Relay-Error'
export const RELAY_TOKEN_HEADER = 'X-WebNest-Authorization'

const DISABLED = Object.freeze({ hosts: new Map(), providers: [], enabled: false, relayPath: DEFAULT_RELAY_PATH })

// Keeps only well-formed provider entries from GET /api/codelab/relay/providers.
export function createRelayMatcher(listing) {
  try {
    if (!listing?.enabled || !Array.isArray(listing.providers)) return DISABLED
    const hosts = new Map()
    const providers = []
    for (const provider of listing.providers.slice(0, MAX_PROVIDERS)) {
      const valid = (Array.isArray(provider?.hosts) ? provider.hosts : [])
        .map((host) => String(host).toLowerCase())
        .filter((host) => host.length <= 253 && HOST.test(host) && !IP_LITERAL.test(host))
      if (!valid.length) continue
      const entry = {
        id: String(provider.id ?? ''),
        name: String(provider.name ?? provider.id ?? ''),
        hosts: valid,
        testMode: provider.test_mode === 'sandbox_host' ? 'sandbox_host' : 'key_prefix',
        hint: String(provider.test_key_hint ?? ''),
      }
      providers.push(entry)
      for (const host of valid) hosts.set(host, entry)
    }
    const relayPath = typeof listing.relay_path === 'string' && /^\/[A-Za-z0-9/_-]+$/.test(listing.relay_path)
      ? listing.relay_path.replace(/\/+$/, '')
      : DEFAULT_RELAY_PATH
    return { hosts, providers, enabled: hosts.size > 0, relayPath }
  } catch (error) {
    console.warn('Relay providers could not be read:', error?.message)
    return DISABLED
  }
}

// The relay URL for `url`, or null when it must go out unchanged. Exact host match only:
// no suffixes, no ports, no credentials in the URL, https only.
export function toRelayUrl(url, matcher, baseUrl) {
  try {
    if (!matcher?.enabled || !baseUrl) return null
    const target = new URL(String(url))
    if (target.protocol !== 'https:' || target.port || target.username || target.password) return null
    const host = target.hostname.toLowerCase()
    if (!matcher.hosts.has(host)) return null
    const base = new URL(baseUrl)
    return `${base.origin}${matcher.relayPath}/${host}${target.pathname}${target.search}`
  } catch (error) {
    console.warn('Relay URL rewrite skipped:', error?.message)
    return null
  }
}

// True only for URLs on the relay itself: the login token is attached to these and nothing else.
export function isRelayUrl(url, matcher, baseUrl) {
  try {
    if (!matcher?.enabled || !baseUrl) return false
    const target = new URL(String(url))
    const base = new URL(baseUrl)
    return target.origin === base.origin && target.pathname.startsWith(`${matcher.relayPath}/`)
  } catch {
    return false
  }
}

// The provider host a relay URL points at ('' for anything else).
export function relayHostOf(url, matcher, baseUrl) {
  try {
    if (!isRelayUrl(url, matcher, baseUrl)) return ''
    return new URL(String(url)).pathname.slice(matcher.relayPath.length + 1).split('/')[0]
  } catch {
    return ''
  }
}

// A base URL the token may be sent to: https, or plain http on this machine for development.
export function isSafeRelayBase(baseUrl) {
  try {
    const url = new URL(String(baseUrl))
    return url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))
  } catch {
    return false
  }
}

const FALLBACK = {
  relay_login_required: 'Log in to WebNest to call payment APIs from the playground.',
  relay_live_key_blocked: 'Live keys are blocked in CodeLab. Use a test key.',
  relay_test_key_required: 'This API needs a test key here.',
  relay_rate_limited: 'Relay limit reached. Try again shortly.',
  relay_disabled: 'The API relay is switched off for now.',
}

const clip = (text) => (text.length > MAX_DETAIL ? `${text.slice(0, MAX_DETAIL)}…` : text)

// One line for the terminal / Run output from a relay error body (parsed JSON or null).
export function relayNoticeText(code, body) {
  try {
    const detail = typeof body?.detail === 'string' && body.detail ? body.detail : FALLBACK[code] || 'The API relay refused this call.'
    const hint = typeof body?.hint === 'string' && body.hint ? ` ${body.hint}` : ''
    const wait = code === 'relay_rate_limited' && Number.isFinite(body?.retry_after) && !/\d+ seconds/.test(detail) ? ` (retry in ${body.retry_after}s)` : ''
    return `Relay: ${clip(`${detail}${hint}`)}${wait}`
  } catch {
    return 'Relay: the API relay refused this call.'
  }
}

// The `relay` terminal command's text, from the matcher and GET /usage (null when logged out).
export function relayStatusText(matcher, usage, { loggedIn = true } = {}) {
  try {
    if (!matcher?.enabled) return 'Relay: off. Payment APIs cannot be called from the playground right now.'
    const head = !loggedIn
      ? 'Relay: on · log in to WebNest to use it'
      : usage
        ? `Relay: on · ${usage.minute_remaining} calls left this minute · ${usage.day_remaining} today`
        : 'Relay: on'
    const width = Math.max(...matcher.providers.map((provider) => provider.name.length)) + 3
    const hostWidth = Math.max(...matcher.providers.map((provider) => provider.hosts.join(', ').length)) + 3
    const rows = matcher.providers.map((provider) => `  ${provider.name.padEnd(width)}${provider.hosts.join(', ').padEnd(hostWidth)}${provider.testMode === 'sandbox_host' ? 'sandbox only' : `test keys: ${provider.hint}`}`)
    return [head, ...rows, 'Use test keys from your .env file. Live keys and live hosts are always refused.'].join('\n')
  } catch {
    return 'Relay: status unavailable.'
  }
}
