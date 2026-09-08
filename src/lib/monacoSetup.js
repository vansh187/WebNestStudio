// Self-hosted Monaco: bundle the editor + its language workers with Vite instead of
// pulling them from the default jsdelivr CDN at runtime (offline-safe, CSP-safe, and
// no flash of a broken editor if the CDN is slow/blocked).
//
// Imported for side effects once, from CodeEditor.jsx. Keep this the only place that
// touches `monaco-editor` directly so the heavy dependency stays in the lazy route chunk.
import * as monaco from 'monaco-editor'
// Subpaths follow monaco-editor's package `exports` map ("./*" -> "./esm/vs/*.js"),
// not the raw esm/vs/... path (that double-nests under Rolldown/Vite 8).
import editorWorker from 'monaco-editor/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/language/typescript/ts.worker?worker'
import { loader } from '@monaco-editor/react'

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === 'json') return new jsonWorker()
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
    if (label === 'typescript' || label === 'javascript') return new tsWorker()
    return new editorWorker()
  },
}

// Tell @monaco-editor/react to use the locally-bundled instance (no CDN request).
loader.config({ monaco })

export default monaco
