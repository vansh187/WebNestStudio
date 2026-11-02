import { Link } from 'react-router-dom'
import { FaCrown } from 'react-icons/fa'
import { FiArrowRight } from 'react-icons/fi'
import PaymentTerms from './PaymentTerms'
import { PLAN_DAYS, PLAN_RUPEES } from '../lib/codelab/assistantCheckout'

const LEAD = 'Yes, make me a Prime Member. '

// The WebNest AI advert beside the login and signup forms. The choice itself is in the form.
export function PrimeAdvert() {
  return (
    <div className="launch-stage relative overflow-hidden rounded-3xl border border-gold-400/50 p-6 text-left shadow-2xl shadow-black/50">
      <span className="launch-spotlight" aria-hidden="true" />
      <div className="relative">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-300">
          <FaCrown className="h-3.5 w-3.5" aria-hidden="true" /> Now launching
        </p>
        <p className="launch-metal mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight">WebNest AI</p>
        <p className="mt-1 text-sm font-medium text-ink-100">Describe it. Watch it build. Run it.</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-3xl font-extrabold text-white">₹{PLAN_RUPEES}<span className="ml-1.5 text-sm font-medium text-ink-300">per month</span></p>
          <Link to="/prime" className="launch-cta group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-ink-950">
            Become a Prime Member <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// The "become a Prime Member" choice on the login and signup forms. Ticking it is the same
// agreement as the box on the payment card, and `acceptedAt` is when it was given.
export default function PrimeOption({ acceptedAt, onChange, disabled = false }) {
  const terms = <PaymentTerms acceptedAt={acceptedAt} onChange={onChange} disabled={disabled} days={PLAN_DAYS} lead={LEAD} />

  return (
    <div className={`rounded-2xl border p-4 text-left transition-colors lg:p-3 ${acceptedAt ? 'border-gold-400 bg-gold-400/10' : 'border-gold-400/40 bg-black/20'}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-display text-sm font-bold text-white">
          <FaCrown className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" /> Become a Prime Member
        </p>
        <p className="shrink-0 text-sm font-bold text-gold-300">₹{PLAN_RUPEES}<span className="text-xs font-medium text-ink-300"> / month</span></p>
      </div>
      {terms}
    </div>
  )
}
