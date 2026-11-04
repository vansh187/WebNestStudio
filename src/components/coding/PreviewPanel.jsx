import { useEffect, useRef, useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import { toBridgeReply, toRuntimeRequest } from '../../lib/codelab/apiBridge'
import { useFullscreen } from '../../hooks/useIdeShell'
import { FullscreenButton } from './IdeButtons'

// `onApiRequest(spec)` answers fetch('/api/...') calls from the preview (backend
// workspace only; see lib/codelab/apiBridge.js). `openRequest`: a count; each increase opens
// the preview in full screen. `onDebug(batch)` receives the Web debugger's recorded steps.
export default function PreviewPanel({ previewHtml = '', onConsole, onApiRequest, onDebug, emptyText = 'Run web files to render the sandbox.', className = '', openRequest = 0 }) {
  const [key, setKey] = useState(0)
  const frameRef = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [seenRequest, setSeenRequest] = useState(openRequest)
  if (openRequest !== seenRequest) {
    setSeenRequest(openRequest)
    setExpanded(true)
  }
  useFullscreen(expanded, setExpanded)

  useEffect(() => {
    setKey((value) => value + 1)
  }, [previewHtml])

  useEffect(() => {
    const onMessage = (event) => {
      const data = event.data
      if (!data) return
      if (data.source === 'webnest-codelab-preview') {
        // Only this panel's iframe: another window must not write to the console, which the
        // AI assistant reads as the page's errors.
        if (event.source !== frameRef.current?.contentWindow) return
        if (data.type === 'wn-debug') {
          if (data.batch && typeof data.batch === 'object') onDebug?.(data.batch)
          return
        }
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
  }, [onConsole, onApiRequest, onDebug])

  return (
    // Only the classes change, so going full screen does not reload the page inside.
    <div className={expanded
      ? 'fixed inset-0 z-[80] flex flex-col overflow-hidden bg-white dark:bg-ink-950'
      : `flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900/40 ${className}`}
    >
      <div className="flex min-h-11 items-center justify-between border-b border-ink-200 px-4 dark:border-ink-800">
        <h2 className="font-display text-sm font-semibold text-ink-900 dark:text-white">Preview</h2>
        <div className="flex items-center gap-3">
          {previewHtml && onApiRequest && (
            <button type="button" onClick={() => setKey((value) => value + 1)} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-gold-600" aria-label="Reload preview">
              <FiRefreshCw className="h-3.5 w-3.5" /> Reload
            </button>
          )}
          {expanded && <button type="button" onClick={() => setExpanded(false)} className="text-xs font-semibold text-ink-700 hover:text-gold-600 dark:text-ink-200">Back to code</button>}
          {previewHtml && <FullscreenButton maximized={expanded} onToggle={() => setExpanded(!expanded)} className="inline-flex text-ink-500 hover:text-gold-600 dark:text-ink-300" />}
        </div>
      </div>
      {previewHtml ? (
        <iframe
          ref={frameRef}
          key={key}
          title="Webnest CodeLab preview"
          sandbox="allow-scripts allow-forms"
          srcDoc={previewHtml}
          className="min-h-[320px] flex-1 bg-white lg:min-h-0"
        />
      ) : (
        <div className="grid min-h-[320px] flex-1 place-items-center lg:min-h-0 p-6 text-center text-sm text-ink-400">
          {emptyText}
        </div>
      )}
    </div>
  )
}
