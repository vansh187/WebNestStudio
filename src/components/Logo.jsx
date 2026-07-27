import logoMark from '../assets/logo.png'

const SIZES = {
  sm: { ring: 36, font: 'text-xs' },
  md: { ring: 48, font: 'text-sm' },
  lg: { ring: 72, font: 'text-lg' },
}

export default function Logo({ size = 'md', showText = true, className = '' }) {
  const { ring } = SIZES[size] ?? SIZES.md

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative shrink-0 rounded-full overflow-hidden"
        style={{ width: ring, height: ring }}
      >
        <img src={logoMark} alt="WebNest Studio" className="h-full w-full object-cover" />
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
