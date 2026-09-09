import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiCode, FiFilter } from 'react-icons/fi'
import { listProblems } from '../../api/codelab'
import { SAMPLE_PROBLEMS } from '../../data/codelabDefaults'
import { getErrorDetail } from '../../lib/apiClient'
import { useSeo } from '../../hooks/useSeo'
import { EmptyState, ErrorState } from '../../components/states/StateViews'

function normalizeProblems(data) {
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
  return items.map((item) => ({
    id: item?.id || item?.slug,
    slug: item?.slug || item?.id,
    title: item?.title || 'Untitled problem',
    track: item?.track || 'python',
    difficulty: item?.difficulty || 'easy',
    points: Number(item?.points || 0),
    topics: Array.isArray(item?.topics) ? item.topics : [],
    status: item?.status || item?.user_progress?.status || 'not_started',
  })).filter((item) => item.slug)
}

export default function ProblemsList() {
  useSeo({ title: 'CodeLab Problems', description: 'Practice coding problems in Webnest CodeLab.', path: '/codelab/problems' })
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState(SAMPLE_PROBLEMS)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const track = params.get('track') || ''

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await listProblems(track ? { track } : undefined)
        if (alive) setItems(normalizeProblems(data))
      } catch (err) {
        if (alive) {
          setError(SAMPLE_PROBLEMS.length ? '' : getErrorDetail(err, 'Could not load problems.'))
          setItems(SAMPLE_PROBLEMS)
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [track])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Practice</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">Problems</h1>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 dark:text-ink-200">
          <FiFilter className="h-4 w-4" />
          <select value={track} onChange={(e) => setParams(e.target.value ? { track: e.target.value } : {})} className="rounded-lg border border-ink-200 bg-white px-3 py-2 dark:border-ink-800 dark:bg-ink-950">
            <option value="">All tracks</option>
            <option value="python">Python</option>
            <option value="web">Web Development</option>
          </select>
        </label>
      </div>
      {error && <div className="mt-4"><ErrorState message={error} /></div>}
      {!loading && !items.length ? (
        <div className="mt-6"><EmptyState icon={FiCode} title="No problems yet" description="Published problems will appear here." /></div>
      ) : (
        <div className="mt-6 grid gap-3">
          {(items.length ? items : SAMPLE_PROBLEMS).map((problem) => (
            <Link key={problem.slug} to={`/codelab/problems/${problem.slug}`} className="rounded-lg border border-ink-200 bg-white p-4 hover:border-gold-400 dark:border-ink-800 dark:bg-ink-900/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{problem.title}</h2>
                <span className="rounded-full bg-gold-400/10 px-2 py-1 text-xs font-semibold text-gold-600">{problem.points} XP</span>
              </div>
              <p className="mt-2 text-sm capitalize text-ink-500 dark:text-ink-300">{problem.track} · {problem.difficulty} · {problem.status.replaceAll('_', ' ')}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
