// A toast shown on the next page load, for actions that reload the page (account
// deletion). ToastProvider (context/ToastContext.jsx) shows it once and forgets it.
const PENDING_KEY = 'wns-toast-after-reload'

export function toastAfterReload(type, message) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ type, message }))
  } catch {
    /* Storage blocked: the page still reloads, without the message. */
  }
}

// The pending toast ({ type, message }), or null; removed once read.
export function takePendingToast() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    sessionStorage.removeItem(PENDING_KEY)
    const pending = raw ? JSON.parse(raw) : null
    return pending && typeof pending.type === 'string' && typeof pending.message === 'string' ? pending : null
  } catch {
    return null
  }
}
