import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { createRandom, generateRows } from '../src/lib/practiceData/generator.js'
import { checkInValues, inferColumns, parentTables } from '../src/lib/practiceData/infer.js'
import { insertScript, literal, quoteIdent } from '../src/lib/practiceData/dialects/sqlite.js'

// The same table description the backend runtime builds (describe_schema in
// webnest_runtime.py), read here with node:sqlite.
function describe(db) {
  return db.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(({ name, sql }) => ({
    name,
    sql,
    columns: db.prepare(`PRAGMA table_info(${quoteIdent(name)})`).all().map((c) => ({ name: c.name, type: c.type, notnull: Boolean(c.notnull), default: c.dflt_value, pk: c.pk })),
    foreignKeys: db.prepare(`PRAGMA foreign_key_list(${quoteIdent(name)})`).all().map((f) => ({ column: f.from, table: f.table, to: f.to })),
    indexes: db.prepare(`PRAGMA index_list(${quoteIdent(name)})`).all().map((i) => ({
      name: i.name,
      unique: Boolean(i.unique),
      columns: db.prepare(`PRAGMA index_info(${quoteIdent(i.name)})`).all().map((c) => c.name),
    })),
  }))
}

const starterSchema = (id) => readFileSync(new URL(`../src/data/backendStarters/${id}/schema.sql`, import.meta.url), 'utf8')

test('the same seed always produces the same rows', () => {
  const columns = [{ name: 'name', spec: { kind: 'full_name' } }, { name: 'price', spec: { kind: 'decimal', min: 10, max: 20 } }]
  assert.deepEqual(generateRows(columns, 5, { seed: 42 }), generateRows(columns, 5, { seed: 42 }))
  assert.notDeepEqual(generateRows(columns, 5, { seed: 42 }).rows, generateRows(columns, 5, { seed: 43 }).rows)
  const random = createRandom(7)
  for (let i = 0; i < 200; i += 1) {
    const value = random.int(3, 5)
    assert.ok(value >= 3 && value <= 5)
  }
})

test('generators are inferred from names, types, keys and CHECK constraints', () => {
  const db = new DatabaseSync(':memory:')
  db.exec(starterSchema('tasks'))
  const [tasks] = describe(db)
  const specs = Object.fromEntries(inferColumns(tasks).map((column) => [column.name, column.spec]))
  assert.equal(specs.id.kind, 'skip', 'INTEGER PRIMARY KEY is left to AUTOINCREMENT')
  assert.equal(specs.created_at.kind, 'skip', 'a timestamp with a default keeps the default')
  assert.deepEqual(specs.priority, { kind: 'enum', values: ['low', 'medium', 'high'] })
  assert.deepEqual(specs.done, { kind: 'enum', values: [0, 1] })
  assert.equal(specs.description.kind, 'text')
  assert.deepEqual(checkInValues("CHECK (status IN ('a', 'it''s'))", 'status'), ['a', "it's"])
  assert.equal(checkInValues('CHECK (x > 0)', 'x'), null)
})

test('generated rows satisfy every constraint of the auth starter schema', () => {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(starterSchema('auth'))
  const tables = Object.fromEntries(describe(db).map((table) => [table.name, table]))
  const userColumns = inferColumns(tables.users)
  assert.equal(userColumns.find((column) => column.name === 'email').spec.kind, 'email')
  assert.equal(userColumns.find((column) => column.name === 'email').spec.unique, true)
  assert.equal(userColumns.find((column) => column.name === 'password_hash').spec.kind, 'password_hash')

  const users = generateRows(userColumns, 300, { seed: 1 })
  db.exec(insertScript('users', users.columns, users.rows))
  assert.equal(db.prepare('SELECT COUNT(DISTINCT email) AS n FROM users').get().n, 300)
  // A second batch continues the numbering, so UNIQUE emails still never clash.
  const more = generateRows(userColumns, 50, { seed: 1, offset: 300 })
  db.exec(insertScript('users', more.columns, more.rows))

  const taskColumns = inferColumns(tables.tasks)
  assert.deepEqual(parentTables(taskColumns), ['users'])
  const ids = db.prepare('SELECT id FROM users').all().map((row) => row.id)
  const tasks = generateRows(taskColumns, 1000, { seed: 9, foreignValues: { user_id: ids } })
  db.exec(insertScript('tasks', tasks.columns, tasks.rows))
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM tasks').get().n, 1000)
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM tasks WHERE user_id NOT IN (SELECT id FROM users)').get().n, 0)
})

test('a failing batch inserts nothing', () => {
  const db = new DatabaseSync(':memory:')
  db.exec(starterSchema('tasks'))
  const rows = [['ok', 'low'], ['bad', 'urgent']]
  assert.throws(() => db.exec(insertScript('tasks', ['title', 'priority'], rows)))
  try { db.exec('ROLLBACK') } catch { /* already rolled back */ }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE title = 'ok'").get().n, 0)
})

test('SQLite literals and identifiers are escaped', () => {
  assert.equal(literal("O'Brien"), "'O''Brien'")
  assert.equal(literal(null), 'NULL')
  assert.equal(literal(true), '1')
  assert.equal(quoteIdent('we"ird'), '"we""ird"')
  assert.match(insertScript('t', [], [[]]), /DEFAULT VALUES/)
})
