// Package compatibility suite for the backend playground (PLAYGROUND_PACKAGES_DAY1_FRONTEND.md F2).
// Installs and smoke-tests representative packages in the real playground and records what
// happens. Rows marked `assert` must work; everything else is recorded, because finding out
// is the point.
//
//   npx vite build && npx vite preview --port 4317 --strictPort     (in another terminal)
//   npm run e2e:packages -- --base http://localhost:4317 [--isolate] [--only numpy,redis] [--json out.json]
//
// Optional, never committed: E2E_REFRESH_TOKEN (a test account, for relay rows; needs a
// VITE_CODELAB_RELAY=1 build), E2E_SUPABASE_URL + E2E_SUPABASE_ANON_KEY (Supabase rows).
import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const args = process.argv.slice(2)
const option = (name, fallback = null) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}
const BASE = option('base', 'http://localhost:4317')
const ISOLATE = args.includes('--isolate')
const ONLY = option('only') ? new Set(option('only').split(',')) : null
const JSON_OUT = option('json')
const REFRESH_TOKEN = process.env.E2E_REFRESH_TOKEN || ''
const SUPABASE_URL = process.env.E2E_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.E2E_SUPABASE_ANON_KEY || ''

const py = (code) => `python -c "${code.replace(/"/g, '\\"')}"`
// The prompt is one line, so multi-line code goes through exec(): `\n` stays two characters
// until Python's string literal turns it into a newline.
const pyLines = (lines) => py(`exec("${lines.join('\\n').replace(/"/g, '\\"')}")`)

// expect: 'works' (asserted), 'fails' (recorded; expected not to work today), 'record' (unknown).
// needs: 'login' (relay rows), 'supabase' (Supabase rows).
const CASES = [
  { group: 'Pure Python', name: 'humanize', install: 'humanize', smoke: py("import humanize; print('OK', humanize.intcomma(1234567))"), pass: /OK 1,234,567/, expect: 'works' },
  { group: 'Pure Python', name: 'faker', install: 'faker', smoke: py("from faker import Faker; print('OK', bool(Faker().name()))"), pass: /OK True/, expect: 'works' },
  { group: 'Pure Python', name: 'pyjwt', install: 'pyjwt', smoke: py("import jwt; t = jwt.encode({'a': 1}, 's' * 32, algorithm='HS256'); print('OK', jwt.decode(t, 's' * 32, algorithms=['HS256']))"), pass: /OK \{'a': 1\}/, expect: 'works' },
  { group: 'Pure Python', name: 'python-dotenv', install: 'python-dotenv', smoke: py("from dotenv import dotenv_values; print('OK', callable(dotenv_values))"), pass: /OK True/, expect: 'works' },
  { group: 'Pure Python', name: 'marshmallow', install: 'marshmallow', smoke: pyLines(['from marshmallow import Schema, fields', 'class S(Schema):', '    n = fields.Int()', "print('OK', S().load({'n': '5'}))"]), pass: /OK \{'n': 5\}/, expect: 'works' },
  { group: 'Pure Python', name: 'email-validator', install: 'email-validator', smoke: py("from email_validator import validate_email; print('OK', validate_email('a@example.com', check_deliverability=False).normalized)"), pass: /OK a@example\.com/, expect: 'works' },
  { group: 'C code, Pyodide build', name: 'numpy', install: 'numpy', smoke: py("import numpy; print('OK', numpy.arange(4).sum())"), pass: /OK 6/, expect: 'works' },
  { group: 'C code, Pyodide build', name: 'pandas', install: 'pandas', smoke: py("import pandas as pd; print('OK', len(pd.DataFrame({'a': [1, 2]})))"), pass: /OK 2/, expect: 'works' },
  { group: 'C code, Pyodide build', name: 'pyyaml', install: 'pyyaml', smoke: py("import yaml; print('OK', yaml.safe_load('a: 1'))"), pass: /OK \{'a': 1\}/, expect: 'works' },
  { group: 'C code, Pyodide build', name: 'pillow', install: 'pillow', smoke: py("from PIL import Image; print('OK', Image.new('RGB', (2, 2)).size)"), pass: /OK \(2, 2\)/, expect: 'works' },
  { group: 'C code, Pyodide build', name: 'cryptography', install: 'cryptography', smoke: py("from cryptography.fernet import Fernet; f = Fernet(Fernet.generate_key()); print('OK', f.decrypt(f.encrypt(b'hi')))"), pass: /OK b'hi'/, expect: 'works' },
  { group: 'C code, no build', name: 'psycopg2', install: 'psycopg2', smoke: null, expect: 'fails' },
  { group: 'C code, no build', name: 'uvloop', install: 'uvloop', smoke: null, expect: 'fails' },
  { group: 'HTTPS via requests', name: 'requests', install: 'requests', smoke: py("import requests; print('OK', requests.get('https://httpbin.org/get', timeout=20).status_code)"), pass: /OK 200/, expect: 'works' },
  { group: 'HTTPS via httpx', name: 'httpx', install: 'httpx', smoke: py("import httpx; print('OK', httpx.get('https://httpbin.org/get', timeout=20).status_code)"), pass: /OK 200/, expect: 'works' },
  { group: 'Supabase', name: 'supabase REST (requests)', install: 'requests', needs: 'supabase', smoke: () => py(`import requests; r = requests.get('${SUPABASE_URL}/rest/v1/tasks?select=*&limit=1', headers={'apikey': '${SUPABASE_KEY}', 'Authorization': 'Bearer ${SUPABASE_KEY}'}, timeout=20); print('OK', r.status_code)`), pass: /OK 200/, expect: 'works' },
  { group: 'Supabase', name: 'supabase package', install: 'supabase', needs: 'supabase', smoke: () => py(`from supabase import create_client; print('OK', len(create_client('${SUPABASE_URL}', '${SUPABASE_KEY}').table('tasks').select('*').limit(1).execute().data) >= 0)`), pass: /OK True/, expect: 'record' },
  { group: 'Through the relay', name: 'razorpay', install: 'razorpay', needs: 'login', smoke: pyLines(['import razorpay', 'try:', "    razorpay.Client(auth=('rzp_test_e2e', 'wrong')).order.create({'amount': 100, 'currency': 'INR'})", 'except Exception as error:', "    print('OK' if 'Authentication failed' in str(error) else 'NO', type(error).__name__)"]), pass: /OK /, expect: 'works' },
  // httpx sends through the worker's fetch/XHR, so the relay bridge sees it like requests (F8).
  { group: 'Through the relay', name: 'httpx → razorpay', install: 'httpx', needs: 'login', smoke: py("import httpx; r = httpx.post('https://api.razorpay.com/v1/orders', auth=('rzp_test_e2e', 'wrong'), json={'amount': 100, 'currency': 'INR'}, timeout=60); print('OK' if r.status_code == 401 and 'Authentication failed' in r.text else 'NO', r.status_code)"), pass: /OK 401/, expect: 'works' },
  { group: 'Through the relay', name: 'stripe', install: 'stripe', needs: 'login', smoke: pyLines(['import stripe', "stripe.api_key = 'sk_test_e2e'", 'try:', '    stripe.Balance.retrieve()', 'except Exception as error:', "    print('OK' if 'Invalid API Key' in str(error) else 'NO', type(error).__name__)"]), pass: /OK /, expect: 'works' },
  { group: 'Raw connection', name: 'redis', install: 'redis', smoke: py("import redis; print(redis.Redis(socket_connect_timeout=2).ping())"), pass: /^True$/m, expect: 'fails' },
  { group: 'Raw connection', name: 'pymysql', install: 'pymysql', smoke: py("import pymysql; pymysql.connect(host='db.example.com', connect_timeout=2)"), pass: /^$/, expect: 'fails' },
  { group: 'Raw connection', name: 'mysql-connector-python', install: 'mysql-connector-python', smoke: py("import mysql.connector; mysql.connector.connect(host='db.example.com', connection_timeout=2)"), pass: /^$/, expect: 'fails' },
  { group: 'Raw connection', name: 'pymongo', install: 'pymongo', smoke: py("import pymongo; pymongo.MongoClient('mongodb://db.example.com', serverSelectionTimeoutMS=2000).server_info()"), pass: /^$/, expect: 'fails' },
  { group: 'In-memory stand-ins', name: 'fakeredis', install: 'fakeredis', smoke: py("import fakeredis; r = fakeredis.FakeRedis(decode_responses=True); r.set('v', 1); r.incr('v'); print('OK', r.get('v'))"), pass: /OK 2/, expect: 'works' },
  { group: 'In-memory stand-ins', name: 'mongomock', install: 'mongomock', smoke: py("import mongomock; c = mongomock.MongoClient().db.items; c.insert_one({'a': 1}); print('OK', c.find_one({'a': 1})['a'])"), pass: /OK 1/, expect: 'works' },
  { group: 'Server / processes', name: 'celery', install: 'celery', smoke: null, expect: 'record' },
]

// Hint lines printed by `pip install` (src/lib/codelab/terminal.js INSTALL_HINTS).
const HINT = /can't be reached|cannot be reached|Not needed here|anon \/ publishable key|BackgroundTasks|coming soon/

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const context = await browser.newContext({ viewport: { width: 1500, height: 950 } })
  if (REFRESH_TOKEN) {
    // Runs in every frame; the sandboxed Preview iframe throws on localStorage.
    // Set once per tab: the app rotates the refresh token, and writing the original back on a
    // later navigation would replace the rotated one with a revoked token.
    await context.addInitScript((token) => {
      try {
        if (sessionStorage.getItem('e2e-refresh-set')) return
        localStorage.setItem('wns_refresh_token', token)
        sessionStorage.setItem('e2e-refresh-set', '1')
      } catch { /* sandboxed frame */ }
    }, REFRESH_TOKEN)
  }
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  const results = []
  try {
    await page.goto(`${BASE}/codelab/playground${ISOLATE ? '?isolate=1' : ''}`, { waitUntil: 'domcontentloaded' })
    const select = page.locator('select:has(option[value="backend"])').first()
    await select.waitFor({ timeout: 60000 })
    await select.selectOption('backend')
    const input = page.locator('input[aria-label="Terminal command"]')
    if (!(await input.isVisible().catch(() => false))) await page.getByRole('button', { name: /^Output$/ }).first().click()
    await input.waitFor({ timeout: 30000 })
    const consoleBox = page.locator('div.font-mono:has(input[aria-label="Terminal command"])').first()

    const run = async (command, timeout = 300000) => {
      const before = (await consoleBox.innerText()).length
      await input.fill(command)
      await input.press('Enter')
      await page.waitForTimeout(200)
      await page.waitForFunction(() => !document.querySelector('input[aria-label="Terminal command"]')?.readOnly, null, { timeout })
      await page.waitForTimeout(300)
      const all = await consoleBox.innerText()
      // Normally the output starts at the echoed command. If the echo can't be found (wrapped
      // or long), fall back to everything printed since the command was sent.
      const echo = all.lastIndexOf(`$ ${command.slice(0, 40)}`)
      if (echo !== -1) return all.slice(echo).split('\n').slice(1).join('\n').replace(/\n\$\s*$/, '').trim()
      return all.slice(Math.min(before, all.length)).replace(/\n\$\s*$/, '').trim()
    }

    for (const item of CASES) {
      if (ONLY && !ONLY.has(item.name)) continue
      const started = Date.now()
      const row = { group: item.group, name: item.name, expect: item.expect, installed: 'no', smoke: 'skipped', hint: 'none', seconds: 0, tail: '' }
      try {
        if (item.needs === 'login' && !REFRESH_TOKEN) row.smoke = 'skipped (no E2E_REFRESH_TOKEN)'
        if (item.needs === 'supabase' && !(SUPABASE_URL && SUPABASE_KEY)) row.smoke = 'skipped (no E2E_SUPABASE_*)'
        if (row.smoke.startsWith('skipped (')) {
          results.push(row)
          console.log(`- ${row.name.padEnd(26)} ${row.smoke}`)
          continue
        }
        const installOut = await run(`pip install ${item.install}`)
        row.installed = /Successfully installed|Requirement already satisfied/.test(installOut) && !/^ERROR:/m.test(installOut) ? 'yes' : 'no'
        row.hint = HINT.test(installOut) ? 'shown' : 'none'
        let out = installOut
        if (item.smoke && row.installed === 'yes') {
          const command = typeof item.smoke === 'function' ? item.smoke() : item.smoke
          out = await run(command)
          row.smoke = item.pass.test(out) ? 'pass' : 'fail'
        }
        if (row.smoke !== 'pass') row.tail = out.slice(-300)
      } catch (error) {
        row.smoke = 'error'
        row.tail = String(error?.message ?? error).slice(0, 300)
      }
      row.seconds = Math.round((Date.now() - started) / 1000)
      results.push(row)
      console.log(`${row.smoke === 'pass' ? '✔' : row.expect === 'works' ? '✖' : '·'} ${row.name.padEnd(26)} installed=${row.installed.padEnd(3)} smoke=${row.smoke.padEnd(5)} hint=${row.hint.padEnd(5)} ${row.seconds}s`)
    }
  } finally {
    await browser.close()
  }

  // Never print secrets: tails come from learner-visible output only, and the suite passes
  // keys solely through the commands above.
  const scrub = (text) => text.replaceAll(SUPABASE_KEY || '\u0000', '<anon key>').replaceAll(REFRESH_TOKEN || '\u0000', '<token>')
  for (const row of results) row.tail = scrub(row.tail)
  // A required row fails unless its smoke test passed. Only rows skipped on purpose (missing
  // credentials, "skipped (…)") are left out; a required package that failed to install fails.
  const failures = results.filter((row) => row.expect === 'works' && !row.smoke.startsWith('skipped (') && row.smoke !== 'pass')
  console.log(`\nMode: ${ISOLATE ? 'isolated' : 'normal'} · ${results.length} rows · ${failures.length} required row(s) failing · page errors: ${pageErrors.length}`)
  for (const row of failures) console.log(`  FAIL ${row.name}: ${row.tail.replace(/\s+/g, ' ').slice(-200)}`)
  if (JSON_OUT) writeFileSync(JSON_OUT, `${JSON.stringify({ mode: ISOLATE ? 'isolated' : 'normal', base: BASE, at: new Date().toISOString(), results, pageErrors }, null, 2)}\n`)
  process.exit(failures.length ? 1 : 0)
}

main().catch((error) => {
  console.error('Package suite failed to run:', error?.message ?? error)
  process.exit(2)
})
