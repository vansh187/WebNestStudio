// Java OOP (Part 1) module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content04aOopPart1 = {
  'oops-concepts-in-java': {
    title: 'OOPs Concepts in Java',
    intro: `Object-Oriented Programming (OOP) is a way of designing software around "objects" — self-contained units that bundle data (fields) with the behavior (methods) that operates on that data. Java was built as an object-oriented language from the ground up, so almost everything you write, aside from the eight primitive types, is an object or a reference to one.

The motivation behind OOP is managing complexity. Procedural code tends to scatter data and the functions that act on it across a program, which becomes hard to maintain as the codebase grows. OOP keeps related data and behavior together inside classes, which makes large systems easier to reason about, extend, and test in isolation.`,
    sections: [
      {
        heading: 'The Four Pillars of OOP',
        body: `Every object-oriented feature in Java ultimately supports one of four core principles. Understanding these four ideas up front makes every later topic in this module — classes, inheritance, overriding, and initializer blocks — click into place faster.`,
        list: [
          '<strong>Encapsulation</strong> — bundling data and the methods that operate on it inside a class, and restricting direct access to that data using access modifiers (typically <code>private</code> fields with <code>public</code> getters/setters). This protects an object\'s internal state from invalid changes.',
          '<strong>Inheritance</strong> — allowing one class (a subclass) to acquire the fields and methods of another class (a superclass) using the <code>extends</code> keyword, enabling code reuse and a natural "is-a" relationship between types.',
          '<strong>Polymorphism</strong> — allowing the same method call to behave differently depending on the actual object it is invoked on (runtime/dynamic polymorphism via overriding) or depending on the arguments passed (compile-time polymorphism via overloading).',
          '<strong>Abstraction</strong> — hiding internal implementation details and exposing only the essential features of an object, typically through abstract classes and interfaces, so callers depend on "what" an object does, not "how" it does it.',
        ],
      },
      {
        heading: 'Object and Class as the Foundation',
        body: `All four pillars are built on top of two foundational concepts: a class, which is a blueprint describing what fields and methods a category of objects will have, and an object, which is an actual instance created from that blueprint at runtime, occupying its own memory on the heap. Nothing else in OOP makes sense without this class/object distinction, which is why it is the very next topic.`,
      },
      {
        heading: 'OOP vs Procedural Programming',
        body: `In procedural programming, a program is a sequence of functions that pass data around. In object-oriented programming, a program is a set of objects that each look after their own data and talk to each other through methods. The difference shows up as a program grows.`,
        list: [
          '<strong>Organisation</strong> — procedural code groups by steps; OOP groups by things (a <code>Customer</code>, an <code>Order</code>, a <code>Payment</code>), each with its own data and methods.',
          '<strong>Data safety</strong> — procedural data is often shared and changed from anywhere; OOP keeps fields <code>private</code> and changes them only through methods that can validate input.',
          '<strong>Reuse</strong> — procedural code reuses functions; OOP also reuses whole types through inheritance and composition.',
          '<strong>Change</strong> — adding a new kind of thing in OOP usually means adding a new class, not editing every function that handles the old kinds.',
        ],
      },
      {
        heading: 'How the Four Pillars Work Together',
        body: `The pillars are rarely used one at a time. In the second example below, <code>Shape</code> is abstract, so callers only know that every shape has an area (abstraction). Its <code>name</code> field is <code>private</code> and read through a getter (encapsulation). <code>Circle</code> and <code>Rectangle</code> extend <code>Shape</code> and reuse its name handling (inheritance). Finally, the loop calls <code>shape.area()</code> on each element of a <code>Shape[]</code> array, and Java runs the right version for each object at runtime (polymorphism). Adding a <code>Triangle</code> later would mean writing one new class; the loop would not change.`,
      },
      {
        heading: 'Why Java Enforces OOP Structure',
        body: `Unlike some multi-paradigm languages, Java requires almost all code to live inside a class — there are no free-floating functions outside a class the way there are in C or Python. This is a deliberate design decision: it forces every piece of behavior to have an owner (a class), which keeps large codebases organized and makes dependencies explicit rather than implicit.`,
      },
    ],
    examples: [
      {
        caption: 'A tiny class demonstrating encapsulation and abstraction together',
        code: `public class BankAccount {
    private double balance; // encapsulated: not directly accessible from outside

    public BankAccount(double initialBalance) {
        balance = initialBalance;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    public double getBalance() { // controlled access to private data
        return balance;
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount(500.0);
        account.deposit(150.0);
        System.out.println("Balance: " + account.getBalance());
    }
}`,
        output: 'Balance: 650.0',
      },
      {
        caption: 'All four pillars in one program: abstraction, encapsulation, inheritance and polymorphism',
        code: `public class ShapeDemo {
    public static void main(String[] args) {
        Shape[] shapes = { new Circle(2), new Rectangle(3, 4) };
        for (Shape shape : shapes) {
            // Polymorphism: the same call runs Circle's or Rectangle's area()
            System.out.printf("%s area: %.2f%n", shape.getName(), shape.area());
        }
    }
}

// Abstraction: callers know every Shape has an area, not how it is calculated
abstract class Shape {
    private final String name; // Encapsulation: private, read through a getter

    Shape(String name) {
        this.name = name;
    }

    String getName() {
        return name;
    }

    abstract double area();
}

// Inheritance: Circle and Rectangle reuse Shape's name handling
class Circle extends Shape {
    private final double radius;

    Circle(double radius) {
        super("Circle");
        this.radius = radius;
    }

    @Override
    double area() {
        return Math.PI * radius * radius;
    }
}

class Rectangle extends Shape {
    private final double width;
    private final double height;

    Rectangle(double width, double height) {
        super("Rectangle");
        this.width = width;
        this.height = height;
    }

    @Override
    double area() {
        return width * height;
    }
}`,
        output: `Circle area: 12.57
Rectangle area: 12.00`,
      },
    ],
    commonMistakes: [
      'Treating OOP as just "using classes" — without encapsulation, inheritance, polymorphism, and abstraction actually being applied, a class-based program is not meaningfully object-oriented.',
      'Confusing overloading (compile-time polymorphism) with overriding (runtime polymorphism) as if they were the same mechanism.',
      'Making every field public instead of private, which defeats encapsulation and allows any code to corrupt an object\'s internal state.',
    ],
    keyPoints: [
      'The four pillars of OOP are encapsulation, inheritance, polymorphism, and abstraction.',
      'A class is a blueprint; an object is a runtime instance created from that blueprint.',
      'Java requires almost all code to live inside a class, enforcing object-oriented structure by design.',
      'The pillars work together: an abstract type, private state, subclasses and one polymorphic call site is the typical shape of OOP code.',
    ],
  },

  'classes-and-objects': {
    title: 'Classes and Objects',
    intro: `A class is a user-defined blueprint that describes the state (fields) and behavior (methods) that a category of objects will share. It does not itself occupy memory for instance data — it is a template. An object is a concrete instance of a class, created at runtime with the <code>new</code> keyword, and it occupies actual memory on the heap holding real values for the class's fields.

A common real-world analogy: a class is like an architect's blueprint for a house, describing rooms, doors, and dimensions, while an object is an actual house built from that blueprint. You can build many houses (objects) from one blueprint (class), and each house has its own furniture and occupants (its own field values) even though they all share the same structural design.`,
    sections: [
      {
        heading: 'Declaring a Class',
        body: `A class declaration consists of an optional access modifier, the <code>class</code> keyword, a name following PascalCase convention, and a body enclosed in braces containing fields, constructors, and methods. Fields declared inside a class but outside any method are called instance variables, and each object created from the class gets its own independent copy of them.`,
      },
      {
        heading: 'Creating Objects',
        body: `An object is created using the <code>new</code> keyword followed by a constructor call: <code>ClassName obj = new ClassName();</code>. This statement does three things in order: it allocates memory on the heap for the object, calls the constructor to initialize its fields, and assigns the resulting memory reference to the variable <code>obj</code>. The variable itself does not hold the object — it holds a reference to where the object lives in memory.`,
      },
      {
        heading: 'Accessing Members',
        body: `Once you have an object reference, you access its fields and methods using the dot (<code>.</code>) operator: <code>obj.fieldName</code> or <code>obj.methodName()</code>. Each object maintains its own copy of instance variables, so changing a field on one object never affects another object created from the same class.`,
        list: [
          'A class is compiled once; objects are created as many times as needed at runtime.',
          'Each object has its own instance variables but shares the same method code defined in the class.',
          'An uninitialized object reference holds <code>null</code> until assigned with <code>new</code>.',
        ],
      },
      {
        heading: 'State, Behavior and Identity',
        body: `Every object has three characteristics. Its <strong>state</strong> is the current value of its fields, such as a car's model and speed. Its <strong>behavior</strong> is what its methods can do, such as <code>accelerate()</code>. Its <strong>identity</strong> is the fact that it is a distinct object in memory: two cars can have exactly the same model and speed and still be two different objects.`,
      },
      {
        heading: 'References: Two Variables, One Object',
        body: `Because a variable holds a reference rather than the object itself, assigning one object variable to another copies the reference, not the object. After <code>Car b = a;</code> there is still only one <code>Car</code> on the heap, and <code>a</code> and <code>b</code> both point to it, so a change made through <code>b</code> is visible through <code>a</code>. To get a second, independent object you must call <code>new</code> again.

The <code>==</code> operator on object variables compares these references. It is <code>true</code> only when both variables point to the same object, even if two separate objects hold identical field values. The second example below shows both cases.`,
      },
    ],
    examples: [
      {
        caption: 'One class, two independent objects with their own state',
        code: `public class Student {
    String name;
    int marks;

    void showDetails() {
        System.out.println(name + " scored " + marks);
    }

    public static void main(String[] args) {
        Student s1 = new Student();
        s1.name = "Riya";
        s1.marks = 88;

        Student s2 = new Student();
        s2.name = "Kabir";
        s2.marks = 92;

        s1.showDetails();
        s2.showDetails();
    }
}`,
        output: `Riya scored 88
Kabir scored 92`,
      },
      {
        caption: 'Copying a reference does not copy the object; == compares references',
        code: `public class Car {
    String model;
    int speed;

    void accelerate(int amount) {
        speed += amount;
    }

    public static void main(String[] args) {
        Car a = new Car();
        a.model = "Swift";

        Car b = a; // no new object: b refers to the same Car as a
        b.accelerate(40);
        System.out.println(a.model + " speed read through a: " + a.speed);

        Car c = new Car(); // a separate object with the same field values
        c.model = "Swift";
        c.speed = 40;
        System.out.println("a == b: " + (a == b));
        System.out.println("a == c: " + (a == c));
    }
}`,
        output: `Swift speed read through a: 40
a == b: true
a == c: false`,
      },
    ],
    commonMistakes: [
      'Believing a class occupies memory the way an object does — a class is only a template until an object is instantiated from it.',
      'Forgetting to use "new" and trying to use a class name directly as if it were an object.',
      'Assuming two object references pointing to the same object are independent copies — reassigning a field through one reference affects the other, since both point to the same memory.',
    ],
    keyPoints: [
      'A class is a blueprint; an object is a runtime instance of that blueprint, created with "new".',
      'Each object has its own copy of instance variables, but all objects share the same method definitions.',
      'Object variables hold references to heap memory, not the object data itself.',
      'Every object has state (field values), behavior (methods) and identity (being a distinct object), and == on objects compares identity.',
    ],
  },

  'java-naming-conventions': {
    title: 'Java Naming Conventions',
    intro: `Java naming conventions are not enforced by the compiler — code that ignores them still compiles and runs — but they are followed almost universally in professional Java code and in the JDK itself. Following them makes your code instantly readable to any other Java developer, since the casing of an identifier signals what kind of thing it is before you even see its declaration.`,
    sections: [
      {
        heading: 'Conventions by Identifier Type',
        body: `Each category of identifier in Java has its own established casing style. Departing from these conventions is legal but considered poor practice and is flagged by linters and code reviewers.`,
        list: [
          '<strong>Classes and interfaces</strong> — PascalCase (also called UpperCamelCase): every word starts with a capital letter, no underscores. Example: <code>BankAccount</code>, <code>Runnable</code>.',
          '<strong>Methods and variables</strong> — camelCase: the first word is lowercase, subsequent words are capitalized. Example: <code>calculateTotal()</code>, <code>studentName</code>.',
          '<strong>Constants</strong> — UPPER_SNAKE_CASE: all uppercase letters with underscores separating words, and almost always declared <code>static final</code>. Example: <code>MAX_DISCOUNT</code>, <code>DEFAULT_TIMEOUT</code>.',
          '<strong>Packages</strong> — all lowercase, typically the reversed domain name of the organization, with no underscores. Example: <code>com.webnest.banking</code>.',
        ],
      },
      {
        heading: 'Why These Conventions Exist',
        body: `The casing itself carries information: seeing <code>Vehicle car = new Vehicle();</code> tells an experienced Java reader immediately that <code>Vehicle</code> is a type and <code>car</code> is a variable, purely from capitalization, without needing to look up either declaration. Consistent naming also avoids collisions — lowercase packages never clash visually with PascalCase class names even when a package and a class share a similar word.`,
      },
      {
        heading: 'Additional Naming Rules',
        body: `Beyond casing style, identifiers should be descriptive rather than abbreviated (<code>totalPrice</code> rather than <code>tp</code>), and single-letter names are conventionally reserved for loop counters (<code>i</code>, <code>j</code>) or generic type parameters (<code>T</code>, <code>E</code>, <code>K</code>, <code>V</code>). Boolean variables and methods conventionally read as a question or assertion, such as <code>isValid</code> or <code>hasPermission</code>, which makes conditional code read naturally.`,
      },
      {
        heading: 'Enums, Generics, Getters and Acronyms',
        body: `A few more cases come up in almost every real project, and the second example below shows each of them:`,
        list: [
          '<strong>Enums</strong> — the enum type is PascalCase like any class (<code>OrderStatus</code>), and its constants are UPPER_SNAKE_CASE because they are fixed values (<code>PLACED</code>, <code>OUT_FOR_DELIVERY</code>).',
          '<strong>Generic type parameters</strong> — a single capital letter: <code>T</code> for a type, <code>E</code> for a collection element, <code>K</code> and <code>V</code> for map keys and values, <code>R</code> for a return type.',
          '<strong>Getters and setters</strong> — <code>get</code> or <code>set</code> plus the field name in PascalCase (<code>getCustomerName()</code>, <code>setCustomerName()</code>). A boolean getter uses <code>is</code> instead (<code>isActive()</code>). Frameworks such as Spring and Jackson find properties by these exact names.',
          '<strong>Acronyms</strong> — treat them as ordinary words so the casing stays readable: <code>HttpClient</code> and <code>parseJson()</code> rather than <code>HTTPClient</code> and <code>parseJSON()</code>. The JDK is not fully consistent here (it has both <code>HttpClient</code> and <code>URL</code>), but most style guides recommend the word form for new code.',
        ],
      },
    ],
    examples: [
      {
        caption: 'All four naming conventions applied in one small class',
        code: `package com.webnest.inventory; // package: all lowercase

public class InventoryItem { // class: PascalCase

    static final int MAX_QUANTITY = 1000; // constant: UPPER_SNAKE_CASE

    private String itemName; // variable: camelCase
    private int quantityInStock; // variable: camelCase

    public boolean isInStock() { // method: camelCase, reads as a question
        return quantityInStock > 0;
    }

    public static void main(String[] args) {
        InventoryItem item = new InventoryItem();
        item.itemName = "Notebook";
        item.quantityInStock = 25;
        System.out.println(item.itemName + " in stock: " + item.isInStock());
    }
}`,
        output: 'Notebook in stock: true',
      },
      {
        caption: 'Enums, generics, getters and setters named the way the JDK names them',
        code: `import java.util.ArrayList;
import java.util.List;

public class OrderService {
    enum OrderStatus { PLACED, SHIPPED, DELIVERED } // enum type: PascalCase; constants: UPPER_SNAKE_CASE

    static class Box<T> { // generic type parameter: a single capital letter
        private final T item;
        Box(T item) { this.item = item; }
        T getItem() { return item; }
    }

    private String customerName; // field: camelCase
    private boolean active;      // boolean field: plain adjective

    public String getCustomerName() { return customerName; }      // getter: get + field name
    public void setCustomerName(String name) { customerName = name; } // setter: set + field name
    public boolean isActive() { return active; }                  // boolean getter: is + field name
    public void setActive(boolean active) { this.active = active; }

    public static void main(String[] args) {
        OrderService service = new OrderService();
        service.setCustomerName("Asha");
        service.setActive(true);

        List<OrderStatus> history = new ArrayList<>();
        history.add(OrderStatus.PLACED);
        history.add(OrderStatus.SHIPPED);

        Box<OrderStatus> latest = new Box<>(OrderStatus.SHIPPED);
        System.out.println(service.getCustomerName() + " active: " + service.isActive());
        System.out.println("Status history: " + history);
        System.out.println("Latest status: " + latest.getItem());
    }
}`,
        output: `Asha active: true
Status history: [PLACED, SHIPPED]
Latest status: SHIPPED`,
      },
    ],
    commonMistakes: [
      'Naming a class in camelCase (like "bankAccount") instead of PascalCase, which makes it visually indistinguishable from a variable.',
      'Using ALL_CAPS for a regular mutable field instead of reserving that style for true constants declared with "static final".',
      'Mixing underscores into camelCase names (like "student_Name"), combining two different conventions inconsistently.',
      'Using vague single-letter or abbreviated names for fields and methods outside of loop counters or generics, which hurts readability.',
      'Naming a boolean getter "getActive()" instead of "isActive()", which breaks the JavaBeans pattern that frameworks such as Spring and Jackson rely on.',
    ],
    keyPoints: [
      'Classes and interfaces use PascalCase; methods and variables use camelCase.',
      'Constants (static final fields) use UPPER_SNAKE_CASE; packages are all lowercase.',
      'Enum constants use UPPER_SNAKE_CASE, generic type parameters are single capital letters, and getters/setters follow get, set and is + the field name.',
      'These rules are conventions, not compiler-enforced syntax, but ignoring them harms readability for every other Java developer.',
    ],
  },

  'java-methods-and-method-overloading': {
    title: 'Java Methods and Method Overloading',
    intro: `A method is a named block of code that performs a specific task and can be invoked (called) whenever that task needs to be repeated. Methods let you break a program into small, reusable, testable pieces instead of writing one long block of instructions, and they are how objects in Java expose their behavior to the rest of the program.

Method overloading is the ability to define multiple methods in the same class that share the same name but differ in their parameter list. This is Java's form of compile-time polymorphism: the compiler decides which overloaded version to call based on the number, type, and order of arguments supplied at the call site.`,
    sections: [
      {
        heading: 'Anatomy of a Method',
        body: `A method declaration consists of an access modifier, an optional <code>static</code> keyword, a return type, a name, a parameter list in parentheses, and a body in braces. A method with return type <code>void</code> returns nothing; any other return type requires a <code>return</code> statement matching that type on every possible execution path.`,
      },
      {
        heading: 'Rules for Overloading',
        body: `For two methods with the same name to count as valid overloads, their parameter lists must differ in at least one of: the number of parameters, the types of the parameters, or the order of parameter types. The compiler resolves which overload to call by matching the arguments at the call site, using exact type matches first, then widening conversions, then autoboxing, and finally varargs, in that priority order.`,
        list: [
          '<code>void print(int a)</code> and <code>void print(int a, int b)</code> — valid, different parameter count.',
          '<code>void print(int a)</code> and <code>void print(double a)</code> — valid, different parameter type.',
          '<code>void print(int a, String b)</code> and <code>void print(String a, int b)</code> — valid, different parameter order.',
        ],
      },
      {
        heading: 'What Does NOT Count as Overloading',
        body: `Changing only the return type while keeping the exact same name and parameter list is not valid overloading — it causes a compile-time error, because the compiler determines which method to call based on the arguments passed, not on what the caller does with the return value. Two methods with an identical signature (name + parameter types) cannot coexist no matter what their return types are.`,
      },
      {
        heading: 'How the Compiler Picks an Overload',
        body: `When a call could match more than one overload, the compiler searches in phases and stops at the first phase that finds a match. Within a phase, it chooses the most specific method.`,
        list: [
          '<strong>1. Exact match or widening</strong> — a parameter of the same type, or a wider primitive (<code>byte</code> → <code>short</code> → <code>int</code> → <code>long</code> → <code>float</code> → <code>double</code>).',
          '<strong>2. Autoboxing</strong> — only if phase 1 found nothing, the compiler tries boxing an <code>int</code> to <code>Integer</code> (or unboxing the reverse).',
          '<strong>3. Varargs</strong> — a <code>...</code> parameter is the last resort, used only when no fixed-parameter method fits.',
        ],
      },
      {
        heading: 'Overloading You Already Use',
        body: `The JDK relies on overloading everywhere. <code>System.out.println</code> has separate versions for <code>int</code>, <code>double</code>, <code>char</code>, <code>boolean</code>, <code>String</code> and <code>Object</code>, which is why one method name prints anything. <code>Math.max</code> and <code>Math.abs</code> have <code>int</code>, <code>long</code>, <code>float</code> and <code>double</code> versions so the result keeps the type you passed in. Overload when the operations really do the same job for different inputs; if they do different jobs, give them different names.`,
      },
    ],
    examples: [
      {
        caption: 'Overloading resolved by parameter count and type',
        code: `public class Calculator {
    int add(int a, int b) {
        return a + b;
    }

    double add(double a, double b) {
        return a + b;
    }

    int add(int a, int b, int c) {
        return a + b + c;
    }

    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println(calc.add(2, 3));
        System.out.println(calc.add(2.5, 3.5));
        System.out.println(calc.add(1, 2, 3));
    }
}`,
        output: `5
6.0
6`,
      },
      {
        caption: 'Which overload runs: widening beats boxing, and varargs comes last',
        code: `public class OverloadResolution {
    static void show(long value) {
        System.out.println("long version: " + value);
    }

    static void show(Integer value) {
        System.out.println("Integer version: " + value);
    }

    static void show(int... values) {
        System.out.println("varargs version: " + values.length + " values");
    }

    public static void main(String[] args) {
        show(5);                  // no show(int): widening int -> long beats boxing to Integer
        byte small = 3;
        show(small);              // byte also widens to long
        show(Integer.valueOf(7)); // exact match for Integer
        show();                   // only varargs accepts zero arguments
        show(1, 2, 3);            // only varargs accepts three arguments
    }
}`,
        output: `long version: 5
long version: 3
Integer version: 7
varargs version: 0 values
varargs version: 3 values`,
      },
    ],
    commonMistakes: [
      'Trying to overload two methods that differ only in return type — this is a compile error, not valid overloading.',
      'Expecting the compiler to pick an overload based on how the result is used rather than the argument list passed in.',
      'Confusing overloading (same class, same name, different parameters, resolved at compile time) with overriding (subclass, same signature, resolved at runtime).',
      'Passing an argument type that matches multiple overloads ambiguously (e.g. calling with a null literal when two reference-type overloads both apply), causing a compile-time "ambiguous method call" error.',
    ],
    keyPoints: [
      'Overloading requires a different parameter list — different count, types, or order.',
      'Return type alone is never enough to distinguish overloaded methods.',
      'Method overloading is compile-time (static) polymorphism, resolved by the compiler based on argument types.',
      'The compiler tries exact match or widening first, then autoboxing, then varargs, so show(5) prefers show(long) over show(Integer).',
    ],
  },

  'constructors-and-constructor-overloading': {
    title: 'Constructors and Constructor Overloading',
    intro: `A constructor is a special block of code that runs automatically when an object is created with <code>new</code>, and its job is to initialize the object's instance variables into a valid starting state. A constructor looks similar to a method but has two defining differences: it has no return type at all — not even <code>void</code> — and its name must exactly match the class name.`,
    sections: [
      {
        heading: 'Default Constructor',
        body: `If a class defines no constructor at all, the Java compiler automatically inserts a no-argument default constructor that takes no parameters and initializes fields to their default values (0, false, null). As soon as you write even one constructor of your own, however, the compiler stops providing the default one — if you still need a no-argument constructor at that point, you must write it explicitly.`,
      },
      {
        heading: 'Constructor Overloading',
        body: `Just like methods, a class can define multiple constructors as long as their parameter lists differ, which is called constructor overloading. This lets client code create objects in different ways depending on what information is available at that moment — for example, creating an object with default values, or with fully specified values.`,
      },
      {
        heading: 'Constructor Chaining with this()',
        body: `Inside one constructor, you can call another constructor of the same class using <code>this(...)</code> with matching arguments. This is called constructor chaining, and it lets you centralize common initialization logic in one constructor instead of duplicating it across several. A constructor can make at most one such call. Until Java 24 it had to be the very first statement. Since Java 25 (flexible constructor bodies), statements may come before it, but only ones that do not use the object being built: they cannot use <code>this</code>, read its fields or call its instance methods.`,
        list: [
          'Constructor name must exactly match the class name, with matching capitalization.',
          'Constructors never declare a return type, including <code>void</code>.',
          'A constructor can call <code>this(...)</code> or <code>super(...)</code> once at most; code before that call must not touch the object being built.',
          'A class loses its free compiler-provided default constructor once any constructor is written explicitly.',
        ],
      },
      {
        heading: 'Parameterized Constructors and this.field',
        body: `A parameterized constructor takes the starting values as arguments, so an object is complete the moment it is created. Parameters are usually given the same names as the fields they fill, which hides the fields inside the constructor. Writing <code>this.name = name</code> tells Java to assign the parameter <code>name</code> to the field <code>name</code> of the object being created. Without <code>this.</code>, <code>name = name</code> just assigns the parameter to itself and the field keeps its default value.`,
      },
      {
        heading: 'Validating Arguments in the Constructor',
        body: `Because every object passes through a constructor, it is the best place to reject bad data. Check the arguments and throw an <code>IllegalArgumentException</code> (or <code>NullPointerException</code> via <code>Objects.requireNonNull</code>) if they make no sense. A caller then can never hold a half-valid object, such as a bank account with a negative balance or a person without a name.`,
      },
      {
        heading: 'Copy Constructors',
        body: `A copy constructor takes another object of the same class and copies its values, as in <code>Book(Book other)</code>. Java does not generate one for you, but it is a common and readable way to duplicate an object. Copying a field that refers to a mutable object (such as a list) copies only the reference, so for an independent copy, create a new list from the original.`,
      },
      {
        heading: 'Private Constructors',
        body: `A constructor can be <code>private</code>, which stops other classes from calling <code>new</code> on it. This is used for utility classes that only hold static methods (like <code>java.lang.Math</code>), and for classes that control how instances are made through a static factory method such as <code>of(...)</code>.`,
      },
      {
        heading: 'Constructors vs Methods',
        body: `The two look alike, but they play different roles:`,
        list: [
          'A constructor runs automatically, once per object, when you use <code>new</code>. A method runs only when you call it, as many times as you like.',
          'A constructor has the class name and no return type. A method can have any name and must declare a return type (or <code>void</code>).',
          'Constructors are not inherited, although a subclass calls a superclass constructor with <code>super(...)</code>. Methods are inherited and can be overridden.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Overloaded constructors chained together with this()',
        code: `public class Rectangle {
    int width;
    int height;

    Rectangle() {
        this(1, 1); // chains to the two-argument constructor
    }

    Rectangle(int side) {
        this(side, side); // a square, chains to the two-argument constructor
    }

    Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    int area() {
        return width * height;
    }

    public static void main(String[] args) {
        Rectangle r1 = new Rectangle();
        Rectangle r2 = new Rectangle(5);
        Rectangle r3 = new Rectangle(4, 6);

        System.out.println(r1.area());
        System.out.println(r2.area());
        System.out.println(r3.area());
    }
}`,
        output: `1
25
24`,
      },
      {
        caption: 'this.field assignment, argument validation and a copy constructor',
        code: `class Book {
    String title;
    int pages;

    Book(String title, int pages) {
        if (pages <= 0) {
            throw new IllegalArgumentException("pages must be positive: " + pages);
        }
        this.title = title; // this.title is the field, title is the parameter
        this.pages = pages;
    }

    Book(Book other) { // copy constructor
        this(other.title, other.pages);
    }
}

public class BookDemo {
    public static void main(String[] args) {
        Book original = new Book("Java Basics", 320);
        Book copy = new Book(original);
        copy.title = "Java Basics, 2nd Edition";

        System.out.println(original.title + " (" + original.pages + " pages)");
        System.out.println(copy.title + " (" + copy.pages + " pages)");

        try {
            new Book("Empty", 0);
        } catch (IllegalArgumentException e) {
            System.out.println("Rejected: " + e.getMessage());
        }
    }
}`,
        output: `Java Basics (320 pages)
Java Basics, 2nd Edition (320 pages)
Rejected: pages must be positive: 0`,
      },
    ],
    commonMistakes: [
      'Accidentally giving a constructor a return type like "void", which turns it into a regular method that must be called explicitly rather than a constructor invoked by "new".',
      'Writing a custom constructor and then being surprised that "new MyClass()" no longer compiles, because defining any constructor removes the automatic default one.',
      'Using this or reading a field before the this(...) call. Since Java 25 statements may come before it, but they must not touch the object being built (and before Java 25 nothing at all could come first).',
      'Confusing this(...) (calls another constructor of the same class) with super(...) (calls a constructor of the parent class).',
      'Writing "name = name;" in a constructor instead of "this.name = name;", which assigns the parameter to itself and leaves the field at its default value.',
    ],
    keyPoints: [
      'A constructor has the same name as the class and no return type, not even void.',
      'The compiler supplies a default no-argument constructor only if you define no constructor yourself.',
      'Constructors can be overloaded like methods, differing by parameter list.',
      'this(...) chains to another constructor in the same class; code before it must not use the object being built.',
      'Validate arguments in the constructor so no object can exist in an invalid state.',
    ],
  },

  'static-keyword': {
    title: 'Static Keyword',
    intro: `The <code>static</code> keyword marks a member — a variable, method, block, or nested class — as belonging to the class itself rather than to any individual object. A static member is created once when the class is loaded by the JVM and is shared by every instance of that class, instead of each object getting its own copy.`,
    sections: [
      {
        heading: 'Static Variables',
        body: `A static variable (also called a class variable) is allocated once, in a single shared memory location, regardless of how many objects of the class are created. Changing it through any one object is visible through every other object and through the class name directly, because they all refer to the same memory. Static variables are commonly used for values that logically belong to the whole class, such as a running counter of how many objects have been created.`,
      },
      {
        heading: 'Static Methods',
        body: `A static method belongs to the class and can be called without creating an object, using <code>ClassName.methodName()</code>. Because a static method has no associated object (no implicit <code>this</code>), it can only directly access other static members — it cannot directly reference instance variables or call instance methods without first obtaining an object reference. This is why <code>main</code> is declared static: the JVM must be able to call it before any object of the class exists.`,
      },
      {
        heading: 'Static Blocks and Initialization Order',
        body: `A static block is a section of code wrapped in <code>static { ... }</code> that runs exactly once, when the class is first loaded into the JVM — before any object of that class is created and before the main method runs, if the static block is in the class containing main. Static blocks are used to perform one-time setup for static data that is too complex for a simple inline initializer. If a class has multiple static variables and static blocks, they execute in the exact top-to-bottom order they appear in the source file.`,
        list: [
          'Static members are loaded once per class, not once per object.',
          'Static methods cannot use <code>this</code> or <code>super</code>, since there is no object context.',
          'Static blocks run once, at class-loading time, before any constructor or instance code.',
        ],
      },
      {
        heading: 'Static vs Instance: Shared State vs Per-Object State',
        body: `An instance variable gets a fresh copy inside every object, so two objects can hold different values. A static variable has exactly one copy for the whole class, so every object reads and writes the same value. Choose by asking whose data it is: a customer's name belongs to each customer object, while the total number of customers belongs to the class. Constructors usually work on instance state, but they can also update static state, as the counter example shows.`,
      },
      {
        heading: 'Call Static Members Through the Class Name',
        body: `Java lets you write <code>object.staticMethod()</code>, but the object is ignored: the compiler decides which method to call from the variable's declared type, and it even works when the variable is <code>null</code>. Because this hides the fact that the member is shared, the compiler warns about it (<code>javac -Xlint:static</code>), and most style guides forbid it. Always write <code>ClassName.member</code>, as in <code>Math.max(a, b)</code> or <code>Counter.getCount()</code>.`,
      },
      {
        heading: 'Constants with static final',
        body: `Combining <code>static</code> with <code>final</code> creates a class-level constant: one shared value that can never change, such as <code>Math.PI</code> or <code>Integer.MAX_VALUE</code>. By convention constants are named in <code>UPPER_SNAKE_CASE</code>. A class made only of constants and static helper methods (a utility class, like <code>java.lang.Math</code>) usually also has a <code>private</code> constructor, so nobody creates pointless objects of it.`,
      },
      {
        heading: 'Static Methods Are Hidden, Not Overridden',
        body: `A subclass can declare a static method with the same signature as one in its parent, but this <strong>hides</strong> the parent's method rather than overriding it. Overriding is decided at runtime by the actual object; hiding is decided at compile time by the declared type of the variable. So with <code>Animal pet = new Dog()</code>, <code>pet.sound()</code> runs Dog's instance method, while the static <code>kind()</code> still runs Animal's version.`,
      },
      {
        heading: 'Static Nested Classes',
        body: `A class declared <code>static</code> inside another class is a static nested class. Unlike an inner class, it does not hold a reference to an outer object, so you can create it with <code>new Outer.Nested()</code> without any <code>Outer</code> instance. It is commonly used for helper types that only make sense alongside the outer class, such as a <code>Builder</code> or a <code>Node</code> in a linked list.`,
      },
      {
        heading: 'When to Use static, and When Not To',
        body: `Static fits things that truly belong to the class rather than to any object:`,
        list: [
          '<strong>Good uses:</strong> constants, stateless helper methods (<code>Math.abs</code>, <code>Integer.parseInt</code>), static factory methods (<code>List.of(...)</code>), and the <code>main</code> entry point.',
          '<strong>Use with care:</strong> mutable static fields are global state shared by the whole program. They make code harder to test and are unsafe when several threads change them at once.',
          '<strong>Avoid:</strong> making methods static just to skip creating an object. If a method needs an object\'s data, it should be an instance method.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A static counter, a static method, and a static initializer block',
        code: `public class Counter {
    static int objectCount;

    static {
        System.out.println("Static block: class Counter is being loaded");
        objectCount = 0;
    }

    Counter() {
        objectCount++;
    }

    static int getCount() {
        return objectCount;
    }

    public static void main(String[] args) {
        new Counter();
        new Counter();
        new Counter();
        System.out.println("Objects created: " + Counter.getCount());
    }
}`,
        output: `Static block: class Counter is being loaded
Objects created: 3`,
      },
      {
        caption: 'One shared static count vs a separate instance count per object',
        code: `class Visitor {
    static int totalVisitors; // one copy, shared by the whole class
    int visits;               // one copy per object

    void visit() {
        totalVisitors++;
        visits++;
    }
}

public class SharedVsOwn {
    public static void main(String[] args) {
        Visitor asha = new Visitor();
        Visitor ravi = new Visitor();

        asha.visit();
        asha.visit();
        ravi.visit();

        System.out.println("Asha visits: " + asha.visits);
        System.out.println("Ravi visits: " + ravi.visits);
        System.out.println("Total visitors: " + Visitor.totalVisitors);
    }
}`,
        output: `Asha visits: 2
Ravi visits: 1
Total visitors: 3`,
      },
      {
        caption: 'A utility class with a static final constant and a private constructor',
        code: `final class Temperature {
    static final double FREEZING_C = 0.0; // a constant: static and final

    private Temperature() { } // utility class: no objects needed

    static double toFahrenheit(double celsius) {
        return celsius * 9 / 5 + 32;
    }
}

public class TemperatureDemo {
    public static void main(String[] args) {
        System.out.println(Temperature.toFahrenheit(Temperature.FREEZING_C));
        System.out.println(Temperature.toFahrenheit(100));
    }
}`,
        output: `32.0
212.0`,
      },
      {
        caption: 'Static methods are hidden (compile time), instance methods are overridden (runtime)',
        code: `class Animal {
    static String kind() { return "Animal"; }
    String sound() { return "..."; }
}

class Dog extends Animal {
    static String kind() { return "Dog"; } // hides Animal.kind(), does not override it
    @Override
    String sound() { return "Woof"; }      // overrides Animal.sound()
}

public class HidingDemo {
    public static void main(String[] args) {
        Animal pet = new Dog();
        System.out.println(pet.sound()); // chosen at runtime by the object: Dog
        System.out.println(pet.kind());  // chosen at compile time by the variable type: Animal
    }
}`,
        output: `Woof
Animal`,
      },
    ],
    commonMistakes: [
      'Trying to access an instance variable directly inside a static method — this fails to compile because static methods have no implicit object to work with.',
      'Assuming each object gets its own copy of a static variable, then being confused when changing it through one object affects every other object.',
      'Forgetting that a static block runs only once per class load, not once per object creation.',
      'Calling an instance (non-static) method from main without first creating an object.',
      'Calling a static method through an object (pet.kind()) and expecting the object\'s class to decide which version runs; static methods are chosen by the declared type.',
      'Using mutable static fields as convenient global variables, which makes code hard to test and unsafe across threads.',
    ],
    keyPoints: [
      'Static members belong to the class, not to individual objects, and are shared across all instances.',
      'Static methods can only directly access other static members and have no implicit "this".',
      'Static blocks run once, at class-loading time, before any object is constructed.',
      'Access static members through the class name; static final fields are constants named in UPPER_SNAKE_CASE.',
      'A static method in a subclass hides the parent\'s version; it is never overridden.',
    ],
  },

  'this-keyword': {
    title: 'this Keyword',
    intro: `<code>this</code> is a reference variable in Java that refers to the current object — the specific object on which an instance method or constructor is currently executing. It is implicitly available inside every non-static method and constructor, even though you never declare or assign it yourself.`,
    sections: [
      {
        heading: 'this.field — Resolving Naming Conflicts',
        body: `The most common use of <code>this</code> is to distinguish an instance variable from a parameter or local variable that shares the same name, a situation called shadowing. Writing <code>this.balance = balance;</code> inside a constructor tells the compiler that the left-hand <code>balance</code> is the object's field, while the plain <code>balance</code> on the right is the constructor's parameter. Without the <code>this.</code> prefix in that scenario, <code>balance = balance;</code> would simply assign the parameter to itself and leave the field untouched.`,
      },
      {
        heading: 'this(...) — Constructor Chaining',
        body: `When used as a method-call-like expression, <code>this(...)</code> invokes another constructor of the same class, matched by argument list, as covered in the constructors topic. This is a completely different use from <code>this.field</code>: <code>this(...)</code> can only appear inside a constructor, at most once, while <code>this.field</code> can appear anywhere inside an instance method or constructor. Until Java 24 the <code>this(...)</code> call had to be the first statement; since Java 25 it may follow statements that don't use the object being built, such as argument checks.`,
      },
      {
        heading: 'Other Uses of this',
        body: `<code>this</code> can also be passed as an argument to another method (for example, registering the current object as a listener), returned from a method to support method chaining (<code>return this;</code>), and used to explicitly call another instance method of the current object (<code>this.someMethod()</code>), although that explicit form is usually optional since the method name alone resolves to the current object by default.`,
        list: [
          '<code>this.field</code> — refers to the current object\'s field, most often to resolve shadowing.',
          '<code>this(...)</code> — calls another constructor in the same class; code before it must not use the object being built.',
          '<code>this</code> is never available inside a static context, because static code has no current object.',
        ],
      },
      {
        heading: 'How Java Resolves a Name: Why Shadowing Happens',
        body: `When Java sees a plain name like <code>balance</code>, it looks in the closest scope first: local variables and parameters, then the fields of the current class, then inherited fields. So inside a constructor with a parameter called <code>balance</code>, the plain name always means the parameter, and the field is hidden (shadowed). <code>this.balance</code> skips the local scope and goes straight to the current object's field. When there is no clash, for example a field <code>balance</code> and a parameter <code>amount</code>, writing <code>balance</code> already means the field, so <code>this.</code> is optional.`,
      },
      {
        heading: 'Why the Bug Is Silent',
        body: `<code>owner = owner;</code> is perfectly legal Java: it assigns the parameter to itself. The compiler doesn't reject it, the program runs, and the field simply keeps its default value (<code>null</code>, <code>0</code> or <code>false</code>). You only notice later, when something reads the field. Two habits prevent it: always write <code>this.field = field</code> when the names match, and make fields <code>final</code> where you can. The compiler then reports a <code>final</code> field the constructor forgot to assign.`,
      },
      {
        heading: 'Outer.this in Inner Classes',
        body: `Inside an inner (non-static nested) class, <code>this</code> means the inner object. To reach the enclosing object, write the outer class name followed by <code>.this</code>, as in <code>Course.this.title</code>. This is the only way to read an outer field that the inner class has shadowed with a field of the same name. Static nested classes have no enclosing object, so <code>Outer.this</code> is not available there.`,
      },
      {
        heading: 'Passing this Safely',
        body: `Handing <code>this</code> to another object (as an argument or a callback) is normal in methods. Avoid doing it inside a constructor, though: the other object then holds a reference to an object that isn't fully initialised yet, which can expose half-set fields. Finish construction first, then register the object from a method or a factory.`,
      },
    ],
    examples: [
      {
        caption: 'Resolving shadowed parameters with this.field',
        code: `public class Employee {
    String name;
    double salary;

    Employee(String name, double salary) {
        this.name = name;     // this.name is the field, name is the parameter
        this.salary = salary;
    }

    Employee giveRaise(double amount) {
        this.salary += amount;
        return this; // enables method chaining
    }

    public static void main(String[] args) {
        Employee emp = new Employee("Dev", 50000.0);
        emp.giveRaise(2000.0).giveRaise(1500.0);
        System.out.println(emp.name + " now earns " + emp.salary);
    }
}`,
        output: 'Dev now earns 53500.0',
      },
      {
        caption: 'The silent shadowing bug: a field left at its default value',
        code: `class Account {
    String owner;
    double balance;

    Account(String owner, double balance) {
        owner = owner;          // bug: assigns the parameter to itself
        this.balance = balance; // correct: assigns the parameter to the field
    }
}

public class ShadowingBug {
    public static void main(String[] args) {
        Account acc = new Account("Meera", 2500.0);
        System.out.println("Owner: " + acc.owner);
        System.out.println("Balance: " + acc.balance);
    }
}`,
        output: `Owner: null
Balance: 2500.0`,
      },
      {
        caption: 'A local variable, this.field and Outer.this.field with the same name',
        code: `class Course {
    String title = "Core Java";

    class Lesson {
        String title = "this Keyword";

        void describe() {
            String title = "local variable";
            System.out.println(title);              // the local variable
            System.out.println(this.title);         // the Lesson object's field
            System.out.println(Course.this.title);  // the enclosing Course object's field
        }
    }
}

public class OuterThisDemo {
    public static void main(String[] args) {
        Course course = new Course();
        Course.Lesson lesson = course.new Lesson();
        lesson.describe();
    }
}`,
        output: `local variable
this Keyword
Core Java`,
      },
      {
        caption: 'Passing this from a method so another object can keep a reference',
        code: `import java.util.ArrayList;
import java.util.List;

class Classroom {
    private final List<Student> students = new ArrayList<>();

    void enrol(Student student) {
        students.add(student);
    }

    int size() {
        return students.size();
    }
}

class Student {
    final String name;

    Student(String name) {
        this.name = name;
    }

    void join(Classroom room) {
        room.enrol(this); // hand this object to another object
    }
}

public class PassThisDemo {
    public static void main(String[] args) {
        Classroom room = new Classroom();
        new Student("Asha").join(room);
        new Student("Ravi").join(room);
        System.out.println("Students enrolled: " + room.size());
    }
}`,
        output: 'Students enrolled: 2',
      },
    ],
    commonMistakes: [
      'Forgetting "this." when a constructor parameter shadows an instance field, causing the field to silently stay at its default value.',
      'Trying to use "this" inside a static method, which does not compile since static code has no current object.',
      'Using the object (this, its fields or instance methods) before the this(...) call in a constructor.',
      'Confusing this(...) (same-class constructor chaining) with super(...) (parent-class constructor call).',
      'Passing "this" to other objects from inside a constructor, exposing an object that is not fully initialised yet.',
    ],
    keyPoints: [
      '"this" refers to the current object inside instance methods and constructors.',
      '"this.field" resolves naming conflicts between fields and parameters/local variables (shadowing).',
      'A plain name resolves to the nearest scope first, so "this." is only required when a local name hides the field.',
      '"this(...)" chains to another constructor in the same class; code before it must not touch the object being built.',
      '"Outer.this" reaches the enclosing object from inside an inner class.',
      '"this" cannot be used in a static context, since static members have no associated object.',
    ],
  },

  'java-inheritance': {
    title: 'Java Inheritance',
    intro: `Inheritance is the OOP mechanism that lets one class (the subclass or child class) acquire the fields and methods of another class (the superclass or parent class) using the <code>extends</code> keyword. It models an "is-a" relationship — a <code>Car</code> is a <code>Vehicle</code>, a <code>Savings Account</code> is a <code>Bank Account</code> — and it allows common behavior to be written once in a parent class and reused by every subclass, rather than duplicated.`,
    sections: [
      {
        heading: 'What Gets Inherited',
        body: `A subclass automatically inherits the non-private fields and methods of its superclass, meaning it can use them as if they were declared in the subclass itself. Private members of the superclass exist in the subclass's memory layout but are not directly accessible by name from the subclass — they can only be reached indirectly through public or protected methods the superclass provides. Constructors are never inherited, but a subclass constructor always invokes a superclass constructor (implicitly or via <code>super(...)</code>) before running its own body.`,
      },
      {
        heading: 'Single Inheritance Only, for Classes',
        body: `Java deliberately supports only single inheritance for classes — a class can extend exactly one direct superclass, never more than one. This avoids the "diamond problem" that arises in languages with multiple class inheritance, where ambiguity occurs if two parent classes define a conflicting method. A class can, however, implement multiple interfaces, which is how Java achieves a safe form of multiple inheritance of type without inheriting conflicting implementation.`,
      },
      {
        heading: 'The Inheritance Chain and Object',
        body: `Every class in Java, if it does not explicitly extend another class, implicitly extends <code>java.lang.Object</code>, which is why every object has methods like <code>toString()</code>, <code>equals()</code>, and <code>hashCode()</code> available by default. Inheritance can also be chained across multiple levels (a class extending a class that extends another class), and a subclass inherits members from every class above it in that chain.`,
        list: [
          'Use <code>extends</code> for a class to inherit from exactly one superclass.',
          'A subclass gains access to public and protected superclass members directly by name.',
          'Every class ultimately inherits from <code>java.lang.Object</code> if it extends nothing else.',
        ],
      },
      {
        heading: 'Types of Inheritance in Java',
        body: `Inheritance is usually described in five shapes. Java classes support three of them directly. The other two are possible only through interfaces.`,
        list: [
          '<strong>Single</strong>: one class extends one class, such as <code>Car extends Vehicle</code>.',
          '<strong>Multilevel</strong>: a chain, such as <code>Dog extends Mammal</code> and <code>Mammal extends Animal</code>. <code>Dog</code> inherits from both classes above it.',
          '<strong>Hierarchical</strong>: several classes extend the same parent, such as <code>Car</code>, <code>Bike</code> and <code>Truck</code> all extending <code>Vehicle</code>.',
          '<strong>Multiple</strong>: one class with two parents. Classes cannot do this, but a class can implement several interfaces: <code>class Duck implements Flyer, Swimmer</code>.',
          '<strong>Hybrid</strong>: a mix of the shapes above. Java allows it only when the multiple-parent part uses interfaces.',
        ],
      },
      {
        heading: 'Constructor Order in an Inheritance Chain',
        body: `When you create a subclass object, the constructors run from the top of the chain down. Each constructor first calls its parent's constructor through <code>super(...)</code>, written by you or inserted by the compiler, so the <code>Object</code> part is built first, then each parent, and the subclass last. This guarantees that inherited fields are set up before the subclass code uses them. In the multilevel example below, creating a <code>Dog</code> prints the <code>Animal</code>, <code>Mammal</code> and <code>Dog</code> constructor messages in that order.`,
      },
      {
        heading: 'Access Modifiers Across the Hierarchy',
        body: `The access modifier on a member decides whether a subclass can use it by name.`,
        list: [
          '<code>public</code>: visible to the subclass and to everyone else.',
          '<code>protected</code>: visible to subclasses, even in other packages, and to classes in the same package. Use it for members meant for subclasses.',
          'Default (no modifier): visible only to subclasses in the same package.',
          '<code>private</code>: never visible by name in a subclass. Reach it through a public or protected method of the parent.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A subclass inheriting and extending superclass behavior',
        code: `class Vehicle {
    String brand = "Generic";

    void start() {
        System.out.println(brand + " vehicle starting");
    }
}

class Car extends Vehicle {
    int numberOfDoors = 4;

    void honk() {
        System.out.println(brand + " car honking with " + numberOfDoors + " doors");
    }
}

public class InheritanceDemo {
    public static void main(String[] args) {
        Car myCar = new Car();
        myCar.brand = "Toyota";
        myCar.start(); // inherited from Vehicle
        myCar.honk();  // defined in Car
    }
}`,
        output: `Toyota vehicle starting
Toyota car honking with 4 doors`,
      },
      {
        caption: 'Multilevel inheritance: constructors run top-down, and Dog inherits from every class above it',
        code: `public class MultilevelDemo {
    public static void main(String[] args) {
        Dog dog = new Dog("Rex");
        dog.eat();     // from Animal
        dog.breathe(); // from Mammal
        dog.bark();    // from Dog
        System.out.println(dog instanceof Animal);
    }
}

class Animal {
    protected String name;

    Animal(String name) {
        this.name = name;
        System.out.println("Animal constructor");
    }

    void eat() {
        System.out.println(name + " is eating");
    }
}

class Mammal extends Animal {
    Mammal(String name) {
        super(name);
        System.out.println("Mammal constructor");
    }

    void breathe() {
        System.out.println(name + " breathes air");
    }
}

class Dog extends Mammal {
    Dog(String name) {
        super(name);
        System.out.println("Dog constructor");
    }

    void bark() {
        System.out.println(name + " says woof");
    }
}`,
        output: `Animal constructor
Mammal constructor
Dog constructor
Rex is eating
Rex breathes air
Rex says woof
true`,
      },
    ],
    commonMistakes: [
      'Trying to make a class extend two classes at once (e.g. "class C extends A, B") — Java does not allow multiple class inheritance.',
      'Assuming private superclass fields are directly accessible in the subclass by name, when they are only reachable through inherited public/protected accessors.',
      'Forgetting that constructors are not inherited — a subclass must define its own constructors, even if they just call super().',
      'Confusing "is-a" (inheritance, extends) with "has-a" (composition, a field of another class type) and inheriting when composition would model the relationship more accurately.',
    ],
    keyPoints: [
      'Inheritance lets a subclass reuse fields and methods of a superclass via "extends", modeling an "is-a" relationship.',
      'Java allows only single inheritance between classes, but a class can implement multiple interfaces.',
      'Constructors are not inherited, and every class ultimately extends java.lang.Object.',
      'Java classes support single, multilevel and hierarchical inheritance; multiple and hybrid inheritance need interfaces.',
      'Constructors in a chain run from the top superclass down to the subclass.',
    ],
  },

  'super-keyword': {
    title: 'super Keyword',
    intro: `<code>super</code> is a reference used inside a subclass to explicitly refer to its immediate superclass — its fields, its methods, or its constructors. It plays a role parallel to <code>this</code>, except <code>this</code> points to the current object while <code>super</code> points specifically to the parent class's part of that same object.`,
    sections: [
      {
        heading: 'super(...) — Calling the Superclass Constructor',
        body: `<code>super(...)</code> invokes a constructor of the immediate superclass, and if used, it must be the first statement inside the subclass constructor — the compiler rejects any code before it, for the same reason <code>this(...)</code> must come first. If a subclass constructor does not explicitly call <code>super(...)</code>, Java automatically inserts a call to the superclass's no-argument constructor as the first statement. If the superclass has no no-argument constructor available, the subclass is then required to call <code>super(...)</code> explicitly with matching arguments, or the code fails to compile.`,
      },
      {
        heading: 'super.field and super.method() — Accessing Hidden or Overridden Members',
        body: `<code>super.fieldName</code> accesses a field defined in the superclass, which is useful when a subclass declares a field with the same name (field hiding). <code>super.methodName()</code> calls the superclass's version of a method even when the subclass has overridden that method — this is commonly used inside an overriding method to extend, rather than completely replace, the parent's behavior.`,
        list: [
          '<code>super(...)</code> must be the first statement in a constructor, exactly like <code>this(...)</code>.',
          'A constructor cannot contain both <code>this(...)</code> and <code>super(...)</code> — only one first statement is allowed.',
          '<code>super.method()</code> is often used inside an override to run the parent behavior and then add subclass-specific logic.',
        ],
      },
      {
        heading: 'super.variable and Field Hiding',
        body: `Methods are overridden, but fields are not. If <code>Dog</code> declares a field <code>type</code> and <code>Animal</code> already has one with the same name, a <code>Dog</code> object holds <em>two</em> separate fields. Inside <code>Dog</code>, plain <code>type</code> and <code>this.type</code> mean the dog's field, and <code>super.type</code> reaches the one declared in <code>Animal</code>. Which field you get depends on the declared type of the reference, not the real object: through an <code>Animal</code> variable you see <code>Animal</code>'s field even when the object is a <code>Dog</code>. That is the opposite of how overridden methods behave, and it is why field hiding is best avoided in real code. Give the field a different name, or make it private and expose it through a method.`,
      },
      {
        heading: 'Constructor Chaining Up the Hierarchy',
        body: `Every constructor starts by running a constructor of its parent, either the one you name with <code>super(...)</code> or, when you write nothing, the parent's no-argument constructor that the compiler inserts for you. That parent constructor in turn calls its own parent, all the way up to <code>Object</code>. The result is that constructors run from the top of the hierarchy down: for <code>Puppy extends Dog extends Animal</code>, creating a <code>Puppy</code> prints <code>Animal()</code>, then <code>Dog()</code>, then <code>Puppy()</code>. This order guarantees that the parent's fields are set up before the child's constructor body can use them.`,
      },
      {
        heading: 'What super Cannot Do',
        list: [
          'It cannot be used in a <code>static</code> method or static block. There is no current object there, so the compiler reports <code>non-static variable super cannot be referenced from a static context</code>.',
          'It cannot skip a level: <code>super.super.method()</code> is not valid Java. A class can only reach its immediate parent; if the grandparent\'s behaviour is needed, the parent has to expose it.',
          'It cannot reach <code>private</code> members of the parent. <code>super.secret</code> fails to compile when <code>secret</code> is private, just as it would without <code>super</code>.',
        ],
      },
    ],
    examples: [
      {
        caption: 'super() for construction and super.method() to extend overridden behavior',
        code: `class Animal {
    String name;

    Animal(String name) {
        this.name = name;
    }

    void makeSound() {
        System.out.println(name + " makes a generic animal sound");
    }
}

class Dog extends Animal {
    Dog(String name) {
        super(name); // must be first statement
    }

    @Override
    void makeSound() {
        super.makeSound(); // run the parent version first
        System.out.println(name + " barks");
    }

    public static void main(String[] args) {
        Dog d = new Dog("Rex");
        d.makeSound();
    }
}`,
        output: `Rex makes a generic animal sound
Rex barks`,
      },
      {
        caption: 'All three uses together: super(), super.variable and super.method()',
        code: `public class SuperDemo {
    public static void main(String[] args) {
        Dog d = new Dog("Rex");
        System.out.println("---");
        d.describe();
        System.out.println("---");
        d.makeSound();
    }
}

class Animal {
    String name;
    String type = "animal";

    Animal(String name) {
        this.name = name;
        System.out.println("Animal constructor: " + name);
    }

    void makeSound() {
        System.out.println(name + " makes a sound");
    }
}

class Dog extends Animal {
    String type = "dog";          // hides Animal.type

    Dog(String name) {
        super(name);              // runs Animal(String) first
        System.out.println("Dog constructor: " + name);
    }

    void describe() {
        System.out.println("type       = " + type);
        System.out.println("this.type  = " + this.type);
        System.out.println("super.type = " + super.type);
        Animal asAnimal = this;
        System.out.println("((Animal) this).type = " + asAnimal.type);
    }

    @Override
    void makeSound() {
        super.makeSound();        // parent's version first
        System.out.println(name + " barks");
    }
}`,
        output: `Animal constructor: Rex
Dog constructor: Rex
---
type       = dog
this.type  = dog
super.type = animal
((Animal) this).type = animal
---
Rex makes a sound
Rex barks`,
      },
      {
        caption: 'Constructor chaining across three levels',
        code: `public class Chain {
    public static void main(String[] args) {
        new Puppy();
    }
}

class Animal {
    Animal() { System.out.println("1. Animal()"); }
}

class Dog extends Animal {
    Dog() { System.out.println("2. Dog()"); }          // compiler inserts super();
}

class Puppy extends Dog {
    Puppy() {
        super();                                        // explicit, same effect
        System.out.println("3. Puppy()");
    }
}`,
        output: `1. Animal()
2. Dog()
3. Puppy()`,
      },
      {
        caption: 'The compile errors you will meet (javac 17)',
        code: `// 1. Parent has no no-argument constructor, child does not call super(...)
class Animal {
    String name;
    Animal(String name) { this.name = name; }
}
class Dog extends Animal {
    Dog() {
        System.out.println("creating a dog");
    }
}

// 2. A statement before super(...)
class Cat extends Animal {
    Cat(String name) {
        if (name.isBlank()) throw new IllegalArgumentException("name required");
        super(name);
    }
}

// 3. super inside a static method
class Bird extends Animal {
    Bird() { super("bird"); }
    static void test() {
        super.toString();
    }
}`,
        output: `1. error: constructor Animal in class Animal cannot be applied to given types;
       Dog() {
             ^
     required: String
     found:    no arguments
     reason: actual and formal argument lists differ in length

2. error: call to super must be first statement in constructor
           super(name);
                ^

3. error: non-static variable super cannot be referenced from a static context
           super.toString();
           ^`,
      },
    ],
    commonMistakes: [
      'Placing statements before super(...) in a subclass constructor, which is a compile-time error.',
      'Forgetting that the compiler inserts an implicit no-argument super() call when none is written, which fails to compile if the superclass has no no-argument constructor.',
      'Trying to write both this(...) and super(...) in the same constructor — only one of them may occupy the required first-statement position.',
      'Using "super" inside a static method, where it has no meaning since there is no current object.',
      'Expecting fields to behave like overridden methods. A hidden field is chosen by the reference type, so an Animal variable shows Animal\'s value even for a Dog.',
      'Writing super.super.method() to reach a grandparent; Java only allows access to the immediate parent.',
      'Forgetting super.method() inside an override that should extend the parent, so the parent\'s work (logging, validation, cleanup) silently stops happening.',
    ],
    keyPoints: [
      'super(...) calls a superclass constructor and must be the first statement in the subclass constructor.',
      'If omitted, Java implicitly calls the superclass\'s no-argument constructor first.',
      'super.field and super.method() access the superclass\'s version of a hidden field or overridden method.',
      'Constructors run from the top of the hierarchy down: Animal, then Dog, then Puppy.',
      'Fields are hidden, not overridden: the reference type decides which one you read.',
      'super is unavailable in static code, cannot skip a level, and cannot reach private members.',
    ],
  },

  'method-overriding': {
    title: 'Method Overriding',
    intro: `Method overriding occurs when a subclass provides its own implementation of a method that is already defined, with the exact same signature, in its superclass. Unlike overloading, which the compiler resolves at compile time, overriding is resolved at runtime based on the actual type of the object — this is the basis of runtime polymorphism.`,
    sections: [
      {
        heading: 'Rules an Override Must Follow',
        body: `For a subclass method to count as a valid override, several strict rules apply, and the compiler enforces every one of them.`,
        list: [
          'The method name and parameter list (the signature) must be identical to the superclass method.',
          'The return type must be the same, or a <strong>covariant return type</strong> — a subtype of the original return type — which Java has allowed since version 5.',
          'The access modifier in the subclass cannot be more restrictive than in the superclass (you cannot override a <code>public</code> method with a <code>protected</code> one, for example), though it may be less restrictive.',
          'The overriding method cannot throw new or broader checked exceptions than the overridden method declares.',
          'A method marked <code>final</code>, <code>static</code>, or <code>private</code> in the superclass cannot be overridden at all.',
        ],
      },
      {
        heading: 'The @Override Annotation',
        body: `<code>@Override</code> is an optional but strongly recommended annotation placed above an overriding method. It does not change runtime behavior, but it instructs the compiler to verify that the method actually overrides a superclass method — if you misspell the method name or get the parameter list wrong, the compiler raises an error immediately instead of silently creating an unrelated overloaded method.`,
      },
      {
        heading: 'Overriding vs Overloading',
        body: `Overriding always involves two classes in an inheritance relationship and an identical signature, resolved at runtime. Overloading always happens within the same class (or via inheritance without changing the return-type-only rule) with a different parameter list, resolved at compile time. Confusing the two is one of the most frequent conceptual errors in Java learning.`,
      },
    ],
    examples: [
      {
        caption: 'A valid override with a covariant return type',
        code: `class Shape {
    double area() {
        return 0.0;
    }

    Shape createCopy() {
        return new Shape();
    }
}

class Circle extends Shape {
    double radius = 5.0;

    @Override
    double area() {
        return Math.PI * radius * radius;
    }

    @Override
    Circle createCopy() { // covariant return type: Circle is a subtype of Shape
        return new Circle();
    }

    public static void main(String[] args) {
        Circle c = new Circle();
        System.out.printf("Area: %.2f%n", c.area());
    }
}`,
        output: 'Area: 78.54',
      },
    ],
    commonMistakes: [
      'Slightly changing the parameter list of what was meant to be an override, which accidentally creates an unrelated overload instead — @Override would have caught this at compile time.',
      'Trying to override a static, final, or private method, none of which can be overridden.',
      'Reducing the visibility of an overriding method (e.g. from public to protected), which fails to compile.',
      'Trying to change the return type to an unrelated type instead of a covariant (subtype) return type.',
    ],
    keyPoints: [
      'Overriding requires an identical method signature between superclass and subclass, resolved at runtime.',
      'The return type must match or be covariant; visibility cannot be reduced; checked exceptions cannot be broadened.',
      'static, final, and private methods cannot be overridden.',
      '@Override is optional but lets the compiler catch signature mistakes early.',
    ],
  },

  'runtime-polymorphism-and-dynamic-binding': {
    title: 'Runtime Polymorphism and Dynamic Binding',
    intro: `Runtime polymorphism is the ability for a single method call, written once against a superclass or interface type, to execute different implementations depending on the actual (runtime) type of the object it is called on. It is made possible by method overriding combined with dynamic method dispatch — the mechanism the JVM uses to decide, at the moment of the call, exactly which overridden version of a method to run.`,
    sections: [
      {
        heading: 'Static Binding vs Dynamic Binding',
        body: `Java resolves method calls in one of two ways. <strong>Static binding</strong> happens at compile time and applies to <code>private</code>, <code>static</code>, and <code>final</code> methods, along with all fields — the compiler already knows exactly which method or field will be used, based purely on the declared (reference) type. <strong>Dynamic binding</strong> happens at runtime and applies to overridden instance methods — the JVM looks at the actual object on the heap, not the reference type used to call it, and dispatches to that object's overridden version.`,
      },
      {
        heading: 'Virtual Method Invocation',
        body: `When you call an instance method through a superclass reference variable that actually points to a subclass object, the JVM performs virtual method invocation: it inspects the real object's class at runtime and calls the most specific overriding version available in that object's actual class, walking up the inheritance chain only if no override exists at that level. This is why a <code>Shape</code> reference holding a <code>Circle</code> object calls <code>Circle</code>'s <code>area()</code>, not <code>Shape</code>'s.`,
      },
      {
        heading: 'Fields Are NOT Polymorphic',
        body: `This is one of the most important and most frequently tested distinctions in Java: fields are resolved using static binding based on the reference type, not the object's actual type, even when a subclass declares a field with the same name (field hiding rather than overriding). Only instance methods participate in dynamic, runtime polymorphism — fields never do. Accessing <code>obj.field</code> through a superclass-typed reference always returns the superclass's field, regardless of what the object underneath actually is.`,
        list: [
          'Overridden instance methods: resolved by the object\'s actual runtime type (dynamic binding).',
          'Fields, static methods, and private/final methods: resolved by the reference\'s declared compile-time type (static binding).',
          'This asymmetry is why polymorphism is described as applying to "methods, not fields."',
        ],
      },
    ],
    examples: [
      {
        caption: 'Overridden methods are polymorphic; fields are not',
        code: `class Shape {
    String label = "Shape";

    String describe() {
        return "A generic shape";
    }
}

class Square extends Shape {
    String label = "Square"; // hides Shape.label, does not override it

    @Override
    String describe() {
        return "A square";
    }
}

public class PolymorphismDemo {
    public static void main(String[] args) {
        Shape ref = new Square(); // superclass reference, subclass object

        System.out.println(ref.describe()); // dynamic binding -> Square's version
        System.out.println(ref.label);       // static binding -> Shape's field
    }
}`,
        output: `A square
Shape`,
      },
    ],
    commonMistakes: [
      'Expecting ref.label to print the subclass value when ref is declared as the superclass type — fields are resolved by the reference type, not the object type.',
      'Assuming static methods participate in runtime polymorphism when called through an object reference — static methods are resolved by the reference\'s declared type at compile time.',
      'Believing polymorphism requires an explicit interface — it works equally well through plain class inheritance with overriding.',
      'Forgetting that private and final methods use static binding and therefore cannot be polymorphic, since they cannot be overridden.',
    ],
    keyPoints: [
      'Runtime polymorphism works through overriding plus dynamic method dispatch, based on the object\'s actual runtime type.',
      'Static binding (fields, static/private/final methods) is resolved at compile time using the reference\'s declared type.',
      'Only overridden instance methods are polymorphic — fields are always resolved statically, even when hidden by a subclass.',
    ],
  },

  'instance-initializer-block': {
    title: 'Instance Initializer Block',
    intro: `An instance initializer block (IIB) is a block of code enclosed in plain braces <code>{ ... }</code> directly inside a class body, without any keyword like <code>static</code> in front of it. Unlike a static block, which runs once when the class is loaded, an instance initializer block runs every single time an object of the class is created — specifically, every time before the constructor body executes.`,
    sections: [
      {
        heading: 'When Instance Initializer Blocks Run',
        body: `Java performs object construction in a strict order: first, if this class has a superclass, the superclass's constructor chain runs completely (via the implicit or explicit <code>super(...)</code> call). Then, within this class, instance variable initializers and instance initializer blocks run in the exact top-to-bottom order they appear in the source file. Only after all of that completes does the remaining code in this class's constructor body run.`,
        list: [
          'Superclass constructor (always runs first, even if implicit).',
          'Instance variable initializers and instance initializer blocks, in source order.',
          'The rest of the current constructor\'s body.',
        ],
      },
      {
        heading: 'Why Use an Instance Initializer Block',
        body: `Instance initializer blocks are most useful when a class has multiple overloaded constructors that all need to share some common initialization logic that is too involved for a simple field initializer expression — placing that shared logic in an IIB guarantees it runs no matter which constructor is used, without duplicating code in every constructor. In modern Java, this pattern is relatively uncommon since constructor chaining with <code>this(...)</code> usually achieves the same goal more explicitly, but it still appears in anonymous class initialization and in legacy codebases.`,
      },
      {
        heading: 'Instance Block vs Static Block',
        body: `A static block runs exactly once per class, at class-loading time, before any object exists. An instance initializer block runs once per object creation, every time <code>new</code> is used, right before the constructor body — meaning if you create five objects, the instance block runs five times, but a static block in the same class would have already run only once, earlier, at class load.`,
      },
    ],
    examples: [
      {
        caption: 'Execution order: static block once, instance block and constructor per object',
        code: `public class InitDemo {
    static {
        System.out.println("Static block (runs once, at class load)");
    }

    {
        System.out.println("Instance initializer block (runs before each constructor)");
    }

    InitDemo() {
        System.out.println("Constructor body");
    }

    public static void main(String[] args) {
        System.out.println("Creating first object:");
        new InitDemo();
        System.out.println("Creating second object:");
        new InitDemo();
    }
}`,
        output: `Static block (runs once, at class load)
Creating first object:
Instance initializer block (runs before each constructor)
Constructor body
Creating second object:
Instance initializer block (runs before each constructor)
Constructor body`,
      },
    ],
    commonMistakes: [
      'Confusing an instance initializer block with a static block just because both use braces — omitting "static" changes it to run per-object instead of once per class.',
      'Assuming the instance initializer block runs after the constructor body — it always runs before the remaining constructor code, right after the superclass constructor completes.',
      'Not realizing multiple instance initializer blocks and field initializers all run in strict top-to-bottom source order, which matters if one depends on a value set by another.',
      'Overusing instance initializer blocks instead of a private helper method or this(...) chaining, making initialization logic harder to follow than necessary.',
    ],
    keyPoints: [
      'An instance initializer block is a brace-only block (no "static") that runs once per object, before the constructor body.',
      'Execution order is: superclass constructor, then instance variable initializers and instance initializer blocks in source order, then the current constructor\'s remaining body.',
      'A static block runs once per class load; an instance initializer block runs once per object creation.',
    ],
  },
}
