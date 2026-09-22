// Spring Framework Core + Spring Boot and REST APIs modules — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content22SpringCoreBoot = {
  // ---------- Spring Framework Core ----------
  'spring-ioc-container-and-dependency-injection': {
    title: 'Spring IoC Container and Dependency Injection',
    intro: `In plain Java, if class <code>A</code> needs class <code>B</code>, <code>A</code> typically constructs it directly with <code>new B()</code> — tying <code>A</code> to one specific implementation and making it hard to substitute a different implementation (or a mock, in tests) later. Spring's <strong>IoC (Inversion of Control) container</strong> flips this: instead of your objects creating their own dependencies, the container creates every object (a "bean") and hands each one the dependencies it declares needing. This is <strong>Dependency Injection (DI)</strong>, and it's the foundational idea the entire Spring ecosystem — MVC, Boot, Security, Data — builds on top of.

The container is represented by <code>ApplicationContext</code>. On startup, it scans your configuration (annotated classes, or XML in legacy projects), figures out which beans depend on which, constructs them in the right order, and wires the dependencies together — all before your application code runs.`,
    sections: [
      {
        heading: 'Declaring Beans',
        body: `A bean is any object whose lifecycle is managed by the Spring container. The most common way to declare one is with a stereotype annotation on the class itself, combined with component scanning.`,
        list: [
          '<code>@Component</code> — a generic Spring-managed bean.',
          '<code>@Service</code> — semantically marks a business-logic bean (functionally identical to @Component, but communicates intent).',
          '<code>@Repository</code> — marks a data-access bean; Spring also translates database exceptions thrown from it into its own consistent exception hierarchy.',
          '<code>@Controller</code> / <code>@RestController</code> — marks a web-layer bean handling HTTP requests (covered in the Spring MVC lesson).',
          '<code>@Bean</code> — used inside an <code>@Configuration</code> class to manually declare a bean, typically for third-party classes you cannot annotate directly.',
        ],
      },
      {
        heading: 'Constructor Injection vs. Setter Injection',
        body: `Spring supports injecting dependencies through a constructor, a setter method, or directly into a field. Constructor injection is the modern default: dependencies become <code>final</code> fields that are guaranteed to be set the moment the object exists, the class can never be in a half-wired state, and it's trivial to construct the class manually in a unit test without needing Spring at all. Setter injection remains useful for genuinely optional dependencies that the bean can function without.`,
      },
      {
        heading: 'Bean Scopes',
        body: `By default every bean is a <strong>singleton</strong> — the container creates exactly one shared instance for the whole application. The <strong>prototype</strong> scope creates a brand-new instance every time the bean is requested. Web-aware scopes like <strong>request</strong> and <strong>session</strong> create one instance per HTTP request or per user session, respectively, and only apply inside a web application context.`,
      },
    ],
    examples: [
      {
        caption: 'Constructor injection (preferred) vs. setter injection, and disambiguating with @Qualifier',
        code: `public interface PaymentGateway {
    void charge(double amount);
}

@Component("razorpayGateway")
public class RazorpayGateway implements PaymentGateway {
    public void charge(double amount) { System.out.println("Razorpay charged " + amount); }
}

@Component("stripeGateway")
public class StripeGateway implements PaymentGateway {
    public void charge(double amount) { System.out.println("Stripe charged " + amount); }
}

@Service
public class OrderService {
    private final PaymentGateway gateway;    // required dependency, injected via constructor

    public OrderService(@Qualifier("razorpayGateway") PaymentGateway gateway) {
        this.gateway = gateway;
    }

    public void checkout(double amount) { gateway.charge(amount); }
}

@Service
public class ReportService {
    private EmailSender sender;              // optional dependency, injected via setter

    @Autowired(required = false)
    public void setSender(EmailSender sender) { this.sender = sender; }
}`,
        output: `Razorpay charged 499.0`,
      },
    ],
    commonMistakes: [
      'Field injection with @Autowired directly on a private field — it works, but hides required dependencies, prevents making fields final, and makes plain unit testing (without Spring) harder.',
      'Registering two beans of the same interface type without a @Qualifier or a distinguishing @Primary, causing an ambiguous "no unique bean" startup error.',
      'Using prototype scope for a bean that is then injected into a singleton — the prototype is only created once, at the singleton\'s construction time, which usually isn\'t what was intended.',
      'Calling "new" on a class that should be a managed bean, bypassing the container and losing DI, AOP, and lifecycle management entirely for that instance.',
    ],
    keyPoints: [
      'The IoC container (ApplicationContext) creates and wires beans instead of your code constructing dependencies directly.',
      '@Component/@Service/@Repository mark classes as beans; @Bean declares one manually inside @Configuration.',
      'Constructor injection is the recommended default: required, immutable, and easy to test without the container.',
      'Singleton is the default scope; prototype creates a new instance per request-for-the-bean; request/session are web-only scopes.',
    ],
  },

  'bean-scopes-autowiring-and-java-configuration': {
    title: 'Bean Scopes, Autowiring, and Java Configuration',
    intro: `Beyond declaring a bean, Spring gives you fine control over exactly how dependencies get matched and wired, and a fully programmatic (annotation-free class definitions) way to configure beans when you don't own the source of the class you need to register.`,
    sections: [
      {
        heading: '@Autowired Resolution Order',
        body: `When Spring sees <code>@Autowired</code>, it first tries to match by type. If exactly one bean of that type exists, it's injected without further input. If multiple beans of the same type exist, Spring falls back to matching by the field/parameter name against bean names, and if that's still ambiguous, you must disambiguate explicitly with <code>@Qualifier("beanName")</code> or mark one bean <code>@Primary</code> as the default choice.`,
      },
      {
        heading: 'Java-based Configuration with @Configuration and @Bean',
        body: `For classes you cannot annotate directly — third-party library classes, or objects that need custom construction logic — declare them inside an <code>@Configuration</code> class using <code>@Bean</code>-annotated factory methods. The method's return value becomes a Spring-managed bean, and any parameters on the method are themselves resolved from the container automatically.`,
      },
      {
        heading: 'Injecting External Configuration Values',
        body: `<code>@Value("\${property.key}")</code> injects a single value from <code>application.properties</code>/<code>application.yml</code> (or environment variables). For a whole block of related settings, <code>@ConfigurationProperties(prefix = "app.mail")</code> binds an entire section directly onto a POJO's fields, which is more maintainable than many individual <code>@Value</code> injections scattered across classes.`,
      },
    ],
    examples: [
      {
        caption: 'Java configuration, @Primary, and binding configuration properties to a POJO',
        code: `@Configuration
public class AppConfig {

    @Bean
    @Primary                                     // default choice when multiple PaymentGateway beans exist
    public PaymentGateway defaultGateway() {
        return new RazorpayGateway();
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.setConnectTimeout(Duration.ofSeconds(5)).build();
    }
}

@Component
@ConfigurationProperties(prefix = "app.mail")
public class MailSettings {
    private String host;
    private int port;
    private boolean tlsEnabled;
    // getters and setters — Spring populates these from
    // app.mail.host / app.mail.port / app.mail.tls-enabled
}`,
        output: `// application.properties
app.mail.host=smtp.webnest.dev
app.mail.port=587
app.mail.tls-enabled=true`,
      },
    ],
    commonMistakes: [
      'Relying on @Autowired name-matching as the primary disambiguation strategy instead of explicit @Qualifier, which breaks silently if a field is renamed.',
      'Declaring the same bean both as an @Component-annotated class and again via an @Bean method, registering it twice.',
      'Hardcoding configuration values (hostnames, timeouts, keys) instead of externalizing them with @Value or @ConfigurationProperties.',
      'Forgetting that @ConfigurationProperties needs matching setters (or a constructor-bound record) — fields alone, without a way for Spring to set them, are left at their default values.',
    ],
    keyPoints: [
      '@Autowired resolves by type first, then by name, then requires an explicit @Qualifier or @Primary to break ties.',
      '@Configuration + @Bean is how you register beans for classes you cannot annotate directly.',
      '@Value injects a single external property; @ConfigurationProperties binds a whole settings block to a POJO.',
      'Externalizing configuration keeps environment-specific values out of compiled code.',
    ],
  },

  'aspect-oriented-programming-aop-in-spring': {
    title: 'Aspect-Oriented Programming (AOP) in Spring',
    intro: `Some concerns — logging, security checks, transaction management, performance timing — cut across many unrelated classes rather than belonging to any one of them. Writing that logic by hand inside every method that needs it scatters the same boilerplate everywhere and makes it easy to forget in a new method. <strong>Aspect-Oriented Programming</strong> lets you write that logic once, as an <strong>aspect</strong>, and have Spring apply it automatically to every method matching a declared rule — without touching the target methods' own code at all.`,
    sections: [
      {
        heading: 'Core AOP Vocabulary',
        list: [
          '<strong>Aspect</strong> — a class (annotated <code>@Aspect</code>) that bundles cross-cutting logic.',
          '<strong>Join point</strong> — a point during execution where an aspect can hook in — in Spring AOP this is always a method call.',
          '<strong>Pointcut</strong> — an expression describing which join points an aspect applies to (e.g. "every public method in any class under <code>com.app.service</code>").',
          '<strong>Advice</strong> — the actual code that runs at a matched join point, and when relative to it (before, after, around).',
        ],
      },
      {
        heading: 'Advice Types',
        body: `Spring supports five kinds of advice, chosen based on when the cross-cutting logic needs to run relative to the real method call.`,
        list: [
          '<code>@Before</code> — runs before the matched method executes; commonly used for logging entry or validating preconditions.',
          '<code>@AfterReturning</code> — runs after the method returns successfully, with access to the return value.',
          '<code>@AfterThrowing</code> — runs only if the method throws an exception, with access to that exception.',
          '<code>@After</code> — runs after the method completes, whether it succeeded or threw (like a <code>finally</code> block).',
          '<code>@Around</code> — wraps the entire call; it receives a <code>ProceedingJoinPoint</code> and must explicitly call <code>proceed()</code> to actually invoke the real method, which makes it the most powerful advice type — it can change arguments, skip the call entirely, retry, or modify the return value.',
        ],
      },
      {
        heading: 'How Spring AOP Actually Works',
        body: `Spring AOP is proxy-based: when a bean matches an aspect's pointcut, Spring wraps that bean in a dynamically generated proxy at startup. Calls to the bean actually go through the proxy first, which runs the relevant advice and then delegates to the real object. A consequence worth knowing: a method calling another method on <em>the same object</em> (an internal, non-proxied call) bypasses the proxy entirely, so AOP advice does not apply to those internal calls — only external calls that go through the injected proxy reference are intercepted.`,
      },
    ],
    examples: [
      {
        caption: 'A logging and timing aspect applied to every method in the service package',
        code: `@Aspect
@Component
public class LoggingAspect {

    @Pointcut("execution(* com.app.service.*.*(..))")
    public void serviceMethods() {}

    @Before("serviceMethods()")
    public void logBefore(JoinPoint jp) {
        System.out.println("Calling: " + jp.getSignature().toShortString());
    }

    @AfterThrowing(pointcut = "serviceMethods()", throwing = "ex")
    public void logError(JoinPoint jp, Exception ex) {
        System.out.println(jp.getSignature() + " failed: " + ex.getMessage());
    }

    @Around("serviceMethods()")
    public Object timeIt(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.nanoTime();
        Object result = pjp.proceed();               // actually invokes the real method
        long elapsedMs = (System.nanoTime() - start) / 1_000_000;
        System.out.println(pjp.getSignature() + " took " + elapsedMs + "ms");
        return result;
    }
}`,
        output: `Calling: OrderService.checkout(..)
OrderService.checkout(..) took 12ms`,
      },
    ],
    commonMistakes: [
      'Calling a method on "this" from inside the same bean and expecting @Around/@Before advice to run — self-invocation bypasses the AOP proxy entirely.',
      'Forgetting to call proceed() inside an @Around advice, which silently skips the real method\'s execution altogether.',
      'Writing overly broad pointcuts (e.g. matching every class in the application) that add overhead and log noise to methods that never needed the aspect.',
      'Assuming @Around advice runs before @Before advice on the same join point without checking declared advice precedence.',
    ],
    keyPoints: [
      'AOP extracts cross-cutting logic (logging, security, timing, transactions) into reusable aspects instead of duplicating it in every method.',
      'A pointcut expression selects which methods an aspect applies to; advice defines what runs and when.',
      '@Around is the most powerful advice type — it controls whether and how the real method executes via proceed().',
      'Spring AOP is proxy-based, so self-invocation within the same bean bypasses advice.',
    ],
  },

  // ---------- Spring Boot and REST APIs ----------
  'spring-boot-fundamentals-and-auto-configuration': {
    title: 'Spring Boot Fundamentals and Auto-Configuration',
    intro: `Classic Spring applications need an externally installed application server and a fair amount of XML or Java configuration before a single request can be served. <strong>Spring Boot</strong> removes that ceremony: it bundles an embedded server (Tomcat by default) directly inside your application, so <code>java -jar app.jar</code> just runs — no separate server installation — and it ships "starter" dependencies and sensible auto-configuration so a working application needs only a handful of lines to get going.`,
    sections: [
      {
        heading: 'The Entry Point',
        body: `A Spring Boot application starts from one class annotated <code>@SpringBootApplication</code>, which is itself a convenience annotation combining three others: <code>@Configuration</code> (this class can declare beans), <code>@EnableAutoConfiguration</code> (let Spring Boot configure beans based on what's on the classpath), and <code>@ComponentScan</code> (scan this package and its sub-packages for <code>@Component</code>/<code>@Service</code>/<code>@Repository</code>/<code>@Controller</code> classes).`,
      },
      {
        heading: 'Starters — Curated Dependency Bundles',
        body: `A "starter" is a single Maven/Gradle dependency that transitively pulls in everything a feature typically needs, all at compatible versions. <code>spring-boot-starter-web</code> brings in Spring MVC, an embedded Tomcat, and Jackson for JSON. <code>spring-boot-starter-data-jpa</code> brings in Hibernate, Spring Data JPA, and a JDBC connection pool. This removes the tedious, error-prone job of hand-picking compatible versions of a dozen related libraries.`,
      },
      {
        heading: 'Auto-Configuration',
        body: `At startup, Spring Boot inspects what's actually present on the classpath and configured in <code>application.properties</code>, and registers sensible default beans accordingly — for example, seeing an H2 driver plus <code>spring-boot-starter-data-jpa</code> is enough for it to automatically configure a <code>DataSource</code>, an <code>EntityManagerFactory</code>, and a transaction manager, with zero manual bean declarations. You only write explicit configuration to override a specific default, not to build the whole thing from scratch.`,
      },
      {
        heading: 'Actuator and DevTools',
        body: `<code>spring-boot-starter-actuator</code> exposes production-monitoring endpoints like <code>/actuator/health</code> and <code>/actuator/metrics</code> for free — essential once an application is actually deployed somewhere. <code>spring-boot-devtools</code> is a development-only dependency that gives automatic restart on code changes and disables template caching, speeding up the local edit-run loop.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal Spring Boot application with a starter dependency and application.properties',
        code: `// SchoolApplication.java
@SpringBootApplication
public class SchoolApplication {
    public static void main(String[] args) {
        SpringApplication.run(SchoolApplication.class, args);
    }
}

<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/school
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
server.port=8081`,
        output: `Tomcat started on port 8081 (http)
Started SchoolApplication in 1.842 seconds`,
      },
    ],
    commonMistakes: [
      'Placing @SpringBootApplication in a package that isn\'t the parent of the rest of the code, so component scanning misses classes in sibling packages.',
      'Manually wiring beans that a starter already auto-configures, creating duplicate or conflicting bean definitions.',
      'Leaving spring-boot-devtools on the production classpath, which is meant for local development only.',
      'Assuming auto-configuration always makes the "right" choice for production — reviewing what actually got configured (via /actuator or debug logging) matters before shipping.',
    ],
    keyPoints: [
      '@SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan.',
      'Starters bundle compatible, curated sets of dependencies for a given feature (web, data-jpa, security, etc.).',
      'Auto-configuration inspects the classpath and configuration to register sensible default beans automatically.',
      'Actuator adds production monitoring endpoints; DevTools speeds up local development with auto-restart.',
    ],
  },

  'spring-mvc-and-the-dispatcherservlet': {
    title: 'Spring MVC and the DispatcherServlet',
    intro: `Spring MVC is the web framework layered on top of Spring's core IoC container, and it's what every <code>@Controller</code> and <code>@RestController</code> in a Spring Boot application ultimately runs through. Understanding the request's actual path through the framework makes debugging routing and view problems far more intuitive than treating controllers as a black box.`,
    sections: [
      {
        heading: 'The Front Controller Pattern',
        body: `Every incoming HTTP request to a Spring MVC application passes through exactly one servlet: the <strong>DispatcherServlet</strong>. Rather than each controller being a separate servlet (the older, plain-Servlet approach), DispatcherServlet is the single front controller for the entire application, and it delegates the actual work to the right controller method based on the request's URL and HTTP method.`,
      },
      {
        heading: 'The Full Request Flow',
        list: [
          '1. The browser sends a request; it reaches the embedded Tomcat server, which forwards it to DispatcherServlet.',
          '2. DispatcherServlet consults a <strong>HandlerMapping</strong> to find which controller method matches the request\'s URL and HTTP verb.',
          '3. The matched controller method runs, executing business logic (often delegating to a @Service) and building a response.',
          '4. For a traditional MVC controller, the method returns a view name plus a Model; a <strong>ViewResolver</strong> maps that name to an actual template (JSP, Thymeleaf) which is rendered with the model data.',
          '5. For a @RestController, the return value is instead serialized directly to JSON (via Jackson) by an HttpMessageConverter and written straight to the response body — no view resolution step at all.',
        ],
      },
      {
        heading: 'Controller vs. RestController',
        body: `<code>@Controller</code> methods, by default, return a view name to render an HTML page — this is the classic server-rendered MVC style. <code>@RestController</code> is shorthand for <code>@Controller</code> plus <code>@ResponseBody</code> on every method, meaning return values are written directly as the response body (typically JSON) instead of being resolved to a view — this is what virtually every modern REST API controller uses.`,
      },
    ],
    examples: [
      {
        caption: 'A traditional view-rendering controller next to a JSON REST controller for the same resource',
        code: `// Traditional MVC — returns a view name, ViewResolver renders it
@Controller
@RequestMapping("/students")
public class StudentViewController {

    @Autowired private StudentService service;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("students", service.findAll());
        return "students";               // resolves to a template, e.g. students.html
    }
}

// REST — return value is serialized straight to JSON
@RestController
@RequestMapping("/api/students")
public class StudentApiController {

    @Autowired private StudentService service;

    @GetMapping
    public List<Student> list() {
        return service.findAll();        // no view resolution — written directly as JSON
    }
}`,
        output: `GET /api/students -> 200 OK
[{"id":1,"name":"Vansh","marks":95}, {"id":2,"name":"Asha","marks":88}]`,
      },
    ],
    commonMistakes: [
      'Using @Controller with a method meant to return raw JSON but forgetting @ResponseBody, causing Spring to try (and fail) to resolve the returned string as a view name.',
      'Assuming @RequestMapping alone specifies an HTTP method — without @GetMapping/@PostMapping (or an explicit method attribute), it matches every HTTP verb.',
      'Putting business logic directly inside a controller method instead of delegating to a @Service, mixing web concerns with domain logic.',
      'Not understanding that DispatcherServlet is a single shared entry point — assuming (incorrectly) that each controller runs as its own separate servlet.',
    ],
    keyPoints: [
      'DispatcherServlet is the single front controller every request passes through in Spring MVC.',
      'HandlerMapping finds the right controller method; ViewResolver (for @Controller) maps a view name to an actual template.',
      '@RestController = @Controller + @ResponseBody — return values are serialized directly to the response body.',
      'Controllers should stay thin, delegating real logic to @Service beans.',
    ],
  },

  'building-rest-apis-with-spring-boot': {
    title: 'Building REST APIs with Spring Boot',
    intro: `REST maps CRUD operations onto HTTP verbs applied to URL-identified resources: <code>GET</code> to read, <code>POST</code> to create, <code>PUT</code>/<code>PATCH</code> to update, and <code>DELETE</code> to remove — with JSON as the near-universal request/response format. Spring Boot's <code>@RestController</code> plus a handful of mapping annotations is enough to build a complete, production-shaped REST API.`,
    sections: [
      {
        heading: 'Mapping Requests to Methods',
        list: [
          '<code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@DeleteMapping</code>, <code>@PatchMapping</code> — shorthand for <code>@RequestMapping</code> restricted to that HTTP verb.',
          '<code>@PathVariable</code> — binds a URL path segment (e.g. <code>/students/{id}</code>) to a method parameter.',
          '<code>@RequestParam</code> — binds a query-string parameter (e.g. <code>?page=2</code>) to a method parameter.',
          '<code>@RequestBody</code> — deserializes the incoming JSON request body into a Java object.',
        ],
      },
      {
        heading: 'Returning Proper HTTP Status Codes with ResponseEntity',
        body: `Returning a plain object from a controller method always responds with <code>200 OK</code>, which is wrong for a lot of real cases — a successful creation should return <code>201 Created</code>, and a lookup that finds nothing should return <code>404 Not Found</code> rather than an empty or null body. Wrapping the return value in <code>ResponseEntity&lt;T&gt;</code> lets a method control the exact status code, headers, and body together.`,
      },
      {
        heading: 'The Controller → Service → Repository Shape',
        body: `Nearly every production Spring Boot API follows the same three-layer shape: the <code>@RestController</code> handles HTTP concerns only (parsing input, choosing status codes); the <code>@Service</code> holds business logic and orchestrates operations; the <code>@Repository</code> (typically a Spring Data JPA interface) handles persistence. Keeping these responsibilities separated makes each layer independently testable and keeps controllers from becoming a dumping ground for logic that has nothing to do with HTTP.`,
      },
    ],
    examples: [
      {
        caption: 'A complete CRUD REST controller with proper status codes',
        code: `@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired private StudentService service;

    @GetMapping
    public List<Student> all() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> one(@PathVariable int id) {
        return service.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Student> create(@RequestBody Student student) {
        Student saved = service.save(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> update(@PathVariable int id, @RequestBody Student student) {
        student.setId(id);
        return ResponseEntity.ok(service.save(student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        service.delete(id);
        return ResponseEntity.noContent().build();     // 204, no body
    }
}`,
        output: `POST /api/students -> 201 Created  {"id":3,"name":"Rahul","marks":91}
GET  /api/students/99 -> 404 Not Found`,
      },
    ],
    commonMistakes: [
      'Returning 200 OK for every response, including creates (should be 201) and not-found lookups (should be 404).',
      'Putting @RequestBody on a GET method — GET requests conventionally carry no body; use @RequestParam/@PathVariable instead.',
      'Letting the controller talk directly to a repository, skipping the service layer and mixing HTTP handling with business rules.',
      'Returning raw entity objects (including sensitive fields like a password hash) directly as JSON instead of a dedicated DTO shaped for the API response.',
    ],
    keyPoints: [
      '@GetMapping/@PostMapping/etc. map HTTP verbs to controller methods; @PathVariable, @RequestParam, and @RequestBody bind incoming data.',
      'ResponseEntity gives full control over status code, headers, and body together.',
      'Controller → Service → Repository is the standard layering for a maintainable Spring Boot API.',
      'Prefer purpose-built DTOs over exposing entities directly when a response shape needs to differ from storage.',
    ],
  },

  'spring-data-jpa-repositories': {
    title: 'Spring Data JPA Repositories',
    intro: `Writing a DAO class by hand for every entity — even simple find-by-id and save methods — is repetitive boilerplate. <strong>Spring Data JPA</strong> removes nearly all of it: you declare an interface, and Spring generates a working implementation at runtime, backed by Hibernate underneath.`,
    sections: [
      {
        heading: 'JpaRepository — CRUD for Free',
        body: `Extending <code>JpaRepository&lt;Entity, IdType&gt;</code> immediately gives you <code>save()</code>, <code>findById()</code>, <code>findAll()</code>, <code>deleteById()</code>, <code>count()</code>, and more — with zero implementation code, because Spring generates a proxy implementation automatically at application startup.`,
      },
      {
        heading: 'Query Derivation from Method Names',
        body: `Beyond the built-in CRUD methods, declaring a method like <code>findByMarksGreaterThan(int marks)</code> is enough for Spring Data to parse the method name and generate the correct query — no HQL, no annotations needed for straightforward cases. More complex names compose further: <code>findByNameAndMarksGreaterThanOrderByMarksDesc</code> is a completely valid, working query built purely from its name.`,
      },
      {
        heading: 'Custom Queries with @Query',
        body: `When a query is too complex to express cleanly as a method name, <code>@Query</code> lets you write HQL/JPQL (or native SQL, with <code>nativeQuery = true</code>) directly on the interface method — still with zero implementation body, since Spring Data supplies the method's behavior at runtime.`,
      },
      {
        heading: 'Pagination and Sorting',
        body: `Accepting a <code>Pageable</code> parameter on any query method automatically adds paging and sorting support, and returning <code>Page&lt;T&gt;</code> gives back both the requested slice of results and metadata like total element count and total pages — essential for any list endpoint that could otherwise return an unbounded number of rows.`,
      },
    ],
    examples: [
      {
        caption: 'A repository combining derived queries, @Query, and pagination',
        code: `public interface StudentRepository extends JpaRepository<Student, Integer> {

    // Derived query — Spring parses the method name into a WHERE clause
    List<Student> findByMarksGreaterThan(int marks);

    Optional<Student> findByEmail(String email);

    // Custom JPQL for anything the naming convention can't express cleanly
    @Query("select s from Student s where s.name like %:keyword%")
    List<Student> searchByName(@Param("keyword") String keyword);

    // Pagination + sorting built in
    Page<Student> findByMarksGreaterThan(int marks, Pageable pageable);
}

@Service
public class StudentService {
    @Autowired private StudentRepository repo;

    public List<Student> toppers() {
        return repo.findByMarksGreaterThan(90);
    }

    public Page<Student> topperPage(int page) {
        return repo.findByMarksGreaterThan(90, PageRequest.of(page, 10, Sort.by("marks").descending()));
    }
}`,
        output: `Hibernate: select s1_0.id,s1_0.email,s1_0.marks,s1_0.name from student s1_0 where s1_0.marks>? order by s1_0.marks desc limit ?`,
      },
    ],
    commonMistakes: [
      'Misspelling a field name in a derived query method (e.g. findByMark instead of findByMarks), which fails at application startup rather than compile time.',
      'Loading an entire table with findAll() when only a page of results is needed, instead of using Pageable.',
      'Writing complex business logic inside a repository interface — repositories should stay focused on data access, with orchestration logic living in the service layer.',
      'Returning a List from a method expected to match at most one row instead of Optional<T>, forcing extra null-checking at every call site.',
    ],
    keyPoints: [
      'JpaRepository provides full CRUD with zero implementation code.',
      'Method names following Spring Data\'s naming convention are automatically parsed into queries.',
      '@Query covers cases too complex for the naming convention, using JPQL/HQL or native SQL.',
      'Pageable/Page<T> add pagination and sorting to any query method without manual LIMIT/OFFSET logic.',
    ],
  },

  'validation-and-exception-handling-in-spring': {
    title: 'Validation and Exception Handling in Spring',
    intro: `An API that trusts every incoming request to be well-formed will eventually receive one that isn't. Spring integrates Bean Validation (JSR 380) directly into controller parameter binding, and pairs it with a centralized exception-handling mechanism so validation failures and other errors produce clean, consistent responses instead of a raw stack trace leaking to the client.`,
    sections: [
      {
        heading: 'Bean Validation Annotations',
        body: `Constraints are declared directly on a DTO or entity's fields, and enforced by adding <code>@Valid</code> in front of a <code>@RequestBody</code> parameter.`,
        list: [
          '<code>@NotNull</code> / <code>@NotBlank</code> / <code>@NotEmpty</code> — require a value to be present (with increasingly strict rules for strings/collections).',
          '<code>@Min</code> / <code>@Max</code> / <code>@Size</code> — bound numeric values or the length of a string/collection.',
          '<code>@Email</code> / <code>@Pattern(regexp = "...")</code> — validate format against a built-in or custom rule.',
          '<code>@Past</code> / <code>@Future</code> — validate a date is in the past or future relative to now.',
        ],
      },
      {
        heading: 'Handling Validation Failures',
        body: `When <code>@Valid</code> fails, Spring throws <code>MethodArgumentNotValidException</code> before your controller method body even runs. Left unhandled, this surfaces as a generic <code>400 Bad Request</code> with a default error body; handling it explicitly lets you shape the response into a clear field-by-field error map the client can actually act on.`,
      },
      {
        heading: 'Centralized Exception Handling with @RestControllerAdvice',
        body: `Rather than wrapping every controller method in try/catch, a class annotated <code>@RestControllerAdvice</code> defines <code>@ExceptionHandler</code> methods that apply globally, across every controller in the application. This keeps error handling in one place, guarantees a consistent error response shape across the whole API, and keeps individual controller methods focused purely on the happy path.`,
      },
    ],
    examples: [
      {
        caption: 'A validated DTO and a global exception handler producing clean error responses',
        code: `public class StudentRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Min(value = 0, message = "Marks cannot be negative")
    @Max(value = 100, message = "Marks cannot exceed 100")
    private int marks;

    @Email(message = "Email must be valid")
    private String email;
    // getters and setters
}

@RestController
@RequestMapping("/api/students")
public class StudentController {
    @PostMapping
    public ResponseEntity<Student> create(@Valid @RequestBody StudentRequest request) {
        // if validation fails, this method body never runs
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(request));
    }
}

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}`,
        output: `POST /api/students {"name":"","marks":150} -> 400 Bad Request
{"name":"Name is required","marks":"Marks cannot exceed 100"}`,
      },
    ],
    commonMistakes: [
      'Forgetting @Valid on the @RequestBody parameter — without it, every Bean Validation annotation on the DTO is silently ignored.',
      'Validating inside the controller or service manually with if-statements, duplicating what Bean Validation annotations already express declaratively.',
      'Letting exceptions propagate unhandled, leaking internal stack traces (and implementation details) to API clients.',
      'Returning a generic "500 Internal Server Error" for predictable failure cases like "not found" or "invalid input," instead of the correct, specific status code.',
    ],
    keyPoints: [
      'Bean Validation annotations (@NotBlank, @Min, @Email, etc.) declare constraints directly on request DTOs.',
      '@Valid on a @RequestBody parameter triggers validation before the controller method body runs.',
      '@RestControllerAdvice centralizes exception handling across every controller in one place.',
      'Each error type should map to the correct, specific HTTP status code rather than a generic 500.',
    ],
  },
}
