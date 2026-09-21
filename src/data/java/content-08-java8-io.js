// Java 8 Features and I/O module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content08Java8Io = {
  'lambda-expressions': {
    title: 'Lambda Expressions',
    intro: `A lambda expression is a compact way to represent an anonymous function — a block of code with parameters that can be passed around like a value. Java 8 introduced lambdas primarily to reduce the boilerplate of anonymous inner classes when implementing interfaces that have exactly one method, such as event listeners, comparators, and runnables.

Instead of writing a full class definition just to supply one piece of behavior, a lambda lets you write only the parameters and the logic: <code>(parameters) -> expression</code> or <code>(parameters) -> { statements; }</code>. The compiler infers the target type from the context, most often a functional interface.`,
    sections: [
      {
        heading: 'Lambda Syntax Forms',
        body: `Java accepts several equivalent shapes depending on how much you want to write explicitly. All of the following are valid ways to express "take two ints and return their sum":`,
        list: [
          '<code>(int a, int b) -> a + b</code> — explicit parameter types, single expression.',
          '<code>(a, b) -> a + b</code> — inferred parameter types (the compiler figures out int from context).',
          '<code>(a, b) -> { return a + b; }</code> — block body with an explicit return statement.',
          '<code>x -> x * x</code> — parentheses can be dropped for exactly one inferred-type parameter.',
        ],
      },
      {
        heading: 'Replacing Anonymous Inner Classes',
        body: `Before Java 8, passing behavior meant writing an anonymous inner class that implemented an interface. A lambda produces the same effect with far less ceremony, because the compiler already knows which single method is being implemented from the target functional interface — you only supply the parameter list and body, not the interface name or method signature again.`,
      },
      {
        heading: 'Variable Capture: Effectively Final',
        body: `A lambda can read local variables from its enclosing scope, but only if those variables are "effectively final" — meaning they are never reassigned after initialization, even if not explicitly marked <code>final</code>. This restriction exists because the lambda may outlive the method call (for example, if stored and invoked later), so Java captures the variable's value rather than allowing it to change underneath the lambda.`,
      },
    ],
    examples: [
      {
        caption: 'Replacing an anonymous Runnable and Comparator with lambdas',
        code: `import java.util.Arrays;
import java.util.List;

public class LambdaDemo {
    public static void main(String[] args) {
        Runnable task = () -> System.out.println("Running via lambda");
        task.run();

        List<String> names = Arrays.asList("Banana", "apple", "Cherry");
        names.sort((a, b) -> a.compareToIgnoreCase(b));
        System.out.println(names);

        int factor = 3; // effectively final, safe to capture
        Runnable multiplier = () -> System.out.println("Factor is " + factor);
        multiplier.run();
    }
}`,
        output: `Running via lambda
[apple, Banana, Cherry]
Factor is 3`,
      },
    ],
    commonMistakes: [
      'Trying to reassign a local variable after capturing it in a lambda — this fails to compile because the variable must be effectively final.',
      'Adding a "return" keyword inside a single-expression lambda body, such as writing "x -> return x * x;", which is invalid syntax.',
      'Assuming a lambda can implement an interface with more than one abstract method — lambdas only target functional (single abstract method) interfaces.',
    ],
    keyPoints: [
      'A lambda is (parameters) -> expression or (parameters) -> { statements; }, targeting a functional interface.',
      'Lambdas replace anonymous inner classes for single-method interfaces with far less boilerplate.',
      'Captured local variables must be effectively final — never reassigned after their initial value.',
    ],
  },

  'functional-interfaces': {
    title: 'Functional Interfaces',
    intro: `A functional interface is an interface that declares exactly one abstract method, making it a valid target type for a lambda expression or method reference. Java 8 added the <code>@FunctionalInterface</code> annotation and a full set of general-purpose functional interfaces in the <code>java.util.function</code> package so that developers rarely need to declare their own.`,
    sections: [
      {
        heading: 'The Single Abstract Method Rule',
        body: `A functional interface can have any number of default methods and static methods, but only one abstract method — that single method is what the lambda's parameter list and body actually implement. The <code>@FunctionalInterface</code> annotation is optional but strongly recommended: it tells the compiler to raise an error if a second abstract method is accidentally added, catching the mistake at compile time instead of at the point of use.`,
      },
      {
        heading: 'Core Built-in Functional Interfaces',
        body: `Rather than defining custom interfaces for common shapes of behavior, Java 8 ships a standard set in <code>java.util.function</code>:`,
        list: [
          '<code>Predicate&lt;T&gt;</code> — <code>boolean test(T t)</code>, used for conditions/filters.',
          '<code>Function&lt;T, R&gt;</code> — <code>R apply(T t)</code>, transforms a value of type T into type R.',
          '<code>Supplier&lt;T&gt;</code> — <code>T get()</code>, takes no arguments and produces a value.',
          '<code>Consumer&lt;T&gt;</code> — <code>void accept(T t)</code>, takes a value and performs an action, returning nothing.',
          '<code>BiFunction&lt;T, U, R&gt;</code> — <code>R apply(T t, U u)</code>, like Function but with two input arguments.',
        ],
      },
      {
        heading: 'Writing a Custom Functional Interface',
        body: `When none of the built-in interfaces fit — for example, you want meaningful parameter names in the API or a domain-specific method name — you can declare your own single-abstract-method interface and annotate it with <code>@FunctionalInterface</code> for safety and clarity.`,
      },
    ],
    examples: [
      {
        caption: 'Built-in functional interfaces and a custom one',
        code: `import java.util.function.Predicate;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.function.Consumer;
import java.util.function.BiFunction;

public class FunctionalInterfaceDemo {

    @FunctionalInterface
    interface Greeter {
        String greet(String name);
    }

    public static void main(String[] args) {
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Function<String, Integer> length = String::length;
        Supplier<String> greeting = () -> "Hello from Supplier";
        Consumer<String> printer = s -> System.out.println("Consumed: " + s);
        BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

        System.out.println(isEven.test(4));
        System.out.println(length.apply("Webnest"));
        System.out.println(greeting.get());
        printer.accept("data");
        System.out.println(add.apply(2, 3));

        Greeter greeter = name -> "Welcome, " + name + "!";
        System.out.println(greeter.greet("Asha"));
    }
}`,
        output: `true
7
Hello from Supplier
Consumed: data
5
Welcome, Asha!`,
      },
    ],
    commonMistakes: [
      'Adding a second abstract method to an interface annotated with @FunctionalInterface — the compiler flags this as an error, which is exactly the point of the annotation.',
      'Confusing Supplier (no input, returns a value) with Consumer (takes input, returns nothing) — their signatures are opposites.',
      'Forgetting that default and static methods do not count toward the "single abstract method" rule, and assuming an interface with several default methods cannot be a functional interface.',
    ],
    keyPoints: [
      'A functional interface has exactly one abstract method; it may have any number of default/static methods.',
      '@FunctionalInterface is optional but enables compile-time checking of the single-method rule.',
      'java.util.function provides Predicate, Function, Supplier, Consumer, and BiFunction for common cases.',
    ],
  },

  'stream-api': {
    title: 'Stream API',
    intro: `The Stream API, added in Java 8, provides a declarative way to process sequences of data — collections, arrays, or I/O sources — using a pipeline of operations rather than explicit loops. A stream describes what should happen to the data, not the mechanics of how to iterate over it.

Streams are built around a simple pipeline shape: a source produces elements, zero or more intermediate operations transform or filter them, and exactly one terminal operation triggers execution and produces a result or side effect.`,
    sections: [
      {
        heading: 'The Stream Pipeline',
        body: `A typical pipeline looks like <code>collection.stream().filter(...).map(...).sorted(...).collect(...)</code>. <code>filter</code> keeps elements matching a Predicate, <code>map</code> transforms each element with a Function, and <code>sorted</code> orders elements — these are all intermediate operations that return a new stream. The pipeline only actually runs when a terminal operation like <code>collect</code>, <code>forEach</code>, <code>reduce</code>, <code>count</code>, or <code>anyMatch</code> is called.`,
      },
      {
        heading: 'Lazy Evaluation',
        body: `Intermediate operations are lazy: calling <code>.filter()</code> or <code>.map()</code> does not process any elements immediately. Java only walks through the source data once, when a terminal operation is invoked, and it processes each element through the entire chain of intermediate operations before moving to the next one. This means a stream with no terminal operation does nothing at all, and short-circuiting operations like <code>findFirst()</code> can stop processing early.`,
      },
      {
        heading: 'Streams Are Not Reusable',
        body: `Once a terminal operation consumes a stream, that stream is considered closed and cannot be reused — calling another operation on it throws an <code>IllegalStateException</code>. If you need to process the same data twice, you must create a new stream from the source collection each time.`,
      },
    ],
    examples: [
      {
        caption: 'A filter-map-sorted-collect pipeline plus reduce',
        code: `import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class StreamDemo {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Charlie", "amy", "Bob", "diana");

        List<String> result = names.stream()
                .filter(n -> n.length() > 3)
                .map(String::toUpperCase)
                .sorted()
                .collect(Collectors.toList());
        System.out.println(result);

        int totalLength = names.stream()
                .mapToInt(String::length)
                .reduce(0, Integer::sum);
        System.out.println("Total length: " + totalLength);
    }
}`,
        output: `[AMY, CHARLIE, DIANA]
Total length: 18`,
      },
    ],
    commonMistakes: [
      'Trying to reuse the same stream for two terminal operations, which throws IllegalStateException because streams are single-use.',
      'Calling only intermediate operations (filter, map) without a terminal operation and expecting something to happen — nothing executes until a terminal operation runs.',
      'Using streams for simple, short loops where a plain for-loop would be clearer and just as efficient — streams shine with multi-step transformations, not every iteration.',
      'Forgetting that stream operations should generally be free of side effects, since the order of processing is not always guaranteed, especially with parallel streams.',
    ],
    keyPoints: [
      'A stream pipeline is: source -> intermediate operations (filter, map, sorted) -> one terminal operation (collect, forEach, reduce).',
      'Intermediate operations are lazy; nothing executes until a terminal operation is invoked.',
      'A stream can be consumed by a terminal operation only once — it is not reusable.',
    ],
  },

  'method-references': {
    title: 'Method References',
    intro: `A method reference is shorthand notation for a lambda expression that does nothing but call an existing method. Instead of writing <code>x -> ClassName.method(x)</code>, you can write <code>ClassName::method</code>, using the double-colon <code>::</code> operator. Method references are purely syntactic sugar — they compile down to the same functional interface implementation a lambda would produce.`,
    sections: [
      {
        heading: 'The Four Kinds of Method References',
        body: `Java recognizes four distinct forms, each matching a different lambda shape:`,
        list: [
          '<strong>Static method reference</strong> — <code>ClassName::staticMethod</code>, equivalent to <code>args -> ClassName.staticMethod(args)</code>. Example: <code>Integer::parseInt</code>.',
          '<strong>Instance method reference on a particular object</strong> — <code>instance::method</code>, equivalent to <code>args -> instance.method(args)</code>. Example: <code>System.out::println</code>.',
          '<strong>Instance method reference on an arbitrary object of a type</strong> — <code>ClassName::instanceMethod</code>, equivalent to <code>(obj, args) -> obj.instanceMethod(args)</code>, where the first lambda parameter becomes the object the method is called on. Example: <code>String::toUpperCase</code>.',
          '<strong>Constructor reference</strong> — <code>ClassName::new</code>, equivalent to <code>args -> new ClassName(args)</code>. Example: <code>ArrayList::new</code>.',
        ],
      },
      {
        heading: 'Choosing Between a Lambda and a Method Reference',
        body: `A method reference is preferred when the lambda body would do nothing except forward its arguments to an existing method, because it is shorter and more directly communicates intent. If any extra logic, transformation, or multiple statements are needed, a plain lambda is the better and often only option.`,
      },
    ],
    examples: [
      {
        caption: 'All four kinds of method references in one program',
        code: `import java.util.Arrays;
import java.util.List;
import java.util.function.Function;
import java.util.function.Supplier;

public class MethodReferenceDemo {
    public static void main(String[] args) {
        // 1. Static method reference
        Function<String, Integer> parse = Integer::parseInt;
        System.out.println(parse.apply("42"));

        // 2. Instance method reference on a particular object
        List<String> items = Arrays.asList("pen", "book");
        items.forEach(System.out::println);

        // 3. Instance method reference on an arbitrary object of a type
        Function<String, String> upper = String::toUpperCase;
        System.out.println(upper.apply("java"));

        // 4. Constructor reference
        Supplier<StringBuilder> builderFactory = StringBuilder::new;
        StringBuilder sb = builderFactory.get();
        sb.append("built via constructor reference");
        System.out.println(sb);
    }
}`,
        output: `42
pen
book
JAVA
built via constructor reference`,
      },
    ],
    commonMistakes: [
      'Confusing "ClassName::instanceMethod" (arbitrary object of a type) with "instance::method" (particular object) — the two look similar but the first argument role differs.',
      'Trying to use a method reference when the lambda needs extra logic beyond a single direct call — a method reference cannot include additional statements.',
      'Assuming a method reference is a different runtime mechanism from a lambda — it is purely a shorter syntax for the same functional interface implementation.',
    ],
    keyPoints: [
      'Method references (::) are shorthand for lambdas that simply delegate to an existing method.',
      'Four kinds exist: static, instance-of-particular-object, instance-of-arbitrary-object, and constructor references.',
      'Use a method reference only when the lambda body would be nothing more than a single forwarding call.',
    ],
  },

  'optional-class': {
    title: 'Optional Class',
    intro: `<code>Optional&lt;T&gt;</code> is a container object introduced in Java 8 that may or may not hold a non-null value. Its purpose is to make the possible absence of a value explicit in a method's return type, encouraging callers to handle that case deliberately instead of risking an unexpected <code>NullPointerException</code>.`,
    sections: [
      {
        heading: 'Creating and Checking an Optional',
        body: `<code>Optional.of(value)</code> wraps a value that must not be null (it throws <code>NullPointerException</code> immediately if it is). <code>Optional.ofNullable(value)</code> accepts a possibly-null value and produces an empty Optional if it is null. <code>Optional.empty()</code> explicitly creates an empty Optional. You can inspect one with <code>isPresent()</code> (true if a value exists) or <code>isEmpty()</code> (true if it does not, added in Java 11).`,
      },
      {
        heading: 'Consuming a Value Safely',
        body: `Rather than calling <code>get()</code> directly (which throws if empty), idiomatic Optional usage prefers <code>map()</code> to transform a present value, and <code>orElse(default)</code> or <code>orElseGet(supplier)</code> to supply a fallback when the value is absent. <code>orElseGet</code> is preferred over <code>orElse</code> when computing the default is expensive, because the supplier only runs when actually needed.`,
        list: [
          '<code>optional.map(String::toUpperCase).orElse("NONE")</code> — transform if present, else fall back.',
          '<code>optional.ifPresent(v -> System.out.println(v))</code> — run an action only if a value exists.',
          '<code>optional.orElseThrow(() -> new NoSuchElementException())</code> — throw a custom exception if absent.',
        ],
      },
      {
        heading: 'Where Optional Should — and Should Not — Be Used',
        body: `Optional is intended as a return type for methods that may legitimately have no result, making that possibility visible in the API. It is explicitly discouraged as the type of class fields, method parameters, or collection elements, because Optional itself can still be null, it adds wrapping overhead, and it is not <code>Serializable</code> — a plain nullable field with clear documentation is preferred in those cases.`,
      },
    ],
    examples: [
      {
        caption: 'Using Optional to avoid explicit null checks',
        code: `import java.util.Optional;

public class OptionalDemo {

    static Optional<String> findUser(int id) {
        if (id == 1) {
            return Optional.of("Asha");
        }
        return Optional.empty();
    }

    public static void main(String[] args) {
        Optional<String> found = findUser(1);
        System.out.println(found.map(String::toUpperCase).orElse("UNKNOWN"));

        Optional<String> missing = findUser(99);
        System.out.println(missing.map(String::toUpperCase).orElse("UNKNOWN"));

        missing.ifPresentOrElse(
                name -> System.out.println("Found: " + name),
                () -> System.out.println("No user found")
        );
    }
}`,
        output: `ASHA
UNKNOWN
No user found`,
      },
    ],
    commonMistakes: [
      'Calling optional.get() directly without checking isPresent() first — this throws NoSuchElementException on an empty Optional, defeating its purpose.',
      'Using Optional as the type of a class field or method parameter — it is designed for return types, not general-purpose null substitution.',
      'Using orElse(expensiveComputation()) instead of orElseGet(() -> expensiveComputation()) — orElse always evaluates its argument, even when the value is present.',
      'Wrapping a value with Optional.of() when it might be null — this throws NullPointerException immediately; Optional.ofNullable() should be used instead.',
    ],
    keyPoints: [
      'Optional<T> makes the possible absence of a value explicit in a return type, reducing accidental NullPointerExceptions.',
      'Optional.of requires a non-null value; Optional.ofNullable accepts null and becomes empty; Optional.empty() is explicitly empty.',
      'Prefer map/orElse/orElseGet/ifPresent over calling get() directly.',
      'Optional is meant for return types only — not for fields, parameters, or collection elements.',
    ],
  },

  'date-and-time-api': {
    title: 'Date and Time API',
    intro: `Java 8 introduced the <code>java.time</code> package to replace the old, error-prone <code>java.util.Date</code> and <code>java.util.Calendar</code> classes. The new API is modeled closely on the well-regarded Joda-Time library and fixes long-standing problems: the old classes were mutable, not thread-safe, used confusing zero-based months, and mixed date, time, and timezone concerns into a small number of overloaded classes.`,
    sections: [
      {
        heading: 'Core Classes',
        body: `<code>java.time</code> splits date and time concerns into focused, purpose-built classes:`,
        list: [
          '<code>LocalDate</code> — a date without time or timezone, such as 2026-09-21.',
          '<code>LocalTime</code> — a time without date or timezone, such as 14:30:00.',
          '<code>LocalDateTime</code> — a combined date and time, still without timezone.',
          '<code>Period</code> — a date-based amount of time (years, months, days), used for differences between LocalDate values.',
          '<code>Duration</code> — a time-based amount (hours, minutes, seconds, nanoseconds), used for differences between time-based values.',
          '<code>DateTimeFormatter</code> — formats and parses date/time objects using a pattern, replacing the old and not-thread-safe SimpleDateFormat.',
        ],
      },
      {
        heading: 'Immutability',
        body: `Every class in <code>java.time</code> is immutable: methods like <code>plusDays()</code> or <code>minusMonths()</code> return a brand-new object with the adjusted value rather than modifying the original in place. This makes the classes inherently thread-safe and eliminates a whole category of bugs where a shared Date object was silently mutated by one part of a program and unexpectedly affected another.`,
      },
    ],
    examples: [
      {
        caption: 'LocalDate, Period, and DateTimeFormatter working together',
        code: `import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;

public class DateTimeDemo {
    public static void main(String[] args) {
        LocalDate today = LocalDate.of(2026, 9, 21);
        LocalDate nextMonth = today.plusMonths(1); // returns a new LocalDate, today is unchanged

        System.out.println("Today: " + today);
        System.out.println("Next month: " + nextMonth);

        LocalDate birthday = LocalDate.of(2000, 5, 15);
        Period age = Period.between(birthday, today);
        System.out.println("Age: " + age.getYears() + " years, " + age.getMonths() + " months");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
        System.out.println(today.format(formatter));
    }
}`,
        output: `Today: 2026-09-21
Next month: 2026-10-21
Age: 26 years, 4 months
21-Sep-2026`,
      },
    ],
    commonMistakes: [
      'Calling today.plusMonths(1) and expecting "today" itself to change — java.time objects are immutable, so the result must be captured in a new variable.',
      'Mixing up Period (date-based: years/months/days) with Duration (time-based: hours/minutes/seconds) when measuring an interval.',
      'Continuing to use java.util.Date or Calendar in new code out of habit — java.time should be preferred for all new development.',
      'Forgetting that LocalDate and LocalTime carry no timezone information — ZonedDateTime is needed when timezone matters.',
    ],
    keyPoints: [
      'java.time (LocalDate, LocalTime, LocalDateTime, Period, Duration, DateTimeFormatter) replaces the legacy Date and Calendar classes.',
      'All java.time classes are immutable — operations return new instances instead of mutating the original.',
      'Period measures date-based differences (years/months/days); Duration measures time-based differences (hours/minutes/seconds).',
    ],
  },

  'file-handling-file-filereader-filewriter-bufferedreader': {
    title: 'File Handling: File, FileReader, FileWriter, BufferedReader',
    intro: `Java's I/O classes let a program interact with the file system: checking whether files exist, creating or deleting them, and reading or writing their content. The classes are layered — some represent the file itself as metadata, while others actually stream bytes or characters into and out of that file.`,
    sections: [
      {
        heading: 'The File Class — Metadata, Not Content',
        body: `<code>java.io.File</code> represents a path on the file system and lets you query or manipulate it without reading its contents: <code>exists()</code> checks if the path is present, <code>mkdir()</code>/<code>mkdirs()</code> create a directory (or the full directory chain), <code>createNewFile()</code> creates an empty file, and <code>delete()</code> removes a file or empty directory. A File object can represent a path that does not exist yet — creating the object does not touch the disk.`,
      },
      {
        heading: 'FileReader and FileWriter — Character Streams',
        body: `<code>FileReader</code> and <code>FileWriter</code> are character streams: they read and write text one character (or char buffer) at a time, handling the platform's default character encoding. They are low-level and inefficient for line-based work on their own — every call to <code>read()</code> can involve a system call — which is why they are almost always wrapped by a buffering class.`,
      },
      {
        heading: 'BufferedReader — Efficient Line Reading',
        body: `Wrapping a <code>FileReader</code> in a <code>BufferedReader</code> adds an internal buffer, dramatically reducing the number of actual disk reads, and adds the convenient <code>readLine()</code> method, which returns one line of text at a time and returns <code>null</code> when the end of the file is reached — the standard pattern for reading a text file line by line.`,
      },
      {
        heading: 'try-with-resources for Automatic Closing',
        body: `Every stream class in <code>java.io</code> implements <code>Closeable</code>, and forgetting to close a stream leaks file handles. The try-with-resources statement, <code>try (Resource r = ...) { ... }</code>, automatically calls <code>close()</code> on each declared resource when the block exits, whether normally or via an exception, which is far safer than a manual <code>finally</code> block.`,
      },
    ],
    examples: [
      {
        caption: 'Writing with FileWriter and reading it back line by line with BufferedReader',
        code: `import java.io.File;
import java.io.FileWriter;
import java.io.FileReader;
import java.io.BufferedReader;
import java.io.IOException;

public class FileHandlingDemo {
    public static void main(String[] args) throws IOException {
        File file = new File("notes.txt");
        System.out.println("Exists before write: " + file.exists());

        try (FileWriter writer = new FileWriter(file)) {
            writer.write("Line one\\n");
            writer.write("Line two\\n");
        }

        System.out.println("Exists after write: " + file.exists());

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("Read: " + line);
            }
        }

        file.delete();
        System.out.println("Exists after delete: " + file.exists());
    }
}`,
        output: `Exists before write: false
Exists after write: true
Read: Line one
Read: Line two
Exists after delete: false`,
      },
    ],
    commonMistakes: [
      'Reading a file with plain FileReader.read() character-by-character in a loop instead of wrapping it in a BufferedReader — this works but performs far more I/O calls than necessary.',
      'Forgetting to close a FileWriter/FileReader in a finally block or try-with-resources, which can leave file handles open or leave written data unflushed to disk.',
      'Assuming new File("path") creates the file on disk — constructing a File object is purely in-memory; you must explicitly call createNewFile() or write to it.',
      'Checking readLine() for an empty string ("") instead of null to detect end-of-file — an empty string represents a genuinely blank line, not the end of the stream.',
    ],
    keyPoints: [
      'File represents a path and its metadata (exists, mkdir, delete); it does not read or write content.',
      'FileReader/FileWriter are character streams for text; they are inefficient without buffering.',
      'BufferedReader adds an internal buffer and the readLine() method, the standard way to read text line by line.',
      'try-with-resources automatically closes streams, even when an exception occurs.',
    ],
  },

  serialization: {
    title: 'Serialization',
    intro: `Serialization is the process of converting an object's state into a byte stream so it can be saved to a file, sent over a network, or stored elsewhere, and later reconstructed through deserialization. Java supports this natively through the <code>Serializable</code> marker interface and the <code>ObjectOutputStream</code>/<code>ObjectInputStream</code> classes.`,
    sections: [
      {
        heading: 'The Serializable Marker Interface',
        body: `<code>java.io.Serializable</code> declares no methods at all — it is a "marker interface" that simply tells the JVM this class is allowed to be serialized. If an object's class (or any superclass, for non-static fields) does not implement Serializable, attempting to serialize it throws a <code>NotSerializableException</code> at runtime. Every field referenced by the object must itself be serializable (or null), including nested objects.`,
      },
      {
        heading: 'Excluding Fields with transient',
        body: `The <code>transient</code> keyword marks a field that should be skipped during serialization — useful for sensitive data (like passwords), derived/cacheable values that can be recomputed, or fields holding non-serializable resources (like open sockets or threads). Transient fields are written out as their type's default value (0, false, or null) when the object is deserialized.`,
      },
      {
        heading: 'serialVersionUID and Version Control',
        body: `<code>serialVersionUID</code> is a static final long field used to verify that a serialized object's class version matches the version used to deserialize it. If you don't declare one explicitly, the JVM generates one automatically based on the class's structure — but that generated value changes if the class is modified later, which can break deserialization of previously saved data. Declaring it explicitly (<code>private static final long serialVersionUID = 1L;</code>) gives you control over compatibility across class changes.`,
      },
      {
        heading: 'ObjectOutputStream and ObjectInputStream',
        body: `<code>ObjectOutputStream.writeObject(obj)</code> serializes an object to an underlying stream (typically a FileOutputStream), and <code>ObjectInputStream.readObject()</code> reads it back, returning an Object that must be cast to the original type. Both should be used with try-with-resources so the underlying stream is always closed properly.`,
      },
    ],
    examples: [
      {
        caption: 'Serializing and deserializing an object with a transient field',
        code: `import java.io.*;

class Employee implements Serializable {
    private static final long serialVersionUID = 1L;

    String name;
    transient String password; // excluded from serialization

    Employee(String name, String password) {
        this.name = name;
        this.password = password;
    }
}

public class SerializationDemo {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        Employee emp = new Employee("Asha", "secret123");

        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("emp.ser"))) {
            out.writeObject(emp);
        }

        try (ObjectInputStream in = new ObjectInputStream(new FileInputStream("emp.ser"))) {
            Employee restored = (Employee) in.readObject();
            System.out.println("Name: " + restored.name);
            System.out.println("Password: " + restored.password);
        }
    }
}`,
        output: `Name: Asha
Password: null`,
      },
    ],
    commonMistakes: [
      'Forgetting to implement Serializable on a class (or a referenced field\'s class) before serializing it, causing a NotSerializableException at runtime.',
      'Expecting a transient field to retain its original value after deserialization — it is always reset to its type\'s default value (null, 0, or false).',
      'Not declaring an explicit serialVersionUID, then later modifying the class and finding old serialized files can no longer be deserialized due to a UID mismatch.',
      'Forgetting to close ObjectOutputStream/ObjectInputStream (or not using try-with-resources), which can leave data unflushed or file handles open.',
    ],
    keyPoints: [
      'Serializable is a marker interface with no methods; it simply permits a class to be serialized.',
      'transient fields are skipped during serialization and reset to default values on deserialization.',
      'serialVersionUID should be declared explicitly to control compatibility across class versions.',
      'ObjectOutputStream.writeObject() and ObjectInputStream.readObject() perform the actual serialization and deserialization.',
    ],
  },
}
