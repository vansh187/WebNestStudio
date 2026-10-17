# Webnest CodeLab GitHub Integration - Frontend

This document covers the frontend side of GitHub sync in the CodeLab playground (`/codelab/playground`, every editor mode). The backend side is in `GITHUB_INTEGRATION_BACKEND.md`. **Section 2 is identical in both documents**: change it in both or not at all.

## 1. What learners can do

- **Connect GitHub** (requires a WebNest login): redirects to GitHub, comes back to `/codelab/github/callback`, then returns to the playground.
- **Import a repo**: pick a repository and branch, choose the editor mode (Backend, Web, Python, Java), review kept and skipped files, then replace the editor files.
- **Push to a new repo**: create a public or private repo and commit every file.
- **Push**: commit the files changed since the last sync, with a message.
- **Pull**: bring in GitHub's changes. Files changed on both sides trigger a conflict choice: **Keep mine** or **Use GitHub's**.
- **Unlink** the project, or **Disconnect** the GitHub account.

## 2. API contract

Base URL: `VITE_API_BASE_URL`. **Every endpoint requires** `Authorization: Bearer <WebNest access token>`. JSON in and out. Timestamps ISO-8601 UTC.

Error body: `{ "detail": "Human readable message.", "code": "<machine_code>" }` plus the extra fields listed. Validation errors: `422 { "errors": [ { "loc": ["body", "<field>"], "msg": "..." } ] }`.

| HTTP | code | When | Extra fields |
|---|---|---|---|
| 400 | `invalid_state` | OAuth state missing, expired, already used or owned by another user | |
| 400 | `oauth_exchange_failed` | GitHub rejected the code | |
| 404 | `repo_not_found` | Repository or branch missing, or the user has no access | |
| 409 | `github_not_connected` | The user has no GitHub connection | |
| 409 | `github_reauth_required` | The stored token was revoked or expired. **Never send 401 for this**: 401 makes the frontend refresh the WebNest session and log the user out | |
| 409 | `non_fast_forward` | Branch head is not `base_commit_sha` | `remote_commit_sha` |
| 413 | `payload_too_large` | Commit has more than 300 changes or more than 2 MB of content | |
| 429 | `github_rate_limited` | GitHub rate limit reached | `retry_after` (seconds) |
| 502 | `github_unavailable` | Network error, timeout or 5xx from GitHub | |

`401` is reserved for an invalid or expired **WebNest** token (existing behaviour).

### 2.1 `GET /api/github/connection`

200:

```json
{ "connected": true, "login": "octocat", "avatar_url": "https://avatars.githubusercontent.com/u/1", "scopes": ["repo"], "connected_at": "2026-10-18T10:00:00Z" }
```

Not connected (still 200):

```json
{ "connected": false, "login": null, "avatar_url": null, "scopes": [], "connected_at": null }
```

### 2.2 `POST /api/github/oauth/start`

Request:

```json
{ "return_to": "/codelab/playground" }
```

`return_to` must start with `/codelab/` (otherwise `422`). 200:

```json
{ "authorize_url": "https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&scope=repo&state=..." }
```

`authorize_url` must start with `https://github.com/` (the frontend rejects anything else).

### 2.3 `POST /api/github/oauth/callback`

Request:

```json
{ "code": "abc123", "state": "xyz789" }
```

200:

```json
{ "connected": true, "login": "octocat", "avatar_url": "https://avatars.githubusercontent.com/u/1", "scopes": ["repo"], "connected_at": "2026-10-18T10:00:00Z", "return_to": "/codelab/playground" }
```

Errors: `400 invalid_state`, `400 oauth_exchange_failed`.

### 2.4 `DELETE /api/github/connection`

204, no body. Revokes the grant on GitHub (best effort) and deletes the stored token. Idempotent: 204 even when nothing was connected.

### 2.5 `GET /api/github/repos?page=1&per_page=30&q=`

200:

```json
{
  "items": [
    {
      "owner": "octocat",
      "name": "todo-api",
      "full_name": "octocat/todo-api",
      "private": true,
      "default_branch": "main",
      "html_url": "https://github.com/octocat/todo-api",
      "updated_at": "2026-10-17T08:00:00Z"
    }
  ],
  "page": 1,
  "has_more": false
}
```

Sorted by `updated_at` descending. `q` filters by repository name, case-insensitive (optional). `per_page` defaults to 30, max 100.

### 2.6 `GET /api/github/repos/{owner}/{repo}/branches`

200:

```json
{ "items": [ { "name": "main", "commit_sha": "4f2c..." } ] }
```

### 2.7 `POST /api/github/repos`

Request:

```json
{ "name": "todo-api", "private": true, "description": "Made with WebNest CodeLab" }
```

`name`: 1-100 characters from `[A-Za-z0-9._-]`. The repository is created with `auto_init: true`, so it always has a first commit. 201:

```json
{
  "owner": "octocat",
  "name": "todo-api",
  "full_name": "octocat/todo-api",
  "private": true,
  "default_branch": "main",
  "html_url": "https://github.com/octocat/todo-api",
  "head_commit_sha": "9a1b..."
}
```

Name already taken:

```json
{ "errors": [ { "loc": ["body", "name"], "msg": "A repository with this name already exists." } ] }
```

with status `422`.

### 2.8 `GET /api/github/repos/{owner}/{repo}/snapshot?branch=main&mode=auto`

`branch` is optional (default branch when omitted). `mode` is one of `auto|backend|web|python|java`. It only decides the returned `mode` value: with `auto` the backend guesses it, otherwise it echoes the value. The backend does not filter files by mode. 200:

```json
{
  "owner": "octocat",
  "repo": "todo-api",
  "branch": "main",
  "commit_sha": "4f2c...",
  "mode": "backend",
  "files": [
    { "path": "app/main.py", "language": "python", "content": "from fastapi import FastAPI\n", "sha": "e69d..." }
  ],
  "skipped": [ { "path": "logo.png", "reason": "binary" } ]
}
```

`sha` is the **git blob SHA** returned by GitHub, unchanged; the frontend uses it to detect changes. `reason` is one of `binary|too_large|ignored_dir|limit`. Limits: 200 KB per file, 300 files, 2 MB total.

### 2.9 `POST /api/github/repos/{owner}/{repo}/commits`

Request:

```json
{
  "branch": "main",
  "base_commit_sha": "4f2c...",
  "message": "Update task service",
  "changes": [
    { "path": "app/services/task_service.py", "action": "upsert", "content": "..." },
    { "path": "old.py", "action": "delete" }
  ]
}
```

- `action` is `upsert` or `delete`.
- `content` is required for `upsert` and must be absent for `delete`.
- `message` is 1-200 characters.
- `changes` has 1-300 items.
- Paths are relative, use `/`, and contain no `..` or leading `/`.

201:

```json
{
  "commit_sha": "7c3e...",
  "html_url": "https://github.com/octocat/todo-api/commit/7c3e...",
  "files": [ { "path": "app/services/task_service.py", "sha": "b1d0..." } ]
}
```

`files` lists the new blob SHA of every upserted path. Deleted paths are left out. If the branch head is not `base_commit_sha`, the response is `409 non_fast_forward` with `remote_commit_sha`, and nothing is written.

## 3. Code map

| File | Role |
|---|---|
| `src/api/github.js` | HTTP adapter: one function per Section 2 endpoint. Checks every 2xx body against the contract and throws `GitHubResponseError` when it doesn't match |
| `src/lib/github/mockGitHub.js` | In-memory adapter with the same functions and shapes (dev only) |
| `src/lib/github/index.js` | Picks the adapter (`VITE_GITHUB_MOCK=1` in dev → mock) and `safeReturnTo()` |
| `src/lib/github/errors.js` | `describeGitHubError()`: maps every code, status, network error and timeout to an action |
| `src/lib/github/sync.js` | Pure logic: git blob SHA, mode filtering, push diff, pull plan and conflict resolution |
| `src/components/coding/GitHubSync.jsx` | Button + modal (connect, import, create, push, pull, conflicts) |
| `src/pages/codelab/GitHubCallback.jsx` | OAuth return page |
| `src/pages/coding/Playground.jsx` | Renders the button in every mode and keeps the link in the saved session |
| `src/lib/codelab/projectStore.js` | Saves playground sessions (files + link) in IndexedDB, with localStorage as the fallback |
| `tests/github-sync.test.mjs` | Unit tests for sync and error handling |

UI code imports only from `src/lib/github`, never from an adapter directly. That keeps the real backend and the mock interchangeable.

## 4. Link state

Saved with the playground session in IndexedDB (`projectStore.js`; localStorage only when IndexedDB is unavailable):

```json
{ "owner": "octocat", "repo": "todo-api", "branch": "main", "commit_sha": "4f2c...", "html_url": "https://github.com/octocat/todo-api",
  "paths": { "Main.java": "src/main/java/demo/Main.java" }, "shas": { "Main.java": "e69d..." }, "unverified": [] }
```

- `paths` maps editor file names to repo paths. Java and Web projects use flat names in the editor. A name in `paths` with no SHA is a local file not on GitHub yet (kept after GitHub deleted it); the next push writes it to that path.
- `shas` holds each file's git blob SHA at the last sync. Comparing it with the SHA of the current content (computed in the browser) gives the exact changed-files badge with no network call.
- `unverified` lists files the last pull could not read (too large, or over a snapshot limit). Pull leaves them untouched instead of deleting them, and a push that changes one asks first, because a change made to it on GitHub could not be checked.
- Pull matches tracked files by repo path. Files added on GitHub are checked against the limits of the whole project after the pull (40 files; 2 MB, or 200 KB for Backend); the rest are left out with a message.
- Web, Python and Java imports take up to 2 MB, the backend's snapshot and commit limit.
- Switching language or loading a starter **unlinks** the project, so a push can never delete the repo's files by accident.

## 5. Error handling

Every action runs through one handler (`GitHubPanel.handleError`):

| Kind | Source | UI reaction |
|---|---|---|
| `login` | 401 | Toast, close the panel, go to `/login` (returns afterwards) |
| `connect` | `github_not_connected`, `github_reauth_required`, other 409 | Mark disconnected, show **Connect GitHub** |
| `stale` | `non_fast_forward` | "GitHub has newer commits" + **Pull now** button |
| `not_found` | `repo_not_found` | Message + **Unlink project** button |
| `rate_limited` | `github_rate_limited`, 429 | "Try again in N s" (from `retry_after` or the `Retry-After` header) |
| `too_large` | `payload_too_large`, 413 | Message |
| `validation` | 422 / 400 without code | Field errors shown under the input (repo name, commit message), otherwise the message |
| `invalid_state`, `oauth_failed` | callback | Message on the callback page + link back |
| `not_deployed` | 404 without code, 405, 501 | "GitHub sync is not available yet" (backend routes missing) |
| `unavailable` | `github_unavailable`, 5xx | Message + **Retry** |
| `network`, `timeout` | no response | Message + **Retry** |
| `bad_response` | 2xx body not matching the contract | Message, never renders broken data |

Crashes are contained by error boundaries:

- around the GitHub button in the playground header (fallback: "GitHub unavailable · retry")
- around the modal content (fallback: "The GitHub panel ran into a problem. Your files are safe.")
- around the callback route

## 6. Configuration

- `VITE_GITHUB_MOCK=1` (dev only) uses the mock, so the UI works before the backend ships. The mock exposes `window.__githubMock.editRemote(fullName, path, content)`, `.fail(status, code, extra)` and `.reset()` for manual testing.
- All GitHub calls use a 60 s timeout (`GITHUB_PATHS` in `src/lib/apiClient.js`).
- GitHub writes (POST/DELETE) are not retried on a 503, so a repo is never created twice and the single-use OAuth code is never sent twice.
- `vercel.json` rewrites `/codelab/github/callback` to the private app shell. The COOP/COEP isolation headers apply only to `/codelab/playground?isolate=1` (the backend debugger), not to the callback.

## 7. Testing

- `npm test` runs `tests/github-sync.test.mjs`, which covers:
  - blob SHAs against `git hash-object`
  - mode filtering
  - push diff
  - pull plan: no-op, remote-only, local-only, added and deleted files, all three conflict kinds
  - pull never deletes files the snapshot skipped or truncated
  - keep-mine after a GitHub delete pushes back to the original repo path
  - tracked files matched by repo path when editor names clash
  - the 2 MB import cap, the unverified-file push warning, and pull limits for the whole project
  - every contract error code and the fallbacks
- Manual check with the mock: set `VITE_GITHUB_MOCK=1`, restart `npm run dev`, log in, then connect → import → edit → push → `__githubMock.editRemote(...)` → pull (conflict) → disconnect.
