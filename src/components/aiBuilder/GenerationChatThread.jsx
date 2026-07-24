import { useEffect, useState } from 'react'
import ChatMessage from './ChatMessage'
import PromptInput from './PromptInput'
import GenerationStatus from './GenerationStatus'
import PagePreview from './PagePreview'
import DownloadBar from './DownloadBar'
import { generatePage, refineGeneration, getLimitStatus, getGenerationDetail } from '../../api/aiBuilder'
import { useToast } from '../../context/ToastContext'

const GREETING = {
  role: 'assistant',
  content: "Hi, How can I help you in design the website pages.",
}

const REJECTED_MESSAGE = 'I am only made to generate the enhanced HTML pages for websites.'

export default function GenerationChatThread({ initialThread, onThreadCreated, onGoToHistory }) {
  const toast = useToast()
  const [generationId, setGenerationId] = useState(initialThread?.generation_id ?? null)
  const [messages, setMessages] = useState(initialThread?.messages ?? [])
  const [activeHtml, setActiveHtml] = useState(initialThread?.latest_html ?? null)
  const [status, setStatus] = useState({ type: 'idle' })
  const [limitStatus, setLimitStatus] = useState(null)

  // Fetched once on mount only — submit() already refreshes this after every successful
  // generate/refine, so also depending on `generationId` here would double-fetch on the
  // new-thread transition (generationId changes as a *result* of that same submit).
  useEffect(() => {
    getLimitStatus()
      .then(setLimitStatus)
      .catch(() => {})
  }, [])

  // Every error from this API is just { detail: "..." } — the HTTP status code alone
  // tells us which case we're in (per AI_PAGE_BUILDER_API.md), there is no error-code field.
  const handleApiError = async (error, { retry, revertOptimisticMessage } = {}) => {
    const detail = error.response?.data?.detail
    const httpStatus = error.response?.status

    if (httpStatus === 429) {
      revertOptimisticMessage?.()
      // The error body has no reset_at — pull a fresh one from limit-status.
      try {
        const fresh = await getLimitStatus()
        setLimitStatus(fresh)
        setStatus({ type: 'rate-limited', resetAt: fresh.reset_at })
      } catch {
        setStatus({ type: 'rate-limited', resetAt: limitStatus?.reset_at })
      }
      return
    }
    if (httpStatus === 422) {
      revertOptimisticMessage?.()
      setStatus({ type: 'error', message: REJECTED_MESSAGE })
      return
    }
    if (httpStatus === 400) {
      revertOptimisticMessage?.()
      setStatus({ type: 'error', message: detail || 'That prompt is empty or too long.', onRetry: retry })
      return
    }
    if (httpStatus === 403 || httpStatus === 404) {
      toast.error(httpStatus === 404 ? 'That generation could not be found.' : "That generation isn't yours to view.")
      onGoToHistory()
      return
    }
    if (httpStatus === 503) {
      revertOptimisticMessage?.()
      setStatus({
        type: 'error',
        message: detail || 'High demand right now, please try again shortly.',
        onRetry: retry,
      })
      return
    }
    revertOptimisticMessage?.()
    setStatus({
      type: 'error',
      message: detail || 'Something went wrong. Please try again.',
      onRetry: retry,
    })
  }

  const submit = async (text) => {
    setStatus({ type: 'loading' })
    const userMessage = { role: 'user', content: text, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, userMessage])
    const revertOptimisticMessage = () => setMessages((prev) => prev.filter((m) => m !== userMessage))

    const attempt = async () => {
      const isRefine = Boolean(generationId)
      try {
        const data = isRefine
          ? await refineGeneration(generationId, text)
          : await generatePage(text)

        // Optimistic label for a snappy feel — resynced with the backend's actual
        // stored content just below, per the frontend spec's recommended pattern.
        const assistantMessage = {
          role: 'assistant',
          content: isRefine ? text : 'Generated page',
          html_snapshot: data.html,
          provider_used: data.provider_used,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setActiveHtml(data.html)
        setStatus({ type: 'idle' })

        if (!isRefine) {
          setGenerationId(data.generation_id)
          onThreadCreated(data.generation_id)
        }

        getLimitStatus().then(setLimitStatus).catch(() => {})

        // Background resync so message content/order exactly matches what's persisted.
        getGenerationDetail(data.generation_id)
          .then((detail) => {
            setMessages(detail.messages)
            setActiveHtml((current) => (current === data.html ? detail.latest_html : current))
          })
          .catch(() => {})
      } catch (error) {
        await handleApiError(error, { retry: () => attempt(), revertOptimisticMessage })
      }
    }

    await attempt()
  }

  const displayMessages = messages.length === 0 ? [GREETING] : messages

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {displayMessages.map((m, i) => (
          <ChatMessage
            key={i}
            message={m}
            isActiveSnapshot={m.html_snapshot === activeHtml && Boolean(activeHtml)}
            onSelectSnapshot={setActiveHtml}
          />
        ))}
      </div>

      {activeHtml && (
        <div className="space-y-2 border-t border-ink-200 dark:border-ink-800 p-3">
          <PagePreview html={activeHtml} />
          <div className="flex justify-end">
            <DownloadBar html={activeHtml} disabled={status.type === 'loading'} />
          </div>
        </div>
      )}

      <div className="space-y-2 border-t border-ink-200 dark:border-ink-800 p-3">
        <GenerationStatus status={status} />
        {limitStatus && limitStatus.remaining <= 1 && status.type !== 'rate-limited' && (
          <p className="text-xs text-ink-400">
            {limitStatus.remaining} of {limitStatus.limit} free generations left this period.
          </p>
        )}
        <PromptInput
          mode={generationId ? 'refine' : 'new'}
          onSubmit={submit}
          disabled={status.type === 'loading' || status.type === 'rate-limited'}
        />
      </div>
    </div>
  )
}
