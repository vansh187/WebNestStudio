// Connects the Java engine to Monaco. Loaded lazily by CodeEditor the first time a Java
// editor mounts, so the JDK catalog never ships to people who don't open Java.
import catalog from '../../../data/java/jdkCatalog.json'
import { createJavaIntel } from './engine.js'

const intel = createJavaIntel(catalog)
// Per-model project context ({ files, activeName }) and javac diagnostics.
const projects = new Map()
const diagnostics = new Map()
let registered = false

export function setModelProject(model, project) {
  if (model) projects.set(model.uri.toString(), project)
}

// Called when an editor unmounts (its model may already be disposed).
export function forgetModel(model) {
  if (!model) return
  projects.delete(model.uri.toString())
  diagnostics.delete(model.uri.toString())
}

// Engine offsets are over LF text; Monaco's are over the model's own line endings.
function snapshot(monaco, model, position) {
  const text = model.getValue(monaco.editor.EndOfLinePreference.LF)
  const crlf = model.getEOL() === '\r\n'
  const offset = position ? model.getOffsetAt(position) - (crlf ? position.lineNumber - 1 : 0) : 0
  const project = projects.get(model.uri.toString()) ?? {}
  return { text, offset, input: { files: project.files ?? [], activeName: project.activeName ?? 'Main.java', content: text, offset } }
}

function positionAt(text, offset) {
  const before = text.slice(0, offset)
  const lineStart = before.lastIndexOf('\n') + 1
  return { lineNumber: (before.match(/\n/g)?.length ?? 0) + 1, column: offset - lineStart + 1 }
}

function rangeAt(monaco, text, start, end = start) {
  const a = positionAt(text, start)
  const b = positionAt(text, end)
  return new monaco.Range(a.lineNumber, a.column, b.lineNumber, b.column)
}

export function setJavacMarkers(monaco, model, list = []) {
  if (!model) return
  diagnostics.set(model.uri.toString(), list)
  monaco.editor.setModelMarkers(model, 'javac', list.map((d) => ({
    startLineNumber: d.line,
    startColumn: d.column,
    endLineNumber: d.line,
    endColumn: Math.max(d.endColumn, d.column + 1),
    message: d.message,
    severity: d.severity === 'warning' ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
    source: 'javac',
  })))
}

export function registerJavaIntel(monaco) {
  if (registered) return
  registered = true
  const K = monaco.languages.CompletionItemKind
  const kinds = { method: K.Method, field: K.Field, constant: K.Constant, variable: K.Variable, class: K.Class, interface: K.Interface, enum: K.Enum, keyword: K.Keyword, snippet: K.Snippet, constructor: K.Constructor, module: K.Module }

  monaco.languages.registerCompletionItemProvider('java', {
    triggerCharacters: ['.'],
    provideCompletionItems(model, position) {
      const { text, offset, input } = snapshot(monaco, model, position)
      const { items, wordStart = offset } = intel.complete(input)
      const range = rangeAt(monaco, text, wordStart, offset)
      return {
        suggestions: items.map((item) => ({
          label: item.detail || item.description ? { label: item.label, detail: item.detail, description: item.description } : item.label,
          kind: kinds[item.kind] ?? K.Text,
          insertText: item.insertText,
          insertTextRules: item.snippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
          documentation: item.documentation || undefined,
          sortText: item.sortText,
          filterText: item.label,
          range,
          additionalTextEdits: item.importEdit ? [{ range: rangeAt(monaco, text, item.importEdit.offset), text: item.importEdit.text }] : undefined,
          command: item.triggerSignatureHelp
            ? { id: 'editor.action.triggerParameterHints', title: 'Parameter hints' }
            : item.retrigger ? { id: 'editor.action.triggerSuggest', title: 'Suggest' } : undefined,
        })),
      }
    },
  })

  monaco.languages.registerSignatureHelpProvider('java', {
    signatureHelpTriggerCharacters: ['(', ','],
    signatureHelpRetriggerCharacters: [')'],
    provideSignatureHelp(model, position) {
      const help = intel.signatureHelp(snapshot(monaco, model, position).input)
      if (!help) return null
      return {
        value: {
          signatures: help.signatures.map((s) => ({ label: s.label, documentation: s.documentation, parameters: s.parameters })),
          activeSignature: help.activeSignature,
          activeParameter: help.activeParameter,
        },
        dispose() {},
      }
    },
  })

  monaco.languages.registerHoverProvider('java', {
    provideHover(model, position) {
      const { text, input } = snapshot(monaco, model, position)
      const info = intel.hover(input)
      if (!info) return null
      const [code, ...rest] = info.contents
      return {
        range: rangeAt(monaco, text, info.range.start, info.range.end),
        contents: [{ value: `\`\`\`java\n${code}\n\`\`\`` }, ...rest.map((value) => ({ value }))],
      }
    },
  })

  monaco.languages.registerCodeActionProvider('java', {
    provideCodeActions(model, range) {
      const list = diagnostics.get(model.uri.toString()) ?? []
      const { text, input } = snapshot(monaco, model, null)
      const actions = []
      const seen = new Set()
      for (const d of list) {
        if (d.symbol?.kind !== 'class' || d.line < range.startLineNumber || d.line > range.endLineNumber || seen.has(d.symbol.name)) continue
        const fix = intel.importFix(input, d.symbol.name)
        if (!fix) continue
        seen.add(d.symbol.name)
        actions.push({
          title: `Import ${fix.fqn}`,
          kind: 'quickfix',
          isPreferred: true,
          edit: { edits: [{ resource: model.uri, textEdit: { range: rangeAt(monaco, text, fix.edit.offset), text: fix.edit.text }, versionId: model.getVersionId() }] },
        })
      }
      return { actions, dispose() {} }
    },
  })
}
