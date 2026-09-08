# Coding Platform — Backend API Specification

> Hand-off document for the **backend team**. Pairs with `FRONTEND_CODING_PLATFORM.md`
> (same API contract — build in parallel).

## 1. Goal

Support a new in-browser coding platform on the WebNestStudio site:

- An **online compiler**: run user-submitted code in Java, Python, JavaScript and more, return output.
- **Saved projects**: authenticated users store code and resume later (with frequent autosave writes).
- **Share links**: immutable, public, read-only snapshots of code + its output.

First release = compiler + projects + share. Structured practice problems / submission grading are a later phase and are **not** specified here.

## 2. Conventions (keep consistent with the current backend)

- All endpoints under the existing base URL (frontend `VITE_API_BASE_URL` → `https://webneststudiobackend-n00h.onrender.com`).
- Auth: existing scheme — `Authorization: Bearer <accessToken>`, with the refresh-token flow already in place. New signups are role `client`; **any authenticated user** may use the coding features (no new role needed).
- Error responses unchanged:
  - General: `{ "detail": "human readable message" }` with an appropriate 4xx/5xx.
  - Validation: `422` with `{ "errors": [{ "loc": ["body", "field"], "msg": "..." }] }` (the frontend maps `loc`/`msg` to form fields).
- CORS must allow the site origin(s) (prod domain + any preview/localhost used).
- Timestamps ISO-8601 UTC.

## 3. Endpoint overview

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/compiler/languages` | public | supported languages/versions |
| POST | `/api/compiler/execute` | public, **rate-limited** | run code |
| GET | `/api/projects` | required | list caller's projects (paginated) |
| POST | `/api/projects` | required | create |
| GET | `/api/projects/:id` | required, owner | fetch one |
| PUT | `/api/projects/:id` | required, owner | partial update (**autosave**) |
| DELETE | `/api/projects/:id` | required, owner | delete |
| POST | `/api/shares` | required | create immutable snapshot |
| GET | `/api/shares/:shareId` | public | fetch snapshot |
| GET | `/api/me/coding-stats` | required | *(optional)* dashboard counts |

## 4. Languages

### `GET /api/compiler/languages` — public

Returns the list the compiler UI renders in its language picker.

```json
[
  {
    "id": "python",
    "label": "Python 3",
    "version": "3.12.0",
    "monacoId": "python",
    "fileExtension": "py",
    "defaultSnippet": "print(\"Hello, World!\")"
  },
  {
    "id": "javascript",
    "label": "JavaScript (Node)",
    "version": "20.11.1",
    "monacoId": "javascript",
    "fileExtension": "js",
    "defaultSnippet": "console.log(\"Hello, World!\");"
  },
  {
    "id": "java",
    "label": "Java",
    "version": "21.0.2",
    "monacoId": "java",
    "fileExtension": "java",
    "defaultSnippet": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, World!\");\n  }\n}"
  }
]
```

- `id` — stable slug the frontend sends back in `execute` / project `language`.
- `monacoId` — Monaco Editor language id for syntax highlighting (`python`, `javascript`, `java`, `c`, `cpp`, `typescript`, `go`, `ruby`, …).
- `defaultSnippet` — starter "Hello, World!" shown when a user picks the language.
- Suggested initial set: JavaScript (Node), Python 3, Java, C, C++, TypeScript, Go, Ruby. Expand freely — the engines below support 40–60+.

## 5. Execute code

### `POST /api/compiler/execute` — public, rate-limited

The core endpoint. Runs code in a sandbox and returns the result **synchronously**.

**Request**

```json
{
  "language": "python",
  "version": "3.12.0",
  "files": [{ "name": "main.py", "content": "print(input())" }],
  "stdin": "hello\n",
  "args": []
}
```

- `language` (required) — an `id` from `/api/compiler/languages`.
- `version` (optional) — if omitted, use the language's default.
- `files` (required) — array of `{ name, content }`. The frontend MVP always sends exactly one file; design for N. Accept a `source` string as an alias for a single unnamed file if convenient.
- `stdin` (optional) — string piped to the program's standard input.
- `args` (optional) — command-line arguments.

**Response — HTTP 200 whenever execution actually ran** (compile errors and runtime errors are 200 with a `status`; reserve non-200 for rate limiting, malformed requests, and infrastructure failures):

```json
{
  "status": "success",
  "stdout": "hello\n",
  "stderr": "",
  "exit_code": 0,
  "signal": null,
  "compile": { "stdout": "", "stderr": "", "exit_code": 0 },
  "time_ms": 38,
  "wall_time_ms": 140,
  "truncated": false
}
```

- `status` ∈ `success | compile_error | runtime_error | timeout | rate_limited | internal_error`
  - `compile_error` — compilation failed (details in `compile.stderr`); `stdout`/`stderr` empty.
  - `runtime_error` — program ran and exited non-zero or was killed by a signal.
  - `timeout` — CPU or wall-clock limit hit; return whatever partial `stdout` was captured.
- `compile` — object for compiled languages (Java, C, C++, Go, TypeScript…); `null` for interpreted ones.
- `signal` — signal name/number if the process was killed, else `null`.
- `time_ms` — CPU time of the program run; `wall_time_ms` — total wall time including queue/compile.
- `truncated` — `true` if `stdout` or `stderr` was cut at the cap.

**Non-200 cases**

- `429` when rate-limited: `{ "detail": "Too many runs, try again in a minute." }` (frontend also accepts a 200 with `status: "rate_limited"` — pick one and document it).
- `422` for validation (`language` unknown, missing `files`, oversized payload).
- `413` if the body exceeds the size cap.
- `503` for engine unavailable (the frontend retries `503` once automatically).

### 5.1 Sandbox requirements (hard requirements — the platform is publicly runnable)

| Limit | Value (tune as needed) |
|---|---|
| CPU time per run | ~5 s |
| Wall time per run | ~10 s (kill + clean up on exceed) |
| Memory | ~256 MB |
| Processes / threads | capped (e.g. 64) |
| Output per stream | ~64 KB, then stop capturing and set `truncated` |
| Request body / total source | ~128 KB (reject larger) |
| Filesystem | ephemeral, isolated per run, wiped after |
| **Network from executed code** | **disabled** |
| Concurrency | bounded worker pool + queue; shed load with `503` rather than melting |

Rate limits:

- Anonymous (per client IP): ~20 runs/min, ~200/day.
- Authenticated (per user): ~120 runs/min.
- Consider a small global ceiling to protect the box.

Also: log executions for abuse investigation (see `coding_executions` in §9); never echo the raw client IP back in responses.

### 5.2 Execution engine — JDoodle (in use)

The frontend only calls `/api/compiler/execute` and expects §5's contract. The runtime
engine is the **hosted JDoodle Compiler API** (`https://api.jdoodle.com/v1/execute`).

Env vars (backend only — never expose the secret to the client):

```text
JDOODLE_CLIENT_ID=...
JDOODLE_CLIENT_SECRET=...
```

When these are unset, `/api/compiler/execute` returns `503` with
`{ "detail": "Compiler engine is not configured." }` (frontend shows a user-friendly
message and does **not** retry).

**Request mapping** — JDoodle takes a single `script` string, not a files array:

| Our request | JDoodle request |
|---|---|
| `source` (or `files[0].content` flattened) | `script` |
| `language` (our id) | `language` (JDoodle id) + `versionIndex` — keep a lookup table |
| `stdin` | `stdin` |
| — | `clientId`, `clientSecret` |

Multi-file is not supported on the standard JDoodle plan — flatten `files` to the first
file's content. `args` is not supported — ignore it (or prepend to `stdin` if needed).

**Response mapping** — JDoodle returns one combined `output` stream (no separate
stdout/stderr, no exit code/signal):

| JDoodle field | Our field |
|---|---|
| `output` | `stdout` (put the whole thing here; on a compile failure, move it to `compile.stderr` and leave `stdout` empty) |
| `cpuTime` (seconds, string) | `time_ms` = `round(cpuTime * 1000)` |
| `memory` | pass through as `memory` (optional, non-contract) |
| `compilationStatus == 0` | `status = "compile_error"`, `compile = { stderr: output, exit_code: 1 }` |
| `statusCode == 429` or `error` ~ "limit reached" | `status = "rate_limited"` → return HTTP **429** `{ "detail": "..." }` |
| `error` present (auth / credits / bad request) | `status = "internal_error"` → HTTP **503** |
| JDoodle signals a non-zero program exit | `status = "runtime_error"`, `exit_code = 1` |
| otherwise | `status = "success"`, `exit_code = 0` |

Set `stderr: ""`, `signal: null`, `wall_time_ms` = measured round-trip, `truncated` per §5.1 caps.
The frontend has a matching `normalizeExecuteResult()` as a fallback, but the backend
should still emit the canonical shape.

**JDoodle limits to be aware of:** the free tier is ~200 executions/day total (across all
users) — track usage and surface a clear message when exhausted; a per-user rate limit
(§5.1) on top protects the shared quota. JDoodle itself has no cold start; the Render
free-tier **API** process still does (~30–50 s first request), which the frontend already
handles with a "waking up" banner + `wakeServer()` prefetch.

## 6. Projects

Owner-scoped. All require auth. `:id` not owned by the caller → `404` (preferred) or `403`.

### `GET /api/projects?limit=&cursor=`

```json
{
  "items": [
    { "id": "prj_a1b2", "title": "Fibonacci", "language": "python",
      "updated_at": "2026-09-08T10:12:00Z", "created_at": "2026-09-01T09:00:00Z" }
  ],
  "next_cursor": null
}
```

- `limit` default 20, max 100. Cursor-based or offset pagination — return `next_cursor` (null when done). Order by `updated_at` desc.

### `POST /api/projects`

Request:

```json
{ "title": "Fibonacci", "language": "python",
  "files": [{ "name": "main.py", "content": "..." }], "stdin": "" }
```

- Accept `source` (string) as an alias for `files: [{ name: "<default>", content }]`.
- `title` 1–80 chars; `language` must be a known id.
- Enforce a per-user project cap (e.g. 100) → `422`/`403` with `detail`.

Response: the full project object (below), `201`.

### `GET /api/projects/:id`

Full project object:

```json
{
  "id": "prj_a1b2",
  "title": "Fibonacci",
  "description": "",
  "language": "python",
  "files": [{ "name": "main.py", "content": "..." }],
  "stdin": "",
  "is_public": false,
  "share_id": null,
  "created_at": "2026-09-01T09:00:00Z",
  "updated_at": "2026-09-08T10:12:00Z"
}
```

### `PUT /api/projects/:id` — autosave target

Partial update. Any subset of:

```json
{ "title": "...", "description": "...", "language": "...",
  "files": [{ "name": "main.py", "content": "..." }], "stdin": "..." }
```

- Called frequently (debounced ~1.5 s while typing). Must be cheap: update only provided fields, bump `updated_at`. Idempotent.
- Return the updated full project object (or `200` with it).
- Validate `files` size against the per-project cap (~256 KB total).

### `DELETE /api/projects/:id`

`204` on success. Deleting a project does **not** delete shares already created from it (shares are independent snapshots).

## 7. Shares (immutable snapshots)

### `POST /api/shares` — auth required

Request:

```json
{
  "project_id": "prj_a1b2",
  "title": "Fibonacci",
  "language": "python",
  "files": [{ "name": "main.py", "content": "..." }],
  "stdin": "",
  "stdout": "0 1 1 2 3 5 8\n"
}
```

- `project_id` optional (link back for analytics); everything else is copied into the snapshot at creation time.
- Accept `source` alias for single-file.
- `stdout` optional — the captured output at share time, shown read-only on the share page.

Response:

```json
{ "share_id": "s7Kq2mA9", "url": "/s/s7Kq2mA9" }
```

- `share_id` — short, URL-safe, unguessable (≥ 8 chars random). `url` is a site-relative path; the frontend prepends the origin.
- Optional per-user creation rate limit (e.g. 60/hour).

### `GET /api/shares/:shareId` — public

```json
{
  "share_id": "s7Kq2mA9",
  "title": "Fibonacci",
  "language": "python",
  "files": [{ "name": "main.py", "content": "..." }],
  "stdin": "",
  "stdout": "0 1 1 2 3 5 8\n",
  "created_at": "2026-09-08T10:20:00Z",
  "author_display_name": "Vansh"
}
```

- Immutable: editing the source project later does **not** change this snapshot.
- `author_display_name` optional; omit if you don't want to expose it. No emails.
- Unknown id → `404` `{ "detail": "Share not found." }`.

## 8. Contract quick-reference (must match the frontend `src/api/coding.js`)

```
GET    /api/compiler/languages
POST   /api/compiler/execute      { language, version?, files:[{name,content}]|source, stdin?, args? }
                                  -> { status, stdout, stderr, exit_code, signal, compile|null, time_ms, wall_time_ms, truncated }
GET    /api/projects?limit=&cursor=   -> { items:[{id,title,language,updated_at,created_at}], next_cursor }
POST   /api/projects              { title, language, files|source, stdin? }        -> project
GET    /api/projects/:id                                                            -> project
PUT    /api/projects/:id          { title?, description?, language?, files?, stdin? } -> project
DELETE /api/projects/:id                                                            -> 204
POST   /api/shares                { project_id?, title?, language, files|source, stdin?, stdout? } -> { share_id, url }
GET    /api/shares/:shareId                                                         -> share snapshot

project  = { id, title, description, language, files:[{name,content}], stdin, is_public, share_id, created_at, updated_at }
status   = success | compile_error | runtime_error | timeout | rate_limited | internal_error
errors   = general { detail }  |  validation 422 { errors:[{loc,msg}] }
```

## 9. Suggested data model

- **`coding_projects`**: `id` (pk), `owner_user_id` (fk, indexed), `title`, `description`, `language`, `stdin`, `is_public` (bool, default false), `share_id` (nullable — most recent share), `created_at`, `updated_at`.
- **project files**: JSON column `files` on `coding_projects` **or** a **`coding_project_files`** table (`project_id` fk, `name`, `content`, `ordinal`). JSON is simplest for the single-file MVP.
- **`coding_shares`**: `id` (pk), `share_id` (unique, indexed), `project_id` (nullable fk), `owner_user_id` (nullable fk), `title`, `language`, `files` (JSON), `stdin`, `stdout`, `created_at`. Rows are immutable after insert.
- **`coding_executions`** *(optional, for rate-limiting + abuse)*: `id`, `user_id` (nullable), `ip_hash`, `language`, `status`, `time_ms`, `created_at`. Prune periodically.

## 10. Optional — `GET /api/me/coding-stats`

```json
{ "projects_count": 7, "last_activity_at": "2026-09-08T10:12:00Z" }
```

Used for a dashboard header. Not required for launch.

## 11. Build checklist

- [ ] `GET /api/compiler/languages` returns the agreed set with `monacoId` + `defaultSnippet`.
- [ ] `POST /api/compiler/execute` wired to JDoodle (§5.2 mapping) with `JDOODLE_CLIENT_ID`/`SECRET` set, §5.1 limits enforced; returns the canonical response shape and `status` values, and a clear message when the daily JDoodle quota is exhausted.
- [ ] Anonymous + authenticated rate limits in place; `429`/`503` behave as documented.
- [ ] Executed code has **no network access** and cannot escape the sandbox or see other runs.
- [ ] Projects CRUD, owner-scoped, with cheap frequent `PUT` for autosave and a per-user cap.
- [ ] Shares: immutable snapshots, unguessable ids, public `GET`, no PII beyond optional display name.
- [ ] CORS allows the site origin(s); errors use the existing `{ detail }` / `422 { errors }` shapes.
- [ ] Execution service runs always-on (not on a cold-starting free tier).
