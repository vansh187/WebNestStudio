import test from 'node:test'
import assert from 'node:assert/strict'
import { executeJava, normalizeJavaResult, JAVA_PLAYGROUND_ENDPOINT } from '../src/lib/codelab/javaRunner.js'
import { bundleJavaProject, findJavaMainClasses, qualifiedJavaClass, renameJavaFile, validateJavaClassName } from '../src/lib/codelab/javaProject.js'

test('Java adapter preserves both compiler streams, stack traces, and request ID', () => {
  const result = normalizeJavaResult({
    status: 'runtime_error', requestId: 'trace-123', durationMs: 1200,
    compile: { stdout: 'compiler output', stderr: 'warning', exitCode: 0 },
    run: { stdout: 'before exception', stderr: 'java.lang.IllegalStateException: test\n at Main.main(Main.java:3)', exitCode: 1 },
  })
  assert.equal(result.stdout, 'before exception')
  assert.match(result.stderr, /Main.java:3/)
  assert.equal(result.compile.stdout, 'compiler output')
  assert.equal(result.compile.stderr, 'warning')
  assert.equal(result.exit_code, 1)
  assert.equal(result.request_id, 'trace-123')
  assert.equal(result.runtime_ms, 1200)
})
test('compile failure, timeout, and truncation remain visible without runtime output', () => {
  const failure = normalizeJavaResult({ status: 'compile_error', compile: { stderr: 'Main.java:2: error', exitCode: 1 }, run: null })
  assert.equal(failure.status, 'compile_error')
  assert.equal(failure.compile.exit_code, 1)
  assert.equal(failure.stdout, '')
  const timeout = normalizeJavaResult({ status: 'timeout', phase: 'compile', compile: {} })
  assert.match(timeout.notice, /Compilation/)
  const flood = normalizeJavaResult({ status: 'output_limit', phase: 'run', compile: {}, run: { stdout: 'partial', outputLimitExceeded: true } })
  assert.equal(flood.truncated, true)
  assert.equal(flood.stdout, 'partial')
  assert.match(flood.notice, /output limit/)
})
test('frontend sends Java source, package class name, stdin, and cancellation signal', async () => {
  const controller = new AbortController()
  let request
  const fetchImpl = async (url, options) => {
    request = { url, ...options }
    return { ok: true, json: async () => ({ status: 'success', compile: {}, run: { stdout: 'ok', exitCode: 0 } }) }
  }
  const result = await executeJava({ source: 'java source', className: 'practice.Main', stdin: '42\n' }, { endpoint: '/api/java/run', signal: controller.signal, fetchImpl })
  assert.equal(request.url, '/api/java/run')
  assert.equal(request.signal, controller.signal)
  assert.deepEqual(JSON.parse(request.body), { code: 'java source', className: 'practice.Main', stdin: '42\n', args: [] })
  assert.equal(result.stdout, 'ok')
})
test('unconfigured or unavailable Java services return actionable errors', async () => {
  await assert.rejects(executeJava({ source: 'x' }), /not configured/)
  await assert.rejects(executeJava({}, { endpoint: '/api/java/run', fetchImpl: async () => ({ json: async () => { throw new Error('not JSON') } }) }), /Start npm run dev/)
  await assert.rejects(executeJava({}, { endpoint: '/api/java/run', fetchImpl: async () => ({ ok: false, status: 429, json: async () => ({ error: 'Runner is busy', requestId: 'busy-id' }) }) }), /busy-id/)
  assert.throws(() => normalizeJavaResult({}), /invalid response/)
})

const REMOTE = JAVA_PLAYGROUND_ENDPOINT
function axiosError(status, data) {
  return Object.assign(new Error(`Request failed with status code ${status}`), { isAxiosError: true, response: { status, data } })
}

test('production endpoint posts through the shared axios client without a token', async () => {
  const controller = new AbortController()
  let call
  const httpClient = { post: async (url, body, config) => {
    call = { url, body, config }
    return { data: { requestId: 'r1', status: 'success', phase: 'run', javaVersion: '17', durationMs: 900, compile: { exitCode: 0 }, run: { stdout: 'Hello', exitCode: 0 } } }
  } }
  const fetchImpl = async () => { throw new Error('fetch must not be used for the remote endpoint') }
  const result = await executeJava({ source: 'class Main {}', stdin: 'x' }, { endpoint: REMOTE, signal: controller.signal, httpClient, fetchImpl })
  assert.equal(call.url, REMOTE)
  assert.deepEqual(call.body, { code: 'class Main {}', className: 'Main', stdin: 'x', args: [] })
  assert.equal(call.config.signal, controller.signal)
  assert.equal(call.config.headers, undefined)
  assert.equal(result.stdout, 'Hello')
  assert.equal(result.request_id, 'r1')
})

test('production errors surface the backend detail and HTTP status', async () => {
  const reject = (err) => ({ post: async () => { throw err } })
  const limited = await executeJava({}, { endpoint: REMOTE, httpClient: reject(axiosError(429, { detail: 'Java playground is paused for today.' })) }).catch((e) => e)
  assert.equal(limited.status, 429)
  assert.equal(limited.message, 'Java playground is paused for today.')
  const down = await executeJava({}, { endpoint: REMOTE, httpClient: reject(axiosError(503, { detail: 'Java runner unavailable' })) }).catch((e) => e)
  assert.equal(down.status, 503)
  assert.match(down.message, /runner unavailable/)
  const invalid = await executeJava({}, { endpoint: REMOTE, httpClient: reject(axiosError(422, { detail: [{ msg: 'code is too long' }] })) }).catch((e) => e)
  assert.equal(invalid.message, 'code is too long')
  const offline = Object.assign(new Error('Network Error'), { isAxiosError: true })
  await assert.rejects(executeJava({}, { endpoint: REMOTE, httpClient: reject(offline) }), (e) => e === offline)
})

test('local relative endpoint keeps using fetch even when an axios client is supplied', async () => {
  let fetched = false
  const httpClient = { post: async () => { throw new Error('axios must not be used locally') } }
  const fetchImpl = async () => { fetched = true; return { ok: true, json: async () => ({ status: 'success', compile: {}, run: { stdout: 'local' } }) } }
  const result = await executeJava({ source: 'x' }, { endpoint: '/api/java/run', httpClient, fetchImpl })
  assert.equal(fetched, true)
  assert.equal(result.stdout, 'local')
})

test('multi-file Java projects are bundled into one source and errors map back to each file', async () => {
  const files = [
    { name: 'Main.java', content: 'package app;\n\nimport java.util.List;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(new Dog("Rex").sound());\n    }\n}\n' },
    { name: 'Animal.java', content: 'package app;\n\nimport java.util.List;\n\npublic abstract class Animal {\n    public abstract String sound();\n}\n' },
    { name: 'Dog.java', content: 'package app;\nimport app.Animal;\npublic class Dog extends Animal {\n    private final String name;\n    public Dog(String name) { this.name = name; }\n    public String sound() { return name + " says \\"public class\\""; }\n}\n' },
  ]
  let call
  const httpClient = { post: async (url, body) => {
    call = body
    return { data: { status: 'runtime_error', compile: { exitCode: 0, stderr: '' }, run: { stderr: `boom\n\tat Dog.sound(Main.java:${body.code.split('\n').findIndex((l) => l.includes('String sound() { return')) + 1})`, exitCode: 1 } } }
  } }
  const result = await executeJava({ language: 'java', files, className: 'app.Main' }, { endpoint: REMOTE, httpClient })
  assert.equal(call.className, 'app.Main')
  assert.equal(call.code.match(/^package app;/gm).length, 1)
  assert.equal(call.code.match(/import java\.util\.List;/g).length, 1)
  assert.doesNotMatch(call.code, /import app\./)
  assert.doesNotMatch(call.code, /^public\b/m)
  assert.match(call.code, /says \\"public class\\"/)
  assert.match(call.code, /public Dog\(String name\)/)
  assert.match(result.stderr, /at Dog\.sound\(Dog\.java:6\)/)
})

test('project helpers find main classes, validate names and rename declarations', () => {
  const files = [
    { name: 'Main.java', content: 'public class Main {\n  public static void main(String[] args) {}\n}\n' },
    { name: 'App.java', content: '// static void main(String[] a) in a comment\nclass App { public static void main(String... args) {} }\n' },
    { name: 'Dog.java', content: 'public class Dog {\n  public Dog() {}\n  Dog copy() { return new Dog(); }\n}\n' },
  ]
  assert.deepEqual(findJavaMainClasses(files), ['Main', 'App'])
  assert.equal(validateJavaClassName('Cat', files), '')
  assert.match(validateJavaClassName('dog.java', files), /already exists/)
  assert.match(validateJavaClassName('class', files), /keyword/)
  assert.match(validateJavaClassName('2Fast', files), /letters/)
  const renamed = renameJavaFile(files, 'Dog.java', 'Puppy').find((f) => f.name === 'Puppy.java')
  assert.equal(renamed.content, 'public class Puppy {\n  public Puppy() {}\n  Puppy copy() { return new Puppy(); }\n}\n')
  assert.equal(qualifiedJavaClass([{ name: 'App.java', content: 'package practice;\nclass App {}\n' }], 'App'), 'practice.App')
  assert.equal(qualifiedJavaClass(files, 'App'), 'App')
})

test('imports of project members are rewritten to the bundle package, not dropped', () => {
  const bundle = bundleJavaProject([
    { name: 'Main.java', content: 'package app;\nimport static app.util.Maths.square;\nimport static app.Color.*;\nimport app.Outer.Inner;\nimport app.Outer;\nimport app.util.*;\npublic class Main { public static void main(String[] a) { app.util.Maths m = null; Object o = new Inner(); } }\n' },
    { name: 'Maths.java', content: 'package app.util;\npublic class Maths { public static int square(int x) { return x * x; } }\n' },
    { name: 'Color.java', content: 'package app;\npublic enum Color { RED }\n' },
    { name: 'Outer.java', content: 'package app;\npublic class Outer { public static class Inner {} }\n' },
  ], 'Main')
  assert.equal(bundle.className, 'app.Main')
  assert.match(bundle.code, /^package app;\nimport static app\.Maths\.square;\nimport static app\.Color\.\*;\n/)
  assert.doesNotMatch(bundle.code, /import app\.Outer;|import app\.util/)
  // The nested type stays reachable, whether imported or written out in full.
  assert.match(bundle.code, /import app\.Outer\.Inner;|new app\.Outer\.Inner\(\)/)
  assert.match(bundle.code, /app\.Maths m = null;/)
})

test('conflicting single-type imports are qualified in the importing file only', () => {
  const bundle = bundleJavaProject([
    { name: 'Main.java', content: 'import java.util.Date;\nimport java.util.List;\npublic class Main { public static void main(String[] a) { Date d = new Date(); List<Stack> s; } }\n' },
    { name: 'Report.java', content: 'import java.sql.Date;\nimport java.util.List;\nclass Report { Date d = Date.valueOf("2026-01-01"); x.Date y; String t = "Date"; }\n' },
    { name: 'Stack.java', content: 'class Stack {}\n' },
    { name: 'Legacy.java', content: 'import java.util.Stack;\nclass Legacy { Stack<Integer> s = new Stack<>(); }\n' },
  ], 'Main')
  const [header] = bundle.code.split('class')
  assert.equal(header.trim(), 'import java.util.List;')
  assert.match(bundle.code, /java\.util\.Date d = new java\.util\.Date\(\); List<Stack> s;/)
  assert.match(bundle.code, /java\.sql\.Date d = java\.sql\.Date\.valueOf\("2026-01-01"\); x\.Date y; String t = "Date";/)
  assert.match(bundle.code, /java\.util\.Stack<Integer> s = new java\.util\.Stack<>\(\);/)
})
