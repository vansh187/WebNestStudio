import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiX, FiExternalLink, FiArrowRight } from 'react-icons/fi'
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
            className="relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-gold-400/40 bg-ink-950 shadow-[0_0_0_1px_rgba(212,175,55,0.08),0_30px_60px_-15px_rgba(0,0,0,0.6)]"
          >
            <div className="relative h-52 overflow-hidden sm:h-56">
              <iframe
                src={project.url}
                title={`${project.name} live preview`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
                className="pointer-events-none absolute left-0 top-0 h-[400%] w-[400%] origin-top-left scale-[0.25]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-ink-950/40" />

              <button
                type="button"
                onClick={close}
                aria-label="Close announcement"
                className="group absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-gold-400/40 bg-ink-950/70 text-gold-300/90 shadow-[0_0_0_1px_rgba(212,175,55,0.15),0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 hover:border-gold-400 hover:text-ink-950 hover:shadow-[0_0_18px_rgba(212,175,55,0.45)]"
              >
                <span className="absolute inset-0 scale-0 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 transition-transform duration-300 group-hover:scale-100" />
                <FiX className="relative h-4 w-4" />
              </button>

              <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full bg-ink-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-300 shadow-lg backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                First Project Delivered
              </span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />

            <div className="px-6 pb-6 pt-5">
              <h2 className="font-display text-xl font-bold leading-tight text-white">
                {project.name} is <span className="text-gradient-gold">live</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">
                Our first client project just shipped to production
                {project.phase ? ` — ${project.phase.toLowerCase()}` : ''}. Take a look, then let's
                talk about what we build for you next.
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-300 to-gold-500 px-5 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-500/20 transition-transform hover:scale-[1.02]"
                >
                  View Live Site
                  <FiExternalLink className="h-4 w-4" />
                </a>
                <Link
                  to="/contact"
                  onClick={close}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-400/30 px-5 py-3 text-sm font-semibold text-ink-100 transition-colors hover:border-gold-400/70 hover:text-gold-300"
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
