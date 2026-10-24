import test from 'node:test'
import assert from 'node:assert/strict'
import { RelayBridge } from '../src/workers/relayBridge.js'

const BASE = 'https://webneststudiobackend-n00h.onrender.com'
const LISTING = { enabled: true, relay_path: '/api/codelab/relay', providers: [{ id: 'razorpay', name: 'Razorpay', hosts: ['api.razorpay.com'] }] }
const RELAYED = `${BASE}/api/codelab/relay/api.razorpay.com/v1/orders`
const REFUSAL = JSON.stringify({ detail: 'Live keys are blocked in CodeLab.', code: 'relay_live_key_blocked', hint: 'Use rzp_test_' })

// A worker-like scope with a scriptable XMLHttpRequest and fetch.
function fakeScope({ errorCode = null, syncXhr = false } = {}) {
  const sent = []
  class FakeXhr {
    constructor() {
      this.headers = {}
      this.listeners = {}
      this.readyState = 0
      this.responseType = ''
    }
    open(method, url) {
      this.method = method
      this.url = url
      this.readyState = 1
    }
    setRequestHeader(name, value) {
      this.headers[name] = value
    }
    addEventListener(type, listener) {
      this.listeners[type] = listener
    }
    getResponseHeader(name) {
      return name === 'X-WebNest-Relay-Error' ? errorCode : null
    }
    send(body) {
      sent.push({ kind: 'xhr', method: this.method, url: this.url, headers: { ...this.headers }, body })
      this.readyState = 4
      this.responseText = errorCode ? REFUSAL : '{"id":"order_1"}'
      this.responseURL = this.url
      if (!syncXhr) this.listeners.loadend?.()
    }
  }
  const scope = {
    XMLHttpRequest: FakeXhr,
    Request,
    Headers,
    async fetch(input) {
      const request = input instanceof Request ? input : new Request(input)
      const body = ['GET', 'HEAD'].includes(request.method) ? '' : await request.clone().text()
      sent.push({ kind: 'fetch', method: request.method, url: request.url, headers: Object.fromEntries(request.headers), body })
      const headers = errorCode ? { 'X-WebNest-Relay-Error': errorCode } : {}
      return new Response(errorCode ? REFUSAL : '{"id":"order_1"}', { status: errorCode ? 403 : 200, headers })
    },
  }
  return { scope, sent }
}

function bridgeFor(scope, notices, token = 'webnest-token') {
  const bridge = new RelayBridge(scope, (notice) => notices.push(notice))
  bridge.install()
  bridge.configure({ baseUrl: BASE, listing: LISTING, token })
  return bridge
}

test('XHR to a listed host goes to the relay with the WebNest token; others are untouched', () => {
  const { scope, sent } = fakeScope()
  bridgeFor(scope, [])
  const relayed = new scope.XMLHttpRequest()
  relayed.open('POST', 'https://api.razorpay.com/v1/orders')
  relayed.setRequestHeader('Authorization', 'Basic abc')
  relayed.send('{"amount":50000}')
  const other = new scope.XMLHttpRequest()
  other.open('GET', 'https://pypi.org/pypi/humanize/json')
  other.send()
  assert.equal(sent[0].url, RELAYED)
  assert.equal(sent[0].headers['X-WebNest-Authorization'], 'Bearer webnest-token')
  assert.equal(sent[0].headers.Authorization, 'Basic abc', "the learner's provider key is kept")
  assert.equal(sent[1].url, 'https://pypi.org/pypi/humanize/json')
  assert.equal(sent[1].headers['X-WebNest-Authorization'], undefined)
})

test('a relay refusal produces one notice for async and for sync XHR', () => {
  for (const syncXhr of [false, true]) {
    const { scope } = fakeScope({ errorCode: 'relay_live_key_blocked', syncXhr })
    const notices = []
    bridgeFor(scope, notices)
    const xhr = new scope.XMLHttpRequest()
    xhr.open('POST', 'https://api.razorpay.com/v1/orders')
    xhr.send('{}')
    xhr.listeners.loadend?.() // a late loadend must not notify twice
    assert.equal(notices.length, 1, `syncXhr=${syncXhr}`)
    assert.deepEqual(notices[0], { code: 'relay_live_key_blocked', host: 'api.razorpay.com', text: 'Relay: Live keys are blocked in CodeLab. Use rzp_test_', retryAfter: null })
  }
})

test('fetch: string and Request inputs are relayed, bodies survive, others pass through', async () => {
  const { scope, sent } = fakeScope()
  bridgeFor(scope, [])
  await scope.fetch('https://api.razorpay.com/v1/orders', { method: 'POST', body: '{"a":1}', headers: { Authorization: 'Basic abc' } })
  await scope.fetch(new Request('https://api.razorpay.com/v1/orders', { method: 'POST', body: '{"b":2}' }))
  await scope.fetch('https://files.pythonhosted.org/x.whl')
  assert.equal(sent[0].url, RELAYED)
  assert.equal(sent[0].body, '{"a":1}')
  assert.equal(sent[0].headers.authorization, 'Basic abc')
  assert.equal(sent[0].headers['x-webnest-authorization'], 'Bearer webnest-token')
  assert.equal(sent[1].url, RELAYED)
  assert.equal(sent[1].body, '{"b":2}')
  assert.equal(sent[2].url, 'https://files.pythonhosted.org/x.whl')
  assert.equal(sent[2].headers['x-webnest-authorization'], undefined)
})

test('fetch refusals notify and leave the body readable for learner code', async () => {
  const { scope } = fakeScope({ errorCode: 'relay_live_key_blocked' })
  const notices = []
  bridgeFor(scope, notices)
  const response = await scope.fetch('https://api.razorpay.com/v1/orders', { method: 'POST', body: '{}' })
  assert.equal(notices.length, 1)
  assert.equal((await response.json()).code, 'relay_live_key_blocked')
})

test('no token when logged out, nothing relayed before configure or with an unsafe base', () => {
  const loggedOut = fakeScope()
  bridgeFor(loggedOut.scope, [], '')
  const xhr = new loggedOut.scope.XMLHttpRequest()
  xhr.open('GET', 'https://api.razorpay.com/v1/orders')
  xhr.send()
  assert.equal(loggedOut.sent[0].url, RELAYED)
  assert.equal(loggedOut.sent[0].headers['X-WebNest-Authorization'], undefined)

  const fresh = fakeScope()
  new RelayBridge(fresh.scope, () => {}).install()
  const plain = new fresh.scope.XMLHttpRequest()
  plain.open('GET', 'https://api.razorpay.com/v1/orders')
  plain.send()
  assert.equal(fresh.sent[0].url, 'https://api.razorpay.com/v1/orders')

  const unsafe = fakeScope()
  const bridge = new RelayBridge(unsafe.scope, () => {})
  bridge.install()
  bridge.configure({ baseUrl: 'http://evil.example.com', listing: LISTING, token: 'secret' })
  const leaked = new unsafe.scope.XMLHttpRequest()
  leaked.open('GET', 'https://api.razorpay.com/v1/orders')
  leaked.send()
  assert.equal(unsafe.sent[0].url, 'https://api.razorpay.com/v1/orders')
  assert.equal(unsafe.sent[0].headers['X-WebNest-Authorization'], undefined)
})

test('a failure inside the bridge falls back to the original request', () => {
  const { scope, sent } = fakeScope()
  const bridge = bridgeFor(scope, [])
  bridge.matcher = { enabled: true, hosts: { has() { throw new Error('boom') } }, relayPath: '/api/codelab/relay' }
  const xhr = new scope.XMLHttpRequest()
  xhr.open('GET', 'https://api.razorpay.com/v1/orders')
  xhr.send()
  assert.equal(sent[0].url, 'https://api.razorpay.com/v1/orders')
})

test('installing twice does not double-wrap', () => {
  const { scope, sent } = fakeScope()
  const bridge = bridgeFor(scope, [])
  bridge.install()
  const xhr = new scope.XMLHttpRequest()
  xhr.open('GET', 'https://api.razorpay.com/v1/orders')
  xhr.send()
  assert.equal(sent[0].url, RELAYED)
})
