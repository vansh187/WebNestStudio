import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiGlobe, FiCpu, FiLayers, FiDatabase, FiShare2, FiServer, FiCloud, FiArrowRight, FiCheckCircle,
} from 'react-icons/fi'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { SkeletonGrid } from '../components/states/Skeleton'
import { ErrorState } from '../components/states/StateViews'
import { TECH_CATEGORIES } from '../data/techStackDetails'
import { getServices } from '../api/content'
import { getErrorDetail } from '../lib/apiClient'

const ICON_CYCLE = [FiGlobe, FiCpu, FiLayers, FiDatabase, FiShare2, FiServer]
const CATEGORY_ICONS = { FiGlobe, FiCpu, FiCloud, FiDatabase, FiShare2, FiServer }

const LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Arabic', 'Mandarin', 'Portuguese', 'Japanese',
]

export default function Services() {
  const [services, setServices] = useState(null)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setServices(null)
    setError(null)
    getServices()
      .then((data) => { if (!cancelled) setServices(data) })
      .catch((err) => { if (!cancelled) setError(getErrorDetail(err, 'Could not load our services right now.')) })
    return () => { cancelled = true }
  }, [reloadKey])

  return (
    <div>
      <section className="bg-grid px-6 py-20 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
            Services
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            Every layer of your digital stack, handled.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-500 dark:text-ink-300">
            We specialize deep and ship wide — from customer-facing websites to the enterprise
            infrastructure running behind them.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {services === null && !error && <SkeletonGrid count={4} columns="md:grid-cols-2" />}
        {error && <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />}
        {services && services.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((s, i) => {
              const Icon = ICON_CYCLE[i % ICON_CYCLE.length]
              return (
                <Reveal key={s.id ?? s.slug} delay={i * 0.06}>
                  <div id={s.slug} className="flex h-full scroll-mt-24 gap-5 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-7">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                      {s.icon_url ? <img src={s.icon_url} alt="" className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                        {s.full_description || s.short_description}
                      </p>
                      {s.tech_tags?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {s.tech_tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-gold-400/10 px-2.5 py-1 text-xs font-semibold text-gold-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        )}
      </section>

      <section className="bg-ink-50 dark:bg-ink-900/40 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Specializations"
            title="The technology stack we build on"
            description="Our engineers specialize in a focused, battle-tested set of technologies — chosen because they scale."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TECH_CATEGORIES.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.icon]
              return (
                <Reveal key={cat.title} delay={i * 0.07}>
                  <div className="h-full rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-ink-900 dark:text-white">
                      {cat.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                      {cat.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {cat.technologies.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
                          <FiCheckCircle className="h-4 w-4 shrink-0 text-gold-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Multi-Language Websites"
          title="Build your website in any language"
          description="We design and develop multi-language websites so you can reach your audience wherever they are — request any of the languages below, or ask for one that isn't listed."
        />
        <Reveal delay={0.1} className="mt-10 flex flex-wrap justify-center gap-3">
          {LANGUAGES.map((l) => (
            <span
              key={l}
              className="rounded-full border border-ink-200 dark:border-ink-700 px-4 py-2 text-sm font-medium text-ink-600 dark:text-ink-200"
            >
              {l}
            </span>
          ))}
          <span className="rounded-full border border-dashed border-gold-400 px-4 py-2 text-sm font-medium text-gold-500">
            + Your language
          </span>
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center lg:px-8">
        <Reveal>
          <div className="rounded-3xl border border-gold-400/30 bg-gold-400/5 p-10">
            <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">
              Not sure which stack fits your project?
            </h2>
            <p className="mt-3 text-ink-500 dark:text-ink-300">
              Tell us your goals — we'll recommend the right technology, timeline, and budget.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-gold-400 px-7 py-3.5 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-105"
            >
              Talk to Our Team
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
