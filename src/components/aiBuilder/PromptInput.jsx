import { useState } from 'react'
import { FiSend, FiClipboard, FiLayout } from 'react-icons/fi'

const INITIAL_OPTIONS = [
  {
    key: 'enquiry',
    label: 'Enquiry for the Project',
    description: 'Describe your requirements and get a cost & timeline plan',
    Icon: FiClipboard,
  },
  {
    key: 'page_builder',
    label: 'Design Sample of Static Page',
    description: 'Get page suggestions and preview a generated design',
    Icon: FiLayout,
  },
]

const MODE_CONFIG = {
  // Mode is undecided until the first real message - the backend classifies intent
  // from whatever gets typed, so this placeholder covers both paths at once.
  undecided: {
    placeholder: "Describe the page you want, or tell me about a project you'd like to plan — e.g. 'Landing page for a bakery' or 'I need an e-commerce site built'",
    maxLength: 500,
  },
  page_builder: {
    placeholder: "Describe the change you want — e.g. 'make the header dark blue'",
    maxLength: 300,
  },
  enquiry: {
    placeholder: 'Describe your project and requirements...',
    maxLength: 500,
  },
}

export default function PromptInput({ mode = 'undecided', onSubmit, onSelectIntent, disabled, showInitialOptions }) {
  const [value, setValue] = useState('')
  const config = MODE_CONFIG[mode] ?? MODE_CONFIG.undecided
  const trimmed = value.trim()
  const overLimit = value.length > config.maxLength

  const submit = () => {
    if (!trimmed || overLimit || disabled) return
    onSubmit(trimmed)
    setValue('')
  }

  if (mode === 'undecided' && showInitialOptions) {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {INITIAL_OPTIONS.map(({ key, label, description, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelectIntent(key)}
            disabled={disabled}
            className="flex flex-col items-start gap-1 rounded-xl border border-ink-200 dark:border-ink-700 p-3 text-left transition-colors hover:border-gold-400 hover:bg-gold-400/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-white">
              <Icon className="h-4 w-4 text-gold-500" /> {label}
            </span>
            <span className="text-xs text-ink-500 dark:text-ink-300">{description}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // Skip while an IME composition is in progress (e.g. Japanese/Chinese/Korean
            // input) — Enter there confirms the candidate, it shouldn't submit the message.
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
          disabled={disabled}
          rows={2}
          placeholder={config.placeholder}
          className={`min-w-0 flex-1 resize-none rounded-xl border bg-transparent px-3 py-2.5 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 disabled:opacity-60 ${
            overLimit ? 'border-red-400' : 'border-ink-200 dark:border-ink-700 focus:border-gold-400'
          }`}
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !trimmed || overLimit}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 dark:bg-gold-400 text-white dark:text-ink-950 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiSend className="h-4 w-4" />
        </button>
      </div>
      <p className={`text-right text-xs ${overLimit ? 'text-red-500' : 'text-ink-400'}`}>
        {value.length}/{config.maxLength}
      </p>
    </div>
  )
}
