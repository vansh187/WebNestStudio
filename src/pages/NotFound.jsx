import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-8xl font-extrabold text-gradient-gold">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 dark:text-white">
        This page doesn't exist.
      </h1>
      <p className="mt-2 text-ink-500 dark:text-ink-300">
        Let's get you back to somewhere useful.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-gold-400 px-6 py-3 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-105"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  )
}
