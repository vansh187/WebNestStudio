import { api } from '../lib/apiClient'

export const generatePage = (prompt) =>
  api.post('/api/generate', { prompt }).then((r) => r.data)

export const refineGeneration = (generationId, refinement) =>
  api.post(`/api/generate/${generationId}/refine`, { refinement }).then((r) => r.data)

export const getHistory = () => api.get('/api/history').then((r) => r.data)

export const getGenerationDetail = (generationId) =>
  api.get(`/api/history/${generationId}`).then((r) => r.data)

export const getLimitStatus = () => api.get('/api/generate/limit-status').then((r) => r.data)
