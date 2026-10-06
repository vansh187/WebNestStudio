import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import Breadcrumbs from '../components/Breadcrumbs'
import { RelatedCaseStudy, RelatedLearning, EngineeringCTA } from '../components/RelatedLinks'
import { getCommercialPage, DEVELOPMENT_PROCESS, SERVICE_DIRECTORY } from '../data/commercialPages'
import { useSeo, useStructuredData, SITE_NAME, SITE_URL } from '../hooks/useSeo'
import { trackEvent } from '../lib/analytics'
import NotFound from './NotFound'

// Commercial landing pages share this template; their content lives in
// data/commercialPages.js. Deliberately light: no reveal animations or video, so
// the text is the LCP element and renders straight from the prerendered HTML.
const eyebrowClass = 'text-xs font-bold uppercase tracking-[0.24em] text-gold-600 dark:text-gold-400'
const h2Class = 'font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl'

export default function CommercialService({ path }) {
  const page = getCommercialPage(path)

  useSeo({ title: page?.seo.title || 'Service not found', description: page?.seo.description, path, noindex: !page })
  const schema = useMemo(() => page && {
    '@context': 'https://schema.org', '@type': 'Service',
    name: page.h1, serviceType: page.serviceType, description: page.seo.description, url: `${SITE_URL}${path}`,
    provider: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME },
    areaServed: page.areaServed.map((name) => ({ '@type': name === 'India' ? 'Country' : 'Place', name })),
  }, [page, path])
  useStructuredData(schema)
  useEffect(() => { if (page) trackEvent('service_page_view', { service_slug: page.slug }) }, [page])

  if (!page) return <NotFound />
  const related = SERVICE_DIRECTORY.filter((item) => page.related.includes(item.to))

  return (
    <article className="text-ink-700 dark:text-ink-200">
      <header className="border-b border-ink-100 bg-ink-50/60 dark:border-ink-800 dark:bg-ink-900/30">
        <div className="mx-auto max-w-5xl px-6 pb-14 pt-8 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Services', to: '/services' }, { label: page.navLabel, to: path }]} />
          <p className={eyebrowClass}>{page.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-5xl">{page.h1}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed sm:text-xl">{page.lead}</p>
          <p className="mt-4 max-w-3xl leading-relaxed text-ink-500 dark:text-ink-300">{page.support}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105">
              Discuss Your Project <FiArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/case-studies" className="inline-flex items-center gap-2 rounded-full border border-ink-300 px-7 py-3.5 text-sm font-semibold text-ink-800 hover:border-gold-400 hover:text-gold-600 dark:border-ink-700 dark:text-ink-100 dark:hover:text-gold-400">
              View Our Work
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-20 px-6 py-16 lg:px-8">
        <section>
          <h2 className={h2Class}>{page.problems.heading}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {page.problems.items.map((item) => (
              <div key={item.title} className="rounded-2xl border border-ink-200 p-6 dark:border-ink-800">
                <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={h2Class}>{page.capabilities.heading}</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {page.capabilities.items.map((item) => (
              <div key={item.title} className="border-t border-ink-200 pt-4 dark:border-ink-800">
                <dt className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white"><FiCheck className="h-4 w-4 shrink-0 text-gold-500" />{item.title}</dt>
                <dd className="mt-2 leading-relaxed">{item.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className={h2Class}>{page.engineering.heading}</h2>
          <p className="mt-3 max-w-3xl text-ink-500 dark:text-ink-300">{page.engineering.intro}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {page.engineering.items.map((item) => (
              <div key={item.title} className="rounded-2xl bg-ink-50 p-6 dark:bg-ink-900/50">
                <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={h2Class}>Technology we use for this work</h2>
          <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {page.technologies.map((group) => (
              <div key={group.area}>
                <dt className={eyebrowClass}>{group.area}</dt>
                <dd className="mt-2 font-semibold text-ink-900 dark:text-white">{group.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className={h2Class}>How a project runs</h2>
          <p className="mt-3 max-w-3xl leading-relaxed">{page.processNote}</p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEVELOPMENT_PROCESS.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-ink-200 p-4 dark:border-ink-800">
                <span className="font-display text-sm font-bold text-gold-600 dark:text-gold-400">{String(index + 1).padStart(2, '0')}</span>
                <span className="mt-1 block font-semibold text-ink-900 dark:text-white">{step.title}</span>
                <span className="mt-1 block text-sm text-ink-500 dark:text-ink-300">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className={h2Class}>{page.proof.heading}</h2>
          <div className="mt-6 max-w-3xl space-y-4 leading-relaxed">
            {page.proof.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="mt-8"><RelatedCaseStudy slug={page.proof.caseStudy} /></div>
        </section>

        <section>
          <h2 className={h2Class}>Questions buyers ask us</h2>
          <div className="mt-6 divide-y divide-ink-200 border-y border-ink-200 dark:divide-ink-800 dark:border-ink-800">
            {page.faqs.map(([question, answer]) => (
              <div key={question} className="py-5">
                <h3 className="font-semibold text-ink-900 dark:text-white">{question}</h3>
                <p className="mt-2 leading-relaxed">{answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-12 md:grid-cols-2">
          <RelatedLearning links={page.learning} />
          <nav aria-label="Related services">
            <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">Related services</h2>
            <ul className="mt-4 space-y-3">
              {related.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="font-semibold text-gold-600 underline dark:text-gold-400">{item.title}</Link>
                  <span className="block text-sm text-ink-500 dark:text-ink-300">{item.summary}</span>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <EngineeringCTA text="Tell us what you want to build, what it has to connect to and when you need it. We will get back to you to talk through scope and next steps." />
      </div>
    </article>
  )
}
