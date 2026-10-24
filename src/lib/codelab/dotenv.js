// Reads a backend project's .env file the way python-dotenv does: KEY=value lines, optional
// `export `, quotes, # comments. The values become os.environ in the browser runtime.
import { ENV_FILE } from './backendFiles.js'

const KEY = /^[A-Za-z_][A-Za-z0-9_]*$/
const ESCAPES = { n: '\n', r: '\r', t: '\t', '"': '"', '\\': '\\' }

// Returns { values: { KEY: 'value' }, problems: [{ line, message }] }.
export function parseDotenv(text) {
  const values = {}
  const problems = []
  String(text ?? '').split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim()
    if (!line || line.startsWith('#')) return
    const body = line.replace(/^export\s+/, '')
    const equals = body.indexOf('=')
    const key = (equals === -1 ? body : body.slice(0, equals)).trim()
    if (equals === -1 || !KEY.test(key)) {
      problems.push({ line: index + 1, message: equals === -1 ? 'expected KEY=value' : `"${key}" is not a valid variable name` })
      return
    }
    let value = body.slice(equals + 1).trim()
    const quote = value[0]
    if (quote === '"' || quote === "'") {
      const end = value.indexOf(quote, 1)
      if (end === -1) {
        problems.push({ line: index + 1, message: `missing closing ${quote}` })
        return
      }
      // Escapes only inside double quotes, as in a shell.
      value = quote === '"'
        ? value.slice(1, end).replace(/\\([nrt"\\])/g, (_, char) => ESCAPES[char])
        : value.slice(1, end)
    } else {
      value = value.replace(/\s+#.*$/, '')
    }
    values[key] = value
  })
  return { values, problems }
}

export const envFromFiles = (files = []) => parseDotenv(files.find((file) => file.name === ENV_FILE)?.content)
