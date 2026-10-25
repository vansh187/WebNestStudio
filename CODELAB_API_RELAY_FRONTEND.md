# Webnest CodeLab API Relay - Frontend

This document is for the frontend team. It routes payment-API calls made by learner code in the CodeLab backend playground through the backend's **API relay**, so SDKs such as `razorpay`, `stripe` and PayPal's REST client work in test mode.

`CODELAB_API_RELAY_BACKEND.md` contains the same Section 2 word for word. Do not change a URL, header, field or error code without updating both documents.

## 0. What learners get

The learner writes ordinary code. Nothing in it mentions the relay:

```python
# app/api/payment_routes.py
import os
import razorpay
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/payments", tags=["payments"])
client = razorpay.Client(auth=(os.environ["RAZORPAY_KEY_ID"], os.environ["RAZORPAY_KEY_SECRET"]))


@router.post("/orders")
def create_order(amount: int):
    try:
        return client.order.create({"amount": amount, "currency": "INR"})
    except razorpay.errors.BadRequestError as error:
        raise HTTPException(status_code=400, detail=str(error))
```

with `.env` in the project root (already supported, never pushed by GitHub sync):

```
RAZORPAY_KEY_ID=rzp_test_KEY_ID
RAZORPAY_KEY_SECRET=TEST_SECRET
```

The terminal then shows real Razorpay test responses:

```
$ pip install razorpay
Successfully installed razorpay-2.0.1
$ python -c "import os, razorpay; c = razorpay.Client(auth=(os.environ['RAZORPAY_KEY_ID'], os.environ['RAZORPAY_KEY_SECRET'])); print(c.order.create({'amount': 50000, 'currency': 'INR'})['id'])"
order_RXq3sYf0nV2kTz
$ relay
Relay: on · 27 calls left this minute · 288 today
  Razorpay           api.razorpay.com            test keys: Use a test key that starts with rzp_test_
  Stripe             api.stripe.com              test keys: Use a secret key that starts with sk_test_
  PayPal (sandbox)   api-m.sandbox.paypal.com    sandbox only
```

When the relay refuses a call, the terminal and the Run output show one clear line, for example:

```
Relay: Live keys are blocked in CodeLab. Real payments are never made from the playground. Use a test key that starts with rzp_test_
```

## 1. Decisions and code rules

Architecture:

- The rewrite happens **inside the backend runtime worker**, at the `XMLHttpRequest` and `fetch` level. Every Python HTTP library that works in Pyodide (`requests`, `urllib3`, `pyodide.http.pyfetch`) ends up there, so no SDK needs patching.
- The **provider list comes from the server** (2.1). The frontend never hard-codes a payment host.
- Only `src/hooks/useApiRuntime.js` reads the WebNest token (`tokenStore`) and talks to `apiClient`. The worker gets the token from it in a message.

Code rules (mandatory for this feature):

1. **No `static` class members.** Use instance methods on classes that receive their dependencies through the constructor, or plain exported functions.
2. **Every function body is wrapped in `try/catch`**, including event handlers and wrappers.
   - Handle the specific case first.
   - Report with context (code, host, never a key or token).
   - Fall back to the original, un-relayed behaviour when a wrapper itself fails, so a relay bug can never break unrelated requests (PyPI installs, the learner's own API).
   - Never swallow an error silently: use `console.warn` with a short message.
3. **Loose coupling:**
   - `src/lib/codelab/relay.js` is pure: no DOM, worker, React or network. It is unit-tested in Node.
   - `RelayBridge` receives the global scope and a notice callback through its constructor, so tests pass fake `XMLHttpRequest` and `fetch` classes.
   - The worker knows nothing about login. The hook knows nothing about XHR.
4. Match the existing code: same comment density, no new dependencies.

## 2. API contract

Base URL: `VITE_API_BASE_URL` (production `https://webneststudiobackend-n00h.onrender.com`). Relay base path: `/api/codelab/relay`.

### 2.0 Headers and error format

Request headers on a relayed call:

| Header | Required | Meaning |
|---|---|---|
| `X-WebNest-Authorization: Bearer <WebNest access token>` | yes | Who the learner is. **Never forwarded upstream.** |
| `Authorization` | provider-specific | The learner's **test** key for the provider. Forwarded upstream unchanged. |
| `Content-Type`, `Accept` and provider headers from the registry (e.g. `Idempotency-Key`, `Stripe-Version`, `PayPal-Request-Id`) | optional | Forwarded only if listed for that provider. |

Every **relay-generated** error carries the response header `X-WebNest-Relay-Error: <code>` and this body:

```json
{ "detail": "Human readable message.", "code": "<machine_code>" }
```

plus the extra fields listed below. An **upstream** response (including the provider's own 400/401/404) is passed through unchanged and **never** has `X-WebNest-Relay-Error`. That header is how the frontend tells "the relay refused" apart from "Razorpay said no".

| HTTP | code | When | Extra fields |
|---|---|---|---|
| 400 | `relay_bad_target` | Host or path malformed: port, user info, `..`, `//`, backslash, encoded `/` or `.` tricks, non-ASCII host | |
| 401 | `relay_login_required` | `X-WebNest-Authorization` missing, invalid or expired | |
| 403 | `relay_host_not_allowed` | Host is not in the registry (includes every **live** host such as `api-m.paypal.com`) | `host` |
| 403 | `relay_provider_disabled` | Provider exists but `enabled` is false | `provider` |
| 403 | `relay_path_not_allowed` | Path doesn't start with one of the provider's `path_prefixes` | `provider` |
| 403 | `relay_live_key_blocked` | A live credential pattern was found in a header, the query string or the body | `provider`, `hint` |
| 403 | `relay_test_key_required` | A `key_prefix` provider got no recognisable test credential | `provider`, `hint` |
| 403 | `relay_user_blocked` | The account is blocked from the relay by an admin | |
| 405 | `relay_method_not_allowed` | Method is not GET, POST, PUT, PATCH or DELETE | |
| 413 | `relay_payload_too_large` | Request body over the limit | `limit_bytes` |
| 429 | `relay_rate_limited` | Per-user minute or day quota used up, or the global day quota | `retry_after` (seconds), `scope` (`minute`, `day` or `global`) |
| 502 | `relay_upstream_unavailable` | DNS failure, connection error, TLS error or an upstream address that isn't public | `provider` |
| 502 | `relay_redirect_blocked` | Upstream answered 3xx; redirects are never followed | `provider`, `status` |
| 502 | `relay_response_too_large` | Upstream body over the limit | `limit_bytes` |
| 503 | `relay_disabled` | Relay switched off (`RELAY_ENABLED=false`) | |
| 504 | `relay_upstream_timeout` | Upstream didn't answer within the timeout | `provider`, `timeout_seconds` |

Headers on **every** relay response (success or error):

- `Cache-Control: no-store`
- `X-Content-Type-Options: nosniff`

On success, also:

- `X-WebNest-Relay-Provider: <provider id>`
- `X-WebNest-Relay-Remaining: <calls left this minute>`

`429` also sends `Retry-After`.

### 2.1 `GET /api/codelab/relay/providers`

Public (no login), `Cache-Control: public, max-age=300`. Lists **enabled** providers only, so the frontend never hard-codes hosts. Request:

```http
GET /api/codelab/relay/providers HTTP/1.1
Host: webneststudiobackend-n00h.onrender.com
```

200:

```json
{
  "enabled": true,
  "relay_path": "/api/codelab/relay",
  "limits": {
    "per_minute": 30,
    "per_day": 300,
    "max_request_bytes": 1048576,
    "max_response_bytes": 2097152,
    "timeout_seconds": 20
  },
  "providers": [
    {
      "id": "razorpay",
      "name": "Razorpay",
      "hosts": ["api.razorpay.com"],
      "test_mode": "key_prefix",
      "test_key_hint": "Use a test key that starts with rzp_test_",
      "docs_url": "https://razorpay.com/docs/api/"
    },
    {
      "id": "stripe",
      "name": "Stripe",
      "hosts": ["api.stripe.com"],
      "test_mode": "key_prefix",
      "test_key_hint": "Use a secret key that starts with sk_test_",
      "docs_url": "https://docs.stripe.com/api"
    },
    {
      "id": "paypal",
      "name": "PayPal (sandbox)",
      "hosts": ["api-m.sandbox.paypal.com"],
      "test_mode": "sandbox_host",
      "test_key_hint": "Use your PayPal sandbox app's client id and secret",
      "docs_url": "https://developer.paypal.com/api/rest/"
    }
  ]
}
```

When the relay is switched off, the response is 200 with `"enabled": false` and `"providers": []`, and the frontend relays nothing.

### 2.2 `GET /api/codelab/relay/usage`

Requires `X-WebNest-Authorization`. Request:

```http
GET /api/codelab/relay/usage HTTP/1.1
X-WebNest-Authorization: Bearer <WebNest access token>
```

200:

```json
{ "minute_remaining": 27, "day_remaining": 288, "day_resets_at": "2026-10-25T00:00:00Z" }
```

### 2.3 `GET|POST|PUT|PATCH|DELETE /api/codelab/relay/{host}/{path}`

- `{host}`: the provider host, lowercase, exactly as listed in 2.1.
- `{path}`: the provider path without the leading `/`.

The query string is forwarded unchanged. The upstream URL is always `https://{host}/{path}?{query}`.

**Sample A: Razorpay, create an order (success)**

Request from the playground:

```http
POST /api/codelab/relay/api.razorpay.com/v1/orders HTTP/1.1
Host: webneststudiobackend-n00h.onrender.com
X-WebNest-Authorization: Bearer <WebNest access token>
Authorization: Basic <base64 of rzp_test_KEY_ID:TEST_SECRET>
Content-Type: application/json

{"amount": 50000, "currency": "INR", "receipt": "rcpt_1001", "notes": {"course": "fastapi"}}
```

(`Authorization` is Basic `rzp_test_KEY_ID:TEST_SECRET`.)

The relay sends `POST https://api.razorpay.com/v1/orders` with the same `Authorization`, `Content-Type` and body, and `User-Agent: WebNest-CodeLab-Relay/1.0`. Response 200 (Razorpay's body, unchanged):

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-WebNest-Relay-Provider: razorpay
X-WebNest-Relay-Remaining: 29
Cache-Control: no-store
X-Content-Type-Options: nosniff

{"id": "order_RXq3sYf0nV2kTz", "entity": "order", "amount": 50000, "amount_paid": 0, "amount_due": 50000,
 "currency": "INR", "receipt": "rcpt_1001", "status": "created", "attempts": 0,
 "notes": {"course": "fastapi"}, "created_at": 1761300000}
```

**Sample B: Razorpay rejects the test secret (upstream error, passed through)**

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
X-WebNest-Relay-Provider: razorpay
X-WebNest-Relay-Remaining: 28

{"error": {"code": "BAD_REQUEST_ERROR", "description": "Authentication failed", "source": "NA", "step": "NA", "reason": "NA", "metadata": {}}}
```

There is no `X-WebNest-Relay-Error`, so this is Razorpay's answer. The SDK raises its normal `razorpay.errors.BadRequestError`.

**Sample C: live key (relay refuses)**

Request `Authorization: Basic <base64 of rzp_live_KEY_ID:SECRET>` (`rzp_live_...`):

```http
HTTP/1.1 403 Forbidden
X-WebNest-Relay-Error: relay_live_key_blocked
Content-Type: application/json

{"detail": "Live keys are blocked in CodeLab. Real payments are never made from the playground.",
 "code": "relay_live_key_blocked", "provider": "razorpay", "hint": "Use a test key that starts with rzp_test_"}
```

**Sample D: Stripe, create a PaymentIntent (form body)**

```http
POST /api/codelab/relay/api.stripe.com/v1/payment_intents HTTP/1.1
X-WebNest-Authorization: Bearer <WebNest access token>
Authorization: Bearer sk_test_<KEY>
Content-Type: application/x-www-form-urlencoded
Idempotency-Key: 6f1c2a9e-1b7d-4c55-9a8e-2f4b0d3c1e77

amount=50000&currency=inr&automatic_payment_methods[enabled]=true
```

200:

```json
{"id": "pi_3PqExample", "object": "payment_intent", "amount": 50000, "currency": "inr", "status": "requires_payment_method", "livemode": false, "client_secret": "pi_3PqExample_secret_abc"}
```

**Sample E: PayPal sandbox, get an access token**

```http
POST /api/codelab/relay/api-m.sandbox.paypal.com/v1/oauth2/token HTTP/1.1
X-WebNest-Authorization: Bearer <WebNest access token>
Authorization: Basic <base64 of SANDBOX_CLIENT_ID:SANDBOX_SECRET>
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
```

200 (PayPal's body). The same call to the **live** host `api-m.paypal.com`:

```http
HTTP/1.1 403 Forbidden
X-WebNest-Relay-Error: relay_host_not_allowed

{"detail": "api-m.paypal.com is not available through the CodeLab relay. Use the provider's sandbox host.",
 "code": "relay_host_not_allowed", "host": "api-m.paypal.com"}
```

**Sample F: not logged in**

```http
HTTP/1.1 401 Unauthorized
X-WebNest-Relay-Error: relay_login_required

{"detail": "Log in to WebNest to call external APIs from the playground.", "code": "relay_login_required"}
```

**Sample G: rate limited**

```http
HTTP/1.1 429 Too Many Requests
X-WebNest-Relay-Error: relay_rate_limited
Retry-After: 41

{"detail": "Relay limit reached: 30 calls a minute. Try again in 41 seconds.", "code": "relay_rate_limited", "retry_after": 41, "scope": "minute"}
```

**Sample H: upstream timeout**

```http
HTTP/1.1 504 Gateway Timeout
X-WebNest-Relay-Error: relay_upstream_timeout

{"detail": "Razorpay did not answer within 20 seconds.", "code": "relay_upstream_timeout", "provider": "razorpay", "timeout_seconds": 20}
```

**Sample I: bad target**

`GET /api/codelab/relay/api.razorpay.com/v1/../../admin`:

```http
HTTP/1.1 400 Bad Request
X-WebNest-Relay-Error: relay_bad_target

{"detail": "The relay URL is not valid.", "code": "relay_bad_target"}
```

### 2.4 CORS for relay routes

- Allowed origins: the existing frontend origins only (`https://www.webneststudio.co.in`, `http://127.0.0.1:5173`, `http://localhost:4173`). Never `*`.
- `Access-Control-Allow-Credentials`: not set (no cookies are used).
- Allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- Allowed headers: `X-WebNest-Authorization` plus the union of every enabled provider's `forward_request_headers`, listed explicitly. `Authorization` is never covered by `*`.
- Exposed headers: `X-WebNest-Relay-Error, X-WebNest-Relay-Provider, X-WebNest-Relay-Remaining, Retry-After` plus provider response headers such as `Request-Id`.
- `Access-Control-Max-Age: 600`.

## 3. How a call flows

```
learner Python  ──requests.post("https://api.razorpay.com/v1/orders")──┐
                                                                       ▼
apiRuntime.worker.js   RelayBridge (XHR/fetch wrapper)
  1. host api.razorpay.com is in the provider list → rewrite to
     {API_BASE_URL}/api/codelab/relay/api.razorpay.com/v1/orders
  2. add X-WebNest-Authorization: Bearer <token from the hook>
  3. keep the learner's Authorization (their rzp_test_ key) as is
                                                                       ▼
backend relay  ──> api.razorpay.com  ──> response passed back unchanged
                                                                       ▼
RelayBridge: if X-WebNest-Relay-Error is present → postMessage({ type: 'relayNotice', ... })
learner Python gets the response like a normal HTTP call
```

## 4. Code map

| File | Change |
|---|---|
| `src/lib/codelab/relay.js` | **New, pure.** Provider matcher, URL rewrite, notice text |
| `src/workers/relayBridge.js` | **New.** `RelayBridge` class that wraps `XMLHttpRequest` and `fetch` in the worker |
| `src/workers/apiRuntime.worker.js` | Install the bridge at start-up; new message `relayConfig`; post `relayNotice` |
| `src/workers/python/webnest_runtime.py` | `route_http_through_bridge()`: switch off urllib3's streaming worker so every request uses the wrapped XHR/fetch |
| `src/hooks/useApiRuntime.js` | Load providers, send `relayConfig` before each call, longer timeout when relaying, collect notices, `relayStatus()` |
| `src/lib/apiClient.js` | Export `API_BASE_URL` and `refreshSession()` |
| `src/lib/codelab/terminal.js` + `src/hooks/useBackendTerminal.js` | `relay` command; print notices after a command |
| `src/components/coding/BackendConsole.jsx` | Show notices in the request log |
| `tests/relay.test.mjs`, `tests/relay-bridge.test.mjs` | **New** |

## 5. Code

### 5.1 `src/lib/codelab/relay.js` (pure)

```js
// Which URLs go through the backend's API relay, and what to tell the learner when the
// relay refuses. Pure: unit-tested in Node (tests/relay.test.mjs).
const HOST = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/
const MAX_PROVIDERS = 50

// Keeps only well-formed provider entries from GET /api/codelab/relay/providers.
export function createRelayMatcher(listing) {
  try {
    if (!listing?.enabled || !Array.isArray(listing.providers)) return { hosts: new Map(), enabled: false }
    const hosts = new Map()
    for (const provider of listing.providers.slice(0, MAX_PROVIDERS)) {
      for (const host of Array.isArray(provider?.hosts) ? provider.hosts : []) {
        const clean = String(host).toLowerCase()
        if (HOST.test(clean) && !/^\d+(\.\d+)*$/.test(clean)) hosts.set(clean, provider)
      }
    }
    return { hosts, enabled: hosts.size > 0, relayPath: listing.relay_path || '/api/codelab/relay' }
  } catch (error) {
    console.warn('Relay providers could not be read:', error?.message)
    return { hosts: new Map(), enabled: false }
  }
}

// The relay URL for `url`, or null when it must go out unchanged. Exact host match only:
// no suffixes, no ports, https only.
export function toRelayUrl(url, matcher, baseUrl) {
  try {
    if (!matcher?.enabled || !baseUrl) return null
    const target = new URL(String(url))
    if (target.protocol !== 'https:' || target.port || target.username || target.password) return null
    const host = target.hostname.toLowerCase()
    if (!matcher.hosts.has(host)) return null
    const base = new URL(baseUrl)
    return `${base.origin}${matcher.relayPath}/${host}${target.pathname}${target.search}`
  } catch (error) {
    console.warn('Relay URL rewrite skipped:', error?.message)
    return null
  }
}

// True only for URLs on the relay itself: the token is attached to these and nothing else.
export function isRelayUrl(url, matcher, baseUrl) {
  try {
    const target = new URL(String(url))
    const base = new URL(baseUrl)
    return target.origin === base.origin && target.pathname.startsWith(`${matcher.relayPath}/`)
  } catch {
    return false
  }
}

const FALLBACK = {
  relay_login_required: 'Log in to WebNest to call payment APIs from the playground.',
  relay_live_key_blocked: 'Live keys are blocked in CodeLab. Use a test key.',
  relay_rate_limited: 'Relay limit reached. Try again shortly.',
}

// One line for the terminal / Run output from a relay error body.
export function relayNoticeText(code, body) {
  try {
    const detail = typeof body?.detail === 'string' ? body.detail : FALLBACK[code] || 'The API relay refused this call.'
    const hint = typeof body?.hint === 'string' ? ` ${body.hint}` : ''
    return `Relay: ${detail}${hint}`
  } catch {
    return 'Relay: the API relay refused this call.'
  }
}
```

### 5.2 `src/workers/relayBridge.js`

```js
import { createRelayMatcher, isRelayUrl, relayNoticeText, toRelayUrl } from '../lib/codelab/relay'

const TOKEN_HEADER = 'X-WebNest-Authorization'

// Wraps the worker's XMLHttpRequest and fetch so calls to listed payment hosts go through
// the backend relay. Any failure inside a wrapper falls back to the original call.
export class RelayBridge {
  constructor(scope, onNotice) {
    this.scope = scope
    this.onNotice = onNotice
    this.matcher = createRelayMatcher(null)
    this.baseUrl = ''
    this.token = ''
    this.installed = false
  }

  // { baseUrl, listing, token } from the page. token is '' when logged out.
  configure(config) {
    try {
      this.baseUrl = typeof config?.baseUrl === 'string' && this.isSafeBase(config.baseUrl) ? config.baseUrl : ''
      this.matcher = createRelayMatcher(config?.listing)
      this.token = typeof config?.token === 'string' ? config.token : ''
    } catch (error) {
      console.warn('Relay config ignored:', error?.message)
      this.matcher = createRelayMatcher(null)
    }
  }

  isSafeBase(baseUrl) {
    try {
      const url = new URL(baseUrl)
      return url.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname)
    } catch {
      return false
    }
  }

  install() {
    try {
      if (this.installed) return
      this.wrapXhr()
      this.wrapFetch()
      this.installed = true
    } catch (error) {
      console.warn('Relay bridge not installed:', error?.message)
    }
  }

  wrapXhr() {
    try {
      const bridge = this
      const proto = this.scope.XMLHttpRequest?.prototype
      if (!proto) return
      const open = proto.open
      const send = proto.send
      proto.open = function relayOpen(method, url, ...rest) {
        try {
          const relayed = bridge.rewrite(url)
          this.__webnestRelay = Boolean(relayed)
          return open.call(this, method, relayed || url, ...rest)
        } catch (error) {
          console.warn('Relay open fallback:', error?.message)
          return open.call(this, method, url, ...rest)
        }
      }
      proto.send = function relaySend(body) {
        try {
          if (this.__webnestRelay) {
            if (bridge.token) this.setRequestHeader(TOKEN_HEADER, `Bearer ${bridge.token}`)
            this.addEventListener('loadend', () => bridge.inspectXhr(this))
          }
        } catch (error) {
          console.warn('Relay send setup failed:', error?.message)
        }
        const result = send.call(this, body)
        try {
          if (this.__webnestRelay && this.readyState === 4) bridge.inspectXhr(this) // synchronous XHR
        } catch (error) {
          console.warn('Relay inspect failed:', error?.message)
        }
        return result
      }
    } catch (error) {
      console.warn('XMLHttpRequest not wrapped:', error?.message)
    }
  }

  wrapFetch() {
    try {
      const bridge = this
      const original = this.scope.fetch?.bind(this.scope)
      if (!original) return
      this.scope.fetch = async function relayFetch(input, init) {
        let request
        try {
          const url = typeof input === 'string' || input instanceof URL ? String(input) : input.url
          const relayed = bridge.rewrite(url)
          if (!relayed) return original(input, init)
          request = new Request(relayed, input instanceof Request ? input : init)
          if (init && input instanceof Request) request = new Request(request, init)
          if (bridge.token) request.headers.set(TOKEN_HEADER, `Bearer ${bridge.token}`)
        } catch (error) {
          console.warn('Relay fetch fallback:', error?.message)
          return original(input, init)
        }
        const response = await original(request)
        try {
          await bridge.inspectFetch(response)
        } catch (error) {
          console.warn('Relay inspect failed:', error?.message)
        }
        return response
      }
    } catch (error) {
      console.warn('fetch not wrapped:', error?.message)
    }
  }

  rewrite(url) {
    try {
      return toRelayUrl(url, this.matcher, this.baseUrl)
    } catch {
      return null
    }
  }

  inspectXhr(xhr) {
    try {
      if (xhr.__webnestInspected) return
      xhr.__webnestInspected = true
      const code = xhr.getResponseHeader('X-WebNest-Relay-Error')
      if (!code) return
      const text = xhr.responseType === 'arraybuffer' ? new TextDecoder().decode(xhr.response) : xhr.responseText
      this.notify(code, text, xhr.responseURL)
    } catch (error) {
      console.warn('Relay response not read:', error?.message)
    }
  }

  async inspectFetch(response) {
    try {
      const code = response.headers.get('X-WebNest-Relay-Error')
      if (!code) return
      this.notify(code, await response.clone().text(), response.url)
    } catch (error) {
      console.warn('Relay response not read:', error?.message)
    }
  }

  notify(code, text, url) {
    try {
      let body = null
      try { body = JSON.parse(text) } catch { body = null }
      const host = isRelayUrl(url, this.matcher, this.baseUrl) ? new URL(url).pathname.split('/')[4] : ''
      this.onNotice({ code, host, text: relayNoticeText(code, body), retryAfter: body?.retry_after ?? null })
    } catch (error) {
      console.warn('Relay notice failed:', error?.message)
    }
  }
}
```

Notes:
- `isRelayUrl` guards the token: it is only ever set on requests that `rewrite()` produced, and `rewrite()` only produces URLs on `baseUrl`'s origin under `relay_path`.
- Notices carry only the code, the host and the server's message, never headers or bodies the learner sent.

### 5.3 Worker (`src/workers/apiRuntime.worker.js`)

```js
import { RelayBridge } from './relayBridge'

// Installed before Pyodide loads, so every HTTP call from Python goes through it.
const relayBridge = new RelayBridge(self, (notice) => {
  try {
    self.postMessage({ type: 'relayNotice', ...notice })
  } catch (error) {
    console.warn('Relay notice not sent:', error?.message)
  }
})
relayBridge.install()

// In `handlers`:
  async relayConfig(pyodide, { baseUrl, listing, token }) {
    try {
      relayBridge.configure({ baseUrl, listing, token })
      return { ok: true }
    } catch (error) {
      throw new Error(`Relay settings could not be applied: ${error?.message ?? error}`)
    }
  },
```

`relayNotice` messages have no `id`. The hook's `onmessage` handles them before looking up a pending call, like `debugPaused`.

### 5.4 Python runtime (`src/workers/python/webnest_runtime.py`)

urllib3's Pyodide backend (`urllib3/contrib/emscripten/fetch.py`, urllib3 2.6.3 in Pyodide 314.0.6) has three paths:
- synchronous `XMLHttpRequest`
- `js.fetch` when JSPI is available
- on cross-origin-isolated pages (the debugger's page), a separate streaming **web worker**, whose requests the bridge cannot see

`requests` always asks for streaming, so switch that worker off. `send_streaming_request` then returns `None`, and urllib3 falls back to `send_request`, which uses the wrapped XHR or fetch.

```python
def route_http_through_bridge():
    """Keep urllib3 off its private streaming worker, so the relay bridge sees every call."""
    try:
        module = sys.modules.get("urllib3.contrib.emscripten.fetch")
        if module is not None and getattr(module, "_fetcher", None) is not None:
            module._fetcher = None
    except Exception as error:  # noqa: BLE001 - never block the learner's request over this
        print(f"[webnest] relay routing not applied: {error}", file=sys.stderr)
```

Call it at the start of `request()` and `run_command()`. `urllib3` is imported lazily by learner code, so checking on every call is what makes it reliable. Verify again whenever Pyodide or urllib3 is upgraded.

### 5.5 Hook (`src/hooks/useApiRuntime.js`)

```js
// While relaying, a request may wait for a Render cold start plus the provider.
const RELAY_CALL_TIMEOUT_MS = 45000

const relayListingRef = useRef(null)     // GET /providers result, loaded once per worker
const relaySentRef = useRef('')          // last config sent, so it's only re-sent on change
const [relayNotices, setRelayNotices] = useState([])

const loadRelayListing = useCallback(async () => {
  try {
    if (import.meta.env.VITE_CODELAB_RELAY !== '1') return null
    if (!relayListingRef.current) relayListingRef.current = (await api.get('/api/codelab/relay/providers')).data
    return relayListingRef.current
  } catch (error) {
    console.warn('Relay providers unavailable:', getErrorDetail(error))
    return null     // no relay: calls behave exactly as today
  }
}, [])

// Before every request, exec and run: give the worker the current token and provider list.
const syncRelay = useCallback(async () => {
  try {
    const listing = await loadRelayListing()
    const config = { baseUrl: API_BASE_URL, listing, token: getAccessToken() || '' }
    const key = JSON.stringify([config.listing?.providers?.length ?? 0, config.token])
    if (key === relaySentRef.current) return Boolean(listing?.enabled)
    await post('relayConfig', config)
    relaySentRef.current = key
    return Boolean(listing?.enabled)
  } catch (error) {
    console.warn('Relay settings not sent:', error?.message)
    return false
  }
}, [loadRelayListing, post])
```

- In `request`, `exec` and `run`, call `await syncRelay()` first. When it returns true, use `RELAY_CALL_TIMEOUT_MS` instead of `CALL_TIMEOUT_MS` / `EXEC_TIMEOUT_MS`.
- In `terminate()`, reset `relaySentRef.current = ''`, because a new worker needs the config again.
- In `spawn()`'s `onmessage`, handle `message.type === 'relayNotice'` inside `try/catch`:
  - append to `relayNotices`, keeping the last 20
  - if `code === 'relay_login_required'`, call `refreshSession()` once and reset `relaySentRef`, so the next call carries the new token
- Expose `relayNotices`, `clearRelayNotices` and `relayStatus()`. `relayStatus` returns `{ listing, usage }`, where usage comes from `GET /api/codelab/relay/usage` through `api` and is `null` when logged out.
- On logout (token becomes empty), the next `syncRelay` sends `token: ''`, so the worker forgets the old token.

### 5.6 `src/lib/apiClient.js`

```js
export const API_BASE_URL = BASE_URL

// Refreshes the WebNest session once; true when a new access token is stored.
export async function refreshSession() {
  try {
    if (!refreshPromise) refreshPromise = performRefresh().finally(() => { refreshPromise = null })
    return await refreshPromise
  } catch {
    return false
  }
}
```

### 5.7 Terminal and console

- `terminal.js`: `relay` resolves to `{ kind: 'relayStatus' }`. `useBackendTerminal` prints the format shown in Section 0, or "Relay: off" or "Log in to use the relay".
- After each terminal command, `useBackendTerminal` prints any `relayNotices` that arrived during it (tone `err`), then clears them.
- `BackendConsole`: show notices that arrive during API requests under the matching request-log row, in amber.
- Add to `HELP`: `relay   payment APIs you can call in test mode (Razorpay, Stripe, PayPal sandbox...)`.

## 6. Security (frontend side, all mandatory)

| # | Risk | Fix |
|---|---|---|
| 1 | WebNest token sent to a payment provider or any other site | The token header is only set on requests `rewrite()` produced, which always target `API_BASE_URL`'s origin under `relay_path`. Tested with a lookalike host, a different origin and a non-listed host |
| 2 | A tampered or wrong provider list turning the bridge into a redirector | Hosts validated (lowercase hostname regex, no IP literals, no wildcards, max 50); exact host equality, never `endsWith` |
| 3 | Downgrade or odd URLs | Only `https:` targets without port, user name or password are rewritten; `baseUrl` must be `https:` except `localhost`/`127.0.0.1` |
| 4 | Keys or tokens in logs | Never `console.*` a URL query, header, body, key or token. Notices carry only `code`, `host` and the server's message |
| 5 | Stale token after logout | Token is in worker memory only, replaced on every change, cleared on logout and when the worker is terminated |
| 6 | A relay bug breaking unrelated traffic (PyPI installs, the learner's own API, the Preview) | Every wrapper falls back to the original call on any error; non-listed hosts are never touched; covered by e2e |
| 7 | Requests escaping the bridge | `route_http_through_bridge()` disables urllib3's private streaming worker; e2e runs on the normal **and** the cross-origin-isolated (Debug) page |
| 8 | Live keys typed by learners | The server blocks them; the UI repeats the hint. The `.env` template already says test keys only, and `.env` is never pushed to GitHub |
| 9 | Learner frontend code (`frontend/` in the Preview) calling providers directly | Not relayed, by design. Frontend code should call the learner's own API, which calls the provider. Explain this in the Preview's CORS error hint |
| 10 | Unbounded notice growth | Keep the last 20 notices; long `detail` strings truncated to 300 characters |

## 7. Error handling map

| `code` (in `X-WebNest-Relay-Error`) | What the learner sees | Extra frontend action |
|---|---|---|
| `relay_login_required` | "Relay: Log in to WebNest to call external APIs from the playground." | `refreshSession()` once; if that fails, show a "Log in" link in the console |
| `relay_live_key_blocked`, `relay_test_key_required` | Server message + `hint` | none |
| `relay_host_not_allowed`, `relay_provider_disabled`, `relay_path_not_allowed` | Server message | Suggest the `relay` command |
| `relay_rate_limited` | Server message | Show `retry_after` |
| `relay_upstream_timeout`, `relay_upstream_unavailable`, `relay_redirect_blocked`, `relay_response_too_large` | Server message | none |
| `relay_payload_too_large`, `relay_bad_target`, `relay_method_not_allowed` | Server message | none |
| `relay_disabled` | "Relay: switched off for now." | Reset the listing so the next run reloads it |
| none (provider's own 4xx/5xx) | Nothing extra. The learner's SDK raises its normal error | none |

## 8. Configuration

| Name | Example | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `https://webneststudiobackend-n00h.onrender.com` | Existing |
| `VITE_CODELAB_RELAY` | `1` | Feature flag. Anything else means no listing request and no rewriting, so behaviour is exactly as today |

## 9. Testing

- **`tests/relay.test.mjs` (Node, pure):**
  - `createRelayMatcher`: disabled listing, bad hosts dropped, IP literals dropped, max 50
  - `toRelayUrl`: listed host, query kept, path kept, upper-case host, `http:` not rewritten, port not rewritten, `api.razorpay.com.evil.com` and `evilapi.razorpay.com` not rewritten
  - `isRelayUrl`, and `relayNoticeText` for every code
- **`tests/relay-bridge.test.mjs`** (fake scope with fake `XMLHttpRequest`, `fetch`, `Request`):
  - token header only on relayed requests
  - a non-listed host is untouched
  - a wrapper that throws falls back to the original
  - sync and async XHR both produce one notice
  - a fetch notice reads a clone, so the body stays readable
- **E2E (playwright-core + Edge on `vite build` + `vite preview`, against a local or staging backend with `VITE_CODELAB_RELAY=1`), on the normal page and on `?isolate=1`:**
  - `razorpay` create order with a test key returns an `order_...` id
  - a live key gives the live-key notice
  - logged out gives the login notice
  - PayPal live host gives host-not-allowed
  - `pip install` and the learner's own API requests still work
  - `stripe` PaymentIntent with `sk_test_` succeeds
- **Code rule checks:**
  - `grep -rn "static " src/lib/codelab/relay.js src/workers/relayBridge.js` returns nothing
  - review that every function body has a `try`

## 10. Frontend checklist

- [ ] `relay.js` + tests
- [ ] `relayBridge.js` + tests
- [ ] Worker: bridge installed, `relayConfig` handler, `relayNotice` posts
- [ ] `route_http_through_bridge()` in the runtime, called from `request()` and `run_command()`
- [ ] Hook: listing, `syncRelay`, timeouts, notices, `relayStatus`
- [ ] `apiClient` exports
- [ ] Terminal `relay` command, notices in terminal and console, help text
- [ ] All Section 6 fixes in place, e2e on both page modes
- [ ] No `static`; every function body has try/catch
- [ ] `VITE_CODELAB_RELAY=1` set on Vercel only after the backend is deployed
