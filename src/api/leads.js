import { api } from '../lib/apiClient'

// One endpoint for every public form; `source` differentiates them (see API_REFERENCE.md Section 2).
export const submitLead = (payload) => api.post('/api/leads', payload).then((r) => r.data)

export const subscribeNewsletter = (payload) =>
  api.post('/api/newsletter/subscribe', payload).then((r) => r.data)
