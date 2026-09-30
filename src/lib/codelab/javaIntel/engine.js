// Browser-side Java "understanding" for the playground editor: completions, signature help,
// hover and import fixes. Pure functions over { files, activeName, content, offset } so they
// can be unit tested without Monaco; monacoJava.js adapts them to the editor.
import { indexFile, indexProject } from './projectIndex.js'
import { createCatalog, createTypeSystem } from './types.js'
import {
  KEYWORDS, PRIMITIVES, formatTypeRef, inCommentOrString, matchBackward, parseTypeRef, readIdent, readType, skipSpace, splitTop,
} from './syntax.js'

const TEMPLATES = [
  { label: 'sout', detail: 'System.out.println()', body: 'System.out.println($0);', where: 'method' },
  { label: 'souf', detail: 'System.out.printf()', body: 'System.out.printf("$1%n"$0);', where: 'method' },
  { label: 'serr', detail: 'System.err.println()', body: 'System.err.println($0);', where: 'method' },
  { label: 'psvm', detail: 'main() method', body: 'public static void main(String[] args) {\n\t$0\n}', where: 'class' },
  { label: 'main', detail: 'main() method', body: 'public static void main(String[] args) {\n\t$0\n}', where: 'class' },
  { label: 'fori', detail: 'for (int i = 0; i < n; i++)', body: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}', where: 'method' },
  { label: 'foreach', detail: 'for (Type item : items)', body: 'for (${1:var} ${2:item} : ${3:items}) {\n\t$0\n}', where: 'method' },
  { label: 'iter', detail: 'for (Type item : items)', body: 'for (${1:var} ${2:item} : ${3:items}) {\n\t$0\n}', where: 'method' },
  { label: 'if', detail: 'if (condition)', body: 'if (${1:condition}) {\n\t$0\n}', where: 'method' },
  { label: 'ifelse', detail: 'if (…) … else …', body: 'if (${1:condition}) {\n\t$2\n} else {\n\t$0\n}', where: 'method' },
  { label: 'while', detail: 'while (condition)', body: 'while (${1:condition}) {\n\t$0\n}', where: 'method' },
  { label: 'dowhile', detail: 'do … while (condition)', body: 'do {\n\t$0\n} while (${1:condition});', where: 'method' },
  { label: 'try', detail: 'try … catch', body: 'try {\n\t$1\n} catch (${2:Exception} ${3:e}) {\n\t$0\n}', where: 'method' },
  { label: 'tryf', detail: 'try … catch … finally', body: 'try {\n\t$1\n} catch (${2:Exception} ${3:e}) {\n\t$4\n} finally {\n\t$0\n}', where: 'method' },
  { label: 'switch', detail: 'switch (value)', body: 'switch (${1:value}) {\n\tcase ${2:1} -> $3;\n\tdefault -> $0;\n}', where: 'method' },
  { label: 'scanner', detail: 'Scanner for keyboard input', body: 'Scanner ${1:scanner} = new Scanner(System.in);$0', where: 'method', imports: ['java.util.Scanner'] },
]

// Members of `ref` as seen from the class being edited (arrays only have instance members).
function mem(ctx, ref, mode = 'instance') {
  return ctx.ts.members(ref, ref?.dims ? 'instance' : mode, ctx.enclosing?.qualifiedName.split('.')[0] ?? null)
}

const KIND_ORDER = { variable: '0', field: '1', method: '1', constant: '1', constructor: '2', class: '3', interface: '3', enum: '3', snippet: '4', keyword: '5', module: '3' }

export function createJavaIntel(catalogJson) {
  const catalog = createCatalog(catalogJson)

  function context({ files = [], activeName, content, offset }) {
    const others = files.filter((f) => f.name !== activeName)
    const active = { name: activeName || 'Main.java', content: content ?? '' }
    const project = indexProject([active, ...others])
    const file = indexFile(active.name, active.content)
    const ts = createTypeSystem(catalog, project)
    const text = file.content
    const at = Math.min(offset, text.length)
    const enclosing = file.types.filter((t) => t.bodyStart < at && at <= t.bodyEnd).at(-1) ?? null
    const member = enclosing && [...enclosing.methods, ...enclosing.ctors].find((m) => m.bodyStart !== -1 && m.bodyStart < at && at <= m.bodyEnd)
    return { project, file, ts, text, masked: file.masked, depth: file.depth, at, enclosing, member }
  }

  // ---------- scope ----------
  function locals(ctx) {
    const { masked, depth, at, member } = ctx
    const vars = []
    if (!member) return vars
    for (const p of member.params) vars.push({ name: p.name, type: p.type, kind: 'parameter' })
    const start = member.bodyStart + 1
    const found = []
    const re = /[A-Za-z_$][\w$]*/g
    re.lastIndex = start
    let m
    while ((m = re.exec(masked)) && m.index < at) {
      if (/[\w$.]/.test(masked[m.index - 1] || '')) continue
      const t = readType(masked, m.index)
      if (!t) continue
      const nameAt = skipSpace(masked, t.end)
      const id = readIdent(masked, nameAt)
      if (!id || KEYWORDS.includes(id.name) || id.end > at) continue
      const after = masked[skipSpace(masked, id.end)]
      if (!after || !'=;:,)'.includes(after)) continue
      if (!PRIMITIVES.has(t.type.replace(/\[\]$/, '')) && t.type !== 'var' && /^[a-z]/.test(t.type) && !t.type.includes('.')) {
        // `x y` with a lowercase first word is almost never a declaration (except primitives/var).
        continue
      }
      let type = t.type
      if (type === 'var') type = inferVar(ctx, skipSpace(masked, id.end))
      found.push({ name: id.name, type, index: m.index, kind: 'local' })
      re.lastIndex = id.end
    }
    // Lambda parameters: x -> ..., (a, b) -> ...
    for (const lm of masked.slice(start, at).matchAll(/(?:\(([\w$\s,]*)\)|([A-Za-z_$][\w$]*))\s*->/g)) {
      const names = lm[1] !== undefined ? lm[1].split(',').map((s) => s.trim().split(/\s+/).at(-1)) : [lm[2]]
      for (const name of names.filter(Boolean)) found.push({ name, type: null, index: start + lm.index, kind: 'local' })
    }
    // Keep declarations whose block is still open at the cursor.
    let min = depth[at] ?? 0
    const visibleFrom = new Map()
    for (let i = at - 1; i >= start; i--) {
      if (depth[i] < min) min = depth[i]
      visibleFrom.set(i, min)
    }
    for (const decl of found) {
      if ((visibleFrom.get(decl.index) ?? 0) >= depth[decl.index]) vars.push(decl)
    }
    const seen = new Set()
    return vars.reverse().filter((v) => !seen.has(v.name) && seen.add(v.name)).reverse()
  }

  function inferVar(ctx, eqIndex) {
    const { masked } = ctx
    if (masked[eqIndex] !== '=') return null
    const start = skipSpace(masked, eqIndex + 1)
    if (masked.startsWith('new', start) && /\s/.test(masked[start + 3])) {
      const t = readType(masked, start + 4)
      return t ? t.type.replace(/<>$/, '') : null
    }
    if (masked[start] === '"') return 'String'
    if (/\d/.test(masked[start])) return /^\d+[lL]\b/.test(masked.slice(start)) ? 'long' : /^[\d_]*\.\d|^\d+[dDfF]\b/.test(masked.slice(start)) ? 'double' : 'int'
    return null
  }

  function fieldsAndMethodsOfThis(ctx) {
    if (!ctx.enclosing) return { fields: [], methods: [] }
    const ref = { name: ctx.enclosing.qualifiedName, args: ctx.enclosing.typeParams.map((p) => ({ name: p, args: [], dims: 0 })), dims: 0 }
    const inStatic = ctx.member?.isStatic
    const inst = inStatic ? { fields: [], methods: [] } : mem(ctx, ref, 'instance')
    const stat = mem(ctx, ref, 'static')
    return { fields: [...inst.fields, ...stat.fields], methods: [...inst.methods, ...stat.methods] }
  }

  // ---------- expressions ----------
  // Start index of the expression that ends at `end` (exclusive), e.g. `list.get(0).name`.
  function expressionStart(masked, end) {
    let i = end - 1
    for (;;) {
      while (i >= 0 && /\s/.test(masked[i])) i--
      if (masked[i] === ')' || masked[i] === ']') {
        const open = matchBackward(masked, i)
        if (open < 0) return -1
        i = open - 1
        while (i >= 0 && /[ \t]/.test(masked[i])) i--
        if (/[\w$]/.test(masked[i] || '')) { while (i >= 0 && /[\w$]/.test(masked[i])) i-- }
      } else if (masked[i] === '"') {
        const open = masked.lastIndexOf('"', i - 1)
        if (open < 0) return -1
        i = open - 1
      } else if (/[\w$]/.test(masked[i] || '')) {
        while (i >= 0 && /[\w$]/.test(masked[i])) i--
      } else {
        return -1
      }
      let j = i
      while (j >= 0 && /\s/.test(masked[j])) j--
      if (masked[j] === '.') { i = j - 1; continue }
      const before = masked.slice(Math.max(0, j - 2), j + 1)
      if (before === 'new' && !/[\w$]/.test(masked[j - 3] || '')) return j - 2
      return i + 1
    }
  }

  function splitChain(expr) {
    const parts = []
    let depth = 0
    let start = 0
    for (let i = 0; i < expr.length; i++) {
      const c = expr[i]
      if ('([{'.includes(c)) depth++
      else if (')]}'.includes(c)) depth--
      else if (c === '"') { const close = expr.indexOf('"', i + 1); if (close > 0) i = close }
      else if (c === '.' && depth === 0 && !/^\s*\d+$/.test(expr.slice(start, i))) { parts.push(expr.slice(start, i).trim()); start = i + 1 }
    }
    parts.push(expr.slice(start).trim())
    return parts
  }

  const valueOf = (ref) => (ref ? { ref, mode: 'instance' } : null)

  function resolveName(ctx, name) {
    const local = locals(ctx).find((v) => v.name === name)
    if (local) return local.type ? valueOf(parseTypeRef(local.type)) : null
    const own = fieldsAndMethodsOfThis(ctx).fields.find((f) => f.name === name)
    if (own) return valueOf(own.ref)
    const type = ctx.ts.lookup(name)
    if (type) return { ref: { name: type.qualifiedName, args: [], dims: 0 }, mode: 'static', type }
    return null
  }

  function pickOverload(methods, argText) {
    const count = argText.trim() ? splitTop(argText).length : 0
    return methods.find((m) => m.params.length === count)
      ?? methods.find((m) => m.params.at(-1)?.type?.endsWith('...') && count >= m.params.length - 1)
      ?? methods[0]
  }

  function resolveExpression(ctx, expr) {
    const parts = splitChain(expr)
    let current = null
    for (let k = 0; k < parts.length; k++) {
      let part = parts[k]
      let dims = 0
      while (/\]$/.test(part)) {
        const open = matchBackward(part, part.length - 1)
        if (open < 0) return null
        part = part.slice(0, open).trim()
        dims++
      }
      if (k === 0) {
        if (part.startsWith('"')) current = valueOf({ name: 'String', args: [], dims: 0 })
        else if (part === 'this') current = ctx.enclosing ? valueOf({ name: ctx.enclosing.qualifiedName, args: [], dims: 0 }) : null
        else if (part === 'super') current = ctx.enclosing ? valueOf(ctx.ts.superclassOf(ctx.enclosing.qualifiedName)) : null
        else if (part.startsWith('new ')) {
          const t = readType(part, 4)
          const ref = t && parseTypeRef(t.type.replace(/<>$/, ''))
          // new int[5] / new Dog[3]
          current = ref ? valueOf({ ...ref, dims: ref.dims + (/\[/.test(part.slice(t.end)) ? 1 : 0) }) : null
        } else if (part.startsWith('(')) {
          const close = matchBackward(part, part.length - 1)
          if (close !== 0) return null
          const inner = part.slice(1, -1).trim()
          const cast = /^\(\s*([\w$.<>, [\]?]+?)\s*\)\s*[\w$("]/.exec(inner)
          current = cast ? valueOf(parseTypeRef(cast[1])) : resolveExpression(ctx, inner)
        } else if (/^[\w$]+\s*\(/.test(part)) {
          const name = /^[\w$]+/.exec(part)[0]
          const methods = fieldsAndMethodsOfThis(ctx).methods.filter((m) => m.name === name)
          const method = pickOverload(methods, part.slice(part.indexOf('(') + 1, -1))
          current = method ? valueOf(method.returnsRef) : null
        } else if (/^[\w$]+$/.test(part)) {
          current = resolveName(ctx, part)
          // A package-qualified class name, e.g. java.util.List
          if (!current && /^[a-z]/.test(part)) {
            let q = part
            while (!current && k + 1 < parts.length && /^[\w$]+$/.test(parts[k + 1])) {
              q += `.${parts[++k]}`
              const type = ctx.ts.lookup(q)
              if (type) current = { ref: { name: type.qualifiedName, args: [], dims: 0 }, mode: 'static', type }
            }
          }
        } else return null
      } else {
        if (!current?.ref) return null
        if (/^[\w$]+\s*\(/.test(part)) {
          const name = /^[\w$]+/.exec(part)[0]
          const methods = mem(ctx, current.ref, current.mode).methods
          const method = pickOverload(methods.filter((m) => m.name === name), part.slice(part.indexOf('(') + 1, -1))
          current = method ? valueOf(method.returnsRef) : null
        } else if (/^[\w$]+$/.test(part)) {
          const field = mem(ctx, current.ref, current.mode).fields.find((f) => f.name === part)
          if (field) current = valueOf(field.ref)
          else if (current.mode === 'static') {
            // Nested type: Map.Entry, Outer.Inner
            const nested = ctx.ts.lookup(`${current.ref.name}.${part}`)
            current = nested ? { ref: { name: nested.qualifiedName, args: [], dims: 0 }, mode: 'static', type: nested } : null
          } else current = null
        } else return null
      }
      if (!current) return null
      if (dims) {
        if (!current.ref || current.ref.dims < dims) {
          // list-like indexing is not Java; only arrays.
          return null
        }
        current = valueOf({ ...current.ref, dims: current.ref.dims - dims })
      }
    }
    return current
  }

  // ---------- items ----------
  function signatureLabel(params) {
    return `(${params.map((p) => `${p.ref ? formatTypeRef(p.ref) : p.type} ${p.name}`).join(', ')})`
  }

  function callSnippet(name, params) {
    if (!params.length) return `${name}()`
    return `${name}(${params.map((p, i) => `\${${i + 1}:${p.name.replace(/[$}\\]/g, '')}}`).join(', ')})`
  }

  function methodItem(m, rank = '1') {
    return {
      label: m.name,
      detail: signatureLabel(m.params),
      description: m.returnsRef ? formatTypeRef(m.returnsRef) : m.returns,
      kind: 'method',
      insertText: callSnippet(m.name, m.params),
      snippet: true,
      documentation: [m.doc, m.owner ? `${m.isStatic ? 'static · ' : ''}${m.owner}` : ''].filter(Boolean).join('\n\n'),
      sortText: `${rank}${m.ownerSource === 'jdk' && m.owner === 'Object' ? '9' : '0'}${m.name}`,
      ...(m.params.length ? { triggerSignatureHelp: true } : {}),
    }
  }

  function fieldItem(f, rank = '1') {
    return {
      label: f.name,
      description: f.ref ? formatTypeRef(f.ref) : f.type,
      kind: f.isConstant ? 'constant' : 'field',
      insertText: f.name,
      documentation: [f.doc, f.owner ? `${f.isStatic ? 'static · ' : ''}${f.owner}` : ''].filter(Boolean).join('\n\n'),
      sortText: `${rank}0${f.name}`,
    }
  }

  // Where to insert `import x.y.Z;` (and whether it is needed) in the active file.
  function importEdit(ctx, fqn) {
    const pkg = fqn.slice(0, fqn.lastIndexOf('.'))
    const simple = fqn.slice(fqn.lastIndexOf('.') + 1)
    if (pkg === 'java.lang') return null
    const { imports, pkg: filePkg } = ctx.file
    if (imports.some((imp) => !imp.isStatic && (imp.target === fqn || imp.target === `${pkg}.*`))) return null
    if (ctx.project.types.has(simple)) return null
    if (imports.length) {
      const last = imports.at(-1)
      return { offset: last.end, text: `\nimport ${fqn};` }
    }
    if (filePkg) return { offset: filePkg.end, text: `\n\nimport ${fqn};` }
    return { offset: 0, text: `import ${fqn};\n\n` }
  }

  function typeItems(ctx, { forNew = false } = {}) {
    const items = []
    const seen = new Set()
    for (const [name, type] of ctx.project.types) {
      if (name !== type.qualifiedName || seen.has(type.name)) continue
      if (forNew && (type.kind === 'interface' || type.kind === 'abstract class' || type.kind === 'enum')) continue
      seen.add(type.name)
      items.push(typeItem(ctx, type, forNew, null))
    }
    for (const key of catalog.visible) {
      const type = catalog.get(key)
      if (seen.has(type.name) || seen.has(key)) continue
      if (forNew && (type.kind !== 'class' || !type.ctors.length)) continue
      seen.add(key)
      const outer = key.includes('.') ? key.split('.')[0] : key
      items.push(typeItem(ctx, type, forNew, importEdit(ctx, `${type.pkg}.${outer}`)))
    }
    return items
  }

  function typeItem(ctx, type, forNew, edit) {
    const generic = type.typeParams?.length
    const label = type.qualifiedName
    return {
      label,
      description: type.source === 'jdk' ? type.pkg : `${type.file ?? ''}`,
      kind: type.kind === 'interface' ? 'interface' : type.kind === 'enum' ? 'enum' : 'class',
      insertText: forNew ? `${label}${generic ? '<>' : ''}($0)` : label,
      snippet: forNew,
      documentation: [type.doc, `${type.kind} ${type.pkg ? `${type.pkg}.` : ''}${label}${generic ? `<${type.typeParams.join(', ')}>` : ''}`].filter(Boolean).join('\n\n'),
      sortText: `${KIND_ORDER.class}${type.source === 'project' ? '0' : '1'}${label}`,
      ...(edit ? { importEdit: edit } : {}),
      ...(forNew ? { triggerSignatureHelp: true } : {}),
    }
  }

  function importPathItems(prefix) {
    const base = prefix.includes('.') ? prefix.slice(0, prefix.lastIndexOf('.') + 1) : ''
    const out = new Map()
    for (const key of catalog.visible) {
      const type = catalog.get(key)
      const full = `${type.pkg}.${key}`
      if (!full.startsWith(base)) continue
      const next = full.slice(base.length).split('.')[0]
      const isType = /^[A-Z]/.test(next)
      if (!out.has(next)) out.set(next, { label: next, kind: isType ? 'class' : 'module', insertText: isType ? next : `${next}.`, description: isType ? type.pkg : 'package', sortText: `${isType ? 1 : 0}${next}`, ...(isType ? {} : { retrigger: true }) })
    }
    return [...out.values()]
  }

  function overrideItems(ctx) {
    const type = ctx.enclosing
    if (!type) return []
    const declared = new Set(type.methods.map((m) => `${m.name}/${m.params.length}`))
    const items = []
    const seen = new Set()
    const ref = { name: type.qualifiedName, args: [], dims: 0 }
    for (const { type: sup, bindings } of ctx.ts.hierarchy(ref)) {
      if (sup.qualifiedName === type.qualifiedName) continue
      for (const m of sup.methods ?? []) {
        const key = `${m.name}/${m.params.length}`
        if (m.isStatic || m.isPrivate || declared.has(key) || seen.has(key)) continue
        if (sup.source === 'jdk' && sup.qualifiedName === 'Object' && !['toString', 'equals', 'hashCode'].includes(m.name)) continue
        // With instance fields, the generated toString() (see generatorItems) is the better offer.
        if (sup.qualifiedName === 'Object' && m.name === 'toString' && type.fields.some((f) => !f.isStatic)) continue
        if (sup.source === 'jdk' && sup.qualifiedName !== 'Object' && !(sup.kind === 'interface' && type.implements.some((i) => parseTypeRef(i)?.name === sup.name))) continue
        seen.add(key)
        const params = m.params.map((p) => ({ ...p, ref: ctx.ts.substitute(parseTypeRef(p.type), bindings) }))
        const returns = formatTypeRef(ctx.ts.substitute(parseTypeRef(m.returns), bindings))
        const args = params.map((p) => `${formatTypeRef(p.ref)} ${p.name}`).join(', ')
        const bodyDefault = returns === 'void' ? '$0' : returns === 'boolean' ? 'return ${0:false};' : PRIMITIVES.has(returns) ? 'return ${0:0};' : 'return ${0:null};'
        const call = m.isAbstract || sup.kind === 'interface' ? bodyDefault : `${returns === 'void' ? '' : 'return '}super.${m.name}(${params.map((p) => p.name).join(', ')});$0`
        items.push({
          label: m.name,
          detail: `(${args}) — ${m.isAbstract || sup.kind === 'interface' ? 'implement' : 'override'} ${sup.name}`,
          description: returns,
          kind: 'method',
          insertText: `@Override\npublic ${returns} ${m.name}(${args.replace(/[$}\\]/g, '\\$&')}) {\n\t${call}\n}`,
          snippet: true,
          documentation: m.doc || '',
          sortText: `0${m.name}`,
        })
      }
    }
    return items
  }

  function generatorItems(ctx) {
    const type = ctx.enclosing
    if (!type || type.kind === 'interface' || type.kind === 'record') return []
    const items = []
    const has = (name, n) => type.methods.some((m) => m.name === name && m.params.length === n)
    const fields = type.fields.filter((f) => !f.isStatic)
    for (const f of fields) {
      const cap = f.name[0].toUpperCase() + f.name.slice(1)
      const getter = `${f.type === 'boolean' ? 'is' : 'get'}${cap}`
      if (!has(getter, 0)) items.push({ label: getter, detail: '() — generate getter', description: f.type, kind: 'snippet', insertText: `public ${f.type} ${getter}() {\n\treturn ${f.name};\n}`, snippet: true, sortText: `0${getter}` })
      if (!has(`set${cap}`, 1) && !f.isConstant) items.push({ label: `set${cap}`, detail: `(${f.type} ${f.name}) — generate setter`, description: 'void', kind: 'snippet', insertText: `public void set${cap}(${f.type} ${f.name}) {\n\tthis.${f.name} = ${f.name};\n}`, snippet: true, sortText: `0set${cap}` })
    }
    const ctorArgs = fields.map((f) => `${f.type} ${f.name}`).join(', ')
    items.push({
      label: 'ctor',
      detail: `${type.name}(${ctorArgs}) — generate constructor`,
      kind: 'snippet',
      // Enum constructors cannot be public.
      insertText: `${type.kind === 'enum' ? '' : 'public '}${type.name}(${ctorArgs}) {\n${fields.map((f) => `\tthis.${f.name} = ${f.name};`).join('\n')}${fields.length ? '\n' : ''}\t$0\n}`,
      snippet: true,
      sortText: '0ctor',
    })
    if (!has('toString', 0)) {
      const body = fields.length ? `"${type.name}{" + ${fields.map((f, i) => `"${i ? ', ' : ''}${f.name}=" + ${f.name}`).join(' + ')} + "}"` : `"${type.name}{}"`
      items.push({ label: 'toString', detail: '() — generate toString()', description: 'String', kind: 'snippet', insertText: `@Override\npublic String toString() {\n\treturn ${body.replace(/\$/g, '\\$')};\n}`, snippet: true, sortText: '0toString' })
    }
    return items
  }

  // ---------- public API ----------
  function complete(input) {
    const { content = '', offset } = input
    if (inCommentOrString(content, offset)) return { items: [] }
    const ctx = context(input)
    const { masked, at } = ctx
    const word = /[\w$]*$/.exec(masked.slice(0, at))[0]
    const wordStart = at - word.length
    const before = masked.slice(0, wordStart)
    const line = before.slice(before.lastIndexOf('\n') + 1)

    const importLine = /^\s*import\s+(static\s+)?([\w$.]*)$/.exec(line + word)
    if (importLine) return { items: importPathItems(importLine[2]), wordStart }
    if (/^\s*package\s+[\w$.]*$/.test(line + word)) return { items: [], wordStart }

    const dot = /\.\s*$/.exec(before)
    if (dot) {
      const exprEnd = before.length - dot[0].length
      const start = expressionStart(masked, exprEnd)
      if (start < 0) return { items: [], wordStart }
      const expr = masked.slice(start, exprEnd).replace(/\s+/g, ' ').trim()
      if (/^\d+$/.test(expr)) return { items: [], wordStart }
      const value = resolveExpression(ctx, expr)
      if (!value?.ref) return { items: [], wordStart }
      const { fields, methods } = mem(ctx, value.ref, value.mode)
      const items = [...fields.map((f) => fieldItem(f)), ...methods.map((m) => methodItem(m))]
      if (value.mode === 'static') {
        items.push({ label: 'class', kind: 'keyword', insertText: 'class', sortText: '8class' })
        if (value.type?.kind !== 'interface' && ctx.enclosing && ctx.member && value.ref.name === ctx.enclosing.qualifiedName) items.push({ label: 'this', kind: 'keyword', insertText: 'this', sortText: '8this' })
      }
      return { items, wordStart }
    }

    if (/\bnew\s+$/.test(before)) return { items: typeItems(ctx, { forNew: true }), wordStart }
    // Right after a type in a declaration (`Dog |`): suggest a variable name.
    const typed = /([A-Z][\w$]*)(?:<[^<>]*>)?(\[\])?\s+$/.exec(before)
    if (typed && !/\b(new|return|throw|instanceof|case|extends|implements|throws|permits|import)\s+[\w$<>[\], .]*$/.test(before.slice(-120)) && ctx.ts.lookup(typed[1])) {
      const base = typed[1][0].toLowerCase() + typed[1].slice(1)
      return { items: [{ label: typed[2] ? `${base}s` : base, kind: 'variable', insertText: typed[2] ? `${base}s` : base, sortText: '0' }], wordStart }
    }

    const items = []
    const inMethod = Boolean(ctx.member)
    const inClassBody = !inMethod && Boolean(ctx.enclosing)
    if (inMethod) {
      for (const v of locals(ctx)) {
        items.push({ label: v.name, description: v.type ?? '', kind: 'variable', insertText: v.name, sortText: `0${v.name}` })
      }
      const own = fieldsAndMethodsOfThis(ctx)
      items.push(...own.fields.map((f) => fieldItem(f)), ...own.methods.map((m) => methodItem(m)))
      if (!ctx.member.isStatic) items.push({ label: 'this', kind: 'keyword', insertText: 'this', sortText: '5this' }, { label: 'super', kind: 'keyword', insertText: 'super', sortText: '5super' })
    }
    if (inClassBody) items.push(...overrideItems(ctx), ...generatorItems(ctx))
    items.push(...typeItems(ctx))
    const where = inMethod ? 'method' : inClassBody ? 'class' : 'top'
    for (const t of TEMPLATES) {
      if (t.where !== where) continue
      const edits = (t.imports ?? []).map((fqn) => importEdit(ctx, fqn)).filter(Boolean)
      items.push({ label: t.label, detail: t.detail, kind: 'snippet', insertText: t.body, snippet: true, sortText: `4${t.label}`, ...(edits[0] ? { importEdit: edits[0] } : {}) })
    }
    for (const k of KEYWORDS) {
      if (k === 'this' || k === 'super') continue
      items.push({ label: k, kind: 'keyword', insertText: k, sortText: `5${k}` })
    }
    return { items, wordStart }
  }

  // Innermost unclosed `(` before the cursor and the callee in front of it.
  function signatureHelp(input) {
    const { content = '', offset } = input
    if (inCommentOrString(content, offset)) return null
    const ctx = context(input)
    const { masked, at } = ctx
    let depth = 0
    let open = -1
    let commas = 0
    for (let i = at - 1; i >= 0; i--) {
      const c = masked[i]
      if (c === ';' || c === '{' || c === '}') break
      if (c === ')' || c === ']') depth++
      else if (c === '(' || c === '[') {
        if (depth === 0) { if (c === '(') open = i; break }
        depth--
      } else if (c === ',' && depth === 0) commas++
    }
    if (open < 0) return null
    let j = open - 1
    while (j >= 0 && /\s/.test(masked[j])) j--
    const nameEnd = j + 1
    while (j >= 0 && /[\w$]/.test(masked[j])) j--
    const name = masked.slice(j + 1, nameEnd)
    if (!name || ['if', 'for', 'while', 'switch', 'catch', 'synchronized', 'return'].includes(name)) return null
    let k = j
    while (k >= 0 && /\s/.test(masked[k])) k--
    let overloads = []
    let title = name
    const isNew = masked.slice(Math.max(0, k - 2), k + 1) === 'new' && !/[\w$]/.test(masked[k - 3] || '')
    if (isNew) {
      overloads = ctx.ts.constructors(parseTypeRef(name)).map((c) => ({ ...c, name }))
    } else if (name === 'super' || name === 'this') {
      const target = name === 'this' ? ctx.enclosing && { name: ctx.enclosing.qualifiedName, args: [], dims: 0 } : ctx.enclosing && ctx.ts.superclassOf(ctx.enclosing.qualifiedName)
      overloads = target ? ctx.ts.constructors(target).map((c) => ({ ...c, name: target.name })) : []
      title = target?.name ?? name
    } else if (masked[k] === '.') {
      const start = expressionStart(masked, k)
      const value = start >= 0 && resolveExpression(ctx, masked.slice(start, k).replace(/\s+/g, ' ').trim())
      if (value?.ref) overloads = (mem(ctx, value.ref, value.mode)).methods.filter((m) => m.name === name)
    } else {
      overloads = fieldsAndMethodsOfThis(ctx).methods.filter((m) => m.name === name)
    }
    if (!overloads.length) return null
    const signatures = overloads.map((m) => ({
      label: `${m.returnsRef ? `${formatTypeRef(m.returnsRef)} ` : m.returns ? `${m.returns} ` : ''}${m.name ?? title}${signatureLabel(m.params)}`,
      parameters: m.params.map((p) => ({ label: `${p.ref ? formatTypeRef(p.ref) : p.type} ${p.name}` })),
      documentation: m.doc || '',
    }))
    const active = overloads.findIndex((m) => m.params.length > commas || m.params.at(-1)?.type?.endsWith('...'))
    return { signatures, activeSignature: Math.max(0, active), activeParameter: commas }
  }

  function hover(input) {
    const { content = '', offset } = input
    if (inCommentOrString(content, offset)) return null
    const ctx = context(input)
    const { masked } = ctx
    let s = offset
    let e = offset
    while (s > 0 && /[\w$]/.test(masked[s - 1])) s--
    while (e < masked.length && /[\w$]/.test(masked[e])) e++
    const name = masked.slice(s, e)
    if (!name || KEYWORDS.includes(name) || /^\d/.test(name)) return null
    const range = { start: s, end: e }
    const isCall = masked[skipSpace(masked, e)] === '('
    let k = s - 1
    while (k >= 0 && /\s/.test(masked[k])) k--
    const hoverCtx = { ...ctx, at: s }
    hoverCtx.member = ctx.member
    if (masked[k] === '.') {
      const start = expressionStart(masked, k)
      const value = start >= 0 && resolveExpression(hoverCtx, masked.slice(start, k).replace(/\s+/g, ' ').trim())
      if (!value?.ref) return null
      const { fields, methods } = mem(ctx, value.ref, value.mode)
      if (isCall) {
        const list = methods.filter((m) => m.name === name)
        if (list.length) return { range, contents: describeMethods(list) }
      }
      const field = fields.find((f) => f.name === name)
      if (field) return { range, contents: [`${field.isStatic ? 'static ' : ''}${formatTypeRef(field.ref)} ${field.owner}.${name}`, field.doc].filter(Boolean) }
      const nested = value.mode === 'static' && ctx.ts.lookup(`${value.ref.name}.${name}`)
      return nested ? { range, contents: describeType(nested) } : null
    }
    if (isCall) {
      const list = fieldsAndMethodsOfThis(hoverCtx).methods.filter((m) => m.name === name)
      if (list.length) return { range, contents: describeMethods(list) }
    }
    const local = locals(hoverCtx).find((v) => v.name === name)
    if (local) return { range, contents: [`${local.kind === 'parameter' ? 'parameter' : 'local variable'} ${local.type ?? 'var'} ${name}`] }
    const field = fieldsAndMethodsOfThis(hoverCtx).fields.find((f) => f.name === name)
    if (field) return { range, contents: [`${field.isStatic ? 'static ' : ''}${formatTypeRef(field.ref)} ${field.owner}.${name}`, field.doc].filter(Boolean) }
    const type = ctx.ts.lookup(name)
    return type ? { range, contents: describeType(type) } : null
  }

  function describeMethods(list) {
    const first = list[0]
    const sigs = list.map((m) => `${m.isStatic ? 'static ' : ''}${m.returnsRef ? formatTypeRef(m.returnsRef) : m.returns} ${m.owner ? `${m.owner}.` : ''}${m.name}${signatureLabel(m.params)}`)
    return [sigs.join('\n'), first.doc].filter(Boolean)
  }

  function describeType(type) {
    const generic = type.typeParams?.length ? `<${type.typeParams.join(', ')}>` : ''
    const supers = (type.supers ?? []).filter((s) => s !== 'Object')
    return [`${type.kind} ${type.pkg ? `${type.pkg}.` : ''}${type.qualifiedName}${generic}${supers.length ? ` extends/implements ${supers.join(', ')}` : ''}`, type.doc].filter(Boolean)
  }

  // Import edit for an unknown simple class name, when the catalog knows it.
  function importFix(input, simpleName) {
    const type = catalog.get(simpleName)
    if (!type || type.hidden || type.pkg === 'java.lang') return null
    const ctx = context({ ...input, offset: 0 })
    const outer = type.qualifiedName.split('.')[0]
    const fqn = `${type.pkg}.${outer}`
    const edit = importEdit(ctx, fqn)
    return edit ? { fqn, edit } : null
  }

  return { complete, signatureHelp, hover, importFix, catalog }
}
