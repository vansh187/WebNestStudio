// Publishes the course catalog (courses, modules, lesson IDs) and each module's exam context
// to the backend, so the server can record lesson completion, check final-exam eligibility
// and generate exam questions (COURSE_EXAMS_CERTIFICATES.md). Lesson pages stay in the site;
// only structure and short summaries are sent. Safe to re-run: modules and lessons are
// matched by `key` (the site's stable ID). The admin "Exam questions" page does the same per
// course with the logged-in admin's session.
//
//   node scripts/sync-learning-catalog.mjs --dry-run
//   node scripts/sync-learning-catalog.mjs --course java-core
//   node scripts/sync-learning-catalog.mjs --contexts exam-contexts.json   (write generator context)
//
// Auth: WNS_ADMIN_TOKEN (an admin access token), or WNS_ADMIN_EMAIL + WNS_ADMIN_PASSWORD.
// API: WNS_API_BASE_URL, else VITE_API_BASE_URL, else production.
import { writeFile } from 'node:fs/promises'
import { SAMPLE_COURSES } from '../src/data/codelabDefaults.js'
import { courseCatalogPayload, courseExamContexts } from '../src/lib/examContext.js'

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const option = (name) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}
const BASE_URL = process.env.WNS_API_BASE_URL || process.env.VITE_API_BASE_URL || 'https://webneststudiobackend-n00h.onrender.com'
const onlyCourse = option('--course')

async function adminToken() {
  if (process.env.WNS_ADMIN_TOKEN) return process.env.WNS_ADMIN_TOKEN
  const email = process.env.WNS_ADMIN_EMAIL
  const password = process.env.WNS_ADMIN_PASSWORD
  if (!email || !password) throw new Error('Set WNS_ADMIN_TOKEN, or WNS_ADMIN_EMAIL and WNS_ADMIN_PASSWORD.')
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new Error(`Login failed: HTTP ${response.status}`)
  return (await response.json()).access_token
}

async function main() {
  const courses = SAMPLE_COURSES
    .map((course, index) => ({ course, index }))
    .filter(({ course }) => !onlyCourse || course.slug === onlyCourse)
  if (!courses.length) throw new Error(`No course with slug "${onlyCourse}".`)

  const contextsFile = option('--contexts')
  if (contextsFile) {
    const contexts = Object.fromEntries(courses.map(({ course }) => [course.slug, courseExamContexts(course.slug)]))
    await writeFile(contextsFile, `${JSON.stringify(contexts, null, 2)}\n`)
    console.log(`Wrote exam generation context for ${courses.length} course(s) to ${contextsFile}`)
    return
  }

  if (flag('--dry-run')) {
    for (const { course } of courses) {
      const payload = courseCatalogPayload(course)
      const lessons = payload.modules.reduce((sum, module) => sum + module.lessons.length, 0)
      console.log(`${payload.slug} (${payload.exam_code}): ${payload.modules.length} modules, ${lessons} lessons`)
    }
    return
  }

  const token = await adminToken()
  let failed = 0
  const put = (path, body) => fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  for (const { course } of courses) {
    // The outline first (the server needs the modules), then the lesson context the exam
    // question generator writes from.
    const outline = await put('/api/admin/learning/courses', courseCatalogPayload(course))
    if (!outline.ok) {
      failed += 1
      console.error(`FAILED ${course.slug}: HTTP ${outline.status} ${(await outline.text()).slice(0, 300)}`)
      continue
    }
    const context = await put(`/api/admin/learning/courses/${course.slug}/exam-context`, { modules: courseExamContexts(course.slug) })
    if (context.ok) {
      const { updated, unchanged } = await context.json()
      console.log(`synced ${course.slug} (context: ${updated} updated, ${unchanged} unchanged)`)
    } else {
      failed += 1
      console.error(`FAILED ${course.slug} context: HTTP ${context.status} ${(await context.text()).slice(0, 300)}`)
    }
  }
  if (failed) process.exitCode = 1
}

main().catch((err) => {
  console.error(err.message)
  process.exitCode = 1
})
