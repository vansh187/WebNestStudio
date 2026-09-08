import { useEffect, useState } from 'react'
import { FiLoader, FiTerminal } from 'react-icons/fi'
import { EmptyState } from '../states/StateViews'

const STATUS_STYLES = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
  compile_error: 'border-red-500/30 bg-red-500/10 text-red-500',
  runtime_error: 'border-red-500/30 bg-red-500/10 text-red-500',
  timeout: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  rate_limited: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  internal_error: 'border-red-500/30 bg-red-500/10 text-red-500',
}

const STATUS_LABELS = {
  success: 'Success',
  compile_error: 'Compile error',
  runtime_error: 'Runtime error',
  timeout: 'Timed out',
  rate_limited: 'Rate limited',
  internal_error: 'Server error',
}

// Shown when a non-success run produced no readable output.
const STATUS_HINTS = {
  compile_error: 'Your code did not compile.',
  runtime_error: 'Your program exited with an error.',
  timeout: 'Execution timed out before it finished.',
  rate_limited: 'The runner is busy or the daily limit was reached — try again later.',
  internal_error: 'The runner hit an error. Try again in a moment.',
}

function Stream({ label, text, tone = 'default' }) {
  if (!text) return null
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-ink-400">{label}</p>
      <pre
        className={`overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-ink-50 p-3 font-mono text-xs leading-relaxed dark:bg-ink-900 lg:whitespace-pre ${
          tone === 'error' ? 'text-red-500 dark:text-red-400' : 'text-ink-800 dark:text-ink-100'
        }`}
      >
        {text}
      </pre>
    </div>
  )
}

function RunningIndicator({ since }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!since) {
      setElapsed(0)
      return undefined
    }
    const tick = () => setElapsed(Math.max(0, Math.round((Date.now() - since) / 1000)))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [since])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-300">
        <FiLoader className="h-4 w-4 animate-spin text-gold-500" />
        Running your code… {elapsed > 0 && <span className="tabular-nums text-ink-400">{elapsed}s</span>}
      </div>
      {elapsed >= 4 && (
        <p className="text-[11px] text-ink-400">
          First run can take up to a minute while the server wakes up — after that, runs are fast.
        </p>
      )}
    </div>
  )
}

export default function OutputPanel({
  running = false,
  runningSince = null,
  stopped = false,
  result = null,
  error = null,
  className = '',
}) {
  const compileText = result?.compile?.stderr || result?.compile?.stdout
  const nothingPrinted =
    result && !result.stdout && !result.stderr && !compileText

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-semibold text-ink-900 dark:text-white">Output</h2>
        {result && (
          <div className="flex flex-wrap items-center justify-end gap-2 text-[11px] text-ink-400">
            <span
              className={`rounded-full border px-2 py-0.5 font-semibold ${STATUS_STYLES[result.status] ?? 'border-ink-300 text-ink-400'}`}
            >
              {STATUS_LABELS[result.status] ?? result.status}
            </span>
            {typeof result.exit_code === 'number' && <span>exit {result.exit_code}</span>}
            {(() => {
              // JDoodle often omits CPU time, so prefer the measured round-trip.
              const ms = result.wall_time_ms || result.time_ms
              return ms ? <span>{ms} ms</span> : null
            })()}
          </div>
        )}
      </div>

      {running && <RunningIndicator since={runningSince} />}

      {!running && error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>
      )}

      {!running && !error && !result && stopped && (
        <p className="text-sm text-ink-400">Run stopped.</p>
      )}

      {!running && !error && !result && !stopped && (
        <EmptyState
          icon={FiTerminal}
          title="No output yet"
          description="Run your code to see the result here."
        />
      )}

      {!running && !error && result && (
        <div className="flex flex-col gap-3">
          <Stream
            label="Compile"
            text={compileText}
            tone={result.compile?.exit_code ? 'error' : 'default'}
          />
          <Stream label="Stdout" text={result.stdout} />
          <Stream label="Stderr" text={result.stderr} tone="error" />
          {nothingPrinted && (
            <p className={`text-sm ${result.status === 'success' ? 'text-ink-400' : 'text-red-500'}`}>
              {result.status === 'success'
                ? 'Program produced no output.'
                : (STATUS_HINTS[result.status] ?? 'The run did not complete.')}
            </p>
          )}
          {result.truncated && (
            <p className="text-[11px] font-medium text-amber-500">Output was truncated.</p>
          )}
        </div>
      )}
    </div>
  )
}
