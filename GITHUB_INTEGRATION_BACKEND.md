# Webnest CodeLab GitHub Integration - Backend Team Handoff

This document is for the backend team. It adds GitHub account linking ("Sign in with GitHub") and repository operations so learners can **import** a repo into the CodeLab playground, **push** their project to GitHub, and **pull** changes back. The frontend is already built against Section 2, and `GITHUB_INTEGRATION_FRONTEND.md` contains the same Section 2 word for word. Do not change a URL, field or error code without updating both documents.

## 1. Decisions and mandatory rules

Architecture:

- The backend owns everything GitHub-related. It exchanges the OAuth code, stores the GitHub token **encrypted, one per WebNest user**, and calls GitHub on the user's behalf. The browser never receives a GitHub token.
- Every endpoint requires the existing WebNest login (`Authorization: Bearer <accessToken>`).
- GitHub OAuth App with scope `repo` (needed to create and push private repositories).

Code rules (mandatory for this feature):

1. **No `@staticmethod`** anywhere in the feature. Use instance methods on classes that receive their dependencies through `__init__`, or plain module-level functions.
2. **Every function body in services, stores, clients and routers is wrapped in `try/except`.**
   - Catch specific exceptions first.
   - Log with context (user id, owner/repo), **never** the token.
   - Re-raise as a domain error from `app/github/errors.py`.
   - Never swallow an error silently, and never return a stack trace to the client.
3. **Loose coupling:**
   - Routers call services only.
   - Services depend on **`typing.Protocol` interfaces** (`GitHubApi`, `ConnectionStore`, `OAuthStateStore`, `TokenCipher`, `Clock`), never on concrete classes.
   - Concrete classes are constructed in exactly one place, `app/github/dependencies.py`, and injected with FastAPI `Depends`.
   - Only the class implementing a protocol may import its library: `httpx` only in the GitHub client, the ORM only in the stores, `cryptography` only in the cipher.
4. Match the existing project: same DB session dependency, same `get_current_user` dependency, same `{ "detail" }` / `422 { "errors" }` shapes (see `BACKEND_API_CODING_PLATFORM.md` §2), ISO-8601 UTC timestamps.

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

## 3. Module layout

```
app/github/
  router.py              # HTTP only: parse, call service, map domain errors to HTTP
  schemas.py             # Pydantic models, exactly Section 2
  errors.py              # GitHubDomainError base + one subclass per contract code
  protocols.py           # GitHubApi, ConnectionStore, OAuthStateStore, TokenCipher, Clock
  services/
    oauth_service.py     # start, complete, disconnect, get_connection
    repo_service.py      # list_repos, list_branches, create_repo
    snapshot_service.py  # tree + blobs -> filtered snapshot
    commit_service.py    # fast-forward check, tree, commit, ref update
  infra/
    httpx_github_api.py  # implements GitHubApi (only file importing httpx)
    sql_connection_store.py
    sql_oauth_state_store.py
    fernet_token_cipher.py
    system_clock.py
  dependencies.py        # the ONLY place concrete classes are constructed
  models.py              # ORM tables (Section 4)
```

### 3.1 Errors (`errors.py`)

```python
class GitHubDomainError(Exception):
    def __init__(self, message: str, code: str, http_status: int, extra: dict | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.http_status = http_status
        self.extra = extra or {}


class InvalidState(GitHubDomainError):
    def __init__(self) -> None:
        super().__init__("This sign-in link expired or was already used.", "invalid_state", 400)


class NonFastForward(GitHubDomainError):
    def __init__(self, remote_commit_sha: str) -> None:
        super().__init__("GitHub has newer commits. Pull first.", "non_fast_forward", 409,
                         {"remote_commit_sha": remote_commit_sha})

# Also: OAuthExchangeFailed, RepoNotFound, NotConnected, ReauthRequired,
# PayloadTooLarge, RateLimited(retry_after), GitHubUnavailable.
```

### 3.2 Protocols (`protocols.py`)

```python
class GitHubApi(Protocol):
    async def exchange_code(self, code: str) -> OAuthToken: ...
    async def revoke_grant(self, token: str) -> None: ...
    async def get_user(self, token: str) -> GitHubUser: ...
    async def list_repos(self, token: str, page: int, per_page: int) -> RepoPage: ...
    async def list_branches(self, token: str, owner: str, repo: str) -> list[Branch]: ...
    async def create_repo(self, token: str, name: str, private: bool, description: str | None) -> CreatedRepo: ...
    async def get_branch_head(self, token: str, owner: str, repo: str, branch: str) -> str: ...
    async def get_tree(self, token: str, owner: str, repo: str, sha: str) -> list[TreeEntry]: ...
    async def get_blob(self, token: str, owner: str, repo: str, sha: str) -> bytes: ...
    async def create_tree(self, token: str, owner: str, repo: str, base_tree: str, entries: list[dict]) -> str: ...
    async def create_commit(self, token: str, owner: str, repo: str, message: str, tree: str, parent: str) -> str: ...
    async def update_ref(self, token: str, owner: str, repo: str, branch: str, sha: str) -> None: ...


class ConnectionStore(Protocol):
    async def get(self, user_id: int) -> Connection | None: ...
    async def save(self, connection: Connection) -> None: ...
    async def delete(self, user_id: int) -> None: ...


class OAuthStateStore(Protocol):
    async def create(self, state_hash: str, user_id: int, return_to: str, expires_at: datetime) -> None: ...
    async def consume(self, state_hash: str, user_id: int, now: datetime) -> str: ...  # returns return_to or raises InvalidState


class TokenCipher(Protocol):
    def encrypt(self, token: str) -> str: ...
    def decrypt(self, value: str) -> str: ...


class Clock(Protocol):
    def now(self) -> datetime: ...
```

### 3.3 Service pattern (every service follows this)

```python
class CommitService:
    def __init__(self, github: GitHubApi, connections: ConnectionStore, cipher: TokenCipher) -> None:
        self._github = github
        self._connections = connections
        self._cipher = cipher

    async def commit(self, user_id: int, owner: str, repo: str, body: CommitRequest) -> CommitResponse:
        try:
            token = await self._token_for(user_id)
            head = await self._github.get_branch_head(token, owner, repo, body.branch)
            if head != body.base_commit_sha:
                raise NonFastForward(remote_commit_sha=head)
            entries = self._tree_entries(body.changes)
            tree = await self._github.create_tree(token, owner, repo, base_tree=head, entries=entries)
            sha = await self._github.create_commit(token, owner, repo, body.message, tree, parent=head)
            await self._github.update_ref(token, owner, repo, body.branch, sha)
            return await self._response(token, owner, repo, sha, body.changes)
        except GitHubDomainError:
            raise
        except Exception as exc:
            logger.exception("commit failed user=%s repo=%s/%s", user_id, owner, repo)
            raise GitHubUnavailable() from exc

    async def _token_for(self, user_id: int) -> str:
        try:
            connection = await self._connections.get(user_id)
            if connection is None:
                raise NotConnected()
            return self._cipher.decrypt(connection.access_token_encrypted)
        except GitHubDomainError:
            raise
        except Exception as exc:
            logger.exception("token lookup failed user=%s", user_id)
            raise ReauthRequired() from exc
```

`_tree_entries` builds `{"path", "mode": "100644", "type": "blob", "content"}` for upserts and `{"path", "mode": "100644", "type": "blob", "sha": None}` for deletes. `_response` reads the new tree once to return the blob SHA of each upserted path.

### 3.4 Router pattern

```python
router = APIRouter(prefix="/api/github", tags=["github"])


@router.post("/repos/{owner}/{repo}/commits", status_code=201, response_model=CommitResponse)
async def create_commit(owner: str, repo: str, body: CommitRequest,
                        user=Depends(get_current_user),
                        service: CommitService = Depends(get_commit_service)):
    try:
        return await service.commit(user.id, owner, repo, body)
    except GitHubDomainError as error:
        raise to_http(error)
    except Exception as exc:
        logger.exception("unexpected error in create_commit")
        raise to_http(GitHubUnavailable()) from exc
```

`to_http(error)` returns `HTTPException(status_code=error.http_status, detail=...)`. Register an exception handler that renders the body as `{"detail": message, "code": code, **extra}`, the same shape as Section 2, and also register it for `GitHubDomainError` as a safety net.

### 3.5 Wiring (`dependencies.py`)

```python
def get_github_api() -> GitHubApi:
    return HttpxGitHubApi(settings.github_client_id, settings.github_client_secret, timeout=20.0)


def get_commit_service(db=Depends(get_db)) -> CommitService:
    return CommitService(get_github_api(), SqlConnectionStore(db), FernetTokenCipher(settings.github_token_enc_key))
```

Tests override these functions with fakes through `app.dependency_overrides`.

## 4. Data model

- `github_connections`: `user_id` (PK, FK users, on delete cascade), `github_user_id`, `login`, `avatar_url`, `access_token_encrypted` (text), `scopes` (text), `created_at`, `updated_at`. One row per WebNest user. Connecting again replaces the row.
- `github_oauth_states`: `state_hash` (PK, sha256 hex of the state), `user_id`, `return_to`, `expires_at`, `used_at` (nullable). Index on `expires_at`. Delete rows older than one day (startup task or cron).

## 5. Flow details

### OAuth start
1. Validate that `return_to` starts with `/codelab/`.
2. Generate `state = secrets.token_urlsafe(32)` and store `sha256(state)` with `user_id`, `return_to`, `expires_at = now + 10 min`.
3. Return the GitHub authorize URL with `client_id`, `redirect_uri = GITHUB_OAUTH_REDIRECT_URI`, `scope=repo` and `state`.

### OAuth callback
1. `consume(sha256(state), user_id, now)`. Raise `InvalidState` if the state is unknown, expired, already used or owned by another user. Mark it as used.
2. `POST https://github.com/login/oauth/access_token` with `client_id`, `client_secret`, `code`, `redirect_uri` and `Accept: application/json`. A body containing `error` → `OAuthExchangeFailed`.
3. `GET /user` with the token, then save the connection with the encrypted token, `login`, `avatar_url`, `scopes` (from the `scope` field) and timestamps.
4. Return the connection plus `return_to`.

### Disconnect
1. Call `DELETE /applications/{client_id}/grant` with basic auth `client_id:client_secret` and body `{"access_token": token}`. Log and ignore failures.
2. Delete the row. Return 204.

### Snapshot
1. Resolve the branch head (`GET /repos/{o}/{r}/git/ref/heads/{branch}`).
2. Read the tree recursively (`GET /repos/{o}/{r}/git/trees/{sha}?recursive=1`) and keep `type == "blob"` entries.
3. Skip:
   - paths under `.git/`, `node_modules/`, `__pycache__/`, `venv/`, `.venv/`, `dist/`, `build/` → `ignored_dir`
   - entries with `size > 200 KB` → `too_large`
   - anything past 300 files or 2 MB total → `limit`
4. Fetch each remaining blob (`GET .../git/blobs/{sha}`, base64). Content that doesn't decode as UTF-8, or contains a NUL byte → `binary`. Limit to about 8 concurrent fetches.
5. `language` comes from the extension: `py`→python, `sql`→sql, `html`→html, `css`→css, `js`→javascript, `json`→json, `md`→markdown, `java`→java, anything else→plaintext.
6. `mode` when `auto`: `backend` if `app/main.py` exists → `java` if any `.java` → `web` if any `index.html` → `python` if any `.py` → else `web`.

### Commit
See 3.3. Use `PATCH /repos/{o}/{r}/git/refs/heads/{branch}` with `force: false`. A `422` or `409` from that call means someone pushed in between: re-read the head and raise `NonFastForward`.

## 6. GitHub client (`HttpxGitHubApi`)

- One `httpx.AsyncClient` per instance, base URL `https://api.github.com`, timeout 20 s.
- Headers: `Authorization: Bearer <token>`, `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`, `User-Agent: WebNest-CodeLab`.
- Error mapping, done in one private method used by every call:
  - 401 → `ReauthRequired`
  - 404 → `RepoNotFound`
  - 403 or 429 with `x-ratelimit-remaining: 0` → `RateLimited(retry_after = x-ratelimit-reset - now)`
  - 403 secondary limit with `retry-after` → `RateLimited(retry_after)`
  - other 403 → `RepoNotFound` (no access)
  - 409/422 on ref update → `NonFastForward`
  - `httpx.TimeoutException`, `httpx.TransportError`, 5xx → `GitHubUnavailable`
- Never log request headers.

## 7. Configuration (environment variables)

| Name | Example | Notes |
|---|---|---|
| `GITHUB_CLIENT_ID` | `Iv1.abc123` | From the GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | `***` | Secret, backend only |
| `GITHUB_OAUTH_REDIRECT_URI` | `https://www.webneststudio.co.in/codelab/github/callback` | Must exactly match the OAuth App callback URL |
| `GITHUB_TOKEN_ENC_KEY` | Fernet key | `Fernet.generate_key()`; rotating it disconnects everyone |
| `GITHUB_ALLOWED_RETURN_PREFIX` | `/codelab/` | Blocks open redirects |

OAuth Apps (GitHub → Settings → Developer settings → OAuth Apps). An OAuth App has one callback URL, so create two:

- **WebNest CodeLab** with callback `https://www.webneststudio.co.in/codelab/github/callback`, for production on Render.
- **WebNest CodeLab (dev)** with callback `http://127.0.0.1:5173/codelab/github/callback`, for local development.

Add the frontend origins (`https://www.webneststudio.co.in`, `http://127.0.0.1:5173`) to CORS if they aren't already there.

## 8. Security checklist

- [ ] Tokens are encrypted at rest and never logged or returned.
- [ ] OAuth state is random, stored only as a hash, single use, expires after 10 minutes, and bound to the user.
- [ ] `return_to` is checked against `GITHUB_ALLOWED_RETURN_PREFIX` both at start and before it is returned.
- [ ] Every endpoint requires WebNest auth, and each user can reach only their own connection.
- [ ] A revoked or expired GitHub token returns `409 github_reauth_required`, **never 401**.
- [ ] Commit paths are validated: no `..`, no leading `/`, no backslashes.

## 9. Tests (pytest)

- Service unit tests with fake protocol classes (no network):
  - state expired, reused or owned by another user
  - exchange failure
  - non-fast-forward
  - tree entries for upsert + delete
  - snapshot skip reasons and limits
  - mode guessing
- Router tests with `TestClient` and `dependency_overrides`: every row of the Section 2 error table returns the documented status, `code` and extra fields.
- `HttpxGitHubApi` tests with `httpx.MockTransport` for each GitHub call and each error mapping.
- Code rule checks in CI: `grep -rn "staticmethod" app/github` returns nothing.

## 10. Backend checklist

- [ ] Tables + migration (Section 4)
- [ ] `errors.py`, `protocols.py`, `schemas.py` (Section 2 exactly)
- [ ] Infra classes: GitHub client, stores, cipher, clock
- [ ] Services: OAuth, repos, snapshot, commit
- [ ] Router + error handler + `dependencies.py`
- [ ] Env vars on Render + both OAuth Apps created
- [ ] Tests green
- [ ] No `@staticmethod`; every function body has try/except
- [ ] Tell the frontend when it's deployed (they switch `VITE_GITHUB_MOCK` off)
