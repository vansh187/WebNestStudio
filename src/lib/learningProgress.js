import { SAMPLE_COURSES, canonicalLessonId } from '../data/codelabDefaults'
import { readUserNotes, writeUserNotes } from './lessonNotes'

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
  const progressSaved = writeLearningProgress(userKey, { ...progress, ...existingProgress })
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
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(userKey)) || '{}')
    return isPlainObject(parsed) ? canonicalizeProgress(parsed) : {}
  } catch {
    return {}
  }
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

// Returns false when the write couldn't be persisted (storage full, disabled,
// or unavailable in private browsing) so callers can warn instead of
// pretending the save succeeded.
export function writeLearningProgress(userKey, progress) {
  if (!userKey) return false
  try {
    localStorage.setItem(storageKey(userKey), JSON.stringify(progress))
    return true
  } catch {
    return false
  }
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

// One entry per course the user has touched (completed or bookmarked at
// least one lesson), for the "My Learning" dashboard summary.
export function getStartedCoursesProgress(progress) {
  return SAMPLE_COURSES
    .map((course) => ({ course, ...getCourseProgress(progress, course) }))
    .filter((entry) => entry.completed > 0 || entry.bookmarked > 0)
    .sort((a, b) => b.percent - a.percent)
}

export function getLearningTotals(progress) {
  return SAMPLE_COURSES.reduce((totals, course) => {
    const stats = getCourseProgress(progress, course)
    const isComplete = stats.total > 0 && stats.completed === stats.total
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
