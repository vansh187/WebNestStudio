// Spring Boot course — advanced topics: Spring Modulith, Spring Batch 6,
// Spring for GraphQL and gRPC (Spring Boot 4.1). Keys are slugs matching
// topics in the Advanced module of codelabDefaults.js.
export const springBootAdvanced = {
  'modular-monoliths-with-spring-modulith': {
    title: 'Modular Monoliths with Spring Modulith',
    intro: `Many teams jump to microservices to escape a "big ball of mud" monolith, only to discover that the mud was an architecture problem, not a deployment problem. A <strong>modular monolith</strong> keeps one deployable application but organises it into well-separated modules with explicit APIs — giving most of the maintainability benefits of microservices without the distributed-systems cost, and leaving the door open to extract a module into a service later.

<strong>Spring Modulith</strong> makes this practical: it detects modules from your package structure, verifies that modules only use each other's public APIs, lets modules communicate through events with a reliable publication registry, tests modules in isolation, and generates architecture documentation. This lesson walks through all of these with Spring Modulith 2 on Spring Boot 4.`,
    sections: [
      {
        heading: 'Modules from Packages',
        body: `Each direct sub-package of your main application package is an <strong>application module</strong>: <code>com.webnest.shop.catalog</code>, <code>com.webnest.shop.orders</code>, <code>com.webnest.shop.payments</code>. Types in a module's top-level package form its public API; types in sub-packages (<code>orders.internal</code>) are internal and must not be used by other modules. <code>ApplicationModules.of(App.class).verify()</code> fails a test if any module reaches into another's internals or if modules form cycles.`,
      },
      {
        heading: 'Communicating with Events',
        body: `Instead of calling each other's services directly, modules publish domain events and react with <code>@ApplicationModuleListener</code> — an asynchronous, transactional event listener that runs after the publishing transaction commits, in its own transaction. This keeps modules loosely coupled. With the <strong>event publication registry</strong> (for example <code>spring-modulith-starter-jpa</code>), events are stored in the database with the business transaction and re-delivered if a listener fails, so no event is lost on a crash.`,
      },
      {
        heading: 'Externalising Events',
        body: `Annotate an event with <code>@Externalized("orders.placed")</code> and add a Modulith externalisation module (Kafka, RabbitMQ, JMS, SQS...). Spring Modulith publishes the event to the broker after commit, via the registry — effectively a built-in transactional outbox. This is how a module starts integrating with other services, and the first step when extracting it into a microservice.`,
      },
      {
        heading: 'Testing and Documentation',
        body: `<code>@ApplicationModuleTest</code> bootstraps only one module (and optionally its dependencies), so tests stay fast and prove the module works on its own. The <code>Scenario</code> API asserts on published events. <code>Documenter</code> generates C4/PlantUML component diagrams and a module canvas from the actual code, so architecture documentation never goes stale.`,
      },
    ],
    examples: [
      {
        caption: 'Dependencies and module structure',
        code: `<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.modulith</groupId>
            <artifactId>spring-modulith-bom</artifactId>
            <version>\${spring-modulith.version}</version>   <!-- the 2.x line for Spring Boot 4 -->
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
<dependencies>
    <dependency>
        <groupId>org.springframework.modulith</groupId>
        <artifactId>spring-modulith-starter-core</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.modulith</groupId>
        <artifactId>spring-modulith-starter-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.modulith</groupId>
        <artifactId>spring-modulith-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>

com.webnest.shop
├── ShopApplication.java
├── catalog/                  <- module "catalog"
│   ├── CatalogService.java   (public API)
│   └── internal/…            (hidden from other modules)
├── orders/
│   ├── OrderService.java
│   ├── OrderPlaced.java      (public event)
│   └── internal/…
└── notifications/
    └── internal/…`,
        output: '(Set spring-modulith.version to the current 2.x release listed on the Spring Modulith project page; start.spring.io adds it for you when you select Spring Modulith.)',
      },
      {
        caption: 'Verifying module boundaries',
        code: `class ModularityTests {

    ApplicationModules modules = ApplicationModules.of(ShopApplication.class);

    @Test
    void verifiesModularStructure() {
        modules.forEach(System.out::println);
        modules.verify();
    }

    @Test
    void writesDocumentation() {
        new Documenter(modules).writeDocumentation();   // PlantUML diagrams + module canvases in target/spring-modulith-docs
    }
}

// A violation: notifications reaching into orders' internals
package com.webnest.shop.notifications.internal;
import com.webnest.shop.orders.internal.OrderEntity;   // not allowed`,
        output: `# Catalog  > Logical name: catalog  > Base package: com.webnest.shop.catalog
# Orders   > Logical name: orders   > Depends on: catalog
# Notifications > ...

org.springframework.modulith.core.Violations:
- Module 'notifications' depends on non-exposed type com.webnest.shop.orders.internal.OrderEntity within module 'orders'!`,
      },
      {
        caption: 'Reliable events between modules and externalisation to Kafka',
        code: `// orders module — public event
@Externalized("orders.placed::#{orderId()}")          // also published to Kafka, keyed by orderId
public record OrderPlaced(String orderId, String email, BigDecimal total) {}

@Service
public class OrderService {

    private final ApplicationEventPublisher events;
    private final OrderRepository orders;

    public OrderService(ApplicationEventPublisher events, OrderRepository orders) {
        this.events = events;
        this.orders = orders;
    }

    @Transactional
    public void place(PlaceOrder cmd) {
        Order order = orders.save(Order.from(cmd));
        events.publishEvent(new OrderPlaced(order.getNumber(), cmd.email(), order.getTotal()));
    }
}

// notifications module — reacts asynchronously after commit, in its own transaction
@Component
class OrderNotifications {

    @ApplicationModuleListener
    void on(OrderPlaced event) {
        mail.sendConfirmation(event.email(), event.orderId());
    }
}

# application.yml
spring:
  modulith:
    events:
      externalization:
        enabled: true
      republish-outstanding-events-on-restart: true`,
        output: `select event_type, completion_date from event_publication;
 com.webnest.shop.orders.OrderPlaced | 2026-09-27 10:12:04   (listener completed)
 com.webnest.shop.orders.OrderPlaced | null                  (listener failed -> retried on restart)
Kafka topic orders.placed <- {"orderId":"WN-10231",...}`,
      },
      {
        caption: 'Testing one module in isolation with the Scenario API',
        code: `@ApplicationModuleTest
class OrdersModuleTests {

    @Autowired OrderService orders;

    @Test
    void publishesOrderPlaced(Scenario scenario) {
        scenario.stimulate(() -> orders.place(new PlaceOrder("asha@webnest.in", List.of(/* ... */))))
            .andWaitForEventOfType(OrderPlaced.class)
            .matching(e -> e.email().equals("asha@webnest.in"))
            .toArrive();
    }
}`,
        output: `Bootstrapping @ApplicationModuleTest for Orders in mode STANDALONE (class com.webnest.shop.orders...)
OrdersModuleTests > publishesOrderPlaced() PASSED`,
      },
    ],
    commonMistakes: [
      'Organising packages by layer (controllers, services, repositories) instead of by business module, so Modulith sees one giant module.',
      'Making everything public in a module\'s top-level package, which removes the encapsulation Modulith checks.',
      'Calling other modules\' services synchronously everywhere instead of using events for side effects.',
      'Using plain @EventListener for cross-module side effects without the publication registry, losing events on crashes.',
      'Skipping the verify() test, so boundary violations creep in unnoticed.',
    ],
    keyPoints: [
      'Spring Modulith treats each direct sub-package as a module with a public API and hidden internals.',
      'ApplicationModules.verify() enforces boundaries and detects cycles in a test.',
      '@ApplicationModuleListener + the event publication registry give reliable, decoupled module communication.',
      '@Externalized publishes events to brokers — a built-in outbox and a path to microservices.',
      '@ApplicationModuleTest and Documenter provide isolated tests and living architecture docs.',
    ],
  },

  'batch-processing-with-spring-batch': {
    title: 'Batch Processing with Spring Batch',
    intro: `Some work is not request/response at all: importing a million-row CSV of students, generating monthly invoices for every customer, recalculating course statistics every night, migrating data between systems. These jobs must process large volumes efficiently, survive failures part-way through, restart where they stopped, skip or retry bad records, and report exactly what happened.

<strong>Spring Batch</strong> is the standard framework for this in Java. This lesson covers jobs, steps and chunk-oriented processing, readers, processors and writers, fault tolerance with skip and retry, restartability with a JDBC job repository, launching jobs, and what changed in Spring Batch 6 with Spring Boot 4.`,
    sections: [
      {
        heading: 'Core Concepts',
        body: `A <strong>Job</strong> is a batch process made of one or more <strong>Steps</strong>. The most common step type is <strong>chunk-oriented</strong>: an <code>ItemReader</code> reads items one by one, an optional <code>ItemProcessor</code> transforms or filters each, and an <code>ItemWriter</code> writes them in chunks (for example 500 at a time) within one transaction. A <code>Tasklet</code> step runs a single task instead, such as deleting a temporary file. Each run is a <code>JobInstance</code> identified by its <code>JobParameters</code>, with one or more <code>JobExecution</code> attempts.`,
      },
      {
        heading: 'The Job Repository and Restartability',
        body: `Spring Batch records progress in a <strong>JobRepository</strong>: which executions ran, their status, and how far each step got. With a persistent repository, a failed job restarted with the same parameters resumes from the last committed chunk instead of starting over. In Spring Boot 4, <code>spring-boot-starter-batch</code> provides an in-memory (resourceless) repository — fine for simple, rerunnable jobs; add <code>spring-boot-starter-batch-jdbc</code> for a database-backed repository with restartability and history (MongoDB is supported too).`,
      },
      {
        heading: 'Readers and Writers',
        body: `Spring Batch ships readers and writers for common sources: <code>FlatFileItemReader</code>/<code>Writer</code> for CSV and fixed-width files, <code>JdbcCursorItemReader</code> and <code>JdbcPagingItemReader</code>, <code>JpaPagingItemReader</code>, <code>JdbcBatchItemWriter</code>, <code>JsonItemReader</code>, Kafka and MongoDB readers/writers, and many more. Builders make configuration concise.`,
      },
      {
        heading: 'Fault Tolerance and Scaling',
        body: `Mark a step <code>faultTolerant()</code> to <code>skip</code> bad records (up to a limit, logged via a <code>SkipListener</code>) and <code>retry</code> transient failures such as deadlocks. For large volumes, scale with multi-threaded steps, partitioning (split data into ranges processed in parallel), or remote chunking across machines.`,
      },
      {
        heading: 'Spring Batch 6 Changes',
        body: `Spring Batch 6 reorganised packages (for example <code>org.springframework.batch.core.job</code> and <code>...core.step</code>), made <code>JobOperator</code> the main API for launching jobs (it now extends <code>JobLauncher</code>), redesigned chunk-oriented steps — use <code>.chunk(size).transactionManager(tx)</code> instead of the deprecated <code>.chunk(size, tx)</code> — and added <code>@EnableJdbcJobRepository</code>/<code>@EnableMongoJobRepository</code> for store-specific configuration.`,
      },
    ],
    examples: [
      {
        caption: 'Dependencies and configuration',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-batch-jdbc</artifactId>   <!-- persistent, restartable job repository -->
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

# application.yml
spring:
  batch:
    jdbc:
      initialize-schema: always     # create BATCH_* metadata tables (use migrations in production)
    job:
      enabled: false                # don't run jobs automatically at startup; launch explicitly`,
        output: `Created tables BATCH_JOB_INSTANCE, BATCH_JOB_EXECUTION, BATCH_STEP_EXECUTION, ...`,
      },
      {
        caption: 'A chunk-oriented job: import students from CSV into the database',
        code: `public record StudentCsv(String name, String email, String course) {}
public record StudentRow(String name, String email, String course) {}

@Configuration
public class ImportStudentsJobConfig {

    @Bean
    @StepScope
    FlatFileItemReader<StudentCsv> studentReader(@Value("#{jobParameters['file']}") String file) {
        return new FlatFileItemReaderBuilder<StudentCsv>()
            .name("studentReader")
            .resource(new FileSystemResource(file))
            .linesToSkip(1)                                    // header row
            .delimited()
            .names("name", "email", "course")
            .targetType(StudentCsv.class)
            .build();
    }

    @Bean
    ItemProcessor<StudentCsv, StudentRow> studentProcessor() {
        return csv -> {
            if (csv.email() == null || !csv.email().contains("@")) {
                throw new ValidationException("Invalid email for " + csv.name());   // will be skipped
            }
            return new StudentRow(csv.name().trim(), csv.email().toLowerCase().trim(), csv.course());
        };
    }

    @Bean
    JdbcBatchItemWriter<StudentRow> studentWriter(DataSource dataSource) {
        return new JdbcBatchItemWriterBuilder<StudentRow>()
            .dataSource(dataSource)
            .sql("insert into student (name, email, course) values (:name, :email, :course) "
               + "on conflict (email) do nothing")
            .beanMapped()
            .build();
    }

    @Bean
    Step importStep(JobRepository jobRepository, PlatformTransactionManager tx,
                    FlatFileItemReader<StudentCsv> reader,
                    ItemProcessor<StudentCsv, StudentRow> processor,
                    JdbcBatchItemWriter<StudentRow> writer) {
        return new StepBuilder("importStudents", jobRepository)
            .<StudentCsv, StudentRow>chunk(500)
            .transactionManager(tx)
            .reader(reader)
            .processor(processor)
            .writer(writer)
            .faultTolerant()
            .skip(ValidationException.class)
            .skipLimit(100)
            .retry(DeadlockLoserDataAccessException.class)
            .retryLimit(3)
            .build();
    }

    @Bean
    Job importStudentsJob(JobRepository jobRepository, Step importStep) {
        return new JobBuilder("importStudentsJob", jobRepository)
            .start(importStep)
            .build();
    }
}`,
        output: `(Reads 500 rows, processes them, writes them in one transaction, commits, and records progress — repeated until the file ends.)`,
      },
      {
        caption: 'Launching the job with JobOperator and inspecting the result',
        code: `@RestController
@RequestMapping("/admin/jobs")
public class JobController {

    private final JobOperator jobOperator;
    private final Job importStudentsJob;

    public JobController(JobOperator jobOperator, Job importStudentsJob) {
        this.jobOperator = jobOperator;
        this.importStudentsJob = importStudentsJob;
    }

    @PostMapping("/import-students")
    public String run(@RequestParam String file) throws Exception {
        JobParameters params = new JobParametersBuilder()
            .addString("file", file)
            .addLocalDateTime("requestedAt", LocalDateTime.now())   // makes each run a new instance
            .toJobParameters();
        JobExecution execution = jobOperator.start(importStudentsJob, params);
        return execution.getStatus() + " " + execution.getStepExecutions().stream()
            .map(s -> s.getStepName() + ": read=" + s.getReadCount() + " written=" + s.getWriteCount()
                      + " skipped=" + s.getSkipCount())
            .toList();
    }
}`,
        output: `POST /admin/jobs/import-students?file=D:/imports/students-2026-09.csv
COMPLETED [importStudents: read=120000 written=119986 skipped=14]

(crash at row 64,000 and restart with the same file parameter)
-> resumes from row 64,001 because chunks up to 64,000 were already committed`,
      },
    ],
    commonMistakes: [
      'Loading an entire file or table into memory in a custom loop instead of using chunk-oriented processing.',
      'Using only the in-memory job repository for long jobs that must be restartable.',
      'Leaving spring.batch.job.enabled at its default in web applications, so jobs run on every startup.',
      'Reusing identical JobParameters for a new run and getting JobInstanceAlreadyCompleteException.',
      'Using the deprecated chunk(size, transactionManager) and JobLauncher APIs in new Spring Batch 6 code.',
    ],
    keyPoints: [
      'A Job contains Steps; chunk steps read, process and write items in transactional chunks.',
      'spring-boot-starter-batch-jdbc gives a persistent JobRepository for history and restarts.',
      'Built-in readers/writers cover files, JDBC, JPA, JSON, Kafka and more.',
      'faultTolerant() adds skip and retry policies; partitioning and multi-threading scale out.',
      'Spring Batch 6: JobOperator to launch, chunk(n).transactionManager(tx), new packages.',
    ],
  },

  'graphql-with-spring-boot': {
    title: 'GraphQL APIs with Spring Boot',
    intro: `With REST, the server decides the shape of each response. A mobile screen that needs a course title, its first five lessons and the instructor's name may need three requests — or one endpoint that returns far more data than needed. <strong>GraphQL</strong> lets the client ask for exactly the fields it wants, across related objects, in a single request, against a strongly typed schema.

Spring for GraphQL, auto-configured by <code>spring-boot-starter-graphql</code>, maps a GraphQL schema to annotated controllers. This lesson covers schema-first design, queries, mutations and nested field resolvers, solving the N+1 problem with <code>@BatchMapping</code>, validation and errors, security, the GraphiQL UI, and testing with <code>GraphQlTester</code>.`,
    sections: [
      {
        heading: 'Schema First',
        body: `Define types, queries and mutations in <code>.graphqls</code> files under <code>src/main/resources/graphql</code>. The schema is the contract: clients (and tools) introspect it, and Spring verifies at startup that every field has a data source. Types have fields with scalar types (<code>ID</code>, <code>String</code>, <code>Int</code>, <code>Float</code>, <code>Boolean</code>) or other types; <code>!</code> means non-null and <code>[Type]</code> means a list.`,
      },
      {
        heading: 'Controllers and Data Fetchers',
        body: `A <code>@Controller</code> with <code>@QueryMapping</code> and <code>@MutationMapping</code> methods implements the root fields; method names match field names, and <code>@Argument</code> binds arguments (including input types to records). <code>@SchemaMapping</code> resolves a field on a type — for example <code>Course.instructor</code> — only when the client asks for it.`,
      },
      {
        heading: 'Avoiding N+1 with @BatchMapping',
        body: `If a query returns 50 courses and the client asks for each course's instructor, a per-course <code>@SchemaMapping</code> triggers 50 lookups. <code>@BatchMapping</code> receives all 50 courses at once and returns a map of course → instructor, so you load them in one query. Always use batch mappings for nested fields on lists.`,
      },
      {
        heading: 'Security, Limits and Errors',
        body: `GraphQL typically uses a single <code>/graphql</code> endpoint, so authorise at the field level with method security (<code>@PreAuthorize</code> on controller or service methods). Because clients control query shape, protect the server against expensive queries with maximum depth and complexity limits and pagination on lists. Errors are returned in an <code>errors</code> array alongside partial data; map your exceptions to GraphQL error types with a <code>DataFetcherExceptionResolver</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Dependency and schema',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-graphql</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webmvc</artifactId>
</dependency>

# application.yml
spring:
  graphql:
    graphiql:
      enabled: true          # browser IDE at /graphiql (development)

# src/main/resources/graphql/schema.graphqls
type Query {
    courses(level: Level): [Course!]!
    course(slug: String!): Course
}

type Mutation {
    enroll(input: EnrollInput!): Enrollment!
}

enum Level { BEGINNER INTERMEDIATE ADVANCED }

type Course {
    id: ID!
    slug: String!
    title: String!
    level: Level!
    lessons(first: Int = 5): [Lesson!]!
    instructor: Instructor!
}

type Lesson { id: ID! title: String! position: Int! }
type Instructor { id: ID! name: String! }
type Enrollment { id: ID! courseSlug: String! studentEmail: String! }

input EnrollInput { courseSlug: String!, studentEmail: String! }`,
        output: `Loaded 1 resource(s) in the GraphQL schema.
GraphiQL available at /graphiql`,
      },
      {
        caption: 'Query, mutation, field and batch mappings',
        code: `@Controller
public class CourseGraphController {

    private final CourseService courses;
    private final InstructorRepository instructors;

    public CourseGraphController(CourseService courses, InstructorRepository instructors) {
        this.courses = courses;
        this.instructors = instructors;
    }

    @QueryMapping
    public List<Course> courses(@Argument Level level) {
        return courses.findAll(level);
    }

    @QueryMapping
    public Course course(@Argument String slug) {
        return courses.findBySlug(slug).orElse(null);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Enrollment enroll(@Argument EnrollInput input) {
        return courses.enroll(input.courseSlug(), input.studentEmail());
    }

    // Resolved only when the client selects Course.lessons
    @SchemaMapping
    public List<Lesson> lessons(Course course, @Argument int first) {
        return courses.lessons(course.id(), first);
    }

    // One query for all instructors of all returned courses (no N+1)
    @BatchMapping
    public Map<Course, Instructor> instructor(List<Course> courseList) {
        Map<Long, Instructor> byId = instructors.findAllById(
                courseList.stream().map(Course::instructorId).collect(Collectors.toSet()))
            .stream().collect(Collectors.toMap(Instructor::id, i -> i));
        return courseList.stream().collect(Collectors.toMap(c -> c, c -> byId.get(c.instructorId())));
    }
}

public record EnrollInput(String courseSlug, String studentEmail) {}`,
        output: `query {
  courses(level: INTERMEDIATE) {
    title
    instructor { name }
    lessons(first: 2) { title }
  }
}

{"data":{"courses":[
  {"title":"Spring Boot","instructor":{"name":"Vansh"},"lessons":[{"title":"Spring vs Spring Boot vs Spring MVC"},{"title":"Spring Boot Project Setup"}]},
  {"title":"Spring Framework","instructor":{"name":"Vansh"},"lessons":[...]}]}}

SQL executed: 1 query for courses, 1 query for all instructors, 1 per course for lessons (only because lessons were requested)`,
      },
      {
        caption: 'Testing with @GraphQlTest and GraphQlTester',
        code: `@GraphQlTest(CourseGraphController.class)
class CourseGraphControllerTest {

    @Autowired GraphQlTester graphQlTester;
    @MockitoBean CourseService courses;
    @MockitoBean InstructorRepository instructors;

    @Test
    void returnsCourseTitle() {
        when(courses.findBySlug("spring-boot"))
            .thenReturn(Optional.of(new Course(1L, "spring-boot", "Spring Boot", Level.INTERMEDIATE, 7L)));

        graphQlTester.document("""
                query { course(slug: "spring-boot") { title level } }
                """)
            .execute()
            .path("course.title").entity(String.class).isEqualTo("Spring Boot")
            .path("course.level").entity(String.class).isEqualTo("INTERMEDIATE");
    }
}`,
        output: `CourseGraphControllerTest > returnsCourseTitle() PASSED`,
      },
    ],
    commonMistakes: [
      'Using @SchemaMapping for nested fields on lists, causing N+1 queries; use @BatchMapping.',
      'Exposing unbounded lists without pagination or query depth/complexity limits.',
      'Relying on URL-based security for a single /graphql endpoint instead of field/method-level authorization.',
      'Leaving GraphiQL and schema introspection open in production for sensitive APIs.',
      'Designing the schema as a copy of database tables rather than around client use cases.',
    ],
    keyPoints: [
      'GraphQL lets clients request exactly the fields they need from a typed schema.',
      'spring-boot-starter-graphql maps schema.graphqls to @QueryMapping, @MutationMapping and @SchemaMapping methods.',
      '@BatchMapping loads nested data for many parents in one call.',
      'Secure with method security and protect the server with depth/complexity limits.',
      'Test with @GraphQlTest and GraphQlTester; explore with GraphiQL in development.',
    ],
  },

  'grpc-with-spring-boot': {
    title: 'gRPC Services with Spring Boot',
    intro: `For communication between internal services, JSON over HTTP is not always the best fit: payloads are verbose, contracts are informal, and streaming is awkward. <strong>gRPC</strong> uses Protocol Buffers — a compact binary format defined by <code>.proto</code> contracts — over HTTP/2, generates type-safe client and server code in many languages, and supports streaming in both directions.

Spring Boot 4.1 brings gRPC support into Spring Boot itself, with starters for servers and clients, auto-configuration, health, observability and test support. This lesson defines a service contract, implements a gRPC server with <code>@GrpcService</code>, calls it from a client, uses server streaming, handles errors, and compares gRPC with REST.`,
    sections: [
      {
        heading: 'Contracts with Protocol Buffers',
        body: `You describe messages and services in a <code>.proto</code> file in <code>src/main/proto</code>. The build's protobuf plugin generates Java message classes and gRPC stubs — an abstract <code>...ImplBase</code> class to extend on the server, and blocking, async and future stubs for clients. Because the contract is shared and versioned, clients in Java, Go, Python or Node generate compatible code from the same file. Field numbers must never be reused, which keeps old and new clients compatible.`,
      },
      {
        heading: 'Server Side',
        body: `Add <code>spring-boot-starter-grpc-server</code>, extend the generated base class, and annotate it with <code>@GrpcService</code>. Spring Boot starts a Netty-based gRPC server (port 9090 by default, configurable with <code>spring.grpc.server.port</code>), registers reflection so tools like <code>grpcurl</code> can discover services, exposes the standard gRPC health service when Actuator is present, and records observations (metrics and traces) for every call.`,
      },
      {
        heading: 'Client Side',
        body: `Add <code>spring-boot-starter-grpc-client</code> and configure named channels, e.g. <code>spring.grpc.client.channel.catalog.target=static://localhost:9090</code> (Spring Boot 4.1 renamed the older <code>channels.&lt;name&gt;.address</code> properties). Create stubs from channels obtained through the <code>GrpcChannelFactory</code>, or register stub beans declaratively with <code>@ImportGrpcClients</code>. Always set deadlines on calls.`,
      },
      {
        heading: 'Streaming and Errors',
        body: `gRPC supports unary calls, server streaming (one request, a stream of responses), client streaming and bidirectional streaming. Errors are reported with a <code>Status</code> code (<code>NOT_FOUND</code>, <code>INVALID_ARGUMENT</code>, <code>UNAVAILABLE</code>, <code>DEADLINE_EXCEEDED</code>...) rather than HTTP status codes; map your domain exceptions to statuses on the server.`,
      },
      {
        heading: 'gRPC or REST?',
        body: `Use gRPC for internal, high-volume service-to-service calls, polyglot environments, and streaming. Keep REST (or GraphQL) for public APIs and browser clients — browsers cannot call gRPC directly without gRPC-Web or a gateway translation. Many systems expose REST at the edge and use gRPC internally.`,
      },
    ],
    examples: [
      {
        caption: 'The contract: src/main/proto/catalog.proto',
        code: `syntax = "proto3";

package webnest.catalog.v1;

option java_multiple_files = true;
option java_package = "com.webnest.catalog.grpc";

service CatalogService {
  rpc GetCourse (GetCourseRequest) returns (Course);
  rpc ListLessons (ListLessonsRequest) returns (stream Lesson);   // server streaming
}

message GetCourseRequest   { string slug = 1; }
message ListLessonsRequest { string course_slug = 1; }

message Course {
  int64  id      = 1;
  string slug    = 2;
  string title   = 3;
  int32  lessons = 4;
}

message Lesson {
  int32  position = 1;
  string title    = 2;
}`,
        output: `(The build generates Course, GetCourseRequest, ..., and CatalogServiceGrpc with CatalogServiceImplBase and client stubs.
 Spring Initializr adds the protobuf build plugin configuration when you select gRPC.)`,
      },
      {
        caption: 'Implementing the server',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-grpc-server</artifactId>
</dependency>

@GrpcService
public class CatalogGrpcService extends CatalogServiceGrpc.CatalogServiceImplBase {

    private final CourseRepository courses;

    public CatalogGrpcService(CourseRepository courses) {
        this.courses = courses;
    }

    @Override
    public void getCourse(GetCourseRequest request, StreamObserver<Course> response) {
        courses.findBySlug(request.getSlug()).ifPresentOrElse(c -> {
            response.onNext(Course.newBuilder()
                .setId(c.getId()).setSlug(c.getSlug()).setTitle(c.getTitle()).setLessons(c.getLessonCount())
                .build());
            response.onCompleted();
        }, () -> response.onError(Status.NOT_FOUND
            .withDescription("No course " + request.getSlug()).asRuntimeException()));
    }

    @Override
    public void listLessons(ListLessonsRequest request, StreamObserver<Lesson> response) {
        courses.lessonsOf(request.getCourseSlug()).forEach(l ->
            response.onNext(Lesson.newBuilder().setPosition(l.position()).setTitle(l.title()).build()));
        response.onCompleted();
    }
}

# application.yml
spring:
  grpc:
    server:
      port: 9090`,
        output: `gRPC Server started, listening on port 9090

grpcurl -plaintext -d '{"slug":"spring-boot"}' localhost:9090 webnest.catalog.v1.CatalogService/GetCourse
{ "id": "2", "slug": "spring-boot", "title": "Spring Boot", "lessons": 118 }

grpcurl -plaintext -d '{"slug":"nope"}' localhost:9090 webnest.catalog.v1.CatalogService/GetCourse
ERROR: Code: NotFound  Message: No course nope`,
      },
      {
        caption: 'Calling the service from another Spring Boot application',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-grpc-client</artifactId>
</dependency>

# application.yml
spring:
  grpc:
    client:
      channel:
        catalog:
          target: static://catalog-service:9090

@Configuration
public class GrpcClientConfig {

    @Bean
    CatalogServiceGrpc.CatalogServiceBlockingStub catalogStub(GrpcChannelFactory channels) {
        return CatalogServiceGrpc.newBlockingStub(channels.createChannel("catalog"));
    }
}

@Service
public class CourseLookup {

    private final CatalogServiceGrpc.CatalogServiceBlockingStub catalog;

    public CourseLookup(CatalogServiceGrpc.CatalogServiceBlockingStub catalog) {
        this.catalog = catalog;
    }

    public String title(String slug) {
        return catalog.withDeadlineAfter(2, TimeUnit.SECONDS)
            .getCourse(GetCourseRequest.newBuilder().setSlug(slug).build())
            .getTitle();
    }

    public List<String> lessonTitles(String slug) {
        List<String> titles = new ArrayList<>();
        catalog.withDeadlineAfter(5, TimeUnit.SECONDS)
            .listLessons(ListLessonsRequest.newBuilder().setCourseSlug(slug).build())
            .forEachRemaining(l -> titles.add(l.getPosition() + ". " + l.getTitle()));
        return titles;
    }
}`,
        output: `title("spring-boot")        -> Spring Boot
lessonTitles("spring-boot") -> [1. Spring vs Spring Boot vs Spring MVC, 2. Spring Boot Project Setup, ...]
(catalog down) -> StatusRuntimeException: UNAVAILABLE`,
      },
    ],
    commonMistakes: [
      'Reusing or renumbering protobuf field numbers, silently breaking older clients.',
      'Calling gRPC without deadlines, so a stuck server blocks clients indefinitely.',
      'Returning generic UNKNOWN errors instead of meaningful Status codes.',
      'Exposing gRPC directly to browsers, which need gRPC-Web or a REST gateway.',
      'Using the older spring.grpc.client.channels.<name>.address properties with Spring Boot 4.1 (now channel.<name>.target).',
    ],
    keyPoints: [
      'gRPC uses Protocol Buffers contracts over HTTP/2 with generated, type-safe stubs.',
      'Spring Boot 4.1 provides spring-boot-starter-grpc-server and -client with auto-configuration.',
      '@GrpcService registers a server implementation; the server listens on port 9090 by default.',
      'Clients configure spring.grpc.client.channel.<name>.target and create stubs from GrpcChannelFactory.',
      'Use gRPC internally for efficient, streaming, polyglot calls; keep REST for public and browser APIs.',
    ],
  },
}
