import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import CaseStudyCard from '../components/caseStudies/CaseStudyCard'
import { CASE_STUDIES } from '../data/caseStudies'
import { useSeo } from '../hooks/useSeo'

export default function CaseStudies() {
  useSeo({
    title: 'Engineering Case Studies',
    description: 'How WebNest Studio engineers real products: architecture, payments, data, security and automation behind the platforms we have delivered.',
    path: '/case-studies',
  })

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Case Studies', to: '/case-studies' }]} />
      <header className="max-w-3xl">
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">Engineering Case Studies</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-500 dark:text-ink-300">
          Inside the products, platforms and systems we engineer at WebNest Studio. Each case study explains what the
          client needed, how the system is put together and the engineering decisions behind it — without invented
          numbers.
        </p>
      </header>
      <div className="mt-12 grid gap-8">
        {CASE_STUDIES.map((study, index) => (
          <Reveal key={study.slug} delay={index * 0.08}>
            <CaseStudyCard study={study} />
          </Reveal>
        ))}
      </div>
      <p className="mt-12 text-ink-600 dark:text-ink-200">
        Planning something similar? See our <Link to="/services" className="font-semibold text-gold-600 underline dark:text-gold-400">development services</Link> or{' '}
        <Link to="/contact" className="font-semibold text-gold-600 underline dark:text-gold-400">tell us about your project</Link>.
      </p>
    </div>
  )
}
