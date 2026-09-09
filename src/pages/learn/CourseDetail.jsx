import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCourse } from '../../api/learning'
import { SAMPLE_COURSES } from '../../data/codelabDefaults'
import { getErrorDetail } from '../../lib/apiClient'
import { useSeo } from '../../hooks/useSeo'
import { ErrorState, NotFoundState } from '../../components/states/StateViews'

function normalize(data, slug) {
  const sample = SAMPLE_COURSES.find((item) => item.slug === slug)
  const source = data?.id || data?.slug ? data : sample
  if (!source) return null
  return {
    id: source.id || source.slug,
    slug: source.slug || slug,
    title: source.title || 'Untitled course',
    modules: Array.isArray(source.modules) ? source.modules : [],
  }
}

export default function CourseDetail() {
  const { courseSlug } = useParams()
  const [course, setCourse] = useState(null)
  const [error, setError] = useState('')
  useSeo({ title: course?.title ? `${course.title} | Learn` : 'Course', description: 'Study a Webnest CodeLab course.', path: `/learn/${courseSlug || ''}` })

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const data = await getCourse(courseSlug)
        if (alive) setCourse(normalize(data, courseSlug))
      } catch (err) {
        const next = normalize(null, courseSlug)
        if (alive) {
          setCourse(next)
          setError(next ? getErrorDetail(err, 'Could not load the live course. Showing starter content.') : '')
        }
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [courseSlug])

  if (!course) return <NotFoundState title="Course not found" backTo="/learn" backLabel="Back to courses" />

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">{course.title}</h1>
      {error && <div className="mt-4"><ErrorState message={error} /></div>}
      <div className="mt-6 grid gap-4">
        {course.modules.map((module) => (
          <section key={module.id || module.title} className="rounded-lg border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900/40">
            <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">{module.title}</h2>
            <div className="mt-4 grid gap-2">
              {(Array.isArray(module.lessons) ? module.lessons : []).map((lesson) => (
                <Link key={lesson.id} to={`/learn/lessons/${lesson.id}`} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700 hover:text-gold-500 dark:bg-ink-950 dark:text-ink-100">
                  <span>{lesson.title}</span>
                  <span className="text-xs capitalize text-ink-400">{String(lesson.status || 'not_started').replaceAll('_', ' ')}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
