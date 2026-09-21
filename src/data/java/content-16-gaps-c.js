// Java learning module — gap-filling content batch C.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content16GapsC = {
  'c-vs-java-key-differences': {
    title: 'C++ vs Java: Key Differences',
    intro: `C++ and Java share a lot of surface-level syntax — both use curly braces, semicolons, and a similar class syntax — because Java's designers deliberately modeled Java's syntax on C++ to make the language familiar to existing programmers. But underneath that familiar syntax, the two languages make very different design decisions about memory, inheritance, and portability.

Understanding these differences matters because they explain why Java code tends to be more predictable and portable, while C++ code tends to be faster and closer to the hardware, at the cost of more manual responsibility for the programmer.`,
    sections: [
      {
        heading: 'Memory Management',
        body: `C++ gives the programmer direct control over memory: you allocate objects with <code>new</code> and must explicitly release them with <code>delete</code>, or use smart pointers to automate that release. Forgetting to free memory causes leaks; freeing it twice or using it after freeing causes undefined behavior. Java removes this responsibility entirely — objects are allocated with <code>new</code>, but a background garbage collector automatically reclaims memory once no references to an object remain. This trades some runtime overhead and less precise control for a huge reduction in an entire category of bugs (memory leaks, dangling pointers, double frees).`,
      },
      {
        heading: 'Multiple Inheritance and Pointers',
        body: `C++ allows a class to inherit directly from multiple parent classes, which is powerful but can lead to ambiguity problems like the "diamond problem," where the same base class is inherited through two different paths. Java disallows multiple inheritance of classes entirely — a class can extend only one superclass — but achieves a safer form of the same flexibility through interfaces, since a class can implement any number of interfaces. C++ also supports pointers with full pointer arithmetic (you can add to a pointer, compare pointer addresses, and directly manipulate memory addresses). Java has references, not pointers: a reference variable refers to an object, but you cannot perform arithmetic on it, dereference an arbitrary memory address, or accidentally point it at unallocated memory.`,
      },
      {
        heading: 'Platform Independence and Operator Overloading',
        body: `C++ source code is compiled directly into native machine code for a specific operating system and processor architecture, so a Windows executable will not run on Linux without recompilation. Java source code compiles into an intermediate bytecode format that runs on the Java Virtual Machine, and because a JVM exists for every major platform, the same compiled .class file runs unmodified anywhere a compatible JVM is installed. C++ also allows operator overloading, letting a class redefine what <code>+</code>, <code>==</code>, or <code>[]</code> mean for its own objects. Java deliberately omits operator overloading (aside from Java's built-in overload of <code>+</code> for String concatenation) to keep operator behavior predictable and to avoid the readability problems that come from operators doing unexpected things.`,
        list: [
          '<strong>Memory management</strong> — C++: manual (new/delete, smart pointers). Java: automatic garbage collection.',
          '<strong>Multiple inheritance</strong> — C++: allowed for classes. Java: only through interfaces.',
          '<strong>Platform independence</strong> — C++: compiles to native machine code per platform. Java: compiles to bytecode run by the JVM anywhere.',
          '<strong>Pointers</strong> — C++: explicit pointers with arithmetic. Java: references only, no arithmetic.',
          '<strong>Operator overloading</strong> — C++: supported for custom types. Java: not supported (except built-in String +).',
        ],
      },
    ],
    examples: [
      {
        caption: 'Java achieving multiple inheritance safely through interfaces',
        code: `interface Flyable {
    void fly();
}

interface Swimmable {
    void swim();
}

class Duck implements Flyable, Swimmable {
    public void fly() {
        System.out.println("Duck flies");
    }
    public void swim() {
        System.out.println("Duck swims");
    }
}

public class MultipleInheritanceDemo {
    public static void main(String[] args) {
        Duck d = new Duck();
        d.fly();
        d.swim();
    }
}`,
        output: `Duck flies
Duck swims`,
      },
    ],
    commonMistakes: [
      'Assuming Java is simply "C++ without pointers" — Java also removes multiple class inheritance, operator overloading, and manual memory management, which are much bigger design differences.',
      'Thinking Java references behave exactly like C++ pointers — references cannot be incremented, compared as raw addresses, or point at arbitrary memory.',
      'Believing garbage collection means Java programs never have memory problems — objects can still be leaked logically by holding unnecessary references (e.g. in a static collection) that prevent garbage collection.',
      'Forgetting that Java bytecode still needs a compatible JVM installed on the target machine — platform independence is not the same as "no installation required."',
    ],
    keyPoints: [
      'C++ uses manual memory management; Java uses automatic garbage collection.',
      'C++ allows multiple inheritance of classes; Java only allows it through interfaces.',
      'C++ compiles to native machine code per platform; Java compiles to portable bytecode run by the JVM.',
      'C++ supports pointer arithmetic and operator overloading; Java supports neither.',
    ],
  },

  'identifiers-in-java': {
    title: 'Identifiers in Java',
    intro: `An identifier is the name you give to a variable, method, class, interface, or package in Java. Choosing identifiers correctly involves two separate things: the hard rules the compiler enforces, and the naming conventions the Java community follows as best practice — breaking a rule causes a compile error, but breaking a convention just makes code harder to read.`,
    sections: [
      {
        heading: 'Compiler Rules for Valid Identifiers',
        body: `These rules are enforced by the compiler; violating any of them prevents the code from compiling at all.`,
        list: [
          'An identifier can contain letters, digits, underscores (<code>_</code>), and dollar signs (<code>$</code>) — no other characters (spaces, hyphens, @ symbols, etc.) are allowed.',
          'It cannot start with a digit, though it can contain digits after the first character (e.g. <code>score2</code> is valid, <code>2ndScore</code> is not).',
          'It cannot be a reserved keyword (such as <code>class</code>, <code>int</code>, or <code>static</code>) or a reserved literal (<code>true</code>, <code>false</code>, <code>null</code>).',
          'Java identifiers are case-sensitive, so <code>total</code>, <code>Total</code>, and <code>TOTAL</code> are three completely different identifiers.',
        ],
      },
      {
        heading: 'Naming Conventions (Best Practice, Not Enforced)',
        body: `Conventions are not checked by the compiler, but ignoring them makes code confusing to other Java developers and to tools like IDEs that assume standard style. Classes and interfaces use UpperCamelCase (<code>StudentRecord</code>), while variables and methods use lowerCamelCase (<code>studentName</code>, <code>calculateTotal()</code>). Constants (fields declared <code>static final</code>) are written in all uppercase with underscores separating words (<code>MAX_DISCOUNT</code>). Package names are written entirely in lowercase (<code>com.webnest.utils</code>). The underscore and dollar sign are technically legal in any identifier, but by convention they are avoided in ordinary variable names — the dollar sign is mostly reserved for tool-generated or compiler-generated code.`,
      },
    ],
    examples: [
      {
        caption: 'Valid identifiers, including edge cases with underscore and dollar sign',
        code: `public class IdentifierDemo {
    public static void main(String[] args) {
        int _count = 10;
        double $price = 19.99;
        String studentName = "Asha";
        int number2 = 5;

        System.out.println(_count);
        System.out.println($price);
        System.out.println(studentName);
        System.out.println(number2);
    }
}`,
        output: `10
19.99
Asha
5`,
      },
    ],
    commonMistakes: [
      'Trying to start an identifier with a digit, such as "2ndPlace" — this fails to compile.',
      'Using a reserved keyword like "class" or "int" as a variable name.',
      'Assuming identifiers are case-insensitive and being surprised that "Score" and "score" refer to two different variables.',
      'Mixing naming conventions inconsistently (e.g. naming a class "studentRecord" instead of "StudentRecord"), which compiles fine but confuses readers.',
    ],
    keyPoints: [
      'Identifiers may contain letters, digits, underscores, and dollar signs, but cannot start with a digit.',
      'Identifiers cannot be reserved keywords or reserved literals (true, false, null).',
      'Java identifiers are case-sensitive.',
      'Naming conventions (UpperCamelCase for classes, lowerCamelCase for variables/methods, UPPER_CASE for constants) are best practice, not compiler rules.',
    ],
  },

  'unicode-system-in-java': {
    title: 'Unicode System in Java',
    intro: `Older languages designed in the 1970s, such as C, generally used ASCII to represent characters — a 7-bit encoding covering only 128 characters, which is enough for basic English text but nothing else. Java was designed later, in the era of international software, so its designers chose Unicode as the character encoding from the very beginning.

Because of this, Java's <code>char</code> type is defined as a 16-bit unsigned value, not the 8-bit (or smaller) representation used in many older languages, and it represents a single Unicode code unit rather than a single ASCII byte.`,
    sections: [
      {
        heading: 'Why 16-bit Unicode Matters',
        body: `A 16-bit char can represent 65,536 distinct values, which is enough to cover the Basic Multilingual Plane of Unicode — including Latin letters, Greek, Cyrillic, Arabic, Devanagari, Chinese, Japanese, Korean characters, and many symbols. This lets a single Java <code>String</code> hold mixed-language text (for example, an English label right next to Japanese or Hindi text) without any special encoding tricks, which was a real limitation in older 8-bit character systems.`,
      },
      {
        heading: 'Unicode Escape Sequences',
        body: `Any character can be written using its Unicode code point with the escape sequence <code>\\uXXXX</code>, where XXXX is a four-digit hexadecimal value. For example, <code>'\\u0041'</code> represents the character 'A', and <code>'\\u20B9'</code> represents the Indian Rupee sign (₹). These escapes work directly inside char and String literals, and even, unusually, outside of literals in raw source code, since the compiler processes Unicode escapes before parsing any other syntax.`,
      },
      {
        heading: 'A Note on Supplementary Characters',
        body: `Some rarer Unicode characters — mostly historic scripts and certain emoji — lie outside the Basic Multilingual Plane and require more than 16 bits to represent. Java handles these "supplementary characters" using a pair of two chars called a surrogate pair, which is why methods like <code>codePointAt()</code> exist alongside the older <code>charAt()</code> for correctly reading such characters.`,
      },
    ],
    examples: [
      {
        caption: 'Printing characters using Unicode escape sequences',
        code: `public class UnicodeDemo {
    public static void main(String[] args) {
        char letter = '\\u0041';       // Unicode for 'A'
        char rupee = '\\u20B9';        // Indian Rupee sign
        char devanagariKa = '\\u0915'; // Devanagari letter for 'ka'

        System.out.println(letter);
        System.out.println(rupee);
        System.out.println(devanagariKa);
        System.out.println((int) letter);
    }
}`,
        output: `A
₹
क
65`,
      },
    ],
    commonMistakes: [
      'Assuming Java char is 8-bit like a C char — Java char is always 16-bit and Unicode-based.',
      'Forgetting that a small number of Unicode characters (supplementary characters) need two chars (a surrogate pair) to represent, which can break naive character-by-character processing.',
      'Writing an invalid four-digit hex value after \\u and being confused by the resulting compile error.',
      'Assuming Unicode support means all fonts or terminals can display every character — the encoding is correct even if the display environment cannot render a particular glyph.',
    ],
    keyPoints: [
      'Java char is a 16-bit value based on Unicode, not the 7-bit ASCII used by many older languages.',
      '16 bits covers the Basic Multilingual Plane, enabling most world scripts in a single String.',
      'Unicode escape sequences use the form \\uXXXX with four hexadecimal digits.',
      'Rare supplementary characters need a surrogate pair of two chars, handled via codePointAt() rather than charAt().',
    ],
  },

  'why-strings-are-immutable-in-java': {
    title: 'Why Strings Are Immutable in Java',
    intro: `In Java, once a String object is created, its contents can never change. Methods that appear to modify a String, such as <code>concat()</code> or <code>replace()</code>, actually return a brand-new String object and leave the original untouched. This is not an accident or a limitation — it is a deliberate design decision with several concrete benefits.`,
    sections: [
      {
        heading: 'Security',
        body: `Many sensitive operations take a String as a parameter: opening a file path, connecting to a network host, loading a class by name, or checking a username. If String were mutable, code could validate a String (for example, checking that a file path is safe) and then have another part of the program — or malicious code — change the contents of that same String object afterward, bypassing the validation entirely. Immutability guarantees that once a String has been checked, it cannot be altered underneath the code that checked it.`,
      },
      {
        heading: 'The String Pool and Thread-Safety',
        body: `Java maintains a special memory area called the String pool (part of the heap) where String literals are cached and reused. When you write <code>String a = "hello";</code> and <code>String b = "hello";</code>, both variables point to the exact same object in the pool, saving memory. This sharing is only safe because Strings cannot change — if one reference could modify the shared object, every other reference to that literal would unexpectedly change too. Immutability also makes String inherently thread-safe: multiple threads can read the same String concurrently with no risk of one thread seeing a partially modified value, and no synchronization is needed.`,
      },
      {
        heading: 'Safe Use as HashMap Keys',
        body: `String's <code>hashCode()</code> is computed once and cached internally, because the value can never change after construction. This makes String an excellent, efficient key type for HashMap and HashSet — the hash code is guaranteed to stay valid for the object's entire lifetime, which would not be true for a mutable key (a mutable key that changes after being inserted into a HashMap can become permanently unreachable in that map).`,
      },
      {
        heading: 'What Actually Happens with s = s + "x"',
        body: `When you write <code>s = s + "x";</code>, Java does not modify the memory that <code>s</code> originally pointed to. Instead, it creates a brand-new String object containing the concatenated result and reassigns the reference <code>s</code> to point at that new object. The original String object still exists unchanged in memory (and will eventually be garbage collected if nothing else references it) — only the reference variable was updated to point elsewhere.`,
      },
    ],
    examples: [
      {
        caption: 'Concatenation creates a new object instead of mutating the original',
        code: `public class StringImmutabilityDemo {
    public static void main(String[] args) {
        String s1 = "hello";
        String s2 = s1;

        s1 = s1 + " world"; // creates a new String object, does not modify the original

        System.out.println(s1);
        System.out.println(s2);
        System.out.println(s1 == s2);
    }
}`,
        output: `hello world
hello
false`,
      },
    ],
    commonMistakes: [
      'Believing that methods like replace() or toUpperCase() modify the original String in place — they always return a new String that must be captured (e.g. "s = s.toUpperCase();").',
      'Concatenating Strings heavily inside a loop with "+", not realizing each concatenation creates a new object, which wastes memory and time — StringBuilder should be used instead for repeated concatenation.',
      'Assuming two Strings with the same text created with "new String(...)" are the same object as a literal — use .equals() for content comparison, not == , since == compares references.',
      'Forgetting that String immutability is exactly what makes the String pool and safe HashMap key usage possible in the first place.',
    ],
    keyPoints: [
      'String immutability prevents tampering with validated data used in security-sensitive operations like file paths and class loading.',
      'The String pool can safely share literal objects only because Strings can never be modified after creation.',
      'Immutable Strings are inherently thread-safe and make efficient, reliable HashMap/HashSet keys via a cached hash code.',
      'Operations like s = s + "x" create a new String object and reassign the reference; they never mutate the original object.',
    ],
  },

  'how-to-create-an-immutable-class-in-java': {
    title: 'How to Create an Immutable Class in Java',
    intro: `An immutable class is one whose objects cannot be modified after they are constructed — every field is set once, in the constructor, and stays that way for the object's entire lifetime. Java's own String, Integer, and other wrapper classes are immutable, and you can design your own classes the same way, which is especially valuable for objects shared across threads or used as map keys.`,
    sections: [
      {
        heading: 'The Rules for Immutability',
        body: `Following these rules consistently is what actually guarantees immutability — skipping any one of them can let an object's state leak or change after construction.`,
        list: [
          'Declare the class <code>final</code>, so it cannot be subclassed in a way that adds mutable behavior or overrides methods to break immutability.',
          'Make every field <code>private</code> and <code>final</code>, so each field can only be assigned once and only from within the class.',
          'Do not provide any setter methods — provide only getters that read a field\'s value.',
          'Initialize all fields fully inside the constructor, so an object is always in a complete, valid state immediately after creation.',
          'For fields that reference mutable objects (like a <code>java.util.Date</code> or a <code>List</code>), never hand out or accept the live reference directly — copy the data instead, both when storing it in the constructor and when returning it from a getter (a "defensive copy").',
        ],
      },
      {
        heading: 'Why Defensive Copies Matter',
        body: `Even if a field itself is final, the object it refers to might still be mutable. For example, a final <code>List&lt;String&gt;</code> field cannot be reassigned to a different list, but the caller could still call <code>.add()</code> on the same list object if you handed out the original reference through a getter. Making a defensive copy — a brand-new List or Date containing the same data — in both the constructor and the getter closes this loophole completely.`,
      },
    ],
    examples: [
      {
        caption: 'A fully immutable class with a defensive copy for its mutable field',
        code: `import java.util.ArrayList;
import java.util.List;

public final class ImmutableStudent {
    private final String name;
    private final List<String> subjects;

    public ImmutableStudent(String name, List<String> subjects) {
        this.name = name;
        this.subjects = new ArrayList<>(subjects); // defensive copy on input
    }

    public String getName() {
        return name;
    }

    public List<String> getSubjects() {
        return new ArrayList<>(subjects); // defensive copy on output
    }

    public static void main(String[] args) {
        List<String> original = new ArrayList<>();
        original.add("Math");
        original.add("Science");

        ImmutableStudent student = new ImmutableStudent("Asha", original);
        original.add("History"); // does not affect the student's internal list

        List<String> retrieved = student.getSubjects();
        retrieved.add("Art"); // does not affect the student's internal list either

        System.out.println(student.getName());
        System.out.println(student.getSubjects());
    }
}`,
        output: `Asha
[Math, Science]`,
      },
    ],
    commonMistakes: [
      'Marking fields final but storing a mutable object (like a List or Date) without copying it — the reference cannot be reassigned, but its contents can still be changed from outside.',
      'Providing a getter that returns the live internal reference to a mutable field instead of a defensive copy, silently breaking immutability.',
      'Forgetting to make the class itself final, allowing a subclass to add mutable state or override behavior in a way that violates the immutability contract.',
      'Adding a "convenience" setter method later for one field, which turns a carefully designed immutable class back into a mutable one.',
    ],
    keyPoints: [
      'Immutable classes are final, have private final fields, provide no setters, and fully initialize state in the constructor.',
      'Mutable field types (List, Date, arrays, etc.) need defensive copies both on the way in (constructor) and the way out (getters).',
      'Immutability makes objects inherently thread-safe and safe to share or cache without defensive locking.',
      'Java\'s own String and wrapper classes (Integer, Long, etc.) follow exactly this immutable design pattern.',
    ],
  },

  'stringtokenizer-class-in-java': {
    title: 'StringTokenizer Class in Java',
    intro: `<code>StringTokenizer</code>, found in <code>java.util</code>, is one of Java's oldest utility classes for breaking a string into smaller pieces called tokens, based on a set of delimiter characters. It predates Java's regular expression support and is considered a legacy class today — it is worth knowing for reading older codebases, but new code should generally prefer <code>String.split()</code>.`,
    sections: [
      {
        heading: 'Basic Usage and Methods',
        body: `You construct a StringTokenizer with the string to split and (optionally) a set of delimiter characters — if no delimiter is given, it defaults to whitespace (space, tab, newline). The class exposes a small, simple API for walking through the tokens one at a time.`,
        list: [
          '<code>hasMoreTokens()</code> — returns true if at least one token remains to be read.',
          '<code>nextToken()</code> — returns the next token as a String and advances the internal position.',
          '<code>countTokens()</code> — returns the number of tokens remaining (without consuming them).',
        ],
      },
      {
        heading: 'Why String.split() Is Preferred Today',
        body: `<code>String.split(regex)</code>, added later, is far more powerful because it accepts a full regular expression rather than a fixed set of delimiter characters, so it can split on patterns like "one or more spaces" or "a comma optionally followed by a space." It also returns a String array, which integrates naturally with modern Java code (streams, for-each loops, and so on), whereas StringTokenizer implements the older Enumeration-style iteration. For any new code you write, <code>split()</code> (or, for more complex parsing, the <code>java.util.regex</code> package) is the right tool; StringTokenizer is mainly useful today for recognizing it when reading legacy code.`,
      },
    ],
    examples: [
      {
        caption: 'Splitting a comma-separated string into tokens',
        code: `import java.util.StringTokenizer;

public class StringTokenizerDemo {
    public static void main(String[] args) {
        StringTokenizer tokenizer = new StringTokenizer("Java,Python,C++,Kotlin", ",");

        System.out.println("Token count: " + tokenizer.countTokens());

        while (tokenizer.hasMoreTokens()) {
            System.out.println(tokenizer.nextToken());
        }
    }
}`,
        output: `Token count: 4
Java
Python
C++
Kotlin`,
      },
    ],
    commonMistakes: [
      'Calling nextToken() without first checking hasMoreTokens(), which throws a NoSuchElementException once all tokens are consumed.',
      'Trying to pass a regular expression as the delimiter argument — StringTokenizer treats every character in the delimiter string as a literal character, not a pattern.',
      'Using StringTokenizer in new code out of habit when String.split() or Pattern/Matcher would be simpler and more capable.',
      'Assuming StringTokenizer preserves empty tokens between consecutive delimiters — it simply skips them, unlike split() with a limit argument.',
    ],
    keyPoints: [
      'StringTokenizer splits a string into tokens using a fixed set of delimiter characters.',
      'Core methods: hasMoreTokens(), nextToken(), and countTokens().',
      'It is a legacy class; String.split() (regex-based) is the modern, preferred approach for new code.',
      'StringTokenizer is still worth recognizing when reading or maintaining older Java codebases.',
    ],
  },

  'java-regular-expressions-regex': {
    title: 'Java Regular Expressions (Regex)',
    intro: `A regular expression (regex) is a pattern that describes a set of matching strings, and Java provides full regex support through the <code>java.util.regex</code> package as well as several regex-powered methods directly on the String class. Regex is the standard tool for validating input formats (emails, phone numbers, postal codes), searching text, and performing pattern-based replacements.`,
    sections: [
      {
        heading: 'The Pattern and Matcher Classes',
        body: `<code>Pattern.compile(regex)</code> compiles a regular expression string into a reusable Pattern object — compiling once and reusing the Pattern is more efficient than recompiling the same regex repeatedly. Calling <code>pattern.matcher(input)</code> produces a Matcher object bound to a specific input string, which provides methods like <code>matches()</code> (does the entire input match the pattern), <code>find()</code> (is there a matching subsequence anywhere in the input), and <code>group()</code> (retrieve the text that matched).`,
      },
      {
        heading: 'Common Regex Metacharacters',
        body: `A small set of metacharacters covers the vast majority of everyday patterns.`,
        list: [
          '<code>.</code> — matches any single character (except line terminators by default).',
          '<code>*</code> and <code>+</code> — zero-or-more and one-or-more repetitions of the preceding element.',
          '<code>?</code> — zero-or-one occurrence (also used to make a quantifier non-greedy, as in <code>*?</code>).',
          '<code>\\d</code> and <code>\\w</code> — a single digit (0-9) and a single "word" character (letters, digits, underscore) respectively.',
          '<code>^</code> and <code>$</code> — anchor a match to the start and end of the input (or line, in multiline mode).',
        ],
      },
      {
        heading: 'Regex-Powered String Methods',
        body: `You rarely need Pattern and Matcher directly for simple cases, because String itself exposes convenient regex-based methods: <code>matches(regex)</code> checks whether the entire string matches a pattern, <code>replaceAll(regex, replacement)</code> replaces every matching subsequence, and <code>split(regex)</code> breaks a string into an array wherever the pattern matches. These cover most validation and parsing needs without ever constructing a Pattern object explicitly.`,
      },
    ],
    examples: [
      {
        caption: 'Validating an email-like format and using replaceAll',
        code: `import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexDemo {
    public static void main(String[] args) {
        String email = "user@example.com";
        String regex = "^[\\\\w.]+@[\\\\w]+\\\\.[a-zA-Z]{2,}$";

        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(email);

        System.out.println(matcher.matches());
        System.out.println(email.matches(regex));
        System.out.println("2026-09-21".replaceAll("-", "/"));
    }
}`,
        output: `true
true
2026/09/21`,
      },
    ],
    commonMistakes: [
      'Forgetting that in a Java string literal, backslashes in a regex must be escaped, so "\\d" must be written as "\\\\d" in source code.',
      'Using matches() when find() was intended (or vice versa) — matches() requires the entire input to match the pattern, while find() looks for a matching subsequence anywhere within it.',
      'Recompiling the same regex with Pattern.compile() inside a loop instead of compiling it once outside the loop and reusing the Pattern object.',
      'Writing an overly permissive email or input validation regex and assuming it covers every valid real-world case — production validation often needs additional checks beyond a single regex.',
    ],
    keyPoints: [
      'java.util.regex provides Pattern (a compiled expression) and Matcher (matching logic bound to specific input text).',
      'Key metacharacters: . * + ? \\d \\w ^ $ cover most common patterns.',
      'String offers built-in regex methods: matches(), replaceAll(), and split().',
      'Compile a Pattern once and reuse it rather than recompiling the same regex repeatedly for performance.',
    ],
  },
}
