import { useMemo } from 'react'
import { FiAlertCircle, FiArrowDown, FiDatabase, FiGitBranch, FiKey, FiLayers, FiMonitor } from 'react-icons/fi'
import { EmptyState } from '../states/StateViews'
import { LAYERS, layerOfFile, layeringHints, traceHints } from '../../lib/codelab/backendFiles'
import { METHOD_STYLES, statusTone } from '../../lib/codelab/httpStyles'

const LAYER_TONE = {
  client: 'border-pink-400/50 bg-pink-500/5',
  api: 'border-sky-400/50 bg-sky-500/5',
  services: 'border-violet-400/50 bg-violet-500/5',
  repositories: 'border-emerald-400/50 bg-emerald-500/5',
  database: 'border-amber-400/50 bg-amber-500/5',
}
const CHIP = {
  api: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  services: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  repositories: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  database: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  core: 'bg-ink-500/15 text-ink-700 dark:text-ink-200',
}

// Reveal the trace one step at a time; skipped when the visitor prefers reduced motion.
const STEP_STYLE = `
@keyframes wn-trace-step { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: none; } }
.wn-trace-step { animation: wn-trace-step 0.25s ease both; }
@media (prefers-reduced-motion: reduce) { .wn-trace-step { animation: none; } }
`

function LayerBox({ id, title, role, items, active, count }) {
  return (
    <div className={`rounded-lg border p-2.5 transition-shadow ${LAYER_TONE[id]} ${active ? 'ring-2 ring-gold-400/70' : 'opacity-80'}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink-900 dark:text-white">{title}</p>
        {active && <span className="rounded-full bg-gold-400/20 px-2 text-[10px] font-semibold text-gold-700 dark:text-gold-300">{count} call{count === 1 ? '' : 's'}</span>}
      </div>
      <p className="text-[11px] text-ink-500 dark:text-ink-300">{role}</p>
      {items.length > 0 && <p className="mt-1 truncate font-mono text-[10px] text-ink-400" title={items.join(', ')}>{items.join(' · ')}</p>}
    </div>
  )
}

const Arrow = () => <FiArrowDown className="mx-auto h-3.5 w-3.5 text-ink-300" aria-hidden="true" />

export default function ArchitecturePanel({ files, schema, lastExchange, className = '', embedded = false }) {
  const trace = lastExchange?.response?.trace
  const staticHints = useMemo(() => layeringHints(files), [files])
  const hints = [...staticHints, ...traceHints(trace)]
  const tables = schema?.tables ?? []

  const filesByLayer = useMemo(() => {
    const result = { client: [], api: [], services: [], repositories: [], database: [] }
    for (const file of files) {
      const layer = layerOfFile(file.name)
      const leaf = file.name.split('/').pop()
      if (result[layer]) result[layer].push(leaf)
      if (layer === 'schema') result.database.push(leaf)
    }
    return result
  }, [files])

  const touched = useMemo(() => {
    const counts = {}
    for (const call of trace?.calls ?? []) counts[call.layer] = (counts[call.layer] ?? 0) + 1
    if (trace?.sql?.length) counts.database = trace.sql.length
    if (lastExchange) counts.client = 1
    return counts
  }, [trace, lastExchange])

  // Interleave each SQL statement after the call that issued it.
  const steps = useMemo(() => {
    if (!trace) return []
    const list = []
    trace.calls.forEach((call, index) => {
      list.push({ type: 'call', ...call, index })
      for (const sql of trace.sql.filter((entry) => entry.call === index)) list.push({ type: 'sql', ...sql, depth: call.depth + 1 })
    })
    for (const sql of trace.sql.filter((entry) => entry.call == null)) list.push({ type: 'sql', ...sql, depth: 0 })
    return list
  }, [trace])

  const layerTitle = Object.fromEntries(LAYERS.map((layer) => [layer.id, layer]))

  return (
    <div className={`flex flex-col gap-4 ${embedded ? '' : 'rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40'} ${className}`}>
      <style>{STEP_STYLE}</style>
      <div className="flex items-center justify-between gap-2">
        <h2 className={`font-display text-sm font-semibold text-ink-900 dark:text-white ${embedded ? 'sr-only' : ''}`}>Architecture</h2>
        <span className="text-[11px] text-ink-400">How a request moves through your layers</span>
      </div>

      <section aria-label="Layers" className="flex flex-col gap-1">
        <LayerBox id="client" title="Client" role={filesByLayer.client.length ? 'frontend/ in Preview, or the API tester' : 'The API tester (add frontend/ files for a UI)'} items={filesByLayer.client} active={Boolean(touched.client)} count={1} />
        <Arrow />
        {LAYERS.map((layer) => (
          <div key={layer.id} className="flex flex-col gap-1">
            <LayerBox id={layer.id} title={`${layer.label} · ${layer.folder}`} role={layer.role} items={filesByLayer[layer.id]} active={Boolean(touched[layer.id])} count={touched[layer.id]} />
            <Arrow />
          </div>
        ))}
        <LayerBox id="database" title="Database · SQLite" role={tables.length ? `Tables: ${tables.map((t) => t.name).join(', ')}` : 'Tables come from schema.sql'} items={filesByLayer.database} active={Boolean(touched.database)} count={touched.database} />
      </section>

      {hints.length > 0 && (
        <section aria-label="Layering hints" className="flex flex-col gap-1.5">
          {hints.map((hint, index) => (
            <p key={index} className="flex gap-2 rounded-lg bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
              <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{hint.file && <span className="font-mono">{hint.file}: </span>}{hint.message}</span>
            </p>
          ))}
        </section>
      )}

      <section aria-label="Last request" className="flex flex-col gap-2 border-t border-ink-200 pt-3 dark:border-ink-800">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 dark:text-ink-200"><FiGitBranch className="h-3.5 w-3.5" /> Request trace</h3>
        {!lastExchange ? (
          <EmptyState icon={FiLayers} title="No request yet" description="Send a request from the API tab or use your frontend in Preview. Each call through route, service and repository shows up here." />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className={`rounded px-1.5 py-0.5 font-bold ${METHOD_STYLES[lastExchange.spec.method] ?? ''}`}>{lastExchange.spec.method}</span>
              <span className="font-mono text-ink-800 dark:text-ink-100">{lastExchange.spec.path}</span>
              <span className={`rounded-full border px-2 py-0.5 font-semibold ${statusTone(lastExchange.response.status)}`}>{lastExchange.response.status || 'error'}</span>
              {typeof lastExchange.response.ms === 'number' && <span className="text-ink-400">{Math.round(lastExchange.response.ms)} ms</span>}
              <span className="inline-flex items-center gap-1 text-ink-400">{lastExchange.source === 'preview' ? <><FiMonitor className="h-3 w-3" /> from Preview</> : 'from API tester'}</span>
            </div>
            {steps.length === 0 ? (
              <p className="text-xs text-ink-500 dark:text-ink-300">FastAPI answered before any of your code ran (for example a 401 from the token check, a 404 for an unknown path, or a 422 from Pydantic validation).</p>
            ) : (
              <ol key={lastExchange.at} className="flex flex-col gap-1">
                {steps.map((step, index) => (
                  <li key={index} className="wn-trace-step" style={{ animationDelay: `${Math.min(index, 20) * 70}ms`, paddingLeft: `${step.depth * 14}px` }}>
                    {step.type === 'call' ? (
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${CHIP[step.layer] ?? CHIP.core}`}>{layerTitle[step.layer]?.label ?? step.layer}</span>
                        <span className="font-mono font-semibold text-ink-900 dark:text-white">{step.fn}()</span>
                        <span className="font-mono text-[10px] text-ink-400">{step.file}:{step.line}</span>
                        {step.ms != null && <span className="text-[10px] text-ink-400">{step.ms} ms</span>}
                        {step.error && <span className="rounded bg-red-500/10 px-1.5 text-[10px] font-semibold text-red-500">raised {step.error}</span>}
                      </div>
                    ) : (
                      <div className="flex items-start gap-1.5 text-[11px]">
                        <FiDatabase className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                        <code className="break-all font-mono text-amber-700 dark:text-amber-300">{step.sql}</code>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </section>

      <section aria-label="Tables and relationships" className="flex flex-col gap-2 border-t border-ink-200 pt-3 dark:border-ink-800">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 dark:text-ink-200"><FiDatabase className="h-3.5 w-3.5" /> Tables and relationships</h3>
        {!tables.length ? (
          <p className="text-xs text-ink-500 dark:text-ink-300">Run the project to create the tables from schema.sql.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {tables.map((table) => (
              <div key={table.name} className="rounded-lg border border-ink-200 p-2 dark:border-ink-800">
                <p className="font-mono text-xs font-semibold text-ink-900 dark:text-white">{table.name}</p>
                <ul className="mt-1 font-mono text-[10px] text-ink-500 dark:text-ink-300">
                  {table.columns.map((column) => (
                    <li key={column.name} className="flex items-center gap-1">
                      {column.pk ? <FiKey className="h-2.5 w-2.5 text-amber-500" aria-label="Primary key" /> : <span className="w-2.5" />}
                      {column.name} <span className="text-ink-400">{column.type}</span>
                    </li>
                  ))}
                </ul>
                {table.foreignKeys.map((fk) => (
                  <p key={fk.column} className="mt-1 font-mono text-[10px] text-sky-600 dark:text-sky-400">{table.name}.{fk.column} → {fk.table}.{fk.to}{fk.on_delete && fk.on_delete !== 'NO ACTION' ? ` (ON DELETE ${fk.on_delete})` : ''}</p>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
