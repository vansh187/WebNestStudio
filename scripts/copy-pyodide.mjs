import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const sourceDir = join(root, 'node_modules', 'pyodide')
const targetDir = join(root, 'public', 'pyodide')
const cacheDir = join(root, 'node_modules', '.cache', 'webnest-wheels')
const files = [
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'pyodide-lock.json',
  'python_stdlib.zip',
]
// The backend playground (src/workers/apiRuntime.worker.js) loads these packages and their
// dependencies; micropip is for `pip install` in its terminal. The plain Python playground
// never loads any of them.
const BACKEND_PACKAGES = ['fastapi', 'bcrypt', 'sqlalchemy', 'micropip']
// Names the lock-file wheels served from public/pyodide. The backend worker loads every
// other Pyodide package (numpy, pandas…) from the CDN instead.
const MANIFEST = 'backend-wheels.json'

await mkdir(targetDir, { recursive: true })
await Promise.all(files.map((file) => copyFile(join(sourceDir, file), join(targetDir, file))))
console.log(`[pyodide] copied ${files.length} runtime files to public/pyodide`)

const normalize = (name) => name.toLowerCase().replace(/[_.]/g, '-')

function resolvePackages(lock, roots) {
  const seen = new Map()
  const visit = (name) => {
    const key = normalize(name)
    if (seen.has(key)) return
    const entry = lock.packages[key]
    if (!entry) throw new Error(`${name} is not in pyodide-lock.json`)
    seen.set(key, entry)
    for (const dep of entry.depends || []) visit(dep)
  }
  roots.forEach(visit)
  return [...seen.values()].map(({ file_name, sha256 }) => ({ file_name, sha256 }))
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

// Copies one wheel into public/pyodide, downloading it into the cache the first time.
// Every byte is checked against the pinned hash, so a changed file never ships.
async function ensureWheel({ file_name, sha256: expected, url }) {
  const cached = join(cacheDir, file_name)
  let bytes = await readFile(cached).catch(() => null)
  if (!bytes || sha256(bytes) !== expected) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`${file_name}: HTTP ${response.status}`)
    bytes = Buffer.from(await response.arrayBuffer())
    if (sha256(bytes) !== expected) throw new Error(`${file_name}: sha256 does not match the pinned value`)
    await writeFile(cached, bytes)
  }
  const target = join(targetDir, file_name)
  const current = await access(target).then(() => readFile(target)).catch(() => null)
  if (!current || sha256(current) !== expected) await writeFile(target, bytes)
}

try {
  const lock = JSON.parse(await readFile(join(sourceDir, 'pyodide-lock.json'), 'utf8'))
  const { version } = JSON.parse(await readFile(join(sourceDir, 'package.json'), 'utf8'))
  const extras = JSON.parse(await readFile(join(root, 'scripts', 'extra-wheels.json'), 'utf8')).wheels
  const hosted = resolvePackages(lock, BACKEND_PACKAGES)
  const wheels = [
    ...hosted.map((wheel) => ({
      ...wheel,
      url: `https://cdn.jsdelivr.net/pyodide/v${version}/full/${wheel.file_name}`,
    })),
    ...extras,
  ]
  await mkdir(cacheDir, { recursive: true })
  for (const wheel of wheels) await ensureWheel(wheel)
  // Written last, so it only ever names wheels that are really there.
  await writeFile(join(targetDir, MANIFEST), `${JSON.stringify({ files: hosted.map((wheel) => wheel.file_name) }, null, 2)}\n`)
  console.log(`[pyodide] ${wheels.length} backend playground wheels ready in public/pyodide`)
} catch (error) {
  // Without the wheels only the backend playground breaks, so local work can continue
  // offline. A deploy must not ship without them.
  if (process.env.CI || process.env.VERCEL) throw error
  console.warn(`[pyodide] backend playground wheels unavailable: ${error.message}`)
}
