import { FiArrowDown } from 'react-icons/fi'
import Reveal from '../Reveal'

// Stacked layers with a connector between each. Built from text, not an image,
// so it stays readable on a 320px screen and is visible to crawlers.
export default function ArchitectureDiagram({ layers }) {
  return (
    <ol aria-label="Architecture layers, from the user interface down to external services" className="mx-auto mt-12 max-w-3xl">
      {layers.map((layer, index) => (
        <li key={layer.name}>
          <Reveal delay={index * 0.05}>
            <div className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-950 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-bold text-gold-600 dark:text-gold-400">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">{layer.name}</h3>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {layer.items.map((item) => (
                  <li key={item} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200">{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          {index < layers.length - 1 && (
            <div aria-hidden="true" className="flex flex-col items-center py-1 text-gold-500">
              <span className="h-4 w-px bg-gold-400/70" />
              <FiArrowDown className="-mt-1 h-5 w-5 shrink-0" />
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}
