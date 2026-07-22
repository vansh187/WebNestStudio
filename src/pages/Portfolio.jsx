import { Link } from 'react-router-dom'
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import { PORTFOLIO } from '../data/site'

export default function Portfolio() {
  return (
    <div>
      <section className="bg-grid px-6 py-20 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
            Our Work
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            Real problems. Real engineering. Real results.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-500 dark:text-ink-300">
            A look at the kind of work we do — as we onboard our first WebNest Studio clients,
            this space will grow into a full case-study archive.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {PORTFOLIO.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="group relative overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-8 transition-all hover:-translate-y-1.5 hover:border-gold-400/60 hover:shadow-xl hover:shadow-gold-500/5">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-gold-400/10 px-3 py-1 text-xs font-semibold text-gold-500">
                    {p.tag}
                  </span>
                  <FiArrowUpRight className="h-5 w-5 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-500" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-ink-900 dark:text-white">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                  {p.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center lg:px-8">
        <Reveal>
          <div className="rounded-3xl bg-ink-900 dark:bg-gradient-to-br dark:from-ink-900 dark:to-ink-950 p-10">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Want your project featured here next?
            </h2>
            <p className="mt-3 text-ink-300">
              Let's build something worth showcasing.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105"
            >
              Start Your Project
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
