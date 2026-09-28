import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform,
} from 'framer-motion'
import { FiCheck } from 'react-icons/fi'

const CHIPS = ['React', 'Python', 'Java']
// Which tech chips light up while each stage (by row index) is being worked on.
const STAGE_CHIPS = [[], [], ['React', 'Java'], ['Python']]
const LIVE_STAGES = [2, 3]
const FILL_LOGS = [
  'mapping requirements & user flows',
  'finalising the UI design system',
  'scaffolding React + Spring Boot',
  'wiring LLM endpoints',
]
const TICK_LOGS = {
  2: ['compiling React components', 'shipping REST endpoints', 'writing integration tests', 'optimising bundle size', 'running Spring Boot build'],
  3: ['embedding knowledge base', 'tuning prompt pipeline', 'evaluating model responses', 'adding RAG retrieval', 'streaming chat responses'],
}
// How long each phase lasts before the next step, in ms.
const DELAY = { idle: 400, filling: 800, live: 1300, shipped: 3800, synced: 3000, resetting: 800 }
const FIRST_BUILD = 41
const SPARKS = 14

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

/**
 * Hero "live build tracker": bars fill in sequence, then Development / AI Integration keep
 * creeping up with the matching tech chips glowing, until everything ships and the loop restarts.
 * Pauses while off-screen or in a hidden tab; renders a static snapshot for reduced motion.
 */
export default function BuildTrackerCard({ projectName, devLabel, devPercent }) {
  const reduced = useReducedMotion()
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
          className={`relative animate-float rounded-3xl border bg-white/60 dark:bg-ink-900/60 p-5 shadow-2xl backdrop-blur-xl transition-[box-shadow,border-color] duration-700 ${
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

          <div className="relative mt-4 space-y-3">
            {labels.map((label, i) => {
              const value = view.values[i]
              const done = value >= 100
              const working = view.active === i
              const shimmer = !reduced && !done && value > 0
              return (
                <div key={i}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
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

          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {CHIPS.map((t) => {
              const on = lit.includes(t)
              return (
                <span
                  key={t}
                  className={`flex items-center justify-center gap-1 rounded-lg border py-1.5 text-center text-xs font-semibold transition-all duration-300 ${
                    on
                      ? 'scale-105 border-gold-400 bg-gold-400/15 text-gold-700 shadow-[0_0_16px_rgba(230,172,62,0.45)] dark:text-gold-300'
                      : 'border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-200'
                  }`}
                >
                  {shipped && <FiCheck className="h-3 w-3" />}
                  {t}
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

          <div className="relative mt-3 flex items-center gap-2 overflow-hidden rounded-lg bg-ink-900/[0.04] px-3 py-2 font-mono text-[11px] dark:bg-black/30">
            <span className={shipped ? 'text-emerald-500' : 'text-gold-500'}>{shipped ? '✓' : '›'}</span>
            <span className={`truncate ${shipped ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-500 dark:text-ink-300'}`}>
              <TypeLine key={view.log.id} text={view.log.text} reduced={reduced} />
            </span>
            {!reduced && <span aria-hidden className="h-3 w-1.5 shrink-0 animate-blink bg-gold-400/80" />}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
