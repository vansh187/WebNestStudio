import Reveal from '../Reveal'
import ProcessTimeline from './ProcessTimeline'

export default function EngineeringFeature({ feature, tinted }) {
  return (
    <section id={feature.id} className={tinted ? 'bg-ink-50 py-16 dark:bg-ink-900/40 sm:py-20' : 'py-16 sm:py-20'}>
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <Reveal>
          <h2 className="max-w-3xl font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">{feature.heading}</h2>
          <div className="mt-6 max-w-3xl space-y-4 text-lg leading-relaxed text-ink-600 dark:text-ink-200">
            {feature.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          {feature.highlight && (
            <blockquote className="mt-8 max-w-3xl border-l-2 border-gold-400 pl-5 font-display text-xl font-semibold text-ink-900 dark:text-white">
              {feature.highlight}
            </blockquote>
          )}
        </Reveal>
        {feature.cards && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {feature.cards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-950">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{card.text}</p>
              </div>
            ))}
          </div>
        )}
        {feature.steps && <ProcessTimeline steps={feature.steps} label={`${feature.heading}: steps`} />}
      </div>
    </section>
  )
}
