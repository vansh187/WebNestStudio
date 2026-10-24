import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loadDatabase, saveDatabase } from '../lib/codelab/dbStore'
import { REQUIREMENTS_FILE, parseRequirements } from '../lib/codelab/terminal'
import { envFromFiles } from '../lib/codelab/dotenv'
import { API_BASE_URL, api, getErrorDetail, refreshSession } from '../lib/apiClient'
import { getAccessToken } from '../lib/tokenStore'
import { RELAY_TOKEN_HEADER } from '../lib/codelab/relay'

// Client for apiRuntime.worker.js. The worker stays alive for the whole workspace so the
// learner's API and database persist between requests; a hung call restarts it from the
// last saved database snapshot.
const BOOT_TIMEOUT_MS = 120000
const LOAD_TIMEOUT_MS = 20000
const CALL_TIMEOUT_MS = 10000
// Running time allowed for a debugged request, between pauses. Time spent paused at a
// breakpoint never counts (see armTimer), so stepping slowly cannot hit it.
const DEBUG_CALL_TIMEOUT_MS = 30000
// Terminal commands: `pip install` downloads from PyPI; a script may do real work.
const INSTALL_TIMEOUT_MS = 180000
const EXEC_TIMEOUT_MS = 30000
// While the API relay is on, one call may wait for a Render cold start plus the payment
// provider (CODELAB_API_RELAY_FRONTEND.md).
const RELAY_CALL_TIMEOUT_MS = 45000
const RELAY_ENABLED = import.meta.env.VITE_CODELAB_RELAY === '1'
const RELAY_NOTICE_LIMIT = 20
const SNAPSHOT_DELAY_MS = 800
const SCHEMA_DELAY_MS = 400
const BOOT_HINT = 'Starting Python and FastAPI in your browser… the first run downloads about 5 MB.'
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export const DB_STORAGE_PREFIX = 'wns-codelab-db:'

// The IndexedDB key of a workspace's database. Everything that touches a workspace's
// database goes through this, so the format lives in one place.
export const databaseKey = (workspaceKey) => `${DB_STORAGE_PREFIX}${workspaceKey}`

// Deletes a workspace's saved database (used when a project is replaced or abandoned).
export async function deleteWorkspaceDatabase(workspaceKey) {
  try {
    return await saveDatabase(databaseKey(workspaceKey), null)
  } catch {
    return false
  }
}

function failure(message, extra = {}) {
  return { status: 'runtime_error', stdout: '', stderr: message, runtime_ms: 0, error: message, truncated: false, ...extra }
}

const messageOf = (error, fallback) => (error instanceof Error && error.message ? error.message : fallback)

export function useApiRuntime(workspaceKey) {
  const workerRef = useRef(null)
  const pendingRef = useRef(new Map())
  const seqRef = useRef(0)
  const bootRef = useRef(null)
  const snapshotRef = useRef(null)
  const filesRef = useRef(null)
  const mountedRef = useRef(true)
  const snapshotTimerRef = useRef(null)
  const schemaTimerRef = useRef(null)
  const schemaWatchRef = useRef(false)
  // How many debugged requests are in flight, and the pause the page is showing (it holds
  // the paused request's own control buffer, so Continue always reaches that request).
  const debugActiveRef = useRef(0)
  const pausedRef = useRef(null)
  const lastPauseRef = useRef(null)
  // API relay: the provider listing (loaded once per page), the config the current worker
  // has, and whether a login refresh was already tried for a relay 401.
  const relayListingRef = useRef(null)
  const relaySentRef = useRef('')
  const relayRefreshTriedRef = useRef(false)
  const dbKey = databaseKey(workspaceKey)

  const [running, setRunning] = useState(false)
  const [runningSince, setRunningSince] = useState(null)
  const [runningHint, setRunningHint] = useState(null)
  const [stopped, setStopped] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [openapi, setOpenapi] = useState(null)
  const [schema, setSchema] = useState(null)
  const [lastExchange, setLastExchange] = useState(null)
  const [booted, setBooted] = useState(false)
  const [debugPause, setDebugPause] = useState(null)
  // The newest request that can pause and has not finished, so the Debug tab does not show
  // an older response as if it were this one.
  const [debugRequest, setDebugRequest] = useState(null)
  // Lines from the API relay when it refused a call (newest last).
  const [relayNotices, setRelayNotices] = useState([])

  // A `relayNotice` from the worker. The ref keeps spawn() stable while this stays current.
  const noticeSeqRef = useRef(0)
  const handleRelayNoticeRef = useRef(() => {})
  handleRelayNoticeRef.current = (message) => {
    try {
      const notice = {
        id: (noticeSeqRef.current += 1),
        code: String(message.code ?? ''),
        host: String(message.host ?? ''),
        text: String(message.text ?? 'Relay: the API relay refused this call.'),
        retryAfter: message.retryAfter ?? null,
        at: Date.now(),
      }
      if (mountedRef.current) setRelayNotices((current) => [...current, notice].slice(-RELAY_NOTICE_LIMIT))
      // An expired WebNest token: refresh once; the next call sends the new token.
      if (notice.code === 'relay_login_required' && !relayRefreshTriedRef.current && getAccessToken()) {
        relayRefreshTriedRef.current = true
        refreshSession().then((ok) => { if (ok) relaySentRef.current = '' }).catch(() => {})
      }
      // Switched off on the server: reload the listing next time instead of relaying blindly.
      if (notice.code === 'relay_disabled') {
        relayListingRef.current = null
        relaySentRef.current = ''
      }
    } catch (error) {
      console.warn('Relay notice not handled:', error?.message)
    }
  }

  const rejectAll = useCallback((reason) => {
    for (const { reject, timer } of pendingRef.current.values()) {
      clearTimeout(timer)
      reject(new Error(reason))
    }
    pendingRef.current.clear()
  }, [])

  const clearTimers = useCallback(() => {
    clearTimeout(snapshotTimerRef.current)
    clearTimeout(schemaTimerRef.current)
    snapshotTimerRef.current = null
    schemaTimerRef.current = null
  }, [])

  const terminate = useCallback((reason = 'The backend runtime was stopped.') => {
    clearTimers()
    try {
      workerRef.current?.terminate()
    } catch {
      /* The worker is already gone. */
    }
    workerRef.current = null
    debugActiveRef.current = 0
    pausedRef.current = null
    lastPauseRef.current = null
    bootRef.current = null
    relaySentRef.current = '' // a new worker needs the relay config again
    rejectAll(reason)
    if (mountedRef.current) {
      setBooted(false)
      setDebugPause(null)
      setDebugRequest(null)
    }
  }, [clearTimers, rejectAll])

  // (Re)starts the timeout of a pending call; stopped while its request sits at a breakpoint.
  const armTimer = useCallback((id) => {
    const entry = pendingRef.current.get(id)
    if (!entry) return
    clearTimeout(entry.timer)
    entry.timer = setTimeout(() => {
      pendingRef.current.delete(id)
      entry.reject(Object.assign(new Error(`Stopped after ${Math.round(entry.timeoutMs / 1000)} seconds. Look for an infinite loop or a call that never returns.`), { timeout: true, type: entry.type }))
    }, entry.timeoutMs)
  }, [])

  const spawn = useCallback(() => {
    const worker = new Worker(new URL('../workers/apiRuntime.worker.js', import.meta.url), { type: 'module' })
    let started = false
    worker.onmessage = (event) => {
      started = true
      const message = event.data ?? {}
      if (message.type === 'debugPaused') {
        const entry = pendingRef.current.get(message.id)
        if (entry) {
          clearTimeout(entry.timer)
          entry.timer = null
        }
        let frames = []
        try { frames = JSON.parse(message.frames || '[]') } catch { frames = [] }
        // The previous stop of the same request, so the page can mark what a step changed.
        const previous = lastPauseRef.current?.id === message.id ? lastPauseRef.current.frames : null
        const pause = { ...message, frames, previous }
        lastPauseRef.current = pause
        pausedRef.current = pause
        if (mountedRef.current) setDebugPause(pause)
        return
      }
      if (message.type === 'relayNotice') {
        handleRelayNoticeRef.current(message)
        return
      }
      const entry = pendingRef.current.get(message.id)
      if (!entry) return
      pendingRef.current.delete(message.id)
      clearTimeout(entry.timer)
      if (message.ok) entry.resolve(message)
      else entry.reject(Object.assign(new Error(message.error || 'The backend runtime failed.'), { stdout: message.stdout, stderr: message.stderr }))
    }
    worker.onerror = (event) => {
      event.preventDefault?.()
      // A worker script that never loaded fires a plain error with no message. That happens
      // when this tab was opened before a deploy: the worker file was renamed and the old
      // name now returns 404 (in dev: after Vite re-optimised its dependencies).
      if (!started && !event.message) {
        terminate('CodeLab was updated after this page was opened. Reload the page to run your API.')
        return
      }
      terminate(event.message || 'The backend runtime crashed.')
    }
    worker.onmessageerror = () => terminate('The backend runtime sent a message that could not be read.')
    workerRef.current = worker
    return worker
  }, [terminate])

  const post = useCallback((type, payload = {}, timeoutMs = CALL_TIMEOUT_MS) => {
    const worker = workerRef.current
    if (!worker) return Promise.reject(new Error('The backend runtime is not running. Press Run.'))
    const id = ++seqRef.current
    return new Promise((resolve, reject) => {
      const entry = { resolve, reject, timer: null, timeoutMs, type }
      pendingRef.current.set(id, entry)
      armTimer(id)
      try {
        worker.postMessage({ id, type, ...payload })
      } catch (err) {
        // DataCloneError: the payload could not be copied to the worker.
        clearTimeout(entry.timer)
        pendingRef.current.delete(id)
        reject(new Error(messageOf(err, 'Could not send this request to the backend runtime.')))
      }
    })
  }, [armTimer])

  // Starts the worker once and restores the saved database into it. A failed start
  // terminates the worker, so retries never pile up idle Python runtimes.
  const ensureBooted = useCallback(() => {
    if (bootRef.current) return bootRef.current
    try {
      spawn()
    } catch (err) {
      return Promise.reject(new Error(messageOf(err, 'This browser could not start the backend runtime.')))
    }
    const boot = (async () => {
      if (snapshotRef.current === null) snapshotRef.current = (await loadDatabase(dbKey)) ?? undefined
      const bytes = snapshotRef.current ? snapshotRef.current.slice() : null
      const reply = await post('init', { dbBytes: bytes }, BOOT_TIMEOUT_MS)
      if (mountedRef.current) setBooted(true)
      return reply.data
    })()
    bootRef.current = boot
    boot.catch(() => {
      if (bootRef.current === boot) terminate('The backend runtime could not start.')
    })
    return boot
  }, [dbKey, post, spawn, terminate])

  const snapshotNow = useCallback(async () => {
    clearTimeout(snapshotTimerRef.current)
    snapshotTimerRef.current = null
    if (!workerRef.current) return
    try {
      const reply = await post('snapshot')
      const bytes = reply.data?.bytes ?? null
      snapshotRef.current = bytes ?? undefined
      await saveDatabase(dbKey, bytes)
    } catch {
      /* A failed snapshot only means the next reload starts from the previous one. */
    }
  }, [dbKey, post])

  // Copying the whole database to IndexedDB is the slow part, so batch it.
  const scheduleSnapshot = useCallback(() => {
    clearTimeout(snapshotTimerRef.current)
    snapshotTimerRef.current = setTimeout(() => { snapshotNow() }, SNAPSHOT_DELAY_MS)
  }, [snapshotNow])

  const refreshSchema = useCallback(async () => {
    const reply = await post('schema')
    if (mountedRef.current) setSchema(reply.data)
    return reply.data
  }, [post])

  // The schema (with a COUNT(*) per table) is only re-read while a panel shows it.
  const scheduleSchema = useCallback(() => {
    if (!schemaWatchRef.current) return
    clearTimeout(schemaTimerRef.current)
    schemaTimerRef.current = setTimeout(() => { refreshSchema().catch(() => null) }, SCHEMA_DELAY_MS)
  }, [refreshSchema])

  const watchSchema = useCallback((watching) => {
    schemaWatchRef.current = Boolean(watching)
    if (watching && workerRef.current) refreshSchema().catch(() => null)
  }, [refreshSchema])

  // Installs requirements.txt (packages from `pip install` live only as long as the worker).
  // Returns a line per package that was installed now or failed; satisfied ones stay quiet.
  const installRequirements = useCallback(async (files) => {
    const requirements = parseRequirements(files.find((file) => file.name === REQUIREMENTS_FILE)?.content)
    if (!requirements.length) return []
    const { results = [] } = (await post('install', { requirements }, INSTALL_TIMEOUT_MS)).data ?? {}
    return results
      .filter((item) => !item.ok || !item.already)
      .map((item) => (item.ok ? `Installed ${item.name} ${item.version ?? ''}`.trim() : `${REQUIREMENTS_FILE}: ${item.name} ${item.error}`))
  }, [post])

  // After a timeout the worker is stuck: start a fresh one from the last snapshot. The
  // project is reloaded only when the hang was not in the import itself, otherwise the
  // reload would hang the new worker too.
  const recover = useCallback(async (failedType) => {
    terminate('Restarting the backend runtime.')
    try {
      await ensureBooted()
      if (filesRef.current && failedType !== 'load' && failedType !== 'install') await installRequirements(filesRef.current).catch(() => [])
      if (filesRef.current && failedType !== 'load') await post('load', { files: filesRef.current }, LOAD_TIMEOUT_MS)
    } catch (err) {
      if (err?.timeout) terminate('The backend runtime stopped responding.')
    }
  }, [ensureBooted, installRequirements, post, terminate])

  const call = useCallback(async (type, payload, timeoutMs = CALL_TIMEOUT_MS) => {
    await ensureBooted()
    try {
      return await post(type, payload, timeoutMs)
    } catch (err) {
      // While a request sits at a breakpoint the worker is meant to be blocked: calls queued
      // behind it time out, but restarting would kill the debug session.
      if (err?.timeout && debugActiveRef.current > 0) {
        throw new Error('The API is paused at a breakpoint. Continue in the Debug tab, then try again.')
      }
      if (err?.timeout) recover(type)
      throw err
    }
  }, [ensureBooted, post, recover])

  // GET /api/codelab/relay/providers, once per page. null when the relay is off or the
  // backend cannot be reached: then nothing is relayed and calls behave as before.
  const loadRelayListing = useCallback(async () => {
    try {
      if (!RELAY_ENABLED) return null
      if (!relayListingRef.current) {
        const { data } = await api.get('/api/codelab/relay/providers')
        relayListingRef.current = data?.enabled ? data : null
      }
      return relayListingRef.current
    } catch (err) {
      console.warn('API relay unavailable:', getErrorDetail(err, 'no response'))
      return null
    }
  }, [])

  // Gives the worker the current relay listing and WebNest token before a call that may run
  // learner code. Re-sent only when either changed. True while relaying is on.
  const syncRelay = useCallback(async () => {
    try {
      if (!RELAY_ENABLED) return false
      // A request paused at a breakpoint blocks the worker; it already has the config.
      if (debugActiveRef.current > 0) return Boolean(relayListingRef.current)
      const listing = await loadRelayListing()
      if (!listing && !relaySentRef.current) return false
      const token = getAccessToken() || ''
      const key = JSON.stringify([listing?.providers?.map((provider) => provider.id) ?? [], listing?.relay_path ?? '', token])
      if (key !== relaySentRef.current) {
        await ensureBooted()
        await post('relayConfig', { baseUrl: API_BASE_URL, listing, token })
        relaySentRef.current = key
        relayRefreshTriedRef.current = false
      }
      return Boolean(listing)
    } catch (err) {
      console.warn('API relay settings not sent:', messageOf(err, 'unknown error'))
      return false
    }
  }, [ensureBooted, loadRelayListing, post])

  // The `relay` terminal command: the listing plus this learner's remaining quota.
  const relayStatus = useCallback(async () => {
    try {
      const listing = await loadRelayListing()
      const token = getAccessToken()
      const loggedIn = Boolean(token)
      let usage = null
      if (listing && loggedIn) {
        try {
          // The relay reads the WebNest login from its own header (contract 2.0), like relayed calls.
          usage = (await api.get('/api/codelab/relay/usage', { headers: { [RELAY_TOKEN_HEADER]: `Bearer ${token}` } })).data
        } catch (err) {
          console.warn('Relay usage unavailable:', getErrorDetail(err, 'no response'))
        }
      }
      return { listing, usage, loggedIn, enabled: RELAY_ENABLED }
    } catch (err) {
      console.warn('Relay status unavailable:', messageOf(err, 'unknown error'))
      return { listing: null, usage: null, loggedIn: false, enabled: RELAY_ENABLED }
    }
  }, [loadRelayListing])

  const clearRelayNotices = useCallback(() => setRelayNotices([]), [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      // Save pending changes before the worker goes away, then stop it.
      const pending = snapshotTimerRef.current
      if (pending && workerRef.current) {
        snapshotNow().finally(() => terminate())
      } else {
        terminate()
      }
    }
  }, [snapshotNow, terminate])

  // A different workspace means a different database.
  useEffect(() => {
    snapshotRef.current = null
    filesRef.current = null
    setOpenapi(null)
    setSchema(null)
    setLastExchange(null)
    setResult(null)
    terminate()
  }, [dbKey, terminate])

  const run = useCallback(async (files) => {
    const started = Date.now()
    setRunning(true)
    setRunningSince(started)
    setStopped(false)
    setError(null)
    setResult(null)
    setRunningHint(booted ? null : BOOT_HINT)
    const notes = []
    try {
      await ensureBooted()
      setRunningHint(null)
      // Module-level code in the app (e.g. creating an SDK client) may already call out.
      await syncRelay()
      // Ask the database itself: it may have been deleted or rebuilt since the last Run.
      const schemaFile = files.find((file) => file.name === 'schema.sql')
      const tables = (await post('tables')).data?.count ?? 0
      if (schemaFile?.content.trim() && !tables) {
        const applied = (await post('applySchema', { sql: schemaFile.content }, LOAD_TIMEOUT_MS)).data
        notes.push(applied.ok
          ? `Database created from schema.sql (${applied.applied} statements).`
          : `schema.sql line ${applied.line}: ${applied.error}`)
      }
      filesRef.current = files
      notes.push(...await installRequirements(files))
      // The worker applies .env on load; say what it holds by name only, never the values.
      const env = envFromFiles(files)
      env.problems.forEach((problem) => notes.push(`.env line ${problem.line}: ${problem.message} (line ignored)`))
      const names = Object.keys(env.values)
      if (names.length) notes.push(`Loaded ${names.length} variable${names.length === 1 ? '' : 's'} from .env: ${names.join(', ')}`)
      const reply = await post('load', { files }, LOAD_TIMEOUT_MS)
      const loaded = reply.data
      await refreshSchema().catch(() => null)
      await snapshotNow()
      const stdout = [notes.join('\n'), reply.stdout].filter(Boolean).join('\n')
      if (!loaded.ok) {
        setOpenapi(null)
        setResult(failure(loaded.error, { stdout, stderr: [reply.stderr, loaded.error].filter(Boolean).join('\n'), runtime_ms: Date.now() - started }))
        return
      }
      setOpenapi(loaded.openapi)
      const routes = Object.values(loaded.openapi?.paths ?? {}).reduce((sum, ops) => sum + Object.keys(ops).length, 0)
      setResult({
        status: 'success',
        stdout: [stdout, `API ready: ${routes} route${routes === 1 ? '' : 's'}. Open the API tab to send requests, or Preview to use your frontend.`].filter(Boolean).join('\n'),
        stderr: reply.stderr,
        runtime_ms: Date.now() - started,
        error: null,
        truncated: false,
      })
    } catch (err) {
      setResult(failure(messageOf(err, 'The backend runtime failed.'), { stdout: err?.stdout || '', runtime_ms: Date.now() - started }))
      if (err?.timeout) recover(err.type)
    } finally {
      if (mountedRef.current) {
        setRunning(false)
        setRunningSince(null)
        setRunningHint(null)
      }
    }
  }, [booted, ensureBooted, installRequirements, post, recover, refreshSchema, snapshotNow, syncRelay])

  const cancel = useCallback(() => {
    terminate('Stopped.')
    // The worker that held the API is gone, so nothing is loaded any more.
    setOpenapi(null)
    setRunning(false)
    setRunningSince(null)
    setRunningHint(null)
    setStopped(true)
  }, [terminate])

  // Stops a running API, like stopping a dev server. Database writes still waiting for the
  // batched snapshot are saved first, unless a request is paused at a breakpoint (the
  // worker cannot answer then).
  const stop = useCallback(async () => {
    if (snapshotTimerRef.current && !pausedRef.current) await snapshotNow()
    cancel()
  }, [cancel, snapshotNow])

  const request = useCallback(async (spec, source = 'tester', debuggerConfig = null) => {
    const startedAt = Date.now()
    let response
    // This request's own pause controls: a concurrent request (e.g. from Preview) finishing
    // must not clear the pause of one that is stopped at a breakpoint.
    let control = null
    try {
      const relaying = await syncRelay()
      let breakpoints = []
      // Without an isolated page (Safari, or before the Debug reload) the request runs
      // normally: no pausing, but the execution trace still shows what happened.
      if (debuggerConfig && typeof SharedArrayBuffer !== 'undefined' && globalThis.crossOriginIsolated) {
        control = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2)
        debugActiveRef.current += 1
        breakpoints = debuggerConfig.breakpoints ?? []
        if (mountedRef.current) setDebugRequest({ spec, startedAt })
      }
      const timeout = Math.max(control ? DEBUG_CALL_TIMEOUT_MS : CALL_TIMEOUT_MS, relaying ? RELAY_CALL_TIMEOUT_MS : 0)
      const reply = await call('request', { spec, breakpoints, control: control ?? undefined }, timeout)
      response = { ...reply.data, logs: [reply.stdout, reply.stderr].filter(Boolean).join('\n') }
    } catch (err) {
      response = { status: 0, error: messageOf(err, 'The request failed.'), body: '', headers: [], trace: null, ms: Date.now() - startedAt }
    } finally {
      if (control) {
        debugActiveRef.current = Math.max(0, debugActiveRef.current - 1)
        if (pausedRef.current?.control === control) {
          pausedRef.current = null
          if (mountedRef.current) setDebugPause(null)
        }
      }
    }
    if (mountedRef.current) {
      setLastExchange({ spec, response, source, at: startedAt })
      if (control) setDebugRequest((current) => (current?.startedAt === startedAt && current.spec === spec ? null : current))
    }
    if (WRITE_METHODS.has(String(spec?.method).toUpperCase()) && response.status) {
      scheduleSnapshot()
      scheduleSchema()
    }
    return response
  }, [call, scheduleSchema, scheduleSnapshot, syncRelay])

  // mode: 0 continue, 1 step into, 2 step over, 3 step out (see _on_line in webnest_runtime.py).
  const resumeDebug = useCallback((mode = 0) => {
    const paused = pausedRef.current
    if (!(paused?.control instanceof SharedArrayBuffer)) return
    const gates = new Int32Array(paused.control)
    Atomics.store(gates, 1, mode)
    Atomics.store(gates, 0, 1)
    Atomics.notify(gates, 0)
    pausedRef.current = null
    setDebugPause(null)
    armTimer(paused.id)
  }, [armTimer])

  // Terminal commands. Each resolves to the worker's data plus what Python printed.
  const install = useCallback(async (requirements) => {
    const reply = await call('install', { requirements }, INSTALL_TIMEOUT_MS)
    return { ...reply.data, stdout: reply.stdout, stderr: reply.stderr }
  }, [call])

  const pipList = useCallback(async () => (await call('pipList')).data?.packages ?? [], [call])

  // `spec`: { files, mode: 'file' | 'module' | 'code', target, args }
  const exec = useCallback(async (spec) => {
    const relaying = await syncRelay()
    const reply = await call('exec', spec, relaying ? Math.max(EXEC_TIMEOUT_MS, RELAY_CALL_TIMEOUT_MS) : EXEC_TIMEOUT_MS)
    // A script may write to the database like a request does.
    scheduleSnapshot()
    scheduleSchema()
    return { code: reply.data?.code ?? 0, stdout: reply.stdout, stderr: reply.stderr }
  }, [call, scheduleSchema, scheduleSnapshot, syncRelay])

  const sql = useCallback(async (script) => {
    const reply = await call('sql', { script })
    scheduleSnapshot()
    scheduleSchema()
    return reply.data
  }, [call, scheduleSchema, scheduleSnapshot])

  const applySchema = useCallback(async (script, rebuild) => {
    const reply = await call('applySchema', { sql: script, rebuild }, LOAD_TIMEOUT_MS)
    await snapshotNow()
    await refreshSchema().catch(() => null)
    return reply.data
  }, [call, refreshSchema, snapshotNow])

  const resetDatabase = useCallback(async () => {
    await call('reset')
    await snapshotNow()
    await refreshSchema().catch(() => null)
  }, [call, refreshSchema, snapshotNow])

  const exportDatabase = useCallback(async () => {
    const reply = await call('snapshot')
    return reply.data?.bytes ?? null
  }, [call])

  const loadSchema = useCallback(async () => {
    await ensureBooted()
    return refreshSchema()
  }, [ensureBooted, refreshSchema])

  // The shape RunBar and OutputPanel expect from useCodeRunner.
  const runner = useMemo(() => ({
    running, runningSince, runningHint, stopped, result, error,
    cancel,
    stop,
    reset: () => { setResult(null); setError(null); setStopped(false) },
  }), [running, runningSince, runningHint, stopped, result, error, cancel, stop])

  // Memoized so consumers can depend on the object and its functions without
  // re-subscribing on every render.
  return useMemo(() => ({
    runner,
    run,
    request,
    install,
    pipList,
    exec,
    relayStatus,
    relayNotices,
    clearRelayNotices,
    sql,
    applySchema,
    resetDatabase,
    exportDatabase,
    loadSchema,
    watchSchema,
    openapi,
    schema,
    lastExchange,
    debugPause,
    debugRequest,
    resumeDebug,
    ready: Boolean(openapi),
  }), [runner, run, request, install, pipList, exec, relayStatus, relayNotices, clearRelayNotices, sql, applySchema, resetDatabase, exportDatabase, loadSchema, watchSchema, openapi, schema, lastExchange, debugPause, debugRequest, resumeDebug])
}
