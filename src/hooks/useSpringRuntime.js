import { useCallback, useDeferredValue, useMemo, useRef, useState } from 'react'
import { api, getErrorDetail } from '../lib/apiClient'
import { SPRING_PREFIX } from '../lib/codelab/storageKeys.js'
import {
  findSpringMainClass, isSpringRunnable, nextWrites, runProblem, SPRING_MAX_WRITES, springOpenApi, toOutputResult,
  toRunnerRequest, toTesterResponse,
} from '../lib/codelab/springProject.js'
import { useWorkspaceStorage } from './useWorkspaceStorage'

const RUN_HINT = 'Compiling and starting your Spring Boot app on the server… a first run can take up to a minute.'
const LOG_TAIL = 8000

// The writes replayed before each request, kept per workspace. Anything else in storage is dropped.
const readStored = (saved) => ({
  writes: Array.isArray(saved?.writes)
    ? saved.writes.filter((item) => item && typeof item.method === 'string' && typeof item.path === 'string').slice(0, SPRING_MAX_WRITES)
    : [],
})
const toSaved = ({ writes }) => ({ writes })

const logTail = (data) => `${data?.app?.stdout ?? ''}${data?.app?.stderr ?? ''}`.slice(-LOG_TAIL)

function failureMessage(error) {
  const status = error?.response?.status
  if (status === 401) return 'Log in to run Spring Boot projects.'
  if (!error?.response) return 'Could not reach WebNest Studio. Check your connection and try again.'
  return getErrorDetail(error, 'The Spring Boot runner is unavailable right now. Please try again shortly.')
}

// Runs a Spring Boot project on the server (POST /api/spring/run). There is no app running
// between calls: each Run or request compiles and starts the app, sends the requests, and
// stops it. Earlier successful writes are replayed first, so data added earlier is still there.
// The shape follows what the workspace needs from useApiRuntime: runner, request, openapi.
export function useSpringRuntime(workspaceKey, files) {
  const storageKey = `${SPRING_PREFIX}${workspaceKey}`
  const [stored, updateStored] = useWorkspaceStorage(storageKey, readStored, toSaved)
  const [running, setRunning] = useState(false)
  const [runningSince, setRunningSince] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [stopped, setStopped] = useState(false)
  const [lastExchange, setLastExchange] = useState(null)
  const filesRef = useRef(files)
  filesRef.current = files
  const writesRef = useRef(stored.writes)
  writesRef.current = stored.writes
  const controller = useRef(null)
  const busy = useRef(false)

  // One call at a time; resolves to the runner's JSON, or throws the request error. `latest`:
  // files newer than this render's, such as the AI assistant's edits.
  const call = useCallback(async (requests, latest) => {
    const project = latest ?? filesRef.current ?? []
    const body = {
      files: project.filter((file) => isSpringRunnable(file.name)).map((file) => ({ path: file.name, content: file.content ?? '' })),
      mainClass: findSpringMainClass(project),
      requests,
    }
    const abort = new AbortController()
    controller.current = abort
    busy.current = true
    setRunning(true)
    setRunningSince(Date.now())
    setStopped(false)
    setError(null)
    try {
      const { data } = await api.post('/api/spring/run', body, { signal: abort.signal })
      return data
    } finally {
      busy.current = false
      controller.current = null
      setRunning(false)
      setRunningSince(null)
    }
  }, [])

  // Shows a failed call in Output. Returns the message.
  const showFailure = useCallback((failure) => {
    if (failure?.code === 'ERR_CANCELED') {
      setStopped(true)
      setResult(null)
      return 'Stopped.'
    }
    const message = failureMessage(failure)
    setError(message)
    setResult(null)
    return message
  }, [])

  // Run: compile and start the app with no requests, to check it starts. Resolves to the
  // result shown in Output, or to a failed one (never throws), for the AI assistant. `origin`
  // marks the result, so the workspace can tell the assistant's runs from the learner's.
  const run = useCallback(async (latest, origin = 'run') => {
    if (busy.current) return { status: 'internal_error', error: 'Another run is still going. Wait for it to finish, then run again.' }
    try {
      const output = { ...toOutputResult(await call([], Array.isArray(latest) ? latest : undefined)), origin }
      setResult(output)
      return output
    } catch (failure) {
      return { status: 'internal_error', error: showFailure(failure) }
    }
  }, [call, showFailure])

  // One request from the API tester: replays the saved writes, then sends it.
  const request = useCallback(async (spec, source = 'tester') => {
    const at = Date.now()
    if (busy.current) {
      return { status: 0, headers: [], body: '', error: 'Wait for the current run to finish, then send again.' }
    }
    const replayed = writesRef.current
    const next = toRunnerRequest(spec)
    let response
    try {
      const data = await call([...replayed, next])
      setResult({ ...toOutputResult(data), origin: source })
      const answer = Array.isArray(data?.responses) ? data.responses[replayed.length] : undefined
      const notes = []
      const failedReplays = (data?.responses ?? []).slice(0, replayed.length).filter((item) => item.status < 200 || item.status >= 300)
      if (failedReplays.length) notes.push(`${failedReplays.length} of the ${replayed.length} saved write${replayed.length === 1 ? '' : 's'} replayed before this request did not succeed this time. Reset data to start from data.sql again.`)
      response = answer ? toTesterResponse(answer, logTail(data)) : { status: 0, headers: [], body: '', logs: logTail(data), error: runProblem(data?.status) }
      if (answer) {
        const writes = nextWrites(replayed, next, answer.status)
        if (writes !== replayed) updateStored(storageKey, () => ({ writes }))
        else if (writes.length >= SPRING_MAX_WRITES && next.method !== 'GET' && answer.status >= 200 && answer.status < 300) {
          notes.push(`Only ${SPRING_MAX_WRITES} writes are replayed, so this one will not be kept for the next request. Reset data to start again.`)
        }
      }
      if (notes.length) response = { ...response, logs: `${notes.join('\n')}\n\n${response.logs ?? ''}` }
    } catch (failure) {
      response = { status: 0, headers: [], body: '', error: showFailure(failure) }
    }
    setLastExchange({ spec, response, source, at })
    return response
  }, [call, showFailure, storageKey, updateStored])

  const cancel = useCallback(() => controller.current?.abort(), [])
  const resetData = useCallback(() => updateStored(storageKey, () => ({ writes: [] })), [storageKey, updateStored])
  // Read from the code after typing settles, not on every keystroke.
  const settledFiles = useDeferredValue(files)
  const openapi = useMemo(() => springOpenApi(settledFiles ?? []), [settledFiles])

  const runner = useMemo(() => ({
    run, cancel, running, runningSince, runningHint: running ? RUN_HINT : '', result, error, stopped,
  }), [run, cancel, running, runningSince, result, error, stopped])

  return { runner, request, openapi, lastExchange, writes: stored.writes, resetData }
}
