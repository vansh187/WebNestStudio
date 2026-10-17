import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { SAMPLE_COURSES } from './src/data/codelabDefaults.js'
import { ADSENSE_CLIENT } from './src/lib/seo.js'

// index.html cannot import modules, so the publisher ID is written in here.
const adsenseClient = {
  name: 'adsense-client',
  transformIndexHtml: (html) => html.replaceAll('%ADSENSE_CLIENT%', ADSENSE_CLIENT),
}

// SharedArrayBuffer lets the Python worker pause at a breakpoint while the editor remains
// interactive. Only the playground opened with ?isolate=1 (the Debug button reloads into
// it) is isolated, the same rule as vercel.json: an isolated page blocks cross-origin
// iframes such as lesson videos and embeds in the web preview. Worker scripts need COEP
// too: an isolated page refuses to start a worker served without it.
const isolationHeaders = (req, res, next) => {
  const dest = req.headers['sec-fetch-dest']
  const url = new URL(req.url || '/', 'http://localhost')
  if (url.pathname === '/codelab/playground' && url.searchParams.get('isolate') === '1') {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless')
  } else if (dest === 'worker' || dest === 'sharedworker') {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless')
  }
  next()
}

const codeLabIsolation = {
  name: 'codelab-isolation-headers',
  configureServer(server) {
    server.middlewares.use(isolationHeaders)
  },
  configurePreviewServer(server) {
    server.middlewares.use(isolationHeaders)
  },
}

// Course totals for the landing page, counted the same way as the Learn page
// (CoursesList.jsx) but at build time, so Home doesn't load the course data.
const LEARN_STATS = {
  courses: SAMPLE_COURSES.length,
  lessons: SAMPLE_COURSES.reduce((sum, course) => sum + Number(course.lessons_count || 0), 0),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), adsenseClient, codeLabIsolation],
  define: { __LEARN_STATS__: JSON.stringify(LEARN_STATS) },
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api/java/run': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: () => '/api/run',
        // This bridge is only for trusted local development, never public hosting.
        bypass(req) {
          const host = req.headers.host || ''
          const origin = req.headers.origin
          if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return false
          if (origin && ![`http://${host}`, `https://${host}`].includes(origin)) return false
        },
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Origin was validated above; the upstream call is server-to-server.
            proxyReq.removeHeader('origin')
            proxyReq.removeHeader('authorization')
            proxyReq.removeHeader('cookie')
            // Propagate Stop/disconnect so the Java process is terminated promptly.
            res.on('close', () => { if (!res.writableEnded) proxyReq.destroy() })
          })
        },
      },
    },
  },
  // Preview/production must not silently connect visitors to the developer's JDK.
  preview: { proxy: {} },
})
