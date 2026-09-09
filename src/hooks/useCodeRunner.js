import { useCallback, useEffect, useRef, useState } from 'react'
import { runWebPreview } from '../lib/codelab/webPreview'

const RUN_TIMEOUT_MS = 10000

function describeLocalError(error) {
  if (error?.name === 'DataCloneError') return 'The runner could not read this code payload.'
  return error?.message || 'The local CodeLab runner could not start.'
}

export function useCodeRunner() {
  const [running, setRunning] = useState(false)
  const [runningSince, setRunningSince] = useState(null)
  const [stopped, setStopped] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const workerRef = useRef(null)
  const timerRef = useRef(null)
  const runIdRef = useRef(0)
  const mountedRef = useRef(true)

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearTimer()
      terminateWorker()
    }
  }, [clearTimer, terminateWorker])

  const finish = useCallback((nextResult, nextError = null) => {
    if (!mountedRef.current) return
    clearTimer()
    setResult(nextResult)
    setError(nextError)
    setRunning(false)
    setRunningSince(null)
  }, [clearTimer])

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
  }, [clearTimer, finish, runPython, terminateWorker])

  const cancel = useCallback(() => {
    runIdRef.current += 1
    clearTimer()
    terminateWorker()
    setRunning(false)
    setRunningSince(null)
    setStopped(true)
  }, [clearTimer, terminateWorker])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setStopped(false)
  }, [])

  return { running, runningSince, stopped, result, error, run, cancel, reset }
}
