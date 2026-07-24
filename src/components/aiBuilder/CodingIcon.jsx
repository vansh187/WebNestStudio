// Custom icon: a person sitting at a laptop, coding — used for the AI Page Builder
// chat trigger since no stock icon in react-icons/fi matches this concept.
export default function CodingIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="24" cy="10" r="5" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M14 24c1.5-4 6-6 10-6s8.5 2 10 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M12 30h24l-2.5 8h-19L12 30Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <rect x="17" y="24" width="14" height="7" rx="1.2" stroke="currentColor" strokeWidth="2.2" />
      <path d="M20.5 26.3 19 27.6l1.5 1.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27.5 26.3 29 27.6l-1.5 1.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
