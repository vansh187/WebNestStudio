import { useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { FROZEN_EVENT, codelabEditorOpen, codelabFrozenNotice } from '../lib/codelab/idb.js'

// The lock (idb.js lockSeq) whose paused-saving notice was last shown.
const shownLock = { seq: null, toastId: null }

// When saving had to be paused without a reload, say so instead of dropping edits silently;
// once per lock, however many editors mount, and only on pages that keep CodeLab data in
// this browser (the playground, saved projects and the Agent screen; not problem pages).
// Closed again when the lock lifts.
export function useCodelabFrozenNotice() {
  const toast = useToast()
  useEffect(() => {
    const show = (paused) => {
      if (!paused?.notice) {
        if (shownLock.toastId != null) toast.dismiss(shownLock.toastId)
        shownLock.toastId = null
        return
      }
      if (paused.seq === shownLock.seq || !codelabEditorOpen()) return
      shownLock.seq = paused.seq
      shownLock.toastId = toast.error(paused.notice, { duration: 0 })
    }
    show(codelabFrozenNotice())
    const onFrozen = (event) => show(event.detail)
    window.addEventListener(FROZEN_EVENT, onFrozen)
    return () => window.removeEventListener(FROZEN_EVENT, onFrozen)
  }, [toast])
}
