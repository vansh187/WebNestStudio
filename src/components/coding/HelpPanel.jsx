import { useEffect, useRef, useState } from 'react'
import { FiAlertCircle, FiCheck, FiCopy, FiKey, FiPackage } from 'react-icons/fi'
import {
  HELP_TROUBLESHOOTING, KEY_CODE_EXAMPLE, KEY_ENV_EXAMPLE, KEY_NOTES, KEY_STEPS, PACKAGE_COMMANDS, PACKAGE_NOTES,
} from '../../data/playgroundHelp'

const HEADING = 'flex items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400'
const TEXT = 'text-xs text-ink-600 dark:text-ink-300'

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }
  return (
    <button type="button" onClick={copy} aria-label={copied ? 'Copied' : `Copy ${label}`} className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-ink-300 hover:bg-ink-800 hover:text-white">
      {copied ? <FiCheck className="h-3 w-3" /> : <FiCopy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function CodeBlock({ code, label, caption }) {
  return (
    <div className="flex flex-col gap-1">
      {caption && <span className="text-[11px] font-semibold text-ink-500 dark:text-ink-400">{caption}</span>}
      <div className="relative">
        <pre className="overflow-x-auto rounded-lg bg-ink-950 p-3 pr-16 font-mono text-[11px] leading-relaxed text-ink-100">{code}</pre>
        <div className="absolute right-1 top-1"><CopyButton text={code} label={label} /></div>
      </div>
    </div>
  )
}

function Bullets({ items }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item} className={`flex gap-1.5 ${TEXT}`}>
          <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// The Help tab: how to install packages and add API keys.
export default function HelpPanel({ className = '', embedded = false }) {
  return (
    <div className={`flex flex-col gap-5 ${embedded ? '' : 'rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900/40'} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={`font-display text-sm font-semibold text-ink-900 dark:text-white ${embedded ? 'sr-only' : ''}`}>Help</h2>
        <span className="text-[11px] text-ink-400">Install packages and add your keys</span>
      </div>

      <section aria-labelledby="help-packages" className="flex flex-col gap-2">
        <h3 id="help-packages" className={HEADING}><FiPackage className="h-3.5 w-3.5" /> Installing packages</h3>
        <p className={TEXT}>Type these in the terminal on the Output tab.</p>
        <ul className="flex flex-col gap-1.5">
          {PACKAGE_COMMANDS.map((item) => (
            <li key={item.command} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              <code className="rounded bg-ink-950 px-1.5 py-0.5 font-mono text-[11px] text-ink-100">{item.command}</code>
              <span className="text-ink-600 dark:text-ink-300">{item.does}</span>
            </li>
          ))}
        </ul>
        <Bullets items={PACKAGE_NOTES} />
      </section>

      <section aria-labelledby="help-keys" className="flex flex-col gap-2">
        <h3 id="help-keys" className={HEADING}><FiKey className="h-3.5 w-3.5" /> Adding API keys</h3>
        <ol className="flex list-decimal flex-col gap-1 pl-4">
          {KEY_STEPS.map((step) => <li key={step} className={TEXT}>{step}</li>)}
        </ol>
        <CodeBlock caption=".env" code={KEY_ENV_EXAMPLE} label="the .env example" />
        <CodeBlock caption="Your code" code={KEY_CODE_EXAMPLE} label="the code example" />
        <Bullets items={KEY_NOTES} />
      </section>

      <section aria-labelledby="help-troubleshooting" className="flex flex-col gap-2">
        <h3 id="help-troubleshooting" className={HEADING}><FiAlertCircle className="h-3.5 w-3.5" /> If something goes wrong</h3>
        <dl className="flex flex-col gap-2">
          {HELP_TROUBLESHOOTING.map((item) => (
            <div key={item.problem} className="text-xs">
              <dt className="font-mono text-[11px] text-ink-900 dark:text-white">{item.problem}</dt>
              <dd className="text-ink-600 dark:text-ink-300">{item.fix}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
