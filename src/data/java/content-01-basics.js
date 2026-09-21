// Java Basics module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content01Basics = {
  'history-and-features-of-java': {
    title: 'History and Features of Java',
    intro: `Java was created by James Gosling and his team at Sun Microsystems, and it was released publicly in 1995. It started as a project called "Oak", aimed at programming consumer electronics, before being rebuilt for the internet age and renamed Java. Sun Microsystems was later acquired by Oracle Corporation in 2010, and Oracle has maintained Java ever since.

Java became popular because of one core promise: "Write Once, Run Anywhere" (WORA). Unlike C or C++, which compile directly to machine code for a specific operating system, Java compiles to an intermediate form called bytecode. That bytecode runs on the Java Virtual Machine (JVM), and because a JVM exists for Windows, Linux, macOS, and many other platforms, the same compiled Java program runs unmodified everywhere a JVM is installed.`,
    sections: [
      {
        heading: 'Key Features of Java',
        body: `Java's design goals shaped a specific set of features that still matter today, even in modern versions of the language.`,
        list: [
          '<strong>Simple</strong> — Java removed complex C++ features like explicit pointers and multiple inheritance of classes, making it easier to learn and safer to write.',
          '<strong>Object-Oriented</strong> — Almost everything in Java is modeled as an object with state and behavior, which supports large, maintainable codebases.',
          '<strong>Platform Independent</strong> — Java source code compiles to bytecode, which any JVM can execute regardless of the underlying operating system or hardware.',
          '<strong>Secure</strong> — No explicit pointers, automatic memory management, and a security manager reduce common vulnerabilities like buffer overflows.',
          '<strong>Robust</strong> — Strong compile-time type checking, automatic garbage collection, and mandatory exception handling reduce runtime crashes.',
          '<strong>Multithreaded</strong> — Java has built-in support for concurrent programming through the Thread class and related APIs.',
          '<strong>High Performance</strong> — The Just-In-Time (JIT) compiler converts frequently used bytecode into native machine code at runtime, closing much of the performance gap with compiled languages.',
          '<strong>Distributed</strong> — Java has strong networking libraries and was designed with internet-based applications in mind.',
          '<strong>Dynamic</strong> — Java can load classes at runtime and adapt to a changing environment, which supports plugins and modular applications.',
        ],
      },
      {
        heading: 'Why This History Matters',
        body: `Understanding why Java was designed this way explains many things you will see later: why Java has no pointer arithmetic, why every class ultimately extends Object, why exceptions are checked at compile time, and why the JVM is central to everything Java does. Java was built for reliability in large teams and long-lived systems, not just for quick scripts — and that philosophy still drives its standard library and language evolution today.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal Java program showing the platform-independent structure',
        code: `public class HelloJava {
    public static void main(String[] args) {
        System.out.println("Java: Write Once, Run Anywhere");
    }
}`,
        output: 'Java: Write Once, Run Anywhere',
      },
    ],
    commonMistakes: [
      'Assuming Java is "slow" because it is not compiled directly to machine code — the JIT compiler makes long-running Java programs highly competitive in performance.',
      'Confusing Java (the language and platform) with JavaScript (an unrelated scripting language) just because the names look similar.',
      'Thinking "Write Once, Run Anywhere" means zero configuration — you still need a compatible JVM version installed on the target machine.',
    ],
    keyPoints: [
      'Java was created by James Gosling at Sun Microsystems and released in 1995; Oracle now maintains it.',
      'Java code compiles to bytecode, which runs on the JVM — this is the basis of platform independence.',
      'Core features: simple, object-oriented, platform independent, secure, robust, multithreaded, high performance, distributed, and dynamic.',
    ],
  },

  'jvm-jdk-and-jre': {
    title: 'JVM, JDK, and JRE',
    intro: `JVM, JDK, and JRE are three terms every Java developer must be able to explain clearly, because they describe three different layers of the Java platform. Confusing them is one of the most common mistakes among beginners.`,
    sections: [
      {
        heading: 'JVM — Java Virtual Machine',
        body: `The JVM is an abstract machine that provides a runtime environment to execute Java bytecode (.class files). It is not a physical machine; it is a specification implemented differently on each operating system. The JVM is responsible for loading class files, verifying bytecode for safety, executing instructions, managing memory through automatic garbage collection, and providing runtime data areas like the heap and stack. Because every platform has its own JVM implementation that understands the same bytecode format, a compiled Java program becomes portable.`,
      },
      {
        heading: 'JRE — Java Runtime Environment',
        body: `The JRE is the JVM plus the core class libraries (java.lang, java.util, java.io, and so on) needed to run Java applications. If you only need to run a Java program — not develop one — the JRE is technically sufficient. Think of the JRE as "JVM + libraries needed at runtime."`,
      },
      {
        heading: 'JDK — Java Development Kit',
        body: `The JDK is the full development kit: it includes the JRE plus development tools such as the compiler (javac), the debugger, javadoc for documentation generation, and other utilities like jar and jshell. To write and compile Java code, you need the JDK, not just the JRE.`,
      },
      {
        heading: 'How They Relate',
        body: `JDK contains JRE, and JRE contains JVM. This is a strict containment relationship: JDK ⊇ JRE ⊇ JVM. When you install "Java" for development today, you install a JDK (for example, JDK 21), and that single installation gives you the compiler, the runtime, and the JVM together.`,
        list: [
          '<strong>JVM</strong>: Executes bytecode. Platform-specific implementation, platform-independent bytecode format.',
          '<strong>JRE</strong>: JVM + standard class libraries. Enough to run compiled Java programs.',
          '<strong>JDK</strong>: JRE + compiler and developer tools. Needed to write and build Java programs.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Compiling and running a program shows the JDK and JVM working together',
        code: `// Step 1: Compile with the JDK's compiler (javac)
// Terminal: javac HelloJava.java
// This produces HelloJava.class (bytecode)

// Step 2: Run with the JVM (via the "java" launcher, included in JRE/JDK)
// Terminal: java HelloJava

public class HelloJava {
    public static void main(String[] args) {
        System.out.println("Compiled by JDK, executed by JVM");
    }
}`,
        output: 'Compiled by JDK, executed by JVM',
      },
    ],
    commonMistakes: [
      'Installing only a JRE and then being unable to compile code with javac — the JRE has no compiler.',
      'Saying "JVM and JDK are the same thing" in interviews — the JDK is a full toolkit; the JVM is just the execution engine inside it.',
      'Forgetting that the JVM specification allows multiple different implementations (HotSpot, OpenJ9, GraalVM) — "the JVM" is not one single piece of software.',
    ],
    keyPoints: [
      'JVM executes bytecode and provides platform independence.',
      'JRE = JVM + standard libraries, enough to run programs.',
      'JDK = JRE + compiler and development tools, needed to build programs.',
      'Containment relationship: JDK contains JRE, JRE contains JVM.',
    ],
  },

  'java-program-structure-and-first-program': {
    title: 'Java Program Structure and First Program',
    intro: `Every Java application starts from a well-defined structure. Understanding this structure precisely — not just copying it — is what lets you read any Java file confidently, including ones with multiple classes, packages, and imports.`,
    sections: [
      {
        heading: 'Anatomy of a Java File',
        body: `A typical Java source file follows this order: an optional package declaration, optional import statements, and one or more class (or interface/enum/record) declarations. Only one public class is allowed per file, and if a public class exists, the file name must exactly match that class's name, including capitalization.`,
        list: [
          '<code>package</code> declaration (optional, must be the first line if present)',
          '<code>import</code> statements (optional, bring in classes from other packages)',
          'Class declaration(s) — exactly one may be <code>public</code>',
        ],
      },
      {
        heading: 'The main Method',
        body: `Execution begins at the main method, and the JVM looks for this exact signature: <code>public static void main(String[] args)</code>. Each keyword has a specific reason for being there: <code>public</code> so the JVM (outside the class) can call it, <code>static</code> so it can be invoked without creating an object first, <code>void</code> because it returns nothing to the operating system, and <code>String[] args</code> to receive command-line arguments.`,
      },
      {
        heading: 'Compilation and Execution Flow',
        body: `Java source code (.java) is compiled by javac into bytecode (.class). The JVM then loads that class, locates the main method, and begins executing instructions line by line, following normal control flow (sequential execution, conditionals, loops, and method calls).`,
      },
    ],
    examples: [
      {
        caption: 'A complete first program with package and structure explained',
        code: `package com.webnest.basics; // optional, groups related classes

public class FirstProgram {          // file must be named FirstProgram.java

    public static void main(String[] args) {
        System.out.println("Hello, Webnest learners!");
        greet("Java");
    }

    static void greet(String language) {
        System.out.println("Welcome to " + language + " programming.");
    }
}`,
        output: `Hello, Webnest learners!
Welcome to Java programming.`,
      },
    ],
    commonMistakes: [
      'Naming the file differently from the public class name (e.g. saving "Main.java" for a public class "FirstProgram") — this fails to compile.',
      'Misspelling the main method signature, such as using "String args[]" incorrectly or forgetting "static" — the JVM will report "no main method found."',
      'Placing the package statement anywhere other than the very first line of code.',
    ],
    keyPoints: [
      'Order in a file: package, then imports, then class declarations.',
      'Only one public class per .java file, and the filename must match it.',
      'The JVM always starts execution from public static void main(String[] args).',
    ],
  },

  'java-variables': {
    title: 'Java Variables',
    intro: `A variable is a named memory location that holds a value which can change during program execution. In Java, every variable must be declared with a type before it is used, because Java is a statically and strongly typed language.`,
    sections: [
      {
        heading: 'Types of Variables in Java',
        body: `Java classifies variables based on where they are declared and how long they live.`,
        list: [
          '<strong>Local variables</strong> — declared inside a method, constructor, or block. They exist only during that call and must be initialized before use; Java gives them no default value.',
          '<strong>Instance variables</strong> — declared inside a class but outside any method, without the <code>static</code> keyword. Each object gets its own copy, and they receive default values (0, false, null) if not explicitly initialized.',
          '<strong>Static (class) variables</strong> — declared with the <code>static</code> keyword. They belong to the class itself, are shared by all instances, and are initialized once when the class is loaded.',
        ],
      },
      {
        heading: 'Declaration and Initialization',
        body: `Declaration reserves a name and type (<code>int age;</code>). Initialization assigns a value (<code>age = 25;</code>). You can combine both in one statement: <code>int age = 25;</code>. Variable names in Java must start with a letter, underscore, or dollar sign, cannot be a reserved keyword, and are case-sensitive.`,
      },
    ],
    examples: [
      {
        caption: 'Local, instance, and static variables together',
        code: `public class VariableDemo {

    int instanceCount;              // instance variable, default value 0
    static int totalObjects = 0;    // static variable, shared across all objects

    VariableDemo() {
        instanceCount = 1;
        totalObjects++;
    }

    void showLocalVariable() {
        int localValue = 10;        // local variable, must be initialized before use
        System.out.println("Local value: " + localValue);
    }

    public static void main(String[] args) {
        VariableDemo obj1 = new VariableDemo();
        VariableDemo obj2 = new VariableDemo();
        obj1.showLocalVariable();
        System.out.println("Total objects created: " + VariableDemo.totalObjects);
    }
}`,
        output: `Local value: 10
Total objects created: 2`,
      },
    ],
    commonMistakes: [
      'Using a local variable before assigning it a value — this is a compile-time error in Java, unlike some other languages.',
      'Expecting instance variables to be shared across objects — each object has its own independent copy unless the variable is static.',
      'Shadowing an instance variable with a local variable of the same name and forgetting to use "this.fieldName" to refer to the instance version.',
    ],
    keyPoints: [
      'Three kinds of variables: local, instance, and static (class) variables.',
      'Local variables have no default value and must be initialized before use.',
      'Instance variables belong to each object; static variables are shared across all objects of the class.',
    ],
  },

  'java-data-types': {
    title: 'Java Data Types',
    intro: `Java is a strongly typed language, meaning every variable must have a declared data type, and that type determines what values it can hold and what operations are valid on it. Java data types fall into two broad categories: primitive types and reference (non-primitive) types.`,
    sections: [
      {
        heading: 'Primitive Data Types',
        body: `Java has exactly eight primitive types, and each has a fixed size regardless of the platform — this is another piece of Java's platform-independence guarantee.`,
        list: [
          '<code>byte</code> — 8-bit signed integer, range -128 to 127.',
          '<code>short</code> — 16-bit signed integer, range -32,768 to 32,767.',
          '<code>int</code> — 32-bit signed integer, the default choice for whole numbers.',
          '<code>long</code> — 64-bit signed integer, used for very large values; literals need an "L" suffix (e.g. 100000000000L).',
          '<code>float</code> — 32-bit floating point, needs an "f" suffix (e.g. 3.14f); has limited precision.',
          '<code>double</code> — 64-bit floating point, the default choice for decimal numbers.',
          '<code>char</code> — 16-bit Unicode character, holds a single character in single quotes (e.g. \'A\').',
          '<code>boolean</code> — holds only true or false; size is JVM-dependent and not precisely defined.',
        ],
      },
      {
        heading: 'Reference (Non-Primitive) Data Types',
        body: `Reference types include classes, interfaces, arrays, and enums. Unlike primitives, a reference variable does not hold the actual data — it holds a reference (memory address) to an object stored on the heap. Examples include String, arrays like int[], and any custom class you define. Reference variables can be null, meaning they point to no object at all, whereas primitives can never be null.`,
      },
      {
        heading: 'Default Values',
        body: `When declared as instance or static variables (not local variables), primitives get default values automatically: numeric types default to 0 (or 0.0), boolean defaults to false, and char defaults to the null character. All reference types default to null.`,
      },
    ],
    examples: [
      {
        caption: 'Declaring and printing every primitive type',
        code: `public class DataTypesDemo {
    public static void main(String[] args) {
        byte age = 25;
        short year = 2026;
        int population = 1_400_000_000;
        long distance = 9_460_730_472_580_800L;
        float price = 19.99f;
        double pi = 3.14159265358979;
        char grade = 'A';
        boolean isJavaFun = true;

        System.out.println(age + " " + year + " " + population);
        System.out.println(distance + " " + price + " " + pi);
        System.out.println(grade + " " + isJavaFun);
    }
}`,
        output: `25 2026 1400000000
9460730472580800 19.99 3.14159265358979
A true`,
      },
    ],
    commonMistakes: [
      'Forgetting the "L" suffix on large long literals, causing a compile error because the literal is treated as an int by default and overflows.',
      'Forgetting the "f" suffix on float literals — Java treats decimal literals as double by default.',
      'Assuming boolean has a specific bit size in the JVM spec — it is intentionally left to each implementation.',
      'Confusing char (single quotes, one character) with String (double quotes, a sequence of characters).',
    ],
    keyPoints: [
      'Java has 8 primitive types: byte, short, int, long, float, double, char, boolean.',
      'Primitive sizes are fixed across all platforms — part of Java\'s portability guarantee.',
      'Reference types (classes, arrays, interfaces) store a reference to heap-allocated data and can be null.',
      'Uninitialized instance/static primitives get default values; local variables do not.',
    ],
  },

  'type-casting-and-type-promotion': {
    title: 'Type Casting and Type Promotion',
    intro: `Type casting is the process of converting a value from one data type to another. Java supports two forms of casting for primitive types: widening (implicit) and narrowing (explicit), plus type promotion rules that apply automatically during expression evaluation.`,
    sections: [
      {
        heading: 'Widening Casting (Implicit)',
        body: `Widening converts a smaller type to a larger type automatically, because no data can be lost. The compiler performs this conversion without any special syntax. The widening order is: byte → short → int → long → float → double. (char can also widen to int, long, float, or double.)`,
      },
      {
        heading: 'Narrowing Casting (Explicit)',
        body: `Narrowing converts a larger type to a smaller type, which can lose data or precision, so Java requires you to write an explicit cast using parentheses: <code>(targetType) value</code>. Without the explicit cast, the code will not compile, because the compiler wants you to acknowledge the risk of data loss.`,
      },
      {
        heading: 'Type Promotion in Expressions',
        body: `When performing arithmetic, Java automatically promotes byte, short, and char operands to int before the operation. If either operand is long, the whole expression is promoted to long; if either is float, it is promoted to float; if either is double, the whole expression becomes double. This is why <code>byte + byte</code> actually produces an int result.`,
      },
    ],
    examples: [
      {
        caption: 'Widening happens automatically; narrowing needs an explicit cast',
        code: `public class CastingDemo {
    public static void main(String[] args) {
        int intValue = 100;
        long longValue = intValue;      // widening, automatic
        double doubleValue = longValue; // widening, automatic
        System.out.println(longValue + " " + doubleValue);

        double price = 19.99;
        int roundedDown = (int) price;  // narrowing, explicit cast required
        System.out.println(roundedDown);

        byte b1 = 10, b2 = 20;
        int sum = b1 + b2;              // type promotion: byte + byte -> int
        System.out.println(sum);
    }
}`,
        output: `100 100.0
19
30`,
      },
    ],
    commonMistakes: [
      'Trying to assign a double to an int without an explicit cast and being surprised by a compile error.',
      'Casting a large int to byte and getting an unexpected negative or wrapped value because the extra bits were silently discarded.',
      'Writing "byte result = b1 + b2;" and expecting it to compile — the result of byte + byte is promoted to int, so a cast back to byte is required.',
    ],
    keyPoints: [
      'Widening (small → large type) is automatic and lossless.',
      'Narrowing (large → small type) requires an explicit cast and can lose data.',
      'byte, short, and char are automatically promoted to int in arithmetic expressions.',
    ],
  },

  'java-operators': {
    title: 'Java Operators',
    intro: `Operators are special symbols that perform operations on one, two, or three operands and return a result. Java groups operators by the kind of work they do, and understanding each group's precedence and behavior is essential for writing correct expressions.`,
    sections: [
      {
        heading: 'Arithmetic Operators',
        body: `<code>+ - * / %</code> perform addition, subtraction, multiplication, division, and modulus (remainder). Integer division truncates toward zero (7 / 2 is 3, not 3.5), while division involving at least one floating-point operand produces a decimal result.`,
      },
      {
        heading: 'Relational and Logical Operators',
        body: `Relational operators (<code>== != > < >= <=</code>) compare two values and produce a boolean. Logical operators (<code>&& || !</code>) combine boolean expressions. <code>&&</code> and <code>||</code> are short-circuiting: the right-hand side is not evaluated if the result is already determined by the left-hand side, which is important when the right side has side effects.`,
      },
      {
        heading: 'Assignment and Compound Assignment',
        body: `<code>=</code> assigns a value. Compound assignment operators like <code>+= -= *= /= %=</code> combine an operation with assignment, and they also perform an implicit narrowing cast — <code>byte b = 10; b += 5;</code> compiles even though <code>b = b + 5;</code> would not.`,
      },
      {
        heading: 'Increment, Decrement, Ternary, and Bitwise Operators',
        body: `<code>++</code> and <code>--</code> increase or decrease a value by 1, with prefix (<code>++x</code>) applying before use and postfix (<code>x++</code>) applying after use in an expression. The ternary operator <code>condition ? valueIfTrue : valueIfFalse</code> is a compact conditional expression. Bitwise operators (<code>& | ^ ~ << >> >>></code>) operate directly on the binary representation of integer types.`,
      },
    ],
    examples: [
      {
        caption: 'Arithmetic, short-circuit logic, and prefix vs postfix in one program',
        code: `public class OperatorsDemo {
    public static void main(String[] args) {
        System.out.println(7 / 2);       // integer division
        System.out.println(7.0 / 2);     // floating-point division
        System.out.println(7 % 2);       // modulus

        int x = 5;
        boolean result = (x > 0) || (10 / 0 == 0); // short-circuit, avoids division by zero
        System.out.println(result);

        int a = 5;
        System.out.println(a++);  // prints 5, then a becomes 6
        System.out.println(++a);  // a becomes 7, then prints 7

        int score = 85;
        String grade = score >= 90 ? "A" : score >= 75 ? "B" : "C";
        System.out.println(grade);
    }
}`,
        output: `3
3.5
1
true
5
7
B`,
      },
    ],
    commonMistakes: [
      'Using "=" (assignment) when "==" (comparison) was intended inside an if condition.',
      'Expecting "7 / 2" to give 3.5 in Java — integer division always truncates when both operands are integers.',
      'Confusing prefix (++a) and postfix (a++) behavior inside larger expressions, leading to off-by-one bugs.',
      'Relying on evaluation order of "&" and "|" (non-short-circuit) when short-circuit behavior ("&&", "||") was actually needed to avoid a side effect or exception.',
    ],
    keyPoints: [
      'Integer division truncates; involve a double/float operand to get decimal results.',
      '&& and || short-circuit; & and | always evaluate both sides.',
      'Compound assignment operators (+=, -=, etc.) include an implicit narrowing cast.',
      'The ternary operator is a compact substitute for a simple if-else that returns a value.',
    ],
  },

  'java-keywords': {
    title: 'Java Keywords',
    intro: `Keywords are reserved words in Java that have a predefined meaning to the compiler and cannot be used as identifiers (variable names, method names, or class names). Java currently defines around 50 reserved keywords, plus a few reserved literals and contextual words.`,
    sections: [
      {
        heading: 'Categories of Keywords',
        body: `Grouping keywords by purpose makes them far easier to remember than treating them as one flat list.`,
        list: [
          '<strong>Data type keywords</strong>: byte, short, int, long, float, double, char, boolean, void.',
          '<strong>Access modifiers</strong>: public, private, protected.',
          '<strong>Class/interface related</strong>: class, interface, extends, implements, abstract, final, static, package, import, new, this, super, instanceof.',
          '<strong>Control flow</strong>: if, else, switch, case, default, for, while, do, break, continue, return.',
          '<strong>Exception handling</strong>: try, catch, finally, throw, throws.',
          '<strong>Other</strong>: synchronized, volatile, transient, native, strictfp, assert, enum, const (reserved but unused), goto (reserved but unused).',
        ],
      },
      {
        heading: 'Reserved Literals and Contextual Keywords',
        body: `<code>true</code>, <code>false</code>, and <code>null</code> are technically reserved literals, not keywords, but they behave the same way: you cannot use them as identifiers. Newer Java versions also introduced "contextual keywords" like <code>var</code>, <code>record</code>, <code>sealed</code>, and <code>yield</code>, which are only treated specially in certain positions — you can still use words like "record" as a variable name in older code, unlike true keywords.`,
      },
    ],
    examples: [
      {
        caption: 'Keywords in action across a small class',
        code: `public abstract class Vehicle {
    protected final String name;

    public Vehicle(String name) {
        this.name = name;
    }

    public abstract void move();
}

class Car extends Vehicle {
    public Car(String name) {
        super(name);
    }

    @Override
    public void move() {
        if (this.name != null) {
            System.out.println(this.name + " is moving");
        }
    }
}`,
        output: '(Compiles cleanly — demonstrates abstract, extends, final, protected, super, this, @Override together)',
      },
    ],
    commonMistakes: [
      'Trying to name a variable "class", "new", or "static" — the compiler will reject any reserved keyword used as an identifier.',
      'Treating "true", "false", and "null" as ordinary identifiers instead of reserved literals.',
      'Assuming "var" always means "any type, checked at runtime" — var is compile-time type inference, not a dynamic type.',
    ],
    keyPoints: [
      'Keywords are reserved by the compiler and can never be used as variable, method, or class names.',
      'Grouping keywords by purpose (types, modifiers, control flow, exceptions) makes them easier to learn.',
      'true, false, and null are reserved literals; var, record, and sealed are newer contextual keywords.',
    ],
  },

  'java-comments': {
    title: 'Java Comments',
    intro: `Comments are notes in source code that the compiler ignores. They exist purely to communicate intent, context, and reasoning to human readers — including your future self. Java supports three comment styles.`,
    sections: [
      {
        heading: 'Single-line, Multi-line, and Javadoc Comments',
        body: `A single-line comment starts with <code>//</code> and continues to the end of the line. A multi-line (block) comment is wrapped between <code>/*</code> and <code>*/</code> and can span multiple lines. A Javadoc comment starts with <code>/**</code> and is used to generate HTML API documentation with the <code>javadoc</code> tool; it supports tags like <code>@param</code>, <code>@return</code>, and <code>@throws</code>.`,
      },
      {
        heading: 'What Makes a Good Comment',
        body: `Professional Java code favors comments that explain "why," not "what" — good naming already communicates what code does. A comment should capture a non-obvious constraint, a workaround for a specific bug, or a business rule that isn't visible from the code itself. Comments that just restate the code in English go stale and mislead readers when the code changes but the comment doesn't.`,
      },
    ],
    examples: [
      {
        caption: 'All three comment styles, including a Javadoc block',
        code: `public class CommentsDemo {

    // Discount is capped at 50% per company policy, not a technical limit.
    static final double MAX_DISCOUNT = 0.50;

    /*
     * This method is intentionally simple: pricing rules are being
     * redesigned next quarter, so no extra abstraction is added yet.
     */
    static double applyDiscount(double price, double discount) {
        double capped = Math.min(discount, MAX_DISCOUNT);
        return price - (price * capped);
    }

    /**
     * Prints the final price after applying a capped discount.
     *
     * @param price original price before discount
     * @param discount requested discount as a fraction (0.0 to 1.0)
     */
    public static void main(String[] args) {
        double price = 100.0;
        double discount = 0.75; // requested above the cap, will be limited
        System.out.println(applyDiscount(price, discount));
    }
}`,
        output: '50.0',
      },
    ],
    commonMistakes: [
      'Writing comments that just repeat the code ("// increment i by 1" above "i++;") instead of explaining reasoning.',
      'Leaving outdated comments after refactoring code, which actively misleads future readers.',
      'Using block comments to "comment out" large chunks of dead code instead of deleting it — version control already preserves history.',
    ],
    keyPoints: [
      'Three styles: // single-line, /* ... */ multi-line, and /** ... */ Javadoc.',
      'Good comments explain why, not what — the code itself should explain what.',
      'Javadoc comments can be turned into HTML documentation using the javadoc tool.',
    ],
  },

  'command-line-arguments': {
    title: 'Command Line Arguments',
    intro: `Command-line arguments let you pass information into a Java program at the moment it starts, without hardcoding values or prompting for input. They arrive as the <code>String[] args</code> parameter of the main method.`,
    sections: [
      {
        heading: 'How Arguments Are Passed',
        body: `When you run <code>java ProgramName arg1 arg2 arg3</code>, the JVM places "arg1", "arg2", and "arg3" into the args array in order, as Strings — args[0] is "arg1", args[1] is "arg2", and so on. If no arguments are given, args is an empty array (length 0), not null.`,
      },
      {
        heading: 'Converting Arguments to Other Types',
        body: `Because every argument arrives as a String, you must explicitly convert it if you need a number or other type — for example, <code>Integer.parseInt(args[0])</code> for an int, or <code>Double.parseDouble(args[1])</code> for a double. Always validate the array length before accessing an index, since accessing a missing index throws an ArrayIndexOutOfBoundsException.`,
      },
    ],
    examples: [
      {
        caption: 'Reading and converting command-line arguments safely',
        code: `public class ArgsDemo {
    public static void main(String[] args) {
        if (args.length < 2) {
            System.out.println("Usage: java ArgsDemo <name> <age>");
            return;
        }
        String name = args[0];
        int age = Integer.parseInt(args[1]);
        System.out.println(name + " is " + age + " years old.");
    }
}

// Run with: java ArgsDemo Asha 28`,
        output: 'Asha is 28 years old.',
      },
    ],
    commonMistakes: [
      'Forgetting that args elements are always Strings and trying to use them directly in arithmetic without parsing.',
      'Accessing args[0] without first checking args.length, causing an ArrayIndexOutOfBoundsException when no arguments are supplied.',
      'Confusing command-line arguments (passed at program start) with user input read during execution via Scanner — they are different mechanisms.',
    ],
    keyPoints: [
      'Command-line arguments are received as String[] args in the main method.',
      'args is never null; with no arguments supplied it is simply an empty array.',
      'Always parse and validate arguments before use, since they arrive as raw text.',
    ],
  },
}
