const NOTES_KEY_PREFIX = 'wns-lesson-notes'

function storageKey(userKey) {
  return `${NOTES_KEY_PREFIX}:${userKey}`
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

// Notes are namespaced per signed-in user (by email) so that different
// accounts on the same browser never see each other's notes.
export function readUserNotes(userKey) {
  if (!userKey) return {}
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(userKey)) || '{}')
    return isPlainObject(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

// Notes for one lesson, cleaned up so data saved by older versions (a plain
// string) or damaged entries can never crash the lesson page.
export function readLessonNotes(userKey, lessonId) {
  const stored = readUserNotes(userKey)[lessonId]
  if (typeof stored === 'string') {
    return stored.trim() ? [{ id: `legacy-${lessonId}`, text: stored, createdAt: null }] : []
  }
  if (!Array.isArray(stored)) return []
  const seenIds = new Set()
  return stored
    .filter((note) => isPlainObject(note) && ['string', 'number'].includes(typeof note.text))
    .map((note, index) => {
      let id = typeof note.id === 'string' && note.id ? note.id : `note-${index}`
      if (seenIds.has(id)) id = `${id}-${index}`
      seenIds.add(id)
      return { id, text: String(note.text), createdAt: typeof note.createdAt === 'string' ? note.createdAt : null }
    })
}

// Human-readable save time, or '' when the stored date is missing or invalid.
export function noteDateLabel(createdAt) {
  const date = new Date(createdAt)
  return createdAt && !Number.isNaN(date.getTime()) ? date.toLocaleString() : ''
}

// Returns false when the write couldn't be persisted (storage full, disabled,
// or unavailable in private browsing) so callers can warn instead of
// pretending the save succeeded.
export function writeUserNotes(userKey, notesByLesson) {
  if (!userKey) return false
  try {
    localStorage.setItem(storageKey(userKey), JSON.stringify(notesByLesson))
    return true
  } catch {
    return false
  }
}

let noteIdCounter = 0

// Date.now() alone can collide when two notes are saved within the same
// millisecond; add a monotonic counter plus randomness to keep ids unique.
export function createNoteId() {
  noteIdCounter += 1
  return `${Date.now()}-${noteIdCounter}-${Math.random().toString(36).slice(2, 8)}`
}
