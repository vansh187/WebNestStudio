import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { FiClipboard, FiPenTool, FiCode, FiCheckCircle, FiUploadCloud, FiRefreshCw } from 'react-icons/fi'

const STAGES = [
  { label: 'Plan', text: 'Requirements and scope', icon: FiClipboard },
  { label: 'Design', text: 'Data model and screens', icon: FiPenTool },
  { label: 'Build', text: 'Java, Python, React, SQL', icon: FiCode },
  { label: 'Test', text: 'Unit and integration tests', icon: FiCheckCircle },
  { label: 'Deploy', text: 'Build, package, release', icon: FiUploadCloud },
  { label: 'Maintain', text: 'Monitor and improve', icon: FiRefreshCw },
]

const STEP_MS = 1700

// Decorative software life cycle: the six stages light up one after another, then the
// cycle starts again. Reduced-motion visitors see every stage lit.
export default function SdlcTrack({ className = '' }) {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduced) return undefined
    const timer = setInterval(() => setActive((index) => (index + 1) % STAGES.length), STEP_MS)
    return () => clearInterval(timer)
  }, [reduced])

  return (
    <div aria-hidden="true" className={`rounded-2xl border border-gold-400/30 bg-ink-900/80 p-6 text-left shadow-2xl shadow-black/50 backdrop-blur ${className}`}>
      <p className="font-mono text-xs uppercase tracking-widest text-ink-300">Software development life cycle</p>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500 transition-all duration-700"
          style={{ width: `${reduced ? 100 : ((active + 1) / STAGES.length) * 100}%` }}
        />
      </div>
      <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {STAGES.map(({ label, text, icon: Icon }, index) => {
          const done = reduced || index < active
          const current = !reduced && index === active
          return (
            <li
              key={label}
              className={`rounded-xl border p-4 transition-all duration-500 ${
                current
                  ? 'scale-[1.03] border-gold-400 bg-gold-400/15 shadow-lg shadow-gold-500/10'
                  : done
                    ? 'border-gold-400/30 bg-white/5'
                    : 'border-white/10 bg-white/[0.02] opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${current || done ? 'text-gold-400' : 'text-ink-400'}`} />
                <span className="font-mono text-[11px] text-ink-400">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <p className="mt-2 font-display text-base font-semibold text-white">{label}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-300">{text}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
