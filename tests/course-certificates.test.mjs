import test from 'node:test'
import assert from 'node:assert/strict'
import {
  certificateItems, certifiedCourseSlugs, isAlreadyPassedError, isValidCertificate, validCertificateFor, withCertificate,
} from '../src/lib/courseCertificates.js'

const CERTS = {
  items: [
    { certificate_id: 'WNS-JAVA-2026-7KQ4M2XP', course_slug: 'java-core', status: 'valid' },
    { certificate_id: 'WNS-PY-2026-AAAA1111', course_slug: 'python', status: 'revoked' },
  ],
}
const OPEN = { enabled: true, eligible: true, reasons: [], passed: false, certificate_id: null, active_attempt_id: null, lessons_remaining: 0 }

test('certificate lists are read defensively', () => {
  assert.equal(certificateItems(CERTS).length, 2)
  assert.equal(certificateItems(CERTS.items).length, 2)
  assert.deepEqual(certificateItems(null), [])
  assert.deepEqual(certificateItems({ items: 'nope' }), [])
})

test('only certificates marked valid count (case-insensitive); anything else never blocks', () => {
  assert.equal(isValidCertificate({ certificate_id: 'A', status: 'valid' }), true)
  assert.equal(isValidCertificate({ certificate_id: 'A', status: 'VALID' }), true)
  for (const status of ['revoked', 'Revoked', 'pending', 'expired', 'invalid', undefined, null, '']) {
    assert.equal(isValidCertificate({ certificate_id: 'A', status }), false, String(status))
  }
  assert.equal(isValidCertificate({ status: 'valid' }), false, 'no ID')
  assert.equal(validCertificateFor(CERTS, 'java-core').certificate_id, 'WNS-JAVA-2026-7KQ4M2XP')
  assert.equal(validCertificateFor(CERTS, 'python'), null)
  assert.equal(validCertificateFor(CERTS, 'react'), null)
  assert.deepEqual([...certifiedCourseSlugs(CERTS)], ['java-core'])
})

test('a valid certificate closes the exam even when the exam view says eligible', () => {
  const exam = withCertificate(OPEN, CERTS, 'java-core')
  assert.equal(exam.passed, true)
  assert.equal(exam.eligible, false)
  assert.equal(exam.certificate_id, 'WNS-JAVA-2026-7KQ4M2XP')
  assert.ok(exam.reasons.includes('already_passed'))
})

test('server signs of a pass close the exam', () => {
  assert.equal(withCertificate({ ...OPEN, passed: true }, null, 'x').eligible, false)
  assert.equal(withCertificate({ ...OPEN, passed: true, certificate_id: 'WNS-X' }, null, 'x').certificate_id, 'WNS-X')
  assert.equal(withCertificate({ ...OPEN, certificate_id: 'WNS-X' }, null, 'x').passed, true)
  assert.equal(withCertificate({ ...OPEN, reasons: ['already_passed'] }, null, 'x').passed, true)
})

test('a certificate the learner list says is revoked never blocks a retake', () => {
  const revokedId = 'WNS-PY-2026-AAAA1111'
  const fromServer = withCertificate({ ...OPEN, passed: true, certificate_id: revokedId }, CERTS, 'python')
  assert.equal(fromServer.passed, false)
  assert.equal(fromServer.eligible, true)
  assert.equal(fromServer.certificate_id, null)
  // Same, with a different case in the ID.
  assert.equal(withCertificate({ ...OPEN, certificate_id: revokedId.toLowerCase() }, CERTS, 'python').passed, false)
})

test('an unknown or missing status never cancels a pass the server reported', () => {
  for (const status of [null, undefined, 'issued', 'pending']) {
    const list = { items: [{ certificate_id: 'WNS-JAVA-2026-NULLSTAT', course_slug: 'java-core', status }] }
    const exam = withCertificate({ ...OPEN, passed: true, certificate_id: 'WNS-JAVA-2026-NULLSTAT' }, list, 'java-core')
    assert.equal(exam.passed, true, String(status))
    assert.equal(exam.certificate_id, 'WNS-JAVA-2026-NULLSTAT', String(status))
    assert.equal(exam.eligible, false, String(status))
  }
})

test('already_passed resting on a revoked certificate does not block a retake', () => {
  const list = { items: [{ certificate_id: 'WNS-PY-2026-AAAA1111', course_slug: 'python', status: 'revoked' }] }
  const exam = withCertificate({ ...OPEN, eligible: true, passed: true, certificate_id: 'WNS-PY-2026-AAAA1111', reasons: ['already_passed'] }, list, 'python')
  assert.equal(exam.passed, false)
  assert.equal(exam.certificate_id, null)
  assert.ok(!exam.reasons.includes('already_passed'))
  // Expired counts as ended too.
  const expired = { items: [{ certificate_id: 'WNS-X', course_slug: 'python', status: 'Expired' }] }
  assert.equal(withCertificate({ ...OPEN, passed: true, certificate_id: 'WNS-X' }, expired, 'python').passed, false)
})

test('an attempt the server already started is kept so it can be finished', () => {
  const exam = withCertificate({ ...OPEN, passed: true, certificate_id: 'WNS-X', active_attempt_id: 'a1' }, null, 'x')
  assert.equal(exam.passed, true)
  assert.equal(exam.active_attempt_id, 'a1')
})

test('an open exam without a valid certificate is left alone', () => {
  assert.equal(withCertificate(OPEN, CERTS, 'python'), OPEN)
  assert.equal(withCertificate(OPEN, null, 'java-core'), OPEN)
  assert.equal(withCertificate(null, CERTS, 'java-core'), null)
})

test('the start refusal for an already passed course is recognised', () => {
  assert.equal(isAlreadyPassedError({ response: { status: 409, data: { code: 'not_eligible', reason: 'already_passed' } } }), true)
  assert.equal(isAlreadyPassedError({ response: { status: 409, data: { code: 'already_passed' } } }), true)
  assert.equal(isAlreadyPassedError({ response: { status: 409, data: { code: 'not_eligible', reason: 'cooldown' } } }), false)
  assert.equal(isAlreadyPassedError(null), false)
})
