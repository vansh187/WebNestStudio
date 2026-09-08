import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Debounced autosave.
 *
 * `value` is any serialisable snapshot of what should be persisted. When it
 * changes and settles for `delay` ms, `saveFn(value)` runs. Also flushes on
 * Ctrl/Cmd+S and on unmount.
 *
 * `enabled` gates saving (e.g. until the record has loaded). While disabled, the
 * baseline keeps tracking `value`, so flipping it on does not fire a spurious
 * save of the just-loaded data.
 *
 * Returns `{ status, flush }` where status is 'idle' | 'saving' | 'saved' | 'error'.
 */
export function useAutosave(value, saveFn, { delay = 1500, enabled = true } = {}) {
  const [status, setStatus] = useState('idle')

  const saveFnRef = useRef(saveFn)
  const valueRef = useRef(value)
  const lastSavedRef = useRef(JSON.stringify(value))
  const timerRef = useRef(null)
  const mountedRef = useRef(true)
  const prevEnabledRef = useRef(false)

  saveFnRef.current = saveFn
  valueRef.current = value

  useEffect(() => () => {
    mountedRef.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
    // Fire-and-forget the pending edit so navigating away mid-debounce (e.g. the
    // Back button) doesn't silently drop it. No await / no setState — the
    // component is gone. When disabled or already saved, the baseline tracks the
    // value, so this no-ops.
    const snapshot = JSON.stringify(valueRef.current)
    if (snapshot !== lastSavedRef.current) {
      try {
        Promise.resolve(saveFnRef.current(valueRef.current)).catch(() => {})
        lastSavedRef.current = snapshot
      } catch {
        /* ignore — best effort on unmount */
      }
    }
  }, [])

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const snapshot = JSON.stringify(valueRef.current)
    if (snapshot === lastSavedRef.current) return
    if (mountedRef.current) setStatus('saving')
    try {
      await saveFnRef.current(valueRef.current)
      lastSavedRef.current = snapshot
      if (mountedRef.current) setStatus('saved')
    } catch {
      if (mountedRef.current) setStatus('error')
    }
  }, [])

  // Runs before the debounce effect below (declaration order). When `enabled`
  // first turns true, re-baseline to whatever just loaded so no save is queued.
  useEffect(() => {
    if (enabled && !prevEnabledRef.current) {
      lastSavedRef.current = JSON.stringify(valueRef.current)
      setStatus('idle')
    }
    prevEnabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      lastSavedRef.current = JSON.stringify(value)
      return undefined
    }
    const snapshot = JSON.stringify(value)
    if (snapshot === lastSavedRef.current) return undefined

    setStatus('idle')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flush, delay)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, delay, enabled, flush])

  useEffect(() => {
    if (!enabled) return undefined
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        flush()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, flush])

  return { status, flush }
}
