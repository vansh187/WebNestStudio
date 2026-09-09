# Webnest CodeLab Phase 1 - Backend Team Handoff

This document is for the backend team. It is based on `Webnest_CodeLab_Phase_1_Technical_Implementation_v3.docx`, treated as product/source material only.

## 1. Phase 1 Decision

Phase 1 code execution is browser-first:

- HTML, CSS, and JavaScript run in a sandboxed browser iframe or worker.
- Python runs in the browser through Pyodide/WebAssembly in a Web Worker.
- The backend must not run visitor code with `exec`, shell, subprocess, Docker, Judge0, JDoodle, JDK, GCC, or G++ for Phase 1.
- Java and C++ execution are Phase 2 and require a separate isolated runner service later.

Backend responsibility for Phase 1 is the lightweight learning-platform layer: authenticated persistence, problem catalog, submissions, progress, streaks, XP, study materials, quizzes, bookmarks, notes, and admin publishing.

## 2. Existing API Conventions

- Base URL is consumed by the frontend as `VITE_API_BASE_URL`.
- Auth uses the existing bearer-token flow: `Authorization: Bearer <accessToken>`.
- Public catalog endpoints may be readable without auth; user-specific progress requires auth.
- Timestamps must be ISO-8601 UTC.
- General error shape:

```json
{ "detail": "Human readable message." }
```

- Validation error shape:

```json
{
  "errors": [
    { "loc": ["body", "title"], "msg": "Title is required." }
  ]
}
```

- Prefer `404` for authenticated resources not owned by the caller.
- No raw emails, tokens, secrets, client IPs, or private notes should leak through public endpoints.

## 3. Endpoint Summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/codelab/tracks` | public | List learning/coding tracks |
| GET | `/api/codelab/problems` | optional | List/filter published coding problems |
| GET | `/api/codelab/problems/:slug` | optional | Fetch one problem with starter files and public test examples |
| POST | `/api/codelab/submissions` | required | Store a browser-evaluated submission result |
| GET | `/api/codelab/submissions/me` | required | Current user's submission history |
| GET | `/api/codelab/dashboard` | required | Progress, streak, XP, recent activity |
| GET | `/api/courses` | optional | List study courses |
| GET | `/api/courses/:slug` | optional | Course syllabus and progress |
| GET | `/api/lessons/:id` | optional | Lesson content and attached practice |
| POST | `/api/lessons/:id/progress` | required | Update lesson progress |
| POST | `/api/lessons/:id/bookmark` | required | Toggle bookmark |
| POST | `/api/lessons/:id/notes` | required | Create/update learner note |
| POST | `/api/quizzes/:id/submit` | required | Store quiz attempt |
| GET | `/api/dashboard/learning` | required | Unified learning dashboard |
| POST/PUT | `/api/admin/codelab/problems` | admin | Create/update problem |
| POST/PUT | `/api/admin/courses` | admin | Create/update course/module/lesson content |

## 4. Tracks

### `GET /api/codelab/tracks`

Response:

```json
{
  "items": [
    {
      "id": "python",
      "label": "Python",
      "runner": "pyodide",
      "description": "Python practice with browser-side execution."
    },
    {
      "id": "web",
      "label": "Web Development",
      "runner": "iframe",
      "description": "HTML, CSS, and JavaScript challenges."
    }
  ]
}
```

Recommended Phase 1 tracks: `python`, `web`. Study courses may include Java, Advanced Java, Spring, Spring Boot, React, SQL, and database design even when those are not executable in CodeLab yet.

## 5. Problems API

### `GET /api/codelab/problems`

Query params:

| Param | Example | Notes |
|---|---|---|
| `track` | `python` | Optional |
| `language` | `python` | Optional |
| `topic` | `loops` | Optional |
| `difficulty` | `easy` | Optional: `easy`, `medium`, `hard` |
| `status` | `solved` | Optional; only meaningful when auth is present |
| `limit` | `20` | Default 20, max 100 |
| `cursor` | `eyJ...` | Optional pagination cursor |

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
      "estimated_minutes": 10,
      "status": "not_started",
      "solved_count": 128
    }
  ],
  "next_cursor": null
}
```

`status` for anonymous users may be omitted or returned as `not_started`.

### `GET /api/codelab/problems/:slug`

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
  "constraints": ["Input contains space-separated integers."],
  "hints": ["Split the input string before converting values."],
  "starter_files": [
    { "name": "main.py", "language": "python", "content": "nums = input().split()\n" }
  ],
  "examples": [
    { "input": "1 2 3\n", "expected_output": "6\n", "explanation": "1 + 2 + 3 = 6" }
  ],
  "public_tests": [
    { "id": "tc_public_1", "input": "1 2 3\n", "expected_output": "6\n", "weight": 1 }
  ],
  "user_progress": {
    "status": "in_progress",
    "best_score": 60,
    "attempts": 2,
    "last_activity_at": "2026-09-09T12:00:00Z"
  }
}
```

Hidden tests should never return `input` or `expected_output` to the client unless they are intentionally public.

## 6. Submissions API

### `POST /api/codelab/submissions`

The frontend executes Phase 1 code in the browser and sends the result for persistence. Backend stores the attempt, updates progress, awards XP once on first solve, and recalculates streaks.

Request:

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

Allowed submission result statuses: `passed`, `failed`, `runtime_error`, `timeout`, `manual_review`.

Security note: do not trust client-side pass/fail as a high-stakes grading authority. For Phase 1 it is acceptable for learning progress, but store enough metadata for audit and future server-side validation.

### `GET /api/codelab/submissions/me`

Query params: `problem_id`, `limit`, `cursor`.

Response:

```json
{
  "items": [
    {
      "id": "sub_001",
      "problem": { "id": "prob_001", "slug": "python-list-sum", "title": "List Sum" },
      "language": "python",
      "status": "solved",
      "score": 100,
      "passed_tests": 5,
      "total_tests": 5,
      "submitted_at": "2026-09-09T12:10:00Z"
    }
  ],
  "next_cursor": null
}
```

## 7. Dashboard API

### `GET /api/codelab/dashboard`

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
    { "track": "python", "label": "Python", "solved": 14, "total": 20, "completion_percent": 70 },
    { "track": "web", "label": "Web Development", "solved": 7, "total": 30, "completion_percent": 23 }
  ],
  "difficulty_progress": [
    { "difficulty": "easy", "solved": 12, "total": 18 },
    { "difficulty": "medium", "solved": 8, "total": 22 },
    { "difficulty": "hard", "solved": 1, "total": 10 }
  ],
  "continue_learning": {
    "type": "problem",
    "slug": "python-list-manipulation",
    "title": "List Manipulation",
    "track": "python",
    "difficulty": "medium"
  },
  "recent_activity": [
    {
      "type": "submission",
      "title": "Palindrome Checker",
      "track": "python",
      "status": "solved",
      "score": 100,
      "xp": 40,
      "created_at": "2026-09-09T11:00:00Z"
    }
  ],
  "achievements": [
    { "id": "first_solve", "label": "First Problem Solved", "earned_at": "2026-09-02T08:30:00Z" }
  ]
}
```

## 8. Study Material APIs

### `GET /api/courses`

Response:

```json
{
  "items": [
    {
      "id": "course_java_core",
      "slug": "java-core",
      "title": "Java - Core",
      "level": "beginner",
      "description": "Java syntax, OOP, collections, exceptions, and fundamentals.",
      "lessons_count": 48,
      "completion_percent": 0
    }
  ]
}
```

### `GET /api/courses/:slug`

Response:

```json
{
  "id": "course_python",
  "slug": "python",
  "title": "Python",
  "level": "beginner",
  "modules": [
    {
      "id": "mod_python_basics",
      "title": "Python Basics",
      "order": 1,
      "completion_percent": 40,
      "lessons": [
        {
          "id": "lesson_001",
          "title": "Variables and Types",
          "order": 1,
          "status": "completed",
          "estimated_minutes": 8
        }
      ]
    }
  ]
}
```

### `GET /api/lessons/:id`

Response:

```json
{
  "id": "lesson_001",
  "course_slug": "python",
  "module_id": "mod_python_basics",
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

### `POST /api/lessons/:id/progress`

Request:

```json
{
  "status": "completed",
  "completed_percent": 100,
  "time_spent_seconds": 420
}
```

Response:

```json
{
  "lesson_id": "lesson_001",
  "status": "completed",
  "completed_percent": 100,
  "updated_at": "2026-09-09T12:30:00Z"
}
```

### `POST /api/lessons/:id/bookmark`

Request:

```json
{ "bookmarked": true }
```

Response:

```json
{ "lesson_id": "lesson_001", "bookmarked": true }
```

### `POST /api/lessons/:id/notes`

Request:

```json
{ "note": "Revise the difference between list and tuple." }
```

Response:

```json
{
  "lesson_id": "lesson_001",
  "note": "Revise the difference between list and tuple.",
  "updated_at": "2026-09-09T12:35:00Z"
}
```

### `POST /api/quizzes/:id/submit`

Request:

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
  "quiz_id": "quiz_001",
  "score": 80,
  "total": 100,
  "passed": true,
  "xp_awarded": 10,
  "submitted_at": "2026-09-09T12:40:00Z",
  "feedback": [
    { "question_id": "q1", "correct": true, "explanation": "..." }
  ]
}
```

### `GET /api/dashboard/learning`

May return the same shape as `/api/codelab/dashboard` plus course/lesson/quiz progress:

```json
{
  "summary": {
    "courses_enrolled": 4,
    "lessons_completed": 32,
    "problems_solved": 21,
    "quizzes_passed": 8,
    "xp": 860,
    "current_streak": 6
  },
  "course_progress": [
    { "course_slug": "python", "title": "Python", "completion_percent": 58 }
  ],
  "continue_learning": {
    "type": "lesson",
    "lesson_id": "lesson_001",
    "title": "Variables and Types",
    "course_slug": "python"
  },
  "recent_activity": []
}
```

## 9. Admin APIs

Admin endpoints can follow existing admin patterns, but must support:

- Draft/published status for courses, modules, lessons, quizzes, and problems.
- Ordered modules, lessons, examples, tests, and topic mappings.
- Rich lesson content: headings, code blocks, callouts, images/diagrams, downloadable resources.
- Problem metadata: track, language, difficulty, points, topics, starter files, examples, public tests, hidden tests.
- Publish/unpublish without deleting historical learner progress.

Minimum admin request for a problem:

```json
{
  "title": "List Sum",
  "slug": "python-list-sum",
  "track": "python",
  "language": "python",
  "difficulty": "easy",
  "points": 20,
  "status": "published",
  "topics": ["lists", "loops"],
  "statement": "Read numbers and print their sum.",
  "starter_files": [
    { "name": "main.py", "language": "python", "content": "nums = input().split()\n" }
  ],
  "test_cases": [
    { "input": "1 2 3\n", "expected_output": "6\n", "is_hidden": false, "weight": 1 }
  ]
}
```

## 10. Data Model

Recommended tables:

- `codelab_tracks`: `id`, `label`, `runner`, `description`, `display_order`, `status`.
- `codelab_topics`: `id`, `name`, `track`, `slug`, `display_order`.
- `codelab_problems`: `id`, `slug`, `title`, `track`, `language`, `difficulty`, `statement`, `constraints`, `hints`, `starter_files`, `points`, `status`, `created_at`, `updated_at`.
- `codelab_test_cases`: `id`, `problem_id`, `input`, `expected_output`, `is_hidden`, `weight`, `display_order`.
- `codelab_submissions`: `id`, `user_id`, `problem_id`, `language`, `files`, `result`, `score`, `passed_tests`, `total_tests`, `submitted_at`.
- `codelab_user_progress`: `user_id`, `problem_id`, `status`, `best_score`, `attempts`, `solved_at`, `last_activity_at`.
- `codelab_user_stats`: `user_id`, `xp`, `current_streak`, `best_streak`, `solved_count`, `updated_at`.
- `courses`: `id`, `slug`, `title`, `level`, `description`, `status`, `display_order`.
- `course_modules`: `id`, `course_id`, `title`, `display_order`, `status`.
- `lessons`: `id`, `module_id`, `title`, `content`, `estimated_minutes`, `status`, `display_order`.
- `lesson_problem_map`: `lesson_id`, `problem_id`.
- `quizzes`, `quiz_questions`, `quiz_attempts`.
- `user_course_progress`, `user_lesson_progress`, `user_bookmarks`, `user_notes`.

## 11. Scoring Rules

- Easy: 20 XP, Medium: 40 XP, Hard: 70 XP.
- Award completion XP only once per user/problem.
- Later successful attempts may update `best_score`, but must not repeat completion XP.
- A streak increments once per calendar day with qualifying lesson, quiz, or problem activity.
- Dashboard completion percentages are based on published content only.

## 12. Backend Checklist

- [ ] Do not expose or build a Phase 1 public compiler endpoint.
- [ ] Implement the problem catalog and detail endpoints.
- [ ] Implement submissions, progress, dashboard, streak, and XP persistence.
- [ ] Implement study course, lesson, bookmark, notes, quiz, and learning dashboard APIs.
- [ ] Implement admin create/edit/publish workflows.
- [ ] Validate payloads and return the documented `{ detail }` and `422 { errors }` shapes.
- [ ] Owner-scope all user progress, notes, bookmarks, and submission history.
- [ ] Keep hidden tests hidden from public/user problem responses.
- [ ] Add indexes for `slug`, `track`, `difficulty`, `user_id`, `problem_id`, and activity timestamps.
