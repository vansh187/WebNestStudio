import test from 'node:test'
import assert from 'node:assert/strict'
import {
  HELP_TROUBLESHOOTING, KEY_CODE_EXAMPLE, KEY_ENV_EXAMPLE, KEY_NOTES, KEY_STEPS, PACKAGE_COMMANDS, PACKAGE_NOTES,
} from '../src/data/playgroundHelp.js'
import { installHint, resolveCommand, splitCommand } from '../src/lib/codelab/terminal.js'

test('every command in the Help tab is one the terminal understands', () => {
  assert.ok(PACKAGE_COMMANDS.length > 0)
  for (const { command } of PACKAGE_COMMANDS) {
    for (const tokens of splitCommand(command)) {
      const action = resolveCommand(tokens)
      assert.notEqual(action.kind, 'message', `"${command}" is not a terminal command: ${action.text}`)
    }
  }
})

test('the commands cover install, install from requirements.txt, uninstall and list', () => {
  const kinds = PACKAGE_COMMANDS.map(({ command }) => resolveCommand(splitCommand(command)[0]))
  assert.ok(kinds.some((action) => action.kind === 'install' && action.packages?.length))
  assert.ok(kinds.some((action) => action.kind === 'install' && action.fromFile === 'requirements.txt'))
  assert.ok(kinds.some((action) => action.kind === 'uninstall'))
  assert.ok(kinds.some((action) => action.kind === 'pipList'))
})

test('packages the Help tab says can\'t work do get a terminal hint', () => {
  for (const name of ['psycopg2', 'uvloop', 'redis', 'pymysql', 'pymongo', 'celery']) {
    assert.ok(PACKAGE_NOTES.some((note) => note.includes(name)), `${name} is not mentioned`)
    assert.ok(installHint(name).length > 0, `${name} has no terminal hint`)
  }
})

test('the key example reads the same name the .env example sets', () => {
  const [name] = KEY_ENV_EXAMPLE.split('=')
  assert.match(name, /^[A-Z][A-Z0-9_]*$/)
  assert.ok(KEY_CODE_EXAMPLE.includes(`os.environ["${name}"]`))
  assert.ok(HELP_TROUBLESHOOTING.some((item) => item.problem.includes(name)), 'the KeyError example uses the same name')
})

test('the Help tab stays short and generic', () => {
  const text = JSON.stringify([PACKAGE_COMMANDS, PACKAGE_NOTES, KEY_STEPS, KEY_NOTES, HELP_TROUBLESHOOTING])
  for (const name of ['razorpay', 'stripe', 'relay']) assert.doesNotMatch(text, new RegExp(name, 'i'), `mentions ${name}`)
  assert.ok(PACKAGE_NOTES.length <= 4 && KEY_STEPS.length <= 4 && KEY_NOTES.length <= 3 && HELP_TROUBLESHOOTING.length <= 4)
})

test('it tells learners to keep keys in .env, says .env is never pushed, and has no real-looking secrets', () => {
  assert.ok(KEY_STEPS.some((step) => step.includes('.env')))
  assert.ok(KEY_STEPS.some((step) => /never paste a key into a \.py file/i.test(step)))
  assert.ok(KEY_NOTES.some((note) => /GitHub sync never pushes \.env/.test(note)))
  assert.doesNotMatch(`${KEY_ENV_EXAMPLE}\n${KEY_CODE_EXAMPLE}`, /(rzp|sk|pk)_(test|live)_|eyJ[A-Za-z0-9_-]{10,}|:\/\/[^\s:@]+:[^\s@]+@/)
})

test('it says direct database connections are coming and points to SQLite meanwhile', () => {
  const note = KEY_NOTES.find((item) => /database/i.test(item))
  assert.ok(note)
  assert.match(note, /coming soon/)
  assert.match(note, /SQLite/)
})
