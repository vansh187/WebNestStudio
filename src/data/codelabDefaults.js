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

const LANGUAGE_COURSE_DEFINITIONS = [
  {
    slug: 'python',
    title: 'Python',
    level: 'beginner',
    description: 'Readable programming fundamentals for scripts, automation, data work, APIs, and backend logic.',
    language: 'python',
    sample: 'name = "Webnest"\nscore = 95\nprint(f"{name}: {score}")\n',
    output: 'Webnest: 95',
  },
  {
    slug: 'javascript',
    title: 'JavaScript',
    level: 'beginner',
    description: 'The language of browser interaction, Node.js backends, JSON APIs, and modern web apps.',
    language: 'javascript',
    sample: 'const name = "Webnest";\nconst score = 95;\nconsole.log(`${name}: ${score}`);\n',
    output: 'Webnest: 95',
  },
  {
    slug: 'java',
    title: 'Java',
    level: 'beginner',
    description: 'Strongly typed programming for enterprise apps, Android concepts, services, and object-oriented design.',
    language: 'java',
    sample: 'class Main {\n  public static void main(String[] args) {\n    String name = "Webnest";\n    int score = 95;\n    System.out.println(name + ": " + score);\n  }\n}\n',
    output: 'Webnest: 95',
  },
  {
    slug: 'cpp',
    title: 'C++',
    level: 'beginner',
    description: 'Fast, typed programming for algorithms, systems concepts, game logic, and performance-focused software.',
    language: 'cpp',
    sample: '#include <iostream>\nusing namespace std;\n\nint main() {\n  string name = "Webnest";\n  int score = 95;\n  cout << name << ": " << score << endl;\n  return 0;\n}\n',
    output: 'Webnest: 95',
  },
  {
    slug: 'c',
    title: 'C',
    level: 'beginner',
    description: 'Foundational systems programming for memory, functions, control flow, and how computers execute code.',
    language: 'c',
    sample: '#include <stdio.h>\n\nint main() {\n  char name[] = "Webnest";\n  int score = 95;\n  printf("%s: %d\\n", name, score);\n  return 0;\n}\n',
    output: 'Webnest: 95',
  },
  {
    slug: 'html-css',
    title: 'HTML and CSS',
    level: 'beginner',
    description: 'The structure and visual layer of websites: semantic markup, responsive layout, spacing, and styling.',
    language: 'html',
    sample: '<article class="card">\n  <h1>Webnest</h1>\n  <p>Build clean, useful web pages.</p>\n</article>\n\n<style>\n.card {\n  max-width: 360px;\n  padding: 24px;\n  border: 1px solid #dbe3ef;\n  border-radius: 8px;\n}\n</style>\n',
    output: 'A styled card appears in the browser.',
  },
]

function lessonId(slug, topic) {
  return `lesson_${slug.replaceAll('-', '_')}_${topic}`
}

function codeBlock(code) {
  return code.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function createLesson(course, topic, title, body, code) {
  const id = lessonId(course.slug, topic)
  return {
    id,
    course_slug: course.slug,
    title,
    content: { format: 'html', body },
    resources: [{ type: 'code', language: course.language, content: code }],
    practice: course.slug === 'python'
      ? [{ type: 'problem', slug: 'python-list-sum', title: 'List Sum' }]
      : course.slug === 'html-css'
        ? [{ type: 'problem', slug: 'web-profile-card', title: 'Profile Card' }]
        : [],
    progress: { status: 'not_started', completed_percent: 0, bookmarked: false, note: '' },
  }
}

function lessonsFor(course) {
  const sample = codeBlock(course.sample)
  return [
    createLesson(
      course,
      'overview',
      `${course.title} Overview`,
      `<h2>What you use ${course.title} for</h2><p>${course.description}</p><p>Most programming languages share the same core ideas: values, variables, decisions, loops, functions, collections, and small programs composed from smaller pieces. Once you understand those ideas in one language, learning another becomes mostly a matter of syntax and ecosystem.</p><h3>First example</h3><pre><code>${sample}</code></pre><p>Expected result: <strong>${course.output}</strong></p>`,
      course.sample,
    ),
    createLesson(
      course,
      'values',
      'Values, Variables, and Types',
      `<h2>Values and variables</h2><p>A value is data your program works with. A variable is a name that points to a value. Types describe what kind of value you have, such as text, number, boolean, list, or object.</p><p>The concept is the same everywhere: store information, give it a useful name, then use it later. Strongly typed languages ask you to be more explicit; dynamic languages infer more for you.</p><pre><code>${sample}</code></pre>`,
      course.sample,
    ),
    createLesson(
      course,
      'control-flow',
      'Conditions and Loops',
      `<h2>Control flow</h2><p>Conditions let a program choose between paths. Loops repeat work until a collection is finished or a condition changes. Together, they turn simple statements into useful behavior.</p><p>When writing loops, always ask what changes each time. If nothing changes, the loop may never end.</p>`,
      course.slug === 'python'
        ? 'for number in [1, 2, 3]:\n    if number % 2 == 0:\n        print("even", number)\n    else:\n        print("odd", number)\n'
        : course.slug === 'javascript'
          ? 'for (const number of [1, 2, 3]) {\n  if (number % 2 === 0) {\n    console.log("even", number);\n  } else {\n    console.log("odd", number);\n  }\n}\n'
          : course.slug === 'html-css'
            ? '<ul>\n  <li class="active">Learn</li>\n  <li>Practice</li>\n</ul>\n\n<style>\n.active { font-weight: 700; color: #b8860b; }\n</style>\n'
            : 'for (int number = 1; number <= 3; number++) {\n  // check number and print odd/even\n}\n',
    ),
    createLesson(
      course,
      'functions',
      'Functions and Reuse',
      `<h2>Functions</h2><p>A function packages a task behind a name. Good functions do one clear job, accept inputs, and return or produce a result. This keeps code readable and easier to test.</p><p>If you copy the same logic more than once, it may want to become a function.</p>`,
      course.slug === 'python'
        ? 'def total(numbers):\n    return sum(numbers)\n\nprint(total([1, 2, 3]))\n'
        : course.slug === 'javascript'
          ? 'function total(numbers) {\n  return numbers.reduce((sum, value) => sum + value, 0);\n}\n\nconsole.log(total([1, 2, 3]));\n'
          : course.slug === 'html-css'
            ? '<button class="primary-button">Start</button>\n\n<style>\n.primary-button {\n  padding: 12px 16px;\n  border: 0;\n  border-radius: 8px;\n}\n</style>\n'
            : 'int total(int a, int b) {\n  return a + b;\n}\n',
    ),
    createLesson(
      course,
      'collections',
      'Collections and Data Shape',
      `<h2>Collections</h2><p>Collections hold many values together. Arrays, lists, maps, dictionaries, objects, structs, and classes are all ways to shape data so a program can reason about it.</p><p>Name your data by what it means, not only by its type. <code>students</code> is clearer than <code>arr</code>.</p>`,
      course.slug === 'python'
        ? 'student = {"name": "Asha", "score": 95}\nprint(student["name"])\n'
        : course.slug === 'javascript'
          ? 'const student = { name: "Asha", score: 95 };\nconsole.log(student.name);\n'
          : course.slug === 'html-css'
            ? '<section class="profile">\n  <h2>Asha</h2>\n  <p>Score: 95</p>\n</section>\n'
            : '// Store related values in arrays, structs, classes, or objects depending on the language.\n',
    ),
  ]
}

const LESSON_GROUPS = Object.fromEntries(LANGUAGE_COURSE_DEFINITIONS.map((course) => [course.slug, lessonsFor(course)]))

export const SAMPLE_COURSES = LANGUAGE_COURSE_DEFINITIONS.map((course) => ({
  id: `course_${course.slug.replaceAll('-', '_')}`,
  slug: course.slug,
  title: course.title,
  level: course.level,
  description: course.description,
  lessons_count: LESSON_GROUPS[course.slug].length,
  completion_percent: 0,
  modules: [
    {
      id: `mod_${course.slug.replaceAll('-', '_')}_fundamentals`,
      title: `${course.title} Fundamentals`,
      order: 1,
      completion_percent: 0,
      lessons: LESSON_GROUPS[course.slug].map((lesson, index) => ({
        id: lesson.id,
        title: lesson.title,
        order: index + 1,
        status: 'not_started',
      })),
    },
  ],
}))

export const SAMPLE_LESSONS = Object.fromEntries(
  Object.values(LESSON_GROUPS).flat().map((lesson) => [lesson.id, lesson]),
)

export function cloneFiles(files, fallback = PYTHON_FILES) {
  const source = Array.isArray(files) && files.length ? files : fallback
  return source.map((file) => ({
    name: String(file?.name || 'main.txt'),
    language: String(file?.language || 'plaintext'),
    content: String(file?.content || ''),
  }))
}
