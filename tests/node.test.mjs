import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  EXPRESS_ENTRY, expressOpenApi, expressRunProblem, findExpressEntry, isNodeEntry, isNodePath, languageForNodeFile, maskJsComments,
  nodeFileTemplate, toExpressOutputResult, toNodeFiles, toNodeScriptResult, validateNodePath, NODE_MAX_FILES,
} from '../src/lib/codelab/nodeProject.js'
import { planApply, planFileChange, runTool } from '../src/lib/codelab/assistantTools.js'
import { mockStreamChat } from '../src/lib/codelab/assistantMock.js'
import { PLAYGROUND_ONLY_LANGUAGES, PROJECT_LANGUAGES, getLanguage } from '../src/data/codingLanguages.js'

const STARTERS = fileURLToPath(new URL('../src/data/expressStarters/', import.meta.url))
function starter(id) {
  const root = path.join(STARTERS, id)
  const walk = (dir) => readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [{ name: path.relative(root, full).split(path.sep).join('/'), content: readFileSync(full, 'utf8') }]
  })
  return walk(root)
}
const routes = (doc) => Object.entries(doc.paths).flatMap(([route, ops]) => Object.keys(ops).map((method) => `${method.toUpperCase()} ${route}`)).sort()

// ---- files -------------------------------------------------------------------------------

test('node paths match the runner rules', () => {
  for (const ok of ['main.js', 'src/app.mjs', 'lib/util.cjs', 'package.json', 'public/index.html', 'db/schema.sql', '.env']) assert.ok(isNodePath(ok), ok)
  for (const bad of ['../x.js', '/etc/passwd', 'a/../x.js', 'node_modules/express/index.js', 'src/node_modules/x.js', '.hidden/x.js',
    'main.exe', 'a b.js', '', `${'x/'.repeat(8)}a.js`, 'C:/x.js']) assert.ok(!isNodePath(bad), bad)
  assert.ok(isNodeEntry('server.js') && isNodeEntry('src/main.mjs'))
  assert.ok(!isNodeEntry('package.json') && !isNodeEntry('.env'))
})

test('new files are checked with a reason, and get a template', () => {
  const files = [{ name: 'server.js' }]
  assert.equal(validateNodePath('routes/users.js', files), '')
  assert.match(validateNodePath('server.js', files), /already exists/)
  assert.match(validateNodePath('node_modules/x.js', files), /node_modules/)
  assert.match(validateNodePath('notes.exe', files), /Use \.js/)
  assert.match(validateNodePath('x.js', Array.from({ length: NODE_MAX_FILES }, (_, i) => ({ name: `f${i}.js` }))), /at most 40/)
  // Renaming a file to its own name is fine.
  assert.equal(validateNodePath('server.js', files, 'server.js'), '')
  assert.match(nodeFileTemplate('routes/users.js'), /express\.Router\(\)/)
  assert.match(nodeFileTemplate('lib/math.mjs'), /^export /)
  assert.equal(languageForNodeFile('a.mjs'), 'javascript')
  assert.equal(languageForNodeFile('package.json'), 'json')
})

test('the runner gets every file but .env, starting from package.json main or server.js', () => {
  const files = [{ name: 'server.js', content: 'a' }, { name: '.env', content: 'SECRET=x' }, { name: 'routes/a.js', content: 'b' }]
  assert.deepEqual(toNodeFiles(files), [{ path: 'server.js', content: 'a' }, { path: 'routes/a.js', content: 'b' }])
  assert.equal(findExpressEntry(files), EXPRESS_ENTRY)
  assert.equal(findExpressEntry([{ name: 'app.js' }]), 'app.js')
  assert.equal(findExpressEntry([{ name: 'src/index.js' }, { name: 'package.json', content: '{"main": "./src/index.js"}' }]), 'src/index.js')
  // A main that is missing or not valid JSON falls back.
  assert.equal(findExpressEntry([{ name: 'server.js' }, { name: 'package.json', content: '{"main": "nope.js"}' }]), 'server.js')
  assert.equal(findExpressEntry([{ name: 'server.js' }, { name: 'package.json', content: '{bad' }]), 'server.js')
  // server.js deleted or renamed: the shallowest script, not a name the runner would refuse.
  assert.equal(findExpressEntry([{ name: 'routes/a.js' }, { name: 'main.mjs' }, { name: 'data.json' }]), 'main.mjs')
  assert.equal(findExpressEntry([{ name: 'data.json' }]), 'server.js')
  assert.equal(findExpressEntry([]), 'server.js')
  // Odd file lists never throw.
  assert.equal(findExpressEntry([{}, { name: null }, { name: 'server.js' }]), 'server.js')
  assert.deepEqual(toNodeFiles([{}, null, { name: 'a.js' }].filter(Boolean)), [{ path: 'a.js', content: '' }])
})

// ---- the API tester's routes -------------------------------------------------------------

test('routes are read from app, routers mounted from their files, and app.route chains', () => {
  const doc = expressOpenApi([
    { name: 'server.js', content: `const express = require('express');
const users = require('./routes/users');
import admin from './routes/admin.js';
const app = express();
app.set('env', 'x'); app.get('env');
// app.get('/commented', handler)
app.get('/health', (req, res) => res.send('ok'));
app.use('/api/users', users);
app.use('/admin', admin);
app.use('/inline', require('./routes/inline'));
app.route('/books/:id').get(show).put(update).delete(remove);
app.listen(3000);` },
    { name: 'routes/users.js', content: "const router = require('express').Router();\nrouter.get('/', list);\nrouter.post('/', create);\nrouter.get('/:id', show);\nmodule.exports = router;" },
    { name: 'routes/admin.js', content: "const r = Router();\nr.delete('/cache', clear);\nexport default r;" },
    { name: 'routes/inline.js', content: "const router = Router();\nrouter.patch('/x', patch);" },
  ])
  assert.deepEqual(routes(doc), [
    'DELETE /admin/cache', 'DELETE /books/{id}', 'GET /api/users', 'GET /api/users/{id}', 'GET /books/{id}', 'GET /health',
    'PATCH /inline/x', 'POST /api/users', 'PUT /books/{id}',
  ])
  assert.deepEqual(doc.paths['/api/users/{id}'].get.parameters, [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }])
  assert.ok(doc.paths['/api/users'].post.requestBody)
  assert.equal(doc.paths['/health'].get.requestBody, undefined)
})

test('the samples list their routes', () => {
  assert.deepEqual(routes(expressOpenApi(starter('hello'))), ['GET /api/hello', 'GET /api/square/{n}', 'POST /api/echo'])
  assert.deepEqual(routes(expressOpenApi(starter('tasks'))), ['DELETE /api/tasks/{id}', 'GET /api/tasks', 'GET /api/tasks/{id}', 'POST /api/tasks', 'PUT /api/tasks/{id}'])
  assert.deepEqual(routes(expressOpenApi(starter('notes'))), ['DELETE /api/notes/{id}', 'GET /api/notes', 'GET /api/notes/{id}', 'POST /api/notes'])
  for (const id of ['hello', 'tasks', 'notes']) {
    const files = starter(id)
    assert.ok(files.every((file) => isNodePath(file.name)), id)
    assert.equal(findExpressEntry(files), 'server.js', id)
  }
})

test('comment masking keeps the code the same length', () => {
  const code = "a // b\n/* c\nd */ 'e // f' `g\n// h`"
  const masked = maskJsComments(code)
  assert.equal(masked.length, code.length)
  assert.doesNotMatch(masked, /[bcd]/)
  assert.match(masked, /'e \/\/ f'/)
  assert.match(masked, /`g\n\/\/ h`/)
})

// ---- results -----------------------------------------------------------------------------

test('script results become the Output panel shape', () => {
  const ok = toNodeScriptResult({ status: 'success', durationMs: 120, requestId: 'r1', run: { stdout: 'hi\n', stderr: '', exitCode: 0 } })
  assert.deepEqual([ok.status, ok.stdout, ok.exit_code, ok.runtime_ms, ok.notice, ok.compile], ['success', 'hi\n', 0, 120, '', null])
  const missing = toNodeScriptResult({ status: 'package_error', missing: ['left-pad'], run: null })
  assert.equal(missing.status, 'runtime_error')
  assert.match(missing.stderr, /left-pad is not installed/)
  const required = toNodeScriptResult({ status: 'runtime_error', missing: ['a', 'b'], run: { stderr: "Cannot find module 'a'" } })
  assert.match(required.notice, /The packages a, b are not installed/)
  assert.equal(required.stderr, "Cannot find module 'a'")
  assert.match(toNodeScriptResult({ status: 'timeout', run: {} }).notice, /10 second/)
  assert.equal(toNodeScriptResult({ status: 'cancelled', run: {} }).status, 'stopped')
  assert.throws(() => toNodeScriptResult(null), /invalid response/)
})

test('Express results become the Output panel shape', () => {
  const ok = toExpressOutputResult({ status: 'success', startup: { ready: true, ms: 1200 }, app: { stdout: 'Listening', stderr: '' } })
  assert.equal(ok.status, 'success')
  assert.match(ok.notice, /Started in 1\.2 s/)
  const quiet = toExpressOutputResult({ status: 'startup_error', app: { stdout: '', stderr: '' } })
  assert.equal(quiet.status, 'runtime_error')
  assert.match(quiet.notice, /app\.listen/)
  const missing = toExpressOutputResult({ status: 'package_error', missing: ['mongoose'], app: null })
  assert.match(missing.stderr, /mongoose is not installed/)
  assert.match(expressRunProblem('package_error'), /not installed/)
  assert.match(expressRunProblem('whatever'), /did not finish/)
})

// ---- languages and WebNest AI ------------------------------------------------------------

test('Node.js and Express are playground languages, not saved projects yet', () => {
  assert.equal(getLanguage('node').mainFile, 'main.js')
  assert.equal(getLanguage('express').mainFile, 'server.js')
  assert.ok(PLAYGROUND_ONLY_LANGUAGES.has('node') && PLAYGROUND_ONLY_LANGUAGES.has('express') && PLAYGROUND_ONLY_LANGUAGES.has('spring'))
  assert.ok(!PROJECT_LANGUAGES.some((language) => ['node', 'express', 'spring', 'backend'].includes(language.id)))
  assert.ok(PROJECT_LANGUAGES.some((language) => language.id === 'python'))
})

const EXPRESS_FILES = starter('tasks').map((file) => ({ ...file, language: languageForNodeFile(file.name) }))
const tools = (overrides = {}) => {
  const state = { files: EXPRESS_FILES, sent: [] }
  return {
    state,
    language: 'express',
    getFiles: () => state.files,
    applyFiles: (next) => { state.files = next },
    approve: async () => true,
    run: async () => ({ status: 'success', stdout: 'Tasks API listening on port 3000', stderr: '' }),
    lastResult: () => null,
    request: async (spec) => { state.sent.push(spec); return { status: 200, body: '[]' } },
    apiReady: () => true,
    debugPaused: () => false,
    ...overrides,
  }
}

test('WebNest AI follows the Express file rules and can call the API', async () => {
  assert.equal(planFileChange('create_file', { path: 'routes/users.js', content: 'x' }, EXPRESS_FILES, 'express').kind, 'create')
  assert.equal(planFileChange('create_file', { path: 'node_modules/x.js', content: 'x' }, EXPRESS_FILES, 'express').isError, true)
  assert.equal(planFileChange('create_file', { path: 'big.js', content: 'a'.repeat(300 * 1024) }, EXPRESS_FILES, 'express').isError, true)
  const env = tools()
  const ran = await runTool('run_project', {}, env)
  assert.match(ran.content, /^The app started\. It stops after each run/)
  assert.equal(ran.isError, false)
  const failed = await runTool('run_project', {}, tools({ run: async () => ({ status: 'runtime_error', stdout: '', stderr: 'Error: bad start' }) }))
  assert.match(failed.content, /^The app failed to start\./)
  assert.match(failed.content, /bad start/)
  const answer = await runTool('send_api_request', { method: 'GET', path: '/api/tasks' }, env)
  assert.equal(answer.isError, false)
  assert.equal(env.state.sent.length, 1)
})

test('WebNest AI keeps a Node.js script in main.js', async () => {
  const files = [{ name: 'main.js', language: 'javascript', content: 'console.log(1)' }]
  assert.equal(planFileChange('create_file', { path: 'other.js', content: 'x' }, files, 'node').isError, true)
  // Ask mode's Apply puts any block into the one file.
  const applied = planApply('whatever.js', 'console.log(2)', files, 'node')
  assert.equal(applied.path, 'main.js')
  const refused = await runTool('send_api_request', { method: 'GET', path: '/' }, tools({ language: 'node', getFiles: () => files }))
  assert.match(refused.content, /Only FastAPI, Spring Boot and Express/)
})

test('the mock assistant has Node.js and Express samples', async () => {
  for (const [language, expected] of [['node', 'javascript main.js'], ['express', 'javascript routes/health.js']]) {
    let text = ''
    await mockStreamChat({ mode: 'ask', messages: [], context: { language }, onEvent: (event) => { if (event.type === 'text') text += event.data.delta } })
    assert.match(text, new RegExp(expected.replace('.', '\\.')), language)
  }
  const calls = []
  await mockStreamChat({
    mode: 'agent',
    messages: [{ role: 'user', content: 'go' }, { role: 'tool', content: 'a' }, { role: 'tool', content: 'b' }],
    context: { language: 'express', files: ['server.js'] },
    onEvent: (event) => { if (event.type === 'tool_call') calls.push(event.data) },
  })
  assert.deepEqual([calls[0].name, calls[0].arguments.path], ['create_file', 'routes/mock_notes.js'])
})
