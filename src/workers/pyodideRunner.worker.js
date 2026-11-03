import { loadPyodide } from 'pyodide'
import debugSource from './python/webnest_debug.py?raw'
import { PYODIDE_INDEX_URL, cap, createSink, flushStreams } from './pyodideShared'

let pyodidePromise
let debugModule = null

function getPyodide() {
  if (!pyodidePromise) pyodidePromise = loadPyodide({ indexURL: PYODIDE_INDEX_URL })
  return pyodidePromise
}

// The debugger (python/webnest_debug.py), loaded the first time a run is debugged.
function getDebugger(pyodide) {
  if (!debugModule) {
    pyodide.FS.mkdirTree('/opt/webnest')
    pyodide.FS.writeFile('/opt/webnest/webnest_debug.py', debugSource)
    pyodide.runPython('import sys\nif "/opt/webnest" not in sys.path: sys.path.insert(0, "/opt/webnest")')
    debugModule = pyodide.pyimport('webnest_debug')
  }
  return debugModule
}

// Debugging pauses this worker at a breakpoint with Atomics.wait on `control`, a buffer shared
// with the page: Int32 [0] is the gate the page opens, [1] what to do next (0 continue, 1 step
// into, 2 step over, 3 step out), [2] the byte length of the page's current breakpoints as
// JSON, which follow from byte 12 (see resumeDebug in useCodeRunner.js). It needs a
// cross-origin isolated page (lib/codelab/isolation.js).
const DEBUG_HEADER_BYTES = 12

function pauseBridge(id, control) {
  const gates = new Int32Array(control, 0, 3)
  const decoder = new TextDecoder()
  let latest = ''
  const bridge = (file, line, frames, depth) => {
    Atomics.store(gates, 0, 0)
    Atomics.store(gates, 2, 0)
    self.postMessage({ id, type: 'debugPaused', control, file, line, frames, depth })
    const waited = Atomics.wait(gates, 0, 0, 600000)
    if (waited === 'timed-out') return 0
    const command = Atomics.load(gates, 1)
    Atomics.store(gates, 1, 0)
    const length = Atomics.load(gates, 2)
    // TextDecoder cannot read a SharedArrayBuffer view directly, so copy the bytes first.
    latest = length > 0 ? decoder.decode(new Uint8Array(control, DEBUG_HEADER_BYTES, length).slice()) : ''
    return command
  }
  const breakpointsNow = () => {
    const text = latest
    latest = ''
    return text
  }
  return { bridge, breakpointsNow }
}

self.onmessage = async (event) => {
  const { id, source = '', stdin = '', debug = null } = event.data ?? {}
  const started = performance.now()
  const stdout = createSink()
  const stderr = createSink()
  let pyodide

  try {
    pyodide = await getPyodide()
    const stdinLines = String(stdin).replace(/\r\n/g, '\n').split('\n')
    let stdinIndex = 0

    pyodide.setStdout(stdout)
    pyodide.setStderr(stderr)
    pyodide.globals.set('__webnest_input', () => stdinLines[stdinIndex++] ?? '')
    pyodide.runPython(`
import builtins
def __webnest_read(prompt=''):
    print(prompt, end='', flush=True)  # CPython writes the prompt to stdout; stdin itself is not echoed
    return __webnest_input()
builtins.input = __webnest_read
`)

    let failure = null
    let trace = null
    if (debug && typeof SharedArrayBuffer !== 'undefined' && debug.control instanceof SharedArrayBuffer) {
      const name = typeof debug.name === 'string' && /^[\w.-]+\.py$/.test(debug.name) ? debug.name : 'main.py'
      const { bridge, breakpointsNow } = pauseBridge(id, debug.control)
      const outcome = JSON.parse(getDebugger(pyodide).debug_file(name, source, JSON.stringify(debug.breakpoints ?? []), bridge, breakpointsNow))
      trace = outcome.trace ?? null
      if (!outcome.ok) failure = outcome.error || 'Python runtime error'
    } else {
      await pyodide.runPythonAsync(source)
    }
    flushStreams(pyodide)

    const out = cap(stdout.text())
    const errText = stderr.text()
    const err = cap(failure ? `${errText}${errText ? '\n' : ''}${failure}` : errText)
    self.postMessage({
      id,
      result: {
        status: failure ? 'runtime_error' : 'success',
        stdout: out.text,
        stderr: err.text,
        runtime_ms: Math.round(performance.now() - started),
        error: failure,
        truncated: out.truncated || err.truncated,
        ...(trace ? { trace } : {}),
      },
    })
  } catch (error) {
    flushStreams(pyodide)
    const out = cap(stdout.text())
    const errText = stderr.text()
    const err = cap(`${errText}${errText ? '\n' : ''}${error?.message ?? String(error)}`)
    self.postMessage({
      id,
      result: {
        status: 'runtime_error',
        stdout: out.text,
        stderr: err.text,
        runtime_ms: Math.round(performance.now() - started),
        error: error?.message ?? 'Python runtime error',
        truncated: out.truncated || err.truncated,
      },
    })
  }
}
