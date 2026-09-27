// Spring Boot course — testing series (Spring Boot 4, Spring Framework 7,
// JUnit 6/Jupiter, Mockito, AssertJ, Testcontainers 2). Keys are slugs
// matching the testing module topics in codelabDefaults.js.
export const springBootTesting = {
  'unit-testing-with-junit-and-mockito': {
    title: 'Unit Testing with JUnit and Mockito',
    intro: `Unit tests check one class in isolation, run in milliseconds, and need no Spring context, database or network. They are the foundation of a healthy test suite: a Spring Boot project typically has hundreds of unit tests, dozens of slice tests and a handful of full integration tests.

This lesson shows how to design Spring components so they are easy to unit-test, and how to write clear tests with JUnit Jupiter, Mockito and AssertJ — all of which come with Spring Boot's test starters. You will stub dependencies, verify interactions, capture arguments, test exceptions, write parameterized tests and control time.`,
    sections: [
      {
        heading: 'Design for Testability: Constructor Injection',
        body: `A service that receives its dependencies through the constructor can be created in a test with <code>new OrderService(fakeRepo, fakeClock)</code> — no Spring needed. Field injection with <code>@Autowired</code> on private fields forces you to start a Spring context or use reflection. Also inject things that make code non-deterministic — <code>Clock</code>, random generators, id generators — so tests can control them.`,
      },
      {
        heading: 'The Tools',
        body: `Spring Boot's test starters bring the standard toolkit:`,
        list: [
          '<strong>JUnit Jupiter</strong> — <code>@Test</code>, <code>@BeforeEach</code>, <code>@Nested</code>, <code>@DisplayName</code>, <code>@ParameterizedTest</code>.',
          '<strong>Mockito</strong> — <code>mock()</code>, <code>when(...).thenReturn(...)</code>, <code>verify(...)</code>, <code>ArgumentCaptor</code>; with <code>@ExtendWith(MockitoExtension.class)</code> you can use <code>@Mock</code> and <code>@InjectMocks</code>.',
          '<strong>AssertJ</strong> — fluent assertions: <code>assertThat(list).hasSize(2).extracting(Order::id).containsExactly(1L, 2L)</code>.',
          '<strong>Hamcrest</strong> and <strong>JSONassert</strong> — matchers and JSON comparison, used by some Spring test APIs.',
        ],
      },
      {
        heading: 'Arrange, Act, Assert',
        body: `Structure every test in three parts: <strong>arrange</strong> the inputs and stubs, <strong>act</strong> by calling one method, and <strong>assert</strong> the outcome. Name tests after behaviour (<code>rejectsOrderWhenStockIsInsufficient</code>), not after methods (<code>testPlaceOrder2</code>). Test one behaviour per test so a failure tells you exactly what broke.`,
      },
      {
        heading: 'Stubs vs Verification',
        body: `Prefer asserting on <strong>results and state</strong> over verifying calls. Use <code>verify</code> for interactions that <em>are</em> the behaviour — "an email is sent", "the payment gateway is charged exactly once", "nothing is saved when validation fails". Over-verifying every call makes tests brittle: they break on harmless refactorings.`,
      },
      {
        heading: 'What Not to Mock',
        body: `Do not mock value objects, records, collections or the class under test. Do not mock types you do not own in complex ways (for example chaining mocks of <code>RestClient</code>); wrap them in your own small interface or test them with a slice or integration test instead.`,
      },
    ],
    examples: [
      {
        caption: 'The class under test: a service with injected dependencies and a Clock',
        code: `@Service
public class CouponService {

    private final CouponRepository coupons;
    private final Clock clock;

    public CouponService(CouponRepository coupons, Clock clock) {
        this.coupons = coupons;
        this.clock = clock;
    }

    public BigDecimal apply(String code, BigDecimal total) {
        Coupon coupon = coupons.findByCode(code)
            .orElseThrow(() -> new InvalidCouponException("Unknown coupon " + code));
        if (coupon.expiresOn().isBefore(LocalDate.now(clock))) {
            throw new InvalidCouponException("Coupon " + code + " has expired");
        }
        BigDecimal discount = total.multiply(BigDecimal.valueOf(coupon.percent()))
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        coupons.markUsed(code);
        return total.subtract(discount);
    }
}

public record Coupon(String code, int percent, LocalDate expiresOn) {}

// Production Clock bean
@Bean
Clock clock() {
    return Clock.systemDefaultZone();
}`,
        output: '(Because Clock and CouponRepository are constructor parameters, the test can pass in a fixed clock and a mock.)',
      },
      {
        caption: 'Unit tests with Mockito, AssertJ and a fixed Clock',
        code: `@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock CouponRepository coupons;
    Clock fixedClock = Clock.fixed(Instant.parse("2026-09-27T10:00:00Z"), ZoneOffset.UTC);
    CouponService service;

    @BeforeEach
    void setUp() {
        service = new CouponService(coupons, fixedClock);
    }

    @Test
    void appliesPercentageDiscount() {
        when(coupons.findByCode("WELCOME10"))
            .thenReturn(Optional.of(new Coupon("WELCOME10", 10, LocalDate.of(2026, 12, 31))));

        BigDecimal result = service.apply("WELCOME10", new BigDecimal("2999.00"));

        assertThat(result).isEqualByComparingTo("2699.10");
        verify(coupons).markUsed("WELCOME10");
    }

    @Test
    void rejectsExpiredCoupon() {
        when(coupons.findByCode("SUMMER"))
            .thenReturn(Optional.of(new Coupon("SUMMER", 20, LocalDate.of(2026, 8, 31))));

        assertThatThrownBy(() -> service.apply("SUMMER", new BigDecimal("1000")))
            .isInstanceOf(InvalidCouponException.class)
            .hasMessageContaining("expired");
        verify(coupons, never()).markUsed(anyString());
    }

    @Test
    void rejectsUnknownCoupon() {
        when(coupons.findByCode("NOPE")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.apply("NOPE", BigDecimal.TEN))
            .isInstanceOf(InvalidCouponException.class)
            .hasMessage("Unknown coupon NOPE");
    }
}`,
        output: `CouponServiceTest
  ✔ appliesPercentageDiscount()   (12 ms)
  ✔ rejectsExpiredCoupon()        (3 ms)
  ✔ rejectsUnknownCoupon()        (2 ms)
Tests run: 3, Failures: 0, Errors: 0`,
      },
      {
        caption: 'Parameterized tests and nested test classes',
        code: `class PasswordPolicyTest {

    PasswordPolicy policy = new PasswordPolicy(12);

    @ParameterizedTest(name = "\\"{0}\\" is rejected")
    @ValueSource(strings = {"", "short", "elevenchars", "            "})
    void rejectsWeakPasswords(String password) {
        assertThat(policy.isAcceptable(password)).isFalse();
    }

    @ParameterizedTest
    @CsvSource({
        "correct-horse-battery, true",
        "Tr0ub4dor&3xyz,        true",
        "aaaaaaaaaaaaaaaa,      false"   // repeated characters are rejected
    })
    void evaluatesPasswords(String password, boolean expected) {
        assertThat(policy.isAcceptable(password)).isEqualTo(expected);
    }

    @Nested
    @DisplayName("when the password contains the username")
    class ContainsUsername {
        @Test
        void isRejected() {
            assertThat(policy.isAcceptable("asha-password-2026", "asha")).isFalse();
        }
    }
}`,
        output: `PasswordPolicyTest
  ✔ "" is rejected
  ✔ "short" is rejected
  ✔ "elevenchars" is rejected
  ✔ "            " is rejected
  ✔ evaluatesPasswords(correct-horse-battery, true)
  ✔ evaluatesPasswords(Tr0ub4dor&3xyz, true)
  ✔ evaluatesPasswords(aaaaaaaaaaaaaaaa, false)
  when the password contains the username
    ✔ isRejected()`,
      },
      {
        caption: 'Capturing arguments to check what was saved or sent',
        code: `@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock UserRepository users;
    @Mock MailSender mail;
    @InjectMocks RegistrationService service;   // Mockito calls the constructor with the mocks

    @Captor ArgumentCaptor<User> userCaptor;

    @Test
    void savesNormalisedEmailAndSendsWelcomeMail() {
        when(users.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        service.register("  Asha@Webnest.IN ", "Asha");

        verify(users).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getEmail()).isEqualTo("asha@webnest.in");
        verify(mail).sendWelcome("asha@webnest.in", "Asha");
        verifyNoMoreInteractions(mail);
    }
}`,
        output: `RegistrationServiceTest > savesNormalisedEmailAndSendsWelcomeMail() PASSED`,
      },
    ],
    commonMistakes: [
      'Starting a full @SpringBootTest to test plain business logic that could be a millisecond unit test.',
      'Using field injection, which makes classes impossible to construct in unit tests without Spring.',
      'Calling LocalDate.now() or Instant.now() directly, producing tests that fail on certain dates or time zones.',
      'Verifying every single mock interaction, so tests break whenever the implementation is refactored.',
      'Comparing BigDecimal with isEqualTo, which fails for 2699.10 vs 2699.1; use isEqualByComparingTo.',
    ],
    keyPoints: [
      'Constructor injection lets you create any Spring component in a test with plain new.',
      'JUnit Jupiter, Mockito and AssertJ are included in Spring Boot\'s test starters.',
      'Follow Arrange-Act-Assert and name tests after behaviour.',
      'Inject Clock and other sources of non-determinism so tests are repeatable.',
      'Prefer asserting results; verify only interactions that are part of the behaviour.',
    ],
  },

  'web-layer-tests-with-webmvctest': {
    title: 'Web Layer Tests with @WebMvcTest',
    intro: `A controller does more than call a service: it maps URLs and HTTP methods, binds path variables and JSON bodies, runs validation, converts exceptions to status codes, and serialises responses. None of that is exercised by a unit test that calls the controller method directly.

<code>@WebMvcTest</code> starts a <strong>slice</strong> of the application containing only the web layer — controllers, <code>@ControllerAdvice</code>, Jackson, validation, filters and security configuration — and gives you <code>MockMvc</code> to send requests without a real server. This lesson uses Spring Boot 4's test starters and the AssertJ-based <code>MockMvcTester</code>.`,
    sections: [
      {
        heading: 'Dependencies in Spring Boot 4',
        body: `Spring Boot 4 splits test support by technology. Add <code>spring-boot-starter-webmvc-test</code> (test scope) for MVC slice tests; it includes the general test starter. The annotation now lives in <code>org.springframework.boot.webmvc.test.autoconfigure</code>. Services and other dependencies of the controller are replaced with <code>@MockitoBean</code> — Spring Boot's old <code>@MockBean</code> was removed in version 4.`,
      },
      {
        heading: 'What the Slice Includes',
        body: `<code>@WebMvcTest(ProductController.class)</code> loads that controller plus web infrastructure: <code>@ControllerAdvice</code>, <code>@JsonComponent</code>/<code>@JacksonComponent</code>, converters, filters, <code>WebMvcConfigurer</code> beans and Spring Security configuration. It does <strong>not</strong> load <code>@Service</code>, <code>@Repository</code> or other components, so startup is fast and failures point at the web layer.`,
      },
      {
        heading: 'MockMvc vs MockMvcTester',
        body: `The classic <code>MockMvc</code> API uses static builders and <code>andExpect(...)</code> matchers. <code>MockMvcTester</code> (Spring Framework 6.2+) wraps it with fluent AssertJ assertions: <code>assertThat(mvc.get().uri("/api/products/1")).hasStatusOk().bodyJson()...</code>. Spring Boot auto-configures both in <code>@WebMvcTest</code> when AssertJ is present. New tests should prefer <code>MockMvcTester</code>.`,
      },
      {
        heading: 'What to Test',
        body: `For each endpoint, cover: the happy path status and JSON shape; validation failures (400 with a ProblemDetail body); not-found and conflict mappings from your exception handler; and security rules (see the Security testing lesson). Check the response JSON with JSON paths or by comparing with an expected JSON document — this catches accidental field renames that would break API clients.`,
      },
    ],
    examples: [
      {
        caption: 'Test dependency',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webmvc-test</artifactId>
    <scope>test</scope>
</dependency>`,
        output: '(Brings JUnit, Mockito, AssertJ, Spring Test, MockMvc and the @WebMvcTest slice.)',
      },
      {
        caption: 'The controller under test',
        code: `@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ProductDto get(@PathVariable Long id) {
        return service.find(id).orElseThrow(() -> new ProductNotFoundException(id));
    }

    @PostMapping
    public ResponseEntity<ProductDto> create(@Valid @RequestBody CreateProductRequest req) {
        ProductDto created = service.create(req);
        return ResponseEntity.created(URI.create("/api/products/" + created.id())).body(created);
    }
}

public record CreateProductRequest(@NotBlank String name, @Positive BigDecimal price) {}
public record ProductDto(Long id, String name, BigDecimal price) {}`,
        output: '(ProductNotFoundException is mapped to 404 by a @RestControllerAdvice returning ProblemDetail.)',
      },
      {
        caption: 'Slice tests with MockMvcTester and @MockitoBean',
        code: `@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired MockMvcTester mvc;
    @MockitoBean ProductService service;

    @Test
    void returnsProductAsJson() {
        when(service.find(1L)).thenReturn(Optional.of(new ProductDto(1L, "Hoodie", new BigDecimal("1299.00"))));

        assertThat(mvc.get().uri("/api/products/1"))
            .hasStatusOk()
            .bodyJson()
            .isLenientlyEqualTo("""
                {"id": 1, "name": "Hoodie", "price": 1299.00}
                """);
    }

    @Test
    void returns404ProblemDetailForUnknownProduct() {
        when(service.find(99L)).thenReturn(Optional.empty());

        assertThat(mvc.get().uri("/api/products/99"))
            .hasStatus(HttpStatus.NOT_FOUND)
            .bodyJson()
            .extractingPath("$.title").isEqualTo("Product not found");
    }

    @Test
    void createsProductAndReturnsLocation() {
        when(service.create(any())).thenReturn(new ProductDto(7L, "Cap", new BigDecimal("499")));

        assertThat(mvc.post().uri("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": "Cap", "price": 499}
                    """))
            .hasStatus(HttpStatus.CREATED)
            .hasHeader("Location", "/api/products/7");
    }

    @Test
    void rejectsInvalidRequestBody() {
        assertThat(mvc.post().uri("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": "", "price": -5}
                    """))
            .hasStatus(HttpStatus.BAD_REQUEST);
        verifyNoInteractions(service);
    }
}`,
        output: `ProductControllerTest
  ✔ returnsProductAsJson()
  ✔ returns404ProblemDetailForUnknownProduct()
  ✔ createsProductAndReturnsLocation()
  ✔ rejectsInvalidRequestBody()
Tests run: 4 (context started in 0.9 s — only the web layer)`,
      },
      {
        caption: 'The same style with classic MockMvc (still common in existing code)',
        code: `@WebMvcTest(ProductController.class)
class ProductControllerClassicTest {

    @Autowired MockMvc mockMvc;
    @MockitoBean ProductService service;

    @Test
    void returnsProduct() throws Exception {
        when(service.find(1L)).thenReturn(Optional.of(new ProductDto(1L, "Hoodie", new BigDecimal("1299.00"))));

        mockMvc.perform(get("/api/products/1").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Hoodie"))
            .andExpect(jsonPath("$.price").value(1299.00))
            .andDo(print());
    }
}`,
        output: `MockHttpServletResponse:
           Status = 200
     Content type = application/json
             Body = {"id":1,"name":"Hoodie","price":1299.00}`,
      },
    ],
    commonMistakes: [
      'Using @SpringBootTest for every controller test, making the suite slow and failures hard to locate.',
      'Still using @MockBean from Spring Boot 3 examples; it was removed in Spring Boot 4 — use @MockitoBean.',
      'Forgetting that @WebMvcTest loads your SecurityFilterChain, then being surprised by 401/403 responses — test security explicitly with @WithMockUser.',
      'Only asserting the status code, missing broken JSON field names that clients depend on.',
      'Mocking the controller itself or calling its methods directly, bypassing binding, validation and exception handling.',
    ],
    keyPoints: [
      '@WebMvcTest loads only the web layer; dependencies are replaced with @MockitoBean.',
      'Spring Boot 4 uses spring-boot-starter-webmvc-test for MVC slice tests.',
      'MockMvcTester provides fluent AssertJ assertions for status, headers and JSON.',
      'Test happy paths, validation errors, error mappings and security for every endpoint.',
      'Compare JSON bodies to catch accidental API contract changes.',
    ],
  },

  'data-layer-tests-with-datajpatest': {
    title: 'Data Layer Tests with @DataJpaTest',
    intro: `Repository methods look trivial — until a derived query name matches the wrong property, a JPQL join drops rows, a projection maps a column incorrectly, or an entity mapping does not match the migration scripts. These bugs only appear when real SQL runs against a real schema.

<code>@DataJpaTest</code> starts just the persistence slice — entities, repositories, the <code>EntityManager</code>, Flyway or Liquibase — and wraps each test in a transaction that rolls back afterwards. This lesson shows how to test repositories, custom queries and mappings, why testing against your real database with Testcontainers beats H2, and how to use <code>TestEntityManager</code>.`,
    sections: [
      {
        heading: 'What @DataJpaTest Configures',
        body: `The slice includes JPA repositories, entity scanning, the <code>DataSource</code>, transaction management, migrations and a <code>TestEntityManager</code>. It does not load controllers or services. Each test method runs in a transaction that is <strong>rolled back</strong> at the end, so tests do not affect each other. SQL logging is enabled by default so you can see what ran. In Spring Boot 4, add <code>spring-boot-starter-data-jpa-test</code> with test scope.`,
      },
      {
        heading: 'H2 vs Your Real Database',
        body: `By default <code>@DataJpaTest</code> replaces your DataSource with an embedded database such as H2. That is fast, but H2 is not PostgreSQL or MySQL: native queries, JSON columns, specific functions, case sensitivity and constraint behaviour differ, so tests can pass on H2 and fail in production. Prefer running the slice against the same database engine with Testcontainers and <code>@ServiceConnection</code>.`,
      },
      {
        heading: 'Flushing and Clearing',
        body: `Within one transaction, Hibernate may keep changes in memory and never send SQL until flush. A test that saves an entity and immediately reads it back may only be testing the first-level cache. Use <code>TestEntityManager.persistAndFlush()</code> and <code>clear()</code> — or <code>saveAndFlush()</code> plus <code>entityManager.clear()</code> — so the read really hits the database. This is also how you catch constraint violations in tests.`,
      },
      {
        heading: 'What Deserves a Repository Test',
        body: `Do not test Spring Data's own <code>save</code> and <code>findById</code>. Test your <strong>custom</strong> queries: derived methods with several conditions, <code>@Query</code> JPQL and native SQL, projections, specifications, pagination and sorting, and entity mappings such as cascades, unique constraints and soft deletes.`,
      },
    ],
    examples: [
      {
        caption: 'Test dependencies for data slice tests with Testcontainers',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-testcontainers</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-postgresql</artifactId>
    <scope>test</scope>
</dependency>`,
        output: '(Testcontainers 2 renamed its modules to testcontainers-<module>; Spring Boot 4 manages their versions.)',
      },
      {
        caption: 'Repository test against real PostgreSQL',
        code: `@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class OrderRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17");

    @Autowired OrderRepository orders;
    @Autowired TestEntityManager em;

    Customer asha;

    @BeforeEach
    void setUp() {
        asha = em.persist(new Customer("asha@webnest.in", "Asha"));
        Customer ravi = em.persist(new Customer("ravi@webnest.in", "Ravi"));
        em.persist(new Order(asha, OrderStatus.PAID));
        em.persist(new Order(asha, OrderStatus.CANCELLED));
        em.persist(new Order(ravi, OrderStatus.PAID));
        em.flush();
        em.clear();          // make the queries below hit the database
    }

    @Test
    void findsOnlyMatchingOrdersForCustomer() {
        List<Order> result = orders.findForCustomer("asha@webnest.in", List.of(OrderStatus.PAID));

        assertThat(result)
            .hasSize(1)
            .allSatisfy(o -> assertThat(o.getStatus()).isEqualTo(OrderStatus.PAID));
    }

    @Test
    void cancelsStalePendingOrders() {
        em.persist(new Order(asha, OrderStatus.PENDING, Instant.parse("2026-01-01T00:00:00Z")));
        em.flush();

        int updated = orders.cancelStalePendingOrders(Instant.parse("2026-06-01T00:00:00Z"));

        assertThat(updated).isEqualTo(1);
    }
}`,
        output: `Creating container for image: postgres:17
Container postgres:17 started in PT2.3S
Successfully applied 5 migrations to schema "public"
OrderRepositoryTest
  ✔ findsOnlyMatchingOrdersForCustomer()
  ✔ cancelsStalePendingOrders()
(each test rolled back automatically)`,
      },
      {
        caption: 'Testing constraints and projections',
        code: `@Test
void emailMustBeUnique() {
    em.persistAndFlush(new Customer("meera@webnest.in", "Meera"));

    assertThatThrownBy(() -> em.persistAndFlush(new Customer("meera@webnest.in", "Other Meera")))
        .isInstanceOf(ConstraintViolationException.class);   // org.hibernate.exception
}

@Test
void courseStatsProjectionAggregatesEnrollments() {
    Course boot = em.persist(new Course("Spring Boot"));
    Student s1 = em.persist(new Student("s1"));
    Student s2 = em.persist(new Student("s2"));
    em.persist(new Enrollment(s1, boot, 40));
    em.persist(new Enrollment(s2, boot, 60));
    em.flush();
    em.clear();

    assertThat(courseRepository.courseStats())
        .containsExactly(new CourseStats("Spring Boot", 2, 50.0));
}`,
        output: `✔ emailMustBeUnique()
  ERROR: duplicate key value violates unique constraint "customers_email_key"
✔ courseStatsProjectionAggregatesEnrollments()`,
      },
    ],
    commonMistakes: [
      'Testing with H2 while production runs PostgreSQL, so native queries and constraints are never really tested.',
      'Saving and reading back without flush/clear, testing Hibernate\'s cache instead of the database.',
      'Writing tests for inherited CRUD methods instead of your custom queries.',
      'Sharing mutable data across tests and relying on execution order.',
      'Starting a new container for every test class; declare it static (or in a shared @TestConfiguration) to reuse it.',
    ],
    keyPoints: [
      '@DataJpaTest loads only the persistence layer and rolls back each test.',
      'In Spring Boot 4 use spring-boot-starter-data-jpa-test.',
      'Run repository tests against the real database engine using Testcontainers and @ServiceConnection.',
      'Flush and clear the persistence context before asserting on query results.',
      'Focus tests on custom queries, projections and mapping constraints.',
    ],
  },

  'integration-tests-with-testcontainers': {
    title: 'Integration Tests with Testcontainers',
    intro: `Unit and slice tests prove that each layer works on its own. Integration tests prove that the layers work <strong>together</strong> — HTTP request to controller to service to database and back, including security, JSON, transactions, migrations and messaging — against real infrastructure.

Testcontainers starts real PostgreSQL, Redis, Kafka, RabbitMQ or any Docker image from your test code, and Spring Boot's <code>@ServiceConnection</code> wires them into your application automatically. This lesson builds full end-to-end tests with <code>@SpringBootTest</code>, Testcontainers 2 and the new <code>RestTestClient</code>, shares containers across tests, and reuses the same setup to run the application locally.`,
    sections: [
      {
        heading: '@SpringBootTest and Web Environments',
        body: `<code>@SpringBootTest</code> starts the whole application context. With <code>webEnvironment = RANDOM_PORT</code> it also starts the embedded server on a free port, so tests send real HTTP requests. The default <code>MOCK</code> environment uses a mock servlet environment (combine it with <code>@AutoConfigureMockMvc</code> — Spring Boot 4 no longer adds MockMvc automatically). Full-context tests are slower, so keep them few and focused on important end-to-end flows.`,
      },
      {
        heading: 'RestTestClient',
        body: `Spring Framework 7 adds <code>RestTestClient</code>, a fluent test client for servlet applications (the counterpart of WebTestClient). In Spring Boot 4 add <code>spring-boot-starter-restclient-test</code> and annotate the test with <code>@AutoConfigureRestTestClient</code>; the client is pre-configured with the random port. It replaces most uses of <code>TestRestTemplate</code>, which now also needs an explicit <code>@AutoConfigureTestRestTemplate</code>.`,
      },
      {
        heading: 'Testcontainers and @ServiceConnection',
        body: `A <code>@Container</code> field declares a container; Testcontainers starts it before the tests. <code>@ServiceConnection</code> tells Spring Boot to derive connection details from it — datasource URL, Redis host, Kafka bootstrap servers — without any <code>@DynamicPropertySource</code> boilerplate. Supported out of the box: PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, MongoDB, Redis, Kafka, RabbitMQ, Elasticsearch, Cassandra, Neo4j, ActiveMQ, Ollama (via Spring AI) and more.`,
      },
      {
        heading: 'Sharing Containers and Speed',
        body: `Starting containers takes seconds. Declare containers as <code>@Bean</code>s in a <code>@TestConfiguration</code> class and <code>@Import</code> it from each test: Spring's test context cache then reuses the same context and containers across all test classes with the same configuration. Avoid <code>@DirtiesContext</code>, which throws the cached context away.`,
      },
      {
        heading: 'Running the App Locally with the Same Containers',
        body: `Create a <code>TestApplication</code> class in <code>src/test/java</code> that calls <code>SpringApplication.from(Application::main).with(ContainersConfig.class).run(args)</code>. Running it starts your application with fresh containers, so new developers can run the whole system with zero local installation — only Docker.`,
      },
    ],
    examples: [
      {
        caption: 'Shared container configuration',
        code: `@TestConfiguration(proxyBeanMethods = false)
public class ContainersConfig {

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgres() {
        return new PostgreSQLContainer("postgres:17");
    }

    @Bean
    @ServiceConnection(name = "redis")
    GenericContainer<?> redis() {
        return new GenericContainer<>("redis:8").withExposedPorts(6379);
    }
}`,
        output: '(Any test that @Imports ContainersConfig shares the same running PostgreSQL and Redis containers through Spring\'s context cache.)',
      },
      {
        caption: 'End-to-end HTTP test with RestTestClient',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-restclient-test</artifactId>
    <scope>test</scope>
</dependency>

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@Import(ContainersConfig.class)
class ProductApiIT {

    @Autowired RestTestClient client;
    @Autowired ProductRepository repository;

    @BeforeEach
    void clean() {
        repository.deleteAll();
    }

    @Test
    void createThenFetchProduct() {
        client.post().uri("/api/products")
            .contentType(MediaType.APPLICATION_JSON)
            .body(Map.of("name", "Hoodie", "price", 1299))
            .headers(h -> h.setBasicAuth("admin", "admin123"))
            .exchange()
            .expectStatus().isCreated()
            .expectHeader().exists("Location");

        client.get().uri("/api/products?name=Hoodie")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.content[0].name").isEqualTo("Hoodie")
            .jsonPath("$.content[0].price").isEqualTo(1299.0);

        assertThat(repository.count()).isEqualTo(1);
    }

    @Test
    void anonymousUsersCannotCreateProducts() {
        client.post().uri("/api/products")
            .contentType(MediaType.APPLICATION_JSON)
            .body(Map.of("name", "Cap", "price", 499))
            .exchange()
            .expectStatus().isUnauthorized();
    }
}`,
        output: `Container postgres:17 started
Container redis:8 started
Tomcat started on port 54872 (http)
ProductApiIT
  ✔ createThenFetchProduct()
  ✔ anonymousUsersCannotCreateProducts()`,
      },
      {
        caption: 'Full-context test with MockMvc (no real server)',
        code: `@SpringBootTest
@AutoConfigureMockMvc          // required explicitly in Spring Boot 4
@Import(ContainersConfig.class)
class CheckoutFlowIT {

    @Autowired MockMvcTester mvc;

    @Test
    @WithMockUser(username = "asha@webnest.in")
    void checkoutReducesStockAndCreatesOrder() {
        assertThat(mvc.post().uri("/api/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"items": [{"productId": 1, "quantity": 2}]}
                    """)
                .with(csrf()))
            .hasStatus(HttpStatus.CREATED)
            .bodyJson()
            .extractingPath("$.status").isEqualTo("PLACED");
    }
}`,
        output: `CheckoutFlowIT > checkoutReducesStockAndCreatesOrder() PASSED`,
      },
      {
        caption: 'Running the application locally with the test containers',
        code: `// src/test/java/com/webnest/shop/TestShopApplication.java
public class TestShopApplication {

    public static void main(String[] args) {
        SpringApplication.from(ShopApplication::main)
            .with(ContainersConfig.class)
            .run(args);
    }
}

# Maven: run the app from the test classpath
./mvnw spring-boot:test-run
# Gradle
./gradlew bootTestRun`,
        output: `Container postgres:17 started
Container redis:8 started
Started TestShopApplication in 6.2 seconds
(No local PostgreSQL or Redis installation needed — only Docker.)`,
      },
    ],
    commonMistakes: [
      'Writing most tests as full @SpringBootTest integration tests, producing a slow suite that nobody runs locally.',
      'Using @DirtiesContext liberally, forcing Spring to restart contexts and containers for every class.',
      'Hard-coding container ports instead of letting @ServiceConnection supply the mapped port.',
      'Forgetting that Spring Boot 4 needs @AutoConfigureMockMvc or @AutoConfigureRestTestClient explicitly.',
      'Leaving data from one test in the database, making other tests order-dependent; clean up or use unique data.',
    ],
    keyPoints: [
      '@SpringBootTest(webEnvironment = RANDOM_PORT) runs the full application on a real port.',
      'RestTestClient (spring-boot-starter-restclient-test + @AutoConfigureRestTestClient) is the modern HTTP test client.',
      '@ServiceConnection wires Testcontainers into Spring Boot with no manual properties.',
      'Share containers through a @TestConfiguration so the context cache reuses them.',
      'SpringApplication.from(...).with(...) runs the app locally with the same containers.',
    ],
  },
}
