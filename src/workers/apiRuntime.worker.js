// Backend playground runtime: one long-lived Pyodide instance per workspace that holds the
// learner's FastAPI app and its SQLite database. useApiRuntime.js talks to it; the Python
// side lives in python/webnest_runtime.py.
import { loadPyodide, version as pyodideVersion } from 'pyodide'
import runtimeSource from './python/webnest_runtime.py?raw'
import extraWheels from '../../scripts/extra-wheels.json'
import { PYODIDE_INDEX_URL, cap, createSink, flushStreams } from './pyodideShared'
import { ENV_FILE } from '../lib/codelab/backendFiles'
import { envFromFiles } from '../lib/codelab/dotenv'
import { RelayBridge } from './relayBridge'

const BASE_PACKAGES = ['fastapi', 'bcrypt']
const EXTRA_WHEELS = extraWheels.wheels.map((wheel) => new URL(`${PYODIDE_INDEX_URL}${wheel.file_name}`, self.location.origin).href)
const DB_PATH = '/data/app.db'
const CDN_URL = `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`

// Installed before Pyodide loads, so every HTTP call from learner Python passes through it.
// It relays nothing until the page sends `relayConfig` (see useApiRuntime).
const relayBridge = new RelayBridge(self, (notice) => {
  try {
    self.postMessage({ type: 'relayNotice', ...notice })
  } catch (error) {
    console.warn('Relay notice not sent:', error?.message)
  }
})
relayBridge.install()

let pyodidePromise
let runtime
let sqlalchemyLoaded = false
let micropipLoaded = false
let queue = Promise.resolve()

// Pyodide packages for `pip install` (numpy, pandas…) come from the CDN, while the wheels
// copy-pyodide.mjs self-hosts (backend-wheels.json) keep loading from this site. Without the
// manifest (an offline dev setup) everything resolves against /pyodide/ as before.
async function loaderOptions() {
  const base = new URL(PYODIDE_INDEX_URL, self.location.origin).href
  try {
    const [lock, manifest] = await Promise.all(['pyodide-lock.json', 'backend-wheels.json'].map(async (file) => {
      const response = await fetch(`${base}${file}`)
      if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
      return response.json()
    }))
    const hosted = new Set(manifest.files)
    for (const entry of Object.values(lock.packages)) {
      if (hosted.has(entry.file_name)) entry.file_name = `${base}${entry.file_name}`
    }
    return { lockFileContents: lock, packageBaseUrl: CDN_URL }
  } catch (error) {
    console.warn('Using the local package index only:', error)
    return {}
  }
}

async function boot() {
  const pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL, ...(await loaderOptions()) })
  const failed = []
  await pyodide.loadPackage([...BASE_PACKAGES, ...EXTRA_WHEELS], { messageCallback: () => {}, errorCallback: (message) => failed.push(message) })
  if (failed.length) throw new Error(`Could not load the Python packages for the backend playground. ${failed[0]}`)
  pyodide.FS.mkdirTree('/opt/webnest')
  pyodide.FS.writeFile('/opt/webnest/webnest_runtime.py', runtimeSource)
  pyodide.runPython('import sys\nsys.path.insert(0, "/opt/webnest")')
  runtime = pyodide.pyimport('webnest_runtime')
  runtime.setup()
  return pyodide
}

function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = boot()
    // Let a later message try again instead of failing forever on a cached rejection.
    pyodidePromise.catch(() => { pyodidePromise = null })
  }
  return pyodidePromise
}

const usesSqlalchemy = (files) => files.some((file) => /^\s*(?:from|import)\s+sqlalchemy\b/m.test(file.content))

async function ensureSqlalchemy(pyodide, files) {
  if (sqlalchemyLoaded || !usesSqlalchemy(files)) return
  try {
    await pyodide.loadPackage('sqlalchemy', { messageCallback: () => {} })
    sqlalchemyLoaded = true
  } catch (error) {
    throw new Error(`SQLAlchemy could not be loaded: ${error?.message ?? error}`)
  }
}

const parse = (text) => JSON.parse(String(text))

// The project's .env as os.environ, for the API and for terminal commands alike.
const applyEnv = (files) => runtime.apply_env(JSON.stringify(envFromFiles(files).values))

const handlers = {
  async init(pyodide, { dbBytes }) {
    if (dbBytes?.byteLength) {
      try {
        pyodide.FS.writeFile(DB_PATH, new Uint8Array(dbBytes))
      } catch (error) {
        // A damaged snapshot must not stop the runtime; start with an empty database.
        console.warn('Could not restore the saved database:', error)
      }
    }
    return { ready: true }
  },
  async tables() {
    return { count: Number(runtime.table_count()) || 0 }
  },
  async load(pyodide, { files }) {
    if (!Array.isArray(files)) throw new TypeError('The project files are missing.')
    const python = files.filter((file) => typeof file?.name === 'string' && file.name.endsWith('.py'))
    await ensureSqlalchemy(pyodide, python)
    applyEnv(files)
    // .env goes along too, so load_dotenv() in learner code finds it.
    const env = files.filter((file) => file?.name === ENV_FILE)
    runtime.write_project(JSON.stringify([...python, ...env].map(({ name, content }) => ({ name, content }))))
    return parse(runtime.load_app())
  },
  async applySchema(pyodide, { sql, rebuild }) {
    return parse(runtime.apply_schema(sql, Boolean(rebuild)))
  },
  async request(pyodide, { spec, breakpoints = [], control, id }) {
    let bridge = null
    if (typeof SharedArrayBuffer !== 'undefined' && control instanceof SharedArrayBuffer && breakpoints.length) {
      const gates = new Int32Array(control)
      // `frames` is JSON text: the learner's call stack with each frame's variables.
      bridge = (file, line, frames, depth) => {
        Atomics.store(gates, 0, 0)
        // `control` is shared, not copied: the page resumes this request through it.
        self.postMessage({ id, type: 'debugPaused', control, file, line, frames, depth, method: spec?.method, path: spec?.path })
        const result = Atomics.wait(gates, 0, 0, 600000)
        if (result === 'timed-out') return 0
        const command = Atomics.load(gates, 1)
        Atomics.store(gates, 1, 0)
        return command
      }
    }
    runtime.configure_debugger(JSON.stringify(breakpoints), bridge)
    return parse(await runtime.request(JSON.stringify(spec)))
  },
  async sql(pyodide, { script }) {
    return parse(runtime.run_sql(script))
  },
  async schema() {
    return parse(runtime.describe_schema())
  },
  async snapshot(pyodide) {
    try {
      return { bytes: pyodide.FS.readFile(DB_PATH) }
    } catch (error) {
      // ENOENT: no database yet (never run, or just deleted). Anything else is a real failure.
      if (error?.errno === 44 || error?.code === 'ENOENT' || /no such file/i.test(String(error?.message))) return { bytes: null }
      throw error
    }
  },
  async reset() {
    return parse(runtime.reset_database())
  },
  // The API relay's base URL, provider list and the learner's WebNest token.
  async relayConfig(pyodide, { baseUrl, listing, token }) {
    try {
      relayBridge.configure({ baseUrl, listing, token })
      return { ok: true, enabled: relayBridge.matcher.enabled && Boolean(relayBridge.baseUrl) }
    } catch (error) {
      throw new Error(`Relay settings could not be applied: ${error?.message ?? error}`)
    }
  },
  // Terminal: `pip install`, `pip list` and `python …`.
  async install(pyodide, { requirements }) {
    if (!Array.isArray(requirements)) throw new TypeError('The packages to install are missing.')
    if (!micropipLoaded) {
      await pyodide.loadPackage('micropip', { messageCallback: () => {} })
      micropipLoaded = true
    }
    return parse(await runtime.install_packages(JSON.stringify(requirements.map(String))))
  },
  async pipList() {
    return parse(runtime.installed_packages())
  },
  async exec(pyodide, { files, mode, target, args }) {
    if (!Array.isArray(files)) throw new TypeError('The project files are missing.')
    await ensureSqlalchemy(pyodide, files.filter((file) => String(file?.name).endsWith('.py')))
    applyEnv(files)
    // Every text file, so scripts can read schema.sql or data files next to them.
    runtime.write_project(JSON.stringify(files.map(({ name, content }) => ({ name, content }))))
    return parse(runtime.run_command(JSON.stringify({ mode, target, args })))
  },
}

async function handle({ id, type, ...payload }) {
  const started = performance.now()
  const stdout = createSink()
  const stderr = createSink()
  let pyodide
  try {
    pyodide = await getPyodide()
    pyodide.setStdout(stdout)
    pyodide.setStderr(stderr)
    const handler = handlers[type]
    if (!handler) throw new Error(`Unknown runtime message: ${type}`)
    const data = await handler(pyodide, { ...payload, id })
    flushStreams(pyodide)
    const out = cap(stdout.text())
    const err = cap(stderr.text())
    const transfer = data?.bytes?.buffer ? [data.bytes.buffer] : []
    self.postMessage({ id, ok: true, data, stdout: out.text, stderr: err.text, ms: Math.round(performance.now() - started) }, transfer)
  } catch (error) {
    flushStreams(pyodide)
    self.postMessage({
      id,
      ok: false,
      error: error?.message ?? String(error),
      stdout: cap(stdout.text()).text,
      stderr: cap(stderr.text()).text,
      ms: Math.round(performance.now() - started),
    })
  }
}

// One message at a time: requests share the app and the database file.
self.onmessage = (event) => {
  // handle() reports its own errors; the catch keeps one broken message from stopping the queue.
  queue = queue.then(() => handle(event.data ?? {})).catch((error) => console.error('Backend runtime message failed:', error))
}
