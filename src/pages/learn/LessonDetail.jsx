import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiBookmark, FiCheckCircle, FiCode, FiSave } from 'react-icons/fi'
import { getLesson, saveLessonNote, toggleLessonBookmark, updateLessonProgress } from '../../api/learning'
import { SAMPLE_LESSONS } from '../../data/codelabDefaults'
import { getErrorDetail } from '../../lib/apiClient'
import { useToast } from '../../context/ToastContext'
import { useSeo } from '../../hooks/useSeo'
import ErrorBoundary from '../../components/ErrorBoundary'
import { ErrorState, NotFoundState } from '../../components/states/StateViews'

function normalize(data, id) {
  const source = data?.id ? data : SAMPLE_LESSONS[id]
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

export default function LessonDetail() {
  const { lessonId } = useParams()
  const toast = useToast()
  const [lesson, setLesson] = useState(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  useSeo({ title: lesson?.title ? `${lesson.title} | Learn` : 'Lesson', description: 'Read a Webnest CodeLab lesson.', path: `/learn/lessons/${lessonId || ''}` })

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const data = await getLesson(lessonId)
        const next = normalize(data, lessonId)
        if (alive) {
          setLesson(next)
          setNote(next?.progress?.note || '')
        }
      } catch (err) {
        const next = normalize(null, lessonId)
        if (alive) {
          setLesson(next)
          setNote(next?.progress?.note || '')
          setError(next ? getErrorDetail(err, 'Could not load the live lesson. Showing starter content.') : '')
        }
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [lessonId])

  const markComplete = useCallback(async () => {
    try {
      await updateLessonProgress(lesson.id, { status: 'completed', completed_percent: 100, time_spent_seconds: 0 })
      setLesson((item) => ({ ...item, progress: { ...item.progress, status: 'completed', completed_percent: 100 } }))
      toast.success('Lesson marked complete.')
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not update progress.'))
    }
  }, [lesson, toast])

  const toggleBookmark = useCallback(async () => {
    const bookmarked = !lesson.progress.bookmarked
    try {
      await toggleLessonBookmark(lesson.id, { bookmarked })
      setLesson((item) => ({ ...item, progress: { ...item.progress, bookmarked } }))
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not update bookmark.'))
    }
  }, [lesson, toast])

  const saveNote = useCallback(async () => {
    if (note.length > 5000) {
      toast.error('Notes must be 5000 characters or fewer.')
      return
    }
    setSaving(true)
    try {
      await saveLessonNote(lesson.id, { note })
      toast.success('Note saved.')
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not save note.'))
    } finally {
      setSaving(false)
    }
  }, [lesson, note, toast])

  if (!lesson) return <NotFoundState title="Lesson not found" backTo="/learn" backLabel="Back to courses" />

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
      <article className="min-w-0">
        {error && <div className="mb-4"><ErrorState message={error} /></div>}
        <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">{lesson.title}</h1>
        <ErrorBoundary>
          <div className="prose prose-ink mt-6 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: lesson.content.body || '' }} />
        </ErrorBoundary>
        {lesson.resources.map((resource, index) => (
          <pre key={`${resource.language}-${index}`} className="mt-4 overflow-auto rounded-lg bg-ink-950 p-4 font-mono text-xs text-ink-100">{resource.content}</pre>
        ))}
      </article>
      <aside className="space-y-3">
        <button type="button" onClick={markComplete} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 py-3 text-sm font-semibold text-white dark:bg-gold-400 dark:text-ink-950">
          <FiCheckCircle className="h-4 w-4" /> Complete
        </button>
        <button type="button" onClick={toggleBookmark} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-700 dark:border-ink-800 dark:text-ink-100">
          <FiBookmark className="h-4 w-4" /> {lesson.progress.bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
        <div className="rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40">
          <label className="text-sm font-semibold text-ink-700 dark:text-ink-100" htmlFor="lesson-note">Notes</label>
          <textarea id="lesson-note" value={note} onChange={(e) => setNote(e.target.value)} rows={8} className="mt-2 w-full rounded-lg border border-ink-200 bg-white p-3 text-sm dark:border-ink-800 dark:bg-ink-950" />
          <button type="button" onClick={saveNote} disabled={saving} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gold-400 px-3 py-2 text-sm font-semibold text-ink-950">
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
