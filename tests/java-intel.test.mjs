import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createJavaIntel } from '../src/lib/codelab/javaIntel/engine.js'
import { parseJavacDiagnostics } from '../src/lib/codelab/javaIntel/diagnostics.js'
import { JAVA_OOP_EXAMPLE } from '../src/lib/codelab/javaProject.js'

const intel = createJavaIntel(JSON.parse(readFileSync(new URL('../src/data/java/jdkCatalog.json', import.meta.url), 'utf8')))
const files = JAVA_OOP_EXAMPLE

// `|` marks the cursor.
function run(fn, activeName, src, extraFiles = files) {
  const offset = src.indexOf('|')
  return intel[fn]({ files: extraFiles, activeName, content: src.replace('|', ''), offset })
}
const labels = (src, name = 'Main.java', extra) => run('complete', name, src, extra).items.map((i) => i.label)
const item = (src, label, name = 'Main.java') => run('complete', name, src).items.find((i) => i.label === label)
const main = (body) => `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<Animal> animals = new ArrayList<>();\n        Dog dog = new Dog("Rex");\n        Owner owner = new Owner("Asha", animals);\n        ${body}\n    }\n}\n`

test('dot completion lists own and inherited members, hiding other classes\' private members', () => {
  const dog = labels(main('dog.|'))
  for (const name of ['speak', 'getName', 'name', 'toString', 'equals']) assert.ok(dog.includes(name), name)
  const owner = labels(main('owner.|'))
  assert.ok(owner.includes('introducePets'))
  assert.ok(!owner.includes('pets') && !owner.includes('name'), 'private fields of Owner are not visible from Main')
  assert.ok(labels(files.find((f) => f.name === 'Owner.java').content.replace('System.out.println(name', 'this.|x'), 'Owner.java').includes('pets'))
})

test('generics flow through calls, for-each variables, var and Map.Entry', () => {
  assert.ok(labels(main('animals.get(0).|')).includes('speak'))
  assert.ok(labels(main('for (Animal a : animals) {\n a.|\n }')).includes('speak'))
  assert.ok(labels(main('var sb = new StringBuilder();\n sb.|')).includes('append'))
  const entry = main('Map<String, List<Dog>> m = new HashMap<>();\n for (Map.Entry<String, List<Dog>> e : m.entrySet()) { e.getValue().get(0).| }')
  assert.ok(labels(entry).includes('speak'))
  assert.equal(item(main('dog.|'), 'getClass').description, 'Class<?>')
})

test('class names give static members only; instances give instance members only', () => {
  const math = labels(main('Math.|'))
  assert.ok(math.includes('max') && math.includes('PI'))
  assert.ok(!math.includes('toString'))
  const text = labels(main('"hi".|'))
  assert.ok(text.includes('length') && text.includes('substring'))
  assert.ok(!text.includes('valueOf'), 'static String.valueOf is not offered on an instance')
  assert.ok(labels(main('int[] nums = {1};\n nums.|')).includes('length'))
  assert.ok(labels(main('System.out.|')).includes('println'))
})

test('new offers constructible classes and adds the import', () => {
  const scanner = item(main('new Sca|'), 'Scanner')
  assert.ok(scanner, 'Scanner offered after new')
  assert.equal(scanner.insertText, 'Scanner($0)')
  // java.util.* is imported in main(), so no edit; without it an import is inserted.
  assert.equal(scanner.importEdit, undefined)
  const bare = run('complete', 'Dog.java', 'public class Dog {\n  void f() {\n    new Sca|\n  }\n}\n').items.find((i) => i.label === 'Scanner')
  assert.deepEqual(bare.importEdit, { offset: 0, text: 'import java.util.Scanner;\n\n' })
  assert.equal(item(main('new Arr|'), 'ArrayList').insertText, 'ArrayList<>($0)')
  assert.ok(!labels(main('new |')).includes('Animal'), 'abstract classes are not offered after new')
})

test('locals respect scope and declaration order', () => {
  const names = labels(main('{ int hidden = 1; }\n int later = 2;|'))
  assert.ok(names.includes('dog') && names.includes('args'))
  assert.ok(!names.includes('hidden'), 'block local is out of scope')
  const before = labels(main('|\n int later = 2;'))
  assert.ok(!before.includes('later'), 'locals declared after the cursor are not offered')
})

test('no suggestions inside comments or strings', () => {
  assert.equal(run('complete', 'Main.java', main('// dog.|')).items.length, 0)
  assert.equal(run('complete', 'Main.java', main('String s = "dog.|";')).items.length, 0)
})

test('class body offers overrides, interface implementations and generators', () => {
  const src = 'public class Dog extends Animal {\n    private int age;\n    |\n}\n'
  const items = run('complete', 'Dog.java', src).items
  const speak = items.find((i) => i.label === 'speak')
  assert.match(speak.detail, /implement Speaker/)
  assert.match(speak.insertText, /@Override\npublic String speak\(\) \{/)
  assert.ok(items.some((i) => i.label === 'getAge' && /return age;/.test(i.insertText)))
  assert.ok(items.some((i) => i.label === 'setAge'))
  assert.ok(items.some((i) => i.label === 'psvm'))
  assert.ok(!items.some((i) => i.label === 'sout'), 'statement templates only inside methods')
  assert.ok(labels(main('so|')).includes('sout'))
})

test('import lines complete packages and classes', () => {
  const pkgs = labels('import java.util.|')
  assert.ok(pkgs.includes('function') && pkgs.includes('Scanner'))
  assert.ok(labels('import java.|').includes('util'))
})

test('signature help picks the overload for the typed arguments', () => {
  const ctor = run('signatureHelp', 'Main.java', main('new Dog(|'))
  assert.deepEqual(ctor.signatures.map((s) => s.label), ['Dog(String name)'])
  const add = run('signatureHelp', 'Main.java', main('animals.add(0, |'))
  assert.equal(add.activeParameter, 1)
  assert.equal(add.signatures[add.activeSignature].label, 'void add(int index, Animal element)')
  assert.equal(run('signatureHelp', 'Main.java', main('if (dog != null|')), null)
})

test('hover shows signatures with JDK docs and local types', () => {
  const println = run('hover', 'Main.java', main('System.out.print|ln("x");'))
  assert.match(println.contents[0], /void PrintStream\.println\(String x\)/)
  assert.match(println.contents[1], /Terminates the current line/)
  assert.deepEqual(run('hover', 'Main.java', main('d|og.speak();')).contents, ['local variable Dog dog'])
})

test('javac output becomes markers on the right file, with import fixes', () => {
  const stderr = [
    '/tmp/run-1/Dog.java:7: error: incompatible types: int cannot be converted to String',
    '    @Override public String sound() { return 42; }',
    '                                             ^',
    'Main.java:3: error: cannot find symbol',
    '        Scanner sc = new Scanner(System.in);',
    '        ^',
    '  symbol:   class Scanner',
    '  location: class Main',
    '2 errors',
  ].join('\n')
  const markers = parseJavacDiagnostics(stderr, files)
  assert.deepEqual(markers.map((m) => [m.file, m.line, m.column, m.endColumn]), [['Dog.java', 7, 46, 48], ['Main.java', 3, 9, 16]])
  assert.deepEqual(markers[1].symbol, { kind: 'class', name: 'Scanner' })
  assert.match(markers[1].message, /symbol: {3}class Scanner/)
  const fix = intel.importFix({ files, activeName: 'Dog.java', content: 'package zoo;\n\nclass Dog {}\n' }, 'Scanner')
  assert.deepEqual(fix, { fqn: 'java.util.Scanner', edit: { offset: 12, text: '\n\nimport java.util.Scanner;' } })
  assert.equal(intel.importFix({ files, activeName: 'Main.java', content: 'class Main {}' }, 'String'), null)
})

test('completion stays fast on a 64 KB project', () => {
  const body = Array.from({ length: 2400 }, (_, i) => `        int v${i} = ${i};`).join('\n')
  const big = `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Dog dog = new Dog("Rex");\n${body}\n        dog.|\n    }\n}\n`
  const start = performance.now()
  const result = run('complete', 'Main.java', big)
  assert.ok(result.items.some((i) => i.label === 'speak'))
  assert.ok(performance.now() - start < 250, `took ${performance.now() - start} ms`)
})
