import { FiDownload } from 'react-icons/fi'
import { ANDROID_APP } from '../data/androidApp'

// The one direct link to the APK, shared by the home page and /download-app.
export default function AndroidDownloadButton({ className = '' }) {
  return (
    <a
      href={ANDROID_APP.href}
      download={ANDROID_APP.fileName}
      className={`group inline-flex items-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-gold-500/10 transition-transform hover:scale-105 dark:bg-gold-400 dark:text-ink-950 ${className}`}
    >
      <FiDownload className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
      Download APK
    </a>
  )
}
