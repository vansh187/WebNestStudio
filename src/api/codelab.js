import { api } from '../lib/apiClient'

export const listTracks = () => api.get('/api/codelab/tracks').then((r) => r.data)
export const listProblems = (params) => api.get('/api/codelab/problems', { params }).then((r) => r.data)
export const getProblem = (slug) => api.get(`/api/codelab/problems/${slug}`).then((r) => r.data)
export const submitProblem = (body) => api.post('/api/codelab/submissions', body).then((r) => r.data)
export const listMySubmissions = (params) => api.get('/api/codelab/submissions/me', { params }).then((r) => r.data)
export const getCodeLabDashboard = () => api.get('/api/codelab/dashboard').then((r) => r.data)
