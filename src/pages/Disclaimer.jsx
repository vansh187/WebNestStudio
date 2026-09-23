import Reveal from '../components/Reveal'
import { CONTACT } from '../data/site'
import BackButton from '../components/coding/BackButton'
import { useSeo } from '../hooks/useSeo'

const EFFECTIVE_DATE = 'September 21, 2026'

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

export default function Disclaimer() {
  useSeo({
    title: 'Disclaimer',
    description:
      'Important disclaimers for WebNest Studio content, tutorials, third-party links, advertising, AI outputs, and professional advice.',
    path: '/disclaimer',
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
            Disclaimer
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-500 dark:text-ink-300">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
        <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-300">
          The information on this website is published by WebNest Studio for general business,
          educational, and informational purposes. We aim to keep it accurate and useful, but it should
          not be treated as a substitute for professional advice tailored to your situation.
        </p>

        <Section id="general-information" title="1. General Information">
          <p>
            Website copy, blog posts, tutorials, examples, CodeLab lessons, and AI-generated planning
            assistance are provided to help visitors understand technology choices and software concepts.
            They do not guarantee a specific business, ranking, revenue, traffic, or technical outcome.
          </p>
        </Section>

        <Section id="technical-content" title="2. Technical and Learning Content">
          <p>
            Code examples and tutorials are simplified for learning. Before using any code, architecture,
            security pattern, or deployment recommendation in production, test it carefully and adapt it to
            your own requirements, stack, compliance needs, and threat model.
          </p>
        </Section>

        <Section id="ai-content" title="3. AI-Assisted Output">
          <p>
            Our AI-assisted tools may generate project ideas, summaries, page plans, or code suggestions.
            AI output can be incomplete or incorrect, so you should review it before relying on it for
            business, legal, technical, financial, or operational decisions.
          </p>
        </Section>

        <Section id="advertising" title="4. Advertising and Sponsored Content">
          <p>
            This website may display advertisements from Google AdSense or other advertising partners.
            Advertising content is selected by those networks and may be based on context, cookies, device
            information, or user preferences. An advertisement appearing on this website does not mean
            WebNest Studio endorses the advertised product, service, or claim.
          </p>
        </Section>

        <Section id="third-party-links" title="5. Third-Party Links">
          <p>
            Our website may link to third-party websites, tools, documentation, social media pages, or client
            websites. We are not responsible for third-party content, availability, security, policies, or
            changes after a link is published.
          </p>
        </Section>

        <Section id="professional-advice" title="6. No Legal, Financial, or Tax Advice">
          <p>
            Content on this website is not legal, financial, tax, medical, or regulatory advice. If your
            project involves regulated data, contracts, taxes, privacy compliance, advertising compliance, or
            similar obligations, consult a qualified professional.
          </p>
        </Section>

        <Section id="contact" title="7. Contact">
          <p>
            To report an issue with published content, contact us at{' '}
            <a href={CONTACT.emailHref} className="font-semibold text-gold-500 hover:underline">
              {CONTACT.email}
            </a>
            .
          </p>
        </Section>
      </section>
    </div>
  )
}
