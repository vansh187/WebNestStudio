// The assistant's loop, with no React: send the conversation, run any tool calls, send the
// results back, until the model finishes, the user stops, or the step limit is reached.
// Ask mode is one call: the server offers no tools there, so it never loops.
export const MAX_AGENT_STEPS = 8
export const STORED_MESSAGES = 30
// Roughly what fits one call within Groq's per-minute token limit, before older tool results
// are shortened (they are the bulk of a long task, and the model can read a file again).
const HISTORY_CHAR_BUDGET = 18000
const OLD_RESULT = '[Older result removed to save space. Run the tool again if it is needed.]'
const OLD_ARGUMENT = '[Removed to save space. Read the file to see its current text.]'
const LONG_ARGUMENT = 200

export class AssistantError extends Error {
  constructor(message, { status = 0, code = '', retryAfter = null } = {}) {
    super(message)
    this.name = 'AssistantError'
    this.status = status
    this.code = code
    this.retryAfter = retryAfter
  }
}

// The stored messages cut to the last ones, so that no tool result is left without the call
// it answers. A task can outgrow the limit, so its request is kept with the steps that fit.
export function trimHistory(messages, limit = STORED_MESSAGES) {
  if (messages.length <= limit) return messages
  const recent = messages.slice(-limit)
  const start = recent.findIndex((message) => message.role === 'user')
  if (start !== -1) return recent.slice(start)
  const request = messages.findLast((message) => message.role === 'user')
  if (!request) return []
  const firstStep = recent.findIndex((message) => message.role === 'assistant')
  return firstStep === -1 ? [request] : [request, ...recent.slice(firstStep)]
}

const interruptedResult = (id) => ({ role: 'tool', tool_call_id: id, content: 'The task ended before this ran.', is_error: true })

// A task cut off by a reload or a project switch can leave tool calls with no result, and the
// next request would then be rejected. Each gets a result, and a result with no call is dropped.
export function repairHistory(messages) {
  const repaired = []
  let unanswered = []
  const closeOpenCalls = () => {
    unanswered.forEach((id) => repaired.push(interruptedResult(id)))
    unanswered = []
  }
  for (const message of messages) {
    if (message?.role === 'tool') {
      if (!unanswered.includes(message.tool_call_id)) continue
      unanswered = unanswered.filter((id) => id !== message.tool_call_id)
      repaired.push(message)
      continue
    }
    closeOpenCalls()
    repaired.push(message)
    if (Array.isArray(message?.tool_calls)) unanswered = message.tool_calls.map((call) => call.id)
  }
  closeOpenCalls()
  return repaired
}

const sizeOf = (message) => message.content.length + (message.tool_calls ? JSON.stringify(message.tool_calls).length : 0)

const withShortArguments = (call) => ({
  ...call,
  arguments: Object.fromEntries(Object.entries(call.arguments ?? {}).map(([key, value]) => [
    key,
    typeof value === 'string' && value.length > LONG_ARGUMENT ? OLD_ARGUMENT : value,
  ])),
})

// An older message at its smallest: tool results and the file text inside tool calls go.
function shortened(message) {
  if (message.role === 'tool') return { ...message, content: OLD_RESULT }
  return message.tool_calls ? { ...message, tool_calls: message.tool_calls.map(withShortArguments) } : message
}

// What goes to the server: only the contract's fields, within the size budget.
export function toApiMessages(messages) {
  const clean = repairHistory(trimHistory(messages)).map(({ role, content, tool_calls: toolCalls, tool_call_id: toolCallId, is_error: isError }) => ({
    role,
    content: content ?? '',
    ...(toolCalls?.length ? { tool_calls: toolCalls } : {}),
    ...(toolCallId ? { tool_call_id: toolCallId, is_error: Boolean(isError) } : {}),
  }))
  let total = clean.reduce((sum, message) => sum + sizeOf(message), 0)
  for (let i = 0; i < clean.length - 1 && total > HISTORY_CHAR_BUDGET; i += 1) {
    const small = shortened(clean[i])
    total -= sizeOf(clean[i]) - sizeOf(small)
    clean[i] = small
  }
  return clean
}

const CUT_CONNECTION = 'The connection to WebNest AI closed before the reply finished. Please try again.'

const stoppedResult = (id) => ({ role: 'tool', tool_call_id: id, content: 'Stopped by the user before this ran.', is_error: true })

// Runs one user request to its end. Callbacks:
//   stream({ messages, signal, onEvent })  one model call (assistantClient)
//   runTool(name, args)                    resolves to { content, isError }
//   onDelta(text)                          streamed text of the current reply
//   onMessage(message)                     a finished message to add to the conversation
//   onToolStart(call)                      a tool call is about to run
//   onUsage(usage)
// Resolves to { status: 'done' | 'stopped' | 'step_limit' | 'cut_off' }. A failed call throws.
export async function runAssistantTask({ mode, getMessages, stream, runTool, signal, onDelta, onMessage, onToolStart, onUsage, maxSteps = MAX_AGENT_STEPS }) {
  for (let step = 0; step < maxSteps; step += 1) {
    let text = ''
    const toolCalls = []
    let finishReason = null
    let failure = null
    try {
      await stream({
        messages: toApiMessages(getMessages()),
        signal,
        onEvent: ({ type, data }) => {
          if (type === 'text') {
            text += data.delta ?? ''
            onDelta?.(text)
          } else if (type === 'tool_call') {
            toolCalls.push({ id: data.id, name: data.name, arguments: data.arguments ?? {} })
          } else if (type === 'usage') {
            onUsage?.(data)
          } else if (type === 'done') {
            finishReason = data.finish_reason ?? 'stop'
          } else if (type === 'error') {
            failure = new AssistantError(data.message ?? 'The AI service stopped responding.', { code: data.code })
          }
        },
      })
    } catch (error) {
      if (!signal?.aborted) failure = error
    }
    if (!failure && !signal?.aborted && finishReason === null) failure = new AssistantError(CUT_CONNECTION)

    // Stopped mid-reply: keep what was written. Every tool call must have a result, or the
    // next request would be rejected, so those that never ran get one saying so.
    if (signal?.aborted) {
      if (text || toolCalls.length) onMessage({ role: 'assistant', content: text, ...(toolCalls.length ? { tool_calls: toolCalls } : {}) })
      toolCalls.forEach((call) => onMessage(stoppedResult(call.id)))
      return { status: 'stopped' }
    }
    if (failure) {
      if (text) onMessage({ role: 'assistant', content: text })
      throw failure
    }

    const calls = mode === 'agent' ? toolCalls : []
    onMessage({ role: 'assistant', content: text, ...(calls.length ? { tool_calls: calls } : {}) })
    if (!calls.length) return { status: finishReason === 'length' ? 'cut_off' : 'done' }

    for (let index = 0; index < calls.length; index += 1) {
      const call = calls[index]
      if (signal?.aborted) {
        calls.slice(index).forEach((rest) => onMessage(stoppedResult(rest.id)))
        return { status: 'stopped' }
      }
      onToolStart?.(call)
      const result = await runTool(call.name, call.arguments)
      onMessage({ role: 'tool', tool_call_id: call.id, content: result.content, is_error: Boolean(result.isError) })
    }
    if (signal?.aborted) return { status: 'stopped' }
  }
  return { status: 'step_limit' }
}
