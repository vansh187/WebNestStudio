import { useCallback, useEffect, useRef, useState } from 'react'
import { runWebPreview } from '../lib/codelab/webPreview'
import { executeJava, JAVA_PLAYGROUND_ENDPOINT } from '../lib/codelab/javaRunner'
import { api, subscribeSlowRequest } from '../lib/apiClient'

const RUN_TIMEOUT_MS = 10000
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
  const workerRef = useRef(null)
  const requestRef = useRef(null)
  const timerRef = useRef(null)
  const slowUnsubRef = useRef(null)
  const runIdRef = useRef(0)
  const mountedRef = useRef(true)

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
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearTimer()
      stopSlowWatch()
      terminateWorker()
    }
  }, [clearTimer, stopSlowWatch, terminateWorker])

  const finish = useCallback((nextResult, nextError = null) => {
    if (!mountedRef.current) return
    clearTimer()
    stopSlowWatch()
    setResult(nextResult)
    setError(nextError)
    setRunning(false)
    setRunningSince(null)
  }, [clearTimer, stopSlowWatch])

  const runPython = useCallback((payload, runId) => {
    terminateWorker()
    const worker = new Worker(new URL('../workers/pyodideRunner.worker.js', import.meta.url), { type: 'module' })
    workerRef.current = worker

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

    worker.onmessage = (event) => {
      if (runIdRef.current !== runId) return
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
      finish(null, event.message || 'The Python runner crashed.')
    }

    worker.postMessage({
      id: runId,
      source: payload.source ?? payload.files?.[0]?.content ?? '',
      stdin: payload.stdin ?? '',
    })
  }, [finish, terminateWorker])

  const run = useCallback((payload) => {
    const runId = runIdRef.current + 1
    runIdRef.current = runId
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
        return
      }
      if (payload.language === 'python') {
        runPython(payload, runId)
        return
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
        return
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
  }, [clearTimer, finish, runPython, stopSlowWatch, terminateWorker])

  const cancel = useCallback(() => {
    runIdRef.current += 1
    clearTimer()
    stopSlowWatch()
    terminateWorker()
    setRunning(false)
    setRunningSince(null)
    setStopped(true)
  }, [clearTimer, stopSlowWatch, terminateWorker])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setStopped(false)
  }, [])

  return { running, runningSince, runningHint, stopped, result, error, run, cancel, reset }
}
