import { FiCompass, FiTarget, FiFlag, FiHeart, FiZap, FiShield } from 'react-icons/fi'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'

const PILLARS = [
  {
    icon: FiCompass,
    title: 'Our Vision',
    body:
      'A world where every business — from a solo founder to a global enterprise — has a digital presence as powerful as its ambition. We see a future where the gap between "having a website" and "owning your market online" disappears, and we intend to be the studio that closes it, one brand at a time.',
  },
  {
    icon: FiTarget,
    title: 'Our Mission',
    body:
      'To engineer websites, AI systems, and enterprise software that don\'t just look extraordinary — they perform. Every project we ship is built on real engineering discipline: React front ends, Java and Python back ends, Spring Boot services, and enterprise-grade databases, delivered with the speed and clarity our clients deserve.',
  },
  {
    icon: FiFlag,
    title: 'Our Goal',
    body:
      'To become the go-to consultancy for brands that refuse to blend in — helping 100+ businesses launch, scale, and dominate their digital space in the next three years, through relentless craftsmanship, honest communication, and technology that actually works.',
  },
]

const VALUES = [
  { icon: FiZap, title: 'Move with intent', body: 'We ship fast without sacrificing quality — every sprint has a purpose.' },
  { icon: FiHeart, title: 'Client-first, always', body: 'Your goals define success. We build for your business, not our portfolio.' },
  { icon: FiShield, title: 'Engineering integrity', body: 'Secure, scalable, well-tested code — no shortcuts on what matters.' },
]

export default function About() {
  return (
    <div>
      <section className="bg-grid relative px-6 py-20 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-500">
            About WebNest Studio
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            We build the digital identity your brand has been missing.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-500 dark:text-ink-300">
            WebNest Studio is an IT consultancy founded on one belief: exceptional technology
            should feel inevitable. We combine web engineering, AI, and enterprise software
            expertise into one team so you never have to stitch together five vendors again.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                  <p.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 font-display text-xl font-bold text-ink-900 dark:text-white">
                  {p.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ink-50 dark:bg-ink-900/40 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="What Drives Us"
            title="The values behind every line of code"
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-900 dark:text-white">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                  {v.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
        <Reveal>
          <blockquote className="font-display text-2xl font-medium italic text-ink-900 dark:text-white sm:text-3xl">
            "We don't just build websites — we build the digital front door to your business,
            and we make sure it opens onto growth."
          </blockquote>
          <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-gold-500">
            The WebNest Studio Team
          </p>
        </Reveal>
      </section>
    </div>
  )
}
