import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { FiArrowRight, FiCheck, FiCode, FiLoader, FiMessageCircle, FiZap } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'
import { usePrime } from '../hooks/usePrime'
import { PLAN_DAYS, PLAN_RUPEES } from '../lib/codelab/assistantCheckout'

const EASE = [0.22, 1, 0.36, 1]

const FEATURES = [
  { icon: FiMessageCircle, title: 'Ask', text: 'Get answers about the code in front of you, with changes you can apply when you choose.' },
  { icon: FiZap, title: 'Agent', text: 'Describe what you want. It writes the files, runs the project and fixes what breaks.' },
  { icon: FiCode, title: 'Every playground', text: 'Web, Python, Java and FastAPI, right in your browser with nothing to install.' },
]

// One scripted run of Agent mode, played as a short scene. An illustration, not a real session.
const STEPS = ['Reading your project', 'Created app/main.py', 'Created app/notes.py', 'Ran the project', 'Fixed an import and ran it again', 'Your API is running']
const CODE = [
  'from fastapi import FastAPI',
  'from app.notes import router',
  '',
  'app = FastAPI(title="Notes API")',
  'app.include_router(router)',
  '',
  '@app.get("/api/health")',
  'def health():',
  '    return {"status": "ok"}',
]
const STEP_MS = 1400
const REST_MS = 3200

function AgentScene() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3 })
  const reduceMotion = useReducedMotion()
  const last = STEPS.length - 1
  const [step, setStep] = useState(last)

  useEffect(() => {
    if (!inView || reduceMotion || window.__PRERENDER__) return undefined
    let current = 0
    let timer
    const play = () => {
      setStep(current)
      const rest = current === last
      timer = setTimeout(() => {
        current = rest ? 0 : current + 1
        play()
      }, rest ? REST_MS : STEP_MS)
    }
    play()
    return () => clearTimeout(timer)
  }, [inView, last, reduceMotion])

  const shownLines = Math.ceil(((step + 1) / STEPS.length) * CODE.length)

  return (
    <figure ref={ref} className="mx-auto w-full max-w-5xl">
      <div aria-hidden="true" className="launch-frame overflow-hidden rounded-2xl border border-gold-400/30 bg-[#0d0c0a]/90 text-left shadow-[0_40px_120px_-30px_rgba(212,169,79,0.45)] backdrop-blur">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950"><FiZap className="h-3.5 w-3.5" /></span>
          <span className="text-xs font-semibold text-white">WebNest AI</span>
          <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold-300">Agent</span>
          <span className="ml-auto font-mono text-[11px] text-ink-400">app/main.py</span>
        </div>
        <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className="border-b border-white/10 p-5 md:border-b-0 md:border-r">
            <p className="ml-auto w-fit max-w-full rounded-2xl rounded-br-sm bg-gold-400/15 px-3.5 py-2 text-sm text-gold-100">Build me a notes API with SQLite</p>
            <ul className="mt-5 space-y-2.5">
              {STEPS.map((label, index) => (
                <li key={label} className={`flex items-center gap-2.5 text-[13px] transition-opacity duration-500 ${index <= step ? 'opacity-100' : 'opacity-0'}`}>
                  {index < step || step === last
                    ? <FiCheck className="h-4 w-4 shrink-0 text-gold-400" />
                    : <FiLoader className="h-4 w-4 shrink-0 animate-spin text-gold-400" />}
                  <span className={index === last ? 'font-semibold text-white' : 'text-ink-300'}>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <pre className="min-h-56 overflow-hidden p-5 font-mono text-[12.5px] leading-6 text-ink-200">
            {CODE.map((line, index) => (
              <span key={`${index}-${line}`} className={`block min-h-6 transition-opacity duration-500 ${index < shownLines ? 'opacity-100' : 'opacity-0'}`}>
                <span className="mr-4 inline-block w-4 select-none text-right text-ink-600">{index + 1}</span>{line}
              </span>
            ))}
          </pre>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-ink-500">Illustration of Agent mode. Real results depend on your project.</figcaption>
    </figure>
  )
}

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.9, delay, ease: EASE },
})

// The launch of WebNest AI on the home page: a dark, film-like scene in black and gold.
export default function WebNestAiLaunch() {
  const { isPrime, label, showOffer } = usePrime()

  return (
    <section aria-labelledby="webnest-ai-launch" className="dark launch-stage relative isolate overflow-hidden text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="launch-spotlight" />
        <div className="launch-beam launch-beam-a" />
        <div className="launch-beam launch-beam-b" />
        <div className="launch-grain" />
      </div>
      {/* Letterbox lines, as on a cinema screen. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-24 text-center sm:py-32 lg:px-8">
        <motion.p {...rise()} className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.42em] text-gold-300 sm:text-xs">
          <span className="h-1.5 w-1.5 animate-glow rounded-full bg-gold-300" aria-hidden="true" />
          Now launching
        </motion.p>

        <motion.h2 {...rise(0.1)} id="webnest-ai-launch" className="launch-metal mt-6 font-display text-6xl font-extrabold leading-[1.05] tracking-tight sm:text-8xl lg:text-9xl">
          WebNest AI
        </motion.h2>

        <motion.p {...rise(0.25)} className="mx-auto mt-6 max-w-2xl font-display text-xl font-medium leading-snug text-ink-100 sm:text-3xl">
          Describe it. Watch it build. Run it.
        </motion.p>
        <motion.p {...rise(0.35)} className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-300">
          An AI coding partner inside your CodeLab playground, which writes, runs and fixes your project in your browser.
        </motion.p>

        {showOffer && (
        <motion.div {...rise(0.45)} className="mt-10">
          <p className="font-display text-5xl font-extrabold text-white sm:text-6xl">
            ₹{PLAN_RUPEES}<span className="ml-2 text-base font-medium text-ink-300 sm:text-lg">per month</span>
          </p>
          <p className="mt-3 text-sm text-ink-300">One payment gives {PLAN_DAYS} days, with no automatic renewal. Usage limits apply.</p>
        </motion.div>
        )}

        <motion.div {...rise(0.55)} className="mt-9 flex flex-wrap items-center justify-center gap-4">
          {isPrime ? (
            <>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold-300"><FaCrown className="h-4 w-4" aria-hidden="true" /> You're a {label}</span>
              <Link to="/codelab/playground" className="launch-cta group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-ink-950">
                Open the playground <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </>
          ) : (
            <>
              {showOffer && (
              <Link to="/prime" className="launch-cta group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-ink-950">
                <FaCrown className="h-4 w-4" aria-hidden="true" /> Become a Prime Member
                <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              )}
              <Link to="/codelab/playground" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-300">
                Explore the playground
              </Link>
            </>
          )}
        </motion.div>

        <motion.div {...rise(0.2)} className="mt-20">
          <AgentScene />
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-left md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, index) => (
            <motion.div key={title} {...rise(index * 0.12)} className="bg-[#0d0c0a] p-7">
              <Icon className="h-5 w-5 text-gold-400" aria-hidden="true" />
              <h3 className="mt-4 font-display text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
