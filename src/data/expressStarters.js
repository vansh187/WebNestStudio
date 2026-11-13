import { languageForNodeFile } from '../lib/codelab/nodeProject.js'

// Sample projects for the Express workspace, simplest first. Each one is a real folder of
// files under ./expressStarters/<id>/, bundled as text, and is checked against the runner.
const RAW_FILES = import.meta.glob('./expressStarters/**/*', { query: '?raw', import: 'default', eager: true })

export const EXPRESS_STARTER_INFO = [
  {
    id: 'hello',
    label: 'Hello API (one file)',
    description: 'The smallest Express API: GET and POST routes, query and path parameters, and a checked JSON body.',
  },
  {
    id: 'tasks',
    label: 'Task manager (routes + validation)',
    description: 'A router in its own file, CRUD routes with zod validation, and 400, 404 and 409 errors as JSON.',
  },
  {
    id: 'notes',
    label: 'Notes (SQL database)',
    description: 'A notes API over node:sqlite, the SQL database built into Node.js, with its tables in schema.sql.',
  },
]

export const DEFAULT_EXPRESS_STARTER = 'tasks'

// server.js first, then the other code by path, then the rest.
function rank(name) {
  if (name === 'server.js') return `0${name}`
  if (/\.(?:c|m)?js$/.test(name)) return `1${name}`
  return `2${name}`
}

export function expressStarterFiles(id = DEFAULT_EXPRESS_STARTER) {
  const known = EXPRESS_STARTER_INFO.some((item) => item.id === id) ? id : DEFAULT_EXPRESS_STARTER
  const prefix = `./expressStarters/${known}/`
  return Object.entries(RAW_FILES)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, content]) => {
      const name = path.slice(prefix.length)
      return { name, language: languageForNodeFile(name), content }
    })
    .sort((a, b) => rank(a.name).localeCompare(rank(b.name)))
}
