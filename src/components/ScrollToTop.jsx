import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// How long to wait for a lazily loaded page to render the element a #hash points at.
const HASH_TARGET_TIMEOUT_MS = 3000

// React Router does not reset scroll position on navigation. Without this,
// opening a new page while scrolled down on the previous one leaves the
// viewport wherever it was, so every route change looks "broken". A link with a
// #hash (e.g. /disclaimer#affiliate-links) scrolls to that element instead.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return // back/forward: let the browser restore scroll position
    if (!hash) {
      window.scrollTo(0, 0)
      return undefined
    }
    const id = decodeURIComponent(hash.slice(1))
    const deadline = performance.now() + HASH_TARGET_TIMEOUT_MS
    let frame
    const scrollToTarget = () => {
      const target = document.getElementById(id)
      if (target) target.scrollIntoView()
      else if (performance.now() < deadline) frame = requestAnimationFrame(scrollToTarget)
      else window.scrollTo(0, 0)
    }
    scrollToTarget()
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, navigationType])

  return null
}
