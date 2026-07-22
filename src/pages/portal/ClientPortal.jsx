import { useEffect, useState } from 'react'
import { FiFolder, FiLogOut } from 'react-icons/fi'
import Reveal from '../../components/Reveal'
import { Skeleton } from '../../components/states/Skeleton'
import { ErrorState, EmptyState } from '../../components/states/StateViews'
import { getMyProjectStatus, getMyFiles } from '../../api/me'
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

function FilesCard() {
  const [files, setFiles] = useState(null)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setFiles(null)
    setError(null)
    getMyFiles()
      .then((data) => { if (!cancelled) setFiles(data) })
      .catch((err) => { if (!cancelled) setError(getErrorDetail(err, 'Could not load your files.')) })
    return () => { cancelled = true }
  }, [reloadKey])

  if (error) return <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />

  if (files === null) {
    return (
      <div className="rounded-2xl border border-ink-200 dark:border-ink-800 p-7">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="mt-4 h-10 w-full" />
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <EmptyState
        icon={FiFolder}
        title="No files yet"
        description="Files your team shares with you will show up here."
      />
    )
  }

  return (
    <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-7">
      <ul className="space-y-3">
        {files.map((f) => (
          <li key={f.id ?? f.url} className="flex items-center gap-3 text-sm text-ink-700 dark:text-ink-200">
            <FiFolder className="h-4 w-4 text-gold-500" />
            {f.name ?? f.url}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ClientPortal() {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Client Portal</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">
              Welcome back, {user?.full_name?.split(' ')[0]}
            </h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-700 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:border-gold-400 hover:text-gold-500 dark:text-ink-200"
          >
            <FiLogOut className="h-4 w-4" /> Log out
          </button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">Project Status</h2>
            <ProjectStatusCard />
          </section>
          <section>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">Files</h2>
            <FilesCard />
          </section>
        </div>
      </Reveal>
    </div>
  )
}
