import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiLoader } from 'react-icons/fi'
import { upsertProjectStatus } from '../../api/admin'
import { getErrorDetail } from '../../lib/apiClient'
import { useToast } from '../../context/ToastContext'

export default function AdminProjectStatus() {
  const toast = useToast()
  const [banner, setBanner] = useState(null)
  const {
    register, handleSubmit, formState: { errors, isSubmitting }, setError,
  } = useForm({ defaultValues: { client_user_id: '', project_name: '', phase: 'Discovery', percent_complete: 0 } })

  const onSubmit = async ({ client_user_id, project_name, phase, percent_complete }) => {
    setBanner(null)
    try {
      await upsertProjectStatus(client_user_id, {
        project_name,
        phase,
        percent_complete: Number(percent_complete),
      })
      toast.success('Project status updated for this client.')
    } catch (error) {
      if (error.response?.status === 404) {
        setError('client_user_id', { type: 'server', message: 'No client found with this user ID' })
        return
      }
      setBanner(getErrorDetail(error, 'Could not update project status.'))
    }
  }

  return (
    <div>
      <h2 className="mb-2 font-display text-xl font-bold text-ink-900 dark:text-white">Client Project Status</h2>
      <p className="mb-6 text-sm text-ink-500 dark:text-ink-300">
        Creates or updates the status shown in a client's portal. This form works whether the
        client already has a status or not — no need to check first.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6">
        {banner && <p className="text-sm font-medium text-red-500">{banner}</p>}

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
            Client User ID (UUID)
          </label>
          <input
            {...register('client_user_id', { required: 'Client user ID is required' })}
            placeholder="282232c5-40f1-4247-a660-0e04cd386b78"
            className="mt-1.5 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm text-ink-900 dark:text-white focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
          />
          {errors.client_user_id && <p className="mt-1 text-xs font-medium text-red-500">{errors.client_user_id.message}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Project Name</label>
          <input
            {...register('project_name', { required: 'Project name is required' })}
            className="mt-1.5 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm text-ink-900 dark:text-white focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
          />
          {errors.project_name && <p className="mt-1 text-xs font-medium text-red-500">{errors.project_name.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Phase</label>
            <input
              {...register('phase', { required: true })}
              placeholder="Discovery, Design, Development…"
              className="mt-1.5 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm text-ink-900 dark:text-white focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Percent Complete</label>
            <input
              type="number"
              min={0}
              max={100}
              {...register('percent_complete', { required: true, min: 0, max: 100 })}
              className="mt-1.5 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm text-ink-900 dark:text-white focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-ink-900 dark:bg-gold-400 px-5 py-2.5 text-sm font-semibold text-white dark:text-ink-950 disabled:opacity-60"
        >
          {isSubmitting && <FiLoader className="h-4 w-4 animate-spin" />}
          Save Status
        </button>
      </form>
    </div>
  )
}
