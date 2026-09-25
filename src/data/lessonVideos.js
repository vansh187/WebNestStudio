// Lesson id -> companion YouTube video. Add an entry to show a video on a lesson.
export const LESSON_VIDEOS = {
  lesson_java_core_history_and_features_of_java: {
    youtubeId: 'pA0nNLK7y1k',
    format: 'short', // vertical YouTube Short; omit for a normal 16:9 video
    thumbnail: 'https://i.ytimg.com/vi/pA0nNLK7y1k/hq2.jpg',
    afterSection: 1, // shown after section 1 ("Key Features of Java"); 0 = before the first section; omit = below the lesson
    title: 'How Java Runs Anywhere',
    description: 'A quick video on how Java bytecode and the JVM let the same program run on any platform.',
  },
  lesson_java_core_setting_up_the_java_development_environment: {
    youtubeId: 'wiTsDgaDCJ4',
    afterSection: 0, // right after the introduction, before the written steps
    title: 'Java Environment Setup',
    description: 'Prefer to watch? This video walks through setting up your Java development environment. Follow it alongside the written steps below.',
  },
}

export function getLessonVideo(lessonId) {
  return LESSON_VIDEOS[lessonId] || null
}
