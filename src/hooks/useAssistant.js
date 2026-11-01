import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useWorkspaceStorage } from './useWorkspaceStorage'
import { fetchAssistantUsage, streamChat } from '../lib/codelab/assistantClient'
import { repairHistory, runAssistantTask, trimHistory, STORED_MESSAGES } from '../lib/codelab/assistantAgent'
import { buildContext, errorsOf, planApply, rebaseApply, recordChange, runTool, undoChanges } from '../lib/codelab/assistantTools'
import { isPrivateFile } from '../lib/codelab/backendFiles'
import { getAccessToken } from '../lib/tokenStore'
import { codelabLocal } from '../lib/codelab/idb'
import { ASSISTANT_PREFIX, ASSISTANT_PREFS_KEY } from '../lib/codelab/storageKeys'

const PLAN_CHECK_WAIT_MS = 15000

const readPrefs = () => codelabLocal.getJSON(ASSISTANT_PREFS_KEY) ?? {}

// The assistant's conversation and task state for one workspace. Everything the model may
// do goes through assistantTools.js; this hook connects it to the editor and the user.
// `project` holds the workspace's current { language, files, selectedFile, onFilesChange,
// runProject, lastResult, onOpenFile }, plus `api` for a FastAPI project.
// A workspace keeps one chat: switching language replaces its files, so it starts a new one.
export function useAssistant({ workspaceKey, project, enabled }) {
  const storageKey = `${ASSISTANT_PREFIX}${workspaceKey}`
  const { language } = project
  const readChat = useCallback((saved) => ({ messages: saved?.language === language && Array.isArray(saved.messages) ? repairHistory(saved.messages) : [] }), [language])
  const toSavedChat = useCallback(({ messages }) => ({ language, messages: trimHistory(messages, STORED_MESSAGES) }), [language])
  const [chat, updateChat] = useWorkspaceStorage(storageKey, readChat, toSavedChat)
  const [prefs, setPrefs] = useState(readPrefs)
  const [status, setStatus] = useState('idle') // idle, working, or tool (a tool is running)
  const [streamText, setStreamText] = useState('')
  const [activeTool, setActiveTool] = useState(null)
  const [approval, setApproval] = useState(null)
  const [error, setError] = useState(null)
  const [outcome, setOutcome] = useState(null) // the last task: step_limit, cut_off or stopped
  const [usage, setUsage] = useState(null)
  const [planChecked, setPlanChecked] = useState(false)
  const [undoLog, setUndoLog] = useState(null)

  // Always the latest, for the task running across many renders.
  const projectRef = useRef(project)
  const messagesRef = useRef(chat.messages)
  const filesRef = useRef(project.files)
  projectRef.current = project
  messagesRef.current = chat.messages
  filesRef.current = project.files

  const abortRef = useRef(null)
  const frameRef = useRef(0)
  const latestText = useRef('')
  const approvalResolve = useRef(null)
  // The latest run of this task, newer than the props until React re-renders: the next tool in
  // the same step must not see the state from before the run.
  const taskRun = useRef(null)
  // Actions approved for this task: 'run' and 'request'. Each is asked once.
  const approvedActions = useRef(new Set())
  const autoApply = useRef(Boolean(prefs.autoApply))
  autoApply.current = Boolean(prefs.autoApply)

  const updatePrefs = useCallback((change) => {
    setPrefs((current) => {
      const next = { ...current, ...change }
      codelabLocal.setJSON(ASSISTANT_PREFS_KEY, next)
      return next
    })
  }, [])

  const setMode = useCallback((mode) => updatePrefs({ mode }), [updatePrefs])
  const setAutoApply = useCallback((value) => updatePrefs({ autoApply: value }), [updatePrefs])
  const acknowledgeNotice = useCallback(() => updatePrefs({ noticeSeen: true }), [updatePrefs])

  // Remaining calls, and whether the assistant is available at all.
  const refreshUsage = useCallback(async (signal) => {
    const next = await fetchAssistantUsage(signal)
    if (next && !signal?.aborted) setUsage(next)
    return next
  }, [])
  useEffect(() => {
    if (!enabled) return undefined
    const controller = new AbortController()
    // A slow or failed read must not hold the panel closed: the server still refuses a chat
    // from anyone who hasn't paid (402), which brings the payment card up.
    const giveUp = setTimeout(() => setPlanChecked(true), PLAN_CHECK_WAIT_MS)
    refreshUsage(controller.signal).finally(() => {
      clearTimeout(giveUp)
      if (!controller.signal.aborted) setPlanChecked(true)
    })
    return () => {
      clearTimeout(giveUp)
      controller.abort()
    }
  }, [enabled, refreshUsage])

  const addMessage = useCallback((message) => {
    // The ref too: the next step of a task reads it before React has re-rendered.
    messagesRef.current = [...messagesRef.current, message]
    updateChat(storageKey, (current) => ({ ...current, messages: [...current.messages, message] }))
  }, [storageKey, updateChat])

  const resolveApproval = useCallback((answer) => {
    const resolve = approvalResolve.current
    approvalResolve.current = null
    setApproval(null)
    resolve?.(answer)
  }, [])

  // The file open in the editor may be the one that was just removed.
  const keepOpenFile = useCallback((files) => {
    const { selectedFile, onOpenFile } = projectRef.current
    if (files.some((file) => file.name === selectedFile)) return
    const first = files.find((file) => !isPrivateFile(file.name))
    if (first) onOpenFile?.(first.name)
  }, [])

  // What a tool may reach. Changes wait for the user unless they turned on auto-apply; a
  // run is asked once per task.
  const toolEnv = useMemo(() => ({
    get language() { return projectRef.current.language },
    secrets: () => [getAccessToken()].filter(Boolean),
    getFiles: () => filesRef.current,
    applyFiles: (next, plan) => {
      setUndoLog((current) => recordChange(current, plan))
      filesRef.current = next
      projectRef.current.onFilesChange(next)
      if (plan.kind === 'delete') keepOpenFile(next)
      else projectRef.current.onOpenFile?.(plan.path)
    },
    approve: (request) => {
      if (request.type === 'change' && autoApply.current) return Promise.resolve(true)
      // With auto-apply on, nobody has read the code, so running it is still asked every time:
      // code can reach the network and the login token in the runtime.
      if (approvedActions.current.has(request.type) && !autoApply.current) return Promise.resolve(true)
      return new Promise((resolve) => {
        approvalResolve.current = (answer) => {
          if (request.type !== 'change' && answer) approvedActions.current.add(request.type)
          resolve(answer)
        }
        setApproval(request)
      })
    },
    run: async () => {
      taskRun.current = await projectRef.current.runProject(filesRef.current)
      return taskRun.current
    },
    lastResult: () => taskRun.current ?? projectRef.current.lastResult(),
    request: (spec) => projectRef.current.api?.request(spec, 'assistant'),
    apiReady: () => (taskRun.current ? taskRun.current.status === 'success' : Boolean(projectRef.current.api?.ready)),
    debugPaused: () => Boolean(projectRef.current.api?.debugPause),
  }), [keepOpenFile])

  const runTask = useCallback(async (mode) => {
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('working')
    setError(null)
    setOutcome(null)
    approvedActions.current = new Set()
    taskRun.current = null
    try {
      const result = await runAssistantTask({
        mode,
        signal: controller.signal,
        getMessages: () => messagesRef.current,
        stream: ({ messages, signal, onEvent }) => {
          const { files, selectedFile, language: current } = projectRef.current
          const context = buildContext({ files: filesRef.current ?? files, selectedFile, lastError: errorsOf(toolEnv.lastResult()), language: current, secrets: toolEnv.secrets() })
          return streamChat({ mode, messages, context, signal, onEvent })
        },
        runTool: (name, args) => runTool(name, args, toolEnv),
        // Streamed text repaints once per frame, however fast the pieces arrive.
        onDelta: (text) => {
          latestText.current = text
          if (frameRef.current) return
          frameRef.current = requestAnimationFrame(() => {
            frameRef.current = 0
            setStreamText(latestText.current)
          })
        },
        onMessage: (message) => {
          cancelAnimationFrame(frameRef.current)
          frameRef.current = 0
          latestText.current = ''
          setStreamText('')
          addMessage(message)
        },
        onToolStart: (call) => {
          setStatus('tool')
          setActiveTool(call)
        },
        onUsage: (next) => {
          setStatus('working')
          setActiveTool(null)
          setUsage((current) => ({ enabled: true, ...current, calls_used_today: next.calls_used_today, calls_limit: next.calls_limit, ...(next.access ? { access: next.access } : {}) }))
        },
      })
      if (result.status !== 'done') setOutcome(result.status)
    } catch (failure) {
      setError({ message: failure?.message || 'WebNest AI could not answer. Please try again.', status: failure?.status ?? 0, retryAfter: failure?.retryAfter ?? null })
      if (failure?.status === 402 || failure?.status === 404 || failure?.status === 503) refreshUsage()
    } finally {
      abortRef.current = null
      taskRun.current = null
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      latestText.current = ''
      setStreamText('')
      setActiveTool(null)
      setStatus('idle')
    }
  }, [addMessage, refreshUsage, toolEnv])

  const busy = status !== 'idle'

  const send = useCallback((text) => {
    const content = text.trim()
    if (!content || busy || !prefs.mode) return
    setUndoLog(null)
    addMessage({ role: 'user', content })
    runTask(prefs.mode)
  }, [addMessage, busy, prefs.mode, runTask])

  // Tries the failed call again, or carries on after the step limit.
  const resume = useCallback(() => {
    if (busy || !prefs.mode) return
    runTask(prefs.mode)
  }, [busy, prefs.mode, runTask])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    // A pending approval is a task waiting on the user: Stop answers it with no.
    if (approvalResolve.current) resolveApproval(false)
  }, [resolveApproval])

  // Ending the session (or leaving the workspace) ends the task.
  useEffect(() => {
    if (!enabled) stop()
  }, [enabled, stop])
  useEffect(() => () => {
    abortRef.current?.abort()
    approvalResolve.current?.(false)
    approvalResolve.current = null
    cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }, [storageKey])

  const newChat = useCallback(() => {
    if (busy) return
    setUndoLog(null)
    setError(null)
    setOutcome(null)
    messagesRef.current = []
    updateChat(storageKey, (current) => ({ ...current, messages: [] }))
  }, [busy, storageKey, updateChat])

  // One undo for what the last task changed. Anything the user edited since stays as it is.
  const undoTask = useCallback(() => {
    if (!undoLog || busy) return
    const { files, restored, kept } = undoChanges(undoLog, filesRef.current)
    setUndoLog(null)
    if (restored.length) {
      filesRef.current = files
      projectRef.current.onFilesChange(files)
      keepOpenFile(files)
    }
    // The model should know, so its next reply doesn't assume those changes exist.
    const keptNote = kept.length ? ` I had changed ${kept.join(', ')} myself, so those stay as they are.` : ''
    addMessage({ role: 'user', content: `[I undid the changes from your last task.${keptNote}]`, undo: true, kept })
    addMessage({ role: 'assistant', content: 'Understood: those changes are gone.', undo: true })
  }, [addMessage, busy, keepOpenFile, undoLog])

  // Apply on a code block (Ask mode): returns a plan to show as a diff, or a refusal.
  const previewApply = useCallback((path, code) => planApply(path, code, filesRef.current, projectRef.current.language), [])
  // Returns why it could not be applied, or ''.
  const confirmApply = useCallback((plan) => {
    const latest = rebaseApply(plan, filesRef.current)
    if (latest.isError) return latest.content
    setUndoLog((current) => recordChange(current, latest))
    filesRef.current = latest.files
    projectRef.current.onFilesChange(latest.files)
    projectRef.current.onOpenFile?.(latest.path)
    return ''
  }, [])

  return {
    messages: chat.messages,
    mode: prefs.mode ?? null,
    setMode,
    autoApply: Boolean(prefs.autoApply),
    setAutoApply,
    noticeSeen: Boolean(prefs.noticeSeen),
    acknowledgeNotice,
    status,
    busy,
    streamText,
    activeTool,
    approval,
    resolveApproval,
    error,
    outcome,
    usage,
    refreshUsage,
    planChecked,
    canUndo: Boolean(undoLog) && !busy,
    send,
    resume,
    stop,
    newChat,
    undoTask,
    previewApply,
    confirmApply,
  }
}
