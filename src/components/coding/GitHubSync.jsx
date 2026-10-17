import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiAlertTriangle, FiArrowDownCircle, FiArrowUpCircle, FiExternalLink, FiGithub, FiLoader, FiX } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import ErrorBoundary from '../ErrorBoundary'
import { github, safeReturnTo, usingGitHubMock } from '../../lib/github'
import { ERROR_KIND, GitHubLocalError, describeGitHubError } from '../../lib/github/errors'
import {
  MODES, buildCommitChanges, changedFiles, emptyLink, filesForMode, guessMode, isValidLink, linkAfterCommit, linkFromSnapshot, planPull, pushRisks, resolvePull,
} from '../../lib/github/sync'

// GitHub connection for the playground: connect, import a repo, push and pull. All server
// calls go through lib/github (real backend or dev mock); every failure is turned into an
// inline message by handleError. See GITHUB_INTEGRATION_FRONTEND.md.

const MODE_LABEL = { backend: 'Python Backend (FastAPI)', web: 'Web (HTML/CSS/JS)', python: 'Python', java: 'Java' }
const BTN = 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50'
const PRIMARY = `${BTN} bg-ink-900 text-white hover:bg-ink-700 dark:bg-gold-400 dark:text-ink-950 dark:hover:bg-gold-300`
const SECONDARY = `${BTN} border border-ink-200 text-ink-700 hover:border-gold-400 hover:text-gold-600 dark:border-ink-700 dark:text-ink-200`
const INPUT = 'w-full rounded-lg border border-ink-200 bg-transparent px-3 py-2 text-sm focus:border-gold-400 focus:outline-none dark:border-ink-700'

export default function GitHubSync({ files = [], language, link, onLinkChange, onApplyFiles, touched = false }) {
  const { isAuthenticated, initializing } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [conn, setConn] = useState({ status: 'unknown', data: null })
  const [changes, setChanges] = useState(null)
  const linked = isValidLink(link)
  const mountedRef = useRef(true)
  const connRequestRef = useRef(0)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const loadConnection = useCallback(async () => {
    // Only the latest request may set the state, so a slow answer for a user who has
    // since logged out is dropped.
    const id = ++connRequestRef.current
    if (!isAuthenticated) {
      // Logged out (or not yet restored): forget the previous user's GitHub account.
      setConn({ status: 'unknown', data: null })
      setOpen(false)
      return
    }
    setConn((current) => ({ ...current, status: 'loading' }))
    try {
      const data = await github.getConnection()
      if (mountedRef.current && id === connRequestRef.current) setConn({ status: data.connected ? 'connected' : 'disconnected', data })
    } catch (err) {
      const info = describeGitHubError(err)
      if (!mountedRef.current || id !== connRequestRef.current) return
      // Quiet on load: the button shows the state, the modal explains it when opened.
      setConn({ status: info.kind === ERROR_KIND.NOT_DEPLOYED ? 'unavailable' : 'error', data: null, error: info })
    }
  }, [isAuthenticated])

  useEffect(() => { loadConnection() }, [loadConnection])

  // Badge with the number of files changed since the last sync.
  useEffect(() => {
    if (!linked) {
      setChanges(null)
      return undefined
    }
    let cancelled = false
    const timer = setTimeout(() => {
      changedFiles(files, link)
        .then((result) => { if (!cancelled) setChanges(result) })
        .catch(() => { if (!cancelled) setChanges(null) })
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [files, link, linked])

  const changeCount = changes ? changes.upserts.length + changes.deletes.length : 0

  const openPanel = () => {
    if (initializing) {
      toast.info('Checking your WebNest login… try again in a moment.')
      return
    }
    if (!isAuthenticated) {
      toast.info('Log in to WebNest to connect GitHub.')
      navigate('/login', { state: { from: location } })
      return
    }
    setOpen(true)
    if (conn.status !== 'connected') loadConnection()
  }

  return (
    <>
      <button type="button" onClick={openPanel} className={`${SECONDARY} relative`} title={linked ? `Linked to ${link.owner}/${link.repo}` : 'Connect GitHub'}>
        {conn.status === 'connected' && conn.data?.avatar_url
          ? <img src={conn.data.avatar_url} alt="" className="h-4 w-4 rounded-full" referrerPolicy="no-referrer" />
          : <FiGithub className="h-4 w-4" />}
        <span className="max-w-[10rem] truncate">{linked ? `${link.owner}/${link.repo}` : 'GitHub'}</span>
        {changeCount > 0 && (
          <span className="rounded-full bg-gold-500 px-1.5 text-[10px] font-bold text-ink-950" aria-label={`${changeCount} changed files`}>{changeCount}</span>
        )}
      </button>
      {open && createPortal(
        <Overlay onClose={close}>
          <ErrorBoundary fallback={(retry) => <PanelCrashed onRetry={retry} onClose={close} />}>
            <GitHubPanel
              conn={conn}
              setConn={setConn}
              reloadConnection={loadConnection}
              files={files}
              language={language}
              link={linked ? link : null}
              changes={changes}
              touched={touched}
              onLinkChange={onLinkChange}
              onApplyFiles={onApplyFiles}
              onClose={close}
            />
          </ErrorBoundary>
        </Overlay>,
        document.body,
      )}
    </>
  )
}

function Overlay({ onClose, children }) {
  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[120] flex items-stretch justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="GitHub"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-full w-full flex-col overflow-y-auto bg-white p-5 dark:bg-ink-900 sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl sm:border sm:border-ink-200 sm:dark:border-ink-800"
      >
        {children}
      </div>
    </div>
  )
}

function PanelCrashed({ onRetry, onClose }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 p-6 text-center">
      <FiAlertTriangle className="h-8 w-8 text-red-500" />
      <p className="text-sm font-semibold text-ink-900 dark:text-white">The GitHub panel ran into a problem. Your files are safe.</p>
      <div className="flex gap-2">
        <button type="button" onClick={onRetry} className={PRIMARY}>Try again</button>
        <button type="button" onClick={onClose} className={SECONDARY}>Close</button>
      </div>
    </div>
  )
}

function ErrorBanner({ error, actions }) {
  if (!error) return null
  return (
    <div role="alert" className="mt-3 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
      <p className="flex items-start gap-2"><FiAlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error.message}</p>
      {actions?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button key={action.label} type="button" onClick={action.onClick} disabled={action.disabled} className={SECONDARY}>{action.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}

function GitHubPanel({ conn, setConn, reloadConnection, files, language, link, changes, touched, onLinkChange, onApplyFiles, onClose }) {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [view, setView] = useState('home')
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)
  const [pullPlan, setPullPlan] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // The single place errors are handled. Returns the description so forms can show
  // field errors next to their inputs.
  const handleError = useCallback((err) => {
    const info = describeGitHubError(err)
    if (!mountedRef.current) return info
    if (info.kind === ERROR_KIND.LOGIN) {
      toast.info(info.message)
      onClose()
      navigate('/login', { state: { from: location } })
      return info
    }
    if (info.kind === ERROR_KIND.CONNECT) {
      setConn({ status: 'disconnected', data: null })
      setView('home')
    }
    if (info.kind === ERROR_KIND.NOT_DEPLOYED) setConn({ status: 'unavailable', data: null })
    setError(info)
    return info
  }, [toast, onClose, navigate, location, setConn])

  // Runs one async action with a busy label; never throws.
  const run = useCallback(async (label, action) => {
    setBusy(label)
    setError(null)
    try {
      return await action()
    } catch (err) {
      handleError(err)
      return undefined
    } finally {
      if (mountedRef.current) setBusy(null)
    }
  }, [handleError])

  const connect = () => run('Opening GitHub…', async () => {
    const { authorize_url: url } = await github.startOAuth(safeReturnTo(`${location.pathname}${location.search}`))
    window.location.assign(url)
  })

  const disconnect = () => {
    if (!window.confirm('Disconnect your GitHub account from WebNest? Your files stay here and on GitHub.')) return
    run('Disconnecting…', async () => {
      await github.disconnect()
      setConn({ status: 'disconnected', data: null })
      toast.success('GitHub disconnected.')
    })
  }

  const unlink = () => {
    if (!window.confirm('Unlink this project from the repository? Nothing is deleted.')) return
    onLinkChange(null)
    setError(null)
    toast.info('Project unlinked from GitHub.')
  }

  const pull = () => run('Pulling from GitHub…', async () => {
    if (!MODES.includes(language)) throw new GitHubLocalError('Pull works for Backend, Web, Python and Java projects.')
    const snapshot = await github.getSnapshot(link.owner, link.repo, { branch: link.branch, mode: language })
    const plan = await planPull(snapshot, link, files, language)
    if (!mountedRef.current) return
    if (plan.conflicts.length) {
      setPullPlan(plan)
      setView('conflicts')
      return
    }
    applyPull(plan, 'mine')
  })

  const applyPull = (plan, choice) => {
    const result = resolvePull(plan, files, link, choice)
    const changed = plan.apply.length + plan.remove.length + (choice === 'theirs' ? plan.conflicts.length : 0)
    onApplyFiles({ files: result.files, link: result.link, kind: 'pull' })
    setPullPlan(null)
    setView('home')
    toast.success(changed ? `Pulled ${changed} file${changed === 1 ? '' : 's'} from GitHub.` : 'Already up to date with GitHub.')
    if (plan.unavailable.length) {
      toast.info(`${plan.unavailable.length} file(s) could not be read from GitHub (too large or over a limit) and were left as they are.`)
    }
    if (plan.limited.length) {
      toast.info(`${plan.limited.length} new file(s) on GitHub were not added: ${plan.limited[0].message}`)
    }
  }

  const unavailable = conn.status === 'unavailable'
  const connected = conn.status === 'connected'
  // An action's error, or else the error from loading the connection.
  const shownError = error ?? (conn.status === 'error' ? conn.error : null)

  const staleActions = shownError?.kind === ERROR_KIND.STALE && link ? [{ label: 'Pull now', onClick: pull, disabled: Boolean(busy) }] : []
  const notFoundActions = shownError?.kind === ERROR_KIND.NOT_FOUND && link ? [{ label: 'Unlink project', onClick: unlink }] : []
  const connectActions = shownError?.kind === ERROR_KIND.CONNECT ? [{ label: 'Connect GitHub', onClick: connect, disabled: Boolean(busy) }] : []
  const retryActions = [ERROR_KIND.NETWORK, ERROR_KIND.TIMEOUT, ERROR_KIND.UNAVAILABLE, ERROR_KIND.BAD_RESPONSE, ERROR_KIND.RATE_LIMITED].includes(shownError?.kind) && !connected
    ? [{ label: 'Retry', onClick: () => { setError(null); reloadConnection() }, disabled: Boolean(busy) }]
    : []

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white">
          <FiGithub className="h-5 w-5" /> GitHub {usingGitHubMock && <span className="rounded bg-amber-500/15 px-1.5 text-[10px] font-semibold text-amber-600">mock</span>}
        </h2>
        <button type="button" onClick={onClose} aria-label="Close" className="text-ink-400 hover:text-ink-600 dark:hover:text-ink-100"><FiX className="h-5 w-5" /></button>
      </div>

      {busy && <p className="mt-3 inline-flex items-center gap-2 text-xs text-ink-500 dark:text-ink-300" aria-live="polite"><FiLoader className="h-3.5 w-3.5 animate-spin" /> {busy}</p>}
      <ErrorBanner error={shownError} actions={[...staleActions, ...notFoundActions, ...connectActions, ...retryActions]} />

      {conn.status === 'loading' || conn.status === 'unknown' ? (
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink-500"><FiLoader className="h-4 w-4 animate-spin" /> Checking your GitHub connection…</p>
      ) : unavailable ? (
        <p className="mt-4 text-sm text-ink-600 dark:text-ink-300">GitHub sync is not available yet. Please try again later.</p>
      ) : !connected ? (
        <div className="mt-4 flex flex-col gap-3 text-sm text-ink-600 dark:text-ink-300">
          <p>Connect your GitHub account to save this project to a repository, open one of your repos here, and keep both in sync.</p>
          <p className="text-xs text-ink-500">WebNest asks for the <code>repo</code> permission so it can create and update repositories you choose, including private ones. You can disconnect at any time.</p>
          <button type="button" onClick={connect} disabled={Boolean(busy)} className={PRIMARY}><FiGithub className="h-4 w-4" /> Connect GitHub</button>
        </div>
      ) : view === 'import' ? (
        <ImportView run={run} busy={busy} touched={touched} onCancel={() => setView('home')} onImported={(result) => { onApplyFiles(result); onClose() }} toast={toast} />
      ) : view === 'create' ? (
        <CreateRepoView run={run} busy={busy} files={files} onCancel={() => setView('home')} onLinked={(nextLink) => { onLinkChange(nextLink); setView('home') }} toast={toast} handleError={handleError} />
      ) : view === 'push' && link ? (
        <PushView run={run} busy={busy} files={files} link={link} changes={changes} onCancel={() => setView('home')} onPushed={(nextLink) => { onLinkChange(nextLink); setView('home') }} toast={toast} />
      ) : view === 'conflicts' && pullPlan ? (
        <ConflictView plan={pullPlan} onChoose={(choice) => applyPull(pullPlan, choice)} onCancel={() => { setPullPlan(null); setView('home') }} />
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <p className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
            {conn.data?.avatar_url && <img src={conn.data.avatar_url} alt="" className="h-6 w-6 rounded-full" referrerPolicy="no-referrer" />}
            Connected as <strong className="text-ink-900 dark:text-white">{conn.data?.login ?? 'GitHub user'}</strong>
          </p>
          {link ? (
            <div className="rounded-lg border border-ink-200 p-3 text-sm dark:border-ink-700">
              <p className="flex flex-wrap items-center gap-2">
                Linked to <strong className="text-ink-900 dark:text-white">{link.owner}/{link.repo}</strong>
                <span className="rounded bg-ink-100 px-1.5 text-[11px] dark:bg-ink-800">{link.branch}</span>
                <a href={link.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-gold-600 hover:underline dark:text-gold-400">Open <FiExternalLink className="h-3 w-3" /></a>
              </p>
              <p className="mt-1 text-xs text-ink-500">{changes ? `${changes.upserts.length + changes.deletes.length} file(s) changed since the last sync.` : 'Checking for changes…'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => { setError(null); setView('push') }} disabled={Boolean(busy)} className={PRIMARY}><FiArrowUpCircle className="h-4 w-4" /> Push</button>
                <button type="button" onClick={pull} disabled={Boolean(busy)} className={SECONDARY}><FiArrowDownCircle className="h-4 w-4" /> Pull</button>
                <button type="button" onClick={unlink} disabled={Boolean(busy)} className={SECONDARY}>Unlink</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => { setError(null); setView('create') }} disabled={Boolean(busy)} className={PRIMARY}><FiArrowUpCircle className="h-4 w-4" /> Push to a new repo</button>
              <button type="button" onClick={() => { setError(null); setView('import') }} disabled={Boolean(busy)} className={SECONDARY}><FiArrowDownCircle className="h-4 w-4" /> Import a repo</button>
            </div>
          )}
          {link && (
            <button type="button" onClick={() => { setError(null); setView('import') }} disabled={Boolean(busy)} className="self-start text-xs font-semibold text-ink-500 hover:text-gold-600 hover:underline">Import a different repo instead…</button>
          )}
          <button type="button" onClick={disconnect} disabled={Boolean(busy)} className="self-start text-xs font-semibold text-red-600 hover:underline dark:text-red-400">Disconnect GitHub</button>
        </div>
      )}
    </>
  )
}

function ImportView({ run, busy, touched, onCancel, onImported, toast }) {
  const [query, setQuery] = useState('')
  const [repos, setRepos] = useState({ items: [], page: 0, has_more: false, loaded: false })
  const [repo, setRepo] = useState(null)
  const [branches, setBranches] = useState([])
  const [branch, setBranch] = useState('')
  const [snapshot, setSnapshot] = useState(null)
  const [mode, setMode] = useState('web')
  const requestRef = useRef(0)

  const loadRepos = useCallback((page, q) => {
    const id = ++requestRef.current
    run('Loading repositories…', async () => {
      const result = await github.listRepos({ page, q })
      if (id !== requestRef.current) return // a newer search replaced this one
      setRepos((current) => ({ items: page === 1 ? result.items : [...current.items, ...result.items], page: result.page, has_more: result.has_more, loaded: true }))
    })
  }, [run])

  // The search refetches when the query changes, not when the parent re-renders and
  // hands down a new `run`; that would drop the pages already loaded with Load more.
  const loadReposRef = useRef(loadRepos)
  loadReposRef.current = loadRepos
  useEffect(() => {
    const timer = setTimeout(() => loadReposRef.current(1, query.trim()), query ? 350 : 0)
    return () => clearTimeout(timer)
  }, [query])

  const pickRepo = (item) => run('Loading branches…', async () => {
    setRepo(item)
    setSnapshot(null)
    const result = await github.listBranches(item.owner, item.name)
    const names = result.items.map((entry) => entry.name)
    setBranches(names.length ? names : [item.default_branch])
    setBranch(names.includes(item.default_branch) ? item.default_branch : names[0] ?? item.default_branch)
  })

  const loadFiles = () => run('Reading repository files…', async () => {
    const result = await github.getSnapshot(repo.owner, repo.name, { branch, mode: 'auto' })
    setSnapshot(result)
    setMode(MODES.includes(result.mode) ? result.mode : guessMode(result.files))
  })

  const selection = useMemo(() => (snapshot ? filesForMode(snapshot.files, mode) : null), [snapshot, mode])
  const skipped = useMemo(
    () => (snapshot ? [...snapshot.skipped.map((item) => ({ ...item, message: item.reason.replace('_', ' ') })), ...selection.skipped] : []),
    [snapshot, selection],
  )

  const doImport = () => {
    if (!selection?.files.length) return
    if (touched && !window.confirm(`Replace the files in the editor with ${selection.files.length} file(s) from ${repo.full_name}?`)) return
    const link = linkFromSnapshot(snapshot, selection, repo.html_url)
    onImported({ files: selection.files, language: mode, link, kind: 'import' })
    toast.success(`Imported ${selection.files.length} file${selection.files.length === 1 ? '' : 's'} from ${repo.full_name}.`)
  }

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm">
      {!repo ? (
        <>
          <label htmlFor="gh-search" className="text-xs font-semibold text-ink-500">Choose a repository</label>
          <input id="gh-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your repositories" className={INPUT} autoFocus />
          <ul className="max-h-64 divide-y divide-ink-100 overflow-y-auto rounded-lg border border-ink-200 dark:divide-ink-800 dark:border-ink-700">
            {repos.items.map((item) => (
              <li key={item.full_name}>
                <button type="button" onClick={() => pickRepo(item)} disabled={Boolean(busy)} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-ink-50 disabled:opacity-50 dark:hover:bg-ink-800">
                  <span className="truncate">{item.full_name}</span>
                  <span className="shrink-0 text-[10px] text-ink-500">{item.private ? 'private' : 'public'}</span>
                </button>
              </li>
            ))}
            {repos.loaded && !repos.items.length && <li className="px-3 py-4 text-center text-xs text-ink-500">No repositories found.</li>}
          </ul>
          {repos.has_more && <button type="button" onClick={() => loadRepos(repos.page + 1, query.trim())} disabled={Boolean(busy)} className={SECONDARY}>Load more</button>}
        </>
      ) : (
        <>
          <p>Repository <strong>{repo.full_name}</strong> <button type="button" onClick={() => { setRepo(null); setSnapshot(null) }} className="text-xs text-gold-600 hover:underline">change</button></p>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="gh-branch" className="text-xs font-semibold text-ink-500">Branch</label>
              <select id="gh-branch" value={branch} disabled={Boolean(busy)} onChange={(event) => { setBranch(event.target.value); setSnapshot(null) }} className={`${INPUT} bg-white dark:bg-ink-900`}>
                {branches.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <button type="button" onClick={loadFiles} disabled={Boolean(busy) || !branch} className={SECONDARY}>Read files</button>
          </div>
          {snapshot && (
            <>
              <div>
                <label htmlFor="gh-mode" className="text-xs font-semibold text-ink-500">Open as</label>
                <select id="gh-mode" value={mode} onChange={(event) => setMode(event.target.value)} className={`${INPUT} bg-white dark:bg-ink-900`}>
                  {MODES.map((item) => <option key={item} value={item}>{MODE_LABEL[item]}</option>)}
                </select>
              </div>
              <p className="text-xs text-ink-600 dark:text-ink-300">{selection.files.length} file(s) will open in the editor{skipped.length ? `, ${skipped.length} skipped` : ''}.</p>
              {skipped.length > 0 && (
                <details className="text-xs text-ink-500">
                  <summary className="cursor-pointer">Skipped files</summary>
                  <ul className="mt-1 max-h-32 overflow-y-auto">
                    {skipped.map((item) => <li key={item.path}><code>{item.path}</code>: {item.message}</li>)}
                  </ul>
                </details>
              )}
              {!selection.files.length && <p className="text-xs text-amber-600">None of this repository's files fit a {MODE_LABEL[mode]} project. Try another mode.</p>}
            </>
          )}
        </>
      )}
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={doImport} disabled={Boolean(busy) || !selection?.files.length} className={PRIMARY}>Import</button>
        <button type="button" onClick={onCancel} className={SECONDARY}>Back</button>
      </div>
    </div>
  )
}

function CreateRepoView({ run, busy, files, onCancel, onLinked, toast, handleError }) {
  const [name, setName] = useState(() => (files.some((file) => file.name.endsWith('main.py')) ? 'fastapi-project' : 'webnest-project'))
  const [isPrivate, setIsPrivate] = useState(true)
  const [nameError, setNameError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setNameError('')
    if (!/^[A-Za-z0-9._-]{1,100}$/.test(name)) {
      setNameError('Use 1-100 letters, numbers, ".", "_" or "-".')
      return
    }
    let created = null
    await run('Creating repository…', async () => {
      try {
        created = await github.createRepo({ name, isPrivate, description: 'Made with WebNest CodeLab' })
      } catch (err) {
        const info = describeGitHubError(err)
        const field = info.fields.find((item) => item.field === 'name')
        if (field) {
          setNameError(field.message)
          return
        }
        throw err
      }
    })
    if (!created) return
    // The repo exists now; link it even if the first push fails so the user can retry.
    const base = emptyLink({ owner: created.owner, repo: created.name, branch: created.default_branch, commitSha: created.head_commit_sha, htmlUrl: created.html_url })
    await run('Pushing your files…', async () => {
      try {
        const changes = await buildCommitChanges(files, base)
        const result = await github.createCommit(created.owner, created.name, { branch: base.branch, baseCommitSha: base.commit_sha, message: 'Initial commit from WebNest CodeLab', changes })
        onLinked(await linkAfterCommit(base, files, changes, result))
        toast.success(`Pushed to ${created.full_name}.`)
      } catch (err) {
        onLinked(base)
        handleError(err)
        toast.info(`Repository ${created.full_name} was created. Press Push to try uploading again.`)
      }
    })
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-3 text-sm">
      <div>
        <label htmlFor="gh-name" className="text-xs font-semibold text-ink-500">Repository name</label>
        <input id="gh-name" value={name} onChange={(event) => setName(event.target.value)} className={INPUT} autoFocus aria-invalid={Boolean(nameError)} aria-describedby={nameError ? 'gh-name-error' : undefined} />
        {nameError && <p id="gh-name-error" className="mt-1 text-xs font-medium text-red-500">{nameError}</p>}
      </div>
      <label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} /> Private repository</label>
      <p className="text-xs text-ink-500">{files.length} file(s) will be committed.</p>
      <div className="flex gap-2">
        <button type="submit" disabled={Boolean(busy) || !files.length} className={PRIMARY}>Create and push</button>
        <button type="button" onClick={onCancel} className={SECONDARY}>Back</button>
      </div>
    </form>
  )
}

function PushView({ run, busy, files, link, changes, onCancel, onPushed, toast }) {
  const [message, setMessage] = useState('')
  const [messageError, setMessageError] = useState('')
  const count = changes ? changes.upserts.length + changes.deletes.length : 0

  const submit = (event) => {
    event.preventDefault()
    const text = message.trim()
    if (!text || text.length > 200) {
      setMessageError('Enter a commit message (up to 200 characters).')
      return
    }
    setMessageError('')
    run('Pushing to GitHub…', async () => {
      const list = await buildCommitChanges(files, link)
      if (!list.length) {
        toast.info('Nothing to push: this project matches GitHub.')
        onCancel()
        return
      }
      const risks = pushRisks(link, list)
      if (risks.length && !window.confirm(
        `The last pull could not read ${risks.join(', ')} from GitHub (too large or over a limit), so any change made there was not checked. Pushing replaces GitHub's version. Push anyway?`,
      )) return
      try {
        const result = await github.createCommit(link.owner, link.repo, { branch: link.branch, baseCommitSha: link.commit_sha, message: text, changes: list })
        onPushed(await linkAfterCommit(link, files, list, result))
        toast.success(`Pushed ${list.length} change${list.length === 1 ? '' : 's'} to ${link.owner}/${link.repo}.`)
      } catch (err) {
        const info = describeGitHubError(err)
        const field = info.fields.find((item) => item.field === 'message')
        if (field) {
          setMessageError(field.message)
          return
        }
        throw err
      }
    })
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-3 text-sm">
      <p className="text-xs text-ink-600 dark:text-ink-300">
        {changes ? `${count} change(s) to ${link.owner}/${link.repo} (${link.branch}).` : 'Checking for changes…'}
      </p>
      {changes && count > 0 && (
        <ul className="max-h-32 overflow-y-auto text-xs text-ink-500">
          {changes.upserts.map((name) => <li key={`u-${name}`}><span className="text-emerald-600">M</span> {name}</li>)}
          {changes.deletes.map((name) => <li key={`d-${name}`}><span className="text-red-600">D</span> {name}</li>)}
        </ul>
      )}
      <div>
        <label htmlFor="gh-message" className="text-xs font-semibold text-ink-500">Commit message</label>
        <input id="gh-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe what you changed" maxLength={200} className={INPUT} autoFocus aria-invalid={Boolean(messageError)} />
        {messageError && <p className="mt-1 text-xs font-medium text-red-500">{messageError}</p>}
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={Boolean(busy) || (changes && count === 0)} className={PRIMARY}>Push</button>
        <button type="button" onClick={onCancel} className={SECONDARY}>Back</button>
      </div>
    </form>
  )
}

const CONFLICT_TEXT = {
  both_changed: 'changed here and on GitHub',
  deleted_here: 'deleted here, changed on GitHub',
  deleted_there: 'changed here, deleted on GitHub',
}

function ConflictView({ plan, onChoose, onCancel }) {
  return (
    <div className="mt-4 flex flex-col gap-3 text-sm">
      <p className="text-ink-700 dark:text-ink-200">These files changed in both places. Choose which version to keep for all of them:</p>
      <ul className="max-h-40 overflow-y-auto rounded-lg border border-ink-200 p-2 text-xs dark:border-ink-700">
        {plan.conflicts.map((item) => <li key={item.name}><code>{item.name}</code>: {CONFLICT_TEXT[item.kind] ?? 'changed in both places'}</li>)}
      </ul>
      {(plan.apply.length > 0 || plan.remove.length > 0) && (
        <p className="text-xs text-ink-500">{plan.apply.length + plan.remove.length} other file(s) will update from GitHub either way.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onChoose('mine')} className={PRIMARY}>Keep mine</button>
        <button type="button" onClick={() => onChoose('theirs')} className={SECONDARY}>Use GitHub&apos;s</button>
        <button type="button" onClick={onCancel} className={SECONDARY}>Cancel</button>
      </div>
    </div>
  )
}
