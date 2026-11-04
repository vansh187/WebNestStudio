import test from 'node:test'
import assert from 'node:assert/strict'
import { instrumentScript, instrumentWebFiles } from '../src/lib/codelab/jsInstrument.js'
import { installWebDebugger } from '../src/lib/codelab/webDebugRuntime.js'

// Runs `code` with `log` and a recorder; returns what it logged and what was recorded.
function execute(code, { recorder = null } = {}) {
  const logged = []
  const batches = []
  const target = {}
  const wn = recorder ? installWebDebugger(target, ['script.js'], (batch) => batches.push(batch), recorder) : undefined
  // eslint-disable-next-line no-new-func
  const run = new Function('__wn', 'log', code)
  let error = null
  try {
    run(wn, (...args) => logged.push(args.map((value) => (typeof value === 'string' ? value : JSON.stringify(value))).join(' ')))
  } catch (failure) {
    error = `${failure?.name}: ${failure?.message}`
  }
  wn?.flush()
  const steps = batches.flatMap((batch) => batch.steps)
  const calls = batches.flatMap((batch) => batch.calls)
  const ends = new Map(batches.flatMap((batch) => batch.ends).map((end) => [end.id, end]))
  return { logged, error, steps, calls, ends, truncated: batches.some((batch) => batch.truncated) }
}

// The original and the instrumented code must behave the same.
function same(code) {
  const done = instrumentScript(code)
  assert.equal(done.error, undefined, done.error)
  assert.equal(done.code.split('\n').length, code.split('\n').length, 'line count changed')
  const plain = execute(code)
  const recorded = execute(done.code, { recorder: {} })
  assert.deepEqual(recorded.logged, plain.logged)
  assert.equal(recorded.error, plain.error)
  return recorded
}

const SAMPLES = {
  loopsAndFunctions: `
function square(n) {
  const result = n * n
  return result
}
let total = 0
for (const value of [1, 2, 3]) total += square(value)
log(total)`,
  braceless: `
let n = 0
if (n === 0) n = 1; else n = 2
while (n < 5) n++
for (let i = 0; i < 3; i++) if (i % 2) log('odd', i); else log('even', i)
do n--; while (n > 3)
log(n)`,
  arrowsAndObjects: `
const make = (a, b = 2) => ({ a, b, sum: a + b })
const twice = x => x * 2
const nested = (x) => (y) => x + y
log(make(1), twice(4), nested(1)(2), [1, 2, 3].map(v => v * 10))`,
  classes: `
class Animal {
  static count = 0
  #secret = 1
  constructor(name) { this.name = name; Animal.count++ }
  get label() { return 'Animal ' + this.name }
  speak() { return this.name + ' makes a sound' }
}
class Dog extends Animal {
  constructor(name) {
    super(name)
    this.kind = 'dog'
  }
  speak() { return super.speak() + ' (woof)' }
}
const dog = new Dog('Rex')
log(dog.speak(), dog.label, Animal.count, dog.kind)`,
  errorsAndControl: `
function risky(x) {
  if (x > 2) throw new RangeError('too big: ' + x)
  return x
}
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 2) continue outer
    if (i === 2) break outer
    log(i, j)
  }
}
try { risky(5) } catch (error) { log('caught', error.message) } finally { log('finally') }
switch (risky(2)) {
  case 1: log('one'); break
  case 2: { log('two'); break }
  default: log('other')
}`,
  hoistingAndTdz: `
'use strict'
log(typeof later, hoisted())
function hoisted() { return 'hoisted' }
var later = 1
{
  const inner = later + 1
  log(inner)
}
log(\`template \${later} \${/a+b/.test('aab')} \${({ x: 1 })?.x}\`)`,
  generatorsAndAsync: `
function* count(limit) {
  for (let i = 0; i < limit; i++) yield i
}
log([...count(3)])
async function later() { return 5 }
const promise = later()
log(typeof promise.then)`,
  recursion: `
function fact(n) { return n <= 1 ? 1 : n * fact(n - 1) }
log(fact(5))`,
}

for (const [name, code] of Object.entries(SAMPLES)) {
  test(`instrumented code behaves like the original: ${name}`, () => {
    same(code)
  })
}

test('steps carry the line, the call stack and the variables in scope', () => {
  const recorded = same(SAMPLES.loopsAndFunctions)
  const inSquare = recorded.steps.filter((step) => step.fn === 'square')
  assert.deepEqual([...new Set(inSquare.map((step) => step.line))], [3, 4])
  const first = inSquare[0]
  assert.equal(first.depth, 1)
  assert.deepEqual(first.stack.map((frame) => frame.fn), ['square'])
  assert.deepEqual(first.vars.find((v) => v.k === 'n'), { t: 'number', r: '1', k: 'n' })
  // `result` is still in its temporal dead zone at line 3, so it is left out, not an error.
  assert.equal(first.vars.some((v) => v.k === 'result'), false)
  const atReturn = inSquare.find((step) => step.line === 4)
  assert.equal(atReturn.vars.find((v) => v.k === 'result').r, '1')
  // A function's frame shows its own variables; outer ones are in the frames further out.
  assert.deepEqual(atReturn.vars.map((v) => v.k).sort(), ['n', 'result'])
  const global = recorded.steps.find((step) => step.fn === '(global)' && step.line === 8)
  assert.equal(global.vars.find((v) => v.k === 'total').r, '14')
  assert.equal(global.vars.some((v) => v.k === 'square'), false, 'top-level functions are not data')
})

test('calls are recorded with nesting, time and the error thrown', () => {
  const recorded = same(SAMPLES.errorsAndControl)
  const risky = recorded.calls.filter((call) => call.fn === 'risky')
  assert.equal(risky.length, 2)
  assert.equal(recorded.ends.get(risky[0].id).error, 'RangeError')
  assert.equal(recorded.ends.get(risky[1].id).error, null)
  assert.deepEqual(risky[0].params.map((p) => [p.k, p.r]), [['x', '5']])
  const fact = same(SAMPLES.recursion).calls.filter((call) => call.fn === 'fact')
  assert.deepEqual(fact.map((call) => call.depth), [0, 1, 2, 3, 4])
})

test('values are shown like the console, with children to open', () => {
  const recorded = same(`
const user = { name: 'Asha', tags: ['a', 'b'], nested: { deep: { deeper: { deepest: 1 } } } }
const map = new Map([['k', 1]])
const set = new Set([1, 2])
const nothing = null
log('done')`)
  const step = recorded.steps.at(-1)
  const byName = Object.fromEntries(step.vars.map((v) => [v.k, v]))
  assert.equal(byName.user.r, '{name: "Asha", tags: ["a", "b"], nested: {deep: Object}}')
  assert.deepEqual(byName.user.c.map((c) => [c.k, c.a]), [['name', 1], ['tags', 1], ['nested', 1]])
  assert.equal(byName.user.c[1].n, 2)
  assert.equal(byName.map.r, 'Map(1)')
  assert.deepEqual(byName.map.c.map((c) => [c.k, c.r]), [['"k"', '1']])
  assert.equal(byName.set.n, 2)
  assert.equal(byName.nothing.r, 'null')
})

test('names are inferred for anonymous functions, methods and arrows', () => {
  const recorded = same(SAMPLES.classes)
  const names = new Set(recorded.calls.map((call) => call.fn))
  for (const name of ['constructor', 'label', 'speak']) assert.ok(names.has(name), name)
  const arrows = same(SAMPLES.arrowsAndObjects).calls.map((call) => call.fn)
  assert.ok(arrows.includes('make') && arrows.includes('twice') && arrows.includes('nested'))
})

test('recording stops at the step limit and the program still finishes', () => {
  const code = 'let sum = 0\nfor (let i = 0; i < 1000; i++) sum += i\nlog(sum)'
  const done = instrumentScript(code)
  const recorded = execute(done.code, { recorder: { maxSteps: 50 } })
  assert.deepEqual(recorded.logged, ['499500'])
  assert.equal(recorded.steps.length, 50)
  assert.equal(recorded.truncated, true)
})

test('a script that does not parse is reported with its line', () => {
  assert.match(instrumentScript('let a = 1\nlet = = 2').error, /line 2/)
  assert.match(instrumentScript('x', { lineOffset: 9 }).error ?? 'parsed', /parsed/)
})

test('script.js and inline scripts in index.html are instrumented, keeping their lines', () => {
  const html = '<main>\n  <h1>Hi</h1>\n</main>\n<script>\nconst a = 1\nlog(a)\n</script>\n<script src="x.js"></script>\n<script type="application/json">{"a":1}</script>'
  const { files, scriptFiles, problems } = instrumentWebFiles([
    { name: 'index.html', content: html },
    { name: 'script.js', content: 'const b = 2\nlog(b)' },
    { name: 'style.css', content: 'body{}' },
  ])
  assert.deepEqual(problems, [])
  assert.deepEqual(scriptFiles, ['index.html', 'script.js'])
  const page = files.find((f) => f.name === 'index.html').content
  assert.equal(page.split('\n').length, html.split('\n').length)
  // The inline script's statements carry index.html's line numbers (5 and 6).
  assert.match(page, /__wn\.s\(0,5,/)
  assert.match(page, /__wn\.s\(0,6,/)
  assert.ok(page.includes('<script src="x.js"></script>') && page.includes('{"a":1}'))
  assert.match(files.find((f) => f.name === 'script.js').content, /__wn\.s\(1,1,/)
  assert.equal(files.find((f) => f.name === 'style.css').content, 'body{}')
  const broken = instrumentWebFiles([{ name: 'script.js', content: 'let = =' }])
  assert.equal(broken.problems[0].file, 'script.js')
  assert.equal(broken.files[0].content, 'let = =')
})

test("a function's 'use strict' stays its first statement", () => {
  const recorded = same("function loose() { return this === undefined }\nfunction strict() { 'use strict'; return this === undefined }\nlog(loose(), strict())")
  assert.ok(recorded.logged.length === 1)
})

test('the player turns a step into a pause and steps forwards and backwards', async () => {
  const { pauseAt, target, startIndex, traceCalls } = await import('../src/lib/codelab/tracePlayer.js')
  const recorded = same(SAMPLES.loopsAndFunctions)
  const { steps } = recorded
  const breakpoints = [{ file: 'script.js', line: 4 }]
  const start = startIndex(steps, breakpoints)
  assert.equal(steps[start].line, 4)
  const pause = pauseAt(steps, start)
  assert.deepEqual(pause.frames.map((frame) => frame.fn), ['square', '(global)'])
  assert.equal(pause.frames[0].vars.find((v) => v.k === 'result').r, '1')
  assert.equal(pause.frames[1].line, 7, 'the global frame shows the line that made the call')
  assert.deepEqual(pause.frames.map((frame) => frame.level), [1, 0])
  // Continue goes to the next hit (n = 2), reverse comes back.
  const next = target(steps, start, 'continue', breakpoints)
  assert.equal(pauseAt(steps, next).frames[0].vars.find((v) => v.k === 'n').r, '2')
  assert.equal(target(steps, next, 'reverse', breakpoints), start)
  // Step out lands back in the global code; step over from the global code skips the call.
  const out = target(steps, start, 'out')
  assert.equal(steps[out].depth, 0)
  // The loop body's step just before it calls square().
  const loopStep = steps.findIndex((step, i) => step.fn === '(global)' && step.line === 7 && steps[i + 1]?.depth === 1)
  const over = target(steps, loopStep, 'over')
  assert.equal(steps[over].depth, 0)
  assert.ok(over > loopStep + 1)
  assert.equal(target(steps, over, 'backOver'), loopStep)
  assert.equal(target(steps, 0, 'back'), 0)
  assert.equal(target(steps, steps.length - 1, 'into'), steps.length - 1)
  // The trace: each call with its end and the first step inside it.
  const calls = traceCalls(recorded.calls, recorded.ends, steps)
  assert.deepEqual(calls.map((call) => call.fn), ['square', 'square', 'square'])
  assert.equal(steps[calls[1].step].frame, calls[1].id)
  assert.ok(calls.every((call) => typeof call.ms === 'number' && call.error === null))
})

test('hover and inline values read JavaScript comments and strings; Python is unchanged', async () => {
  const { maskNonCode, expressionAt } = await import('../src/lib/codelab/debugValues.js')
  assert.equal(maskNonCode('a = 1 // b', 'javascript'), 'a = 1     ')
  assert.equal(maskNonCode('x /* y */ z', 'javascript'), 'x         z')
  assert.equal(maskNonCode('s = `t ${u}`', 'javascript').length, 'x = `t ${u}`'.length)
  assert.equal(maskNonCode('a = #b', 'javascript'), 'a = #b', '# is not a comment in JavaScript')
  assert.equal(maskNonCode('a = 1  # b'), 'a = 1     ', 'Python still treats # as a comment')
  assert.equal(expressionAt('const total = user.name // user', 15, 'javascript').expression, 'user')
  assert.equal(expressionAt('const total = user.name // user', 21, 'javascript').expression, 'user.name')
  assert.equal(expressionAt('const total = user.name // user', 28, 'javascript'), null)
  assert.equal(expressionAt('log(`${hidden}`)', 8, 'javascript'), null)
})
