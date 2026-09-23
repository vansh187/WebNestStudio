const NOTES_KEY_PREFIX = 'wns-lesson-notes'

function storageKey(userKey) {
  return `${NOTES_KEY_PREFIX}:${userKey}`
}

// Notes are namespaced per signed-in user (by email) so that different
// accounts on the same browser never see each other's notes.
export function readUserNotes(userKey) {
  if (!userKey) return {}
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
