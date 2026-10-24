// Wraps the backend worker's XMLHttpRequest and fetch so calls from learner Python to a
// listed payment host go through the backend's API relay (CODELAB_API_RELAY_FRONTEND.md).
// Any failure inside a wrapper falls back to the original call, so a relay problem never
// breaks unrelated requests (PyPI installs, the learner's own API).
import {
  RELAY_ERROR_HEADER, RELAY_TOKEN_HEADER, createRelayMatcher, isSafeRelayBase, relayHostOf, relayNoticeText, toRelayUrl,
} from '../lib/codelab/relay.js'

const RELAYED = Symbol('webnestRelay')
const INSPECTED = Symbol('webnestRelayInspected')

export class RelayBridge {
  // `scope` is the worker global (tests pass a fake); `onNotice` receives
  // { code, host, text, retryAfter } whenever the relay refuses a call.
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
      this.baseUrl = typeof config?.baseUrl === 'string' && isSafeRelayBase(config.baseUrl) ? config.baseUrl : ''
      this.matcher = createRelayMatcher(config?.listing)
      this.token = typeof config?.token === 'string' ? config.token : ''
    } catch (error) {
      console.warn('Relay config ignored:', error?.message)
      this.matcher = createRelayMatcher(null)
      this.token = ''
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

  rewrite(url) {
    try {
      return toRelayUrl(url, this.matcher, this.baseUrl)
    } catch {
      return null
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
          this[RELAYED] = Boolean(relayed)
          this[INSPECTED] = false
          return open.call(this, method, relayed || url, ...rest)
        } catch (error) {
          console.warn('Relay open fallback:', error?.message)
          this[RELAYED] = false
          return open.call(this, method, url, ...rest)
        }
      }
      proto.send = function relaySend(body) {
        try {
          if (this[RELAYED]) {
            if (bridge.token) this.setRequestHeader(RELAY_TOKEN_HEADER, `Bearer ${bridge.token}`)
            this.addEventListener('loadend', () => bridge.inspectXhr(this))
          }
        } catch (error) {
          console.warn('Relay send setup failed:', error?.message)
        }
        const result = send.call(this, body)
        try {
          // A synchronous XHR (urllib3 without JSPI) has finished by now.
          if (this[RELAYED] && this.readyState === 4) bridge.inspectXhr(this)
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
      const original = typeof this.scope.fetch === 'function' ? this.scope.fetch.bind(this.scope) : null
      if (!original) return
      this.scope.fetch = async function relayFetch(input, init) {
        let request = null
        try {
          request = await bridge.relayRequest(input, init)
        } catch (error) {
          console.warn('Relay fetch fallback:', error?.message)
          request = null
        }
        if (!request) return original(input, init)
        const response = await original(request)
        try {
          await bridge.inspectFetch(response, request.url)
        } catch (error) {
          console.warn('Relay inspect failed:', error?.message)
        }
        return response
      }
    } catch (error) {
      console.warn('fetch not wrapped:', error?.message)
    }
  }

  // The rewritten Request for a fetch call, or null to send it unchanged.
  async relayRequest(input, init) {
    try {
      const RequestClass = this.scope.Request
      const isRequest = Boolean(RequestClass) && input instanceof RequestClass
      const url = isRequest ? input.url : String(input)
      const relayed = this.rewrite(url)
      if (!relayed) return null
      let options = init ?? {}
      if (isRequest) {
        // Copy the body explicitly: a Request's body stream cannot be handed on as init.
        const hasBody = !['GET', 'HEAD'].includes(input.method)
        options = { method: input.method, headers: input.headers, body: hasBody ? await input.clone().arrayBuffer() : undefined, signal: input.signal, ...init }
      }
      const headers = new this.scope.Headers(options.headers ?? {})
      if (this.token) headers.set(RELAY_TOKEN_HEADER, `Bearer ${this.token}`)
      return new RequestClass(relayed, { ...options, headers, credentials: 'omit' })
    } catch (error) {
      console.warn('Relay request not built:', error?.message)
      return null
    }
  }

  inspectXhr(xhr) {
    try {
      if (xhr[INSPECTED]) return
      xhr[INSPECTED] = true
      const code = xhr.getResponseHeader(RELAY_ERROR_HEADER)
      if (!code) return
      const text = xhr.responseType === 'arraybuffer' && xhr.response ? new TextDecoder().decode(xhr.response) : xhr.responseText
      this.notify(code, text, xhr.responseURL)
    } catch (error) {
      console.warn('Relay response not read:', error?.message)
    }
  }

  async inspectFetch(response, url) {
    try {
      const code = response?.headers?.get(RELAY_ERROR_HEADER)
      if (!code) return
      // A clone, so the learner's code can still read the body.
      this.notify(code, await response.clone().text(), response.url || url)
    } catch (error) {
      console.warn('Relay response not read:', error?.message)
    }
  }

  notify(code, text, url) {
    try {
      let body = null
      try {
        body = JSON.parse(text)
      } catch {
        body = null
      }
      const retryAfter = Number.isFinite(body?.retry_after) ? body.retry_after : null
      this.onNotice?.({ code: String(code), host: relayHostOf(url, this.matcher, this.baseUrl), text: relayNoticeText(code, body), retryAfter })
    } catch (error) {
      console.warn('Relay notice failed:', error?.message)
    }
  }
}
