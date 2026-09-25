import Breadcrumbs from '../../components/Breadcrumbs'
import { trackEvent } from '../../lib/analytics'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiBookmark, FiCheckCircle } from 'react-icons/fi'
import { SAMPLE_COURSES } from '../../data/codelabDefaults'
import { useAuth } from '../../context/AuthContext'
import { useSeo, useStructuredData, SITE_NAME, SITE_URL } from '../../hooks/useSeo'
import { NotFoundState } from '../../components/states/StateViews'
import BackButton from '../../components/coding/BackButton'
import { readLearningProgress, getLessonProgress, getCourseProgress } from '../../lib/learningProgress'

export default function CourseDetail() {
  const { courseSlug } = useParams()
  const normalizedSlug = courseSlug === 'java' ? 'java-core' : courseSlug
  const course = SAMPLE_COURSES.find((item) => item.slug === normalizedSlug)
  const { user, isAuthenticated } = useAuth()
  const userKey = user?.email || null

  const progress = useMemo(() => readLearningProgress(userKey), [userKey])
  const courseStats = course ? getCourseProgress(progress, course) : null

  useSeo({
    title: course?.title ? `${course.title} | Learn` : 'Course',
    description: course?.description || 'Study a static Webnest CodeLab course.',
    path: `/learn/${normalizedSlug || ''}`,
    noindex: !course,
  })

  useStructuredData(course ? {
    '@context': 'https://schema.org', '@type': 'Course', name: course.title,
    description: course.description, url: `${SITE_URL}/learn/${course.slug}`,
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    educationalLevel: course.level, inLanguage: 'en', isAccessibleForFree: true,
  } : null)

  if (!course) return <NotFoundState title="Course not found" backTo="/learn" backLabel="Back to courses" />

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' }, { label: course.title, to: `/learn/${course.slug}` }]} />
      <BackButton fallback="/learn" label="Back to courses" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold-500">Course</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">{course.title}</h1>
      <p className="mt-2 max-w-3xl text-ink-500 dark:text-ink-300">{course.description}</p>

      <Link to={`/learn/lessons/${course.modules.flatMap((module) => module.lessons).find((lesson) => progress[lesson.id]?.status !== 'completed')?.id || course.modules[0].lessons[0].id}`} onClick={() => trackEvent('course_started', { course_slug: course.slug })} className="mt-5 inline-flex rounded-lg bg-gold-400 px-5 py-3 font-semibold text-ink-950">{courseStats.completed ? 'Continue learning' : 'Start course'}</Link>
      <p className="mt-3 text-sm text-ink-500">{course.level} / {course.lessons_count} lessons</p>
      {isAuthenticated ? (
        <div className="mt-6 rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40">
          <div className="flex items-center justify-between text-sm font-semibold text-ink-700 dark:text-ink-100">
            <span>Your progress</span>
            <span>{courseStats.completed} / {courseStats.total} lessons · {courseStats.percent}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
            <div className="h-full rounded-full bg-gold-400" style={{ width: `${courseStats.percent}%` }} />
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-500 dark:text-ink-400">
          <Link to="/login" state={{ from: { pathname: `/learn/${normalizedSlug}` } }} className="font-semibold text-gold-500 hover:underline">
            Log in
          </Link>{' '}
          to track your progress through this course.
        </p>
      )}

      <div className="mt-6 grid gap-4">
        {course.modules.map((module) => (
          <section key={module.id || module.title} className="rounded-lg border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900/40">
            <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">{module.title}</h2>
            <div className="mt-4 grid gap-2">
              {(Array.isArray(module.lessons) ? module.lessons : []).map((lesson) => {
                const lessonProgress = getLessonProgress(progress, lesson.id)
                const isCompleted = lessonProgress.status === 'completed'
                return (
                  <Link key={lesson.id} to={`/learn/lessons/${lesson.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700 hover:text-gold-500 dark:bg-ink-950 dark:text-ink-100">
                    <span>{lesson.title}</span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-ink-400">
                      {lessonProgress.bookmarked && <FiBookmark className="h-3.5 w-3.5 text-gold-500" />}
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-emerald-500"><FiCheckCircle className="h-3.5 w-3.5" /> Completed</span>
                      ) : (
                        <span className="capitalize">{String(lessonProgress.status || 'not_started').replaceAll('_', ' ')}</span>
                      )}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
