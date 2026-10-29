import test from 'node:test'
import assert from 'node:assert/strict'

// Browser stand-ins: storage, and a window that records listeners and reloads.
function memoryStorage() {
  const map = new Map()
  return {
    map,
    get length() { return map.size },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  }
}
globalThis.localStorage = memoryStorage()
globalThis.sessionStorage = memoryStorage()
const store = globalThis.localStorage.map
// Every 'storage' listener (idb.js and accountData.js each add one); fire() delivers an
// event as a browser does for a change made in another tab.
const listeners = { storage: [] }
const fire = (event) => listeners.storage.forEach((fn) => fn(event))
// A change another tab makes: written to the shared storage, then announced.
const otherTab = {
  set: (key, value) => { store.set(key, String(value)); fire({ key, newValue: String(value) }) },
  remove: (key) => { store.delete(key); fire({ key, newValue: null }) },
}
let reloads = 0
const noDispatch = () => true
globalThis.window = {
  addEventListener: (type, fn) => { (listeners[type] ??= []).push(fn) },
  dispatchEvent: noDispatch,
  location: { reload: () => { reloads += 1 } },
}

globalThis.CustomEvent = class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail } }

const {
  WIPE_SETTLE_MS, claimCodelabData, clearCodelabData, confirmCodelabLogout, endCodelabSession, forgetWorkspace, rememberSessionAccount,
  retryLockedClear, sessionOwnsCodelabData,
} = await import('../src/lib/codelab/accountData.js')
const {
  canWriteCodelab, codelabDataLocked, codelabEditorOpen, codelabFrozenNotice, codelabLocal, setCodelabLock, trackCodelabEditor,
} = await import('../src/lib/codelab/idb.js')
const { loadEnvFile, saveEnvContent, saveEnvFile, withSavedEnv } = await import('../src/lib/codelab/envStore.js')
const { loadSession, noteLiveEdit } = await import('../src/lib/codelab/projectStore.js')

// An IndexedDB whose open always fails, as when the store is busy or the disk errors.
const failingIndexedDB = { open: () => { const request = {}; queueMicrotask(() => { request.error = new Error('busy'); request.onerror?.() }); return request } }

const wipeMarkers = () => [...store.keys()].filter((key) => key.startsWith('wns-codelab-wipe:'))

const reset = () => {
  store.clear()
  globalThis.sessionStorage.map.clear()
  delete globalThis.indexedDB
  reloads = 0
  fire({ key: null, newValue: null })
}

// Tests that need writes come first: freezing cannot be undone within one module instance.

test('logged-out work is adopted; a different account clears the first one\'s data', async () => {
  reset()
  localStorage.setItem('wns-codelab-playground', 'work')
  localStorage.setItem('wns-codelab-env:project:1', 'KEY=1')
  localStorage.setItem('wns-theme', 'dark')
  await claimCodelabData('a@x.com')
  assert.equal(localStorage.getItem('wns-codelab-playground'), 'work')
  await claimCodelabData('b@x.com')
  assert.equal(localStorage.getItem('wns-codelab-playground'), null)
  assert.equal(localStorage.getItem('wns-codelab-env:project:1'), null)
  assert.equal(localStorage.getItem('wns-theme'), 'dark')
  assert.equal(localStorage.getItem('wns-codelab-owner'), 'b@x.com')
  assert.equal(reloads, 0, 'no editor open: no reload, so login navigation is kept')
})

test('a failed IndexedDB clear still removes secrets, and keeps the owner', async () => {
  reset()
  globalThis.indexedDB = failingIndexedDB
  localStorage.setItem('wns-codelab-owner', 'a@x.com')
  localStorage.setItem('wns-codelab-env:project:1', 'RAZORPAY_KEY_SECRET=placeholder')
  localStorage.setItem('wns-codelab-api:project:1', '{"token":"t"}')
  assert.equal(await clearCodelabData(), false)
  assert.equal(localStorage.getItem('wns-codelab-env:project:1'), null, '.env secrets are removed anyway')
  assert.equal(localStorage.getItem('wns-codelab-api:project:1'), null, 'API tester tokens are removed anyway')
  assert.equal(localStorage.getItem('wns-codelab-owner'), 'a@x.com')
  localStorage.setItem('wns-codelab-playground', JSON.stringify({ language: 'python', files: [] }))
  globalThis.indexedDB = failingIndexedDB
  // Even the localStorage copy cannot be removed now: A's session must still not show.
  const removeItem = localStorage.removeItem
  localStorage.removeItem = (k) => { if (k !== 'wns-codelab-playground') removeItem(k) }
  await claimCodelabData('b@x.com')
  localStorage.removeItem = removeItem
  assert.equal(localStorage.getItem('wns-codelab-owner'), 'a@x.com', 'B must not adopt A\'s data')
  assert.equal(codelabDataLocked(), true, 'locked: hidden and read-only')
  assert.equal(await loadSession('wns-codelab-playground'), null, 'B does not see A\'s session')
  assert.equal(!canWriteCodelab(), true, 'and saving is paused')
  assert.match(codelabFrozenNotice()?.notice ?? '', /saving here is paused/)
  delete globalThis.indexedDB
  await claimCodelabData('b@x.com')
  assert.equal(localStorage.getItem('wns-codelab-owner'), 'b@x.com', 'the next login retries and succeeds')
  assert.equal(codelabDataLocked(), false, 'a successful clear lifts the lock')
  assert.equal(!canWriteCodelab(), false)
})

test('a logout whose clear fails locks the data instead of leaving it readable', async () => {
  reset()
  globalThis.indexedDB = failingIndexedDB
  localStorage.setItem('wns-codelab-owner', 'a@x.com')
  assert.equal(await endCodelabSession(), false)
  assert.equal(codelabDataLocked(), true, 'the next person on this browser does not see A\'s data')
  assert.equal(localStorage.getItem('wns-codelab-owner'), 'a@x.com')
  delete globalThis.indexedDB
})

test('locked data with no owner is cleared at login, never adopted', async () => {
  reset()
  localStorage.setItem('wns-codelab-locked', '1')
  localStorage.setItem('wns-codelab-env:project:1', 'OLD=1')
  assert.equal(await claimCodelabData('b@x.com'), false)
  assert.equal(store.get('wns-codelab-env:project:1'), undefined, 'cleared, not handed to B')
  assert.equal(codelabDataLocked(), false)
  assert.equal(localStorage.getItem('wns-codelab-owner'), 'b@x.com')
})

test('a visitor who never used CodeLab logs out without any CodeLab work', async () => {
  reset()
  let opened = 0
  globalThis.indexedDB = { databases: async () => [], open: () => { opened += 1; throw new Error('must not open') } }
  const started = Date.now()
  assert.equal((await confirmCodelabLogout()).proceed, true, 'no question')
  assert.equal(await clearCodelabData(), true)
  assert.ok(Date.now() - started < WIPE_SETTLE_MS, 'no settle wait')
  assert.equal(opened, 0, 'no database opened, so none created')
  assert.equal(wipeMarkers().length, 0)
  delete globalThis.indexedDB
})

test('the locked data\'s own account logging back in unlocks it', async () => {
  reset()
  localStorage.setItem('wns-codelab-owner', 'a@x.com')
  localStorage.setItem('wns-codelab-locked', '1')
  localStorage.setItem('wns-codelab-env:project:1', 'A=1')
  assert.equal(loadEnvFile('project:1'), null)
  await claimCodelabData('a@x.com')
  assert.equal(codelabDataLocked(), false)
  assert.equal(loadEnvFile('project:1')?.content, 'A=1', 'A sees its own data again')
  assert.equal(reloads, 0, 'no CodeLab page open: no reload')
})

test('a deleted project\'s browser data is forgotten on its own', async () => {
  reset()
  for (const prefix of ['wns-codelab-breakpoints:', 'wns-codelab-api:', 'wns-codelab-env:']) {
    localStorage.setItem(`${prefix}project:1`, 'x')
    localStorage.setItem(`${prefix}project:2`, 'y')
  }
  assert.equal(await forgetWorkspace('project:1'), true, 'no IndexedDB here: no database to delete, not a failure')
  assert.deepEqual([...store.keys()].sort(), ['wns-codelab-api:project:2', 'wns-codelab-breakpoints:project:2', 'wns-codelab-env:project:2'])
})

test('once a wipe starts, every tab refuses CodeLab writes at once, and reads see nothing', () => {
  reset()
  localStorage.setItem('wns-codelab-env:project:1', 'A=1')
  assert.equal(codelabLocal.set('wns-codelab-api:project:1', '{}'), true)
  // Another tab set the marker: shared storage, read synchronously, no event needed.
  otherTab.set('wns-codelab-wipe:other-tab', String(Date.now()))
  assert.equal(canWriteCodelab(), false)
  assert.equal(codelabLocal.set('wns-codelab-api:project:1', '{"token":"t"}'), false)
  assert.equal(codelabLocal.remove('wns-codelab-env:project:1'), false)
  assert.equal(codelabLocal.get('wns-codelab-env:project:1'), null)
  saveEnvContent('project:1', null)
  assert.equal(store.get('wns-codelab-env:project:1'), 'A=1', 'a page mounting mid-wipe cannot erase what it could not read')
  assert.deepEqual(codelabLocal.keys(['wns-codelab-env:']), ['wns-codelab-env:project:1'], 'listing ignores the rules (the wipe itself)')
})

test('a wipe waits for writes other tabs already started before it clears', async () => {
  reset()
  const started = Date.now()
  localStorage.setItem('wns-codelab-env:project:1', 'A=1')
  // A write another tab began just before the marker, landing within the settle time.
  setTimeout(() => store.set('wns-codelab-env:project:2', 'late'), WIPE_SETTLE_MS / 2)
  assert.equal(await clearCodelabData(), true)
  assert.ok(Date.now() - started >= WIPE_SETTLE_MS - 5)
  assert.equal(store.get('wns-codelab-env:project:2'), undefined, 'the late write is cleared too')
})

test('logout counts an open playground\'s change before its debounced save lands', async () => {
  reset()
  globalThis.window.confirm = () => false
  localStorage.setItem('wns-codelab-playground:lesson:intro:0', JSON.stringify({ language: 'python', edited: false }))
  assert.equal((await confirmCodelabLogout()).proceed, true, 'stored as untouched: no question')
  noteLiveEdit('wns-codelab-playground:lesson:intro:0', true)
  assert.equal((await confirmCodelabLogout()).proceed, false, 'typed just now: asked')
  noteLiveEdit('wns-codelab-playground:lesson:intro:0', false)
  delete globalThis.window.confirm
})

test('forgetting a workspace while writes are refused reports failure', async () => {
  reset()
  localStorage.setItem('wns-codelab-api:project:1', '{"token":"t"}')
  otherTab.set('wns-codelab-wipe:other-tab', String(Date.now()))
  assert.equal(await forgetWorkspace('project:1'), false, 'nothing deleted, so not reported as done')
  otherTab.remove('wns-codelab-wipe:other-tab')
  assert.equal(await forgetWorkspace('project:1'), true)
  assert.equal(store.get('wns-codelab-api:project:1'), undefined)
})

test('a long wipe keeps its marker fresh, so it is never taken for a stale one', async (t) => {
  reset()
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })
  const marks = []
  const setItem = localStorage.setItem
  localStorage.setItem = (k, v) => { if (k.startsWith('wns-codelab-wipe:')) marks.push(v); setItem(k, v) }
  const wipe = clearCodelabData()
  t.mock.timers.tick(5000)
  t.mock.timers.tick(5000)
  t.mock.timers.tick(WIPE_SETTLE_MS)
  localStorage.setItem = setItem
  t.mock.timers.reset()
  await wipe
  assert.ok(marks.length >= 2, 'set again while it ran')
  assert.equal(wipeMarkers().length, 0, 'removed when done')
})

test('a page load with nobody logged in retries a clear a logout could not do', async () => {
  reset()
  localStorage.setItem('wns-codelab-locked', '1')
  localStorage.setItem('wns-codelab-owner', 'a@x.com')
  localStorage.setItem('wns-codelab-env:project:1', 'A=1')
  assert.equal(await retryLockedClear(), false, 'no CodeLab page open: no reload')
  assert.equal(codelabDataLocked(), false)
  assert.equal(store.get('wns-codelab-env:project:1'), undefined)
  assert.equal(localStorage.getItem('wns-codelab-owner'), null)
  assert.equal(await retryLockedClear(), false, 'nothing locked: nothing to do')
})

test('a saved project keeps its .env in this browser only', () => {
  reset()
  saveEnvFile('project:9', [{ name: 'app/main.py', content: '' }, { name: '.env', content: 'A=1' }])
  assert.deepEqual(loadEnvFile('project:9'), { name: '.env', language: 'plaintext', content: 'A=1' })
  const files = [{ name: 'app/main.py', content: '' }]
  assert.deepEqual(withSavedEnv('project:9', files).map((file) => file.name), ['app/main.py', '.env'])
  assert.equal(withSavedEnv('project:none', files), files)
  const own = [...files, { name: '.env', content: 'B=2' }]
  assert.equal(withSavedEnv('project:9', own), own, 'a .env already in the files wins')
  saveEnvFile('project:9', files)
  assert.equal(loadEnvFile('project:9'), null, 'removing the .env forgets it')
})

test('logout asks first only while a .env or database would be lost', async () => {
  reset()
  const asked = []
  globalThis.window.confirm = (message) => { asked.push(message); return false }
  assert.equal((await confirmCodelabLogout()).proceed, true, 'nothing kept here: no question')
  localStorage.setItem('wns-codelab-env:project:1', 'A=1')
  assert.equal((await confirmCodelabLogout()).proceed, false, 'the learner can cancel')
  assert.match(asked[0], /only in this browser/)
  store.clear()
  localStorage.setItem('wns-codelab-playground:lesson:intro:0', JSON.stringify({ language: 'python', edited: false }))
  assert.equal((await confirmCodelabLogout()).proceed, true, 'an untouched lesson template is not asked about')
  localStorage.setItem('wns-codelab-playground:lesson:intro:1', JSON.stringify({ language: 'python', edited: true }))
  assert.equal((await confirmCodelabLogout()).proceed, false, 'changed playground code alone is asked about')
  assert.match(asked[1], /not saved as a project/)
  store.clear()
  localStorage.setItem('wns-codelab-playground', JSON.stringify({ language: 'python' }))
  assert.equal((await confirmCodelabLogout()).proceed, false, 'a session saved before the flag counts as changed')
  delete globalThis.window.confirm
})

test('loads return nothing while a wipe is running, and a stale marker is ignored', async () => {
  reset()
  localStorage.setItem('wns-codelab-env:project:1', 'A=1')
  localStorage.setItem('wns-codelab-playground', JSON.stringify({ language: 'backend', files: [] }))
  otherTab.set('wns-codelab-wipe:other-tab', String(Date.now()))
  assert.equal(loadEnvFile('project:1'), null)
  assert.equal(await loadSession('wns-codelab-playground'), null, 'the old session is not read in mid-wipe')
  otherTab.set('wns-codelab-wipe:other-tab', String(Date.now() - 60000))
  assert.equal(loadEnvFile('project:1')?.content, 'A=1', 'a tab that closed mid-wipe does not block loads for good')
  assert.equal((await loadSession('wns-codelab-playground'))?.language, 'backend')
})

test('a forgotten database is not written back by a late snapshot', async () => {
  const { forgetDatabase, saveDatabase } = await import('../src/lib/codelab/dbStore.js')
  assert.equal(canWriteCodelab(), true, 'writes allowed, so only forgetting can refuse it')
  const puts = []
  globalThis.indexedDB = {
    open: () => {
      const request = {}
      const db = {
        close() {},
        transaction: () => {
          const tx = {}
          tx.objectStore = () => ({ put: (value, key) => { puts.push(key); queueMicrotask(() => tx.oncomplete?.()); return {} }, delete: () => { queueMicrotask(() => tx.oncomplete?.()); return {} } })
          return tx
        },
      }
      queueMicrotask(() => { request.result = db; request.onsuccess?.() })
      return request
    },
  }
  assert.equal(await forgetDatabase('wns-codelab-db:old'), true)
  assert.equal(await saveDatabase('wns-codelab-db:old', new Uint8Array([1])), true, 'refused quietly')
  assert.deepEqual(puts, [], 'nothing written under the forgotten key')
  delete globalThis.indexedDB
})


test('logout reloads only while a CodeLab editor is open in this tab', async () => {
  reset()
  assert.equal(codelabEditorOpen(), false)
  assert.equal(await endCodelabSession(), false)
  assert.equal(!canWriteCodelab(), false, 'no editor: nothing frozen, logout stays in-app')
  const untrack = trackCodelabEditor()
  assert.equal(codelabEditorOpen(), true)
  untrack()
  assert.equal(codelabEditorOpen(), false)
})

test('a wipe marks itself while it runs, and leaves no marker behind', async () => {
  reset()
  const marks = []
  const { setItem, removeItem } = localStorage
  localStorage.setItem = (k, v) => { if (k.startsWith('wns-codelab-wipe:')) marks.push('set'); setItem(k, v) }
  localStorage.removeItem = (k) => { if (k.startsWith('wns-codelab-wipe:')) marks.push('removed'); removeItem(k) }
  await clearCodelabData()
  Object.assign(localStorage, { setItem, removeItem })
  assert.deepEqual(marks, ['set', 'removed'])
  assert.equal(wipeMarkers().length, 0)
})

test('tabs without a CodeLab page ignore a wipe in another tab', () => {
  reset()
  fire({ key: 'wns-codelab-wipe:other-tab', newValue: String(Date.now()) })
  fire({ key: 'wns-codelab-wipe:other-tab', newValue: null })
  assert.equal(!canWriteCodelab(), false, 'a lesson or contact form tab is not frozen')
  assert.equal(reloads, 0, 'nor reloaded')
})

test('a tab with a CodeLab page freezes when a wipe starts and reloads when it ends', () => {
  reset()
  const untrack = trackCodelabEditor()
  fire({ key: 'wns-theme', newValue: 'dark' })
  assert.equal(!canWriteCodelab(), false)
  fire({ key: 'wns-codelab-wipe:other-tab', newValue: String(Date.now()) })
  assert.equal(!canWriteCodelab(), true, 'frozen at once, before anything is cleared')
  assert.equal(reloads, 0, 'not reloaded mid-wipe')
  fire({ key: 'wns-codelab-wipe:other-tab', newValue: null })
  assert.equal(reloads, 1)
  untrack()
})

test('a tab frozen by a wipe whose tab closed reloads once the marker is stale', async (t) => {
  reset()
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const untrack = trackCodelabEditor()
  fire({ key: 'wns-codelab-wipe:other-tab', newValue: String(Date.now()) })
  t.mock.timers.tick(14999)
  assert.equal(reloads, 0)
  t.mock.timers.tick(1)
  assert.equal(reloads, 1, 'no "done" ever came, so it does not stay frozen for good')
  untrack()
})

test('a claim that clears another account\'s data with an editor open reloads, at most once', async () => {
  reset()
  const untrack = trackCodelabEditor()
  localStorage.setItem('wns-codelab-owner', 'a@x.com')
  await claimCodelabData('b@x.com')
  assert.equal(reloads, 1, 'reloaded so the editor cannot save A\'s project back')
  assert.equal(localStorage.getItem('wns-codelab-owner'), 'b@x.com')
  // Clearing keeps failing: the data is locked and one reload drops what the page held.
  // The reloaded page claims again while still locked, and is not reloaded again.
  globalThis.indexedDB = failingIndexedDB
  localStorage.setItem('wns-codelab-owner', 'a@x.com')
  const notices = []
  globalThis.window.dispatchEvent = (event) => notices.push(event.detail?.notice)
  await claimCodelabData('b@x.com')
  assert.equal(reloads, 2)
  await claimCodelabData('b@x.com')
  assert.equal(reloads, 2, 'no reload loop')
  assert.equal(localStorage.getItem('wns-codelab-owner'), 'a@x.com')
  assert.match(codelabFrozenNotice()?.notice ?? '', /saving here is paused/)
  assert.equal(notices.length, 1, 'open editors are told once per lock (CodingWorkspace shows it)')
  globalThis.window.dispatchEvent = noDispatch
  delete globalThis.indexedDB
  untrack()
})

test('a claim that reloads the page says so, so login does not go on', async () => {
  reset()
  const untrack = trackCodelabEditor()
  localStorage.setItem('wns-codelab-owner', 'a@x.com')
  assert.equal(await claimCodelabData('b@x.com'), true)
  assert.equal(await claimCodelabData('b@x.com'), false, 'same owner now: nothing to do')
  untrack()
})

test('two overlapping wipes do not end each other\'s', async () => {
  reset()
  localStorage.setItem('wns-codelab-env:project:1', 'A=1')
  const first = clearCodelabData()
  await new Promise((resolve) => { setTimeout(resolve, WIPE_SETTLE_MS / 2) })
  const second = clearCodelabData()
  await first
  assert.equal(wipeMarkers().length, 1, 'the second wipe still has its marker')
  assert.equal(canWriteCodelab(), false, 'so writes stay refused')
  await second
  assert.equal(wipeMarkers().length, 0)
})

test('a tab waits for every running wipe before it reloads', () => {
  reset()
  const untrack = trackCodelabEditor()
  const before = reloads
  otherTab.set('wns-codelab-wipe:a', String(Date.now()))
  otherTab.set('wns-codelab-wipe:b', String(Date.now()))
  otherTab.remove('wns-codelab-wipe:a')
  assert.equal(reloads, before, 'wipe b is still running')
  otherTab.remove('wns-codelab-wipe:b')
  assert.equal(reloads, before + 1)
  untrack()
})


test('locked data does not make CodeLab tabs reload each other', () => {
  reset()
  const untrack = trackCodelabEditor()
  localStorage.setItem('wns-codelab-locked', '1')
  const before = reloads
  // Another tab's retry: its marker comes and goes, and the data stays locked.
  otherTab.set('wns-codelab-wipe:retry', String(Date.now()))
  otherTab.remove('wns-codelab-wipe:retry')
  assert.equal(reloads, before, 'this tab already shows nothing of the locked data: no reload')
  localStorage.removeItem('wns-codelab-locked')
  assert.equal(canWriteCodelab(), true, 'the freeze was lifted, so saving works once the lock is gone')
  // A wipe that locks data which was not locked before still reloads (the page may show it).
  otherTab.set('wns-codelab-wipe:switch', String(Date.now()))
  localStorage.setItem('wns-codelab-locked', '1')
  otherTab.remove('wns-codelab-wipe:switch')
  assert.equal(reloads, before + 1)
  untrack()
})

test('a failed retry with a CodeLab page open neither reloads nor stays frozen', async () => {
  reset()
  const untrack = trackCodelabEditor()
  globalThis.indexedDB = failingIndexedDB
  localStorage.setItem('wns-codelab-locked', '1')
  localStorage.setItem('wns-codelab-env:project:1', 'A=1')
  const before = reloads
  assert.equal(await retryLockedClear(), false)
  assert.equal(reloads, before)
  delete globalThis.indexedDB
  localStorage.removeItem('wns-codelab-locked')
  assert.equal(canWriteCodelab(), true, 'not left frozen behind the lock')
  untrack()
})

test('the playground waits for the login check only when the data may not be this session\'s', () => {
  reset()
  assert.equal(sessionOwnsCodelabData(), true, 'unowned data: no wait')
  localStorage.setItem('wns-codelab-owner', 'a@x.com')
  rememberSessionAccount('a@x.com')
  assert.equal(sessionOwnsCodelabData(), true, 'its own data: opens at once')
  rememberSessionAccount('b@x.com')
  assert.equal(sessionOwnsCodelabData(), false, 'another account\'s: waits for the check')
  rememberSessionAccount('a@x.com')
  localStorage.setItem('wns-codelab-locked', '1')
  assert.equal(sessionOwnsCodelabData(), false, 'locked: waits')
})

test('lifting the lock is announced, so the paused-saving notice closes', () => {
  reset()
  const events = []
  globalThis.window.dispatchEvent = (event) => events.push(event.detail)
  setCodelabLock(true)
  setCodelabLock(false)
  globalThis.window.dispatchEvent = noDispatch
  assert.equal(events.length, 2)
  assert.match(events[0].notice, /saving here is paused/)
  assert.equal(events[1].notice, null)
})
