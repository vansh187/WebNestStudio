// Practice blocks for the Object-Oriented Programming module, part 3 of 3
// (object cloning through overloading vs overriding). Merged onto the lesson
// entries in index.js by slug, so the lesson prose files stay unchanged.
export const practice04cOop = {
  'object-cloning': {
    whyItMatters: `Copying an object sounds simple until the object contains another object. A shallow copy shares the inner data, so a change made through the copy also changes the original — a bug that appears far from where it was caused. Knowing the difference between shallow and deep copies matters for any code that hands objects to other parts of a system.`,
    exercise: {
      prompt: `The copy constructor below copies the reference to the ratings array instead of the array itself, so changing the copy also changes the original and the program prints <code>[1, 3, 4]</code> twice. Make it a deep copy.

Expected output: <code>[5, 3, 4]</code> then <code>[1, 3, 4]</code>`,
      starterCode: `import java.util.Arrays;

class Playlist {
    int[] ratings;

    Playlist(int[] ratings) {
        this.ratings = ratings;
    }

    Playlist(Playlist other) {
        this.ratings = other.ratings;
    }
}

public class CopyDemo {
    public static void main(String[] args) {
        Playlist original = new Playlist(new int[] {5, 3, 4});
        Playlist copy = new Playlist(original);
        copy.ratings[0] = 1;

        System.out.println(Arrays.toString(original.ratings));
        System.out.println(Arrays.toString(copy.ratings));
    }
}`,
      hints: [
        'Both objects currently hold a reference to the same array.',
        '<code>Arrays.copyOf(other.ratings, other.ratings.length)</code> creates a separate array with the same contents.',
      ],
      solution: `import java.util.Arrays;

class Playlist {
    int[] ratings;

    Playlist(int[] ratings) {
        this.ratings = ratings;
    }

    Playlist(Playlist other) {
        this.ratings = Arrays.copyOf(other.ratings, other.ratings.length);
    }
}

public class CopyDemo {
    public static void main(String[] args) {
        Playlist original = new Playlist(new int[] {5, 3, 4});
        Playlist copy = new Playlist(original);
        copy.ratings[0] = 1;

        System.out.println(Arrays.toString(original.ratings)); // [5, 3, 4]
        System.out.println(Arrays.toString(copy.ratings));     // [1, 3, 4]
    }
}`,
    },
    quiz: [
      {
        question: 'A class overrides <code>clone()</code> and calls <code>super.clone()</code> but does not implement <code>Cloneable</code>. What happens when it is cloned?',
        options: ['It returns a shallow copy', 'It throws CloneNotSupportedException', 'It returns null', 'It does not compile'],
        answer: 1,
        explanation: 'Object.clone() checks at runtime that the class implements Cloneable and throws CloneNotSupportedException if it does not.',
      },
      {
        question: 'What kind of copy does <code>Object.clone()</code> make by default?',
        options: ['A deep copy', 'A shallow copy', 'No copy; it returns the same object', 'A copy of primitive fields only'],
        answer: 1,
        explanation: 'It copies every field as it is. Reference fields are copied as references, so the clone shares those objects with the original.',
      },
      {
        question: 'How many methods does the <code>Cloneable</code> interface declare?',
        options: ['One: clone()', 'Two', 'None; it is a marker interface', 'It depends on the Java version'],
        answer: 2,
        explanation: 'Cloneable is empty. It only signals to Object.clone() that copying this class is permitted.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a shallow copy and a deep copy?',
        answer: `A shallow copy creates a new object but copies its fields directly, so any field that refers to another object ends up pointing at the same object as the original. A deep copy also copies the objects those fields refer to, recursively, so the two copies share nothing mutable and can be changed independently.`,
      },
      {
        question: 'What are the alternatives to clone()?',
        answer: `A copy constructor, which takes an object of the same class and copies its fields, or a static factory method such as <code>copyOf</code>. Both are clearer than <code>clone()</code>: they need no marker interface, no cast, no checked exception, and they make it explicit which fields are copied deeply. Most Java style guides recommend them over <code>Cloneable</code>.`,
      },
    ],
  },

  'wrapper-classes': {
    whyItMatters: `Collections and generics work only with objects, so every <code>int</code> stored in a list becomes an <code>Integer</code>. Java converts between the two automatically, which is convenient and hides two traps: unboxing a null throws an exception, and comparing two wrapper objects with <code>==</code> compares references, which happens to work for small numbers and fails for large ones.`,
    exercise: {
      prompt: `This program prints <code>true</code> then <code>false</code>, even though both pairs hold equal numbers, because <code>==</code> on <code>Integer</code> objects compares references. Fix both comparisons so the program prints <code>true</code> twice.`,
      starterCode: `public class IntegerCompare {
    public static void main(String[] args) {
        Integer a = 127;
        Integer b = 127;
        System.out.println(a == b);

        Integer c = 128;
        Integer d = 128;
        System.out.println(c == d);
    }
}`,
      hints: [
        'Values from -128 to 127 are cached, so <code>a</code> and <code>b</code> happen to be the same object. 128 is outside the cache.',
        'Compare wrapper objects by value with <code>equals()</code>.',
      ],
      solution: `public class IntegerCompare {
    public static void main(String[] args) {
        Integer a = 127;
        Integer b = 127;
        System.out.println(a.equals(b)); // true

        Integer c = 128;
        Integer d = 128;
        System.out.println(c.equals(d)); // true
    }
}`,
    },
    quiz: [
      {
        question: 'What happens with <code>Integer x = null; int y = x;</code>?',
        options: ['y becomes 0', 'It does not compile', 'It throws NullPointerException', 'y becomes -1'],
        answer: 2,
        explanation: 'Unboxing calls intValue() on the Integer. With a null reference that call throws NullPointerException.',
      },
      {
        question: 'Which range of values does Java cache for <code>Integer</code> by default?',
        options: ['0 to 255', '-128 to 127', '-1000 to 1000', 'No values are cached'],
        answer: 1,
        explanation: 'Integer.valueOf, which autoboxing uses, returns shared objects for -128 to 127.',
      },
      {
        question: 'Which method returns a primitive <code>int</code> from the text "42"?',
        options: ['Integer.valueOf("42")', 'Integer.parseInt("42")', 'Integer.toString("42")', 'new String("42")'],
        answer: 1,
        explanation: 'parseInt returns an int. valueOf returns an Integer object.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are autoboxing and unboxing?',
        answer: `Autoboxing is the automatic conversion of a primitive to its wrapper object, such as <code>int</code> to <code>Integer</code>, when an object is required. Unboxing is the reverse. The compiler inserts calls to <code>Integer.valueOf()</code> and <code>intValue()</code> for you. It is convenient, but it creates objects, so heavy boxing in a tight loop costs performance.`,
      },
      {
        question: 'Why does Java have wrapper classes?',
        answer: `Because primitives are not objects. Generic types such as <code>List&lt;T&gt;</code> and <code>Map&lt;K, V&gt;</code> can only hold objects, so numbers must be wrapped to be stored in collections. Wrappers can also be null to represent "no value", and they provide utility methods and constants such as <code>Integer.parseInt</code> and <code>Integer.MAX_VALUE</code>.`,
      },
    ],
  },

  'java-math-class-and-utility-methods': {
    whyItMatters: `Rounding, powers, square roots, absolute values and min/max come up in pricing, distances, pagination and statistics. The <code>Math</code> class provides them as static methods, and the small differences between <code>floor</code>, <code>ceil</code> and <code>round</code> — especially with negative numbers — are a reliable source of off-by-one results.`,
    exercise: {
      prompt: `Use <code>Math</code> methods to print the distance between the points (0, 0) and (3, 4), then 2 to the power of 10, then the absolute value of -7.

Expected output: <code>5.0</code>, <code>1024.0</code>, <code>7</code>`,
      starterCode: `public class MathPractice {

    static double distance(int x1, int y1, int x2, int y2) {
        // TODO: square root of (dx squared + dy squared)
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(distance(0, 0, 3, 4));
        // TODO: print 2 to the power of 10
        // TODO: print the absolute value of -7
    }
}`,
      hints: [
        '<code>Math.sqrt</code> and <code>Math.pow</code> both return a double.',
        '<code>Math.abs(-7)</code> returns an int because its argument is an int.',
      ],
      solution: `public class MathPractice {

    static double distance(int x1, int y1, int x2, int y2) {
        int dx = x2 - x1;
        int dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public static void main(String[] args) {
        System.out.println(distance(0, 0, 3, 4)); // 5.0
        System.out.println(Math.pow(2, 10));      // 1024.0
        System.out.println(Math.abs(-7));         // 7
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>Math.round(-2.5)</code> return?',
        options: ['-3', '-2', '-2.5', '2'],
        answer: 1,
        explanation: 'Math.round adds 0.5 and takes the floor, so a tie rounds towards positive infinity: -2.5 becomes -2, and 2.5 becomes 3.',
      },
      {
        question: 'What does <code>Math.floor(-1.1)</code> return?',
        options: ['-1.0', '-2.0', '-1.1', '1.0'],
        answer: 1,
        explanation: 'floor returns the largest whole number that is less than or equal to the argument, which for -1.1 is -2.0.',
      },
      {
        question: 'What range of values can <code>Math.random()</code> return?',
        options: ['0.0 to 1.0, both inclusive', '0.0 inclusive to 1.0 exclusive', '1 to 100', '-1.0 to 1.0'],
        answer: 1,
        explanation: 'It returns a double greater than or equal to 0.0 and strictly less than 1.0.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between Math.floor(), Math.ceil() and Math.round()?',
        answer: `<code>floor</code> rounds down to the nearest whole number towards negative infinity, and <code>ceil</code> rounds up towards positive infinity; both return a double. <code>round</code> returns the nearest whole number as a long (or an int for a float argument), with ties rounded up. For 2.5 they give 2.0, 3.0 and 3; for -2.5 they give -3.0, -2.0 and -2.`,
      },
      {
        question: 'How do you generate a random integer between min and max inclusive?',
        answer: `With Math: <code>(int) (Math.random() * (max - min + 1)) + min</code>. Multiplying spreads the value over the size of the range, the cast drops the fraction, and adding <code>min</code> shifts it. In modern code, <code>ThreadLocalRandom.current().nextInt(min, max + 1)</code> is clearer and avoids the arithmetic.`,
      },
    ],
  },

  'strictfp-keyword-in-java': {
    whyItMatters: `<code>strictfp</code> is mostly history now: since Java 17 all floating-point arithmetic is strict by default, and the keyword has no effect. It is still worth recognising in older code and in exam questions. The lasting lesson behind it is that floating-point numbers are approximations, which is why <code>0.1 + 0.2</code> is not exactly <code>0.3</code>.`,
    exercise: {
      prompt: `This program prints <code>false</code>, because <code>0.1 + 0.2</code> is not stored as exactly <code>0.3</code>. Change the comparison so that it treats two doubles as equal when they differ by less than a very small tolerance.

Expected output: <code>true</code>`,
      starterCode: `public class FloatCompare {
    public static void main(String[] args) {
        double sum = 0.1 + 0.2;
        System.out.println(sum == 0.3);
    }
}`,
      hints: [
        'Never compare floating-point results with <code>==</code>; compare the size of the difference instead.',
        '<code>Math.abs(sum - 0.3) &lt; 1e-9</code> is true when the two values are within one billionth of each other.',
      ],
      solution: `public class FloatCompare {
    public static void main(String[] args) {
        double sum = 0.1 + 0.2;
        System.out.println(Math.abs(sum - 0.3) < 1e-9); // true
    }
}`,
    },
    quiz: [
      {
        question: 'From which Java version is <code>strictfp</code> redundant, because all floating-point arithmetic is strict by default?',
        options: ['Java 8', 'Java 11', 'Java 17', 'Java 21'],
        answer: 2,
        explanation: 'Java 17 restored always-strict floating-point semantics, so the keyword no longer changes behaviour.',
      },
      {
        question: 'Where could <code>strictfp</code> be applied?',
        options: ['To variables', 'To classes, interfaces and methods', 'To constructors only', 'To packages'],
        answer: 1,
        explanation: 'It was a modifier for classes, interfaces and non-abstract methods. It was never allowed on variables or constructors.',
      },
      {
        question: 'What does <code>0.1 + 0.2 == 0.3</code> evaluate to in Java?',
        options: ['true', 'false', 'It does not compile', 'It depends on the operating system'],
        answer: 1,
        explanation: '0.1, 0.2 and 0.3 cannot be represented exactly in binary, and the sum differs from 0.3 in the last bits.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What did strictfp do, and is it still needed?',
        answer: `It forced floating-point calculations to follow the IEEE 754 standard exactly, so that results were identical on every platform. Without it, older JVMs were allowed to use extra precision on some processors, which could change results slightly. Since Java 17 strict behaviour is always on, so the keyword is accepted but does nothing, and compilers warn that it is unnecessary.`,
      },
      {
        question: 'How should you handle money, given that double is imprecise?',
        answer: `Do not use <code>double</code> or <code>float</code> for money. Use <code>BigDecimal</code>, created from a String such as <code>new BigDecimal("0.10")</code>, with an explicit rounding mode; or store amounts as whole numbers of the smallest unit, such as paise or cents, in a <code>long</code>.`,
      },
    ],
  },

  'java-varargs': {
    whyItMatters: `Varargs lets a method accept any number of arguments without the caller building an array, which is how <code>String.format</code> and <code>List.of</code> work. It is convenient, but it has rules — one per method, last in the list — and it is the last choice in overload resolution, which can make a call pick a different method from the one you expected.`,
    exercise: {
      prompt: `Write <code>average(int... values)</code> so that it returns the average of its arguments as a double, and returns 0.0 when called with no arguments instead of dividing by zero.

Expected output: <code>4.0</code> then <code>0.0</code>`,
      starterCode: `public class Average {

    static double average(int... values) {
        // TODO: return 0.0 when there are no values
        // TODO: otherwise return the sum divided by the count, as a double
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(average(2, 4, 6));
        System.out.println(average());
    }
}`,
      hints: [
        'Inside the method, <code>values</code> is an ordinary <code>int[]</code>, so <code>values.length</code> tells you how many were passed.',
        'Cast the sum to double before dividing so the result is not truncated.',
      ],
      solution: `public class Average {

    static double average(int... values) {
        if (values.length == 0) {
            return 0.0;
        }
        int sum = 0;
        for (int value : values) {
            sum += value;
        }
        return (double) sum / values.length;
    }

    public static void main(String[] args) {
        System.out.println(average(2, 4, 6)); // 4.0
        System.out.println(average());        // 0.0
    }
}`,
    },
    quiz: [
      {
        question: 'Where must a varargs parameter appear in a method\'s parameter list?',
        options: ['First', 'Last', 'Anywhere', 'It must be the only parameter'],
        answer: 1,
        explanation: 'The varargs parameter collects all remaining arguments, so it has to come last.',
      },
      {
        question: 'How many varargs parameters can one method have?',
        options: ['One', 'Two', 'Any number', 'One per type'],
        answer: 0,
        explanation: 'Only one, since the compiler could not tell where one variable-length list ends and the next begins.',
      },
      {
        question: 'A method <code>sum(int... nums)</code> is called as <code>sum()</code>. What is <code>nums</code> inside the method?',
        options: ['null', 'An empty array of length 0', 'An array containing one 0', 'The call does not compile'],
        answer: 1,
        explanation: 'With no arguments the compiler passes an empty array, so nums.length is 0 and no null check is needed for this call.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do varargs interact with method overloading?',
        answer: `A varargs method is considered last. The compiler first tries to match without boxing or varargs, then with boxing, and only then with varargs. So if both <code>print(int a, int b)</code> and <code>print(int... values)</code> exist, the call <code>print(1, 2)</code> uses the two-parameter method.`,
      },
      {
        question: 'What is the difference between declaring a parameter as int... and as int[]?',
        answer: `Inside the method they are the same: both are an <code>int[]</code>. The difference is at the call site. With <code>int[]</code> the caller must create and pass an array. With <code>int...</code> the caller can pass an array, or list the values separated by commas, or pass nothing, and the compiler builds the array.`,
      },
    ],
  },

  'static-import': {
    whyItMatters: `A static import lets you write <code>sqrt(x)</code> instead of <code>Math.sqrt(x)</code>. It shortens code that uses the same static members repeatedly, which is why test code is full of statically imported assertions. Overused, it hides where a name comes from, so it is a readability decision more than a technical one.`,
    exercise: {
      prompt: `Rewrite this program with static imports so that <code>sqrt</code> and <code>max</code> are called without the <code>Math.</code> prefix. The output must stay the same.

Expected output: <code>4.0</code>`,
      starterCode: `public class StaticImportPractice {
    public static void main(String[] args) {
        double result = Math.sqrt(Math.max(16, 9));
        System.out.println(result);
    }
}`,
      hints: [
        'A static import names the class and the member: <code>import static java.lang.Math.sqrt;</code>',
        'Import statements go above the class, after any package declaration.',
      ],
      solution: `import static java.lang.Math.max;
import static java.lang.Math.sqrt;

public class StaticImportPractice {
    public static void main(String[] args) {
        double result = sqrt(max(16, 9));
        System.out.println(result); // 4.0
    }
}`,
    },
    quiz: [
      {
        question: 'Which statement correctly imports the constant PI so it can be used as <code>PI</code>?',
        options: ['import java.lang.Math.PI;', 'import static java.lang.Math.PI;', 'static import java.lang.Math.PI;', 'import Math.PI static;'],
        answer: 1,
        explanation: 'The keywords appear in the order import static, followed by the fully qualified class and member name.',
      },
      {
        question: 'What can a static import bring into scope?',
        options: ['Any class', 'Only static fields and static methods', 'Instance methods', 'Constructors'],
        answer: 1,
        explanation: 'A static import applies to static members of a class or interface. Instance members always need an object.',
      },
      {
        question: 'Two static imports bring in methods with the same name and parameters from different classes, and you call that name. What happens?',
        options: ['The first import wins', 'The last import wins', 'It does not compile because the call is ambiguous', 'Both methods are called'],
        answer: 2,
        explanation: 'The compiler cannot decide which method you mean, so the call is rejected until you qualify it with the class name.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between import and import static?',
        answer: `A normal <code>import</code> lets you refer to a class by its simple name, such as <code>List</code> instead of <code>java.util.List</code>. An <code>import static</code> lets you refer to a static member of a class without the class name, such as <code>PI</code> instead of <code>Math.PI</code>.`,
      },
      {
        question: 'When should you avoid static imports?',
        answer: `When they make it unclear where a name comes from. Wildcard static imports from several classes, or importing generic names such as <code>of</code> or <code>valueOf</code>, force the reader to hunt for the source. They suit a small number of well-known members used many times, such as constants or test assertions.`,
      },
    ],
  },

  'instanceof-and-downcasting': {
    whyItMatters: `When code holds a general reference but needs something only a specific subtype offers, it has to downcast, and a wrong cast fails at runtime with <code>ClassCastException</code>. <code>instanceof</code> is the check that makes the cast safe, and modern Java combines the check and the cast into one step.`,
    exercise: {
      prompt: `Write <code>describe(Object value)</code> using pattern matching for <code>instanceof</code>. A String returns <code>text of length N</code>, an Integer returns <code>number</code> followed by double its value, and anything else returns <code>unknown</code>. This needs Java 16 or newer.

Expected output: <code>text of length 5</code>, <code>number 42</code>, <code>unknown</code>`,
      starterCode: `public class Describe {

    static String describe(Object value) {
        // TODO: use "value instanceof String text" and "value instanceof Integer number"
        return "unknown";
    }

    public static void main(String[] args) {
        System.out.println(describe("hello"));
        System.out.println(describe(21));
        System.out.println(describe(3.5));
    }
}`,
      hints: [
        '<code>if (value instanceof String text)</code> tests the type and declares <code>text</code> already cast.',
        'The literal 21 is boxed to an Integer when passed as an Object, and 3.5 becomes a Double.',
      ],
      solution: `public class Describe {

    static String describe(Object value) {
        if (value instanceof String text) {
            return "text of length " + text.length();
        }
        if (value instanceof Integer number) {
            return "number " + (number * 2);
        }
        return "unknown";
    }

    public static void main(String[] args) {
        System.out.println(describe("hello")); // text of length 5
        System.out.println(describe(21));      // number 42
        System.out.println(describe(3.5));     // unknown
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>null instanceof String</code> evaluate to?',
        options: ['true', 'false', 'It throws NullPointerException', 'It does not compile'],
        answer: 1,
        explanation: 'instanceof is false for null, whatever the type, so it also serves as a null check.',
      },
      {
        question: 'An <code>Animal</code> variable refers to a <code>Cat</code> object. What happens with <code>(Dog) animal</code>?',
        options: ['It returns null', 'It throws ClassCastException at runtime', 'It does not compile', 'It converts the Cat into a Dog'],
        answer: 1,
        explanation: 'The cast compiles because an Animal might be a Dog, but at runtime the object is a Cat, so the JVM throws ClassCastException.',
      },
      {
        question: 'With <code>String s = "x";</code>, what happens with <code>s instanceof Integer</code>?',
        options: ['It is false', 'It is true', 'It does not compile', 'It throws at runtime'],
        answer: 2,
        explanation: 'String and Integer are unrelated classes, so a String can never be an Integer. The compiler rejects the test as impossible.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between upcasting and downcasting?',
        answer: `Upcasting treats an object as one of its supertypes, such as a Dog as an Animal. It is always safe and happens implicitly. Downcasting goes the other way, from a general reference to a more specific type. It needs an explicit cast and can fail at runtime with <code>ClassCastException</code> if the object is not really of that type, so it should be guarded with <code>instanceof</code>.`,
      },
      {
        question: 'What does pattern matching for instanceof improve?',
        answer: `It combines the type test, the cast and the variable declaration. Instead of checking <code>obj instanceof String</code> and then writing <code>String s = (String) obj</code>, you write <code>obj instanceof String s</code>. That removes the repeated type name and the chance of casting to a different type from the one you tested.`,
      },
    ],
  },

  'nested-and-inner-classes': {
    whyItMatters: `Nested classes keep a helper type next to the only class that uses it, and anonymous classes were how Java passed behaviour around before lambdas — you still read them in older code every day. The key distinction is whether the nested class is static: a non-static inner class silently holds a reference to its outer object, which is a common cause of memory leaks.`,
    exercise: {
      prompt: `Sort the names by length, shortest first, by passing an anonymous class that implements <code>Comparator&lt;String&gt;</code> to <code>Arrays.sort</code>.

Expected output: <code>[Al, Ravi, Meera]</code>`,
      starterCode: `import java.util.Arrays;
import java.util.Comparator;

public class SortByLength {
    public static void main(String[] args) {
        String[] names = {"Meera", "Al", "Ravi"};

        // TODO: sort names with an anonymous Comparator that compares lengths

        System.out.println(Arrays.toString(names));
    }
}`,
      hints: [
        'An anonymous class is written as <code>new Comparator&lt;String&gt;() { ... }</code> with the method inside the braces.',
        '<code>Integer.compare(a.length(), b.length())</code> returns the negative, zero or positive value a comparator needs.',
      ],
      solution: `import java.util.Arrays;
import java.util.Comparator;

public class SortByLength {
    public static void main(String[] args) {
        String[] names = {"Meera", "Al", "Ravi"};

        Arrays.sort(names, new Comparator<String>() {
            @Override
            public int compare(String a, String b) {
                return Integer.compare(a.length(), b.length());
            }
        });

        System.out.println(Arrays.toString(names)); // [Al, Ravi, Meera]
    }
}`,
    },
    quiz: [
      {
        question: 'How do you create an instance of a non-static inner class <code>Inner</code> from outside its outer class?',
        options: ['new Inner()', 'outerObject.new Inner()', 'Outer.new Inner()', 'new Outer.Inner() without an outer object'],
        answer: 1,
        explanation: 'An inner class instance is tied to an outer object, so it is created through one: outerObject.new Inner().',
      },
      {
        question: 'Can a static nested class use the instance fields of its outer class directly?',
        options: ['Yes', 'No, it has no outer object; it needs an explicit reference', 'Only private fields', 'Only final fields'],
        answer: 1,
        explanation: 'A static nested class is not attached to an outer instance, so it can only reach instance members through an object you give it.',
      },
      {
        question: 'Can an anonymous class declare a constructor?',
        options: ['Yes', 'No, because it has no name', 'Only a no-argument constructor', 'Only if it extends a class'],
        answer: 1,
        explanation: 'A constructor must be named after its class, and an anonymous class has no name. It can use an instance initializer block instead.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the types of nested class in Java?',
        answer: `Four. A static nested class is declared <code>static</code> inside another class and does not need an outer object. An inner (member) class is non-static and belongs to an instance of the outer class. A local class is declared inside a method. An anonymous class is declared and instantiated in one expression, with no name.`,
      },
      {
        question: 'Why is a static nested class usually preferred over an inner class?',
        answer: `An inner class instance keeps a hidden reference to the outer object that created it. If the inner object lives longer than expected — stored in a collection, or passed to another thread — it keeps the outer object from being garbage collected. A static nested class has no such reference, so use it unless the nested class really needs the outer object's state.`,
      },
    ],
  },

  'nested-interfaces-in-java': {
    whyItMatters: `A nested interface is an interface declared inside a class or another interface, used when it only makes sense in that context. You use one every time you loop over a map: <code>Map.Entry</code>. The same pattern appears in callback and listener APIs, so recognising the <code>Outer.Inner</code> name is part of reading library code.`,
    exercise: {
      prompt: `Loop over the entries of the map and print each one as <code>key=value</code>, using the nested interface <code>Map.Entry</code>.

Expected output: <code>apple=3</code> then <code>banana=5</code>`,
      starterCode: `import java.util.Map;
import java.util.TreeMap;

public class EntryLoop {
    public static void main(String[] args) {
        Map<String, Integer> stock = new TreeMap<>();
        stock.put("banana", 5);
        stock.put("apple", 3);

        // TODO: loop over stock.entrySet() and print key=value for each entry
    }
}`,
      hints: [
        'Each element of <code>entrySet()</code> has the type <code>Map.Entry&lt;String, Integer&gt;</code>.',
        'An entry gives you <code>getKey()</code> and <code>getValue()</code>. A TreeMap iterates in key order.',
      ],
      solution: `import java.util.Map;
import java.util.TreeMap;

public class EntryLoop {
    public static void main(String[] args) {
        Map<String, Integer> stock = new TreeMap<>();
        stock.put("banana", 5);
        stock.put("apple", 3);

        for (Map.Entry<String, Integer> entry : stock.entrySet()) {
            System.out.println(entry.getKey() + "=" + entry.getValue());
        }
    }
}`,
    },
    quiz: [
      {
        question: 'An interface declared inside another interface is implicitly what?',
        options: ['private', 'public and static', 'protected', 'abstract and final'],
        answer: 1,
        explanation: 'Members of an interface are public, and a nested interface is always static.',
      },
      {
        question: 'Which of these is a well-known nested interface in the JDK?',
        options: ['Runnable', 'Map.Entry', 'Comparable', 'Serializable'],
        answer: 1,
        explanation: 'Entry is declared inside the Map interface and represents one key-value pair.',
      },
      {
        question: 'A class <code>Button</code> declares a nested interface <code>Listener</code>. How does another class refer to it?',
        options: ['Listener.Button', 'Button.Listener', 'Button::Listener', 'Button->Listener'],
        answer: 1,
        explanation: 'A nested type is referred to through its enclosing type with a dot: Button.Listener.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why would you nest an interface inside a class or another interface?',
        answer: `To show that it belongs to that type and has no meaning on its own. <code>Map.Entry</code> only makes sense as part of a map, and a <code>Button.Listener</code> only as a callback for that button. Nesting groups related types, keeps the top-level namespace smaller, and makes the relationship obvious from the name.`,
      },
    ],
  },

  'method-overloading-vs-method-overriding-a-comparison': {
    whyItMatters: `Overloading and overriding sound alike and are constantly confused, but they are resolved at different times by different rules: one by the compiler from the declared argument types, the other by the JVM from the actual object. Mixing them up leads to code where the method you expected is never called, and it is one of the most reliable interview questions in Java.`,
    exercise: {
      prompt: `This program prints <code>Object</code>, even though the value is a String, because overloads are chosen from the declared type of the argument. Change only the declaration of <code>value</code> so that it prints <code>String</code>.`,
      starterCode: `public class OverloadChoice {

    static String describe(Object value) {
        return "Object";
    }

    static String describe(String value) {
        return "String";
    }

    public static void main(String[] args) {
        Object value = "hello";
        System.out.println(describe(value));
    }
}`,
      hints: [
        'The compiler picks the overload when it compiles the call, using the type the variable was declared with.',
        'The object is a String at runtime, but the variable is declared as <code>Object</code>.',
      ],
      solution: `public class OverloadChoice {

    static String describe(Object value) {
        return "Object";
    }

    static String describe(String value) {
        return "String";
    }

    public static void main(String[] args) {
        String value = "hello";
        System.out.println(describe(value)); // String
    }
}`,
    },
    quiz: [
      {
        question: 'What must differ between two overloaded methods?',
        options: ['The return type', 'The parameter list', 'The access modifier', 'The method name'],
        answer: 1,
        explanation: 'Overloads share a name and must differ in the number or types of their parameters.',
      },
      {
        question: 'Where does overriding take place?',
        options: ['Within a single class', 'In a subclass, replacing a method inherited from its parent', 'Between unrelated classes', 'Only in interfaces'],
        answer: 1,
        explanation: 'Overriding needs inheritance: the subclass provides its own version of a method with the same signature.',
      },
      {
        question: 'Which of the two allows a completely different return type?',
        options: ['Overriding', 'Overloading', 'Both', 'Neither'],
        answer: 1,
        explanation: 'Overloaded methods are separate methods and may return anything. An override must return the same type or a subtype.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the main differences between overloading and overriding?',
        answer: `Overloading: same method name, different parameter lists, usually in the same class, resolved at compile time from the argument types, and the return type and access level are free to differ. Overriding: same name and parameters in a subclass, resolved at runtime from the actual object, and the return type, access level and checked exceptions are all constrained by the parent method.`,
      },
      {
        question: 'Can the same method be both overloaded and overridden?',
        answer: `Yes. A class can declare several overloads of a method, and a subclass can override any of them individually. Each overload is a separate method, so overriding one does not affect the others. A subclass can also add a new overload of an inherited method, which does not override anything.`,
      },
    ],
  },
}
