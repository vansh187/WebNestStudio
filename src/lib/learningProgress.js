import { SAMPLE_COURSES } from '../data/codelabDefaults'
import { readUserNotes, writeUserNotes } from './lessonNotes'

const STORAGE_PREFIX = 'wns-learning-progress'

// Before progress/notes were namespaced per user, everything lived in one
// shared bucket under this key. Migrated into the first user's per-user
// stores below so nobody's existing data silently disappears.
const LEGACY_PROGRESS_KEY = 'wns-static-learning-progress'

function storageKey(userKey) {
  return `${STORAGE_PREFIX}:${userKey}`
}

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
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
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
  return progress[lessonId] || { status: 'not_started', completed_percent: 0, bookmarked: false }
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
