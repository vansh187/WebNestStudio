import Breadcrumbs from '../../components/Breadcrumbs'
import LessonVideo from '../../components/LessonVideo'
import { getLessonVideo } from '../../data/lessonVideos'
import { lessonTemplate } from '../../lib/lessonPlayground'
import { trackEvent } from '../../lib/analytics'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiBarChart2, FiBookmark, FiCheckCircle, FiCode, FiList, FiLock, FiMenu, FiSave, FiTrash2 } from 'react-icons/fi'
import { SAMPLE_COURSES, SAMPLE_LESSONS } from '../../data/codelabDefaults'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { useSeo, useStructuredData, SITE_NAME, SITE_URL } from '../../hooks/useSeo'
import ErrorBoundary from '../../components/ErrorBoundary'
import { NotFoundState } from '../../components/states/StateViews'
import BackButton from '../../components/coding/BackButton'
import { readLearningProgress, writeLearningProgress, getLessonProgress } from '../../lib/learningProgress'
import { readUserNotes, writeUserNotes, createNoteId } from '../../lib/lessonNotes'

function normalize(id) {
  const source = SAMPLE_LESSONS[id]
  if (!source) return null
  return {
    ...source,
    id: source.id || id,
    course_slug: source.course_slug || '',
    title: source.title || 'Untitled lesson',
    content: source.content || { format: 'html', body: '' },
    resources: Array.isArray(source.resources) ? source.resources : [],
    practice: Array.isArray(source.practice) ? source.practice : [],
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

// Left-hand course outline: jump straight to any lesson without paging
// through Prev/Next one at a time.
function TopicNav({ course, activeLessonId, progress }) {
  return (
    <nav aria-label="Course topics" className="max-h-[75vh] overflow-y-auto pr-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">{course.title}</p>
      <div className="mt-3 space-y-4">
        {course.modules.map((module) => (
          <div key={module.id || module.title}>
            <p className="text-xs font-semibold text-ink-500 dark:text-ink-400">{module.title}</p>
            <ul className="mt-1 space-y-0.5">
              {(Array.isArray(module.lessons) ? module.lessons : []).map((item) => {
                const isActive = item.id === activeLessonId
                const lessonProgress = getLessonProgress(progress, item.id)
                const isCompleted = lessonProgress.status === 'completed'
                return (
                  <li key={item.id}>
                    <Link
                      to={`/learn/lessons/${item.id}`}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                        isActive
                          ? 'bg-gold-400/15 font-semibold text-gold-600 dark:text-gold-400'
                          : 'text-ink-600 hover:text-gold-500 dark:text-ink-300'
                      }`}
                    >
                      {isCompleted ? (
                        <FiCheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-gold-500' : 'bg-ink-300 dark:bg-ink-700'}`} />
                      )}
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      {lessonProgress.bookmarked && <FiBookmark className="h-3 w-3 shrink-0 text-gold-500" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}

export default function LessonDetail() {
  const { lessonId } = useParams()
  const toast = useToast()
  const { user, isAuthenticated } = useAuth()
  const userKey = user?.email || null
  const lesson = useMemo(() => normalize(lessonId), [lessonId])
  const [courseProgress, setCourseProgress] = useState({})
  const [notes, setNotes] = useState([])
  const [draftNote, setDraftNote] = useState('')
  const [saving, setSaving] = useState(false)

  const progress = useMemo(() => getLessonProgress(courseProgress, lessonId), [courseProgress, lessonId])

  // Split the lesson HTML so a video can sit between two sections. Falls back
  // to showing the video below the lesson when the split marker isn't found.
  const video = lesson ? getLessonVideo(lesson.id) : null
  const bodyParts = useMemo(() => {
    const body = lesson?.content.body || ''
    if (video?.afterSection) {
      const at = body.indexOf(`<h2 id="section-${video.afterSection + 1}"`)
      if (at > 0) return { before: body.slice(0, at), after: body.slice(at), inline: true }
    }
    return { before: body, after: '', inline: false }
  }, [lesson, video])

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
    title: lesson?.seo_title || 'Lesson not found',
    description: lesson?.description,
    noindex: !lesson || !lesson.indexable,
    path: `/learn/lessons/${lesson?.id || lessonId || ''}`,
    type: 'article',
  })

  useEffect(() => {
    setDraftNote('')
  }, [lessonId])

  useEffect(() => {
    if (!userKey) {
      setNotes([])
      setCourseProgress({})
      return
    }
    setNotes(readUserNotes(userKey)[lessonId] || [])
    setCourseProgress(readLearningProgress(userKey))
  }, [userKey, lessonId])

  useStructuredData(lesson && lesson.indexable ? {
    '@context': 'https://schema.org', '@type': 'TechArticle',
    headline: lesson.title, description: lesson.description,
    url: `${SITE_URL}/learn/lessons/${lesson.id}`,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    isPartOf: { '@type': 'Course', name: lessonNavigation?.course.title, url: `${SITE_URL}/learn/${lesson.course_slug}` },
    inLanguage: 'en',
  } : null)

  useEffect(() => {
    if (lesson) trackEvent('lesson_viewed', { lesson_id: lesson.id, course_slug: lesson.course_slug })
  }, [lesson])

  const markComplete = useCallback(() => {
    if (!userKey) return
    const all = readLearningProgress(userKey)
    const nextProgress = { ...progress, status: 'completed', completed_percent: 100 }
    all[lessonId] = nextProgress
    if (!writeLearningProgress(userKey, all)) {
      toast.error('Could not save your progress. Your browser storage may be full or unavailable.')
      return
    }
    setCourseProgress(all)
    trackEvent('lesson_completed', { lesson_id: lessonId, course_slug: lesson?.course_slug })
    toast.success('Lesson marked complete.')
  }, [userKey, lessonId, progress, toast, lesson])

  const toggleBookmark = useCallback(() => {
    if (!userKey) return
    const all = readLearningProgress(userKey)
    const nextProgress = { ...progress, bookmarked: !progress.bookmarked }
    all[lessonId] = nextProgress
    if (!writeLearningProgress(userKey, all)) {
      toast.error('Could not save your bookmark. Your browser storage may be full or unavailable.')
      return
    }
    setCourseProgress(all)
  }, [userKey, lessonId, progress, toast])

  const saveNote = useCallback(() => {
    const trimmed = draftNote.trim()
    if (!trimmed) return
    if (trimmed.length > 5000) {
      toast.error('Notes must be 5000 characters or fewer.')
      return
    }
    if (!userKey) return
    setSaving(true)
    const entry = { id: createNoteId(), text: trimmed, createdAt: new Date().toISOString() }
    const allNotes = readUserNotes(userKey)
    const nextNotes = [entry, ...notes]
    allNotes[lessonId] = nextNotes
    if (!writeUserNotes(userKey, allNotes)) {
      setSaving(false)
      toast.error('Could not save your note. Your browser storage may be full or unavailable.')
      return
    }
    setNotes(nextNotes)
    setDraftNote('')
    setSaving(false)
    toast.success('Note saved.')
  }, [userKey, lessonId, notes, draftNote, toast])

  const deleteNote = useCallback((noteId) => {
    if (!userKey) return
    const allNotes = readUserNotes(userKey)
    const nextNotes = notes.filter((n) => n.id !== noteId)
    allNotes[lessonId] = nextNotes
    if (!writeUserNotes(userKey, allNotes)) {
      toast.error('Could not delete the note. Please try again.')
      return
    }
    setNotes(nextNotes)
  }, [userKey, lessonId, notes, toast])

  if (!lesson) return <NotFoundState title="Lesson not found" backTo="/learn" backLabel="Back to courses" />

  const relatedLessons = lessonNavigation?.course.modules.find((module) => module.lessons.some((item) => item.id === lesson.id))?.lessons.filter((item) => item.id !== lesson.id).slice(0, 5) || []

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)_320px] lg:px-8">
      {lessonNavigation && (
        <>
          <details className="rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40 lg:hidden">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-700 dark:text-ink-100">
              <FiMenu className="h-4 w-4" /> Course topics
            </summary>
            <div className="mt-3">
              <TopicNav course={lessonNavigation.course} activeLessonId={lessonId} progress={courseProgress} />
            </div>
          </details>
          <div className="hidden rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40 lg:sticky lg:top-24 lg:block lg:self-start">
            <TopicNav course={lessonNavigation.course} activeLessonId={lessonId} progress={courseProgress} />
          </div>
        </>
      )}
      <article className="min-w-0">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' }, { label: lessonNavigation?.course.title || 'Course', to: `/learn/${lesson.course_slug}` }, { label: lesson.title, to: `/learn/lessons/${lesson.id}` }]} />
        <p className="mb-3 text-sm text-ink-500">By <Link to="/about" className="underline">WebNest Studio</Link></p>
        <BackButton fallback={`/learn/${lesson.course_slug}`} label="Back to course" />
        <ErrorBoundary>
          <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8 dark:border-ink-800 dark:bg-ink-900/40">
            <div dangerouslySetInnerHTML={{ __html: bodyParts.before }} />
            {video && bodyParts.inline && <LessonVideo video={video} lessonId={lesson.id} />}
            {bodyParts.after && <div dangerouslySetInnerHTML={{ __html: bodyParts.after }} />}
          </div>
        </ErrorBoundary>
        {video && !bodyParts.inline && <LessonVideo video={video} lessonId={lesson.id} />}
        <section className="mt-6 rounded-xl border border-ink-200 p-5 dark:border-ink-800">
          <h2 className="text-lg font-semibold">Practice the examples</h2>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">Change an input, predict the result, then compare it with the output. Explain why the result changes.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {(lesson.examples.length ? lesson.examples : lesson.resources).map((example, index) => lessonTemplate(lesson, index) ? (
              <Link key={index} to={`/codelab/playground?lesson=${encodeURIComponent(lesson.id)}&example=${index}`} onClick={() => trackEvent('practice_started', { lesson_id: lesson.id, course_slug: lesson.course_slug })} className="rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950">
                Try {example.caption || `example ${index + 1}`} in Webnest Codelab
              </Link>
            ) : (
              <button key={index} type="button" className="rounded-lg border border-ink-300 px-4 py-2 text-sm" onClick={async () => {
                try { await navigator.clipboard.writeText(example.code || example.content); toast.success('Example copied.'); trackEvent('practice_started', { lesson_id: lesson.id, language: lesson.language }) }
                catch { toast.error('Select and copy the example from the lesson.') }
              }}>Copy {example.caption || `example ${index + 1}`}</button>
            ))}
          </div>
          {!lessonTemplate(lesson) && <p className="mt-3 text-sm text-ink-500 dark:text-ink-300">Use your local {lesson.language === 'java' ? 'JDK or project IDE' : 'project environment'} for these examples. Codelab currently runs Python and HTML/CSS/JavaScript; framework examples may need project dependencies.</p>}
        </section>
        {relatedLessons.length > 0 && <nav aria-label="Related concepts" className="mt-6"><h2 className="text-lg font-semibold">Related concepts</h2><ul className="mt-2 space-y-2">{relatedLessons.map((item) => <li key={item.id}><Link className="text-gold-600 underline dark:text-gold-400" to={`/learn/lessons/${item.id}`}>{item.title}</Link></li>)}</ul></nav>}
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
        <Link to="/codelab/dashboard" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-700 hover:border-gold-400 hover:text-gold-600 dark:border-ink-800 dark:text-ink-100 dark:hover:text-gold-400">
          <FiBarChart2 className="h-4 w-4" /> View dashboard
        </Link>
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
        {isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={markComplete}
              disabled={progress.status === 'completed'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-gold-400 dark:text-ink-950"
            >
              <FiCheckCircle className="h-4 w-4" /> {progress.status === 'completed' ? 'Completed' : 'Mark complete'}
            </button>
            <button
              type="button"
              onClick={toggleBookmark}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold ${progress.bookmarked ? 'border-gold-400 text-gold-600 dark:text-gold-400' : 'border-ink-200 text-ink-700 dark:border-ink-800 dark:text-ink-100'}`}
            >
              <FiBookmark className="h-4 w-4" /> {progress.bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-ink-200 p-4 text-sm text-ink-500 dark:border-ink-800 dark:text-ink-400">
            <p className="flex items-center gap-2 font-semibold text-ink-700 dark:text-ink-100"><FiLock className="h-4 w-4" /> Track your progress</p>
            <p className="mt-1">
              <Link to="/login" state={{ from: { pathname: `/learn/lessons/${lessonId}` } }} className="font-semibold text-gold-500 hover:underline">
                Log in
              </Link>{' '}
              to mark lessons complete and bookmark them for your dashboard.
            </p>
          </div>
        )}
        <div className="rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40">
          <label className="text-sm font-semibold text-ink-700 dark:text-ink-100" htmlFor="lesson-note">Notes</label>
          {isAuthenticated ? (
            <>
              <textarea
                id="lesson-note"
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                rows={4}
                placeholder="Add a note to revisit later..."
                className="mt-2 w-full rounded-lg border border-ink-200 bg-white p-3 text-sm dark:border-ink-800 dark:bg-ink-950"
              />
              <button type="button" onClick={saveNote} disabled={saving || !draftNote.trim()} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gold-400 px-3 py-2 text-sm font-semibold text-ink-950 disabled:opacity-60">
                <FiSave className="h-4 w-4" /> Save
              </button>

              {notes.length > 0 && (
                <ul className="mt-4 space-y-3 border-t border-ink-100 pt-4 dark:border-ink-800">
                  {notes.map((entry) => (
                    <li key={entry.id} className="rounded-lg bg-ink-50 p-3 text-sm dark:bg-ink-950">
                      <p className="whitespace-pre-wrap text-ink-800 dark:text-ink-100">{entry.text}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <time className="text-xs text-ink-400" dateTime={entry.createdAt}>
                          {new Date(entry.createdAt).toLocaleString()}
                        </time>
                        <button
                          type="button"
                          onClick={() => deleteNote(entry.id)}
                          className="text-ink-400 hover:text-red-500"
                          aria-label="Delete note"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              <Link to="/login" state={{ from: { pathname: `/learn/lessons/${lessonId}` } }} className="font-semibold text-gold-500 hover:underline">
                Log in
              </Link>{' '}
              to add and keep your own notes for this lesson.
            </p>
          )}
        </div>
        {lesson.practice.map((item) => (
          <Link key={item.slug} to={`/codelab/problems/${item.slug}`} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-700 dark:border-ink-800 dark:text-ink-100">
            <FiCode className="h-4 w-4" /> Open in CodeLab
          </Link>
        ))}
      </aside>
    </div>
  )
}
