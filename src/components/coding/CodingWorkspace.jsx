import { useEffect, useRef, useState } from 'react'
import CodeEditor from './CodeEditor'
import FileTabs from './FileTabs'
import RunBar from './RunBar'
import StdinPanel from './StdinPanel'
import OutputPanel from './OutputPanel'
import PreviewPanel from './PreviewPanel'
import BackButton from './BackButton'
import { getLanguage, mainFileName } from '../../data/codingLanguages'
import { toCodePayload } from '../../api/coding'
import ErrorBoundary from '../ErrorBoundary'

const EDITOR_HEIGHT =
  'h-[45dvh] min-h-[240px] md:h-[55dvh] lg:h-[calc(100dvh-var(--nav-h)-190px)] lg:min-h-[420px] lg:max-h-[720px]'
const PANEL_HEIGHT = 'lg:h-[calc(100dvh-var(--nav-h)-190px)] lg:min-h-[420px] lg:overflow-auto'

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
  files,
  selectedFile,
  onSelectFile,
  onFileChange,
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
  const [consoleText, setConsoleText] = useState('')
  const lang = languages.find((l) => l.id === language) ?? getLanguage(language)
  const activeFile = files?.find((file) => file.name === selectedFile)
  const outputRef = useRef(null)
  const wasRunning = useRef(false)

  useEffect(() => {
    if (runner.running && !wasRunning.current) {
      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    wasRunning.current = runner.running
  }, [runner.running])

  const handleRun = () => {
    setConsoleText('')
    const sourceText = activeFile?.content ?? source ?? ''
    runner.run({
      language,
      ...toCodePayload({
        source: sourceText,
        fileName: mainFileName(lang),
        files,
        extra: { stdin: stdin ?? '' },
      }),
    })
  }

  const handleConsole = ({ type, text }) => {
    setConsoleText((prev) => `${prev}${prev ? '\n' : ''}[${type}] ${text}`.slice(0, 64000))
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
        <ErrorBoundary>
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
        </ErrorBoundary>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:grid-cols-[minmax(0,1fr)_460px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <div>
          {files && (
            <ErrorBoundary>
              <FileTabs files={files} selectedFile={selectedFile} onSelectFile={onSelectFile} />
            </ErrorBoundary>
          )}
          <ErrorBoundary>
            <CodeEditor
              value={activeFile?.content ?? source}
              onChange={(value) => (activeFile ? onFileChange?.(activeFile.name, value) : onSourceChange?.(value))}
              language={activeFile?.language ?? lang?.monacoId ?? 'plaintext'}
              className={EDITOR_HEIGHT}
              roundedTop={!files}
            />
          </ErrorBoundary>
        </div>
        <div
          ref={outputRef}
          className={`grid scroll-mt-[calc(var(--nav-h)+8px)] gap-3 lg:grid-cols-1 ${stdinOpen ? 'md:grid-cols-2' : ''}`}
        >
          <ErrorBoundary>
            <StdinPanel value={stdin} onChange={onStdinChange} open={stdinOpen} />
          </ErrorBoundary>
          <ErrorBoundary>
            <OutputPanel
              running={runner.running}
              runningSince={runner.runningSince}
              stopped={runner.stopped}
              result={runner.result}
              error={runner.error}
              className={PANEL_HEIGHT}
            />
          </ErrorBoundary>
          {language === 'web' && (
            <ErrorBoundary>
              <PreviewPanel
                previewHtml={runner.result?.previewHtml}
                onConsole={handleConsole}
                className={PANEL_HEIGHT}
              />
            </ErrorBoundary>
          )}
          {consoleText && (
            <pre className="max-h-48 overflow-auto rounded-xl border border-ink-200 bg-ink-950 p-3 font-mono text-xs text-ink-100 dark:border-ink-800">
              {consoleText}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
