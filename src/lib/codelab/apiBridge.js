// Lets the frontend in the preview iframe call the learner's in-browser FastAPI app.
// The iframe is sandboxed with an opaque origin, so the shim below forwards matching
// fetch() and XMLHttpRequest calls to the page with postMessage, and PreviewPanel answers
// them through useApiRuntime. Every other URL still goes to the real network.
export const API_MESSAGE_SOURCE = 'webnest-codelab-api'
export const API_REPLY_SOURCE = 'webnest-codelab-api-reply'
const MAX_BODY_CHARS = 1_000_000

// Runs inside the preview. Kept as plain text so it can be injected into srcdoc and
// tested in Node (tests/api-bridge.test.mjs).
export const API_BRIDGE_SCRIPT = `
(() => {
  const SOURCE = '${API_MESSAGE_SOURCE}';
  const REPLY = '${API_REPLY_SOURCE}';
  const BASE = 'http://localhost:8000';
  const pending = new Map();
  let seq = 0;
  const toUrl = (value) => { try { return new URL(String(value), BASE + '/'); } catch { return null; } };
  // A srcdoc page resolves relative URLs against the page that embeds it, so
  // new Request('/api/tasks').url points at that site. Treat that origin as the API too.
  const pageOrigin = (() => {
    try { return typeof document !== 'undefined' ? new URL(document.baseURI).origin : null; } catch { return null; }
  })();
  const isApi = (value) => {
    const text = String(value ?? '');
    if (text.startsWith('//')) return false;
    if (text.startsWith('/')) return true;
    const url = toUrl(text);
    if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:')) return false;
    return url.host === 'localhost:8000' || url.host === '127.0.0.1:8000' || (pageOrigin !== null && pageOrigin !== 'null' && url.origin === pageOrigin);
  };
  const pathOf = (value) => { const url = toUrl(value); return url.pathname + url.search; };
  const noBody = (status) => status === 101 || status === 204 || status === 205 || status === 304;
  const send = (request) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    parent.postMessage({ source: SOURCE, id, ...request }, '*');
  });
  window.addEventListener('message', (event) => {
    if (event.source !== parent) return;
    const data = event.data;
    if (!data || data.source !== REPLY) return;
    const entry = pending.get(data.id);
    if (!entry) return;
    pending.delete(data.id);
    if (!data.status) entry.reject(new TypeError(data.error || 'Failed to fetch'));
    else entry.resolve(data);
  });
  // Uses the browser's own Request to turn any body (string, FormData, URLSearchParams,
  // Blob, JSON) into text plus the matching content-type.
  const encode = async (method, headers, body) => {
    const prepared = new Request(BASE + '/', {
      method: 'POST',
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : body,
    });
    const list = [];
    prepared.headers.forEach((value, key) => list.push([key, value]));
    const text = method === 'GET' || method === 'HEAD' || body == null ? '' : await prepared.text();
    return { headers: list, body: text };
  };

  const realFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : null;
  window.fetch = async function (input, init) {
    const isRequest = typeof Request !== 'undefined' && input instanceof Request;
    const url = isRequest ? input.url : input;
    if (!isApi(url)) {
      if (realFetch) return realFetch(input, init);
      throw new TypeError('fetch is not available');
    }
    const method = String((init && init.method) || (isRequest ? input.method : 'GET')).toUpperCase();
    let encoded;
    try {
      const body = init && 'body' in init ? init.body : isRequest && method !== 'GET' && method !== 'HEAD' ? await input.clone().text() : undefined;
      encoded = await encode(method, (init && init.headers) || (isRequest ? input.headers : undefined), body);
    } catch (error) {
      throw new TypeError('Could not read the request body: ' + (error && error.message ? error.message : error));
    }
    const reply = await send({ method, path: pathOf(url), headers: encoded.headers, body: encoded.body });
    let response;
    try {
      response = new Response(noBody(reply.status) ? null : reply.body, {
        status: reply.status,
        statusText: reply.reason || '',
        headers: reply.headers || [],
      });
    } catch (error) {
      // A status or header the browser refuses (for example a header with a newline).
      throw new TypeError('The API returned a response the browser cannot use: ' + (error && error.message ? error.message : error));
    }
    Object.defineProperty(response, 'url', { value: BASE + pathOf(url) });
    return response;
  };

  const XHR = window.XMLHttpRequest;
  if (XHR) {
    const proto = XHR.prototype;
    const open = proto.open;
    const sendXhr = proto.send;
    const setHeader = proto.setRequestHeader;
    const getHeader = proto.getResponseHeader;
    const getAllHeaders = proto.getAllResponseHeaders;
    const define = (target, values) => {
      for (const [key, value] of Object.entries(values)) Object.defineProperty(target, key, { value, configurable: true, writable: true });
    };
    const fire = (target, type) => target.dispatchEvent(new Event(type));
    proto.open = function (method, url, ...rest) {
      if (!isApi(url)) {
        this.__webnest = null;
        return open.call(this, method, url, ...rest);
      }
      this.__webnest = { method: String(method).toUpperCase(), url: String(url), headers: [], response: null };
      define(this, { readyState: 1 });
      fire(this, 'readystatechange');
    };
    proto.setRequestHeader = function (name, value) {
      if (!this.__webnest) return setHeader.call(this, name, value);
      this.__webnest.headers.push([name, value]);
    };
    proto.getResponseHeader = function (name) {
      if (!this.__webnest) return getHeader.call(this, name);
      const wanted = String(name).toLowerCase();
      const found = (this.__webnest.response?.headers || []).filter(([key]) => key.toLowerCase() === wanted).map(([, value]) => value);
      return found.length ? found.join(', ') : null;
    };
    proto.getAllResponseHeaders = function () {
      if (!this.__webnest) return getAllHeaders.call(this);
      return (this.__webnest.response?.headers || []).map(([key, value]) => key + ': ' + value).join('\\r\\n');
    };
    proto.send = function (body) {
      const state = this.__webnest;
      if (!state) return sendXhr.call(this, body);
      const xhr = this;
      encode(state.method, state.headers, body)
        .then((encoded) => send({ method: state.method, path: pathOf(state.url), headers: encoded.headers, body: encoded.body }))
        .then((reply) => {
          state.response = reply;
          const text = reply.body || '';
          let response = text;
          if (xhr.responseType === 'json') { try { response = text ? JSON.parse(text) : null; } catch { response = null; } }
          define(xhr, { readyState: 4, status: reply.status, statusText: reply.reason || '', responseText: text, response, responseURL: BASE + pathOf(state.url) });
          fire(xhr, 'readystatechange');
          fire(xhr, 'load');
          fire(xhr, 'loadend');
        })
        .catch(() => {
          define(xhr, { readyState: 4, status: 0, statusText: '', responseText: '', response: null });
          fire(xhr, 'readystatechange');
          fire(xhr, 'error');
          fire(xhr, 'loadend');
        });
    };
  }
})();
`

const isHeaderList = (value) => Array.isArray(value) && value.every((pair) => Array.isArray(pair) && pair.length === 2)

// Validates a message from the preview and turns it into a runtime request spec.
// Returns null for anything that is not a well-formed bridge request.
export function toRuntimeRequest(data) {
  if (!data || data.source !== API_MESSAGE_SOURCE || !Number.isInteger(data.id)) return null
  const method = String(data.method || 'GET').toUpperCase()
  if (!/^[A-Z]{3,7}$/.test(method)) return null
  const path = String(data.path || '/')
  if (!path.startsWith('/') || path.startsWith('//')) return null
  const headers = isHeaderList(data.headers) ? data.headers.map(([key, value]) => [String(key), String(value)]).slice(0, 50) : []
  const body = typeof data.body === 'string' ? data.body.slice(0, MAX_BODY_CHARS) : ''
  return { id: data.id, spec: { method, path, headers, body } }
}

export function toBridgeReply(id, response) {
  if (!response?.status) {
    return { source: API_REPLY_SOURCE, id, status: 0, error: response?.error || 'The API did not respond.' }
  }
  return {
    source: API_REPLY_SOURCE,
    id,
    status: response.status,
    reason: response.reason || '',
    headers: Array.isArray(response.headers) ? response.headers : [],
    body: typeof response.body === 'string' ? response.body : '',
  }
}
