import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiCheckCircle, FiCode, FiFilter } from 'react-icons/fi'
import { listProblems } from '../../api/codelab'
import { SAMPLE_PROBLEMS } from '../../data/codelabDefaults'
import { getErrorDetail } from '../../lib/apiClient'
import { useSeo } from '../../hooks/useSeo'
import { EmptyState, ErrorState } from '../../components/states/StateViews'
import BackButton from '../../components/coding/BackButton'

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

// Full class names so Tailwind keeps them.
const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', hint: 'Warm-ups on one idea', dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', edge: 'border-l-emerald-500 dark:border-l-emerald-500' },
  { key: 'medium', label: 'Medium', hint: 'Combine two or three ideas', dot: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400', edge: 'border-l-amber-500 dark:border-l-amber-500' },
  { key: 'hard', label: 'Hard', hint: 'Needs a plan before you code', dot: 'bg-rose-500', badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400', edge: 'border-l-rose-500 dark:border-l-rose-500' },
]

const difficultyKey = (problem) => {
  const key = String(problem.difficulty || '').toLowerCase()
  return DIFFICULTIES.some((level) => level.key === key) ? key : 'easy'
}

function StatusLabel({ status }) {
  const value = String(status || 'not_started')
  if (value === 'solved' || value === 'completed' || value === 'accepted') {
    return <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400"><FiCheckCircle className="h-4 w-4" /> Solved</span>
  }
  if (value === 'not_started') return <span>Not started</span>
  return <span className="capitalize text-gold-600">{value.replaceAll('_', ' ')}</span>
}

export default function ProblemsList() {
  useSeo({ title: 'CodeLab Problems', description: 'Practice coding problems in Webnest CodeLab.', path: '/codelab/problems' })
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState(SAMPLE_PROBLEMS)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const track = params.get('track') || ''
  const difficulty = params.get('difficulty') || ''

  const setFilter = (name, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(name, value)
    else next.delete(name)
    setParams(next)
  }

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

  const problems = items.length ? items : SAMPLE_PROBLEMS
  const groups = DIFFICULTIES.map((level) => ({ ...level, problems: problems.filter((problem) => difficultyKey(problem) === level.key) }))
  const visibleGroups = groups.filter((group) => group.problems.length && (!difficulty || group.key === difficulty))
  const chips = [{ key: '', label: 'All', count: problems.length }, ...groups.map((group) => ({ key: group.key, label: group.label, count: group.problems.length, dot: group.dot }))]

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <BackButton fallback="/codelab" className="mb-4" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Practice</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">Problems</h1>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 dark:text-ink-200">
          <FiFilter className="h-4 w-4" />
          <select value={track} onChange={(e) => setFilter('track', e.target.value)} className="rounded-lg border border-ink-200 bg-white px-3 py-2 dark:border-ink-800 dark:bg-ink-950">
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
        <>
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by difficulty">
            {chips.map((chip) => {
              const active = difficulty === chip.key
              return (
                <button key={chip.key || 'all'} type="button" aria-pressed={active} onClick={() => setFilter('difficulty', chip.key)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? 'border-ink-900 bg-ink-900 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-ink-950' : 'border-ink-200 bg-white text-ink-700 hover:border-gold-400 dark:border-ink-800 dark:bg-ink-950 dark:text-ink-200'}`}>
                  {chip.dot && <span className={`h-2 w-2 rounded-full ${chip.dot}`} />}
                  {chip.label}
                  <span className={active ? 'opacity-80' : 'text-ink-400'}>{chip.count}</span>
                </button>
              )
            })}
          </div>
          {!visibleGroups.length && (
            <div className="mt-6"><EmptyState icon={FiCode} title="No problems at this level yet" description="Try another difficulty or track." /></div>
          )}
          {visibleGroups.map((group) => (
            <section key={group.key} className="mt-8" aria-labelledby={`level-${group.key}`}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-ink-200 pb-2 dark:border-ink-800">
                <h2 id={`level-${group.key}`} className="inline-flex items-center gap-2 font-display text-xl font-bold text-ink-900 dark:text-white">
                  <span className={`h-2.5 w-2.5 rounded-full ${group.dot}`} />
                  {group.label}
                </h2>
                <p className="text-sm text-ink-500 dark:text-ink-300">{group.hint} · {group.problems.length} {group.problems.length === 1 ? 'problem' : 'problems'}</p>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {group.problems.map((problem) => (
                  <Link key={problem.slug} to={`/codelab/problems/${problem.slug}`} className={`rounded-lg border border-l-4 border-ink-200 bg-white p-4 transition hover:shadow-md dark:border-ink-800 dark:bg-ink-900/40 ${group.edge}`}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{problem.title}</h3>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${group.badge}`}>{group.label}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500 dark:text-ink-300">
                      <span className="capitalize">{problem.track}</span>
                      <span aria-hidden="true">·</span>
                      <StatusLabel status={problem.status} />
                      <span className="ml-auto rounded-full bg-gold-400/10 px-2 py-1 text-xs font-semibold text-gold-600">{problem.points} XP</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </main>
  )
}
