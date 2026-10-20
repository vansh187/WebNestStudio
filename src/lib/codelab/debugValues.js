// Values of a paused backend request, as sent by _snapshot_frames in webnest_runtime.py:
// frames innermost first, each { fn, file, line, first, level, vars }, and every value a node
// { k: name, a: 1 when an attribute, t: type, r: repr, n: length, c: children, more, cut }.

const SEP = '\u0000'
export const pathKey = (names) => names.join(SEP)

// Python's repr() of a string key, so `data["id"]` finds the dict item shown as 'id'.
function pyRepr(text) {
  if (text.includes("'") && !text.includes('"')) return `"${text}"`
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

// One line with the text of its strings and its comment blanked out (same length), so
// a word inside "..." or after # is never taken for a variable. A string still open at the
// end of the line (the start of a docstring) is blanked to the end.
export function maskNonCode(line) {
  let out = ''
  let quote = null
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (quote) {
      if (char === '\\') {
        out += line[i + 1] === undefined ? ' ' : '  '
        i += 1
      } else if (line.startsWith(quote, i)) {
        out += quote
        i += quote.length - 1
        quote = null
      } else {
        out += ' '
      }
    } else if (char === '#') {
      return out + ' '.repeat(line.length - i)
    } else if (char === '"' || char === "'") {
      quote = line.startsWith(char.repeat(3), i) ? char.repeat(3) : char
      out += quote
      i += quote.length - 1
    } else {
      out += char
    }
  }
  return out
}

// Each frame's paths whose value differs from the previous stop of the same request.
// Frames are matched by `level` (distance from the outermost learner frame), so stepping
// into a call keeps the callers' marks right even when deep recursion trims the stack; a
// frame that was not on the stack before has nothing marked.
export function changedPaths(frames = [], previous = null) {
  const result = frames.map(() => new Set())
  if (!previous?.length) return result
  const levelOf = (list, index) => list[index].level ?? list.length - 1 - index
  const previousByLevel = new Map(previous.map((frame, index) => [levelOf(previous, index), frame]))
  frames.forEach((frame, index) => {
    const before = previousByLevel.get(levelOf(frames, index))
    if (!before || before.fn !== frame.fn || before.file !== frame.file) return
    const walk = (nodes = [], old = [], names) => {
      const oldByName = new Map((old ?? []).map((node) => [node.k, node]))
      for (const node of nodes) {
        const path = [...names, node.k]
        const prior = oldByName.get(node.k)
        if (!prior || prior.r !== node.r || prior.t !== node.t) result[index].add(pathKey(path))
        if (node.c?.length && prior?.c) walk(node.c, prior.c, path)
      }
    }
    walk(frame.vars, before.vars, [])
  })
  return result
}

// The expression under the cursor: hovering `title` in `task.title` gives `task.title`,
// hovering `task` gives `task`. Only names, attributes and simple subscripts, so a hover
// never stands for a call. Returns { expression, startColumn, endColumn } (Monaco columns).
const CHAIN = /[A-Za-z_]\w*(?:\s*\.\s*[A-Za-z_]\w*|\[\s*(?:-?\d+|'[^'\\]*'|"[^"\\]*"|[A-Za-z_]\w*)\s*\])*/g
const SEGMENT = /^(?:[A-Za-z_]\w*|\s*\.\s*[A-Za-z_]\w*|\[[^\]]*\])/

export function expressionAt(lineText, column) {
  const index = column - 1
  const masked = maskNonCode(lineText)
  // Inside a string or comment: no value, even if the word matches a variable.
  if (index < 0 || index >= lineText.length || masked[index] !== lineText[index] || masked[index] === '"' || masked[index] === "'") return null
  for (const match of lineText.matchAll(CHAIN)) {
    const start = match.index
    const end = start + match[0].length
    if (index < start || index >= end) continue
    // A word right after a dot that is not part of this chain, e.g. `foo().bar`, is skipped.
    if (lineText[start - 1] === '.') return null
    let offset = 0
    let rest = match[0]
    while (rest) {
      const segment = rest.match(SEGMENT)?.[0]
      if (!segment) break
      offset += segment.length
      rest = rest.slice(segment.length)
      // Hovering inside a subscript like `items[i]` shows `i`, not `items[i]`.
      if (segment.startsWith('[') && index < start + offset - 1 && index > start + offset - segment.length) {
        const inner = segment.slice(1, -1)
        const name = inner.trim()
        if (!/^[A-Za-z_]\w*$/.test(name)) return null
        const from = start + offset - segment.length + 1 + inner.indexOf(name)
        return { expression: name, startColumn: from + 1, endColumn: from + name.length + 1 }
      }
      if (start + offset > index) break
    }
    return { expression: match[0].slice(0, offset).replace(/\s+/g, ''), startColumn: start + 1, endColumn: start + offset + 1 }
  }
  return null
}

function parseExpression(expression) {
  const parts = []
  const head = expression.match(/^[A-Za-z_]\w*/)
  if (!head) return null
  parts.push({ name: head[0] })
  let rest = expression.slice(head[0].length)
  while (rest) {
    let match = rest.match(/^\.([A-Za-z_]\w*)/)
    if (match) {
      parts.push({ attr: match[1] })
    } else if ((match = rest.match(/^\[(-?\d+|'[^']*'|"[^"]*"|[A-Za-z_]\w*)\]/))) {
      parts.push({ item: match[1] })
    } else {
      return null
    }
    rest = rest.slice(match[0].length)
  }
  return parts
}

// Finds `task.tags[0]` or `payload["id"]` in a frame's variables. A name in brackets
// (`items[i]`) uses the current value of that variable.
export function resolveExpression(frame, expression) {
  const parts = expression && parseExpression(expression)
  if (!frame || !parts) return null
  let node = frame.vars?.find((item) => item.k === parts[0].name)
  const path = [parts[0].name]
  for (const part of parts.slice(1)) {
    if (!node?.c) return null
    let child
    if (part.attr) {
      child = node.c.find((item) => item.a && item.k === part.attr)
    } else {
      let key = part.item
      if (/^[A-Za-z_]/.test(key)) {
        const variable = frame.vars?.find((item) => item.k === key)
        if (!variable || variable.c) return null
        key = variable.r
      }
      if (/^['"]/.test(key)) key = pyRepr(key.slice(1, -1))
      if (/^-\d+$/.test(key) && node.n != null && ['list', 'tuple', 'deque'].includes(node.t)) key = String(node.n + Number(key))
      child = node.c.find((item) => !item.a && item.k === key)
    }
    if (!child) return null
    path.push(child.k)
    node = child
  }
  return node ? { node, path } : null
}

export const describeType = (node) => (node.n != null && node.c ? `${node.t}, ${node.n} item${node.n === 1 ? '' : 's'}` : node.t)

// A plain-text tree of a value for the editor hover, a few levels deep.
export function formatTree(node, { depth = 2, lines = 40 } = {}) {
  if (!node.c?.length) return node.r
  const out = []
  const walk = (parent, indent, level) => {
    for (const item of parent.c) {
      if (out.length >= lines) return
      const open = item.c?.length && level < depth
      out.push(`${'  '.repeat(indent)}${item.k}: ${open ? describeType(item) : item.r}`)
      if (open) walk(item, indent + 1, level + 1)
    }
    if (parent.more && out.length < lines) out.push(`${'  '.repeat(indent)}… ${parent.more} more`)
  }
  walk(node, 0, 1)
  if (out.length >= lines) out.push('…')
  return out.join('\n')
}

export function hoverMarkdown(expression, { node }, changed) {
  const fence = '```'
  return [
    `**${expression}**: \`${describeType(node)}\`${changed ? ' · _changed by the last step_' : ''}`,
    `${fence}python\n${formatTree(node)}\n${fence}`,
  ].join('\n\n')
}

// VS Code style inline values: after each line of the paused function, up to the paused
// line, the current values of the variables that line uses.
export function inlineValues(frame, source, changed = new Set()) {
  if (!frame?.vars?.length || !source) return []
  const byName = new Map(frame.vars.map((item) => [item.k, item]))
  const lines = source.split('\n')
  const from = Math.max(frame.first ?? 1, frame.line - 60)
  const result = []
  for (let line = from; line <= Math.min(frame.line, lines.length); line += 1) {
    const code = maskNonCode(lines[line - 1])
    const names = [...new Set([...code.matchAll(/(?<![.\w])[A-Za-z_]\w*/g)].map((match) => match[0]))]
      .filter((name) => byName.has(name))
    if (!names.length) continue
    let text = names.map((name) => {
      const value = byName.get(name).r
      return `${name} = ${value.length > 40 ? `${value.slice(0, 39)}…` : value}`
    }).join(', ')
    if (text.length > 120) text = `${text.slice(0, 119)}…`
    result.push({ line, text, changed: names.some((name) => changed.has(pathKey([name]))) })
  }
  return result
}
