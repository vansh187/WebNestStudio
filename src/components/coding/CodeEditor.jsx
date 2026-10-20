import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { FiLoader } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import '../../lib/monacoSetup'

const LG_QUERY = '(min-width: 1024px)'

// Read the lg breakpoint via matchMedia (not a resize handler) so Monaco options
// switch between the compact phone/tablet layout and the roomier desktop one.
function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(LG_QUERY).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(LG_QUERY)
    const onChange = (e) => setIsLarge(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isLarge
}

// Monaco hover providers are per language, not per editor, so one provider looks up the
// paused debugger's values for whichever model is hovered (see the debugHover prop).
const debugHovers = new Map()
let debugHoverProvider = null

function registerDebugHover(monaco) {
  if (debugHoverProvider) return
  debugHoverProvider = monaco.languages.registerHoverProvider('python', {
    provideHover(model, position) {
      const hover = debugHovers.get(model.uri.toString())
      if (!hover) return null
      const lineText = model.getLineContent(position.lineNumber)
      const result = hover(lineText, position.column)
      if (!result) return null
      return {
        range: new monaco.Range(position.lineNumber, result.startColumn, position.lineNumber, result.endColumn),
        contents: [{ value: result.markdown }],
      }
    },
  })
}

// Java suggestions (see lib/codelab/javaIntel) load on first use so other languages never pay for them.
function useJavaIntel({ editorState, language, readOnly, javaProject, markers }) {
  const [intel, setIntel] = useState(null)
  const enabled = language === 'java' && !readOnly

  useEffect(() => {
    if (!enabled || !editorState || intel) return undefined
    let cancelled = false
    import('../../lib/codelab/javaIntel/monacoJava.js')
      .then((mod) => {
        if (cancelled) return
        mod.registerJavaIntel(editorState.monaco)
        setIntel(mod)
      })
      .catch(() => { /* Suggestions are optional; the editor keeps working without them. */ })
    return () => { cancelled = true }
  }, [enabled, editorState, intel])

  useEffect(() => {
    if (!intel || !editorState) return
    intel.setModelProject(editorState.editor.getModel(), javaProject ?? { files: [], activeName: 'Main.java' })
  }, [intel, editorState, javaProject])

  useEffect(() => {
    if (!intel || !editorState) return
    intel.setJavacMarkers(editorState.monaco, editorState.editor.getModel(), enabled ? markers ?? [] : [])
  }, [intel, editorState, markers, enabled])

  useEffect(() => {
    if (!intel || !editorState) return undefined
    const model = editorState.editor.getModel()
    return () => intel.forgetModel(model)
  }, [intel, editorState])
}

export default function CodeEditor({
  value, onChange, language, readOnly = false, className = '', roundedTop = true, javaProject, markers,
  // `path` keeps a separate Monaco model (and undo history) per file; `frameless` drops the
  // border so the editor can sit edge to edge inside an IDE layout.
  path, frameless = false, revealLine, breakpoints = [], onToggleBreakpoint, onBreakpointsChange, pausedLine,
  // While a debugged request is paused: debugHover(lineText, column) returns
  // { markdown, startColumn, endColumn } for the value under the pointer, and inlineValues
  // ([{ line, text, changed }]) are drawn after their lines, as in VS Code.
  debugHover, inlineValues,
}) {
  const { theme } = useTheme()
  const isLarge = useIsLargeScreen()
  const [editorState, setEditorState] = useState(null)
  const breakpointDecorationsRef = useRef([])
  const pausedDecorationsRef = useRef([])
  const inlineDecorationsRef = useRef({ model: null, ids: [] })
  useJavaIntel({ editorState, language, readOnly, javaProject, markers })

  useEffect(() => {
    if (!editorState || !debugHover) return undefined
    const { editor, monaco } = editorState
    registerDebugHover(monaco)
    const model = editor.getModel()
    if (!model) return undefined
    const key = model.uri.toString()
    debugHovers.set(key, debugHover)
    return () => {
      if (debugHovers.get(key) === debugHover) debugHovers.delete(key)
    }
  }, [editorState, debugHover, path])

  useEffect(() => {
    if (!editorState) return
    const { editor, monaco } = editorState
    const model = editor.getModel()
    if (!model) return
    // Values belong to one file: clear the last file's when the editor switched models.
    const last = inlineDecorationsRef.current
    if (last.model && last.model !== model && !last.model.isDisposed()) last.model.deltaDecorations(last.ids, [])
    const lineCount = model.getLineCount()
    const ids = model.deltaDecorations(last.model === model ? last.ids : [], (inlineValues ?? [])
      .filter((item) => item.line >= 1 && item.line <= lineCount)
      .map((item) => ({
        range: new monaco.Range(item.line, Number.MAX_SAFE_INTEGER, item.line, Number.MAX_SAFE_INTEGER),
        options: {
          after: { content: `  ${item.text}`, inlineClassName: item.changed ? 'wn-debug-inline-value wn-debug-inline-changed' : 'wn-debug-inline-value' },
          showIfCollapsed: true,
        },
      })))
    inlineDecorationsRef.current = { model, ids }
  }, [editorState, inlineValues, path])

  useEffect(() => {
    if (!editorState || !Number.isInteger(revealLine) || revealLine < 1) return
    const editor = editorState.editor
    const line = Math.min(revealLine, editor.getModel()?.getLineCount() ?? revealLine)
    editor.setPosition({ lineNumber: line, column: 1 })
    editor.revealLineInCenter(line)
    editor.focus()
  }, [editorState, revealLine])

  useEffect(() => {
    if (!editorState) return
    const { editor, monaco } = editorState
    breakpointDecorationsRef.current = editor.deltaDecorations(breakpointDecorationsRef.current, breakpoints.map((line) => ({
      range: new monaco.Range(line, 1, line, 1),
      options: {
        glyphMarginClassName: 'wn-breakpoint-glyph',
        glyphMarginHoverMessage: { value: 'Breakpoint — click to remove' },
        // Moves with its line when lines are added or removed above it.
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
      },
    })))
  }, [editorState, breakpoints])

  useEffect(() => {
    if (!editorState) return
    const { editor, monaco } = editorState
    pausedDecorationsRef.current = editor.deltaDecorations(pausedDecorationsRef.current, Number.isInteger(pausedLine) ? [{
      range: new monaco.Range(pausedLine, 1, pausedLine, 1),
      options: { isWholeLine: true, className: 'wn-debug-current-line', linesDecorationsClassName: 'wn-debug-current-marker' },
    }] : [])
  }, [editorState, pausedLine])

  // After an edit, report where the breakpoint markers ended up (two that land on the same
  // line, when a line is deleted, become one), so the saved breakpoints follow the code.
  const breakpointsRef = useRef(breakpoints)
  breakpointsRef.current = breakpoints
  const moveRef = useRef(null)
  moveRef.current = onBreakpointsChange

  useEffect(() => {
    if (!editorState) return undefined
    const { editor } = editorState
    const subscription = editor.onDidChangeModelContent(() => {
      const model = editor.getModel()
      if (!model || !moveRef.current || !breakpointDecorationsRef.current.length) return
      const lines = [...new Set(breakpointDecorationsRef.current
        .map((id) => model.getDecorationRange(id)?.startLineNumber)
        .filter((line) => Number.isInteger(line) && line >= 1 && line <= model.getLineCount()))].sort((a, b) => a - b)
      const before = [...breakpointsRef.current].sort((a, b) => a - b)
      if (lines.length !== before.length || lines.some((line, index) => line !== before[index])) moveRef.current(lines)
    })
    return () => subscription.dispose()
  }, [editorState])

  // @monaco-editor/react has no onMouseDown prop, so listen on the editor instance. The ref
  // keeps the listener current without re-subscribing on every render.
  const toggleRef = useRef(null)
  toggleRef.current = language === 'python' ? onToggleBreakpoint : null

  useEffect(() => {
    if (!editorState) return undefined
    const { editor, monaco } = editorState
    const { GUTTER_GLYPH_MARGIN, GUTTER_LINE_NUMBERS, GUTTER_LINE_DECORATIONS } = monaco.editor.MouseTargetType
    const subscription = editor.onMouseDown((event) => {
      const toggle = toggleRef.current
      const { type, position } = event.target
      if (!toggle || !position?.lineNumber) return
      // One click on the breakpoint gutter, or a double-click on a line number.
      const onGlyph = type === GUTTER_GLYPH_MARGIN
      const onNumber = (type === GUTTER_LINE_NUMBERS || type === GUTTER_LINE_DECORATIONS) && event.event.detail === 2
      if (!onGlyph && !onNumber) return
      event.event.preventDefault()
      toggle(position.lineNumber)
    })
    return () => subscription.dispose()
  }, [editorState])

  const options = {
    automaticLayout: true,
    readOnly,
    domReadOnly: readOnly,
    minimap: { enabled: isLarge && !readOnly },
    fontSize: isLarge ? 14 : 13,
    wordWrap: isLarge ? 'off' : 'on',
    folding: isLarge,
    glyphMargin: language === 'python',
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    tabSize: 2,
    smoothScrolling: true,
    padding: { top: 12, bottom: 12 },
    // Let the page scroll when the pointer leaves the (often short) editor on mobile.
    scrollbar: { alwaysConsumeMouseWheel: false },
    contextmenu: isLarge,
    ...(language === 'java' && !readOnly ? {
      quickSuggestions: { other: true, comments: false, strings: false },
      suggestOnTriggerCharacters: true,
      snippetSuggestions: 'inline',
      wordBasedSuggestions: 'off',
      parameterHints: { enabled: true },
    } : {}),
  }

  return (
    <div
      className={`overflow-hidden bg-white dark:bg-ink-900/40 ${frameless ? '' : `border border-ink-200 dark:border-ink-800 ${roundedTop ? 'rounded-xl' : 'rounded-b-xl'}`} ${className}`}
    >
      <Editor
        value={value}
        path={path}
        language={language}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        onChange={(v) => onChange?.(v ?? '')}
        onMount={(editor, monaco) => setEditorState({ editor, monaco })}
        options={options}
        loading={
          <div className="flex h-full items-center justify-center">
            <FiLoader className="h-5 w-5 animate-spin text-gold-500" />
          </div>
        }
      />
    </div>
  )
}
