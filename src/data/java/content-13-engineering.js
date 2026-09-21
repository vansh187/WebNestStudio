// Java Engineering Practices module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content13Engineering = {
  'design-patterns-overview-singleton-factory-builder-observer': {
    title: 'Design Patterns Overview: Singleton, Factory, Builder, Observer',
    intro: `A design pattern is a proven, reusable solution to a recurring problem in object-oriented design — not a piece of code you copy, but a shape of a solution you adapt to your own classes. Patterns give teams a shared vocabulary: saying "just make it a Singleton" or "wrap that in a Builder" communicates an entire structural decision in a few words.

This lesson covers four of the most commonly used patterns in real Java codebases: Singleton (exactly one instance), Factory (centralized object creation), Builder (step-by-step construction of complex objects), and Observer (notifying dependents automatically when state changes). Each solves a different problem, and recognizing which one fits is more valuable than memorizing the code by rote.`,
    sections: [
      {
        heading: 'Singleton — Exactly One Instance',
        body: `The Singleton pattern ensures a class has only one instance for the entire application and provides a single global access point to it. It is implemented with a private constructor (so outside code cannot call <code>new</code>), a private static field holding the one instance, and a public static method that returns it. Singletons are commonly used for things like configuration objects, connection pools, or loggers where having two competing instances would cause bugs.`,
        list: [
          'A naive Singleton (lazy initialization without synchronization) is <strong>not thread-safe</strong> — two threads can both see the field as null and each construct a separate instance.',
          'Common fixes: synchronize the accessor method, use double-checked locking with a <code>volatile</code> field, or simply initialize the field eagerly at class-loading time (the JVM guarantees class initialization is thread-safe).',
          'Overuse of Singleton is a real code smell — it introduces hidden global state and makes unit testing harder, since tests cannot easily substitute a mock instance.',
        ],
      },
      {
        heading: 'Factory — Centralizing Object Creation',
        body: `The Factory pattern moves the logic of "which concrete class to instantiate" out of client code and into one dedicated method or class. Instead of scattering <code>new CreditCardPayment()</code> or <code>new PaypalPayment()</code> calls everywhere, calling code asks a factory for a "Payment" and receives the correct concrete type based on some input. This decouples client code from concrete classes — clients only depend on an interface or abstract type, so adding a new payment method later means changing the factory, not every call site.`,
      },
      {
        heading: 'Builder — Constructing Complex Objects Step by Step',
        body: `The Builder pattern solves the problem of constructors with too many parameters (sometimes called the "telescoping constructor" problem), especially when many of those parameters are optional. Instead of one constructor with ten parameters where most are unused, a Builder exposes fluent, chainable methods like <code>.name(...)</code> and <code>.age(...)</code>, each returning the builder itself, ending with a <code>.build()</code> call that produces an immutable, fully-constructed object.`,
      },
      {
        heading: 'Observer — Publish-Subscribe Notifications',
        body: `The Observer pattern defines a one-to-many dependency: when one object (the "subject" or "publisher") changes state, all of its registered dependents (the "observers" or "listeners") are notified automatically. This is the foundation behind GUI event listeners, messaging systems, and reactive libraries. The subject keeps a list of observers and calls a notification method on each of them whenever a relevant change occurs, without needing to know anything about what the observers actually do with that notification.`,
      },
    ],
    examples: [
      {
        caption: 'Thread-safe Singleton using eager initialization, plus a simple Factory',
        code: `class AppConfig {
    // Eager initialization: the JVM loads the class (and this field) only once,
    // and class loading itself is thread-safe, so no extra synchronization is needed.
    private static final AppConfig INSTANCE = new AppConfig();

    private String environment = "production";

    private AppConfig() { } // private constructor blocks "new AppConfig()" elsewhere

    public static AppConfig getInstance() {
        return INSTANCE;
    }

    public String getEnvironment() {
        return environment;
    }
}

interface Notifier {
    void send(String message);
}

class EmailNotifier implements Notifier {
    public void send(String message) { System.out.println("Email: " + message); }
}

class SmsNotifier implements Notifier {
    public void send(String message) { System.out.println("SMS: " + message); }
}

class NotifierFactory {
    static Notifier create(String type) {
        return switch (type) {
            case "email" -> new EmailNotifier();
            case "sms" -> new SmsNotifier();
            default -> throw new IllegalArgumentException("Unknown type: " + type);
        };
    }
}

public class PatternDemo {
    public static void main(String[] args) {
        System.out.println(AppConfig.getInstance().getEnvironment());
        Notifier notifier = NotifierFactory.create("sms");
        notifier.send("Order shipped");
    }
}`,
        output: `production
SMS: Order shipped`,
      },
      {
        caption: 'A fluent Builder and a minimal Observer (publish-subscribe)',
        code: `class User {
    private final String name;
    private final int age;
    private final String email;

    private User(Builder b) {
        this.name = b.name;
        this.age = b.age;
        this.email = b.email;
    }

    public String toString() {
        return name + " (" + age + ") <" + email + ">";
    }

    static class Builder {
        private String name;
        private int age;
        private String email;

        Builder name(String name) { this.name = name; return this; }
        Builder age(int age) { this.age = age; return this; }
        Builder email(String email) { this.email = email; return this; }
        User build() { return new User(this); }
    }
}

interface Observer {
    void update(double price);
}

class StockTicker {
    private final java.util.List<Observer> observers = new java.util.ArrayList<>();

    void subscribe(Observer o) { observers.add(o); }

    void setPrice(double price) {
        for (Observer o : observers) {
            o.update(price);
        }
    }
}

public class BuilderObserverDemo {
    public static void main(String[] args) {
        User user = new User.Builder().name("Asha").age(28).email("asha@webnest.dev").build();
        System.out.println(user);

        StockTicker ticker = new StockTicker();
        ticker.subscribe(price -> System.out.println("Dashboard sees price: " + price));
        ticker.subscribe(price -> System.out.println("Alert service sees price: " + price));
        ticker.setPrice(142.75);
    }
}`,
        output: `Asha (28) <asha@webnest.dev>
Dashboard sees price: 142.75
Alert service sees price: 142.75`,
      },
    ],
    commonMistakes: [
      'Writing a lazily-initialized Singleton without synchronization and assuming it is safe — under concurrent access, two threads can create two separate instances.',
      'Using Singleton as a substitute for proper dependency injection, which makes classes hard to unit test because a mock instance cannot easily be substituted.',
      'Making Builder fields mutable after <code>build()</code>, defeating the purpose of producing a safe, immutable object.',
      'Forgetting to unsubscribe an Observer, which causes memory leaks (the subject holds a reference to the observer forever) in long-lived applications.',
    ],
    keyPoints: [
      'Singleton guarantees one instance and one access point; eager initialization is the simplest thread-safe approach.',
      'Factory centralizes "which concrete class" decisions so client code depends only on an interface.',
      'Builder replaces telescoping constructors with a fluent, readable, immutable-object construction style.',
      'Observer implements publish-subscribe: a subject notifies all registered listeners automatically on state change.',
    ],
  },

  'build-tools-maven-basics': {
    title: 'Build Tools: Maven Basics',
    intro: `As soon as a Java project needs external libraries, a compilation step, packaging into a JAR, and repeatable builds across machines, manually running <code>javac</code> and <code>java</code> stops scaling. Maven is a build automation and dependency management tool built around a single configuration file, <code>pom.xml</code> (Project Object Model), that declares what your project needs and how to build it.

Maven's core philosophy is "convention over configuration": if you follow its standard project layout and naming rules, you get a working build with very little explicit configuration. This predictability is why so many Java projects, tutorials, and onboarding guides default to Maven.`,
    sections: [
      {
        heading: 'The pom.xml Structure',
        body: `Every Maven project has a <code>pom.xml</code> at its root describing the project's identity and dependencies.`,
        list: [
          '<code>groupId</code> — a reverse-domain-style identifier for the organization or project (e.g. <code>com.webnest</code>).',
          '<code>artifactId</code> — the name of this specific project or module (e.g. <code>order-service</code>).',
          '<code>version</code> — the project\'s version, often ending in <code>-SNAPSHOT</code> during active development.',
          '<code>&lt;dependencies&gt;</code> — the list of external libraries the project needs, each with its own groupId, artifactId, and version.',
          '<code>&lt;build&gt;</code> — plugin configuration controlling how compilation, testing, and packaging behave.',
        ],
      },
      {
        heading: 'Dependencies and the Central Repository',
        body: `Rather than manually downloading .jar files, you declare a dependency's coordinates (groupId, artifactId, version) in <code>pom.xml</code>, and Maven downloads it — along with any of its own transitive dependencies — from Maven Central, a shared public repository that hosts the vast majority of open-source Java libraries. Downloaded artifacts are cached locally in <code>~/.m2/repository</code>, so subsequent builds (even in other projects using the same library) don't re-download it.`,
      },
      {
        heading: 'The Maven Build Lifecycle',
        body: `Maven organizes work into a fixed sequence of phases; running a later phase automatically runs every earlier phase first. This is what makes a single command like <code>mvn package</code> reliably compile, test, and package in one predictable step.`,
        list: [
          '<code>validate</code> — checks the project structure and pom.xml are correct.',
          '<code>compile</code> — compiles the main source code (<code>src/main/java</code>) into <code>target/classes</code>.',
          '<code>test</code> — runs unit tests using a testing framework such as JUnit.',
          '<code>package</code> — bundles compiled code into a distributable format, usually a JAR or WAR, in <code>target/</code>.',
          '<code>install</code> — copies the packaged artifact into the local <code>~/.m2</code> repository so other local projects can depend on it.',
          '<code>deploy</code> — uploads the final artifact to a remote shared repository for other teams or environments to consume.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A minimal pom.xml declaring a JUnit dependency and running the lifecycle',
        code: `<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.webnest</groupId>
  <artifactId>order-service</artifactId>
  <version>1.0-SNAPSHOT</version>

  <properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
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

<!-- Terminal: mvn clean package -->`,
        output: `[INFO] --- compiler:compile ---
[INFO] --- surefire:test ---
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] --- jar:jar ---
[INFO] Building jar: target/order-service-1.0-SNAPSHOT.jar
[INFO] BUILD SUCCESS`,
      },
    ],
    commonMistakes: [
      'Forgetting that running "mvn package" also runs validate, compile, and test first — you cannot skip earlier phases in the lifecycle.',
      'Leaving a dependency\'s <code>scope</code> as the default (compile) when it is only needed for tests, bloating the final packaged artifact.',
      'Not understanding transitive dependencies — a declared library can silently pull in dozens of other jars, occasionally causing version conflicts.',
      'Editing files directly under <code>target/</code> — it is fully regenerated by the build and should never be hand-edited or committed to source control.',
    ],
    keyPoints: [
      'Maven uses pom.xml and "convention over configuration" to standardize Java builds.',
      'Dependencies are declared by coordinates (groupId, artifactId, version) and fetched from Maven Central into the local ~/.m2 cache.',
      'The build lifecycle runs in strict order: validate, compile, test, package, install, deploy.',
      'Running a later lifecycle phase always executes every phase before it.',
    ],
  },

  'build-tools-gradle-basics': {
    title: 'Build Tools: Gradle Basics',
    intro: `Gradle is a build automation tool that, like Maven, manages dependencies and orchestrates compiling, testing, and packaging — but it takes a different approach. Instead of a declarative XML file, Gradle build scripts are written in a real programming language: either Groovy (<code>build.gradle</code>) or Kotlin (<code>build.gradle.kts</code>). This makes Gradle scripts more flexible and often faster, at the cost of a steeper learning curve than Maven's fixed structure.

Gradle is the default build tool for Android development and is widely used in large, performance-sensitive Java and Kotlin projects, largely because of its incremental build and caching capabilities.`,
    sections: [
      {
        heading: 'Anatomy of a build.gradle File',
        body: `A Gradle build script typically applies plugins, declares dependency repositories, and lists dependencies — conceptually similar to a Maven pom.xml, but expressed as executable code rather than a fixed XML schema.`,
        list: [
          '<code>plugins { }</code> — applies build capabilities, such as the <code>java</code> or <code>application</code> plugin.',
          '<code>repositories { }</code> — declares where to fetch dependencies from, commonly <code>mavenCentral()</code>.',
          '<code>dependencies { }</code> — lists libraries using configurations like <code>implementation</code>, <code>testImplementation</code>, and <code>runtimeOnly</code>.',
          '<code>tasks</code> — Gradle work is organized into tasks (compileJava, test, jar, build), and you can define custom tasks directly in the script.',
        ],
      },
      {
        heading: 'Dependency Configurations',
        body: `Gradle's dependency configurations are more expressive than Maven's scopes. <code>implementation</code> is the standard choice for a dependency your code needs at compile and runtime, but that consumers of your library don't need to see on their own compile classpath (this speeds up compilation for large multi-module projects). <code>api</code> exposes a dependency to consumers as well. <code>testImplementation</code> is scoped only to test source sets, mirroring Maven's <code>test</code> scope.`,
      },
      {
        heading: 'Gradle vs. Maven: Flexibility and Performance',
        body: `Maven's XML is declarative and rigid by design — every project of a given type looks structurally similar, which makes it easy to read but harder to customize. Gradle's script-based approach lets you write conditional logic, custom tasks, and multi-project build logic directly, which is powerful for complex builds but means two Gradle projects can look quite different from each other. Performance-wise, Gradle's incremental builds, build cache, and daemon process (a long-running background JVM that avoids repeated JVM startup cost) generally make repeated builds noticeably faster than Maven, especially on large codebases with many modules.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal build.gradle (Groovy DSL) with dependencies and a custom task',
        code: `plugins {
    id 'java'
    id 'application'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'com.google.guava:guava:33.0.0-jre'
    testImplementation platform('org.junit:junit-bom:5.10.0')
    testImplementation 'org.junit.jupiter:junit-jupiter'
}

application {
    mainClass = 'com.webnest.orders.Main'
}

test {
    useJUnitPlatform()
}

tasks.register('printVersion') {
    doLast {
        println "Building version " + project.version
    }
}

// Terminal: gradle build`,
        output: `> Task :compileJava
> Task :test
> Task :jar
> Task :build

BUILD SUCCESSFUL in 2s
5 actionable tasks: 5 executed`,
      },
    ],
    commonMistakes: [
      'Using <code>implementation</code> when a dependency truly needs to be exposed to consumers of a library module — that requires <code>api</code> instead.',
      'Assuming build.gradle syntax is identical between the Groovy DSL and the Kotlin DSL — method calls, string quoting, and typing rules differ between the two.',
      'Ignoring Gradle daemon warnings or disabling the daemon in CI without understanding the performance trade-off it introduces.',
      'Writing overly clever custom task logic in build.gradle that becomes hard for teammates to reason about — Gradle\'s flexibility is a double-edged sword.',
    ],
    keyPoints: [
      'Gradle build scripts are real code (Groovy or Kotlin DSL), unlike Maven\'s declarative XML.',
      'Dependencies are declared under configurations like implementation, api, and testImplementation.',
      'Gradle favors flexibility and incremental build performance; Maven favors convention and predictability.',
      'Both tools resolve dependencies from repositories such as Maven Central.',
    ],
  },

  'logging-in-java-applications': {
    title: 'Logging in Java Applications',
    intro: `Every serious Java application needs a way to record what it is doing — not for the developer sitting at a terminal, but for diagnosing problems in production, days or weeks after an incident, when no debugger is attached. <code>System.out.println</code> feels convenient during learning, but it is unsuitable for real applications: it cannot be turned off selectively, it always writes to standard output with no timestamps or severity information, it cannot be routed to a file or a log-aggregation system, and it has no concept of which part of the application produced the message.

A proper logging framework solves all of this: it lets you tag each message with a severity level, filter what gets recorded without changing code, attach context like timestamps and thread names, and send output to multiple destinations (console, rotating files, remote log collectors) at once.`,
    sections: [
      {
        heading: 'Log Levels',
        body: `Logging frameworks categorize messages by severity, and each logger has a configured threshold — only messages at or above that threshold are actually recorded, everything below is silently dropped.`,
        list: [
          '<code>TRACE</code> — extremely fine-grained detail, rarely enabled outside of deep debugging sessions.',
          '<code>DEBUG</code> — diagnostic information useful during development, such as variable values and control-flow decisions.',
          '<code>INFO</code> — high-level events confirming the application is working as expected (a service started, a job completed).',
          '<code>WARN</code> — something unexpected happened, but the application can continue running.',
          '<code>ERROR</code> — a serious problem occurred, typically an operation failed and needs attention.',
        ],
      },
      {
        heading: 'java.util.logging (JUL)',
        body: `Java ships with a built-in logging API, <code>java.util.logging</code>, available in every JDK with no extra dependency. You obtain a <code>Logger</code> via <code>Logger.getLogger(ClassName.class.getName())</code> and call methods like <code>.info()</code>, <code>.warning()</code>, and <code>.severe()</code>. It works, but its configuration API is verbose, its default output format is unpopular with many teams, and its feature set (log rotation, structured output, integrations) lags behind third-party alternatives.`,
      },
      {
        heading: 'SLF4J and Logback: The Practical Standard',
        body: `In real-world Java projects, the de facto standard is to code against <strong>SLF4J</strong> (Simple Logging Facade for Java) — a thin, framework-agnostic logging API — and plug in <strong>Logback</strong> as the actual implementation that writes the logs. This separation matters: your code and any libraries you use only depend on the SLF4J interface, so you can swap the underlying logging implementation (Logback, Log4j2, or others) without touching application code. SLF4J also supports parameterized messages (<code>logger.info("User {} logged in", userId)</code>), which avoid the cost of string concatenation when a log level is disabled.`,
      },
    ],
    examples: [
      {
        caption: 'java.util.logging vs. SLF4J + Logback for the same event',
        code: `import java.util.logging.Logger;

public class BuiltInLoggingDemo {
    private static final Logger logger = Logger.getLogger(BuiltInLoggingDemo.class.getName());

    public static void main(String[] args) {
        logger.info("Application starting");
        logger.warning("Cache miss for key: user_42");
    }
}

// --- With SLF4J + Logback (typical dependency: org.slf4j:slf4j-api, ch.qos.logback:logback-classic) ---

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    void processOrder(String orderId) {
        logger.info("Processing order {}", orderId);
        try {
            // ... order logic ...
        } catch (Exception e) {
            logger.error("Failed to process order {}", orderId, e);
        }
    }
}`,
        output: `Sep 21, 2026 10:02:11 AM BuiltInLoggingDemo main
INFO: Application starting
Sep 21, 2026 10:02:11 AM BuiltInLoggingDemo main
WARNING: Cache miss for key: user_42

10:02:11.412 [main] INFO  OrderService - Processing order ORD-1001`,
      },
    ],
    commonMistakes: [
      'Leaving System.out.println calls scattered through production code with no way to disable or filter them.',
      'Logging at ERROR level for routine, expected conditions, which trains teams to ignore alerts ("alert fatigue").',
      'Building log messages with string concatenation (<code>"User " + id + " logged in"</code>) instead of parameterized messages, doing unnecessary work even when the log level is disabled.',
      'Logging sensitive data (passwords, full credit card numbers, personal information) in plain text log files.',
    ],
    keyPoints: [
      'System.out.println lacks severity levels, filtering, timestamps, and configurable output destinations — unsuitable for production.',
      'Standard levels from least to most severe: TRACE, DEBUG, INFO, WARN, ERROR.',
      'java.util.logging is built into the JDK but is less feature-rich than third-party alternatives.',
      'SLF4J (facade) + Logback (implementation) is the practical industry standard for Java logging.',
    ],
  },

  'unit-testing-with-junit': {
    title: 'Unit Testing with JUnit',
    intro: `A unit test verifies that a single, small piece of code — typically one method — behaves correctly in isolation. JUnit is the dominant testing framework in the Java ecosystem, and JUnit 5 (also called JUnit Jupiter) is its current generation, built around annotations that mark methods as tests and assertions that check expected outcomes.

Tests matter because they turn "I think this still works" into "I know this still works." Without automated tests, verifying that a change hasn't broken existing behavior means manually re-checking the application by hand, which does not scale and is easy to skip under deadline pressure. A solid test suite catches regressions the moment they're introduced, often before the code is even committed.`,
    sections: [
      {
        heading: 'Core JUnit 5 Annotations',
        body: `JUnit 5 tests are ordinary methods marked with annotations that tell the test runner how and when to invoke them.`,
        list: [
          '<code>@Test</code> — marks a method as a test case to be executed by the JUnit runner.',
          '<code>@BeforeEach</code> — runs before every test method in the class, commonly used to set up fresh test fixtures so tests don\'t leak state between each other.',
          '<code>@AfterEach</code> — runs after every test method, often used for cleanup.',
          '<code>@BeforeAll</code> / <code>@AfterAll</code> — run once before/after all tests in the class (must be static methods).',
          '<code>@DisplayName</code> — gives a test a readable, human-friendly name in test reports.',
        ],
      },
      {
        heading: 'Assertions',
        body: `Assertions, from the <code>org.junit.jupiter.api.Assertions</code> class, are what actually determine pass or fail. <code>assertEquals(expected, actual)</code> checks two values match. <code>assertTrue</code> / <code>assertFalse</code> check a boolean condition. <code>assertThrows(ExceptionType.class, () -> { ... })</code> verifies that a block of code throws a specific exception — essential for testing error-handling paths, not just happy paths. If an assertion fails, JUnit stops that test method and reports it as a failure with a clear expected-vs-actual message.`,
      },
      {
        heading: 'The Arrange-Act-Assert Pattern',
        body: `Well-structured unit tests follow a consistent three-part shape. <strong>Arrange</strong>: set up the objects and inputs needed for the test. <strong>Act</strong>: call the method under test. <strong>Assert</strong>: check that the outcome matches expectations. Keeping these three steps visually separate (often with blank lines) makes tests easy to read at a glance, even for someone unfamiliar with the codebase, and keeps each test focused on verifying one specific behavior.`,
      },
    ],
    examples: [
      {
        caption: 'A JUnit 5 test class covering a normal case and an exception case',
        code: `// src/main/java/com/webnest/math/Calculator.java
package com.webnest.math;

public class Calculator {
    public int divide(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("Cannot divide by zero");
        }
        return a / b;
    }
}

// src/test/java/com/webnest/math/CalculatorTest.java
package com.webnest.math;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    private Calculator calculator;

    @BeforeEach
    void setUp() {
        // Arrange (shared setup): a fresh Calculator before every test
        calculator = new Calculator();
    }

    @Test
    void dividesTwoPositiveNumbers() {
        // Act
        int result = calculator.divide(10, 2);

        // Assert
        assertEquals(5, result);
    }

    @Test
    void throwsWhenDividingByZero() {
        assertThrows(ArithmeticException.class, () -> calculator.divide(10, 0));
    }
}`,
        output: `CalculatorTest
  ✔ dividesTwoPositiveNumbers()
  ✔ throwsWhenDividingByZero()

Tests run: 2, Failures: 0, Errors: 0, Skipped: 0`,
      },
    ],
    commonMistakes: [
      'Writing a test that depends on the outcome or side effects of another test running first, making the suite fragile and order-dependent.',
      'Testing only the "happy path" and never verifying that invalid input or edge cases correctly throw exceptions or return error results.',
      'Naming tests vaguely (test1, testMethod) instead of describing the behavior being verified, making failures hard to interpret.',
      'Asserting too many unrelated things in a single test method, so a failure doesn\'t clearly point to what actually broke.',
    ],
    keyPoints: [
      '@Test marks a test method; @BeforeEach/@AfterEach set up and tear down fixtures around each test.',
      'assertEquals, assertTrue, and assertThrows are core assertions for verifying expected outcomes, including expected exceptions.',
      'The Arrange-Act-Assert pattern keeps tests readable and focused on one behavior at a time.',
      'A solid test suite catches regressions automatically, which is far more reliable than manual re-checking.',
    ],
  },

  'packaging-and-deployment-jar-and-war': {
    title: 'Packaging and Deployment: JAR and WAR',
    intro: `Once a Java application is written and tested, it needs to be packaged into a distributable form that can run on another machine — a teammate's laptop, a test server, or production infrastructure. Java defines standard archive formats for this, and the two you'll encounter constantly are JAR (Java ARchive) and WAR (Web ARchive).

Both are, structurally, just ZIP files with a specific internal layout and a required metadata file. The difference is what they're meant to contain and where they're meant to run.`,
    sections: [
      {
        heading: 'JAR — Java ARchive',
        body: `A JAR bundles compiled <code>.class</code> files, resources (property files, images, config), and a manifest file (<code>META-INF/MANIFEST.MF</code>) into a single distributable file. JARs are used both for reusable libraries (something other projects depend on, with no way to "run" it directly) and for standalone runnable applications.`,
        list: [
          'A <strong>library JAR</strong> is meant to be placed on another program\'s classpath or declared as a Maven/Gradle dependency.',
          'A <strong>runnable JAR</strong> includes a <code>Main-Class</code> entry in its manifest, so it can be executed directly with <code>java -jar app.jar</code> without specifying the entry class on the command line.',
          'A "fat" or "uber" JAR bundles the application\'s own classes together with all of its dependencies\' classes, so it can run standalone with no external classpath setup.',
        ],
      },
      {
        heading: 'WAR — Web ARchive',
        body: `A WAR packages a Java web application — servlets, JSPs, static assets, and web-specific configuration (<code>WEB-INF/web.xml</code> or its modern annotation-based equivalent) — in a structure that a servlet container understands. Unlike a plain JAR, a WAR is not run with <code>java -jar</code>; it is deployed into a servlet container such as Apache Tomcat, Jetty, or WildFly, which unpacks it, wires up the servlets, and manages the application's web lifecycle (handling HTTP requests, session management, and so on).`,
      },
      {
        heading: 'Choosing Between Them',
        body: `The choice generally isn't really a choice you make freely — it follows from the architecture. A command-line tool, a batch job, a microservice with an embedded HTTP server (such as one built with embedded Tomcat inside Spring Boot), or a shared library is packaged as a JAR. A traditional web application meant to be deployed into an externally managed servlet container is packaged as a WAR. Modern cloud-native Java increasingly favors runnable "fat" JARs with an embedded server over WARs deployed to a separate container, because it simplifies deployment to a single self-contained artifact.`,
      },
    ],
    examples: [
      {
        caption: 'Building and running a runnable JAR with a manifest Main-Class entry',
        code: `// Compile
// javac -d out src/com/webnest/App.java

package com.webnest;

public class App {
    public static void main(String[] args) {
        System.out.println("Running from a JAR file");
    }
}

// Create a manifest file, manifest.txt, containing:
// Main-Class: com.webnest.App
//
// Package into a runnable JAR:
// jar cfm app.jar manifest.txt -C out .
//
// Run it directly, no classpath flags needed:
// java -jar app.jar`,
        output: 'Running from a JAR file',
      },
      {
        caption: 'A minimal WAR directory layout for a servlet container',
        code: `my-webapp.war
├── index.html
├── css/
│   └── styles.css
└── WEB-INF/
    ├── web.xml                 (servlet mappings, or omitted if using annotations)
    ├── classes/
    │   └── com/webnest/HelloServlet.class
    └── lib/
        └── some-dependency.jar

// Deployed by copying my-webapp.war into Tomcat's webapps/ directory.
// Tomcat unpacks it and serves it at: http://localhost:8080/my-webapp/`,
        output: `INFO: Deploying web application archive [my-webapp.war]
INFO: Deployment of web application archive [my-webapp.war] has finished`,
      },
    ],
    commonMistakes: [
      'Trying to run a WAR file directly with "java -jar" — a WAR must be deployed into a servlet container, it has no standalone entry point.',
      'Forgetting the Main-Class entry in a JAR\'s manifest and then being unable to run it with "java -jar", requiring the class name to be specified manually on the classpath instead.',
      'Assuming a plain JAR automatically includes its dependencies — without building a "fat" JAR (via a plugin like Maven Shade or the Gradle Shadow plugin), dependency classes are not bundled in.',
      'Placing web-specific files (web.xml, JSPs) outside the required WEB-INF structure, so the servlet container cannot find them.',
    ],
    keyPoints: [
      'JAR bundles compiled classes and resources for libraries or standalone runnable applications.',
      'A runnable JAR needs a Main-Class entry in its manifest to work with "java -jar".',
      'WAR packages a full web application (servlets, JSPs, WEB-INF) for deployment into a servlet container like Tomcat.',
      'Modern services increasingly favor self-contained "fat" JARs with an embedded server over externally deployed WARs.',
    ],
  },
}
