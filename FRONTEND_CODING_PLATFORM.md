# Webnest CodeLab Phase 1 - Frontend Team Handoff

This document is for the frontend team. It is based on `Webnest_CodeLab_Phase_1_Technical_Implementation_v3.docx`, treated as product/source material only.

## 1. Phase 1 Decision

Build Webnest CodeLab as a browser-first coding and learning experience:

- Web Playground: `index.html`, `style.css`, and `script.js` run in a sandboxed iframe.
- Python Playground: `main.py` runs through Pyodide/WebAssembly inside a Web Worker.
- Monaco Editor remains the main editor.
- No JDoodle, Judge0, Java compiler, C/C++ compiler, or backend execution API is required in Phase 1.
- Backend APIs are only for learning content, problems, submissions, progress, dashboard, bookmarks, notes, quizzes, and admin publishing.

Important: no runtime exception is acceptable in production UI. Every route, coding surface, runner panel, preview panel, dashboard section, modal, and admin editor must be protected by an error boundary or local try/catch recovery where React error boundaries cannot catch the failure.

## 2. Existing Stack To Reuse

| Concern | Use |
|---|---|
| App | Vite, React, React Router |
| HTTP | `src/lib/apiClient.js` and `api` axios instance |
| Auth | `src/context/AuthContext.jsx` and `ProtectedRoute` |
| Toasts | `src/context/ToastContext.jsx` |
| SEO | `src/hooks/useSeo.js` |
| Error boundary | `src/components/ErrorBoundary.jsx` |
| Editor | Monaco via `@monaco-editor/react` |
| Styles | Existing Tailwind utility style and dark mode conventions |

Required dependency for Python:

```bash
npm i pyodide
```

If Monaco is not already installed in a target branch:

```bash
npm i @monaco-editor/react monaco-editor
```

## 3. Routes

| Path | Auth | Purpose |
|---|---|---|
| `/codelab` | public | CodeLab landing/workspace hub |
| `/codelab/playground` | public | Browser coding playground |
| `/codelab/problems` | optional | Problems library with auth-aware progress |
| `/codelab/problems/:slug` | optional to view, required to submit | Problem detail + editor + run/submit |
| `/codelab/dashboard` | required | Learner dashboard |
| `/learn` | public | Study catalogue |
| `/learn/:courseSlug` | optional | Course syllabus with auth-aware progress |
| `/learn/lessons/:lessonId` | optional | Lesson reader |
| `/admin/codelab` | admin | Problem/course publishing tools |

Every route element must be wrapped with `ErrorBoundary`. The application-level boundary in `App.jsx` is the last-resort safety net, not a replacement for route-level boundaries.

## 4. Runtime Exception Policy

No runtime exception is accepted. Implement these rules:

- Wrap every CodeLab route in `ErrorBoundary`.
- Wrap Monaco editor, preview iframe, Pyodide runner output, dashboard widgets, lesson renderer, quiz renderer, and admin content editor in local boundaries.
- Use `try/catch` for `localStorage`, `indexedDB`, `postMessage`, `Worker`, `navigator.clipboard`, dynamic imports, JSON parsing, and Pyodide loading.
- Never assume API arrays or nested objects exist. Normalize nullable data before render.
- Show `ErrorState` or a compact fallback panel with Retry for recoverable failures.
- A failed widget must not crash the full page.
- Add console logging only for diagnostics; user-facing errors must be readable and non-technical.

Suggested wrapper:

```jsx
<ErrorBoundary>
  <CodeLabWorkspace />
</ErrorBoundary>
```

Suggested async pattern:

```js
try {
  const data = await getDashboard()
  setDashboard(normalizeDashboard(data))
} catch (error) {
  setError(getErrorDetail(error, 'Could not load your dashboard.'))
}
```

## 5. Frontend Execution Design

### 5.1 Web Playground

Mode files:

```json
[
  { "name": "index.html", "language": "html", "content": "<h1>Hello Webnest</h1>" },
  { "name": "style.css", "language": "css", "content": "body { font-family: sans-serif; }" },
  { "name": "script.js", "language": "javascript", "content": "console.log('Ready');" }
]
```

Render by generating an iframe document:

```html
<!doctype html>
<html>
  <head>
    <style>/* style.css */</style>
  </head>
  <body>
    <!-- index.html -->
    <script>
      /* console bridge */
    </script>
    <script>
      /* script.js */
    </script>
  </body>
</html>
```

Iframe requirements:

- Use `sandbox="allow-scripts"` unless a specific feature requires more.
- Do not inject user code into the Webnest app DOM.
- Capture `console.log`, `console.warn`, `console.error`, and runtime errors through `postMessage`.
- Limit console output size.
- Add Reset/Clear controls.
- Recreate iframe on reset to stop runaway page state.

### 5.2 JavaScript Exercises

For algorithm-style JavaScript problems, prefer a Web Worker so long-running code does not block the UI. Use timeouts and terminate the worker on Stop.

### 5.3 Python Playground

Run Pyodide inside a dedicated Web Worker:

- Lazy-load Pyodide only when the user enters Python mode.
- Redirect `stdout` and `stderr` back to the UI.
- Support stdin for simple input/output problems.
- Provide Stop/Reset by terminating and recreating the worker.
- Enforce wall-clock timeout in the frontend.
- Cap output to prevent browser memory growth.

Canonical frontend run result:

```json
{
  "status": "success",
  "stdout": "Hello\n",
  "stderr": "",
  "runtime_ms": 42,
  "error": null,
  "truncated": false
}
```

Allowed statuses: `success`, `failed`, `runtime_error`, `timeout`, `stopped`, `internal_error`.

## 6. Suggested Frontend Files

```text
src/api/codelab.js
src/api/learning.js
src/data/codelabDefaults.js
src/lib/codelab/webPreview.js
src/lib/codelab/pythonWorker.js
src/lib/codelab/runnerResult.js
src/hooks/useBrowserRunner.js
src/hooks/usePyodideRunner.js
src/hooks/useProblemSubmission.js
src/components/codelab/CodeEditor.jsx
src/components/codelab/FileTabs.jsx
src/components/codelab/RunBar.jsx
src/components/codelab/ConsolePanel.jsx
src/components/codelab/PreviewPanel.jsx
src/components/codelab/ProblemStatement.jsx
src/components/codelab/TestResultsPanel.jsx
src/components/codelab/DashboardCards.jsx
src/pages/codelab/CodeLabHome.jsx
src/pages/codelab/Playground.jsx
src/pages/codelab/ProblemsList.jsx
src/pages/codelab/ProblemDetail.jsx
src/pages/codelab/LearnerDashboard.jsx
src/pages/learn/CoursesList.jsx
src/pages/learn/CourseDetail.jsx
src/pages/learn/LessonDetail.jsx
```

If the existing branch already has `src/pages/coding/*`, either adapt those files or create `codelab` routes and keep redirects from old paths. Avoid leaving two competing coding experiences.

## 7. API Wiring

Create `src/api/codelab.js`:

```js
import { api } from '../lib/apiClient'

export const listTracks = () => api.get('/api/codelab/tracks').then((r) => r.data)
export const listProblems = (params) => api.get('/api/codelab/problems', { params }).then((r) => r.data)
export const getProblem = (slug) => api.get(`/api/codelab/problems/${slug}`).then((r) => r.data)
export const submitProblem = (body) => api.post('/api/codelab/submissions', body).then((r) => r.data)
export const listMySubmissions = (params) => api.get('/api/codelab/submissions/me', { params }).then((r) => r.data)
export const getCodeLabDashboard = () => api.get('/api/codelab/dashboard').then((r) => r.data)
```

Create `src/api/learning.js`:

```js
import { api } from '../lib/apiClient'

export const listCourses = () => api.get('/api/courses').then((r) => r.data)
export const getCourse = (slug) => api.get(`/api/courses/${slug}`).then((r) => r.data)
export const getLesson = (id) => api.get(`/api/lessons/${id}`).then((r) => r.data)
export const updateLessonProgress = (id, body) => api.post(`/api/lessons/${id}/progress`, body).then((r) => r.data)
export const toggleLessonBookmark = (id, body) => api.post(`/api/lessons/${id}/bookmark`, body).then((r) => r.data)
export const saveLessonNote = (id, body) => api.post(`/api/lessons/${id}/notes`, body).then((r) => r.data)
export const submitQuiz = (id, body) => api.post(`/api/quizzes/${id}/submit`, body).then((r) => r.data)
export const getLearningDashboard = () => api.get('/api/dashboard/learning').then((r) => r.data)
```

Do not call `/api/compiler/execute` for Phase 1. Execution happens locally in the browser.

## 8. Request And Response Contracts

### 8.1 List Tracks

Request:

```http
GET /api/codelab/tracks
```

Response:

```json
{
  "items": [
    { "id": "python", "label": "Python", "runner": "pyodide" },
    { "id": "web", "label": "Web Development", "runner": "iframe" }
  ]
}
```

### 8.2 List Problems

Request:

```http
GET /api/codelab/problems?track=python&difficulty=easy&limit=20
```

Response:

```json
{
  "items": [
    {
      "id": "prob_001",
      "slug": "python-list-sum",
      "title": "List Sum",
      "track": "python",
      "language": "python",
      "difficulty": "easy",
      "topics": ["lists", "loops"],
      "points": 20,
      "status": "not_started"
    }
  ],
  "next_cursor": null
}
```

### 8.3 Get Problem

Request:

```http
GET /api/codelab/problems/python-list-sum
```

Response:

```json
{
  "id": "prob_001",
  "slug": "python-list-sum",
  "title": "List Sum",
  "track": "python",
  "language": "python",
  "difficulty": "easy",
  "points": 20,
  "statement": "Read numbers and print their sum.",
  "starter_files": [
    { "name": "main.py", "language": "python", "content": "nums = input().split()\n" }
  ],
  "examples": [
    { "input": "1 2 3\n", "expected_output": "6\n" }
  ],
  "public_tests": [
    { "id": "tc_public_1", "input": "1 2 3\n", "expected_output": "6\n", "weight": 1 }
  ],
  "user_progress": {
    "status": "in_progress",
    "best_score": 60,
    "attempts": 2
  }
}
```

### 8.4 Submit Problem

Request:

```http
POST /api/codelab/submissions
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "problem_id": "prob_001",
  "language": "python",
  "files": [
    { "name": "main.py", "language": "python", "content": "print(sum(map(int, input().split())))" }
  ],
  "result": {
    "status": "passed",
    "score": 100,
    "passed_tests": 5,
    "total_tests": 5,
    "stdout": "6\n",
    "stderr": "",
    "runtime_ms": 42
  }
}
```

Response:

```json
{
  "id": "sub_001",
  "problem_id": "prob_001",
  "status": "solved",
  "score": 100,
  "passed_tests": 5,
  "total_tests": 5,
  "xp_awarded": 20,
  "best_score": 100,
  "attempts": 3,
  "submitted_at": "2026-09-09T12:10:00Z"
}
```

Frontend behavior:

- If logged out and user clicks Submit, redirect to `/login` with `state.from`.
- Run Code remains available without login.
- Show backend validation errors with `applyFieldErrors` where forms exist.

### 8.5 Dashboard

Request:

```http
GET /api/codelab/dashboard
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "summary": {
    "problems_total": 50,
    "attempted": 24,
    "solved": 21,
    "completion_percent": 42,
    "xp": 860,
    "current_streak": 6,
    "best_streak": 9
  },
  "track_progress": [
    { "track": "python", "label": "Python", "solved": 14, "total": 20, "completion_percent": 70 }
  ],
  "continue_learning": {
    "type": "problem",
    "slug": "python-list-manipulation",
    "title": "List Manipulation"
  },
  "recent_activity": []
}
```

### 8.6 Courses

Request:

```http
GET /api/courses
```

Response:

```json
{
  "items": [
    {
      "id": "course_python",
      "slug": "python",
      "title": "Python",
      "level": "beginner",
      "description": "Python syntax, data types, functions, files, OOP, and APIs.",
      "lessons_count": 42,
      "completion_percent": 58
    }
  ]
}
```

### 8.7 Course Detail

Request:

```http
GET /api/courses/python
```

Response:

```json
{
  "id": "course_python",
  "slug": "python",
  "title": "Python",
  "modules": [
    {
      "id": "mod_python_basics",
      "title": "Python Basics",
      "order": 1,
      "completion_percent": 40,
      "lessons": [
        { "id": "lesson_001", "title": "Variables and Types", "order": 1, "status": "completed" }
      ]
    }
  ]
}
```

### 8.8 Lesson Detail

Request:

```http
GET /api/lessons/lesson_001
```

Response:

```json
{
  "id": "lesson_001",
  "course_slug": "python",
  "title": "Variables and Types",
  "content": {
    "format": "html",
    "body": "<h2>Variables</h2><p>...</p>"
  },
  "resources": [
    { "type": "code", "language": "python", "content": "name = 'Webnest'\nprint(name)" }
  ],
  "practice": [
    { "type": "problem", "slug": "python-variables", "title": "Variables Practice" }
  ],
  "progress": {
    "status": "in_progress",
    "completed_percent": 50,
    "bookmarked": true,
    "note": "Review string formatting."
  }
}
```

### 8.9 Lesson Progress, Bookmark, Notes

Requests:

```http
POST /api/lessons/lesson_001/progress
POST /api/lessons/lesson_001/bookmark
POST /api/lessons/lesson_001/notes
```

Bodies:

```json
{ "status": "completed", "completed_percent": 100, "time_spent_seconds": 420 }
```

```json
{ "bookmarked": true }
```

```json
{ "note": "Revise tuple unpacking." }
```

Responses:

```json
{ "lesson_id": "lesson_001", "status": "completed", "completed_percent": 100 }
```

```json
{ "lesson_id": "lesson_001", "bookmarked": true }
```

```json
{ "lesson_id": "lesson_001", "note": "Revise tuple unpacking.", "updated_at": "2026-09-09T12:35:00Z" }
```

### 8.10 Quiz Submit

Request:

```http
POST /api/quizzes/quiz_001/submit
Authorization: Bearer <accessToken>
```

```json
{
  "answers": [
    { "question_id": "q1", "answer": "B" },
    { "question_id": "q2", "answer": true }
  ]
}
```

Response:

```json
{
  "attempt_id": "quiz_attempt_001",
  "score": 80,
  "total": 100,
  "passed": true,
  "xp_awarded": 10,
  "feedback": [
    { "question_id": "q1", "correct": true, "explanation": "..." }
  ]
}
```

## 9. State And Local Persistence

Use local persistence for anonymous work:

- `localStorage['wns-codelab-playground']`: current mode, selected file, files, stdin.
- `localStorage['wns-codelab-recent']`: recent anonymous snippets/problem drafts.

Wrap every storage read/write in `try/catch`. If storage fails, continue with in-memory state and show no crash.

Authenticated progress must come from backend APIs after login.

## 10. UI Requirements

Recommended VS Code-inspired layout:

- Explorer/file tabs for `index.html`, `style.css`, `script.js`, or `main.py`.
- Monaco editor in the center.
- Run/Stop/Reset/Clear controls.
- Live Preview for Web mode.
- Console/Output panel for logs, Python stdout, stderr, and errors.
- Problem statement beside editor on desktop and above editor on mobile.
- Dashboard cards for solved count, completion percentage, XP, streak, recent activity, and Continue Learning.
- Study material pages with syllabus navigation, lesson content, bookmarks, notes, quizzes, and Open in CodeLab actions.

Responsive behavior:

- Mobile: stacked layout, reachable Run button, editor height around `45dvh`, output collapsible.
- Tablet: stacked or two-row layout, no horizontal body scroll.
- Desktop: split layout with statement/explorer, editor, preview/output.
- Use internal scrolling for code/output panes.

## 11. Validation And Errors

Frontend forms should validate before calling APIs:

- Problem/course admin title: required, max 100.
- Slug: required, lowercase URL-safe.
- Difficulty: `easy`, `medium`, `hard`.
- Points: positive number.
- Lesson progress: `0-100`.
- Notes: cap length, suggested max 5000 characters.

Error handling:

- `401`: redirect to login for protected actions.
- `403`: show permission error.
- `404`: show Not Found state.
- `422`: map field errors.
- `429`: show rate-limit message.
- `500/503`: show retryable server error.
- Runner exceptions: show console error row, not a crashed React tree.

## 12. Frontend Checklist

- [ ] Remove Phase 1 dependency on JDoodle and `/api/compiler/execute`.
- [ ] Implement Web iframe runner with console bridge and sandboxing.
- [ ] Implement Pyodide worker runner with Stop/Reset, timeout, stdout/stderr capture, and output caps.
- [ ] Build CodeLab playground, problems list, problem detail, dashboard, course list, course detail, and lesson pages.
- [ ] Wire all APIs listed in this document with valid request/response handling.
- [ ] Protect every route and major widget with error boundaries.
- [ ] Add try/catch around browser APIs that can throw.
- [ ] Ensure no runtime exception can blank the app.
- [ ] Support logged-out Run Code and logged-in Submit/Progress.
- [ ] Verify mobile, tablet, laptop, and desktop layouts.
- [ ] Run `npm run build` before handoff.
