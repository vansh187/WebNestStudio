// Java Gaps A module — hand-written lesson content filling curriculum gaps.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content14GapsA = {
  'setting-up-the-java-development-environment': {
    title: 'Setting Up the Java Development Environment',
    intro: `Before writing a single line of Java, you need a working development environment: a JDK to compile and run code, and a place to write that code, whether that is a full IDE or a plain text editor paired with a terminal. Getting this right the first time avoids a long list of confusing errors later — "javac is not recognized," "java: command not found," or programs that mysteriously run an old cached version.

This setup only needs to be done once per machine (or once per JDK upgrade), and understanding what each step actually does will make you far more comfortable troubleshooting environment issues on a new laptop, a CI server, or a teammate's machine.`,
    sections: [
      {
        heading: 'Downloading and Installing a JDK',
        body: `You need a JDK (Java Development Kit), not just a JRE, because the JRE has no compiler. Two common, free sources are the Eclipse Adoptium project (formerly AdoptOpenJDK, distributing the OpenJDK builds known as Temurin) and Oracle's own JDK builds, which are also free to use under Oracle's current no-fee license for recent versions. Either works for learning; Adoptium is a popular default because its license terms are simple and unambiguous for all use cases.`,
        list: [
          'Go to the distributor\'s download page (e.g. adoptium.net) and pick a Long-Term Support (LTS) version such as JDK 17 or JDK 21 unless you have a specific reason to use a newer feature release.',
          'Choose the installer that matches your operating system and CPU architecture (Windows x64, macOS ARM/Apple Silicon, Linux x64, etc.).',
          'Run the installer. On Windows and macOS, the installer can usually configure environment variables for you if you check the relevant option; on Linux, extracting a tarball into a directory like /opt/java is common.',
        ],
      },
      {
        heading: 'Setting JAVA_HOME and PATH',
        body: `JAVA_HOME is an environment variable that many build tools (Maven, Gradle) and IDEs look up to find your JDK installation; it should point to the JDK's root folder (the one containing a "bin" subfolder), not to the "bin" folder itself. PATH is a separate environment variable that tells the operating system's shell where to look for executable programs — adding the JDK's "bin" directory to PATH is what lets you type "java" or "javac" directly in any terminal window without typing the full path. On Windows this is done through System Properties → Environment Variables; on macOS/Linux it is typically set by exporting the variables in a shell profile file such as ~/.zshrc, ~/.bashrc, or ~/.bash_profile.`,
      },
      {
        heading: 'Verifying the Installation',
        body: `After installing and configuring the environment variables, open a fresh terminal window (existing ones will not see the new PATH) and run two commands to confirm both halves of the toolchain are visible: <code>java -version</code> checks the runtime launcher, and <code>javac -version</code> checks the compiler. Both should report the same version number; if only one works, or if they report different versions, PATH is likely pointing at more than one Java installation.`,
      },
      {
        heading: 'Choosing an IDE vs a Plain Text Editor',
        body: `An IDE (Integrated Development Environment) such as IntelliJ IDEA or Eclipse bundles a code editor, a build system, a debugger, and project management into one application — it can detect a missing import, auto-complete method names, and let you set breakpoints and step through code visually. VS Code is a lighter-weight editor that becomes IDE-like for Java once you add Microsoft's "Extension Pack for Java." Alternatively, many learners start with a plain text editor and a terminal: you write the .java file yourself, then manually run javac and java. This "manual" workflow is slower for large projects but extremely valuable early on, because it forces you to understand the compile-then-run cycle instead of relying on a green "Run" button.`,
        list: [
          '<strong>IntelliJ IDEA</strong> — widely used in industry, strong refactoring tools, excellent build-tool integration (Maven/Gradle).',
          '<strong>Eclipse</strong> — free, mature, long history in enterprise Java development.',
          '<strong>VS Code + Java extensions</strong> — lightweight, fast startup, good for smaller projects or polyglot workflows.',
          '<strong>Plain text editor + terminal</strong> — no hidden magic; ideal for understanding exactly what javac and java do.',
        ],
      },
      {
        heading: 'The Compile-Then-Run Cycle',
        body: `Whichever tool you use, the same two-step cycle happens underneath: <code>javac</code> reads your .java source file, checks it for syntax and type errors, and — if it compiles cleanly — produces one or more .class files containing bytecode in the same directory. Then <code>java</code> (given the class name, not the file name, and without the .class extension) loads that bytecode and starts execution from its main method. An IDE's "Run" button is simply automating these two steps for you.`,
      },
    ],
    examples: [
      {
        caption: 'Verifying the JDK installation and running the manual compile-then-run cycle',
        code: `// Terminal commands (not Java code) to verify setup:
// java -version
// javac -version

// File: EnvironmentCheck.java
public class EnvironmentCheck {
    public static void main(String[] args) {
        System.out.println("Java version property: " + System.getProperty("java.version"));
        System.out.println("Environment is ready.");
    }
}

// Terminal:
// javac EnvironmentCheck.java   -> produces EnvironmentCheck.class
// java EnvironmentCheck         -> runs the compiled bytecode`,
        output: `Java version property: 21.0.1
Environment is ready.`,
      },
    ],
    commonMistakes: [
      'Installing only a JRE (or relying on one bundled with another application) and then being confused that javac is missing — compiling requires a full JDK.',
      'Setting JAVA_HOME to the "bin" folder instead of the JDK root folder, which breaks tools that expect to find "bin", "lib", and other subfolders under JAVA_HOME.',
      'Editing PATH but continuing to test in an already-open terminal window — environment variable changes only apply to newly opened shell sessions.',
      'Running "java MyProgram.java" with the .java extension or "java MyProgram.class" with the .class extension — the java launcher expects a bare class name.',
    ],
    keyPoints: [
      'A JDK (not just a JRE) is required for development because it includes the compiler, javac.',
      'JAVA_HOME should point to the JDK root folder; PATH must include its "bin" subfolder so java/javac are found by name.',
      '`java -version` and `javac -version` are the standard sanity checks after installation.',
      'The core workflow is always compile-then-run: javac produces .class bytecode, and java executes it — an IDE just automates this cycle.',
    ],
  },

  'java-recursion': {
    title: 'Java Recursion',
    intro: `Recursion is a technique where a method solves a problem by calling itself with a smaller or simpler version of the same problem, until it reaches a case simple enough to answer directly. It is an alternative to iteration (loops) for expressing repetitive computation, and it is especially natural for problems that are already defined in terms of themselves, such as factorials, tree traversals, and many divide-and-conquer algorithms.

Every correct recursive method needs two distinct parts: a base case that stops the recursion, and a recursive case that makes progress toward that base case. Get either one wrong, and the method either never recurses (wrong answer) or never stops (a StackOverflowError).`,
    sections: [
      {
        heading: 'Base Case vs Recursive Case',
        body: `The <strong>base case</strong> is the condition under which the method returns a value directly, without calling itself again — it is what eventually stops the recursion. The <strong>recursive case</strong> is where the method calls itself, but always with an argument that is "closer" to the base case than the current call (a smaller number, a shorter list, a node one level deeper). If the recursive case doesn't reliably shrink the problem, or the base case condition is never actually reached, the recursion never terminates.`,
      },
      {
        heading: 'The Call Stack: Building Up and Unwinding',
        body: `Each time a method calls itself, the JVM pushes a new stack frame onto the call stack, holding that call's local variables and its return address. Calls keep building up (going "deeper") until the base case is hit, at which point that innermost frame returns a value. Then the frames unwind one at a time, back down the stack, with each waiting call resuming exactly where it paused, using the value just returned to complete its own calculation, and returning its own result to the frame below it. This build-up-then-unwind pattern is why tracing recursion visually as a stack of pending calls is so useful.`,
        list: [
          'factorial(4) calls factorial(3), which calls factorial(2), which calls factorial(1), which calls factorial(0) — the base case.',
          'factorial(0) returns 1 immediately, without recursing further.',
          'factorial(1) resumes, computes 1 * 1 = 1, and returns 1.',
          'factorial(2) resumes, computes 2 * 1 = 2; factorial(3) computes 3 * 2 = 6; factorial(4) computes 4 * 6 = 24.',
        ],
      },
      {
        heading: 'Recursion vs Iteration',
        body: `Anything expressible recursively can also be expressed iteratively with a loop, and vice versa. Recursion often produces shorter, more readable code for naturally self-referential problems (tree/graph traversal, backtracking, divide-and-conquer algorithms like merge sort), because the code mirrors the problem's own definition. Iteration is usually more memory-efficient, since it doesn't grow the call stack, and can be faster because it avoids the overhead of repeated method calls. As a rule of thumb, prefer iteration for simple linear repetition, and reach for recursion when the problem structure is naturally hierarchical or self-similar.`,
      },
      {
        heading: 'StackOverflowError',
        body: `Each recursive call consumes stack memory, and the JVM's call stack has a fixed, finite size. If a recursive method is missing its base case, has a base case that is never reached due to a logic error, or simply recurses too deeply for a very large input, the stack fills up and the JVM throws a <code>StackOverflowError</code>. This is an <code>Error</code>, not an <code>Exception</code>, signaling a serious problem with the program's structure rather than an expected, recoverable condition — though it can technically still be caught with a try-catch block.`,
      },
    ],
    examples: [
      {
        caption: 'Tracing factorial and Fibonacci recursion to a correct result',
        code: `public class RecursionDemo {

    static int factorial(int n) {
        if (n == 0) {          // base case
            return 1;
        }
        return n * factorial(n - 1); // recursive case
    }

    static int fibonacci(int n) {
        if (n <= 1) {           // base case
            return n;
        }
        return fibonacci(n - 1) + fibonacci(n - 2); // recursive case
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
        System.out.println(fibonacci(7));
    }
}`,
        output: `120
13`,
      },
      {
        caption: 'A missing base case leads to a StackOverflowError',
        code: `public class RecursionErrorDemo {

    // Bug: no condition ever stops the recursion
    static int badRecursion(int n) {
        return badRecursion(n + 1);
    }

    public static void main(String[] args) {
        try {
            badRecursion(0);
        } catch (StackOverflowError e) {
            System.out.println("Caught: StackOverflowError due to a missing base case");
        }
    }
}`,
        output: 'Caught: StackOverflowError due to a missing base case',
      },
    ],
    commonMistakes: [
      'Writing a recursive case without a matching base case, or with a base case that the recursive calls never actually reach.',
      'Forgetting to make forward progress — calling the method again with the exact same argument instead of a smaller one, causing infinite recursion.',
      'Using naive recursion (like the fibonacci example above) for large inputs without memoization, resulting in exponential time complexity from repeated recalculation of the same subproblems.',
      'Assuming recursion is always "cleaner" — for simple counting or summing loops, a plain for-loop is usually clearer and cheaper than a recursive equivalent.',
    ],
    keyPoints: [
      'Every recursive method needs a base case (stops recursion) and a recursive case (makes progress toward the base case).',
      'Each call adds a frame to the call stack; frames unwind in reverse order once the base case is reached, combining results on the way back down.',
      'Recursion trades stack memory and call overhead for code that can mirror a naturally self-referential problem more directly than a loop.',
      'A missing or unreachable base case causes unbounded recursion and eventually a StackOverflowError.',
    ],
  },

  'nested-and-inner-classes': {
    title: 'Nested and Inner Classes',
    intro: `Java allows a class to be defined inside another class. Doing this groups classes that are logically related and used in only one place, tightens encapsulation by hiding a helper class from the rest of the package, and, for certain kinds of nested classes, gives the inner class direct access to the enclosing object's fields and methods.

Java distinguishes several flavors of nested types — static nested classes, (non-static) inner classes, local classes, and anonymous classes — and each has a different relationship to the instance of the class that contains it.`,
    sections: [
      {
        heading: 'Static Nested Classes vs Inner Classes',
        body: `A <strong>static nested class</strong> is declared with the <code>static</code> keyword inside another class. It behaves like any top-level class that just happens to be namespaced inside another — it does not hold a reference to any particular instance of the outer class, and it cannot access the outer class's instance fields or methods directly. A <strong>(non-static) inner class</strong> has no <code>static</code> keyword, and every instance of it is implicitly tied to one specific instance of the outer class. This means an inner class instance always carries a hidden reference to its enclosing object, so it can freely read and modify the outer object's instance fields — but it also means you cannot create an inner class instance without first having (or creating) an outer class instance, using the syntax <code>outerInstance.new InnerClass()</code>.`,
        list: [
          '<strong>Static nested class</strong>: created as <code>new Outer.Nested()</code>; no implicit link to an outer instance.',
          '<strong>Inner class</strong>: created as <code>outer.new Inner()</code>; each instance is bound to one outer instance and can access its fields directly.',
        ],
      },
      {
        heading: 'Local Classes',
        body: `A <strong>local class</strong> is defined entirely inside a method body (or another block, like a for-loop or if-statement), and it is only visible within that block. Local classes are useful when a helper class is needed for a single, self-contained piece of logic and doesn't deserve to exist outside that method. Like inner classes, a local class defined inside an instance method can access the enclosing instance's fields, and it can also access effectively final local variables from the enclosing method (variables that are never reassigned after initialization).`,
      },
      {
        heading: 'Anonymous Classes',
        body: `An <strong>anonymous class</strong> is a local class without a name, declared and instantiated in a single expression, typically to provide a one-off implementation of an interface or an extension of a class. Before Java 8 introduced lambda expressions, anonymous classes were the standard way to implement callback-style interfaces like <code>Runnable</code> or <code>Comparator</code> inline. They are still useful today when the interface has more than one abstract method (so a lambda cannot represent it), or when the implementation needs its own additional fields or initialization logic.`,
      },
      {
        heading: 'When Each Is Appropriate',
        body: `Choose a static nested class when the nested type is a logical helper that doesn't need access to an outer instance (for example, a Builder class, or a small data-holder type used only by the outer class). Choose an inner class when instances of the nested type are conceptually always tied to one specific outer instance (for example, an Iterator implementation tied to one particular collection instance). Choose a local or anonymous class for small, throwaway implementations needed in exactly one place — though in modern Java, a lambda expression is usually preferred over an anonymous class whenever the target is a single-abstract-method (functional) interface.`,
      },
    ],
    examples: [
      {
        caption: 'A static nested class versus a non-static inner class',
        code: `public class Outer {
    private int outerField = 10;

    static class StaticNested {
        void display() {
            System.out.println("Static nested class has no link to any Outer instance");
        }
    }

    class Inner {
        void display() {
            System.out.println("Inner class reads outerField = " + outerField);
        }
    }

    public static void main(String[] args) {
        Outer.StaticNested nested = new Outer.StaticNested();
        nested.display();

        Outer outer = new Outer();
        Outer.Inner inner = outer.new Inner();
        inner.display();
    }
}`,
        output: `Static nested class has no link to any Outer instance
Inner class reads outerField = 10`,
      },
      {
        caption: 'Anonymous classes implementing Comparator and Runnable',
        code: `import java.util.*;

public class AnonymousClassDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(Arrays.asList("Banana", "apple", "Cherry"));

        Collections.sort(names, new Comparator<String>() {
            @Override
            public int compare(String a, String b) {
                return a.compareToIgnoreCase(b);
            }
        });
        System.out.println(names);

        Runnable task = new Runnable() {
            @Override
            public void run() {
                System.out.println("Running from an anonymous Runnable");
            }
        };
        task.run();
    }
}`,
        output: `[apple, Banana, Cherry]
Running from an anonymous Runnable`,
      },
    ],
    commonMistakes: [
      'Trying to create an inner class instance with plain "new Inner()" from a static context — a non-static inner class requires an existing outer instance: "outer.new Inner()".',
      'Giving a static nested class access to instance fields of the outer class and being surprised by a compile error — static nested classes have no implicit outer instance to read from.',
      'Capturing a local variable in a local or anonymous class after reassigning it — such variables must be effectively final (never reassigned) to be captured.',
      'Reaching for an anonymous class out of habit when a lambda expression would be shorter and clearer for a single-abstract-method interface like Runnable or Comparator.',
    ],
    keyPoints: [
      'Static nested classes behave like independent top-level classes with no link to an outer instance; inner classes are bound to one specific outer instance and can access its fields directly.',
      'Local classes live inside a method body and can access effectively final local variables plus the enclosing instance\'s members.',
      'Anonymous classes are unnamed, one-off local classes, historically used for inline interface implementations before lambdas existed.',
      'Prefer lambdas over anonymous classes for functional interfaces; reserve anonymous/local classes for multi-method interfaces or cases needing extra state.',
    ],
  },

  'java-i-o-streams-fundamentals': {
    title: 'Java I/O Streams Fundamentals',
    intro: `Java's I/O (input/output) system is built around the idea of a "stream" — a sequential flow of data moving from a source (a file, the network, memory, the keyboard) to a destination, one piece at a time. The <code>java.io</code> package organizes these streams into two parallel class hierarchies: one for raw bytes and one for characters, and understanding why both exist — and when to use each — is fundamental to reading and writing data correctly in Java.`,
    sections: [
      {
        heading: 'Byte Streams: InputStream and OutputStream',
        body: `<code>InputStream</code> and <code>OutputStream</code> are the abstract root classes for reading and writing raw 8-bit bytes. They are used for any data that isn't inherently text: images, audio, compiled class files, serialized objects, or network protocols. Common concrete subclasses include <code>FileInputStream</code>/<code>FileOutputStream</code> (files), <code>ByteArrayInputStream</code>/<code>ByteArrayOutputStream</code> (in-memory byte arrays), and <code>BufferedInputStream</code>/<code>BufferedOutputStream</code>, which wrap another stream to reduce the number of expensive underlying I/O calls by reading and writing in larger chunks.`,
      },
      {
        heading: 'Character Streams: Reader and Writer',
        body: `<code>Reader</code> and <code>Writer</code> are the abstract root classes for reading and writing 16-bit Unicode characters rather than raw bytes. Character streams exist because text is not just bytes — it is bytes interpreted according to a specific character encoding (UTF-8, UTF-16, ISO-8859-1, and so on), and if you read text data through a raw byte stream without applying the correct encoding, multi-byte characters (accented letters, non-Latin scripts, emoji) can be corrupted. Reader/Writer subclasses such as <code>FileReader</code>/<code>FileWriter</code> and <code>InputStreamReader</code>/<code>OutputStreamWriter</code> handle that byte-to-character (and character-to-byte) conversion internally, using either a specified charset or the platform default. <code>BufferedReader</code>/<code>BufferedWriter</code> add buffering on top, and <code>BufferedReader</code> additionally provides the convenient <code>readLine()</code> method.`,
      },
      {
        heading: 'Try-With-Resources for Automatic Closing',
        body: `Every stream, reader, and writer implements <code>Closeable</code>, and holds onto an underlying operating system resource (a file handle, a socket) that must be released when you are done, or it will leak. Prior to Java 7, this required a verbose try/finally block to guarantee closing even if an exception occurred mid-operation. The try-with-resources statement, <code>try (Resource r = ...) { ... }</code>, automatically calls <code>close()</code> on every resource declared in its parentheses when the block exits — whether normally or via an exception — making resource leaks far less likely and the code noticeably shorter.`,
      },
    ],
    examples: [
      {
        caption: 'Writing and reading raw bytes with a byte stream',
        code: `import java.io.*;

public class ByteStreamDemo {
    public static void main(String[] args) throws IOException {
        try (OutputStream out = new FileOutputStream("data.bin")) {
            out.write("Hello".getBytes());
        }

        try (InputStream in = new FileInputStream("data.bin")) {
            byte[] buffer = new byte[5];
            int bytesRead = in.read(buffer);
            System.out.println("Bytes read: " + bytesRead);
            System.out.println("Content: " + new String(buffer, 0, bytesRead));
        }
    }
}`,
        output: `Bytes read: 5
Content: Hello`,
      },
      {
        caption: 'Writing and reading text with a character stream',
        code: `import java.io.*;

public class CharacterStreamDemo {
    public static void main(String[] args) throws IOException {
        try (Writer writer = new FileWriter("notes.txt")) {
            writer.write("Character streams handle text encoding correctly.");
        }

        try (BufferedReader reader = new BufferedReader(new FileReader("notes.txt"))) {
            String line = reader.readLine();
            System.out.println(line);
        }
    }
}`,
        output: 'Character streams handle text encoding correctly.',
      },
    ],
    commonMistakes: [
      'Using a byte stream (FileInputStream/FileOutputStream) to read or write plain text files instead of a character stream, risking corrupted output for non-ASCII characters.',
      'Forgetting to close streams explicitly in older-style code, or relying on garbage collection to close them eventually — always use try-with-resources instead.',
      'Wrapping a stream in a buffered variant but never actually benefiting from it, because a non-buffered stream is read/written one byte or character at a time in a loop.',
      'Assuming FileReader always uses UTF-8 — it actually uses the JVM\'s platform default charset unless you use InputStreamReader with an explicit Charset argument.',
    ],
    keyPoints: [
      'Byte streams (InputStream/OutputStream) handle raw binary data; character streams (Reader/Writer) handle text and manage character encoding.',
      'Character streams exist specifically to avoid corrupting multi-byte text when converting between bytes and characters.',
      'Buffered variants (BufferedInputStream, BufferedReader, etc.) wrap another stream to reduce costly underlying I/O calls.',
      'Try-with-resources should be the default way to open any Closeable stream, guaranteeing it is closed even when an exception occurs.',
    ],
  },

  'scanner-and-reading-user-input': {
    title: 'Scanner and Reading User Input',
    intro: `Reading input typed by a user while a program is running is one of the most common tasks in introductory Java programs, and the <code>Scanner</code> class (in <code>java.util</code>) is the standard, beginner-friendly tool for it. Scanner can read from <code>System.in</code> (the keyboard), from a file, or from a String, and it provides convenient typed methods like <code>nextInt()</code>, <code>nextDouble()</code>, and <code>nextLine()</code> that parse tokens directly into the requested type.

Scanner is easy to use but has one very well-known pitfall around mixing token-based reads with line-based reads, and for performance-sensitive or purely line-based input, <code>BufferedReader</code> is often a better fit.`,
    sections: [
      {
        heading: 'Reading Different Types with Scanner',
        body: `A <code>Scanner</code> wrapping <code>System.in</code> is created once with <code>new Scanner(System.in)</code> and then reused for the whole program. Methods like <code>nextInt()</code>, <code>nextLong()</code>, <code>nextDouble()</code>, and <code>next()</code> (a single whitespace-delimited token) read and parse exactly one token, leaving the cursor positioned right after that token — including the newline character the user typed to submit it, which is not consumed. <code>nextLine()</code>, by contrast, reads everything up to and including the next newline character, returning it as a String.`,
      },
      {
        heading: 'The Leftover Newline Bug',
        body: `The most common Scanner mistake happens when a numeric read like <code>nextInt()</code> is immediately followed by <code>nextLine()</code>. Because <code>nextInt()</code> only consumes the digits of the number and stops — it does not consume the newline character left in the input buffer after the user pressed Enter — the very next <code>nextLine()</code> call immediately reads that leftover empty newline instead of waiting for new input, silently skipping the line you intended the user to type. The fix is to insert an extra, throwaway <code>scanner.nextLine()</code> call right after the numeric read, specifically to consume that leftover newline before reading the next real line.`,
      },
      {
        heading: 'BufferedReader as a Faster, Line-Based Alternative',
        body: `<code>BufferedReader</code> wrapping an <code>InputStreamReader</code> over <code>System.in</code> reads input purely as text lines via <code>readLine()</code>, with no automatic type parsing — you convert Strings to numbers yourself with methods like <code>Integer.parseInt()</code>. Because it reads in larger buffered chunks rather than token-by-token, BufferedReader is noticeably faster for programs that read a large volume of input (a common concern in competitive programming), and since it only ever deals in whole lines, it sidesteps the leftover-newline confusion entirely. The trade-off is slightly more code, since you lose Scanner's built-in numeric parsing convenience, and BufferedReader's <code>readLine()</code> throws a checked <code>IOException</code> that Scanner's methods do not.`,
      },
      {
        heading: 'Closing Scanner and System.in',
        body: `<code>Scanner</code> implements <code>Closeable</code>, and calling <code>scanner.close()</code> when a program is finished with input is good practice. However, closing a Scanner that wraps <code>System.in</code> also closes the underlying <code>System.in</code> stream itself — if any other code later tries to read from <code>System.in</code> again (including creating a second Scanner over it) in the same program run, that read will fail. For this reason, most programs create exactly one Scanner over System.in for their entire lifetime and close it once, right before exiting, rather than opening and closing several Scanners over System.in in the same run.`,
      },
    ],
    examples: [
      {
        caption: 'The classic nextInt()/nextLine() leftover newline bug and its fix',
        code: `import java.util.Scanner;

public class ScannerBugDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter your age: ");
        int age = scanner.nextInt();
        scanner.nextLine(); // consumes the leftover newline left by nextInt()

        System.out.print("Enter your name: ");
        String name = scanner.nextLine();

        System.out.println("Name: " + name + ", Age: " + age);
        scanner.close();
    }
}

// Sample input typed by the user:
// 28
// Asha`,
        output: `Enter your age: Enter your name: Name: Asha, Age: 28`,
      },
      {
        caption: 'Reading a line of input with BufferedReader instead of Scanner',
        code: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

public class BufferedReaderDemo {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));

        System.out.print("Enter a city: ");
        String city = reader.readLine();

        System.out.println("You entered: " + city);
    }
}

// Sample input typed by the user:
// Mumbai`,
        output: `Enter a city: You entered: Mumbai`,
      },
    ],
    commonMistakes: [
      'Calling nextInt() (or nextDouble()) immediately followed by nextLine() without an extra nextLine() to consume the leftover newline, causing the following line-read to appear to be skipped.',
      'Creating and closing multiple Scanner objects over System.in in the same program — closing one closes the underlying System.in stream for the rest of the program.',
      'Forgetting that Scanner\'s next() reads only a single whitespace-delimited token, not a whole line — a multi-word name typed by the user gets truncated at the first space.',
      'Choosing Scanner for very large or performance-critical input processing where BufferedReader\'s lower overhead would matter.',
    ],
    keyPoints: [
      'Scanner provides typed reads (nextInt, nextDouble, next, nextLine) directly from System.in, a file, or a String.',
      'nextInt()/nextDouble()/next() leave the trailing newline in the buffer; a following nextLine() call reads that leftover newline unless it is consumed first.',
      'BufferedReader.readLine() reads whole lines faster and avoids the leftover-newline issue, at the cost of manual parsing and a checked IOException.',
      'Closing a Scanner built on System.in also closes System.in itself, so most programs use a single Scanner instance for the whole run.',
    ],
  },

  'callable-future-and-completablefuture': {
    title: 'Callable, Future, and CompletableFuture',
    intro: `The <code>java.util.concurrent</code> package gives Java richer tools than raw <code>Thread</code> and <code>Runnable</code> for running work asynchronously and getting a result back. <code>Callable</code> extends the idea of a background task to one that can return a value and throw checked exceptions, <code>Future</code> represents the eventual result of that task, and <code>CompletableFuture</code> builds on both to let you chain and combine asynchronous operations without blocking the calling thread at every step.`,
    sections: [
      {
        heading: 'Callable vs Runnable',
        body: `<code>Runnable</code>'s single method, <code>run()</code>, returns <code>void</code> and cannot throw any checked exception. <code>Callable&lt;V&gt;</code>'s single method, <code>call()</code>, returns a value of type <code>V</code> and is allowed to throw a checked <code>Exception</code>. This makes Callable the right choice whenever a background task needs to produce a result (a computed number, a fetched record) or may naturally fail with a checked exception (such as an I/O operation), which Runnable simply cannot express.`,
      },
      {
        heading: 'Submitting a Callable and Getting a Future',
        body: `An <code>ExecutorService</code> (obtained, for example, from <code>Executors.newSingleThreadExecutor()</code> or <code>Executors.newFixedThreadPool(n)</code>) manages a pool of worker threads and can run tasks on them. Calling <code>executor.submit(callable)</code> schedules the Callable to run on one of those threads and immediately returns a <code>Future&lt;V&gt;</code> — a handle representing a result that may not exist yet. The calling thread can continue doing other work while the task runs in the background.`,
      },
      {
        heading: 'Future.get() and Blocking',
        body: `Calling <code>future.get()</code> retrieves the task's result once it is available. If the task has already finished, <code>get()</code> returns immediately; if it is still running, <code>get()</code> blocks — the calling thread pauses — until the task completes (or an overloaded, timed version of <code>get(timeout, unit)</code> gives up after a timeout and throws a <code>TimeoutException</code> instead). If the Callable itself threw an exception, <code>get()</code> wraps it in an <code>ExecutionException</code> and rethrows that. Because plain Future only offers this blocking retrieval, and no built-in way to chain further work onto a Future's eventual result, composing multiple dependent async steps with raw Future quickly becomes awkward.`,
      },
      {
        heading: 'CompletableFuture: Composing Async Work Without Blocking',
        body: `<code>CompletableFuture&lt;T&gt;</code> implements <code>Future&lt;T&gt;</code> but adds a large API for describing what should happen next, without forcing the calling thread to block and wait first. <code>CompletableFuture.supplyAsync(supplier)</code> starts an asynchronous computation and returns immediately. <code>thenApply(function)</code> transforms the eventual result once it arrives. <code>thenCombine(otherFuture, function)</code> waits for two independent CompletableFutures and combines their results together. <code>exceptionally(function)</code> supplies a fallback value if the computation completed with an exception instead of a result, letting you recover gracefully rather than propagating the failure. These methods return new CompletableFutures, so calls can be chained fluently to describe an entire asynchronous pipeline before any blocking call is made.`,
      },
    ],
    examples: [
      {
        caption: 'Submitting a Callable to an ExecutorService and blocking on Future.get()',
        code: `import java.util.concurrent.*;

public class CallableFutureDemo {
    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        Callable<Integer> task = () -> {
            Thread.sleep(100);
            return 10 * 5;
        };

        Future<Integer> future = executor.submit(task);
        System.out.println("Task submitted, doing other work...");

        Integer result = future.get(); // blocks until the task finishes
        System.out.println("Result: " + result);

        executor.shutdown();
    }
}`,
        output: `Task submitted, doing other work...
Result: 50`,
      },
      {
        caption: 'Composing async operations with CompletableFuture: thenCombine and exceptionally',
        code: `import java.util.concurrent.CompletableFuture;

public class CompletableFutureDemo {
    public static void main(String[] args) throws Exception {
        CompletableFuture<Integer> priceFuture = CompletableFuture.supplyAsync(() -> 200);
        CompletableFuture<Integer> taxFuture = CompletableFuture.supplyAsync(() -> 20);

        CompletableFuture<Integer> totalFuture = priceFuture
                .thenCombine(taxFuture, (price, tax) -> price + tax)
                .thenApply(total -> total * 1);

        System.out.println("Total: " + totalFuture.get());

        CompletableFuture<Integer> safeFuture = CompletableFuture
                .supplyAsync(() -> 10 / 0)
                .exceptionally(ex -> -1);

        System.out.println("Safe result: " + safeFuture.get());
    }
}`,
        output: `Total: 220
Safe result: -1`,
      },
    ],
    commonMistakes: [
      'Using Runnable when a background task actually needs to return a value or throw a checked exception — Callable exists exactly for that case.',
      'Calling future.get() right after submit() with no other work in between, which defeats the purpose of running the task asynchronously since the calling thread just blocks immediately.',
      'Forgetting to call shutdown() (or shutdownNow()) on an ExecutorService, leaving its threads alive and preventing the JVM from exiting normally.',
      'Chaining CompletableFuture stages without ever calling exceptionally(), handle(), or whenComplete() — an unhandled exception inside the chain silently propagates until something finally calls get() and gets an ExecutionException.',
    ],
    keyPoints: [
      'Callable returns a value from call() and can throw checked exceptions; Runnable returns void and cannot.',
      'ExecutorService.submit(callable) runs the task asynchronously and immediately returns a Future representing its eventual result.',
      'Future.get() blocks the calling thread until the result is ready (or a timeout elapses with the overloaded version), and wraps task exceptions in an ExecutionException.',
      'CompletableFuture supports non-blocking composition of async steps via thenApply, thenCombine, and graceful failure handling via exceptionally.',
    ],
  },
}
