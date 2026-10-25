// The backend playground's terminal: turns a typed line into actions the browser runtime can
// carry out. Everything here is pure; useBackendTerminal runs the actions.
export const REQUIREMENTS_FILE = 'requirements.txt'
export const PACKAGE_FILE = 'package.json'
export const MAX_SCRIPT_DEPTH = 5

export const HELP = `Commands in this browser terminal:
  pip install <package> [...]     install from PyPI and add it to requirements.txt
  pip install -r requirements.txt install everything listed there
  pip uninstall <package>         remove it from requirements.txt
  pip list | pip freeze           installed packages
  uvicorn app.main:app --reload   start your API (same as Run)
  python app/script.py [args]     run a file; also python -m <module> and python -c "<code>"
  npm run <script> | npm start    run a script from package.json, e.g. "dev": "uvicorn app.main:app --reload"
  relay                           payment APIs you can call in test mode (Razorpay, Stripe, PayPal sandbox...)
  ls [folder] | cat <file> | clear | help

API keys: put them in a .env file in the project root (KEY=value per line). Run and these
commands load it into os.environ. GitHub sync never pushes .env; use test keys only.

Limits: your API runs inside the browser (Pyodide). Pure-Python packages install from PyPI and
Pyodide's own builds (numpy, pandas...) work, but other packages with C code do not. Most other
sites block calls from a browser; payment APIs listed by \`relay\` work through WebNest's relay.
npm packages are not available.`

// Splits a line like a shell: quotes group words, `&&` (or `;`) separates commands.
// Returns one token list per command.
export function splitCommand(line) {
  const commands = [[]]
  let token = ''
  let started = false
  let quote = null
  const text = String(line ?? '')
  const push = () => {
    if (started) commands[commands.length - 1].push(token)
    token = ''
    started = false
  }
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (quote) {
      if (char === quote) quote = null
      else if (char === '\\' && quote === '"' && (text[i + 1] === '"' || text[i + 1] === '\\')) token += text[++i]
      else token += char
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      started = true
    } else if (char === '\\' && i + 1 < text.length) {
      token += text[++i]
      started = true
    } else if (/\s/.test(char)) {
      push()
    } else if ((char === '&' && text[i + 1] === '&') || char === ';') {
      push()
      if (char === '&') i += 1
      commands.push([])
    } else {
      token += char
      started = true
    }
  }
  push()
  return commands.filter((tokens) => tokens.length)
}

// PEP 503 name normalisation, so PyJWT, pyjwt and py_jwt are the same package.
export const normalizeName = (name) => String(name ?? '').trim().toLowerCase().replace(/[-_.]+/g, '-')

export function requirementName(spec) {
  return /^\s*([A-Za-z0-9][A-Za-z0-9._-]*)/.exec(String(spec ?? ''))?.[1] ?? ''
}

// Packages that install (or fail to) but cannot reach their server from the browser yet, with
// what to use instead. Printed after `pip install`. Keys are normalised names (normalizeName).
const POSTGRES_HINT = "Postgres (Supabase, Neon) can't be reached directly from the browser yet. Use the playground database (SQLite), or Supabase's REST API with requests. DATABASE_URL connections are coming soon."
const MYSQL_HINT = "MySQL can't be reached directly from the browser yet. Use the playground database (SQLite) to practise SQL. MYSQL_URL connections are coming soon."
const MONGO_HINT = "MongoDB can't be reached directly from the browser yet. Practise with mongomock (pip install mongomock). MONGODB_URI (Atlas) connections are coming soon."
const SERVER_HINT = 'Not needed here: Run (or uvicorn app.main:app) starts your API.'
const INSTALL_HINTS = {
  redis: "A Redis server can't be reached from the browser. Practise with fakeredis (pip install fakeredis), or use Upstash Redis over HTTPS.",
  psycopg2: POSTGRES_HINT,
  'psycopg2-binary': POSTGRES_HINT,
  psycopg: POSTGRES_HINT,
  asyncpg: POSTGRES_HINT,
  pymysql: MYSQL_HINT,
  'mysql-connector-python': MYSQL_HINT,
  mysqlclient: MYSQL_HINT,
  pymongo: MONGO_HINT,
  motor: MONGO_HINT,
  supabase: "Connect with SUPABASE_URL (https://<ref>.supabase.co) and SUPABASE_ANON_KEY from your .env. Use the anon / publishable key only, never the service_role key: anyone on this device can read .env.",
  celery: "Celery needs a broker and worker processes, which the browser can't run. Use FastAPI's BackgroundTasks instead.",
  uvicorn: SERVER_HINT,
  gunicorn: SERVER_HINT,
  uvloop: SERVER_HINT,
}

// Server packages are a normal line in a FastAPI requirements.txt, so their hint is only
// worth showing when the learner installs one by name.
const SERVER_PACKAGES = new Set(['uvicorn', 'gunicorn', 'uvloop'])

// The hint for an installed or failed package (a requirement like "Redis==5.0"), or ''.
// `fromFile`: the install came from requirements.txt (pip install -r / npm install).
export function installHint(spec, { fromFile = false } = {}) {
  try {
    const name = normalizeName(requirementName(spec))
    if (fromFile && SERVER_PACKAGES.has(name)) return ''
    return INSTALL_HINTS[name] ?? ''
  } catch {
    return ''
  }
}

// The installable lines of a requirements file: no comments, blank lines or pip options.
export function parseRequirements(text) {
  return String(text ?? '')
    .split(/\r?\n/)
    .map((line) => line.replace(/(^|\s)#.*$/, '').trim())
    .filter((line) => line && !line.startsWith('-') && requirementName(line))
}

// Appends the requirements that are not listed yet. Returns the new text and what was added.
export function addRequirements(text, specs) {
  const listed = new Set(parseRequirements(text).map((line) => normalizeName(requirementName(line))))
  const added = []
  for (const spec of specs) {
    const key = normalizeName(requirementName(spec))
    if (!key || listed.has(key)) continue
    listed.add(key)
    added.push(spec)
  }
  if (!added.length) return { text: text ?? '', added }
  const base = String(text ?? '')
  const prefix = base && !base.endsWith('\n') ? `${base}\n` : base
  return { text: `${prefix}${added.join('\n')}\n`, added }
}

export function removeRequirements(text, names) {
  const wanted = new Set(names.map(normalizeName))
  const removed = []
  const lines = String(text ?? '').split(/\r?\n/).filter((line) => {
    const name = requirementName(line.replace(/(^|\s)#.*$/, ''))
    if (name && wanted.has(normalizeName(name))) {
      removed.push(name)
      return false
    }
    return true
  })
  return { text: lines.join('\n'), removed }
}

export function packageScripts(packageJson) {
  if (packageJson == null) return null
  try {
    const scripts = JSON.parse(packageJson)?.scripts
    return scripts && typeof scripts === 'object' ? scripts : {}
  } catch {
    return undefined // present but not valid JSON
  }
}

const message = (text, ok = true) => ({ kind: 'message', text, ok })
const isFlag = (token) => token.startsWith('-')

function pip(args) {
  const [sub, ...rest] = args
  switch (sub) {
    case 'install': {
      const fileIndex = rest.findIndex((token) => token === '-r' || token === '--requirement')
      if (fileIndex !== -1) {
        const file = rest[fileIndex + 1]
        if (!file) return message('pip install -r needs a file, e.g. pip install -r requirements.txt', false)
        return { kind: 'install', fromFile: file }
      }
      const packages = rest.filter((token) => !isFlag(token))
      if (!packages.length) return message('Usage: pip install <package> [<package> ...]', false)
      if (packages.some((spec) => /^(\.|\/|git\+|https?:)/.test(spec))) {
        return message('Only packages from PyPI can be installed here, e.g. pip install humanize', false)
      }
      return { kind: 'install', packages }
    }
    case 'uninstall': {
      const names = rest.filter((token) => !isFlag(token))
      if (!names.length) return message('Usage: pip uninstall <package>', false)
      return { kind: 'uninstall', names }
    }
    case 'list':
    case 'freeze':
      return { kind: 'pipList', freeze: sub === 'freeze' }
    case '--version':
    case '-V':
      return message('pip here is micropip, installing from PyPI into the browser runtime.')
    case undefined:
      return message('Usage: pip install | uninstall | list | freeze')
    default:
      return message(`pip ${sub} is not available here. Use pip install, uninstall, list or freeze.`, false)
  }
}

function python(args) {
  let index = 0
  // Interpreter flags that change nothing here (-u unbuffered, -B no .pyc, ...).
  while (index < args.length && /^-[uBOsSEIq]+$/.test(args[index])) index += 1
  const [first, second, ...rest] = args.slice(index)
  if (first === undefined) {
    return message('The interactive Python prompt is not available here. Run a file (python app/script.py) or code (python -c "print(42)").', false)
  }
  if (first === '-V' || first === '--version') return { kind: 'exec', mode: 'code', target: 'import sys; print("Python " + sys.version.split()[0])', args: [] }
  if (first === '-c') {
    if (second === undefined) return message('Argument expected for the -c option', false)
    return { kind: 'exec', mode: 'code', target: second, args: rest }
  }
  if (first === '-m') {
    if (second === undefined) return message('Argument expected for the -m option', false)
    if (second === 'pip') return pip(rest)
    if (second === 'uvicorn' || second === 'fastapi') return { kind: 'run' }
    return { kind: 'exec', mode: 'module', target: second, args: rest }
  }
  if (isFlag(first)) return message(`python ${first} is not supported here.`, false)
  return { kind: 'exec', mode: 'file', target: first.replace(/^\.\//, ''), args: [second, ...rest].filter((arg) => arg !== undefined) }
}

// npm commands that run a script without `run`.
const NPM_SHORTCUTS = new Set(['start', 'test', 'stop', 'restart'])

function npm(args, scripts) {
  const [sub, ...rest] = args
  if (sub === undefined || sub === 'help') return message('Usage: npm run <script> | npm start | npm install')
  if (sub === '-v' || sub === '--version') return message('npm is not installed in the browser; scripts in package.json run through this terminal.')
  if (['install', 'i', 'ci', 'add'].includes(sub)) {
    const packages = rest.filter((token) => !isFlag(token))
    if (packages.length) {
      return message(`npm installs JavaScript packages, which your Python API cannot use. For Python packages use: pip install ${packages.join(' ')}`, false)
    }
    return { kind: 'install', fromFile: REQUIREMENTS_FILE, quietIfMissing: true }
  }
  const name = sub === 'run' || sub === 'run-script' ? rest[0] : NPM_SHORTCUTS.has(sub) ? sub : null
  if (name === null) return message(`npm ${sub} is not available here. Use npm run <script>.`, false)
  if (scripts === null) {
    return message(`No package.json in this project. Add one with scripts, e.g.\n{ "scripts": { "dev": "uvicorn app.main:app --reload" } }\nor run your API directly: uvicorn app.main:app --reload`, false)
  }
  if (scripts === undefined) return message('package.json is not valid JSON.', false)
  const names = Object.keys(scripts)
  if (name === undefined) {
    return message(names.length ? `Scripts in package.json:\n${names.map((item) => `  ${item}\n    ${scripts[item]}`).join('\n')}` : 'package.json has no scripts.')
  }
  if (typeof scripts[name] !== 'string') {
    return message(`npm error Missing script: "${name}"${names.length ? `\nAvailable scripts: ${names.join(', ')}` : ''}`, false)
  }
  return { kind: 'script', name, command: scripts[name] }
}

// One command's tokens to an action. `packageJson` is the text of package.json, or null.
export function resolveCommand(tokens, { packageJson = null } = {}) {
  const [command, ...args] = tokens
  switch (command) {
    case undefined:
      return { kind: 'none' }
    case 'help':
      return message(HELP)
    case 'clear':
    case 'cls':
      return { kind: 'clear' }
    case 'ls':
    case 'dir':
      return { kind: 'ls', path: args.find((arg) => !isFlag(arg)) ?? '' }
    case 'cat':
    case 'type':
      return args[0] ? { kind: 'cat', file: args[0] } : message('Usage: cat <file>', false)
    case 'echo':
      return message(args.join(' '))
    case 'pwd':
      return message('/app')
    case 'relay':
      return { kind: 'relayStatus' }
    case 'cd':
      return message('Commands always run in the project folder, so cd is not needed.')
    case 'pip':
    case 'pip3':
      return pip(args)
    case 'python':
    case 'python3':
    case 'py':
      return python(args)
    case 'uvicorn':
    case 'gunicorn':
    case 'hypercorn':
      return { kind: 'run' }
    case 'fastapi':
      return args[0] === 'dev' || args[0] === 'run' ? { kind: 'run' } : message('Usage: fastapi dev app/main.py', false)
    case 'npm':
      return npm(args, packageScripts(packageJson))
    case 'npx':
    case 'node':
    case 'yarn':
    case 'pnpm':
      return message(`${command} is not available: there is no Node.js in the browser. Use npm run <script> for package.json scripts.`, false)
    default:
      return message(`${command}: command not found in the browser terminal. Type help for the commands you can use.`, false)
  }
}

// The files `ls` shows: the entries directly inside `folder`.
export function listFolder(files, folder = '') {
  const prefix = folder.replace(/^\.?\/*|\/+$/g, '') ? `${folder.replace(/^\.?\/*|\/+$/g, '')}/` : ''
  const entries = new Set()
  for (const { name } of files) {
    if (!name.startsWith(prefix)) continue
    const [head, ...more] = name.slice(prefix.length).split('/')
    entries.add(more.length ? `${head}/` : head)
  }
  return [...entries].sort((a, b) => (a.endsWith('/') === b.endsWith('/') ? a.localeCompare(b) : a.endsWith('/') ? -1 : 1))
}
