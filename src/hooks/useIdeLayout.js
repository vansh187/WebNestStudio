import { useCallback, useEffect, useState } from 'react'

// Layout preferences for the backend IDE (explorer drawer, panel side and size).
// Kept per browser; storage can be unavailable, so every read and write is guarded.
const STORAGE_KEY = 'wns-codelab-ide-layout'
const LARGE_QUERY = '(min-width: 1024px)'

export const PANEL_LIMITS = {
  right: { min: 320, max: 900, initial: 460 },
  bottom: { min: 180, max: 700, initial: 300 },
}

const DEFAULTS = { explorerOpen: true, panelOpen: true, panelPosition: 'right', panelSize: { right: PANEL_LIMITS.right.initial, bottom: PANEL_LIMITS.bottom.initial } }

function readLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!saved || typeof saved !== 'object') return DEFAULTS
    return {
      explorerOpen: typeof saved.explorerOpen === 'boolean' ? saved.explorerOpen : DEFAULTS.explorerOpen,
      panelOpen: typeof saved.panelOpen === 'boolean' ? saved.panelOpen : DEFAULTS.panelOpen,
      panelPosition: saved.panelPosition === 'bottom' ? 'bottom' : 'right',
      panelSize: {
        right: Number.isFinite(saved.panelSize?.right) ? saved.panelSize.right : DEFAULTS.panelSize.right,
        bottom: Number.isFinite(saved.panelSize?.bottom) ? saved.panelSize.bottom : DEFAULTS.panelSize.bottom,
      },
    }
  } catch {
    return DEFAULTS
  }
}

export const clampPanel = (position, size) => {
  const { min, max } = PANEL_LIMITS[position] ?? PANEL_LIMITS.right
  return Math.round(Math.min(max, Math.max(min, Number(size) || min)))
}

function useIsLarge() {
  const [large, setLarge] = useState(() => typeof window !== 'undefined' && window.matchMedia(LARGE_QUERY).matches)
  useEffect(() => {
    const query = window.matchMedia(LARGE_QUERY)
    const onChange = (event) => setLarge(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return large
}

export function useIdeLayout() {
  const large = useIsLarge()
  const [layout, setLayout] = useState(readLayout)
  const [maximized, setMaximized] = useState(false)
  // On phones and tablets the drawer covers the editor, so it starts closed there.
  const [mobileExplorer, setMobileExplorer] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    } catch {
      /* Storage blocked: the layout still works for this visit. */
    }
  }, [layout])

  const explorerOpen = large ? layout.explorerOpen : mobileExplorer
  const toggleExplorer = useCallback(() => {
    if (large) setLayout((current) => ({ ...current, explorerOpen: !current.explorerOpen }))
    else setMobileExplorer((open) => !open)
  }, [large])
  const closeMobileExplorer = useCallback(() => setMobileExplorer(false), [])

  const setPanelOpen = useCallback((open) => setLayout((current) => ({ ...current, panelOpen: Boolean(open) })), [])
  const togglePanelPosition = useCallback(() => setLayout((current) => ({ ...current, panelPosition: current.panelPosition === 'right' ? 'bottom' : 'right', panelOpen: true })), [])
  const setPanelSize = useCallback((size) => setLayout((current) => ({
    ...current,
    panelSize: { ...current.panelSize, [current.panelPosition]: clampPanel(current.panelPosition, size) },
  })), [])

  return {
    large,
    explorerOpen,
    toggleExplorer,
    closeMobileExplorer,
    panelOpen: layout.panelOpen,
    setPanelOpen,
    // Small screens always stack the panel under the editor.
    panelPosition: large ? layout.panelPosition : 'bottom',
    togglePanelPosition,
    panelSize: layout.panelSize[large ? layout.panelPosition : 'bottom'],
    setPanelSize,
    maximized,
    setMaximized,
  }
}
