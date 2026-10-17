// Breakpoints pause the Python worker with SharedArrayBuffer + Atomics.wait, which only
// works on a cross-origin isolated page. Isolation also blocks cross-origin iframes (lesson
// videos, embeds in the web preview), so it is opt-in: only the playground opened with
// ?isolate=1 gets the COOP/COEP headers (vercel.json, and vite.config.js in dev).
export const ISOLATE_PARAM = 'isolate'

export function isIsolationUrl({ pathname, search }) {
  return pathname === '/codelab/playground' && new URLSearchParams(search).get(ISOLATE_PARAM) === '1'
}

export const isIsolated = () => Boolean(globalThis.crossOriginIsolated)

// True when the page asked for isolation but the browser did not grant it (Safari has no
// COEP credentialless), so reloading again would not help.
export const isolationUnsupported = () => typeof window !== 'undefined' && isIsolationUrl(window.location) && !isIsolated()

// Reloads the current page with isolation on. The playground saves its files on pagehide.
export function reloadIsolated() {
  const url = new URL(window.location.href)
  url.searchParams.set(ISOLATE_PARAM, '1')
  window.location.assign(url.toString())
}
