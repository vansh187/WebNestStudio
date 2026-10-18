import { useEffect } from 'react'

// Page behaviour shared by the coding workspaces (CodingWorkspace and the backend IDE).

// While an IDE is on screen, hide the site's floating chat and theme buttons (see index.css;
// the IDE toolbars have their own theme button), and on large screens bring the IDE into view
// under the navbar. Pass `scroll: false` when content above the IDE must stay readable, and
// `enabled: false` while the component shows something else (it runs again when re-enabled).
export function useIdeFocus(ref, { scroll = true, enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return undefined
    const root = document.documentElement
    root.dataset.ideFocus = ''
    if (scroll && window.matchMedia('(min-width: 1024px)').matches) {
      try {
        ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
      } catch {
        /* Older browsers without smooth scrolling options: leave the page where it is. */
      }
    }
    return () => { delete root.dataset.ideFocus }
  }, [ref, scroll, enabled])
}

// Full screen covers the page: lock the page scroll and let Escape leave it. Escape is left
// alone when something else used it (the editor closing a widget stops it) or when it was
// typed in a form field, such as a file rename box or a select.
export function useFullscreen(maximized, setMaximized) {
  useEffect(() => {
    if (!maximized) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('input, select, textarea, [contenteditable="true"]') && !target.closest('.monaco-editor')) return
      setMaximized(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [maximized, setMaximized])
}
