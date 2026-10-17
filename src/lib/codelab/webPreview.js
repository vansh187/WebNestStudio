import { API_BRIDGE_SCRIPT } from './apiBridge.js'

const OUTPUT_LIMIT = 64000

function cap(text) {
  if (text.length <= OUTPUT_LIMIT) return { text, truncated: false }
  return { text: text.slice(0, OUTPUT_LIMIT), truncated: true }
}

function fileContent(files, name, folder = '') {
  const file = Array.isArray(files) ? files.find((item) => item?.name === `${folder}${name}`) : null
  return file?.content ?? ''
}

// `folder` reads index.html, style.css and script.js from a subfolder (the backend
// workspace keeps them in frontend/). `apiBridge` routes fetch('/api/...') to the
// in-browser API (see apiBridge.js).
export function createPreviewHtml(input, { folder = '', apiBridge = false } = {}) {
  // The bridge goes in the head so that scripts written inside index.html are captured too.
  const bridge = `
    <script>
      (() => {
        const send = (type, args) => {
          parent.postMessage({
            source: 'webnest-codelab-preview',
            type,
            args: args.map((value) => {
              try {
                if (typeof value === 'string') return value;
                return JSON.stringify(value);
              } catch {
                return String(value);
              }
            })
          }, '*');
        };
        ['log', 'warn', 'error'].forEach((level) => {
          const original = console[level];
          console[level] = (...args) => {
            send(level, args);
            original.apply(console, args);
          };
        });
        window.addEventListener('error', (event) => {
          send('error', [event.message || 'Runtime error']);
        });
      })();
    </script>
  `

  const files = Array.isArray(input) ? input : null
  const html = files ? fileContent(files, 'index.html', folder) : String(input || '')
  const css = files ? fileContent(files, 'style.css', folder) : ''
  const js = files ? fileContent(files, 'script.js', folder) : ''
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>${css}</style>
    ${bridge}
    ${apiBridge ? `<script>${API_BRIDGE_SCRIPT}</script>` : ''}
  </head>
  <body>
    ${html}
    <script>${js}</script>
  </body>
</html>`
}

export function runWebPreview({ source, files }) {
  const started = performance.now()
  const previewHtml = createPreviewHtml(files || source)
  const { text, truncated } = cap('Preview rendered in the sandbox.')
  return {
    status: 'success',
    stdout: text,
    stderr: '',
    runtime_ms: Math.round(performance.now() - started),
    previewHtml,
    truncated,
    error: null,
  }
}
