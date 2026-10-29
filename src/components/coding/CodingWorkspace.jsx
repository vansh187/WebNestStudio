import { useEffect, useMemo, useRef, useState } from 'react'
import CodeEditor from './CodeEditor'
import FileTabs from './FileTabs'
import RunBar from './RunBar'
import StdinPanel from './StdinPanel'
import OutputPanel from './OutputPanel'
import PreviewPanel from './PreviewPanel'
import BackButton from './BackButton'
import { getLanguage, mainFileName } from '../../data/codingLanguages'
import { toCodePayload } from '../../api/coding'
import {
  JAVA_FILE_KINDS, JAVA_OOP_EXAMPLE, findJavaMainClasses, isJavaFile, javaClassFromFile, javaFileTemplate, qualifiedJavaClass,
  renameJavaFile, validateJavaClassName,
} from '../../lib/codelab/javaProject'
import { parseJavacDiagnostics } from '../../lib/codelab/javaIntel/diagnostics'
import { createPreviewHtml } from '../../lib/codelab/webPreview'
import { FROZEN_EVENT, codelabEditorOpen, codelabFrozenNotice } from '../../lib/codelab/idb.js'
import { useToast } from '../../context/ToastContext'
import { useApiRuntime } from '../../hooks/useApiRuntime'
import BackendWorkspace from './BackendWorkspace'
import { useFullscreen, useIdeFocus } from '../../hooks/useIdeShell'
import ErrorBoundary from '../ErrorBoundary'

// On large screens the workspace fills the window under the navbar (like the backend IDE),
// so the editor and panels stretch to fit it instead of setting their own heights.
const EDITOR_HEIGHT = 'h-[45dvh] min-h-[240px] md:h-[55dvh] lg:h-auto lg:min-h-0 lg:flex-1'
const PANEL_HEIGHT = 'lg:min-h-0 lg:flex-1 lg:overflow-auto'
// The lock (idb.js lockSeq) whose paused-saving notice was last shown (see the effect below).
const shownLock = { seq: null, toastId: null }
// How long Save project waits for a fresh database snapshot.
const SAVE_SNAPSHOT_WAIT_MS = 1500

export default function CodingWorkspace({
  eyebrow,
  title,
  titleField,
  subtitle,
  headerRight,
  // Backend only: saves the project before the debugger's one-time reload (see BackendWorkspace).
  beforeDebugReload,
  languages,
  language,
  onLanguageChange,
  source,
  onSourceChange,
  files,
  selectedFile,
  onSelectFile,
  onFileChange,
  onFilesChange,
  stdin,
  onStdinChange,
  runner,
  onSave,
  saving,
  saveLabel,
  onShare,
  sharing,
  workspaceKey = 'default',
  // Backend only: where this page keeps the files (the playground's browser copy or a saved project).
  backendStorageNote = 'Your files and database are saved in this browser only.',
  // Scroll the workspace up under the navbar on open (large screens). Pages with content
  // above the editor that must stay readable, like a problem statement, turn this off.
  scrollIntoViewOnOpen = true,
}) {
  const backend = language === 'backend'
  // The backend runtime only starts a worker on the first Run, so other languages pay nothing.
  const api = useApiRuntime(workspaceKey)
  const [backendPreview, setBackendPreview] = useState('')
  const activeRunner = backend ? api.runner : runner
  const [stdinOpen, setStdinOpen] = useState(false)
  const [consoleText, setConsoleText] = useState('')
  const [javaClassName, setJavaClassName] = useState('Main')
  const lang = languages.find((l) => l.id === language) ?? getLanguage(language)
  const activeFile = files?.find((file) => file.name === selectedFile)
  const outputRef = useRef(null)
  const wasRunning = useRef(false)
  const ideRef = useRef(null)
  const [maximized, setMaximized] = useState(false)
  // The backend IDE keeps its own full-screen state, so leaving this layout for it must not
  // leave this one maximized (its scroll lock would outlive the hidden section).
  if (backend && maximized) setMaximized(false)

  // The backend IDE does the same for itself (see BackendWorkspace).
  useIdeFocus(ideRef, { scroll: scrollIntoViewOnOpen, enabled: !backend })
  // When saving had to be paused without a reload, say so instead of dropping edits silently;
  // once per lock, however many editors mount, and only on pages that keep CodeLab data in
  // this browser (the playground and saved projects; not problem pages). Closed again when
  // the lock lifts.
  const toast = useToast()
  useEffect(() => {
    const show = (paused) => {
      if (!paused?.notice) {
        if (shownLock.toastId != null) toast.dismiss(shownLock.toastId)
        shownLock.toastId = null
        return
      }
      if (paused.seq === shownLock.seq || !codelabEditorOpen()) return
      shownLock.seq = paused.seq
      shownLock.toastId = toast.error(paused.notice, { duration: 0 })
    }
    show(codelabFrozenNotice())
    const onFrozen = (event) => show(event.detail)
    window.addEventListener(FROZEN_EVENT, onFrozen)
    return () => window.removeEventListener(FROZEN_EVENT, onFrozen)
  }, [toast])
  // Saving copies the stored database, so the running one is written out first; rows
  // added within the snapshot delay would otherwise be missing from the saved project. Not
  // while a request is paused at a breakpoint: the worker cannot answer until it resumes.
  // The button counts as saving from the first click, so a double click saves once.
  const { snapshotNow, debugPause } = api
  const [preparingSave, setPreparingSave] = useState(false)
  const savingRef = useRef(false)
  const saveBackend = useMemo(() => (onSave ? async () => {
    if (savingRef.current) return
    savingRef.current = true
    setPreparingSave(true)
    try {
      // The running database goes to the saved project as is (no second read from storage),
      // taken by the page when it is really saving (after its login check). At most
      // SAVE_SNAPSHOT_WAIT_MS: the worker answers one call at a time, so behind a slow
      // request the snapshot would hold Save up; the stored copy is used then.
      const databaseSnapshot = () => (debugPause
        ? Promise.resolve(undefined)
        : Promise.race([snapshotNow(), new Promise((resolve) => { setTimeout(resolve, SAVE_SNAPSHOT_WAIT_MS) })]))
      await onSave({ databaseSnapshot })
    } finally {
      savingRef.current = false
      setPreparingSave(false)
    }
  } : undefined), [onSave, snapshotNow, debugPause])
  useFullscreen(maximized, setMaximized)

  // Java projects can hold several class files; the runner bundles them (see javaProject.js).
  const manageJavaFiles = language === 'java' && Boolean(files && onFilesChange)
  const javaProject = language === 'java' && (files?.filter(isJavaFile).length ?? 0) > 1
  const mainCandidates = useMemo(() => (javaProject ? findJavaMainClasses(files) : []), [javaProject, files])
  const mainClass = mainCandidates.includes(javaClassName.split('.').at(-1)) ? javaClassName.split('.').at(-1) : mainCandidates[0] ?? ''

  // Editor suggestions see every class in the project, not just the open tab.
  const editorProject = useMemo(
    () => (language === 'java' ? { files: files ?? [], activeName: activeFile?.name ?? mainFileName(lang) } : null),
    [language, files, activeFile?.name, lang],
  )

  // javac errors from the last run are underlined in their file until that file is edited.
  const [diagnostics, setDiagnostics] = useState({ result: null, list: [] })
  if (diagnostics.result !== runner.result) {
    const stderr = language === 'java' && runner.result?.status === 'compile_error' ? runner.result.compile?.stderr : ''
    setDiagnostics({ result: runner.result, list: stderr ? parseJavacDiagnostics(stderr, files ?? [{ name: mainFileName(lang) }]) : [] })
  }
  const editorMarkers = useMemo(() => {
    const name = activeFile?.name ?? files?.[0]?.name ?? mainFileName(lang)
    return diagnostics.list.filter((d) => d.file === name)
  }, [diagnostics.list, activeFile?.name, files, lang])
  const clearDiagnostics = (name) => {
    setDiagnostics((current) => (current.list.some((d) => !name || d.file === name)
      ? { ...current, list: name ? current.list.filter((d) => d.file !== name) : [] }
      : current))
  }

  const createJavaFile = ({ name, kind }) => {
    const className = javaClassFromFile(name)
    const file = { name: `${className}.java`, language: 'java', content: javaFileTemplate(className, kind) }
    onFilesChange([...files, file])
    onSelectFile?.(file.name)
  }

  const renameFile = (oldName, newName) => {
    const className = javaClassFromFile(newName)
    const next = renameJavaFile(files, oldName, className)
    onFilesChange(next)
    if (selectedFile === oldName) onSelectFile?.(`${className}.java`)
    // Keep the package: a single file declaring `package practice;` runs as practice.App.
    if (javaClassName.split('.').at(-1) === javaClassFromFile(oldName)) setJavaClassName(qualifiedJavaClass(next, className))
  }

  const deleteFile = (name) => {
    const index = files.findIndex((file) => file.name === name)
    const next = files.filter((file) => file.name !== name)
    onFilesChange(next)
    if (selectedFile === name) onSelectFile?.(next[Math.max(0, index - 1)]?.name)
    // Keep the run target valid. With one file left the stored name is sent as-is, so it must
    // carry the package (the multi-file dropdown stores only the simple name).
    const remaining = findJavaMainClasses(next)
    if (remaining.length) {
      const current = javaClassName.split('.').at(-1)
      setJavaClassName(qualifiedJavaClass(next, remaining.includes(current) ? current : remaining[0]))
    }
  }

  const loadOopExample = () => {
    const edited = files.length > 1 || files[0]?.content !== getLanguage('java').defaultSnippet
    if (edited && !window.confirm('Replace your current Java files with the OOP example project?')) return
    onFilesChange(JAVA_OOP_EXAMPLE.map((file) => ({ ...file })))
    onSelectFile?.('Main.java')
    setJavaClassName('Main')
  }

  useEffect(() => {
    if (activeRunner.running && !wasRunning.current) {
      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    wasRunning.current = activeRunner.running
  }, [activeRunner.running])

  const handleRun = () => {
    setConsoleText('')
    if (backend) {
      api.run(files)
        .then(() => setBackendPreview(createPreviewHtml(files, { folder: 'frontend/', apiBridge: true })))
        .catch((err) => console.error('Could not build the frontend preview:', err))
      return
    }
    const sourceText = activeFile?.content ?? source ?? ''
    runner.run({
      language,
      ...toCodePayload({
        source: sourceText,
        sourceName: activeFile?.name,
        fileName: mainFileName(lang),
        files,
        extra: {
          stdin: stdin ?? '',
          ...(language === 'java' ? { className: (javaProject ? mainClass : javaClassName.trim()) || 'Main' } : {}),
        },
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
      </div>

      {/* The backend IDE has its own toolbar with the language picker and Run. */}
      {backend ? (
        <>
          <p className="mt-2 text-xs text-ink-500 dark:text-ink-300">
            Python, FastAPI and SQLite run inside your browser. {backendStorageNote} Shortcuts: Ctrl+Enter runs, Ctrl+B shows files, Ctrl+J shows the panel.
          </p>
          <BackendWorkspace
            api={api}
            files={files ?? []}
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
            onFileChange={onFileChange}
            onFilesChange={onFilesChange}
            previewHtml={backendPreview}
            workspaceKey={workspaceKey}
            outputRef={outputRef}
            onRun={handleRun}
            onCancel={activeRunner.cancel}
            running={activeRunner.running}
            languages={languages}
            language={language}
            onLanguageChange={onLanguageChange}
            toolbarExtra={headerRight}
            beforeDebugReload={beforeDebugReload}
            onSave={saveBackend}
            saving={saving || preparingSave}
            saveLabel={saveLabel}
          />
        </>
      ) : (
      <section
        ref={ideRef}
        aria-label="Code workspace"
        className={`flex flex-col ${
          maximized
            ? 'fixed inset-0 z-[70] h-dvh overflow-auto bg-white p-2 dark:bg-ink-950'
            : 'mt-4 scroll-mt-[calc(var(--nav-h)+0.5rem)] lg:h-[calc(100dvh-var(--nav-h)-1rem)] lg:min-h-[480px]'
        }`}
      >
        <ErrorBoundary>
          <RunBar
            languages={languages}
            language={language}
            onLanguageChange={onLanguageChange}
            onRun={handleRun}
            onCancel={activeRunner.cancel}
            running={activeRunner.running}
            stdinOpen={stdinOpen}
            onToggleStdin={() => setStdinOpen((v) => !v)}
            onSave={onSave}
            saving={saving}
            saveLabel={saveLabel}
            onShare={onShare}
            sharing={sharing}
            maximized={maximized}
            onToggleMaximize={() => setMaximized((v) => !v)}
            extra={headerRight}
          />
        </ErrorBoundary>
      <div className="mt-3 grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:grid-cols-[minmax(0,1fr)_460px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="flex min-w-0 flex-col lg:min-h-0">
          {language === 'java' && (
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-ink-500 dark:text-ink-300">
              <label htmlFor="java-main-class">Main class</label>
              {javaProject ? (
                mainCandidates.length ? (
                  <select id="java-main-class" value={mainClass} onChange={(event) => setJavaClassName(event.target.value)} disabled={runner.running} className="rounded-lg border border-ink-200 bg-transparent px-3 py-2 dark:border-ink-700 dark:bg-ink-900">
                    {mainCandidates.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                ) : (
                  <span id="java-main-class" className="text-amber-600 dark:text-amber-400">Add a public static void main(String[] args) method to one class.</span>
                )
              ) : (
                <input id="java-main-class" value={javaClassName} onChange={(event) => setJavaClassName(event.target.value)} disabled={runner.running} placeholder="Main or practice.Main" spellCheck={false} className="rounded-lg border border-ink-200 bg-transparent px-3 py-2 dark:border-ink-700" />
              )}
              <span>Java 17 · 5 second runtime · 128 MiB heap{import.meta.env.DEV ? ' · local trusted code only' : ''}</span>
              {manageJavaFiles && (
                <button type="button" onClick={loadOopExample} disabled={runner.running} className="font-semibold text-gold-600 underline-offset-2 hover:underline disabled:opacity-50 dark:text-gold-400">
                  Load OOP example
                </button>
              )}
            </div>
          )}
          {files && (
            <ErrorBoundary>
              <FileTabs
                files={files}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                {...(manageJavaFiles ? {
                  onCreateFile: createJavaFile,
                  onRenameFile: renameFile,
                  onDeleteFile: deleteFile,
                  validateName: (name, current) => validateJavaClassName(name, files, current),
                  kinds: JAVA_FILE_KINDS,
                  newFileLabel: 'New class',
                  disabled: runner.running,
                } : {})}
              />
            </ErrorBoundary>
          )}
          <ErrorBoundary>
            <CodeEditor
              value={activeFile?.content ?? source}
              onChange={(value) => {
                clearDiagnostics(activeFile?.name)
                if (activeFile) onFileChange?.(activeFile.name, value)
                else onSourceChange?.(value)
              }}
              language={activeFile?.language ?? lang?.monacoId ?? 'plaintext'}
              className={EDITOR_HEIGHT}
              roundedTop={!files}
              javaProject={editorProject}
              markers={editorMarkers}
            />
          </ErrorBoundary>
        </div>
        <div
          ref={outputRef}
          className={`grid scroll-mt-[calc(var(--nav-h)+8px)] gap-3 ${stdinOpen ? 'md:grid-cols-2' : ''} lg:flex lg:min-h-0 lg:flex-col`}
        >
          <ErrorBoundary>
            <StdinPanel value={stdin} onChange={onStdinChange} open={stdinOpen} />
          </ErrorBoundary>
          <ErrorBoundary>
            <OutputPanel
              running={runner.running}
              runningSince={runner.runningSince}
              runningHint={runner.runningHint}
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
                className="lg:min-h-0 lg:flex-[1.5]"
              />
            </ErrorBoundary>
          )}
          {consoleText && (
            <pre className="max-h-48 shrink-0 overflow-auto lg:max-h-32 rounded-xl border border-ink-200 bg-ink-950 p-3 font-mono text-xs text-ink-100 dark:border-ink-800">
              {consoleText}
            </pre>
          )}
        </div>
      </div>
      </section>
      )}
    </div>
  )
}
