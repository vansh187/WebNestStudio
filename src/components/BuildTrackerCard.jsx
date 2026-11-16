import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiArrowUpRight, FiCheck, FiZap } from 'react-icons/fi'
import { VscVscode } from 'react-icons/vsc'
import { usePrime } from '../hooks/usePrime'
import { VSCODE_EXTENSION } from '../data/vscodeExtension'
import { PLAN_RUPEES } from '../lib/codelab/assistantCheckout'

const CHIPS = ['React', 'Python', 'Java', 'VS Code']
// Which tech chips light up while each stage (by row index) is being worked on.
const STAGE_CHIPS = [[], [], ['React', 'Java'], ['Python', 'VS Code']]
const LIVE_STAGES = [2, 3]
const FILL_LOGS = [
  'mapping requirements & user flows',
  'finalising the UI design system',
  'scaffolding React + Spring Boot',
  'wiring LLM endpoints',
]
const TICK_LOGS = {
  2: ['compiling React components', 'shipping REST endpoints', 'writing integration tests', 'optimising bundle size', 'running Spring Boot build'],
  3: ['embedding knowledge base', 'tuning prompt pipeline', 'reviewing code in VS Code', 'adding RAG retrieval', 'streaming chat responses'],
}
// How long each phase lasts before the next step, in ms.
const DELAY = { idle: 400, filling: 800, live: 1300, shipped: 3800, synced: 3000, resetting: 800 }
const FIRST_BUILD = 41
const SPARKS = 14

// The little VS Code chat scene: question, typing, answer, change applied, then again.
// An illustration of the extension's Ask mode, not a real session.
const CHAT_DELAYS = [1100, 1000, 1700, 2800]
const CHAT_LAST = CHAT_DELAYS.length - 1

const pick = (list) => list[Math.floor(Math.random() * list.length)]
const withValue = (values, i, v) => values.map((old, j) => (j === i ? v : old))

// `fixed[i]` marks rows whose value is real API data: they are shown exactly and never animated past it.
function advance(s, targets, labels, fixed) {
  const id = s.log.id + 1
  switch (s.phase) {
    case 'idle':
      return { ...s, phase: 'filling', step: 0, values: withValue(s.values, 0, targets[0]), active: 0, log: { text: FILL_LOGS[0], id } }
    case 'filling': {
      const i = s.step + 1
      if (i < targets.length) {
        return { ...s, step: i, values: withValue(s.values, i, targets[i]), active: i, log: { text: FILL_LOGS[i], id } }
      }
      return { ...s, phase: 'live', active: null }
    }
    case 'live': {
      const growing = LIVE_STAGES.filter((i) => !fixed[i] && s.values[i] < 100)
      if (growing.length === 0) {
        if (s.values.every((v) => v >= 100)) {
          return { ...s, phase: 'shipped', active: null, log: { text: `deployed to production · build #${s.build} live`, id } }
        }
        return { ...s, phase: 'synced', active: null, log: { text: 'synced with live project status', id } }
      }
      const stage = pick(LIVE_STAGES.filter((i) => s.values[i] < 100))
      if (fixed[stage]) {
        return { ...s, active: stage, log: { text: pick(TICK_LOGS[stage]), id } }
      }
      const next = Math.min(100, s.values[stage] + 4 + Math.floor(Math.random() * 7))
      const text = next === 100 ? `${labels[stage].toLowerCase()} complete` : pick(TICK_LOGS[stage])
      return { ...s, values: withValue(s.values, stage, next), active: stage, log: { text, id } }
    }
    case 'shipped':
    case 'synced':
      return { ...s, phase: 'resetting', values: [0, 0, 0, 0], active: null, log: { text: 'starting next build…', id } }
    default:
      return { ...s, phase: 'idle', build: s.build + 1 }
  }
}

function CountUp({ value, reduced }) {
  const [shown, setShown] = useState(0)
  const shownRef = useRef(0)

  useEffect(() => {
    if (reduced) return undefined
    const controls = animate(shownRef.current, value, {
      duration: 0.7,
      ease: 'easeOut',
      onUpdate: (v) => {
        shownRef.current = v
        setShown(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [value, reduced])

  return <span className="tabular-nums">{reduced ? value : shown}%</span>
}

function TypeLine({ text, reduced }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (reduced) return undefined
    let n = 0
    const t = setInterval(() => {
      n += 1
      setCount(n)
      if (n >= text.length) clearInterval(t)
    }, 22)
    return () => clearInterval(t)
  }, [text, reduced])

  return reduced ? text : text.slice(0, count)
}

function VsCodeChat({ running, children }) {
  // Starts on the finished frame, which is also what reduced motion and the prerender show.
  const [step, setStep] = useState(CHAT_LAST)

  useEffect(() => {
    if (!running) return undefined
    const t = setTimeout(() => setStep((n) => (n === CHAT_LAST ? 0 : n + 1)), CHAT_DELAYS[step])
    return () => clearTimeout(t)
  }, [running, step])

  const fixed = step === CHAT_LAST
  const show = (from) => `transition-all duration-500 ${step >= from ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`

  return (
    <div aria-hidden="true" className="relative mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] text-[10px] shadow-[0_18px_40px_-20px_rgba(59,154,232,0.45)]">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-[#2d2d2d] px-2.5 py-1.5">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <VscVscode className="ml-1.5 h-3 w-3 shrink-0 text-[#3b9ae8]" />
        <span className="truncate text-[10px] text-ink-400">stats.py — my-project — Visual Studio Code</span>
      </div>

      <div className="flex">
        {/* Activity bar, with the WebNest AI view selected */}
        <div className="flex w-6 shrink-0 flex-col items-center gap-2 border-r border-white/5 bg-[#333333] py-2">
          <span className="h-2.5 w-2.5 rounded-sm border border-ink-500" />
          <span className="h-2.5 w-2.5 rounded-full border border-ink-500" />
          <span className="relative flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950">
            <FiZap className="h-2.5 w-2.5" />
            <span className="absolute -left-[5px] top-0 h-4 w-0.5 bg-gold-400" />
          </span>
        </div>

        {/* Editor */}
        <div className="min-w-0 flex-[1_1_0%] border-r border-white/10">
          <div className="flex border-b border-white/5 bg-[#252526]">
            <span className="border-t border-gold-400 bg-[#1e1e1e] px-2 py-1 font-mono text-[9px] text-ink-200">stats.py</span>
          </div>
          <pre className="overflow-hidden px-2 py-1.5 font-mono text-[9.5px] leading-[15px] text-ink-300">
            <span className="block"><span className="mr-2 text-ink-600">1</span><span className="text-[#c586c0]">def</span> <span className="text-[#dcdcaa]">avg</span>(xs):</span>
            <span className="block whitespace-nowrap">
              <span className="mr-2 text-ink-600">2</span>{'  '}<span className="text-[#c586c0]">return</span> sum(xs) / {fixed
                ? <span className="rounded-sm bg-emerald-400/15 text-emerald-300">len(xs)</span>
                : <span className="underline decoration-red-400 decoration-wavy underline-offset-2">len(x)</span>}
            </span>
          </pre>
          <p
            className={`mx-2 mb-2 flex w-fit items-center gap-1 rounded px-1.5 py-0.5 font-sans text-[9px] transition-colors duration-500 ${
              fixed ? 'bg-emerald-400/10 text-emerald-300' : 'bg-gold-400/15 text-gold-200'
            }`}
          >
            {fixed ? <><FiCheck className="h-2.5 w-2.5" /> No problems</> : <><FiZap className="h-2.5 w-2.5" /> Fix with WebNest AI</>}
          </p>
        </div>

        {/* WebNest AI chat panel */}
        <div className="flex min-w-0 flex-[1.15_1_0%] flex-col gap-1.5 p-2">
          <p className="flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-widest text-gold-300">
            WebNest AI
            <span className="ml-auto rounded-full bg-gold-400/15 px-1.5 text-[8px] tracking-wider text-gold-200">Ask</span>
          </p>
          <p className={`ml-auto w-fit max-w-full rounded-lg rounded-br-sm bg-[#3b9ae8]/20 px-1.5 py-1 text-[9.5px] text-sky-100 ${show(0)}`}>
            Why does avg crash?
          </p>
          {step === 1 ? (
            <p className="flex w-fit gap-0.5 rounded-lg bg-white/5 px-2 py-1.5">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-1 w-1 animate-bounce rounded-full bg-gold-300" style={{ animationDelay: `${d}ms` }} />
              ))}
            </p>
          ) : (
            <p className={`rounded-lg rounded-bl-sm bg-white/5 px-1.5 py-1 text-[9.5px] leading-snug text-ink-200 ${show(2)}`}>
              <span className="font-mono text-gold-200">x</span> isn't defined. Use <span className="font-mono text-gold-200">len(xs)</span>.
            </p>
          )}
          <span
            className={`mt-auto inline-flex w-fit items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-semibold ${show(2)} ${
              fixed ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300' : 'border-gold-400/60 text-gold-200'
            }`}
          >
            {fixed ? <><FiCheck className="h-2.5 w-2.5" /> Applied</> : 'Apply…'}
          </span>
        </div>
      </div>
      {children}
    </div>
  )
}

/**
 * Hero "live build tracker": bars fill in sequence, then Development / AI Integration keep
 * creeping up with the matching tech chips glowing, until everything ships and the loop restarts.
 * Pauses while off-screen or in a hidden tab; renders a static snapshot for reduced motion.
 */
export default function BuildTrackerCard({ projectName, devLabel, devPercent }) {
  const reduced = useReducedMotion()
  const { isPrime, showOffer } = usePrime()
  const labels = useMemo(() => ['Discovery', 'Design', devLabel ?? 'Development', 'AI Integration'], [devLabel])
  const hasRealDev = typeof devPercent === 'number' && Number.isFinite(devPercent)
  const targets = useMemo(
    () => [100, 100, hasRealDev ? Math.min(100, Math.max(0, Math.round(devPercent))) : 65, 48],
    [hasRealDev, devPercent],
  )
  const fixed = useMemo(() => [false, false, hasRealDev, false], [hasRealDev])

  const [state, setState] = useState({
    phase: 'idle', step: 0, values: [0, 0, 0, 0], active: null, build: FIRST_BUILD, log: { text: 'queueing build…', id: 0 },
  })

  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onChange = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  const running = inView && pageVisible && !reduced
  useEffect(() => {
    if (!running) return undefined
    const t = setTimeout(() => setState((s) => advance(s, targets, labels, fixed)), DELAY[state.phase])
    return () => clearTimeout(t)
  }, [state, running, targets, labels, fixed])

  const view = reduced
    ? { phase: 'live', values: targets, active: null, build: FIRST_BUILD, log: { text: 'building…', id: 0 } }
    : state
  const shipped = view.phase === 'shipped'
  const lit = shipped ? CHIPS : view.active != null ? STAGE_CHIPS[view.active] : []

  // Mouse tilt + glare (mouse only, so touch scrolling isn't hijacked).
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 150, damping: 18 })
  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 150, damping: 18 })
  const glareX = useTransform(mx, (v) => v * 100)
  const glareY = useTransform(my, (v) => v * 100)
  const glare = useMotionTemplate`radial-gradient(260px circle at ${glareX}% ${glareY}%, rgba(230, 172, 62, 0.16), transparent 70%)`

  const onPointerMove = (e) => {
    if (reduced || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const onPointerLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <div ref={ref} style={{ perspective: 1000 }} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <motion.div style={reduced ? undefined : { rotateX, rotateY }}>
        <div
          className={`relative animate-float rounded-3xl border bg-white/60 dark:bg-ink-900/60 p-4 shadow-2xl backdrop-blur-xl transition-[box-shadow,border-color] duration-700 ${
            shipped
              ? 'border-gold-400 shadow-[0_0_60px_-8px_rgba(230,172,62,0.65)]'
              : 'border-gold-400/30'
          }`}
        >
          {!reduced && (
            <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background: glare }} />
          )}

          <div className="relative flex items-center justify-between gap-3 border-b border-ink-200 dark:border-ink-700 pb-3">
            <span className="truncate text-xs font-semibold uppercase tracking-widest text-gold-500">
              {projectName ?? 'Project Status'}
            </span>
            <span className="flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-widest">
              <span className="tabular-nums text-ink-400">#{view.build}</span>
              <span className={shipped ? 'text-emerald-500' : 'text-gold-500'}>{shipped ? 'Shipped' : 'Live'}</span>
              <span className="relative flex h-2.5 w-2.5">
                {!reduced && (
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                      shipped ? 'bg-emerald-400' : 'bg-gold-400'
                    }`}
                  />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${shipped ? 'bg-emerald-500' : 'bg-gold-400'}`}
                />
              </span>
            </span>
          </div>

          <div className="relative mt-3 space-y-2">
            {labels.map((label, i) => {
              const value = view.values[i]
              const done = value >= 100
              const working = view.active === i
              const shimmer = !reduced && !done && value > 0
              return (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span
                      className={`flex items-center gap-1.5 transition-colors duration-300 ${
                        working ? 'font-medium text-ink-900 dark:text-white' : 'text-ink-500 dark:text-ink-300'
                      }`}
                    >
                      {label}
                      <AnimatePresence>
                        {done && (
                          <motion.span
                            initial={{ scale: 0, rotate: -60 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold-400 text-ink-950"
                          >
                            <FiCheck className="h-2.5 w-2.5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span
                      className={
                        done ? 'font-semibold text-gold-600 dark:text-gold-400' : 'text-ink-500 dark:text-ink-300'
                      }
                    >
                      <CountUp value={value} reduced={reduced} />
                    </span>
                  </div>
                  <div className="relative h-1.5 w-full rounded-full bg-ink-100 dark:bg-ink-800">
                    <div
                      className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-gold-300 to-gold-500 transition-[width] duration-700 ease-out"
                      style={{ width: `${value}%` }}
                    >
                      {shimmer && (
                        <span className="absolute inset-y-0 left-0 w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                      )}
                    </div>
                    {working && !reduced && value > 0 && (
                      <span
                        className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300 shadow-[0_0_12px_3px_rgba(230,172,62,0.7)] transition-[left] duration-700 ease-out"
                        style={{ left: `${value}%` }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="relative mt-3 grid grid-cols-4 gap-2">
            {CHIPS.map((t) => {
              const on = lit.includes(t)
              return (
                <span
                  key={t}
                  className={`flex items-center justify-center gap-1 rounded-lg border py-1 text-center text-xs font-semibold transition-all duration-300 ${
                    on
                      ? 'scale-105 border-gold-400 bg-gold-400/15 text-gold-700 shadow-[0_0_16px_rgba(230,172,62,0.45)] dark:text-gold-300'
                      : 'border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-200'
                  }`}
                >
                  {shipped ? <FiCheck className="h-3 w-3 shrink-0" /> : t === 'VS Code' && <VscVscode aria-hidden="true" className="h-3 w-3 shrink-0 text-[#3b9ae8]" />}
                  <span className="truncate">{t}</span>
                </span>
              )
            })}

            {shipped &&
              !reduced &&
              Array.from({ length: SPARKS }, (_, i) => {
                const angle = (i / SPARKS) * Math.PI * 2
                return (
                  <motion.span
                    key={`${view.build}-${i}`}
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-gold-400"
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: Math.cos(angle) * 150, y: Math.sin(angle) * 45, opacity: 0, scale: 0.3 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                )
              })}
          </div>

          {/* The build log runs along the bottom of the VS Code window, as its status bar. */}
          <VsCodeChat running={running}>
            <div className={`flex items-center gap-2 px-2.5 py-1 font-mono text-[10px] text-white transition-colors duration-700 ${shipped ? 'bg-emerald-600' : 'bg-[#007acc]'}`}>
              <span className="shrink-0">{shipped ? '✓' : '⎇ main'}</span>
              <span className="truncate opacity-90">
                <TypeLine key={view.log.id} text={view.log.text} reduced={reduced} />
              </span>
              {!reduced && <span aria-hidden className="h-2.5 w-1 shrink-0 animate-blink bg-white/80" />}
              <span className="ml-auto shrink-0 opacity-80">#{view.build}</span>
            </div>
          </VsCodeChat>

          {/* Both ways to use WebNest AI: the monthly pass on the website, and the free VS Code
              extension, which signs in with that same pass. The pass tile waits until we know
              whether to show an offer; the extension tile always shows. */}
          <div className={`relative mt-3 grid gap-2 ${isPrime || showOffer ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {(isPrime || showOffer) && (
              <Link
                to={isPrime ? '/codelab/playground' : '/prime'}
                className="group flex min-w-0 items-center gap-2 rounded-xl border border-gold-400/60 bg-gold-400/10 px-2.5 py-2 transition-colors hover:border-gold-400 hover:bg-gold-400/20"
              >
                <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950"><FiZap className="h-3.5 w-3.5" /></span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[13px] font-bold text-ink-900 dark:text-white">WebNest AI</span>
                  <span className="block truncate text-[11px] text-ink-600 dark:text-ink-300">
                    {isPrime ? 'Open playground' : <><span className="font-bold text-gold-600 dark:text-gold-300">₹{PLAN_RUPEES}</span> a month</>}
                  </span>
                </span>
                <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-gold-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
            <a
              href={VSCODE_EXTENSION.marketplaceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-w-0 items-center gap-2 rounded-xl border border-[#3b9ae8]/50 bg-[#3b9ae8]/10 px-2.5 py-2 transition-colors hover:border-[#3b9ae8] hover:bg-[#3b9ae8]/20"
            >
              <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1e1e1e] ring-1 ring-white/10"><VscVscode className="h-4 w-4 text-[#3b9ae8]" /></span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="flex items-center gap-1.5 text-[13px] font-bold text-ink-900 dark:text-white">
                  <span className="truncate">VS Code</span>
                  <span className="shrink-0 rounded-full bg-gold-400 px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-ink-950">New</span>
                </span>
                <span className="block truncate text-[11px] text-ink-600 dark:text-ink-300">
                  <span className="font-bold text-ink-900 dark:text-white">Free</span> install
                </span>
              </span>
              <FiArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#3b9ae8] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="sr-only">WebNest AI for VS Code (opens the VS Code Marketplace in a new tab)</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
