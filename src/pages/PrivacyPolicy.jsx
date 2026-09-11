import Reveal from '../components/Reveal'
import { CONTACT } from '../data/site'
import { useSeo } from '../hooks/useSeo'

const EFFECTIVE_DATE = 'September 11, 2026'

function Section({ id, title, children }) {
  return (
    <div id={id} className="scroll-mt-24 border-t border-ink-200 py-8 first:border-t-0 first:pt-0 dark:border-ink-800">
      <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{title}</h2>
      <div className="prose-legal mt-4 space-y-4 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
        {children}
      </div>
    </div>
  )
}

export default function PrivacyPolicy() {
  useSeo({
    title: 'Privacy Policy',
    description:
      'How WebNest Studio collects, uses, and protects your data across our website, client portal, CodeLab platform, and Android application.',
    path: '/privacy-policy',
  })

  return (
    <div>
      <section className="bg-grid px-6 py-20 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
            Legal
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-500 dark:text-ink-300">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
        <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-300">
          WebNest Studio (&ldquo;WebNest Studio&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) provides a
          website, client portal, and the WebNest CodeLab learning and coding platform, including any Android
          application we publish that links to this policy (together, the &ldquo;Services&rdquo;). This Privacy Policy
          explains what information we collect, how we use it, who we share it with, and the choices and rights
          you have. By using our Services, you agree to the collection and use of information described here.
        </p>

        <Section id="information-we-collect" title="1. Information We Collect">
          <p>We collect information in the following ways:</p>
          <p>
            <strong className="text-ink-900 dark:text-white">a) Information you provide directly.</strong> When you
            create an account, sign in, submit a contact or lead form, subscribe to our newsletter, use our AI
            project-planning chat, request a digital visiting card, or otherwise interact with our forms, we may
            collect your name, email address, phone number, company name, project details, and the content of
            your messages.
          </p>
          <p>
            <strong className="text-ink-900 dark:text-white">b) Account and authentication data.</strong> If you
            register for an account, we store your email address and a securely hashed password, and issue
            access and refresh tokens to keep you signed in. We do not store your password in plain text.
          </p>
          <p>
            <strong className="text-ink-900 dark:text-white">c) Content you create.</strong> If you use WebNest
            CodeLab, the playground, or the project workspace, we store the code, projects, chat threads, and
            generated plans you create so you can access and share them.
          </p>
          <p>
            <strong className="text-ink-900 dark:text-white">d) Usage and device information.</strong> We
            automatically collect limited technical information such as browser type, device type, pages
            visited, and general usage patterns through privacy-conscious analytics (Vercel Analytics), which
            does not use cookies to track you across other sites.
          </p>
          <p>
            <strong className="text-ink-900 dark:text-white">e) Local storage.</strong> We use your browser&rsquo;s
            local storage to keep you signed in between visits (storing a refresh token) and to remember your
            display theme preference. This data stays on your device and is not a tracking cookie shared with
            third parties.
          </p>
        </Section>

        <Section id="how-we-use" title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Provide, operate, and maintain our Services, including your account and saved projects;</li>
            <li>Respond to inquiries, quote requests, and support messages you send us;</li>
            <li>Generate AI-assisted project plans and send them to you by email when you request it;</li>
            <li>Send service-related communications, and, where you have opted in, our newsletter;</li>
            <li>Monitor, secure, and improve the performance and reliability of our Services;</li>
            <li>Detect, prevent, and address fraud, abuse, or security issues; and</li>
            <li>Comply with applicable legal obligations.</li>
          </ul>
          <p>We do not sell your personal information.</p>
        </Section>

        <Section id="sharing" title="3. How We Share Your Information">
          <p>
            We do not share your personal information with third parties except in the following limited
            circumstances:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink-900 dark:text-white">Service providers.</strong> We use trusted
              infrastructure and communication providers (such as our hosting provider, analytics provider, and
              email delivery provider) solely to operate our Services on our behalf, under obligations to
              protect your data.
            </li>
            <li>
              <strong className="text-ink-900 dark:text-white">Legal requirements.</strong> We may disclose
              information if required to do so by law, or in the good-faith belief that such action is necessary
              to comply with a legal obligation, protect our rights, or protect the safety of our users or the
              public.
            </li>
            <li>
              <strong className="text-ink-900 dark:text-white">Business transfers.</strong> If WebNest Studio is
              involved in a merger, acquisition, or sale of assets, your information may be transferred as part
              of that transaction, subject to this policy or a comparable one.
            </li>
            <li>
              <strong className="text-ink-900 dark:text-white">With your consent.</strong> We may share
              information for any other purpose with your explicit consent.
            </li>
          </ul>
        </Section>

        <Section id="retention" title="4. Data Retention">
          <p>
            We retain personal information for as long as your account is active or as needed to provide you
            the Services, comply with our legal obligations, resolve disputes, and enforce our agreements. You
            may request deletion of your account and associated data at any time using the contact details
            below.
          </p>
        </Section>

        <Section id="security" title="5. Data Security">
          <p>
            We use industry-standard technical and organizational measures to protect your information,
            including encrypted transport (HTTPS/TLS), hashed passwords, and short-lived access tokens. However,
            no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section id="rights" title="6. Your Rights and Choices">
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Access, correct, or update the personal information we hold about you;</li>
            <li>
              Request deletion of your account and personal information. If you have an account, you can delete
              it yourself at any time from{' '}
              <a href="/delete-account" className="font-semibold text-gold-500 hover:underline">
                webneststudio.co.in/delete-account
              </a>{' '}
              (sign in first if prompted), which permanently removes your profile, saved projects, CodeLab
              progress, and chat history. If you prefer, email us and we will delete it within 30 days;
            </li>
            <li>Withdraw consent to marketing communications at any time (e.g. unsubscribing from the newsletter);</li>
            <li>Request a copy of your data in a portable format; and</li>
            <li>Object to or restrict certain processing of your information.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{' '}
            <a href={CONTACT.emailHref} className="font-semibold text-gold-500 hover:underline">
              {CONTACT.email}
            </a>
            . We will respond within a reasonable timeframe.
          </p>
        </Section>

        <Section id="children" title="7. Children's Privacy">
          <p>
            Our Services are not directed to children under 13 (or the minimum age required in your
            jurisdiction), and we do not knowingly collect personal information from children. If you believe a
            child has provided us with personal information, please contact us and we will take steps to delete
            it.
          </p>
        </Section>

        <Section id="third-party-links" title="8. Third-Party Links">
          <p>
            Our Services may contain links to third-party websites, including our social media pages. We are not
            responsible for the privacy practices or content of those third-party sites, and we encourage you to
            review their privacy policies.
          </p>
        </Section>

        <Section id="android-app" title="9. Android Application">
          <p>
            If you access WebNest Studio through our Android application, the application loads this same
            website and is subject to this Privacy Policy in full. The application does not request access to
            device permissions (such as camera, contacts, or location) beyond what is required to display web
            content, and does not collect additional information beyond what is described in this policy.
          </p>
        </Section>

        <Section id="international" title="10. International Data Transfers">
          <p>
            We are based in India and primarily process data there. If you access our Services from outside
            India, your information may be transferred to, stored, and processed in India or other countries
            where our service providers operate, which may have different data protection laws than your
            jurisdiction.
          </p>
        </Section>

        <Section id="changes" title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time to reflect changes to our practices or for legal
            or regulatory reasons. We will update the &ldquo;Effective date&rdquo; above when we do, and material
            changes will be communicated through the Services or by other reasonable means.
          </p>
        </Section>

        <Section id="contact" title="12. Contact Us">
          <p>If you have questions or concerns about this Privacy Policy or our data practices, contact us at:</p>
          <p className="font-semibold text-ink-900 dark:text-white">
            WebNest Studio
            <br />
            <a href={CONTACT.emailHref} className="font-semibold text-gold-500 hover:underline">
              {CONTACT.email}
            </a>
            <br />
            <a href={CONTACT.phoneHref} className="font-semibold text-gold-500 hover:underline">
              {CONTACT.phone}
            </a>
          </p>
        </Section>
      </section>
    </div>
  )
}
