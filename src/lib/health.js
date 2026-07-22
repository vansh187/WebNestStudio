import { api } from './apiClient'

// Fire-and-forget wake-up ping for the Render free-tier instance. Never throws.
export function wakeServer() {
  api.get('/health').catch(() => {})
}
