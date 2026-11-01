import { FaCrown } from 'react-icons/fa'

// Marks a WebNest Prime member. `short` is for tight spaces such as a panel header.
export default function PrimeBadge({ label = 'WebNest Prime Member', short = false, className = '' }) {
  return (
    <span title={label} className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-br from-gold-300 to-gold-500 px-2 py-0.5 text-[11px] font-semibold text-ink-950 ${className}`}>
      <FaCrown className="h-3 w-3" aria-hidden="true" />
      {short ? 'Prime' : label}
    </span>
  )
}
