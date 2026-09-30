// Generates src/data/java/jdkCatalog.json: the JDK classes the Java playground's code
// suggestions know about. Signatures come from `javap -public`; parameter names and one-line
// docs come from the JDK's own src.zip. Run it again after changing CLASSES:
//
//   JAVA_HOME="C:\Program Files\Java\jdk-17" node scripts/generate-java-catalog.mjs
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { maskJava } from '../src/lib/codelab/javaProject.js'

const JAVA_HOME = process.env.JAVA_HOME || 'C:/Program Files/Java/jdk-17'
const bin = (tool) => path.join(JAVA_HOME, 'bin', process.platform === 'win32' ? `${tool}.exe` : tool)
const OUT = new URL('../src/data/java/jdkCatalog.json', import.meta.url)

// Classes learners use. Public supertypes are added automatically so inherited members resolve.
const CLASSES = `
java.lang.Object java.lang.String java.lang.StringBuilder java.lang.Math java.lang.Integer java.lang.Long
java.lang.Double java.lang.Float java.lang.Boolean java.lang.Character java.lang.Byte java.lang.Short
java.lang.Number java.lang.System java.lang.CharSequence java.lang.Comparable java.lang.Iterable
java.lang.Runnable java.lang.Thread java.lang.Throwable java.lang.Exception java.lang.RuntimeException
java.lang.Error java.lang.IllegalArgumentException java.lang.IllegalStateException
java.lang.ArithmeticException java.lang.NullPointerException java.lang.ArrayIndexOutOfBoundsException
java.lang.IndexOutOfBoundsException java.lang.NumberFormatException java.lang.ClassCastException
java.lang.UnsupportedOperationException java.lang.InterruptedException java.lang.CloneNotSupportedException
java.lang.Enum java.lang.Record java.lang.AutoCloseable java.lang.Cloneable
java.io.PrintStream java.io.InputStream java.io.IOException java.io.BufferedReader java.io.InputStreamReader
java.io.FileNotFoundException java.io.Serializable
java.util.Scanner java.util.List java.util.ArrayList java.util.LinkedList java.util.Map java.util.Map$Entry
java.util.HashMap java.util.LinkedHashMap java.util.TreeMap java.util.Set java.util.HashSet
java.util.LinkedHashSet java.util.TreeSet java.util.Queue java.util.Deque java.util.ArrayDeque
java.util.PriorityQueue java.util.Stack java.util.Iterator java.util.ListIterator java.util.Collection
java.util.Collections java.util.Arrays java.util.Objects java.util.Optional java.util.Random
java.util.Comparator java.util.StringJoiner java.util.InputMismatchException java.util.NoSuchElementException
java.util.ConcurrentModificationException
java.util.function.Function java.util.function.BiFunction java.util.function.Consumer
java.util.function.BiConsumer java.util.function.Supplier java.util.function.Predicate
java.util.function.UnaryOperator java.util.function.BinaryOperator
java.util.stream.Stream java.util.stream.IntStream java.util.stream.Collectors
java.time.LocalDate java.time.LocalDateTime java.time.LocalTime java.time.Duration
java.math.BigDecimal java.math.BigInteger
`.trim().split(/\s+/)

// Supertypes that only add noise to suggestions.
const SKIP_SUPERTYPES = /^java\.(lang\.(constant|invoke)|time\.(chrono|temporal))\./

const javap = (names) => execFileSync(bin('javap'), ['-public', ...names], { maxBuffer: 64 << 20 }).toString()

// Split on commas that are not inside <...>.
function splitTop(text, sep = ',') {
  const parts = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '<') depth++
    else if (text[i] === '>') depth--
    else if (text[i] === sep && depth === 0) { parts.push(text.slice(start, i).trim()); start = i + 1 }
  }
  if (text.slice(start).trim()) parts.push(text.slice(start).trim())
  return parts
}

// java.util.Map$Entry<K, java.util.List<V>> -> Map.Entry<K,List<V>>
const simplify = (type) => type.replace(/\b(?:[a-z_][\w]*\.)+(?=[A-Z])/g, '').replace(/\$/g, '.').replace(/\s*,\s*/g, ',')
// Erased simple type for matching against source: Map.Entry<K,V>[] -> Entry[], T... -> T[]
const erase = (type) => simplify(type).replace(/<[^<>]*(?:<[^<>]*(?:<[^<>]*>[^<>]*)*>[^<>]*)*>/g, '').replace(/\.\.\./g, '[]').replace(/^.*\.(?=[A-Za-z_$][\w$]*(\[\])*$)/, '').replace(/\s+/g, '')

function parseJavap(output) {
  const types = []
  let current = null
  for (const raw of output.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('Compiled from')) continue
    if (line === '}') { current = null; continue }
    const header = /^(?:public\s+)?((?:\w+\s+)*)(class|interface|enum|record)\s+([\w.$]+)(<.*?>)?\s*(?:extends\s+(.*?))?\s*(?:implements\s+(.*?))?\s*\{$/.exec(line)
    if (!current && header) {
      const fqn = header[3]
      const mods = header[1]
      const kind = header[2] === 'class' && /\babstract\b/.test(mods) ? 'abstract class' : header[2]
      const supers = [...splitTop(header[5] || ''), ...splitTop(header[6] || '')]
      current = { fqn, kind, typeParams: header[4] ? splitTop(header[4].slice(1, -1)).map((p) => p.split(/\s+/)[0]) : [], supers, members: [] }
      types.push(current)
      continue
    }
    if (!current || !line.endsWith(';')) continue
    const body = line.slice(0, -1).replace(/\s+throws\s+.*$/, '')
    const paren = body.indexOf('(')
    if (paren === -1) {
      const m = /^(.*?)\s+([\w$]+)$/.exec(body)
      if (!m) continue
      const isStatic = /\bstatic\b/.test(m[1])
      const type = m[1].replace(/\b(public|static|final|volatile|transient)\s+/g, '').trim()
      current.members.push({ kind: 'field', name: m[2], type, isStatic })
      continue
    }
    const params = splitTop(body.slice(paren + 1, body.lastIndexOf(')')))
    const head = body.slice(0, paren).trim()
    const nameMatch = /([\w.$]+)$/.exec(head)
    const name = nameMatch[1]
    let rest = head.slice(0, nameMatch.index).trim()
    const isStatic = /\bstatic\b/.test(rest)
    rest = rest.replace(/\b(public|static|final|abstract|default|native|synchronized|strictfp)\s+/g, '').trim()
    let methodTypeParams = []
    if (rest.startsWith('<')) {
      let depth = 0
      let end = 0
      for (; end < rest.length; end++) {
        if (rest[end] === '<') depth++
        else if (rest[end] === '>' && --depth === 0) break
      }
      methodTypeParams = splitTop(rest.slice(1, end)).map((p) => p.split(/\s+/)[0])
      rest = rest.slice(end + 1).trim()
    }
    if (name === current.fqn) current.members.push({ kind: 'ctor', params })
    else current.members.push({ kind: 'method', name, returns: rest, params, isStatic, typeParams: methodTypeParams })
  }
  return types
}

// ---- Source (parameter names + first sentence of Javadoc) ----
function braceDepths(masked) {
  const depth = new Int32Array(masked.length + 1)
  let d = 0
  for (let i = 0; i < masked.length; i++) {
    depth[i] = d
    if (masked[i] === '{') d++
    else if (masked[i] === '}') d = Math.max(0, d - 1)
  }
  return depth
}

function docSummary(text, declStart) {
  let i = declStart - 1
  const before = text.slice(0, declStart).replace(/(\s*@[\w.]+(\([^()]*\))?\s*)+$/, '')
  i = before.trimEnd().length
  if (!before.slice(0, i).endsWith('*/')) return ''
  const open = before.lastIndexOf('/**', i)
  if (open === -1) return ''
  let doc = before.slice(open + 3, i - 2)
    .split('\n').map((l) => l.replace(/^\s*\*\s?/, '')).join(' ')
    .replace(/\{@(?:code|literal)\s+([^{}]*)\}/g, '$1')
    .replace(/\{@link(?:plain)?\s+[^\s{}]*?\s+([^{}]+)\}/g, '$1')
    .replace(/\{@link(?:plain)?\s+(?:[\w.]*#)?([^\s{}]+)\}/g, '$1')
    .replace(/\{@inheritDoc\}/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
  if (doc.startsWith('@')) return ''
  doc = doc.split(/(?<=\.)\s/)[0]
  return doc.length > 160 ? `${doc.slice(0, 157).trimEnd()}...` : doc
}

function sourceDecls(source, simpleName) {
  const masked = maskJava(source)
  const depth = braceDepths(masked)
  // Locate the (possibly nested) type body.
  const parts = simpleName.split('.')
  let from = 0
  let bodyStart = -1
  let bodyDepth = 0
  for (const part of parts) {
    const re = new RegExp(`\\b(class|interface|enum|record)\\s+${part}\\b`, 'g')
    re.lastIndex = from
    const m = re.exec(masked)
    if (!m) return []
    bodyStart = masked.indexOf('{', m.index)
    bodyDepth = depth[bodyStart] + 1
    from = bodyStart + 1
  }
  let bodyEnd = bodyStart + 1
  while (bodyEnd < masked.length && !(masked[bodyEnd] === '}' && depth[bodyEnd] === bodyDepth)) bodyEnd++
  const decls = []
  const re = /([\w$]+)\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*(?:throws\s+[\w$.,\s]+)?\s*[{;]/g
  re.lastIndex = bodyStart
  let m
  while ((m = re.exec(masked)) && m.index < bodyEnd) {
    if (depth[m.index] !== bodyDepth) continue
    const lineStart = masked.lastIndexOf('\n', m.index) + 1
    const params = m[2].trim() ? splitTop(m[2].replace(/@[\w.]+(\([^()]*\))?\s*/g, '').replace(/\bfinal\s+/g, '')) : []
    decls.push({
      name: m[1],
      types: params.map((p) => erase(p.replace(/\s+[\w$]+$/, ''))),
      names: params.map((p) => /([\w$]+)$/.exec(p)?.[1] ?? 'arg'),
      doc: docSummary(source, lineStart),
    })
  }
  return decls
}

// ---- Build ----
const wanted = new Set(CLASSES)
const parsed = new Map()
let queue = [...wanted]
while (queue.length) {
  const batch = queue.filter((fqn) => !parsed.has(fqn))
  queue = []
  if (!batch.length) break
  for (const type of parseJavap(javap(batch))) {
    parsed.set(type.fqn, type)
    for (const sup of type.supers) {
      const fqn = sup.replace(/<.*$/, '')
      if (!parsed.has(fqn) && !SKIP_SUPERTYPES.test(fqn) && /^java\./.test(fqn)) queue.push(fqn)
    }
  }
}

const work = mkdtempSync(path.join(tmpdir(), 'jdk-src-'))
try {
  const entries = [...parsed.keys()].map((fqn) => `java.base/${fqn.replace(/\$.*$/, '').replace(/\./g, '/')}.java`)
  execFileSync(bin('jar'), ['xf', path.join(JAVA_HOME, 'lib', 'src.zip'), ...new Set(entries)], { cwd: work })

  const classes = {}
  let dropped = 0
  for (const [fqn, type] of parsed) {
    const outer = fqn.replace(/\$.*$/, '')
    const simpleName = fqn.slice(fqn.lastIndexOf('.') + 1).replace(/\$/g, '.')
    const file = path.join(work, 'java.base', `${outer.replace(/\./g, '/')}.java`)
    const decls = existsSync(file) ? sourceDecls(readFileSync(file, 'utf8'), simpleName) : []
    const ctorName = simpleName.split('.').at(-1)
    const find = (name, params) => {
      const erased = params.map(erase)
      return decls.find((d) => d.name === name && d.types.length === erased.length && d.types.every((t, i) => t === erased[i]))
    }

    const entry = { pkg: outer.slice(0, outer.lastIndexOf('.')), kind: type.kind }
    if (type.typeParams.length) entry.tp = type.typeParams
    const supers = type.supers.filter((s) => !SKIP_SUPERTYPES.test(s)).map(simplify)
    if (supers.length) entry.sup = supers
    const ctors = []
    const fields = []
    const methods = []
    for (const member of type.members) {
      if (member.kind === 'field') {
        fields.push({ n: member.name, t: simplify(member.type), ...(member.isStatic ? { s: 1 } : {}) })
        continue
      }
      const name = member.kind === 'ctor' ? ctorName : member.name
      const decl = find(name, member.params)
      if (!decl && decls.length) { dropped++; continue } // bridge / synthetic method
      const item = { p: member.params.map(simplify), pn: decl?.names ?? member.params.map((_, i) => `arg${i}`) }
      if (decl?.doc) item.d = decl.doc
      if (member.kind === 'ctor') { ctors.push(item); continue }
      methods.push({ n: member.name, r: simplify(member.returns), ...item, ...(member.isStatic ? { s: 1 } : {}), ...(member.typeParams.length ? { tp: member.typeParams } : {}) })
    }
    if (ctors.length) entry.c = ctors
    if (fields.length) entry.f = fields
    if (methods.length) entry.m = methods
    if (!wanted.has(fqn)) entry.hidden = 1 // supertype only: not suggested as a class name
    classes[simpleName] = entry
  }

  const json = JSON.stringify({ jdk: 17, classes })
  writeFileSync(OUT, `${json}\n`)
  console.log(`${Object.keys(classes).length} types, ${dropped} bridge methods dropped, ${(json.length / 1024).toFixed(0)} KB`)
} finally {
  rmSync(work, { recursive: true, force: true })
}
