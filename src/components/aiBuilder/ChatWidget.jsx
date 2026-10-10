import { Suspense, useEffect, useRef, useState } from 'react'
import { lazyWithReload } from '../../lib/chunkReload'
import { AnimatePresence, motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import CodingIcon from './CodingIcon'

// Deferred until the user actually opens the panel - pulls in its own markdown
// rendering and generation UI, which shouldn't load on every page for every visitor.
const ChatPanel = lazyWithReload(() => import('./ChatPanel'))

const NOTIFICATION_TEXT = "Hi, I'm WebNestAi. Need a Website, Mobile App, or AI Solutions? Tell us your requirement — I'll handle the rest."

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const constraintsRef = useRef(null)

  // A drag gesture that ends under the pointer also fires a native click right
  // after - without this guard, dragging the button would reopen/close the panel
  // as an unwanted side effect of releasing the mouse.
  const wasDraggedRef = useRef(false)

  // The greeting waits for a real visitor to interact. Crawlers and prerender
  // snapshots never do, so the line doesn't become body text on every page.
  useEffect(() => {
    if (window.__PRERENDER__) return
    const events = ['pointermove', 'scroll', 'touchstart', 'keydown']
    let timer
    const arm = () => {
      events.forEach((e) => window.removeEventListener(e, arm))
      timer = setTimeout(() => setShowBubble(true), 2000)
    }
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }))
    return () => {
      events.forEach((e) => window.removeEventListener(e, arm))
      clearTimeout(timer)
    }
  }, [])

  const openPanel = () => {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false
      return
    }
    setOpen(true)
    setShowBubble(false)
  }

  return (
    <>
      {/* Full-viewport drag boundary - itself non-interactive so it never blocks
          clicks on the page underneath; the draggable widget opts back into
          pointer events. */}
      <div ref={constraintsRef} className="fixed inset-0 z-[90] pointer-events-none">
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragMomentum={false}
          dragElastic={0}
          onDragEnd={() => { wasDraggedRef.current = true }}
          className="pointer-events-auto absolute bottom-6 right-6 flex flex-col items-end gap-3"
        >
          <AnimatePresence>
            {showBubble && !open && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="relative max-w-[220px] rounded-2xl rounded-br-sm border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-3 text-sm text-ink-700 dark:text-ink-200 shadow-xl"
              >
                <button
                  type="button"
                  onClick={() => setShowBubble(false)}
                  aria-label="Dismiss"
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 text-white dark:bg-gold-400 dark:text-ink-950"
                >
                  <FiX className="h-3 w-3" />
                </button>
                {NOTIFICATION_TEXT}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={openPanel}
            aria-label="Open WebNestAi chat"
            whileHover={{ scale: 1.08, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-16 w-16 cursor-grab items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-ink-950 shadow-xl shadow-gold-500/40 ring-4 ring-white/40 active:cursor-grabbing dark:ring-ink-950/40"
          >
            <CodingIcon className="h-11 w-11" />
          </motion.button>
        </motion.div>
      </div>

      {open && (
        <Suspense fallback={null}>
          <ChatPanel onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
