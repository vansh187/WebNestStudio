import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'

// Small round light/dark button pinned to the bottom-left corner, so the navbar
// stays uncluttered. The chat widget keeps the bottom-right corner.
export default function FloatingThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="fixed bottom-5 left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-white/90 text-ink-700 shadow-lg backdrop-blur transition-colors hover:border-gold-400 hover:text-gold-500 dark:border-ink-700 dark:bg-ink-900/90 dark:text-ink-100"
    >
      {isDark ? <FiMoon className="h-5 w-5 text-gold-400" /> : <FiSun className="h-5 w-5 text-gold-600" />}
    </button>
  )
}
