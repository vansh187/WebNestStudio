import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { FiAlertTriangle, FiAward, FiCheck, FiChevronLeft, FiChevronRight, FiClock, FiFlag, FiLoader, FiRefreshCw, FiSend } from 'react-icons/fi'
import { SAMPLE_COURSES } from '../../data/codelabDefaults'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useSeo } from '../../hooks/useSeo'
import { useAutosave } from '../../hooks/useAutosave'
import { getErrorDetail } from '../../lib/apiClient'
import { trackEvent } from '../../lib/analytics'
import { clockOffset, examLockedMessage, formatClock, formatWait, msLeft } from '../../lib/examTime'
import { bulkUpdateProgress, getCourseExam, getExamAttempt, isAttemptLost, pingExamAttempt, saveExamAnswers, startExamAttempt, submitExamAttempt } from '../../api/learning'
import { syncLocalProgress } from '../../lib/learningProgress'
import { NotFoundState } from '../../components/states/StateViews'
import { ThemeToggleButton } from '../../components/coding/IdeButtons'
import { useIdeFocus } from '../../hooks/useIdeShell'
import BackButton from '../../components/coding/BackButton'

// Timed final exam for a course (COURSE_EXAMS_CERTIFICATES.md). The server draws the
// questions, owns the clock and grades the attempt; this page shows the questions, counts down
// to the server's expires_at, autosaves answers and submits. It never sees correct answers.

const PRIMARY = 'inline-flex items-center justify-center gap-2 rounded-lg bg-ink-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-gold-400 dark:text-ink-950'
const SECONDARY = 'inline-flex items-center justify-center gap-2 rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:border-gold-400 disabled:opacity-50 dark:border-ink-700 dark:text-ink-200'
const PING_MS = 4 * 60 * 1000
const LOST_NOTICE = 'A server problem interrupted your exam, so it has been reset. It does not count as an attempt: start again for a new set of questions and the full time.'
const WARNINGS = [[10 * 60 * 1000, '10 minutes left.'], [60 * 1000, '1 minute left. Your answers are submitted automatically when time runs out.']]

// Question text is Markdown (inline code and code blocks); raw HTML is not rendered.
function Rich({ children, inline = false }) {
  return (
    <ReactMarkdown
      components={inline ? { p: ({ children: content }) => <>{content}</> } : undefined}
    >
      {children || ''}
    </ReactMarkdown>
  )
}

export default function CourseExam() {
  const { courseSlug } = useParams()
  const course = SAMPLE_COURSES.find((item) => item.slug === courseSlug)
  const { user, isAuthenticated } = useAuth()
  const userKey = user?.email || null
  const [state, setState] = useState({ phase: 'loading' })

  useSeo({ title: course ? `${course.title} final exam` : 'Final exam', path: `/learn/${courseSlug}/exam`, noindex: true })

  const load = useCallback(async (noticeArg) => {
    // Only a string is a notice; anything else (e.g. a click event) is ignored.
    const notice = typeof noticeArg === 'string' ? noticeArg : undefined
    setState({ phase: 'loading' })
    try {
      // Send lessons completed in this browser first, so the server counts them. If some could
      // not be sent, the locked message says so and offers a retry.
      const synced = isAuthenticated ? await syncLocalProgress(userKey, bulkUpdateProgress) : true
      const syncFailed = !synced
      const NOT_AVAILABLE = { enabled: false, eligible: false, reasons: ['exam_disabled'] }
      const exam = (await getCourseExam(courseSlug).catch((err) => {
        // The course isn't on the server yet: show "not available" rather than an error.
        if (err.response?.status === 404) return NOT_AVAILABLE
        throw err
      })) || NOT_AVAILABLE
      if (exam?.active_attempt_id) {
        const attempt = await getExamAttempt(exam.active_attempt_id).catch((err) => {
          // The attempt record is gone (404/410): fall back to the intro, which can start fresh.
          if (err.response?.status === 404 || err.response?.status === 410) return null
          throw err
        })
        if (!attempt) {
          setState({ phase: 'intro', exam: { ...exam, active_attempt_id: null }, notice, syncFailed })
        } else if (attempt.status === 'active') {
          if (!Array.isArray(attempt.questions) || !attempt.questions.length) throw new Error('Your exam questions could not be loaded. Please try again.')
          setState({ phase: 'running', exam, attempt })
        } else {
          setState({ phase: 'result', exam, result: attempt.result })
        }
      } else {
        setState({ phase: 'intro', exam, notice, syncFailed })
      }
    } catch (err) {
      // The active attempt was lost on the server: reload the exam view, which now allows a
      // fresh start.
      if (isAttemptLost(err) && !notice) {
        load(LOST_NOTICE)
        return
      }
      setState({ phase: 'error', message: getErrorDetail(err, 'Could not load the final exam.') })
    }
  }, [courseSlug, isAuthenticated, userKey])

  useEffect(() => { load() }, [load])
  const handleLost = useCallback(() => load(LOST_NOTICE), [load])

  if (!course) return <NotFoundState title="Course not found" backTo="/learn" backLabel="Back to courses" />

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {state.phase !== 'running' && <BackButton fallback={`/learn/${course.slug}`} label="Back to course" />}
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold-500">Final exam</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">{course.title}</h1>

      {state.phase === 'loading' && <div className="mt-10 flex justify-center"><FiLoader className="h-6 w-6 animate-spin text-gold-500" /></div>}
      {state.phase === 'error' && (
        <div role="alert" className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <p>{state.message}</p>
          <button type="button" onClick={() => load()} className={`${SECONDARY} mt-3`}>Try again</button>
        </div>
      )}
      {state.phase === 'intro' && state.notice && (
        <div role="alert" className="mt-6 flex items-start gap-2 rounded-xl border border-amber-400/50 bg-amber-400/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {state.notice}
        </div>
      )}
      {state.phase === 'intro' && (
        <ExamIntro course={course} exam={state.exam} syncFailed={state.syncFailed} onRetry={() => load()} onStarted={(attempt) => setState({ phase: 'running', exam: state.exam, attempt })} />
      )}
      {state.phase === 'running' && (
        <ExamRunner
          course={course}
          attempt={state.attempt}
          onFinished={(result) => setState({ phase: 'result', exam: state.exam, result })}
          onLost={handleLost}
        />
      )}
      {state.phase === 'result' && <ExamResult course={course} result={state.result} />}
    </div>
  )
}

function ExamIntro({ course, exam, syncFailed, onRetry, onStarted }) {
  const { user } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(user?.full_name || user?.name || '')
  const [agreed, setAgreed] = useState(false)
  const [starting, setStarting] = useState(false)

  if (exam.passed && exam.certificate_id) {
    return (
      <Panel>
        <p className="text-ink-700 dark:text-ink-200">You have already passed this exam.</p>
        <Link to={`/certificates/${exam.certificate_id}`} className={`${PRIMARY} mt-4`}><FiAward /> View certificate</Link>
      </Panel>
    )
  }
  if (exam.enabled && !user) {
    return (
      <Panel>
        <p className="text-ink-700 dark:text-ink-200">Log in to take the final exam and earn your certificate.</p>
        <Link to="/login" state={{ from: { pathname: `/learn/${course.slug}/exam` } }} className={`${PRIMARY} mt-4`}>Log in</Link>
      </Panel>
    )
  }
  if (!exam.enabled || !exam.eligible) {
    return (
      <Panel>
        <p className="text-ink-700 dark:text-ink-200">{examLockedMessage(exam, { syncFailed })}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {syncFailed && exam.enabled && Number(exam.lessons_remaining) > 0 && (
            <button type="button" onClick={onRetry} className={PRIMARY}><FiRefreshCw /> Try again</button>
          )}
          <Link to={`/learn/${course.slug}`} className={SECONDARY}>Back to course</Link>
        </div>
      </Panel>
    )
  }

  const trimmed = name.trim()
  const start = async () => {
    setStarting(true)
    try {
      const attempt = await startExamAttempt(course.slug, { recipient_name: trimmed })
      trackEvent('course_exam_started', { course_slug: course.slug })
      onStarted({ ...attempt, status: 'active', answers: attempt.answers ?? [] })
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not start the exam. Please try again.'))
      setStarting(false)
    }
  }

  return (
    <Panel>
      <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Before you start</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-700 dark:text-ink-200">
        <li>{exam.question_count ?? 30} multiple-choice questions from every module of the course, one correct answer each.</li>
        <li>You have {exam.duration_minutes ?? 60} minutes. The timer starts now and keeps running if you leave or refresh the page.</li>
        <li>Your answers are saved as you go. When time runs out, the exam is submitted automatically. Unanswered questions count as wrong.</li>
        <li>Pass with {exam.pass_percent ?? 70}% or more to earn your certificate. If you do not pass, you can retake it after 24 hours with new questions.</li>
      </ul>
      <label htmlFor="recipient-name" className="mt-5 block text-sm font-semibold text-ink-900 dark:text-white">Name on your certificate</label>
      <input
        id="recipient-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={80}
        autoComplete="name"
        className="mt-1 w-full max-w-md rounded-lg border border-ink-200 bg-transparent px-3 py-2 text-sm focus:border-gold-400 focus:outline-none dark:border-ink-700"
      />
      <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">Printed exactly as typed. It cannot be changed after the certificate is issued.</p>
      <label className="mt-4 flex items-start gap-2 text-sm text-ink-700 dark:text-ink-200">
        <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1" />
        I will answer on my own, without help from other people or AI tools.
      </label>
      <button type="button" onClick={start} disabled={starting || !agreed || trimmed.length < 2} className={`${PRIMARY} mt-5`}>
        {starting ? <FiLoader className="animate-spin" /> : <FiClock />} Start the {exam.duration_minutes ?? 60}-minute exam
      </button>
    </Panel>
  )
}

function ExamRunner({ course, attempt, onFinished, onLost }) {
  const toast = useToast()
  const questions = attempt.questions
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => Object.fromEntries((attempt.answers ?? []).map((item) => [item.question_id, item.option_index])))
  const [flagged, setFlagged] = useState(() => new Set())
  const [tabSwitches, setTabSwitches] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // The server's deadline and this browser's clock offset. Both start from the attempt and are
  // refreshed by every ping, so a sleeping laptop or a corrected system clock cannot leave the
  // countdown out of step with the server.
  const [clock, setClock] = useState(() => ({ expiresAt: attempt.expires_at, offset: clockOffset(attempt.server_now) }))
  const { expiresAt, offset } = clock
  const [remaining, setRemaining] = useState(() => msLeft(expiresAt, offset))
  const finishing = useRef(false)
  const warned = useRef(new Set())
  const autoSubmitted = useRef(false)
  // No floating chat or theme buttons over the exam (the bar has its own theme button).
  const runnerRef = useRef(null)
  useIdeFocus(runnerRef, { scroll: false })

  // Autosave every answer change. A 409 means the server already closed the attempt
  // (time ran out), so stop saving and collect the graded result instead.
  const [closed, setClosed] = useState(false)
  const snapshot = useMemo(() => ({
    answers: Object.entries(answers).map(([question_id, option_index]) => ({ question_id, option_index })),
    tab_switches: tabSwitches,
  }), [answers, tabSwitches])
  const [lost, setLost] = useState(false)
  const save = useCallback((value) => saveExamAnswers(attempt.attempt_id, value).catch((err) => {
    if (isAttemptLost(err)) { setLost(true); return undefined }
    if (err.response?.status === 409) { setClosed(true); return undefined }
    throw err
  }), [attempt.attempt_id])
  const { status: saveStatus, flush } = useAutosave(snapshot, save, { delay: 800, enabled: !closed && !lost })

  // A crash lost this attempt on the server: hand back to the page, which offers a fresh start.
  useEffect(() => { if (lost) onLost() }, [lost, onLost])

  // Keep the server awake for the whole exam, resync the timer, and notice a lost or closed
  // attempt while idle. Also pings as soon as the tab is visible again (after sleep or a
  // switch), when the clock is most likely to have drifted.
  useEffect(() => {
    let cancelled = false
    const ping = () => {
      pingExamAttempt(attempt.attempt_id)
        .then((data) => {
          if (cancelled || !data) return
          if (data.server_now || data.expires_at) {
            setClock((current) => ({
              expiresAt: data.expires_at || current.expiresAt,
              offset: data.server_now ? clockOffset(data.server_now) : current.offset,
            }))
          }
          // The server already graded the attempt (expired, or submitted from another tab):
          // collect the stored result.
          if (data.status && data.status !== 'active') setClosed(true)
        })
        .catch((err) => { if (!cancelled && isAttemptLost(err)) setLost(true) })
    }
    const timer = setInterval(ping, PING_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') ping() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [attempt.attempt_id])

  // A failed save is retried on its own (2 s, 4 s, 8 s, then every 15 s) and as soon as the
  // browser is back online, so "retrying" in the bar is true even if no answer changes.
  const retryCount = useRef(0)
  useEffect(() => {
    if (saveStatus === 'saved') retryCount.current = 0
    if (saveStatus !== 'error' || closed || lost || submitting) return undefined
    const delay = Math.min(2000 * 2 ** retryCount.current, 15000)
    retryCount.current += 1
    const timer = setTimeout(() => { flush() }, delay)
    const onOnline = () => { clearTimeout(timer); flush() }
    window.addEventListener('online', onOnline)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('online', onOnline)
    }
  }, [saveStatus, closed, lost, submitting, flush])

  // The parent passes an inline onFinished; keep it in a ref so `finish` stays stable and the
  // effects below that depend on it do not re-run (and re-submit) on every parent render.
  const onFinishedRef = useRef(onFinished)
  useEffect(() => { onFinishedRef.current = onFinished }, [onFinished])

  const finish = useCallback(async () => {
    if (finishing.current) return
    finishing.current = true
    setSubmitting(true)
    setConfirming(false)
    try {
      // Never submit over unsaved answers while there is still time: the server grades only
      // what it has saved. One quick retry covers a brief network blip. Once time is up the
      // server closes the attempt anyway, so submit with whatever was saved.
      let saved = await flush()
      if (!saved) saved = await flush()
      if (!saved && msLeft(expiresAt, offset) > 0) {
        finishing.current = false
        setSubmitting(false)
        toast.error('Your latest answers could not be saved. Check your connection, then submit again.')
        return
      }
      // Time is up and the newest answers never reached the server: say so rather than let
      // the learner believe they were still being retried.
      if (!saved) toast.error('Time is up. Your most recent answers could not be saved, so they are not included in your score.')
      const result = await submitExamAttempt(attempt.attempt_id)
      trackEvent('course_exam_submitted', { course_slug: course.slug, passed: Boolean(result?.passed) })
      onFinishedRef.current(result)
    } catch (err) {
      if (isAttemptLost(err)) {
        setLost(true)
        return
      }
      // Submitting twice, or after the server auto-graded, returns the stored result; anything
      // else (offline, server asleep) lets the learner try again. The timer keeps the deadline.
      finishing.current = false
      setSubmitting(false)
      toast.error(getErrorDetail(err, 'Could not submit your exam. Check your connection and try again.'))
    }
  }, [flush, attempt.attempt_id, expiresAt, offset, course.slug, toast])

  // The server closed the attempt (409 on save): collect the graded result once. If that
  // fails, the learner retries with the Submit button instead of automatic repeats.
  const closedHandled = useRef(false)
  useEffect(() => {
    if (closed && !closedHandled.current) {
      closedHandled.current = true
      finish()
    }
  }, [closed, finish])

  // Countdown to the server's deadline, with two warnings and an automatic submit at zero.
  useEffect(() => {
    const tick = () => {
      const left = msLeft(expiresAt, offset)
      setRemaining(left)
      for (const [at, message] of WARNINGS) {
        if (left <= at && left > 0 && !warned.current.has(at)) {
          warned.current.add(at)
          toast.info(message)
        }
      }
      // Once: if that submit fails (offline), the learner retries with the Submit button.
      if (left <= 0 && !autoSubmitted.current) {
        autoSubmitted.current = true
        finish()
      }
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [expiresAt, offset, finish, toast])

  // Leaving the tab is counted and stored with the answers (it does not block anything).
  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState === 'hidden') setTabSwitches((count) => count + 1) }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Warn before closing the tab; the attempt continues, but it is easy to lose track of time.
  useEffect(() => {
    const onBeforeUnload = (event) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  // Keep the current question's header clear of the sticky timer bar when it changes.
  const questionRef = useRef(null)
  useEffect(() => {
    const top = questionRef.current?.getBoundingClientRect().top
    if (top !== undefined && (top < 160 || top > window.innerHeight - 200)) {
      questionRef.current.scrollIntoView({ block: 'start' })
    }
  }, [index])

  const question = questions[index]
  const answeredCount = Object.keys(answers).length
  const unanswered = questions.length - answeredCount
  const lowTime = remaining <= 5 * 60 * 1000
  const choose = (optionIndex) => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))
  const toggleFlag = () => setFlagged((current) => {
    const next = new Set(current)
    if (next.has(question.id)) next.delete(question.id)
    else next.add(question.id)
    return next
  })

  return (
    <div ref={runnerRef} className="mt-4">
      <div className="sticky top-[var(--nav-h)] z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white/95 p-3 backdrop-blur dark:border-ink-800 dark:bg-ink-950/95">
        <div role="timer" aria-live="off" className={`inline-flex items-center gap-2 font-mono text-lg font-bold tabular-nums ${lowTime ? 'text-red-600' : 'text-ink-900 dark:text-white'}`}>
          <FiClock className="h-5 w-5" /> {formatClock(remaining)}
        </div>
        <p className="text-sm text-ink-600 dark:text-ink-300">
          {answeredCount} of {questions.length} answered
          <span className="ml-2 text-xs text-ink-400">{saveStatus === 'saving' ? 'Saving…' : saveStatus === 'error' ? 'Not saved — retrying' : saveStatus === 'saved' ? 'Saved' : ''}</span>
        </p>
        <div className="flex items-center gap-2">
          <ThemeToggleButton className={SECONDARY} />
          <button type="button" onClick={() => setConfirming(true)} disabled={submitting} className={PRIMARY}>
            {submitting ? <FiLoader className="animate-spin" /> : <FiSend />} Submit
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <section ref={questionRef} aria-labelledby="exam-question" className="scroll-mt-[calc(var(--nav-h)+5.5rem)] rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900/40">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-ink-500 dark:text-ink-400">
            <span>Question {index + 1} of {questions.length}{question.module_title ? ` · ${question.module_title}` : ''}</span>
            <button type="button" onClick={toggleFlag} aria-pressed={flagged.has(question.id)} className={`inline-flex items-center gap-1 ${flagged.has(question.id) ? 'text-gold-600' : 'hover:text-gold-600'}`}>
              <FiFlag /> {flagged.has(question.id) ? 'Flagged' : 'Flag for review'}
            </button>
          </div>
          <div id="exam-question" className="lesson-article mt-3 text-ink-900 dark:text-white"><Rich>{question.prompt}</Rich></div>
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Answer options</legend>
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === optionIndex
              return (
                <label key={optionIndex} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${selected ? 'border-gold-400 bg-gold-400/10' : 'border-ink-200 hover:border-gold-400/60 dark:border-ink-700'}`}>
                  <input type="radio" name={`q-${question.id}`} checked={selected} onChange={() => choose(optionIndex)} disabled={submitting} className="mt-1" />
                  <span className="min-w-0 text-ink-800 dark:text-ink-100"><Rich inline>{option}</Rich></span>
                </label>
              )
            })}
          </fieldset>
          <div className="mt-5 flex justify-between gap-2">
            <button type="button" onClick={() => setIndex((i) => i - 1)} disabled={index === 0} className={SECONDARY}><FiChevronLeft /> Previous</button>
            <button type="button" onClick={() => setIndex((i) => i + 1)} disabled={index === questions.length - 1} className={SECONDARY}>Next <FiChevronRight /></button>
          </div>
        </section>

        <nav aria-label="Questions" className="rounded-2xl border border-ink-200 p-3 dark:border-ink-800">
          <p className="mb-2 text-xs font-semibold text-ink-500 dark:text-ink-400">Questions</p>
          <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
            {questions.map((item, i) => {
              const done = answers[item.id] !== undefined
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? 'step' : undefined}
                  aria-label={`Question ${i + 1}${done ? ', answered' : ''}${flagged.has(item.id) ? ', flagged' : ''}`}
                  className={`relative h-9 rounded-md text-xs font-semibold ${i === index ? 'ring-2 ring-gold-400' : ''} ${done ? 'bg-ink-900 text-white dark:bg-gold-400 dark:text-ink-950' : 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200'}`}
                >
                  {i + 1}
                  {flagged.has(item.id) && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold-500" />}
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-ink-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="submit-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-ink-900">
            <h2 id="submit-title" className="font-display text-lg font-bold text-ink-900 dark:text-white">Submit your exam?</h2>
            <p className="mt-2 text-sm text-ink-700 dark:text-ink-200">
              {unanswered > 0
                ? <><FiAlertTriangle className="mr-1 inline text-amber-500" />{unanswered} question{unanswered === 1 ? ' is' : 's are'} unanswered and will count as wrong.</>
                : 'You have answered every question.'}
              {flagged.size > 0 && ` ${flagged.size} flagged for review.`} You cannot change answers after submitting.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirming(false)} className={SECONDARY}>Keep working</button>
              <button type="button" onClick={finish} className={PRIMARY}><FiCheck /> Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExamResult({ course, result }) {
  if (!result) {
    return <Panel><p className="text-ink-700 dark:text-ink-200">Your exam has been submitted.</p></Panel>
  }
  return (
    <Panel>
      <div className="flex items-center gap-3">
        <span className={`flex h-12 w-12 items-center justify-center rounded-full ${result.passed ? 'bg-emerald-500 text-white' : 'bg-ink-200 text-ink-700 dark:bg-ink-800 dark:text-ink-200'}`}>
          {result.passed ? <FiAward className="h-6 w-6" /> : <FiClock className="h-6 w-6" />}
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{result.passed ? 'You passed!' : 'Not passed this time'}</h2>
          <p className="text-sm text-ink-600 dark:text-ink-300">Score: {result.score} / {result.total} ({result.percent}%)</p>
        </div>
      </div>
      {result.module_breakdown?.length > 0 && (
        <table className="mt-5 w-full text-left text-sm">
          <thead><tr className="text-xs text-ink-500 dark:text-ink-400"><th className="py-1 font-semibold">Module</th><th className="py-1 text-right font-semibold">Correct</th></tr></thead>
          <tbody>
            {result.module_breakdown.map((row) => (
              <tr key={row.module_title} className="border-t border-ink-100 dark:border-ink-800">
                <td className="py-1.5 text-ink-800 dark:text-ink-100">{row.module_title}</td>
                <td className={`py-1.5 text-right tabular-nums ${row.correct / row.total < 0.7 ? 'text-amber-600' : 'text-ink-700 dark:text-ink-200'}`}>{row.correct} / {row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {result.passed && result.certificate_id ? (
        <Link to={`/certificates/${result.certificate_id}`} className={`${PRIMARY} mt-5`}><FiAward /> View your certificate</Link>
      ) : (
        <p className="mt-5 text-sm text-ink-700 dark:text-ink-200">
          Review the modules marked in amber{result.retake_after ? `, then retake the exam ${formatWait(result.retake_after)} with new questions` : ''}.
          {' '}<Link to={`/learn/${course.slug}`} className="font-semibold text-gold-600 hover:underline">Back to the course</Link>
        </p>
      )}
    </Panel>
  )
}

function Panel({ children }) {
  return <div className="mt-6 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900/40">{children}</div>
}
