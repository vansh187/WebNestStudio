// Declarations in the student's own files: types, fields, methods and constructors, with
// the source ranges the scope analysis needs. Parsing is regex/bracket based and tolerant of
// half-typed code, which is the normal state of a file while someone is editing it.
import { braceDepths, isJavaFile, maskJava, packageOf } from '../javaProject.js'
import { docBefore, parseTypeRef, readIdent, readType, skipSpace, splitTop } from './syntax.js'

const MODIFIERS = /^(?:(?:public|protected|private|static|final|abstract|synchronized|native|default|strictfp|transient|volatile|sealed|non-sealed)\s+)*/
const ANNOTATION = /@[\w.]+(?:\s*\([^()]*(?:\([^()]*\)[^()]*)*\))?/g

function parseParams(text) {
  return splitTop(text).map((raw) => {
    const clean = raw.replace(ANNOTATION, '').replace(/\bfinal\s+/g, '').trim()
    const type = readType(clean, 0)
    const name = type && readIdent(clean, skipSpace(clean, type.end))
    return { type: type?.type ?? 'Object', name: name?.name ?? 'arg' }
  })
}

function readTypeParams(text, i) {
  i = skipSpace(text, i)
  if (text[i] !== '<') return { params: [], end: i }
  let depth = 0
  let k = i
  for (; k < text.length; k++) {
    if (text[k] === '<') depth++
    else if (text[k] === '>' && --depth === 0) break
  }
  const params = splitTop(text.slice(i + 1, k)).map((p) => p.split(/\s+/)[0])
  return { params, end: k + 1 }
}

function lineStartBefore(text, index) {
  return text.lastIndexOf('\n', index - 1) + 1
}

function parseMembers(type, content, masked, depth) {
  const level = depth[type.bodyStart] + 1
  const fields = []
  const methods = []
  const ctors = []
  let i = type.bodyStart + 1

  if (type.kind === 'enum') {
    let semi = i
    while (semi < type.bodyEnd && !(masked[semi] === ';' && depth[semi] === level)) semi++
    const flat = [...masked.slice(i, semi)].map((c, k) => (depth[i + k] === level ? c : ' ')).join('')
    for (const part of splitTop(flat)) {
      const id = readIdent(part, 0)
      if (id) fields.push({ name: id.name, type: type.name, isStatic: true, isConstant: true, doc: '' })
    }
    i = semi + 1
  }

  let segStart = i
  for (; i < type.bodyEnd; i++) {
    if (depth[i] !== level) continue
    const c = masked[i]
    if (c !== ';' && c !== '{') {
      if (c === '}') segStart = i + 1
      continue
    }
    const declStart = skipSpace(masked, segStart)
    const raw = masked.slice(segStart, i)
    let bodyEnd = -1
    if (c === '{') {
      bodyEnd = i + 1
      while (bodyEnd < type.bodyEnd && !(masked[bodyEnd] === '}' && depth[bodyEnd] === level + 1)) bodyEnd++
    }
    classifySegment({ raw, declStart, bodyStart: c === '{' ? i : -1, bodyEnd, type, content, fields, methods, ctors })
    if (c === '{') i = bodyEnd
    segStart = i + 1
  }
  return { fields, methods, ctors }
}

function classifySegment({ raw, declStart, bodyStart, bodyEnd, type, content, fields, methods, ctors }) {
  const text = raw.replace(ANNOTATION, ' ').trim()
  if (!text || text === 'static') return
  if (/(?:^|\s)(class|interface|enum|record)\s+[\w$]/.test(text) && !text.includes('=')) return
  const doc = docBefore(content, lineStartBefore(content, declStart) || declStart)
  const eq = text.search(/=(?!=)/)
  const paren = text.indexOf('(')
  const mods = MODIFIERS.exec(text)[0]
  const isStatic = /\bstatic\b/.test(mods)

  if (paren !== -1 && (eq === -1 || paren < eq)) {
    let rest = text.slice(mods.length)
    const tp = readTypeParams(rest, 0)
    rest = rest.slice(tp.end).trim()
    const close = rest.lastIndexOf(')')
    const open = rest.indexOf('(')
    const head = rest.slice(0, open).trim()
    const nameMatch = /([\w$]+)$/.exec(head)
    if (!nameMatch) return
    const name = nameMatch[1]
    const returns = head.slice(0, nameMatch.index).trim()
    const params = parseParams(rest.slice(open + 1, close === -1 ? undefined : close))
    const entry = { name, params, doc, isStatic, isPrivate: /\bprivate\b/.test(mods), typeParams: tp.params, declStart, bodyStart, bodyEnd, isAbstract: bodyStart === -1 }
    if (!returns && name === type.name) ctors.push(entry)
    else if (returns) methods.push({ ...entry, returns })
    return
  }

  const decl = (eq === -1 ? text : text.slice(0, eq)).slice(mods.length)
  const t = readType(decl, 0)
  if (!t) return
  const names = [readIdent(decl, skipSpace(decl, t.end))?.name]
  // More declarators: `int a = 1, b;`
  if (eq !== -1) {
    for (const part of splitTop(text.slice(eq + 1)).slice(1)) {
      const id = /^([\w$]+)\s*(?:=|$)/.exec(part)
      if (id) names.push(id[1])
    }
  } else {
    for (const part of splitTop(decl.slice(t.end)).slice(1)) names.push(readIdent(part, 0)?.name)
  }
  for (const name of names.filter(Boolean)) {
    // Interface fields are implicitly static final.
    const fieldStatic = isStatic || type.kind === 'interface'
    fields.push({ name, type: t.type, isStatic: fieldStatic, isPrivate: /\bprivate\b/.test(mods), isConstant: fieldStatic && (/\bfinal\b/.test(mods) || type.kind === 'interface'), doc, declStart })
  }
}

function findTypes(content, masked, depth, from, to, level, outer, out) {
  const re = /\b(class|interface|enum|record)\s+([A-Za-z_$][\w$]*)/g
  re.lastIndex = from
  let m
  while ((m = re.exec(masked)) && m.index < to) {
    if (depth[m.index] !== level || /[.@]\s*$/.test(masked.slice(Math.max(0, m.index - 3), m.index))) continue
    const bodyStart = masked.indexOf('{', m.index)
    if (bodyStart === -1 || bodyStart > to) break
    let bodyEnd = bodyStart + 1
    while (bodyEnd < masked.length && !(masked[bodyEnd] === '}' && depth[bodyEnd] === level + 1)) bodyEnd++
    const header = masked.slice(m.index + m[0].length, bodyStart)
    const tp = readTypeParams(header, 0)
    let rest = header.slice(tp.end)
    let components = []
    if (m[1] === 'record') {
      const open = rest.indexOf('(')
      const close = rest.lastIndexOf(')')
      if (open !== -1 && close > open) {
        components = parseParams(rest.slice(open + 1, close))
        rest = rest.slice(close + 1)
      }
    }
    const listAfter = (word) => {
      const found = new RegExp(`\\b${word}\\b([\\s\\S]*?)(?=\\b(?:extends|implements|permits)\\b|$)`).exec(rest)
      return found ? splitTop(found[1]).map((s) => s.replace(/\s+/g, ' ')) : []
    }
    const mods = masked.slice(lineStartBefore(masked, m.index), m.index)
    const name = outer ? `${outer.name}.${m[2]}` : m[2]
    const type = {
      name: m[2],
      qualifiedName: name,
      kind: m[1] === 'class' && /\babstract\b/.test(mods) ? 'abstract class' : m[1],
      typeParams: tp.params,
      extends: listAfter('extends'),
      implements: listAfter('implements'),
      start: m.index,
      bodyStart,
      bodyEnd,
      doc: docBefore(content, lineStartBefore(content, m.index)),
      outer: outer?.qualifiedName ?? null,
      source: 'project',
    }
    const members = parseMembers(type, content, masked, depth)
    Object.assign(type, members)
    if (type.kind === 'record') {
      for (const comp of components) {
        type.fields.push({ name: comp.name, type: comp.type, isStatic: false, doc: '' })
        if (!type.methods.some((mm) => mm.name === comp.name && !mm.params.length)) {
          type.methods.push({ name: comp.name, returns: comp.type, params: [], doc: `Accessor for record component ${comp.name}.`, isStatic: false, typeParams: [] })
        }
      }
      if (!type.ctors.some((c) => c.params.length === components.length)) type.ctors.push({ name: type.name, params: components, doc: '' })
    }
    if (type.kind === 'enum') {
      type.methods.push(
        { name: 'values', returns: `${type.name}[]`, params: [], doc: 'Returns all constants of this enum, in declaration order.', isStatic: true, typeParams: [] },
        { name: 'valueOf', returns: type.name, params: [{ type: 'String', name: 'name' }], doc: 'Returns the enum constant with the given name.', isStatic: true, typeParams: [] },
      )
    }
    out.push(type)
    findTypes(content, masked, depth, bodyStart + 1, bodyEnd, level + 1, type, out)
    re.lastIndex = bodyEnd
  }
}

// Supertypes as written, with the implicit ones Java adds.
export function supertypesOf(type) {
  if (type.kind === 'enum') return [`Enum<${type.name}>`, ...type.implements]
  if (type.kind === 'record') return ['Record', ...type.implements]
  if (type.kind === 'interface') return type.extends
  return [...(type.extends.length ? type.extends : ['Object']), ...type.implements]
}

const cache = new Map()

export function indexFile(name, content) {
  const key = `${name}\u0000${content}`
  const hit = cache.get(name)
  if (hit?.key === key) return hit.value
  const text = String(content || '').replace(/\r\n?/g, '\n')
  const masked = maskJava(text)
  const depth = braceDepths(masked)
  const types = []
  findTypes(text, masked, depth, 0, masked.length, 0, null, types)
  const imports = [...masked.matchAll(/\bimport\s+(static\s+)?([\w$.]+(?:\.\*)?)\s*;/g)]
    .filter((m) => depth[m.index] === 0)
    .map((m) => ({ isStatic: Boolean(m[1]), target: m[2].replace(/\s+/g, ''), index: m.index, end: m.index + m[0].length }))
  const pkg = packageOf(masked, depth)
  const value = { name, content: text, masked, depth, types, imports, pkg }
  cache.set(name, { key, value })
  if (cache.size > 200) cache.delete(cache.keys().next().value)
  return value
}

export function indexProject(files) {
  const indexed = files.filter(isJavaFile).map((file) => indexFile(file.name, file.content))
  const byName = new Map()
  for (const file of indexed) {
    for (const type of file.types) {
      if (!byName.has(type.qualifiedName)) byName.set(type.qualifiedName, { ...type, file: file.name })
      if (!byName.has(type.name)) byName.set(type.name, { ...type, file: file.name })
    }
  }
  return { files: indexed, types: byName }
}

export { parseTypeRef }
