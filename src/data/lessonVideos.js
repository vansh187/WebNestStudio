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
  lesson_java_core_polymorphism_in_java_an_overview: {
    youtubeId: 'rjXj9gmSgL4',
    uploadDate: '2026-10-10T05:08:18-07:00', durationSeconds: 421,
    afterSection: 0, // after the introduction, before "Compile-Time (Static) Polymorphism"
    title: 'Java Polymorphism Masterclass: Method Overloading, Overriding and Dynamic Dispatch',
    description: 'From "one interface, many forms" to how the JVM picks a method at runtime: overloading rules, overriding and dynamic method dispatch, upcasting and downcasting with ClassCastException, why static, private and final methods are not overridden, covariant return types, interfaces and abstract classes, a payment-system example, and tricky interview output questions.',
  },
  lesson_java_core_method_overriding: {
    youtubeId: 'ShrBPoFN9dU',
    uploadDate: '2026-10-11T13:05:05-07:00', durationSeconds: 428,
    afterSection: 0, // after the introduction, before "Why We Need Method Overriding"
    title: 'Method Overriding in Java – Complete Guide with Examples | Core Java Tutorial',
    description: 'Why subclasses override methods and every rule an override must follow: matching signatures, covariant return types, access modifiers, checked vs unchecked exceptions, the @Override annotation, why static, final and private methods cannot be overridden, calling the parent with super, dynamic method dispatch, overloading vs overriding, and interview questions.',
  },
  lesson_java_core_runtime_polymorphism_and_dynamic_binding: {
    youtubeId: 'EzTjUIlNWtE',
    uploadDate: '2026-10-11T13:28:56-07:00', durationSeconds: 386,
    afterSection: 0, // after the introduction, before "Why We Need Runtime Polymorphism"
    title: 'Runtime Polymorphism in Java – Complete Guide with Examples | Core Java Tutorial',
    description: 'How Java picks the method to call at runtime: overriding plus upcasting, dynamic method dispatch, early vs late binding, why fields and static, final and private methods are not polymorphic, downcasting with instanceof, polymorphism through interfaces and abstract classes, payment, shape and vehicle examples, and interview questions.',
  },
  lesson_java_core_abstraction_and_abstract_classes: {
    youtubeId: 'NZAPlKlULQo',
    uploadDate: '2026-10-12T13:15:00-07:00', durationSeconds: 400,
    afterSection: 0, // after the introduction, before "Declaring an Abstract Class"
    title: 'Abstraction in Java - Complete Deep Dive | Abstract Class, Interface & Real Examples',
    description: 'A deep dive into abstraction in core Java, including how abstract classes and interfaces hide implementation details behind clear contracts, with practical examples.',
  },
  lesson_java_core_interfaces_in_java: {
    youtubeId: 'kY3wBkCVMbo',
    uploadDate: '2026-10-12T13:43:22-07:00', durationSeconds: 363,
    afterSection: 0, // after the introduction, before "Interface Members"
    title: 'Java Interfaces Explained in Depth | Default, Static, Private & Functional Interfaces',
    description: 'A walkthrough of Java interfaces: defining contracts, implementing interfaces, and using default and static methods.',
  },
  lesson_java_core_abstract_class_vs_interface: {
    youtubeId: '9_PvTLPKOHI',
    uploadDate: '2026-10-13T10:39:46-07:00', durationSeconds: 445,
    afterSection: 0, // after the introduction, before "What Is an Abstract Class?"
    title: 'Interface vs Abstract Class in Java: Full Difference Explained with Examples',
    description: 'Builds an abstract class and an interface side by side, then compares them on methods, variables, constructors and access modifiers, shows multiple inheritance through interfaces and the Java 8 default/static and Java 9 private interface methods, explains when to pick each in real projects, and finishes with the most-asked interview questions.',
  },
  lesson_java_core_packages_and_access_modifiers: {
    youtubeId: 'rEug2CTFbN0',
    uploadDate: '2026-10-14T11:13:14-07:00', durationSeconds: 399,
    afterSection: 0, // after the introduction, before the package and access-level sections
    title: 'Java Access Modifiers Explained 🔐 public vs private vs protected vs default | Java Core',
    description: 'Learn how Java’s public, private, protected, and package-private access levels control visibility across classes and packages, with practical examples.',
  },
  lesson_java_core_java_final_keyword: {
    youtubeId: 'bi6pFoiIq1Y',
    uploadDate: '2026-10-14T12:39:52-07:00', durationSeconds: 378,
    afterSection: 0, // after the introduction, before the final variable, method, and class sections
    title: 'Java final Keyword Explained 🔒 final Variable, Method & Class with Examples | Java Core',
    description: 'A detailed walkthrough of Java’s final keyword on variables, methods, and classes, with examples of how it restricts reassignment and inheritance.',
  },
  lesson_java_core_object_class_and_its_methods: {
    youtubeId: 'me3OQ4xoVEw',
    uploadDate: '2026-10-14T13:18:42-07:00', durationSeconds: 396,
    afterSection: 0, // after the introduction, before the Object class methods
    title: 'Java Object Class Explained 🧬 toString, equals, hashCode, clone & More | Java Core Tutorial',
    description: 'A detailed guide to java.lang.Object and its methods, including toString(), equals(), hashCode(), clone(), getClass(), and the wait/notify methods.',
  },
  lesson_java_core_object_cloning: {
    youtubeId: 'Zogt8XzzCLM',
    uploadDate: '2026-10-15T12:25:00-07:00', durationSeconds: 439,
    afterSection: 0, // after the introduction, before "What Is Object Cloning?"
    title: 'Object Cloning in Java | Shallow Copy vs Deep Copy | Core Java Tutorial',
    description: 'Explains what object cloning is, how the clone() method and the Cloneable marker interface work together, and the difference between a shallow copy and a deep copy, with worked examples and common interview questions.',
  },
  lesson_java_core_wrapper_classes: {
    youtubeId: 'mCG6oeNdGPg',
    uploadDate: '2026-10-15T13:09:28-07:00', durationSeconds: 401,
    afterSection: 0, // after the introduction, before "Why Java Needs Wrapper Classes"
    title: 'Wrapper Classes in Java Explained | Autoboxing & Unboxing | Core Java Tutorial',
    description: 'Covers why Java has wrapper classes, primitives vs wrappers, all eight wrapper classes, autoboxing and unboxing, the Integer, Double, Boolean and Character classes, using wrappers in collections, and common interview questions.',
  },
  lesson_java_core_java_math_class_and_utility_methods: {
    youtubeId: 'aob2E8ll2DE',
    uploadDate: '2026-10-16T12:55:48-07:00', durationSeconds: 353,
    afterSection: 0, // after the introduction, before "What Is the Math Class and Why Is It final?"
    title: 'Java Math Class Explained for Beginners | max, min, pow, sqrt, random & more',
    description: 'Walks through the java.lang.Math class: why it is final and static, Math.PI and Math.E, max/min/abs, pow/sqrt/cbrt, round vs ceil vs floor vs rint, random numbers in a range, trig and log methods, signum and hypot, and the overflow-safe exact methods, ending with interview questions.',
  },
  lesson_java_core_strictfp_keyword_in_java: {
    youtubeId: 'IlU7x-BKy88',
    uploadDate: '2026-10-16T13:44:24-07:00', durationSeconds: 475,
    afterSection: 0, // after the introduction, before "What strictfp Means"
    title: 'Java strictfp Keyword Full Tutorial | Floating-Point Precision Made Simple',
    description: 'Explains what strictfp means, the cross-CPU floating-point problem it solved, IEEE 754 basics, where it is and is not allowed (and why abstract plus strictfp is illegal), how it affects inner classes and subclasses, the Java 17 JEP 306 change, and interview questions.',
  },
  lesson_java_core_encapsulation: {
    youtubeId: '7Z9Td8m8o_s',
    uploadDate: '2026-10-13T11:36:30-07:00', durationSeconds: 472,
    afterSection: 0, // after the introduction, before "Access Modifiers Recap"
    title: 'Encapsulation in Java: Complete Guide with Real Examples | Java OOP',
    description: 'Starts from data hiding with private fields and an access modifier recap, then covers getters and setters (and when not to write them), validation inside setters, read-only and write-only classes, immutable classes and how String works, encapsulation vs abstraction, a bank account example, and common interview questions.',
  },
  lesson_java_core_instance_initializer_block: {
    youtubeId: 'NzEldpy8tQ4',
    uploadDate: '2026-10-11T13:46:03-07:00', durationSeconds: 278,
    afterSection: 0, // after the introduction, before "When Instance Initializer Blocks Run"
    title: 'Instance Initializer Block in Java – Complete Guide with Examples | Core Java Tutorial',
    description: 'What an instance initializer block is and exactly when it runs: before the constructor body on every new object, how the compiler copies it into each constructor after super(), multiple blocks and field initializers in textual order, this() chaining, parent-to-child order with static blocks, real uses such as anonymous classes, and tricky output questions.',
  },
}

// Additional Core Java companions from Webnest_YouTube_Videos.xlsx.
// Keep these as lesson-scoped records so detail videos and Shorts can appear
// together on the same topic page. Workbook entries do not include publish
// dates, so they intentionally omit VideoObject date metadata.
const CORE_JAVA_WORKBOOK_VIDEOS = {
  lesson_java_core_oops_concepts_in_java: [
    { youtubeId: 'VeHjoi5AdT0', title: '4 Pillars of OOP in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_interfaces_in_java: [
    { youtubeId: 'ja_UDYi_j1I', title: 'Java Interfaces in 60 Seconds!', format: 'short' },
  ],
  lesson_java_core_abstraction_and_abstract_classes: [
    { youtubeId: '6-AZVxA1qfk', title: 'Abstraction in Java Explained', format: 'short' },
    { youtubeId: 'at__QPEeq_A', title: 'Interface vs Abstraction in Java Explained', format: 'short' },
  ],
  lesson_java_core_encapsulation: [
    { youtubeId: '-kPbKytAvd0', title: 'Java Encapsulation: Hide Data Like a Pro!', format: 'short' },
  ],
  lesson_java_core_packages_and_access_modifiers: [
    { youtubeId: 'XEak3O1RjJk', title: '4 Java Access Modifiers in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_object_class_and_its_methods: [
    { youtubeId: 'aV0aaREeKKU', title: 'Java Object Class in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_object_cloning: [
    { youtubeId: '5Qv9LCXWLXg', title: 'How Shallow Cloning Can Corrupt Java Objects', format: 'short' },
  ],
  lesson_java_core_wrapper_classes: [
    { youtubeId: 'RW_dH_p70zA', title: 'int vs Integer in Java: Wrapper Classes Explained', format: 'short' },
  ],
  lesson_java_core_java_math_class_and_utility_methods: [
    { youtubeId: 'FTQ8du5CbIM', title: 'Java Math Class in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_strictfp_keyword_in_java: [
    { youtubeId: 'xOaK_Zoz8eo', title: 'Java strictfp Keyword Explained', format: 'short' },
  ],
  lesson_java_core_java_varargs: [
    { youtubeId: 'Ege3oq_MD14', title: 'Java Varargs Explained in 5 Minutes' },
    { youtubeId: 'ReC3kIy4LF8', title: 'Java Varargs Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_static_import: [
    { youtubeId: 'F4cgS1X6Ieg', title: 'Java Static Import Explained in Detail' },
    { youtubeId: 'bgXYsO8BGKA', title: 'Java Static Import Explained with Examples', format: 'short' },
  ],
  lesson_java_core_instanceof_and_downcasting: [
    { youtubeId: 'AQKeP8zbKgc', title: 'Why Does Java Throw ClassCastException? Fix It with instanceof' },
    { youtubeId: 'I05XqtFUsv4', title: 'Stop ClassCastException with instanceof!', format: 'short' },
  ],
  lesson_java_core_method_overriding: [
    { youtubeId: 'nhW4Pt7SCAE', title: 'Method Overriding in Java', format: 'short' },
  ],
  lesson_java_core_runtime_polymorphism_and_dynamic_binding: [
    { youtubeId: 'QQjvMRMBG9I', title: 'Dynamic Binding in Java Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_instance_initializer_block: [
    { youtubeId: 'Mk1n1kpxT50', title: 'Instance Block in Java Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_abstract_class_vs_interface: [
    { youtubeId: 'at__QPEeq_A', title: 'Interface vs Abstraction in Java Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_garbage_collection_in_java: [
    { youtubeId: 'aVBPGYdN3f0', title: 'Java Garbage Collector Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_java_string: [
    { youtubeId: 'xmwxmlzZcHQ', title: 'Java Strings in Detail | String Pool, Immutability, StringBuilder vs StringBuffer', description: 'A detailed walkthrough of Java strings, the string pool, immutability, and mutable alternatives.' },
    { youtubeId: '_BpDMKVrYRY', title: 'Java Strings Explained in Detail', description: 'A detailed explanation of Java strings, the string pool, immutability, StringBuilder and StringBuffer.' },
    { youtubeId: 'WYdZDZWuWIk', title: 'Why Are Java Strings Immutable? String Pool Explained', format: 'short' },
    { youtubeId: 'DkdlW1QTnXU', title: 'Why Java Strings Are Immutable', format: 'short' },
  ],
  lesson_java_core_why_strings_are_immutable_in_java: [
    { youtubeId: 'jBCfTth0w-M', title: 'String Immutability in Java Explained in Detail' },
    { youtubeId: '5Rg2KhZ8uHY', title: 'Java Strings Mystery: Why == Fails but equals() Works', format: 'short' },
    { youtubeId: 'O_0YJZhjbWY', title: 'Why String is Immutable in Java?', format: 'short' },
    { youtubeId: 'ZEsXD1wKhYQ', title: 'How the Java String Pool Traps Beginners', format: 'short' },
  ],
  lesson_java_core_java_stringbuffer: [
    { youtubeId: 'bWccRLhXDyw', title: 'StringBuffer in Java Explained in Detail' },
    { youtubeId: 'hoFrg6zkQaI', title: 'Why StringBuffer is Thread-Safe?', format: 'short' },
  ],
  lesson_java_core_java_stringbuilder: [
    { youtubeId: 'diGDu2BcEyQ', title: 'StringBuilder in Java – Complete Guide', description: 'A detailed guide to StringBuilder and how it compares with String and StringBuffer.' },
    { youtubeId: '9D9ZfNIUp1w', title: 'StringBuilder vs String in Java', format: 'short' },
  ],
  lesson_java_core_string_vs_stringbuffer_vs_stringbuilder: [
    { youtubeId: 'LhD-4_ikV0s', title: 'StringBuffer vs StringBuilder in Java: Key Differences' },
    { youtubeId: 'NfqujCyo5VU', title: 'StringBuffer vs StringBuilder in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_string_comparison_and_the_string_pool: [
    { youtubeId: '5Rg2KhZ8uHY', title: 'Java Strings Mystery: Why == Fails but equals() Works', format: 'short' },
  ],
  lesson_java_core_how_to_create_an_immutable_class_in_java: [
    { youtubeId: '-jl3yctonkg', title: 'Immutable Classes in Java: How String Stays Immutable and How to Build Your Own' },
  ],
  lesson_java_core_stringtokenizer_class_in_java: [
    { youtubeId: 'ggpIfuoutNg', title: 'Java StringTokenizer Tutorial' },
    { youtubeId: 'TIUtJGxNTf4', title: 'StringTokenizer in Java Explained', format: 'short' },
  ],
  lesson_java_core_java_regular_expressions_regex: [
    { youtubeId: 'gy1Mop7VGjc', title: 'Java Regex Full Tutorial: Pattern, Matcher and Regular Expressions' },
    { youtubeId: 'TWdkOhCUPXY', title: 'Java Regex in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_method_overloading_vs_method_overriding_a_comparison: [
    { youtubeId: 'M-y5u-p1wrc', title: 'Java OOP: Overloading vs Overriding' },
    { youtubeId: 'tQwa8TPzz8k', title: 'Overloading vs Overriding in Java', format: 'short' },
    { youtubeId: 'uxQr6sUHy6w', title: 'Overloading vs Overriding in Java', format: 'short' },
  ],
  lesson_java_core_nested_and_inner_classes: [
    { youtubeId: 'mgAQ9_E1DDQ', title: 'Nested Classes in Java Explained' },
    { youtubeId: 'OHf1zkVRJ3s', title: 'Java Nested Classes Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_nested_interfaces_in_java: [
    { youtubeId: 'TrtCz-rH_-k', title: 'Nested Interfaces in Java Explained', format: 'short' },
  ],
  lesson_java_core_java_final_keyword: [
    { youtubeId: '1Fhq7fyICxM', title: 'Java final Keyword in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_final_vs_finally_vs_finalize: [
    { youtubeId: 'V2XOdEohMiA', title: 'final vs finally vs finalize in Java: Key Differences' },
    { youtubeId: 'up4dY9lMJp8', title: 'final vs finally vs finalize() in Java', format: 'short' },
  ],
  lesson_java_core_exception_handling_basics: [
    { youtubeId: 'JqdPfSt9Ubg', title: 'Master Exception Handling in Java: Try-Catch Explained' },
    { youtubeId: 'HJdkeSDS_ko', title: 'Java Try Catch Finally Explained in Detail' },
    { youtubeId: 'zN_z7U1uc9k', title: 'Why Your Java Program Crashes: try-catch Explained', format: 'short' },
    { youtubeId: 'o4d4ydSM4UY', title: 'Java Try Catch Finally Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_try_catch_and_finally: [
    { youtubeId: 'HJdkeSDS_ko', title: 'Java Try Catch Finally Explained in Detail' },
    { youtubeId: 'o4d4ydSM4UY', title: 'Java Try Catch Finally Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_throw_and_throws: [
    { youtubeId: 'Pt_x-Hw7V5k', title: 'throw vs throws in Java: Exception Handling Explained' },
    { youtubeId: 'V5Tu5D9yMtU', title: 'Stop Confusing throw and throws in Java!', format: 'short' },
  ],
  lesson_java_core_exception_propagation_and_nested_try_blocks: [
    { youtubeId: 'CdreC3MznSQ', title: 'Exception Propagation in Java Explained' },
    { youtubeId: 'NaW4e7wHdh4', title: 'Where Does a Java Exception Go?', format: 'short' },
  ],
  lesson_java_core_exception_handling_rules_with_method_overriding: [
    { youtubeId: '8gN51mOTYi8', title: 'Exception Handling in Method Overriding' },
    { youtubeId: '2Rh29hwGBBY', title: 'Exception Rules in Method Overriding', format: 'short' },
  ],
  lesson_java_core_custom_exceptions: [
    { youtubeId: 'M0r-Ex6Y3Ms', title: 'Custom Exceptions in Java: Create Your Own Checked and Unchecked Exceptions' },
    { youtubeId: 'waa5znh7PaI', title: 'Custom Exceptions in Java', format: 'short' },
  ],
  lesson_java_core_multithreading_basics_and_thread_life_cycle: [
    { youtubeId: '0IoV4sO8msU', title: 'Java Threads in Depth: Everything You Need to Know' },
    { youtubeId: '2_5I5BsceA0', title: 'Java Multithreading Explained: Create Threads, Lifecycle and Synchronization' },
    { youtubeId: 'SZHLXClJ2yU', title: 'Java Threads Explained: Lifecycle and States', format: 'short' },
    { youtubeId: 'JAaH9ODIH9g', title: 'Threads in Java Explained', format: 'short' },
  ],
  lesson_java_core_creating_threads_thread_class_vs_runnable: [
    { youtubeId: 'vwP_7lFCsns', title: 'Runnable vs Thread in Java: Why Runnable Wins', format: 'short' },
  ],
  lesson_java_core_thread_priority_and_sleep: [
    { youtubeId: 'ba600dJ6qO8', title: 'Thread Priority and sleep() in Java Explained in Detail' },
  ],
  lesson_java_core_daemon_threads_thread_naming_and_start_vs_run: [
    { youtubeId: 'xEfiAbSKxrQ', title: 'start() vs run() in Java: The Mistake Most Beginners Make' },
    { youtubeId: 'R0cg8hGOWDE', title: 'Why run() Does Not Create a Thread in Java', format: 'short' },
  ],
  lesson_java_core_synchronization: [
    { youtubeId: '45JObRFx4RY', title: 'Why Java Needs Synchronization: Race Condition Fixed with synchronized' },
    { youtubeId: 'ISACF9lp1DI', title: 'Race Condition in Java? Fix It with synchronized!', format: 'short' },
  ],
  lesson_java_core_advanced_synchronization_reentrant_locks_and_interrupting_threads: [
    { youtubeId: 'MAtRpDD7nek', title: 'Advanced Java Thread Synchronization' },
    { youtubeId: 'Y0hz3BCIRyU', title: 'How Java ReentrantLock Prevents Self-Deadlock', format: 'short' },
  ],
  lesson_java_core_inter_thread_communication_wait_notify_notifyall: [
    { youtubeId: 'GuVRR5DaEjM', title: 'Java Multithreading: Inter-Thread Communication Made Easy' },
    { youtubeId: 'hZXD-mEU49Q', title: 'Inter-Thread Communication Explained Fast', format: 'short' },
  ],
  lesson_java_core_deadlock: [
    { youtubeId: 'mYputDSamSk', title: 'Deadlock in Java Explained: Causes, Examples and Prevention' },
    { youtubeId: 'U6fl_bIrmEs', title: 'How to Prevent Deadlocks in Java?', format: 'short' },
  ],
  lesson_java_core_thread_pool_and_the_executor_framework: [
    { youtubeId: 'dgbzJ5GWz4A', title: 'Why Use a Thread Pool in Java?', format: 'short' },
  ],
  lesson_java_core_callable_future_and_completablefuture: [
    { youtubeId: '-xt72-TiEFU', title: 'Evolution of Async in Java: Thread, Future, CompletableFuture Explained' },
    { youtubeId: 'bo6QsNtVfTQ', title: 'How CompletableFuture Unblocks Java Tasks', format: 'short' },
  ],
  lesson_java_core_java_memory_management_stack_vs_heap: [
    { youtubeId: 'CkqBWTrLI-U', title: 'Java Memory Management Explained: Heap, Stack, Metaspace and GC' },
    { youtubeId: 'NJE7Tr1-WFE', title: 'Stack vs Heap Memory Explained Simply', format: 'short' },
  ],
  lesson_java_core_garbage_collection_in_java: [
    { youtubeId: 'aVBPGYdN3f0', title: 'Java Garbage Collector Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_volatile_keyword_in_java: [
    { youtubeId: 'Y2EtJvAJl-s', title: 'Java volatile Keyword Explained in Detail' },
    { youtubeId: '4ut4QXDlv7g', title: 'volatile in Java Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_transient_keyword_in_java: [
    { youtubeId: 'gdtDhO1qRBY', title: 'Transient Keyword in Java Explained' },
    { youtubeId: 'WEg27O8y-1I', title: 'Java transient Keyword Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_exception_hierarchy: [
    { youtubeId: 'QTYCuI9TXSM', title: 'Anatomy of a Java Crash: Read Any Stack Trace in 10 Minutes' },
  ],
  lesson_java_core_java_memory_management_stack_vs_heap: [
    { youtubeId: 'M3KT6Nn0KHA', title: 'Stack vs Heap in 10 Minutes: Every Developer Must Know This' },
  ],
}

const CORE_JAVA_WORKBOOK_SHORTS = {
  lesson_java_core_java_inheritance: [{ youtubeId: 'GM4K5jYT7X4', title: 'How Java Inheritance Shares Code', format: 'short' }],
  lesson_java_core_aggregation_in_java: [
    { youtubeId: 'COzyy9AJFtw', title: 'How Java Aggregation Protects Objects', format: 'short' },
    { youtubeId: '5kXvd_rXNMQ', title: 'Java Aggregation Protects Objects', format: 'short' },
  ],
  lesson_java_core_super_keyword: [{ youtubeId: 'Me0DUB7bUOA', title: 'Java super Keyword Explained in 60 Seconds', format: 'short' }],
  lesson_java_core_nested_and_inner_classes: [{ youtubeId: 'OHf1zkVRJ3s', title: 'Java Nested Classes Explained in 60 Seconds', format: 'short' }],
  lesson_java_core_nested_interfaces_in_java: [{ youtubeId: 'TrtCz-rH_-k', title: 'Nested Interfaces in Java Explained', format: 'short' }],
  lesson_java_core_java_final_keyword: [{ youtubeId: '1Fhq7fyICxM', title: 'Java final Keyword in 60 Seconds', format: 'short' }],
  lesson_java_core_method_overriding: [{ youtubeId: 'nhW4Pt7SCAE', title: 'Method Overriding in Java', format: 'short' }],
  lesson_java_core_runtime_polymorphism_and_dynamic_binding: [{ youtubeId: 'QQjvMRMBG9I', title: 'Dynamic Binding in Java Explained in 60 Seconds', format: 'short' }],
  lesson_java_core_instance_initializer_block: [{ youtubeId: 'Mk1n1kpxT50', title: 'Instance Block in Java Explained in 60 Seconds', format: 'short' }],
  lesson_java_core_abstraction_and_abstract_classes: [
    { youtubeId: '6-AZVxA1qfk', title: 'Abstraction in Java Explained', format: 'short' },
    { youtubeId: 'at__QPEeq_A', title: 'Interface vs Abstraction in Java Explained', format: 'short' },
  ],
  lesson_java_core_interfaces_in_java: [{ youtubeId: 'ja_UDYi_j1I', title: 'Java Interfaces in 60 Seconds!', format: 'short' }],
  lesson_java_core_abstract_class_vs_interface: [{ youtubeId: 'at__QPEeq_A', title: 'Interface vs Abstraction in Java Explained', format: 'short' }],
  lesson_java_core_encapsulation: [{ youtubeId: '-kPbKytAvd0', title: 'Java Encapsulation: Hide Data Like a Pro!', format: 'short' }],
  lesson_java_core_packages_and_access_modifiers: [{ youtubeId: 'XEak3O1RjJk', title: '4 Java Access Modifiers in 60 Seconds', format: 'short' }],
  lesson_java_core_object_class_and_its_methods: [{ youtubeId: 'aV0aaREeKKU', title: 'Java Object Class in 60 Seconds', format: 'short' }],
  lesson_java_core_object_cloning: [{ youtubeId: '5Qv9LCXWLXg', title: 'How Shallow Cloning Can Corrupt Java Objects', format: 'short' }],
  lesson_java_core_wrapper_classes: [{ youtubeId: 'RW_dH_p70zA', title: 'int vs Integer in Java: Wrapper Classes Explained', format: 'short' }],
  lesson_java_core_java_math_class_and_utility_methods: [{ youtubeId: 'FTQ8du5CbIM', title: 'Java Math Class in 60 Seconds', format: 'short' }],
  lesson_java_core_strictfp_keyword_in_java: [{ youtubeId: 'xOaK_Zoz8eo', title: 'Java strictfp Keyword Explained', format: 'short' }],
  lesson_java_core_java_varargs: [{ youtubeId: 'ReC3kIy4LF8', title: 'Java Varargs Explained in 60 Seconds', format: 'short' }],
  lesson_java_core_static_import: [{ youtubeId: 'bgXYsO8BGKA', title: 'Java Static Import Explained with Examples', format: 'short' }],
  lesson_java_core_instanceof_and_downcasting: [{ youtubeId: 'I05XqtFUsv4', title: 'Stop ClassCastException with instanceof!', format: 'short' }],
  lesson_java_core_stringbuilder: [{ youtubeId: '9D9ZfNIUp1w', title: 'StringBuilder vs String in Java', format: 'short' }],
  lesson_java_core_string_vs_stringbuffer_vs_stringbuilder: [{ youtubeId: 'hoFrg6zkQaI', title: 'Why StringBuffer is Thread-Safe?', format: 'short' }],
  lesson_java_core_stringtokenizer_class_in_java: [{ youtubeId: 'TIUtJGxNTf4', title: 'StringTokenizer in Java Explained', format: 'short' }],
  lesson_java_core_java_regular_expressions_regex: [{ youtubeId: 'TWdkOhCUPXY', title: 'Java Regex in 60 Seconds', format: 'short' }],
  lesson_java_core_exception_handling_basics: [
    { youtubeId: 'zN_z7U1uc9k', title: 'Why Your Java Program Crashes: try-catch Explained', format: 'short' },
    { youtubeId: 'o4d4ydSM4UY', title: 'Java Try Catch Finally Explained in 60 Seconds', format: 'short' },
  ],
  lesson_java_core_throw_and_throws: [{ youtubeId: 'V5Tu5D9yMtU', title: 'Stop Confusing throw and throws in Java!', format: 'short' }],
  lesson_java_core_exception_propagation_and_nested_try_blocks: [{ youtubeId: 'NaW4e7wHdh4', title: 'Where Does a Java Exception Go?', format: 'short' }],
  lesson_java_core_final_vs_finally_vs_finalize: [{ youtubeId: 'up4dY9lMJp8', title: 'final vs finally vs finalize() in Java', format: 'short' }],
  lesson_java_core_exception_handling_rules_with_method_overriding: [{ youtubeId: '2Rh29hwGBBY', title: 'Exception Rules in Method Overriding', format: 'short' }],
  lesson_java_core_custom_exceptions: [{ youtubeId: 'waa5znh7PaI', title: 'Custom Exceptions in Java', format: 'short' }],
  lesson_java_core_exception_hierarchy: [{ youtubeId: 'YOIa-rC0dmg', title: 'Read a Java Stack Trace in 30 Seconds', format: 'short' }],
  lesson_java_core_multithreading_basics_and_thread_life_cycle: [
    { youtubeId: 'qWKGXy3sZrI', title: 'Why Do We Need Threads in Java?', format: 'short' },
    { youtubeId: 'sh-W6BQlzgU', title: 'Stop Making These Java Thread Mistakes!', format: 'short' },
    { youtubeId: '7WHcFvw8k8o', title: 'Why Threads Are Lighter Than Processes', format: 'short' },
    { youtubeId: 'tu1D-iuZ3UA', title: 'Why Threads in Java? Concurrency Explained Simply', format: 'short' },
  ],
  lesson_java_core_creating_threads_thread_class_vs_runnable: [{ youtubeId: 'vwP_7lFCsns', title: 'Runnable vs Thread in Java: Why Runnable Wins', format: 'short' }],
  lesson_java_core_synchronization: [{ youtubeId: 'ISACF9lp1DI', title: 'Race Condition in Java? Fix It with synchronized!', format: 'short' }],
  lesson_java_core_advanced_synchronization_reentrant_locks_and_interrupting_threads: [{ youtubeId: 'Y0hz3BCIRyU', title: 'How Java ReentrantLock Prevents Self-Deadlock', format: 'short' }],
  lesson_java_core_inter_thread_communication_wait_notify_notifyall: [{ youtubeId: 'hZXD-mEU49Q', title: 'Inter-Thread Communication Explained Fast', format: 'short' }],
  lesson_java_core_deadlock: [{ youtubeId: 'U6fl_bIrmEs', title: 'How to Prevent Deadlocks in Java?', format: 'short' }],
  lesson_java_core_thread_pool_and_the_executor_framework: [{ youtubeId: 'dgbzJ5GWz4A', title: 'Why Use a Thread Pool in Java?', format: 'short' }],
  lesson_java_core_callable_future_and_completablefuture: [{ youtubeId: 'bo6QsNtVfTQ', title: 'How CompletableFuture Unblocks Java Tasks', format: 'short' }],
  lesson_java_core_java_memory_management_stack_vs_heap: [{ youtubeId: 'NJE7Tr1-WFE', title: 'Stack vs Heap Memory Explained Simply', format: 'short' }],
  lesson_java_core_garbage_collection_in_java: [{ youtubeId: 'aVBPGYdN3f0', title: 'Java Garbage Collector Explained in 60 Seconds', format: 'short' }],
  lesson_java_core_volatile_keyword_in_java: [{ youtubeId: '4ut4QXDlv7g', title: 'volatile in Java Explained in 60 Seconds', format: 'short' }],
  lesson_java_core_transient_keyword_in_java: [{ youtubeId: 'WEg27O8y-1I', title: 'Java transient Keyword Explained in 60 Seconds', format: 'short' }],
}

export function getLessonVideo(lessonId) {
  const existing = LESSON_VIDEOS[lessonId]
  const additions = [
    ...(CORE_JAVA_WORKBOOK_VIDEOS[lessonId] || []),
    ...(CORE_JAVA_WORKBOOK_SHORTS[lessonId] || []),
  ]
  if (!existing && !additions.length) return null
  return [...[].concat(existing || []), ...additions].filter((video, index, all) =>
    all.findIndex((candidate) => candidate.youtubeId === video.youtubeId) === index,
  )
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
