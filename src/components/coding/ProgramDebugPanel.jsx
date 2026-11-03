import { useState } from 'react'
import { FiAlertCircle, FiArrowUpRight, FiGitBranch } from 'react-icons/fi'
import { DebugControls, FrameView } from './DebugPanel'

const UNSUPPORTED = 'This browser cannot pause at breakpoints (it needs cross-origin isolation, which Safari does not offer). Use Chrome, Edge or Firefox; your code still runs here without stopping.'

// The debugger for a program that runs top to bottom (the Python playground): where it is
// paused, the controls, the Variables view and Call stack, and the Execution trace of the
// last debugged run, as the FastAPI debugger shows them for a request.
//   paused:   the live pause ({ file, line, frames }), or null
//   running:  a debugged run is in progress
//   trace:    the last debugged run's calls ({ calls: [{ fn, file, line, depth, ms, error }] })
export default function ProgramDebugPanel({
  paused, running, armed, trace, breakpoints = [], isolationUnsupported = false, onResume, onStop, onOpenLocation,
  selectedFrame = 0, onSelectFrame, changed,
}) {
  const [expanded, setExpanded] = useState(() => new Set())
  const toggle = (key) => setExpanded((current) => {
    const next = new Set(current)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })
  const open = (file, line) => {
    if (file && Number.isInteger(line)) onOpenLocation?.(file, line)
  }
  const calls = trace?.calls ?? []

  if (!paused && !running && !calls.length && !breakpoints.length) {
    return (
      <div className="rounded-lg border border-dashed border-ink-300 p-5 text-center dark:border-ink-700">
        <FiGitBranch className="mx-auto h-5 w-5 text-ink-400" />
        <p className="mt-2 text-sm font-semibold text-ink-700 dark:text-ink-200">Nothing to debug yet</p>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">Click left of a line number to set a breakpoint, then press Debug. Your program stops there so you can look at its variables and step through it.</p>
        {isolationUnsupported && <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">{UNSUPPORTED}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={`rounded-lg border p-3 ${paused || running ? 'border-red-400/50 bg-red-500/5' : 'border-ink-200 dark:border-ink-800'}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${paused || running ? 'animate-pulse bg-red-500' : 'bg-ink-400'}`} />
          <strong className="text-xs text-ink-800 dark:text-ink-100">{paused ? 'Execution paused' : running ? 'Running under the debugger' : armed ? 'Debugger ready' : 'Last debugged run'}</strong>
          <span className="text-[10px] text-ink-500 dark:text-ink-400">{breakpoints.length} breakpoint{breakpoints.length === 1 ? '' : 's'}</span>
        </div>
        {paused && (
          <>
            <button type="button" onClick={() => open(paused.file, paused.line)} className="mt-2 rounded px-1 py-0.5 font-mono text-xs text-red-600 underline decoration-dotted underline-offset-2 dark:text-red-300">{paused.file}:{paused.line}</button>
            <DebugControls onResume={onResume} onStop={onStop} stopLabel="Stop" className="mt-2" />
            <p className="mt-2 text-[10px] text-ink-500 dark:text-ink-400">Hover a variable in the editor to see its value. Values that the last step changed are highlighted.</p>
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

      <FrameView frames={paused?.frames ?? []} selectedFrame={selectedFrame} onSelectFrame={onSelectFrame} changed={changed} expanded={expanded} onToggle={toggle} />

      {!paused && (
        <section aria-label="Execution trace" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-800 dark:text-ink-100"><FiGitBranch /> Execution trace</h3>
            <span className="text-[10px] text-ink-400">{calls.length} call{calls.length === 1 ? '' : 's'}{trace?.truncated ? ' (first 2,000)' : ''}</span>
          </div>
          {!calls.length ? (
            <p className="rounded-lg bg-ink-100/70 p-3 text-xs text-ink-500 dark:bg-ink-900 dark:text-ink-300">{running ? 'The calls appear here when the run finishes.' : 'No function calls were traced. Press Debug to run your program under the debugger.'}</p>
          ) : (
            <ol className="flex max-h-96 flex-col gap-1 overflow-auto">
              {calls.map((call, index) => (
                <li key={`${call.fn}-${index}`} style={{ paddingLeft: `${Math.min(call.depth ?? 0, 12) * 12}px` }}>
                  <button type="button" onClick={() => open(call.file, call.line)} className={`flex w-full flex-wrap items-center gap-2 rounded-md border px-2 py-1.5 text-left hover:border-gold-400 ${call.error ? 'border-red-500/40 bg-red-500/5' : 'border-ink-200 dark:border-ink-800'}`}>
                    {call.error ? <FiAlertCircle className="text-red-500" /> : <FiArrowUpRight className="text-sky-500" />}
                    <code className="text-xs font-semibold text-ink-900 dark:text-white">{call.fn}()</code>
                    <span className="text-[10px] text-ink-400">{call.file}:{call.line}</span>
                    {call.ms != null && <span className="ml-auto text-[10px] text-ink-400">{call.ms} ms</span>}
                    {call.error && <span className="rounded bg-red-500/10 px-1.5 text-[10px] font-semibold text-red-500">raised {call.error}</span>}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  )
}
