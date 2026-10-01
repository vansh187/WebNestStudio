// Lesson id -> companion YouTube video. Add an entry to show a video on a lesson.
export const LESSON_VIDEOS = {
  // A lesson can hold one video or an array of videos.
  lesson_java_core_history_and_features_of_java: {
    youtubeId: 'pA0nNLK7y1k',
    format: 'short', // vertical YouTube Short; omit for a normal 16:9 video
    thumbnail: 'https://i.ytimg.com/vi/pA0nNLK7y1k/hq2.jpg',
    afterSection: 1, // shown after section 1 ("Key Features of Java"); 0 = before the first section; omit = below the lesson
    title: 'How Java Runs Anywhere',
    description: 'A quick video on how Java bytecode and the JVM let the same program run on any platform.',
  },
  lesson_java_core_jvm_jdk_and_jre: {
    youtubeId: 'LyEFMLCG3vw',
    format: 'short',
    afterSection: 0, // right after the introduction, before the JVM/JRE/JDK sections
    title: 'JVM, JDK and JRE Explained',
    description: 'A quick video on the difference between the JVM, JRE and JDK and how they fit together.',
  },
  lesson_java_core_java_program_structure_and_first_program: {
    youtubeId: 'wHsmdwLFqY4',
    afterSection: 0, // right after the introduction, before the written walkthrough
    title: 'Java Program Structure and Your First Program',
    description: 'Prefer to watch? This video walks through the structure of a Java program and writing your first one.',
  },
  lesson_java_core_c_vs_java_key_differences: {
    youtubeId: 'QJo8wq3Xvmk',
    afterSection: 0, // right after the introduction, before the comparison sections
    title: 'Key Differences Between C++ and Java',
    description: 'Prefer to watch? This video covers how Java differs from C++ — memory, pointers, inheritance and portability.',
  },
  lesson_java_core_setting_up_the_java_development_environment: {
    youtubeId: 'wiTsDgaDCJ4',
    afterSection: 0, // right after the introduction, before the written steps
    title: 'Java Environment Setup',
    description: 'Prefer to watch? This video walks through setting up your Java development environment. Follow it alongside the written steps below.',
  },
  lesson_java_core_identifiers_in_java: {
    youtubeId: 'aXAwZ_lg0yY',
    format: 'short',
    afterSection: 0, // right after the introduction, before the naming rules
    title: 'How Java Evaluates Identifiers',
    description: 'A quick video on how Java decides whether a name is a valid identifier.',
  },
  lesson_java_core_java_variables: {
    youtubeId: 'I5dEw1XPLNY',
    format: 'short',
    afterSection: 0, // right after the introduction, before the written sections
    title: 'How Java Variables Control Your Data',
    description: 'A quick video on how Java variables store and control your program\'s data.',
  },
  lesson_java_core_java_keywords: {
    youtubeId: 'm0D1WuRBciU',
    format: 'short',
    afterSection: 0, // right after the introduction, before the keyword categories
    title: 'The Invisible Rules That Power Java',
    description: 'A quick video on Java keywords — the reserved words with a fixed meaning that you cannot use as names.',
  },
  lesson_java_core_java_data_types: {
    youtubeId: '2sUHFJZ16rw',
    format: 'short',
    afterSection: 0, // right after the introduction, before the primitive types
    title: 'The Hidden Rules of Java Data Types',
    description: 'A quick video on Java data types — primitives, references and the rules that govern them.',
  },
  lesson_java_core_java_if_else_statement: {
    youtubeId: 'jHLp97U38jA',
    format: 'short',
    afterSection: 1, // just before the "Nested if and Braces" section
    title: 'How the Dangling Else Breaks Code',
    description: 'A quick video on the dangling else problem — which if an else really belongs to, and how braces fix it.',
  },
  lesson_java_core_java_switch_statement: {
    youtubeId: 'dMvqlTjb2BU',
    format: 'short',
    afterSection: 3, // just before the "How Enhanced Switch Eliminates Bugs" section
    title: "How Java's Enhanced Switch Eliminates Bugs",
    description: 'A quick video on how the arrow-style switch removes fall-through bugs and lets the compiler catch missing cases.',
  },
  lesson_java_core_java_for_loop: {
    youtubeId: 'NWVkACvtpqg',
    format: 'short',
    afterSection: 1, // just before the "How the for Loop Runs, Step by Step" section
    title: 'How the Java For Loop Works',
    description: 'A quick video on the order a for loop runs its initialization, condition, body and update.',
  },
  lesson_java_core_java_while_and_do_while_loop: {
    youtubeId: '80LS2Q1SfeA',
    format: 'short',
    afterSection: 3, // just before the "How to Choose the Right Loop" section
    title: 'How to Choose the Right Java Loop',
    description: 'A quick video on when to reach for for, for-each, while or do-while.',
  },
  lesson_java_core_java_for_each_loop: {
    youtubeId: 'C9owdhqsT0Q',
    format: 'short',
    afterSection: 1, // just before the "How It Works Internally" section
    title: 'How the Java For-each Loop Works Internally',
    description: 'A quick video on what the compiler turns a for-each loop into for arrays and collections.',
  },
  lesson_java_core_java_string: [
    {
      youtubeId: '9lWeD258_AE',
      format: 'short',
      afterSection: 1, // just before the 'What Happens When You "Change" a String' section
      title: 'Why Java Strings Cannot Be Changed',
      description: 'A quick video on what really happens when you "change" a String: a new object is created and the original stays the same.',
    },
    {
      youtubeId: '5TjfnYu3Z38',
      format: 'short',
      afterSection: 2, // just before the "Why Strings Are Immutable" section
      title: 'Why Java Strings Are Immutable',
      description: 'A quick video on the reasons behind String immutability: the string pool, security, thread safety and cached hash codes.',
    },
  ],
}

export function getLessonVideo(lessonId) {
  return LESSON_VIDEOS[lessonId] || null
}
