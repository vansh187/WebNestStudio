const SIZES = {
  sm: { ring: 36, font: 'text-xs' },
  md: { ring: 48, font: 'text-sm' },
  lg: { ring: 72, font: 'text-lg' },
}

// Placeholder mark recreating the WebNest Studio brand (gold ring, W/N monogram,
// cart glyph). Swap for the real /src/assets/logo.png whenever it's available.
export default function Logo({ size = 'md', showText = true, className = '' }) {
  const { ring } = SIZES[size] ?? SIZES.md

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative shrink-0 rounded-full border-[2.5px] border-gold-400 bg-ink-950 flex items-center justify-center overflow-hidden"
        style={{ width: ring, height: ring }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <path
            d="M20 30 L32 72 L50 40 L68 72 L80 30"
            fill="none"
            stroke="url(#wnsGold)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M56 28 V72 M56 28 L78 72 M78 28 V72"
            fill="none"
            stroke="#f5f6f8"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.92"
          />
          <defs>
            <linearGradient id="wnsGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f4da96" />
              <stop offset="50%" stopColor="#d4a94f" />
              <stop offset="100%" stopColor="#966523" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className={`font-display font-semibold tracking-tight ${size === 'lg' ? 'text-2xl' : 'text-lg'} leading-none`}>
          <span className="text-ink-900 dark:text-white">WebNest</span>{' '}
          <span className="text-gradient-gold">Studio</span>
        </span>
      )}
    </div>
  )
}
