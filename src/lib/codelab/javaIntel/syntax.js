// Small, forgiving readers for Java source that has been through maskJava (comments and
// literal contents blanked). They never throw: unknown shapes simply return null.

export const PRIMITIVES = new Set(['byte', 'short', 'int', 'long', 'float', 'double', 'boolean', 'char', 'void'])

export const KEYWORDS = ('abstract assert boolean break byte case catch char class continue default do double else enum extends final finally float for if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try var void volatile while record yield sealed permits non-sealed true false null').split(' ')

// Words that can never start a type in a declaration.
const NOT_TYPES = new Set(['return', 'new', 'throw', 'else', 'case', 'default', 'break', 'continue', 'do', 'try', 'finally', 'import', 'package', 'instanceof', 'yield', 'assert', 'this', 'super', 'true', 'false', 'null', 'if', 'for', 'while', 'switch', 'catch', 'synchronized', 'extends', 'implements', 'throws', 'class', 'interface', 'enum', 'record', 'goto', 'const'])

const isIdStart = (c) => /[A-Za-z_$]/.test(c)
const isId = (c) => /[\w$]/.test(c)

export function skipSpace(text, i) {
  while (i < text.length && /\s/.test(text[i])) i++
  return i
}

export function readIdent(text, i) {
  if (!isIdStart(text[i] || '')) return null
  let j = i + 1
  while (j < text.length && isId(text[j])) j++
  return { name: text.slice(i, j), end: j }
}

// Read a type such as `Map.Entry<String, List<Dog>>[]` or `String...` starting at i.
// Returns { type, end } with whitespace normalized, or null.
export function readType(text, start) {
  let i = skipSpace(text, start)
  const first = readIdent(text, i)
  if (!first || NOT_TYPES.has(first.name)) return null
  let type = first.name
  i = first.end
  // Qualified names: java.util.List, Map.Entry
  for (;;) {
    const dot = skipSpace(text, i)
    if (text[dot] !== '.' || text[dot + 1] === '.') break
    const next = readIdent(text, skipSpace(text, dot + 1))
    if (!next) break
    type += `.${next.name}`
    i = next.end
  }
  let j = skipSpace(text, i)
  if (text[j] === '<') {
    let depth = 0
    let k = j
    for (; k < text.length; k++) {
      const c = text[k]
      if (c === '<') depth++
      else if (c === '>') { if (--depth === 0) break }
      else if (!/[\w$\s.,?[\]&]/.test(c)) return null
    }
    if (depth !== 0 || k >= text.length) return null
    type += text.slice(j, k + 1).replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').replace(/<\s+/g, '<').replace(/\s+>/g, '>')
    i = k + 1
  }
  for (;;) {
    j = skipSpace(text, i)
    if (text[j] === '[' && text[skipSpace(text, j + 1)] === ']') { type += '[]'; i = skipSpace(text, j + 1) + 1; continue }
    if (text.startsWith('...', j)) { type += '...'; i = j + 3 }
    break
  }
  return { type, end: i }
}

// Split on `sep` outside of (), [], {}, <>.
export function splitTop(text, sep = ',') {
  const parts = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if ('([{<'.includes(c)) depth++
    else if (')]}>'.includes(c)) depth = Math.max(0, depth - 1)
    else if (c === sep && depth === 0) { parts.push(text.slice(start, i)); start = i + 1 }
  }
  parts.push(text.slice(start))
  return parts.map((p) => p.trim()).filter(Boolean)
}

// Parse a type string into { name, args, dims }. Wildcards become their bound (or Object).
export function parseTypeRef(text) {
  let t = String(text || '').trim().replace(/^final\s+/, '')
  if (!t) return null
  // Wildcards keep their bound for display; the type system reads through them.
  const wildcard = /^\?(?:\s+(extends|super)\s+(.+))?$/.exec(t)
  if (wildcard) return { name: '?', args: [], dims: 0, boundKind: wildcard[1] ?? null, bound: wildcard[2] ? parseTypeRef(wildcard[2]) : null }
  let dims = 0
  for (;;) {
    if (t.endsWith('[]')) { dims++; t = t.slice(0, -2).trim() } else if (t.endsWith('...')) { dims++; t = t.slice(0, -3).trim() } else break
  }
  const lt = t.indexOf('<')
  if (lt === -1) return { name: t, args: [], dims }
  const name = t.slice(0, lt).trim()
  const inner = t.slice(lt + 1, t.lastIndexOf('>'))
  return { name, args: splitTop(inner).map(parseTypeRef).filter(Boolean), dims }
}

export function formatTypeRef(ref) {
  if (!ref) return ''
  if (ref.name === '?') return ref.bound ? `? ${ref.boundKind} ${formatTypeRef(ref.bound)}` : '?'
  const args = ref.args?.length ? `<${ref.args.map(formatTypeRef).join(', ')}>` : ''
  return `${ref.name}${args}${'[]'.repeat(ref.dims || 0)}`
}

// Index of the bracket that closes the one opening at `open` (masked text), or -1.
export function matchForward(text, open) {
  const pairs = { '(': ')', '[': ']', '{': '}' }
  const close = pairs[text[open]]
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === text[open]) depth++
    else if (text[i] === close && --depth === 0) return i
  }
  return -1
}

export function matchBackward(text, close) {
  const pairs = { ')': '(', ']': '[', '}': '{' }
  const open = pairs[text[close]]
  let depth = 0
  for (let i = close; i >= 0; i--) {
    if (text[i] === text[close]) depth++
    else if (text[i] === open && --depth === 0) return i
  }
  return -1
}

// First sentence of the Javadoc comment that ends just before `declStart` in the original text.
export function docBefore(content, declStart) {
  const before = content.slice(0, declStart).replace(/(\s*@[\w.]+(\([^()]*\))?\s*)+$/, '').trimEnd()
  if (!before.endsWith('*/')) return ''
  const open = before.lastIndexOf('/**')
  if (open === -1 || before.lastIndexOf('*/', before.length - 3) > open) return ''
  const doc = before.slice(open + 3, -2)
    .split('\n').map((l) => l.replace(/^\s*\*\s?/, '')).join(' ')
    .replace(/\{@(?:code|literal|link|linkplain)\s+([^{}]*)\}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!doc || doc.startsWith('@')) return ''
  return doc.split(/(?<=\.)\s/)[0].slice(0, 200)
}

// Whether `offset` sits inside a comment, string, char or text-block literal.
export function inCommentOrString(code, offset) {
  let i = 0
  while (i < offset) {
    const c = code[i]
    const next = code[i + 1]
    if (c === '/' && next === '/') {
      const end = code.indexOf('\n', i)
      if (end === -1 || end >= offset) return true
      i = end
    } else if (c === '/' && next === '*') {
      const end = code.indexOf('*/', i + 2)
      if (end === -1 || end + 2 > offset) return true
      i = end + 2
    } else if (code.startsWith('"""', i)) {
      let j = i + 3
      while (j < code.length && !code.startsWith('"""', j)) j += code[j] === '\\' ? 2 : 1
      if (j >= offset) return true
      i = j + 3
    } else if (c === '"' || c === '\'') {
      let j = i + 1
      while (j < code.length && code[j] !== c && code[j] !== '\n') j += code[j] === '\\' ? 2 : 1
      if (j >= offset) return true
      i = j + 1
    } else {
      i++
    }
  }
  return false
}
