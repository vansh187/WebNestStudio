// Keeps each backend workspace's SQLite file in IndexedDB so the data survives reloads.
// Storage can be unavailable (private mode, blocked site data); callers treat every
// failure as "nothing saved" and keep working in memory. Reads and writes follow the
// gateway's rules (idb.js).
import { canReadCodelab, canWriteCodelab, deleteDatabase, objectStore, someDatabaseExists } from './idb.js'

const DB_NAME = 'wns-codelab'
const withStore = objectStore(DB_NAME, 'databases')

// Databases deleted in this page load (forgetDatabase): a snapshot of one that was still
// on its way (the runtime saves the old workspace when it switches) must not write it back.
// Their keys are never used again: a replaced workspace gets a new database id.
const forgotten = new Set()

export async function loadDatabase(key) {
  // Mid-wipe, or data from an earlier session that could not be cleared: not used.
  if (!canReadCodelab()) return null
  try {
    const value = await withStore('readonly', (store) => store.get(key))
    return value instanceof Uint8Array ? value : null
  } catch {
    return null
  }
}

// How many workspace databases are saved (0 when there are none, storage is unavailable or
// the data is hidden from this session). Never creates the IndexedDB database.
export async function countDatabases() {
  if (!canReadCodelab() || !(await someDatabaseExists([DB_NAME]))) return 0
  try {
    return (await withStore('readonly', (store) => store.count())) ?? 0
  } catch {
    return 0
  }
}

// Deletes every workspace database (logout, account switch): the whole IndexedDB database,
// or, when that is held up, its contents. False when it failed.
export async function clearDatabases() {
  if (await deleteDatabase(DB_NAME)) return true
  try {
    await withStore('readwrite', (store) => store.clear())
    return true
  } catch {
    // No IndexedDB at all means nothing was ever saved here.
    return typeof indexedDB === 'undefined'
  }
}

export async function saveDatabase(key, bytes) {
  // While writes are refused (a wipe, a freeze, the lock), a late snapshot must not write
  // its database back; nor may one of a database deleted in this page load.
  if (!canWriteCodelab() || forgotten.has(key)) return true
  try {
    if (bytes) await withStore('readwrite', (store) => store.put(bytes, key))
    else await withStore('readwrite', (store) => store.delete(key))
    return true
  } catch {
    return false
  }
}

// Deletes one workspace's database for good (accountData.js forgetWorkspace). False when
// the delete failed; true without IndexedDB, where nothing was ever saved.
export async function forgetDatabase(key) {
  forgotten.add(key)
  if (typeof indexedDB === 'undefined') return true
  try {
    await withStore('readwrite', (store) => store.delete(key))
    return true
  } catch {
    return false
  }
}
