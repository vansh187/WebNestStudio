// Records a web page's JavaScript for the Web debugger: every statement first reports where it
// is and the variables in scope, and every function reports when it starts and ends (see
// webDebugRuntime.js for what receives these calls). Calls are only ever inserted into the
// learner's code, never with line breaks, so every line keeps its number and the recording
// lines up with the editor. No React and no browser calls, so it can be tested in Node.
import { parse } from 'acorn'

// Names the recording itself uses; a learner's variable with one of these names is skipped.
const RESERVED = /^__wn/
// The variables offered per step, innermost first, so a step stays small.
const MAX_NAMES = 40
const FUNCTION_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])
const LOOP_TYPES = new Set(['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement'])
// Statements that are not worth a stop of their own.
const SKIPPED_STATEMENTS = new Set(['FunctionDeclaration', 'ClassDeclaration', 'EmptyStatement'])

// The identifiers bound by a declaration pattern: `a`, `{ b, c: d }`, `[e, ...f]`, `g = 1`.
function patternNames(pattern, out = []) {
  if (!pattern) return out
  switch (pattern.type) {
    case 'Identifier': out.push(pattern.name); break
    case 'ObjectPattern': pattern.properties.forEach((property) => patternNames(property.type === 'RestElement' ? property.argument : property.value, out)); break
    case 'ArrayPattern': pattern.elements.forEach((element) => patternNames(element, out)); break
    case 'RestElement': patternNames(pattern.argument, out); break
    case 'AssignmentPattern': patternNames(pattern.left, out); break
    default: break
  }
  return out
}

// `var` names anywhere in a function body, not inside nested functions (they are hoisted).
function hoistedVars(node, out = new Set()) {
  if (!node || typeof node.type !== 'string') return out
  if (node.type === 'VariableDeclaration' && node.kind === 'var') {
    node.declarations.forEach((declaration) => patternNames(declaration.id).forEach((name) => out.add(name)))
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc' || FUNCTION_TYPES.has(value?.type) || value?.type === 'ClassBody') continue
    if (Array.isArray(value)) value.forEach((child) => hoistedVars(child, out))
    else if (value && typeof value.type === 'string') hoistedVars(value, out)
  }
  return out
}

// let, const, class and function declarations made directly in a block's statements.
function blockNames(statements = []) {
  const names = new Set()
  for (const statement of statements) {
    const target = statement.type === 'LabeledStatement' ? statement.body : statement
    if (target.type === 'VariableDeclaration' && target.kind !== 'var') target.declarations.forEach((d) => patternNames(d.id).forEach((name) => names.add(name)))
    if ((target.type === 'FunctionDeclaration' || target.type === 'ClassDeclaration') && target.id) names.add(target.id.name)
  }
  return names
}

const quote = (text) => JSON.stringify(String(text))

class Instrumenter {
  constructor(code, fileIndex, lineOffset) {
    this.code = code
    this.file = fileIndex
    this.lineOffset = lineOffset
    this.edits = []
    this.scopes = []
  }

  line(node) {
    return node.loc.start.line + this.lineOffset
  }

  insert(position, text, order = 0) {
    this.edits.push({ position, text, order })
  }

  // The names a step shows: the current function's own (its parameters and declarations, block
  // by block), as a debugger's frame does. Outer names belong to the frames further out.
  visible() {
    const seen = new Set()
    const names = []
    for (let index = this.scopes.length - 1; index >= 0 && names.length < MAX_NAMES; index -= 1) {
      const scope = this.scopes[index]
      for (const name of scope.names) {
        if (seen.has(name) || RESERVED.test(name)) continue
        seen.add(name)
        names.push(name)
        if (names.length >= MAX_NAMES) break
      }
      if (scope.isFunction) break
    }
    return names
  }

  getters(names) {
    return `[${names.map((name) => `[${quote(name)},()=>${name}]`).join(',')}]`
  }

  stepCall(node) {
    return `__wn.s(${this.file},${this.line(node)},${this.getters(this.visible())});`
  }

  withScope(names, run, isFunction = false) {
    this.scopes.push({ names: new Set(names), isFunction })
    try { run() } finally { this.scopes.pop() }
  }

  // A statement list: a stop before each statement worth stopping at.
  statements(list) {
    this.withScope(blockNames(list), () => {
      for (const statement of list) {
        const directive = statement.type === 'ExpressionStatement' && typeof statement.directive === 'string'
        if (!directive && !SKIPPED_STATEMENTS.has(statement.type)) this.insert(statement.start, this.stepCall(statement), 1)
        this.visit(statement)
      }
    })
  }

  // The body of an if, a loop or a label without braces: wrapped in braces with its stop.
  body(node) {
    if (!node) return
    if (node.type === 'BlockStatement') {
      this.visit(node)
      return
    }
    if (SKIPPED_STATEMENTS.has(node.type)) {
      this.visit(node)
      return
    }
    this.insert(node.start, `{${this.stepCall(node)}`, 1)
    this.insert(node.end, '}', -1)
    this.visit(node)
  }

  functionNode(node, name) {
    const params = node.params.flatMap((param) => patternNames(param))
    const own = new Set([...params, ...(node.body.type === 'BlockStatement' ? hoistedVars(node.body) : [])])
    if (node.type === 'FunctionExpression' && node.id) own.add(node.id.name)
    const label = name || node.id?.name || '(anonymous)'
    this.withScope(own, () => {
      node.params.forEach((param) => this.visit(param))
      const enter = `const __wnF=__wn.e(${quote(label)},${this.file},${this.line(node)},${this.getters(params.filter((p) => !RESERVED.test(p)))});try{`
      const leave = '}catch(__wnE){__wn.t(__wnF,__wnE);throw __wnE}finally{__wn.x(__wnF)}'
      if (node.body.type === 'BlockStatement') {
        // After any 'use strict' at the top, which must stay the body's first statement.
        const directives = node.body.body.filter((statement, index) => statement.type === 'ExpressionStatement' && typeof statement.directive === 'string'
          && node.body.body.slice(0, index).every((before) => typeof before.directive === 'string'))
        this.insert(directives.length ? directives.at(-1).end : node.body.start + 1, enter, 2)
        this.insert(node.body.end - 1, leave, -2)
        this.statements(node.body.body)
      } else {
        // An arrow with an expression body: returned from a block that records the call.
        this.insert(node.body.start, `{${enter}return(`, 2)
        this.insert(node.body.end, `)${leave}}`, -2)
        this.visit(node.body)
      }
    }, true)
  }

  visit(node, name) {
    if (!node || typeof node.type !== 'string') return
    if (FUNCTION_TYPES.has(node.type)) {
      this.functionNode(node, name)
      return
    }
    switch (node.type) {
      case 'Program':
        this.withScope(hoistedVars(node), () => this.statements(node.body))
        return
      case 'BlockStatement':
      case 'StaticBlock':
        this.statements(node.body)
        return
      case 'SwitchStatement':
        this.visit(node.discriminant)
        this.withScope(blockNames(node.cases.flatMap((item) => item.consequent)), () => {
          for (const item of node.cases) {
            this.visit(item.test)
            for (const statement of item.consequent) {
              if (!SKIPPED_STATEMENTS.has(statement.type)) this.insert(statement.start, this.stepCall(statement), 1)
              this.visit(statement)
            }
          }
        })
        return
      case 'IfStatement':
        this.visit(node.test)
        this.body(node.consequent)
        this.body(node.alternate)
        return
      case 'LabeledStatement':
        // The label stays on its loop; the loop's own body gets the stops.
        this.visit(node.body)
        return
      case 'TryStatement':
        this.visit(node.block)
        if (node.handler) this.withScope(patternNames(node.handler.param), () => this.visit(node.handler.body))
        this.visit(node.finalizer)
        return
      case 'VariableDeclarator':
        this.visit(node.id)
        this.visit(node.init, node.id.type === 'Identifier' ? node.id.name : undefined)
        return
      case 'AssignmentExpression':
        this.visit(node.left)
        this.visit(node.right, node.left.type === 'Identifier' ? node.left.name : node.left.type === 'MemberExpression' && !node.left.computed ? node.left.property.name : undefined)
        return
      case 'Property':
      case 'MethodDefinition':
      case 'PropertyDefinition': {
        const key = !node.computed && node.key ? (node.key.name ?? node.key.value) : undefined
        if (node.computed) this.visit(node.key)
        this.visit(node.value, key !== undefined ? String(key) : undefined)
        return
      }
      default:
        break
    }
    if (LOOP_TYPES.has(node.type)) {
      const declared = node.type === 'ForStatement' ? node.init : node.left
      const names = declared?.type === 'VariableDeclaration' && declared.kind !== 'var' ? declared.declarations.flatMap((d) => patternNames(d.id)) : []
      this.withScope(names, () => {
        for (const key of ['init', 'left', 'right', 'test', 'update']) this.visit(node[key])
        this.body(node.body)
      })
      return
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc' || key === 'type') continue
      if (Array.isArray(value)) value.forEach((child) => this.visit(child))
      else if (value && typeof value.type === 'string') this.visit(value)
    }
  }

  result() {
    // Later positions first, so earlier offsets stay right. At one position: closing text
    // (negative order) before opening text, and inner before outer.
    const edits = [...this.edits].sort((a, b) => b.position - a.position || a.order - b.order)
    let out = this.code
    for (const { position, text } of edits) out = out.slice(0, position) + text + out.slice(position)
    return out
  }
}

// Instruments one script. `fileIndex` names the file in the recording (see webDebugRuntime.js);
// `lineOffset` is added to every line (an inline script that starts on line 12 of index.html
// has offset 11). Returns { code } or { error } when the script does not parse.
export function instrumentScript(code, { fileIndex = 0, lineOffset = 0 } = {}) {
  let ast
  try {
    ast = parse(code, { ecmaVersion: 'latest', sourceType: 'script', locations: true, preserveParens: true })
  } catch (error) {
    const line = error?.loc?.line ? error.loc.line + lineOffset : null
    return { error: `${error?.message?.replace(/\s*\(\d+:\d+\)$/, '') ?? 'Syntax error'}${line ? ` (line ${line})` : ''}` }
  }
  const instrumenter = new Instrumenter(code, fileIndex, lineOffset)
  instrumenter.visit(ast)
  return { code: instrumenter.result() }
}

const SCRIPT_TAG = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi
const lineCount = (text) => text.split('\n').length - 1

// The web project with its JavaScript instrumented: script.js, and the inline <script> blocks
// of index.html (not those with a src, nor JSON or module scripts). Returns
// { files, scriptFiles: names in fileIndex order, problems: [{ file, error }] }.
// A file that does not parse is left as it is and listed in `problems`.
export function instrumentWebFiles(files = [], { folder = '' } = {}) {
  const scriptFiles = []
  const problems = []
  const fileIndex = (name) => {
    if (!scriptFiles.includes(name)) scriptFiles.push(name)
    return scriptFiles.indexOf(name)
  }
  const out = files.map((file) => {
    const name = file?.name
    if (name === `${folder}script.js`) {
      const done = instrumentScript(file.content ?? '', { fileIndex: fileIndex(name) })
      if (done.error) {
        problems.push({ file: name, error: done.error })
        return file
      }
      return { ...file, content: done.code }
    }
    if (name === `${folder}index.html`) {
      const html = file.content ?? ''
      let changed = ''
      let last = 0
      for (const match of html.matchAll(SCRIPT_TAG)) {
        const [whole, attributes, body] = match
        const runnable = !/\bsrc\s*=/i.test(attributes) && !/\btype\s*=\s*["']?(?:module|application\/json|application\/ld\+json|text\/template)/i.test(attributes)
        if (!runnable || !body.trim()) continue
        const bodyStart = match.index + whole.indexOf('>') + 1
        const done = instrumentScript(body, { fileIndex: fileIndex(name), lineOffset: lineCount(html.slice(0, bodyStart)) })
        if (done.error) {
          problems.push({ file: name, error: done.error })
          continue
        }
        changed += html.slice(last, bodyStart) + done.code
        last = bodyStart + body.length
      }
      if (!last) return file
      return { ...file, content: changed + html.slice(last) }
    }
    return file
  })
  return { files: out, scriptFiles, problems }
}
