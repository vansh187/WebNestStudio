import { languageForFile } from '../lib/codelab/backendFiles.js'

// Starter projects for the Python backend workspace. Each one is a real folder of files
// under ./backendStarters/<id>/, bundled as text.
const RAW_FILES = import.meta.glob('./backendStarters/**/*', { query: '?raw', import: 'default', eager: true })

// Files open in this order in the tree: database design first, then the app.
const FILE_ORDER = ['schema.sql', 'app/main.py', 'app/database.py']

export const BACKEND_STARTER_INFO = [
  {
    id: 'tasks',
    label: 'Task manager (CRUD)',
    description: 'A tasks table with create, read, update and delete through routes, services and repositories. Filtering, pagination, 404, 409 and 422 handling.',
  },
  {
    id: 'auth',
    label: 'Users + login',
    description: 'Register and log in with bcrypt password hashing and JWT tokens. Each user sees only their own tasks.',
  },
  {
    id: 'blank',
    label: 'Blank layered project',
    description: 'Empty layers with comments that explain what belongs in each one, plus a health check.',
  },
]

export const DEFAULT_BACKEND_STARTER = 'tasks'

function sortFiles(files) {
  const rank = (name) => {
    const index = FILE_ORDER.indexOf(name)
    if (index !== -1) return `0${index}`
    if (name.startsWith('app/')) return `1${name}`
    return `2${name}`
  }
  return [...files].sort((a, b) => rank(a.name).localeCompare(rank(b.name)))
}

export function backendStarterFiles(id = DEFAULT_BACKEND_STARTER) {
  const prefix = `./backendStarters/${id}/`
  const files = Object.entries(RAW_FILES)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, content]) => {
      const name = path.slice(prefix.length)
      return { name, language: languageForFile(name), content }
    })
  return sortFiles(files)
}
