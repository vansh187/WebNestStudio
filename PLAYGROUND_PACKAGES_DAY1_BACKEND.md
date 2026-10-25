# CodeLab Playground Packages - Day 1 - Backend Team

**Goal for today:** the API relay is live in production, verified with a real logged-in call, and the relay code is ready for the relay v2 contract that arrives on Day 3. Groundwork for the **database proxy** (Supabase/Postgres, MySQL, MongoDB) is in place (B5).

Background:
- The CodeLab backend playground runs learner FastAPI code in the browser (Pyodide).
- Learners can now `pip install` packages from a terminal and keep API keys in `.env`.
- Payment APIs (Razorpay, Stripe, PayPal sandbox) are reached through the relay you deployed (`CODELAB_API_RELAY_BACKEND.md`).
- This week we widen what learners can connect to:
  - httpx-based SDKs (Day 2, frontend)
  - relay v2: Supabase, Upstash, OpenAI, Twilio, SendGrid (Days 3-4)
  - a Postgres database proxy for Supabase and Neon (Days 3-5)

Frontend today: install hints, a package compatibility suite and the PR (see `PLAYGROUND_PACKAGES_DAY1_FRONTEND.md`).

---

## B1. Turn the relay on in production

The frontend only relays when it was **built** with the flag on.

1. Vercel → WebNest project → Settings → Environment Variables → add:
   - `VITE_CODELAB_RELAY` = `1` (Production and Preview)
2. Redeploy. The flag is read at build time, so an existing build won't pick it up.
3. Open `https://www.webneststudio.co.in/codelab/playground`, log in, choose **Python Backend**, open the Output tab and type `relay`.

**Expected:**

```
Relay: on · 30 calls left this minute · 300 today
  Razorpay           api.razorpay.com           test keys: Use a test key that starts with rzp_test_
  Stripe             api.stripe.com             test keys: Use a secret key that starts with sk_test_
  PayPal (sandbox)   api-m.sandbox.paypal.com   sandbox only
Use test keys from your .env file. Live keys and live hosts are always refused.
```

**Done when:** `relay` shows "Relay: on" with your quota on the production site.

## B2. Logged-in relay checks (real Razorpay test mode)

In the same playground:

1. **New file** → `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   ```
   Use a Razorpay **test** key pair from Dashboard → Test mode → API Keys.
2. In the terminal:

| Command | Expected |
|---|---|
| `pip install razorpay` | `Successfully installed razorpay-…` |
| `python -c "import os, razorpay; c = razorpay.Client(auth=(os.environ['RAZORPAY_KEY_ID'], os.environ['RAZORPAY_KEY_SECRET'])); print(c.order.create({'amount': 50000, 'currency': 'INR'}))"` | A real test order: `{'id': 'order_…', 'status': 'created', …}`. The first call can take ~60 s on a Render cold start |
| The same command with `auth=('rzp_test_abc', 'wrong')` | Razorpay's own `Authentication failed` error, with **no** amber `Relay:` line (upstream errors pass through) |
| The same command with `auth=('rzp_live_abc', 'x')` | Amber line `Relay: Live keys are blocked in CodeLab…`. **No call reaches Razorpay** (confirm in B3) |
| `python -c "import requests; print(requests.get('https://api-m.paypal.com/v1/x').status_code)"` | Fails. The live PayPal host is not relayed, so the browser blocks it. **No WebNest token is sent anywhere** |

3. Log out, then repeat the order command → amber line `Relay: Log in to WebNest…`.

**Done when:** every row behaves as listed. Record the results in the PR or Slack thread.

## B3. Relay health check in Render logs

For the B2 calls, check the Render logs.

**Must be logged:** user id, provider id, method, path **without** query string, status, byte count, duration.

**Must never appear in logs:**
- the `Authorization` header or any `Basic …` / `Bearer …` value
- the `X-WebNest-Authorization` value
- request or response bodies
- query strings
- anything matching `rzp_`, `sk_test_`, `sk_live_`

Also confirm:
- [ ] The live-key call from B2 has **no** outgoing request to `api.razorpay.com`. It was refused before the network call.
- [ ] Response headers on relay calls include `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`.
- [ ] Refusals include `X-WebNest-Relay-Error` and it's exposed to the browser (`Access-Control-Expose-Headers`).
- [ ] The daily usage row for your user increased (`codelab_relay_daily_usage`).

A quick check from any terminal (no login needed):

```bash
curl -i https://webneststudiobackend-n00h.onrender.com/api/codelab/relay/providers
curl -i -X POST https://webneststudiobackend-n00h.onrender.com/api/codelab/relay/api.razorpay.com/v1/orders \
  -H "Origin: https://www.webneststudio.co.in" -H "Content-Type: application/json" -d '{"amount":100}'
# expected: 401, X-WebNest-Relay-Error: relay_login_required
curl -i -X OPTIONS https://webneststudiobackend-n00h.onrender.com/api/codelab/relay/api.razorpay.com/v1/orders \
  -H "Origin: https://evil.example.com" -H "Access-Control-Request-Method: POST"
# expected: refused, no Access-Control-Allow-Origin
```

**Done when:** all boxes are ticked. Any key or token found in logs is a **stop-ship**: fix it, then rotate the test key.

## B4. Get the relay ready for v2 (contract arrives Day 3)

Relay v2 adds new rule types and providers. Review the current code against this list and send the frontend team a short note today. No code changes are needed yet.

| v2 feature | What to check in the current relay |
|---|---|
| **Wildcard hosts** (`host_suffixes: [".supabase.co", ".upstash.io"]`, one subdomain level only) | `ProviderRegistry.for_host` and `TargetParser` assume exact hosts. Where would suffix matching go? It must stay exact-match first, reject IP literals and reject deeper subdomains (`a.b.supabase.co`) |
| **`no_admin_key` rule** (refuse a Supabase JWT whose `role` is `service_role`) | `TestModeRuleFactory` can take a third rule type without touching `RelayService` |
| **`paid_key` rule + per-provider daily cap** (OpenAI, Twilio, SendGrid) | The limiter can count **per user per provider** as well as per user. Can `codelab_relay_daily_usage` take a `provider_id` column (migration)? |
| **Header-key credentials** (`x-api-key`, `api-key`, `apikey`) | `LivePatternScanner` scans all forwarded header values (it should already) |
| **New response header** `X-WebNest-Relay-Paid: 1` | `build_response` can add per-provider headers, and CORS exposes it |
| **Registry growth** | Providers still load from JSON with validation at startup; new entries can ship `enabled: false` |

Also check the coding rules are still met (they apply to all v2 work):
- [ ] `grep -rn "staticmethod" app/codelab_relay` returns nothing
- [ ] every function body in routers, services, rules, stores and clients has `try/except`, logs with context (never keys), and re-raises a domain error
- [ ] services depend only on `Protocol` interfaces; concrete classes are built only in `dependencies.py`

**Done when:** a note (Slack or a reply in the PR) lists any blocker for the v2 items above, with a rough estimate for each.

## B5. Database connectors: Supabase (Postgres), MySQL and MongoDB

**Why:** learners write normal driver code and keep the connection string in `.env`:
- `psycopg2.connect(os.environ["DATABASE_URL"])`
- `mysql.connector.connect(...)`
- `pymongo.MongoClient(os.environ["MONGODB_URI"])`

These drivers open raw TCP connections, which a browser cannot do, so the request has to go through our server: the **database proxy**. The playground sends one query over HTTPS, the proxy connects to the learner's database, runs it with strict limits and returns rows as JSON.

**Schedule:** today is groundwork: test databases, network checks, the module skeleton and contract review. Working connections land Day 5-6. The frontend sends the full contract (`CODELAB_DB_PROXY_BACKEND.md` / `_FRONTEND.md`) by Day 3, based on the draft below.

### B5.1 What each database needs

| Engine | Learner's `.env` | Hosts the proxy may connect to (draft allowlist) | Driver on the server | Notes to confirm today |
|---|---|---|---|---|
| **Supabase (Postgres)** | `DATABASE_URL=postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres` | `*.pooler.supabase.com`, `db.*.supabase.co` | `psycopg` (v3) | Supabase's direct host (`db.<ref>.supabase.co`) is **IPv6 only** on many plans. Check whether Render can reach IPv6. If not, support the **pooler** host only (IPv4) and say so in the learner hint |
| **Neon (Postgres)** | `DATABASE_URL=postgresql://…@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | `*.neon.tech` | `psycopg` | TLS required |
| **MySQL** | `MYSQL_URL=mysql://user:pw@host:port/db` | `*.aivencloud.com`, `*.tidbcloud.com`, `*.psdb.cloud` (PlanetScale) | `PyMySQL` | Create the connection with **`local_infile=False`**. TLS required |
| **MongoDB Atlas** | `MONGODB_URI=mongodb+srv://user:pw@cluster0.xxxx.mongodb.net/db` | `*.mongodb.net` | `pymongo` | Atlas only allows listed IP addresses. Render's free tier has **no fixed outbound IP**, so learners would have to allow `0.0.0.0/0`. Decide today: paid static outbound IPs, or document `0.0.0.0/0` for **practice clusters only**. The SRV lookup returns several hosts, and **every** host must also match `*.mongodb.net` |

### B5.2 Draft API (the final version comes in the contract doc)

All calls need `X-WebNest-Authorization: Bearer <WebNest token>`.

`POST /api/codelab/db/query`, SQL engines:

```json
{
  "engine": "postgres",
  "url": "postgresql://postgres.abcd:secret@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
  "sql": "SELECT id, title FROM tasks WHERE done = %s ORDER BY id LIMIT 10",
  "params": [false]
}
```

200:

```json
{ "columns": ["id", "title"], "rows": [[1, "Learn FastAPI"]], "row_count": 1, "truncated": false, "ms": 84 }
```

Same shape with `"engine": "mysql"`. A write returns `{ "columns": [], "rows": [], "row_count": 3 }` (rows affected).

`POST /api/codelab/db/query`, MongoDB:

```json
{
  "engine": "mongodb",
  "url": "mongodb+srv://learner:secret@cluster0.ab12c.mongodb.net/shop",
  "database": "shop",
  "collection": "orders",
  "operation": "find",
  "filter": { "status": "paid" },
  "options": { "limit": 20, "sort": [["created_at", -1]] }
}
```

200:

```json
{ "documents": [{ "_id": { "$oid": "6719f0c2e4b0a1b2c3d4e5f6" }, "status": "paid", "amount": 500 }], "count": 1, "truncated": false, "ms": 61 }
```

Documents use MongoDB Extended JSON (`$oid`, `$date`).

`POST /api/codelab/db/test` with `{ "engine", "url" }` → `{ "ok": true, "server_version": "16.4" }`, used by the playground's "Test connection".

Draft error codes (same style as the relay; header `X-WebNest-DB-Error`):

| HTTP | code | When |
|---|---|---|
| 401 | `db_login_required` | WebNest login missing |
| 400 | `db_bad_url` | The URL can't be parsed, or its scheme doesn't match `engine` |
| 403 | `db_host_not_allowed` | Host not in the allowlist, or it resolves to a private IP |
| 403 | `db_statement_blocked` | A blocked statement, function or operation (B5.3) |
| 408 | `db_timeout` | The statement ran longer than 10 s |
| 413 | `db_result_too_large` | More than 500 rows/documents or 2 MB (also returns `truncated: true` up to the cap) |
| 429 | `db_rate_limited` | Per-user limit (draft: 60 queries/min, 1,000/day) |
| 502 | `db_connect_failed` | Wrong password, database down, TLS failure. Carries the database's **own** message with the password removed |
| 422 | `db_query_error` | SQL or query error from the database (message passed through, password removed) |

### B5.3 Security rules (draft, all mandatory)
- **No SSRF:**
  - exact host allowlist per engine; ports 5432/6543 for Postgres, 3306/4000 for MySQL, 27017 for Mongo
  - no IP literals
  - resolve DNS and refuse any private, loopback, link-local or reserved IP, including every host from a Mongo SRV lookup
- **TLS required** for every engine. Never fall back to plain text.
- **Credentials:** the URL is used for that one request and then discarded. **Never logged, stored, cached or echoed.** Strip the password from every error message before it's returned or logged. A connection is opened per request and closed in `finally`; no pooling across users.
- **Limits:**
  - 10 s statement timeout: Postgres `SET statement_timeout`; MySQL `max_execution_time` plus a socket read timeout; Mongo `maxTimeMS`
  - 500 rows/documents and a 2 MB response cap
  - SQL text at most 20 KB
  - one statement per request: reject `;`-separated batches
- **Blocked statements and operations:**
  - **Postgres:** `COPY … PROGRAM`, `COPY … TO/FROM` a file, `pg_read_file`, `pg_read_binary_file`, `pg_ls_dir`, `lo_import`/`lo_export`, `dblink`, `CREATE EXTENSION`, `ALTER SYSTEM`, `CREATE/ALTER ROLE`
  - **MySQL:** `LOAD DATA`, `SELECT … INTO OUTFILE/DUMPFILE`, `LOAD_FILE()`, `SET GLOBAL`, `GRANT`, `CREATE USER`, `INSTALL PLUGIN`
  - **MongoDB:** only allowlisted operations: `find`, `find_one`, `insert_one`, `insert_many`, `update_one`, `update_many`, `delete_one`, `delete_many`, `count_documents`, `aggregate`, `list_collection_names`. In `aggregate`, block `$out`, `$merge`, `$function`, `$accumulator` and `$where`. No `command` / `runCommand`, no admin database
- **Login and limits:** WebNest login is required; per-user rate limits; a kill switch `DB_PROXY_ENABLED`.
- **Logs:** user id, engine, host **domain only** (e.g. `pooler.supabase.com`), operation or statement type (`SELECT`/`INSERT`…), status, ms, row count. Never the URL, the SQL text, params or documents.

### B5.4 Module layout (same rules as the relay)

```
app/codelab_db/
  router.py  schemas.py  errors.py  protocols.py  settings.py
  services/
    query_service.py         # orchestrates: validate → limit → connect → run → shape
    target_validator.py      # URL parsing, engine/scheme match, host allowlist, DNS check
    statement_guard.py       # blocked SQL / Mongo operations (one class per engine, injected)
  infra/
    pg_connector.py          # the only file importing psycopg
    mysql_connector.py       # the only file importing pymysql
    mongo_connector.py       # the only file importing pymongo
    dns_host_resolver.py  memory_limiter.py  system_clock.py
  dependencies.py            # the only place concrete classes are built
```

Each connector implements one `Protocol`:

```python
class DatabaseConnector(Protocol):
    async def run(self, target: Target, request: QueryRequest, limits: Limits) -> QueryResult: ...
    async def test(self, target: Target, limits: Limits) -> ServerInfo: ...
```

`QueryService` picks the connector by `engine`, so adding an engine later means adding one class and one entry in `dependencies.py`. Still no `@staticmethod`, and every function body has `try/except` that re-raises a domain error.

### B5.5 Today's tasks
1. **Create practice databases** (free tiers) for testing. Keep the credentials in the team password manager, never in code or docs:
   - Supabase project (tables `tasks`, `orders`)
   - Neon project
   - one MySQL host (Aiven free tier or TiDB Cloud Serverless)
   - MongoDB Atlas free cluster
2. **Network checks from Render** with a throw-away script run on the Render service, not committed:
   - Supabase direct host (IPv6) vs pooler (IPv4)
   - Neon with TLS
   - the MySQL host with TLS
   - Atlas: which IP Render connects from, and whether it changes between deploys

   Record the results.
3. **Decide the Atlas IP question** (static outbound IP vs `0.0.0.0/0` for practice clusters) and the **Supabase host question** (pooler only?).
4. **Create the module skeleton** (B5.4): protocols, errors, settings and `dependencies.py` wiring, with empty connectors that raise `NotImplementedError` inside `try/except`. Plus the router behind `DB_PROXY_ENABLED=false`.
5. **Review the draft API (B5.2) and rules (B5.3)** and send comments to the frontend before Day 3.

**Done when:**
- the four practice databases exist
- network results are recorded
- both decisions are made
- the skeleton is merged behind the flag
- comments on the draft are sent

---

## Security reminders for today
- Use **test** keys only. If a live key is ever pasted anywhere, rotate it.
- Practice database passwords live only in the password manager. The network-check script reads them from environment variables and is never committed.
- Don't share logs that contain user ids together with request paths outside the team.
- Keep the kill switch working: `RELAY_ENABLED=false` → `503 relay_disabled` and an empty provider list. Check it once on staging if you have one, not in production at peak time.

## End-of-day checklist
- [ ] B1: `VITE_CODELAB_RELAY=1` on Vercel; `relay` shows "Relay: on" in production
- [ ] B2: real test order created; wrong secret passes through; live key blocked; logged out refused
- [ ] B3: logs clean; headers correct; no upstream call for refused requests
- [ ] B4: v2 readiness note sent to frontend
- [ ] B5: practice databases created (Supabase, Neon, MySQL, Atlas); Render network checks recorded; Atlas IP and Supabase host decisions made; `app/codelab_db` skeleton merged behind `DB_PROXY_ENABLED=false`; draft API comments sent
- [ ] Any problem found → issue filed with steps to reproduce (no keys in the issue)

**Next (Day 3):** the frontend sends `CODELAB_API_RELAY_V2.md` and the database proxy contract for Postgres, MySQL and MongoDB (`CODELAB_DB_PROXY_BACKEND.md`) for review. The connectors are built Day 5 and connected Day 6.
