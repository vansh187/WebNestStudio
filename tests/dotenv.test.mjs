import test from 'node:test'
import assert from 'node:assert/strict'
import { envFromFiles, parseDotenv } from '../src/lib/codelab/dotenv.js'
import { isPrivateFile, newFileTemplate, validateBackendPath } from '../src/lib/codelab/backendFiles.js'
import { changedFiles, filesForMode } from '../src/lib/github/sync.js'

test('.env lines parse like python-dotenv', () => {
  const { values, problems } = parseDotenv([
    '# comment',
    'RAZORPAY_KEY_ID=rzp_test_123',
    'export SECRET_KEY = "a long # value"',
    "SINGLE='keep \\n as is'",
    'DOUBLE="line1\\nline2"',
    'INLINE=value # note',
    'EMPTY=',
    'URL=postgres://u:p@host/db?x=1',
    'not a pair',
    '9BAD=1',
    'OPEN="never closed',
    '',
  ].join('\n'))
  assert.deepEqual(values, {
    RAZORPAY_KEY_ID: 'rzp_test_123',
    SECRET_KEY: 'a long # value',
    SINGLE: 'keep \\n as is',
    DOUBLE: 'line1\nline2',
    INLINE: 'value',
    EMPTY: '',
    URL: 'postgres://u:p@host/db?x=1',
  })
  assert.deepEqual(problems.map((item) => item.line), [9, 10, 11])
  assert.deepEqual(envFromFiles([{ name: 'app/main.py', content: 'X=1' }]).values, {})
  assert.deepEqual(envFromFiles([{ name: '.env', content: 'X=1' }]).values, { X: '1' })
})

test('only a root .env is accepted, with a template that explains it', () => {
  assert.equal(validateBackendPath('.env', []), '')
  assert.match(validateBackendPath('app/.env', []), /project root/)
  assert.match(validateBackendPath('.envrc', []), /letters, numbers|file types/)
  assert.match(validateBackendPath('.env', [{ name: '.env' }]), /already exists/)
  assert.ok(isPrivateFile('.env') && !isPrivateFile('app/main.py'))
  assert.match(newFileTemplate('.env'), /os\.environ/)
})

test('GitHub sync never pushes or imports .env', async () => {
  const files = [{ name: 'app/main.py', content: 'x' }, { name: '.env', content: 'KEY=secret' }]
  assert.deepEqual((await changedFiles(files, null)).upserts, ['app/main.py'])
  const imported = filesForMode([{ path: 'app/main.py', content: 'x' }, { path: '.env', content: 'KEY=leaked' }], 'backend')
  assert.deepEqual(imported.files.map((file) => file.name), ['app/main.py'])
  assert.equal(imported.skipped[0].reason, 'private')
})
