// Java Collections module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content07Collections = {
  'collections-framework-overview': {
    title: 'Collections Framework Overview',
    intro: `Before the Collections Framework, Java developers stored groups of objects in plain arrays or in ad hoc classes like Vector and Hashtable, each with its own inconsistent set of methods. The Java Collections Framework, introduced in Java 1.2, replaced that inconsistency with a single, unified architecture: a small set of interfaces that define what a data structure can do, and a rich set of implementing classes that define how it does it efficiently.

The core idea is separation of interface from implementation. Code written against the <code>List</code> interface works identically whether the underlying object is an <code>ArrayList</code> or a <code>LinkedList</code>, which means you can change the internal data structure later — for performance reasons — without touching the rest of your program.`,
    sections: [
      {
        heading: 'The Interface Hierarchy',
        body: `At the root sits the <code>Iterable</code> interface, which guarantees anything implementing it can be used in a for-each loop. <code>Collection</code> extends <code>Iterable</code> and is the parent of the three main branches used for storing individual elements. <code>Map</code> is deliberately kept separate, because it stores key-value pairs rather than single elements, and does not extend <code>Collection</code>.`,
        list: [
          '<code>Collection</code> → <code>List</code> (ordered, allows duplicates) → ArrayList, LinkedList, Vector',
          '<code>Collection</code> → <code>Set</code> (no duplicates) → HashSet, LinkedHashSet, TreeSet (via SortedSet/NavigableSet)',
          '<code>Collection</code> → <code>Queue</code> (FIFO-style processing) → LinkedList, PriorityQueue, and <code>Deque</code> → ArrayDeque',
          '<code>Map</code> (separate hierarchy, key-value pairs) → HashMap, LinkedHashMap, TreeMap, Hashtable',
        ],
      },
      {
        heading: 'Why the Framework Exists',
        body: `The framework gives every collection a predictable, shared vocabulary: methods like <code>add()</code>, <code>remove()</code>, <code>contains()</code>, and <code>size()</code> behave consistently across implementations, and generic algorithms in the <code>Collections</code> utility class (<code>Collections.sort()</code>, <code>Collections.reverse()</code>, <code>Collections.max()</code>) work on any <code>List</code> or <code>Collection</code> regardless of its concrete type. This is what lets you swap a HashMap for a TreeMap, or an ArrayList for a LinkedList, by changing one line of code.`,
      },
      {
        heading: 'Choosing the Right Collection',
        body: `Picking a collection is really answering three questions: does order matter, are duplicates allowed, and do you need key-value lookup? A <code>List</code> preserves insertion order and allows duplicates; a <code>Set</code> forbids duplicates; a <code>Map</code> associates unique keys with values; a <code>Queue</code>/<code>Deque</code> models processing order (first-in-first-out, or double-ended). Choosing correctly up front avoids awkward workarounds later.`,
      },
    ],
    examples: [
      {
        caption: 'The same Collection reference type working with two different implementations',
        code: `import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class FrameworkDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(); // could be swapped for LinkedList
        names.add("Asha");
        names.add("Ravi");
        names.add("Meera");

        printAll(names); // works identically for any List implementation

        List<String> linked = new LinkedList<>(names);
        printAll(linked);
    }

    static void printAll(List<String> list) {
        for (String name : list) {
            System.out.print(name + " ");
        }
        System.out.println();
    }
}`,
        output: `Asha Ravi Meera
Asha Ravi Meera`,
      },
    ],
    commonMistakes: [
      'Assuming Map is a Collection — it is a separate hierarchy because it stores pairs, not single elements.',
      'Declaring variables with the concrete type (ArrayList) instead of the interface type (List), which defeats the purpose of programming to an interface.',
      'Picking a collection based on habit ("I always use ArrayList") instead of the actual access pattern needed.',
    ],
    keyPoints: [
      'The Collections Framework unifies data structures under a small set of interfaces: Collection, List, Set, Queue, and the separate Map hierarchy.',
      'Programming against interfaces (List, Set, Map) rather than concrete classes makes implementations swappable.',
      'The Collections utility class provides algorithms (sort, reverse, max) that work across all implementations.',
    ],
  },

  'list-interface-arraylist-linkedlist-vector': {
    title: 'List Interface: ArrayList, LinkedList, Vector',
    intro: `The <code>List</code> interface represents an ordered collection that allows duplicate elements and provides positional (index-based) access. Java ships three common implementations — ArrayList, LinkedList, and the legacy Vector — and each one makes a different internal trade-off between fast reads, fast structural changes, and thread safety.`,
    sections: [
      {
        heading: 'ArrayList — Dynamic Array',
        body: `ArrayList is backed by a resizable array. Reading any element by index is O(1), because the array offset can be computed directly. Adding to the end is amortized O(1) (occasionally the internal array must be resized and copied). However, inserting or removing an element in the middle is O(n), because every following element must shift by one position. ArrayList is the default, general-purpose choice for most List use cases, and it is not synchronized.`,
      },
      {
        heading: 'LinkedList — Doubly Linked List',
        body: `LinkedList stores each element in a node containing references to the previous and next nodes. Inserting or removing at the beginning, end, or at a known node position is O(1), because it only involves updating a few references. But random access by index is O(n), since the list must be walked node by node from the closer end. LinkedList also implements <code>Deque</code>, so it can be used as a stack or queue. It uses more memory per element than ArrayList due to the extra node references.`,
      },
      {
        heading: 'Vector — Legacy, Synchronized',
        body: `Vector predates the Collections Framework (it existed in Java 1.0) and was retrofitted to implement <code>List</code>. It behaves like ArrayList — backed by a dynamic array with the same Big-O characteristics — but every method is synchronized, meaning only one thread can access it at a time. This makes it thread-safe but slower than ArrayList in single-threaded code, which is by far the more common case today. Modern code almost always prefers ArrayList, or <code>Collections.synchronizedList()</code> / <code>CopyOnWriteArrayList</code> for concurrency.`,
        list: [
          '<strong>ArrayList</strong>: O(1) get, amortized O(1) add at end, O(n) insert/remove in middle, not synchronized.',
          '<strong>LinkedList</strong>: O(n) get by index, O(1) insert/remove at known position, implements Deque, higher memory overhead.',
          '<strong>Vector</strong>: same performance shape as ArrayList, but synchronized on every method — legacy and rarely chosen for new code.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Comparing insertion behavior across List implementations',
        code: `import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Vector;

public class ListDemo {
    public static void main(String[] args) {
        List<Integer> arrayList = new ArrayList<>(List.of(1, 2, 4, 5));
        arrayList.add(2, 3); // insert at index 2, shifts elements right
        System.out.println("ArrayList: " + arrayList);

        LinkedList<Integer> linkedList = new LinkedList<>(List.of(2, 3, 4));
        linkedList.addFirst(1); // O(1), no shifting needed
        linkedList.addLast(5);
        System.out.println("LinkedList: " + linkedList);

        Vector<String> vector = new Vector<>();
        vector.add("safe");
        vector.add("but slower");
        System.out.println("Vector: " + vector);
    }
}`,
        output: `ArrayList: [1, 2, 3, 4, 5]
LinkedList: [1, 2, 3, 4, 5]
Vector: [safe, but slower]`,
      },
    ],
    commonMistakes: [
      'Using LinkedList expecting faster random access — get(index) on a LinkedList is O(n), not O(1).',
      'Choosing Vector for "safety" in new code without understanding synchronization has a real performance cost even when no other thread is involved.',
      'Repeatedly inserting at the front of an ArrayList in a loop, which is O(n) per insert and O(n^2) overall — a LinkedList or ArrayDeque is a better fit.',
      'Forgetting that ArrayList resizing (copying to a bigger array) means "amortized" O(1) add, not guaranteed O(1) on every single call.',
    ],
    keyPoints: [
      'ArrayList: fast random access (O(1)), slow middle insert/remove (O(n)); best default choice.',
      'LinkedList: fast insert/remove at known positions (O(1)), slow random access (O(n)); also usable as a Deque.',
      'Vector: same shape as ArrayList but fully synchronized — legacy, rarely the right choice today.',
    ],
  },

  'set-interface-hashset-linkedhashset-treeset': {
    title: 'Set Interface: HashSet, LinkedHashSet, TreeSet',
    intro: `A <code>Set</code> is a collection that guarantees no duplicate elements — attempting to add an element that is already present (as determined by <code>equals()</code>) is silently ignored, and <code>add()</code> returns false. Java provides three principal implementations, and the one you choose determines what, if any, ordering guarantee you get.`,
    sections: [
      {
        heading: 'HashSet — No Order, Hash-Based',
        body: `HashSet stores elements in a hash table and gives no guarantee about iteration order — the order can even change between runs. In exchange, <code>add()</code>, <code>remove()</code>, and <code>contains()</code> run in average O(1) time, because the element's hash code determines which bucket it belongs to directly. HashSet requires that elements have correct, consistent <code>hashCode()</code> and <code>equals()</code> implementations; getting these wrong breaks uniqueness silently.`,
      },
      {
        heading: 'LinkedHashSet — Insertion Order Preserved',
        body: `LinkedHashSet extends HashSet but additionally maintains a doubly linked list running through all entries, so iteration order matches insertion order. It costs slightly more memory and a small constant-time overhead compared to HashSet, but is still O(1) average for the core operations. Choose it when you need set semantics (no duplicates) but also want predictable, reproducible iteration order.`,
      },
      {
        heading: 'TreeSet — Sorted Order',
        body: `TreeSet is backed by a red-black tree and keeps its elements in sorted order at all times. Core operations (<code>add</code>, <code>remove</code>, <code>contains</code>) run in O(log n) time — slower than a hash-based set, but you gain sorted iteration plus navigation methods like <code>first()</code>, <code>last()</code>, <code>higher()</code>, and <code>lower()</code>. TreeSet requires that elements either implement <code>Comparable</code>, or that you supply a <code>Comparator</code> when constructing it — otherwise it throws <code>ClassCastException</code> at runtime on the first comparison.`,
        list: [
          '<strong>HashSet</strong>: no ordering guarantee, O(1) average, needs correct hashCode/equals.',
          '<strong>LinkedHashSet</strong>: insertion order preserved, O(1) average, slightly more overhead than HashSet.',
          '<strong>TreeSet</strong>: sorted order, O(log n), requires Comparable or a Comparator.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Comparing iteration order across the three Set implementations',
        code: `import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.TreeSet;

public class SetDemo {
    public static void main(String[] args) {
        Set<String> hashSet = new HashSet<>();
        hashSet.add("banana");
        hashSet.add("apple");
        hashSet.add("cherry");
        System.out.println("HashSet (unordered): " + hashSet);

        Set<String> linkedHashSet = new LinkedHashSet<>();
        linkedHashSet.add("banana");
        linkedHashSet.add("apple");
        linkedHashSet.add("cherry");
        System.out.println("LinkedHashSet (insertion order): " + linkedHashSet);

        Set<String> treeSet = new TreeSet<>();
        treeSet.add("banana");
        treeSet.add("apple");
        treeSet.add("cherry");
        System.out.println("TreeSet (sorted order): " + treeSet);
    }
}`,
        output: `HashSet (unordered): [banana, apple, cherry]
LinkedHashSet (insertion order): [banana, apple, cherry]
TreeSet (sorted order): [apple, banana, cherry]`,
      },
    ],
    commonMistakes: [
      'Relying on HashSet iteration order being consistent or meaningful — it is unspecified and implementation-dependent.',
      'Adding a custom object to a HashSet without overriding both hashCode() and equals(), which allows duplicate-looking objects to slip in.',
      'Putting elements with no natural ordering (and no Comparator supplied) into a TreeSet, which throws ClassCastException at runtime.',
      'Choosing TreeSet by default when sorted order is not actually needed, paying O(log n) instead of O(1) for no benefit.',
    ],
    keyPoints: [
      'HashSet: fastest (O(1) average), no ordering guarantee.',
      'LinkedHashSet: O(1) average with predictable insertion-order iteration.',
      'TreeSet: sorted order, O(log n), requires Comparable or a Comparator.',
      'All three enforce uniqueness via equals()/hashCode() (HashSet, LinkedHashSet) or compareTo()/Comparator (TreeSet).',
    ],
  },

  'map-interface-hashmap-linkedhashmap-treemap-hashtable': {
    title: 'Map Interface: HashMap, LinkedHashMap, TreeMap, Hashtable',
    intro: `A <code>Map</code> associates unique keys with values — it is not a <code>Collection</code>, because it stores pairs rather than single elements, but it is just as central to everyday Java code. Java provides four commonly used implementations, differing in ordering, null handling, and thread safety.`,
    sections: [
      {
        heading: 'HashMap — The Default Choice',
        body: `HashMap stores key-value pairs in a hash table keyed by the key's hash code, giving average O(1) <code>get()</code>, <code>put()</code>, and <code>remove()</code>. Iteration order is unspecified and can change. HashMap allows exactly one null key and any number of null values. Internally, it maintains a <strong>load factor</strong> (default 0.75) — once the table is 75% full, it resizes (roughly doubles) and rehashes all entries, which is an O(n) operation that happens infrequently enough not to affect the amortized O(1) average.`,
      },
      {
        heading: 'LinkedHashMap — Predictable Iteration Order',
        body: `LinkedHashMap extends HashMap and additionally threads a doubly linked list through the entries, preserving insertion order by default (or, with a constructor flag, access order — useful for building an LRU cache). It has the same O(1) average performance as HashMap with a small constant overhead, and it also permits one null key.`,
      },
      {
        heading: 'TreeMap — Sorted by Key',
        body: `TreeMap is backed by a red-black tree and keeps keys in sorted order (natural order, or a supplied <code>Comparator</code>). <code>get()</code>, <code>put()</code>, and <code>remove()</code> run in O(log n) time. TreeMap does <strong>not</strong> allow a null key (it throws <code>NullPointerException</code>, since it needs to compare keys to place them), though it does allow null values. It also offers navigation methods like <code>firstKey()</code>, <code>ceilingKey()</code>, and <code>headMap()</code>.`,
      },
      {
        heading: 'Hashtable — Legacy, Synchronized',
        body: `Hashtable is a pre-Collections-Framework class (like Vector) that was retrofitted to implement <code>Map</code>. Every method is synchronized, making it thread-safe but slower than HashMap for single-threaded use. Unlike HashMap, Hashtable permits <strong>no</strong> null keys and <strong>no</strong> null values — attempting either throws <code>NullPointerException</code> immediately. Modern concurrent code prefers <code>ConcurrentHashMap</code> instead of Hashtable.`,
        list: [
          '<strong>HashMap</strong>: no order, O(1) average, one null key allowed, many null values allowed, not synchronized.',
          '<strong>LinkedHashMap</strong>: insertion (or access) order, O(1) average, one null key allowed.',
          '<strong>TreeMap</strong>: sorted by key, O(log n), no null keys, null values allowed.',
          '<strong>Hashtable</strong>: legacy, synchronized, no null keys or values allowed at all.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Null handling and ordering differences across Map implementations',
        code: `import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class MapDemo {
    public static void main(String[] args) {
        Map<String, Integer> hashMap = new HashMap<>();
        hashMap.put("apple", 3);
        hashMap.put(null, 99); // allowed: one null key permitted
        System.out.println("HashMap null key value: " + hashMap.get(null));

        Map<String, Integer> treeMap = new TreeMap<>();
        treeMap.put("banana", 5);
        treeMap.put("apple", 3);
        treeMap.put("cherry", 8);
        System.out.println("TreeMap sorted: " + treeMap);

        try {
            treeMap.put(null, 1); // TreeMap cannot place a null key
        } catch (NullPointerException e) {
            System.out.println("TreeMap rejected null key");
        }
    }
}`,
        output: `HashMap null key value: 99
TreeMap sorted: {apple=3, banana=5, cherry=8}
TreeMap rejected null key`,
      },
    ],
    commonMistakes: [
      'Assuming HashMap iteration order is insertion order — that guarantee belongs to LinkedHashMap, not HashMap.',
      'Putting a null key into a TreeMap or Hashtable and being surprised by a NullPointerException.',
      'Choosing Hashtable for thread safety in new code instead of the far more scalable ConcurrentHashMap.',
      'Overriding equals() on a key class without overriding hashCode() to match, which breaks lookups in any hash-based Map.',
    ],
    keyPoints: [
      'HashMap: no order guarantee, O(1) average, one null key allowed.',
      'LinkedHashMap: insertion (or access) order preserved, same performance as HashMap.',
      'TreeMap: sorted by key, O(log n), no null keys allowed.',
      'Hashtable: legacy and synchronized, disallows both null keys and null values entirely.',
    ],
  },

  'queue-and-deque-priorityqueue-arraydeque': {
    title: 'Queue and Deque: PriorityQueue, ArrayDeque',
    intro: `<code>Queue</code> models a collection designed for holding elements before processing, typically in first-in-first-out (FIFO) order: elements are added at the tail with <code>offer()</code> and removed from the head with <code>poll()</code>. <code>Deque</code> ("double-ended queue") extends this idea, allowing efficient insertion and removal at both ends, which makes it flexible enough to act as a queue, a stack, or both.`,
    sections: [
      {
        heading: 'Queue Basics and Method Pairs',
        body: `Queue offers two parallel sets of methods: one set throws an exception on failure (<code>add()</code>, <code>remove()</code>, <code>element()</code>), and one set returns a special value instead (<code>offer()</code>, <code>poll()</code>, <code>peek()</code>). The value-returning versions are generally preferred in everyday code, because they avoid unexpected exceptions when a queue is empty or full — <code>poll()</code> returns null instead of throwing when the queue is empty.`,
      },
      {
        heading: 'PriorityQueue — Ordering by Priority, Not Insertion',
        body: `PriorityQueue does not preserve FIFO order; instead, it always returns the smallest element first according to natural ordering (via <code>Comparable</code>) or a supplied <code>Comparator</code>. Internally it is backed by a binary heap, giving O(log n) for <code>offer()</code> and <code>poll()</code>, and O(1) for <code>peek()</code> at the head. It does not permit null elements, since nulls cannot be compared. PriorityQueue is the standard tool for scheduling problems and "find the next most important item" logic.`,
      },
      {
        heading: 'Deque and ArrayDeque as a Modern Stack',
        body: `Deque supports <code>addFirst()</code>/<code>addLast()</code>, <code>removeFirst()</code>/<code>removeLast()</code>, and <code>peekFirst()</code>/<code>peekLast()</code>, all in O(1) time on ArrayDeque, which is backed by a resizable circular array. Because a stack is just a deque used at one end (<code>push()</code>/<code>pop()</code>/<code>peek()</code> all operate on the head), the official Java documentation recommends ArrayDeque over the old <code>Stack</code> class: it is faster (no synchronization overhead), has no legacy baggage, and does not allow null elements, which catches bugs earlier than the historically permissive Stack class.`,
        list: [
          '<strong>Queue</strong>: FIFO by default; exception-throwing and value-returning method pairs.',
          '<strong>PriorityQueue</strong>: heap-based, O(log n) offer/poll, orders by Comparable or Comparator, no nulls.',
          '<strong>ArrayDeque</strong>: O(1) at both ends, preferred replacement for both Stack and LinkedList-as-queue.',
        ],
      },
    ],
    examples: [
      {
        caption: 'PriorityQueue ordering versus ArrayDeque used as a stack and a queue',
        code: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.PriorityQueue;
import java.util.Queue;

public class QueueDeckDemo {
    public static void main(String[] args) {
        Queue<Integer> pq = new PriorityQueue<>();
        pq.offer(30);
        pq.offer(10);
        pq.offer(20);
        System.out.print("PriorityQueue polling order: ");
        while (!pq.isEmpty()) {
            System.out.print(pq.poll() + " "); // always smallest first: 10, 20, 30
        }
        System.out.println();

        Deque<String> stack = new ArrayDeque<>();
        stack.push("first");
        stack.push("second");
        stack.push("third");
        System.out.println("Stack pop (LIFO): " + stack.pop()); // "third"

        Deque<String> queue = new ArrayDeque<>();
        queue.offer("first");
        queue.offer("second");
        System.out.println("Deque poll (FIFO): " + queue.poll()); // "first"
    }
}`,
        output: `PriorityQueue polling order: 10 20 30
Stack pop (LIFO): third
Deque poll (FIFO): first`,
      },
    ],
    commonMistakes: [
      'Assuming PriorityQueue.iterator() or toString() returns elements in sorted order — only repeated poll() calls guarantee sorted retrieval.',
      'Using the legacy Stack class for new code instead of ArrayDeque, missing out on better performance and no synchronization overhead.',
      'Adding a null element to a PriorityQueue or ArrayDeque, which throws NullPointerException immediately.',
      'Mixing up add()/remove() (throw exceptions) with offer()/poll() (return special values) and getting an unexpected exception on an empty queue.',
    ],
    keyPoints: [
      'Queue models FIFO processing with two parallel method families: exception-throwing and value-returning.',
      'PriorityQueue always retrieves the smallest element next (by Comparable or Comparator), not insertion order, in O(log n).',
      'ArrayDeque gives O(1) operations at both ends and is the recommended modern replacement for Stack.',
    ],
  },

  'iterator-and-listiterator': {
    title: 'Iterator and ListIterator',
    intro: `An <code>Iterator</code> is the standard way to traverse any <code>Collection</code> without exposing its internal structure. Every collection's <code>iterator()</code> method returns one, and it is what powers the for-each loop behind the scenes. <code>ListIterator</code>, available only on <code>List</code> implementations, extends this idea with bidirectional traversal and in-place modification.`,
    sections: [
      {
        heading: 'Iterator — Forward Traversal and Safe Removal',
        body: `Iterator exposes three methods: <code>hasNext()</code>, <code>next()</code>, and <code>remove()</code>. Crucially, <code>remove()</code> is the only safe way to delete elements from a collection while iterating over it. Calling the collection's own <code>remove()</code> method (for example <code>list.remove(x)</code>) during a for-each loop triggers a fail-fast check and throws <code>ConcurrentModificationException</code>, because most collections track a modification count internally and the iterator detects the mismatch on the next call to <code>next()</code>.`,
      },
      {
        heading: 'Fail-Fast Behavior',
        body: `Most Collections Framework iterators are "fail-fast": they detect structural modification (add or remove, not just value changes) made outside the iterator itself and throw <code>ConcurrentModificationException</code> as soon as it is noticed, rather than allowing undefined behavior to happen silently. This is a best-effort safety mechanism, not a hard guarantee — it exists to surface bugs early during development, not to provide thread-safety.`,
      },
      {
        heading: 'ListIterator — Bidirectional, with add() and set()',
        body: `ListIterator, obtained from <code>list.listIterator()</code>, adds <code>hasPrevious()</code> and <code>previous()</code> for backward traversal, plus <code>set(element)</code> to replace the last element returned by <code>next()</code>/<code>previous()</code>, and <code>add(element)</code> to insert a new element at the current cursor position. This makes ListIterator the only safe way to modify a list's contents (not just remove) while iterating.`,
        list: [
          '<code>Iterator</code>: forward-only, works on any Collection, supports remove().',
          '<code>ListIterator</code>: bidirectional, works only on List, supports remove(), set(), and add().',
        ],
      },
    ],
    examples: [
      {
        caption: 'Safe removal with Iterator versus an unsafe direct removal attempt',
        code: `import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

public class IteratorDemo {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));

        Iterator<Integer> it = numbers.iterator();
        while (it.hasNext()) {
            if (it.next() % 2 == 0) {
                it.remove(); // safe removal during iteration
            }
        }
        System.out.println("After removing evens: " + numbers);

        ListIterator<Integer> listIt = numbers.listIterator();
        while (listIt.hasNext()) {
            int value = listIt.next();
            listIt.set(value * 10); // replace element in place
        }
        System.out.println("After scaling by 10: " + numbers);
    }
}`,
        output: `After removing evens: [1, 3, 5]
After scaling by 10: [10, 30, 50]`,
      },
    ],
    commonMistakes: [
      'Calling list.remove(element) inside a for-each loop, which throws ConcurrentModificationException instead of the intended removal.',
      'Forgetting that Iterator.remove() removes the last element returned by next(), not an arbitrary element.',
      'Trying to use ListIterator-only methods (previous(), set(), add()) on a plain Iterator, which does not declare them.',
      'Treating fail-fast behavior as a thread-safety guarantee — it is a best-effort bug detector, not a concurrency control mechanism.',
    ],
    keyPoints: [
      'Iterator supports safe forward traversal and removal via remove(); direct collection mutation during iteration throws ConcurrentModificationException.',
      'ListIterator adds backward traversal plus set() and add(), and works only on List implementations.',
      'Fail-fast iterators detect structural modification made outside themselves and fail early rather than behave unpredictably.',
    ],
  },

  'comparable-vs-comparator': {
    title: 'Comparable vs Comparator',
    intro: `Java offers two distinct ways to define an ordering for objects: implementing the <code>Comparable</code> interface inside the class itself, or writing a separate <code>Comparator</code>. They solve related but different problems, and understanding when to use each is essential for sorting collections and building sorted data structures like TreeSet and TreeMap.`,
    sections: [
      {
        heading: 'Comparable — One Natural Ordering, Defined Inside the Class',
        body: `A class implements <code>Comparable&lt;T&gt;</code> by providing a single method: <code>compareTo(T other)</code>, which returns a negative number, zero, or a positive number depending on whether "this" object is less than, equal to, or greater than "other". This defines the class's <strong>natural ordering</strong> — the default order used by <code>Collections.sort()</code>, <code>Arrays.sort()</code>, TreeSet, and TreeMap when no other ordering is specified. A class can only have one natural ordering, because <code>compareTo()</code> is a single fixed method.`,
      },
      {
        heading: 'Comparator — Multiple External Orderings',
        body: `A <code>Comparator&lt;T&gt;</code> is a separate object defining a <code>compare(T a, T b)</code> method, written independently of the class being compared. This lets you define as many different orderings as you need — by name, by age, by price descending — without modifying the target class at all, and is especially useful for classes you don't own (like library classes) or classes with no obviously "natural" order.`,
      },
      {
        heading: 'Modern Comparator Construction',
        body: `Since Java 8, Comparator is a functional interface, so it is commonly built with lambdas or the static helper methods <code>Comparator.comparing()</code>, <code>.thenComparing()</code>, and <code>.reversed()</code>, which read almost like a sentence describing the sort order.`,
        list: [
          '<code>Comparable</code>: <code>compareTo(T o)</code>, one ordering, defined inside the class, used automatically by sort().',
          '<code>Comparator</code>: <code>compare(T a, T b)</code>, unlimited orderings, defined externally, passed explicitly to sort().',
        ],
      },
    ],
    examples: [
      {
        caption: 'Natural ordering via Comparable, plus two external orderings via Comparator',
        code: `import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

class Employee implements Comparable<Employee> {
    String name;
    int age;

    Employee(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public int compareTo(Employee other) {
        return Integer.compare(this.age, other.age); // natural order: by age
    }

    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}

public class ComparableComparatorDemo {
    public static void main(String[] args) {
        List<Employee> team = new ArrayList<>(List.of(
                new Employee("Ravi", 34),
                new Employee("Asha", 28),
                new Employee("Meera", 41)
        ));

        java.util.Collections.sort(team); // uses Comparable (natural order: by age)
        System.out.println("By age (natural): " + team);

        team.sort(Comparator.comparing(e -> e.name)); // Comparator: by name
        System.out.println("By name (Comparator): " + team);

        team.sort(Comparator.comparingInt((Employee e) -> e.age).reversed());
        System.out.println("By age descending (Comparator): " + team);
    }
}`,
        output: `By age (natural): [Asha(28), Ravi(34), Meera(41)]
By name (Comparator): [Asha(28), Meera(41), Ravi(34)]
By age descending (Comparator): [Meera(41), Ravi(34), Asha(28)]`,
      },
    ],
    commonMistakes: [
      'Trying to implement Comparable twice with different logic — a class can define only one compareTo() method, so it has exactly one natural ordering.',
      'Returning inconsistent results from compareTo() or compare() (not respecting antisymmetry/transitivity), which corrupts TreeSet/TreeMap ordering silently.',
      'Using compareTo() subtraction tricks like "a.getAge() - b.getAge()" which can silently overflow for large or negative int values — Integer.compare() is safer.',
      'Forgetting that TreeSet/TreeMap use compareTo()/compare() (not equals()) to determine element uniqueness, which can cause unexpected "duplicate" rejection.',
    ],
    keyPoints: [
      'Comparable defines a single natural ordering inside the class via compareTo(); used automatically by sort() and by TreeSet/TreeMap.',
      'Comparator defines an ordering externally via compare(), and any number of them can exist for the same class.',
      'Comparator.comparing().thenComparing().reversed() makes multi-field, readable sort logic easy to build with lambdas.',
    ],
  },

  'generics-in-java': {
    title: 'Generics in Java',
    intro: `Generics let classes, interfaces, and methods operate on a type that is specified as a parameter, rather than being hardcoded or left as raw <code>Object</code>. Introduced in Java 5, generics moved a whole category of bugs from runtime to compile time: without them, a collection could accept any type of object, and pulling the wrong type back out failed only when you tried to use it, often far from where the mistake was made.`,
    sections: [
      {
        heading: 'Why Generics Prevent ClassCastException',
        body: `Before generics, <code>List</code> stored plain <code>Object</code> references, so code had to cast every element retrieved from it. If the wrong type had been inserted somewhere, that cast failed at runtime with <code>ClassCastException</code>, often in a completely different part of the program. With <code>List&lt;String&gt;</code>, the compiler enforces at every call site that only Strings can be added, and no cast is needed on retrieval — the error is caught immediately, at compile time, instead of surfacing later as a runtime crash.`,
      },
      {
        heading: 'Type Erasure',
        body: `Generic type information exists only at compile time; the compiler checks it, then "erases" it, replacing type parameters with <code>Object</code> (or their bound) in the compiled bytecode. This is why you cannot do <code>new T[10]</code>, cannot use <code>instanceof</code> against a generic type parameter directly, and why <code>List&lt;String&gt;</code> and <code>List&lt;Integer&gt;</code> share exactly one <code>.class</code> file at runtime. Type erasure was a deliberate design choice for backward compatibility with pre-generics Java bytecode.`,
      },
      {
        heading: 'Bounded Type Parameters',
        body: `A bounded type parameter restricts what types can be substituted. <code>&lt;T extends Number&gt;</code> means T must be Number or one of its subclasses (Integer, Double, and so on), which allows the generic code to call Number's methods (like <code>doubleValue()</code>) on values of type T — something plain <code>&lt;T&gt;</code> would not allow, since an unbounded T is treated as Object.`,
      },
      {
        heading: 'Wildcards: ? extends and ? super',
        body: `Wildcards describe an unknown type in a context where you don't need to name it exactly. <code>List&lt;? extends Number&gt;</code> ("upper bounded") accepts a list of Number or any subtype, and is safe to <strong>read</strong> from (you can only add null to it, per the "Get and Put Principle"). <code>List&lt;? super Integer&gt;</code> ("lower bounded") accepts a list of Integer or any supertype, and is safe to <strong>write</strong> Integer values into. This distinction is often remembered as PECS: "Producer Extends, Consumer Super."`,
        list: [
          '<code>&lt;T extends Number&gt;</code> — bounded type parameter, restricts T to Number and its subtypes.',
          '<code>List&lt;? extends Number&gt;</code> — upper bounded wildcard, safe to read, unsafe to add to.',
          '<code>List&lt;? super Integer&gt;</code> — lower bounded wildcard, safe to write Integer into.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A generic method with a bounded type parameter, plus wildcard usage',
        code: `import java.util.List;

public class GenericsDemo {

    // Bounded type parameter: T must be a Number or subtype
    static double sumAll(List<? extends Number> numbers) {
        double total = 0;
        for (Number n : numbers) {
            total += n.doubleValue(); // safe: T extends Number guarantees this method exists
        }
        return total;
    }

    static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    public static void main(String[] args) {
        List<Integer> ints = List.of(1, 2, 3);
        List<Double> doubles = List.of(1.5, 2.5);

        System.out.println("Sum of ints: " + sumAll(ints));
        System.out.println("Sum of doubles: " + sumAll(doubles));
        System.out.println("Max: " + max(10, 25));
    }
}`,
        output: `Sum of ints: 6.0
Sum of doubles: 4.0
Max: 25`,
      },
    ],
    commonMistakes: [
      'Trying to create a generic array directly, such as "new T[10]" — type erasure makes this illegal, requiring workarounds like an Object[] cast.',
      'Adding elements to a "? extends" wildcard list (other than null), which the compiler rejects because the exact subtype is unknown.',
      'Using a raw type (e.g. "List list = new ArrayList()" without a type parameter) to avoid a compiler warning, which throws away all compile-time type checking.',
      'Confusing "? extends" (for reading/producing) with "? super" (for writing/consuming) — remember PECS: Producer Extends, Consumer Super.',
    ],
    keyPoints: [
      'Generics catch type mismatches at compile time, eliminating a whole category of runtime ClassCastException bugs.',
      'Type erasure removes generic type information after compilation, which is why generic arrays and instanceof checks against type parameters are restricted.',
      'Bounded type parameters (<T extends Number>) let generic code call methods defined on the bound.',
      'Wildcards (? extends for reading, ? super for writing) make APIs more flexible without sacrificing type safety.',
    ],
  },
}
