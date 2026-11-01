import logoMark from '../assets/logo.png'

const SIZES = {
  sm: { ring: 36, font: 'text-xs' },
  md: { ring: 48, font: 'text-sm' },
  lg: { ring: 72, font: 'text-lg' },
}

export default function Logo({ size = 'md', showText = true, prime = false, className = '' }) {
  const { ring } = SIZES[size] ?? SIZES.md
  const name = (
    <span className={`font-display font-semibold tracking-tight ${size === 'lg' ? 'text-2xl' : 'text-lg'} leading-none`}>
      <span className="text-ink-900 dark:text-white">WebNest</span>{' '}
      <span className="text-gradient-gold">Studio</span>
    </span>
  )

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative shrink-0 rounded-full overflow-hidden ring-1 ring-gold-400/60 shadow-md shadow-black/30"
        style={{ width: ring, height: ring }}
      >
        <img src={logoMark} alt="WebNest Studio" width={ring} height={ring} decoding="async" className="h-full w-full object-cover" />
      </div>
      {showText && (prime ? (
        <span className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase leading-none tracking-[0.2em] text-gold-400">Prime</span>
          {name}
        </span>
      ) : name)}
    </div>
  )
}
