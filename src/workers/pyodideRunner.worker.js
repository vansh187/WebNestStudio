import { loadPyodide } from 'pyodide'
import { PYODIDE_INDEX_URL, cap, createSink, flushStreams } from './pyodideShared'

let pyodidePromise

function getPyodide() {
  if (!pyodidePromise) pyodidePromise = loadPyodide({ indexURL: PYODIDE_INDEX_URL })
  return pyodidePromise
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
