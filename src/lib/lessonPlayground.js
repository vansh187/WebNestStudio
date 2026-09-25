// Only build templates for the execution environments CodeLab actually supports.
export function lessonTemplate(lesson, exampleIndex = 0) {
  const example = lesson?.examples?.[exampleIndex] || (exampleIndex === 0 ? lesson?.resources?.[0] : null)
  const code = example?.code || example?.content
  const language = lesson?.language || example?.language
  if (!code || lesson?.course_slug === 'react') return null
  // Setup lessons also contain terminal commands. They are useful to copy, but
  // are not Python/JavaScript programs and must not be sent to those runners.
  if (/^\s*(?:\$\s+|(?:python3?|pip3?|npm|npx|node|cd|mkdir|source|sudo|brew|apt|git)\s+|>>>\s)/m.test(code)) return null
  if (language === 'python') return { language, files: [{ name: 'main.py', language, content: code }], selectedFile: 'main.py', source: code, stdin: '', lessonId: lesson.id }
  if (!['html', 'css', 'javascript'].includes(language)) return null
  const files = [
    { name: 'index.html', language: 'html', content: language === 'html' ? code : '<main><h1>Lesson practice</h1><p>Edit this markup to match the example.</p><button>Try it</button></main>' },
    { name: 'style.css', language: 'css', content: language === 'css' ? code : '' },
    { name: 'script.js', language: 'javascript', content: language === 'javascript' ? code : '' },
  ]
  return { language: 'web', files, selectedFile: files.find((file) => file.language === language).name, source: code, stdin: '', lessonId: lesson.id }
}
