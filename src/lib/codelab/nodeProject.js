// The Node.js workspaces' rules: which files a project may have, new-file templates, the
// endpoints an Express app's API tester lists, and how runner answers are shown. The runner
// (D:\Playground\java-playground, src/node.js) applies the same file rules.
// No React and no browser calls, so it can be tested in Node.

export const NODE_MAX_FILES = 40
export const NODE_MAX_BYTES = 256 * 1024
export const NODE_SCRIPT_ENTRY = 'main.js'
export const EXPRESS_ENTRY = 'server.js'

const SEGMENT = /^[A-Za-z0-9_][\w.-]*$/
const EXTENSIONS = new Set(['js', 'mjs', 'cjs', 'json', 'html', 'css', 'txt', 'md', 'csv', 'sql'])
const ENTRY_EXTENSIONS = new Set(['js', 'mjs', 'cjs'])
const extensionOf = (name) => (name.includes('.') ? name.split('.').at(-1).toLowerCase() : '')

const utf8Length = (text) => new TextEncoder().encode(String(text ?? '')).length
export const nodeProjectSize = (files = []) => files.reduce((sum, file) => sum + utf8Length(file.content), 0)

export const normalizeNodePath = (name) => String(name ?? '').trim().replace(/\\/g, '/').replace(/^\/+/, '')

// A relative path of at most six folders, without "..", hidden folders or node_modules.
export function isNodePath(name) {
  if (typeof name !== 'string' || !name || name.length > 200) return false
  const parts = name.split('/')
  if (parts.length > 7) return false
  const file = parts.at(-1)
  if (parts.slice(0, -1).some((part) => !SEGMENT.test(part) || part.toLowerCase() === 'node_modules')) return false
  if (file === '.env') return true
  return SEGMENT.test(file) && file.toLowerCase() !== 'node_modules' && EXTENSIONS.has(extensionOf(file))
}

export const isNodeEntry = (name) => isNodePath(name) && ENTRY_EXTENSIONS.has(extensionOf(name))

export function languageForNodeFile(name) {
  const extension = extensionOf(String(name ?? ''))
  if (['js', 'mjs', 'cjs'].includes(extension)) return 'javascript'
  if (extension === 'json') return 'json'
  if (extension === 'html') return 'html'
  if (extension === 'css') return 'css'
  if (extension === 'md') return 'markdown'
  if (extension === 'sql') return 'sql'
  if (name === '.env') return 'ini'
  return 'plaintext'
}

// '' when `name` may be added (or `current` renamed to it), otherwise why not.
export function validateNodePath(rawName, files = [], current = null) {
  const name = normalizeNodePath(rawName)
  if (!name) return 'Enter a file name, for example routes/tasks.js.'
  if (!isNodePath(name)) {
    if (name.split('/').some((part) => part.toLowerCase() === 'node_modules')) return 'node_modules is provided by the runner, so files cannot go there.'
    return 'Use .js, .mjs, .cjs, .json, .html, .css, .txt, .md, .csv or .sql files, with letters, numbers, _, - and . in each name.'
  }
  const others = files.filter((file) => file.name !== current)
  if (others.some((file) => file.name.toLowerCase() === name.toLowerCase())) return `${name} already exists.`
  if (!files.some((file) => file.name === current) && others.length >= NODE_MAX_FILES) return `A project can have at most ${NODE_MAX_FILES} files.`
  return ''
}

// A starting point for a new file.
export function nodeFileTemplate(name) {
  const file = String(name ?? '')
  if (/^routes\/.+\.js$/.test(file)) {
    return "const express = require('express');\n\nconst router = express.Router();\n\nrouter.get('/', (req, res) => {\n  res.json([]);\n});\n\nmodule.exports = router;\n"
  }
  if (file.endsWith('.mjs')) return 'export function hello(name) {\n  return `Hello, ${name}!`;\n}\n'
  if (/\.(?:c)?js$/.test(file)) return 'function hello(name) {\n  return `Hello, ${name}!`;\n}\n\nmodule.exports = { hello };\n'
  if (file.endsWith('.json')) return '{\n}\n'
  return ''
}

// The files the runner takes: everything with an allowed path, except the private .env.
export const isNodeRunnable = (name) => isNodePath(name) && name !== '.env'

export const toNodeFiles = (files = []) => files
  .filter((file) => isNodeRunnable(file?.name))
  .map((file) => ({ path: file.name, content: file.content ?? '' }))

// The file an Express project starts from: package.json's "main" when it names one of the
// files, else server.js, app.js or index.js.
export function findExpressEntry(files = []) {
  const names = new Set(files.map((file) => file.name))
  try {
    const main = JSON.parse(files.find((file) => file.name === 'package.json')?.content ?? '{}')?.main
    const normalized = typeof main === 'string' ? normalizeNodePath(main.replace(/^\.\//, '')) : ''
    if (normalized && isNodeEntry(normalized) && names.has(normalized)) return normalized
  } catch {
    // A package.json that is not valid JSON is reported by Node itself.
  }
  return [EXPRESS_ENTRY, 'app.js', 'index.js', 'src/server.js', 'src/app.js', 'src/index.js'].find((name) => names.has(name))
    // Renamed or deleted server.js: the first script at the top, then any script, so the run
    // still starts and its own errors say what is wrong.
    ?? files.map((file) => file.name).filter((name) => isNodeEntry(name)).sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b))[0]
    ?? EXPRESS_ENTRY
}

// Comments, strings and regular expressions are left in, but comments are blanked so routes
// in them are not listed. Same length as the code.
export function maskJsComments(code) {
  const text = String(code ?? '')
  let out = ''
  let i = 0
  while (i < text.length) {
    const two = text.slice(i, i + 2)
    if (two === '//') {
      const end = text.indexOf('\n', i)
      const stop = end === -1 ? text.length : end
      out += ' '.repeat(stop - i)
      i = stop
    } else if (two === '/*') {
      const end = text.indexOf('*/', i + 2)
      const stop = end === -1 ? text.length : end + 2
      out += text.slice(i, stop).replace(/[^\n]/g, ' ')
      i = stop
    } else if (text[i] === '"' || text[i] === '\'' || text[i] === '`') {
      const quote = text[i]
      let j = i + 1
      while (j < text.length && text[j] !== quote && (quote === '`' || text[j] !== '\n')) j += text[j] === '\\' ? 2 : 1
      const stop = Math.min(j + 1, text.length)
      out += text.slice(i, stop)
      i = stop
    } else {
      out += text[i]
      i += 1
    }
  }
  return out
}

const joinPaths = (base, sub) => `/${[base, sub].map((part) => String(part).replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/')}`
const resolveModule = (from, specifier, names) => {
  if (!/^\.\.?\//.test(specifier)) return null
  const parts = from.split('/').slice(0, -1)
  for (const part of specifier.split('/')) {
    if (part === '..') parts.pop()
    else if (part !== '.') parts.push(part)
  }
  const base = parts.join('/')
  return [base, `${base}.js`, `${base}.cjs`, `${base}.mjs`, `${base}/index.js`].find((name) => names.has(name)) ?? null
}
// Express route parameters (:id) as OpenAPI path parameters ({id}).
const toOpenApiPath = (path) => path.replace(/:([A-Za-z_]\w*)\??/g, '{$1}')
const METHOD_RE = /\b([A-Za-z_$][\w$]*)\s*\.\s*(get|post|put|patch|delete)\s*\(\s*(['"`])([^'"`\n]*)\3/g
const ROUTE_RE = /\b([A-Za-z_$][\w$]*)\s*\.\s*route\s*\(\s*(['"`])([^'"`\n]*)\2\s*\)((?:\s*\.\s*(?:get|post|put|patch|delete|all)\s*\([^]*?\))+)/g

// An OpenAPI-like document read from the app's routes, in the shape ApiClientPanel lists:
// app.get('/x'), router.post('/y'), app.route('/z').get().put(), and routers mounted with
// app.use('/prefix', router) from their own file. A best guess from the code, not a run.
export function expressOpenApi(files = []) {
  const scripts = files.filter((file) => /\.(?:c|m)?js$/.test(file.name))
  const names = new Set(scripts.map((file) => file.name))
  const prefixes = new Map() // file -> [prefix]
  const masked = new Map(scripts.map((file) => [file.name, maskJsComments(file.content)]))
  for (const file of scripts) {
    const code = masked.get(file.name)
    const imports = new Map()
    for (const match of code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*require\(\s*(['"`])([^'"`]+)\2\s*\)/g)) imports.set(match[1], match[3])
    for (const match of code.matchAll(/\bimport\s+([A-Za-z_$][\w$]*)\s+from\s+(['"`])([^'"`]+)\2/g)) imports.set(match[1], match[3])
    for (const match of code.matchAll(/\.\s*use\s*\(\s*(['"`])([^'"`]+)\1\s*,\s*(?:require\(\s*(['"`])([^'"`]+)\3\s*\)|([A-Za-z_$][\w$]*))/g)) {
      const specifier = match[4] ?? imports.get(match[5])
      const target = specifier ? resolveModule(file.name, specifier, names) : null
      if (target) prefixes.set(target, [...(prefixes.get(target) ?? []), match[2]])
    }
  }
  const paths = {}
  const add = (file, owner, method, route) => {
    // Routes on `app` (or anything not mounted) are at the top; a mounted file's routers get its prefix.
    const bases = owner !== 'app' && prefixes.has(file) ? prefixes.get(file) : ['']
    for (const base of bases) {
      const path = toOpenApiPath(joinPaths(base, route))
      const parameters = [...path.matchAll(/\{(\w+)\}/g)].map((match) => ({ name: match[1], in: 'path', required: true, schema: { type: 'string' } }))
      paths[path] ??= {}
      paths[path][method] = {
        tags: [file.replace(/\.(?:c|m)?js$/, '')],
        summary: `${method.toUpperCase()} ${path} (${file})`,
        parameters,
        ...(['post', 'put', 'patch'].includes(method) ? { requestBody: { content: { 'application/json': { schema: { type: 'object' } } } } } : {}),
      }
    }
  }
  for (const file of scripts) {
    const code = masked.get(file.name)
    for (const match of code.matchAll(METHOD_RE)) {
      // `app.get('env')` reads a setting, not a route.
      if (match[2] === 'get' && !match[4].startsWith('/')) continue
      add(file.name, match[1], match[2], match[4])
    }
    for (const match of code.matchAll(ROUTE_RE)) {
      for (const method of match[4].matchAll(/\.\s*(get|post|put|patch|delete)\s*\(/g)) add(file.name, match[1], method[1], match[3])
    }
  }
  return { openapi: '3.0.0', paths }
}

const MISSING_NOTE = (missing) => `${missing.length === 1 ? `The package ${missing[0]} is` : `The packages ${missing.join(', ')} are`} not installed on WebNest's runner, and npm install is not available here. See Help for the packages you can use.`

const RUN_MESSAGES = {
  startup_error: 'The app stopped before it listened for requests. See Output for its log.',
  runtime_error: 'The app stopped while handling the requests. See Output for its log.',
  timeout: 'The app took too long. See Output for its log.',
  output_limit: 'The app printed too much, so it was stopped. See Output.',
  package_error: 'A package the project needs is not installed. See Output.',
  cancelled: 'Stopped.',
}

// What went wrong with a whole run, for a request that got no answer of its own.
export const expressRunProblem = (status) => RUN_MESSAGES[status] ?? 'The run did not finish. See Output.'

// An Express runner result as the Output panel shows it (OutputPanel's result shape).
export function toExpressOutputResult(data) {
  const app = data?.app ?? {}
  const missing = Array.isArray(data?.missing) ? data.missing.map(String) : []
  const failedStart = data?.status === 'startup_error' || data?.status === 'package_error'
  const notices = []
  if (missing.length) notices.push(MISSING_NOTE(missing))
  else if (data?.status === 'startup_error') notices.push('The app did not start listening. Its log above says why: it needs to call app.listen().')
  if (data?.status === 'success' && data?.startup?.ms) notices.push(`Started in ${(data.startup.ms / 1000).toFixed(1)} s.`)
  return {
    status: failedStart ? 'runtime_error' : data?.status ?? 'internal_error',
    stdout: app.stdout ?? '',
    stderr: app.stderr ?? (data?.status === 'package_error' ? MISSING_NOTE(missing) : ''),
    compile: null,
    runtime_ms: data?.durationMs,
    request_id: data?.requestId,
    ...(notices.length ? { notice: notices.join(' ') } : {}),
  }
}

// A Node script's runner result as the Output panel shows it.
export function toNodeScriptResult(raw) {
  if (!raw || typeof raw.status !== 'string') throw new Error('The Node.js runner returned an invalid response.')
  const missing = Array.isArray(raw.missing) ? raw.missing.map(String) : []
  const run = raw.run ?? {}
  const notices = []
  if (missing.length) notices.push(MISSING_NOTE(missing))
  if (raw.status === 'timeout') notices.push('The program ran past the 10 second limit and was stopped.')
  if (raw.status === 'output_limit') notices.push('The program stopped after reaching the output limit.')
  return {
    status: raw.status === 'cancelled' ? 'stopped' : raw.status === 'package_error' ? 'runtime_error' : raw.status,
    stdout: run.stdout ?? '',
    stderr: run.stderr ?? (raw.status === 'package_error' ? MISSING_NOTE(missing) : ''),
    compile: null,
    exit_code: run.exitCode ?? null,
    signal: run.signal ?? null,
    runtime_ms: raw.durationMs ?? 0,
    truncated: Boolean(run.outputLimitExceeded),
    request_id: raw.requestId,
    notice: notices.join(' '),
  }
}
