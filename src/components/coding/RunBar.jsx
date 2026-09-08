import { FiPlay, FiLoader, FiShare2, FiTerminal, FiSave, FiSquare } from 'react-icons/fi'
import LanguageSelect from './LanguageSelect'

const GHOST_BTN =
  'inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-gold-400 hover:text-gold-500 disabled:opacity-60 dark:border-ink-700 dark:text-ink-200'

// Sticky action bar. Sits just under the (also sticky) global navbar — see the
// --nav-h var in index.css.
export default function RunBar({
  languages,
  language,
  onLanguageChange,
  onRun,
  onCancel,
  running,
  stdinOpen,
  onToggleStdin,
  onSave,
  saving,
  saveLabel = 'Save as project',
  onShare,
  sharing,
}) {
  return (
    <div className="sticky top-[var(--nav-h)] z-20 flex flex-col gap-2 rounded-xl border border-ink-200 bg-white/90 p-2 backdrop-blur dark:border-ink-800 dark:bg-ink-950/90 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <LanguageSelect
          languages={languages}
          value={language}
          onChange={onLanguageChange}
          disabled={running}
          className="w-full sm:w-auto"
        />
        <button
          type="button"
          onClick={onToggleStdin}
          aria-pressed={stdinOpen}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
            stdinOpen
              ? 'border-gold-400 text-gold-500'
              : 'border-ink-200 text-ink-600 hover:border-gold-400 hover:text-gold-500 dark:border-ink-700 dark:text-ink-200'
          }`}
        >
          <FiTerminal className="h-4 w-4" />
          <span className="hidden sm:inline">Input</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {onSave && (
          <button type="button" onClick={onSave} disabled={saving} className={GHOST_BTN}>
            {saving ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiSave className="h-4 w-4" />}
            <span className="hidden sm:inline">{saveLabel}</span>
          </button>
        )}
        {onShare && (
          <button type="button" onClick={onShare} disabled={sharing} className={GHOST_BTN}>
            {sharing ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiShare2 className="h-4 w-4" />}
            <span className="hidden sm:inline">Share</span>
          </button>
        )}
        {running ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 sm:flex-none"
          >
            <FiSquare className="h-4 w-4" /> Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={onRun}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] dark:bg-gold-400 dark:text-ink-950 sm:flex-none"
          >
            <FiPlay className="h-4 w-4" /> Run
          </button>
        )}
      </div>
    </div>
  )
}
