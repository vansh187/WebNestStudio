// Turns the bytes of POST /api/assistant/chat (Server-Sent Events) into { type, data } events.
// Text may be split anywhere across chunks, so a partial event waits for the next one.
// Comment lines such as ": ping" are ignored, and an event that is not valid JSON is skipped.
export function createSseParser(onEvent) {
  let buffer = ''
  let heldReturn = ''

  const dispatch = (block) => {
    let type = 'message'
    const data = []
    for (const line of block.split('\n')) {
      if (!line || line.startsWith(':')) continue
      const colon = line.indexOf(':')
      const field = colon === -1 ? line : line.slice(0, colon)
      const value = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '')
      if (field === 'event') type = value
      else if (field === 'data') data.push(value)
    }
    if (!data.length) return
    try {
      onEvent({ type, data: JSON.parse(data.join('\n')) })
    } catch {
      /* A broken event is skipped; the stream's own end or error event still arrives. */
    }
  }

  return {
    feed(text) {
      // A chunk may end between \r and \n. Hold a trailing \r back until the next chunk, or
      // the pair would become two line ends and cut the event in half.
      let incoming = heldReturn + text
      heldReturn = ''
      if (incoming.endsWith('\r')) {
        heldReturn = '\r'
        incoming = incoming.slice(0, -1)
      }
      buffer += incoming.replace(/\r\n?/g, '\n')
      let end = buffer.indexOf('\n\n')
      while (end !== -1) {
        dispatch(buffer.slice(0, end))
        buffer = buffer.slice(end + 2)
        end = buffer.indexOf('\n\n')
      }
    },
    // The stream ended: whatever is left is a last event without its blank line.
    flush() {
      if (buffer.trim()) dispatch(buffer)
      buffer = ''
    },
  }
}
