import test from 'node:test'
import assert from 'node:assert/strict'
import { changedPaths, expressionAt, formatTree, inlineValues, maskNonCode, pathKey, resolveExpression } from '../src/lib/codelab/debugValues.js'

// Shaped like _snapshot_frames in webnest_runtime.py.
const frame = {
  fn: 'create_task', file: 'app/services/tasks.py', line: 6, first: 3,
  vars: [
    { k: 'payload', t: 'TaskIn', r: "TaskIn(title='Milk', tags=['a', 'b'])", c: [
      { k: 'title', a: 1, t: 'str', r: "'Milk'", n: 4 },
      { k: 'tags', a: 1, t: 'list', r: "['a', 'b']", n: 2, c: [
        { k: '0', t: 'str', r: "'a'", n: 1 },
        { k: '1', t: 'str', r: "'b'", n: 1 },
      ] },
    ] },
    { k: 'row', t: 'dict', r: "{'id': 7}", n: 1, c: [{ k: "'id'", t: 'int', r: '7' }] },
    { k: 'i', t: 'int', r: '1' },
    { k: 'pair', t: 'tuple', r: '(1, 2)', n: 2, c: [{ k: '0', t: 'int', r: '1' }, { k: '1', t: 'int', r: '2' }] },
  ],
}

test('expressionAt stops at the hovered segment', () => {
  const line = '    title = payload.title.strip()'
  assert.equal(expressionAt(line, line.indexOf('payload') + 2).expression, 'payload')
  const hit = expressionAt(line, line.indexOf('.title') + 3)
  assert.equal(hit.expression, 'payload.title')
  assert.equal(hit.startColumn, line.indexOf('payload') + 1)
  assert.equal(expressionAt('x = foo().bar', 11), null)
  assert.equal(expressionAt('v = payload.tags[i]', 18).expression, 'i')
  assert.equal(expressionAt('v = payload.tags[i]', 19).expression, 'payload.tags[i]')
})

test('resolveExpression follows attributes, items and index variables', () => {
  assert.equal(resolveExpression(frame, 'payload.title').node.r, "'Milk'")
  assert.equal(resolveExpression(frame, 'row["id"]').node.r, '7')
  assert.equal(resolveExpression(frame, "row['id']").node.r, '7')
  assert.equal(resolveExpression(frame, 'payload.tags[i]').node.r, "'b'")
  assert.equal(resolveExpression(frame, 'pair[-1]').node.r, '2')
  assert.deepEqual(resolveExpression(frame, 'payload.tags[0]').path, ['payload', 'tags', '0'])
  assert.equal(resolveExpression(frame, 'payload.missing'), null)
  assert.equal(resolveExpression(frame, 'unknown'), null)
})

test('changedPaths marks values a step changed, matching frames from the outside', () => {
  const before = structuredClone(frame)
  const after = structuredClone(frame)
  after.vars[2].r = '2'
  after.vars[0].c[1].c[1].r = "'c'"
  after.vars[0].c[1].r = "['a', 'c']"
  after.vars.push({ k: 'task', t: 'Task', r: 'Task(id=7)' })
  const inner = { fn: 'save', file: 'app/repositories/tasks.py', line: 2, first: 1, vars: [] }
  const [innerChanged, outerChanged] = changedPaths([inner, after], [before])
  assert.equal(innerChanged.size, 0)
  assert.ok(outerChanged.has(pathKey(['i'])))
  assert.ok(outerChanged.has(pathKey(['payload', 'tags', '1'])))
  assert.ok(outerChanged.has(pathKey(['task'])))
  assert.ok(!outerChanged.has(pathKey(['row'])))
  assert.deepEqual(changedPaths([after], null)[0].size, 0)
})

test('changedPaths lines frames up by level when deep recursion trims the stack', () => {
  // 15 learner frames of fact(); only the innermost 12 are sent (levels 14..3).
  const stack = (depth, count) => Array.from({ length: count }, (_, index) => {
    const level = depth - 1 - index
    return { fn: 'fact', file: 'app/m.py', line: 2, first: 1, level, vars: [{ k: 'n', t: 'int', r: String(level) }] }
  })
  const before = stack(15, 12)
  const after = stack(16, 12) // stepped one level deeper: levels 15..4
  const marks = changedPaths(after, before)
  assert.equal(marks[0].size, 0, 'the new innermost frame has nothing to compare with')
  for (let index = 1; index < after.length; index += 1) {
    assert.equal(marks[index].size, 0, `frame at level ${after[index].level} did not change`)
  }
  // The same frames without `level` (older snapshots) would be compared one level off.
  const strip = (frames) => frames.map(({ level: _level, ...rest }) => rest)
  assert.ok(changedPaths(strip(after), strip(before)).slice(1).some((set) => set.size > 0))
})

test('set members keyed by their repr keep their marks when the set grows', () => {
  const tags = (members) => ({ fn: 'f', file: 'app/m.py', line: 1, first: 1, level: 0, vars: [
    { k: 'tags', t: 'set', r: `{${members.join(', ')}}`, n: members.length, c: members.map((m) => ({ k: m, t: 'str', r: m })) },
  ] })
  const [marks] = changedPaths([tags(["'a'", "'b'", "'c'"])], [tags(["'a'", "'b'"])])
  assert.ok(marks.has(pathKey(['tags'])))
  assert.ok(marks.has(pathKey(['tags', "'c'"])))
  assert.ok(!marks.has(pathKey(['tags', "'a'"])))
  assert.ok(!marks.has(pathKey(['tags', "'b'"])))
  // A set is not subscriptable, so `tags[0]` resolves to nothing.
  assert.equal(resolveExpression(tags(["'a'"]), 'tags[0]'), null)
})

test('names inside strings and comments are not hovered', () => {
  const line = 'log("payload is", payload)  # payload here'
  assert.equal(expressionAt(line, line.indexOf('payload') + 2), null)
  assert.equal(expressionAt(line, line.lastIndexOf('payload') + 2), null)
  assert.equal(expressionAt(line, line.indexOf(', payload') + 4).expression, 'payload')
  assert.equal(expressionAt('x = """doc with payload', 20), null)
  const escaped = 'msg = "say \\"hi\\" payload" + payload'
  assert.equal(expressionAt(escaped, escaped.indexOf('payload') + 2), null)
  assert.equal(expressionAt(escaped, escaped.lastIndexOf('payload') + 2).expression, 'payload')
  // A string key in a subscript still belongs to the expression.
  assert.equal(expressionAt('v = row["id"]', 5).expression, 'row')
  assert.equal(expressionAt('v = row["id"]', 10), null)
  assert.equal(maskNonCode('a = "x#y"  # c').length, 'a = "x#y"  # c'.length)
  assert.equal(maskNonCode('a = "x#y"  # c'), 'a = "   "     ')
})

test('expressionAt is safe at the edges of a line', () => {
  assert.equal(expressionAt('', 1), null)
  assert.equal(expressionAt('abc', 0), null)
  assert.equal(expressionAt('abc', 99), null)
  assert.equal(expressionAt('abc', 4), null)
  assert.equal(expressionAt('abc', 3).expression, 'abc')
})

test('inlineValues lists used variables up to the paused line', () => {
  const source = [
    'from x import y',
    '',
    'def create_task(payload, row, i, pair):',
    '    # payload is ignored here',
    '    name = "row"',
    '    return payload.tags[i]',
    '    pair = 3',
  ].join('\n')
  const values = inlineValues(frame, source, new Set([pathKey(['i'])]))
  assert.deepEqual(values.map((item) => item.line), [3, 6])
  assert.equal(values[1].text, "payload = TaskIn(title='Milk', tags=['a', 'b']), i = 1")
  assert.equal(values[1].changed, true)
})

test('formatTree prints nested values', () => {
  assert.equal(formatTree(frame.vars[0]), "title: 'Milk'\ntags: list, 2 items\n  0: 'a'\n  1: 'b'")
  assert.equal(formatTree(frame.vars[2]), '1')
})
