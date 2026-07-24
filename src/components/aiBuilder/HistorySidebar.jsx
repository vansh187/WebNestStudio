import { useEffect, useState } from 'react'
import { FiPlus, FiMessageSquare } from 'react-icons/fi'
import { Skeleton } from '../states/Skeleton'
import { getHistory } from '../../api/aiBuilder'
import { getErrorDetail } from '../../lib/apiClient'

function relativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export default function HistorySidebar({ activeId, onSelect, onNew, refreshKey }) {
  const [threads, setThreads] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getHistory()
      .then((data) => { if (!cancelled) setThreads(data.generations || []) })
      .catch((err) => { if (!cancelled) setError(getErrorDetail(err, 'Could not load history.')) })
    return () => { cancelled = true }
  }, [refreshKey])

  return (
    <div className="flex h-full w-full flex-col border-r border-ink-200 dark:border-ink-800">
      <div className="border-b border-ink-200 dark:border-ink-800 p-3">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 dark:bg-gold-400 px-3 py-2 text-sm font-semibold text-white dark:text-ink-950"
        >
          <FiPlus className="h-4 w-4" /> New generation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {threads === null && !error && (
          <div className="space-y-2 p-1">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        )}
        {error && <p className="p-2 text-xs text-red-500">{error}</p>}
        {threads && threads.length === 0 && (
          <p className="p-3 text-xs text-ink-400">No generations yet — start your first one below.</p>
        )}
        {threads && threads.map((t) => (
          <button
            key={t.generation_id}
            type="button"
            onClick={() => onSelect(t.generation_id)}
            className={`mb-1 flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
              activeId === t.generation_id
                ? 'bg-gold-400/10 text-gold-500'
                : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-900'
            }`}
          >
            <FiMessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{t.title}</span>
              <span className="block text-xs text-ink-400">{relativeTime(t.updated_at)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
