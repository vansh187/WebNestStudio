// Turn javac output (already mapped back to the student's files by mapJavaDiagnostics) into
// editor markers: { file, line, column, endColumn, severity, message, symbol }.
//
//   Dog.java:7: error: incompatible types: int cannot be converted to String
//       @Override public String sound() { return 42; }
//                                                ^
//     symbol:   class Scanner        <- only for "cannot find symbol"
export function parseJavacDiagnostics(stderr, files = []) {
  if (!stderr) return []
  const names = files.map((f) => f.name)
  const lines = String(stderr).replace(/\r\n?/g, '\n').split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const head = /^(?:.*[\\/])?([\w$]+\.java):(\d+): (error|warning): (.*)$/.exec(lines[i])
    if (!head) continue
    // A single-file run compiles as <MainClass>.java, which may differ from the tab name.
    const file = names.includes(head[1]) ? head[1] : names.length === 1 ? names[0] : head[1]
    const source = lines[i + 1] ?? ''
    const caret = lines[i + 2] ?? ''
    const caretAt = /^\s*\^\s*$/.test(caret) ? caret.indexOf('^') : -1
    const extra = []
    let symbol = null
    for (let k = i + (caretAt >= 0 ? 3 : 1); k < lines.length && /^\s{2,}\S/.test(lines[k]) && !/\.java:\d+:/.test(lines[k]); k++) {
      extra.push(lines[k].trim())
      const sym = /^symbol:\s+(class|variable|method)\s+([\w$]+)/.exec(lines[k].trim())
      if (sym) symbol = { kind: sym[1], name: sym[2] }
    }
    let column = caretAt >= 0 ? caretAt + 1 : 1
    let endColumn = column + 1
    if (caretAt >= 0) {
      const word = /^[\w$]+/.exec(source.slice(caretAt))
      if (word) endColumn = column + word[0].length
    } else {
      column = (source.search(/\S/) + 1) || 1
      endColumn = source.length + 1
    }
    out.push({
      file,
      line: Number(head[2]),
      column,
      endColumn,
      severity: head[3],
      message: [head[4], ...extra].join('\n'),
      symbol,
    })
  }
  return out
}
