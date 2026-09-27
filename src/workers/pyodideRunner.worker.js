import { loadPyodide } from 'pyodide'

let pyodidePromise
const OUTPUT_LIMIT = 64000
const PYODIDE_INDEX_URL = '/pyodide/'

function getPyodide() {
  if (!pyodidePromise) pyodidePromise = loadPyodide({ indexURL: PYODIDE_INDEX_URL })
  return pyodidePromise
}

// Collects raw bytes written to a stream. The line-based `batched` handler drops a final line
// that has no newline (an input() prompt before a crash, print(..., end="")), so use `write`.
function createSink() {
  const decoder = new TextDecoder()
  const chunks = []
  return {
    write(buffer) {
      chunks.push(decoder.decode(buffer, { stream: true }))
      return buffer.length
    },
    text() {
      return (chunks.join('') + decoder.decode()).replace(/\n$/, '')
    },
  }
}

// Python buffers sys.stdout; flush after each run so nothing is left behind for the next one.
function flushStreams(pyodide) {
  try {
    pyodide?.runPython('import sys\nsys.stdout.flush()\nsys.stderr.flush()')
  } catch {
    // Nothing useful to report if flushing itself fails.
  }
}

function cap(text) {
  if (text.length <= OUTPUT_LIMIT) return { text, truncated: false }
  return { text: text.slice(0, OUTPUT_LIMIT), truncated: true }
}

self.onmessage = async (event) => {
  const { id, source = '', stdin = '' } = event.data ?? {}
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

    await pyodide.runPythonAsync(source)
    flushStreams(pyodide)

    const out = cap(stdout.text())
    const err = cap(stderr.text())
    self.postMessage({
      id,
      result: {
        status: 'success',
        stdout: out.text,
        stderr: err.text,
        runtime_ms: Math.round(performance.now() - started),
        error: null,
        truncated: out.truncated || err.truncated,
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
