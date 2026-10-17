// Picks a sensible dummy-data generator for each column from its name, type and keys.
// The learner can change every choice before generating.
const NAME_RULES = [
  [/^(e_?mail|email_address)$|_email$/, { kind: 'email' }],
  [/password|_hash$/, { kind: 'password_hash' }],
  [/^(user_?name|login|handle)$/, { kind: 'username' }],
  [/^first_?name$/, { kind: 'first_name' }],
  [/^(last_?name|surname)$/, { kind: 'last_name' }],
  [/^(full_?name|name|customer_name|student_name|employee_name|author)$/, { kind: 'full_name' }],
  [/phone|mobile/, { kind: 'phone' }],
  [/city/, { kind: 'city' }],
  [/country/, { kind: 'country' }],
  [/company|employer/, { kind: 'company' }],
  [/department|dept/, { kind: 'department' }],
  [/product/, { kind: 'product' }],
  [/^(title|subject|headline|label)$/, { kind: 'title' }],
  [/description|body|content|notes?|comment|bio|message/, { kind: 'text' }],
  [/status|state$/, { kind: 'status' }],
  [/^(is_|has_|can_)|^(done|active|completed|enabled|published|verified|in_stock)$/, { kind: 'boolean' }],
  [/price|amount|total|cost|salary|balance|fee/, { kind: 'decimal', min: 10, max: 5000 }],
  [/quantity|qty|stock|count/, { kind: 'int', min: 0, max: 50 }],
  [/age$/, { kind: 'int', min: 18, max: 65 }],
  [/rating|score|marks?/, { kind: 'int', min: 1, max: 100 }],
  [/(_at|_on|timestamp)$/, { kind: 'datetime' }],
  [/(date|_day|dob|birthday)/, { kind: 'date' }],
]

function fromType(type) {
  const upper = String(type || '').toUpperCase()
  if (/INT/.test(upper)) return { kind: 'int', min: 1, max: 1000 }
  if (/REAL|FLOA|DOUB|NUMERIC|DECIMAL/.test(upper)) return { kind: 'decimal', min: 1, max: 1000 }
  if (/BOOL/.test(upper)) return { kind: 'boolean' }
  if (/DATETIME|TIMESTAMP/.test(upper)) return { kind: 'datetime' }
  if (/DATE/.test(upper)) return { kind: 'date' }
  return { kind: 'title' }
}

// Reads `CHECK (col IN ('a', 'b'))` from a CREATE TABLE statement, so generated values
// always satisfy the constraint.
export function checkInValues(createSql, column) {
  if (!createSql) return null
  const name = column.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`CHECK\\s*\\(\\s*["\`\\[]?${name}["\`\\]]?\\s+IN\\s*\\(([^)]*)\\)`, 'i').exec(createSql)
  if (!match) return null
  const values = [...match[1].matchAll(/'((?:[^']|'')*)'|(-?\d+(?:\.\d+)?)/g)]
    .map((item) => (item[1] !== undefined ? item[1].replace(/''/g, "'") : Number(item[2])))
  return values.length ? values : null
}

// `table` is one entry from describe_schema(): { name, sql, columns, foreignKeys, indexes }.
export function inferColumns(table) {
  const uniqueColumns = new Set(
    (table.indexes ?? []).filter((index) => index.unique && index.columns.length === 1).map((index) => index.columns[0]),
  )
  const singlePk = (table.columns ?? []).filter((column) => column.pk).length === 1
  return (table.columns ?? []).map((column) => {
    const name = column.name
    const lower = name.toLowerCase()
    const fk = (table.foreignKeys ?? []).find((key) => key.column === name)
    let spec
    if (column.pk && singlePk && /INT/i.test(column.type || 'INTEGER')) spec = { kind: 'skip' }
    else if (fk) spec = { kind: 'fk', table: fk.table, to: fk.to || 'id', column: name }
    else if (column.default != null && /(_at|_on)$/.test(lower)) spec = { kind: 'skip' }
    else spec = { ...(NAME_RULES.find(([pattern]) => pattern.test(lower))?.[1] ?? fromType(column.type)) }
    const allowed = spec.kind === 'skip' || spec.kind === 'fk' ? null : checkInValues(table.sql, name)
    if (allowed) spec = { kind: 'enum', values: allowed }
    if (uniqueColumns.has(name) && spec.kind !== 'skip' && spec.kind !== 'fk') spec.unique = true
    return { name, type: column.type, notnull: column.notnull, spec }
  })
}

// Tables a generation depends on: every parent that a foreign key points to.
export function parentTables(columns) {
  return [...new Set(columns.filter((column) => column.spec.kind === 'fk').map((column) => column.spec.table))]
}
