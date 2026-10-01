import { Link } from 'react-router-dom'
import { FaLinkedinIn } from 'react-icons/fa'
import Logo from './Logo'
import { AUTHOR_PAGE_PATH, FOUNDER, TEAM_AUTHOR } from '../data/authors'

export default function AuthorBox({ className = '' }) {
  return (
    <section aria-label="About the author" className={`rounded-xl border border-ink-200 p-5 dark:border-ink-800 ${className}`}>
      <div className="flex items-start gap-4">
        <Logo size="md" showText={false} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Written by</p>
          <p className="mt-1 font-display text-lg font-semibold text-ink-900 dark:text-white">
            <Link to={AUTHOR_PAGE_PATH} className="hover:text-gold-500">{TEAM_AUTHOR.name}</Link>
          </p>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{TEAM_AUTHOR.tagline}</p>
          <p className="mt-3 text-sm text-ink-600 dark:text-ink-200">
            Led by <span className="font-semibold">{FOUNDER.name}</span>, {FOUNDER.role} · {FOUNDER.focus}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <Link to={AUTHOR_PAGE_PATH} className="font-semibold text-gold-600 underline dark:text-gold-400">About the authors</Link>
            <Link to="/learn" className="font-semibold text-gold-600 underline dark:text-gold-400">More tutorials</Link>
            <a href={FOUNDER.linkedinHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-ink-500 hover:text-gold-500 dark:text-ink-300">
              <FaLinkedinIn className="h-3.5 w-3.5" /> LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
