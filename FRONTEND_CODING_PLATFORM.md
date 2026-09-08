# Coding Platform — Frontend Implementation Guide

> Hand-off document for the **frontend team**. Pairs with `BACKEND_API_CODING_PLATFORM.md`
> (same API contract — build in parallel).

## 1. Goal

Add an in-browser coding platform to the WebNestStudio site:

- **Playground** (`/playground`) — public online compiler. Anyone can write code, pick a language, run it, see output. **No login required to run.**
- **Projects** (`/projects`, `/projects/:id`) — logged-in users save their work and resume it later, with autosave.
- **Share** (`/s/:shareId`) — public read-only snapshot of code + its output.
- **"Make a Project"** entry in the navbar.

Login (the existing email/OTP auth) is required only to **save a project** or **create a share link** — not to run code.

Scope of the first release: online compiler + projects + share. Structured practice problems / test-case grading are a **later phase** and are out of scope here.

## 2. Stack & conventions (already in the repo — reuse, do not reinvent)

| Concern | Use |
|---|---|
| Build | Vite 8, React 19, React Router 7 (`BrowserRouter` + JSX `<Routes>` in `src/App.jsx`) |
| HTTP | `import { api } from '../lib/apiClient'` — axios instance with bearer token + refresh + slow-request banner already wired |
| Auth | `import { useAuth } from '../context/AuthContext'` → `{ isAuthenticated, user, initializing }`; guard routes with `src/components/ProtectedRoute.jsx` |
| Forms | `react-hook-form` + `@hookform/resolvers/zod` + `zod`; schemas in `src/schemas/`; server 422s via `applyFieldErrors(error, setError)` from `apiClient` |
| Errors | `getErrorDetail(error, fallback)` from `apiClient` for human messages |
| Toasts | `import { useToast } from '../context/ToastContext'` → `.success / .error / .info` |
| State views | `src/components/states/Skeleton.jsx`, `src/components/states/StateViews.jsx` (`ErrorState`, `EmptyState`) |
| Data loading | `useEffect` + `useState` + `cancelled` flag + `reloadKey` counter (see `src/hooks/useHomeData.js`) |
| SEO | `useSeo` from `src/hooks/useSeo.js` |
| Styling | Tailwind v4 utilities inline; tokens `gold-*` (accent) + `ink-*` (neutrals); always add `dark:` variants; `font-display` for headings. Dark mode = `.dark` class on `<html>` via `src/context/ThemeContext.jsx` |

Recurring class recipes (match these):

- Button: `rounded-xl bg-ink-900 dark:bg-gold-400 px-6 py-3.5 text-sm font-semibold text-white dark:text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60`
- Input: `rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent px-4 py-3 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30`
- Card: `rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-7`
- Field error: `text-xs font-medium text-red-500`
- Spinner: `<FiLoader className="h-4 w-4 animate-spin" />` (`react-icons/fi`)

## 3. New dependencies

```
npm i @monaco-editor/react monaco-editor
```

Monaco setup notes:

- **Do not use the default CDN loader.** Configure it to bundle locally with Vite:
  ```js
  import { loader } from '@monaco-editor/react'
  import * as monaco from 'monaco-editor'
  loader.config({ monaco })
  ```
- Set up Monaco web workers in a small `src/lib/monacoSetup.js` (imported for side effects from `CodeEditor.jsx`). **Vite 8 / Rolldown gotcha:** import the workers via monaco's `exports` map path, not the raw `esm/vs/...` path — `import editorWorker from 'monaco-editor/editor/editor.worker?worker'` (likewise `monaco-editor/language/{json,css,html,typescript}/*.worker?worker`). The `esm/vs/...` form double-nests and fails the build.
- Lazy-load every coding route (`React.lazy` + `<Suspense>`) — same pattern as `DigitalCard` / admin in `src/App.jsx` — so marketing pages don't pay the Monaco bundle cost.

## 4. Routing — `src/App.jsx`

Add lazy imports next to the existing ones, and these routes:

| Path | Component | Guard | Inside `<Layout>`? |
|---|---|---|---|
| `/playground` | `pages/coding/Playground.jsx` | none | yes |
| `/projects` | `pages/coding/ProjectsList.jsx` | `<ProtectedRoute>` (no `roles` prop → any authenticated user) | yes |
| `/projects/:id` | `pages/coding/ProjectWorkspace.jsx` | `<ProtectedRoute>` | yes |
| `/s/:shareId` | `pages/coding/SharedSnippet.jsx` | none | yes |

`ProtectedRoute` already redirects anonymous users to `/login` with `state={{ from: location }}` and returns them after auth — so an unauthenticated "Make a Project" click flows correctly.

Each of the four route elements is wrapped in `src/components/ErrorBoundary.jsx` (its
default "Something went wrong / Try again" fallback), so a Monaco or render failure
degrades to a recoverable panel instead of a blank route.

## 5. Navbar / footer

- `src/data/site.js` — `NAV_LINKS` gets a single new entry `{ label: 'Playground', to: '/playground' }` (public, lightweight — keeps the desktop bar from crowding). `FOOTER_LINKS` gets both `Playground` and `Make a Project` (`/projects`).
- `src/components/Navbar.jsx` — the existing **"Start a Project"** CTA (desktop + mobile) is repointed from `/contact` to `/projects`, so it's the way into "make a project". Logged-out users hit `ProtectedRoute` → `/login` → back to `/projects`. Actual sales enquiries still have the plain **Contact** nav link.

## 6. Prerender — `scripts/prerender.mjs`

Add `'/playground'` to `STATIC_ROUTES` (public, indexable). Do **not** add `/projects` or `/s/:shareId`.

## 7. New files

```
src/api/coding.js
src/schemas/codingSchemas.js
src/data/codingLanguages.js
src/lib/monacoSetup.js
src/hooks/useCodeRunner.js
src/hooks/useAutosave.js
src/components/coding/CodeEditor.jsx
src/components/coding/LanguageSelect.jsx
src/components/coding/RunBar.jsx
src/components/coding/OutputPanel.jsx
src/components/coding/StdinPanel.jsx
src/components/coding/CodingWorkspace.jsx   # shared editor+run+output surface for Playground & ProjectWorkspace
src/components/coding/NewProjectModal.jsx   # RHF+zod dialog used by ProjectsList
src/components/coding/BackButton.jsx        # history.back() with a route fallback; top of every coding page
src/pages/coding/Playground.jsx
src/pages/coding/ProjectsList.jsx
src/pages/coding/ProjectWorkspace.jsx
src/pages/coding/SharedSnippet.jsx
```

### 7.1 `src/api/coding.js`

Thin wrappers over `{ api }`, each returning `r.data`. **Paths must match the backend doc exactly.**

```js
import { api } from '../lib/apiClient'

export const listLanguages  = ()            => api.get('/api/compiler/languages').then(r => r.data)
export const executeCode    = (payload, cfg)=> api.post('/api/compiler/execute', payload, cfg).then(r => r.data)
export const listProjects   = (params)      => api.get('/api/projects', { params }).then(r => r.data)
export const getProject     = (id)          => api.get(`/api/projects/${id}`).then(r => r.data)
export const createProject  = (body)        => api.post('/api/projects', body).then(r => r.data)
export const updateProject  = (id, patch)   => api.put(`/api/projects/${id}`, patch).then(r => r.data)
export const deleteProject  = (id)          => api.delete(`/api/projects/${id}`).then(r => r.data)
export const createShare    = (body)        => api.post('/api/shares', body).then(r => r.data)
export const getShare       = (shareId)     => api.get(`/api/shares/${shareId}`).then(r => r.data)
export const getCodingStats = ()            => api.get('/api/me/coding-stats').then(r => r.data)
```

`executeCode` takes an axios config as 2nd arg so `useCodeRunner` can pass an
`AbortController` signal, and runs the body through **`normalizeExecuteResult()`** —
the backend should return the canonical execute shape (§9), but the runtime engine is
**JDoodle**, so this adapts a raw JDoodle body (`{ output, cpuTime, memory,
compilationStatus, error, … }`) into `{ status, stdout, stderr, exit_code, compile,
time_ms, … }` as a safety net; a canonical response passes straight through. Note
JDoodle merges program output and error text into one `output` stream, so a runtime
error's text shows in the **Stdout** section (the `status` badge still tells the story).
`toCodePayload({ source, fileName, extra })` (also in this file) builds the write body
every mutating call sends — it includes **both** `source` (the backend's documented
alias) **and** `files: [{ name, content }]`. `getCodingStats` (`GET /api/me/coding-stats`)
is optional — `ProjectsList` shows the count in its header and silently ignores a failure.

### 7.2 `src/lib/apiClient.js` (one small edit)

Extend the existing per-URL timeout logic: URLs containing `/api/compiler` get a longer timeout (~45 s), same idea as the existing AI-builder rule, to absorb compile time + Render cold start.

### 7.3 `src/schemas/codingSchemas.js`

```js
import { z } from 'zod'

export const newProjectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(80),
  language: z.string().min(1, 'Pick a language'),
})

export const shareSchema = z.object({ title: z.string().trim().max(80).optional() })
```

Use with `useForm({ resolver: zodResolver(newProjectSchema) })` + `applyFieldErrors`.

### 7.4 `src/data/codingLanguages.js`

Static fallback mirroring `GET /api/compiler/languages` (used if that call fails). Each entry:
`{ id, label, monacoId, fileExtension, defaultSnippet }` — a `"Hello, World!"` snippet per language.
Cover: JavaScript, Python, Java, C, C++, TypeScript, Go, Ruby (trim to what the engine supports).

### 7.5 Hooks

- **`useCodeRunner.js`** — returns `{ running, runningSince, stopped, result, error, run(payload), cancel(), reset() }`. On `run()` it flips `running`, stamps `runningSince`, and clears the previous `result`/`error` **synchronously** (before the request) so the UI reacts on the same tick as the click. Wraps an `AbortController` so a second Run — or `cancel()` — aborts the in-flight one; `cancel()` also sets `stopped` (OutputPanel shows "Run stopped."). `result` is the raw execute response — `status` ∈ `success | compile_error | runtime_error | timeout | rate_limited | internal_error` (all rendered by `OutputPanel`). `error` is a friendly string for the transport failures the backend documents as non-200: **429** ("Too many runs…"), **413** ("code too large"), **422** ("unknown language"), **503** (engine down/unconfigured — the dev-facing `detail` is swallowed and replaced with a user message), plus client-side timeout / offline. Note: `apiClient` skips its one-shot 503 retry for `/api/compiler/*` so a "runner unavailable" fails fast.
- **Cold-start handling**: `CodingWorkspace` calls `wakeServer()` (`src/lib/health.js`) on mount so the Render free-tier cold start (~30–50 s) overlaps with the user writing code instead of being paid on the first Run. `OutputPanel` shows a live `Running… Ns` timer and, past ~4 s, a "server is waking up" note. On screens `< lg` the workspace auto-scrolls the output into view when a run starts.
- **`useAutosave.js`** — `useAutosave(value, saveFn, { delay = 1500 })` → `status: 'idle' | 'saving' | 'saved' | 'error'`. Debounced; also flushes on `Ctrl/Cmd+S` (preventDefault) and on unmount.

### 7.6 Components (`src/components/coding/`)

- **`CodeEditor.jsx`** — `@monaco-editor/react` `<Editor>` wrapper. Props: `value`, `onChange`, `language` (Monaco id), `readOnly`. Theme: subscribe to `ThemeContext`; `theme="vs-dark"` when `.dark` else `"vs"`. `loading` prop = the `FiLoader` spinner. Wrapper: `rounded-xl border border-ink-200 dark:border-ink-800 overflow-hidden`. Height is **responsive** (see §8), never a fixed `60vh`. Monaco `options` must adapt to viewport — `automaticLayout: true` always; on screens `< lg` set `{ minimap: { enabled: false }, wordWrap: 'on', folding: false, lineNumbersMinChars: 3, scrollBeyondLastLine: false, fontSize: 13 }`; on `≥ lg` allow `{ minimap: { enabled: true }, fontSize: 14 }`. Read the breakpoint with a `matchMedia('(min-width: 1024px)')` listener, not a resize handler.
- **`LanguageSelect.jsx`** — styled `<select>` over the language list (from API, fallback to `codingLanguages.js`).
- **`RunBar.jsx`** — `LanguageSelect` + primary button that is **Run** when idle and a red **Stop** (`onCancel`) while `running` + **stdin** toggle + **Save** + **Share**. Props for the handlers.
- **`OutputPanel.jsx`** — branches entirely on `result.status` (the six-value enum). Shows `stdout`, `stderr`, and `compile` output in labelled sections; a status badge + `exit_code` (hidden when `null`) + timing (**`wall_time_ms || time_ms`**, hidden when both 0 — JDoodle often omits CPU time); a per-status red hint line (`timeout` / `rate_limited` / `internal_error` / …) when a non-success run produced no readable stream; an "output truncated" note when `truncated`. Before the first run: `EmptyState`.
- **`StdinPanel.jsx`** — collapsible `<textarea>` bound to `stdin` state.

### 7.7 Pages (`src/pages/coding/`)

**`Playground.jsx`** (public)

- `useSeo({ title: 'Online Compiler & Playground' })`.
- Layout: `LanguageSelect` + `CodeEditor` (main) + `StdinPanel` + `RunBar` + `OutputPanel`. **Stacked below `lg`, split (editor | output) at `lg`+ — see §8 for the exact bounds.**
- State: `language`, `source`, `stdin`, plus `useCodeRunner`. Seed `source` from the selected language's `defaultSnippet` when the user switches language on an untouched buffer.
- **Persist session to `localStorage`** key `wns-playground` (`{ language, source, stdin }`) so refresh doesn't lose work — mirror how `wns-theme` is used; wrap reads/writes in try/catch.
- **Run** → `run({ language, source, stdin })`.
- **Save as project** → if `isAuthenticated`: `createProject({ title: 'Untitled', language, source, stdin })` → `navigate('/projects/' + id)`. Else `navigate('/login', { state: { from: location } })` with an info toast ("Log in to save your project").
- **Share** → if `isAuthenticated`: `createShare({ language, source, stdin, stdout: result?.stdout })` → `navigator.clipboard.writeText(origin + url)` + success toast. Else prompt login.

**`ProjectsList.jsx`** (protected)

- Loads `listProjects()` with the `cancelled` + `reloadKey` pattern; `Skeleton` while loading, `ErrorState` with retry, `EmptyState` ("No projects yet — start one") otherwise.
- Grid of cards: title, language chip, relative `updated_at`. Responsive grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6` (see §8). Click → `/projects/:id`. Card menu: **Delete** (confirm dialog + `deleteProject` + toast + local list update).
- **New Project** button → modal: `react-hook-form` + `newProjectSchema` (title input + `LanguageSelect`) → `createProject` → `navigate` to workspace.

**`ProjectWorkspace.jsx`** (protected)

- Loads `getProject(id)`. `404` → `StateViews` "Project not found" with a link back to `/projects`.
- Same editor / stdin / run / output UI as Playground, plus:
  - Editable **title** (inline input).
  - **Autosave**: `useAutosave({ title, language, source, stdin }, () => updateProject(id, patch))`; show the `status` ("Saving…" / "Saved" with a check / "Save failed — retry").
  - **Share** → `createShare({ project_id: id, language, source, stdin, stdout: result?.stdout })`.
- `files` from the API is an array `[{ name, content }]`; MVP edits a single file (`files[0]`), but keep the array shape in requests so multi-file is a later add, not a rewrite.

**`SharedSnippet.jsx`** (public)

- Loads `getShare(shareId)`. `useSeo` with the share title/language.
- Read-only `CodeEditor` (`readOnly`) + `OutputPanel` prefilled from the saved `stdout`.
- **Open in Playground** → write the snapshot to `localStorage['wns-playground']` and `navigate('/playground')`.
- Handle `404` with `StateViews`.

### 7.8 Optional: Home CTA

Small section on `src/pages/Home.jsx` (eyebrow + heading + button → `/playground`) using existing section conventions. Skip if out of scope.

## 8. Responsive layout & breakpoints (phone / tablet / laptop / desktop)

The whole feature must work from a 320 px phone up to a wide desktop. Use **Tailwind v4 default breakpoints** — mobile-first, min-width:

| Token | Min width | Target device band |
|---|---|---|
| *(base)* | 0–639 px | Phones (portrait). Design here first. |
| `sm:` | 640 px | Large phones (landscape), small tablets portrait |
| `md:` | 768 px | Tablets (portrait) — iPad 768, most Android tablets |
| `lg:` | 1024 px | Tablets landscape, small laptops (11–13") |
| `xl:` | 1280 px | Laptops / desktops (14–16") |
| `2xl:` | 1536 px | Large desktop monitors |

### Global rules

- **Page shell**: `w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8`. Never let the body scroll sideways — any wide child (Monaco, output, code) scrolls inside its own `overflow-x-auto` box.
- **Viewport height**: use `100dvh` (dynamic viewport) for any full-height area, not `100vh` — the mobile URL bar otherwise clips the run bar. Expose the sticky navbar height as a CSS var (`--nav-h`) and compute editor heights as `calc(100dvh - var(--nav-h) - <bars>)`.
- **Tap targets** ≥ 44 px on touch: buttons/selects get `min-h-11` and adequate horizontal padding.
- **No hover-only affordances**: the card "Delete" menu, tooltips, etc. must be reachable by tap (visible trigger, not `group-hover`).

### Coding workspace — `Playground.jsx` & `ProjectWorkspace.jsx`

Same layout for both. One responsive container:

```
grid gap-3
lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]
xl:grid-cols-[minmax(0,1fr)_460px]
2xl:grid-cols-[minmax(0,1fr)_520px]
```

| Band | Behaviour |
|---|---|
| **Phone (base, <768)** | Single column, everything **stacked**: `RunBar` (sticky: `sticky top-[var(--nav-h)] z-20`, buttons `flex-wrap`, full-width Run) → title (workspace only) → `CodeEditor` `h-[45dvh] min-h-[240px]` → `StdinPanel` (collapsed by default) → `OutputPanel` (collapsible, auto-expands on run, `max-h-[45dvh] overflow-auto`). Output text `whitespace-pre-wrap break-words`. |
| **Tablet (md 768–1023)** | Still stacked but taller: `CodeEditor` `md:h-[55dvh]`. `StdinPanel` and `OutputPanel` sit side by side (`md:grid md:grid-cols-2 md:gap-4`). `RunBar` inline (no wrap). |
| **Laptop (lg 1024–1279)** | **Split view**: editor column + output column (grid above). `CodeEditor` `lg:h-[calc(100dvh-var(--nav-h)-140px)] lg:min-h-[420px] lg:max-h-[720px]`. `OutputPanel` matches editor height, scrolls internally; output text `lg:whitespace-pre` (horizontal scroll instead of wrap). `StdinPanel` is a collapsible strip above the output. |
| **Desktop (xl 1280+, 2xl 1536+)** | Same split, wider output column (grid above). Cap the whole workspace at `max-w-[1600px]`; extra width goes to the editor, not endless output. `2xl` may bump editor font to 15 px. |

`RunBar` internals: `flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`. `LanguageSelect` full-width on phone (`w-full sm:w-auto`).

### Projects list — `ProjectsList.jsx`

- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6`.
- Header row (title + "New Project"): `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`.
- **New Project modal**: full-screen sheet on phone (`fixed inset-0 rounded-none p-5`), centred dialog from `sm` up (`sm:inset-auto sm:max-w-md sm:rounded-2xl`). Trap focus; close on `Esc` and backdrop tap.

### Shared snippet — `SharedSnippet.jsx`

- Always read-only and **stacked below `lg`**, split at `lg`+ (reuse the workspace grid).
- `CodeEditor` `readOnly` `h-[50dvh] lg:h-[60dvh] lg:max-h-[720px]`; `OutputPanel` below on phone/tablet, beside on `lg`+.

### Navbar

`Navbar.jsx` already switches to the hamburger menu below `xl` (its data-driven `.map` picks up the two new `NAV_LINKS` entries automatically). Adding **two** links can crowd the `xl` desktop bar next to the existing "Start a Project" CTA — if it wraps, keep only **"Make a Project"** in `NAV_LINKS` for `xl`, and surface **"Playground"** in the mobile menu + `FOOTER_LINKS` only.

### Verify at these widths

360 (small phone), 390 (iPhone), 768 (iPad portrait), 1024 (iPad landscape / small laptop), 1280 (laptop), 1440, 1920 (desktop). Check both orientations on the two tablet widths, and check with the on-screen keyboard open on a phone (run bar must stay reachable).

## 9. API contract (summary — authoritative copy in the backend doc §8)

Base URL = `VITE_API_BASE_URL`. Bearer auth via existing interceptor.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/compiler/languages` | public | language list for the picker |
| POST | `/api/compiler/execute` | public (rate-limited) | run code, return stdout/stderr/exit/status/time |
| GET | `/api/projects?limit=&cursor=` | required | list current user's projects |
| POST | `/api/projects` | required | create project |
| GET | `/api/projects/:id` | required (owner) | load project |
| PUT | `/api/projects/:id` | required (owner) | partial update — **autosave target** |
| DELETE | `/api/projects/:id` | required (owner) | delete |
| POST | `/api/shares` | required | create immutable share snapshot → `{ share_id, url }` |
| GET | `/api/shares/:shareId` | public | read share snapshot |

`execute` request: `{ language, version?, files: [{name, content}] | source, stdin?, args? }`
`execute` response: `{ status, stdout, stderr, exit_code, signal, compile: {stdout,stderr,exit_code}|null, time_ms, wall_time_ms, truncated }`
`status` ∈ `success | compile_error | runtime_error | timeout | rate_limited | internal_error`.
Project object: `{ id, title, description, language, files: [{name, content}], stdin, is_public, share_id, created_at, updated_at }`.

Error shape (from existing backend): general `{ "detail": "..." }`; validation `422` → `{ "errors": [{ "loc": [...], "msg": "..." }] }`.

## 10. Verification

1. `npm install` && `npm run dev`.
2. **Playground logged-out**: run "Hello, World!" in JavaScript, Python, Java → output panel shows stdout, `exit_code` 0, timing. Force a runtime error and a Java compile error → correct status badge + stderr. Provide stdin and read it in a program.
3. **Auth gate**: "Save as project" while logged out → `/login`, then back to a new `/projects/:id` after login.
4. **Projects**: create from `/projects`, edit title + code, see "Saved", hard-reload → persisted. Delete → gone + toast.
5. **Share**: "Share" on a project → open `/s/:shareId` in a private window → read-only code + saved output; "Open in Playground" seeds the editor.
6. **Theme**: toggle dark/light → Monaco follows.
7. **Responsive** (§8): in dev tools device toolbar, walk 360 / 390 / 768 / 1024 / 1280 / 1440 / 1920 px. Below `lg` the workspace is stacked and the page never scrolls sideways; at `lg`+ it is a split editor|output view. Run bar stays reachable with a phone keyboard open. Projects grid goes 1→2→3→4 columns. New Project modal is a full-screen sheet on phone, a centred dialog on `sm`+.
8. **Regression**: `npm run build` OK, `npm run lint` clean, `npm run prerender` completes with `/playground`; `/`, `/portal`, `/admin` unaffected.
