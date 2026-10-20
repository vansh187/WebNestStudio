import { useCallback, useEffect, useState } from 'react'

const HISTORY_LIMIT = 15
const TOKEN_NOTICE = 'Token saved. Protected routes now send it as Authorization: Bearer.'

function initial(key) {
  let saved = {}
  try {
    saved = JSON.parse(localStorage.getItem(key)) ?? {}
  } catch {
    /* Storage can be unavailable or hold bad JSON; start empty. */
  }
  return { key, token: saved.token ?? '', history: saved.history ?? [], response: null, sending: false, notice: '' }
}

// The access token in a JSON login response, if there is one.
function loginToken(result) {
  if (result.status !== 200 || !/json/.test(result.headers?.find(([key]) => key === 'content-type')?.[1] ?? '')) return null
  try {
    const data = JSON.parse(result.body)
    return typeof data?.access_token === 'string' ? data.access_token : null
  } catch {
    return null
  }
}

// The API tester's response, history and token. They live in the workspace rather than in
// ApiClientPanel, so a request that is still running when the panel unmounts (for example
// one paused at a breakpoint, which switches to the Debug tab) still records its result.
export function useApiTesterSession(storageKey, onSend) {
  const [state, setState] = useState(() => initial(storageKey))
  let session = state
  if (state.key !== storageKey) {
    session = initial(storageKey)
    setState(session)
  }

  useEffect(() => {
    try {
      localStorage.setItem(state.key, JSON.stringify({ token: state.token, history: state.history }))
    } catch {
      /* Storage can be unavailable; the tester keeps working for this visit. */
    }
  }, [state.key, state.token, state.history])

  // Updates only the session it was made for, so a reply that lands after a workspace
  // switch does not leak into the next workspace.
  const updater = useCallback((key) => (change) => setState((current) => (current.key === key ? { ...current, ...change(current) } : current)), [])

  const setToken = useCallback((token) => updater(storageKey)(() => ({ token })), [updater, storageKey])
  const clearNotice = useCallback(() => updater(storageKey)(() => ({ notice: '' })), [updater, storageKey])

  // `entry` is the request as the history list restores it.
  const send = useCallback(async (spec, entry) => {
    const update = updater(storageKey)
    update(() => ({ sending: true, notice: '' }))
    let result
    try {
      result = await onSend(spec)
    } catch (error) {
      result = { status: 0, error: error?.message || 'The request failed.', body: '', headers: [] }
    }
    const item = { ...entry, status: result.status, at: Date.now() }
    // Save the token from a login response so protected routes work straight away.
    const token = loginToken(result)
    update((current) => ({
      response: result,
      sending: false,
      history: [item, ...current.history].slice(0, HISTORY_LIMIT),
      ...(token ? { token, notice: TOKEN_NOTICE } : {}),
    }))
    return result
  }, [updater, storageKey, onSend])

  return { ...session, setToken, clearNotice, send }
}
