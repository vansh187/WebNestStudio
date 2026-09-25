import { Link } from 'react-router-dom'
import { FiBookOpen } from 'react-icons/fi'
import { SAMPLE_COURSES } from '../../data/codelabDefaults'
import { useSeo } from '../../hooks/useSeo'
import { EmptyState } from '../../components/states/StateViews'
import BackButton from '../../components/coding/BackButton'

export default function CoursesList() {
  useSeo({ title: 'Learn Java, Python, React and SQL', description: 'Free programming tutorials from WebNest Studio: Core Java, Advanced Java, Spring, Python, React and databases, with examples and coding practice.', path: '/learn' })
  const courses = SAMPLE_COURSES

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <BackButton fallback="/codelab" label="Back to CodeLab" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold-500">Study</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">Learn programming with WebNest Studio</h1>
      <p className="mt-2 max-w-3xl text-ink-500 dark:text-ink-300">
        Learn concepts, understand examples, and practice your code. Explore Java, Spring, Python, web development and databases at your own pace.
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
      <p className="mt-8 text-sm text-ink-500 dark:text-ink-300">WebNest Studio is an IT consultancy and software development company in New Delhi. Explore our <Link className="underline" to="/services">development services</Link> or <Link className="underline" to="/portfolio">project portfolio</Link>.</p>
    </div>
  )
}
