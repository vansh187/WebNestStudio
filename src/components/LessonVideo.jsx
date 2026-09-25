import { useState } from 'react'
import { FiPlay } from 'react-icons/fi'
import { trackEvent } from '../lib/analytics'

// Click-to-play facade: the YouTube iframe only loads after the visitor clicks,
// so the lesson stays fast and the prerendered HTML has no third-party frame.
export default function LessonVideo({ video, lessonId }) {
  const [playing, setPlaying] = useState(false)
  const isShort = video.format === 'short'
  const watchUrl = isShort
    ? `https://www.youtube.com/shorts/${video.youtubeId}`
    : `https://www.youtube.com/watch?v=${video.youtubeId}`
  const frameClass = isShort ? 'aspect-[9/16] max-w-[280px]' : 'aspect-video max-w-2xl'
  const thumbnail = video.thumbnail || `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`

  return (
    <section aria-label="Lesson video" className="mt-6 rounded-xl border border-ink-200 p-5 dark:border-ink-800">
      <h2 className="text-lg font-semibold">Watch: {video.title}</h2>
      <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">{video.description}</p>
      <div className={`mx-auto mt-4 w-full overflow-hidden rounded-xl bg-ink-950 ${frameClass}`}>
        {playing ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => { setPlaying(true); trackEvent('lesson_video_played', { lesson_id: lessonId, video_id: video.youtubeId }) }}
            aria-label={`Play video: ${video.title}`}
            className="relative flex h-full w-full items-center justify-center"
          >
            <img
              src={thumbnail}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 text-ink-950 shadow-lg">
              <FiPlay className="h-6 w-6" />
            </span>
          </button>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-ink-500">
        <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="underline">Watch on YouTube</a>
      </p>
    </section>
  )
}
