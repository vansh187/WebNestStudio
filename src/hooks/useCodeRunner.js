import { useCallback, useEffect, useRef, useState } from 'react'
import { executeCode } from '../api/coding'
import { getErrorDetail } from '../lib/apiClient'

// Turns an execute() failure into a human message. Covers every non-200 the
// backend documents (429 / 413 / 422 / 503) plus client-side timeout / offline.
function describeRunError(err) {
  if (err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message ?? '')) {
    return 'The run took too long and was stopped. Try again — the server may have been waking up.'
  }
  if (err?.response) {
    const { status, data } = err.response
    if (status === 429) return getErrorDetail(err, 'Too many runs right now — wait a minute and try again.')
    if (status === 413) return getErrorDetail(err, 'Your code is too large to run.')
    if (status === 503) {
      // Don't leak the backend's dev-facing detail ("Set PISTON_BASE_URL…") to users.
      const detail = String(data?.detail ?? '')
      if (/not configured|piston/i.test(detail)) {
        return 'The code runner is still being set up on the server. Please check back soon.'
      }
      return 'The code runner is temporarily unavailable. Please try again in a moment.'
    }
    return getErrorDetail(err, 'Could not run your code. Please try again.')
  }
  return 'Could not reach the server. Check your connection and try again.'
}

/**
 * Drives a single "run this code" call.
 *
 * `run(payload)` posts to /api/compiler/execute. A second run aborts the first so
 * a slow request can't land after a newer one. `result` is the raw execute
 * response ({ status, stdout, stderr, exit_code, compile, time_ms, ... }).
 */
export function useCodeRunner() {
  const [running, setRunning] = useState(false)
  const [runningSince, setRunningSince] = useState(null)
  const [stopped, setStopped] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => () => {
    mountedRef.current = false
    abortRef.current?.abort()
  }, [])

  const run = useCallback(async (payload) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Synchronous state flip so the UI shows "Running…" on the same tick as the
    // click — before any network work. Clear the previous run so the transition
    // is unambiguous.
    setRunning(true)
    setRunningSince(Date.now())
    setStopped(false)
    setError(null)
    setResult(null)

    try {
      const data = await executeCode(payload, { signal: controller.signal })
      if (!controller.signal.aborted && mountedRef.current) setResult(data)
    } catch (err) {
      if (controller.signal.aborted || err?.code === 'ERR_CANCELED') return
      if (!mountedRef.current) return
      setResult(null)
      setError(describeRunError(err))
    } finally {
      if (abortRef.current === controller && mountedRef.current) {
        abortRef.current = null
        setRunning(false)
        setRunningSince(null)
      }
    }
  }, [])

  // User-initiated stop. Aborting the request is instant client-side (the response
  // is dropped); the sandboxed process is torn down server-side by its own limits.
  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setRunning(false)
    setRunningSince(null)
    setStopped(true)
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setStopped(false)
  }, [])

  return { running, runningSince, stopped, result, error, run, cancel, reset }
}
