import { FiDownload } from 'react-icons/fi'

function downloadHtml(htmlString, filename = 'webnest-ai-page.html') {
  const blob = new Blob([htmlString], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function DownloadBar({ html, disabled }) {
  if (!html) return null
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => downloadHtml(html)}
      className="inline-flex items-center gap-2 rounded-lg bg-ink-900 dark:bg-gold-400 px-3.5 py-2 text-xs font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <FiDownload className="h-3.5 w-3.5" /> Download HTML
    </button>
  )
}
