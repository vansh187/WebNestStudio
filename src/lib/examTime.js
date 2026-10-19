// Time helpers for the final exam. The server owns the clock: the page counts down to the
// server's expires_at, shifted by how far this browser's clock is from the server's.

// Milliseconds to add to Date.now() to get the server's time.
export function clockOffset(serverNow) {
  const server = Date.parse(serverNow)
  return Number.isFinite(server) ? server - Date.now() : 0
}

export function msLeft(expiresAt, offset = 0) {
  const end = Date.parse(expiresAt)
  return Number.isFinite(end) ? Math.max(0, end - (Date.now() + offset)) : 0
}

// 3599000 -> "59:59"; an hour or more -> "1:00:00".
export function formatClock(ms) {
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// "in 5 hours", "in 12 minutes", for retake waits.
export function formatWait(until) {
  const ms = Date.parse(until) - Date.now()
  if (!Number.isFinite(ms) || ms <= 0) return 'now'
  const minutes = Math.ceil(ms / 60000)
  if (minutes < 60) return `in ${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = Math.round(minutes / 60)
  return `in ${hours} hour${hours === 1 ? '' : 's'}`
}

// Why a learner cannot start the exam right now, from the server's exam view. Shared by the
// course page card and the exam page so both always say the same thing.
export function examLockedMessage(exam) {
  if (!exam?.enabled) return 'The final exam for this course is being prepared. Check back soon.'
  if (exam.cooldown_until) {
    const wait = formatWait(exam.cooldown_until)
    return wait === 'now'
      ? 'Your retake wait is over. Refresh the page to start again with a new set of questions.'
      : `You can retake the exam ${wait}, with a new set of questions.`
  }
  const remaining = Number(exam.lessons_remaining) || 0
  if (remaining > 0) return `Complete ${remaining} more lesson${remaining === 1 ? '' : 's'} to unlock the final exam.`
  return 'The final exam is not available right now. Please check back later.'
}

export function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}
