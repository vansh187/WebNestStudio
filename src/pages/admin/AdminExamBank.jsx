import { useCallback, useEffect, useRef, useState } from 'react'
import { FiLoader, FiPlus, FiRefreshCw, FiRotateCcw, FiSave, FiSlash, FiX, FiZap } from 'react-icons/fi'
import { SAMPLE_COURSES } from '../../data/codelabDefaults'
import { useToast } from '../../context/ToastContext'
import { getErrorDetail } from '../../lib/apiClient'
import { EXAM_CODES, courseCatalogPayload, courseExamContexts } from '../../lib/examContext'
import { createExamQuestion, getExamBankSummary, getExamJob, listExamQuestions, refillExamPool, setCourseExam, updateExamQuestion, uploadExamContext, upsertLearningCourse, voidExamQuestion } from '../../api/admin'

// Final-exam question pool for one course (COURSE_EXAMS_CERTIFICATES.md §7). There is no
// approval step: turning the exam on makes the backend build a fixed pool of 90 questions that
// go live after automatic checks. Admins monitor the pool and handle quarantined questions.

const POOL_TARGET = 90 // per course; an exam draws 30
const STATUSES = ['live', 'quarantined', 'rejected', 'voided', 'retired']
const DIFFICULTIES = ['easy', 'medium', 'hard']
const KINDS = ['concept', 'scenario', 'code_output', 'spot_the_bug']
const BTN = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50'
const PRIMARY = `${BTN} bg-ink-900 text-white dark:bg-gold-400 dark:text-ink-950`
const SECONDARY = `${BTN} border border-ink-200 text-ink-700 hover:border-gold-400 dark:border-ink-700 dark:text-ink-200`
const INPUT = 'w-full rounded-lg border border-ink-200 bg-transparent px-3 py-2 text-sm focus:border-gold-400 focus:outline-none dark:border-ink-700'
// A paused job (e.g. AI quota used up) is not running, so stop polling and allow a new refill.
const JOB_DONE = ['done', 'completed', 'failed', 'error', 'cancelled', 'paused']

const emptyQuestion = (module) => ({
  module_id: module.id, lesson_id: module.lessons[0]?.id ?? '', concept: '', kind: 'concept', source_fact: '',
  prompt: '', options: ['', '', '', ''], correct_index: 0, explanation: '', difficulty: 'medium',
})

// Keep the editor renderable if an API row is missing optional fields. The API response is
// external data and must not be able to take down the entire admin route.
function normalizeQuestion(question) {
  return {
    ...question,
    lesson_id: typeof question?.lesson_id === 'string' ? question.lesson_id : '',
    concept: typeof question?.concept === 'string' ? question.concept : '',
    kind: KINDS.includes(question?.kind) ? question.kind : 'concept',
    source_fact: typeof question?.source_fact === 'string' ? question.source_fact : '',
    prompt: typeof question?.prompt === 'string' ? question.prompt : '',
    options: Array.isArray(question?.options) ? question.options.map((option) => String(option ?? '')) : ['', '', '', ''],
    correct_index: Number.isInteger(question?.correct_index) ? question.correct_index : 0,
    explanation: typeof question?.explanation === 'string' ? question.explanation : '',
    difficulty: DIFFICULTIES.includes(question?.difficulty) ? question.difficulty : 'medium',
  }
}

export default function AdminExamBank() {
  const toast = useToast()
  const [courseSlug, setCourseSlug] = useState(SAMPLE_COURSES[0].slug)
  const course = SAMPLE_COURSES.find((item) => item.slug === courseSlug)
  const [summary, setSummary] = useState(null)
  const [status, setStatus] = useState('live')
  const [moduleFilter, setModuleFilter] = useState('')
  const [questions, setQuestions] = useState(null)
  const [error, setError] = useState('')
  const [job, setJob] = useState(null)
  const [adding, setAdding] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const pollRef = useRef(null)
  const autoSynced = useRef(new Set())

  // Publish the course outline and the generator's lesson context to the backend (the same
  // thing scripts/sync-learning-catalog.mjs does). Safe to re-run: matched by stable keys.
  const syncCourse = useCallback(async () => {
    setSyncing(true)
    try {
      await upsertLearningCourse(courseCatalogPayload(course))
      await uploadExamContext(course.slug, courseExamContexts(course.slug))
      return true
    } catch (err) {
      setError(getErrorDetail(err, 'Could not sync the course to the backend.'))
      return false
    } finally {
      setSyncing(false)
    }
  }, [course])

  // The course currently selected, and a counter so only the newest load may update the page
  // (switching courses quickly must not let an older response overwrite the newer one).
  const currentSlug = useRef(courseSlug)
  currentSlug.current = courseSlug
  const loadSeq = useRef(0)

  const load = useCallback(async () => {
    const seq = ++loadSeq.current
    const isStale = () => seq !== loadSeq.current
    setError('')
    setQuestions(null)
    try {
      const [sum, list] = await Promise.all([
        getExamBankSummary(courseSlug),
        listExamQuestions({ course: courseSlug, status, module: moduleFilter || undefined }),
      ])
      if (isStale()) return
      setSummary(sum ?? null)
      setQuestions(Array.isArray(list) ? list : (Array.isArray(list?.items) ? list.items : []))
    } catch (err) {
      if (isStale()) return
      // The backend has not seen this course yet: upload it once, then retry.
      if (err?.response?.status === 404 && !autoSynced.current.has(courseSlug)) {
        autoSynced.current.add(courseSlug)
        const synced = await syncCourse()
        if (isStale()) return
        if (synced) { toast.success(`${course.title} synced to the backend.`); return load() }
        setSummary(null)
        setQuestions([])
        return
      }
      setSummary(null)
      setError(getErrorDetail(err, 'Could not load the question pool.'))
      setQuestions([])
    }
  }, [courseSlug, status, moduleFilter, syncCourse, course, toast])

  // Always call the newest load (for timers that outlive the render that started them).
  const loadRef = useRef(load)
  loadRef.current = load

  const resync = async () => {
    setError('')
    if (await syncCourse()) { toast.success(`${course.title} synced to the backend.`); load() }
  }

  useEffect(() => { load() }, [load])
  // A different course: reset the filters and stop following the previous course's job.
  useEffect(() => {
    setModuleFilter('')
    setAdding(false)
    clearTimeout(pollRef.current)
    pollRef.current = null
    setJob(null)
  }, [course])
  useEffect(() => () => clearTimeout(pollRef.current), [])

  const counts = Object.fromEntries((summary?.modules ?? []).map((row) => [row.module_id, row]))
  const liveTotal = summary?.live ?? 0
  const target = summary?.target ?? POOL_TARGET

  // Follow a refill job for `slug` until it finishes, then reload the counts. Polling stops as
  // soon as another course is selected, so a job never writes into the wrong course's view.
  const watchJob = useCallback((jobId, slug) => {
    clearTimeout(pollRef.current)
    const stillCurrent = () => slug === currentSlug.current
    const tick = async () => {
      if (!stillCurrent()) return
      try {
        const next = await getExamJob(jobId)
        if (!stillCurrent()) return
        setJob({ id: jobId, ...next })
        if (JOB_DONE.includes(next?.status)) { loadRef.current(); return }
      } catch (err) {
        if (!stillCurrent()) return
        // A 404 means the job record expired or was cleaned up: stop and just refresh the counts.
        if (err?.response?.status === 404) { setJob(null); loadRef.current(); return }
        setJob({ id: jobId, status: 'error', errors: [getErrorDetail(err, 'Could not read the job.')] })
        return
      }
      pollRef.current = setTimeout(tick, 3000)
    }
    tick()
  }, [])

  const refill = async () => {
    const slug = courseSlug
    try {
      const result = await refillExamPool(slug)
      toast.success('Question pool refill started.')
      if (result?.job_id) watchJob(result.job_id, slug)
      else loadRef.current()
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not start a refill.'))
    }
  }

  const toggleExam = async () => {
    const slug = courseSlug
    const enabled = !summary?.enabled
    try {
      const result = await setCourseExam(slug, { enabled, code: EXAM_CODES[slug] })
      toast.success(enabled ? 'Exam turned on. Learners see it once the pool is ready.' : 'Final exam turned off.')
      if (result?.job_id) watchJob(result.job_id, slug)
      if (slug === currentSlug.current) loadRef.current()
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not change the exam setting.'))
    }
  }

  const jobRunning = job && !JOB_DONE.includes(job.status)

  return (
    <div>
      <h2 className="font-display text-xl font-bold">Exam question pool</h2>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">Turning the exam on builds a fixed pool of {POOL_TARGET} checked questions; each learner gets 30 of them. Learners see the exam only once every module has its share.</p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold">Course
          <select value={courseSlug} onChange={(event) => setCourseSlug(event.target.value)} className={`${INPUT} mt-1 w-56`}>
            {SAMPLE_COURSES.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}
          </select>
        </label>
        <div className="text-sm">
          <span className="font-semibold">{liveTotal}</span> / {target} live · exam is <span className="font-semibold">{summary?.enabled ? 'on' : 'off'}</span>
          {summary?.enabled && <> · <span className={summary.ready ? 'text-emerald-600' : 'text-amber-600'}>{summary.ready ? 'visible to learners' : 'building pool'}</span></>}
        </div>
        <button type="button" onClick={toggleExam} disabled={!summary} className={summary?.enabled ? SECONDARY : PRIMARY}>
          {summary?.enabled ? 'Turn exam off' : 'Turn exam on'}
        </button>
      </div>

      <table className="mt-4 w-full text-left text-sm">
        <thead><tr className="text-xs text-ink-500"><th className="py-1">Module</th><th>Lessons</th><th>Live / target</th><th>Quarantined</th><th>Rejected</th></tr></thead>
        <tbody>
          {course.modules.map((module) => {
            const row = counts[module.id] ?? {}
            const short = row.target != null && (row.live ?? 0) < row.target
            return (
              <tr key={module.id} className="border-t border-ink-100 dark:border-ink-800">
                <td className="py-1.5">{module.title}</td>
                <td>{module.lessons.length}</td>
                <td className={short ? 'text-amber-600' : 'text-emerald-600'}>{row.live ?? 0} / {row.target ?? '—'}</td>
                <td className={row.quarantined ? 'font-semibold text-red-600' : ''}>{row.quarantined ?? 0}</td>
                <td>{row.rejected ?? 0}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-ink-200 p-3 dark:border-ink-800">
        <p className="text-sm text-ink-500 dark:text-ink-300">The backend tops the pool up automatically. Refill replaces removed questions now.</p>
        <button type="button" onClick={refill} disabled={!summary?.enabled || jobRunning} title={!summary?.enabled ? 'Turn the exam on first' : undefined} className={PRIMARY}>{jobRunning ? <FiLoader className="animate-spin" /> : <FiZap />} Refill question pool</button>
        <button type="button" onClick={() => setAdding(true)} className={SECONDARY}><FiPlus /> Write a question</button>
        <button type="button" onClick={resync} disabled={syncing} title="Upload this course's modules, lessons and exam context to the backend" className={SECONDARY}>{syncing ? <FiLoader className="animate-spin" /> : <FiRefreshCw />} Sync course</button>
        {job && (
          <p className="w-full text-xs text-ink-500">
            Job {job.status}{job.modules_total ? ` · ${job.modules_done ?? 0}/${job.modules_total} modules` : ''}{job.created != null ? ` · ${job.created} created` : ''}
            {job.errors?.length ? <span className="text-red-600"> · {job.errors.join('; ')}</span> : null}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {STATUSES.map((item) => (
          <button key={item} type="button" onClick={() => setStatus(item)} aria-pressed={status === item} className={status === item ? PRIMARY : SECONDARY}>{item}</button>
        ))}
        <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} aria-label="Module filter" className={`${INPUT} w-64`}>
          <option value="">All modules</option>
          {course.modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
        </select>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      {adding && (
        <QuestionEditor
          course={course}
          question={emptyQuestion(course.modules.find((module) => module.id === moduleFilter) ?? course.modules[0])}
          onSave={async (payload) => {
            const created = await createExamQuestion({ ...payload, course_slug: courseSlug })
            setAdding(false)
            load()
            return created?.status === 'live' ? 'Question passed the checks and is live.' : `Question saved as ${created?.status ?? 'submitted'}.`
          }}
          onCancel={() => setAdding(false)}
        />
      )}
      {questions === null
        ? <div className="mt-6 flex justify-center"><FiLoader className="h-5 w-5 animate-spin text-gold-500" /></div>
        : questions.length === 0
          ? <p className="mt-6 text-sm text-ink-500">No {status} questions{moduleFilter ? ' in this module' : ''}.</p>
          : questions.map((question) => (
            <QuestionEditor
              key={question.id}
              course={course}
              question={question}
              onSave={async (payload) => {
                const updated = await updateExamQuestion(question.id, payload)
                load()
                return updated?.status === 'live' ? 'Saved — the question is live.' : `Saved — status ${updated?.status ?? 'updated'}.`
              }}
              onVoid={async () => { await voidExamQuestion(question.id); load() }}
            />
          ))}
    </div>
  )
}

// One question, editable in place. Saving re-runs every automatic check on the server; the
// question stays or becomes live only if it passes.
function QuestionEditor({ course, question, onSave, onVoid, onCancel }) {
  const toast = useToast()
  const [draft, setDraft] = useState(() => normalizeQuestion(question))
  const [saving, setSaving] = useState(false)
  const set = (patch) => setDraft((current) => ({ ...current, ...patch }))
  const setOption = (index, value) => set({ options: draft.options.map((option, i) => (i === index ? value : option)) })
  const module = course.modules.find((item) => item.id === draft.module_id) ?? course.modules[0]

  // Same checks the server runs, so problems show before saving.
  const problems = []
  if (!draft.prompt.trim()) problems.push('Question text is empty.')
  if (draft.options.some((option) => !option.trim())) problems.push('Every option needs text.')
  if (new Set(draft.options.map((option) => option.trim().toLowerCase())).size !== draft.options.length) problems.push('Options must all be different.')
  if (draft.options.some((option) => /\b(all|none) of the above\b/i.test(option))) problems.push('Avoid "all/none of the above".')
  if (!draft.explanation.trim()) problems.push('Add an explanation.')
  if (!draft.lesson_id) problems.push('Pick a lesson.')
  if (!draft.concept.trim()) problems.push('Name the concept tested.')

  const save = async (extra = {}) => {
    setSaving(true)
    try {
      const { module_id, lesson_id, concept, kind, source_fact, prompt, options, correct_index, explanation, difficulty } = draft
      const message = await onSave({ module_id, lesson_id, concept, kind, source_fact: source_fact.trim() || undefined, prompt, options, correct_index, explanation, difficulty, ...extra })
      toast.success(message || 'Question saved.')
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not save the question.'))
    } finally {
      setSaving(false)
    }
  }

  const voidIt = async () => {
    if (!window.confirm('Void this question? It is never drawn again and graded attempts that contained it are regraded without it.')) return
    setSaving(true)
    try {
      await onVoid()
      toast.success('Question voided.')
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not void the question.'))
    } finally {
      setSaving(false)
    }
  }

  const failedChecks = Array.isArray(question.checks)
    ? question.checks.filter((check) => check && check.passed === false).map((check) => `${check.name ?? 'check'}${check.reason ? `: ${check.reason}` : ''}`)
    : question.checks && typeof question.checks === 'object'
      ? Object.entries(question.checks).filter(([, value]) => value === false || value?.passed === false).map(([name, value]) => (value?.reason ? `${name}: ${value.reason}` : name))
      : []
  const reportCount = Array.isArray(question.reports) ? question.reports.length : (question.reports ?? 0)
  const stats = question.stats && typeof question.stats === 'object' ? question.stats : null

  return (
    <div className="mt-4 rounded-xl border border-ink-200 p-4 dark:border-ink-800">
      <div className="flex flex-wrap gap-2 text-xs">
        <select value={draft.module_id} onChange={(event) => { const next = course.modules.find((item) => item.id === event.target.value); set({ module_id: event.target.value, lesson_id: next?.lessons[0]?.id ?? '' }) }} aria-label="Module" className={`${INPUT} w-56`}>
          {course.modules.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <select value={draft.lesson_id} onChange={(event) => set({ lesson_id: event.target.value })} aria-label="Lesson" className={`${INPUT} w-56`}>
          {!module.lessons.some((lesson) => lesson.id === draft.lesson_id) && <option value={draft.lesson_id}>{draft.lesson_id || 'Pick a lesson'}</option>}
          {module.lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
        </select>
        <select value={draft.kind} onChange={(event) => set({ kind: event.target.value })} aria-label="Kind" className={`${INPUT} w-36`}>
          {KINDS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={draft.difficulty} onChange={(event) => set({ difficulty: event.target.value })} aria-label="Difficulty" className={`${INPUT} w-28`}>
          {DIFFICULTIES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        {question.source && <span className="self-center text-ink-400">source: {question.source}</span>}
        {question.status && <span className="self-center text-ink-400">status: {question.status}</span>}
      </div>
      <input value={draft.concept} onChange={(event) => set({ concept: event.target.value })} aria-label="Concept" placeholder="Concept tested (e.g. string immutability)" className={`${INPUT} mt-2`} />
      <textarea value={draft.prompt} onChange={(event) => set({ prompt: event.target.value })} rows={3} aria-label="Question (Markdown)" placeholder="Question (Markdown; use ``` for code)" className={`${INPUT} mt-2 font-mono`} />
      <div className="mt-2 space-y-1.5">
        {draft.options.map((option, index) => (
          <label key={index} className="flex items-center gap-2">
            <input type="radio" name={`correct-${question.id ?? 'new'}`} checked={draft.correct_index === index} onChange={() => set({ correct_index: index })} aria-label={`Option ${index + 1} is correct`} />
            <input value={option} onChange={(event) => setOption(index, event.target.value)} aria-label={`Option ${index + 1}`} className={INPUT} />
          </label>
        ))}
      </div>
      <textarea value={draft.explanation} onChange={(event) => set({ explanation: event.target.value })} rows={2} aria-label="Explanation" placeholder="Why the correct option is right" className={`${INPUT} mt-2`} />
      <input value={draft.source_fact} onChange={(event) => set({ source_fact: event.target.value })} aria-label="Source fact" placeholder="Source fact from the lesson (optional; enables the grounding check)" className={`${INPUT} mt-2`} />
      {(failedChecks.length > 0 || reportCount > 0 || stats) && (
        <div className="mt-2 space-y-1 text-xs text-ink-500">
          {failedChecks.length > 0 && <p className="text-red-600">Failed checks: {failedChecks.join(' · ')}</p>}
          {reportCount > 0 && <p className="text-amber-600">{reportCount} learner report{reportCount === 1 ? '' : 's'}</p>}
          {stats && <p>Stats: {Object.entries(stats).map(([key, value]) => `${key} ${typeof value === 'number' && value <= 1 && key.includes('rate') ? `${Math.round(value * 100)}%` : value}`).join(' · ')}</p>}
        </div>
      )}
      {problems.length > 0 && <ul className="mt-2 list-disc pl-5 text-xs text-amber-600">{problems.map((item) => <li key={item}>{item}</li>)}</ul>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => save()} disabled={saving || problems.length > 0} className={onCancel ? PRIMARY : SECONDARY}><FiSave /> {onCancel ? 'Submit' : 'Save'}</button>
        {onCancel && <button type="button" onClick={onCancel} className={SECONDARY}><FiX /> Cancel</button>}
        {!onCancel && ['quarantined', 'retired'].includes(question.status) && (
          <button type="button" onClick={() => save({ status: 'live' })} disabled={saving || problems.length > 0} className={PRIMARY}><FiRotateCcw /> Restore to live</button>
        )}
        {!onCancel && question.status !== 'voided' && question.status !== 'rejected' && (
          <button type="button" onClick={voidIt} disabled={saving} className={SECONDARY}><FiSlash /> Void</button>
        )}
      </div>
    </div>
  )
}
