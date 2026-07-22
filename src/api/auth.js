import { api } from '../lib/apiClient'

export const signup = (payload) => api.post('/api/auth/signup', payload).then((r) => r.data)

export const verifyOtp = (payload) => api.post('/api/auth/verify-otp', payload).then((r) => r.data)

export const login = (payload) => api.post('/api/auth/login', payload).then((r) => r.data)

export const refresh = (refresh_token) =>
  api.post('/api/auth/refresh', { refresh_token }).then((r) => r.data)

export const logout = (refresh_token) =>
  api.post('/api/auth/logout', { refresh_token }).then((r) => r.data)

export const getMe = () => api.get('/api/auth/me').then((r) => r.data)
