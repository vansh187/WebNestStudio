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

const LINE_TONE = {
  out: 'text-ink-100',
  err: 'text-red-400',
  ok: 'text-emerald-400',
  dim: 'text-ink-400',
  warn: 'text-amber-400',
}

// The prompt: Enter runs, ↑/↓ walk the history, Ctrl+C stops a running command.
function Prompt({ terminal, onStop, inputRef }) {
  const [value, setValue] = useState('')
  const [cursor, setCursor] = useState(null) // index into history while browsing it
  const { history, busy, execute } = terminal

  const onKeyDown = (event) => {
    if (event.key === 'c' && event.ctrlKey && !event.shiftKey && !window.getSelection()?.toString()) {
      event.preventDefault()
      if (busy) onStop?.()
      setValue('')
      setCursor(null)
    } else if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault()
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1)
      setCursor(next)
      setValue(history[next])
    } else if (event.key === 'ArrowDown' && cursor !== null) {
      event.preventDefault()
      const next = cursor + 1
      setCursor(next < history.length ? next : null)
      setValue(next < history.length ? history[next] : '')
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (busy || !value.trim()) return
        execute(value)
        setValue('')
        setCursor(null)
      }}
      className="flex shrink-0 items-center gap-2 border-t border-ink-800 px-3 py-1.5"
    >
      <span className={busy ? 'text-ink-600' : 'text-gold-400'} aria-hidden="true">$</span>
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => { setValue(event.target.value); setCursor(null) }}
        onKeyDown={onKeyDown}
        readOnly={busy}
        placeholder={busy ? 'Running… Ctrl+C to stop' : 'pip install <package>, npm run dev, python app/script.py, help'}
        aria-label="Terminal command"
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        className="min-w-0 flex-1 bg-transparent text-ink-100 outline-none placeholder:text-ink-600"
      />
      {busy && <FiLoader className="h-3.5 w-3.5 shrink-0 animate-spin text-gold-400" aria-label="Running" />}
    </form>
  )
}

// The Output tab as a terminal: the last Run's result, the commands typed at the prompt,
// then a running log of every request the API answered (from the Preview or the API tester).
export default function BackendConsole({ runner, requests, onClearRequests, terminal, onStop }) {
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const { running, runningSince, runningHint, stopped, error } = runner
  // `clear` hides the Run output that was showing; a new Run shows again.
  const result = terminal && runner.result === terminal.clearedResult ? null : runner.result
  const entries = terminal?.entries ?? []
  const lastLines = entries[entries.length - 1]?.lines.length ?? 0

  useEffect(() => {
    try {
      endRef.current?.scrollIntoView({ block: 'nearest' })
    } catch {
      /* Scrolling is cosmetic. */
    }
  }, [requests.length, result, entries.length, lastLines])

  // Clicking the output focuses the prompt, unless the learner is selecting text to copy.
  const focusPrompt = () => {
    if (!window.getSelection()?.toString()) inputRef.current?.focus()
  }

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
      <div className="min-h-0 flex-1 overflow-auto p-3" onClick={terminal ? focusPrompt : undefined}>
        {running && (
          <p className="flex items-center gap-2 text-ink-300">
            <FiLoader className="h-3.5 w-3.5 animate-spin text-gold-400" /> Starting your API… {runningSince && <Elapsed since={runningSince} />}
          </p>
        )}
        {running && runningHint && <p className="mt-1 text-ink-500">{runningHint}</p>}
        {!running && error && <p className="whitespace-pre-wrap text-red-400">{error}</p>}
        {!running && !result && !error && !entries.length && (
          <p className="text-ink-500">
            {stopped ? 'Stopped. ' : ''}Press Run (Ctrl+Enter) to start your API{terminal ? ', or type a command below: uvicorn app.main:app --reload, pip install <package>, npm run dev, help' : ''}. Output and every request appear here.
          </p>
        )}
        {!running && result?.stdout && <pre className="whitespace-pre-wrap break-words text-ink-100">{result.stdout}</pre>}
        {!running && result?.stderr && <pre className="mt-2 whitespace-pre-wrap break-words text-red-400">{result.stderr}</pre>}

        {entries.map((entry) => (
          <div key={entry.id} className="mt-2 first:mt-0">
            <p className="break-words">
              <span className={entry.status === 'error' ? 'text-red-400' : 'text-gold-400'}>$</span> <span className="text-white">{entry.command}</span>
            </p>
            {entry.lines.map((line, index) => (
              <pre key={index} className={`whitespace-pre-wrap break-words ${LINE_TONE[line.tone] ?? LINE_TONE.out}`}>{line.text}</pre>
            ))}
          </div>
        ))}

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
                {entry.notices?.map((text, index) => <pre key={index} className="w-full whitespace-pre-wrap pl-4 text-amber-400">{text}</pre>)}
                {entry.error && <pre className="w-full whitespace-pre-wrap pl-4 text-red-400">{entry.error}</pre>}
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
      {terminal && <Prompt terminal={terminal} onStop={onStop} inputRef={inputRef} />}
    </div>
  )
}
