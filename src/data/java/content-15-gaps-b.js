// Java Collections Deep Dive & Modern Java module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content15GapsB = {
  'how-hashmap-works-internally': {
    title: 'How HashMap Works Internally',
    intro: `HashMap is the most widely used implementation of the Map interface in Java, and it is also one of the most misunderstood. Most developers know that it stores key-value pairs and offers "average O(1)" performance for get() and put(), but far fewer can explain why that performance holds, or what happens the moment two unrelated keys collide. Understanding HashMap's internals is not academic trivia — it directly explains real production bugs like objects "disappearing" from a map, lookups silently returning null, or a HashMap that mysteriously becomes as slow as a linked list.

This lesson walks through the actual mechanics: the bucket array, the hashing and spreading function, collision resolution via chaining and treeification, the equals()/hashCode() contract, and the load factor and resizing process that keeps HashMap fast as it grows.`,
    sections: [
      {
        heading: 'The Bucket Array and Hash Spreading',
        body: `Internally, a HashMap holds an array of "buckets" (technically an array of Node references, called the table). Each bucket can hold zero, one, or many entries. When you call put(key, value), HashMap does not search the whole array — it computes an index directly from the key's hash code so it can jump straight to the right bucket.

The index is computed in two steps. First, Java calls key.hashCode() to get a 32-bit integer. Second, HashMap applies an internal "spreading" function that XORs the higher 16 bits of the hash into the lower 16 bits (roughly <code>hash ^ (hash >>> 16)</code>). This spreading step matters because the bucket index is ultimately derived using only the lower bits of the hash (via a bitwise AND with <code>table.length - 1</code>, since the table size is always a power of two). Without spreading, two hash codes that differ only in their high bits would collide constantly, because those high bits would otherwise never influence which bucket is chosen.`,
        list: [
          'bucketIndex = (table.length - 1) & spreadHash(key.hashCode())',
          'Table length is always a power of two (default 16), which makes the bitwise AND behave like a fast modulus operation.',
          'Two keys with completely different hashCode() values can still land in the same bucket once reduced to an index — this is expected and normal, not a bug.',
        ],
      },
      {
        heading: 'Collisions: Chaining and Treeification',
        body: `A collision happens when two different keys are mapped to the same bucket index. HashMap handles this by chaining: each bucket effectively becomes a linked list of entries. When you call get(key), HashMap jumps to the bucket via the hash, then walks the (usually very short) chain, comparing each stored key with equals() until it finds a match.

As long as chains stay short, this is still effectively O(1) because chain length rarely grows past one or two entries in a well-distributed map. But since Java 8, if a single bucket's chain grows beyond a threshold (8 entries) and the table has at least 64 buckets, HashMap converts that bucket's linked list into a red-black tree instead. A red-black tree gives worst-case O(log n) lookup within that bucket instead of O(n), which protects the map against pathological cases — for example, an attacker deliberately supplying many keys that hash to the same bucket ("hash flooding") to degrade a naive HashMap into a slow linked list. If entries are later removed and the bucket shrinks back down (below 6 entries), Java converts it back into a plain linked list, since a tree has more overhead than it's worth for a short chain.`,
      },
      {
        heading: 'The equals() and hashCode() Contract',
        body: `HashMap's correctness depends entirely on a contract between hashCode() and equals(): if two objects are equal according to equals(), they must return the same hashCode(). The reverse is not required — unequal objects may share a hash code (that's a normal collision) — but equal objects must never disagree on their hash code.

Breaking this contract causes silent corruption, not a loud exception. If you override equals() to compare two Point objects by their x and y fields but forget to override hashCode() to match, then two logically "equal" Point keys can compute different hash codes, land in different buckets, and the map will treat them as two separate keys. A get() call with a key that is equals() to one already stored can return null, because HashMap never even looks in the bucket where the original entry lives. This is one of the most common and hardest-to-diagnose bugs involving custom key objects — always override hashCode() and equals() together, typically using IDE generation or java.util.Objects.hash().`,
        list: [
          'Contract: a.equals(b) == true implies a.hashCode() == b.hashCode().',
          'Not required in reverse: unequal objects may share a hash code (a legitimate collision).',
          'A mutable field used in hashCode()/equals() is dangerous as a map key — mutating it after insertion can make the key "unfindable" because its bucket location no longer matches its current hash.',
        ],
      },
      {
        heading: 'Load Factor and Resizing (Rehashing)',
        body: `HashMap tracks how full it is using a load factor, which defaults to 0.75. The map maintains a threshold equal to <code>capacity × loadFactor</code> (for the default capacity of 16, that's 12). Once the number of stored entries exceeds this threshold, HashMap resizes: it doubles the internal array's capacity (e.g. 16 → 32) and then rehashes — recomputing the bucket index for every existing entry against the new, larger table, since the bucket index formula depends on table.length.

A lower load factor means more empty space and fewer collisions (faster lookups) at the cost of more memory; a higher load factor saves memory but increases the chance of collisions and longer chains. The default of 0.75 is a deliberate middle ground validated over years of real-world use. If you know a HashMap will hold a very large, predictable number of entries, you can avoid repeated resizing (each resize is an O(n) operation) by specifying an initial capacity upfront, e.g. <code>new HashMap&lt;&gt;(256)</code>.

Finally, a poorly written hashCode() is a real performance hazard: if hashCode() always returns the same constant (say, 42) for every instance, then every single key lands in the exact same bucket regardless of the table size. get() and put() then degrade from O(1) to O(n), because HashMap must linearly scan (or tree-walk) every entry in that one overloaded bucket on every operation — effectively turning your HashMap into a linked list with extra overhead.`,
      },
    ],
    examples: [
      {
        caption: 'A broken hashCode() that forces every key into one bucket, wrecking performance',
        code: `import java.util.HashMap;
import java.util.Objects;

public class BadHashDemo {

    static class BadKey {
        final int id;
        BadKey(int id) { this.id = id; }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof BadKey)) return false;
            return this.id == ((BadKey) o).id;
        }

        @Override
        public int hashCode() {
            return 42; // BAD: same bucket for every key, defeats hashing entirely
        }
    }

    static class GoodKey {
        final int id;
        GoodKey(int id) { this.id = id; }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof GoodKey)) return false;
            return this.id == ((GoodKey) o).id;
        }

        @Override
        public int hashCode() {
            return Objects.hash(id); // GOOD: spreads keys across buckets
        }
    }

    public static void main(String[] args) {
        HashMap<BadKey, String> badMap = new HashMap<>();
        for (int i = 0; i < 5; i++) {
            badMap.put(new BadKey(i), "value" + i);
        }
        // All 5 entries live in the SAME bucket chain -> lookups degrade toward O(n)
        System.out.println("Bad map size: " + badMap.size());
        System.out.println("Lookup: " + badMap.get(new BadKey(3)));

        HashMap<GoodKey, String> goodMap = new HashMap<>();
        for (int i = 0; i < 5; i++) {
            goodMap.put(new GoodKey(i), "value" + i);
        }
        System.out.println("Good map size: " + goodMap.size());
        System.out.println("Lookup: " + goodMap.get(new GoodKey(3)));
    }
}`,
        output: `Bad map size: 5
Lookup: value3
Good map size: 5
Lookup: value3`,
      },
      {
        caption: 'Overriding equals() but forgetting hashCode() silently breaks lookups',
        code: `import java.util.HashMap;

public class BrokenContractDemo {

    static class Point {
        final int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof Point)) return false;
            Point p = (Point) o;
            return x == p.x && y == p.y;
        }
        // hashCode() NOT overridden -> uses Object's identity-based hash
    }

    public static void main(String[] args) {
        HashMap<Point, String> map = new HashMap<>();
        map.put(new Point(1, 2), "origin-ish");

        // A logically equal key, but a different identity hash -> different bucket
        String result = map.get(new Point(1, 2));
        System.out.println(result);
    }
}`,
        output: 'null',
      },
    ],
    commonMistakes: [
      'Overriding equals() without also overriding hashCode() (or vice versa), which breaks HashMap/HashSet lookups silently — no exception is thrown, get() just returns null.',
      'Using a mutable field in hashCode()/equals() and then mutating a key object after it has been inserted, making it effectively unfindable in its own map.',
      'Assuming HashMap operations are always O(1) — a poor hashCode() implementation (e.g., returning a constant) collapses performance toward O(n).',
      'Confusing the default load factor (0.75) with a hard limit — resizing is triggered when the entry count exceeds capacity × loadFactor, not when the array is completely full.',
    ],
    keyPoints: [
      'HashMap stores entries in an array of buckets; the bucket index comes from a spread version of hashCode() ANDed with (capacity - 1).',
      'Collisions are handled by chaining (linked list per bucket); a bucket chain longer than 8 entries treeifies into a red-black tree for O(log n) worst-case lookup.',
      'Equal objects must produce equal hash codes — breaking the equals()/hashCode() contract causes silent, hard-to-debug lookup failures.',
      'The default load factor is 0.75; exceeding capacity × loadFactor triggers a resize (capacity doubles) and a full rehash of existing entries.',
    ],
  },

  'collections-utility-methods-and-fail-fast-vs-fail-safe-iterators': {
    title: 'Collections Utility Methods and Fail-Fast vs Fail-Safe Iterators',
    intro: `The java.util.Collections class is a collection of static utility methods that operate on or return collections — sorting, reversing, wrapping a list so it can't be modified, making a plain collection thread-safe, and providing ready-made empty/singleton collections. These methods are used constantly in production code, often more than the Collection interfaces' own instance methods.

Just as important — and a frequent source of runtime bugs — is understanding the difference between fail-fast and fail-safe iterators. Most of the Java Collections Framework's core classes (ArrayList, HashMap, HashSet) use fail-fast iterators that throw ConcurrentModificationException the moment they detect the underlying collection was structurally changed mid-iteration. Newer concurrent collections instead use fail-safe iteration over a snapshot. Knowing which behavior you're dealing with prevents a whole category of "works most of the time, then crashes" bugs.`,
    sections: [
      {
        heading: 'Key Collections Utility Methods',
        body: `These static methods cover the operations you need most often on an existing List, Set, or Map, without writing manual loops.`,
        list: [
          '<code>Collections.sort(list)</code> — sorts a List in place using natural ordering (or <code>Collections.sort(list, comparator)</code> for a custom order). The list must contain mutually comparable elements or a Comparator must be supplied.',
          '<code>Collections.reverse(list)</code> — reverses the order of elements in a List in place.',
          '<code>Collections.unmodifiableList(list)</code> (and unmodifiableSet/unmodifiableMap) — wraps a collection in a read-only view; any attempt to add, remove, or set an element throws UnsupportedOperationException. Note this is a *view*: changes to the original underlying list still show through it.',
          '<code>Collections.synchronizedList(list)</code> (and synchronizedSet/synchronizedMap) — wraps a collection so that individual method calls are internally synchronized, making basic operations thread-safe. Iteration still requires the caller to manually synchronize on the returned object, because iteration is not a single atomic operation.',
          '<code>Collections.emptyList()</code> / <code>emptySet()</code> / <code>emptyMap()</code> — return immutable, shared, memory-efficient empty collections, useful as safe default return values instead of returning null.',
        ],
      },
      {
        heading: 'Fail-Fast Iterators and ConcurrentModificationException',
        body: `ArrayList, HashMap, HashSet, and most other core java.util collections use a "modCount" field that increments every time the collection is structurally modified (add/remove, but not set() on a List). Every iterator created from the collection captures the modCount at creation time, and on every call to next() (or remove()), it checks whether the live modCount still matches its captured value. If someone structurally modified the collection outside the iterator's own remove() method — for example by calling list.remove() directly inside a for-each loop — the check fails and the iterator throws ConcurrentModificationException immediately.

This is "fail-fast" by design: the JDK deliberately favors an immediate, loud failure over letting you silently iterate over a collection that changed shape mid-traversal (which could otherwise skip elements, revisit elements, or throw an unrelated exception like ArrayIndexOutOfBoundsException later on). The one safe way to remove elements while iterating a fail-fast collection is to use the Iterator's own <code>remove()</code> method, which updates modCount consistently, or to iterate over a separate copy of the collection while modifying the original.`,
      },
      {
        heading: 'Fail-Safe Iterators',
        body: `Some collections — notably the concurrent collections like CopyOnWriteArrayList and ConcurrentHashMap — use fail-safe iterators instead. A fail-safe iterator does not operate on the live internal structure directly; it either iterates over a stable snapshot taken at iteration start (CopyOnWriteArrayList) or is designed to tolerate concurrent structural changes without throwing (ConcurrentHashMap). This means no ConcurrentModificationException will ever be thrown from these iterators, but it comes with a trade-off: the iterator may not reflect additions or removals made to the collection after iteration began. It sees a version of the data that may already be stale by the time you finish the loop — which is fine for many real-world use cases (like notifying a list of listeners), but is a meaningful behavioral difference you must be aware of.`,
      },
      {
        heading: 'Demonstrating the Failure and the Fix',
        body: `The most common way developers accidentally trigger ConcurrentModificationException is trying to remove matching elements from an ArrayList using a for-each loop. The fix is either to use an explicit Iterator and call its remove() method, or to iterate over a defensive copy while removing from the original.`,
      },
    ],
    examples: [
      {
        caption: 'ConcurrentModificationException from a broken for-each removal, and two correct fixes',
        code: `import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class FailFastDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Charlie", "Dan"));

        // BROKEN: structurally modifying the list during a for-each loop
        try {
            for (String name : names) {
                if (name.equals("Bob")) {
                    names.remove(name); // throws ConcurrentModificationException
                }
            }
        } catch (java.util.ConcurrentModificationException e) {
            System.out.println("Caught: " + e.getClass().getSimpleName());
        }

        // FIX 1: use the Iterator's own remove() method
        Iterator<String> it = names.iterator();
        while (it.hasNext()) {
            if (it.next().equals("Bob")) {
                it.remove(); // safe, keeps modCount consistent
            }
        }
        System.out.println(names);

        // FIX 2: iterate over a copy, modify the original
        List<String> namesAgain = new ArrayList<>(List.of("Alice", "Bob", "Charlie", "Dan"));
        for (String name : new ArrayList<>(namesAgain)) {
            if (name.equals("Charlie")) {
                namesAgain.remove(name);
            }
        }
        System.out.println(namesAgain);
    }
}`,
        output: `Caught: ConcurrentModificationException
[Alice, Charlie, Dan]
[Alice, Bob, Dan]`,
      },
      {
        caption: 'Common Collections utility methods in one program',
        code: `import java.util.*;

public class CollectionsUtilDemo {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(List.of(5, 3, 8, 1, 9));

        Collections.sort(numbers);
        System.out.println("Sorted: " + numbers);

        Collections.reverse(numbers);
        System.out.println("Reversed: " + numbers);

        List<Integer> readOnly = Collections.unmodifiableList(numbers);
        try {
            readOnly.add(100);
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot modify: " + e.getClass().getSimpleName());
        }

        List<String> syncList = Collections.synchronizedList(new ArrayList<>());
        syncList.add("thread-safe add");
        System.out.println(syncList);

        List<String> empty = Collections.emptyList();
        System.out.println("Empty list size: " + empty.size());
    }
}`,
        output: `Sorted: [1, 3, 5, 8, 9]
Reversed: [9, 8, 5, 3, 1]
Cannot modify: UnsupportedOperationException
[thread-safe add]
Empty list size: 0`,
      },
    ],
    commonMistakes: [
      'Calling list.remove() (or add()) directly inside a for-each loop over that same list, causing ConcurrentModificationException.',
      'Assuming Collections.unmodifiableList() creates an independent, permanently immutable copy — it is only a read-only view, and changes to the original backing list still show through it.',
      'Believing Collections.synchronizedList() makes compound operations (like "check size then add") atomic — individual calls are synchronized, but you must manually synchronize on the list for multi-step operations and for iteration.',
      'Expecting a fail-safe iterator (e.g., over CopyOnWriteArrayList) to reflect concurrent updates made mid-iteration — it iterates over a snapshot and will not throw, but also will not show the update.',
    ],
    keyPoints: [
      'Collections.sort/reverse mutate the list in place; unmodifiableList/synchronizedList wrap a list to change its access semantics.',
      'Fail-fast iterators (ArrayList, HashMap, HashSet) detect structural modification via modCount and throw ConcurrentModificationException immediately.',
      'The safe way to remove elements during iteration is Iterator.remove(), or iterating over a copy while modifying the original.',
      'Fail-safe iterators (CopyOnWriteArrayList, ConcurrentHashMap) never throw ConcurrentModificationException but may not reflect concurrent changes made after iteration starts.',
    ],
  },

  'concurrent-collections-concurrenthashmap-and-copyonwritearraylist': {
    title: 'Concurrent Collections: ConcurrentHashMap and CopyOnWriteArrayList',
    intro: `Standard collections like ArrayList and HashMap are explicitly not thread-safe: if two threads modify one concurrently (or one reads while another writes), the result is undefined behavior — anything from a wrong answer to an infinite loop or data corruption inside the internal array or bucket structure. The Java Collections Framework offers two very different strategies for safe concurrent access, and choosing the right one for the workload matters as much as using a thread-safe collection at all.

The oldest fix, Hashtable (and Collections.synchronizedMap/synchronizedList), makes every single method call synchronized on one lock for the whole collection — safe, but a serious bottleneck under contention because only one thread can touch the collection at a time, even for reads. Modern Java offers smarter alternatives: ConcurrentHashMap, which allows highly concurrent reads and writes without one global lock, and CopyOnWriteArrayList, which optimizes for the read-heavy, write-rare case by copying the entire array on every write.`,
    sections: [
      {
        heading: 'Why Plain HashMap and ArrayList Are Not Thread-Safe',
        body: `HashMap's put() method involves several non-atomic steps: compute the bucket index, check for an existing key, possibly resize the table, and link a new node into a bucket's chain. If two threads call put() at the same time and both trigger a resize, they can corrupt the internal linked structure — in older JDKs this famously could even create an infinite loop during iteration. ArrayList has similar problems: growing its backing array and updating its size field are not atomic with respect to other threads reading or writing concurrently. There is no built-in protection; each of these classes assumes single-threaded or externally-synchronized use.`,
      },
      {
        heading: 'ConcurrentHashMap: Fine-Grained Locking Instead of One Global Lock',
        body: `ConcurrentHashMap achieves thread safety without locking the entire map for every operation. Conceptually, it divides the responsibility for locking down to the level of individual buckets (or nodes) rather than the whole table: a write to one bucket does not block a concurrent read or write to a different, unrelated bucket. Reads generally proceed without locking at all, using volatile reads of the underlying structure so they always see a consistent (if occasionally slightly stale) view without blocking writers. This design allows many threads to read and write different parts of the map simultaneously, which scales far better than Hashtable's single-lock-for-everything approach under real concurrent load.

Additionally, ConcurrentHashMap's iterators are weakly consistent (a form of fail-safe behavior): they will not throw ConcurrentModificationException even if the map is modified during iteration, though they may or may not reflect a change made after the iterator was created.`,
        list: [
          '<strong>Hashtable</strong> — every method synchronized on one lock; only one thread can access the map at all, even for two unrelated reads.',
          '<strong>Collections.synchronizedMap(new HashMap&lt;&gt;())</strong> — same single-lock behavior as Hashtable, just wrapping a HashMap instead.',
          '<strong>ConcurrentHashMap</strong> — locking is localized to small portions of the internal structure; unrelated reads/writes proceed concurrently without blocking each other.',
        ],
      },
      {
        heading: 'CopyOnWriteArrayList: Copy-on-Write for Read-Heavy, Write-Rare Data',
        body: `CopyOnWriteArrayList takes an entirely different strategy suited to a different workload: lists that are read constantly but modified only occasionally, such as a list of event listeners or observers. Every mutating operation (add, remove, set) creates a brand-new copy of the entire backing array, applies the change to that new array, and then atomically swaps the list's internal reference to point to it. Existing iterators keep working against the old array they already captured, so they never see the change and never throw ConcurrentModificationException — they are fail-safe by construction, since they're really iterating over an immutable snapshot.

This makes reads (including iteration) extremely fast and completely lock-free, because a reader is just reading an array reference that will never change underneath it. The cost is on the write side: each mutation is O(n) because the whole array is copied, so CopyOnWriteArrayList is a poor choice for lists with frequent writes or very large size, but an excellent choice for something like a small, rarely-changing list of registered listeners that many threads iterate over concurrently.`,
      },
    ],
    examples: [
      {
        caption: 'Multiple threads safely incrementing shared counters in a ConcurrentHashMap',
        code: `import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class ConcurrentHashMapDemo {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentHashMap<String, Integer> hits = new ConcurrentHashMap<>();
        hits.put("home", 0);
        hits.put("about", 0);

        ExecutorService pool = Executors.newFixedThreadPool(4);
        for (int i = 0; i < 1000; i++) {
            pool.submit(() -> hits.merge("home", 1, Integer::sum));
        }
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("home hits: " + hits.get("home"));
    }
}`,
        output: 'home hits: 1000',
      },
      {
        caption: 'CopyOnWriteArrayList safely iterating a listener list while another thread mutates it',
        code: `import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class CopyOnWriteDemo {
    public static void main(String[] args) throws InterruptedException {
        List<String> listeners = new CopyOnWriteArrayList<>();
        listeners.add("LoggerListener");
        listeners.add("EmailListener");

        Thread reader = new Thread(() -> {
            for (String listener : listeners) {
                System.out.println("Notifying: " + listener);
            }
        });

        Thread writer = new Thread(() -> listeners.add("MetricsListener"));

        reader.start();
        writer.start();
        reader.join();
        writer.join();

        // No ConcurrentModificationException, regardless of interleaving.
        System.out.println("Final listener count: " + listeners.size());
    }
}`,
        output: `Notifying: LoggerListener
Notifying: EmailListener
Final listener count: 3`,
      },
    ],
    commonMistakes: [
      'Using a plain HashMap or ArrayList from multiple threads "because it seemed to work in testing" — race conditions are often intermittent and can corrupt state or hang in production under real load.',
      'Choosing Hashtable or Collections.synchronizedMap for high-concurrency workloads instead of ConcurrentHashMap, and taking a much bigger throughput hit than necessary from the single global lock.',
      'Using CopyOnWriteArrayList for a large, frequently-written list — every write copies the entire backing array, so it becomes a severe performance problem outside of read-heavy, write-rare scenarios.',
      'Expecting an iterator from ConcurrentHashMap or CopyOnWriteArrayList to immediately reflect a concurrent update — both offer weak/snapshot consistency, not a live, always-up-to-the-millisecond view.',
    ],
    keyPoints: [
      'Plain HashMap/ArrayList are not thread-safe; concurrent modification can corrupt internal structures, not just produce wrong answers.',
      'ConcurrentHashMap uses fine-grained, bucket-level locking (and largely lock-free reads) instead of one global lock, unlike the fully-synchronized Hashtable.',
      'CopyOnWriteArrayList copies the entire backing array on every write, making reads/iteration lock-free and ideal for read-heavy, write-rare use cases like listener lists.',
      'Pick the collection based on workload shape: high write concurrency across many keys favors ConcurrentHashMap; rare writes with heavy concurrent iteration favors CopyOnWriteArrayList.',
    ],
  },

  'modern-java-features-var-records-sealed-classes-pattern-matching-and-text-blocks': {
    title: 'Modern Java Features: var, Records, Sealed Classes, Pattern Matching, and Text Blocks',
    intro: `Java has evolved rapidly on a faster release cadence since Java 9, and a handful of features introduced across recent versions have meaningfully changed how idiomatic modern Java code looks — often making it dramatically more concise without sacrificing Java's core promise of static type safety. This lesson covers five of the most important additions: local variable type inference (var), Records, sealed classes/interfaces, pattern matching (for instanceof and switch), and text blocks.

None of these features change Java's fundamental nature as a statically, strongly typed, compiled language. They reduce ceremony and boilerplate while the compiler still checks everything at compile time — which is very different from a dynamically typed language inferring types at runtime.`,
    sections: [
      {
        heading: 'var — Local Variable Type Inference (Java 10)',
        body: `var lets the compiler infer a local variable's type from its initializer expression, instead of you writing it explicitly. Critically, this is compile-time inference, not dynamic typing: once the compiler determines the type at the declaration site, that variable has that exact type for its entire scope, forever — you cannot reassign it to a value of an incompatible type, exactly as if you had written the type out by hand. This is fundamentally different from JavaScript's "let" or Python's dynamic variables, where a variable's type can effectively change at runtime.

var can only be used for local variables with an initializer (never for fields, method parameters, or return types), and it cannot be used when there's no way to infer a type, such as <code>var x = null;</code>. It is best used when the type is already obvious from the right-hand side (e.g. <code>var list = new ArrayList&lt;String&gt;();</code>) and avoided when it would obscure an important type from a reader (e.g. <code>var result = compute();</code> where compute()'s return type isn't clear from context).`,
      },
      {
        heading: 'Records — Concise Immutable Data Carriers (Java 16)',
        body: `Before Records, a simple immutable data class required a large amount of boilerplate: private final fields, a constructor, getter methods, and manually written equals(), hashCode(), and toString(). A record declares all of that in a single line — the compiler automatically generates a canonical constructor, a public accessor method per field (named after the field, not prefixed with "get"), and correct equals(), hashCode(), and toString() implementations based on the record's components. Records are implicitly final and their fields are implicitly private and final, enforcing immutability by design — there is no way to accidentally add a mutable setter to a record's auto-generated state.`,
        list: [
          '<strong>Before Records</strong>: a "Point" class with x and y needs ~20+ lines — fields, constructor, getX()/getY(), equals(), hashCode(), toString().',
          '<strong>With Records</strong>: <code>record Point(int x, int y) {}</code> — one line, with all of the above generated automatically.',
          'Records can still have additional methods, static fields, and compact constructors (for validation logic) — they are not limited to pure data holders.',
        ],
      },
      {
        heading: 'Sealed Classes and Interfaces (Java 17)',
        body: `A sealed class or interface restricts which other classes or interfaces are allowed to extend or implement it, using a <code>permits</code> clause (or an implicit permits list when permitted subclasses are in the same file). This gives you exhaustiveness guarantees that plain inheritance never could: the compiler knows the complete, closed set of possible subtypes, which is especially powerful combined with pattern matching in switch — the compiler can verify you've handled every possible subtype without needing a default case. Each permitted subclass must itself be declared final, sealed, or non-sealed, explicitly stating whether the hierarchy can be extended further from that point.`,
      },
      {
        heading: 'Pattern Matching for instanceof and switch, and Text Blocks',
        body: `Pattern matching for instanceof (stabilized in Java 16) lets you test a type and bind a variable of that type in a single expression: <code>if (obj instanceof String s)</code> automatically casts and binds obj to the local variable s inside the true branch, eliminating the old two-step "check then cast" pattern. Pattern matching for switch, finalized in Java 21, extends this to switch statements and expressions: you can match directly on an object's type (including sealed hierarchy subtypes) using arrow-style case labels, and a switch expression can directly produce a value with no fall-through and no explicit break statements needed.

Text blocks (finalized in Java 15) let you write multi-line string literals using triple double-quotes (<code>"""</code>) instead of concatenating many escaped strings. This is especially valuable for embedding JSON, SQL, or HTML directly in source code — the text block preserves line breaks and largely avoids escaping inner double quotes, dramatically improving readability compared to the old approach of string concatenation with "\\n" and "\\"" everywhere.`,
        list: [
          '<code>var</code> — Java 10 (local variable type inference, still statically typed).',
          '<code>Text blocks</code> — Java 15 (finalized).',
          '<code>Records</code> — Java 16.',
          '<code>Sealed classes/interfaces</code> — Java 17.',
          '<code>Pattern matching for switch</code> — Java 21 (finalized); pattern matching for instanceof arrived earlier, in Java 16.',
        ],
      },
    ],
    examples: [
      {
        caption: 'var, Records, sealed interfaces, and pattern matching for switch working together',
        code: `public class ModernJavaDemo {

    sealed interface Shape permits Circle, Rectangle {}
    record Circle(double radius) implements Shape {}
    record Rectangle(double width, double height) implements Shape {}

    static double area(Shape shape) {
        // Pattern matching for switch (Java 21): exhaustive, no default needed
        // because the compiler knows Shape only permits Circle and Rectangle.
        return switch (shape) {
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle r -> r.width() * r.height();
        };
    }

    public static void main(String[] args) {
        var shapes = new Shape[] { new Circle(2.0), new Rectangle(3.0, 4.0) };

        for (var shape : shapes) {
            // Pattern matching for instanceof
            if (shape instanceof Circle c) {
                System.out.printf("Circle with radius %.1f -> area %.2f%n", c.radius(), area(c));
            } else if (shape instanceof Rectangle r) {
                System.out.printf("Rectangle %sx%s -> area %.2f%n", r.width(), r.height(), area(r));
            }
        }

        // Records auto-generate equals()/toString()
        Circle c1 = new Circle(2.0);
        Circle c2 = new Circle(2.0);
        System.out.println("c1.equals(c2): " + c1.equals(c2));
        System.out.println(c1);
    }
}`,
        output: `Circle with radius 2.0 -> area 12.57
Rectangle 3.0x4.0 -> area 12.00
c1.equals(c2): true
Circle[radius=2.0]`,
      },
      {
        caption: 'A text block for embedded JSON versus the old escaped-string approach',
        code: `public class TextBlockDemo {
    public static void main(String[] args) {
        // Old approach: manual escaping and concatenation
        String oldJson = "{\\n" +
                "  \\"name\\": \\"Asha\\",\\n" +
                "  \\"role\\": \\"Developer\\"\\n" +
                "}";

        // Modern approach: a text block (Java 15+)
        String newJson = """
                {
                  "name": "Asha",
                  "role": "Developer"
                }""";

        System.out.println(oldJson.equals(newJson));
        System.out.println(newJson);
    }
}`,
        output: `true
{
  "name": "Asha",
  "role": "Developer"
}`,
      },
    ],
    commonMistakes: [
      'Treating var as dynamic typing — the type is fixed permanently at compile time from the initializer; you cannot later assign an incompatible type to that variable.',
      'Overusing var where the inferred type is not obvious from the right-hand side, hurting readability instead of helping it (e.g. "var result = process(data);").',
      'Forgetting that every permitted subclass of a sealed type must itself declare final, sealed, or non-sealed — omitting this is a compile error, not a default behavior.',
      'Adding a case that isn\'t needed, or forgetting a default, in a switch over a non-sealed type and being surprised the compiler doesn\'t enforce exhaustiveness the way it does for sealed hierarchies.',
    ],
    keyPoints: [
      'var (Java 10) is compile-time local type inference, not dynamic typing — the type is fixed once and enforced by the compiler thereafter.',
      'Records (Java 16) auto-generate a constructor, accessors, equals(), hashCode(), and toString() for concise, immutable data carriers.',
      'Sealed classes/interfaces (Java 17) restrict the permitted subtype hierarchy, enabling compiler-verified exhaustive pattern matching.',
      'Pattern matching for instanceof (Java 16) and for switch (Java 21), plus text blocks (Java 15), collectively reduce boilerplate for type-checking and embedded multi-line strings.',
    ],
  },

  'java-nio-basics-channels-and-buffers': {
    title: 'Java NIO Basics: Channels and Buffers',
    intro: `Classic java.io (the "old I/O" package built around Streams like FileInputStream and FileOutputStream) reads and writes data one byte or char at a time, in a blocking, sequential fashion. Java NIO ("New I/O", introduced in Java 1.4 and significantly expanded since) offers an alternative model built around Buffers and Channels that supports block-based transfer, direct memory access, and non-blocking I/O — capabilities the original streams-based API was never designed for.

NIO is not a strict replacement for java.io — both are still widely used, and for many simple file-reading tasks, java.io (or the higher-level java.nio.file.Files utility methods) remains simpler to write. But understanding NIO's Buffer/Channel model is essential for anything involving high-throughput I/O, non-blocking network servers, or memory-mapped file access.`,
    sections: [
      {
        heading: 'Buffer: A Fixed-Size Container With Position and Limit',
        body: `A Buffer (e.g. ByteBuffer, CharBuffer) is a fixed-capacity container for a primitive data type that data is read into or written out of in bulk. Unlike a Stream, which just pushes bytes through one at a time, a Buffer is a block of memory you actively manage using three key properties:`,
        list: [
          '<strong>capacity</strong> — the fixed, unchanging total size of the buffer, set when it is created.',
          '<strong>position</strong> — the index of the next element to be read or written; it advances as you get/put data.',
          '<strong>limit</strong> — the index of the first element that should not be read or written; it marks the boundary of valid data currently in the buffer.',
        ],
      },
      {
        heading: 'The flip() and clear() Idiom',
        body: `A very common NIO pattern is writing data into a buffer (e.g., reading from a channel into it), then calling <code>buffer.flip()</code> before reading that data back out. flip() sets limit to the current position (marking exactly how much data is valid) and resets position to 0, effectively switching the buffer from "fill mode" to "drain mode." After consuming the data, <code>buffer.clear()</code> resets position to 0 and limit to capacity, preparing the buffer to be filled again. Forgetting to call flip() before reading is one of the most common NIO bugs, since without it, you'd try to read starting from wherever the write left off, getting no data or garbage.`,
      },
      {
        heading: 'Channel: The Conduit Between Buffers and I/O Sources',
        body: `A Channel represents an open connection to an I/O source or destination — a file (FileChannel), a network socket (SocketChannel), or other resources. Unlike a Stream, a Channel is bidirectional-capable in principle (a FileChannel opened appropriately can both read and write) and always transfers data into or out of Buffers, never as loose individual bytes. This block-oriented design, combined with the JVM's ability to allocate "direct" buffers backed by native memory outside the regular garbage-collected heap, allows the OS to move data more efficiently — sometimes bypassing an extra copy step that classic streams require, and enabling non-blocking mode for network channels so a single thread can manage many connections instead of blocking one thread per connection.`,
      },
      {
        heading: 'Reading a File with FileChannel',
        body: `A typical FileChannel read loop allocates a ByteBuffer, repeatedly calls channel.read(buffer) to fill it, flips the buffer to switch to reading mode, processes or extracts the data, then clears the buffer before the next read. The channel's read() method returns the number of bytes read, or -1 when the end of the file/stream has been reached, which is the loop's termination condition — directly analogous to how InputStream.read() signals end-of-stream, but operating on whole blocks of bytes at once via the buffer instead of one byte/char at a time.`,
      },
    ],
    examples: [
      {
        caption: 'Reading a text file using FileChannel and ByteBuffer',
        code: `import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

public class FileChannelDemo {
    public static void main(String[] args) throws IOException {
        String path = "nio-demo.txt";

        // Write some sample content first so the read has something to find.
        try (FileOutputStream fos = new FileOutputStream(path)) {
            fos.write("Hello from Java NIO!".getBytes(StandardCharsets.UTF_8));
        }

        // Read the file back using a FileChannel and a ByteBuffer.
        try (FileChannel channel = FileChannel.open(Paths.get(path), StandardOpenOption.READ)) {
            ByteBuffer buffer = ByteBuffer.allocate(64);
            StringBuilder content = new StringBuilder();

            int bytesRead = channel.read(buffer);
            while (bytesRead != -1) {
                buffer.flip(); // switch from "fill" mode to "drain" mode
                while (buffer.hasRemaining()) {
                    content.append((char) buffer.get());
                }
                buffer.clear(); // reset for the next read
                bytesRead = channel.read(buffer);
            }

            System.out.println("File contents: " + content);
        }
    }
}`,
        output: 'File contents: Hello from Java NIO!',
      },
      {
        caption: 'The flip()/clear() lifecycle on a ByteBuffer, shown step by step',
        code: `import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;

public class BufferLifecycleDemo {
    public static void main(String[] args) {
        ByteBuffer buffer = ByteBuffer.allocate(20);
        System.out.println("After allocate -> capacity=" + buffer.capacity()
                + " position=" + buffer.position() + " limit=" + buffer.limit());

        buffer.put("Hi NIO".getBytes(StandardCharsets.UTF_8));
        System.out.println("After put -> position=" + buffer.position() + " limit=" + buffer.limit());

        buffer.flip();
        System.out.println("After flip -> position=" + buffer.position() + " limit=" + buffer.limit());

        byte[] data = new byte[buffer.remaining()];
        buffer.get(data);
        System.out.println("Read back: " + new String(data, StandardCharsets.UTF_8));

        buffer.clear();
        System.out.println("After clear -> position=" + buffer.position() + " limit=" + buffer.limit());
    }
}`,
        output: `After allocate -> capacity=20 position=0 limit=20
After put -> position=6 limit=20
After flip -> position=0 limit=6
Read back: Hi NIO
After clear -> position=0 limit=20`,
      },
    ],
    commonMistakes: [
      'Forgetting to call flip() after writing data into a buffer and before reading it back out — this reads from the wrong position and typically yields empty or garbage data.',
      'Confusing capacity with limit — capacity never changes for a given buffer instance, while limit changes constantly as you flip/clear/compact the buffer.',
      'Assuming NIO Channels always mean "non-blocking" — a FileChannel used the way shown above is still a blocking call; non-blocking mode is a separate, explicit configuration mostly relevant to socket channels and Selectors.',
      'Choosing raw NIO Channels/Buffers for a simple one-off file read where java.nio.file.Files.readAllLines() or java.io.BufferedReader would be far simpler and just as appropriate.',
    ],
    keyPoints: [
      'NIO is built around Buffers (fixed-capacity containers with position/limit/capacity) and Channels (conduits to files, sockets, etc.), unlike classic streams which move one byte/char at a time.',
      'flip() switches a buffer from write mode to read mode (limit = position, position = 0); clear() resets it for writing again (position = 0, limit = capacity).',
      'FileChannel.read(buffer) returns the number of bytes read, or -1 at end of file, mirroring how InputStream signals end-of-stream but operating in blocks.',
      'NIO enables more efficient bulk transfers and, for network channels, non-blocking I/O so one thread can manage many connections — a capability classic blocking streams do not offer.',
    ],
  },
}
