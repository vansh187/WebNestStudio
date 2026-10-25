// A learner's course certificates (GET /api/me/certificates) applied to what the site shows.
// The server's exam view should already say when a course is passed (COURSE_EXAMS_CERTIFICATES.md
// §4: eligibility requires "no valid certificate for the course"). Until the backend fix in
// EXAM_RETAKE_AFTER_PASS_BACKEND.md is live, a valid certificate in the learner's own list is
// also treated as a pass, so a passed course never offers a new exam. Every screen reads the
// exam view through applyMyCertificates (src/lib/myCertificates.js), which calls this, so the
// rule lives in one place. Once the backend fix is verified, withCertificate can be reduced to
// the `already_passed` handling.

// The certificates list from the API, as an array ([] for anything unexpected).
export function certificateItems(data) {
  try {
    if (Array.isArray(data)) return data
    return Array.isArray(data?.items) ? data.items : []
  } catch {
    return []
  }
}

const statusOf = (certificate) => String(certificate?.status ?? '').trim().toLowerCase()

// Only a certificate the server marks `valid` counts. Revoked, pending, expired or missing
// statuses never block the exam or mark a course complete.
export function isValidCertificate(certificate) {
  try {
    return Boolean(certificate?.certificate_id) && statusOf(certificate) === 'valid'
  } catch {
    return false
  }
}

// The learner's valid certificate for a course, or null.
export function validCertificateFor(certificates, courseSlug) {
  try {
    if (!courseSlug) return null
    return certificateItems(certificates).find((item) => item?.course_slug === courseSlug && isValidCertificate(item)) ?? null
  } catch {
    return null
  }
}

// Slugs of the courses the learner holds a valid certificate for.
export function certifiedCourseSlugs(certificates) {
  try {
    return new Set(certificateItems(certificates).filter(isValidCertificate).map((item) => item.course_slug).filter(Boolean))
  } catch {
    return new Set()
  }
}

// Statuses that explicitly end a certificate. Only these override the server's own view of a
// pass: a missing or unfamiliar status (`null`, `issued`...) is not treated as revoked.
const ENDED_STATUSES = new Set(['revoked', 'expired', 'void', 'voided'])

// IDs the learner's list explicitly marks as ended, compared case-insensitively.
function endedIds(certificates) {
  try {
    return new Set(certificateItems(certificates)
      .filter((item) => item?.certificate_id && ENDED_STATUSES.has(statusOf(item)))
      .map((item) => String(item.certificate_id).toUpperCase()))
  } catch {
    return new Set()
  }
}

// The exam view with the learner's certificates applied. Signs of a pass:
// - a valid certificate for this course in the learner's list
// - the server's `certificate_id`, `passed` or `already_passed` reason, unless the learner's
//   list explicitly marks the server's certificate as revoked or expired (a revoked
//   certificate allows a new attempt)
// A passed course is never eligible to start. An attempt the server already started is kept,
// so the learner can still finish it instead of leaving it running unseen.
export function withCertificate(exam, certificates, courseSlug) {
  try {
    if (!exam) return exam
    const listed = validCertificateFor(certificates, courseSlug)
    const ended = endedIds(certificates)
    const serverRevoked = Boolean(exam.certificate_id) && ended.has(String(exam.certificate_id).toUpperCase())
    const serverId = exam.certificate_id && !serverRevoked ? exam.certificate_id : null
    const reasons = Array.isArray(exam.reasons) ? exam.reasons : []
    const serverPassed = !serverRevoked && Boolean(serverId || exam.passed || reasons.includes('already_passed'))
    const passed = Boolean(listed) || serverPassed
    if (!passed) {
      // The server's pass rests on a certificate the learner's list shows as revoked: drop it,
      // so the learner is not stuck on a certificate that no longer counts.
      return serverRevoked
        ? { ...exam, passed: false, certificate_id: null, reasons: reasons.filter((reason) => reason !== 'already_passed') }
        : exam
    }
    return {
      ...exam,
      passed: true,
      eligible: false,
      certificate_id: listed?.certificate_id || serverId || null,
      reasons: reasons.includes('already_passed') ? reasons : [...reasons, 'already_passed'],
    }
  } catch {
    return exam
  }
}

// True when starting an attempt was refused because the course is already passed.
export function isAlreadyPassedError(error) {
  try {
    const data = error?.response?.data
    return data?.code === 'already_passed' || data?.reason === 'already_passed'
  } catch {
    return false
  }
}
