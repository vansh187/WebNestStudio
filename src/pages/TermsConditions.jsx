import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { CONTACT } from '../data/site'
import BackButton from '../components/coding/BackButton'
import { useSeo } from '../hooks/useSeo'

const EFFECTIVE_DATE = 'November 1, 2026'

function Section({ id, title, children }) {
  return (
    <div id={id} className="scroll-mt-24 border-t border-ink-200 py-8 first:border-t-0 first:pt-0 dark:border-ink-800">
      <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
        {children}
      </div>
    </div>
  )
}

export default function TermsConditions() {
  useSeo({
    title: 'Terms & Conditions',
    description:
      'Terms for using WebNest Studio services, website, CodeLab learning tools, WebNest AI, contact forms, and project consultation workflows.',
    path: '/terms-and-conditions',
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
            Terms & Conditions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-500 dark:text-ink-300">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
        <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-300">
          These Terms & Conditions govern your use of the WebNest Studio website, contact forms,
          consultation workflows, client portal, WebNest CodeLab, WebNest AI, learning content, and related services.
          By using this website or contacting us through it, you agree to these terms.
        </p>

        <Section id="services" title="1. Our Services">
          <p>
            WebNest Studio provides website development, AI implementation, full-stack engineering,
            enterprise database work, API integration, deployment support, learning content, and related
            digital services. Any project proposal, quote, scope, timeline, deliverable, support period, or
            payment schedule is valid only when confirmed in writing by WebNest Studio.
          </p>
        </Section>

        <Section id="website-use" title="2. Website and Platform Use">
          <p>
            You may use our website and learning resources for lawful personal, educational, or business
            evaluation purposes. You must not attempt to disrupt the site, bypass authentication, access
            private areas without permission, scrape protected content at scale, upload malicious code, or
            use the service in a way that violates applicable law.
          </p>
        </Section>

        <Section id="accounts" title="3. Accounts and Security">
          <p>
            Some features, including saved projects, submissions, portal access, and AI project history, may
            require an account. You are responsible for keeping your login details secure and for activity
            under your account. Contact us promptly if you believe your account has been accessed without
            authorization.
          </p>
        </Section>

        <Section id="project-requests" title="4. Project Requests and Consultations">
          <p>
            Submitting a contact form, booking request, or project brief does not create a client
            relationship by itself. A project begins only after both sides agree to a written scope, price,
            payment terms, and timeline. Estimates shared before discovery are non-binding and may change
            after requirements are clarified.
          </p>
        </Section>

        <Section id="payments" title="5. Payments and Refunds">
          <p>
            Payment terms for client projects are handled in the applicable written proposal, invoice, or
            agreement. Unless a project agreement says otherwise, custom development work, discovery work,
            strategy sessions, design work, and delivered milestones are not automatically refundable once
            work has started or deliverables have been shared. WebNest AI payments are covered by section 6
            and our{' '}
            <Link to="/refund-policy" className="font-semibold text-gold-500 hover:underline">Refund Policy</Link>.
          </p>
        </Section>

        <Section id="webnest-ai" title="6. WebNest AI">
          <p>
            <strong>Plan.</strong> A WebNest AI plan costs ₹299 per user and gives one account 30 days of access
            with 2 million AI tokens. Tokens are the units AI models use to measure the text sent and received,
            including your code and the assistant's replies, so longer tasks use more. Access ends when the 30
            days are over or the tokens run out, whichever comes first. The plan does not renew automatically.
            It is for one person: you must not share your account or resell access.
          </p>
          <p>
            <strong>Payment.</strong> Payments are processed by Razorpay. All WebNest AI payments are final and
            non-refundable, except as set out in our{' '}
            <Link to="/refund-policy" className="font-semibold text-gold-500 hover:underline">Refund Policy</Link>.
            By paying, you ask for the service to start immediately.
          </p>
          <p>
            <strong>Your code.</strong> To answer you, WebNest AI sends your messages and the relevant parts of
            your project to our AI provider. Do not send anything you are not allowed to share. Files such as
            .env are not sent, but you are responsible for any secrets you place elsewhere in your code or
            messages.
          </p>
          <p>
            <strong>AI output.</strong> AI can make mistakes. Answers and code may be wrong, insecure or
            unsuitable, so review and test them before relying on them. You are responsible for the code you
            choose to apply, run or publish.
          </p>
          <p>
            <strong>Changes and availability.</strong> We may change the AI model or provider that powers WebNest
            AI, and the service may sometimes be unavailable. We may limit or suspend access if an account
            misuses the service, breaks these terms, or uses it for anything unlawful or harmful.
          </p>
        </Section>

        <Section id="intellectual-property" title="7. Intellectual Property">
          <p>
            The WebNest Studio brand, website design, copy, graphics, learning material, code examples, and
            platform interface are owned by WebNest Studio or its licensors. You may not copy, resell, or
            redistribute them without permission. For client projects, ownership of final deliverables is
            governed by the written project agreement.
          </p>
        </Section>

        <Section id="third-party-services" title="8. Third-Party Services">
          <p>
            Our site and projects may use third-party services such as hosting platforms, analytics,
            advertising networks, APIs, payment providers, or embedded content. Those services may have their
            own terms and privacy practices. We are not responsible for third-party outages, policies, or
            content outside our control.
          </p>
        </Section>

        <Section id="limitations" title="9. Limitation of Liability">
          <p>
            We work carefully, but the website and public learning content are provided on an "as is" and
            "as available" basis. To the maximum extent permitted by law, WebNest Studio is not liable for
            indirect, incidental, special, consequential, or punitive damages arising from your use of the
            website or reliance on public content.
          </p>
        </Section>

        <Section id="changes" title="10. Changes to These Terms">
          <p>
            We may update these terms from time to time. When we do, we will update the effective date above.
            Continued use of the website after changes are posted means you accept the updated terms.
          </p>
        </Section>

        <Section id="contact" title="11. Contact">
          <p>
            Questions about these terms can be sent to{' '}
            <a href={CONTACT.emailHref} className="font-semibold text-gold-500 hover:underline">
              {CONTACT.email}
            </a>
            {' '}or by phone at{' '}
            <a href={CONTACT.phoneHref} className="font-semibold text-gold-500 hover:underline">
              {CONTACT.phone}
            </a>
            .
          </p>
        </Section>
      </section>
    </div>
  )
}
