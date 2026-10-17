// Keeps each backend workspace's SQLite file in IndexedDB so the data survives reloads.
// Storage can be unavailable (private mode, blocked site data); callers treat every
// failure as "nothing saved" and keep working in memory.
const DB_NAME = 'wns-codelab'
const STORE = 'databases'

function open() {
  return new Promise((resolve, reject) => {
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

export async function loadDatabase(key) {
  try {
    const value = await withStore('readonly', (store) => store.get(key))
    return value instanceof Uint8Array ? value : null
  } catch {
    return null
  }
}

export async function saveDatabase(key, bytes) {
  try {
    if (bytes) await withStore('readwrite', (store) => store.put(bytes, key))
    else await withStore('readwrite', (store) => store.delete(key))
    return true
  } catch {
    return false
  }
}
