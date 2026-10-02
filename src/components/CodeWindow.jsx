import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

// Token colours: keyword, string, function, comment, plain.
const COLORS = {
  k: 'text-gold-400',
  s: 'text-emerald-300',
  f: 'text-sky-300',
  c: 'text-ink-400',
  p: 'text-ink-100',
}

const CODE = [
  [['c', '// from idea to production']],
  [['k', 'const '], ['p', 'project = '], ['k', 'await '], ['f', 'webnest'], ['p', '.'], ['f', 'build'], ['p', '({']],
  [['p', '  idea: '], ['s', "'your product'"], ['p', ',']],
  [['p', '  stack: ['], ['s', "'React'"], ['p', ', '], ['s', "'Spring Boot'"], ['p', ', '], ['s', "'Python'"], ['p', '],']],
  [['p', '  ai: '], ['k', 'true'], ['p', ',']],
  [['p', '})']],
  [],
  [['k', 'await '], ['p', 'project.'], ['f', 'test'], ['p', '()']],
  [['k', 'await '], ['p', 'project.'], ['f', 'deploy'], ['p', '('], ['s', "'production'"], ['p', ')']],
]

const OUTPUT = ['✓ tests passed', '✓ build optimised', '✓ live in production']

const TOTAL = CODE.reduce((sum, line) => sum + line.reduce((n, [, text]) => n + text.length, 0), 0)
const TYPE_MS = 32
const OUTPUT_MS = 550
const HOLD_MS = 4500

// Decorative editor window that types a short program, prints its output, then starts
// again. Shown complete and still for reduced-motion visitors.
export default function CodeWindow({ className = '' }) {
  const reduced = useReducedMotion()
  const [typed, setTyped] = useState(0)
  const [printed, setPrinted] = useState(0)

  useEffect(() => {
    if (reduced) return undefined
    let delay = TYPE_MS
    let next = () => setTyped((n) => n + 1)
    if (typed >= TOTAL) {
      if (printed < OUTPUT.length) {
        delay = OUTPUT_MS
        next = () => setPrinted((n) => n + 1)
      } else {
        delay = HOLD_MS
        next = () => { setTyped(0); setPrinted(0) }
      }
    }
    const timer = setTimeout(next, delay)
    return () => clearTimeout(timer)
  }, [typed, printed, reduced])

  const shownChars = reduced ? TOTAL : typed
  const shownOutput = reduced ? OUTPUT.length : printed
  let remaining = shownChars

  return (
    <div aria-hidden="true" className={`overflow-hidden rounded-2xl border border-gold-400/30 bg-ink-900/80 text-left shadow-2xl shadow-black/50 backdrop-blur ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-400/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        <span className="ml-3 font-mono text-xs text-ink-300">deliver.js</span>
      </div>
      <pre className="min-h-[15.5rem] overflow-hidden px-5 py-4 font-mono text-[13px] leading-6 sm:text-sm sm:leading-7">
        {CODE.map((line, index) => {
          const lineStart = remaining
          const parts = line.map(([color, text], part) => {
            const visible = text.slice(0, Math.max(0, remaining))
            remaining -= text.length
            return visible ? <span key={part} className={COLORS[color]}>{visible}</span> : null
          })
          // The caret sits on the line currently being typed.
          const typing = !reduced && lineStart > 0 && remaining <= 0 && shownChars < TOTAL
          return (
            <div key={index} className="flex">
              <span className="mr-4 w-5 shrink-0 select-none text-right text-ink-600">{index + 1}</span>
              <span className="whitespace-pre">
                {parts}
                {typing && <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse bg-gold-400" />}
              </span>
            </div>
          )
        })}
      </pre>
      <div className="min-h-[6.5rem] border-t border-white/10 bg-black/40 px-5 py-3 font-mono text-xs leading-6 text-emerald-300 sm:text-[13px]">
        <p className="text-ink-400">$ npm run deploy</p>
        {OUTPUT.slice(0, shownOutput).map((line) => <p key={line}>{line}</p>)}
      </div>
    </div>
  )
}
