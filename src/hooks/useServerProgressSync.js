import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { bulkUpdateProgress, getMyProgress } from '../api/learning'
import { createProgressRefresher } from '../lib/learningProgress'
import { getUser } from '../lib/tokenStore'

// `currentUserKey` lets a pull that outlives its session (sign out, another login) drop its result.
const PROGRESS_API = { upload: bulkUpdateProgress, fetchProgress: getMyProgress, currentUserKey: () => getUser()?.email || null }

// Mounted once inside AuthProvider. After a login or a silent session restore, merges the
// server's lesson progress into this browser (LESSON_PROGRESS_SYNC_FRONTEND.md), and refreshes
// it when the tab regains focus (see createProgressRefresher for the timing). Failures are
// silent: the site keeps its local ticks.
export function useServerProgressSync() {
  const { isAuthenticated, user } = useAuth()
  const email = isAuthenticated ? user?.email || null : null

  useEffect(() => {
    if (!email) return undefined
    const refresher = createProgressRefresher(email, PROGRESS_API)
    refresher.pull()

    const onFocus = () => {
      if (document.visibilityState === 'hidden') return
      refresher.refresh()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [email])
}

export function ServerProgressSync() {
  useServerProgressSync()
  return null
}
