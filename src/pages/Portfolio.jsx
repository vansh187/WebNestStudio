import { Link } from 'react-router-dom'
import { FiArrowRight, FiExternalLink, FiCheckCircle } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import { ONGOING_PROJECTS } from '../data/ongoingProjects'
import { DELIVERED_PROJECTS } from '../data/deliveredProjects'
import { useSeo } from '../hooks/useSeo'

function DeliveredCard({ project, delay }) {
  return (
    <Reveal delay={delay}>
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-2xl border border-emerald-400/40 bg-white dark:bg-ink-900/40 transition-all hover:-translate-y-1.5 hover:border-emerald-400/70 hover:shadow-xl hover:shadow-emerald-500/10"
      >
        <div className="relative aspect-video w-full overflow-hidden border-b border-emerald-400/30 bg-ink-50 dark:bg-ink-900">
          <iframe
            src={project.url}
            title={project.name}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            className="pointer-events-none absolute left-0 top-0 h-[400%] w-[400%] origin-top-left scale-[0.25] border-0"
          />
          <div className="absolute inset-0 bg-transparent transition-colors group-hover:bg-ink-950/5" />
          {project.logo && (
            <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-white p-1.5 shadow-md dark:border-ink-800">
              <img src={project.logo} alt={`${project.name} logo`} className="h-full w-full object-contain" />
            </div>
          )}
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
            <FiCheckCircle className="h-3.5 w-3.5" />
            Delivered
          </span>
        </div>
        <div className="flex items-start justify-between gap-3 p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                Live in Production
              </span>
              {project.phase && (
                <span className="rounded-full bg-gold-400/10 px-3 py-1 text-xs font-semibold text-gold-500">
                  {project.phase}
                </span>
              )}
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-ink-900 dark:text-white">
              {project.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
              {project.description}
            </p>
          </div>
          <FiExternalLink className="mt-1 h-5 w-5 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-500" />
        </div>
      </a>
    </Reveal>
  )
}

function LivePreviewCard({ project, delay }) {
  return (
    <Reveal delay={delay}>
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 transition-all hover:-translate-y-1.5 hover:border-gold-400/60 hover:shadow-xl hover:shadow-gold-500/5"
      >
        <div className="relative aspect-video w-full overflow-hidden border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900">
          <iframe
            src={project.url}
            title={project.name}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            className="pointer-events-none absolute left-0 top-0 h-[400%] w-[400%] origin-top-left scale-[0.25] border-0"
          />
          <div className="absolute inset-0 bg-transparent transition-colors group-hover:bg-ink-950/5" />
          {project.logo && (
            <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-white p-1.5 shadow-md dark:border-ink-800">
              <img src={project.logo} alt={`${project.name} logo`} className="h-full w-full object-contain" />
            </div>
          )}
        </div>
        <div className="flex items-start justify-between gap-3 p-6">
          <div>
            <span className="rounded-full bg-gold-400/10 px-3 py-1 text-xs font-semibold text-gold-500">
              Ongoing Project
            </span>
            <h3 className="mt-3 font-display text-lg font-bold text-ink-900 dark:text-white">
              {project.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
              {project.description}
            </p>
          </div>
          <FiExternalLink className="mt-1 h-5 w-5 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-500" />
        </div>
      </a>
    </Reveal>
  )
}

export default function Portfolio() {
  useSeo({
    title: 'Our Work',
    description:
      "See what WebNest Studio has delivered and is building right now — live projects you can browse in production, not just static case studies.",
    path: '/portfolio',
  })

  return (
    <div>
      {DELIVERED_PROJECTS.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-20 lg:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-500">
              Shipped &amp; Live
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 dark:text-white sm:text-4xl">
              Projects Delivered
            </h1>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {DELIVERED_PROJECTS.map((project, i) => (
              <DeliveredCard key={project.url} project={project} delay={i * 0.08} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pt-20 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
            Currently Building
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-ink-900 dark:text-white sm:text-4xl">
            Ongoing Projects
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {ONGOING_PROJECTS.map((project, i) => (
            <LivePreviewCard key={project.url} project={project} delay={i * 0.08} />
          ))}
        </div>
      </section>

      <section className="mt-20 bg-grid px-6 py-20 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
            Our Work
          </span>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            Real problems. Real engineering. Real results.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-500 dark:text-ink-300">
            "Good design is obvious. Great design is transparent." We build for the second kind —
            work that just works, so your users never have to think twice.
          </p>
        </Reveal>
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
