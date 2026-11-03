// The Spring Boot workspace's rules: which files a project may have, new-file templates, the
// main class, the endpoints the API tester lists, and the requests sent to the runner.
// No React and no browser calls, so it can be tested in Node.

export const SPRING_MAX_FILES = 60
export const SPRING_MAX_BYTES = 256 * 1024
// Earlier writes replayed before each request, so the data a learner added is still there.
export const SPRING_MAX_WRITES = 20
export const SPRING_DEFAULT_MAIN = 'com.example.demo.DemoApplication'

const JAVA_ROOT = 'src/main/java/'
const RESOURCES = ['src/main/resources/application.properties', 'src/main/resources/data.sql', 'src/main/resources/schema.sql']
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/
const JAVA_KEYWORDS = new Set(('abstract assert boolean break byte case catch char class const continue default do double else enum '
  + 'extends final finally float for goto if implements import instanceof int interface long native new package private '
  + 'protected public return short static strictfp super switch synchronized this throw throws transient try void volatile '
  + 'while true false null record var yield sealed permits').split(' '))
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const MAPPINGS = { GetMapping: 'GET', PostMapping: 'POST', PutMapping: 'PUT', PatchMapping: 'PATCH', DeleteMapping: 'DELETE' }

const utf8Length = (text) => new TextEncoder().encode(String(text ?? '')).length
export const springProjectSize = (files = []) => files.reduce((sum, file) => sum + utf8Length(file.content), 0)

// pom.xml is shown for learning; the runner provides the libraries itself, so it is not sent.
export const isSpringRunnable = (name) => isJavaSource(name) || RESOURCES.includes(name)
const isJavaSource = (name) => typeof name === 'string' && name.startsWith(JAVA_ROOT) && name.endsWith('.java')

export function languageForSpringFile(name) {
  if (name.endsWith('.java')) return 'java'
  if (name.endsWith('.sql')) return 'sql'
  if (name.endsWith('.xml')) return 'xml'
  if (name.endsWith('.properties')) return 'ini'
  return 'plaintext'
}

export const normalizeSpringPath = (name) => String(name ?? '').trim().replace(/\\/g, '/').replace(/^\/+/, '')

// '' when `name` may be added (or `current` renamed to it), otherwise why not.
export function validateSpringPath(rawName, files = [], current = null) {
  const name = normalizeSpringPath(rawName)
  if (!name) return 'Enter a file name, for example src/main/java/com/example/demo/task/TaskService.java.'
  if (name === 'pom.xml') {
    return files.some((file) => file.name === name && file.name !== current) ? 'pom.xml already exists.' : ''
  }
  if (!isSpringRunnable(name)) {
    return 'Java files go under src/main/java/ (ending in .java). Resources can be src/main/resources/application.properties, data.sql or schema.sql.'
  }
  if (isJavaSource(name)) {
    const parts = name.slice(JAVA_ROOT.length, -'.java'.length).split('/')
    const bad = parts.find((part) => !IDENTIFIER.test(part) || JAVA_KEYWORDS.has(part))
    if (bad !== undefined) return `"${bad || '(empty)'}" is not a valid Java package or class name. Use letters, numbers and _, not starting with a number.`
    if (parts.length < 2) return 'Put classes in a package folder, for example src/main/java/com/example/demo/Hello.java.'
  }
  const others = files.filter((file) => file.name !== current)
  if (others.some((file) => file.name.toLowerCase() === name.toLowerCase())) return `${name} already exists.`
  if (!files.some((file) => file.name === current) && others.length >= SPRING_MAX_FILES) return `A project can have at most ${SPRING_MAX_FILES} files.`
  return ''
}

// A starting point for a new file: a class in the package its folder names.
export function springFileTemplate(name) {
  if (isJavaSource(name)) {
    const parts = name.slice(JAVA_ROOT.length, -'.java'.length).split('/')
    const className = parts.pop()
    return `package ${parts.join('.')};\n\npublic class ${className} {\n}\n`
  }
  if (name.endsWith('data.sql')) return '-- Rows to add when the app starts, for example:\n-- INSERT INTO tasks (title, done) VALUES (\'Learn Spring\', false);\n'
  if (name.endsWith('schema.sql')) return '-- Tables to create when the app starts (or let Hibernate create them from your entities).\n'
  return ''
}

// Comments and string literals blanked, so annotations and brackets in them are ignored. Same
// length as the code, so a position found here can be read from the code itself.
export function maskJava(code) {
  let out = ''
  let i = 0
  const text = String(code ?? '')
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
    } else if (text.startsWith('"""', i)) {
      const end = text.indexOf('"""', i + 3)
      const stop = end === -1 ? text.length : end + 3
      out += text.slice(i, stop).replace(/[^\n]/g, ' ')
      i = stop
    } else if (text[i] === '"' || text[i] === '\'') {
      const quote = text[i]
      let j = i + 1
      while (j < text.length && text[j] !== quote && text[j] !== '\n') j += text[j] === '\\' ? 2 : 1
      const stop = Math.min(j + 1, text.length)
      out += ' '.repeat(stop - i)
      i = stop
    } else {
      out += text[i]
      i += 1
    }
  }
  return out
}

const packageOf = (code) => /^\s*package\s+([\w.$]+)\s*;/m.exec(maskJava(code))?.[1] ?? ''

// The class with @SpringBootApplication, as a full name, or the default when there is none.
export function findSpringMainClass(files = []) {
  for (const file of files) {
    if (!isJavaSource(file.name) || !/@SpringBootApplication\b/.test(maskJava(file.content))) continue
    const pkg = packageOf(file.content)
    const className = file.name.split('/').pop().replace(/\.java$/, '')
    return pkg ? `${pkg}.${className}` : className
  }
  return SPRING_DEFAULT_MAIN
}

// The string values in an annotation's arguments: ("/a"), (value = "/a"), (path = {"/a", "/b"}).
function annotationPaths(args) {
  if (!args) return ['']
  const named = /\b(?:value|path)\s*=\s*(\{[^}]*\}|"[^"]*")/.exec(args)
  const source = named ? named[1] : /^\s*(\{[^}]*\}|"[^"]*")/.exec(args)?.[1]
  if (!source) return ['']
  const found = [...source.matchAll(/"([^"]*)"/g)].map((match) => match[1])
  return found.length ? found : ['']
}

// The arguments of each annotation, read from the unmasked code at the masked positions.
function annotations(masked, code, name) {
  const results = []
  const re = new RegExp(`@${name}\\b\\s*(\\()?`, 'g')
  let match
  while ((match = re.exec(masked))) {
    let args = ''
    let end = match.index + match[0].length
    if (match[1]) {
      let depth = 1
      let j = end
      while (j < masked.length && depth > 0) {
        if (masked[j] === '(') depth += 1
        else if (masked[j] === ')') depth -= 1
        j += 1
      }
      args = code.slice(end, j - 1)
      end = j
    }
    results.push({ index: match.index, end, args })
  }
  return results
}

const joinPaths = (base, sub) => `/${[base, sub].map((part) => String(part).replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/')}`

const JSON_TYPES = {
  string: { type: 'string' }, char: { type: 'string' }, character: { type: 'string' }, uuid: { type: 'string' },
  localdate: { type: 'string', example: '2026-01-31' }, localdatetime: { type: 'string', example: '2026-01-31T10:00:00' },
  instant: { type: 'string', example: '2026-01-31T10:00:00Z' },
  int: { type: 'integer' }, integer: { type: 'integer' }, long: { type: 'integer' }, short: { type: 'integer' }, byte: { type: 'integer' },
  double: { type: 'number' }, float: { type: 'number' }, bigdecimal: { type: 'number' },
  boolean: { type: 'boolean' },
}

function schemaForType(rawType, types, depth = 0) {
  const type = String(rawType ?? '').replace(/@\w+(\([^)]*\))?\s*/g, '').trim()
  const generic = /^(?:List|Set|Collection)\s*<\s*(.+)\s*>$/.exec(type)
  if (generic) return { type: 'array', items: schemaForType(generic[1], types, depth + 1) }
  if (type.endsWith('[]')) return { type: 'array', items: schemaForType(type.slice(0, -2), types, depth + 1) }
  const simple = JSON_TYPES[type.split('.').pop().toLowerCase()]
  if (simple) return simple
  const fields = types.get(type.split('.').pop())
  if (fields && depth < 3) {
    return { type: 'object', properties: Object.fromEntries(fields.map(({ name, type: fieldType }) => [name, schemaForType(fieldType, types, depth + 1)])) }
  }
  return { type: 'object' }
}

// Records' components and classes' non-static fields, by simple type name.
function collectTypes(files) {
  const types = new Map()
  for (const file of files) {
    if (!isJavaSource(file.name)) continue
    const masked = maskJava(file.content)
    for (const match of masked.matchAll(/\brecord\s+([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(/g)) {
      let depth = 1
      let j = match.index + match[0].length
      const start = j
      while (j < masked.length && depth > 0) {
        if (masked[j] === '(') depth += 1
        else if (masked[j] === ')') depth -= 1
        j += 1
      }
      const params = splitTopLevel(masked.slice(start, j - 1).replace(/@\w+(\s*\([^)]*\))?/g, ' '))
      types.set(match[1], params.map(paramNameAndType).filter(Boolean))
    }
    for (const match of masked.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)[^{]*\{/g)) {
      if (types.has(match[1])) continue
      const body = masked.slice(match.index + match[0].length)
      const fields = []
      for (const field of body.matchAll(/^\s*(?:@\w+(?:\([^)]*\))?\s*)*(?:private|protected|public)\s+(?!static\b)(?:final\s+)?([\w.$<>,\s[\]]+?)\s+([A-Za-z_$][\w$]*)\s*(?:=[^;]*)?;/gm)) {
        fields.push({ type: field[1].trim(), name: field[2] })
      }
      types.set(match[1], fields)
    }
  }
  return types
}

function splitTopLevel(text) {
  const parts = []
  let depth = 0
  let current = ''
  for (const ch of text) {
    if (ch === '<' || ch === '(') depth += 1
    if (ch === '>' || ch === ')') depth -= 1
    if (ch === ',' && depth === 0) {
      parts.push(current)
      current = ''
    } else current += ch
  }
  if (current.trim()) parts.push(current)
  return parts
}

function paramNameAndType(param) {
  const words = param.replace(/\bfinal\b/g, ' ').trim().split(/\s+/)
  if (words.length < 2) return null
  return { name: words.at(-1), type: words.slice(0, -1).join(' ') }
}

// An OpenAPI-like document read from the controllers, in the shape ApiClientPanel lists.
export function springOpenApi(files = []) {
  const types = collectTypes(files)
  const paths = {}
  for (const file of files) {
    if (!isJavaSource(file.name)) continue
    const code = String(file.content ?? '')
    const masked = maskJava(code)
    if (!/@(?:Rest)?Controller\b/.test(masked)) continue
    const classMatch = /\bclass\s+([A-Za-z_$][\w$]*)/.exec(masked)
    if (!classMatch) continue
    const tag = classMatch[1].replace(/Controller$/, '') || classMatch[1]
    const classMappings = annotations(masked.slice(0, classMatch.index), code, 'RequestMapping')
    const bases = classMappings.length ? annotationPaths(classMappings.at(-1).args) : ['']
    for (const [annotation, method] of Object.entries(MAPPINGS)) {
      for (const found of annotations(masked, code, annotation)) {
        if (found.index < classMatch.index) continue
        // The method's parameter list follows the annotation(s), up to the matching ")".
        const signature = /\b[\w.$<>,[\]\s]+?\s+([A-Za-z_$][\w$]*)\s*\(/.exec(masked.slice(found.end))
        if (!signature) continue
        let depth = 1
        let j = found.end + signature.index + signature[0].length
        const start = j
        while (j < masked.length && depth > 0) {
          if (masked[j] === '(') depth += 1
          else if (masked[j] === ')') depth -= 1
          j += 1
        }
        const params = splitTopLevel(code.slice(start, j - 1))
        const parameters = []
        let requestBody
        for (const param of params) {
          const typeAndName = paramNameAndType(param.replace(/@\w+(\s*\((?:[^()]|\([^)]*\))*\))?/g, ' '))
          if (!typeAndName) continue
          const explicitName = /"([^"]+)"/.exec(param)?.[1]
          if (/@PathVariable\b/.test(param)) {
            parameters.push({ name: explicitName ?? typeAndName.name, in: 'path', required: true, schema: schemaForType(typeAndName.type, types) })
          } else if (/@RequestParam\b/.test(param)) {
            const required = !/required\s*=\s*false/.test(param) && !/defaultValue\s*=/.test(param) && !/^\s*Optional</.test(typeAndName.type)
            parameters.push({ name: (/\b(?:name|value)\s*=\s*"([^"]+)"/.exec(param)?.[1] ?? (/@RequestParam\s*\(\s*"([^"]+)"/.exec(param)?.[1])) ?? typeAndName.name, in: 'query', required, schema: schemaForType(typeAndName.type, types) })
          } else if (/@RequestBody\b/.test(param)) {
            requestBody = { content: { 'application/json': { schema: schemaForType(typeAndName.type, types) } } }
          }
        }
        for (const base of bases) {
          for (const sub of annotationPaths(found.args)) {
            const path = joinPaths(base, sub)
            paths[path] ??= {}
            paths[path][method.toLowerCase()] = { tags: [tag], summary: `${classMatch[1]}.${signature[1]}`, parameters, ...(requestBody ? { requestBody } : {}) }
          }
        }
      }
    }
  }
  return { openapi: '3.0.0', paths }
}

// The API tester's request ({ method, path, headers: [[name, value]], body }) as the runner takes it.
export function toRunnerRequest(spec) {
  const method = String(spec?.method ?? 'GET').toUpperCase()
  // Header names are case-insensitive: a hand-typed Content-Type and the one the tester adds
  // must not both be sent, or fetch joins them into one value Spring cannot read. The last wins.
  const byName = new Map()
  for (const [name, value] of spec?.headers ?? []) {
    if (name && typeof value === 'string') byName.set(name.toLowerCase(), [name, value])
  }
  const headers = Object.fromEntries(byName.values())
  const body = method !== 'GET' && typeof spec?.body === 'string' && spec.body !== '' ? spec.body : null
  return { method, path: spec?.path || '/', headers, body }
}

// The write log after a request: a successful POST/PUT/PATCH/DELETE is kept so later runs
// replay it. Returns the same list when nothing changes.
export function nextWrites(writes, request, status) {
  if (!WRITE_METHODS.has(request.method) || status < 200 || status >= 300) return writes
  if (writes.length >= SPRING_MAX_WRITES) return writes
  return [...writes, request]
}

// A runner response ({ status, headers: {}, body, ms, error }) as the API tester shows it.
export function toTesterResponse(response, logs = '') {
  if (!response) return { status: 0, headers: [], body: '', error: 'No response.', logs }
  return {
    status: response.status,
    headers: Object.entries(response.headers ?? {}),
    body: response.body ?? '',
    ms: response.ms,
    logs,
    ...(response.error ? { error: response.error } : {}),
    ...(response.truncated ? { error: 'The response was cut at 32 KB.' } : {}),
  }
}

const RUN_MESSAGES = {
  compile_error: 'Your code did not compile, so the app did not start. See Output for the errors.',
  startup_error: 'The app stopped while starting. See Output for the Spring log.',
  runtime_error: 'The app stopped while handling the requests. See Output for the Spring log.',
  timeout: 'The app took too long. See Output for the Spring log.',
  output_limit: 'The app printed too much, so it was stopped. See Output.',
  cancelled: 'Stopped.',
}

// What went wrong with a whole run, for a request that got no answer of its own.
export const runProblem = (status) => RUN_MESSAGES[status] ?? 'The run did not finish. See Output.'

// A runner result as the Output panel shows it (OutputPanel's result shape).
export function toOutputResult(data) {
  const app = data?.app ?? {}
  const status = data?.status === 'startup_error' ? 'runtime_error' : data?.status ?? 'internal_error'
  return {
    status,
    stdout: app.stdout ?? '',
    stderr: app.stderr ?? '',
    compile: data?.compile ? { stdout: data.compile.stdout ?? '', stderr: data.compile.stderr ?? '', exit_code: data.compile.exitCode } : null,
    runtime_ms: data?.durationMs,
    request_id: data?.requestId,
    ...(data?.status === 'startup_error' ? { notice: 'The app did not start. The Spring log above says why.' } : {}),
    ...(data?.status === 'success' && data?.startup?.ms ? { notice: `Started in ${(data.startup.ms / 1000).toFixed(1)} s.` } : {}),
  }
}
