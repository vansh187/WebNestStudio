import Breadcrumbs from '../../components/Breadcrumbs'
import { RelatedService } from '../../components/RelatedLinks'
import { trackEvent } from '../../lib/analytics'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import CourseRoadmap from '../../components/CourseRoadmap'
import { SAMPLE_COURSES } from '../../data/codelabDefaults'
import { useAuth } from '../../context/AuthContext'
import { useSeo, useStructuredData, SITE_NAME, SITE_URL } from '../../hooks/useSeo'
import { NotFoundState } from '../../components/states/StateViews'
import BackButton from '../../components/coding/BackButton'
import { readLearningProgress, getCourseProgress } from '../../lib/learningProgress'

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
  // First lesson not yet completed: drives "Start/Continue" and the roadmap's "Up next".
  const nextLessonId = course.modules.flatMap((module) => module.lessons).find((lesson) => progress[lesson.id]?.status !== 'completed')?.id || course.modules[0].lessons[0].id

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' }, { label: course.title, to: `/learn/${course.slug}` }]} />
      <BackButton fallback="/learn" label="Back to courses" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold-500">Course</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">{course.title}</h1>
      <p className="mt-2 max-w-3xl text-ink-500 dark:text-ink-300">{course.description}</p>

      <Link to={`/learn/lessons/${nextLessonId}`} onClick={() => trackEvent('course_started', { course_slug: course.slug })} className="mt-5 inline-flex rounded-lg bg-gold-400 px-5 py-3 font-semibold text-ink-950">{courseStats.completed ? 'Continue learning' : 'Start course'}</Link>
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

      <CourseRoadmap course={course} progress={progress} nextLessonId={nextLessonId} />
      <RelatedService courseSlug={course.slug} className="mt-8" />
    </div>
  )
}
