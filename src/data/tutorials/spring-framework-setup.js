// Spring Framework module — "Getting Started and Installation" lessons.
// Facts here were checked against the Spring reference docs, start.spring.io
// metadata, and a real Spring Boot 4.1.1 / Spring Framework 7.0.9 build.
// Keys are the slugs of the topic titles in codelabDefaults.js.
export const springFrameworkSetup = {
  'spring-framework-overview-and-modules': {
    title: 'Spring Framework Overview and Modules',
    intro: `Spring is an open-source application framework for Java. Its core idea is simple: instead of your classes creating and wiring their own dependencies, a container creates the objects, connects them, and manages their lifecycle for you. Everything else in the Spring ecosystem (web, data access, security, messaging, testing) is built on top of that container.

This lesson gives you the map. You will learn what problem Spring solves, how the framework is split into modules, how Spring Framework relates to Spring Boot and the other Spring projects, and which versions this course targets: Spring Framework 7.0 and Spring Boot 4.1.`,
    sections: [
      {
        heading: 'What problem does Spring solve?',
        body: `Enterprise Java in the early 2000s meant heavy application servers, verbose configuration, and code that was hard to test because every class built its own collaborators with the new keyword. Rod Johnson's book "Expert One-on-One J2EE Design and Development" (2002) argued for a lighter approach based on plain Java objects, and the code from that book grew into Spring.

Spring's answer is <strong>Inversion of Control</strong>: your objects declare what they need, and the container supplies it. This is called <strong>Dependency Injection</strong>. Because classes no longer create their dependencies, you can replace a real payment gateway with a fake one in a test without touching the class under test.

Spring also removes repetitive plumbing. Opening and closing JDBC connections, managing transactions, and translating checked exceptions are all handled by Spring so your code can focus on business logic.`,
      },
      {
        heading: 'The main modules',
        body: `Spring Framework is not one big jar. It is a set of modules, and you add only what you need. The most important ones are:`,
        list: [
          '<strong>spring-core and spring-beans</strong> - the foundation: utilities, resource loading, and the bean factory that creates and wires objects.',
          '<strong>spring-context</strong> - the ApplicationContext, the richer container you use in almost every application. It adds events, internationalization, annotation-based configuration, and profiles.',
          '<strong>spring-expression</strong> - Spring Expression Language (SpEL), a small language for querying and setting values at runtime.',
          '<strong>spring-aop and spring-aspects</strong> - aspect-oriented programming for cross-cutting concerns such as logging, security checks, and transactions.',
          '<strong>spring-jdbc, spring-tx, spring-orm</strong> - data access: JdbcTemplate, declarative transactions, and integration with Hibernate and JPA.',
          '<strong>spring-web and spring-webmvc</strong> - the servlet-based web stack: controllers, REST endpoints, view rendering, and the REST client APIs.',
          '<strong>spring-webflux</strong> - the reactive web stack for non-blocking applications.',
          '<strong>spring-jms and spring-messaging</strong> - messaging support, including JMS.',
          '<strong>spring-test</strong> - the TestContext framework, MockMvc, and other testing helpers.',
        ],
      },
      {
        heading: 'Spring Framework vs Spring Boot vs other projects',
        body: `Beginners often confuse these, so be precise. <strong>Spring Framework</strong> is the core library described above. <strong>Spring Boot</strong> is a layer on top of it that removes setup work: it picks compatible dependency versions for you (starters), configures common beans automatically (auto-configuration), and embeds a web server so you can run your application with a single command.

Around them sits a family of projects: Spring Data (repositories), Spring Security (authentication and authorization), Spring Cloud (microservice patterns), Spring Batch, Spring Integration, and Spring AI. Most of them assume you are using Spring Boot.

The practical rule for this course: learn the Framework concepts first (containers, beans, AOP, transactions, MVC), because Boot only automates them. When something in a Boot application behaves strangely, the explanation is almost always a Framework concept.`,
      },
      {
        heading: 'Versions used in this course',
        body: `Spring moves quickly, so it matters which version a tutorial is written for. This course targets the current generation:`,
        list: [
          '<strong>Spring Framework 7.0.x</strong> - the current reference documentation is for 7.0. It builds on the Java 17 baseline introduced in Spring 6 and continues the move to the Jakarta EE namespace (jakarta.* packages instead of javax.*).',
          '<strong>Spring Boot 4.1.x</strong> - the version start.spring.io offers by default. It requires Java 17 or newer and works with newer Java releases. Boot 4 also reorganised its starters and test modules, which later lessons point out.',
          '<strong>Java 17 minimum</strong> - we recommend installing an LTS release such as Java 21 or Java 25.',
        ],
      },
      {
        heading: 'What is new in the Spring 7 generation',
        body: `The current reference documentation lists several areas that beginners will meet: built-in <strong>resilience features</strong> (retry and concurrency limiting), stronger <strong>null-safety</strong> annotations, a unified <strong>REST client</strong> section covering RestClient, WebClient and HTTP service clients, <strong>RestTestClient</strong> for testing, and chapters on JVM AOT cache and checkpoint-restore for faster startup. Spring Boot 4 additionally adds properties for <strong>API versioning</strong> in MVC and WebFlux applications. Later lessons in this course cover each of these where they fit.`,
      },
    ],
    examples: [
      {
        caption: 'The same idea with and without Spring: who creates the dependency?',
        code: `// Without Spring: OrderService builds its own dependency (tight coupling)
class OrderService {
    private final EmailSender sender = new SmtpEmailSender();

    void placeOrder() {
        sender.send("Order placed");
    }
}

// With Spring: the container passes the dependency in (loose coupling)
@Service
class OrderService {
    private final EmailSender sender;

    OrderService(EmailSender sender) {   // Spring injects a matching bean
        this.sender = sender;
    }

    void placeOrder() {
        sender.send("Order placed");
    }
}`,
      },
    ],
    commonMistakes: [
      'Treating Spring Boot and Spring Framework as competitors. Boot is built on the Framework, it does not replace it.',
      'Following a tutorial written for Spring Boot 2 or 3 and copying package names (javax.*) or class names that no longer exist in current versions.',
      'Adding every Spring module "just in case". Add only the modules or starters your feature needs.',
    ],
    keyPoints: [
      'Spring is a container that creates, wires and manages your objects (IoC and dependency injection).',
      'The framework is modular: core, beans, context, AOP, JDBC/ORM, web, messaging, and test.',
      'Spring Boot adds starters, auto-configuration and an embedded server on top of Spring Framework.',
      'This course targets Spring Framework 7.0 and Spring Boot 4.1 on Java 17 or newer.',
    ],
  },

  'installing-the-jdk-on-windows-macos-and-linux': {
    title: 'Installing the JDK on Windows, macOS and Linux',
    intro: `Every Spring application needs a JDK (Java Development Kit). Spring Boot 4.1 requires Java 17 as a minimum and runs on newer releases, so any LTS version from 17 upward works. For a new machine we recommend Java 21 or Java 25 because they are long-term-support releases that stay maintained for years.

This lesson gives step-by-step instructions for Windows, macOS and Linux, shows how to set JAVA_HOME correctly, and explains the mistakes that cause most "Java is not found" problems.`,
    sections: [
      {
        heading: 'Choosing a JDK distribution and version',
        body: `Java is open source, and several vendors publish free, compatible builds of the same OpenJDK code. <strong>Eclipse Temurin</strong> (from the Adoptium project) is a popular neutral choice, and <strong>Oracle JDK</strong>, <strong>Amazon Corretto</strong>, <strong>Microsoft Build of OpenJDK</strong> and <strong>Azul Zulu</strong> are also widely used. For learning Spring they behave the same.

Pick an LTS version: 17, 21 or 25. If your team or employer already uses one, match it. Whatever you choose, the version must be at least the value of java.version in your project (Spring Initializr generates it for you), otherwise the compiler stops with an error such as "release version 21 not supported".

You need a <strong>JDK</strong>, not just a JRE. The JDK contains javac, the compiler that Maven and Gradle call.`,
      },
      {
        heading: 'Windows',
        body: `The easiest route is the Windows package manager. Open PowerShell and run one of the following (the package IDs below exist in the winget catalogue for Temurin 17 and 21):`,
        list: [
          'Install Temurin 21: <code>winget install EclipseAdoptium.Temurin.21.JDK</code>',
          'Install Temurin 17: <code>winget install EclipseAdoptium.Temurin.17.JDK</code>',
          'For other versions (for example 25), download the MSI installer from adoptium.net and run it. In the installer, choose the options that add Java to PATH and set JAVA_HOME.',
          'Close and reopen your terminal, then verify with <code>java -version</code> and <code>javac -version</code>.',
        ],
      },
      {
        heading: 'macOS',
        body: `If you use Homebrew, install Temurin as a cask. Otherwise download the .pkg installer from adoptium.net.`,
        list: [
          'Install with Homebrew: <code>brew install --cask temurin@21</code>',
          'List installed JDKs: <code>/usr/libexec/java_home -V</code>',
          'Use a specific one in the current shell: <code>export JAVA_HOME=$(/usr/libexec/java_home -v 21)</code>',
          'Make it permanent by adding that export line to your <code>~/.zshrc</code>.',
        ],
      },
      {
        heading: 'Linux',
        body: `Use your distribution's package manager, or SDKMAN if you want to switch versions easily.`,
        list: [
          'Ubuntu / Debian: <code>sudo apt update &amp;&amp; sudo apt install openjdk-21-jdk</code>',
          'Fedora / RHEL family: <code>sudo dnf install java-21-openjdk-devel</code>',
          'Find the install folder: <code>readlink -f $(which javac)</code> (JAVA_HOME is the folder above bin).',
          'Add <code>export JAVA_HOME=/path/to/jdk</code> to <code>~/.bashrc</code> or <code>~/.zshrc</code>, then run <code>source ~/.bashrc</code>.',
        ],
      },
      {
        heading: 'SDKMAN: one tool for every OS-like environment',
        body: `SDKMAN works on macOS, Linux and Windows through WSL or Git Bash. It installs several JDKs side by side and switches between them with one command, which is handy when different projects need different Java versions.`,
        list: [
          'Install SDKMAN: <code>curl -s "https://get.sdkman.io" | bash</code> then open a new terminal.',
          'See available versions: <code>sdk list java</code>',
          'Install one using the identifier shown in the list, for example <code>sdk install java 21.0.x-tem</code> (replace with a real identifier from the list).',
          'Switch for the current terminal: <code>sdk use java 21.0.x-tem</code>, or set a default with <code>sdk default java 21.0.x-tem</code>.',
        ],
      },
      {
        heading: 'Setting JAVA_HOME and PATH',
        body: `Maven, Gradle and many IDE plugins read the JAVA_HOME environment variable to find your JDK. It must point to the JDK's root folder (the folder that contains bin, lib and conf), not to the bin folder and not to the java.exe file.

On Windows, set it from PowerShell for your user account, then open a new terminal: <code>setx JAVA_HOME "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.x.x-hotspot"</code> (use the real folder name on your machine). You can also use the Environment Variables dialog: Start menu, search "Edit the system environment variables", then Environment Variables.

On macOS and Linux use an export line in your shell profile, as shown above. Finally make sure the JDK's bin folder is on PATH (on Windows add <code>%JAVA_HOME%\\bin</code>; on macOS and Linux add <code>$JAVA_HOME/bin</code>).`,
      },
      {
        heading: 'Verifying the installation',
        body: `Open a brand-new terminal, because old terminals keep the old environment, and run the checks in the example below. Both java and javac should report the same major version. On Windows you can also run <code>where java</code> to see which java.exe is found first. If that list shows an older Java ahead of your new one, fix the PATH order.`,
      },
    ],
    examples: [
      {
        caption: 'Verify the JDK and JAVA_HOME (macOS / Linux shell)',
        code: `java -version
javac -version
echo $JAVA_HOME
$JAVA_HOME/bin/java -version`,
        output: `openjdk version "21.0.x" 2025-xx-xx LTS
OpenJDK Runtime Environment Temurin-21.0.x+x (build 21.0.x+x-LTS)
OpenJDK 64-Bit Server VM Temurin-21.0.x+x (build 21.0.x+x-LTS, mixed mode, sharing)
javac 21.0.x
/usr/lib/jvm/temurin-21-jdk
openjdk version "21.0.x" 2025-xx-xx LTS`,
      },
      {
        caption: 'Verify on Windows PowerShell',
        code: `java -version
javac -version
echo $env:JAVA_HOME
where.exe java`,
        output: `java version "17.0.12" 2024-07-16 LTS
Java(TM) SE Runtime Environment (build 17.0.12+8-LTS-286)
javac 17.0.12
C:\\Program Files\\Java\\jdk-17
C:\\Program Files\\Common Files\\Oracle\\Java\\javapath\\java.exe`,
      },
    ],
    commonMistakes: [
      'Installing only a JRE. Maven and Gradle need javac, which only a JDK provides.',
      'Pointing JAVA_HOME at the bin folder or at a path with the wrong folder name. A wrong value makes the Maven wrapper fail with: The JAVA_HOME environment variable is not defined correctly.',
      'On Windows, copying the java.exe path from "where java" into JAVA_HOME. That path is often a small launcher shim under Common Files\\Oracle\\Java\\javapath, not the real JDK folder. Use the folder that contains the bin directory, such as C:\\Program Files\\Java\\jdk-17.',
      'Testing in a terminal that was open before you changed the variables. Always open a new terminal.',
      'Having several JDKs installed and not noticing that an older one comes first on PATH.',
    ],
    keyPoints: [
      'Spring Boot 4.1 needs Java 17 or newer; choose an LTS such as 21 or 25.',
      'Install a JDK (not only a JRE) from a trusted distribution such as Temurin.',
      'JAVA_HOME points to the JDK root folder; PATH must include its bin folder.',
      'Verify with java -version, javac -version and where java (Windows) or which java (macOS/Linux).',
    ],
  },

  'installing-maven-and-gradle': {
    title: 'Installing Maven and Gradle',
    intro: `Spring projects are built with either Maven or Gradle. A build tool downloads the Spring libraries your project needs, compiles your code, runs tests, and packages the application. You only need one of them, and neither is required to be installed system-wide, because every project generated by Spring Initializr includes a wrapper script that downloads the correct version automatically.

This lesson explains the wrapper, shows manual installation for both tools on every operating system, and compares the two so you can choose.`,
    sections: [
      {
        heading: 'The build wrapper: the recommended way',
        body: `A project made with Spring Initializr contains <code>mvnw</code> and <code>mvnw.cmd</code> (Maven) or <code>gradlew</code> and <code>gradlew.bat</code> (Gradle). These small scripts read a properties file, download the exact tool version the project was designed for, cache it in your home folder, and run it. Everyone on the team, and your CI server, therefore uses the same version without installing anything except a JDK.

In a project generated for Spring Boot 4.1.1 the file <code>.mvn/wrapper/maven-wrapper.properties</code> points to Apache Maven 3.9.16. Run the scripts like this: <code>./mvnw clean package</code> on macOS and Linux, <code>mvnw.cmd clean package</code> in Windows Command Prompt, and <code>.\\mvnw clean package</code> in PowerShell.`,
      },
      {
        heading: 'Installing Maven manually',
        body: `Spring Boot 4.1 supports Maven 3.6.3 or later. Maven itself runs on Java, so install the JDK first.`,
        list: [
          'Windows (manual): download the binary zip from maven.apache.org, extract it to a folder such as C:\\tools\\apache-maven, then add its bin folder to PATH.',
          'Windows (package managers): <code>choco install maven</code> with Chocolatey, or <code>scoop install maven</code> with Scoop. Note that the winget catalogue does not provide a Maven package.',
          'macOS: <code>brew install maven</code>',
          'Ubuntu / Debian: <code>sudo apt install maven</code> (the packaged version can be older, so check it with mvn -v).',
          'Any system with SDKMAN: <code>sdk install maven</code>',
          'Verify: <code>mvn -v</code>. It prints the Maven version, the Java version it found, and the OS.',
        ],
      },
      {
        heading: 'Installing Gradle manually',
        body: `Spring Boot 4.1 supports Gradle 8.14 or later in the 8.x line, and Gradle 9.x. Gradle also needs a JDK to run.`,
        list: [
          'macOS: <code>brew install gradle</code>',
          'Windows: <code>choco install gradle</code> or <code>scoop install gradle</code>, or unzip the binary distribution from gradle.org and add its bin folder to PATH.',
          'Any system with SDKMAN: <code>sdk install gradle</code>',
          'Verify: <code>gradle -v</code>',
          'To add a wrapper to an existing Gradle project, run <code>gradle wrapper</code> once, then use <code>./gradlew</code> afterwards.',
        ],
      },
      {
        heading: 'Maven or Gradle: how to choose',
        body: `Both are fully supported by Spring Boot and by every major IDE, and the dependencies are identical. The difference is style.`,
        list: [
          '<strong>Maven</strong> uses a declarative XML file (pom.xml) with a fixed lifecycle. It is verbose but predictable, and it is the most common choice in enterprise teams and in learning material.',
          '<strong>Gradle</strong> uses a Groovy or Kotlin script (build.gradle or build.gradle.kts). It is shorter, very flexible, and often faster on large projects through incremental builds and caching.',
          'For this course we use Maven in examples, but every dependency shown can be written for Gradle with the same coordinates.',
        ],
      },
      {
        heading: 'The commands you will use every day',
        body: `You will use only a handful of commands. The table in the example shows the Maven form, and the Gradle form follows the same idea. The first run is slow because the tool downloads dependencies into a local cache (the .m2 folder for Maven, the .gradle folder for Gradle), and later runs are fast.`,
      },
    ],
    examples: [
      {
        caption: 'Everyday Maven wrapper commands (macOS/Linux; use mvnw.cmd on Windows)',
        code: `./mvnw clean            # delete the target folder
./mvnw compile          # compile the code
./mvnw test             # run the unit tests
./mvnw package          # build target/<name>.jar
./mvnw spring-boot:run  # run a Spring Boot application
./mvnw dependency:tree  # show every library on the classpath`,
      },
      {
        caption: 'The same tasks with the Gradle wrapper',
        code: `./gradlew clean
./gradlew compileJava
./gradlew test
./gradlew build         # build build/libs/<name>.jar
./gradlew bootRun       # run a Spring Boot application
./gradlew dependencies  # show the dependency tree`,
      },
    ],
    commonMistakes: [
      'Installing Maven or Gradle but forgetting the JDK. Both tools stop with an error if no JDK is found.',
      'Mixing tools in one project: running mvn in a Gradle project or the reverse. Look for pom.xml or build.gradle to know which one you have.',
      'Running mvn instead of ./mvnw and getting a different Maven version than your teammates.',
      'On macOS and Linux, running ./mvnw when the script is not executable. Fix it with chmod +x mvnw.',
      'Deleting the .m2 cache to "fix" a problem. It only forces a long re-download; read the error first.',
    ],
    keyPoints: [
      'Use the wrapper (mvnw or gradlew) that Spring Initializr generates; it needs only a JDK.',
      'Spring Boot 4.1 supports Maven 3.6.3 or later and Gradle 8.14+ or 9.x.',
      'winget has no Maven or Gradle package; use the wrapper, Chocolatey, Scoop, SDKMAN, Homebrew or apt.',
      'Maven is declarative XML; Gradle is a script. Pick one per project and stay consistent.',
    ],
  },

  'setting-up-your-ide-for-spring': {
    title: 'Setting Up Your IDE for Spring',
    intro: `You can write Spring code in any text editor, but an IDE gives you code completion for Spring annotations, one-click running, a debugger, and inspection of your beans and configuration properties. Three choices dominate: IntelliJ IDEA, Eclipse with Spring Tools, and Visual Studio Code with the Spring extensions.

This lesson shows how to install and prepare each one, how to open and run a Spring Initializr project, and which extra tools every Spring developer should have.`,
    sections: [
      {
        heading: 'IntelliJ IDEA',
        body: `IntelliJ IDEA is the most popular Java IDE in professional teams. It understands Maven and Gradle projects, offers strong refactoring tools, and includes a built-in HTTP client and database tools. The deepest Spring-specific support (bean navigation, configuration-property completion, endpoint views) is part of the paid Ultimate features, and JetBrains has been changing how its editions are packaged, so check the JetBrains site for what your edition includes. You can build and run Spring applications in any edition.`,
        list: [
          'Install on Windows: <code>winget install JetBrains.IntelliJIDEA</code>, or use the installer from jetbrains.com. On macOS: <code>brew install --cask intellij-idea</code>.',
          'Open a project with File, Open and select the folder that contains pom.xml or build.gradle. IntelliJ imports it as a Maven or Gradle project.',
          'Set the project SDK under File, Project Structure, Project, and choose your JDK 17 or newer.',
          'Run by clicking the green arrow next to the main method of the class annotated with SpringBootApplication.',
          'Enable annotation processing (Settings, Build, Compiler, Annotation Processors) if you use Lombok.',
        ],
      },
      {
        heading: 'Eclipse with Spring Tools',
        body: `Eclipse is free and long established in enterprise Java. Install the "Eclipse IDE for Enterprise Java and Web Developers" package from eclipse.org, then add <strong>Spring Tools</strong> from the Eclipse Marketplace (Help, Eclipse Marketplace, search for "Spring Tools"). Spring Tools adds a Boot dashboard, live application information, and completion for application properties.`,
        list: [
          'Import a generated project with File, Import, Maven, Existing Maven Projects (or Gradle, Existing Gradle Project).',
          'Make sure Eclipse runs on a JDK, not a JRE: Window, Preferences, Java, Installed JREs.',
          'Run with right-click on the project, Run As, Spring Boot App, or from the Boot Dashboard view.',
        ],
      },
      {
        heading: 'Visual Studio Code',
        body: `VS Code is lightweight and starts fast. Install VS Code (on Windows: <code>winget install Microsoft.VisualStudioCode</code>), then add two extension packs from the Extensions view: <strong>Extension Pack for Java</strong> (language support, debugging, Maven and Gradle integration) and the <strong>Spring Boot Extension Pack</strong> (Spring Boot tooling, dashboard and Initializr support). VS Code will ask for a JDK if it cannot find one; point it to the JDK that JAVA_HOME uses.`,
        list: [
          'Create a project from the command palette: Spring Initializr: Create a Maven Project.',
          'Run and debug using the Run and Debug panel, or the Spring Boot Dashboard.',
          'If VS Code reports the wrong Java version, set java.jdt.ls.java.home in your settings.',
        ],
      },
      {
        heading: 'Other tools every Spring developer needs',
        body: `Beyond the IDE, install a few supporting tools. They make everything in later lessons easier.`,
        list: [
          '<strong>Git</strong> for version control (Windows: <code>winget install Git.Git</code>).',
          '<strong>An HTTP client</strong> to call your APIs: curl (already on most systems), Postman (<code>winget install Postman.Postman</code>), or the HTTP client built into your IDE.',
          '<strong>Docker Desktop</strong> for databases and message brokers in later lessons (<code>winget install Docker.DockerDesktop</code>).',
          '<strong>A database tool</strong>. The H2 in-memory database needs no installation, which makes it ideal while learning.',
        ],
      },
      {
        heading: 'A quick IDE checklist',
        body: `Before you continue, confirm that: the IDE uses the same JDK version as your terminal; the project imports without red errors; you can run the main class and see the Spring banner in the console; and the console shows the port (normally 8080) when the application starts. If the IDE and the terminal disagree, the cause is almost always a different JDK.`,
      },
    ],
    examples: [
      {
        caption: 'Install the extras on Windows with winget (all IDs exist in the winget catalogue)',
        code: `winget install EclipseAdoptium.Temurin.21.JDK
winget install Microsoft.VisualStudioCode
winget install JetBrains.IntelliJIDEA
winget install Git.Git
winget install Postman.Postman
winget install Docker.DockerDesktop`,
      },
      {
        caption: 'Install the same tools on macOS with Homebrew',
        code: `brew install --cask temurin@21
brew install --cask intellij-idea
brew install --cask visual-studio-code
brew install git`,
      },
    ],
    commonMistakes: [
      'Opening the parent folder of the project instead of the folder that contains pom.xml, so the IDE does not detect a Maven or Gradle project.',
      'Letting the IDE use a different JDK than the terminal, which leads to "works in the IDE, fails in Maven" problems.',
      'Ignoring annotation processing when using Lombok, then wondering why getters and setters are missing.',
      'Running the wrong class. Run the class that has the main method and the SpringBootApplication annotation.',
    ],
    keyPoints: [
      'IntelliJ IDEA, Eclipse with Spring Tools, and VS Code with the Java and Spring Boot extension packs all work well for Spring.',
      'Always point the IDE at a JDK 17 or newer and keep it consistent with your terminal.',
      'Import the folder that contains pom.xml or build.gradle so the IDE detects the build tool.',
      'Install Git, an HTTP client and Docker Desktop early; later lessons rely on them.',
    ],
  },

  'setting-up-a-spring-project': {
    title: 'Setting Up a Spring Project',
    intro: `A plain Spring Framework project (without Spring Boot) needs only a JDK, a build tool and one dependency: spring-context. This is the best way to learn the container itself, because nothing is hidden behind auto-configuration. In this lesson you will create a Maven project by hand, understand every line of its pom.xml, see the folder structure, and compile it.

The next lessons then show how Spring Initializr creates a full Spring Boot project in seconds, and how to run your first application in both styles.`,
    sections: [
      {
        heading: 'What you need first',
        body: `Install a JDK 17 or newer (see the JDK installation lesson) and confirm that java -version and javac -version work. Then choose Maven or Gradle. The rest of this lesson uses Maven, and the Maven wrapper or a locally installed Maven both work.`,
      },
      {
        heading: 'The standard folder structure',
        body: `Maven and Gradle expect the same layout, so learn it once. Java code goes under src/main/java, resources such as properties files go under src/main/resources, and tests go under src/test/java. Your packages then follow the reverse-domain convention.`,
        list: [
          '<code>pom.xml</code> - the Maven build description at the project root.',
          '<code>src/main/java/com/webnest/first</code> - your application classes.',
          '<code>src/main/resources</code> - configuration files, templates and static files.',
          '<code>src/test/java</code> - unit and integration tests.',
          '<code>target</code> - build output, created by Maven. Never commit it to Git.',
        ],
      },
      {
        heading: 'The pom.xml, line by line',
        body: `The <code>groupId</code>, <code>artifactId</code> and <code>version</code> identify your project. The <code>maven.compiler.release</code> property tells the compiler which Java version to target, and it must not be higher than your installed JDK. The <code>spring.version</code> property keeps the Spring version in one place. The single dependency, <code>org.springframework:spring-context</code>, brings in the container and, transitively, spring-core, spring-beans, spring-aop and spring-expression. You never list those individually.`,
      },
      {
        heading: 'Why Spring Boot changes the pom',
        body: `In a Spring Boot project you do not write a Spring version at all. Instead the pom declares <code>spring-boot-starter-parent</code> as its parent, which manages compatible versions for hundreds of libraries, and you add starters such as <code>spring-boot-starter-webmvc</code>. In Spring Boot 4 the web starter is named <code>spring-boot-starter-webmvc</code> (older tutorials call it spring-boot-starter-web), and each starter has a matching <code>-test</code> starter for its tests.`,
      },
      {
        heading: 'Compile to confirm the setup',
        body: `Once the files exist, run <code>mvn compile</code> (or <code>./mvnw compile</code> if you copied a wrapper). The first run downloads Spring and Maven plugins, which can take a minute. A successful build ends with BUILD SUCCESS. If you see an error about the release version, your JDK is older than maven.compiler.release.`,
      },
    ],
    examples: [
      {
        caption: 'A complete pom.xml for a plain Spring Framework 7.0 application (verified to build)',
        code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.webnest</groupId>
    <artifactId>first-spring</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.release>17</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring.version>7.0.9</spring.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>\${spring.version}</version>
        </dependency>
    </dependencies>
</project>`,
      },
      {
        caption: 'The same dependency in a Gradle build (Kotlin DSL)',
        code: `plugins {
    java
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework:spring-context:7.0.9")
}`,
      },
    ],
    commonMistakes: [
      'Putting Java files directly in the project root or in src/main instead of src/main/java, so the compiler ignores them.',
      'Setting maven.compiler.release higher than the JDK you installed.',
      'Adding several Spring versions manually. Use one spring.version property, or let Spring Boot manage versions.',
      'Copying a Spring 5 or 6 tutorial that imports javax.* classes; current Spring uses jakarta.* for servlet, validation and persistence APIs.',
    ],
    keyPoints: [
      'A plain Spring project needs a JDK, a build tool and the spring-context dependency.',
      'Maven and Gradle share the src/main/java, src/main/resources and src/test/java layout.',
      'Spring Boot replaces the version handling with spring-boot-starter-parent and starters.',
      'In Spring Boot 4 the web starter is spring-boot-starter-webmvc.',
    ],
  },

  'creating-a-project-with-spring-initializr': {
    title: 'Creating a Project with Spring Initializr',
    intro: `Spring Initializr, at start.spring.io, generates a ready-to-run Spring Boot project: a correct pom.xml or build.gradle, the Maven or Gradle wrapper, an application class, a test class and the standard folder structure. Professional teams use it constantly because it guarantees compatible dependency versions.

You can use Initializr from the website, from your IDE (IntelliJ, Eclipse, and VS Code all have it built in), and from the command line with curl. This lesson covers each option and explains every field.`,
    sections: [
      {
        heading: 'Using the website',
        body: `Open start.spring.io and fill in the form. The choices are explained below, using the options that the current Initializr offers.`,
        list: [
          '<strong>Project</strong> - Maven, Gradle with Groovy, or Gradle with Kotlin.',
          '<strong>Language</strong> - Java, Kotlin or Groovy. This course uses Java.',
          '<strong>Spring Boot</strong> - pick the release version (4.1.1 at the time of writing). Avoid SNAPSHOT and milestone (M) versions for real work.',
          '<strong>Group and Artifact</strong> - group is your reverse domain such as com.webnest; artifact is the project name such as hello. Together they define the base package.',
          '<strong>Packaging</strong> - Jar for normal applications (embedded server), War only if you must deploy to an external servlet container.',
          '<strong>Java</strong> - 17, 21, 25 or a newer release, and it must not be higher than your installed JDK.',
          '<strong>Dependencies</strong> - click Add Dependencies and search. Choose Spring Web for REST and MVC, Spring Data JPA for databases, Validation, Spring Security, Thymeleaf, Actuator, and so on.',
        ],
      },
      {
        heading: 'Commonly used dependency names',
        body: `The identifiers below are the ones Initializr uses. You can pass them to the command-line form as a comma-separated list.`,
        list: [
          '<code>web</code> - Spring Web (MVC and REST, embedded Tomcat).',
          '<code>data-jpa</code> - Spring Data JPA with Hibernate.',
          '<code>validation</code> - Bean Validation (Jakarta Validation).',
          '<code>security</code> - Spring Security.',
          '<code>thymeleaf</code> - server-side HTML templates.',
          '<code>actuator</code> - health and metrics endpoints.',
          '<code>devtools</code> - automatic restart during development.',
          '<code>h2</code>, <code>postgresql</code>, <code>mysql</code> - database drivers.',
          '<code>mail</code>, <code>cache</code>, <code>websocket</code>, <code>kafka</code>, <code>rabbitmq</code> - integration features.',
        ],
      },
      {
        heading: 'Generating from the command line',
        body: `Initializr is a web service, so you can call it with curl and unzip the result. This is useful in scripts and when you have no browser. The generated zip contains the whole project.`,
      },
      {
        heading: 'Generating from your IDE',
        body: `IntelliJ IDEA (Ultimate) has New Project, Spring Boot (Spring Initializr). Eclipse with Spring Tools has File, New, Spring Starter Project. VS Code has the command "Spring Initializr: Create a Maven Project" from the Spring Boot extension pack. All three call the same service and show the same options.`,
      },
      {
        heading: 'What you get',
        body: `Unzip and open the folder in your IDE. You will find the wrapper scripts and .mvn folder, pom.xml, HELP.md with reference links, .gitignore and .gitattributes, an application class in src/main/java, an application.properties file plus empty static and templates folders in src/main/resources, and a test class in src/test/java. The generated application class and test look like the example below.`,
      },
    ],
    examples: [
      {
        caption: 'Generate a Spring Boot 4.1.1 project with curl (this exact request was tested)',
        code: `curl "https://start.spring.io/starter.zip?type=maven-project&language=java&bootVersion=4.1.1&javaVersion=17&groupId=com.webnest&artifactId=hello&name=hello&packageName=com.webnest.hello&dependencies=web,actuator,devtools" -o hello.zip

unzip hello.zip -d hello
cd hello
ls`,
        output: `HELP.md
mvnw
mvnw.cmd
pom.xml
src`,
      },
      {
        caption: 'The generated application class and test (Spring Boot 4.1)',
        code: `package com.webnest.hello;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HelloApplication {

    public static void main(String[] args) {
        SpringApplication.run(HelloApplication.class, args);
    }
}

// src/test/java/com/webnest/hello/HelloApplicationTests.java
@SpringBootTest
class HelloApplicationTests {

    @Test
    void contextLoads() {
    }
}`,
      },
    ],
    commonMistakes: [
      'Choosing a Java version in Initializr that is newer than the JDK installed on your machine.',
      'Picking a SNAPSHOT or milestone Spring Boot version for a project you intend to keep.',
      'Adding many dependencies "for later". Every starter adds auto-configuration and startup time; add them when you need them.',
      'Adding Spring Data JPA without a database driver or datasource. The application then fails at startup because it cannot configure a DataSource.',
      'Forgetting to unzip the file and trying to open the zip in the IDE.',
    ],
    keyPoints: [
      'start.spring.io generates a compatible, runnable project in seconds.',
      'You choose build tool, language, Boot version, packaging, Java version and dependencies.',
      'The same service is available from the website, IDEs and curl.',
      'The result includes the wrapper, pom.xml or build.gradle, an application class, properties and a test.',
    ],
  },

  'your-first-spring-application': {
    title: 'Your First Spring Application',
    intro: `In this lesson you will build a complete plain Spring Framework application (no Spring Boot) and run it. It is small on purpose: one service, one component that depends on it, one configuration class, and a main method that starts the container. But it demonstrates the two ideas that everything else in Spring builds on: the container creates the objects, and it injects dependencies for you.

Every file below was compiled and executed with Spring Framework 7.0.9 on Java 17, and the output shown is the real output.`,
    sections: [
      {
        heading: 'What we are building',
        body: `The application prints a greeting. A <code>MessageService</code> knows how to build the greeting text. A <code>GreetingPrinter</code> needs a MessageService and prints the result. A configuration class tells Spring where to look for these classes, and <code>Main</code> starts the container and asks it for the printer. Notice that no class ever writes new MessageService().`,
      },
      {
        heading: 'Step 1: the service bean',
        body: `Annotate a class with <code>@Service</code> (or <code>@Component</code>, <code>@Repository</code>, <code>@Controller</code>) and Spring treats it as a bean when it finds it during component scanning. These four annotations behave the same way for the container. They differ only in meaning: Service marks business logic, Repository marks data access, and Controller marks web endpoints.`,
      },
      {
        heading: 'Step 2: constructor injection',
        body: `GreetingPrinter declares MessageService in its constructor. When a class has only one constructor, Spring uses it automatically, and no @Autowired annotation is needed. Constructor injection is the recommended style: the field can be final, the object can never exist in a half-built state, and tests can simply pass a fake through the constructor.`,
      },
      {
        heading: 'Step 3: configuration and component scanning',
        body: `<code>@Configuration</code> marks a class as a source of bean definitions, and <code>@ComponentScan("com.webnest.first")</code> tells Spring to scan that package for annotated classes. Without the scan, the container would start empty and getBean would fail.`,
      },
      {
        heading: 'Step 4: start the container',
        body: `<code>AnnotationConfigApplicationContext</code> is an ApplicationContext that reads annotation-based configuration. Creating it starts the container: it scans, creates the singleton beans, injects dependencies, and calls lifecycle callbacks. Using it in a try-with-resources block closes the context and shuts the container down cleanly.`,
      },
      {
        heading: 'Reading the output',
        body: `The first line is the greeting. The second line lists every bean name in the container. You wrote only three classes, but the container holds seven beans: your appConfig, greetingPrinter and messageService, plus four internal infrastructure processors that Spring registers itself to handle configuration classes, @Autowired, and event listeners. Bean names default to the class name with a lowercase first letter.`,
      },
      {
        heading: 'Run it',
        body: `From the project root run <code>mvn compile exec:java</code> if you configured the exec plugin, or simply run the Main class from your IDE. Try the experiments in the exercise below to see the container fail in instructive ways.`,
      },
    ],
    examples: [
      {
        caption: 'MessageService.java and GreetingPrinter.java',
        code: `package com.webnest.first;

import org.springframework.stereotype.Service;

@Service
public class MessageService {

    public String greet(String name) {
        return "Hello, " + name + "! Welcome to Spring.";
    }
}

// ---------------------------------------------------------

package com.webnest.first;

import org.springframework.stereotype.Component;

@Component
public class GreetingPrinter {

    private final MessageService messageService;

    // Spring sees a single constructor and injects MessageService automatically.
    public GreetingPrinter(MessageService messageService) {
        this.messageService = messageService;
    }

    public void printFor(String name) {
        System.out.println(messageService.greet(name));
    }
}`,
      },
      {
        caption: 'AppConfig.java and Main.java (run this to start the container)',
        code: `package com.webnest.first;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan("com.webnest.first")
public class AppConfig {
}

// ---------------------------------------------------------

package com.webnest.first;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class Main {

    public static void main(String[] args) {
        try (var context = new AnnotationConfigApplicationContext(AppConfig.class)) {
            GreetingPrinter printer = context.getBean(GreetingPrinter.class);
            printer.printFor("Vansh");
            System.out.println("Beans in the container: "
                    + String.join(", ", context.getBeanDefinitionNames()));
        }
    }
}`,
        output: `Hello, Vansh! Welcome to Spring.
Beans in the container: org.springframework.context.annotation.internalConfigurationAnnotationProcessor, org.springframework.context.annotation.internalAutowiredAnnotationProcessor, org.springframework.context.event.internalEventListenerProcessor, org.springframework.context.event.internalEventListenerFactory, appConfig, greetingPrinter, messageService`,
      },
    ],
    commonMistakes: [
      'Forgetting @ComponentScan (or scanning the wrong package). Spring then throws NoSuchBeanDefinitionException when you call getBean.',
      'Creating the object yourself with new GreetingPrinter(...). That object is not managed by Spring, so nothing is injected into it.',
      'Putting the classes in a package outside the scanned base package.',
      'Adding two constructors without marking one with @Autowired; Spring cannot tell which one to use.',
      'Not closing the context. Use try-with-resources or call close() so destroy callbacks run.',
    ],
    keyPoints: [
      'The container creates beans from classes found by component scanning and injects their dependencies.',
      'A class with a single constructor needs no @Autowired; constructor injection is the preferred style.',
      'AnnotationConfigApplicationContext starts a container from annotation-based configuration.',
      'Default bean names are the class name with a lowercase first letter (messageService).',
    ],
  },

  'your-first-spring-boot-web-application': {
    title: 'Your First Spring Boot Web Application',
    intro: `Now the same container idea, but with Spring Boot: a real web application that answers HTTP requests. You will generate the project, add one controller, run it, call it with curl, and read the startup log line by line so that none of it looks like magic.

The project and every output below were produced with Spring Boot 4.1.1 on Java 17. The dependencies were Spring Web, Actuator and DevTools.`,
    sections: [
      {
        heading: 'Step 1: generate and open the project',
        body: `Create the project with Spring Initializr as shown in the previous lesson (Maven, Java, Spring Boot 4.1.1, dependencies web, actuator, devtools) and open it in your IDE. The generated <code>HelloApplication</code> class already contains everything Boot needs.`,
      },
      {
        heading: 'Step 2: add a REST controller',
        body: `Create a class in the same package or a sub-package of the application class. <code>@RestController</code> combines @Controller and @ResponseBody, so returned values are written directly to the HTTP response. <code>@GetMapping("/hello")</code> maps GET requests for /hello to the method, and <code>@RequestParam</code> reads the query parameter name, with a default value when it is missing.

The package matters. @SpringBootApplication includes component scanning of its own package and everything below it, so a controller in a completely different package is silently ignored.`,
      },
      {
        heading: 'Step 3: run the application',
        body: `You can run in three ways: click the run arrow in your IDE, run <code>./mvnw spring-boot:run</code>, or build with <code>./mvnw package</code> and run <code>java -jar target/hello-0.0.1-SNAPSHOT.jar</code>. A successful start prints the Spring Boot banner and log lines that end with "Started HelloApplication".`,
      },
      {
        heading: 'Step 4: call the endpoints',
        body: `While the application runs, open http://localhost:8080/hello in a browser, or use curl. Because we added the Actuator starter, the health endpoint is also available. An unknown path returns HTTP 404. The exact responses are shown in the example.`,
      },
      {
        heading: 'Reading the startup log',
        body: `Each log line tells a story. "Starting HelloApplication ... using Java 17.0.12" confirms the JDK. "No active profile set, falling back to 1 default profile" means no Spring profile was activated. "Tomcat initialized with port 8080" shows the embedded server; Boot 4.1.1 uses Tomcat 11.0, which implements Servlet 6.1. "Root WebApplicationContext: initialization completed in 1155 ms" is the container becoming ready. "Exposing 1 endpoint beneath base path '/actuator'" comes from the Actuator starter. Finally "Started HelloApplication in 2.557 seconds" means the application is ready.`,
      },
      {
        heading: 'What Spring Boot did for you',
        body: `You wrote one controller, and Boot did the rest: it found the web starter on the classpath and auto-configured an embedded Tomcat, a DispatcherServlet, JSON conversion, error handling and static resource handling. You can see how it decided by starting the application with the debug flag (--debug), which prints the auto-configuration report.`,
      },
    ],
    examples: [
      {
        caption: 'HelloController.java',
        code: `package com.webnest.hello;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello(@RequestParam(defaultValue = "World") String name) {
        return "Hello, " + name + "!";
    }
}`,
      },
      {
        caption: 'Startup log (trimmed for width) from a real run',
        code: `./mvnw spring-boot:run
# or:  java -jar target/hello-0.0.1-SNAPSHOT.jar`,
        output: `  .   ____          _            __ _ _
 /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
 \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\\__, | / / / /
 =========|_|==============|___/=/_/_/_/

 :: Spring Boot ::                (v4.1.1)

INFO ... [hello] com.webnest.hello.HelloApplication : Starting HelloApplication v0.0.1-SNAPSHOT using Java 17.0.12
INFO ... [hello] com.webnest.hello.HelloApplication : No active profile set, falling back to 1 default profile: "default"
INFO ... [hello] o.s.boot.tomcat.TomcatWebServer    : Tomcat initialized with port 8080 (http)
INFO ... [hello] o.apache.catalina.core.StandardEngine : Starting Servlet engine: [Apache Tomcat/11.0.24]
INFO ... [hello] b.w.c.s.WebApplicationContextInitializer : Root WebApplicationContext: initialization completed in 1155 ms
INFO ... [hello] o.s.b.a.e.web.EndpointLinksResolver : Exposing 1 endpoint beneath base path '/actuator'
INFO ... [hello] o.s.boot.tomcat.TomcatWebServer    : Tomcat started on port 8080 (http) with context path '/'
INFO ... [hello] com.webnest.hello.HelloApplication : Started HelloApplication in 2.557 seconds (process running for 3.031)`,
      },
      {
        caption: 'Calling the running application with curl',
        code: `curl http://localhost:8080/hello
curl "http://localhost:8080/hello?name=Vansh"
curl http://localhost:8080/actuator/health
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/nope`,
        output: `Hello, World!
Hello, Vansh!
{"groups":["liveness","readiness"],"status":"UP"}
404`,
      },
    ],
    commonMistakes: [
      'Placing the controller in a package outside the application class package; it is never scanned and every request returns 404.',
      'Using @Controller instead of @RestController and getting a "template not found" error, because Spring tries to resolve a view named after the returned string.',
      'Running two instances at once. The second fails because port 8080 is already in use.',
      'Expecting changes to appear without a restart. Add Spring Boot DevTools or rebuild.',
      'Editing files under target. That folder is regenerated by every build.',
    ],
    keyPoints: [
      'One class with @SpringBootApplication plus one @RestController is a complete web application.',
      'Component scanning covers the application class package and all sub-packages.',
      'Boot 4.1.1 embeds Tomcat 11 and listens on port 8080 by default.',
      'The startup log shows the Java version, profile, port, server and total startup time.',
    ],
  },

  'running-packaging-and-troubleshooting-spring-applications': {
    title: 'Running, Packaging and Troubleshooting Spring Applications',
    intro: `Writing the code is half the job. You also need to run the application in different ways, change its port and settings, package it into a single executable jar, and diagnose the errors that every beginner meets. This lesson covers all four, and it ends with a troubleshooting table of the most common startup problems and their fixes.`,
    sections: [
      {
        heading: 'Three ways to run a Spring Boot application',
        body: `Use the one that suits the moment.`,
        list: [
          '<strong>From the IDE</strong> - run the main class. Best for debugging with breakpoints.',
          '<strong>With the build tool</strong> - <code>./mvnw spring-boot:run</code> (Maven) or <code>./gradlew bootRun</code> (Gradle). Best for quick runs from the terminal.',
          '<strong>As a jar</strong> - <code>java -jar target/app.jar</code>. This is how applications run in production and in Docker.',
        ],
      },
      {
        heading: 'Packaging an executable jar',
        body: `Running <code>./mvnw package</code> compiles the code, runs the tests, and produces <code>target/hello-0.0.1-SNAPSHOT.jar</code>. This is a "fat jar" (also called an uber jar): it contains your classes, every dependency, and the embedded Tomcat, so it runs anywhere a JDK exists. The jar for our small web and actuator project was about 21 MB. Add <code>-DskipTests</code> to skip tests while experimenting, but never in your real pipeline.`,
      },
      {
        heading: 'Changing the port and other settings',
        body: `Spring Boot reads configuration from many places, and the later sources win. The most common are: <code>application.properties</code> in src/main/resources, environment variables, and command-line arguments. To change the port you can do any of the following: write <code>server.port=9090</code> in application.properties, set the environment variable <code>SERVER_PORT=9090</code>, or add <code>--server.port=9090</code> after the jar name. The command-line value overrides the file. The full configuration model is covered in the Spring Boot course.`,
      },
      {
        heading: 'Reading errors: start at the bottom, find "Caused by"',
        body: `Java stack traces are long, and beginners panic. Ignore the wall of text and look at the last "Caused by:" line. That is the root cause, and the lines above it are only the chain of callers. Boot also prints a friendly "APPLICATION FAILED TO START" box with a Description and an Action for the most common failures, such as a port already in use. Read the Action line first.`,
      },
      {
        heading: 'Common problems and fixes',
        body: `These are the errors you are most likely to meet in your first weeks. Each one has a specific cause, so read the message rather than guessing.`,
        list: [
          '<strong>The JAVA_HOME environment variable is not defined correctly</strong> - JAVA_HOME points to the wrong folder. Point it at the JDK root (the folder containing bin), open a new terminal and retry.',
          '<strong>release version 21 not supported</strong> (or similar) - the pom asks for a newer Java than your JDK. Install that JDK, or lower java.version to a release you have.',
          '<strong>Web server failed to start. Port 8080 was already in use</strong> - another process owns the port. Stop it, or run this application on another port.',
          '<strong>No qualifying bean of type ...</strong> - Spring cannot find a bean to inject. The class is missing an annotation, or it sits outside the scanned packages.',
          '<strong>Failed to determine a suitable driver class / Failed to configure a DataSource</strong> - you added a JPA or JDBC starter but no database driver or URL. Add H2 or configure your database.',
          '<strong>package javax.servlet does not exist</strong> - old code. Current Spring uses jakarta.servlet; update the imports.',
          '<strong>404 on every request</strong> - the controller is not being scanned, or the path in the URL does not match the mapping.',
          '<strong>mvn is not recognized</strong> - Maven is not installed or not on PATH. Use the wrapper (mvnw) instead.',
        ],
      },
      {
        heading: 'Finding and freeing a busy port',
        body: `When port 8080 is busy, find the process that owns it and stop it, or choose another port. On Windows run <code>netstat -ano | findstr :8080</code> to see the process ID, then <code>taskkill /PID &lt;pid&gt; /F</code>. On macOS and Linux run <code>lsof -i :8080</code> and then <code>kill &lt;pid&gt;</code>. Often the culprit is a previous run of your own application that is still open in another terminal or IDE tab.`,
      },
    ],
    examples: [
      {
        caption: 'Build, run with a different port, and stop',
        code: `./mvnw -DskipTests package
java -jar target/hello-0.0.1-SNAPSHOT.jar --server.port=9090

# in another terminal
curl http://localhost:9090/hello`,
        output: `Hello, World!`,
      },
      {
        caption: 'What a missing JAVA_HOME looks like (from a real failed run)',
        code: `./mvnw package`,
        output: `The JAVA_HOME environment variable is not defined correctly,
this environment variable is needed to run this program.`,
      },
      {
        caption: 'Set the port in application.properties',
        code: `# src/main/resources/application.properties
spring.application.name=hello
server.port=9090`,
      },
    ],
    commonMistakes: [
      'Reading the first error line only. The root cause is at the end, after the last "Caused by".',
      'Fixing one error by deleting the .m2 cache or reinstalling the IDE instead of reading the message.',
      'Running java -jar on the small original jar. Boot produces the executable jar as the main artifact; use the file that contains BOOT-INF.',
      'Hard-coding secrets such as database passwords in application.properties and committing them to Git.',
      'Skipping tests in the real build to make errors disappear.',
    ],
    keyPoints: [
      'Run from the IDE while debugging, with spring-boot:run for quick starts, and as a jar in production.',
      'mvnw package builds a self-contained executable jar with an embedded server.',
      'Change settings with application.properties, environment variables or command-line arguments; the command line wins.',
      'Diagnose failures from the last Caused by line and the Action text in the failure box.',
    ],
  },
}
