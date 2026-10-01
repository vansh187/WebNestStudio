import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { CASE_STUDY_IMAGES } from './images'

export default function CaseStudyCard({ study }) {
  const image = CASE_STUDY_IMAGES[study.slug]
  return (
    <Link
      to={`/case-studies/${study.slug}`}
      className="group grid h-full overflow-hidden rounded-3xl border border-ink-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-xl hover:shadow-gold-500/5 dark:border-ink-800 dark:bg-ink-950 lg:grid-cols-[1.1fr_1fr]"
    >
      {image && (
        <div className="overflow-hidden bg-ink-100 dark:bg-ink-900">
          <img
            src={image.src}
            alt={study.imageAlt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex flex-col p-7 sm:p-9">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-600 dark:text-gold-400">{study.category}</span>
        <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">{study.title}</h3>
        <p className="mt-4 leading-relaxed text-ink-500 dark:text-ink-300">{study.description}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {study.technologies.map((tech) => (
            <li key={tech} className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold text-ink-600 dark:border-ink-700 dark:text-ink-200">{tech}</li>
          ))}
        </ul>
        <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-white">
          View Case Study
          <FiArrowRight className="h-4 w-4 text-gold-500 transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  )
}
