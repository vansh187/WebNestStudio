// Spring Boot course — core platform lessons (what's new in Boot 4, DevTools,
// startup lifecycle, custom starters) and caching/Redis. Keys are slugs
// matching topics in codelabDefaults.js.
export const springBootCore = {
  'what-is-new-in-spring-boot-4': {
    title: 'What Is New in Spring Boot 4',
    intro: `Spring Boot 4.0 (November 2025) is the first new major version since Spring Boot 3 moved the ecosystem to Jakarta EE in 2022. It is built on Spring Framework 7 and brings a modular code base, Jackson 3, null-safety annotations across the portfolio, built-in API versioning, declarative HTTP clients, new test tooling and first-class OpenTelemetry. Spring Boot 4.1 followed with gRPC support and many refinements.

Whether you are starting a new project or maintaining a Boot 3 application, you will meet these changes in documentation, starters and error messages. This lesson summarises what changed, why, and what it means for your code — and gives a practical upgrade checklist.`,
    sections: [
      {
        heading: 'Platform Baseline',
        body: `The versions underneath Spring Boot 4 moved forward together:`,
        list: [
          'Java 17 minimum (Java 21 or 25 recommended for virtual threads and the latest language features).',
          'Spring Framework 7, Spring Security 7, Spring Data 2025.1, Spring Batch 6, Spring Cloud 2025.1 "Oakwood", Spring AI 2.0.',
          'Jakarta EE 11 with Servlet 6.1 — Tomcat 11 and Jetty 12.1. Undertow is no longer supported because it does not yet implement Servlet 6.1.',
          'Hibernate 7, Jackson 3, Micrometer 1.16, Kotlin 2.2, JUnit Jupiter 6 and Testcontainers 2.',
        ],
      },
      {
        heading: 'Modular Spring Boot and Renamed Starters',
        body: `The big <code>spring-boot-autoconfigure</code> jar was split into focused modules, one per technology. Starters now map to those modules, which means smaller applications and clearer dependencies. Some starters were renamed: <code>spring-boot-starter-web</code> → <code>spring-boot-starter-webmvc</code>, <code>spring-boot-starter-aop</code> → <code>spring-boot-starter-aspectj</code>, and the OAuth2 starters gained a <code>security-</code> prefix. Flyway and Liquibase now need their own starters, and every technology has a matching test starter such as <code>spring-boot-starter-webmvc-test</code>. The old names still work but are deprecated; <code>spring-boot-starter-classic</code> restores the Boot 3 layout as a temporary migration bridge.`,
      },
      {
        heading: 'Developer-Facing Features',
        body: `Several features you will use daily arrived in this generation:`,
        list: [
          '<strong>Jackson 3</strong> — new <code>tools.jackson</code> packages, immutable <code>JsonMapper</code>, unchecked exceptions (see the Jackson lesson).',
          '<strong>API versioning</strong> — <code>@GetMapping(version = "2")</code> and <code>spring.mvc.apiversion.*</code>.',
          '<strong>HTTP service clients</strong> — <code>@ImportHttpServices</code> plus <code>spring.http.serviceclient.*</code> for declarative interface clients.',
          '<strong>Resilience in core Spring</strong> — <code>@Retryable</code> and <code>@ConcurrencyLimit</code> with <code>@EnableResilientMethods</code>, no extra library.',
          '<strong>JSpecify null-safety</strong> — <code>@Nullable</code>/<code>@NonNull</code> semantics across Spring APIs, understood by IDEs and Kotlin.',
          '<strong>Testing</strong> — <code>RestTestClient</code>, <code>MockMvcTester</code>, <code>@MockitoBean</code> (the old <code>@MockBean</code> is removed).',
          '<strong>Observability</strong> — <code>spring-boot-starter-opentelemetry</code> for OTLP metrics and traces.',
          '<strong>Spring Boot 4.1</strong> — gRPC server and client support, <code>InetAddressFilter</code> against SSRF, lazy JDBC connection fetching, Redis listener support and more.',
        ],
      },
      {
        heading: 'Upgrade Checklist from Spring Boot 3',
        body: `Upgrade to the latest Spring Boot 3.5.x first and fix all deprecation warnings — Boot 4 removes APIs deprecated in 3.x. Then move to 4.0 and work through: starter renames (or temporarily add the classic starters); Jackson 3 imports and customizers; <code>@MockBean</code> → <code>@MockitoBean</code>; explicit <code>@AutoConfigureMockMvc</code>/<code>@AutoConfigureRestTestClient</code>; Spring Security 7 changes (lambda DSL only, <code>PathPatternRequestMatcher</code>); Hibernate 7 and Undertow removal. The OpenRewrite recipe <code>UpgradeSpringBoot_4_0</code> automates much of this.`,
      },
    ],
    examples: [
      {
        caption: 'A Spring Boot 4 pom.xml with the new starter names',
        code: `<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.1</version>
</parent>

<properties>
    <java.version>21</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc</artifactId>      <!-- was spring-boot-starter-web -->
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-flyway</artifactId>      <!-- new: needed for Flyway -->
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security-oauth2-resource-server</artifactId>
    </dependency>

    <!-- per-technology test starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>`,
        output: `mvn dependency:tree | findstr autoconfigure
[INFO] +- org.springframework.boot:spring-boot-webmvc:jar:4.1.1
[INFO] +- org.springframework.boot:spring-boot-data-jpa:jar:4.1.1
[INFO] +- org.springframework.boot:spring-boot-flyway:jar:4.1.1
(focused modules instead of one large spring-boot-autoconfigure jar)`,
      },
      {
        caption: 'Typical code changes when upgrading from Boot 3',
        code: `// 1. Tests: @MockBean is gone
- @MockBean ProductService service;
+ @MockitoBean ProductService service;

// 2. Jackson: new package for core classes (annotations unchanged)
- import com.fasterxml.jackson.databind.ObjectMapper;
+ import tools.jackson.databind.json.JsonMapper;

- @Bean Jackson2ObjectMapperBuilderCustomizer custom() { ... }
+ @Bean JsonMapperBuilderCustomizer custom() { ... }

// 3. Full-context tests must opt in to MockMvc
  @SpringBootTest
+ @AutoConfigureMockMvc
  class CheckoutIT { ... }

// 4. Retry without the spring-retry library
+ @EnableResilientMethods
  @SpringBootApplication
  public class ShopApplication { ... }

  @Retryable(maxRetries = 3, delay = 200)
  public Rates fetchRates() { ... }`,
        output: '(Run the OpenRewrite recipe to apply most of these automatically: mvn -U org.openrewrite.maven:rewrite-maven-plugin:run -Drewrite.recipeArtifactCoordinates=org.openrewrite.recipe:rewrite-spring:RELEASE -Drewrite.activeRecipes=org.openrewrite.java.spring.boot4.UpgradeSpringBoot_4_0)',
      },
      {
        caption: 'Using the classic starters as a temporary migration bridge',
        code: `<!-- Restores a Boot 3-like classpath so you can upgrade in small steps.
     Remove it once you have switched to the new focused starters. -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-classic</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test-classic</artifactId>
    <scope>test</scope>
</dependency>`,
        output: `Started ShopApplication in 2.4 seconds (Spring Boot 4.1.1, classic layout)`,
      },
    ],
    commonMistakes: [
      'Jumping straight from an old 2.x or early 3.x version to 4.0 instead of passing through the latest 3.5.x and fixing deprecations.',
      'Following Spring Boot 3 tutorials that use spring-boot-starter-web, @MockBean or WebSecurityConfigurerAdapter without adapting them.',
      'Keeping spring-boot-starter-classic forever instead of migrating to focused starters.',
      'Mixing Jackson 2 ObjectMapper and Jackson 3 JsonMapper configuration and getting inconsistent JSON.',
      'Assuming Undertow still works — it is not supported on Servlet 6.1 in Spring Boot 4.',
    ],
    keyPoints: [
      'Spring Boot 4 runs on Spring Framework 7, Jakarta EE 11 and Java 17+.',
      'The code base is modular; starters were renamed (webmvc, aspectj, security-oauth2-*) and test starters exist per technology.',
      'Key new features: Jackson 3, API versioning, HTTP service clients, core @Retryable, JSpecify, RestTestClient, OpenTelemetry starter.',
      'Spring Boot 4.1 adds gRPC, SSRF protection with InetAddressFilter and more.',
      'Upgrade via the latest 3.5.x, fix deprecations, then use OpenRewrite and the migration guide.',
    ],
  },

  'spring-boot-devtools': {
    title: 'Spring Boot DevTools',
    intro: `The development loop — change code, restart, check the result — happens hundreds of times a day. If each restart takes ten seconds and a manual click, that adds up quickly. <strong>Spring Boot DevTools</strong> shortens the loop: it restarts your application automatically when classes change, disables template caching, applies development-friendly defaults, and can even update an application running remotely.

This lesson explains how the automatic restart works, how to use it in IntelliJ IDEA, Eclipse and VS Code, which property defaults DevTools changes, how to exclude files from triggering restarts, and why DevTools is never included in production builds.`,
    sections: [
      {
        heading: 'Adding DevTools',
        body: `Add <code>spring-boot-devtools</code> as an <strong>optional</strong> dependency (Maven) or <code>developmentOnly</code> configuration (Gradle). DevTools disables itself automatically when the application is launched from a fully packaged jar (<code>java -jar</code>) and the build plugins exclude it from the final artifact, so it cannot leak into production.`,
      },
      {
        heading: 'How Automatic Restart Works',
        body: `DevTools uses two class loaders. Libraries that do not change (Spring, Hibernate, Jackson) are loaded once by a <strong>base</strong> class loader. Your own classes are loaded by a <strong>restart</strong> class loader. When files on the classpath change, DevTools throws away only the restart class loader and creates a new one, which is much faster than a cold start. A restart is triggered when compiled class files change — so your IDE must compile on save (automatic in Eclipse and VS Code; in IntelliJ enable "Build project automatically" and "Allow auto-make to start even if developed application is currently running").`,
      },
      {
        heading: 'Development Property Defaults',
        body: `DevTools sets defaults that suit development but not production: template caching is disabled for Thymeleaf, FreeMarker and Mustache; web request logging is more detailed (<code>spring.mvc.log-request-details</code>); error pages include more information. These defaults apply only when DevTools is active, so you do not need a separate profile for them.`,
      },
      {
        heading: 'Excluding Resources and Triggers',
        body: `Changes to static resources and templates do not need a restart — the browser simply reloads them. By default files under <code>/static</code>, <code>/public</code>, <code>/templates</code> and <code>/META-INF/resources</code> do not trigger restarts. Use <code>spring.devtools.restart.exclude</code> or <code>additional-exclude</code> to add more, <code>spring.devtools.restart.trigger-file</code> to restart only when a specific file changes (useful if your IDE compiles continuously), and <code>spring.devtools.restart.enabled=false</code> to switch restarts off.`,
      },
      {
        heading: 'When Restarts Are Not Enough',
        body: `Restarts keep the JVM but rebuild the Spring context, so in-memory state (sessions, caches, H2 data) is lost. For instant method-body changes without any restart, run the app in debug mode and use your IDE's hot swap, or a tool such as JRebel. Some libraries that cache class loaders (certain serializers) can misbehave after restarts; exclude their jars from the restart class loader with <code>META-INF/spring-devtools.properties</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Adding DevTools with Maven and Gradle',
        code: `<!-- Maven -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <optional>true</optional>
</dependency>

// Gradle (Kotlin DSL)
dependencies {
    developmentOnly("org.springframework.boot:spring-boot-devtools")
}`,
        output: `Run with mvn spring-boot:run or from the IDE:
... Devtools property defaults active! Set 'spring.devtools.add-properties' to 'false' to disable
... For additional web related logging consider setting the 'logging.level.web' property to 'DEBUG'`,
      },
      {
        caption: 'Watching a restart happen after editing a controller',
        code: `@RestController
public class GreetingController {

    @GetMapping("/greet")
    public String greet() {
        return "Hello from Webnest v2";    // edited and saved while the app is running
    }
}`,
        output: `(save file → IDE compiles → DevTools detects change)
... Restarting due to 1 class path change (0 additions, 0 deletions, 1 modification)
... Started WebnestAppApplication in 0.412 seconds (process running for 95.7)

curl http://localhost:8080/greet
Hello from Webnest v2`,
      },
      {
        caption: 'Tuning restart behaviour',
        code: `# application.yml
spring:
  devtools:
    restart:
      additional-exclude: "docs/**,generated/**"   # don't restart when these change
      poll-interval: 2s
      quiet-period: 1s
      # trigger-file: .reloadtrigger               # restart only when this file is touched`,
        output: `(Editing src/main/resources/docs/readme.md no longer restarts the application.)`,
      },
    ],
    commonMistakes: [
      'Adding DevTools without optional/developmentOnly, so it ends up as a normal dependency of other modules.',
      'Expecting restarts in IntelliJ without enabling automatic build; DevTools only reacts to compiled class changes.',
      'Relying on in-memory data (H2, caches) that disappears on every restart and assuming the code is broken.',
      'Thinking DevTools makes the production app slower — it is disabled for packaged jars and excluded from the build.',
      'Putting frequently regenerated files on the classpath, causing endless restart loops.',
    ],
    keyPoints: [
      'spring-boot-devtools gives automatic restarts and development-friendly defaults.',
      'Two class loaders make restarts far faster than a cold start.',
      'Restarts are triggered by compiled class changes; enable build-on-save in your IDE.',
      'Static files and templates do not trigger restarts; configure exclusions and trigger files as needed.',
      'DevTools is automatically disabled in packaged jars and excluded from production builds.',
    ],
  },

  'application-startup-runners-and-lifecycle-events': {
    title: 'Application Startup: Runners and Lifecycle Events',
    intro: `Many applications need to do something when they start — load reference data, warm a cache, validate configuration, print a summary, or start a background consumer — and something when they stop, like flushing buffers or finishing in-flight work. Spring Boot offers several hooks for this, each running at a different moment of the lifecycle.

This lesson walks through the startup sequence of <code>SpringApplication</code>, <code>CommandLineRunner</code> and <code>ApplicationRunner</code>, the lifecycle events you can listen to, <code>SmartLifecycle</code> for components that start and stop, graceful shutdown, and customising <code>SpringApplication</code> itself.`,
    sections: [
      {
        heading: 'The Startup Sequence',
        body: `When <code>SpringApplication.run()</code> executes, events are published in a fixed order: <code>ApplicationStartingEvent</code> → <code>ApplicationEnvironmentPreparedEvent</code> (configuration loaded) → <code>ApplicationContextInitializedEvent</code> → <code>ApplicationPreparedEvent</code> (bean definitions loaded) → context refresh (beans created, <code>@PostConstruct</code> runs, web server starts) → <code>ApplicationStartedEvent</code> → <strong>runners execute</strong> → <code>ApplicationReadyEvent</code> (the application is ready to serve). If anything fails, <code>ApplicationFailedEvent</code> is published instead.`,
      },
      {
        heading: 'CommandLineRunner and ApplicationRunner',
        body: `Beans implementing these interfaces run once, after the context has started and before the application is marked ready. <code>CommandLineRunner.run(String... args)</code> gets raw arguments; <code>ApplicationRunner.run(ApplicationArguments args)</code> gets parsed options (<code>--mode=import</code>) and non-option arguments. Order several runners with <code>@Order</code>. Exceptions thrown from a runner stop the application — useful for fail-fast checks. Runners are ideal for CLI-style Spring Boot tools and one-off data setup.`,
      },
      {
        heading: 'Listening to Events',
        body: `Use <code>@EventListener(ApplicationReadyEvent.class)</code> for work that should only happen once the app is fully ready — for example registering with an external system or logging a startup summary. Early events (starting, environment prepared) fire before the context exists, so their listeners must be registered via <code>SpringApplication.addListeners()</code> or <code>META-INF/spring.factories</code>, not as beans.`,
      },
      {
        heading: 'SmartLifecycle for Start/Stop Components',
        body: `Components that own a background thread or connection — a message poller, a scheduler, a socket server — should implement <code>SmartLifecycle</code>. Spring calls <code>start()</code> after all singletons are created and <code>stop()</code> during shutdown, in an order controlled by <code>getPhase()</code>. Combined with graceful shutdown, this lets in-flight work complete before the JVM exits.`,
      },
      {
        heading: 'Graceful Shutdown',
        body: `Spring Boot enables graceful shutdown by default for embedded web servers: on SIGTERM, the server stops accepting new requests and waits for active ones to finish, up to <code>spring.lifecycle.timeout-per-shutdown-phase</code> (30s by default). Then lifecycle beans stop, <code>@PreDestroy</code> methods run and the context closes. This is essential for zero-downtime deployments on Kubernetes.`,
      },
    ],
    examples: [
      {
        caption: 'CommandLineRunner and ApplicationRunner with ordering',
        code: `@Component
@Order(1)
public class SeedDataRunner implements CommandLineRunner {

    private final CourseRepository courses;

    public SeedDataRunner(CourseRepository courses) {
        this.courses = courses;
    }

    @Override
    public void run(String... args) {
        if (courses.count() == 0) {
            courses.saveAll(List.of(new Course("java-core", "Java - Core"),
                                    new Course("spring-boot", "Spring Boot")));
            System.out.println("Seeded 2 courses");
        }
    }
}

@Component
@Order(2)
public class ImportRunner implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) {
        if (args.containsOption("import")) {
            String file = args.getOptionValues("import").get(0);
            System.out.println("Importing students from " + file);
        }
        System.out.println("Non-option args: " + args.getNonOptionArgs());
    }
}`,
        output: `java -jar app.jar --import=students.csv dry-run

Seeded 2 courses
Importing students from students.csv
Non-option args: [dry-run]
Started WebnestAppApplication in 2.1 seconds`,
      },
      {
        caption: 'Reacting to ApplicationReadyEvent and failing fast on bad configuration',
        code: `@Component
public class StartupReporter {

    private static final Logger log = LoggerFactory.getLogger(StartupReporter.class);
    private final Environment env;

    public StartupReporter(Environment env) {
        this.env = env;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ready(ApplicationReadyEvent event) {
        log.info("Ready on port {} with profiles {} in {} ms",
            env.getProperty("local.server.port"),
            Arrays.toString(env.getActiveProfiles()),
            event.getTimeTaken().toMillis());
    }
}

@Component
class RequiredConfigCheck implements ApplicationRunner {

    @Value("\${payments.api-key:}")
    private String apiKey;

    @Override
    public void run(ApplicationArguments args) {
        if (apiKey.isBlank()) {
            throw new IllegalStateException("payments.api-key must be set");   // stops the app
        }
    }
}`,
        output: `INFO  StartupReporter : Ready on port 8080 with profiles [dev] in 2143 ms

(without the key)
ERROR SpringApplication : Application run failed
java.lang.IllegalStateException: payments.api-key must be set`,
      },
      {
        caption: 'A SmartLifecycle background worker with graceful shutdown',
        code: `@Component
public class OutboxPublisher implements SmartLifecycle {

    private static final Logger log = LoggerFactory.getLogger(OutboxPublisher.class);
    private final ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();
    private volatile boolean running;

    @Override
    public void start() {
        running = true;
        executor.scheduleWithFixedDelay(this::publishPending, 0, 1, TimeUnit.SECONDS);
        log.info("Outbox publisher started");
    }

    @Override
    public void stop() {
        running = false;
        executor.shutdown();
        try {
            executor.awaitTermination(10, TimeUnit.SECONDS);   // finish the current batch
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        log.info("Outbox publisher stopped");
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    private void publishPending() { /* read outbox table, send events */ }
}

# application.yml
server:
  shutdown: graceful          # default in Spring Boot, shown for clarity
spring:
  lifecycle:
    timeout-per-shutdown-phase: 20s`,
        output: `INFO  Outbox publisher started
(Ctrl+C / SIGTERM)
INFO  GracefulShutdown : Commencing graceful shutdown. Waiting for active requests to complete
INFO  GracefulShutdown : Graceful shutdown complete
INFO  Outbox publisher stopped`,
      },
      {
        caption: 'Customising SpringApplication',
        code: `public static void main(String[] args) {
    SpringApplication app = new SpringApplication(WebnestAppApplication.class);
    app.setBannerMode(Banner.Mode.OFF);
    app.setDefaultProperties(Map.of("server.port", "8081"));
    app.addListeners((ApplicationListener<ApplicationEnvironmentPreparedEvent>) e ->
        System.out.println("Environment ready, profiles = "
            + Arrays.toString(e.getEnvironment().getActiveProfiles())));
    app.run(args);
}`,
        output: `Environment ready, profiles = []
Tomcat started on port 8081 (http)`,
      },
    ],
    commonMistakes: [
      'Doing slow work (large imports) in @PostConstruct, delaying startup and blocking health checks; use a runner or ApplicationReadyEvent and consider async execution.',
      'Swallowing exceptions in startup checks, so a misconfigured application starts "successfully" and fails later.',
      'Registering early lifecycle event listeners as @Component beans; they fire before the context exists and never reach the bean.',
      'Starting threads in constructors without stopping them, preventing clean shutdown.',
      'Setting a Kubernetes termination grace period shorter than the Spring shutdown timeout, so pods are killed mid-request.',
    ],
    keyPoints: [
      'SpringApplication publishes lifecycle events from ApplicationStartingEvent to ApplicationReadyEvent.',
      'CommandLineRunner and ApplicationRunner run once after startup; order them with @Order.',
      'Use @EventListener(ApplicationReadyEvent.class) for work that needs a fully ready app.',
      'SmartLifecycle manages components with start/stop behaviour and phases.',
      'Graceful shutdown lets active requests finish; tune spring.lifecycle.timeout-per-shutdown-phase.',
    ],
  },

  'creating-a-custom-starter': {
    title: 'Creating a Custom Spring Boot Starter',
    intro: `Large organisations often repeat the same configuration in every service: an audit client, a standard security setup, company-wide logging, a client for an internal API. Copying that code leads to drift and bugs. The Spring Boot way to share it is to build your own <strong>starter</strong> — a dependency that brings the right libraries and auto-configures beans, exactly like the official starters do.

This lesson builds a complete starter step by step: the auto-configuration class, conditions, configuration properties with IDE metadata, the registration file, the starter module, and tests with <code>ApplicationContextRunner</code>.`,
    sections: [
      {
        heading: 'Anatomy of a Starter',
        body: `By convention a starter has two modules. The <strong>autoconfigure</strong> module (<code>acme-audit-spring-boot-autoconfigure</code>) contains <code>@AutoConfiguration</code> classes and <code>@ConfigurationProperties</code>. The <strong>starter</strong> module (<code>acme-audit-spring-boot-starter</code>) is an almost empty POM that depends on the autoconfigure module and the libraries it needs. For small internal starters, a single module is fine. Do not name your artifacts <code>spring-boot-*</code>; that prefix is reserved for official Spring Boot modules.`,
      },
      {
        heading: 'Auto-Configuration Classes and Conditions',
        body: `An <code>@AutoConfiguration</code> class is a <code>@Configuration</code> that Spring Boot loads only if it is listed in <code>META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports</code>. Conditions decide whether each bean is created:`,
        list: [
          '<code>@ConditionalOnClass</code> — only if a class is on the classpath.',
          '<code>@ConditionalOnMissingBean</code> — only if the user has not defined their own bean; this is what makes your defaults overridable.',
          '<code>@ConditionalOnProperty</code> — only if a property has a certain value, e.g. <code>acme.audit.enabled=true</code>.',
          '<code>@ConditionalOnBean</code>, <code>@ConditionalOnWebApplication</code>, <code>@ConditionalOnResource</code> and more.',
          '<code>@AutoConfiguration(after = ...)</code> — order relative to other auto-configurations.',
        ],
      },
      {
        heading: 'Configuration Properties and Metadata',
        body: `Expose settings with a <code>@ConfigurationProperties</code> record and enable it with <code>@EnableConfigurationProperties</code> on the auto-configuration. Add the <code>spring-boot-configuration-processor</code> annotation processor so the build generates <code>META-INF/spring-configuration-metadata.json</code>; IDEs then offer auto-completion and documentation for your properties in <code>application.yml</code>.`,
      },
      {
        heading: 'Testing with ApplicationContextRunner',
        body: `<code>ApplicationContextRunner</code> starts tiny application contexts in milliseconds, with chosen auto-configurations, user configurations and properties. You can assert which beans exist, that user beans win over defaults, and that bad configuration fails. Use <code>FilteredClassLoader</code> to simulate a library being absent.`,
      },
    ],
    examples: [
      {
        caption: 'The library code the starter will configure',
        code: `package com.acme.audit;

public class AuditClient {

    private final String serviceName;
    private final URI endpoint;
    private final boolean async;

    public AuditClient(String serviceName, URI endpoint, boolean async) {
        this.serviceName = serviceName;
        this.endpoint = endpoint;
        this.async = async;
    }

    public void record(String action, String user) {
        System.out.printf("[audit %s -> %s async=%s] %s by %s%n", serviceName, endpoint, async, action, user);
    }
}`,
        output: '(Plain Java class — the starter\'s job is to create and configure it automatically.)',
      },
      {
        caption: 'Properties, auto-configuration and registration file',
        code: `@ConfigurationProperties(prefix = "acme.audit")
public record AuditProperties(
        /** Whether auditing is enabled. */
        @DefaultValue("true") boolean enabled,
        /** Audit collector URL. */
        @DefaultValue("http://audit.acme.internal/events") URI endpoint,
        /** Send events asynchronously. */
        @DefaultValue("true") boolean async) {}

@AutoConfiguration
@ConditionalOnClass(AuditClient.class)
@ConditionalOnProperty(prefix = "acme.audit", name = "enabled", havingValue = "true", matchIfMissing = true)
@EnableConfigurationProperties(AuditProperties.class)
public class AuditAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean                  // users can replace it with their own bean
    AuditClient auditClient(AuditProperties props, Environment env) {
        String service = env.getProperty("spring.application.name", "unknown-service");
        return new AuditClient(service, props.endpoint(), props.async());
    }
}

# src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
com.acme.audit.autoconfigure.AuditAutoConfiguration`,
        output: `(Any application that adds the starter gets an AuditClient bean automatically.)`,
      },
      {
        caption: 'Starter POM and usage in an application',
        code: `<!-- acme-audit-spring-boot-starter/pom.xml -->
<artifactId>acme-audit-spring-boot-starter</artifactId>
<dependencies>
    <dependency>
        <groupId>com.acme</groupId>
        <artifactId>acme-audit-spring-boot-autoconfigure</artifactId>
    </dependency>
    <dependency>
        <groupId>com.acme</groupId>
        <artifactId>acme-audit-client</artifactId>
    </dependency>
</dependencies>

<!-- autoconfigure module: generate IDE metadata -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>

// In a consuming application — nothing to configure except optional properties
@Service
public class RefundService {
    private final AuditClient audit;
    public RefundService(AuditClient audit) { this.audit = audit; }

    public void refund(String orderId, String user) {
        audit.record("REFUND " + orderId, user);
    }
}`,
        output: `[audit orders-service -> http://audit.acme.internal/events async=true] REFUND WN-10231 by ravi@webnest.in`,
      },
      {
        caption: 'Testing the auto-configuration with ApplicationContextRunner',
        code: `class AuditAutoConfigurationTest {

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
        .withConfiguration(AutoConfigurations.of(AuditAutoConfiguration.class));

    @Test
    void createsClientByDefault() {
        runner.run(ctx -> assertThat(ctx).hasSingleBean(AuditClient.class));
    }

    @Test
    void canBeDisabled() {
        runner.withPropertyValues("acme.audit.enabled=false")
              .run(ctx -> assertThat(ctx).doesNotHaveBean(AuditClient.class));
    }

    @Test
    void userBeanWins() {
        runner.withBean("custom", AuditClient.class,
                () -> new AuditClient("custom", URI.create("http://localhost"), false))
              .run(ctx -> assertThat(ctx).getBean(AuditClient.class)
                      .isSameAs(ctx.getBean("custom")));
    }

    @Test
    void backsOffWhenLibraryIsMissing() {
        runner.withClassLoader(new FilteredClassLoader(AuditClient.class))
              .run(ctx -> assertThat(ctx).doesNotHaveBean("auditClient"));
    }
}`,
        output: `AuditAutoConfigurationTest
  ✔ createsClientByDefault()
  ✔ canBeDisabled()
  ✔ userBeanWins()
  ✔ backsOffWhenLibraryIsMissing()
(all four run in under a second)`,
      },
    ],
    commonMistakes: [
      'Annotating auto-configuration classes with @Component or putting them in a package scanned by the application, so conditions and ordering are bypassed.',
      'Forgetting @ConditionalOnMissingBean, making it impossible for applications to override your defaults.',
      'Listing auto-configurations in the old spring.factories file, which Spring Boot 3+ no longer reads for auto-configuration.',
      'Naming your artifact spring-boot-starter-xyz, which is reserved for official starters.',
      'Skipping the configuration processor, leaving users without IDE auto-completion for your properties.',
    ],
    keyPoints: [
      'A starter = autoconfigure module (@AutoConfiguration + properties) + starter POM that pulls dependencies.',
      'Register auto-configurations in META-INF/spring/...AutoConfiguration.imports.',
      'Use conditions — especially @ConditionalOnMissingBean — so defaults back off gracefully.',
      'Expose settings with @ConfigurationProperties and generate metadata with the configuration processor.',
      'Test auto-configurations quickly with ApplicationContextRunner.',
    ],
  },

  'caching-with-spring-cache': {
    title: 'Caching with the Spring Cache Abstraction',
    intro: `Some data is expensive to compute or fetch and changes rarely: the course catalogue, exchange rates, a user's permissions, a third-party API response. Fetching it on every request wastes database time and money. A cache keeps recent results in fast storage so repeated requests are answered instantly.

Spring's cache abstraction lets you add caching with annotations — <code>@Cacheable</code>, <code>@CachePut</code>, <code>@CacheEvict</code> — independent of the cache technology. This lesson covers enabling caching, cache keys and conditions, keeping caches up to date, choosing and configuring providers (Caffeine locally, Redis for distributed caching), expiry, and common caching pitfalls.`,
    sections: [
      {
        heading: 'Enabling Caching',
        body: `Add <code>@EnableCaching</code> to a configuration class and <code>spring-boot-starter-cache</code>. Without any provider, Spring Boot uses a simple <code>ConcurrentHashMap</code>-based cache — fine for demos but without expiry or size limits. Add Caffeine for a high-performance local cache, EhCache (through the JCache/JSR-107 API) when you need off-heap or disk tiers, or Redis for a cache shared by all instances. Spring Boot detects the provider and configures a <code>CacheManager</code>.`,
      },
      {
        heading: 'The Annotations',
        body: `Caching is applied through proxies, like transactions:`,
        list: [
          '<code>@Cacheable("courses")</code> — return the cached value if present; otherwise run the method and store the result.',
          '<code>@CachePut</code> — always run the method and update the cache with the result (after an update).',
          '<code>@CacheEvict</code> — remove an entry, or all entries with <code>allEntries = true</code> (after a delete or bulk change).',
          '<code>@Caching</code> — combine several operations on one method; <code>@CacheConfig</code> sets defaults for a class.',
        ],
      },
      {
        heading: 'Keys and Conditions',
        body: `The default key is built from all method parameters. Use SpEL to choose: <code>key = "#slug"</code>, <code>key = "#user.id"</code>, or a custom <code>KeyGenerator</code>. <code>condition</code> decides whether to use the cache at all (checked before the call) and <code>unless</code> vetoes storing a result (checked after, e.g. <code>unless = "#result == null"</code>). <code>sync = true</code> ensures only one thread computes a missing value while others wait — protecting against a stampede on a popular key.`,
      },
      {
        heading: 'Expiry and Consistency',
        body: `Every cache trades freshness for speed. Decide per cache how stale data may be and set a time-to-live accordingly. Evict or update entries when your application changes the underlying data. If other systems also modify the data, a short TTL is your safety net. Remember that cached objects must be serialisable for distributed caches, and that the same caching proxy rules apply as for <code>@Transactional</code>: self-invocation bypasses the cache.`,
      },
    ],
    examples: [
      {
        caption: 'Caching a slow lookup with @Cacheable',
        code: `@Configuration
@EnableCaching
public class CacheConfig {}

@Service
public class CourseCatalogService {

    private static final Logger log = LoggerFactory.getLogger(CourseCatalogService.class);
    private final CourseRepository courses;

    public CourseCatalogService(CourseRepository courses) {
        this.courses = courses;
    }

    @Cacheable(cacheNames = "courseBySlug", key = "#slug", unless = "#result == null")
    public CourseDto findBySlug(String slug) {
        log.info("Loading course {} from the database", slug);
        return courses.findBySlug(slug).map(CourseDto::from).orElse(null);
    }
}`,
        output: `GET /api/courses/spring-boot   -> INFO Loading course spring-boot from the database   (35 ms)
GET /api/courses/spring-boot   -> (no log, served from cache)                         (1 ms)
GET /api/courses/java-core     -> INFO Loading course java-core from the database`,
      },
      {
        caption: 'Keeping the cache consistent with @CachePut and @CacheEvict',
        code: `@Service
@CacheConfig(cacheNames = "courseBySlug")
public class CourseAdminService {

    private final CourseRepository courses;

    public CourseAdminService(CourseRepository courses) {
        this.courses = courses;
    }

    @CachePut(key = "#result.slug()")
    @Transactional
    public CourseDto update(String slug, UpdateCourseRequest req) {
        Course c = courses.findBySlug(slug).orElseThrow();
        c.setTitle(req.title());
        c.setPrice(req.price());
        return CourseDto.from(c);
    }

    @CacheEvict(key = "#slug")
    @Transactional
    public void delete(String slug) {
        courses.deleteBySlug(slug);
    }

    @CacheEvict(allEntries = true)
    public void reloadCatalog() {
        // called after a bulk import
    }
}`,
        output: `update("spring-boot", {title:"Spring Boot 4", ...}) -> cache entry "spring-boot" replaced with new title
delete("html")                                      -> cache entry "html" removed
reloadCatalog()                                     -> all "courseBySlug" entries removed`,
      },
      {
        caption: 'Caffeine as a local cache with size limits and expiry',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>

# application.yml
spring:
  cache:
    cache-names: courseBySlug, exchangeRates
    caffeine:
      spec: maximumSize=10000,expireAfterWrite=10m,recordStats
management:
  endpoints:
    web:
      exposure:
        include: health, caches, metrics`,
        output: `GET /actuator/caches
{"cacheManagers":{"cacheManager":{"caches":{"courseBySlug":{"target":"com.github.benmanes.caffeine.cache.BoundedLocalCache$..."},"exchangeRates":{...}}}}}

GET /actuator/metrics/cache.gets?tag=name:courseBySlug&tag=result:hit
{"measurements":[{"statistic":"COUNT","value":1842.0}]}`,
      },
      {
        caption: 'EhCache 3 as the provider through JCache (JSR-107)',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>javax.cache</groupId>
    <artifactId>cache-api</artifactId>
</dependency>
<dependency>
    <groupId>org.ehcache</groupId>
    <artifactId>ehcache</artifactId>
    <classifier>jakarta</classifier>
</dependency>

# application.yml
spring:
  cache:
    jcache:
      config: classpath:ehcache.xml

<!-- src/main/resources/ehcache.xml -->
<config xmlns="http://www.ehcache.org/v3">
    <cache alias="courseBySlug">
        <key-type>java.lang.String</key-type>
        <value-type>com.webnest.shop.course.CourseDto</value-type>
        <expiry><ttl unit="minutes">30</ttl></expiry>
        <resources>
            <heap unit="entries">2000</heap>
            <offheap unit="MB">32</offheap>     <!-- EhCache can also use off-heap memory and disk -->
        </resources>
    </cache>
</config>`,
        output: `Cache manager: JCacheCacheManager (org.ehcache.jsr107.EhcacheCachingProvider)
(The same @Cacheable code now uses EhCache — only dependencies and configuration changed.)`,
      },
      {
        caption: 'Preventing a cache stampede with sync = true',
        code: `@Cacheable(cacheNames = "exchangeRates", key = "#base", sync = true)
public Map<String, BigDecimal> ratesFor(String base) {
    // slow external API call: only ONE thread per key executes it at a time
    return ratesClient.fetch(base);
}`,
        output: `100 concurrent requests for "INR" after the entry expires
-> 1 call to the external rates API, 99 requests wait and reuse the result`,
      },
    ],
    commonMistakes: [
      'Caching without any expiry or size limit, eventually exhausting memory with the default ConcurrentHashMap cache.',
      'Forgetting to evict or update the cache when data changes, serving stale data indefinitely.',
      'Calling a @Cacheable method from the same class, bypassing the proxy so the cache is never used.',
      'Caching mutable objects and then modifying them, silently changing the cached value for everyone.',
      'Using a local cache in a multi-instance deployment where every instance may hold different values; use Redis or short TTLs.',
    ],
    keyPoints: [
      '@EnableCaching plus @Cacheable, @CachePut and @CacheEvict add caching declaratively.',
      'Control keys with SpEL; use condition, unless and sync for fine control.',
      'Caffeine is an excellent local cache; Redis provides a shared distributed cache.',
      'Always define expiry and a strategy for keeping cached data consistent.',
      'Monitor hit rates via the caches and metrics Actuator endpoints.',
    ],
  },

  'redis-with-spring-boot': {
    title: 'Redis with Spring Boot',
    intro: `Redis is an in-memory data store used in almost every large web system. It is extremely fast and supports rich data structures — strings, hashes, lists, sets, sorted sets, streams — which makes it useful far beyond caching: rate limiting, leaderboards, distributed locks, session storage, queues and real-time pub/sub.

This lesson connects Spring Boot to Redis with Spring Data Redis, uses <code>StringRedisTemplate</code> and <code>RedisTemplate</code> for data structures, configures Redis as a distributed cache with per-cache TTLs, stores HTTP sessions in Redis, implements a rate limiter and a leaderboard, and uses pub/sub messaging.`,
    sections: [
      {
        heading: 'Setup',
        body: `Add <code>spring-boot-starter-data-redis</code>, which uses the Lettuce client. Configure <code>spring.data.redis.host</code>, <code>port</code>, <code>password</code> (or <code>url</code>) and SSL for managed services such as AWS ElastiCache, Azure Cache or Redis Cloud. With Docker Compose or Testcontainers, a <code>redis</code> service is wired automatically through service connections. Spring Boot auto-configures <code>RedisConnectionFactory</code>, <code>StringRedisTemplate</code> and <code>RedisTemplate</code>.`,
      },
      {
        heading: 'Templates and Serialization',
        body: `<code>StringRedisTemplate</code> stores keys and values as plain strings — readable with <code>redis-cli</code> and a good default. <code>RedisTemplate&lt;String, Object&gt;</code> can store objects, but its default JDK serialization produces unreadable binary data tied to Java class versions; configure a JSON serializer instead. <code>opsForValue()</code>, <code>opsForHash()</code>, <code>opsForList()</code>, <code>opsForSet()</code> and <code>opsForZSet()</code> map to Redis commands.`,
      },
      {
        heading: 'Redis as a Distributed Cache',
        body: `With the Redis starter on the classpath and <code>@EnableCaching</code>, <code>spring.cache.type=redis</code> makes Spring's cache annotations use Redis. Set a default <code>spring.cache.redis.time-to-live</code> and use a <code>RedisCacheManagerBuilderCustomizer</code> for per-cache TTLs and JSON serialization. All application instances now share one cache, and it survives restarts.`,
      },
      {
        heading: 'Common Patterns',
        body: `Redis primitives make several distributed patterns simple:`,
        list: [
          '<strong>Rate limiting</strong> — <code>INCR</code> a per-user key with an expiry per time window.',
          '<strong>Leaderboards</strong> — sorted sets (<code>ZINCRBY</code>, <code>ZREVRANGE</code>) keep scores ordered.',
          '<strong>Sessions</strong> — Spring Session stores <code>HttpSession</code> data in Redis so any instance can serve any user.',
          '<strong>Distributed locks</strong> — <code>SET key value NX PX</code>; for production use a library such as ShedLock or Redisson.',
          '<strong>Pub/sub and streams</strong> — lightweight messaging between instances.',
        ],
      },
      {
        heading: 'Operational Notes',
        body: `Redis keeps data in memory: set <code>maxmemory</code> and an eviction policy, always put expiries on cache-like keys, and use key prefixes (<code>webnest:ratelimit:user:42</code>) to keep data organised. Avoid the <code>KEYS</code> command in production — it blocks the server; use <code>SCAN</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Setup with Docker Compose and properties',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

# compose.yaml
services:
  redis:
    image: redis:8
    ports:
      - "6379"

# application-prod.yml
spring:
  data:
    redis:
      host: \${REDIS_HOST}
      port: 6379
      password: \${REDIS_PASSWORD}
      ssl:
        enabled: true
      timeout: 2s`,
        output: `(dev) Container webnest-redis-1 Started — connection details applied automatically
redis-cli PING -> PONG`,
      },
      {
        caption: 'Rate limiting and a leaderboard with StringRedisTemplate',
        code: `@Service
public class RedisPatterns {

    private final StringRedisTemplate redis;

    public RedisPatterns(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /** Allow at most 'limit' requests per user per minute. */
    public boolean allow(String userId, int limit) {
        String key = "webnest:ratelimit:" + userId + ":" + (System.currentTimeMillis() / 60_000);
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1) {
            redis.expire(key, Duration.ofMinutes(1));
        }
        return count != null && count <= limit;
    }

    public void addPoints(String student, int points) {
        redis.opsForZSet().incrementScore("webnest:leaderboard", student, points);
    }

    public List<String> top(int n) {
        Set<ZSetOperations.TypedTuple<String>> top =
            redis.opsForZSet().reverseRangeWithScores("webnest:leaderboard", 0, n - 1);
        return top.stream().map(t -> t.getValue() + "=" + t.getScore().intValue()).toList();
    }
}`,
        output: `allow("42", 3) x5 -> true, true, true, false, false
addPoints("asha", 120); addPoints("ravi", 95); addPoints("asha", 30)
top(2) -> [asha=150, ravi=95]

redis-cli> ZREVRANGE webnest:leaderboard 0 -1 WITHSCORES
1) "asha" 2) "150" 3) "ravi" 4) "95"`,
      },
      {
        caption: 'Redis cache with JSON values and per-cache TTLs',
        code: `# application.yml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 10m
      key-prefix: "webnest:cache:"

@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    RedisCacheManagerBuilderCustomizer redisCaches() {
        RedisCacheConfiguration json = RedisCacheConfiguration.defaultCacheConfig()
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(RedisSerializer.json()));
        return builder -> builder
            .withCacheConfiguration("courseBySlug", json.entryTtl(Duration.ofHours(1)))
            .withCacheConfiguration("exchangeRates", json.entryTtl(Duration.ofMinutes(5)));
    }
}`,
        output: `redis-cli> KEYS webnest:cache:*        (fine locally; use SCAN in production)
1) "webnest:cache:courseBySlug::spring-boot"
redis-cli> TTL "webnest:cache:courseBySlug::spring-boot"
(integer) 3587
redis-cli> GET "webnest:cache:courseBySlug::spring-boot"
"{\\"@class\\":\\"com.webnest.CourseDto\\",\\"slug\\":\\"spring-boot\\",\\"title\\":\\"Spring Boot\\"}"`,
      },
      {
        caption: 'Shared HTTP sessions and pub/sub between instances',
        code: `<!-- Spring Session: store HttpSession in Redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-session-data-redis</artifactId>
</dependency>

# application.yml
spring:
  session:
    timeout: 30m

// Pub/sub: notify all instances when a course is published
@Configuration
public class PubSubConfig {

    @Bean
    RedisMessageListenerContainer container(RedisConnectionFactory cf, CoursePublishedListener listener) {
        RedisMessageListenerContainer c = new RedisMessageListenerContainer();
        c.setConnectionFactory(cf);
        c.addMessageListener(listener, new ChannelTopic("webnest:course-published"));
        return c;
    }
}

@Component
public class CoursePublishedListener implements MessageListener {
    @Override
    public void onMessage(Message message, byte[] pattern) {
        System.out.println("Course published: " + new String(message.getBody()));
    }
}

// publisher
redis.convertAndSend("webnest:course-published", "spring-ai");`,
        output: `Instance A publishes "spring-ai"
Instance A: Course published: spring-ai
Instance B: Course published: spring-ai
(User sessions survive restarts and work on any instance behind the load balancer.)`,
      },
    ],
    commonMistakes: [
      'Using RedisTemplate with default JDK serialization, producing unreadable values that break when classes change.',
      'Storing cache-like keys without TTLs, slowly filling Redis memory.',
      'Running KEYS * in production, which blocks Redis for all clients.',
      'Treating Redis as the only copy of important data without persistence or replication configured.',
      'Building a home-grown distributed lock without expiry, leaving locks held forever after a crash.',
    ],
    keyPoints: [
      'spring-boot-starter-data-redis auto-configures Lettuce, StringRedisTemplate and RedisTemplate.',
      'Use opsForValue/Hash/List/Set/ZSet for Redis data structures; prefer string or JSON serialization.',
      'spring.cache.type=redis turns Redis into a shared cache with configurable TTLs.',
      'Redis enables rate limiting, leaderboards, shared sessions, locks and pub/sub.',
      'Always set expiries, key prefixes and memory limits; use SCAN instead of KEYS.',
    ],
  },
}
