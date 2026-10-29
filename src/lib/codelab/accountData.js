// CodeLab projects are private to the account that made them, but they are saved in this
// browser: sessions in IndexedDB (projectStore.js), SQLite files (dbStore.js), and
// breakpoints, saved projects' .env files and the API tester's token and history in
// localStorage (storageKeys.js). All of it is cleared on logout and account deletion.
// Saved projects' files are on the server too; unsaved playground code, .env files and
// databases are not, so logout asks first while any are kept here (confirmCodelabLogout).
//
// The browser also remembers which account the data belongs to. Work done while logged
// out is adopted by the next account that logs in. One exception: after a session ends
// without a logout (it expired), the data still belongs to that account, so anything
// done while logged out sits on top of it and cannot be told apart. If a different
// account then logs in, all of it is cleared, the logged-out work included, because
// keeping it would hand the first account's projects to the second. Should clearing
// fail, the data is locked instead (idb.js): hidden and read-only in every tab until a
// clear succeeds or its account logs back in.
//
// While a wipe runs, its own marker in localStorage (idb.js WIPE_PENDING_PREFIX) tells
// every tab: loads return nothing and writes are refused, and tabs with a CodeLab page
// open stop saving and reload once no wipe is left running (or after WIPE_STALE_MS,
// should the wiping tab close mid-wipe). Tabs without one are left alone. The wiping tab
// itself is frozen and reloaded only while it has a CodeLab page open.
import { clearSessions, hasEditedSessions } from './projectStore.js'
import { clearDatabases, countDatabases, forgetDatabase } from './dbStore.js'
import {
  CODELAB_DATABASES, WIPE_PENDING_PREFIX, WIPE_STALE_MS, canReadCodelab, canWriteCodelab, codelabDataLocked, codelabEditorOpen,
  codelabWipePending, freezeCodelabWrites, markWipePending, rawLocal, setCodelabLock, someDatabaseExists, thawCodelabWrites,
} from './idb.js'
import { ENV_STORAGE_PREFIX, PLAYGROUND_KEY, WORKSPACE_PREFIXES, databaseKey } from './storageKeys.js'

const OWNER_KEY = 'wns-codelab-owner'
const LOCAL_PREFIXES = [PLAYGROUND_KEY, ...WORKSPACE_PREFIXES]
// After the wipe marker is set, every tab refuses new writes at once (idb.js). This long
// is waited before clearing, so a write another tab had already started lands first and
// is cleared too, instead of landing after the clear.
export const WIPE_SETTLE_MS = 300

// True when every CodeLab localStorage entry is gone. Raw on purpose: during the wipe,
// the gateway refuses writes.
function clearLocalKeys() {
  return rawLocal.keys(LOCAL_PREFIXES).map((key) => rawLocal.remove(key)).every(Boolean)
}

const setOwner = (owner) => (owner ? rawLocal.set(OWNER_KEY, owner) : rawLocal.remove(OWNER_KEY))

// Deletes everything this browser keeps for a workspace (a deleted project, or a playground
// workspace replaced by a starter or an import): its database and its localStorage entries
// (.env, breakpoints, API tester token). False on failure, also when the gateway refuses
// writes (a wipe, a freeze, the lock), since nothing is deleted then; the wipe or the next
// clear removes it. A snapshot of the forgotten database still on its way cannot write it
// back (dbStore.js forgetDatabase).
export async function forgetWorkspace(workspaceKey) {
  if (!canWriteCodelab()) return false
  const local = WORKSPACE_PREFIXES.map((prefix) => rawLocal.remove(`${prefix}${workspaceKey}`)).every(Boolean)
  const database = await forgetDatabase(databaseKey(workspaceKey))
  return local && database
}

// Whether this browser holds anything of CodeLab's: its localStorage entries, the lock, or
// its IndexedDB databases (checked without opening them, which would create them).
async function hasCodelabData() {
  if (rawLocal.keys(LOCAL_PREFIXES).length || codelabDataLocked()) return true
  return someDatabaseExists(CODELAB_DATABASES)
}

// Clears every CodeLab store; every store is attempted even when another fails. `freeze`:
// this tab reloads next, so saves from its open pages are dropped. `hasData`: what
// confirmCodelabLogout already found, so it is not looked up again. Resolves false when
// something could not be cleared: the data is then locked (hidden and read-only, idb.js)
// and the owner kept, so nobody else sees it and the next login tries again. This holds
// for every caller: logout, account deletion and an account switch.
export async function clearCodelabData({ freeze = false, hasData } = {}) {
  if (freeze) freezeCodelabWrites()
  // Set before anything is awaited, so callers that start the wipe without awaiting it
  // (logout, AuthContext.jsx) have every CodeLab write refused from that moment. Its own
  // key, so an overlapping wipe finishing first does not end this one.
  const marker = `${WIPE_PENDING_PREFIX}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  const mark = () => markWipePending(marker, Date.now())
  mark()
  // Kept fresh while the wipe runs (a long save queue or a slow IndexedDB), so it never
  // looks like the stale marker of a tab that closed mid-wipe.
  const heartbeat = setInterval(mark, WIPE_STALE_MS / 3)
  try {
    // Nothing of CodeLab's in this browser (a visitor who never opened it): no settle
    // wait, and no database touched.
    if (!(hasData ?? (await hasCodelabData()))) {
      setOwner(null)
      return true
    }
    await new Promise((resolve) => { setTimeout(resolve, WIPE_SETTLE_MS) })
    const [sessions, databases] = await Promise.all([clearSessions(), clearDatabases()])
    const local = clearLocalKeys()
    const ok = sessions && databases && local
    if (ok) setOwner(null)
    setCodelabLock(!ok)
    return ok
  } finally {
    clearInterval(heartbeat)
    markWipePending(marker, null)
  }
}

// Asks before a logout that would delete what only this browser has: changed playground
// code, saved projects' .env files and the SQLite databases. Data hidden from this session
// (locked, idb.js) is not the learner's and not asked about. Resolves { proceed, hasData };
// pass `hasData` on to endCodelabSession, so the wipe does not look it up again.
export async function confirmCodelabLogout() {
  const hasData = await hasCodelabData()
  if (!hasData) return { proceed: true, hasData }
  const envFiles = canReadCodelab() ? rawLocal.keys([ENV_STORAGE_PREFIX]).length : 0
  const [edited, databases] = await Promise.all([hasEditedSessions(), countDatabases()])
  if ((!envFiles && !edited && !databases) || typeof window === 'undefined' || typeof window.confirm !== 'function') {
    return { proceed: true, hasData }
  }
  const proceed = window.confirm(
    'Log out? CodeLab keeps playground code you have not saved as a project, and your projects\' .env files and databases, '
    + 'only in this browser, so logging out deletes them. Saved projects stay in your account.',
  )
  return { proceed, hasData }
}

// Logout and account deletion. `reload`: a CodeLab page in this tab may hold the project
// in memory, so the tab is frozen and the caller reloads it. Decide it before the logout
// starts unmounting pages (AuthContext.jsx); resolves `reload`.
export async function endCodelabSession({ reload = codelabEditorOpen(), hasData } = {}) {
  await clearCodelabData({ freeze: reload, hasData })
  return reload
}

// Called after login with the account's key (its email, like learningProgress.js). When
// another account's data has to be cleared while a CodeLab page is open here, its
// in-memory copy would be saved back, so this tab is frozen and reloaded. Resolves true
// when it reloads the page: the caller must then not go on (AuthContext.jsx).
export async function claimCodelabData(owner) {
  if (!owner) return false
  const previous = rawLocal.get(OWNER_KEY)
  if (previous === owner) {
    // Its own data, locked while another account was logged in: unlock and show it.
    if (!codelabDataLocked()) return false
    setCodelabLock(false)
    return reloadIf(codelabEditorOpen())
  }
  // Unowned data (work done while logged out) is adopted, unless it is locked: then it is
  // data from an earlier session that could not be cleared, and is cleared like another
  // account's.
  if (!previous && !codelabDataLocked()) {
    setOwner(owner)
    return false
  }
  const reload = codelabEditorOpen()
  const wasLocked = codelabDataLocked()
  // Two tries: a busy store usually clears on the second. A failure leaves it locked
  // (clearCodelabData): hidden and read-only until a clear works or its account returns.
  const cleared = (await clearCodelabData({ freeze: reload })) || (await clearCodelabData({ freeze: reload }))
  if (cleared) setOwner(owner)
  // One reload drops what an open page holds. After it the data stays hidden, so a page
  // reloaded while still locked is not reloaded again.
  return settle(reload, cleared, wasLocked)
}

// On a page load with nobody logged in (AuthContext.jsx): data that an earlier logout or
// account switch could not clear, and so locked, is cleared now; the next login retries
// through claimCodelabData. Resolves true when it reloads the page.
export async function retryLockedClear() {
  if (!codelabDataLocked()) return false
  const reload = codelabEditorOpen()
  const cleared = await clearCodelabData({ freeze: reload })
  return settle(reload, cleared, true)
}

// After a wipe in a tab with a CodeLab page open (`reload`): reload when it cleared, or when
// it locked data the page may still be showing (it was not locked before). When the data
// was locked all along, the page already shows nothing of it, so it is not reloaded (which
// would only start another retry, and reload every other CodeLab tab in turn); the freeze
// is lifted, the lock refusing writes in its place until it lifts.
function settle(reload, cleared, wasLocked) {
  if (reload && !cleared && wasLocked) {
    thawCodelabWrites()
    return false
  }
  return reloadIf(reload)
}

function reloadIf(reload) {
  if (reload) window.location.reload()
  return reload
}

// Another tab is wiping CodeLab's data. A tab with a CodeLab page open stops saving at
// once and reloads when no wipe is left running, so nothing it holds in memory is written
// back; should the wiping tab close first, it reloads once the marker is stale. When the
// data was already locked as the wipe started and still is when it ends, this tab shows
// nothing of it, so it is not reloaded (two CodeLab tabs would otherwise keep reloading
// each other through each reload's retry); its freeze is lifted, the lock still refusing.
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  let staleTimer = null
  let lockedAtStart = null
  window.addEventListener('storage', (event) => {
    if (!event.key?.startsWith(WIPE_PENDING_PREFIX) || !codelabEditorOpen()) return
    if (lockedAtStart === null) lockedAtStart = codelabDataLocked()
    freezeCodelabWrites()
    clearTimeout(staleTimer)
    if (event.newValue || codelabWipePending()) {
      staleTimer = setTimeout(() => window.location.reload(), WIPE_STALE_MS)
      return
    }
    const quiet = lockedAtStart && codelabDataLocked()
    lockedAtStart = null
    if (quiet) thawCodelabWrites()
    else window.location.reload()
  })
}

// The account the browser's login session belongs to, kept with the refresh token
// (AuthContext.jsx). When it is the data's owner, a page load can show CodeLab data before
// the login check finishes; otherwise a CodeLab page waits for that check (and the wipe of
// another account's data it may start).
const SESSION_ACCOUNT_KEY = 'wns-codelab-session-account'

export const rememberSessionAccount = (account) => (account ? rawLocal.set(SESSION_ACCOUNT_KEY, account) : rawLocal.remove(SESSION_ACCOUNT_KEY))

export function sessionOwnsCodelabData() {
  const owner = rawLocal.get(OWNER_KEY)
  return !codelabDataLocked() && (owner === null || owner === rawLocal.get(SESSION_ACCOUNT_KEY))
}
