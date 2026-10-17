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
