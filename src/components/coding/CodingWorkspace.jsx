import { useEffect, useRef, useState } from 'react'
import CodeEditor from './CodeEditor'
import RunBar from './RunBar'
import StdinPanel from './StdinPanel'
import OutputPanel from './OutputPanel'
import BackButton from './BackButton'
import { getLanguage, mainFileName } from '../../data/codingLanguages'
import { toCodePayload } from '../../api/coding'
import { wakeServer } from '../../lib/health'

const EDITOR_HEIGHT =
  'h-[45dvh] min-h-[240px] md:h-[55dvh] lg:h-[calc(100dvh-var(--nav-h)-190px)] lg:min-h-[420px] lg:max-h-[720px]'
const PANEL_HEIGHT = 'lg:h-[calc(100dvh-var(--nav-h)-190px)] lg:min-h-[420px] lg:overflow-auto'

/**
 * Shared editor + run + output surface for the Playground and a saved Project.
 * Owns the run-payload composition and the responsive layout (§8 of the frontend doc);
 * the parent supplies state + save/share behaviour.
 */
export default function CodingWorkspace({
  eyebrow,
  title,
  titleField,
  subtitle,
  headerRight,
  languages,
  language,
  onLanguageChange,
  source,
  onSourceChange,
  stdin,
  onStdinChange,
  runner,
  onSave,
  saving,
  saveLabel,
  onShare,
  sharing,
}) {
  const [stdinOpen, setStdinOpen] = useState(false)
  const lang = languages.find((l) => l.id === language) ?? getLanguage(language)

  const outputRef = useRef(null)
  const wasRunning = useRef(false)

  // Start waking the Render free-tier backend the moment the editor opens, so the
  // cold start (up to ~1 min) overlaps with the user writing code instead of being
  // paid in full on the first Run.
  useEffect(() => {
    wakeServer()
  }, [])

  // On phones/tablets the output sits far below the editor — bring it into view
  // when a run starts so the "Running…" feedback is actually visible.
  useEffect(() => {
    if (runner.running && !wasRunning.current) {
      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    wasRunning.current = runner.running
  }, [runner.running])

  const handleRun = () => {
    runner.run({
      language,
      ...(lang?.version ? { version: lang.version } : {}),
      ...toCodePayload({
        source: source ?? '',
        fileName: mainFileName(lang),
        extra: { stdin: stdin ?? '', args: [] },
      }),
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <BackButton fallback="/" className="mb-2" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">{eyebrow}</p>
          )}
          {titleField
            ? <div className="mt-1">{titleField}</div>
            : title && (
              <h1 className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-white">{title}</h1>
            )}
          {subtitle && <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{subtitle}</p>}
        </div>
        {headerRight && <div className="shrink-0">{headerRight}</div>}
      </div>

      <div className="mt-4">
        <RunBar
          languages={languages}
          language={language}
          onLanguageChange={onLanguageChange}
          onRun={handleRun}
          onCancel={runner.cancel}
          running={runner.running}
          stdinOpen={stdinOpen}
          onToggleStdin={() => setStdinOpen((v) => !v)}
          onSave={onSave}
          saving={saving}
          saveLabel={saveLabel}
          onShare={onShare}
          sharing={sharing}
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:grid-cols-[minmax(0,1fr)_460px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <CodeEditor
          value={source}
          onChange={onSourceChange}
          language={lang?.monacoId ?? 'plaintext'}
          className={EDITOR_HEIGHT}
        />
        <div
          ref={outputRef}
          className={`grid scroll-mt-[calc(var(--nav-h)+8px)] gap-3 lg:grid-cols-1 ${stdinOpen ? 'md:grid-cols-2' : ''}`}
        >
          <StdinPanel value={stdin} onChange={onStdinChange} open={stdinOpen} />
          <OutputPanel
            running={runner.running}
            runningSince={runner.runningSince}
            stopped={runner.stopped}
            result={runner.result}
            error={runner.error}
            className={PANEL_HEIGHT}
          />
        </div>
      </div>
    </div>
  )
}
