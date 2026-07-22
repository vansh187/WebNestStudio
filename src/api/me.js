import { api } from '../lib/apiClient'

export const getMyProjectStatus = () => api.get('/api/me/project-status').then((r) => r.data)

export const getMyFiles = () => api.get('/api/me/files').then((r) => r.data)
