import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCode } from 'react-icons/fi'
import Reveal from '../../components/Reveal'
import { Skeleton } from '../../components/states/Skeleton'
import { ErrorState, EmptyState } from '../../components/states/StateViews'
import BackButton from '../../components/coding/BackButton'
import { getMyProjectStatus } from '../../api/me'
import { listProjects } from '../../api/coding'
import { getCodeLabDashboard } from '../../api/codelab'
import { getLanguage } from '../../data/codingLanguages'
import { readLearningProgress, getStartedCoursesProgress } from '../../lib/learningProgress'
import { getErrorDetail } from '../../lib/apiClient'
import { useAuth } from '../../context/AuthContext'

function ProjectStatusCard() {
  const [status, setStatus] = useState(undefined) // undefined = loading, null = no project yet
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus(undefined)
    setError(null)
    getMyProjectStatus()
      .then((data) => { if (!cancelled) setStatus(data) })
      .catch((err) => {
        if (cancelled) return
        if (err.response?.status === 404) {
          setStatus(null)
        } else {
          setError(getErrorDetail(err, 'Could not load your project status.'))
        }
      })
    return () => { cancelled = true }
  }, [reloadKey])

  if (error) return <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />

  if (status === undefined) {
    return (
      <div className="rounded-2xl border border-ink-200 dark:border-ink-800 p-7">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="mt-6 h-5 w-1/3" />
        <Skeleton className="mt-4 h-3 w-full" />
      </div>
    )
  }

  if (status === null) {
    return (
      <EmptyState
        title="Your project hasn't started yet"
        description="Check back soon — we'll post updates here once your engagement kicks off."
      />
    )
  }

  return (
    <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">{status.phase}</p>
          <h3 className="mt-1 font-display text-xl font-bold text-ink-900 dark:text-white">{status.project_name}</h3>
        </div>
        <span className="font-display text-2xl font-extrabold text-gradient-gold">{status.percent_complete}%</span>
      </div>
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500"
          style={{ width: `${status.percent_complete}%` }}
        />
      </div>
      <p className="mt-4 text-xs text-ink-400">
        Last updated {new Date(status.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  )
}

const PROJECTS_SHOWN = 5

// The coding projects the user has started in "Make a Project".
function CodingProjectsCard() {
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setProjects(null)
    setError(null)
    listProjects({ limit: 100 })
      .then((data) => { if (!cancelled) setProjects(Array.isArray(data) ? data : (data?.items ?? [])) })
      .catch((err) => { if (!cancelled) setError(getErrorDetail(err, 'Could not load your projects.')) })
    return () => { cancelled = true }
  }, [reloadKey])

  if (error) return <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />

  if (projects === null) {
    return (
      <div className="rounded-2xl border border-ink-200 dark:border-ink-800 p-7">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="mt-4 h-10 w-full" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 dark:border-ink-800 px-6 py-10 text-center">
        <FiCode className="mx-auto h-8 w-8 text-ink-300 dark:text-ink-600" />
        <p className="mt-3 font-semibold text-ink-900 dark:text-white">No projects yet</p>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">Projects you start coding will show up here.</p>
        <Link to="/projects" className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-gold-400 dark:text-ink-950">
          Start coding <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-7 flex flex-col">
      <ul className="divide-y divide-ink-100 dark:divide-ink-800">
        {projects.slice(0, PROJECTS_SHOWN).map((project) => (
          <li key={project.id}>
            <Link to={`/projects/${project.id}`} className="flex items-center gap-3 py-3 first:pt-0 hover:text-gold-500">
              <FiCode className="h-4 w-4 shrink-0 text-gold-500" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900 dark:text-white">{project.title || 'Untitled project'}</span>
              <span className="shrink-0 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-200">
                {getLanguage(project.language)?.label ?? project.language}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/projects" className="mt-auto pt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-gold-600 hover:underline">
        {projects.length > PROJECTS_SHOWN ? `View all ${projects.length} projects` : 'Open my projects'} <FiArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

// Courses the user has started, with lesson progress, plus their CodeLab numbers.
function LearningDashboardCard({ userKey }) {
  const progress = useMemo(() => readLearningProgress(userKey), [userKey])
  const startedCourses = useMemo(() => getStartedCoursesProgress(progress), [progress])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    let cancelled = false
    // Optional numbers; the card works without them.
    getCodeLabDashboard()
      .then((data) => { if (!cancelled) setSummary(data?.summary || null) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const stats = [
    { label: 'Courses started', value: startedCourses.length },
    { label: 'Problems solved', value: summary?.solved ?? 0 },
    { label: 'XP', value: summary?.xp ?? 0 },
    { label: 'Day streak', value: summary?.current_streak ?? 0 },
  ]

  return (
    <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-7">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-ink-50 p-4 dark:bg-ink-950">
            <p className="font-display text-2xl font-bold text-ink-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-ink-500 dark:text-ink-300">{stat.label}</p>
          </div>
        ))}
      </div>
      {startedCourses.length === 0 ? (
        <p className="mt-6 text-sm text-ink-500 dark:text-ink-300">
          You have not started a course yet. Mark a lesson complete in{' '}
          <Link to="/learn" className="font-semibold text-gold-600 hover:underline">Learn</Link> and it will be tracked here.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {startedCourses.map(({ course, completed, total, percent }) => (
            <li key={course.slug}>
              <Link to={`/learn/${course.slug}`} className="block hover:text-gold-500">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-ink-900 dark:text-white">{course.title}</span>
                  <span className="text-ink-500 dark:text-ink-300">{completed} / {total} lessons · {percent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" style={{ width: `${percent}%` }} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/codelab/dashboard" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 hover:underline">
        Open full dashboard <FiArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default function ClientPortal() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
      <BackButton fallback="/" className="mb-6" />
      <Reveal>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Client Portal</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">
            Welcome back, {user?.full_name?.split(' ')[0]}
          </h1>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="flex flex-col [&>*:last-child]:flex-1">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">Project Status</h2>
            <ProjectStatusCard />
          </section>
          <section className="flex flex-col [&>*:last-child]:flex-1">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">My Projects</h2>
            <CodingProjectsCard />
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">My Learning</h2>
          <LearningDashboardCard userKey={user?.email || null} />
        </section>

        <section className="mt-10 rounded-2xl border border-red-400/30 bg-red-400/5 p-5">
          <h2 className="font-display text-sm font-semibold text-red-500">Danger Zone</h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            Permanently delete your account and all associated data.
          </p>
          <Link
            to="/delete-account"
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500 hover:text-white"
          >
            Delete account
          </Link>
        </section>
      </Reveal>
    </div>
  )
}
