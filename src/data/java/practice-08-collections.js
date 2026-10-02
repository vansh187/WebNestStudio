// Practice blocks for the Collections Framework module. Merged onto the lesson entries
// in index.js by slug, so the lesson prose files stay unchanged. The Map lesson is not
// here because its practice blocks are written inline in the lesson file.
// Exercises print sorted or insertion-ordered collections so their output does not
// depend on hash order.
export const practice08Collections = {
  'collections-framework-overview': {
    whyItMatters: `Almost every Java program holds groups of objects: rows from a database, items in a cart, requests waiting to be handled. The Collections Framework gives all of these the same small set of interfaces, so choosing the right one is mostly a matter of answering three questions: does order matter, are duplicates allowed, and do you look things up by a key? Interviewers ask about collections more than any other part of the standard library.`,
    diagram: {
      caption: 'List, Set and Queue extend Collection. Map is a separate hierarchy because it stores key-value pairs and not single elements.',
      svg: `<svg viewBox="0 0 640 205" role="img" aria-label="Collection is extended by List, Set and Queue. Map is a separate hierarchy. List is implemented by ArrayList and LinkedList; Set by HashSet, LinkedHashSet and TreeSet; Queue by PriorityQueue and ArrayDeque; Map by HashMap, LinkedHashMap and TreeMap" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-monospace, monospace" font-size="13">
  <rect x="170" y="15" width="140" height="36" rx="6" stroke-width="3"/><text x="240" y="38" text-anchor="middle" fill="currentColor" stroke="none">Collection</text>
  <path d="M240 51 V72"/><path d="M80 72 H400"/><path d="M80 72 V95"/><path d="M240 72 V95"/><path d="M400 72 V95"/>
  <rect x="20" y="95" width="120" height="36" rx="6"/><text x="80" y="118" text-anchor="middle" fill="currentColor" stroke="none">List</text>
  <rect x="180" y="95" width="120" height="36" rx="6"/><text x="240" y="118" text-anchor="middle" fill="currentColor" stroke="none">Set</text>
  <rect x="340" y="95" width="120" height="36" rx="6"/><text x="400" y="118" text-anchor="middle" fill="currentColor" stroke="none">Queue</text>
  <rect x="500" y="95" width="120" height="36" rx="6" stroke-width="3"/><text x="560" y="118" text-anchor="middle" fill="currentColor" stroke="none">Map</text>
  <text x="560" y="85" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">not a Collection</text>
  <g fill="currentColor" stroke="none" font-size="11" text-anchor="middle">
    <text x="80" y="155">ArrayList</text><text x="80" y="172">LinkedList</text>
    <text x="240" y="155">HashSet</text><text x="240" y="172">LinkedHashSet</text><text x="240" y="189">TreeSet</text>
    <text x="400" y="155">PriorityQueue</text><text x="400" y="172">ArrayDeque</text>
    <text x="560" y="155">HashMap</text><text x="560" y="172">LinkedHashMap</text><text x="560" y="189">TreeMap</text>
  </g>
</svg>`,
    },
    exercise: {
      prompt: `The list below contains repeated names. Build a collection that holds each name once, in alphabetical order, then print how many distinct names there are and the collection itself.

Expected output: <code>3</code> then <code>[Asha, Ravi, Zoya]</code>`,
      starterCode: `import java.util.List;

public class DistinctNames {
    public static void main(String[] args) {
        List<String> names = List.of("Ravi", "Asha", "Zoya", "Asha", "Ravi");

        // TODO: create a collection with no duplicates, kept in sorted order
        // TODO: print its size, then print the collection
    }
}`,
      hints: [
        'A <code>Set</code> rejects duplicates, and a <code>TreeSet</code> also keeps its elements sorted.',
        'Most collections have a constructor that takes another collection: <code>new TreeSet&lt;&gt;(names)</code>.',
      ],
      solution: `import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class DistinctNames {
    public static void main(String[] args) {
        List<String> names = List.of("Ravi", "Asha", "Zoya", "Asha", "Ravi");

        Set<String> distinct = new TreeSet<>(names);

        System.out.println(distinct.size()); // 3
        System.out.println(distinct);        // [Asha, Ravi, Zoya]
    }
}`,
    },
    quiz: [
      {
        question: 'Which of these interfaces does <strong>not</strong> extend <code>Collection</code>?',
        options: ['List', 'Set', 'Queue', 'Map'],
        answer: 3,
        explanation: 'Map stores key-value pairs and has its own hierarchy.',
      },
      {
        question: 'You need to keep elements in the order they were added and allow duplicates. Which interface fits?',
        options: ['List', 'Set', 'Map', 'SortedSet'],
        answer: 0,
        explanation: 'A List is ordered by position and allows duplicate elements.',
      },
      {
        question: 'Why is <code>List&lt;String&gt; names = new ArrayList&lt;&gt;();</code> preferred over <code>ArrayList&lt;String&gt; names = new ArrayList&lt;&gt;();</code>?',
        options: ['It runs faster', 'The rest of the code depends only on the interface, so the implementation can be changed in one place', 'ArrayList cannot be used as a variable type', 'It uses less memory'],
        answer: 1,
        explanation: 'Code written against List works unchanged if the implementation later becomes a LinkedList or an unmodifiable list.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between Collection and Collections?',
        answer: `<code>Collection</code> is an interface, the root of the List, Set and Queue hierarchy. <code>Collections</code> is a utility class of static methods that work on collections, such as <code>sort</code>, <code>reverse</code>, <code>max</code> and <code>unmodifiableList</code>.`,
      },
      {
        question: 'What are the main interfaces of the Collections Framework and how do they differ?',
        answer: `<code>List</code> is an ordered sequence that allows duplicates and access by index. <code>Set</code> holds no duplicates. <code>Queue</code> holds elements waiting to be processed, usually first-in-first-out, and <code>Deque</code> allows adding and removing at both ends. <code>Map</code> stores key-value pairs with unique keys and is not a <code>Collection</code>.`,
      },
      {
        question: 'What is the difference between an array and an ArrayList?',
        answer: `An array has a fixed length and can hold primitives or objects. An <code>ArrayList</code> grows as elements are added, holds only objects (primitives are boxed), and provides methods such as <code>add</code>, <code>remove</code> and <code>contains</code>. An <code>ArrayList</code> uses an array internally and copies it to a larger one when it is full.`,
      },
    ],
  },

  'list-interface-arraylist-linkedlist-vector': {
    whyItMatters: `<code>ArrayList</code> is the collection you will use most, and "ArrayList or LinkedList?" is one of the most common interview questions in Java. The honest answer depends on how the two store their elements, so it is worth knowing what each operation costs and not only which methods exist.`,
    complexity: [
      { operation: 'ArrayList <code>get(i)</code>', average: 'O(1)', worst: 'O(1)' },
      { operation: 'ArrayList <code>add(e)</code> at the end', average: 'O(1)', worst: 'O(n) when the array must grow' },
      { operation: 'ArrayList insert or remove in the middle', average: 'O(n)', worst: 'O(n)' },
      { operation: 'LinkedList <code>get(i)</code>', average: 'O(n)', worst: 'O(n)' },
      { operation: 'LinkedList add or remove at either end', average: 'O(1)', worst: 'O(1)' },
      { operation: '<code>contains(o)</code> on either', average: 'O(n)', worst: 'O(n)' },
    ],
    exercise: {
      prompt: `<code>List</code> has two <code>remove</code> methods: one takes an index and one takes the object to remove. With a list of integers it is easy to call the wrong one. From the list below, remove the element at index 1, and then remove the value <code>20</code>.

Expected output: <code>[5, 15]</code>`,
      starterCode: `import java.util.ArrayList;
import java.util.List;

public class RemoveFromList {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(List.of(5, 10, 15, 20));

        // TODO: remove the element at index 1
        // TODO: remove the value 20 (not the element at index 20)

        System.out.println(numbers);
    }
}`,
      hints: [
        '<code>numbers.remove(1)</code> treats 1 as an index because the argument is an <code>int</code>.',
        'To remove by value, pass an <code>Integer</code> object: <code>numbers.remove(Integer.valueOf(20))</code>.',
      ],
      solution: `import java.util.ArrayList;
import java.util.List;

public class RemoveFromList {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(List.of(5, 10, 15, 20));

        numbers.remove(1);                   // by index: removes 10
        numbers.remove(Integer.valueOf(20)); // by value: removes 20

        System.out.println(numbers); // [5, 15]
    }
}`,
    },
    quiz: [
      {
        question: 'Which operation is faster on an <code>ArrayList</code> than on a <code>LinkedList</code>?',
        options: ['Adding at the front', 'Reading the element at a given index', 'Removing the first element', 'None; they cost the same'],
        answer: 1,
        explanation: 'ArrayList reads directly from its array. LinkedList has to walk from one end to the index.',
      },
      {
        question: 'What happens when an <code>ArrayList</code> is full and another element is added?',
        options: ['It throws an exception', 'It turns into a LinkedList', 'The oldest element is dropped', 'It allocates a larger array and copies the elements across'],
        answer: 3,
        explanation: 'The internal array grows by about half its size, which is why an occasional add costs O(n).',
      },
      {
        question: 'Why is <code>Vector</code> rarely used in new code?',
        options: ['Every method is synchronized, which costs time even when only one thread uses it', 'It cannot hold objects', 'It was removed from Java', 'It does not implement List'],
        answer: 0,
        explanation: 'ArrayList is used instead, with a concurrent collection or explicit locking when threads share the list.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between ArrayList and LinkedList?',
        answer: `<code>ArrayList</code> stores its elements in an array, so reading by index is O(1), but inserting or removing in the middle shifts the elements after it, which is O(n). <code>LinkedList</code> stores each element in a node linked to its neighbours, so adding or removing at either end is O(1), but reaching a position by index means walking the links, which is O(n). In practice <code>ArrayList</code> is the default: it uses less memory per element and is faster for most workloads because its elements sit next to each other in memory.`,
      },
      {
        question: 'How does an ArrayList grow?',
        answer: `It keeps an internal array. When that array is full, it creates a new array about one and a half times as large and copies the elements into it. If the final size is known in advance, passing it to the constructor, as in <code>new ArrayList&lt;&gt;(1000)</code>, avoids the repeated copying.`,
      },
      {
        question: 'How do you make an ArrayList safe to use from several threads?',
        answer: `Wrap it with <code>Collections.synchronizedList(list)</code>, which locks on every method call, or use <code>CopyOnWriteArrayList</code> when reads greatly outnumber writes. <code>Vector</code> is also synchronized but is a legacy class. With a synchronized wrapper, iteration still has to be placed in a <code>synchronized</code> block by the caller.`,
      },
    ],
  },

  'set-interface-hashset-linkedhashset-treeset': {
    whyItMatters: `A <code>Set</code> answers the question "have I seen this before?" in constant time, which a list cannot do. Removing duplicates, checking membership and finding what two groups have in common are all set operations. The three implementations differ only in the order they give back the elements and in what that order costs.`,
    complexity: [
      { operation: 'HashSet / LinkedHashSet <code>add</code>, <code>contains</code>, <code>remove</code>', average: 'O(1)', worst: 'O(log n) when many elements share a bucket' },
      { operation: 'TreeSet <code>add</code>, <code>contains</code>, <code>remove</code>', average: 'O(log n)', worst: 'O(log n)' },
      { operation: 'TreeSet <code>first()</code>, <code>last()</code>', average: 'O(log n)', worst: 'O(log n)' },
    ],
    exercise: {
      prompt: `Print the first colour that appears a second time in the list. Use the value that <code>add</code> returns instead of calling <code>contains</code> first.

Expected output: <code>blue</code>`,
      starterCode: `import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class FirstDuplicate {
    public static void main(String[] args) {
        List<String> colours = List.of("red", "blue", "green", "blue", "red");
        Set<String> seen = new HashSet<>();

        for (String colour : colours) {
            // TODO: add the colour to the set; if it was already there, print it and stop
        }
    }
}`,
      hints: [
        '<code>seen.add(colour)</code> returns <code>false</code> when the set already contains that element.',
        'Use <code>break</code> to leave the loop after printing.',
      ],
      solution: `import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class FirstDuplicate {
    public static void main(String[] args) {
        List<String> colours = List.of("red", "blue", "green", "blue", "red");
        Set<String> seen = new HashSet<>();

        for (String colour : colours) {
            if (!seen.add(colour)) { // false means it was already in the set
                System.out.println(colour); // blue
                break;
            }
        }
    }
}`,
    },
    quiz: [
      {
        question: 'Which <code>Set</code> returns its elements in the order they were added?',
        options: ['HashSet', 'LinkedHashSet', 'TreeSet', 'None of them'],
        answer: 1,
        explanation: 'LinkedHashSet keeps a linked list through its entries to remember insertion order.',
      },
      {
        question: 'What does <code>set.add(x)</code> return when <code>x</code> is already in the set?',
        options: ['true', 'null', 'false', 'It throws an exception'],
        answer: 2,
        explanation: 'The set is unchanged and add returns false.',
      },
      {
        question: 'What happens when you add objects of a class that is not <code>Comparable</code> to a <code>TreeSet</code> created with no comparator?',
        options: ['They are stored in insertion order', 'It does not compile', 'They are sorted by hash code', 'ClassCastException is thrown at runtime'],
        answer: 3,
        explanation: 'TreeSet has to compare elements to place them, and it casts them to Comparable to do so.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between HashSet, LinkedHashSet and TreeSet?',
        answer: `All three hold no duplicates. <code>HashSet</code> gives no ordering guarantee and has O(1) average operations. <code>LinkedHashSet</code> has the same speed and returns elements in insertion order. <code>TreeSet</code> keeps elements sorted, by their natural order or a <code>Comparator</code>, with O(log n) operations, and offers methods such as <code>first()</code>, <code>headSet()</code> and <code>ceiling()</code>.`,
      },
      {
        question: 'How does a HashSet decide that two elements are duplicates?',
        answer: `It uses <code>hashCode()</code> to find the bucket and then <code>equals()</code> to compare with the elements already there. Two objects are duplicates only if their hash codes match and <code>equals()</code> returns true. A class that overrides <code>equals()</code> without <code>hashCode()</code> can therefore be stored twice in the same set.`,
      },
      {
        question: 'Can a Set contain null?',
        answer: `<code>HashSet</code> and <code>LinkedHashSet</code> allow one <code>null</code>. A <code>TreeSet</code> that uses natural ordering throws <code>NullPointerException</code> when <code>null</code> is added, because it has to call <code>compareTo</code> on the element.`,
      },
    ],
  },

  'how-hashmap-works-internally': {
    whyItMatters: `This is probably the single most asked Java interview question, and it is asked because it has practical consequences. A key class with a wrong <code>hashCode()</code> produces a map that silently fails to find entries, and a poor one turns a fast map into a slow one. Understanding buckets, collisions and resizing explains both problems.`,
    diagram: {
      caption: 'The hash of the key selects a bucket. Keys that land in the same bucket are linked in a chain and told apart with equals().',
      svg: `<svg viewBox="0 0 640 195" role="img" aria-label="The key ravi is hashed to bucket index 2 of the bucket array. Bucket 2 holds a chain of two entries, ravi=31 and meera=27" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-monospace, monospace" font-size="13">
  <rect x="10" y="82" width="90" height="36" rx="6"/><text x="55" y="105" text-anchor="middle" fill="currentColor" stroke="none">"ravi"</text>
  <path d="M100 100 H140"/><path d="M134 94 L140 100 L134 106"/>
  <rect x="140" y="82" width="160" height="36" rx="6"/><text x="220" y="105" text-anchor="middle" fill="currentColor" stroke="none">hash &amp; (n - 1) = 2</text>
  <path d="M300 100 H340"/><path d="M334 94 L340 100 L334 106"/>
  <rect x="340" y="10" width="50" height="36"/><text x="365" y="33" text-anchor="middle" fill="currentColor" stroke="none">0</text>
  <rect x="340" y="46" width="50" height="36"/><text x="365" y="69" text-anchor="middle" fill="currentColor" stroke="none">1</text>
  <rect x="340" y="82" width="50" height="36" stroke-width="3"/><text x="365" y="105" text-anchor="middle" fill="currentColor" stroke="none">2</text>
  <rect x="340" y="118" width="50" height="36"/><text x="365" y="141" text-anchor="middle" fill="currentColor" stroke="none">3</text>
  <path d="M390 100 H420"/><path d="M414 94 L420 100 L414 106"/>
  <rect x="420" y="82" width="90" height="36" rx="6"/><text x="465" y="105" text-anchor="middle" fill="currentColor" stroke="none">ravi=31</text>
  <path d="M510 100 H535"/><path d="M529 94 L535 100 L529 106"/>
  <rect x="535" y="82" width="95" height="36" rx="6"/><text x="582" y="105" text-anchor="middle" fill="currentColor" stroke="none">meera=27</text>
  <text x="365" y="180" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">bucket array</text>
  <text x="525" y="140" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">chain in bucket 2</text>
</svg>`,
    },
    complexity: [
      { operation: '<code>get</code>, <code>put</code>, <code>remove</code>', average: 'O(1)', worst: 'O(log n) once a long chain has become a tree' },
      { operation: 'Resize (rehash every entry)', average: 'O(n)', worst: 'O(n)' },
      { operation: '<code>containsValue</code>', average: 'O(n)', worst: 'O(n)' },
    ],
    exercise: {
      prompt: `<code>Point</code> overrides <code>equals()</code> but not <code>hashCode()</code>, so a second <code>Point(1, 2)</code> goes to a different bucket and the lookup returns <code>null</code>. Add a <code>hashCode()</code> that agrees with <code>equals()</code>.

Expected output: <code>found</code>`,
      starterCode: `import java.util.HashMap;
import java.util.Map;

class Point {
    final int x;
    final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point)) return false;
        Point other = (Point) o;
        return x == other.x && y == other.y;
    }

    // TODO: override hashCode() so equal points have equal hash codes
}

public class PointLookup {
    public static void main(String[] args) {
        Map<Point, String> labels = new HashMap<>();
        labels.put(new Point(1, 2), "found");

        System.out.println(labels.get(new Point(1, 2)));
    }
}`,
      hints: [
        'Use the same fields in <code>hashCode()</code> that <code>equals()</code> compares.',
        '<code>Objects.hash(x, y)</code> from <code>java.util.Objects</code> combines them for you.',
      ],
      solution: `import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

class Point {
    final int x;
    final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point)) return false;
        Point other = (Point) o;
        return x == other.x && y == other.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y); // same fields as equals()
    }
}

public class PointLookup {
    public static void main(String[] args) {
        Map<Point, String> labels = new HashMap<>();
        labels.put(new Point(1, 2), "found");

        System.out.println(labels.get(new Point(1, 2))); // found
    }
}`,
    },
    quiz: [
      {
        question: 'Two different keys produce the same bucket index. What does <code>HashMap</code> do?',
        options: ['Stores both in that bucket and uses equals() to tell them apart', 'Throws an exception', 'Replaces the first entry', 'Resizes immediately'],
        answer: 0,
        explanation: 'This is a collision. The entries are chained in the bucket and searched with equals().',
      },
      {
        question: 'With the default capacity of 16 and load factor of 0.75, when does the map resize?',
        options: ['When the 8th entry is added', 'When the number of entries exceeds 12', 'When the 16th entry is added', 'Only when a bucket holds 8 entries'],
        answer: 1,
        explanation: 'The threshold is capacity × load factor, which is 16 × 0.75 = 12. The capacity then doubles.',
      },
      {
        question: 'Which statement about <code>equals()</code> and <code>hashCode()</code> must always hold?',
        options: ['Objects with equal hash codes must be equal', 'Unequal objects must have different hash codes', 'Equal objects must have equal hash codes', 'hashCode() must return a different value on each call'],
        answer: 2,
        explanation: 'Unequal objects may share a hash code; that is only a collision. Equal objects with different hash codes break the map.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How does HashMap store and retrieve an entry?',
        answer: `For <code>put</code>, it calls <code>hashCode()</code> on the key, mixes the high bits into the low bits, and uses the result to choose a bucket in its internal array. If the bucket is empty, the entry is stored there. If not, it compares the key with each entry in the bucket using <code>equals()</code>: a match replaces the value, and otherwise the new entry is added to the chain. <code>get</code> follows the same steps to find the bucket and then the matching key.`,
      },
      {
        question: 'What changed in HashMap in Java 8?',
        answer: `Before Java 8, entries in one bucket were always a linked list, so a bucket with many collisions cost O(n) to search. Since Java 8, when a chain grows beyond 8 entries and the table has at least 64 buckets, that chain is converted to a red-black tree, which brings the worst case down to O(log n). It is converted back to a list if it later shrinks.`,
      },
      {
        question: 'Why should the keys of a HashMap be immutable?',
        answer: `The bucket is chosen from the key's hash code at the time of <code>put</code>. If a field used in <code>hashCode()</code> changes afterwards, the key now hashes to a different bucket, and <code>get</code> looks in the wrong place and cannot find the entry, although it is still in the map. This is why <code>String</code> and the wrapper classes, which are immutable, are the usual key types.`,
      },
    ],
  },

  'queue-and-deque-priorityqueue-arraydeque': {
    whyItMatters: `Queues and stacks are how programs hold work that is waiting to be done: tasks for a thread pool, nodes still to visit in a graph search, operations that can be undone. <code>ArrayDeque</code> is the right class for both a stack and a plain queue, and <code>PriorityQueue</code> is the standard tool whenever the next item should be the smallest or the most urgent and not the oldest.`,
    complexity: [
      { operation: 'ArrayDeque add or remove at either end', average: 'O(1)', worst: 'O(n) when the array must grow' },
      { operation: 'PriorityQueue <code>offer</code>, <code>poll</code>', average: 'O(log n)', worst: 'O(log n)' },
      { operation: 'PriorityQueue <code>peek</code>', average: 'O(1)', worst: 'O(1)' },
      { operation: 'PriorityQueue <code>contains</code>, <code>remove(o)</code>', average: 'O(n)', worst: 'O(n)' },
    ],
    productionExample: {
      heading: 'Where this is used',
      body: `Breadth-first search uses a queue of nodes still to visit, and depth-first search uses a stack; both are normally an <code>ArrayDeque</code>. A <code>PriorityQueue</code> is behind Dijkstra's shortest-path algorithm, schedulers that run the earliest-due job first, and the common interview task of finding the top <em>k</em> items of a large collection.`,
    },
    exercise: {
      prompt: `Use an <code>ArrayDeque</code> as a stack to check whether the brackets in a string are balanced. Each closing bracket must match the most recent opening bracket that is still open.

Expected output: <code>true</code> then <code>false</code>`,
      starterCode: `import java.util.ArrayDeque;
import java.util.Deque;

public class Brackets {

    static boolean balanced(String text) {
        Deque<Character> stack = new ArrayDeque<>();

        // TODO: push each opening bracket
        // TODO: for each closing bracket, pop and check that it matches

        return false; // TODO: balanced only if nothing is left open
    }

    public static void main(String[] args) {
        System.out.println(balanced("{[()]}"));
        System.out.println(balanced("([)]"));
    }
}`,
      hints: [
        '<code>push</code> adds to the top of the stack and <code>pop</code> removes from the top.',
        'A closing bracket with an empty stack means the string is not balanced. Check <code>isEmpty()</code> before calling <code>pop</code>.',
      ],
      solution: `import java.util.ArrayDeque;
import java.util.Deque;

public class Brackets {

    static boolean balanced(String text) {
        Deque<Character> stack = new ArrayDeque<>();

        for (char c : text.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) {
                    return false;
                }
                char open = stack.pop();
                boolean matches = (open == '(' && c == ')')
                        || (open == '[' && c == ']')
                        || (open == '{' && c == '}');
                if (!matches) {
                    return false;
                }
            }
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println(balanced("{[()]}")); // true
        System.out.println(balanced("([)]"));   // false
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>poll()</code> return when the queue is empty?',
        options: ['It throws NoSuchElementException', 'An empty Optional', '0', 'null'],
        answer: 3,
        explanation: 'poll() and peek() return null on an empty queue. remove() and element() throw.',
      },
      {
        question: 'The numbers 5, 1 and 3 are added to a <code>PriorityQueue&lt;Integer&gt;</code> in that order. What does the first <code>poll()</code> return?',
        options: ['5', '3', '1', 'It depends on the JVM'],
        answer: 2,
        explanation: 'A PriorityQueue returns the smallest element first, by natural ordering, whatever the insertion order.',
      },
      {
        question: 'Which class is recommended for a stack in new code?',
        options: ['Stack', 'ArrayDeque', 'Vector', 'PriorityQueue'],
        answer: 1,
        explanation: 'Stack extends the legacy, synchronized Vector. ArrayDeque is faster and has push, pop and peek.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a Queue and a Deque?',
        answer: `A <code>Queue</code> adds at one end and removes from the other, which gives first-in-first-out order. A <code>Deque</code>, a double-ended queue, can add and remove at both ends, so the same object can act as a queue or as a stack. <code>ArrayDeque</code> and <code>LinkedList</code> both implement <code>Deque</code>.`,
      },
      {
        question: 'How does a PriorityQueue work internally?',
        answer: `It is a binary heap stored in an array. The smallest element is always at the root, so <code>peek</code> is O(1). Adding an element or removing the root moves an element up or down the heap to restore the order, which is O(log n). The array as a whole is not sorted, so iterating over a <code>PriorityQueue</code> does not return the elements in priority order; only repeated <code>poll</code> calls do.`,
      },
      {
        question: 'How do you make a PriorityQueue return the largest element first?',
        answer: `Pass a comparator that reverses the order: <code>new PriorityQueue&lt;&gt;(Comparator.reverseOrder())</code>. For objects, pass a comparator on the field that sets the priority, for example <code>Comparator.comparingInt(Task::getPriority).reversed()</code>.`,
      },
    ],
  },

  'iterator-and-listiterator': {
    whyItMatters: `Every for-each loop over a collection is an <code>Iterator</code> underneath. That is why removing an element inside a for-each loop throws <code>ConcurrentModificationException</code>, a failure most Java developers meet in their first months. Knowing how the iterator works tells you why it happens and what the correct ways to remove are.`,
    exercise: {
      prompt: `Remove every word shorter than 4 characters from the list while iterating over it. Use an explicit <code>Iterator</code> so that the removal is safe.

Expected output: <code>[kiwi, mango]</code>`,
      starterCode: `import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class RemoveShortWords {
    public static void main(String[] args) {
        List<String> fruits = new ArrayList<>(List.of("kiwi", "fig", "mango", "pea"));

        // TODO: get an Iterator and remove each word whose length is less than 4

        System.out.println(fruits);
    }
}`,
      hints: [
        'Loop with <code>while (it.hasNext())</code> and read each element with <code>it.next()</code>.',
        'Call <code>it.remove()</code>, not <code>fruits.remove(...)</code>. It removes the element that <code>next()</code> last returned.',
      ],
      solution: `import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class RemoveShortWords {
    public static void main(String[] args) {
        List<String> fruits = new ArrayList<>(List.of("kiwi", "fig", "mango", "pea"));

        Iterator<String> it = fruits.iterator();
        while (it.hasNext()) {
            String fruit = it.next();
            if (fruit.length() < 4) {
                it.remove(); // removes the element just returned by next()
            }
        }

        System.out.println(fruits); // [kiwi, mango]
    }
}`,
    },
    quiz: [
      {
        question: 'What usually happens when you call <code>list.remove(item)</code> inside a for-each loop over the same <code>ArrayList</code>?',
        options: ['The item is removed safely', 'It does not compile', 'ConcurrentModificationException is thrown', 'The loop restarts from the beginning'],
        answer: 2,
        explanation: 'The iterator behind the loop notices that the list was changed by something other than itself.',
      },
      {
        question: 'Which of these can <code>ListIterator</code> do that <code>Iterator</code> cannot?',
        options: ['Remove elements', 'Iterate over a Map', 'Iterate over a Set', 'Move backwards and replace the current element'],
        answer: 3,
        explanation: 'ListIterator adds hasPrevious(), previous(), set() and add(). It is available only for lists.',
      },
      {
        question: 'What happens if <code>it.remove()</code> is called twice in a row without a call to <code>next()</code> in between?',
        options: ['IllegalStateException is thrown', 'The second call does nothing', 'Two elements are removed', 'ConcurrentModificationException is thrown'],
        answer: 0,
        explanation: 'remove() can be called once for each call to next().',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between Iterator and ListIterator?',
        answer: `<code>Iterator</code> works on any collection, moves forward only, and can remove the current element. <code>ListIterator</code> works only on lists and can also move backwards, report the current index, replace the current element with <code>set()</code> and insert with <code>add()</code>.`,
      },
      {
        question: 'How do you remove elements from a collection while iterating over it?',
        answer: `Use the iterator's own <code>remove()</code> method, or call <code>collection.removeIf(condition)</code>, which was added in Java 8 and does the same thing in one line. Removing through the collection itself during iteration makes a fail-fast iterator throw <code>ConcurrentModificationException</code>.`,
      },
      {
        question: 'How does a for-each loop relate to Iterator?',
        answer: `For any class that implements <code>Iterable</code>, the compiler turns a for-each loop into a call to <code>iterator()</code> followed by a <code>hasNext()</code> / <code>next()</code> loop. The iterator is hidden, so the loop body cannot call its <code>remove()</code> method.`,
      },
    ],
  },

  'comparable-vs-comparator': {
    whyItMatters: `Sorting objects is an everyday task: employees by salary, orders by date, products by price and then by name. Java can only sort objects if it is told how to compare them, and there are two ways to do that. Knowing which to use, and how to chain comparators for several fields, covers nearly every sorting requirement you will meet.`,
    exercise: {
      prompt: `Sort the employees by salary, highest first. Employees with the same salary should be ordered by name. Then print the names.

Expected output: <code>Ravi</code>, <code>Asha</code>, <code>Zoya</code> (one per line)`,
      starterCode: `import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

class Employee {
    private final String name;
    private final int salary;

    Employee(String name, int salary) {
        this.name = name;
        this.salary = salary;
    }

    String getName() { return name; }
    int getSalary() { return salary; }
}

public class SortEmployees {
    public static void main(String[] args) {
        List<Employee> staff = new ArrayList<>(List.of(
                new Employee("Zoya", 50000),
                new Employee("Ravi", 70000),
                new Employee("Asha", 50000)));

        // TODO: sort by salary descending, then by name

        for (Employee e : staff) {
            System.out.println(e.getName());
        }
    }
}`,
      hints: [
        'Start with <code>Comparator.comparingInt(Employee::getSalary)</code> and call <code>reversed()</code> on it.',
        'Add the second rule with <code>thenComparing(Employee::getName)</code>, after <code>reversed()</code> so that names stay in ascending order.',
      ],
      solution: `import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

class Employee {
    private final String name;
    private final int salary;

    Employee(String name, int salary) {
        this.name = name;
        this.salary = salary;
    }

    String getName() { return name; }
    int getSalary() { return salary; }
}

public class SortEmployees {
    public static void main(String[] args) {
        List<Employee> staff = new ArrayList<>(List.of(
                new Employee("Zoya", 50000),
                new Employee("Ravi", 70000),
                new Employee("Asha", 50000)));

        staff.sort(Comparator.comparingInt(Employee::getSalary).reversed()
                .thenComparing(Employee::getName));

        for (Employee e : staff) {
            System.out.println(e.getName()); // Ravi, Asha, Zoya
        }
    }
}`,
    },
    quiz: [
      {
        question: 'Which method does a class implement to define its natural ordering?',
        options: ['compare(a, b) from Comparator', 'compareTo(other) from Comparable', 'equals(other)', 'sort()'],
        answer: 1,
        explanation: 'Comparable has one method, compareTo, written inside the class being compared.',
      },
      {
        question: 'What should <code>a.compareTo(b)</code> return when <code>a</code> comes before <code>b</code>?',
        options: ['A positive number', 'Zero', 'A negative number', 'true'],
        answer: 2,
        explanation: 'Negative means a is less than b, zero means they are equal in order, positive means a is greater.',
      },
      {
        question: 'You need to sort the same list of products by price on one screen and by name on another. What should you use?',
        options: ['Two Comparable implementations in the Product class', 'It is not possible', 'A TreeSet', 'One Comparator for each ordering'],
        answer: 3,
        explanation: 'A class can have only one compareTo, but any number of comparators can be written for it.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between Comparable and Comparator?',
        answer: `<code>Comparable</code> is implemented by the class itself through <code>compareTo()</code> and defines its single natural ordering; <code>String</code> and <code>Integer</code> are examples. <code>Comparator</code> is a separate object with a <code>compare(a, b)</code> method, so you can define many orderings for one class and sort classes whose source you cannot change. Sorting methods and sorted collections use the natural ordering unless a comparator is passed.`,
      },
      {
        question: 'Why is "return this.age - other.age" a risky way to write compareTo?',
        answer: `Subtracting two <code>int</code> values can overflow when they are far apart, for example a large positive number minus a large negative number, and the result then has the wrong sign. <code>Integer.compare(this.age, other.age)</code> always returns the correct sign and should be used instead.`,
      },
      {
        question: 'What does it mean for compareTo to be consistent with equals?',
        answer: `It means <code>a.compareTo(b) == 0</code> exactly when <code>a.equals(b)</code> is true. Sorted collections such as <code>TreeSet</code> and <code>TreeMap</code> use the comparison, not <code>equals()</code>, to decide whether two elements are the same. If the two disagree, a <code>TreeSet</code> can drop an element that a <code>HashSet</code> would keep.`,
      },
    ],
  },

  'generics-in-java': {
    whyItMatters: `Every collection you declare uses generics, and so do most modern Java APIs. They move a whole class of errors from runtime, where they appear as <code>ClassCastException</code> in production, to compile time, where they appear as a red line in the editor. Reading signatures that contain <code>&lt;T&gt;</code>, <code>? extends</code> and <code>? super</code> is a required skill for using the standard library and Spring.`,
    exercise: {
      prompt: `Write a generic method <code>max</code> that returns the largest element of a list. It should work for any type that can be compared with itself, such as <code>Integer</code> and <code>String</code>.

Expected output: <code>9</code> then <code>pear</code>`,
      starterCode: `import java.util.List;

public class GenericMax {

    // TODO: declare a generic method max that takes a List<T> and returns a T,
    //       where T is limited to types that implement Comparable<T>

    public static void main(String[] args) {
        System.out.println(max(List.of(3, 9, 4)));
        System.out.println(max(List.of("apple", "pear", "fig")));
    }
}`,
      hints: [
        'The type parameter goes before the return type: <code>static &lt;T extends Comparable&lt;T&gt;&gt; T max(List&lt;T&gt; items)</code>.',
        'Start with the first element as the best so far and replace it whenever <code>item.compareTo(best) &gt; 0</code>.',
      ],
      solution: `import java.util.List;

public class GenericMax {

    static <T extends Comparable<T>> T max(List<T> items) {
        T best = items.get(0);
        for (T item : items) {
            if (item.compareTo(best) > 0) {
                best = item;
            }
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(max(List.of(3, 9, 4)));                // 9
        System.out.println(max(List.of("apple", "pear", "fig"))); // pear
    }
}`,
    },
    quiz: [
      {
        question: 'What is the main benefit of <code>List&lt;String&gt;</code> over a raw <code>List</code>?',
        options: ['Adding a non-String is a compile-time error, and no cast is needed when reading', 'It runs faster', 'It uses less memory', 'It can hold primitives'],
        answer: 0,
        explanation: 'The compiler checks the element type, so the mistake is found before the program runs.',
      },
      {
        question: 'At runtime, do <code>List&lt;String&gt;</code> and <code>List&lt;Integer&gt;</code> have different classes?',
        options: ['Yes', 'No; both are the same class because of type erasure', 'Only on Java 8', 'Only if the lists are empty'],
        answer: 1,
        explanation: 'The compiler removes the type arguments. Both lists are plain ArrayList (or whichever implementation) at runtime.',
      },
      {
        question: 'A method takes <code>List&lt;? extends Number&gt;</code>. What can it safely do with the list?',
        options: ['Read elements as Number, but not add elements', 'Add any Number', 'Add Integer values only', 'Nothing'],
        answer: 0,
        explanation: 'The actual list might be a List of Integer or of Double, so the compiler cannot allow adding either.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is type erasure?',
        answer: `Generic type information exists only at compile time. After checking the types, the compiler replaces each type parameter with its bound, or with <code>Object</code> if it has none, and inserts casts where needed. This kept generic code compatible with older Java. Its consequences are that you cannot write <code>new T()</code>, cannot use <code>instanceof List&lt;String&gt;</code>, and cannot overload two methods that differ only in a type argument.`,
      },
      {
        question: 'What is the difference between "? extends T" and "? super T"?',
        answer: `<code>List&lt;? extends T&gt;</code> is a list of some unknown subtype of <code>T</code>: you can read elements as <code>T</code> but cannot add to it. <code>List&lt;? super T&gt;</code> is a list of some unknown supertype of <code>T</code>: you can add <code>T</code> values but can read elements only as <code>Object</code>. The usual rule is "producer extends, consumer super": use <code>extends</code> when the method reads from the collection and <code>super</code> when it writes to it.`,
      },
      {
        question: 'Why is List&lt;Integer&gt; not a subtype of List&lt;Number&gt;?',
        answer: `If it were, a method could receive a <code>List&lt;Integer&gt;</code> as a <code>List&lt;Number&gt;</code> and add a <code>Double</code> to it, which would break the original list. Generic types are therefore not related just because their type arguments are. To accept a list of any kind of number, a method declares its parameter as <code>List&lt;? extends Number&gt;</code>.`,
      },
    ],
  },

  'collections-utility-methods-and-fail-fast-vs-fail-safe-iterators': {
    whyItMatters: `The <code>Collections</code> class saves you from writing sorting, reversing and searching code by hand, and its wrapper methods are how you hand out a list that other code cannot change. The second half of this lesson, fail-fast and fail-safe iterators, explains what happens when a collection changes while it is being read, which matters as soon as more than one thread is involved.`,
    exercise: {
      prompt: `Using only methods of the <code>Collections</code> class, sort the list and print it, reverse it and print it, then print the largest value and how many times <code>1</code> appears.

Expected output: <code>[1, 1, 3, 4]</code>, <code>[4, 3, 1, 1]</code>, <code>4</code>, <code>2</code> (one per line)`,
      starterCode: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CollectionsPractice {
    public static void main(String[] args) {
        List<Integer> scores = new ArrayList<>(List.of(4, 1, 3, 1));

        // TODO: sort the list and print it
        // TODO: reverse the list and print it
        // TODO: print the largest value
        // TODO: print how many times 1 appears
    }
}`,
      hints: [
        '<code>Collections.sort</code> and <code>Collections.reverse</code> change the list you pass in and return nothing.',
        '<code>Collections.max(list)</code> and <code>Collections.frequency(list, value)</code> return a result.',
      ],
      solution: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CollectionsPractice {
    public static void main(String[] args) {
        List<Integer> scores = new ArrayList<>(List.of(4, 1, 3, 1));

        Collections.sort(scores);
        System.out.println(scores); // [1, 1, 3, 4]

        Collections.reverse(scores);
        System.out.println(scores); // [4, 3, 1, 1]

        System.out.println(Collections.max(scores));          // 4
        System.out.println(Collections.frequency(scores, 1)); // 2
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>Collections.sort(list)</code> return?',
        options: ['A new sorted list', 'Nothing; it sorts the given list in place', 'The number of elements moved', 'A sorted array'],
        answer: 1,
        explanation: 'The method is void and reorders the list it is given.',
      },
      {
        question: 'What happens when you call <code>add</code> on a list returned by <code>Collections.unmodifiableList(list)</code>?',
        options: ['The element is added', 'The call is ignored', 'It does not compile', 'UnsupportedOperationException is thrown'],
        answer: 3,
        explanation: 'The wrapper still has the List methods, but every method that would change the list throws.',
      },
      {
        question: 'Which collection has an iterator that never throws <code>ConcurrentModificationException</code>?',
        options: ['CopyOnWriteArrayList', 'HashMap', 'HashSet', 'ArrayList'],
        answer: 0,
        explanation: 'Its iterator reads a snapshot of the array taken when the iterator was created.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between fail-fast and fail-safe iterators?',
        answer: `A fail-fast iterator, as in <code>ArrayList</code> and <code>HashMap</code>, checks on each step whether the collection was structurally changed by anything other than the iterator itself, and throws <code>ConcurrentModificationException</code> if so. A fail-safe iterator, as in <code>CopyOnWriteArrayList</code> and <code>ConcurrentHashMap</code>, works on a snapshot or tolerates concurrent changes, so it never throws, but it may not show changes made after iteration began.`,
      },
      {
        question: 'How does a fail-fast iterator detect a modification?',
        answer: `The collection keeps a counter, <code>modCount</code>, that is increased by every structural change such as an add or remove. The iterator copies this counter when it is created and compares it on each call to <code>next()</code>. If the two differ, the collection was changed behind the iterator's back and it throws. The check is a best effort and is meant for finding bugs, not for making code thread-safe.`,
      },
      {
        question: 'What is the difference between Collections.unmodifiableList() and List.of()?',
        answer: `<code>Collections.unmodifiableList(list)</code> returns a read-only view of an existing list: it cannot be changed through the view, but changes made to the original list still show through it. <code>List.of(...)</code>, added in Java 9, creates a new list that is immutable; nothing can change it, and it does not accept <code>null</code> elements.`,
      },
    ],
  },

  'concurrent-collections-concurrenthashmap-and-copyonwritearraylist': {
    whyItMatters: `A web application handles many requests at once, and any map or list they share, such as a cache, a set of counters or a list of listeners, is used by several threads at the same time. A plain <code>HashMap</code> in that position loses updates and can corrupt itself. The concurrent collections are the standard replacement and are far faster than wrapping everything in <code>synchronized</code>.`,
    productionExample: {
      heading: 'Where this is used',
      body: `<code>ConcurrentHashMap</code> is the usual choice for an in-memory cache, for per-user or per-endpoint counters, and for registries that are looked up on every request. <code>CopyOnWriteArrayList</code> is used for lists that are read constantly and changed rarely, such as event listeners or configuration entries. Frameworks rely on both internally; Spring, for example, keeps its singleton beans in a <code>ConcurrentHashMap</code>.`,
    },
    exercise: {
      prompt: `Two threads each count 1,000 hits in a shared map. With a <code>HashMap</code> and separate <code>get</code> and <code>put</code> calls, some updates are lost. Change the program to use a <code>ConcurrentHashMap</code> and a single atomic update so the total is always the same.

Expected output: <code>2000</code>`,
      starterCode: `import java.util.HashMap;
import java.util.Map;

public class HitCounter {
    public static void main(String[] args) throws InterruptedException {
        // TODO: use a ConcurrentHashMap
        Map<String, Integer> counts = new HashMap<>();

        Runnable task = () -> {
            for (int i = 0; i < 1000; i++) {
                // TODO: replace these two steps with one atomic update
                Integer current = counts.get("hits");
                counts.put("hits", current == null ? 1 : current + 1);
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println(counts.get("hits"));
    }
}`,
      hints: [
        'Changing only the map type is not enough: <code>get</code> followed by <code>put</code> is still two steps, and another thread can run between them.',
        '<code>counts.merge("hits", 1, Integer::sum)</code> stores 1 if the key is absent and otherwise adds 1, as one atomic operation.',
      ],
      solution: `import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class HitCounter {
    public static void main(String[] args) throws InterruptedException {
        Map<String, Integer> counts = new ConcurrentHashMap<>();

        Runnable task = () -> {
            for (int i = 0; i < 1000; i++) {
                counts.merge("hits", 1, Integer::sum); // atomic in ConcurrentHashMap
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println(counts.get("hits")); // 2000
    }
}`,
    },
    quiz: [
      {
        question: 'Does <code>ConcurrentHashMap</code> allow a <code>null</code> key or <code>null</code> value?',
        options: ['Yes, both', 'No, neither', 'A null value only', 'A null key only'],
        answer: 1,
        explanation: 'With null values, get() returning null could not distinguish "no entry" from "entry with null", which matters when other threads are changing the map.',
      },
      {
        question: 'When is <code>CopyOnWriteArrayList</code> a poor choice?',
        options: ['When the list is read often and changed rarely', 'When it holds listeners', 'When the list is changed very often', 'When it is iterated by several threads'],
        answer: 2,
        explanation: 'Every write copies the whole array, so frequent writes are expensive.',
      },
      {
        question: 'On a <code>ConcurrentHashMap</code>, is <code>if (!map.containsKey(k)) map.put(k, v);</code> thread-safe?',
        options: ['Yes, every method is thread-safe', 'Only with two threads', 'Only for String keys', 'No; another thread can add the key between the two calls'],
        answer: 3,
        explanation: 'Each call is safe on its own, but the pair is not atomic. Use putIfAbsent, computeIfAbsent or merge.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How is ConcurrentHashMap different from Hashtable and Collections.synchronizedMap()?',
        answer: `<code>Hashtable</code> and a synchronized map use one lock for the whole map, so only one thread can read or write at a time. <code>ConcurrentHashMap</code> locks only the bucket being written and lets reads proceed without locking, so many threads can use different parts of the map at once. It also offers atomic compound methods such as <code>putIfAbsent</code>, <code>computeIfAbsent</code> and <code>merge</code>, and its iterators do not throw <code>ConcurrentModificationException</code>.`,
      },
      {
        question: 'How does CopyOnWriteArrayList work?',
        answer: `Every operation that changes the list makes a new copy of the internal array, applies the change to the copy, and then replaces the old array with it. Readers and iterators use whichever array existed when they started, with no locking, so they are never disturbed by a write. The cost is that each write is O(n), which is acceptable only when writes are rare.`,
      },
      {
        question: 'How would you make a get-then-update operation on a ConcurrentHashMap atomic?',
        answer: `Use one of the map's compound methods instead of separate calls. <code>merge(key, 1, Integer::sum)</code> or <code>compute(key, ...)</code> updates a value based on its current value, <code>putIfAbsent</code> inserts only when the key is missing, and <code>computeIfAbsent</code> creates the value on first use. Each of these runs as a single atomic operation for that key.`,
      },
    ],
  },

  'enummap-enumset-properties-class-and-how-hashset-works-internally': {
    whyItMatters: `Enums are everywhere in real code: order statuses, user roles, days of the week. When the keys of a map or the members of a set are enum constants, <code>EnumMap</code> and <code>EnumSet</code> are faster and smaller than the hash-based versions and keep a predictable order. <code>Properties</code> is still how many applications read their configuration files.`,
    exercise: {
      prompt: `Count how many tasks are in each status, using an <code>EnumMap</code>. Because an <code>EnumMap</code> iterates in the order the constants are declared, the printed result is always in the same order.

Expected output: <code>{TODO=2, DOING=1, DONE=3}</code>`,
      starterCode: `import java.util.EnumMap;
import java.util.Map;

enum Status { TODO, DOING, DONE }

public class TaskCounts {
    public static void main(String[] args) {
        Status[] tasks = {
            Status.DONE, Status.TODO, Status.DONE,
            Status.DOING, Status.TODO, Status.DONE
        };

        // TODO: create an EnumMap from Status to Integer
        // TODO: count each status in the array
        // TODO: print the map
    }
}`,
      hints: [
        'The constructor needs the enum class: <code>new EnumMap&lt;&gt;(Status.class)</code>.',
        '<code>counts.merge(status, 1, Integer::sum)</code> stores 1 the first time and adds 1 after that.',
      ],
      solution: `import java.util.EnumMap;
import java.util.Map;

enum Status { TODO, DOING, DONE }

public class TaskCounts {
    public static void main(String[] args) {
        Status[] tasks = {
            Status.DONE, Status.TODO, Status.DONE,
            Status.DOING, Status.TODO, Status.DONE
        };

        Map<Status, Integer> counts = new EnumMap<>(Status.class);
        for (Status status : tasks) {
            counts.merge(status, 1, Integer::sum);
        }

        System.out.println(counts); // {TODO=2, DOING=1, DONE=3}
    }
}`,
    },
    quiz: [
      {
        question: 'In what order does an <code>EnumMap</code> iterate over its keys?',
        options: ['The order the enum constants are declared', 'Alphabetical order', 'Insertion order', 'No guaranteed order'],
        answer: 0,
        explanation: 'It is backed by an array indexed by each constant\'s ordinal.',
      },
      {
        question: 'How do you create an <code>EnumSet</code>?',
        options: ['new EnumSet<>()', 'With a static factory such as EnumSet.of(...) or EnumSet.noneOf(...)', 'new HashSet<>(Enum.class)', 'Enum.toSet()'],
        answer: 1,
        explanation: 'EnumSet is abstract and has no public constructor.',
      },
      {
        question: 'What does a <code>HashSet</code> use internally to store its elements?',
        options: ['An array list', 'A linked list', 'A HashMap, with each element stored as a key', 'A binary tree'],
        answer: 2,
        explanation: 'Each element is a key in an internal HashMap, mapped to one shared dummy object.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why use EnumMap instead of HashMap when the keys are enum constants?',
        answer: `An <code>EnumMap</code> stores its values in an array indexed by each constant's ordinal, so it needs no hashing and has no collisions. It is faster, uses less memory, and iterates in the order the constants are declared. A <code>HashMap</code> gives no ordering guarantee and has more overhead per entry.`,
      },
      {
        question: 'How does HashSet work internally?',
        answer: `A <code>HashSet</code> holds a <code>HashMap</code>. Adding an element calls <code>map.put(element, PRESENT)</code>, where <code>PRESENT</code> is a single shared dummy object. Because a map cannot hold a key twice, the set cannot hold an element twice, and <code>add</code> returns <code>false</code> when <code>put</code> finds the key already present. Uniqueness therefore depends on the element's <code>hashCode()</code> and <code>equals()</code>.`,
      },
      {
        question: 'What is the Properties class used for?',
        answer: `It holds configuration as string keys and string values, and can load them from and store them to a <code>.properties</code> file with <code>load()</code> and <code>store()</code>. Values are read with <code>getProperty(key)</code>, which can take a default to return when the key is missing. It extends <code>Hashtable</code>, so it is synchronized.`,
      },
    ],
  },
}
