// In-memory stand-in for the backend GitHub API (dev only, VITE_GITHUB_MOCK=1). Same
// function names and response shapes as src/api/github.js, and failures are thrown in the
// axios shape ({ response: { status, data } }) so the real error handling is exercised.
// State lives in localStorage so it survives the OAuth redirect. For manual testing,
// window.__githubMock offers editRemote(), fail() and reset().
import { gitBlobSha } from './sync'

const KEY = 'wns-github-mock'
const LOGIN = 'mock-learner'
const delay = (ms = 250) => new Promise((resolve) => { setTimeout(resolve, ms) })
const newSha = () => Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
const now = () => new Date().toISOString()

const SEED = {
  connected: false,
  connected_at: null,
  pendingState: null,
  nextFailure: null,
  repos: {
    [`${LOGIN}/todo-api`]: {
      private: true,
      default_branch: 'main',
      updated_at: '2026-10-17T08:00:00Z',
      head: 'seed-todo-api-1',
      files: {
        'app/main.py': 'from fastapi import FastAPI\n\napp = FastAPI(title="Todo API")\n\n\n@app.get("/api/health")\ndef health():\n    return {"status": "ok"}\n',
        'app/database.py': '"""Database connection."""\nimport sqlite3\n\n\ndef get_db():\n    db = sqlite3.connect("/data/app.db")\n    try:\n        yield db\n    finally:\n        db.close()\n',
        'schema.sql': 'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL);\n',
        'README.md': '# Todo API\n',
      },
      skipped: [{ path: 'docs/diagram.png', reason: 'binary' }],
    },
    [`${LOGIN}/portfolio`]: {
      private: false,
      default_branch: 'main',
      updated_at: '2026-10-10T08:00:00Z',
      head: 'seed-portfolio-1',
      files: {
        'index.html': '<main><h1>My portfolio</h1></main>\n',
        'css/style.css': 'body { font-family: system-ui; }\n',
        'js/script.js': 'console.log("hello")\n',
      },
      skipped: [],
    },
  },
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : structuredClone(SEED)
  } catch {
    return structuredClone(SEED)
  }
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* The mock keeps working for this page load. */
  }
}

function fail(status, detail, code, extra = {}) {
  const error = new Error(detail)
  error.response = { status, data: { detail, ...(code ? { code } : {}), ...extra }, headers: {} }
  throw error
}

// One-shot injected failure, e.g. window.__githubMock.fail(429, 'github_rate_limited').
function takeFailure(state) {
  if (!state.nextFailure) return
  const { status, code, extra } = state.nextFailure
  state.nextFailure = null
  save(state)
  fail(status, `Mock failure: ${code ?? status}`, code, extra)
}

function requireConnected(state) {
  takeFailure(state)
  if (!state.connected) fail(409, 'Connect your GitHub account first.', 'github_not_connected')
}

function repoOf(state, owner, repo) {
  const entry = state.repos[`${owner}/${repo}`]
  if (!entry) fail(404, 'Repository not found.', 'repo_not_found')
  return entry
}

const connection = (state) => ({
  connected: state.connected,
  login: state.connected ? LOGIN : null,
  avatar_url: state.connected ? 'https://avatars.githubusercontent.com/u/9919?v=4' : null,
  scopes: state.connected ? ['repo'] : [],
  connected_at: state.connected ? state.connected_at : null,
})

const repoSummary = (fullName, entry) => {
  const [owner, name] = fullName.split('/')
  return { owner, name, full_name: fullName, private: entry.private, default_branch: entry.default_branch, html_url: `https://github.com/${fullName}`, updated_at: entry.updated_at }
}

export async function getConnection() {
  await delay()
  const state = load()
  takeFailure(state)
  return connection(state)
}

export async function startOAuth(returnTo) {
  await delay()
  const state = load()
  takeFailure(state)
  state.pendingState = { value: newSha(), return_to: returnTo }
  save(state)
  return { authorize_url: `${window.location.origin}/codelab/github/callback?code=mock-code&state=${state.pendingState.value}` }
}

export async function completeOAuth(code, oauthState) {
  await delay()
  const state = load()
  takeFailure(state)
  if (!state.pendingState || state.pendingState.value !== oauthState) fail(400, 'This sign-in link expired or was already used.', 'invalid_state')
  if (code !== 'mock-code') fail(400, 'GitHub rejected the sign-in code.', 'oauth_exchange_failed')
  const returnTo = state.pendingState.return_to
  state.pendingState = null
  state.connected = true
  state.connected_at = now()
  save(state)
  return { ...connection(state), return_to: returnTo }
}

export async function disconnect() {
  await delay()
  const state = load()
  takeFailure(state)
  state.connected = false
  save(state)
  return true
}

export async function listRepos({ page = 1, perPage = 30, q = '' } = {}) {
  await delay()
  const state = load()
  requireConnected(state)
  const all = Object.entries(state.repos)
    .filter(([name]) => !q || name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b[1].updated_at.localeCompare(a[1].updated_at))
    .map(([name, entry]) => repoSummary(name, entry))
  const start = (page - 1) * perPage
  return { items: all.slice(start, start + perPage), page, has_more: start + perPage < all.length }
}

export async function listBranches(owner, repo) {
  await delay()
  const state = load()
  requireConnected(state)
  const entry = repoOf(state, owner, repo)
  return { items: [{ name: entry.default_branch, commit_sha: entry.head }] }
}

export async function createRepo({ name, isPrivate }) {
  await delay()
  const state = load()
  requireConnected(state)
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(name ?? '')) {
    fail(422, 'Invalid repository name.', null, { errors: [{ loc: ['body', 'name'], msg: 'Use 1-100 letters, numbers, ".", "_" or "-".' }] })
  }
  const fullName = `${LOGIN}/${name}`
  if (state.repos[fullName]) {
    const error = new Error('exists')
    error.response = { status: 422, data: { errors: [{ loc: ['body', 'name'], msg: 'A repository with this name already exists.' }] }, headers: {} }
    throw error
  }
  state.repos[fullName] = { private: Boolean(isPrivate), default_branch: 'main', updated_at: now(), head: newSha(), files: { 'README.md': `# ${name}\n` }, skipped: [] }
  save(state)
  return { ...repoSummary(fullName, state.repos[fullName]), head_commit_sha: state.repos[fullName].head }
}

export async function getSnapshot(owner, repo, { branch, mode = 'auto' } = {}) {
  await delay()
  const state = load()
  requireConnected(state)
  const entry = repoOf(state, owner, repo)
  if (branch && branch !== entry.default_branch) fail(404, 'Branch not found.', 'repo_not_found')
  const files = await Promise.all(Object.entries(entry.files).map(async ([path, content]) => ({
    path, language: 'plaintext', content, sha: await gitBlobSha(content),
  })))
  const guessed = files.some((file) => file.path === 'app/main.py') ? 'backend' : 'web'
  return { owner, repo, branch: entry.default_branch, commit_sha: entry.head, mode: mode === 'auto' ? guessed : mode, files, skipped: entry.skipped ?? [] }
}

export async function createCommit(owner, repo, { branch, baseCommitSha, message, changes }) {
  await delay()
  const state = load()
  requireConnected(state)
  const entry = repoOf(state, owner, repo)
  if (branch !== entry.default_branch) fail(404, 'Branch not found.', 'repo_not_found')
  if (!message?.trim()) fail(422, 'Commit message is required.', null, { errors: [{ loc: ['body', 'message'], msg: 'Enter a commit message.' }] })
  if (!changes?.length) fail(422, 'Nothing to commit.', null, { errors: [{ loc: ['body', 'changes'], msg: 'There are no changes to push.' }] })
  if (changes.length > 300) fail(413, 'Too many changes in one commit.', 'payload_too_large')
  if (baseCommitSha !== entry.head) fail(409, 'GitHub has newer commits.', 'non_fast_forward', { remote_commit_sha: entry.head })
  const written = []
  for (const change of changes) {
    if (change.action === 'delete') delete entry.files[change.path]
    else {
      entry.files[change.path] = change.content
      written.push({ path: change.path, sha: await gitBlobSha(change.content) })
    }
  }
  entry.head = newSha()
  entry.updated_at = now()
  save(state)
  return { commit_sha: entry.head, html_url: `https://github.com/${owner}/${repo}/commit/${entry.head}`, files: written }
}

// Called only when the mock is active, so production builds never get this hook.
export function installMockTools() {
  if (typeof window === 'undefined') return
  window.__githubMock = {
    // Simulates someone pushing to GitHub: pass content null to delete the file.
    editRemote(fullName, path, content) {
      const state = load()
      const entry = state.repos[fullName]
      if (!entry) return false
      if (content === null) delete entry.files[path]
      else entry.files[path] = content
      entry.head = newSha()
      save(state)
      return true
    },
    fail(status, code, extra) {
      const state = load()
      state.nextFailure = { status, code, extra }
      save(state)
    },
    reset() {
      save(structuredClone(SEED))
    },
  }
}
