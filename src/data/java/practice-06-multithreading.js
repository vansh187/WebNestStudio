// Practice blocks for the Multithreading module. Merged onto the lesson entries
// in index.js by slug, so the lesson prose files stay unchanged.
// Exercises use join() or a fixed print order so their output is the same on every run.
export const practice06Multithreading = {
  'multithreading-basics-and-thread-life-cycle': {
    whyItMatters: `Any server handling many requests, or any application that stays responsive while it works, uses threads. Before you can reason about what a thread is doing — or why it appears stuck — you need the vocabulary of its states. A thread dump from a hung production system is simply a list of threads and the state each one is in.`,
    diagram: {
      caption: 'A thread starts as NEW, becomes RUNNABLE when started, may pause in a waiting or blocked state, and ends as TERMINATED.',
      svg: `<svg viewBox="0 0 640 190" role="img" aria-label="Thread life cycle: NEW to RUNNABLE on start; RUNNABLE to and from BLOCKED, WAITING and TIMED_WAITING; RUNNABLE to TERMINATED when run finishes" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-monospace, monospace" font-size="13">
  <rect x="10" y="20" width="100" height="40" rx="6"/><text x="60" y="45" text-anchor="middle" fill="currentColor" stroke="none">NEW</text>
  <path d="M110 40 H200"/><path d="M194 34 L200 40 L194 46"/>
  <text x="155" y="32" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">start()</text>
  <rect x="200" y="20" width="130" height="40" rx="6" stroke-width="3"/><text x="265" y="45" text-anchor="middle" fill="currentColor" stroke="none">RUNNABLE</text>
  <path d="M330 40 H490"/><path d="M484 34 L490 40 L484 46"/>
  <text x="410" y="32" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">run() ends</text>
  <rect x="490" y="20" width="140" height="40" rx="6"/><text x="560" y="45" text-anchor="middle" fill="currentColor" stroke="none">TERMINATED</text>
  <rect x="20" y="130" width="130" height="40" rx="6"/><text x="85" y="155" text-anchor="middle" fill="currentColor" stroke="none">BLOCKED</text>
  <rect x="200" y="130" width="130" height="40" rx="6"/><text x="265" y="155" text-anchor="middle" fill="currentColor" stroke="none">WAITING</text>
  <rect x="380" y="130" width="160" height="40" rx="6"/><text x="460" y="155" text-anchor="middle" fill="currentColor" stroke="none">TIMED_WAITING</text>
  <path d="M225 60 L100 130"/><path d="M108 119 L100 130 L113 128"/>
  <path d="M265 60 V130"/><path d="M259 124 L265 130 L271 124"/>
  <path d="M305 60 L440 130"/><path d="M427 128 L440 130 L433 119"/>
  <text x="140" y="84" text-anchor="end" fill="currentColor" stroke="none" font-size="11">waiting for</text>
  <text x="128" y="98" text-anchor="end" fill="currentColor" stroke="none" font-size="11">a lock</text>
  <text x="273" y="92" fill="currentColor" stroke="none" font-size="11">wait()</text>
  <text x="273" y="106" fill="currentColor" stroke="none" font-size="11">join()</text>
  <text x="420" y="96" fill="currentColor" stroke="none" font-size="11">sleep(ms)</text>
  <text x="320" y="186" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">each of these returns to RUNNABLE when its wait ends</text>
</svg>`,
    },
    exercise: {
      prompt: `Print the state of a thread at two moments: after it has been created but not started, and after it has finished. Use <code>join()</code> to wait for it to finish.

Expected output: <code>NEW</code> then <code>TERMINATED</code>`,
      starterCode: `public class ThreadStates {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> { });

        // TODO: print the state before starting the thread
        // TODO: start it, wait for it to finish, then print the state again
    }
}`,
      hints: [
        '<code>worker.getState()</code> returns one of the <code>Thread.State</code> values.',
        '<code>worker.join()</code> makes the main thread wait until the worker has finished.',
      ],
      solution: `public class ThreadStates {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> { });

        System.out.println(worker.getState()); // NEW
        worker.start();
        worker.join();
        System.out.println(worker.getState()); // TERMINATED
    }
}`,
    },
    quiz: [
      {
        question: 'What state is a thread in after <code>new Thread(task)</code> but before <code>start()</code> is called?',
        options: ['RUNNABLE', 'NEW', 'WAITING', 'BLOCKED'],
        answer: 1,
        explanation: 'A thread object that has been created but not started is in the NEW state.',
      },
      {
        question: 'Which state does a thread enter when it calls <code>Thread.sleep(1000)</code>?',
        options: ['BLOCKED', 'WAITING', 'TIMED_WAITING', 'TERMINATED'],
        answer: 2,
        explanation: 'Waiting with a time limit, as with sleep or a timed wait, is the TIMED_WAITING state.',
      },
      {
        question: 'Can a thread that has reached TERMINATED be started again?',
        options: ['Yes, by calling start() again', 'No; calling start() again throws IllegalThreadStateException', 'Only if it is a daemon thread', 'Only after calling join()'],
        answer: 1,
        explanation: 'A thread can be started exactly once. To run the task again, create a new Thread.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a process and a thread?',
        answer: `A process is a running program with its own memory space; processes are isolated from each other. A thread is a path of execution inside a process. All threads of a process share its heap memory, while each has its own call stack. Threads are cheaper to create and switch between, but sharing memory means they must coordinate access to shared data.`,
      },
      {
        question: 'What are the states of a Java thread?',
        answer: `There are six, defined in <code>Thread.State</code>. NEW: created but not started. RUNNABLE: running or ready to run. BLOCKED: waiting to acquire a lock. WAITING: waiting indefinitely for another thread, after <code>wait()</code> or <code>join()</code>. TIMED_WAITING: waiting for a limited time, after <code>sleep()</code> or a timed wait. TERMINATED: finished.`,
      },
    ],
  },

  'creating-threads-thread-class-vs-runnable': {
    whyItMatters: `There are two ways to define what a thread does, and one mistake that makes neither of them work: calling <code>run()</code> instead of <code>start()</code>. The code runs, prints the right thing, and no second thread was ever created. Knowing the difference, and why <code>Runnable</code> is preferred, is basic to every later topic in concurrency.`,
    exercise: {
      prompt: `Create a thread from a <code>Runnable</code> written as a lambda. The thread prints <code>worker running</code>. The main thread waits for it and then prints <code>main done</code>.

Expected output: <code>worker running</code> then <code>main done</code>`,
      starterCode: `public class FirstThread {
    public static void main(String[] args) throws InterruptedException {
        // TODO: create a Runnable that prints "worker running"
        // TODO: create a Thread for it, start it, and wait for it to finish

        System.out.println("main done");
    }
}`,
      hints: [
        'A Runnable has one method with no arguments, so it can be written as <code>() -> ...</code>.',
        'Without <code>join()</code>, the two lines could appear in either order.',
      ],
      solution: `public class FirstThread {
    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> System.out.println("worker running");
        Thread worker = new Thread(task);
        worker.start();
        worker.join();

        System.out.println("main done");
    }
}`,
    },
    quiz: [
      {
        question: 'What happens when you call <code>thread.run()</code> directly instead of <code>thread.start()</code>?',
        options: ['A new thread runs the task', 'The task runs on the current thread; no new thread is created', 'It does not compile', 'It throws an exception'],
        answer: 1,
        explanation: 'run() is an ordinary method call. Only start() asks the JVM to create a new thread, which then calls run().',
      },
      {
        question: 'Why is implementing <code>Runnable</code> generally preferred over extending <code>Thread</code>?',
        options: ['It runs faster', 'The class stays free to extend another class, and the task is separate from the thread that runs it', 'Runnable threads cannot fail', 'It uses no memory'],
        answer: 1,
        explanation: 'Java allows one superclass, and a Runnable can also be handed to a thread pool rather than tied to one thread.',
      },
      {
        question: 'What happens if <code>start()</code> is called twice on the same Thread object?',
        options: ['The task runs twice', 'The second call is ignored', 'It throws IllegalThreadStateException', 'It does not compile'],
        answer: 2,
        explanation: 'A Thread object can be started only once.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the ways to create a thread in Java?',
        answer: `Extend <code>Thread</code> and override <code>run()</code>, or implement <code>Runnable</code> (often as a lambda) and pass it to a <code>Thread</code>. A third form is <code>Callable</code>, which returns a result and is run through an <code>ExecutorService</code>. In real applications you rarely create threads directly; you submit tasks to a thread pool.`,
      },
      {
        question: 'What is the difference between start() and run()?',
        answer: `<code>start()</code> creates a new thread of execution and returns immediately; the new thread then calls <code>run()</code>. Calling <code>run()</code> yourself executes the method on the calling thread, like any other method, with no concurrency at all.`,
      },
    ],
  },

  'thread-priority-and-sleep': {
    whyItMatters: `<code>Thread.sleep()</code> is the simplest way to pause, and it appears in retries, polling loops and tests. It forces you to deal with <code>InterruptedException</code>, which most beginners swallow incorrectly. Priorities are the opposite case: they look powerful but are only a hint, and relying on them for correctness is a mistake.`,
    exercise: {
      prompt: `Print a countdown from 3 to 1, pausing 200 milliseconds between numbers, and then print <code>Go</code>. Handle the checked exception that <code>sleep</code> can throw.

Expected output: <code>3</code>, <code>2</code>, <code>1</code>, <code>Go</code>`,
      starterCode: `public class Countdown {
    public static void main(String[] args) {
        for (int i = 3; i >= 1; i--) {
            System.out.println(i);
            // TODO: pause for 200 milliseconds, handling InterruptedException
        }
        System.out.println("Go");
    }
}`,
      hints: [
        '<code>Thread.sleep(200)</code> throws the checked <code>InterruptedException</code>, so it needs a try-catch here.',
        'When you catch it, restore the flag with <code>Thread.currentThread().interrupt()</code> rather than ignoring it.',
      ],
      solution: `public class Countdown {
    public static void main(String[] args) {
        for (int i = 3; i >= 1; i--) {
            System.out.println(i);
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
        System.out.println("Go");
    }
}`,
    },
    quiz: [
      {
        question: 'What is the default priority of a new thread created from the main thread?',
        options: ['1', '5', '10', '0'],
        answer: 1,
        explanation: 'A thread inherits the priority of the thread that created it. The main thread has NORM_PRIORITY, which is 5.',
      },
      {
        question: 'What is the valid range for a thread\'s priority?',
        options: ['0 to 100', '1 to 10', '1 to 5', '-1 to 1'],
        answer: 1,
        explanation: 'MIN_PRIORITY is 1 and MAX_PRIORITY is 10. A value outside that range throws IllegalArgumentException.',
      },
      {
        question: 'A thread holding a lock calls <code>Thread.sleep(1000)</code>. What happens to the lock?',
        options: ['It is released for the duration', 'It is kept; sleep does not release locks', 'It is passed to the next thread', 'It is destroyed'],
        answer: 1,
        explanation: 'sleep pauses the thread but keeps every lock it holds, so other threads waiting for that lock stay blocked.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Does a higher priority guarantee that a thread runs first?',
        answer: `No. Priority is a hint to the scheduler, and how it is honoured depends on the operating system. A high-priority thread is likely to get more processor time, but there is no guarantee of order. Code that needs a particular order must use coordination tools such as <code>join()</code>, locks or latches, never priorities.`,
      },
      {
        question: 'What is the difference between sleep() and wait()?',
        answer: `<code>Thread.sleep()</code> is a static method that pauses the current thread for a fixed time and keeps any locks it holds. <code>wait()</code> is called on an object from inside a synchronized block; it releases that object's lock and pauses until another thread calls <code>notify()</code> or <code>notifyAll()</code> on the same object, or a timeout expires.`,
      },
    ],
  },

  'daemon-threads-thread-naming-and-start-vs-run': {
    whyItMatters: `Whether a thread is a daemon decides if the JVM waits for it: a forgotten non-daemon thread keeps an application alive after its work is done, and a daemon thread can be cut off in the middle of writing a file. Giving threads meaningful names costs one line and turns an unreadable thread dump into something you can debug.`,
    exercise: {
      prompt: `Create a thread named <code>loader</code>. Inside it, print the name of the thread that is running the code. After it finishes, print whether it is a daemon thread.

Expected output: <code>loader</code> then <code>false</code>`,
      starterCode: `public class NamedThread {
    public static void main(String[] args) throws InterruptedException {
        // TODO: create a thread whose task prints the current thread's name
        // TODO: name it "loader", start it and wait for it

        // TODO: print whether the thread is a daemon
    }
}`,
      hints: [
        '<code>Thread.currentThread().getName()</code> gives the name of whichever thread is executing that line.',
        'The name can be passed as the second constructor argument: <code>new Thread(task, "loader")</code>.',
      ],
      solution: `public class NamedThread {
    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> System.out.println(Thread.currentThread().getName());
        Thread worker = new Thread(task, "loader");
        worker.start();
        worker.join();

        System.out.println(worker.isDaemon()); // false
    }
}`,
    },
    quiz: [
      {
        question: 'When does the JVM exit?',
        options: ['When main() returns', 'When all non-daemon threads have finished', 'When all daemon threads have finished', 'After 60 seconds of inactivity'],
        answer: 1,
        explanation: 'The JVM keeps running while any user (non-daemon) thread is alive. Daemon threads are abandoned at that point.',
      },
      {
        question: 'What happens if you call <code>setDaemon(true)</code> after the thread has been started?',
        options: ['It becomes a daemon immediately', 'It throws IllegalThreadStateException', 'It is ignored', 'The thread stops'],
        answer: 1,
        explanation: 'The daemon flag must be set before start().',
      },
      {
        question: 'Which of these is a typical daemon thread?',
        options: ['The main thread', 'The garbage collector thread', 'A thread that saves an order to a database', 'A thread created with new Thread() by default'],
        answer: 1,
        explanation: 'Background service threads such as the garbage collector are daemons. Threads you create inherit non-daemon status from main by default.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a daemon thread and a user thread?',
        answer: `A user thread does the application's real work, and the JVM will not exit while any user thread is still running. A daemon thread provides a background service; the JVM does not wait for it and stops it abruptly when the last user thread ends. A thread is a daemon only if <code>setDaemon(true)</code> was called before it started, or if it was created by a daemon thread.`,
      },
      {
        question: 'Why should important work not be done in a daemon thread?',
        answer: `Because a daemon thread can be terminated at any point when the JVM exits, without its <code>finally</code> blocks running. If it was halfway through writing a file or committing a transaction, the work is left incomplete. Daemon threads are suitable only for tasks that are safe to abandon, such as cache cleanup or monitoring.`,
      },
    ],
  },

  'thread-scheduler-threadgroup-and-shutdown-hooks-in-java': {
    whyItMatters: `You do not control when your threads run; the scheduler does, and it makes no promises about order. Accepting that is the starting point for writing correct concurrent code. Shutdown hooks are the practical tool in this lesson: they are how a service closes connections and flushes logs when it is asked to stop.`,
    exercise: {
      prompt: `Register a shutdown hook that prints <code>cleanup</code> when the JVM exits. The main method prints <code>working</code> and then ends normally.

Expected output: <code>working</code> then <code>cleanup</code>`,
      starterCode: `public class ShutdownPractice {
    public static void main(String[] args) {
        // TODO: register a shutdown hook thread that prints "cleanup"

        System.out.println("working");
    }
}`,
      hints: [
        'A shutdown hook is an unstarted Thread passed to <code>Runtime.getRuntime().addShutdownHook(...)</code>.',
        'Do not call <code>start()</code> on the hook yourself; the JVM starts it during shutdown.',
      ],
      solution: `public class ShutdownPractice {
    public static void main(String[] args) {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> System.out.println("cleanup")));

        System.out.println("working");
    }
}`,
    },
    quiz: [
      {
        question: 'Which component decides which runnable thread gets the processor next?',
        options: ['The garbage collector', 'The thread scheduler', 'The compiler', 'The main thread'],
        answer: 1,
        explanation: 'The thread scheduler, part of the JVM working with the operating system, chooses among runnable threads.',
      },
      {
        question: 'Two threads are started one after the other. Is the order in which they run guaranteed?',
        options: ['Yes, in the order they were started', 'No, the scheduler may run them in any order', 'Yes, in order of thread name', 'Only on a single-core machine'],
        answer: 1,
        explanation: 'Start order gives no guarantee about execution order. Use join() or another coordination tool when order matters.',
      },
      {
        question: 'In which case does a shutdown hook NOT run?',
        options: ['The main method ends normally', 'System.exit(0) is called', 'The user presses Ctrl+C', 'The process is killed forcibly or Runtime.halt() is called'],
        answer: 3,
        explanation: 'Hooks run on an orderly shutdown. A forced kill or Runtime.halt() stops the JVM immediately without running them.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a shutdown hook used for?',
        answer: `For cleanup that must happen when the application stops: closing database connections, flushing buffered logs, releasing a lock file, or telling other services it is leaving. It is a thread registered with <code>Runtime.addShutdownHook</code> that the JVM starts during an orderly shutdown. Hooks should be quick and must not rely on running in any particular order relative to each other.`,
      },
      {
        question: 'What is the difference between preemptive scheduling and time slicing?',
        answer: `With preemptive scheduling, a higher-priority thread that becomes runnable can take the processor from a lower-priority one. With time slicing, each runnable thread gets a small slice of time in turn, so threads of equal priority share the processor. Most operating systems combine the two, and Java leaves the exact behaviour to the platform.`,
      },
    ],
  },

  'multitasking-vs-multithreading-in-java': {
    whyItMatters: `Threads are useful because they share memory, and dangerous for the same reason. This lesson's distinction — separate processes with separate memory versus threads inside one process sharing a heap — explains both why multithreading is fast and why two threads can corrupt each other's data.`,
    exercise: {
      prompt: `Split a sum across two threads. One thread adds the numbers 1 to 100 and the other adds 101 to 200. Each stores its result in its own slot of a shared array, so they never write to the same place. After both finish, print the total.

Expected output: <code>20100</code>`,
      starterCode: `public class SplitSum {

    static int sumRange(int from, int to) {
        int sum = 0;
        for (int i = from; i <= to; i++) {
            sum += i;
        }
        return sum;
    }

    public static void main(String[] args) throws InterruptedException {
        int[] results = new int[2];

        // TODO: thread one stores sumRange(1, 100) in results[0]
        // TODO: thread two stores sumRange(101, 200) in results[1]
        // TODO: start both, wait for both, then print results[0] + results[1]
    }
}`,
      hints: [
        'Both threads can see <code>results</code> because threads of one process share the heap.',
        'Call <code>join()</code> on both threads before reading the results.',
      ],
      solution: `public class SplitSum {

    static int sumRange(int from, int to) {
        int sum = 0;
        for (int i = from; i <= to; i++) {
            sum += i;
        }
        return sum;
    }

    public static void main(String[] args) throws InterruptedException {
        int[] results = new int[2];

        Thread first = new Thread(() -> results[0] = sumRange(1, 100));
        Thread second = new Thread(() -> results[1] = sumRange(101, 200));

        first.start();
        second.start();
        first.join();
        second.join();

        System.out.println(results[0] + results[1]); // 20100
    }
}`,
    },
    quiz: [
      {
        question: 'What do the threads of a single process share?',
        options: ['Nothing', 'The heap memory', 'Their call stacks', 'Their local variables'],
        answer: 1,
        explanation: 'All threads in a process share the heap, and therefore every object on it.',
      },
      {
        question: 'What does each thread have of its own?',
        options: ['Its own heap', 'Its own call stack', 'Its own copy of every object', 'Its own JVM'],
        answer: 1,
        explanation: 'Each thread has a private stack holding its method calls and local variables.',
      },
      {
        question: 'Which is usually cheaper: switching between two threads of the same process, or between two processes?',
        options: ['Between two processes', 'Between two threads', 'They cost the same', 'It cannot be compared'],
        answer: 1,
        explanation: 'Threads share an address space, so a thread switch has less state to save and restore than a process switch.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between process-based and thread-based multitasking?',
        answer: `Process-based multitasking runs several programs at once, each in its own process with separate memory; communication between them is slow and explicit. Thread-based multitasking runs several tasks inside one program; the threads share memory, so they communicate cheaply through shared objects but must synchronize access to them.`,
      },
      {
        question: 'What are the benefits and risks of multithreading?',
        answer: `Benefits: better use of multiple processor cores, applications that stay responsive while work continues in the background, and higher throughput on servers. Risks: race conditions when threads modify shared data, deadlocks when they wait on each other's locks, and bugs that depend on timing and are hard to reproduce.`,
      },
    ],
  },

  'synchronization': {
    whyItMatters: `When two threads change the same data without coordination, updates get lost. The program does not crash; it just produces a slightly wrong number, and a different wrong number on the next run. Synchronization is the basic tool that makes a shared operation happen as one uninterrupted step.`,
    exercise: {
      prompt: `Two threads each call <code>increment()</code> 10,000 times, but the program usually prints less than 20000 because <code>count++</code> is not atomic. Make the counter thread-safe.

Expected output: <code>20000</code>`,
      starterCode: `class Counter {
    private int count = 0;

    void increment() {
        count++;
    }

    int get() {
        return count;
    }
}

public class RaceFix {
    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();
        Runnable task = () -> {
            for (int i = 0; i < 10000; i++) {
                counter.increment();
            }
        };

        Thread first = new Thread(task);
        Thread second = new Thread(task);
        first.start();
        second.start();
        first.join();
        second.join();

        System.out.println(counter.get());
    }
}`,
      hints: [
        '<code>count++</code> is three steps: read, add one, write. Two threads can interleave between them.',
        'Marking both methods <code>synchronized</code> lets only one thread at a time run them on the same Counter.',
      ],
      solution: `class Counter {
    private int count = 0;

    synchronized void increment() {
        count++;
    }

    synchronized int get() {
        return count;
    }
}

public class RaceFix {
    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();
        Runnable task = () -> {
            for (int i = 0; i < 10000; i++) {
                counter.increment();
            }
        };

        Thread first = new Thread(task);
        Thread second = new Thread(task);
        first.start();
        second.start();
        first.join();
        second.join();

        System.out.println(counter.get()); // 20000
    }
}`,
    },
    quiz: [
      {
        question: 'Is <code>count++</code> an atomic operation on a shared int field?',
        options: ['Yes', 'No; it reads, adds and writes as separate steps', 'Only on a 64-bit JVM', 'Only if count is static'],
        answer: 1,
        explanation: 'Another thread can run between the read and the write, so one of the two updates can be lost.',
      },
      {
        question: 'Which lock does a <code>synchronized</code> instance method acquire?',
        options: ['The lock of the class', 'The lock of the object it is called on (this)', 'A global lock for the whole JVM', 'No lock'],
        answer: 1,
        explanation: 'An instance method locks the object itself. A static synchronized method locks the Class object.',
      },
      {
        question: 'Two threads call two different <code>synchronized</code> instance methods on the same object. What happens?',
        options: ['Both run at the same time', 'One waits until the other releases the object\'s lock', 'It does not compile', 'Both throw an exception'],
        answer: 1,
        explanation: 'Both methods need the same lock, the object\'s, so they cannot run at the same time on that object.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a race condition?',
        answer: `A race condition occurs when the result of a program depends on the timing of threads that read and modify shared data without coordination. The classic example is two threads incrementing a counter: both read the same value, both add one, and both write it back, so one increment is lost. It is fixed by making the operation atomic, with synchronization, a lock, or an atomic class such as <code>AtomicInteger</code>.`,
      },
      {
        question: 'What is the difference between a synchronized method and a synchronized block?',
        answer: `A synchronized method holds the lock for the whole method, on <code>this</code> or on the class for a static method. A synchronized block holds a lock only for the statements inside it and lets you choose which object to lock. Blocks are preferred when only part of the method touches shared state, because a shorter locked section lets other threads proceed sooner.`,
      },
    ],
  },

  'advanced-synchronization-reentrant-locks-and-interrupting-threads': {
    whyItMatters: `<code>synchronized</code> covers the common case, but it cannot give up waiting for a lock or try without blocking. <code>ReentrantLock</code> adds those abilities at the cost of one rule you must never forget: unlock in a <code>finally</code> block. Interruption is the other half of this lesson — the only safe way to ask a thread to stop.`,
    exercise: {
      prompt: `Protect the counter with an explicit <code>ReentrantLock</code> instead of <code>synchronized</code>. Make sure the lock is released even if the code inside throws.

Expected output: <code>20000</code>`,
      starterCode: `import java.util.concurrent.locks.ReentrantLock;

class LockedCounter {
    private final ReentrantLock lock = new ReentrantLock();
    private int count = 0;

    void increment() {
        // TODO: acquire the lock, increment, and release the lock in a finally block
        count++;
    }

    int get() {
        return count;
    }
}

public class LockPractice {
    public static void main(String[] args) throws InterruptedException {
        LockedCounter counter = new LockedCounter();
        Runnable task = () -> {
            for (int i = 0; i < 10000; i++) {
                counter.increment();
            }
        };

        Thread first = new Thread(task);
        Thread second = new Thread(task);
        first.start();
        second.start();
        first.join();
        second.join();

        System.out.println(counter.get());
    }
}`,
      hints: [
        'Call <code>lock.lock()</code> before the try block, not inside it.',
        'Put <code>lock.unlock()</code> in <code>finally</code> so it always runs.',
      ],
      solution: `import java.util.concurrent.locks.ReentrantLock;

class LockedCounter {
    private final ReentrantLock lock = new ReentrantLock();
    private int count = 0;

    void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
    }

    int get() {
        return count;
    }
}

public class LockPractice {
    public static void main(String[] args) throws InterruptedException {
        LockedCounter counter = new LockedCounter();
        Runnable task = () -> {
            for (int i = 0; i < 10000; i++) {
                counter.increment();
            }
        };

        Thread first = new Thread(task);
        Thread second = new Thread(task);
        first.start();
        second.start();
        first.join();
        second.join();

        System.out.println(counter.get()); // 20000
    }
}`,
    },
    quiz: [
      {
        question: 'Which lock does a <code>static synchronized</code> method acquire?',
        options: ['The lock of this', 'The lock of the Class object', 'No lock', 'A new lock on each call'],
        answer: 1,
        explanation: 'A static method has no instance, so it locks the Class object, which is shared by all instances.',
      },
      {
        question: 'What does "reentrant" mean for a lock?',
        options: ['It can be shared by many threads at once', 'A thread that already holds it can acquire it again without blocking', 'It unlocks itself after a timeout', 'It cannot be released'],
        answer: 1,
        explanation: 'This lets a synchronized method call another synchronized method on the same object without deadlocking itself.',
      },
      {
        question: 'A thread is sleeping and another thread calls <code>interrupt()</code> on it. What happens in the sleeping thread?',
        options: ['It is killed immediately', 'sleep() throws InterruptedException', 'Nothing until it wakes by itself', 'The JVM exits'],
        answer: 1,
        explanation: 'A blocking call such as sleep, wait or join responds to an interrupt by throwing InterruptedException and clearing the interrupt flag.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What does ReentrantLock offer that synchronized does not?',
        answer: `<code>tryLock()</code>, which attempts to take the lock without waiting or with a timeout. <code>lockInterruptibly()</code>, which lets a waiting thread be interrupted. An optional fairness policy that grants the lock to the longest-waiting thread. And multiple condition objects for one lock. The price is that you must release it yourself, always in a <code>finally</code> block.`,
      },
      {
        question: 'How do you stop a thread safely?',
        answer: `By cooperation. Another thread calls <code>interrupt()</code> on it, and the running thread checks <code>Thread.currentThread().isInterrupted()</code> in its loop or handles <code>InterruptedException</code> from blocking calls, then cleans up and returns. <code>Thread.stop()</code> must not be used: it kills the thread at an arbitrary point and can leave shared data in an inconsistent state.`,
      },
    ],
  },

  'inter-thread-communication-wait-notify-notifyall': {
    whyItMatters: `Sometimes a thread must not just exclude others but wait for them: a consumer waits for a producer, a worker waits for a signal. <code>wait()</code> and <code>notifyAll()</code> are the low-level mechanism for that. They have two rules that are easy to break — call them only while holding the lock, and always wait in a loop — and breaking either produces bugs that appear only occasionally.`,
    exercise: {
      prompt: `Complete the <code>Gate</code> class. <code>pass()</code> must wait until the gate has been opened, and <code>open()</code> must open it and wake any waiting thread.

Expected output: <code>opening</code> then <code>passed</code>`,
      starterCode: `class Gate {
    private boolean open = false;

    synchronized void pass() throws InterruptedException {
        // TODO: wait while the gate is not open
        System.out.println("passed");
    }

    synchronized void open() {
        // TODO: open the gate and wake up waiting threads
    }
}

public class GateDemo {
    public static void main(String[] args) throws InterruptedException {
        Gate gate = new Gate();

        Thread visitor = new Thread(() -> {
            try {
                gate.pass();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        visitor.start();

        System.out.println("opening");
        gate.open();
        visitor.join();
    }
}`,
      hints: [
        'Use <code>while (!open) { wait(); }</code>, not <code>if</code>, so the condition is checked again after waking.',
        'In <code>open()</code>, change the flag first and then call <code>notifyAll()</code>.',
      ],
      solution: `class Gate {
    private boolean open = false;

    synchronized void pass() throws InterruptedException {
        while (!open) {
            wait();
        }
        System.out.println("passed");
    }

    synchronized void open() {
        open = true;
        notifyAll();
    }
}

public class GateDemo {
    public static void main(String[] args) throws InterruptedException {
        Gate gate = new Gate();

        Thread visitor = new Thread(() -> {
            try {
                gate.pass();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        visitor.start();

        System.out.println("opening");
        gate.open();
        visitor.join();
    }
}`,
    },
    quiz: [
      {
        question: 'What happens if <code>wait()</code> is called without holding the object\'s lock?',
        options: ['It waits normally', 'It throws IllegalMonitorStateException', 'It does not compile', 'It returns immediately'],
        answer: 1,
        explanation: 'wait, notify and notifyAll must be called from inside a synchronized block or method on that same object.',
      },
      {
        question: 'Does <code>wait()</code> release the lock while the thread is waiting?',
        options: ['No, it keeps the lock', 'Yes, and reacquires it before returning', 'Only with a timeout', 'Only for static methods'],
        answer: 1,
        explanation: 'Releasing the lock is what allows another thread to enter, change the condition and call notify.',
      },
      {
        question: 'Why should <code>wait()</code> be called inside a <code>while</code> loop rather than an <code>if</code>?',
        options: ['It runs faster', 'A thread can wake without the condition being true, so it must check again', 'if is not allowed with wait', 'To avoid compiling errors'],
        answer: 1,
        explanation: 'Spurious wake-ups can happen, and another thread may have changed the condition again before this one reacquires the lock.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between notify() and notifyAll()?',
        answer: `<code>notify()</code> wakes one thread waiting on the object, chosen arbitrarily. <code>notifyAll()</code> wakes all of them; they then compete for the lock and each rechecks its condition. <code>notifyAll()</code> is the safer default, because with <code>notify()</code> the one thread that wakes may be waiting for a different condition, leaving the right thread asleep.`,
      },
      {
        question: 'Why are wait() and notify() defined in Object rather than Thread?',
        answer: `Because they operate on a lock, and in Java every object has its own lock (monitor). A thread waits on a particular object's monitor and is notified through that same object, so the methods belong to the object that owns the lock, not to the thread.`,
      },
    ],
  },

  'deadlock': {
    whyItMatters: `A deadlock does not throw an exception or print an error. The affected threads simply stop, forever, usually under load and often only in production. Knowing the conditions that make it possible lets you design it out — the simplest rule, always taking locks in the same order, prevents most cases.`,
    exercise: {
      prompt: `These two threads take the same two locks in opposite orders, so the program can hang. Change the second thread so that both threads acquire the locks in the same order. The program then always finishes.

Expected output: <code>done</code>`,
      starterCode: `public class LockOrder {
    private static final Object lockA = new Object();
    private static final Object lockB = new Object();

    public static void main(String[] args) throws InterruptedException {
        Thread first = new Thread(() -> {
            synchronized (lockA) {
                synchronized (lockB) {
                    // work using both locks
                }
            }
        });

        Thread second = new Thread(() -> {
            synchronized (lockB) {
                synchronized (lockA) {
                    // work using both locks
                }
            }
        });

        first.start();
        second.start();
        first.join();
        second.join();
        System.out.println("done");
    }
}`,
      hints: [
        'A deadlock needs a cycle: thread one holds A and wants B, thread two holds B and wants A.',
        'If every thread takes <code>lockA</code> before <code>lockB</code>, no cycle can form.',
      ],
      solution: `public class LockOrder {
    private static final Object lockA = new Object();
    private static final Object lockB = new Object();

    public static void main(String[] args) throws InterruptedException {
        Thread first = new Thread(() -> {
            synchronized (lockA) {
                synchronized (lockB) {
                    // work using both locks
                }
            }
        });

        Thread second = new Thread(() -> {
            synchronized (lockA) {
                synchronized (lockB) {
                    // work using both locks
                }
            }
        });

        first.start();
        second.start();
        first.join();
        second.join();
        System.out.println("done");
    }
}`,
    },
    quiz: [
      {
        question: 'Which of these is NOT one of the four conditions required for a deadlock?',
        options: ['Mutual exclusion', 'Hold and wait', 'Circular wait', 'Time slicing'],
        answer: 3,
        explanation: 'The four conditions are mutual exclusion, hold and wait, no preemption and circular wait. Time slicing is a scheduling technique.',
      },
      {
        question: 'Which practice prevents most deadlocks?',
        options: ['Using more threads', 'Always acquiring locks in the same order', 'Raising thread priority', 'Calling Thread.sleep() between locks'],
        answer: 1,
        explanation: 'A consistent global lock order removes the possibility of a circular wait.',
      },
      {
        question: 'How can you confirm that a hung Java application is deadlocked?',
        options: ['Restart it', 'Take a thread dump, for example with jstack', 'Increase the heap size', 'Check the console for an exception'],
        answer: 1,
        explanation: 'A thread dump lists each thread\'s state and the locks it holds and waits for, and reports Java-level deadlocks explicitly.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a deadlock and what conditions cause it?',
        answer: `A deadlock is a state in which two or more threads wait forever, each holding a lock the other needs. It requires four conditions together: mutual exclusion (a lock is held by one thread at a time), hold and wait (a thread keeps one lock while waiting for another), no preemption (a lock cannot be taken away), and circular wait (the threads form a cycle). Breaking any one of them prevents deadlock.`,
      },
      {
        question: 'What is the difference between deadlock, livelock and starvation?',
        answer: `In a deadlock, threads are blocked and make no progress. In a livelock, threads are active but keep reacting to each other and still make no progress, like two people repeatedly stepping aside for one another. In starvation, one thread never gets the lock or processor time it needs because others keep taking it, while the rest of the system carries on.`,
      },
    ],
  },

  'thread-pool-and-the-executor-framework': {
    whyItMatters: `Creating a new thread for every task wastes memory and time, and an unbounded number of threads can bring a server down. A thread pool reuses a fixed set of threads and queues the rest of the work. In modern Java you almost never create a <code>Thread</code> directly: you hand tasks to an <code>ExecutorService</code>.`,
    exercise: {
      prompt: `Use a fixed thread pool of two threads to compute the squares of 1, 2 and 3 as three separate tasks. Add the three results together and print the total, then shut the pool down.

Expected output: <code>14</code>`,
      starterCode: `import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class PoolSum {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        List<Future<Integer>> futures = new ArrayList<>();

        // TODO: for n = 1, 2, 3 submit a task that returns n * n and keep its Future

        int total = 0;
        // TODO: add up the result of every Future

        // TODO: shut the pool down
        System.out.println(total);
    }
}`,
      hints: [
        'A lambda may only capture a variable that does not change, so copy the loop variable into a new local first.',
        '<code>future.get()</code> waits for the task and returns its result.',
      ],
      solution: `import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class PoolSum {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        List<Future<Integer>> futures = new ArrayList<>();

        for (int i = 1; i <= 3; i++) {
            int n = i;
            futures.add(pool.submit(() -> n * n));
        }

        int total = 0;
        for (Future<Integer> future : futures) {
            total += future.get();
        }

        pool.shutdown();
        System.out.println(total); // 14
    }
}`,
    },
    quiz: [
      {
        question: 'A program creates an <code>ExecutorService</code> with <code>newFixedThreadPool</code> and never calls <code>shutdown()</code>. What usually happens when main finishes?',
        options: ['The JVM exits normally', 'The JVM keeps running because the pool\'s threads are still alive', 'An exception is thrown', 'The tasks are cancelled'],
        answer: 1,
        explanation: 'Pool threads are non-daemon by default and wait for more work, so the JVM does not exit until the pool is shut down.',
      },
      {
        question: 'What is the main difference between <code>execute()</code> and <code>submit()</code>?',
        options: ['execute() is faster', 'submit() returns a Future; execute() returns nothing', 'submit() runs on the calling thread', 'There is no difference'],
        answer: 1,
        explanation: 'submit() gives you a Future for the result or the exception. execute() only accepts a Runnable and returns void.',
      },
      {
        question: 'Five tasks are submitted to a pool created with <code>newFixedThreadPool(2)</code>. What happens?',
        options: ['Five threads are created', 'Two run at a time and the other three wait in a queue', 'Three tasks are rejected', 'All five run on one thread'],
        answer: 1,
        explanation: 'A fixed pool never exceeds its size. Extra tasks wait in the pool\'s queue until a thread becomes free.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why use a thread pool instead of creating threads directly?',
        answer: `Creating a thread is expensive, and each one uses memory for its stack. A pool reuses a small number of threads for many tasks, which removes the creation cost and puts an upper limit on how many threads exist. It also separates what to run from how it is run, so you can change the threading policy without touching the tasks.`,
      },
      {
        question: 'What is the difference between shutdown() and shutdownNow()?',
        answer: `<code>shutdown()</code> stops the pool from accepting new tasks but lets tasks already submitted finish. <code>shutdownNow()</code> also tries to stop running tasks by interrupting their threads, and returns the list of tasks that never started. Neither waits; use <code>awaitTermination()</code> to wait for the pool to finish.`,
      },
    ],
  },

  'callable-future-and-completablefuture': {
    whyItMatters: `A <code>Runnable</code> cannot return a result. <code>Callable</code> and <code>Future</code> fix that, but <code>Future.get()</code> blocks the calling thread. <code>CompletableFuture</code> goes further: it lets you describe what should happen when a result arrives and combine several results, without blocking. It is the basis of most asynchronous Java code written today.`,
    exercise: {
      prompt: `Build a small asynchronous pipeline with <code>CompletableFuture</code>: produce 20 asynchronously, double it, then add the result of a second asynchronous task that produces 2. Print the final value.

Expected output: <code>42</code>`,
      starterCode: `import java.util.concurrent.CompletableFuture;

public class AsyncPipeline {
    public static void main(String[] args) {
        CompletableFuture<Integer> first = CompletableFuture.supplyAsync(() -> 20);
        CompletableFuture<Integer> second = CompletableFuture.supplyAsync(() -> 2);

        // TODO: double the first value, then combine it with the second by adding them
        // TODO: wait for the result with join() and print it
    }
}`,
      hints: [
        '<code>thenApply</code> transforms a result; <code>thenCombine</code> merges two futures with a two-argument function.',
        '<code>Integer::sum</code> is a ready-made function that adds two Integers.',
      ],
      solution: `import java.util.concurrent.CompletableFuture;

public class AsyncPipeline {
    public static void main(String[] args) {
        CompletableFuture<Integer> first = CompletableFuture.supplyAsync(() -> 20);
        CompletableFuture<Integer> second = CompletableFuture.supplyAsync(() -> 2);

        CompletableFuture<Integer> result = first
                .thenApply(value -> value * 2)
                .thenCombine(second, Integer::sum);

        System.out.println(result.join()); // 42
    }
}`,
    },
    quiz: [
      {
        question: 'How does <code>Callable</code> differ from <code>Runnable</code>?',
        options: ['Callable runs faster', 'Callable returns a value and can throw a checked exception', 'Callable cannot be used with a thread pool', 'Runnable returns a value'],
        answer: 1,
        explanation: 'Callable\'s call() method returns a result and is declared to throw Exception. Runnable\'s run() returns void.',
      },
      {
        question: 'What does <code>Future.get()</code> do if the task has not finished yet?',
        options: ['Returns null', 'Blocks the calling thread until the result is ready', 'Throws an exception immediately', 'Cancels the task'],
        answer: 1,
        explanation: 'get() waits for completion. A version with a timeout throws TimeoutException if the wait is too long.',
      },
      {
        question: 'What is <code>exceptionally()</code> used for on a CompletableFuture?',
        options: ['To throw an exception', 'To supply a fallback value if an earlier stage failed', 'To cancel the future', 'To run a stage on another thread'],
        answer: 1,
        explanation: 'exceptionally receives the exception and returns a replacement result, letting the pipeline recover.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between Future and CompletableFuture?',
        answer: `A <code>Future</code> represents a result that will be available later, and the only way to use it is to call <code>get()</code>, which blocks. A <code>CompletableFuture</code> can be completed manually, lets you attach callbacks that run when the result arrives, chains and combines several asynchronous steps, and handles errors within the chain — all without blocking a thread.`,
      },
      {
        question: 'What is the difference between thenApply() and thenCompose()?',
        answer: `<code>thenApply</code> takes a function that turns the result into another value, like <code>map</code>. <code>thenCompose</code> takes a function that returns another CompletableFuture and flattens it, like <code>flatMap</code>. Use <code>thenCompose</code> when the next step is itself asynchronous; with <code>thenApply</code> you would end up with a future inside a future.`,
      },
    ],
  },
}
