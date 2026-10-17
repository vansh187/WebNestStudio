import { useEffect, useRef, useState } from 'react'
import { FiLoader, FiTrash2 } from 'react-icons/fi'
import { statusTone } from '../../lib/codelab/httpStyles'

const RESULT_TONE = {
  success: 'text-emerald-400',
  runtime_error: 'text-red-400',
  timeout: 'text-amber-400',
}

function Elapsed({ since }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  return <span className="tabular-nums text-ink-400">{Math.max(0, Math.round((now - since) / 1000))}s</span>
}

// The Output tab as a terminal: the last Run's result, then a running log of every
// request the API answered (from the Preview or the API tester).
export default function BackendConsole({ runner, requests, onClearRequests }) {
  const endRef = useRef(null)
  const { running, runningSince, runningHint, stopped, result, error } = runner

  useEffect(() => {
    try {
      endRef.current?.scrollIntoView({ block: 'nearest' })
    } catch {
      /* Scrolling is cosmetic. */
    }
  }, [requests.length, result])

  return (
    <div className="flex min-h-[240px] flex-1 flex-col overflow-hidden rounded-lg border border-ink-800 bg-ink-950 font-mono text-xs leading-relaxed text-ink-100">
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-ink-800 px-3 text-[11px] text-ink-400">
        <span className="font-sans font-semibold uppercase tracking-wider">Terminal</span>
        {result && (
          <span className={`font-sans font-semibold ${RESULT_TONE[result.status] ?? 'text-ink-300'}`}>
            {result.status === 'success' ? 'API ready' : result.status === 'timeout' ? 'Timed out' : 'Error'}
            {result.runtime_ms ? ` · ${result.runtime_ms} ms` : ''}
          </span>
        )}
        {requests.length > 0 && (
          <button type="button" onClick={onClearRequests} className="ml-auto inline-flex items-center gap-1 font-sans hover:text-white" title="Clear the request log">
            <FiTrash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {running && (
          <p className="flex items-center gap-2 text-ink-300">
            <FiLoader className="h-3.5 w-3.5 animate-spin text-gold-400" /> Starting your API… {runningSince && <Elapsed since={runningSince} />}
          </p>
        )}
        {running && runningHint && <p className="mt-1 text-ink-500">{runningHint}</p>}
        {!running && error && <p className="whitespace-pre-wrap text-red-400">{error}</p>}
        {!running && !result && !error && (
          <p className="text-ink-500">{stopped ? 'Stopped.' : 'Press Run (Ctrl+Enter) to start your API. Output and every request appear here.'}</p>
        )}
        {!running && result?.stdout && <pre className="whitespace-pre-wrap break-words text-ink-100">{result.stdout}</pre>}
        {!running && result?.stderr && <pre className="mt-2 whitespace-pre-wrap break-words text-red-400">{result.stderr}</pre>}

        {requests.length > 0 && (
          <div className="mt-3 border-t border-ink-800 pt-2">
            {requests.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-ink-500">{new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className="font-semibold text-ink-100">{entry.method}</span>
                <span className="text-ink-200">{entry.path}</span>
                <span className={`rounded border px-1 font-sans text-[10px] font-semibold ${statusTone(entry.status)}`}>{entry.status || 'failed'}</span>
                {typeof entry.ms === 'number' && <span className="text-ink-500">{Math.round(entry.ms)} ms</span>}
                <span className="text-ink-600">{entry.source === 'preview' ? 'preview' : 'tester'}</span>
                {entry.logs && <pre className="w-full whitespace-pre-wrap pl-4 text-ink-300">{entry.logs}</pre>}
                {entry.error && <pre className="w-full whitespace-pre-wrap pl-4 text-red-400">{entry.error}</pre>}
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  )
}
