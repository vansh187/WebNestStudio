import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBookOpen } from 'react-icons/fi'
import { listCourses } from '../../api/learning'
import { SAMPLE_COURSES } from '../../data/codelabDefaults'
import { getErrorDetail } from '../../lib/apiClient'
import { useSeo } from '../../hooks/useSeo'
import { EmptyState, ErrorState } from '../../components/states/StateViews'

function normalize(data) {
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
  return items.map((item) => ({
    id: item?.id || item?.slug,
    slug: item?.slug || item?.id,
    title: item?.title || 'Untitled course',
    level: item?.level || 'beginner',
    description: item?.description || '',
    lessons_count: Number(item?.lessons_count || 0),
    completion_percent: Number(item?.completion_percent || 0),
  })).filter((item) => item.slug)
}

export default function CoursesList() {
  useSeo({ title: 'Learn', description: 'Study Webnest CodeLab courses.', path: '/learn' })
  const [courses, setCourses] = useState(SAMPLE_COURSES)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const data = await listCourses()
        if (alive) setCourses(normalize(data))
      } catch (err) {
        if (alive) {
          setError(getErrorDetail(err, 'Could not load courses. Showing starter courses.'))
          setCourses(SAMPLE_COURSES)
        }
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Study</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">Courses</h1>
      {error && <div className="mt-4"><ErrorState message={error} /></div>}
      {!courses.length ? (
        <div className="mt-6"><EmptyState icon={FiBookOpen} title="No courses yet" description="Published courses will appear here." /></div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.slug} to={`/learn/${course.slug}`} className="rounded-lg border border-ink-200 bg-white p-5 hover:border-gold-400 dark:border-ink-800 dark:bg-ink-900/40">
              <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">{course.title}</h2>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">{course.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-ink-400">{course.level} · {course.lessons_count} lessons · {course.completion_percent}%</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
