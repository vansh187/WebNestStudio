import { useEffect, useMemo, useState } from 'react'
import { FiLoader, FiLock, FiPlus, FiSend, FiTrash2, FiUnlock, FiZap } from 'react-icons/fi'
import { EmptyState } from '../states/StateViews'
import { buildPath, formatBody, groupByTag, listEndpoints, requestTemplate } from '../../lib/codelab/openapi'
import { METHOD_STYLES, statusTone } from '../../lib/codelab/httpStyles'

const INPUT = 'w-full min-w-0 rounded-md border border-ink-200 bg-white px-2 py-1.5 font-mono text-xs text-ink-900 outline-none focus:border-gold-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white'
const LABEL = 'text-[11px] font-semibold uppercase tracking-widest text-ink-400'
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const HISTORY_LIMIT = 15

function loadState(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? {}
  } catch {
    return {}
  }
}

export default function ApiClientPanel({ openapi, ready, onSend, storageKey, className = '', embedded = false }) {
  const endpoints = useMemo(() => listEndpoints(openapi), [openapi])
  const groups = useMemo(() => groupByTag(endpoints), [endpoints])
  const saved = useMemo(() => loadState(storageKey), [storageKey])
  const [selected, setSelected] = useState(null)
  const [method, setMethod] = useState('GET')
  const [pathTemplate, setPathTemplate] = useState('/api/health')
  const [pathParams, setPathParams] = useState([])
  const [query, setQuery] = useState([])
  const [headers, setHeaders] = useState([])
  const [contentType, setContentType] = useState('application/json')
  const [body, setBody] = useState('')
  const [token, setToken] = useState(saved.token ?? '')
  const [history, setHistory] = useState(saved.history ?? [])
  const [response, setResponse] = useState(null)
  const [view, setView] = useState('body')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ token, history }))
    } catch {
      /* Storage can be unavailable; the tester keeps working for this visit. */
    }
  }, [storageKey, token, history])

  const choose = (endpoint) => {
    const template = requestTemplate(endpoint, openapi)
    setSelected(endpoint.id)
    setMethod(template.method)
    setPathTemplate(template.pathTemplate)
    setPathParams(template.pathParams)
    setQuery(template.query)
    setContentType(template.contentType || 'application/json')
    setBody(template.body)
    setNotice('')
  }

  const path = buildPath(pathTemplate, pathParams, query)
  const hasBody = BODY_METHODS.has(method) && contentType !== 'none'

  const send = async () => {
    const list = headers.filter(([key]) => key.trim()).map(([key, value]) => [key.trim(), value])
    if (hasBody && contentType) list.push(['content-type', contentType])
    if (token.trim() && !list.some(([key]) => key.toLowerCase() === 'authorization')) list.push(['authorization', `Bearer ${token.trim()}`])
    const spec = { method, path, headers: list, body: hasBody ? body : '' }
    setSending(true)
    setNotice('')
    try {
      let result
      try {
        result = await onSend(spec)
      } catch (error) {
        result = { status: 0, error: error?.message || 'The request failed.', body: '', headers: [] }
      }
      setResponse(result)
      setView(result.error ? 'error' : 'body')
      setHistory((items) => [{ method, pathTemplate, pathParams, query, contentType, body, status: result.status, at: Date.now() }, ...items].slice(0, HISTORY_LIMIT))
      // Save the token from a login response so protected routes work straight away.
      if (result.status === 200 && /json/.test(result.headers?.find(([key]) => key === 'content-type')?.[1] ?? '')) {
        try {
          const data = JSON.parse(result.body)
          if (typeof data?.access_token === 'string') {
            setToken(data.access_token)
            setNotice('Token saved. Protected routes now send it as Authorization: Bearer.')
          }
        } catch {
          /* Not JSON after all. */
        }
      }
    } finally {
      setSending(false)
    }
  }

  const restore = (item) => {
    setSelected(null)
    setMethod(item.method)
    setPathTemplate(item.pathTemplate)
    setPathParams(item.pathParams ?? [])
    setQuery(item.query ?? [])
    setContentType(item.contentType || 'application/json')
    setBody(item.body ?? '')
  }

  const formatted = response ? formatBody(response.body, response.headers) : ''

  return (
    <div className={`flex flex-col gap-3 ${embedded ? '' : 'rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40'} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={`font-display text-sm font-semibold text-ink-900 dark:text-white ${embedded ? 'sr-only' : ''}`}>API tester</h2>
        <span className="text-[11px] text-ink-400">{ready ? `${endpoints.length} endpoints` : 'Run the project to load your API'}</span>
      </div>

      {!ready && !endpoints.length ? (
        <EmptyState icon={FiZap} title="Your API is not running yet" description="Press Run. Your routes appear here and you can send requests to them." />
      ) : (
        <>
          <details open className="rounded-lg border border-ink-200 dark:border-ink-800">
            <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold text-ink-700 dark:text-ink-200">Endpoints</summary>
            <div className="max-h-56 overflow-auto px-2 pb-2">
              {groups.map((group) => (
                <div key={group.tag} className="mt-1">
                  <p className="px-1 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-400">{group.tag}</p>
                  <ul>
                    {group.items.map((endpoint) => (
                      <li key={endpoint.id}>
                        <button
                          type="button"
                          onClick={() => choose(endpoint)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-ink-50 dark:hover:bg-ink-800 ${selected === endpoint.id ? 'bg-ink-50 dark:bg-ink-800' : ''}`}
                        >
                          <span className={`w-14 shrink-0 rounded px-1.5 py-0.5 text-center text-[10px] font-bold ${METHOD_STYLES[endpoint.method]}`}>{endpoint.method}</span>
                          <span className="min-w-0 flex-1 truncate font-mono text-ink-800 dark:text-ink-100">{endpoint.path}</span>
                          {endpoint.secured && <FiLock className="h-3 w-3 shrink-0 text-ink-400" aria-label="Needs a token" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>

          <form onSubmit={(event) => { event.preventDefault(); send() }} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <select value={method} onChange={(event) => setMethod(event.target.value)} aria-label="Method" className={`${INPUT.replace('w-full ', '')} w-24 shrink-0 font-semibold`}>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((item) => <option key={item}>{item}</option>)}
              </select>
              <input
                value={path}
                onChange={(event) => { setPathTemplate(event.target.value); setPathParams([]); setQuery([]) }}
                aria-label="Path"
                spellCheck={false}
                className={INPUT}
              />
              <button type="submit" disabled={sending || !ready} className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-700 disabled:opacity-50 dark:bg-gold-500 dark:text-ink-950 dark:hover:bg-gold-400">
                {sending ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiSend className="h-3.5 w-3.5" />} Send
              </button>
            </div>

            {pathParams.length > 0 && (
              <fieldset className="flex flex-col gap-1.5">
                <legend className={LABEL}>Path parameters</legend>
                {pathParams.map((param, index) => (
                  <label key={param.name} className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300">
                    <span className="w-24 shrink-0 font-mono">{param.name}</span>
                    <input value={param.value} onChange={(event) => setPathParams(pathParams.map((item, i) => (i === index ? { ...item, value: event.target.value } : item)))} className={INPUT} />
                  </label>
                ))}
              </fieldset>
            )}

            {query.length > 0 && (
              <fieldset className="flex flex-col gap-1.5">
                <legend className={LABEL}>Query parameters</legend>
                {query.map((param, index) => (
                  <div key={param.name} className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300">
                    <input type="checkbox" checked={param.enabled} onChange={(event) => setQuery(query.map((item, i) => (i === index ? { ...item, enabled: event.target.checked } : item)))} aria-label={`Send ${param.name}`} />
                    <span className="w-20 shrink-0 font-mono">{param.name}</span>
                    <input value={param.value} onChange={(event) => setQuery(query.map((item, i) => (i === index ? { ...item, value: event.target.value, enabled: true } : item)))} className={INPUT} aria-label={`${param.name} value`} />
                  </div>
                ))}
              </fieldset>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="api-token" className={`${LABEL} flex items-center gap-1`}>
                {token ? <FiLock className="h-3 w-3" /> : <FiUnlock className="h-3 w-3" />} Authorize (Bearer token)
              </label>
              <div className="flex gap-2">
                <input id="api-token" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Log in through the API to fill this in" spellCheck={false} className={INPUT} />
                {token && <button type="button" onClick={() => setToken('')} className="shrink-0 rounded-md px-2 text-xs font-semibold text-ink-500 hover:text-red-500">Clear</button>}
              </div>
            </div>

            <details className="rounded-lg border border-ink-200 px-3 py-2 dark:border-ink-800">
              <summary className="cursor-pointer select-none text-xs font-semibold text-ink-600 dark:text-ink-300">Headers {headers.length ? `(${headers.length})` : ''}</summary>
              <div className="mt-2 flex flex-col gap-1.5">
                {headers.map(([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <input value={key} onChange={(event) => setHeaders(headers.map((item, i) => (i === index ? [event.target.value, item[1]] : item)))} placeholder="Name" aria-label="Header name" className={INPUT} />
                    <input value={value} onChange={(event) => setHeaders(headers.map((item, i) => (i === index ? [item[0], event.target.value] : item)))} placeholder="Value" aria-label="Header value" className={INPUT} />
                    <button type="button" onClick={() => setHeaders(headers.filter((_, i) => i !== index))} className="shrink-0 text-ink-400 hover:text-red-500" aria-label="Remove header"><FiTrash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setHeaders([...headers, ['', '']])} className="inline-flex items-center gap-1 self-start text-xs font-semibold text-gold-600 dark:text-gold-400"><FiPlus className="h-3.5 w-3.5" /> Add header</button>
              </div>
            </details>

            {BODY_METHODS.has(method) && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="api-body" className={LABEL}>Body</label>
                  <select value={contentType} onChange={(event) => setContentType(event.target.value)} aria-label="Body type" className="rounded-md border border-ink-200 bg-white px-1.5 py-1 text-[11px] dark:border-ink-700 dark:bg-ink-900">
                    <option value="application/json">JSON</option>
                    <option value="application/x-www-form-urlencoded">Form (urlencoded)</option>
                    <option value="none">No body</option>
                  </select>
                </div>
                {hasBody && (
                  <textarea id="api-body" value={body} onChange={(event) => setBody(event.target.value)} rows={6} spellCheck={false} className={`${INPUT} resize-y leading-relaxed`} />
                )}
              </div>
            )}
          </form>

          {notice && <p className="rounded-lg bg-emerald-500/10 p-2 text-xs text-emerald-600 dark:text-emerald-400">{notice}</p>}

          {response && (
            <section aria-label="Response" className="flex flex-col gap-2 border-t border-ink-200 pt-3 dark:border-ink-800">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-400">
                <span className={`rounded-full border px-2 py-0.5 font-semibold ${statusTone(response.status)}`}>
                  {response.status ? `${response.status} ${response.reason ?? ''}` : 'No response'}
                </span>
                {typeof response.ms === 'number' && <span>{Math.round(response.ms)} ms</span>}
                {response.body ? <span>{new TextEncoder().encode(response.body).length} bytes</span> : null}
                <div className="ml-auto flex gap-1" role="tablist" aria-label="Response details">
                  {['body', 'headers', 'logs', ...(response.error ? ['error'] : [])].map((item) => (
                    <button key={item} type="button" role="tab" aria-selected={view === item} onClick={() => setView(item)} className={`rounded px-2 py-0.5 font-semibold capitalize ${view === item ? 'bg-ink-100 text-ink-900 dark:bg-ink-800 dark:text-white' : 'hover:text-ink-700'}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <pre className={`max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-ink-50 p-3 font-mono text-xs leading-relaxed dark:bg-ink-900 ${view === 'error' ? 'text-red-500' : 'text-ink-800 dark:text-ink-100'}`}>
                {view === 'body' && (formatted || (response.status === 204 ? '(204 No Content: empty body)' : response.error || '(empty body)'))}
                {view === 'headers' && (response.headers ?? []).map(([key, value]) => `${key}: ${value}`).join('\n')}
                {view === 'logs' && (response.logs || 'Nothing was printed during this request.')}
                {view === 'error' && response.error}
              </pre>
            </section>
          )}

          {history.length > 0 && (
            <details className="rounded-lg border border-ink-200 px-3 py-2 dark:border-ink-800">
              <summary className="cursor-pointer select-none text-xs font-semibold text-ink-600 dark:text-ink-300">History</summary>
              <ul className="mt-2 flex flex-col gap-1">
                {history.map((item) => (
                  <li key={item.at}>
                    <button type="button" onClick={() => restore(item)} className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-xs hover:bg-ink-50 dark:hover:bg-ink-800">
                      <span className={`w-14 shrink-0 rounded px-1 text-center text-[10px] font-bold ${METHOD_STYLES[item.method] ?? ''}`}>{item.method}</span>
                      <span className="min-w-0 flex-1 truncate font-mono">{buildPath(item.pathTemplate, item.pathParams, item.query)}</span>
                      <span className={`rounded-full border px-1.5 text-[10px] ${statusTone(item.status)}`}>{item.status || 'err'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  )
}
