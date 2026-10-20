import { useCallback, useEffect, useRef, useState } from 'react'
import { bulkUpdateProgress, getCourseExam } from '../api/learning'
import { syncLocalProgress } from '../lib/learningProgress'

// The server's final-exam view for a course (COURSE_EXAMS_CERTIFICATES.md §5), fetched once
// per course page and shared by the roadmap's finish line and the exam card. Lessons completed
// in this browser are sent first so eligibility counts them.
//
// Returns { exam, syncFailed, reload }: `exam` is null while loading or when the server cannot
// be reached (the exam then stays hidden), and `syncFailed` is true when some local
// completions could not be sent, so the server's lesson count may be behind.
export function useCourseExam(courseSlug, userKey, isAuthenticated) {
  const [state, setState] = useState({ exam: null, syncFailed: false })
  const seq = useRef(0)

  const reload = useCallback(async () => {
    const current = ++seq.current
    if (!courseSlug) return
    const synced = isAuthenticated ? await syncLocalProgress(userKey, bulkUpdateProgress) : true
    let exam = null
    try {
      exam = await getCourseExam(courseSlug)
    } catch {
      exam = null
    }
    // Only the newest request may update the page (course or user changed meanwhile).
    if (current === seq.current) setState({ exam: exam ?? null, syncFailed: !synced })
  }, [courseSlug, userKey, isAuthenticated])

  useEffect(() => {
    setState({ exam: null, syncFailed: false })
    reload()
    // Invalidate the in-flight request when the course or user changes or the page unmounts.
    return () => { seq.current += 1 }
  }, [reload])

  return { ...state, reload }
}
