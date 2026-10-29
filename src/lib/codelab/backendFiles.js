// File rules for the Python backend workspace: folders in file names, which layer a file
// belongs to, and gentle hints when code sits in the wrong layer.
export const MAX_BACKEND_FILES = 40
export const MAX_BACKEND_BYTES = 200 * 1024

const EXTENSION_LANGUAGE = {
  py: 'python',
  sql: 'sql',
  html: 'html',
  css: 'css',
  js: 'javascript',
  json: 'json',
  md: 'markdown',
  txt: 'plaintext', // requirements.txt
}

// Folders under app/ that map to a layer of the architecture diagram.
export const LAYERS = [
  { id: 'api', label: 'API routes', folder: 'app/api/', role: 'HTTP: paths, status codes, request and response models, auth checks' },
  { id: 'services', label: 'Services', folder: 'app/services/', role: 'Business rules: validation, decisions, combining repositories' },
  { id: 'repositories', label: 'Repositories', folder: 'app/repositories/', role: 'Database access: SQL queries only' },
]

// The lower-case extension of a file name ('py' for app/Main.PY), or '' when it has none.
// The one parser for CodeLab and GitHub sync (lib/github/sync.js).
export const extensionOf = (name) => /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase() ?? ''

export function languageForFile(name) {
  return EXTENSION_LANGUAGE[extensionOf(name)] ?? 'plaintext'
}

export function layerOfFile(name) {
  const layer = LAYERS.find((item) => name.startsWith(item.folder))
  if (layer) return layer.id
  if (name === 'app/database.py') return 'database'
  if (name === 'schema.sql') return 'schema'
  if (name.startsWith('frontend/')) return 'client'
  if (name.startsWith('app/')) return 'other'
  return null
}

const SEGMENT = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/
const PYTHON_MODULE = /^[A-Za-z_][A-Za-z0-9_]*$/
const WINDOWS_DEVICES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
// How case-insensitive file systems compare names, as the backend's _tree_key does
// (schemas/coding_schemas.py). SEGMENT allows ASCII only, so no Unicode normalizing.
const treeKey = (path) => path.toLowerCase()

// The folders a path sits in: app/api/x.py -> app, app/api.
function folderPrefixes(path) {
  const parts = path.split('/').slice(0, -1)
  return parts.map((_, depth) => parts.slice(0, depth + 1).join('/'))
}

// Every file and folder of a list by comparison key, in one pass. Built per call: a list
// holds at most MAX_BACKEND_FILES files, so this is cheap, and a cache keyed on the list
// would go stale when a caller changes it in place.
function treeIndex(files) {
  const names = new Map()
  const folders = new Map()
  for (const file of files) {
    if (!names.has(treeKey(file.name))) names.set(treeKey(file.name), file.name)
    for (const folder of folderPrefixes(file.name)) {
      const spellings = folders.get(treeKey(folder)) ?? new Set()
      spellings.add(folder)
      folders.set(treeKey(folder), spellings)
    }
  }
  return { names, folders }
}

// The project's environment variables (see lib/codelab/dotenv.js). Only the root .env is
// allowed, and it never leaves the browser: GitHub sync, saved projects and share links
// skip it (api/coding.js toCodePayload, lib/codelab/envStore.js).
export const ENV_FILE = '.env'
export const isPrivateFile = (name) => name === ENV_FILE

// Returns an error message, or '' when the path is acceptable.
export function validateBackendPath(rawName, files = [], current = null) {
  const name = normalizeBackendPath(rawName)
  if (!name) return 'Enter a file name, for example app/services/order_service.py.'
  if (name.length > 120) return 'Keep the path under 120 characters.'
  const segments = name.split('/')
  if (name !== ENV_FILE && segments.some((segment) => !segment || segment === '.' || segment === '..' || !SEGMENT.test(segment))) {
    if (segments[segments.length - 1] === ENV_FILE) return 'The .env file goes in the project root: name it .env'
    return 'Use letters, numbers, _ and - in each folder and file name.'
  }
  // The server refuses these too (schemas/coding_schemas.py), so a project stays saveable
  // and can be cloned on Windows.
  if (segments.some((segment) => segment.endsWith('.'))) return 'Folder and file names must not end with a dot.'
  const device = segments.find((segment) => WINDOWS_DEVICES.test(segment.split('.')[0]))
  if (device) return `${device} is a reserved name on Windows; choose another name.`
  const extension = extensionOf(name)
  if (name !== ENV_FILE && !EXTENSION_LANGUAGE[extension]) {
    return 'Use one of these file types: .py, .sql, .html, .css, .js, .json, .md or .txt (or a root .env).'
  }
  if (extension === 'py') {
    if (!name.startsWith('app/')) return 'Python files go inside the app/ folder so they can be imported as app.….'
    const modules = name.slice(0, -'.py'.length).split('/')
    if (modules.some((part) => !PYTHON_MODULE.test(part))) {
      return 'Python file and folder names must be valid module names: letters, numbers and _ (no - or spaces), not starting with a number.'
    }
  }
  // Compared the way Windows and macOS do (case-insensitive), like the server, so two
  // files never overwrite each other when the project is cloned there.
  // `current` (the file being renamed) does not count against itself; renameEntry passes a
  // list that already leaves it out, which this handles the same way.
  const { names, folders } = treeIndex(files.filter((file) => file.name !== current))
  const key = treeKey(name)
  const taken = names.get(key)
  if (taken) return taken === name ? `${name} already exists.` : `${taken} already exists (names differ only in letter case).`
  if (folders.has(key)) return 'A file and a folder cannot share the same name.'
  for (const folder of folderPrefixes(name)) {
    if (names.has(treeKey(folder))) return 'A file and a folder cannot share the same name.'
    const spellings = folders.get(treeKey(folder))
    // Any spelling already in use is fine (older projects may have two); a new one is not.
    if (spellings && !spellings.has(folder)) {
      return `Use the existing folder ${[...spellings][0]}/ (folder names differ only in letter case).`
    }
  }
  if (!current && files.length >= MAX_BACKEND_FILES) return `A project can hold up to ${MAX_BACKEND_FILES} files.`
  return ''
}

export function normalizeBackendPath(name) {
  return String(name ?? '').trim().replace(/\\/g, '/').replace(/^\/+/, '')
}

export function projectSize(files = []) {
  return files.reduce((sum, file) => sum + new TextEncoder().encode(file.content ?? '').length, 0)
}

// Turns flat "a/b/c.py" names into a sorted tree: folders first, then files.
export function buildFileTree(files = []) {
  const root = { name: '', path: '', folders: new Map(), files: [] }
  for (const file of files) {
    const parts = file.name.split('/')
    let node = root
    parts.slice(0, -1).forEach((part, index) => {
      if (!node.folders.has(part)) {
        node.folders.set(part, { name: part, path: parts.slice(0, index + 1).join('/'), folders: new Map(), files: [] })
      }
      node = node.folders.get(part)
    })
    node.files.push(file)
  }
  const toPlain = (node) => ({
    name: node.name,
    path: node.path,
    folders: [...node.folders.values()].sort((a, b) => a.name.localeCompare(b.name)).map(toPlain),
    files: [...node.files].sort((a, b) => a.name.localeCompare(b.name)),
  })
  return toPlain(root)
}

const moduleName = (name) => name.split('/').pop().replace(/\.[^.]+$/, '')

// A short starting point for a new file, written for the layer it is created in.
export function newFileTemplate(name) {
  if (name === ENV_FILE) {
    return `# Environment variables for this project. Run loads them into os.environ:
#   import os
#   key_id = os.environ["RAZORPAY_KEY_ID"]
# This file stays in your browser: Save project, share links and GitHub sync never send it,
# so a saved project keeps it on this device only, until you log out. It is still readable on
# this device, so use test keys only (rzp_test_..., sk_test_...), never live ones.
RAZORPAY_KEY_ID=rzp_test_replace_me
RAZORPAY_KEY_SECRET=replace_me

# Supabase works today through its REST API (requests). Use the anon / publishable key,
# NEVER the service_role key: it skips Row Level Security and anyone on this device can read it.
# SUPABASE_URL=https://your-project-ref.supabase.co
# SUPABASE_ANON_KEY=replace_me

# Databases: connections from the playground are coming soon, through WebNest's database
# proxy. Use a practice database, never production data.
# DATABASE_URL=postgresql://postgres.your-ref:password@aws-0-region.pooler.supabase.com:5432/postgres
# MYSQL_URL=mysql://user:password@your-host:3306/your_db
# MONGODB_URI=mongodb+srv://user:password@cluster0.example.mongodb.net/your_db
`
  }
  const layer = layerOfFile(name)
  const base = moduleName(name)
  const feature = base.replace(/_(routes|service|repository)$/, '')
  if (layer === 'api') {
    return `"""API layer for ${feature}: HTTP only. Remember to include this router in app/main.py:
    from app.api import ${base}
    app.include_router(${base}.router)
"""
from fastapi import APIRouter, Depends

from app.database import get_db

router = APIRouter(prefix="/api/${feature}", tags=["${feature}"])


@router.get("")
def list_${feature}(db=Depends(get_db)):
    return []
`
  }
  if (layer === 'services') {
    return `"""Service layer for ${feature}: business rules. No HTTP and no SQL here."""


class NotFound(Exception):
    pass
`
  }
  if (layer === 'repositories') {
    return `"""Repository layer for ${feature}: SQL only. Pass values with ? placeholders."""


def list_all(db):
    return [dict(row) for row in db.execute("SELECT * FROM ${feature}").fetchall()]
`
  }
  if (name.startsWith('app/schemas/')) {
    return `"""Pydantic models for ${feature} request and response bodies."""
from pydantic import BaseModel
`
  }
  if (name.endsWith('.py')) return `"""${base}"""\n`
  if (name.endsWith('.sql')) return '-- SQL\n'
  return ''
}

// Renaming a folder renames every file inside it.
export function renamePath(files, from, to) {
  return files.map((file) => {
    if (file.name === from) return { ...file, name: to, language: languageForFile(to) }
    if (file.name.startsWith(`${from}/`)) return { ...file, name: `${to}${file.name.slice(from.length)}` }
    return file
  })
}

// Renames a file or folder. Returns { files } or { error }. Every new path is checked
// against the files that are not moving, so renaming onto an existing file or folder is
// rejected instead of creating two files with the same name.
export function renameEntry(files, target, rawName, isFolder) {
  const name = normalizeBackendPath(rawName)
  if (!name) return { error: 'Enter a name.' }
  if (name === target) return { files }
  if (isFolder && name.startsWith(`${target}/`)) return { error: 'A folder cannot be moved inside itself.' }
  const isMoving = (file) => (isFolder ? file.name.startsWith(`${target}/`) : file.name === target)
  const staying = files.filter((file) => !isMoving(file))
  const moved = renamePath(files.filter(isMoving), target, name)
  for (const file of moved) {
    if (staying.some((other) => other.name === file.name)) return { error: `${file.name} already exists.` }
    const message = validateBackendPath(file.name, staying, file.name)
    if (message) return { error: message }
  }
  return { files: renamePath(files, target, name) }
}

const SQL_CALL =/\.(?:execute|executemany|executescript)\s*\(|\bsqlite3\.connect\s*\(/
const HTTP_IN_LOWER_LAYER = /\bHTTPException\b|\bfrom\s+fastapi\s+import\b|\bimport\s+fastapi\b/

// Teaching nudges, not errors: code that works but sits in the wrong layer.
export function layeringHints(files = []) {
  const hints = []
  for (const file of files) {
    const layer = layerOfFile(file.name)
    if (!file.name.endsWith('.py')) continue
    if (layer === 'api' && SQL_CALL.test(file.content)) {
      hints.push({ file: file.name, layer, message: 'This route file runs SQL directly. Move the query into a repository so routes only deal with HTTP.' })
    }
    if ((layer === 'repositories' || layer === 'services') && HTTP_IN_LOWER_LAYER.test(file.content)) {
      hints.push({ file: file.name, layer, message: `This ${layer === 'services' ? 'service' : 'repository'} uses FastAPI. Raise a plain Python exception here and turn it into an HTTP response in the route.` })
    }
    if (layer === 'services' && SQL_CALL.test(file.content)) {
      hints.push({ file: file.name, layer, message: 'This service runs SQL itself. Put queries in a repository so business rules stay separate from storage.' })
    }
  }
  return hints
}

// Hints that only show up while the app runs: SQL issued from a route function.
export function traceHints(trace) {
  if (!trace?.sql?.length) return []
  const fromApi = trace.sql.filter((entry) => entry.layer === 'api')
  if (!fromApi.length) return []
  const call = trace.calls?.[fromApi[0].call]
  return [{
    file: call?.file,
    layer: 'api',
    message: `${call?.fn ?? 'A route'} ran ${fromApi.length} SQL statement${fromApi.length === 1 ? '' : 's'} itself. In a layered design the route calls a service, and only repositories talk to the database.`,
  }]
}
