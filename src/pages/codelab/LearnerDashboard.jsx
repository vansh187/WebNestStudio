import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAward, FiBarChart2, FiBookOpen, FiCheckCircle, FiZap } from 'react-icons/fi'
import { getCodeLabDashboard } from '../../api/codelab'
import { getErrorDetail } from '../../lib/apiClient'
import { useAuth } from '../../context/AuthContext'
import { useSeo } from '../../hooks/useSeo'
import { ErrorState, EmptyState } from '../../components/states/StateViews'
import { readLearningProgress, getStartedCoursesProgress, getLearningTotals } from '../../lib/learningProgress'

const fallback = {
  summary: { problems_total: 0, attempted: 0, solved: 0, completion_percent: 0, xp: 0, current_streak: 0, best_streak: 0 },
  track_progress: [],
  continue_learning: null,
  recent_activity: [],
}

export default function LearnerDashboard() {
  useSeo({ title: 'CodeLab Dashboard', description: 'Track your Webnest CodeLab progress.', path: '/codelab/dashboard' })
  const { user, isAuthenticated } = useAuth()
  const userKey = user?.email || null
  const [dashboard, setDashboard] = useState(fallback)
  const [error, setError] = useState('')

  const learningProgress = useMemo(() => readLearningProgress(userKey), [userKey])
  const startedCourses = useMemo(() => getStartedCoursesProgress(learningProgress), [learningProgress])
  const learningTotals = useMemo(() => getLearningTotals(learningProgress), [learningProgress])

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const data = await getCodeLabDashboard()
        if (alive) setDashboard({ ...fallback, ...data, summary: { ...fallback.summary, ...(data?.summary || {}) }, track_progress: Array.isArray(data?.track_progress) ? data.track_progress : [], recent_activity: Array.isArray(data?.recent_activity) ? data.recent_activity : [] })
      } catch (err) {
        if (alive) setError(getErrorDetail(err, 'Could not load your dashboard.'))
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  const s = dashboard.summary
  const cards = [
    { label: 'Solved', value: s.solved, icon: FiCheckCircle },
    { label: 'Completion', value: `${s.completion_percent}%`, icon: FiBarChart2 },
    { label: 'XP', value: s.xp, icon: FiAward },
    { label: 'Streak', value: `${s.current_streak} days`, icon: FiZap },
  ]

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">CodeLab Dashboard</h1>
      {error && <div className="mt-4"><ErrorState message={error} /></div>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40">
            <Icon className="h-5 w-5 text-gold-500" />
            <p className="mt-3 text-2xl font-bold text-ink-900 dark:text-white">{value}</p>
            <p className="text-sm text-ink-500 dark:text-ink-300">{label}</p>
          </div>
        ))}
      </div>
      {dashboard.continue_learning && (
        <Link to={`/codelab/problems/${dashboard.continue_learning.slug}`} className="mt-6 block rounded-lg border border-gold-400/50 bg-gold-400/10 p-4 text-ink-900 dark:text-white">
          Continue: {dashboard.continue_learning.title}
        </Link>
      )}

      <h2 className="mt-10 font-display text-2xl font-bold text-ink-900 dark:text-white">My Learning</h2>
      {!isAuthenticated ? (
        <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
          <Link to="/login" state={{ from: { pathname: '/codelab/dashboard' } }} className="font-semibold text-gold-500 hover:underline">
            Log in
          </Link>{' '}
          to see progress across the courses and lessons you've marked complete.
        </p>
      ) : startedCourses.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            icon={FiBookOpen}
            title="No lessons started yet"
            description="Mark a lesson complete or bookmark one in Learn to see it tracked here."
          />
        </div>
      ) : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40">
              <p className="mt-1 text-2xl font-bold text-ink-900 dark:text-white">{learningTotals.lessonsCompleted}</p>
              <p className="text-sm text-ink-500 dark:text-ink-300">Lessons completed</p>
            </div>
            <div className="rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40">
              <p className="mt-1 text-2xl font-bold text-ink-900 dark:text-white">{learningTotals.coursesCompleted}</p>
              <p className="text-sm text-ink-500 dark:text-ink-300">Courses completed</p>
            </div>
            <div className="rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40">
              <p className="mt-1 text-2xl font-bold text-ink-900 dark:text-white">{learningTotals.coursesInProgress}</p>
              <p className="text-sm text-ink-500 dark:text-ink-300">Courses in progress</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {startedCourses.map(({ course, completed, total, percent }) => (
              <Link
                key={course.slug}
                to={`/learn/${course.slug}`}
                className="rounded-lg border border-ink-200 bg-white p-4 hover:border-gold-400 dark:border-ink-800 dark:bg-ink-900/40"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink-900 dark:text-white">{course.title}</span>
                  <span className="text-ink-500 dark:text-ink-300">{completed} / {total} lessons · {percent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <div className="h-full rounded-full bg-gold-400" style={{ width: `${percent}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
