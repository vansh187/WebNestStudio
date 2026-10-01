import Reveal from '../Reveal'
import SectionHeading from '../SectionHeading'
import CaseStudyCard from './CaseStudyCard'
import { CASE_STUDIES } from '../../data/caseStudies'

export default function CaseStudiesSection() {
  if (!CASE_STUDIES.length) return null
  return (
    <section className="bg-ink-50 py-20 dark:bg-ink-900/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Case Studies"
          title="Engineering Case Studies"
          description="Inside the products, platforms and systems we engineer at WebNest Studio."
        />
        <div className="mt-14 grid gap-8">
          {CASE_STUDIES.map((study, index) => (
            <Reveal key={study.slug} delay={index * 0.08}>
              <CaseStudyCard study={study} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
