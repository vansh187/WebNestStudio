// Java Runtime & Advanced Language Features module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content12Runtime = {
  'networking-basics-socket-serversocket-and-url': {
    title: 'Networking Basics: Socket, ServerSocket, and URL',
    intro: `Java was built for the internet era, and the <code>java.net</code> package has provided TCP/IP networking support since the very first release. Two classes handle raw socket-based communication — <code>Socket</code> for the client side and <code>ServerSocket</code> for the server side — while <code>URL</code> and <code>URLConnection</code> provide a higher-level way to work with web resources without managing sockets directly.

Understanding both layers matters: sockets are the foundation that protocols like HTTP are built on top of, and most real applications use the higher-level URL classes (or a proper HTTP client library) rather than raw sockets. Advanced Java developers should be comfortable with both.`,
    sections: [
      {
        heading: 'Socket and ServerSocket',
        body: `A <code>ServerSocket</code> binds to a port and listens for incoming TCP connections. Calling <code>accept()</code> blocks the current thread until a client connects, then returns a <code>Socket</code> object representing that specific connection. A client creates its own <code>Socket</code> by specifying the server's host and port; once connected, both sides read and write through the socket's input and output streams, exactly like reading and writing a file.`,
        list: [
          '<code>ServerSocket(port)</code> — opens a listening socket on the given port.',
          '<code>serverSocket.accept()</code> — blocks until a client connects, then returns a connected <code>Socket</code>.',
          '<code>new Socket(host, port)</code> — the client-side call that initiates a TCP connection.',
          'Both sides use <code>getInputStream()</code> / <code>getOutputStream()</code> to exchange data.',
        ],
      },
      {
        heading: 'URL and URLConnection',
        body: `The <code>URL</code> class parses and represents a Uniform Resource Locator — it can break a web address down into its protocol, host, port, path, and query string without making any network call at all. <code>URLConnection</code> (obtained via <code>url.openConnection()</code>) is what actually performs network I/O: it opens a connection to the resource and lets you read its content as a stream, inspect response headers, or send data. This is the mechanism behind simple HTTP downloads in older and simpler Java code, though modern code typically prefers the more capable <code>java.net.http.HttpClient</code> introduced in Java 11.`,
      },
      {
        heading: 'Blocking Behavior and Real Applications',
        body: `Both <code>accept()</code> and stream reads are blocking calls by default — they pause the calling thread until data or a connection arrives. That is why simple socket servers usually accept connections in a loop, often handing each accepted socket off to its own thread (or a thread pool) so one slow client cannot stall every other client. Production servers rarely write raw socket loops like this by hand; they use frameworks (Netty, Spring's embedded servers, and so on) that solve these concurrency and buffering problems for you — but the concepts underneath are exactly Socket, ServerSocket, and the read/write stream model shown here.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal client-server exchange using Socket and ServerSocket',
        code: `import java.io.*;
import java.net.*;

public class SocketDemo {
    public static void main(String[] args) throws Exception {
        // Server: accept one connection on its own thread
        Thread server = new Thread(() -> {
            try (ServerSocket serverSocket = new ServerSocket(5000)) {
                Socket client = serverSocket.accept(); // blocks until a client connects
                BufferedReader in = new BufferedReader(new InputStreamReader(client.getInputStream()));
                PrintWriter out = new PrintWriter(client.getOutputStream(), true);
                String received = in.readLine();
                out.println("Server received: " + received);
                client.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        server.start();

        Thread.sleep(200); // give the server a moment to start listening

        // Client: connect, send a line, read the reply
        try (Socket socket = new Socket("localhost", 5000)) {
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            out.println("Hello from client");
            System.out.println(in.readLine());
        }

        server.join();
    }
}`,
        output: 'Server received: Hello from client',
      },
      {
        caption: 'Parsing a resource address with URL (no network call required)',
        code: `import java.net.URL;

public class UrlDemo {
    public static void main(String[] args) throws Exception {
        URL url = new URL("https://api.example.com:8443/v1/data?id=42");
        System.out.println("Protocol: " + url.getProtocol());
        System.out.println("Host: " + url.getHost());
        System.out.println("Port: " + url.getPort());
        System.out.println("Path: " + url.getPath());
        System.out.println("Query: " + url.getQuery());
    }
}`,
        output: `Protocol: https
Host: api.example.com
Port: 8443
Path: /v1/data
Query: id=42`,
      },
    ],
    commonMistakes: [
      'Forgetting that ServerSocket.accept() blocks — calling it on the main thread of a GUI or single-threaded server freezes everything else until a client connects.',
      'Not closing sockets and streams (or not using try-with-resources), which leaks file descriptors and eventually exhausts the OS connection limit.',
      'Assuming a single ServerSocket automatically handles multiple simultaneous clients — you must accept in a loop and typically dispatch each connection to its own thread.',
      'Using raw URLConnection for serious HTTP work instead of java.net.http.HttpClient, which offers timeouts, redirects, and async support out of the box.',
    ],
    keyPoints: [
      'Socket is the client-side TCP endpoint; ServerSocket listens and accept() hands back a connected Socket per client.',
      'URL parses a web address into components; URLConnection performs the actual network I/O to fetch or send data.',
      'accept() and stream reads block by default, so real servers typically handle each client on a separate thread.',
      'Modern HTTP work should generally use java.net.http.HttpClient rather than raw sockets or legacy URLConnection.',
    ],
  },

  'reflection-api': {
    title: 'Reflection API',
    intro: `Reflection is Java's ability to examine and manipulate classes, fields, methods, and constructors at runtime — even ones the code calling reflection did not know about at compile time. The core classes live in <code>java.lang.reflect</code>, and the entry point is almost always a <code>Class</code> object obtained through <code>obj.getClass()</code>, <code>SomeType.class</code>, or <code>Class.forName("fully.qualified.Name")</code>.

Reflection is what makes frameworks possible: dependency injection containers (Spring), serialization libraries (Jackson, Gson), testing frameworks (JUnit), and ORMs (Hibernate) all use reflection to discover annotated fields and methods on classes they were never compiled against, and to construct or populate objects generically. It is powerful, but it comes with real performance and safety trade-offs that advanced Java developers need to understand before reaching for it.`,
    sections: [
      {
        heading: 'Inspecting a Class at Runtime',
        body: `Once you have a <code>Class</code> object, you can query almost everything about the type: its fields with <code>getDeclaredFields()</code>, its methods with <code>getDeclaredMethods()</code>, its constructors with <code>getDeclaredConstructors()</code>, its superclass, its interfaces, and its annotations. The "declared" variants return members defined directly on that class (including private ones), while the non-"declared" variants (<code>getFields()</code>, <code>getMethods()</code>) return only public members, including inherited ones.`,
        list: [
          '<code>Class.forName("com.example.Foo")</code> — loads a class by name and returns its Class object.',
          '<code>clazz.getDeclaredFields()</code> / <code>getDeclaredMethods()</code> — all members declared on that class, regardless of access modifier.',
          '<code>field.setAccessible(true)</code> — bypasses Java\'s normal access checks so private members can be read or invoked.',
          '<code>method.invoke(instance, args...)</code> — calls a method reflectively, given a target object and its arguments.',
        ],
      },
      {
        heading: 'Invoking Private Members',
        body: `Normally, the compiler blocks access to private fields and methods from outside their class. Reflection can bypass this using <code>setAccessible(true)</code> on a <code>Field</code>, <code>Method</code>, or <code>Constructor</code> object, provided the JVM's module and security settings allow it. This is exactly how libraries like Gson populate private fields directly during deserialization, and how test frameworks call private helper methods to unit-test internal logic without exposing it publicly.`,
      },
      {
        heading: 'Performance and Safety Caveats',
        body: `Reflective calls are noticeably slower than direct calls, because the JVM cannot fully optimize or inline a call it resolves by name at runtime, and each invocation goes through extra access checks and argument boxing. Reflection also weakens compile-time safety: typos in method or field names, or a mismatched argument type, only surface as a runtime <code>NoSuchMethodException</code> or <code>IllegalArgumentException</code> instead of a compile error. Since Java 9's module system, reflection into another module's internals can also be blocked entirely unless that module explicitly "opens" the package, which is a common source of runtime errors when upgrading legacy reflective code.`,
      },
    ],
    examples: [
      {
        caption: 'Inspecting fields and methods, then invoking a private method reflectively',
        code: `import java.lang.reflect.*;
import java.util.*;

class Account {
    private String owner;
    private double balance;

    public Account(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
    }

    private double applyInterest(double rate) {
        return balance * rate;
    }
}

public class ReflectionDemo {
    public static void main(String[] args) throws Exception {
        Class<?> clazz = Class.forName("Account");

        Field[] fields = clazz.getDeclaredFields();
        Arrays.sort(fields, Comparator.comparing(Field::getName));
        System.out.println("Fields:");
        for (Field field : fields) {
            System.out.println("  " + field.getType().getSimpleName() + " " + field.getName());
        }

        System.out.println("Methods:");
        for (Method method : clazz.getDeclaredMethods()) {
            System.out.println("  " + method.getName());
        }

        Object account = clazz.getDeclaredConstructor(String.class, double.class)
                               .newInstance("Priya", 1000.0);

        Method applyInterest = clazz.getDeclaredMethod("applyInterest", double.class);
        applyInterest.setAccessible(true); // bypass private access for this demo
        Object result = applyInterest.invoke(account, 0.05);
        System.out.println("Interest: " + result);
    }
}`,
        output: `Fields:
  double balance
  String owner
Methods:
  applyInterest
Interest: 50.0`,
      },
    ],
    commonMistakes: [
      'Reaching for reflection to solve a problem that polymorphism or an interface would solve more safely and more efficiently.',
      'Forgetting setAccessible(true) before invoking a private member, resulting in an IllegalAccessException.',
      'Caching neither the Class nor the Method/Field object in a hot code path, forcing repeated (slow) reflective lookups by name.',
      'Assuming reflective access always works — Java 9+ module boundaries can block reflection into another module unless it is explicitly opened.',
    ],
    keyPoints: [
      'Reflection lets code inspect and invoke classes, fields, methods, and constructors it did not know about at compile time.',
      'Class.forName(), getDeclaredFields()/getDeclaredMethods(), and Method.invoke() are the core building blocks.',
      'setAccessible(true) bypasses private/protected access checks, which is how many frameworks read or set private state.',
      'Reflection trades compile-time safety and speed for runtime flexibility — use it for framework-style problems, not everyday logic.',
    ],
  },

  'java-annotations': {
    title: 'Java Annotations',
    intro: `An annotation is metadata attached to code — a class, method, field, or parameter — that does not change the program's logic directly but can be read by the compiler, by tools, or by other code at runtime through reflection. Annotations look like <code>@Something</code> placed above a declaration, and Java ships several built-in ones while also letting you define your own.

Annotations are central to how modern Java frameworks work: Spring uses them to wire dependencies and map HTTP routes, JUnit uses them to mark test methods, and JPA/Hibernate uses them to map classes to database tables. Even without a framework, the built-in annotations improve everyday code safety and clarity.`,
    sections: [
      {
        heading: 'Built-in Annotations',
        body: `The most commonly used compiler-recognized annotations ship with the language itself.`,
        list: [
          '<code>@Override</code> — tells the compiler this method must override a superclass/interface method; catches typos in method signatures at compile time.',
          '<code>@Deprecated</code> — marks a method or class as discouraged for future use, producing a compiler warning at call sites.',
          '<code>@SuppressWarnings("...")</code> — tells the compiler to suppress a specific category of warning (e.g. "unchecked") for the annotated element.',
          '<code>@FunctionalInterface</code> — documents that an interface is intended to have exactly one abstract method, and causes a compile error if that constraint is violated.',
        ],
      },
      {
        heading: 'Meta-Annotations: Retention and Target',
        body: `Meta-annotations are annotations that apply to other annotations, controlling how they behave. <code>@Retention</code> decides how long an annotation is kept: <code>SOURCE</code> (discarded by the compiler, useful for tools like Lombok), <code>CLASS</code> (kept in the .class file but not visible at runtime — the default), or <code>RUNTIME</code> (kept and readable via reflection while the program runs). <code>@Target</code> restricts which kinds of declarations the annotation may be placed on, such as <code>ElementType.METHOD</code>, <code>TYPE</code>, or <code>FIELD</code>. An annotation meant to be read reflectively at runtime, as frameworks do, must be declared with <code>@Retention(RetentionPolicy.RUNTIME)</code>.`,
      },
      {
        heading: 'Defining a Custom Annotation',
        body: `You declare a custom annotation with <code>@interface</code>, optionally giving it elements (which look like methods with no body, and can have default values). Combined with reflection, a custom annotation lets you mark code with metadata and then write generic code that discovers and acts on those marks — exactly how test runners find <code>@Test</code> methods without you ever registering them manually.`,
      },
    ],
    examples: [
      {
        caption: 'Built-in annotations in everyday use',
        code: `public class AnnotationBasicsDemo {

    @FunctionalInterface
    interface Greeter {
        String greet(String name);
    }

    static class Base {
        void show() {
            System.out.println("Base.show()");
        }
    }

    static class Derived extends Base {
        @Override
        void show() {
            System.out.println("Derived.show()");
        }

        @Deprecated
        void oldMethod() {
            System.out.println("This method should no longer be used.");
        }
    }

    @SuppressWarnings("unchecked")
    static void rawTypeExample() {
        java.util.List list = new java.util.ArrayList();
        list.add("no compiler warning shown here");
        System.out.println(list.get(0));
    }

    public static void main(String[] args) {
        Base obj = new Derived();
        obj.show();

        Greeter greeter = name -> "Hello, " + name + "!";
        System.out.println(greeter.greet("Webnest"));

        rawTypeExample();
    }
}`,
        output: `Derived.show()
Hello, Webnest!
no compiler warning shown here`,
      },
      {
        caption: 'A custom runtime annotation discovered through reflection',
        code: `import java.lang.annotation.*;
import java.lang.reflect.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Testable {
    String author() default "unknown";
}

class Calculator {
    @Testable(author = "Priya")
    public int add(int a, int b) {
        return a + b;
    }

    public int subtract(int a, int b) {
        return a - b;
    }
}

public class CustomAnnotationDemo {
    public static void main(String[] args) {
        for (Method method : Calculator.class.getDeclaredMethods()) {
            if (method.isAnnotationPresent(Testable.class)) {
                Testable info = method.getAnnotation(Testable.class);
                System.out.println(method.getName() + " is testable, written by " + info.author());
            }
        }
    }
}`,
        output: 'add is testable, written by Priya',
      },
    ],
    commonMistakes: [
      'Defining a custom annotation without @Retention(RetentionPolicy.RUNTIME) and then being confused when reflection cannot find it at runtime.',
      'Forgetting @Override on an intended override, so a typo in the method signature silently creates a brand-new overload instead of failing to compile.',
      'Overusing @SuppressWarnings on large blocks of code instead of the smallest possible scope, hiding warnings that mattered.',
      'Assuming annotations execute code by themselves — an annotation is inert metadata until something (the compiler or reflective code) actually reads and acts on it.',
    ],
    keyPoints: [
      '@Override, @Deprecated, @SuppressWarnings, and @FunctionalInterface are the most common built-in annotations.',
      '@Retention controls how long an annotation survives (SOURCE, CLASS, RUNTIME); @Target restricts where it can be applied.',
      'Custom annotations are declared with @interface and become useful once reflective code discovers and acts on them.',
      'An annotation by itself does nothing — its value comes entirely from the compiler checks or reflective code that reads it.',
    ],
  },

  'enums-in-java': {
    title: 'Enums in Java',
    intro: `An enum (short for enumeration) is a special Java type that represents a fixed set of named constants — think days of the week, directions, or order statuses. Unlike a plain set of <code>int</code> or <code>String</code> constants, an enum in Java is a full class: it can have its own constructor, fields, and methods, and every enum implicitly extends <code>java.lang.Enum</code>.

Because enum values are known and fixed at compile time, the compiler can catch mistakes that plain constants cannot — passing an invalid value simply cannot happen, because no such enum constant exists to pass. This makes enums one of the simplest ways to make Java code both safer and more self-documenting.`,
    sections: [
      {
        heading: 'Enums as Special Classes',
        body: `Declaring <code>enum Day { MONDAY, TUESDAY, ... }</code> creates a class with exactly those named, singleton instances — <code>Day.MONDAY</code> is not just a label, it is a real object, and it is always the same object every time it's referenced (enum constants are inherently singletons and safe to compare with <code>==</code>). Every enum automatically inherits useful methods: <code>name()</code> returns the constant's exact declared name, and <code>ordinal()</code> returns its position (starting at 0) in the declaration.`,
      },
      {
        heading: 'Adding Fields, Constructors, and Methods',
        body: `Enums become genuinely powerful once you attach data and behavior to each constant. You give the enum a private field and a constructor, and then supply constructor arguments after each constant's name. Each constant can also override methods individually if needed, but most commonly they share methods defined once on the enum type, using each constant's own field values.`,
      },
      {
        heading: 'values(), valueOf(), and switch',
        body: `Every enum automatically gets a static <code>values()</code> method that returns an array of all constants in declaration order — ideal for looping over every possible value. <code>valueOf(String)</code> converts a matching String back into the corresponding constant, throwing <code>IllegalArgumentException</code> if the name doesn't match exactly. Enums also work naturally in a <code>switch</code> statement or expression, where you reference the bare constant name (without the enum type prefix) in each case label.`,
        list: [
          '<code>EnumType.values()</code> — returns all constants as an array, in declaration order.',
          '<code>EnumType.valueOf("NAME")</code> — parses a String into the matching constant, or throws if none matches.',
          '<code>constant.name()</code> and <code>constant.ordinal()</code> — the declared name and zero-based position.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A basic enum used with switch, values(), and valueOf()',
        code: `public class EnumBasicsDemo {

    enum Day { MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY }

    static boolean isWeekend(Day day) {
        switch (day) {
            case SATURDAY:
            case SUNDAY:
                return true;
            default:
                return false;
        }
    }

    public static void main(String[] args) {
        Day today = Day.SATURDAY;
        System.out.println(today + " is weekend: " + isWeekend(today));

        for (Day d : Day.values()) {
            System.out.print(d.ordinal() + ":" + d + " ");
        }
        System.out.println();

        Day parsed = Day.valueOf("FRIDAY");
        System.out.println("Parsed: " + parsed);
    }
}`,
        output: `SATURDAY is weekend: true
0:MONDAY 1:TUESDAY 2:WEDNESDAY 3:THURSDAY 4:FRIDAY 5:SATURDAY 6:SUNDAY
Parsed: FRIDAY`,
      },
      {
        caption: 'An enum with fields, a constructor, and a method per constant',
        code: `public class EnumWithFieldsDemo {

    enum Planet {
        MERCURY(3.303e+23, 2.4397e6),
        VENUS(4.869e+24, 6.0518e6),
        EARTH(5.976e+24, 6.37814e6);

        private final double mass;   // kilograms
        private final double radius; // meters

        Planet(double mass, double radius) {
            this.mass = mass;
            this.radius = radius;
        }

        double surfaceGravity() {
            final double G = 6.67300E-11;
            return G * mass / (radius * radius);
        }
    }

    public static void main(String[] args) {
        for (Planet p : Planet.values()) {
            System.out.printf("%-8s gravity: %.2f m/s^2%n", p, p.surfaceGravity());
        }
    }
}`,
        output: `MERCURY  gravity: 3.70 m/s^2
VENUS    gravity: 8.87 m/s^2
EARTH    gravity: 9.80 m/s^2`,
      },
    ],
    commonMistakes: [
      'Using plain int constants (e.g. public static final int MONDAY = 0) instead of an enum, which allows any invalid int to be passed where only a fixed set of values makes sense.',
      'Calling valueOf() with a name that doesn\'t exactly match a declared constant (including case) and not handling the resulting IllegalArgumentException.',
      'Comparing enum constants with .equals() out of habit — == is both safe and idiomatic for enums, since each constant is a single shared instance.',
      'Forgetting the semicolon after the last constant when an enum also declares fields, constructors, or methods below it.',
    ],
    keyPoints: [
      'An enum is a special class with a fixed set of singleton instances, not just a group of int or String constants.',
      'Enums can have constructors, fields, and methods, letting each constant carry its own data and behavior.',
      'values() lists all constants in order; valueOf(String) parses a name back into a constant.',
      'Enums are safer than int constants because the compiler guarantees only a valid, declared constant can ever be used.',
    ],
  },
}
