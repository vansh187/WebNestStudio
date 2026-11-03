import { useCallback, useEffect, useRef, useState } from 'react'
import { runWebPreview } from '../lib/codelab/webPreview'
import { executeJava, JAVA_PLAYGROUND_ENDPOINT } from '../lib/codelab/javaRunner'
import { api, subscribeSlowRequest } from '../lib/apiClient'

const RUN_TIMEOUT_MS = 10000
// A debugged run's shared buffer: three Int32 slots, then the current breakpoints as JSON
// (see pyodideRunner.worker.js).
const DEBUG_HEADER_BYTES = 12
const DEBUG_BUFFER_BYTES = DEBUG_HEADER_BYTES + 16384
// Slightly above the axios JAVA_TIMEOUT (90s) so the client's own timeout normally wins.
const JAVA_TIMEOUT_MS = 95000
const JAVA_TIMEOUT_MESSAGE = 'The Java service did not respond in time. Please try again.'
const JAVA_SLOW_HINT = 'Starting the Java runner… the first run can take up to a minute.'

function describeLocalError(error) {
  if (error?.name === 'DataCloneError') return 'The runner could not read this code payload.'
  return error?.message || 'The local CodeLab runner could not start.'
}

function describeJavaError(error) {
  if (error?.status === 503) return 'The Java runner is starting up or unavailable. Try again in a moment.'
  // 429 detail says which limit was hit (per-visitor, daily cap, busy) - show it as-is.
  if (error?.status) return error.message
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return JAVA_TIMEOUT_MESSAGE
  if (error?.isAxiosError) return 'Could not reach the Java service. Check your connection and try again.'
  return describeLocalError(error)
}

export function useCodeRunner() {
  const [running, setRunning] = useState(false)
  const [runningSince, setRunningSince] = useState(null)
  const [stopped, setStopped] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [runningHint, setRunningHint] = useState(null)
  // Python debugging: where the run is paused (frames as in the FastAPI debugger), and the
  // previous stop, so the page can mark what a step changed.
  const [debugPause, setDebugPause] = useState(null)
  const pausedRef = useRef(null)
  const workerRef = useRef(null)
  const requestRef = useRef(null)
  const timerRef = useRef(null)
  const slowUnsubRef = useRef(null)
  const runIdRef = useRef(0)
  const mountedRef = useRef(true)
  const settleRef = useRef(null)

  // Answers whoever is awaiting the current run (run returns a promise of { result, error }).
  const settle = useCallback((result, error) => {
    settleRef.current?.({ result, error })
    settleRef.current = null
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const stopSlowWatch = useCallback(() => {
    slowUnsubRef.current?.()
    slowUnsubRef.current = null
    if (mountedRef.current) setRunningHint(null)
  }, [])

  const terminateWorker = useCallback(() => {
    requestRef.current?.abort()
    requestRef.current = null
    workerRef.current?.terminate()
    workerRef.current = null
    pausedRef.current = null
    if (mountedRef.current) setDebugPause(null)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearTimer()
      stopSlowWatch()
      terminateWorker()
      settle(null, null)
    }
  }, [clearTimer, settle, stopSlowWatch, terminateWorker])

  const finish = useCallback((nextResult, nextError = null) => {
    settle(nextResult, nextError)
    if (!mountedRef.current) return
    clearTimer()
    stopSlowWatch()
    setResult(nextResult)
    setError(nextError)
    setRunning(false)
    setRunningSince(null)
  }, [clearTimer, settle, stopSlowWatch])

  // The Python time limit counts running time only: it stops while a debugged run is paused
  // and starts again on Continue or a step.
  const armPythonTimer = useCallback((runId) => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      if (runIdRef.current !== runId) return
      terminateWorker()
      finish({
        status: 'timeout',
        stdout: '',
        stderr: 'Execution timed out.',
        runtime_ms: RUN_TIMEOUT_MS,
        error: 'Execution timed out.',
        truncated: false,
      })
    }, RUN_TIMEOUT_MS)
  }, [clearTimer, finish, terminateWorker])

  const runPython = useCallback((payload, runId, debug = null) => {
    terminateWorker()
    const worker = new Worker(new URL('../workers/pyodideRunner.worker.js', import.meta.url), { type: 'module' })
    workerRef.current = worker
    armPythonTimer(runId)

    worker.onmessage = (event) => {
      if (runIdRef.current !== runId) return
      if (event.data?.type === 'debugPaused') {
        clearTimer()
        let frames = []
        try { frames = JSON.parse(event.data.frames || '[]') } catch { frames = [] }
        const previous = pausedRef.current?.runId === runId ? pausedRef.current.frames : null
        const pause = { ...event.data, frames, previous, runId }
        pausedRef.current = pause
        if (mountedRef.current) setDebugPause(pause)
        return
      }
      terminateWorker()
      finish(event.data?.result ?? {
        status: 'internal_error',
        stdout: '',
        stderr: 'The Python runner returned an invalid response.',
        runtime_ms: 0,
        error: 'Invalid runner response.',
        truncated: false,
      })
    }

    worker.onerror = (event) => {
      if (runIdRef.current !== runId) return
      terminateWorker()
      // No message means the worker script never loaded: this tab was opened before a deploy
      // renamed it (the old name returns 404). Only a reload picks up the new name.
      finish(null, event.message || 'CodeLab was updated after this page was opened. Reload the page to run your code.')
    }

    worker.postMessage({
      id: runId,
      source: payload.source ?? payload.files?.[0]?.content ?? '',
      stdin: payload.stdin ?? '',
      ...(debug ? { debug } : {}),
    })
  }, [armPythonTimer, clearTimer, finish, terminateWorker])

  // `options.breakpoints` debugs a Python run: it pauses at them (needs a cross-origin
  // isolated page; without one the run simply runs).
  const run = useCallback((payload, options = {}) => {
    const runId = runIdRef.current + 1
    runIdRef.current = runId
    settle(null, null)
    const settled = new Promise((resolve) => { settleRef.current = resolve })
    clearTimer()
    stopSlowWatch()
    terminateWorker()
    setRunning(true)
    setRunningSince(Date.now())
    setStopped(false)
    setResult(null)
    setError(null)

    try {
      if (payload.language === 'web') {
        finish(runWebPreview(payload))
        return settled
      }
      if (payload.language === 'python') {
        const debugging = Array.isArray(options.breakpoints) && typeof SharedArrayBuffer !== 'undefined' && globalThis.crossOriginIsolated
        runPython(payload, runId, debugging ? {
          breakpoints: options.breakpoints,
          control: new SharedArrayBuffer(DEBUG_BUFFER_BYTES),
          name: payload.sourceName || payload.files?.[0]?.name || 'main.py',
        } : null)
        return settled
      }
      if (payload.language === 'java') {
        const controller = new AbortController()
        requestRef.current = controller
        timerRef.current = setTimeout(() => {
          if (runIdRef.current !== runId) return
          runIdRef.current += 1
          controller.abort()
          requestRef.current = null
          finish(null, JAVA_TIMEOUT_MESSAGE)
        }, JAVA_TIMEOUT_MS)
        // No login check: Java runs for logged-out visitors like Python and HTML.
        slowUnsubRef.current = subscribeSlowRequest((slow) => {
          if (slow && runIdRef.current === runId && mountedRef.current) setRunningHint(JAVA_SLOW_HINT)
        })
        executeJava(payload, { endpoint: JAVA_PLAYGROUND_ENDPOINT, signal: controller.signal, httpClient: api })
          .then((javaResult) => {
            if (runIdRef.current === runId) finish(javaResult)
          })
          .catch((err) => {
            if (runIdRef.current === runId && !controller.signal.aborted) finish(null, describeJavaError(err))
          })
          .finally(() => { if (requestRef.current === controller) requestRef.current = null })
        return settled
      }
      finish({
        status: 'internal_error',
        stdout: '',
        stderr: 'This language is not available in Webnest CodeLab Phase 1.',
        runtime_ms: 0,
        error: 'Unsupported language.',
        truncated: false,
      })
    } catch (err) {
      finish(null, describeLocalError(err))
    }
    return settled
  }, [clearTimer, finish, runPython, settle, stopSlowWatch, terminateWorker])

  // mode: 0 continue, 1 step into, 2 step over, 3 step out (see python/webnest_debug.py).
  // `breakpoints`, when given, replace the run's: set or removed while paused, they count
  // from this step on.
  const resumeDebug = useCallback((mode = 0, breakpoints = null) => {
    const paused = pausedRef.current
    if (!(paused?.control instanceof SharedArrayBuffer) || paused.runId !== runIdRef.current || paused.resumed) return
    const gates = new Int32Array(paused.control, 0, 3)
    const bytes = Array.isArray(breakpoints) ? new TextEncoder().encode(JSON.stringify(breakpoints)) : null
    if (bytes && bytes.length <= DEBUG_BUFFER_BYTES - DEBUG_HEADER_BYTES) {
      new Uint8Array(paused.control, DEBUG_HEADER_BYTES, bytes.length).set(bytes)
      Atomics.store(gates, 2, bytes.length)
    }
    Atomics.store(gates, 1, mode)
    Atomics.store(gates, 0, 1)
    Atomics.notify(gates, 0)
    // Kept, marked resumed, so the next stop can mark what this step changed.
    pausedRef.current = { ...paused, resumed: true }
    setDebugPause(null)
    armPythonTimer(paused.runId)
  }, [armPythonTimer])

  const cancel = useCallback(() => {
    runIdRef.current += 1
    clearTimer()
    stopSlowWatch()
    terminateWorker()
    setRunning(false)
    setRunningSince(null)
    setStopped(true)
    settle(null, null)
  }, [clearTimer, settle, stopSlowWatch, terminateWorker])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setStopped(false)
  }, [])

  return { running, runningSince, runningHint, stopped, result, error, run, cancel, reset, debugPause, resumeDebug }
}
