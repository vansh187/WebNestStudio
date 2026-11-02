import { FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi'
import { VOICE_LANGUAGES } from '../../lib/codelab/assistantVoice'

const ICON_BUTTON = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40'
const IDLE = 'text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white'

// Which language to listen and read in. Hidden when the browser can do neither.
export function VoiceLanguage({ voice, language, onChange, disabled }) {
  if (!voice.canListen && !voice.canSpeak) return null
  return (
    <select
      value={language}
      disabled={disabled || voice.listening}
      onChange={(event) => { voice.stopSpeaking(); onChange(event.target.value) }}
      aria-label="Voice language"
      className="h-8 shrink-0 rounded-lg border border-ink-200 bg-white px-1.5 text-[11px] font-medium text-ink-600 disabled:opacity-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300"
    >
      {VOICE_LANGUAGES.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
    </select>
  )
}

// The microphone, and reading replies aloud. What is heard goes into the message box, so it
// can be checked before sending.
export function VoiceButtons({ voice, readAloud, onReadAloud, disabled }) {
  const { canListen, canSpeak, listening, startListening, stopListening, stopSpeaking } = voice
  const toggleReading = () => {
    if (readAloud) stopSpeaking()
    onReadAloud(!readAloud)
  }
  return (
    <>
      {canSpeak && (
        <button
          type="button"
          onClick={toggleReading}
          aria-pressed={readAloud}
          aria-label="Read replies aloud"
          title={readAloud ? 'Stop reading replies aloud' : 'Read replies aloud'}
          className={`${ICON_BUTTON} ${readAloud ? 'bg-gold-100 text-gold-700 dark:bg-gold-400/15 dark:text-gold-300' : IDLE}`}
        >
          {readAloud ? <FiVolume2 className="h-4 w-4" /> : <FiVolumeX className="h-4 w-4" />}
        </button>
      )}
      {canListen && (
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          disabled={disabled}
          aria-pressed={listening}
          aria-label={listening ? 'Stop listening' : 'Speak your message'}
          title={listening ? 'Stop listening' : 'Speak your message'}
          className={`${ICON_BUTTON} ${listening ? 'animate-pulse bg-red-500 text-white motion-reduce:animate-none' : IDLE}`}
        >
          {listening ? <FiMicOff className="h-4 w-4" /> : <FiMic className="h-4 w-4" />}
        </button>
      )}
    </>
  )
}
