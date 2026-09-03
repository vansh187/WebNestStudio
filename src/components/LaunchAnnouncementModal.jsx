import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiX, FiExternalLink, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { DELIVERED_PROJECTS } from '../data/deliveredProjects'

const DISMISSED_KEY = 'wns_announcement_dismissed_v1'

export default function LaunchAnnouncementModal() {
  const [open, setOpen] = useState(false)
  const project = DELIVERED_PROJECTS[0]

  useEffect(() => {
    if (!project) return
    let dismissed = false
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === '1'
    } catch {}
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [project])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function close() {
    setOpen(false)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {}
  }

  if (!project) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold-400/30 bg-white shadow-2xl dark:bg-ink-900"
          >
            <div className="relative h-72 overflow-hidden bg-ink-950 px-8 pb-8 pt-9 sm:h-80">
              <iframe
                src={project.url}
                title={`${project.name} live preview`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
                className="pointer-events-none absolute left-0 top-0 h-[400%] w-[400%] origin-top-left scale-[0.25]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/95 via-ink-950/80 to-ink-950/35" />

              <button
                type="button"
                onClick={close}
                aria-label="Close announcement"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                <FiX className="h-4 w-4" />
              </button>

              <span className="relative inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                First Project Delivered
              </span>

              <h2 className="relative mt-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                {project.name} is <span className="text-gradient-gold">live</span> now!
              </h2>
              <p className="relative mt-3 text-sm leading-relaxed text-ink-300 sm:text-base">
                Our first client project just shipped to production
                {project.phase ? ` — ${project.phase.toLowerCase()}` : ''}. Go take a look, then
                let's talk about what we can build for you next.
              </p>
            </div>

            <div className="space-y-4 px-8 py-7">
              <ul className="space-y-2.5">
                {[
                  'See the delivered work on our Portfolio',
                  'Explore the services we can bring to your brand',
                  'Discuss your tech stack and get a free consultation',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm text-ink-600 dark:text-ink-200">
                    <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {line}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink-900 dark:bg-gold-400 px-5 py-3 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.03]"
                >
                  View Live Site
                  <FiExternalLink className="h-4 w-4" />
                </a>
                <Link
                  to="/contact"
                  onClick={close}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 transition-colors hover:border-gold-400 hover:text-gold-500 dark:border-ink-700 dark:text-ink-100"
                >
                  Discuss Your Tech Stack
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
