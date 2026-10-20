// Backend playground runtime: one long-lived Pyodide instance per workspace that holds the
// learner's FastAPI app and its SQLite database. useApiRuntime.js talks to it; the Python
// side lives in python/webnest_runtime.py.
import { loadPyodide } from 'pyodide'
import runtimeSource from './python/webnest_runtime.py?raw'
import extraWheels from '../../scripts/extra-wheels.json'
import { PYODIDE_INDEX_URL, cap, createSink, flushStreams } from './pyodideShared'

const BASE_PACKAGES = ['fastapi', 'bcrypt']
const EXTRA_WHEELS = extraWheels.wheels.map((wheel) => new URL(`${PYODIDE_INDEX_URL}${wheel.file_name}`, self.location.origin).href)
const DB_PATH = '/data/app.db'

let pyodidePromise
let runtime
let sqlalchemyLoaded = false
let queue = Promise.resolve()

async function boot() {
  const pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL })
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

const parse = (text) => JSON.parse(String(text))

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
    if (!sqlalchemyLoaded && usesSqlalchemy(python)) {
      try {
        await pyodide.loadPackage('sqlalchemy', { messageCallback: () => {} })
        sqlalchemyLoaded = true
      } catch (error) {
        throw new Error(`SQLAlchemy could not be loaded: ${error?.message ?? error}`)
      }
    }
    runtime.write_project(JSON.stringify(python.map(({ name, content }) => ({ name, content }))))
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
