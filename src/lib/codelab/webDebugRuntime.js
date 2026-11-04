// The Web debugger's recorder, inside the preview page. jsInstrument.js makes the learner's
// code call it: s() before each statement, e() and x() around each function call, t() when a
// call throws. It records steps ({ file, line, depth, frame, fn, at, vars, stack }) and calls,
// and sends them to the editor in batches.
//
// It runs in the preview's iframe, so it is turned into source text with toString() (see
// webDebugScript): it must not use anything from outside its own body.
export function installWebDebugger(target, scriptFiles, post, options = {}) {
  const MAX_STEPS = options.maxSteps ?? 5000
  const MAX_CALLS = options.maxCalls ?? 2000
  const NODE_BUDGET = options.nodeBudget ?? 80
  const MAX_DEPTH = 3
  const MAX_CHILDREN = 50
  const MAX_REPR = 200
  const started = Date.now()
  const stack = []
  let steps = 0
  let calls = 0
  let nextId = 1
  let stopped = false
  let pendingSteps = []
  let pendingCalls = []
  let pendingEnds = []
  let timer = null

  const now = () => Date.now() - started

  const flush = () => {
    timer = null
    if (!pendingSteps.length && !pendingCalls.length && !pendingEnds.length && !stopped) return
    const batch = { steps: pendingSteps, calls: pendingCalls, ends: pendingEnds, truncated: stopped }
    pendingSteps = []
    pendingCalls = []
    pendingEnds = []
    try { post(batch) } catch { /* The editor went away; nothing to do. */ }
  }
  const schedule = () => {
    if (!timer) timer = setTimeout(flush, 60)
  }

  const typeName = (value) => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'Array'
    if (typeof value !== 'object') return typeof value
    try { return value.constructor?.name || 'Object' } catch { return 'Object' }
  }

  const cut = (text) => (text.length > MAX_REPR ? `${text.slice(0, MAX_REPR - 1)}…` : text)

  const isElement = (value) => typeof value === 'object' && value !== null && value.nodeType === 1 && typeof value.tagName === 'string'

  // A short, never-throwing text for a value, like the browser console's.
  const repr = (value, level = 0) => {
    try {
      if (typeof value === 'string') return level ? JSON.stringify(value) : JSON.stringify(value)
      if (typeof value === 'function') return `ƒ ${value.name || 'anonymous'}()`
      if (typeof value === 'symbol') return String(value)
      if (typeof value === 'bigint') return `${value}n`
      if (value === undefined) return 'undefined'
      if (value === null || typeof value !== 'object') return String(value)
      if (isElement(value)) {
        const id = value.id ? `#${value.id}` : ''
        const classes = typeof value.className === 'string' && value.className.trim() ? `.${value.className.trim().split(/\s+/).join('.')}` : ''
        return `<${value.tagName.toLowerCase()}${id}${classes}>`
      }
      if (value instanceof Date) return Number.isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString()
      if (value instanceof Error) return `${value.name}: ${value.message}`
      if (value instanceof RegExp) return String(value)
      if (level >= 2) return Array.isArray(value) ? `Array(${value.length})` : typeName(value)
      if (Array.isArray(value)) {
        const items = value.slice(0, 12).map((item) => repr(item, level + 1))
        return `[${items.join(', ')}${value.length > 12 ? ', …' : ''}]`
      }
      if (value instanceof Map) return `Map(${value.size})`
      if (value instanceof Set) return `Set(${value.size})`
      const keys = Object.keys(value)
      const parts = keys.slice(0, 12).map((key) => `${key}: ${repr(value[key], level + 1)}`)
      const name = typeName(value)
      return `${name === 'Object' ? '' : `${name} `}{${parts.join(', ')}${keys.length > 12 ? ', …' : ''}}`
    } catch {
      return '<unreadable>'
    }
  }

  // One value as { t, r, n, c, more, cut }, as the FastAPI debugger sends them. Own data only:
  // no getters are called, so looking at a value never runs the learner's code.
  const snapshot = (value, depth, budget) => {
    budget[0] -= 1
    const node = { t: typeName(value), r: cut(repr(value)) }
    let entries = null
    try {
      if (typeof value === 'string') node.n = value.length
      if (Array.isArray(value)) {
        node.n = value.length
        entries = value.slice(0, MAX_CHILDREN).map((item, index) => [String(index), false, item])
      } else if (value instanceof Map) {
        node.n = value.size
        entries = [...value.entries()].slice(0, MAX_CHILDREN).map(([key, item]) => [repr(key, 1), false, item])
      } else if (value instanceof Set) {
        node.n = value.size
        entries = [...value.values()].slice(0, MAX_CHILDREN).map((item, index) => [String(index), false, item])
      } else if (value && typeof value === 'object' && !isElement(value) && !(value instanceof Date) && !(value instanceof RegExp)) {
        const keys = Object.keys(value)
        node.n = null
        entries = keys.slice(0, MAX_CHILDREN).map((key) => {
          const descriptor = Object.getOwnPropertyDescriptor(value, key)
          return [key, true, descriptor && 'value' in descriptor ? descriptor.value : undefined]
        })
        if (keys.length > entries.length) node.more = keys.length - entries.length
      }
    } catch {
      entries = null
    }
    if (!entries) return node
    node.c = []
    if (depth >= MAX_DEPTH || budget[0] <= 0) {
      node.cut = true
      return node
    }
    for (const [key, attribute, item] of entries) {
      if (budget[0] <= 0) {
        node.cut = true
        break
      }
      const child = snapshot(item, depth + 1, budget)
      child.k = key
      if (attribute) child.a = 1
      node.c.push(child)
    }
    if (typeof node.n === 'number' && node.n > node.c.length && node.more === undefined) node.more = node.n - node.c.length
    return node
  }

  // The variables a step offers: each read in a try, so one still in its temporal dead zone
  // (a let used before its line) is left out instead of throwing.
  const variables = (getters) => {
    const budget = [NODE_BUDGET]
    const out = []
    for (const [name, read] of getters) {
      let value
      try { value = read() } catch { continue }
      if (typeof value === 'function' && !stack.length) continue // top-level functions are code, not data
      const node = snapshot(value, 0, budget)
      node.k = name
      out.push(node)
    }
    return out
  }

  const file = (index) => scriptFiles[index] ?? 'script.js'

  const api = {
    // Before each statement.
    s(fileIndex, line, getters) {
      if (stopped) return
      if (steps >= MAX_STEPS) {
        stopped = true
        schedule()
        return
      }
      steps += 1
      const top = stack[stack.length - 1]
      if (top) top.line = line
      pendingSteps.push({
        file: file(fileIndex),
        line,
        depth: stack.length,
        frame: top ? top.id : 0,
        fn: top ? top.fn : '(global)',
        at: now(),
        vars: variables(getters),
        stack: stack.map((frame) => ({ id: frame.id, fn: frame.fn, file: frame.file, line: frame.line, first: frame.first })),
      })
      schedule()
    },
    // A function starts: its frame goes on the stack and the call is recorded.
    e(fn, fileIndex, line, getters) {
      const frame = { id: nextId++, fn, file: file(fileIndex), line, first: line, started: now() }
      stack.push(frame)
      if (!stopped && calls < MAX_CALLS) {
        calls += 1
        frame.recorded = true
        pendingCalls.push({ id: frame.id, fn, file: frame.file, line, depth: stack.length - 1, start: frame.started, params: variables(getters) })
        schedule()
      }
      return frame
    },
    // A call threw: remembered for its end.
    t(frame, error) {
      if (frame && !frame.error) frame.error = error instanceof Error ? error.name : typeName(error)
    },
    // A function ends, by returning or throwing.
    x(frame) {
      const index = stack.lastIndexOf(frame)
      if (index >= 0) stack.splice(index)
      if (frame?.recorded) {
        pendingEnds.push({ id: frame.id, ms: now() - frame.started, error: frame.error ?? null })
        schedule()
      }
    },
    flush,
  }
  target.__wn = api
  return api
}

// The recorder as a <script> for the preview page: it posts each batch to the editor with
// the same `source` as the preview's console messages (see PreviewPanel.jsx).
export function webDebugScript(scriptFiles) {
  const post = "(batch) => parent.postMessage({ source: 'webnest-codelab-preview', type: 'wn-debug', batch }, '*')"
  return `<script>(${installWebDebugger.toString()})(window, ${JSON.stringify(scriptFiles)}, ${post});</script>`
}
