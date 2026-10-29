import { useCallback, useEffect, useMemo, useState } from 'react'
import { codelabLocal } from '../lib/codelab/idb.js'

// State kept in one workspace's localStorage entry, through the CodeLab gateway (idb.js):
// read again when `key` changes, so another workspace loads its own instead of carrying
// this one's over, and written back when it changes, only ever under the key it was read
// for. `read(saved)` turns the stored JSON (null when there is none, or it is hidden) into
// the state; `toSaved(state)` is the part to store. Both should be stable (module-level or
// memoized): the stored text is recomputed only when they or the state change, and nothing
// is written while it equals what is stored, or is the empty default with nothing stored.
//
// Returns [value, update]: `update(forKey, change)` applies `change(value)` only while
// `forKey` is still the open workspace, so a reply landing after a switch stays out of
// the next one.
export function useWorkspaceStorage(key, read, toSaved) {
  const [state, setState] = useState(() => ({ key, value: read(codelabLocal.getJSON(key)) }))
  let current = state
  if (state.key !== key) {
    current = { key, value: read(codelabLocal.getJSON(key)) }
    setState(current)
  }

  const serialized = useMemo(() => JSON.stringify(toSaved(current.value)), [toSaved, current.value])
  const empty = useMemo(() => JSON.stringify(toSaved(read(null))), [toSaved, read])
  useEffect(() => {
    if (state.key !== key) return
    const stored = codelabLocal.get(key)
    if (stored === serialized || (stored == null && serialized === empty)) return
    // Refused by the gateway during a wipe, a freeze or the lock.
    codelabLocal.set(key, serialized)
  }, [key, state.key, serialized, empty])

  const update = useCallback((forKey, change) => {
    setState((saved) => (saved.key === forKey ? { ...saved, value: change(saved.value) } : saved))
  }, [])
  return [current.value, update]
}
