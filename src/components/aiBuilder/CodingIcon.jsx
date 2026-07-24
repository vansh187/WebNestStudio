// Full-color illustrated icon: a smiling person typing code on a laptop, used for the
// AI Page Builder chat trigger. Uses its own gradient/shading palette (not currentColor)
// so it reads as a distinct, fancy 3D-style badge rather than a flat outline glyph.
export default function CodingIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cix-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd9b3" />
          <stop offset="100%" stopColor="#f5b880" />
        </linearGradient>
        <linearGradient id="cix-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d2b23" />
          <stop offset="100%" stopColor="#241812" />
        </linearGradient>
        <linearGradient id="cix-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5aa9ff" />
          <stop offset="100%" stopColor="#2f74d9" />
        </linearGradient>
        <linearGradient id="cix-laptop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6e9ef" />
          <stop offset="100%" stopColor="#b7bdc9" />
        </linearGradient>
        <linearGradient id="cix-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c2b45" />
          <stop offset="100%" stopColor="#0d1526" />
        </linearGradient>
        <radialGradient id="cix-glow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#7ee8c7" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7ee8c7" stopOpacity="0" />
        </radialGradient>
        <filter id="cix-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.4" floodColor="#000" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* desk */}
      <rect x="4" y="50" width="56" height="3" rx="1.5" fill="#0d1526" opacity="0.15" />

      <g filter="url(#cix-shadow)">
        {/* body / shirt */}
        <path d="M17 54c1-8 6-13 15-13s14 5 15 13H17Z" fill="url(#cix-shirt)" />
        <path d="M27 41h10l1.5 5.5c-2 1.6-11 1.6-13 0L27 41Z" fill="#ffd9b3" />

        {/* head */}
        <circle cx="32" cy="30" r="9.5" fill="url(#cix-skin)" />
        {/* hair */}
        <path d="M22 27a10 10 0 0 1 20 0c0-3-1-7-4-9-1.3 1.6-3 2.4-5 2.4-.6-1.4-1.7-2.4-3-2.4-4 0-8 4.4-8 9Z" fill="url(#cix-hair)" />
        {/* ears */}
        <circle cx="22.3" cy="30.5" r="1.6" fill="#f5b880" />
        <circle cx="41.7" cy="30.5" r="1.6" fill="#f5b880" />
        {/* smiling face */}
        <circle cx="28.2" cy="29.5" r="1.15" fill="#2a1810" />
        <circle cx="35.8" cy="29.5" r="1.15" fill="#2a1810" />
        <path d="M27.5 33.4c1.6 2 6.4 2 8 0" stroke="#8a4326" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <circle cx="26" cy="32" r="1.4" fill="#ff9d7a" opacity="0.55" />
        <circle cx="38" cy="32" r="1.4" fill="#ff9d7a" opacity="0.55" />

        {/* arms reaching to keyboard */}
        <path d="M20 49c2-3 5-5 7.5-5.5" stroke="#2f74d9" strokeWidth="4.2" strokeLinecap="round" />
        <path d="M44 49c-2-3-5-5-7.5-5.5" stroke="#2f74d9" strokeWidth="4.2" strokeLinecap="round" />
        <circle cx="26.5" cy="48.5" r="2.1" fill="#ffd9b3" />
        <circle cx="37.5" cy="48.5" r="2.1" fill="#ffd9b3" />
      </g>

      {/* laptop */}
      <g filter="url(#cix-shadow)">
        <path d="M14 53.5 16.5 44h31l2.5 9.5H14Z" fill="url(#cix-laptop)" />
        <rect x="19.5" y="30" width="25" height="15.5" rx="1.6" fill="url(#cix-laptop)" />
        <rect x="21.3" y="31.7" width="21.4" height="12" rx="1" fill="url(#cix-screen)" />
        <rect x="21.3" y="31.7" width="21.4" height="12" rx="1" fill="url(#cix-glow)" />
        <text x="32" y="40.2" textAnchor="middle" fontFamily="monospace" fontSize="7" fontWeight="700" fill="#7ee8c7">
          &lt;/&gt;
        </text>
      </g>

      {/* sparkle accents for a bit of flair */}
      <path d="M52 16l1 2.6 2.6 1-2.6 1 -1 2.6-1-2.6-2.6-1 2.6-1L52 16Z" fill="#ffd166" />
      <path d="M11 20l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" fill="#ffd166" opacity="0.9" />
    </svg>
  )
}
