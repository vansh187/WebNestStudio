// Practice blocks for the Java Basics module (why it matters, diagram, exercise,
// quiz, interview questions). Merged onto the lesson entries in index.js by slug,
// so the lesson prose files stay unchanged.
export const practice01Basics = {
  'history-and-features-of-java': {
    whyItMatters: `Most of Java's rules that feel strict at first — no pointer arithmetic, checked exceptions, everything inside a class — come straight from its original goals of safety and portability. Knowing those goals turns the rules from things to memorise into things you can predict, and it is one of the first topics interviewers use to check whether you understand the platform rather than just the syntax.`,
    exercise: {
      prompt: `Prove "Write Once, Run Anywhere" to yourself. Complete the program so it prints the Java version and the operating system it is running on. The same compiled class prints different values on Windows, Linux and macOS without being recompiled.

The output depends on your machine, for example <code>Java 21.0.2 on Windows 11</code>.`,
      starterCode: `public class WhereAmI {
    public static void main(String[] args) {
        // TODO: read the "java.version" and "os.name" system properties
        // and print them as: Java <version> on <os>
    }
}`,
      hints: [
        '<code>System.getProperty("java.version")</code> returns the running Java version as a String.',
        'The operating system name is stored under the key <code>"os.name"</code>.',
      ],
      solution: `public class WhereAmI {
    public static void main(String[] args) {
        String version = System.getProperty("java.version");
        String os = System.getProperty("os.name");
        System.out.println("Java " + version + " on " + os);
    }
}`,
    },
    quiz: [
      {
        question: 'Who led the team that created Java, and at which company?',
        options: ['Bjarne Stroustrup at Bell Labs', 'James Gosling at Sun Microsystems', 'Guido van Rossum at Google', 'Dennis Ritchie at Oracle'],
        answer: 1,
        explanation: 'James Gosling and his team created Java at Sun Microsystems; it was released in 1995. Oracle acquired Sun in 2010.',
      },
      {
        question: 'What does the Java compiler (<code>javac</code>) produce from a <code>.java</code> file?',
        options: ['Native machine code for the current operating system', 'Bytecode in a .class file', 'An .exe file', 'A shell script'],
        answer: 1,
        explanation: 'javac produces platform-neutral bytecode in .class files. The JVM on each platform then executes that bytecode.',
      },
      {
        question: 'What makes "Write Once, Run Anywhere" possible?',
        options: ['Java programs are interpreted from source code', 'Every operating system uses the same machine code', 'Each platform has its own JVM that runs the same bytecode', 'Java avoids using the operating system'],
        answer: 2,
        explanation: 'The bytecode format is the same everywhere. Each platform provides its own JVM implementation that knows how to run it.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Is Java platform independent? Is the JVM platform independent?',
        answer: `Java bytecode is platform independent: the same .class file runs on any system with a compatible JVM. The JVM itself is platform dependent — there is a separate JVM build for each operating system and processor architecture, and that is exactly what hides the platform differences from your program.`,
      },
      {
        question: 'Why does Java not support multiple inheritance of classes?',
        answer: `To avoid ambiguity. If a class could extend two classes that both define the same method, the compiler would not know which implementation to inherit (the "diamond problem"). Java allows a class to extend only one class but implement many interfaces, which gives most of the flexibility without inheriting conflicting state.`,
      },
    ],
  },

  'setting-up-the-java-development-environment': {
    whyItMatters: `Most first-day Java problems are setup problems, not code problems: the wrong version on the PATH, a JRE without a compiler, or a file name that does not match its class. Being able to compile and run from a plain terminal means you can always tell whether a failure comes from your code or from your tools, even when an IDE hides those steps.`,
    exercise: {
      prompt: `Confirm your installation from the terminal without using an IDE. Check both tools report a version, then compile and run the program below.

The last command should print <code>Setup works</code>.`,
      starterCode: `// Save this as SetupCheck.java
public class SetupCheck {
    public static void main(String[] args) {
        System.out.println("Setup works");
    }
}

// In a terminal, from the folder containing the file:
// 1. Check the runtime version
// 2. Check the compiler version
// 3. Compile the file
// 4. Run the class`,
      hints: [
        'The runtime and the compiler are two separate commands: <code>java</code> and <code>javac</code>.',
        'You compile a file name (with .java) but run a class name (without any extension).',
      ],
      solution: `// 1. java -version
// 2. javac -version
// 3. javac SetupCheck.java      -> creates SetupCheck.class
// 4. java SetupCheck            -> prints: Setup works`,
    },
    quiz: [
      {
        question: 'Which command compiles <code>Hello.java</code>?',
        options: ['java Hello.java', 'javac Hello.java', 'javac Hello', 'compile Hello.java'],
        answer: 1,
        explanation: 'javac is the compiler and takes the source file name including the .java extension.',
      },
      {
        question: 'What should the <code>JAVA_HOME</code> environment variable point to?',
        options: ['The folder containing your .java files', 'The JDK installation directory', 'The java.exe file itself', 'The folder containing your .class files'],
        answer: 1,
        explanation: 'JAVA_HOME points to the root of the JDK installation. Build tools such as Maven and Gradle use it to find the compiler and runtime.',
      },
      {
        question: 'After compiling, you type <code>java Hello.class</code> and get an error. What is the correct command?',
        options: ['java Hello', 'javac Hello.class', 'java Hello.java.class', 'run Hello'],
        answer: 0,
        explanation: 'The java launcher expects a class name, not a file name, so the .class extension must be left off.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between PATH and CLASSPATH?',
        answer: `PATH is an operating-system variable that tells the shell where to find executables, such as <code>java</code> and <code>javac</code>. CLASSPATH tells the Java compiler and the JVM where to look for compiled classes and JAR files that your program uses.

A wrong PATH gives "command not found"; a wrong CLASSPATH gives <code>ClassNotFoundException</code> or <code>NoClassDefFoundError</code>.`,
      },
    ],
  },

  'c-vs-java-key-differences': {
    whyItMatters: `Many learners arrive at Java from C or C++, and the two languages look similar enough to be misleading. Knowing where they differ — memory management, pointers, inheritance and the compilation model — prevents you from carrying over habits that do not apply, and "compare Java with C++" is a standard opening interview question.`,
    exercise: {
      prompt: `In C++ you would create this object with <code>new</code> and later free it with <code>delete</code>. Complete the Java version: create two <code>Counter</code> objects, increment the first twice and the second once, and print both values. Notice that there is nothing to free.

Expected output:
<code>first = 2</code> and <code>second = 1</code> on separate lines.`,
      starterCode: `public class Counter {
    private int value;

    void increment() {
        value++;
    }

    int getValue() {
        return value;
    }

    public static void main(String[] args) {
        // TODO: create two Counter objects, increment them, print their values
    }
}`,
      hints: [
        'Objects are created with <code>new Counter()</code>; the variable holds a reference to the object, not the object itself.',
        'There is no <code>delete</code> in Java. Objects that are no longer reachable are reclaimed by the garbage collector.',
      ],
      solution: `public class Counter {
    private int value;

    void increment() {
        value++;
    }

    int getValue() {
        return value;
    }

    public static void main(String[] args) {
        Counter first = new Counter();
        Counter second = new Counter();

        first.increment();
        first.increment();
        second.increment();

        System.out.println("first = " + first.getValue());
        System.out.println("second = " + second.getValue());
    }
}`,
    },
    quiz: [
      {
        question: 'How is memory for unused objects reclaimed in Java?',
        options: ['The programmer calls delete', 'The programmer calls free()', 'The garbage collector reclaims it automatically', 'It is never reclaimed until the program exits'],
        answer: 2,
        explanation: 'Java has automatic garbage collection. C++ relies on the programmer (or smart pointers) to release memory.',
      },
      {
        question: 'Which statement about inheritance is correct?',
        options: ['Both languages allow a class to extend many classes', 'Java allows a class to extend many classes, C++ does not', 'C++ allows multiple inheritance of classes; Java allows it only through interfaces', 'Neither language supports inheritance'],
        answer: 2,
        explanation: 'C++ supports multiple inheritance of classes. A Java class can extend one class and implement any number of interfaces.',
      },
      {
        question: 'Which of these can you do in C++ but not in Java?',
        options: ['Create objects', 'Perform pointer arithmetic', 'Write loops', 'Define methods'],
        answer: 1,
        explanation: 'Java has references but no pointer arithmetic, which removes a whole class of memory-corruption bugs.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Does Java have pointers?',
        answer: `Java has references, which refer to objects on the heap, but it does not expose pointers the way C and C++ do. You cannot read a memory address, do arithmetic on a reference, or cast an integer to a reference. This is a deliberate safety decision: a reference is either null or points to a valid object of a compatible type.`,
      },
      {
        question: 'Does Java support operator overloading?',
        answer: `Not user-defined operator overloading. You cannot define what <code>+</code> means for your own class as you can in C++. The one visible built-in case is <code>+</code> for String concatenation, which the language defines itself.`,
      },
    ],
  },

  'jvm-jdk-and-jre': {
    whyItMatters: `These three terms decide what you install and what breaks when it is missing. A server that only runs your application needs a runtime; your laptop needs the full development kit; and performance tuning, memory errors and garbage collection all happen inside the JVM. Mixing them up is one of the fastest ways to lose credibility in an interview.`,
    diagram: {
      caption: 'JDK contains the JRE, and the JRE contains the JVM.',
      svg: `<svg viewBox="0 0 640 250" role="img" aria-label="Three nested boxes: JDK outermost, JRE inside it, JVM innermost" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14">
  <rect x="10" y="10" width="620" height="230" rx="10"/>
  <text x="28" y="36" fill="currentColor" stroke="none" font-weight="700">JDK — development kit</text>
  <text x="28" y="56" fill="currentColor" stroke="none" font-size="12">javac, jar, javadoc, jshell, debugger</text>
  <rect x="150" y="72" width="460" height="150" rx="10"/>
  <text x="168" y="98" fill="currentColor" stroke="none" font-weight="700">JRE — runtime environment</text>
  <text x="168" y="118" fill="currentColor" stroke="none" font-size="12">core class libraries: java.lang, java.util, java.io ...</text>
  <rect x="300" y="134" width="290" height="72" rx="10" stroke-width="3"/>
  <text x="318" y="162" fill="currentColor" stroke="none" font-weight="700">JVM — virtual machine</text>
  <text x="318" y="184" fill="currentColor" stroke="none" font-size="12">loads classes, runs bytecode, JIT, GC</text>
</svg>`,
    },
    exercise: {
      prompt: `Ask the running JVM to describe itself. Complete the program so it prints the Java version, the name of the JVM implementation, and the folder Java is installed in.

The output depends on your installation, for example a version such as <code>21.0.2</code> and a VM name such as <code>OpenJDK 64-Bit Server VM</code>.`,
      starterCode: `public class RuntimeInfo {
    public static void main(String[] args) {
        // TODO: print these three system properties, one per line:
        // java.version, java.vm.name, java.home
    }
}`,
      hints: [
        'All three values come from <code>System.getProperty(key)</code>.',
        'The VM name tells you which JVM implementation you are running, such as HotSpot or OpenJ9.',
      ],
      solution: `public class RuntimeInfo {
    public static void main(String[] args) {
        System.out.println("Version: " + System.getProperty("java.version"));
        System.out.println("VM: " + System.getProperty("java.vm.name"));
        System.out.println("Home: " + System.getProperty("java.home"));
    }
}`,
    },
    quiz: [
      {
        question: 'You need to compile Java source code. Which one must be installed?',
        options: ['JVM only', 'JRE', 'JDK', 'Any web browser'],
        answer: 2,
        explanation: 'Only the JDK includes the compiler (javac) and other development tools.',
      },
      {
        question: 'Which component actually executes bytecode?',
        options: ['JDK', 'javac', 'JVM', 'jar'],
        answer: 2,
        explanation: 'The JVM loads .class files and executes their bytecode, interpreting it and compiling hot code to native instructions.',
      },
      {
        question: 'What does the JRE consist of?',
        options: ['The compiler and the debugger', 'The JVM plus the core class libraries', 'Only the class libraries', 'The JDK plus an IDE'],
        answer: 1,
        explanation: 'JRE = JVM + the standard class libraries needed to run programs. It has no compiler.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the JIT compiler and where does it live?',
        answer: `The Just-In-Time compiler is part of the JVM. The JVM starts by interpreting bytecode, tracks which methods run often ("hot" code), and compiles those to native machine code while the program is running. This is why long-running Java programs speed up after a warm-up period.`,
      },
      {
        question: 'Is there still a separate JRE to download?',
        answer: `For current versions, generally no. Since Java 11, Oracle and most OpenJDK distributions ship the JDK as the standard download rather than a separate JRE. For deployment you can either install a JDK or use <code>jlink</code> to build a small custom runtime containing only the modules your application needs. The concepts JVM, JRE and JDK still describe the same three layers.`,
      },
    ],
  },

  'java-program-structure-and-first-program': {
    whyItMatters: `Every Java file you will ever read follows this structure, and the compiler enforces it strictly. Once the order of package, imports and class, and the exact shape of <code>main</code>, are automatic for you, error messages like "class X is public, should be declared in a file named X.java" become obvious instead of mysterious.`,
    diagram: {
      caption: 'From source file to running program: javac compiles once, the JVM runs the bytecode.',
      svg: `<svg viewBox="0 0 640 110" role="img" aria-label="Hello.java is compiled by javac into Hello.class, which the JVM runs to produce output" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-monospace, monospace" font-size="13">
  <rect x="10" y="30" width="120" height="50" rx="6"/>
  <text x="70" y="52" text-anchor="middle" fill="currentColor" stroke="none">Hello.java</text>
  <text x="70" y="69" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">source</text>
  <path d="M130 55 H180"/><path d="M174 49 L180 55 L174 61"/>
  <text x="155" y="45" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">javac</text>
  <rect x="180" y="30" width="120" height="50" rx="6"/>
  <text x="240" y="52" text-anchor="middle" fill="currentColor" stroke="none">Hello.class</text>
  <text x="240" y="69" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">bytecode</text>
  <path d="M300 55 H350"/><path d="M344 49 L350 55 L344 61"/>
  <text x="325" y="45" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">java</text>
  <rect x="350" y="30" width="120" height="50" rx="6" stroke-width="3"/>
  <text x="410" y="52" text-anchor="middle" fill="currentColor" stroke="none">JVM</text>
  <text x="410" y="69" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">finds main()</text>
  <path d="M470 55 H520"/><path d="M514 49 L520 55 L514 61"/>
  <rect x="520" y="30" width="110" height="50" rx="6"/>
  <text x="575" y="59" text-anchor="middle" fill="currentColor" stroke="none">output</text>
</svg>`,
    },
    exercise: {
      prompt: `Write a program with a second method. <code>greet</code> should take a name and return a greeting, and <code>main</code> should print the greeting for two different names.

Expected output:
<code>Hello, Asha!</code> then <code>Hello, Ravi!</code> on separate lines.`,
      starterCode: `public class Greeter {

    // TODO: add a static method greet(String name) that returns "Hello, <name>!"

    public static void main(String[] args) {
        // TODO: print the greeting for "Asha" and for "Ravi"
    }
}`,
      hints: [
        'A method called directly from <code>main</code> without creating an object must also be <code>static</code>.',
        'The method returns a value instead of printing it, so its return type is <code>String</code>, not <code>void</code>.',
      ],
      solution: `public class Greeter {

    static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static void main(String[] args) {
        System.out.println(greet("Asha"));
        System.out.println(greet("Ravi"));
    }
}`,
    },
    quiz: [
      {
        question: 'A source file contains <code>public class Invoice</code>. What must the file be named?',
        options: ['invoice.java', 'Invoice.java', 'Main.java', 'Any name ending in .java'],
        answer: 1,
        explanation: 'The file name must match the public class name exactly, including capitalisation.',
      },
      {
        question: 'Why is <code>main</code> declared <code>static</code>?',
        options: ['So it runs faster', 'So the JVM can call it without creating an object of the class first', 'So it cannot be changed', 'So it can return a value'],
        answer: 1,
        explanation: 'When the program starts no objects exist yet, so the entry point has to be callable on the class itself.',
      },
      {
        question: 'Where must a <code>package</code> statement appear?',
        options: ['Anywhere before the class', 'After the imports', 'As the first statement in the file', 'Inside the class body'],
        answer: 2,
        explanation: 'If present, the package declaration comes first (only comments may precede it), followed by imports, then type declarations.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Can a single .java file contain more than one class?',
        answer: `Yes. A file can declare several classes, but at most one of them can be <code>public</code>, and the file must be named after that public class. The compiler still produces a separate .class file for every class in the source file.`,
      },
      {
        question: 'Can the main method be overloaded?',
        answer: `Yes, you can declare other methods named <code>main</code> with different parameter lists, and they compile fine. The JVM, however, only uses <code>public static void main(String[] args)</code> as the entry point; the overloads run only if your code calls them.`,
      },
    ],
  },

  'java-variables': {
    whyItMatters: `Where a variable is declared decides how long it lives, who can see it, and whether it is shared. Bugs such as "every object seems to have the same value" or "variable might not have been initialized" are not random — they follow directly from the difference between local, instance and static variables.`,
    exercise: {
      prompt: `Model bank accounts that each keep their own balance while the class keeps one shared count of how many accounts exist. Fill in the two field declarations and the constructor.

Expected output:
<code>Asha: 500</code>, <code>Ravi: 1200</code>, then <code>Accounts opened: 2</code>, each on its own line.`,
      starterCode: `public class BankAccount {
    // TODO: declare an instance variable for the owner name and one for the balance
    // TODO: declare a static variable that counts accounts

    BankAccount(String owner, int balance) {
        // TODO: store the values and increase the shared counter
    }

    public static void main(String[] args) {
        BankAccount first = new BankAccount("Asha", 500);
        BankAccount second = new BankAccount("Ravi", 1200);

        System.out.println(first.owner + ": " + first.balance);
        System.out.println(second.owner + ": " + second.balance);
        System.out.println("Accounts opened: " + BankAccount.accountCount);
    }
}`,
      hints: [
        'Use <code>this.owner = owner;</code> to tell the field apart from the parameter with the same name.',
        'Only the counter should be <code>static</code>; a static balance would be shared by every account.',
      ],
      solution: `public class BankAccount {
    String owner;
    int balance;
    static int accountCount = 0;

    BankAccount(String owner, int balance) {
        this.owner = owner;
        this.balance = balance;
        accountCount++;
    }

    public static void main(String[] args) {
        BankAccount first = new BankAccount("Asha", 500);
        BankAccount second = new BankAccount("Ravi", 1200);

        System.out.println(first.owner + ": " + first.balance);
        System.out.println(second.owner + ": " + second.balance);
        System.out.println("Accounts opened: " + BankAccount.accountCount);
    }
}`,
    },
    quiz: [
      {
        question: 'What happens if you read a local variable before assigning it a value?',
        options: ['It contains 0', 'It contains null', 'The code does not compile', 'It throws an exception at runtime'],
        answer: 2,
        explanation: 'Local variables have no default value. The compiler rejects any read that is not definitely preceded by an assignment.',
      },
      {
        question: 'What is the default value of an <code>int</code> instance variable that is never assigned?',
        options: ['0', 'null', '-1', 'It has no default'],
        answer: 0,
        explanation: 'Instance and static variables get defaults: 0 for numeric types, false for boolean, and null for references.',
      },
      {
        question: 'A class has one static variable. You create three objects of that class. How many copies of the variable exist?',
        options: ['Three', 'One', 'Four', 'None until it is assigned'],
        answer: 1,
        explanation: 'A static variable belongs to the class, so there is exactly one copy shared by all objects.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between an instance variable and a static variable?',
        answer: `An instance variable belongs to an object: each object has its own copy, created when the object is created. A static variable belongs to the class: there is one copy, created when the class is loaded and shared by every object.

Use instance variables for state that differs per object (a balance) and static variables for state that is genuinely class-wide (a counter or a constant).`,
      },
      {
        question: 'Why do local variables not get default values when fields do?',
        answer: `It is a deliberate language rule to catch bugs. A field can be read from many methods at any time, so the language guarantees it a known starting value. A local variable lives only inside one method, so the compiler can check every path and insist that you assign it before reading it — reading an unassigned local is almost always a mistake.`,
      },
    ],
  },

  'identifiers-in-java': {
    whyItMatters: `Names are the part of a program people read most. The compiler only enforces a few hard rules, but the naming conventions on top of them are what make Java code from different teams look familiar: you can tell a class from a variable from a constant at a glance, without checking its declaration.`,
    exercise: {
      prompt: `This program does not compile because three names break the identifier rules, and one more breaks the convention for constants. Rename them so the program compiles and follows Java conventions.

Expected output: <code>Total: 250</code>`,
      starterCode: `public class Checkout {
    static final int maxitems = 10;       // convention problem

    public static void main(String[] args) {
        int 2ndPrice = 150;               // rule problem
        int first-price = 100;            // rule problem
        int class = 2ndPrice + first-price; // rule problem
        System.out.println("Total: " + class);
    }
}`,
      hints: [
        'An identifier cannot start with a digit, cannot contain a hyphen, and cannot be a reserved keyword.',
        'Constants are written in upper case with underscores, and variables in camelCase.',
      ],
      solution: `public class Checkout {
    static final int MAX_ITEMS = 10;

    public static void main(String[] args) {
        int secondPrice = 150;
        int firstPrice = 100;
        int total = secondPrice + firstPrice;
        System.out.println("Total: " + total);
    }
}`,
    },
    quiz: [
      {
        question: 'Which of these is a valid Java identifier?',
        options: ['2ndPlace', 'total-price', '_count', 'class'],
        answer: 2,
        explanation: '_count is valid. An identifier cannot start with a digit, cannot contain a hyphen, and cannot be a reserved keyword.',
      },
      {
        question: 'Are <code>total</code> and <code>Total</code> the same identifier?',
        options: ['Yes, Java ignores case', 'No, Java is case-sensitive', 'Only inside the same method', 'Only for variables, not for methods'],
        answer: 1,
        explanation: 'Java is case-sensitive, so these are two different names.',
      },
      {
        question: 'Which name follows the Java convention for a constant?',
        options: ['maxSize', 'MaxSize', 'MAX_SIZE', 'max_size'],
        answer: 2,
        explanation: 'Constants (static final fields) are written in upper case with underscores between words.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between identifier rules and naming conventions?',
        answer: `Rules are enforced by the compiler: an identifier may contain letters, digits, underscore and dollar sign, cannot start with a digit, and cannot be a reserved word. Breaking a rule is a compile error.

Conventions are agreed style that the compiler does not check: PascalCase for classes, camelCase for methods and variables, UPPER_SNAKE_CASE for constants, and lower-case package names. Breaking a convention still compiles, but makes code harder for other Java developers to read.`,
      },
    ],
  },

  'java-data-types': {
    whyItMatters: `Choosing a type is choosing a range and a precision. Money stored in a <code>float</code>, a count that silently wraps past two billion, or a null check on something that can never be null are all data-type mistakes, and they tend to appear only with real data, long after the code was written.`,
    exercise: {
      prompt: `The program below tries to calculate the number of milliseconds in a year, but prints the wrong answer because the multiplication overflows <code>int</code>. Fix it so the correct value is printed.

Before the fix it prints <code>1471228928</code>. After the fix it should print <code>31536000000</code>.`,
      starterCode: `public class MillisPerYear {
    public static void main(String[] args) {
        long millis = 365 * 24 * 60 * 60 * 1000;
        System.out.println(millis);
    }
}`,
      hints: [
        'All five numbers are <code>int</code> literals, so the multiplication is done in 32-bit arithmetic before the result is stored in the long.',
        'Making the first operand a long (for example <code>365L</code>) makes the whole calculation use 64-bit arithmetic.',
      ],
      solution: `public class MillisPerYear {
    public static void main(String[] args) {
        long millis = 365L * 24 * 60 * 60 * 1000;
        System.out.println(millis); // 31536000000
    }
}`,
    },
    quiz: [
      {
        question: 'What is the type of the literal <code>3.14</code> in Java?',
        options: ['float', 'double', 'BigDecimal', 'It depends on the variable it is assigned to'],
        answer: 1,
        explanation: 'A decimal literal is a double by default. A float literal needs an f suffix, such as 3.14f.',
      },
      {
        question: 'How many bits does an <code>int</code> use?',
        options: ['16', '32', '64', 'It depends on the operating system'],
        answer: 1,
        explanation: 'An int is always 32 bits in Java, on every platform.',
      },
      {
        question: 'Which of these variables can hold <code>null</code>?',
        options: ['int count', 'boolean active', 'String name', 'double price'],
        answer: 2,
        explanation: 'Only reference types can be null. String is a class, so a String variable holds a reference. Primitives always hold a value.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between primitive types and reference types?',
        answer: `A primitive variable holds the value itself; there are eight of them and they cannot be null. A reference variable holds a reference to an object stored on the heap, and it can be null.

This affects comparison and assignment: <code>==</code> on primitives compares values, while <code>==</code> on references compares whether both point to the same object. Assigning a reference copies the reference, not the object.`,
      },
      {
        question: 'Why is a char 16 bits in Java when it is 8 bits in C?',
        answer: `Java's <code>char</code> was designed to hold a Unicode character rather than an ASCII one, so it is a 16-bit UTF-16 code unit. Characters outside the first 65,536 code points, such as many emoji, need two chars (a surrogate pair).`,
      },
    ],
  },

  'unicode-system-in-java': {
    whyItMatters: `Any program that handles names, addresses or messages will meet text beyond English letters. Java strings are Unicode from the start, but a <code>char</code> is not always a whole character, and that gap is where bugs in length checks, truncation and reversing strings come from.`,
    exercise: {
      prompt: `Explore how characters map to numbers. Complete the program so it prints the code of the letter A, the character with code 66, and the character written with the Unicode escape for 0041.

Expected output: <code>65</code>, <code>B</code>, <code>A</code>, each on its own line.`,
      starterCode: `public class UnicodeDemo {
    public static void main(String[] args) {
        char letter = 'A';
        // TODO: print the numeric code of letter
        // TODO: print the character whose code is 66
        // TODO: print the character written as the Unicode escape \\u0041
    }
}`,
      hints: [
        'Casting a char to int gives its code: <code>(int) letter</code>.',
        'Casting an int to char goes the other way: <code>(char) 66</code>.',
      ],
      solution: `public class UnicodeDemo {
    public static void main(String[] args) {
        char letter = 'A';
        System.out.println((int) letter);   // 65
        System.out.println((char) 66);      // B
        System.out.println('\\u0041');       // A
    }
}`,
    },
    quiz: [
      {
        question: 'How many bits is a Java <code>char</code>?',
        options: ['7', '8', '16', '32'],
        answer: 2,
        explanation: 'A char is a 16-bit UTF-16 code unit.',
      },
      {
        question: 'What does <code>(int) \'A\'</code> evaluate to?',
        options: ['1', '41', '65', '97'],
        answer: 2,
        explanation: 'The code of upper-case A is 65. Lower-case a is 97.',
      },
      {
        question: 'A String contains a single emoji that lies outside the first 65,536 Unicode code points. What does <code>length()</code> return?',
        options: ['1', '2', '4', '0'],
        answer: 1,
        explanation: 'length() counts 16-bit chars, and such a character is stored as two chars (a surrogate pair). codePointCount() would return 1.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why does Java use Unicode instead of ASCII?',
        answer: `ASCII defines only 128 characters, enough for basic English. Java was designed for networked, international software, so it adopted Unicode, which assigns a number to characters from virtually every writing system. That lets one Java program handle Hindi, Chinese, Arabic and English text with the same String type.`,
      },
      {
        question: 'What is the difference between length() and codePointCount() on a String?',
        answer: `<code>length()</code> returns the number of 16-bit char values. <code>codePointCount(0, s.length())</code> returns the number of actual Unicode characters. They are equal for most text, but differ when the string contains characters stored as surrogate pairs, where one character takes two chars.`,
      },
    ],
  },

  'type-casting-and-type-promotion': {
    whyItMatters: `Casting bugs are quiet. The code compiles, runs and prints a number — just the wrong one: an average that lost its decimals, or a value that wrapped to a negative number. Knowing when Java converts for you and when it truncates is what lets you trust arithmetic in pricing, reports and percentages.`,
    exercise: {
      prompt: `This program should print the average of four scores, but it prints <code>8.0</code> because the division is done with integers. Fix it so it prints <code>8.5</code>.`,
      starterCode: `public class AverageScore {
    public static void main(String[] args) {
        int total = 7 + 8 + 9 + 10;
        int count = 4;
        double average = total / count;
        System.out.println(average);
    }
}`,
      hints: [
        'Both <code>total</code> and <code>count</code> are ints, so <code>total / count</code> is integer division: 34 / 4 is 8.',
        'Cast one operand to double before dividing: <code>(double) total / count</code>.',
      ],
      solution: `public class AverageScore {
    public static void main(String[] args) {
        int total = 7 + 8 + 9 + 10;
        int count = 4;
        double average = (double) total / count;
        System.out.println(average); // 8.5
    }
}`,
    },
    quiz: [
      {
        question: 'What is the value of <code>(int) 9.99</code>?',
        options: ['10', '9', '9.99', 'It does not compile'],
        answer: 1,
        explanation: 'Casting a double to int truncates the fractional part; it does not round.',
      },
      {
        question: 'What is the value of <code>(byte) 130</code>?',
        options: ['130', '127', '-126', '-130'],
        answer: 2,
        explanation: 'A byte holds -128 to 127. 130 does not fit, so the value wraps around: 130 - 256 = -126.',
      },
      {
        question: 'If <code>a</code> and <code>b</code> are both of type <code>byte</code>, what is the type of <code>a + b</code>?',
        options: ['byte', 'short', 'int', 'long'],
        answer: 2,
        explanation: 'byte, short and char operands are promoted to int before arithmetic, so the result is an int.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Given byte b = 10, why does b += 5 compile when b = b + 5 does not?',
        answer: `<code>b + 5</code> is promoted to int, and assigning an int to a byte needs an explicit cast, so <code>b = b + 5</code> is a compile error. A compound assignment operator includes an implicit cast back to the type of the left-hand side, so <code>b += 5</code> behaves like <code>b = (byte) (b + 5)</code>.`,
      },
      {
        question: 'Is widening always lossless?',
        answer: `It never loses magnitude, but it can lose precision. Converting <code>int</code> to <code>long</code> or <code>int</code> to <code>double</code> is exact. Converting a large <code>long</code> to <code>float</code> or <code>double</code>, or a large <code>int</code> to <code>float</code>, is allowed implicitly but may round, because floating-point types cannot represent every large whole number exactly.`,
      },
    ],
  },

  'java-operators': {
    whyItMatters: `Operators are where most small logic errors live: an integer division that drops the remainder, a condition that evaluates something it should have skipped, or <code>==</code> used where <code>equals()</code> was needed. These are easy to write, hard to spot in review, and they are favourite material for "what does this print?" interview questions.`,
    exercise: {
      prompt: `Write the leap-year rule using the modulus and logical operators. A year is a leap year if it is divisible by 4 and not by 100, unless it is also divisible by 400.

Expected output: <code>2024 true</code>, <code>1900 false</code>, <code>2000 true</code>, each on its own line.`,
      starterCode: `public class LeapYear {

    static boolean isLeap(int year) {
        // TODO: return true when year is a leap year
        return false;
    }

    public static void main(String[] args) {
        System.out.println("2024 " + isLeap(2024));
        System.out.println("1900 " + isLeap(1900));
        System.out.println("2000 " + isLeap(2000));
    }
}`,
      hints: [
        '<code>year % 4 == 0</code> is true when year is divisible by 4.',
        'Combine the three tests with <code>&&</code> and <code>||</code>, using parentheses to make the grouping explicit.',
      ],
      solution: `public class LeapYear {

    static boolean isLeap(int year) {
        return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    }

    public static void main(String[] args) {
        System.out.println("2024 " + isLeap(2024));
        System.out.println("1900 " + isLeap(1900));
        System.out.println("2000 " + isLeap(2000));
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>5 / 2</code> evaluate to in Java?',
        options: ['2.5', '2', '3', '2.0'],
        answer: 1,
        explanation: 'Both operands are ints, so this is integer division, which truncates the result to 2.',
      },
      {
        question: 'Given <code>int a = 5;</code>, what is the value of <code>a++ + ++a</code>?',
        options: ['10', '11', '12', '13'],
        answer: 2,
        explanation: 'a++ yields 5 and then a becomes 6. ++a makes a 7 and yields 7. 5 + 7 = 12.',
      },
      {
        question: 'What happens when Java evaluates <code>false && (10 / 0 == 0)</code>?',
        options: ['It throws ArithmeticException', 'It evaluates to false without dividing', 'It evaluates to true', 'It does not compile'],
        answer: 1,
        explanation: '&& short-circuits: the left side is false, so the right side is never evaluated and no division happens.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between == and equals()?',
        answer: `For primitives, <code>==</code> compares values. For objects, <code>==</code> compares references — whether both variables point to the same object — while <code>equals()</code> compares content, as defined by the class.

So two different String objects with the same characters are equal with <code>equals()</code> but may not be with <code>==</code>. Use <code>equals()</code> to compare the content of objects.`,
      },
      {
        question: 'What is the difference between >> and >>>?',
        answer: `Both shift bits to the right. <code>>></code> is the signed shift: it fills the vacated high bits with the sign bit, so a negative number stays negative. <code>>>></code> is the unsigned shift: it always fills with zeros, so a negative int becomes a large positive number.`,
      },
    ],
  },

  'java-keywords': {
    whyItMatters: `Keywords are the fixed vocabulary of the language. You do not need to recite the list, but you do need to recognise each one on sight, because a keyword always means the same thing wherever it appears — and the compiler error when you accidentally use one as a name is not always obvious.`,
    exercise: {
      prompt: `This program fails to compile because three variables are named with reserved words. Rename them to sensible identifiers so that it compiles.

Expected output: <code>Order 42 total 199.5 new=true</code>`,
      starterCode: `public class OrderSummary {
    public static void main(String[] args) {
        int case = 42;
        double double = 199.5;
        boolean new = true;
        System.out.println("Order " + case + " total " + double + " new=" + new);
    }
}`,
      hints: [
        '<code>case</code>, <code>double</code> and <code>new</code> are all reserved keywords.',
        'Pick names that describe the data, such as an order number, a total and a flag.',
      ],
      solution: `public class OrderSummary {
    public static void main(String[] args) {
        int orderNumber = 42;
        double total = 199.5;
        boolean isNew = true;
        System.out.println("Order " + orderNumber + " total " + total + " new=" + isNew);
    }
}`,
    },
    quiz: [
      {
        question: 'Which of these is NOT a Java keyword?',
        options: ['goto', 'const', 'main', 'strictfp'],
        answer: 2,
        explanation: 'main is just a method name the JVM looks for. goto and const are reserved even though the language does not use them.',
      },
      {
        question: 'What does <code>var</code> do in <code>var count = 10;</code>?',
        options: ['Makes count dynamically typed', 'Lets the compiler infer the type as int at compile time', 'Makes count a constant', 'Declares a global variable'],
        answer: 1,
        explanation: 'var is compile-time type inference for local variables. count is an int and cannot later hold a String.',
      },
      {
        question: 'How does Java classify <code>true</code>, <code>false</code> and <code>null</code>?',
        options: ['As keywords', 'As reserved literals', 'As identifiers', 'As operators'],
        answer: 1,
        explanation: 'They are literals, not keywords, but they are reserved and cannot be used as identifiers either.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Are goto and const used in Java?',
        answer: `No. Both are reserved keywords, so you cannot use them as identifiers, but the language gives them no function. They were reserved so the compiler can give a clear error if someone coming from C or C++ tries to use them. Java uses <code>final</code> where C++ would use <code>const</code>, and labelled <code>break</code> and <code>continue</code> where goto might have been used.`,
      },
    ],
    seeAlso: [
      { lessonId: 'lesson_java_core_final_vs_finally_vs_finalize', label: 'final vs finally vs finalize' },
    ],
  },

  'java-comments': {
    whyItMatters: `Code is read far more often than it is written, usually by someone who was not there when the decision was made. A good comment records the reason that cannot be seen in the code; a bad one repeats the code and then goes out of date. Javadoc comments also become the documentation other developers see in their editor when they call your method.`,
    exercise: {
      prompt: `Document the method below with a Javadoc comment. It should have a one-sentence description, a <code>@param</code> tag for each parameter and a <code>@return</code> tag. The program's behaviour does not change.

Expected output: <code>9</code>`,
      starterCode: `public class MathUtil {

    // TODO: replace this line with a Javadoc comment
    static int max(int a, int b) {
        return a > b ? a : b;
    }

    public static void main(String[] args) {
        System.out.println(max(4, 9));
    }
}`,
      hints: [
        'A Javadoc comment starts with <code>/**</code>, not <code>/*</code>, and sits directly above the method.',
        'Describe what the caller gets back, not how the method works internally.',
      ],
      solution: `public class MathUtil {

    /**
     * Returns the larger of two integers.
     *
     * @param a the first value
     * @param b the second value
     * @return the greater of a and b; either one if they are equal
     */
    static int max(int a, int b) {
        return a > b ? a : b;
    }

    public static void main(String[] args) {
        System.out.println(max(4, 9));
    }
}`,
    },
    quiz: [
      {
        question: 'Which comment style does the <code>javadoc</code> tool turn into documentation?',
        options: ['// ...', '/* ... */', '/** ... */', '# ...'],
        answer: 2,
        explanation: 'Only comments that begin with /** are processed by javadoc.',
      },
      {
        question: 'Can block comments be nested, as in <code>/* outer /* inner */ still outer */</code>?',
        options: ['Yes, to any depth', 'No, the comment ends at the first */', 'Only inside methods', 'Only in Javadoc comments'],
        answer: 1,
        explanation: 'Block comments do not nest. The first */ closes the comment, and the remaining text causes a compile error.',
      },
      {
        question: 'How do comments affect the compiled .class file?',
        options: ['They make it larger', 'They slow the program down', 'They are discarded by the compiler and have no effect', 'They are stored as strings'],
        answer: 2,
        explanation: 'The compiler ignores comments entirely, so they add nothing to the bytecode.',
      },
    ],
  },

  'command-line-arguments': {
    whyItMatters: `Command-line arguments are how scripts, schedulers and deployment tools hand settings to a Java program: an input file, an environment name, a port. Handling them carefully — checking how many arrived and converting them safely — is the difference between a tool that reports "usage: ..." and one that crashes with a stack trace.`,
    exercise: {
      prompt: `Write a program that adds up all the numbers passed on the command line. With no arguments it should print a usage message instead of failing.

Running <code>java SumArgs 4 5 6</code> should print <code>Sum: 15</code>. Running <code>java SumArgs</code> should print <code>Usage: java SumArgs &lt;number&gt; ...</code>`,
      starterCode: `public class SumArgs {
    public static void main(String[] args) {
        // TODO: if there are no arguments, print the usage message and return

        int sum = 0;
        // TODO: convert each argument to an int and add it to sum

        System.out.println("Sum: " + sum);
    }
}`,
      hints: [
        '<code>args.length</code> is 0 when no arguments are given; args is never null.',
        'Every argument is a String, so use <code>Integer.parseInt(arg)</code> inside a for-each loop.',
      ],
      solution: `public class SumArgs {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Usage: java SumArgs <number> ...");
            return;
        }

        int sum = 0;
        for (String arg : args) {
            sum += Integer.parseInt(arg);
        }

        System.out.println("Sum: " + sum);
    }
}`,
    },
    quiz: [
      {
        question: 'You run <code>java Demo red green blue</code>. What is <code>args.length</code>?',
        options: ['4', '3', '2', '0'],
        answer: 1,
        explanation: 'The class name is not part of args, so the array holds the three words that follow it.',
      },
      {
        question: 'You run <code>java Demo</code> with no arguments and the program reads <code>args[0]</code>. What happens?',
        options: ['It reads null', 'It reads an empty String', 'It throws ArrayIndexOutOfBoundsException', 'It does not compile'],
        answer: 2,
        explanation: 'args is an empty array, so index 0 does not exist and the access throws ArrayIndexOutOfBoundsException.',
      },
      {
        question: 'You run <code>java Demo 42</code>. What is the type of <code>args[0]</code>?',
        options: ['int', 'Integer', 'String', 'char'],
        answer: 2,
        explanation: 'Every command-line argument arrives as a String. Convert it with Integer.parseInt if you need a number.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Can args be null if no arguments are passed?',
        answer: `No. When a program is started with no arguments, the JVM passes an empty array of length 0, not null. So <code>args.length</code> is always safe to read, but any index access must be guarded by a length check.`,
      },
      {
        question: 'Can main be declared as main(String... args)?',
        answer: `Yes. A varargs parameter is compiled as an array, so <code>public static void main(String... args)</code> is a valid entry point. The parameter name is also free to choose; only the type and the modifiers matter to the JVM.`,
      },
    ],
  },
}
