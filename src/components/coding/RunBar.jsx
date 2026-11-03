import { FiCode, FiPlay, FiLoader, FiShare2, FiTerminal, FiSave, FiSquare, FiZap } from 'react-icons/fi'
import LanguageSelect from './LanguageSelect'
import { FullscreenButton, ThemeToggleButton } from './IdeButtons'

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
  maximized = false,
  onToggleMaximize,
  // Page-level controls (GitHub, save status). The workspace fills the window on large
  // screens, so the page header above it is out of view.
  extra,
  onAssistant,
  assistantOpen = false,
  // Runs under the debugger (Python); shown only when given.
  onDebug,
}) {
  return (
    // Full screen covers the navbar, so the bar no longer needs to stick under it.
    <div className={`${maximized ? '' : 'sticky top-[var(--nav-h)]'} z-20 flex flex-col gap-2 rounded-xl border border-ink-200 bg-white/90 p-2 backdrop-blur dark:border-ink-800 dark:bg-ink-950/90 sm:flex-row sm:items-center sm:justify-between`}>
      <div className="flex items-center gap-2">
        <LanguageSelect
          languages={languages}
          value={language}
          onChange={onLanguageChange}
          disabled={running}
          className="w-full sm:w-auto"
        />
        {onToggleStdin && (
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
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onAssistant && (
          <button type="button" onClick={onAssistant} aria-pressed={assistantOpen} title="Open WebNest AI" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 px-3 py-2 text-sm font-semibold text-ink-950 shadow-sm hover:from-gold-200 hover:to-gold-400">
            <FiZap className="h-4 w-4" /> WebNest AI
          </button>
        )}
        {extra}
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
        {/* The site's floating theme button is hidden while the workspace is open (useIdeFocus). */}
        <ThemeToggleButton className={GHOST_BTN} />
        {/* Full screen is offered on large screens, where the editor and panels sit side by
            side. Once on, the exit button stays visible at any width (a resize or a rotated
            tablet must not trap the learner in the overlay). */}
        {onToggleMaximize && (
          <div className={maximized ? '' : 'hidden lg:block'}>
            <FullscreenButton maximized={maximized} onToggle={onToggleMaximize} className={GHOST_BTN} />
          </div>
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
          <>
          {onDebug && (
            <button
              type="button"
              onClick={onDebug}
              title="Run under the debugger: it stops at your breakpoints"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-ink-300 px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-red-400 hover:text-red-600 dark:border-ink-700 dark:text-ink-200 dark:hover:text-red-300"
            >
              <FiCode className="h-4 w-4" /> Debug
            </button>
          )}
          <button
            type="button"
            onClick={onRun}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] dark:bg-gold-400 dark:text-ink-950 sm:flex-none"
          >
            <FiPlay className="h-4 w-4" /> Run
          </button>
          </>
        )}
      </div>
    </div>
  )
}
