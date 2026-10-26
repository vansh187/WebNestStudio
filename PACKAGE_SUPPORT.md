# What you can install in the CodeLab backend playground

Your FastAPI app runs inside your browser (Pyodide), not on a server. Most Python packages install and work. A few can't reach the outside world from a browser.

**Last measured:** 2026-10-25 with `npm run e2e:packages`, on the normal page and the debugger's cross-origin-isolated page (identical results). Re-run it after changing the runtime.

## Why some packages can't connect

| How the package talks to the outside | In the playground |
|---|---|
| Doesn't (pure Python, maths, data, validation) | ✅ Works |
| HTTPS to a service that allows browser calls (Supabase REST, public APIs) | ✅ Works with `requests` and `httpx` |
| HTTPS to a service that blocks browser calls (Razorpay, Stripe, PayPal sandbox) | ✅ Works through the WebNest relay when you're logged in, with **test keys only**, from `requests` or `httpx`. Type `relay` in the terminal |
| A raw database or server connection (Postgres, MySQL, MongoDB, Redis, SMTP) | ❌ Not from a browser yet. The WebNest database proxy for Postgres, MySQL and MongoDB is in progress |
| Compiled C code without a browser build | ❌ Can't install |

## Measured packages

| Package | Status | Notes / what to use instead |
|---|---|---|
| humanize | ✅ Works | |
| faker | ✅ Works | |
| pyjwt | ✅ Works (preinstalled) | |
| python-dotenv | ✅ Works | Your `.env` is already loaded into `os.environ` on Run |
| marshmallow | ✅ Works | |
| email-validator | ✅ Works | Use `check_deliverability=False`: DNS lookups don't work from a browser |
| fakeredis | ✅ Works | In-memory Redis for practice |
| mongomock | ✅ Works | In-memory MongoDB for practice |
| numpy | ✅ Works | Loaded from the Pyodide CDN |
| pandas | ✅ Works | Loaded from the Pyodide CDN |
| pyyaml | ✅ Works | |
| pillow | ✅ Works | |
| cryptography | ✅ Works | |
| requests | ✅ Works | Outside calls work when the site allows browser calls |
| httpx | ✅ Works | Same as requests, sync and async. Calls to relay providers (Razorpay, Stripe…) go through the relay too |
| razorpay, stripe | ✅ Through the relay | Log in, use test keys in `.env`; live keys are refused. Measured separately (relay checks), not in this run |
| httpx → relay provider | ✅ Through the relay | Checked by `tests/httpx-relay.test.mjs` (real Pyodide httpx and relay bridge, mock relay) on 2026-10-26. The browser row `httpx → razorpay` needs a login |
| supabase (REST via requests) | ✅ Expected to work | Supabase allows browser calls. Use the **anon** key, never `service_role`. Needs a practice project to measure |
| supabase (package) | ⚠️ To be measured | httpx works now, so it's likely to work. Needs a practice project |
| redis | ⚠️ Installs, can't connect | Hint shown. Use `fakeredis`, or Upstash Redis over HTTPS |
| pymysql | ⚠️ Installs, can't connect | Hint shown. Use the playground database (SQLite); MySQL via the database proxy is coming |
| mysql-connector-python | ⚠️ Installs, can't connect | Same as pymysql |
| pymongo | ⚠️ Installs, can't connect | Hint shown. Use `mongomock`; MongoDB Atlas via the database proxy is coming |
| celery | ⚠️ Installs, can't run | Hint shown. Needs a broker and worker processes. Use FastAPI `BackgroundTasks` |
| psycopg2 | ❌ Can't install (C code, no browser build) | Hint shown. Use the playground database (SQLite) or Supabase REST; Postgres via the database proxy is coming |
| uvloop | ❌ Can't install | Not needed: Run starts your API |

## Running the suite

```bash
npx vite build
npx vite preview --port 4317 --strictPort          # second terminal
npm run e2e:packages -- --base http://localhost:4317            # normal page
npm run e2e:packages -- --base http://localhost:4317 --isolate  # debugger page
```

- Options: `--only numpy,redis` runs some rows; `--json out.json` saves the results.
- Supabase rows need `E2E_SUPABASE_URL` + `E2E_SUPABASE_ANON_KEY`.
- Relay rows need `E2E_REFRESH_TOKEN` (a test account) and a `VITE_CODELAB_RELAY=1` build.
- Never commit these values.
