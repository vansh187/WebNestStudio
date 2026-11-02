import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiAlertTriangle, FiArrowUp, FiCheck, FiCornerUpLeft, FiEdit3, FiInfo, FiLoader, FiMessageCircle, FiPlay, FiPlus,
  FiSquare, FiX, FiZap,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useAssistant } from '../../hooks/useAssistant'
import { useAssistantPayment } from '../../hooks/useAssistantPayment'
import { PAID_MESSAGE, needsPayment, tokensLeft } from '../../lib/codelab/assistantCheckout'
import { AssistantPaywall, Spark } from './AssistantPaywall'
import PrimeBadge from '../PrimeBadge'
import { usePrime } from '../../hooks/usePrime'
import { AssistantMessages, StreamingReply } from './AssistantMessages'
import ErrorBoundary from '../ErrorBoundary'
import { useVoice } from '../../hooks/useVoice'
import { DEFAULT_VOICE_LANGUAGE, isVoiceLanguage } from '../../lib/codelab/assistantVoice'
import { VoiceButtons, VoiceLanguage } from './AssistantVoice'

const AssistantDiff = lazy(() => import('./AssistantDiff'))

const MAX_PROMPT_LENGTH = 500
const SHOW_COUNT_FROM = 400

const MODES = [
  {
    id: 'ask',
    label: 'Ask',
    icon: FiMessageCircle,
    title: 'Ask questions',
    description: 'Get explanations and code suggestions. Nothing in your project changes until you press Apply.',
    placeholder: 'Ask about your code…',
  },
  {
    id: 'agent',
    label: 'Agent',
    icon: FiZap,
    title: 'Build with an agent',
    description: 'Describe what you want. It reads, edits, runs and fixes your project, and you approve each change.',
    placeholder: 'Describe what to build or fix…',
  },
]

const MODE_BY_ID = Object.fromEntries(MODES.map((mode) => [mode.id, mode]))

// Ways to start, per language. A language not listed uses the general ones.
// The separate Agent screen, where any question is welcome.
const AGENT_SCREEN = {
  title: 'Ask me anything',
  description: 'Ask a question, or describe something to build. I can write, run and fix code, and you approve each change.',
  placeholder: 'Ask anything, or describe what to build…',
}
const ANYTHING_STARTERS = ['Explain how the internet works, simply', 'Write a polite leave application', 'Plan a 30-day study timetable for placements']
const GENERAL_STARTERS = {
  ask: ['Explain the open file', 'Why might my code be failing?', 'How can I improve this code?'],
  agent: ['Add error handling to my code', 'Clean up the open file', 'Run my code and fix any errors'],
}
const STARTERS = {
  backend: {
    ask: ['Explain the open file', 'Why might my API be failing?', 'How do I add a new table?'],
    agent: ['Build a notes API with SQLite', 'Add validation to my routes', 'Run the project and fix any errors'],
  },
  web: {
    ask: ['Explain the open file', "Why isn't my page working?", 'How do I make this page responsive?'],
    agent: ['Build a simple landing page', 'Add a dark mode toggle', 'Run my page and fix any errors'],
  },
  python: {
    ask: ['Explain my code', 'Why might my code be failing?', 'How do I read a file in Python?'],
    agent: ['Write a program that counts words in a sentence', 'Add error handling to my code', 'Run my code and fix any errors'],
  },
  java: {
    ask: ['Explain the open file', "Why won't my code compile?", 'What is the difference between an interface and an abstract class?'],
    agent: ['Build a bank account example with classes', 'Add input validation to my code', 'Run my code and fix any errors'],
  },
}

function ModeSwitch({ mode, onChange, disabled, attention }) {
  return (
    <div role="radiogroup" aria-label="Assistant mode" className={`inline-flex rounded-lg bg-ink-100 p-0.5 dark:bg-ink-800 ${attention ? 'ring-2 ring-gold-400' : ''}`}>
      {MODES.map(({ id, label, icon: Icon, description }) => {
        const active = mode === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(id)}
            title={description}
            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
              active ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-950 dark:text-white' : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${active ? 'text-gold-600 dark:text-gold-400' : ''}`} />
            {label}
          </button>
        )
      })}
    </div>
  )
}

// First screen of a chat: pick how to work, then a few ways to start.
function Welcome({ language, mode, onChoose, onStart, disabled, agentOnly }) {
  const chosen = agentOnly ? { ...MODE_BY_ID.agent, ...AGENT_SCREEN } : MODE_BY_ID[mode]
  const starters = agentOnly && language === 'general' ? ANYTHING_STARTERS : chosen ? (STARTERS[language] ?? GENERAL_STARTERS)[mode] : []
  return (
    <div className="m-auto w-full max-w-md py-4">
      <div className="text-center">
        <Spark className="h-10 w-10" />
        <h3 className="mt-3 font-display text-lg font-bold text-ink-900 dark:text-white">{chosen ? chosen.title : 'How do you want to work?'}</h3>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{chosen ? chosen.description : 'Choose a mode to start. You can switch at any time.'}</p>
      </div>

      {chosen ? (
        <div className="mt-4 space-y-1.5">
          {starters.map((starter) => (
            <button key={starter} type="button" disabled={disabled} onClick={() => onStart(starter)} className="flex w-full items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-left text-xs font-medium text-ink-700 transition-colors hover:border-gold-400 hover:text-ink-950 disabled:opacity-60 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200 dark:hover:text-white">
              <chosen.icon className="h-3.5 w-3.5 shrink-0 text-gold-600 dark:text-gold-400" />
              {starter}
            </button>
          ))}
        </div>
      ) : (
        <div role="radiogroup" aria-label="Choose a mode" className="mt-4 grid gap-2 sm:grid-cols-2">
          {MODES.map(({ id, title, description, icon: Icon }) => (
            <button key={id} type="button" role="radio" aria-checked={false} onClick={() => onChoose(id)} className="group rounded-xl border border-ink-200 bg-white p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md motion-reduce:hover:translate-y-0 dark:border-ink-800 dark:bg-ink-900">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gold-100 text-gold-700 dark:bg-gold-400/15 dark:text-gold-300">
                <Icon className="h-4 w-4" />
              </span>
              <span className="mt-2 block text-sm font-semibold text-ink-900 dark:text-white">{title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-500 dark:text-ink-400">{description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const CHANGE_TITLES = { edit: 'Edit', create: 'Create', delete: 'Delete' }

// A change or a run waiting for the user. Pinned above the composer so it can't be missed.
function ApprovalCard({ title, icon: Icon = FiEdit3, plan, confirmLabel, onConfirm, onCancel, extra }) {
  return (
    <section aria-label="Approval needed" className="border-t border-gold-400/50 bg-gold-50/70 p-3 dark:bg-gold-400/5">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-900 dark:text-white">
        <Icon className="h-3.5 w-3.5 shrink-0 text-gold-600 dark:text-gold-400" />
        <span className="min-w-0 truncate" title={title}>{title}</span>
      </p>
      {plan && (
        <Suspense fallback={<div className="grid h-40 place-items-center"><FiLoader className="h-4 w-4 animate-spin text-ink-400" /></div>}>
          <AssistantDiff path={plan.path} before={plan.before} after={plan.after} height={plan.kind === 'delete' ? 150 : 210} />
        </Suspense>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onConfirm} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink-900 px-3 text-xs font-semibold text-white hover:bg-ink-700 dark:bg-gold-400 dark:text-ink-950 dark:hover:bg-gold-300">
          <FiCheck className="h-3.5 w-3.5" /> {confirmLabel}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-300 px-3 text-xs font-semibold text-ink-700 hover:border-ink-400 dark:border-ink-700 dark:text-ink-200">
          <FiX className="h-3.5 w-3.5" /> Decline
        </button>
        {extra}
      </div>
    </section>
  )
}

function Banner({ tone = 'info', children, action }) {
  const tones = {
    info: 'border-ink-200 bg-ink-50 text-ink-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300',
    error: 'border-red-400/40 bg-red-500/5 text-red-700 dark:text-red-300',
  }
  const Icon = tone === 'error' ? FiAlertTriangle : FiInfo
  return (
    <div role={tone === 'error' ? 'alert' : undefined} className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs leading-relaxed ${tones[tone]}`}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  )
}

const BANNER_BUTTON = 'shrink-0 rounded-md border border-current/30 px-2 py-0.5 font-semibold hover:bg-ink-900/5 dark:hover:bg-white/10'

// `agentOnly` is the separate Agent screen: Agent mode alone, with no Ask mode to switch to.
// `voice` adds the microphone and reading replies aloud. `onLockedChange` tells the page
// whether the plan card is showing, so it can leave room for it. `onBusyChange` tells it
// whether a task is running, `onApproval` that one is waiting for the user, and `onShowFile`
// that the user pressed a file in the chat (`onOpenFile` also hears the agent's own edits).
// See useAssistant for `remembered` and `onRemember`.
export default function AssistantPanel({ workspaceKey, language, files, selectedFile, api, lastResult, onFilesChange, runProject, onOpenFile, agentOnly = false, voice: voiceOn = false, onLockedChange, onBusyChange, onApproval, onShowFile, remembered, onRemember }) {
  const { isAuthenticated, initializing, user } = useAuth()
  const location = useLocation()
  const project = useMemo(() => ({ language, files, selectedFile, api, lastResult, onFilesChange, runProject, onOpenFile }), [language, files, selectedFile, api, lastResult, onFilesChange, runProject, onOpenFile])
  const replyHeard = useRef(null)
  const onReply = useCallback((text) => replyHeard.current?.(text), [])
  const assistant = useAssistant({ workspaceKey, project, enabled: isAuthenticated, fixedMode: agentOnly ? 'agent' : undefined, onReply, remembered, onRemember })
  const { messages, mode, busy, streamText, status, usage, error, outcome, approval, send, setMode, refreshUsage } = assistant
  const payment = useAssistantPayment({ user, enabled: isAuthenticated, refreshUsage })
  const prime = usePrime()

  const [draft, setDraft] = useState('')
  const [applyPlan, setApplyPlan] = useState(null)
  const [applyError, setApplyError] = useState('')
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const stickToBottom = useRef(true)
  const draftRef = useRef(draft)
  draftRef.current = draft
  const getDraft = useCallback(() => draftRef.current, [])

  const voiceLanguage = isVoiceLanguage(assistant.voiceLanguage) ? assistant.voiceLanguage : DEFAULT_VOICE_LANGUAGE
  const voice = useVoice({ language: voiceLanguage, maxLength: MAX_PROMPT_LENGTH, getDraft, setDraft })
  const { speak, stopSpeaking, stopListening, cancelListening } = voice
  replyHeard.current = voiceOn && assistant.readAloud ? speak : null
  // Logging out ends anything still being read or heard.
  useEffect(() => {
    if (isAuthenticated) return
    stopSpeaking()
    stopListening()
  }, [isAuthenticated, stopListening, stopSpeaking])

  const unavailable = usage?.enabled === false
  const locked = !unavailable && needsPayment(usage)
  // Nothing is offered until we know whether this user has paid.
  const checking = !assistant.planChecked && !usage
  const remaining = usage?.calls_limit ? Math.max(usage.calls_limit - (usage.calls_used_today ?? 0), 0) : null
  const canSend = isAuthenticated && !unavailable && !locked && !checking && Boolean(mode) && !busy && Boolean(draft.trim())
  const visibleMessages = messages.length > 0
  useEffect(() => { onLockedChange?.(locked || checking) }, [checking, locked, onLockedChange])
  useEffect(() => { onBusyChange?.(busy) }, [busy, onBusyChange])
  useEffect(() => { if (approval) onApproval?.() }, [approval, onApproval])

  // Follows new text, unless the reader has scrolled up to read something earlier.
  const onScroll = () => {
    const box = scrollRef.current
    if (box) stickToBottom.current = box.scrollHeight - box.scrollTop - box.clientHeight < 60
  }
  useEffect(() => {
    // An empty chat stays at the top, where the provider notice is.
    if (messages.length && stickToBottom.current && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, streamText, approval, error, outcome, status])

  // The composer grows with its text, up to a limit.
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`
  }, [draft])

  const submit = (text = draft) => {
    if (!text.trim() || busy || !mode || unavailable || locked || checking) return
    stickToBottom.current = true
    cancelListening()
    stopSpeaking()
    send(text)
    setDraft('')
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  const chooseMode = (next) => {
    setMode(next)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  // Apply on a code block: shows the change first. Without a named file, the open file.
  const { previewApply, confirmApply } = assistant
  const onApply = useCallback((target, code) => {
    setApplyError('')
    const plan = previewApply(target ?? selectedFile, code)
    if (plan.isError) setApplyError(plan.content)
    else setApplyPlan(plan)
  }, [previewApply, selectedFile])

  if (!initializing && !isAuthenticated) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white p-6 text-center dark:bg-ink-950">
        <Spark className="h-11 w-11" />
        <h3 className="mt-3 font-display text-lg font-bold text-ink-900 dark:text-white">Code with AI, right here</h3>
        <p className="mt-1 max-w-xs text-sm text-ink-500 dark:text-ink-400">Log in to ask questions about your code, or let the agent build and fix it for you.</p>
        <Link to="/login" state={{ from: location }} className="mt-4 inline-flex h-9 items-center rounded-lg bg-ink-900 px-4 text-sm font-semibold text-white hover:bg-ink-700 dark:bg-gold-400 dark:text-ink-950 dark:hover:bg-gold-300">
          Log in to continue
        </Link>
      </div>
    )
  }

  const placeholder = checking ? 'Checking your plan…' : locked ? 'Unlock WebNest AI to start' : !mode ? 'Choose Ask or Agent to start' : agentOnly ? AGENT_SCREEN.placeholder : MODE_BY_ID[mode].placeholder

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-ink-950">
      {/* Header */}
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-ink-200 px-3 dark:border-ink-800">
        <Spark />
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900 dark:text-white">WebNest AI</h2>
        {prime.isPrime && <PrimeBadge short label={prime.label} />}
        {tokensLeft(usage) === null && remaining !== null && (
          <span title={`${remaining} of ${usage.calls_limit} AI calls left today`} className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${remaining === 0 ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'}`}>
            {remaining} left today
          </span>
        )}
        <button type="button" onClick={() => { stopSpeaking(); assistant.newChat() }} disabled={busy || !visibleMessages} title="New chat" aria-label="New chat" className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-40 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white">
          <FiPlus className="h-4 w-4" />
        </button>
      </header>

      {/* Conversation */}
      <div ref={scrollRef} onScroll={onScroll} role="log" aria-label="Conversation" aria-live="polite" aria-busy={busy} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        {unavailable && <Banner>WebNest AI is not available right now. Please try again later.</Banner>}
        {payment.status === 'paid' && !locked && (
          <Banner>{PAID_MESSAGE}</Banner>
        )}
        {checking && !visibleMessages && (
          <p role="status" className="m-auto flex items-center gap-2 text-xs font-medium text-ink-500 dark:text-ink-400">
            <FiLoader className="h-3.5 w-3.5 animate-spin text-gold-500" /> Checking your WebNest AI plan…
          </p>
        )}
        {!visibleMessages && !busy ? (
          !locked && !checking && <Welcome language={language} mode={mode} onChoose={chooseMode} onStart={submit} disabled={unavailable} agentOnly={agentOnly} />
        ) : (
          <AssistantMessages messages={messages} busy={busy} onApply={agentOnly ? undefined : onApply} onOpenFile={onShowFile ?? onOpenFile} />
        )}
        {locked && <AssistantPaywall access={usage.access} payment={payment} />}
        {streamText && <StreamingReply text={streamText} />}
        {busy && !streamText && !approval && (
          <p className="flex items-center gap-2 text-xs font-medium text-ink-500 dark:text-ink-400" role="status">
            <FiLoader className="h-3.5 w-3.5 animate-spin text-gold-500" />
            {status === 'tool' ? 'Working on your project…' : 'Thinking…'}
          </p>
        )}
        {error && error.status !== 402 && (
          <Banner tone="error" action={!unavailable && error.status !== 401 ? <button type="button" onClick={assistant.resume} className={BANNER_BUTTON}>Retry</button> : null}>
            {error.message}
            {error.retryAfter ? ` Try again in ${error.retryAfter} seconds.` : ''}
          </Banner>
        )}
        {outcome === 'step_limit' && (
          <Banner action={<button type="button" onClick={assistant.resume} className={BANNER_BUTTON}>Continue</button>}>
            The agent paused after several steps. Check its work so far, or let it continue.
          </Banner>
        )}
        {outcome === 'cut_off' && (
          <Banner action={<button type="button" onClick={assistant.resume} className={BANNER_BUTTON}>Continue</button>}>The reply was cut short because it got too long.</Banner>
        )}
        {outcome === 'stopped' && <p className="text-center text-[11px] font-medium text-ink-500 dark:text-ink-400">Stopped.</p>}
        {assistant.canUndo && (
          <div className="flex justify-center">
            <button type="button" onClick={assistant.undoTask} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-ink-200 px-3 text-[11px] font-semibold text-ink-600 hover:border-gold-400 hover:text-ink-900 dark:border-ink-700 dark:text-ink-300 dark:hover:text-white">
              <FiCornerUpLeft className="h-3 w-3" /> Undo all changes
            </button>
          </div>
        )}
      </div>

      {/* Waiting for the user */}
      {approval?.type === 'change' && (
        <ApprovalCard
          title={`${CHANGE_TITLES[approval.plan.kind]} ${approval.plan.path}`}
          plan={approval.plan}
          confirmLabel={approval.plan.kind === 'delete' ? 'Delete file' : 'Apply change'}
          onConfirm={() => assistant.resolveApproval(true)}
          onCancel={() => assistant.resolveApproval(false)}
          extra={(
            <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-ink-600 dark:text-ink-300">
              <input type="checkbox" checked={assistant.autoApply} onChange={(event) => assistant.setAutoApply(event.target.checked)} className="accent-gold-500" />
              Auto-apply from now on
            </label>
          )}
        />
      )}
      {approval?.type === 'run' && (
        <ApprovalCard
          title={language === 'backend' ? 'Run the project? It restarts your API with the latest code.' : 'Run your code?'}
          icon={FiPlay}
          confirmLabel="Run"
          onConfirm={() => assistant.resolveApproval(true)}
          onCancel={() => assistant.resolveApproval(false)}
        />
      )}
      {approval?.type === 'request' && (
        <ApprovalCard
          title={`Send ${approval.method} ${approval.path} to your API? It can change your database.`}
          icon={FiPlay}
          confirmLabel="Send"
          onConfirm={() => assistant.resolveApproval(true)}
          onCancel={() => assistant.resolveApproval(false)}
        />
      )}
      {applyPlan && !approval && !busy && (
        <ApprovalCard
          title={`${CHANGE_TITLES[applyPlan.kind]} ${applyPlan.path}`}
          plan={applyPlan}
          confirmLabel="Apply change"
          onConfirm={() => { setApplyError(confirmApply(applyPlan)); setApplyPlan(null) }}
          onCancel={() => setApplyPlan(null)}
        />
      )}

      {/* Composer */}
      <div className="shrink-0 border-t border-ink-200 p-2.5 dark:border-ink-800">
        {applyError && <div className="mb-2"><Banner tone="error" action={<button type="button" onClick={() => setApplyError('')} className={BANNER_BUTTON}>Dismiss</button>}>{applyError}</Banner></div>}
        {voiceOn && voice.micError && <div className="mb-2"><Banner tone="error" action={<button type="button" onClick={voice.clearMicError} className={BANNER_BUTTON}>Dismiss</button>}>{voice.micError}</Banner></div>}
        <div className={`rounded-xl border bg-white transition-colors focus-within:border-gold-400 dark:bg-ink-900 ${mode ? 'border-ink-200 dark:border-ink-700' : 'border-ink-200/70 dark:border-ink-800'}`}>
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={MAX_PROMPT_LENGTH}
            disabled={!mode || unavailable || locked || checking}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label="Message WebNest AI"
            className="block max-h-40 w-full resize-none bg-transparent px-3 pt-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 disabled:cursor-not-allowed dark:text-white"
          />
          <div className="flex items-center gap-2 px-2 pb-2 pt-1">
            {!agentOnly && <ModeSwitch mode={mode} onChange={chooseMode} disabled={busy || locked || checking} attention={!mode && !locked && !checking} />}
            {voiceOn && (
              <ErrorBoundary fallback={() => null}>
                <VoiceLanguage voice={voice} language={voiceLanguage} onChange={assistant.setVoiceLanguage} disabled={locked || checking} />
              </ErrorBoundary>
            )}
            <span className="min-w-0 flex-1 truncate text-[11px] text-ink-400">{mode === 'agent' && assistant.autoApply ? 'Auto-apply is on' : ''}</span>
            {draft.length >= SHOW_COUNT_FROM && (
              <span className={`shrink-0 text-[11px] tabular-nums ${draft.length >= MAX_PROMPT_LENGTH ? 'font-semibold text-red-600 dark:text-red-400' : 'text-ink-400'}`}>{draft.length}/{MAX_PROMPT_LENGTH}</span>
            )}
            {voiceOn && (
              <ErrorBoundary fallback={() => null}>
                <VoiceButtons voice={voice} readAloud={assistant.readAloud} onReadAloud={assistant.setReadAloud} disabled={unavailable || locked || checking} />
              </ErrorBoundary>
            )}
            {busy ? (
              <button type="button" onClick={() => { stopSpeaking(); assistant.stop() }} title="Stop" aria-label="Stop" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600">
                <FiSquare className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button type="button" onClick={() => submit()} disabled={!canSend} title="Send (Enter)" aria-label="Send" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-white transition-colors hover:bg-ink-700 disabled:bg-ink-200 disabled:text-ink-400 dark:bg-gold-400 dark:text-ink-950 dark:hover:bg-gold-300 dark:disabled:bg-ink-800 dark:disabled:text-ink-500">
                <FiArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-ink-400">AI can make mistakes. Check its changes before you rely on them.{voiceOn && voice.canListen ? " Your browser's speech service turns your voice into text." : ''}</p>
      </div>
    </div>
  )
}
