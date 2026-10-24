import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createRelayMatcher, isRelayUrl, isSafeRelayBase, relayHostOf, relayNoticeText, relayStatusText, toRelayUrl,
} from '../src/lib/codelab/relay.js'

const BASE = 'https://webneststudiobackend-n00h.onrender.com'
const LISTING = {
  enabled: true,
  relay_path: '/api/codelab/relay',
  providers: [
    { id: 'razorpay', name: 'Razorpay', hosts: ['api.razorpay.com'], test_mode: 'key_prefix', test_key_hint: 'Use a test key that starts with rzp_test_' },
    { id: 'paypal', name: 'PayPal (sandbox)', hosts: ['API-M.Sandbox.PayPal.com'], test_mode: 'sandbox_host', test_key_hint: '' },
    { id: 'bad', name: 'Bad', hosts: ['10.0.0.5', '*.evil.com', 'localhost', 'x'.repeat(300) + '.com'] },
  ],
}
const matcher = createRelayMatcher(LISTING)

test('the provider listing keeps only well-formed public hosts', () => {
  assert.equal(matcher.enabled, true)
  assert.deepEqual([...matcher.hosts.keys()], ['api.razorpay.com', 'api-m.sandbox.paypal.com'])
  assert.deepEqual(matcher.providers.map((provider) => provider.id), ['razorpay', 'paypal'])
  assert.equal(createRelayMatcher({ enabled: false, providers: LISTING.providers }).enabled, false)
  assert.equal(createRelayMatcher(null).enabled, false)
  assert.equal(createRelayMatcher({ enabled: true, providers: 'nope' }).enabled, false)
  assert.equal(createRelayMatcher({ ...LISTING, relay_path: 'javascript:alert(1)' }).relayPath, '/api/codelab/relay')
  const many = { enabled: true, providers: Array.from({ length: 80 }, (_, i) => ({ id: `p${i}`, hosts: [`api${i}.example.com`] })) }
  assert.equal(createRelayMatcher(many).providers.length, 50)
})

test('only exact listed https hosts are rewritten to the relay', () => {
  assert.equal(toRelayUrl('https://api.razorpay.com/v1/orders?count=5', matcher, BASE), `${BASE}/api/codelab/relay/api.razorpay.com/v1/orders?count=5`)
  assert.equal(toRelayUrl('https://API.RAZORPAY.COM/v1/orders', matcher, BASE), `${BASE}/api/codelab/relay/api.razorpay.com/v1/orders`)
  assert.equal(toRelayUrl('https://api-m.sandbox.paypal.com/v1/oauth2/token', matcher, BASE), `${BASE}/api/codelab/relay/api-m.sandbox.paypal.com/v1/oauth2/token`)
  for (const url of [
    'http://api.razorpay.com/v1/orders',
    'https://api.razorpay.com:8443/v1/orders',
    'https://user:pass@api.razorpay.com/v1/orders',
    'https://api.razorpay.com.evil.com/v1/orders',
    'https://evilapi.razorpay.com/v1/orders',
    'https://api-m.paypal.com/v1/oauth2/token',
    'https://pypi.org/pypi/humanize/json',
    'not a url',
  ]) {
    assert.equal(toRelayUrl(url, matcher, BASE), null, url)
  }
  assert.equal(toRelayUrl('https://api.razorpay.com/v1/orders', createRelayMatcher(null), BASE), null)
  assert.equal(toRelayUrl('https://api.razorpay.com/v1/orders', matcher, ''), null)
})

test('relay URLs are recognised by origin and path only', () => {
  const relayed = toRelayUrl('https://api.razorpay.com/v1/orders', matcher, BASE)
  assert.equal(isRelayUrl(relayed, matcher, BASE), true)
  assert.equal(relayHostOf(relayed, matcher, BASE), 'api.razorpay.com')
  assert.equal(isRelayUrl('https://evil.com/api/codelab/relay/api.razorpay.com/v1', matcher, BASE), false)
  assert.equal(isRelayUrl(`${BASE}/api/auth/me`, matcher, BASE), false)
  assert.equal(relayHostOf('https://evil.com/x', matcher, BASE), '')
})

test('the token may only go to an https base, or http on this machine', () => {
  assert.equal(isSafeRelayBase(BASE), true)
  assert.equal(isSafeRelayBase('http://localhost:8000'), true)
  assert.equal(isSafeRelayBase('http://127.0.0.1:8000'), true)
  assert.equal(isSafeRelayBase('http://webnest.example.com'), false)
  assert.equal(isSafeRelayBase('javascript:alert(1)'), false)
})

test('notices use the server message, the hint and a fallback', () => {
  assert.equal(
    relayNoticeText('relay_live_key_blocked', { detail: 'Live keys are blocked in CodeLab.', hint: 'Use a test key that starts with rzp_test_' }),
    'Relay: Live keys are blocked in CodeLab. Use a test key that starts with rzp_test_',
  )
  assert.equal(relayNoticeText('relay_login_required', null), 'Relay: Log in to WebNest to call payment APIs from the playground.')
  assert.equal(relayNoticeText('relay_rate_limited', { detail: 'Slow down.', retry_after: 41 }), 'Relay: Slow down. (retry in 41s)')
  assert.equal(relayNoticeText('something_new', {}), 'Relay: The API relay refused this call.')
  assert.ok(relayNoticeText('x', { detail: 'a'.repeat(1000) }).length < 320)
})

test('the relay command lists providers and quota', () => {
  const text = relayStatusText(matcher, { minute_remaining: 27, day_remaining: 288 })
  assert.match(text, /Relay: on · 27 calls left this minute · 288 today/)
  assert.match(text, /Razorpay\s+api\.razorpay\.com\s+test keys: Use a test key that starts with rzp_test_/)
  assert.match(text, /PayPal \(sandbox\)\s+api-m\.sandbox\.paypal\.com\s+sandbox only/)
  assert.match(relayStatusText(matcher, null, { loggedIn: false }), /log in to WebNest/)
  assert.match(relayStatusText(createRelayMatcher(null), null), /Relay: off/)
})
