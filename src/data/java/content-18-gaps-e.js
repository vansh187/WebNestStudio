// Java exception-handling and multithreading gap-filler module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content18GapsE = {
  'exception-propagation-and-nested-try-blocks': {
    title: 'Exception Propagation and Nested try Blocks',
    intro: `When an exception is thrown inside a method and that method does not catch it, the exception does not simply disappear — it propagates up the call stack, one method frame at a time, until either a matching catch block handles it or the call stack is exhausted and the JVM terminates the thread while printing a stack trace. Understanding this propagation path is essential for deciding where in a chain of method calls exception handling actually belongs.

A related but distinct idea is nested try blocks: placing one try-catch-finally structure entirely inside the try (or catch, or finally) block of another. Nesting lets you handle a narrow, specific failure close to where it happens while still having an outer safety net for anything broader.`,
    sections: [
      {
        heading: 'How Propagation Works Across a Call Chain',
        body: `Consider three methods, A calling B calling C. If C throws an exception and has no try-catch around the risky statement, the JVM immediately stops executing C at that point and looks for a catch block in the calling method, B, around the line that called C. If B also has no matching catch, the exception propagates further up to A. This continues until a catch matches, or until it reaches main with nothing left to propagate to — at which point the JVM's default handler prints the stack trace and terminates that thread. Each stack trace line you see corresponds exactly to one frame this propagation passed through, in order from where the exception was thrown to where it was (or wasn't) caught.`,
        list: [
          'An unhandled exception aborts the remaining statements in the current method immediately — nothing after the throwing line runs.',
          'Propagation is silent until something catches it or the JVM prints the default stack trace; no output appears mid-propagation.',
          'A checked exception must be either caught or declared with <code>throws</code> at every level it passes through uncaught, or the code will not compile.',
        ],
      },
      {
        heading: 'Nested try Blocks',
        body: `A try block can contain another complete try-catch-finally inside it. The inner try is evaluated first for exceptions raised within its own boundary. If the inner catch matches the exception, it handles it there and the outer try is never disturbed. If no inner catch matches, the exception propagates out of the inner structure (after the inner finally, if present, still runs) and is then evaluated against the outer try's catch blocks as if it originated from that point in the outer try.`,
      },
      {
        heading: 'Finally Blocks and Nesting Order',
        body: `Finally blocks always execute during propagation, from the innermost outward, regardless of whether the exception was caught at that level. This guarantees that resource cleanup registered in an inner finally runs even if the exception ultimately gets handled several levels higher up.`,
      },
    ],
    examples: [
      {
        caption: 'An exception thrown in method C propagates through B to a catch in A',
        code: `public class PropagationDemo {

    static void methodC() {
        System.out.println("Inside methodC, about to fail");
        int result = 10 / 0; // ArithmeticException thrown here
        System.out.println("This line never runs");
    }

    static void methodB() {
        System.out.println("Inside methodB, calling methodC");
        methodC(); // no try-catch here, exception just passes through
        System.out.println("This line never runs either");
    }

    static void methodA() {
        System.out.println("Inside methodA, calling methodB");
        try {
            methodB();
        } catch (ArithmeticException e) {
            System.out.println("Caught in methodA: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        methodA();
        System.out.println("Program continues normally after methodA");
    }
}`,
        output: `Inside methodA, calling methodB
Inside methodB, calling methodC
Inside methodC, about to fail
Caught in methodA: / by zero
Program continues normally after methodA`,
      },
      {
        caption: 'Nested try blocks: inner catch handles a specific case, outer catch handles the rest',
        code: `public class NestedTryDemo {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30};

        try {
            System.out.println("Outer try started");

            try {
                System.out.println("Inner try: " + numbers[5]); // ArrayIndexOutOfBoundsException
            } catch (ArithmeticException e) {
                System.out.println("Inner catch handles arithmetic errors only, won't match here");
            } finally {
                System.out.println("Inner finally always runs");
            }

            System.out.println("This line is skipped because the exception propagated out");
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Outer catch handled: " + e.getMessage());
        } finally {
            System.out.println("Outer finally always runs");
        }
    }
}`,
        output: `Outer try started
Inner finally always runs
Outer catch handled: Index 5 out of bounds for length 3
Outer finally always runs`,
      },
    ],
    commonMistakes: [
      'Assuming an exception "disappears" if a method does not catch it — it always propagates upward until caught or until it reaches the JVM default handler.',
      'Forgetting that statements after the throwing line in the same method never execute, even ones that look unrelated to the failure.',
      'Nesting try blocks many levels deep to "handle everything," which makes control flow hard to follow — usually one well-placed try with multiple catch clauses is clearer.',
      'Not realizing an inner finally block runs even when its own try had no matching catch and the exception is still propagating outward.',
    ],
    keyPoints: [
      'An uncaught exception propagates up the call stack, frame by frame, until a matching catch is found or the thread terminates.',
      'Everything after the point of the exception in the throwing method is skipped immediately.',
      'A try block can be nested inside another; the inner catch gets first chance to handle the exception before it reaches the outer catch.',
      'Finally blocks always run during propagation, innermost first, whether or not that level actually caught the exception.',
    ],
  },

  'final-vs-finally-vs-finalize': {
    title: 'Final vs Finally vs finalize()',
    intro: `"final", "finally", and "finalize()" look similar and are a classic source of confusion for Java learners, but they belong to three completely unrelated parts of the language: a keyword that restricts modification, a block that guarantees cleanup code runs, and a deprecated method once tied to garbage collection.

Knowing the difference precisely — not just that "they're different" — is a frequent interview question and also affects real code decisions, especially now that finalize() is deprecated and should not be used in new code.`,
    sections: [
      {
        heading: 'final — a Keyword',
        body: `<code>final</code> is a modifier applied to variables, methods, or classes to restrict change.`,
        list: [
          'A <code>final</code> variable can be assigned exactly once; after that its value (or, for a reference, the object it points to) cannot be reassigned.',
          'A <code>final</code> method cannot be overridden by a subclass.',
          'A <code>final</code> class cannot be extended/subclassed at all (e.g. <code>String</code> and <code>Integer</code> are final classes).',
        ],
      },
      {
        heading: 'finally — a Block',
        body: `<code>finally</code> is a block attached to a try statement (<code>try { ... } finally { ... }</code>, with or without a catch) that is guaranteed to execute after the try block finishes, whether it completed normally, threw an exception, or executed a <code>return</code> statement. It exists specifically for cleanup code — closing files, releasing locks, closing database connections — that must run regardless of what happened in the try block.`,
      },
      {
        heading: 'finalize() — a Deprecated Method',
        body: `<code>finalize()</code> is a protected method defined on <code>Object</code> that the garbage collector historically called on an object right before reclaiming its memory, giving it one last chance to release resources. In practice it was unreliable: there was no guarantee about when, or even if, it would run before the JVM exited, and it made garbage collection slower and harder to reason about. <code>Object.finalize()</code> has been deprecated since Java 9 and was removed from later JDK versions entirely. The modern replacement for deterministic cleanup is try-with-resources together with the <code>AutoCloseable</code> interface, which closes a resource predictably at the end of the try block instead of at some unpredictable future garbage-collection cycle.`,
      },
    ],
    examples: [
      {
        caption: 'final variable, final method, and final class in one file',
        code: `final class ImmutablePoint {           // final class: cannot be extended
    final int x;                       // final field: assigned once, in the constructor
    final int y;

    ImmutablePoint(int x, int y) {
        this.x = x;
        this.y = y;
    }

    final String describe() {          // final method: cannot be overridden
        return "(" + x + ", " + y + ")";
    }
}

public class FinalDemo {
    public static void main(String[] args) {
        ImmutablePoint p = new ImmutablePoint(3, 4);
        System.out.println(p.describe());
    }
}`,
        output: '(3, 4)',
      },
      {
        caption: 'finally always runs, and try-with-resources replaces the old finalize() approach to cleanup',
        code: `public class FinallyVsCleanupDemo {

    static int divide(int a, int b) {
        try {
            return a / b;
        } finally {
            System.out.println("finally block runs even though we are returning");
        }
    }

    public static void main(String[] args) {
        try {
            System.out.println("Result: " + divide(10, 2));
            System.out.println("Result: " + divide(10, 0));
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
        }

        // Modern cleanup pattern: AutoCloseable + try-with-resources (not finalize())
        try (java.io.StringWriter writer = new java.io.StringWriter()) {
            writer.write("hello");
            System.out.println("Wrote: " + writer.toString());
        } catch (java.io.IOException e) {
            System.out.println("IO error: " + e.getMessage());
        }
        // writer.close() is called automatically here, deterministically
    }
}`,
        output: `Result: 5
finally block runs even though we are returning
finally block runs even though we are returning
Caught: / by zero
Wrote: hello`,
      },
    ],
    commonMistakes: [
      'Confusing "final" with "finally" purely because of the similar spelling — one is a modifier, the other is a block.',
      'Relying on finalize() to release important resources like file handles or sockets — it is deprecated, unreliable in timing, and may never run before JVM exit.',
      'Forgetting that a final reference variable only locks the reference itself, not the object\'s internal state — a final List reference can still have elements added to it.',
      'Assuming a finally block can be skipped by a return in the try block — finally still executes before the method actually returns.',
    ],
    keyPoints: [
      'final (keyword): locks a variable\'s value, prevents a method from being overridden, or prevents a class from being subclassed.',
      'finally (block): a section of a try statement that always runs, used for guaranteed cleanup.',
      'finalize() (method): a deprecated Object method once invoked by the garbage collector before object reclamation; do not rely on it.',
      'Use try-with-resources and AutoCloseable for deterministic, modern resource cleanup instead of finalize().',
    ],
  },

  'exception-handling-rules-with-method-overriding': {
    title: 'Exception Handling Rules with Method Overriding',
    intro: `When a subclass overrides a method that declares checked exceptions, Java enforces a specific compatibility rule so that code calling through the superclass reference is never surprised by an exception it wasn't told to expect. This rule only concerns checked exceptions; unchecked exceptions are unrestricted.

Getting this rule wrong is a very common cause of "cannot override" compile errors, especially when a subclass tries to widen the exception contract instead of narrowing or preserving it.`,
    sections: [
      {
        heading: 'The Core Rule',
        body: `An overriding method may not declare a checked exception that is broader (higher up the exception hierarchy) than what the overridden method declared. Specifically, the overriding method is allowed to declare: the exact same checked exception, a subclass of that checked exception, no checked exception at all, or omit the throws clause entirely. It can never declare a new, broader, or unrelated checked exception that the superclass method did not already declare (or a superclass of it).`,
      },
      {
        heading: 'Unchecked Exceptions Are Unrestricted',
        body: `This rule applies only to checked exceptions (those that extend Exception but not RuntimeException). An overriding method is completely free to throw any unchecked exception (RuntimeException and its subclasses) regardless of what the superclass method declares, because unchecked exceptions are never part of a method's compile-time contract in the first place.`,
      },
      {
        heading: 'Why the Rule Exists',
        body: `Polymorphism means code can call a method through a superclass or interface reference without knowing the actual runtime subclass. If an overriding method could throw a broader checked exception, code written against the superclass type — which only prepared to catch the superclass's declared exceptions — could be blindsided by a checked exception it never accounted for. Restricting overrides to the same, narrower, or no checked exceptions preserves that contract.`,
      },
    ],
    examples: [
      {
        caption: 'Invalid override: broadening the checked exception fails to compile',
        code: `import java.io.IOException;

class Reader1 {
    void read() throws IOException {
        System.out.println("Reading with possible IOException");
    }
}

class BadReader extends Reader1 {
    // COMPILE ERROR: Exception is broader than IOException declared by the superclass
    @Override
    void read() throws Exception {
        System.out.println("Not allowed to widen the checked exception");
    }
}`,
        output: 'Compile-time error: "read() in BadReader cannot override read() in Reader1; overridden method does not throw java.lang.Exception"',
      },
      {
        caption: 'Valid overrides: same, narrower (subclass), none, and any unchecked exception freely',
        code: `import java.io.FileNotFoundException;
import java.io.IOException;

class Reader2 {
    void read() throws IOException {
        System.out.println("Base reader");
    }
}

class SameException extends Reader2 {
    @Override
    void read() throws IOException { // same checked exception: allowed
        System.out.println("Same exception type");
    }
}

class NarrowerException extends Reader2 {
    @Override
    void read() throws FileNotFoundException { // subclass of IOException: allowed
        System.out.println("Narrower checked exception");
    }
}

class NoCheckedException extends Reader2 {
    @Override
    void read() { // no throws clause at all: allowed
        System.out.println("No checked exception declared");
    }
}

class UncheckedIsFree extends Reader2 {
    @Override
    void read() { // free to throw ANY unchecked exception, undeclared
        System.out.println("About to throw an unchecked exception");
        throw new IllegalStateException("Unchecked exceptions bypass this rule entirely");
    }
}

public class OverrideExceptionDemo {
    public static void main(String[] args) throws IOException {
        Reader2[] readers = { new SameException(), new NarrowerException(), new NoCheckedException() };
        for (Reader2 r : readers) {
            r.read();
        }

        try {
            new UncheckedIsFree().read();
        } catch (IllegalStateException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}`,
        output: `Same exception type
Narrower checked exception
No checked exception declared
About to throw an unchecked exception
Caught: Unchecked exceptions bypass this rule entirely`,
      },
    ],
    commonMistakes: [
      'Trying to declare a broader checked exception in an override (e.g. overriding a method that throws IOException with one that throws Exception) — this is always a compile error.',
      'Assuming this rule restricts unchecked exceptions too — RuntimeException subtypes can be thrown from an override with no declaration at all.',
      'Forgetting that declaring no throws clause in the override is always legal, even if the superclass method declared checked exceptions.',
      'Confusing "narrower exception" with "fewer exceptions" — declaring a subclass of the original exception type is what matters, not just declaring less text.',
    ],
    keyPoints: [
      'An override can throw the same checked exception, a subclass of it, or no checked exception at all — never a broader one.',
      'Overriding methods can throw any unchecked exception freely, regardless of the superclass method\'s throws clause.',
      'The rule protects code that calls a method through a superclass or interface reference from unexpected checked exceptions.',
      'Violating this rule is caught at compile time, not at runtime.',
    ],
  },

  'daemon-threads-thread-naming-and-start-vs-run': {
    title: 'Daemon Threads, Thread Naming, and start() vs run()',
    intro: `Every Thread object in Java carries some housekeeping details beyond the code it runs: whether it is a daemon or user thread, and what name it has for identification. Separately, one of the most common beginner mistakes in Java multithreading is calling a Thread's run() method directly instead of start() — the two look similar but behave completely differently.

This topic ties these threading fundamentals together, since daemon status and naming are both configured on a Thread before it is started, and understanding start() vs run() is a prerequisite for everything else in concurrent Java.`,
    sections: [
      {
        heading: 'Daemon Threads',
        body: `A daemon thread is a background, low-priority thread that the JVM does not wait for when deciding whether to shut down — the JVM exits once all non-daemon (user) threads finish, terminating any remaining daemon threads abruptly. The garbage collector's own internal threads are classic examples of daemon threads: useful, but not something the JVM should wait on before exiting. A thread is marked as a daemon by calling <code>setDaemon(true)</code>, and this must be done before the thread is started — calling it after <code>start()</code> throws <code>IllegalThreadStateException</code>. A thread also inherits daemon status from its creating thread by default.`,
      },
      {
        heading: 'Naming Threads',
        body: `Every Thread has a name, retrievable with <code>getThread().getName()</code> or, inside the thread itself, <code>Thread.currentThread().getName()</code>. If you don't set one explicitly, the JVM auto-generates a name like "Thread-0", "Thread-1", and so on, in creation order. You can assign a meaningful name either through the constructor (<code>new Thread(runnable, "Worker-1")</code>) or with <code>setName("Worker-1")</code> before or after starting — unlike daemon status, the name can be changed at any point in the thread's life. Meaningful names make debugging and log inspection far easier when several threads run concurrently.`,
      },
      {
        heading: 'start() vs run()',
        body: `Calling <code>thread.start()</code> asks the JVM to allocate a new call stack and actually begin concurrent execution; the JVM then invokes that thread's run() method on the new thread. Calling <code>thread.run()</code> directly, on the other hand, is just an ordinary method call — it executes run()'s code synchronously on whichever thread made the call (often the main thread), with no new thread created at all and no concurrency gained. This is the single most common misunderstanding for beginners: code that "runs" without error when run() is called directly looks correct but never actually goes multithreaded.`,
        list: [
          '<code>start()</code> — creates a new thread of execution, then that new thread executes run().',
          '<code>run()</code> — an ordinary synchronous method call, executed on the calling thread; no new thread is created.',
          'Calling <code>start()</code> a second time on the same Thread object throws <code>IllegalThreadStateException</code> — a Thread object can only ever be started once.',
        ],
      },
    ],
    examples: [
      {
        caption: 'start() creates a real new thread, while run() executes synchronously on the caller (note: exact thread scheduling order can vary between runs)',
        code: `public class StartVsRunDemo {
    public static void main(String[] args) {
        Thread worker = new Thread(() -> {
            System.out.println("Inside worker, running on: " + Thread.currentThread().getName());
        }, "Worker-1");

        System.out.println("Main thread is: " + Thread.currentThread().getName());

        System.out.println("Calling run() directly:");
        worker.run(); // NOT a new thread -- executes synchronously on main

        Thread worker2 = new Thread(() -> {
            System.out.println("Inside worker2, running on: " + Thread.currentThread().getName());
        }, "Worker-2");

        System.out.println("Calling start():");
        worker2.start(); // creates and runs on an actual new thread
    }
}`,
        output: `Main thread is: main
Calling run() directly:
Inside worker, running on: main
Calling start():
Inside worker2, running on: Worker-2`,
      },
      {
        caption: 'Daemon thread flag, thread naming, and the exception from starting a thread twice',
        code: `public class DaemonAndNamingDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread background = new Thread(() -> {
            System.out.println(Thread.currentThread().getName() + " is a daemon: "
                    + Thread.currentThread().isDaemon());
        });
        background.setName("BackgroundLogger");
        background.setDaemon(true); // must be set before start()
        background.start();
        background.join();

        Thread task = new Thread(() -> System.out.println("Task ran once"));
        task.start();
        try {
            task.start(); // starting the same Thread object twice
        } catch (IllegalThreadStateException e) {
            System.out.println("Caught: " + e.getClass().getSimpleName());
        }
    }
}`,
        output: `BackgroundLogger is a daemon: true
Task ran once
Caught: IllegalThreadStateException`,
      },
    ],
    commonMistakes: [
      'Calling thread.run() expecting concurrent execution — it just runs synchronously on the calling thread with no new thread involved.',
      'Calling setDaemon(true) after the thread has already been started, which throws IllegalThreadStateException.',
      'Calling start() twice on the same Thread instance, not realizing each Thread object can only transition from "new" to "running" once.',
      'Assuming default thread names ("Thread-0", "Thread-1"...) are informative in production logs, instead of setting meaningful names for easier debugging.',
    ],
    keyPoints: [
      'Daemon threads do not keep the JVM alive; setDaemon(true) must be called before start().',
      'Threads get an auto-generated name unless you set one explicitly via the constructor or setName().',
      'start() creates a genuinely new thread of execution; run() is just a normal, synchronous method call on the current thread.',
      'A Thread object can be started only once — calling start() again throws IllegalThreadStateException.',
    ],
  },

  'thread-scheduler-threadgroup-and-shutdown-hooks-in-java': {
    title: 'Thread Scheduler, ThreadGroup, and Shutdown Hooks in Java',
    intro: `Beyond creating and starting threads, Java programs interact with a few lower-level concurrency mechanisms less often discussed in basic tutorials: the thread scheduler that decides which runnable thread actually gets CPU time, the largely legacy ThreadGroup class for organizing related threads, and shutdown hooks that let a program run cleanup logic as the JVM is exiting.

None of these give you fine-grained control over execution order — quite the opposite, they mostly reinforce that Java multithreading is fundamentally non-deterministic in scheduling, and code should never be written to depend on a specific thread execution order unless it uses explicit synchronization to enforce one.`,
    sections: [
      {
        heading: 'The Thread Scheduler',
        body: `The thread scheduler is the part of the JVM (in cooperation with the underlying operating system) responsible for deciding which of the currently runnable threads actually executes on the CPU at any given moment, and for how long. Java does not specify a single guaranteed scheduling algorithm — behavior depends on the JVM implementation, the OS, the number of CPU cores, and thread priorities (which are only a hint, not a guarantee). This means the exact interleaving of output from multiple threads can differ between runs, between machines, and even between executions on the same machine. Code that needs a specific order between threads must use explicit coordination — such as join(), locks, or higher-level concurrency utilities — rather than assuming the scheduler will behave any particular way.`,
      },
      {
        heading: 'ThreadGroup',
        body: `A <code>ThreadGroup</code> represents a set of threads (and can itself contain other thread groups), historically intended to let you manage and apply operations like interrupt() to many related threads at once, and to organize threads for security and monitoring purposes. Every thread belongs to exactly one ThreadGroup, defaulting to its creating thread's group if none is specified. In modern Java, ThreadGroup is considered largely legacy — many of its bulk-control methods are unreliable or deprecated, and newer concurrency utilities like the <code>java.util.concurrent</code> package (executor services, thread pools) are preferred for organizing and managing groups of threads in real applications.`,
      },
      {
        heading: 'Shutdown Hooks',
        body: `A shutdown hook is a Thread registered with <code>Runtime.getRuntime().addShutdownHook(Thread hook)</code> that the JVM starts running when it begins an orderly shutdown — whether triggered by the last non-daemon thread finishing, a call to <code>System.exit()</code>, or an external interrupt signal like Ctrl+C. Shutdown hooks are commonly used for cleanup tasks such as flushing logs, closing database connections, or releasing external resources before the process actually terminates. They are not guaranteed to run if the JVM is killed forcibly (for example, <code>kill -9</code> on Unix), since that bypasses the JVM's normal shutdown sequence entirely.`,
      },
    ],
    examples: [
      {
        caption: 'Two threads racing with no coordination — output order is not guaranteed and can vary between runs',
        code: `public class SchedulerDemo {
    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 1; i <= 2; i++) {
                System.out.println(Thread.currentThread().getName() + " -> " + i);
            }
        };

        Thread t1 = new Thread(task, "T1");
        Thread t2 = new Thread(task, "T2");
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println("Both threads finished");
    }
}`,
        output: `(Order of T1 and T2 lines is NOT guaranteed and can vary between runs -- the scheduler decides interleaving.
One valid run might print:)
T1 -> 1
T1 -> 2
T2 -> 1
T2 -> 2
Both threads finished`,
      },
      {
        caption: 'Registering a shutdown hook that runs cleanup logic when the JVM exits',
        code: `public class ShutdownHookDemo {
    public static void main(String[] args) {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutdown hook running: closing resources before exit");
        }));

        System.out.println("Main work starting");
        System.out.println("Main work finished, JVM will now shut down");
        // No explicit System.exit() needed -- normal completion also triggers shutdown hooks
    }
}`,
        output: `Main work starting
Main work finished, JVM will now shut down
Shutdown hook running: closing resources before exit`,
      },
    ],
    commonMistakes: [
      'Writing code that depends on a specific thread execution order without using join(), locks, or another explicit coordination mechanism.',
      'Assuming thread priority guarantees execution order — priority is only a scheduling hint and its effect varies by platform.',
      'Relying on ThreadGroup for serious thread management in new code instead of java.util.concurrent executor services, which are more robust and flexible.',
      'Expecting a shutdown hook to run after a forced kill (e.g. kill -9) — that bypasses the JVM\'s normal shutdown sequence entirely.',
    ],
    keyPoints: [
      'The thread scheduler decides which runnable thread executes when; its behavior is non-deterministic and platform-dependent.',
      'Never rely on a specific interleaving of threads unless it is enforced through explicit synchronization or coordination.',
      'ThreadGroup groups related threads together but is largely legacy compared to modern java.util.concurrent tools.',
      'Runtime.getRuntime().addShutdownHook() registers cleanup code that runs during an orderly JVM shutdown, but not after a forced kill.',
    ],
  },

  'multitasking-vs-multithreading-in-java': {
    title: 'Multitasking vs Multithreading in Java',
    intro: `Multitasking and multithreading both describe doing more than one thing "at once," but they operate at different levels of the operating system, and Java's Thread API specifically targets the second one. Understanding the distinction clarifies why threads are described as "lightweight" compared to processes.`,
    sections: [
      {
        heading: 'Process-Based Multitasking',
        body: `Process-based multitasking means the operating system runs multiple independent programs (processes) at the same time — for example, a web browser and an IDE running simultaneously on your machine. Each process has its own separate memory space, its own set of system resources, and its own address space that other processes cannot directly access. Communication between processes (inter-process communication) requires explicit mechanisms like sockets, pipes, or files, because processes do not share memory by default. Starting a new process and switching the CPU between processes is relatively expensive for the operating system.`,
      },
      {
        heading: 'Thread-Based Multitasking (Multithreading)',
        body: `Thread-based multitasking, or multithreading, means multiple threads run concurrently within a single process. All threads in that process share the same memory space — the same heap, the same static fields, the same open file handles — while each thread still keeps its own call stack and program counter. This shared memory makes communication between threads trivial (they can simply read and write the same objects), but it is also exactly why multithreaded code needs careful synchronization: two threads can otherwise interfere with each other while accessing the same data at the same time.`,
      },
      {
        heading: 'Why Threads Are Lighter Than Processes',
        body: `Creating a new process requires the operating system to allocate an entirely new memory space and duplicate a range of OS-level resources, which is comparatively slow and resource-intensive. Creating a new thread within an existing process only requires a new stack and some thread-local bookkeeping, because it reuses the process's existing memory space and resources. This is why thread creation and context switching between threads is considerably cheaper than process creation and context switching, and why a single Java application can comfortably run many threads (for example, one per client connection in a server) but would struggle to spawn a comparable number of separate processes.`,
      },
    ],
    examples: [
      {
        caption: 'Multiple threads within one Java process sharing the same memory (a static counter)',
        code: `public class MultithreadingDemo {
    static int sharedCounter = 0; // shared memory: visible to every thread in this process

    public static void main(String[] args) throws InterruptedException {
        Runnable incrementTask = () -> {
            for (int i = 0; i < 1000; i++) {
                synchronized (MultithreadingDemo.class) {
                    sharedCounter++;
                }
            }
        };

        Thread t1 = new Thread(incrementTask, "T1");
        Thread t2 = new Thread(incrementTask, "T2");
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        // Both threads incremented the SAME shared variable -- this is only
        // possible because threads of one process share memory.
        System.out.println("Final counter value: " + sharedCounter);
    }
}`,
        output: 'Final counter value: 2000',
      },
    ],
    commonMistakes: [
      'Using "multitasking" and "multithreading" interchangeably in explanations, when they describe different units of concurrency (processes vs threads).',
      'Assuming threads in the same process are as isolated as separate processes — they share memory, so unsynchronized access to shared data can cause race conditions.',
      'Underestimating process creation cost and spawning many separate JVM processes instead of using threads or a thread pool within one process.',
      'Forgetting that while threads share heap memory, each thread still has its own separate call stack and local variables.',
    ],
    keyPoints: [
      'Process-based multitasking runs multiple independent programs, each with its own isolated memory space.',
      'Thread-based multitasking (multithreading) runs multiple threads within one process, sharing the same memory space.',
      'Shared memory makes inter-thread communication easy but requires synchronization to avoid data corruption.',
      'Threads are more lightweight than processes because they reuse the process\'s existing memory and resources instead of allocating new ones.',
    ],
  },

  'advanced-synchronization-reentrant-locks-and-interrupting-threads': {
    title: 'Advanced Synchronization: Reentrant Locks and Interrupting Threads',
    intro: `Beyond a basic synchronized method, Java's built-in locking model has several nuances worth understanding in depth: the difference between synchronizing a whole method versus a specific block, how static synchronization differs from instance-level synchronization, the fact that Java's intrinsic locks are reentrant, and the cooperative (rather than forceful) way Java expects you to cancel a running thread.`,
    sections: [
      {
        heading: 'Synchronized Method vs Synchronized Block',
        body: `Marking an entire method as <code>synchronized</code> locks on <code>this</code> (for instance methods) for the whole method body, which can be coarser than necessary if only part of the method touches shared state. A <code>synchronized</code> block, written as <code>synchronized (lockObject) { ... }</code>, lets you lock on a specific object and cover only the critical section that actually needs protection, leaving the rest of the method free of locking overhead. This finer granularity can reduce contention between threads that don't actually need to block each other.`,
      },
      {
        heading: 'Static Synchronization',
        body: `A <code>synchronized</code> static method locks on the Class object itself (e.g. <code>MyClass.class</code>), not on any particular instance. Because there is only one Class object per loaded class, this lock is shared across all instances and all threads calling that static method, regardless of which object (if any) they are otherwise working with. This is distinct from instance-level synchronized methods, where each object has its own separate lock — a thread synchronized on one instance does not block a thread synchronized on a different instance of the same class.`,
      },
      {
        heading: 'Reentrant Locks',
        body: `Java's intrinsic (built-in) locks — the ones used by the <code>synchronized</code> keyword — are reentrant, meaning a thread that already holds a lock can acquire that same lock again (for example, by calling another synchronized method on the same object from inside a synchronized method) without deadlocking itself. The JVM tracks how many times the current thread has acquired the lock and only releases it once that count returns to zero. Without reentrancy, common patterns like one synchronized method calling another synchronized method on the same object would immediately deadlock.`,
      },
      {
        heading: 'Interrupting Threads',
        body: `Java does not provide a safe way to forcibly stop another thread — <code>Thread.stop()</code> exists but is deprecated and dangerous, because it can release locks at an inconsistent state and leave shared objects corrupted. Instead, Java uses cooperative cancellation: calling <code>thread.interrupt()</code> sets an internal interrupted flag on the target thread and, if that thread is currently blocked in a method like <code>sleep()</code> or <code>wait()</code>, causes an <code>InterruptedException</code> to be thrown there. A running thread should periodically check <code>Thread.currentThread().isInterrupted()</code> (or catch <code>InterruptedException</code>) and voluntarily exit its work when it sees the flag set — the thread itself decides when it is safe to stop, rather than being killed mid-operation from outside.`,
      },
    ],
    examples: [
      {
        caption: 'Reentrant locking: a synchronized method safely calls another synchronized method on the same object',
        code: `public class ReentrantLockDemo {
    synchronized void outer() {
        System.out.println("Inside outer(), lock held once");
        inner(); // re-acquiring the SAME lock on 'this' -- allowed because it's reentrant
    }

    synchronized void inner() {
        System.out.println("Inside inner(), lock re-acquired without deadlock");
    }

    public static void main(String[] args) {
        new ReentrantLockDemo().outer();
    }
}`,
        output: `Inside outer(), lock held once
Inside inner(), lock re-acquired without deadlock`,
      },
      {
        caption: 'Cooperative cancellation with interrupt() instead of the unsafe Thread.stop()',
        code: `public class InterruptDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            int count = 0;
            while (!Thread.currentThread().isInterrupted()) {
                count++;
                if (count == 5) {
                    System.out.println("Worker reached checkpoint, still running");
                }
                if (count > 1_000_000) break; // safety valve for this example
            }
            System.out.println("Worker noticed interruption and is exiting cleanly");
        });

        worker.start();
        Thread.sleep(50); // let the worker run for a bit
        worker.interrupt(); // cooperative request to stop, NOT a forced kill
        worker.join();
        System.out.println("Main thread confirms worker has finished");
    }
}`,
        output: `Worker reached checkpoint, still running
Worker noticed interruption and is exiting cleanly
Main thread confirms worker has finished`,
      },
    ],
    commonMistakes: [
      'Assuming a synchronized instance method and a synchronized static method in the same class share a lock — they do not; one locks on the instance, the other on the Class object.',
      'Believing Java\'s intrinsic locks are non-reentrant and manually working around imagined self-deadlock, when calling another synchronized method on the same object from within one is actually safe.',
      'Using the deprecated Thread.stop() to cancel a thread, risking corrupted shared state because it can release locks mid-operation.',
      'Calling interrupt() and assuming the target thread stops immediately — it only sets a flag or triggers InterruptedException at a blocking call; the thread must cooperate by checking and responding to it.',
    ],
    keyPoints: [
      'A synchronized block can lock on a specific object for finer-grained control than locking an entire synchronized method.',
      'Static synchronized methods lock on the Class object, sharing that lock across all instances; instance synchronized methods lock per-object.',
      'Java\'s intrinsic locks are reentrant — a thread holding a lock can re-enter another synchronized section guarded by the same lock without deadlocking.',
      'Thread cancellation in Java is cooperative via interrupt()/isInterrupted(); the deprecated, unsafe Thread.stop() should never be used.',
    ],
  },
}
