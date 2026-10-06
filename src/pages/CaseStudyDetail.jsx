import { useEffect, useMemo } from 'react'
import { trackEvent } from '../lib/analytics'
import { SERVICE_DIRECTORY } from '../data/commercialPages'
import { Link, useParams } from 'react-router-dom'
import { FiArrowDown, FiArrowLeft, FiArrowRight, FiExternalLink } from 'react-icons/fi'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import ArchitectureDiagram from '../components/caseStudies/ArchitectureDiagram'
import EngineeringFeature from '../components/caseStudies/EngineeringFeature'
import { CASE_STUDY_IMAGES } from '../components/caseStudies/images'
import { CASE_STUDIES, getCaseStudy } from '../data/caseStudies'
import { useSeo, useStructuredData, SITE_NAME, SITE_URL } from '../hooks/useSeo'
import NotFound from './NotFound'

const eyebrow = 'text-xs font-bold uppercase tracking-[0.28em] text-gold-600 dark:text-gold-400'
const sectionTitle = 'font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl'

export default function CaseStudyDetail() {
  const { slug } = useParams()
  const study = getCaseStudy(slug)
  const image = CASE_STUDY_IMAGES[slug]
  const path = `/case-studies/${slug}`

  useSeo({
    title: study?.seo.title || 'Case study not found',
    description: study?.seo.description,
    path,
    image: image?.src,
    type: 'article',
    noindex: !study,
  })

  const schema = useMemo(() => study && {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: study.hero.h1,
    description: study.seo.description,
    url: `${SITE_URL}${path}`,
    ...(image ? { image: new URL(image.src, SITE_URL).href } : {}),
    about: { '@type': 'Organization', name: study.client, url: study.liveUrl },
    author: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME },
    publisher: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME },
    keywords: study.technologies.join(', '),
  }, [study, image, path])
  useStructuredData(schema)
  useEffect(() => { if (study) trackEvent('case_study_view', { case_study_slug: study.slug }) }, [study])

  if (!study) return <NotFound />

  const index = CASE_STUDIES.indexOf(study)
  const previous = CASE_STUDIES[index - 1]
  const next = CASE_STUDIES[index + 1]

  return (
    <article className="overflow-hidden text-ink-700 dark:text-ink-200">
      {/* HERO */}
      <header className="bg-grid relative">
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[32rem] w-[32rem] rounded-full bg-gold-400/15 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8 lg:pb-20">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Case Studies', to: '/case-studies' }, { label: study.title, to: path }]} />
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div>
              <span className="inline-flex items-center rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-600 dark:text-gold-400">
                {study.badge}
              </span>
              <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-4xl lg:text-5xl">
                {study.hero.h1}
              </h1>
              <p className="mt-5 font-display text-xl font-semibold text-gold-600 dark:text-gold-400 sm:text-2xl">{study.hero.headline}</p>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500 dark:text-ink-300">{study.hero.description}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {study.hero.technologies.map((tech) => (
                  <li key={tech} className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold text-ink-600 dark:border-ink-700 dark:text-ink-200">{tech}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={study.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-105 dark:bg-gold-400 dark:text-ink-950"
                >
                  Visit Platform <FiExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="#architecture"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-7 py-3.5 text-sm font-semibold text-ink-700 transition-colors hover:border-gold-400 hover:text-gold-500 dark:border-ink-700 dark:text-ink-100"
                >
                  Explore Architecture <FiArrowDown className="h-4 w-4" />
                </a>
              </div>
            </div>
            {image && (
              <div className="relative">
                <div className="absolute -inset-3 rounded-3xl bg-gold-300/10 blur-2xl" />
                <img
                  src={image.src}
                  alt={study.imageAlt}
                  width={image.width}
                  height={image.height}
                  fetchPriority="high"
                  className="relative w-full rounded-2xl border border-ink-200 shadow-2xl shadow-black/20 dark:border-ink-800"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CHALLENGE */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <Reveal>
            <p className={eyebrow}>Project Overview</p>
            <h2 className={`mt-4 ${sectionTitle}`}>{study.challenge.heading}</h2>
            <div className="mt-6 max-w-3xl space-y-4 text-lg leading-relaxed">
              {study.challenge.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {study.challenge.summary.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900/40">
                  <h3 className={eyebrow}>{item.label}</h3>
                  <p className="mt-3 font-display text-lg font-semibold text-ink-900 dark:text-white">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className="scroll-mt-24 bg-ink-50 py-16 dark:bg-ink-900/40 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className={eyebrow}>Architecture</p>
            <h2 className={`mt-4 ${sectionTitle}`}>{study.architecture.heading}</h2>
            <p className="mt-4 text-lg text-ink-500 dark:text-ink-300">{study.architecture.subheading}</p>
          </Reveal>
          <ArchitectureDiagram layers={study.architecture.layers} />
        </div>
      </section>

      {study.features.map((feature, i) => <EngineeringFeature key={feature.id} feature={feature} tinted={i % 2 === 1} />)}

      {/* ENGINEERING CHALLENGES */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <p className={eyebrow}>Engineering Beyond the UI</p>
            <h2 className={`mt-4 ${sectionTitle}`}>Engineering Challenges We Solved</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {study.engineeringChallenges.map((item, i) => (
              <Reveal key={item.title} delay={(i % 4) * 0.06}>
                <div className="h-full rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900/40">
                  <span className="font-display text-3xl font-extrabold text-ink-100 dark:text-ink-800">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-2 font-display text-lg font-bold text-ink-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TECHNOLOGY STACK */}
      <section className="bg-ink-50 py-16 dark:bg-ink-900/40 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <Reveal>
            <p className={eyebrow}>Technology</p>
            <h2 className={`mt-4 ${sectionTitle}`}>Technology Stack</h2>
          </Reveal>
          <dl className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {study.stack.map((group) => (
              <div key={group.area} className="border-t border-ink-200 pt-4 dark:border-ink-800">
                <dt className={eyebrow}>{group.area}</dt>
                <dd className="mt-2 font-display text-lg font-semibold text-ink-900 dark:text-white">{group.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* WHAT WE LEARNED */}
      <section className="py-16 sm:py-20">
        <Reveal className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className={sectionTitle}>{study.learned.heading}</h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed">
            {study.learned.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <p className="mt-8 text-base">
            Learn the technologies behind this build:{' '}
            {study.learnLinks.map((link, i) => (
              <span key={link.to}>
                <Link to={link.to} className="font-semibold text-gold-600 underline dark:text-gold-400">{link.label}</Link>
                {i < study.learnLinks.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </p>
          {study.relatedServices?.length > 0 && (
            <nav aria-label="Related services" className="mt-8">
              <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">Related services</h3>
              <ul className="mt-3 space-y-2">
                {SERVICE_DIRECTORY.filter((item) => study.relatedServices.includes(item.to)).map((item) => (
                  <li key={item.to}><Link to={item.to} className="font-semibold text-gold-600 underline dark:text-gold-400">{item.title}</Link> <span className="text-ink-500 dark:text-ink-300">· {item.summary}</span></li>
                ))}
              </ul>
            </nav>
          )}
        </Reveal>
      </section>

      {/* PHASE 2 */}
      <section className="bg-ink-950 py-16 text-white sm:py-20">
        <Reveal className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <span className="inline-flex items-center rounded-full border border-gold-300/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
            {study.futurePhase.badge}
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">{study.futurePhase.heading}</h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-200">
            {study.futurePhase.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <p className="mt-8 text-sm font-semibold text-gold-300">{study.futurePhase.cta}</p>
        </Reveal>
      </section>

      {/* PREVIOUS / NEXT */}
      {(previous || next) && (
        <nav aria-label="More case studies" className="mx-auto grid max-w-5xl gap-4 px-6 pt-16 sm:grid-cols-2 lg:px-8">
          {previous ? (
            <Link to={`/case-studies/${previous.slug}`} className="flex items-center gap-3 rounded-2xl border border-ink-200 p-5 hover:border-gold-400 dark:border-ink-800">
              <FiArrowLeft className="h-5 w-5 shrink-0" />
              <span><span className={eyebrow}>Previous</span><span className="mt-1 block font-semibold text-ink-900 dark:text-white">{previous.title}</span></span>
            </Link>
          ) : <span />}
          {next && (
            <Link to={`/case-studies/${next.slug}`} className="flex items-center justify-between gap-3 rounded-2xl border border-ink-200 p-5 text-right hover:border-gold-400 dark:border-ink-800">
              <span><span className={eyebrow}>Next</span><span className="mt-1 block font-semibold text-ink-900 dark:text-white">{next.title}</span></span>
              <FiArrowRight className="h-5 w-5 shrink-0" />
            </Link>
          )}
        </nav>
      )}

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-8 py-16 text-center dark:bg-gradient-to-br dark:from-ink-900 dark:to-ink-950 sm:px-16">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-400/20 blur-[100px]" />
            <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">Building More Than a Website?</h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-ink-300">
              We engineer the systems behind digital businesses — from customer-facing experiences to APIs, databases,
              payments, automation and intelligent workflows.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105">
                Discuss Your Project <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/case-studies" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-300">
                Explore More Case Studies
              </Link>
            </div>
            <p className="relative mx-auto mt-10 max-w-xl font-display text-lg italic text-ink-200">
              A beautiful storefront is what customers see. Reliable engineering is what makes it work.
            </p>
          </div>
        </Reveal>
      </section>
    </article>
  )
}
