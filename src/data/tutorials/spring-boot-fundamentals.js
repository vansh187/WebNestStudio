// Spring Boot course — fundamentals lessons (Spring vs Boot vs MVC,
// annotations, dependency management, properties, multi-module builds,
// packaging/deployment, H2 CRUD). Keys are slugs matching topics in
// codelabDefaults.js.
export const springBootFundamentals = {
  'spring-vs-spring-boot-vs-spring-mvc': {
    title: 'Spring vs Spring Boot vs Spring MVC',
    intro: `Beginners often use "Spring", "Spring Boot" and "Spring MVC" as if they meant the same thing, and interviewers love to ask about the difference. They are related but distinct: <strong>Spring Framework</strong> is the foundation (dependency injection, AOP, transactions, data access); <strong>Spring MVC</strong> is the web module of that framework; and <strong>Spring Boot</strong> is an opinionated layer on top that configures everything for you and runs it as a standalone application.

This lesson compares the three, explains Spring Boot's architecture and main features, shows the same "hello" endpoint built the old way and the Boot way, and summarises the Spring Boot version history so you know which tutorials apply to which version.`,
    sections: [
      {
        heading: 'Spring Framework',
        body: `The Spring Framework is a comprehensive programming model for Java applications. Its core is the <strong>IoC container</strong>, which creates objects (beans) and injects their dependencies. Around it are modules for AOP, transactions, JDBC and ORM integration, messaging, testing, and web development (Spring MVC and Spring WebFlux). Before Spring Boot, you had to choose compatible library versions yourself, write XML or Java configuration for every piece, and deploy a WAR file to an external server such as Tomcat.`,
      },
      {
        heading: 'Spring MVC',
        body: `Spring MVC is Spring's servlet-based web framework. Its central component is the <strong>DispatcherServlet</strong> (front controller), which receives every HTTP request, finds the matching <code>@Controller</code> method through handler mappings, converts request data, invokes the method, and renders the result — a view such as Thymeleaf, or JSON via message converters for <code>@RestController</code>. Spring MVC is a part of Spring Framework, and Spring Boot configures it when you add <code>spring-boot-starter-webmvc</code>.`,
      },
      {
        heading: 'Spring Boot',
        body: `Spring Boot does not replace Spring; it makes Spring easy to use. Its main features:`,
        list: [
          '<strong>Starters</strong> — curated dependency sets with compatible versions.',
          '<strong>Auto-configuration</strong> — beans configured automatically based on the classpath and properties.',
          '<strong>Embedded servers</strong> — Tomcat (default) or Jetty inside your application; run with <code>java -jar</code>.',
          '<strong>Externalised configuration</strong> — <code>application.properties/yml</code>, profiles, environment variables.',
          '<strong>Production features</strong> — Actuator health checks, metrics, tracing, graceful shutdown.',
          '<strong>Opinionated defaults</strong> — sensible choices you can override, with no XML and no code generation.',
          '<strong>Developer tools</strong> — Spring Initializr, DevTools, Docker Compose and Testcontainers support.',
        ],
      },
      {
        heading: 'Spring Boot Architecture',
        body: `A Spring Boot application is usually organised in layers: the <strong>presentation layer</strong> (controllers, JSON/HTML), the <strong>business layer</strong> (services, validation, transactions), the <strong>persistence layer</strong> (repositories, entities) and the <strong>database</strong>. A request flows from the client through the embedded server and DispatcherServlet to a controller, which calls a service, which uses a repository; the response flows back the same way. Spring Boot's role is to wire these layers together automatically at startup: <code>SpringApplication.run</code> creates the ApplicationContext, applies auto-configuration, scans your components and starts the server.`,
      },
      {
        heading: 'Version History',
        body: `Knowing the generation of a tutorial avoids confusion:`,
        list: [
          'Spring Boot 1.x (2014–2019) — the original release on Spring 4.',
          'Spring Boot 2.x (2018–2023) — Spring 5, Java 8+, WebFlux, Micrometer.',
          'Spring Boot 3.x (2022–2026) — Spring 6, Java 17+, <code>javax</code> → <code>jakarta</code>, native images, observability.',
          'Spring Boot 4.x (November 2025 →) — Spring 7, Jakarta EE 11, modular starters, Jackson 3, API versioning, HTTP service clients. This course uses 4.1.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Before Spring Boot: manual Spring MVC configuration and WAR deployment',
        code: `// 1. Register the DispatcherServlet yourself
public class WebAppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {
    @Override protected Class<?>[] getRootConfigClasses() { return null; }
    @Override protected Class<?>[] getServletConfigClasses() { return new Class<?>[] { WebConfig.class }; }
    @Override protected String[] getServletMappings() { return new String[] { "/" }; }
}

// 2. Enable MVC and component scanning yourself
@Configuration
@EnableWebMvc
@ComponentScan("com.webnest.legacy")
public class WebConfig implements WebMvcConfigurer {
    // configure message converters, view resolvers, etc. by hand
}

// 3. Choose compatible versions of spring-webmvc, jackson-databind, servlet-api...
// 4. Build a WAR and copy it into an external Tomcat's webapps/ folder`,
        output: `mvn package  -> target/legacy-app.war
cp target/legacy-app.war $TOMCAT_HOME/webapps/
$TOMCAT_HOME/bin/startup.sh`,
      },
      {
        caption: 'With Spring Boot: the same endpoint, runnable with java -jar',
        code: `// pom.xml: spring-boot-starter-parent + spring-boot-starter-webmvc (versions managed)

@SpringBootApplication
public class HelloApplication {
    public static void main(String[] args) {
        SpringApplication.run(HelloApplication.class, args);
    }
}

@RestController
class HelloController {
    @GetMapping("/hello")
    String hello() {
        return "Hello from Spring Boot";
    }
}`,
        output: `mvn package
java -jar target/hello-0.0.1-SNAPSHOT.jar
... Tomcat started on port 8080 (http)

curl http://localhost:8080/hello
Hello from Spring Boot`,
      },
      {
        caption: 'Comparison table',
        code: `Aspect               | Spring Framework          | Spring MVC                 | Spring Boot
---------------------|---------------------------|----------------------------|------------------------------
What it is           | Core framework (IoC, AOP, | Web module of Spring       | Opinionated layer on Spring
                     | transactions, data)       | (DispatcherServlet)        | that configures and runs it
Configuration        | Manual (Java/XML)         | Manual (@EnableWebMvc)     | Auto-configuration + properties
Dependencies         | Choose versions yourself  | Choose versions yourself   | Starters with managed versions
Server               | External (Tomcat, etc.)   | External (WAR deployment)  | Embedded, java -jar
Production features  | Add yourself              | Add yourself               | Actuator, metrics, health built in
Typical use today    | Foundation under Boot     | Used through Boot          | Default way to build Spring apps`,
        output: '(Spring Boot uses Spring Framework and Spring MVC; it does not replace them.)',
      },
    ],
    commonMistakes: [
      'Saying Spring Boot replaces Spring — it is built on top of Spring and uses all of its modules.',
      'Adding @EnableWebMvc in a Spring Boot app, which switches off Spring Boot\'s MVC auto-configuration.',
      'Following Spring Boot 2 tutorials (javax.* imports, WebSecurityConfigurerAdapter) on Spring Boot 3 or 4.',
      'Thinking Spring MVC is only for HTML pages — @RestController APIs are Spring MVC too.',
      'Deploying Boot apps as WARs by habit when an executable jar or container image is simpler.',
    ],
    keyPoints: [
      'Spring Framework is the foundation; Spring MVC is its servlet web module; Spring Boot configures and runs them.',
      'DispatcherServlet is the front controller that routes every request in Spring MVC.',
      'Spring Boot adds starters, auto-configuration, embedded servers, externalised config and Actuator.',
      'A typical Boot app has controller, service, repository and database layers wired at startup.',
      'Know the generation: Boot 2 (javax), Boot 3 (jakarta, Java 17), Boot 4 (Spring 7, modular, Jackson 3).',
    ],
  },

  'spring-boot-annotations-reference': {
    title: 'Spring Boot Annotations Reference',
    intro: `Spring Boot code is built from annotations: they declare components, inject dependencies, map URLs, bind configuration, manage transactions and configure tests. Knowing what each common annotation does — and which package it lives in — makes reading any Spring Boot project much easier.

This lesson is a categorised reference of the annotations you will use most, each with a short explanation and a combined example that uses them together.`,
    sections: [
      {
        heading: 'Application and Configuration',
        body: `These define the application and its beans:`,
        list: [
          '<code>@SpringBootApplication</code> — combines <code>@SpringBootConfiguration</code>, <code>@EnableAutoConfiguration</code> and <code>@ComponentScan</code>.',
          '<code>@Configuration</code> — a class that declares beans with <code>@Bean</code> methods.',
          '<code>@Bean</code> — registers the method\'s return value as a Spring bean.',
          '<code>@ComponentScan</code> — packages to scan for components.',
          '<code>@Import</code> — imports other configuration classes.',
          '<code>@Profile("dev")</code> — only active in the given profile.',
          '<code>@Conditional...</code> — <code>@ConditionalOnProperty</code>, <code>@ConditionalOnMissingBean</code>, <code>@ConditionalOnClass</code> for conditional beans.',
          '<code>@ConfigurationProperties(prefix = "app")</code> and <code>@EnableConfigurationProperties</code> — type-safe configuration binding.',
          '<code>@Value("${app.name}")</code> — inject a single property value.',
        ],
      },
      {
        heading: 'Stereotypes and Dependency Injection',
        body: `Stereotypes mark classes for component scanning and describe their role:`,
        list: [
          '<code>@Component</code> — a generic Spring-managed component.',
          '<code>@Service</code> — business logic layer.',
          '<code>@Repository</code> — persistence layer; also translates database exceptions to Spring\'s DataAccessException.',
          '<code>@Controller</code> / <code>@RestController</code> — web layer; RestController adds @ResponseBody to every method.',
          '<code>@Autowired</code> — inject a dependency (optional on a single constructor, which is the recommended style).',
          '<code>@Qualifier("name")</code> and <code>@Primary</code> — choose between several beans of the same type.',
          '<code>@Scope("prototype")</code>, <code>@Lazy</code>, <code>@PostConstruct</code>, <code>@PreDestroy</code> — scope, lazy creation and lifecycle callbacks.',
        ],
      },
      {
        heading: 'Web (Spring MVC)',
        body: `Request handling annotations:`,
        list: [
          '<code>@RequestMapping</code>, <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@PatchMapping</code>, <code>@DeleteMapping</code>.',
          '<code>@PathVariable</code>, <code>@RequestParam</code>, <code>@RequestBody</code>, <code>@RequestHeader</code>, <code>@CookieValue</code>, <code>@ModelAttribute</code>.',
          '<code>@ResponseStatus</code> — fixed HTTP status for a method or exception class.',
          '<code>@RestControllerAdvice</code> / <code>@ControllerAdvice</code> and <code>@ExceptionHandler</code> — global error handling.',
          '<code>@CrossOrigin</code> — per-controller CORS.',
          '<code>@Valid</code> / <code>@Validated</code> — trigger Bean Validation.',
        ],
      },
      {
        heading: 'Data, Transactions and Other Features',
        body: `Persistence and cross-cutting annotations:`,
        list: [
          '<code>@Entity</code>, <code>@Table</code>, <code>@Id</code>, <code>@GeneratedValue</code>, <code>@Column</code>, <code>@OneToMany</code>, <code>@ManyToOne</code> — JPA mapping.',
          '<code>@Query</code>, <code>@Modifying</code>, <code>@EntityGraph</code> — Spring Data repository methods.',
          '<code>@Transactional</code> — transaction boundaries.',
          '<code>@EnableCaching</code>/<code>@Cacheable</code>, <code>@EnableAsync</code>/<code>@Async</code>, <code>@EnableScheduling</code>/<code>@Scheduled</code>, <code>@EnableResilientMethods</code>/<code>@Retryable</code>.',
          '<code>@EventListener</code>, <code>@TransactionalEventListener</code> — application events.',
          '<code>@Aspect</code>, <code>@Before</code>, <code>@Around</code>... — AOP.',
          '<code>@EnableMethodSecurity</code>, <code>@PreAuthorize</code> — method security.',
        ],
      },
      {
        heading: 'Testing',
        body: `Test annotations from Spring Boot and Spring Test:`,
        list: [
          '<code>@SpringBootTest</code> — full application context.',
          '<code>@WebMvcTest</code>, <code>@DataJpaTest</code>, <code>@RestClientTest</code>, <code>@JsonTest</code> — slice tests.',
          '<code>@MockitoBean</code>, <code>@MockitoSpyBean</code> — replace beans with mocks or spies.',
          '<code>@AutoConfigureMockMvc</code>, <code>@AutoConfigureRestTestClient</code> — test clients.',
          '<code>@ServiceConnection</code>, <code>@Testcontainers</code>, <code>@Container</code> — Testcontainers integration.',
          '<code>@TestConfiguration</code>, <code>@ActiveProfiles</code>, <code>@DynamicPropertySource</code>, <code>@WithMockUser</code>.',
        ],
      },
    ],
    examples: [
      {
        caption: 'One small feature using the most common annotations together',
        code: `@SpringBootApplication
@EnableConfigurationProperties(ShopProperties.class)
@EnableCaching
public class ShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}

@ConfigurationProperties(prefix = "shop")
record ShopProperties(String currency, int maxCartItems) {}

@Entity
class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @Column(nullable = false) String name;
    BigDecimal price;
}

@Repository
interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("select p from Product p where p.price <= :max order by p.price")
    List<Product> cheaperThan(BigDecimal max);
}

@Service
class ProductService {
    private final ProductRepository repo;
    private final ShopProperties props;

    ProductService(ProductRepository repo, ShopProperties props) {   // constructor injection
        this.repo = repo;
        this.props = props;
    }

    @Cacheable("cheapProducts")
    @Transactional(readOnly = true)
    public List<Product> cheaperThan(BigDecimal max) {
        return repo.cheaperThan(max);
    }
}

@RestController
@RequestMapping("/api/products")
class ProductController {
    private final ProductService service;

    ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    List<Product> cheap(@RequestParam(defaultValue = "1000") BigDecimal max) {
        return service.cheaperThan(max);
    }
}

@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ProblemDetail badRequest(IllegalArgumentException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
}`,
        output: `GET /api/products?max=800
[{"id":3,"name":"Cap","price":499.00},{"id":2,"name":"Tee","price":799.00}]
(second identical request is served from the "cheapProducts" cache)`,
      },
      {
        caption: 'Choosing between beans with @Primary and @Qualifier',
        code: `interface PaymentGateway { String pay(BigDecimal amount); }

@Component
@Primary
class RazorpayGateway implements PaymentGateway {
    public String pay(BigDecimal amount) { return "razorpay:" + amount; }
}

@Component("stripeGateway")
class StripeGateway implements PaymentGateway {
    public String pay(BigDecimal amount) { return "stripe:" + amount; }
}

@Service
class CheckoutService {
    private final PaymentGateway defaultGateway;
    private final PaymentGateway internationalGateway;

    CheckoutService(PaymentGateway defaultGateway,
                    @Qualifier("stripeGateway") PaymentGateway internationalGateway) {
        this.defaultGateway = defaultGateway;             // @Primary wins
        this.internationalGateway = internationalGateway;
    }
}`,
        output: `defaultGateway.pay(100)       -> razorpay:100
internationalGateway.pay(100) -> stripe:100`,
      },
    ],
    commonMistakes: [
      'Using field injection with @Autowired everywhere instead of constructor injection.',
      'Putting @Transactional or @Cacheable on private methods, where proxies cannot apply them.',
      'Confusing @Controller (returns view names) with @RestController (returns response bodies).',
      'Adding @EnableWebMvc or @EnableAutoConfiguration again in a Boot app that already has @SpringBootApplication.',
      'Mixing javax.* annotations from old tutorials with jakarta.* in Spring Boot 3/4 projects.',
    ],
    keyPoints: [
      '@SpringBootApplication = @SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan.',
      'Stereotypes (@Component, @Service, @Repository, @RestController) mark beans by layer.',
      'Web annotations map requests and bind data; @RestControllerAdvice handles errors globally.',
      'Feature annotations (@Transactional, @Cacheable, @Async, @Scheduled) work through proxies.',
      'Test annotations provide full-context, slice, mock and container-based tests.',
    ],
  },

  'dependency-management-and-the-starter-parent': {
    title: 'Dependency Management and the Starter Parent',
    intro: `A typical Spring Boot application depends on hundreds of libraries — Spring modules, Hibernate, Jackson, Tomcat, logging, drivers — and they must all be compatible. Spring Boot solves this with <strong>dependency management</strong>: every release publishes a tested list of versions, so you declare dependencies <em>without</em> version numbers and get a combination known to work.

This lesson explains <code>spring-boot-starter-parent</code>, the <code>spring-boot-dependencies</code> BOM, how to use Boot without the parent, how to override a managed version safely, the Gradle equivalents, and tools to inspect your dependency tree.`,
    sections: [
      {
        heading: 'spring-boot-starter-parent',
        body: `Generated Maven projects inherit from <code>spring-boot-starter-parent</code>. The parent provides: dependency management via the <code>spring-boot-dependencies</code> BOM; the Java version from the <code>java.version</code> property; UTF-8 encoding; sensible plugin configuration (compiler with <code>-parameters</code>, surefire, the Spring Boot Maven plugin, resource filtering for <code>@...@</code> placeholders); and a <code>native</code> profile for GraalVM builds.`,
      },
      {
        heading: 'The BOM Without the Parent',
        body: `Companies often require their own parent POM. In that case import <code>spring-boot-dependencies</code> as a BOM in <code>&lt;dependencyManagement&gt;</code> with <code>&lt;scope&gt;import&lt;/scope&gt;</code>. You keep version management, but you must configure plugins such as <code>spring-boot-maven-plugin</code> (with its <code>repackage</code> goal) yourself. Other projects publish their own BOMs the same way — <code>spring-ai-bom</code>, <code>spring-cloud-dependencies</code>, <code>testcontainers-bom</code>.`,
      },
      {
        heading: 'Overriding a Managed Version',
        body: `Sometimes you need a newer patch of a library for a security fix. With the parent, override the version property — for example <code>&lt;jackson-bom.version&gt;</code> or <code>&lt;postgresql.version&gt;</code> — rather than adding a version to one dependency, so all related artifacts move together. The full list of property names is in the Spring Boot reference ("Dependency Versions"). Override sparingly and remove overrides when you upgrade Boot.`,
      },
      {
        heading: 'Gradle',
        body: `In Gradle, applying the <code>org.springframework.boot</code> plugin together with <code>io.spring.dependency-management</code> gives the same behaviour. Alternatively use Gradle's native platform support: <code>implementation(platform(SpringBootPlugin.BOM_COORDINATES))</code>. Versions are overridden with <code>ext["postgresql.version"] = "..."</code> when using the dependency-management plugin.`,
      },
      {
        heading: 'Inspecting Dependencies',
        body: `<code>mvn dependency:tree</code> or <code>gradle dependencies</code> show where each library comes from. <code>mvn dependency:analyze</code> finds declared-but-unused and used-but-undeclared dependencies. When two versions of the same library appear, Maven picks the nearest one in the tree — BOM management ensures that is the one Spring Boot tested.`,
      },
    ],
    examples: [
      {
        caption: 'Using the starter parent',
        code: `<project>
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
        <relativePath/>
    </parent>

    <groupId>com.webnest</groupId>
    <artifactId>shop</artifactId>
    <version>1.0.0</version>

    <properties>
        <java.version>21</java.version>
        <postgresql.version>42.7.8</postgresql.version>   <!-- override one managed version -->
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>   <!-- no <version> -->
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`,
        output: `mvn help:effective-pom | findstr postgresql.version
<postgresql.version>42.7.8</postgresql.version>`,
      },
      {
        caption: 'Using the BOM with your own company parent',
        code: `<parent>
    <groupId>com.webnest</groupId>
    <artifactId>webnest-parent</artifactId>
    <version>7</version>
</parent>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>4.1.1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <version>4.1.1</version>
            <executions>
                <execution>
                    <goals><goal>repackage</goal></goals>   <!-- needed without the parent -->
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>`,
        output: `mvn package -> target/shop-1.0.0.jar (executable, repackaged by the Spring Boot plugin)`,
      },
      {
        caption: 'Gradle equivalent and inspecting the tree',
        code: `// build.gradle.kts
plugins {
    java
    id("org.springframework.boot") version "4.1.1"
    id("io.spring.dependency-management") version "1.1.7"
}

java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    runtimeOnly("org.postgresql:postgresql")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
}

# Where does jackson come from?
./gradlew dependencyInsight --dependency tools.jackson.core:jackson-databind
mvn dependency:tree -Dincludes=tools.jackson.core`,
        output: `tools.jackson.core:jackson-databind:3.0.x
   \\--- org.springframework.boot:spring-boot-starter-jackson:4.1.1
        \\--- org.springframework.boot:spring-boot-starter-webmvc:4.1.1`,
      },
    ],
    commonMistakes: [
      'Adding explicit versions to Spring-managed dependencies, which drift out of sync on the next Boot upgrade.',
      'Overriding one artifact\'s version instead of the BOM property, producing mixed versions of a library family.',
      'Replacing the parent with the BOM but forgetting to configure the repackage goal, so the jar is not executable.',
      'Leaving old version overrides in place after upgrading Spring Boot.',
      'Importing two BOMs that manage the same library with different versions without checking which wins (the first declared).',
    ],
    keyPoints: [
      'spring-boot-starter-parent provides dependency and plugin management for Maven projects.',
      'spring-boot-dependencies is the BOM behind it; import it when you cannot use the parent.',
      'Declare Spring-managed dependencies without versions; override via version properties when needed.',
      'Gradle uses the Spring Boot plugin with dependency management or a platform BOM.',
      'Inspect with dependency:tree / dependencyInsight to understand where versions come from.',
    ],
  },

  'application-properties-and-common-settings': {
    title: 'Application Properties and Common Settings',
    intro: `Spring Boot has thousands of configuration properties, but a handful appear in nearly every project: the server port, context path, application name, logging levels, database connection, JSON settings, file upload limits, and error handling. Knowing these — and knowing the order in which Spring Boot reads configuration — lets you change behaviour without touching code.

This lesson is a practical tour of the most common <code>application.properties</code>/<code>application.yml</code> settings, the property source order (command line, environment variables, profile files), relaxed binding, placeholders and random values, and how to find any property you need.`,
    sections: [
      {
        heading: 'Where Properties Come From (Order of Precedence)',
        body: `Spring Boot merges many property sources; a higher source overrides a lower one. From highest to lowest, the ones you use most are:`,
        list: [
          'Command-line arguments: <code>java -jar app.jar --server.port=9090</code>.',
          '<code>SPRING_APPLICATION_JSON</code> (inline JSON in an environment variable).',
          'OS environment variables: <code>SERVER_PORT=9090</code>.',
          'Java system properties: <code>-Dserver.port=9090</code> (placed above environment variables in the order).',
          'Profile-specific files outside the jar, then inside the jar: <code>application-prod.yml</code>.',
          'Application files outside the jar (<code>./config/</code>, current directory), then inside the jar (<code>classpath:application.yml</code>).',
          '<code>@PropertySource</code> files and default properties set in code.',
        ],
      },
      {
        heading: 'Relaxed Binding and Environment Variables',
        body: `Property names are matched flexibly. <code>spring.datasource.url</code>, <code>SPRING_DATASOURCE_URL</code> and <code>spring.datasource.URL</code> all bind to the same property. The environment-variable form — uppercase, dots replaced by underscores, dashes removed — is how containers and cloud platforms configure Spring Boot apps.`,
      },
      {
        heading: 'Commonly Used Properties',
        body: `The settings you will change most often:`,
        list: [
          '<code>server.port</code> (default 8080; <code>0</code> picks a random free port) and <code>server.servlet.context-path</code>.',
          '<code>spring.application.name</code> — used in logs, metrics and service discovery.',
          '<code>logging.level.&lt;package&gt;</code>, <code>logging.file.name</code>.',
          '<code>spring.datasource.*</code>, <code>spring.jpa.*</code> — database and JPA.',
          '<code>spring.jackson.*</code> — JSON formatting.',
          '<code>spring.servlet.multipart.max-file-size</code> — upload limits.',
          '<code>server.error.include-message</code>, <code>include-stacktrace</code> — error detail.',
          '<code>server.compression.enabled</code>, <code>server.ssl.*</code>, <code>server.shutdown</code>.',
          '<code>spring.profiles.active</code>, <code>spring.config.import</code>.',
          '<code>management.endpoints.web.exposure.include</code> — Actuator.',
        ],
      },
      {
        heading: 'Placeholders, Defaults and Random Values',
        body: `Properties can reference other properties and environment variables with <code>\${...}</code>, including a default after a colon: <code>\${DB_HOST:localhost}</code>. <code>\${random.uuid}</code>, <code>\${random.int(1000,9999)}</code> generate values at startup. Keep secrets as references to environment variables, never as literal values in the file.`,
      },
      {
        heading: 'Finding Properties',
        body: `The complete list lives in the Spring Boot reference appendix "Common Application Properties". IDEs (IntelliJ, VS Code with Spring tools) auto-complete property names and show documentation. At runtime, the <code>/actuator/env</code> and <code>/actuator/configprops</code> endpoints show effective values and where each came from (expose them only in secure, non-public environments).`,
      },
    ],
    examples: [
      {
        caption: 'A realistic application.yml',
        code: `spring:
  application:
    name: webnest-shop
  profiles:
    active: \${SPRING_PROFILES_ACTIVE:dev}
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/webnest
    username: \${DB_USER:webnest}
    password: \${DB_PASSWORD}
  jpa:
    open-in-view: false
  servlet:
    multipart:
      max-file-size: 5MB

server:
  port: 8081
  servlet:
    context-path: /shop
  compression:
    enabled: true
  error:
    include-message: always
    include-stacktrace: never

logging:
  level:
    root: INFO
    com.webnest: DEBUG
    org.hibernate.SQL: DEBUG
  file:
    name: logs/webnest-shop.log

app:
  instance-id: \${random.uuid}`,
        output: `Tomcat started on port 8081 (http) with context path '/shop'
curl http://localhost:8081/shop/api/products -> 200`,
      },
      {
        caption: 'Changing the port in five different ways',
        code: `# 1. application.properties
server.port=9090

# 2. Command-line argument (highest precedence of these)
java -jar shop.jar --server.port=9091

# 3. Environment variable (containers, CI, cloud)
SERVER_PORT=9092 java -jar shop.jar          # PowerShell: $env:SERVER_PORT=9092; java -jar shop.jar

# 4. Java system property
java -Dserver.port=9093 -jar shop.jar

# 5. Programmatically
@Bean
WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> portCustomizer() {
    return factory -> factory.setPort(9094);
}

# Random free port (useful for running several instances locally)
server.port=0`,
        output: `java -jar shop.jar --server.port=9091
... Tomcat started on port 9091 (http)`,
      },
      {
        caption: 'Overriding configuration per environment without rebuilding',
        code: `# Packaged jar contains application.yml with server.port=8080

# ./config/application.yml next to the jar (overrides the packaged file)
server:
  port: 8181

# Profile file for production
# application-prod.yml
logging:
  level:
    com.webnest: INFO

# Run
java -jar shop.jar --spring.profiles.active=prod

# Inspect where a value came from (Actuator, secured environments only)
curl localhost:8181/actuator/env/server.port`,
        output: `{"property":{"source":"Config resource 'file [config/application.yml]' via location 'optional:file:./config/'","value":"8181"}}`,
      },
    ],
    commonMistakes: [
      'Mixing application.properties and application.yml with the same keys and being confused which wins (properties files take precedence at the same location).',
      'Using tabs in YAML files, which breaks parsing; YAML requires spaces.',
      'Committing passwords as literal values instead of ${ENV_VAR} references.',
      'Setting server.servlet.context-path and forgetting to include it in client URLs and health-check paths.',
      'Exposing /actuator/env publicly, revealing configuration values.',
    ],
    keyPoints: [
      'Command-line args > environment variables > profile files > application files; outside the jar beats inside.',
      'Relaxed binding maps SERVER_PORT to server.port, so environment variables configure containers easily.',
      'server.port, context-path, spring.application.name, logging.level and datasource settings are the everyday properties.',
      'Use ${VAR:default} placeholders and keep secrets in the environment.',
      'Find properties in the reference appendix, IDE auto-completion and /actuator/env.',
    ],
  },

  'multi-module-projects': {
    title: 'Multi-Module Spring Boot Projects',
    intro: `As an application grows, one giant module becomes hard to navigate and slow to build, and it is too easy for the web layer to reach straight into database code. Splitting a project into <strong>modules</strong> — for example <code>domain</code>, <code>persistence</code>, <code>web</code> and <code>app</code> — enforces boundaries at compile time, lets teams own separate parts, and allows shared libraries between several applications.

This lesson builds a multi-module Maven project (with the Gradle equivalent): a parent POM, library modules, a runnable Spring Boot module, component scanning across modules, and tips for testing and building.`,
    sections: [
      {
        heading: 'When to Split into Modules',
        body: `Modules are worthwhile when you need to share code between several deployable applications (an API and a batch worker using the same domain), enforce architectural layering, or speed up builds of a large code base. For a small service, a single module organised by packages (or checked with Spring Modulith) is usually simpler.`,
      },
      {
        heading: 'Structure',
        body: `A common layout has a parent POM with <code>&lt;packaging&gt;pom&lt;/packaging&gt;</code> listing the modules, library modules packaged as ordinary jars, and one (or more) application modules that contain the <code>@SpringBootApplication</code> class and the <code>spring-boot-maven-plugin</code>. Dependencies flow in one direction: <code>app → web → service → domain</code>; lower modules never depend on higher ones.`,
      },
      {
        heading: 'Only the Application Module Is Repackaged',
        body: `The Spring Boot Maven plugin turns a jar into an executable "fat jar". Apply it only to application modules. If a library module were repackaged, other modules could no longer use its classes, because the fat-jar layout nests classes under <code>BOOT-INF/classes</code>.`,
      },
      {
        heading: 'Component Scanning Across Modules',
        body: `<code>@SpringBootApplication</code> scans its own package and sub-packages. If all modules share a root package (<code>com.webnest.shop.*</code>) and the application class sits at <code>com.webnest.shop</code>, everything is found automatically. Otherwise specify <code>scanBasePackages</code>, <code>@EnableJpaRepositories</code> and <code>@EntityScan</code> explicitly.`,
      },
    ],
    examples: [
      {
        caption: 'Project layout and parent POM',
        code: `webnest-shop/
├── pom.xml                 (parent, packaging pom)
├── shop-domain/            (entities, domain services — plain jar)
├── shop-persistence/       (Spring Data repositories — plain jar)
├── shop-web/               (controllers, DTOs — plain jar)
└── shop-app/               (@SpringBootApplication, application.yml — executable jar)

<!-- webnest-shop/pom.xml -->
<project>
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
        <relativePath/>
    </parent>
    <groupId>com.webnest</groupId>
    <artifactId>webnest-shop</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <modules>
        <module>shop-domain</module>
        <module>shop-persistence</module>
        <module>shop-web</module>
        <module>shop-app</module>
    </modules>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>com.webnest</groupId>
                <artifactId>shop-domain</artifactId>
                <version>\${project.version}</version>
            </dependency>
            <dependency>
                <groupId>com.webnest</groupId>
                <artifactId>shop-persistence</artifactId>
                <version>\${project.version}</version>
            </dependency>
            <dependency>
                <groupId>com.webnest</groupId>
                <artifactId>shop-web</artifactId>
                <version>\${project.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>`,
        output: '(Each module has its own pom.xml whose <parent> is webnest-shop.)',
      },
      {
        caption: 'Library module and application module POMs',
        code: `<!-- shop-persistence/pom.xml -->
<parent>
    <groupId>com.webnest</groupId>
    <artifactId>webnest-shop</artifactId>
    <version>1.0.0</version>
</parent>
<artifactId>shop-persistence</artifactId>
<dependencies>
    <dependency>
        <groupId>com.webnest</groupId>
        <artifactId>shop-domain</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
</dependencies>
<!-- no spring-boot-maven-plugin here -->

<!-- shop-app/pom.xml -->
<artifactId>shop-app</artifactId>
<dependencies>
    <dependency>
        <groupId>com.webnest</groupId>
        <artifactId>shop-web</artifactId>
    </dependency>
    <dependency>
        <groupId>com.webnest</groupId>
        <artifactId>shop-persistence</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>

// shop-app/src/main/java/com/webnest/shop/ShopApplication.java
package com.webnest.shop;   // root package shared by all modules -> scanning finds everything

@SpringBootApplication
public class ShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}`,
        output: `mvn -q clean package
[INFO] webnest-shop ....................... SUCCESS
[INFO] shop-domain ........................ SUCCESS
[INFO] shop-persistence ................... SUCCESS
[INFO] shop-web ........................... SUCCESS
[INFO] shop-app ........................... SUCCESS

java -jar shop-app/target/shop-app-1.0.0.jar
... Started ShopApplication in 3.1 seconds`,
      },
      {
        caption: 'Useful build commands and the Gradle equivalent',
        code: `# Build only the app module and the modules it needs
mvn -pl shop-app -am package

# Run the app module
mvn -pl shop-app spring-boot:run

// settings.gradle.kts
rootProject.name = "webnest-shop"
include("shop-domain", "shop-persistence", "shop-web", "shop-app")

// shop-app/build.gradle.kts
plugins {
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    java
}
dependencies {
    implementation(project(":shop-web"))
    implementation(project(":shop-persistence"))
}

./gradlew :shop-app:bootRun`,
        output: `> Task :shop-app:bootRun
... Started ShopApplication in 2.9 seconds`,
      },
    ],
    commonMistakes: [
      'Applying spring-boot-maven-plugin to library modules, making their classes unusable by other modules.',
      'Creating circular dependencies between modules (web depends on persistence and persistence on web).',
      'Using different root packages per module and then wondering why beans, entities or repositories are not found.',
      'Splitting a small application into many modules too early, adding build complexity without benefit.',
      'Putting application.yml in a library module instead of the application module.',
    ],
    keyPoints: [
      'A parent POM with packaging pom lists modules and manages internal versions.',
      'Library modules are plain jars; only application modules use spring-boot-maven-plugin.',
      'Dependencies point one way: app → web → service/persistence → domain.',
      'Use a shared root package, or configure scanBasePackages, @EntityScan and @EnableJpaRepositories.',
      'Build selectively with mvn -pl <module> -am or Gradle project paths.',
    ],
  },

  'packaging-and-deployment-jar-war-and-external-tomcat': {
    title: 'Packaging and Deployment: JAR, WAR and External Tomcat',
    intro: `Once your application works, you need to run it somewhere else: a server, a container platform, or a company's existing Tomcat installation. Spring Boot supports several ways to package and run an application, and choosing the right one affects startup, operations and upgrades.

This lesson covers every way to run a Spring Boot app during development, building an executable JAR and what is inside it, layered jars and CDS for faster startup, building a WAR for an external servlet container, deploying to external Tomcat 11, running as a Linux service, and the Spring Boot CLI.`,
    sections: [
      {
        heading: 'Ways to Run During Development',
        body: `You can run the <code>main</code> method from your IDE; use <code>mvn spring-boot:run</code> or <code>./gradlew bootRun</code>; run the test-classpath variant with <code>spring-boot:test-run</code> (Testcontainers); or build and run the jar with <code>java -jar</code>. Pass arguments with <code>-Dspring-boot.run.arguments="--server.port=9090"</code> (Maven) or <code>--args</code> (Gradle).`,
      },
      {
        heading: 'The Executable JAR',
        body: `<code>mvn package</code> produces a "fat" jar containing your classes (<code>BOOT-INF/classes</code>), all dependencies (<code>BOOT-INF/lib</code>) and a small launcher. It runs anywhere with a compatible JVM: <code>java -jar app.jar</code>. This is the default and recommended packaging — one artifact, embedded Tomcat, the same everywhere from laptop to production container.`,
      },
      {
        heading: 'Faster Startup: Extracting and CDS',
        body: `For containers and production, extract the jar with <code>java -Djarmode=tools -jar app.jar extract</code> and run the extracted form; it starts faster and enables <strong>Class Data Sharing (CDS)</strong> or Java 24+ AOT caches, which can cut startup time significantly. Layered extraction (<code>--layers</code>) also produces efficient Docker image layers, so rebuilding after a code change only uploads your classes, not all dependencies.`,
      },
      {
        heading: 'Traditional WAR Deployment',
        body: `If your organisation runs shared Tomcat servers, package a WAR: set <code>&lt;packaging&gt;war&lt;/packaging&gt;</code>, extend <code>SpringBootServletInitializer</code> so the container can start Spring, and mark <code>spring-boot-starter-tomcat</code> as <code>provided</code> so the embedded Tomcat is not bundled. Spring Boot 4 requires a Servlet 6.1 container such as <strong>Tomcat 11</strong> or Jetty 12.1. The resulting WAR is still executable with <code>java -jar</code> for local testing.`,
      },
      {
        heading: 'Running in Production',
        body: `On a Linux server, run the jar as a systemd service with restart policies, a dedicated user and environment-based configuration. On Kubernetes or cloud platforms, build a container image (see the Docker and Buildpacks lessons). In every case, externalise configuration, send logs to stdout or a central system, and use Actuator health endpoints for monitoring.`,
      },
      {
        heading: 'Spring Boot CLI',
        body: `The Spring Boot CLI (<code>spring</code> command, installed via SDKMAN or Homebrew) can generate new projects from the command line using Spring Initializr: <code>spring init --dependencies=webmvc,data-jpa my-app</code>. Older versions could also run Groovy scripts directly; that feature was removed, and the CLI is now mainly a project generator and password encoder utility.`,
      },
    ],
    examples: [
      {
        caption: 'Building and inspecting the executable jar',
        code: `mvn clean package
java -jar target/shop-1.0.0.jar --spring.profiles.active=prod

# What is inside?
jar tf target/shop-1.0.0.jar | more`,
        output: `META-INF/MANIFEST.MF            (Main-Class: org.springframework.boot.loader.launch.JarLauncher)
BOOT-INF/classes/com/webnest/shop/ShopApplication.class
BOOT-INF/classes/application.yml
BOOT-INF/lib/spring-webmvc-7.0.9.jar
BOOT-INF/lib/tomcat-embed-core-11.0.x.jar
BOOT-INF/lib/hibernate-core-7.x.jar
...`,
      },
      {
        caption: 'Extracting for faster startup with Class Data Sharing',
        code: `# 1. Extract the jar into an efficient layout
java -Djarmode=tools -jar target/shop-1.0.0.jar extract --destination app

# 2. Training run: create a CDS archive, then exit
java -XX:ArchiveClassesAtExit=app/app.jsa -Dspring.context.exit=onRefresh -jar app/shop-1.0.0.jar

# 3. Production runs use the archive
java -XX:SharedArchiveFile=app/app.jsa -jar app/shop-1.0.0.jar`,
        output: `Without CDS: Started ShopApplication in 3.42 seconds
With CDS:    Started ShopApplication in 2.05 seconds`,
      },
      {
        caption: 'Packaging a WAR for an external Tomcat 11',
        code: `<!-- pom.xml -->
<packaging>war</packaging>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-tomcat</artifactId>
        <scope>provided</scope>          <!-- the external Tomcat supplies the server -->
    </dependency>
</dependencies>

// Application class
@SpringBootApplication
public class ShopApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(ShopApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);   // still runnable with java -jar
    }
}

# Build and deploy
mvn clean package
copy target\\shop.war C:\\apache-tomcat-11.0\\webapps\\
C:\\apache-tomcat-11.0\\bin\\startup.bat`,
        output: `Tomcat log: Deploying web application archive [C:\\apache-tomcat-11.0\\webapps\\shop.war]
... Started ServletInitializer in 4.2 seconds
curl http://localhost:8080/shop/api/products -> 200 OK   (context path = WAR file name)`,
      },
      {
        caption: 'Running as a Linux systemd service',
        code: `# /etc/systemd/system/webnest-shop.service
[Unit]
Description=Webnest Shop
After=network.target

[Service]
User=webnest
WorkingDirectory=/opt/webnest-shop
EnvironmentFile=/etc/webnest-shop.env
ExecStart=/usr/bin/java -Xmx512m -jar /opt/webnest-shop/shop.jar
SuccessExitStatus=143
Restart=on-failure

[Install]
WantedBy=multi-user.target

sudo systemctl daemon-reload
sudo systemctl enable --now webnest-shop
journalctl -u webnest-shop -f`,
        output: `● webnest-shop.service - Webnest Shop
     Active: active (running) since Sun 2026-09-27 10:02:11 IST`,
      },
    ],
    commonMistakes: [
      'Deploying a Spring Boot 4 WAR to Tomcat 9 or 10 — it requires a Servlet 6.1 container such as Tomcat 11.',
      'Forgetting SpringBootServletInitializer, so the external container deploys the WAR but never starts Spring.',
      'Leaving the embedded Tomcat in compile scope for a WAR, bundling a second server into the archive.',
      'Running production with mvn spring-boot:run instead of a built artifact.',
      'Baking environment-specific configuration into the jar instead of supplying it at runtime.',
    ],
    keyPoints: [
      'Run in development with the IDE, spring-boot:run/bootRun, or java -jar.',
      'The executable fat jar with embedded Tomcat is the default, recommended packaging.',
      'Extract the jar and use CDS for faster startup and better container layers.',
      'For external servers, package a WAR with SpringBootServletInitializer and provided Tomcat; use Tomcat 11.',
      'In production run as a service or container with external configuration and health checks.',
    ],
  },

  'h2-database-and-a-complete-crud-application': {
    title: 'H2 Database and a Complete CRUD Application',
    intro: `The fastest way to learn Spring Data JPA end to end is to build a complete CRUD (Create, Read, Update, Delete) application against an in-memory <strong>H2</strong> database — no installation, no Docker, just a dependency. H2 even ships with a web console to browse your tables.

In this lesson you will build a full "Student" REST API from scratch: entity, repository, service, DTOs with validation, controller with every HTTP method, global error handling, seed data, and the H2 console — then switch the same code to a file-based H2 database and finally to PostgreSQL by changing only configuration.`,
    sections: [
      {
        heading: 'What H2 Is Good For',
        body: `H2 is a small Java SQL database that runs inside your application. In <strong>in-memory</strong> mode (<code>jdbc:h2:mem:</code>) data disappears when the application stops — perfect for learning, demos and prototypes. In <strong>file</strong> mode (<code>jdbc:h2:file:./data/app</code>) data persists on disk. H2 is not meant for production workloads, and it differs from PostgreSQL/MySQL in SQL details, so real integration tests should use your production database via Testcontainers.`,
      },
      {
        heading: 'Setup and the H2 Console',
        body: `Add <code>spring-boot-starter-data-jpa</code> and the <code>com.h2database:h2</code> runtime dependency. With no <code>spring.datasource.url</code>, Spring Boot creates an in-memory database with a generated name (printed at startup); set <code>spring.datasource.url=jdbc:h2:mem:studentsdb</code> for a fixed name. Enable the browser console with <code>spring.h2.console.enabled=true</code> and open <code>/h2-console</code>. In Spring Boot 4 the console auto-configuration lives in its own module — add <code>spring-boot-h2console</code> if the console does not appear. If Spring Security is present, permit <code>/h2-console/**</code> and allow frames from the same origin for that path, in development only.`,
      },
      {
        heading: 'Seeding Data',
        body: `For embedded databases Spring Boot runs <code>schema.sql</code> and <code>data.sql</code> from the classpath automatically. When Hibernate generates the schema (<code>ddl-auto=create-drop</code>), set <code>spring.jpa.defer-datasource-initialization=true</code> so <code>data.sql</code> runs after the tables exist. A <code>CommandLineRunner</code> that saves entities through the repository is an alternative that stays database-independent.`,
      },
      {
        heading: 'CRUD Endpoint Design',
        body: `A conventional REST mapping: <code>GET /api/students</code> (list, paginated), <code>GET /api/students/{id}</code> (one, 404 if missing), <code>POST /api/students</code> (create, 201 + Location), <code>PUT /api/students/{id}</code> (replace), <code>PATCH /api/students/{id}</code> (partial update), and <code>DELETE /api/students/{id}</code> (204). Keep entities internal and use request/response DTOs.`,
      },
    ],
    examples: [
      {
        caption: 'Dependencies and configuration',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webmvc</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>

# application.properties
spring.datasource.url=jdbc:h2:mem:studentsdb
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.defer-datasource-initialization=true
spring.h2.console.enabled=true`,
        output: `H2 console available at '/h2-console'. Database available at 'jdbc:h2:mem:studentsdb'
Hibernate: create table student (id bigint generated by default as identity, course varchar(255), email varchar(255) not null unique, name varchar(255) not null, primary key (id))`,
      },
      {
        caption: 'Entity, repository, DTOs and seed data',
        code: `@Entity
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false, unique = true)
    private String email;
    private String course;

    protected Student() {}
    public Student(String name, String email, String course) {
        this.name = name; this.email = email; this.course = course;
    }
    // getters and setters
}

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByEmailIgnoreCase(String email);
    Page<Student> findByCourseIgnoreCase(String course, Pageable pageable);
}

public record StudentRequest(@NotBlank String name, @Email @NotBlank String email, String course) {}
public record StudentResponse(Long id, String name, String email, String course) {
    static StudentResponse from(Student s) {
        return new StudentResponse(s.getId(), s.getName(), s.getEmail(), s.getCourse());
    }
}

-- src/main/resources/data.sql
insert into student (name, email, course) values ('Asha Rao', 'asha@webnest.in', 'Spring Boot');
insert into student (name, email, course) values ('Ravi Kumar', 'ravi@webnest.in', 'Java Core');`,
        output: `Hibernate: insert ... (2 rows from data.sql)`,
      },
      {
        caption: 'Service and controller with every CRUD operation',
        code: `@Service
@Transactional
public class StudentService {

    private final StudentRepository repo;

    public StudentService(StudentRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public Page<StudentResponse> list(String course, Pageable pageable) {
        Page<Student> page = course == null ? repo.findAll(pageable) : repo.findByCourseIgnoreCase(course, pageable);
        return page.map(StudentResponse::from);
    }

    @Transactional(readOnly = true)
    public StudentResponse get(Long id) {
        return StudentResponse.from(find(id));
    }

    public StudentResponse create(StudentRequest req) {
        if (repo.existsByEmailIgnoreCase(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        return StudentResponse.from(repo.save(new Student(req.name(), req.email(), req.course())));
    }

    public StudentResponse replace(Long id, StudentRequest req) {
        Student s = find(id);
        s.setName(req.name());
        s.setEmail(req.email());
        s.setCourse(req.course());
        return StudentResponse.from(s);          // dirty checking saves on commit
    }

    public StudentResponse changeCourse(Long id, String course) {
        Student s = find(id);
        s.setCourse(course);
        return StudentResponse.from(s);
    }

    public void delete(Long id) {
        repo.delete(find(id));
    }

    private Student find(Long id) {
        return repo.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Student " + id + " not found"));
    }
}

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @GetMapping
    public Page<StudentResponse> list(@RequestParam(required = false) String course,
                                      @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return service.list(course, pageable);
    }

    @GetMapping("/{id}")
    public StudentResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest req) {
        StudentResponse created = service.create(req);
        return ResponseEntity.created(URI.create("/api/students/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public StudentResponse replace(@PathVariable Long id, @Valid @RequestBody StudentRequest req) {
        return service.replace(id, req);
    }

    @PatchMapping("/{id}/course")
    public StudentResponse changeCourse(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.changeCourse(id, body.get("course"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}`,
        output: `GET    /api/students                  -> 200 {"content":[{"id":1,"name":"Asha Rao",...},{"id":2,"name":"Ravi Kumar",...}],"page":{"size":20,"number":0,"totalElements":2,"totalPages":1}}
POST   /api/students {"name":"Meera","email":"meera@webnest.in","course":"SQL"} -> 201, Location: /api/students/3
POST   /api/students (same email)     -> 409 {"detail":"Email already exists"}
GET    /api/students/99               -> 404 {"detail":"Student 99 not found"}
PUT    /api/students/3 {...}          -> 200 updated student
PATCH  /api/students/3/course {"course":"PostgreSQL"} -> 200
DELETE /api/students/3                -> 204 No Content`,
      },
      {
        caption: 'H2 console, file mode, and switching to PostgreSQL',
        code: `# Browse data: http://localhost:8080/h2-console
#   JDBC URL: jdbc:h2:mem:studentsdb   User: sa   Password: (empty)
#   SELECT * FROM STUDENT;

# Keep data between restarts: file mode
spring.datasource.url=jdbc:h2:file:./data/studentsdb
spring.jpa.hibernate.ddl-auto=update

# Production: same code, different configuration only
# (replace the h2 dependency with org.postgresql:postgresql)
spring.datasource.url=jdbc:postgresql://localhost:5432/students
spring.datasource.username=webnest
spring.datasource.password=\${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.h2.console.enabled=false`,
        output: `H2 console query result:
ID | NAME       | EMAIL            | COURSE
1  | Asha Rao   | asha@webnest.in  | Spring Boot
2  | Ravi Kumar | ravi@webnest.in  | Java Core`,
      },
    ],
    commonMistakes: [
      'data.sql running before Hibernate creates tables; set spring.jpa.defer-datasource-initialization=true.',
      'Enabling the H2 console in production or on a publicly reachable server.',
      'Relying on H2 tests to prove PostgreSQL/MySQL-specific SQL works.',
      'Using a random generated in-memory database name and then being unable to connect from the console; set spring.datasource.url.',
      'Returning entities directly from CRUD controllers instead of DTOs.',
    ],
    keyPoints: [
      'H2 runs in-process in memory or file mode — ideal for learning and prototypes.',
      'spring.h2.console.enabled=true exposes a browser console at /h2-console (development only).',
      'data.sql seeds embedded databases; defer initialization when Hibernate creates the schema.',
      'A complete CRUD API maps GET, POST, PUT, PATCH and DELETE with proper status codes.',
      'The same JPA code runs on PostgreSQL by changing the driver and datasource properties.',
    ],
  },
}
