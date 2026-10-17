// The one place that picks the GitHub adapter. UI code imports from here only, so the
// real backend and the dev mock (VITE_GITHUB_MOCK=1) are interchangeable.
import * as http from '../../api/github'

export const usingGitHubMock = import.meta.env.DEV && import.meta.env.VITE_GITHUB_MOCK === '1'

const METHODS = ['getConnection', 'startOAuth', 'completeOAuth', 'disconnect', 'listRepos', 'listBranches', 'createRepo', 'getSnapshot', 'createCommit']

// The mock is loaded on demand so production builds (where usingGitHubMock is false at
// build time) drop it entirely.
let mockModule = null
const loadMock = () => {
  mockModule ??= import('./mockGitHub').then((mock) => {
    mock.installMockTools()
    return mock
  })
  return mockModule
}

if (usingGitHubMock) loadMock()

export const github = usingGitHubMock
  ? Object.fromEntries(METHODS.map((name) => [name, async (...args) => (await loadMock())[name](...args)]))
  : http

// return_to must stay inside CodeLab (the backend enforces the same rule).
export function safeReturnTo(value, fallback = '/codelab/playground') {
  return typeof value === 'string' && value.startsWith('/codelab/') ? value : fallback
}
