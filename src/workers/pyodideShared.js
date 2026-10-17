// Helpers shared by the Python runner and the backend playground workers.
export const OUTPUT_LIMIT = 64000
export const PYODIDE_INDEX_URL = '/pyodide/'

// Collects raw bytes written to a stream. The line-based `batched` handler drops a final line
// that has no newline (an input() prompt before a crash, print(..., end="")), so use `write`.
export function createSink() {
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
export function flushStreams(pyodide) {
  try {
    pyodide?.runPython('import sys\nsys.stdout.flush()\nsys.stderr.flush()')
  } catch {
    // Nothing useful to report if flushing itself fails.
  }
}

export function cap(text) {
  if (text.length <= OUTPUT_LIMIT) return { text, truncated: false }
  return { text: text.slice(0, OUTPUT_LIMIT), truncated: true }
}
