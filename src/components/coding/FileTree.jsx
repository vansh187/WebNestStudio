import { useEffect, useMemo, useRef, useState } from 'react'
import { FiChevronDown, FiChevronRight, FiEdit2, FiFilePlus, FiFileText, FiFolder, FiTrash2, FiDatabase, FiAlertCircle } from 'react-icons/fi'
import {
  buildFileTree, languageForFile, layerOfFile, newFileTemplate, normalizeBackendPath, projectSize, renameEntry,
  validateBackendPath, MAX_BACKEND_BYTES,
} from '../../lib/codelab/backendFiles'

const LAYER_DOT = {
  api: 'bg-sky-500',
  services: 'bg-violet-500',
  repositories: 'bg-emerald-500',
  database: 'bg-amber-500',
  schema: 'bg-amber-500',
  client: 'bg-pink-500',
}

const ICON_BTN = 'inline-flex h-6 w-6 items-center justify-center rounded text-ink-400 hover:bg-ink-100 hover:text-gold-600 disabled:opacity-40 dark:hover:bg-ink-800'

// Folder-aware file list for the backend workspace. Folders exist only through the files
// inside them, so creating "app/services/order_service.py" creates both folders.
// `bare` drops the card frame so the tree can fill a drawer.
export default function FileTree({ files, selectedFile, onSelectFile, onFilesChange, disabled = false, hintFiles = new Set(), bare = false, className = '' }) {
  const tree = useMemo(() => buildFileTree(files), [files])
  const [collapsed, setCollapsed] = useState(() => new Set())
  const [form, setForm] = useState(null) // { mode: 'create' | 'rename', target?, isFolder?, name }
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const formKey = form ? `${form.mode}:${form.target ?? ''}` : ''
  useEffect(() => {
    if (formKey) inputRef.current?.focus()
  }, [formKey])

  const toggle = (path) => setCollapsed((current) => {
    const next = new Set(current)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    return next
  })

  const openCreate = (folder = '') => {
    setError('')
    setForm({ mode: 'create', name: folder ? `${folder}/` : 'app/' })
  }

  const openRename = (target, isFolder) => {
    setError('')
    setForm({ mode: 'rename', target, isFolder, name: target })
  }

  const close = () => {
    setForm(null)
    setError('')
  }

  const submit = (event) => {
    event.preventDefault()
    const name = normalizeBackendPath(form.name)
    if (form.mode === 'create') {
      const message = validateBackendPath(name, files)
      if (message) return setError(message)
      const content = newFileTemplate(name)
      if (projectSize(files) + content.length > MAX_BACKEND_BYTES) return setError('The project is at its size limit.')
      onFilesChange([...files, { name, language: languageForFile(name), content }])
      onSelectFile(name)
      setCollapsed((current) => new Set([...current].filter((path) => !name.startsWith(`${path}/`))))
      return close()
    }
    if (name === form.target) return close()
    const { files: renamed, error: problem } = renameEntry(files, form.target, name, form.isFolder)
    if (problem) return setError(problem)
    onFilesChange(renamed)
    if (form.isFolder ? selectedFile?.startsWith(`${form.target}/`) : selectedFile === form.target) {
      onSelectFile(form.isFolder ? `${name}${selectedFile.slice(form.target.length)}` : name)
    }
    return close()
  }

  const remove = (target, isFolder) => {
    const doomed = files.filter((file) => (isFolder ? file.name.startsWith(`${target}/`) : file.name === target))
    if (doomed.length >= files.length) {
      window.alert('A project needs at least one file.')
      return
    }
    const label = isFolder ? `the folder ${target} and its ${doomed.length} file${doomed.length === 1 ? '' : 's'}` : target
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return
    const next = files.filter((file) => !doomed.includes(file))
    onFilesChange(next)
    if (doomed.some((file) => file.name === selectedFile)) onSelectFile(next[0]?.name)
  }

  const renderFile = (file, depth) => {
    const active = file.name === selectedFile
    const leaf = file.name.split('/').pop()
    const layer = layerOfFile(file.name)
    return (
      <li key={file.name} className="group">
        <div className={`flex items-center rounded-md pr-1 ${active ? 'bg-white shadow-sm dark:bg-ink-900' : 'hover:bg-white/70 dark:hover:bg-ink-900/60'}`}>
          <button
            type="button"
            onClick={() => onSelectFile(file.name)}
            onDoubleClick={() => !disabled && openRename(file.name, false)}
            title={file.name}
            aria-current={active ? 'true' : undefined}
            className={`flex min-h-8 min-w-0 flex-1 items-center gap-2 py-1 text-left text-xs ${active ? 'font-semibold text-ink-900 dark:text-white' : 'text-ink-600 dark:text-ink-300'}`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {file.name === 'schema.sql' ? <FiDatabase className="h-3.5 w-3.5 shrink-0 text-amber-500" /> : <FiFileText className="h-3.5 w-3.5 shrink-0" />}
            <span className="truncate">{leaf}</span>
            {LAYER_DOT[layer] && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${LAYER_DOT[layer]}`} aria-hidden="true" />}
            {hintFiles.has(file.name) && <FiAlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Has a layering hint" />}
          </button>
          <span className="hidden shrink-0 items-center group-hover:flex group-focus-within:flex">
            <button type="button" className={ICON_BTN} onClick={() => openRename(file.name, false)} disabled={disabled} aria-label={`Rename ${file.name}`}><FiEdit2 className="h-3 w-3" /></button>
            <button type="button" className={ICON_BTN} onClick={() => remove(file.name, false)} disabled={disabled} aria-label={`Delete ${file.name}`}><FiTrash2 className="h-3 w-3" /></button>
          </span>
        </div>
      </li>
    )
  }

  const renderFolder = (folder, depth) => {
    const open = !collapsed.has(folder.path)
    return (
      <li key={folder.path} className="group/folder">
        <div className="flex items-center rounded-md pr-1 hover:bg-white/70 dark:hover:bg-ink-900/60">
          <button
            type="button"
            onClick={() => toggle(folder.path)}
            aria-expanded={open}
            className="flex min-h-8 min-w-0 flex-1 items-center gap-1.5 py-1 text-left text-xs font-semibold text-ink-700 dark:text-ink-200"
            style={{ paddingLeft: `${depth * 12 + 4}px` }}
          >
            {open ? <FiChevronDown className="h-3.5 w-3.5 shrink-0" /> : <FiChevronRight className="h-3.5 w-3.5 shrink-0" />}
            <FiFolder className="h-3.5 w-3.5 shrink-0 text-gold-500" />
            <span className="truncate">{folder.name}</span>
          </button>
          <span className="hidden shrink-0 items-center group-hover/folder:flex group-focus-within/folder:flex">
            <button type="button" className={ICON_BTN} onClick={() => openCreate(folder.path)} disabled={disabled} aria-label={`New file in ${folder.path}`}><FiFilePlus className="h-3 w-3" /></button>
            <button type="button" className={ICON_BTN} onClick={() => openRename(folder.path, true)} disabled={disabled} aria-label={`Rename folder ${folder.path}`}><FiEdit2 className="h-3 w-3" /></button>
            <button type="button" className={ICON_BTN} onClick={() => remove(folder.path, true)} disabled={disabled} aria-label={`Delete folder ${folder.path}`}><FiTrash2 className="h-3 w-3" /></button>
          </span>
        </div>
        {open && (
          <ul>
            {folder.folders.map((child) => renderFolder(child, depth + 1))}
            {folder.files.map((file) => renderFile(file, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <nav aria-label="Project files" className={`flex flex-col bg-ink-50 dark:bg-ink-950 ${bare ? 'h-full' : 'rounded-xl border border-ink-200 dark:border-ink-800'} ${className}`}>
      <div className="flex min-h-11 items-center justify-between border-b border-ink-200 px-3 dark:border-ink-800">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-300">Files</h2>
        <button
          type="button"
          onClick={() => (form?.mode === 'create' ? close() : openCreate(''))}
          disabled={disabled}
          className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-ink-600 hover:bg-white hover:text-gold-600 disabled:opacity-50 dark:text-ink-200 dark:hover:bg-ink-900"
        >
          <FiFilePlus className="h-4 w-4" /> New file
        </button>
      </div>

      {form && (
        <form onSubmit={submit} onKeyDown={(event) => { if (event.key === 'Escape') close() }} className="flex flex-col gap-2 border-b border-ink-200 p-3 dark:border-ink-800">
          <label htmlFor="file-tree-name" className="text-xs font-semibold text-ink-600 dark:text-ink-200">
            {form.mode === 'create' ? 'New file path' : `Rename ${form.isFolder ? 'folder' : 'file'}`}
          </label>
          <input
            id="file-tree-name"
            ref={inputRef}
            value={form.name}
            onChange={(event) => { setForm({ ...form, name: event.target.value }); setError('') }}
            placeholder="app/services/order_service.py"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'file-tree-error' : 'file-tree-help'}
            className="rounded-md border border-ink-200 bg-white px-2 py-1.5 font-mono text-xs text-ink-900 outline-none focus:border-gold-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
          />
          {error
            ? <p id="file-tree-error" role="alert" className="text-xs text-red-500">{error}</p>
            : form.mode === 'create' && <p id="file-tree-help" className="text-[11px] text-ink-400">Folders are created from the path. Python files go in app/.</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-700 dark:bg-gold-500 dark:text-ink-950 dark:hover:bg-gold-400">
              {form.mode === 'create' ? 'Create' : 'Rename'}
            </button>
            <button type="button" onClick={close} className="rounded-md px-2 py-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white">Cancel</button>
          </div>
        </form>
      )}

      <ul className={`overflow-auto p-1.5 ${bare ? 'min-h-0 flex-1' : 'max-h-[40dvh] lg:max-h-none lg:flex-1'}`}>
        {tree.folders.map((folder) => renderFolder(folder, 0))}
        {tree.files.map((file) => renderFile(file, 0))}
      </ul>

      <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-ink-200 px-3 py-2 text-[10px] text-ink-400 dark:border-ink-800">
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" />routes</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" />services</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />repositories</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />database</span>
      </div>
    </nav>
  )
}
