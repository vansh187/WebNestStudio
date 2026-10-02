import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

const GOLD = '230, 172, 62'
const LINK_DISTANCE = 180

// Where the network is faded so text stays clean: behind a centred headline, or on the
// left when the text sits in the left column.
const FADES = {
  center: '[mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,0.12)_20%,black_75%)]',
  left: '[mask-image:linear-gradient(to_right,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.1)_42%,black_78%)]',
}

// Decorative "neural network" for a dark hero: drifting gold nodes joined by faint
// lines, with signals travelling along the links. Drawn on a canvas, so it needs no
// video file. A mask fades it out behind the text (see FADES). Stops when off screen
// and stays still for reduced-motion visitors.
export default function NeuralBackdrop({ fade = 'center' }) {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return undefined

    let width = 0
    let height = 0
    let nodes = []
    let signals = []
    let frame = 0
    let visible = true

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      // Roughly one node per 9,000 px², capped so large screens stay smooth.
      const count = Math.min(130, Math.max(30, Math.round((width * height) / 9000)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1.2 + Math.random() * 2,
      }))
      signals = []
    }

    const draw = (move) => {
      ctx.clearRect(0, 0, width, height)
      const links = []
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i]
        if (move) {
          a.x += a.vx
          a.y += a.vy
          if (a.x < 0 || a.x > width) a.vx *= -1
          if (a.y < 0 || a.y > height) a.vy *= -1
        }
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j]
          const distance = Math.hypot(a.x - b.x, a.y - b.y)
          if (distance < LINK_DISTANCE) {
            links.push([a, b])
            ctx.strokeStyle = `rgba(${GOLD}, ${0.5 * (1 - distance / LINK_DISTANCE)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      for (const node of nodes) {
        ctx.fillStyle = `rgba(${GOLD}, 0.95)`
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!move) return
      // A signal is a bright dot that runs from one node to a linked one.
      if (links.length && signals.length < 14 && Math.random() < 0.12) {
        const [from, to] = links[Math.floor(Math.random() * links.length)]
        signals.push({ from, to, t: 0 })
      }
      signals = signals.filter((signal) => signal.t < 1)
      for (const signal of signals) {
        signal.t += 0.018
        const x = signal.from.x + (signal.to.x - signal.from.x) * signal.t
        const y = signal.from.y + (signal.to.y - signal.from.y) * signal.t
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 9)
        glow.addColorStop(0, `rgba(255, 236, 190, 0.95)`)
        glow.addColorStop(1, `rgba(${GOLD}, 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, 9, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = () => {
      if (visible) draw(true)
      frame = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    observer.observe(canvas)
    if (reduced) draw(false)
    else frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${FADES[fade] || FADES.center}`} />
}
