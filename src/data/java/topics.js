// Full Java curriculum structure for the Webnest CodeLab "Java - Core" and
// "Advanced Java" courses. Each topic maps to one rich, hand-written lesson
// in src/data/java/content-*.js (merged by index.js). Keeping this list
// separate from the content lets us control ordering, module grouping, and
// slugs without touching the writing itself.

export function javaSlugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const JAVA_CORE_MODULES = [
  ['Java Basics', [
    'History and Features of Java',
    'Setting Up the Java Development Environment',
    'C++ vs Java: Key Differences',
    'JVM, JDK, and JRE',
    'Java Program Structure and First Program',
    'Java Variables',
    'Identifiers in Java',
    'Java Data Types',
    'Unicode System in Java',
    'Type Casting and Type Promotion',
    'Java Operators',
    'Java Keywords',
    'Java Comments',
    'Command Line Arguments',
  ]],
  ['Control Flow and Arrays', [
    'Java If-else Statement',
    'Java Switch Statement',
    'Java For Loop',
    'Java While and Do-While Loop',
    'Java For-each Loop',
    'Java Break and Continue',
    'Java Arrays',
    'Java Multidimensional Arrays',
    'Java Arrays Class and Copying Arrays',
    'Java Recursion',
  ]],
  ['Strings and Regex', [
    'Java String',
    'Why Strings Are Immutable in Java',
    'Java String Methods',
    'Java StringBuffer',
    'Java StringBuilder',
    'String vs StringBuffer vs StringBuilder',
    'String Comparison and the String Pool',
    'How to Create an Immutable Class in Java',
    'StringTokenizer Class in Java',
    'Java Regular Expressions (Regex)',
  ]],
  ['Object-Oriented Programming', [
    'OOPs Concepts in Java',
    'Classes and Objects',
    'Java Naming Conventions',
    'Java Methods and Method Overloading',
    'Call By Value in Java',
    'Constructors and Constructor Overloading',
    'Static Keyword',
    'this Keyword',
    'Java Inheritance',
    'Aggregation in Java',
    'super Keyword',
    'Polymorphism in Java: An Overview',
    'Method Overriding',
    'Runtime Polymorphism and Dynamic Binding',
    'Instance Initializer Block',
    'Abstraction and Abstract Classes',
    'Interfaces in Java',
    'Abstract Class vs Interface',
    'Encapsulation',
    'Packages and Access Modifiers',
    'Java final Keyword',
    'Object Class and Its Methods',
    'Object Cloning',
    'Wrapper Classes',
    'Java Math Class and Utility Methods',
    'strictfp Keyword in Java',
    'Java Varargs',
    'Static Import',
    'instanceof and Downcasting',
    'Nested and Inner Classes',
    'Nested Interfaces in Java',
    'Method Overloading vs Method Overriding: A Comparison',
  ]],
  ['Exception Handling', [
    'Exception Handling Basics',
    'try, catch, and finally',
    'throw and throws',
    'Exception Propagation and Nested try Blocks',
    'Final vs Finally vs finalize()',
    'Exception Handling Rules with Method Overriding',
    'Custom Exceptions',
    'Checked vs Unchecked Exceptions',
    'Exception Hierarchy',
  ]],
  ['Multithreading', [
    'Multithreading Basics and Thread Life Cycle',
    'Creating Threads: Thread Class vs Runnable',
    'Thread Priority and sleep()',
    'Daemon Threads, Thread Naming, and start() vs run()',
    'Thread Scheduler, ThreadGroup, and Shutdown Hooks in Java',
    'Multitasking vs Multithreading in Java',
    'Synchronization',
    'Advanced Synchronization: Reentrant Locks and Interrupting Threads',
    'Inter-thread Communication: wait, notify, notifyAll',
    'Deadlock',
    'Thread Pool and the Executor Framework',
    'Callable, Future, and CompletableFuture',
  ]],
  ['Memory Management and Special Keywords', [
    'Java Memory Management: Stack vs Heap',
    'Garbage Collection in Java',
    'volatile Keyword in Java',
    'transient Keyword in Java',
  ]],
  ['Collections Framework', [
    'Collections Framework Overview',
    'List Interface: ArrayList, LinkedList, Vector',
    'Set Interface: HashSet, LinkedHashSet, TreeSet',
    'Map Interface: HashMap, LinkedHashMap, TreeMap, Hashtable',
    'How HashMap Works Internally',
    'Queue and Deque: PriorityQueue, ArrayDeque',
    'Iterator and ListIterator',
    'Comparable vs Comparator',
    'Generics in Java',
    'Collections Utility Methods and Fail-Fast vs Fail-Safe Iterators',
    'Concurrent Collections: ConcurrentHashMap and CopyOnWriteArrayList',
    'EnumMap, EnumSet, Properties Class, and How HashSet Works Internally',
  ]],
  ['Java 8+ and I/O', [
    'Lambda Expressions',
    'Functional Interfaces',
    'Stream API',
    'Method References',
    'Optional Class',
    'Date and Time API',
    'Java I/O Streams Fundamentals',
    'Scanner and Reading User Input',
    'Java Byte Stream Classes: FileInputStream, FileOutputStream, BufferedStream, ByteArrayStream, DataStream, ObjectStream, and PrintStream',
    'Java Character Stream Classes: FileReader/Writer, BufferedReader/Writer, CharArrayReader/Writer, StringReader/Writer, and PrintWriter',
    'File Handling: File, FileReader, FileWriter, BufferedReader',
    'Advanced File Handling: RandomAccessFile, the Path API (NIO.2), and Zip Files',
    'Serialization',
    'Modern Java Features: var, Records, Sealed Classes, Pattern Matching, and Text Blocks',
  ]],
  ['Networking, Reflection, and Platform Tools', [
    'Java Networking: Sockets, URL, URLConnection, HttpURLConnection, and InetAddress',
    'Java Reflection API and the javap Tool',
    'Java RMI (Remote Method Invocation)',
  ]],
  ['Algorithms and Internationalization', [
    'Searching Algorithms in Java: Linear Search and Binary Search',
    'Sorting Algorithms in Java: Bubble, Selection, Insertion, and Merge Sort',
    'Internationalization (i18n) in Java',
  ]],
]

export const ADVANCED_JAVA_MODULES = [
  ['JDBC (Database Connectivity)', [
    'JDBC Introduction and Architecture',
    'JDBC Drivers',
    'Connecting to a Database with DriverManager',
    'Statement, PreparedStatement, and CallableStatement',
    'Working with ResultSet',
    'Transactions in JDBC',
    'Connection Pooling Concepts',
  ]],
  ['Servlets', [
    'Servlet Introduction and Lifecycle',
    'Servlet Configuration: web.xml vs Annotations',
    'Request and Response Objects',
    'Session Tracking: Cookies, HttpSession, URL Rewriting',
    'Servlet Filters and Listeners',
    'RequestDispatcher: Forward vs Include',
  ]],
  ['JSP (JavaServer Pages)', [
    'JSP Introduction and Lifecycle',
    'JSP Scripting Elements',
    'JSP Implicit Objects',
    'JSP Directives and Actions',
    'MVC Architecture with Servlets and JSP',
  ]],
  ['Advanced Runtime Concepts', [
    'Networking Basics: Socket, ServerSocket, and URL',
    'Reflection API',
    'Java Annotations',
    'Enums in Java',
    'Java NIO Basics: Channels and Buffers',
  ]],
  ['Engineering Practices', [
    'Design Patterns Overview: Singleton, Factory, Builder, Observer',
    'Build Tools: Maven Basics',
    'Build Tools: Gradle Basics',
    'Logging in Java Applications',
    'Unit Testing with JUnit',
    'Packaging and Deployment: JAR and WAR',
  ]],
]

export function buildTopicIndex(modules) {
  const topics = []
  modules.forEach(([moduleTitle, items], moduleIndex) => {
    items.forEach((topic, topicIndex) => {
      topics.push({
        slug: javaSlugify(topic),
        title: topic,
        moduleTitle,
        moduleIndex,
        order: topicIndex + 1,
      })
    })
  })
  return topics
}

export const JAVA_CORE_TOPICS = buildTopicIndex(JAVA_CORE_MODULES)
export const ADVANCED_JAVA_TOPICS = buildTopicIndex(ADVANCED_JAVA_MODULES)
