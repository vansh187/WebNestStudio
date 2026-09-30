import { useEffect, useRef, useState } from 'react'
import { FiFileText, FiPlus, FiX } from 'react-icons/fi'

// `onCreateFile`, `onRenameFile` and `onDeleteFile` turn on file management; `validateName`
// returns an error message ('' when valid) and `kinds` lists what a new file can be.
export default function FileTabs({
  files = [],
  selectedFile,
  onSelectFile,
  onAddFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  validateName,
  kinds = [],
  newFileLabel = 'New file',
  disabled = false,
}) {
  const [form, setForm] = useState(null) // { mode: 'create' | 'rename', target?, name, kind }
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const canDelete = Boolean(onDeleteFile) && files.length > 1 && !disabled

  const formKey = form ? `${form.mode}:${form.target ?? ''}` : ''
  useEffect(() => {
    if (formKey) inputRef.current?.focus()
  }, [formKey])

  const openCreate = () => {
    setError('')
    setForm({ mode: 'create', name: '', kind: kinds[0]?.id })
  }

  const openRename = (name) => {
    if (!onRenameFile || disabled) return
    setError('')
    setForm({ mode: 'rename', target: name, name: name.replace(/\.[^.]+$/, '') })
  }

  const close = () => {
    setForm(null)
    setError('')
  }

  const submit = (event) => {
    event.preventDefault()
    const message = validateName?.(form.name, form.mode === 'rename' ? form.target : null) || ''
    if (message) {
      setError(message)
      return
    }
    if (form.mode === 'create') onCreateFile?.({ name: form.name.trim(), kind: form.kind })
    else onRenameFile?.(form.target, form.name.trim())
    close()
  }

  const remove = (name) => {
    if (window.confirm(`Delete ${name}? This cannot be undone.`)) onDeleteFile?.(name)
  }

  const inputClass = 'rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-900 outline-none focus:border-gold-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white'

  return (
    <div className="rounded-t-xl border border-b-0 border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-950">
      <div className="flex min-h-11 items-center gap-1 px-2">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1" role="tablist" aria-label="Files">
          {files.map((file) => {
            const active = file.name === selectedFile
            return (
              <div
                key={file.name}
                className={`group inline-flex h-9 shrink-0 items-center rounded-md text-xs font-semibold ${
                  active
                    ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-900 dark:text-white'
                    : 'text-ink-500 hover:text-gold-500 dark:text-ink-300'
                }`}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectFile?.(file.name)}
                  onDoubleClick={() => openRename(file.name)}
                  title={onRenameFile ? 'Double-click to rename' : undefined}
                  className={`inline-flex h-full items-center gap-2 ${canDelete ? 'pl-3 pr-1' : 'px-3'}`}
                >
                  <FiFileText className="h-3.5 w-3.5" />
                  {file.name}
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => remove(file.name)}
                    className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded text-ink-400 hover:bg-ink-100 hover:text-red-500 dark:hover:bg-ink-800"
                    title={`Delete ${file.name}`}
                    aria-label={`Delete ${file.name}`}
                  >
                    <FiX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        {onCreateFile && (
          <button
            type="button"
            onClick={form?.mode === 'create' ? close : openCreate}
            disabled={disabled}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-ink-600 hover:bg-white hover:text-gold-500 disabled:opacity-50 dark:text-ink-200 dark:hover:bg-ink-900"
          >
            <FiPlus className="h-4 w-4" />
            <span>{newFileLabel}</span>
          </button>
        )}
        {!onCreateFile && onAddFile && (
          <button
            type="button"
            onClick={onAddFile}
            className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-500 hover:bg-white hover:text-gold-500 dark:text-ink-300 dark:hover:bg-ink-900"
            title="Add file"
            aria-label="Add file"
          >
            <FiPlus className="h-4 w-4" />
          </button>
        )}
      </div>

      {form && (
        <form
          onSubmit={submit}
          onKeyDown={(event) => { if (event.key === 'Escape') close() }}
          className="flex flex-wrap items-center gap-2 border-t border-ink-200 px-3 py-2 dark:border-ink-800"
        >
          <label htmlFor="file-tabs-name" className="text-xs font-semibold text-ink-600 dark:text-ink-200">
            {form.mode === 'create' ? 'Class name' : `Rename ${form.target} to`}
          </label>
          <input
            id="file-tabs-name"
            ref={inputRef}
            value={form.name}
            onChange={(event) => { setForm({ ...form, name: event.target.value }); setError('') }}
            placeholder="e.g. BankAccount"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'file-tabs-error' : undefined}
            className={`${inputClass} w-44`}
          />
          {form.mode === 'create' && kinds.length > 0 && (
            <select
              value={form.kind}
              onChange={(event) => setForm({ ...form, kind: event.target.value })}
              aria-label="File type"
              className={inputClass}
            >
              {kinds.map((kind) => <option key={kind.id} value={kind.id}>{kind.label}</option>)}
            </select>
          )}
          <button type="submit" className="rounded-md bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-700 dark:bg-gold-500 dark:text-ink-950 dark:hover:bg-gold-400">
            {form.mode === 'create' ? 'Create' : 'Rename'}
          </button>
          <button type="button" onClick={close} className="rounded-md px-2 py-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white">
            Cancel
          </button>
          {error && <p id="file-tabs-error" role="alert" className="w-full text-xs text-red-500">{error}</p>}
        </form>
      )}
    </div>
  )
}
