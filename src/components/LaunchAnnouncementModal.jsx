import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FaCrown } from 'react-icons/fa'
import { FiArrowRight, FiX } from 'react-icons/fi'
import { usePrime } from '../hooks/usePrime'
import { PLAN_DAYS, PLAN_RUPEES } from '../lib/codelab/assistantCheckout'

// Shown once per tab, so it doesn't return every time someone comes back to the home page.
const ANNOUNCEMENT_KEY = 'wns-webnest-ai-popup-seen-2026-11'
// Phones get a small bar over the page's foot: Google can rank a page lower when a popup covers
// it on a phone, and the content stays readable and scrollable behind a bar.
const SMALL_SCREEN = '(max-width: 767px)'
// A full-screen popup that appears while someone is already reading (a slow answer about their
// membership) is worse than none. They see it on a later page load instead.
const LATEST_OPEN_MS = 6000
const FOCUSABLE = 'a[href], button:not([disabled])'

function alreadySeen() {
  try { return Boolean(sessionStorage.getItem(ANNOUNCEMENT_KEY)) } catch { return false }
}

function rememberSeen() {
  try { sessionStorage.setItem(ANNOUNCEMENT_KEY, '1') } catch { /* Storage is optional. */ }
}

function SmallBar({ isPrime, label, onClose }) {
  return (
    <motion.div
      role="dialog"
      aria-labelledby="webnest-ai-popup"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="launch-stage launch-frame fixed inset-x-3 bottom-3 z-[100] flex items-center gap-3 rounded-2xl border border-gold-400/50 p-3 text-white"
    >
      <div className="min-w-0 flex-1">
        <h2 id="webnest-ai-popup" className="launch-metal font-display text-lg font-extrabold leading-tight">WebNest AI</h2>
        <p className="truncate text-xs text-ink-200">{isPrime ? label : `₹${PLAN_RUPEES} per month`}</p>
      </div>
      <Link to={isPrime ? '/codelab/playground' : '/prime'} onClick={onClose} className="launch-cta shrink-0 rounded-full px-4 py-2 text-xs font-bold text-ink-950">
        {isPrime ? 'Open' : 'Become Prime'}
      </Link>
      <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-400/40 text-gold-300">
        <FiX className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

// The WebNest AI launch, as the home page loads: an offer to join, or a welcome for a member.
export default function LaunchAnnouncementModal() {
  const { isPrime, label, showOffer } = usePrime()
  const [open, setOpen] = useState(false)
  const [small, setSmall] = useState(false)
  const [loadedAt] = useState(() => Date.now())
  const dialogRef = useRef(null)
  const ready = isPrime || showOffer

  useEffect(() => {
    if (!ready || window.__PRERENDER__ || alreadySeen()) return
    const isSmall = window.matchMedia(SMALL_SCREEN).matches
    if (!isSmall && Date.now() - loadedAt > LATEST_OPEN_MS) return
    rememberSeen()
    setSmall(isSmall)
    setOpen(true)
  }, [loadedAt, ready])

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (small || event.key !== 'Tab' || !dialogRef.current) return
      // Keeps Tab inside the popup while the page behind it can't be used.
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const outside = !dialogRef.current.contains(document.activeElement) || document.activeElement === dialogRef.current
      if (event.shiftKey && (outside || document.activeElement === first)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (outside || document.activeElement === last)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    if (!small) {
      document.body.style.overflow = 'hidden'
      dialogRef.current?.focus({ preventScroll: true })
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      if (small) return
      document.body.style.overflow = ''
      previous?.focus?.({ preventScroll: true })
    }
  }, [open, small])

  const close = () => setOpen(false)

  return (
    <AnimatePresence>
      {open && small && <SmallBar key="bar" isPrime={isPrime} label={label} onClose={close} />}
      {open && !small && (
        <motion.div
          key="popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="webnest-ai-popup"
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="launch-stage launch-frame relative isolate m-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border border-gold-400/50 px-6 pb-7 pt-10 text-center text-white outline-none sm:px-9"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <div className="launch-spotlight" />
              <div className="launch-grain" />
            </div>

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/40 text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-400 hover:text-ink-950"
            >
              <FiX className="h-4 w-4" />
            </button>

            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-300">
              <FaCrown className="h-3.5 w-3.5" aria-hidden="true" /> {isPrime ? label : 'Now launching'}
            </p>
            <h2 id="webnest-ai-popup" className="launch-metal mt-4 font-display text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">WebNest AI</h2>
            <p className="mt-3 font-display text-lg font-medium text-ink-100">Describe it. Watch it build. Run it.</p>

            {isPrime ? (
              <>
                <p className="mt-5 text-sm leading-relaxed text-ink-300">Your AI coding partner is ready in the CodeLab playground. What will you build today?</p>
                <Link to="/codelab/playground" onClick={close} className="launch-cta group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-ink-950">
                  Open WebNest AI <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </>
            ) : (
              <>
                <p className="mt-6 font-display text-5xl font-extrabold">
                  ₹{PLAN_RUPEES}<span className="ml-2 text-base font-medium text-ink-300">per month</span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ink-200">One payment gives {PLAN_DAYS} days, with no automatic renewal. Usage limits apply.</p>
                <Link to="/prime" onClick={close} className="launch-cta group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-ink-950">
                  <FaCrown className="h-4 w-4" aria-hidden="true" /> Become a Prime Member
                  <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </>
            )}

            <button type="button" onClick={close} className="mt-4 text-sm font-medium text-ink-200 transition-colors hover:text-white">
              {isPrime ? 'Close' : 'Maybe later'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
