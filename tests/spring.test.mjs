import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SPRING_MAX_WRITES, findSpringMainClass, isSpringRunnable, languageForSpringFile, maskJava, nextWrites, runProblem,
  springFileTemplate, springOpenApi, toOutputResult, toRunnerRequest, toTesterResponse, validateSpringPath,
} from '../src/lib/codelab/springProject.js'
import { listEndpoints, requestTemplate } from '../src/lib/codelab/openapi.js'

const SAMPLES = fileURLToPath(new URL('../src/data/springStarters/', import.meta.url))

async function sample(id) {
  const root = path.join(SAMPLES, id)
  const walk = async (dir) => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(async (entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return [{ name: path.relative(root, full).split(path.sep).join('/'), content: await readFile(full, 'utf8') }]
  }))).flat()
  return walk(root)
}

const endpointIds = (files) => listEndpoints(springOpenApi(files)).map((endpoint) => endpoint.id).sort()

test('the samples list their endpoints for the API tester', async () => {
  assert.deepEqual(endpointIds(await sample('hello')), ['GET /api/hello', 'GET /api/hello/{name}', 'POST /api/greetings'])
  assert.deepEqual(endpointIds(await sample('tasks')), [
    'DELETE /api/tasks/{id}', 'GET /api/tasks', 'GET /api/tasks/{id}', 'POST /api/tasks', 'PUT /api/tasks/{id}',
  ])
  assert.deepEqual(endpointIds(await sample('library')), [
    'DELETE /api/books/{id}', 'GET /api/authors', 'GET /api/authors/{authorId}/books', 'GET /api/books', 'POST /api/authors', 'POST /api/books',
  ])
})

test('the API tester pre-fills path values, query parameters and JSON bodies', async () => {
  const library = springOpenApi(await sample('library'))
  const endpoints = listEndpoints(library)
  const add = requestTemplate(endpoints.find((e) => e.id === 'POST /api/books'), library)
  assert.equal(add.contentType, 'application/json')
  assert.deepEqual(Object.keys(JSON.parse(add.body)), ['title', 'publishedYear', 'authorId'])
  assert.equal(typeof JSON.parse(add.body).publishedYear, 'number')
  const byAuthor = requestTemplate(endpoints.find((e) => e.id === 'GET /api/authors/{authorId}/books'), library)
  assert.deepEqual(byAuthor.pathParams.map((p) => p.name), ['authorId'])
  const search = requestTemplate(endpoints.find((e) => e.id === 'GET /api/books'), library)
  assert.deepEqual(search.query.map((q) => [q.name, q.enabled]), [['title', false]])

  const tasks = springOpenApi(await sample('tasks'))
  const list = listEndpoints(tasks).find((e) => e.id === 'GET /api/tasks')
  assert.deepEqual(list.operation.parameters.map((p) => [p.name, p.in, p.required]), [['done', 'query', false]])
  assert.equal(list.tag, 'Task')

  const hello = springOpenApi(await sample('hello'))
  const greet = requestTemplate(listEndpoints(hello).find((e) => e.id === 'POST /api/greetings'), hello)
  assert.deepEqual(JSON.parse(greet.body), { name: 'text', times: 1 })
})

test('endpoints inside comments and strings are ignored, and mapping styles are read', () => {
  const files = [{
    name: 'src/main/java/p/ApiController.java',
    content: `package p;
// @GetMapping("/commented")
/* @PostMapping("/blocked") */
@RestController
@RequestMapping(path = "/v1/")
class ApiController {
  String s = "@DeleteMapping(\\"/in-string\\")";
  @GetMapping
  public List<String> all() { return List.of(); }
  @GetMapping(value = {"/a", "/b"})
  public String two() { return ""; }
  @PutMapping("/items/{itemId}")
  @ResponseStatus(HttpStatus.OK)
  public Item put(@PathVariable("itemId") long id, @RequestParam(name = "dry", required = false) boolean dry, @Valid @RequestBody Item item) { return item; }
}
record Item(String name, List<Integer> sizes, Tag tag) {}
record Tag(String label) {}`,
  }]
  const doc = springOpenApi(files)
  assert.deepEqual(endpointIds(files), ['GET /v1', 'GET /v1/a', 'GET /v1/b', 'PUT /v1/items/{itemId}'])
  const put = doc.paths['/v1/items/{itemId}'].put
  assert.deepEqual(put.parameters.map((p) => [p.name, p.in, p.required]), [['itemId', 'path', true], ['dry', 'query', false]])
  assert.deepEqual(put.requestBody.content['application/json'].schema, {
    type: 'object',
    properties: { name: { type: 'string' }, sizes: { type: 'array', items: { type: 'integer' } }, tag: { type: 'object', properties: { label: { type: 'string' } } } },
  })
  // Plain Java, a broken file or no controller at all: no endpoints, and nothing throws.
  assert.deepEqual(endpointIds([{ name: 'src/main/java/p/X.java', content: '@RestController class {' }]), [])
  assert.deepEqual(endpointIds([{ name: 'src/main/resources/data.sql', content: '@GetMapping("/x")' }]), [])
  assert.deepEqual(endpointIds([]), [])
})

test('masking keeps positions and line breaks', () => {
  const code = 'a // x "y"\n/* @A\n */ "q(" \'(\' """\nz\n""" b'
  const masked = maskJava(code)
  assert.equal(masked.length, code.length)
  assert.equal(masked.split('\n').length, code.split('\n').length)
  assert.doesNotMatch(masked, /[@(xyqz]/)
  assert.match(masked, /^a .* b$/s)
})

test('the main class is found from @SpringBootApplication', async () => {
  assert.equal(findSpringMainClass(await sample('tasks')), 'com.example.demo.DemoApplication')
  assert.equal(findSpringMainClass([{ name: 'src/main/java/org/acme/shop/ShopApp.java', content: 'package org.acme.shop;\n@SpringBootApplication public class ShopApp {}' }]), 'org.acme.shop.ShopApp')
  // Only in a comment: not the main class.
  assert.equal(findSpringMainClass([{ name: 'src/main/java/a/B.java', content: 'package a; // @SpringBootApplication\nclass B {}' }]), 'com.example.demo.DemoApplication')
})

test('file paths follow the runner rules', async () => {
  const files = await sample('tasks')
  const ok = (name) => assert.equal(validateSpringPath(name, files), '', name)
  const bad = (name, pattern) => assert.match(validateSpringPath(name, files), pattern, name)
  ok('src/main/java/com/example/demo/task/TaskMapper.java')
  ok('src/main/resources/schema.sql')
  bad('pom.xml', /already exists/)
  assert.equal(validateSpringPath('pom.xml', files.filter((file) => file.name !== 'pom.xml')), '')
  bad('', /Enter a file name/)
  bad('src/main/java/Hello.java', /package folder/)
  bad('src/main/java/com/example/class/Hello.java', /"class" is not a valid/)
  bad('src/main/java/com/1bad/Hello.java', /"1bad" is not a valid/)
  bad('src/main/java/com/example/Hello.kt', /src\/main\/java/)
  bad('src/main/resources/application.yml', /application.properties/)
  bad('app/main.py', /src\/main\/java/)
  bad('src/main/java/com/example/demo/task/TASK.java'.replace('TASK', 'task'), /already exists|valid/)
  bad('src/main/java/com/example/demo/task/taskservice.java'.replace('taskservice', 'TaskService'), /already exists/)
  // Renaming a file to itself is fine.
  assert.equal(validateSpringPath('src/main/java/com/example/demo/task/Task.java', files, 'src/main/java/com/example/demo/task/Task.java'), '')
  const full = Array.from({ length: 60 }, (_, i) => ({ name: `src/main/java/p/C${i}.java`, content: '' }))
  assert.match(validateSpringPath('src/main/java/p/More.java', full), /at most 60/)
  assert.equal(isSpringRunnable('pom.xml'), false)
  assert.equal(isSpringRunnable('src/main/resources/data.sql'), true)
})

test('new files start with their package and class', () => {
  assert.equal(springFileTemplate('src/main/java/com/example/demo/order/OrderService.java'), 'package com.example.demo.order;\n\npublic class OrderService {\n}\n')
  assert.match(springFileTemplate('src/main/resources/data.sql'), /INSERT INTO/)
  assert.equal(languageForSpringFile('src/main/resources/application.properties'), 'ini')
  assert.equal(languageForSpringFile('src/main/java/a/B.java'), 'java')
  assert.equal(languageForSpringFile('pom.xml'), 'xml')
})

test('tester requests become runner requests, and only successful writes are replayed', () => {
  const post = toRunnerRequest({ method: 'post', path: '/api/tasks', headers: [['content-type', 'application/json'], ['', 'x']], body: '{"title":"a"}' })
  assert.deepEqual(post, { method: 'POST', path: '/api/tasks', headers: { 'content-type': 'application/json' }, body: '{"title":"a"}' })
  assert.deepEqual(toRunnerRequest({ method: 'GET', path: '/x', headers: [], body: 'ignored' }), { method: 'GET', path: '/x', headers: {}, body: null })
  // A hand-typed header and the tester's own one with the same name: only the last is sent.
  const twice = toRunnerRequest({ method: 'POST', path: '/x', headers: [['Content-Type', 'text/plain'], ['X-Id', '1'], ['content-type', 'application/json']], body: '{}' })
  assert.deepEqual(twice.headers, { 'content-type': 'application/json', 'X-Id': '1' })
  const get = toRunnerRequest({ method: 'GET', path: '/api/tasks' })
  assert.deepEqual(nextWrites([], post, 201), [post])
  assert.deepEqual(nextWrites([], post, 400), [])
  assert.deepEqual(nextWrites([], post, 0), [])
  const writes = [post]
  assert.equal(nextWrites(writes, get, 200), writes)
  const full = Array.from({ length: SPRING_MAX_WRITES }, () => post)
  assert.equal(nextWrites(full, post, 201), full)
})

test('runner answers become tester and Output results', () => {
  assert.deepEqual(toTesterResponse({ status: 201, headers: { 'content-type': 'application/json' }, body: '{}', ms: 12 }, 'log'), {
    status: 201, headers: [['content-type', 'application/json']], body: '{}', ms: 12, logs: 'log',
  })
  assert.equal(toTesterResponse({ status: 0, headers: {}, body: '', ms: 1, error: 'No response within 10 seconds' }).error, 'No response within 10 seconds')
  assert.match(toTesterResponse({ status: 200, headers: {}, body: 'x', truncated: true }).error, /32 KB/)
  assert.equal(toTesterResponse(undefined).status, 0)
  assert.match(runProblem('compile_error'), /did not compile/)
  assert.match(runProblem('anything else'), /did not finish/)

  const compile = toOutputResult({ status: 'compile_error', compile: { stderr: 'A.java:1: error', exitCode: 1 }, app: null, durationMs: 900, requestId: 'r' })
  assert.equal(compile.status, 'compile_error')
  assert.equal(compile.compile.stderr, 'A.java:1: error')
  assert.equal(compile.request_id, 'r')
  const startup = toOutputResult({ status: 'startup_error', compile: { exitCode: 0 }, app: { stdout: 'boom', stderr: '' } })
  assert.equal(startup.status, 'runtime_error')
  assert.equal(startup.stdout, 'boom')
  assert.match(startup.notice, /did not start/)
  assert.match(toOutputResult({ status: 'success', compile: { exitCode: 0 }, app: { stdout: 'ok' }, startup: { ms: 6400 } }).notice, /6\.4 s/)
  assert.equal(toOutputResult(null).status, 'internal_error')
})
