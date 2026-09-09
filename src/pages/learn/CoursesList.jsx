import { Link } from 'react-router-dom'
import { FiBookOpen } from 'react-icons/fi'
import { SAMPLE_COURSES } from '../../data/codelabDefaults'
import { useSeo } from '../../hooks/useSeo'
import { EmptyState } from '../../components/states/StateViews'

export default function CoursesList() {
  useSeo({ title: 'Learn', description: 'Static programming language courses from Webnest CodeLab.', path: '/learn' })
  const courses = SAMPLE_COURSES

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Study</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">Courses</h1>
      <p className="mt-2 max-w-3xl text-ink-500 dark:text-ink-300">
        Static language guides with beginner-friendly concepts, syntax patterns, and examples. No server loading required.
      </p>
      {!courses.length ? (
        <div className="mt-6"><EmptyState icon={FiBookOpen} title="No courses yet" description="Static courses will appear here." /></div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.slug} to={`/learn/${course.slug}`} className="rounded-lg border border-ink-200 bg-white p-5 hover:border-gold-400 dark:border-ink-800 dark:bg-ink-900/40">
              <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">{course.title}</h2>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">{course.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-ink-400">{course.level} · {course.lessons_count} lessons</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
