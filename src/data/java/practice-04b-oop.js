// Practice blocks for the Object-Oriented Programming module, part 2 of 3
// (polymorphism through the Object class). Merged onto the lesson entries in
// index.js by slug, so the lesson prose files stay unchanged.
export const practice04bOop = {
  'polymorphism-in-java-an-overview': {
    whyItMatters: `Polymorphism is what lets you write code against a general type and have it work for every specific type, including ones written later. A method that takes a <code>Notification</code> does not need a new branch each time someone adds a new kind of notification. Without it, programs grow long chains of <code>if</code> and <code>instanceof</code> checks that must be edited for every new case.`,
    exercise: {
      prompt: `Create two kinds of notification that share a parent type. Each overrides <code>send()</code> to return its own text. Store one of each in an array of the parent type and print the result of <code>send()</code> for every element.

Expected output: <code>Email sent</code> then <code>SMS sent</code>`,
      starterCode: `class Notification {
    String send() {
        return "Notification sent";
    }
}

// TODO: class EmailNotification extends Notification, returning "Email sent"
// TODO: class SmsNotification extends Notification, returning "SMS sent"

public class NotifyDemo {
    public static void main(String[] args) {
        Notification[] queue = { new EmailNotification(), new SmsNotification() };
        // TODO: loop over the queue and print send() for each element
    }
}`,
      hints: [
        'Mark each overriding method with <code>@Override</code> so the compiler checks the signature.',
        'The loop variable has type <code>Notification</code>, but the method that runs is chosen by the actual object.',
      ],
      solution: `class Notification {
    String send() {
        return "Notification sent";
    }
}

class EmailNotification extends Notification {
    @Override
    String send() {
        return "Email sent";
    }
}

class SmsNotification extends Notification {
    @Override
    String send() {
        return "SMS sent";
    }
}

public class NotifyDemo {
    public static void main(String[] args) {
        Notification[] queue = { new EmailNotification(), new SmsNotification() };
        for (Notification notification : queue) {
            System.out.println(notification.send());
        }
    }
}`,
    },
    quiz: [
      {
        question: 'When is a call to an overloaded method resolved?',
        options: ['It is never resolved', 'At runtime, from the object type', 'When the class is loaded', 'At compile time, from the argument types'],
        answer: 3,
        explanation: 'Overloading is compile-time polymorphism: the compiler picks the method from the declared types of the arguments.',
      },
      {
        question: 'When is a call to an overridden instance method resolved?',
        options: ['At runtime, from the actual object type', 'At compile time, from the reference type', 'When the source file is saved', 'By the garbage collector'],
        answer: 0,
        explanation: 'Overriding is runtime polymorphism: the JVM looks at the real class of the object and runs its version.',
      },
      {
        question: 'Dog overrides <code>sound()</code> from Animal. What does <code>Animal a = new Dog(); a.sound();</code> run?',
        options: ['Animal\'s sound()', 'It does not compile', 'Both, Animal first', 'Dog\'s sound()'],
        answer: 3,
        explanation: 'The reference type is Animal, but the object is a Dog, so Dog\'s overriding method runs.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between compile-time and runtime polymorphism?',
        answer: `Compile-time polymorphism is method overloading: several methods share a name, and the compiler chooses one from the number and types of the arguments. Runtime polymorphism is method overriding: a subclass replaces an inherited method, and the JVM chooses the version to run from the actual type of the object when the call happens.`,
      },
      {
        question: 'Do fields and static methods take part in runtime polymorphism?',
        answer: `No. Only instance methods are dispatched on the actual object. Fields and static methods are resolved from the declared type of the reference at compile time. A subclass that declares a field or static method with the same name hides the parent's version rather than overriding it.`,
      },
    ],
  },

  'method-overriding': {
    whyItMatters: `Overriding is how a subclass changes behaviour it inherited. A small mistake — a misspelt name or a slightly different parameter type — silently creates a new, unrelated method instead of an override, and the parent's version keeps running. The <code>@Override</code> annotation turns that silent bug into a compile error, which is why experienced developers always write it.`,
    exercise: {
      prompt: `This program should print <code>4</code> then <code>2</code>, but it prints <code>4</code> twice because the method in <code>Bike</code> is misspelt, so it does not override anything. Add <code>@Override</code> to see the compiler report the problem, then fix the name.

Expected output: <code>4</code> then <code>2</code>`,
      starterCode: `class Vehicle {
    int wheels() {
        return 4;
    }
}

class Bike extends Vehicle {
    int wheel() {
        return 2;
    }
}

public class WheelsDemo {
    public static void main(String[] args) {
        Vehicle car = new Vehicle();
        Vehicle bike = new Bike();
        System.out.println(car.wheels());
        System.out.println(bike.wheels());
    }
}`,
      hints: [
        'An override must have exactly the same name and parameter list as the parent method.',
        'With <code>@Override</code> on a method that overrides nothing, the code will not compile.',
      ],
      solution: `class Vehicle {
    int wheels() {
        return 4;
    }
}

class Bike extends Vehicle {
    @Override
    int wheels() {
        return 2;
    }
}

public class WheelsDemo {
    public static void main(String[] args) {
        Vehicle car = new Vehicle();
        Vehicle bike = new Bike();
        System.out.println(car.wheels());  // 4
        System.out.println(bike.wheels()); // 2
    }
}`,
    },
    quiz: [
      {
        question: 'A parent method is <code>public</code>. Can the overriding method be <code>protected</code>?',
        options: ['Yes', 'Only if the class is abstract', 'No, an override cannot reduce visibility', 'Only if it is also final'],
        answer: 2,
        explanation: 'An override may keep or widen access but never narrow it, otherwise code using the parent type could lose access to the method.',
      },
      {
        question: 'Can a private method be overridden?',
        options: ['Yes', 'Only within the same package', 'Only with @Override', 'No, it is not visible to the subclass'],
        answer: 3,
        explanation: 'A private method is not inherited. A subclass method with the same name is simply a new, separate method.',
      },
      {
        question: 'A parent method returns <code>Shape</code>. Can the override return <code>Circle</code>, a subclass of Shape?',
        options: ['Yes, this is a covariant return type', 'No, the return type must be identical', 'Only for abstract methods', 'Only if Circle is final'],
        answer: 0,
        explanation: 'An overriding method may return a subtype of the original return type. This is called a covariant return type.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the rules for overriding a method?',
        answer: `The method must have the same name and parameter list. The return type must be the same or a subtype. The access level must be the same or wider. It must not throw new or broader checked exceptions than the parent method. And the parent method must be inherited and overridable: not private, not static, and not final.`,
      },
      {
        question: 'Can static, final or private methods be overridden?',
        answer: `No to all three. A <code>final</code> method is explicitly closed to overriding, and trying is a compile error. A <code>private</code> method is not inherited, so a same-named method in the subclass is unrelated. A <code>static</code> method belongs to the class; a subclass can declare one with the same signature, but that hides the parent's method and is resolved at compile time.`,
      },
    ],
  },

  'runtime-polymorphism-and-dynamic-binding': {
    whyItMatters: `Dynamic binding is the mechanism behind polymorphism: the JVM decides which method body to run by looking at the real object, not at the variable's declared type. The catch is that this applies only to instance methods. Fields are bound at compile time, and code that reads a field through a parent reference gets the parent's value — a subtle bug that this lesson's exercise makes visible.`,
    diagram: {
      caption: 'The reference type decides which methods you may call. The object type decides which method body actually runs.',
      svg: `<svg viewBox="0 0 640 170" role="img" aria-label="A reference of type Shape points to a Square object; calling area on it runs Square's area method" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-monospace, monospace" font-size="13">
  <rect x="10" y="50" width="150" height="50" rx="6"/>
  <text x="85" y="72" text-anchor="middle" fill="currentColor" stroke="none">Shape s</text>
  <text x="85" y="89" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">reference type</text>
  <path d="M160 75 H250"/><path d="M244 69 L250 75 L244 81"/>
  <rect x="250" y="40" width="170" height="70" rx="8" stroke-width="3"/>
  <text x="335" y="66" text-anchor="middle" fill="currentColor" stroke="none">Square object</text>
  <text x="335" y="84" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">actual type</text>
  <text x="335" y="100" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">area() overridden</text>
  <path d="M420 75 H470"/><path d="M464 69 L470 75 L464 81"/>
  <rect x="470" y="50" width="160" height="50" rx="6"/>
  <text x="550" y="72" text-anchor="middle" fill="currentColor" stroke="none">Square.area()</text>
  <text x="550" y="89" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">runs at runtime</text>
  <text x="85" y="140" text-anchor="middle" fill="currentColor" stroke="none" font-size="12">compile time</text>
  <text x="85" y="156" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">is area() in Shape?</text>
  <text x="440" y="140" text-anchor="middle" fill="currentColor" stroke="none" font-size="12">runtime</text>
  <text x="440" y="156" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">which class is the object?</text>
</svg>`,
    },
    exercise: {
      prompt: `This program prints <code>parent</code> and then <code>child method</code>: the method call is polymorphic, but the field access is not. Add an overridable <code>getName()</code> method to both classes and use it in <code>main</code> so the first line prints <code>child</code>.

Expected output: <code>child</code> then <code>child method</code>`,
      starterCode: `class Parent {
    String name = "parent";

    String who() {
        return "parent method";
    }
}

class Child extends Parent {
    String name = "child";

    @Override
    String who() {
        return "child method";
    }
}

public class BindingDemo {
    public static void main(String[] args) {
        Parent p = new Child();
        System.out.println(p.name);
        System.out.println(p.who());
    }
}`,
      hints: [
        '<code>p.name</code> is resolved from the declared type <code>Parent</code>, so it reads the parent\'s field.',
        'A method is resolved from the object, so <code>p.getName()</code> runs the child\'s version if it overrides it.',
      ],
      solution: `class Parent {
    String name = "parent";

    String getName() {
        return name;
    }

    String who() {
        return "parent method";
    }
}

class Child extends Parent {
    String name = "child";

    @Override
    String getName() {
        return name;
    }

    @Override
    String who() {
        return "child method";
    }
}

public class BindingDemo {
    public static void main(String[] args) {
        Parent p = new Child();
        System.out.println(p.getName()); // child
        System.out.println(p.who());     // child method
    }
}`,
    },
    quiz: [
      {
        question: 'Parent and Child both declare a field <code>name</code>. What does <code>Parent p = new Child(); p.name</code> read?',
        options: ['The Parent field', 'The Child field', 'Both, joined together', 'It does not compile'],
        answer: 0,
        explanation: 'Field access is bound at compile time from the declared type of the reference, which is Parent.',
      },
      {
        question: 'Which kinds of method use static (compile-time) binding?',
        options: ['Overridden instance methods', 'static, private and final methods', 'Abstract methods', 'All methods'],
        answer: 1,
        explanation: 'These cannot be overridden, so the compiler knows exactly which method will run and binds the call early.',
      },
      {
        question: 'Does assigning a Child object to a Parent variable need an explicit cast?',
        options: ['Yes, always', 'Only for interfaces', 'Only for abstract classes', 'No, upcasting is implicit'],
        answer: 3,
        explanation: 'Every Child is a Parent, so the conversion is always safe and the compiler performs it automatically.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between static binding and dynamic binding?',
        answer: `Static binding happens at compile time: the compiler decides which method or field a name refers to, using the declared types. It applies to static, private and final methods, to overloaded method selection, and to all fields. Dynamic binding happens at runtime: for an overridable instance method, the JVM looks at the actual class of the object and runs that class's version.`,
      },
      {
        question: 'What is upcasting and why is it useful?',
        answer: `Upcasting is treating an object as one of its supertypes, for example storing a <code>Square</code> in a <code>Shape</code> variable. It is always safe and needs no cast. It is useful because code written against the general type works with every subtype: one method that accepts a <code>Shape</code> handles squares, circles and any shape added later.`,
      },
    ],
  },

  'instance-initializer-block': {
    whyItMatters: `Instance initializer blocks are rare in everyday code, but the order in which Java runs static blocks, instance blocks and constructors is a classic "what does this print?" question. Knowing the order also explains surprising behaviour during object creation, such as a field being read before the constructor has set it.`,
    exercise: {
      prompt: `Add a static block, an instance initializer block and a constructor to <code>Session</code>, each printing one word, so that creating two objects produces the output below.

Expected output: <code>static</code>, <code>instance</code>, <code>constructor</code>, <code>instance</code>, <code>constructor</code>, each on its own line.`,
      starterCode: `class Session {
    // TODO: a static block that prints "static"
    // TODO: an instance initializer block that prints "instance"
    // TODO: a constructor that prints "constructor"
}

public class SessionDemo {
    public static void main(String[] args) {
        new Session();
        new Session();
    }
}`,
      hints: [
        'A static block is written <code>static { ... }</code>; an instance block is just <code>{ ... }</code> inside the class.',
        'The static block runs once, when the class is first used. The instance block runs before the constructor body, every time.',
      ],
      solution: `class Session {
    static {
        System.out.println("static");
    }

    {
        System.out.println("instance");
    }

    Session() {
        System.out.println("constructor");
    }
}

public class SessionDemo {
    public static void main(String[] args) {
        new Session();
        new Session();
    }
}`,
    },
    quiz: [
      {
        question: 'When does an instance initializer block run?',
        options: ['Each time an object is created, before the constructor body', 'Once, when the class is loaded', 'After the constructor finishes', 'Only when called by name'],
        answer: 0,
        explanation: 'The compiler copies instance initializer code into every constructor, after the call to super() and before the rest of the body.',
      },
      {
        question: 'You create three objects of a class that has a static block. How many times does the static block run?',
        options: ['Three times', 'Once', 'Never', 'Six times'],
        answer: 1,
        explanation: 'A static block runs a single time, during class initialisation, regardless of how many objects are created.',
      },
      {
        question: 'A class has a field initializer and an instance block that both assign the same field. Which assignment wins?',
        options: ['Always the field initializer', 'Always the instance block', 'Whichever appears later in the source file', 'It is a compile error'],
        answer: 2,
        explanation: 'Field initializers and instance blocks run in the order they appear in the class, so the later one overwrites the earlier one.',
      },
    ],
    interviewQuestions: [
      {
        question: 'In what order do static blocks, instance blocks and constructors run, including a parent class?',
        answer: `When the class is first used: the parent's static blocks, then the child's static blocks, once each. Then, for every object created: the parent's instance initializers and instance blocks, the parent's constructor body, the child's instance initializers and instance blocks, and finally the child's constructor body.`,
      },
      {
        question: 'Why would you use an instance initializer block instead of a constructor?',
        answer: `To share initialisation code between several constructors without repeating it or chaining them, and to initialise anonymous classes, which cannot declare a constructor. In ordinary classes, constructor chaining with <code>this(...)</code> or a private helper method is usually clearer, which is why instance blocks are uncommon.`,
      },
    ],
  },

  'abstraction-and-abstract-classes': {
    whyItMatters: `An abstract class lets you write the shared part of a family of classes once and force each subclass to supply the part that differs. It is the tool for "every employee is paid, but how the pay is calculated depends on the type". The compiler then guarantees that no subclass forgets to provide its piece.`,
    exercise: {
      prompt: `Complete the two subclasses of the abstract <code>Employee</code>. A full-time employee is paid a fixed salary; a contractor is paid hours multiplied by an hourly rate.

Expected output: <code>Pay: 50000</code> then <code>Pay: 30000</code>`,
      starterCode: `abstract class Employee {
    abstract int pay();

    String describe() {
        return "Pay: " + pay();
    }
}

// TODO: class FullTime extends Employee, constructed with a salary
// TODO: class Contractor extends Employee, constructed with hours and a rate

public class PayrollDemo {
    public static void main(String[] args) {
        Employee[] staff = { new FullTime(50000), new Contractor(100, 300) };
        for (Employee employee : staff) {
            System.out.println(employee.describe());
        }
    }
}`,
      hints: [
        'Each subclass must implement <code>pay()</code>, or it would have to be declared abstract too.',
        '<code>describe()</code> is inherited as it is; it calls whichever <code>pay()</code> the object provides.',
      ],
      solution: `abstract class Employee {
    abstract int pay();

    String describe() {
        return "Pay: " + pay();
    }
}

class FullTime extends Employee {
    private final int salary;

    FullTime(int salary) {
        this.salary = salary;
    }

    @Override
    int pay() {
        return salary;
    }
}

class Contractor extends Employee {
    private final int hours;
    private final int rate;

    Contractor(int hours, int rate) {
        this.hours = hours;
        this.rate = rate;
    }

    @Override
    int pay() {
        return hours * rate;
    }
}

public class PayrollDemo {
    public static void main(String[] args) {
        Employee[] staff = { new FullTime(50000), new Contractor(100, 300) };
        for (Employee employee : staff) {
            System.out.println(employee.describe());
        }
    }
}`,
    },
    quiz: [
      {
        question: '<code>Shape</code> is an abstract class. What happens with <code>new Shape()</code>?',
        options: ['It creates an empty Shape', 'It returns null', 'It throws an exception at runtime', 'It does not compile'],
        answer: 3,
        explanation: 'An abstract class cannot be instantiated directly. You create objects of its concrete subclasses.',
      },
      {
        question: 'Can an abstract class have no abstract methods at all?',
        options: ['Yes; abstract only means it cannot be instantiated', 'No, it needs at least one', 'Only if it is also final', 'Only if it implements an interface'],
        answer: 0,
        explanation: 'A class may be declared abstract purely to prevent direct instantiation, even when every method has a body.',
      },
      {
        question: 'A concrete subclass does not implement one of the abstract methods it inherits. What happens?',
        options: ['The method returns a default value', 'It does not compile unless the subclass is also abstract', 'It throws at runtime when called', 'The method is removed'],
        answer: 1,
        explanation: 'Every abstract method must be implemented by the first concrete class in the hierarchy.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Can an abstract class have a constructor if it cannot be instantiated?',
        answer: `Yes. The constructor is not called with <code>new</code> on the abstract class itself, but it runs whenever a subclass object is created, through <code>super(...)</code>. It is used to initialise the fields that the abstract class declares.`,
      },
      {
        question: 'Can an abstract method be private, static or final?',
        answer: `No. An abstract method exists to be overridden in a subclass. A private method is not visible to subclasses, a final method cannot be overridden, and a static method is not overridden at all, so each combination contradicts the purpose and is rejected by the compiler.`,
      },
    ],
  },

  'interfaces-in-java': {
    whyItMatters: `An interface describes what a class can do without saying how, and a class can implement as many as it needs. That is how unrelated classes are treated alike — anything <code>Comparable</code> can be sorted, anything <code>Runnable</code> can be run on a thread. Almost every Java framework is built around interfaces, so reading and designing them is an everyday skill.`,
    exercise: {
      prompt: `Define an interface <code>Payable</code> with an abstract method <code>amount()</code> and a default method <code>receipt()</code> that returns <code>"Paid "</code> followed by the amount. Then write an <code>Invoice</code> class that implements it.

Expected output: <code>Paid 1200</code>`,
      starterCode: `// TODO: interface Payable with int amount() and a default String receipt()

// TODO: class Invoice implements Payable, constructed with a total

public class PayableDemo {
    public static void main(String[] args) {
        Payable invoice = new Invoice(1200);
        System.out.println(invoice.receipt());
    }
}`,
      hints: [
        'A default method has a body and is written with the <code>default</code> keyword inside the interface.',
        'An implementing method must be <code>public</code>, because interface methods are public.',
      ],
      solution: `interface Payable {
    int amount();

    default String receipt() {
        return "Paid " + amount();
    }
}

class Invoice implements Payable {
    private final int total;

    Invoice(int total) {
        this.total = total;
    }

    @Override
    public int amount() {
        return total;
    }
}

public class PayableDemo {
    public static void main(String[] args) {
        Payable invoice = new Invoice(1200);
        System.out.println(invoice.receipt()); // Paid 1200
    }
}`,
    },
    quiz: [
      {
        question: 'A field declared inside an interface is implicitly what?',
        options: ['private', 'protected and static', 'public, static and final', 'An instance variable'],
        answer: 2,
        explanation: 'Interface fields are always constants: public, static and final, whether or not you write those modifiers.',
      },
      {
        question: 'A class implements two interfaces that both define a default method with the same signature. What must the class do?',
        options: ['Nothing; the first interface wins', 'Mark one interface as primary', 'Override the method itself, or the code does not compile', 'Remove one of the interfaces'],
        answer: 2,
        explanation: 'The compiler cannot choose between the two defaults, so the class must override the method and may call one with InterfaceName.super.method().',
      },
      {
        question: 'Can you create an interface instance with <code>new Payable()</code> on its own?',
        options: ['No; you need an implementing class, an anonymous class or a lambda', 'Yes', 'Only if it has default methods', 'Only if it has no methods'],
        answer: 0,
        explanation: 'An interface has no constructor. new Payable() { ... } works only because the braces define an anonymous implementing class.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why were default methods added to interfaces in Java 8?',
        answer: `To let interfaces evolve without breaking existing code. Before Java 8, adding a method to an interface forced every implementing class to be changed. A default method supplies a body in the interface itself, so existing implementations keep working. That is how methods such as <code>forEach</code> and <code>stream</code> were added to the collection interfaces.`,
      },
      {
        question: 'What is a functional interface?',
        answer: `An interface with exactly one abstract method. It may also have default and static methods. Because there is only one method to implement, an instance can be written as a lambda expression or a method reference. <code>Runnable</code>, <code>Comparator</code> and <code>Predicate</code> are examples, and the <code>@FunctionalInterface</code> annotation asks the compiler to enforce the rule.`,
      },
    ],
  },

  'abstract-class-vs-interface': {
    whyItMatters: `Choosing between an abstract class and an interface is a real design decision, and since Java 8 gave interfaces default methods the difference is less obvious than textbooks suggest. What still separates them is state and inheritance: an abstract class can hold fields and constructors but uses up the single <code>extends</code>, while a class can implement any number of interfaces.`,
    exercise: {
      prompt: `Model birds where every bird has a name (shared state, so an abstract class) but only some can fly (a capability, so an interface). Complete <code>Sparrow</code> and <code>Penguin</code>.

Expected output: <code>Chirpy flies</code> then <code>false</code>`,
      starterCode: `interface Flyable {
    String fly();
}

abstract class Bird {
    protected final String name;

    Bird(String name) {
        this.name = name;
    }
}

// TODO: class Sparrow extends Bird and implements Flyable; fly() returns "<name> flies"
// TODO: class Penguin extends Bird only

public class BirdDemo {
    public static void main(String[] args) {
        Sparrow sparrow = new Sparrow("Chirpy");
        Bird penguin = new Penguin("Pingu");
        System.out.println(sparrow.fly());
        System.out.println(penguin instanceof Flyable);
    }
}`,
      hints: [
        'A class can do both at once: <code>class Sparrow extends Bird implements Flyable</code>.',
        'Both subclasses need a constructor that passes the name to <code>super(name)</code>.',
      ],
      solution: `interface Flyable {
    String fly();
}

abstract class Bird {
    protected final String name;

    Bird(String name) {
        this.name = name;
    }
}

class Sparrow extends Bird implements Flyable {
    Sparrow(String name) {
        super(name);
    }

    @Override
    public String fly() {
        return name + " flies";
    }
}

class Penguin extends Bird {
    Penguin(String name) {
        super(name);
    }
}

public class BirdDemo {
    public static void main(String[] args) {
        Sparrow sparrow = new Sparrow("Chirpy");
        Bird penguin = new Penguin("Pingu");
        System.out.println(sparrow.fly());              // Chirpy flies
        System.out.println(penguin instanceof Flyable); // false
    }
}`,
    },
    quiz: [
      {
        question: 'Which of the two can declare instance fields that hold state for each object?',
        options: ['Interface', 'Abstract class', 'Both', 'Neither'],
        answer: 1,
        explanation: 'An abstract class can have instance fields. Interface fields are always public static final constants.',
      },
      {
        question: 'How many abstract classes can a class extend, and how many interfaces can it implement?',
        options: ['One of each', 'Any number of both', 'One abstract class, any number of interfaces', 'Any number of abstract classes, one interface'],
        answer: 2,
        explanation: 'Java allows a single superclass but any number of implemented interfaces.',
      },
      {
        question: 'Which of the two can have a constructor?',
        options: ['Interface', 'Abstract class', 'Both', 'Neither'],
        answer: 1,
        explanation: 'An abstract class can declare constructors, run through super() from subclasses. An interface has no constructors.',
      },
    ],
    interviewQuestions: [
      {
        question: 'When would you choose an abstract class over an interface?',
        answer: `Choose an abstract class when the subclasses are closely related and share state or substantial code: common fields, a constructor that sets them, and concrete methods that all subclasses reuse. Choose an interface to describe a capability that unrelated classes may have, or when a class needs to take on several roles at once.`,
      },
      {
        question: 'Now that interfaces have default methods, what can an abstract class still do that an interface cannot?',
        answer: `Hold instance state and initialise it through constructors. Declare members that are protected or package-private, and methods that are final. An interface still has only constants, no constructors, and members that are public (plus private helper methods since Java 9).`,
      },
    ],
  },

  'encapsulation': {
    whyItMatters: `Encapsulation is what stops other code from putting an object into a state that makes no sense — a negative width, an order with no customer. It also lets you change how a class stores its data later without breaking anything that uses it, because the outside world only ever touched the methods.`,
    exercise: {
      prompt: `Protect the fields of <code>Rectangle</code>. Width and height must be private, the setters must ignore values that are not positive, and <code>area()</code> returns the product.

Expected output: <code>12</code>, then <code>12</code> again after an attempt to set the width to -5.`,
      starterCode: `class Rectangle {
    int width;
    int height;

    // TODO: make the fields private
    // TODO: a constructor taking width and height
    // TODO: setWidth(int width) that ignores values of 0 or less
    // TODO: area()
}

public class RectangleDemo {
    public static void main(String[] args) {
        Rectangle rectangle = new Rectangle(3, 4);
        System.out.println(rectangle.area());
        rectangle.setWidth(-5);
        System.out.println(rectangle.area());
    }
}`,
      hints: [
        'Once the fields are private, the only way to change them is through methods you control.',
        'Put the rule inside the setter: assign only when the new value is greater than 0.',
      ],
      solution: `class Rectangle {
    private int width;
    private int height;

    Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    void setWidth(int width) {
        if (width > 0) {
            this.width = width;
        }
    }

    int area() {
        return width * height;
    }
}

public class RectangleDemo {
    public static void main(String[] args) {
        Rectangle rectangle = new Rectangle(3, 4);
        System.out.println(rectangle.area()); // 12
        rectangle.setWidth(-5);
        System.out.println(rectangle.area()); // 12
    }
}`,
    },
    quiz: [
      {
        question: 'Which access modifier is normally used for the fields of an encapsulated class?',
        options: ['private', 'protected', 'public', 'No modifier'],
        answer: 0,
        explanation: 'Private fields can be reached only from inside the class, so all access goes through its methods.',
      },
      {
        question: 'A class sets its fields in the constructor and provides getters but no setters. What does that make its objects?',
        options: ['Write-only', 'Read-only after construction', 'Static', 'Abstract'],
        answer: 1,
        explanation: 'With no setters, callers can read the values but cannot change them once the object exists.',
      },
      {
        question: 'What is a practical benefit of hiding fields behind methods?',
        options: ['The program uses less memory', 'Methods run faster than field access', 'The internal representation can change without breaking callers', 'The class no longer needs a constructor'],
        answer: 2,
        explanation: 'Callers depend only on the methods, so you are free to rename, restructure or recalculate the data inside.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between encapsulation and data hiding?',
        answer: `Data hiding is the narrower idea: making fields inaccessible from outside, usually with <code>private</code>. Encapsulation is broader: bundling the data together with the methods that operate on it, and exposing a controlled public interface. Data hiding is one of the techniques used to achieve encapsulation.`,
      },
      {
        question: 'Does adding a getter and setter for every field give you encapsulation?',
        answer: `Not really. If every field has a public setter with no rules, the object is as exposed as if the fields were public. Real encapsulation means exposing only the operations that make sense, validating inputs, and not handing out references to mutable internals — for example, returning a copy of a list rather than the list itself.`,
      },
    ],
  },

  'packages-and-access-modifiers': {
    whyItMatters: `Access modifiers decide who is allowed to depend on each part of your code. Anything public becomes a promise you have to keep; anything private can be changed freely. Choosing the narrowest level that works is one of the cheapest ways to keep a codebase maintainable, and the four levels are asked about in almost every Java interview.`,
    exercise: {
      prompt: `Everything in <code>Wallet</code> is public, so any code could set the balance directly. Tighten the access: make the field and the helper method private and keep only <code>deposit</code> and <code>getBalance</code> available to other classes. The output must not change.

Expected output: <code>500</code>`,
      starterCode: `class Wallet {
    public int balance;

    public boolean isValid(int amount) {
        return amount > 0;
    }

    public void deposit(int amount) {
        if (isValid(amount)) {
            balance += amount;
        }
    }

    public int getBalance() {
        return balance;
    }
}

public class WalletDemo {
    public static void main(String[] args) {
        Wallet wallet = new Wallet();
        wallet.deposit(500);
        wallet.deposit(-200);
        System.out.println(wallet.getBalance());
    }
}`,
      hints: [
        'Ask of each member: does code outside this class need it? If not, make it <code>private</code>.',
        '<code>isValid</code> is only used inside <code>deposit</code>, so it is an internal helper.',
      ],
      solution: `class Wallet {
    private int balance;

    private boolean isValid(int amount) {
        return amount > 0;
    }

    public void deposit(int amount) {
        if (isValid(amount)) {
            balance += amount;
        }
    }

    public int getBalance() {
        return balance;
    }
}

public class WalletDemo {
    public static void main(String[] args) {
        Wallet wallet = new Wallet();
        wallet.deposit(500);
        wallet.deposit(-200);
        System.out.println(wallet.getBalance()); // 500
    }
}`,
    },
    quiz: [
      {
        question: 'A member is declared with no access modifier. Where is it visible?',
        options: ['Everywhere', 'Only inside its own class', 'In the same package and in all subclasses', 'Only within the same package'],
        answer: 3,
        explanation: 'No modifier means package-private (default) access: any class in the same package can use it, and nothing outside can.',
      },
      {
        question: 'Where is a <code>protected</code> member visible?',
        options: ['In the same package, and in subclasses in other packages', 'Only in subclasses', 'Everywhere', 'Only in its own class'],
        answer: 0,
        explanation: 'protected is package access plus access from subclasses, even when those subclasses are in a different package.',
      },
      {
        question: 'Which access modifiers are allowed on a top-level class?',
        options: ['All four', 'protected or private', 'public or private', 'public or no modifier'],
        answer: 3,
        explanation: 'A top-level class can be public or package-private. private and protected apply only to members and nested classes.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the four access levels in Java, from most to least restrictive?',
        answer: `<code>private</code>: visible only inside the declaring class. Default (no modifier, also called package-private): visible within the same package. <code>protected</code>: visible within the same package and to subclasses in any package. <code>public</code>: visible everywhere.`,
      },
      {
        question: 'What is the purpose of packages?',
        answer: `Packages group related classes, which keeps large codebases organised. They prevent naming conflicts, because two classes with the same simple name can exist in different packages. And they form an access boundary: package-private members are shared between classes that work together while staying hidden from everything else.`,
      },
    ],
  },

  'java-final-keyword': {
    whyItMatters: `<code>final</code> states that something will not change: a variable is assigned once, a method is not overridden, a class is not extended. It makes intent clear to readers and lets the compiler enforce it. The detail that surprises people is that a final variable holding an object does not make that object immutable.`,
    exercise: {
      prompt: `This program does not compile, because it reassigns a final variable. Remove the illegal line, keep the legal one, and notice that changing an element of a final array is allowed.

Expected output: <code>[10, 2, 3]</code>`,
      starterCode: `import java.util.Arrays;

public class FinalDemo {
    public static void main(String[] args) {
        final int[] scores = {1, 2, 3};

        scores[0] = 10;
        scores = new int[] {7, 8, 9};

        System.out.println(Arrays.toString(scores));
    }
}`,
      hints: [
        '<code>final</code> stops the variable from being pointed at a different array.',
        'It does not stop the contents of the array from being changed.',
      ],
      solution: `import java.util.Arrays;

public class FinalDemo {
    public static void main(String[] args) {
        final int[] scores = {1, 2, 3};

        scores[0] = 10;

        System.out.println(Arrays.toString(scores)); // [10, 2, 3]
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>final</code> mean on a method?',
        options: ['It cannot be called', 'It cannot be overloaded', 'It cannot be overridden by a subclass', 'It must return a constant'],
        answer: 2,
        explanation: 'A final method keeps its implementation in every subclass. It can still be called and overloaded.',
      },
      {
        question: 'What does <code>final</code> mean on a class?',
        options: ['It cannot be instantiated', 'It cannot be extended', 'All its fields are constants', 'It has no methods'],
        answer: 1,
        explanation: 'A final class cannot have subclasses. String is the best-known example.',
      },
      {
        question: 'Given <code>final List&lt;String&gt; names = new ArrayList&lt;&gt;();</code>, what happens with <code>names.add("Asha");</code>?',
        options: ['It works; final only prevents reassigning the variable', 'It does not compile', 'It throws UnsupportedOperationException', 'It is ignored'],
        answer: 0,
        explanation: 'The reference cannot be changed, but the list it refers to is an ordinary mutable ArrayList.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a blank final variable?',
        answer: `A final field declared without an initial value. It must be assigned exactly once before the constructor finishes, usually inside the constructor, and can never be changed afterwards. This lets each object have its own constant value, such as an id passed in at creation.`,
      },
      {
        question: 'What does "effectively final" mean?',
        answer: `A local variable that is never reassigned after its first assignment is effectively final, even without the keyword. Lambdas and anonymous classes may only use local variables that are final or effectively final, which is why changing a captured variable inside or after a lambda causes a compile error.`,
      },
    ],
    seeAlso: [
      { lessonId: 'lesson_java_core_final_vs_finally_vs_finalize', label: 'final vs finally vs finalize' },
    ],
  },

  'object-class-and-its-methods': {
    whyItMatters: `Every class inherits <code>equals()</code>, <code>hashCode()</code> and <code>toString()</code> from <code>Object</code>, and the default versions are rarely what you want: two objects with the same data are "not equal", and printing one shows a class name and a number. Overriding these correctly is what makes your objects work in a <code>HashSet</code>, as <code>HashMap</code> keys, and in log output.`,
    exercise: {
      prompt: `Two <code>Email</code> objects should be equal when their addresses match, ignoring upper and lower case. At the moment the program prints <code>false</code>. Override <code>equals()</code> and <code>hashCode()</code> so it prints <code>true</code>.`,
      starterCode: `import java.util.HashSet;
import java.util.Set;

class Email {
    private final String address;

    Email(String address) {
        this.address = address;
    }

    // TODO: override equals() to compare addresses ignoring case
    // TODO: override hashCode() so equal emails have the same hash code
}

public class EmailDemo {
    public static void main(String[] args) {
        Set<Email> seen = new HashSet<>();
        seen.add(new Email("Asha@Example.com"));
        System.out.println(seen.contains(new Email("asha@example.com")));
    }
}`,
      hints: [
        'In <code>equals</code>, check that the other object is an <code>Email</code>, then compare with <code>equalsIgnoreCase</code>.',
        'The hash code must ignore case too: use <code>address.toLowerCase().hashCode()</code>.',
      ],
      solution: `import java.util.HashSet;
import java.util.Set;

class Email {
    private final String address;

    Email(String address) {
        this.address = address;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Email)) {
            return false;
        }
        return address.equalsIgnoreCase(((Email) other).address);
    }

    @Override
    public int hashCode() {
        return address.toLowerCase().hashCode();
    }
}

public class EmailDemo {
    public static void main(String[] args) {
        Set<Email> seen = new HashSet<>();
        seen.add(new Email("Asha@Example.com"));
        System.out.println(seen.contains(new Email("asha@example.com"))); // true
    }
}`,
    },
    quiz: [
      {
        question: 'What does the default <code>equals()</code> inherited from Object compare?',
        options: ['The values of all fields', 'Whether both references point to the same object', 'The class names', 'The hash codes only'],
        answer: 1,
        explanation: 'Object.equals() behaves like ==. Two separate objects are not equal until the class overrides equals().',
      },
      {
        question: 'What does the default <code>toString()</code> return?',
        options: ['The field values', 'An empty string', 'The class name, an @ sign and the hash code in hexadecimal', 'null'],
        answer: 2,
        explanation: 'For example Point@1b6d3586. Override toString() to return something meaningful.',
      },
      {
        question: 'If two objects are equal according to <code>equals()</code>, what must be true of their hash codes?',
        options: ['They must be different', 'There is no requirement', 'They must both be zero', 'They must be equal'],
        answer: 3,
        explanation: 'Equal objects must return the same hash code. Unequal objects may share one, although that makes hash tables slower.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the contract between equals() and hashCode()?',
        answer: `If two objects are equal according to <code>equals()</code>, they must return the same <code>hashCode()</code>. The reverse is not required: two unequal objects may have the same hash code. The hash code must also stay the same for as long as the fields used in <code>equals()</code> do not change.`,
      },
      {
        question: 'What goes wrong if you override equals() but not hashCode()?',
        answer: `Hash-based collections stop working for that class. A <code>HashSet</code> or <code>HashMap</code> uses the hash code to choose a bucket before it ever calls <code>equals()</code>. Two equal objects with different default hash codes end up in different buckets, so <code>contains()</code> returns false and a set can hold duplicates.`,
      },
    ],
    seeAlso: [
      { lessonId: 'lesson_java_core_how_hashmap_works_internally', label: 'How HashMap Works Internally' },
    ],
  },
}
