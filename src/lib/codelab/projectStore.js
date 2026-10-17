// Keeps playground sessions (files, language, GitHub link…) in IndexedDB, which allows far
// more than localStorage's ~5 MB per site. A session found in localStorage is either from
// before this store existed or was just written there by "Open in CodeLab"; either way it
// is the newest copy, so it is read first and moved over. localStorage stays the fallback
// when IndexedDB is unavailable (some private modes, blocked site data).
const DB_NAME = 'wns-codelab-projects'
const STORE = 'sessions'

function open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'))
      return
    }
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore(mode, action) {
  const db = await open()
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const request = action(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(request?.result)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Saves run one after another, and a load waits for them, so the last save of an editor
// that is unmounting always lands before the next editor reads the same key.
let queue = Promise.resolve()

// The stored session object for `key`, or null.
export async function loadSession(key) {
  await queue
  const local = readLocal(key)
  if (local) {
    try {
      // Straight to IndexedDB: when only localStorage works, the copy must stay there.
      await withStore('readwrite', (store) => store.put(local, key))
      localStorage.removeItem(key)
    } catch {
      /* Kept in localStorage; it is moved on a later load. */
    }
    return local
  }
  try {
    return (await withStore('readonly', (store) => store.get(key))) ?? null
  } catch {
    return null
  }
}

// Per key, how many synchronous localStorage copies `now` saves have written.
const syncWrites = new Map()

// Returns false only when neither IndexedDB nor localStorage could take the session.
// `now` (page being hidden or closed) also writes a localStorage copy synchronously,
// because the async IndexedDB write may not finish before the page goes away; the next
// load prefers that copy and moves it over.
export function saveSession(key, value, { now = false } = {}) {
  if (now) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      syncWrites.set(key, (syncWrites.get(key) ?? 0) + 1)
    } catch {
      /* Too large for localStorage: the IndexedDB write below is the only copy. */
    }
  }
  const seq = syncWrites.get(key) ?? 0
  const result = queue.then(() => writeSession(key, value, seq))
  queue = result.catch(() => {})
  return result
}

async function writeSession(key, value, seq) {
  try {
    await withStore('readwrite', (store) => store.put(value, key))
    // IndexedDB now has the newest copy, unless a `now` save wrote localStorage after this
    // save was queued. Drop any older localStorage copy so a load can't prefer it.
    if (seq === (syncWrites.get(key) ?? 0)) {
      try {
        localStorage.removeItem(key)
      } catch {
        /* Storage blocked: nothing to remove. */
      }
    }
    return true
  } catch {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }
}
