import { api } from '../lib/apiClient'
import { isPrivateFile } from '../lib/codelab/backendFiles'

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

// The playground calls its HTML/CSS/JS mode 'web', but the project and share endpoints only
// know it by its older id 'javascript' (see GET /api/compiler/languages) and reject 'web'
// with "Unknown language". Translate both ways here so pages only ever see 'web'.
// The CodeLab problem endpoints (api/codelab.js) are different: their track id is 'web',
// so submissions keep sending 'web' unchanged.
const toApiLanguage = (body) => (body?.language === 'web' ? { ...body, language: 'javascript' } : body)
const fromApiLanguage = (data) => (data?.language === 'javascript' ? { ...data, language: 'web' } : data)

// The list comes back as a plain array or as { items }; keep that shape.
export const listProjects = (params) => api.get('/api/projects', { params }).then((r) => (Array.isArray(r.data)
  ? r.data.map(fromApiLanguage)
  : { ...r.data, items: r.data?.items?.map(fromApiLanguage) }))
export const getProject = (id) => api.get(`/api/projects/${id}`).then((r) => fromApiLanguage(r.data))
export const createProject = (body) => api.post('/api/projects', toApiLanguage(body)).then((r) => fromApiLanguage(r.data))
export const updateProject = (id, patch) => api.put(`/api/projects/${id}`, toApiLanguage(patch)).then((r) => fromApiLanguage(r.data))
export const deleteProject = (id) => api.delete(`/api/projects/${id}`).then((r) => r.data)

export const createShare = (body) => api.post('/api/shares', toApiLanguage(body)).then((r) => r.data)
export const getShare = (shareId) => api.get(`/api/shares/${shareId}`).then((r) => fromApiLanguage(r.data))

export const getCodingStats = () => api.get('/api/me/coding-stats').then((r) => r.data)

// Build the write payload every project/share/execute call expects: `source` is the
// documented alias the backend accepts everywhere; `files` is sent alongside it so
// endpoints that key off the files array (e.g. PUT /api/projects/:id) also work.
// Private files (.env) never leave the browser: not in shares, saved projects or runs,
// neither as a file nor as `source`. `sourceName` is the file `source` was read from
// (pick it with sourceFile below); a private one is replaced by the first shared file.
// Callers that leave `sourceName` out still get a backstop: a `source` that is a private
// file's text, and no shared file's, is replaced the same way.
export function toCodePayload({ source, sourceName, fileName, files, extra }) {
  const list = Array.isArray(files) ? files : []
  const shared = list.filter((file) => !isPrivateFile(file?.name))
  const textOf = (file) => file?.content ?? ''
  const fromPrivate = sourceName !== undefined
    ? isPrivateFile(sourceName)
    : source != null
      && list.some((file) => isPrivateFile(file?.name) && textOf(file) === source)
      && !shared.some((file) => textOf(file) === source)
  const safeSource = fromPrivate ? shared[0]?.content ?? '' : source ?? ''
  const normalizedFiles = shared.length
    ? shared.map((file) => ({
      name: file?.name || fileName || 'main.txt',
      language: file?.language,
      content: file?.content ?? '',
    }))
    : [{ name: fileName || 'main.txt', content: safeSource }]

  return {
    source: safeSource,
    files: normalizedFiles,
    ...extra,
  }
}

// The file a page sends as `source`: the open one (`selectedName`) unless it is private,
// then the first file that is not; with no `selectedName`, that first file. Null when
// `selectedName` is not among the files (a stale selection): the page then sends its own
// `source`, as it did before.
export function sourceFile(files, selectedName = null) {
  const list = Array.isArray(files) ? files : []
  if (selectedName != null) {
    const open = list.find((file) => file.name === selectedName)
    if (!open) return null
    if (!isPrivateFile(open.name)) return open
  }
  return list.find((file) => !isPrivateFile(file.name)) ?? null
}
