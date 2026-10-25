import { useCallback, useEffect, useRef, useState } from 'react'
import { loadExamView } from '../lib/myCertificates'

// The server's final-exam view for a course (COURSE_EXAMS_CERTIFICATES.md §5), fetched once
// per course page and shared by the roadmap's finish line and the exam card. Loaded through
// loadExamView, which sends this browser's completed lessons first and applies the learner's
// certificates (a passed course never offers the exam again).
//
// Returns { exam, syncFailed, reload }: `exam` is null while loading or when the server cannot
// be reached (the exam then stays hidden), and `syncFailed` is true when some local
// completions could not be sent, so the server's lesson count may be behind. `reload` (the
// card's Try again) also refreshes the certificates.
export function useCourseExam(courseSlug, userKey, isAuthenticated) {
  const [state, setState] = useState({ exam: null, syncFailed: false })
  const seq = useRef(0)

  const load = useCallback(async ({ force = false } = {}) => {
    const current = ++seq.current
    if (!courseSlug) return
    let next = { exam: null, syncFailed: false }
    try {
      const { exam, syncFailed } = await loadExamView(courseSlug, { userKey, isAuthenticated, force })
      next = { exam: exam ?? null, syncFailed }
    } catch {
      next = { exam: null, syncFailed: false }
    }
    // Only the newest request may update the page (course or user changed meanwhile).
    if (current === seq.current) setState(next)
  }, [courseSlug, userKey, isAuthenticated])

  useEffect(() => {
    setState({ exam: null, syncFailed: false })
    load()
    // Invalidate the in-flight request when the course or user changes or the page unmounts.
    return () => { seq.current += 1 }
  }, [load])

  const reload = useCallback(() => load({ force: true }), [load])
  return { ...state, reload }
}
