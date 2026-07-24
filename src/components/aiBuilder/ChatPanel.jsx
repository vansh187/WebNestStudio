import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiX, FiLogIn, FiLoader, FiPlus } from 'react-icons/fi'
import CodingIcon from './CodingIcon'
import HistorySidebar from './HistorySidebar'
import GenerationChatThread from './GenerationChatThread'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getGenerationDetail } from '../../api/aiBuilder'
import { getErrorDetail } from '../../lib/apiClient'

function AuthPrompt() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-400/10 text-gold-500">
        <CodingIcon className="h-8 w-8" />
      </div>
      <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">
        Sign in to build your page
      </p>
      <p className="max-w-xs text-sm text-ink-500 dark:text-ink-300">
        WebNestAi saves your generations to your account, so you'll need to log in first.
      </p>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-gold-400 px-5 py-2.5 text-sm font-semibold text-white dark:text-ink-950"
      >
        <FiLogIn className="h-4 w-4" /> Log in
      </Link>
    </div>
  )
}

export default function ChatPanel({ onClose }) {
  const { isAuthenticated, initializing } = useAuth()
  const toast = useToast()
  const [activeId, setActiveId] = useState(null)
  const [threadData, setThreadData] = useState(null)
  const [loadingThread, setLoadingThread] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  // Only bumped on an explicit user action (New / select from history) so that
  // GenerationChatThread remounts there — NOT when a brand-new thread transitions
  // from unsaved to saved via onThreadCreated, which must keep the same instance
  // (and its in-memory messages/preview) alive.
  const [sessionKey, setSessionKey] = useState(0)

  const startNew = () => {
    setActiveId(null)
    setThreadData(null)
    setSessionKey((k) => k + 1)
  }

  const selectThread = async (id) => {
    setLoadingThread(true)
    try {
      const data = await getGenerationDetail(id)
      setThreadData(data)
      setActiveId(id)
      setSessionKey((k) => k + 1)
    } catch (error) {
      toast.error(getErrorDetail(error, 'Could not load that generation.'))
      startNew()
    } finally {
      setLoadingThread(false)
    }
  }

  const handleThreadCreated = (id) => {
    setActiveId(id)
    setRefreshKey((k) => k + 1)
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-[95] flex justify-end bg-ink-950/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-full flex-col bg-white shadow-2xl dark:bg-ink-950 sm:max-w-2xl"
      >
        <div className="flex items-center justify-between border-b border-ink-200 dark:border-ink-800 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400/10 text-gold-500">
              <CodingIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-ink-900 dark:text-white">WebNestAi</p>
              <p className="text-xs text-ink-400">WebNest Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isAuthenticated && (
              <button
                type="button"
                onClick={startNew}
                aria-label="New generation"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-900 dark:hover:text-white sm:hidden"
              >
                <FiPlus className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-900 dark:hover:text-white"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          {initializing ? (
            <div className="flex h-full items-center justify-center">
              <FiLoader className="h-6 w-6 animate-spin text-gold-500" />
            </div>
          ) : !isAuthenticated ? (
            <AuthPrompt />
          ) : (
            <div className="flex h-full">
              <div className="hidden w-56 shrink-0 sm:block">
                <HistorySidebar
                  activeId={activeId}
                  onSelect={selectThread}
                  onNew={startNew}
                  refreshKey={refreshKey}
                />
              </div>
              <div className="min-w-0 flex-1">
                {loadingThread ? (
                  <div className="flex h-full items-center justify-center">
                    <FiLoader className="h-6 w-6 animate-spin text-gold-500" />
                  </div>
                ) : (
                  <GenerationChatThread
                    key={sessionKey}
                    initialThread={threadData}
                    onThreadCreated={handleThreadCreated}
                    onGoToHistory={startNew}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
