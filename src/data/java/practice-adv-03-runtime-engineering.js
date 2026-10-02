// Practice blocks for the Advanced Java modules "Advanced Runtime Concepts" and
// "Engineering Practices". Merged onto the lesson entries in index.js by slug, so the
// lesson prose files stay unchanged.
// Exercises that use only the JDK state their expected output and run in the playground.
// Those that need a build tool or a test library are marked runnable: false.
export const practiceAdvRuntimeEngineering = {
  'networking-basics-socket-serversocket-and-url': {
    whyItMatters: `Every call your back end makes, to a database, a payment gateway or another service, travels over a socket to a host and a port. Frameworks hide the plumbing, but the vocabulary of connections, ports, blocking reads and timeouts is what you need to read a stack trace or a firewall rule when something stops responding.`,
    exercise: {
      prompt: `Parse two addresses with <code>java.net.URI</code>, which needs no network access. For the first, print the scheme, the path and the fragment. For the second, which names no port, print what <code>getPort()</code> returns.

Expected output: <code>https</code>, <code>/products/42</code>, <code>reviews</code>, <code>-1</code> (one per line)`,
      starterCode: `import java.net.URI;

public class ParseAddress {
    public static void main(String[] args) {
        URI full = URI.create("https://shop.example.com:8443/products/42?ref=home#reviews");
        URI plain = URI.create("http://example.com/about");

        // TODO: print the scheme, the path and the fragment of "full"
        // TODO: print the port of "plain"
    }
}`,
      hints: [
        'The getters are <code>getScheme()</code>, <code>getPath()</code> and <code>getFragment()</code>.',
        'When the address has no explicit port, <code>getPort()</code> returns <code>-1</code>; the client then uses the default for the scheme.',
      ],
      solution: `import java.net.URI;

public class ParseAddress {
    public static void main(String[] args) {
        URI full = URI.create("https://shop.example.com:8443/products/42?ref=home#reviews");
        URI plain = URI.create("http://example.com/about");

        System.out.println(full.getScheme());   // https
        System.out.println(full.getPath());     // /products/42
        System.out.println(full.getFragment()); // reviews
        System.out.println(plain.getPort());    // -1
    }
}`,
    },
    quiz: [
      {
        question: 'What identifies one end of a network connection?',
        options: ['A file name', 'An IP address together with a port number', 'A class name', 'A thread id'],
        answer: 1,
        explanation: 'The address finds the machine, and the port finds the program on it.',
      },
      {
        question: 'What does <code>ServerSocket.accept()</code> return?',
        options: ['A Socket connected to the client that just connected', 'A boolean', 'The port number', 'An InputStream'],
        answer: 0,
        explanation: 'The server then reads and writes through that socket\'s streams.',
      },
      {
        question: 'Why does a simple server handle each client on a separate thread?',
        options: ['Sockets cannot be reused', 'Threads make the network faster', 'The compiler requires it', 'Reading from a socket blocks, so one slow client would otherwise hold up all the others'],
        answer: 3,
        explanation: 'Thread pools or non-blocking I/O are used when there are many clients.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between Socket and ServerSocket?',
        answer: `<code>ServerSocket</code> is used by a server: it binds to a port and waits, and each call to <code>accept()</code> returns a new <code>Socket</code> for one client. <code>Socket</code> is one end of an established TCP connection: a client creates one by giving the server's host and port. Both sides then exchange data through the socket's input and output streams.`,
      },
      {
        question: 'Why should network calls always have a timeout?',
        answer: `A read on a socket blocks until data arrives. If the other side has hung or the network has silently dropped the connection, the thread waits indefinitely. In a server, such stuck threads accumulate until the thread pool is exhausted and the whole application stops responding. A connect timeout and a read timeout turn that silent hang into an exception the code can handle or retry.`,
      },
    ],
  },

  'reflection-api': {
    whyItMatters: `Spring creates your beans and injects their dependencies, JUnit finds your test methods, and Jackson and Hibernate fill in private fields, all without knowing your classes in advance. They do it through reflection. Understanding it removes the mystery from how frameworks work and from the stack traces they produce.`,
    exercise: {
      prompt: `<code>Greeter</code> has a private method. Using reflection, print how many methods the class declares, then make the private method accessible, invoke it on a new object with the argument <code>Asha</code>, and print the result.

Expected output: <code>1</code> then <code>Hello, Asha</code>`,
      starterCode: `import java.lang.reflect.Method;

class Greeter {
    private String greet(String name) {
        return "Hello, " + name;
    }
}

public class CallPrivate {
    public static void main(String[] args) throws Exception {
        Class<?> type = Greeter.class;

        // TODO: print the number of declared methods
        // TODO: look up "greet", make it accessible, invoke it with "Asha" and print the result
    }
}`,
      hints: [
        '<code>getDeclaredMethod("greet", String.class)</code> finds the method by name and parameter types.',
        'Call <code>setAccessible(true)</code>, then <code>method.invoke(object, argument)</code>.',
      ],
      solution: `import java.lang.reflect.Method;

class Greeter {
    private String greet(String name) {
        return "Hello, " + name;
    }
}

public class CallPrivate {
    public static void main(String[] args) throws Exception {
        Class<?> type = Greeter.class;

        System.out.println(type.getDeclaredMethods().length); // 1

        Method method = type.getDeclaredMethod("greet", String.class);
        method.setAccessible(true);
        Object result = method.invoke(new Greeter(), "Asha");
        System.out.println(result); // Hello, Asha
    }
}`,
    },
    quiz: [
      {
        question: 'Which call obtains the <code>Class</code> object for a class whose name is known only as a string?',
        options: ['new Class(name)', 'Class.load(name)', 'Class.forName(name)', 'Object.getClass(name)'],
        answer: 2,
        explanation: 'This is how frameworks load classes named in configuration.',
      },
      {
        question: 'What does <code>getDeclaredFields()</code> return?',
        options: ['All fields declared in the class itself, of any visibility', 'Only public fields, including inherited ones', 'Only static fields', 'The values of the fields'],
        answer: 0,
        explanation: 'getFields() is the one that returns public fields including inherited ones.',
      },
      {
        question: 'What happens when a method invoked through reflection throws an exception?',
        options: ['It is swallowed', 'It is rethrown unchanged', 'The JVM exits', 'It is wrapped in an InvocationTargetException'],
        answer: 3,
        explanation: 'The original exception is available from getCause().',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do frameworks such as Spring use reflection?',
        answer: `At start-up the framework scans the classpath, loads classes and reads their annotations. It creates objects by calling constructors reflectively, injects dependencies by setting fields or calling constructors and setters, and invokes handler methods by name when a request arrives. None of this requires the framework to have been compiled against your classes, which is why adding an annotation is enough to make a class take part.`,
      },
      {
        question: 'What are the drawbacks of reflection?',
        answer: `It bypasses compile-time checking, so a misspelled method name or a wrong argument type fails only at runtime. It is slower than direct calls. It can break encapsulation by reaching private members, and under the module system such access is refused unless the package is opened. Code using it is harder to read and refactor, so in application code it is kept for cases that genuinely need it.`,
      },
    ],
  },

  'java-annotations': {
    whyItMatters: `Modern Java frameworks are driven by annotations: <code>@Override</code>, <code>@Test</code>, <code>@Autowired</code>, <code>@Entity</code>, <code>@GetMapping</code>. An annotation is only metadata; something else has to read it and act. Writing a small annotation and reading it yourself shows exactly how that works.`,
    exercise: {
      prompt: `The annotation <code>@Important</code> has an integer element <code>level</code>, and one method of <code>Billing</code> carries it. Complete the declaration so that it is usable on methods and readable at runtime. Then, using reflection, find the annotated method and print its name and level.

Expected output: <code>pay 2</code>`,
      starterCode: `import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;

// TODO: keep @Important at runtime and allow it on methods only
@interface Important {
    int level();
}

class Billing {
    @Important(level = 2)
    public void pay() { }

    public void log() { }
}

public class FindImportant {
    public static void main(String[] args) {
        for (Method method : Billing.class.getDeclaredMethods()) {
            // TODO: if the method has @Important, print its name and the level
        }
    }
}`,
      hints: [
        'An annotation is declared with <code>@interface</code>, and needs <code>@Retention(RetentionPolicy.RUNTIME)</code> to be visible to reflection.',
        '<code>method.getAnnotation(Important.class)</code> returns the annotation, or <code>null</code> when the method does not have it.',
      ],
      solution: `import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Important {
    int level();
}

class Billing {
    @Important(level = 2)
    public void pay() { }

    public void log() { }
}

public class FindImportant {
    public static void main(String[] args) {
        for (Method method : Billing.class.getDeclaredMethods()) {
            Important important = method.getAnnotation(Important.class);
            if (important != null) {
                System.out.println(method.getName() + " " + important.level()); // pay 2
            }
        }
    }
}`,
    },
    quiz: [
      {
        question: 'Which retention policy is needed for an annotation to be read by reflection while the program runs?',
        options: ['SOURCE', 'RUNTIME', 'CLASS', 'COMPILE'],
        answer: 1,
        explanation: 'SOURCE annotations are discarded by the compiler, and CLASS is the default, kept in the class file but not available to reflection.',
      },
      {
        question: 'What does <code>@Override</code> do?',
        options: ['Makes the method run faster', 'Makes the method public', 'Asks the compiler to report an error if the method does not actually override one in a supertype', 'Marks the method as deprecated'],
        answer: 2,
        explanation: 'It catches a misspelled name or a wrong parameter list.',
      },
      {
        question: 'What does <code>@Target(ElementType.METHOD)</code> specify?',
        options: ['Where the annotation may be applied: here, only to methods', 'How long the annotation is kept', 'The default value', 'The class that reads the annotation'],
        answer: 0,
        explanation: 'Using it on a class or field would be a compile-time error.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is an annotation and does it change how code runs?',
        answer: `An annotation is metadata attached to a class, method, field or parameter. By itself it does nothing: it has no logic. It takes effect only when something reads it: the compiler, as with <code>@Override</code>; an annotation processor at build time, as with Lombok; or a framework at runtime through reflection, as with <code>@Autowired</code> or <code>@Test</code>.`,
      },
      {
        question: 'What are meta-annotations?',
        answer: `They are annotations applied to annotation declarations. <code>@Retention</code> states how long the annotation is kept: source only, class file, or runtime. <code>@Target</code> states which program elements it may be placed on. <code>@Documented</code> includes it in generated documentation, <code>@Inherited</code> lets subclasses inherit a class-level annotation, and <code>@Repeatable</code> allows it to be applied more than once to the same element.`,
      },
    ],
  },

  'enums-in-java': {
    whyItMatters: `Order statuses, user roles and plan types have a fixed set of values, and representing them as strings or integers invites typos and invalid values that the compiler cannot catch. Java enums are full classes, so each constant can carry data and behaviour, which removes a great many <code>if</code> chains.`,
    exercise: {
      prompt: `Define an enum <code>Plan</code> with the constants FREE, PRO and TEAM, each holding a monthly price of 0, 499 and 1999, and a method <code>yearly()</code> that returns twelve times the price. Print the yearly price of the plan named by the string <code>PRO</code>, then the name and monthly price of every plan that is not free.

Expected output: <code>5988</code>, <code>PRO 499</code>, <code>TEAM 1999</code> (one per line)`,
      starterCode: `// TODO: enum Plan with a price field, a constructor and yearly()

public class Plans {
    public static void main(String[] args) {
        // TODO: look up the plan named "PRO" and print its yearly price

        // TODO: loop over all plans, printing "NAME price" for those with a price above 0
    }
}`,
      hints: [
        'Each constant passes its data to the constructor: <code>PRO(499)</code>. An enum constructor is implicitly private.',
        '<code>Plan.valueOf("PRO")</code> returns the constant with that name, and <code>Plan.values()</code> returns all of them in declaration order.',
      ],
      solution: `enum Plan {
    FREE(0),
    PRO(499),
    TEAM(1999);

    private final int price;

    Plan(int price) {
        this.price = price;
    }

    int price() {
        return price;
    }

    int yearly() {
        return price * 12;
    }
}

public class Plans {
    public static void main(String[] args) {
        System.out.println(Plan.valueOf("PRO").yearly()); // 5988

        for (Plan plan : Plan.values()) {
            if (plan.price() > 0) {
                System.out.println(plan + " " + plan.price()); // PRO 499, TEAM 1999
            }
        }
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>Plan.valueOf("GOLD")</code> do when no such constant exists?',
        options: ['Returns null', 'Returns the first constant', 'Creates a new constant', 'Throws IllegalArgumentException'],
        answer: 3,
        explanation: 'Input from outside should be checked or the exception caught.',
      },
      {
        question: 'How should two enum values be compared?',
        options: ['With ==, since each constant exists exactly once', 'Only with equals()', 'By comparing their names as strings', 'With compareTo only'],
        answer: 0,
        explanation: '== is also safe when one side is null, where equals() would throw.',
      },
      {
        question: 'Why is storing <code>ordinal()</code> in a database a bad idea?',
        options: ['It is slow', 'The number changes if constants are reordered or one is inserted, silently changing the meaning of stored data', 'It is not allowed', 'It returns a string'],
        answer: 1,
        explanation: 'Store the name, or an explicit code held in a field.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why use an enum instead of constants such as public static final int?',
        answer: `Integer or string constants are not type-safe: a method that takes an <code>int</code> status accepts any number. An enum is its own type, so only its constants can be passed, and the compiler checks it. Enums print with readable names, can be listed with <code>values()</code>, work in <code>switch</code>, and can carry fields and methods. They are also guaranteed singletons, so they can be compared with <code>==</code>.`,
      },
      {
        question: 'Can an enum have fields, methods and implement interfaces?',
        answer: `Yes. An enum is a class: it can declare fields, a constructor that each constant calls with its own arguments, and methods. A constant can even supply its own body for a method, giving behaviour that differs per constant. An enum can implement interfaces but cannot extend a class, because it already extends <code>java.lang.Enum</code>, and it cannot be instantiated with <code>new</code>.`,
      },
    ],
  },

  'java-nio-basics-channels-and-buffers': {
    whyItMatters: `High-performance servers, including the ones underneath Netty, Tomcat's NIO connector and Kafka, read and write through channels and buffers. The buffer's position and limit, and the <code>flip()</code> call that switches it from writing to reading, are the part everyone gets wrong at first; a forgotten flip reads nothing at all.`,
    exercise: {
      prompt: `Put the bytes for <code>h</code> and <code>i</code> into an 8-byte buffer and print its position and limit. Flip the buffer and print the position and limit again. Then read the remaining bytes and print them as text.

Expected output: <code>2 8</code>, <code>0 2</code>, <code>hi</code> (one per line)`,
      starterCode: `import java.nio.ByteBuffer;

public class BufferStates {
    public static void main(String[] args) {
        ByteBuffer buffer = ByteBuffer.allocate(8);

        // TODO: put the bytes 'h' and 'i', then print position and limit
        // TODO: flip, then print position and limit
        // TODO: read the remaining bytes into a StringBuilder and print it
    }
}`,
      hints: [
        "A character is stored with <code>buffer.put((byte) 'h')</code>.",
        'Read while <code>buffer.hasRemaining()</code>, appending <code>(char) buffer.get()</code>.',
      ],
      solution: `import java.nio.ByteBuffer;

public class BufferStates {
    public static void main(String[] args) {
        ByteBuffer buffer = ByteBuffer.allocate(8);

        buffer.put((byte) 'h');
        buffer.put((byte) 'i');
        System.out.println(buffer.position() + " " + buffer.limit()); // 2 8

        buffer.flip();
        System.out.println(buffer.position() + " " + buffer.limit()); // 0 2

        StringBuilder text = new StringBuilder();
        while (buffer.hasRemaining()) {
            text.append((char) buffer.get());
        }
        System.out.println(text); // hi
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>flip()</code> do to a buffer?',
        options: ['Erases its contents', 'Reverses the bytes', 'Sets the limit to the current position and the position to zero, ready for reading', 'Doubles its capacity'],
        answer: 2,
        explanation: 'It switches the buffer from being written into to being read from.',
      },
      {
        question: 'What does <code>clear()</code> do?',
        options: ['Resets position to zero and limit to capacity, without erasing the bytes', 'Deletes the buffer', 'Fills the buffer with zeros', 'Closes the channel'],
        answer: 0,
        explanation: 'The old bytes are simply overwritten by the next writes.',
      },
      {
        question: 'How does a channel differ from a stream?',
        options: ['A channel cannot read files', 'A channel reads and writes through buffers and can work in both directions and in non-blocking mode', 'A stream is faster', 'A channel works only with text'],
        answer: 1,
        explanation: 'A stream moves bytes in one direction, one call at a time, and always blocks.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Explain position, limit and capacity of a buffer.',
        answer: `Capacity is the fixed size of the buffer. Position is the index of the next element to read or write. Limit is the first index that must not be read or written. While filling a buffer, the limit equals the capacity and the position advances. <code>flip()</code> then sets the limit to the position and the position to zero, so that exactly the bytes written can be read back.`,
      },
      {
        question: 'What is the difference between java.io and java.nio?',
        answer: `<code>java.io</code> is stream-oriented and blocking: each read or write moves bytes one way and the thread waits until it completes, so a server needs a thread per connection. <code>java.nio</code> is buffer-oriented: data is read into buffers through channels, which can be non-blocking, and a <code>Selector</code> lets one thread watch many channels and act only on those that are ready. That scales to many more connections.`,
      },
    ],
  },

  'design-patterns-overview-singleton-factory-builder-observer': {
    whyItMatters: `Design patterns are named solutions to problems that keep recurring, and they are the shared vocabulary of developers: "use a builder here" is understood at once. The Java libraries and Spring are full of them, and pattern questions appear in most interviews beyond junior level.`,
    exercise: {
      prompt: `Complete the nested <code>Builder</code> of the <code>User</code> class so that a user can be created with a required name and optional email and age, set through chained calls. Then complete the singleton <code>Config</code> so that every call to <code>getInstance()</code> returns the same object.

Expected output: <code>asha a@example.com 30</code> then <code>true</code>`,
      starterCode: `class User {
    private final String name;
    private final String email;
    private final int age;

    private User(Builder builder) {
        this.name = builder.name;
        this.email = builder.email;
        this.age = builder.age;
    }

    @Override
    public String toString() {
        return name + " " + email + " " + age;
    }

    static class Builder {
        private final String name;
        private String email = "";
        private int age;

        Builder(String name) {
            this.name = name;
        }

        Builder email(String email) {
            // TODO: store the email
            return this;
        }

        Builder age(int age) {
            // TODO: store the age
            return this;
        }

        User build() {
            // TODO: return a new User made from this builder
            return null;
        }
    }
}

class Config {
    // TODO: a single private static instance and a private constructor

    static Config getInstance() {
        // TODO: return the single instance
        return new Config();
    }
}

public class Patterns {
    public static void main(String[] args) {
        User user = new User.Builder("asha").email("a@example.com").age(30).build();
        System.out.println(user);
        System.out.println(Config.getInstance() == Config.getInstance());
    }
}`,
      hints: [
        'Each setter of the builder assigns its field and returns <code>this</code>, which is what allows the calls to be chained.',
        'The simplest thread-safe singleton creates its instance in a <code>private static final</code> field.',
      ],
      solution: `class User {
    private final String name;
    private final String email;
    private final int age;

    private User(Builder builder) {
        this.name = builder.name;
        this.email = builder.email;
        this.age = builder.age;
    }

    @Override
    public String toString() {
        return name + " " + email + " " + age;
    }

    static class Builder {
        private final String name;
        private String email = "";
        private int age;

        Builder(String name) {
            this.name = name;
        }

        Builder email(String email) {
            this.email = email;
            return this;
        }

        Builder age(int age) {
            this.age = age;
            return this;
        }

        User build() {
            return new User(this);
        }
    }
}

class Config {
    private static final Config INSTANCE = new Config();

    private Config() { }

    static Config getInstance() {
        return INSTANCE;
    }
}

public class Patterns {
    public static void main(String[] args) {
        User user = new User.Builder("asha").email("a@example.com").age(30).build();
        System.out.println(user);                                         // asha a@example.com 30
        System.out.println(Config.getInstance() == Config.getInstance()); // true
    }
}`,
    },
    quiz: [
      {
        question: 'Which pattern suits an object with many optional constructor parameters?',
        options: ['Singleton', 'Builder', 'Observer', 'Adapter'],
        answer: 1,
        explanation: 'It replaces long constructors, and overloads for every combination, with named, chained calls.',
      },
      {
        question: 'What does the Factory pattern centralise?',
        options: ['The creation of objects, so callers need not know the concrete class', 'Logging', 'Thread scheduling', 'Database access'],
        answer: 0,
        explanation: 'The caller asks for a product, and the factory decides which implementation to return.',
      },
      {
        question: 'In the Observer pattern, what happens when the subject changes state?',
        options: ['The subject is destroyed', 'A new subject is created', 'Nothing happens until the observers poll it', 'Every registered observer is notified'],
        answer: 3,
        explanation: 'Event listeners and publish-subscribe systems are built on this pattern.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you implement a thread-safe singleton in Java?',
        answer: `The simplest safe forms rely on class initialisation, which the JVM performs once and thread-safely. Eager initialisation holds the instance in a <code>private static final</code> field. The holder idiom places it in a nested static class, so that it is created only on first use. An <code>enum</code> with a single constant is the most robust, since it is also safe against reflection and serialization. Double-checked locking works too but requires the field to be <code>volatile</code>.`,
      },
      {
        question: 'Why is the singleton sometimes called an anti-pattern?',
        answer: `A singleton is global state reached through a static method. Classes that use it hide that dependency, which makes them hard to test, because the singleton cannot easily be replaced with a fake, and state can leak from one test to the next. Dependency injection gives the same single shared instance without these problems: a container creates one object and passes it to whatever needs it, which is how Spring's default bean scope works.`,
      },
    ],
  },

  'build-tools-maven-basics': {
    whyItMatters: `No real Java project is compiled by hand. A build tool downloads the libraries, compiles, runs the tests and packages the result, the same way on every machine and on the build server. Maven is the most widely used one in enterprise Java, and reading a <code>pom.xml</code> is a skill needed from the first day in a job.`,
    exercise: {
      runnable: false,
      prompt: `This exercise needs Maven installed, so it does not run in the playground. Write a minimal <code>pom.xml</code> for a project with the group id <code>com.example</code>, the artifact id <code>demo</code> and the version <code>1.0-SNAPSHOT</code>, compiled for Java 17, with JUnit Jupiter 5.10.0 as a test-scoped dependency. Then give the command that deletes old build output, runs the tests and builds the JAR.

Expected result: the command ends with BUILD SUCCESS and creates target/demo-1.0-SNAPSHOT.jar.`,
      starterCode: `<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>

  <!-- TODO: groupId, artifactId, version -->

  <!-- TODO: properties for the Java version -->

  <!-- TODO: the JUnit Jupiter dependency, test scope -->
</project>

# TODO: the command that cleans, tests and packages`,
      hints: [
        'The Java version is set with the properties <code>maven.compiler.source</code> and <code>maven.compiler.target</code>.',
        'A dependency needs a group id, an artifact id and a version; <code>&lt;scope&gt;test&lt;/scope&gt;</code> keeps it out of the final JAR.',
      ],
      solution: `<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.example</groupId>
  <artifactId>demo</artifactId>
  <version>1.0-SNAPSHOT</version>

  <properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.10.0</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>

mvn clean package`,
    },
    quiz: [
      {
        question: 'Which three values identify a Maven artifact?',
        options: ['Name, author, licence', 'Package, class, method', 'groupId, artifactId and version', 'Host, port, path'],
        answer: 2,
        explanation: 'Together they are known as the coordinates of the artifact.',
      },
      {
        question: 'What does <code>mvn package</code> run?',
        options: ['Every phase of the default lifecycle up to and including package: validate, compile, test, package', 'Only the packaging step', 'Only the tests', 'The clean lifecycle'],
        answer: 0,
        explanation: 'Asking for a phase runs all the phases before it.',
      },
      {
        question: 'Where does Maven keep downloaded dependencies?',
        options: ['In the project\'s src folder', 'In the local repository, by default the .m2 folder in the user\'s home directory', 'In the JDK folder', 'In target'],
        answer: 1,
        explanation: 'They are downloaded once from Maven Central and reused by every project.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Explain the Maven build lifecycle.',
        answer: `Maven has three lifecycles: <code>clean</code>, <code>default</code> and <code>site</code>. The default lifecycle is a fixed sequence of phases, the main ones being <code>validate</code>, <code>compile</code>, <code>test</code>, <code>package</code>, <code>verify</code>, <code>install</code> and <code>deploy</code>. Running a phase executes every phase before it, so <code>mvn install</code> compiles, tests, packages and then copies the artifact to the local repository.`,
      },
      {
        question: 'What are dependency scopes in Maven?',
        answer: `A scope says when a dependency is needed. <code>compile</code>, the default, is available everywhere and is packaged. <code>provided</code> is needed to compile but supplied at runtime by the container, such as the servlet API. <code>runtime</code> is not needed to compile but is needed to run, such as a JDBC driver. <code>test</code> is available only to the tests. The scope also decides whether the dependency is passed on to projects that depend on yours.`,
      },
    ],
  },

  'build-tools-gradle-basics': {
    whyItMatters: `Gradle is the build tool of Android and of a growing share of server-side Java, including Spring's own projects. Its build files are code, not XML, which makes them shorter and more flexible, and its incremental builds are fast. You are as likely to open a project built with Gradle as with Maven.`,
    exercise: {
      runnable: false,
      prompt: `This exercise needs Gradle installed, so it does not run in the playground. Write a <code>build.gradle</code> in the Groovy DSL for a Java project: apply the Java plugin, use Maven Central, add JUnit Jupiter 5.10.0 for the tests, make the test task use the JUnit Platform, and register a custom task named <code>hello</code> that prints a message. Then give the commands that run the custom task and the full build.

Expected result: gradle hello prints the message, and gradle build compiles, tests and creates the JAR in build/libs.`,
      starterCode: `// TODO: plugins

// TODO: repositories

// TODO: dependencies

// TODO: test configuration

// TODO: the custom task hello

# TODO: the two commands`,
      hints: [
        'Test dependencies use the <code>testImplementation</code> configuration.',
        "A task is registered with <code>tasks.register('hello') { doLast { ... } }</code>.",
      ],
      solution: `plugins {
    id 'java'
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

test {
    useJUnitPlatform()
}

tasks.register('hello') {
    doLast {
        println 'Hello from Gradle'
    }
}

gradle hello
gradle build`,
    },
    quiz: [
      {
        question: 'In which languages can a Gradle build file be written?',
        options: ['XML only', 'Groovy or Kotlin', 'JSON', 'YAML'],
        answer: 1,
        explanation: 'build.gradle uses Groovy, and build.gradle.kts uses Kotlin.',
      },
      {
        question: 'What is the difference between <code>implementation</code> and <code>testImplementation</code>?',
        options: ['There is none', 'testImplementation is faster', 'implementation is for plugins', 'implementation is for the main code and is packaged; testImplementation is available only to the tests'],
        answer: 3,
        explanation: 'Keeping test libraries out of the main classpath keeps the final artifact small.',
      },
      {
        question: 'What is the Gradle wrapper, <code>gradlew</code>?',
        options: ['A script in the project that downloads and runs the exact Gradle version the project needs', 'A plugin for IDEs', 'A code formatter', 'A test runner'],
        answer: 0,
        explanation: 'Everyone, including the build server, then uses the same version without installing Gradle.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the main differences between Maven and Gradle?',
        answer: `Maven is configured declaratively in XML and follows a fixed lifecycle and strict conventions, which makes builds uniform and easy to understand. Gradle's build file is a script in Groovy or Kotlin, so it is shorter and can express custom logic. Gradle is usually faster, because it runs only the tasks whose inputs have changed, caches outputs and keeps a daemon running. Both use the same repositories and dependency coordinates.`,
      },
      {
        question: 'Why is Gradle often faster than Maven?',
        answer: `Gradle tracks the inputs and outputs of every task and skips a task whose inputs have not changed, marking it up to date. Its build cache can reuse outputs produced earlier, even on another machine. A long-lived daemon process avoids starting a new JVM for each build, and independent projects can be built in parallel. Maven, by default, re-runs the phases each time.`,
      },
    ],
  },

  'logging-in-java-applications': {
    whyItMatters: `When a production system misbehaves at three in the morning, the logs are the only account of what happened. <code>System.out.println</code> cannot be filtered by severity, switched off or routed to a file without changing code. A logging framework does all of this by configuration, and every professional Java application uses one.`,
    exercise: {
      prompt: `Using <code>java.util.logging</code>, create a logger whose level is INFO and whose handler writes to standard output in the form <code>LEVEL: message</code>. Log one message at each of the levels FINE, INFO and WARNING. The FINE message must not appear.

Expected output: <code>INFO: started</code> then <code>WARNING: disk almost full</code>`,
      starterCode: `import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import java.util.logging.StreamHandler;

public class LogLevels {
    public static void main(String[] args) {
        Logger logger = Logger.getLogger("app");
        logger.setUseParentHandlers(false); // do not also print through the default handler

        StreamHandler handler = new StreamHandler(System.out, new Formatter() {
            @Override
            public String format(LogRecord record) {
                // TODO: return "LEVEL: message" followed by a line separator
                return "";
            }
        });
        logger.addHandler(handler);

        // TODO: set the logger's level to INFO

        logger.fine("details for developers");
        logger.info("started");
        logger.warning("disk almost full");

        handler.flush();
    }
}`,
      hints: [
        'The record provides <code>getLevel()</code> and <code>getMessage()</code>; end the line with <code>System.lineSeparator()</code>.',
        '<code>logger.setLevel(Level.INFO)</code> discards anything less severe, such as FINE.',
      ],
      solution: `import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import java.util.logging.StreamHandler;

public class LogLevels {
    public static void main(String[] args) {
        Logger logger = Logger.getLogger("app");
        logger.setUseParentHandlers(false); // do not also print through the default handler

        StreamHandler handler = new StreamHandler(System.out, new Formatter() {
            @Override
            public String format(LogRecord record) {
                return record.getLevel() + ": " + record.getMessage() + System.lineSeparator();
            }
        });
        logger.addHandler(handler);

        logger.setLevel(Level.INFO);

        logger.fine("details for developers");
        logger.info("started");
        logger.warning("disk almost full");

        handler.flush();
    }
}`,
    },
    quiz: [
      {
        question: 'What is SLF4J?',
        options: ['A database driver', 'A build tool', 'A logging facade: an API that application code calls, with the actual logging done by an implementation such as Logback', 'A test framework'],
        answer: 2,
        explanation: 'The implementation can be changed without touching the code that logs.',
      },
      {
        question: 'A logger is set to the level WARN. Which messages are written?',
        options: ['WARN and ERROR', 'All messages', 'DEBUG and INFO', 'Only WARN'],
        answer: 0,
        explanation: 'A logger writes messages at its own level and above.',
      },
      {
        question: 'Why write <code>log.debug("User {} logged in", name)</code> instead of joining strings with +?',
        options: ['It is required by the compiler', 'The message is built only if debug logging is enabled, saving work when it is not', 'It encrypts the name', 'It writes to a different file'],
        answer: 1,
        explanation: 'With concatenation the string is built every time, even when the message is then discarded.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the standard log levels and when is each used?',
        answer: `<code>ERROR</code>: something failed and needs attention. <code>WARN</code>: something unexpected happened, but the application carried on. <code>INFO</code>: significant normal events, such as start-up or a completed job. <code>DEBUG</code>: detail useful while developing or diagnosing. <code>TRACE</code>: very fine detail. Production usually runs at INFO, with DEBUG enabled temporarily for a package under investigation.`,
      },
      {
        question: 'What should never be written to logs?',
        answer: `Passwords, authentication tokens, API keys, full card numbers and other personal data. Logs are stored for a long time, copied to other systems and read by many people, so anything written there is effectively disclosed. Sensitive values are omitted or masked, and identifiers such as a user id or a request id are logged instead, which is enough to trace what happened.`,
      },
    ],
  },

  'unit-testing-with-junit': {
    whyItMatters: `Code that has no tests can be verified only by running the application and clicking through it. Unit tests check behaviour in milliseconds on every change, which is what makes refactoring safe. JUnit is the standard in Java, and writing tests is part of the job in practically every team.`,
    exercise: {
      runnable: false,
      prompt: `This exercise needs JUnit 5 on the classpath, through Maven or Gradle, so it does not run in the playground. For the <code>Calculator</code> class given, write a test class with two tests: one checking that 10 divided by 2 is 5, and one checking that dividing by zero throws <code>ArithmeticException</code>. Create a fresh calculator before each test.

Expected result: the build tool reports two tests passed.`,
      starterCode: `class Calculator {
    int divide(int a, int b) {
        return a / b;
    }
}

// CalculatorTest.java
// TODO: imports from org.junit.jupiter.api

class CalculatorTest {
    // TODO: a Calculator field, initialised before each test

    // TODO: test that divide(10, 2) returns 5

    // TODO: test that divide(1, 0) throws ArithmeticException
}`,
      hints: [
        'A method annotated with <code>@BeforeEach</code> runs before every test method.',
        '<code>assertThrows(ArithmeticException.class, () -&gt; calculator.divide(1, 0))</code> passes only if that exception is thrown.',
      ],
      solution: `class Calculator {
    int divide(int a, int b) {
        return a / b;
    }
}

// CalculatorTest.java
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CalculatorTest {
    private Calculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new Calculator();
    }

    @Test
    void dividesTwoNumbers() {
        assertEquals(5, calculator.divide(10, 2));
    }

    @Test
    void throwsWhenDividingByZero() {
        assertThrows(ArithmeticException.class, () -> calculator.divide(1, 0));
    }
}`,
    },
    quiz: [
      {
        question: 'In <code>assertEquals(a, b)</code>, which argument comes first?',
        options: ['The actual value', 'The message', 'The tolerance', 'The expected value'],
        answer: 3,
        explanation: 'Getting the order right makes the failure message read correctly.',
      },
      {
        question: 'When does a method annotated with <code>@BeforeEach</code> run?',
        options: ['Once before all the tests', 'Before every test method', 'After every test method', 'Only when a test fails'],
        answer: 1,
        explanation: '@BeforeAll is the one that runs once for the whole class.',
      },
      {
        question: 'Which assertion checks that code throws a particular exception?',
        options: ['assertThrows', 'assertFails', 'assertError', 'expectException'],
        answer: 0,
        explanation: 'It also returns the exception, so its message can be checked.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What makes a good unit test?',
        answer: `It tests one behaviour and has a name that states it. It is fast, so that thousands can run on every change. It is independent of other tests and of their order, and deterministic, giving the same result every time, with no dependence on the network, the clock or a database. It follows a clear arrange, act, assert structure, and it fails for one reason only, so a failure points directly at the cause.`,
      },
      {
        question: 'What is the difference between JUnit 4 and JUnit 5?',
        answer: `JUnit 5 is modular, made of the Platform, the Jupiter API and the Vintage engine for old tests. Its annotations were renamed: <code>@BeforeEach</code> and <code>@AfterEach</code> replace <code>@Before</code> and <code>@After</code>, and <code>@BeforeAll</code> replaces <code>@BeforeClass</code>. It adds <code>assertThrows</code>, nested and parameterised tests, display names, and extensions in place of runners and rules. Test classes and methods no longer need to be public.`,
      },
    ],
  },

  'mockito-and-testing-spring-applications': {
    whyItMatters: `A service that calls a database or another API cannot be unit-tested as it stands: the test would be slow and would fail whenever the dependency was unavailable. A mock stands in for the dependency and returns what the test tells it to. Mockito is the standard tool for this in Java and is assumed knowledge in Spring projects.`,
    exercise: {
      runnable: false,
      prompt: `This exercise needs JUnit 5 and Mockito on the classpath, so it does not run in the playground. <code>UserService.displayName</code> looks a user up in <code>UserRepository</code> and returns the name in upper case, or <code>UNKNOWN</code> when there is no such user. Write a test that mocks the repository, stubs <code>findName(1L)</code> to return <code>asha</code>, checks the result, and verifies that the repository was called.

Expected result: the test passes without any database.`,
      starterCode: `import java.util.Optional;

interface UserRepository {
    Optional<String> findName(long id);
}

class UserService {
    private final UserRepository repository;

    UserService(UserRepository repository) {
        this.repository = repository;
    }

    String displayName(long id) {
        return repository.findName(id).map(String::toUpperCase).orElse("UNKNOWN");
    }
}

// UserServiceTest.java
// TODO: a test class using MockitoExtension, a mocked repository and the service under test`,
      hints: [
        '<code>@Mock</code> creates the fake and <code>@InjectMocks</code> builds the service with it; both need <code>@ExtendWith(MockitoExtension.class)</code> on the class.',
        'Stub with <code>when(repository.findName(1L)).thenReturn(Optional.of("asha"))</code> and check the call with <code>verify(repository).findName(1L)</code>.',
      ],
      solution: `import java.util.Optional;

interface UserRepository {
    Optional<String> findName(long id);
}

class UserService {
    private final UserRepository repository;

    UserService(UserRepository repository) {
        this.repository = repository;
    }

    String displayName(long id) {
        return repository.findName(id).map(String::toUpperCase).orElse("UNKNOWN");
    }
}

// UserServiceTest.java
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository repository;

    @InjectMocks
    private UserService service;

    @Test
    void returnsTheNameInUpperCase() {
        when(repository.findName(1L)).thenReturn(Optional.of("asha"));

        assertEquals("ASHA", service.displayName(1L));

        verify(repository).findName(1L);
    }
}`,
    },
    quiz: [
      {
        question: 'What does a mock return from a method that has not been stubbed?',
        options: ['It throws an exception', 'It calls the real method', 'A default value: null, zero, false or an empty collection or Optional', 'A random value'],
        answer: 2,
        explanation: 'Behaviour is defined explicitly with when(...).thenReturn(...).',
      },
      {
        question: 'What does <code>verify(repository).save(user)</code> check?',
        options: ['That save was called with that argument', 'That save returned a value', 'That save is public', 'That save was never called'],
        answer: 0,
        explanation: 'It asserts on an interaction instead of on a returned value.',
      },
      {
        question: 'What is the difference between a mock and a spy?',
        options: ['There is none', 'A spy cannot be verified', 'A mock is slower', 'A mock is a complete fake; a spy wraps a real object and runs its real methods unless they are stubbed'],
        answer: 3,
        explanation: 'A spy is used when most of the real behaviour should be kept.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why use mocks in unit tests?',
        answer: `A unit test should check one class in isolation. Its real dependencies, such as a database, an HTTP client or an email sender, are slow, need infrastructure and can fail for unrelated reasons. A mock replaces the dependency with an object the test controls: it returns chosen values, can simulate errors that are hard to cause for real, and records calls so the test can verify them. The test is then fast and deterministic.`,
      },
      {
        question: 'What is the difference between @Mock and Spring\'s mock bean annotation?',
        answer: `<code>@Mock</code> is plain Mockito: it creates a mock in a unit test with no Spring context at all, which is the fastest kind of test. Spring's annotation, <code>@MockitoBean</code> in current versions and <code>@MockBean</code> in older ones, creates a mock and places it in the Spring application context, replacing the real bean. It is used in tests that start a context, such as <code>@WebMvcTest</code>, where the controller's collaborators must be faked.`,
      },
    ],
  },

  'packaging-and-deployment-jar-and-war': {
    whyItMatters: `Compiled classes are not what you hand to a server; an archive is. Knowing what is inside a JAR or a WAR, and what makes one runnable, explains the errors met on every first deployment: "no main manifest attribute" and <code>ClassNotFoundException</code>. Spring Boot's single runnable JAR builds directly on these ideas.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses the JDK command-line tools in a terminal, so it does not run in the playground. A project has one source file, <code>src/Main.java</code>, whose class <code>Main</code> has a <code>main</code> method. Write the commands that compile it into the folder <code>out</code>, package the compiled classes into <code>app.jar</code> with <code>Main</code> as the entry point, and run the JAR.

Expected result: the last command runs the program, with no "no main manifest attribute" error.`,
      starterCode: `# TODO: compile src/Main.java into the folder out

# TODO: create app.jar with Main as the entry point, from the contents of out

# TODO: run the JAR`,
      hints: [
        '<code>javac -d out</code> writes the class files into the given folder.',
        'In <code>jar cfe app.jar Main -C out .</code>, the <code>e</code> option records the entry point in the manifest.',
      ],
      solution: `javac -d out src/Main.java

jar cfe app.jar Main -C out .

java -jar app.jar`,
    },
    quiz: [
      {
        question: 'What must a JAR contain to be run with <code>java -jar</code>?',
        options: ['A web.xml file', 'A Main-Class entry in its manifest', 'A pom.xml file', 'At least two classes'],
        answer: 1,
        explanation: 'Without it, the JVM reports "no main manifest attribute".',
      },
      {
        question: 'Where do the compiled classes go inside a WAR file?',
        options: ['In the root folder', 'In META-INF', 'In WEB-INF/classes', 'In lib'],
        answer: 2,
        explanation: 'Library JARs go in WEB-INF/lib.',
      },
      {
        question: 'How is a Spring Boot application usually packaged?',
        options: ['As an executable JAR that contains an embedded server and all its dependencies', 'As a WAR that needs a separate server', 'As separate class files', 'As a ZIP of source code'],
        answer: 0,
        explanation: 'It is started with java -jar, with no application server to install.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a JAR and a WAR?',
        answer: `Both are ZIP archives. A JAR packages compiled classes and resources as a library or a standalone application, and is runnable when its manifest names a main class. A WAR packages a web application in the layout a servlet container expects: static files at the root, classes in <code>WEB-INF/classes</code>, libraries in <code>WEB-INF/lib</code>. A WAR is deployed into a server such as Tomcat, which provides the runtime.`,
      },
      {
        question: 'What is a fat JAR?',
        answer: `A fat JAR, or uber JAR, contains the application's own classes together with all of its dependencies, and in the case of Spring Boot an embedded web server as well. The whole application is one file started with <code>java -jar</code>, which suits containers and cloud deployment. A normal thin JAR holds only the project's classes and expects its dependencies to be supplied on the classpath.`,
      },
    ],
  },
}
