import test from 'node:test'
import assert from 'node:assert/strict'
import { executeJava, normalizeJavaResult, JAVA_PLAYGROUND_ENDPOINT } from '../src/lib/codelab/javaRunner.js'

test('Java adapter preserves both compiler streams, stack traces, and request ID', () => {
  const result = normalizeJavaResult({
    status: 'runtime_error', requestId: 'trace-123', durationMs: 1200,
    compile: { stdout: 'compiler output', stderr: 'warning', exitCode: 0 },
    run: { stdout: 'before exception', stderr: 'java.lang.IllegalStateException: test\n at Main.main(Main.java:3)', exitCode: 1 },
  })
  assert.equal(result.stdout, 'before exception')
  assert.match(result.stderr, /Main.java:3/)
  assert.equal(result.compile.stdout, 'compiler output')
  assert.equal(result.compile.stderr, 'warning')
  assert.equal(result.exit_code, 1)
  assert.equal(result.request_id, 'trace-123')
  assert.equal(result.runtime_ms, 1200)
})
test('compile failure, timeout, and truncation remain visible without runtime output', () => {
  const failure = normalizeJavaResult({ status: 'compile_error', compile: { stderr: 'Main.java:2: error', exitCode: 1 }, run: null })
  assert.equal(failure.status, 'compile_error')
  assert.equal(failure.compile.exit_code, 1)
  assert.equal(failure.stdout, '')
  const timeout = normalizeJavaResult({ status: 'timeout', phase: 'compile', compile: {} })
  assert.match(timeout.notice, /Compilation/)
  const flood = normalizeJavaResult({ status: 'output_limit', phase: 'run', compile: {}, run: { stdout: 'partial', outputLimitExceeded: true } })
  assert.equal(flood.truncated, true)
  assert.equal(flood.stdout, 'partial')
  assert.match(flood.notice, /output limit/)
})
test('frontend sends Java source, package class name, stdin, and cancellation signal', async () => {
  const controller = new AbortController()
  let request
  const fetchImpl = async (url, options) => {
    request = { url, ...options }
    return { ok: true, json: async () => ({ status: 'success', compile: {}, run: { stdout: 'ok', exitCode: 0 } }) }
  }
  const result = await executeJava({ source: 'java source', className: 'practice.Main', stdin: '42\n' }, { endpoint: '/api/java/run', signal: controller.signal, fetchImpl })
  assert.equal(request.url, '/api/java/run')
  assert.equal(request.signal, controller.signal)
  assert.deepEqual(JSON.parse(request.body), { code: 'java source', className: 'practice.Main', stdin: '42\n', args: [] })
  assert.equal(result.stdout, 'ok')
})
test('unconfigured or unavailable Java services return actionable errors', async () => {
  await assert.rejects(executeJava({ source: 'x' }), /not configured/)
  await assert.rejects(executeJava({}, { endpoint: '/api/java/run', fetchImpl: async () => ({ json: async () => { throw new Error('not JSON') } }) }), /Start npm run dev/)
  await assert.rejects(executeJava({}, { endpoint: '/api/java/run', fetchImpl: async () => ({ ok: false, status: 429, json: async () => ({ error: 'Runner is busy', requestId: 'busy-id' }) }) }), /busy-id/)
  assert.throws(() => normalizeJavaResult({}), /invalid response/)
})

const REMOTE = JAVA_PLAYGROUND_ENDPOINT
function axiosError(status, data) {
  return Object.assign(new Error(`Request failed with status code ${status}`), { isAxiosError: true, response: { status, data } })
}

test('production endpoint posts through the shared axios client without a token', async () => {
  const controller = new AbortController()
  let call
  const httpClient = { post: async (url, body, config) => {
    call = { url, body, config }
    return { data: { requestId: 'r1', status: 'success', phase: 'run', javaVersion: '17', durationMs: 900, compile: { exitCode: 0 }, run: { stdout: 'Hello', exitCode: 0 } } }
  } }
  const fetchImpl = async () => { throw new Error('fetch must not be used for the remote endpoint') }
  const result = await executeJava({ source: 'class Main {}', stdin: 'x' }, { endpoint: REMOTE, signal: controller.signal, httpClient, fetchImpl })
  assert.equal(call.url, REMOTE)
  assert.deepEqual(call.body, { code: 'class Main {}', className: 'Main', stdin: 'x', args: [] })
  assert.equal(call.config.signal, controller.signal)
  assert.equal(call.config.headers, undefined)
  assert.equal(result.stdout, 'Hello')
  assert.equal(result.request_id, 'r1')
})

test('production errors surface the backend detail and HTTP status', async () => {
  const reject = (err) => ({ post: async () => { throw err } })
  const limited = await executeJava({}, { endpoint: REMOTE, httpClient: reject(axiosError(429, { detail: 'Java playground is paused for today.' })) }).catch((e) => e)
  assert.equal(limited.status, 429)
  assert.equal(limited.message, 'Java playground is paused for today.')
  const down = await executeJava({}, { endpoint: REMOTE, httpClient: reject(axiosError(503, { detail: 'Java runner unavailable' })) }).catch((e) => e)
  assert.equal(down.status, 503)
  assert.match(down.message, /runner unavailable/)
  const invalid = await executeJava({}, { endpoint: REMOTE, httpClient: reject(axiosError(422, { detail: [{ msg: 'code is too long' }] })) }).catch((e) => e)
  assert.equal(invalid.message, 'code is too long')
  const offline = Object.assign(new Error('Network Error'), { isAxiosError: true })
  await assert.rejects(executeJava({}, { endpoint: REMOTE, httpClient: reject(offline) }), (e) => e === offline)
})

test('local relative endpoint keeps using fetch even when an axios client is supplied', async () => {
  let fetched = false
  const httpClient = { post: async () => { throw new Error('axios must not be used locally') } }
  const fetchImpl = async () => { fetched = true; return { ok: true, json: async () => ({ status: 'success', compile: {}, run: { stdout: 'local' } }) } }
  const result = await executeJava({ source: 'x' }, { endpoint: '/api/java/run', httpClient, fetchImpl })
  assert.equal(fetched, true)
  assert.equal(result.stdout, 'local')
})
