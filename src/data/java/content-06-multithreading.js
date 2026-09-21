// Multithreading module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content06Multithreading = {
  'multithreading-basics-and-thread-life-cycle': {
    title: 'Multithreading Basics and Thread Life Cycle',
    intro: `A process is an independently running program with its own memory space — for example, your browser and your IDE are two separate processes, and one cannot directly read the other's memory. A thread is a lightweight sub-unit of a process; multiple threads within the same process share that process's memory (heap, static fields) but each thread keeps its own stack, program counter, and local variables. Multithreading is the ability to run several threads concurrently within a single process.

Java has supported multithreading since its first release through the <code>java.lang.Thread</code> class and the <code>Runnable</code> interface. Threads are useful because they let a program do more than one thing "at the same time" — for example, a server handling many client connections, or a UI staying responsive while a background task loads data — without needing multiple separate processes, which would be far more expensive to create and communicate between.`,
    sections: [
      {
        heading: 'Why Threads Instead of Processes',
        body: `Creating a new process means the operating system allocates a fresh memory space and duplicates resources, which is comparatively slow and memory-heavy. Creating a new thread is much cheaper because it reuses the same process memory and just adds a new stack and execution path. Threads within one process can also communicate directly through shared variables, whereas processes typically need explicit inter-process communication (sockets, pipes, files) to exchange data.`,
      },
      {
        heading: 'The Thread Life Cycle',
        body: `Every Java thread moves through a well-defined set of states, represented by the enum <code>Thread.State</code>. Understanding these states is essential for debugging concurrency issues, because tools like thread dumps report exactly these state names.`,
        list: [
          '<strong>New</strong> — the thread object has been created (<code>new Thread(...)</code>) but <code>start()</code> has not yet been called; no OS-level thread exists yet.',
          '<strong>Runnable</strong> — after <code>start()</code> is called, the thread is eligible to run; it may be actively executing on a CPU core or simply waiting its turn from the thread scheduler. Java does not distinguish "ready" from "running" as a separate state — both fall under RUNNABLE.',
          '<strong>Blocked</strong> — the thread is waiting to acquire an intrinsic lock (a <code>synchronized</code> block or method) that another thread currently holds.',
          '<strong>Waiting</strong> — the thread is waiting indefinitely for another thread to perform a specific action, typically via <code>Object.wait()</code> (with no timeout), <code>Thread.join()</code> (with no timeout), or <code>LockSupport.park()</code>.',
          '<strong>Timed Waiting</strong> — like Waiting, but bounded by a timeout, as with <code>Thread.sleep(ms)</code>, <code>wait(ms)</code>, or <code>join(ms)</code>.',
          '<strong>Terminated</strong> — the thread has finished executing its <code>run()</code> method, either normally or due to an uncaught exception. A terminated thread cannot be restarted.',
        ],
      },
      {
        heading: 'Who Controls the Transitions',
        body: `Moving from New to Runnable is always your explicit action — calling <code>start()</code>. Moving out of Runnable into Blocked, Waiting, or Timed Waiting happens automatically based on what the thread's code does (trying to enter a locked block, calling <code>wait()</code>, calling <code>sleep()</code>). The JVM thread scheduler — not your program — decides exactly when a Runnable thread actually gets CPU time, and that decision is not guaranteed to be fair or deterministic across runs.`,
      },
    ],
    examples: [
      {
        caption: 'Observing thread states at different points in the life cycle',
        code: `public class LifeCycleDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            try {
                Thread.sleep(200);
            } catch (InterruptedException ignored) {
            }
        });

        System.out.println("Before start(): " + worker.getState());   // NEW

        worker.start();
        System.out.println("Just after start(): " + worker.getState()); // RUNNABLE

        Thread.sleep(50); // give the worker time to reach sleep()
        System.out.println("While worker sleeps: " + worker.getState()); // TIMED_WAITING

        worker.join();
        System.out.println("After join(): " + worker.getState());     // TERMINATED
    }
}`,
        output: `Before start(): NEW
Just after start(): RUNNABLE
While worker sleeps: TIMED_WAITING
After join(): TERMINATED`,
      },
    ],
    commonMistakes: [
      'Assuming RUNNABLE means "currently executing on a CPU" — it only means "eligible to run"; the scheduler decides the rest.',
      'Calling start() twice on the same Thread object — this throws IllegalThreadStateException, because a terminated or already-started thread cannot restart.',
      'Confusing a "process" with a "thread" and assuming threads have completely separate memory, when in fact they share the heap and static state of their process.',
    ],
    keyPoints: [
      'A process has isolated memory; threads within a process share memory but have their own stack.',
      'Thread.State values: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED.',
      'start() moves a thread from NEW to RUNNABLE; the actual CPU scheduling is controlled by the JVM/OS, not your code.',
    ],
  },

  'creating-threads-thread-class-vs-runnable': {
    title: 'Creating Threads: Thread Class vs Runnable',
    intro: `Java gives you two standard ways to define the code a thread should run: extending the <code>Thread</code> class and overriding <code>run()</code>, or implementing the <code>Runnable</code> interface and passing it to a <code>Thread</code>. Both approaches ultimately start a new thread the same way — by calling <code>start()</code> — but they differ in flexibility and design implications.`,
    sections: [
      {
        heading: 'Approach 1: Extending Thread',
        body: `You create a subclass of <code>Thread</code> and override its <code>run()</code> method with the code you want executed concurrently. You then instantiate your subclass and call <code>start()</code> on it. This works, but it consumes your one allowed superclass in Java — since Java does not support multiple inheritance of classes, a class that extends Thread cannot extend anything else.`,
      },
      {
        heading: 'Approach 2: Implementing Runnable (Preferred)',
        body: `You create a class that implements <code>Runnable</code> and defines its single abstract method, <code>run()</code>. You then wrap an instance of that class in a <code>new Thread(runnableInstance)</code> and call <code>start()</code> on the Thread object. This is generally the preferred approach because your task class remains free to extend some other class if needed, it cleanly separates "the task to run" from "the mechanism that runs it," and it works naturally with the Executor framework, which expects Runnable (or Callable) tasks rather than Thread subclasses.`,
        list: [
          '<strong>Extends Thread</strong>: simpler for a one-off, but uses up your single inheritance slot.',
          '<strong>Implements Runnable</strong>: more flexible, reusable across multiple Thread objects, and the idiomatic choice in modern Java code, including with lambdas.',
        ],
      },
      {
        heading: 'start() vs run() — The Most Important Distinction',
        body: `Calling <code>start()</code> asks the JVM to create a new call stack and a new native OS thread, which will eventually invoke <code>run()</code> on that new thread. Calling <code>run()</code> directly, by contrast, is just an ordinary method call — it executes on the current thread, synchronously, with no concurrency at all. This is one of the most common beginner mistakes: the code compiles and even produces output, but nothing actually runs concurrently.`,
      },
    ],
    examples: [
      {
        caption: 'Both approaches producing a concurrently running thread',
        code: `class CounterThread extends Thread {
    @Override
    public void run() {
        System.out.println("CounterThread running on: " + Thread.currentThread().getName());
    }
}

class CounterTask implements Runnable {
    @Override
    public void run() {
        System.out.println("CounterTask running on: " + Thread.currentThread().getName());
    }
}

public class ThreadCreationDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new CounterThread();
        t1.setName("Worker-Extends");
        t1.start();
        t1.join();

        Thread t2 = new Thread(new CounterTask(), "Worker-Runnable");
        t2.start();
        t2.join();

        // run() called directly: executes on main, NOT a new thread
        new CounterTask().run();
    }
}`,
        output: `CounterThread running on: Worker-Extends
CounterTask running on: Worker-Runnable
CounterTask running on: main`,
      },
    ],
    commonMistakes: [
      'Calling run() instead of start() and expecting concurrent execution — run() just executes synchronously on the calling thread.',
      'Extending Thread unnecessarily when the class already needs to extend something else, or when the task should be reusable across multiple threads.',
      'Forgetting that each Thread object can only be started once — attempting start() a second time throws IllegalThreadStateException.',
      'Not naming threads, which makes log output and thread dumps ("Thread-0", "Thread-1"...) hard to interpret during debugging.',
    ],
    keyPoints: [
      'Extending Thread and implementing Runnable both let you define a thread\'s work, but Runnable is generally preferred because Java has no multiple inheritance.',
      'Runnable separates the task from the execution mechanism and integrates cleanly with the Executor framework.',
      'start() launches a new thread and eventually calls run() on it; calling run() directly is just a normal, synchronous method call.',
    ],
  },

  'thread-priority-and-sleep': {
    title: 'Thread Priority and sleep()',
    intro: `Java gives every thread an integer priority that hints to the thread scheduler how much CPU preference it should receive relative to other threads, and it gives every thread the ability to pause its own execution for a fixed period using <code>Thread.sleep()</code>. Both mechanisms influence when a thread runs, but neither one guarantees exact timing or exact ordering, because the underlying OS scheduler ultimately makes the real decisions.`,
    sections: [
      {
        heading: 'Thread Priority',
        body: `Every thread has a priority in the range 1 to 10, controlled by <code>setPriority(int)</code> and read with <code>getPriority()</code>. Three named constants exist on Thread: <code>MIN_PRIORITY</code> (1), <code>NORM_PRIORITY</code> (5, the default for new threads unless inherited from the parent), and <code>MAX_PRIORITY</code> (10). A higher priority is only a hint to the scheduler that this thread should be favored for CPU time — it does not guarantee that a higher-priority thread runs first, runs more often, or finishes earlier, and behavior can vary noticeably across operating systems and JVM implementations. Priority should never be used as a substitute for proper synchronization or correctness logic.`,
        list: [
          '<code>Thread.MIN_PRIORITY</code> = 1',
          '<code>Thread.NORM_PRIORITY</code> = 5 (default)',
          '<code>Thread.MAX_PRIORITY</code> = 10',
        ],
      },
      {
        heading: 'Thread.sleep()',
        body: `<code>Thread.sleep(long millis)</code> pauses the currently executing thread for at least the given number of milliseconds (an overload also accepts nanoseconds), moving it into the TIMED_WAITING state. Because sleeping is interruptible, <code>sleep()</code> declares a checked exception, <code>InterruptedException</code>, which must be caught or declared. Importantly, sleeping does not release any intrinsic locks the thread currently holds — a thread that sleeps while inside a <code>synchronized</code> block continues to hold that lock the entire time, which can block other threads unexpectedly if not designed carefully.`,
      },
      {
        heading: 'sleep() Is Not a Precision Timer',
        body: `<code>sleep()</code> guarantees the thread will sleep for at least the requested duration, not exactly that duration — OS scheduling granularity, system load, and JVM garbage collection pauses can all add extra delay. It should be used for approximate pacing (throttling, retry backoff, simple demos) rather than for time-critical operations.`,
      },
    ],
    examples: [
      {
        caption: 'Setting priority and using sleep() with proper exception handling',
        code: `public class PriorityAndSleepDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread low = new Thread(() -> System.out.println("Low priority thread ran"));
        low.setPriority(Thread.MIN_PRIORITY);

        Thread high = new Thread(() -> System.out.println("High priority thread ran"));
        high.setPriority(Thread.MAX_PRIORITY);

        System.out.println("low priority: " + low.getPriority());
        System.out.println("high priority: " + high.getPriority());

        low.start();
        high.start();
        low.join();
        high.join();

        System.out.println("Main thread sleeping for 300ms...");
        Thread.sleep(300);
        System.out.println("Main thread resumed after sleep");
    }
}`,
        output: `low priority: 1
high priority: 10
Main thread sleeping for 300ms...
Main thread resumed after sleep
(Note: "Low priority thread ran" and "High priority thread ran" can print in either order —
priority is only a scheduling hint, not a guaranteed execution order.)`,
      },
    ],
    commonMistakes: [
      'Relying on thread priority to guarantee a specific execution order — it is only a scheduling hint and behaves differently across JVMs and operating systems.',
      'Forgetting that Thread.sleep() throws a checked InterruptedException, and either failing to handle it or silently swallowing it without restoring the interrupt status.',
      'Assuming sleep() releases locks held by the thread — a sleeping thread inside a synchronized block still holds that lock, which can cause unexpected contention.',
      'Using sleep() for precise timing in production code instead of a proper scheduling API, when exact timing actually matters.',
    ],
    keyPoints: [
      'Thread priority ranges from 1 (MIN_PRIORITY) to 10 (MAX_PRIORITY), with 5 (NORM_PRIORITY) as the default; it is a hint, not a guarantee.',
      'Thread.sleep(ms) pauses the current thread and throws checked InterruptedException.',
      'A sleeping thread does not release any intrinsic locks it holds.',
      'sleep() guarantees a minimum delay, not an exact one.',
    ],
  },

  synchronization: {
    title: 'Synchronization',
    intro: `When multiple threads read and modify shared data at the same time without coordination, you get a race condition: the final result depends on the unpredictable timing of thread execution, and it is often wrong. Synchronization is Java's built-in mechanism for making sure only one thread at a time can execute a critical section of code that touches shared, mutable state.`,
    sections: [
      {
        heading: 'Intrinsic Locks (Monitors)',
        body: `Every Java object carries a hidden intrinsic lock, also called a monitor. The <code>synchronized</code> keyword tells the JVM that a thread must acquire an object's monitor before entering the guarded code, and must release it on exit (even if an exception is thrown). Only one thread can hold a given object's monitor at a time; any other thread that tries to enter a block synchronized on the same object is placed in the BLOCKED state until the lock is released.`,
      },
      {
        heading: 'Synchronized Methods vs Synchronized Blocks',
        body: `Marking an entire method <code>synchronized</code> locks on <code>this</code> (for instance methods) or on the class object itself (for static methods), for the full duration of the call. A synchronized block, <code>synchronized (lockObject) { ... }</code>, lets you lock on a specific object and guard only the minimal section of code that actually needs protection, which reduces contention and improves throughput compared to synchronizing an entire method unnecessarily.`,
        list: [
          '<strong>Synchronized method</strong>: <code>public synchronized void increment() { ... }</code> — simple, but locks for the whole method body.',
          '<strong>Synchronized block</strong>: <code>synchronized (this) { count++; }</code> — precise, locks only what needs protecting.',
          'Static synchronized methods lock on the <code>Class</code> object, which is a different lock than any instance lock.',
        ],
      },
      {
        heading: 'Race Condition, With and Without Synchronization',
        body: `A classic example is two threads both executing <code>count++</code> on a shared counter. That single line is actually three steps at the bytecode level — read the value, add one, write it back — and if two threads interleave those steps, one increment can be lost. Wrapping the increment in a synchronized block (or method) forces the read-modify-write sequence to complete atomically from the perspective of other threads, eliminating the lost update.`,
      },
    ],
    examples: [
      {
        caption: 'A shared counter incremented safely from two threads using a synchronized method',
        code: `public class SynchronizationDemo {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public static void main(String[] args) throws InterruptedException {
        SynchronizationDemo demo = new SynchronizationDemo();

        Runnable task = () -> {
            for (int i = 0; i < 100000; i++) {
                demo.increment();
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Final count: " + demo.count);
    }
}`,
        output: `Final count: 200000
(Without the "synchronized" keyword on increment(), this total is frequently LESS than 200000
because of lost updates from unsynchronized concurrent access — the exact wrong value varies per run.)`,
      },
    ],
    commonMistakes: [
      'Synchronizing on different objects (or on "this" in one place and a separate lock object elsewhere) and assuming they provide mutual exclusion together — only threads synchronizing on the SAME object are mutually exclusive.',
      'Synchronizing an entire method when only a small section touches shared state, unnecessarily reducing concurrency.',
      'Assuming that making a variable "synchronized" is valid syntax — synchronization applies to methods and blocks, not to variable declarations (that is what volatile is for, and it solves a different problem).',
      'Forgetting that synchronized only prevents concurrent access to the guarded code; it does not automatically make an entire class or all of its methods thread-safe.',
    ],
    keyPoints: [
      'Race conditions happen when multiple threads read and write shared state without coordination.',
      'The synchronized keyword uses an object\'s intrinsic lock (monitor) to allow only one thread at a time into a guarded section.',
      'Synchronized blocks are more precise and efficient than synchronizing whole methods when only part of the method touches shared state.',
      'Static synchronized methods lock on the Class object, a separate lock from any particular instance.',
    ],
  },

  'inter-thread-communication-wait-notify-notifyall': {
    title: 'Inter-thread Communication: wait, notify, notifyAll',
    intro: `Synchronization alone prevents threads from stepping on each other, but it does not let threads coordinate based on changing conditions — for example, a consumer thread that must pause until a producer thread has data ready. Java's <code>Object</code> class provides three methods for exactly this purpose: <code>wait()</code>, <code>notify()</code>, and <code>notifyAll()</code>, collectively known as inter-thread communication.`,
    sections: [
      {
        heading: 'The Rules: Must Be Called From a Synchronized Context',
        body: `<code>wait()</code>, <code>notify()</code>, and <code>notifyAll()</code> can only be called by a thread that currently holds the monitor of the object they are invoked on — that is, from inside a block or method synchronized on that same object. Calling any of them outside a synchronized context throws <code>IllegalMonitorStateException</code>. Calling <code>wait()</code> releases the monitor and puts the thread into the WAITING state until another thread calls <code>notify()</code> or <code>notifyAll()</code> on that same object; the waiting thread then re-acquires the monitor before continuing.`,
        list: [
          '<code>wait()</code> — releases the lock and waits until notified (or interrupted, or a timeout elapses for the overloaded form).',
          '<code>notify()</code> — wakes up a single arbitrary thread waiting on this object\'s monitor.',
          '<code>notifyAll()</code> — wakes up all threads waiting on this object\'s monitor; each one competes to re-acquire the lock.',
        ],
      },
      {
        heading: 'Why Use a while Loop, Not an if, Around wait()',
        body: `A woken thread should always re-check its condition in a loop (<code>while (conditionNotMet) { obj.wait(); }</code>) rather than trusting a single check, because of "spurious wakeups" (the JVM is permitted to wake a waiting thread without an actual notify) and because with <code>notifyAll()</code>, multiple threads wake up but only some of them may find the condition still true for them by the time they re-acquire the lock.`,
      },
      {
        heading: 'The Producer-Consumer Pattern',
        body: `The canonical use case is a shared buffer where a producer thread adds items and a consumer thread removes them. The producer waits when the buffer is full; the consumer waits when the buffer is empty; each notifies the other after changing the buffer's state. This pattern is the conceptual foundation behind Java's higher-level <code>BlockingQueue</code> implementations, which handle this coordination internally.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal single-slot producer-consumer using wait/notify',
        code: `public class ProducerConsumerDemo {
    private Integer item = null;

    public synchronized void produce(int value) throws InterruptedException {
        while (item != null) {
            wait(); // slot occupied, wait for consumer to take it
        }
        item = value;
        System.out.println("Produced: " + value);
        notifyAll(); // wake the consumer
    }

    public synchronized void consume() throws InterruptedException {
        while (item == null) {
            wait(); // nothing to consume yet
        }
        System.out.println("Consumed: " + item);
        item = null;
        notifyAll(); // wake the producer
    }

    public static void main(String[] args) throws InterruptedException {
        ProducerConsumerDemo buffer = new ProducerConsumerDemo();

        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 3; i++) buffer.produce(i);
            } catch (InterruptedException ignored) {
            }
        });

        Thread consumer = new Thread(() -> {
            try {
                for (int i = 1; i <= 3; i++) buffer.consume();
            } catch (InterruptedException ignored) {
            }
        });

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
    }
}`,
        output: `Produced: 1
Consumed: 1
Produced: 2
Consumed: 2
Produced: 3
Consumed: 3
(The exact interleaving of "Produced"/"Consumed" lines is coordinated by wait/notify so each value
is consumed once, but timing details can vary slightly between runs.)`,
      },
    ],
    commonMistakes: [
      'Calling wait(), notify(), or notifyAll() outside a synchronized block on that object — this throws IllegalMonitorStateException immediately.',
      'Using "if (condition) wait();" instead of a while loop, which breaks under spurious wakeups or when notifyAll() wakes threads whose condition is not actually satisfied.',
      'Calling notify() when multiple different waiting conditions exist on the same object — notify() wakes an arbitrary thread, which might not be the one that should proceed; notifyAll() is safer in that case.',
      'Forgetting that wait() releases the lock while waiting, and assuming the thread still holds it during that time.',
    ],
    keyPoints: [
      'wait(), notify(), and notifyAll() must be called from within a block synchronized on the same object, or they throw IllegalMonitorStateException.',
      'wait() releases the monitor and suspends the thread; notify()/notifyAll() wake waiting threads, which must then re-acquire the lock.',
      'Always re-check the waiting condition in a while loop to guard against spurious wakeups and notifyAll() side effects.',
      'The producer-consumer pattern is the classic use case for this coordination mechanism.',
    ],
  },

  deadlock: {
    title: 'Deadlock',
    intro: `A deadlock occurs when two or more threads are each waiting for a resource (usually a lock) held by another thread in the same cycle, so none of them can ever proceed. Once a deadlock happens, the affected threads are stuck permanently — the JVM does not automatically detect or break deadlocks involving intrinsic locks.`,
    sections: [
      {
        heading: 'The Four Necessary Conditions',
        body: `Classic operating-systems theory identifies four conditions that must all hold simultaneously for a deadlock to occur. If any one of them is broken, deadlock becomes impossible.`,
        list: [
          '<strong>Mutual exclusion</strong> — a resource (lock) can be held by only one thread at a time.',
          '<strong>Hold and wait</strong> — a thread holds at least one resource while waiting to acquire another.',
          '<strong>No preemption</strong> — a resource cannot be forcibly taken from a thread; it must be released voluntarily.',
          '<strong>Circular wait</strong> — a cycle of threads exists where each is waiting for a resource held by the next thread in the cycle.',
        ],
      },
      {
        heading: 'A Concrete Two-Lock Deadlock',
        body: `The most common real-world deadlock shape happens when two threads each need two locks, but acquire them in opposite order: Thread A locks Resource 1 then tries to lock Resource 2, while Thread B locks Resource 2 then tries to lock Resource 1. If both threads acquire their first lock at nearly the same time, each ends up waiting forever for a lock the other one holds.`,
      },
      {
        heading: 'Prevention Strategies',
        body: `Deadlock is prevented by breaking one of the four necessary conditions, and in practice the most common techniques are consistent lock ordering and using timed lock attempts instead of indefinite blocking.`,
        list: [
          '<strong>Lock ordering</strong> — always acquire multiple locks in the same global order across every thread, which eliminates circular wait.',
          '<strong>Lock timeouts</strong> — use <code>java.util.concurrent.locks.Lock.tryLock(timeout, unit)</code> instead of <code>synchronized</code> so a thread can back off and retry rather than block forever.',
          '<strong>Minimizing lock scope</strong> — hold locks for the shortest time possible and avoid acquiring a second lock while already holding one, whenever the logic allows it.',
          '<strong>Using higher-level concurrency utilities</strong> — classes in <code>java.util.concurrent</code> (like <code>ConcurrentHashMap</code> or <code>BlockingQueue</code>) avoid manual multi-lock coordination entirely.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A reproducible two-lock deadlock (this program will hang, illustrating the problem)',
        code: `public class DeadlockDemo {
    private static final Object lockA = new Object();
    private static final Object lockB = new Object();

    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            synchronized (lockA) {
                System.out.println("Thread-1 locked A, waiting for B");
                try { Thread.sleep(100); } catch (InterruptedException ignored) {}
                synchronized (lockB) {
                    System.out.println("Thread-1 acquired both locks");
                }
            }
        });

        Thread t2 = new Thread(() -> {
            synchronized (lockB) {
                System.out.println("Thread-2 locked B, waiting for A");
                try { Thread.sleep(100); } catch (InterruptedException ignored) {}
                synchronized (lockA) {
                    System.out.println("Thread-2 acquired both locks");
                }
            }
        });

        t1.start();
        t2.start();
        // Both threads print their first line, then block forever waiting on
        // each other's lock. "acquired both locks" never prints for either thread.
    }
}`,
        output: `Thread-1 locked A, waiting for B
Thread-2 locked B, waiting for A
(The program then hangs indefinitely — a genuine deadlock. Fixing it means having both threads
acquire lockA before lockB, i.e. a consistent global lock order.)`,
      },
    ],
    commonMistakes: [
      'Acquiring multiple locks in inconsistent order across different threads or methods — the single most common real cause of deadlocks.',
      'Holding a lock while calling into unrelated code (a callback, a listener) that might itself try to acquire another lock, creating a hidden circular dependency.',
      'Assuming the JVM will detect and recover from a deadlock automatically — for intrinsic (synchronized) locks it does not; the threads hang forever unless the process is killed.',
      'Using synchronized everywhere "to be safe" without thinking about lock acquisition order between methods that each take multiple locks.',
    ],
    keyPoints: [
      'Deadlock requires all four conditions at once: mutual exclusion, hold-and-wait, no preemption, and circular wait.',
      'A classic deadlock arises when two threads acquire two shared locks in opposite order.',
      'Consistent lock ordering across the whole codebase is the most reliable prevention strategy.',
      'tryLock() with a timeout (from java.util.concurrent.locks) allows a thread to back off instead of blocking forever.',
    ],
  },

  'thread-pool-and-the-executor-framework': {
    title: 'Thread Pool and the Executor Framework',
    intro: `Creating a brand-new Thread object for every task is expensive: each thread needs its own OS-level stack and scheduling overhead, and creating and destroying threads repeatedly under heavy load can hurt performance more than the work itself. A thread pool solves this by maintaining a fixed set of reusable worker threads that pick up tasks from a queue, so thread creation cost is paid once, not per task.`,
    sections: [
      {
        heading: 'The Executor Framework',
        body: `Java's <code>java.util.concurrent</code> package provides the Executor framework to manage thread pools without manual Thread bookkeeping. The core interface is <code>ExecutorService</code>, which accepts tasks and runs them on pooled threads. You typically obtain one through the <code>Executors</code> factory class rather than constructing a pool manually.`,
        list: [
          '<code>Executors.newFixedThreadPool(n)</code> — a pool with exactly n reusable threads; extra tasks wait in a queue.',
          '<code>Executors.newCachedThreadPool()</code> — creates threads as needed and reuses idle ones; good for many short-lived tasks.',
          '<code>Executors.newSingleThreadExecutor()</code> — a pool of exactly one thread, guaranteeing tasks run sequentially in submission order.',
          '<code>Executors.newScheduledThreadPool(n)</code> — supports delayed and periodic task execution.',
        ],
      },
      {
        heading: 'submit() vs execute()',
        body: `<code>execute(Runnable)</code>, inherited from the base <code>Executor</code> interface, fires a task with no way to observe its result or completion. <code>submit(...)</code>, defined on <code>ExecutorService</code>, accepts a <code>Runnable</code> or <code>Callable</code> and returns a <code>Future</code> object, which lets you call <code>get()</code> to block until the result is ready (or to retrieve an exception the task threw), or <code>isDone()</code> to poll without blocking. Use <code>Callable&lt;V&gt;</code> instead of <code>Runnable</code> whenever the task needs to return a value or can throw a checked exception.`,
      },
      {
        heading: 'Shutting Down an ExecutorService',
        body: `An ExecutorService keeps its threads alive waiting for work, so it must be explicitly shut down or the JVM may not exit. <code>shutdown()</code> stops accepting new tasks but lets already-submitted tasks finish; <code>shutdownNow()</code> attempts to stop all actively executing tasks immediately and returns the tasks that were still queued. It's common to call <code>shutdown()</code> and then <code>awaitTermination(timeout, unit)</code> to wait for a clean finish.`,
      },
    ],
    examples: [
      {
        caption: 'Submitting tasks to a fixed thread pool and reading results via Future',
        code: `import java.util.concurrent.*;
import java.util.List;
import java.util.ArrayList;

public class ExecutorDemo {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        ExecutorService pool = Executors.newFixedThreadPool(2);

        List<Future<Integer>> results = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            int taskId = i;
            Callable<Integer> task = () -> {
                Thread.sleep(50);
                return taskId * taskId;
            };
            results.add(pool.submit(task));
        }

        for (Future<Integer> f : results) {
            System.out.println("Result: " + f.get()); // blocks until each task completes
        }

        pool.shutdown();
        boolean finished = pool.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("Pool terminated cleanly: " + finished);
    }
}`,
        output: `Result: 1
Result: 4
Result: 9
Result: 16
Pool terminated cleanly: true
(Results print in submission order here because we read Futures in that order and block on
get(), even though only 2 threads ran the 4 tasks concurrently, two at a time.)`,
      },
    ],
    commonMistakes: [
      'Creating a brand-new Thread for every unit of work in a hot path instead of reusing a pool, causing unnecessary overhead under load.',
      'Forgetting to call shutdown() on an ExecutorService, leaving its threads alive and preventing the JVM from exiting normally.',
      'Calling execute() when you actually need the task\'s result or need to detect its exception — execute() gives no Future, so submit() is required instead.',
      'Choosing newCachedThreadPool() for CPU-bound work with unbounded task submission — with no upper limit on threads, it can create far more threads than there are CPU cores under heavy load.',
    ],
    keyPoints: [
      'A thread pool reuses a fixed set of worker threads instead of paying thread-creation cost per task.',
      'Executors provides factory methods: newFixedThreadPool, newCachedThreadPool, newSingleThreadExecutor, newScheduledThreadPool.',
      'submit() returns a Future for retrieving results or exceptions; execute() does not.',
      'Always shut down an ExecutorService (shutdown()/shutdownNow()) when it is no longer needed.',
    ],
  },
}
