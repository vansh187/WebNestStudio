import { api } from '../lib/apiClient'

export const startThread = () => api.post('/api/chat/threads').then((r) => r.data)

export const sendMessage = (threadId, message) =>
  api.post(`/api/chat/threads/${threadId}/messages`, { message }).then((r) => r.data)

export const getThreads = () => api.get('/api/chat/threads').then((r) => r.data)

export const getThread = (threadId) => api.get(`/api/chat/threads/${threadId}`).then((r) => r.data)

export const generatePlan = (threadId) =>
  api.post(`/api/chat/threads/${threadId}/generate-plan`).then((r) => r.data)

export const emailPlan = (planId, toAddress) =>
  api.post(`/api/chat/plans/${planId}/email`, toAddress ? { to_address: toAddress } : {}).then((r) => r.data)

export const getChatLimitStatus = () => api.get('/api/chat/limit-status').then((r) => r.data)

// Binary PDF download - needs the auth header attached, so a plain <a href> can't
// carry it. Fetch as a blob through the authenticated client and turn that into an
// object URL for a synthetic download click instead.
export const downloadPlanPdf = (planId) =>
  api.get(`/api/chat/plans/${planId}/pdf`, { responseType: 'blob' }).then((r) => r.data)
