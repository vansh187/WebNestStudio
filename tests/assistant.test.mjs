import test from 'node:test'
import assert from 'node:assert/strict'

import { createSseParser } from '../src/lib/codelab/assistantStream.js'
import { AssistantError, repairHistory, runAssistantTask, toApiMessages, trimHistory, MAX_AGENT_STEPS } from '../src/lib/codelab/assistantAgent.js'
import {
  READ_LIMIT, buildContext, codeBlockTarget, describeToolCall, errorsOf, planApply, planFileChange, rebaseApply, recordChange, runTool, scrubSecrets, undoChanges,
} from '../src/lib/codelab/assistantTools.js'
import { mockStreamChat } from '../src/lib/codelab/assistantMock.js'
import { DEFAULT_PLAN, PLAN_DAYS, PLAN_RUPEES, TERMS_VERSION, checkoutOptions, formatTokens, needsPayment, tokensLeft } from '../src/lib/codelab/assistantCheckout.js'
import {
  claimMembershipLoad, clearPaymentPending, getMembership, isCurrentAccount, isMembershipAnswered, isPaymentPending, markPaymentPending, noteMembership, notePassActive, paymentConfirmed, resetMembership,
} from '../src/lib/codelab/assistantPlan.js'

const FILES = [
  { name: 'app/main.py', language: 'python', content: 'from fastapi import FastAPI\napp = FastAPI()\n' },
  { name: 'schema.sql', language: 'sql', content: 'CREATE TABLE notes (id INTEGER);\n' },
  { name: '.env', language: 'plaintext', content: 'API_SECRET=placeholder-secret-value\nSHORT=ab\n' },
]

function env(overrides = {}) {
  const state = { files: FILES, applied: [], approvals: [] }
  return {
    state,
    getFiles: () => state.files,
    applyFiles: (next, plan) => { state.files = next; state.applied.push(plan) },
    approve: async (request) => { state.approvals.push(request); return true },
    run: async () => ({ status: 'success', stdout: 'API ready', stderr: '' }),
    lastResult: () => null,
    request: async () => ({ status: 200, body: '{"ok":true}' }),
    apiReady: () => true,
    debugPaused: () => false,
    ...overrides,
  }
}

// ---- the stream parser ----------------------------------------------------------------

function parse(chunks) {
  const events = []
  const parser = createSseParser((event) => events.push(event))
  chunks.forEach((chunk) => parser.feed(chunk))
  parser.flush()
  return events
}

test('stream: events, comments and a split across chunks', () => {
  const events = parse(['event: te', 'xt\ndata: {"delta":"he', 'llo"}\n\n: ping\n\nevent: done\ndata: {"finish_reason":"stop"}\n\n'])
  assert.deepEqual(events, [
    { type: 'text', data: { delta: 'hello' } },
    { type: 'done', data: { finish_reason: 'stop' } },
  ])
})

test('stream: CRLF line ends, also split between \\r and \\n', () => {
  const events = parse(['event: text\r', '\ndata: {"delta":"a"}\r\n\r', '\nevent: done\r\ndata: {"finish_reason":"stop"}\r\n\r\n'])
  assert.deepEqual(events.map((event) => event.type), ['text', 'done'])
})

test('stream: a broken event is skipped, and a last event without a blank line is kept', () => {
  const events = parse(['event: text\ndata: {oops\n\nevent: done\ndata: {"finish_reason":"stop"}'])
  assert.deepEqual(events, [{ type: 'done', data: { finish_reason: 'stop' } }])
})

// ---- secrets ---------------------------------------------------------------------------

test('.env values are scrubbed; values too short to be safe to match are left', () => {
  const clean = scrubSecrets('key=placeholder-secret-value and ab', FILES)
  assert.equal(clean, 'key=[hidden] and ab')
})

test('the context never carries the .env file or its values', () => {
  const context = buildContext({ files: FILES, selectedFile: '.env', lastError: 'boom placeholder-secret-value' })
  assert.deepEqual(context.files, ['app/main.py', 'schema.sql'])
  assert.equal(context.open_file, undefined)
  assert.equal(context.last_error, 'boom [hidden]')
  assert.ok(!JSON.stringify(context).includes('placeholder-secret-value'))
  const open = buildContext({ files: FILES, selectedFile: 'app/main.py' })
  assert.equal(open.open_file.name, 'app/main.py')
})

test('every tool refuses .env', async () => {
  const tools = env()
  for (const [name, args] of [
    ['read_file', { path: '.env' }],
    ['edit_file', { path: '.env', old_text: 'a', new_text: 'b' }],
    ['delete_file', { path: '.env' }],
    ['create_file', { path: '.env', content: 'x' }],
  ]) {
    const result = await runTool(name, args, tools)
    assert.equal(result.isError, true, name)
    assert.match(result.content, /private/, name)
  }
  assert.deepEqual(tools.state.applied, [])
  assert.ok(!(await runTool('list_files', {}, tools)).content.includes('.env'))
  assert.equal(planApply('.env', 'x', FILES).isError, true)
})

test('tool results are scrubbed: code can print os.environ', async () => {
  const tools = env({ run: async () => ({ status: 'success', stdout: 'API_SECRET=placeholder-secret-value' }) })
  assert.ok(!(await runTool('run_project', {}, tools)).content.includes('placeholder-secret-value'))
  const api = env({ request: async () => ({ status: 200, body: 'placeholder-secret-value' }) })
  assert.ok(!(await runTool('send_api_request', { method: 'GET', path: '/env' }, api)).content.includes('placeholder-secret-value'))
  const read = env({ getFiles: () => [...FILES, { name: 'app/x.py', content: 'K="placeholder-secret-value"' }] })
  assert.ok(!(await runTool('read_file', { path: 'app/x.py' }, read)).content.includes('placeholder-secret-value'))
})

// ---- tools -----------------------------------------------------------------------------

test('edit_file: replaces one exact match; zero or several matches are errors', async () => {
  const tools = env()
  const ok = await runTool('edit_file', { path: 'app/main.py', old_text: 'app = FastAPI()', new_text: 'app = FastAPI(title="$& x")' }, tools)
  assert.equal(ok.isError, false)
  assert.match(tools.state.files[0].content, /title="\$& x"/, 'the new text is taken literally')
  assert.equal((await runTool('edit_file', { path: 'app/main.py', old_text: 'nothing here', new_text: 'x' }, tools)).isError, true)
  const twice = env({ getFiles: () => [{ name: 'app/a.py', content: 'x\nx\n' }] })
  assert.match((await runTool('edit_file', { path: 'app/a.py', old_text: 'x', new_text: 'y' }, twice)).content, /matches 2 places/)
})

test('create_file follows the path rules; delete_file removes it', async () => {
  const tools = env()
  assert.equal((await runTool('create_file', { path: 'app/notes.py', content: 'x = 1\n' }, tools)).isError, false)
  assert.ok(tools.state.files.some((file) => file.name === 'app/notes.py' && file.language === 'python'))
  assert.equal((await runTool('create_file', { path: 'app/notes.py', content: '' }, tools)).isError, true, 'already exists')
  assert.equal((await runTool('create_file', { path: 'notes.py', content: '' }, tools)).isError, true, 'Python must be under app/')
  assert.equal((await runTool('delete_file', { path: 'app/notes.py' }, tools)).isError, false)
  assert.ok(!tools.state.files.some((file) => file.name === 'app/notes.py'))
})

test('a declined change is not applied, and the model is told', async () => {
  const tools = env({ approve: async () => false })
  const result = await runTool('create_file', { path: 'app/no.py', content: '' }, tools)
  assert.equal(result.isError, true)
  assert.match(result.content, /declined/)
  assert.deepEqual(tools.state.applied, [])
})

test('read_file is cut at the limit and says so; a missing file is an error', async () => {
  const big = env({ getFiles: () => [{ name: 'app/big.py', content: 'x'.repeat(READ_LIMIT + 50) }] })
  const result = await runTool('read_file', { path: 'app/big.py' }, big)
  assert.ok(result.content.length < READ_LIMIT + 100)
  assert.match(result.content, /only the first part/)
  assert.equal((await runTool('read_file', { path: 'nope.py' }, env())).isError, true)
})

test('run_project: approval, failure reported, and a paused debugger refused', async () => {
  const tools = env({ run: async () => ({ status: 'runtime_error', error: 'SyntaxError', stderr: 'SyntaxError' }) })
  const result = await runTool('run_project', {}, tools)
  assert.equal(result.isError, true)
  assert.match(result.content, /SyntaxError/)
  assert.equal(result.content.match(/SyntaxError/g).length, 1, 'the same text is not repeated')
  assert.equal(tools.state.approvals[0].type, 'run')
  const paused = env({ debugPaused: () => true, run: async () => assert.fail('must not run') })
  assert.match((await runTool('run_project', {}, paused)).content, /breakpoint/)
  const declined = env({ approve: async () => false, run: async () => assert.fail('must not run') })
  assert.equal((await runTool('run_project', {}, declined)).isError, true)
})

test('send_api_request reaches only the API in the browser', async () => {
  assert.match((await runTool('send_api_request', { path: '/x' }, env({ apiReady: () => false }))).content, /not running/)
  for (const path of ['https://example.com/x', '//example.com/x', 'x']) {
    assert.equal((await runTool('send_api_request', { path }, env())).isError, true, path)
  }
  let spec
  const tools = env({ request: async (sent) => { spec = sent; return { status: 201, body: 'made' } } })
  const result = await runTool('send_api_request', { method: 'post', path: '/notes', body: { a: 1 } }, tools)
  assert.equal(spec.method, 'POST')
  assert.equal(spec.body, '{"a":1}')
  assert.match(result.content, /Status 201/)
})

test('an unknown tool or a throwing tool never crashes the task', async () => {
  assert.equal((await runTool('format_disk', {}, env())).isError, true)
  const broken = env({ getFiles: () => { throw new Error('kaput') } })
  // With no files to scrub against, the raw message could hold a secret, so it is withheld.
  assert.equal((await runTool('list_files', {}, broken)).content, 'The tool failed.')
  const failing = env({ request: async () => { throw new Error('kaput') } })
  assert.match((await runTool('send_api_request', { method: 'GET', path: '/x' }, failing)).content, /kaput/)
  assert.equal((await runTool('edit_file', null, env())).isError, true)
})

test('Apply on a code block: replaces a file, creates a new one, checks the path', () => {
  const edit = planApply('app/main.py', 'new', FILES)
  assert.equal(edit.kind, 'edit')
  assert.equal(edit.before, FILES[0].content)
  assert.equal(edit.after, 'new')
  assert.equal(planApply('app/new.py', 'x', FILES).kind, 'create')
  assert.equal(planApply('bad.py', 'x', FILES).isError, true)
  assert.equal(planApply(null, 'x', FILES).isError, true)
})

test('code block targets and labels', () => {
  assert.equal(codeBlockTarget('python app/main.py'), 'app/main.py')
  assert.equal(codeBlockTarget('python title="app/main.py"'), 'app/main.py')
  assert.equal(codeBlockTarget('python'), null)
  assert.equal(codeBlockTarget('python copy-this'), null)
  assert.equal(describeToolCall('send_api_request', { method: 'POST', path: '/notes' }), 'Sent POST /notes')
  assert.equal(describeToolCall('create_file', { path: 'app/a.py' }, { pending: true }), 'Creating app/a.py…')
  assert.equal(describeToolCall('create_file', { path: 'app/a.py' }), 'Created app/a.py')
  assert.equal(errorsOf({ status: 'success', stderr: 'warning' }), '')
  assert.equal(errorsOf(null), '')
})

// ---- the loop --------------------------------------------------------------------------

function script(...replies) {
  const calls = []
  return {
    calls,
    stream: async ({ messages, onEvent }) => {
      calls.push(messages)
      const reply = replies.shift()
      if (reply instanceof Error) throw reply
      reply.forEach(onEvent)
    },
  }
}
const say = (text, finish = 'stop') => [{ type: 'text', data: { delta: text } }, { type: 'done', data: { finish_reason: finish } }]
const use = (id, name, args = {}) => [{ type: 'tool_call', data: { id, name, arguments: args } }, { type: 'done', data: { finish_reason: 'tool_calls' } }]

function task(stream, overrides = {}) {
  const messages = [{ role: 'user', content: 'go' }]
  const options = {
    mode: 'agent',
    getMessages: () => messages,
    stream,
    runTool: async () => ({ content: 'ok', isError: false }),
    onMessage: (message) => messages.push(message),
    ...overrides,
  }
  return { messages, run: () => runAssistantTask(options) }
}

test('agent: runs tools, sends results back, and finishes', async () => {
  const { stream, calls } = script(use('a', 'list_files'), say('done'))
  const { messages, run } = task(stream)
  assert.deepEqual(await run(), { status: 'done' })
  assert.deepEqual(messages.map((message) => message.role), ['user', 'assistant', 'tool', 'assistant'])
  assert.equal(calls[1].at(-1).tool_call_id, 'a', 'the result went back to the model')
})

test('ask: one call, and tools are never run even if a reply names one', async () => {
  const { stream, calls } = script(use('a', 'delete_file', { path: 'app/main.py' }))
  const { messages, run } = task(stream, { mode: 'ask', runTool: async () => assert.fail('Ask mode must not run tools') })
  assert.deepEqual(await run(), { status: 'done' })
  assert.equal(calls.length, 1)
  assert.equal(messages.at(-1).tool_calls, undefined)
})

test('agent: stops at the step limit', async () => {
  const replies = Array.from({ length: MAX_AGENT_STEPS + 2 }, (_, index) => use(`c${index}`, 'list_files'))
  const { stream, calls } = script(...replies)
  assert.deepEqual(await task(stream).run(), { status: 'step_limit' })
  assert.equal(calls.length, MAX_AGENT_STEPS)
})

test('a long reply reports that it was cut off', async () => {
  const { stream } = script(say('partial', 'length'))
  assert.deepEqual(await task(stream).run(), { status: 'cut_off' })
})

test('Stop during a tool: every call still gets a result', async () => {
  const controller = new AbortController()
  const { stream } = script([
    { type: 'tool_call', data: { id: 'a', name: 'list_files', arguments: {} } },
    { type: 'tool_call', data: { id: 'b', name: 'read_file', arguments: {} } },
    { type: 'done', data: { finish_reason: 'tool_calls' } },
  ])
  const { messages, run } = task(stream, {
    signal: controller.signal,
    runTool: async () => { controller.abort(); return { content: 'ok', isError: false } },
  })
  assert.deepEqual(await run(), { status: 'stopped' })
  const answered = messages.filter((message) => message.role === 'tool').map((message) => message.tool_call_id)
  assert.deepEqual(answered, ['a', 'b'])
})

test('Stop mid-reply keeps the text, and answers calls that never ran', async () => {
  const controller = new AbortController()
  const stream = async ({ onEvent, signal }) => {
    onEvent({ type: 'text', data: { delta: 'partly' } })
    onEvent({ type: 'tool_call', data: { id: 'a', name: 'list_files', arguments: {} } })
    controller.abort()
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
  }
  const { messages, run } = task(stream, { signal: controller.signal, runTool: async () => assert.fail('must not run') })
  assert.deepEqual(await run(), { status: 'stopped' })
  assert.equal(messages[1].content, 'partly')
  assert.equal(messages[2].tool_call_id, 'a')
  assert.equal(messages[2].is_error, true)
})

test('a failed call rejects; an error event keeps the text written so far', async () => {
  const { stream } = script(new AssistantError('limit', { status: 429 }))
  await assert.rejects(task(stream).run(), (error) => error.status === 429)
  const partly = script([{ type: 'text', data: { delta: 'so far' } }, { type: 'error', data: { code: 'provider_error', message: 'broke' } }])
  const { messages, run } = task(partly.stream)
  await assert.rejects(run(), (error) => error.code === 'provider_error')
  assert.equal(messages.at(-1).content, 'so far')
})

test('what is sent: only contract fields, and older results shortened to fit', () => {
  const sent = toApiMessages([
    { role: 'user', content: 'hi', undo: true, extra: 'x' },
    { role: 'assistant', content: '', tool_calls: [{ id: 'a', name: 'read_file', arguments: {} }] },
    { role: 'tool', tool_call_id: 'a', content: 'x'.repeat(30000), is_error: false },
    { role: 'assistant', content: '', tool_calls: [{ id: 'b', name: 'read_file', arguments: {} }] },
    { role: 'tool', tool_call_id: 'b', content: 'latest result', is_error: false },
  ])
  assert.deepEqual(Object.keys(sent[0]), ['role', 'content'])
  assert.match(sent[2].content, /Older result removed/)
  assert.equal(sent[4].content, 'latest result', 'the newest result is kept')
})

test('history trims to a user message, so no result loses its call', () => {
  const messages = []
  for (let i = 0; i < 20; i += 1) messages.push({ role: 'user', content: String(i) }, { role: 'assistant', content: '' }, { role: 'tool', tool_call_id: 'x', content: '' })
  const trimmed = trimHistory(messages, 30)
  assert.equal(trimmed[0].role, 'user')
  assert.ok(trimmed.length <= 30)
  assert.deepEqual(trimHistory([{ role: 'tool', tool_call_id: 'x', content: '' }, { role: 'assistant', content: '' }], 1), [])
})

// ---- the mock follows the contract, and drives the loop end to end ---------------------

test('the mock agent runs a whole task through the real tools', async () => {
  const tools = env()
  const messages = [{ role: 'user', content: 'go' }]
  const result = await runAssistantTask({
    mode: 'agent',
    getMessages: () => messages,
    stream: ({ messages: sent, signal, onEvent }) => mockStreamChat({ mode: 'agent', messages: sent, context: buildContext({ files: tools.getFiles() }), signal, onEvent }),
    runTool: (name, args) => runTool(name, args, tools),
    onMessage: (message) => messages.push(message),
  })
  assert.equal(result.status, 'done')
  assert.ok(tools.state.files.some((file) => file.name === 'app/mock_notes.py'))
  assert.equal(messages.filter((message) => message.role === 'tool').every((message) => !message.is_error), true)
})

// ---- other languages -------------------------------------------------------------------

test('new files follow each language: Java classes, web files, Python stays one file', () => {
  const java = [{ name: 'Main.java', content: 'public class Main {}' }]
  assert.equal(planFileChange('create_file', { path: 'Dog.java', content: 'x' }, java, 'java').files[1].language, 'java')
  assert.equal(planFileChange('create_file', { path: 'app/Dog.java', content: '' }, java, 'java').isError, true)
  assert.equal(planFileChange('create_file', { path: 'class.java', content: '' }, java, 'java').isError, true, 'keyword')
  assert.equal(planFileChange('create_file', { path: 'notes.py', content: '' }, java, 'java').isError, true)

  const web = [{ name: 'index.html', content: '' }]
  assert.equal(planFileChange('create_file', { path: 'js/app.js', content: '' }, web, 'web').kind, 'create')
  assert.equal(planFileChange('create_file', { path: 'app.py', content: '' }, web, 'web').isError, true)
  assert.equal(planFileChange('create_file', { path: '../x.js', content: '' }, web, 'web').isError, true)

  const python = [{ name: 'main.py', content: 'old' }]
  assert.equal(planFileChange('create_file', { path: 'other.py', content: '' }, python, 'python').isError, true)
  assert.equal(planFileChange('delete_file', { path: 'main.py' }, python, 'python').isError, true, 'the only file')
  const applied = planApply('other.py', 'new', python, 'python')
  assert.equal(applied.path, 'main.py', 'Apply goes to the one file, whatever the block is called')
  assert.equal(applied.after, 'new')
})

test('a language with no rules of its own gets the safe general rule', () => {
  const files = [{ name: 'main.go', content: '' }]
  assert.equal(planFileChange('create_file', { path: 'util/strings.go', content: '' }, files, 'go').kind, 'create')
  assert.equal(planFileChange('create_file', { path: '../x.go', content: '' }, files, 'go').isError, true)
  assert.equal(planFileChange('create_file', { path: 'MAIN.GO', content: '' }, files, 'go').isError, true, 'same name, other case')
})

test('a path with a leading slash cannot reach .env or be stored unnormalized', () => {
  for (const language of ['backend', 'web', 'java', 'python', 'go']) {
    for (const path of ['.env', '/.env', '\\.env', ' /.env ']) {
      assert.match(planFileChange('create_file', { path, content: 'x' }, [{ name: 'a.txt', content: '' }], language).content, /private/, `${language} ${path}`)
    }
  }
  assert.equal(planFileChange('create_file', { path: '/app/a.py', content: '' }, FILES).path, 'app/a.py')
})

test('API requests are refused outside FastAPI, and Java compile errors are reported', async () => {
  const tools = env({ language: 'python' })
  assert.match((await runTool('send_api_request', { method: 'GET', path: '/x' }, tools)).content, /Only FastAPI/)
  assert.equal(errorsOf({ status: 'compile_error', compile: { stderr: 'Main.java:1: error' }, stderr: '' }), 'Main.java:1: error')
})

test('the run message fits the language', async () => {
  const run = async () => ({ status: 'success', stdout: 'hi' })
  assert.match((await runTool('run_project', {}, env({ language: 'python', run }))).content, /The program ran\.\nhi/)
  assert.match((await runTool('run_project', {}, env({ run }))).content, /The project is running/)
})

test('the mock works for every language', async () => {
  for (const [language, files, expected] of [['web', ['index.html'], 'create_file'], ['java', ['Main.java'], 'create_file'], ['python', ['main.py'], 'edit_file'], ['spring', ['src/main/java/com/example/demo/DemoApplication.java'], 'create_file']]) {
    const events = []
    const messages = [{ role: 'user', content: 'go' }, ...[1, 2].map((id) => ({ role: 'tool', tool_call_id: String(id), content: '' }))]
    await mockStreamChat({ mode: 'agent', messages, context: { language, files, open_file: { name: files[0], content: 'first\n' } }, onEvent: (event) => events.push(event) })
    assert.equal(events.find((event) => event.type === 'tool_call').data.name, expected, language)
  }
})

// ---- Spring Boot -----------------------------------------------------------------------

const SPRING_FILES = [
  { name: 'pom.xml', language: 'xml', content: '<project/>\n' },
  { name: 'src/main/java/com/example/demo/DemoApplication.java', language: 'java', content: 'package com.example.demo;\n' },
  { name: 'src/main/resources/data.sql', language: 'sql', content: '' },
]

test('Spring Boot files follow the runner layout', () => {
  const ok = planFileChange('create_file', { path: 'src/main/java/com/example/demo/task/TaskService.java', content: 'x' }, SPRING_FILES, 'spring')
  assert.equal(ok.isError, undefined)
  assert.equal(ok.files.at(-1).language, 'java')
  for (const path of ['TaskService.java', 'src/main/java/Top.java', 'src/main/java/com/example/class/Bad.java', 'notes.txt']) {
    assert.equal(planFileChange('create_file', { path, content: 'x' }, SPRING_FILES, 'spring').isError, true, path)
  }
  assert.equal(planApply('src/main/resources/schema.sql', 'CREATE TABLE t (id INT);', SPRING_FILES, 'spring').kind, 'create')
  assert.match(planFileChange('create_file', { path: 'src/main/resources/.env', content: 'x' }, SPRING_FILES, 'spring').content, /private/)
})

test('Spring Boot projects use the Spring size limit', () => {
  const big = 'x'.repeat(220 * 1024)
  // Over the FastAPI limit, under the Spring one.
  const edit = planFileChange('edit_file', { path: 'src/main/resources/data.sql', old_text: '-- rows', new_text: big }, [...SPRING_FILES.slice(0, 2), { ...SPRING_FILES[2], content: '-- rows' }], 'spring')
  assert.equal(edit.isError, undefined)
  assert.equal(planFileChange('edit_file', { path: 'app/main.py', old_text: 'app = FastAPI()', new_text: big }, FILES, 'backend').isError, true)
  const plan = planApply('src/main/resources/data.sql', big, SPRING_FILES, 'spring')
  assert.equal(rebaseApply(plan, SPRING_FILES, 'spring').isError, undefined)
  assert.equal(rebaseApply(plan, SPRING_FILES).isError, true)
})

test('Spring Boot projects take API requests, and a run reports the cause before the log', async () => {
  const sent = []
  const tools = env({ language: 'spring', getFiles: () => SPRING_FILES, request: async (spec) => { sent.push(spec); return { status: 201, body: '{"id":1}' } } })
  const reply = await runTool('send_api_request', { method: 'POST', path: '/tasks', body: { title: 'a' } }, tools)
  assert.match(reply.content, /Status 201/)
  assert.equal(sent[0].method, 'POST')
  assert.equal(sent[0].body, '{"title":"a"}')
  const log = `${'banner line\n'.repeat(1000)}APPLICATION FAILED TO START\nPort in use`
  const failed = env({ language: 'spring', getFiles: () => SPRING_FILES, run: async () => ({ status: 'compile_error', stdout: log, compile: { stderr: 'TaskService.java:3: error: ; expected' } }) })
  const result = await runTool('run_project', {}, failed)
  assert.equal(result.isError, true)
  assert.match(result.content, /^The app failed to compile or start\.\nTaskService\.java:3: error/)
  assert.match(result.content, /APPLICATION FAILED TO START\nPort in use/)
  const started = await runTool('run_project', {}, env({ language: 'spring', getFiles: () => SPRING_FILES, run: async () => ({ status: 'success', stdout: 'Started DemoApplication' }) }))
  assert.match(started.content, /^The app compiled and started\./)
})

// ---- review fixes ----------------------------------------------------------------------

test('history: unanswered calls get a result, and results with no call are dropped', () => {
  const repaired = repairHistory([
    { role: 'tool', tool_call_id: 'gone', content: 'orphan' },
    { role: 'user', content: 'go' },
    { role: 'assistant', content: '', tool_calls: [{ id: 'a', name: 'edit_file', arguments: {} }, { id: 'b', name: 'run_project', arguments: {} }] },
    { role: 'tool', tool_call_id: 'a', content: 'done' },
    { role: 'user', content: 'next' },
  ])
  assert.deepEqual(repaired.map((message) => [message.role, message.tool_call_id]), [
    ['user', undefined], ['assistant', undefined], ['tool', 'a'], ['tool', 'b'], ['user', undefined],
  ])
  assert.equal(repaired[3].is_error, true)
  const toEnd = repairHistory([{ role: 'assistant', content: '', tool_calls: [{ id: 'z', name: 'x', arguments: {} }] }])
  assert.equal(toEnd[1].tool_call_id, 'z')
  assert.equal(toApiMessages([{ role: 'user', content: 'a' }, { role: 'assistant', content: '', tool_calls: [{ id: 'q', name: 'x', arguments: {} }] }]).at(-1).tool_call_id, 'q')
})

test('history: a task longer than the limit keeps its request and stays valid', () => {
  const messages = [{ role: 'user', content: 'build it' }]
  for (let i = 0; i < 40; i += 1) {
    messages.push({ role: 'assistant', content: '', tool_calls: [{ id: `c${i}`, name: 'read_file', arguments: { path: 'a' } }] })
    messages.push({ role: 'tool', tool_call_id: `c${i}`, content: 'x' })
  }
  const trimmed = trimHistory(messages, 30)
  assert.equal(trimmed[0].content, 'build it')
  assert.equal(trimmed[1].role, 'assistant')
  assert.ok(trimmed.length <= 31)
  assert.deepEqual(repairHistory(trimmed), trimmed, 'every call answered, no orphan result')
  assert.ok(toApiMessages(messages).length > 1)
})

test('history: file text inside old tool calls counts toward the budget and is shortened', () => {
  const big = 'x'.repeat(30000)
  const sent = toApiMessages([
    { role: 'user', content: 'go' },
    { role: 'assistant', content: '', tool_calls: [{ id: 'a', name: 'create_file', arguments: { path: 'a.py', content: big } }] },
    { role: 'tool', tool_call_id: 'a', content: 'Created a.py.' },
    { role: 'assistant', content: '', tool_calls: [{ id: 'b', name: 'run_project', arguments: {} }] },
    { role: 'tool', tool_call_id: 'b', content: 'ok' },
  ])
  assert.ok(JSON.stringify(sent).length < 18000)
  assert.equal(sent[1].tool_calls[0].arguments.path, 'a.py', 'short arguments stay')
  assert.ok(!sent[1].tool_calls[0].arguments.content.includes('xxx'))
})

test('a change approved after the user kept typing keeps their typing', async () => {
  const tools = env()
  tools.approve = async () => {
    tools.state.files = tools.state.files.map((file) => (file.name === 'schema.sql' ? { ...file, content: 'typed by the user' } : file))
    return true
  }
  const result = await runTool('edit_file', { path: 'app/main.py', old_text: 'FastAPI()', new_text: 'FastAPI(title="x")' }, tools)
  assert.equal(result.isError, false)
  assert.equal(tools.state.files.find((file) => file.name === 'schema.sql').content, 'typed by the user')
  assert.match(tools.state.files.find((file) => file.name === 'app/main.py').content, /title="x"/)
})

test('a change that no longer fits after the wait is refused, not forced', async () => {
  const tools = env()
  tools.approve = async () => {
    tools.state.files = tools.state.files.map((file) => (file.name === 'app/main.py' ? { ...file, content: 'rewritten' } : file))
    return true
  }
  const result = await runTool('edit_file', { path: 'app/main.py', old_text: 'FastAPI()', new_text: 'y' }, tools)
  assert.equal(result.isError, true)
  assert.equal(tools.state.files.find((file) => file.name === 'app/main.py').content, 'rewritten')
})

test('Apply keeps edits to other files, and refuses when its own file changed', () => {
  const plan = planApply('app/main.py', 'new', FILES)
  const typed = FILES.map((file) => (file.name === 'schema.sql' ? { ...file, content: 'typed' } : file))
  const rebased = rebaseApply(plan, typed)
  assert.equal(rebased.files.find((file) => file.name === 'schema.sql').content, 'typed')
  assert.equal(rebased.files.find((file) => file.name === 'app/main.py').content, 'new')
  const changed = FILES.map((file) => (file.name === 'app/main.py' ? { ...file, content: 'typed' } : file))
  assert.equal(rebaseApply(plan, changed).isError, true)
  assert.equal(rebaseApply(planApply('app/new.py', 'x', FILES), [...FILES, { name: 'app/new.py', content: '' }]).isError, true)
})

test('undo reverses the task only: later edits and other files stay', () => {
  let log = null
  log = recordChange(log, { path: 'app/main.py', kind: 'edit', before: 'v0', after: 'v1' })
  log = recordChange(log, { path: 'app/main.py', kind: 'edit', before: 'v1', after: 'v2' })
  log = recordChange(log, { path: 'app/new.py', kind: 'create', before: '', after: 'n' })
  log = recordChange(log, { path: 'old.txt', kind: 'delete', before: 'o', after: '' })
  log = recordChange(log, { path: 'kept.py', kind: 'edit', before: 'k0', after: 'k1' })
  const { files, restored, kept } = undoChanges(log, [
    { name: 'app/main.py', content: 'v2' },
    { name: 'app/new.py', content: 'n' },
    { name: 'kept.py', content: 'edited by the user' },
    { name: '.env', content: 'A=1' },
    { name: 'other.py', content: 'untouched' },
  ])
  assert.deepEqual(restored.sort(), ['app/main.py', 'app/new.py', 'old.txt'])
  assert.deepEqual(kept, ['kept.py'])
  const byName = Object.fromEntries(files.map((file) => [file.name, file.content]))
  assert.deepEqual(byName, { 'app/main.py': 'v0', 'kept.py': 'edited by the user', '.env': 'A=1', 'other.py': 'untouched', 'old.txt': 'o' })
})

test('a stream that ends without done is a failure, and keeps the partial text', async () => {
  const saved = []
  const run = (stream) => runAssistantTask({ mode: 'ask', getMessages: () => [{ role: 'user', content: 'hi' }], stream, runTool: async () => ({ content: '' }), onMessage: (message) => saved.push(message) })
  await assert.rejects(run(async ({ onEvent }) => onEvent({ type: 'text', data: { delta: 'partial' } })), /closed before the reply finished/)
  assert.equal(saved.at(-1).content, 'partial')
  saved.length = 0
  await assert.rejects(run(async ({ onEvent }) => {
    onEvent({ type: 'text', data: { delta: 'half' } })
    throw new AssistantError('The connection to WebNest AI was lost.')
  }), /connection to WebNest AI was lost/)
  assert.equal(saved.at(-1).content, 'half')
})

// ---- security --------------------------------------------------------------------------

test('secret files stay private wherever they are, and their values are scrubbed', async () => {
  const files = [
    { name: 'index.html', content: 'see nested-secret-value here' },
    { name: 'frontend/.env', content: 'TOKEN=nested-secret-value\n' },
    { name: '.env.local', content: 'OTHER=local-secret-value\n' },
    { name: 'certs/server.pem', content: 'pem-secret-value\n' },
  ]
  const tools = env({ getFiles: () => files })
  for (const path of ['frontend/.env', '.env.local', '.ENV', 'certs/server.pem', 'id_rsa']) {
    assert.match((await runTool('read_file', { path }, tools)).content, /private/, path)
    assert.match(planApply(path, 'x', files).content, /private/, path)
    assert.match(planFileChange('create_file', { path, content: 'x' }, files).content, /private/, path)
  }
  assert.equal((await runTool('list_files', {}, tools)).content, 'index.html')
  const context = buildContext({ files, selectedFile: 'frontend/.env', lastError: 'local-secret-value pem-secret-value' })
  assert.equal(context.open_file, undefined)
  assert.deepEqual(context.files, ['index.html'])
  assert.equal(context.last_error, '[hidden] [hidden]')
  assert.equal((await runTool('read_file', { path: 'index.html' }, tools)).content, 'see [hidden] here')
})

test('the login token is scrubbed from everything the model gets', async () => {
  const secrets = () => ['placeholder-login-token']
  const printed = 'token placeholder-login-token'
  const run = async () => ({ status: 'success', stdout: printed })
  const tools = env({ run, secrets, request: async () => ({ status: 200, body: printed }), lastResult: () => ({ status: 'error', error: printed }) })
  for (const [name, args] of [['run_project', {}], ['send_api_request', { method: 'GET', path: '/x' }], ['get_errors', {}]]) {
    const { content } = await runTool(name, args, tools)
    assert.ok(!content.includes('placeholder-login-token'), name)
    assert.ok(content.includes('[hidden]'), name)
  }
  assert.ok(!buildContext({ files: [], lastError: printed, secrets: secrets() }).last_error.includes('placeholder-login-token'))
  const failing = env({ secrets, getFiles: () => [], request: async () => { throw new Error(printed) } })
  assert.ok(!(await runTool('send_api_request', { method: 'GET', path: '/x' }, failing)).content.includes('placeholder-login-token'))
})

test('API requests that can change data need approval; reads do not', async () => {
  const tools = env()
  await runTool('send_api_request', { method: 'GET', path: '/x' }, tools)
  assert.equal(tools.state.approvals.length, 0)
  await runTool('send_api_request', { method: 'delete', path: '/x' }, tools)
  assert.deepEqual(tools.state.approvals, [{ type: 'request', method: 'DELETE', path: '/x' }])
  const declined = env({ approve: async () => false })
  assert.match((await runTool('send_api_request', { method: 'POST', path: '/x' }, declined)).content, /chose not/)
})

test('names from the model cannot reach object internals', () => {
  const log = recordChange(recordChange(null, { path: 'constructor', kind: 'create', before: '', after: 'a' }), { path: 'constructor', kind: 'edit', before: 'a', after: 'b' })
  assert.equal(log.constructor.before, null)
  const first = recordChange({}, { path: 'toString', kind: 'edit', before: 'old', after: 'new' })
  assert.equal(first.toString.before, 'old')
  assert.equal(planFileChange('create_file', { path: '__proto__', content: '' }, [], 'go').kind, 'create')
})

test('the preview replaces images that fail to load with a dummy, and reports them', async () => {
  const { createPreviewHtml } = await import('../src/lib/codelab/webPreview.js')
  const html = createPreviewHtml([{ name: 'index.html', content: '<img src="images/a.jpg" alt="Bread">' }])
  assert.match(html, /Image could not load/)
  assert.match(html, /picsum\.photos\/seed/)
  assert.match(html, /image\.src = 'data:image\/svg\+xml/)
  const body = html.slice(html.indexOf('<body>'))
  assert.ok(body.includes('<img src="images/a.jpg" alt="Bread">'), 'the page itself is untouched')
})

// ---- payment ---------------------------------------------------------------------------

test('WebNest AI is paid: only an active plan from the server opens it', () => {
  assert.equal(needsPayment(null), false, 'usage not read: the server decides, with a 402')
  assert.equal(needsPayment({ enabled: true, calls_limit: 40 }), true, 'no plan sent: ask for payment')
  assert.equal(needsPayment({ access: { active: true } }), false)
  assert.equal(needsPayment({ access: { active: false } }), true)
  assert.equal(needsPayment({ access: {} }), true, 'anything but a clear yes stays locked')
})

test('checkout uses only what the server sent for the key, price and order', () => {
  const onPaid = () => {}
  const onClose = () => {}
  const order = { order_id: 'order_placeholder', amount: 29900, currency: 'INR', key_id: 'placeholder-key-id', name: 'WebNest Studio' }
  const options = checkoutOptions(order, { full_name: 'Test Learner', email: 'tester@example.com' }, { onPaid, onClose })
  assert.equal(options.key, 'placeholder-key-id')
  assert.equal(options.amount, 29900)
  assert.equal(options.order_id, 'order_placeholder')
  assert.equal(options.handler, onPaid)
  assert.equal(options.modal.ondismiss, onClose)
  assert.equal(options.callback_url, undefined, 'a redirect would skip the handler')
  assert.equal(options.prefill.email, 'tester@example.com')
  assert.deepEqual(checkoutOptions(order, null, { onPaid, onClose }).prefill, { name: '', email: '' })
})

test('token allowance: what is left, and how it reads', () => {
  assert.equal(tokensLeft({ access: { tokens_limit: 2000000, tokens_used: 500000 } }), 1500000)
  assert.equal(tokensLeft({ access: { tokens_limit: 2000000 } }), 2000000)
  assert.equal(tokensLeft({ access: { tokens_limit: 100, tokens_used: 150 } }), 0, 'a last call can overshoot')
  assert.equal(tokensLeft({ access: { active: true } }), null)
  assert.equal(tokensLeft(null), null)
  assert.equal(formatTokens(2000000), '2M')
  assert.equal(formatTokens(1500000), '1.5M')
  assert.equal(formatTokens(850000), '850K')
  assert.equal(formatTokens(2000000, { long: true }), '2 million')
})

test('plan end date: reads a date, and shows nothing for a bad one', async () => {
  const { expiryDate } = await import('../src/lib/codelab/assistantCheckout.js')
  assert.match(expiryDate('2026-12-01T12:00:00Z'), /1 Dec 2026/)
  assert.equal(expiryDate(null), '')
  assert.equal(expiryDate('not a date'), '')
})

test('the payment records which terms were accepted, and when', () => {
  const options = checkoutOptions({ order_id: 'order_placeholder' }, null, { onPaid() {}, onClose() {}, termsAcceptedAt: '2026-11-01T10:00:00.000Z' })
  assert.deepEqual(options.notes, { terms_version: TERMS_VERSION, terms_accepted_at: '2026-11-01T10:00:00.000Z' })
})

test('WebNest Prime comes only from the membership answer', () => {
  resetMembership()
  assert.equal(getMembership().is_prime, false)
  noteMembership({ is_prime: true, member_label: 'WebNest Prime Member', expires_at: '2026-12-01T00:00:00Z' })
  assert.deepEqual(getMembership(), { is_prime: true, member_label: 'WebNest Prime Member', expires_at: '2026-12-01T00:00:00Z' })
  noteMembership(null) // A failed read changes nothing.
  assert.equal(getMembership().is_prime, true)
  noteMembership({ is_prime: 'yes' })
  assert.equal(getMembership().is_prime, false)
  noteMembership({ is_prime: true })
  noteMembership({ is_prime: false, member_label: 'WebNest Prime Member', expires_at: '2026-12-01T00:00:00Z' })
  assert.deepEqual(getMembership(), { is_prime: false, member_label: null, expires_at: null })
})

test('WebNest Prime does not carry over to the next account', () => {
  resetMembership()
  assert.equal(claimMembershipLoad('a'), true)
  assert.equal(claimMembershipLoad('a'), false)
  noteMembership({ is_prime: true })
  markPaymentPending()
  assert.equal(claimMembershipLoad('b'), true)
  assert.equal(getMembership().is_prime, false)
  assert.equal(isPaymentPending(), false)
  noteMembership({ is_prime: true })
  resetMembership()
  assert.equal(getMembership().is_prime, false)
  assert.equal(claimMembershipLoad('b'), true)
  resetMembership()
})

test('a failed membership read is not an answer, so nobody is treated as a non-member', () => {
  resetMembership()
  claimMembershipLoad('a')
  assert.equal(isCurrentAccount('a'), true)
  assert.equal(isMembershipAnswered(), false)
  noteMembership(null)
  assert.equal(isMembershipAnswered(), false)
  noteMembership({ is_prime: false })
  assert.equal(isMembershipAnswered(), true)
  claimMembershipLoad('b')
  assert.equal(isCurrentAccount('a'), false)
  assert.equal(isMembershipAnswered(), false)
  noteMembership({ is_prime: true })
  assert.equal(isMembershipAnswered(), true)
  resetMembership()
  assert.equal(isMembershipAnswered(), false)
})

test('adverts take the price and period from the plan', () => {
  assert.equal(PLAN_RUPEES, DEFAULT_PLAN.price_paise / 100)
  assert.equal(PLAN_DAYS, DEFAULT_PLAN.pass_days)
})

test('a pending payment blocks paying until the server confirms it', () => {
  resetMembership()
  claimMembershipLoad('a')
  markPaymentPending()
  noteMembership({ is_prime: false })
  assert.equal(isPaymentPending(), true)
  noteMembership({ is_prime: true })
  assert.equal(isPaymentPending(), false)
  resetMembership()
})

test('a member buying again waits for the pass, as they are already Prime', () => {
  resetMembership()
  claimMembershipLoad('a')
  noteMembership({ is_prime: true })
  markPaymentPending({ renewal: true })
  noteMembership({ is_prime: true })
  assert.equal(isPaymentPending(), true)
  notePassActive({ access: { active: false } })
  assert.equal(isPaymentPending(), true)
  notePassActive({ access: { active: true } })
  assert.equal(isPaymentPending(), false)
  clearPaymentPending()
  resetMembership()
})

test('a verify response confirms a payment only when the server says so', () => {
  assert.equal(paymentConfirmed({ is_prime: true, active: true }, false), true)
  assert.equal(paymentConfirmed({ is_prime: true, active: false }, false), true)
  assert.equal(paymentConfirmed({ is_prime: false, active: true }, false), false)
  assert.equal(paymentConfirmed(undefined, false), false)
  assert.equal(paymentConfirmed({ is_prime: true, active: false }, true), false)
  assert.equal(paymentConfirmed({ is_prime: true, active: true }, true), true)
})

test('a reply read aloud leaves out code and Markdown symbols', async () => {
  const { speakableText } = await import('../src/lib/codelab/assistantVoice.js')
  const spoken = speakableText('# Title\n\n**Use** `print` and [the docs](https://example.com):\n\n```python\nprint(1)\n```\n\n- See https://example.com/a')
  assert.equal(spoken, 'Title Use print and the docs: The code is on your screen. See link')
  assert.equal(speakableText('```python\nnever closed'), 'The code is on your screen.')
  assert.equal(speakableText(null), '')
})

test('a long reply is read in pieces, and no words are lost', async () => {
  const { speechChunks } = await import('../src/lib/codelab/assistantVoice.js')
  const text = `${'One two three. '.repeat(40)}${'x'.repeat(450)} आखिरी वाक्य।`
  const chunks = speechChunks(text, 200)
  assert.ok(chunks.length > 1)
  assert.ok(chunks.every((chunk) => chunk.length <= 200))
  assert.equal(chunks.join('').replace(/\s/g, ''), text.replace(/\s/g, ''))
  assert.deepEqual(speechChunks(''), [])
})

test('what is heard joins what was typed, within the message limit', async () => {
  const { joinDictation } = await import('../src/lib/codelab/assistantVoice.js')
  assert.equal(joinDictation('Build ', ' a notes app ', 500), 'Build a notes app')
  assert.equal(joinDictation('', 'hello', 500), 'hello')
  assert.equal(joinDictation('abc', 'defgh', 6), 'abc de')
})

test('a run that ran out of input tells the agent to leave the code alone', async () => {
  const { errorsOf, noteMissingInput } = await import('../src/lib/codelab/assistantTools.js')
  const python = { status: 'runtime_error', stderr: 'EOFError: EOF when reading a line' }
  assert.match(errorsOf(noteMissingInput(python)), /EOFError[\s\S]*Standard input box/)
  const java = { status: 'runtime_error', stderr: 'java.util.NoSuchElementException: No line found', notice: 'Earlier note' }
  assert.equal(noteMissingInput(java).notice.startsWith('Earlier note\n'), true)
  const other = { status: 'runtime_error', stderr: 'ValueError: bad' }
  assert.equal(noteMissingInput(other), other)
  const fine = { status: 'success', stderr: 'EOFError handled' }
  assert.equal(noteMissingInput(fine), fine)
  assert.equal(noteMissingInput(null), null)
})

test('the voice follows the language, and microphone errors stay plain', async () => {
  const { micErrorMessage, pickVoice } = await import('../src/lib/codelab/assistantVoice.js')
  const voices = [{ lang: 'en-US' }, { lang: 'hi_IN' }]
  assert.equal(pickVoice(voices, 'hi-IN'), voices[1])
  assert.equal(pickVoice(voices, 'en-IN'), voices[0])
  assert.equal(pickVoice(voices, 'ta-IN'), null)
  assert.equal(pickVoice(undefined, 'en-IN'), null)
  assert.equal(micErrorMessage('aborted'), '')
  assert.match(micErrorMessage('not-allowed'), /blocked/)
  assert.match(micErrorMessage('constructor'), /type instead/)
})
