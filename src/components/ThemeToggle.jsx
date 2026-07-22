import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative flex h-9 w-16 items-center rounded-full border border-ink-200 dark:border-ink-600 bg-ink-100 dark:bg-ink-800 px-1 transition-colors ${className}`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-ink-950 border border-ink-200 dark:border-gold-700 shadow-sm transition-transform duration-300 ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <FiMoon className="h-3.5 w-3.5 text-gold-400" />
        ) : (
          <FiSun className="h-3.5 w-3.5 text-gold-600" />
        )}
      </span>
    </button>
  )
}
