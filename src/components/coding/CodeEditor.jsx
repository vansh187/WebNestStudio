import { useEffect, useState } from 'react'
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

export default function CodeEditor({ value, onChange, language, readOnly = false, className = '' }) {
  const { theme } = useTheme()
  const isLarge = useIsLargeScreen()

  const options = {
    automaticLayout: true,
    readOnly,
    domReadOnly: readOnly,
    minimap: { enabled: isLarge && !readOnly },
    fontSize: isLarge ? 14 : 13,
    wordWrap: isLarge ? 'off' : 'on',
    folding: isLarge,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    tabSize: 2,
    smoothScrolling: true,
    padding: { top: 12, bottom: 12 },
    // Let the page scroll when the pointer leaves the (often short) editor on mobile.
    scrollbar: { alwaysConsumeMouseWheel: false },
    contextmenu: isLarge,
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900/40 ${className}`}
    >
      <Editor
        value={value}
        language={language}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        onChange={(v) => onChange?.(v ?? '')}
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
