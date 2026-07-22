import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiCheckCircle, FiDownload, FiLoader } from 'react-icons/fi'
import { FormField, ConsentCheckbox } from './FormField'
import { submitLead } from '../../api/leads'
import { getErrorDetail, applyFieldErrors } from '../../lib/apiClient'
import { resourceDownloadSchema } from '../../schemas/leadSchemas'

export default function ResourceDownloadForm({ resourceName }) {
  const [success, setSuccess] = useState(false)
  const [banner, setBanner] = useState(null)
  const {
    register, handleSubmit, formState: { errors, isSubmitting }, setError,
  } = useForm({
    resolver: zodResolver(resourceDownloadSchema),
    defaultValues: { resource_name: resourceName, consent_given: false },
  })

  const onSubmit = async (values) => {
    setBanner(null)
    try {
      await submitLead({ source: 'resource_download', ...values })
      setSuccess(true)
    } catch (error) {
      const mapped = applyFieldErrors(error, setError)
      if (!mapped) setBanner(getErrorDetail(error, 'Could not send your download. Please try again.'))
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gold-400/40 bg-gold-400/10 px-4 py-3 text-sm text-gold-600 dark:text-gold-400">
        <FiCheckCircle className="h-5 w-5 shrink-0" />
        Check your inbox — we've sent "{resourceName}" your way.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {banner && <p className="text-xs font-medium text-red-500">{banner}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Full Name" name="full_name" register={register} error={errors.full_name} placeholder="Jane Doe" />
        <FormField label="Email Address" name="email" type="email" register={register} error={errors.email} placeholder="jane@company.com" />
      </div>
      <input type="hidden" {...register('resource_name')} />
      <ConsentCheckbox register={register} error={errors.consent_given} />
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-xl bg-ink-900 dark:bg-gold-400 px-5 py-3 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {isSubmitting ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiDownload className="h-4 w-4" />}
        Send Me the Guide
      </button>
    </form>
  )
}
