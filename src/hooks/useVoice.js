import { useCallback, useEffect, useRef, useState } from 'react'
import { joinDictation, micErrorMessage, pickVoice, speakableText, speechChunks } from '../lib/codelab/assistantVoice.js'

const recognitionClass = () => (typeof window === 'undefined' ? null : window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
const synthesis = () => (typeof window !== 'undefined' && typeof window.SpeechSynthesisUtterance === 'function' ? window.speechSynthesis ?? null : null)

// Talking to WebNest AI, using what the browser has. Nothing is recorded or stored here; a
// browser may send the audio to its own speech service to turn it into text. A browser
// without one of these simply doesn't offer it.
//   getDraft / setDraft:  the message box, which what is heard goes into
export function useVoice({ language, maxLength, getDraft, setDraft }) {
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [micError, setMicError] = useState('')
  const recognition = useRef(null)
  // Every read-aloud belongs to a generation, so what a cancel ended can't report back.
  const generation = useRef(0)
  const left = useRef(0)

  const canListen = Boolean(recognitionClass())
  const canSpeak = Boolean(synthesis())

  const stopSpeaking = useCallback(() => {
    generation.current += 1
    left.current = 0
    setSpeaking(false)
    try {
      synthesis()?.cancel()
    } catch {
      /* Nothing is being read, then. */
    }
  }, [])

  const speak = useCallback((markdown) => {
    const engine = synthesis()
    const chunks = speechChunks(speakableText(markdown))
    if (!engine || !chunks.length) return
    try {
      const mine = generation.current
      const voice = pickVoice(engine.getVoices?.(), language)
      for (const chunk of chunks) {
        const utterance = new window.SpeechSynthesisUtterance(chunk)
        utterance.lang = language
        if (voice) utterance.voice = voice
        const finished = () => {
          if (mine !== generation.current) return
          left.current = Math.max(left.current - 1, 0)
          if (!left.current) setSpeaking(false)
        }
        utterance.onend = finished
        utterance.onerror = finished
        left.current += 1
        engine.speak(utterance)
      }
      setSpeaking(true)
    } catch {
      left.current = 0
      setSpeaking(false)
    }
  }, [language])

  const stopListening = useCallback(() => {
    try {
      recognition.current?.stop()
    } catch {
      /* Already stopped. */
    }
  }, [])

  // Ends listening and drops what is still on its way. Handlers go first: stopListening lets
  // the browser deliver a final result, which after sending would refill the message box.
  const cancelListening = useCallback(() => {
    const listener = recognition.current
    if (!listener) return
    recognition.current = null
    listener.onresult = null
    listener.onerror = null
    listener.onend = null
    setListening(false)
    try {
      listener.abort()
    } catch {
      /* Already stopped. */
    }
  }, [])

  const startListening = useCallback(() => {
    const Recognition = recognitionClass()
    if (!Recognition || recognition.current) return
    stopSpeaking()
    setMicError('')
    const typed = getDraft()
    try {
      const listener = new Recognition()
      listener.lang = language
      listener.continuous = false
      listener.interimResults = true
      listener.maxAlternatives = 1
      listener.onresult = (event) => {
        const heard = Array.from(event.results ?? [], (result) => result[0]?.transcript ?? '').join('')
        setDraft(joinDictation(typed, heard, maxLength))
      }
      listener.onerror = (event) => setMicError(micErrorMessage(event.error))
      listener.onend = () => {
        if (recognition.current === listener) recognition.current = null
        setListening(false)
      }
      recognition.current = listener
      listener.start()
      setListening(true)
    } catch {
      recognition.current = null
      setListening(false)
      setMicError(micErrorMessage('unknown'))
    }
  }, [getDraft, language, maxLength, setDraft, stopSpeaking])

  // Leaving the screen ends both, so nothing arrives after unmounting.
  useEffect(() => () => {
    cancelListening()
    generation.current += 1
    try {
      synthesis()?.cancel()
    } catch {
      /* Nothing is being read, then. */
    }
  }, [cancelListening])

  return { canListen, canSpeak, listening, speaking, micError, clearMicError: () => setMicError(''), startListening, stopListening, cancelListening, speak, stopSpeaking }
}
