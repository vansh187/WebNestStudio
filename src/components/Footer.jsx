import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiInstagram } from 'react-icons/fi'
import Logo from './Logo'
import NewsletterForm from './forms/NewsletterForm'
import { CONTACT, NAV_LINKS, TECH_STACK } from '../data/site'

export default function Footer() {
  return (
    <footer className="border-t border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-950">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500 dark:text-ink-300">
              WebNest Studio is an IT consultancy building websites, AI-driven products, and
              enterprise software — where brands go digital.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={CONTACT.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WebNest Studio on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 dark:border-ink-700 text-ink-500 dark:text-ink-300 hover:border-gold-400 hover:text-gold-500 transition-colors"
              >
                <FiInstagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-900 dark:text-white">
              Navigate
            </h4>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-500 dark:text-ink-300 hover:text-gold-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-900 dark:text-white">
              Get in Touch
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={CONTACT.phoneHref}
                  className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-300 hover:text-gold-500 transition-colors"
                >
                  <FiPhone className="h-4 w-4 shrink-0" />
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT.emailHref}
                  className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-300 hover:text-gold-500 transition-colors break-all"
                >
                  <FiMail className="h-4 w-4 shrink-0" />
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-900 dark:text-white">
              Stay Updated
            </h4>
            <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">
              Occasional notes on web, AI, and engineering — no spam.
            </p>
            <div className="mt-4">
              <NewsletterForm source="footer" />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink-200 dark:border-ink-800 pt-6 text-xs text-ink-400 dark:text-ink-500">
          <span className="uppercase tracking-wider">Stack</span>
          {TECH_STACK.map((t, i) => (
            <span key={t.name} className="flex items-center gap-3">
              {t.name}
              {i < TECH_STACK.length - 1 && <span className="text-ink-300 dark:text-ink-700">•</span>}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-ink-200 dark:border-ink-800 pt-6 sm:flex-row">
          <p className="text-xs text-ink-400 dark:text-ink-500">
            © {new Date().getFullYear()} WebNest Studio. All rights reserved.
          </p>
          <p className="text-xs italic text-gold-500">Where Brands Go Digital</p>
        </div>
      </div>
    </footer>
  )
}
