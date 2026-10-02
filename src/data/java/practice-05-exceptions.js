// Practice blocks for the Exception Handling module. Merged onto the lesson
// entries in index.js by slug, so the lesson prose files stay unchanged.
export const practice05Exceptions = {
  'exception-handling-basics': {
    whyItMatters: `Real programs meet bad input, missing files and failed network calls every day. Without exception handling, the first such problem stops the whole program with a stack trace. With it, you decide what happens instead: report the problem, try something else, or carry on with the next item. That difference is what separates a script from software people can rely on.`,
    exercise: {
      prompt: `Write <code>divide</code> so that dividing by zero does not crash the program. When the divisor is zero it should print a message and return 0, and the program should carry on to its last line.

Expected output: <code>5</code>, <code>Cannot divide by zero</code>, <code>0</code>, <code>Done</code>`,
      starterCode: `public class SafeDivide {

    static int divide(int a, int b) {
        // TODO: return a / b, but catch ArithmeticException,
        // print "Cannot divide by zero" and return 0
        return a / b;
    }

    public static void main(String[] args) {
        System.out.println(divide(10, 2));
        System.out.println(divide(10, 0));
        System.out.println("Done");
    }
}`,
      hints: [
        'Put the division inside a <code>try</code> block and handle <code>ArithmeticException</code> in the <code>catch</code>.',
        'After the catch block runs, the method continues normally, so return a value from it.',
      ],
      solution: `public class SafeDivide {

    static int divide(int a, int b) {
        try {
            return a / b;
        } catch (ArithmeticException e) {
            System.out.println("Cannot divide by zero");
            return 0;
        }
    }

    public static void main(String[] args) {
        System.out.println(divide(10, 2));
        System.out.println(divide(10, 0));
        System.out.println("Done");
    }
}`,
    },
    quiz: [
      {
        question: 'What happens when Java evaluates the integer expression <code>10 / 0</code>?',
        options: ['It returns 0', 'It throws ArithmeticException', 'It returns Infinity', 'It does not compile'],
        answer: 1,
        explanation: 'Integer division by zero throws ArithmeticException. Only floating-point division by zero gives Infinity.',
      },
      {
        question: 'An exception is thrown in <code>main</code> and nothing catches it. What happens?',
        options: ['The program continues with the next line', 'The exception is ignored', 'The thread ends and the JVM prints a stack trace', 'The program restarts'],
        answer: 2,
        explanation: 'An uncaught exception terminates the thread. The default handler prints the exception and its stack trace.',
      },
      {
        question: 'After a catch block has handled an exception, where does execution continue?',
        options: ['At the line that threw the exception', 'At the start of the try block', 'It stops', 'After the whole try-catch statement'],
        answer: 3,
        explanation: 'The rest of the try block is skipped. Once the catch finishes, execution carries on after the try-catch.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is an exception?',
        answer: `An exception is an object that represents an abnormal event which interrupts the normal flow of a program, such as invalid input or a missing file. When one is thrown, the JVM stops executing the current code and looks up the call stack for a matching <code>catch</code> block. If none is found, the thread ends.`,
      },
      {
        question: 'What information does a stack trace give you?',
        answer: `The exception type and message on the first line, followed by the chain of method calls that were active when it was thrown, most recent first, each with a class, method, file and line number. Reading from the top, the first line that belongs to your own code is usually where to start looking.`,
      },
    ],
  },

  'try-catch-and-finally': {
    whyItMatters: `<code>try</code>, <code>catch</code> and <code>finally</code> are the three parts you use in almost every piece of code that touches files, networks or user input. The order of catch blocks, what <code>finally</code> guarantees, and how <code>try</code>-with-resources closes things for you are details that decide whether a failure is handled cleanly or leaks a connection.`,
    exercise: {
      prompt: `Add up the numbers in an array of text values. One value is not a number: skip it, print which one was skipped, and keep going.

Expected output: <code>Skipped x</code> then <code>Sum: 40</code>`,
      starterCode: `public class SumValid {
    public static void main(String[] args) {
        String[] values = {"10", "x", "30"};
        int sum = 0;

        for (String value : values) {
            // TODO: parse value and add it to sum;
            // if it is not a number, print "Skipped " + value
        }

        System.out.println("Sum: " + sum);
    }
}`,
      hints: [
        '<code>Integer.parseInt</code> throws <code>NumberFormatException</code> for text that is not a number.',
        'Put the try-catch inside the loop so one bad value does not stop the rest.',
      ],
      solution: `public class SumValid {
    public static void main(String[] args) {
        String[] values = {"10", "x", "30"};
        int sum = 0;

        for (String value : values) {
            try {
                sum += Integer.parseInt(value);
            } catch (NumberFormatException e) {
                System.out.println("Skipped " + value);
            }
        }

        System.out.println("Sum: " + sum);
    }
}`,
    },
    quiz: [
      {
        question: 'A try block executes a <code>return</code> statement. Does its <code>finally</code> block still run?',
        options: ['Yes, before the method actually returns', 'No', 'Only if an exception was thrown', 'Only for void methods'],
        answer: 0,
        explanation: 'finally runs whether the try block finishes normally, returns, or throws.',
      },
      {
        question: 'A try has <code>catch (Exception e)</code> followed by <code>catch (ArithmeticException e)</code>. What happens?',
        options: ['It does not compile', 'It works; the second is used for arithmetic errors', 'Both blocks run', 'The first is ignored'],
        answer: 0,
        explanation: 'The second catch is unreachable because Exception already catches every ArithmeticException. Subclasses must come before superclasses.',
      },
      {
        question: 'What does a method return if its body is <code>try { return 1; } finally { return 2; }</code>?',
        options: ['1', 'It does not compile', '2', '3'],
        answer: 2,
        explanation: 'The return in finally replaces the pending return value. This is why returning from finally is considered bad practice.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Is there any case where a finally block does not run?',
        answer: `Yes, but only when the JVM itself stops: <code>System.exit()</code> is called inside the try or catch, the JVM crashes, the process is killed, or the thread is a daemon thread and the JVM exits. In every normal case — normal completion, return, or an exception — finally runs.`,
      },
      {
        question: 'What is try-with-resources?',
        answer: `A form of <code>try</code> that declares resources in parentheses: <code>try (BufferedReader reader = ...) { }</code>. Any resource that implements <code>AutoCloseable</code> is closed automatically when the block ends, whether normally or with an exception, in the reverse of the order they were opened. It replaces the manual close-in-finally pattern and cannot be forgotten.`,
      },
    ],
  },

  'throw-and-throws': {
    whyItMatters: `<code>throw</code> and <code>throws</code> are one letter apart and do different jobs: one raises an exception, the other warns callers that a method may raise one. You use <code>throw</code> to reject invalid input at the edge of a method, and <code>throws</code> to pass a problem to code that is better placed to deal with it.`,
    exercise: {
      prompt: `Make <code>setAge</code> reject negative values by throwing an <code>IllegalArgumentException</code> with the message <code>Age cannot be negative</code>. In <code>main</code>, catch the exception and print its message.

Expected output: <code>Age set to 25</code> then <code>Age cannot be negative</code>`,
      starterCode: `public class AgeCheck {

    static void setAge(int age) {
        // TODO: throw IllegalArgumentException for a negative age
        System.out.println("Age set to " + age);
    }

    public static void main(String[] args) {
        setAge(25);
        // TODO: call setAge(-3) and print the message of the exception it throws
    }
}`,
      hints: [
        'Create and raise the exception in one statement: <code>throw new IllegalArgumentException("...");</code>',
        '<code>e.getMessage()</code> returns the text passed to the constructor.',
      ],
      solution: `public class AgeCheck {

    static void setAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative");
        }
        System.out.println("Age set to " + age);
    }

    public static void main(String[] args) {
        setAge(25);
        try {
            setAge(-3);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
    },
    quiz: [
      {
        question: 'What does the <code>throw</code> keyword do?',
        options: ['Declares that a method may fail', 'Ignores an exception', 'Catches an exception', 'Raises an exception object at that point in the code'],
        answer: 3,
        explanation: 'throw is a statement that raises an exception immediately. Declaring possible exceptions is the job of throws.',
      },
      {
        question: 'Where does <code>throws</code> appear?',
        options: ['In the method signature, after the parameter list', 'Inside a method body', 'In a catch block', 'Before the class name'],
        answer: 0,
        explanation: 'throws is part of the method declaration and lists the exception types the method may pass to its caller.',
      },
      {
        question: 'Method <code>load()</code> is declared with <code>throws IOException</code>. A caller invokes it without a try-catch and without declaring <code>throws</code>. What happens?',
        options: ['It compiles and may fail at runtime', 'It does not compile', 'The exception is ignored', 'A warning is shown but it compiles'],
        answer: 1,
        explanation: 'IOException is a checked exception. The caller must either catch it or declare it, and the compiler enforces this.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between throw and throws?',
        answer: `<code>throw</code> is a statement inside a method body that raises one exception object. <code>throws</code> is part of a method's declaration and lists the exception types the method may let escape to its caller. <code>throw</code> is followed by an instance; <code>throws</code> is followed by one or more class names.`,
      },
      {
        question: 'Should every method that can fail declare throws?',
        answer: `Only for checked exceptions the method does not handle itself; the compiler requires those. Unchecked exceptions such as <code>IllegalArgumentException</code> do not need to be declared, though documenting them is helpful. Declaring a broad <code>throws Exception</code> everywhere defeats the purpose, because it tells the caller nothing about what can actually go wrong.`,
      },
    ],
  },

  'exception-propagation-and-nested-try-blocks': {
    whyItMatters: `An exception rarely needs to be handled in the method where it happens. It travels back up the chain of callers until something catches it, and choosing the right level to catch it at — where there is enough context to respond usefully — is a design skill. Catch too low and you hide the failure; never catch it and the program stops.`,
    exercise: {
      prompt: `<code>stepC</code> throws an exception, which currently crashes the program. Catch it in <code>stepA</code>, the outermost method, and print the message so that the program finishes normally.

Expected output: <code>Failed: boom</code> then <code>A continues</code>`,
      starterCode: `public class Propagation {

    static void stepC() {
        throw new IllegalStateException("boom");
    }

    static void stepB() {
        stepC();
    }

    static void stepA() {
        stepB();
        System.out.println("A continues");
    }

    public static void main(String[] args) {
        stepA();
    }
}`,
      hints: [
        'The exception passes through <code>stepB</code> untouched and reaches <code>stepA</code>, so that is where a try-catch can catch it.',
        'Wrap only the call to <code>stepB()</code> in the try block, so the last print still runs.',
      ],
      solution: `public class Propagation {

    static void stepC() {
        throw new IllegalStateException("boom");
    }

    static void stepB() {
        stepC();
    }

    static void stepA() {
        try {
            stepB();
        } catch (IllegalStateException e) {
            System.out.println("Failed: " + e.getMessage());
        }
        System.out.println("A continues");
    }

    public static void main(String[] args) {
        stepA();
    }
}`,
    },
    quiz: [
      {
        question: 'A method throws an unchecked exception and does not catch it. Where does the exception go?',
        options: ['It is discarded', 'To the garbage collector', 'To the method that called it, and on up the call stack', 'To the next statement'],
        answer: 2,
        explanation: 'The exception propagates to the caller, then to its caller, until a matching catch is found or the thread ends.',
      },
      {
        question: 'Can a checked exception propagate out of a method that neither catches it nor declares it with <code>throws</code>?',
        options: ['Yes, automatically', 'Only inside a loop', 'Only from static methods', 'No, the code does not compile'],
        answer: 3,
        explanation: 'Checked exceptions must be caught or declared at every level. Only unchecked exceptions propagate without a declaration.',
      },
      {
        question: 'An inner try block\'s catch does not match the exception thrown inside it. What happens?',
        options: ['It moves to the enclosing try block\'s catch blocks', 'The exception is lost', 'The inner catch runs anyway', 'The program ends immediately'],
        answer: 0,
        explanation: 'An unmatched exception leaves the inner try and is offered to the catch blocks of the outer try.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is exception propagation?',
        answer: `It is the process by which an exception that is not caught in the method where it was thrown is passed to the calling method, then to that method's caller, and so on up the call stack. Each method on the way is exited. Propagation stops at the first matching catch block; if there is none, the thread terminates.`,
      },
      {
        question: 'What happens to finally blocks while an exception propagates?',
        answer: `They all run. As the stack unwinds, the <code>finally</code> block of each try statement the exception passes through executes before control leaves that method, starting with the innermost. This is what makes finally, and try-with-resources, reliable places for cleanup.`,
      },
    ],
  },

  'final-vs-finally-vs-finalize': {
    whyItMatters: `These three names look related and have nothing to do with each other: a keyword, a block and a deprecated method. Being asked to distinguish them is one of the oldest Java interview questions. The useful part is the last one — understanding why <code>finalize()</code> was abandoned tells you how resources should really be released.`,
    exercise: {
      prompt: `Complete <code>Connection</code> so it can be used in a try-with-resources statement. Its <code>close()</code> method should print <code>closed</code>, and it must be called automatically.

Expected output: <code>open</code>, <code>work</code>, <code>closed</code>`,
      starterCode: `// TODO: make Connection implement AutoCloseable and add close()
class Connection {
    Connection() {
        System.out.println("open");
    }

    void work() {
        System.out.println("work");
    }
}

public class ResourceDemo {
    public static void main(String[] args) {
        try (Connection connection = new Connection()) {
            connection.work();
        }
    }
}`,
      hints: [
        'A class used in try-with-resources must implement <code>AutoCloseable</code>.',
        'Declare <code>public void close()</code> without <code>throws Exception</code>, so the caller needs no catch block.',
      ],
      solution: `class Connection implements AutoCloseable {
    Connection() {
        System.out.println("open");
    }

    void work() {
        System.out.println("work");
    }

    @Override
    public void close() {
        System.out.println("closed");
    }
}

public class ResourceDemo {
    public static void main(String[] args) {
        try (Connection connection = new Connection()) {
            connection.work();
        }
    }
}`,
    },
    quiz: [
      {
        question: 'Which of the three is a block of code attached to a try statement?',
        options: ['final', 'finalize', 'finally', 'None of them'],
        answer: 2,
        explanation: 'finally is the block that runs after try and catch. final is a keyword and finalize() is a method of Object.',
      },
      {
        question: 'What is the status of <code>finalize()</code> in modern Java?',
        options: ['It is the recommended way to release resources', 'It was removed in Java 8', 'It is deprecated and should not be used', 'It is required in every class'],
        answer: 2,
        explanation: 'finalize() has been deprecated since Java 9 and is marked for removal. Use try-with-resources instead.',
      },
      {
        question: 'What does <code>final</code> mean when applied to a local variable?',
        options: ['It is cleaned up automatically', 'It cannot be read', 'It is shared between threads', 'It can be assigned only once'],
        answer: 3,
        explanation: 'A final variable cannot be reassigned after its first assignment.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between final, finally and finalize?',
        answer: `<code>final</code> is a keyword: a final variable cannot be reassigned, a final method cannot be overridden, and a final class cannot be extended. <code>finally</code> is a block that follows try and catch and runs whether or not an exception occurred, used for cleanup. <code>finalize()</code> is a method of <code>Object</code> that the garbage collector could call before reclaiming an object; it is deprecated.`,
      },
      {
        question: 'Why was finalize() deprecated?',
        answer: `Because it is unreliable. There is no guarantee when it runs, or that it runs at all, so it cannot be trusted to release files or connections. It also slows garbage collection and can accidentally keep an object alive. The replacement is to implement <code>AutoCloseable</code> and use try-with-resources, which releases the resource at a known point.`,
      },
    ],
  },

  'exception-handling-rules-with-method-overriding': {
    whyItMatters: `Code that calls a method through a parent reference only prepares for the exceptions the parent declares. If a subclass could throw a new checked exception, that code would break without warning. The overriding rule prevents this, and it explains a compile error that looks strange until you know the reason.`,
    exercise: {
      prompt: `This code does not compile: the override in <code>FileSource</code> declares <code>Exception</code>, which is broader than the <code>IOException</code> declared by the parent. Change the override so that it declares a narrower exception, and the program compiles.

Expected output: <code>file read</code>`,
      starterCode: `import java.io.FileNotFoundException;
import java.io.IOException;

class Source {
    void read() throws IOException {
        System.out.println("source read");
    }
}

class FileSource extends Source {
    @Override
    void read() throws Exception {
        System.out.println("file read");
    }
}

public class OverrideRule {
    public static void main(String[] args) throws IOException {
        Source source = new FileSource();
        source.read();
    }
}`,
      hints: [
        'An override may declare the same checked exception, a subclass of it, or none at all.',
        '<code>FileNotFoundException</code> is a subclass of <code>IOException</code>.',
      ],
      solution: `import java.io.FileNotFoundException;
import java.io.IOException;

class Source {
    void read() throws IOException {
        System.out.println("source read");
    }
}

class FileSource extends Source {
    @Override
    void read() throws FileNotFoundException {
        System.out.println("file read");
    }
}

public class OverrideRule {
    public static void main(String[] args) throws IOException {
        Source source = new FileSource();
        source.read(); // file read
    }
}`,
    },
    quiz: [
      {
        question: 'A parent method declares <code>throws IOException</code>. Which of these may the overriding method declare?',
        options: ['throws FileNotFoundException', 'throws Exception', 'throws SQLException', 'throws Throwable'],
        answer: 0,
        explanation: 'The override may declare the same exception or a subclass. FileNotFoundException is a subclass of IOException.',
      },
      {
        question: 'A parent method declares no exceptions. Can the override throw a <code>RuntimeException</code>?',
        options: ['No', 'Yes, unchecked exceptions are not restricted', 'Only if it is declared with throws', 'Only if the parent is abstract'],
        answer: 1,
        explanation: 'The rule applies only to checked exceptions. An override may throw any unchecked exception.',
      },
      {
        question: 'A parent method declares no exceptions. The override adds <code>throws IOException</code>. What happens?',
        options: ['It compiles', 'It compiles with a warning', 'It does not compile', 'It fails at runtime'],
        answer: 2,
        explanation: 'An override cannot introduce a new checked exception that the parent method did not declare.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the rule for exceptions when overriding a method?',
        answer: `An overriding method may not declare checked exceptions that are new or broader than those declared by the method it overrides. It may declare the same ones, narrower subclasses, fewer, or none. There is no restriction on unchecked exceptions.`,
      },
      {
        question: 'Why does this rule exist?',
        answer: `To keep polymorphism safe. A caller holding a parent-type reference writes its try-catch based on what the parent method declares. If a subclass could throw a broader checked exception, that caller would not be handling it, and the compile-time checking of checked exceptions would be defeated. The subclass must be usable anywhere the parent is.`,
      },
    ],
  },

  'custom-exceptions': {
    whyItMatters: `A generic <code>Exception("error")</code> tells the caller nothing. A named exception such as <code>InsufficientFundsException</code> says exactly what went wrong, can carry the relevant data, and can be caught separately from everything else. Well-chosen custom exceptions make an application's failures part of its design.`,
    exercise: {
      prompt: `Create a checked exception <code>InvalidCouponException</code>. <code>discountFor</code> should return 10 for the code <code>SAVE10</code> and throw the exception for any other code, with a message naming the code.

Expected output: <code>10</code> then <code>Invalid coupon: FREE</code>`,
      starterCode: `// TODO: class InvalidCouponException extends Exception, with a message constructor

public class CouponDemo {

    static int discountFor(String code) throws InvalidCouponException {
        // TODO: return 10 for "SAVE10", otherwise throw the exception
        return 0;
    }

    public static void main(String[] args) {
        try {
            System.out.println(discountFor("SAVE10"));
            System.out.println(discountFor("FREE"));
        } catch (InvalidCouponException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
      hints: [
        'The constructor should pass its message to the parent with <code>super(message);</code>.',
        'Compare strings with <code>equals</code>, not <code>==</code>.',
      ],
      solution: `class InvalidCouponException extends Exception {
    InvalidCouponException(String message) {
        super(message);
    }
}

public class CouponDemo {

    static int discountFor(String code) throws InvalidCouponException {
        if ("SAVE10".equals(code)) {
            return 10;
        }
        throw new InvalidCouponException("Invalid coupon: " + code);
    }

    public static void main(String[] args) {
        try {
            System.out.println(discountFor("SAVE10"));
            System.out.println(discountFor("FREE"));
        } catch (InvalidCouponException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
    },
    quiz: [
      {
        question: 'Which class do you extend to create a checked custom exception?',
        options: ['RuntimeException', 'Object', 'Error', 'Exception'],
        answer: 3,
        explanation: 'A class that extends Exception, but not RuntimeException, is checked: callers must catch or declare it.',
      },
      {
        question: 'How does a custom exception pass its message to the parent class?',
        options: ['By calling super(message) in its constructor', 'By assigning this.message', 'By overriding toString()', 'It happens automatically'],
        answer: 0,
        explanation: 'super(message) stores the message in Throwable, so getMessage() and the stack trace show it.',
      },
      {
        question: 'Which class do you extend to create an unchecked custom exception?',
        options: ['Exception', 'RuntimeException', 'Throwable', 'Error'],
        answer: 1,
        explanation: 'Subclasses of RuntimeException are unchecked and need no throws declaration or catch block.',
      },
    ],
    interviewQuestions: [
      {
        question: 'When should you create a custom exception?',
        answer: `When a failure is specific to your application and callers may want to handle it differently from other errors: an invalid coupon, insufficient funds, a record that was not found. A custom type gives the failure a clear name and can carry extra fields. If a standard exception such as <code>IllegalArgumentException</code> already describes the problem, use that instead.`,
      },
      {
        question: 'What is exception chaining?',
        answer: `Wrapping a low-level exception inside a higher-level one while keeping the original as the cause: <code>throw new OrderFailedException("Could not save order", e);</code>. The caller sees an exception that makes sense at its level, and the stack trace still shows the original problem under "Caused by". Always pass the cause on, or the root reason is lost.`,
      },
    ],
  },

  'checked-vs-unchecked-exceptions': {
    whyItMatters: `Java is unusual in making the compiler enforce handling of some exceptions and not others. Knowing which is which explains why some calls demand a try-catch and others do not, and guides your own design: checked for conditions a caller can reasonably recover from, unchecked for bugs that should be fixed in the code.`,
    exercise: {
      prompt: `This program does not compile, because <code>loadConfig</code> declares a checked exception that <code>main</code> ignores. Handle it in <code>main</code> with a try-catch so the program prints the result for both calls.

Expected output: <code>loaded</code> then <code>Config missing</code>`,
      starterCode: `import java.io.FileNotFoundException;

public class ConfigLoader {

    static String loadConfig(boolean exists) throws FileNotFoundException {
        if (!exists) {
            throw new FileNotFoundException("Config missing");
        }
        return "loaded";
    }

    public static void main(String[] args) {
        System.out.println(loadConfig(true));
        System.out.println(loadConfig(false));
    }
}`,
      hints: [
        'A checked exception must be caught or declared by every caller.',
        'Catch <code>FileNotFoundException</code> and print <code>e.getMessage()</code>.',
      ],
      solution: `import java.io.FileNotFoundException;

public class ConfigLoader {

    static String loadConfig(boolean exists) throws FileNotFoundException {
        if (!exists) {
            throw new FileNotFoundException("Config missing");
        }
        return "loaded";
    }

    public static void main(String[] args) {
        try {
            System.out.println(loadConfig(true));
            System.out.println(loadConfig(false));
        } catch (FileNotFoundException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
    },
    quiz: [
      {
        question: 'Which of these is a checked exception?',
        options: ['NullPointerException', 'ArithmeticException', 'IOException', 'ArrayIndexOutOfBoundsException'],
        answer: 2,
        explanation: 'IOException must be caught or declared. The other three extend RuntimeException and are unchecked.',
      },
      {
        question: 'Which of these is an unchecked exception?',
        options: ['SQLException', 'ClassNotFoundException', 'IOException', 'NullPointerException'],
        answer: 3,
        explanation: 'NullPointerException extends RuntimeException, so the compiler does not require it to be handled.',
      },
      {
        question: 'When is the handling of a checked exception verified?',
        options: ['At compile time, by the compiler', 'At runtime, by the JVM', 'When the class is loaded', 'It is never verified'],
        answer: 0,
        explanation: 'The compiler checks that every checked exception is either caught or declared, which is where the name comes from.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between checked and unchecked exceptions?',
        answer: `Checked exceptions are subclasses of <code>Exception</code> other than <code>RuntimeException</code>. The compiler forces every caller to catch them or declare them with <code>throws</code>. Unchecked exceptions are <code>RuntimeException</code> and its subclasses; they need no declaration or handling. Errors are also unchecked.`,
      },
      {
        question: 'When should an exception be checked and when unchecked?',
        answer: `Use a checked exception for a condition outside the program's control that a caller can reasonably recover from: a file that does not exist, a network that is down. Use an unchecked exception for a programming mistake that should be fixed rather than caught: a null argument, an index out of range, an object in an invalid state.`,
      },
    ],
  },

  'exception-hierarchy': {
    whyItMatters: `A catch block catches the named type and every subclass of it, so the hierarchy decides which block handles which failure and in what order catch blocks must be written. It also separates the problems you should handle — exceptions — from the ones you generally cannot — errors such as running out of memory.`,
    diagram: {
      caption: 'Everything that can be thrown extends Throwable. Checked exceptions are the subclasses of Exception outside the RuntimeException branch.',
      svg: `<svg viewBox="0 0 640 250" role="img" aria-label="Throwable has two subclasses, Error and Exception. Exception has RuntimeException, which is unchecked, and other subclasses such as IOException, which are checked" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-monospace, monospace" font-size="13">
  <rect x="250" y="10" width="140" height="36" rx="6" stroke-width="3"/><text x="320" y="33" text-anchor="middle" fill="currentColor" stroke="none">Throwable</text>
  <path d="M320 46 V66 M150 66 H470 M150 66 V86 M470 66 V86"/>
  <rect x="80" y="86" width="140" height="36" rx="6"/><text x="150" y="109" text-anchor="middle" fill="currentColor" stroke="none">Error</text>
  <rect x="400" y="86" width="140" height="36" rx="6"/><text x="470" y="109" text-anchor="middle" fill="currentColor" stroke="none">Exception</text>
  <text x="150" y="142" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">OutOfMemoryError</text>
  <text x="150" y="158" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">StackOverflowError</text>
  <text x="150" y="178" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">unchecked; do not catch</text>
  <path d="M470 122 V142 M370 142 H570 M370 142 V162 M570 142 V162"/>
  <rect x="290" y="162" width="160" height="36" rx="6"/><text x="370" y="185" text-anchor="middle" fill="currentColor" stroke="none">RuntimeException</text>
  <rect x="500" y="162" width="130" height="36" rx="6"/><text x="565" y="185" text-anchor="middle" fill="currentColor" stroke="none">IOException</text>
  <text x="370" y="216" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">NullPointerException</text>
  <text x="370" y="232" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">unchecked</text>
  <text x="565" y="216" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">checked</text>
  <text x="565" y="232" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">(also SQLException)</text>
</svg>`,
    },
    exercise: {
      prompt: `This code does not compile: the general <code>catch (Exception e)</code> comes first, so the specific catch below it can never be reached. Reorder the catch blocks.

Expected output: <code>Arithmetic problem</code>`,
      starterCode: `public class CatchOrder {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
            System.out.println(result);
        } catch (Exception e) {
            System.out.println("General problem");
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic problem");
        }
    }
}`,
      hints: [
        '<code>ArithmeticException</code> is a subclass of <code>Exception</code>, so the first block already catches it.',
        'List catch blocks from the most specific type to the most general.',
      ],
      solution: `public class CatchOrder {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic problem");
        } catch (Exception e) {
            System.out.println("General problem");
        }
    }
}`,
    },
    quiz: [
      {
        question: 'Which class is at the top of the hierarchy for everything that can be thrown?',
        options: ['Exception', 'Throwable', 'Error', 'RuntimeException'],
        answer: 1,
        explanation: 'Throwable is the root. Its two direct subclasses are Error and Exception.',
      },
      {
        question: '<code>OutOfMemoryError</code> is a subclass of which class?',
        options: ['Exception', 'RuntimeException', 'Error', 'IOException'],
        answer: 2,
        explanation: 'It belongs to the Error branch, which represents serious problems an application is not expected to handle.',
      },
      {
        question: 'Which class does <code>RuntimeException</code> extend directly?',
        options: ['Throwable', 'Error', 'Object', 'Exception'],
        answer: 3,
        explanation: 'RuntimeException is a subclass of Exception, so catch (Exception e) also catches every runtime exception.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between an Error and an Exception?',
        answer: `Both extend <code>Throwable</code>. An <code>Error</code> signals a serious problem in the JVM or the environment, such as <code>OutOfMemoryError</code> or <code>StackOverflowError</code>; an application normally cannot recover and should not try to catch it. An <code>Exception</code> represents a condition an application might reasonably handle, such as a missing file or invalid input.`,
      },
      {
        question: 'Is it a good idea to catch Throwable or Exception?',
        answer: `Rarely. <code>catch (Throwable t)</code> also catches errors such as running out of memory, which you cannot usefully handle. <code>catch (Exception e)</code> swallows unrelated bugs such as a NullPointerException along with the failure you expected. Catch the most specific type you can deal with. A broad catch is acceptable only at the top level of an application, to log the failure and stop cleanly.`,
      },
    ],
  },
}
