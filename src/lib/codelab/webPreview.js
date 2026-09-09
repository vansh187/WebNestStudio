const OUTPUT_LIMIT = 64000

function cap(text) {
  if (text.length <= OUTPUT_LIMIT) return { text, truncated: false }
  return { text: text.slice(0, OUTPUT_LIMIT), truncated: true }
}

function fileContent(files, name) {
  const file = Array.isArray(files) ? files.find((item) => item?.name === name) : null
  return file?.content ?? ''
}

export function createPreviewHtml(input) {
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
  const html = files ? fileContent(files, 'index.html') : String(input || '')
  const css = files ? fileContent(files, 'style.css') : ''
  const js = files ? fileContent(files, 'script.js') : ''
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>${css}</style>
  </head>
  <body>
    ${html}
    ${bridge}
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
