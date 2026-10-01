// Numbered step flow: a vertical list with a connecting line on small screens,
// a wrapping row of cards from the sm breakpoint up. Plain text, so it is crawlable.
export default function ProcessTimeline({ steps, label }) {
  return (
    <ol aria-label={label} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {steps.map((step, index) => (
        <li
          key={step}
          className="relative flex items-center gap-4 rounded-xl border border-ink-200 bg-white px-4 py-3.5 dark:border-ink-800 dark:bg-ink-950"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400/15 font-display text-sm font-bold text-gold-600 dark:text-gold-400">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">{step}</span>
        </li>
      ))}
    </ol>
  )
}
