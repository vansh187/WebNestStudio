import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildFileTree, languageForFile, layerOfFile, layeringHints, newFileTemplate, renameEntry, renamePath, traceHints, validateBackendPath,
} from '../src/lib/codelab/backendFiles.js'

const files = [
  { name: 'schema.sql', content: '' },
  { name: 'app/main.py', content: '' },
  { name: 'app/api/task_routes.py', content: '' },
  { name: 'app/services/task_service.py', content: '' },
  { name: 'frontend/index.html', content: '' },
]

test('backend paths: folders, module names and file types are validated', () => {
  assert.equal(validateBackendPath('app/repositories/order_repository.py', files), '')
  assert.equal(validateBackendPath('frontend/app.css', files), '')
  assert.match(validateBackendPath('app/main.py', files), /already exists/)
  assert.match(validateBackendPath('app/order-service.py', files), /valid module names/)
  assert.match(validateBackendPath('app/2fast.py', files), /valid module names/)
  assert.match(validateBackendPath('main.py', files), /inside the app\/ folder/)
  assert.match(validateBackendPath('app/../secret.py', files), /letters, numbers/)
  assert.match(validateBackendPath('app/run.exe', files), /file types/)
  assert.match(validateBackendPath('app/api', files), /file types|share the same name/)
  assert.match(validateBackendPath('frontend/index.html/x.css', files), /share the same name/)
  assert.equal(validateBackendPath('app/main.py', files, 'app/main.py'), '', 'renaming a file to itself is fine')
  const full = Array.from({ length: 40 }, (_, i) => ({ name: `app/m${i}.py`, content: '' }))
  assert.match(validateBackendPath('app/extra.py', full), /up to 40 files/)
  // Names the server refuses because Windows cannot store them.
  assert.match(validateBackendPath('app/con.py', files), /reserved name on Windows/)
  assert.match(validateBackendPath('frontend/NUL.html', files), /reserved name on Windows/)
  assert.match(validateBackendPath('app/lpt1/x.py', files), /reserved name on Windows/)
  assert.match(validateBackendPath('frontend/app./x.css', files), /end with a dot/)
  assert.equal(validateBackendPath('app/console.py', files), '')
  assert.equal(validateBackendPath('.env', []), '')
  // Case-insensitive like Windows and macOS (and the server).
  assert.match(validateBackendPath('app/Main.py', files), /app\/main\.py already exists \(names differ only in letter case\)/)
  assert.match(validateBackendPath('App/notes.md', files), /existing folder app\//)
  assert.match(validateBackendPath('Frontend/x.css', files), /existing folder frontend\//)
  assert.match(validateBackendPath('app/MAIN.PY', files), /app\/main\.py already exists/)
  assert.equal(validateBackendPath('app/main.py', files, 'app/main.py'), '')
  // Python rules apply whatever the extension's case.
  assert.match(validateBackendPath('Main.PY', files), /inside the app\/ folder/)
  assert.match(validateBackendPath('app/my-mod.PY', files), /valid module names/)
  assert.equal(validateBackendPath('  /app\\services\\x.py ', files), '', 'normalized like normalizeBackendPath')
  // The renamed file does not clash with itself, nor with the folder it alone is in.
  const lone = [{ name: 'app/main.py', content: '' }, { name: 'docs/notes.md', content: '' }]
  assert.equal(validateBackendPath('docs/Notes.md', lone, 'docs/notes.md'), '')
  assert.equal(validateBackendPath('Docs/notes.md', lone, 'docs/notes.md'), '')
  const nested = [{ name: 'guide.md/intro.md', content: '' }]
  assert.equal(validateBackendPath('guide.md', nested, 'guide.md/intro.md'), '', 'its only folder can become its name')
  assert.match(validateBackendPath('guide.md', nested), /cannot share the same name/)
  // renameEntry checks the new name with `current` set to it, against a list without the
  // moved file: a folder spelled differently must still be caught.
  const cased = [{ name: 'Docs/a.md', content: '' }, { name: 'x.md', content: '' }]
  assert.match(renameEntry(cased, 'x.md', 'docs/b.md', false).error ?? '', /existing folder Docs\//)
  assert.deepEqual(renameEntry(cased, 'x.md', 'Docs/b.md', false).files?.map((file) => file.name), ['Docs/a.md', 'Docs/b.md'])
  // Two spellings already saved (an older project): either may be used, a third may not.
  const legacy = [{ name: 'Docs/a.md', content: '' }, { name: 'docs/b.md', content: '' }]
  assert.equal(validateBackendPath('docs/c.md', legacy), '')
  assert.equal(validateBackendPath('Docs/c.md', legacy), '')
  assert.match(validateBackendPath('DOCS/c.md', legacy), /existing folder/)
  // A list changed in place or grown by push (GitHub import) is checked as it is now.
  const growing = [{ name: 'app/main.py', content: '' }]
  assert.equal(validateBackendPath('app/a.py', growing), '')
  growing.push({ name: 'app/a.py', content: '' })
  assert.match(validateBackendPath('app/A.py', growing), /app\/a\.py already exists/)
  growing[1] = { name: 'app/b.py', content: '' }
  assert.equal(validateBackendPath('app/A.py', growing), '', 'an in-place change is seen too')
})

test('backend files: languages, layers and the folder tree', () => {
  assert.equal(languageForFile('schema.sql'), 'sql')
  assert.equal(languageForFile('frontend/script.js'), 'javascript')
  assert.equal(layerOfFile('app/api/task_routes.py'), 'api')
  assert.equal(layerOfFile('app/repositories/x.py'), 'repositories')
  assert.equal(layerOfFile('app/database.py'), 'database')
  assert.equal(layerOfFile('frontend/index.html'), 'client')
  const tree = buildFileTree(files)
  assert.deepEqual(tree.folders.map((folder) => folder.name), ['app', 'frontend'])
  assert.deepEqual(tree.files.map((file) => file.name), ['schema.sql'])
  const app = tree.folders[0]
  assert.deepEqual(app.folders.map((folder) => folder.path), ['app/api', 'app/services'])
  assert.deepEqual(app.files.map((file) => file.name), ['app/main.py'])
})

test('renaming a folder moves every file inside it', () => {
  const renamed = renamePath(files, 'app/services', 'app/domain')
  assert.ok(renamed.some((file) => file.name === 'app/domain/task_service.py'))
  assert.ok(!renamed.some((file) => file.name.startsWith('app/services/')))
  assert.equal(renamePath(files, 'schema.sql', 'db/schema.sql').find((file) => file.name === 'db/schema.sql').language, 'sql')
})

test('layering hints flag SQL in routes and HTTP in lower layers', () => {
  const hints = layeringHints([
    { name: 'app/api/bad_routes.py', content: 'db.execute("SELECT 1")' },
    { name: 'app/repositories/bad_repository.py', content: 'from fastapi import HTTPException' },
    { name: 'app/services/bad_service.py', content: 'conn.execute("DELETE FROM t")' },
    { name: 'app/database.py', content: 'sqlite3.connect("app.db")' },
    { name: 'app/repositories/good_repository.py', content: 'db.execute("SELECT 1")' },
  ])
  assert.deepEqual(hints.map((hint) => hint.file), ['app/api/bad_routes.py', 'app/repositories/bad_repository.py', 'app/services/bad_service.py'])
  const trace = { calls: [{ fn: 'list_items', file: 'app/api/item_routes.py', layer: 'api' }], sql: [{ sql: 'SELECT 1', call: 0, layer: 'api' }] }
  assert.match(traceHints(trace)[0].message, /list_items ran 1 SQL statement itself/)
  assert.deepEqual(traceHints({ calls: [], sql: [{ sql: 'SELECT 1', call: 0, layer: 'repositories' }] }), [])
})

test('new files start with a template for their layer', () => {
  assert.match(newFileTemplate('app/api/order_routes.py'), /APIRouter\(prefix="\/api\/order"/)
  assert.match(newFileTemplate('app/services/order_service.py'), /No HTTP and no SQL/)
  assert.match(newFileTemplate('app/repositories/order_repository.py'), /SELECT \* FROM order/)
  assert.equal(newFileTemplate('frontend/extra.css'), '')
})

test('renaming onto an existing file or folder is rejected (no duplicate names)', () => {
  const project = [
    { name: 'app/a.py', content: 'a' },
    { name: 'app/b.py', content: 'b' },
    { name: 'app/services/x.py', content: 'x' },
    { name: 'app/domain/x.py', content: 'other x' },
  ]
  assert.match(renameEntry(project, 'app/a.py', 'app/b.py', false).error, /app\/b.py already exists/)
  assert.match(renameEntry(project, 'app/services', 'app/domain', true).error, /app\/domain\/x.py already exists/)
  assert.match(renameEntry(project, 'app/services', 'app/services/inner', true).error, /inside itself/)
  const ok = renameEntry(project, 'app/a.py', 'app/c.py', false)
  assert.deepEqual(ok.files.map((file) => file.name), ['app/c.py', 'app/b.py', 'app/services/x.py', 'app/domain/x.py'])
  assert.equal(new Set(ok.files.map((file) => file.name)).size, ok.files.length)
  assert.deepEqual(renameEntry(project, 'app/a.py', 'app/a.py', false).files, project)
})
