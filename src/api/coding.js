import { api } from '../lib/apiClient'

// Coding platform API — see BACKEND_API_CODING_PLATFORM.md for the full contract.
// Every wrapper returns the parsed body (`r.data`).

export const listLanguages = () => api.get('/api/compiler/languages').then((r) => r.data)

function looksCanonical(r) {
  return (
    r &&
    typeof r === 'object' &&
    typeof r.status === 'string' &&
    ('stdout' in r || 'stderr' in r || 'compile' in r)
  )
}

// The backend is meant to return the canonical execute shape (see
// BACKEND_API_CODING_PLATFORM.md §5). This adapts a raw JDoodle-style body
// ({ output, cpuTime, memory, statusCode, compilationStatus, error, ... }) into
// that shape as a safety net — if the response is already canonical it passes
// straight through untouched.
export function normalizeExecuteResult(raw) {
  if (looksCanonical(raw)) return raw
  if (!raw || typeof raw !== 'object') {
    return { status: 'internal_error', stdout: '', stderr: '', exit_code: null, signal: null, compile: null, time_ms: 0, truncated: false }
  }

  const output = typeof raw.output === 'string' ? raw.output : (raw.stdout ?? '')
  const cpuSec = parseFloat(raw.cpuTime)
  const time_ms = Number.isFinite(cpuSec) ? Math.round(cpuSec * 1000) : 0

  const compileFailed = raw.compilationStatus === 0 || raw.compilationStatus === '0'
  const apiError = raw.error != null && raw.error !== '' && String(raw.error) !== 'null'
  const rateLimited = Number(raw.statusCode) === 429 || /limit reached/i.test(String(raw.error ?? ''))

  let status = 'success'
  if (rateLimited) status = 'rate_limited'
  else if (compileFailed) status = 'compile_error'
  else if (apiError) status = 'internal_error'
  else if (raw.isExecutionSuccess === false) status = 'runtime_error'

  return {
    status,
    stdout: compileFailed ? '' : String(output),
    stderr: apiError ? String(raw.error) : '',
    exit_code: status === 'success' ? 0 : status === 'runtime_error' ? 1 : null,
    signal: null,
    compile: compileFailed
      ? { stdout: '', stderr: String(output || 'Compilation failed'), exit_code: 1 }
      : null,
    time_ms,
    truncated: false,
    memory: raw.memory,
  }
}

// `config` lets callers pass an AbortController signal (see useCodeRunner).
export const executeCode = (payload, config) =>
  api.post('/api/compiler/execute', payload, config).then((r) => normalizeExecuteResult(r.data))

export const listProjects = (params) => api.get('/api/projects', { params }).then((r) => r.data)
export const getProject = (id) => api.get(`/api/projects/${id}`).then((r) => r.data)
export const createProject = (body) => api.post('/api/projects', body).then((r) => r.data)
export const updateProject = (id, patch) => api.put(`/api/projects/${id}`, patch).then((r) => r.data)
export const deleteProject = (id) => api.delete(`/api/projects/${id}`).then((r) => r.data)

export const createShare = (body) => api.post('/api/shares', body).then((r) => r.data)
export const getShare = (shareId) => api.get(`/api/shares/${shareId}`).then((r) => r.data)

export const getCodingStats = () => api.get('/api/me/coding-stats').then((r) => r.data)

// Build the write payload every project/share/execute call expects: `source` is the
// documented alias the backend accepts everywhere; `files` is sent alongside it so
// endpoints that key off the files array (e.g. PUT /api/projects/:id) also work.
export function toCodePayload({ source, fileName, files, extra }) {
  const normalizedFiles = Array.isArray(files) && files.length
    ? files.map((file) => ({
      name: file?.name || fileName || 'main.txt',
      language: file?.language,
      content: file?.content ?? '',
    }))
    : [{ name: fileName || 'main.txt', content: source ?? '' }]

  return {
    source: source ?? '',
    files: normalizedFiles,
    ...extra,
  }
}
