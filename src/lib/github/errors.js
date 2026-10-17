// Turns any failure from the GitHub API (see GITHUB_INTEGRATION_FRONTEND.md §2) into one
// shape the UI can act on. Covers every documented `code`, plain HTTP statuses without a
// code, network failures, timeouts and malformed responses.

// What the UI should do about an error.
export const ERROR_KIND = {
  LOGIN: 'login', // WebNest session expired: send the user to /login
  CONNECT: 'connect', // GitHub not connected or token revoked: show Connect again
  STALE: 'stale', // non_fast_forward: GitHub has newer commits, pull first
  NOT_FOUND: 'not_found',
  RATE_LIMITED: 'rate_limited',
  TOO_LARGE: 'too_large',
  VALIDATION: 'validation',
  INVALID_STATE: 'invalid_state',
  OAUTH_FAILED: 'oauth_failed',
  UNAVAILABLE: 'unavailable', // GitHub or our backend is down
  NOT_DEPLOYED: 'not_deployed', // the backend has no GitHub routes yet
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  BAD_RESPONSE: 'bad_response',
  UNKNOWN: 'unknown',
}

const CODE_KIND = {
  invalid_state: ERROR_KIND.INVALID_STATE,
  oauth_exchange_failed: ERROR_KIND.OAUTH_FAILED,
  repo_not_found: ERROR_KIND.NOT_FOUND,
  github_not_connected: ERROR_KIND.CONNECT,
  github_reauth_required: ERROR_KIND.CONNECT,
  non_fast_forward: ERROR_KIND.STALE,
  payload_too_large: ERROR_KIND.TOO_LARGE,
  github_rate_limited: ERROR_KIND.RATE_LIMITED,
  github_unavailable: ERROR_KIND.UNAVAILABLE,
}

const DEFAULT_MESSAGE = {
  [ERROR_KIND.LOGIN]: 'Your WebNest session has expired. Log in again to use GitHub.',
  [ERROR_KIND.CONNECT]: 'Your GitHub account is not connected, or access was revoked. Connect GitHub again.',
  [ERROR_KIND.STALE]: 'GitHub has newer commits than this project. Pull first, then push again.',
  [ERROR_KIND.NOT_FOUND]: 'That repository or branch was not found, or your account cannot access it.',
  [ERROR_KIND.RATE_LIMITED]: 'GitHub is limiting requests right now. Try again shortly.',
  [ERROR_KIND.TOO_LARGE]: 'This change is too large to push at once (max 300 files or 2 MB).',
  [ERROR_KIND.VALIDATION]: 'Some details are not valid. Check the form and try again.',
  [ERROR_KIND.INVALID_STATE]: 'This GitHub sign-in link expired or was already used. Start Connect again.',
  [ERROR_KIND.OAUTH_FAILED]: 'GitHub did not accept the sign-in. Start Connect again.',
  [ERROR_KIND.UNAVAILABLE]: 'GitHub could not be reached. Try again in a minute.',
  [ERROR_KIND.NOT_DEPLOYED]: 'GitHub sync is not available yet. Please try again later.',
  [ERROR_KIND.NETWORK]: 'No connection to the server. Check your internet and try again.',
  [ERROR_KIND.TIMEOUT]: 'The server took too long to answer. Try again.',
  [ERROR_KIND.BAD_RESPONSE]: 'The server sent an unexpected response. Try again.',
  [ERROR_KIND.UNKNOWN]: 'Something went wrong with GitHub. Try again.',
}

// Thrown by the adapters when a 2xx response does not match the contract.
export class GitHubResponseError extends Error {
  constructor(message) {
    super(message)
    this.name = 'GitHubResponseError'
  }
}

// Thrown by browser-side sync code (no server involved); its message is shown as-is.
export class GitHubLocalError extends Error {
  constructor(message) {
    super(message)
    this.name = 'GitHubLocalError'
  }
}

const isText = (value) => typeof value === 'string' && value.trim() !== ''

function fieldErrors(data) {
  if (!Array.isArray(data?.errors)) return []
  return data.errors
    .filter((item) => item && isText(item.msg))
    .map((item) => ({ field: Array.isArray(item.loc) ? String(item.loc[item.loc.length - 1]) : '', message: item.msg }))
}

function kindFromStatus(status, data) {
  if (status === 401) return ERROR_KIND.LOGIN
  if (status === 404) return isText(data?.code) ? ERROR_KIND.NOT_FOUND : ERROR_KIND.NOT_DEPLOYED
  if (status === 405 || status === 501) return ERROR_KIND.NOT_DEPLOYED
  if (status === 409) return ERROR_KIND.CONNECT
  if (status === 413) return ERROR_KIND.TOO_LARGE
  if (status === 422 || status === 400) return ERROR_KIND.VALIDATION
  if (status === 429) return ERROR_KIND.RATE_LIMITED
  if (status >= 500) return ERROR_KIND.UNAVAILABLE
  return ERROR_KIND.UNKNOWN
}

function retryAfterOf(error) {
  const fromBody = Number(error?.response?.data?.retry_after)
  if (Number.isFinite(fromBody) && fromBody > 0) return Math.ceil(fromBody)
  const fromHeader = Number(error?.response?.headers?.['retry-after'])
  return Number.isFinite(fromHeader) && fromHeader > 0 ? Math.ceil(fromHeader) : null
}

// Returns { kind, code, status, message, retryAfter, remoteCommitSha, fields }.
export function describeGitHubError(error) {
  if (error instanceof GitHubResponseError) {
    return { kind: ERROR_KIND.BAD_RESPONSE, code: null, status: null, message: DEFAULT_MESSAGE[ERROR_KIND.BAD_RESPONSE], retryAfter: null, remoteCommitSha: null, fields: [] }
  }
  if (error instanceof GitHubLocalError) {
    return { kind: ERROR_KIND.UNKNOWN, code: null, status: null, message: error.message, retryAfter: null, remoteCommitSha: null, fields: [] }
  }
  const response = error?.response
  if (!response) {
    const timedOut = error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT' || /timeout/i.test(String(error?.message))
    const kind = timedOut ? ERROR_KIND.TIMEOUT : error?.code === 'ERR_NETWORK' || error?.request ? ERROR_KIND.NETWORK : ERROR_KIND.UNKNOWN
    return { kind, code: null, status: null, message: DEFAULT_MESSAGE[kind], retryAfter: null, remoteCommitSha: null, fields: [] }
  }

  const status = Number(response.status) || 0
  const data = response.data && typeof response.data === 'object' ? response.data : {}
  const code = isText(data.code) ? data.code : null
  const kind = (code && CODE_KIND[code]) || kindFromStatus(status, data)
  const fields = fieldErrors(data)
  const retryAfter = kind === ERROR_KIND.RATE_LIMITED ? retryAfterOf(error) : null

  let message = isText(data.detail) ? data.detail : fields.map((item) => item.message).join(' ') || DEFAULT_MESSAGE[kind]
  // A plain 401 detail ("Not authenticated") is less useful than our explanation.
  if (kind === ERROR_KIND.LOGIN || kind === ERROR_KIND.NOT_DEPLOYED) message = DEFAULT_MESSAGE[kind]
  if (kind === ERROR_KIND.RATE_LIMITED && retryAfter) message = `GitHub is limiting requests. Try again in ${retryAfter} s.`

  return {
    kind,
    code,
    status,
    message,
    retryAfter,
    remoteCommitSha: isText(data.remote_commit_sha) ? data.remote_commit_sha : null,
    fields,
  }
}
