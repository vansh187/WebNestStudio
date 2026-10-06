import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiAlertTriangle, FiAward, FiBookmark, FiBookOpen, FiBox, FiCheck, FiChevronDown, FiCompass, FiCpu, FiDatabase,
  FiFileText, FiFlag, FiGitBranch, FiGlobe, FiHardDrive, FiLayers, FiLayout, FiSearch, FiServer,
  FiShield, FiTrendingUp, FiType, FiX, FiZap,
} from 'react-icons/fi'
import { getLessonProgress } from '../lib/learningProgress'

// Course outline drawn as a journey map: modules are milestones on a glowing road
// (zig-zag on desktop, a single path on phones) and open into their topics.
// Collapsed modules use <details>, so every lesson link stays in the
// prerendered HTML for crawlers.

// Picks a milestone icon from the module title, so any course gets sensible icons.
const MODULE_ICONS = [
  [/basic|intro|getting started|fundamental|setup/i, FiCompass],
  [/control|flow|loop|condition/i, FiGitBranch],
  [/string|regex|text|syntax/i, FiType],
  [/object|oop|class/i, FiBox],
  [/exception|error/i, FiAlertTriangle],
  [/thread|concurren|async/i, FiCpu],
  [/memory|keyword/i, FiHardDrive],
  [/collection|data structure|list/i, FiLayers],
  [/i\/o|file|stream/i, FiFileText],
  [/network|http|web|api|rest/i, FiGlobe],
  [/algorithm|performance|optimi/i, FiTrendingUp],
  [/sql|database|data|jdbc|jpa/i, FiDatabase],
  [/security|auth/i, FiShield],
  [/deploy|server|cloud|docker/i, FiServer],
  [/component|ui|layout|css|html|react/i, FiLayout],
  [/java 8|lambda|functional|modern/i, FiZap],
]

function moduleIcon(title) {
  return MODULE_ICONS.find(([pattern]) => pattern.test(title))?.[1] || FiBookOpen
}

function lessonStatus(progress, lessonId) {
  const entry = getLessonProgress(progress, lessonId)
  return { done: entry.status === 'completed', started: entry.status === 'in_progress', bookmarked: entry.bookmarked }
}

export default function CourseRoadmap({ course, progress, nextLessonId }) {
  const modules = useMemo(() => course.modules.map((module, index) => ({
    ...module,
    key: module.id || module.title,
    number: index + 1,
    Icon: moduleIcon(module.title),
    lessons: Array.isArray(module.lessons) ? module.lessons : [],
  })), [course])

  // The module holding the learner's next lesson starts open; the rest stay collapsed.
  const startKey = modules.find((module) => module.lessons.some((lesson) => lesson.id === nextLessonId))?.key ?? modules[0]?.key
  const [open, setOpen] = useState(() => new Set(startKey ? [startKey] : []))
  const [query, setQuery] = useState('')

  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0)
  const completedLessons = modules.reduce((sum, module) => sum + module.lessons.filter((lesson) => lessonStatus(progress, lesson.id).done).length, 0)
  const percent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  const term = query.trim().toLowerCase()
  const visible = term
    ? modules
      .map((module) => ({ ...module, lessons: module.lessons.filter((lesson) => lesson.title.toLowerCase().includes(term) || module.title.toLowerCase().includes(term)) }))
      .filter((module) => module.lessons.length > 0)
    : modules
  const matchCount = visible.reduce((sum, module) => sum + module.lessons.length, 0)

  function toggle(key, isOpen) {
    setOpen((current) => {
      if (current.has(key) === isOpen) return current
      const next = new Set(current)
      if (isOpen) next.add(key)
      else next.delete(key)
      return next
    })
  }

  return (
    <section aria-labelledby="roadmap-heading" className="dark relative mt-8 overflow-hidden rounded-3xl bg-night px-4 py-10 text-ink-100 sm:px-8 lg:px-10">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 right-[-10%] h-80 w-80 rounded-full bg-gold-400/20 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-[-10%] h-80 w-80 rounded-full bg-gold-600/10 blur-[110px]" />

      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold-400">Course roadmap</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 id="roadmap-heading" className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your <span className="text-gradient-gold">{course.title}</span> journey
          </h2>
          <div className="flex gap-2 text-sm font-semibold">
            <button type="button" onClick={() => setOpen(new Set(modules.map((module) => module.key)))} className="rounded-full border border-white/15 px-4 py-1.5 text-ink-100 hover:border-gold-400 hover:text-gold-300">Expand all</button>
            <button type="button" onClick={() => setOpen(new Set())} className="rounded-full border border-white/15 px-4 py-1.5 text-ink-100 hover:border-gold-400 hover:text-gold-300">Collapse all</button>
          </div>
        </div>
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div><dt className="inline text-ink-400">Milestones </dt><dd className="inline font-semibold text-white">{modules.length}</dd></div>
          <div><dt className="inline text-ink-400">Topics </dt><dd className="inline font-semibold text-white">{totalLessons}</dd></div>
          {completedLessons > 0 && <div><dt className="inline text-ink-400">Completed </dt><dd className="inline font-semibold text-gold-300">{completedLessons} · {percent}%</dd></div>}
        </dl>

        <label className="relative mt-6 block max-w-2xl">
          <span className="sr-only">Find a topic in this course</span>
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Jump to a topic, e.g. "string" or "thread"'
            className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-11 text-sm text-white placeholder:text-ink-400 outline-none backdrop-blur focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-white">
              <FiX className="h-4 w-4" />
            </button>
          )}
        </label>
        {term && <p className="mt-2 text-sm text-ink-300" aria-live="polite">{matchCount ? `${matchCount} matching topic${matchCount === 1 ? '' : 's'}` : 'No topics match. Try a shorter word.'}</p>}

        <div className="relative mt-10">
          {/* The road: a faint track, with gold filling it as the learner progresses */}
          <span aria-hidden="true" className="absolute bottom-0 left-[23px] top-0 w-1 rounded-full bg-white/10 md:left-1/2 md:-translate-x-1/2" />
          <span aria-hidden="true" style={{ height: `${Math.max(percent, 4)}%` }} className="absolute left-[23px] top-0 w-1 rounded-full bg-gradient-to-b from-gold-300 to-gold-500 shadow-[0_0_16px_rgba(230,172,62,0.7)] md:left-1/2 md:-translate-x-1/2" />

          <div className="relative mb-8 flex items-center gap-3 pl-0 md:justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400 text-ink-950 shadow-[0_0_24px_rgba(230,172,62,0.6)]"><FiFlag className="h-5 w-5" /></span>
            <span className="rounded-full border border-gold-400/40 bg-ink-950/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-300 md:absolute md:left-1/2 md:ml-10">Start here</span>
          </div>

          <ol className="relative">
            {visible.map((module, index) => {
              const done = module.lessons.filter((lesson) => lessonStatus(progress, lesson.id).done).length
              const complete = done === module.lessons.length && !term
              const isOpen = Boolean(term) || open.has(module.key)
              const onRight = index % 2 === 1
              const { Icon } = module
              return (
                <li key={module.key} className="relative pb-8 pl-16 md:grid md:grid-cols-2 md:gap-20 md:pl-0">
                  {/* Milestone node on the road */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-shadow md:left-1/2 md:-translate-x-1/2 ${complete ? 'border-emerald-400 bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.55)]' : isOpen ? 'border-gold-300 bg-gold-400 text-ink-950 shadow-[0_0_26px_rgba(230,172,62,0.7)]' : 'border-gold-400/40 bg-ink-950 text-gold-300'}`}
                  >
                    {complete ? <FiCheck className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-950 px-1 text-[10px] font-bold text-gold-300 ring-1 ring-gold-400/50">{module.number}</span>
                  </span>

                  <details
                    open={isOpen}
                    onToggle={(event) => { if (!term) toggle(module.key, event.currentTarget.open) }}
                    className={`group rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur transition-colors open:border-gold-400/50 open:bg-white/[0.06] open:shadow-[0_0_40px_rgba(230,172,62,0.12)] ${onRight ? 'md:col-start-2' : 'md:col-start-1'}`}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400">Milestone {module.number}</span>
                        <span className="mt-1 block font-display text-lg font-semibold leading-snug text-white">{module.title}</span>
                        {done > 0 && (
                          <span className="mt-2 block h-1 w-full max-w-40 overflow-hidden rounded-full bg-white/10">
                            <span className="block h-full rounded-full bg-gold-400" style={{ width: `${Math.round((done / module.lessons.length) * 100)}%` }} />
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-3 text-xs text-ink-300">
                        <span>{done > 0 ? `${done}/${module.lessons.length}` : `${module.lessons.length} topic${module.lessons.length === 1 ? '' : 's'}`}</span>
                        <FiChevronDown className="h-5 w-5 text-gold-400 transition-transform group-open:rotate-180" />
                      </span>
                    </summary>
                    <ul className="relative mx-5 mb-5 border-l-2 border-dashed border-gold-400/30 pl-5">
                      {module.lessons.map((lesson) => {
                        const status = lessonStatus(progress, lesson.id)
                        const isNext = lesson.id === nextLessonId && !status.done
                        return (
                          <li key={lesson.id} className="relative py-0.5">
                            {/* Branch from the milestone line to the topic */}
                            <span aria-hidden="true" className="absolute -left-5 top-1/2 h-0.5 w-4 bg-gold-400/30" />
                            <Link
                              to={`/learn/lessons/${lesson.id}`}
                              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isNext ? 'bg-gold-400/15 font-semibold text-white ring-1 ring-gold-400/60' : 'text-ink-200 hover:bg-white/5 hover:text-gold-300'}`}
                            >
                              <span className="flex min-w-0 items-center gap-2.5">
                                <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.done ? 'bg-emerald-400' : status.started ? 'bg-gold-400' : 'border-2 border-ink-500'}`} />
                                <span>{lesson.title}</span>
                              </span>
                              <span className="flex shrink-0 items-center gap-2 text-xs">
                                {status.bookmarked && <FiBookmark className="h-3.5 w-3.5 text-gold-400" aria-label="Bookmarked" />}
                                {status.done ? <span className="text-emerald-400">Completed</span> : isNext ? <span className="text-gold-300">Up next</span> : status.started ? <span className="text-ink-300">In progress</span> : null}
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </details>
                </li>
              )
            })}
          </ol>

          {!term && (
            <div className="relative flex items-center gap-3 md:justify-center">
              <span className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${percent === 100 ? 'border-gold-300 bg-gold-400 text-ink-950 shadow-[0_0_26px_rgba(230,172,62,0.7)]' : 'border-gold-400/40 bg-ink-950 text-gold-300'}`}><FiAward className="h-5 w-5" /></span>
              <span className="rounded-full border border-gold-400/40 bg-ink-950/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-300 md:absolute md:left-1/2 md:ml-10">{percent === 100 ? 'Course complete' : 'Finish line'}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
