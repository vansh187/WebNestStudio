import { FiMaximize2, FiMinimize2, FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'

// Toolbar buttons shared by the coding workspaces; each toolbar passes its own button style.

export function ThemeToggleButton({ className }) {
  const { theme, toggleTheme } = useTheme()
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`
  return (
    <button type="button" onClick={toggleTheme} className={className} title={label} aria-label={label}>
      {theme === 'dark' ? <FiMoon className="h-4 w-4" /> : <FiSun className="h-4 w-4" />}
    </button>
  )
}

export function FullscreenButton({ maximized, onToggle, className }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={maximized}
      aria-label={maximized ? 'Exit full screen' : 'Full screen'}
      title={maximized ? 'Exit full screen (Esc)' : 'Full screen'}
      className={className}
    >
      {maximized ? <FiMinimize2 className="h-4 w-4" /> : <FiMaximize2 className="h-4 w-4" />}
    </button>
  )
}
