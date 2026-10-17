import { api } from '../lib/apiClient'
import { GitHubResponseError } from '../lib/github/errors'

// GitHub integration API: see GITHUB_INTEGRATION_FRONTEND.md §2 for the contract.
// Every function returns a body checked against that contract; a 2xx body that does not
// match throws GitHubResponseError, so the UI never renders half-formed data.

const enc = encodeURIComponent
const repoPath = (owner, repo) => `/api/github/repos/${enc(owner)}/${enc(repo)}`

const isText = (value) => typeof value === 'string' && value !== ''
const textOr = (value, fallback = null) => (typeof value === 'string' ? value : fallback)

function expect(condition, what) {
  if (!condition) throw new GitHubResponseError(`Unexpected response: ${what}`)
}

function connectionOf(data) {
  expect(data && typeof data === 'object' && typeof data.connected === 'boolean', 'connection')
  return {
    connected: data.connected,
    login: textOr(data.login),
    avatar_url: textOr(data.avatar_url),
    scopes: Array.isArray(data.scopes) ? data.scopes.filter(isText) : [],
    connected_at: textOr(data.connected_at),
  }
}

function repoOf(item) {
  expect(item && isText(item.owner) && isText(item.name), 'repository')
  return {
    owner: item.owner,
    name: item.name,
    full_name: textOr(item.full_name, `${item.owner}/${item.name}`),
    private: Boolean(item.private),
    default_branch: textOr(item.default_branch, 'main') || 'main',
    html_url: textOr(item.html_url, `https://github.com/${item.owner}/${item.name}`),
    updated_at: textOr(item.updated_at),
  }
}

export const getConnection = () => api.get('/api/github/connection').then((r) => connectionOf(r.data))

export const startOAuth = (returnTo) => api.post('/api/github/oauth/start', { return_to: returnTo }).then((r) => {
  expect(isText(r.data?.authorize_url) && /^https:\/\/github\.com\//.test(r.data.authorize_url), 'authorize_url')
  return { authorize_url: r.data.authorize_url }
})

export const completeOAuth = (code, state) => api.post('/api/github/oauth/callback', { code, state }).then((r) => ({
  ...connectionOf(r.data),
  return_to: textOr(r.data?.return_to),
}))

export const disconnect = () => api.delete('/api/github/connection').then(() => true)

export const listRepos = ({ page = 1, perPage = 30, q = '' } = {}) => api
  .get('/api/github/repos', { params: { page, per_page: perPage, ...(q ? { q } : {}) } })
  .then((r) => {
    expect(Array.isArray(r.data?.items), 'repository list')
    return { items: r.data.items.map(repoOf), page: Number(r.data.page) || page, has_more: Boolean(r.data.has_more) }
  })

export const listBranches = (owner, repo) => api.get(`${repoPath(owner, repo)}/branches`).then((r) => {
  expect(Array.isArray(r.data?.items), 'branch list')
  return {
    items: r.data.items
      .filter((item) => isText(item?.name))
      .map((item) => ({ name: item.name, commit_sha: textOr(item.commit_sha) })),
  }
})

export const createRepo = ({ name, isPrivate, description }) => api
  .post('/api/github/repos', { name, private: Boolean(isPrivate), description })
  .then((r) => {
    expect(isText(r.data?.head_commit_sha), 'head_commit_sha')
    return { ...repoOf(r.data), head_commit_sha: r.data.head_commit_sha }
  })

export const getSnapshot = (owner, repo, { branch, mode = 'auto' } = {}) => api
  .get(`${repoPath(owner, repo)}/snapshot`, { params: { ...(branch ? { branch } : {}), mode } })
  .then((r) => {
    const data = r.data
    expect(data && isText(data.commit_sha) && Array.isArray(data.files), 'snapshot')
    const readable = (file) => typeof file.content === 'string' && isText(file.sha)
    const listed = data.files.filter((file) => isText(file?.path))
    return {
      owner: textOr(data.owner, owner),
      repo: textOr(data.repo, repo),
      branch: textOr(data.branch, branch || 'main'),
      commit_sha: data.commit_sha,
      mode: textOr(data.mode, 'web'),
      files: listed
        .filter(readable)
        .map((file) => ({ path: file.path, language: textOr(file.language, 'plaintext'), content: file.content, sha: file.sha })),
      // A listed file without content still exists on GitHub: report it as skipped so a
      // pull never mistakes it for a deletion.
      skipped: [
        ...(Array.isArray(data.skipped)
          ? data.skipped.filter((item) => isText(item?.path)).map((item) => ({ path: item.path, reason: textOr(item.reason, 'limit') }))
          : []),
        ...listed.filter((file) => !readable(file)).map((file) => ({ path: file.path, reason: 'unreadable' })),
      ],
    }
  })

export const createCommit = (owner, repo, { branch, baseCommitSha, message, changes }) => api
  .post(`${repoPath(owner, repo)}/commits`, { branch, base_commit_sha: baseCommitSha, message, changes })
  .then((r) => {
    expect(isText(r.data?.commit_sha), 'commit_sha')
    return {
      commit_sha: r.data.commit_sha,
      html_url: textOr(r.data.html_url),
      files: Array.isArray(r.data.files)
        ? r.data.files.filter((file) => isText(file?.path) && isText(file?.sha)).map((file) => ({ path: file.path, sha: file.sha }))
        : [],
    }
  })
