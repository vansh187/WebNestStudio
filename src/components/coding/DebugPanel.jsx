import { FiAlertCircle, FiArrowUpRight, FiDatabase, FiGitBranch, FiPlay, FiSkipForward, FiSquare } from 'react-icons/fi'
import { METHOD_STYLES, statusTone } from '../../lib/codelab/httpStyles'

const UNSUPPORTED = 'This browser cannot pause the API at breakpoints (it needs cross-origin isolation, which Safari does not offer). Use Chrome, Edge or Firefox; the execution trace below still works here.'

export default function DebugPanel({ exchange, paused, armed, breakpoints = [], isolationUnsupported = false, onResume, onStop, onOpenLocation }) {
  if (!exchange && !paused && !breakpoints.length) {
    return (
      <div className="rounded-lg border border-dashed border-ink-300 p-5 text-center dark:border-ink-700">
        <FiGitBranch className="mx-auto h-5 w-5 text-ink-400" />
        <p className="mt-2 text-sm font-semibold text-ink-700 dark:text-ink-200">No request to debug yet</p>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">Click left of a Python line number (or double-click the number) to set a breakpoint. Press Debug, then send a request from the API tab or Preview.</p>
        {isolationUnsupported && <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">{UNSUPPORTED}</p>}
      </div>
    )
  }

  const { spec = {}, response = {}, source } = exchange ?? {}
  const trace = response.trace ?? { calls: [], sql: [] }
  const steps = []
  trace.calls?.forEach((call, index) => {
    steps.push({ type: 'call', ...call, index })
    trace.sql?.filter((query) => query.call === index).forEach((query) => steps.push({ type: 'sql', ...query, call }))
  })
  trace.sql?.filter((query) => query.call == null).forEach((query) => steps.push({ type: 'sql', ...query }))

  const open = (file, line) => {
    if (file && Number.isInteger(line)) onOpenLocation?.(file, line)
  }
  let locals = {}
  try { locals = paused?.locals ? JSON.parse(paused.locals) : {} } catch { locals = {} }

  return (
    <div className="flex flex-col gap-3">
      <div className={`rounded-lg border p-3 ${armed ? 'border-red-400/50 bg-red-500/5' : 'border-ink-200 dark:border-ink-800'}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${armed ? 'animate-pulse bg-red-500' : 'bg-ink-400'}`} />
          <strong className="text-xs text-ink-800 dark:text-ink-100">{paused ? 'Execution paused' : armed ? 'Debugger armed' : 'Debugger off'}</strong>
          <span className="text-[10px] text-ink-500 dark:text-ink-400">{breakpoints.length} breakpoint{breakpoints.length === 1 ? '' : 's'}</span>
          {armed && !paused && <span className="text-[10px] text-ink-500">Send a request to start debugging.</span>}
        </div>
        {paused && (
          <>
            <button type="button" onClick={() => open(paused.file, paused.line)} className="mt-2 rounded px-1 py-0.5 font-mono text-xs text-red-600 underline decoration-dotted underline-offset-2 dark:text-red-300">{paused.file}:{paused.line}</button>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button type="button" onClick={() => onResume?.(0)} className="inline-flex items-center gap-1 rounded bg-ink-900 px-2 py-1 text-[11px] font-semibold text-white dark:bg-gold-400 dark:text-ink-950"><FiPlay /> Continue <kbd className="opacity-60">F5</kbd></button>
              <button type="button" onClick={() => onResume?.(1)} className="inline-flex items-center gap-1 rounded border border-ink-300 px-2 py-1 text-[11px] font-semibold dark:border-ink-700"><FiSkipForward /> Step into <kbd className="opacity-60">F11</kbd></button>
              <button type="button" onClick={() => onResume?.(2)} className="inline-flex items-center gap-1 rounded border border-ink-300 px-2 py-1 text-[11px] font-semibold dark:border-ink-700"><FiSkipForward /> Step over <kbd className="opacity-60">F10</kbd></button>
              <button type="button" onClick={() => onResume?.(3)} className="inline-flex items-center gap-1 rounded border border-ink-300 px-2 py-1 text-[11px] font-semibold dark:border-ink-700"><FiSkipForward /> Step out <kbd className="opacity-60">⇧F11</kbd></button>
              <button type="button" onClick={onStop} className="inline-flex items-center gap-1 rounded border border-red-400/50 px-2 py-1 text-[11px] font-semibold text-red-600 dark:text-red-300"><FiSquare /> Stop API</button>
            </div>
            {Object.keys(locals).length > 0 && <pre className="mt-2 max-h-32 overflow-auto rounded bg-ink-950 p-2 font-mono text-[10px] text-ink-100">{Object.entries(locals).map(([name, value]) => `${name} = ${value}`).join('\n')}</pre>}
          </>
        )}
        {breakpoints.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {breakpoints.map((point) => (
              <li key={`${point.file}:${point.line}`}>
                <button type="button" onClick={() => open(point.file, point.line)} className="rounded bg-red-500/10 px-2 py-1 font-mono text-[10px] text-red-700 hover:bg-red-500/20 dark:text-red-300">{point.file}:{point.line}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isolationUnsupported && <p className="rounded bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">{UNSUPPORTED}</p>}
      {exchange && <header className="flex flex-wrap items-center gap-2 rounded-lg border border-ink-200 p-3 dark:border-ink-800">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${METHOD_STYLES[paused?.method ?? spec.method] ?? ''}`}>{paused?.method ?? spec.method ?? 'REQUEST'}</span>
        <code className="min-w-0 flex-1 truncate text-xs text-ink-800 dark:text-ink-100">{paused?.path ?? spec.path ?? '/'}</code>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone(paused ? 0 : response.status)}`}>{paused ? 'Paused' : response.status || 'No response'}</span>
        {!paused && typeof response.ms === 'number' && <span className="text-[10px] text-ink-400">{Math.round(response.ms)} ms</span>}
        <span className="w-full text-[10px] text-ink-400">{paused ? 'Request is paused at a breakpoint' : `Request sent from ${source === 'preview' ? 'Preview' : 'API tester'}`}</span>
      </header>}
      {!exchange && !paused && <p className="rounded-lg bg-ink-100/70 p-3 text-xs text-ink-600 dark:bg-ink-900 dark:text-ink-300">Breakpoints are set. Press Debug, then send a request from the API tab or Preview.</p>}

      {response.error && (
        <section className="rounded-lg border border-red-500/30 bg-red-500/5 p-3" aria-label="Request error">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-red-500"><FiAlertCircle /> Request error</h3>
          <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] text-red-700 dark:text-red-300">{response.error}</pre>
        </section>
      )}

      {response.logs && (
        <details className="rounded-lg border border-ink-200 px-3 py-2 dark:border-ink-800">
          <summary className="cursor-pointer text-xs font-semibold text-ink-700 dark:text-ink-200">Python output</summary>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] text-ink-600 dark:text-ink-300">{response.logs}</pre>
        </details>
      )}

      <section aria-label="Execution trace" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-800 dark:text-ink-100"><FiGitBranch /> Execution trace</h3>
          <span className="text-[10px] text-ink-400">{trace.calls?.length ?? 0} calls · {trace.sql?.length ?? 0} SQL</span>
        </div>
        {!steps.length ? (
          <p className="rounded-lg bg-ink-100/70 p-3 text-xs text-ink-500 dark:bg-ink-900 dark:text-ink-300">{exchange ? 'No user-code calls were traced. FastAPI may have returned a validation, authentication, or routing error before your handler ran.' : 'Execution will appear here when the request finishes.'}</p>
        ) : (
          <ol className="flex flex-col gap-1">
            {steps.map((step, index) => (
              <li key={`${step.type}-${index}`} style={{ paddingLeft: `${Math.min(step.depth ?? (step.call ? step.call.depth + 1 : 0), 12) * 12}px` }}>
                {step.type === 'call' ? (
                  <button type="button" onClick={() => open(step.file, step.line)} className={`flex w-full flex-wrap items-center gap-2 rounded-md border px-2 py-1.5 text-left hover:border-gold-400 ${step.error ? 'border-red-500/40 bg-red-500/5' : 'border-ink-200 dark:border-ink-800'}`}>
                    {step.error ? <FiAlertCircle className="text-red-500" /> : <FiArrowUpRight className="text-sky-500" />}
                    <code className="text-xs font-semibold text-ink-900 dark:text-white">{step.fn}()</code>
                    <span className="text-[10px] text-ink-400">{step.file}:{step.line}</span>
                    {step.ms != null && <span className="ml-auto text-[10px] text-ink-400">{step.ms} ms</span>}
                    {step.error && <span className="rounded bg-red-500/10 px-1.5 text-[10px] font-semibold text-red-500">raised {step.error}</span>}
                  </button>
                ) : (
                  <button type="button" onClick={() => open(step.call?.file, step.call?.line)} className="flex w-full items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1.5 text-left hover:border-amber-500/60">
                    <FiDatabase className="mt-0.5 shrink-0 text-amber-500" />
                    <code className="break-all text-[11px] text-amber-800 dark:text-amber-200">{step.sql}</code>
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
