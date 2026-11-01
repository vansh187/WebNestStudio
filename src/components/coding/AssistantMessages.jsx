import { memo, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  FiAlertCircle, FiCheck, FiChevronDown, FiChevronRight, FiCopy, FiEdit3, FiEye, FiFilePlus, FiList, FiLoader,
  FiPlay, FiSend, FiSlash, FiTrash2,
} from 'react-icons/fi'
import { codeBlockTarget, describeToolCall } from '../../lib/codelab/assistantTools'

const TOOL_ICONS = {
  list_files: FiList,
  read_file: FiEye,
  edit_file: FiEdit3,
  create_file: FiFilePlus,
  delete_file: FiTrash2,
  run_project: FiPlay,
  get_errors: FiAlertCircle,
  send_api_request: FiSend,
}
const OPENS_FILE = new Set(['read_file', 'edit_file', 'create_file'])

function textOf(children) {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(textOf).join('')
  return children?.props ? textOf(children.props.children) : ''
}

function CodeBlock({ language, target, code, onApply, applyDisabled }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* Clipboard blocked: the code can still be selected by hand. */
    }
  }
  return (
    <div className="my-3 overflow-hidden rounded-lg border border-ink-800 bg-ink-950 shadow-sm">
      <div className="flex items-center gap-2 border-b border-ink-800 bg-ink-900 px-3 py-1.5">
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-ink-300" title={target ?? language}>{target ?? language ?? 'code'}</span>
        <button type="button" onClick={copy} className="inline-flex h-6 items-center gap-1 rounded px-1.5 text-[11px] font-medium text-ink-300 hover:bg-ink-800 hover:text-white">
          {copied ? <FiCheck className="h-3 w-3 text-emerald-400" /> : <FiCopy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        {onApply && (
          <button type="button" onClick={() => onApply(target, code)} disabled={applyDisabled} title={target ? `Apply to ${target}` : 'Apply to the open file'} className="inline-flex h-6 items-center gap-1 rounded bg-gold-400 px-2 text-[11px] font-semibold text-ink-950 hover:bg-gold-300 disabled:opacity-50">
            Apply
          </button>
        )}
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-ink-100"><code>{code}</code></pre>
    </div>
  )
}

// Model output is untrusted. react-markdown renders no raw HTML, and images are dropped: a
// crafted image address could carry data out without a click.
function Markdown({ text, onApply, applyDisabled }) {
  const components = useMemo(() => ({
    pre({ node, children }) {
      const codeNode = node?.children?.[0]
      const language = /language-([\w-]+)/.exec(codeNode?.properties?.className?.join?.(' ') ?? '')?.[1]
      const target = codeBlockTarget(`${language ?? 'code'} ${codeNode?.data?.meta ?? ''}`)
      return <CodeBlock language={language} target={target} code={textOf(children).replace(/\n$/, '')} onApply={onApply} applyDisabled={applyDisabled} />
    },
    code: ({ children }) => <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[0.85em] text-ink-800 dark:bg-ink-800 dark:text-ink-100">{children}</code>,
    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-gold-700 underline dark:text-gold-300">{children}</a>,
    p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
    ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
    h1: ({ children }) => <h3 className="mb-1 mt-3 text-sm font-semibold text-ink-900 dark:text-white">{children}</h3>,
    h2: ({ children }) => <h3 className="mb-1 mt-3 text-sm font-semibold text-ink-900 dark:text-white">{children}</h3>,
    h3: ({ children }) => <h4 className="mb-1 mt-3 text-sm font-semibold text-ink-900 dark:text-white">{children}</h4>,
    strong: ({ children }) => <strong className="font-semibold text-ink-900 dark:text-white">{children}</strong>,
  }), [onApply, applyDisabled])
  return <ReactMarkdown components={components} disallowedElements={['img']} unwrapDisallowed>{text}</ReactMarkdown>
}

function ToolRow({ call, result, waiting, onOpenFile }) {
  const [open, setOpen] = useState(false)
  // Own properties only: the name comes from the model, and could be "constructor".
  const Icon = Object.hasOwn(TOOL_ICONS, call.name) ? TOOL_ICONS[call.name] : FiList
  const failed = result?.is_error
  const hasDetails = Boolean(result?.content) && (failed || ['run_project', 'get_errors', 'send_api_request'].includes(call.name))
  const opensFile = !failed && OPENS_FILE.has(call.name) && call.arguments?.path
  const label = describeToolCall(call.name, call.arguments, { pending: waiting })

  let status = <FiSlash className="h-3.5 w-3.5 text-ink-400" aria-label="Did not run" />
  if (waiting) status = <FiLoader className="h-3.5 w-3.5 animate-spin text-gold-500" aria-label="Running" />
  else if (failed) status = <FiAlertCircle className="h-3.5 w-3.5 text-red-500" aria-label="Failed" />
  else if (result) status = <FiCheck className="h-3.5 w-3.5 text-emerald-500" aria-label="Done" />

  const body = (
    <>
      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-400" />
      <span className={`min-w-0 flex-1 truncate text-left ${failed ? 'text-red-600 dark:text-red-400' : ''}`} title={label}>{label}</span>
      {hasDetails && (open ? <FiChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-400" /> : <FiChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-400" />)}
      <span className="shrink-0">{status}</span>
    </>
  )
  const rowClass = 'flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs text-ink-600 dark:text-ink-300'
  return (
    <li>
      {hasDetails ? (
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`${rowClass} hover:bg-ink-100 dark:hover:bg-ink-800`}>{body}</button>
      ) : opensFile ? (
        <button type="button" onClick={() => onOpenFile?.(call.arguments.path)} className={`${rowClass} hover:bg-ink-100 dark:hover:bg-ink-800`}>{body}</button>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
      {open && <pre className="mx-2 mb-1 mt-0.5 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-ink-950 p-2 font-mono text-[11px] leading-relaxed text-ink-100">{result.content}</pre>}
    </li>
  )
}

// The conversation. Tool results are shown on the call they answer, not as messages.
function AssistantMessagesBase({ messages, busy, onApply, onOpenFile }) {
  const results = useMemo(() => {
    const byId = new Map()
    messages.forEach((message) => { if (message.role === 'tool') byId.set(message.tool_call_id, message) })
    return byId
  }, [messages])

  return messages.map((message, index) => {
    const key = `${message.role}-${index}`
    if (message.role === 'tool') return null
    if (message.undo) {
      return message.role === 'user' ? (
        <p key={key} className="py-1 text-center text-[11px] font-medium text-ink-500 dark:text-ink-400">
          You undid the last task's changes.
          {message.kept?.length > 0 && ` Your own edits to ${message.kept.join(', ')} were kept.`}
        </p>
      ) : null
    }
    if (message.role === 'user') {
      return (
        <div key={key} className="flex justify-end">
          <p className="max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-ink-900 px-3.5 py-2 text-sm leading-relaxed text-white dark:bg-ink-700">{message.content}</p>
        </div>
      )
    }
    return (
      <div key={key} className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">
        {message.content && <Markdown text={message.content} onApply={onApply} applyDisabled={busy} />}
        {message.tool_calls?.length > 0 && (
          <ul className="mt-1.5 space-y-0.5 rounded-lg border border-ink-200/70 bg-ink-50/70 p-1 dark:border-ink-800 dark:bg-ink-900/60">
            {message.tool_calls.map((call) => (
              <ToolRow key={call.id} call={call} result={results.get(call.id)} waiting={busy && !results.has(call.id)} onOpenFile={onOpenFile} />
            ))}
          </ul>
        )}
      </div>
    )
  })
}

export const AssistantMessages = memo(AssistantMessagesBase)

// The reply still being written.
export function StreamingReply({ text }) {
  return (
    <div className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">
      <Markdown text={text} />
    </div>
  )
}
