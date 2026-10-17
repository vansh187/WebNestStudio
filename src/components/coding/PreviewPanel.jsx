import { useEffect, useRef, useState } from 'react'
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi'
import { toBridgeReply, toRuntimeRequest } from '../../lib/codelab/apiBridge'

// `onApiRequest(spec)` answers fetch('/api/...') calls from the preview (backend
// workspace only; see lib/codelab/apiBridge.js).
export default function PreviewPanel({ previewHtml = '', onConsole, onApiRequest, emptyText = 'Run web files to render the sandbox.', className = '' }) {
  const [key, setKey] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    setKey((value) => value + 1)
  }, [previewHtml])

  useEffect(() => {
    const onMessage = (event) => {
      const data = event.data
      if (!data) return
      if (data.source === 'webnest-codelab-preview') {
        const args = Array.isArray(data.args) ? data.args : []
        onConsole?.({ type: data.type || 'log', text: args.join(' ') })
        return
      }
      // Only the iframe this panel rendered may call the API.
      if (!onApiRequest || event.source !== frameRef.current?.contentWindow) return
      const request = toRuntimeRequest(data)
      if (!request) return
      const target = event.source
      // The iframe may have been reloaded or removed while the request ran.
      const reply = (response) => {
        try {
          target.postMessage(toBridgeReply(request.id, response), '*')
        } catch (error) {
          console.warn('The preview closed before the API replied:', error)
        }
      }
      Promise.resolve()
        .then(() => onApiRequest(request.spec))
        .then((response) => {
          onConsole?.({ type: 'api', text: `${request.spec.method} ${request.spec.path} → ${response?.status || 'failed'}${typeof response?.ms === 'number' ? ` (${Math.round(response.ms)} ms)` : ''}` })
          reply(response)
        })
        .catch((error) => reply({ status: 0, error: error?.message || 'The API request failed.' }))
    }
    try {
      window.addEventListener('message', onMessage)
      return () => window.removeEventListener('message', onMessage)
    } catch {
      return undefined
    }
  }, [onConsole, onApiRequest])

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900/40 ${className}`}>
      <div className="flex min-h-11 items-center justify-between border-b border-ink-200 px-4 dark:border-ink-800">
        <h2 className="font-display text-sm font-semibold text-ink-900 dark:text-white">Preview</h2>
        {previewHtml && onApiRequest ? (
          <button type="button" onClick={() => setKey((value) => value + 1)} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-gold-600" aria-label="Reload preview">
            <FiRefreshCw className="h-3.5 w-3.5" /> Reload
          </button>
        ) : (
          <FiExternalLink className="h-4 w-4 text-ink-400" />
        )}
      </div>
      {previewHtml ? (
        <iframe
          ref={frameRef}
          key={key}
          title="Webnest CodeLab preview"
          sandbox="allow-scripts allow-forms"
          srcDoc={previewHtml}
          className="min-h-[320px] flex-1 bg-white"
        />
      ) : (
        <div className="grid min-h-[320px] flex-1 place-items-center p-6 text-center text-sm text-ink-400">
          {emptyText}
        </div>
      )}
    </div>
  )
}
