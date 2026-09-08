import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiX, FiLoader } from 'react-icons/fi'
import { newProjectSchema } from '../../schemas/codingSchemas'
import { LANGUAGES, getLanguage, mainFileName } from '../../data/codingLanguages'
import { createProject, toCodePayload } from '../../api/coding'
import { getErrorDetail, applyFieldErrors } from '../../lib/apiClient'
import { useToast } from '../../context/ToastContext'

// Full-screen sheet on phones, centred dialog from `sm` up (§8).
export default function NewProjectModal({ onClose, onCreated, languages = LANGUAGES }) {
  const toast = useToast()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(newProjectSchema),
    defaultValues: { title: '', language: 'python' },
  })

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const submit = async (values) => {
    try {
      const lang = getLanguage(values.language)
      const project = await createProject({
        title: values.title,
        language: values.language,
        ...toCodePayload({
          source: lang.defaultSnippet,
          fileName: mainFileName(lang),
          extra: { stdin: '' },
        }),
      })
      toast.success('Project created.')
      onCreated(project)
    } catch (err) {
      if (!applyFieldErrors(err, setError)) {
        toast.error(getErrorDetail(err, 'Could not create the project.'))
      }
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-stretch justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New project"
        onMouseDown={(e) => e.stopPropagation()}
        className="flex w-full flex-col bg-white p-5 dark:bg-ink-900 sm:max-w-md sm:rounded-2xl sm:border sm:border-ink-200 sm:dark:border-ink-800"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">New project</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-400 hover:text-ink-600 dark:hover:text-ink-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="np-title" className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-200">
              Title
            </label>
            <input
              id="np-title"
              autoFocus
              {...register('title')}
              placeholder="My first project"
              className="w-full rounded-xl border border-ink-200 bg-transparent px-4 py-3 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 dark:border-ink-700"
            />
            {errors.title && <p className="mt-1 text-xs font-medium text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="np-language" className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-200">
              Language
            </label>
            <select
              id="np-language"
              {...register('language')}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 dark:border-ink-700 dark:bg-ink-900"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
            {errors.language && (
              <p className="mt-1 text-xs font-medium text-red-500">{errors.language.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60 dark:bg-gold-400 dark:text-ink-950"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              'Create project'
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}
