import { useMemo, useState } from 'react'
import {
  FiAlertCircle, FiArrowDown, FiArrowUp, FiArrowUpRight, FiChevronLeft, FiCornerUpRight, FiGitBranch, FiPlay, FiRewind, FiSquare,
} from 'react-icons/fi'
import { FrameView } from './DebugPanel'
import { traceCalls } from '../../lib/codelab/tracePlayer'

const NO_STEPS = []

// Stepping through a recorded run, forwards and backwards (see lib/codelab/tracePlayer.js).
const CONTROLS = [
  { command: 'reverse', label: 'Previous breakpoint', key: 'Shift+F5', icon: FiRewind },
  { command: 'back', label: 'Step back', key: 'Shift+F10', icon: FiChevronLeft },
  { command: 'continue', label: 'Continue', key: 'F5', icon: FiPlay },
  { command: 'into', label: 'Step into', key: 'F11', icon: FiArrowDown },
  { command: 'over', label: 'Step over', key: 'F10', icon: FiCornerUpRight },
  { command: 'out', label: 'Step out', key: '⇧F11', icon: FiArrowUp },
]

// The Web debugger: the page's JavaScript is recorded while it runs, then stepped through.
//   recording: { steps, calls, ends, truncated, problems }
//   paused:    the pause at the current step (tracePlayer.pauseAt), or null
export default function WebDebugPanel({
  recording, paused, breakpoints = [], onGo, onSeek, onStop, onOpenLocation, selectedFrame = 0, onSelectFrame, changed,
}) {
  const [expanded, setExpanded] = useState(() => new Set())
  const toggle = (key) => setExpanded((current) => {
    const next = new Set(current)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })
  const steps = recording?.steps ?? NO_STEPS
  const calls = useMemo(() => traceCalls(recording?.calls, recording?.ends, steps), [recording?.calls, recording?.ends, steps])
  const open = (file, line) => {
    if (file && Number.isInteger(line)) onOpenLocation?.(file, line)
  }
  const index = paused?.index ?? 0

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-red-400/50 bg-red-500/5 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <strong className="text-xs text-ink-800 dark:text-ink-100">Recording the page</strong>
          <span className="text-[10px] text-ink-500 dark:text-ink-400">{steps.length.toLocaleString('en-IN')} step{steps.length === 1 ? '' : 's'} · {breakpoints.length} breakpoint{breakpoints.length === 1 ? '' : 's'}</span>
          <button type="button" onClick={onStop} className="ml-auto inline-flex items-center gap-1 rounded border border-red-400/50 px-2 py-1 text-[11px] font-semibold text-red-600 dark:text-red-300"><FiSquare /> Stop debugging</button>
        </div>
        <p className="mt-2 text-[10px] text-ink-500 dark:text-ink-400">Every line your JavaScript runs is recorded, also after clicks and timers. Step through it forwards and backwards; hover a variable in the editor to see its value then.</p>
        {recording?.problems?.map((problem) => (
          <p key={problem.file} className="mt-2 rounded bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">{problem.file} was not recorded: {problem.error}. It still runs; fix the error to debug it.</p>
        ))}
        {recording?.truncated && <p className="mt-2 rounded bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">Recording stopped after 5,000 steps; the page keeps running. Press Debug again to record from the start.</p>}
        {steps.length > 0 ? (
          <>
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={() => open(paused?.file, paused?.line)} className="rounded px-1 py-0.5 font-mono text-xs text-red-600 underline decoration-dotted underline-offset-2 dark:text-red-300">{paused?.file}:{paused?.line}</button>
              <span className="text-[10px] text-ink-500">step {(index + 1).toLocaleString('en-IN')} of {steps.length.toLocaleString('en-IN')}</span>
            </div>
            <div role="toolbar" aria-label="Recorded run controls" className="mt-2 flex flex-wrap gap-1.5">
              {CONTROLS.map(({ command, label, key, icon: Icon }) => (
                <button key={command} type="button" onClick={() => onGo?.(command)} title={`${label} (${key})`} aria-label={label} className={command === 'continue' ? 'inline-flex items-center gap-1 rounded bg-ink-900 px-2 py-1 text-[11px] font-semibold text-white dark:bg-gold-400 dark:text-ink-950' : 'inline-flex items-center gap-1 rounded border border-ink-300 px-2 py-1 text-[11px] font-semibold text-ink-700 hover:border-gold-400 dark:border-ink-700 dark:text-ink-200'}>
                  <Icon /> {label}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(steps.length - 1, 0)}
              value={index}
              onChange={(event) => onSeek?.(Number(event.target.value))}
              aria-label="Timeline"
              className="mt-3 w-full accent-gold-500"
            />
          </>
        ) : (
          <p className="mt-2 text-xs text-ink-500 dark:text-ink-300">Nothing recorded yet. If your code runs on a click or a timer, use the page in the preview.</p>
        )}
      </div>

      <FrameView frames={paused?.frames ?? []} selectedFrame={selectedFrame} onSelectFrame={onSelectFrame} changed={changed} expanded={expanded} onToggle={toggle} />

      <section aria-label="Execution trace" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-800 dark:text-ink-100"><FiGitBranch /> Execution trace</h3>
          <span className="text-[10px] text-ink-400">{calls.length} call{calls.length === 1 ? '' : 's'}</span>
        </div>
        {!calls.length ? (
          <p className="rounded-lg bg-ink-100/70 p-3 text-xs text-ink-500 dark:bg-ink-900 dark:text-ink-300">No function calls recorded yet.</p>
        ) : (
          <ol className="flex max-h-80 flex-col gap-1 overflow-auto">
            {calls.map((call) => (
              <li key={call.id} style={{ paddingLeft: `${Math.min(call.depth ?? 0, 12) * 12}px` }}>
                <button type="button" onClick={() => (call.step != null ? onSeek?.(call.step) : open(call.file, call.line))} className={`flex w-full flex-wrap items-center gap-2 rounded-md border px-2 py-1.5 text-left hover:border-gold-400 ${call.error ? 'border-red-500/40 bg-red-500/5' : 'border-ink-200 dark:border-ink-800'}`}>
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
    </div>
  )
}
