import { languageForSpringFile } from '../lib/codelab/springProject.js'

// Sample projects for the Spring Boot workspace, simplest first. Each one is a real folder of
// files under ./springStarters/<id>/, bundled as text, and is checked against the Cloud Run
// runner before it ships.
const RAW_FILES = import.meta.glob('./springStarters/**/*', { query: '?raw', import: 'default', eager: true })

export const SPRING_STARTER_INFO = [
  {
    id: 'hello',
    label: 'Hello API (one controller)',
    description: 'The smallest Spring Boot API: GET and POST routes, path and query parameters, and a validated JSON body. No database.',
  },
  {
    id: 'tasks',
    label: 'Task manager (CRUD + database)',
    description: 'Controller, service and repository layers over an H2 table with Spring Data JPA: create, read, update and delete, with 400, 404 and 409 errors as JSON.',
  },
  {
    id: 'library',
    label: 'Library (related tables)',
    description: 'Authors and books linked with @ManyToOne: search, books by author, and response objects that keep the JSON simple.',
  },
]

export const DEFAULT_SPRING_STARTER = 'tasks'

// The main class first, then the Java files by path, then the resources.
function rank(name) {
  if (name.endsWith('/DemoApplication.java')) return `0${name}`
  if (name.endsWith('.java')) return `1${name}`
  return `2${name}`
}

export function springStarterFiles(id = DEFAULT_SPRING_STARTER) {
  const known = SPRING_STARTER_INFO.some((item) => item.id === id) ? id : DEFAULT_SPRING_STARTER
  const prefix = `./springStarters/${known}/`
  return Object.entries(RAW_FILES)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, content]) => {
      const name = path.slice(prefix.length)
      return { name, language: languageForSpringFile(name), content }
    })
    .sort((a, b) => rank(a.name).localeCompare(rank(b.name)))
}
