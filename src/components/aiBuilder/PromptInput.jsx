import { useState } from 'react'
import { FiSend } from 'react-icons/fi'

const EXAMPLE_PROMPTS = [
  'Landing page for a bakery, warm colors, hero section, menu, contact form',
  'Portfolio page for a photographer, dark theme, image grid',
  'SaaS pricing page with 3 tiers and a FAQ section',
]

const MODE_CONFIG = {
  new: {
    placeholder: "Describe the page you want — e.g. 'Landing page for a bakery, warm colors, hero section, menu, contact form'",
    maxLength: 500,
  },
  refine: {
    placeholder: "Describe the change you want — e.g. 'make the header dark blue'",
    maxLength: 300,
  },
}

export default function PromptInput({ mode, onSubmit, disabled }) {
  const [value, setValue] = useState('')
  const config = MODE_CONFIG[mode]
  const trimmed = value.trim()
  const overLimit = value.length > config.maxLength

  const submit = () => {
    if (!trimmed || overLimit || disabled) return
    onSubmit(trimmed)
    setValue('')
  }

  return (
    <div className="space-y-2">
      {mode === 'new' && (
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setValue(p)}
              disabled={disabled}
              className="rounded-full border border-ink-200 dark:border-ink-700 px-2.5 py-1 text-xs text-ink-500 hover:border-gold-400 hover:text-gold-500 dark:text-ink-300 disabled:opacity-50"
            >
              {p.length > 36 ? `${p.slice(0, 36)}…` : p}
            </button>
          ))}
        </div>
      )}
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
