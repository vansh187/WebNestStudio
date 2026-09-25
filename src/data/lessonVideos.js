// Lesson id -> companion YouTube video. Add an entry to show a video on a lesson.
export const LESSON_VIDEOS = {
  lesson_java_core_history_and_features_of_java: {
    youtubeId: 'pA0nNLK7y1k',
    afterSection: 1, // shown after "Key Features of Java"; omit to show below the lesson
    title: 'How Java Runs Anywhere',
    description: 'A quick video on how Java bytecode and the JVM let the same program run on any platform.',
  },
}

export function getLessonVideo(lessonId) {
  return LESSON_VIDEOS[lessonId] || null
}
