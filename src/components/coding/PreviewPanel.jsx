import { useEffect, useState } from 'react'
import { FiExternalLink } from 'react-icons/fi'

export default function PreviewPanel({ previewHtml = '', onConsole, className = '' }) {
  const [key, setKey] = useState(0)

  useEffect(() => {
    setKey((value) => value + 1)
  }, [previewHtml])

  useEffect(() => {
    const onMessage = (event) => {
      const data = event.data
      if (!data || data.source !== 'webnest-codelab-preview') return
      const args = Array.isArray(data.args) ? data.args : []
      onConsole?.({ type: data.type || 'log', text: args.join(' ') })
    }
    try {
      window.addEventListener('message', onMessage)
      return () => window.removeEventListener('message', onMessage)
    } catch {
      return undefined
    }
  }, [onConsole])

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900/40 ${className}`}>
      <div className="flex min-h-11 items-center justify-between border-b border-ink-200 px-4 dark:border-ink-800">
        <h2 className="font-display text-sm font-semibold text-ink-900 dark:text-white">Preview</h2>
        <FiExternalLink className="h-4 w-4 text-ink-400" />
      </div>
      {previewHtml ? (
        <iframe
          key={key}
          title="Webnest CodeLab preview"
          sandbox="allow-scripts"
          srcDoc={previewHtml}
          className="min-h-[320px] flex-1 bg-white"
        />
      ) : (
        <div className="grid min-h-[320px] flex-1 place-items-center p-6 text-center text-sm text-ink-400">
          Run web files to render the sandbox.
        </div>
      )}
    </div>
  )
}
