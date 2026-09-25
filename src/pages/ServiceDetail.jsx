import { Link, useParams } from 'react-router-dom'
import { SERVICE_PAGES } from '../data/servicePages'
import { useSeo, useStructuredData, SITE_NAME, SITE_URL } from '../hooks/useSeo'
import Breadcrumbs from '../components/Breadcrumbs'
import NotFound from './NotFound'

export default function ServiceDetail() {
  const { slug } = useParams()
  const service = SERVICE_PAGES.find((item) => item.slug === slug)
  useSeo({ title: service?.title || 'Service not found', description: service?.description, path: `/services/${slug}`, noindex: !service })
  useStructuredData(service ? {
    '@context': 'https://schema.org', '@type': 'Service', name: service.title,
    description: service.description, url: `${SITE_URL}/services/${slug}`,
    provider: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME },
  } : null)
  if (!service) return <NotFound />
  return (
    <article className="mx-auto max-w-4xl px-6 py-12 text-ink-700 dark:text-ink-200">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Services', to: '/services' }, { label: service.title, to: `/services/${slug}` }]} />
      <p className="text-sm font-semibold text-gold-600 dark:text-gold-400">IT consultancy · New Delhi, India</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink-900 dark:text-white">{service.title}</h1>
      <p className="mt-6 text-lg leading-relaxed">{service.intro}</p>
      <Link className="mt-6 inline-flex rounded-full bg-gold-400 px-6 py-3 font-semibold text-ink-950" to="/contact">Discuss your project</Link>
      <section className="mt-12"><h2 className="text-2xl font-semibold">When this service fits</h2><p className="mt-4 leading-relaxed">{service.problems}</p></section>
      <section className="mt-10"><h2 className="text-2xl font-semibold">What we can build</h2><ul className="mt-4 list-disc space-y-3 pl-6">{service.capabilities.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="mt-10"><h2 className="text-2xl font-semibold">From discovery to delivery</h2><p className="mt-4 leading-relaxed">{service.approach}</p><h3 className="mt-6 font-semibold">Technology choices</h3><p className="mt-2">{service.technologies}</p></section>
      <section className="mt-10"><h2 className="text-2xl font-semibold">Questions before you start</h2>{service.questions.map(([question, answer]) => <div className="mt-6" key={question}><h3 className="font-semibold">{question}</h3><p className="mt-2 leading-relaxed">{answer}</p></div>)}</section>
      <section className="mt-10 rounded-2xl border border-ink-200 p-6 dark:border-ink-800"><h2 className="text-xl font-semibold">Explore our work and expertise</h2><p className="mt-3">Browse our <Link to="/portfolio" className="underline">project portfolio</Link>, meet <Link to="/about" className="underline">WebNest Studio</Link>, or read our <Link to={`/learn/${service.course}`} className="underline">{service.courseLabel}</Link>.</p><p className="mt-3"><Link className="font-semibold underline" to="/contact">Tell us about your requirements</Link></p></section>
      <nav aria-label="Related services" className="mt-10"><h2 className="text-xl font-semibold">Related services</h2><ul className="mt-3 space-y-2">{SERVICE_PAGES.filter((item) => item.slug !== slug).map((item) => <li key={item.slug}><Link className="underline" to={`/services/${item.slug}`}>{item.title}</Link></li>)}</ul></nav>
    </article>
  )
}
