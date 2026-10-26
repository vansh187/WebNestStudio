import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { RelayBridge } from '../src/workers/relayBridge.js'

// Real Pyodide and Pyodide's own httpx build (its default transport sends through the worker's
// fetch, or a synchronous XMLHttpRequest when JSPI is unavailable), with the real RelayBridge in
// front. Checks that learner httpx calls to a listed provider reach the relay, and that other
// calls and the learner's own API (ASGITransport) are left alone. Day 2 plan, F8.
const root = dirname(dirname(fileURLToPath(import.meta.url)))
const WHEEL = 'httpx-0.28.1-py3-none-any.whl'
const wheelPath = [join(root, 'public', 'pyodide', WHEEL), join(root, 'node_modules', '.cache', 'webnest-wheels', WHEEL)].find(existsSync)
const pyodidePath = join(root, 'node_modules', 'pyodide', 'pyodide.mjs')
const skip = !wheelPath || !existsSync(pyodidePath) ? `needs node_modules/pyodide and ${WHEEL} (run \`node scripts/copy-pyodide.mjs\`)` : false

// Placeholder provider credentials: the mock relay only checks they arrive unchanged.
const PROVIDER_AUTH = `Basic ${Buffer.from('KEY_ID:KEY_SECRET').toString('base64')}`
const TOKEN = 'webnest-session'
const LISTING = { enabled: true, relay_path: '/api/codelab/relay', providers: [{ id: 'razorpay', name: 'Razorpay', hosts: ['api.razorpay.com'] }] }

// Mock relay and "other site" on localhost. Paths containing `refuse` answer like the relay
// does when it refuses a call.
const received = []
const server = http.createServer((req, res) => {
  const chunks = []
  req.on('data', (chunk) => chunks.push(chunk))
  req.on('end', () => {
    received.push({ method: req.method, url: req.url, auth: req.headers.authorization, token: req.headers['x-webnest-authorization'], type: req.headers['content-type'], body: Buffer.concat(chunks).toString() })
    if (req.url.includes('refuse')) {
      res.writeHead(403, { 'content-type': 'application/json', 'X-WebNest-Relay-Error': 'relay_live_key_blocked' })
      res.end(JSON.stringify({ code: 'relay_live_key_blocked', detail: 'Live keys are blocked in CodeLab.' }))
      return
    }
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ path: req.url }))
  })
})

// Stand-in for the worker's synchronous XMLHttpRequest (Node has none): records what the
// bridge hands it and answers like the mock relay.
const xhrSent = []
class SyncXhr {
  constructor() { this.headers = {}; this.listeners = {}; this.readyState = 0; this.responseType = '' }
  open(method, url, isAsync) { Object.assign(this, { method, url: String(url), isAsync }); this.readyState = 1 }
  setRequestHeader(name, value) { this.headers[name.toLowerCase()] = value }
  addEventListener(type, listener) { this.listeners[type] = listener }
  getResponseHeader(name) { return name === 'X-WebNest-Relay-Error' && this.url.includes('refuse') ? 'relay_live_key_blocked' : null }
  getAllResponseHeaders() { return 'content-type: application/json\r\n' }
  send(body) {
    xhrSent.push({ method: this.method, url: this.url, sync: this.isAsync === false, headers: this.headers, body: body ? new TextDecoder().decode(body) : '' })
    const refused = this.url.includes('refuse')
    this.status = refused ? 403 : 200
    const text = refused ? JSON.stringify({ code: 'relay_live_key_blocked' }) : JSON.stringify({ path: new URL(this.url).pathname })
    this.response = new TextEncoder().encode(text).buffer
    this.responseText = text
    this.responseURL = this.url
    this.readyState = 4
  }
}

let py = null
let base = ''
const notices = []
const outside = []
let restore = () => {}

test.before(async () => {
  if (skip) return
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  base = `http://localhost:${server.address().port}`
  const realFetch = globalThis.fetch
  const hadXhr = 'XMLHttpRequest' in globalThis
  const realXhr = globalThis.XMLHttpRequest
  // The only reachable "network" is localhost; anything else is a call that skipped the relay.
  globalThis.fetch = async (input, init) => {
    const url = input instanceof Request ? input.url : String(input)
    if (!url.startsWith('http://localhost:')) {
      outside.push(url)
      throw new TypeError(`outside call blocked: ${url}`)
    }
    return realFetch(input, init)
  }
  globalThis.XMLHttpRequest = SyncXhr
  restore = () => {
    globalThis.fetch = realFetch
    if (hadXhr) globalThis.XMLHttpRequest = realXhr
    else delete globalThis.XMLHttpRequest
  }
  const bridge = new RelayBridge(globalThis, (notice) => notices.push(notice))
  bridge.install()
  bridge.configure({ baseUrl: base, listing: LISTING, token: TOKEN })
  const { loadPyodide } = await import(pathToFileURL(pyodidePath).href)
  py = await loadPyodide({ indexURL: `${dirname(pyodidePath)}/` })
  py.unpackArchive(new Uint8Array(readFileSync(wheelPath)), 'wheel')
  await py.runPythonAsync('import httpx')
})

test.after(() => {
  restore()
  server.close()
})

const reset = () => { received.length = 0; xhrSent.length = 0; notices.length = 0; outside.length = 0 }

test('async httpx GET to a listed host goes through the relay, provider auth intact', { skip }, async () => {
  reset()
  const out = await py.runPythonAsync(`
async with httpx.AsyncClient() as client:
    r = await client.get('https://api.razorpay.com/v1/orders?count=1', auth=('KEY_ID', 'KEY_SECRET'))
f"{r.status_code} {r.json()['path']}"`)
  assert.equal(out, '200 /api/codelab/relay/api.razorpay.com/v1/orders?count=1')
  assert.equal(received.length, 1)
  assert.equal(received[0].auth, PROVIDER_AUTH)
  assert.equal(received[0].token, `Bearer ${TOKEN}`)
  assert.deepEqual(outside, [])
})

test('async httpx POST keeps the JSON body and content type', { skip }, async () => {
  reset()
  const out = await py.runPythonAsync(`
async with httpx.AsyncClient() as client:
    r = await client.post('https://api.razorpay.com/v1/orders', json={'amount': 100, 'currency': 'INR'}, auth=('KEY_ID', 'KEY_SECRET'))
r.status_code`)
  assert.equal(out, 200)
  assert.equal(received[0].method, 'POST')
  assert.equal(received[0].url, '/api/codelab/relay/api.razorpay.com/v1/orders')
  assert.equal(received[0].type, 'application/json')
  assert.deepEqual(JSON.parse(received[0].body), { amount: 100, currency: 'INR' })
  assert.equal(received[0].auth, PROVIDER_AUTH)
})

test('a relay refusal reaches the learner as the response, and raises the terminal notice', { skip }, async () => {
  reset()
  const out = await py.runPythonAsync(`
async with httpx.AsyncClient() as client:
    r = await client.post('https://api.razorpay.com/v1/refuse', json={})
f"{r.status_code} {r.json()['code']}"`)
  assert.equal(out, '403 relay_live_key_blocked')
  assert.deepEqual(notices.map((notice) => [notice.code, notice.host]), [['relay_live_key_blocked', 'api.razorpay.com']])
})

test('sync httpx without JSPI (XMLHttpRequest) goes through the relay too', { skip }, async () => {
  reset()
  // Node has no JSPI, so this is the synchronous XMLHttpRequest path browsers use without it.
  assert.equal(py.runPython('from pyodide.ffi import can_run_sync; can_run_sync()'), false)
  const out = await py.runPythonAsync(`
r1 = httpx.get('https://api.razorpay.com/v1/orders', auth=('KEY_ID', 'KEY_SECRET'), timeout=10)
with httpx.Client() as client:
    r2 = client.post('https://api.razorpay.com/v1/orders', json={'amount': 100})
r3 = httpx.post('https://api.razorpay.com/v1/refuse', json={})
f"{r1.status_code} {r1.json()['path']} {r2.status_code} {r3.status_code}"`)
  assert.equal(out, '200 /api/codelab/relay/api.razorpay.com/v1/orders 200 403')
  assert.equal(xhrSent.length, 3)
  for (const sent of xhrSent) {
    assert.equal(sent.sync, true)
    assert.ok(sent.url.startsWith(`${base}/api/codelab/relay/api.razorpay.com/`), sent.url)
    assert.equal(sent.headers['x-webnest-authorization'], `Bearer ${TOKEN}`)
  }
  assert.equal(xhrSent[0].headers.authorization, PROVIDER_AUTH)
  assert.deepEqual(JSON.parse(xhrSent[1].body), { amount: 100 })
  assert.deepEqual(notices.map((notice) => notice.code), ['relay_live_key_blocked'])
})

test('calls to other hosts are not rewritten and carry no WebNest token', { skip }, async () => {
  reset()
  const out = await py.runPythonAsync(`
async with httpx.AsyncClient() as client:
    a = await client.get('${base}/direct')
    b = await client.send(client.build_request('POST', '${base}/direct-post', json={'a': 1}))
with httpx.Client() as client:
    c = client.get('https://example.org/x')
f"{a.json()['path']} {b.json()['path']} {c.json()['path']}"`)
  assert.equal(out, '/direct /direct-post /x')
  assert.deepEqual(received.map((item) => [item.url, item.token]), [['/direct', undefined], ['/direct-post', undefined]])
  assert.equal(xhrSent[0].url, 'https://example.org/x')
  assert.equal(xhrSent[0].headers['x-webnest-authorization'], undefined)
})

test("the learner's own API (ASGITransport) never touches the network or the relay", { skip }, async () => {
  reset()
  const out = await py.runPythonAsync(`
async def app(scope, receive, send):
    await send({'type': 'http.response.start', 'status': 200, 'headers': [(b'content-type', b'text/plain')]})
    await send({'type': 'http.response.body', 'body': scope['path'].encode()})

async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://localhost:8000') as client:
    r = await client.get('/tasks')
f"{r.status_code} {r.text}"`)
  assert.equal(out, '200 /tasks')
  assert.equal(received.length + xhrSent.length + outside.length, 0)
})
