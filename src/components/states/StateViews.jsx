import { Link } from 'react-router-dom'
import { FiAlertCircle, FiInbox, FiRefreshCw, FiSearch } from 'react-icons/fi'

export function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-ink-200 dark:border-ink-800 px-6 py-14 text-center">
      <FiAlertCircle className="h-8 w-8 text-red-500" />
      <p className="max-w-sm text-sm text-ink-500 dark:text-ink-300">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-gold-400 px-5 py-2.5 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-105"
        >
          <FiRefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon = FiInbox, title = 'Nothing here yet', description }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 dark:border-ink-800 px-6 py-14 text-center">
      <Icon className="h-8 w-8 text-ink-300 dark:text-ink-600" />
      <p className="font-semibold text-ink-700 dark:text-ink-100">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-500 dark:text-ink-300">{description}</p>}
    </div>
  )
}

export function NotFoundState({
  title = 'We couldn’t find that page',
  description = 'The link may be outdated or the item may have been removed.',
  backTo = '/',
  backLabel = 'Back to home',
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-24 text-center">
      <FiSearch className="h-10 w-10 text-gold-400" />
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">{title}</h1>
      <p className="text-ink-500 dark:text-ink-300">{description}</p>
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-gold-400 px-6 py-3 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-105"
      >
        {backLabel}
      </Link>
    </div>
  )
}
