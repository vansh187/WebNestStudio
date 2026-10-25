import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAward, FiClock, FiLock, FiPlay, FiRefreshCw } from 'react-icons/fi'
import { examLockedMessage } from '../lib/examTime'

// Last step of a course: the timed final exam and its certificate. The server decides
// everything shown here (COURSE_EXAMS_CERTIFICATES.md); the card stays hidden until the
// server reports the course's exam as enabled, so it can ship before the backend does.
// `exam`, `syncFailed` and `onRetry` come from useCourseExam on the course page.
export default function CourseExamCard({ course, isAuthenticated, exam, syncFailed, onRetry }) {
  const [retrying, setRetrying] = useState(false)

  // Hidden while the exam is off, unless the learner already passed: then the certificate
  // stays reachable here, matching the roadmap's "Certificate earned".
  if (!exam?.enabled && !exam?.passed) return null

  const examPath = `/learn/${course.slug}/exam`
  const rules = `${exam.question_count ?? 30} questions · ${exam.duration_minutes ?? 60} minutes · pass at ${exam.pass_percent ?? 70}%`
  let icon = FiLock
  let message
  let action = null
  let canRetry = false

  // An attempt the server already started can always be finished. Otherwise passed is final
  // (useCourseExam also counts a valid certificate in the learner's list), so a passed course
  // never offers Start again.
  if (isAuthenticated && exam.active_attempt_id) {
    icon = FiClock
    message = 'Your exam is in progress. The timer keeps running while you are away.'
    action = { to: examPath, label: 'Resume exam' }
  } else if (exam.passed && exam.certificate_id) {
    icon = FiAward
    message = 'You passed the final exam. Your certificate is ready to view and share.'
    action = { to: `/certificates/${exam.certificate_id}`, label: 'View certificate' }
  } else if (exam.passed) {
    icon = FiAward
    message = "You passed the final exam, so it can't be taken again. Your certificate isn't showing yet. Try again in a moment."
    canRetry = true
  } else if (!isAuthenticated) {
    message = 'Log in and complete every lesson to unlock the final exam.'
    action = { to: '/login', state: { from: { pathname: `/learn/${course.slug}` } }, label: 'Log in' }
  } else if (exam.eligible) {
    icon = FiPlay
    message = 'You have completed every lesson. Pass the exam to earn your certificate.'
    action = { to: examPath, label: 'Start final exam' }
  } else {
    if (exam.cooldown_until) icon = FiClock
    message = examLockedMessage(exam, { syncFailed })
    canRetry = syncFailed && Number(exam.lessons_remaining) > 0
  }

  const retry = async () => {
    setRetrying(true)
    try {
      await onRetry?.()
    } finally {
      setRetrying(false)
    }
  }

  const Icon = icon
  return (
    <section aria-labelledby="course-exam" className="mt-8 rounded-2xl border border-gold-400/40 bg-gold-400/5 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400 text-ink-950"><Icon className="h-5 w-5" /></span>
          <div>
            <h2 id="course-exam" className="font-display text-lg font-bold text-ink-900 dark:text-white">Final exam and certificate</h2>
            <p className="text-xs font-semibold text-ink-500 dark:text-ink-300">{rules}</p>
            <p className="mt-1 text-sm text-ink-700 dark:text-ink-200">{message}</p>
          </div>
        </div>
        {action && (
          <Link to={action.to} state={action.state} className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink-900 px-5 py-3 text-sm font-semibold text-white dark:bg-gold-400 dark:text-ink-950">
            {action.label}
          </Link>
        )}
        {canRetry && (
          <button type="button" onClick={retry} disabled={retrying} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-ink-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-gold-400 dark:text-ink-950">
            <FiRefreshCw className={retrying ? 'animate-spin' : ''} /> Try again
          </button>
        )}
      </div>
    </section>
  )
}
