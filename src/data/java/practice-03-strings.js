// Practice blocks for the Strings and Regex module. Merged onto the lesson
// entries in index.js by slug, so the lesson prose files stay unchanged.
export const practice03Strings = {
  'java-string': {
    whyItMatters: `Strings are the most used type in almost any Java program: names, messages, keys, JSON, SQL, file paths. They also behave differently from every other object you meet early on, because they can never be changed after creation. Until that is clear, code such as <code>s.toUpperCase();</code> on a line by itself looks as if it should work, and it silently does nothing.`,
    exercise: {
      prompt: `Count the vowels in a piece of text, treating upper and lower case the same.

Expected output: <code>5</code> for the text <code>WebNest Studio</code>.`,
      starterCode: `public class VowelCount {
    public static void main(String[] args) {
        String text = "WebNest Studio";
        int count = 0;

        // TODO: look at each character and count a, e, i, o and u in either case

        System.out.println(count);
    }
}`,
      hints: [
        'Convert the text to lower case once, then read each character with <code>charAt(i)</code>.',
        '<code>"aeiou".indexOf(ch)</code> returns -1 when the character is not a vowel.',
      ],
      solution: `public class VowelCount {
    public static void main(String[] args) {
        String text = "WebNest Studio";
        int count = 0;

        String lower = text.toLowerCase();
        for (int i = 0; i < lower.length(); i++) {
            if ("aeiou".indexOf(lower.charAt(i)) != -1) {
                count++;
            }
        }

        System.out.println(count); // 5
    }
}`,
    },
    quiz: [
      {
        question: 'What does this print? <code>String s = "hello"; s.toUpperCase(); System.out.println(s);</code>',
        options: ['HELLO', 'hello', 'Hello', 'It does not compile'],
        answer: 1,
        explanation: 'toUpperCase() returns a new String and leaves the original untouched. The result was not assigned, so s is still "hello".',
      },
      {
        question: 'What does <code>"Java".length()</code> return?',
        options: ['3', '4', '5', '8'],
        answer: 1,
        explanation: 'length() returns the number of chars in the String, which is 4.',
      },
      {
        question: 'How does <code>String a = "hi";</code> differ from <code>String b = new String("hi");</code>?',
        options: ['There is no difference', 'a refers to the pooled literal; b is a separate new object on the heap', 'b is faster to create', 'a can be changed, b cannot'],
        answer: 1,
        explanation: 'A literal is taken from the string pool and shared. new String() always creates an additional object, even though the content is the same.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Is String a primitive type in Java?',
        answer: `No. <code>String</code> is a class in <code>java.lang</code>, so a String variable holds a reference to an object. It only feels like a primitive because the language gives it special support: literals in double quotes, the <code>+</code> operator for concatenation, and the string pool.`,
      },
      {
        question: 'What is the difference between creating a String with a literal and with new?',
        answer: `A literal such as <code>"hi"</code> is placed in the string pool, and every identical literal in the program refers to that one object. <code>new String("hi")</code> forces a new object on the heap in addition to the pooled literal. That wastes memory and makes <code>==</code> comparisons false, so literals are preferred.`,
      },
    ],
  },

  'why-strings-are-immutable-in-java': {
    whyItMatters: `Immutability is the reason Strings can be shared safely between threads, cached in a pool, and trusted as map keys and as arguments to security-sensitive code. It also explains the behaviour that trips people up: passing a String to a method can never change the caller's String. "Why is String immutable?" is one of the most frequently asked Java interview questions.`,
    exercise: {
      prompt: `The method below is supposed to add an exclamation mark to the message, but the program prints <code>Hello</code>. Change the method and the call so that it prints <code>Hello!</code>.`,
      starterCode: `public class AddSuffix {

    static void addSuffix(String s) {
        s = s + "!";
    }

    public static void main(String[] args) {
        String message = "Hello";
        addSuffix(message);
        System.out.println(message);
    }
}`,
      hints: [
        '<code>s + "!"</code> creates a new String. Assigning it to the parameter <code>s</code> does not affect the variable in <code>main</code>.',
        'Return the new String from the method and assign the result back to <code>message</code>.',
      ],
      solution: `public class AddSuffix {

    static String addSuffix(String s) {
        return s + "!";
    }

    public static void main(String[] args) {
        String message = "Hello";
        message = addSuffix(message);
        System.out.println(message); // Hello!
    }
}`,
    },
    quiz: [
      {
        question: 'Which of these is a direct benefit of Strings being immutable?',
        options: ['Strings use less CPU to create', 'A String can be shared between threads without synchronization', 'Strings can be modified in place', 'Strings never need garbage collection'],
        answer: 1,
        explanation: 'Because no thread can change a String, sharing one is always safe. That also makes the string pool possible.',
      },
      {
        question: 'After <code>String s = "ab"; s.concat("c");</code>, what is the value of <code>s</code>?',
        options: ['abc', 'ab', 'c', 'null'],
        answer: 1,
        explanation: 'concat() returns a new String. Since the result is not assigned, s still refers to "ab".',
      },
      {
        question: 'Why is the String class declared <code>final</code>?',
        options: ['To make it faster to load', 'So that no subclass can override its behaviour and break immutability', 'So that String variables cannot be reassigned', 'Because it has no constructors'],
        answer: 1,
        explanation: 'If String could be subclassed, a subclass could add mutable state or change methods, and code that relies on Strings never changing would no longer be safe.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why are Strings immutable in Java?',
        answer: `Four reasons are usually given. The string pool depends on it: many variables share one object, so no one may change it. Security: file paths, URLs and class names are passed as Strings and must not change after being validated. Thread safety: an immutable object can be shared freely. And hashing: the hash code can be computed once and cached, which makes Strings efficient and reliable as HashMap keys.`,
      },
      {
        question: 'Why is a char[] often recommended over a String for storing a password?',
        answer: `A String cannot be cleared: it stays in memory until the garbage collector removes it, and a literal can live in the pool for the life of the program, so it may appear in a heap dump. A <code>char[]</code> can be overwritten with zeros as soon as you have finished with it. It is also harder to print by accident, since printing an array does not show its contents.`,
      },
    ],
  },

  'java-string-methods': {
    whyItMatters: `Most everyday string work — trimming input, checking a prefix, splitting a line, comparing ignoring case — is one method call if you know the method exists. The details matter, though: indexes start at 0, the end index of <code>substring</code> is exclusive, and <code>split</code> takes a regular expression. Getting one of those wrong gives an off-by-one result or a runtime exception.`,
    exercise: {
      prompt: `Write a method that decides whether a phrase is a palindrome, ignoring spaces and upper or lower case.

Expected output: <code>true</code> for "Never odd or even", then <code>false</code> for "WebNest".`,
      starterCode: `public class Palindrome {

    static boolean isPalindrome(String text) {
        // TODO: remove spaces, ignore case, then compare characters from both ends
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("Never odd or even"));
        System.out.println(isPalindrome("WebNest"));
    }
}`,
      hints: [
        '<code>text.replace(" ", "").toLowerCase()</code> gives you a clean string to compare.',
        'Compare <code>charAt(i)</code> with <code>charAt(length - 1 - i)</code> for the first half of the string.',
      ],
      solution: `public class Palindrome {

    static boolean isPalindrome(String text) {
        String clean = text.replace(" ", "").toLowerCase();
        for (int i = 0; i < clean.length() / 2; i++) {
            if (clean.charAt(i) != clean.charAt(clean.length() - 1 - i)) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("Never odd or even")); // true
        System.out.println(isPalindrome("WebNest"));           // false
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>"Hello".substring(1, 3)</code> return?',
        options: ['Hel', 'el', 'ell', 'He'],
        answer: 1,
        explanation: 'The start index is inclusive and the end index is exclusive, so you get the characters at index 1 and 2: "el".',
      },
      {
        question: 'What is the length of the array returned by <code>"a,b,,c".split(",")</code>?',
        options: ['3', '4', '5', '2'],
        answer: 1,
        explanation: 'The result is "a", "b", an empty string and "c". Empty strings in the middle are kept; only trailing empty strings are removed.',
      },
      {
        question: 'What does <code>"  hi ".trim().length()</code> return?',
        options: ['5', '4', '3', '2'],
        answer: 3,
        explanation: 'trim() removes leading and trailing whitespace, leaving "hi", which has length 2.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between equals(), equalsIgnoreCase() and compareTo()?',
        answer: `<code>equals()</code> returns true only when both strings have exactly the same characters. <code>equalsIgnoreCase()</code> does the same but treats upper and lower case as equal. <code>compareTo()</code> returns an int for ordering: negative if the string sorts before the argument, zero if they are equal, and positive if it sorts after. Use it for sorting, not for a simple equality check.`,
      },
      {
        question: 'How do you avoid a NullPointerException when comparing a String that may be null?',
        answer: `Call <code>equals</code> on the value you know is not null, for example <code>"ADMIN".equals(role)</code>, which simply returns false when <code>role</code> is null. Alternatively use <code>Objects.equals(a, b)</code>, which handles null on either side.`,
      },
    ],
  },

  'java-stringbuffer': {
    whyItMatters: `When text is built up in many steps, creating a new String at every step wastes time and memory. <code>StringBuffer</code> is the original mutable alternative and is still found throughout older code and libraries. You need to recognise it, know that its methods are synchronized, and understand why modern code usually reaches for <code>StringBuilder</code> instead.`,
    exercise: {
      prompt: `Build the text <code>1-2-3-4-5</code> with a StringBuffer and a loop, making sure there is no dash at the end.

Expected output: <code>1-2-3-4-5</code>`,
      starterCode: `public class DashList {
    public static void main(String[] args) {
        StringBuffer buffer = new StringBuffer();

        // TODO: append the numbers 1 to 5 separated by dashes, with no trailing dash

        System.out.println(buffer);
    }
}`,
      hints: [
        'Append the number and then a dash on each pass, and remove the last character after the loop.',
        '<code>buffer.deleteCharAt(buffer.length() - 1)</code> removes the final character.',
      ],
      solution: `public class DashList {
    public static void main(String[] args) {
        StringBuffer buffer = new StringBuffer();

        for (int i = 1; i <= 5; i++) {
            buffer.append(i).append('-');
        }
        buffer.deleteCharAt(buffer.length() - 1);

        System.out.println(buffer); // 1-2-3-4-5
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>new StringBuffer("abc").reverse().toString()</code> return?',
        options: ['abc', 'cba', 'bca', 'It does not compile'],
        answer: 1,
        explanation: 'reverse() reverses the characters in place and returns the same buffer, so the result is "cba".',
      },
      {
        question: 'What makes StringBuffer thread-safe?',
        options: ['It is immutable', 'Its methods are synchronized', 'It copies itself for each thread', 'It is stored in the string pool'],
        answer: 1,
        explanation: 'Its public methods are synchronized, so only one thread can modify a given buffer at a time.',
      },
      {
        question: 'A StringBuffer contains "yz". What does it contain after <code>insert(0, "x")</code>?',
        options: ['yzx', 'xyz', 'yxz', 'x'],
        answer: 1,
        explanation: 'insert(0, ...) places the text at the start and shifts the existing characters to the right.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the default capacity of a StringBuffer and how does it grow?',
        answer: `An empty StringBuffer starts with room for 16 characters. When more space is needed, the internal array is replaced with a larger one of roughly double the old capacity plus two, and the existing characters are copied across. If you know the final size in advance, passing it to the constructor avoids those copies.`,
      },
      {
        question: 'Why is StringBuffer slower than StringBuilder?',
        answer: `Every StringBuffer method is synchronized, so each call has to acquire and release a lock even when only one thread is using the buffer. StringBuilder has the same methods without synchronization, so it avoids that overhead. When the buffer is a local variable used by one thread, the locking gives no benefit.`,
      },
    ],
  },

  'java-stringbuilder': {
    whyItMatters: `<code>StringBuilder</code> is what you should use whenever you assemble text in a loop: building a CSV line, a log message, an HTML fragment or a SQL clause. Replacing string concatenation in a loop with a StringBuilder is one of the simplest performance fixes in Java, and one that code reviewers look for.`,
    exercise: {
      prompt: `Join the elements of an array into one line separated by a comma and a space, with no separator at the end.

Expected output: <code>red, green, blue</code>`,
      starterCode: `public class JoinColours {
    public static void main(String[] args) {
        String[] colours = {"red", "green", "blue"};
        StringBuilder line = new StringBuilder();

        // TODO: append each colour, adding ", " between them but not after the last

        System.out.println(line);
    }
}`,
      hints: [
        'Add the separator before every element except the first, instead of trying to remove it at the end.',
        'An indexed loop lets you test <code>i > 0</code>.',
      ],
      solution: `public class JoinColours {
    public static void main(String[] args) {
        String[] colours = {"red", "green", "blue"};
        StringBuilder line = new StringBuilder();

        for (int i = 0; i < colours.length; i++) {
            if (i > 0) {
                line.append(", ");
            }
            line.append(colours[i]);
        }

        System.out.println(line); // red, green, blue
    }
}`,
    },
    quiz: [
      {
        question: 'Is StringBuilder safe to share between threads that modify it?',
        options: ['Yes, always', 'No, its methods are not synchronized', 'Only when it is final', 'Only for append()'],
        answer: 1,
        explanation: 'StringBuilder has no synchronization. Use it within a single thread, or use StringBuffer or external locking when sharing.',
      },
      {
        question: 'Why is <code>result += piece</code> inside a long loop slow?',
        options: ['The + operator is not allowed in loops', 'Each iteration creates a new String and copies all the previous characters', 'It causes a memory leak', 'It blocks other threads'],
        answer: 1,
        explanation: 'Strings are immutable, so every += builds a new String containing everything so far. The total copying grows with the square of the length.',
      },
      {
        question: 'Why can you write <code>sb.append("a").append("b")</code>?',
        options: ['append() returns a new String', 'append() returns the same StringBuilder', 'append() returns void, and Java chains automatically', 'It only works for two calls'],
        answer: 1,
        explanation: 'append() returns the builder it was called on, which allows calls to be chained.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What does the compiler do with String concatenation using +?',
        answer: `For a single expression such as <code>a + b + c</code>, the compiler already produces efficient code: older compilers generated a StringBuilder, and since Java 9 it uses a runtime-optimised concatenation mechanism. The problem is a loop: each iteration is a separate expression, so a new String is created every time. That is the case where you should use an explicit StringBuilder.`,
      },
      {
        question: 'How do you reuse a StringBuilder for the next piece of text?',
        answer: `Call <code>sb.setLength(0)</code>. It resets the length to zero while keeping the internal array, so the builder can be filled again without allocating new memory. This is useful when the same builder is used repeatedly inside a loop.`,
      },
    ],
  },

  'string-vs-stringbuffer-vs-stringbuilder': {
    whyItMatters: `Choosing between these three types is a decision you make constantly, usually without thinking. The right default is simple — String for values, StringBuilder for building — but you should be able to explain why, because "String vs StringBuffer vs StringBuilder" is asked in nearly every Java interview for junior roles.`,
    complexity: [
      { operation: 'Joining n pieces with String += in a loop', average: 'O(n²) characters copied in total', worst: 'O(n²)' },
      { operation: 'Joining n pieces with StringBuilder.append', average: 'O(n) in total', worst: 'O(n)' },
    ],
    exercise: {
      prompt: `This program builds its result with String concatenation in a loop. Rewrite it to use a StringBuilder. The output must stay the same.

Expected output: <code>12345</code>`,
      starterCode: `public class BuildDigits {
    public static void main(String[] args) {
        String result = "";

        for (int i = 1; i <= 5; i++) {
            result += i;
        }

        System.out.println(result);
    }
}`,
      hints: [
        'Create the StringBuilder before the loop and call <code>append(i)</code> inside it.',
        'Convert to a String once, at the end, with <code>toString()</code>.',
      ],
      solution: `public class BuildDigits {
    public static void main(String[] args) {
        StringBuilder builder = new StringBuilder();

        for (int i = 1; i <= 5; i++) {
            builder.append(i);
        }

        String result = builder.toString();
        System.out.println(result); // 12345
    }
}`,
    },
    quiz: [
      {
        question: 'Which of the three types is immutable?',
        options: ['String', 'StringBuffer', 'StringBuilder', 'All of them'],
        answer: 0,
        explanation: 'Only String is immutable. StringBuffer and StringBuilder can be modified in place.',
      },
      {
        question: 'You are building a long piece of text inside one method, on one thread. Which is the best choice?',
        options: ['String', 'StringBuffer', 'StringBuilder', 'char'],
        answer: 2,
        explanation: 'StringBuilder is mutable and has no locking overhead, so it is the fastest option when only one thread is involved.',
      },
      {
        question: 'Which type has synchronized methods?',
        options: ['String', 'StringBuffer', 'StringBuilder', 'None of them'],
        answer: 1,
        explanation: 'StringBuffer synchronizes its methods. String needs no synchronization because it cannot change.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the differences between String, StringBuffer and StringBuilder?',
        answer: `String is immutable: every modification creates a new object, which makes it safe to share but costly to build up piece by piece. StringBuffer is mutable and its methods are synchronized, so it is thread-safe but slower. StringBuilder is mutable with the same methods and no synchronization, so it is the fastest but not thread-safe.

In practice: String for values that do not change, StringBuilder for building text, and StringBuffer only when several threads really modify the same buffer.`,
      },
      {
        question: 'Do StringBuilder and StringBuffer override equals()?',
        answer: `No. They inherit <code>equals()</code> from Object, so two builders with the same characters are not equal unless they are the same object. To compare content, convert to Strings first: <code>a.toString().equals(b.toString())</code>.`,
      },
    ],
  },

  'string-comparison-and-the-string-pool': {
    whyItMatters: `Comparing strings with <code>==</code> is the classic Java bug: it appears to work in simple tests, because literals share one pooled object, and then fails with real data read from a file, a form or a database. Understanding the pool explains both why the bug hides and why <code>equals()</code> is always the correct comparison for text.`,
    diagram: {
      caption: 'Two literals share one pooled object, while new String() creates a separate object with the same characters.',
      svg: `<svg viewBox="0 0 640 210" role="img" aria-label="Variables a and b point to the same pooled string java; variable c points to a separate heap object with the same content" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-monospace, monospace" font-size="13">
  <rect x="10" y="40" width="70" height="36" rx="6"/><text x="45" y="63" text-anchor="middle" fill="currentColor" stroke="none">a</text>
  <rect x="10" y="90" width="70" height="36" rx="6"/><text x="45" y="113" text-anchor="middle" fill="currentColor" stroke="none">b</text>
  <rect x="10" y="150" width="70" height="36" rx="6"/><text x="45" y="173" text-anchor="middle" fill="currentColor" stroke="none">c</text>
  <rect x="250" y="20" width="370" height="180" rx="10"/>
  <text x="266" y="42" fill="currentColor" stroke="none" font-size="12">heap</text>
  <rect x="290" y="52" width="200" height="70" rx="8" stroke-dasharray="5 4"/>
  <text x="304" y="70" fill="currentColor" stroke="none" font-size="12">string pool</text>
  <rect x="330" y="78" width="110" height="34" rx="6" stroke-width="3"/><text x="385" y="100" text-anchor="middle" fill="currentColor" stroke="none">"java"</text>
  <rect x="330" y="150" width="110" height="34" rx="6"/><text x="385" y="172" text-anchor="middle" fill="currentColor" stroke="none">"java"</text>
  <text x="455" y="172" fill="currentColor" stroke="none" font-size="12">new String("java")</text>
  <path d="M80 58 L330 90"/><path d="M322 84 L330 90 L321 94"/>
  <path d="M80 108 L330 98"/><path d="M322 93 L330 98 L322 104"/>
  <path d="M80 168 H330"/><path d="M324 162 L330 168 L324 174"/>
</svg>`,
    },
    exercise: {
      prompt: `The method below compares two strings with <code>==</code>, so the program prints <code>false</code> even though both hold the text "java". Fix the comparison so it prints <code>true</code>, and make it safe when either argument is null.`,
      starterCode: `public class SameText {

    static boolean sameText(String x, String y) {
        return x == y;
    }

    public static void main(String[] args) {
        String a = "java";
        String c = new String("java");
        System.out.println(sameText(a, c));
    }
}`,
      hints: [
        '<code>==</code> asks whether both variables refer to the same object. <code>equals()</code> compares the characters.',
        '<code>java.util.Objects.equals(x, y)</code> compares content and handles null on either side.',
      ],
      solution: `import java.util.Objects;

public class SameText {

    static boolean sameText(String x, String y) {
        return Objects.equals(x, y);
    }

    public static void main(String[] args) {
        String a = "java";
        String c = new String("java");
        System.out.println(sameText(a, c)); // true
    }
}`,
    },
    quiz: [
      {
        question: 'Given <code>String a = "java"; String b = "java";</code>, what is <code>a == b</code>?',
        options: ['true', 'false', 'It depends on the JVM', 'It does not compile'],
        answer: 0,
        explanation: 'Both literals refer to the same object in the string pool, so the references are equal.',
      },
      {
        question: 'What is <code>new String("x") == new String("x")</code>?',
        options: ['true', 'false', 'null', 'It throws an exception'],
        answer: 1,
        explanation: 'Each new String() creates a separate object, so the two references are different even though the content matches.',
      },
      {
        question: 'What is <code>("hel" + "lo") == "hello"</code>?',
        options: ['true', 'false', 'It depends on the JVM', 'It does not compile'],
        answer: 0,
        explanation: 'Concatenating two literals is a compile-time constant. The compiler produces the single literal "hello", which comes from the pool.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the string pool and where is it stored?',
        answer: `The string pool is a table of unique String objects that the JVM maintains so that identical literals share one object instead of each creating its own. Since Java 7 it is stored in the main heap, which means unused pooled strings can be garbage collected like other objects.`,
      },
      {
        question: 'What does intern() do?',
        answer: `<code>intern()</code> returns the pooled copy of a String. If an equal string is already in the pool, that one is returned; otherwise this string is added to the pool and returned. After <code>c = c.intern()</code>, a String created with <code>new</code> compares equal with <code>==</code> to the matching literal. In application code you should still compare with <code>equals()</code>.`,
      },
    ],
  },

  'how-to-create-an-immutable-class-in-java': {
    whyItMatters: `Immutable objects cannot be put into an invalid state after construction, can be shared between threads without locking, and are safe to use as map keys. Value types such as money, dates and identifiers are usually designed this way. Writing one correctly means knowing the one step people miss: protecting mutable fields with defensive copies.`,
    exercise: {
      prompt: `The <code>Money</code> class below can be changed after it is created. Rewrite it as an immutable class: adding an amount must return a new <code>Money</code> and leave the original unchanged.

Expected output: <code>100</code> then <code>150</code>`,
      starterCode: `class Money {
    int amount;

    Money(int amount) {
        this.amount = amount;
    }

    void add(int extra) {
        amount += extra;
    }
}

public class ImmutableDemo {
    public static void main(String[] args) {
        Money price = new Money(100);
        // TODO: after making Money immutable, create a second Money that is 50 more
        // and print the amount of both objects
    }
}`,
      hints: [
        'Make the class <code>final</code>, the field <code>private final</code>, and remove any method that changes the field.',
        'A method such as <code>plus(int extra)</code> should return <code>new Money(amount + extra)</code>.',
      ],
      solution: `final class Money {
    private final int amount;

    Money(int amount) {
        this.amount = amount;
    }

    int getAmount() {
        return amount;
    }

    Money plus(int extra) {
        return new Money(amount + extra);
    }
}

public class ImmutableDemo {
    public static void main(String[] args) {
        Money price = new Money(100);
        Money withDelivery = price.plus(50);

        System.out.println(price.getAmount());        // 100
        System.out.println(withDelivery.getAmount()); // 150
    }
}`,
    },
    quiz: [
      {
        question: 'Which of these is NOT needed to make a class immutable?',
        options: ['Making fields private and final', 'Providing no setter methods', 'Implementing Serializable', 'Preventing subclassing'],
        answer: 2,
        explanation: 'Serializable has nothing to do with immutability. The other three are part of the standard recipe.',
      },
      {
        question: 'A class has <code>private final List&lt;String&gt; tags</code> and a getter that returns the list directly. Is the class immutable?',
        options: ['Yes, because the field is final', 'No, a caller can modify the returned list', 'Yes, because the field is private', 'Only if the list is empty'],
        answer: 1,
        explanation: 'final stops the field being reassigned, but the list itself is still mutable. Return a copy or an unmodifiable view instead.',
      },
      {
        question: 'Why is an immutable class usually declared <code>final</code>?',
        options: ['To make its methods faster', 'So that a subclass cannot add mutable state or override methods', 'So that its objects cannot be garbage collected', 'Because final classes use less memory'],
        answer: 1,
        explanation: 'A subclass could introduce setters or mutable fields, and an instance of it could then be passed wherever the immutable type is expected.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the steps to create an immutable class?',
        answer: `Declare the class <code>final</code> so it cannot be subclassed. Make every field <code>private</code> and <code>final</code>. Set all fields in the constructor and provide no setters. For any field that refers to a mutable object, copy it when it comes in through the constructor and return a copy (or an unmodifiable view) from the getter, so no outside code holds a reference to your internal state.`,
      },
      {
        question: 'Does declaring a field final make the object it refers to immutable?',
        answer: `No. <code>final</code> only means the variable cannot be pointed at a different object. If it refers to a mutable object such as an ArrayList or an array, the contents of that object can still be changed. Immutability needs both: a final reference and an object that cannot change or is not shared.`,
      },
    ],
  },

  'stringtokenizer-class-in-java': {
    whyItMatters: `<code>StringTokenizer</code> is a legacy class that you will still meet in older codebases, textbooks and exam questions. You need to be able to read it and to know how it differs from <code>split()</code> — in particular that it silently skips empty tokens — so that you can replace it safely when maintaining old code.`,
    exercise: {
      prompt: `Use a StringTokenizer to print each word of a sentence on its own line, followed by the number of words.

Expected output: <code>learn</code>, <code>java</code>, <code>with</code>, <code>webnest</code>, then <code>Words: 4</code>`,
      starterCode: `import java.util.StringTokenizer;

public class WordList {
    public static void main(String[] args) {
        String sentence = "learn java with webnest";
        StringTokenizer tokens = new StringTokenizer(sentence);

        // TODO: remember how many tokens there are, then print each one

    }
}`,
      hints: [
        '<code>countTokens()</code> returns how many tokens are left, so read it before the loop consumes them.',
        'Loop while <code>hasMoreTokens()</code> is true and read each one with <code>nextToken()</code>.',
      ],
      solution: `import java.util.StringTokenizer;

public class WordList {
    public static void main(String[] args) {
        String sentence = "learn java with webnest";
        StringTokenizer tokens = new StringTokenizer(sentence);

        int total = tokens.countTokens();
        while (tokens.hasMoreTokens()) {
            System.out.println(tokens.nextToken());
        }
        System.out.println("Words: " + total);
    }
}`,
    },
    quiz: [
      {
        question: 'What does a StringTokenizer split on when you do not specify a delimiter?',
        options: ['Commas', 'Whitespace such as spaces, tabs and newlines', 'Every character', 'Nothing'],
        answer: 1,
        explanation: 'The default delimiters are whitespace characters: space, tab, newline, carriage return and form feed.',
      },
      {
        question: 'How many tokens does <code>new StringTokenizer("a,,b", ",")</code> produce?',
        options: ['2', '3', '4', '1'],
        answer: 0,
        explanation: 'StringTokenizer skips empty tokens, so it yields only "a" and "b". "a,,b".split(",") would give three elements, including an empty one.',
      },
      {
        question: 'Is StringTokenizer recommended for new code?',
        options: ['Yes, it is the fastest option', 'No, it is a legacy class; use split() or java.util.regex instead', 'Only for multi-threaded code', 'Only for reading files'],
        answer: 1,
        explanation: 'The Java documentation itself describes StringTokenizer as a legacy class kept for compatibility and recommends split() or the regex package.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between StringTokenizer and String.split()?',
        answer: `<code>split()</code> takes a regular expression and returns all the pieces at once in an array, keeping empty strings between adjacent delimiters. <code>StringTokenizer</code> takes a set of delimiter characters, hands out tokens one at a time, and skips empty tokens.

split() is the modern choice: it works with regex patterns, the result can be indexed and reused, and it does not hide missing fields.`,
      },
    ],
  },

  'java-regular-expressions-regex': {
    whyItMatters: `Regular expressions describe a text pattern in one line: a valid phone number, a date, every number in a log line. They are how input is validated and text is extracted in most real applications. They are also easy to get subtly wrong, so it pays to know exactly what <code>matches()</code> checks and how backslashes are written inside a Java string.`,
    exercise: {
      prompt: `Validate an Indian PIN code: it must be exactly six digits and must not start with 0.

Expected output: <code>true</code> for 110001, <code>false</code> for 012345, and <code>false</code> for 1100.`,
      starterCode: `public class PinCode {

    static boolean isValidPin(String pin) {
        // TODO: return true only for six digits where the first is 1-9
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isValidPin("110001"));
        System.out.println(isValidPin("012345"));
        System.out.println(isValidPin("1100"));
    }
}`,
      hints: [
        '<code>[1-9]</code> matches one digit that is not zero, and <code>[0-9]{5}</code> matches exactly five more digits.',
        '<code>String.matches(regex)</code> is true only when the whole string fits the pattern.',
      ],
      solution: `public class PinCode {

    static boolean isValidPin(String pin) {
        return pin.matches("[1-9][0-9]{5}");
    }

    public static void main(String[] args) {
        System.out.println(isValidPin("110001")); // true
        System.out.println(isValidPin("012345")); // false
        System.out.println(isValidPin("1100"));   // false
    }
}`,
    },
    quiz: [
      {
        question: 'In the Java string <code>"\\\\d"</code>, what does the regular expression match?',
        options: ['The letter d', 'A backslash followed by d', 'Any single digit', 'Any character'],
        answer: 2,
        explanation: 'The two backslashes in the Java source produce one backslash in the actual string, giving the regex \\d, which matches a digit.',
      },
      {
        question: 'What does <code>"a1b22".replaceAll("[0-9]+", "#")</code> return?',
        options: ['a#b##', 'a#b#', '#', 'a1b22'],
        answer: 1,
        explanation: 'The + makes each run of digits a single match, so "1" and "22" are each replaced by one #.',
      },
      {
        question: 'What must be true for <code>String.matches(regex)</code> to return true?',
        options: ['The pattern occurs somewhere in the string', 'The entire string matches the pattern', 'The string starts with the pattern', 'The string ends with the pattern'],
        answer: 1,
        explanation: 'matches() tests the whole string. To look for the pattern anywhere inside the text, use a Matcher and find().',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between matches() and find() on a Matcher?',
        answer: `<code>matches()</code> returns true only if the entire input matches the pattern. <code>find()</code> searches for the next part of the input that matches, and can be called repeatedly to walk through every occurrence. Validation of a whole value uses matches(); searching and extracting uses find().`,
      },
      {
        question: 'Why compile a Pattern once instead of calling String.matches() repeatedly?',
        answer: `<code>String.matches()</code>, <code>replaceAll()</code> and <code>split()</code> compile the regular expression every time they are called. In a loop or a frequently called method that is wasted work. Compiling it once with <code>Pattern.compile()</code>, typically into a <code>static final</code> field, and reusing the Pattern avoids the repeated compilation. A Pattern is immutable and safe to share between threads.`,
      },
    ],
  },
}
