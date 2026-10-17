// Deterministic dummy data for practice tables. The same seed always gives the same rows,
// so a lesson, a bug report and a test can all reproduce one dataset.
const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Ananya', 'Arjun', 'Asha', 'Diya', 'Ishaan', 'Kabir', 'Kavya', 'Meera',
  'Neha', 'Nikhil', 'Priya', 'Rahul', 'Riya', 'Rohan', 'Saanvi', 'Sara', 'Vihaan', 'Zoya',
  'Aisha', 'Daniel', 'Emma', 'Hana', 'Liam', 'Lucas', 'Maya', 'Noah', 'Olivia', 'Omar',
]
const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Iyer', 'Nair', 'Reddy', 'Khan', 'Singh', 'Patel', 'Mehta',
  'Das', 'Joshi', 'Kapoor', 'Malhotra', 'Rao', 'Bose', 'Chopra', 'Menon', 'Pillai', 'Shah',
  'Brown', 'Garcia', 'Kim', 'Lopez', 'Martin', 'Nguyen', 'Silva', 'Smith', 'Tanaka', 'Wilson',
]
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Kochi', 'London', 'Singapore', 'Dubai', 'Toronto', 'Sydney']
const COUNTRIES = ['India', 'United Kingdom', 'Singapore', 'United Arab Emirates', 'Canada', 'Australia']
const PRODUCT_ADJECTIVES = ['Classic', 'Smart', 'Eco', 'Pro', 'Mini', 'Ultra', 'Organic', 'Wireless', 'Compact', 'Premium']
const PRODUCT_NOUNS = ['Notebook', 'Backpack', 'Headphones', 'Water Bottle', 'Desk Lamp', 'Keyboard', 'Mug', 'T-Shirt', 'Sneakers', 'Charger', 'Planner', 'Speaker']
const COMPANIES = ['Webnest Labs', 'Sunrise Traders', 'BlueOak Tech', 'Green Leaf Foods', 'Nova Retail', 'Pixel Works', 'Metro Logistics', 'Lotus Health']
const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Finance', 'Human Resources', 'Support', 'Operations', 'Design']
const STATUSES = ['pending', 'active', 'completed', 'cancelled']
const WORDS = [
  'plan', 'review', 'update', 'build', 'design', 'test', 'deploy', 'report', 'meeting', 'invoice',
  'order', 'customer', 'project', 'feature', 'release', 'budget', 'schedule', 'draft', 'launch', 'research',
  'weekly', 'quick', 'final', 'team', 'client', 'mobile', 'website', 'database', 'payment', 'support',
]
const DOMAINS = ['example.com', 'mail.test', 'webnest.dev', 'inbox.test']

export function createRandom(seed = 1) {
  let state = Number(seed) >>> 0 || 1
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min, max) => Math.floor(next() * (max - min + 1)) + min
  const pick = (list) => list[Math.floor(next() * list.length)]
  return { next, int, pick }
}

const pad = (value) => String(value).padStart(2, '0')
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

function date(random, from = '2023-01-01', to = '2026-10-01', withTime = false) {
  const start = Date.parse(`${from}T00:00:00Z`)
  const end = Date.parse(`${to}T00:00:00Z`)
  const value = new Date(start + Math.floor(random.next() * Math.max(1, end - start)))
  const day = `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`
  return withTime ? `${day} ${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())}` : day
}

function sentence(random, min = 3, max = 7) {
  const words = Array.from({ length: random.int(min, max) }, () => random.pick(WORDS))
  return capitalize(words.join(' '))
}

// Generator kinds offered in the "Generate dummy data" form.
export const GENERATOR_KINDS = [
  { id: 'skip', label: 'Leave empty (default / auto)' },
  { id: 'first_name', label: 'First name' },
  { id: 'last_name', label: 'Last name' },
  { id: 'full_name', label: 'Full name' },
  { id: 'email', label: 'Email' },
  { id: 'username', label: 'Username' },
  { id: 'phone', label: 'Phone number' },
  { id: 'city', label: 'City' },
  { id: 'country', label: 'Country' },
  { id: 'company', label: 'Company' },
  { id: 'department', label: 'Department' },
  { id: 'product', label: 'Product name' },
  { id: 'title', label: 'Short title' },
  { id: 'text', label: 'Sentence' },
  { id: 'status', label: 'Status (pending, active…)' },
  { id: 'int', label: 'Whole number (range)' },
  { id: 'decimal', label: 'Decimal / price (range)' },
  { id: 'boolean', label: 'Boolean (0 or 1)' },
  { id: 'date', label: 'Date' },
  { id: 'datetime', label: 'Date and time' },
  { id: 'password_hash', label: 'Fake password hash' },
  { id: 'enum', label: 'One of a list' },
  { id: 'fk', label: 'Existing row of another table' },
]

// Produces one value. `index` is the row number, used to keep UNIQUE columns unique.
export function generateValue(spec, random, index, context = {}) {
  const first = () => random.pick(FIRST_NAMES)
  const last = () => random.pick(LAST_NAMES)
  switch (spec.kind) {
    case 'skip': return undefined
    case 'first_name': return first()
    case 'last_name': return last()
    case 'full_name': return `${first()} ${last()}`
    case 'email': return `${slug(`${first()}.${last()}`)}${index + 1}@${random.pick(DOMAINS)}`
    case 'username': return `${slug(first())}_${index + 1}`
    case 'phone': return `+91 ${random.int(70000, 99999)} ${random.int(10000, 99999)}`
    case 'city': return random.pick(CITIES)
    case 'country': return random.pick(COUNTRIES)
    case 'company': return random.pick(COMPANIES)
    case 'department': return random.pick(DEPARTMENTS)
    case 'product': return `${random.pick(PRODUCT_ADJECTIVES)} ${random.pick(PRODUCT_NOUNS)}`
    case 'title': return sentence(random, 2, 5)
    case 'text': return `${sentence(random, 6, 12)}.`
    case 'status': return random.pick(spec.values?.length ? spec.values : STATUSES)
    case 'int': {
      const min = Number.isFinite(spec.min) ? spec.min : 1
      const max = Number.isFinite(spec.max) ? spec.max : 100
      return spec.unique ? min + index : random.int(Math.min(min, max), Math.max(min, max))
    }
    case 'decimal': {
      const min = Number.isFinite(spec.min) ? spec.min : 1
      const max = Number.isFinite(spec.max) ? spec.max : 1000
      return Math.round((min + random.next() * (max - min)) * 100) / 100
    }
    case 'boolean': return random.next() < 0.5 ? 0 : 1
    case 'date': return date(random, spec.from, spec.to)
    case 'datetime': return date(random, spec.from, spec.to, true)
    case 'password_hash': return `$2b$12$${Array.from({ length: 53 }, () => random.pick('./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')).join('')}`
    case 'enum': return random.pick(spec.values?.length ? spec.values : ['A', 'B', 'C'])
    case 'fk': {
      const options = context.foreignValues?.[spec.column] ?? []
      if (!options.length) return null
      return random.pick(options)
    }
    default: return null
  }
}

// UNIQUE text columns get the row number appended so repeats are impossible.
function uniqueText(value, index) {
  if (typeof value !== 'string') return value
  if (value.includes('@') || /_\d+$/.test(value)) return value
  return `${value} ${index + 1}`
}

// `columns` is a list of { name, spec } (see infer.js). Columns whose kind is "skip" are
// left out of the INSERT so SQLite applies defaults and AUTOINCREMENT.
export function generateRows(columns, count, { seed = 1, foreignValues = {}, offset = 0 } = {}) {
  const random = createRandom(seed)
  const used = columns.filter((column) => column.spec.kind !== 'skip')
  const rows = []
  for (let i = 0; i < count; i += 1) {
    const index = offset + i
    rows.push(used.map((column) => {
      const value = generateValue(column.spec, random, index, { foreignValues })
      return column.spec.unique ? uniqueText(value, index) : value
    }))
  }
  return { columns: used.map((column) => column.name), rows }
}
