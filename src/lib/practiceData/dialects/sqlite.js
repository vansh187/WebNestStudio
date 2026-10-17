// SQLite text for generated rows. Other databases (PostgreSQL in a later phase) get their
// own module with the same exports.
export function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`
}

export function literal(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  if (typeof value === 'boolean') return value ? '1' : '0'
  return `'${String(value).replace(/'/g, "''")}'`
}

// Multi-row INSERTs in batches, wrapped in one transaction so a failure inserts nothing.
export function insertScript(table, columns, rows, batchSize = 100) {
  if (!rows.length) return ''
  const head = columns.length
    ? `INSERT INTO ${quoteIdent(table)} (${columns.map(quoteIdent).join(', ')}) VALUES`
    : `INSERT INTO ${quoteIdent(table)} DEFAULT VALUES`
  const statements = []
  if (!columns.length) {
    for (let i = 0; i < rows.length; i += 1) statements.push(`${head};`)
  } else {
    for (let i = 0; i < rows.length; i += batchSize) {
      const values = rows.slice(i, i + batchSize).map((row) => `  (${row.map(literal).join(', ')})`).join(',\n')
      statements.push(`${head}\n${values};`)
    }
  }
  return ['BEGIN;', ...statements, 'COMMIT;'].join('\n')
}

export function selectColumnSql(table, column, limit = 5000) {
  return `SELECT ${quoteIdent(column)} FROM ${quoteIdent(table)} LIMIT ${limit};`
}
