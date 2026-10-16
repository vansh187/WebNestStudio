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
    intro: `Abstract classes and interfaces both support abstraction, and modern Java has narrowed the gap between them, but they still serve different design purposes. Choosing the right one is a common real-world design decision, not just a syntax choice.

The short version: an <strong>abstract class</strong> is a partly built parent class that related subclasses finish, and it can carry fields, constructors and shared code. An <strong>interface</strong> is a contract of abilities that any class can sign up to, and a class can sign up to many of them. This lesson looks at each one on its own, compares them point by point, covers the Java 8 and Java 9 changes to interfaces, and ends with the interview questions that come up most.`,
    sections: [
      {
        heading: 'What Is an Abstract Class?',
        body: `An abstract class is declared with the <code>abstract</code> keyword and cannot be instantiated with <code>new</code>. It can contain <strong>abstract methods</strong> (a signature with no body, which every concrete subclass must override) alongside normal methods with full bodies, instance fields, constructors, <code>static</code> members and <code>final</code> methods. Think of it as a template: an <code>Employee</code> base class stores the name and rate and builds the payslip, while <code>FullTime</code> and <code>Contractor</code> each decide only how monthly pay is calculated. The constructor still matters even though you never call <code>new Employee(...)</code> yourself: each subclass constructor runs it through <code>super(...)</code> to set up the shared fields.`,
      },
      {
        heading: 'What Is an Interface?',
        body: `An interface is declared with the <code>interface</code> keyword and describes what a class can do, not how it stores data. Every method declared without a body is implicitly <code>public abstract</code>, and every field is implicitly <code>public static final</code>, so it must be given a value and acts as a constant. A class signs the contract with <code>implements</code> and must provide a <code>public</code> body for each abstract method (or be declared abstract itself). Because an interface has no instance fields and no constructor, unrelated classes can share it: a <code>CardGateway</code>, a <code>UpiGateway</code> and a test stub can all be a <code>PaymentGateway</code> without sharing a parent class.`,
      },
      {
        heading: 'Side-by-Side Comparison',
        body: `These are the practical differences that matter most when deciding between them.`,
        list: [
          '<strong>Keyword:</strong> <code>abstract class</code> is used with <code>extends</code>; <code>interface</code> is used with <code>implements</code> (and an interface extends other interfaces with <code>extends</code>).',
          '<strong>Inheritance:</strong> a class can extend only one abstract class, but can implement many interfaces.',
          '<strong>Methods:</strong> an abstract class can mix abstract and concrete methods freely; an interface has abstract methods plus, since Java 8, <code>default</code> and <code>static</code> methods, and since Java 9, <code>private</code> methods.',
          '<strong>Variables:</strong> an abstract class can hold instance and static fields of any kind, final or not; an interface can only hold implicit <code>public static final</code> constants.',
          '<strong>Constructors:</strong> abstract classes can have constructors (called via <code>super()</code>); interfaces cannot have constructors at all.',
          '<strong>Access modifiers:</strong> abstract class members can be public, protected, package-private or private; interface methods are public unless they are Java 9 <code>private</code> helpers, and nothing in an interface can be protected.',
          '<strong>Initializer blocks:</strong> an abstract class can have instance and static initializer blocks; an interface can have neither.',
          '<strong>Purpose:</strong> abstract classes model an "is-a" relationship with shared implementation; interfaces model a "can-do" capability contract.',
        ],
      },
      {
        heading: 'Multiple Inheritance Through Interfaces',
        body: `Java does not let a class extend two classes, because two parents with fields and constructors would make object state ambiguous. Interfaces carry no instance state, so a class may implement as many as it needs: a <code>Smartphone</code> can be both a <code>Camera</code> and a <code>MusicPlayer</code>, and it can be passed to any method that expects either type. The one conflict that can arise is two interfaces supplying a <code>default</code> method with the same signature. Java will not guess which one you meant: the class fails to compile until it overrides the method, and inside the override it can call a specific parent with <code>Camera.super.describe()</code>. If a superclass and an interface both provide the method, the class's version wins ("class wins" rule).`,
      },
      {
        heading: 'Java 8 and Java 9 Changes to Interfaces',
        body: `Before Java 8 an interface could only declare abstract methods and constants, which made the choice easy. Three additions blurred the line.`,
        list: [
          '<strong>default methods (Java 8):</strong> a method with a body that implementing classes inherit and may override. They exist so an interface can grow without breaking every class that already implements it; this is how <code>Iterable.forEach()</code> and <code>Collection.stream()</code> were added to existing collections.',
          '<strong>static methods (Java 8):</strong> utility methods that belong to the interface itself and are called as <code>PaymentGateway.isValid(99)</code>. They are not inherited by implementing classes.',
          '<strong>private methods (Java 9):</strong> instance or <code>static</code> helpers that remove duplicated code between default and static methods without exposing it to implementers.',
          'Even with these, an interface still cannot hold instance state or a constructor. That is the line that remains between the two.',
        ],
      },
      {
        heading: 'When to Choose Which',
        body: `Prefer an abstract class when related classes share meaningful common state or code and naturally belong to one hierarchy — for example, <code>Animal</code> as a base for <code>Dog</code> and <code>Cat</code>. Prefer an interface when unrelated classes need to promise the same capability regardless of their place in the hierarchy — for example, both a <code>Car</code> and a <code>Duck</code> can be <code>Movable</code>, even though they share no common ancestor otherwise.`,
        list: [
          '<strong>Choose an abstract class</strong> for a family of closely related types that share fields and setup: an <code>Employee</code> base with <code>FullTime</code> and <code>Contractor</code>, or a <code>BankAccount</code> base with savings and current accounts.',
          '<strong>Choose an interface</strong> for a capability or a pluggable service: <code>Comparable</code>, <code>Runnable</code>, a <code>PaymentGateway</code> with card and UPI implementations, or a repository that a test can replace with a fake.',
          '<strong>Choose an interface when in doubt.</strong> It keeps the single <code>extends</code> free, and you can add an abstract base class later that implements it.',
        ],
      },
      {
        heading: 'They Can Work Together',
        body: `These two tools are not mutually exclusive. An abstract class can implement one or more interfaces and leave some or all of those interface methods unimplemented for its own subclasses to finish, combining shared base behavior with a flexible capability contract. The JDK does exactly this: <code>List</code> is an interface, <code>AbstractList</code> is an abstract class that implements most of it, and <code>ArrayList</code> extends <code>AbstractList</code>.`,
      },
      {
        heading: 'Common Interview Questions',
        list: [
          '<strong>Can an abstract class have a constructor?</strong> Yes. It runs through <code>super(...)</code> when a subclass object is created, even though the abstract class itself cannot be instantiated.',
          '<strong>Can an interface have a constructor?</strong> No. It has no instance state to initialize.',
          '<strong>Can an abstract class have no abstract methods?</strong> Yes. Marking it abstract simply prevents direct instantiation.',
          '<strong>Can an abstract method be private, static or final?</strong> No. Each of those stops a subclass from overriding it, which defeats the purpose of an abstract method.',
          '<strong>Can an interface extend a class?</strong> No. An interface can only extend other interfaces, and it can extend several at once.',
          '<strong>Must an abstract class implement every method of an interface it implements?</strong> No. The first concrete subclass must supply whatever is still missing.',
          '<strong>Why were default methods added?</strong> To add methods to existing interfaces, such as <code>forEach()</code> on <code>Iterable</code>, without breaking code that already implemented them.',
          '<strong>If interfaces can have method bodies now, why keep abstract classes?</strong> Only abstract classes can hold instance state, constructors and protected members.',
        ],
      },
    ],
    examples: [
      {
        caption: 'An abstract class: shared fields, a constructor and one method each subclass must supply',
        code: `public class PayrollDemo {
    public static void main(String[] args) {
        Employee[] staff = { new FullTime("Asha", 600000), new Contractor("Ravi", 120, 450) };
        for (Employee e : staff) {
            System.out.println(e.payslip());
        }
        // Employee e = new Employee("X", 0); // compile error: Employee is abstract
    }
}

abstract class Employee {
    private final String name;                 // state: instance fields are allowed
    protected final double rate;

    Employee(String name, double rate) {       // constructor runs through super(...)
        this.name = name;
        this.rate = rate;
    }

    abstract double monthlyPay();              // no body: each subclass decides

    final String payslip() {                   // shared code every subclass inherits
        return String.format("%-5s %,10.2f", name, monthlyPay());
    }
}

class FullTime extends Employee {
    FullTime(String name, double yearlySalary) {
        super(name, yearlySalary);
    }

    @Override
    double monthlyPay() { return rate / 12; }
}

class Contractor extends Employee {
    private final int hours;

    Contractor(String name, int hours, double hourlyRate) {
        super(name, hourlyRate);
        this.hours = hours;
    }

    @Override
    double monthlyPay() { return hours * rate; }
}`,
        output: `Asha   50,000.00
Ravi   54,000.00`,
      },
      {
        caption: 'An interface with a constant, an abstract method, and Java 8/9 default, static and private methods',
        code: `public class GatewayDemo {
    public static void main(String[] args) {
        PaymentGateway card = new CardGateway();
        card.pay(500);                           // abstract method, implemented by the class
        card.payWithFee(500);                    // default method, inherited for free
        card.payWithFee(-20);
        System.out.println(PaymentGateway.isValid(99));  // static: called on the interface
        System.out.println("Fee: " + PaymentGateway.FEE_PERCENT + "%");
    }
}

interface PaymentGateway {
    double FEE_PERCENT = 2.0;                    // implicitly public static final

    void pay(double amount);                     // implicitly public abstract

    default void payWithFee(double amount) {     // Java 8: method with a body
        if (!isValid(amount)) {
            System.out.println("Rejected: " + amount);
            return;
        }
        pay(amount + fee(amount));
    }

    static boolean isValid(double amount) {      // Java 8: utility on the interface
        return amount > 0;
    }

    private double fee(double amount) {          // Java 9: helper hidden from implementers
        return amount * FEE_PERCENT / 100;
    }
}

class CardGateway implements PaymentGateway {
    @Override
    public void pay(double amount) {             // must be public
        System.out.println("Card charged " + amount);
    }
}`,
        output: `Card charged 500.0
Card charged 510.0
Rejected: -20.0
true
Fee: 2.0%`,
      },
      {
        caption: 'Multiple inheritance of type, and resolving two conflicting default methods',
        code: `public class PhoneDemo {
    public static void main(String[] args) {
        Smartphone phone = new Smartphone();
        System.out.println(phone.describe());

        Camera cam = phone;                      // one object, several types
        MusicPlayer player = phone;
        cam.click();
        player.play();
    }
}

interface Camera {
    void click();

    default String describe() { return "Takes photos"; }
}

interface MusicPlayer {
    void play();

    default String describe() { return "Plays music"; }
}

class Smartphone implements Camera, MusicPlayer {
    @Override
    public void click() { System.out.println("Photo saved"); }

    @Override
    public void play() { System.out.println("Playing playlist"); }

    @Override
    public String describe() {                   // required: both parents have a default describe()
        return Camera.super.describe() + " and " + MusicPlayer.super.describe();
    }
}`,
        output: `Takes photos and Plays music
Photo saved
Playing playlist`,
      },
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
      'Implementing an interface method without <code>public</code>. Interface methods are public, so a package-private implementation fails with "attempting to assign weaker access privileges".',
      'Implementing two interfaces that share a default method and not overriding it, which is a compile error until the class picks a version with <code>Interface.super.method()</code>.',
      'Calling an interface static method through an implementing class or object, such as <code>CardGateway.isValid(5)</code>. Static interface methods are not inherited; call <code>PaymentGateway.isValid(5)</code>.',
    ],
    keyPoints: [
      'Abstract classes support shared state, constructors, and mixed access levels; interfaces do not.',
      'A class extends one abstract class but can implement many interfaces.',
      'Abstract classes model "is-a" relationships; interfaces model "can-do" capabilities.',
      'Interface fields are always <code>public static final</code>; abstract class fields can be anything.',
      'Java 8 added default and static interface methods, and Java 9 added private ones, but interfaces still have no instance state or constructors.',
      'Two conflicting default methods must be resolved by overriding, using <code>Interface.super.method()</code> to reuse one.',
      'An abstract class can implement interfaces, combining both tools in one hierarchy.',
    ],
  },

  encapsulation: {
    title: 'Encapsulation',
    intro: `Encapsulation is the practice of bundling data (fields) and the code that operates on that data (methods) into a single unit — a class — while restricting direct outside access to that data. In Java, encapsulation is achieved by declaring fields <code>private</code> and exposing controlled access through <code>public</code> getter and setter methods.

This is sometimes described as "data hiding," but its real value is control: encapsulation lets a class validate, transform, or log every read or write to its data, and lets the internal representation change later without breaking code that depends on the class.

It is one of the four pillars of OOP, alongside inheritance, polymorphism and abstraction. A good one-line summary: <strong>hide the data, expose the behavior.</strong>`,
    sections: [
      {
        heading: 'Access Modifiers Recap',
        body: `Encapsulation is built on Java's four access levels, from most to least restrictive. Fields are almost always <code>private</code>; the methods that make up the class's public API are <code>public</code>.`,
        list: [
          '<strong>private:</strong> visible only inside the same class. This is what hides the data.',
          '<strong>default (no keyword):</strong> visible to classes in the same package.',
          '<strong>protected:</strong> visible in the same package and to subclasses in other packages.',
          '<strong>public:</strong> visible everywhere. Use it for the operations other code is meant to call.',
        ],
      },
      {
        heading: 'Data Hiding with private',
        body: `Marking a field <code>private</code> means the compiler rejects any outside access: <code>e.salary = -100;</code> from another class fails with "salary has private access in Employee". Outside code can then only reach the data through the methods the class chooses to offer, so the class decides what is visible, what is changeable and what values are allowed. A class whose fields are all private is sometimes called <strong>tightly encapsulated</strong>.`,
      },
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
        heading: 'Validation in Setters',
        body: `A setter that only does <code>this.salary = salary;</code> protects nothing. The point of routing writes through a method is that the method can refuse bad values: reject a negative salary or an empty name by throwing <code>IllegalArgumentException</code>, so the object can never hold invalid state. Apply the same rule in the constructor (for example by calling the setter or a shared check), otherwise a bad value can still slip in when the object is created.`,
      },
      {
        heading: 'When NOT to Write Getters and Setters',
        body: `Generating a getter and setter for every field is a habit, not a design. A public setter on every field is barely better than a public field. Instead, expose the operations the object actually supports: a <code>BankAccount</code> should have <code>deposit()</code> and <code>withdraw()</code> that enforce the rules, not <code>setBalance()</code>, which lets any caller write any balance. Leave out setters for values that should not change after creation, such as an ID, and leave out getters for data outside code has no reason to see.`,
      },
      {
        heading: 'Read-Only and Write-Only Classes',
        list: [
          '<strong>Read-only class:</strong> private fields with getters but no setters. Values are supplied once through the constructor, as with an application config or a user ID.',
          '<strong>Write-only class:</strong> private fields with setters but no getters. Useful for secrets such as a password, which can be set and checked but should never be read back.',
        ],
      },
      {
        heading: 'Immutable Classes',
        body: `An immutable object can never change after it is constructed, which is encapsulation taken all the way. <code>String</code> is the best-known example: <code>name.toUpperCase()</code> returns a new string and leaves <code>name</code> untouched. Immutable objects are safe to share between threads, safe to use as <code>HashMap</code> keys, and can never be left half-updated. Java 16+ <code>record</code> types follow most of these rules automatically.`,
        list: [
          'Declare the class <code>final</code> so no subclass can add mutable behavior.',
          'Make every field <code>private final</code> and set it only in the constructor.',
          'Provide no setters. To "change" a value, return a new object (for example <code>withCourse()</code>).',
          'Make defensive copies of mutable inputs and outputs, such as lists and arrays, so outside code cannot change them behind your back. <code>List.copyOf()</code> returns an unmodifiable copy.',
        ],
      },
      {
        heading: 'Encapsulation vs Abstraction',
        body: `The two are often confused because both "hide" something. <strong>Abstraction</strong> hides complexity: it decides <em>what</em> an object offers, and is expressed with abstract classes and interfaces (a <code>PaymentGateway</code> with a <code>pay()</code> method). <strong>Encapsulation</strong> hides data: it decides <em>how</em> an object protects its state, and is expressed with <code>private</code> fields and controlled methods. Abstraction works at the design level; encapsulation works at the implementation level. Most well-written classes use both.`,
      },
      {
        heading: 'Why It Matters',
        body: `Without encapsulation, any code anywhere in a program could set a field to an invalid value, such as a negative age or an empty required name, with no chance for the class to object. With encapsulation, invalid data can be rejected at a single, well-defined entry point, and the internal storage format (a single field, a computed value, a different type) can be reworked later without changing the public API that other code relies on.`,
      },
      {
        heading: 'Common Interview Questions',
        list: [
          '<strong>What is encapsulation?</strong> Bundling data and the methods that work on it into one class, and restricting direct access to the data with <code>private</code>.',
          '<strong>Is encapsulation the same as data hiding?</strong> Data hiding (making fields private) is the mechanism; encapsulation is the wider idea of controlling all access through methods.',
          '<strong>How do you achieve encapsulation in Java?</strong> Private fields, plus public methods (getters, setters or domain operations) that validate access.',
          '<strong>Can a class be encapsulated without setters?</strong> Yes. A read-only or immutable class is fully encapsulated.',
          '<strong>How do you make a class immutable?</strong> Make the class final, fields private final, provide no setters, and defensively copy mutable fields.',
          '<strong>How can a getter break encapsulation?</strong> By returning a mutable internal object, such as a <code>List</code> or array, that the caller can then modify directly.',
          '<strong>What is the difference between encapsulation and abstraction?</strong> Abstraction hides complexity and shows only what an object does; encapsulation hides internal data and controls how it is accessed.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Private fields, a getter, and a setter that validates',
        code: `public class EmployeeDemo {
    public static void main(String[] args) {
        Employee e = new Employee("Asha", 50000);
        e.setSalary(65000);
        System.out.println(e.getName() + " earns " + e.getSalary());

        try {
            e.setSalary(-100);                   // the setter guards the field
        } catch (IllegalArgumentException ex) {
            System.out.println("Rejected: " + ex.getMessage());
        }
        // e.salary = -100;                      // compile error: salary has private access
        System.out.println(e.getName() + " still earns " + e.getSalary());
    }
}

final class Employee {
    private final String name;                   // no setter: fixed after construction
    private double salary;

    Employee(String name, double salary) {
        this.name = name;
        setSalary(salary);                       // same validation for new objects
    }

    public String getName() {
        return name;
    }

    public double getSalary() {
        return salary;
    }

    public void setSalary(double salary) {
        if (salary < 0) {
            throw new IllegalArgumentException("salary cannot be negative: " + salary);
        }
        this.salary = salary;
    }
}`,
        output: `Asha earns 65000.0
Rejected: salary cannot be negative: -100.0
Asha still earns 65000.0`,
      },
      {
        caption: 'A read-only class and a write-only class',
        code: `public class AccessDemo {
    public static void main(String[] args) {
        AppConfig config = new AppConfig("WebNest", 8080);
        System.out.println(config.getAppName() + " on port " + config.getPort());

        PasswordBox box = new PasswordBox();
        box.setPassword("s3cret!");
        System.out.println("Correct password? " + box.matches("s3cret!"));
        System.out.println("Wrong password? " + box.matches("guess"));
    }
}

// Read-only: values come in through the constructor, getters only
class AppConfig {
    private final String appName;
    private final int port;

    AppConfig(String appName, int port) {
        this.appName = appName;
        this.port = port;
    }

    public String getAppName() { return appName; }
    public int getPort() { return port; }
}

// Write-only: the password can be set but never read back
class PasswordBox {
    private int passwordHash;

    public void setPassword(String password) {
        passwordHash = password.hashCode();      // real code would use a proper password hash
    }

    public boolean matches(String attempt) {
        return attempt.hashCode() == passwordHash;
    }
}`,
        output: `WebNest on port 8080
Correct password? true
Wrong password? false`,
      },
      {
        caption: 'An immutable class with defensive copies',
        code: `import java.util.ArrayList;
import java.util.List;

public class ImmutableDemo {
    public static void main(String[] args) {
        List<String> courses = new ArrayList<>(List.of("Java"));
        Student s = new Student("Ravi", courses);

        courses.add("Python");                   // changing the caller's list...
        System.out.println(s.getCourses());      // ...does not reach the Student

        try {
            s.getCourses().add("SQL");           // the returned list cannot be changed either
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot modify courses");
        }

        Student updated = s.withCourse("SQL");   // "changes" produce a new object
        System.out.println(s.getCourses() + " -> " + updated.getCourses());

        String name = "java";
        name.toUpperCase();                      // String is immutable too
        System.out.println(name);
    }
}

final class Student {                            // final: no subclass can add mutable state
    private final String name;
    private final List<String> courses;

    Student(String name, List<String> courses) {
        this.name = name;
        this.courses = List.copyOf(courses);     // defensive, unmodifiable copy
    }

    public String getName() { return name; }

    public List<String> getCourses() { return courses; }

    public Student withCourse(String course) {
        List<String> next = new ArrayList<>(courses);
        next.add(course);
        return new Student(name, next);
    }
}`,
        output: `[Java]
Cannot modify courses
[Java] -> [Java, SQL]
java`,
      },
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
      'Validating in the setter but not in the constructor, so an invalid value can still enter when the object is created.',
      'Adding a <code>setBalance()</code>-style setter where a domain operation such as <code>deposit()</code> or <code>withdraw()</code> should enforce the rules.',
      'Thinking a class is immutable just because its fields are <code>final</code>. A final reference to a mutable <code>List</code> still lets the list change.',
    ],
    keyPoints: [
      'Encapsulation combines private fields with public getters/setters to control access.',
      'It allows validation of data on write and protects internal representation from outside code.',
      'A field can be made read-only by simply not providing a setter; a write-only field has a setter but no getter.',
      'Immutable classes are final, have private final fields, no setters, and defensive copies of mutable data.',
      'Abstraction hides complexity (what an object does); encapsulation hides data (how its state is protected).',
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
        heading: 'What Is Object Cloning?',
        body: `Writing <code>Student b = a;</code> does not copy anything. It copies the <em>reference</em>, so <code>a</code> and <code>b</code> are two names for the same object and a change made through one is seen through the other. Cloning creates a second, separate object on the heap whose fields start with the same values as the original. After cloning, <code>original == copy</code> is <code>false</code> because they are different objects. Whether they still share anything inside depends on whether the copy is shallow or deep.`,
      },
      {
        heading: 'Understanding the clone() Method',
        body: `<code>clone()</code> is declared in <code>java.lang.Object</code> as <code>protected native Object clone() throws CloneNotSupportedException</code>. Because it is <code>protected</code>, outside code cannot call it on your objects until you override it. A typical override does three things.`,
        list: [
          'Make it <code>public</code> so other classes can call it.',
          'Call <code>super.clone()</code>, which allocates the new object and copies every field. No constructor runs during this copy.',
          'Use a covariant return type (<code>public Student clone()</code> instead of <code>Object</code>) so callers do not need a cast. The cast from <code>super.clone()</code> happens once, inside the method.',
        ],
      },
      {
        heading: 'The Cloneable Interface',
        body: `<code>Cloneable</code> is a marker interface: it declares no methods at all. Its only job is to tell <code>Object.clone()</code> that cloning is permitted for this class. If a class calls <code>super.clone()</code> without implementing <code>Cloneable</code>, the call throws <code>CloneNotSupportedException</code> at runtime. Arrays are the exception: every array is cloneable, and <code>array.clone()</code> is public and throws no checked exception, which makes it the easiest way to copy an array field.`,
      },
      {
        heading: 'Shallow Cloning',
        body: `The default <code>Object.clone()</code> performs a shallow copy: it copies each field's value directly. For primitive fields, this copies the actual value. For reference fields (like an array or another object), it copies only the reference itself — so the clone and the original end up pointing at the same underlying object. Modifying that shared object through one reference is visible through the other. Immutable fields such as <code>String</code> are safe to share, because nobody can change them.`,
      },
      {
        heading: 'Deep Cloning',
        body: `A deep copy duplicates not just the top-level object but every mutable object it references, recursively, so the clone shares no mutable state with the original. Java does not do this automatically; you must implement it yourself, typically by calling <code>super.clone()</code> for the shallow copy and then replacing each mutable field with its own copy (<code>marks.clone()</code>, <code>address.clone()</code>, <code>new ArrayList&lt;&gt;(list)</code>). Every class in the chain that needs copying must support it as well.`,
      },
      {
        heading: 'Shallow Copy vs Deep Copy',
        list: [
          '<strong>Top-level object:</strong> both create a new object, so <code>original == copy</code> is <code>false</code> in both cases.',
          '<strong>Primitive and immutable fields:</strong> copied by value in both; no difference.',
          '<strong>Mutable reference fields:</strong> a shallow copy shares them with the original; a deep copy gets its own copies.',
          '<strong>Effort:</strong> a shallow copy is one call to <code>super.clone()</code>; a deep copy needs extra code for every mutable field.',
          '<strong>Speed and memory:</strong> a shallow copy is cheaper; a deep copy allocates more objects.',
          '<strong>When to use:</strong> shallow is fine when the fields are immutable or meant to be shared; use deep when the copy must be changed without affecting the original.',
        ],
      },
      {
        heading: 'Pitfalls and Alternatives to clone()',
        body: `The clone mechanism has well-known design problems: a marker interface that silently changes how another method behaves, a checked exception that callers must handle, a cast, no constructor call, and <code>final</code> fields that cannot be reassigned inside <code>clone()</code>, which makes deep copies of them impossible. That is why many modern Java codebases avoid <code>clone()</code> entirely and use a <strong>copy constructor</strong> (<code>new Cart(otherCart)</code>) or a static factory method (<code>Cart.copyOf(otherCart)</code>) instead. Both are ordinary Java code, work with <code>final</code> fields, and make it obvious which fields are copied deeply.`,
      },
      {
        heading: 'Common Interview Questions',
        list: [
          '<strong>What is object cloning in Java?</strong> Creating a new object that is a field-by-field copy of an existing one, usually through <code>clone()</code>.',
          '<strong>Where is clone() defined and why is it protected?</strong> In <code>java.lang.Object</code>. It is protected so a class has to opt in by overriding it as public.',
          '<strong>What is a marker interface? Give an example.</strong> An interface with no methods that tags a class with a capability, such as <code>Cloneable</code> or <code>Serializable</code>.',
          '<strong>What happens if you call super.clone() without implementing Cloneable?</strong> It throws <code>CloneNotSupportedException</code> at runtime.',
          '<strong>Does clone() call the constructor?</strong> No. The new object is created by copying memory, so constructor code is skipped.',
          '<strong>Shallow copy vs deep copy?</strong> A shallow copy shares the objects that fields refer to; a deep copy also copies those objects.',
          '<strong>How do you make a deep copy?</strong> Call <code>super.clone()</code>, then replace each mutable field with its own copy, or use a copy constructor that does the same.',
        ],
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
      {
        caption: 'Deep clone: super.clone() first, then copy the array and the nested Address',
        code: `class Address implements Cloneable {
    String city;

    Address(String city) {
        this.city = city;
    }

    @Override
    public Address clone() throws CloneNotSupportedException {
        return (Address) super.clone();
    }
}

class Student implements Cloneable {
    String name;
    int[] marks;
    Address address;

    Student(String name, int[] marks, Address address) {
        this.name = name;
        this.marks = marks;
        this.address = address;
    }

    @Override
    public Student clone() throws CloneNotSupportedException {
        Student copy = (Student) super.clone(); // shallow copy first
        copy.marks = marks.clone();             // then copy each mutable field
        copy.address = address.clone();
        return copy;
    }
}

public class DeepCloneDemo {
    public static void main(String[] args) throws CloneNotSupportedException {
        Student original = new Student("Riya", new int[] {80, 90}, new Address("Delhi"));
        Student copy = original.clone();

        copy.marks[0] = 50;
        copy.address.city = "Mumbai";

        System.out.println(original == copy);
        System.out.println(original.marks[0] + " " + original.address.city);
        System.out.println(copy.marks[0] + " " + copy.address.city);
    }
}`,
        output: `false
80 Delhi
50 Mumbai`,
      },
      {
        caption: 'A copy constructor as the alternative to clone(), compared with a plain reference copy',
        code: `import java.util.ArrayList;
import java.util.List;

class Cart {
    private final List<String> items;

    Cart(List<String> items) {
        this.items = new ArrayList<>(items);
    }

    Cart(Cart other) {                       // copy constructor
        this(other.items);
    }

    void add(String item) {
        items.add(item);
    }

    List<String> items() {
        return items;
    }
}

public class CopyConstructorDemo {
    public static void main(String[] args) {
        Cart original = new Cart(List.of("Pen", "Book"));
        Cart copy = new Cart(original);
        copy.add("Bag");

        System.out.println(original.items());
        System.out.println(copy.items());

        Cart sameCart = original;                // reference copy, not a clone
        sameCart.add("Ink");
        System.out.println(original.items());
    }
}`,
        output: `[Pen, Book]
[Pen, Book, Bag]
[Pen, Book, Ink]`,
      },
    ],
    commonMistakes: [
      'Thinking <code>Student b = a;</code> makes a copy — it only copies the reference, so both names point to the same object.',
      'Calling clone() on a class that does not implement Cloneable and being surprised by a CloneNotSupportedException at runtime.',
      'Assuming clone() always produces a fully independent copy — the default is shallow, so shared mutable fields still alias each other.',
      'Forgetting to manually deep-copy mutable reference fields (arrays, lists, custom objects) inside an overridden clone() when independence is required.',
      'Reaching for clone() at all in new code instead of a copy constructor or a static factory method, which most modern style guides prefer.',
    ],
    keyPoints: [
      'Assigning one variable to another copies the reference; cloning creates a separate object.',
      'Override clone() as public, call super.clone(), and use a covariant return type to avoid casts at the call site.',
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
        heading: 'Why Java Needs Wrapper Classes',
        body: `Java keeps primitives such as <code>int</code> and <code>double</code> as plain values for speed, but large parts of the language work only with objects. Generics, and therefore every collection, accept object types only: <code>List&lt;int&gt;</code> does not compile, while <code>List&lt;Integer&gt;</code> does. Wrapper classes bridge that gap by putting a primitive value inside an object. They also let a value be <code>null</code> to mean "no value yet", which a primitive cannot express, and they give each type a home for parsing methods and constants.`,
      },
      {
        heading: 'Primitive Data Types vs Wrapper Classes',
        list: [
          '<strong>Nature:</strong> a primitive holds the raw value; a wrapper is an object on the heap that holds the value.',
          '<strong>null:</strong> a primitive can never be null; a wrapper reference can.',
          '<strong>Default value of a field:</strong> <code>0</code>, <code>0.0</code> or <code>false</code> for primitives; <code>null</code> for wrappers.',
          '<strong>Collections and generics:</strong> primitives cannot be used as type arguments; wrappers can.',
          '<strong>Comparison:</strong> <code>==</code> compares values for primitives; for wrappers it compares references, so use <code>equals()</code>.',
          '<strong>Memory and speed:</strong> primitives are smaller and faster; each wrapper is a full object with header overhead.',
          '<strong>Mutability:</strong> wrapper objects are immutable. <code>count++</code> on an <code>Integer</code> creates a new object rather than changing the old one.',
        ],
      },
      {
        heading: 'All 8 Wrapper Classes in Java',
        body: `All wrapper classes live in <code>java.lang</code>, so no import is needed. The six numeric wrappers extend the abstract class <code>Number</code>, which provides <code>intValue()</code>, <code>doubleValue()</code> and the other conversion methods. <code>Character</code> and <code>Boolean</code> extend <code>Object</code> directly. Note the two names that differ from their primitive: <code>Integer</code> and <code>Character</code>.`,
        list: [
          '<code>byte</code> → <code>Byte</code>',
          '<code>short</code> → <code>Short</code>',
          '<code>int</code> → <code>Integer</code>',
          '<code>long</code> → <code>Long</code>',
          '<code>float</code> → <code>Float</code>',
          '<code>double</code> → <code>Double</code>',
          '<code>char</code> → <code>Character</code>',
          '<code>boolean</code> → <code>Boolean</code>',
        ],
      },
      {
        heading: 'Autoboxing and Unboxing',
        body: `Autoboxing is the compiler's automatic conversion of a primitive into its wrapper object (<code>int</code> → <code>Integer</code>), and unboxing is the reverse (<code>Integer</code> → <code>int</code>). Both happen implicitly wherever needed, such as adding an <code>int</code> to a <code>List&lt;Integer&gt;</code> or using an <code>Integer</code> in an arithmetic expression — the compiler inserts the conversion calls for you behind the scenes. <code>Integer boxed = 5;</code> compiles to <code>Integer.valueOf(5)</code>, and <code>int n = boxed;</code> compiles to <code>boxed.intValue()</code>. Before Java 5 you had to write those calls yourself. The old <code>new Integer(5)</code> constructors are deprecated for removal; use <code>valueOf()</code> or plain autoboxing instead.`,
      },
      {
        heading: 'The Integer Caching Gotcha',
        body: `Java caches <code>Integer</code> objects for values from -128 to 127 (and similarly caches small values for other integer wrapper types). When autoboxing a value in that range, Java may return the same cached object rather than creating a new one, so comparing two boxed values with <code>==</code> in that range can appear to work by coincidence. Outside that range, autoboxing creates new distinct objects, so <code>==</code> comparisons stop matching even for equal values — which is exactly why <code>.equals()</code>, not <code>==</code>, should always be used to compare wrapper objects.`,
      },
      {
        heading: 'Integer, Double, Boolean and Character Methods',
        body: `Wrapper classes also carry parsing and conversion utilities, making them the natural home for type-specific helper logic that a raw primitive cannot carry. The ones you will use most often:`,
        list: [
          '<code>Integer.parseInt("25")</code> returns a primitive <code>int</code>; <code>Integer.valueOf("25")</code> returns an <code>Integer</code> object. Both throw <code>NumberFormatException</code> for text such as <code>"25a"</code>.',
          '<code>Double.parseDouble("99.5")</code> and <code>Long.parseLong(...)</code> work the same way for their types.',
          '<code>Boolean.parseBoolean(s)</code> returns <code>true</code> only for "true" in any letter case; every other string, including null, gives <code>false</code>.',
          '<code>Character.isLetter</code>, <code>isDigit</code>, <code>isWhitespace</code>, <code>toUpperCase</code> and <code>toLowerCase</code> classify and convert single characters.',
          '<code>Integer.MAX_VALUE</code>, <code>Integer.MIN_VALUE</code>, <code>Long.MAX_VALUE</code> and similar constants give the range of each type.',
          '<code>Integer.compare(a, b)</code>, <code>Integer.toBinaryString(n)</code> and <code>String.valueOf(n)</code> / <code>Integer.toString(n)</code> compare and convert values back to text.',
        ],
      },
      {
        heading: 'Wrapper Classes in Java Collections',
        body: `Every number you put in an <code>ArrayList&lt;Integer&gt;</code> or a <code>HashMap&lt;String, Integer&gt;</code> is boxed on the way in and unboxed on the way out. Two details catch people out. First, <code>List&lt;Integer&gt;</code> has both <code>remove(int index)</code> and <code>remove(Object value)</code>, so <code>list.remove(1)</code> removes the element at index 1, not the value 1; write <code>list.remove(Integer.valueOf(1))</code> to remove by value. Second, <code>map.get(key)</code> returns <code>null</code> for a missing key, and assigning that to an <code>int</code> throws <code>NullPointerException</code>; use <code>getOrDefault(key, 0)</code> or keep the result in an <code>Integer</code>.`,
      },
      {
        heading: 'Common Interview Questions',
        list: [
          '<strong>What is a wrapper class?</strong> A class in <code>java.lang</code> that wraps one primitive value in an object, such as <code>Integer</code> for <code>int</code>.',
          '<strong>Why do we need wrapper classes?</strong> Collections and generics accept only objects, wrappers can be null, and they provide parsing methods and constants.',
          '<strong>What are autoboxing and unboxing?</strong> Automatic conversion from primitive to wrapper (via <code>valueOf()</code>) and back (via <code>intValue()</code> and similar), added in Java 5.',
          '<strong>Difference between parseInt() and valueOf()?</strong> <code>parseInt</code> returns a primitive <code>int</code>; <code>valueOf</code> returns an <code>Integer</code> and may reuse a cached object.',
          '<strong>Why is Integer a == b true for 127 but false for 128?</strong> <code>Integer.valueOf</code> caches -128 to 127, so small values share one object; larger ones are new objects.',
          '<strong>Are wrapper classes immutable?</strong> Yes. All eight are immutable and final.',
          '<strong>What happens when you unbox null?</strong> A <code>NullPointerException</code> is thrown.',
        ],
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
      {
        caption: 'Parsing and helper methods on Integer, Double, Boolean and Character',
        code: `public class WrapperMethodsDemo {
    public static void main(String[] args) {
        int age = Integer.parseInt("25");        // String -> int
        Integer boxedAge = Integer.valueOf("25"); // String -> Integer
        double price = Double.parseDouble("99.5");
        boolean active = Boolean.parseBoolean("TRUE");

        System.out.println(age + 1);
        System.out.println(boxedAge.equals(age));
        System.out.println(price * 2);
        System.out.println(active);

        System.out.println(Integer.MAX_VALUE);
        System.out.println(Integer.toBinaryString(10));
        System.out.println(Integer.compare(5, 9));

        char ch = 'x';
        System.out.println(Character.isLetter(ch) + " " + Character.isDigit('7'));
        System.out.println(Character.toUpperCase(ch));

        String text = String.valueOf(42) + Double.toString(1.5);
        System.out.println(text);
    }
}`,
        output: `26
true
199.0
true
2147483647
1010
-1
true true
X
421.5`,
      },
      {
        caption: 'Wrappers in collections: boxing in a List, remove(index) vs remove(value), and null from a Map',
        code: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WrapperCollectionsDemo {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>();
        numbers.add(10);                 // autoboxed to Integer.valueOf(10)
        numbers.add(20);
        numbers.add(30);

        int total = 0;
        for (int n : numbers) {          // each element is unboxed
            total += n;
        }
        System.out.println("Total: " + total);

        numbers.remove(1);                     // removes the element at index 1
        System.out.println(numbers);
        numbers.remove(Integer.valueOf(10));   // removes the value 10
        System.out.println(numbers);

        Map<Character, Integer> counts = new HashMap<>();
        for (char ch : "java".toCharArray()) {
            counts.merge(ch, 1, Integer::sum);
        }
        System.out.println(counts.get('a'));
        System.out.println(counts.get('z'));   // null, not 0
    }
}`,
        output: `Total: 60
[10, 30]
[30]
2
null`,
      },
    ],
    commonMistakes: [
      'Comparing wrapper objects with == expecting value comparison — it compares references, and only appears to "work" inside the cached -128 to 127 range.',
      'Unboxing a null wrapper reference (e.g. a null Integer used in arithmetic), which throws a NullPointerException at runtime.',
      'Repeatedly autoboxing/unboxing inside performance-critical loops without realizing each operation allocates a wrapper object, adding overhead.',
      'Forgetting that primitive char autoboxes to Character, not to a numeric wrapper, since char behaves differently from the numeric primitives.',
      'Calling <code>list.remove(1)</code> on a <code>List&lt;Integer&gt;</code> to remove the value 1 — it removes the element at index 1 instead.',
      'Using the deprecated <code>new Integer(5)</code> constructor instead of <code>Integer.valueOf(5)</code> or autoboxing.',
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
