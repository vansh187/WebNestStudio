import { api } from '../apiClient'

// The packages preinstalled on WebNest's Node.js runner (GET /api/node/packages), loaded once
// per page. A failed load is not kept, so the next call tries again.
let pending = null

export function nodePackages() {
  pending ??= api.get('/api/node/packages')
    .then(({ data }) => ({
      nodeVersion: typeof data?.nodeVersion === 'string' ? data.nodeVersion : '',
      packages: Array.isArray(data?.packages)
        ? data.packages.filter((item) => item && typeof item.name === 'string').map((item) => ({ name: item.name, version: String(item.version ?? '') }))
        : [],
    }))
    .catch((error) => {
      pending = null
      throw error
    })
  return pending
}
