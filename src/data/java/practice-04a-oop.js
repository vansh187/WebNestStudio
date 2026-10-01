// Practice blocks for the Object-Oriented Programming module, part 1 of 3
// (OOP concepts through the super keyword). Merged onto the lesson entries in
// index.js by slug, so the lesson prose files stay unchanged.
export const practice04aOop = {
  'oops-concepts-in-java': {
    whyItMatters: `The four pillars are not exam vocabulary; they are the reasons large Java codebases stay manageable. Encapsulation keeps invalid data out, abstraction hides detail you do not need, inheritance removes duplication, and polymorphism lets new types slot in without changing existing code. Almost every Java interview opens with a question about them.`,
    exercise: {
      prompt: `Write a <code>Thermostat</code> that protects its own data. The target temperature must stay between 16 and 30; a request outside that range is ignored.

Expected output: <code>22</code>, then <code>22</code> again after an attempt to set it to 40.`,
      starterCode: `class Thermostat {
    // TODO: a private field for the target temperature, starting at 20
    // TODO: setTarget(int value) that ignores values below 16 or above 30
    // TODO: getTarget()
}

public class ThermostatDemo {
    public static void main(String[] args) {
        Thermostat thermostat = new Thermostat();
        thermostat.setTarget(22);
        System.out.println(thermostat.getTarget());
        thermostat.setTarget(40);
        System.out.println(thermostat.getTarget());
    }
}`,
      hints: [
        'Make the field <code>private</code> so the only way to change it is through <code>setTarget</code>.',
        'Inside the setter, assign the value only when it is within the allowed range.',
      ],
      solution: `class Thermostat {
    private int target = 20;

    void setTarget(int value) {
        if (value >= 16 && value <= 30) {
            target = value;
        }
    }

    int getTarget() {
        return target;
    }
}

public class ThermostatDemo {
    public static void main(String[] args) {
        Thermostat thermostat = new Thermostat();
        thermostat.setTarget(22);
        System.out.println(thermostat.getTarget()); // 22
        thermostat.setTarget(40);
        System.out.println(thermostat.getTarget()); // 22
    }
}`,
    },
    quiz: [
      {
        question: 'Keeping fields private and exposing them only through methods that enforce rules is an example of which principle?',
        options: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Overloading'],
        answer: 1,
        explanation: 'Encapsulation bundles data with the methods that control it and hides the data from outside code.',
      },
      {
        question: 'The same call, <code>shape.area()</code>, runs different code depending on whether the object is a Circle or a Square. Which principle is this?',
        options: ['Encapsulation', 'Abstraction', 'Polymorphism', 'Aggregation'],
        answer: 2,
        explanation: 'Polymorphism means one interface with many implementations, chosen by the actual type of the object at runtime.',
      },
      {
        question: 'What is the relationship between a class and an object?',
        options: ['They are the same thing', 'A class is a blueprint; an object is an instance created from it', 'An object is a blueprint for a class', 'A class is stored on the heap, an object on the stack'],
        answer: 1,
        explanation: 'A class defines fields and methods. Each object created with new is a separate instance with its own field values.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the four pillars of object-oriented programming?',
        answer: `Encapsulation: keeping data and the methods that operate on it together and restricting direct access. Abstraction: exposing what an object does while hiding how. Inheritance: a class reusing and extending the fields and methods of another. Polymorphism: one method call behaving differently depending on the object's actual type.`,
      },
      {
        question: 'What is the difference between abstraction and encapsulation?',
        answer: `Abstraction is about design: deciding what to expose so callers can use something without knowing its internals, typically through abstract classes and interfaces. Encapsulation is about implementation: hiding the data inside a class with access modifiers and controlling it through methods. Abstraction hides complexity; encapsulation hides and protects state.`,
      },
    ],
  },

  'classes-and-objects': {
    whyItMatters: `Everything you build in Java is made of classes and the objects created from them. The idea that trips up newcomers is that a variable does not contain an object; it holds a reference to one. Once that is clear, behaviour such as "I changed <code>b</code> and <code>a</code> changed too" stops being a mystery.`,
    exercise: {
      prompt: `Create a <code>Book</code> class with a title and a page count, and a method <code>isLong()</code> that returns true when the book has more than 300 pages. Create two books and print the result for each.

Expected output: <code>Clean Code: true</code> then <code>Java Basics: false</code>`,
      starterCode: `class Book {
    String title;
    int pages;

    // TODO: isLong() returns true when pages is greater than 300
}

public class BookDemo {
    public static void main(String[] args) {
        // TODO: create a Book titled "Clean Code" with 464 pages
        // TODO: create a Book titled "Java Basics" with 180 pages
        // TODO: print "<title>: <isLong()>" for each
    }
}`,
      hints: [
        'Create each object with <code>new Book()</code> and set its fields with the dot operator.',
        'Each object has its own <code>title</code> and <code>pages</code>; setting one does not affect the other.',
      ],
      solution: `class Book {
    String title;
    int pages;

    boolean isLong() {
        return pages > 300;
    }
}

public class BookDemo {
    public static void main(String[] args) {
        Book first = new Book();
        first.title = "Clean Code";
        first.pages = 464;

        Book second = new Book();
        second.title = "Java Basics";
        second.pages = 180;

        System.out.println(first.title + ": " + first.isLong());
        System.out.println(second.title + ": " + second.isLong());
    }
}`,
    },
    quiz: [
      {
        question: 'What does the <code>new</code> keyword do?',
        options: ['Declares a new class', 'Creates an object on the heap, runs a constructor, and returns a reference to it', 'Copies an existing object', 'Reserves a variable name'],
        answer: 1,
        explanation: 'new allocates memory for the object, initialises it through a constructor, and gives back a reference that you store in a variable.',
      },
      {
        question: 'You create two objects of the same class and set a field on the first. What happens to that field on the second?',
        options: ['It changes too', 'It is unchanged; each object has its own copy of instance fields', 'It becomes null', 'The code does not compile'],
        answer: 1,
        explanation: 'Instance fields belong to each object separately. Only static fields are shared.',
      },
      {
        question: 'After <code>Student a = new Student(); Student b = a; b.name = "Ravi";</code>, what is <code>a.name</code>?',
        options: ['null', 'Ravi', 'An empty string', 'It does not compile'],
        answer: 1,
        explanation: 'b = a copies the reference, so both variables point to the same object. A change made through b is visible through a.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a class and an object?',
        answer: `A class is a definition written in source code: it lists the fields and methods its objects will have. It exists once. An object is a concrete instance created from that class at runtime with <code>new</code>; it occupies memory and holds its own values for the fields. You can create any number of objects from one class.`,
      },
      {
        question: 'Where are objects and their reference variables stored?',
        answer: `Objects are always created on the heap. A local variable that refers to an object lives on the stack frame of its method and holds only the reference. When the method returns, the variable disappears; the object remains on the heap until nothing refers to it, at which point the garbage collector can reclaim it.`,
      },
    ],
  },

  'java-naming-conventions': {
    whyItMatters: `Conventions let any Java developer read unfamiliar code and immediately tell a class from a method from a constant. The compiler does not enforce them, but teams do: code that ignores them fails review, confuses tools, and marks its author as new to the language.`,
    exercise: {
      prompt: `This program compiles, but every name breaks a Java naming convention. Rename the class, the constant, the method and the variables to follow the conventions. The output must not change.

Expected output: <code>Total: 236</code>`,
      starterCode: `class order_item {
    static final int taxpercent = 18;

    static int Calculate_Total(int PRICE, int Qty) {
        int sub_total = PRICE * Qty;
        return sub_total + sub_total * taxpercent / 100;
    }

    public static void main(String[] args) {
        System.out.println("Total: " + Calculate_Total(100, 2));
    }
}`,
      hints: [
        'Classes use PascalCase, methods and variables use camelCase, and constants use UPPER_SNAKE_CASE.',
        'Rename one identifier at a time and update every place it is used.',
      ],
      solution: `class OrderItem {
    static final int TAX_PERCENT = 18;

    static int calculateTotal(int price, int quantity) {
        int subTotal = price * quantity;
        return subTotal + subTotal * TAX_PERCENT / 100;
    }

    public static void main(String[] args) {
        System.out.println("Total: " + calculateTotal(100, 2));
    }
}`,
    },
    quiz: [
      {
        question: 'Which name follows the convention for a class?',
        options: ['customerOrder', 'CustomerOrder', 'customer_order', 'CUSTOMER_ORDER'],
        answer: 1,
        explanation: 'Class names use PascalCase: every word starts with a capital letter and there are no underscores.',
      },
      {
        question: 'Which name follows the convention for a method?',
        options: ['CalculateTotal', 'calculate_total', 'calculateTotal', 'CALCULATETOTAL'],
        answer: 2,
        explanation: 'Methods use camelCase and usually start with a verb.',
      },
      {
        question: 'Which package name follows the convention?',
        options: ['com.Webnest.Billing', 'com.webnest.billing', 'Com_Webnest_Billing', 'COM.WEBNEST.BILLING'],
        answer: 1,
        explanation: 'Package names are all lower case, normally starting with the reversed domain name of the organisation.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why follow naming conventions if the compiler does not enforce them?',
        answer: `Because code is read by people and tools far more often than it is written. Consistent names tell a reader at a glance whether something is a type, a method, a variable or a constant. Frameworks also rely on them: libraries that work with JavaBeans expect getters and setters named <code>getName</code> and <code>setName</code>, and will not find properties that are named differently.`,
      },
    ],
  },

  'java-methods-and-method-overloading': {
    whyItMatters: `Methods are how you name a piece of behaviour and reuse it. Overloading lets one name work for several kinds of input, which is why <code>System.out.println</code> accepts an int, a String or an object. The rules for which overload gets chosen are precise, and "which method is called here?" is a standard interview question.`,
    exercise: {
      prompt: `Write three overloaded <code>area</code> methods: one taking a single int (a square), one taking two ints (a rectangle), and one taking a double (a circle of that radius).

Expected output: <code>25</code>, <code>12</code>, then <code>3.141592653589793</code>`,
      starterCode: `public class Area {

    // TODO: area(int side)
    // TODO: area(int width, int height)
    // TODO: area(double radius) using Math.PI

    public static void main(String[] args) {
        System.out.println(area(5));
        System.out.println(area(3, 4));
        System.out.println(area(1.0));
    }
}`,
      hints: [
        'Overloads share a name and differ in the number or types of their parameters.',
        '<code>area(5)</code> picks the int version; <code>area(1.0)</code> picks the double version.',
      ],
      solution: `public class Area {

    static int area(int side) {
        return side * side;
    }

    static int area(int width, int height) {
        return width * height;
    }

    static double area(double radius) {
        return Math.PI * radius * radius;
    }

    public static void main(String[] args) {
        System.out.println(area(5));    // 25
        System.out.println(area(3, 4)); // 12
        System.out.println(area(1.0));  // 3.141592653589793
    }
}`,
    },
    quiz: [
      {
        question: 'Can two methods in the same class have the same name and parameters but different return types?',
        options: ['Yes, that is valid overloading', 'No, it is a compile error', 'Only if one is static', 'Only if one is private'],
        answer: 1,
        explanation: 'The return type is not part of the method signature. Two methods that differ only in return type are duplicates.',
      },
      {
        question: 'A class has <code>print(int x)</code> and <code>print(long x)</code>. Which one does <code>print(5)</code> call?',
        options: ['print(int)', 'print(long)', 'It is ambiguous', 'Neither'],
        answer: 0,
        explanation: 'The literal 5 is an int, and an exact match is always preferred over a widening conversion.',
      },
      {
        question: 'A class has only <code>show(double d)</code>. What happens with <code>show(5)</code>?',
        options: ['Compile error', 'It works; the int is widened to double', 'It throws an exception', 'It prints 5 as an int'],
        answer: 1,
        explanation: 'With no exact match, the compiler applies a widening conversion from int to double.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What makes up a method signature in Java?',
        answer: `The method name and the types of its parameters, in order. The return type, the parameter names, the access modifier and the exceptions it declares are not part of the signature. That is why overloads must differ in their parameter list.`,
      },
      {
        question: 'How does the compiler choose between overloaded methods?',
        answer: `It looks for the most specific match in stages. First an exact match of the argument types; then widening of primitives, such as int to long; then boxing and unboxing, such as int to Integer; and only last a varargs method. The choice is made at compile time from the declared types of the arguments.`,
      },
    ],
  },

  'call-by-value-in-java': {
    whyItMatters: `Whether a method can change the caller's data is one of the most misunderstood parts of Java, and a frequent source of bugs. The rule is a single sentence — Java always passes a copy of the value — but because the value of an object variable is a reference, the effect looks different for primitives and for objects.`,
    diagram: {
      caption: 'The parameter is a copy of the reference. Both point to the same object, so changing a field is visible to the caller; reassigning the parameter is not.',
      svg: `<svg viewBox="0 0 640 200" role="img" aria-label="The caller variable emp and the method parameter e both point to one Employee object; reassigning e makes it point to a new object while emp is unchanged" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-monospace, monospace" font-size="13">
  <text x="70" y="22" text-anchor="middle" fill="currentColor" stroke="none" font-size="12">caller: main()</text>
  <rect x="20" y="32" width="100" height="38" rx="6"/><text x="70" y="56" text-anchor="middle" fill="currentColor" stroke="none">emp</text>
  <text x="70" y="122" text-anchor="middle" fill="currentColor" stroke="none" font-size="12">method: update(e)</text>
  <rect x="20" y="132" width="100" height="38" rx="6"/><text x="70" y="156" text-anchor="middle" fill="currentColor" stroke="none">e (copy)</text>
  <rect x="300" y="32" width="170" height="52" rx="8" stroke-width="3"/>
  <text x="385" y="54" text-anchor="middle" fill="currentColor" stroke="none">Employee</text>
  <text x="385" y="72" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">name = "Asha"</text>
  <path d="M120 51 H300"/><path d="M294 45 L300 51 L294 57"/>
  <path d="M120 145 L300 72"/><path d="M291 70 L300 72 L295 80"/>
  <rect x="300" y="130" width="170" height="52" rx="8" stroke-dasharray="5 4"/>
  <text x="385" y="152" text-anchor="middle" fill="currentColor" stroke="none">new Employee</text>
  <text x="385" y="170" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">only e sees this</text>
  <path d="M120 160 H300" stroke-dasharray="5 4"/><path d="M294 154 L300 160 L294 166"/>
  <text x="490" y="62" fill="currentColor" stroke="none" font-size="11">e.name = "X"</text>
  <text x="490" y="78" fill="currentColor" stroke="none" font-size="11">changes this object</text>
  <text x="490" y="152" fill="currentColor" stroke="none" font-size="11">e = new ...</text>
  <text x="490" y="168" fill="currentColor" stroke="none" font-size="11">emp is unaffected</text>
</svg>`,
    },
    exercise: {
      prompt: `This <code>swap</code> method does nothing useful: the program prints <code>1 2</code> because the method only swaps its own copies. Change the program so the two values really are swapped, by passing an array and swapping its elements.

Expected output: <code>2 1</code>`,
      starterCode: `public class SwapDemo {

    static void swap(int a, int b) {
        int temp = a;
        a = b;
        b = temp;
    }

    public static void main(String[] args) {
        int x = 1;
        int y = 2;
        swap(x, y);
        System.out.println(x + " " + y);
    }
}`,
      hints: [
        'A method cannot change the caller\'s primitive variables, but it can change the contents of an object or array the caller passed in.',
        'Store both values in an <code>int[]</code> and swap <code>pair[0]</code> with <code>pair[1]</code> inside the method.',
      ],
      solution: `public class SwapDemo {

    static void swap(int[] pair) {
        int temp = pair[0];
        pair[0] = pair[1];
        pair[1] = temp;
    }

    public static void main(String[] args) {
        int[] values = {1, 2};
        swap(values);
        System.out.println(values[0] + " " + values[1]); // 2 1
    }
}`,
    },
    quiz: [
      {
        question: 'How does Java pass arguments to methods?',
        options: ['Primitives by value, objects by reference', 'Always by value', 'Always by reference', 'It depends on the method'],
        answer: 1,
        explanation: 'Java always passes a copy of the value. For an object variable, that value is the reference, so the copy points to the same object.',
      },
      {
        question: 'A method receives a <code>Person p</code> and runs <code>p.name = "X";</code>. Does the caller see the change?',
        options: ['Yes, both references point to the same object', 'No, the method works on a copy of the object', 'Only if p is declared final', 'Only if the method is static'],
        answer: 0,
        explanation: 'The reference was copied, not the object. Changing a field through either reference changes the one shared object.',
      },
      {
        question: 'The same method instead runs <code>p = new Person("Y");</code>. What happens to the caller\'s variable?',
        options: ['It now refers to the new Person', 'It is unchanged and still refers to the original object', 'It becomes null', 'The code does not compile'],
        answer: 1,
        explanation: 'Reassigning the parameter only changes the method\'s local copy of the reference. The caller\'s variable still points to the original object.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Is Java pass-by-value or pass-by-reference?',
        answer: `Pass-by-value, always. When you pass a primitive, the method gets a copy of the number. When you pass an object, the method gets a copy of the reference. Because that copy points to the same object, the method can change the object's fields — which looks like pass-by-reference — but it cannot make the caller's variable refer to a different object, which true pass-by-reference would allow.`,
      },
      {
        question: 'Why can you not write a method that swaps two int variables in Java?',
        answer: `Because the method receives copies of the two values. Swapping the copies has no effect on the variables in the caller, and Java has no way to pass the variables themselves. To get the effect, wrap the values in something the method can modify, such as an array or an object, or return the new values.`,
      },
    ],
  },

  'constructors-and-constructor-overloading': {
    whyItMatters: `A constructor is the one place where you can guarantee that an object starts in a valid state. Knowing when Java supplies a default constructor — and when it silently stops doing so — explains a compile error that puzzles most people the first time they add a constructor with parameters.`,
    exercise: {
      prompt: `Give <code>Point</code> two constructors: one that takes x and y, and a no-argument one that creates the origin by calling the other with <code>this(0, 0)</code>.

Expected output: <code>(0, 0)</code> then <code>(3, 4)</code>`,
      starterCode: `class Point {
    int x;
    int y;

    // TODO: Point(int x, int y)
    // TODO: Point() that reuses the constructor above

    String describe() {
        return "(" + x + ", " + y + ")";
    }
}

public class PointDemo {
    public static void main(String[] args) {
        System.out.println(new Point().describe());
        System.out.println(new Point(3, 4).describe());
    }
}`,
      hints: [
        'Use <code>this.x = x;</code> to assign the parameter to the field with the same name.',
        '<code>this(0, 0);</code> must be the first statement in the no-argument constructor.',
      ],
      solution: `class Point {
    int x;
    int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    Point() {
        this(0, 0);
    }

    String describe() {
        return "(" + x + ", " + y + ")";
    }
}

public class PointDemo {
    public static void main(String[] args) {
        System.out.println(new Point().describe());     // (0, 0)
        System.out.println(new Point(3, 4).describe()); // (3, 4)
    }
}`,
    },
    quiz: [
      {
        question: 'A class declares only <code>Point(int x, int y)</code>. What happens with <code>new Point()</code>?',
        options: ['It creates a Point at 0, 0', 'It does not compile', 'It throws an exception at runtime', 'It calls the two-argument constructor with nulls'],
        answer: 1,
        explanation: 'The compiler adds a default no-argument constructor only when the class declares no constructors at all.',
      },
      {
        question: 'What is the return type of a constructor?',
        options: ['void', 'The class type', 'It has no return type', 'Object'],
        answer: 2,
        explanation: 'A constructor declares no return type, not even void. Adding one turns it into an ordinary method.',
      },
      {
        question: 'Where must a call to <code>this(...)</code> appear inside a constructor?',
        options: ['Anywhere in the body', 'As the first statement', 'As the last statement', 'Inside an if block'],
        answer: 1,
        explanation: 'A call to another constructor of the same class must be the first statement, so the object is initialised before any other code runs.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a default constructor and a no-argument constructor?',
        answer: `A default constructor is the one the compiler generates when a class declares no constructor. It takes no arguments and does nothing beyond calling the superclass constructor. A no-argument constructor is any constructor with an empty parameter list, including one you write yourself. Once you write any constructor, the compiler no longer provides a default one.`,
      },
      {
        question: 'Can a constructor be private? Why would you do that?',
        answer: `Yes. A private constructor prevents other classes from creating instances with <code>new</code>. It is used for the singleton pattern, for classes that hand out instances through static factory methods, and for utility classes that contain only static methods and should never be instantiated.`,
      },
    ],
  },

  'static-keyword': {
    whyItMatters: `<code>static</code> decides whether something belongs to each object or to the class as a whole. Used correctly it gives you shared counters, constants and utility methods. Used carelessly it creates hidden global state that every object can change. It also produces one of the most common compile errors for beginners: "non-static variable cannot be referenced from a static context".`,
    exercise: {
      prompt: `Give every <code>Ticket</code> a unique, increasing id. The class should keep a shared counter, and each new ticket takes the next number.

Expected output: <code>1</code>, <code>2</code>, <code>3</code>, each on its own line.`,
      starterCode: `class Ticket {
    // TODO: a static counter shared by all tickets
    // TODO: an instance field for this ticket's id

    Ticket() {
        // TODO: increase the counter and store its value as this ticket's id
    }
}

public class TicketDemo {
    public static void main(String[] args) {
        System.out.println(new Ticket().id);
        System.out.println(new Ticket().id);
        System.out.println(new Ticket().id);
    }
}`,
      hints: [
        'The counter must be <code>static</code> so there is one shared copy; the id must not be, so each ticket keeps its own.',
        '<code>id = ++counter;</code> increases the counter and stores the new value in one step.',
      ],
      solution: `class Ticket {
    static int counter = 0;
    int id;

    Ticket() {
        id = ++counter;
    }
}

public class TicketDemo {
    public static void main(String[] args) {
        System.out.println(new Ticket().id); // 1
        System.out.println(new Ticket().id); // 2
        System.out.println(new Ticket().id); // 3
    }
}`,
    },
    quiz: [
      {
        question: 'What happens when a static method refers directly to an instance field of its class?',
        options: ['It reads the field of the most recent object', 'It does not compile', 'It reads the default value', 'It throws NullPointerException'],
        answer: 1,
        explanation: 'A static method has no object to work on, so it cannot use instance members without an explicit object reference.',
      },
      {
        question: 'When does a static initializer block run?',
        options: ['Every time an object is created', 'Once, when the class is first loaded', 'When main finishes', 'Only if called explicitly'],
        answer: 1,
        explanation: 'A static block runs a single time during class initialisation, before any object is created.',
      },
      {
        question: 'Given <code>Counter c = null;</code>, what happens with <code>c.printTotal()</code> if <code>printTotal</code> is a static method?',
        options: ['It throws NullPointerException', 'It runs normally', 'It does not compile', 'It returns null'],
        answer: 1,
        explanation: 'A static method is resolved from the declared type of the variable, not from the object, so no object is needed. It is still clearer to write Counter.printTotal().',
      },
    ],
    interviewQuestions: [
      {
        question: 'Can a static method be overridden?',
        answer: `No. A subclass can declare a static method with the same signature, but that hides the parent's method rather than overriding it. Which one runs is decided at compile time from the declared type of the reference, not from the actual object, so there is no runtime polymorphism for static methods.`,
      },
      {
        question: 'When should a method or field be static?',
        answer: `When it does not depend on the state of any particular object. Typical cases are constants (<code>static final</code>), utility methods that work only on their arguments, such as <code>Math.max</code>, and factory methods. Mutable static fields should be rare, because they are shared by every object and every thread.`,
      },
    ],
  },

  'this-keyword': {
    whyItMatters: `Constructors and setters usually name their parameters after the fields they set, and without <code>this</code> the assignment quietly does nothing: the parameter is assigned to itself and the field keeps its default. That bug compiles cleanly and shows up later as a null or a zero, which makes it worth understanding exactly what <code>this</code> refers to.`,
    exercise: {
      prompt: `This program prints <code>null</code> because the constructor assigns the parameter to itself instead of to the field. Fix the constructor so it prints <code>Asha</code>.`,
      starterCode: `class Employee {
    String name;

    Employee(String name) {
        name = name;
    }
}

public class EmployeeDemo {
    public static void main(String[] args) {
        Employee employee = new Employee("Asha");
        System.out.println(employee.name);
    }
}`,
      hints: [
        'Inside the constructor, the name <code>name</code> refers to the parameter, which hides the field.',
        '<code>this.name</code> always refers to the field of the current object.',
      ],
      solution: `class Employee {
    String name;

    Employee(String name) {
        this.name = name;
    }
}

public class EmployeeDemo {
    public static void main(String[] args) {
        Employee employee = new Employee("Asha");
        System.out.println(employee.name); // Asha
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>this</code> refer to inside an instance method?',
        options: ['The class itself', 'The object the method was called on', 'The superclass object', 'The most recently created object'],
        answer: 1,
        explanation: 'this is a reference to the current object: the one whose method or constructor is running.',
      },
      {
        question: 'What happens if you use <code>this</code> inside a static method?',
        options: ['It refers to the class', 'It is null', 'It does not compile', 'It refers to the first object created'],
        answer: 2,
        explanation: 'A static method is not called on an object, so there is no current object for this to refer to.',
      },
      {
        question: 'What does a method that ends with <code>return this;</code> make possible?',
        options: ['Recursion', 'Method chaining, as in a.setX(1).setY(2)', 'Overloading', 'Garbage collection'],
        answer: 1,
        explanation: 'Returning the current object lets the caller invoke another method on the result immediately, which is how builder-style APIs work.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the uses of the this keyword?',
        answer: `To refer to a field when a parameter or local variable has the same name. To call another constructor of the same class with <code>this(...)</code>. To pass the current object as an argument to another method. And to return the current object from a method, which enables method chaining.`,
      },
      {
        question: 'What is the difference between this and super?',
        answer: `<code>this</code> refers to the current object and gives access to its own members and constructors. <code>super</code> refers to the superclass part of the current object: it calls a superclass constructor with <code>super(...)</code> and reaches superclass methods or fields that the subclass has overridden or hidden. Neither can be used in a static context.`,
      },
    ],
  },

  'java-inheritance': {
    whyItMatters: `Inheritance lets one class build on another instead of copying it, and it is the foundation that polymorphism stands on. It is also easy to overuse: a subclass is tied to every detail of its parent. Knowing exactly what is and is not inherited — and that Java allows only one superclass — helps you decide when "is a" really applies.`,
    exercise: {
      prompt: `Create a <code>SavingsAccount</code> that extends <code>Account</code> and adds a method <code>addInterest(int percent)</code>, which increases the balance by that percentage. The subclass should reuse the inherited <code>balance</code> field.

Expected output: <code>1050</code>`,
      starterCode: `class Account {
    protected int balance;

    Account(int balance) {
        this.balance = balance;
    }

    int getBalance() {
        return balance;
    }
}

// TODO: class SavingsAccount extends Account, with a constructor and addInterest(int percent)

public class AccountDemo {
    public static void main(String[] args) {
        SavingsAccount savings = new SavingsAccount(1000);
        savings.addInterest(5);
        System.out.println(savings.getBalance());
    }
}`,
      hints: [
        'The subclass constructor must pass the opening balance up with <code>super(balance);</code>.',
        'Because <code>balance</code> is protected, the subclass can update it directly: <code>balance += balance * percent / 100;</code>.',
      ],
      solution: `class Account {
    protected int balance;

    Account(int balance) {
        this.balance = balance;
    }

    int getBalance() {
        return balance;
    }
}

class SavingsAccount extends Account {

    SavingsAccount(int balance) {
        super(balance);
    }

    void addInterest(int percent) {
        balance += balance * percent / 100;
    }
}

public class AccountDemo {
    public static void main(String[] args) {
        SavingsAccount savings = new SavingsAccount(1000);
        savings.addInterest(5);
        System.out.println(savings.getBalance()); // 1050
    }
}`,
    },
    quiz: [
      {
        question: 'How many classes can a Java class extend directly?',
        options: ['One', 'Two', 'Any number', 'None'],
        answer: 0,
        explanation: 'Java supports single inheritance of classes. A class can implement many interfaces, but extend only one class.',
      },
      {
        question: 'Can a subclass access a private field of its superclass directly?',
        options: ['Yes, always', 'No; it needs a getter, setter or other accessible method', 'Only inside its constructor', 'Only if both are in the same file'],
        answer: 1,
        explanation: 'Private members are visible only inside the class that declares them. The subclass object still contains the field but cannot name it.',
      },
      {
        question: 'Are constructors inherited by a subclass?',
        options: ['Yes, all of them', 'Only the no-argument constructor', 'No, but the subclass can call them with super(...)', 'Only public ones'],
        answer: 2,
        explanation: 'Constructors are not members and are not inherited. Each class declares its own, and a subclass constructor invokes a superclass constructor.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Which types of inheritance does Java support?',
        answer: `Single inheritance (one class extends another), multilevel inheritance (A extends B, B extends C), and hierarchical inheritance (several classes extend the same parent). Multiple inheritance of classes is not allowed. A class can, however, implement several interfaces, which gives multiple inheritance of type.`,
      },
      {
        question: 'What is the difference between an IS-A and a HAS-A relationship?',
        answer: `IS-A is inheritance: a SavingsAccount is an Account, expressed with <code>extends</code> or <code>implements</code>. HAS-A is composition or aggregation: a Car has an Engine, expressed as a field. If you cannot honestly say "X is a Y" in every situation, use a field instead of inheritance.`,
      },
    ],
  },

  'aggregation-in-java': {
    whyItMatters: `Most relationships between classes are "has a", not "is a": an order has items, a student has an address. Modelling them as fields rather than inheritance keeps classes independent and reusable. Whether the contained object can outlive its owner is the difference between aggregation and composition, and it is a common design question in interviews.`,
    exercise: {
      prompt: `Model a HAS-A relationship: a <code>Student</code> has an <code>Address</code>. The address is created separately and passed to the student.

Expected output: <code>Asha lives in Gurugram</code>`,
      starterCode: `class Address {
    String city;

    Address(String city) {
        this.city = city;
    }
}

class Student {
    String name;
    // TODO: a field that refers to an Address

    // TODO: a constructor taking a name and an Address

    // TODO: describe() returns "<name> lives in <city>"
}

public class StudentDemo {
    public static void main(String[] args) {
        Address address = new Address("Gurugram");
        Student student = new Student("Asha", address);
        System.out.println(student.describe());
    }
}`,
      hints: [
        'A HAS-A relationship is just a field whose type is another class.',
        'Reach the city through the field: <code>address.city</code>.',
      ],
      solution: `class Address {
    String city;

    Address(String city) {
        this.city = city;
    }
}

class Student {
    String name;
    Address address;

    Student(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    String describe() {
        return name + " lives in " + address.city;
    }
}

public class StudentDemo {
    public static void main(String[] args) {
        Address address = new Address("Gurugram");
        Student student = new Student("Asha", address);
        System.out.println(student.describe());
    }
}`,
    },
    quiz: [
      {
        question: 'A Department refers to Employee objects that were created elsewhere and continue to exist if the department is removed. What is this?',
        options: ['Inheritance', 'Aggregation', 'Composition', 'Polymorphism'],
        answer: 1,
        explanation: 'In aggregation the contained objects have an independent lifetime; the container only refers to them.',
      },
      {
        question: 'A House creates its Room objects itself, and they have no meaning without the house. What is this?',
        options: ['Aggregation', 'Composition', 'Inheritance', 'Association with no ownership'],
        answer: 1,
        explanation: 'Composition is the stronger form: the owner creates and controls the parts, and they do not outlive it.',
      },
      {
        question: 'Which phrase describes the relationship that aggregation and composition both model?',
        options: ['IS-A', 'HAS-A', 'USES-A', 'EXTENDS-A'],
        answer: 1,
        explanation: 'Both are HAS-A relationships, implemented with a field. IS-A is inheritance.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between aggregation and composition?',
        answer: `Both mean one object holds a reference to another. In aggregation the part can exist on its own: employees exist whether or not a department does, so the part is usually passed in from outside. In composition the part belongs to the whole and is created and destroyed with it: an order line has no meaning without its order, so the owner creates it internally.`,
      },
      {
        question: 'Why is composition often preferred over inheritance?',
        answer: `Inheritance ties a subclass to the implementation of its parent, so a change in the parent can break the child, and the relationship is fixed at compile time. Composition builds behaviour from independent objects that communicate through their public methods: parts can be swapped, tested separately and reused in classes that have nothing else in common.`,
      },
    ],
  },

  'super-keyword': {
    whyItMatters: `A subclass object contains a superclass part that must be constructed first, and <code>super</code> is how you reach it. It explains the compile error you get when a parent has no no-argument constructor, and it lets an overriding method add to the parent's behaviour instead of replacing it completely.`,
    exercise: {
      prompt: `Complete <code>Manager</code> so that its constructor passes the name to <code>Employee</code>, and its <code>describe()</code> reuses the parent's version and adds <code> (manager)</code>.

Expected output: <code>Ravi (manager)</code>`,
      starterCode: `class Employee {
    private final String name;

    Employee(String name) {
        this.name = name;
    }

    String describe() {
        return name;
    }
}

class Manager extends Employee {

    Manager(String name) {
        // TODO: pass the name to the Employee constructor
    }

    // TODO: override describe() to return the parent's text plus " (manager)"
}

public class ManagerDemo {
    public static void main(String[] args) {
        System.out.println(new Manager("Ravi").describe());
    }
}`,
      hints: [
        '<code>super(name);</code> calls the superclass constructor and must be the first statement.',
        '<code>name</code> is private in Employee, so use <code>super.describe()</code> to get it.',
      ],
      solution: `class Employee {
    private final String name;

    Employee(String name) {
        this.name = name;
    }

    String describe() {
        return name;
    }
}

class Manager extends Employee {

    Manager(String name) {
        super(name);
    }

    @Override
    String describe() {
        return super.describe() + " (manager)";
    }
}

public class ManagerDemo {
    public static void main(String[] args) {
        System.out.println(new Manager("Ravi").describe()); // Ravi (manager)
    }
}`,
    },
    quiz: [
      {
        question: 'A subclass constructor does not call <code>super(...)</code> or <code>this(...)</code>. What does the compiler do?',
        options: ['Nothing', 'Inserts a call to super() with no arguments', 'Reports an error in every case', 'Calls the subclass constructor twice'],
        answer: 1,
        explanation: 'The compiler adds super() as the first statement, so the superclass part is always constructed first.',
      },
      {
        question: '<code>Parent</code> declares only <code>Parent(int x)</code>. <code>Child extends Parent</code> has the constructor <code>Child() { }</code>. What happens?',
        options: ['It compiles and x is 0', 'It does not compile', 'It throws at runtime', 'It calls Parent(0) automatically'],
        answer: 1,
        explanation: 'The compiler inserts super(), but Parent has no no-argument constructor. Child must call super(someValue) explicitly.',
      },
      {
        question: 'Can one constructor contain both <code>this(...)</code> and <code>super(...)</code>?',
        options: ['Yes, in any order', 'Yes, if super comes first', 'No, each must be the first statement, so only one is possible', 'Only in abstract classes'],
        answer: 2,
        explanation: 'Both calls have to be the first statement of the constructor, so a constructor can use one or the other, not both.',
      },
    ],
    interviewQuestions: [
      {
        question: 'In what order do constructors run when you create a subclass object?',
        answer: `From the top of the hierarchy downwards. The subclass constructor is entered first, but its first action is to call the superclass constructor, which in turn calls its own parent, up to <code>Object</code>. Each constructor body then finishes in order from the topmost class down to the subclass. So the parent part of the object is always fully constructed before the child's constructor body runs.`,
      },
      {
        question: 'What can super be used for?',
        answer: `<code>super(...)</code> calls a superclass constructor. <code>super.method()</code> calls the superclass version of a method the subclass has overridden. <code>super.field</code> reads a superclass field that the subclass has hidden with a field of the same name. It cannot be used in a static context, and it cannot be chained as <code>super.super</code>.`,
      },
    ],
  },
}
