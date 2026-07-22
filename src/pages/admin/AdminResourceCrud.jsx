import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiTrash2, FiPlus, FiLoader } from 'react-icons/fi'
import { Skeleton } from '../../components/states/Skeleton'
import { ErrorState, EmptyState } from '../../components/states/StateViews'
import { getErrorDetail, applyFieldErrors } from '../../lib/apiClient'
import { useToast } from '../../context/ToastContext'
import { RESOURCE_CONFIGS } from './resourceConfigs'

function toFormValues(fields, item) {
  const values = {}
  fields.forEach((f) => {
    const raw = item ? item[f.name] : undefined
    if (f.type === 'tags') {
      values[f.name] = Array.isArray(raw) ? raw.join(', ') : (raw ?? '')
    } else if (f.type === 'checkbox') {
      values[f.name] = raw !== undefined ? Boolean(raw) : (f.default ?? false)
    } else {
      values[f.name] = raw !== undefined && raw !== null ? raw : (f.default ?? '')
    }
  })
  return values
}

function toPayload(fields, values) {
  const payload = {}
  fields.forEach((f) => {
    let v = values[f.name]
    if (f.type === 'tags') {
      v = String(v || '').split(',').map((s) => s.trim()).filter(Boolean)
    } else if (f.type === 'number') {
      v = v === '' || v === null ? undefined : Number(v)
    } else if (f.type === 'checkbox') {
      v = Boolean(v)
    }
    payload[f.name] = v
  })
  return payload
}

function diffChanged(original, next) {
  if (!original) return next
  const changed = {}
  Object.keys(next).forEach((key) => {
    const a = original[key]
    const b = next[key]
    const same = Array.isArray(a) && Array.isArray(b)
      ? JSON.stringify(a) === JSON.stringify(b)
      : a === b
    if (!same) changed[key] = b
  })
  return changed
}

function suggestSlug(slug) {
  const match = slug.match(/^(.*)-(\d+)$/)
  if (match) return `${match[1]}-${Number(match[2]) + 1}`
  return `${slug}-2`
}

function FieldInput({ field, register, error }) {
  const base = 'mt-1.5 w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400/30'
  const borderClass = error ? 'border-red-400 focus:border-red-400' : 'border-ink-200 dark:border-ink-700 focus:border-gold-400'

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
        <input type="checkbox" {...register(field.name)} className="h-4 w-4 rounded border-ink-300 text-gold-500 focus:ring-gold-400/40" />
        {field.label}
      </label>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">{field.label}</label>
        <textarea rows={3} {...register(field.name)} className={`${base} ${borderClass}`} />
        {error && <p className="mt-1 text-xs font-medium text-red-500">{error.message}</p>}
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">{field.label}</label>
        <select {...register(field.name)} className={`${base} ${borderClass}`}>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {error && <p className="mt-1 text-xs font-medium text-red-500">{error.message}</p>}
      </div>
    )
  }

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">{field.label}</label>
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        min={field.min}
        max={field.max}
        {...register(field.name)}
        className={`${base} ${borderClass}`}
      />
      {field.hint && !error && <p className="mt-1 text-xs text-ink-400">{field.hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error.message}</p>}
    </div>
  )
}

function ResourceForm({ config, editingItem, onDone, onCancel }) {
  const toast = useToast()
  const [banner, setBanner] = useState(null)
  const {
    register, handleSubmit, formState: { errors, isSubmitting }, setError, setValue, getValues,
  } = useForm({ defaultValues: toFormValues(config.fields, editingItem) })

  const onSubmit = async (values) => {
    setBanner(null)
    const missing = config.fields.filter((f) => f.required && !String(values[f.name] ?? '').trim())
    if (missing.length) {
      missing.forEach((f) => setError(f.name, { type: 'required', message: `${f.label} is required` }))
      return
    }
    const fullPayload = toPayload(config.fields, values)
    try {
      if (editingItem) {
        const changed = diffChanged(toPayload(config.fields, toFormValues(config.fields, editingItem)), fullPayload)
        const updated = await config.api.update(editingItem.id, changed)
        toast.success(`${config.title.slice(0, -1)} updated.`)
        onDone(updated)
      } else {
        const created = await config.api.create(fullPayload)
        toast.success(`${config.title.slice(0, -1)} created.`)
        onDone(created)
      }
    } catch (error) {
      if (error.response?.status === 409 && config.hasSlug) {
        const suggested = suggestSlug(getValues('slug'))
        setError('slug', { type: 'server', message: `This slug is taken — try "${suggested}"` })
        setValue('slug', suggested)
        return
      }
      const mapped = applyFieldErrors(error, setError)
      if (!mapped) setBanner(getErrorDetail(error, 'Could not save. Please try again.'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6">
      {banner && <p className="text-sm font-medium text-red-500">{banner}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {config.fields.map((f) => (
          <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <FieldInput field={f} register={register} error={errors[f.name]} />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-ink-900 dark:bg-gold-400 px-4 py-2 text-sm font-semibold text-white dark:text-ink-950 disabled:opacity-60"
        >
          {isSubmitting ? <FiLoader className="h-4 w-4 animate-spin" /> : null}
          {editingItem ? 'Save Changes' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-ink-200 dark:border-ink-700 px-4 py-2 text-sm font-semibold text-ink-600 dark:text-ink-200">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminResourceCrud() {
  const { resource } = useParams()
  const config = RESOURCE_CONFIGS[resource]
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!config) return
    let cancelled = false
    setItems(null)
    setError(null)
    setFormOpen(false)
    setEditingItem(null)
    config.api.list()
      .then((data) => { if (!cancelled) setItems(data) })
      .catch((err) => { if (!cancelled) setError(getErrorDetail(err, 'Could not load this list.')) })
    return () => { cancelled = true }
  }, [resource, reloadKey, config])

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return
    try {
      await config.api.remove(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      toast.success('Deleted.')
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not delete this item.'))
    }
  }

  const handleDone = (saved) => {
    setItems((prev) => {
      if (!prev) return prev
      const exists = prev.some((i) => i.id === saved.id)
      return exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [saved, ...prev]
    })
    setFormOpen(false)
    setEditingItem(null)
  }

  if (!config) {
    return <ErrorState message="Unknown admin resource." />
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{config.title}</h2>
        {!formOpen && (
          <button
            type="button"
            onClick={() => { setEditingItem(null); setFormOpen(true) }}
            className="inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-gold-400 px-4 py-2 text-sm font-semibold text-white dark:text-ink-950"
          >
            <FiPlus className="h-4 w-4" /> Add New
          </button>
        )}
      </div>

      {formOpen && (
        <div className="mb-8">
          <ResourceForm
            config={config}
            editingItem={editingItem}
            onDone={handleDone}
            onCancel={() => { setFormOpen(false); setEditingItem(null) }}
          />
        </div>
      )}

      {items === null && !error && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      )}
      {error && <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />}
      {items && items.length === 0 && <EmptyState title="Nothing here yet" description={`Add your first ${config.title.toLowerCase().slice(0, -1)}.`} />}
      {items && items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-ink-200 dark:border-ink-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60 text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">
              <tr>
                {config.columns.map((c) => <th key={c} className="px-4 py-3">{c.replace(/_/g, ' ')}</th>)}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-ink-100 dark:border-ink-800">
                  {config.columns.map((c) => (
                    <td key={c} className="px-4 py-3 text-ink-700 dark:text-ink-200">
                      {typeof item[c] === 'boolean' ? (item[c] ? 'Yes' : 'No') : String(item[c] ?? '—')}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditingItem(item); setFormOpen(true) }}
                        className="rounded-lg p-2 text-ink-500 hover:bg-gold-400/10 hover:text-gold-500"
                        aria-label="Edit"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded-lg p-2 text-ink-500 hover:bg-red-400/10 hover:text-red-500"
                        aria-label="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
