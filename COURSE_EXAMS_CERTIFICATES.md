# Course final exams and certificates — backend contract

The frontend for this feature is built and live behind the server: nothing appears to learners
until `GET /api/learning/courses/{slug}/exam` returns `"enabled": true` for a course. This
document is what the FastAPI backend must implement. All paths are under the existing API host.

## What the feature does

Every course ends with a final exam: **30 single-answer multiple-choice questions, 60 minutes,
pass at 70% (21/30)**. A learner can take it once they are logged in and have completed every
lesson of the course. Passing issues a certificate with a unique ID that anyone can verify at
`https://www.webneststudio.co.in/certificates/{certificate_id}`. Failing means waiting 24 hours,
then retaking with newly drawn questions.

**Rule zero:** correct answers never leave the server in learner or public responses, and the
browser never decides score, time or pass. The client is untrusted.

## 1. Catalog and lesson keys

The site owns course content. `scripts/sync-learning-catalog.mjs` publishes the structure with
the existing `PUT /api/admin/learning/courses`, adding two fields the server must store:

| Field | On | Meaning |
|---|---|---|
| `key` | module, lesson | The site's stable ID, e.g. `mod_java_core_java_basics`, `lesson_java_core_history_and_features_of_java`. Unique within a course. Upserts match modules and lessons by `key` (create if new, update title/order, archive keys no longer sent). |
| `exam_code` | course | Short code for certificate IDs: `JAVA`, `ADVJAVA`, `SPRING`, `BOOT`, `PY`, `HTML`, `CSS`, `JS`, `REACT`, `SQL`, `PG`, `DBDESIGN`. |

**Every `{lesson_id}` in `/api/learning/...` routes must accept the lesson `key`** (and keep
accepting the UUID). The site only knows keys.

Note: some lesson keys appear in two courses' outlines through aliases; treat lessons per course.

## 2. Lesson progress (server copy)

Existing: `PUT /api/learning/lessons/{lesson_id}/progress` `{status, completed_percent, time_spent_seconds}`.
The site calls it with `{status:"completed", completed_percent:100, time_spent_seconds:0}` when a
learner presses "Mark complete".

New: `POST /api/learning/progress/bulk` (auth)

```json
{ "lessons": [ { "lesson_id": "lesson_java_core_variables", "status": "completed", "completed_percent": 100 } ] }
```

→ `200 { "accepted": 12, "unknown": ["lesson_x"] }`. Upsert each; never downgrade a completed
lesson; ignore unknown keys (report them). Max 500 entries per request (the site sends
batches of 500 one after another). The site sends this once per lesson that it has not synced
before (progress recorded before this feature existed).

## 3. Data model

```
exam_questions  (the per-course POOL, filled ahead of time by a refill job)
  id uuid pk, course_id fk, module_id fk (by module key), lesson_id, concept text,
  prompt text (Markdown, no raw HTML), options jsonb (exactly 4 strings, Markdown),
  correct_index int 0..3, explanation text, difficulty enum easy|medium|hard,
  status enum live|rejected|quarantined|voided|retired, source enum ai|manual,
  prompt_hash text (unique per course), embedding, checks jsonb, times_served int,
  generation_job_id fk null, created_at, updated_at
  index (course_id, status, module_id)

exam_attempts  (permanent, compact)
  id uuid pk, user_id fk, course_id fk, recipient_name text,
  question_ids uuid[30] (draw order),
  answers jsonb ({question_id: displayed_option_index}; cleared at grading), tab_switches int default 0,
  started_at, expires_at, submitted_at null, status enum active|submitted|expired|lost,
  score int null, total int, passed bool null, module_breakdown jsonb null,
  results jsonb null ([{question_id, module_title, answered, correct}] after grading)
  unique partial index (user_id, course_id) where status = 'active'

exam_attempt_cache  (the served copy; DELETED when the attempt is graded)
  attempt_id pk/fk, payload jsonb (30 questions as served: shuffled options,
  permutation, correct_index, module_title), expires_at

certificates
  certificate_id text pk (format below), user_id fk, course_id fk, attempt_id fk,
  recipient_name text, course_title text (snapshots), score int, total int,
  issued_at, status enum valid|revoked, revoked_reason text null, revoked_at null,
  replaced_by text null (reissue)
  unique partial index (user_id, course_id) where status = 'valid'
  unique partial index (attempt_id) where status = 'valid'   (a reissue reuses the attempt)

courses: + exam_enabled bool default false, exam_code text
```

Supporting tables (shapes in `COURSE_EXAMS_BACKEND_PLAN.md` §6.8): `exam_module_context`,
`exam_generation_jobs`, `exam_generation_logs`, `exam_question_reports`, `exam_question_stats`.

## 4. Exam rules

**Eligibility** (all must hold): authenticated; `exam_enabled`; every published lesson of the
course completed by this user; no valid certificate for the course; no active attempt (else
resume it); last failed attempt submitted more than 24 hours ago (`lost` attempts never count
as failures).

**Draw (on start)** — from the pool's `live` questions; no AI call at exam time
0. **Only this course's questions.** The pool is filtered by `course_id`; a Core Java exam never
   contains an Advanced Java, SQL or PostgreSQL question. Shuffling only reorders inside that
   course's pool, and "questions this user saw" is read from attempts of the same course only.
   Enforcement layers (schema keys, draw guard, start check, import check) are in
   `COURSE_EXAMS_BACKEND_PLAN.md` §3, §4.2 and §6.8b.
1. Split 30 across modules in proportion to each module's lesson count (largest remainder),
   at least 1 per module. If a module has too few live questions, give its shortfall to
   modules with the most spare questions.
2. Within each module, aim for 30% easy / 50% medium / 20% hard; fall back to any difficulty.
3. No question this user saw in a previous attempt while unseen ones exist; no two questions
   with the same concept in one attempt.
4. Shuffle question order, and each question's options. Write the 30 (shuffled options,
   permutation, answer key) to `exam_attempt_cache`. Responses show options in the shuffled
   order; `answers` store the displayed index.
5. On grading (submit or expiry), store the compact `results` and **delete the cache row in the
   same transaction**.

**Crash recovery**: the cache is an in-memory dictionary per user, backed by the
`exam_attempt_cache` table (no Redis in v1). If an active attempt's questions can't be found in
either, the attempt becomes `lost`: not a fail, no cooldown; the learner presses Start again
and gets **new questions and a fresh 60 minutes** (the lost attempt's questions count as seen).
The exam page pings every 4 minutes during an attempt so Render's free tier doesn't sleep
mid-exam.

**Timer**: `expires_at = started_at + 60 minutes`, both from the server clock. Every attempt
response includes `server_now` (the client corrects for its clock offset).

**Saving**: answers can be saved until `expires_at`. Later saves → `409`.

**Submit**: accepted until `expires_at + 30 seconds`. Grading: map each displayed index through
the cached `permutation` to the original index and compare with the cached `correct_index`
(frozen at draw time, so pool edits never change a grade in progress); unanswered = wrong;
`passed = score * 100 >= 70 * total`. Submit is **idempotent**: submitting a graded attempt
returns its stored result (`200`), never an error.

**Expiry**: an active attempt past `expires_at + 30s` is graded from its saved answers and
marked `expired`. Do this lazily (on any read of the attempt or the course exam) and in a
periodic job. A passing expired attempt still issues a certificate.

**Certificate issuing**: in the same transaction as grading a passed attempt. The unique index
on `attempt_id` and the partial unique on `(user_id, course_id)` make concurrent submits safe.

**Certificate ID**: `WNS-{exam_code}-{YYYY}-{8 random Crockford base32 chars}` (alphabet
`0123456789ABCDEFGHJKMNPQRSTVWXYZ`, from `secrets`), e.g. `WNS-JAVA-2026-7KQ4M2XP`. Retry on
collision. Lookups are case-insensitive.

**Integrity**: rate-limit start/save/submit per user (start 5/hour, save 60/min, submit
10/min — the page autosaves 0.8 s after each answer, so fast answering needs ~1 save/s); store `tab_switches`
from the client (informational only); questions are only ever served inside an attempt.

## 5. Learner endpoints

`GET /api/learning/courses/{slug}/exam` — **works without auth** (then `eligible:false`,
`reasons:["login_required"]`, and the user fields are null/0).

```json
{
  "enabled": true, "eligible": false,
  "reasons": ["lessons_incomplete"],
  "lessons_remaining": 4, "cooldown_until": null,
  "active_attempt_id": null, "passed": false, "certificate_id": null,
  "question_count": 30, "duration_minutes": 60, "pass_percent": 70
}
```

`reasons` values: `login_required`, `exam_disabled`, `lessons_incomplete`, `cooldown`,
`already_passed`, `attempt_active`. Unknown course → `404`. When `enabled` is false the site
shows nothing.

`POST /api/learning/courses/{slug}/exam/attempts` `{ "recipient_name": "Asha Verma" }`
(2–80 chars, trimmed) → `201`

```json
{
  "attempt_id": "uuid", "status": "active",
  "started_at": "2026-10-18T10:00:00Z", "expires_at": "2026-10-18T11:00:00Z",
  "server_now": "2026-10-18T10:00:00Z",
  "questions": [
    { "id": "uuid", "prompt": "What does `javac` produce?", "options": ["...", "...", "...", "..."], "module_title": "Java Basics" }
  ],
  "answers": []
}
```

`409 { "detail": "...", "code": "not_eligible", "reason": "lessons_incomplete" }` when not
eligible (`reason` as in the exam view; plus `cooldown_until` / `lessons_remaining` when
relevant). `409 { "code": "pool_not_ready", "retry_after": 600 }` if the pool can't supply 30
questions. If an attempt is already active, return that attempt (`200`) instead of creating a
second one — unless its questions were lost (§4 crash recovery), in which case it is marked
`lost` and a new attempt is created (`201`).

`GET /api/learning/exam-attempts/{id}` (owner only, else `404`) → same shape as above, with
`answers: [{question_id, option_index}]`. When the attempt is graded: `status` is
`submitted`/`expired` and `result` (below) is included; `questions` may be omitted.

`PUT /api/learning/exam-attempts/{id}/answers`
`{ "answers": [{ "question_id": "uuid", "option_index": 2 }], "tab_switches": 1 }` → `200 { "saved_at": "..." }`.
Replaces the whole answer set. Validate question IDs belong to the attempt and `0 <= option_index <= 3`.
`409 { "code": "attempt_closed" }` after `expires_at` or once graded; `409 attempt_lost` if lost.

`POST /api/learning/exam-attempts/{id}/submit` → `200` result:

```json
{
  "score": 24, "total": 30, "percent": 80, "passed": true,
  "module_breakdown": [{ "module_title": "Java Basics", "correct": 4, "total": 5 }],
  "certificate_id": "WNS-JAVA-2026-7KQ4M2XP",
  "retake_after": null
}
```

On a fail: `certificate_id: null`, `retake_after` = submitted_at + 24h. Do **not** return correct
answers or per-question results (that would leak the bank). Grading deletes the attempt's
cache; `GET` on a graded attempt returns `status` and `result` only (no `questions`).

`GET /api/learning/exam-attempts/{id}/ping` (owner) → `{ "status", "expires_at", "server_now" }`.
Cheap; called every 4 minutes by the exam page to keep the server awake and resync the timer.

Any attempt endpoint on a `lost` attempt → `409 { "detail": "...", "code": "attempt_lost" }`;
the exam view then reports no active attempt and `eligible: true`.

`POST /api/learning/exam-attempts/{id}/reports` (owner, attempt active)
`{ "question_id": "uuid", "reason": "wrong_answer|unclear|typo|other", "comment": "≤ 500 chars" }`
→ `201`. One report per question per attempt. Two reports from different learners quarantine
the question automatically. A report never changes the reporter's own grade; it only stops the
question being drawn again until an admin restores or voids it.

`GET /api/me/certificates` → `{ "items": [ { "certificate_id", "course_slug", "course_title", "issued_at", "status" } ] }`.

## 6. Public certificate endpoints

`GET /api/certificates/{certificate_id}` (no auth) →
`{ "certificate_id", "recipient_name", "course_title", "course_slug", "issued_at", "status" }`.
No email, user ID or score. Revoked certificates still return `200` with `status:"revoked"`.
Unknown → `404`.

`GET /api/certificates/{certificate_id}/pdf` → `application/pdf`, `Content-Disposition:
attachment; filename="{certificate_id}.pdf"`. A4 landscape, same content as the web page:
WebNest Studio logo, "Certificate of completion", recipient name, "has completed the course and
passed its final exam", course title, issue date, certificate ID, verification URL (and a QR
code of it). Reuse the PDF tooling behind `GET /api/chat/plans/{plan_id}/pdf`. Revoked → `410`.

## 7. Admin endpoints (role admin)

There is no approval step: questions go live after automatic checks (`COURSE_EXAMS_BACKEND_PLAN.md`
§6.4). Admins monitor the pool and handle quarantined questions.

- `PUT /api/admin/learning/courses/{slug}/exam-context` `{ "modules": [context, ...] }` — module
  context for the generator, uploaded by `scripts/sync-learning-catalog.mjs` (format in §8).
- `PUT /api/admin/learning/courses/{slug}/exam` `{ "enabled": true, "code": "JAVA" }` — turning
  the exam on starts a background job that creates the course's **fixed pool of 90 questions**
  (questions imported from Excel count first). The exam view keeps returning `enabled: false` —
  so learners see nothing and never wait — until every module has its share of the 90; then the
  exam appears automatically. Turning it off hides it again (the pool is kept).
- `GET /api/admin/learning/exam-questions/summary?course={slug}` →
  `{ "enabled": true, "ready": false, "live": 64, "target": 90, "code": "JAVA", "modules": [{ "module_id": "<module key>", "live": 22, "target": 25, "quarantined": 1, "rejected": 9 }] }`
- `GET /api/admin/learning/exam-questions?course={slug}&status=live|quarantined|rejected|voided|retired&module={module key}` →
  `{ "items": [ { "id", "module_id", "lesson_id", "concept", "prompt", "options", "correct_index", "explanation", "difficulty", "status", "checks", "reports", "stats", "updated_at" } ] }`
- `POST /api/admin/learning/exam-questions` — an admin writes a question by hand
  (`course_slug, module_id, lesson_id, concept, prompt, options, correct_index, explanation,
  difficulty, kind, source_fact`); `source: "manual"`. It runs the same automatic checks and
  goes live only if it passes.
- `POST /api/admin/learning/exam-questions/import` — a prepared seed bank (JSON Lines or a JSON
  array, ≤ 500 per request, fields as in §8's model output plus `course_slug, module_id`) →
  `{ "imported": 140, "rejected": [{ "line": 12, "reason": "duplicate" }] }`. Same checks;
  the AI cross-check is deferred if no quota is left (`COURSE_EXAMS_BACKEND_PLAN.md` §6.8b).
  Running out of AI quota never affects exams — it only pauses refills (§6.8a).
- `PUT /api/admin/learning/exam-questions/{id}` — edit or restore. Edits re-run every automatic
  check; the question stays/returns `live` only if it passes. Running attempts are unaffected
  (they grade from their own cache).
- `POST /api/admin/learning/exam-questions/{id}/void` — never drawn again; graded attempts that
  contained it are regraded without it (new passes get certificates; none are revoked).
- `POST /api/admin/learning/exams/{slug}/refill` → `{ "job_id" }`; `GET /api/admin/learning/exams/jobs/{job_id}` →
  `{ "status", "modules_done", "modules_total", "calls", "created", "rejected_by_check": {...}, "errors": [] }`.
- `GET /api/admin/certificates?q=` — search ID, name, email, course →
  `{ "items": [ { "certificate_id", "recipient_name", "user_email", "course_title", "score", "total", "issued_at", "status", "revoked_reason" } ] }`
- `POST /api/admin/certificates/{id}/revoke` `{ "reason" }`.
- `POST /api/admin/certificates/{id}/reissue` `{ "recipient_name" }` → new certificate (new ID,
  same attempt, score and course); the old one is revoked with `replaced_by`. Returns the new record.

## 8. Question generation (automatic, ahead of time)

When a course's exam is turned on, a background job creates a **fixed pool of 90 questions**
(minus any imported from Excel) and then stops; it only runs again to replace questions removed
from the pool. Every learner gets 30 of the stored 90, shuffled — **0 AI tokens per learner**. It calls
the model **5 questions per call**, checks every question automatically and rejects duplicates;
details in `COURSE_EXAMS_BACKEND_PLAN.md` §6. No model is called while a learner takes an exam.
Module context (stored from the `exam-context` upload):

```json
{
  "course_slug": "java-core", "course_title": "Java - Core",
  "module_id": "mod_java_core_java_basics", "module_title": "Java Basics",
  "lessons": [
    { "lesson_id": "...", "title": "...", "summary": "...", "key_points": ["..."], "avoid_prompts": ["..."] }
  ]
}
```

Instructions to the model (Gemini; Groq if Gemini is down — the other model always cross-checks):
- Write 5 single-answer questions on the given 1–2 lessons, using only facts in
  `summary`/`key_points` or standard, version-stable knowledge of the course's baseline
  (Java 17, Spring Boot 4.1, Python 3.12, …). Do not test the concepts listed as already covered.
- Prefer applied questions (predict the output of a short snippet, choose the right approach for
  a scenario, spot the bug) over definitions. Mix: 30% easy, 50% medium, 20% hard.
- 4 options, exactly one correct, plausible distractors of similar length; no "all/none of the
  above", no "both A and B", no trick wording or negatives in caps.
- Do not reuse or paraphrase any `avoid_prompts` (those answers are public on the site).
- Return JSON: `[{prompt, options[4], correct_index, explanation, difficulty, kind, lesson_id,
  concept, source_fact, why_others_wrong[3], code?, expected_output?}]`.

A question goes **live** only if it passes all automatic checks: shape rules, grounding
(`source_fact` is in the lesson material), an independent answer by the other model that
agrees with confidence ≥ 0.8, real execution of code questions matching the keyed answer, and
no duplicate (same hash, wording, meaning by embeddings, or concept). Learner reports and
answer statistics quarantine bad questions after launch.


## 9. Tests the backend should have

- Draw: 30 questions; every module represented; spread follows lesson counts; no
  `correct_index`/`explanation` anywhere in learner responses; options permuted per attempt.
- Eligibility: each `reasons` value; works logged out; lesson keys accepted.
- Start while active returns the same attempt; one active attempt per user and course.
- Save rejected after `expires_at` (409); submit accepted within 30s grace, graded after.
- Expired attempt auto-graded on read and by the job; passing expired attempt issues a certificate.
- Submit twice / concurrently → one grade, one certificate.
- Fail → `retake_after` = +24h and start refused until then; new attempt draws new questions
  (none seen before while unseen ones exist); no two questions with the same concept in one attempt.
- Cache: created at start, same 30 returned on refresh, deleted in the grading transaction
  (submit, lazy expiry, job); orphans swept; regrading works from `results` after deletion.
- Pool: only `live` questions are drawn; exact/near/semantic duplicates rejected; quarantine
  after two reports; void regrades attempts.
- Certificate ID format, uniqueness, case-insensitive lookup; revoked shows `status:"revoked"`
  publicly and PDF `410`; reissue revokes the old ID.
- Admin: turning an exam on starts the 90-question fill and the exam view stays `enabled: false`
  until every module has its share; the AI stops at 90; generation validation rejects bad items;
  a manual question goes live only after passing the checks.
- AI quota exhausted: exams still start and draw from the pool; the refill job pauses (no
  retry storm) and resumes later; seed import works without quota.
- Lost attempt: `409 attempt_lost` on get/save/submit/ping; no cooldown; next start is a new
  attempt with new questions and a fresh 60 minutes.

## 10. Integration: what the frontend relies on

### Endpoint list

| # | Method + path | Auth | Called from |
|---|---|---|---|
| 1 | `PUT /api/admin/learning/courses` (+ `key`, `exam_code`) | admin | `scripts/sync-learning-catalog.mjs` |
| 2 | `PUT /api/learning/lessons/{lesson_key}/progress` | user | lesson page "Mark complete" |
| 3 | `POST /api/learning/progress/bulk` | user | course page, before #4 (batches of ≤ 500) |
| 4 | `GET /api/learning/courses/{slug}/exam` | **optional** | course page card, exam page |
| 5 | `POST /api/learning/courses/{slug}/exam/attempts` | user | exam page "Start" |
| 6 | `GET /api/learning/exam-attempts/{id}` | owner | exam page (resume) |
| 7 | `PUT /api/learning/exam-attempts/{id}/answers` | owner | autosave, 0.8 s after each change |
| 8 | `POST /api/learning/exam-attempts/{id}/submit` | owner | Submit button, timer at 0 |
| 9 | `GET /api/learning/exam-attempts/{id}/ping` | owner | every 4 min during the exam |
| 10 | `POST /api/learning/exam-attempts/{id}/reports` | owner | not wired yet (frontend pending) |
| 11 | `GET /api/me/certificates` | user | learner dashboard |
| 12 | `GET /api/certificates/{certificate_id}` | **none** | public certificate page |
| 13 | `GET /api/certificates/{certificate_id}/pdf` | **none** | plain `<a href download>` link, so no auth header is sent |
| 14 | `GET /api/admin/certificates?q=` | admin | admin certificates |
| 15 | `POST /api/admin/certificates/{id}/revoke` | admin | admin certificates |
| 16 | `POST /api/admin/certificates/{id}/reissue` | admin | admin certificates (reads `certificate_id` from the response) |
| 17 | §7 admin pool endpoints | admin | the admin pool page is being rewritten for §7 |

Course slugs and codes: `java-core` JAVA, `advanced-java` ADVJAVA, `spring-framework` SPRING,
`spring-boot` BOOT, `python` PY, `html` HTML, `css` CSS, `javascript` JS, `react` REACT,
`database-sql` SQL, `postgresql` PG, `database-design` DBDESIGN.

**Do not build** `POST /api/admin/learning/exams/{slug}/generate` or the `draft`/`approved`
statuses. The current `AdminExamBank.jsx` still calls them, but that page is from the earlier
draft-and-approve design and will be rewritten for §7.

### Rules the frontend code depends on

1. **Timestamps are UTC ISO 8601 with a zone**, e.g. `2026-10-18T10:00:00Z` or `+00:00`, for
   `started_at, expires_at, server_now, cooldown_until, retake_after, issued_at, saved_at`. The
   browser runs `Date.parse` on them. A datetime without a zone (FastAPI's default for naive
   `datetime`) is read as the learner's local time, which puts the timer 5½ hours off in India.
   Use timezone-aware datetimes everywhere.
2. **Error bodies:** every 4xx/5xx has `detail` as a **plain string**; the page shows it in a
   toast. Machine-readable fields go next to it: `{"detail": "...", "code": "...", ...}`. This
   includes `pool_not_ready` and 429 rate limits. For 422 validation errors, either flatten
   `detail` to a string or return `errors: [{msg}]`. FastAPI's default array `detail` is not shown.
3. **409 on save means "closed":** the page reacts to any 409 from #7 (other than
   `code: "attempt_lost"`) by stopping autosave and submitting. Use **422**, not 409, for bad
   question IDs or option indexes.
4. **Submit never fails on a graded attempt.** The page submits when its timer hits 0 and again
   if a save returns 409, and the learner may come back after the 30 s grace. Every one of those
   calls must return `200` with the stored result: grade lazily first if the attempt is overdue.
   Only `attempt_lost` (409), not-owner (404) and server errors may fail.
5. **Attempt shape (#5, #6 while active):** `attempt_id, status, started_at, expires_at,
   server_now, questions[{id, prompt, options[4], module_title}], answers[{question_id,
   option_index}]`. `option_index` is the **displayed** index (0–3). #5 returns `201` for a new
   attempt and `200` with this same shape for an existing active one.
6. **Graded attempt (#6):** `{attempt_id, status: "submitted"|"expired", result}`. `result` has
   the same shape as #8's response. The page shows `result` whenever `status` isn't `active`.
7. **Result shape (#8):** `score, total, percent` (integer, rounded), `passed`,
   `module_breakdown[{module_title, correct, total}]` (module titles unique within a course),
   `certificate_id` (null on fail), `retake_after` (null on pass).
8. **Exam view (#4):** all fields always present (null/0/false when not applicable).
   `passed: true` and `certificate_id` refer to a **valid** certificate only. Overdue attempts
   are graded before responding, and lost ones are marked, so `active_attempt_id` is only set
   for a truly running attempt. `enabled` stays `false` until the pool is ready; the frontend
   then hides the exam card completely.
9. **Optional auth (#4):** no `Authorization` header → anonymous view. An **expired or invalid**
   token → `401` (not the anonymous view), so the frontend refreshes the token and retries.
10. **Lesson keys:** #2 and #3 accept the site's lesson keys. A key that appears in two courses
    (aliases) counts as completed in **every** course that contains it. #3 returns `200` even
    when some keys are unknown, and lists them in `unknown`.
11. **Certificate IDs** arrive URL-encoded and possibly lower-case (typed by hand); match
    case-insensitively. #13 needs `Content-Disposition: attachment` because the browser ignores
    the `download` attribute on another origin. Revoked → `410`.
12. **Lists** (#11, #14, admin lists) are `{ "items": [...] }`. #11 includes revoked
    certificates (the dashboard labels them), newest first.
13. **CORS:** allow the site origins (`https://www.webneststudio.co.in`, `https://webneststudio.co.in`,
    `http://localhost:5173`) with the `Authorization` header, for `GET, POST, PUT`.

## Frontend reference

| Piece | File | Status |
|---|---|---|
| API calls | `src/api/learning.js`, `src/api/admin.js` | built |
| Course page "Final exam" step | `src/components/CourseExamCard.jsx` | built |
| Exam page `/learn/:courseSlug/exam` (timer, autosave, ping, lost-attempt reset) | `src/pages/learn/CourseExam.jsx` | built |
| "Report this question" button in the exam | `src/pages/learn/CourseExam.jsx` | **pending** |
| Certificate page `/certificates/:certificateId` | `src/pages/learn/CertificateView.jsx` | built |
| My certificates | `src/pages/codelab/LearnerDashboard.jsx` | built |
| Admin certificates | `src/pages/admin/AdminCertificates.jsx` | built |
| Admin question pool (live/quarantined, restore, void, refill, pool switch) | `src/pages/admin/AdminExamBank.jsx` | **pending** — the current page targets the earlier draft/approve flow and will be rewritten for §7 |
| Progress sync | `src/lib/learningProgress.js` (`syncLocalProgress`), `src/pages/learn/LessonDetail.jsx` | built |
| Catalog sync | `scripts/sync-learning-catalog.mjs` | built |
| Module context upload (`exam-context`) | `scripts/sync-learning-catalog.mjs`, `src/lib/examContext.js` | **pending** (context builder is built; the upload call is not) |

The pending items are frontend-only and do not block backend phases 1–2.
