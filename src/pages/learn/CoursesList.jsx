import { Link } from 'react-router-dom'
import { FiArrowRight, FiBookOpen } from 'react-icons/fi'
import { SAMPLE_COURSES } from '../../data/codelabDefaults'
import { useSeo } from '../../hooks/useSeo'
import { EmptyState } from '../../components/states/StateViews'
import BackButton from '../../components/coding/BackButton'
import Reveal from '../../components/Reveal'
import HeroVideo, { HERO_BACK_CLASS } from '../../components/HeroVideo'
import NeuralBackdrop from '../../components/NeuralBackdrop'
import SdlcTrack from '../../components/SdlcTrack'

// Set to '/media/learn-hero' once the video files are in public/media (see HeroVideo).
const HERO_VIDEO = null

export default function CoursesList() {
  useSeo({ title: 'Learn Java, Python, React and SQL', description: 'Free programming tutorials from WebNest Studio: Core Java, Advanced Java, Spring, Python, React and databases, with examples and coding practice.', path: '/learn' })
  const courses = SAMPLE_COURSES
  const lessons = courses.reduce((sum, course) => sum + Number(course.lessons_count || 0), 0)

  return (
    <div>
      {/* -mt-22 pulls the hero up under the floating navbar (see Navbar). */}
      <section className="relative -mt-22 flex min-h-[80vh] items-center overflow-hidden bg-night px-6 pb-20 pt-44 lg:px-8">
        <HeroVideo base={HERO_VIDEO} dim={Boolean(HERO_VIDEO)}>{!HERO_VIDEO && <NeuralBackdrop fade="left" />}</HeroVideo>
        {!HERO_VIDEO && <div className="pointer-events-none absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-gold-400/20 blur-[120px]" />}
        <BackButton fallback="/codelab" label="Back to CodeLab" className={HERO_BACK_CLASS} />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400">
                Study
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.2] tracking-tight text-white sm:text-5xl">
                Learn programming with <span className="text-gradient-gold">WebNest Studio</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-200 lg:mx-0">
                Learn concepts, understand examples, and practice your code. Explore Java, Spring, Python, web development and databases at your own pace.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <a href="#courses" className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-105">
                  Browse {courses.length} courses <FiArrowRight className="h-4 w-4" />
                </a>
                {lessons > 0 && (
                  <span className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white">{lessons} lessons</span>
                )}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <SdlcTrack className="mx-auto w-full max-w-xl" />
          </Reveal>
        </div>
      </section>

      <div id="courses" className="mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8">
        {!courses.length ? (
          <EmptyState icon={FiBookOpen} title="No courses yet" description="Static courses will appear here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.slug} to={`/learn/${course.slug}`} className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md dark:border-ink-800 dark:bg-ink-900/40">
                <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">{course.title}</h2>
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">{course.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-ink-400">{course.level} · {course.lessons_count} lessons</p>
              </Link>
            ))}
          </div>
        )}
        <p className="mt-8 text-sm text-ink-500 dark:text-ink-300">WebNest Studio is an IT consultancy and software development company in Gurugram. Explore our <Link className="underline" to="/services">development services</Link> or <Link className="underline" to="/portfolio">project portfolio</Link>.</p>
      </div>
    </div>
  )
}
