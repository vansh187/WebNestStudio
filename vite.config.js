import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { SAMPLE_COURSES } from './src/data/codelabDefaults.js'

// Course totals for the landing page, counted the same way as the Learn page
// (CoursesList.jsx) but at build time, so Home doesn't load the course data.
const LEARN_STATS = {
  courses: SAMPLE_COURSES.length,
  lessons: SAMPLE_COURSES.reduce((sum, course) => sum + Number(course.lessons_count || 0), 0),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
