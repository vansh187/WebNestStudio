import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiX } from 'react-icons/fi'
import CodeEditor from './CodeEditor'
import FileTabs from './FileTabs'
import RunBar from './RunBar'
import StdinPanel from './StdinPanel'
import OutputPanel from './OutputPanel'
import PreviewPanel from './PreviewPanel'
import BackButton from './BackButton'
import ProgramDebugPanel from './ProgramDebugPanel'
import WebDebugPanel from './WebDebugPanel'
import DebugReloadDialog from './DebugReloadDialog'
import { getLanguage, mainFileName } from '../../data/codingLanguages'
import { sourceFile, toCodePayload } from '../../api/coding'
import {
  JAVA_FILE_KINDS, JAVA_OOP_EXAMPLE, findJavaMainClasses, isJavaFile, javaClassFromFile, javaFileTemplate, qualifiedJavaClass,
  renameJavaFile, validateJavaClassName,
} from '../../lib/codelab/javaProject'
import { parseJavacDiagnostics } from '../../lib/codelab/javaIntel/diagnostics'
import { createPreviewHtml } from '../../lib/codelab/webPreview'
import { useCodelabFrozenNotice } from '../../hooks/useCodelabFrozenNotice'
import { useApiRuntime } from '../../hooks/useApiRuntime'
import BackendWorkspace from './BackendWorkspace'
import SpringWorkspace from './SpringWorkspace'
import ExpressWorkspace from './ExpressWorkspace'
import { useFullscreen, useIdeFocus } from '../../hooks/useIdeShell'
import { useWorkspaceStorage } from '../../hooks/useWorkspaceStorage'
import { canIsolate, isIsolated, isolationUnsupported, reloadIsolated } from '../../lib/codelab/isolation'
import { BREAKPOINTS_PREFIX } from '../../lib/codelab/storageKeys.js'
import { changedPaths, expressionAt, hoverMarkdown, inlineValues, pathKey, resolveExpression } from '../../lib/codelab/debugValues'
import { pauseAt, startIndex, target as stepTarget } from '../../lib/codelab/tracePlayer'
import ErrorBoundary from '../ErrorBoundary'

// On large screens the workspace fills the window under the navbar (like the backend IDE),
// so the editor and panels stretch to fit it instead of setting their own heights.
const EDITOR_HEIGHT = 'h-[45dvh] min-h-[240px] md:h-[55dvh] lg:h-auto lg:min-h-0 lg:flex-1'
const PANEL_HEIGHT = 'lg:min-h-0 lg:flex-1 lg:overflow-auto'
// How long Save project waits for a fresh database snapshot.
const SAVE_SNAPSHOT_WAIT_MS = 1500
// How long the assistant's web run waits for the preview's scripts to report errors.
const WEB_ERRORS_WAIT_MS = 800

const AssistantPanel = lazy(() => import('./AssistantPanel'))

// Stored breakpoints, checked: anything else in storage is dropped.
const readBreakpoints = (saved) => (Array.isArray(saved)
  ? saved.filter((item) => typeof item?.file === 'string' && Number.isInteger(item?.line) && item.line > 0)
  : [])
const DEBUG_RELOAD_POINTS = [
  'Your code is kept in this browser and comes back after the reload.',
  'Your breakpoints stay where you set them.',
  'Press Debug again once the editor is back.',
]

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
  // The AI assistant is on for every language. Problem pages turn it off: it would write the
  // answer to the problem being practised.
  assistant = true,
  // A web Run opens its preview in full screen. Problem pages turn it off: it would cover
  // the problem statement.
  previewFullScreenOnRun = true,
}) {
  const backend = language === 'backend'
  // Spring Boot has its own IDE too; its app runs on the server (SpringWorkspace.jsx).
  const spring = language === 'spring'
  // So does Express, laid out like Spring Boot and run on the server too (ExpressWorkspace.jsx).
  const express = language === 'express'
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
  if ((backend || spring || express) && maximized) setMaximized(false)

  // The backend IDE does the same for itself (see BackendWorkspace).
  useIdeFocus(ideRef, { scroll: scrollIntoViewOnOpen, enabled: !backend && !spring && !express })
  useCodelabFrozenNotice()
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

  // The assistant, for the languages laid out here (the backend IDE has its own). Hidden, not
  // unmounted, on the Output tab, so a running task carries on. Null: never opened.
  const [assistantTab, setAssistantTab] = useState(null)
  const [assistantShown, setAssistantShown] = useState(false)
  const assistantVisible = assistantShown && assistantTab === 'ai'
  const assistantRef = useRef(null)
  const webErrors = useRef([])
  const [previewOpens, setPreviewOpens] = useState(0)

  const toggleAssistant = () => {
    if (assistantVisible) {
      setAssistantShown(false)
      return
    }
    setAssistantShown(true)
    setAssistantTab('ai')
    // Small screens stack this column below the editor, where opening it would show nothing.
    if (window.matchMedia('(max-width: 1023px)').matches) requestAnimationFrame(() => assistantRef.current?.scrollIntoView({ block: 'start' }))
  }

  // ---- Python debugging: pauses live at breakpoints, like the FastAPI debugger. It needs the
  // one reload into an isolated page (lib/codelab/isolation.js), so only where that is possible.
  const pythonDebug = language === 'python' && (isIsolated() || canIsolate())
  const debugFile = activeFile?.name ?? mainFileName(lang)
  const debugNames = useMemo(() => new Set(files?.length ? files.map((file) => file.name) : [debugFile]), [files, debugFile])
  const keepLiveBreakpoints = useCallback((items) => items.filter((item) => debugNames.has(item.file)), [debugNames])
  const breakpointKey = `${BREAKPOINTS_PREFIX}${workspaceKey}`
  const [storedBreakpoints, updateBreakpoints] = useWorkspaceStorage(breakpointKey, readBreakpoints, keepLiveBreakpoints)
  const breakpoints = useMemo(() => keepLiveBreakpoints(storedBreakpoints), [keepLiveBreakpoints, storedBreakpoints])
  const setBreakpoints = useCallback((change) => updateBreakpoints(breakpointKey, change), [updateBreakpoints, breakpointKey])
  const toggleBreakpoint = useCallback((line) => {
    setBreakpoints((current) => (current.some((item) => item.file === debugFile && item.line === line)
      ? current.filter((item) => item.file !== debugFile || item.line !== line)
      : [...current, { file: debugFile, line }]))
  }, [setBreakpoints, debugFile])
  const moveBreakpoints = useCallback((lines) => {
    setBreakpoints((current) => [...current.filter((item) => item.file !== debugFile), ...lines.map((line) => ({ file: debugFile, line }))])
  }, [setBreakpoints, debugFile])
  const [reloadPrompt, setReloadPrompt] = useState(false)
  const [debugRun, setDebugRun] = useState(null) // the run id while a debugged run is the latest
  const pyPause = pythonDebug ? runner.debugPause : null

  // ---- Web debugging: the page's JavaScript is recorded while it runs (jsInstrument.js,
  // webDebugRuntime.js), then stepped through forwards and backwards (tracePlayer.js). It runs
  // in the preview, so no reload is needed. Until the learner moves, the view follows the
  // recording to the first breakpoint hit.
  const webDebuggable = language === 'web' && Array.isArray(files)
  const [webRecording, setWebRecording] = useState(null)
  const [webMove, setWebMove] = useState(null) // { index, previous } once the learner has moved
  const webSteps = webRecording?.steps
  const webIndex = webSteps?.length ? Math.min(webMove?.index ?? startIndex(webSteps, breakpoints), webSteps.length - 1) : null
  const webPause = useMemo(() => {
    if (webIndex === null) return null
    const pause = pauseAt(webSteps, webIndex)
    const previous = webMove?.previous != null ? pauseAt(webSteps, webMove.previous) : null
    return { ...pause, previous: previous?.frames ?? null }
  }, [webSteps, webIndex, webMove])
  const goWeb = useCallback((command) => {
    if (!webSteps?.length) return
    setWebMove({ index: stepTarget(webSteps, webIndex, command, breakpoints), previous: webIndex })
  }, [webSteps, webIndex, breakpoints])
  const seekWeb = useCallback((index) => setWebMove({ index, previous: webIndex }), [webIndex])
  const onWebDebug = useCallback((batch) => {
    setWebRecording((current) => (current ? {
      ...current,
      steps: batch.steps?.length ? [...current.steps, ...batch.steps] : current.steps,
      calls: batch.calls?.length ? [...current.calls, ...batch.calls] : current.calls,
      ends: batch.ends?.length ? new Map([...current.ends, ...batch.ends.map((end) => [end.id, end])]) : current.ends,
      truncated: current.truncated || Boolean(batch.truncated),
    } : current))
  }, [])
  const stopWebDebug = useCallback(() => {
    setWebRecording(null)
    setWebMove(null)
  }, [])

  // Moving to a step in another file opens that file, as VS Code does. Only when the step
  // changes, so the learner can still switch tabs while looking at one.
  const webStepFile = webPause?.file
  const selectWebFile = useRef(onSelectFile)
  selectWebFile.current = onSelectFile
  const webFileNames = useRef(debugNames)
  webFileNames.current = debugNames
  useEffect(() => {
    if (webStepFile && webFileNames.current.has(webStepFile)) selectWebFile.current?.(webStepFile)
  }, [webIndex, webStepFile])

  // The pause the editor and the panels show: Python's live one or the Web recording's step.
  const activePause = pyPause ?? webPause
  const debugLanguage = language === 'web' ? 'javascript' : 'python'
  const [frameChoice, setFrameChoice] = useState({ pause: null, index: 0 })
  const selectedFrame = frameChoice.pause === activePause ? frameChoice.index : 0
  const selectFrame = useCallback((index) => setFrameChoice({ pause: activePause, index }), [activePause])
  const changed = useMemo(() => changedPaths(activePause?.frames, activePause?.previous), [activePause])
  const frames = activePause?.frames ?? []
  const editorFrameIndex = frames[selectedFrame]?.file === debugFile ? selectedFrame : frames.findIndex((frame) => frame.file === debugFile)
  const editorFrame = editorFrameIndex >= 0 ? frames[editorFrameIndex] : null
  const debugText = activeFile?.content ?? source ?? ''
  const debugHover = useMemo(() => {
    if (!editorFrame) return undefined
    return (lineText, column) => {
      const found = expressionAt(lineText, column, debugLanguage)
      const value = found && resolveExpression(editorFrame, found.expression)
      if (!value) return null
      return { markdown: hoverMarkdown(found.expression, value, changed[editorFrameIndex]?.has(pathKey(value.path)), debugLanguage), startColumn: found.startColumn, endColumn: found.endColumn }
    }
  }, [editorFrame, editorFrameIndex, changed, debugLanguage])
  const editorInlineValues = useMemo(
    () => (editorFrame ? inlineValues(editorFrame, debugText, changed[editorFrameIndex], debugLanguage) : undefined),
    [editorFrame, editorFrameIndex, debugText, changed, debugLanguage],
  )
  // The same keys for a Web recording, plus Shift+F5 and Shift+F10 to go back.
  useEffect(() => {
    if (!webSteps?.length) return undefined
    const onKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const command = event.key === 'F5' ? (event.shiftKey ? 'reverse' : 'continue')
        : event.key === 'F10' ? (event.shiftKey ? 'back' : 'over')
          : event.key === 'F11' ? (event.shiftKey ? 'out' : 'into')
            : null
      if (!command) return
      event.preventDefault()
      event.stopPropagation()
      goWeb(command)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [webSteps, goWeb])
  // Every Continue or step sends the current breakpoints, so changes made while paused count.
  const runnerResume = runner.resumeDebug
  const resumeDebug = useCallback((mode) => runnerResume?.(mode, breakpoints), [runnerResume, breakpoints])
  // VS Code's keys while paused: F5 continue, F11 into, F10 over, Shift+F11 out.
  useEffect(() => {
    if (!pyPause) return undefined
    const onKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const mode = event.key === 'F5' && !event.shiftKey ? 0
        : event.key === 'F11' && !event.shiftKey ? 1
          : event.key === 'F10' && !event.shiftKey ? 2
            : event.key === 'F11' && event.shiftKey ? 3
              : null
      if (mode === null) return
      event.preventDefault()
      event.stopPropagation()
      resumeDebug(mode)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [pyPause, resumeDebug])
  const lastDebugTrace = debugRun && debugRun === runner.result && runner.result?.trace ? runner.result.trace : null
  const debugActive = Boolean(pyPause) || (debugRun === 'running' && runner.running)

  const handleWebDebug = async () => {
    setConsoleText('')
    webErrors.current = []
    setAssistantTab((tab) => tab && 'output')
    runner.cancel?.()
    // Loaded only when debugging, so the parser costs nothing otherwise.
    const [{ instrumentWebFiles }, { webDebugScript }] = await Promise.all([
      import('../../lib/codelab/jsInstrument'),
      import('../../lib/codelab/webDebugRuntime'),
    ])
    const { files: recorded, scriptFiles, problems } = instrumentWebFiles(files)
    setWebMove(null)
    setWebRecording({
      previewHtml: createPreviewHtml(recorded, { debugScript: webDebugScript(scriptFiles) }),
      steps: [],
      calls: [],
      ends: new Map(),
      truncated: false,
      problems,
    })
  }

  const handleDebug = () => {
    if (language === 'web') {
      handleWebDebug().catch((error) => console.error('Could not start the Web debugger:', error))
      return
    }
    if (!isIsolated()) {
      if (canIsolate() && !isolationUnsupported()) setReloadPrompt(true)
      return
    }
    setConsoleText('')
    setAssistantTab((tab) => tab && 'output')
    setDebugRun('running')
    runner.run({
      language,
      ...toCodePayload({ source: debugText, sourceName: debugFile, fileName: mainFileName(lang), files, extra: { stdin: stdin ?? '' } }),
    }, { breakpoints }).then(({ result }) => setDebugRun(result ?? null))
  }

  const handleRun = () => {
    setDebugRun(null)
    stopWebDebug()
    setConsoleText('')
    webErrors.current = []
    setAssistantTab((tab) => tab && 'output')
    if (language === 'web' && previewFullScreenOnRun) setPreviewOpens((count) => count + 1)
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

  // Runs the given files for the AI assistant, which edits them faster than this component
  // re-renders. Resolves to the run's result.
  const { run: runApi } = api
  const runProject = useCallback(async (latest) => {
    const result = await runApi(latest, 'assistant')
    setBackendPreview(createPreviewHtml(latest, { folder: 'frontend/', apiBridge: true }))
    return result
  }, [runApi])

  // A project may be one text (no `files`), such as a saved Python project; to the assistant
  // it is a project with one file.
  const assistantFiles = files ?? [{ name: mainFileName(lang), language: lang?.monacoId ?? 'plaintext', content: source ?? '' }]
  const assistantFilesChange = files ? onFilesChange : (next) => onSourceChange?.(next[0]?.content ?? '')

  const withWebErrors = (result) => (result && webErrors.current.length
    ? { ...result, status: 'runtime_error', stderr: webErrors.current.join('\n') }
    : result)
  const assistantLastResult = () => withWebErrors(runner.result ?? (runner.error ? { status: 'internal_error', error: runner.error } : null))

  // The assistant's edits are newer than this render's `files`, so it passes the files to run.
  const runAssistantFiles = async (latest) => {
    const active = sourceFile(latest, selectedFile) ?? sourceFile(latest)
    let extra = { stdin: stdin ?? '' }
    if (language === 'java') {
      const mains = findJavaMainClasses(latest)
      const current = javaClassName.split('.').at(-1)
      extra = { ...extra, className: qualifiedJavaClass(latest, mains.includes(current) ? current : mains[0] ?? current) }
    }
    webErrors.current = []
    setConsoleText('')
    const { result, error } = await runner.run({
      language,
      ...toCodePayload({ source: active?.content ?? '', sourceName: active?.name, fileName: mainFileName(lang), files: files ? latest : undefined, extra }),
    })
    if (language === 'web' && result) await new Promise((resolve) => { setTimeout(resolve, WEB_ERRORS_WAIT_MS) })
    return withWebErrors(result) ?? { status: 'stopped', error: error ?? 'The run was stopped.' }
  }

  const handleConsole = ({ type, text }) => {
    if (type === 'error') webErrors.current.push(text)
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
            runProject={runProject}
            onSave={saveBackend}
            saving={saving || preparingSave}
            saveLabel={saveLabel}
          />
        </>
      ) : express ? (
        <>
          <p className="mt-2 text-xs text-ink-500 dark:text-ink-300">
            Express runs on WebNest&rsquo;s server with Node.js 24: each Run or API request starts your app. Your files are kept in this browser. Shortcuts: Ctrl+Enter runs, Ctrl+B shows files, Ctrl+J shows the panel.
          </p>
          <ExpressWorkspace
            files={files ?? []}
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
            onFileChange={onFileChange}
            onFilesChange={onFilesChange}
            workspaceKey={workspaceKey}
            outputRef={outputRef}
            languages={languages}
            language={language}
            onLanguageChange={onLanguageChange}
            toolbarExtra={headerRight}
          />
        </>
      ) : spring ? (
        <>
          <p className="mt-2 text-xs text-ink-500 dark:text-ink-300">
            Spring Boot runs on WebNest&rsquo;s server: each Run or API request compiles and starts your app with an H2 database. Your files are kept in this browser. Shortcuts: Ctrl+Enter runs, Ctrl+B shows files, Ctrl+J shows the panel.
          </p>
          <SpringWorkspace
            files={files ?? []}
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
            onFileChange={onFileChange}
            onFilesChange={onFilesChange}
            workspaceKey={workspaceKey}
            outputRef={outputRef}
            languages={languages}
            language={language}
            onLanguageChange={onLanguageChange}
            toolbarExtra={headerRight}
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
            onAssistant={assistant ? toggleAssistant : undefined}
            assistantOpen={assistantVisible}
            onDebug={pythonDebug || webDebuggable ? handleDebug : undefined}
          />
        </ErrorBoundary>
        {reloadPrompt && (
          <DebugReloadDialog
            points={DEBUG_RELOAD_POINTS}
            onClose={() => setReloadPrompt(false)}
            onConfirm={async () => {
              reloadIsolated()
              return new Promise(() => {})
            }}
          />
        )}
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
          {language === 'node' && (
            <p className="mb-3 text-xs text-ink-500 dark:text-ink-300">
              Node.js 24 on WebNest&rsquo;s server · 10 second runtime · log in to run · no npm install: popular packages such as lodash, dayjs, zod and prompt-sync are already there. For a REST API, pick Node.js Backend (Express).
            </p>
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
              {...(pythonDebug || webDebuggable ? {
                path: `${workspaceKey}/${debugFile}`,
                breakpoints: breakpoints.filter((item) => item.file === debugFile).map((item) => item.line),
                onToggleBreakpoint: toggleBreakpoint,
                onBreakpointsChange: moveBreakpoints,
                pausedLine: activePause?.file === debugFile ? activePause.line : undefined,
                revealLine: activePause?.file === debugFile ? activePause.line : undefined,
                debugHover,
                inlineValues: editorInlineValues,
              } : {})}
            />
          </ErrorBoundary>
        </div>
        <div className="flex min-w-0 flex-col lg:min-h-0">
        {assistantShown && (
          <div ref={assistantRef} role="tablist" aria-label="Assistant and output" className="mb-2 flex shrink-0 scroll-mt-[calc(var(--nav-h)+8px)] items-center gap-1 rounded-xl border border-ink-200 p-1 dark:border-ink-800">
            {[['ai', 'WebNest AI'], ['output', language === 'web' ? 'Output and preview' : 'Output']].map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={assistantTab === id} onClick={() => setAssistantTab(id)} className={`h-8 rounded-lg px-3 text-xs font-semibold ${assistantTab === id ? 'bg-ink-900 text-white dark:bg-gold-400 dark:text-ink-950' : 'text-ink-500 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white'}`}>
                {label}
              </button>
            ))}
            <button type="button" onClick={() => setAssistantShown(false)} aria-label="Hide WebNest AI" title="Hide WebNest AI" className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white">
              <FiX className="h-4 w-4" />
            </button>
          </div>
        )}
        {assistantTab && (
          <div className={assistantVisible ? 'h-[75dvh] min-h-[420px] overflow-hidden rounded-xl border border-ink-200 dark:border-ink-800 lg:h-auto lg:min-h-0 lg:flex-1' : 'hidden'}>
            <ErrorBoundary>
              <Suspense fallback={<div className="grid h-full place-items-center text-xs text-ink-400">Loading WebNest AI…</div>}>
                {/* Keyed: a pending approval or undo must not carry over to another project. */}
                <AssistantPanel
                  key={`${workspaceKey}:${language}`}
                  workspaceKey={workspaceKey}
                  language={language}
                  files={assistantFiles}
                  selectedFile={activeFile?.name ?? assistantFiles[0]?.name}
                  lastResult={assistantLastResult}
                  onFilesChange={assistantFilesChange}
                  runProject={runAssistantFiles}
                  onOpenFile={onSelectFile}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
        <div
          ref={outputRef}
          className={assistantVisible ? 'hidden' : `grid scroll-mt-[calc(var(--nav-h)+8px)] gap-3 ${stdinOpen ? 'md:grid-cols-2' : ''} lg:flex lg:min-h-0 lg:flex-1 lg:flex-col`}
        >
          {/* First for web, so the page shows without scrolling past the output. */}
          {language === 'web' && (
            <ErrorBoundary>
              <PreviewPanel
                previewHtml={webRecording?.previewHtml ?? runner.result?.previewHtml}
                onConsole={handleConsole}
                onDebug={webRecording ? onWebDebug : undefined}
                openRequest={previewOpens}
                className="lg:min-h-0 lg:flex-[1.5]"
              />
            </ErrorBoundary>
          )}
          <ErrorBoundary>
            <StdinPanel value={stdin} onChange={onStdinChange} open={stdinOpen} />
          </ErrorBoundary>
          {webRecording && (
            <ErrorBoundary>
              <div className="lg:max-h-[55%] lg:shrink-0 lg:overflow-auto">
                <WebDebugPanel
                  recording={webRecording}
                  paused={webPause}
                  breakpoints={breakpoints}
                  onGo={goWeb}
                  onSeek={seekWeb}
                  onStop={stopWebDebug}
                  onOpenLocation={(file) => { if (debugNames.has(file)) onSelectFile?.(file) }}
                  selectedFrame={selectedFrame}
                  onSelectFrame={selectFrame}
                  changed={changed}
                />
              </div>
            </ErrorBoundary>
          )}
          {pythonDebug && (debugActive || lastDebugTrace || breakpoints.length > 0 || isolationUnsupported()) && (
            <ErrorBoundary>
              <div className="lg:max-h-[55%] lg:shrink-0 lg:overflow-auto">
                <ProgramDebugPanel
                  paused={pyPause}
                  running={debugActive && !pyPause}
                  armed={isIsolated()}
                  trace={lastDebugTrace}
                  breakpoints={breakpoints}
                  isolationUnsupported={isolationUnsupported()}
                  onResume={resumeDebug}
                  onStop={runner.cancel}
                  onOpenLocation={(file) => { if (debugNames.has(file)) onSelectFile?.(file) }}
                  selectedFrame={selectedFrame}
                  onSelectFrame={selectFrame}
                  changed={changed}
                />
              </div>
            </ErrorBoundary>
          )}
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
          {consoleText && (
            <pre className="max-h-48 shrink-0 overflow-auto lg:max-h-32 rounded-xl border border-ink-200 bg-ink-950 p-3 font-mono text-xs text-ink-100 dark:border-ink-800">
              {consoleText}
            </pre>
          )}
        </div>
        </div>
      </div>
      </section>
      )}
    </div>
  )
}
