import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCode, FiMessageSquare, FiPlay, FiSquare, FiTerminal } from 'react-icons/fi'
import ErrorBoundary from '../components/ErrorBoundary'
import { Skeleton } from '../components/states/Skeleton'
import CodeEditor from '../components/coding/CodeEditor'
import FileTabs from '../components/coding/FileTabs'
import OutputPanel from '../components/coding/OutputPanel'
import PreviewPanel from '../components/coding/PreviewPanel'
import StdinPanel from '../components/coding/StdinPanel'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useCodelabFrozenNotice } from '../hooks/useCodelabFrozenNotice'
import { useCodeRunner } from '../hooks/useCodeRunner'
import { useSeo } from '../hooks/useSeo'
import { JAVA_FILES, PYTHON_FILES, WEB_FILES, cloneFiles } from '../data/codelabDefaults'
import { getLanguage, mainFileName } from '../data/codingLanguages'
import { sourceFile, toCodePayload } from '../api/coding'
import { sessionOwnsCodelabData } from '../lib/codelab/accountData'
import { noteMissingInput } from '../lib/codelab/assistantTools'
import { trackCodelabEditor } from '../lib/codelab/idb.js'
import { findJavaMainClasses, javaClassFromFile, qualifiedJavaClass } from '../lib/codelab/javaProject'
import { loadSession, noteLiveEdit, saveSession } from '../lib/codelab/projectStore'
import { AGENT_SCREEN_KEY } from '../lib/codelab/storageKeys.js'

const AssistantPanel = lazy(() => import('../components/coding/AssistantPanel'))

// How long a web run waits for the preview's scripts to report errors.
const WEB_ERRORS_WAIT_MS = 800
const SAVE_WAIT_MS = 400
const NOTHING_TO_RUN = 'Nothing runs under Anything. Tell the user to pick Python, Web or Java at the top of the screen to run code.'
const LEAVE_RUNNING_TASK = 'The agent is still working here. Switching stops it, but you can undo what it changed when you come back. Switch anyway?'

// `general` has no project until the agent makes a file, and no runner.
const SPACES = [
  { id: 'general', label: 'Anything', starter: [] },
  { id: 'python', label: 'Python', starter: PYTHON_FILES },
  { id: 'web', label: 'Web', starter: WEB_FILES },
  { id: 'java', label: 'Java', starter: JAVA_FILES },
]
const spaceOf = (id) => SPACES.find((space) => space.id === id) ?? SPACES[0]

// A stored session checked and filled in. Each space keeps its own files and chat.
function readSaved(saved) {
  const language = spaceOf(saved?.language).id
  const projects = {}
  for (const { id, starter } of SPACES) {
    const project = saved?.projects?.[id]
    const files = Array.isArray(project?.files) ? cloneFiles(project.files, starter) : cloneFiles(starter, starter)
    projects[id] = {
      files,
      selectedFile: files.some((file) => file.name === project?.selectedFile) ? project.selectedFile : files[0]?.name,
      stdin: typeof project?.stdin === 'string' ? project.stdin : '',
      mainClass: typeof project?.mainClass === 'string' ? project.mainClass : '',
    }
  }
  return { language, projects, edited: Boolean(saved?.edited) }
}

export default function AgentScreen() {
  useSeo({
    title: 'WebNest AI Agent',
    description: 'A separate full-screen AI agent with voice for WebNest Prime Members.',
    path: '/ai-agent',
    // A members' tool, not an article.
    noindex: true,
  })

  const [saved, setSaved] = useState(undefined)
  const { initializing } = useAuth()
  const waitForLogin = initializing && !sessionOwnsCodelabData()

  // Counted as an open CodeLab page from the start, so a logout freezes and reloads this tab.
  useEffect(() => trackCodelabEditor(), [])
  useEffect(() => {
    if (waitForLogin) return undefined
    let cancelled = false
    loadSession(AGENT_SCREEN_KEY)
      .then((value) => { if (!cancelled) setSaved(readSaved(value)) })
      .catch(() => { if (!cancelled) setSaved(readSaved(null)) })
    return () => { cancelled = true }
  }, [waitForLogin])

  if (saved === undefined) {
    return <div className="mx-auto w-full max-w-7xl px-6 py-8"><Skeleton className="h-[60dvh] w-full" /></div>
  }
  return <AgentWorkspace saved={saved} />
}

function AgentWorkspace({ saved }) {
  const runner = useCodeRunner()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  useCodelabFrozenNotice()
  const [language, setLanguage] = useState(saved.language)
  const [projects, setProjects] = useState(saved.projects)
  const [edited, setEdited] = useState(saved.edited)
  const [locked, setLocked] = useState(false)
  const [view, setView] = useState('chat') // On small screens: chat or project.
  const [paneTab, setPaneTab] = useState('code')
  // Which space the runner's last result belongs to.
  const [ranIn, setRanIn] = useState(null)
  const [previewConsole, setPreviewConsole] = useState('')
  const webErrors = useRef([])

  const { files, selectedFile, stdin, mainClass } = projects[language]
  const activeFile = files.find((file) => file.name === selectedFile)
  const runnable = language !== 'general'
  const takesInput = language === 'python' || language === 'java'
  const hasProject = runnable || files.length > 0
  const lang = runnable ? getLanguage(language) : null
  const result = ranIn === language ? runner.result : null
  const runError = ranIn === language ? runner.error : null

  // The open file, stdin and main class are settings: not changed code, so not `edited`.
  const updateProject = useCallback((change) => {
    setProjects((current) => ({ ...current, [language]: { ...current[language], ...change } }))
  }, [language])
  const onFilesChange = useCallback((next) => {
    setEdited(true)
    setProjects((current) => {
      const project = current[language]
      const stillOpen = next.some((file) => file.name === project.selectedFile)
      return { ...current, [language]: { ...project, files: next, selectedFile: stillOpen ? project.selectedFile : next[0]?.name } }
    })
  }, [language])
  const onOpenFile = useCallback((name) => {
    updateProject({ selectedFile: name })
    setPaneTab('code')
  }, [updateProject])
  // Pressed in the chat. The agent's own edits don't come here, so they don't pull a phone
  // away from the chat, where its approvals appear.
  const onShowFile = useCallback((name) => {
    onOpenFile(name)
    setView('project')
  }, [onOpenFile])
  const onApproval = useCallback(() => setView('chat'), [])

  // The panel is remounted per space. The plan is the same in all of them, and each space
  // keeps what its last task can undo.
  const panelMemory = useRef({ plan: null, undo: {} })
  const onRemember = useCallback(({ usage, planChecked, undoLog }) => {
    panelMemory.current.plan = { usage, planChecked }
    panelMemory.current.undo[language] = undoLog
  }, [language])
  const agentBusy = useRef(false)
  const onBusyChange = useCallback((busy) => { agentBusy.current = busy }, [])

  // Saves shortly after each change, and right away when the page is hidden or closed.
  // A failed save is reported once; the screen keeps working in memory.
  const pendingSave = useRef(null)
  const warnedSave = useRef(false)
  const flushSave = useCallback((now = false) => {
    const pending = pendingSave.current
    if (!pending) return
    pendingSave.current = null
    saveSession(AGENT_SCREEN_KEY, pending, { now }).then((ok) => {
      if (ok || warnedSave.current) return
      warnedSave.current = true
      toast.error('Could not save this project in your browser. Free up site storage or download your files.')
    })
  }, [toast])
  useEffect(() => {
    pendingSave.current = { language, projects, edited }
    const timer = setTimeout(() => flushSave(), SAVE_WAIT_MS)
    return () => clearTimeout(timer)
  }, [language, projects, edited, flushSave])
  useEffect(() => {
    const onHide = () => flushSave(true)
    const onVisibility = () => { if (document.visibilityState === 'hidden') onHide() }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVisibility)
      flushSave()
    }
  }, [flushSave])
  // Logout asks before deleting changed code, also before the debounced save lands.
  useEffect(() => {
    noteLiveEdit(AGENT_SCREEN_KEY, edited)
    return () => noteLiveEdit(AGENT_SCREEN_KEY, false)
  }, [edited])

  const withWebErrors = (run) => (run && webErrors.current.length ? { ...run, status: 'runtime_error', stderr: webErrors.current.join('\n') } : run)
  const lastResult = () => withWebErrors(result ?? (runError ? { status: 'internal_error', error: runError } : null))

  // The class the user picked, else the open file's, else the first with a main method.
  const pickMain = (mains) => {
    if (mains.includes(mainClass)) return mainClass
    const open = javaClassFromFile(selectedFile)
    return mains.includes(open) ? open : mains[0]
  }
  const javaMains = useMemo(() => (language === 'java' ? findJavaMainClasses(files) : []), [language, files])

  // The agent's edits are newer than this render's `files`, so it passes the files to run.
  const runProject = async (latest = files) => {
    if (!runnable) return { status: 'internal_error', error: NOTHING_TO_RUN }
    const active = sourceFile(latest, selectedFile) ?? sourceFile(latest)
    const extra = { stdin }
    if (language === 'java') extra.className = qualifiedJavaClass(latest, pickMain(findJavaMainClasses(latest)) ?? 'Main')
    webErrors.current = []
    setPreviewConsole('')
    setRanIn(language)
    setPaneTab('output')
    const { result: finished, error } = await runner.run({
      language,
      ...toCodePayload({ source: active?.content ?? '', sourceName: active?.name, fileName: mainFileName(lang), files: latest, extra }),
    })
    if (language === 'web' && finished) await new Promise((resolve) => { setTimeout(resolve, WEB_ERRORS_WAIT_MS) })
    return noteMissingInput(withWebErrors(finished)) ?? { status: 'stopped', error: error ?? 'The run was stopped.' }
  }

  const onConsole = ({ type, text }) => {
    if (type === 'error') webErrors.current.push(text)
    setPreviewConsole((prev) => `${prev}${prev ? '\n' : ''}[${type}] ${text}`.slice(0, 64000))
  }

  const chooseSpace = (next) => {
    if (next === language) return
    if (agentBusy.current && !window.confirm(LEAVE_RUNNING_TASK)) return
    runner.cancel?.()
    setRanIn(null)
    webErrors.current = []
    setPreviewConsole('')
    setPaneTab('code')
    setLanguage(next)
  }

  const showPane = isAuthenticated && hasProject && !locked

  return (
    <section aria-label="WebNest AI Agent" className="flex h-[calc(100dvh-var(--nav-h))] min-h-[520px] flex-col bg-ink-50 dark:bg-ink-950">
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-ink-200 bg-white px-3 py-2 dark:border-ink-800 dark:bg-ink-950 sm:px-4">
        <h1 className="font-display text-base font-bold text-ink-900 dark:text-white">AI Agent</h1>
        <div role="radiogroup" aria-label="What to work on" className="inline-flex rounded-lg bg-ink-100 p-0.5 dark:bg-ink-800">
          {SPACES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={language === id}
              onClick={() => chooseSpace(id)}
              className={`h-7 rounded-md px-2.5 text-xs font-semibold transition-colors ${language === id ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-950 dark:text-white' : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <Link to="/codelab/playground" className="ml-auto hidden text-xs font-medium text-ink-500 hover:text-gold-600 dark:text-ink-400 dark:hover:text-gold-300 sm:inline">FastAPI projects: open the Playground</Link>
        {showPane && (
          <div role="tablist" aria-label="Show" className="ml-auto inline-flex rounded-lg bg-ink-100 p-0.5 dark:bg-ink-800 lg:hidden">
            {[['chat', 'Chat', FiMessageSquare], ['project', 'Project', FiCode]].map(([id, label, Icon]) => (
              <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => setView(id)} className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold ${view === id ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-950 dark:text-white' : 'text-ink-500 dark:text-ink-400'}`}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <div className={`min-h-0 min-w-0 flex-1 ${showPane ? `${view === 'chat' ? '' : 'hidden'} lg:block lg:max-w-[46%] lg:border-r lg:border-ink-200 lg:dark:border-ink-800` : 'mx-auto max-w-4xl'}`}>
          <ErrorBoundary>
            <Suspense fallback={<div className="grid h-full place-items-center text-xs text-ink-400">Loading WebNest AI…</div>}>
              {/* Keyed: a pending approval or undo must not carry over to another space. */}
              <AssistantPanel
                key={language}
                agentOnly
                voice
                workspaceKey={`ai-agent:${language}`}
                language={language}
                files={files}
                selectedFile={selectedFile}
                lastResult={lastResult}
                onFilesChange={onFilesChange}
                runProject={runProject}
                onOpenFile={onOpenFile}
                onLockedChange={setLocked}
                onBusyChange={onBusyChange}
                onApproval={onApproval}
                onShowFile={onShowFile}
                remembered={{ ...panelMemory.current.plan, undoLog: panelMemory.current.undo[language] }}
                onRemember={onRemember}
              />
            </Suspense>
          </ErrorBoundary>
        </div>

        {showPane && (
          <div className={`min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-ink-950 ${view === 'project' ? 'flex' : 'hidden'} lg:flex`}>
            <div className="flex shrink-0 items-center gap-1 border-b border-ink-200 px-2 py-1.5 dark:border-ink-800">
              <div role="tablist" aria-label="Project view" className="flex gap-1">
                {[['code', 'Code', FiCode], ['output', language === 'web' ? 'Preview' : 'Output', FiTerminal]].map(([id, label, Icon]) => (
                  <button key={id} type="button" role="tab" aria-selected={paneTab === id} onClick={() => setPaneTab(id)} className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold ${paneTab === id ? 'bg-ink-900 text-white dark:bg-gold-400 dark:text-ink-950' : 'text-ink-500 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white'}`}>
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
              </div>
              {javaMains.length > 1 && (
                <select
                  value={pickMain(javaMains)}
                  disabled={runner.running}
                  onChange={(event) => updateProject({ mainClass: event.target.value })}
                  aria-label="Main class to run"
                  title="Main class to run"
                  className="ml-auto h-7 min-w-0 max-w-[40%] rounded-md border border-ink-200 bg-white px-1.5 text-xs font-medium text-ink-600 disabled:opacity-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300"
                >
                  {javaMains.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              )}
              {runnable && (
                runner.running ? (
                  <button type="button" onClick={() => runner.cancel?.()} className={`${javaMains.length > 1 ? '' : 'ml-auto'} inline-flex h-7 items-center gap-1.5 rounded-md bg-red-500 px-2.5 text-xs font-semibold text-white hover:bg-red-600`}>
                    <FiSquare className="h-3 w-3" /> Stop
                  </button>
                ) : (
                  <button type="button" onClick={() => runProject()} className={`${javaMains.length > 1 ? '' : 'ml-auto'} inline-flex h-7 items-center gap-1.5 rounded-md bg-ink-900 px-2.5 text-xs font-semibold text-white hover:bg-ink-700 dark:bg-gold-400 dark:text-ink-950 dark:hover:bg-gold-300`}>
                    <FiPlay className="h-3 w-3" /> Run
                  </button>
                )
              )}
            </div>

            <div className={paneTab === 'code' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
              <ErrorBoundary>
                <FileTabs files={files} selectedFile={selectedFile} onSelectFile={onOpenFile} />
              </ErrorBoundary>
              <ErrorBoundary>
                <CodeEditor
                  value={activeFile?.content ?? ''}
                  onChange={(value) => { if (activeFile) onFilesChange(files.map((file) => (file.name === activeFile.name ? { ...file, content: value } : file))) }}
                  language={activeFile?.language ?? lang?.monacoId ?? 'plaintext'}
                  path={`ai-agent/${language}/${activeFile?.name ?? 'file'}`}
                  frameless
                  className="min-h-0 flex-1"
                />
              </ErrorBoundary>
            </div>

            <div className={paneTab === 'output' ? 'flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2' : 'hidden'}>
              {language === 'web' && (
                <ErrorBoundary>
                  <PreviewPanel previewHtml={result?.previewHtml} onConsole={onConsole} className="min-h-[50%] flex-1" />
                </ErrorBoundary>
              )}
              <ErrorBoundary>
                <StdinPanel value={stdin} onChange={(value) => updateProject({ stdin: value })} open={takesInput} />
              </ErrorBoundary>
              <ErrorBoundary>
                <OutputPanel running={ranIn === language && runner.running} runningSince={runner.runningSince} runningHint={runner.runningHint} stopped={ranIn === language && runner.stopped} result={result} error={runError} />
              </ErrorBoundary>
              {previewConsole && <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-ink-950 p-2 font-mono text-[11px] text-ink-100">{previewConsole}</pre>}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
