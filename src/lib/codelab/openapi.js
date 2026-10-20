// Reads the OpenAPI document FastAPI generates, so the API tester can list endpoints and
// prefill requests from the learner's own Pydantic models.
const METHODS = ['get', 'post', 'put', 'patch', 'delete']

export function listEndpoints(openapi) {
  const endpoints = []
  for (const [path, operations] of Object.entries(openapi?.paths ?? {})) {
    for (const method of METHODS) {
      const operation = operations[method]
      if (!operation) continue
      endpoints.push({
        id: `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase(),
        path,
        summary: operation.summary || '',
        tag: operation.tags?.[0] || 'default',
        operation,
        secured: Boolean(operation.security?.length),
      })
    }
  }
  return endpoints
}

export function groupByTag(endpoints) {
  const groups = new Map()
  for (const endpoint of endpoints) {
    if (!groups.has(endpoint.tag)) groups.set(endpoint.tag, [])
    groups.get(endpoint.tag).push(endpoint)
  }
  return [...groups.entries()].map(([tag, items]) => ({ tag, items }))
}

function resolve(schema, openapi) {
  let current = schema
  for (let i = 0; i < 10 && current?.$ref; i += 1) {
    const name = current.$ref.split('/').pop()
    current = openapi?.components?.schemas?.[name]
  }
  return current ?? {}
}

// A small, valid-looking example value for a JSON schema.
export function exampleFromSchema(schema, openapi, depth = 0) {
  const resolved = resolve(schema, openapi)
  if (depth > 5) return null
  if (resolved.example !== undefined) return resolved.example
  if (resolved.default !== undefined) return resolved.default
  if (resolved.enum?.length) return resolved.enum[0]
  if (resolved.const !== undefined) return resolved.const
  const options = resolved.anyOf ?? resolved.oneOf
  if (options?.length) {
    const preferred = options.find((option) => resolve(option, openapi).type !== 'null') ?? options[0]
    return exampleFromSchema(preferred, openapi, depth + 1)
  }
  if (resolved.allOf?.length) return exampleFromSchema(resolved.allOf[0], openapi, depth + 1)
  switch (resolved.type) {
    case 'object': {
      const result = {}
      for (const [key, value] of Object.entries(resolved.properties ?? {})) {
        result[key] = exampleFromSchema(value, openapi, depth + 1)
        // The same credentials everywhere, so register followed by login just works.
        if (typeof result[key] === 'string' && /password/i.test(key)) result[key] = 'password123'
        else if (typeof result[key] === 'string' && /e_?mail/i.test(key)) result[key] = 'learner@example.com'
      }
      return result
    }
    case 'array': return [exampleFromSchema(resolved.items ?? {}, openapi, depth + 1)]
    case 'integer': return resolved.minimum ?? 1
    case 'number': return resolved.minimum ?? 1.5
    case 'boolean': return false
    case 'string': {
      if (resolved.format === 'date-time') return '2026-01-01T09:00:00Z'
      if (resolved.format === 'date') return '2026-01-01'
      if (resolved.format === 'email' || /mail/i.test(resolved.title || '')) return 'learner@example.com'
      if (resolved.pattern && /@/.test(resolved.pattern)) return 'learner@example.com'
      const text = resolved.title ? `${resolved.title} text` : 'text'
      return resolved.minLength && text.length < resolved.minLength ? text.padEnd(resolved.minLength, 'x') : text
    }
    default: return null
  }
}

// The editable request a click on an endpoint starts from.
export function requestTemplate(endpoint, openapi) {
  const parameters = endpoint.operation.parameters ?? []
  const pathParams = parameters.filter((p) => p.in === 'path').map((p) => ({ name: p.name, value: String(exampleFromSchema(p.schema, openapi) ?? '1') }))
  const query = parameters.filter((p) => p.in === 'query').map((p) => ({
    name: p.name,
    value: p.required ? String(exampleFromSchema(p.schema, openapi) ?? '') : '',
    enabled: Boolean(p.required),
  }))
  const content = endpoint.operation.requestBody?.content ?? {}
  let contentType = ''
  let body = ''
  if (content['application/json']) {
    contentType = 'application/json'
    body = JSON.stringify(exampleFromSchema(content['application/json'].schema, openapi), null, 2)
  } else if (content['application/x-www-form-urlencoded']) {
    contentType = 'application/x-www-form-urlencoded'
    const schema = resolve(content['application/x-www-form-urlencoded'].schema, openapi)
    const example = exampleFromSchema(schema, openapi) ?? {}
    // Only required fields: OAuth2's optional grant_type, scope and client_* would be
    // filled with placeholder text that the form then rejects.
    const required = new Set(schema.required ?? [])
    const fields = Object.fromEntries(Object.entries(example)
      .filter(([key, value]) => required.has(key) && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)]))
    if ('username' in example) fields.username = 'learner@example.com'
    if ('password' in example) fields.password = 'password123'
    if (required.has('grant_type')) fields.grant_type = 'password'
    body = new URLSearchParams(fields).toString()
  }
  return { method: endpoint.method, pathTemplate: endpoint.path, pathParams, query, contentType, body }
}

export function buildPath(pathTemplate, pathParams = [], query = []) {
  let path = pathTemplate
  for (const { name, value } of pathParams) path = path.replace(`{${name}}`, encodeURIComponent(value))
  const search = new URLSearchParams()
  for (const { name, value, enabled } of query) if (enabled && name) search.append(name, value)
  const text = search.toString()
  return text ? `${path}?${text}` : path
}

// Pretty-prints JSON bodies; returns other text unchanged.
export function formatBody(text, headers = []) {
  const type = headers.find(([key]) => key.toLowerCase() === 'content-type')?.[1] ?? ''
  if (!text || !/json/.test(type)) return text
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

// What a response's body view shows: the formatted body, or why there is none.
export function bodyText(response) {
  if (!response) return ''
  return formatBody(response.body, response.headers ?? [])
    || (response.status === 204 ? '(204 No Content: empty body)' : response.error || '(empty body)')
}
