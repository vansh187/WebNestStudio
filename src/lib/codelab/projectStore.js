// Keeps playground sessions (files, language, GitHub link…) in IndexedDB, which allows far
// more than localStorage's ~5 MB per site. A session found in localStorage is either from
// before this store existed or was just written there by "Open in CodeLab"; either way it
// is the newest copy, so it is read first and moved over. localStorage stays the fallback
// when IndexedDB is unavailable (some private modes, blocked site data). Every read and
// write follows the gateway's rules (idb.js).
import { canReadCodelab, canWriteCodelab, codelabLocal, deleteDatabase, objectStore, someDatabaseExists } from './idb.js'
import { PLAYGROUND_KEY } from './storageKeys.js'

const DB_NAME = 'wns-codelab-projects'
const withStore = objectStore(DB_NAME, 'sessions')

// Saves run one after another, and a load waits for them, so the last save of an editor
// that is unmounting always lands before the next editor reads the same key.
let queue = Promise.resolve()

// Deletes every saved session (logout, account switch): the whole IndexedDB database, or,
// when that is held up, its contents; the localStorage copies are cleared by
// accountData.js. Waits for queued saves first so none of them lands afterwards. False
// when it failed.
export async function clearSessions() {
  await queue
  if (await deleteDatabase(DB_NAME)) return true
  try {
    await withStore('readwrite', (store) => store.clear())
    return true
  } catch {
    // No IndexedDB at all means nothing was ever saved here.
    return typeof indexedDB === 'undefined'
  }
}

// Playground.jsx saves `edited`; sessions saved before that flag count as changed.
const isEdited = (value) => Boolean(value) && value.edited !== false

// Open playgrounds' current `edited`, by session key, ahead of their debounced save, so a
// change made just before logout is counted too (Playground.jsx keeps it up to date).
const liveEdits = new Map()

export function noteLiveEdit(key, edited) {
  if (edited) liveEdits.set(key, true)
  else liveEdits.delete(key)
}

// Whether any session holds code the learner changed: an open playground's, or a saved one
// in localStorage copies or IndexedDB (stopping at the first one, without loading the
// rest). Untouched lesson templates and starters do not count, nor data hidden from this
// session. Used to ask before a logout would delete them (accountData.js).
export async function hasEditedSessions() {
  // Hidden (locked) data, or a playground showing defaults because of it, keeps nothing:
  // its saves are refused, so there is nothing a logout would delete.
  if (!canReadCodelab()) return false
  if (liveEdits.size) return true
  // Saves already queued land first, so their `edited` is the one read.
  await queue
  if (!canReadCodelab()) return false
  if (codelabLocal.keys([PLAYGROUND_KEY]).some((key) => isEdited(codelabLocal.getJSON(key)))) return true
  // Never creates the database just to look into it.
  if (!(await someDatabaseExists([DB_NAME]))) return false
  let found = false
  try {
    await withStore('readonly', (store) => {
      const cursor = store.openCursor()
      cursor.onsuccess = () => {
        const current = cursor.result
        if (!current) return
        if (isEdited(current.value)) found = true
        else current.continue()
      }
      return null
    })
  } catch {
    /* IndexedDB unavailable: nothing saved there. */
  }
  return found
}

// The stored session object for `key`, or null.
export async function loadSession(key) {
  await queue
  // Mid-wipe, or data from an earlier session that could not be cleared: not shown.
  if (!canReadCodelab()) return null
  const local = codelabLocal.getJSON(key)
  if (local) {
    // The localStorage copy is the newest; while writes are refused it is still returned,
    // only not moved over.
    if (canWriteCodelab()) {
      try {
        // Straight to IndexedDB: when only localStorage works, the copy must stay there.
        await withStore('readwrite', (store) => store.put(local, key))
        codelabLocal.remove(key)
      } catch {
        /* Kept in localStorage; it is moved on a later load. */
      }
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
// load prefers that copy and moves it over. While writes are refused (a wipe, a freeze,
// the lock) nothing is written; the lock's notice tells the learner (CodingWorkspace.jsx).
export function saveSession(key, value, { now = false } = {}) {
  if (!canWriteCodelab()) return Promise.resolve(true)
  if (now && codelabLocal.setJSON(key, value)) syncWrites.set(key, (syncWrites.get(key) ?? 0) + 1)
  const seq = syncWrites.get(key) ?? 0
  const result = queue.then(() => writeSession(key, value, seq))
  queue = result.catch(() => {})
  return result
}

async function writeSession(key, value, seq) {
  // Checked again when the queued save runs: a wipe may have started meanwhile.
  if (!canWriteCodelab()) return true
  try {
    await withStore('readwrite', (store) => store.put(value, key))
    // IndexedDB now has the newest copy, unless a `now` save wrote localStorage after this
    // save was queued. Drop any older localStorage copy so a load can't prefer it.
    if (seq === (syncWrites.get(key) ?? 0)) codelabLocal.remove(key)
    return true
  } catch {
    return codelabLocal.setJSON(key, value)
  }
}
