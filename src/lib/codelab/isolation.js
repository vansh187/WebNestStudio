// Breakpoints pause the Python worker with SharedArrayBuffer + Atomics.wait, which only
// works on a cross-origin isolated page. Isolation also blocks cross-origin iframes (lesson
// videos, embeds in the web preview), so it is opt-in: only the editors (the playground and
// a saved project) opened with ?isolate=1 get the COOP/COEP headers (vercel.json, and
// vite.config.js in dev). Keep those three in step.
export const ISOLATE_PARAM = 'isolate'
const ISOLATION_PATH = /^\/(?:codelab\/playground|projects\/[^/]+)\/?$/

export function isIsolationUrl({ pathname, search }) {
  return ISOLATION_PATH.test(pathname) && new URLSearchParams(search).get(ISOLATE_PARAM) === '1'
}

export const isIsolated = () => Boolean(globalThis.crossOriginIsolated)

// True when the page asked for isolation but the browser did not grant it (Safari has no
// COEP credentialless), so reloading again would not help.
export const isolationUnsupported = () => typeof window !== 'undefined' && isIsolationUrl(window.location) && !isIsolated()

// True on a page that can be reloaded into isolation (an editor URL).
export const canIsolate = () => typeof window !== 'undefined' && ISOLATION_PATH.test(window.location.pathname)

// Reloads the current page with isolation on.
export function reloadIsolated() {
  const url = new URL(window.location.href)
  url.searchParams.set(ISOLATE_PARAM, '1')
  window.location.assign(url.toString())
}
