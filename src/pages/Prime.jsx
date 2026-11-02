import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiCheck, FiLoader } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'
import AssistantPlanCard from '../components/coding/AssistantPlanCard'
import ErrorBoundary from '../components/ErrorBoundary'
import { useAuth } from '../context/AuthContext'
import { PLAN_DAYS, PLAN_RUPEES } from '../lib/codelab/assistantCheckout'
import { useSeo } from '../hooks/useSeo'

const INCLUDED = [
  'Ask questions about the code in your playground',
  'Let the agent write, run and fix your project',
  'Works with Web, Python, Java and FastAPI',
  'A separate AI Agent screen, with voice',
  'The WebNest Prime Member badge on your account',
]

const SIGNUP_LINK = '/login?join=prime'
const LOGIN_LINK = '/login?join=prime&mode=login'

// Becoming a member. Someone who ticked the option while signing up or logging in arrives
// with `payAcceptedAt` in the navigation state, and Razorpay opens by itself.
export default function Prime() {
  useSeo({
    title: `WebNest Prime: WebNest AI at ₹${PLAN_RUPEES} per Month`,
    description: `Become a WebNest Prime Member for ₹${PLAN_RUPEES} per month. Get WebNest AI to write, run and fix code in the CodeLab playground.`,
    path: '/prime',
  })

  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [autoPayAt] = useState(() => location.state?.payAcceptedAt ?? null)

  // Taken out of the history entry, so a reload or the Back button can't open Razorpay again.
  useEffect(() => {
    if (location.state?.payAcceptedAt) navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  return (
    <div className="dark launch-stage relative isolate -mt-22 min-h-screen overflow-hidden text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="launch-spotlight" />
        <div className="launch-beam launch-beam-a" />
        <div className="launch-beam launch-beam-b" />
        <div className="launch-grain" />
      </div>

      <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 pb-24 pt-40 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.36em] text-gold-300 sm:text-xs">
            <FaCrown className="h-3.5 w-3.5" aria-hidden="true" /> Membership
          </p>
          <h1 className="launch-metal mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">WebNest Prime</h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-ink-200 lg:mx-0">
            WebNest AI, your coding partner in the CodeLab playground. Describe what you want, and watch it get built and run in your browser.
          </p>
          <p className="mt-8 font-display text-5xl font-extrabold">
            ₹{PLAN_RUPEES}<span className="ml-2 text-base font-medium text-ink-300">per month</span>
          </p>
          <ul className="mx-auto mt-8 max-w-md space-y-3 text-left lg:mx-0">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink-200">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-gold-400"><FiCheck className="h-3.5 w-3.5" /></span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-ink-400 lg:mx-0">
            One payment gives {PLAN_DAYS} days and does not renew automatically. Usage limits apply.
          </p>
        </div>

        <div>
          {initializing && (
            <p role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-ink-300"><FiLoader className="h-4 w-4 animate-spin text-gold-400" /> Loading…</p>
          )}
          {!initializing && isAuthenticated && <ErrorBoundary><AssistantPlanCard autoPayAt={autoPayAt} /></ErrorBoundary>}
          {!initializing && !isAuthenticated && (
            <div className="launch-frame rounded-3xl border border-gold-400/40 bg-gradient-to-b from-[#3a362f]/90 to-[#1f1d1a]/95 p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-10">
              <FaCrown className="mx-auto h-8 w-8 text-gold-400" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-bold text-white">Join in a minute</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">
                Membership belongs to your account. Create one, or sign in, and the secure Razorpay payment opens right after.
              </p>
              <Link to={SIGNUP_LINK} className="launch-cta group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-ink-950">
                Create an account and join <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="mt-4 text-sm text-ink-300">
                Already have an account? <Link to={LOGIN_LINK} className="font-semibold text-gold-400 hover:underline">Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
