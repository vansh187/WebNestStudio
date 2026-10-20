import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// The debugger's value snapshot (webnest_runtime.py) runs in Pyodide in the browser; its
// pure-Python parts are checked here with a local CPython 3.12+, when one is installed.
const runtimeDir = fileURLToPath(new URL('../src/workers/python', import.meta.url))
const script = fileURLToPath(new URL('./fixtures/runtime_snapshot_check.py', import.meta.url))

function findPython() {
  for (const command of ['python3', 'python']) {
    const probe = spawnSync(command, ['-c', 'import sys; print(sys.version_info >= (3, 12))'], { encoding: 'utf8' })
    if (probe.status === 0 && probe.stdout.trim() === 'True') return command
  }
  return null
}

const python = findPython()

test('runtime snapshot stays bounded, stable and correct', { skip: python ? false : 'needs Python 3.12+' }, () => {
  // -I: isolated (no user site, no cwd on sys.path); -B: no __pycache__ in src/.
  const run = spawnSync(python, ['-I', '-B', script, runtimeDir], { encoding: 'utf8', timeout: 120000 })
  assert.equal(run.status, 0, run.stderr)
  const r = JSON.parse(run.stdout.trim().split('\n').at(-1))

  // Finding 7: a 100k-row list and a 1 MB string cost little per pause.
  assert.ok(r.big_seconds < 1, `snapshot took ${r.big_seconds}s`)
  assert.equal(r.rows_n, 100000)
  assert.equal(r.rows_shown, 50)
  assert.equal(r.rows_more, 99950)
  assert.ok(r.max_repr <= 200, `repr of ${r.max_repr} chars`)
  assert.ok(r.payload_bytes < 1_000_000, `payload ${r.payload_bytes} bytes`)
  assert.match(r.point_repr, /^Point\(x=1, rows=\[/)
  if (r.bag_repr !== null) assert.match(r.bag_repr, /^Bag\(name='b', items=\[0, 1, 2/)
  // A __repr__ that raises is shown by reprlib as <Broken instance at 0x...>, not raised.
  assert.match(r.broken_repr, /^<(Broken instance at 0x[0-9a-f]+|repr failed: RuntimeError)>$/)
  assert.deepEqual(r.watched_children, ['value'])
  assert.equal(r.property_read, false)

  // Finding 9: set members are labelled by value, in a stable order.
  assert.deepEqual(r.set_first, ["'apple'", "'fig'", "'pear'"])
  assert.deepEqual(r.set_second, ["'apple'", "'banana'", "'fig'", "'pear'"])

  // Finding 8: only 12 frames are sent, but levels count from the outermost one.
  assert.equal(r.deep_count, 12)
  assert.deepEqual(r.deep_levels, Array.from({ length: 12 }, (_, index) => 20 - index))
  assert.deepEqual(r.deep_n.slice(0, 3), ['0', '1', '2'])
})
