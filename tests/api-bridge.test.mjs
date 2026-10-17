import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { API_BRIDGE_SCRIPT, API_MESSAGE_SOURCE, API_REPLY_SOURCE, toBridgeReply, toRuntimeRequest } from '../src/lib/codelab/apiBridge.js'
import { createPreviewHtml } from '../src/lib/codelab/webPreview.js'

class FakeXHR extends EventTarget {
  open(method, url) { this.real = { method, url } }
  setRequestHeader() {}
  send() { this.sentToNetwork = true }
  getResponseHeader() { return null }
  getAllResponseHeaders() { return '' }
}

// Runs the shim the way the preview iframe does, with `parent` answering through `api`.
function loadBridge(api, baseURI = 'about:srcdoc') {
  const network = []
  const window = new EventTarget()
  const parent = {
    sent: [],
    postMessage(message) {
      this.sent.push(message)
      Promise.resolve(api(message)).then((reply) => {
        const event = new Event('message')
        Object.assign(event, { source: parent, data: { source: API_REPLY_SOURCE, id: message.id, ...reply } })
        window.dispatchEvent(event)
      })
    },
  }
  window.fetch = async (input) => {
    network.push(String(input))
    return new Response('from network')
  }
  window.XMLHttpRequest = FakeXHR
  const context = vm.createContext({ window, parent, document: { baseURI }, Request, Response, Headers, URL, URLSearchParams, FormData, Blob, Event, EventTarget })
  vm.runInContext(API_BRIDGE_SCRIPT, context)
  return { window, parent, network }
}

test('fetch to /api is sent to the parent and answered with a real Response', async () => {
  const { window, parent } = loadBridge(() => ({ status: 201, reason: 'Created', headers: [['content-type', 'application/json'], ['x-id', '7']], body: '{"id":7}' }))
  const response = await window.fetch('/api/tasks?done=false', { method: 'post', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Hi' }) })
  assert.equal(response.status, 201)
  assert.equal(response.statusText, 'Created')
  assert.equal(response.headers.get('x-id'), '7')
  assert.deepEqual(await response.json(), { id: 7 })
  assert.equal(response.url, 'http://localhost:8000/api/tasks?done=false')
  const [sent] = parent.sent
  assert.equal(sent.source, API_MESSAGE_SOURCE)
  assert.equal(sent.method, 'POST')
  assert.equal(sent.path, '/api/tasks?done=false')
  assert.equal(sent.body, '{"title":"Hi"}')
  assert.ok(sent.headers.some(([key, value]) => key === 'content-type' && value === 'application/json'))
})

test('form bodies, localhost URLs and empty responses are handled', async () => {
  const { window, parent } = loadBridge((message) => (message.method === 'DELETE' ? { status: 204, headers: [], body: '' } : { status: 200, headers: [], body: 'ok' }))
  await window.fetch('http://localhost:8000/api/auth/login', { method: 'POST', body: new URLSearchParams({ username: 'a@b.c', password: 'x y' }) })
  assert.equal(parent.sent[0].path, '/api/auth/login')
  assert.equal(parent.sent[0].body, 'username=a%40b.c&password=x+y')
  assert.ok(parent.sent[0].headers.some(([key, value]) => key === 'content-type' && value.startsWith('application/x-www-form-urlencoded')))
  const form = new FormData()
  form.append('name', 'Asha')
  await window.fetch('/api/upload', { method: 'POST', body: form })
  assert.match(parent.sent[1].body, /name="name"\r\n\r\nAsha/)
  assert.ok(parent.sent[1].headers.some(([key, value]) => key === 'content-type' && value.startsWith('multipart/form-data; boundary=')))
  const removed = await window.fetch('/api/tasks/1', { method: 'DELETE' })
  assert.equal(removed.status, 204)
  assert.equal(await removed.text(), '')
})

test('other URLs still use the network, and a failed call rejects like fetch does', async () => {
  const { window, network, parent } = loadBridge(() => ({ status: 0, error: 'Run the project first' }))
  await window.fetch('https://cdn.example.com/data.json')
  await window.fetch('//cdn.example.com/x.js')
  await window.fetch('http://localhost:3000/api/x')
  assert.deepEqual(network, ['https://cdn.example.com/data.json', '//cdn.example.com/x.js', 'http://localhost:3000/api/x'])
  assert.equal(parent.sent.length, 0)
  await assert.rejects(window.fetch('/api/tasks'), (error) => error instanceof TypeError || error.name === 'TypeError')
})

test('XMLHttpRequest to /api (what axios uses) goes through the bridge', async () => {
  const { window, parent } = loadBridge(() => ({ status: 200, reason: 'OK', headers: [['content-type', 'application/json']], body: '[1,2]' }))
  const xhr = new window.XMLHttpRequest()
  const loaded = new Promise((resolve) => xhr.addEventListener('loadend', resolve))
  xhr.open('GET', '/api/numbers')
  xhr.setRequestHeader('Accept', 'application/json')
  xhr.responseType = 'json'
  xhr.send()
  await loaded
  assert.equal(xhr.readyState, 4)
  assert.equal(xhr.status, 200)
  assert.equal(JSON.stringify(xhr.response), '[1,2]') // parsed inside the vm realm
  assert.equal(xhr.getResponseHeader('Content-Type'), 'application/json')
  assert.ok(parent.sent[0].headers.some(([key]) => key.toLowerCase() === 'accept'))
  const other = new window.XMLHttpRequest()
  other.open('GET', 'https://example.com/x')
  other.send()
  assert.equal(other.sentToNetwork, true)
})

test('a Request object for /api is intercepted even though srcdoc resolves it against the site', async () => {
  const { window, parent, network } = loadBridge(() => ({ status: 201, headers: [], body: '{}' }), 'https://www.webneststudio.co.in/codelab/playground')
  const request = new Request('https://www.webneststudio.co.in/api/tasks?x=1', { method: 'POST', body: '{"title":"a"}', headers: { 'Content-Type': 'application/json' } })
  const response = await window.fetch(request)
  assert.equal(response.status, 201)
  assert.equal(parent.sent[0].path, '/api/tasks?x=1')
  assert.equal(parent.sent[0].body, '{"title":"a"}')
  assert.equal(network.length, 0)
  await window.fetch('https://cdn.example.com/lib.js')
  assert.deepEqual(network, ['https://cdn.example.com/lib.js'])
})

test('replies from any window other than the parent are ignored', async () => {
  const { window, parent } = loadBridge(() => new Promise(() => {}))
  const pending = window.fetch('/api/slow')
  const forged = new Event('message')
  Object.assign(forged, { source: {}, data: { source: API_REPLY_SOURCE, id: 1, status: 200, headers: [], body: 'forged' } })
  window.dispatchEvent(forged)
  const result = await Promise.race([pending.then(() => 'answered'), new Promise((resolve) => setTimeout(() => resolve('still waiting'), 50))])
  assert.equal(result, 'still waiting')
  assert.equal(parent.sent.length, 1)
})

test('the page side validates bridge messages before running them', () => {
  assert.deepEqual(toRuntimeRequest({ source: API_MESSAGE_SOURCE, id: 3, method: 'get', path: '/api/x', headers: [['a', 1]], body: 'b' }),
    { id: 3, spec: { method: 'GET', path: '/api/x', headers: [['a', '1']], body: 'b' } })
  assert.equal(toRuntimeRequest({ source: 'other', id: 1, path: '/' }), null)
  assert.equal(toRuntimeRequest({ source: API_MESSAGE_SOURCE, id: 'x', path: '/' }), null)
  assert.equal(toRuntimeRequest({ source: API_MESSAGE_SOURCE, id: 1, path: 'https://evil.test/' }), null)
  assert.equal(toRuntimeRequest({ source: API_MESSAGE_SOURCE, id: 1, path: '//evil.test/' }), null)
  assert.equal(toRuntimeRequest({ source: API_MESSAGE_SOURCE, id: 1, method: 'GET; rm', path: '/' }), null)
  assert.equal(toBridgeReply(1, { status: 0, error: 'boom' }).error, 'boom')
  assert.equal(toBridgeReply(1, { status: 200, body: 'x', headers: [] }).status, 200)
})

test('the backend preview reads frontend/ files and injects the bridge', () => {
  const html = createPreviewHtml([
    { name: 'frontend/index.html', content: '<h1>Tasks</h1>' },
    { name: 'frontend/style.css', content: 'h1{color:red}' },
    { name: 'frontend/script.js', content: 'console.log(1)' },
  ], { folder: 'frontend/', apiBridge: true })
  assert.match(html, /<h1>Tasks<\/h1>/)
  assert.match(html, /h1\{color:red\}/)
  assert.match(html, /webnest-codelab-api/)
  assert.doesNotMatch(createPreviewHtml([{ name: 'index.html', content: '<p>x</p>' }]), /webnest-codelab-api/)
})
