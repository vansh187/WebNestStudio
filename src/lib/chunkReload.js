import { lazy } from 'react'

// Every deploy renames the JavaScript chunks, and the old files return 404.
// A tab opened before a deploy still refers to the old names, so the next
// lazily loaded page (often reached with the Back button) fails to load. The
// browser and React.lazy both remember that failure, so only a full reload
// (which fetches the new index.html and chunk names) can recover.

const RELOAD_KEY = 'webnest:chunk-reload-at'
const RELOAD_GUARD_MS = 30_000

const CHUNK_ERROR = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|Loading (?:CSS )?chunk .* failed|ChunkLoadError/i

export function isChunkLoadError(error) {
  return CHUNK_ERROR.test(`${error?.name || ''} ${error?.message || ''}`)
}

/**
 * Reloads the page to pick up the current deployment, at most once per
 * RELOAD_GUARD_MS so a chunk that is genuinely broken cannot cause a reload
 * loop. Returns true when a reload was started.
 */
export function reloadForNewVersion() {
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0)
    if (Date.now() - last < RELOAD_GUARD_MS) return false
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // Storage blocked (private mode, disabled cookies): still allow this reload.
  }
  window.location.reload()
  return true
}

/** React.lazy that reloads the page once when its chunk is missing after a deploy. */
export function lazyWithReload(factory) {
  return lazy(() => factory().catch((error) => {
    // Keep showing the Suspense fallback until the reload replaces the page.
    if (isChunkLoadError(error) && reloadForNewVersion()) return new Promise(() => {})
    throw error
  }))
}

/** Vite reports failed preloads of a chunk's dependencies through this event. */
export function installPreloadErrorReload() {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewVersion()) event.preventDefault()
  })
}
