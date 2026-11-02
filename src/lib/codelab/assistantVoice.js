// Turning WebNest AI's replies into something worth hearing, and speech into the message box.
// No React and no browser calls, so it can be tested in Node. See hooks/useVoice.js.
export const VOICE_LANGUAGES = [
  { id: 'en-IN', label: 'English' },
  { id: 'hi-IN', label: 'हिन्दी' },
]
export const DEFAULT_VOICE_LANGUAGE = VOICE_LANGUAGES[0].id

const CODE_ON_SCREEN = 'The code is on your screen.'
// Long utterances get cut off in some browsers, so a reply is read in pieces.
const MAX_CHUNK = 200

export const isVoiceLanguage = (id) => VOICE_LANGUAGES.some((language) => language.id === id)

// A reply as it should be read: no code, and none of Markdown's symbols.
export function speakableText(markdown) {
  return String(markdown ?? '')
    .replace(/```[\s\S]*?(```|$)/g, ` ${CODE_ON_SCREEN} `)
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, 'link')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/(\*\*|__|~~|\*)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Pieces of at most `limit` characters, split between sentences where possible.
export function speechChunks(text, limit = MAX_CHUNK) {
  const chunks = []
  let current = ''
  const flush = () => {
    if (current) chunks.push(current)
    current = ''
  }
  for (const sentence of String(text ?? '').match(/[^.!?।]+[.!?।]*\s*/g) ?? []) {
    let rest = sentence.trim()
    if (current && current.length + rest.length + 1 > limit) flush()
    while (rest.length > limit) {
      flush()
      const cut = rest.lastIndexOf(' ', limit)
      const end = cut > 0 ? cut : limit
      chunks.push(rest.slice(0, end))
      rest = rest.slice(end).trim()
    }
    current = current ? `${current} ${rest}` : rest
  }
  flush()
  return chunks
}

// What was typed plus what was heard, within the message limit.
export function joinDictation(typed, heard, limit) {
  const start = String(typed ?? '').trimEnd()
  const words = String(heard ?? '').trim()
  return (start && words ? `${start} ${words}` : start || words).slice(0, limit)
}

// The browser's voice for a language, or null to leave the choice to the browser.
export function pickVoice(voices, language) {
  const wanted = String(language).toLowerCase()
  const named = (voice) => String(voice?.lang ?? '').replace('_', '-').toLowerCase()
  const family = wanted.split('-')[0]
  return (voices ?? []).find((voice) => named(voice) === wanted)
    ?? (voices ?? []).find((voice) => named(voice).split('-')[0] === family)
    ?? null
}

const MIC_ERRORS = {
  'not-allowed': 'Microphone access is blocked. Allow it for this site in your browser settings.',
  'service-not-allowed': 'Microphone access is blocked. Allow it for this site in your browser settings.',
  'audio-capture': 'No microphone was found.',
  'no-speech': "We didn't hear anything. Press the microphone and try again.",
  network: "Your browser's speech service could not be reached. Check your connection or type instead.",
  'language-not-supported': "Your browser can't listen in this language. Try another one or type instead.",
}

// What to tell the user, or '' when there is nothing to report (they stopped it themselves).
export function micErrorMessage(code) {
  if (code === 'aborted') return ''
  return Object.hasOwn(MIC_ERRORS, code) ? MIC_ERRORS[code] : 'Voice input stopped working. Please type instead.'
}
