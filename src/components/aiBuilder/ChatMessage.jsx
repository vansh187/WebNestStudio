import { FiEye } from 'react-icons/fi'
import CodingIcon from './CodingIcon'

export default function ChatMessage({ message, isActiveSnapshot, onSelectSnapshot }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-ink-900 dark:bg-gold-400 px-4 py-2.5 text-sm text-white dark:text-ink-950">
          {message.content}
        </div>
      </div>
    )
  }

  const hasSnapshot = Boolean(message.html_snapshot)

  return (
    <div className="flex items-start gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400/10 text-gold-500">
        <CodingIcon className="h-4 w-4" />
      </div>
      <div className="max-w-[85%] space-y-2">
        <div className="rounded-2xl rounded-tl-sm border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900/60 px-4 py-2.5 text-sm text-ink-700 dark:text-ink-200">
          {message.content}
        </div>
        {hasSnapshot && (
          <button
            type="button"
            onClick={() => onSelectSnapshot(message.html_snapshot)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
              isActiveSnapshot
                ? 'border-gold-400 bg-gold-400/10 text-gold-500'
                : 'border-ink-200 text-ink-500 hover:border-gold-400 hover:text-gold-500 dark:border-ink-700 dark:text-ink-300'
            }`}
          >
            <FiEye className="h-3 w-3" /> {isActiveSnapshot ? 'Previewing this version' : 'View this version'}
          </button>
        )}
      </div>
    </div>
  )
}
