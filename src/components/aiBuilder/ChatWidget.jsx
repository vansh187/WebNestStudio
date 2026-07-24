import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import CodingIcon from './CodingIcon'
import ChatPanel from './ChatPanel'

const NOTIFICATION_TEXT = 'Design the static page of your website with WebNest Studio'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const openPanel = () => {
    setOpen(true)
    setShowBubble(false)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
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
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-ink-950 shadow-xl shadow-gold-500/40 ring-4 ring-white/40 dark:ring-ink-950/40"
        >
          <CodingIcon className="h-11 w-11" />
        </motion.button>
      </div>

      {open && <ChatPanel onClose={() => setOpen(false)} />}
    </>
  )
}
