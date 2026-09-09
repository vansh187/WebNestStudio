import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const sourceDir = join(root, 'node_modules', 'pyodide')
const targetDir = join(root, 'public', 'pyodide')
const files = [
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'pyodide-lock.json',
  'python_stdlib.zip',
]

await mkdir(targetDir, { recursive: true })
await Promise.all(files.map((file) => copyFile(join(sourceDir, file), join(targetDir, file))))

console.log(`[pyodide] copied ${files.length} runtime files to public/pyodide`)
