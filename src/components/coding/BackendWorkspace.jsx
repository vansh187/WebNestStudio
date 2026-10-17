import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FiChevronRight, FiColumns, FiDatabase, FiFileText, FiFolder, FiLayers, FiMaximize2, FiMinimize2, FiMonitor,
  FiMoon, FiPlay, FiSend, FiSidebar, FiSquare, FiSun, FiTerminal, FiX,
} from 'react-icons/fi'
import CodeEditor from './CodeEditor'
import BackendConsole from './BackendConsole'
import FileTree from './FileTree'
import PreviewPanel from './PreviewPanel'
import ApiClientPanel from './ApiClientPanel'
import DatabasePanel from './DatabasePanel'
import ArchitecturePanel from './ArchitecturePanel'
import ResizeHandle from './ResizeHandle'
import ErrorBoundary from '../ErrorBoundary'
import { layerOfFile, layeringHints, LAYERS } from '../../lib/codelab/backendFiles'
import { PANEL_LIMITS, useIdeLayout } from '../../hooks/useIdeLayout'
import { useTheme } from '../../context/ThemeContext'
import { statusTone } from '../../lib/codelab/httpStyles'

const REQUEST_LOG_LIMIT = 200

const TABS = [
  { id: 'output', label: 'Output', icon: FiTerminal },
  { id: 'api', label: 'API', icon: FiSend },
  { id: 'database', label: 'Database', icon: FiDatabase },
  { id: 'architecture', label: 'Architecture', icon: FiLayers },
  { id: 'preview', label: 'Preview', icon: FiMonitor },
]

const LAYER_LABEL = {
  ...Object.fromEntries(LAYERS.map((layer) => [layer.id, layer.label])),
  database: 'Database connection',
  schema: 'Database design',
  client: 'Frontend',
}

const TOOL_BTN = 'inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-40 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white'
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '')
const MOD = isMac ? '⌘' : 'Ctrl+'

// The Python backend workspace, laid out like an IDE: an activity bar, a file explorer
// drawer, editor tabs, and a resizable panel (right or bottom) for output, the API
// tester, the database, the architecture view and the frontend preview.
export default function BackendWorkspace({
  api, files, selectedFile, onSelectFile, onFileChange, onFilesChange, previewHtml, workspaceKey,
  outputRef, onRun, onCancel, running, languages = [], language, onLanguageChange,
}) {
  const layout = useIdeLayout()
  const { large, panelOpen, setPanelOpen, panelPosition, maximized, setMaximized } = layout
  const mainRef = useRef(null)
  const [tab, setTab] = useState('output')
  const [consoleText, setConsoleText] = useState('')
  const [openFiles, setOpenFiles] = useState(() => (selectedFile ? [selectedFile] : []))
  const sectionRef = useRef(null)
  const { theme, toggleTheme } = useTheme()

  // Every answered request goes into the terminal log, whichever caller sent it.
  const [requests, setRequests] = useState([])
  const [loggedExchange, setLoggedExchange] = useState(null)
  if (api.lastExchange && api.lastExchange !== loggedExchange) {
    setLoggedExchange(api.lastExchange)
    const { spec, response, source, at } = api.lastExchange
    setRequests([...requests, {
      id: `${at}-${requests.length}`,
      at,
      source,
      method: spec?.method,
      path: spec?.path,
      status: response?.status,
      ms: response?.ms,
      logs: response?.logs,
      error: response?.status ? null : response?.error,
    }].slice(-REQUEST_LOG_LIMIT))
  }

  // A failed Run (syntax error, bad import, schema.sql error) is only visible in Output,
  // so bring it forward instead of leaving the learner on another tab or a closed panel.
  const [shownResult, setShownResult] = useState(null)
  if (api.runner.result !== shownResult) {
    setShownResult(api.runner.result)
    if (api.runner.result && api.runner.result.status !== 'success') {
      setTab('output')
      if (!panelOpen) setPanelOpen(true)
    }
  }

  // Keep the selected file open as a tab, and drop tabs whose file was renamed or deleted.
  const names = useMemo(() => new Set(files.map((file) => file.name)), [files])
  if (selectedFile && names.has(selectedFile) && !openFiles.includes(selectedFile)) {
    setOpenFiles([...openFiles.filter((name) => names.has(name)), selectedFile])
  }
  const tabs = openFiles.filter((name) => names.has(name))
  const activeFile = tabs.includes(selectedFile) ? files.find((file) => file.name === selectedFile) : null

  const lastRequest = requests.at(-1)
  const hintFiles = useMemo(() => new Set(layeringHints(files).map((hint) => hint.file)), [files])
  const routeCount = useMemo(() => Object.values(api.openapi?.paths ?? {}).reduce((sum, ops) => sum + Object.keys(ops).length, 0), [api.openapi])
  const schemaSql = files.find((file) => file.name === 'schema.sql')?.content ?? ''
  const layer = activeFile ? layerOfFile(activeFile.name) : null
  const badge = { api: routeCount || null, database: api.schema?.tables?.length || null, architecture: hintFiles.size || null }

  const handleConsole = useCallback(({ type, text }) => {
    setConsoleText((prev) => `${prev}${prev ? '\n' : ''}[${type}] ${text}`.slice(-64000))
  }, [])
  // api.request is stable, so the preview's message listener is not re-added on every render.
  const { request, watchSchema } = api
  const previewRequest = useCallback((spec) => request(spec, 'preview'), [request])
  const testerRequest = useCallback((spec) => request(spec, 'tester'), [request])

  // Row counts and columns are only re-read while a panel that shows them is visible.
  useEffect(() => {
    watchSchema(panelOpen && (tab === 'database' || tab === 'architecture'))
    return () => watchSchema(false)
  }, [panelOpen, tab, watchSchema])

  const { closeMobileExplorer } = layout
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

  // Activity bar: clicking the open panel's icon hides it, any other icon shows that panel.
  const showPanel = (id) => {
    if (panelOpen && tab === id) setPanelOpen(false)
    else {
      setTab(id)
      setPanelOpen(true)
    }
  }

  // VS Code shortcuts: Ctrl/Cmd+Enter runs, Ctrl/Cmd+B explorer, Ctrl/Cmd+J panel, Esc
  // leaves full screen. Capture phase, so the editor does not turn Ctrl+Enter into a new line.
  const { toggleExplorer } = layout
  useEffect(() => {
    const onKey = (event) => {
      const mod = event.ctrlKey || event.metaKey
      if (mod && !event.shiftKey && !event.altKey && event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        if (!running) onRun?.()
      } else if (mod && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'b') {
        event.preventDefault()
        toggleExplorer()
      } else if (mod && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'j') {
        event.preventDefault()
        setPanelOpen(!panelOpen)
      } else if (event.key === 'Escape' && maximized) {
        setMaximized(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [toggleExplorer, setPanelOpen, panelOpen, maximized, setMaximized, running, onRun])

  // While the IDE is on screen, hide the site's floating chat and theme buttons (see
  // index.css), and on large screens bring the whole workspace into view under the navbar.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.ideFocus = ''
    if (window.matchMedia('(min-width: 1024px)').matches) {
      try {
        sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
      } catch {
        /* Older browsers without smooth scrolling options: leave the page where it is. */
      }
    }
    return () => { delete root.dataset.ideFocus }
  }, [])

  // Full screen covers the page, so the page behind it must not scroll.
  useEffect(() => {
    if (!maximized) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [maximized])

  const panelStyle = large && panelOpen
    ? (panelPosition === 'right' ? { width: layout.panelSize } : { height: layout.panelSize })
    : undefined

  const explorer = (
    <ErrorBoundary>
      <FileTree
        files={files}
        selectedFile={activeFile?.name}
        onSelectFile={openFile}
        onFilesChange={onFilesChange}
        disabled={running}
        hintFiles={hintFiles}
        bare
      />
    </ErrorBoundary>
  )

  return (
    <section
      ref={sectionRef}
      aria-label="Backend workspace"
      className={`flex flex-col overflow-hidden border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-950 ${
        maximized
          ? 'fixed inset-0 z-[70] h-dvh'
          : 'mt-3 scroll-mt-[calc(var(--nav-h)+0.5rem)] rounded-xl border lg:h-[calc(100dvh-var(--nav-h)-1rem)] lg:min-h-[560px]'
      }`}
    >
      {/* Toolbar */}
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-ink-200 bg-ink-50 px-2 dark:border-ink-800 dark:bg-ink-900">
        <button type="button" onClick={layout.toggleExplorer} aria-pressed={layout.explorerOpen} className={TOOL_BTN} title={`Explorer (${MOD}B)`} aria-label="Toggle file explorer">
          <FiSidebar className="h-4 w-4" />
        </button>
        {languages.length > 0 ? (
          <select
            aria-label="Language"
            value={language}
            disabled={running}
            onChange={(event) => onLanguageChange?.(event.target.value)}
            className="ml-1 h-8 max-w-[14rem] truncate rounded-md border border-ink-200 bg-white px-2 text-xs font-semibold text-ink-700 disabled:opacity-60 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-200"
          >
            {languages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        ) : (
          <span className="ml-1 hidden truncate text-xs font-semibold text-ink-600 dark:text-ink-300 sm:inline">Python Backend · FastAPI + SQLite</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {(running ? (
            <button type="button" onClick={onCancel} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-red-500 px-3 text-xs font-semibold text-white hover:bg-red-600">
              <FiSquare className="h-3.5 w-3.5" /> Stop
            </button>
          ) : (
            <button type="button" onClick={onRun} title={`Run (${MOD}Enter)`} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-ink-900 px-3 text-xs font-semibold text-white hover:bg-ink-700 dark:bg-gold-400 dark:text-ink-950">
              <FiPlay className="h-3.5 w-3.5" /> Run
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-ink-200 dark:bg-ink-700" aria-hidden="true" />
          {large && (
            <button type="button" onClick={layout.togglePanelPosition} className={TOOL_BTN} title={panelPosition === 'right' ? 'Move panel to the bottom' : 'Move panel to the right'} aria-label={panelPosition === 'right' ? 'Move panel to the bottom' : 'Move panel to the right'}>
              <FiColumns className={`h-4 w-4 ${panelPosition === 'bottom' ? 'rotate-90' : ''}`} />
            </button>
          )}
          <button type="button" onClick={() => setPanelOpen(!panelOpen)} aria-pressed={panelOpen} className={TOOL_BTN} title={`${panelOpen ? 'Hide' : 'Show'} panel (${MOD}J)`} aria-label="Toggle panel">
            <FiTerminal className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setMaximized(!maximized)} aria-pressed={maximized} className={TOOL_BTN} title={maximized ? 'Exit full screen (Esc)' : 'Full screen'} aria-label={maximized ? 'Exit full screen' : 'Full screen'}>
            {maximized ? <FiMinimize2 className="h-4 w-4" /> : <FiMaximize2 className="h-4 w-4" />}
          </button>
          <button type="button" onClick={toggleTheme} className={TOOL_BTN} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <FiMoon className="h-4 w-4" /> : <FiSun className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* Activity bar */}
        {large && (
          <nav aria-label="Workspace views" className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-ink-200 bg-ink-50 py-2 dark:border-ink-800 dark:bg-ink-900">
            <button type="button" onClick={layout.toggleExplorer} aria-pressed={layout.explorerOpen} title={`Explorer (${MOD}B)`} aria-label="Explorer" className={`relative ${TOOL_BTN} h-10 w-10 ${layout.explorerOpen ? 'text-ink-900 dark:text-white' : ''}`}>
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
                  {badge[id] ? <span className={`absolute right-0.5 top-0.5 min-w-4 rounded-full px-1 text-[9px] font-semibold leading-4 ${id === 'architecture' ? 'bg-amber-500 text-white' : 'bg-ink-700 text-white dark:bg-ink-300 dark:text-ink-950'}`}>{badge[id]}</span> : null}
                </button>
              )
            })}
          </nav>
        )}

        {/* Explorer: a docked drawer on large screens, a sliding overlay on small ones */}
        {layout.explorerOpen && (large ? (
          <aside className="w-60 shrink-0 border-r border-ink-200 dark:border-ink-800">{explorer}</aside>
        ) : (
          <>
            <button type="button" aria-label="Close file explorer" onClick={layout.toggleExplorer} className="absolute inset-0 z-20 bg-ink-950/30" />
            <aside className="absolute inset-y-0 left-0 z-30 w-72 max-w-[85%] border-r border-ink-200 shadow-xl dark:border-ink-800">{explorer}</aside>
          </>
        ))}

        <div ref={mainRef} className={`flex min-h-0 min-w-0 flex-1 ${panelPosition === 'right' ? 'flex-row' : 'flex-col'}`}>
          {/* Editor */}
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
                <button type="button" onClick={layout.toggleExplorer} className="ml-auto flex h-9 shrink-0 items-center gap-1.5 px-3 text-xs font-semibold text-ink-600 dark:text-ink-300">
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
                  {LAYER_LABEL[layer] && <span className="ml-auto shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-500 dark:bg-ink-800 dark:text-ink-300">{LAYER_LABEL[layer]}</span>}
                </div>
                <ErrorBoundary>
                  <CodeEditor
                    path={`${workspaceKey}/${activeFile.name}`}
                    value={activeFile.content ?? ''}
                    onChange={(value) => onFileChange(activeFile.name, value)}
                    language={activeFile.language ?? 'plaintext'}
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

          {/* Panel: kept mounted while hidden so the preview keeps its state */}
          <div
            ref={outputRef}
            hidden={!panelOpen}
            style={panelStyle}
            className={`flex min-h-0 min-w-0 shrink-0 scroll-mt-[calc(var(--nav-h)+8px)] flex-col bg-ink-50/60 dark:bg-ink-900/40 ${
              large ? '' : 'border-t border-ink-200 dark:border-ink-800'
            }`}
          >
            <div className="flex h-9 shrink-0 items-center border-b border-ink-200 dark:border-ink-800">
              <div role="tablist" aria-label="Backend panels" className="flex min-w-0 flex-1 overflow-x-auto">
                {TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className={`inline-flex h-9 shrink-0 items-center gap-1.5 border-b-2 px-3 text-[11px] font-semibold uppercase tracking-wide ${
                      tab === id ? 'border-gold-500 text-ink-900 dark:text-white' : 'border-transparent text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'
                    }`}
                  >
                    {label}
                    {badge[id] ? <span className={`rounded-full px-1.5 text-[10px] normal-case ${id === 'architecture' ? 'bg-amber-500/15 text-amber-600' : 'bg-ink-200/70 text-ink-600 dark:bg-ink-800 dark:text-ink-300'}`}>{badge[id]}</span> : null}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setPanelOpen(false)} className={`${TOOL_BTN} mr-1 shrink-0`} aria-label="Hide panel" title={`Hide panel (${MOD}J)`}>
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className={`flex flex-col gap-3 p-3 ${large ? 'min-h-0 flex-1 overflow-auto' : ''}`}>
              <ErrorBoundary>
                {tab === 'output' && (
                  <BackendConsole runner={api.runner} requests={requests} onClearRequests={() => setRequests([])} />
                )}
                {tab === 'api' && (
                  <ApiClientPanel
                    key={workspaceKey}
                    openapi={api.openapi}
                    ready={api.ready}
                    onSend={testerRequest}
                    storageKey={`wns-codelab-api:${workspaceKey}`}
                    embedded
                  />
                )}
                {tab === 'database' && (
                  <DatabasePanel
                    schema={api.schema}
                    booted={Boolean(api.schema)}
                    schemaSql={schemaSql}
                    onLoadSchema={api.loadSchema}
                    onSql={api.sql}
                    onApplySchema={(rebuild) => api.applySchema(schemaSql, rebuild)}
                    onReset={api.resetDatabase}
                    onExport={api.exportDatabase}
                    embedded
                  />
                )}
                {tab === 'architecture' && (
                  <ArchitecturePanel files={files} schema={api.schema} lastExchange={api.lastExchange} embedded />
                )}
                <div hidden={tab !== 'preview'} className="flex min-h-[420px] flex-1 flex-col gap-3">
                  <PreviewPanel
                    previewHtml={previewHtml}
                    onConsole={handleConsole}
                    onApiRequest={previewRequest}
                    emptyText="Run the project to load your API and show frontend/index.html here."
                    className="flex-1"
                  />
                  {consoleText && (
                    <pre className="max-h-40 shrink-0 overflow-auto rounded-xl border border-ink-200 bg-ink-950 p-3 font-mono text-xs text-ink-100 dark:border-ink-800">{consoleText}</pre>
                  )}
                </div>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar: the state of the API at a glance, even with the panel hidden */}
      <footer className="flex h-7 shrink-0 items-center gap-3 overflow-x-auto bg-ink-900 px-3 text-[11px] text-ink-200 dark:border-t dark:border-ink-800 dark:bg-ink-950">
        <button type="button" onClick={() => showPanel('output')} className="flex shrink-0 items-center gap-1.5 hover:text-white">
          <span className={`h-2 w-2 rounded-full ${running ? 'animate-pulse bg-gold-400' : api.ready ? 'bg-emerald-400' : api.runner.result ? 'bg-red-400' : 'bg-ink-500'}`} aria-hidden="true" />
          {running ? 'Starting…' : api.ready ? 'API running' : api.runner.result ? 'API not loaded' : 'Not started'}
        </button>
        {api.ready && (
          <button type="button" onClick={() => showPanel('api')} className="shrink-0 hover:text-white">{routeCount} route{routeCount === 1 ? '' : 's'}</button>
        )}
        {lastRequest && (
          <button type="button" onClick={() => showPanel('output')} className="flex min-w-0 items-center gap-1.5 hover:text-white">
            <span className="truncate">{lastRequest.method} {lastRequest.path}</span>
            <span className={`rounded border px-1 text-[10px] font-semibold ${statusTone(lastRequest.status)}`}>{lastRequest.status || 'failed'}</span>
            {typeof lastRequest.ms === 'number' && <span className="text-ink-400">{Math.round(lastRequest.ms)} ms</span>}
          </button>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-3">
          {api.schema && (
            <button type="button" onClick={() => showPanel('database')} className="hover:text-white">SQLite · {api.schema.tables?.length ?? 0} table{api.schema.tables?.length === 1 ? '' : 's'}</button>
          )}
          {activeFile && <span className="hidden capitalize text-ink-400 sm:inline">{activeFile.language ?? 'plaintext'}</span>}
          <span className="hidden text-ink-400 md:inline">{MOD}Enter Run · {MOD}B Files · {MOD}J Panel</span>
        </span>
      </footer>
    </section>
  )
}
