// Keep this adapter independent of React so its request/response contract can be tested.

// Public, rate-limited backend route (no login); the backend proxies to the private Cloud Run runner.
export const JAVA_PLAYGROUND_ENDPOINT = 'https://webneststudiobackend-n00h.onrender.com/api/java/run'

export function normalizeJavaResult(raw) {
  if (!raw || typeof raw.status !== 'string' || !raw.compile) {
    throw new Error('The Java playground returned an invalid response.')
  }
  const phase = raw.phase === 'compile' ? 'Compilation' : 'Execution'
  const limitMessage = raw.status === 'timeout'
    ? `${phase} exceeded the time limit and was stopped.`
    : raw.status === 'output_limit' ? `${phase} stopped after reaching the output limit.` : ''
  return {
    status: raw.status === 'cancelled' ? 'stopped' : raw.status,
    stdout: raw.run?.stdout || '',
    stderr: raw.run?.stderr || '',
    compile: { stdout: raw.compile.stdout || '', stderr: raw.compile.stderr || '', exit_code: raw.compile.exitCode },
    exit_code: raw.run?.exitCode ?? null,
    signal: raw.run?.signal ?? null,
    runtime_ms: raw.durationMs ?? 0,
    truncated: Boolean(raw.compile.outputLimitExceeded || raw.run?.outputLimitExceeded),
    request_id: raw.requestId,
    notice: limitMessage,
  }
}

// Backend errors are FastAPI-style { detail } (a string, or a list for validation errors);
// the local playground uses { error }.
function errorText(data) {
  if (!data || typeof data !== 'object') return ''
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.detail)) return data.detail.map((d) => d?.msg).filter(Boolean).join(' ')
  return data.error || ''
}

function requestError(status, data) {
  const message = errorText(data) || `Java playground request failed (${status}).`
  const error = new Error(`${message}${data?.requestId ? ` Request: ${data.requestId}` : ''}`)
  error.status = status
  return error
}

// Absolute https endpoint = deployed backend route, sent through the shared axios client
// (timeouts, slow-request hint, optional auth token). Relative endpoint = local Vite proxy.
export function isRemoteEndpoint(endpoint) {
  return /^https:\/\//i.test(endpoint || '')
}

export async function executeJava(payload, { endpoint, signal, fetchImpl = fetch, httpClient } = {}) {
  if (!endpoint) throw new Error('Java execution is not configured on this site.')
  const code = payload.source ?? payload.files?.[0]?.content ?? ''
  const body = { code, className: payload.className || 'Main', stdin: payload.stdin || '', args: [] }

  if (httpClient && isRemoteEndpoint(endpoint)) {
    try {
      const { data } = await httpClient.post(endpoint, body, { signal })
      return normalizeJavaResult(data)
    } catch (err) {
      if (err?.response) throw requestError(err.response.status, err.response.data)
      throw err
    }
  }

  const response = await fetchImpl(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal, body: JSON.stringify(body),
  })
  let raw
  try { raw = await response.json() }
  catch { throw new Error('Java playground is unavailable. Start npm run dev in D:\\Playground\\java-playground, then retry.') }
  if (!response.ok) throw requestError(response.status, raw)
  return normalizeJavaResult(raw)
}
