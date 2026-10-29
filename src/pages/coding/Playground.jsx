import { Link } from 'react-router-dom'
import { lessonWorkspace } from '../../lib/lessonPlayground'
import { trackEvent } from '../../lib/analytics'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useCodeRunner } from '../../hooks/useCodeRunner'
import CodingWorkspace from '../../components/coding/CodingWorkspace'
import { LANGUAGES, getLanguage, mainFileName } from '../../data/codingLanguages'
import { WEB_FILES, PYTHON_FILES, JAVA_FILES, cloneFiles, SAMPLE_LESSONS } from '../../data/codelabDefaults'
import { BACKEND_STARTER_INFO, DEFAULT_BACKEND_STARTER, backendStarterFiles } from '../../data/backendStarters'
import { copyWorkspaceDatabase } from '../../hooks/useApiRuntime'
import { forgetWorkspace, sessionOwnsCodelabData } from '../../lib/codelab/accountData'
import { createProject, createShare, sourceFile, toCodePayload } from '../../api/coding'
import { getErrorDetail } from '../../lib/apiClient'
import { isValidLink } from '../../lib/github/sync'
import GitHubSync from '../../components/coding/GitHubSync'
import ErrorBoundary from '../../components/ErrorBoundary'
import { Skeleton } from '../../components/states/Skeleton'
import { loadSession, noteLiveEdit, saveSession } from '../../lib/codelab/projectStore'
import { saveEnvFile } from '../../lib/codelab/envStore'
import { trackCodelabEditor } from '../../lib/codelab/idb.js'
import { PLAYGROUND_KEY, databaseKey, newDbId, projectWorkspaceKey } from '../../lib/codelab/storageKeys.js'
import { saveDatabase } from '../../lib/codelab/dbStore'



function defaultFiles(language) {
  if (language === 'backend') return backendStarterFiles(DEFAULT_BACKEND_STARTER)
  if (language === 'web') return WEB_FILES
  if (language === 'java') return JAVA_FILES
  return PYTHON_FILES
}

// A FastAPI lesson brings only app/main.py; add the database file, schema.sql, the
// frontend and the terminal's requirements.txt and package.json from the blank starter so
// the rest of the workspace works around it.
const STARTER_EXTRAS = new Set(['schema.sql', 'app/database.py', 'requirements.txt', 'package.json'])

function withBackendStarter(template) {
  if (template?.language !== 'backend') return template
  if (!template.files.length) return { ...template, files: backendStarterFiles(template.starter || 'blank') }
  const own = new Set(template.files.map((file) => file.name))
  const extras = backendStarterFiles(template.starter || 'blank')
    .filter((file) => !own.has(file.name) && (STARTER_EXTRAS.has(file.name) || file.name.startsWith('frontend/')))
  return { ...template, files: [...template.files, ...extras] }
}

function firstFile(language, files) {
  if (language === 'backend') return files.find((file) => file.name === 'app/main.py')?.name ?? files[0]?.name
  return files[0]?.name
}

// A stored session (see lib/codelab/projectStore.js) checked and filled in, or null.
function parseSession(parsed) {
  try {
    if (parsed && typeof parsed.language === 'string') {
      const language = parsed.language === 'javascript' ? 'web' : parsed.language
      if (!LANGUAGES.some((item) => item.id === language)) return null
      const fallback = defaultFiles(language)
      return {
        language,
        source: parsed.source ?? '',
        files: cloneFiles(parsed.files, parsed.source && language === 'java' ? [{ ...JAVA_FILES[0], content: parsed.source }] : fallback),
        selectedFile: parsed.selectedFile,
        stdin: parsed.stdin ?? '',
        dbId: typeof parsed.dbId === 'string' ? parsed.dbId : 'main',
        github: isValidLink(parsed.github) ? parsed.github : null,
        // Whether the learner changed the code; sessions saved before this flag count as
        // changed. Logout asks before deleting changed ones (lib/codelab/accountData.js).
        edited: parsed.edited !== false,
      }
    }
  } catch {
    return null
  }
  return null
}

export default function Playground() {
  useSeo({
    title: 'Java, Python and Web Coding Playground',
    description:
      'Write and run HTML, CSS, JavaScript and Python in the browser with Webnest CodeLab.',
    path: '/codelab/playground',
    // A tool, not an article: kept out of search until it has real written content.
    noindex: true,
  })
  const location = useLocation()
  return <PlaygroundLoader key={location.search} />
}

// Reads the saved session (IndexedDB is async) before the editor mounts, so the editor
// starts from it instead of flashing the defaults.
function PlaygroundLoader() {
  const location = useLocation()
  const templateId = new URLSearchParams(location.search).get('lesson')
  // "example" is an example index, or "exercise" / "scratch" for the lesson's other workspaces.
  const exampleKey = new URLSearchParams(location.search).get('example') || '0'
  const templateLesson = SAMPLE_LESSONS[templateId]
  const template = useMemo(() => withBackendStarter(lessonWorkspace(templateLesson, exampleKey)), [templateLesson, exampleKey])
  const storageKey = template ? `${PLAYGROUND_KEY}:lesson:${template.lessonId}:${exampleKey}` : PLAYGROUND_KEY
  const [stored, setStored] = useState(undefined)

  // Counted as an open CodeLab page from the start, while the session is still loading, so
  // a logout meanwhile freezes and reloads this tab (lib/codelab/accountData.js).
  useEffect(() => trackCodelabEditor(), [])

  // While the login check runs it may clear another account's data (claimCodelabData),
  // which must not be read meanwhile. Only waited for when the stored data may not be this
  // session's; normally (its own data) the playground opens at once.
  const { initializing } = useAuth()
  const waitForLogin = initializing && !sessionOwnsCodelabData()
  useEffect(() => {
    if (waitForLogin) return undefined
    let cancelled = false
    loadSession(storageKey).then((value) => { if (!cancelled) setStored(parseSession(value)) })
    return () => { cancelled = true }
  }, [storageKey, waitForLogin])

  if (stored === undefined) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <Skeleton className="h-[60dvh] w-full" />
      </div>
    )
  }
  return (
    <PlaygroundEditor
      session={stored || template}
      template={template}
      templateLesson={templateLesson}
      exampleKey={exampleKey}
      storageKey={storageKey}
    />
  )
}

function PlaygroundEditor({ session, template, templateLesson, exampleKey, storageKey }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const runner = useCodeRunner()

  const [language, setLanguage] = useState(session?.language ?? 'web')
  const [files, setFiles] = useState(session?.files ?? cloneFiles(WEB_FILES, WEB_FILES))
  const [selectedFile, setSelectedFile] = useState(session?.selectedFile ?? files[0]?.name ?? 'index.html')
  const [source, setSource] = useState(session?.source ?? getLanguage(session?.language ?? 'web').defaultSnippet)
  const [stdin, setStdin] = useState(session?.stdin ?? '')
  // Each backend project has its own database; loading a starter starts a new one.
  const [dbId, setDbId] = useState(session?.dbId ?? 'main')
  const [starter, setStarter] = useState(DEFAULT_BACKEND_STARTER)
  // The GitHub repo this project is linked to (see lib/github/sync.js), or null.
  const [githubLink, setGithubLink] = useState(session?.github ?? null)
  const workspaceKey = `${storageKey}:${dbId}`
  const [touched, setTouched] = useState(Boolean(session))
  // A lesson template or starter counts as unchanged until the learner edits it.
  const [edited, setEdited] = useState(Boolean(session?.edited))
  // Counts changes, so Save project can tell whether the learner typed while it ran.
  const changeCount = useRef(0)
  const markChanged = useCallback(() => {
    changeCount.current += 1
    setTouched(true)
    setEdited(true)
  }, [])
  // Logout asks before deleting changed code, also before the debounced save below lands.
  useEffect(() => {
    noteLiveEdit(storageKey, edited)
    return () => noteLiveEdit(storageKey, false)
  }, [storageKey, edited])
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)

  // Saves shortly after each change, and right away when the page is hidden or the editor
  // unmounts, so the last edit is not lost. A failed save is reported once; the editor
  // keeps working in memory.
  const pendingSave = useRef(null)
  const warnedSave = useRef(false)
  const flushSave = useCallback((now = false) => {
    const pending = pendingSave.current
    if (!pending) return
    pendingSave.current = null
    saveSession(pending.key, pending.value, { now }).then((ok) => {
      if (ok || warnedSave.current) return
      warnedSave.current = true
      toast.error('Could not save this project in your browser. Free up site storage or download your files.')
    })
  }, [toast])

  useEffect(() => {
    pendingSave.current = { key: storageKey, value: { language, source, files, selectedFile, stdin, dbId, github: githubLink, edited } }
    const timer = setTimeout(() => flushSave(), 400)
    return () => clearTimeout(timer)
  }, [language, source, files, selectedFile, stdin, dbId, githubLink, edited, storageKey, flushSave])

  useEffect(() => {
    // Mobile browsers often never fire pagehide when a tab is closed; hidden is the last
    // reliable moment.
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

  useEffect(() => {
    trackEvent('codelab_opened', { source: template ? 'lesson' : 'playground', ...(template ? { lesson_id: template.lessonId } : {}) })
  }, [template])

  const handleLanguageChange = useCallback(
    (next) => {
      setLanguage(next)
      if (!touched) {
        const snippet = getLanguage(next).defaultSnippet
        if (snippet != null) setSource(snippet)
      }
      const defaults = defaultFiles(next)
      const nextFiles = cloneFiles(defaults, defaults)
      setFiles(nextFiles)
      setSelectedFile(firstFile(next, nextFiles) ?? 'main.py')
      // The files are the new language's defaults now: nothing of the learner's to lose.
      setEdited(false)
      // New default files are a different project; keeping the link would make the next
      // push delete the repo's files.
      setGithubLink(null)
      if (next === 'backend') {
        // A fresh backend project gets a fresh database; drop the one it replaces, with its
        // API tester token and breakpoints.
        forgetWorkspace(workspaceKey)
        setDbId(newDbId())
      }
    },
    [touched, workspaceKey],
  )

  const loadStarter = useCallback(() => {
    if (touched && !window.confirm('Replace your current files and database with this starter project?')) return
    forgetWorkspace(workspaceKey)
    const nextFiles = backendStarterFiles(starter)
    setFiles(nextFiles)
    setSelectedFile(firstFile('backend', nextFiles))
    setDbId(newDbId())
    setTouched(false)
    setEdited(false)
    setGithubLink(null)
  }, [touched, workspaceKey, starter])

  // Files coming from GitHub. An import replaces the project (and its database, for a
  // backend); a pull updates files in place and keeps the database.
  const applyGitHubFiles = useCallback(({ files: nextFiles, language: nextLanguage, link, kind }) => {
    const cloned = cloneFiles(nextFiles, nextFiles)
    if (kind === 'import') {
      const mode = nextLanguage ?? language
      if (mode === 'backend' || language === 'backend') forgetWorkspace(workspaceKey)
      setLanguage(mode)
      setFiles(cloned)
      setSelectedFile(firstFile(mode, cloned) ?? cloned[0]?.name)
      setDbId(newDbId())
      setTouched(false)
      // Imported code is on GitHub, so it is not lost with this browser's copy.
      setEdited(false)
    } else {
      setFiles(cloned)
      setSelectedFile((current) => (cloned.some((file) => file.name === current) ? current : firstFile(language, cloned) ?? cloned[0]?.name))
      // Pulled code is on GitHub; `edited` stays as it was (earlier changes still count).
      setTouched(true)
    }
    setGithubLink(link ?? null)
  }, [language, workspaceKey])

  const handleSourceChange = useCallback((value) => {
    markChanged()
    setSource(value)
  }, [markChanged])

  const handleFileChange = useCallback((fileName, value) => {
    markChanged()
    setFiles((items) => items.map((file) => (file.name === fileName ? { ...file, content: value } : file)))
  }, [markChanged])

  const handleFilesChange = useCallback((nextFiles) => {
    markChanged()
    setFiles(nextFiles)
  }, [markChanged])

  const requireLogin = useCallback(
    (message) => {
      toast.info(message)
      navigate('/login', { state: { from: location } })
    },
    [toast, navigate, location],
  )

  const currentLang = useCallback(() => getLanguage(language), [language])

  // `databaseSnapshot`: takes the running database, from the backend IDE's Save
  // (CodingWorkspace.jsx); called only once logged in. Without it (the run bar passes its
  // click event) the stored copy is used.
  const handleSave = useCallback(async ({ databaseSnapshot } = {}) => {
    if (!isAuthenticated) {
      requireLogin('Log in to save your CodeLab project.')
      return
    }
    setSaving(true)
    const changesAtStart = changeCount.current
    try {
      const databaseBytes = typeof databaseSnapshot === 'function' ? await databaseSnapshot() : undefined
      const lang = currentLang()
      const active = sourceFile(files, selectedFile)
      const project = await createProject({
        title: language === 'backend' ? 'Untitled FastAPI project' : 'Untitled CodeLab project',
        language,
        ...toCodePayload({
          source: active ? active.content : source,
          sourceName: active?.name,
          fileName: mainFileName(lang),
          files,
          extra: { stdin },
        }),
      })
      if (language === 'backend') {
        // The project on the server has neither; both stay in this browser.
        if (databaseBytes instanceof Uint8Array) await saveDatabase(databaseKey(projectWorkspaceKey(project.id)), databaseBytes)
        else await copyWorkspaceDatabase(workspaceKey, projectWorkspaceKey(project.id))
        saveEnvFile(projectWorkspaceKey(project.id), files)
      }
      // The code is in the account now, so logout need not warn about it, unless the
      // learner kept typing while this ran: those changes are not in the project. Queued
      // directly, as the editor unmounts on navigate before an effect would queue it.
      if (changeCount.current === changesAtStart) {
        setEdited(false)
        pendingSave.current = { key: storageKey, value: { language, source, files, selectedFile, stdin, dbId, github: githubLink, edited: false } }
      }
      toast.success('CodeLab project created.')
      navigate(`/projects/${project.id}`)
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not save your CodeLab project.'))
    } finally {
      setSaving(false)
    }
  }, [isAuthenticated, requireLogin, currentLang, language, source, files, selectedFile, stdin, workspaceKey, storageKey, dbId, githubLink, toast, navigate])
  const handleShare = useCallback(async () => {
    if (!isAuthenticated) {
      requireLogin('Log in to share your CodeLab work.')
      return
    }
    setSharing(true)
    try {
      const lang = currentLang()
      const active = sourceFile(files, selectedFile)
      const { url } = await createShare({
        language,
        ...toCodePayload({
          source: active ? active.content : source,
          sourceName: active?.name,
          fileName: mainFileName(lang),
          files,
          extra: { stdin, stdout: runner.result?.stdout },
        }),
      })
      const fullUrl = `${window.location.origin}${url}`
      try {
        await navigator.clipboard.writeText(fullUrl)
      } catch {
        /* Clipboard can be blocked; sharing still succeeded. */
      }
      toast.success('Share link copied to clipboard.')
    } catch (err) {
      toast.error(getErrorDetail(err, 'Could not create a share link.'))
    } finally {
      setSharing(false)
    }
  }, [isAuthenticated, requireLogin, currentLang, language, source, files, selectedFile, stdin, runner.result, toast])

  return (
    <>
    {templateLesson && (
      <p className="mx-auto max-w-7xl px-6 pt-6 text-sm">
        <Link className="underline" to={`/learn/lessons/${templateLesson.id}`}>Back to {templateLesson.title}</Link>
        {' - '}
        {exampleKey === 'scratch'
          ? `Your own practice space for this topic. ${template?.note || ''} Your code is kept in this browser.`
          : exampleKey === 'exercise'
            ? 'Exercise starter code loaded. Complete the TODOs, run it, and compare with the expected output in the lesson.'
            : 'Example loaded for practice. Some snippets need input, additional markup or dependencies; edit before running.'}
      </p>
    )}
    <CodingWorkspace
      eyebrow="Webnest CodeLab"
      title="Browser coding playground"
      subtitle="Run web projects and Python in your browser, build multi-class Java 17 programs, or write a layered FastAPI backend with a SQLite database."
      headerRight={(
        // In Backend mode these sit in the IDE's one-line toolbar, so they must not wrap.
        <div className={`flex items-center gap-2 ${language === 'backend' ? 'flex-nowrap' : 'flex-wrap'}`}>
          <ErrorBoundary fallback={(retry) => (
            <button type="button" onClick={retry} className="rounded-lg border border-red-400/50 px-3 py-2 text-xs font-semibold text-red-600">GitHub unavailable · retry</button>
          )}>
            <GitHubSync
              files={files}
              language={language}
              link={githubLink}
              onLinkChange={setGithubLink}
              onApplyFiles={applyGitHubFiles}
              touched={touched}
            />
          </ErrorBoundary>
          {language === 'backend' && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="backend-starter" className="text-xs font-semibold text-ink-500 dark:text-ink-300">Starter</label>
          <select
            id="backend-starter"
            value={starter}
            onChange={(event) => setStarter(event.target.value)}
            title={BACKEND_STARTER_INFO.find((item) => item.id === starter)?.description}
            className="rounded-lg border border-ink-200 bg-white px-2 py-2 text-xs dark:border-ink-700 dark:bg-ink-900"
          >
            {BACKEND_STARTER_INFO.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <button type="button" onClick={loadStarter} className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 hover:border-gold-400 hover:text-gold-600 dark:border-ink-700 dark:text-ink-200">
            Load starter
          </button>
        </div>
          )}
        </div>
      )}
      workspaceKey={workspaceKey}
      backendStorageNote="Your files and database are kept in this browser. Save project to keep the files in your account."
      languages={LANGUAGES}
      language={language}
      onLanguageChange={handleLanguageChange}
      source={source}
      onSourceChange={handleSourceChange}
      files={files}
      selectedFile={selectedFile}
      onSelectFile={setSelectedFile}
      onFileChange={handleFileChange}
      onFilesChange={handleFilesChange}
      stdin={stdin}
      onStdinChange={setStdin}
      runner={runner}
      onSave={handleSave}
      saving={saving}
      saveLabel="Save project"
      onShare={handleShare}
      sharing={sharing}
    />
    </>
  )
}
