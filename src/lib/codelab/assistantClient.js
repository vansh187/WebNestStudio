// Talks to the assistant endpoints (the API contract in the assistant plan documents).
// Uses fetch rather than the axios client because the reply is a stream.
import { API_BASE_URL, refreshSession } from '../apiClient'
import { getAccessToken } from '../tokenStore'
import { createSseParser } from './assistantStream.js'
import { AssistantError } from './assistantAgent.js'

const MOCK = import.meta.env.VITE_ASSISTANT_MOCK === '1'
const CHAT_URL = `${API_BASE_URL}/api/assistant/chat`
const USAGE_URL = `${API_BASE_URL}/api/assistant/usage`

const FRIENDLY = {
  401: 'Your session has ended. Please log in again.',
  404: 'WebNest AI is not available yet.',
  413: 'This conversation has grown too long. Start a new chat to continue.',
  429: "You've reached the limit for now. Please try again later.",
  503: 'WebNest AI is unavailable right now. Please try again later.',
}

async function failure(response) {
  let detail = ''
  try {
    const body = await response.json()
    detail = typeof body?.detail === 'string' ? body.detail : ''
  } catch {
    /* No JSON body: the friendly message below is used. */
  }
  // A 404 here means the route itself is missing, so its detail would only confuse.
  const message = (response.status !== 404 && detail) || FRIENDLY[response.status] || 'WebNest AI could not answer. Please try again.'
  const seconds = Number(response.headers.get('Retry-After'))
  return new AssistantError(message, { status: response.status, retryAfter: Number.isFinite(seconds) && seconds > 0 ? seconds : null })
}

const authorized = (headers = {}) => ({ ...headers, Authorization: `Bearer ${getAccessToken() ?? ''}` })

// fetch, refreshing the login once when the access token has expired.
async function withLogin(send) {
  let response = await send()
  if (response.status === 401 && await refreshSession()) response = await send()
  return response
}

// One model call. Calls onEvent for each event; rejects when the request itself fails.
export async function streamChat({ mode, messages, context, signal, onEvent }) {
  if (MOCK) {
    const { mockStreamChat } = await import('./assistantMock.js')
    return mockStreamChat({ mode, messages, context, signal, onEvent })
  }
  let response
  try {
    response = await withLogin(() => fetch(CHAT_URL, {
      method: 'POST',
      headers: authorized({ 'Content-Type': 'application/json', Accept: 'text/event-stream' }),
      body: JSON.stringify({ mode, messages, context }),
      signal,
    }))
  } catch (error) {
    if (signal?.aborted) throw error
    throw new AssistantError('Could not reach WebNest AI. Check your connection and try again.')
  }
  if (!response.ok) throw await failure(response)

  const parser = createSseParser(onEvent)
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      parser.feed(decoder.decode(value, { stream: true }))
    }
  } catch (error) {
    if (signal?.aborted) throw error
    throw new AssistantError('The connection to WebNest AI was lost. Check your connection and try again.')
  }
  parser.feed(decoder.decode())
  parser.flush()
  return undefined
}

// { enabled, calls_used_today, calls_limit }, or null when it could not be read.
export async function fetchAssistantUsage(signal) {
  if (MOCK) {
    const { mockUsage } = await import('./assistantMock.js')
    return mockUsage()
  }
  try {
    // Only the server saying enabled: false locks the panel. A failed read, including a 404
    // while the route isn't deployed, leaves it usable: sending reports the real problem.
    const response = await withLogin(() => fetch(USAGE_URL, { headers: authorized(), signal }))
    return response.ok ? await response.json() : null
  } catch {
    return null
  }
}
