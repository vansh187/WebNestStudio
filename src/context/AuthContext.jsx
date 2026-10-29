import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authApi from '../api/auth'
import { getErrorDetail } from '../lib/apiClient'
import {
  getAccessToken,
  getRefreshToken,
  getUser,
  setSession,
  setUser as setStoredUser,
  clearSession,
  subscribe,
} from '../lib/tokenStore'
import {
  claimCodelabData, confirmCodelabLogout, endCodelabSession, rememberSessionAccount, retryLockedClear,
} from '../lib/codelab/accountData'
import { codelabEditorOpen } from '../lib/codelab/idb.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(getAccessToken())
  const [user, setUser] = useState(getUser())
  const [initializing, setInitializing] = useState(true)

  useEffect(() => subscribe((s) => {
    setAccessToken(s.accessToken)
    setUser(s.user)
  }), [])

  // On app load, if a refresh token survived a reload, silently restore the session.
  useEffect(() => {
    let cancelled = false
    async function restore() {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        setInitializing(false)
        // Nobody logged in: CodeLab data an earlier logout could not clear is retried now.
        retryLockedClear().catch(() => {})
        return
      }
      try {
        const data = await authApi.refresh(refreshToken)
        setSession({ accessToken: data.access_token, refreshToken: data.refresh_token })
        const profile = await authApi.getMe()
        // The page is reloading (another account's CodeLab data was cleared): stop here.
        if (await claimCodelabData(profile?.email)) return
        rememberSessionAccount(profile?.email)
        if (!cancelled) setStoredUser(profile)
      } catch {
        rememberSessionAccount(null)
        if (!cancelled) clearSession()
        // The session ended (expired token): nobody is logged in, so as above.
        retryLockedClear().catch(() => {})
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  const doSignup = useCallback(async (payload) => {
    try {
      const account = await authApi.signup(payload)
      return { ok: true, account }
    } catch (error) {
      return { ok: false, error, message: getErrorDetail(error, 'Could not create account.') }
    }
  }, [])

  const doVerifyOtp = useCallback(async (payload) => {
    try {
      const account = await authApi.verifyOtp(payload)
      return { ok: true, account }
    } catch (error) {
      return { ok: false, error, message: getErrorDetail(error, 'Invalid or expired code.') }
    }
  }, [])

  const doLogin = useCallback(async ({ email, password }) => {
    try {
      const data = await authApi.login({ email, password })
      setSession({ accessToken: data.access_token, refreshToken: data.refresh_token })
      const profile = await authApi.getMe()
      // The page is reloading (another account's CodeLab data was cleared while a CodeLab
      // page was open): never settle, so the caller does not navigate or save meanwhile.
      if (await claimCodelabData(profile?.email)) return new Promise(() => {})
      rememberSessionAccount(profile?.email)
      setStoredUser(profile)
      return { ok: true, user: profile }
    } catch (error) {
      return { ok: false, error, message: getErrorDetail(error, 'Invalid email or password') }
    }
  }, [])

  // Resolves false when the learner cancelled (CodeLab data only this browser has).
  const doLogout = useCallback(async () => {
    const { proceed, hasData } = await confirmCodelabLogout()
    if (!proceed) return false
    // CodeLab projects are private to the account. The wipe starts first: its marker is
    // set at once, so from here every CodeLab write is refused and a CodeLab page opened
    // during the network logout below reads nothing. Whether to reload is decided now too:
    // clearSession() makes protected pages (a saved project) unmount, after which no
    // CodeLab page would count as open, yet their unmount saves still run. Only when one
    // is open does the page reload, which ends the Python worker (with its installed
    // packages) and the editor still showing the project; otherwise logout stays in-app.
    // `hasData`: already found by the question above, not looked up again.
    const wiped = endCodelabSession({ reload: codelabEditorOpen(), hasData })
    const refreshToken = getRefreshToken()
    rememberSessionAccount(null)
    clearSession()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // Logout UX should never block on network failure.
      }
    }
    if (await wiped) window.location.reload()
    return true
  }, [])

  const doDeleteAccount = useCallback(async () => {
    try {
      await authApi.deleteAccount()
      // Freeze this tab's CodeLab writes and clear its data; the caller (DeleteAccount.jsx)
      // then reloads the page, so nothing still in memory can save the deleted account's
      // data back. Before clearSession(): signing out first would swap this protected page
      // for the login screen while the wipe runs.
      await endCodelabSession({ reload: true })
      rememberSessionAccount(null)
      clearSession()
      return { ok: true }
    } catch (error) {
      return { ok: false, error, message: getErrorDetail(error, 'Could not delete your account.') }
    }
  }, [])

  const value = {
    accessToken,
    user,
    isAuthenticated: Boolean(accessToken && user),
    initializing,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
    signup: doSignup,
    verifyOtp: doVerifyOtp,
    login: doLogin,
    logout: doLogout,
    deleteAccount: doDeleteAccount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
