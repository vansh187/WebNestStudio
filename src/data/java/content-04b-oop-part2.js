// Java OOP Part 2 module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content04bOopPart2 = {
  'abstraction-and-abstract-classes': {
    title: 'Abstraction and Abstract Classes',
    intro: `Abstraction means exposing only the essential behavior of an object while hiding the internal implementation details. In Java, abstraction is achieved primarily through abstract classes and interfaces, both of which let you define "what" an object can do without necessarily specifying "how" every part of it works.

An abstract class is a class declared with the <code>abstract</code> keyword that cannot be instantiated on its own. It exists to be extended, providing a partial implementation that subclasses complete or override.`,
    sections: [
      {
        heading: 'Declaring an Abstract Class',
        body: `An abstract class can contain a mix of abstract methods (declared without a body, ending in a semicolon) and concrete methods (with a full implementation). It can also have constructors, fields, and static methods, even though it can never be instantiated directly with <code>new</code>.`,
        list: [
          'An abstract class is declared with the <code>abstract</code> keyword before <code>class</code>.',
          'It can have zero or more abstract methods — even zero is legal, though unusual.',
          'It can have fully implemented (concrete) methods that subclasses inherit as-is.',
          'You cannot write <code>new AbstractClassName()</code>; the compiler rejects it.',
        ],
      },
      {
        heading: 'Extending an Abstract Class',
        body: `A concrete (non-abstract) subclass must implement every abstract method it inherits, or the compiler forces it to also be declared abstract. This guarantees that by the time an object is actually created, every abstract method has a real implementation somewhere in the hierarchy.`,
      },
      {
        heading: 'Why Use Abstraction',
        body: `Abstract classes let you share common code and fields across related classes while still forcing each subclass to supply its own specific behavior for the parts that must differ. This keeps a common contract in one place instead of duplicating it, and lets you write code against the abstract type so it works with any future subclass.`,
      },
    ],
    examples: [
      {
        caption: 'An abstract class mixing a concrete method and an abstract method',
        code: `abstract class Shape {
    String name;

    Shape(String name) {
        this.name = name;
    }

    // Concrete method — shared by every subclass
    void describe() {
        System.out.println(name + " has area " + area());
    }

    // Abstract method — each subclass must define this
    abstract double area();
}

class Circle extends Shape {
    double radius;

    Circle(double radius) {
        super("Circle");
        this.radius = radius;
    }

    @Override
    double area() {
        return Math.PI * radius * radius;
    }
}

public class AbstractionDemo {
    public static void main(String[] args) {
        Shape s = new Circle(2.0);
        s.describe();
    }
}`,
        output: 'Circle has area 12.566370614359172',
      },
    ],
    commonMistakes: [
      'Trying to instantiate an abstract class directly with new — this always fails to compile.',
      'Forgetting to implement even one inherited abstract method in a concrete subclass, which forces that subclass to also be declared abstract.',
      'Assuming an abstract class cannot have a constructor — it can, and subclasses call it via super().',
      'Marking a class abstract but never actually adding any abstract methods, then wondering why it "does nothing special."',
    ],
    keyPoints: [
      'Abstract classes cannot be instantiated but can be extended.',
      'They may contain both abstract methods (no body) and concrete methods (full implementation).',
      'A concrete subclass must implement all inherited abstract methods.',
      'Abstraction hides implementation details and exposes only the essential contract.',
    ],
  },

  'interfaces-in-java': {
    title: 'Interfaces in Java',
    intro: `An interface in Java is a fully abstract contract: it defines a set of methods a class promises to implement, without dictating how. Interfaces are declared with the <code>interface</code> keyword, and a class agrees to that contract using the <code>implements</code> keyword.

Modern Java interfaces are more flexible than they used to be. Beyond plain abstract method signatures, interfaces can now include default methods, static methods, and constants — while still never holding instance state of their own.`,
    sections: [
      {
        heading: 'Interface Members',
        body: `Every field declared in an interface is implicitly <code>public static final</code>, whether or not you write those modifiers — interfaces cannot hold per-instance state. Methods without a body are implicitly <code>public abstract</code>.`,
        list: [
          '<strong>Abstract methods</strong> — no body; any implementing class must provide one.',
          '<strong>Default methods</strong> — declared with the <code>default</code> keyword and a body, providing a fallback implementation that implementing classes may override.',
          '<strong>Static methods</strong> — declared with <code>static</code> and called on the interface itself, e.g. <code>Comparator.naturalOrder()</code>.',
          '<strong>Constants</strong> — fields are always <code>public static final</code> automatically.',
        ],
      },
      {
        heading: 'Implementing Multiple Interfaces',
        body: `Java classes can only extend one superclass, but they can implement any number of interfaces, separated by commas: <code>class Duck implements Flyable, Swimmable</code>. This is how Java achieves a safe form of "multiple inheritance of type" without the ambiguity problems C++ faces with multiple inheritance of implementation.`,
      },
      {
        heading: 'Default Methods and Diamond Conflicts',
        body: `If a class implements two interfaces that each declare a default method with the same signature, the compiler forces the class to override that method explicitly and resolve the conflict — it will not guess which default to use. This keeps default methods from silently reintroducing the classic diamond problem.`,
      },
    ],
    examples: [
      {
        caption: 'An interface with an abstract method, a default method, and a static method',
        code: `interface Vehicle {
    int MAX_SPEED = 180; // implicitly public static final

    void start(); // implicitly public abstract

    default void honk() {
        System.out.println("Beep beep!");
    }

    static Vehicle basic() {
        return () -> System.out.println("Basic vehicle starting");
    }
}

public class InterfaceDemo implements Vehicle {
    @Override
    public void start() {
        System.out.println("Vehicle starting, max speed " + MAX_SPEED);
    }

    public static void main(String[] args) {
        InterfaceDemo v = new InterfaceDemo();
        v.start();
        v.honk();
        Vehicle.basic().start();
    }
}`,
        output: `Vehicle starting, max speed 180
Beep beep!
Basic vehicle starting`,
      },
    ],
    commonMistakes: [
      'Trying to declare an instance field in an interface expecting per-object state — all interface fields are implicitly static and shared.',
      'Forgetting that interface methods without a body are implicitly public, then marking one "protected" or "private" by mistake and hitting a compile error.',
      'Not resolving a default method conflict when a class implements two interfaces that share a default method signature.',
      'Confusing "implements" (for interfaces) with "extends" (for classes) — a class extends at most one class but implements as many interfaces as needed.',
    ],
    keyPoints: [
      'Interface fields are always public static final; abstract methods are always public abstract.',
      'default and static methods let interfaces carry real behavior, not just signatures.',
      'A class can implement multiple interfaces, enabling safe multiple inheritance of type.',
      'Conflicting default methods from two interfaces must be resolved explicitly in the implementing class.',
    ],
  },

  'abstract-class-vs-interface': {
    title: 'Abstract Class vs Interface',
    intro: `Abstract classes and interfaces both support abstraction, and modern Java has narrowed the gap between them, but they still serve different design purposes. Choosing the right one is a common real-world design decision, not just a syntax choice.`,
    sections: [
      {
        heading: 'Side-by-Side Comparison',
        body: `The table below highlights the practical differences that matter most when deciding between them.`,
        list: [
          '<strong>Inheritance:</strong> a class can extend only one abstract class, but can implement many interfaces.',
          '<strong>State:</strong> an abstract class can hold instance fields with any access modifier; an interface can only hold implicit <code>public static final</code> constants.',
          '<strong>Constructors:</strong> abstract classes can have constructors (called via <code>super()</code>); interfaces cannot have constructors at all.',
          '<strong>Method access:</strong> abstract classes can mix public, protected, and private methods; interface methods are public by default (default/static methods can be private since Java 9, but never protected).',
          '<strong>Purpose:</strong> abstract classes model an "is-a" relationship with shared implementation; interfaces model a "can-do" capability contract.',
        ],
      },
      {
        heading: 'When to Choose Which',
        body: `Prefer an abstract class when related classes share meaningful common state or code and naturally belong to one hierarchy — for example, <code>Animal</code> as a base for <code>Dog</code> and <code>Cat</code>. Prefer an interface when unrelated classes need to promise the same capability regardless of their place in the hierarchy — for example, both a <code>Car</code> and a <code>Duck</code> can be <code>Movable</code>, even though they share no common ancestor otherwise.`,
      },
      {
        heading: 'They Can Work Together',
        body: `These two tools are not mutually exclusive. An abstract class can implement one or more interfaces and leave some or all of those interface methods unimplemented for its own subclasses to finish, combining shared base behavior with a flexible capability contract.`,
      },
    ],
    examples: [
      {
        caption: 'An abstract class providing shared state, implementing an interface for a capability',
        code: `interface Movable {
    void move();
}

abstract class Animal implements Movable {
    String name;

    Animal(String name) {
        this.name = name;
    }

    abstract String sound();
}

class Dog extends Animal {
    Dog(String name) {
        super(name);
    }

    @Override
    public void move() {
        System.out.println(name + " runs on four legs");
    }

    @Override
    String sound() {
        return "Woof";
    }
}

public class ComparisonDemo {
    public static void main(String[] args) {
        Dog d = new Dog("Rex");
        d.move();
        System.out.println(d.name + " says " + d.sound());
    }
}`,
        output: `Rex runs on four legs
Rex says Woof`,
      },
    ],
    commonMistakes: [
      'Choosing an abstract class purely out of habit when unrelated classes just need a shared capability — an interface fits better there.',
      'Assuming interfaces cannot have any method bodies at all — default and static methods have proven this wrong since Java 8.',
      'Trying to give an interface a constructor or instance field, which is not allowed under any circumstance.',
      'Forgetting that a class extends only one abstract class but can implement several interfaces at once.',
    ],
    keyPoints: [
      'Abstract classes support shared state, constructors, and mixed access levels; interfaces do not.',
      'A class extends one abstract class but can implement many interfaces.',
      'Abstract classes model "is-a" relationships; interfaces model "can-do" capabilities.',
      'An abstract class can implement interfaces, combining both tools in one hierarchy.',
    ],
  },

  encapsulation: {
    title: 'Encapsulation',
    intro: `Encapsulation is the practice of bundling data (fields) and the code that operates on that data (methods) into a single unit — a class — while restricting direct outside access to that data. In Java, encapsulation is achieved by declaring fields <code>private</code> and exposing controlled access through <code>public</code> getter and setter methods.

This is sometimes described as "data hiding," but its real value is control: encapsulation lets a class validate, transform, or log every read or write to its data, and lets the internal representation change later without breaking code that depends on the class.`,
    sections: [
      {
        heading: 'The Standard Pattern',
        body: `A well-encapsulated class declares its fields <code>private</code> so no outside code can read or modify them directly, then provides public methods — conventionally named <code>getFieldName()</code> and <code>setFieldName(value)</code> — as the only way in or out. Setters can validate input before accepting it, and a class can even omit a setter entirely to make a field effectively read-only after construction.`,
        list: [
          'Declare fields as <code>private</code>.',
          'Provide <code>public</code> getter methods to read values.',
          'Provide <code>public</code> setter methods to write values, with validation if needed.',
          'Omit a setter (or make it private) for a field that should never change after construction.',
        ],
      },
      {
        heading: 'Why It Matters',
        body: `Without encapsulation, any code anywhere in a program could set a field to an invalid value, such as a negative age or an empty required name, with no chance for the class to object. With encapsulation, invalid data can be rejected at a single, well-defined entry point, and the internal storage format (a single field, a computed value, a different type) can be reworked later without changing the public API that other code relies on.`,
      },
    ],
    examples: [
      {
        caption: 'A BankAccount class enforcing rules through encapsulation',
        code: `public class BankAccount {
    private double balance;

    public BankAccount(double initialBalance) {
        this.balance = Math.max(initialBalance, 0);
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount(100.0);
        account.deposit(50.0);
        boolean success = account.withdraw(500.0); // rejected, insufficient funds
        System.out.println("Withdraw succeeded: " + success);
        System.out.println("Balance: " + account.getBalance());
    }
}`,
        output: `Withdraw succeeded: false
Balance: 150.0`,
      },
    ],
    commonMistakes: [
      'Making fields public "just to save time," which removes all validation and lets any code corrupt the object\'s state.',
      'Writing getters and setters for every field automatically without asking whether a field should be writable, or even readable, from outside the class.',
      'Putting no logic in setters at all, which reduces encapsulation to a naming convention rather than real protection.',
      'Returning a direct reference to a mutable private field (like an array or List) from a getter, which lets outside code modify it without going through any setter.',
    ],
    keyPoints: [
      'Encapsulation combines private fields with public getters/setters to control access.',
      'It allows validation of data on write and protects internal representation from outside code.',
      'A field can be made read-only by simply not providing a setter.',
      'Returning mutable internals directly from a getter can silently break encapsulation.',
    ],
  },

  'packages-and-access-modifiers': {
    title: 'Packages and Access Modifiers',
    intro: `A package is a namespace that groups related classes and interfaces together, similar to a folder structure. Packages prevent naming collisions (two classes can both be named <code>Utils</code> if they live in different packages) and provide the boundary that Java's access modifiers use to control visibility.

Java offers exactly four access levels, and only one of them — <code>default</code> — has no keyword at all; it is simply what you get by omitting a modifier.`,
    sections: [
      {
        heading: 'Declaring and Using Packages',
        body: `A package declaration, if present, must be the very first non-comment line in a source file: <code>package com.webnest.util;</code>. Classes in other packages access it with an <code>import</code> statement, such as <code>import com.webnest.util.Helper;</code>, or by using the fully qualified name inline.`,
      },
      {
        heading: 'The Four Access Modifiers',
        body: `Each modifier controls visibility at a different scope, from the most restrictive to the most open.`,
        list: [
          '<strong>private</strong> — accessible only within the same class.',
          '<strong>default (package-private)</strong> — no keyword; accessible within the same package only.',
          '<strong>protected</strong> — accessible within the same package, plus subclasses in other packages (through inheritance).',
          '<strong>public</strong> — accessible from anywhere, in any package.',
        ],
      },
      {
        heading: 'Visibility Table',
        body: `The relationship between modifier and accessible scope is fixed and worth memorizing exactly.`,
        list: [
          '<code>private</code>: same class only.',
          '<code>default</code>: same class, same package.',
          '<code>protected</code>: same class, same package, subclass (even in a different package).',
          '<code>public</code>: same class, same package, subclass, and any other package.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A package-private helper class used only within its own package',
        code: `package com.webnest.util;

class InternalHelper { // package-private (default) class, not visible outside this package
    static int square(int n) {
        return n * n;
    }
}

public class MathTool {
    public static int squareOfSum(int a, int b) {
        return InternalHelper.square(a + b);
    }

    public static void main(String[] args) {
        System.out.println(MathTool.squareOfSum(2, 3));
    }
}`,
        output: '25',
      },
    ],
    commonMistakes: [
      'Assuming "default" access means "public by default" — it actually means restricted to the same package, which is more limited than public.',
      'Marking a field protected expecting only subclasses to see it, forgetting protected also grants access to every class in the same package.',
      'Placing two unrelated top-level public classes in one file, which is not allowed — only one public top-level class per file.',
      'Forgetting to import a class from another package and expecting the fully qualified name and the simple name to be interchangeable without an import.',
    ],
    keyPoints: [
      'Packages group related types and prevent name collisions; the package declaration must be the first line.',
      'Four access levels exist: private, default (package-private), protected, and public.',
      'protected extends package access to subclasses in other packages as well.',
      'public is the only modifier that grants access from completely unrelated packages.',
    ],
  },

  'java-final-keyword': {
    title: 'Java final Keyword',
    intro: `The <code>final</code> keyword in Java means "this cannot be changed further," but what exactly gets locked down depends on where it is applied: a variable, a method, or a class. All three uses share the same underlying idea of preventing modification after the fact, applied at three different levels.`,
    sections: [
      {
        heading: 'final Variable — a Constant',
        body: `A <code>final</code> variable can be assigned a value exactly once. For a primitive, that means its value can never change afterward; for a reference type, it means the variable can never be reassigned to point at a different object, although the object it points to can still be mutated internally if that object itself is mutable. By convention, <code>final</code> constants are named in <code>UPPER_SNAKE_CASE</code>.`,
      },
      {
        heading: 'final Method — Cannot Be Overridden',
        body: `A <code>final</code> method can be inherited and called by subclasses, but it cannot be overridden. This is useful when a superclass needs to guarantee that a piece of logic behaves identically in every subclass, such as a security check or a core algorithm step that must not be altered.`,
      },
      {
        heading: 'final Class — Cannot Be Extended',
        body: `A <code>final</code> class cannot be subclassed at all; attempting <code>extends</code> on it is a compile-time error. The standard library uses this for classes whose behavior must never be altered by inheritance — <code>String</code>, <code>Integer</code>, and the other wrapper classes are all declared final.`,
      },
    ],
    examples: [
      {
        caption: 'final applied to a variable, a method, and a class in one hierarchy',
        code: `class Payment {
    static final double TAX_RATE = 0.08; // final variable, a constant

    final double totalWithTax(double amount) { // final method, cannot be overridden
        return amount + (amount * TAX_RATE);
    }
}

final class CreditCardPayment extends Payment {
    // final class — CreditCardPayment itself cannot be extended further
}

public class FinalDemo {
    public static void main(String[] args) {
        CreditCardPayment payment = new CreditCardPayment();
        System.out.println(payment.totalWithTax(100.0));
    }
}`,
        output: '108.0',
      },
    ],
    commonMistakes: [
      'Trying to reassign a final variable after its first assignment, which is always a compile error.',
      'Assuming a final reference variable makes the object it points to immutable — final only locks the reference, not the object\'s internal state.',
      'Attempting to override a final method in a subclass and being surprised by a compile-time error rather than a runtime one.',
      'Trying to extend a final class such as String, which the compiler rejects outright.',
    ],
    keyPoints: [
      'final on a variable means single assignment, effectively a constant.',
      'final on a method prevents subclasses from overriding it.',
      'final on a class prevents any subclassing at all.',
      'A final reference still allows the referenced object\'s own fields to change.',
    ],
  },

  'object-class-and-its-methods': {
    title: 'Object Class and Its Methods',
    intro: `Every class in Java, whether you write <code>extends</code> explicitly or not, ultimately extends <code>java.lang.Object</code>. This makes Object the root of the entire class hierarchy, and it guarantees that every Java object automatically inherits a small set of universally useful methods.`,
    sections: [
      {
        heading: 'Core Methods Inherited from Object',
        body: `A handful of Object methods are overridden constantly in everyday Java code, because their default behavior is rarely what a class actually needs.`,
        list: [
          '<code>toString()</code> — returns a String representation of the object; the default prints the class name plus a hash code in hex, which is rarely useful and almost always worth overriding.',
          '<code>equals(Object obj)</code> — compares two objects for logical equality; the default implementation only checks reference identity (the same object in memory).',
          '<code>hashCode()</code> — returns an integer used by hash-based collections like HashMap and HashSet to bucket objects efficiently.',
          '<code>getClass()</code> — returns the runtime Class object representing the object\'s actual class, useful for reflection and type checks.',
        ],
      },
      {
        heading: 'The equals() and hashCode() Contract',
        body: `Java requires a strict rule: if two objects are equal according to <code>equals()</code>, they must return the same value from <code>hashCode()</code>. The reverse is not required — equal hash codes do not imply the objects are equal (that is simply a hash collision). Breaking this contract by overriding one method but not the other causes subtle bugs where an object that "equals" another cannot be found in a HashMap or HashSet, because it lands in the wrong bucket.`,
      },
      {
        heading: 'Overriding These Methods Correctly',
        body: `When you override <code>equals()</code>, you should also override <code>hashCode()</code> using the same fields that participate in the equality check, so the contract holds. Most IDEs and the <code>java.util.Objects</code> helper class (<code>Objects.equals()</code>, <code>Objects.hash()</code>) make this straightforward and less error-prone than writing it by hand.`,
      },
    ],
    examples: [
      {
        caption: 'Overriding toString, equals, and hashCode consistently on a Point class',
        code: `import java.util.Objects;

class Point {
    int x, y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public String toString() {
        return "Point(" + x + ", " + y + ")";
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Point)) return false;
        Point other = (Point) obj;
        return x == other.x && y == other.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}

public class ObjectMethodsDemo {
    public static void main(String[] args) {
        Point p1 = new Point(1, 2);
        Point p2 = new Point(1, 2);
        System.out.println(p1);
        System.out.println(p1.equals(p2));
        System.out.println(p1.hashCode() == p2.hashCode());
        System.out.println(p1.getClass().getName());
    }
}`,
        output: `Point(1, 2)
true
true
Point`,
      },
    ],
    commonMistakes: [
      'Overriding equals() without also overriding hashCode(), which silently breaks HashMap and HashSet lookups.',
      'Using "==" to compare object content instead of equals() — "==" checks reference identity, not logical equality.',
      'Forgetting to check "obj instanceof Point" (or a null check) inside equals(), risking a ClassCastException or NullPointerException.',
      'Relying on the default toString() output in logs or debugging instead of overriding it with meaningful field values.',
    ],
    keyPoints: [
      'Every class implicitly extends Object and inherits toString(), equals(), hashCode(), and getClass().',
      'The default equals() checks reference identity only; override it for logical equality.',
      'Equal objects (by equals()) must produce equal hashCode() values.',
      'Objects.equals() and Objects.hash() simplify writing correct, contract-respecting overrides.',
    ],
  },

  'object-cloning': {
    title: 'Object Cloning',
    intro: `Object cloning creates a new object that is a copy of an existing one, rather than a new reference to the same object. Java supports this through the <code>clone()</code> method inherited from Object, combined with the <code>Cloneable</code> marker interface, though this mechanism is widely considered one of the more awkward corners of the language.`,
    sections: [
      {
        heading: 'Shallow Cloning',
        body: `The default <code>Object.clone()</code> performs a shallow copy: it copies each field's value directly. For primitive fields, this copies the actual value. For reference fields (like an array or another object), it copies only the reference itself — so the clone and the original end up pointing at the same underlying object. Modifying that shared object through one reference is visible through the other.`,
      },
      {
        heading: 'Deep Cloning',
        body: `A deep copy duplicates not just the top-level object but every mutable object it references, recursively, so the clone shares no mutable state with the original. Java does not do this automatically; you must implement it yourself, typically by manually cloning each mutable field inside an overridden <code>clone()</code> method.`,
      },
      {
        heading: 'The Cloneable Interface and Its Pitfalls',
        body: `<code>Cloneable</code> is a marker interface — it declares no methods at all. Its only job is to tell <code>Object.clone()</code> that cloning is permitted for this class; calling <code>clone()</code> on a class that does not implement Cloneable throws <code>CloneNotSupportedException</code> at runtime. This design (a marker interface silently changing another method's behavior, plus a checked exception) is widely seen as a design mistake, which is why many modern Java codebases avoid <code>clone()</code> entirely and use copy constructors or factory methods instead.`,
      },
    ],
    examples: [
      {
        caption: 'Shallow clone sharing a mutable array field between original and copy',
        code: `import java.util.Arrays;

class Team implements Cloneable {
    String name;
    int[] scores;

    Team(String name, int[] scores) {
        this.name = name;
        this.scores = scores;
    }

    @Override
    public Team clone() throws CloneNotSupportedException {
        return (Team) super.clone(); // shallow copy
    }
}

public class CloningDemo {
    public static void main(String[] args) throws CloneNotSupportedException {
        Team original = new Team("Alpha", new int[]{10, 20, 30});
        Team copy = original.clone();

        copy.name = "Beta";       // independent, primitive-like String reassignment
        copy.scores[0] = 999;     // mutates the shared array!

        System.out.println(original.name + " " + Arrays.toString(original.scores));
        System.out.println(copy.name + " " + Arrays.toString(copy.scores));
    }
}`,
        output: `Alpha [999, 20, 30]
Beta [999, 20, 30]`,
      },
    ],
    commonMistakes: [
      'Calling clone() on a class that does not implement Cloneable and being surprised by a CloneNotSupportedException at runtime.',
      'Assuming clone() always produces a fully independent copy — the default is shallow, so shared mutable fields still alias each other.',
      'Forgetting to manually deep-copy mutable reference fields (arrays, lists, custom objects) inside an overridden clone() when independence is required.',
      'Reaching for clone() at all in new code instead of a copy constructor or a static factory method, which most modern style guides prefer.',
    ],
    keyPoints: [
      'Shallow cloning copies field values, but reference fields still point to the same shared objects.',
      'Deep cloning requires manually copying every mutable referenced object as well.',
      'Cloneable is a marker interface with no methods; without it, clone() throws CloneNotSupportedException.',
      'Copy constructors or static factory methods are a commonly preferred alternative to clone().',
    ],
  },

  'wrapper-classes': {
    title: 'Wrapper Classes',
    intro: `Every Java primitive type has a corresponding wrapper class that represents that value as a full object: <code>byte</code>→<code>Byte</code>, <code>short</code>→<code>Short</code>, <code>int</code>→<code>Integer</code>, <code>long</code>→<code>Long</code>, <code>float</code>→<code>Float</code>, <code>double</code>→<code>Double</code>, <code>char</code>→<code>Character</code>, and <code>boolean</code>→<code>Boolean</code>. Wrapper classes let primitive values participate in APIs that require objects, such as collections like <code>ArrayList&lt;Integer&gt;</code>, which cannot hold raw primitives.`,
    sections: [
      {
        heading: 'Autoboxing and Unboxing',
        body: `Autoboxing is the compiler's automatic conversion of a primitive into its wrapper object (<code>int</code> → <code>Integer</code>), and unboxing is the reverse (<code>Integer</code> → <code>int</code>). Both happen implicitly wherever needed, such as adding an <code>int</code> to a <code>List&lt;Integer&gt;</code> or using an <code>Integer</code> in an arithmetic expression — the compiler inserts the conversion calls for you behind the scenes.`,
      },
      {
        heading: 'The Integer Caching Gotcha',
        body: `Java caches <code>Integer</code> objects for values from -128 to 127 (and similarly caches small values for other integer wrapper types). When autoboxing a value in that range, Java may return the same cached object rather than creating a new one, so comparing two boxed values with <code>==</code> in that range can appear to work by coincidence. Outside that range, autoboxing creates new distinct objects, so <code>==</code> comparisons stop matching even for equal values — which is exactly why <code>.equals()</code>, not <code>==</code>, should always be used to compare wrapper objects.`,
      },
      {
        heading: 'Useful Wrapper Class Methods',
        body: `Wrapper classes also carry parsing and conversion utilities, such as <code>Integer.parseInt(String)</code>, <code>Double.parseDouble(String)</code>, <code>Integer.MAX_VALUE</code>/<code>MIN_VALUE</code> constants, and <code>Integer.toBinaryString(int)</code>, making them the natural home for type-specific helper logic that a raw primitive cannot carry.`,
      },
    ],
    examples: [
      {
        caption: 'Autoboxing, unboxing, and the Integer caching gotcha with == vs equals()',
        code: `public class WrapperDemo {
    public static void main(String[] args) {
        int primitive = 100;
        Integer boxed = primitive;       // autoboxing
        int unboxed = boxed;             // unboxing
        System.out.println(unboxed);

        Integer a = 100;
        Integer b = 100;
        System.out.println(a == b);      // true: both within cached range -128..127

        Integer c = 200;
        Integer d = 200;
        System.out.println(c == d);      // false: outside cached range, different objects
        System.out.println(c.equals(d)); // true: equals() compares actual value
    }
}`,
        output: `100
true
false
true`,
      },
    ],
    commonMistakes: [
      'Comparing wrapper objects with == expecting value comparison — it compares references, and only appears to "work" inside the cached -128 to 127 range.',
      'Unboxing a null wrapper reference (e.g. a null Integer used in arithmetic), which throws a NullPointerException at runtime.',
      'Repeatedly autoboxing/unboxing inside performance-critical loops without realizing each operation allocates a wrapper object, adding overhead.',
      'Forgetting that primitive char autoboxes to Character, not to a numeric wrapper, since char behaves differently from the numeric primitives.',
    ],
    keyPoints: [
      'Each of the 8 primitives has a matching wrapper class needed for use in generic collections and APIs.',
      'Autoboxing/unboxing convert between primitives and wrappers automatically.',
      'Integer caches values from -128 to 127, making == unreliable outside that range; always use equals() for wrapper value comparison.',
      'Wrapper classes also provide parsing methods and useful constants like MAX_VALUE and MIN_VALUE.',
    ],
  },

  'java-varargs': {
    title: 'Java Varargs',
    intro: `Varargs (variable-length arguments) let a method accept zero, one, or many arguments of the same type without the caller having to build an array explicitly. The syntax uses three dots after the type: <code>Type... name</code>, and inside the method body, that parameter behaves exactly like an array of that type.`,
    sections: [
      {
        heading: 'Varargs Syntax and Rules',
        body: `A varargs parameter is declared as <code>returnType methodName(Type... name)</code>. Two rules are strict and enforced by the compiler.`,
        list: [
          'A method can have at most one varargs parameter.',
          'The varargs parameter must be the <strong>last</strong> parameter in the method signature.',
          'Inside the method, the varargs parameter is treated as an ordinary array (<code>Type[]</code>), so you can use <code>.length</code>, indexing, and enhanced for-loops on it.',
          'Callers may pass individual comma-separated values, an existing array of that type, or nothing at all (an empty array is created automatically).',
        ],
      },
      {
        heading: 'Overload Resolution with Varargs',
        body: `When a call could match either a fixed-arity overload or a varargs overload, Java always prefers the fixed-arity (non-varargs) method if one matches exactly, and only falls back to the varargs version when no better match exists. This avoids unnecessary array creation whenever a simpler overload is available.`,
      },
    ],
    examples: [
      {
        caption: 'A varargs method summing any number of int arguments, plus passing an array directly',
        code: `public class VarargsDemo {
    static int sum(String label, int... numbers) {
        int total = 0;
        for (int n : numbers) {
            total += n;
        }
        System.out.println(label + ": " + numbers.length + " values, total " + total);
        return total;
    }

    public static void main(String[] args) {
        sum("Call 1");                  // zero arguments
        sum("Call 2", 5);               // one argument
        sum("Call 3", 1, 2, 3, 4);      // multiple arguments

        int[] existing = {10, 20, 30};
        sum("Call 4", existing);        // passing an existing array directly
    }
}`,
        output: `Call 1: 0 values, total 0
Call 2: 1 values, total 5
Call 3: 4 values, total 10
Call 4: 3 values, total 60`,
      },
    ],
    commonMistakes: [
      'Trying to declare a varargs parameter anywhere other than last in the parameter list — the compiler rejects it.',
      'Attempting to declare two varargs parameters in the same method, which is not allowed.',
      'Forgetting that a varargs parameter is really an array internally, and misusing it as if it were a single value inside the method.',
      'Creating ambiguous overloads between a varargs method and a fixed-arity method that could both match the same call.',
    ],
    keyPoints: [
      'Varargs syntax is Type... name, usable as an array inside the method body.',
      'A method may have only one varargs parameter, and it must be the last parameter.',
      'Callers can pass individual values, an array, or nothing at all.',
      'Java prefers a matching fixed-arity overload over a varargs overload when both are applicable.',
    ],
  },

  'static-import': {
    title: 'Static Import',
    intro: `A static import lets you use a class's static members — methods and constants — without prefixing them with the class name every time. Instead of writing <code>Math.sqrt(x)</code> and <code>Math.PI</code> throughout a file, a static import lets you write just <code>sqrt(x)</code> and <code>PI</code>.`,
    sections: [
      {
        heading: 'Static Import Syntax',
        body: `The syntax is <code>import static packageName.ClassName.memberName;</code> for a single member, or <code>import static packageName.ClassName.*;</code> to import all static members of that class. Static imports must appear alongside other import statements, after any package declaration.`,
      },
      {
        heading: 'When It Helps',
        body: `Static imports genuinely improve readability in mathematically dense code (using <code>Math</code> members heavily) or when writing unit tests with a library like JUnit, where methods like <code>assertEquals</code> and <code>assertTrue</code> read cleanly without a class prefix repeated on every line.`,
      },
      {
        heading: 'When It Hurts',
        body: `Overusing static imports, especially importing <code>*</code> from several classes, makes it hard to tell at a glance which class a given method or constant actually comes from — readers lose an important visual cue. Most style guides recommend reserving static imports for a small number of extremely well-known members (like <code>Math</code> constants or a testing framework's assertions), and avoiding them when the source class is not immediately obvious from context.`,
      },
    ],
    examples: [
      {
        caption: 'Using static import to drop the Math class prefix',
        code: `import static java.lang.Math.PI;
import static java.lang.Math.pow;

public class StaticImportDemo {
    public static void main(String[] args) {
        double radius = 3.0;
        double area = PI * pow(radius, 2); // no "Math." prefix needed
        System.out.println(area);
    }
}`,
        output: '28.274333882308138',
      },
    ],
    commonMistakes: [
      'Overusing wildcard static imports from multiple classes, which makes it unclear where a method or constant actually comes from.',
      'Statically importing members whose names collide with other identifiers in the file, causing confusing compile errors.',
      'Assuming static import lets you import instance methods — it only works for static members.',
      'Forgetting static import is purely a readability feature; it does not change behavior, performance, or accessibility rules.',
    ],
    keyPoints: [
      'Syntax: import static package.Class.member; or import static package.Class.*; for all static members.',
      'It only applies to static members — fields and methods marked static.',
      'It can improve readability for heavily used utility members like Math constants or test assertions.',
      'Overuse harms readability by hiding which class a member actually belongs to.',
    ],
  },

  'instanceof-and-downcasting': {
    title: 'instanceof and Downcasting',
    intro: `Upcasting (treating a subclass object as its superclass or interface type) happens automatically and safely in Java. Downcasting — converting a superclass or interface reference back to a more specific subclass type — is not automatic, requires an explicit cast, and is only safe when the object being cast is genuinely an instance of that target type at runtime.`,
    sections: [
      {
        heading: 'Why Downcasting Needs a Check',
        body: `A reference variable's declared type limits what the compiler lets you call on it, but the actual object it points to at runtime might be any subclass. Casting a reference down to a more specific type without verifying the object's real type first risks a <code>ClassCastException</code> at runtime if the object is not actually of that type.`,
      },
      {
        heading: 'Using instanceof for Safe Downcasting',
        body: `The <code>instanceof</code> operator checks whether an object is an instance of a given type (or a subtype of it) before you attempt the cast, returning a boolean. The traditional pattern is to check with <code>instanceof</code> first, then cast only if the check passes, avoiding an unguarded downcast that could throw.`,
      },
      {
        heading: 'Pattern Matching for instanceof (Modern Java)',
        body: `Since Java 16, pattern matching for <code>instanceof</code> lets you combine the check and the cast in one expression: <code>if (obj instanceof Dog dog)</code> both tests the type and binds a new, already-cast variable (<code>dog</code>) usable inside that branch, eliminating the separate explicit cast statement and the boilerplate of the older two-step pattern.`,
      },
    ],
    examples: [
      {
        caption: 'Safe downcasting with instanceof, including modern pattern matching syntax',
        code: `class Animal {
    void makeSound() {
        System.out.println("Some generic animal sound");
    }
}

class Dog extends Animal {
    void fetch() {
        System.out.println("Dog is fetching the ball");
    }
}

public class InstanceofDemo {
    public static void main(String[] args) {
        Animal a = new Dog(); // upcasting, always safe

        // Traditional check-then-cast pattern
        if (a instanceof Dog) {
            Dog d = (Dog) a;
            d.fetch();
        }

        // Modern pattern matching for instanceof (Java 16+)
        if (a instanceof Dog dog) {
            dog.fetch();
        }

        Animal generic = new Animal();
        if (!(generic instanceof Dog)) {
            System.out.println("generic is not a Dog, downcast skipped safely");
        }
    }
}`,
        output: `Dog is fetching the ball
Dog is fetching the ball
generic is not a Dog, downcast skipped safely`,
      },
    ],
    commonMistakes: [
      'Downcasting without an instanceof check first, risking a ClassCastException when the object is not actually of the target type.',
      'Assuming instanceof returns true for null — it always returns false when checked against a null reference, by design.',
      'Forgetting that upcasting (subclass to superclass) never needs an explicit cast or a check, unlike downcasting.',
      'Not realizing pattern matching for instanceof only narrows the type inside the branch where the condition is true (and, with negation, appropriately outside it).',
    ],
    keyPoints: [
      'Upcasting is automatic and safe; downcasting requires an explicit cast and can throw ClassCastException.',
      'instanceof checks an object\'s runtime type before a downcast is attempted, returning false (not an error) for null.',
      'Pattern matching for instanceof (Java 16+) merges the check and cast into a single, more concise expression.',
      'Always prefer checking with instanceof over an unguarded cast when the object\'s real type is not already certain.',
    ],
  },
}
