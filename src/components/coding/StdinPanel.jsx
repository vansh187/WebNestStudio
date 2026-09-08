export default function StdinPanel({ value, onChange, open }) {
  if (!open) return null
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3 dark:border-ink-800 dark:bg-ink-900/40">
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-ink-400">
        Standard input (stdin)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Text piped to your program's standard input…"
        className="w-full resize-y rounded-lg border border-ink-200 bg-transparent px-3 py-2 font-mono text-xs text-ink-800 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 dark:border-ink-700 dark:text-ink-100"
      />
    </div>
  )
}
