import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowRight, FiGlobe, FiCpu, FiLayers, FiDatabase, FiShare2, FiServer, FiCheck,
} from 'react-icons/fi'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { SERVICES, STATS, TECH_STACK, PROCESS, CONTACT } from '../data/site'

const ICONS = { FiGlobe, FiCpu, FiLayers, FiDatabase, FiShare2, FiServer }

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative bg-grid text-ink-900 dark:text-white">
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-gold-400/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 -left-40 h-[28rem] w-[28rem] rounded-full bg-gold-600/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500"
              >
                IT Consultancy &middot; Web &middot; AI
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
              >
                Where Brands <span className="text-gradient-gold">Go Digital.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500 dark:text-ink-300"
              >
                WebNest Studio designs and engineers websites, AI-powered products, and
                enterprise software that make your brand impossible to ignore — built on
                React, Java, Python, Spring Boot, and more.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-9 flex flex-wrap items-center gap-4"
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
                className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
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
              <div className="animate-float rounded-3xl border border-gold-400/30 bg-white/60 dark:bg-ink-900/60 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-ink-200 dark:border-ink-700 pb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                    Project Status
                  </span>
                  <span className="flex h-2.5 w-2.5 animate-glow rounded-full bg-gold-400" />
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    { label: 'Discovery', value: 100 },
                    { label: 'Design', value: 100 },
                    { label: 'Development', value: 72 },
                    { label: 'AI Integration', value: 48 },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="mb-1.5 flex justify-between text-xs text-ink-500 dark:text-ink-300">
                        <span>{row.label}</span>
                        <span>{row.value}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500"
                          style={{ width: `${row.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {['React', 'Python', 'Java'].map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-ink-200 dark:border-ink-700 py-2 text-center text-xs font-semibold text-ink-600 dark:text-ink-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
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
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <p className="font-display text-3xl font-extrabold text-gradient-gold sm:text-4xl">{s.value}</p>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">{s.label}</p>
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
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[s.icon]
            return (
              <Reveal key={s.title} delay={i * 0.07}>
                <div className="group h-full rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-7 transition-all hover:-translate-y-1.5 hover:border-gold-400/60 hover:shadow-xl hover:shadow-gold-500/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500 transition-colors group-hover:bg-gold-400 group-hover:text-ink-950">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink-900 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                    {s.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-ink-50 dark:bg-ink-900/40 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Process"
            title="A clear path from idea to launch"
            description="No black boxes. Every engagement follows a transparent, proven process."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.08}>
                <div className="relative rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 p-6">
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 dark:bg-gradient-to-br dark:from-ink-900 dark:to-ink-950 px-8 py-16 text-center sm:px-16">
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
