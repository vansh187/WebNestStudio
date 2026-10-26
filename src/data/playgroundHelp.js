// The backend playground's Help tab: how to install packages and add API keys. Kept short and
// generic on purpose. Keep in step with HELP in lib/codelab/terminal.js and the .env template
// (newFileTemplate in lib/codelab/backendFiles.js). Values are placeholders only.

// Installing packages from the terminal (Output tab).
export const PACKAGE_COMMANDS = [
  { command: 'pip install requests', does: 'Install any package from PyPI (it is added to requirements.txt)' },
  { command: 'pip install fastapi pydantic', does: 'Install several at once' },
  { command: 'pip install -r requirements.txt', does: 'Install everything in requirements.txt' },
  { command: 'pip uninstall requests', does: 'Remove a package' },
  { command: 'pip list', does: 'See what is installed' },
]

export const PACKAGE_NOTES = [
  'After a page reload, press Run: it installs requirements.txt again.',
  'Run Python with python app/your_file.py, or python -c "…" for one line.',
  'A few packages can\'t work in the browser (psycopg2, uvloop, redis, pymysql, pymongo, celery). The terminal tells you what to use instead.',
]

// Adding API keys: one generic example.
export const KEY_STEPS = [
  'Create a file named .env at the top of your project.',
  'Add one KEY=value per line. Use test or practice keys only.',
  'Read the key in code with os.environ["KEY"]. Never paste a key into a .py file.',
]
export const KEY_ENV_EXAMPLE = 'MY_API_KEY=your-test-key'
export const KEY_CODE_EXAMPLE = `import os

api_key = os.environ["MY_API_KEY"]`
export const KEY_NOTES = [
  'GitHub sync never pushes .env.',
  'Direct database connections (Postgres, MySQL, MongoDB) are coming soon. For now, use the built-in SQLite database on the Database tab.',
]

export const HELP_TROUBLESHOOTING = [
  { problem: 'import: command not found', fix: 'Put the code in a file and run python app/your_file.py, or use python -c "…".' },
  { problem: "KeyError: 'MY_API_KEY'", fix: 'The name in .env doesn\'t match your code, or .env isn\'t saved.' },
  { problem: 'The first call is slow', fix: 'It can take up to a minute once, then it is fast.' },
]
