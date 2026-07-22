const inputClass =
  'mt-2 w-full rounded-xl border bg-transparent px-4 py-3 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30'

export function FormField({ label, name, error, register, as = 'input', children, ...props }) {
  const Tag = as
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-ink-700 dark:text-ink-200">
        {label}
      </label>
      <Tag
        id={name}
        {...register(name)}
        className={`${inputClass} ${error ? 'border-red-400 focus:border-red-400' : 'border-ink-200 dark:border-ink-700 focus:border-gold-400'}`}
        {...props}
      >
        {children}
      </Tag>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error.message}</p>}
    </div>
  )
}

export function ConsentCheckbox({ register, error }) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-ink-600 dark:text-ink-300">
        <input
          type="checkbox"
          {...register('consent_given')}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-gold-500 focus:ring-gold-400/40"
        />
        I agree to be contacted by WebNest Studio about my enquiry.
      </label>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error.message}</p>}
    </div>
  )
}
