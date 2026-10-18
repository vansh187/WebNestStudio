import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiAlertTriangle, FiCheck, FiCode, FiLoader, FiRefreshCw, FiX } from 'react-icons/fi'

const POINTS = [
  'Your files and database are saved before the reload.',
  'Your breakpoints stay where you set them.',
  'The debugger is ready the moment the editor is back.',
]

// Asks before the one reload that turns on breakpoint debugging (see lib/codelab/isolation.js).
// `onConfirm` saves and reloads; it resolves only when the reload could not start.
export default function DebugReloadDialog({ onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const confirm = async () => {
    setBusy(true)
    setError('')
    const problem = await onConfirm()
    // Still here: the page did not reload.
    setBusy(false)
    if (problem) setError(problem)
  }

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-ink-950/60 p-4 backdrop-blur-sm sm:items-center" onMouseDown={() => { if (!busy) onClose() }}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="debug-reload-title"
        aria-describedby="debug-reload-text"
        onMouseDown={(event) => event.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl dark:border-ink-800 dark:bg-ink-900"
      >
        <div className="h-1 bg-gradient-to-r from-red-500 via-gold-400 to-emerald-400" aria-hidden="true" />
        <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="absolute right-3 top-4 rounded-md p-1 text-ink-400 hover:text-ink-700 disabled:opacity-40 dark:hover:text-ink-100">
          <FiX className="h-5 w-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
              <FiCode className="h-5 w-5" />
            </span>
            <div>
              <h2 id="debug-reload-title" className="font-display text-lg font-bold text-ink-900 dark:text-white">Start debugging</h2>
              <p className="text-xs font-medium text-ink-500 dark:text-ink-400">One quick reload, then you can pause your API</p>
            </div>
          </div>

          <p id="debug-reload-text" className="mt-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            Breakpoints stop your FastAPI code mid-request so you can inspect variables and step line by line. Your browser only allows that on a protected page, so CodeLab reloads this editor once with debugging switched on.
          </p>

          <ul className="mt-4 flex flex-col gap-2">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-200">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <FiCheck className="h-3 w-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          {error && (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
              <FiAlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={busy} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-ink-200 px-4 text-sm font-semibold text-ink-700 hover:border-gold-400 hover:text-gold-600 disabled:opacity-50 dark:border-ink-700 dark:text-ink-200">
              Not now
            </button>
            <button type="button" onClick={confirm} disabled={busy} autoFocus className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-70 dark:bg-gold-400 dark:text-ink-950">
              {busy ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiRefreshCw className="h-4 w-4" />}
              {busy ? 'Saving and reloading…' : 'Reload and debug'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
