// What the AI assistant may do in a project, and what it is allowed to see. These run in the
// browser (the code lives here); the server only defines them for the model. No React, so
// they can be tested in Node. Never lets a private file (.env) or its values out.
import { ENV_FILE, MAX_BACKEND_BYTES, extensionOf, languageForFile, normalizeBackendPath, projectSize, validateBackendPath } from './backendFiles.js'
import { envFromFiles } from './dotenv.js'
import { isJavaFile, validateJavaClassName } from './javaProject.js'

export const READ_LIMIT = 16000
export const OUTPUT_LIMIT = 8000
export const CONTEXT_LIMIT = 12000

const HIDDEN = '[hidden]'
// Shorter values are too likely to match ordinary text ("1", "dev") and garble results.
const MIN_SECRET_LENGTH = 4

const isEnvFile = (name) => {
  const base = String(name).split('/').at(-1).toLowerCase()
  return base === ENV_FILE || base.startsWith(`${ENV_FILE}.`)
}
const KEY_FILE = /(\.(pem|key|p12|pfx)|^id_(rsa|ed25519|ecdsa|dsa))$/i

// Files the assistant never sees or changes, wherever they are in the project: a repo can
// bring a nested .env or .env.local, not only the root .env the runtime uses.
export const isSecretFile = (name) => isEnvFile(name) || KEY_FILE.test(String(name).split('/').at(-1))

// Replaces secret values wherever they appear, as code can print them: what is in the
// project's secret files, and `extra`, such as the login token the runtime holds.
export function scrubSecrets(text, files = [], extra = []) {
  let clean = String(text ?? '')
  const inFiles = files.filter((file) => isSecretFile(file.name)).flatMap((file) => (isEnvFile(file.name)
    ? Object.values(envFromFiles([{ name: ENV_FILE, content: file.content }]).values ?? {})
    : [String(file.content ?? '').trim()]))
  const values = [...inFiles, ...extra]
    .map(String)
    .filter((value) => value.length >= MIN_SECRET_LENGTH)
    .sort((a, b) => b.length - a.length)
  for (const value of values) clean = clean.split(value).join(HIDDEN)
  return clean
}

const cut = (text, limit, note) => (text.length > limit ? `${text.slice(0, limit)}\n${note}` : text)

// The project facts sent with each call. File names only, plus the open file and last error.
export function buildContext({ files = [], selectedFile, lastError, language = 'backend', secrets = [] }) {
  const context = { language, files: files.map((file) => file.name).filter((name) => !isSecretFile(name)).slice(0, 200) }
  const open = files.find((file) => file.name === selectedFile)
  if (open && !isSecretFile(open.name)) {
    context.open_file = { name: open.name, content: scrubSecrets(open.content, files, secrets).slice(0, CONTEXT_LIMIT) }
  }
  if (lastError) context.last_error = scrubSecrets(lastError, files, secrets).slice(0, CONTEXT_LIMIT)
  return context
}

// The text of a failed run: what went wrong, or '' when the last run was fine.
export function errorsOf(result) {
  if (!result || result.status === 'success') return ''
  return [result.error, result.compile?.stderr, result.stderr, result.notice].filter(Boolean).filter((part, index, all) => all.indexOf(part) === index).join('\n')
}

const OUT_OF_INPUT = 'The program asked for input and none was left, so the code is not at fault. Do not change it for this. Tell the user to type the input in the Standard input box on the Output tab, then run again.'

// A run that failed only because stdin ran out, marked so the agent doesn't try to fix the code.
export function noteMissingInput(result) {
  if (!result || result.status === 'success' || !/\bEOFError\b|\bNoSuchElementException\b/.test(result.stderr ?? '')) return result
  return { ...result, notice: [result.notice, OUT_OF_INPUT].filter(Boolean).join('\n') }
}

const refused = (message) => ({ content: message, isError: true })
const done = (content, extra = {}) => ({ content, isError: false, ...extra })
const PRIVATE_REFUSAL = 'That file is private and cannot be read or changed by the assistant. Ask the user to add any variable or key themselves, by name.'

function fileInProject(files, path) {
  return files.find((file) => file.name === path)
}

export const fileLanguage = (path) => (isJavaFile({ name: path }) ? 'java' : languageForFile(path))

const SAFE_PATH = /^[A-Za-z0-9_][A-Za-z0-9_.-]*(\/[A-Za-z0-9_][A-Za-z0-9_.-]*)*$/
const WEB_EXTENSIONS = new Set(['html', 'css', 'js'])
// Runners that only ever use one file, so a second one would silently do nothing.
const SINGLE_FILE_LANGUAGES = new Set(['python'])

function generalPathProblem(path, files) {
  if (path.length > 120 || !SAFE_PATH.test(path) || /\.(\/|$)/.test(path)) return 'Use letters, numbers, _ and - in each folder and file name.'
  return files.some((file) => file.name.toLowerCase() === path.toLowerCase()) ? `${path} already exists.` : ''
}

// Where each language's runner can use a new file. A language not listed here, such as one
// newly added to codingLanguages.js, gets the general rule.
const PATH_RULES = {
  backend: (path, files) => validateBackendPath(path, files),
  java: (path, files) => (!isJavaFile({ name: path }) || path.includes('/')
    ? 'Java projects keep each class in the top folder, in a file named like Dog.java.'
    : validateJavaClassName(path, files)),
  python: () => 'Python programs here run from one file. Put this code in the existing file instead.',
  web: (path, files) => (WEB_EXTENSIONS.has(extensionOf(path)) ? generalPathProblem(path, files) : 'Web projects use .html, .css and .js files.'),
}
const pathProblem = (language, path, files) => (PATH_RULES[language] ?? generalPathProblem)(path, files)

// Each tool's plan: either a refusal, or the new file list and a description to show the
// user for approval. Nothing changes until the caller applies it.
export function planFileChange(name, args, files, language = 'backend') {
  const path = normalizeBackendPath(args?.path)
  if (!path) return refused('A file path is required.')
  if (isSecretFile(path)) return refused(PRIVATE_REFUSAL)
  const existing = fileInProject(files, path)

  if (name === 'edit_file') {
    if (!existing) return refused(`${path} does not exist. Use list_files to see the project's files.`)
    const oldText = String(args?.old_text ?? '')
    if (!oldText) return refused('old_text is required: the exact text to replace.')
    const matches = existing.content.split(oldText).length - 1
    if (matches === 0) return refused(`old_text was not found in ${path}. The file may have changed: read it again.`)
    if (matches > 1) return refused(`old_text matches ${matches} places in ${path}. Include more surrounding lines so it matches once.`)
    const content = existing.content.replace(oldText, () => String(args?.new_text ?? ''))
    return replaceFile(files, path, existing.content, content)
  }

  if (name === 'create_file') {
    if (existing) return refused(`${path} already exists. Use edit_file to change it.`)
    const problem = pathProblem(language, path, files)
    if (problem) return refused(problem)
    return addFile(files, path, String(args?.content ?? ''))
  }

  if (name === 'delete_file') {
    if (!existing) return refused(`${path} does not exist.`)
    if (files.filter((file) => !isSecretFile(file.name)).length <= 1) return refused(`${path} is the only file in this project, so it cannot be deleted.`)
    return {
      path,
      kind: 'delete',
      before: existing.content,
      after: '',
      files: files.filter((file) => file.name !== path),
    }
  }
  return refused(`Unknown file action: ${name}`)
}

function checkSize(files) {
  return projectSize(files) > MAX_BACKEND_BYTES ? refused('That would make the project larger than its size limit.') : null
}

// Replaces one file's whole text (edit_file, and Apply on a code block).
export function replaceFile(files, path, before, after) {
  const next = files.map((file) => (file.name === path ? { ...file, content: after } : file))
  return checkSize(next) ?? { path, kind: 'edit', before, after, files: next }
}

function addFile(files, path, content) {
  const next = [...files, { name: path, language: fileLanguage(path), content }]
  return checkSize(next) ?? { path, kind: 'create', before: '', after: content, files: next }
}

// Apply on a code block in Ask mode: replaces the file's text, or creates the file.
export function planApply(rawPath, code, files, language = 'backend') {
  // A single-file language has only one place the code can go, whatever the block is called.
  const only = SINGLE_FILE_LANGUAGES.has(language) ? files.find((file) => !isSecretFile(file.name))?.name : null
  const path = only ?? normalizeBackendPath(rawPath)
  if (!path) return refused('No file chosen for this code.')
  if (isSecretFile(path)) return refused(PRIVATE_REFUSAL)
  const existing = fileInProject(files, path)
  if (existing) return replaceFile(files, path, existing.content, code)
  const problem = pathProblem(language, path, files)
  return problem ? refused(problem) : addFile(files, path, code)
}

// Apply replaces a whole file, so a preview is only good while that file is as it was shown.
// Other files may have changed: the result is built from `files`, the latest ones.
export function rebaseApply(plan, files) {
  const existing = fileInProject(files, plan.path)
  const unchanged = plan.kind === 'create' ? !existing : existing?.content === plan.before
  if (!unchanged) return refused(`${plan.path} changed after this preview. Press Apply again to see the new change.`)
  return plan.kind === 'create' ? addFile(files, plan.path, plan.after) : replaceFile(files, plan.path, plan.before, plan.after)
}

// What one task changed, per file: its text before the task (null: the task created it) and
// after (null: the task deleted it). Each file's first change keeps the original text.
export function recordChange(log, plan) {
  // Own properties only: a path comes from the model, and could be "constructor".
  const before = log && Object.hasOwn(log, plan.path) ? log[plan.path].before : (plan.kind === 'create' ? null : plan.before)
  return { ...log, [plan.path]: { before, after: plan.kind === 'delete' ? null : plan.after } }
}

// Reverses a task's own changes. A file the user changed since is left alone and reported.
export function undoChanges(log, files) {
  const restored = []
  const kept = []
  let next = files
  for (const [path, { before, after }] of Object.entries(log ?? {})) {
    const existing = fileInProject(next, path)
    if ((existing?.content ?? null) !== after) {
      kept.push(path)
    } else {
      restored.push(path)
      if (before === null) next = next.filter((file) => file.name !== path)
      else if (existing) next = next.map((file) => (file.name === path ? { ...file, content: before } : file))
      else next = [...next, { name: path, language: fileLanguage(path), content: before }]
    }
  }
  return { files: next, restored, kept }
}

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const FILE_TOOLS = new Set(['edit_file', 'create_file', 'delete_file'])

// A one-line description of a tool call, for the activity log. `pending`: it hasn't finished.
export function describeToolCall(name, args, { pending = false } = {}) {
  const path = args?.path
  if (pending) {
    switch (name) {
      case 'list_files': return 'Listing the project files…'
      case 'read_file': return `Reading ${path}…`
      case 'edit_file': return `Editing ${path}…`
      case 'create_file': return `Creating ${path}…`
      case 'delete_file': return `Deleting ${path}…`
      case 'run_project': return 'Running the project…'
      case 'get_errors': return 'Checking for errors…'
      case 'send_api_request': return `Sending ${args?.method ?? 'GET'} ${path ?? '/'}…`
      default: return `Using ${name}…`
    }
  }
  switch (name) {
    case 'list_files': return 'Listed the project files'
    case 'read_file': return `Read ${path}`
    case 'edit_file': return `Edited ${path}`
    case 'create_file': return `Created ${path}`
    case 'delete_file': return `Deleted ${path}`
    case 'run_project': return 'Ran the project'
    case 'get_errors': return 'Checked for errors'
    case 'send_api_request': return `Sent ${args?.method ?? 'GET'} ${path ?? '/'}`
    default: return `Used ${name}`
  }
}

// Runs one tool call. `env` is what the panel provides:
//   getFiles()                the latest project files
//   applyFiles(next, plan)    saves the change through the editor's normal handlers
//   approve(request)          resolves true or false; asks the user
//   run()                     runs the project, resolves to the runner's result
//   lastResult()              the runner's latest result
//   request(spec)             calls the API running in the browser
//   apiReady(), debugPaused()
// Resolves to { content, isError }. Never throws: the model gets the failure as a result.
export async function runTool(name, args, env) {
  try {
    const files = env.getFiles()
    const language = env.language ?? 'backend'
    const backend = language === 'backend'
    const safe = (text) => scrubSecrets(text, files, env.secrets?.())

    if (name === 'list_files') {
      const names = files.map((file) => file.name).filter((file) => !isSecretFile(file))
      return done(names.join('\n') || '(no files)')
    }
    if (name === 'read_file') {
      const path = normalizeBackendPath(args?.path)
      if (isSecretFile(path)) return refused(PRIVATE_REFUSAL)
      const file = fileInProject(files, path)
      if (!file) return refused(`${path || 'That file'} does not exist. Use list_files to see the project's files.`)
      return done(cut(safe(file.content), READ_LIMIT, '[The file continues; only the first part is shown.]'))
    }
    if (FILE_TOOLS.has(name)) {
      const plan = planFileChange(name, args, files, language)
      if (plan.isError) return plan
      if (!(await env.approve({ type: 'change', plan }))) return refused('The user declined this change. Ask what they would prefer.')
      // The user may have kept editing while this waited, and those edits must stay.
      const latest = planFileChange(name, args, env.getFiles(), language)
      if (latest.isError) return refused(`The project changed while this waited for approval. ${latest.content}`)
      env.applyFiles(latest.files, latest)
      return done(`${latest.kind === 'delete' ? 'Deleted' : latest.kind === 'create' ? 'Created' : 'Updated'} ${latest.path}.`)
    }
    if (name === 'run_project') {
      if (env.debugPaused()) return refused('A request is paused at a breakpoint, so the project cannot run. Ask the user to resume or stop debugging.')
      if (!(await env.approve({ type: 'run' }))) return refused('The user chose not to run the project.')
      const result = await env.run()
      const output = [result?.stdout, errorsOf(result)].filter(Boolean).join('\n')
      const status = result?.status === 'success'
        ? (backend ? 'The project is running.' : 'The program ran.')
        : (backend ? 'The project failed to start.' : 'The run failed.')
      return { content: cut(safe(`${status}\n${output}`), OUTPUT_LIMIT, '[Output cut short.]'), isError: result?.status !== 'success' }
    }
    if (name === 'get_errors') {
      return done(cut(safe(errorsOf(env.lastResult()) || 'none'), OUTPUT_LIMIT, '[Output cut short.]'))
    }
    if (name === 'send_api_request') {
      if (!backend) return refused('Only FastAPI projects have an API to call. Use run_project to run this code.')
      if (env.debugPaused()) return refused('A request is paused at a breakpoint. Ask the user to resume or stop debugging.')
      if (!env.apiReady()) return refused('The API is not running. Use run_project first.')
      const path = String(args?.path ?? '')
      if (!path.startsWith('/') || path.startsWith('//')) return refused('path must start with / : only the API running in this project can be called.')
      const body = args?.body
      // Anything but a read can change the database or call a paid API through the relay.
      const method = String(args?.method ?? 'GET').toUpperCase()
      if (!READ_METHODS.has(method) && !(await env.approve({ type: 'request', method, path }))) return refused('The user chose not to send this request.')
      const reply = await env.request({
        method,
        path,
        headers: [['content-type', 'application/json']],
        body: body == null ? '' : typeof body === 'string' ? body : JSON.stringify(body),
      })
      const text = `Status ${reply?.status ?? 0}\n${reply?.error ?? ''}${reply?.body ?? ''}`
      return { content: cut(safe(text), OUTPUT_LIMIT, '[Response cut short.]'), isError: !reply?.status }
    }
    return refused(`Unknown tool: ${name}`)
  } catch (error) {
    // Reading the files may be what failed, and the message must still not carry a secret.
    try {
      return refused(`The tool failed: ${scrubSecrets(error?.message ?? 'unknown error', env.getFiles(), env.secrets?.())}`)
    } catch {
      return refused('The tool failed.')
    }
  }
}

// Pulls a target file out of a code block's info string: ```python app/main.py
export function codeBlockTarget(info) {
  const parts = String(info ?? '').trim().split(/\s+/)
  const path = parts.find((part, index) => index > 0 && part.includes('.'))
  return path ? path.replace(/^(title|file|path)=/, '').replace(/^["']|["']$/g, '') : null
}
