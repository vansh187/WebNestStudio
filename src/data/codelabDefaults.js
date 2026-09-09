export const WEB_FILES = [
  { name: 'index.html', language: 'html', content: '<main class="app">\n  <h1>Hello Webnest</h1>\n  <p>Edit the files, then run the preview.</p>\n  <button id="action">Click me</button>\n</main>' },
  { name: 'style.css', language: 'css', content: 'body {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  background: #f8fafc;\n  color: #111827;\n}\n\n.app {\n  max-width: 420px;\n  padding: 2rem;\n  border: 1px solid #dbe3ef;\n  border-radius: 8px;\n  background: white;\n}\n\nbutton {\n  border: 0;\n  border-radius: 8px;\n  padding: 0.75rem 1rem;\n  background: #111827;\n  color: white;\n  font-weight: 700;\n}' },
  { name: 'script.js', language: 'javascript', content: 'document.getElementById("action")?.addEventListener("click", () => {\n  console.log("Button clicked from Webnest CodeLab");\n});' },
]

export const PYTHON_FILES = [
  { name: 'main.py', language: 'python', content: 'print("Hello, Webnest!")\n' },
]

export const CODELAB_TRACKS = [
  { id: 'web', label: 'Web Development', runner: 'iframe' },
  { id: 'python', label: 'Python', runner: 'pyodide' },
]

export const SAMPLE_PROBLEMS = [
  {
    id: 'prob_python_sum',
    slug: 'python-list-sum',
    title: 'List Sum',
    track: 'python',
    language: 'python',
    difficulty: 'easy',
    topics: ['lists', 'loops'],
    points: 20,
    status: 'not_started',
    statement: 'Read space-separated numbers from input and print their sum.',
    starter_files: [{ name: 'main.py', language: 'python', content: 'nums = input().split()\nprint(sum(map(int, nums)))\n' }],
    examples: [{ input: '1 2 3\n', expected_output: '6\n' }],
    public_tests: [{ id: 'tc_public_1', input: '1 2 3\n', expected_output: '6\n', weight: 1 }],
  },
  {
    id: 'prob_web_card',
    slug: 'web-profile-card',
    title: 'Profile Card',
    track: 'web',
    language: 'web',
    difficulty: 'easy',
    topics: ['html', 'css'],
    points: 15,
    status: 'not_started',
    statement: 'Create a small profile card with a name, short bio, and a button.',
    starter_files: WEB_FILES,
    examples: [],
    public_tests: [],
  },
]

export const SAMPLE_COURSES = [
  {
    id: 'course_python',
    slug: 'python',
    title: 'Python',
    level: 'beginner',
    description: 'Python syntax, data types, functions, files, OOP, and APIs.',
    lessons_count: 3,
    completion_percent: 0,
    modules: [
      {
        id: 'mod_python_basics',
        title: 'Python Basics',
        order: 1,
        completion_percent: 0,
        lessons: [
          { id: 'lesson_python_variables', title: 'Variables and Types', order: 1, status: 'not_started' },
          { id: 'lesson_python_input', title: 'Input and Output', order: 2, status: 'not_started' },
        ],
      },
    ],
  },
]

export const SAMPLE_LESSONS = {
  lesson_python_variables: {
    id: 'lesson_python_variables',
    course_slug: 'python',
    title: 'Variables and Types',
    content: {
      format: 'html',
      body: '<h2>Variables</h2><p>Variables give a name to a value so you can reuse it later.</p><pre><code>name = "Webnest"\nprint(name)</code></pre>',
    },
    resources: [{ type: 'code', language: 'python', content: 'name = "Webnest"\nprint(name)\n' }],
    practice: [{ type: 'problem', slug: 'python-list-sum', title: 'List Sum' }],
    progress: { status: 'not_started', completed_percent: 0, bookmarked: false, note: '' },
  },
  lesson_python_input: {
    id: 'lesson_python_input',
    course_slug: 'python',
    title: 'Input and Output',
    content: {
      format: 'html',
      body: '<h2>Input and Output</h2><p>Use input() to read text and print() to show results.</p>',
    },
    resources: [{ type: 'code', language: 'python', content: 'answer = input()\nprint(answer)\n' }],
    practice: [{ type: 'problem', slug: 'python-list-sum', title: 'List Sum' }],
    progress: { status: 'not_started', completed_percent: 0, bookmarked: false, note: '' },
  },
}

export function cloneFiles(files, fallback = PYTHON_FILES) {
  const source = Array.isArray(files) && files.length ? files : fallback
  return source.map((file) => ({
    name: String(file?.name || 'main.txt'),
    language: String(file?.language || 'plaintext'),
    content: String(file?.content || ''),
  }))
}
