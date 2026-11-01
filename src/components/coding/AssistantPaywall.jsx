import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck, FiLoader, FiZap } from 'react-icons/fi'
import { DEFAULT_PLAN, formatTokens } from '../../lib/codelab/assistantCheckout'
import { usePrime } from '../../hooks/usePrime'

export function Spark({ className = 'h-7 w-7' }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950 shadow-sm ${className}`} aria-hidden="true">
      <FiZap className="h-[55%] w-[55%]" />
    </span>
  )
}

const LEGAL_LINK = 'font-semibold underline hover:text-gold-600 dark:hover:text-gold-300'

const PAY_LABELS = { starting: 'Opening…', open: 'Payment page open…', verifying: 'Verifying your payment...', confirming: 'Confirming your payment...' }

// Shown when the server says this user needs access. The price comes from the server.
export function AssistantPaywall({ access: serverAccess, payment }) {
  const access = { ...DEFAULT_PLAN, ...serverAccess }
  const rupees = Math.round(access.price_paise / 100)
  const { status, error, paymentId, pay, checkAgain } = payment
  const { isPrime } = usePrime()
  const [acceptedAt, setAcceptedAt] = useState(null)
  const working = Boolean(PAY_LABELS[status])
  const period = access.pass_days === 30 ? 'per month' : access.pass_days ? `for ${access.pass_days} days` : ''
  // Still a member, but out of tokens: as opposed to never paid or expired.
  const usedUp = isPrime && Boolean(access.tokens_limit) && (access.tokens_used ?? 0) >= access.tokens_limit
  const included = [
    ...(access.tokens_limit ? [`${formatTokens(access.tokens_limit, { long: true })} AI tokens`] : []),
    'Ask questions about your code',
    'Let the agent build, run and fix your project',
    'Web, Python, Java and FastAPI',
  ]
  return (
    <section aria-label="Unlock WebNest AI" className="m-auto w-full max-w-sm rounded-xl border border-gold-400/60 bg-gold-50/40 p-4 text-center dark:bg-gold-400/5">
      <Spark className="h-10 w-10" />
      <h3 className="mt-3 font-display text-lg font-bold text-ink-900 dark:text-white">{usedUp ? "You've used all your tokens" : 'Unlock WebNest AI'}</h3>
      {usedUp && <p className="mt-1 text-xs text-ink-600 dark:text-ink-300">{formatTokens(access.tokens_used)} of {formatTokens(access.tokens_limit)} tokens used. Buy again to keep going.</p>}
      <p className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-white">
        ₹{rupees}
        {period ? <span className="ml-1 text-sm font-medium text-ink-500 dark:text-ink-400">{period}</span> : null}
      </p>
      <ul className="mx-auto mt-3 max-w-xs space-y-1.5 text-left text-xs text-ink-600 dark:text-ink-300">
        {included.map((item) => (
          <li key={item} className="flex items-start gap-2"><FiCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600 dark:text-gold-400" />{item}</li>
        ))}
      </ul>
      {status === 'pending' ? (
        <div role="status" className="mt-4 text-xs leading-relaxed text-ink-700 dark:text-ink-200">
          <p>Your payment is being confirmed. Your membership will appear shortly, and there's no need to pay again.</p>
          <p className="mt-2">Taking too long? <Link to="/contact" className="font-semibold underline">Contact us</Link>{paymentId ? <> with payment ID <code className="font-mono">{paymentId}</code></> : null}.</p>
          <button type="button" onClick={checkAgain} className="mt-3 inline-flex h-9 items-center rounded-lg border border-ink-300 px-4 text-xs font-semibold text-ink-800 hover:border-gold-400 dark:border-ink-700 dark:text-ink-100">Check again</button>
        </div>
      ) : (
        <>
        <p className="mt-4 text-left text-xs font-semibold text-ink-800 dark:text-ink-100">All payments are final and non-refundable, except as set out in our Refund Policy.</p>
        {period === 'per month' && <p className="mt-1 text-left text-xs text-ink-600 dark:text-ink-300">One payment gives {access.pass_days} days. It does not renew automatically.</p>}
        <label className="mt-3 flex cursor-pointer items-start gap-2 text-left text-xs leading-relaxed text-ink-700 dark:text-ink-200">
          <input
            type="checkbox"
            checked={Boolean(acceptedAt)}
            disabled={working}
            onChange={(event) => setAcceptedAt(event.target.checked ? new Date().toISOString() : null)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-gold-500"
          />
          <span>
            I agree to the{' '}
            <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className={LEGAL_LINK}>Terms &amp; Conditions</a>
            {' '}and{' '}
            <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className={LEGAL_LINK}>Refund Policy</a>
            , and I want WebNest AI to start as soon as I pay.
          </span>
        </label>
        <button type="button" onClick={() => pay(acceptedAt)} disabled={working || !acceptedAt} title={acceptedAt ? undefined : 'Tick the box above to continue'} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-sm font-semibold text-ink-950 shadow-sm hover:from-gold-200 hover:to-gold-400 disabled:cursor-not-allowed disabled:opacity-50">
          {working && <FiLoader className="h-4 w-4 animate-spin" />}
          {PAY_LABELS[status] ?? `${usedUp ? 'Buy again' : 'Pay'} ₹${rupees}`}
        </button>
        </>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">{error}{status === 'rejected' && <> <Link to="/contact" className="font-semibold underline">Contact support</Link>{paymentId ? <> with payment ID <code className="font-mono">{paymentId}</code></> : null}.</>}</p>}
      <p className="mt-3 text-[11px] text-ink-500 dark:text-ink-400">
        Secure payment by Razorpay.
      </p>
    </section>
  )
}
