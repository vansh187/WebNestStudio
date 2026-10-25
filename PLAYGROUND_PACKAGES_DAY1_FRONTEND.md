# CodeLab Playground Packages - Day 1 - Frontend Team

**Goal for today:**
- Every package that installs but can't connect from the browser says so honestly.
- We have a measured list of which packages work.
- The playground work so far is in a PR.
- **Supabase works through its REST API.**
- The **database connectors** for Postgres (Supabase/Neon), MySQL and MongoDB are designed and proven against a mock (F5-F7).

Background:
- The backend playground runs learner FastAPI code in a Pyodide web worker.
- Learners type `pip install …` in the Output tab's terminal (`src/lib/codelab/terminal.js` + `src/hooks/useBackendTerminal.js`). Packages install with micropip, are recorded in `requirements.txt`, and are reinstalled on every Run.
- Calls to payment APIs go through the backend relay (`src/workers/relayBridge.js`).

Today's problem: some packages **install fine but can never connect** from a browser:
- `redis` to a Redis server
- `psycopg2` / `asyncpg` to Postgres
- `pymysql`, `pymongo`

Learners get a raw `ConnectionError` and think the playground is broken.

Backend today: turn the relay on in production and verify it (see `PLAYGROUND_PACKAGES_DAY1_BACKEND.md`).

## Code rules (mandatory, same as the relay work)
1. **No `static` class members.** Use instance methods with dependencies passed to the constructor, or plain exported functions.
2. **Every function body is wrapped in `try/catch`** (Python: `try/except`).
   - Handle the specific case first.
   - `console.warn` with a short message, **never** a key, token, URL query or request body.
   - Fall back to the existing behaviour.
3. **Loose coupling.**
   - `terminal.js` stays pure: no React or worker code; unit-tested in Node.
   - The hook carries out actions.
   - The e2e suite talks to the page only through the UI.
4. Match the surrounding code: comment density, naming, no new dependencies.

---

## F1. Honest install hints

After a **successful** `pip install` of a package that can't connect from the browser, print one amber hint line under the result. Also print the hint after a **failed** install (e.g. `psycopg2` has no browser build), so the learner gets an alternative, not just an error.

### `src/lib/codelab/terminal.js` (pure)

```js
// Packages that install (or fail to) but can never reach their server from a browser,
// with what to use instead. Keys are normalised names (normalizeName).
const INSTALL_HINTS = {
  redis: 'A Redis server cannot be reached from the browser. Practise with fakeredis (pip install fakeredis), or use Upstash Redis over HTTPS.',
  'psycopg2': POSTGRES_HINT,
  'psycopg2-binary': POSTGRES_HINT,
  psycopg: POSTGRES_HINT,
  asyncpg: POSTGRES_HINT,
  pymysql: MYSQL_HINT,
  'mysql-connector-python': MYSQL_HINT,
  pymongo: MONGO_HINT,
  motor: MONGO_HINT,
  celery: 'Celery needs a broker and worker processes, which the browser cannot run. Use FastAPI BackgroundTasks instead.',
  uvicorn: 'Not needed here: Run (or uvicorn app.main:app) starts your API.',
  gunicorn: '…same as uvicorn…',
}
// Database drivers connect through WebNest's database proxy from Day 6 (F7). Until then:
// POSTGRES_HINT: 'Postgres (Supabase, Neon) cannot be reached directly from the browser yet. Use the playground
//   database (SQLite), or Supabase's REST API with requests. DATABASE_URL connections are coming this week.'
// MYSQL_HINT: 'MySQL cannot be reached directly from the browser yet. Use the playground database (SQLite)
//   to practise SQL. MYSQL_URL connections are coming this week.'
// MONGO_HINT: 'MongoDB cannot be reached directly from the browser yet. Practise with mongomock
//   (pip install mongomock). MONGODB_URI connections (Atlas) are coming this week.'
// Once the proxy is live (Day 6), these become: 'Connects through WebNest's database proxy. Put the
// connection string in .env and log in.'

// The hint for an installed or failed package, or ''.
export function installHint(spec) {
  try {
    return INSTALL_HINTS[normalizeName(requirementName(spec))] ?? ''
  } catch {
    return ''
  }
}
```

### `src/hooks/useBackendTerminal.js`

In the `install` helper, after the per-package result lines, call `print(hint, 'warn')` for each result (ok or failed) that has a hint. Print each hint once per command, even when a package is listed twice.

### Tests in `tests/terminal.test.mjs`
- `installHint('redis')`, `installHint('Redis==5.0')`, `installHint('psycopg2_binary')` return the hint (name normalisation).
- `installHint('humanize')` → `''`.
- `installHint('')` and `installHint(null)` → `''`.

**Done when:** `pip install redis` shows `Successfully installed redis-…`, then the amber hint. `pip install psycopg2` shows the C-code error, then the Postgres hint.

---

## F2. Package compatibility suite

A reusable e2e script that installs and smoke-tests representative packages in the real playground and records what happens. We run it today for a baseline and again on Day 7.

### Location and running
- `scripts/e2e/packages.mjs`. It must live inside `WebNestStudio/` so `playwright-core` resolves.
- Add a script to `package.json`: `"e2e:packages": "node scripts/e2e/packages.mjs"`.
- Run:
  ```bash
  npx vite build
  npx vite preview --port 4317 --strictPort      # second terminal
  npm run e2e:packages -- --base http://localhost:4317 [--isolate] [--json out.json]
  ```
  `vite preview` is used because the dev server fails on some machines.
- Browser: `chromium.launch({ channel: 'msedge', headless: true })`.
- `--isolate` opens `/codelab/playground?isolate=1` (the debugger's cross-origin-isolated page). Run both modes.
- **Relay cases** need a relay-enabled build (`VITE_CODELAB_RELAY=1`) and a logged-in session. Pass a refresh token of a **test account** through `E2E_REFRESH_TOKEN` and inject it with `context.addInitScript`, wrapped in `try/catch` because the sandboxed Preview iframe throws on `localStorage`. Without the token, relay cases are reported as `skipped`. Never commit the token.

### How it drives the page (reuse the pattern from earlier checks)
- Select `backend` in `select:has(option[value="backend"])`.
- Terminal input: `input[aria-label="Terminal command"]`; a command is done when the input is no longer `readOnly`.
- Output: `innerText` of `div.font-mono:has(input[aria-label="Terminal command"])`, sliced from the last `$ <command>`.

### Cases (one object per package: `{ name, group, install, smoke, expect }`)

| Group | Package | Smoke command (`python -c "…"`) | Expected today |
|---|---|---|---|
| Pure Python | `humanize` | `import humanize; print(humanize.intcomma(1234567))` → `1,234,567` | works |
| | `faker` | `from faker import Faker; print(bool(Faker().name()))` | works |
| | `pyjwt` | encode then decode `{'a': 1}` with HS256 | works (preloaded) |
| | `python-dotenv` | `from dotenv import dotenv_values; print(dotenv_values)` | works |
| | `marshmallow` | load a `Schema` with one `fields.Int()` | works |
| | `email-validator` | `validate_email('a@example.com', check_deliverability=False)` | works |
| | `fakeredis` | `set` / `incr` / `get` | works (confirm) |
| | `mongomock` | `insert_one` / `find_one` | works (confirm) |
| C code, Pyodide build | `numpy` | `numpy.arange(4).sum()` → `6` | works (CDN) |
| | `pandas` | build a 2-row DataFrame, print `len` | works (CDN) |
| | `pyyaml` | `yaml.safe_load('a: 1')` | works |
| | `pillow` | `Image.new('RGB', (2, 2)).size` | works |
| | `cryptography` | Fernet encrypt/decrypt round trip | works |
| C code, no build | `psycopg2` | none | install fails with the C-code message + hint |
| | `uvloop` | none | install fails |
| HTTPS (CORS-friendly) via `requests` | `requests` | `requests.get('https://httpbin.org/get').status_code` → `200` | works |
| HTTPS via `httpx` | `httpx` | `httpx.get('https://httpbin.org/get').status_code` | **fails today** (fixed Day 2) |
| Through the relay | `razorpay` | create an order with `('rzp_test_e2e', 'wrong')` → Razorpay `Authentication failed` (proves the relay reached Razorpay) | works (relay build + login) |
| | `stripe` | `stripe.api_key='sk_test_e2e'; stripe.Balance.retrieve()` → Stripe "Invalid API Key" | works (relay build + login) |
| Supabase (F5) | `requests` → Supabase REST | `requests.get(f"{SUPABASE_URL}/rest/v1/tasks?select=*", headers={'apikey': KEY, 'Authorization': f'Bearer {KEY}'}).status_code` → `200` | works (needs `E2E_SUPABASE_URL` and `E2E_SUPABASE_ANON_KEY`, else skipped) |
| | `supabase` | `create_client(URL, KEY).table('tasks').select('*').execute()` | installs; call fails today (httpx, fixed Day 2) |
| Raw connection | `redis` | `redis.Redis(socket_connect_timeout=2).ping()` | installs + hint; connect fails |
| | `pymysql` | `pymysql.connect(host='db.example.com', connect_timeout=2)` | installs + hint; connect fails (proxy Day 6) |
| | `mysql-connector-python` | `mysql.connector.connect(host='db.example.com', connection_timeout=2)` | installs (or fails) + hint; connect fails (proxy Day 6) |
| | `pymongo` | `MongoClient(serverSelectionTimeoutMS=2000).server_info()` | installs (or fails) + hint; connect fails (proxy Day 6) |
| | `psycopg2` with `DATABASE_URL` | none today | install fails + hint (proxy Day 6) |
| Server/process | `celery` | none | install fails or installs + hint (record which) |

Each case records:
- `installed`: yes / no
- `smoke`: pass / fail / skipped
- `hint`: shown / none
- `seconds`
- the last 300 characters of output on failure

The script **asserts** only the rows marked "works". Everything else is **recorded**, because finding out is the point. The exit code is non-zero if a "works" row fails.

Runtime: about 10-15 minutes per mode (installs of numpy and pandas dominate). Run the two modes one after the other, not in parallel.

---

## F3. `PACKAGE_SUPPORT.md`

Create `WebNestStudio/PACKAGE_SUPPORT.md` from the suite results:

```md
# What you can install in the CodeLab backend playground
Last measured: 2026-10-26 (normal + isolated page), commit <sha>.

| Package | Status | How to use it | If it can't connect, use |
|---|---|---|---|
| humanize | ✅ Works | pip install humanize | |
| numpy | ✅ Works (loaded from the Pyodide CDN) | pip install numpy | |
| razorpay | ✅ Works through the WebNest relay (test keys only, log in) | keys in .env | |
| httpx | ⚠️ Installs; outside calls fail until Day 2 | use requests for now | |
| redis | ⚠️ Installs, can't connect | | fakeredis, Upstash Redis REST |
| psycopg2 | ❌ Not available in the browser | | SQLite in the playground; Supabase REST |
…
```

Add a short "Why some packages can't connect" section (three cases: HTTPS APIs that allow browser calls work; HTTPS APIs that block them work only through the relay; raw database connections don't work from a browser), and link it from the terminal's `help`.

**Done when:** the file lists every suite package with its measured status, in both page modes.

---

## F4. Pull request

Open a PR from `feat/coding-platform` into `main`. It contains the terminal, `.env`, the relay frontend, the relay handoff docs and today's work.

- Title: `Backend playground: terminal, .env, payment API relay, package support`
- Description:
  - what learners can now do
  - the `VITE_CODELAB_RELAY` flag (off unless set at build time)
  - links to `CODELAB_API_RELAY_FRONTEND.md`, `CODELAB_API_RELAY_BACKEND.md` and `PACKAGE_SUPPORT.md`
  - test evidence: `npm test` count and the suite results
- There is no `gh` CLI on the dev machine. Open it on GitHub, or through the REST API with the stored git credential.

**Before opening:**
- [ ] `npm test` passes
- [ ] `npx oxlint` is clean on changed files
- [ ] `npx vite build` succeeds
- [ ] no `static` in new frontend files: `grep -rn "\bstatic\b" src/lib/codelab src/workers/relayBridge.js`
- [ ] no temporary e2e files left in the repo root (`.e2e-*.mjs`)

---

## Database connectors: Supabase, MySQL and MongoDB (F5-F7)

How each one connects, and when:

| Database | How learners connect | Works | Needs backend? |
|---|---|---|---|
| **Supabase, REST API** (`/rest/v1`, Auth, Storage) through `requests` | `SUPABASE_URL` + `SUPABASE_ANON_KEY` in `.env` | **Today** (F5) | No: Supabase allows browser calls |
| **Supabase, official `supabase` package** | same keys | Day 2 (httpx routing) | No |
| **Supabase / Neon Postgres** through `psycopg2` and `DATABASE_URL` | `DATABASE_URL` in `.env` | Day 6 | **Yes**: database proxy |
| **MySQL** through `pymysql` / `mysql.connector` | `MYSQL_URL` in `.env` | Day 6 | **Yes**: database proxy |
| **MongoDB Atlas** through `pymongo` | `MONGODB_URI` in `.env` | Day 6 | **Yes**: database proxy |

These drivers open raw TCP connections, which browsers can't make. The backend's **database proxy** (`PLAYGROUND_PACKAGES_DAY1_BACKEND.md` B5) runs each query for the playground. On our side, small built-in stand-ins for the drivers send the queries to the proxy, so learner code stays normal driver code.

### F5. Supabase through its REST API (works today)
1. **Verify** in the playground with a practice Supabase project. Ask the backend for its URL and **anon** key; they're creating it today in B5.5. `.env`:
   ```
   SUPABASE_URL=https://<ref>.supabase.co
   SUPABASE_ANON_KEY=<anon / publishable key>
   ```
   Then `pip install requests` and read and insert rows in a `tasks` table with Row Level Security policies that allow it. Check it on both the normal and the isolated (Debug) page.
2. **`.env` template** (`newFileTemplate('.env')` in `src/lib/codelab/backendFiles.js`): add commented examples for all of these, each with a one-line note:
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY`, plus the warning: **never** the `service_role` key, which bypasses Row Level Security and can be read in the browser
   - `DATABASE_URL`, `MYSQL_URL` and `MONGODB_URI`: "connects from Day 6, through WebNest's database proxy; use a practice database"
3. **Install hint:** `pip install supabase` adds "Until the next update, use requests with Supabase's REST API (see help)". Remove it on Day 2.
4. **Suite:** the two Supabase rows in F2, which run only when `E2E_SUPABASE_URL` and `E2E_SUPABASE_ANON_KEY` are set. Never commit those values.

**Done when:** reading and inserting through Supabase REST works on both page modes, and the template and hint are in place.

### F6. Draft the database proxy contract (backend reviews by Day 3)
Write `CODELAB_DB_PROXY_FRONTEND.md` and `CODELAB_DB_PROXY_BACKEND.md` in the same format as the relay docs:
- the shared Section 2 word for word in both
- sample requests and responses
- the error table with a `X-WebNest-DB-Error` header
- the security table
- try/except everywhere and no static methods

Start from the backend draft (B5.2 and B5.3) and add the frontend side:
- `POST /api/codelab/db/query` for `postgres`, `mysql` and `mongodb`, and `POST /api/codelab/db/test`, exactly as in B5.2
- **how drivers map to requests:**
  - `psycopg2` / `pymysql` / `mysql.connector`: each `cursor.execute(sql, params)` is one request, and rows come back to `fetchone`/`fetchall`/`fetchmany`. `commit()` and `rollback()` are accepted, with a one-time notice that each statement commits on its own (no multi-statement transactions in v1).
  - `pymongo`: `db.collection.find(...)`, `insert_one(...)` and the rest of the allowlisted operations each become one request; results come back as dicts, with `$oid` turned into `bson.ObjectId`.
- **errors as Python exceptions** of the driver's own types, so learner `try/except` keeps working:
  - `psycopg2.OperationalError` / `pymysql.err.OperationalError` / `pymongo.errors.ServerSelectionTimeoutError` for `db_connect_failed`
  - `ProgrammingError` for `db_query_error`
  - plus an amber terminal notice for refusals (`db_host_not_allowed`, `db_statement_blocked`, `db_rate_limited`, `db_login_required`)
- **frontend security:**
  - the connection string is read from `os.environ` at connect time and sent only to the proxy URL, never to any other host
  - never logged, never shown in notices: show the host domain only
  - the token is attached only to proxy requests, the same rule as the relay bridge

**Done when:** both drafts are shared with the backend.

### F7. Driver stand-in spike (proof only; nothing ships today)
Prove the two risky parts on a branch, against a tiny local mock proxy (the same idea as the relay e2e mock):

1. **Override real drivers.** If the learner has `pip install`ed the real `pymysql`, `pymongo` or `psycopg2-binary`, our stand-in must still win. Use a `sys.meta_path` finder in `src/workers/python/webnest_runtime.py`, active only when the matching `.env` variable (`DATABASE_URL`, `MYSQL_URL`, `MONGODB_URI`) points at an allowed host. Otherwise the real package loads as today.
2. **Synchronous calls from Python.** Driver code is synchronous (`cursor.execute`), so each query must block until the proxy answers. Use a synchronous XHR from Pyodide in the worker (allowed in workers; urllib3 already does it) with the WebNest token header. Measure the extra time per query against the mock.

Write the findings (works / doesn't, timings, problems) as a short note in the F6 frontend doc.

**Done when:** a learner-style script runs end to end against the mock proxy on both page modes:

```python
import os, pymysql
conn = pymysql.connect(os.environ["MYSQL_URL"])
cur = conn.cursor()
cur.execute("SELECT %s", (1,))
print(cur.fetchone())
```

and the same for `psycopg2` and `pymongo`.

---

## Security reminders for today
- The suite must never log or save `E2E_REFRESH_TOKEN`, cookies, `Authorization` headers or `.env` contents. Results files contain output tails only, so check none contain keys before committing.
- Use only fake or test keys in smoke commands (`rzp_test_e2e`, `sk_test_e2e`). They prove the request reached the provider without creating anything.
- Supabase: only ever use the **anon** key in the playground, suite or docs. The practice project's credentials come from the backend team's password manager and stay in environment variables.
- Hints must not suggest workarounds that leak secrets (for example, never "put your database password in frontend code").

## End-of-day checklist
- [ ] F1: hints in terminal, unit tests added, `npm test` green
- [ ] F2: `scripts/e2e/packages.mjs` + `npm run e2e:packages`, run in normal and isolated modes
- [ ] F3: `PACKAGE_SUPPORT.md` committed with measured results
- [ ] F4: PR opened and the link shared with the backend team
- [ ] F5: Supabase REST verified (both page modes); `.env` template with Supabase/MySQL/MongoDB examples and the `service_role` warning; `supabase` install hint
- [ ] F6: database proxy contract drafts (`CODELAB_DB_PROXY_FRONTEND.md` / `_BACKEND.md`) shared with backend
- [ ] F7: driver stand-in spike works against the mock proxy (`psycopg2`, `pymysql`, `pymongo`); findings written up
- [ ] Anything surprising in the suite (e.g. `fakeredis` or `mongomock` failing) noted for Day 2 planning

**Next (Day 2):** route `httpx` through the worker's XHR/fetch so httpx-based SDKs (official `supabase`, `openai`) can make outside calls, and through the relay where needed.

Later this week:
- **Day 3:** database proxy contract frozen with the backend
- **Day 5:** driver stand-ins built for real
- **Day 6:** connected to the deployed proxy for Supabase/Neon, MySQL and MongoDB Atlas, with e2e on practice databases
