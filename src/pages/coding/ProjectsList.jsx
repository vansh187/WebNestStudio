import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPlus, FiCode, FiTrash2, FiLoader } from 'react-icons/fi'
import { useSeo } from '../../hooks/useSeo'
import { useToast } from '../../context/ToastContext'
import { SkeletonGrid } from '../../components/states/Skeleton'
import { ErrorState, EmptyState } from '../../components/states/StateViews'
import NewProjectModal from '../../components/coding/NewProjectModal'
import BackButton from '../../components/coding/BackButton'
import { getLanguage } from '../../data/codingLanguages'
import { listProjects, deleteProject, getCodingStats } from '../../api/coding'
import { getErrorDetail } from '../../lib/apiClient'

function formatRelative(iso) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.round((Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(then).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function ProjectCard({ project, onDelete, deleting }) {
  const lang = getLanguage(project.language)
  return (
    <div className="relative flex flex-col rounded-2xl border border-ink-200 bg-white p-5 transition-colors hover:border-gold-400 dark:border-ink-800 dark:bg-ink-900/40">
      <Link to={`/projects/${project.id}`} className="flex-1 pr-9">
        <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
          {project.title || 'Untitled project'}
        </h3>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-200">
          <FiCode className="h-3.5 w-3.5" /> {lang?.label ?? project.language}
        </span>
        {project.updated_at && (
          <p className="mt-3 text-xs text-ink-400">Updated {formatRelative(project.updated_at)}</p>
        )}
      </Link>
      <button
        type="button"
        onClick={() => onDelete(project.id)}
        disabled={deleting}
        aria-label={`Delete ${project.title || 'project'}`}
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-60"
      >
        {deleting ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiTrash2 className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default function ProjectsList() {
  useSeo({ title: 'My Projects', noindex: true, path: '/projects' })
  const toast = useToast()
  const navigate = useNavigate()

  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    setItems(null)
    setError(null)
    listProjects({ limit: 100 })
      .then((data) => {
        if (cancelled) return
        setItems(Array.isArray(data) ? data : (data.items ?? []))
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorDetail(err, 'Could not load your projects.'))
      })
    // Optional endpoint — never blocks the page.
    getCodingStats()
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const handleDelete = useCallback(
    async (projectId) => {
      if (!window.confirm('Delete this project? This cannot be undone.')) return
      setDeletingId(projectId)
      try {
        await deleteProject(projectId)
        setItems((prev) => (prev ?? []).filter((p) => p.id !== projectId))
        toast.success('Project deleted.')
      } catch (err) {
        toast.error(getErrorDetail(err, 'Could not delete the project.'))
      } finally {
        setDeletingId(null)
      }
    },
    [toast],
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <BackButton fallback="/" className="mb-3" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Make a Project</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">My projects</h1>
          {stats && typeof stats.projects_count === 'number' && (
            <p className="mt-1 text-xs text-ink-400">
              {stats.projects_count} {stats.projects_count === 1 ? 'project' : 'projects'}
              {stats.last_activity_at && <> · last active {formatRelative(stats.last_activity_at)}</>}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] dark:bg-gold-400 dark:text-ink-950"
        >
          <FiPlus className="h-4 w-4" /> New project
        </button>
      </div>

      <div className="mt-8">
        {items === null && !error && (
          <SkeletonGrid count={6} columns="sm:grid-cols-2 lg:grid-cols-3" />
        )}
        {error && <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />}
        {items && !error && items.length === 0 && (
          <EmptyState
            icon={FiCode}
            title="No projects yet"
            description="Create your first project and start coding — your work saves automatically."
          />
        )}
        {items && items.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 2xl:grid-cols-4">
            {items.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onDelete={handleDelete}
                deleting={deletingId === p.id}
              />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <NewProjectModal
          onClose={() => setModalOpen(false)}
          onCreated={(project) => navigate(`/projects/${project.id}`)}
        />
      )}
    </div>
  )
}
