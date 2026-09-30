// One view over project types and JDK catalog types, with generic substitution along the
// supertype chain (ArrayList<Dog> -> List<Dog> -> Collection<Dog> ...).
import { supertypesOf } from './projectIndex.js'
import { formatTypeRef, parseTypeRef, PRIMITIVES } from './syntax.js'

function fromCatalog(name, entry) {
  const param = (types, names) => types.map((type, i) => ({ type, name: names?.[i] ?? `arg${i}` }))
  return {
    name: name.split('.').at(-1),
    qualifiedName: name,
    pkg: entry.pkg,
    kind: entry.kind,
    typeParams: entry.tp ?? [],
    supers: entry.sup ?? [],
    fields: (entry.f ?? []).map((f) => ({ name: f.n, type: f.t, isStatic: Boolean(f.s), isConstant: Boolean(f.s) && /^[A-Z_\d]+$/.test(f.n), doc: '' })),
    methods: (entry.m ?? []).map((m) => ({ name: m.n, returns: m.r, params: param(m.p, m.pn), isStatic: Boolean(m.s), typeParams: m.tp ?? [], doc: m.d ?? '' })),
    ctors: (entry.c ?? []).map((c) => ({ params: param(c.p, c.pn), doc: c.d ?? '' })),
    hidden: Boolean(entry.hidden),
    source: 'jdk',
  }
}

export function createCatalog(json) {
  const raw = json?.classes ?? {}
  const cache = new Map()
  const bySimple = new Map()
  for (const key of Object.keys(raw)) {
    const simple = key.split('.').at(-1)
    if (!bySimple.has(simple)) bySimple.set(simple, key)
  }
  const get = (name) => {
    const key = raw[name] ? name : bySimple.get(name)
    if (!key) return null
    if (!cache.has(key)) cache.set(key, fromCatalog(key, raw[key]))
    return cache.get(key)
  }
  const visible = Object.keys(raw).filter((key) => !raw[key].hidden)
  return { get, visible, raw }
}

export function createTypeSystem(catalog, project) {
  const lookup = (name) => {
    if (!name || PRIMITIVES.has(name)) return null
    const clean = name.replace(/^java\.\w+\.(?:\w+\.)*(?=[A-Z])/, '')
    const own = project.types.get(clean) ?? project.types.get(clean.split('.').at(-1))
    if (own) return { ...own, supers: supertypesOf(own) }
    return catalog.get(clean) ?? catalog.get(clean.split('.').at(-1))
  }

  // Replace type variables in `ref` using `bindings` (name -> ref).
  const substitute = (ref, bindings) => {
    if (!ref) return null
    if (ref.name === '?') return { ...ref, bound: substitute(ref.bound, bindings) }
    const bound = !ref.args?.length && bindings?.get(ref.name)
    if (bound) return { ...bound, dims: (bound.dims || 0) + (ref.dims || 0) }
    return { ...ref, args: (ref.args ?? []).map((a) => substitute(a, bindings)) }
  }

  // A value typed `? extends Dog` behaves like a Dog; `?` / `? super X` like Object.
  const concrete = (ref) => {
    if (ref?.name !== '?') return ref
    return ref.boundKind === 'extends' && ref.bound ? concrete(ref.bound) : { name: 'Object', args: [], dims: ref.dims || 0 }
  }

  const bindingsFor = (type, ref) => {
    const map = new Map()
    type.typeParams.forEach((param, i) => {
      if (ref?.args?.[i]) map.set(param, ref.args[i])
    })
    return map
  }

  // Walk ref's type and its supertypes, most derived first.
  function* hierarchy(ref) {
    const seen = new Set()
    const queue = [ref]
    let sawObject = false
    while (queue.length) {
      const current = queue.shift()
      const type = lookup(current.name)
      if (!type || seen.has(type.qualifiedName)) continue
      seen.add(type.qualifiedName)
      if (type.qualifiedName === 'Object') sawObject = true
      const bindings = bindingsFor(type, current)
      yield { type, bindings }
      for (const sup of type.supers ?? []) queue.push(substitute(parseTypeRef(sup), bindings))
    }
    if (!sawObject) {
      const object = lookup('Object')
      if (object) yield { type: object, bindings: new Map() }
    }
  }

  const resolveType = (typeText, bindings) => substitute(parseTypeRef(typeText), bindings)

  // Members visible on a value of type `ref`. `mode`: 'instance' | 'static'. `from` is the
  // top-level class doing the access: private project members are hidden from other classes.
  function members(ref, mode = 'instance', from = null) {
    ref = concrete(ref)
    if (!ref) return { fields: [], methods: [] }
    const hidden = (member, type) => member.isPrivate && type.source === 'project' && type.qualifiedName.split('.')[0] !== from
    if (ref.dims > 0) {
      const object = members({ name: 'Object', args: [], dims: 0 })
      return { fields: [{ name: 'length', type: 'int', ref: { name: 'int', args: [], dims: 0 }, owner: 'array', doc: 'The number of elements in this array.' }], methods: object.methods }
    }
    const fields = []
    const methods = []
    const seenMethods = new Set()
    const seenFields = new Set()
    for (const { type, bindings } of hierarchy(ref)) {
      for (const field of type.fields ?? []) {
        if (seenFields.has(field.name) || (mode === 'static') !== Boolean(field.isStatic) || hidden(field, type)) continue
        seenFields.add(field.name)
        fields.push({ ...field, ref: resolveType(field.type, bindings), owner: type.qualifiedName, ownerSource: type.source })
      }
      for (const method of type.methods ?? []) {
        if ((mode === 'static') !== Boolean(method.isStatic) || hidden(method, type)) continue
        // Static members are not inherited from interfaces.
        if (mode === 'static' && type.kind === 'interface' && type.qualifiedName !== ref.name) continue
        const params = method.params.map((p) => ({ ...p, ref: resolveType(p.type, bindings) }))
        const key = `${method.name}(${params.map((p) => formatTypeRef(p.ref)).join(',')})`
        if (seenMethods.has(key)) continue
        seenMethods.add(key)
        methods.push({
          ...method,
          params,
          returnsRef: method.typeParams?.includes(parseTypeRef(method.returns)?.name) ? null : resolveType(method.returns, bindings),
          owner: type.qualifiedName,
          ownerSource: type.source,
        })
      }
      if (mode === 'static') break
    }
    return { fields, methods }
  }

  function constructors(ref) {
    ref = concrete(ref)
    const type = lookup(ref?.name)
    if (!type) return []
    const bindings = bindingsFor(type, ref)
    const ctors = type.ctors?.length ? type.ctors : (type.source === 'project' && type.kind !== 'interface' ? [{ params: [], doc: '' }] : [])
    return ctors.map((c) => ({ ...c, params: c.params.map((p) => ({ ...p, ref: resolveType(p.type, bindings) })) }))
  }

  const superclassOf = (typeName) => {
    const type = lookup(typeName)
    if (!type) return null
    const sup = (type.supers ?? []).find((s) => lookup(parseTypeRef(s)?.name)?.kind?.includes('class'))
    return sup ? parseTypeRef(sup) : { name: 'Object', args: [], dims: 0 }
  }

  return { lookup, members, constructors, hierarchy, superclassOf, substitute }
}
