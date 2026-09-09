export const LANGUAGES = [
  {
    id: 'web',
    label: 'Web Playground',
    monacoId: 'html',
    fileExtension: 'html',
    mainFile: 'index.html',
    runner: 'iframe',
    defaultSnippet:
      '<main class="card">\n  <h1>Hello Webnest CodeLab</h1>\n  <p>Edit this HTML, CSS, and JavaScript, then run it.</p>\n  <button id="action">Click me</button>\n</main>\n\n<style>\n  body {\n    min-height: 100vh;\n    display: grid;\n    place-items: center;\n    margin: 0;\n    font-family: system-ui, sans-serif;\n    background: #f8fafc;\n    color: #0f172a;\n  }\n  .card {\n    max-width: 420px;\n    padding: 2rem;\n    border: 1px solid #e2e8f0;\n    border-radius: 16px;\n    background: white;\n    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);\n  }\n  button {\n    border: 0;\n    border-radius: 999px;\n    padding: 0.75rem 1rem;\n    background: #111827;\n    color: white;\n    font-weight: 700;\n  }\n</style>\n\n<script>\n  document.getElementById("action").addEventListener("click", () => {\n    console.log("Button clicked from Webnest CodeLab");\n  });\n</script>\n',
  },
  {
    id: 'python',
    label: 'Python Playground',
    monacoId: 'python',
    fileExtension: 'py',
    mainFile: 'main.py',
    runner: 'pyodide',
    defaultSnippet: 'print("Hello, World!")\n',
  },
]

const BY_ID = Object.fromEntries(LANGUAGES.map((l) => [l.id, l]))

export function getLanguage(id) {
  return BY_ID[id] ?? LANGUAGES[0]
}

export function mainFileName(lang) {
  if (!lang) return 'main.txt'
  if (lang.mainFile) return lang.mainFile
  return lang.fileExtension ? `main.${lang.fileExtension}` : 'main.txt'
}
