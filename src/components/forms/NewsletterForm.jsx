import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiCheck, FiLoader } from 'react-icons/fi'
import { subscribeNewsletter } from '../../api/leads'
import { getErrorDetail } from '../../lib/apiClient'
import { newsletterSchema } from '../../schemas/leadSchemas'

export default function NewsletterForm({ source = 'footer' }) {
  const [done, setDone] = useState(false)
  const [error, setLocalError] = useState(null)
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(newsletterSchema) })

  const onSubmit = async ({ email }) => {
    setLocalError(null)
    try {
      // Idempotent on the backend, so no "already subscribed" check needed client-side.
      await subscribeNewsletter({ email, source })
      setDone(true)
    } catch (err) {
      setLocalError(getErrorDetail(err, 'Could not subscribe. Please try again.'))
    }
  }

  if (done) {
    return (
      <p className="flex items-center gap-2 text-sm text-gold-500">
        <FiCheck className="h-4 w-4" /> You're subscribed!
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="you@company.com"
          {...register('email')}
          className="min-w-0 flex-1 rounded-lg border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="shrink-0 rounded-lg bg-ink-900 dark:bg-gold-400 px-4 py-2 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {isSubmitting ? <FiLoader className="h-4 w-4 animate-spin" /> : 'Join'}
        </button>
      </div>
      {(errors.email || error) && (
        <p className="text-xs font-medium text-red-500">{errors.email?.message || error}</p>
      )}
    </form>
  )
}
