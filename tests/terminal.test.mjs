import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addRequirements, listFolder, packageScripts, parseRequirements, removeRequirements, resolveCommand, splitCommand,
} from '../src/lib/codelab/terminal.js'

const PACKAGE = JSON.stringify({ scripts: { dev: 'uvicorn app.main:app --reload', build: 'python -m compileall -q app', all: 'npm run build && npm run dev' } })
const resolve = (line, packageJson = PACKAGE) => resolveCommand(splitCommand(line)[0] ?? [], { packageJson })

test('lines split like a shell: quotes, escapes and && chains', () => {
  assert.deepEqual(splitCommand('pip install humanize'), [['pip', 'install', 'humanize']])
  assert.deepEqual(splitCommand(`python -c "print('a && b')"`), [['python', '-c', "print('a && b')"]])
  assert.deepEqual(splitCommand('npm run build && npm run dev'), [['npm', 'run', 'build'], ['npm', 'run', 'dev']])
  assert.deepEqual(splitCommand('echo a; echo "b \\"c\\""'), [['echo', 'a'], ['echo', 'b "c"']])
  assert.deepEqual(splitCommand('echo ""'), [['echo', '']])
  assert.deepEqual(splitCommand('   '), [])
})

test('requirements files: parse, add without duplicates, remove by normalised name', () => {
  const text = '# deps\nfastapi\nPyJWT==2.13.0  # tokens\n-r other.txt\n\n'
  assert.deepEqual(parseRequirements(text), ['fastapi', 'PyJWT==2.13.0'])
  const added = addRequirements(text, ['pyjwt', 'humanize==4.12.0', 'Humanize'])
  assert.deepEqual(added.added, ['humanize==4.12.0'])
  assert.ok(added.text.endsWith('humanize==4.12.0\n'))
  assert.equal(addRequirements('', ['requests']).text, 'requests\n')
  assert.equal(addRequirements('fastapi', ['requests']).text, 'fastapi\nrequests\n')
  const removed = removeRequirements(text, ['pyjwt', 'missing'])
  assert.deepEqual(removed.removed, ['PyJWT'])
  assert.ok(!/PyJWT/.test(removed.text) && /fastapi/.test(removed.text))
  assert.deepEqual(removeRequirements('python-multipart\n', ['Python_Multipart']).removed, ['python-multipart'])
})

test('pip commands', () => {
  assert.deepEqual(resolve('pip install humanize "pendulum>=3"'), { kind: 'install', packages: ['humanize', 'pendulum>=3'] })
  assert.deepEqual(resolve('python -m pip install -U humanize'), { kind: 'install', packages: ['humanize'] })
  assert.deepEqual(resolve('pip3 install -r requirements.txt'), { kind: 'install', fromFile: 'requirements.txt' })
  assert.deepEqual(resolve('pip uninstall -y humanize'), { kind: 'uninstall', names: ['humanize'] })
  assert.deepEqual(resolve('pip freeze'), { kind: 'pipList', freeze: true })
  assert.equal(resolve('pip install').ok, false)
  assert.equal(resolve('pip install ./local').ok, false)
})

test('python, uvicorn and fastapi commands', () => {
  assert.deepEqual(resolve('python app/seed.py --count 3'), { kind: 'exec', mode: 'file', target: 'app/seed.py', args: ['--count', '3'] })
  assert.deepEqual(resolve('python3 ./app/seed.py'), { kind: 'exec', mode: 'file', target: 'app/seed.py', args: [] })
  assert.deepEqual(resolve('python -m compileall -q app'), { kind: 'exec', mode: 'module', target: 'compileall', args: ['-q', 'app'] })
  assert.deepEqual(resolve('python -u -c "print(1)" x'), { kind: 'exec', mode: 'code', target: 'print(1)', args: ['x'] })
  assert.equal(resolve('python').kind, 'message')
  assert.deepEqual(resolve('uvicorn app.main:app --reload'), { kind: 'run' })
  assert.deepEqual(resolve('python -m uvicorn app.main:app'), { kind: 'run' })
  assert.deepEqual(resolve('fastapi dev app/main.py'), { kind: 'run' })
})

test('npm runs package.json scripts and explains what it cannot do', () => {
  assert.deepEqual(resolve('npm run dev'), { kind: 'script', name: 'dev', command: 'uvicorn app.main:app --reload' })
  assert.deepEqual(resolve('npm run-script build'), { kind: 'script', name: 'build', command: 'python -m compileall -q app' })
  assert.match(resolve('npm run nope').text, /Missing script: "nope"[\s\S]*dev, build, all/)
  assert.match(resolve('npm run').text, /Scripts in package.json/)
  assert.match(resolve('npm start').text, /Missing script: "start"/)
  assert.match(resolve('npm run dev', null).text, /No package.json/)
  assert.match(resolve('npm run dev', '{oops').text, /not valid JSON/)
  assert.deepEqual(resolve('npm install'), { kind: 'install', fromFile: 'requirements.txt', quietIfMissing: true })
  assert.match(resolve('npm install axios').text, /pip install axios/)
  assert.equal(packageScripts(null), null)
  assert.deepEqual(packageScripts('{}'), {})
})

test('shell basics and unknown commands', () => {
  assert.deepEqual(resolve('clear'), { kind: 'clear' })
  assert.deepEqual(resolve('ls app'), { kind: 'ls', path: 'app' })
  assert.deepEqual(resolve('cat requirements.txt'), { kind: 'cat', file: 'requirements.txt' })
  assert.match(resolve('help').text, /pip install/)
  assert.equal(resolve('rm -rf /').ok, false)
  assert.equal(resolve('node index.js').ok, false)
})

test('ls lists one folder level, folders first', () => {
  const files = [{ name: 'app/main.py' }, { name: 'app/api/routes.py' }, { name: 'schema.sql' }, { name: 'frontend/index.html' }]
  assert.deepEqual(listFolder(files), ['app/', 'frontend/', 'schema.sql'])
  assert.deepEqual(listFolder(files, 'app/'), ['api/', 'main.py'])
  assert.deepEqual(listFolder(files, './app'), ['api/', 'main.py'])
  assert.deepEqual(listFolder(files, 'nope'), [])
})
