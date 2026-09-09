import { Link, useParams } from 'react-router-dom'
import { SAMPLE_COURSES } from '../../data/codelabDefaults'
import { useSeo } from '../../hooks/useSeo'
import { NotFoundState } from '../../components/states/StateViews'

export default function CourseDetail() {
  const { courseSlug } = useParams()
  const normalizedSlug = courseSlug === 'java' ? 'java-core' : courseSlug
  const course = SAMPLE_COURSES.find((item) => item.slug === normalizedSlug)

  useSeo({
    title: course?.title ? `${course.title} | Learn` : 'Course',
    description: course?.description || 'Study a static Webnest CodeLab course.',
    path: `/learn/${normalizedSlug || ''}`,
  })

  if (!course) return <NotFoundState title="Course not found" backTo="/learn" backLabel="Back to courses" />

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Course</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">{course.title}</h1>
      <p className="mt-2 max-w-3xl text-ink-500 dark:text-ink-300">{course.description}</p>
      <div className="mt-6 grid gap-4">
        {course.modules.map((module) => (
          <section key={module.id || module.title} className="rounded-lg border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900/40">
            <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">{module.title}</h2>
            <div className="mt-4 grid gap-2">
              {(Array.isArray(module.lessons) ? module.lessons : []).map((lesson) => (
                <Link key={lesson.id} to={`/learn/lessons/${lesson.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700 hover:text-gold-500 dark:bg-ink-950 dark:text-ink-100">
                  <span>{lesson.title}</span>
                  <span className="shrink-0 text-xs capitalize text-ink-400">{String(lesson.status || 'not_started').replaceAll('_', ' ')}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
