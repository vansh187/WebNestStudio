// The logged-in learner's certificates (GET /api/me/certificates), fetched once and shared by
// the course page, the exam page and the dashboard instead of once per screen. Cached per
// user for a short time; a new pass, a "Try again" or a different user fetches afresh.
import { bulkUpdateProgress, getCourseExam, listMyCertificates } from '../api/learning'
import { certificateItems, withCertificate } from './courseCertificates'
import { syncLocalProgress } from './learningProgress'

const TTL_MS = 60000
let cached = null // { userKey, at, promise }

// The learner's certificates as an array, or null when they could not be loaded (callers
// then rely on the server's exam view alone). `force` skips the cache.
export async function loadMyCertificates(userKey, { force = false } = {}) {
  try {
    if (!userKey) return null
    const fresh = cached && cached.userKey === userKey && Date.now() - cached.at < TTL_MS
    if (!force && fresh) return await cached.promise
    const promise = listMyCertificates().then(certificateItems)
    cached = { userKey, at: Date.now(), promise }
    // A failed load is not kept, so the next screen tries again.
    promise.catch(() => { if (cached?.promise === promise) cached = null })
    return await promise
  } catch {
    return null
  }
}

// Forget the cached list, e.g. after a pass issued a new certificate.
export function forgetMyCertificates() {
  try {
    cached = null
  } catch {
    /* nothing cached */
  }
}

// The exam view with the learner's certificates applied (see courseCertificates.js).
export async function applyMyCertificates(exam, courseSlug, { userKey, isAuthenticated, force = false } = {}) {
  try {
    if (!exam || !isAuthenticated) return exam
    const certificates = await loadMyCertificates(userKey, { force })
    return withCertificate(exam, certificates, courseSlug)
  } catch {
    return exam
  }
}

// Everything a screen needs to show a course's final exam, in one place so every screen
// applies the same rules: lessons completed in this browser are sent first (so eligibility
// counts them), then the exam view and the learner's certificates load together and are
// combined. Resolves { exam, syncFailed, notFound }: `notFound` when the server doesn't know
// the course (exam null). Other errors reject, so each screen keeps its own error handling.
export async function loadExamView(courseSlug, { userKey, isAuthenticated, force = false } = {}) {
  const synced = isAuthenticated ? await syncLocalProgress(userKey, bulkUpdateProgress) : true
  const [view, certificates] = await Promise.all([
    getCourseExam(courseSlug).catch((error) => {
      if (error?.response?.status === 404) return null
      throw error
    }),
    isAuthenticated ? loadMyCertificates(userKey, { force }) : null,
  ])
  if (!view) return { exam: null, syncFailed: !synced, notFound: true }
  let exam = view
  try {
    exam = withCertificate(view, certificates, courseSlug)
  } catch {
    exam = view
  }
  return { exam, syncFailed: !synced, notFound: false }
}
