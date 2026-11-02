import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiLoader } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useAssistantPayment } from '../../hooks/useAssistantPayment'
import { usePrime } from '../../hooks/usePrime'
import { fetchAssistantUsage } from '../../lib/codelab/assistantClient'
import { PAID_MESSAGE, expiryDate, formatTokens, needsPayment, tokensLeft } from '../../lib/codelab/assistantCheckout'
import { AssistantPaywall, Spark } from './AssistantPaywall'

const CARD = 'rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900'
const OPEN_LINK = 'inline-flex h-9 items-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 px-4 text-sm font-semibold text-ink-950 shadow-sm hover:from-gold-200 hover:to-gold-400'

// WebNest AI on the profile page: the user's plan, or the same payment card as the panel.
// `autoPayAt`: when the user already agreed to the terms and chose to pay, so Razorpay opens
// once the server confirms that they are not a member and need to pay. A member, including
// one out of tokens, or someone the server can't answer about, chooses on the card instead.
export default function AssistantPlanCard({ autoPayAt = null }) {
  const { user, isAuthenticated } = useAuth()
  const prime = usePrime()
  const [usage, setUsage] = useState(undefined) // undefined: loading, null: could not be read

  const refreshUsage = useCallback(async () => {
    const next = await fetchAssistantUsage()
    setUsage((current) => next ?? current ?? null)
    return next
  }, [])
  useEffect(() => { refreshUsage() }, [refreshUsage])
  const payment = useAssistantPayment({ user, enabled: isAuthenticated, refreshUsage })
  const { pay } = payment
  const autoPaidRef = useRef(false)

  useEffect(() => {
    if (!autoPayAt || autoPaidRef.current || !usage || usage.enabled === false || !needsPayment(usage)) return
    if (!prime.answered || prime.isPrime) return
    autoPaidRef.current = true
    pay(autoPayAt)
  }, [autoPayAt, pay, prime.answered, prime.isPrime, usage])

  if (usage === undefined) {
    return (
      <div role="status" className={`${CARD} flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400`}>
        <FiLoader className="h-4 w-4 animate-spin text-gold-500" /> Checking your WebNest AI plan…
      </div>
    )
  }
  if (usage === null) {
    return (
      <div className={`${CARD} flex flex-wrap items-center justify-between gap-3 text-sm text-ink-600 dark:text-ink-300`}>
        <p>We couldn't load your WebNest AI plan.</p>
        <button type="button" onClick={refreshUsage} className="rounded-lg border border-ink-300 px-3 py-1.5 text-xs font-semibold hover:border-gold-400 dark:border-ink-700">Try again</button>
      </div>
    )
  }
  if (usage.enabled === false) return <div className={`${CARD} text-sm text-ink-600 dark:text-ink-300`}>WebNest AI is not available right now. Please try again later.</div>
  if (needsPayment(usage)) return <div className="flex"><AssistantPaywall access={usage.access} payment={payment} /></div>

  const { access } = usage
  const left = tokensLeft(usage)
  const until = expiryDate(access.expires_at)
  const usedShare = left !== null ? Math.min(100, Math.round(((access.tokens_limit - left) / access.tokens_limit) * 100)) : 0
  return (
    <div className={CARD}>
      {payment.status === 'paid' && <p role="status" className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">{PAID_MESSAGE}</p>}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Spark className="h-9 w-9" />
          <div>
            <p className="font-display font-semibold text-ink-900 dark:text-white">
              {prime.isPrime ? prime.label : 'WebNest AI'} <span className="ml-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
            </p>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              You have WebNest AI. {until ? `Your plan runs until ${until}.` : 'Your plan is active.'}
            </p>
          </div>
        </div>
        <Link to="/codelab/playground" className={OPEN_LINK}>Open the playground</Link>
      </div>
      {left !== null && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-medium text-ink-600 dark:text-ink-300">
            <span>{formatTokens(left)} tokens left</span>
            <span>of {formatTokens(access.tokens_limit)}</span>
          </div>
          <div role="progressbar" aria-label="AI tokens used" aria-valuenow={usedShare} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
            <div className="h-full rounded-full bg-gold-500" style={{ width: `${usedShare}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
