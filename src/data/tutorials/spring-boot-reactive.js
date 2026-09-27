// Spring Boot course — reactive stack lessons (Project Reactor, WebFlux,
// WebClient, R2DBC on Spring Boot 4). Keys are slugs matching the reactive
// module topics in codelabDefaults.js.
export const springBootReactive = {
  'reactive-programming-with-project-reactor': {
    title: 'Reactive Programming with Project Reactor',
    intro: `Traditional Spring MVC code is <strong>blocking</strong>: a thread handles a request and waits while the database or a remote API responds. Reactive programming takes the opposite approach: work is described as a pipeline of asynchronous steps, and threads are never parked waiting for I/O. A small number of threads can then serve a very large number of concurrent, slow connections — streaming, chat, gateways, and fan-out to many services.

Spring's reactive stack is built on <strong>Project Reactor</strong>. Before touching WebFlux you need to be comfortable with its two types, <code>Mono</code> and <code>Flux</code>, and its operators. This lesson covers the reactive-streams model, creating and transforming publishers, combining streams, error handling, backpressure, schedulers, and testing with <code>StepVerifier</code>.`,
    sections: [
      {
        heading: 'Mono and Flux',
        body: `A <code>Mono&lt;T&gt;</code> emits zero or one value and then completes (or errors) — like an asynchronous <code>Optional</code>. A <code>Flux&lt;T&gt;</code> emits zero to many values — like an asynchronous stream. Both are <strong>lazy</strong>: nothing happens until someone <strong>subscribes</strong>. In a WebFlux application the framework subscribes for you when it writes the HTTP response, so your code returns publishers and almost never calls <code>subscribe()</code> itself.`,
      },
      {
        heading: 'Operators',
        body: `Reactor offers hundreds of operators; these are the ones you use daily:`,
        list: [
          '<code>map</code> — transform each value synchronously.',
          '<code>flatMap</code> — transform each value into another publisher (an async call) and merge the results; <code>concatMap</code> keeps order.',
          '<code>filter</code>, <code>take</code>, <code>skip</code>, <code>distinct</code> — select values.',
          '<code>zip</code> / <code>Mono.zip</code> — combine results of several independent calls.',
          '<code>switchIfEmpty</code>, <code>defaultIfEmpty</code> — handle missing values.',
          '<code>onErrorResume</code>, <code>onErrorReturn</code>, <code>retryWhen</code>, <code>timeout</code> — resilience.',
          '<code>doOnNext</code>, <code>doOnError</code>, <code>log</code> — side effects for logging and debugging.',
          '<code>collectList</code>, <code>reduce</code>, <code>buffer</code>, <code>window</code> — aggregate.',
        ],
      },
      {
        heading: 'Backpressure',
        body: `Reactive Streams lets a subscriber tell the publisher how many items it can handle (<code>request(n)</code>). A slow consumer therefore cannot be flooded by a fast producer. Operators such as <code>limitRate</code>, <code>onBackpressureBuffer</code> and <code>onBackpressureDrop</code> let you decide what happens when a source cannot slow down.`,
      },
      {
        heading: 'Never Block Inside a Reactive Pipeline',
        body: `WebFlux runs on a few event-loop threads (one per CPU core by default). Calling a blocking API — JDBC, <code>Thread.sleep</code>, <code>RestTemplate</code>, <code>block()</code> — on those threads freezes every connection they serve. If you must call blocking code, wrap it with <code>Mono.fromCallable(...)</code> and move it to <code>Schedulers.boundedElastic()</code> with <code>subscribeOn</code>. Tools like BlockHound detect accidental blocking in tests.`,
      },
      {
        heading: 'Reactive or Virtual Threads?',
        body: `Since Java 21, virtual threads let ordinary blocking Spring MVC code scale to many concurrent requests with far less complexity. For most CRUD services, Spring MVC with virtual threads is simpler to write, debug and test. Reactive remains the better fit for streaming data, long-lived connections (SSE, WebSockets), backpressure, and composing many asynchronous sources.`,
      },
    ],
    examples: [
      {
        caption: 'Creating and transforming Mono and Flux',
        code: `import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

Mono<String> name = Mono.just("asha");
Mono<String> empty = Mono.empty();
Flux<Integer> scores = Flux.just(72, 95, 88, 40, 99);

name.map(String::toUpperCase)
    .subscribe(n -> System.out.println("name: " + n));

scores.filter(s -> s >= 80)
      .map(s -> s + " (pass with distinction)")
      .subscribe(System.out::println);

empty.defaultIfEmpty("anonymous").subscribe(n -> System.out.println("user: " + n));

Flux.range(1, 5)
    .reduce(0, Integer::sum)
    .subscribe(sum -> System.out.println("sum 1..5 = " + sum));`,
        output: `name: ASHA
95 (pass with distinction)
88 (pass with distinction)
99 (pass with distinction)
user: anonymous
sum 1..5 = 15`,
      },
      {
        caption: 'flatMap for async calls, zip for combining, and error handling',
        code: `Mono<User> findUser(long id) { ... }            // async lookups
Mono<List<Order>> ordersOf(long userId) { ... }
Mono<Integer> pointsOf(long userId) { ... }

record Dashboard(User user, List<Order> orders, int points) {}

Mono<Dashboard> dashboard(long id) {
    return findUser(id)
        .switchIfEmpty(Mono.error(new UserNotFoundException(id)))
        .flatMap(user -> Mono.zip(ordersOf(user.id()), pointsOf(user.id()))   // both calls in parallel
            .map(t -> new Dashboard(user, t.getT1(), t.getT2())))
        .timeout(Duration.ofSeconds(2))
        .onErrorResume(TimeoutException.class, e -> Mono.error(new ServiceUnavailableException("Dashboard timed out")));
}

// Flux of ids -> fetch each user concurrently (max 4 at a time)
Flux<User> users = Flux.just(1L, 2L, 3L, 4L, 5L)
    .flatMap(this::findUser, 4);`,
        output: `dashboard(7)   -> Dashboard[user=User[id=7, name=Asha], orders=[...], points=150]
dashboard(999) -> error UserNotFoundException
(slow services) -> error ServiceUnavailableException: Dashboard timed out`,
      },
      {
        caption: 'Wrapping blocking code safely',
        code: `// A legacy blocking library call
LegacyReport generateBlocking(long id) { ... }        // takes ~1 s, blocks the thread

Mono<LegacyReport> generate(long id) {
    return Mono.fromCallable(() -> generateBlocking(id))
               .subscribeOn(Schedulers.boundedElastic());   // runs on a thread pool meant for blocking work
}`,
        output: `[boundedElastic-1] generating report 42
(event-loop threads stay free to serve other requests)`,
      },
      {
        caption: 'Testing pipelines with StepVerifier',
        code: `<dependency>
    <groupId>io.projectreactor</groupId>
    <artifactId>reactor-test</artifactId>
    <scope>test</scope>
</dependency>

@Test
void filtersHighScores() {
    Flux<Integer> high = Flux.just(72, 95, 88, 40).filter(s -> s >= 80);

    StepVerifier.create(high)
        .expectNext(95, 88)
        .verifyComplete();
}

@Test
void timesOutUsingVirtualTime() {
    StepVerifier.withVirtualTime(() -> Mono.never().timeout(Duration.ofSeconds(30)))
        .thenAwait(Duration.ofSeconds(30))
        .expectError(TimeoutException.class)
        .verify();                               // completes instantly, no real waiting
}`,
        output: `✔ filtersHighScores()
✔ timesOutUsingVirtualTime()   (2 ms)`,
      },
    ],
    commonMistakes: [
      'Calling block() or blocking APIs (JDBC, Thread.sleep) inside WebFlux handlers, freezing event-loop threads.',
      'Forgetting that publishers are lazy — building a Mono and never returning or subscribing to it means nothing happens.',
      'Using map for an async call (producing Mono<Mono<T>>) instead of flatMap.',
      'Subscribing manually inside a pipeline ("fire and forget") and losing errors and backpressure.',
      'Choosing reactive for a simple CRUD service where Spring MVC with virtual threads would be simpler.',
    ],
    keyPoints: [
      'Mono emits 0..1 values, Flux emits 0..N; both are lazy until subscribed.',
      'map transforms values; flatMap composes async calls; zip combines independent results.',
      'Handle errors with onErrorResume, retryWhen and timeout.',
      'Never block event-loop threads; move blocking work to Schedulers.boundedElastic().',
      'Test with StepVerifier, including virtual time for time-based operators.',
    ],
  },

  'spring-webflux': {
    title: 'Building Reactive APIs with Spring WebFlux',
    intro: `Spring WebFlux is Spring's reactive web framework, the non-blocking counterpart of Spring MVC. It runs on Netty by default (or on Servlet containers in non-blocking mode) and handles requests with a small number of event-loop threads, returning <code>Mono</code> and <code>Flux</code> instead of plain objects.

This lesson builds reactive REST endpoints with both programming models — familiar annotated controllers and functional router functions — streams data to browsers with Server-Sent Events, handles errors and validation, and tests endpoints with <code>WebTestClient</code>.`,
    sections: [
      {
        heading: 'Setup',
        body: `Add <code>spring-boot-starter-webflux</code> instead of <code>spring-boot-starter-webmvc</code>. If both are present, Spring Boot starts Spring MVC, so choose one per application. Spring Boot auto-configures Reactor Netty, Jackson codecs, validation and error handling. The whole call chain must be non-blocking to benefit, so pair WebFlux with reactive data access (R2DBC, reactive MongoDB or Redis) and <code>WebClient</code>.`,
      },
      {
        heading: 'Annotated Controllers',
        body: `The same annotations as Spring MVC work in WebFlux: <code>@RestController</code>, <code>@GetMapping</code>, <code>@RequestBody</code>, <code>@PathVariable</code>, <code>@Valid</code>, <code>@ExceptionHandler</code>. The difference is the return types: <code>Mono&lt;T&gt;</code> for single values and <code>Flux&lt;T&gt;</code> for collections or streams, and request bodies can be <code>Mono&lt;T&gt;</code> too. This makes moving between the stacks easy for developers.`,
      },
      {
        heading: 'Functional Endpoints',
        body: `Alternatively, define routes as code with <code>RouterFunction</code> and handler functions that take a <code>ServerRequest</code> and return <code>Mono&lt;ServerResponse&gt;</code>. Functional endpoints give you explicit control over routing and are easy to compose, which some teams prefer for small services and gateways.`,
      },
      {
        heading: 'Streaming with Server-Sent Events',
        body: `Returning a <code>Flux</code> with <code>produces = MediaType.TEXT_EVENT_STREAM_VALUE</code> keeps the connection open and pushes each element to the client as an SSE event — ideal for live prices, progress updates, notifications and streaming AI answers. Browsers consume SSE with the built-in <code>EventSource</code> API.`,
      },
      {
        heading: 'Testing with WebTestClient',
        body: `<code>@WebFluxTest</code> loads the web slice for WebFlux (add <code>spring-boot-starter-webflux-test</code>), and <code>WebTestClient</code> sends requests and asserts on status, headers, JSON bodies and even streams. With <code>@SpringBootTest(webEnvironment = RANDOM_PORT)</code> it tests a running server.`,
      },
    ],
    examples: [
      {
        caption: 'An annotated reactive controller',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courses;     // reactive repository (R2DBC)

    public CourseController(CourseRepository courses) {
        this.courses = courses;
    }

    @GetMapping
    public Flux<Course> all() {
        return courses.findAll();
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<Course>> one(@PathVariable Long id) {
        return courses.findById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Course> create(@Valid @RequestBody Mono<NewCourse> body) {
        return body.map(NewCourse::toEntity).flatMap(courses::save);
    }
}`,
        output: `Netty started on port 8080 (http)
GET  /api/courses      -> [{"id":1,"slug":"java-core",...},{"id":2,"slug":"spring-boot",...}]
GET  /api/courses/99   -> 404
POST /api/courses {...} -> 201 {"id":3,...}`,
      },
      {
        caption: 'Functional endpoints with RouterFunction',
        code: `@Configuration
public class StudentRoutes {

    @Bean
    RouterFunction<ServerResponse> studentRouter(StudentHandler handler) {
        return RouterFunctions.route()
            .path("/api/students", builder -> builder
                .GET("", handler::list)
                .GET("/{id}", handler::get)
                .POST("", handler::create))
            .build();
    }
}

@Component
public class StudentHandler {

    private final StudentRepository students;

    public StudentHandler(StudentRepository students) {
        this.students = students;
    }

    public Mono<ServerResponse> list(ServerRequest req) {
        return ServerResponse.ok().body(students.findAll(), Student.class);
    }

    public Mono<ServerResponse> get(ServerRequest req) {
        long id = Long.parseLong(req.pathVariable("id"));
        return students.findById(id)
            .flatMap(s -> ServerResponse.ok().bodyValue(s))
            .switchIfEmpty(ServerResponse.notFound().build());
    }

    public Mono<ServerResponse> create(ServerRequest req) {
        return req.bodyToMono(Student.class)
            .flatMap(students::save)
            .flatMap(saved -> ServerResponse.created(URI.create("/api/students/" + saved.id())).bodyValue(saved));
    }
}`,
        output: `GET /api/students/1 -> 200 {"id":1,"name":"Asha Rao"}
GET /api/students/9 -> 404`,
      },
      {
        caption: 'Streaming live updates with Server-Sent Events',
        code: `public record PriceTick(String symbol, BigDecimal price, Instant at) {}

@RestController
public class LivePriceController {

    @GetMapping(value = "/api/prices/{symbol}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<PriceTick> stream(@PathVariable String symbol) {
        return Flux.interval(Duration.ofSeconds(1))
            .map(i -> new PriceTick(symbol, randomPrice(), Instant.now()))
            .take(Duration.ofMinutes(5));
    }
}

// Browser
// const es = new EventSource('/api/prices/WEBNEST/stream');
// es.onmessage = e => console.log(JSON.parse(e.data));`,
        output: `curl -N localhost:8080/api/prices/WEBNEST/stream
data:{"symbol":"WEBNEST","price":102.35,"at":"2026-09-27T10:00:01Z"}

data:{"symbol":"WEBNEST","price":102.41,"at":"2026-09-27T10:00:02Z"}
...`,
      },
      {
        caption: 'Testing with @WebFluxTest and WebTestClient',
        code: `@WebFluxTest(CourseController.class)
class CourseControllerTest {

    @Autowired WebTestClient client;
    @MockitoBean CourseRepository courses;

    @Test
    void returnsCourse() {
        when(courses.findById(1L)).thenReturn(Mono.just(new Course(1L, "spring-boot", "Spring Boot")));

        client.get().uri("/api/courses/1")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.slug").isEqualTo("spring-boot");
    }

    @Test
    void returns404WhenMissing() {
        when(courses.findById(9L)).thenReturn(Mono.empty());

        client.get().uri("/api/courses/9").exchange().expectStatus().isNotFound();
    }
}`,
        output: `CourseControllerTest
  ✔ returnsCourse()
  ✔ returns404WhenMissing()`,
      },
    ],
    commonMistakes: [
      'Adding both webmvc and webflux starters and expecting WebFlux — Spring Boot then runs Spring MVC.',
      'Using JPA/JDBC repositories in WebFlux handlers, blocking the event loop.',
      'Returning Mono<List<T>> for large collections instead of Flux<T>, losing streaming and backpressure.',
      'Putting blocking code in RouterFunction handlers without moving it to boundedElastic.',
      'Forgetting that SecurityContext is read from ReactiveSecurityContextHolder, not SecurityContextHolder.',
    ],
    keyPoints: [
      'spring-boot-starter-webflux runs on Reactor Netty with non-blocking request handling.',
      'Annotated controllers return Mono and Flux; functional endpoints use RouterFunction and handlers.',
      'Flux with text/event-stream streams Server-Sent Events to browsers.',
      'The full chain must be non-blocking: use R2DBC, reactive drivers and WebClient.',
      'Test with @WebFluxTest and WebTestClient.',
    ],
  },

  'webclient': {
    title: 'Calling Services Reactively with WebClient',
    intro: `<code>WebClient</code> is Spring's non-blocking HTTP client. It is the natural choice inside WebFlux applications, and it is also useful in any application that needs to call many services concurrently or consume streaming responses (Server-Sent Events, streaming AI APIs, large downloads) efficiently.

This lesson covers configuring <code>WebClient</code> in Spring Boot 4, making requests and handling responses, error handling, timeouts and retries, calling several services in parallel, consuming streams, adding filters for authentication and logging, and testing with MockWebServer.`,
    sections: [
      {
        heading: 'Setup and the Builder',
        body: `In a WebFlux application, <code>spring-boot-starter-webflux</code> brings WebClient. In a Spring MVC application, add <code>spring-boot-starter-webclient</code> (new in Spring Boot 4). Inject the auto-configured <code>WebClient.Builder</code>, which carries the application's codecs and <code>WebClientCustomizer</code> beans, then set a base URL and default headers. Timeouts can be set globally with <code>spring.http.clients.*</code> or per client through the connector.`,
      },
      {
        heading: 'Requests and Responses',
        body: `The API mirrors RestClient: <code>get()</code>/<code>post()</code> → <code>uri(...)</code> → <code>retrieve()</code> → <code>bodyToMono(Type.class)</code>, <code>bodyToFlux(Type.class)</code> or <code>toEntity(...)</code>. Nothing is sent until the returned publisher is subscribed. <code>onStatus</code> maps error statuses to exceptions; by default 4xx and 5xx produce <code>WebClientResponseException</code>.`,
      },
      {
        heading: 'Resilience',
        body: `Combine Reactor operators for robust calls: <code>timeout(Duration)</code> caps response time; <code>retryWhen(Retry.backoff(3, Duration.ofMillis(200)).filter(...))</code> retries transient failures only (5xx, connection errors) with exponential back-off and jitter; <code>onErrorResume</code> provides fallbacks. Never retry non-idempotent requests without an idempotency key.`,
      },
      {
        heading: 'Using WebClient from Spring MVC',
        body: `In a blocking application you can call <code>.block()</code> at the edge, but if you only need synchronous calls, <code>RestClient</code> is simpler. WebClient pays off in MVC when you need to fan out to many services concurrently and then combine the results, or to consume streams.`,
      },
    ],
    examples: [
      {
        caption: 'Configuring a client and making requests',
        code: `@Configuration
public class ClientsConfig {

    @Bean
    WebClient catalogWebClient(WebClient.Builder builder,
                               @Value("\${catalog.base-url}") String baseUrl) {
        return builder
            .baseUrl(baseUrl)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }
}

@Service
public class CatalogReactiveClient {

    private final WebClient client;

    public CatalogReactiveClient(WebClient catalogWebClient) {
        this.client = catalogWebClient;
    }

    public Mono<Product> product(long id) {
        return client.get().uri("/api/products/{id}", id)
            .retrieve()
            .onStatus(s -> s.value() == 404, r -> Mono.error(new ProductNotFoundException(id)))
            .bodyToMono(Product.class);
    }

    public Flux<Product> byCategory(String category) {
        return client.get()
            .uri(u -> u.path("/api/products").queryParam("category", category).build())
            .retrieve()
            .bodyToFlux(Product.class);
    }

    public Mono<Product> create(NewProduct p) {
        return client.post().uri("/api/products")
            .bodyValue(p)
            .retrieve()
            .bodyToMono(Product.class);
    }
}`,
        output: `product(5)          -> Mono emits Product[id=5, name=Hoodie, price=1299.00]
product(999)        -> Mono errors with ProductNotFoundException
byCategory("books") -> Flux emits 12 products as they are decoded`,
      },
      {
        caption: 'Timeouts, retries with back-off, and fallbacks',
        code: `public Mono<Rates> rates(String base) {
    return client.get().uri("/rates/{base}", base)
        .retrieve()
        .bodyToMono(Rates.class)
        .timeout(Duration.ofSeconds(2))
        .retryWhen(Retry.backoff(3, Duration.ofMillis(200))
            .jitter(0.5)
            .filter(ex -> ex instanceof WebClientResponseException.ServiceUnavailable
                       || ex instanceof WebClientRequestException
                       || ex instanceof TimeoutException))
        .onErrorResume(ex -> ratesCache.lastKnown(base));   // stale but useful fallback
}`,
        output: `attempt 1 -> 503
attempt 2 (after ~200 ms) -> 503
attempt 3 (after ~400 ms) -> 200 OK
(if all attempts fail -> last known rates returned from cache)`,
      },
      {
        caption: 'Parallel fan-out from a Spring MVC controller',
        code: `@GetMapping("/api/product-page/{id}")
public ProductPage page(@PathVariable long id) {
    Mono<Product> product = catalog.product(id);
    Mono<List<Review>> reviews = reviewsClient.forProduct(id).collectList();
    Mono<Stock> stock = inventoryClient.stock(id);

    return Mono.zip(product, reviews, stock)
        .map(t -> new ProductPage(t.getT1(), t.getT2(), t.getT3()))
        .block(Duration.ofSeconds(3));     // blocking once, at the edge of an MVC app
}`,
        output: `catalog: 180 ms, reviews: 240 ms, inventory: 150 ms
total ≈ 250 ms (in parallel) instead of ≈ 570 ms (sequential)`,
      },
      {
        caption: 'Consuming a Server-Sent Events stream and testing with MockWebServer',
        code: `public Flux<PriceTick> livePrices(String symbol) {
    return client.get().uri("/api/prices/{s}/stream", symbol)
        .accept(MediaType.TEXT_EVENT_STREAM)
        .retrieve()
        .bodyToFlux(PriceTick.class);
}

// Test with OkHttp MockWebServer
class CatalogReactiveClientTest {

    MockWebServer server = new MockWebServer();

    @Test
    void readsProduct() throws IOException {
        server.enqueue(new MockResponse()
            .setHeader("Content-Type", "application/json")
            .setBody("{\\"id\\":5,\\"name\\":\\"Hoodie\\",\\"price\\":1299.00}"));
        server.start();

        WebClient client = WebClient.create(server.url("/").toString());
        StepVerifier.create(new CatalogReactiveClient(client).product(5))
            .expectNextMatches(p -> p.name().equals("Hoodie"))
            .verifyComplete();
    }
}`,
        output: `livePrices("WEBNEST") -> emits a PriceTick every second until cancelled
CatalogReactiveClientTest > readsProduct() PASSED`,
      },
    ],
    commonMistakes: [
      'Building a WebClient request and never subscribing (or returning) it, so no HTTP call is made.',
      'Calling block() inside a WebFlux handler, which throws or freezes the event loop.',
      'Retrying every error, including 400 and non-idempotent POSTs.',
      'Creating WebClient.create() per request instead of reusing configured instances.',
      'Using WebClient with block() everywhere in an MVC app where RestClient would be simpler.',
    ],
    keyPoints: [
      'WebClient is the non-blocking HTTP client; in Boot 4 MVC apps add spring-boot-starter-webclient.',
      'retrieve() + bodyToMono/bodyToFlux; nothing happens until subscription.',
      'Use timeout, retryWhen(Retry.backoff(...)) with filters, and onErrorResume fallbacks.',
      'Mono.zip fans out calls in parallel; bodyToFlux consumes streams such as SSE.',
      'Test with MockWebServer and StepVerifier.',
    ],
  },

  'r2dbc-reactive-database-access': {
    title: 'R2DBC: Reactive Database Access',
    intro: `A reactive web layer is only non-blocking if everything below it is too. JDBC is inherently blocking — every query parks a thread until the database answers — so WebFlux applications need a different database API. <strong>R2DBC</strong> (Reactive Relational Database Connectivity) is a non-blocking specification for SQL databases, with drivers for PostgreSQL, MySQL, MariaDB, SQL Server, Oracle and H2.

Spring Data R2DBC offers repositories and a fluent <code>DatabaseClient</code> on top of it. This lesson configures R2DBC in Spring Boot 4, maps entities, writes reactive repositories and custom queries, uses reactive transactions, manages schema with Flyway, and explains R2DBC's limitations compared with JPA.`,
    sections: [
      {
        heading: 'Setup',
        body: `Add <code>spring-boot-starter-data-r2dbc</code> and an R2DBC driver such as <code>org.postgresql:r2dbc-postgresql</code>. Configure <code>spring.r2dbc.url</code> (for example <code>r2dbc:postgresql://localhost:5432/webnest</code>), username and password. Spring Boot configures a connection pool (<code>r2dbc-pool</code>), a <code>DatabaseClient</code>, an <code>R2dbcEntityTemplate</code> and a reactive transaction manager.`,
      },
      {
        heading: 'Entities and Repositories',
        body: `Spring Data R2DBC maps simple objects or records with <code>@Table</code>, <code>@Id</code> and <code>@Column</code>. Repositories extend <code>ReactiveCrudRepository</code> or <code>R2dbcRepository</code>, return <code>Mono</code>/<code>Flux</code>, and support derived queries and <code>@Query</code> with SQL. Auditing (<code>@CreatedDate</code>) and optimistic locking (<code>@Version</code>) are supported.`,
      },
      {
        heading: 'Limitations Compared with JPA',
        body: `R2DBC is deliberately simpler than JPA: there is no lazy loading, no relationship mapping (<code>@OneToMany</code>), no cascading, no first-level cache and no automatic schema generation. You load related data explicitly with separate queries or joins. Many teams find this predictable and easy to reason about; it resembles Spring Data JDBC.`,
      },
      {
        heading: 'Transactions and Schema',
        body: `<code>@Transactional</code> works on methods that return <code>Mono</code> or <code>Flux</code>, managed by <code>R2dbcTransactionManager</code>; <code>TransactionalOperator</code> offers programmatic control. Schema migrations still run through Flyway or Liquibase, which use JDBC — so also add the JDBC driver and point <code>spring.flyway.url</code> at the same database.`,
      },
    ],
    examples: [
      {
        caption: 'Dependencies and configuration',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-r2dbc</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>r2dbc-postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
<!-- Flyway runs migrations over JDBC -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-flyway</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

# application.yml
spring:
  r2dbc:
    url: r2dbc:postgresql://localhost:5432/webnest
    username: webnest
    password: \${DB_PASSWORD}
    pool:
      max-size: 20
  flyway:
    url: jdbc:postgresql://localhost:5432/webnest
    user: webnest
    password: \${DB_PASSWORD}`,
        output: `Flyway: Successfully applied 2 migrations
Netty started on port 8080 (http)`,
      },
      {
        caption: 'Entity, repository and custom SQL',
        code: `@Table("courses")
public record Course(
        @Id Long id,
        String slug,
        String title,
        BigDecimal price,
        @Column("published_at") Instant publishedAt,
        @Version Long version) {}

public interface CourseRepository extends R2dbcRepository<Course, Long> {

    Mono<Course> findBySlug(String slug);

    Flux<Course> findByPriceLessThanOrderByPriceAsc(BigDecimal max);

    @Query("select * from courses where title ilike concat('%', :text, '%') order by title limit :limit")
    Flux<Course> search(String text, int limit);
}

courseRepository.findByPriceLessThanOrderByPriceAsc(new BigDecimal("2000"))
    .map(Course::title)
    .subscribe(System.out::println);`,
        output: `HTML
Java - Core`,
      },
      {
        caption: 'Loading related data explicitly and using DatabaseClient',
        code: `public record Lesson(@Id Long id, Long courseId, String title, int position) {}
public record CourseWithLessons(Course course, List<Lesson> lessons) {}

public Mono<CourseWithLessons> withLessons(String slug) {
    return courses.findBySlug(slug)
        .flatMap(c -> lessons.findByCourseIdOrderByPosition(c.id())
            .collectList()
            .map(list -> new CourseWithLessons(c, list)));
}

// Hand-written SQL with DatabaseClient
public Flux<CourseStat> stats() {
    return db.sql("""
            select c.title, count(e.id) as students
            from courses c left join enrollments e on e.course_id = c.id
            group by c.title order by students desc
            """)
        .map((row, meta) -> new CourseStat(row.get("title", String.class), row.get("students", Long.class)))
        .all();
}`,
        output: `withLessons("spring-boot") -> CourseWithLessons[course=Course[slug=spring-boot,...], lessons=[Lesson[title=Spring vs Spring Boot vs Spring MVC,...], ...]]
stats() -> CourseStat[title=Spring Boot, students=1240], CourseStat[title=Java - Core, students=980]`,
      },
      {
        caption: 'Reactive transactions',
        code: `@Service
public class EnrollmentService {

    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;
    private final WalletRepository wallets;

    public EnrollmentService(CourseRepository courses, EnrollmentRepository enrollments, WalletRepository wallets) {
        this.courses = courses;
        this.enrollments = enrollments;
        this.wallets = wallets;
    }

    @Transactional
    public Mono<Enrollment> enroll(long studentId, String slug) {
        return courses.findBySlug(slug)
            .switchIfEmpty(Mono.error(new CourseNotFoundException(slug)))
            .flatMap(course -> wallets.debit(studentId, course.price())      // fails if insufficient balance
                .then(enrollments.save(new Enrollment(null, studentId, course.id(), Instant.now()))));
    }
}`,
        output: `enroll(7, "spring-boot") -> COMMIT: wallet debited, enrollment saved
enroll(8, "spring-boot") (insufficient balance) -> ROLLBACK: no enrollment, wallet unchanged`,
      },
    ],
    commonMistakes: [
      'Mixing JPA repositories into a WebFlux app "just for one query", reintroducing blocking calls.',
      'Expecting @OneToMany mappings and lazy loading in R2DBC; relationships must be loaded explicitly.',
      'Forgetting that Flyway needs a JDBC URL and driver even in an R2DBC application.',
      'Using an r2dbc: URL in spring.datasource.url or a jdbc: URL in spring.r2dbc.url.',
      'Choosing R2DBC for a traditional MVC app where JPA or JDBC with virtual threads would be simpler.',
    ],
    keyPoints: [
      'R2DBC provides non-blocking SQL access for reactive applications.',
      'spring-boot-starter-data-r2dbc + an R2DBC driver + spring.r2dbc.* configure it.',
      'R2dbcRepository returns Mono/Flux and supports derived queries, @Query, @Version and auditing.',
      'No lazy loading or relationship mapping — load related data explicitly or with DatabaseClient.',
      '@Transactional works on reactive methods; migrations still use Flyway over JDBC.',
    ],
  },
}
