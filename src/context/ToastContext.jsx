import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi'

const ToastContext = createContext(null)

const ICONS = {
  success: FiCheckCircle,
  error: FiAlertTriangle,
  info: FiInfo,
}

const ACCENTS = {
  success: 'border-emerald-400/40 text-emerald-500',
  error: 'border-red-400/40 text-red-500',
  info: 'border-gold-400/40 text-gold-500',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((type, message, { duration = 5000 } = {}) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, type, message }])
    if (duration) setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  const toast = {
    success: (message, opts) => push('success', message, opts),
    error: (message, opts) => push('error', message, opts),
    info: (message, opts) => push('info', message, opts),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] ?? FiInfo
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white dark:bg-ink-900 px-4 py-3 shadow-xl ${ACCENTS[t.type]}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm text-ink-700 dark:text-ink-100">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="text-ink-400 hover:text-ink-600 dark:hover:text-ink-100"
                aria-label="Dismiss"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
