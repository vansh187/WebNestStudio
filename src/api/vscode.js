import { api } from '../lib/apiClient'

// WebNest AI for VS Code: browser login with PKCE and connected devices.
// Contract: webnest-ai-vscode/docs/backend/VSCODE_EXTENSION_BACKEND.md, sections 2.1, 2.2, 2.9.

const text = (value, fallback = '') => (typeof value === 'string' && value ? value : fallback)

// The extension's redirect_uri is `<scheme>://webneststudio.webnest-ai/auth`, optionally with
// `?windowId=<n>`. Anything else is refused here too, so this page can never be used to send a
// login code (or a cancel) to some other app or site.
export const VSCODE_SCHEMES = ['vscode', 'vscode-insiders', 'vscodium', 'cursor', 'windsurf', 'positron']
const EXTENSION_AUTHORITY = 'webneststudio.webnest-ai'
const CHALLENGE_RE = /^[A-Za-z0-9_-]{43}$/
const MAX_STATE_CHARS = 512

const APP_NAMES = {
  vscode: 'Visual Studio Code',
  'vscode-insiders': 'VS Code Insiders',
  vscodium: 'VSCodium',
  cursor: 'Cursor',
  windsurf: 'Windsurf',
  positron: 'Positron',
}

export function appDisplayName(scheme) {
  return APP_NAMES[scheme] || 'VS Code'
}

export function isAllowedRedirectUri(value) {
  if (typeof value !== 'string' || !value || value.length > 2048) return false
  let url
  try {
    url = new URL(value)
  } catch {
    return false
  }
  const scheme = url.protocol.replace(/:$/, '')
  if (!VSCODE_SCHEMES.includes(scheme)) return false
  if (url.host !== EXTENSION_AUTHORITY || url.username || url.password) return false
  if (url.pathname !== '/auth' || url.hash) return false
  const keys = [...url.searchParams.keys()]
  return keys.every((key) => key === 'windowId') && keys.length <= 1
}

/** Reads and checks the login request from the page URL. Returns { request } or { problem }. */
export function readLoginRequest(searchParams) {
  const get = (key) => (searchParams.get(key) || '').trim()
  const state = get('state')
  const codeChallenge = get('code_challenge')
  const method = get('code_challenge_method') || 'S256'
  const redirectUri = get('redirect_uri')

  if (!state && !codeChallenge && !redirectUri) return { problem: 'missing' }
  if (!isAllowedRedirectUri(redirectUri)) return { problem: 'redirect' }
  if (!state || state.length > MAX_STATE_CHARS || method !== 'S256' || !CHALLENGE_RE.test(codeChallenge)) {
    return { problem: 'invalid' }
  }
  const appScheme = get('app_scheme').slice(0, 30) || new URL(redirectUri).protocol.replace(/:$/, '')
  return {
    request: {
      state,
      codeChallenge,
      redirectUri,
      deviceName: get('device_name').replace(/[\r\n\t]+/g, ' ').slice(0, 100),
      extVersion: get('ext_version').slice(0, 30),
      appScheme,
    },
  }
}

/** redirect_uri with extra query params appended (`&` when it already has `?windowId=`). */
export function callbackUrl(redirectUri, params) {
  const query = new URLSearchParams(params).toString()
  return `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}${query}`
}

/** POST /api/extension/auth/codes with the website token. Returns { code, expiresIn }. */
export async function createVscodeLoginCode(request) {
  const { data } = await api.post('/api/extension/auth/codes', {
    code_challenge: request.codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: request.redirectUri,
    device_name: request.deviceName || undefined,
    app_scheme: request.appScheme || undefined,
    ext_version: request.extVersion || undefined,
  })
  if (typeof data?.code !== 'string' || !data.code) throw new Error('The login code response was not valid.')
  return { code: data.code, expiresIn: Number(data.expires_in) || 300 }
}

function normalizeDevice(session) {
  if (!session || typeof session !== 'object') return null
  const id = text(session.id)
  if (!id) return null
  return {
    id,
    name: text(session.device_name, 'Unnamed computer'),
    platform: [text(session.app_name, 'Visual Studio Code'), session.ext_version ? `extension ${session.ext_version}` : '']
      .filter(Boolean).join(' · '),
    connectedAt: text(session.created_at),
    lastSeenAt: text(session.last_used_at),
    current: Boolean(session.current),
  }
}

export async function listVscodeDevices() {
  const { data } = await api.get('/api/extension/sessions')
  const items = Array.isArray(data) ? data : data?.sessions
  if (!Array.isArray(items)) throw new Error('The device list response was not valid.')
  return items.map(normalizeDevice).filter(Boolean)
}

export async function disconnectVscodeDevice(deviceId) {
  await api.delete(`/api/extension/sessions/${encodeURIComponent(deviceId)}`)
}
