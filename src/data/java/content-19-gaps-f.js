// Java memory management, GC, keyword deep-dives, collections gaps, and I/O stream classes.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content19GapsF = {
  'java-memory-management-stack-vs-heap': {
    title: 'Java Memory Management: Stack vs Heap',
    intro: `Every running Java program is given memory by the JVM, and that memory is divided into distinct runtime areas with very different lifetimes and rules. The two areas you interact with conceptually every time you write code are the stack and the heap. Understanding which one holds what is the foundation for reasoning about performance, thread safety, and errors like StackOverflowError and OutOfMemoryError.

Neither area is something you manage directly with pointers or manual allocation calls, the way you might in C. Instead, the JVM decides where each piece of data lives based purely on what kind of data it is and how it was declared — and that decision follows fixed, learnable rules.`,
    sections: [
      {
        heading: 'The Stack — Per-Thread, Ordered, Short-Lived',
        body: `Every thread in a Java program gets its own private stack, created when the thread starts. Each time a method is called, a new "stack frame" is pushed onto that thread's stack, holding that method's local variables, its parameters, and the address to return to once it finishes. Frames are removed in strict last-in-first-out (LIFO) order: the most recently called method is always the next one to finish and be popped off.`,
        list: [
          'Stores local variables (primitives) and reference variables (the reference itself, not the object it points to).',
          'Memory is reclaimed automatically the instant a method returns — no garbage collector involvement is needed for stack frames.',
          'Access is extremely fast because it is a simple push/pop structure with no scanning required.',
          'Each thread has a bounded stack size; calling methods too deeply (classically, infinite or excessive recursion) exhausts it and throws a <code>StackOverflowError</code>.',
        ],
      },
      {
        heading: 'The Heap — Shared, Unordered, GC-Managed',
        body: `The heap is a single memory area shared by all threads in the JVM. Every object and array you create with <code>new</code> — regardless of which method or thread created it — is allocated on the heap. Objects on the heap have no inherent lifetime tied to any one method call; they live for as long as something, somewhere, still holds a reachable reference to them. Because the heap has no LIFO discipline, the JVM cannot simply "pop" memory back when a method exits — reclaiming heap memory is the job of the garbage collector, which runs periodically and independently of any single method call. If the heap fills up with objects that are still reachable (or if you request more than the configured maximum), the JVM throws <code>OutOfMemoryError</code>.`,
      },
      {
        heading: 'What Lives Where, Concretely',
        body: `Consider a method with one local primitive variable and one local reference variable pointing to an object. The primitive's actual value sits directly inside the current stack frame. The reference variable also sits inside the stack frame — but what it stores is not the object itself, it is the memory address of an object living on the heap. When the method returns, the stack frame (and therefore both the primitive value and the reference variable) disappears immediately. The object on the heap, however, only disappears later, once the garbage collector determines nothing reachable still points to it.`,
        list: [
          'A local <code>int count = 5;</code> — the value 5 lives directly in the stack frame.',
          'A local <code>Order order = new Order();</code> — the reference "order" lives in the stack frame; the actual Order object lives on the heap.',
          'Instance fields inside that Order object also live on the heap, as part of the object itself, not on any stack.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Local primitive vs local object reference — what is stack and what is heap',
        code: `public class MemoryDemo {

    static void process() {
        int localCount = 5;              // primitive value lives on the stack frame of process()
        Order order = new Order();       // reference "order" lives on the stack; Order object lives on the heap
        order.id = 101;                  // this field write happens inside the heap object
        System.out.println("Count: " + localCount + ", Order id: " + order.id);
    } // stack frame for process() is popped here; "order" reference disappears, but the heap object
      // may still exist briefly until garbage collected, if nothing else references it

    public static void main(String[] args) {
        process();
    }
}

class Order {
    int id;
}`,
        output: 'Count: 5, Order id: 101',
      },
      {
        caption: 'Uncontrolled recursion exhausts the stack, not the heap',
        code: `public class StackOverflowDemo {
    static int callCount = 0;

    static void recurse() {
        callCount++;
        recurse(); // no base case — each call pushes another frame until the stack is exhausted
    }

    public static void main(String[] args) {
        try {
            recurse();
        } catch (StackOverflowError e) {
            System.out.println("Stack overflow after roughly " + callCount + " calls");
        }
    }
}`,
        output: 'Stack overflow after roughly <some large number, varies by JVM/stack size> calls',
      },
    ],
    commonMistakes: [
      'Believing objects themselves are stored "on the stack" when declared as local variables — only the reference variable is on the stack; the object is always on the heap.',
      'Assuming a StackOverflowError means memory is generally exhausted — it specifically means one thread\'s call stack went too deep, unrelated to heap usage.',
      'Assuming heap memory is freed the moment a variable that referenced an object goes out of scope — it is only eligible for collection at that point; actual reclamation happens later, when the GC runs.',
      'Forgetting that each thread has its own separate stack, so a deep call chain in one thread cannot overflow another thread\'s stack.',
    ],
    keyPoints: [
      'The stack is per-thread, LIFO, stores local variables and reference values, and is freed automatically the instant a method returns.',
      'The heap is shared across all threads, stores every object and array created with new, and is reclaimed only by the garbage collector.',
      'Deep or infinite recursion throws StackOverflowError; an overfull heap of reachable objects throws OutOfMemoryError.',
      'A local reference variable lives on the stack, but the object it points to always lives on the heap.',
    ],
  },

  'garbage-collection-in-java': {
    title: 'Garbage Collection in Java',
    intro: `Garbage collection (GC) is the process by which the JVM automatically finds and reclaims heap memory occupied by objects that a running program can no longer reach through any chain of references. It is one of Java's defining features, and it is the direct reason Java has no explicit <code>free()</code> or <code>delete</code> keyword the way C and C++ do — you never manually release an object's memory.

This does not mean memory management disappears as a concern for a Java developer. You still need to understand roughly how and when memory gets reclaimed, because misunderstanding it leads to real problems: unnecessary GC pauses, and — despite having a garbage collector — genuine memory leaks.`,
    sections: [
      {
        heading: 'The Core Idea: Reachability, Not Reference Counting',
        body: `An object becomes eligible for garbage collection when it is unreachable — meaning no active reference chain, starting from a "GC root" (such as a local variable currently on a thread's stack, a static field, or an active JNI reference), leads to it anymore. Simply setting a reference to null, letting a local variable go out of scope, or reassigning a reference are all common ways an object becomes unreachable. Note this is different from simple reference counting: two objects can hold references only to each other (an "island" of mutual references) and still both be correctly identified as garbage, because neither is reachable from a GC root.`,
      },
      {
        heading: 'The Mark-and-Sweep Idea (Conceptually)',
        body: `At a conceptual level — without tying this to any one JVM's specific implementation details — most Java garbage collectors work in two logical phases. First, a "mark" phase starts from the set of GC roots and walks every reachable reference, marking each object it finds along the way as "live." Second, a "sweep" phase scans the heap and reclaims the memory of every object that was not marked, because anything unmarked is, by definition, unreachable garbage. Modern production JVMs use much more sophisticated collectors built on this same underlying idea (generational collection, concurrent marking, compaction, and so on), but the mark-then-reclaim logic is the mental model worth keeping.`,
      },
      {
        heading: 'System.gc() Is a Hint, Not a Command',
        body: `Java exposes <code>System.gc()</code> (and the equivalent <code>Runtime.getRuntime().gc()</code>), but calling it does not force garbage collection to happen immediately, or at all. It is only a suggestion to the JVM that "now might be a good time to run garbage collection" — the JVM is completely free to ignore it. Relying on <code>System.gc()</code> for correctness (for example, expecting a finalizer to run right after calling it) is considered bad practice; real GC timing is controlled by the JVM's own heuristics.`,
      },
      {
        heading: 'Yes, Java Programs Can Still Leak Memory',
        body: `A "memory leak" in Java doesn't mean memory that's technically lost the way it can be in C — it means objects that are still reachable, and therefore never eligible for collection, even though the program logically no longer needs them. Because the GC only reclaims unreachable objects, any accidental reference that keeps an unwanted object reachable prevents it from ever being freed.`,
        list: [
          'Static collections that keep growing — a <code>static List</code> or <code>static Map</code> that objects get added to but never removed from keeps every one of those objects reachable for the entire life of the application.',
          'Listeners/callbacks that are registered but never unregistered — the object holding the listener reference (e.g. an event bus) keeps the listener, and everything it references, alive indefinitely.',
          'Long-lived caches with no eviction policy — a cache meant to be short-term that never expires or evicts entries effectively becomes a permanent, ever-growing GC root chain.',
          'Inner (non-static) classes holding an implicit reference to their enclosing instance, kept alive somewhere long-lived, unintentionally keeping the whole outer object reachable too.',
        ],
      },
    ],
    examples: [
      {
        caption: 'An object becoming unreachable and eligible for GC',
        code: `public class GcDemo {
    public static void main(String[] args) {
        StringBuilder data = new StringBuilder("large payload");
        System.out.println("Before: " + data);

        data = null; // no reference chain from a GC root reaches the old StringBuilder anymore
        System.out.println("Reference cleared; original object is now eligible for garbage collection");

        System.gc(); // only a HINT to the JVM — collection is not guaranteed to run here
        System.out.println("Requested GC (JVM may or may not act on it immediately)");
    }
}`,
        output: `Before: large payload
Reference cleared; original object is now eligible for garbage collection
Requested GC (JVM may or may not act on it immediately)`,
      },
    ],
    commonMistakes: [
      'Calling System.gc() and assuming garbage collection has now definitely happened — it is only a hint the JVM is free to ignore or delay.',
      'Assuming Java code can never have a memory leak because "Java has garbage collection" — reachable-but-unwanted objects (static collections, unregistered listeners, unbounded caches) leak just as real memory in Java as in any language.',
      'Confusing setting a reference to null with actually freeing memory — nulling a reference only makes the object eligible for collection; reclamation happens later, on the GC\'s own schedule.',
      'Writing code that depends on finalizers or GC timing for correctness (e.g., closing a file only in a finalizer) instead of using try-with-resources or explicit close() calls.',
    ],
    keyPoints: [
      'Garbage collection automatically reclaims heap memory for objects that are no longer reachable from any GC root — this is why Java has no free()/delete.',
      'The conceptual model is mark (find everything reachable) then sweep (reclaim everything not marked); mutually-referencing but unreachable "islands" are still collected correctly.',
      'System.gc() only requests garbage collection — it never guarantees it will run immediately, or at all.',
      'Memory leaks are still possible in Java when objects are unintentionally kept reachable via static collections, unregistered listeners, or unbounded caches.',
    ],
  },

  'volatile-keyword-in-java': {
    title: 'volatile Keyword in Java',
    intro: `In a multithreaded Java program, each thread can, for performance reasons, keep its own cached copy of a variable's value — in a CPU register or a core-local cache — rather than reading it fresh from main memory on every access. This is normally invisible and harmless for single-threaded code, but it creates a serious correctness problem once multiple threads share a variable: one thread can update a value while another thread keeps reading its own stale, cached copy indefinitely, never seeing the update at all.

The <code>volatile</code> keyword exists to solve exactly this "visibility" problem. It is one of the most misunderstood keywords in Java, largely because people assume it does more than it actually does — in particular, many developers wrongly assume it makes operations like incrementing a counter safe across threads, which it does not.`,
    sections: [
      {
        heading: 'The Visibility Problem, Concretely',
        body: `Imagine one thread sets a boolean flag to signal another thread to stop working, in a loop like <code>while (!stop) { doWork(); }</code>. Without <code>volatile</code>, the JVM and the underlying hardware are both allowed to assume the worker thread is the only one that ever changes "stop," so the compiler may keep the value of "stop" cached in a register instead of re-reading it from main memory on every loop iteration. If another thread sets "stop = true", the worker thread may never notice — it keeps looping forever, reading its own stale cached copy.`,
      },
      {
        heading: 'What volatile Guarantees',
        body: `Declaring a field <code>volatile</code> gives it two specific guarantees. First, visibility: every read of a volatile variable is guaranteed to see the most recently completed write to it from any thread — the JVM forces reads and writes to interact directly with main memory (conceptually) rather than a thread-local cache. Second, ordering: the compiler and processor are prevented from reordering instructions across a volatile read or write, which prevents certain classes of subtle reordering bugs in concurrent code.`,
      },
      {
        heading: 'What volatile Does NOT Guarantee: Atomicity',
        body: `This is the critical limitation. <code>volatile</code> makes individual reads and individual writes visible correctly, but it does nothing to make compound (multi-step) operations atomic. An operation like <code>counter++</code> is actually three separate steps — read the current value, add one to it, write the new value back — and two threads can each perform the "read" step before either performs the "write" step, silently losing an increment. Marking the counter <code>volatile</code> does not fix this, because visibility of each individual read/write is not the same thing as making the whole read-modify-write sequence indivisible. For that, you need either a <code>synchronized</code> block/method, or an atomic class such as <code>AtomicInteger</code>, which performs the entire read-modify-write as one indivisible hardware-backed operation.`,
      },
    ],
    examples: [
      {
        caption: 'Classic real use case: a volatile flag to stop a worker thread cleanly',
        code: `public class VolatileFlagDemo {
    private static volatile boolean stop = false;

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            int iterations = 0;
            while (!stop) {
                iterations++; // busy work; "stop" is re-checked from main memory each time
            }
            System.out.println("Worker stopped after noticing the flag, iterations=" + (iterations > 0));
        });

        worker.start();
        Thread.sleep(50);   // let the worker run briefly
        stop = true;        // visible to the worker thread immediately because "stop" is volatile
        worker.join();
        System.out.println("Main thread confirmed worker has exited");
    }
}`,
        output: `Worker stopped after noticing the flag, iterations=true
Main thread confirmed worker has exited`,
      },
      {
        caption: 'Why volatile alone is NOT enough for a shared counter',
        code: `import java.util.concurrent.atomic.AtomicInteger;

public class VolatileCounterPitfall {
    private static volatile int unsafeCounter = 0;   // visibility only, NOT atomic
    private static final AtomicInteger safeCounter = new AtomicInteger(0); // atomic read-modify-write

    public static void main(String[] args) throws InterruptedException {
        Runnable incrementBoth = () -> {
            for (int i = 0; i < 10000; i++) {
                unsafeCounter++;             // read-modify-write race: increments can be lost
                safeCounter.incrementAndGet(); // indivisible operation: never loses an increment
            }
        };

        Thread t1 = new Thread(incrementBoth);
        Thread t2 = new Thread(incrementBoth);
        t1.start(); t2.start();
        t1.join(); t2.join();

        System.out.println("Expected: 20000");
        System.out.println("unsafeCounter (volatile only): " + unsafeCounter + " (often less than 20000)");
        System.out.println("safeCounter (AtomicInteger): " + safeCounter.get());
    }
}`,
        output: `Expected: 20000
unsafeCounter (volatile only): <some value <= 20000, unreliable>
safeCounter (AtomicInteger): 20000`,
      },
    ],
    commonMistakes: [
      'Marking a counter field volatile and assuming counter++ is now thread-safe — visibility of each read/write is not the same as atomicity of the whole increment sequence.',
      'Forgetting to mark a shared flag volatile in a producer/consumer or "stop this thread" pattern, causing the reading thread to spin forever on a stale cached value.',
      'Using volatile as a general substitute for synchronized — volatile only helps single-variable visibility and ordering, not compound operations or multi-variable invariants.',
      'Assuming volatile provides mutual exclusion (locking) between threads — it provides none; two threads can still both be inside the same code "at once."',
    ],
    keyPoints: [
      'Without volatile, a thread may keep using its own cached copy of a variable and never see another thread\'s update.',
      'volatile guarantees visibility (every read sees the latest write) and prevents instruction reordering around it.',
      'volatile does NOT guarantee atomicity — compound operations like i++ still need synchronized or an atomic class like AtomicInteger.',
      'A classic correct use of volatile is a simple boolean flag used to signal a worker thread to stop.',
    ],
  },

  'transient-keyword-in-java': {
    title: 'transient Keyword in Java',
    intro: `When an object is serialized in Java — converted into a byte stream so it can be saved to a file, sent over a network, or stored elsewhere — the default behavior is to serialize every non-static field of that object, including all of its instance data, recursively. Most of the time that default is exactly what you want. Sometimes, though, a field genuinely should not be part of the saved representation, and that is what the <code>transient</code> keyword is for.

Marking a field <code>transient</code> tells the serialization mechanism to skip that field entirely: its value is simply not written into the byte stream, and when the object is later deserialized, that field comes back holding its type's plain default value rather than whatever it held before serialization.`,
    sections: [
      {
        heading: 'Default Serialization Behavior (Without transient)',
        body: `A class that implements <code>java.io.Serializable</code> has every one of its non-static fields written out by <code>ObjectOutputStream</code> when an instance is serialized, and read back by <code>ObjectInputStream</code> during deserialization. This works recursively — if a field is itself an object, that object must also be serializable (or also marked transient), or serialization fails at runtime with a <code>NotSerializableException</code>.`,
      },
      {
        heading: 'Why You Would Mark a Field transient',
        body: `There are three common, legitimate reasons to exclude a field from serialization.`,
        list: [
          '<strong>Sensitive data</strong> — a password, security token, or API key should never be written into a serialized byte stream that might end up on disk or in transit.',
          '<strong>Derived or cacheable data</strong> — a field that can always be recomputed cheaply from other fields (like a cached hash code or a computed total) doesn\'t need to be persisted; it can simply be recalculated after deserialization.',
          '<strong>Fields of a non-serializable type</strong> — a field holding a <code>Thread</code>, a <code>Socket</code>, a database connection, or any other resource tied to the live JVM process makes no sense to serialize (and often can\'t be, throwing <code>NotSerializableException</code> if you try); marking it transient lets the rest of the object serialize successfully.',
        ],
      },
      {
        heading: 'What Happens to a transient Field After Deserialization',
        body: `A transient field is not merely "skipped and left alone" — after deserialization, it is explicitly set to its type's default value: <code>0</code> (or <code>0.0</code>) for numeric primitives, <code>false</code> for boolean, <code>'\\u0000'</code> for char, and <code>null</code> for any reference type (including String). Any code that relies on a deserialized object must account for the fact that transient fields will need to be re-initialized manually, if they are needed at all after deserialization.`,
      },
    ],
    examples: [
      {
        caption: 'Serializing an object with a transient password field, then inspecting it after deserialization',
        code: `import java.io.*;

class UserSession implements Serializable {
    String username;
    transient String password; // deliberately excluded from serialization

    UserSession(String username, String password) {
        this.username = username;
        this.password = password;
    }
}

public class TransientDemo {
    public static void main(String[] args) throws Exception {
        UserSession original = new UserSession("asha", "SuperSecret123");
        System.out.println("Before serialization -> username: " + original.username + ", password: " + original.password);

        // Serialize to a byte array (in-memory, no file needed for this demo)
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(byteStream)) {
            out.writeObject(original);
        }

        // Deserialize back into a new object
        ByteArrayInputStream inStream = new ByteArrayInputStream(byteStream.toByteArray());
        UserSession restored;
        try (ObjectInputStream in = new ObjectInputStream(inStream)) {
            restored = (UserSession) in.readObject();
        }

        System.out.println("After deserialization -> username: " + restored.username + ", password: " + restored.password);
    }
}`,
        output: `Before serialization -> username: asha, password: SuperSecret123
After deserialization -> username: asha, password: null`,
      },
    ],
    commonMistakes: [
      'Assuming a transient field keeps its original value after deserialization — it is reset to the type\'s default (0/false/null), not preserved.',
      'Forgetting to mark a Thread, Socket, or other live-resource field transient, causing serialization to fail at runtime with NotSerializableException.',
      'Marking a field transient and then relying on it being usable immediately after deserialization without re-initializing it manually.',
      'Believing transient affects static fields — static fields are never serialized in the first place (serialization only applies to instance state), so marking one transient has no effect.',
    ],
    keyPoints: [
      'By default, serialization writes out every non-static field of an object, recursively.',
      'transient explicitly excludes a field from serialization — typical uses are passwords, derived/cacheable data, and non-serializable resource types like Thread or Socket.',
      'A transient field comes back as its type\'s default value (0, false, or null) after deserialization, not its original value.',
      'Omitting transient on a non-serializable field type causes a NotSerializableException when serialization is attempted.',
    ],
  },

  'enummap-enumset-properties-class-and-how-hashset-works-internally': {
    title: 'EnumMap, EnumSet, Properties Class, and How HashSet Works Internally',
    intro: `Java's collections framework includes a few specialized classes built specifically around enums, plus a legacy configuration-oriented map, and it's worth understanding one important implementation detail hiding inside a collection you likely already use constantly: HashSet. None of these are exotic — they show up regularly in real codebases — but they're easy to overlook next to the "big four" (ArrayList, HashMap, HashSet, LinkedList).

This topic ties together EnumMap and EnumSet (both purpose-built for enum keys/values), the Properties class (a holdover from very early Java still used for configuration today), and finally pulls back the curtain on how HashSet is actually implemented internally.`,
    sections: [
      {
        heading: 'EnumMap — A Map Optimized for Enum Keys',
        body: `<code>EnumMap&lt;K extends Enum&lt;K&gt;, V&gt;</code> is a specialized Map implementation whose keys must all be values of a single enum type. Because the full set of possible keys is known in advance (every enum constant), EnumMap can be implemented internally as a simple array indexed by each constant's ordinal position, rather than needing hash buckets at all. This makes it noticeably more time- and space-efficient than a general-purpose HashMap for this specific case. As a bonus, when you iterate an EnumMap, entries always come back in the enum's natural declaration order, not an unpredictable hash order.`,
      },
      {
        heading: 'EnumSet — A Set Optimized for Enum Values',
        body: `<code>EnumSet&lt;E extends Enum&lt;E&gt;&gt;</code> is the enum-specialized equivalent of EnumMap for sets: internally it's typically represented as a compact bit vector, making membership checks, additions, and set operations extremely fast. Rather than a public constructor, you build one using static factory methods: <code>EnumSet.of(...)</code> for specific constants, <code>EnumSet.allOf(SomeEnum.class)</code> for every constant in the enum, <code>EnumSet.noneOf(SomeEnum.class)</code> for an empty set of that type, and <code>EnumSet.range(start, end)</code> for a contiguous range based on declaration order.`,
      },
      {
        heading: 'The Properties Class',
        body: `<code>java.util.Properties</code> is a subclass of <code>Hashtable&lt;Object, Object&gt;</code> that has existed since Java's earliest versions and is still widely used today for simple configuration data, where every key and value is treated as a String. It is commonly loaded from a <code>.properties</code> file (simple <code>key=value</code> lines) using <code>load(InputStream)</code>, and individual values are read back with the convenience method <code>getProperty(String key)</code> (which also supports a default value overload). Properties objects can likewise be written back out to a file with <code>store(...)</code>.`,
      },
      {
        heading: 'How HashSet Works Internally',
        body: `HashSet does not have its own independent storage engine — internally, a HashSet is backed by a HashMap instance. Every element you add to a HashSet is actually stored as a key in that internal HashMap, paired with a single shared, meaningless placeholder object (traditionally a private static constant, often referred to informally as "PRESENT") used as the value for every entry. Because of this, everything already true of HashMap directly explains HashSet's behavior: no guaranteed iteration order, O(1) average-case add/contains/remove, the requirement that elements have consistent <code>hashCode()</code>/<code>equals()</code> implementations, and the same degradation to O(n) worst case if many elements collide into the same bucket.`,
      },
    ],
    examples: [
      {
        caption: 'EnumMap and EnumSet keeping enum-based data compact and ordered',
        code: `import java.util.EnumMap;
import java.util.EnumSet;

public class EnumCollectionsDemo {
    enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }

    public static void main(String[] args) {
        EnumMap<Day, String> schedule = new EnumMap<>(Day.class);
        schedule.put(Day.WED, "Team sync");
        schedule.put(Day.MON, "Sprint planning");
        System.out.println(schedule); // prints in enum declaration order, not insertion order

        EnumSet<Day> weekend = EnumSet.of(Day.SAT, Day.SUN);
        EnumSet<Day> weekdays = EnumSet.range(Day.MON, Day.FRI);
        System.out.println("Weekend: " + weekend);
        System.out.println("Is WED a weekday? " + weekdays.contains(Day.WED));
    }
}`,
        output: `{MON=Sprint planning, WED=Team sync}
Weekend: [SAT, SUN]
Is WED a weekday? true`,
      },
      {
        caption: 'Properties for simple config-style key/value data',
        code: `import java.util.Properties;

public class PropertiesDemo {
    public static void main(String[] args) {
        Properties config = new Properties();
        config.setProperty("app.name", "WebNestStudio");
        config.setProperty("app.version", "1.0");

        System.out.println(config.getProperty("app.name"));
        System.out.println(config.getProperty("app.timeout", "30")); // default used, key not set
    }
}`,
        output: `WebNestStudio
30`,
      },
    ],
    commonMistakes: [
      'Using a general HashMap for enum keys when EnumMap is available — EnumMap is faster and automatically iterates in declaration order.',
      'Trying to construct an EnumSet with "new EnumSet<>()" — it has no public constructor; you must use a static factory method like of(), allOf(), or range().',
      'Treating Properties as a type-safe map — it stores everything as Object internally (though intended for Strings), so getProperty() on a wrong key type or unset key can behave unexpectedly if you bypass the String-specific methods.',
      'Assuming HashSet has independent internal bucket logic from HashMap — it literally delegates to a backing HashMap, so any HashMap quirk (iteration order, collision handling) applies equally to HashSet.',
    ],
    keyPoints: [
      'EnumMap and EnumSet are specialized, more efficient collection implementations restricted to a single enum type, and both iterate in enum declaration order.',
      'EnumSet has no public constructor — build it using of(), allOf(), noneOf(), or range().',
      'Properties extends Hashtable and is the classic String-based key/value class for configuration, typically loaded from a .properties file via load() and read via getProperty().',
      'HashSet is internally backed by a HashMap, with every element stored as a key mapped to a single shared dummy value — so HashSet inherits all of HashMap\'s behavior.',
    ],
  },

  'java-byte-stream-classes-fileinputstream-fileoutputstream-bufferedstream-bytearraystream-datastream-objectstream-and-printstream': {
    title: 'Java Byte Stream Classes: FileInputStream, FileOutputStream, BufferedStream, ByteArrayStream, DataStream, ObjectStream, and PrintStream',
    intro: `Java's <code>java.io</code> package organizes I/O around two parallel class hierarchies: byte streams, rooted at the abstract classes <code>InputStream</code> and <code>OutputStream</code>, for raw binary data; and character streams, rooted at <code>Reader</code> and <code>Writer</code>, for text (covered in a separate topic). This topic works through the byte-stream family in depth — around seven concrete classes that each solve a distinct, common I/O problem, from raw file access to in-memory buffers to Java object serialization.

The design pattern behind almost all of them is the same: a "base" stream that actually talks to a real source or destination (a file, an in-memory array), and "wrapper" streams that you layer on top of a base stream to add a capability — buffering, reading structured primitive types, or reading whole Java objects — without changing how the underlying source or destination works.`,
    sections: [
      {
        heading: 'FileInputStream / FileOutputStream — Raw Bytes to/from a File',
        body: `<code>FileInputStream</code> reads raw bytes from a file, one byte (or a byte array chunk) at a time; <code>FileOutputStream</code> writes raw bytes to a file, creating it if it doesn't exist (and by default truncating it if it does, unless you pass the "append" constructor flag). Both work directly with bytes, with no interpretation of encoding — appropriate for binary files like images, or as the base stream that other wrapper streams build on top of for text or structured files.`,
      },
      {
        heading: 'BufferedInputStream / BufferedOutputStream — Fewer, Bigger I/O Calls',
        body: `Reading or writing a file one byte at a time via FileInputStream/FileOutputStream directly is extremely slow in practice, because every single byte read or write potentially triggers an expensive underlying system call to the operating system. <code>BufferedInputStream</code> and <code>BufferedOutputStream</code> wrap another stream and maintain an internal in-memory buffer (commonly a few kilobytes): reads pull a large chunk from the underlying stream into the buffer at once and then serve individual byte requests from that fast in-memory buffer, and writes accumulate into the buffer and only flush out to the real destination once the buffer fills (or is explicitly flushed/closed). The result is far fewer actual system calls for the same amount of data, which is a substantial real-world performance win.`,
      },
      {
        heading: 'ByteArrayInputStream / ByteArrayOutputStream — In-Memory, No File Needed',
        body: `<code>ByteArrayInputStream</code> lets you treat an existing in-memory <code>byte[]</code> as a readable stream source, and <code>ByteArrayOutputStream</code> lets you write bytes to a growable in-memory buffer instead of a file, retrieving the accumulated bytes afterward with <code>toByteArray()</code>. These are useful whenever you want to reuse stream-based APIs (like ObjectOutputStream, seen below) without touching the filesystem at all — for example, serializing an object purely to inspect or transmit its bytes in memory.`,
      },
      {
        heading: 'DataInputStream / DataOutputStream — Java Primitives as Binary',
        body: `<code>DataOutputStream</code> wraps another output stream and adds methods like <code>writeInt(int)</code>, <code>writeDouble(double)</code>, and <code>writeUTF(String)</code> that write Java primitive values directly in a compact, well-defined binary format (a fixed number of bytes, in a specified byte order). <code>DataInputStream</code> wraps an input stream with the mirror-image methods (<code>readInt()</code>, <code>readDouble()</code>, <code>readUTF()</code>) to read those exact values back — as long as you read them back in the same order and types you wrote them, which is the caller's responsibility to track.`,
      },
      {
        heading: 'ObjectInputStream / ObjectOutputStream — Serializing Whole Objects',
        body: `<code>ObjectOutputStream</code> and <code>ObjectInputStream</code> implement Java's object serialization mechanism: <code>writeObject(Object)</code> converts an entire object graph (an object and everything it references) that implements <code>Serializable</code> into a byte stream, and <code>readObject()</code> reconstructs an equivalent object graph from those bytes. This is the same mechanism referenced in the Serialization and transient-keyword topics — fields marked transient are skipped, and any referenced object that isn't itself Serializable causes a NotSerializableException.`,
      },
      {
        heading: 'PrintStream — The Convenience Layer You Already Use',
        body: `<code>PrintStream</code> wraps an OutputStream and adds the familiar high-level convenience methods <code>print()</code>, <code>println()</code>, and <code>printf()</code>, converting values of any type to their text representation automatically and never throwing a checked IOException from these methods. The most common PrintStream in existence is <code>System.out</code> itself — every <code>System.out.println(...)</code> call you've ever written is a PrintStream method call over an underlying OutputStream connected to the console. Two much rarer, related pieces of the same I/O family worth knowing by name: <code>System.console()</code>, which gives access to the actual character-based console device when a program is run interactively (useful for reading passwords without echoing input), and <code>FilePermission</code>, a security-policy class used to grant or restrict file access rights under a Java SecurityManager.`,
      },
    ],
    examples: [
      {
        caption: 'Buffered file copy vs an in-memory ByteArrayOutputStream, plus DataOutputStream for primitives',
        code: `import java.io.*;

public class ByteStreamsDemo {
    public static void main(String[] args) throws IOException {
        // 1) FileOutputStream wrapped by BufferedOutputStream: fewer real I/O calls
        try (BufferedOutputStream out =
                 new BufferedOutputStream(new FileOutputStream("data.bin"))) {
            out.write("Hello Streams".getBytes());
        }

        // 2) Read it back through BufferedInputStream wrapping FileInputStream
        try (BufferedInputStream in =
                 new BufferedInputStream(new FileInputStream("data.bin"))) {
            byte[] buffer = new byte[13];
            in.read(buffer);
            System.out.println("From file: " + new String(buffer));
        }

        // 3) In-memory byte array stream instead of touching the filesystem
        ByteArrayOutputStream memOut = new ByteArrayOutputStream();
        memOut.write("In-memory bytes".getBytes());
        byte[] memBytes = memOut.toByteArray();
        ByteArrayInputStream memIn = new ByteArrayInputStream(memBytes);
        byte[] readBack = new byte[memBytes.length];
        memIn.read(readBack);
        System.out.println("From memory: " + new String(readBack));

        // 4) DataOutputStream / DataInputStream for primitive types
        ByteArrayOutputStream dataBuffer = new ByteArrayOutputStream();
        try (DataOutputStream dataOut = new DataOutputStream(dataBuffer)) {
            dataOut.writeInt(42);
            dataOut.writeDouble(3.14);
        }
        try (DataInputStream dataIn =
                 new DataInputStream(new ByteArrayInputStream(dataBuffer.toByteArray()))) {
            System.out.println("Read int: " + dataIn.readInt());
            System.out.println("Read double: " + dataIn.readDouble());
        }
    }
}`,
        output: `From file: Hello Streams
From memory: In-memory bytes
Read int: 42
Read double: 3.14`,
      },
      {
        caption: 'ObjectOutputStream/ObjectInputStream for full object serialization, and PrintStream basics',
        code: `import java.io.*;

class Point implements Serializable {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
    public String toString() { return "Point(" + x + ", " + y + ")"; }
}

public class ObjectStreamDemo {
    public static void main(String[] args) throws Exception {
        ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
        try (ObjectOutputStream objOut = new ObjectOutputStream(byteBuffer)) {
            objOut.writeObject(new Point(3, 7));
        }

        try (ObjectInputStream objIn =
                 new ObjectInputStream(new ByteArrayInputStream(byteBuffer.toByteArray()))) {
            Point restored = (Point) objIn.readObject();
            System.out.println("Restored: " + restored);
        }

        // System.out is itself a PrintStream wrapping an OutputStream
        PrintStream out = System.out;
        out.println("PrintStream println");
        out.printf("PrintStream printf: %d + %d = %d%n", 2, 3, 5);
    }
}`,
        output: `Restored: Point(3, 7)
PrintStream println
PrintStream printf: 2 + 3 = 5`,
      },
    ],
    commonMistakes: [
      'Reading or writing files byte-by-byte directly with FileInputStream/FileOutputStream in a loop instead of wrapping them in BufferedInputStream/BufferedOutputStream, causing far more system calls than necessary.',
      'Forgetting that DataInputStream requires reading primitives back in the exact same order and types they were written in — mismatched read/write order silently produces garbage values.',
      'Trying to serialize an object with ObjectOutputStream when it (or one of its fields) doesn\'t implement Serializable, resulting in a runtime NotSerializableException.',
      'Not closing streams (or not using try-with-resources) — buffered writers in particular may not flush their final buffered bytes to the destination until closed, silently losing data.',
    ],
    keyPoints: [
      'FileInputStream/FileOutputStream give raw, unbuffered byte access to files; BufferedInputStream/BufferedOutputStream wrap them to drastically cut down real I/O system calls.',
      'ByteArrayInputStream/ByteArrayOutputStream provide the same stream APIs entirely in memory, with no filesystem involved.',
      'DataInputStream/DataOutputStream read and write Java primitives in a well-defined binary format; ObjectInputStream/ObjectOutputStream serialize entire Serializable object graphs.',
      'PrintStream (what System.out actually is) adds convenient print/println/printf methods over any OutputStream; System.console() and FilePermission are rarer, related pieces of the same I/O family.',
    ],
  },

  'java-character-stream-classes-filereader-writer-bufferedreader-writer-chararrayreader-writer-stringreader-writer-and-printwriter': {
    title: 'Java Character Stream Classes: FileReader/Writer, BufferedReader/Writer, CharArrayReader/Writer, StringReader/Writer, and PrintWriter',
    intro: `Alongside the byte-stream hierarchy (InputStream/OutputStream), Java provides a completely parallel hierarchy for text: character streams, rooted at the abstract classes <code>Reader</code> and <code>Writer</code>. The reason this second hierarchy exists at all — rather than just using byte streams for everything — comes down to text encoding: many characters, especially outside basic ASCII, are represented by more than one byte in encodings like UTF-8, and naively treating raw bytes as characters (one byte = one character) corrupts any text containing such characters. Character streams handle the conversion between bytes and properly decoded characters correctly and consistently.

Like the byte-stream family, character streams follow the same base-stream-plus-wrapper design: a small set of classes talk to an actual source or destination (a file, an in-memory char array, a String), and wrapper classes layer extra capability — buffering, line-based reading, or convenient formatted output — on top.`,
    sections: [
      {
        heading: 'FileReader / FileWriter — Basic Text File I/O',
        body: `<code>FileReader</code> and <code>FileWriter</code> are the character-stream equivalents of FileInputStream/FileOutputStream: they read and write text files, but crucially they decode/encode bytes using a character encoding (historically the platform default, though modern overloads let you specify one explicitly) instead of handing you raw bytes. This makes them the correct choice — rather than a byte stream — whenever the file's content is meant to be interpreted as text.`,
      },
      {
        heading: 'BufferedReader / BufferedWriter — Line-Based, Buffered Text I/O',
        body: `<code>BufferedReader</code> wraps another Reader and adds internal buffering (for the same performance reason as BufferedInputStream) plus, most usefully, the <code>readLine()</code> method, which reads and returns one full line of text at a time (without the line terminator), returning <code>null</code> once the end of the stream is reached. <code>BufferedWriter</code> mirrors this on the output side, buffering writes and providing <code>newLine()</code> to write a platform-appropriate line separator. Reading a text file line by line via <code>BufferedReader.readLine()</code> is by far the most common real-world pattern for processing text files in Java.`,
      },
      {
        heading: 'CharArrayReader / CharArrayWriter — In-Memory char[] Streams',
        body: `<code>CharArrayReader</code> and <code>CharArrayWriter</code> are the character-stream equivalents of ByteArrayInputStream/ByteArrayOutputStream: CharArrayReader treats an existing in-memory <code>char[]</code> as a readable source, and CharArrayWriter accumulates characters written to it into a growable internal buffer, retrievable afterward with <code>toCharArray()</code> or <code>toString()</code> — useful whenever you want stream-style text processing without any file or String object as the source/destination.`,
      },
      {
        heading: 'StringReader / StringWriter — Treating a String as a Stream',
        body: `<code>StringReader</code> lets you treat an existing String as a character stream source, which is especially handy for feeding fixed test data into code that expects a Reader without creating a temporary file. <code>StringWriter</code> is the reverse: a Writer that accumulates everything written to it internally, letting you build up text incrementally (for example, through something that expects a Writer, like certain templating or formatting APIs) and then retrieve the whole result as a String via <code>toString()</code> once you're done.`,
      },
      {
        heading: 'PushbackReader and PrintWriter',
        body: `<code>PushbackReader</code> is a specialized wrapper that adds an <code>unread(int)</code> method, letting code "push back" a character it just read so that the very next read call returns it again — useful for simple parsers that need to peek one character ahead before deciding how to proceed. <code>PrintWriter</code> is the character-stream counterpart to PrintStream: it adds the same high-level convenience methods (<code>print()</code>, <code>println()</code>, <code>printf()</code>) but operates over a Writer, and is very commonly constructed wrapping a BufferedWriter so that formatted text output is also efficiently buffered before it reaches the underlying file or destination.`,
      },
    ],
    examples: [
      {
        caption: 'Writing and reading a text file line-by-line with buffered character streams',
        code: `import java.io.*;

public class CharStreamsDemo {
    public static void main(String[] args) throws IOException {
        // Write text using FileWriter wrapped by BufferedWriter (and PrintWriter for convenience)
        try (PrintWriter writer =
                 new PrintWriter(new BufferedWriter(new FileWriter("notes.txt")))) {
            writer.println("First line");
            writer.println("Second line");
            writer.printf("Line number %d%n", 3);
        }

        // Read it back line-by-line using BufferedReader wrapping FileReader
        try (BufferedReader reader =
                 new BufferedReader(new FileReader("notes.txt"))) {
            String line;
            int count = 0;
            while ((line = reader.readLine()) != null) {
                count++;
                System.out.println(count + ": " + line);
            }
        }
    }
}`,
        output: `1: First line
2: Second line
3: Line number 3`,
      },
      {
        caption: 'StringReader/StringWriter and CharArrayWriter working entirely in memory, no file involved',
        code: `import java.io.*;

public class InMemoryCharStreamsDemo {
    public static void main(String[] args) throws IOException {
        // StringReader: treat an existing String as a character stream source
        StringReader stringReader = new StringReader("alpha\\nbeta\\ngamma");
        BufferedReader bufferedOverString = new BufferedReader(stringReader);
        String line;
        while ((line = bufferedOverString.readLine()) != null) {
            System.out.println("Read: " + line);
        }

        // StringWriter: build text incrementally, then retrieve it as a String
        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);
        printWriter.println("Built");
        printWriter.println("incrementally");
        printWriter.flush();
        System.out.println("Final text:\\n" + stringWriter.toString());

        // CharArrayWriter: accumulate characters into an in-memory char[] buffer
        CharArrayWriter charArrayWriter = new CharArrayWriter();
        charArrayWriter.write("in-memory chars");
        char[] chars = charArrayWriter.toCharArray();
        System.out.println("CharArrayWriter produced " + chars.length + " characters");
    }
}`,
        output: `Read: alpha
Read: beta
Read: gamma
Final text:
Built
incrementally

CharArrayWriter produced 15 characters`,
      },
    ],
    commonMistakes: [
      'Using FileInputStream/FileOutputStream (byte streams) for text files instead of FileReader/FileWriter (character streams), risking corrupted output for any multi-byte encoded characters.',
      'Forgetting that BufferedReader.readLine() returns null (not an empty string or exception) at end of stream, and looping incorrectly as a result.',
      'Not flushing a PrintWriter (or closing it) before reading back what was written to a StringWriter or a file — buffered output may not have been pushed through yet.',
      'Assuming StringReader/StringWriter and CharArrayReader/CharArrayWriter do file I/O — they are purely in-memory and never touch the filesystem.',
    ],
    keyPoints: [
      'Character streams (Reader/Writer) exist to correctly decode/encode text, unlike byte streams, which have no concept of character encoding.',
      'FileReader/FileWriter handle basic text file I/O; BufferedReader/BufferedWriter add buffering plus line-based reading via readLine().',
      'CharArrayReader/CharArrayWriter and StringReader/StringWriter provide in-memory character stream sources/sinks backed by a char[] or a String, with no file involved.',
      'PushbackReader supports unreading a character for simple lookahead parsing; PrintWriter adds print/println/printf convenience methods over a Writer, commonly wrapping a BufferedWriter.',
    ],
  },
}
