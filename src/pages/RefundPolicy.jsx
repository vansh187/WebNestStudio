import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { CONTACT } from '../data/site'
import BackButton from '../components/coding/BackButton'
import { useSeo } from '../hooks/useSeo'

const EFFECTIVE_DATE = 'November 1, 2026'

function Section({ title, children }) {
  return (
    <div className="border-t border-ink-200 py-8 first:border-t-0 first:pt-0 dark:border-ink-800">
      <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
        {children}
      </div>
    </div>
  )
}

export default function RefundPolicy() {
  useSeo({
    title: 'Refund Policy',
    description: 'Refund and cancellation terms for WebNest AI plans and other WebNest Studio payments.',
    path: '/refund-policy',
  })

  return (
    <div>
      <div className="px-6 pt-6 lg:px-8">
        <BackButton fallback="/" />
      </div>
      <section className="bg-grid px-6 py-20 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
            Legal
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            Refund Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-500 dark:text-ink-300">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
        <Section title="1. WebNest AI plan">
          <p>
            A WebNest AI plan costs ₹299 per user and gives one account 30 days of access with 2 million AI
            tokens. Access starts as soon as your payment is confirmed. The plan does not renew automatically:
            to continue after it ends, you pay again.
          </p>
        </Section>

        <Section title="2. Payments are final">
          <p>
            WebNest AI is a digital service that starts immediately, and each use costs us real AI usage. For
            that reason, <strong>all WebNest AI payments are final and non-refundable</strong>, except as set
            out in section 3. This includes unused tokens, unused days, and a change of mind after paying.
            Unused tokens and days end when the plan ends and do not carry over, except where a new plan is
            bought while the current one is still running.
          </p>
        </Section>

        <Section title="3. When we will refund you">
          <p>Nothing in this policy limits any right you have under applicable law. We will refund you if:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>You were charged more than once for the same purchase.</li>
            <li>Money was taken but your plan was never activated, and we can't fix it within a reasonable time.</li>
            <li>WebNest AI could not be used because of a fault on our side that we can't fix within a reasonable time.</li>
            <li>A refund is required by applicable law.</li>
          </ul>
        </Section>

        <Section title="4. How to ask for a refund">
          <p>
            Email{' '}
            <a href={CONTACT.emailHref} className="font-semibold text-gold-500 hover:underline">{CONTACT.email}</a>
            {' '}from your account's email address within 7 days of the payment, with your payment ID and what
            went wrong. Approved refunds go back to the original payment method through Razorpay. Your bank or
            payment provider may take several working days to show the money. A refund ends the access that
            payment gave.
          </p>
        </Section>

        <Section title="5. Disputes">
          <p>
            Please contact us first so we can try to fix the problem. Contacting us does not affect your right
            to raise a dispute with your bank or payment provider. We may share the payment details and your
            acceptance of these terms when responding to a dispute.
          </p>
        </Section>

        <Section title="6. Other WebNest Studio services">
          <p>
            Payments for client projects are covered by the written proposal, invoice or agreement for that
            project, and by our{' '}
            <Link to="/terms-and-conditions" className="font-semibold text-gold-500 hover:underline">Terms &amp; Conditions</Link>.
          </p>
        </Section>
      </section>
    </div>
  )
}
