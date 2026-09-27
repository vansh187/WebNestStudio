// Spring Boot course — capstone project and interview preparation.
// Keys are slugs matching topics in codelabDefaults.js.
export const springBootCareer = {
  'capstone-project-building-a-production-ready-course-platform-api': {
    title: 'Capstone Project: Building a Production-Ready Course Platform API',
    intro: `This capstone ties the whole course together. You will build <strong>LearnHub</strong>, a production-style backend for an online learning platform — similar to the one you are using right now — combining REST API design, persistence, security, caching, messaging, AI, testing, observability and deployment.

The lesson gives you the requirements, the architecture, the project structure, the key code for each layer, and a milestone plan. Build it step by step, revisiting the relevant lessons as you go. Finishing it gives you a portfolio project that demonstrates exactly the skills Spring Boot employers look for.`,
    sections: [
      {
        heading: 'Requirements',
        body: `LearnHub must support these features:`,
        list: [
          'Students register, log in (JWT) and manage their profile; instructors and admins have extra roles.',
          'Browse courses with pagination, filtering by level and full-text search; view modules and lessons.',
          'Enroll in courses, mark lessons complete, track progress; a certificate is issued when a course is completed.',
          'Instructors create and publish courses; admins manage users.',
          'An AI tutor answers questions about a lesson using the lesson content (RAG).',
          'Email notifications for enrolment and certificates, sent asynchronously after commit.',
          'Course catalogue cached in Redis; rate limiting on login and AI endpoints.',
          'OpenAPI documentation, health probes, metrics, tracing and structured logs.',
          'Unit, slice and Testcontainers integration tests; Docker image and CI pipeline.',
        ],
      },
      {
        heading: 'Architecture',
        body: `Build LearnHub as a <strong>modular monolith</strong> with Spring Modulith modules — <code>catalog</code>, <code>enrollment</code>, <code>identity</code>, <code>certificates</code>, <code>notifications</code>, <code>tutor</code> — communicating through events (<code>CourseCompleted</code>, <code>StudentEnrolled</code>). PostgreSQL with Flyway for data, Redis for caching, Spring Security with an OAuth2 resource server for JWTs, Spring AI with PGVector for the tutor, and Actuator + OpenTelemetry for observability. This is simpler to run than microservices while keeping clean boundaries you could later extract.`,
      },
      {
        heading: 'Milestones',
        body: `Work in small, testable increments:`,
        list: [
          '1. Project setup (Initializr: webmvc, data-jpa, validation, flyway, security-oauth2-resource-server, actuator, docker-compose, testcontainers, modulith) and Docker Compose with PostgreSQL and Redis.',
          '2. Catalog module: entities, Flyway migrations, repositories, DTOs, paginated/filterable endpoints, ProblemDetail errors, OpenAPI.',
          '3. Identity module: registration, password hashing, JWT issuing and validation, roles, method security.',
          '4. Enrollment and progress: transactions, ownership checks, CourseCompleted events.',
          '5. Certificates and notifications: @ApplicationModuleListener, email via Mailpit, PDF generation.',
          '6. Caching and rate limiting with Redis.',
          '7. AI tutor: ingest lesson content into PGVector, RetrievalAugmentationAdvisor, chat memory per student.',
          '8. Tests at every level; observability; Buildpacks image; GitHub Actions pipeline; deploy.',
        ],
      },
      {
        heading: 'Definition of Done',
        body: `Treat each milestone as done only when: the feature works through the API; it has unit tests and at least one integration test; security rules are tested (anonymous, forbidden, allowed); the database change is a Flyway migration; errors return ProblemDetail; the endpoint appears correctly in OpenAPI; and logs and metrics let you see it working in production.`,
      },
    ],
    examples: [
      {
        caption: 'Project structure',
        code: `learnhub/
├── compose.yaml                         # postgres(pgvector), redis, mailpit, jaeger
├── pom.xml
└── src/
    ├── main/java/com/webnest/learnhub/
    │   ├── LearnHubApplication.java
    │   ├── catalog/        Course, Module, Lesson, CatalogController, CatalogService (public API)
    │   │   └── internal/   repositories, mappers
    │   ├── identity/       AuthController, TokenService, SecurityConfig
    │   ├── enrollment/     EnrollmentController, ProgressService, CourseCompleted (event)
    │   ├── certificates/   CertificateService (listens to CourseCompleted)
    │   ├── notifications/  EmailNotifications (listens to StudentEnrolled, CertificateIssued)
    │   └── tutor/          TutorController, LessonIngestion, TutorConfig
    ├── main/resources/
    │   ├── application.yml, application-prod.yml
    │   ├── db/migration/V1__catalog.sql, V2__identity.sql, V3__enrollment.sql ...
    │   └── templates/email/*.html
    └── test/java/com/webnest/learnhub/
        ├── ModularityTests.java
        ├── TestcontainersConfig.java, TestLearnHubApplication.java
        └── catalog/, enrollment/, identity/ ... (unit, slice and integration tests)`,
        output: '(Each top-level package is a Spring Modulith module; internal packages are hidden from other modules.)',
      },
      {
        caption: 'Core catalogue endpoint with pagination, caching and ProblemDetail',
        code: `@RestController
@RequestMapping("/api/courses")
public class CatalogController {

    private final CatalogService catalog;

    public CatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping
    public Page<CourseSummary> list(@RequestParam(required = false) Level level,
                                    @RequestParam(required = false) String q,
                                    @PageableDefault(size = 20, sort = "title") Pageable pageable) {
        return catalog.search(level, q, pageable);
    }

    @GetMapping("/{slug}")
    public CourseDetail get(@PathVariable String slug) {
        return catalog.detail(slug);            // @Cacheable("courseDetail") inside the service
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR','ADMIN')")
    public ResponseEntity<CourseDetail> create(@Valid @RequestBody CreateCourse cmd, Authentication auth) {
        CourseDetail created = catalog.create(cmd, auth.getName());
        return ResponseEntity.created(URI.create("/api/courses/" + created.slug())).body(created);
    }
}

@RestControllerAdvice
class CatalogErrors {
    @ExceptionHandler(CourseNotFoundException.class)
    ProblemDetail notFound(CourseNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Course not found");
        return pd;
    }
}`,
        output: `GET /api/courses?level=INTERMEDIATE&q=spring&page=0
{"content":[{"slug":"spring-boot","title":"Spring Boot","level":"INTERMEDIATE","lessons":118}],"page":{"size":20,"number":0,"totalElements":1,"totalPages":1}}`,
      },
      {
        caption: 'Completing a lesson: transaction, ownership check and module event',
        code: `@Service
public class ProgressService {

    private final EnrollmentRepository enrollments;
    private final ApplicationEventPublisher events;

    public ProgressService(EnrollmentRepository enrollments, ApplicationEventPublisher events) {
        this.enrollments = enrollments;
        this.events = events;
    }

    @Transactional
    @PreAuthorize("@enrollmentAuth.owns(#enrollmentId, authentication)")
    public ProgressView completeLesson(Long enrollmentId, Long lessonId) {
        Enrollment e = enrollments.findById(enrollmentId).orElseThrow();
        e.complete(lessonId);                                        // idempotent: completing twice is harmless
        if (e.isCourseComplete() && e.markCertificateRequested()) {
            events.publishEvent(new CourseCompleted(e.getStudentId(), e.getStudentEmail(), e.getCourseSlug()));
        }
        return ProgressView.of(e);
    }
}

// certificates module
@Component
class CertificateIssuer {
    @ApplicationModuleListener
    void on(CourseCompleted event) {
        certificates.issue(event.studentId(), event.courseSlug());   // persisted; then CertificateIssued event
    }
}`,
        output: `POST /api/enrollments/12/lessons/118/complete -> 200 {"completed":118,"total":118,"percent":100}
event_publication: CourseCompleted -> certificates (completed), then CertificateIssued -> notifications (email sent)`,
      },
      {
        caption: 'AI tutor grounded in lesson content',
        code: `@RestController
@RequestMapping("/api/tutor")
public class TutorController {

    private final ChatClient tutor;

    public TutorController(ChatClient.Builder builder, VectorStore vectorStore, ChatMemory memory) {
        this.tutor = builder
            .defaultSystem("You are LearnHub's tutor. Answer only from the lesson context. "
                + "If the answer is not in the context, say so and suggest the most relevant lesson.")
            .defaultAdvisors(
                MessageChatMemoryAdvisor.builder(memory).build(),
                RetrievalAugmentationAdvisor.builder()
                    .documentRetriever(VectorStoreDocumentRetriever.builder()
                        .vectorStore(vectorStore).topK(4).similarityThreshold(0.55).build())
                    .build())
            .build();
    }

    @PostMapping("/{courseSlug}")
    public String ask(@PathVariable @Pattern(regexp = "[a-z0-9-]+") String courseSlug,   // safe to embed in the filter
                      @RequestBody String question, Principal user) {
        return tutor.prompt()
            .user(question)
            .advisors(a -> a
                .param(ChatMemory.CONVERSATION_ID, user.getName() + ":" + courseSlug)
                .param(VectorStoreDocumentRetriever.FILTER_EXPRESSION, "courseSlug == '" + courseSlug + "'"))
            .call()
            .content();
    }
}`,
        output: `POST /api/tutor/spring-boot "When should I use @TransactionalEventListener?"
-> Use it when a side effect (like sending an email) must only happen after the transaction commits...
   (see lesson "Spring application events")`,
      },
      {
        caption: 'An end-to-end integration test for the enrolment flow',
        code: `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@Import(TestcontainersConfig.class)
class EnrollmentFlowIT {

    @Autowired RestTestClient client;
    @Autowired TestTokens tokens;           // helper issuing JWTs for test users

    @Test
    void studentCanEnrollAndSeeProgress() {
        String token = tokens.forStudent("asha@webnest.in");

        client.post().uri("/api/enrollments")
            .headers(h -> h.setBearerAuth(token))
            .contentType(MediaType.APPLICATION_JSON)
            .body(Map.of("courseSlug", "spring-boot"))
            .exchange()
            .expectStatus().isCreated();

        client.get().uri("/api/me/enrollments")
            .headers(h -> h.setBearerAuth(token))
            .exchange()
            .expectStatus().isOk()
            .expectBody().jsonPath("$[0].courseSlug").isEqualTo("spring-boot")
                         .jsonPath("$[0].percent").isEqualTo(0);
    }

    @Test
    void anonymousUsersCannotEnroll() {
        client.post().uri("/api/enrollments").contentType(MediaType.APPLICATION_JSON)
            .body(Map.of("courseSlug", "spring-boot"))
            .exchange().expectStatus().isUnauthorized();
    }
}`,
        output: `Containers started: pgvector/pgvector:pg17, redis:8
EnrollmentFlowIT
  ✔ studentCanEnrollAndSeeProgress()
  ✔ anonymousUsersCannotEnroll()`,
      },
    ],
    commonMistakes: [
      'Building every feature before writing any tests, then struggling to add them at the end.',
      'Skipping migrations and relying on ddl-auto=update, which will not survive a real deployment.',
      'Putting all code in one package, losing the module boundaries that make the project maintainable.',
      'Trusting ids from the client for enrolments and progress instead of checking ownership.',
      'Leaving observability to the end, when it is most useful while debugging during development.',
    ],
    keyPoints: [
      'LearnHub combines REST, JPA, Flyway, Security/JWT, Redis, events, Spring AI, testing and deployment.',
      'A modular monolith with Spring Modulith keeps boundaries clean without microservice overhead.',
      'Work in milestones, each with tests, migrations, security rules and documentation.',
      'Use events and after-commit listeners for certificates and notifications.',
      'Finish with Buildpacks images, CI/CD and production observability for a portfolio-ready project.',
    ],
  },

  'spring-boot-interview-questions-and-answers': {
    title: 'Spring Boot Interview Questions and Answers',
    intro: `Spring Boot is one of the most requested skills in Java backend job descriptions, and interviews test both concepts and practical experience. This lesson collects the questions that come up most often — from fresher to senior level — with concise answers and, where useful, code. Use it for revision after completing the course; each answer links back to a topic you have studied in depth.

Try answering each question aloud before reading the answer. Interviewers value clear explanations of <em>why</em> and <em>when</em> as much as knowing <em>what</em>.`,
    sections: [
      {
        heading: 'Fundamentals',
        body: `Core questions asked in almost every Spring Boot interview:`,
        list: [
          '<strong>What is Spring Boot and how is it different from Spring?</strong> Spring is the framework (IoC, AOP, MVC, data); Spring Boot is an opinionated layer that adds starters, auto-configuration, embedded servers and production features so a Spring app runs with minimal configuration.',
          '<strong>What does @SpringBootApplication do?</strong> It combines @SpringBootConfiguration, @EnableAutoConfiguration and @ComponentScan of the class\'s package and sub-packages.',
          '<strong>How does auto-configuration work?</strong> Spring Boot loads auto-configuration classes listed in META-INF/spring/...AutoConfiguration.imports; each uses conditions (@ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty) to create beans only when appropriate and only if you have not defined your own.',
          '<strong>What are starters?</strong> Dependency descriptors (e.g. spring-boot-starter-webmvc) that bring a tested set of libraries for a feature, with versions managed by the Spring Boot BOM.',
          '<strong>How do you change the port?</strong> server.port in properties, --server.port on the command line, SERVER_PORT environment variable; 0 for a random port.',
          '<strong>What is the order of property sources?</strong> Command-line args > environment variables > profile-specific files > application files; files outside the jar override those inside.',
          '<strong>What are profiles?</strong> Named sets of configuration and beans (dev, test, prod) activated with spring.profiles.active; application-{profile}.yml overrides defaults.',
          '<strong>Which embedded servers are supported?</strong> Tomcat (default) and Jetty; Spring Boot 4 dropped Undertow; WebFlux uses Reactor Netty.',
        ],
      },
      {
        heading: 'Dependency Injection and Beans',
        body: `Container questions:`,
        list: [
          '<strong>Constructor vs field injection?</strong> Constructor injection is recommended: dependencies are explicit and final, objects are always fully initialised, and classes are easy to unit-test without Spring.',
          '<strong>@Component vs @Service vs @Repository vs @Controller?</strong> All are components for scanning; the names document the layer, and @Repository also translates persistence exceptions into DataAccessException.',
          '<strong>@Bean vs @Component?</strong> @Component marks your own classes for scanning; @Bean methods in @Configuration classes create beans from code you do not own or that need custom construction.',
          '<strong>How do you resolve two beans of the same type?</strong> @Primary for a default, @Qualifier("name") at the injection point, or inject a List/Map of all implementations.',
          '<strong>What are bean scopes?</strong> singleton (default), prototype, and web scopes request, session, application.',
          '<strong>What is a circular dependency and how do you fix it?</strong> Two beans needing each other in constructors; Spring Boot fails by default. Fix the design: extract a third component, use events, or rethink responsibilities.',
        ],
      },
      {
        heading: 'Web, Data and Transactions',
        body: `Everyday backend questions:`,
        list: [
          '<strong>@Controller vs @RestController?</strong> @RestController = @Controller + @ResponseBody, returning data (JSON) instead of view names.',
          '<strong>How do you handle exceptions globally?</strong> @RestControllerAdvice with @ExceptionHandler methods returning ProblemDetail (RFC 9457).',
          '<strong>How do you validate input?</strong> Bean Validation annotations on DTOs with @Valid on @RequestBody; errors become 400 responses.',
          '<strong>PUT vs PATCH?</strong> PUT replaces the whole resource (idempotent); PATCH applies a partial update.',
          '<strong>What is the N+1 problem?</strong> Loading N parents then lazily loading an association per parent. Fix with join fetch, @EntityGraph, batch fetching or DTO projections.',
          '<strong>How does @Transactional work?</strong> Through a proxy that begins and commits/rolls back around public method calls from other beans; by default it rolls back on unchecked exceptions only; self-invocation bypasses it.',
          '<strong>What does readOnly = true do?</strong> Tells Hibernate to skip dirty checking and lets drivers optimise or route to replicas.',
          '<strong>Why use DTOs?</strong> To decouple the API contract from entities, avoid leaking fields and lazy-loading issues, and shape responses per use case.',
          '<strong>Flyway vs ddl-auto=update?</strong> Flyway applies reviewed, versioned migrations reproducibly; ddl-auto=update is unsafe for production.',
        ],
      },
      {
        heading: 'Security',
        body: `Security questions show whether you can be trusted with production systems:`,
        list: [
          '<strong>Authentication vs authorization?</strong> Who you are vs what you may do; 401 vs 403.',
          '<strong>How is Spring Security configured today?</strong> With SecurityFilterChain beans and the lambda DSL; WebSecurityConfigurerAdapter was removed.',
          '<strong>How do you store passwords?</strong> Hashed with an adaptive algorithm through DelegatingPasswordEncoder (bcrypt/argon2), never encrypted or plain.',
          '<strong>How do you implement JWT authentication?</strong> Use the OAuth2 resource server support (oauth2ResourceServer().jwt()), short-lived access tokens, signature/expiry/issuer/audience validation — not a hand-written filter.',
          '<strong>When can CSRF be disabled?</strong> When authentication is not sent automatically by the browser (e.g. bearer tokens in headers); keep it for cookie/session-based apps.',
          '<strong>What is method security?</strong> @EnableMethodSecurity with @PreAuthorize/@PostAuthorize to protect service methods, including ownership checks.',
        ],
      },
      {
        heading: 'Production, Testing and Architecture (Experienced Level)',
        body: `Senior-level questions:`,
        list: [
          '<strong>What is Actuator?</strong> Production endpoints for health, metrics, info, loggers and more; expose only what you need, securely.',
          '<strong>Liveness vs readiness?</strong> Liveness = restart if broken (internal state only); readiness = whether to route traffic (may include dependencies).',
          '<strong>How do you test a Spring Boot app?</strong> Unit tests with Mockito; slices (@WebMvcTest, @DataJpaTest); integration tests with @SpringBootTest and Testcontainers via @ServiceConnection; @MockitoBean replaces removed @MockBean.',
          '<strong>What are virtual threads and when do they help?</strong> Lightweight JVM threads (Java 21+) enabled with spring.threads.virtual.enabled; they scale I/O-bound blocking code, not CPU-bound work.',
          '<strong>How do you make calls to other services resilient?</strong> Timeouts, @Retryable with back-off for transient failures, @ConcurrencyLimit, circuit breakers, fallbacks, idempotency keys.',
          '<strong>How do you keep data consistent across microservices?</strong> Sagas with compensating actions, the transactional outbox, idempotent consumers, eventual consistency.',
          '<strong>Monolith or microservices?</strong> Start with a modular monolith (Spring Modulith); split when independent deployment/scaling needs justify the operational cost.',
          '<strong>What is new in Spring Boot 4?</strong> Spring Framework 7, modular starters, Jackson 3, API versioning, HTTP service clients, core @Retryable, JSpecify null-safety, RestTestClient, OpenTelemetry starter; 4.1 adds gRPC.',
          '<strong>What is Spring AI?</strong> Spring\'s portable API for LLMs: ChatClient, structured output, chat memory, tool calling, embeddings/vector stores, RAG advisors and MCP support.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Q: Show how a custom auto-configuration backs off when the user defines a bean',
        code: `@AutoConfiguration
@ConditionalOnClass(SmsClient.class)
public class SmsAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    SmsClient smsClient(@Value("\${sms.api-key}") String key) {
        return new DefaultSmsClient(key);
    }
}

// In the application — this bean wins, the auto-configured one is skipped
@Bean
SmsClient smsClient() {
    return new LoggingSmsClient();
}`,
        output: `Conditions evaluation report (--debug):
SmsAutoConfiguration#smsClient:
   Did not match: @ConditionalOnMissingBean (types: SmsClient) found beans of type 'SmsClient' smsClient`,
      },
      {
        caption: 'Q: Why does this @Transactional not roll back? (classic trick question)',
        code: `@Service
public class TransferService {

    public void transfer(long from, long to, BigDecimal amount) {
        doTransfer(from, to, amount);          // 1. self-invocation: proxy bypassed, no transaction
    }

    @Transactional
    public void doTransfer(long from, long to, BigDecimal amount) throws InsufficientFundsException {
        debit(from, amount);
        credit(to, amount);
        if (balance(from).signum() < 0) {
            throw new InsufficientFundsException();   // 2. checked exception: no rollback by default
        }
    }
}`,
        output: `Answer: two reasons —
1. transfer() calls doTransfer() on "this", so the transactional proxy never runs.
2. InsufficientFundsException is checked; default rollback applies only to RuntimeException/Error.
Fix: call through another bean (or put @Transactional on transfer), and use rollbackFor = Exception.class
or make the exception unchecked.`,
      },
      {
        caption: 'Q: Write a minimal secure REST endpoint with validation and global error handling',
        code: `public record CreateCourse(@NotBlank String title, @Positive BigDecimal price) {}

@RestController
@RequestMapping("/api/courses")
class CourseController {

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<Map<String, Object>> create(@Valid @RequestBody CreateCourse cmd) {
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("title", cmd.title()));
    }
}

@RestControllerAdvice
class Errors extends ResponseEntityExceptionHandler {}     // ProblemDetail for validation errors

@Configuration
@EnableMethodSecurity
class Security {
    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
                   .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
                   .build();
    }
}`,
        output: `POST /api/courses (no token)           -> 401
POST /api/courses (USER token)         -> 403
POST /api/courses (ADMIN, title "")    -> 400 application/problem+json with field errors
POST /api/courses (ADMIN, valid body)  -> 201 {"title":"Spring AI"}`,
      },
    ],
    commonMistakes: [
      'Memorising definitions without being able to explain trade-offs and when not to use a feature.',
      'Describing outdated practices (WebSecurityConfigurerAdapter, @MockBean, javax.*) as current.',
      'Answering "we used microservices" without explaining boundaries, data ownership and consistency.',
      'Not being able to explain a real bug you fixed — prepare two or three stories from your projects.',
      'Ignoring testing and production questions; senior roles weigh them heavily.',
    ],
    keyPoints: [
      'Know the fundamentals cold: auto-configuration, starters, @SpringBootApplication, properties and profiles.',
      'Explain proxies: why @Transactional, @Cacheable, @Async and @PreAuthorize fail on self-invocation.',
      'Be current: Spring Boot 4, Spring Security 7, Jackson 3, virtual threads, Spring AI.',
      'Show production thinking: testing strategy, observability, resilience and security.',
      'Back answers with concrete examples from projects such as the LearnHub capstone.',
    ],
  },
}
