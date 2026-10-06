import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { getCourseRelation } from '../data/contentRelations'
import { getCaseStudy } from '../data/caseStudies'
import { trackEvent } from '../lib/analytics'

// Quiet, crawlable links from learning content to the related service and case
// study. Plain <Link>s (real <a href>) so search engines can follow them.

export function RelatedService({ courseSlug, className = '' }) {
  const relation = getCourseRelation(courseSlug)
  if (!relation) return null
  return (
    <aside aria-label="From learning to real projects" className={`rounded-lg border border-ink-200 p-4 text-sm text-ink-600 dark:border-ink-800 dark:text-ink-300 ${className}`}>
      {relation.text}{' '}
      See our{' '}
      <Link
        to={relation.service}
        onClick={() => trackEvent('learn_to_service_click', { course_slug: courseSlug, source: relation.service })}
        className="font-semibold text-gold-600 underline dark:text-gold-400"
      >
        {relation.anchor}
      </Link>
      {relation.caseStudy && <RelatedCaseStudy slug={relation.caseStudy} inline />}
    </aside>
  )
}

export function RelatedCaseStudy({ slug, inline = false }) {
  const study = getCaseStudy(slug)
  if (!study) return null
  const link = <Link to={`/case-studies/${study.slug}`} className="font-semibold text-gold-600 underline dark:text-gold-400">{study.title} case study</Link>
  if (inline) return <> or read the {link}.</>
  return (
    <Link to={`/case-studies/${study.slug}`} className="group block rounded-2xl border border-ink-200 bg-white p-6 transition hover:border-gold-400 dark:border-ink-800 dark:bg-ink-900/40">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">Case study · {study.badge}</span>
      <span className="mt-2 block font-display text-xl font-bold text-ink-900 dark:text-white">{study.title}</span>
      <span className="mt-2 block text-sm leading-relaxed text-ink-500 dark:text-ink-300">{study.description}</span>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-600 dark:text-gold-400">Read the case study <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
    </Link>
  )
}

export function RelatedLearning({ links, heading = 'Learn the technology behind it' }) {
  if (!links?.length) return null
  return (
    <nav aria-label={heading}>
      <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">{heading}</h2>
      <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">We publish free courses on the stacks we use. They are a good way to see how we think about code.</p>
      <ul className="mt-4 flex flex-wrap gap-3">
        {links.map((link) => (
          <li key={link.to}><Link to={link.to} className="inline-flex rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:border-gold-400 hover:text-gold-600 dark:border-ink-700 dark:text-ink-100 dark:hover:text-gold-400">{link.label}</Link></li>
        ))}
      </ul>
    </nav>
  )
}

// /contact clicks are measured globally as contact_cta_click by ConversionTracking.
export function EngineeringCTA({ heading = 'Discuss your project', text }) {
  return (
    <section className="rounded-3xl bg-ink-900 px-6 py-12 text-center sm:px-12">
      <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{heading}</h2>
      {text && <p className="mx-auto mt-3 max-w-2xl text-ink-300">{text}</p>}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-semibold text-ink-950">
          Discuss Your Project <FiArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/case-studies" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white hover:border-gold-400 hover:text-gold-300">
          View Our Work
        </Link>
      </div>
    </section>
  )
}
