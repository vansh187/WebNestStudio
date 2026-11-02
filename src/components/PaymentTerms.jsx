const LEGAL_LINK = 'font-semibold underline hover:text-gold-600 dark:hover:text-gold-300'

// What a customer agrees to before paying for WebNest AI. TERMS_VERSION in assistantCheckout.js
// names this wording on each payment, so every screen shows it from here: change that version
// whenever this changes. `lead` goes before the agreement, and `acceptedAt` is when it was given.
export default function PaymentTerms({ acceptedAt, onChange, disabled = false, days, lead = '' }) {
  return (
    <div className="text-left">
      {days ? <p className="text-xs leading-relaxed text-ink-600 dark:text-ink-300">One payment gives {days} days and does not renew automatically. Usage limits apply.</p> : null}
      <p className="mt-2 text-xs font-semibold leading-relaxed text-ink-800 dark:text-ink-100">All payments are final and non-refundable, except as set out in our Refund Policy.</p>
      <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-ink-700 dark:text-ink-200">
        <input
          type="checkbox"
          checked={Boolean(acceptedAt)}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked ? new Date().toISOString() : null)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-gold-500"
        />
        <span>
          {lead}I agree to the{' '}
          <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className={LEGAL_LINK}>Terms &amp; Conditions</a>
          {' '}and{' '}
          <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className={LEGAL_LINK}>Refund Policy</a>
          , and I want WebNest AI to start as soon as I pay.
        </span>
      </label>
    </div>
  )
}
