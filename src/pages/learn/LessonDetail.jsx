import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiBookmark, FiCheckCircle, FiCode, FiList, FiSave } from 'react-icons/fi'
import { SAMPLE_COURSES, SAMPLE_LESSONS } from '../../data/codelabDefaults'
import { useToast } from '../../context/ToastContext'
import { useSeo } from '../../hooks/useSeo'
import ErrorBoundary from '../../components/ErrorBoundary'
import { NotFoundState } from '../../components/states/StateViews'
import BackButton from '../../components/coding/BackButton'

const PROGRESS_KEY = 'wns-static-learning-progress'

function readProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    /* Static lessons should keep working even when storage is unavailable. */
  }
}

function normalize(id) {
  const source = SAMPLE_LESSONS[id]
  if (!source) return null
  return {
    id: source.id || id,
    course_slug: source.course_slug || '',
    title: source.title || 'Untitled lesson',
    content: source.content || { format: 'html', body: '' },
    resources: Array.isArray(source.resources) ? source.resources : [],
    practice: Array.isArray(source.practice) ? source.practice : [],
    progress: { status: 'not_started', completed_percent: 0, bookmarked: false, note: '', ...(source.progress || {}) },
  }
}

function getCourseLessonOrder(courseSlug) {
  const course = SAMPLE_COURSES.find((item) => item.slug === courseSlug)
  if (!course) return { course: null, lessons: [] }

  const lessons = course.modules.flatMap((module) => (
    Array.isArray(module.lessons)
      ? module.lessons.map((item) => ({ ...item, moduleTitle: module.title }))
      : []
  ))

  return { course, lessons }
}

export default function LessonDetail() {
  const { lessonId } = useParams()
  const toast = useToast()
  const [lesson, setLesson] = useState(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const lessonNavigation = useMemo(() => {
    if (!lesson) return null

    const { course, lessons } = getCourseLessonOrder(lesson.course_slug)
    const currentIndex = lessons.findIndex((item) => item.id === lesson.id || item.id === lessonId)

    if (!course || currentIndex < 0) {
      return null
    }

    return {
      course,
      currentIndex,
      total: lessons.length,
      previous: lessons[currentIndex - 1] || null,
      next: lessons[currentIndex + 1] || null,
    }
  }, [lesson, lessonId])

  useSeo({
    title: lesson?.title ? `${lesson.title} | Learn` : 'Lesson',
    description: 'Read a static Webnest CodeLab lesson.',
    path: `/learn/lessons/${lessonId || ''}`,
  })

  useEffect(() => {
    const next = normalize(lessonId)
    if (!next) {
      setLesson(null)
      setNote('')
      return
    }
    const saved = readProgress()[lessonId] || {}
    const progress = { ...next.progress, ...saved }
    setLesson({ ...next, progress })
    setNote(progress.note || '')
  }, [lessonId])

  const markComplete = useCallback(() => {
    const progress = readProgress()
    const nextProgress = { ...lesson.progress, status: 'completed', completed_percent: 100, note }
    progress[lesson.id] = nextProgress
    writeProgress(progress)
    setLesson((item) => ({ ...item, progress: nextProgress }))
    toast.success('Lesson marked complete.')
  }, [lesson, note, toast])

  const toggleBookmark = useCallback(() => {
    const bookmarked = !lesson.progress.bookmarked
    const progress = readProgress()
    const nextProgress = { ...lesson.progress, bookmarked, note }
    progress[lesson.id] = nextProgress
    writeProgress(progress)
    setLesson((item) => ({ ...item, progress: nextProgress }))
  }, [lesson, note])

  const saveNote = useCallback(() => {
    if (note.length > 5000) {
      toast.error('Notes must be 5000 characters or fewer.')
      return
    }
    setSaving(true)
    const progress = readProgress()
    const nextProgress = { ...lesson.progress, note }
    progress[lesson.id] = nextProgress
    writeProgress(progress)
    setLesson((item) => ({ ...item, progress: nextProgress }))
    setSaving(false)
    toast.success('Note saved.')
  }, [lesson, note, toast])

  if (!lesson) return <NotFoundState title="Lesson not found" backTo="/learn" backLabel="Back to courses" />

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
      <article className="min-w-0">
        <BackButton fallback={`/learn/${lesson.course_slug}`} label="Back to course" />
        <ErrorBoundary>
          <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8 dark:border-ink-800 dark:bg-ink-900/40" dangerouslySetInnerHTML={{ __html: lesson.content.body || '' }} />
        </ErrorBoundary>
        {lesson.resources.map((resource, index) => (
          <pre key={`${resource.language}-${index}`} className="mt-4 overflow-auto rounded-lg bg-ink-950 p-4 font-mono text-xs text-ink-100">{resource.content}</pre>
        ))}
        {lessonNavigation && (
          <nav className="mt-6 grid gap-3 rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40 sm:grid-cols-2" aria-label="Lesson pagination">
            {lessonNavigation.previous ? (
              <Link to={`/learn/lessons/${lessonNavigation.previous.id}`} className="flex min-h-24 items-center gap-3 rounded-lg bg-ink-50 p-4 text-ink-700 hover:text-gold-500 dark:bg-ink-950 dark:text-ink-100">
                <FiArrowLeft className="h-5 w-5 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-widest text-ink-400">Previous</span>
                  <span className="mt-1 block font-semibold">{lessonNavigation.previous.title}</span>
                </span>
              </Link>
            ) : (
              <div className="flex min-h-24 items-center gap-3 rounded-lg bg-ink-50 p-4 text-ink-400 dark:bg-ink-950/70">
                <FiArrowLeft className="h-5 w-5 shrink-0" />
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-widest">Previous</span>
                  <span className="mt-1 block font-semibold">Start of course</span>
                </span>
              </div>
            )}
            {lessonNavigation.next ? (
              <Link to={`/learn/lessons/${lessonNavigation.next.id}`} className="flex min-h-24 items-center justify-between gap-3 rounded-lg bg-ink-50 p-4 text-right text-ink-700 hover:text-gold-500 dark:bg-ink-950 dark:text-ink-100">
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-widest text-ink-400">Next</span>
                  <span className="mt-1 block font-semibold">{lessonNavigation.next.title}</span>
                </span>
                <FiArrowRight className="h-5 w-5 shrink-0" />
              </Link>
            ) : (
              <Link to={`/learn/${lesson.course_slug}`} className="flex min-h-24 items-center justify-between gap-3 rounded-lg bg-ink-50 p-4 text-right text-ink-700 hover:text-gold-500 dark:bg-ink-950 dark:text-ink-100">
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-widest text-ink-400">Finished</span>
                  <span className="mt-1 block font-semibold">Back to course outline</span>
                </span>
                <FiList className="h-5 w-5 shrink-0" />
              </Link>
            )}
          </nav>
        )}
      </article>
      <aside className="space-y-3">
        {lessonNavigation && (
          <div className="rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
              Lesson {lessonNavigation.currentIndex + 1} of {lessonNavigation.total}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-white">{lessonNavigation.course.title}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {lessonNavigation.previous ? (
                <Link to={`/learn/lessons/${lessonNavigation.previous.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:text-gold-500 dark:border-ink-800 dark:text-ink-100">
                  <FiArrowLeft className="h-4 w-4" /> Prev
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink-100 px-3 py-2 text-sm font-semibold text-ink-300 dark:border-ink-800/70 dark:text-ink-600">
                  <FiArrowLeft className="h-4 w-4" /> Prev
                </span>
              )}
              {lessonNavigation.next ? (
                <Link to={`/learn/lessons/${lessonNavigation.next.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-3 py-2 text-sm font-semibold text-ink-950">
                  Next <FiArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link to={`/learn/${lesson.course_slug}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-3 py-2 text-sm font-semibold text-ink-950">
                  Outline <FiList className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )}
        <button type="button" onClick={markComplete} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 py-3 text-sm font-semibold text-white dark:bg-gold-400 dark:text-ink-950">
          <FiCheckCircle className="h-4 w-4" /> Complete
        </button>
        <button type="button" onClick={toggleBookmark} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-700 dark:border-ink-800 dark:text-ink-100">
          <FiBookmark className="h-4 w-4" /> {lesson.progress.bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
        <div className="rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40">
          <label className="text-sm font-semibold text-ink-700 dark:text-ink-100" htmlFor="lesson-note">Notes</label>
          <textarea id="lesson-note" value={note} onChange={(e) => setNote(e.target.value)} rows={8} className="mt-2 w-full rounded-lg border border-ink-200 bg-white p-3 text-sm dark:border-ink-800 dark:bg-ink-950" />
          <button type="button" onClick={saveNote} disabled={saving} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gold-400 px-3 py-2 text-sm font-semibold text-ink-950 disabled:opacity-60">
            <FiSave className="h-4 w-4" /> Save
          </button>
        </div>
        {lesson.practice.map((item) => (
          <Link key={item.slug} to={`/codelab/problems/${item.slug}`} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-700 dark:border-ink-800 dark:text-ink-100">
            <FiCode className="h-4 w-4" /> Open in CodeLab
          </Link>
        ))}
      </aside>
    </main>
  )
}
