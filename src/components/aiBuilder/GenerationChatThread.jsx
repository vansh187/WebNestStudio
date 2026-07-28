import { useEffect, useRef, useState } from 'react'
import { FiLoader } from 'react-icons/fi'
import ChatMessage from './ChatMessage'
import PromptInput from './PromptInput'
import GenerationStatus from './GenerationStatus'
import PagePreview from './PagePreview'
import DownloadBar from './DownloadBar'
import CollectedFieldsCard from './CollectedFieldsCard'
import PlanResult from './PlanResult'
import { startThread, sendMessage, generatePlan, getChatLimitStatus } from '../../api/chat'
import { getErrorDetail } from '../../lib/apiClient'
import { useToast } from '../../context/ToastContext'

const FALLBACK_GREETING = {
  role: 'assistant',
  content: 'Hi! How can I help you today?',
  created_at: new Date().toISOString(),
}

// Picking one of the two initial options only decides which local UI mode to show -
// it deliberately does NOT round-trip a canned message through sendMessage. The
// backend classifies mode from message content, and a meta-message like "please
// suggest some page options" reads as an enquiry to it (mentions "options"/"project")
// rather than a page-build request. Setting mode locally and asking our own
// clarifying question sidesteps that misclassification; the backend only classifies
// once the user's real, concrete description comes in - which is what worked
// reliably before this two-button UI existed.
const INTENT_PROMPTS = {
  enquiry: 'Tell me a bit about your project — what you\'re building, the goal, key pages/features you need, your budget range, and timeline. I\'ll use that to put together a plan.',
  page_builder: 'Here are some popular static page types I can design: Landing Page, Portfolio, Pricing Page, Product/Service Showcase, or a Coming Soon page. Tell me which one (plus any style or color preferences) and I\'ll build it for you.',
}

export default function GenerationChatThread({ initialThread, onThreadCreated, onGoToHistory }) {
  const toast = useToast()
  const [threadId, setThreadId] = useState(initialThread?.thread_id ?? null)
  const [mode, setMode] = useState(initialThread?.mode ?? 'undecided')
  const [messages, setMessages] = useState(initialThread?.messages ?? [])
  const [activeHtml, setActiveHtml] = useState(null)
  const [collectedFields, setCollectedFields] = useState(null)
  const [readyForPlan, setReadyForPlan] = useState(false)
  const [plan, setPlan] = useState(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [status, setStatus] = useState({ type: initialThread ? 'idle' : 'starting' })
  const [limitStatus, setLimitStatus] = useState(null)

  // Synchronous lock against a second send firing while one is already in flight
  // (rapid double-click, Enter immediately followed by a button click, etc).
  // PromptInput's `disabled` prop alone isn't enough here - it's driven by React
  // state, which only takes effect on the next render, leaving a real window where
  // two send attempts can both pass the disabled check before either commits.
  const sendInFlightRef = useRef(false)

  // ChatPanel doesn't memoize onThreadCreated, so it's a new function reference on
  // every one of its re-renders - read it through a ref instead of a dep so this
  // effect doesn't re-fire (and re-create a thread) on unrelated parent re-renders.
  const onThreadCreatedRef = useRef(onThreadCreated)
  onThreadCreatedRef.current = onThreadCreated

  // A thread must exist server-side before any message can be sent - kick that off
  // immediately for a brand-new chat. Resumed threads (from history) already have one.
  // initialThread itself never changes across this component's lifetime (a new/
  // selected thread always gets a fresh instance via ChatPanel's sessionKey remount).
  useEffect(() => {
    if (initialThread) return undefined
    let cancelled = false

    const begin = async () => {
      setStatus({ type: 'starting' })
      try {
        const data = await startThread()
        if (cancelled) return
        setThreadId(data.thread_id)
        setMode(data.mode)
        setMessages([{ role: 'assistant', content: data.reply, created_at: new Date().toISOString() }])
        setStatus({ type: 'idle' })
        onThreadCreatedRef.current?.(data.thread_id)
      } catch (error) {
        if (cancelled) return
        setStatus({
          type: 'error',
          message: getErrorDetail(error, "Couldn't start a new chat. Please try again."),
          onRetry: begin,
        })
      }
    }

    begin()
    return () => { cancelled = true }
  }, [initialThread])

  useEffect(() => {
    getChatLimitStatus().then(setLimitStatus).catch(() => {})
  }, [])

  // Every error from this API is just { detail: "..." } — the HTTP status code alone
  // tells us which case we're in, per CHATBOT_API.md's error table.
  const handleApiError = async (error, { retry, revertOptimisticMessage, context } = {}) => {
    const detail = error.response?.data?.detail
    const httpStatus = error.response?.status

    if (httpStatus === 429) {
      revertOptimisticMessage?.()
      try {
        const fresh = await getChatLimitStatus()
        setLimitStatus(fresh)
        setStatus({ type: 'rate-limited', resetAt: fresh.reset_at })
      } catch {
        setStatus({ type: 'rate-limited', resetAt: limitStatus?.reset_at })
      }
      return
    }
    if (httpStatus === 409 && context === 'generate-plan') {
      // Not ready yet - the API guide says to treat this as "keep chatting", not a
      // hard error, so it never shows up as a scary error card.
      toast.info(detail || 'A few more details are needed before your plan is ready.')
      return
    }
    if (httpStatus === 403 || httpStatus === 404) {
      revertOptimisticMessage?.()
      toast.error(httpStatus === 404 ? 'That conversation could not be found.' : "That conversation isn't yours to view.")
      onGoToHistory?.()
      return
    }
    if (httpStatus === 400 || httpStatus === 422) {
      revertOptimisticMessage?.()
      setStatus({ type: 'error', message: detail || 'That message could not be sent.', onRetry: retry })
      return
    }
    if (httpStatus === 503) {
      revertOptimisticMessage?.()
      setStatus({ type: 'error', message: detail || 'High demand right now, please try again shortly.', onRetry: retry })
      return
    }
    revertOptimisticMessage?.()
    setStatus({ type: 'error', message: detail || 'Something went wrong. Please try again.', onRetry: retry })
  }

  // Shared by both the initial send and the "Try again" retry button (which calls
  // this directly via status.onRetry, bypassing submit() entirely) - the in-flight
  // lock has to live here to cover both call sites.
  const attemptSend = async (text, revertOptimisticMessage) => {
    if (sendInFlightRef.current) return
    sendInFlightRef.current = true
    setStatus({ type: 'loading' })
    try {
      const data = await sendMessage(threadId, text)
      setMode(data.mode)

      const assistantMessage = {
        role: 'assistant',
        content: data.reply,
        html_snapshot: data.mode === 'page_builder' ? data.html : undefined,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setStatus({ type: 'idle' })

      if (data.mode === 'page_builder' && data.html) {
        setActiveHtml(data.html)
      }

      if (data.mode === 'enquiry') {
        // collected_fields only ever fills in over time per the API guide, but merge
        // defensively rather than blindly overwrite in case a turn omits a value.
        setCollectedFields((prev) => ({
          ...prev,
          ...Object.fromEntries(Object.entries(data.collected_fields || {}).filter(([, v]) => v != null)),
        }))
        setReadyForPlan(Boolean(data.ready_for_plan))
      }

      getChatLimitStatus().then(setLimitStatus).catch(() => {})
    } catch (error) {
      await handleApiError(error, { retry: () => attemptSend(text, revertOptimisticMessage), revertOptimisticMessage, context: 'send-message' })
    } finally {
      sendInFlightRef.current = false
    }
  }

  const handleSelectIntent = (key) => {
    setMode(key)
    setMessages((prev) => [...prev, { role: 'assistant', content: INTENT_PROMPTS[key], created_at: new Date().toISOString() }])
  }

  const submit = async (text) => {
    if (!threadId || sendInFlightRef.current) return
    const userMessage = { role: 'user', content: text, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, userMessage])
    const revertOptimisticMessage = () => setMessages((prev) => prev.filter((m) => m !== userMessage))
    await attemptSend(text, revertOptimisticMessage)
  }

  const generatePlanInFlightRef = useRef(false)
  const handleGeneratePlan = async () => {
    if (!threadId || generatePlanInFlightRef.current) return
    generatePlanInFlightRef.current = true
    setGeneratingPlan(true)
    try {
      const data = await generatePlan(threadId)
      setPlan(data)
    } catch (error) {
      await handleApiError(error, { context: 'generate-plan' })
    } finally {
      setGeneratingPlan(false)
      generatePlanInFlightRef.current = false
    }
  }

  if (status.type === 'starting') {
    return (
      <div className="flex h-full items-center justify-center">
        <FiLoader className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    )
  }

  const displayMessages = messages.length === 0 ? [FALLBACK_GREETING] : messages

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {displayMessages.map((m, i) => (
          <ChatMessage
            key={i}
            message={m}
            isActiveSnapshot={m.html_snapshot === activeHtml && Boolean(activeHtml)}
            onSelectSnapshot={setActiveHtml}
          />
        ))}

        {mode === 'page_builder' && activeHtml && (
          <div className="space-y-2 border-t border-ink-200 dark:border-ink-800 pt-3">
            <PagePreview html={activeHtml} />
            <div className="flex justify-end">
              <DownloadBar html={activeHtml} disabled={status.type === 'loading'} />
            </div>
          </div>
        )}

        {mode === 'enquiry' && (collectedFields || plan) && (
          <div className="space-y-3 border-t border-ink-200 dark:border-ink-800 pt-3">
            {collectedFields && <CollectedFieldsCard fields={collectedFields} />}
            {readyForPlan && (
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={generatingPlan}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 dark:bg-gold-400 px-3.5 py-2.5 text-sm font-semibold text-white dark:text-ink-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generatingPlan && <FiLoader className="h-4 w-4 animate-spin" />}
                {plan ? 'Regenerate My Plan' : 'Generate My Plan'}
              </button>
            )}
            <PlanResult plan={plan} />
          </div>
        )}
      </div>

      <div className="shrink-0 space-y-2 border-t border-ink-200 dark:border-ink-800 p-3">
        <GenerationStatus status={status} />
        {limitStatus && limitStatus.remaining <= 1 && status.type !== 'rate-limited' && (
          <p className="text-xs text-ink-400">
            {limitStatus.remaining} of {limitStatus.limit} messages left this period.
          </p>
        )}
        <PromptInput
          mode={mode}
          onSubmit={submit}
          onSelectIntent={handleSelectIntent}
          disabled={!threadId || status.type === 'loading' || status.type === 'rate-limited'}
          showInitialOptions={mode === 'undecided' && !messages.some((m) => m.role === 'user')}
        />
      </div>
    </div>
  )
}
