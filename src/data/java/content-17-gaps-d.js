// Java OOP gap-fill module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content17GapsD = {
  'call-by-value-in-java': {
    title: 'Call By Value in Java',
    intro: `One of the most persistent myths in Java is that objects are "passed by reference." They are not. Java is, without exception, strictly pass-by-value — every single time you call a method, Java copies the value stored in the argument and hands that copy to the method. What differs between primitives and objects is what that "value" actually is.

For a primitive (int, double, boolean, and so on), the value is the literal data itself, so the method receives an independent copy of the number. For an object, the variable never holds the object — it holds a reference (essentially a memory address pointing to the object on the heap). When you pass an object variable to a method, Java copies that reference, not the object. The method now has its own copy of the address, but that copy still points to the exact same object in memory.`,
    sections: [
      {
        heading: 'Why Mutating Fields "Looks Like" Pass-by-Reference',
        body: `Because the copied reference points to the same heap object, calling a method that changes the object's fields through that reference (e.g. <code>obj.setName("New")</code>) really does change the object the caller sees — there is only one object, and both the caller's reference and the parameter's reference point to it. This is the source of the confusion: people see the caller's object change and assume Java passed the object itself. In reality, Java passed a copy of the pointer to that one shared object.`,
      },
      {
        heading: 'Why Reassigning the Parameter Does Not Affect the Caller',
        body: `Reassigning the parameter inside the method (e.g. <code>param = new Employee("Someone Else")</code>) only changes what the local copy of the reference points to. It does not — and cannot — reach back and change the caller's original variable, because the caller's variable is a completely separate copy of the reference. Once the method returns, the caller's variable still points to the original object, unaffected by the reassignment.`,
      },
      {
        heading: 'Primitives vs Objects — the Same Rule, Two Effects',
        body: `The underlying rule never changes: a copy of the value is passed. It only looks different because a primitive's "value" is the data, while an object variable's "value" is an address. Keeping this single mental model — "always a copy of the value, and for objects that value is an address" — resolves nearly every confusing case you will encounter with method parameters in Java.`,
        list: [
          'Passing a primitive: the method gets a copy of the number; changes to the parameter never affect the caller\'s variable.',
          'Passing an object and mutating its fields: both references point to the same object, so the change is visible to the caller.',
          'Passing an object and reassigning the parameter: only the local copy of the reference changes; the caller\'s reference is untouched.',
        ],
      },
      {
        heading: 'What Happens in Memory During a Call',
        body: `Each method call gets its own stack frame, and every parameter is a brand-new local variable in that frame. When the call starts, Java copies the argument's value into the parameter. When the call ends, the frame and all its parameters are thrown away. Objects live separately on the heap, so they survive the call. That is why a change made through a reference outlives the method, while a change made to the parameter variable itself disappears with the frame.`,
      },
      {
        heading: 'The Classic Test: Why a swap Method Fails',
        body: `A <code>swap(int a, int b)</code> method that exchanges its two parameters looks correct but changes nothing for the caller, because it only swaps the two local copies. The same is true for <code>swap(Employee a, Employee b)</code>: it swaps the copied references, not the caller's variables. To swap for real, swap the contents of something both sides share, such as two elements of the same array, or return the result.`,
      },
      {
        heading: 'Strings and Wrapper Types Look Like Primitives',
        body: `<code>String</code>, <code>Integer</code> and the other wrapper classes are objects, so a copy of the reference is passed. They are also <strong>immutable</strong>: no method can change them in place. Something like <code>text = text + "!"</code> builds a new <code>String</code> and points only the local copy at it, so the caller still sees the original. A mutable type such as <code>StringBuilder</code> behaves differently, because <code>append</code> changes the one object both references share.`,
      },
      {
        heading: 'How to Get a Changed Value Back to the Caller',
        body: `Since a method can never rebind the caller's variable, pick one of these instead:`,
        list: [
          '<strong>Return the new value</strong> and let the caller store it (<code>score = addBonus(score);</code>). This is the clearest option and the usual choice.',
          '<strong>Change a shared mutable object</strong>, such as a field of an object, an array element or a collection, when updating that object is the method\'s job.',
          '<strong>Return a small result object or record</strong> when a method needs to hand back several values at once.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Mutating fields is visible to the caller; reassigning the reference is not',
        code: `class Employee {
    String name;
    Employee(String name) { this.name = name; }
}

public class CallByValueDemo {

    static void mutateField(Employee e) {
        e.name = "Changed Inside Method"; // same object, so caller sees this
    }

    static void reassignReference(Employee e) {
        e = new Employee("Brand New Object"); // only the local copy of the reference changes
    }

    static void changePrimitive(int value) {
        value = value + 100; // only the local copy changes
    }

    public static void main(String[] args) {
        Employee emp = new Employee("Original");
        mutateField(emp);
        System.out.println(emp.name); // field mutation IS visible

        reassignReference(emp);
        System.out.println(emp.name); // reassignment is NOT visible

        int score = 10;
        changePrimitive(score);
        System.out.println(score); // primitive change is NOT visible
    }
}`,
        output: `Changed Inside Method
Changed Inside Method
10`,
      },
      {
        caption: 'A swap method fails on primitives but works on a shared array',
        code: `public class SwapDemo {
    static void swap(int a, int b) {
        int temp = a;
        a = b;
        b = temp; // swaps the local copies only
    }

    static void swapInArray(int[] values) {
        int temp = values[0];
        values[0] = values[1];
        values[1] = temp; // changes the one array both references point to
    }

    public static void main(String[] args) {
        int x = 1, y = 2;
        swap(x, y);
        System.out.println("After swap: x = " + x + ", y = " + y);

        int[] pair = {1, 2};
        swapInArray(pair);
        System.out.println("After swapInArray: " + pair[0] + ", " + pair[1]);
    }
}`,
        output: `After swap: x = 1, y = 2
After swapInArray: 2, 1`,
      },
      {
        caption: 'An immutable String is unaffected; a mutable StringBuilder changes',
        code: `public class StringParamDemo {
    static void addMark(String text) {
        text = text + "!"; // builds a new String; only the local reference moves to it
    }

    static void addMark(StringBuilder text) {
        text.append("!"); // changes the one StringBuilder the caller also points to
    }

    public static void main(String[] args) {
        String greeting = "Hello";
        addMark(greeting);
        System.out.println(greeting);

        StringBuilder builder = new StringBuilder("Hello");
        addMark(builder);
        System.out.println(builder);
    }
}`,
        output: `Hello
Hello!`,
      },
      {
        caption: 'Returning the new value is how a method hands a change back',
        code: `public class ReturnValueDemo {
    static int addBonus(int score) {
        return score + 100; // hand the new value back instead of changing the parameter
    }

    public static void main(String[] args) {
        int score = 10;
        addBonus(score);              // result ignored, score unchanged
        System.out.println(score);
        score = addBonus(score);      // caller chooses to store the result
        System.out.println(score);
    }
}`,
        output: `10
110`,
      },
    ],
    commonMistakes: [
      'Saying Java is "pass by reference for objects" — Java always passes a copy of the value; for objects that value happens to be a reference.',
      'Expecting a method to replace the caller\'s object by reassigning the parameter (e.g. writing a "swap two objects" method that just reassigns the two parameters) — this only rebinds local copies and has no effect outside the method.',
      'Concluding that because field mutation is visible, reassignment must also be visible — these are two entirely different operations on the reference.',
      'Confusing Java with languages like C++ that have true reference parameters (&) or with C-style pointer-to-pointer techniques, neither of which Java supports.',
    ],
    keyPoints: [
      'Java is always pass-by-value — there is no pass-by-reference in Java, ever.',
      'For primitives, a copy of the actual value is passed.',
      'For objects, a copy of the reference (address) is passed — both copies point to the same object, so field mutations are visible to the caller.',
      'Reassigning the parameter inside a method only changes the local copy of the reference; the caller\'s original reference is never affected.',
    ],
  },

  'aggregation-in-java': {
    title: 'Aggregation in Java',
    intro: `Aggregation is a specialized form of association that models a "has-a" relationship between two classes, where the contained object's lifecycle is independent of the container. This is often described as a "weak" or "loose" ownership relationship — the whole can be destroyed without destroying its parts.

A classic example is a Department that has Employees. An Employee can be transferred to another department, or can exist in the system even if a particular Department object is deleted — the Employee was never truly "owned" by that one Department. This independence is exactly what distinguishes aggregation from its stronger sibling, composition.`,
    sections: [
      {
        heading: 'HAS-A vs IS-A',
        body: `Java classes relate to each other in two basic ways, and asking which one applies is the first step in any class design:`,
        list: [
          '<strong>IS-A</strong> is inheritance. A <code>Manager</code> IS-A <code>Employee</code>, so <code>class Manager extends Employee</code>. The child gets the parent\'s fields and methods and can be used anywhere the parent is expected.',
          '<strong>HAS-A</strong> is a field. An <code>Employee</code> HAS-A <code>Address</code>, so <code>Employee</code> declares a field of type <code>Address</code>. Nothing is inherited; the employee just keeps a reference and calls the address\'s methods when it needs them.',
          'A quick test: say the sentence out loud. "An employee is an address" is clearly wrong, so <code>extends</code> would be wrong too, while "an employee has an address" sounds right.',
          'HAS-A is the more flexible choice. You can swap the referenced object at runtime, share it between several owners, and change the <code>Address</code> class without breaking a class hierarchy. That is why the common advice is "favour composition over inheritance", where composition here means HAS-A in general.',
        ],
      },
      {
        heading: 'Aggregation vs Composition',
        body: `Both aggregation and composition are "has-a" relationships implemented in Java the same syntactic way — one class holds a reference to another as a field. The difference is purely conceptual/lifecycle-based, not something the compiler enforces.`,
        list: [
          '<strong>Aggregation (weak ownership)</strong> — the contained object can exist independently and can even be shared between multiple containers. Example: a Department "has" Employees, but Employees exist without any particular Department.',
          '<strong>Composition (strong ownership)</strong> — the contained object\'s lifecycle is tied to the container; it is typically created inside the container and destroyed with it. Example: a House "has" Rooms, and a Room stops making sense if the House object is destroyed.',
          'In code, aggregation is usually shown by passing an already-existing object into a constructor or setter, while composition is usually shown by the container creating the contained object internally (often with "new" inside its own constructor).',
        ],
      },
      {
        heading: 'How Aggregation Protects the Part Objects',
        body: `In aggregation, the container only stores a reference to an object that was created somewhere else. Removing the container, or setting its variable to <code>null</code>, removes that one reference and nothing else. The garbage collector frees an object only when no live reference to it is left, so the part stays alive as long as any other code still points to it.

This is what keeps the parts safe. Deleting a <code>Department</code> does not delete its employees. One <code>Address</code> object can be shared by several <code>Employee</code> objects, and it is still usable after all of them are gone.`,
        list: [
          'The part is created outside the container and passed in through a constructor or setter.',
          'Several containers can hold references to the same part at the same time.',
          'When a container is gone, the part survives as long as another reference to it exists.',
        ],
      },
      {
        heading: 'Why This Distinction Matters',
        body: `Recognizing aggregation versus composition helps you design classes that reflect real-world lifecycle rules. Modeling a relationship as aggregation when it should be composition (or vice versa) can lead to objects that are deleted too aggressively (losing data that should persist independently) or objects that linger unnecessarily (memory leaks, orphaned references) when they should have been cleaned up with their container.`,
      },
      {
        heading: 'When to Use Aggregation in Real Projects',
        body: `Choose aggregation when the part has a life and an identity of its own, outside the object that currently holds it. Typical signs:`,
        list: [
          'The part is stored or managed separately, for example employees in their own database table, so they must survive when a department is closed.',
          'The part can move between owners: an employee transfers to another department, a player joins another team.',
          'The same part is shared: one <code>Address</code> used by several employees, one <code>Course</code> listed in several programs.',
          'The part is supplied from outside, through a constructor or setter. Spring\'s dependency injection works this way: a service receives a repository that the framework created, and many services can share it.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Aggregation: Employees are created independently and merely referenced by Department',
        code: `import java.util.ArrayList;
import java.util.List;

class Employee {
    String name;
    Employee(String name) { this.name = name; }
}

class Department {
    String deptName;
    List<Employee> employees = new ArrayList<>();

    Department(String deptName) {
        this.deptName = deptName;
    }

    void addEmployee(Employee e) { // Employee created OUTSIDE, just referenced here
        employees.add(e);
    }
}

public class AggregationDemo {
    public static void main(String[] args) {
        Employee e1 = new Employee("Riya");
        Employee e2 = new Employee("Karan");

        Department engineering = new Department("Engineering");
        engineering.addEmployee(e1);
        engineering.addEmployee(e2);

        System.out.println(engineering.deptName + " has " + engineering.employees.size() + " employees");

        // Department is discarded, but the Employee objects still exist independently
        engineering = null;
        System.out.println(e1.name + " still exists after the department reference is gone");
    }
}`,
        output: `Engineering has 2 employees
Riya still exists after the department reference is gone`,
      },
      {
        caption: 'One Address shared by two Employees outlives both of them',
        code: `public class SharedPartDemo {
    public static void main(String[] args) {
        Address office = new Address("Pune");

        Employee riya = new Employee("Riya", office);
        Employee karan = new Employee("Karan", office);

        System.out.println(riya.name + " works in " + riya.address.city);
        System.out.println(karan.name + " works in " + karan.address.city);

        riya = null;  // one owner is gone
        karan = null; // and the other one too
        System.out.println("Address still usable: " + office.city);
    }
}

class Address {
    String city;
    Address(String city) { this.city = city; }
}

class Employee {
    String name;
    Address address; // HAS-A Address, but does not own it

    Employee(String name, Address address) {
        this.name = name;
        this.address = address; // receives an existing object
    }
}`,
        output: `Riya works in Pune
Karan works in Pune
Address still usable: Pune`,
      },
      {
        caption: 'Aggregation next to composition: an employee transfers, rooms belong to one house',
        code: `import java.util.ArrayList;
import java.util.List;

public class HasADemo {
    public static void main(String[] args) {
        Employee riya = new Employee("Riya");

        Department sales = new Department("Sales");
        Department support = new Department("Support");

        sales.hire(riya);
        System.out.println(riya.name + " is in " + sales.name + ": " + sales.staff.contains(riya));

        // Transfer: the same Employee object moves to another Department
        sales.leave(riya);
        support.hire(riya);
        System.out.println(riya.name + " is in " + support.name + ": " + support.staff.contains(riya));

        sales = null;    // closing a department does not touch its former staff
        System.out.println(riya.name + " still exists");

        House house = new House(3);
        System.out.println("House has " + house.roomCount() + " rooms");
        house = null;    // the rooms had no other reference, so they go with the house
    }
}

class Employee {
    String name;
    Employee(String name) { this.name = name; }
}

// Aggregation: Department receives Employees that already exist
class Department {
    String name;
    List<Employee> staff = new ArrayList<>();

    Department(String name) { this.name = name; }

    void hire(Employee e)  { staff.add(e); }
    void leave(Employee e) { staff.remove(e); }
}

// Composition: House creates its own Rooms, nobody else can reach them
class House {
    private final List<String> rooms = new ArrayList<>();

    House(int roomCount) {
        for (int i = 1; i <= roomCount; i++) {
            rooms.add("Room " + i);   // created inside, owned by this House
        }
    }

    int roomCount() { return rooms.size(); }
}`,
        output: `Riya is in Sales: true
Riya is in Support: true
Riya still exists
House has 3 rooms`,
      },
    ],
    commonMistakes: [
      'Treating aggregation and composition as if Java has separate keywords or syntax for them — both are plain object references; the difference is design intent and lifecycle management.',
      'Modeling a strongly-owned part (like a Room that only makes sense inside one House) as aggregation, letting it be shared or outlive its container incorrectly.',
      'Assuming aggregation implies a collection (like a List) is always involved — aggregation can just as easily be a single object reference.',
      'Forgetting that in aggregation, the same contained object can legitimately belong to multiple containers at once (an Employee could be referenced by a Project as well as a Department).',
    ],
    keyPoints: [
      'Aggregation models a "has-a" relationship with weak ownership — the part can exist independently of the whole.',
      'Composition also models "has-a" but with strong ownership — the part\'s lifecycle depends on the whole.',
      'The distinction is about design intent and object lifecycle, not different Java syntax.',
      'Aggregated objects are typically created outside the container and passed in, rather than created internally by the container.',
      'IS-A means inheritance (extends); HAS-A means a field that refers to another object. Prefer HAS-A unless the IS-A sentence is genuinely true.',
      'Use aggregation when the part can be shared, transferred or stored on its own, as with employees and departments.',
    ],
  },

  'polymorphism-in-java-an-overview': {
    title: 'Polymorphism in Java: An Overview',
    intro: `Polymorphism comes from Greek words meaning "many forms." In Java, it describes the ability of a single method name, or a single reference type, to behave differently depending on the context in which it is used. It is one of the four pillars of object-oriented programming, alongside encapsulation, inheritance, and abstraction.

Java supports two distinct kinds of polymorphism: compile-time (static) polymorphism, achieved through method overloading, and runtime (dynamic) polymorphism, achieved through method overriding. This lesson is a short orientation to both — the deeper mechanics of overriding and dynamic dispatch are covered in dedicated lessons elsewhere in this course.`,
    sections: [
      {
        heading: 'Compile-Time (Static) Polymorphism — Method Overloading',
        body: `Overloading lets a class define multiple methods with the same name but different parameter lists (different number, type, or order of parameters). The compiler decides which version to call by matching the arguments at compile time — hence "static" or "compile-time" polymorphism. Overloaded methods can differ in return type too, but return type alone is never enough to distinguish them.`,
      },
      {
        heading: 'Runtime (Dynamic) Polymorphism — Method Overriding',
        body: `Overriding lets a subclass provide its own implementation of a method already defined in its superclass, using the exact same signature. Which version actually runs is decided at runtime, based on the real (runtime) type of the object being referenced — not the type of the reference variable. This is what allows a single line of code like <code>animal.makeSound()</code> to produce different behavior depending on whether "animal" actually refers to a Dog or a Cat object.`,
      },
      {
        heading: 'Why the Distinction Matters',
        body: `Compile-time polymorphism is about convenience and readability — one intuitive method name covering several related use cases. Runtime polymorphism is far more powerful architecturally: it is the mechanism behind interfaces, abstract classes, and extensible frameworks, because it lets code work with a general supertype while automatically running the correct specific behavior for whatever object is actually supplied at runtime.`,
      },
      {
        heading: 'How the JVM Picks the Method: Dynamic Method Dispatch',
        body: `A call such as <code>animal.sound()</code> is handled in two steps. At compile time, the compiler looks only at the declared type of the variable (<code>Animal</code>) and checks that this type has a <code>sound()</code> method; if it does not, the code does not compile, whatever the object will be. At runtime, the JVM looks at the class of the actual object and runs the most specific version of <code>sound()</code> it finds, starting at that class and walking up through its parents. This runtime lookup is called dynamic method dispatch. It is why the declared type decides <em>which methods you may call</em>, while the object decides <em>which code actually runs</em>.`,
      },
      {
        heading: 'Upcasting and Downcasting',
        body: `Storing a <code>Dog</code> in an <code>Animal</code> variable is an <strong>upcast</strong>. It is always safe, so Java does it automatically, and it is what makes polymorphism possible: a list of <code>Animal</code> can hold dogs, cats and any future subclass. Going the other way, from <code>Animal</code> back to <code>Dog</code> to call a dog-only method such as <code>fetch()</code>, is a <strong>downcast</strong>. It needs an explicit cast and can fail: if the object is really a <code>Cat</code>, the JVM throws <code>ClassCastException</code>. Check first with <code>instanceof</code>; since Java 16 you can check and cast in one step with <code>if (a instanceof Dog d) { d.fetch(); }</code>. Frequent downcasting is often a sign that the behaviour belongs in an overridden method instead.`,
      },
      {
        heading: 'What Is Not Polymorphic',
        body: `Only instance methods that are inherited and overridable take part in runtime dispatch. Everything else is decided by the compiler from the declared type:`,
        list: [
          '<code>static</code> methods belong to the class, not the object. A subclass may declare a static method with the same signature, but that <em>hides</em> the parent\'s method rather than overriding it, and <code>@Override</code> on it is a compile error.',
          '<code>private</code> methods are not inherited, so a subclass method with the same name is simply a new, unrelated method.',
          '<code>final</code> methods cannot be overridden at all; the compiler reports "overridden method is final".',
          'Fields are never overridden. A subclass field with the same name hides the parent\'s, and which one you read depends on the variable\'s declared type.',
          'Overload selection also uses declared types: with <code>print(Animal)</code> and <code>print(Dog)</code>, calling <code>print(a)</code> on an <code>Animal</code> variable picks <code>print(Animal)</code> even when <code>a</code> holds a <code>Dog</code>.',
        ],
      },
      {
        heading: 'Polymorphism with Interfaces and Abstract Classes',
        body: `In real projects the parent type is usually an interface or an abstract class rather than a concrete class. An interface such as <code>PaymentMethod</code> states what every payment can do (<code>pay(amount)</code>) without saying how. Card, UPI and wallet payments each implement it differently, and the checkout code works with <code>PaymentMethod</code> only, so adding a new payment type needs no change there. An abstract class sits in between: it can implement the steps that are the same for every subclass and leave one step abstract, as <code>OnlinePayment</code> does below with <code>transfer()</code>. Overriding methods may also narrow the return type, for example a <code>copy()</code> that returns <code>Shape</code> in the parent and <code>Circle</code> in the child. This is called a covariant return type and is covered in the Method Overriding lesson.`,
      },
    ],
    examples: [
      {
        caption: 'Overloading (compile-time) side by side with overriding (runtime)',
        code: `// --- Compile-time polymorphism: overloading ---
class Calculator {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
}

// --- Runtime polymorphism: overriding ---
class Animal {
    void makeSound() { System.out.println("Some generic animal sound"); }
}

class Dog extends Animal {
    @Override
    void makeSound() { System.out.println("Woof!"); }
}

public class PolymorphismOverviewDemo {
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println(calc.add(2, 3));       // resolved at compile time -> int version
        System.out.println(calc.add(2.5, 3.5));   // resolved at compile time -> double version

        Animal a = new Dog();      // reference type Animal, actual object Dog
        a.makeSound();             // resolved at RUNTIME based on actual object -> Woof!
    }
}`,
        output: `5
6.0
Woof!`,
      },
      {
        caption: 'A payment system: one loop, three behaviours, through an interface and an abstract class',
        code: `import java.math.BigDecimal;
import java.util.List;

public class PaymentDemo {
    public static void main(String[] args) {
        List<PaymentMethod> methods = List.of(
                new CardPayment("4111111111111111"),
                new UpiPayment("asha@okbank"),
                new WalletPayment(new BigDecimal("300.00")));

        BigDecimal amount = new BigDecimal("499.00");
        for (PaymentMethod method : methods) {        // one loop, three behaviours
            System.out.println(method.name() + ": " + method.pay(amount));
        }
    }
}

interface PaymentMethod {
    String pay(BigDecimal amount);

    default String name() {                           // shared default, can be overridden
        return getClass().getSimpleName();
    }
}

abstract class OnlinePayment implements PaymentMethod {
    // Every online payment is formatted the same way; only the transfer differs
    @Override
    public final String pay(BigDecimal amount) {
        return "Rs." + amount + " " + transfer(amount);
    }

    protected abstract String transfer(BigDecimal amount);
}

class CardPayment extends OnlinePayment {
    private final String cardNumber;
    CardPayment(String cardNumber) { this.cardNumber = cardNumber; }

    @Override
    protected String transfer(BigDecimal amount) {
        return "charged to card ending " + cardNumber.substring(cardNumber.length() - 4);
    }
}

class UpiPayment extends OnlinePayment {
    private final String upiId;
    UpiPayment(String upiId) { this.upiId = upiId; }

    @Override
    protected String transfer(BigDecimal amount) {
        return "requested from " + upiId;
    }

    @Override
    public String name() { return "UPI"; }
}

class WalletPayment implements PaymentMethod {
    private BigDecimal balance;
    WalletPayment(BigDecimal balance) { this.balance = balance; }

    @Override
    public String pay(BigDecimal amount) {
        if (balance.compareTo(amount) < 0) {
            return "declined, wallet balance is Rs." + balance;
        }
        balance = balance.subtract(amount);
        return "paid from wallet";
    }
}`,
        output: `CardPayment: Rs.499.00 charged to card ending 1111
UPI: Rs.499.00 requested from asha@okbank
WalletPayment: declined, wallet balance is Rs.300.00`,
      },
      {
        caption: 'Interview-style output questions: what is dispatched at runtime and what is not',
        code: `public class TrickyOutput {
    static void print(Animal a) { System.out.println("print(Animal)"); }
    static void print(Dog d)    { System.out.println("print(Dog)"); }

    public static void main(String[] args) {
        Animal a = new Dog();                 // upcast: automatic

        a.sound();                            // Q1
        print(a);                             // Q2
        System.out.println(a.legs);           // Q3
        a.describe();                         // Q4

        if (a instanceof Dog d) {             // Q5: check and downcast in one step (Java 16+)
            d.fetch();
        }

        Animal cat = new Cat();
        try {
            Dog wrong = (Dog) cat;            // Q6
            wrong.fetch();
        } catch (ClassCastException e) {
            System.out.println("ClassCastException: " + e.getMessage());
        }
    }
}

class Animal {
    int legs = 4;
    void sound() { System.out.println("Animal sound"); }
    static void info() { System.out.println("Animal.info"); }
    void describe() { info(); }
}

class Dog extends Animal {
    int legs = 3;                             // hides Animal.legs (a three-legged dog)
    @Override void sound() { System.out.println("Woof"); }
    static void info() { System.out.println("Dog.info"); }   // hides, does not override
    void fetch() { System.out.println("Dog fetches"); }
}

class Cat extends Animal {
    @Override void sound() { System.out.println("Meow"); }
}`,
        output: `Woof
print(Animal)
4
Animal.info
Dog fetches
ClassCastException: class Cat cannot be cast to class Dog (Cat and Dog are in unnamed module of loader ...)

Q1 Woof: sound() is an overridden instance method, so the Dog object decides.
Q2 print(Animal): overloads are chosen at compile time from the declared type Animal.
Q3 4: fields are not overridden; a.legs reads the field declared in Animal.
Q4 Animal.info: static methods are hidden, not overridden, so describe() calls Animal's.
Q5 the pattern match succeeds because the object really is a Dog.
Q6 the object is a Cat, so the cast fails at runtime, not at compile time.`,
      },
    ],
    commonMistakes: [
      'Using "overloading" and "overriding" interchangeably — they are resolved at different times (compile-time vs runtime) and follow completely different rules.',
      'Believing overload resolution can happen at runtime — the compiler picks the overloaded method based purely on the declared/static types of the arguments.',
      'Forgetting that overriding requires an identical method signature, while overloading requires a different one — an "override" with a slightly different parameter list actually just creates an accidental overload.',
      'Assuming polymorphism only applies to classes — interfaces and abstract classes rely on runtime polymorphism just as heavily, if not more.',
      'Downcasting without an instanceof check, so a wrong object type crashes with ClassCastException at runtime.',
      'Expecting a static method or a field in the subclass to override the parent\'s; both are only hidden and are chosen by the declared type.',
      'Writing if/else chains on instanceof to pick behaviour, instead of putting the behaviour in an overridden method.',
    ],
    keyPoints: [
      'Polymorphism means one name or reference type behaving in multiple forms depending on context.',
      'Compile-time (static) polymorphism = method overloading, resolved by the compiler using argument types.',
      'Runtime (dynamic) polymorphism = method overriding, resolved using the actual object type at runtime.',
      'Runtime polymorphism is the foundation of flexible, extensible designs built on interfaces and abstract classes.',
      'The declared type decides which methods may be called; the actual object decides which overriding version runs (dynamic method dispatch).',
      'Upcasting is automatic and safe; downcasting needs a cast and an instanceof check to avoid ClassCastException.',
      'static, private and final methods and all fields are resolved at compile time and are not polymorphic.',
    ],
  },

  'java-math-class-and-utility-methods': {
    title: 'Java Math Class and Utility Methods',
    intro: `The <code>java.lang.Math</code> class is a utility class that bundles common mathematical operations as static methods and constants. Because it lives in <code>java.lang</code>, it never needs an explicit import. Math is a final class with only a private constructor, which means it cannot be instantiated — every method and field on it is accessed directly through the class name, such as <code>Math.sqrt(25)</code>.`,
    sections: [
      {
        heading: 'Common Static Methods',
        body: `Math provides ready-made implementations for operations that would otherwise require manual, error-prone logic.`,
        list: [
          '<code>Math.max(a, b)</code> / <code>Math.min(a, b)</code> — the larger or smaller of two values, overloaded for int, long, float, and double.',
          '<code>Math.abs(x)</code> — the absolute (non-negative) value of a number.',
          '<code>Math.pow(base, exponent)</code> — raises base to the given exponent, always returning a double.',
          '<code>Math.sqrt(x)</code> — the square root of x as a double; a negative input returns NaN.',
          '<code>Math.round(x)</code> — rounds a float/double to the nearest whole number, rounding half-up; returns an int for float input and a long for double input.',
          '<code>Math.floor(x)</code> / <code>Math.ceil(x)</code> — round down or up to the nearest whole number, returned as a double.',
          '<code>Math.random()</code> — returns a double greater than or equal to 0.0 and strictly less than 1.0.',
        ],
      },
      {
        heading: 'Useful Constants',
        body: `<code>Math.PI</code> (approximately 3.14159265358979) and <code>Math.E</code> (approximately 2.71828182845905, the base of the natural logarithm) are declared as <code>public static final double</code> fields, ready to use in geometric or exponential calculations without hardcoding approximations.`,
      },
      {
        heading: 'Generating a Random Number in a Range',
        body: `<code>Math.random()</code> alone only produces a value in [0.0, 1.0). To generate a random integer within a specific range [min, max], the standard formula is <code>(int) (Math.random() * (max - min + 1)) + min</code>. For more advanced random number needs (seeding, different distributions), the dedicated <code>java.util.Random</code> class is generally preferred over Math.random().`,
      },
    ],
    examples: [
      {
        caption: 'Common Math methods and constants in one program',
        code: `public class MathDemo {
    public static void main(String[] args) {
        System.out.println(Math.max(10, 25));
        System.out.println(Math.min(10, 25));
        System.out.println(Math.abs(-42));
        System.out.println(Math.pow(2, 10));
        System.out.println(Math.sqrt(64));
        System.out.println(Math.round(4.5));
        System.out.println(Math.floor(4.7));
        System.out.println(Math.ceil(4.1));
        System.out.println(Math.PI);
    }
}`,
        output: `25
10
42
1024.0
8.0
5
4.0
5.0
3.141592653589793`,
      },
    ],
    commonMistakes: [
      'Trying to instantiate Math with "new Math()" — its constructor is private specifically to prevent this; all members are static.',
      'Expecting Math.round(x) to always return an int — it returns a long when given a double argument, which can cause an unexpected type mismatch.',
      'Assuming Math.random() can produce exactly 1.0 — the range is inclusive of 0.0 but strictly exclusive of 1.0.',
      'Forgetting that Math.pow always returns a double, then being surprised that "int result = Math.pow(2, 3);" fails to compile without an explicit cast.',
    ],
    keyPoints: [
      'Math is a final utility class in java.lang with only static members and a private constructor — it is never instantiated.',
      'Key methods: max, min, abs, pow, sqrt, round, floor, ceil, and random.',
      'Math.PI and Math.E are predefined double constants for common mathematical values.',
      'Math.random() returns a double in [0.0, 1.0); scale and shift it to get a random value in a custom range.',
    ],
  },

  'strictfp-keyword-in-java': {
    title: 'strictfp Keyword in Java',
    intro: `<code>strictfp</code> (short for "strict floating point") is a Java keyword that forces floating-point calculations to follow the IEEE 754 standard precisely and consistently, regardless of the underlying hardware or JVM implementation. Without it, historically, some JVMs were allowed extended intermediate precision for float and double calculations, which meant the exact same Java program could theoretically produce very slightly different floating-point results on different platforms.`,
    sections: [
      {
        heading: 'Where strictfp Can Be Applied',
        body: `<code>strictfp</code> can be applied to a class, an interface, or a method. Applying it to a class or interface makes every method (and any nested types) within it strictfp automatically. It cannot be applied to individual variables, constructors alone in isolation from a class, or abstract methods without a body (since there is no floating-point computation to constrain).`,
        list: [
          '<code>strictfp class Calculator { ... }</code> — every method in Calculator uses strict floating-point rules.',
          '<code>public strictfp double computeArea() { ... }</code> — only this method is constrained.',
          '<code>strictfp interface Shape { ... }</code> — any implementing class\'s methods inherit the strict behavior where applicable.',
        ],
      },
      {
        heading: 'Why It Rarely Comes Up in Modern Java',
        body: `As of Java 17, all floating-point operations are strictfp by default — the JVM specification was updated so that strict IEEE 754 semantics apply everywhere, and the strictfp keyword became redundant (though still legal to write, for backward compatibility). In practice, this means you are unlikely to ever need to type strictfp in code targeting modern Java versions. It remains worth knowing, however, because it still appears in interview questions, certification exams, and in older Java 8/11-era codebases where it was meaningful.`,
      },
    ],
    examples: [
      {
        caption: 'Declaring a strictfp method for guaranteed cross-platform floating-point consistency',
        code: `public strictfp class PrecisionCalculator {

    // Every floating-point operation inside a strictfp class/method
    // follows IEEE 754 rules consistently across all JVMs.
    public double multiply(double a, double b) {
        return a * b;
    }

    public static void main(String[] args) {
        PrecisionCalculator calc = new PrecisionCalculator();
        System.out.println(calc.multiply(1.1, 2.2));
    }
}`,
        output: '2.4200000000000004',
      },
    ],
    commonMistakes: [
      'Assuming strictfp changes the numeric result of a calculation in modern Java — since Java 17, strict behavior is already the default everywhere, so adding the keyword changes nothing.',
      'Trying to apply strictfp to a single local variable or field — it can only be applied at the class, interface, or method level.',
      'Believing strictfp is needed for basic int/long arithmetic — it only affects floating-point (float/double) computations.',
      'Confusing strictfp with performance tuning — it is about correctness/consistency of results, not speed.',
    ],
    keyPoints: [
      'strictfp forces IEEE 754-compliant floating-point results consistently across all JVM implementations.',
      'It can be applied to classes, interfaces, and methods (applying it to a class/interface applies it to all its methods).',
      'Since Java 17, strictfp behavior is the default everywhere, making the keyword mostly a legacy/interview topic today.',
      'It never affects integer arithmetic — only float and double computations.',
    ],
  },

  'nested-interfaces-in-java': {
    title: 'Nested Interfaces in Java',
    intro: `A nested interface is an interface declared inside a class or inside another interface, rather than as its own top-level file. Java allows this because interfaces, like classes, can be members of another type. Nested interfaces are a common pattern for grouping a helper interface tightly with the one class (or interface) that logically owns it.`,
    sections: [
      {
        heading: 'Why Nest an Interface',
        body: `Nesting communicates intent: "this interface only makes sense in the context of its enclosing type." A frequent real example is a listener or callback interface — a class that fires events defines a nested interface describing how outsiders should react to those events, keeping the contract physically next to the class that uses it. This avoids cluttering the package with small, tightly-coupled interfaces that are meaningless anywhere else.`,
      },
      {
        heading: 'Rules for Nested Interfaces',
        body: `A nested interface is implicitly <code>static</code> when declared inside a class (even without writing the keyword), meaning it does not depend on any instance of the enclosing class to be referenced or implemented. It can carry any access modifier (public, protected, default, private since Java 9 for interface members) that a regular class member can. It is referenced from outside using the enclosing type's name as a qualifier.`,
        list: [
          'Declared inside a class: <code>OuterClass.NestedInterface</code> is how you refer to it from elsewhere.',
          'Declared inside another interface: it behaves the same way, qualified by the enclosing interface\'s name.',
          'A class can implement a nested interface just like any top-level interface: <code>class Impl implements OuterClass.NestedInterface { ... }</code>.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A nested Listener interface used for a simple event callback pattern',
        code: `class Button {

    // Nested interface: tightly coupled to Button, only meaningful here
    interface ClickListener {
        void onClick(String buttonName);
    }

    private String name;
    private ClickListener listener;

    Button(String name) {
        this.name = name;
    }

    void setClickListener(ClickListener listener) {
        this.listener = listener;
    }

    void simulateClick() {
        if (listener != null) {
            listener.onClick(name);
        }
    }
}

public class NestedInterfaceDemo implements Button.ClickListener {

    @Override
    public void onClick(String buttonName) {
        System.out.println(buttonName + " was clicked!");
    }

    public static void main(String[] args) {
        Button submitButton = new Button("Submit");
        NestedInterfaceDemo handler = new NestedInterfaceDemo();

        submitButton.setClickListener(handler);   // referenced via Button.ClickListener
        submitButton.simulateClick();
    }
}`,
        output: 'Submit was clicked!',
      },
    ],
    commonMistakes: [
      'Forgetting to qualify the nested interface with its enclosing type name when referencing it from outside (writing "ClickListener" instead of "Button.ClickListener").',
      'Assuming a nested interface needs an instance of the outer class to be implemented — nested interfaces are implicitly static and independent of any outer instance.',
      'Overusing nested interfaces for contracts that are actually general-purpose and used across many unrelated classes — those belong as top-level interfaces instead.',
      'Confusing a nested interface with an anonymous inner class that implements an interface — they solve different problems (defining a contract vs providing an implementation).',
    ],
    keyPoints: [
      'A nested interface is declared inside a class or another interface to signal a tight logical coupling.',
      'Nested interfaces declared inside a class are implicitly static and do not require an outer instance.',
      'Reference them from outside using OuterType.NestedInterface syntax.',
      'A very common real-world use is defining listener/callback contracts alongside the class that fires the events.',
    ],
  },

  'method-overloading-vs-method-overriding-a-comparison': {
    title: 'Method Overloading vs Method Overriding: A Comparison',
    intro: `Method overloading and method overriding are both mechanisms for polymorphism in Java, and both let you reuse a method name — but they operate on completely different rules, at completely different times, for completely different purposes. Mixing them up is one of the most common conceptual errors among Java learners, and interviewers frequently probe this exact distinction.`,
    sections: [
      {
        heading: 'Side-by-Side Comparison',
        body: `The clearest way to separate the two is to compare them point by point across the dimensions that actually matter: where each occurs, when each is resolved, and what rules each must follow.`,
        list: [
          '<strong>Where it happens</strong> — Overloading: within the same class (or between a class and its subclass, as an inherited overload). Overriding: strictly between a superclass and a subclass in an inheritance relationship.',
          '<strong>When it is resolved</strong> — Overloading: at compile time, based on the declared types of the arguments ("static binding"). Overriding: at runtime, based on the actual object type ("dynamic binding" / dynamic method dispatch).',
          '<strong>Method signature</strong> — Overloading requires a <em>different</em> parameter list (number, type, or order of parameters); the method name is the only thing that must match. Overriding requires the <em>exact same</em> method signature (same name and same parameter list) as the superclass method.',
          '<strong>Return type</strong> — Overloading allows any return type, including a different one, as long as the parameter list differs. Overriding requires the same return type, or a covariant return type (a subtype of the original return type) — it cannot be an unrelated type.',
          '<strong>Static methods</strong> — Static methods CAN be overloaded freely. Static methods CANNOT be truly overridden — declaring a same-signature static method in a subclass merely "hides" the superclass version, and the version called is decided by the reference type at compile time, not the object type at runtime.',
          '<strong>Access modifiers</strong> — Overloading places no restriction on access modifiers between versions. Overriding requires the subclass method\'s access modifier to be the same or more permissive than the superclass method\'s (it can never reduce visibility).',
          '<strong>Purpose</strong> — Overloading provides multiple convenient ways to call conceptually the same operation with different inputs. Overriding lets a subclass provide a specialized implementation of behavior already defined by its superclass.',
        ],
      },
      {
        heading: 'Quick Rule of Thumb',
        body: `If the method name is reused within one class with a different parameter list, that is overloading — resolved by the compiler. If the method name and full signature are reused in a subclass to change behavior, that is overriding — resolved by the JVM at runtime, using the real object being pointed to, not the variable's declared type.`,
      },
    ],
    examples: [
      {
        caption: 'Overloading (same class, different parameters) vs overriding (subclass, same signature)',
        code: `class Printer {
    // Overloading: same name "print", different parameter lists, resolved at compile time
    void print(String text) { System.out.println("String: " + text); }
    void print(int number) { System.out.println("Int: " + number); }
}

class Notifier {
    void send() { System.out.println("Generic notification"); }
}

class EmailNotifier extends Notifier {
    // Overriding: same signature as Notifier.send(), resolved at runtime
    @Override
    void send() { System.out.println("Email notification"); }
}

public class ComparisonDemo {
    public static void main(String[] args) {
        Printer p = new Printer();
        p.print("Hello");   // compiler picks print(String) at compile time
        p.print(42);        // compiler picks print(int) at compile time

        Notifier n = new EmailNotifier();  // reference type Notifier, object type EmailNotifier
        n.send();            // JVM picks EmailNotifier.send() at RUNTIME based on the object
    }
}`,
        output: `String: Hello
Int: 42
Email notification`,
      },
    ],
    commonMistakes: [
      'Believing static methods can be overridden — a same-signature static method in a subclass only hides the superclass version, and which one runs is decided by the reference type, not the actual object.',
      'Trying to overload two methods that differ only in return type — the compiler cannot distinguish calls based on return type alone, so this fails to compile.',
      'Reducing the access modifier of an "overriding" method (e.g. superclass method is public, subclass attempt is protected) — this fails to compile, since overriding cannot narrow visibility.',
      'Assuming any method with the same name in a subclass is automatically an override — if the parameter list differs even slightly, it is actually a brand-new overload, not an override, and @Override would flag this as a compile error.',
    ],
    keyPoints: [
      'Overloading happens within a class and is resolved at compile time by matching parameter lists; overriding happens between superclass and subclass and is resolved at runtime by the actual object type.',
      'Overloading requires a different parameter list with any return type; overriding requires the identical signature and the same (or covariant) return type.',
      'Static methods can be overloaded but never truly overridden — they can only be hidden.',
      'An overriding method\'s access modifier must be as permissive as, or more permissive than, the method it overrides.',
    ],
  },
}
