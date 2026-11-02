// Razorpay Checkout for WebNest AI. The price, order and key all come from our server, which
// also decides who has access: nothing here can grant it. No React, so it can be tested in Node.
const CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
const BRAND_COLOR = '#d4a017'
// Change this whenever the terms or refund policy change. Saved with each payment.
export const TERMS_VERSION = '2026-11-01'

// Shown until the server sends its own plan. The server's order sets what is really charged.
export const DEFAULT_PLAN = { price_paise: 29900, pass_days: 30, tokens_limit: 2000000 }
// For adverts and buttons, which show before the server is asked. Change the price in one place.
export const PLAN_RUPEES = Math.round(DEFAULT_PLAN.price_paise / 100)
export const PLAN_DAYS = DEFAULT_PLAN.pass_days

// WebNest AI is paid: only a plan the server says is active opens it. With no answer at all
// (`usage` not read), nothing is decided here; the server refuses an unpaid chat with a 402.
export const needsPayment = (usage) => Boolean(usage) && usage.access?.active !== true

// A date from the server for display, or '' when there is none.
export function expiryDate(value) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

// The same date in the user's own format.
export function localDate(value) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : ''
}

// Tokens left this month, or null when the server gives no allowance.
export function tokensLeft(usage) {
  const limit = usage?.access?.tokens_limit
  return limit ? Math.max(limit - (usage.access.tokens_used ?? 0), 0) : null
}

// 2000000 as "2M", or "2 million" with `long`.
export const formatTokens = (tokens, { long = false } = {}) => new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: long ? 'long' : 'short',
  maximumFractionDigits: 1,
}).format(tokens)

export const PAID_MESSAGE = 'Payment confirmed. Welcome to WebNest Prime!'

// Loaded on the first click to pay, so the workspace runs no third-party script until then.
let loading = null
export function loadCheckout() {
  if (window.Razorpay) return Promise.resolve()
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_URL
    script.async = true
    const fail = () => {
      loading = null
      script.remove()
      reject(new Error('Could not load the payment page. Check your connection or ad blocker, and try again.'))
    }
    script.onload = () => (window.Razorpay ? resolve() : fail())
    script.onerror = fail
    document.head.appendChild(script)
  })
  return loading
}

// `termsAcceptedAt` is kept on the Razorpay payment, as a record of what the customer agreed to.
export function checkoutOptions(order, user, { onPaid, onClose, termsAcceptedAt }) {
  return {
    key: order.key_id,
    amount: order.amount,
    currency: order.currency,
    order_id: order.order_id,
    name: order.name ?? 'WebNest Studio',
    description: order.description ?? 'WebNest AI access',
    prefill: { name: user?.full_name ?? '', email: user?.email ?? '' },
    notes: { terms_version: TERMS_VERSION, terms_accepted_at: termsAcceptedAt },
    theme: { color: BRAND_COLOR },
    handler: onPaid,
    modal: { ondismiss: onClose },
  }
}
