// Lesson id -> companion YouTube video. Add an entry to show a video on a lesson.
// uploadDate and durationSeconds come from the YouTube video itself; they feed the
// VideoObject structured data Google needs to index the video.
export const LESSON_VIDEOS = {
  // A lesson can hold one video or an array of videos.
  lesson_java_core_history_and_features_of_java: {
    youtubeId: 'pA0nNLK7y1k',
    uploadDate: '2026-09-25T12:44:20-07:00', durationSeconds: 80,
    format: 'short', // vertical YouTube Short; omit for a normal 16:9 video
    thumbnail: 'https://i.ytimg.com/vi/pA0nNLK7y1k/hq2.jpg',
    afterSection: 1, // shown after section 1 ("Key Features of Java"); 0 = before the first section; omit = below the lesson
    title: 'How Java Runs Anywhere',
    description: 'A quick video on how Java bytecode and the JVM let the same program run on any platform.',
  },
  lesson_java_core_jvm_jdk_and_jre: {
    youtubeId: 'LyEFMLCG3vw',
    uploadDate: '2026-09-26T14:13:17-07:00', durationSeconds: 76,
    format: 'short',
    afterSection: 0, // right after the introduction, before the JVM/JRE/JDK sections
    title: 'JVM, JDK and JRE Explained',
    description: 'A quick video on the difference between the JVM, JRE and JDK and how they fit together.',
  },
  lesson_java_core_java_program_structure_and_first_program: {
    youtubeId: 'wHsmdwLFqY4',
    uploadDate: '2026-09-26T14:45:03-07:00', durationSeconds: 333,
    afterSection: 0, // right after the introduction, before the written walkthrough
    title: 'Java Program Structure and Your First Program',
    description: 'Prefer to watch? This video walks through the structure of a Java program and writing your first one.',
  },
  lesson_java_core_c_vs_java_key_differences: {
    youtubeId: 'QJo8wq3Xvmk',
    uploadDate: '2026-09-26T13:03:05-07:00', durationSeconds: 477,
    afterSection: 0, // right after the introduction, before the comparison sections
    title: 'Key Differences Between C++ and Java',
    description: 'Prefer to watch? This video covers how Java differs from C++ — memory, pointers, inheritance and portability.',
  },
  lesson_java_core_setting_up_the_java_development_environment: {
    youtubeId: 'wiTsDgaDCJ4',
    uploadDate: '2026-09-25T14:49:05-07:00', durationSeconds: 399,
    afterSection: 0, // right after the introduction, before the written steps
    title: 'Java Environment Setup',
    description: 'Prefer to watch? This video walks through setting up your Java development environment. Follow it alongside the written steps below.',
  },
  lesson_java_core_identifiers_in_java: {
    youtubeId: 'aXAwZ_lg0yY',
    uploadDate: '2026-09-27T05:13:40-07:00', durationSeconds: 61,
    format: 'short',
    afterSection: 0, // right after the introduction, before the naming rules
    title: 'How Java Evaluates Identifiers',
    description: 'A quick video on how Java decides whether a name is a valid identifier.',
  },
  lesson_java_core_java_variables: {
    youtubeId: 'I5dEw1XPLNY',
    uploadDate: '2026-09-27T03:21:37-07:00', durationSeconds: 75,
    format: 'short',
    afterSection: 0, // right after the introduction, before the written sections
    title: 'How Java Variables Control Your Data',
    description: 'A quick video on how Java variables store and control your program\'s data.',
  },
  lesson_java_core_java_keywords: {
    youtubeId: 'm0D1WuRBciU',
    uploadDate: '2026-09-27T13:37:20-07:00', durationSeconds: 76,
    format: 'short',
    afterSection: 0, // right after the introduction, before the keyword categories
    title: 'The Invisible Rules That Power Java',
    description: 'A quick video on Java keywords — the reserved words with a fixed meaning that you cannot use as names.',
  },
  lesson_java_core_java_data_types: {
    youtubeId: '2sUHFJZ16rw',
    uploadDate: '2026-09-27T13:39:01-07:00', durationSeconds: 80,
    format: 'short',
    afterSection: 0, // right after the introduction, before the primitive types
    title: 'The Hidden Rules of Java Data Types',
    description: 'A quick video on Java data types — primitives, references and the rules that govern them.',
  },
  lesson_java_core_java_if_else_statement: {
    youtubeId: 'jHLp97U38jA',
    uploadDate: '2026-09-27T13:40:04-07:00', durationSeconds: 77,
    format: 'short',
    afterSection: 1, // just before the "Nested if and Braces" section
    title: 'How the Dangling Else Breaks Code',
    description: 'A quick video on the dangling else problem — which if an else really belongs to, and how braces fix it.',
  },
  lesson_java_core_java_switch_statement: {
    youtubeId: 'dMvqlTjb2BU',
    uploadDate: '2026-09-28T11:15:07-07:00', durationSeconds: 83,
    format: 'short',
    afterSection: 3, // just before the "How Enhanced Switch Eliminates Bugs" section
    title: "How Java's Enhanced Switch Eliminates Bugs",
    description: 'A quick video on how the arrow-style switch removes fall-through bugs and lets the compiler catch missing cases.',
  },
  lesson_java_core_java_for_loop: {
    youtubeId: 'NWVkACvtpqg',
    uploadDate: '2026-09-28T11:26:22-07:00', durationSeconds: 63,
    format: 'short',
    afterSection: 1, // just before the "How the for Loop Runs, Step by Step" section
    title: 'How the Java For Loop Works',
    description: 'A quick video on the order a for loop runs its initialization, condition, body and update.',
  },
  lesson_java_core_java_while_and_do_while_loop: {
    youtubeId: '80LS2Q1SfeA',
    uploadDate: '2026-09-28T11:47:38-07:00', durationSeconds: 57,
    format: 'short',
    afterSection: 3, // just before the "How to Choose the Right Loop" section
    title: 'How to Choose the Right Java Loop',
    description: 'A quick video on when to reach for for, for-each, while or do-while.',
  },
  lesson_java_core_java_for_each_loop: {
    youtubeId: 'C9owdhqsT0Q',
    uploadDate: '2026-09-28T12:43:29-07:00', durationSeconds: 70,
    format: 'short',
    afterSection: 1, // just before the "How It Works Internally" section
    title: 'How the Java For-each Loop Works Internally',
    description: 'A quick video on what the compiler turns a for-each loop into for arrays and collections.',
  },
  lesson_java_core_java_string: [
    {
      youtubeId: '9lWeD258_AE',
      uploadDate: '2026-09-30T13:36:21-07:00', durationSeconds: 81,
      format: 'short',
      afterSection: 1, // just before the 'What Happens When You "Change" a String' section
      title: 'Why Java Strings Cannot Be Changed',
      description: 'A quick video on what really happens when you "change" a String: a new object is created and the original stays the same.',
    },
    {
      youtubeId: '5TjfnYu3Z38',
      uploadDate: '2026-09-30T13:38:24-07:00', durationSeconds: 73,
      format: 'short',
      afterSection: 2, // just before the "Why Strings Are Immutable" section
      title: 'Why Java Strings Are Immutable',
      description: 'A quick video on the reasons behind String immutability: the string pool, security, thread safety and cached hash codes.',
    },
  ],
  lesson_java_core_java_stringbuffer: {
    youtubeId: '87796k2_CPU',
    uploadDate: '2026-10-01T14:23:19-07:00', durationSeconds: 67,
    format: 'short',
    afterSection: 0, // just before the "How StringBuffer Beats Immutable Strings" section
    title: 'How StringBuffer Beats Immutable Strings',
    description: 'A quick video on why modifying a StringBuffer in place avoids the new object that every String change creates.',
  },
  lesson_java_core_java_stringbuilder: {
    youtubeId: 'XLrnuI2MB_E',
    uploadDate: '2026-10-01T14:22:11-07:00', durationSeconds: 88,
    format: 'short',
    afterSection: 0, // just before the "How StringBuilder Fixes the Memory Problem" section
    title: 'How StringBuilder Fixes Java Memory',
    description: 'A quick video on how one growing buffer replaces the throwaway Strings that += creates in a loop.',
  },
  lesson_java_core_oops_concepts_in_java: {
    youtubeId: 'FOQ8OL-_WPM',
    uploadDate: '2026-10-06T05:37:40-07:00', durationSeconds: 587,
    afterSection: 0, // right after the introduction, before "The Four Pillars of OOP"
    title: 'Java OOPs Concepts: The Overall View',
    description: 'Prefer to watch? This video gives a big-picture overview of object-oriented programming in Java: classes, objects and the four pillars.',
  },
  lesson_java_core_classes_and_objects: {
    youtubeId: 'fabJ2HKfPLw',
    uploadDate: '2026-10-06T10:13:06-07:00', durationSeconds: 389,
    afterSection: 0, // right after the introduction, before "Declaring a Class"
    title: 'Classes and Objects in Java, in Detail',
    description: 'Prefer to watch? This video explains classes and objects in detail: declaring a class, creating objects with new, and how each object keeps its own state.',
  },
  lesson_java_core_java_naming_conventions: {
    youtubeId: '8_gxk_ebRf0',
    uploadDate: '2026-10-06T10:44:28-07:00', durationSeconds: 523,
    afterSection: 0, // right after the introduction, before "Conventions by Identifier Type"
    title: 'Java Naming Conventions, in Detail',
    description: 'Prefer to watch? This video walks through how Java names classes, methods, variables, constants and packages, and why the conventions matter.',
  },
  lesson_java_core_java_methods_and_method_overloading: {
    youtubeId: 'Xsouk_ybico',
    uploadDate: '2026-10-06T11:10:20-07:00', durationSeconds: 391,
    afterSection: 1, // just before the "Rules for Overloading" section
    title: 'Java Method Overloading, in Detail',
    description: 'Prefer to watch? This video explains method overloading: same method name, different parameter lists, and how the compiler chooses which one to call.',
  },
  lesson_java_core_call_by_value_in_java: {
    youtubeId: 'Tvb1DIZfYyQ',
    uploadDate: '2026-10-08T13:34:18-07:00', durationSeconds: 74,
    format: 'short',
    thumbnail: 'https://i.ytimg.com/vi/Tvb1DIZfYyQ/hq2.jpg',
    afterSection: 0, // right after the introduction, before the field-mutation section
    title: 'How Call By Value Works in Java',
    description: 'A quick look at how Java hands every method a copy of its arguments, and why that copy is a value for primitives but a reference for objects.',
  },
  lesson_java_core_constructors_and_constructor_overloading: {
    youtubeId: 'AvOqftuCj-s',
    uploadDate: '2026-10-08T13:56:52-07:00', durationSeconds: 457,
    afterSection: 0, // after the introduction, before "Default Constructor"
    title: 'Java Constructors and Overloading',
    description: 'A walkthrough of Java constructors: how they initialise a new object, and how overloading lets one class offer several ways to create it.',
  },
  lesson_java_core_static_keyword: {
    youtubeId: '0rHlhGSjgsk',
    uploadDate: '2026-10-08T14:26:16-07:00', durationSeconds: 513,
    afterSection: 0, // after the introduction, before "Static Variables"
    title: 'Java Constructors and the static Keyword',
    description: 'A walkthrough that connects constructors with the static keyword: what each object gets for itself, and what the whole class shares.',
  },
  lesson_java_core_this_keyword: {
    youtubeId: 'jMfD9O9EhXE',
    uploadDate: '2026-10-08T14:32:48-07:00', durationSeconds: 72,
    format: 'short',
    thumbnail: 'https://i.ytimg.com/vi/jMfD9O9EhXE/hq2.jpg',
    afterSection: 0, // right before "this.field — Resolving Naming Conflicts"
    title: 'How Java\'s this Keyword Resolves Shadowing',
    description: 'A quick look at how this tells a field apart from a parameter with the same name, and what goes wrong when it is left out.',
  },
  lesson_java_core_java_inheritance: {
    youtubeId: 'N-pvCBSTe-c',
    uploadDate: '2026-10-09T11:47:57-07:00', durationSeconds: 400,
    afterSection: 0, // after the introduction, before "What Gets Inherited"
    title: 'Core Java Inheritance Concept',
    description: 'A walkthrough of inheritance in core Java: how a child class extends a parent class, what it inherits, and how it reuses the parent\'s code.',
  },
  lesson_java_core_aggregation_in_java: {
    youtubeId: 'IMZ5hCrK1j4',
    uploadDate: '2026-10-10T03:41:04-07:00', durationSeconds: 451,
    afterSection: 0, // after the introduction, before "HAS-A vs IS-A"
    title: 'Aggregation in Java Explained | HAS-A Relationship with Real Examples | Java Core Course',
    description: 'A full walkthrough of aggregation: the HAS-A relationship compared with IS-A, a Department that has Employees, why the parts stay independent, how it differs from composition, when to use it, and common interview questions.',
  },
  lesson_java_core_super_keyword: {
    youtubeId: 'sKy-aXru068',
    uploadDate: '2026-10-10T04:25:10-07:00', durationSeconds: 397,
    afterSection: 0, // after the introduction, before "super(...) — Calling the Superclass Constructor"
    title: 'Demystifying the super Keyword in Java | Constructors, Methods & Variables Explained',
    description: 'Using an Animal parent and a Dog child, this video shows super() calling the parent constructor as the first line, super.method() running the parent\'s version of an overridden method, super.variable reaching a hidden parent field, and how constructor chaining works, with common mistakes and interview questions.',
  },
}

export function getLessonVideo(lessonId) {
  return LESSON_VIDEOS[lessonId] || null
}

function isoDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `PT${minutes ? `${minutes}M` : ''}${seconds || !minutes ? `${seconds}S` : ''}`
}

// schema.org VideoObject for a lesson video. Returns null without an upload date,
// because Google requires one and an invented date would be misleading.
export function videoObjectSchema(video) {
  if (!video?.uploadDate) return null
  return {
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnail || `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`],
    uploadDate: video.uploadDate,
    ...(video.durationSeconds ? { duration: isoDuration(video.durationSeconds) } : {}),
    embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
    url: video.format === 'short' ? `https://www.youtube.com/shorts/${video.youtubeId}` : `https://www.youtube.com/watch?v=${video.youtubeId}`,
  }
}
