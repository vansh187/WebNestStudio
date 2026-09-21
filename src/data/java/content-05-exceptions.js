// Exception Handling module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content05Exceptions = {
  'exception-handling-basics': {
    title: 'Exception Handling Basics',
    intro: `An exception is an event that disrupts the normal flow of a program's instructions, occurring during execution because of something abnormal — a missing file, an invalid array index, dividing by zero, or a null reference being used. Instead of letting the program crash immediately with no explanation, Java represents this event as an object and gives you a structured mechanism to detect it, react to it, and keep the rest of the program running safely.

Java forces you to deal with certain categories of exceptions at compile time. This is a deliberate design decision, not an accident: Sun Microsystems wanted large, long-lived Java programs to fail predictably and recoverably rather than silently or catastrophically. When a method can encounter a condition it cannot resolve on its own — a network call timing out, a file that doesn't exist — Java requires that this possibility be visible in the code, either by handling it or explicitly declaring it, so it can never be "forgotten" by whoever calls that method.`,
    sections: [
      {
        heading: 'Why Exceptions Exist',
        body: `Without exceptions, error handling would rely on return codes (like -1 or null) that calling code could easily ignore. Exceptions separate the error-handling logic from the normal logic of a program: the code that detects a problem does not need to know how to fix it, and the code that knows how to recover does not need to be tangled into every line where a failure might occur.`,
        list: [
          '<strong>Detection</strong> — the JVM or your code identifies an abnormal condition and creates an exception object describing it.',
          '<strong>Propagation</strong> — if not handled immediately, the exception travels up the call stack, unwinding method calls until something catches it.',
          '<strong>Handling</strong> — a catch block (or the JVM itself, as a last resort) processes the exception, potentially recovering, logging, or terminating gracefully.',
        ],
      },
      {
        heading: 'What Happens Without Handling',
        body: `If an exception is never caught anywhere in the call stack, it reaches the JVM's default handler, which prints a stack trace to the console (showing the exception type, its message, and the exact sequence of method calls that led to it) and terminates that thread. This is why unhandled exceptions in a program's main method cause it to stop and print a trace instead of continuing.`,
      },
    ],
    examples: [
      {
        caption: 'An unhandled exception versus a caught one',
        code: `public class BasicsDemo {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30};

        try {
            System.out.println(numbers[5]); // invalid index
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught: " + e.getMessage());
        }

        System.out.println("Program continues normally.");
    }
}`,
        output: `Caught: Index 5 out of bounds for length 3
Program continues normally.`,
      },
    ],
    commonMistakes: [
      'Assuming an exception automatically stops the whole program — only an uncaught exception on a given thread does that; a caught one lets execution continue.',
      'Treating exceptions as "just errors to avoid" instead of a structured signal that something specific and identifiable went wrong.',
      'Ignoring the stack trace and only reading the exception message — the trace tells you exactly where the failure originated.',
    ],
    keyPoints: [
      'An exception is an object representing an abnormal event that disrupts normal program flow.',
      'Unhandled exceptions propagate up the call stack until caught, or reach the JVM and terminate the thread with a stack trace.',
      'Java requires certain exceptions to be handled or declared, forcing failure paths to be visible in code rather than silently ignored.',
    ],
  },

  'try-catch-and-finally': {
    title: 'try, catch, and finally',
    intro: `The try-catch-finally construct is the core syntax Java provides for handling exceptions. Code that might throw an exception is placed inside a try block, the recovery logic goes in one or more catch blocks matched by exception type, and a finally block holds cleanup code that must run no matter what happened.`,
    sections: [
      {
        heading: 'Multiple catch Blocks and Multi-catch',
        body: `A single try block can be followed by several catch blocks, each handling a different exception type; Java checks them in order and executes the first one whose type matches (or is a superclass of) the thrown exception, so more specific exception types must be listed before more general ones. When two or more exception types should be handled identically, Java lets you combine them into one multi-catch block using a pipe: <code>catch (IOException | SQLException e)</code>. This avoids duplicating the same handling code, but the exception types in a multi-catch must not be related by inheritance to each other.`,
      },
      {
        heading: 'The finally Block',
        body: `Code inside finally runs after the try block completes, regardless of whether an exception was thrown, whether it was caught, or even whether the try or catch block executed a <code>return</code> statement. This makes finally the correct place for cleanup that absolutely must happen — closing a file, releasing a lock, or closing a database connection — because it runs in almost every circumstance, including when the method is about to return a value.`,
      },
      {
        heading: 'try-with-resources',
        body: `Manually closing resources in a finally block is verbose and error-prone. Java's try-with-resources statement automatically closes any resource that implements the <code>AutoCloseable</code> interface once the try block finishes, whether normally or via an exception — you declare the resource inside the parentheses of the try statement itself, and no explicit finally or close() call is needed.`,
        list: [
          '<code>try (FileReader fr = new FileReader("data.txt")) { ... }</code> closes <code>fr</code> automatically.',
          'Resources are closed in reverse order of declaration if multiple are opened in one try-with-resources.',
          'The resource variable is implicitly final and closed even if an exception occurs inside the try block.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Multiple catch blocks with finally, and finally running even with a return',
        code: `public class TryCatchDemo {
    static int divide(int a, int b) {
        try {
            return a / b;
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
            return -1;
        } finally {
            System.out.println("finally always runs");
        }
    }

    public static void main(String[] args) {
        System.out.println("Result: " + divide(10, 0));
        System.out.println("Result: " + divide(10, 2));
    }
}`,
        output: `Caught: / by zero
finally always runs
Result: -1
finally always runs
Result: 5`,
      },
    ],
    commonMistakes: [
      'Ordering catch blocks so a general type (like Exception) comes before a more specific one — this makes the specific catch block unreachable and is a compile error.',
      'Assuming finally is skipped when a try or catch block returns a value — finally still executes before the method actually returns.',
      'Manually closing resources in finally instead of using try-with-resources, which is shorter and closes resources even if the close() call itself would throw.',
      'Combining unrelated recovery logic into one catch block using multi-catch when each exception actually needs different handling.',
    ],
    keyPoints: [
      'catch blocks are checked in order; more specific exception types must precede more general ones.',
      'finally always runs after try/catch, even when a return statement is executed inside them.',
      'try-with-resources automatically closes any AutoCloseable resource, removing the need for manual cleanup in finally.',
      'Multi-catch (catch (TypeA | TypeB e)) lets one block handle several unrelated exception types identically.',
    ],
  },

  'throw-and-throws': {
    title: 'throw and throws',
    intro: `throw and throws look similar but do entirely different jobs. <code>throw</code> is a statement used inside a method body to actually raise an exception at a specific point in the code. <code>throws</code> is a declaration used in a method's signature to announce that the method might propagate a particular checked exception to its caller, without handling it itself.`,
    sections: [
      {
        heading: 'The throw Statement',
        body: `<code>throw</code> is followed by a single exception object, and it immediately transfers control out of the current method, just like a return statement, except it hands control to the nearest matching catch block instead of the caller's next line. You can throw a newly created exception (<code>throw new IllegalArgumentException("invalid input")</code>) or re-throw one you already caught. Execution after a throw statement in the same block is unreachable and will not compile if it consists of ordinary statements.`,
      },
      {
        heading: 'The throws Declaration',
        body: `<code>throws</code> appears after a method's parameter list and lists one or more checked exception types the method does not handle internally, forcing any caller to either catch them or declare them further up the call chain. This is how the compiler enforces that checked exceptions are never silently dropped anywhere in a call chain. Unchecked exceptions (RuntimeException and its subclasses) never need to be declared with throws, although you are allowed to document them that way for clarity.`,
        list: [
          '<code>throw</code>: a statement, appears in a method body, throws exactly one exception instance.',
          '<code>throws</code>: a declaration, appears in a method signature, lists one or more exception types.',
          'A method that calls another method declaring <code>throws</code> must catch that exception or declare it too.',
        ],
      },
    ],
    examples: [
      {
        caption: 'throw inside a method, and throws propagating a checked exception to the caller',
        code: `import java.io.IOException;

public class ThrowThrowsDemo {

    static void readConfig(boolean fileMissing) throws IOException {
        if (fileMissing) {
            throw new IOException("config.txt not found");
        }
        System.out.println("Config loaded successfully.");
    }

    public static void main(String[] args) {
        try {
            readConfig(true);
        } catch (IOException e) {
            System.out.println("Handled: " + e.getMessage());
        }
    }
}`,
        output: 'Handled: config.txt not found',
      },
    ],
    commonMistakes: [
      'Confusing throw (a statement that raises one exception) with throws (a declaration that lists possible exception types).',
      'Forgetting to add throws to a method signature after it calls another method that declares a checked exception, causing a compile error.',
      'Writing "throw new Exception();" without a message, leaving no useful information for whoever eventually catches it.',
      'Declaring throws Exception broadly instead of the specific checked exception type, hiding what can actually go wrong from callers.',
    ],
    keyPoints: [
      'throw is a statement that raises exactly one exception object at runtime.',
      'throws is part of a method signature, declaring checked exceptions the method does not handle itself.',
      'Only checked exceptions must be declared with throws; unchecked exceptions are optional to declare.',
      'A checked exception must be caught or re-declared at every level of the call chain until something handles it.',
    ],
  },

  'custom-exceptions': {
    title: 'Custom Exceptions',
    intro: `Java's built-in exceptions cover generic problems like invalid arguments or null references, but real applications often have domain-specific failure conditions — an insufficient account balance, an invalid order state, a seat that is already booked. Custom exceptions let you represent these situations as distinct, self-documenting types instead of overloading generic exceptions or plain error codes.`,
    sections: [
      {
        heading: 'Extending Exception vs RuntimeException',
        body: `A custom exception is created by extending an existing exception class. Extending <code>Exception</code> creates a checked exception, forcing every caller to handle it or declare it — appropriate when callers can reasonably be expected to recover, such as a business rule violation that the calling code should specifically respond to. Extending <code>RuntimeException</code> creates an unchecked exception, which callers are not forced to handle — appropriate for programming errors or conditions that indicate a bug rather than an expected, recoverable situation.`,
      },
      {
        heading: 'Calling super(message)',
        body: `A well-designed custom exception provides at least one constructor that accepts a message and passes it to the parent class using <code>super(message)</code>, so that <code>getMessage()</code> works correctly and the message appears in stack traces. It's also good practice to provide a constructor accepting a <code>Throwable cause</code>, passed as <code>super(message, cause)</code>, so the original underlying exception isn't lost when you wrap and re-throw it as your custom type.`,
        list: [
          '<code>public InsufficientFundsException(String message) { super(message); }</code>',
          '<code>public InsufficientFundsException(String message, Throwable cause) { super(message, cause); }</code>',
          'Naming convention: custom exception class names should end in "Exception".',
        ],
      },
      {
        heading: 'When to Make an Exception Checked vs Unchecked',
        body: `Choose checked when failure is an expected, recoverable part of the domain and callers genuinely need to be reminded to handle it — for example, a custom <code>SeatAlreadyBookedException</code> in a booking system, which calling code should catch and respond to (offer another seat). Choose unchecked when the failure represents a violated precondition or programming bug that shouldn't force every caller up the chain to add boilerplate handling, such as a custom <code>InvalidConfigurationException</code> thrown when a developer misconfigures a service at startup.`,
      },
    ],
    examples: [
      {
        caption: 'A checked custom exception used to enforce handling of a business rule',
        code: `class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

public class CustomExceptionDemo {
    static void withdraw(double balance, double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(
                "Cannot withdraw " + amount + "; balance is only " + balance);
        }
        System.out.println("Withdrawal successful: " + amount);
    }

    public static void main(String[] args) {
        try {
            withdraw(100.0, 250.0);
        } catch (InsufficientFundsException e) {
            System.out.println("Transaction failed: " + e.getMessage());
        }
    }
}`,
        output: 'Transaction failed: Cannot withdraw 250.0; balance is only 100.0',
      },
    ],
    commonMistakes: [
      'Extending Throwable directly instead of Exception or RuntimeException, which bypasses standard exception-handling idioms.',
      'Forgetting to call super(message) in the custom exception constructor, so getMessage() returns null and stack traces lose context.',
      'Making every custom exception checked "to be safe," which forces unnecessary try-catch boilerplate throughout the codebase for conditions that aren\'t truly recoverable.',
      'Swallowing the original cause when wrapping an exception, instead of passing it via super(message, cause) so it still appears in the stack trace.',
    ],
    keyPoints: [
      'Extend Exception for a checked custom exception; extend RuntimeException for an unchecked one.',
      'Always provide a constructor that forwards the message (and ideally a cause) to the superclass via super(...).',
      'Use checked exceptions for expected, recoverable domain failures; use unchecked exceptions for programming errors or broken preconditions.',
      'Custom exception class names conventionally end in "Exception" for readability.',
    ],
  },

  'checked-vs-unchecked-exceptions': {
    title: 'Checked vs Unchecked Exceptions',
    intro: `Java splits exceptions into two enforcement categories at compile time: checked exceptions, which the compiler forces you to handle or declare, and unchecked exceptions, which you may handle but are never required to. This distinction is central to writing correct Java code and to understanding why some code compiles without a try-catch while other code refuses to compile without one.`,
    sections: [
      {
        heading: 'Checked Exceptions',
        body: `A checked exception is any class that extends <code>Exception</code> but does not extend <code>RuntimeException</code>. These represent conditions that are outside a program's control but are anticipated as part of normal, correct operation — a file that might not exist, a network connection that might drop, a database that might be unreachable. <code>IOException</code> and <code>SQLException</code> are classic examples. Because the compiler checks for these at compile time, any method that can throw one must either catch it or declare it with <code>throws</code>.`,
      },
      {
        heading: 'Unchecked Exceptions',
        body: `An unchecked exception extends <code>RuntimeException</code> (which itself extends Exception). These typically represent programming mistakes rather than external conditions — dereferencing a null reference (<code>NullPointerException</code>), accessing an invalid array index (<code>ArrayIndexOutOfBoundsException</code>), or dividing an integer by zero (<code>ArithmeticException</code>). The compiler does not force you to catch or declare them, on the theory that a program riddled with such errors should usually be fixed, not defensively wrapped in try-catch everywhere.`,
      },
      {
        heading: 'Choosing and Recognizing Which Applies',
        body: `A simple test: if you can imagine a caller genuinely recovering from the failure as part of normal operation (retry the network call, ask for a different file path), it fits the checked model. If the failure signals that something in the code itself is wrong (an off-by-one bug, a missing null check), it fits the unchecked model. Errors (like <code>OutOfMemoryError</code>) are a separate, third category and are neither checked nor meant to be routinely caught at all.`,
        list: [
          '<strong>Checked example</strong>: <code>IOException</code> — must be caught or declared; represents an anticipated external failure.',
          '<strong>Unchecked example</strong>: <code>NullPointerException</code> — never required to be caught or declared; represents a programming defect.',
          '<strong>Unchecked example</strong>: <code>ArrayIndexOutOfBoundsException</code> — signals an index calculation bug rather than an external condition.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A checked exception requiring handling versus an unchecked one that compiles without any',
        code: `import java.io.IOException;

public class CheckedUncheckedDemo {

    static void mustDeclare() throws IOException { // checked: compiler enforces this
        throw new IOException("disk unavailable");
    }

    static void noDeclarationNeeded() {
        String text = null;
        System.out.println(text.length()); // unchecked: compiles fine, fails at runtime
    }

    public static void main(String[] args) {
        try {
            mustDeclare();
        } catch (IOException e) {
            System.out.println("Checked exception handled: " + e.getMessage());
        }

        try {
            noDeclarationNeeded();
        } catch (NullPointerException e) {
            System.out.println("Unchecked exception handled: NullPointerException");
        }
    }
}`,
        output: `Checked exception handled: disk unavailable
Unchecked exception handled: NullPointerException`,
      },
    ],
    commonMistakes: [
      'Assuming "unchecked" means "cannot be caught" — unchecked exceptions can absolutely be caught, they are simply not required to be.',
      'Declaring "throws Exception" broadly on a method to silence the compiler instead of declaring the specific checked exception actually thrown.',
      'Wrapping every possible NullPointerException in try-catch instead of fixing the underlying null-handling bug that causes it.',
      'Forgetting that RuntimeException itself is a subclass of Exception, so "extends Exception" alone does not guarantee a checked exception.',
    ],
    keyPoints: [
      'Checked exceptions extend Exception (not RuntimeException) and must be caught or declared — e.g. IOException, SQLException.',
      'Unchecked exceptions extend RuntimeException and are never required to be caught or declared — e.g. NullPointerException, ArithmeticException.',
      'Checked exceptions model anticipated external failures; unchecked exceptions typically model programming defects.',
      'Errors form a separate third category and are generally not meant to be caught at all.',
    ],
  },

  'exception-hierarchy': {
    title: 'Exception Hierarchy',
    intro: `Every exception and error in Java descends from a single root class: <code>Throwable</code>. Understanding this hierarchy explains why catch blocks match subclasses, why some exceptions must be declared and others don't, and why catching certain top-level types is considered poor practice.`,
    sections: [
      {
        heading: 'The Throwable Tree',
        body: `<code>Throwable</code> sits at the top and has two direct subclasses: <code>Exception</code> and <code>Error</code>. Exception is further split by whether it extends <code>RuntimeException</code> or not — anything extending RuntimeException is unchecked, and everything else under Exception is checked. This gives Java exceptions a clean three-branch structure.`,
        list: [
          '<code>Throwable</code> — the root of everything that can be thrown or caught.',
          '<code>Throwable → Error</code> — serious, usually unrecoverable JVM-level problems (e.g. <code>OutOfMemoryError</code>, <code>StackOverflowError</code>).',
          '<code>Throwable → Exception</code> — recoverable application-level problems, split into checked and unchecked.',
          '<code>Exception → RuntimeException</code> — the unchecked branch (e.g. <code>NullPointerException</code>, <code>ArithmeticException</code>, <code>ClassCastException</code>).',
          '<code>Exception</code> (direct subclasses outside RuntimeException) — the checked branch (e.g. <code>IOException</code>, <code>SQLException</code>).',
        ],
      },
      {
        heading: 'Why Error Should Generally Not Be Caught',
        body: `<code>Error</code> and its subclasses represent conditions a normal application is not expected to recover from, typically involving the JVM itself running out of a critical resource or reaching an invalid internal state — running out of heap memory, or a stack that has overflowed from runaway recursion. Catching an Error and trying to "handle" it usually just delays an inevitable failure while masking the real problem, and can leave the JVM in an inconsistent state. Catching <code>Throwable</code> broadly is discouraged for the same reason: it silently swallows Errors alongside genuine exceptions, hiding serious problems instead of surfacing them.`,
      },
      {
        heading: 'Why the Hierarchy Matters for catch Blocks',
        body: `Because catch blocks match by type — including any subclass — a catch block for a superclass will also catch every subclass beneath it in the tree. Catching <code>Exception</code> broadly will catch both checked exceptions and every RuntimeException, which is why catch ordering rules (specific before general) exist, and why overly broad catches are usually a design smell: they hide exactly which failure occurred.`,
      },
    ],
    examples: [
      {
        caption: 'Catching a subclass, its checked/unchecked superclass, and observing hierarchy-based matching',
        code: `public class HierarchyDemo {
    public static void main(String[] args) {
        try {
            int[] data = new int[3];
            System.out.println(data[10]); // throws ArrayIndexOutOfBoundsException
        } catch (RuntimeException e) {
            // Catches it because ArrayIndexOutOfBoundsException
            // extends IndexOutOfBoundsException extends RuntimeException
            System.out.println("Caught via RuntimeException: " + e.getClass().getSimpleName());
        }

        try {
            Object obj = "text";
            Integer number = (Integer) obj; // throws ClassCastException
        } catch (Exception e) {
            System.out.println("Caught via Exception: " + e.getClass().getSimpleName());
        }
    }
}`,
        output: `Caught via RuntimeException: ArrayIndexOutOfBoundsException
Caught via Exception: ClassCastException`,
      },
    ],
    commonMistakes: [
      'Writing catch (Throwable t) to "catch everything," which also silently swallows Errors like OutOfMemoryError instead of letting the JVM report them.',
      'Assuming RuntimeException and Error are siblings under Exception — Error is actually a separate branch directly under Throwable, not under Exception at all.',
      'Catching a generic Exception when a specific subclass was intended, hiding which real problem occurred and making debugging harder.',
      'Trying to recover from a StackOverflowError or OutOfMemoryError as if it were an ordinary exception, instead of treating it as a signal to fix the root cause.',
    ],
    keyPoints: [
      'Throwable is the root; its two direct branches are Exception and Error.',
      'Exception splits further into unchecked (RuntimeException and its subclasses) and checked (everything else under Exception).',
      'A catch block matches its declared type and every subclass beneath it in the hierarchy.',
      'Error represents serious JVM-level problems and should generally not be caught or "handled" like an ordinary exception.',
    ],
  },
}
