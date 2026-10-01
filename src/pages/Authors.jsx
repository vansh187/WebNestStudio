import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiMail } from 'react-icons/fi'
import { FaLinkedinIn } from 'react-icons/fa'
import BackButton from '../components/coding/BackButton'
import Breadcrumbs from '../components/Breadcrumbs'
import { useSeo, useStructuredData, SITE_NAME, SITE_URL } from '../hooks/useSeo'
import { SAMPLE_COURSES } from '../data/codelabDefaults'
import { AUTHOR_PAGE_PATH, FOUNDER, TEAM_AUTHOR } from '../data/authors'
import founderPhoto from '../assets/founder-original.jpeg'

const EDITORIAL_POINTS = [
  'Each lesson explains one concept, then shows it in code with the output you should expect to see.',
  'Examples that run in the browser open directly in Webnest CodeLab, so you can change them and compare results.',
  'Lessons are grouped into courses and ordered so that each one builds on the previous topic.',
  'If you spot a mistake or something unclear, write to us and we will correct the lesson.',
]

export default function Authors() {
  useSeo({
    title: 'About the Authors - WebNest Studio Engineering Team',
    description: 'Who writes the WebNest Learn tutorials: the WebNest Studio engineering team, led by founder Vansh Duggal. How lessons are written and how to reach us.',
    path: AUTHOR_PAGE_PATH,
  })

  const personSchema = useMemo(() => ({
    '@context': 'https://schema.org', '@type': 'Person',
    name: FOUNDER.name, jobTitle: 'Founder',
    description: FOUNDER.bio,
    url: `${SITE_URL}${AUTHOR_PAGE_PATH}`,
    worksFor: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    sameAs: [FOUNDER.linkedinHref],
  }), [])
  useStructuredData(personSchema)

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' }, { label: 'Authors', to: AUTHOR_PAGE_PATH }]} />
      <BackButton fallback="/learn" />

      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
        {TEAM_AUTHOR.name}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-500 dark:text-ink-300">{TEAM_AUTHOR.tagline}</p>
      <p className="mt-4 leading-relaxed text-ink-600 dark:text-ink-200">
        The tutorials on WebNest Learn are written and maintained by the engineers at {SITE_NAME}, an IT
        consultancy that builds websites, AI integrations and full-stack software. We teach the same
        technologies we use for client work: React on the front end, Java, Spring Boot and Python on the
        back end, and SQL databases underneath.
      </p>

      <section className="mt-10 rounded-2xl border border-ink-200 p-6 dark:border-ink-800 sm:flex sm:gap-6">
        <img
          src={founderPhoto}
          alt={`${FOUNDER.name}, founder of ${SITE_NAME}`}
          width={160}
          height={160}
          loading="lazy"
          className="h-40 w-40 shrink-0 rounded-2xl object-cover object-[center_28%]"
        />
        <div className="mt-5 min-w-0 sm:mt-0">
          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">{FOUNDER.name}</h2>
          <p className="mt-1 text-sm font-semibold text-gold-600 dark:text-gold-400">{FOUNDER.role} · {FOUNDER.focus}</p>
          <p className="mt-3 leading-relaxed text-ink-600 dark:text-ink-200">{FOUNDER.bio}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href={FOUNDER.linkedinHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-ink-700 hover:text-gold-500 dark:text-ink-100">
              <FaLinkedinIn className="h-4 w-4" /> LinkedIn
            </a>
            <a href={FOUNDER.emailHref} className="inline-flex items-center gap-2 font-semibold text-ink-700 hover:text-gold-500 dark:text-ink-100">
              <FiMail className="h-4 w-4" /> {FOUNDER.email}
            </a>
            <Link to="/our-story" className="font-semibold text-gold-600 underline dark:text-gold-400">Our story</Link>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">How we write lessons</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-ink-600 dark:text-ink-200">
          {EDITORIAL_POINTS.map((point) => <li key={point}>{point}</li>)}
        </ul>
        <p className="mt-4 text-ink-600 dark:text-ink-200">
          Corrections and questions: <a href={FOUNDER.emailHref} className="font-semibold text-gold-600 underline dark:text-gold-400">{FOUNDER.email}</a> or the{' '}
          <Link to="/contact" className="font-semibold text-gold-600 underline dark:text-gold-400">contact page</Link>.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Courses by this team</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {SAMPLE_COURSES.map((course) => (
            <li key={course.slug}>
              <Link to={`/learn/${course.slug}`} className="block rounded-xl border border-ink-200 p-4 hover:border-gold-400 dark:border-ink-800">
                <span className="font-semibold text-ink-900 dark:text-white">{course.title}</span>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-widest text-ink-400">{course.level} · {course.lessons_count} lessons</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
