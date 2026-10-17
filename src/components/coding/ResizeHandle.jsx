import { useRef } from 'react'

// Drag (or arrow keys) to resize the panel next to it. `position` is where the panel
// sits: 'right' resizes its width, 'bottom' its height. Sizes are measured from the
// container's far edge, so the panel keeps its size when the window changes.
export default function ResizeHandle({ position, size, onResize, onReset, containerRef, label = 'Resize panel' }) {
  const dragging = useRef(false)
  const vertical = position === 'right'

  const sizeAt = (event) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return size
    return vertical ? rect.right - event.clientX : rect.bottom - event.clientY
  }

  const onPointerDown = (event) => {
    if (event.button !== 0) return
    event.preventDefault()
    dragging.current = true
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* Capture is a nicety: without it the drag still works while the pointer stays on the handle. */
    }
    document.body.style.cursor = vertical ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }

  const stop = (event) => {
    if (!dragging.current) return
    dragging.current = false
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* Already released. */
    }
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const onKeyDown = (event) => {
    const step = event.shiftKey ? 96 : 24
    const grow = vertical ? 'ArrowLeft' : 'ArrowUp'
    const shrink = vertical ? 'ArrowRight' : 'ArrowDown'
    if (event.key === grow) onResize(size + step)
    else if (event.key === shrink) onResize(size - step)
    else if (event.key === 'Home' || event.key === 'Enter') onReset?.()
    else return
    event.preventDefault()
  }

  return (
    <div
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      aria-label={label}
      aria-valuenow={Math.round(size)}
      tabIndex={0}
      title="Drag to resize · double-click to reset"
      onPointerDown={onPointerDown}
      onPointerMove={(event) => { if (dragging.current) onResize(sizeAt(event)) }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onDoubleClick={() => onReset?.()}
      onKeyDown={onKeyDown}
      className={`group relative z-10 shrink-0 bg-ink-200 outline-none transition-colors hover:bg-gold-400 focus-visible:bg-gold-500 dark:bg-ink-800 ${
        vertical ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
      }`}
    >
      {/* A wider invisible hit area than the 4px line. */}
      <span className={`absolute ${vertical ? '-inset-x-1.5 inset-y-0' : '-inset-y-1.5 inset-x-0'}`} aria-hidden="true" />
    </div>
  )
}
