# Bug: a learner who passed a course exam can take it again - Backend Team

**Reported:** a learner completed a course and passed its final exam. The certificate shows on the dashboard, but the exam could be started again. A second pass would create a **duplicate certificate**.

**Contract** (`COURSE_EXAMS_CERTIFICATES.md` §4 and §5):
- Eligibility requires **no valid certificate for the course**.
- `GET /api/learning/courses/{slug}/exam` must return `passed: true` and the valid `certificate_id`, with `reasons` containing `already_passed`.
- Starting an attempt must be refused.
- Certificates have a partial unique index on `(user_id, course_id)`.

## 1. What the frontend now does (shipped with this note)

The site no longer offers the exam once **any** sign of a pass exists. Signs of a pass:
- `passed: true`
- a non-null `certificate_id`
- `reasons` containing `already_passed`
- a valid (not revoked) certificate for the course in `GET /api/me/certificates`

The course page card, the course roadmap and the exam page then show **View certificate** instead of Start or Resume. If the start call is refused with `already_passed`, the exam page reloads and shows the certificate. The dashboard shows certified courses as "Completed · certificate earned".

**This is only a safety net.** The server must still refuse, because anyone can call `POST …/exam/attempts` directly.

## 2. Likely causes (check in this order)

1. **The exam view checks the wrong thing for `passed`.** For example, it reads `passed` from the *latest* attempt (a later failed or lost attempt hides the pass), or looks up the certificate by `attempt_id` instead of `(user_id, course_id)`.
2. **The eligibility check in `POST /exam/attempts` doesn't look at certificates**, only at lessons, cooldown and active attempt.
3. **Certificate status:** a certificate saved with a status other than `valid` (or `NULL`) is skipped by `WHERE status = 'valid'`.
4. **The partial unique index is missing** (migration not applied), so concurrent or repeated passes insert a second certificate.
5. **Course ID mismatch:** the certificate was issued with a different `course_id` than the exam view looks up. This can happen after `scripts/sync-learning-catalog.mjs` recreated or duplicated a course row.

## 3. Find affected data (run read-only first)

```sql
-- Learners with more than one valid certificate for the same course (duplicates).
SELECT user_id, course_id, COUNT(*) AS valid_certs,
       array_agg(certificate_id ORDER BY issued_at) AS ids
FROM certificates
WHERE status = 'valid'
GROUP BY user_id, course_id
HAVING COUNT(*) > 1;

-- Attempts started after the learner already held a valid certificate for that course.
SELECT a.user_id, a.course_id, a.attempt_id, a.started_at, c.certificate_id, c.issued_at
FROM exam_attempts a
JOIN certificates c ON c.user_id = a.user_id AND c.course_id = a.course_id AND c.status = 'valid'
WHERE a.started_at > c.issued_at
ORDER BY a.started_at DESC;

-- Is the partial unique index there?
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'certificates';
-- expected: a UNIQUE index on (user_id, course_id) WHERE status = 'valid'

-- Statuses actually stored.
SELECT status, COUNT(*) FROM certificates GROUP BY status;
```

Use the real table and column names if yours differ. Share the counts (not user data) in the issue.

## 4. Fixes (all required)

1. **Exam view** (`GET /api/learning/courses/{slug}/exam`): look up `certificates WHERE user_id = :me AND course_id = :course AND status = 'valid'`.
   - If found: `passed: true`, `certificate_id` = that ID, `eligible: false`, `reasons` includes `already_passed`, `active_attempt_id: null`, regardless of later attempts.
   - Otherwise: `passed: false`, `certificate_id: null`.
2. **Start** (`POST /api/learning/courses/{slug}/exam/attempts`): run the same lookup **first**. If found, return `409 { "detail": "You have already passed this exam.", "code": "not_eligible", "reason": "already_passed" }` and create nothing.
3. **Issuing:** in the grading transaction, insert the certificate with `ON CONFLICT ON CONSTRAINT <partial unique> DO NOTHING`, then read back the existing valid certificate. A second pass must never create a second certificate; return the existing `certificate_id` in the result.
4. **Index** (migration, if missing):
   ```sql
   CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS certificates_one_valid_per_course
     ON certificates (user_id, course_id) WHERE status = 'valid';
   ```
   This fails while duplicates exist, so clean up first (step 5).
5. **Clean up existing duplicates:** keep the **earliest** valid certificate per `(user_id, course_id)`. Mark the others `status = 'revoked'`, `revoked_reason = 'duplicate of <kept id>'`, so their verification pages still answer (`status: "revoked"`) rather than 404. Do this in one transaction, after a backup, and log the count.
6. **Course ID check:** if cause 5 applies, merge duplicate course rows and re-point certificates and attempts to the kept course.

Code rules as for the other CodeLab work:
- the certificate lookup is **one shared service method** used by both the exam view and start, not two copies
- no `@staticmethod`
- every function body has `try/except` that logs with context (user id, course id; never names or emails) and re-raises a domain error

## 5. Tests to add (pytest)
- A passed learner: the exam view returns `passed: true`, `eligible: false`, `already_passed`, and the certificate ID, **even with a later failed or lost attempt**.
- A passed learner: start returns `409 not_eligible / already_passed` and creates no attempt.
- Submitting a second passing attempt (forced in the test) returns the **existing** certificate ID, and the table still has one valid row.
- Two concurrent submits of passing attempts produce one valid certificate.
- A revoked certificate makes the learner eligible again (contract §4).
- `GET /api/me/certificates` lists one valid certificate per course.

## 6. Done when
- [ ] Section 3 queries run; counts shared
- [ ] Fixes 1-3 deployed; index in place; duplicates cleaned (revoked, not deleted)
- [ ] Section 5 tests green
- [ ] Re-test with the reporting account: the course page shows **View certificate**, the exam page says "already passed", and a direct `POST …/exam/attempts` returns 409
