import { FaGooglePlay } from 'react-icons/fa'
import { ANDROID_APP } from '../data/androidApp'

// The one link to the app's Google Play listing, shared by the home page and /download-app.
export default function AndroidDownloadButton({ className = '' }) {
  return (
    <a
      href={ANDROID_APP.playStoreHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-gold-500/10 transition-transform hover:scale-105 dark:bg-gold-400 dark:text-ink-950 ${className}`}
    >
      <FaGooglePlay className="h-4 w-4" />
      Get it on Google Play
    </a>
  )
}
