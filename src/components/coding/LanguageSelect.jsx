const SELECT_CLASS =
  'min-h-11 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-800 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 disabled:opacity-60 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100'

export default function LanguageSelect({ languages, value, onChange, disabled = false, className = '' }) {
  return (
    <select
      aria-label="Language"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`${SELECT_CLASS} ${className}`}
    >
      {languages.map((l) => (
        <option key={l.id} value={l.id}>
          {l.label}
        </option>
      ))}
    </select>
  )
}
