# Course final exams and certificates — backend implementation plan

For the backend team. **`COURSE_EXAMS_CERTIFICATES.md` is the contract** (endpoints, JSON
shapes, rules); this document is how to build it in the FastAPI service. The frontend is
already built against the contract and stays hidden until a course's exam is enabled, so each
phase below can ship on its own.

Assumptions: PostgreSQL on **Supabase** (the learning module already returns UUIDs; we rely on
`jsonb`, arrays and partial unique indexes; pgvector is available as a Supabase extension), the project's existing ORM and migration tool, `users.id` integer,
the existing `get_current_user` / admin-role dependencies, and the existing Gemini + Groq
client used by `/api/generate` and `/api/admin/codelab/generate`.

## 1. Rules (same as the GitHub integration)

1. No `@staticmethod`. Instance methods on classes that get dependencies in `__init__`, or
   module-level functions.
2. Every function body in services, stores, clients and routers is wrapped in `try/except`:
   specific exceptions first, log with context (user id, course, attempt id; **never** answers
   or tokens), re-raise as a domain error from `app/exams/errors.py`, never swallow, never
   return a stack trace.
3. Routers call services only. Services depend on `typing.Protocol` interfaces; concrete classes
   are built only in `app/exams/dependencies.py`. Only the store classes import the ORM; only
   the LLM client imports the model SDK; only the PDF renderer imports the PDF library.
4. Error body `{ "detail", "code", ...extra }`; validation `422 { "errors": [...] }`;
   timestamps ISO-8601 UTC; all time from an injected `Clock`.
5. **Answers never leave the server** except in admin responses. Learner/public schemas are
   separate Pydantic models with no `correct_index`/`explanation` fields, and a test enforces it.

## 2. Module layout

```
app/exams/
  router_learner.py      # /api/learning/courses/{slug}/exam, /api/learning/exam-attempts/*, /api/me/certificates
  router_public.py       # /api/certificates/{id}, /api/certificates/{id}/pdf (no auth)
  router_admin.py        # /api/admin/learning/exam-questions*, /exams/{slug}/refill, /exams/jobs/*,
                         #   /courses/{slug}/exam, /courses/{slug}/exam-context, /api/admin/certificates*
  schemas.py             # Pydantic models, exactly the contract (learner / public / admin kept apart)
  errors.py              # ExamDomainError + one subclass per error code (section 5)
  protocols.py           # QuestionStore, AttemptStore, AttemptCache, CertificateStore, ProgressReader,
                         #   CourseReader, QuestionGenerator, QuestionChecker, CodeRunner, Embedder,
                         #   PdfRenderer, IdGenerator, Clock, Random
  domain/                # pure functions, no I/O, 100% unit tested
    draw.py              # pick 30 questions (no seen, one per concept) + option permutations
    grading.py           # score, pass, module breakdown, compact results
    validation.py        # shape + grounding checks, prompt_norm/prompt_hash, Jaccard
    dedupe.py            # combine hash / Jaccard / embedding / concept rules (§6.5)
    certificate_id.py    # WNS-{CODE}-{YYYY}-{8 base32}
  services/
    eligibility_service.py   # GET .../exam view and the start gate
    attempt_service.py       # start (draw + cache), get, save answers, submit (grade + delete cache), expire
    certificate_service.py   # issue (inside grading transaction), get, list, revoke, reissue
    pool_service.py          # fixed 90-question targets, readiness, fill/replace planning, quarantine, void + regrade
    generation_service.py    # one 5-question call -> verification -> dedupe -> live/rejected rows
    question_admin_service.py# admin list/summary/edit/restore/void, enable checks, reports
  infra/
    sql_question_store.py  sql_attempt_store.py  sql_certificate_store.py
    sql_attempt_cache.py     # AttemptCache on the Postgres table (source of truth in v1)
    memory_attempt_cache.py  # v1: per-user dict in front of sql_attempt_cache (read-through, write-through)
                             # v2 later: redis_attempt_cache.py replaces both
    sql_progress_reader.py sql_course_reader.py
    llm_question_generator.py   # Gemini drafting (Groq fallback) — wraps the existing client
    llm_question_checker.py     # cross-check with the other model
    execution_code_runner.py    # existing /api/compiler/execute + /api/java/run paths, SQLite for SQL
    gemini_embedder.py          # embeddings for semantic duplicate checks
    pdf_renderer.py             # certificate PDF (reuse the chat-plan PDF library) + QR code
    secrets_id_generator.py  system_clock.py  system_random.py
  jobs.py                # expire_overdue_attempts + orphan cache sweep (5 min), fill_pools (30 min, only for gaps),
                         #   question_stats (nightly), weekly_report — lazy paths stay primary
  dependencies.py        # the ONLY place concrete classes are constructed
  models.py              # ORM tables (section 3)
```

Changes in the existing learning module (`app/learning/...`, wherever it lives):
- Course/module/lesson `key` + `exam_code` + `exam_enabled` columns; catalog upsert matches by `key`.
- A `resolve_lesson(lesson_id_or_key)` used by every `/api/learning/lessons/{lesson_id}/*` route.
- `POST /api/learning/progress/bulk`.

## 3. Data model and migration

One migration per phase (section 9). Columns are as in the contract §3; additions here are the
constraints and indexes that make the rules hold under concurrency.

**Learning tables (phase 1)**
- `courses`: `+ exam_code text null unique`, `+ exam_enabled bool not null default false`.
- `course_modules`, `lessons`: `+ key text not null`; unique `(course_id, key)`. Backfill
  existing rows with `key = id::text` before adding `not null`.
- `lesson_progress`: existing; ensure unique `(user_id, lesson_id)` for upserts.

**`exam_questions` — the question pool (phase 2)**
- `options jsonb` with check `jsonb_array_length(options) = 4`; check `correct_index between 0 and 3`.
- `status`: `live` (passed every automatic check, can be drawn), `rejected`, `quarantined`
  (pulled by reports or statistics, §6.7), `voided` (wrong, attempts regraded), `retired`
  (served too often, §6.2). `difficulty`, `kind`, `source` as text + check constraints.
- Duplicate guards (§6.5): `prompt_norm text`, `prompt_hash text` (sha256 of `prompt_norm` +
  normalized correct option) with **unique `(course_id, prompt_hash)`**, `embedding vector(768)`
  (pgvector; fall back to `real[]` with in-process cosine — a course pool is a few hundred rows),
  `concept text` (short tag, e.g. "string immutability").
- `times_served int default 0`, `lesson_id`, `module_id`.
- **Course isolation in the schema:** a question can only belong to a module and lesson of its
  own course. Composite foreign keys `(course_id, module_id) → course_modules(course_id, id)`
  and `(module_id, lesson_id) → lessons(module_id, id)` (add unique `(course_id, id)` on
  `course_modules` and `(module_id, id)` on `lessons` to back them). A row like "course = Core
  Java, module = a PostgreSQL module" is refused by the database itself.
- Indexes: `(course_id, status, module_id)`, `(course_id, lesson_id, concept)`.

**`exam_attempts` (phase 3)** — the permanent, compact record of an attempt
- `status`: `active`, `submitted`, `expired` (graded after the timer ran out), `lost` (questions
  unrecoverable after a crash, §6.6 — never graded, never a failure).
- `question_ids uuid[]` (draw order), `answers jsonb not null default '{}'` —
  `{question_id: displayed_index}` while active. Kept in this table, **not in the cache**, so a
  lost or evicted cache can never lose a learner's answers. Cleared at grading (displayed
  indexes mean nothing once the cache's permutations are deleted); `results` replaces them.
- After grading: `results jsonb` — `[{question_id, module_title, answered, correct}]`, plus
  `score, total, passed, module_breakdown`. No question text, options or answer key.
  Kept for regrading (§6.7), question statistics and "don't repeat questions on a retake".
- Partial unique `(user_id, course_id) where status = 'active'` — one active attempt.
- Index `(status, expires_at)` for the expiry job; `(user_id, course_id, submitted_at desc)` for cooldown.

**`exam_attempt_cache` (phase 3)** — the served copy, **deleted when the attempt is graded**
- `attempt_id` PK/FK, `payload jsonb` — the frozen 30 questions exactly as served plus the
  grading key: `[{question_id, prompt, options (shuffled), permutation, correct_index,
  module_title}]`, `expires_at` (attempt `expires_at` + 30 s grace + 10 min margin).
- Freezing the key here means pool edits or voids never change a grade in progress.
- Behind an `AttemptCache` Protocol. **No paid services in v1** (budget):
  - **v1 = in-memory dictionary per user + this Postgres table.** `MemoryAttemptCache` keeps
    `{user_id: {course_id: payload}}` in the API process for fast reads, and writes through to
    `exam_attempt_cache` in the existing database. Reads try the dictionary first; on a miss
    (restart, deploy, Render free-tier spin-down, another worker) they load from the table and
    refill the dictionary. Delete at grading removes both. Entries also expire at
    `expires_at` (a small sweep every 5 minutes) so memory never grows.
  - **Why not the dictionary alone:** it lives inside one Python process. A redeploy, a crash,
    or Render putting the free instance to sleep would wipe every running exam's answer key, and
    with more than one worker a request could land on a process whose dictionary doesn't have
    the attempt. The table makes that harmless at no extra cost: ~30 KB per running attempt,
    deleted at grading.
  - **v2 (when budget allows) = Redis** (Render Key Value) with `EXPIREAT`, replacing both
    without touching services, routers or tests beyond the cache's own.

**`certificates` (phase 3)**
- PK `certificate_id text`; store upper-case; look up with `upper(:id)`.
- Unique `attempt_id`; partial unique `(user_id, course_id) where status = 'valid'`.

**`exam_generation_logs` (phase 2)**: one row **per model call** (drafting, cross-check or
embedding): `id, job_id fk → exam_generation_jobs, course_id, module_id, purpose
(draft|check|embed), model, requested_count, accepted, rejected, prompt_tokens,
completion_tokens, error, created_at`. `exam_generation_jobs` (§6.8) is one row per refill run.
Reuse the existing generation-log table if its shape fits.

## 4. Core logic

### 4.1 Eligibility (`eligibility_service.get_exam_view(course_slug, user | None)`)
```
course = courses.by_slug(slug)            -> CourseNotFound (404)
if not course.exam_enabled                -> {enabled: false, ...}
if user is None                           -> eligible false, reasons [login_required]
cert   = certificates.valid_for(user, course)
active = attempts.active_for(user, course)   # expire it first if overdue (4.4);
                                             # mark it lost if its cache is gone (§6.6)
remaining = lessons.published_count(course) - progress.completed_count(user, course)
last_fail = attempts.last_failed(user, course)   # 'lost' attempts are never failures
cooldown_until = last_fail.submitted_at + 24h if within window
eligible = no cert and no active and remaining == 0 and no cooldown
```
One query each; `completed_count` is a join on published lessons only (archived lessons no
longer count).

### 4.2 Draw (`domain/draw.py`, pure)
**Course isolation (hard rule):** an exam only ever contains questions of the course being
examined — a Core Java exam never gets an Advanced Java, SQL or PostgreSQL question, and
shuffling only reorders questions **inside** that course's pool. Enforced in four places:
1. **Query:** the pool is loaded with `WHERE course_id = :course_id AND status = 'live'`, and
   modules with `WHERE course_id = :course_id` — no cross-course pool query exists in the repo.
2. **Schema:** the composite foreign keys in §3 make a question with another course's
   module/lesson impossible to store.
3. **Draw guard:** `draw(course_id, …)` takes the course id and raises `CrossCourseQuestion`
   if any input question's `course_id` differs or its `module_id` isn't in that course's module
   list (defence against a future query bug; it never silently drops and continues).
4. **Start guard:** before the attempt row and cache are written, `attempt_service.start`
   re-checks that all 30 drawn ids belong to `course.id` (one `count(*)` query); mismatch →
   500 + alert, no attempt created.
Seen-question history is per course too: "questions this user saw" is read from attempts with
the same `course_id` only.

Input: `live` questions of **this course** grouped by module (with lesson counts), the ids this
user saw in earlier attempts **of this course** (from `exam_attempts.results`), `Random`.
Output: 30 entries with permutations.
1. Quota per module = largest-remainder share of 30 by lesson count, minimum 1.
2. If a module has fewer live questions than its quota, move the shortfall to the modules
   with the most spare questions (repeat until placed). Raise `PoolNotReady` if fewer than 30.
3. Inside a module, fill 30/50/20 easy/medium/hard by rounding the quota; fill gaps from any
   difficulty.
4. **No repeats within an attempt:** 30 distinct ids and at most one question per `concept`.
   **No repeats across a learner's attempts:** questions the user has seen are excluded while
   unseen ones exist (with a 90-question pool: attempts 1–3); after that the draw takes the
   questions this learner saw longest ago (§6.2). The pool is not grown for this.
5. Shuffle the final list; random permutation of each question's 4 options.
Property tests: always 30 unique ids and concepts; each module ≥1 when possible; never a seen
question while unseen ones exist; deterministic with a seeded `Random`; **every drawn question
has the examined `course_id`** (fixture DB holds Core Java, Advanced Java and PostgreSQL pools
side by side; 1,000 seeded draws for Core Java contain zero non-Core-Java ids); a mixed input
raises `CrossCourseQuestion`; a user's Advanced Java history doesn't affect their Core Java draw.

### 4.3 Start / save / submit (`attempt_service`)
- **Rule for every endpoint:** read the `exam_attempts` row first and act on its `status`; the
  cache is consulted **only** for an `active` attempt. A stale dictionary entry in another
  worker (after grading elsewhere) is therefore never served.
- **start**: in a transaction — re-check eligibility (409 with `reason` if not); if an active
  attempt exists return it (200, read from its cache — or, if the cache is gone in both layers,
  mark it `lost` and continue as a new start); else draw 30 from the pool (4.2),
  insert the attempt with `expires_at = now + 60 min`, **write the attempt cache**, increment
  `times_served`, and return 201 with the 30 questions read from the cache (shuffled options,
  no key). The partial unique index turns a double-click race into one insert + one "return
  existing". No AI call happens here.
- **get** / **ping**: owner only (404 otherwise); expire if overdue; active → questions from the
  cache (ping returns only `status, expires_at, server_now` but still checks the cache exists);
  cache gone → mark `lost`, 409 `attempt_lost`; graded → the stored result.
- **save**: `UPDATE exam_attempts SET answers=:a, tab_switches=:t WHERE id=:id AND user_id=:u
  AND status='active' AND expires_at > now()`. Validate ids belong to the attempt and indexes
  are 0–3; payload ≤ 30 entries. 0 rows → read the row to choose the code: `lost` →
  `attempt_lost`, missing/not owner → `attempt_not_found`, otherwise `attempt_closed`. Save does
  not touch the cache (cheap); a lost cache is noticed by the next get/ping/submit.
- **submit**: `SELECT ... FOR UPDATE` the attempt. If already graded → return stored result
  (idempotent); `lost` → 409 `attempt_lost`; cache gone → mark `lost`, 409 `attempt_lost`.
  If `now > expires_at + 30s` → grade as `expired`, else `submitted`. Grade from
  the cache's key (4.5), store `results`, issue the certificate if passed (4.6), and **delete
  the attempt cache — all in the same transaction**, so a crash can never leave a graded
  attempt with its answer key still cached, or a cache deleted before the grade is saved.

### 4.4 Expiry
- **Lazy (primary)**: every read path that touches an active attempt (`get`, exam view, start)
  calls `expire_if_overdue(attempt)`, which runs the submit path with status `expired` (if the
  cache is gone too, the attempt becomes `lost` instead — it cannot be graded fairly).
  Render's free tier sleeps, so this must not depend on the job.
- **Job (best effort)**: `jobs.expire_overdue_attempts()` every 5 minutes via the project's
  scheduler (APScheduler on startup, or a Render cron hitting an admin-only endpoint): select
  `status='active' and expires_at < now() - 30s`, `FOR UPDATE SKIP LOCKED`, grade each (which
  deletes its cache), then delete any orphaned cache row past its own `expires_at`.

### 4.5 Grading (`domain/grading.py`, pure)
For each cached entry: `original = permutation[displayed]`; correct if `original ==
correct_index`. Unanswered = wrong. `passed = score*100 >= 70*total`. Module breakdown in draw
order of first appearance. Output is the compact `results` list stored on the attempt;
`retake_after = submitted_at + 24h` on fail.

### 4.6 Certificates
- ID: `f"WNS-{course.exam_code}-{issued_at:%Y}-{rand8}"`, `rand8` from `secrets.choice` over
  `0123456789ABCDEFGHJKMNPQRSTVWXYZ`. Insert; on unique violation retry up to 5 times.
- Snapshot `recipient_name` (trimmed, collapsed spaces, 2–80 chars, letters/marks/spaces/
  `.'-` only) and `course_title`.
- **revoke**: set status, reason, `revoked_at`, audit log entry.
- **reissue**: transaction — revoke old (`replaced_by` = new id), insert new with the corrected
  name and the same attempt/score/course/`issued_at` date. Drop the `attempt_id` unique for
  revoked rows (make it partial `where status='valid'`) so reissue can reuse the attempt.

### 4.7 PDF
A4 landscape, same content as the web page plus a QR code of the verification URL. Reuse the
library behind `/api/chat/plans/{id}/pdf`; add `qrcode` if missing. Cache the bytes in memory
(LRU, keyed by id + status) — certificates never change except by revoke/reissue. Revoked → 410.
Headers: `Content-Disposition: attachment; filename="{id}.pdf"`, `Cache-Control: public, max-age=3600`.

## 5. Error codes

| HTTP | code | When |
|---|---|---|
| 404 | `course_not_found` | Unknown course slug |
| 404 | `attempt_not_found` | Attempt missing or not the caller's |
| 404 | `certificate_not_found` | Unknown certificate ID |
| 409 | `exam_disabled` | Exam not enabled for the course |
| 409 | `not_eligible` | Start refused; extra `reason`: `lessons_incomplete` / `cooldown` / `already_passed` (+ `cooldown_until`, `lessons_remaining`) |
| 409 | `attempt_closed` | Save after expiry or after grading |
| 409 | `attempt_lost` | The attempt's questions could not be recovered after a crash; the learner starts again with new questions (§6.6) |
| 409 | `pool_not_ready` | Start while the pool is not ready (normally impossible: the exam stays hidden until ready); extra `retry_after` |
| 410 | `certificate_revoked` | PDF of a revoked certificate |
| 422 | (validation) | Bad name, answer index, question fields |
| 429 | `rate_limited` | Too many requests; extra `retry_after` |
| 502 | `generation_failed` | LLM error or unusable output |

## 6. Questions: pool, verification, duplicates and the attempt cache

Decisions (2026-10-18): each course has a **fixed pool of 90 questions**, created by the AI **in
the background as soon as the exam is turned on**, then reused for every learner (30 drawn and
shuffled per attempt) — no AI is used per learner; the AI only runs again to replace questions
that are removed. Questions go live after **automatic checks only** (no human approval step), so the
automatic gate below is strict and the after-launch safety net (§6.7) is mandatory; each
attempt's 30 questions sit in a **cache that is deleted when the test completes**.

### 6.1 Flow

```
FILL JOB (background, when the exam is turned on)             LEARNER
for each module below its share of 90:                        Start exam
  Gemini: 5 questions per call ──► checks (§6.4) ──► dedupe     │  draw 30 live questions
  (Groq if Gemini is down)          (Groq cross-check,  (§6.5)  │  from the pool (DB, ms)
                                     run code)            │     ▼
                                                          ▼   exam_attempt_cache  ◄── GET attempt
                                              POOL: exam_questions (status live)  │   (refresh)
                                              90 live per course (fixed)           │
                                                                                   ▼
                                                                  Submit / time up: grade from
                                                                  cache → save compact results
                                                                  → DELETE cache (same txn)
```

- **No AI call while a learner is waiting.** Start is a database draw (milliseconds), so a slow
  or failing Gemini never breaks an exam.
- **One response with all 30**: `POST .../exam/attempts` returns the full set (no answers)
  from the cache; a refresh reads the same 30 from the cache. The page shows them one at a
  time and only sends autosaves after that.
- **The pool keeps the stock; the cache is per attempt.** Pool questions are reused across
  learners (never twice for the same learner); the cache holds one attempt's served copy and
  its answer key, and is destroyed at grading.

### 6.2 The fixed pool (`pool_service`, `jobs.fill_pools`)

- **Size:** `EXAM_POOL_TARGET` = **90 live questions per course** (3 full exams), split across
  modules by lesson count, at least `EXAM_POOL_MIN_PER_MODULE` (3) each. The AI never grows a
  pool beyond its target.
- **Created in the background when the exam is turned on:** `PUT .../courses/{slug}/exam
  {enabled: true}` starts a fill job immediately (5 questions per call, every check in §6.4–6.5)
  until each module has its share. Learners see nothing while it fills: the exam view keeps
  returning `enabled: false` until the pool is **ready** (every module at its share), then the
  course's exam appears automatically. Nobody ever waits for the AI.
- **Then the AI stops for that course.** Every learner gets 30 of the stored 90, shuffled
  (question order and options). The fill job runs again only to replace questions that left
  the pool — quarantined or voided (§6.7), too easy (`retired`, §6.7), or no longer matching a
  rewritten lesson (below) — back up to 90. It checks every 30 minutes for gaps.
- **Per learner:** 90 questions give **3 attempts with no repeats**. From the 4th attempt on,
  the draw reuses the questions that learner saw longest ago, in a new order with shuffled
  options (4.2). No serve-count rotation by default (`EXAM_MAX_SERVES` = 0, off), so tokens are
  not spent replacing good questions.
- **Seed questions count toward the 90:** questions imported from Excel (§6.8b) fill the pool
  first; the AI only writes what is still missing. A course fully seeded from Excel needs no AI.
- **Partial readiness:** if the AI quota runs out mid-fill, the job pauses (§6.8a) and resumes
  later; the course simply stays hidden until ready.
- **When lessons change:** a new `exam-context` upload for a module re-runs the grounding check
  (§6.4 #2) on that module's live questions; any that no longer match the lesson material are
  quarantined, and the refill job replaces them.
- **Context on the server:** the job runs without an admin page open, so the module context
  (lesson titles, summaries, key points, `avoid_prompts`, built by `src/lib/examContext.js`) is
  uploaded by `scripts/sync-learning-catalog.mjs` with the catalog:
  `PUT /api/admin/learning/courses/{slug}/exam-context` `{modules:[context…]}` → stored per module.
- **Cost guard:** `EXAM_GEN_DAILY_CALL_LIMIT` (default 300 LLM calls/day across courses), one
  refill job per course at a time (advisory lock), tokens and calls logged per job.

### 6.3 Drafting: 5 questions per call

1. One Gemini call = **5 questions** (`EXAM_GEN_BATCH_SIZE`), structured JSON output
   (`response_mime_type: application/json` + response schema), temperature 0.3. Groq (JSON mode)
   only if Gemini is unavailable.
2. Each call targets **one or two lessons** of the module (rotating), a requested difficulty
   mix and `kind`s, and receives the **list of concepts already in the pool for those lessons**
   with the instruction "do not test these concepts again" (§6.5).
3. Each item: `prompt, options[4], correct_index, explanation, difficulty, kind
   (concept|scenario|code_output|spot_the_bug), lesson_id, concept, source_fact,
   why_others_wrong[3]`, and for code questions `code` + `expected_output`.
4. Parse defensively; one bad item is dropped, the rest continue. A failed or timed-out call is
   retried twice, then logged and skipped. Each batch is fully checked (§6.4, §6.5) before the
   next call, and the job stops for a module as soon as it reaches its target.

### 6.4 Automatic verification — the only gate before a question goes live

Every item must pass **all** of these to become `live`; anything else is `rejected` (with the
reason stored, never shown to learners).

| # | Check | Pass condition |
|---|---|---|
| 1 | Shape | 4 non-empty, distinct options; index 0–3; explanation + 3 `why_others_wrong`; no "all/none of the above" / "both A and B"; prompt ≤ 1,500 chars; longest option ≤ 3× shortest |
| 2 | Grounding | `source_fact` found in the module context (normalized substring, or ≥ 0.6 token overlap with one summary sentence/key point); `lesson_id` belongs to the module |
| 3 | Independent cross-check | The **other** model (Groq if Gemini drafted it, and vice versa), temperature 0, sees the questions **without the answers** and must, per question: pick the same option, say exactly one option is correct, report no version issue, confidence ≥ `EXAM_CHECKER_MIN_CONFIDENCE` (0.8). The 5 questions of a batch are checked in **one call** (answered independently, in shuffled order) to save calls |
| 4 | Second cross-check for hard and code questions | Same check run once more with a differently worded instruction; both runs must agree |
| 5 | Code really runs | For `code_output`/`spot_the_bug` in Python, Java, JavaScript, SQL: run through the existing execution services — call the same service functions behind `/api/compiler/execute` and `/api/java/run` directly, not over HTTP (SQLite for portable SQL), 5 s limit; real output must equal `expected_output` **and** the correct option's text. Runs count against `EXAM_CODE_RUN_DAILY_LIMIT` (the external compiler service has its own daily credits). Code that can't be run (HTML/CSS, PostgreSQL-only) is **not allowed as a code_output question** |
| 6 | Duplicates | §6.5 |
| 7 | Answer balance | options re-shuffled per batch so correct answers spread over A–D |

Stored on the question as `checks` jsonb (`{grounded, checker:[{model, answer, agrees,
single_correct, confidence}], executed:{ran, matches, output}, duplicate:{nearest_id,
similarity}}`) for auditing and the admin view.

### 6.5 No duplicate questions

Layered, from cheapest to strongest; a draft must clear every layer against **all
non-rejected questions in the course pool (live, quarantined, voided, retired)**, against the
public lesson quizzes (`avoid_prompts`), and against the other drafts in its own batch.

1. **Prevent at the source:** each call gets the concepts already covered for its lessons and
   must pick new ones; lessons rotate between calls, so a call never sees the same narrow
   material twice in a row.
2. **Exact duplicate:** `prompt_hash` = sha256(normalized prompt + normalized correct option);
   **unique index `(course_id, prompt_hash)`** — the database itself refuses a copy, even from
   two jobs racing.
3. **Near duplicate (wording):** token-set Jaccard of `prompt_norm` ≥ 0.8 → reject.
4. **Same meaning, different words:** embedding of prompt + correct option (Gemini embedding
   model, 768 dimensions — set the output dimensionality explicitly if the model's default
   differs), cosine similarity ≥ `EXAM_DUPLICATE_COSINE` (0.90) with any existing question →
   reject; ≥ `EXAM_DUPLICATE_COSINE_SAME_LESSON` (0.85) within the same lesson → reject too.
   Embed a batch's 5 drafts in one request.
5. **Same concept:** at most `EXAM_MAX_PER_CONCEPT` (2) questions per `(lesson_id, concept)`;
   and a single attempt never contains two questions with the same concept (4.2).
6. **Per learner:** a learner never gets a question they saw in an earlier attempt while unseen
   ones exist (4.2); a retake is a genuinely new paper.

### 6.6 The attempt cache (`AttemptCache`)

| Event | Cache |
|---|---|
| Start | **Created**: the drawn 30 with shuffled options, permutations, answer key, module titles |
| Refresh / resume (`GET` attempt) | **Read**: same 30, same order, same options; key never sent |
| Autosave | not touched (answers are on `exam_attempts`) |
| Submit, or time up (lazy or job) | Grade from the cache key → write compact `results` → **delete the cache**, one transaction |
| Server restarted / redeployed / woke from sleep | The per-user dictionary is empty; the next read loads the attempt from the table and refills it — the learner notices nothing |
| Abandoned | Orphan sweep deletes table rows and dictionary entries past their own `expires_at` |

**Lost attempt rule (crash recovery).** If an active attempt's cache cannot be found in
either layer (the dictionary is empty *and* the table row is missing — e.g. a crash during the
write, or the table was unavailable), the attempt is **cancelled and the learner starts again
from the beginning with a new set of questions**:
- the attempt gets `status = 'lost'`; it is **not a fail**: no cooldown, no `results`, no
  effect on question statistics. Its `question_ids` (kept on the attempt row) still count as
  seen, so the restart shows the learner none of the questions they already read;
- `GET` / `PUT answers` / `submit` on it return `409 attempt_lost`; the exam view shows no
  active attempt and `eligible: true`, so the learner can press Start again;
- the new attempt draws **new questions** and gets a **fresh 60-minute timer**;
- every lost attempt is logged with the reason, and an admin alert fires if more than 3
  attempts are lost in an hour (something is wrong with the server, not the learners).

**Keeping the server awake.** Render's free tier sleeps after ~15 minutes without requests,
and a learner may not click anything for that long. The exam page calls
`GET /api/learning/exam-attempts/{id}/ping` every 4 minutes while an attempt is active (also
returns `server_now` and `expires_at` to resync the timer). This keeps the instance up for the
whole exam, so "lost" stays rare; the backup table covers restarts that still happen
(deploys, crashes).

After deletion nothing but the compact record remains: which question ids, answered or not,
right or wrong, score. That record is what lets us regrade (§6.7), compute statistics and avoid
repeats — it holds no question text, options or answers.

### 6.7 After launch — the safety net (required because there is no human approval)

- **Report a question** during the exam ("wrong answer", "unclear", "typo" + comment):
  `POST /api/learning/exam-attempts/{id}/reports` → `exam_question_reports`. **Two reports
  → the question is automatically `quarantined`** (no longer drawn) and listed for an admin.
- **Statistics** (nightly, once a question has ≥ 30 answers): percent correct and
  discrimination (correlation of being right with the total score). **Negative discrimination
  (strong learners miss it more than weak ones — the sign of a wrong key) or < 15% correct →
  automatically quarantined.** > 98% correct is not an error, just too easy → `retired`.
- **Admin actions** on quarantined questions: restore to `live`, fix (edit re-runs §6.4–6.5
  and returns it to `live` only if it passes), or **void**.
- **Void and regrade:** every graded attempt that contained a voided question is regraded with
  that question removed from the total (from the compact `results`). Attempts that now reach
  70% are marked passed and receive a certificate (notification email); certificates already
  issued are never taken away. Voided questions are never drawn again.
- **Weekly report** to admins: pool size per course, generation reject rate by check, reports,
  quarantines and voids — a rising reject or void rate means the prompt needs work.

### 6.8a When AI tokens or quotas run out

Exams never depend on the AI: every question a learner sees comes from the pool in the
database, shuffled per attempt (question order, options). Running out of tokens only pauses
**refilling**.
- The refill job treats quota errors (HTTP 429, `RESOURCE_EXHAUSTED`, daily limit reached) as
  "pause": it stops for the day, records `paused_until` on the job, and resumes on the next
  scheduled run after that — no retries hammering the API.
- If Gemini is exhausted but Groq is not (or the reverse), drafting continues with the other
  model **only if** a different model is still available to cross-check; otherwise drafting
  pauses (the same model never checks its own questions).
- While paused, exams keep running. Each learner still gets questions they haven't seen while
  the pool has them; after that the draw falls back to the questions they saw longest ago,
  still in a new order with shuffled options. The weekly report and an admin alert show
  "pool low, refill paused".
- Imported seed questions (§6.8b) keep a course launchable even if the AI quota is gone.

**Seeing exhaustion coming (quota monitoring)**
- **Groq** returns its limits on every response: `x-ratelimit-limit-requests`,
  `x-ratelimit-remaining-requests` (per day), `x-ratelimit-limit-tokens`,
  `x-ratelimit-remaining-tokens` (per minute), `x-ratelimit-reset-requests`,
  `x-ratelimit-reset-tokens`, and `retry-after` on a 429. Store the latest values per model.
- **Gemini** does not return remaining quota in headers; every response has `usageMetadata`
  (`promptTokenCount`, `candidatesTokenCount`, `totalTokenCount`). Sum them per day and compare
  with the project's limits configured as `GEMINI_DAILY_TOKEN_LIMIT` / `GEMINI_DAILY_REQUEST_LIMIT`
  (copied from Google AI Studio → quota); a 429 `RESOURCE_EXHAUSTED` is the hard stop.
- Every call's tokens and those headers go into `exam_generation_logs` (already one row per call).
- `GET /api/admin/learning/exams/quota` →
  `{ "models": [{ "model", "provider", "used_today": {"requests", "tokens"}, "limit": {...},
  "remaining": {...}, "resets_at", "forecast_exhausted_at", "paused_until" }] }`, where
  `forecast_exhausted_at` = now + remaining ÷ (average use over the last hour).
- **Alerts:** at 80% of any daily limit the refill job slows to one batch per run and admins
  are notified; at 95% it pauses until the reset, keeping headroom for the cross-check of
  batches already drafted.
- **Planning numbers** (measured context: ~300 tokens per lesson, ≤ ~460): a drafting call is
  ~1.5k input + ~2k output ≈ **3.5k tokens**; a cross-check call (5 questions, no answers)
  ≈ **1.7k tokens**. Per course (~60 drafting, ~85 check calls): **~210k Gemini tokens and
  ~145k Groq tokens**; all 12 courses ≈ **2.5M Gemini + 1.7M Groq tokens**. Days to fill =
  those totals ÷ each model's daily token limit; calls per minute = per-minute token limit ÷
  call size.

### 6.8b Seed question bank (prepared offline, imported)

A course's pool can be pre-filled from a prepared file instead of (or before) the refill job,
so launch doesn't wait for AI quota.
- **Authoring:** the team writes questions in the Excel template
  `D:\WebnestSetudio\exam-bank\WebNest-exam-question-template.xlsx` (outside the git repo):
  one row per question — Lesson ID (dropdown of all 556 lessons; course and module fill in
  automatically), Difficulty, Type, Concept, Question (Markdown), Options A–D, Correct (A–D),
  Explanation, Code, Expected output, Source fact — with a live Check column and a Targets
  sheet showing how many questions each module still needs. Each row converts to one JSON
  line below (`Correct` A–D → `correct_index` 0–3; Module ID comes from the lesson).
- **File format for import:** JSON Lines, one question per line, same fields as a generated item:
  `{course_slug, module_id, lesson_id, concept, kind, difficulty, prompt, options[4],
  correct_index, explanation, why_others_wrong[3]?, source_fact?, code?, expected_output?}`.
  For hand-written seed questions `why_others_wrong` and `source_fact` are optional; without a
  `source_fact` the grounding check is skipped and the AI cross-check (when quota allows) is
  the main content check.
- **Import:** `POST /api/admin/learning/exam-questions/import` (multipart file or JSON array,
  ≤ 500 per request) → `{imported, rejected: [{line, reason}]}`. `source: "seed"`.
- **Course check on import:** `course_slug` must match the course the `lesson_id` actually
  belongs to, and `module_id` must be that lesson's module; otherwise the line is rejected
  (`reason: "course_mismatch"`) — a PostgreSQL question tagged `course_slug: core-java` never
  enters the Core Java pool. The AI refill job sets `course_id` from the module being filled,
  never from model output.
- **Checks on import:** shape (#1), grounding (#2), duplicates (§6.5) and code execution (#5)
  always run — they need no AI tokens except embeddings. The AI cross-check (#3/#4) runs if
  quota is available; if not, the question goes live as `source: "seed"` with
  `checks.checker = "skipped_no_quota"` and is cross-checked later by the refill job when quota
  returns (failing it then → quarantined).
- **Where the file lives:** the file contains the answers, so it must **not** be in any public
  repository or in the website's `src/` (anything under `src/` can end up in the browser
  bundle). Keep it in a private location (private repository or private storage) and delete
  local copies after import; the database is the system of record after that.

### 6.8 Data and endpoints this section adds

- `exam_questions` columns: see §3 (pool) plus `kind, source_fact, why_others_wrong jsonb,
  code, expected_output, checks jsonb, generator_model, reject_reason`.
- `exam_module_context`: `module_id` PK, `context jsonb`, `updated_at` (from the sync script).
- `exam_generation_jobs`: `id, course_id, trigger (enabled|replace|context_changed|admin), status,
  progress jsonb, calls, created, rejected (by check), started_at, finished_at`.
- `exam_question_reports`: `id, question_id, attempt_id, user_id, reason, comment, created_at,
  resolved_at, resolved_by`.
- `exam_question_stats`: `question_id, answered, correct, discrimination, updated_at`.
- Endpoints:
  - `PUT /api/admin/learning/courses/{slug}/exam-context` (sync script)
  - `PUT /api/admin/learning/courses/{slug}/exam` `{enabled, code}` (turning on starts the fill)
  - `POST /api/admin/learning/exams/{slug}/refill` (run a refill now) → `{job_id}`
  - `GET /api/admin/learning/exams/jobs/{job_id}`
  - `GET /api/admin/learning/exam-questions?course&status&module` (status includes `quarantined`)
  - `POST /api/admin/learning/exam-questions` (manual question; same checks before going live)
  - `POST /api/admin/learning/exam-questions/import` (seed file, §6.8b)
  - `GET /api/admin/learning/exams/quota` (AI usage, limits, forecast, §6.8a)
  - `PUT /api/admin/learning/exam-questions/{id}` (edit/restore), `POST .../{id}/void`
  - `GET /api/admin/learning/exam-questions/summary?course` → per module `{live, quarantined, target}`
  - `POST /api/learning/exam-attempts/{id}/reports`

## 7. Security and abuse

- Auth: learner routes use `get_current_user` (optional for the exam view); admin routes the
  admin dependency. Attempt and certificate list queries always filter by `user_id`.
- Rate limits (existing limiter, or a small in-memory/DB token bucket — no Redis in v1): start 5/hour, save 60/min,
  submit 10/min per user; public certificate GET 60/min per IP; PDF 20/min per IP.
- Response models: `QuestionView` has only `id, prompt, options, module_title`. A unit test
  serializes every learner/public response model and fails if `correct_index`, `explanation`
  or `answer` appear.
- Public certificate data: name, course, date, ID, status — no email, score or user id.
- Log `tab_switches`; flag attempts with >10 for admin review later (no automatic action).
- Audit log (or structured logs) for restore/void/enable/revoke/reissue with admin id.
- The answer key exists in only two places: the pool row and the attempt cache. The cache is
  deleted at grading, admin responses are the only ones that include `correct_index`, and the
  LLM prompts/responses stored in generation logs are admin-only.

## 8. Configuration

| Env var | Default | Purpose |
|---|---|---|
| `EXAM_QUESTION_COUNT` | 30 | Questions per attempt |
| `EXAM_DURATION_MINUTES` | 60 | Timer |
| `EXAM_PASS_PERCENT` | 70 | Pass mark |
| `EXAM_RETAKE_HOURS` | 24 | Wait after a fail |
| `EXAM_SUBMIT_GRACE_SECONDS` | 30 | Late submit window |
| `EXAM_POOL_TARGET` | 90 | Fixed pool of live questions per course (shared across modules by lesson count) |
| `EXAM_POOL_MIN_PER_MODULE` | 3 | Smallest share any module gets |
| `EXAM_GEN_BATCH_SIZE` | 5 | Questions per LLM call |
| `EXAM_GEN_DAILY_CALL_LIMIT` | 300 | LLM calls per day across all courses (cost guard) |
| `EXAM_CHECKER_MIN_CONFIDENCE` | 0.8 | Cross-check confidence required to go live |
| `EXAM_DUPLICATE_COSINE` | 0.90 | Embedding similarity at or above this = duplicate |
| `EXAM_DUPLICATE_COSINE_SAME_LESSON` | 0.85 | Stricter threshold within the same lesson |
| `EXAM_CODE_RUN_DAILY_LIMIT` | 150 | Code executions per day for verifying code questions |
| `EXAM_PING_INTERVAL_SECONDS` | 240 | Documented for the frontend's keep-awake ping |
| `EXAM_MAX_PER_CONCEPT` | 2 | Questions per lesson concept in the pool |
| `EXAM_MAX_SERVES` | 0 (off) | If set, a question served this many times is retired and replaced (costs tokens) |
| `EXAM_REPORTS_TO_QUARANTINE` | 2 | Learner reports that pull a question automatically |
| `CERTIFICATE_VERIFY_BASE_URL` | `https://www.webneststudio.co.in/certificates` | URL printed on the PDF / QR |
| existing LLM keys | — | Gemini / Groq for generation |

Return the first three in the exam view (`question_count`, `duration_minutes`, `pass_percent`)
so the frontend never hard-codes them.

## 9. Delivery phases

| # | Ships | Contents | Frontend effect |
|---|---|---|---|
| 1 | Progress on the server | `key` columns + migration, catalog upsert by key, `resolve_lesson`, `POST /progress/bulk`, exam view returning `enabled:false` | Site starts syncing completions; run `node scripts/sync-learning-catalog.mjs` once |
| 2 | Question pool | `exam_questions` (pool), `exam_module_context`, generation jobs, 5-per-call drafting, full automatic verification (§6.4) and duplicate guards (§6.5), fill job, admin pool endpoints | Sync script uploads module context; admin turns the exam on and watches the 90 fill (the exam appears to learners when ready) |
| 3 | Exams, cache, certificates **and the safety net** | `exam_attempts` + `exam_attempt_cache`, draw/grading, start/get/save/submit (cache created/deleted), lazy expiry + sweeps, certificates + PDF, revoke/reissue, **question reports, auto-quarantine, nightly statistics, void + regrade** | Turn a course on → card, exam, certificate pages go live |
| 4 | Hardening | Rate limits, audit log, weekly report, metrics (attempts/day, pass rate per course, avg score per module, reject rate by check), tab-switch review list | — |

The safety net is in phase 3, not 4: with no human approval it is what protects learners from a
wrong question, so it must be live on day one. Launch order: Java Core and Python first, then the
rest as their pools fill.

## 10. Tests (pytest)

**Pure domain** (`domain/`): draw quotas/redistribution/difficulty/unseen preference/seeded
determinism; grading through permutations, unanswered, exact 70% boundary (21/30 passes, 20/30
fails); validation rules and Jaccard threshold; certificate ID format and alphabet.

**Pool and verification** (fake LLM, checker, code runner and embedder): every LLM call asks
for 5; a failed call is retried twice then skipped without losing other batches; the refill
job stops at the target and respects the daily call limit; an ungrounded `source_fact`,
checker disagreement, confidence < 0.8, "more than one correct", or code output that differs
from the keyed option → rejected; drafter and checker are always different models; only
questions passing every check become `live`.

**Duplicates**: an exact copy is refused by the unique index even from two concurrent jobs;
Jaccard ≥ 0.8, cosine ≥ 0.90, a third question on the same concept, a repeat of a public
lesson-quiz question, or a duplicate inside the same batch → rejected; a learner's retake
contains no question from their earlier attempts while unseen ones exist; one attempt never
has two questions on the same concept.

**Cache**:
- start creates it; a refresh reads the same 30 in the same order; no response ever contains
  the key;
- empty dictionary (simulated restart) → read loads from the table and refills the dictionary;
  a second worker with its own dictionary serves the same attempt; a stale dictionary entry
  for a graded attempt is never served;
- both layers empty → attempt `lost` on get/ping/submit/start, `409 attempt_lost`, no
  cooldown; the next start draws new questions with a fresh 60 minutes; save on a lost
  attempt returns `attempt_lost`, not `attempt_closed`;
- submit deletes it in the grading transaction (a forced failure after grading rolls back
  both); expiry (job and lazy) deletes it; an expired attempt with no cache becomes `lost`;
  the orphan sweep removes stale rows and dictionary entries;
- after deletion the stored result and regrading still work from `results`.

**Safety net**: two reports quarantine a question; negative discrimination quarantines it;
quarantined questions are never drawn; voiding regrades affected attempts, issues certificates
to new passes and never revokes existing ones.

**Services** with in-memory fakes for every Protocol and a fixed `Clock`:
eligibility for each `reasons` value; start returns the existing active attempt; save rejected
after expiry; submit inside/after grace; double submit returns the same result and one
certificate; lazy expiry on get/view/start; fail → cooldown → start refused → allowed after 24h
with a different draw; reissue revokes old and keeps one valid certificate.

**Routers** (`TestClient` + `dependency_overrides`): every row of section 5 returns its status
and `code`; learner/public responses never contain answer fields; logged-out exam view; lesson
key and UUID both accepted on progress routes.

**Database** (against Postgres in CI): two concurrent `start` calls → one active attempt; two
concurrent `submit` calls → one certificate (partial unique + `FOR UPDATE`); expiry job with
`SKIP LOCKED` doesn't double-grade.

**End to end**: the frontend's Playwright flow (`CourseDetail` card → exam → result →
certificate → public verify) run against a staging backend once phase 3 is deployed.

## 11. Checklist

- [ ] Phase 1 migration + catalog sync by `key` + bulk progress + key-accepting lesson routes
- [ ] Run `node scripts/sync-learning-catalog.mjs` against production (admin env vars)
- [ ] Phase 2 pool tables + module context upload + 5-per-call drafting
- [ ] Verification (grounding, Groq/Gemini cross-check, code execution) and duplicate guards (hash, Jaccard, embeddings, concepts)
- [ ] Refill job + daily call limit; fill pools for Java Core and Python; spot-read a sample of live questions
- [ ] Phase 3 attempts + attempt cache (create/read/delete) + grading + certificates + PDF + sweeps
- [ ] Safety net: reports, auto-quarantine, nightly statistics, void + regrade
- [ ] Enable Java Core and Python; watch pass rate, reject rate by check and reports for a week
- [ ] Phase 4 hardening; enable remaining courses as their pools fill
- [ ] Answer the open decisions in §13 before phase 3 ships

## 12. Budget and capacity (estimate — confirm against current free-tier quotas)

Assumes about half of all drafts survive the checks; measure the real rate in the first week and
adjust `EXAM_GEN_DAILY_CALL_LIMIT`.

| Per course (90 live) | Calls | Tokens |
|---|---|---|
| Drafting: ~180 drafts ÷ 5 per call (Gemini) | ~36 | ~125k |
| Cross-check: one call per batch of 5 (Groq) | ~36 | ~60k |
| Second cross-check for hard/code questions (~40%) | ~15 | ~25k |
| Embeddings: one request per batch | ~36 | small |
| **Model calls per course** | **~120** | **~125k Gemini + ~85k Groq** |
| Code executions (~40% code questions) | ~70 | — |

- **All 12 courses:** ~1,450 model calls (~1.5M Gemini + ~1.0M Groq tokens) and ~850 code runs,
  **once**. At the default limits (300 calls/day, 150 code runs/day) that is roughly **5–6
  days**; Java Core and Python are ready in about a day each.
- **Per learner: 0 tokens.** Every exam is drawn from the stored 90.
- **After launch:** the AI only replaces quarantined, voided or too-easy questions — a handful
  of calls per week.
- **Storage:** pool rows with embeddings ≈ 10 KB each → ~11 MB for 1,080 questions; attempt
  cache ≈ 30 KB per running exam, deleted at grading. Fits the existing database.
- No paid service is required in v1 (no Redis; cache = in-memory dictionary + Postgres table).

## 13. Open decisions (need an answer before phase 3)

1. **Account deletion** (`DELETE /api/auth/me` exists): when a learner deletes their account,
   do their certificates stay verifiable (name kept as a public record), or are they revoked
   and the name removed? Attempts and reports should be deleted or anonymized either way.
2. **Certificate name changes:** reissue is admin-only today. Should learners be able to
   request a correction from the certificate page?
3. **Notification emails:** "certificate issued after a regrade" assumes the existing email
   sender can be reused for learners — confirm.
4. **Workers:** the in-memory dictionary is per process. Confirm how many uvicorn workers run on
   Render (the design works with any number, but one worker gives the best cache hit rate).
