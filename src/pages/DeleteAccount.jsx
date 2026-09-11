import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle, FiLoader, FiTrash2 } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CONTACT } from '../data/site'
import { useSeo } from '../hooks/useSeo'

const DATA_ERASED = [
  'Your account profile (name, email, phone)',
  'Saved coding projects, playground snippets, and submission history',
  'CodeLab progress, streaks, XP, bookmarks, and notes',
  'AI project-planning chat threads and generated plans',
]

export default function DeleteAccount() {
  useSeo({
    title: 'Delete Account',
    description: 'Permanently delete your WebNest Studio account and associated data.',
    path: '/delete-account',
    noindex: true,
  })

  const { user, deleteAccount } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!confirmed) {
      setError('Please confirm you understand this action is permanent.')
      return
    }
    setSubmitting(true)
    const result = await deleteAccount()
    setSubmitting(false)
    if (result.ok) {
      toast.success('Your account and data have been deleted.')
      navigate('/', { replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20 lg:px-8">
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-500">
          Danger Zone
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold text-ink-900 dark:text-white">Delete your account</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
          This permanently deletes the account signed in as <strong className="text-ink-900 dark:text-white">{user?.email}</strong>{' '}
          and all data associated with it. This action cannot be undone.
        </p>

        <div className="mt-6 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900/40">
          <p className="text-sm font-semibold text-ink-900 dark:text-white">The following will be erased:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-500 dark:text-ink-300">
            {DATA_ERASED.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="flex items-start gap-3 text-sm text-ink-500 dark:text-ink-300">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-ink-300 text-red-500 focus:ring-red-400"
            />
            I understand this permanently deletes my account and cannot be undone.
          </label>

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-500">
              <FiAlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
          >
            {submitting ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiTrash2 className="h-4 w-4" />}
            {submitting ? 'Deleting…' : 'Permanently delete my account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400 dark:text-ink-500">
          Trouble deleting your account? Email{' '}
          <a href={CONTACT.emailHref} className="font-semibold text-gold-500 hover:underline">
            {CONTACT.email}
          </a>{' '}
          and we'll process the request within 30 days.
        </p>
      </Reveal>
    </div>
  )
}
