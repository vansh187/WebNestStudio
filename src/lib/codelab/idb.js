// CodeLab's storage gateway. Everything CodeLab keeps in this browser is read and written
// through here (codelabLocal for localStorage, objectStore for IndexedDB together with
// canReadCodelab / canWriteCodelab), so the rules that keep an account's data wipe
// (accountData.js) from being undone apply in one place: the write freeze, the count of
// CodeLab pages open in this tab, the wipe-in-progress marker, and the lock kept while
// data from an earlier session could not be cleared. Only the wipe itself bypasses them.

let frozen = false
export const FROZEN_EVENT = 'wns-codelab-frozen'

// After this, CodeLab saves in this tab do nothing; the page reloads right after.
export function freezeCodelabWrites() {
  frozen = true
}

// Lifts a freeze that is not followed by a reload: the data turned out locked, so the lock
// refuses writes from now on, and lifts with it (accountData.js).
export function thawCodelabWrites() {
  frozen = false
}

// localStorage without the rules below, for the wipe's own bookkeeping (its markers, the
// lock, the owner, and clearing itself). Never throws: a blocked storage reads as empty,
// and set/remove return false when they fail, true when there is no storage at all.
export const rawLocal = {
  get(key) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value)
      return true
    } catch {
      return typeof localStorage === 'undefined'
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return typeof localStorage === 'undefined'
    }
  },
  // Every key that starts with one of `prefixes`. Empty when storage is blocked.
  keys(prefixes) {
    const found = []
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i)
        if (key && prefixes.some((prefix) => key.startsWith(prefix))) found.push(key)
      }
    } catch {
      /* Storage blocked: nothing is kept there. */
    }
    return found
  },
}

// Set in localStorage when CodeLab data could not be cleared (logout, account deletion or
// an account switch, accountData.js). While it is, that data is hidden and nothing is
// saved, in every tab and across reloads, until a clear succeeds (retried on every page
// load and login) or the data's own account logs back in.
export const LOCK_KEY = 'wns-codelab-locked'
export const LOCK_NOTICE = 'CodeLab could not clear data from an earlier session in this browser, so it is hidden and saving here is paused. Close other CodeLab tabs, then reload this page to try again.'

export const codelabDataLocked = () => Boolean(rawLocal.get(LOCK_KEY))

// Counts the times the lock was set in this page load, so a notice is shown once per lock
// (CodingWorkspace.jsx), and again if it is lifted and set again.
let lockSeq = 0

// Sets or lifts the lock. Setting it tells open editors (CodingWorkspace.jsx) to show it.
export function setCodelabLock(locked) {
  const wasLocked = codelabDataLocked()
  if (!(locked ? rawLocal.set(LOCK_KEY, '1') : rawLocal.remove(LOCK_KEY))) return
  if (locked === wasLocked) return
  if (locked) lockSeq += 1
  // Lifting it tells them too (notice null), so the message closes.
  if (typeof window?.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
    const detail = locked ? { notice: LOCK_NOTICE, seq: lockSeq } : { notice: null, seq: lockSeq }
    window.dispatchEvent(new CustomEvent(FROZEN_EVENT, { detail }))
  }
}

// Why saving is paused, for the learner, and which lock it is; null when it is not paused
// that way (a plain freeze is followed by a reload).
export const codelabFrozenNotice = () => (codelabDataLocked() ? { notice: LOCK_NOTICE, seq: lockSeq } : null)

// How many CodeLab pages are open in this tab: the playground from the moment it starts
// loading a session, and saved projects (Playground.jsx, ProjectWorkspace.jsx). While one
// is, the tab holds CodeLab data in memory, so wiping the account's data must also freeze
// and reload the tab. Problem pages keep nothing in this browser's storage, so they do not
// count and a wipe elsewhere never reloads them.
let openPages = 0

// Call when such a page mounts; returns the function to call when it unmounts.
export function trackCodelabEditor() {
  openPages += 1
  return () => {
    openPages -= 1
  }
}

export const codelabEditorOpen = () => openPages > 0

// One localStorage marker per running wipe (accountData.js), under this prefix plus the
// wipe's id, holding when it was last refreshed, so every tab can tell and two overlapping
// wipes (two tabs logging in at once) never end each other's. A marker not refreshed for
// this long is from a tab that closed mid-wipe and is ignored.
export const WIPE_PENDING_PREFIX = 'wns-codelab-wipe:'
export const WIPE_STALE_MS = 15000

// True while a wipe runs in some tab. Every gateway read and write asks, so the scan of
// localStorage is cached: until the soonest marker would go stale, and at most a second.
// It is dropped whenever a marker changes, in this tab (markWipePending) or another (the
// storage event below), so a wipe starting anywhere is seen at once.
let pendingCache = null

export function codelabWipePending() {
  const now = Date.now()
  if (pendingCache && now < pendingCache.until) return pendingCache.value
  let until = now + 1000
  let value = false
  for (const key of rawLocal.keys([WIPE_PENDING_PREFIX])) {
    const staleAt = Number(rawLocal.get(key)) + WIPE_STALE_MS
    if (staleAt > now) {
      value = true
      until = Math.min(until, staleAt)
    }
  }
  pendingCache = { value, until }
  return value
}

// Sets (or, with `at` null, removes) a wipe marker; the wipe's only way to write one.
export function markWipePending(key, at) {
  pendingCache = null
  return at == null ? rawLocal.remove(key) : rawLocal.set(key, String(at))
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (event) => {
    if (event.key == null || event.key.startsWith(WIPE_PENDING_PREFIX)) pendingCache = null
  })
}

// Loads return nothing while this is true: during a wipe (the data is about to go) and
// under the lock (it is from an earlier session that could not be cleared).
export const codelabDataHidden = () => codelabWipePending() || codelabDataLocked()

// The rules, for every CodeLab reader and writer. Writes stop the moment a wipe starts in
// any tab (the marker is read synchronously from shared storage, not waited for as an
// event), and while the tab is frozen or the data locked.
export const canReadCodelab = () => !codelabDataHidden()
export const canWriteCodelab = () => !frozen && !codelabDataLocked() && !codelabWipePending()

// localStorage for CodeLab, under the rules above. get/set/remove report nothing and
// throw nothing: blocked storage reads as empty, and a refused write returns false.
export const codelabLocal = {
  get(key) {
    if (!canReadCodelab()) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  getJSON(key) {
    const raw = codelabLocal.get(key)
    try {
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  set(key, value) {
    if (!canWriteCodelab()) return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },
  setJSON(key, value) {
    return codelabLocal.set(key, JSON.stringify(value))
  },
  remove(key) {
    if (!canWriteCodelab()) return false
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
  // Every key that starts with one of `prefixes`, whatever the rules (the wipe, counting
  // what a logout would delete). Empty when storage is blocked.
  keys: (prefixes) => rawLocal.keys(prefixes),
}

// Whether any of the named IndexedDB databases exists, without creating one (opening a
// database creates it). True when the browser cannot list databases: then nobody knows.
export async function someDatabaseExists(names) {
  if (typeof indexedDB === 'undefined') return false
  if (typeof indexedDB.databases !== 'function') return true
  try {
    const found = await indexedDB.databases()
    return found.some((database) => names.includes(database.name))
  } catch {
    return true
  }
}

// Deletes an IndexedDB database outright (the wipe), so afterwards "no CodeLab data" can
// be told again (someDatabaseExists). True when it is gone or never existed. Waits while
// another connection is still closing; past `timeoutMs` it gives up and returns false, and
// the caller empties it instead.
export function deleteDatabase(name, timeoutMs = 3000) {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(true)
      return
    }
    let request
    try {
      request = indexedDB.deleteDatabase(name)
    } catch {
      resolve(false)
      return
    }
    const timer = setTimeout(() => resolve(false), timeoutMs)
    const done = (ok) => {
      clearTimeout(timer)
      resolve(ok)
    }
    request.onsuccess = () => done(true)
    request.onerror = () => done(false)
  })
}

function open(dbName, storeName) {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'))
      return
    }
    const request = indexedDB.open(dbName, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(storeName)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// CodeLab's IndexedDB databases (projectStore.js, dbStore.js).
export const CODELAB_DATABASES = ['wns-codelab-projects', 'wns-codelab']

// Returns `withStore(mode, action)`: runs `action(objectStore)` in one transaction and
// resolves with its request's result once the transaction completes.
export function objectStore(dbName, storeName) {
  return async function withStore(mode, action) {
    const db = await open(dbName, storeName)
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode)
        const request = action(tx.objectStore(storeName))
        tx.oncomplete = () => resolve(request?.result)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
      })
    } finally {
      db.close()
    }
  }
}
