// Extra "getting started / environment setup" and market-trend lessons
// for the Spring Framework, Spring Boot, and Python courses.
// Structure mirrors src/data/java/content-01-basics.js exactly.

export const springFrameworkExtra = {
  'setting-up-a-spring-project': {
    title: 'Setting Up a Spring Project',
    intro: `Before you can write a single line of Spring code, you need a working Java Development Kit, a build tool that manages dependencies, and a way to bring the Spring libraries into your project. Spring itself is just a set of JAR files — there is no special installer for "Spring" the way there is for a database or an application server. Getting the environment right the first time saves hours of confusing classpath errors later.

This lesson walks through installing a JDK, choosing between Maven and Gradle, pulling in the spring-context dependency (the core of the Spring IoC container), setting up an IDE, and writing a minimal Spring application that creates an ApplicationContext and retrieves a bean from it — all without Spring Boot's auto-configuration, so you can see exactly what is happening underneath.`,
    sections: [
      {
        heading: 'Installing a JDK',
        body: `Spring 6.x and later require Java 17 or newer as a minimum baseline, so the first step is installing a JDK, not just a JRE, since you need the compiler. Popular distributions include Eclipse Temurin, Amazon Corretto, and Oracle's own JDK builds; any of them works fine for learning Spring, since they all implement the same Java SE specification.`,
        list: [
          'Download a JDK 17+ build (Temurin is a common free choice) and install it for your OS.',
          'Verify the install by running <code>java -version</code> and <code>javac -version</code> in a terminal — both should report the same major version.',
          'Set the <code>JAVA_HOME</code> environment variable to the JDK install directory; Maven and Gradle both read it.',
        ],
      },
      {
        heading: 'Choosing Maven or Gradle',
        body: `Spring projects are almost always built with either Maven (declarative XML in <code>pom.xml</code>) or Gradle (a Groovy or Kotlin DSL in <code>build.gradle</code>). Both do the same job: they download dependencies from Maven Central, compile your code, run tests, and package the result into a JAR or WAR. Maven is more common in enterprise Spring shops and has a gentler, more predictable syntax; Gradle is faster on incremental builds and more flexible for custom build logic. For a first Spring project, Maven's straightforward structure is usually easier to reason about.`,
      },
      {
        heading: 'Adding the spring-context Dependency',
        body: `The core Spring IoC container lives in the <code>spring-context</code> artifact (group ID <code>org.springframework</code>). Adding it to your Maven or Gradle build file pulls in <code>spring-core</code>, <code>spring-beans</code>, and <code>spring-context</code> transitively — everything needed to create an ApplicationContext, define beans, and wire dependencies between them. You do not need Spring Boot to use Spring; Spring Boot is a separate convenience layer built on top of these same core modules.`,
        list: [
          'Maven: add a <code>&lt;dependency&gt;</code> block for <code>org.springframework:spring-context</code> with a matching version (e.g. 6.1.x).',
          'Gradle: add <code>implementation "org.springframework:spring-context:6.1.x"</code> to the dependencies block.',
          'Optionally add <code>spring-tx</code>, <code>spring-orm</code>, or <code>spring-web</code> later as your application grows beyond a plain console app.',
        ],
      },
      {
        heading: 'Using Spring Initializr and IDE Setup',
        body: `Spring Initializr (start.spring.io) is usually associated with Spring Boot, but it can also generate a plain project skeleton with just the core dependencies checked, which saves you from hand-writing the build file from scratch. For the IDE, IntelliJ IDEA (Community or Ultimate) has first-class Maven/Gradle import and Spring-aware code completion; Eclipse with the Spring Tools Suite (STS) plugin adds Spring-specific views like bean graphs and configuration validation. Either one will auto-import your build file's dependencies the moment you open the project folder — there is no separate "install Spring" step inside the IDE.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal pom.xml dependency block and a plain Spring application using annotation config',
        code: `<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>6.1.13</version>
    </dependency>
</dependencies>

// AppConfig.java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    @Bean
    public GreetingService greetingService() {
        return new GreetingService("Hello from Spring's IoC container");
    }
}

// GreetingService.java
public class GreetingService {
    private final String message;
    public GreetingService(String message) { this.message = message; }
    public void greet() { System.out.println(message); }
}

// MainApp.java
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class MainApp {
    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        GreetingService service = context.getBean(GreetingService.class);
        service.greet();
    }
}`,
        output: 'Hello from Spring\'s IoC container',
      },
    ],
    commonMistakes: [
      'Assuming Spring requires Spring Boot to run — the core container (spring-context) works perfectly well on its own, as shown above.',
      'Mixing incompatible Spring module versions (e.g. spring-core 6.x with spring-web 5.x), which causes obscure NoSuchMethodError exceptions at runtime.',
      'Forgetting to mark AppConfig with @Configuration and instead trying to pass a plain class to AnnotationConfigApplicationContext, which silently finds no beans.',
      'Installing a JRE instead of a JDK and then being unable to compile the project because there is no javac available.',
    ],
    keyPoints: [
      'Spring 6+ requires a JDK 17 or newer; install a full JDK, not just a JRE.',
      'Maven and Gradle both manage the spring-context dependency and its transitive modules; you do not download Spring JARs manually.',
      'Spring Initializr can scaffold a plain (non-Boot) Spring project too, not just Spring Boot ones.',
      'A minimal Spring app just needs a @Configuration class and an AnnotationConfigApplicationContext to start using dependency injection.',
    ],
  },

  'spring-reactive-programming-overview': {
    title: 'Spring Reactive Programming Overview',
    intro: `Traditional Spring MVC follows a thread-per-request model: each incoming HTTP request occupies one thread for its entire lifetime, including the time spent blocked while waiting on a database query, a downstream HTTP call, or disk I/O. That model works well until concurrency climbs into the thousands, at which point you either run out of threads or pay a heavy cost in context switching and memory (each thread reserves its own stack).

Reactive programming addresses this by making I/O non-blocking and asynchronous end to end, so a small, fixed pool of threads can serve a very large number of concurrent requests. Spring's reactive stack, built on Project Reactor and exposed through Spring WebFlux, is Spring's answer to this problem — but it is not a universal upgrade over Spring MVC, and this lesson covers both what it buys you and what it costs.`,
    sections: [
      {
        heading: 'Why Reactive Programming Exists',
        body: `Reactive systems are designed around one central idea: never block a thread waiting for something slow to finish. Instead of a thread sitting idle during a database call, that thread is released back to a shared pool immediately, and a callback (or a reactive operator chain) resumes the work once the data arrives. This lets a handful of threads handle tens of thousands of concurrent connections, which matters most for I/O-heavy services — API gateways, streaming data pipelines, and systems that fan out to many downstream services per request. Reactive streams also support backpressure: a slow consumer can signal an upstream producer to slow down, rather than being overwhelmed by data it cannot process fast enough.`,
      },
      {
        heading: 'Mono and Flux in Project Reactor',
        body: `Project Reactor is the reactive library Spring builds on, and it centers on two publisher types. A <code>Mono&lt;T&gt;</code> represents an asynchronous stream that emits at most one item (or an error, or completes with nothing) — conceptually similar to a CompletableFuture, but lazy and composable. A <code>Flux&lt;T&gt;</code> represents an asynchronous stream of zero to many items over time, like a reactive equivalent of a list or a stream of events. Neither type does any work until something subscribes to it; you build a pipeline of operators (map, filter, flatMap, and so on) declaratively, and the actual data only flows once a subscriber attaches, at which point the whole chain executes without blocking the calling thread.`,
        list: [
          '<code>Mono&lt;User&gt;</code> — represents "eventually one User, or nothing, or an error," e.g. the result of a lookup by ID.',
          '<code>Flux&lt;Order&gt;</code> — represents "a stream of Order objects arriving over time," e.g. results from a large query or a live event feed.',
          'Operators like <code>.map()</code>, <code>.filter()</code>, and <code>.flatMap()</code> transform the stream without ever calling <code>.get()</code> or blocking to retrieve a value.',
        ],
      },
      {
        heading: 'Reactive (WebFlux) vs Traditional Blocking (Spring MVC)',
        body: `Spring MVC handlers return plain objects or blocking types, and the servlet container assigns one thread per request for its full duration; this is simple to reason about and debug, and most relational database drivers are blocking anyway (JDBC is inherently synchronous), which limits how much benefit reactive brings unless your whole stack — including the database driver — is non-blocking. Spring WebFlux, in contrast, runs on a small event-loop thread pool (via Netty by default), and handler methods return Mono or Flux; the framework subscribes to them and writes the response as data becomes available, without ever parking a thread on I/O.`,
      },
      {
        heading: 'When Reactive Is (and Is Not) Worth It',
        body: `Reactive programming earns its complexity in genuinely high-concurrency, I/O-bound scenarios: gateways aggregating many downstream calls, streaming APIs, or services that need to scale to a very large number of simultaneous connections on limited hardware. It is usually not worth it for typical CRUD applications backed by a traditional relational database over blocking JDBC, where you would need R2DBC (a reactive database driver) to see any real benefit, and where the debugging difficulty of stack traces across asynchronous boundaries, combined with a smaller pool of developers fluent in reactive style, often outweighs the throughput gains. A common rule of thumb: default to Spring MVC, and reach for WebFlux only when you have measured a concrete concurrency bottleneck that non-blocking I/O would actually fix.`,
      },
    ],
    examples: [
      {
        caption: 'A simple Mono and Flux pipeline built with Project Reactor operators (no blocking calls)',
        code: `import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class ReactiveDemo {
    public static void main(String[] args) {
        Mono<String> mono = Mono.just("Alice")
                .map(name -> "Hello, " + name);
        mono.subscribe(System.out::println);

        Flux<Integer> flux = Flux.range(1, 5)
                .filter(n -> n % 2 == 0)
                .map(n -> n * 10);
        flux.subscribe(System.out::println);
    }
}`,
        output: `Hello, Alice
20
40`,
      },
    ],
    commonMistakes: [
      'Calling .block() on a Mono or Flux inside a WebFlux handler to "get the value out" — this defeats the entire purpose and can deadlock the small event-loop thread pool under load.',
      'Adopting WebFlux for a standard CRUD app on a blocking JDBC driver, gaining none of the non-blocking benefit while paying the full complexity cost.',
      'Assuming a Mono or Flux pipeline executes as soon as it is built — nothing happens until something subscribes to it.',
      'Treating reactive code as a drop-in performance upgrade rather than a different concurrency model that requires non-blocking drivers throughout the stack to pay off.',
    ],
    keyPoints: [
      'Reactive programming avoids blocking threads on I/O, letting a small thread pool serve very high concurrency, and supports backpressure between producer and consumer.',
      'Mono represents zero-or-one async result; Flux represents zero-to-many async results over time; both are lazy until subscribed.',
      'Spring MVC is thread-per-request and blocking; Spring WebFlux runs on an event loop and is non-blocking end to end, typically via Netty.',
      'Reactive is worth the complexity for high-concurrency, I/O-bound workloads with non-blocking drivers throughout — not a default upgrade for typical blocking, JDBC-backed applications.',
    ],
  },
}

export const springBootExtra = {
  'spring-boot-3-and-graalvm-native-images': {
    title: 'Spring Boot 3 and GraalVM Native Images',
    intro: `Every Spring Boot application you have run so far starts on the JVM: the JVM loads your compiled bytecode, JIT-compiles hot code paths at runtime, and manages memory with garbage collection. This gives excellent long-running throughput, but it comes with a startup cost — the JVM has to warm up, and Spring itself has to scan the classpath, process annotations, and build the application context before the app can serve a single request. For a long-running server that stays up for days, a few seconds of startup barely matters. For a serverless function that spins up fresh for each burst of traffic, those seconds are a large fraction of the total cost.

GraalVM native images solve this by compiling your Spring Boot application ahead of time into a standalone native executable, and Spring Boot 3 added first-class support for producing one directly from your existing codebase. This lesson explains what a native image actually is, why it helps in cloud and serverless contexts, how Spring Boot 3 builds one via its AOT (ahead-of-time) processing, and the real trade-offs involved.`,
    sections: [
      {
        heading: 'What a GraalVM Native Image Is',
        body: `A GraalVM native image is a self-contained, platform-specific executable produced by compiling your Java application and all its dependencies ahead of time, rather than shipping bytecode for a JVM to interpret and JIT-compile later. The GraalVM <code>native-image</code> tool performs a closed-world static analysis: it traces every reachable code path from your application's entry point, decides what classes, methods, and reflection targets are actually used, and bakes only that reachable code into a single binary with its own minimal runtime and garbage collector built in. The result runs directly as an operating system process — there is no separate "java" launcher and no classpath scanning at startup, because everything was already resolved at build time.`,
      },
      {
        heading: 'Startup Time and Memory Benefits',
        body: `Because a native image skips class loading, bytecode verification, and JIT warm-up entirely, it typically starts in tens of milliseconds instead of the one-to-several seconds a typical Spring Boot JVM app needs, and it uses a fraction of the resident memory since there is no JVM metaspace or JIT compiler infrastructure running alongside it. These two properties matter enormously for cloud-native and serverless workloads: a function-as-a-service platform that bills per invocation and scales to zero benefits directly from near-instant cold starts, and a Kubernetes deployment that autoscales pods under bursty load can spin up new native-image instances almost immediately, rather than waiting for JVM warm-up before instances are ready to serve traffic.`,
      },
      {
        heading: "Spring Boot 3's Built-in Support via Spring AOT",
        body: `Before Spring Boot 3, making a Spring application compatible with GraalVM required substantial manual configuration, because Spring relies heavily on reflection, dynamic proxies, and runtime classpath scanning — all things a closed-world native-image build cannot discover on its own. Spring Boot 3 (paired with Spring Framework 6) introduced Spring AOT processing, which runs at build time and generates the reflection hints, proxy configurations, and bean definitions the native-image tool needs, effectively replacing the "guess what's needed at runtime" phase with an explicit, pre-computed set of instructions. Building a native image is triggered through the Spring Boot Gradle or Maven plugin (e.g. <code>mvn -Pnative native:compile</code>), which runs the AOT processing step and then invokes GraalVM's native-image compiler automatically.`,
        list: [
          'Spring AOT runs during the build and generates GraalVM reflection/proxy hints from your actual bean definitions.',
          'The Spring Boot Maven/Gradle native plugin orchestrates AOT processing plus the native-image compilation in one command.',
          'The output is a single native executable you can run directly or bake into a minimal container image with no JVM inside it.',
        ],
      },
      {
        heading: 'Trade-offs to Consider',
        body: `Native image compilation is expensive: builds that take seconds on the JVM can take several minutes with GraalVM, because the static analysis and ahead-of-time compilation over the whole reachable codebase is far more work than a normal javac compile. This makes native builds a poor fit for a fast local development inner loop — most teams keep using the regular JVM run for day-to-day development and only build a native image for production or CI. Additionally, libraries that rely heavily on runtime reflection, dynamic class generation, or classpath scanning that Spring AOT does not already know about may need extra manual configuration (reflection-config.json style hints) to work under native-image, and some libraries are not compatible with native images at all. Peak throughput after warm-up can also be somewhat lower on a native image than on a long-running, fully JIT-optimized JVM process, since the JIT compiler's runtime profile-guided optimizations are unavailable.`,
      },
    ],
    examples: [
      {
        caption: 'Building and running a Spring Boot 3 native image with Maven',
        code: `<!-- pom.xml already has spring-boot-starter-parent 3.x, which brings in the native profile -->

# Build the native executable (requires a GraalVM JDK on PATH)
mvn -Pnative native:compile

# Run the resulting binary directly, no JVM involved
./target/my-app

# Compare startup time against the regular JVM jar
java -jar target/my-app.jar`,
        output: `# Native image:
Started MyApp in 0.042 seconds (process running for 0.05)

# Regular JVM jar:
Started MyApp in 1.834 seconds (process running for 2.1)`,
      },
    ],
    commonMistakes: [
      'Using native-image builds during everyday local development, where the multi-minute build time destroys the fast feedback loop that the JVM run offers.',
      'Assuming any third-party library "just works" under native-image without checking whether it needs additional reflection or proxy configuration.',
      'Expecting a native image to always be faster overall — startup and memory improve substantially, but sustained peak throughput can be lower without JIT profile-guided optimization.',
      'Forgetting that a native executable is platform-specific — a binary built on Linux will not run on Windows or macOS, unlike a portable JVM jar.',
    ],
    keyPoints: [
      'A GraalVM native image ahead-of-time compiles a Spring Boot app into a standalone executable, skipping JVM class loading and JIT warm-up at startup.',
      'This dramatically reduces startup time and memory footprint, which is especially valuable for serverless and autoscaling cloud deployments.',
      'Spring Boot 3, via Spring AOT processing, generates the reflection and proxy hints GraalVM needs, making native builds practical without extensive manual configuration.',
      'The trade-offs are much longer build times and the possibility that reflection-heavy libraries need extra native-image configuration or are simply incompatible.',
    ],
  },
}

export const pythonExtra = {
  'setting-up-the-python-environment': {
    title: 'Setting Up the Python Environment',
    intro: `Before writing any Python code, you need Python itself installed, a way to confirm it is working correctly, and an editor or IDE that makes writing and running scripts comfortable. Unlike compiled languages, Python code can also be run interactively, line by line, which is one of the fastest ways to experiment with the language while learning it.

This lesson covers installing Python from python.org or a version manager, verifying the install from the terminal, choosing an editor, running a script as a file, and using the interactive REPL (Read-Eval-Print Loop) for quick experimentation.`,
    sections: [
      {
        heading: 'Installing Python',
        body: `The most direct route is downloading an installer from python.org for your operating system; on Windows, be sure to check "Add python.exe to PATH" during installation, since forgetting this is the single most common setup mistake. On macOS and Linux, Python 3 is often preinstalled or available via the system package manager, but many developers instead use a version manager such as <code>pyenv</code>, which lets you install and switch between multiple Python versions cleanly — important because different projects may require different Python versions.`,
        list: [
          'python.org installer — simplest for a single, system-wide Python install.',
          '<code>pyenv</code> (macOS/Linux) or <code>pyenv-win</code> (Windows) — lets you install and switch between several Python versions per project.',
          'Package managers (Homebrew on macOS, apt on Ubuntu) — convenient but can lag behind the latest Python release.',
        ],
      },
      {
        heading: 'Verifying the Installation',
        body: `After installing, open a terminal and run <code>python --version</code> (or <code>python3 --version</code> on systems where "python" still points to Python 2 or nothing at all). This should print something like <code>Python 3.12.4</code>. If the command is not found, the installation did not add Python to your system PATH, and you will need to either reinstall with that option checked or add the install directory manually.`,
      },
      {
        heading: 'Choosing an Editor or IDE',
        body: `Visual Studio Code with the official Python extension is a popular lightweight choice: it adds syntax highlighting, linting, debugging, and an integrated terminal, and it works well whether you are writing a ten-line script or a large project. PyCharm (from JetBrains) is a full-featured Python-specific IDE with deeper refactoring tools, a built-in debugger, and strong support for frameworks like Django, at the cost of being heavier to run. Either is a reasonable starting point; the important thing is having integrated run/debug support so you are not constantly switching between an editor window and a separate terminal.`,
      },
      {
        heading: 'Running a Script vs. the Interactive REPL',
        body: `A Python script is a plain text file ending in <code>.py</code>, executed from the terminal with <code>python filename.py</code>; this is how real programs are run. The REPL, started by typing just <code>python</code> with no filename, gives you an interactive prompt (<code>&gt;&gt;&gt;</code>) where you type one expression or statement at a time and see its result immediately — ideal for testing a small piece of syntax, inspecting an object, or checking how a function behaves, without creating a file at all. Many editors also offer an integrated interactive console that behaves the same way.`,
      },
    ],
    examples: [
      {
        caption: 'Verifying the install, running a script file, and using the REPL interactively',
        code: `# Terminal: verify installation
$ python --version

# hello.py
print("Hello from a Python script")

# Terminal: run the script file
$ python hello.py

# Terminal: interactive REPL session
$ python
>>> 2 + 2
>>> name = "Webnest"
>>> print(f"Hello, {name}!")
>>> exit()`,
        output: `Python 3.12.4
Hello from a Python script
>>> 4
>>> Hello, Webnest!`,
      },
    ],
    commonMistakes: [
      'Forgetting to check "Add Python to PATH" on Windows during installation, leading to "python is not recognized" errors in the terminal.',
      'Running "python" on a system where it still resolves to an old Python 2 install and being confused by print statement syntax errors — use "python3" explicitly when in doubt.',
      'Treating REPL experimentation as equivalent to running a real script — REPL state is lost when you close the session, and it is not a substitute for saving code to a file.',
      'Installing multiple Python versions without a version manager and losing track of which "python" command points to which install.',
    ],
    keyPoints: [
      'Install Python from python.org or a version manager like pyenv, and always confirm with "python --version".',
      'VS Code and PyCharm are the two most common editor/IDE choices for Python development.',
      'A .py file is run from the terminal with "python filename.py" for real, saved programs.',
      'The REPL (started by running "python" with no file) is for quick, throwaway interactive experimentation, not for building applications.',
    ],
  },

  'type-hints': {
    title: 'Type Hints',
    intro: `Python is, and remains, a dynamically typed language: variable types are determined at runtime, and nothing stops you from assigning a string to a variable that previously held an integer. Type hints, introduced by PEP 484, add an optional layer of static type annotations on top of this — a way to document, and have tools verify, what type a variable, parameter, or return value is intended to hold, without changing how the interpreter actually runs your code.

This lesson covers the syntax for annotating variables, function parameters, and return types; generic annotations like <code>Optional</code>, <code>Union</code>, and the modern <code>list[int]</code> style; and how a static checker such as mypy uses these hints to catch type errors before the program ever runs.`,
    sections: [
      {
        heading: 'Annotating Variables, Parameters, and Return Types',
        body: `A variable annotation follows the name with a colon and a type: <code>age: int = 25</code>. A function parameter is annotated the same way inside the parentheses, and the return type is written after an arrow following the closing parenthesis: <code>def greet(name: str) -> str:</code>. None of this is enforced by the Python interpreter at runtime — it is purely informational and is used by editors for autocompletion and by external static type checkers, not by the language itself while the program is executing.`,
      },
      {
        heading: 'Optional, Union, and Generic Collection Types',
        body: `Many values can legitimately be one type or another, or can be absent entirely, and type hints have specific syntax for this. <code>Optional[int]</code> means "an int, or None." <code>Union[int, str]</code> means "either an int or a str." Since Python 3.10, the <code>|</code> operator can be used instead: <code>int | None</code> is equivalent to <code>Optional[int]</code>. For collections, modern Python (3.9+) allows built-in generics directly: <code>list[int]</code> means "a list containing ints," <code>dict[str, float]</code> means "a dict mapping strings to floats" — no need to import <code>List</code> or <code>Dict</code> from the older <code>typing</code> module for these common cases.`,
        list: [
          '<code>Optional[str]</code> (or <code>str | None</code>) — a string, or the absence of a value.',
          '<code>Union[int, str]</code> (or <code>int | str</code>) — a value that could be either type.',
          '<code>list[int]</code>, <code>dict[str, int]</code>, <code>tuple[int, int]</code> — built-in generic collection annotations.',
        ],
      },
      {
        heading: 'Catching Errors with a Static Checker (mypy)',
        body: `Type hints only become genuinely useful for catching bugs when a tool actually reads and checks them, since Python itself ignores them at runtime. <code>mypy</code> is the most widely used static type checker: run <code>mypy myscript.py</code> from the terminal, and it analyzes your annotated code, flagging places where a function is called with the wrong argument type, where a variable's declared type conflicts with the value assigned to it, or where a return value doesn't match the declared return type — all without running the program at all.`,
      },
      {
        heading: 'Python Remains Dynamically Typed at Runtime',
        body: `It is important to be precise about what type hints do not do: they are not enforced automatically by the Python interpreter. You can annotate a parameter as <code>x: int</code> and then call the function with a string, and the program will run without any TypeError at the point of the call — the mismatch would only be caught if you separately ran a checker like mypy against the code beforehand. Type hints are a documentation and tooling layer, not a runtime type system, which is a common point of confusion for developers coming from statically typed languages like Java or TypeScript's compiled output.`,
      },
    ],
    examples: [
      {
        caption: 'Annotated function with Optional and list generics, checked with mypy',
        code: `from typing import Optional

def find_average(scores: list[int]) -> Optional[float]:
    if not scores:
        return None
    return sum(scores) / len(scores)

result = find_average([85, 90, 78])
print(result)

# This call passes a str where a list[int] is expected.
# Python runs it anyway (hints aren't enforced at runtime),
# but "mypy this_file.py" would flag it before you ever run it.
bad_result = find_average("not a list")`,
        output: `84.33333333333333
# mypy output (static check, not a runtime error):
error: Argument 1 to "find_average" has incompatible type "str"; expected "list[int]"`,
      },
    ],
    commonMistakes: [
      'Believing type hints prevent type-mismatch bugs automatically — they only help if a checker like mypy is actually run, typically in CI or as a pre-commit step.',
      'Importing List, Dict, and Optional from typing for simple cases in modern Python, when built-in generics like list[int] and the X | None syntax are simpler and preferred since Python 3.9/3.10.',
      'Forgetting that a function without a return type annotation is treated as returning "Any" by most checkers, silently skipping useful checks.',
      'Adding overly complex nested generic types where a simpler annotation (or a dataclass) would communicate intent more clearly.',
    ],
    keyPoints: [
      'Type hints (PEP 484) let you annotate variables, parameters, and return types, but Python remains dynamically typed and does not enforce them at runtime.',
      'Optional[X] means X or None; Union[X, Y] (or X | Y since 3.10) means either type; list[int]/dict[str, int] are built-in generic collection annotations.',
      'A static checker like mypy reads these annotations and reports type errors before the code ever runs, which is where the real value of type hints comes from.',
      'Hints are a documentation and tooling aid, not a substitute for runtime validation when it truly matters (e.g. validating external input).',
    ],
  },

  'async-programming-with-asyncio': {
    title: 'Async Programming with asyncio',
    intro: `Traditional Python code runs synchronously: each statement waits for the previous one to finish before starting, and if a statement is a slow network call, the entire program sits idle waiting for it. The <code>asyncio</code> module offers a different approach for I/O-bound programs — a single-threaded event loop that can juggle many waiting operations at once, running other code while any individual operation is blocked on I/O, without the overhead of spawning separate OS threads.

This lesson covers the <code>async</code>/<code>await</code> syntax, what the event loop actually does, starting a program with <code>asyncio.run()</code>, awaiting coroutines, running many of them concurrently with <code>asyncio.gather()</code>, and — just as importantly — when asyncio genuinely helps versus when it does nothing for you at all.`,
    sections: [
      {
        heading: 'async/await Syntax and Coroutines',
        body: `A function defined with <code>async def</code> is a coroutine function; calling it does not run its body immediately — it returns a coroutine object, which must be awaited or scheduled to actually execute. Inside an async function, the <code>await</code> keyword pauses execution at that point until the awaited operation completes, and — critically — while it's paused, the event loop is free to run other coroutines instead of sitting idle. You can only use <code>await</code> inside a function defined with <code>async def</code>.`,
      },
      {
        heading: 'The Event Loop and asyncio.run()',
        body: `The event loop is the engine that drives all of this: it keeps track of every pending coroutine, resumes each one when the thing it was awaiting becomes ready, and cycles through them in a single thread. You rarely manage the event loop directly in modern asyncio code; instead, <code>asyncio.run(main())</code> creates a new event loop, runs your top-level coroutine (<code>main</code>) to completion, and cleans the loop up afterward. This is the standard entry point for any asyncio program.`,
      },
      {
        heading: 'Running Coroutines Concurrently with asyncio.gather()',
        body: `Awaiting one coroutine after another with separate <code>await</code> statements still runs them sequentially — each one finishes before the next starts, gaining nothing from asyncio. To actually run several coroutines concurrently, pass them to <code>asyncio.gather()</code>, which schedules all of them on the event loop at once and returns their results together once every one of them has completed. This is where asyncio's real benefit shows up: several slow I/O operations overlapping in time instead of running one after another.`,
        list: [
          '<code>await some_coroutine()</code> — runs and waits for just that one coroutine.',
          '<code>await asyncio.gather(coro1(), coro2(), coro3())</code> — runs all three concurrently and waits for all to finish.',
          '<code>asyncio.run(main())</code> — the standard way to start the event loop and run your top-level async function.',
        ],
      },
      {
        heading: 'When asyncio Helps — and When It Does Not',
        body: `asyncio shines for I/O-bound work: network requests, database queries (with an async driver), reading many files, or waiting on external services — anywhere a task spends most of its time waiting rather than computing. It does essentially nothing for CPU-bound work like heavy numeric computation or image processing, because Python's event loop is still single-threaded; a long CPU-bound coroutine that never awaits will block the entire event loop and freeze every other "concurrent" task. For CPU-bound parallelism, the <code>multiprocessing</code> module (which uses separate OS processes, sidestepping the GIL) is the correct tool, not asyncio.`,
      },
    ],
    examples: [
      {
        caption: 'Two simulated I/O calls run sequentially vs. concurrently with asyncio.gather()',
        code: `import asyncio
import time

async def fetch_data(name: str, delay: float) -> str:
    await asyncio.sleep(delay)  # simulates a non-blocking network call
    return f"{name} done"

async def main():
    start = time.perf_counter()
    results = await asyncio.gather(
        fetch_data("A", 1),
        fetch_data("B", 1),
    )
    elapsed = time.perf_counter() - start
    print(results)
    print(f"Elapsed: {elapsed:.1f}s")

asyncio.run(main())`,
        output: `['A done', 'B done']
Elapsed: 1.0s`,
      },
    ],
    commonMistakes: [
      'Calling an async function without await (or without passing it to asyncio.run/gather) and being confused when nothing happens — it just creates an unused coroutine object.',
      'Awaiting coroutines one at a time in sequence and expecting concurrency — sequential awaits still run one after another; use asyncio.gather() for real concurrency.',
      'Using asyncio to speed up CPU-bound work like heavy computation, which gains nothing because the single-threaded event loop still executes all Python bytecode one step at a time — multiprocessing is needed instead.',
      'Calling a blocking, synchronous function (like a non-async database driver call) inside a coroutine, which blocks the entire event loop for every other task, not just the current one.',
    ],
    keyPoints: [
      'async def defines a coroutine function; await pauses a coroutine while letting the event loop run other work instead of blocking the whole program.',
      'asyncio.run() is the standard entry point that creates the event loop and runs your top-level coroutine to completion.',
      'asyncio.gather() runs multiple coroutines concurrently and waits for all of them, which is where real time savings come from versus sequential awaits.',
      'asyncio helps I/O-bound workloads (network, disk, external services) but does nothing for CPU-bound work, which needs multiprocessing instead.',
    ],
  },
}
