import { useEffect, useRef } from 'react'
import { DiffEditor } from '@monaco-editor/react'
import { FiLoader } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import { fileLanguage } from '../../lib/codelab/assistantTools'
import '../../lib/monacoSetup'

const OPTIONS = {
  readOnly: true,
  originalEditable: false,
  renderSideBySide: false,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 12,
  lineNumbersMinChars: 3,
  automaticLayout: true,
  renderOverviewRuler: false,
}

// A read-only view of a proposed change. Loaded on demand with the assistant panel.
export default function AssistantDiff({ path, before, after, height = 220 }) {
  const { theme } = useTheme()
  const editorRef = useRef(null)

  // DiffEditor disposes its models before its widget, which Monaco reports as an error. So
  // it keeps them (the keepCurrent props below), and they are released here, in the safe
  // order: this cleanup runs before the child's.
  useEffect(() => () => {
    const editor = editorRef.current
    const models = editor?.getModel()
    editor?.setModel(null)
    models?.original?.dispose()
    models?.modified?.dispose()
  }, [])

  return (
    <div style={{ height }} className="overflow-hidden rounded-lg border border-ink-200 dark:border-ink-800">
      <DiffEditor
        original={before}
        modified={after}
        language={fileLanguage(path)}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        options={OPTIONS}
        keepCurrentOriginalModel
        keepCurrentModifiedModel
        onMount={(editor) => { editorRef.current = editor }}
        loading={<FiLoader className="h-4 w-4 animate-spin text-ink-400" />}
      />
    </div>
  )
}
