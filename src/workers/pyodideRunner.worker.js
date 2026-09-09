import { loadPyodide } from 'pyodide'

let pyodidePromise
const OUTPUT_LIMIT = 64000

function getPyodide() {
  if (!pyodidePromise) pyodidePromise = loadPyodide()
  return pyodidePromise
}

function cap(text) {
  if (text.length <= OUTPUT_LIMIT) return { text, truncated: false }
  return { text: text.slice(0, OUTPUT_LIMIT), truncated: true }
}

self.onmessage = async (event) => {
  const { id, source = '', stdin = '' } = event.data ?? {}
  const started = performance.now()
  const stdout = []
  const stderr = []

  try {
    const pyodide = await getPyodide()
    const stdinLines = String(stdin).replace(/\r\n/g, '\n').split('\n')
    let stdinIndex = 0

    pyodide.setStdout({ batched: (text) => stdout.push(text) })
    pyodide.setStderr({ batched: (text) => stderr.push(text) })
    pyodide.globals.set('__webnest_input', () => stdinLines[stdinIndex++] ?? '')
    pyodide.runPython(`
import builtins
builtins.input = lambda prompt='': __webnest_input()
`)

    await pyodide.runPythonAsync(source)

    const out = cap(stdout.join('\n'))
    const err = cap(stderr.join('\n'))
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
    const out = cap(stdout.join('\n'))
    const err = cap(`${stderr.join('\n')}${stderr.length ? '\n' : ''}${error?.message ?? String(error)}`)
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
