import { useReducedMotion } from 'framer-motion'

// Decorative looping background for a dark hero section. `base` is the path of the
// files without their extension, e.g. "/media/services-hero", which expects
// base.webm, base-mobile.webm and base-poster.webp. Only WebM is shipped; a browser
// that cannot play it keeps showing the poster.
// Without `base`, only the animated gold glow is shown.
// `children` is an optional code-drawn backdrop (e.g. NeuralBackdrop), placed on top
// of the dark overlay.
export default function HeroVideo({ base, children }) {
  const reduced = useReducedMotion()
  const saveData = typeof navigator !== 'undefined' && navigator.connection?.saveData
  const poster = base ? `${base}-poster.webp` : undefined

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-glow hero-glow-a" />
      <div className="hero-glow hero-glow-b" />
      {base && (reduced || saveData ? (
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={`${base}-mobile.webm`} type="video/webm" media="(max-width: 767px)" />
          <source src={`${base}.webm`} type="video/webm" />
        </video>
      ))}
      {/* Keeps the centre dark so the headline stays readable over any footage. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,8,12,0.78)_0%,rgba(8,8,12,0.45)_55%,rgba(8,8,12,0.75)_100%)]" />
      {children}
    </div>
  )
}
