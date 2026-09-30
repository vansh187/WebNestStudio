// Multi-file Java projects for the playground. The runner compiles a single source file,
// so a project is bundled into one compilation unit in a single package: imports are hoisted
// and de-duplicated, and top-level `public` modifiers are removed (one file may hold many
// package-private classes). Line numbers in compiler errors and stack traces are then
// mapped back to the file the user actually wrote.

const JAVA_KEYWORDS = new Set(('abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while true false null var record yield sealed permits').split(' '))

export const JAVA_FILE_KINDS = [
  { id: 'class', label: 'Class' },
  { id: 'main', label: 'Class with main()' },
  { id: 'abstract', label: 'Abstract class' },
  { id: 'interface', label: 'Interface' },
  { id: 'enum', label: 'Enum' },
  { id: 'record', label: 'Record' },
]


// Multi-file starter showing classes, an interface, inheritance and object references.
export const JAVA_OOP_EXAMPLE = [
  { name: 'Main.java', language: 'java', content: 'import java.util.ArrayList;\nimport java.util.List;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<Animal> animals = new ArrayList<>();\n        animals.add(new Dog("Rex"));\n        animals.add(new Cat("Luna"));\n\n        Owner owner = new Owner("Asha", animals);\n        owner.introducePets();\n    }\n}\n' },
  { name: 'Animal.java', language: 'java', content: 'public abstract class Animal implements Speaker {\n    protected final String name;\n\n    public Animal(String name) {\n        this.name = name;\n    }\n\n    public String getName() {\n        return name;\n    }\n\n    @Override\n    public String toString() {\n        return name + " says " + speak();\n    }\n}\n' },
  { name: 'Speaker.java', language: 'java', content: 'public interface Speaker {\n    String speak();\n}\n' },
  { name: 'Dog.java', language: 'java', content: 'public class Dog extends Animal {\n    public Dog(String name) {\n        super(name);\n    }\n\n    @Override\n    public String speak() {\n        return "Woof!";\n    }\n}\n' },
  { name: 'Cat.java', language: 'java', content: 'public class Cat extends Animal {\n    public Cat(String name) {\n        super(name);\n    }\n\n    @Override\n    public String speak() {\n        return "Meow!";\n    }\n}\n' },
  { name: 'Owner.java', language: 'java', content: 'import java.util.List;\n\npublic class Owner {\n    private final String name;\n    private final List<Animal> pets;\n\n    public Owner(String name, List<Animal> pets) {\n        this.name = name;\n        this.pets = pets;\n    }\n\n    public void introducePets() {\n        System.out.println(name + " has " + pets.size() + " pets:");\n        for (Animal pet : pets) {\n            System.out.println(" - " + pet);\n        }\n    }\n}\n' },
]

export function isJavaFile(file) {
  return /\.java$/i.test(file?.name || '')
}

export function javaClassFromFile(name) {
  return String(name || '').replace(/\.java$/i, '')
}

// Returns an error message, or '' when `raw` can name a new class in `files`.
export function validateJavaClassName(raw, files = [], currentName = null) {
  const name = javaClassFromFile(String(raw || '').trim())
  if (!name) return 'Enter a class name.'
  if (!/^[A-Za-z_$][\w$]*$/.test(name)) return 'Use letters, digits and _ only, starting with a letter (for example Dog or BankAccount).'
  if (JAVA_KEYWORDS.has(name)) return `"${name}" is a Java keyword.`
  const taken = files.some((file) => file.name !== currentName && javaClassFromFile(file.name).toLowerCase() === name.toLowerCase())
  if (taken) return `${name}.java already exists.`
  return ''
}

export function javaFileTemplate(className, kind = 'class') {
  switch (kind) {
    case 'main':
      return `public class ${className} {\n    public static void main(String[] args) {\n        \n    }\n}\n`
    case 'abstract':
      return `public abstract class ${className} {\n\n    public abstract void describe();\n}\n`
    case 'interface':
      return `public interface ${className} {\n\n}\n`
    case 'enum':
      return `public enum ${className} {\n    \n}\n`
    case 'record':
      return `public record ${className}() {\n}\n`
    default:
      return `public class ${className} {\n\n    public ${className}() {\n    }\n}\n`
  }
}

// Replace comments and string/char/text-block contents with spaces (newlines kept) so
// regexes and brace counting only see real code. Output has the same length as the input.
export function maskJava(code) {
  const out = code.split('')
  const blank = (from, to) => { for (let k = from; k < to; k++) if (out[k] !== '\n') out[k] = ' ' }
  let i = 0
  while (i < code.length) {
    const c = code[i]
    const next = code[i + 1]
    if (c === '/' && next === '/') {
      const end = code.indexOf('\n', i)
      const stop = end === -1 ? code.length : end
      blank(i, stop); i = stop
    } else if (c === '/' && next === '*') {
      const end = code.indexOf('*/', i + 2)
      const stop = end === -1 ? code.length : end + 2
      blank(i, stop); i = stop
    } else if (c === '"' && code.startsWith('"""', i)) {
      let j = i + 3
      while (j < code.length && !code.startsWith('"""', j)) j += code[j] === '\\' ? 2 : 1
      const stop = Math.min(code.length, j + 3)
      blank(i + 1, stop - 1); i = stop
    } else if (c === '"' || c === '\'') {
      let j = i + 1
      while (j < code.length && code[j] !== c && code[j] !== '\n') j += code[j] === '\\' ? 2 : 1
      blank(i + 1, j); i = j + 1
    } else {
      i += 1
    }
  }
  return out.join('')
}

export function braceDepths(masked) {
  const depth = new Int32Array(masked.length + 1)
  let d = 0
  for (let i = 0; i < masked.length; i++) {
    depth[i] = d
    if (masked[i] === '{') d += 1
    else if (masked[i] === '}') d = Math.max(0, d - 1)
  }
  depth[masked.length] = d
  return depth
}

function lineOf(text, index) {
  let line = 1
  for (let i = 0; i < index; i++) if (text[i] === '\n') line += 1
  return line
}

// Top-level type declarations with the range of their bodies.
function topLevelTypes(masked, depth) {
  const types = []
  const re = /\b(class|interface|enum|record)\s+([A-Za-z_$][\w$]*)/g
  let m
  while ((m = re.exec(masked))) {
    if (depth[m.index] !== 0) continue
    // `x.class` is a class literal, not a declaration.
    if (/\.\s*$/.test(masked.slice(Math.max(0, m.index - 20), m.index))) continue
    const open = masked.indexOf('{', m.index)
    if (open === -1) continue
    let close = open + 1
    while (close < masked.length && depth[close + 1] > 0) close += 1
    types.push({ kind: m[1], name: m[2], start: m.index, bodyStart: open, bodyEnd: close })
    re.lastIndex = close
  }
  return types
}

// Classes that declare `public static void main(String[] ...)`, in file order.
export function findJavaMainClasses(files = []) {
  const found = []
  for (const file of files.filter(isJavaFile)) {
    const masked = maskJava(file.content || '')
    const depth = braceDepths(masked)
    const types = topLevelTypes(masked, depth)
    const re = /\bstatic\s+(?:final\s+)?void\s+main\s*\(\s*(?:final\s+)?String\s*(?:\[\s*\]\s*[\w$]+|\.\.\.\s*[\w$]+|[\w$]+\s*\[\s*\])\s*\)/g
    let m
    while ((m = re.exec(masked))) {
      const owner = types.find((type) => m.index > type.bodyStart && m.index < type.bodyEnd)
      if (owner && !found.includes(owner.name)) found.push(owner.name)
    }
  }
  return found
}

export function packageOf(masked, depth) {
  const m = /\bpackage\s+([\w$.]+)\s*;/.exec(masked)
  return m && depth[m.index] === 0 ? { name: m[1], index: m.index, end: m.index + m[0].length } : null
}

// Package-qualified name of a top-level class, e.g. "practice.Main" (the runner needs it for
// single-file sources that declare a package).
export function qualifiedJavaClass(files, simpleName) {
  for (const file of files.filter(isJavaFile)) {
    const masked = maskJava(file.content || '')
    const depth = braceDepths(masked)
    if (topLevelTypes(masked, depth).some((type) => type.name === simpleName)) {
      const pkg = packageOf(masked, depth)
      return pkg ? `${pkg.name}.${simpleName}` : simpleName
    }
  }
  return simpleName
}

const escapeRe = (text) => text.replace(/[.$]/g, '\\$&')

// Uses of a simple name as code, not as a member access such as `x.Name`.
function mentions(masked, name) {
  return [...masked.matchAll(new RegExp(`(?<![\\w$.])${escapeRe(name)}(?![\\w$])`, 'g'))].map((m) => m.index)
}

// Bundle the project's .java files into one source. Returns { code, className, fileName, lineMap }
// where lineMap[i] = { file, line } for bundled line i + 1.
//
// The bundle keeps one named package (the main class's), because classes in the unnamed
// package cannot be imported: `import static app.Util.square;` and `import app.Outer.Inner;`
// are rewritten to that package instead of dropped. Imports are shared by the whole bundle,
// so a single-type import that another file would read differently (java.util.Date vs
// java.sql.Date, or a project class with the same name) is replaced by its qualified name
// in the importing file only.
export function bundleJavaProject(files, mainClass) {
  const javaFiles = files.filter(isJavaFile)
  const mainName = String(mainClass || '').split('.').at(-1) || findJavaMainClasses(javaFiles)[0] || 'Main'

  const parsed = javaFiles.map((file) => {
    const content = String(file.content || '').replace(/\r\n?/g, '\n')
    const masked = maskJava(content)
    const depth = braceDepths(masked)
    const pkg = packageOf(masked, depth)
    const imports = []
    for (const m of masked.matchAll(/\bimport\s+(static\s+)?([\w$.]+(?:\.\*)?)\s*;/g)) {
      if (depth[m.index] !== 0) continue
      imports.push({ isStatic: Boolean(m[1]), target: m[2], index: m.index, end: m.index + m[0].length, line: lineOf(content, m.index) })
    }
    // Code only: package and import statements blanked out.
    const code = masked.split('')
    for (const range of [pkg, ...imports].filter(Boolean)) {
      for (let k = range.index; k < range.end; k++) if (code[k] !== '\n') code[k] = ' '
    }
    return { file, content, masked, depth, pkg, imports, code: code.join(''), types: topLevelTypes(masked, depth).map((t) => t.name) }
  })

  const projectPackages = [...new Set(parsed.map((p) => p.pkg?.name).filter(Boolean))].sort((a, b) => b.length - a.length)
  const mainFile = parsed.find((p) => p.types.includes(mainName))
  const bundlePackage = mainFile?.pkg?.name || projectPackages[0] || ''
  const projectTypes = new Set(parsed.flatMap((p) => p.types))
  const projectPackageOf = (name) => projectPackages.find((pkg) => name.startsWith(`${pkg}.`))

  // Resolve each import: null = drop (same package now), otherwise the name to import.
  for (const p of parsed) {
    for (const imp of p.imports) {
      const pkg = projectPackageOf(imp.target)
      if (!pkg) { imp.resolved = imp.target; continue }
      const rest = imp.target.slice(pkg.length + 1)
      imp.resolved = !imp.isStatic && (rest === '*' || !rest.includes('.')) ? null : `${bundlePackage}.${rest}`
    }
  }
  const sameImport = (p, imp) => p.imports.some((other) => !other.isStatic && other.resolved === imp.resolved)

  const hoisted = new Map()
  const bodies = parsed.map((p) => {
    const edits = []
    for (const imp of p.imports) {
      if (!imp.resolved) continue
      const simple = imp.resolved.split('.').at(-1)
      const singleType = !imp.isStatic && simple !== '*'
      const clashes = singleType && (
        (projectTypes.has(simple) && !imp.resolved.startsWith(`${bundlePackage}.`))
        || parsed.some((other) => other !== p && !sameImport(other, imp) && mentions(other.code, simple).length)
      )
      if (clashes) {
        for (const index of mentions(p.code, simple)) edits.push({ index, length: simple.length, text: imp.resolved })
        continue
      }
      const statement = `import ${imp.isStatic ? 'static ' : ''}${imp.resolved};`
      if (!hoisted.has(statement)) hoisted.set(statement, { file: p.file.name, line: imp.line })
    }
    // Fully qualified references to project packages, e.g. `app.models.Dog`.
    for (const pkg of projectPackages) {
      if (pkg === bundlePackage) continue
      for (const m of p.code.matchAll(new RegExp(`(?<![\\w$.])${escapeRe(pkg)}\\.(?=[A-Za-z_$])`, 'g'))) {
        if (!edits.some((e) => m.index >= e.index && m.index < e.index + e.length)) edits.push({ index: m.index, length: pkg.length, text: bundlePackage })
      }
    }

    const chars = p.content.split('')
    const blank = (from, to) => { for (let k = from; k < to; k++) if (chars[k] !== '\n') chars[k] = ' ' }
    for (const range of [p.pkg, ...p.imports].filter(Boolean)) blank(range.index, range.end)
    for (const m of p.masked.matchAll(/\bpublic\b/g)) {
      if (p.depth[m.index] === 0) blank(m.index, m.index + 6)
    }
    let text = chars.join('')
    for (const edit of edits.sort((a, b) => b.index - a.index)) {
      text = text.slice(0, edit.index) + edit.text + text.slice(edit.index + edit.length)
    }
    return { file: p.file, text: text.replace(/[ \t]+$/gm, '') }
  })

  const lineMap = []
  const lines = []
  if (bundlePackage) {
    const owner = parsed.find((p) => p.pkg?.name === bundlePackage)
    lines.push(`package ${bundlePackage};`)
    lineMap.push({ file: owner.file.name, line: lineOf(owner.content, owner.pkg.index) })
  }
  for (const [statement, origin] of hoisted) {
    lines.push(statement)
    lineMap.push(origin)
  }
  for (const { file, text } of bodies) {
    text.split('\n').forEach((line, index) => {
      lines.push(line)
      lineMap.push({ file: file.name, line: index + 1 })
    })
  }

  return {
    code: `${lines.join('\n')}\n`,
    className: bundlePackage ? `${bundlePackage}.${mainName}` : mainName,
    fileName: `${mainName}.java`,
    lineMap,
  }
}

// Rewrite "Main.java:12" references in runner output to the user's own file and line.
export function mapJavaDiagnostics(text, bundle) {
  if (!text || !bundle) return text
  const escaped = bundle.fileName.replace(/[.$]/g, '\\$&')
  return text.replace(new RegExp(`(^|[^\\w$])${escaped}:(\\d+)`, 'g'), (match, before, line) => {
    const origin = bundle.lineMap[Number(line) - 1]
    return origin ? `${before}${origin.file}:${origin.line}` : match
  })
}

// Rename a class file and every code reference to the class across the project
// (strings and comments are left alone).
export function renameJavaFile(files, oldName, newClassName) {
  const oldClass = javaClassFromFile(oldName)
  const re = new RegExp(`(?<![\\w$])${oldClass.replace(/\$/g, '\\$')}(?![\\w$])`, 'g')
  return files.map((file) => {
    if (!isJavaFile(file)) return file
    const content = file.content || ''
    const masked = maskJava(content)
    let next = ''
    let last = 0
    let m
    while ((m = re.exec(masked))) {
      next += content.slice(last, m.index) + newClassName
      last = m.index + oldClass.length
    }
    next += content.slice(last)
    return { ...file, name: file.name === oldName ? `${newClassName}.java` : file.name, content: next }
  })
}
