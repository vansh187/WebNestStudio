import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// React Router does not reset scroll position on navigation. Without this,
// opening a new page while scrolled down on the previous one leaves the
// viewport wherever it was, so every route change looks "broken".
export default function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return // back/forward: let the browser restore scroll position
    window.scrollTo(0, 0)
  }, [pathname, navigationType])

  return null
}
