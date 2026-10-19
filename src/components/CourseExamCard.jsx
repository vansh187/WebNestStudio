import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAward, FiClock, FiLock, FiPlay } from 'react-icons/fi'
import { bulkUpdateProgress, getCourseExam } from '../api/learning'
import { syncLocalProgress } from '../lib/learningProgress'
import { examLockedMessage } from '../lib/examTime'

// Last step of a course: the timed final exam and its certificate. The server decides
// everything shown here (COURSE_EXAMS_CERTIFICATES.md); the card stays hidden until the
// server reports the course's exam as enabled, so it can ship before the backend does.
export default function CourseExamCard({ course, userKey, isAuthenticated }) {
  const [exam, setExam] = useState(null)

  useEffect(() => {
    let cancelled = false
    setExam(null)
    // Send lessons completed in this browser first, so eligibility counts them.
    const ready = isAuthenticated ? syncLocalProgress(userKey, bulkUpdateProgress) : Promise.resolve()
    ready
      .then(() => getCourseExam(course.slug))
      .then((data) => { if (!cancelled) setExam(data) })
      .catch(() => { if (!cancelled) setExam(null) })
    return () => { cancelled = true }
  }, [course.slug, userKey, isAuthenticated])

  if (!exam?.enabled) return null

  const examPath = `/learn/${course.slug}/exam`
  const rules = `${exam.question_count ?? 30} questions · ${exam.duration_minutes ?? 60} minutes · pass at ${exam.pass_percent ?? 70}%`
  let icon = FiLock
  let message
  let action = null

  if (exam.passed && exam.certificate_id) {
    icon = FiAward
    message = 'You passed the final exam. Your certificate is ready to view and share.'
    action = { to: `/certificates/${exam.certificate_id}`, label: 'View certificate' }
  } else if (!isAuthenticated) {
    message = 'Log in and complete every lesson to unlock the final exam.'
    action = { to: '/login', state: { from: { pathname: `/learn/${course.slug}` } }, label: 'Log in' }
  } else if (exam.active_attempt_id) {
    icon = FiClock
    message = 'Your exam is in progress. The timer keeps running while you are away.'
    action = { to: examPath, label: 'Resume exam' }
  } else if (exam.eligible) {
    icon = FiPlay
    message = 'You have completed every lesson. Pass the exam to earn your certificate.'
    action = { to: examPath, label: 'Start final exam' }
  } else {
    if (exam.cooldown_until) icon = FiClock
    message = examLockedMessage(exam)
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
      </div>
    </section>
  )
}
