const WEB_LANGUAGES = ['html', 'css', 'javascript']

const WEB_PLACEHOLDER = '<main><h1>Lesson practice</h1><p>Edit this markup to match the example.</p><button>Try it</button></main>'

const JAVA_SCRATCH = 'public class Main {\n    public static void main(String[] args) {\n        // Write your own code for this topic here.\n        System.out.println("Hello from the playground");\n    }\n}\n'

const PYTHON_SCRATCH = '# Write your own code for this topic here.\nprint("Hello from the playground")\n'

// SQL has no runner of its own, so the scratchpad runs statements on SQLite through the
// Python runtime. Splitting on ";" is enough for practice queries.
const SQL_SCRATCH = `import sqlite3

# Write your SQL between the triple quotes, then press Run.
# It runs on SQLite inside your browser, so a few PostgreSQL-only features are not available.
SQL = """
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
INSERT INTO users (name, city) VALUES ('Asha', 'Pune'), ('Ravi', 'Delhi'), ('Zoya', 'Pune');

SELECT city, COUNT(*) AS total FROM users GROUP BY city ORDER BY city;
"""

connection = sqlite3.connect(":memory:")
for statement in SQL.split(";"):
    if not statement.strip():
        continue
    cursor = connection.execute(statement)
    if cursor.description:
        print(" | ".join(column[0] for column in cursor.description))
        for row in cursor.fetchall():
            print(" | ".join(str(value) for value in row))
        print()
`

function pythonWorkspace(lesson, code) {
  return { language: 'python', files: [{ name: 'main.py', language: 'python', content: code }], selectedFile: 'main.py', source: code, stdin: '', lessonId: lesson.id }
}

// The runner compiles each class from a file named after it, so the file takes the name
// of the public class (or the first class when none is public).
function javaWorkspace(lesson, code) {
  const className = /\bpublic\s+(?:final\s+|abstract\s+)*class\s+(\w+)/.exec(code)?.[1] || /\bclass\s+(\w+)/.exec(code)?.[1] || 'Main'
  const name = `${className}.java`
  return { language: 'java', files: [{ name, language: 'java', content: code }], selectedFile: name, source: code, stdin: '', lessonId: lesson.id }
}

function webWorkspace(lesson, language, code) {
  const files = [
    { name: 'index.html', language: 'html', content: language === 'html' ? code : WEB_PLACEHOLDER },
    { name: 'style.css', language: 'css', content: language === 'css' ? code : '' },
    { name: 'script.js', language: 'javascript', content: language === 'javascript' ? code : '' },
  ]
  return { language: 'web', files, selectedFile: files.find((file) => file.language === language).name, source: code, stdin: '', lessonId: lesson.id }
}

// Only build templates for the execution environments CodeLab actually supports.
function workspaceForCode(lesson, code, language) {
  if (!code || lesson?.course_slug === 'react') return null
  // Setup lessons also contain terminal commands. They are useful to copy, but
  // are not Python/JavaScript programs and must not be sent to those runners.
  if (/^\s*(?:\$\s+|(?:python3?|pip3?|npm|npx|node|cd|mkdir|source|sudo|brew|apt|git)\s+|>>>\s)/m.test(code)) return null
  if (language === 'python') return pythonWorkspace(lesson, code)
  // Only complete Java Core programs run as they are; Spring, JDBC and servlet examples
  // need libraries the playground does not have.
  if (language === 'java') {
    return lesson.course_slug === 'java-core' && /\bstatic\s+void\s+main\s*\(/.test(code) ? javaWorkspace(lesson, code) : null
  }
  if (!WEB_LANGUAGES.includes(language)) return null
  return webWorkspace(lesson, language, code)
}

export function lessonTemplate(lesson, exampleIndex = 0) {
  const example = lesson?.examples?.[exampleIndex] || (exampleIndex === 0 ? lesson?.resources?.[0] : null)
  // Framework/database examples (FastAPI, Streamlit, MySQL...) need a local project.
  if (example?.runnable === false) return null
  return workspaceForCode(lesson, example?.code || example?.content, lesson?.language || example?.language)
}

// The exercise starter code, when the lesson has one that the playground can run.
export function lessonExerciseTemplate(lesson) {
  const examples = lesson?.examples || []
  // A lesson whose examples all need a local project has an exercise that does too.
  if (examples.length && examples.every((example) => example.runnable === false)) return null
  return workspaceForCode(lesson, lesson?.exercise_starter, lesson?.language)
}

const SCRATCH_NOTES = {
  python: 'Runs Python in your browser.',
  java: 'Runs plain Java 17. Frameworks such as Spring, and databases, are not available here.',
  web: 'Shows a live preview of your HTML, CSS and JavaScript.',
  react: 'Shows a live preview of plain HTML, CSS and JavaScript. JSX needs a React project on your computer.',
  sql: 'Runs your SQL on SQLite in your browser.',
}

// A blank workspace for the learner's own code on this topic. Every lesson has one, in
// the closest runtime the playground offers.
export function lessonScratch(lesson) {
  if (!lesson?.id) return null
  const language = lesson.language
  if (language === 'python') return { ...pythonWorkspace(lesson, PYTHON_SCRATCH), note: SCRATCH_NOTES.python }
  if (language === 'java') return { ...javaWorkspace(lesson, JAVA_SCRATCH), note: SCRATCH_NOTES.java }
  if (language === 'sql') return { ...pythonWorkspace(lesson, SQL_SCRATCH), note: SCRATCH_NOTES.sql }
  const note = lesson.course_slug === 'react' ? SCRATCH_NOTES.react : SCRATCH_NOTES.web
  return { ...webWorkspace(lesson, 'html', WEB_PLACEHOLDER), note }
}

// Resolves the "example" value of a playground link: an example index, "exercise" or "scratch".
export function lessonWorkspace(lesson, key) {
  if (!lesson) return null
  if (key === 'scratch') return lessonScratch(lesson)
  if (key === 'exercise') return lessonExerciseTemplate(lesson)
  const index = Number(key || 0)
  return Number.isInteger(index) && index >= 0 ? lessonTemplate(lesson, index) : null
}
