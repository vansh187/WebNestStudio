import { FiFileText, FiPlus } from 'react-icons/fi'

export default function FileTabs({ files = [], selectedFile, onSelectFile, onAddFile }) {
  return (
    <div className="flex min-h-11 items-center gap-1 overflow-x-auto rounded-t-xl border border-b-0 border-ink-200 bg-ink-50 px-2 dark:border-ink-800 dark:bg-ink-950">
      {files.map((file) => {
        const active = file.name === selectedFile
        return (
          <button
            key={file.name}
            type="button"
            onClick={() => onSelectFile?.(file.name)}
            className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-semibold ${
              active
                ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-900 dark:text-white'
                : 'text-ink-500 hover:text-gold-500 dark:text-ink-300'
            }`}
          >
            <FiFileText className="h-3.5 w-3.5" />
            {file.name}
          </button>
        )
      })}
      {onAddFile && (
        <button
          type="button"
          onClick={onAddFile}
          className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-500 hover:bg-white hover:text-gold-500 dark:text-ink-300 dark:hover:bg-ink-900"
          title="Add file"
          aria-label="Add file"
        >
          <FiPlus className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
