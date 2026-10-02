// Practice blocks for the Memory Management and Special Keywords module. Merged onto
// the lesson entries in index.js by slug, so the lesson prose files stay unchanged.
// Exercises avoid anything that depends on when the garbage collector runs, so their
// output is the same on every run.
export const practice07Memory = {
  'java-memory-management-stack-vs-heap': {
    whyItMatters: `Two of the most common failures in a Java application are <code>StackOverflowError</code> and <code>OutOfMemoryError</code>, and they have different causes and different fixes. Knowing what lives on the stack and what lives on the heap also explains everyday behaviour: why a method can change an object you passed in but not an <code>int</code>, and why local variables are safe between threads while shared objects are not.`,
    diagram: {
      caption: 'The local variables of each method call sit in a stack frame. The reference order is on the stack; the Order object it points to is on the heap.',
      svg: `<svg viewBox="0 0 640 230" role="img" aria-label="A thread's stack holds a frame for main and a frame for process. The process frame holds localCount = 5 and the reference order, which points to an Order object with id = 101 on the heap" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-monospace, monospace" font-size="13">
  <text x="140" y="20" text-anchor="middle" fill="currentColor" stroke="none">Stack (one per thread)</text>
  <rect x="20" y="30" width="240" height="180" rx="6"/>
  <rect x="35" y="45" width="210" height="80" rx="6" stroke-width="3"/>
  <text x="47" y="65" fill="currentColor" stroke="none" font-size="11">frame: process()</text>
  <text x="47" y="88" fill="currentColor" stroke="none">localCount = 5</text>
  <text x="47" y="110" fill="currentColor" stroke="none">order = (reference)</text>
  <rect x="35" y="140" width="210" height="55" rx="6"/>
  <text x="47" y="160" fill="currentColor" stroke="none" font-size="11">frame: main()</text>
  <text x="47" y="182" fill="currentColor" stroke="none">args = (reference)</text>
  <text x="490" y="20" text-anchor="middle" fill="currentColor" stroke="none">Heap (shared by all threads)</text>
  <rect x="360" y="30" width="260" height="180" rx="6"/>
  <rect x="400" y="75" width="180" height="60" rx="6"/>
  <text x="412" y="97" fill="currentColor" stroke="none" font-size="11">Order object</text>
  <text x="412" y="120" fill="currentColor" stroke="none">id = 101</text>
  <path d="M245 105 H400"/><path d="M394 99 L400 105 L394 111"/>
  <text x="490" y="180" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">freed later by the garbage collector</text>
</svg>`,
    },
    productionExample: {
      heading: 'Where this is used',
      body: `The sizes of both areas are set when the JVM starts. <code>-Xss</code> sets the stack size of each thread, and <code>-Xms</code> and <code>-Xmx</code> set the initial and maximum heap size. A service that fails with <code>OutOfMemoryError</code> is usually given a larger <code>-Xmx</code> or has a memory leak fixed; a <code>StackOverflowError</code> is almost always fixed in the code, by correcting the recursion, and not by raising <code>-Xss</code>.`,
    },
    exercise: {
      prompt: `The method <code>bump</code> receives a copy of an <code>int</code>, so it cannot change the caller's variable. Complete <code>rename</code> so that it changes the <code>id</code> of the object the caller passed in.

Expected output: <code>5</code> then <code>202</code>`,
      starterCode: `public class ValueOrReference {

    static void bump(int n) {
        n = n + 100; // changes only this method's own copy
    }

    static void rename(Order o) {
        // TODO: set the id of the object to 202
    }

    public static void main(String[] args) {
        int count = 5;
        Order order = new Order();
        order.id = 101;

        bump(count);
        rename(order);

        System.out.println(count);
        System.out.println(order.id);
    }
}

class Order {
    int id;
}`,
      hints: [
        'The parameter <code>o</code> is a copy of the reference, so it points to the same heap object as <code>order</code>.',
        'Writing a field through <code>o</code> changes that shared object. Assigning a new object to <code>o</code> would not affect the caller.',
      ],
      solution: `public class ValueOrReference {

    static void bump(int n) {
        n = n + 100; // changes only this method's own copy
    }

    static void rename(Order o) {
        o.id = 202; // writes into the heap object the caller also refers to
    }

    public static void main(String[] args) {
        int count = 5;
        Order order = new Order();
        order.id = 101;

        bump(count);
        rename(order);

        System.out.println(count);    // 5
        System.out.println(order.id); // 202
    }
}

class Order {
    int id;
}`,
    },
    quiz: [
      {
        question: 'In <code>Order order = new Order();</code> written inside a method, where is the <code>Order</code> object stored?',
        options: ['On the heap', 'On the stack', 'In the stack frame of main', 'In a CPU register'],
        answer: 0,
        explanation: 'Every object created with new is on the heap. Only the reference variable order is in the stack frame.',
      },
      {
        question: 'Which error does unbounded recursion cause?',
        options: ['OutOfMemoryError', 'StackOverflowError', 'NullPointerException', 'IllegalStateException'],
        answer: 1,
        explanation: 'Each call adds a frame to the thread\'s stack. With no base case the stack runs out of space.',
      },
      {
        question: 'Two threads run the same method at the same time. Do they share its local variables?',
        options: ['Yes, always', 'Only if the variables are primitives', 'No; each thread has its own stack and so its own copies', 'Only if the method is static'],
        answer: 2,
        explanation: 'Local variables are in a stack frame, and each thread has a separate stack. Objects those variables refer to can still be shared.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between stack and heap memory in Java?',
        answer: `Each thread has its own stack. It holds one frame per method call, containing that call's local variables and parameters, and a frame is removed as soon as the method returns. The heap is one area shared by all threads and holds every object and array. Heap memory is reclaimed by the garbage collector once an object is no longer reachable. A stack that grows too deep throws <code>StackOverflowError</code>; a heap that is full of reachable objects throws <code>OutOfMemoryError</code>.`,
      },
      {
        question: 'Is Java pass-by-value or pass-by-reference?',
        answer: `Java is always pass-by-value. For a primitive, the value is copied. For an object, the reference is copied, so the method and the caller both point to the same heap object. The method can therefore change the object's fields, but assigning a new object to its parameter has no effect on the caller's variable.`,
      },
      {
        question: 'Where are instance fields and static fields stored?',
        answer: `Instance fields are part of the object, so they are on the heap, including fields of primitive type. Static fields belong to the class and not to any object; there is one copy, and it stays reachable for as long as the class is loaded. Neither kind is stored on a thread's stack.`,
      },
    ],
  },

  'garbage-collection-in-java': {
    whyItMatters: `Garbage collection removes a whole category of bugs, but it does not remove the need to think about memory. A service that slows down over several days and then fails with <code>OutOfMemoryError</code> nearly always has objects that are still reachable but no longer needed. To find and fix that, you need to know the one rule the collector follows: an object is kept for as long as it can be reached.`,
    productionExample: {
      heading: 'Where this is used',
      body: `Memory leaks in production are diagnosed from a heap dump, which is a snapshot of every object on the heap. Starting the JVM with <code>-XX:+HeapDumpOnOutOfMemoryError</code> writes one automatically when the heap runs out. Opening it in a tool such as Eclipse MAT or VisualVM shows which objects take the most memory and which chain of references keeps them reachable. That chain usually ends at a static collection or a cache with no size limit.`,
    },
    exercise: {
      prompt: `The static list below grows for as long as the program runs, so everything added to it stays reachable. Change <code>remember</code> so the list keeps only the 3 most recent terms.

Expected output: <code>3</code> then <code>[c, d, e]</code>`,
      starterCode: `import java.util.ArrayList;
import java.util.List;

public class RecentSearches {
    private static final int LIMIT = 3;
    private static final List<String> recent = new ArrayList<>();

    static void remember(String term) {
        recent.add(term);
        // TODO: if the list is now longer than LIMIT, remove the oldest term
    }

    public static void main(String[] args) {
        for (String term : new String[] {"a", "b", "c", "d", "e"}) {
            remember(term);
        }
        System.out.println(recent.size());
        System.out.println(recent);
    }
}`,
      hints: [
        'The oldest term is at index 0.',
        '<code>recent.remove(0)</code> removes it. Once the list no longer refers to that string, the string can be collected.',
      ],
      solution: `import java.util.ArrayList;
import java.util.List;

public class RecentSearches {
    private static final int LIMIT = 3;
    private static final List<String> recent = new ArrayList<>();

    static void remember(String term) {
        recent.add(term);
        if (recent.size() > LIMIT) {
            recent.remove(0); // the oldest term is no longer reachable from the list
        }
    }

    public static void main(String[] args) {
        for (String term : new String[] {"a", "b", "c", "d", "e"}) {
            remember(term);
        }
        System.out.println(recent.size()); // 3
        System.out.println(recent);        // [c, d, e]
    }
}`,
    },
    quiz: [
      {
        question: 'When does an object become eligible for garbage collection?',
        options: ['When its variable goes out of scope', 'When its reference count is zero', 'When System.gc() is called', 'When no chain of references from a GC root reaches it'],
        answer: 3,
        explanation: 'The test is reachability from GC roots such as local variables on a stack and static fields.',
      },
      {
        question: 'What does <code>System.gc()</code> do?',
        options: ['Suggests that the JVM run a collection; the JVM may ignore it', 'Runs a full collection immediately', 'Frees all objects set to null', 'Stops the program until memory is free'],
        answer: 0,
        explanation: 'It is a request. The JVM decides when to collect.',
      },
      {
        question: 'Objects A and B refer only to each other, and nothing else refers to either. What happens to them?',
        options: ['They are never collected', 'Both are eligible for collection', 'Only A is collected', 'The JVM throws an error'],
        answer: 1,
        explanation: 'Neither is reachable from a GC root, so both are garbage. Java does not rely on reference counting.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How does garbage collection work in Java?',
        answer: `The collector starts from the GC roots — local variables on thread stacks, static fields and a few others — and follows every reference to mark the objects that are reachable. Everything not marked is garbage and its memory is reclaimed. Most collectors are also generational: new objects are allocated in a young area that is collected often, because most objects become unreachable soon after they are created, and objects that survive are moved to an old area that is collected less often.`,
      },
      {
        question: 'Can a Java program have a memory leak?',
        answer: `Yes. A leak in Java is an object that the program no longer needs but that is still reachable, so the collector must keep it. Common causes are a static collection that only grows, a cache with no eviction, and listeners that are registered and never removed. The fix is to remove the reference, for example by limiting the size of the cache or unregistering the listener.`,
      },
      {
        question: 'Why should you not rely on finalize() to release resources?',
        answer: `There is no guarantee of when <code>finalize()</code> runs, or that it runs at all, so a file or connection released there may stay open indefinitely. It has been deprecated since Java 9. Resources should be closed with try-with-resources or an explicit <code>close()</code> call.`,
      },
    ],
  },

  'volatile-keyword-in-java': {
    whyItMatters: `A missing <code>volatile</code> causes one of the hardest bugs to reproduce: a thread that never sees a change made by another thread, often only on certain machines or after the code has been running for a while. The opposite mistake is just as common: adding <code>volatile</code> to a counter and assuming it is now safe. Knowing exactly what the keyword guarantees prevents both.`,
    exercise: {
      prompt: `Two threads each add 1 to a shared counter 10,000 times. With a <code>volatile int</code> and <code>counter++</code>, some increments are lost and the total varies between runs. Replace the counter with an <code>AtomicInteger</code> so the program always prints the same total.

Expected output: <code>20000</code>`,
      starterCode: `public class SafeCounter {
    // TODO: replace this with an AtomicInteger
    private static volatile int counter = 0;

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 0; i < 10000; i++) {
                counter++; // TODO: use an atomic increment
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println(counter); // TODO: print the value of the AtomicInteger
    }
}`,
      hints: [
        '<code>AtomicInteger</code> is in <code>java.util.concurrent.atomic</code>.',
        '<code>incrementAndGet()</code> adds 1 as a single step, and <code>get()</code> reads the current value.',
      ],
      solution: `import java.util.concurrent.atomic.AtomicInteger;

public class SafeCounter {
    private static final AtomicInteger counter = new AtomicInteger(0);

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 0; i < 10000; i++) {
                counter.incrementAndGet(); // read, add and write as one step
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println(counter.get()); // 20000
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>volatile</code> guarantee for a field?',
        options: ['Only one thread can use it at a time', 'A read always sees the most recent write made by any thread', 'Compound operations on it are atomic', 'It cannot be changed after it is set'],
        answer: 1,
        explanation: 'volatile guarantees visibility. It does not lock anything and does not make compound operations atomic.',
      },
      {
        question: 'Is <code>count++</code> thread-safe when <code>count</code> is a <code>volatile int</code>?',
        options: ['Yes', 'Only with two threads', 'No; the read, the add and the write are separate steps', 'Only on a single-core machine'],
        answer: 2,
        explanation: 'Two threads can read the same value before either writes, and one increment is lost.',
      },
      {
        question: 'Which is a suitable use of <code>volatile</code>?',
        options: ['A counter incremented by many threads', 'Replacing every synchronized block', 'Protecting two fields that must change together', 'A boolean flag that one thread sets to tell another to stop'],
        answer: 3,
        explanation: 'A flag is written in one step and read in one step, so visibility is all it needs.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between volatile and synchronized?',
        answer: `<code>volatile</code> applies to a field and guarantees only that a write by one thread is visible to reads in other threads. It never blocks a thread. <code>synchronized</code> applies to a block or method and lets one thread in at a time, which gives both visibility and atomicity for everything inside the block. Use <code>volatile</code> for a single value that is written and read in one step; use <code>synchronized</code>, a lock or an atomic class when an operation has several steps.`,
      },
      {
        question: 'Why is the instance field declared volatile in a double-checked locking singleton?',
        answer: `Creating an object involves allocating memory, running the constructor and assigning the reference, and without <code>volatile</code> the assignment may become visible to another thread before the constructor has finished. That thread would pass the first null check and use a partly constructed object. Declaring the field <code>volatile</code> prevents this reordering, so another thread sees either <code>null</code> or a fully constructed instance.`,
      },
      {
        question: 'When would you use AtomicInteger instead of volatile?',
        answer: `When the new value depends on the old one, as in a counter or a running total. <code>AtomicInteger</code> performs the read, the calculation and the write as a single atomic operation, without a lock. A <code>volatile int</code> cannot do this because another thread may change the value between the read and the write.`,
      },
    ],
  },

  'transient-keyword-in-java': {
    whyItMatters: `Serialized objects are written to files, caches, session stores and message queues, where they can be read by anyone with access to that storage. A password or token left in a serialized object is a security problem. <code>transient</code> is the standard way to keep a field out of the saved form, and it is also what allows a class that holds a connection or a thread to be serialized at all.`,
    exercise: {
      prompt: `As written, the program saves the PIN along with the owner's name and prints <code>asha 4321</code>. Change the <code>Account</code> class so the PIN is not serialized.

Expected output: <code>asha 0</code>`,
      starterCode: `import java.io.*;

class Account implements Serializable {
    String owner;
    int pin; // TODO: keep this field out of the serialized form

    Account(String owner, int pin) {
        this.owner = owner;
        this.pin = pin;
    }
}

public class TransientPin {
    public static void main(String[] args) throws Exception {
        Account original = new Account("asha", 4321);

        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(original);
        }

        Account restored;
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            restored = (Account) in.readObject();
        }

        System.out.println(restored.owner + " " + restored.pin);
    }
}`,
      hints: [
        'Only the declaration of <code>pin</code> needs to change.',
        'A transient <code>int</code> comes back as <code>0</code> after deserialization.',
      ],
      solution: `import java.io.*;

class Account implements Serializable {
    String owner;
    transient int pin; // not written to the byte stream

    Account(String owner, int pin) {
        this.owner = owner;
        this.pin = pin;
    }
}

public class TransientPin {
    public static void main(String[] args) throws Exception {
        Account original = new Account("asha", 4321);

        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(original);
        }

        Account restored;
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            restored = (Account) in.readObject();
        }

        System.out.println(restored.owner + " " + restored.pin); // asha 0
    }
}`,
    },
    quiz: [
      {
        question: 'What value does a <code>transient String</code> field have after the object is deserialized?',
        options: ['null', 'An empty string', 'Its original value', 'It throws an exception'],
        answer: 0,
        explanation: 'A transient field is not saved, so it comes back as the default for its type, which is null for a reference type.',
      },
      {
        question: 'A serializable class has a <code>Thread</code> field that is not marked transient. What happens when an instance holding a thread is serialized?',
        options: ['The thread is saved and restarted later', 'NotSerializableException is thrown', 'The field is skipped automatically', 'The code does not compile'],
        answer: 1,
        explanation: 'Thread does not implement Serializable, so writing the object fails at runtime.',
      },
      {
        question: 'What is the effect of marking a <code>static</code> field <code>transient</code>?',
        options: ['The field is serialized twice', 'The field becomes an instance field', 'The field is excluded from serialization, which it was already', 'It does not compile'],
        answer: 2,
        explanation: 'Static fields belong to the class and are never serialized, so transient adds nothing.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the transient keyword used for?',
        answer: `It marks an instance field that should be left out when the object is serialized. Typical cases are sensitive values such as passwords, values that can be recalculated from other fields, and fields whose type cannot be serialized, such as a thread or a database connection. After deserialization the field holds the default value for its type.`,
      },
      {
        question: 'What is the difference between transient and static with respect to serialization?',
        answer: `Neither is written to the stream, but for different reasons. A <code>static</code> field is part of the class and not of any object, so serialization, which saves object state, does not include it; after deserialization it has whatever value the class currently holds. A <code>transient</code> field is part of the object and is excluded on purpose; after deserialization it has the default value for its type.`,
      },
      {
        question: 'How can a transient field be given a value again after deserialization?',
        answer: `Define a <code>private void readObject(ObjectInputStream in)</code> method in the class. Call <code>in.defaultReadObject()</code> first to restore the ordinary fields, then set the transient field, for example by recalculating it or opening a new connection. Another option is to initialise the field lazily the first time it is used.`,
      },
    ],
  },
}
