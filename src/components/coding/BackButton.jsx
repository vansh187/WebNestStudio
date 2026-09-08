import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'

// Goes back in history, or to `fallback` when the page was opened directly
// (deep link / new tab) and there's nothing to go back to.
export default function BackButton({ fallback = '/', label = 'Back', className = '' }) {
  const navigate = useNavigate()
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) navigate(-1)
    else navigate(fallback)
  }
  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-gold-500 dark:text-ink-300 dark:hover:text-gold-400 ${className}`}
    >
      <FiArrowLeft className="h-4 w-4" /> {label}
    </button>
  )
}
