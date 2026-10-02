import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowRight, FiGlobe, FiCpu, FiLayers, FiDatabase, FiShare2, FiServer, FiCloud, FiCheck, FiStar,
  FiExternalLink, FiBookOpen, FiPlay, FiCode,
} from 'react-icons/fi'
import HeroVideo from '../components/HeroVideo'
import NeuralBackdrop from '../components/NeuralBackdrop'
import { ONGOING_PROJECTS } from '../data/ongoingProjects'
import BuildTrackerCard from '../components/BuildTrackerCard'
import Reveal from '../components/Reveal'
import LaunchAnnouncementModal from '../components/LaunchAnnouncementModal'
import SectionHeading from '../components/SectionHeading'
import CaseStudiesSection from '../components/caseStudies/CaseStudiesSection'
import { SkeletonGrid } from '../components/states/Skeleton'
import { ErrorState } from '../components/states/StateViews'
import { useHomeData } from '../hooks/useHomeData'
import { wakeServer } from '../lib/health'
import { TECH_STACK, PROCESS, CONTACT } from '../data/site'
import { TECH_CATEGORIES } from '../data/techStackDetails'
import { DELIVERED_PROJECTS } from '../data/deliveredProjects'
import { CLIENT_TESTIMONIALS } from '../data/clientTestimonials'
import { useSeo } from '../hooks/useSeo'

// Course totals shown on the landing page. Kept here as plain numbers because the course
// data itself is a very large file that the landing page should not load. Update when
// courses are added (the Learn page shows the exact live counts).
const LEARNING = { courses: 12, lessons: '550+' }

// Colour scheme of the hero and the learning band: true = cream and gold with dark
// accents (navbar, footer, review and call-to-action panels); false = warm charcoal.
const CREAM = false

const LEARN_LINKS = [
  { to: '/learn', icon: FiBookOpen, title: 'Courses', text: 'Java, Spring, Python, React and SQL, lesson by lesson.' },
  { to: '/codelab/playground', icon: FiPlay, title: 'Playground', text: 'Write and run code in your browser. Nothing to install.' },
  { to: '/codelab/problems', icon: FiCode, title: 'Problems', text: 'Easy, medium and hard challenges that earn XP.' },
]

const ICON_CYCLE = [FiGlobe, FiCpu, FiLayers, FiDatabase, FiShare2, FiServer]
const CATEGORY_ICONS = { FiGlobe, FiCpu, FiCloud, FiDatabase, FiShare2, FiServer }

export default function Home() {
  const { state, reload } = useHomeData()
  // Our own client feedback always shows; admin-managed testimonials follow once loaded.
  const apiTestimonials = state.testimonials.status === 'success' ? state.testimonials.data : []
  const testimonials = [
    ...CLIENT_TESTIMONIALS,
    ...apiTestimonials.filter((t) => !CLIENT_TESTIMONIALS.some((own) => own.quote === t.quote)),
  ]
  // The first one gets the wide featured card; any others sit in a grid below it.
  const [featured, ...moreTestimonials] = testimonials

  useSeo({
    title: 'Website Development, AI Implementation & Full-Stack Engineering',
    description:
      'WebNest Studio builds websites, AI products and software, and trains developers with courses and CodeLab — where brands go digital and developers are born.',
    path: '/',
  })

  useEffect(() => {
    wakeServer()
  }, [])

  const displayStats = [
    { value: DELIVERED_PROJECTS.length + ONGOING_PROJECTS.length, label: 'Client projects, live and in progress' },
    { value: LEARNING.courses, label: 'Free courses' },
    { value: LEARNING.lessons, label: 'Lessons' },
    { value: TECH_STACK.length, label: 'Core technologies' },
  ]

  const demoStatus = state.projectStatus.data

  return (
    <div className="-mt-22 overflow-hidden">
      <LaunchAnnouncementModal />

      {/* HERO — always dark ("dark" switches the card and buttons inside). The page wrapper's
          -mt-22 pulls it up under the floating navbar (see Navbar). */}
      <section className={`relative flex min-h-[min(88vh,820px)] items-center overflow-hidden text-ink-900 dark:text-white ${CREAM ? 'bg-cream' : 'dark bg-night'}`}>
        <HeroVideo dim={false}><NeuralBackdrop fade="left" /></HeroVideo>
        <div className="pointer-events-none absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-gold-400/20 blur-[120px]" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-40 lg:px-8 lg:pb-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500"
              >
                IT Consultancy &middot; Web &middot; AI &middot; Training
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mt-4 font-display text-4xl font-extrabold leading-[1.2] tracking-tight sm:text-5xl"
              >
                Where Brands <span className="text-gradient-gold">Go Digital</span>
                <br />
                &amp; Developers <span className="text-gradient-gold">Are Born.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-4 max-w-xl text-lg leading-relaxed text-ink-500 dark:text-ink-300"
              >
                WebNest Studio designs and engineers websites, AI-powered products, and
                enterprise software that make your brand impossible to ignore — built on
                React, Java, Python, Spring Boot, and more. We also train new developers
                through our courses and a hands-on CodeLab.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-6 flex flex-wrap items-center gap-4"
              >
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-gold-400 px-7 py-3.5 text-sm font-semibold text-white dark:text-ink-950 shadow-lg shadow-gold-500/10 transition-transform hover:scale-105"
                >
                  Discuss Your Project
                  <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-700 px-7 py-3.5 text-sm font-semibold text-ink-700 dark:text-ink-100 transition-colors hover:border-gold-400 hover:text-gold-500"
                >
                  View Our Work
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-6 flex flex-wrap gap-x-8 gap-y-3"
              >
                {['Any language, any stack', 'Dark & light experiences', 'AI-first engineering'].map((t) => (
                  <span key={t} className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-300">
                    <FiCheck className="h-4 w-4 text-gold-500" /> {t}
                  </span>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto w-full max-w-md"
            >
              <BuildTrackerCard
                projectName={demoStatus?.project_name}
                devLabel={demoStatus?.phase}
                devPercent={demoStatus?.percent_complete}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/40 py-6">
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee gap-12 pr-12">
            {[...TECH_STACK, ...TECH_STACK].map((t, i) => (
              <span
                key={`${t.name}-${i}`}
                className="whitespace-nowrap text-sm font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-500"
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gold-400/10 dark:bg-ink-900/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 py-14 sm:grid-cols-4 sm:divide-x sm:divide-gold-400/30 lg:px-8">
          {displayStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="px-4 text-center">
              <p className="font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <SectionHeading
          eyebrow="What We Do"
          title="Full-spectrum digital engineering"
          description="From the first pixel to the last line of enterprise code, we build the systems that let brands compete and win online."
        />
        <div className="mt-14">
          {state.services.status === 'loading' && <SkeletonGrid count={4} columns="sm:grid-cols-2 lg:grid-cols-3" />}
          {state.services.status === 'error' && (
            <ErrorState message={state.services.error} onRetry={() => reload(['services'])} />
          )}
          {state.services.status === 'success' && (
            state.services.data.length === 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {TECH_CATEGORIES.map((cat, i) => {
                  const Icon = CATEGORY_ICONS[cat.icon]
                  return (
                    <Reveal key={cat.title} delay={i * 0.07} className="h-full">
                      <Link
                        to="/services"
                        className="group flex h-full flex-col rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-7 transition-all hover:-translate-y-1.5 hover:border-gold-400/60 hover:shadow-xl hover:shadow-gold-500/10"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500 transition-colors group-hover:bg-gold-400 group-hover:text-ink-950">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="mt-5 font-display text-lg font-semibold text-ink-900 dark:text-white">
                          {cat.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                          {cat.description}
                        </p>
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {cat.technologies.map((item) => (
                            <li key={item} className="rounded-full bg-gold-400/10 px-2.5 py-1 text-xs font-semibold text-gold-700 dark:text-gold-400">
                              {item}
                            </li>
                          ))}
                        </ul>
                        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-gold-600 dark:text-gold-400">
                          Learn more <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </Reveal>
                  )
                })}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {state.services.data.map((s, i) => {
                  const Icon = ICON_CYCLE[i % ICON_CYCLE.length]
                  return (
                    <Reveal key={s.id ?? s.slug} delay={i * 0.07}>
                      <Link
                        to={s.slug ? `/services#${s.slug}` : '/services'}
                        className="group block h-full rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-7 transition-all hover:-translate-y-1.5 hover:border-gold-400/60 hover:shadow-xl hover:shadow-gold-500/5"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500 transition-colors group-hover:bg-gold-400 group-hover:text-ink-950">
                          {s.icon_url ? (
                            <img src={s.icon_url} alt="" className="h-6 w-6" />
                          ) : (
                            <Icon className="h-6 w-6" />
                          )}
                        </div>
                        <h3 className="mt-5 font-display text-lg font-semibold text-ink-900 dark:text-white">
                          {s.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                          {s.short_description}
                        </p>
                      </Link>
                    </Reveal>
                  )
                })}
              </div>
            )
          )}
        </div>
      </section>

      {/* FEATURED WORK — hidden entirely once we know the list is empty, no "coming soon" placeholder */}
      {state.featuredWork.status !== 'success' || state.featuredWork.data.length > 0 ? (
        <section className="bg-ink-50 dark:bg-ink-900/40 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading
              eyebrow="Selected Work"
              title="Results our clients can point to"
              description="A sample of recent engagements — real metrics, real outcomes."
            />
            <div className="mt-14">
              {state.featuredWork.status === 'loading' && (
                <SkeletonGrid count={3} columns="sm:grid-cols-2 lg:grid-cols-3" />
              )}
              {state.featuredWork.status === 'error' && (
                <ErrorState message={state.featuredWork.error} onRetry={() => reload(['featuredWork'])} />
              )}
              {state.featuredWork.status === 'success' && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {state.featuredWork.data.map((w, i) => (
                    <Reveal key={w.id ?? w.slug} delay={i * 0.08}>
                      <Link
                        to={`/portfolio/${w.slug}`}
                        className="group block h-full overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 transition-all hover:-translate-y-1.5 hover:border-gold-400/60"
                      >
                        {w.cover_image_url && (
                          <div className="aspect-video w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
                            <img
                              src={w.cover_image_url}
                              alt={w.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <span className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                            {w.category}
                          </span>
                          <h3 className="mt-2 font-display text-lg font-semibold text-ink-900 dark:text-white">
                            {w.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                            {w.short_description}
                          </p>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <CaseStudiesSection />

      {/* PROCESS */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Process"
            title="A clear path from idea to launch"
            description="No black boxes. Every engagement follows a transparent, proven process."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.08} className="h-full">
                <div className="relative h-full rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 p-6">
                  <span className="font-display text-4xl font-extrabold text-ink-100 dark:text-ink-800">
                    {p.step}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink-900 dark:text-white">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                    {p.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* LEARN — the "developers are born" half of the tagline */}
      <section className={`relative overflow-hidden py-20 ${CREAM ? 'bg-cream' : 'dark bg-night'}`}>
        <div className="hero-glow hero-glow-b" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-600 dark:text-gold-400">
              Learn &amp; Practise
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-4xl">
              Where developers <span className="text-gradient-gold">are born</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-600 dark:text-ink-200">
              {LEARNING.courses} free courses and {LEARNING.lessons} lessons with examples and coding
              practice, plus a playground that runs your code in the browser.
            </p>
            <Link to="/learn" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 dark:bg-gold-400 dark:text-ink-950">
              Start learning <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {LEARN_LINKS.map(({ to, icon: Icon, title, text }, i) => (
              <Reveal key={to} delay={i * 0.08} className="h-full">
                <Link to={to} className="block h-full rounded-2xl border border-gold-400/30 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gold-400 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15 text-gold-500 dark:text-gold-400"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">{text}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Client Voices"
          title="What it's like to work with us"
        />
        <div className="mt-14">
          {featured && (
            <Reveal>
              <figure className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-gold-400/40 bg-night px-8 py-12 text-center shadow-xl sm:px-14">
                <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold-400/20 blur-[90px]" />
                <div className="relative flex items-center justify-center gap-1 text-gold-400">
                  {Array.from({ length: featured.rating ?? 5 }).map((_, idx) => (
                    <FiStar key={idx} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <blockquote className="relative mt-6 font-display text-2xl font-semibold leading-snug text-white sm:text-3xl">
                  &ldquo;{featured.quote}&rdquo;
                </blockquote>
                <figcaption className="relative mt-8">
                  <p className="font-semibold text-white">{featured.client_name}</p>
                  {featured.company && <p className="mt-1 text-sm text-ink-300">{featured.company}</p>}
                </figcaption>
                {(featured.url || featured.review_url) && (
                  <div className="relative mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold">
                    {featured.review_url && (
                      <a href={featured.review_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-ink-950 transition-transform hover:scale-105">
                        {featured.review_label || 'See the review'} <FiArrowRight className="h-4 w-4" />
                      </a>
                    )}
                    {featured.url && (
                      <a href={featured.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-white hover:border-gold-400 hover:text-gold-400">
                        See the live site <FiExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </figure>
            </Reveal>
          )}
          {moreTestimonials.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {moreTestimonials.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.08} className="h-full">
                  <div className="h-full rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-7">
                    <div className="flex items-center gap-1 text-gold-400">
                      {Array.from({ length: t.rating ?? 5 }).map((_, idx) => (
                        <FiStar key={idx} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-ink-600 dark:text-ink-200">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      {t.avatar_url ? (
                        <img src={t.avatar_url} alt={t.client_name} className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400/10 text-sm font-semibold text-gold-500">
                          {t.client_name?.[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-ink-900 dark:text-white">{t.client_name}</p>
                        {t.company && <p className="text-xs text-ink-400">{t.company}</p>}
                      </div>
                    </div>
                    {(t.url || t.review_url) && (
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-gold-600 dark:text-gold-400">
                        {t.review_url && (
                          <a href={t.review_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
                            {t.review_label || 'See the review'} <FiArrowRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {t.url && (
                          <a href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
                            See the live site <FiArrowRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-night px-8 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-400/20 blur-[100px]" />
            <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">
              Ready to turn your idea into a digital brand?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-ink-300">
              Tell us what you're building. We'll reply within one business day with a plan,
              a timeline, and a straight answer.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105"
              >
                Get a Free Consultation
                <FiArrowRight className="h-4 w-4" />
              </a>
              <a
                href={CONTACT.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-300"
              >
                {CONTACT.phone}
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
