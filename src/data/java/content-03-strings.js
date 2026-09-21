// Java Strings module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content03Strings = {
  'java-string': {
    title: 'Java String',
    intro: `A String in Java represents a sequence of characters, and it is one of the most frequently used types in any Java program. Unlike primitive types, String is a class defined in the java.lang package, so every String you create is actually an object with methods you can call on it.

The single most important fact about Java Strings is that they are immutable — once a String object is created, its character content can never be changed. Any operation that appears to "modify" a String, such as concatenation or replacing characters, actually creates and returns a brand-new String object, leaving the original untouched. This design choice is deliberate, and it shapes how Strings behave in memory, in collections, and across threads.`,
    sections: [
      {
        heading: 'Creating Strings: Literal vs. new String()',
        body: `There are two distinct ways to create a String, and they behave differently in memory. A string literal, written as <code>String s = "hello";</code>, is placed in a special memory region called the String Constant Pool (part of the heap since Java 7). A String created with <code>new String("hello")</code> always allocates a fresh object on the heap, outside the pool, even if an identical literal already exists there.`,
        list: [
          '<code>String s1 = "hello";</code> — reuses a pooled object if "hello" already exists in the pool.',
          '<code>String s2 = new String("hello");</code> — always creates a new object on the heap, separate from the pool.',
          'Calling <code>s2.intern()</code> returns the pooled reference, effectively opting the object into the pool.',
        ],
      },
      {
        heading: 'Why Strings Are Immutable',
        body: `Java's designers made String immutable for several concrete reasons, not just as an arbitrary restriction. Because Strings are used everywhere — as class names in class loading, as keys in HashMap, as file paths, and as network resource identifiers — allowing them to change after creation would open the door to serious bugs and security holes.`,
        list: [
          '<strong>String pool sharing</strong> — multiple references can safely share the same object because no one can modify it out from under another reference.',
          '<strong>Security</strong> — sensitive values like file paths, usernames, and class names cannot be altered after being validated and passed to a security-sensitive method.',
          '<strong>Thread safety</strong> — an immutable object can be freely shared between threads without synchronization, since no thread can ever see it in a half-changed state.',
          '<strong>Hashcode caching</strong> — since the content never changes, String caches its hashCode() the first time it is computed, making repeated use as a HashMap key fast.',
        ],
      },
      {
        heading: 'Strings and the char[] Underneath',
        body: `Internally, a String stores its characters (historically in a char[], and since Java 9 often in a more compact byte[] with an encoding flag, via the "Compact Strings" feature). This internal array is private and final, and String never exposes a mutable reference to it, which is exactly what preserves immutability from the outside.`,
      },
    ],
    examples: [
      {
        caption: 'Immutability in action — concatenation creates a new object',
        code: `public class StringImmutabilityDemo {
    public static void main(String[] args) {
        String original = "Java";
        String changed = original.concat(" Rocks");

        System.out.println("original: " + original);
        System.out.println("changed: " + changed);
        System.out.println("same object? " + (original == changed));
    }
}`,
        output: `original: Java
changed: Java Rocks
same object? false`,
      },
    ],
    commonMistakes: [
      'Believing that methods like concat() or replace() modify the original String in place — they always return a new String that must be captured in a variable.',
      'Using new String("text") unnecessarily, which creates a wasteful duplicate object instead of reusing the pooled literal.',
      'Assuming String is a primitive type because it can be created without "new" — String is always a reference type (an object).',
    ],
    keyPoints: [
      'Strings are immutable: once created, their character content never changes.',
      'String literals live in the String Constant Pool; new String() always creates a separate heap object.',
      'Immutability enables safe pool sharing, thread safety, security, and cached hashcodes.',
    ],
  },

  'java-string-methods': {
    title: 'Java String Methods',
    intro: `The String class provides a large set of methods for inspecting, comparing, transforming, and splitting text. Because Strings are immutable, every method that seems to change a String actually returns a new String object with the result, leaving the original unchanged.`,
    sections: [
      {
        heading: 'Inspecting and Accessing Characters',
        body: `These methods let you read information about a String without altering it.`,
        list: [
          '<code>length()</code> — returns the number of characters (not a field, so it is called with parentheses, unlike arrays).',
          '<code>charAt(int index)</code> — returns the character at a given zero-based index; throws StringIndexOutOfBoundsException if the index is invalid.',
          '<code>indexOf(String str)</code> / <code>lastIndexOf(String str)</code> — return the position of the first or last occurrence of a substring, or -1 if not found.',
          '<code>substring(int begin)</code> and <code>substring(int begin, int end)</code> — extract part of the String; "end" is exclusive.',
        ],
      },
      {
        heading: 'Comparing Strings',
        body: `Java gives you several comparison methods, and choosing the wrong one is a very common source of bugs. <code>equals()</code> compares character content exactly (case-sensitive). <code>equalsIgnoreCase()</code> compares content while ignoring case differences. <code>compareTo()</code> compares Strings lexicographically and returns a negative, zero, or positive int, which is useful for sorting. Crucially, <code>==</code> compares object references, not content, so it should never be used to check whether two Strings "say the same thing."`,
      },
      {
        heading: 'Transforming and Splitting',
        body: `These methods return new Strings (or arrays of Strings) derived from the original.`,
        list: [
          '<code>toUpperCase()</code> / <code>toLowerCase()</code> — return a new String with case changed.',
          '<code>trim()</code> removes leading/trailing ASCII whitespace; <code>strip()</code> (Java 11+) is Unicode-aware and preferred in modern code.',
          '<code>replace(char/CharSequence old, char/CharSequence new)</code> — replaces all occurrences of one character or sequence with another.',
          '<code>split(String regex)</code> — splits the String into a String[] using a regular expression delimiter.',
          '<code>String.format(String pattern, Object... args)</code> — builds a formatted String using placeholders like %s, %d, and %.2f.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Common String methods used together',
        code: `public class StringMethodsDemo {
    public static void main(String[] args) {
        String text = "  Java Programming  ";

        System.out.println(text.trim());
        System.out.println(text.trim().length());
        System.out.println(text.trim().toUpperCase());
        System.out.println(text.trim().indexOf("Programming"));
        System.out.println(text.trim().substring(0, 4));
        System.out.println("Java".equals("java"));
        System.out.println("Java".equalsIgnoreCase("java"));

        String[] words = text.trim().split(" ");
        System.out.println(words.length);

        String formatted = String.format("Score: %d/%d (%.1f%%)", 45, 50, 90.0);
        System.out.println(formatted);
    }
}`,
        output: `Java Programming
16
JAVA PROGRAMMING
5
Java
false
true
2
Score: 45/50 (90.0%)`,
      },
    ],
    commonMistakes: [
      'Using == instead of .equals() to compare String content, which compares references and often gives a misleading result.',
      'Forgetting that substring(begin, end) excludes the character at "end", leading to off-by-one errors.',
      'Calling a String method and discarding its return value, expecting the original variable to be modified (e.g. writing "text.trim();" alone instead of "text = text.trim();").',
      'Using trim() when the input contains non-ASCII whitespace (like a non-breaking space) and being surprised it is not removed — strip() handles that correctly.',
    ],
    keyPoints: [
      'All String methods return new values; none modify the String in place.',
      'Use .equals()/.equalsIgnoreCase() for content comparison, and compareTo() for ordering — never == for content.',
      'substring(begin, end) treats "end" as exclusive; split() uses a regular expression.',
    ],
  },

  'java-stringbuffer': {
    title: 'Java StringBuffer',
    intro: `StringBuffer is a mutable sequence of characters, created specifically to solve a performance problem: repeatedly concatenating immutable Strings (with +) creates a new object every time, which wastes memory and CPU cycles in a loop. StringBuffer instead maintains an internal, resizable character array that can be modified directly, without creating a new object for every change.

StringBuffer has existed in Java since version 1.0, and its defining characteristic is that all of its public methods are synchronized. This makes a single StringBuffer instance safe to share and mutate from multiple threads at once, at the cost of the extra overhead that synchronization always introduces.`,
    sections: [
      {
        heading: 'Core Mutating Methods',
        body: `StringBuffer's API is built around modifying its internal buffer directly rather than returning new objects.`,
        list: [
          '<code>append(...)</code> — adds text to the end of the buffer; overloaded for String, char, int, boolean, and more.',
          '<code>insert(int offset, ...)</code> — inserts text at a specific position.',
          '<code>reverse()</code> — reverses the character sequence in place.',
          '<code>delete(int start, int end)</code> and <code>deleteCharAt(int index)</code> — remove characters from the buffer.',
          '<code>replace(int start, int end, String str)</code> — replaces a range of characters with new text.',
        ],
      },
      {
        heading: 'Thread Safety and Its Cost',
        body: `Every mutating method on StringBuffer is marked <code>synchronized</code>, meaning only one thread can execute a method on a given StringBuffer instance at a time. This guarantees correct behavior when several threads append to the same buffer concurrently, but the locking overhead makes StringBuffer measurably slower than its non-synchronized counterpart, StringBuilder, in single-threaded code — which is the overwhelming majority of real-world use cases.`,
      },
      {
        heading: 'Converting Back to String',
        body: `Once you finish building or modifying text with a StringBuffer, call <code>toString()</code> to obtain an immutable String snapshot of the current content. The StringBuffer itself can continue to be reused and modified afterward, independently of any String already produced from it.`,
      },
    ],
    examples: [
      {
        caption: 'Building and modifying text with StringBuffer',
        code: `public class StringBufferDemo {
    public static void main(String[] args) {
        StringBuffer sb = new StringBuffer("Java");
        sb.append(" is").append(" powerful");
        System.out.println(sb);

        sb.insert(4, " language");
        System.out.println(sb);

        sb.replace(0, 4, "Kotlin");
        System.out.println(sb);

        sb.reverse();
        System.out.println(sb);
    }
}`,
        output: `Java is powerful
Java language is powerful
Kotlin language is powerful
lufrewop si egaugnal niltoK`,
      },
    ],
    commonMistakes: [
      'Using StringBuffer by default for single-threaded string building, paying for synchronization overhead that provides no benefit there.',
      'Forgetting that append() and insert() return "this" (the same StringBuffer), which allows chaining, but mistakenly assigning the result to a String variable directly instead of calling toString().',
      'Assuming StringBuffer is immutable like String, and being surprised that methods change the object in place rather than returning a new one.',
    ],
    keyPoints: [
      'StringBuffer is mutable — its methods modify the internal character buffer directly.',
      'All public methods are synchronized, making it thread-safe but slower than StringBuilder.',
      'Use toString() to get an immutable String snapshot of the buffer\'s current content.',
    ],
  },

  'java-stringbuilder': {
    title: 'Java StringBuilder',
    intro: `StringBuilder, introduced in Java 5, offers the exact same mutable, buffer-based API as StringBuffer — append, insert, delete, reverse, replace — but without any synchronization. Because most Java code that builds strings runs on a single thread (inside one method, one loop, or one request handler), the synchronization that StringBuffer performs is usually unnecessary overhead, and StringBuilder was added specifically to avoid paying for it.

As a result, StringBuilder is the recommended default choice for mutable string construction in modern Java code, and it is exactly what the compiler uses internally to optimize simple String concatenation with "+" inside a single expression.`,
    sections: [
      {
        heading: 'Same API, No Synchronization',
        body: `StringBuilder and StringBuffer implement the same CharSequence-based operations and share method signatures almost identically, so switching between them (when thread-safety requirements change) is usually just a matter of changing the type name. The difference is entirely about the synchronized keyword being present on StringBuffer's methods and absent on StringBuilder's.`,
        list: [
          '<code>append(...)</code> — adds content to the end; returns the same StringBuilder for chaining.',
          '<code>insert(int offset, ...)</code> — inserts content at a given index.',
          '<code>delete(int start, int end)</code>, <code>deleteCharAt(int index)</code> — remove content.',
          '<code>reverse()</code> — reverses the sequence in place.',
          '<code>capacity()</code> — reports the current size of the internal buffer, which grows automatically as needed.',
        ],
      },
      {
        heading: 'Why the Compiler Prefers It',
        body: `When you write code like <code>String result = "Total: " + count + " items";</code>, the compiler typically rewrites this internally using a StringBuilder (or similar mechanism) rather than performing several separate String concatenations. This is why simple, single-line concatenation is not actually as wasteful as it might first appear — but building a String across many iterations of a loop with "+" is still inefficient, because a new StringBuilder (or new String) is effectively created on every loop iteration unless you manage one StringBuilder explicitly yourself.`,
      },
      {
        heading: 'When to Still Use StringBuffer Instead',
        body: `StringBuilder should not be shared across multiple threads without external synchronization, because concurrent modifications can corrupt its internal state or produce inconsistent results. If multiple threads genuinely need to mutate the same buffer concurrently, StringBuffer (or a higher-level concurrency-safe design) remains the correct choice.`,
      },
    ],
    examples: [
      {
        caption: 'Efficiently building a String inside a loop with StringBuilder',
        code: `public class StringBuilderDemo {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            sb.append(i);
            if (i < 5) {
                sb.append(", ");
            }
        }
        System.out.println("Numbers: " + sb.toString());
        System.out.println("Length: " + sb.length());

        sb.insert(0, "[").append("]");
        System.out.println(sb);
    }
}`,
        output: `Numbers: 1, 2, 3, 4, 5
Length: 15
[1, 2, 3, 4, 5]`,
      },
    ],
    commonMistakes: [
      'Concatenating Strings with "+" inside a large loop instead of using a single StringBuilder — this creates many intermediate objects and hurts performance noticeably as the loop grows.',
      'Sharing one StringBuilder across multiple threads without external synchronization, leading to corrupted or unpredictable output.',
      'Forgetting to call toString() when a method or API expects a String rather than a StringBuilder object.',
    ],
    keyPoints: [
      'StringBuilder has the same mutable API as StringBuffer but is not synchronized, so it is faster in single-threaded code.',
      'It is the default, recommended choice for building strings dynamically in modern Java.',
      'It is not thread-safe — use StringBuffer or external synchronization for concurrent mutation.',
    ],
  },

  'string-vs-stringbuffer-vs-stringbuilder': {
    title: 'String vs StringBuffer vs StringBuilder',
    intro: `String, StringBuffer, and StringBuilder all represent sequences of characters, but they differ fundamentally in mutability and thread-safety, and choosing the right one for a given situation is a common Java design decision — and a frequent interview question.`,
    sections: [
      {
        heading: 'Mutability: The Core Difference',
        body: `String is immutable: every "modification" produces a brand-new object, leaving the original unchanged. StringBuffer and StringBuilder are both mutable: they maintain an internal, resizable character buffer that is changed directly by methods like append() and insert(), without creating a new object each time. This is why building a large piece of text with String concatenation in a loop is inefficient compared to using StringBuffer or StringBuilder — the loop would otherwise create one throwaway String object per iteration.`,
      },
      {
        heading: 'Thread Safety and Performance',
        body: `StringBuffer's methods are synchronized, making a single instance safe to mutate from multiple threads, but that safety costs performance due to lock acquisition on every call. StringBuilder offers the identical API without synchronization, making it faster in single-threaded contexts — which describes the vast majority of string-building code — but unsafe to share across threads without external coordination.`,
        list: [
          '<strong>String</strong>: immutable, inherently thread-safe (nothing can change), best for fixed or rarely-changing text and as map/set keys.',
          '<strong>StringBuffer</strong>: mutable, synchronized (thread-safe), best when multiple threads must modify the same buffer.',
          '<strong>StringBuilder</strong>: mutable, not synchronized, best for single-threaded string building — the usual default.',
        ],
      },
      {
        heading: 'Choosing the Right One',
        body: `As a practical rule: use String for values that do not change or change rarely, use StringBuilder when you need to build or transform text repeatedly within one thread (loops, parsing, formatting), and reach for StringBuffer only in the specific case where the same mutable buffer genuinely must be shared and modified by multiple threads concurrently.`,
      },
    ],
    examples: [
      {
        caption: 'Same task, three types, and a rough performance intuition',
        code: `public class StringComparisonDemo {
    public static void main(String[] args) {
        // String: each += creates a new object (fine for a handful of operations)
        String s = "";
        for (int i = 0; i < 3; i++) {
            s += i;
        }
        System.out.println("String result: " + s);

        // StringBuilder: one buffer, modified in place, no synchronization
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            sb.append(i);
        }
        System.out.println("StringBuilder result: " + sb);

        // StringBuffer: one buffer, modified in place, synchronized (thread-safe)
        StringBuffer sbf = new StringBuffer();
        for (int i = 0; i < 3; i++) {
            sbf.append(i);
        }
        System.out.println("StringBuffer result: " + sbf);
    }
}`,
        output: `String result: 012
StringBuilder result: 012
StringBuffer result: 012`,
      },
    ],
    commonMistakes: [
      'Defaulting to StringBuffer everywhere "to be safe," paying for synchronization in single-threaded code that never needed it.',
      'Using String concatenation with "+" inside large loops, which silently creates many intermediate objects and degrades performance as data grows.',
      'Assuming StringBuilder is thread-safe because it looks and behaves just like StringBuffer — it explicitly is not.',
    ],
    keyPoints: [
      'String is immutable; StringBuffer and StringBuilder are mutable character buffers.',
      'StringBuffer is synchronized (thread-safe but slower); StringBuilder is not synchronized (faster, single-threaded use).',
      'Prefer StringBuilder by default for building text; use StringBuffer only for genuine multi-threaded mutation; use String for fixed or rarely-changed values.',
    ],
  },

  'string-comparison-and-the-string-pool': {
    title: 'String Comparison and the String Pool',
    intro: `Comparing Strings correctly in Java requires understanding two related concepts: the String Constant Pool, a special area of memory where certain String objects are shared and reused, and the difference between comparing references (==) and comparing content (.equals()). Getting this wrong is one of the most common sources of subtle bugs for Java beginners.`,
    sections: [
      {
        heading: 'How the String Pool Works',
        body: `When the compiler encounters a String literal, it checks the String Constant Pool first. If an identical String already exists there, the new reference simply points to that existing object instead of allocating a new one. If it does not exist yet, the literal is added to the pool. This pooling only happens automatically for literals — Strings created with <code>new String(...)</code> always bypass the pool and get a distinct object on the heap, even if the same text is already pooled.`,
      },
      {
        heading: '== vs .equals()',
        body: `<code>==</code> on Strings (a reference type) compares whether two variables point to the exact same object in memory, not whether their characters match. <code>.equals()</code>, which String overrides from Object, compares the actual character sequence. Because pooled literals with identical content share one object, <code>==</code> can appear to "work" for literals, which misleads many beginners into using it habitually — until a <code>new String(...)</code> or a runtime-built String breaks the assumption.`,
        list: [
          'Two identical literals (<code>"cat" == "cat"</code>) are <code>true</code> because both point to the same pooled object.',
          'A literal compared to a <code>new String(...)</code> with the same text is <code>false</code>, because "new" forces a separate heap object.',
          'Content should always be compared with <code>.equals()</code> (or <code>.equalsIgnoreCase()</code> for case-insensitive checks), never <code>==</code>.',
        ],
      },
      {
        heading: 'Interning Strings Explicitly',
        body: `The <code>intern()</code> method lets you manually add a heap-allocated String's content to the pool (or retrieve the existing pooled reference if that content is already there). Calling <code>new String("cat").intern()</code> returns the same reference as the literal <code>"cat"</code>, so comparing them with <code>==</code> afterward would be true. Interning is occasionally useful for memory optimization when an application handles huge numbers of duplicate runtime Strings, but it should not be treated as a substitute for using .equals() in ordinary comparisons.`,
      },
    ],
    examples: [
      {
        caption: 'Literals, new String(), and intern() compared with == and .equals()',
        code: `public class StringPoolDemo {
    public static void main(String[] args) {
        String a = "cat";
        String b = "cat";
        String c = new String("cat");
        String d = c.intern();

        System.out.println("a == b: " + (a == b));           // same pooled object
        System.out.println("a == c: " + (a == c));           // c is a separate heap object
        System.out.println("a.equals(c): " + a.equals(c));   // same content
        System.out.println("a == d: " + (a == d));           // d is interned, points to pool
    }
}`,
        output: `a == b: true
a == c: false
a.equals(c): true
a == d: true`,
      },
    ],
    commonMistakes: [
      'Using == to compare String content, which works by accident for pooled literals but breaks silently for Strings built with new or produced at runtime (e.g. via concatenation of variables).',
      'Assuming every String literal comparison with == is guaranteed true in all cases without understanding it depends on pooling behavior, not the language spec treating "==" as content comparison.',
      'Thinking intern() changes a String\'s content — it only affects which pooled reference is returned, never the characters themselves.',
      'Forgetting that Strings built at runtime through concatenation of non-constant variables are generally not automatically pooled, unlike compile-time constant literals.',
    ],
    keyPoints: [
      'The String pool stores and reuses literal Strings with identical content to save memory.',
      '== compares object references; .equals() compares actual character content — always use .equals() for content checks.',
      'new String(...) always creates a separate object outside the pool, even for text that already exists there.',
      'intern() manually places a String\'s content into the pool and returns the shared pooled reference.',
    ],
  },
}
