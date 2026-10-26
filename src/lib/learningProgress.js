import { SAMPLE_COURSES, canonicalLessonId } from '../data/codelabDefaults.js'
import { readUserNotes, writeUserNotes } from './lessonNotes.js'

const STORAGE_PREFIX = 'wns-learning-progress'

// Before progress/notes were namespaced per user, everything lived in one
// shared bucket under this key. Migrated into the first user's per-user
// stores below so nobody's existing data silently disappears.
const LEGACY_PROGRESS_KEY = 'wns-static-learning-progress'

function storageKey(userKey) {
  return `${STORAGE_PREFIX}:${userKey}`
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const DEFAULT_LESSON_PROGRESS = { status: 'not_started', completed_percent: 0, bookmarked: false }

function migrateLegacyData(userKey) {
  let legacy
  try {
    legacy = JSON.parse(localStorage.getItem(LEGACY_PROGRESS_KEY) || 'null')
  } catch {
    legacy = null
  }
  if (!legacy || typeof legacy !== 'object') return

  const progress = {}
  const notesByLesson = {}
  for (const [lessonId, entry] of Object.entries(legacy)) {
    if (!entry || typeof entry !== 'object') continue
    progress[lessonId] = {
      status: entry.status || 'not_started',
      completed_percent: entry.completed_percent || 0,
      bookmarked: Boolean(entry.bookmarked),
    }
    if (entry.note) {
      notesByLesson[lessonId] = [{ id: `legacy-${lessonId}`, text: entry.note, createdAt: new Date().toISOString() }]
    }
  }

  let existingProgress
  try {
    existingProgress = JSON.parse(localStorage.getItem(storageKey(userKey)) || '{}')
  } catch {
    existingProgress = {}
  }
  if (!isPlainObject(existingProgress)) existingProgress = {}
  // Runs inside readLearningProgress (often during render), so it writes without notifying.
  const progressSaved = persistProgress(userKey, { ...progress, ...existingProgress })
  const existingNotes = readUserNotes(userKey)
  const notesSaved = writeUserNotes(userKey, { ...notesByLesson, ...existingNotes })

  // Only the first user to load the app after this migration inherits the
  // old shared data; remove it so it can't also leak into a second account.
  // If either write failed (storage full/unavailable) leave the legacy key
  // in place so migration can be retried on the next load instead of losing
  // the data for good.
  if (progressSaved && notesSaved) {
    localStorage.removeItem(LEGACY_PROGRESS_KEY)
  }
}

// Per-lesson progress (status/bookmark) is namespaced per signed-in user (by
// email) so different accounts on the same browser never see each other's
// progress.
export function readLearningProgress(userKey) {
  if (!userKey) return {}
  migrateLegacyData(userKey)
  let stored
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(userKey)) || '{}')
    stored = isPlainObject(parsed) ? canonicalizeProgress(parsed) : {}
  } catch {
    stored = {}
  }
  return applyUnsavedProgress(userKey, stored)
}

// Server progress that could not be written (storage full or unavailable) is kept here for this
// session, so pages still show it. It only ever raises a lesson's status or percent. It is
// dropped as soon as a write succeeds, because writers save what readLearningProgress returned.
const unsavedProgress = new Map()

function applyUnsavedProgress(userKey, stored) {
  const unsaved = unsavedProgress.get(userKey)
  if (!unsaved) return stored
  const result = { ...stored }
  for (const [id, entry] of Object.entries(unsaved)) result[id] = mergeLessonEntry(result[id], entry)
  return result
}

// Old URLs (e.g. Advanced Java's merged Spring lessons) are aliases of a lesson in another
// course. Progress saved under an alias key is folded into the real lesson id, so it counts
// on the roadmap and is sent to the server under an id the course outline knows. The next
// write stores only canonical keys.
function canonicalizeProgress(progress) {
  const result = {}
  for (const [id, entry] of Object.entries(progress)) {
    if (!isPlainObject(entry)) continue
    const key = canonicalLessonId(id)
    const existing = result[key]
    if (!existing) {
      result[key] = entry
      continue
    }
    const completed = existing.status === 'completed' || entry.status === 'completed'
    result[key] = {
      ...existing,
      ...entry,
      status: completed ? 'completed' : (existing.status === 'in_progress' || entry.status === 'in_progress' ? 'in_progress' : (entry.status || existing.status)),
      completed_percent: Math.max(Number(existing.completed_percent) || 0, Number(entry.completed_percent) || 0),
      bookmarked: Boolean(existing.bookmarked || entry.bookmarked),
    }
  }
  return result
}

function persistProgress(userKey, progress) {
  if (!userKey) return false
  try {
    localStorage.setItem(storageKey(userKey), JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

// Returns false when the write couldn't be persisted (storage full, disabled,
// or unavailable in private browsing) so callers can warn instead of
// pretending the save succeeded. A saved write tells open pages to re-read.
export function writeLearningProgress(userKey, progress) {
  if (!persistProgress(userKey, progress)) return false
  unsavedProgress.delete(userKey)
  notifyProgressChanged(userKey)
  return true
}

export function getLessonProgress(progress, lessonId) {
  const entry = progress?.[lessonId]
  return isPlainObject(entry) ? { ...DEFAULT_LESSON_PROGRESS, ...entry } : DEFAULT_LESSON_PROGRESS
}

export function getCourseProgress(progress, course) {
  const lessons = course.modules.flatMap((module) => (Array.isArray(module.lessons) ? module.lessons : []))
  const total = lessons.length
  const completed = lessons.filter((lesson) => progress[lesson.id]?.status === 'completed').length
  const bookmarked = lessons.filter((lesson) => progress[lesson.id]?.bookmarked).length
  const percent = total ? Math.round((completed / total) * 100) : 0
  return { total, completed, bookmarked, percent }
}

// One entry per course the user has touched (completed or bookmarked at least one lesson),
// or holds a certificate for, for the "My Learning" dashboard summary. Lesson ticks live in
// this browser, so a certified course (`certified`: a Set of course slugs) is shown as done
// even when this browser has fewer ticks, e.g. after studying elsewhere or new lessons.
export function getStartedCoursesProgress(progress, certified = new Set()) {
  return SAMPLE_COURSES
    .map((course) => ({ course, ...certifiedProgress(getCourseProgress(progress, course), certified.has(course.slug)), certified: certified.has(course.slug) }))
    .filter((entry) => entry.completed > 0 || entry.bookmarked > 0 || entry.certified)
    .sort((a, b) => Number(b.certified) - Number(a.certified) || b.percent - a.percent)
}

// A certificate needs every lesson completed on the server, so a certified course counts all
// its lessons as done, keeping lesson and course totals consistent.
function certifiedProgress(stats, isCertified) {
  return isCertified ? { ...stats, completed: stats.total, percent: stats.total ? 100 : stats.percent } : stats
}

export function getLearningTotals(progress, certified = new Set()) {
  return SAMPLE_COURSES.reduce((totals, course) => {
    const stats = certifiedProgress(getCourseProgress(progress, course), certified.has(course.slug))
    const isComplete = certified.has(course.slug) || (stats.total > 0 && stats.completed === stats.total)
    const isInProgress = stats.completed > 0 && !isComplete
    return {
      lessonsTotal: totals.lessonsTotal + stats.total,
      lessonsCompleted: totals.lessonsCompleted + stats.completed,
      coursesCompleted: totals.coursesCompleted + (isComplete ? 1 : 0),
      coursesInProgress: totals.coursesInProgress + (isInProgress ? 1 : 0),
    }
  }, { lessonsTotal: 0, lessonsCompleted: 0, coursesCompleted: 0, coursesInProgress: 0 })
}

// --- Server sync -------------------------------------------------------------------------
// The final exam needs every lesson of the course completed on the server, but progress is
// recorded in this browser first. Lessons the server has accepted are remembered per user
// so each one is sent once (see COURSE_EXAMS_CERTIFICATES.md).
const SYNCED_PREFIX = 'wns-learning-synced'

function readSynced(userKey) {
  try {
    const parsed = JSON.parse(localStorage.getItem(`${SYNCED_PREFIX}:${userKey}`) || '[]')
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

export function markLessonsSynced(userKey, lessonIds) {
  if (!userKey || !lessonIds.length) return
  const synced = readSynced(userKey)
  lessonIds.forEach((id) => synced.add(id))
  try {
    localStorage.setItem(`${SYNCED_PREFIX}:${userKey}`, JSON.stringify([...synced]))
  } catch {
    /* Storage full: the lessons are sent again next time, which the server accepts. */
  }
}

// Completed lessons the server has not accepted yet, as bulk-progress entries.
export function unsyncedCompletions(userKey) {
  if (!userKey) return []
  const synced = readSynced(userKey)
  return Object.entries(readLearningProgress(userKey))
    .filter(([id, entry]) => entry?.status === 'completed' && !synced.has(id))
    .map(([id]) => ({ lesson_id: id, status: 'completed', completed_percent: 100 }))
}

// One in-flight sync per user, so pages that mount together (or effects that run twice) never
// send the same lessons twice at once. A caller that arrives while one is running waits for it,
// then sends whatever is still unsynced (lessons completed meanwhile, here or in another tab,
// and anything the first sync could not send), so its result covers every completion so far.
const inFlight = new Map()

// The server accepts at most this many lessons per bulk request.
const SYNC_BATCH = 500

// Sends unsynced completions in batches of SYNC_BATCH. `send` is the API call
// (bulkUpdateProgress), passed in so this module stays free of network code. Resolves true
// when the server accepted everything; each accepted batch is remembered even if a later one
// fails. Lessons the server reports as `unknown` (for example before the course catalog has
// been uploaded) are not remembered, so they are sent again on a later visit.
export function syncLocalProgress(userKey, send) {
  if (!userKey) return Promise.resolve(true)
  if (inFlight.has(userKey)) {
    // The running sync's result is not reused: this call re-reads what is still unsynced, so
    // a failure or an `unknown` lesson from that sync is reported here too.
    return inFlight.get(userKey).then(() => syncLocalProgress(userKey, send))
  }
  const pending = unsyncedCompletions(userKey)
  if (!pending.length) return Promise.resolve(true)
  const request = (async () => {
    let allAccepted = true
    for (let start = 0; start < pending.length; start += SYNC_BATCH) {
      const batch = pending.slice(start, start + SYNC_BATCH)
      const response = await send(batch)
      const unknown = new Set(Array.isArray(response?.unknown) ? response.unknown.map(String) : [])
      if (unknown.size) allAccepted = false
      markLessonsSynced(userKey, batch.map((item) => item.lesson_id).filter((id) => !unknown.has(id)))
    }
    return allAccepted
  })()
    .catch(() => false)
    .finally(() => inFlight.delete(userKey))
  inFlight.set(userKey, request)
  return request
}

// --- Server pull -------------------------------------------------------------------------
// Completions are saved on the server, but pages render from this browser's store. After a
// login, the server's progress is merged in, so ticks follow the account to another browser,
// a private window or cleared site data (LESSON_PROGRESS_SYNC_FRONTEND.md). Local data is
// never downgraded by the merge.
const PULLED_PREFIX = 'wns-learning-pulled'
export const PROGRESS_CHANGED_EVENT = 'wns-learning-progress-changed'

const STATUS_RANK = { not_started: 0, in_progress: 1, completed: 2 }
const rankOf = (status) => STATUS_RANK[status] ?? 0

// A lesson's local entry with a server entry folded in. Status and percent only ever go up;
// the bookmark stays local.
function mergeLessonEntry(mine, theirs) {
  const local = isPlainObject(mine) ? mine : DEFAULT_LESSON_PROGRESS
  const status = rankOf(theirs.status) > rankOf(local.status) ? theirs.status : (local.status || 'not_started')
  return {
    ...DEFAULT_LESSON_PROGRESS,
    ...local,
    status,
    completed_percent: Math.min(100, Math.max(Number(local.completed_percent) || 0, Number(theirs.completed_percent) || 0, status === 'completed' ? 100 : 0)),
    bookmarked: Boolean(local.bookmarked),
  }
}

function sameEntry(a, b) {
  return isPlainObject(a) && a.status === b.status && Number(a.completed_percent) === b.completed_percent && Boolean(a.bookmarked) === b.bookmarked
}

// Folds the server's lessons into the local store. Writes (and notifies) only when something
// changed. Lessons the server reports as completed are marked synced only once they are saved in
// this browser. If the write fails, the merge is kept in memory for this session. Returns
// { progress, changed, saved }.
function foldServerLessons(userKey, serverLessons) {
  const local = readLearningProgress(userKey)
  const merged = { ...local }
  const completedIds = new Set()
  let changed = false
  for (const entry of Array.isArray(serverLessons) ? serverLessons : []) {
    if (!isPlainObject(entry) || typeof entry.key !== 'string' || !entry.key) continue
    // not_started is an un-mark in a `since` pull. It is ignored: a completion stays ticked.
    if (entry.status !== 'in_progress' && entry.status !== 'completed') continue
    const id = canonicalLessonId(entry.key)
    const next = mergeLessonEntry(merged[id], entry)
    if (!sameEntry(merged[id], next)) {
      merged[id] = next
      changed = true
    }
    if (entry.status === 'completed') completedIds.add(id)
  }
  if (!changed) {
    // Nothing new. Lessons still waiting in memory (an earlier failed write) are not saved yet.
    const saved = !unsavedProgress.has(userKey)
    if (saved) markLessonsSynced(userKey, [...completedIds])
    return { progress: local, changed: false, saved }
  }
  const saved = writeLearningProgress(userKey, merged)
  if (saved) {
    markLessonsSynced(userKey, [...completedIds])
  } else {
    unsavedProgress.set(userKey, merged)
    notifyProgressChanged(userKey)
  }
  return { progress: merged, changed: true, saved }
}

// Merges the server's lessons (GET /api/learning/progress `lessons`) into the local store and
// returns the merged object (see foldServerLessons).
export function mergeServerProgress(userKey, serverLessons) {
  if (!userKey) return {}
  return foldServerLessons(userKey, serverLessons).progress
}

function readPulledAt(userKey) {
  try {
    return localStorage.getItem(`${PULLED_PREFIX}:${userKey}`) || null
  } catch {
    return null
  }
}

// Stores the server_time of a complete, saved pull, so the next refresh asks only for later
// changes. Otherwise forgets it, so the next pull is a full one.
function writePulledAt(userKey, serverTime, complete) {
  try {
    if (!complete || typeof serverTime !== 'string' || !serverTime) localStorage.removeItem(`${PULLED_PREFIX}:${userKey}`)
    else localStorage.setItem(`${PULLED_PREFIX}:${userKey}`, serverTime)
  } catch {
    /* Storage full: the next refresh downloads everything again, which is only slower. */
  }
}

// Tells pages that read progress (useLearningProgress) to re-read it.
export function notifyProgressChanged(userKey) {
  try {
    window.dispatchEvent(new CustomEvent(PROGRESS_CHANGED_EVENT, { detail: { userKey } }))
  } catch {
    /* No window (tests): nothing to notify. */
  }
}

// Calls `onChange` when this user's progress changes: a write or a server pull in this tab, or a
// write in another tab (the browser's `storage` event). Returns the unsubscribe function.
export function subscribeProgressChanges(userKey, onChange) {
  if (!userKey || typeof window === 'undefined') return () => {}
  const onLocal = (event) => {
    if (event?.detail?.userKey === userKey) onChange()
  }
  // `key` is null when another tab cleared all storage.
  const onStorage = (event) => {
    if (event?.key === null || event?.key === storageKey(userKey)) onChange()
  }
  window.addEventListener(PROGRESS_CHANGED_EVENT, onLocal)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(PROGRESS_CHANGED_EVENT, onLocal)
    window.removeEventListener('storage', onStorage)
  }
}

class SignedOutError extends Error {}

// One pull of the server's progress. A truncated response means the account has more rows than
// one response holds, so the rest is fetched course by course (the contract's `course_slug`
// filter). `complete` is false when any part is still missing.
async function fetchServerProgress(api, since, ensureCurrent) {
  const base = since ? { since } : {}
  const first = await api.fetchProgress(since ? base : undefined)
  if (first?.truncated !== true) return { lessons: first?.lessons, serverTime: first?.server_time, complete: true }
  const lessons = Array.isArray(first.lessons) ? [...first.lessons] : []
  let complete = true
  for (const course of SAMPLE_COURSES) {
    ensureCurrent()
    try {
      const page = await api.fetchProgress({ ...base, course_slug: course.slug })
      if (Array.isArray(page?.lessons)) lessons.push(...page.lessons)
      if (page?.truncated === true) complete = false
    } catch (error) {
      // 404: the server doesn't know this course yet, so it holds no rows for it.
      if (error?.response?.status !== 404) complete = false
    }
  }
  return { lessons, serverTime: first.server_time, complete }
}

const pullsInFlight = new Map()

// Uploads this browser's unsynced completions first (so the server holds the union), then
// downloads the server's progress and merges it in. `api` carries the network calls and the
// session ({ upload: bulkUpdateProgress, fetchProgress: getMyProgress, currentUserKey }), so this
// module stays free of network code. `incremental` asks only for rows changed since the last
// complete pull. One pull per user at a time; a full pull asked for while an incremental one
// runs waits for it and then runs. Never throws: on any failure the local data stays as it is.
// Resolves true when the server's progress was merged.
export function hydrateProgressFromServer(userKey, api, { incremental = false } = {}) {
  if (!userKey || !api?.fetchProgress) return Promise.resolve(false)
  const running = pullsInFlight.get(userKey)
  if (running) {
    if (running.incremental && !incremental) return running.request.then(() => hydrateProgressFromServer(userKey, api))
    return running.request
  }
  // The session can change while the pull waits on the network (sign out, or another account
  // signs in). Nothing is sent, merged or stored for an account that is no longer signed in.
  const isCurrent = () => !api.currentUserKey || api.currentUserKey() === userKey
  const ensureCurrent = () => {
    if (!isCurrent()) throw new SignedOutError()
  }
  const request = (async () => {
    try {
      ensureCurrent()
      if (api.upload) {
        await syncLocalProgress(userKey, (batch) => (isCurrent() ? api.upload(batch) : Promise.reject(new SignedOutError())))
        ensureCurrent()
      }
      const since = incremental ? readPulledAt(userKey) : null
      const result = await fetchServerProgress(api, since, ensureCurrent)
      ensureCurrent()
      const { saved } = foldServerLessons(userKey, result.lessons)
      writePulledAt(userKey, result.serverTime, saved && result.complete)
      return true
    } catch (error) {
      // 422: the server rejected the stored `since`. Forget it so the next pull is a full one.
      if (error?.response?.status === 422) writePulledAt(userKey, null, false)
      return false
    }
  })().finally(() => pullsInFlight.delete(userKey))
  pullsInFlight.set(userKey, { request, incremental })
  return request
}

// When useServerProgressSync pulls: `pull()` at login, `refresh()` on tab focus. A refresh is
// incremental once a full pull has succeeded. After a successful pull the next refresh waits
// `refreshMs`; after a failed one only `retryMs`, so a server that was asleep is retried soon.
export function createProgressRefresher(userKey, api, { refreshMs = 5 * 60 * 1000, retryMs = 30 * 1000, now = Date.now } = {}) {
  let nextAt = 0
  let fullDone = false
  const run = (incremental) => {
    nextAt = now() + retryMs
    return hydrateProgressFromServer(userKey, api, { incremental }).then((ok) => {
      if (ok && !incremental) fullDone = true
      nextAt = now() + (ok ? refreshMs : retryMs)
      return ok
    })
  }
  return {
    pull: () => run(false),
    refresh: () => (now() < nextAt ? Promise.resolve(false) : run(fullDone)),
  }
}
