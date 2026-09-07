import {
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiCompass,
  FiLayers,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { useSeo } from '../hooks/useSeo'
import founderOriginal from '../assets/founder-original.jpeg'

const STORY_MARKERS = [
  {
    label: 'How we started',
    title: 'Built from a founder-first belief',
    body:
      'WebNest Studio began with a simple conviction: a brand should not look ordinary online when its ambition is extraordinary. We started by helping businesses turn unclear digital ideas into websites, systems, and launch-ready products with structure, taste, and technical discipline.',
  },
  {
    label: 'How we are growing',
    title: 'From websites to complete digital ecosystems',
    body:
      'Our scope is expanding from premium websites into AI implementation, full-stack platforms, automation, database systems, and long-term digital growth partnerships. We are building a studio that can stay with a client from first launch to serious scale.',
  },
  {
    label: 'Where we are headed',
    title: 'A premium technology house for ambitious brands',
    body:
      'Our goal is to become the trusted digital partner for founders, luxury businesses, and growth-stage companies that want presence, performance, and polish in the same place.',
  },
]

const SCOPE = [
  { icon: FiLayers, title: 'Brand Websites', body: 'Premium business websites, landing pages, portfolios, and conversion-focused brand experiences.' },
  { icon: FiBarChart2, title: 'Growth Systems', body: 'CRM flows, lead capture, analytics, automation, and dashboards that turn attention into action.' },
  { icon: FiAward, title: 'Luxury Positioning', body: 'Digital experiences shaped for trust, aspiration, and the kind of detail premium customers notice.' },
  { icon: FiTrendingUp, title: 'Scale Ready Tech', body: 'React, Java, Python, Spring Boot, APIs, and databases engineered for real business growth.' },
]

const GOALS = [
  'Help 100+ brands launch or transform their digital presence with measurable business impact.',
  'Build a studio standard where design, engineering, strategy, and communication all feel premium.',
  'Expand into AI-led business tools that make operations faster, smarter, and easier to manage.',
]

export default function OurStory() {
  useSeo({
    title: 'Our Story',
    description:
      'The WebNest Studio story, founder vision, growth scope, and goals for building premium digital experiences for ambitious brands.',
    path: '/our-story',
  })

  return (
    <div className="overflow-hidden bg-white text-ink-900 dark:bg-ink-950 dark:text-white">
      <section className="relative border-b border-gold-400/20 bg-ink-950 px-6 pt-8 pb-10 text-white sm:pt-10 sm:pb-12 lg:px-8 lg:pt-12 lg:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(230,172,62,0.16),transparent_34%),linear-gradient(135deg,rgba(5,6,9,0.96),rgba(18,21,30,0.88))]" />
        <div className="relative mx-auto grid max-w-7xl items-start gap-7 lg:grid-cols-[0.96fr_1.04fr] lg:gap-12">
          <Reveal className="lg:row-start-1">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold-300">
              Our Story
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Growing WebNest Studio into a premium digital house for modern brands.
            </h1>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[390px]">
              <div className="absolute -inset-2 rounded-3xl bg-gold-300/10 blur-xl" />
              <div className="relative overflow-hidden rounded-3xl border border-gold-300/25 bg-white/8 p-3 shadow-2xl shadow-black/45 backdrop-blur">
                <div className="absolute inset-x-3 top-3 h-px bg-gradient-to-r from-transparent via-gold-200/40 to-transparent" />
                <img
                  src={founderOriginal}
                  alt="Founder of WebNest Studio in formal black-tie attire"
                  className="relative aspect-[5/4] w-full rounded-2xl border border-white/10 object-cover object-[center_28%]"
                />
                <div className="relative mt-3 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ink-950/55 px-4 py-3">
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-gold-300">
                      WebNest Studio
                    </p>
                    <p className="mt-1 text-xs text-ink-200 sm:text-sm">Founder-led digital craftsmanship</p>
                  </div>
                  <span className="hidden h-9 w-9 items-center justify-center rounded-full border border-gold-300/30 text-[0.68rem] font-bold text-gold-200 sm:flex">
                    WN
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="lg:row-start-2">
            <p className="mt-6 max-w-2xl text-base leading-8 text-ink-200 sm:text-lg">
              We are building more than websites. We are building the digital reputation,
              growth systems, and technology foundation that help ambitious businesses look
              sharper, move faster, and earn customer trust from the first impression.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-bold text-ink-950 transition-transform hover:scale-[1.02]"
              >
                Build With Us
                <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-300 hover:text-gold-200"
              >
                View Our Work
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold-600 dark:text-gold-400">
              Founder Vision
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
              A brand should feel premium before the customer ever speaks to you.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <Reveal>
              <div className="border-l-2 border-gold-400 pl-6">
                <p className="text-lg leading-8 text-ink-600 dark:text-ink-200">
                  WebNest Studio is growing with a clear direction: serve ambitious founders
                  and businesses that want their online presence to carry authority, elegance,
                  and technical strength. Our work blends strategy, design, software, and AI
                  so every brand we build has both beauty and backbone.
                </p>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.26em] text-gold-600 dark:text-gold-400">
                  WebNest Studio Founder
                </p>
              </div>
            </Reveal>

            <div className="grid gap-5">
              {STORY_MARKERS.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.08}>
                  <article className="border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900/40">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600 dark:text-gold-400">
                      {item.label}
                    </p>
                    <h3 className="mt-3 font-display text-xl font-bold text-ink-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-ink-500 dark:text-ink-300">
                      {item.body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink-50 px-6 py-20 dark:bg-ink-900/40 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold-600 dark:text-gold-400">
              Our Scope
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
              We are expanding into the services premium brands need after launch.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SCOPE.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06}>
                <article className="h-full border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
                  <div className="flex h-11 w-11 items-center justify-center bg-gold-400/10 text-gold-600 dark:text-gold-400">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink-500 dark:text-ink-300">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="sticky top-28">
              <div className="flex h-14 w-14 items-center justify-center border border-gold-400/40 text-gold-600 dark:text-gold-400">
                <FiTarget className="h-7 w-7" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-gold-600 dark:text-gold-400">
                Our Goals
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                Growth with taste, technology, and long-term trust.
              </h2>
            </div>
          </Reveal>

          <div className="space-y-4">
            {GOALS.map((goal, index) => (
              <Reveal key={goal} delay={index * 0.08}>
                <div className="flex gap-5 border-b border-ink-200 py-6 dark:border-ink-800">
                  <span className="font-display text-2xl font-bold text-gold-600 dark:text-gold-400">
                    0{index + 1}
                  </span>
                  <p className="text-base leading-8 text-ink-600 dark:text-ink-200">
                    {goal}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-950 px-6 py-20 text-white lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <FiCompass className="mx-auto h-10 w-10 text-gold-400" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-gold-300">
            Our Vision
          </p>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            To make WebNest Studio the place where premium brands come to become
            unforgettable online.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-ink-300">
            We see a future where every serious business has access to digital craftsmanship
            that feels world-class: strategic, elegant, intelligent, and engineered to grow.
          </p>
        </Reveal>
      </section>
    </div>
  )
}
