import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiChevronRight, FiColumns, FiFileText, FiFolder, FiHelpCircle, FiPlay, FiRotateCcw, FiSend, FiSidebar, FiSquare,
  FiTerminal, FiX,
} from 'react-icons/fi'
import CodeEditor from './CodeEditor'
import FileTree from './FileTree'
import OutputPanel from './OutputPanel'
import ApiClientPanel from './ApiClientPanel'
import ResizeHandle from './ResizeHandle'
import ErrorBoundary from '../ErrorBoundary'
import { FullscreenButton, ThemeToggleButton } from './IdeButtons'
import { useAuth } from '../../context/AuthContext'
import { useSpringRuntime } from '../../hooks/useSpringRuntime'
import { useApiTesterSession } from '../../hooks/useApiTesterSession'
import { PANEL_LIMITS, useIdeLayout } from '../../hooks/useIdeLayout'
import { useFullscreen, useIdeFocus } from '../../hooks/useIdeShell'
import { parseJavacDiagnostics } from '../../lib/codelab/javaIntel/diagnostics'
import { statusTone } from '../../lib/codelab/httpStyles'
import { API_TESTER_PREFIX } from '../../lib/codelab/storageKeys.js'
import {
  languageForSpringFile, normalizeSpringPath, springFileTemplate, springProjectSize, validateSpringPath, SPRING_MAX_BYTES,
  SPRING_MAX_WRITES,
} from '../../lib/codelab/springProject.js'

const TABS = [
  { id: 'output', label: 'Output', icon: FiTerminal },
  { id: 'api', label: 'API', icon: FiSend },
  { id: 'help', label: 'Help', icon: FiHelpCircle },
]
const REQUEST_LOG_LIMIT = 50
const TOOL_BTN = 'inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-40 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white'
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '')
const MOD = isMac ? '⌘' : 'Ctrl+'

// Controllers, services and repositories get the same coloured dots as the FastAPI layers.
function springLayer(name) {
  if (/Controller\.java$/.test(name)) return 'api'
  if (/Service\.java$/.test(name)) return 'services'
  if (/Repository\.java$/.test(name)) return 'repositories'
  if (/\.sql$/.test(name)) return 'schema'
  return null
}

const SPRING_TREE_RULES = {
  normalize: normalizeSpringPath,
  validate: validateSpringPath,
  template: springFileTemplate,
  languageFor: languageForSpringFile,
  layerOf: springLayer,
  size: springProjectSize,
  maxBytes: SPRING_MAX_BYTES,
  newRoot: 'src/main/java/com/example/demo/',
  placeholder: 'src/main/java/com/example/demo/task/TaskMapper.java',
  help: 'Classes go under src/main/java/, in a folder for their package. Resources: application.properties, data.sql, schema.sql.',
}

function HelpText() {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
      <h3 className="font-display text-base font-semibold text-ink-900 dark:text-white">How this workspace runs Spring Boot</h3>
      <p>Spring Boot needs a Java server, so your project runs on WebNest&rsquo;s cloud runner, not in your browser. Each <strong>Run</strong> or API request compiles your code, starts the app with an in-memory H2 database, sends the request, and stops the app again.</p>
      <p>That is why every request takes a few seconds. Starting fresh each time also means the database is rebuilt from <code className="font-mono text-xs">data.sql</code> every time. So that data you add stays, your successful POST, PUT, PATCH and DELETE requests are <strong>replayed</strong> before each new request (up to {SPRING_MAX_WRITES}). <strong>Reset data</strong> forgets them.</p>
      <h4 className="font-semibold text-ink-900 dark:text-white">The flow of a request</h4>
      <ol className="list-decimal space-y-1 pl-5">
        <li><strong>Controller</strong> (<code className="font-mono text-xs">@RestController</code>): maps the URL and HTTP method to a Java method, reads the path, query and JSON body.</li>
        <li><strong>Service</strong> (<code className="font-mono text-xs">@Service</code>): checks the rules and runs each change in a transaction.</li>
        <li><strong>Repository</strong> (<code className="font-mono text-xs">JpaRepository</code>): Spring Data writes the SQL from the method names.</li>
        <li><strong>Entity</strong> (<code className="font-mono text-xs">@Entity</code>): one row of a table; Hibernate creates the tables at startup.</li>
      </ol>
      <p>Pick a sample from the <strong>Sample</strong> list to see each step, simplest first.</p>
      <p>Put starting rows in <code className="font-mono text-xs">data.sql</code>: it runs before the app takes requests. Code in a <code className="font-mono text-xs">CommandLineRunner</code> may still be running when the first request arrives.</p>
      <h4 className="font-semibold text-ink-900 dark:text-white">What you can use</h4>
      <p>Spring Boot 4.1 on Java 17: Spring Web MVC, Bean Validation, Spring Data JPA with Hibernate, and H2. Files go under <code className="font-mono text-xs">src/main/java/</code>; <code className="font-mono text-xs">pom.xml</code> is shown for learning, and the runner provides these libraries itself. The app has no internet access.</p>
      <p>Limits per run: 30 seconds to compile, 45 seconds to start, 10 seconds per request. You need to be logged in, and there is a daily run limit.</p>
      <p className="text-xs text-ink-400">Coming later: WebNest AI, saving Spring Boot projects to your account, and GitHub sync.</p>
    </div>
  )
}

// The Spring Boot workspace: a file explorer, editor tabs, and a panel with the run output,
// the API tester and help. Laid out like the FastAPI workspace (BackendWorkspace.jsx), but
// the app runs on the server for each Run or request (useSpringRuntime.js).
export default function SpringWorkspace({
  files, selectedFile, onSelectFile, onFileChange, onFilesChange, workspaceKey, outputRef,
  languages = [], language, onLanguageChange, toolbarExtra,
}) {
  const layout = useIdeLayout()
  const { large, panelOpen, setPanelOpen, panelPosition, maximized, setMaximized } = layout
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const sectionRef = useRef(null)
  const mainRef = useRef(null)
  const [tab, setTab] = useState('output')
  const spring = useSpringRuntime(workspaceKey, files)
  const { runner } = spring
  const running = runner.running

  // Renaming uses the shared tree code, which names languages the Python way; keep Java's.
  const changeFiles = useCallback((next) => {
    onFilesChange(next.map((file) => ({ ...file, language: languageForSpringFile(file.name) })))
  }, [onFilesChange])

  const nameList = files.map((file) => file.name).join('\n')
  const names = useMemo(() => new Set(nameList.split('\n')), [nameList])
  const [openFiles, setOpenFiles] = useState(() => (selectedFile ? [selectedFile] : []))
  if (selectedFile && names.has(selectedFile) && !openFiles.includes(selectedFile)) {
    setOpenFiles([...openFiles.filter((name) => names.has(name)), selectedFile])
  }
  const tabs = openFiles.filter((name) => names.has(name))
  const activeFile = tabs.includes(selectedFile) ? files.find((file) => file.name === selectedFile) : null

  // Every answered request goes into the Output log.
  const [requests, setRequests] = useState([])
  const [loggedExchange, setLoggedExchange] = useState(null)
  if (spring.lastExchange && spring.lastExchange !== loggedExchange) {
    setLoggedExchange(spring.lastExchange)
    const { spec, response, at } = spring.lastExchange
    setRequests([...requests, {
      id: `${at}-${requests.length}`, method: spec?.method, path: spec?.path, status: response?.status, ms: response?.ms, error: response?.status ? null : response?.error,
    }].slice(-REQUEST_LOG_LIMIT))
  }

  // A failed run is only visible in Output, so bring it forward.
  const [shownResult, setShownResult] = useState(null)
  if (runner.result !== shownResult) {
    setShownResult(runner.result)
    if (runner.result && runner.result.status !== 'success' && tab !== 'output') {
      setTab('output')
      if (!panelOpen) setPanelOpen(true)
    }
  }

  // javac errors underlined in their file until the next run.
  const compileErrors = runner.result?.status === 'compile_error' ? runner.result.compile?.stderr : ''
  const markers = useMemo(() => {
    if (!compileErrors || !activeFile) return []
    const leaf = activeFile.name.split('/').pop()
    const sameLeaf = files.filter((file) => file.name.split('/').pop() === leaf).length
    return parseJavacDiagnostics(compileErrors, [])
      .filter((item) => item.file === leaf && sameLeaf === 1)
  }, [compileErrors, activeFile, files])

  const testerRequest = useCallback((spec) => spring.request(spec, 'tester'), [spring])
  const testerSession = useApiTesterSession(`${API_TESTER_PREFIX}${workspaceKey}`, testerRequest)
  const routeCount = useMemo(() => Object.values(spring.openapi?.paths ?? {}).reduce((sum, ops) => sum + Object.keys(ops).length, 0), [spring.openapi])

  const { closeMobileExplorer, toggleExplorer } = layout
  const openFile = useCallback((name) => {
    if (!name) return
    setOpenFiles((current) => (current.includes(name) ? current : [...current, name]))
    onSelectFile(name)
    closeMobileExplorer()
  }, [onSelectFile, closeMobileExplorer])

  const closeFile = (name) => {
    const index = tabs.indexOf(name)
    const next = tabs.filter((item) => item !== name)
    setOpenFiles(next)
    if (name === selectedFile && next.length) onSelectFile(next[Math.min(index, next.length - 1)])
  }

  const showPanel = (id) => {
    if (panelOpen && tab === id) setPanelOpen(false)
    else {
      setTab(id)
      setPanelOpen(true)
    }
  }

  const { run } = runner
  const startRun = useCallback(() => {
    setTab('output')
    setPanelOpen(true)
    run()
  }, [run, setPanelOpen])

  // Ctrl/Cmd+Enter runs, +B files, +J panel, as in the FastAPI workspace.
  useEffect(() => {
    const onKey = (event) => {
      const mod = event.ctrlKey || event.metaKey
      if (!mod || event.shiftKey || event.altKey) return
      if (event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        if (!running) startRun()
      } else if (event.key.toLowerCase() === 'b') {
        event.preventDefault()
        toggleExplorer()
      } else if (event.key.toLowerCase() === 'j') {
        event.preventDefault()
        setPanelOpen(!panelOpen)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [toggleExplorer, setPanelOpen, panelOpen, running, startRun])

  useIdeFocus(sectionRef)
  useFullscreen(maximized, setMaximized)

  const panelStyle = large && panelOpen
    ? (panelPosition === 'right' ? { width: layout.panelSize } : { height: layout.panelSize })
    : undefined
  const lastRequest = requests.at(-1)
  const writeCount = spring.writes.length

  const explorer = (
    <ErrorBoundary>
      <FileTree files={files} selectedFile={activeFile?.name} onSelectFile={openFile} onFilesChange={changeFiles} disabled={running} rules={SPRING_TREE_RULES} bare />
    </ErrorBoundary>
  )

  return (
    <section
      ref={sectionRef}
      aria-label="Spring Boot workspace"
      className={`flex flex-col overflow-hidden border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-950 ${
        maximized
          ? 'fixed inset-0 z-[70] h-dvh'
          : 'mt-3 scroll-mt-[calc(var(--nav-h)+0.5rem)] rounded-xl border lg:h-[calc(100dvh-var(--nav-h)-1rem)] lg:min-h-[560px]'
      }`}
    >
      {/* Toolbar */}
      <div className="flex min-h-11 shrink-0 flex-wrap items-center gap-1 border-b border-ink-200 bg-ink-50 px-2 py-1 dark:border-ink-800 dark:bg-ink-900">
        <button type="button" onClick={toggleExplorer} aria-pressed={layout.explorerOpen} className={TOOL_BTN} title={`Explorer (${MOD}B)`} aria-label="Toggle file explorer">
          <FiSidebar className="h-4 w-4" />
        </button>
        {languages.length > 0 && (
          <select
            aria-label="Language"
            value={language}
            disabled={running}
            onChange={(event) => onLanguageChange?.(event.target.value)}
            className="ml-1 h-8 max-w-[9rem] truncate rounded-md border border-ink-200 bg-white px-2 text-xs font-semibold text-ink-700 disabled:opacity-60 min-[1400px]:max-w-[16rem] dark:border-ink-700 dark:bg-ink-950 dark:text-ink-200"
          >
            {languages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        )}
        {toolbarExtra && <div className="ml-1 flex min-w-0 max-w-full items-center gap-2 [&_button]:h-8 [&_button]:py-0 [&_select]:h-8 [&_select]:py-0">{toolbarExtra}</div>}
        <div className="flex w-full flex-wrap items-center gap-1 lg:ml-auto lg:w-auto">
          {writeCount > 0 && (
            <button type="button" onClick={spring.resetData} disabled={running} title={`Forget the ${writeCount} saved write${writeCount === 1 ? '' : 's'} replayed before each request`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink-300 px-2.5 text-xs font-semibold text-ink-700 hover:border-gold-400 disabled:opacity-60 dark:border-ink-700 dark:text-ink-200">
              <FiRotateCcw className="h-3.5 w-3.5" /> Reset data <span className="rounded-full bg-ink-200/70 px-1.5 text-[10px] dark:bg-ink-800">{writeCount}</span>
            </button>
          )}
          {running ? (
            <button type="button" onClick={runner.cancel} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-red-500 px-3 text-xs font-semibold text-white hover:bg-red-600">
              <FiSquare className="h-3.5 w-3.5" /> Stop
            </button>
          ) : (
            <button type="button" onClick={startRun} title={`Compile and start the app (${MOD}Enter)`} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-ink-900 px-3 text-xs font-semibold text-white hover:bg-ink-700 dark:bg-gold-400 dark:text-ink-950">
              <FiPlay className="h-3.5 w-3.5" /> Run
            </button>
          )}
          <span className="mx-1 h-5 w-px bg-ink-200 dark:bg-ink-700" aria-hidden="true" />
          {large && (
            <button type="button" onClick={layout.togglePanelPosition} className={TOOL_BTN} title={panelPosition === 'right' ? 'Move panel to the bottom' : 'Move panel to the right'} aria-label={panelPosition === 'right' ? 'Move panel to the bottom' : 'Move panel to the right'}>
              <FiColumns className={`h-4 w-4 ${panelPosition === 'bottom' ? 'rotate-90' : ''}`} />
            </button>
          )}
          <button type="button" onClick={() => setPanelOpen(!panelOpen)} aria-pressed={panelOpen} className={TOOL_BTN} title={`${panelOpen ? 'Hide' : 'Show'} panel (${MOD}J)`} aria-label="Toggle panel">
            <FiTerminal className="h-4 w-4" />
          </button>
          <FullscreenButton maximized={maximized} onToggle={() => setMaximized(!maximized)} className={TOOL_BTN} />
          <ThemeToggleButton className={TOOL_BTN} />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {large && (
          <nav aria-label="Workspace views" className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-ink-200 bg-ink-50 py-2 dark:border-ink-800 dark:bg-ink-900">
            <button type="button" onClick={toggleExplorer} aria-pressed={layout.explorerOpen} title={`Explorer (${MOD}B)`} aria-label="Explorer" className={`relative ${TOOL_BTN} h-10 w-10 ${layout.explorerOpen ? 'text-ink-900 dark:text-white' : ''}`}>
              {layout.explorerOpen && <span className="absolute -left-1 top-2 bottom-2 w-0.5 rounded bg-gold-500" aria-hidden="true" />}
              <FiFolder className="h-5 w-5" />
            </button>
            <span className="my-1 h-px w-6 bg-ink-200 dark:bg-ink-800" aria-hidden="true" />
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = panelOpen && tab === id
              return (
                <button key={id} type="button" onClick={() => showPanel(id)} aria-pressed={active} title={label} aria-label={label} className={`relative ${TOOL_BTN} h-10 w-10 ${active ? 'text-ink-900 dark:text-white' : ''}`}>
                  {active && <span className="absolute -left-1 top-2 bottom-2 w-0.5 rounded bg-gold-500" aria-hidden="true" />}
                  <Icon className="h-5 w-5" />
                  {id === 'api' && routeCount ? <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-ink-700 px-1 text-[9px] font-semibold leading-4 text-white dark:bg-ink-300 dark:text-ink-950">{routeCount}</span> : null}
                </button>
              )
            })}
          </nav>
        )}

        {layout.explorerOpen && (large ? (
          <aside className="w-64 shrink-0 border-r border-ink-200 dark:border-ink-800">{explorer}</aside>
        ) : (
          <>
            <button type="button" aria-label="Close file explorer" onClick={toggleExplorer} className="absolute inset-0 z-20 bg-ink-950/30" />
            <aside className="absolute inset-y-0 left-0 z-30 w-72 max-w-[85%] border-r border-ink-200 shadow-xl dark:border-ink-800">{explorer}</aside>
          </>
        ))}

        <div ref={mainRef} className={`flex min-h-0 min-w-0 flex-1 ${panelPosition === 'right' ? 'flex-row' : 'flex-col'}`}>
          <div className={`flex min-w-0 flex-col ${large ? 'min-h-0 flex-1' : 'h-[60dvh] min-h-[320px]'}`}>
            <div role="tablist" aria-label="Open files" className="flex h-9 shrink-0 items-end overflow-x-auto border-b border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-900">
              {tabs.map((name) => {
                const active = name === activeFile?.name
                return (
                  <div key={name} className={`group flex h-9 shrink-0 items-center border-r border-ink-200 text-xs dark:border-ink-800 ${active ? 'bg-white text-ink-900 dark:bg-ink-950 dark:text-white' : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'}`}>
                    <button type="button" role="tab" aria-selected={active} onClick={() => openFile(name)} title={name} className="flex h-full items-center gap-1.5 pl-3 pr-1">
                      <FiFileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="max-w-[12rem] truncate">{name.split('/').pop()}</span>
                    </button>
                    <button type="button" onClick={() => closeFile(name)} aria-label={`Close ${name}`} className={`mr-1 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-ink-200 dark:hover:bg-ink-800 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}>
                      <FiX className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}
              {!large && (
                <button type="button" onClick={toggleExplorer} className="ml-auto flex h-9 shrink-0 items-center gap-1.5 px-3 text-xs font-semibold text-ink-600 dark:text-ink-300">
                  <FiFolder className="h-3.5 w-3.5" /> Files
                </button>
              )}
            </div>
            {activeFile ? (
              <>
                <div className="flex h-7 shrink-0 items-center gap-1 overflow-hidden border-b border-ink-100 px-3 text-[11px] text-ink-500 dark:border-ink-800 dark:text-ink-400">
                  {activeFile.name.split('/').map((part, index, parts) => (
                    <span key={`${part}-${index}`} className="flex items-center gap-1">
                      {index > 0 && <FiChevronRight className="h-3 w-3" />}
                      <span className={index === parts.length - 1 ? 'font-semibold text-ink-700 dark:text-ink-200' : ''}>{part}</span>
                    </span>
                  ))}
                  {activeFile.name === 'pom.xml' && <span className="ml-auto shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-500 dark:bg-ink-800 dark:text-ink-300">For reading: the runner provides the libraries</span>}
                </div>
                <ErrorBoundary>
                  <CodeEditor
                    path={`${workspaceKey}/${activeFile.name}`}
                    value={activeFile.content ?? ''}
                    onChange={(value) => onFileChange(activeFile.name, value)}
                    language={activeFile.language ?? languageForSpringFile(activeFile.name)}
                    markers={markers}
                    className="min-h-0 flex-1"
                    frameless
                  />
                </ErrorBoundary>
              </>
            ) : (
              <div className="grid flex-1 place-items-center p-6 text-center text-sm text-ink-400">
                <p>No file open. Pick one in the Explorer <span className="whitespace-nowrap">({MOD}B)</span>.</p>
              </div>
            )}
          </div>

          {panelOpen && large && (
            <ResizeHandle
              position={panelPosition}
              size={layout.panelSize}
              onResize={layout.setPanelSize}
              onReset={() => layout.setPanelSize(PANEL_LIMITS[panelPosition].initial)}
              containerRef={mainRef}
            />
          )}

          <div
            ref={outputRef}
            hidden={!panelOpen}
            style={panelStyle}
            className={`flex min-h-0 min-w-0 shrink-0 scroll-mt-[calc(var(--nav-h)+8px)] flex-col bg-ink-50/60 dark:bg-ink-900/40 ${large ? '' : 'border-t border-ink-200 dark:border-ink-800'}`}
          >
            <div className="flex h-9 shrink-0 items-center border-b border-ink-200 dark:border-ink-800">
              <div role="tablist" aria-label="Spring Boot panels" className="flex min-w-0 flex-1 overflow-x-auto">
                {TABS.map(({ id, label }) => (
                  <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`inline-flex h-9 shrink-0 flex-auto items-center justify-center gap-1 whitespace-nowrap border-b-2 px-2 text-[11px] font-semibold uppercase ${tab === id ? 'border-gold-500 text-ink-900 dark:text-white' : 'border-transparent text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'}`}>
                    {label}
                    {id === 'api' && routeCount ? <span className="shrink-0 rounded-full bg-ink-200/70 px-1.5 text-[10px] normal-case text-ink-600 dark:bg-ink-800 dark:text-ink-300">{routeCount}</span> : null}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setPanelOpen(false)} className={`${TOOL_BTN} mr-1 shrink-0`} aria-label="Hide panel" title={`Hide panel (${MOD}J)`}>
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className={`flex flex-col gap-3 p-3 ${large ? 'min-h-0 flex-1 overflow-auto' : ''}`}>
              {!isAuthenticated && tab !== 'help' && (
                <p className="rounded-lg border border-gold-400/50 bg-gold-50 px-3 py-2 text-xs text-ink-700 dark:bg-gold-400/10 dark:text-ink-200">
                  Spring Boot projects run on WebNest&rsquo;s server, so you need to be logged in.{' '}
                  <Link to="/login" state={{ from: location }} className="font-semibold text-gold-600 underline dark:text-gold-300">Log in</Link>
                </p>
              )}
              <ErrorBoundary>
                {tab === 'output' && (
                  <>
                    <OutputPanel
                      running={running}
                      runningSince={runner.runningSince}
                      runningHint={runner.runningHint}
                      stopped={runner.stopped}
                      result={runner.result}
                      error={runner.error}
                    />
                    {requests.length > 0 && (
                      <div className="rounded-xl border border-ink-200 bg-white p-3 dark:border-ink-800 dark:bg-ink-900/40">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">Requests</p>
                          <button type="button" onClick={() => setRequests([])} className="text-[11px] font-semibold text-ink-500 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white">Clear</button>
                        </div>
                        <ul className="space-y-1 font-mono text-xs">
                          {[...requests].reverse().map((item) => (
                            <li key={item.id} className="flex items-center gap-2">
                              <span className={`shrink-0 rounded border px-1 text-[10px] font-semibold ${statusTone(item.status)}`}>{item.status || 'failed'}</span>
                              <span className="min-w-0 truncate text-ink-700 dark:text-ink-200">{item.method} {item.path}</span>
                              {typeof item.ms === 'number' && <span className="ml-auto shrink-0 text-ink-400">{Math.round(item.ms)} ms</span>}
                              {item.error && <span className="ml-auto min-w-0 truncate text-red-500" title={item.error}>{item.error}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                {tab === 'api' && (
                  <ApiClientPanel key={workspaceKey} openapi={spring.openapi} ready={routeCount > 0} session={testerSession} embedded />
                )}
                {tab === 'help' && <HelpText />}
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex h-7 shrink-0 items-center gap-3 overflow-x-auto bg-ink-900 px-3 text-[11px] text-ink-200 dark:border-t dark:border-ink-800 dark:bg-ink-950">
        <button type="button" onClick={() => showPanel('output')} className="flex shrink-0 items-center gap-1.5 hover:text-white">
          <span className={`h-2 w-2 rounded-full ${running ? 'animate-pulse bg-gold-400' : runner.result?.status === 'success' ? 'bg-emerald-400' : runner.result || runner.error ? 'bg-red-400' : 'bg-ink-500'}`} aria-hidden="true" />
          {running ? 'Running on the server…' : runner.result?.status === 'success' ? 'Last run started fine' : runner.result || runner.error ? 'Last run failed' : 'Not run yet'}
        </button>
        <button type="button" onClick={() => showPanel('api')} className="shrink-0 hover:text-white">{routeCount} endpoint{routeCount === 1 ? '' : 's'}</button>
        {lastRequest && (
          <button type="button" onClick={() => showPanel('output')} className="flex min-w-0 items-center gap-1.5 hover:text-white">
            <span className="truncate">{lastRequest.method} {lastRequest.path}</span>
            <span className={`rounded border px-1 text-[10px] font-semibold ${statusTone(lastRequest.status)}`}>{lastRequest.status || 'failed'}</span>
          </button>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-3">
          <span className="hidden text-ink-400 sm:inline">Spring Boot 4.1 · Java 17 · H2</span>
          <span className="hidden text-ink-400 md:inline">{MOD}Enter Run · {MOD}B Files · {MOD}J Panel</span>
        </span>
      </footer>
    </section>
  )
}
