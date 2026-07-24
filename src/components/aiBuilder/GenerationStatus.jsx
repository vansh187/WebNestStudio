import { useEffect, useState } from 'react'
import { FiLoader, FiAlertTriangle, FiClock, FiRefreshCw } from 'react-icons/fi'

const LOADING_MESSAGES = [
  'Designing your layout...',
  'Writing the markup...',
  'Applying your styling...',
  'Polishing the details...',
]

function useRotatingText(active) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (!active) return undefined
    const id = setInterval(() => setIndex((i) => (i + 1) % LOADING_MESSAGES.length), 2200)
    return () => clearInterval(id)
  }, [active])
  return LOADING_MESSAGES[index]
}

function formatResetTime(resetAt) {
  if (!resetAt) return 'shortly'
  try {
    return new Date(resetAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  } catch {
    return 'shortly'
  }
}

export default function GenerationStatus({ status }) {
  const loadingText = useRotatingText(status?.type === 'loading')

  if (!status || status.type === 'idle') return null

  if (status.type === 'loading') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gold-400/30 bg-gold-400/5 px-3 py-2.5 text-sm text-ink-600 dark:text-ink-300">
        <FiLoader className="h-4 w-4 shrink-0 animate-spin text-gold-500" />
        {loadingText}
      </div>
    )
  }

  if (status.type === 'rate-limited') {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-gold-400/40 bg-gold-400/10 px-3 py-2.5 text-sm text-ink-700 dark:text-ink-200">
        <FiClock className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
        <span>
          You've used all your free generations for now. Resets at {formatResetTime(status.resetAt)}.
        </span>
      </div>
    )
  }

  if (status.type === 'error') {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2.5 text-sm text-red-500">
        <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1">
          <p>{status.message}</p>
          {status.onRetry && (
            <button
              type="button"
              onClick={status.onRetry}
              className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold underline"
            >
              <FiRefreshCw className="h-3 w-3" /> Try again
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}
