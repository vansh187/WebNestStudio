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
        return
      }
      try {
        const data = await authApi.refresh(refreshToken)
        setSession({ accessToken: data.access_token, refreshToken: data.refresh_token })
        const profile = await authApi.getMe()
        if (!cancelled) setStoredUser(profile)
      } catch {
        if (!cancelled) clearSession()
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
      setStoredUser(profile)
      return { ok: true, user: profile }
    } catch (error) {
      return { ok: false, error, message: getErrorDetail(error, 'Invalid email or password') }
    }
  }, [])

  const doLogout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    clearSession()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // Logout UX should never block on network failure.
      }
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
