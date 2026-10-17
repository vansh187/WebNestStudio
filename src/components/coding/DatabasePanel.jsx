import { useMemo, useState } from 'react'
import { FiDatabase, FiDownload, FiKey, FiLink, FiLoader, FiPlay, FiRefreshCw, FiRotateCcw, FiShuffle, FiTable } from 'react-icons/fi'
import { EmptyState } from '../states/StateViews'
import { GENERATOR_KINDS, generateRows } from '../../lib/practiceData/generator'
import { inferColumns, parentTables } from '../../lib/practiceData/infer'
import { insertScript, quoteIdent, selectColumnSql } from '../../lib/practiceData/dialects/sqlite'

const BTN = 'inline-flex items-center gap-1.5 rounded-md border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:border-gold-400 hover:text-gold-600 disabled:opacity-50 dark:border-ink-700 dark:text-ink-200'
const INPUT = 'rounded-md border border-ink-200 bg-white px-2 py-1 text-xs text-ink-900 outline-none focus:border-gold-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white'
const ROW_OPTIONS = [10, 100, 1000]

function ResultGrid({ result }) {
  if (!result) return null
  if (result.error) {
    return <p className="rounded-lg bg-red-500/10 p-2 font-mono text-xs text-red-500">Line {result.line}: {result.error}</p>
  }
  if (!result.columns.length) {
    return <p className="text-xs text-ink-500 dark:text-ink-300">{result.statements} statement{result.statements === 1 ? '' : 's'} ran. Rows affected: {Math.max(result.rowcount, 0)}.</p>
  }
  return (
    <div className="flex flex-col gap-1">
      <div className="max-h-72 overflow-auto rounded-lg border border-ink-200 dark:border-ink-800">
        <table className="min-w-full text-left font-mono text-[11px]">
          <thead className="sticky top-0 bg-ink-50 dark:bg-ink-900">
            <tr>{result.columns.map((column) => <th key={column} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold text-ink-600 dark:text-ink-200">{column}</th>)}</tr>
          </thead>
          <tbody>
            {result.rows.map((row, index) => (
              <tr key={index} className="border-t border-ink-100 dark:border-ink-800">
                {row.map((value, cell) => (
                  <td key={cell} className="max-w-[16rem] truncate whitespace-nowrap px-2 py-1 text-ink-800 dark:text-ink-100" title={value === null ? 'NULL' : String(value)}>
                    {value === null ? <span className="text-ink-400">NULL</span> : String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-ink-400">{result.rowcount} row{result.rowcount === 1 ? '' : 's'}{result.truncated ? ' (first 500 shown)' : ''}</p>
    </div>
  )
}

function Generator({ tables, onSql, onDone }) {
  const [tableName, setTableName] = useState(tables[0]?.name ?? '')
  const table = tables.find((item) => item.name === tableName)
  const [columns, setColumns] = useState(() => (table ? inferColumns(table) : []))
  const [count, setCount] = useState(10)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  const pickTable = (name) => {
    setTableName(name)
    const next = tables.find((item) => item.name === name)
    setColumns(next ? inferColumns(next) : [])
    setMessage(null)
  }

  const updateSpec = (index, changes) => setColumns(columns.map((column, i) => (i === index ? { ...column, spec: { ...column.spec, ...changes } } : column)))

  const preview = useMemo(() => generateRows(columns.map((c) => (c.spec.kind === 'fk' ? { ...c, spec: { kind: 'int', min: 1, max: 1 } } : c)), 3, { seed, offset: table?.rows ?? 0 }), [columns, seed, table?.rows])

  const insert = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const foreignValues = {}
      for (const parent of parentTables(columns)) {
        for (const column of columns.filter((c) => c.spec.kind === 'fk' && c.spec.table === parent)) {
          const result = await onSql(selectColumnSql(parent, column.spec.to))
          foreignValues[column.name] = (result.rows ?? []).map((row) => row[0])
          if (!foreignValues[column.name].length && column.notnull) {
            throw new Error(`${parent} has no rows yet. Fill ${parent} first, because ${tableName}.${column.name} must point to one of them.`)
          }
        }
      }
      const generated = generateRows(columns, count, { seed, foreignValues, offset: table?.rows ?? 0 })
      const result = await onSql(insertScript(tableName, generated.columns, generated.rows))
      if (result.error) throw new Error(`${result.error}. Adjust the generators to match the table's constraints.`)
      setMessage({ ok: true, text: `Inserted ${count} rows into ${tableName}.` })
      setSeed(Math.floor(Math.random() * 100000))
      onDone?.(tableName)
    } catch (error) {
      setMessage({ ok: false, text: error.message })
    } finally {
      setBusy(false)
    }
  }

  if (!tables.length) return <p className="text-xs text-ink-500">Create a table in schema.sql first.</p>

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-ink-200 p-3 dark:border-ink-800">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <label htmlFor="gen-table" className="font-semibold text-ink-600 dark:text-ink-200">Table</label>
        <select id="gen-table" value={tableName} onChange={(event) => pickTable(event.target.value)} className={INPUT}>
          {tables.map((item) => <option key={item.name}>{item.name}</option>)}
        </select>
        <label htmlFor="gen-count" className="font-semibold text-ink-600 dark:text-ink-200">Rows</label>
        <select id="gen-count" value={count} onChange={(event) => setCount(Number(event.target.value))} className={INPUT}>
          {ROW_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <button type="button" onClick={() => setSeed(Math.floor(Math.random() * 100000))} className={BTN} title="New random values"><FiShuffle className="h-3.5 w-3.5" /> Shuffle</button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {columns.map((column, index) => (
          <li key={column.name} className="flex flex-wrap items-center gap-2 text-xs">
            <span className="w-28 shrink-0 truncate font-mono text-ink-800 dark:text-ink-100" title={`${column.name} ${column.type}`}>{column.name}</span>
            <select value={column.spec.kind} onChange={(event) => updateSpec(index, { kind: event.target.value })} aria-label={`Generator for ${column.name}`} className={`${INPUT} min-w-0 flex-1`}>
              {GENERATOR_KINDS.filter((kind) => kind.id !== 'fk' || column.spec.table).map((kind) => <option key={kind.id} value={kind.id}>{kind.id === 'fk' ? `Existing ${column.spec.table}.${column.spec.to}` : kind.label}</option>)}
            </select>
            {(column.spec.kind === 'int' || column.spec.kind === 'decimal') && (
              <>
                <input type="number" value={column.spec.min ?? ''} onChange={(event) => updateSpec(index, { min: Number(event.target.value) })} aria-label={`${column.name} minimum`} className={`${INPUT} w-16`} />
                <input type="number" value={column.spec.max ?? ''} onChange={(event) => updateSpec(index, { max: Number(event.target.value) })} aria-label={`${column.name} maximum`} className={`${INPUT} w-16`} />
              </>
            )}
            {column.spec.kind === 'enum' && (
              <input value={(column.spec.values ?? []).join(', ')} onChange={(event) => updateSpec(index, { values: event.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} aria-label={`${column.name} values`} placeholder="a, b, c" className={`${INPUT} w-32`} />
            )}
          </li>
        ))}
      </ul>
      {preview.columns.length > 0 && (
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-ink-400">Preview</p>
          <ResultGrid result={{ columns: preview.columns, rows: preview.rows, rowcount: preview.rows.length }} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <button type="button" onClick={insert} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 dark:bg-gold-500 dark:text-ink-950">
          {busy ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiPlay className="h-3.5 w-3.5" />} Insert {count} rows
        </button>
        {message && <p className={`text-xs ${message.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{message.text}</p>}
      </div>
    </div>
  )
}

export default function DatabasePanel({ schema, booted, schemaSql, onLoadSchema, onSql, onApplySchema, onReset, onExport, className = '', embedded = false }) {
  const [script, setScript] = useState('SELECT name FROM sqlite_master WHERE type = \'table\';')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const tables = schema?.tables ?? []

  const guard = async (action) => {
    setBusy(true)
    setStatus(null)
    try {
      await action()
    } catch (error) {
      setStatus({ ok: false, text: error.message })
    } finally {
      setBusy(false)
    }
  }

  const runScript = (text = script) => guard(async () => setResult(await onSql(text)))

  const browse = (name) => {
    const text = `SELECT * FROM ${quoteIdent(name)} LIMIT 50;`
    setScript(text)
    runScript(text)
  }

  const apply = (rebuild) => guard(async () => {
    if (rebuild && !window.confirm('Rebuild deletes every table and row, then runs schema.sql again. Continue?')) return
    const applied = await onApplySchema(rebuild)
    setStatus(applied.ok
      ? { ok: true, text: `schema.sql applied (${applied.applied} statements).` }
      : { ok: false, text: `schema.sql line ${applied.line}: ${applied.error}` })
  })

  const reset = () => guard(async () => {
    if (!window.confirm('Delete the whole database? Run will create it again from schema.sql.')) return
    await onReset()
    setResult(null)
    setStatus({ ok: true, text: 'Database deleted.' })
  })

  const download = () => guard(async () => {
    const bytes = await onExport()
    if (!bytes) throw new Error('There is no database yet. Run the project first.')
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.sqlite3' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'app.db'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  })

  return (
    <div className={`flex flex-col gap-3 ${embedded ? '' : 'rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40'} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={`font-display text-sm font-semibold text-ink-900 dark:text-white ${embedded ? 'sr-only' : ''}`}>Database <span className="font-normal text-ink-400">SQLite · app.db</span></h2>
        <button type="button" onClick={() => guard(onLoadSchema)} disabled={busy} className={BTN} aria-label="Refresh schema"><FiRefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} /></button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => apply(tables.length > 0)} disabled={busy || !schemaSql?.trim()} className={BTN}>
          <FiRotateCcw className="h-3.5 w-3.5" /> {tables.length ? 'Rebuild from schema.sql' : 'Apply schema.sql'}
        </button>
        <button type="button" onClick={() => setShowGenerator((value) => !value)} disabled={!tables.length} aria-expanded={showGenerator} className={BTN}>
          <FiShuffle className="h-3.5 w-3.5" /> Generate dummy data
        </button>
        <button type="button" onClick={download} disabled={busy || !booted} className={BTN}><FiDownload className="h-3.5 w-3.5" /> app.db</button>
        <button type="button" onClick={reset} disabled={busy || !booted} className={`${BTN} hover:!border-red-400 hover:!text-red-500`}>Delete database</button>
      </div>

      {status && <p className={`rounded-lg p-2 text-xs ${status.ok ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>{status.text}</p>}

      {showGenerator && tables.length > 0 && (
        <Generator key={tables.map((t) => t.name).join(',')} tables={tables} onSql={onSql} onDone={(name) => browse(name)} />
      )}

      {!booted && !tables.length ? (
        <EmptyState icon={FiDatabase} title="No database yet" description="Press Run. The database is created from schema.sql the first time." />
      ) : (
        <ul className="flex flex-col gap-2">
          {tables.map((table) => (
            <li key={table.name} className="rounded-lg border border-ink-200 dark:border-ink-800">
              <details>
                <summary className="flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-xs">
                  <FiTable className="h-3.5 w-3.5 text-gold-500" />
                  <span className="font-mono font-semibold text-ink-900 dark:text-white">{table.name}</span>
                  <span className="text-ink-400">{table.rows} row{table.rows === 1 ? '' : 's'}</span>
                  <button type="button" onClick={(event) => { event.preventDefault(); browse(table.name) }} className="ml-auto text-[11px] font-semibold text-gold-600 hover:underline dark:text-gold-400">Browse</button>
                </summary>
                <div className="flex flex-col gap-2 border-t border-ink-200 px-3 py-2 text-[11px] dark:border-ink-800">
                  <ul className="font-mono">
                    {table.columns.map((column) => {
                      const fk = table.foreignKeys.find((key) => key.column === column.name)
                      return (
                        <li key={column.name} className="flex items-center gap-2 py-0.5">
                          <span className="w-4">{column.pk ? <FiKey className="h-3 w-3 text-amber-500" aria-label="Primary key" /> : fk ? <FiLink className="h-3 w-3 text-sky-500" aria-label="Foreign key" /> : null}</span>
                          <span className="text-ink-800 dark:text-ink-100">{column.name}</span>
                          <span className="text-ink-400">{column.type || 'ANY'}{column.notnull ? ' NOT NULL' : ''}</span>
                          {fk && <span className="text-sky-600 dark:text-sky-400">→ {fk.table}.{fk.to}</span>}
                        </li>
                      )
                    })}
                  </ul>
                  {table.indexes.length > 0 && (
                    <p className="text-ink-500 dark:text-ink-300">
                      Indexes: {table.indexes.map((index) => `${index.name.startsWith('sqlite_autoindex') ? 'UNIQUE' : index.name} (${index.columns.join(', ')})`).join('; ')}
                    </p>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t border-ink-200 pt-3 dark:border-ink-800">
        <label htmlFor="sql-console" className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">SQL console</label>
        <textarea
          id="sql-console"
          value={script}
          onChange={(event) => setScript(event.target.value)}
          onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); runScript() } }}
          rows={4}
          spellCheck={false}
          className="resize-y rounded-md border border-ink-200 bg-white p-2 font-mono text-xs text-ink-900 outline-none focus:border-gold-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => runScript()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 dark:bg-gold-500 dark:text-ink-950">
            {busy ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiPlay className="h-3.5 w-3.5" />} Run SQL
          </button>
          <span className="text-[11px] text-ink-400">Ctrl + Enter</span>
        </div>
        <ResultGrid result={result} />
      </div>
    </div>
  )
}
