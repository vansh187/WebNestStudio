// Spring Boot course — microservices with Spring Cloud 2025.1 "Oakwood"
// (Spring Boot 4). Keys are slugs matching topics in the Spring Cloud module
// of codelabDefaults.js.
export const springBootCloud = {
  'microservices-architecture-with-spring-boot': {
    title: 'Microservices Architecture with Spring Boot',
    intro: `Microservices split an application into small, independently deployable services, each owning one business capability and its own data — catalogue, orders, payments, notifications. Done well, teams deploy independently, services scale separately, and failures stay contained. Done badly, you get a "distributed monolith": all the complexity of a network with none of the independence.

Spring Boot is the most widely used framework for Java microservices, and Spring Cloud adds the distributed-systems building blocks. This lesson explains when microservices are (and are not) the right choice, how to find service boundaries, how services communicate, how data is split, and which Spring Cloud components solve which problems — setting up the rest of this module.`,
    sections: [
      {
        heading: 'Monolith, Modular Monolith or Microservices?',
        body: `Most new products should start as a <strong>well-structured monolith</strong> — one deployable with clear internal modules (Spring Modulith helps enforce them). Microservices pay off when several teams need to deploy independently, parts of the system have very different scaling or reliability needs, or the codebase has become too large for one team. They add network latency, partial failures, distributed data consistency, and much more operational work: CI/CD, monitoring, tracing and on-call for every service.`,
      },
      {
        heading: 'Finding Service Boundaries',
        body: `Use Domain-Driven Design's <strong>bounded contexts</strong>: areas of the business with their own language and rules, such as Catalogue, Ordering, Payments, Learning Progress. A good service boundary means most changes touch one service, each service owns its data exclusively (no shared database tables), and services communicate through well-defined APIs or events. If two services always change and deploy together, they probably belong together.`,
      },
      {
        heading: 'Communication Styles',
        body: `<strong>Synchronous</strong> calls (REST with HTTP service clients, gRPC) are simple and give immediate answers, but couple availability: if Payments is down, checkout fails. <strong>Asynchronous</strong> messaging (Kafka, RabbitMQ) decouples services in time: Ordering publishes <code>OrderPlaced</code> and Notifications reacts whenever it can. Mature systems use both: synchronous queries where an immediate answer is required, events for everything else.`,
      },
      {
        heading: 'Microservices vs SOA',
        body: `Service-Oriented Architecture (SOA) came first and also splits a system into services. Classic SOA usually routes calls through a central Enterprise Service Bus (ESB), which transforms and orchestrates messages between fairly large services, and those services often share one database. Microservices move that logic out of the middle: services are smaller, each owns its own database, and they talk over plain HTTP or a message broker with no central bus. The short version is "smart endpoints, dumb pipes". In SOA much of the logic lives in the bus, while with microservices it lives in the services.`,
      },
      {
        heading: 'The Spring Cloud Toolbox',
        body: `Spring Cloud 2025.1 ("Oakwood", for Spring Boot 4) provides:`,
        list: [
          '<strong>Spring Cloud Config</strong> — centralised, versioned configuration for all services.',
          '<strong>Spring Cloud Netflix Eureka</strong> and <strong>LoadBalancer</strong> — service registry and client-side load balancing (on Kubernetes, the platform often provides this instead).',
          '<strong>Spring Cloud Gateway</strong> — the API gateway: routing, security, rate limiting at the edge.',
          '<strong>Spring Cloud Circuit Breaker</strong> — Resilience4j integration for fault tolerance.',
          '<strong>Spring Cloud Stream</strong> — portable event-driven messaging over Kafka and RabbitMQ.',
          '<strong>Spring Cloud Kubernetes</strong>, <strong>Vault</strong>, <strong>Contract</strong>, <strong>Function</strong> — platform integration, secrets, consumer-driven contract tests, serverless functions.',
          'Observability (Micrometer + OpenTelemetry) and security (OAuth2 resource servers) come from Spring Boot and Spring Security.',
        ],
      },
    ],
    examples: [
      {
        caption: 'An example system and its services',
        code: `                ┌──────────────────────┐
  Browser/App → │  api-gateway (8080)  │  Spring Cloud Gateway, JWT validation, rate limits
                └──────────┬───────────┘
          ┌────────────────┼──────────────────────┐
          ▼                ▼                      ▼
  catalog-service    order-service ──HTTP──▶ payment-service
  (PostgreSQL)       (PostgreSQL)            (PostgreSQL)
                          │ OrderPlaced / PaymentCompleted events (Kafka)
                          ▼
                 notification-service (email, push)

  Supporting: config-server (8888), discovery-server/Eureka (8761),
              auth-server (Spring Authorization Server), Prometheus, Grafana, Jaeger`,
        output: '(Each service is its own Spring Boot application, repository/module, database and deployment.)',
      },
      {
        caption: 'Importing the Spring Cloud BOM',
        code: `<properties>
    <spring-cloud.version>2025.1.2</spring-cloud.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>\${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>`,
        output: '(Spring Cloud 2025.1.x is the release train compatible with Spring Boot 4.0/4.1. Always check the compatibility table before upgrading either.)',
      },
      {
        caption: 'A synchronous call between services with an HTTP service client',
        code: `// order-service calling payment-service
@HttpExchange("/api/payments")
public interface PaymentClient {
    @PostExchange
    PaymentResult charge(@RequestBody ChargeRequest request);
}

@SpringBootApplication
@ImportHttpServices(group = "payments", types = PaymentClient.class)
public class OrderServiceApplication { ... }

# application.yml (service name resolved by the load balancer / Kubernetes DNS)
spring:
  http:
    serviceclient:
      payments:
        base-url: http://payment-service
        read-timeout: 3s`,
        output: `POST http://payment-service/api/payments -> 201 {"paymentId":"pay_91x","status":"CAPTURED"}`,
      },
    ],
    commonMistakes: [
      'Starting a new product with a dozen microservices before the domain is understood.',
      'Sharing one database between services, coupling them through tables and schemas.',
      'Building long synchronous call chains (A → B → C → D), where one slow service stalls everything.',
      'Splitting by technical layer ("user-controller-service", "user-db-service") instead of business capability.',
      'Adopting microservices without automated CI/CD, centralised logging, tracing and monitoring.',
    ],
    keyPoints: [
      'Microservices trade simplicity for independent deployment and scaling; start with a modular monolith unless you need them.',
      'Draw boundaries around business capabilities (bounded contexts); each service owns its data.',
      'Use synchronous calls where an immediate answer is needed and events for everything else.',
      'Spring Cloud 2025.1 (Oakwood) provides config, discovery, gateway, circuit breakers and streaming for Spring Boot 4.',
      'Observability and automation are prerequisites, not extras.',
    ],
  },

  'centralized-configuration-with-spring-cloud-config': {
    title: 'Centralized Configuration with Spring Cloud Config',
    intro: `With ten services in three environments, you have thirty sets of configuration. Changing a shared setting — a feature flag, a timeout, a third-party URL — should not require editing and redeploying every service. <strong>Spring Cloud Config</strong> provides a central configuration server backed by a Git repository (or Vault, a database, or the file system): every service fetches its configuration from it at startup, and changes are versioned and reviewable like code.

This lesson builds a Config Server, organises configuration per application and profile, connects client services with <code>spring.config.import</code>, encrypts secrets, and refreshes configuration without restarting.`,
    sections: [
      {
        heading: 'How It Works',
        body: `The Config Server is a Spring Boot application with <code>@EnableConfigServer</code>. It serves properties over HTTP at <code>/{application}/{profile}/{label}</code>, reading files from a Git repository: <code>application.yml</code> (shared by all services), <code>order-service.yml</code> (one service), <code>order-service-prod.yml</code> (one service in one profile). The <code>label</code> is a Git branch or tag, so you can pin configuration versions.`,
      },
      {
        heading: 'Connecting Clients',
        body: `Client services add <code>spring-cloud-starter-config</code> and a single line: <code>spring.config.import=optional:configserver:http://config-server:8888</code>. The service's <code>spring.application.name</code> and active profiles determine which files it receives. Remote properties take precedence over the service's local <code>application.yml</code>. Use <code>spring.cloud.config.fail-fast=true</code> with retry in production so services do not start with missing configuration.`,
      },
      {
        heading: 'Secrets',
        body: `Never store plain-text secrets in the Git repository. Options: encrypt values with the Config Server's <code>/encrypt</code> endpoint and store <code>{cipher}...</code> strings (decrypted when served); use the Vault backend; or keep secrets entirely out of Config and inject them from the platform (Kubernetes Secrets, a cloud secret manager). Secure the Config Server itself with authentication and network restrictions.`,
      },
      {
        heading: 'Refreshing Configuration at Runtime',
        body: `Beans annotated with <code>@RefreshScope</code> — and all <code>@ConfigurationProperties</code> beans — are rebuilt when a refresh happens. Trigger it per instance with <code>POST /actuator/refresh</code>, or for all instances at once with Spring Cloud Bus (over Kafka or RabbitMQ) and a Git webhook. Reserve runtime refresh for values that are safe to change live, such as feature flags and limits.`,
      },
      {
        heading: 'On Kubernetes',
        body: `If you deploy on Kubernetes, ConfigMaps and Secrets (optionally via Spring Cloud Kubernetes) may make a separate Config Server unnecessary. Config Server remains attractive for Git-reviewed configuration shared across many services and environments, especially outside Kubernetes.`,
      },
    ],
    examples: [
      {
        caption: 'The Config Server',
        code: `<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
</dependency>

@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}

# application.yml
server:
  port: 8888
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/webnest/shop-config
          default-label: main
          search-paths: '{application}'
          username: \${CONFIG_GIT_USER}
          password: \${CONFIG_GIT_TOKEN}`,
        output: `Started ConfigServerApplication on port 8888

curl http://localhost:8888/order-service/prod
{"name":"order-service","profiles":["prod"],"label":"main","version":"a41f9c2...",
 "propertySources":[
   {"name":"https://github.com/webnest/shop-config/order-service/order-service-prod.yml","source":{"orders.max-items":"50"}},
   {"name":".../order-service/order-service.yml","source":{"orders.max-items":"20","orders.currency":"INR"}},
   {"name":".../application.yml","source":{"management.endpoints.web.exposure.include":"health,prometheus"}}]}`,
      },
      {
        caption: 'Configuration repository layout',
        code: `shop-config/  (Git repository)
├── application.yml                      # shared by every service
├── order-service/
│   ├── order-service.yml                # all profiles
│   └── order-service-prod.yml           # prod overrides
└── payment-service/
    └── payment-service.yml

# order-service/order-service.yml
orders:
  max-items: 20
  currency: INR
features:
  new-checkout: false

# order-service/order-service-prod.yml
orders:
  max-items: 50
payments:
  api-key: '{cipher}AQA3n2k...9fZ'       # encrypted with the server's key`,
        output: '(Every change is a Git commit with author, review and history.)',
      },
      {
        caption: 'A client service with refreshable properties',
        code: `<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>

# order-service application.yml
spring:
  application:
    name: order-service
  config:
    import: optional:configserver:http://localhost:8888
  cloud:
    config:
      fail-fast: true
management:
  endpoints:
    web:
      exposure:
        include: health, refresh

@ConfigurationProperties(prefix = "features")
public record FeatureFlags(boolean newCheckout) {}

@RestController
public class CheckoutController {
    private final FeatureFlags flags;
    public CheckoutController(FeatureFlags flags) { this.flags = flags; }

    @GetMapping("/api/checkout/version")
    public String version() {
        return flags.newCheckout() ? "new checkout" : "classic checkout";
    }
}`,
        output: `GET /api/checkout/version -> classic checkout
(commit features.new-checkout: true to the config repo)
POST /actuator/refresh    -> ["features.new-checkout"]
GET /api/checkout/version -> new checkout      (no restart)`,
      },
    ],
    commonMistakes: [
      'Committing plain-text passwords to the configuration repository.',
      'Leaving the Config Server open without authentication on the network.',
      'Not enabling fail-fast, so services start with default values when the Config Server is unreachable.',
      'Refreshing configuration that is not safe to change at runtime (datasource URLs, thread pools).',
      'Duplicating the same property in many service files instead of the shared application.yml.',
    ],
    keyPoints: [
      '@EnableConfigServer serves versioned configuration from Git per application, profile and label.',
      'Clients connect with spring.config.import=configserver:... and spring.application.name.',
      'Encrypt secrets ({cipher}) or keep them in Vault/platform secrets.',
      '@RefreshScope and @ConfigurationProperties beans update on /actuator/refresh or via Spring Cloud Bus.',
      'On Kubernetes, ConfigMaps/Secrets may replace a separate Config Server.',
    ],
  },

  'service-discovery-with-eureka-and-load-balancing': {
    title: 'Service Discovery with Eureka and Load Balancing',
    intro: `In a dynamic environment, service instances come and go: autoscaling adds three more order-service instances, a deployment replaces them all, a crashed instance disappears. Hard-coding host names and ports does not work. <strong>Service discovery</strong> lets services register themselves in a registry and look each other up by name, and <strong>client-side load balancing</strong> spreads calls across the healthy instances.

This lesson sets up a Eureka server, registers services as Eureka clients, calls services by name with a <code>@LoadBalanced</code> RestClient and HTTP service clients, and explains when Kubernetes DNS makes Eureka unnecessary.`,
    sections: [
      {
        heading: 'How Eureka Works',
        body: `The Eureka server keeps a registry of instances. Each client registers on startup with its application name, host, port and health URL, sends a heartbeat every 30 seconds, and fetches a cached copy of the registry. If heartbeats stop, the instance is evicted. Because clients cache the registry, they can keep calling each other even if the Eureka server is briefly unavailable. For high availability, run several Eureka servers that replicate to each other.`,
      },
      {
        heading: 'Client-Side Load Balancing',
        body: `Spring Cloud LoadBalancer resolves a logical URL like <code>http://payment-service</code> to one of the registered instances, using round-robin by default (random and custom strategies are available). Mark a <code>RestClient.Builder</code> or <code>WebClient.Builder</code> bean with <code>@LoadBalanced</code>, and HTTP service clients built from it inherit the behaviour. Combine with retries and circuit breakers for resilience.`,
      },
      {
        heading: 'Eureka or Kubernetes?',
        body: `Kubernetes already provides discovery (a Service gives stable DNS: <code>payment-service.default.svc.cluster.local</code>) and load balancing, and its readiness probes remove unhealthy pods. On Kubernetes you usually do <strong>not</strong> need Eureka. Eureka remains useful on VMs, bare metal, or mixed environments without a platform registry.`,
      },
    ],
    examples: [
      {
        caption: 'The Eureka server',
        code: `<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>

@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}

# application.yml
server:
  port: 8761
eureka:
  client:
    register-with-eureka: false      # the server does not register with itself
    fetch-registry: false`,
        output: `Started DiscoveryServerApplication on port 8761
Dashboard: http://localhost:8761`,
      },
      {
        caption: 'Registering services as Eureka clients',
        code: `<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

# payment-service application.yml
spring:
  application:
    name: payment-service
server:
  port: 0                              # random port: run as many instances as you like
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
  instance:
    prefer-ip-address: true
    instance-id: \${spring.application.name}:\${random.value}`,
        output: `DiscoveryClient_PAYMENT-SERVICE/payment-service:3f9a... - registration status: 204

Eureka dashboard -> Instances currently registered:
PAYMENT-SERVICE   UP (3)   payment-service:3f9a..., payment-service:81c2..., payment-service:d07e...
ORDER-SERVICE     UP (2)`,
      },
      {
        caption: 'Calling a service by name with a load-balanced RestClient',
        code: `@Configuration
public class LoadBalancedClients {

    @Bean
    @LoadBalanced
    RestClient.Builder loadBalancedRestClientBuilder() {
        return RestClient.builder();
    }
}

@Service
public class PaymentGatewayClient {

    private final RestClient client;

    public PaymentGatewayClient(@LoadBalanced RestClient.Builder builder) {
        this.client = builder.baseUrl("http://payment-service").build();   // logical name, no host/port
    }

    public PaymentResult charge(ChargeRequest req) {
        return client.post().uri("/api/payments").body(req).retrieve().body(PaymentResult.class);
    }
}`,
        output: `charge #1 -> payment-service instance 10.0.0.12:53120
charge #2 -> payment-service instance 10.0.0.14:49811
charge #3 -> payment-service instance 10.0.0.17:50277   (round-robin)`,
      },
    ],
    commonMistakes: [
      'Running Eureka on Kubernetes when Services and DNS already provide discovery and load balancing.',
      'Running a single Eureka server in production, a single point of failure for new registrations.',
      'Forgetting @LoadBalanced, so http://payment-service fails with UnknownHostException.',
      'Using fixed ports for multiple instances on the same host instead of server.port=0.',
      'Expecting instant removal of crashed instances; eviction takes time, so combine with retries and circuit breakers.',
    ],
    keyPoints: [
      'Eureka server (@EnableEurekaServer) keeps a registry; clients register and heartbeat.',
      'spring-cloud-starter-netflix-eureka-client registers a service under spring.application.name.',
      '@LoadBalanced RestClient/WebClient builders resolve logical service names to instances.',
      'Spring Cloud LoadBalancer uses round-robin by default.',
      'On Kubernetes, platform Services usually replace Eureka.',
    ],
  },

  'api-gateway-with-spring-cloud-gateway': {
    title: 'API Gateway with Spring Cloud Gateway',
    intro: `Clients should not need to know that your system consists of fifteen services on different hosts. An <strong>API gateway</strong> gives them one entry point: it routes each request to the right service and handles cross-cutting concerns at the edge — authentication, rate limiting, CORS, request/response rewriting, retries and circuit breaking.

Spring Cloud Gateway is Spring's API gateway, available in a reactive (WebFlux, Netty) variant and a servlet (Spring MVC) variant. This lesson builds a WebFlux-based gateway with routes, predicates and filters, JWT validation at the edge, Redis-backed rate limiting, circuit breakers with fallbacks, and discovery-based routing.`,
    sections: [
      {
        heading: 'Routes, Predicates and Filters',
        body: `A <strong>route</strong> has an id, a destination <code>uri</code>, <strong>predicates</strong> that decide whether a request matches (<code>Path</code>, <code>Method</code>, <code>Host</code>, <code>Header</code>, <code>Query</code>, <code>Weight</code> for canary releases), and <strong>filters</strong> that modify the request or response (<code>StripPrefix</code>, <code>RewritePath</code>, <code>AddRequestHeader</code>, <code>RequestRateLimiter</code>, <code>CircuitBreaker</code>, <code>Retry</code>). Routes are defined in YAML under <code>spring.cloud.gateway.server.webflux.routes</code> or in Java with <code>RouteLocatorBuilder</code>.`,
      },
      {
        heading: 'Choosing a Variant',
        body: `<code>spring-cloud-starter-gateway-server-webflux</code> runs on Netty and handles very high concurrency with few threads — the classic choice. <code>spring-cloud-starter-gateway-server-webmvc</code> runs on the servlet stack, which suits teams that prefer blocking code (especially with virtual threads). The concepts are the same; the configuration prefixes differ (<code>...server.webflux...</code> vs <code>...server.webmvc...</code>).`,
      },
      {
        heading: 'Security at the Edge',
        body: `Configure the gateway as an OAuth2 resource server to reject requests without a valid JWT before they reach any service, and relay the token downstream (<code>TokenRelay</code> filter when the gateway is also the OAuth2 client for a browser app). Downstream services should still validate tokens themselves — "defence in depth" — rather than trusting anything that comes from inside the network.`,
      },
      {
        heading: 'Rate Limiting and Resilience',
        body: `The <code>RequestRateLimiter</code> filter with the Redis rate limiter implements a token bucket per key (user, API key or IP) that works across multiple gateway instances. The <code>CircuitBreaker</code> filter (Resilience4j) returns a fallback when a service is failing, and the <code>Retry</code> filter retries idempotent requests on transient errors.`,
      },
    ],
    examples: [
      {
        caption: 'Gateway routes in YAML',
        code: `<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway-server-webflux</artifactId>
</dependency>

# application.yml
server:
  port: 8080
spring:
  cloud:
    gateway:
      server:
        webflux:
          routes:
            - id: catalog
              uri: http://catalog-service:8081
              predicates:
                - Path=/api/catalog/**
              filters:
                - RewritePath=/api/catalog/(?<rest>.*), /api/products/\${rest}
            - id: orders
              uri: http://order-service:8082
              predicates:
                - Path=/api/orders/**
                - Method=GET,POST
              filters:
                - AddRequestHeader=X-Gateway, webnest
            - id: new-checkout-canary
              uri: http://checkout-v2:8090
              predicates:
                - Path=/api/checkout/**
                - Weight=checkout, 10          # 10% of traffic to v2
            - id: checkout-stable
              uri: http://checkout-v1:8089
              predicates:
                - Path=/api/checkout/**
                - Weight=checkout, 90`,
        output: `GET http://gateway:8080/api/catalog/42    -> forwarded to http://catalog-service:8081/api/products/42
POST http://gateway:8080/api/orders       -> forwarded to order-service with header X-Gateway: webnest
/api/checkout/**                          -> ~90% to checkout-v1, ~10% to checkout-v2`,
      },
      {
        caption: 'JWT validation, rate limiting and circuit breaking',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security-oauth2-resource-server</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-reactor-resilience4j</artifactId>
</dependency>

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurity {

    @Bean
    SecurityWebFilterChain security(ServerHttpSecurity http) {
        return http
            .authorizeExchange(ex -> ex
                .pathMatchers("/api/catalog/**").permitAll()
                .anyExchange().authenticated())
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .build();
    }

    // rate-limit per authenticated user
    @Bean
    KeyResolver userKeyResolver() {
        return exchange -> exchange.getPrincipal().map(Principal::getName).defaultIfEmpty("anonymous");
    }
}

# application.yml (route filters)
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://auth-server:9000
  cloud:
    gateway:
      server:
        webflux:
          routes:
            - id: orders
              uri: http://order-service:8082
              predicates:
                - Path=/api/orders/**
              filters:
                - name: RequestRateLimiter
                  args:
                    redis-rate-limiter.replenishRate: 10     # tokens per second
                    redis-rate-limiter.burstCapacity: 20
                    key-resolver: "#{@userKeyResolver}"
                - name: CircuitBreaker
                  args:
                    name: orders
                    fallbackUri: forward:/fallback/orders

@RestController
class FallbackController {
    @GetMapping("/fallback/orders")
    Mono<ResponseEntity<Map<String, String>>> ordersDown() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(Map.of("message", "Orders are temporarily unavailable. Please try again shortly.")));
    }
}`,
        output: `GET /api/orders (no token)                -> 401 Unauthorized (rejected at the gateway)
GET /api/orders (valid JWT, 25 req/s)     -> first 20 OK, then 429 Too Many Requests
GET /api/orders (order-service down)      -> 503 {"message":"Orders are temporarily unavailable. Please try again shortly."}`,
      },
      {
        caption: 'Routes in Java and discovery-based URIs',
        code: `@Bean
RouteLocator routes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("payments", r -> r.path("/api/payments/**")
            .filters(f -> f.retry(c -> c.setRetries(2).setMethods(HttpMethod.GET)))
            .uri("lb://payment-service"))           // resolved through Eureka / LoadBalancer
        .build();
}`,
        output: `GET /api/payments/pay_91x -> lb://payment-service -> 10.0.0.12:53120 (retried on another instance if it fails)`,
      },
    ],
    commonMistakes: [
      'Using the old spring.cloud.gateway.routes prefix; current versions use spring.cloud.gateway.server.webflux.routes (or ...webmvc...).',
      'Putting business logic in the gateway, turning it into a new monolith.',
      'Validating JWTs only at the gateway and trusting all internal traffic blindly.',
      'Retrying non-idempotent POST requests at the gateway.',
      'Deploying the WebFlux gateway as a WAR or into a servlet container — it requires Netty.',
    ],
    keyPoints: [
      'Spring Cloud Gateway routes requests using predicates and modifies them with filters.',
      'Choose the WebFlux (Netty) or WebMVC variant; routes live under spring.cloud.gateway.server.<variant>.routes.',
      'Validate JWTs at the edge and again in services.',
      'RequestRateLimiter with Redis and CircuitBreaker with fallbacks protect services.',
      'lb:// URIs route through service discovery; Weight predicates enable canary releases.',
    ],
  },

  'event-driven-microservices-with-spring-cloud-stream': {
    title: 'Event-Driven Microservices with Spring Cloud Stream',
    intro: `Writing Kafka or RabbitMQ code directly ties your services to one broker's API. <strong>Spring Cloud Stream</strong> lets you write messaging logic as plain Java functions — <code>Supplier</code>, <code>Function</code> and <code>Consumer</code> beans — and binds them to broker destinations through configuration. The same code runs on Kafka, RabbitMQ, Pulsar or cloud brokers by swapping the <strong>binder</strong> dependency.

This lesson builds an order-processing flow across services with Spring Cloud Stream: producing events with <code>StreamBridge</code>, consuming and transforming them with functional beans, consumer groups and partitioning, error handling with dead-letter queues, and testing with the test binder.`,
    sections: [
      {
        heading: 'Functional Bindings',
        body: `Declare a <code>@Bean</code> of type <code>Consumer&lt;OrderPlaced&gt;</code> named <code>reserveStock</code>, and Spring Cloud Stream creates an input binding <code>reserveStock-in-0</code>. A <code>Function&lt;A, B&gt;</code> gets both <code>-in-0</code> and <code>-out-0</code> bindings — it consumes, transforms and publishes. Map bindings to topics/exchanges with <code>spring.cloud.stream.bindings.&lt;binding&gt;.destination</code>. If several functions exist, list them in <code>spring.cloud.function.definition</code>.`,
      },
      {
        heading: 'Publishing from Business Code',
        body: `To send an event from a REST controller or service method (not on a schedule), inject <code>StreamBridge</code> and call <code>streamBridge.send("orders-out-0", event)</code>. Messages are serialised as JSON by default, with a <code>contentType</code> header.`,
      },
      {
        heading: 'Consumer Groups and Partitions',
        body: `Set <code>group</code> on an input binding so that multiple instances of the same service share the work (each message is processed by one instance), while different services each receive every message. Partitioning by a key (such as order id) keeps related events in order and on the same instance.`,
      },
      {
        heading: 'Error Handling',
        body: `Failed messages are retried (<code>maxAttempts</code>, back-off settings on the consumer binding). After retries, enable a dead-letter queue (<code>enableDlq</code> on Kafka or RabbitMQ binder properties) so a poison message is parked for inspection instead of blocking the stream. As always with messaging, consumers must be idempotent.`,
      },
    ],
    examples: [
      {
        caption: 'Dependencies and bindings configuration',
        code: `<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-binder-kafka</artifactId>   <!-- or -binder-rabbit -->
</dependency>

# inventory-service application.yml
spring:
  cloud:
    function:
      definition: reserveStock
    stream:
      kafka:
        binder:
          brokers: localhost:9092
      bindings:
        reserveStock-in-0:
          destination: orders.placed
          group: inventory-service
          consumer:
            max-attempts: 3
        reserveStock-out-0:
          destination: stock.reserved`,
        output: `Created binding reserveStock-in-0 -> topic orders.placed (group inventory-service)
Created binding reserveStock-out-0 -> topic stock.reserved`,
      },
      {
        caption: 'Producing with StreamBridge and processing with a Function',
        code: `// order-service
public record OrderPlaced(String orderId, List<Line> lines) {}
public record Line(String sku, int qty) {}

@RestController
public class OrderController {

    private final StreamBridge streamBridge;

    public OrderController(StreamBridge streamBridge) {
        this.streamBridge = streamBridge;
    }

    @PostMapping("/api/orders")
    public ResponseEntity<Void> place(@RequestBody OrderPlaced order) {
        // (save the order first — ideally via an outbox)
        streamBridge.send("orders.placed", order);
        return ResponseEntity.accepted().build();
    }
}

// inventory-service: consumes OrderPlaced, emits StockReserved
public record StockReserved(String orderId, boolean success) {}

@Configuration
public class InventoryFunctions {

    @Bean
    Function<OrderPlaced, StockReserved> reserveStock(StockService stock) {
        return order -> {
            boolean ok = stock.tryReserve(order.orderId(), order.lines());   // idempotent by orderId
            return new StockReserved(order.orderId(), ok);
        };
    }
}

// notification-service
@Bean
Consumer<StockReserved> notifyCustomer(Notifier notifier) {
    return event -> notifier.stockResult(event.orderId(), event.success());
}`,
        output: `POST /api/orders {"orderId":"WN-10231","lines":[{"sku":"HD-NAVY-M","qty":1}]} -> 202 Accepted
inventory-service: reserved stock for WN-10231
notification-service: "Good news! Your order WN-10231 is confirmed."`,
      },
      {
        caption: 'Testing with the test binder',
        code: `<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-test-binder</artifactId>
    <scope>test</scope>
</dependency>

@SpringBootTest
@Import(TestChannelBinderConfiguration.class)
class ReserveStockTest {

    @Autowired InputDestination input;
    @Autowired OutputDestination output;
    @Autowired JsonMapper json;

    @Test
    void reservesStockAndPublishesResult() throws Exception {
        input.send(MessageBuilder.withPayload(
            new OrderPlaced("WN-1", List.of(new Line("HD-NAVY-M", 1)))).build(), "orders.placed");

        Message<byte[]> result = output.receive(1000, "stock.reserved");
        StockReserved event = json.readValue(result.getPayload(), StockReserved.class);
        assertThat(event.success()).isTrue();
    }
}`,
        output: `ReserveStockTest > reservesStockAndPublishesResult() PASSED (no broker needed)`,
      },
    ],
    commonMistakes: [
      'Forgetting spring.cloud.function.definition when several function beans exist, so none are bound.',
      'Omitting the consumer group, so every instance of a service processes every message.',
      'Publishing events before the database transaction commits, or without an outbox, causing inconsistencies.',
      'Non-idempotent consumers that double-process redelivered messages.',
      'Not configuring a DLQ, letting a poison message block a partition or queue.',
    ],
    keyPoints: [
      'Spring Cloud Stream binds Supplier/Function/Consumer beans to broker destinations by configuration.',
      'Binders (Kafka, RabbitMQ, ...) make messaging code broker-independent.',
      'StreamBridge sends events from business code; bindings named <function>-in-0/-out-0.',
      'Consumer groups share work across instances; partitions preserve per-key ordering.',
      'Configure retries and DLQs, keep consumers idempotent, and test with the test binder.',
    ],
  },

  'distributed-transactions-and-the-saga-pattern': {
    title: 'Distributed Transactions and the Saga Pattern',
    intro: `In a monolith, placing an order — create the order, reserve stock, charge the payment — is one database transaction: all or nothing. In microservices, each step lives in a different service with its own database, and there is no practical global transaction across them (two-phase commit is slow, fragile and rarely supported by modern infrastructure).

The <strong>Saga pattern</strong> solves this by breaking the business transaction into a sequence of local transactions, each publishing an event that triggers the next step, with <strong>compensating actions</strong> that undo earlier steps if a later one fails. This lesson explains choreography and orchestration sagas, the transactional outbox that makes them reliable, idempotency, and how to implement both styles in Spring Boot.`,
    sections: [
      {
        heading: 'Why Not Distributed Transactions?',
        body: `Two-phase commit (XA) locks resources in every participant until all agree, so one slow service blocks the others; it also requires every database and broker to support XA. Microservice architectures instead accept <strong>eventual consistency</strong>: the system may be briefly inconsistent (stock reserved, payment not yet taken) but always converges to a correct final state.`,
      },
      {
        heading: 'Choreography',
        body: `In a choreographed saga, services react to each other's events with no central coordinator: Order Service publishes <code>OrderCreated</code>; Inventory reserves stock and publishes <code>StockReserved</code>; Payment charges and publishes <code>PaymentCompleted</code> or <code>PaymentFailed</code>; on failure, Inventory releases the stock and Order marks the order cancelled. It is simple for short flows but hard to follow as steps grow.`,
      },
      {
        heading: 'Orchestration',
        body: `In an orchestrated saga, an orchestrator (often inside the Order Service) holds the saga state and tells each participant what to do next, handling failures by issuing compensating commands. The flow is explicit in one place, easier to monitor and change, at the cost of a central component. Frameworks and workflow engines (Temporal, Camunda, Axon) help for complex sagas; simple ones are fine as a state machine persisted in your database.`,
      },
      {
        heading: 'Making Sagas Reliable',
        body: `Each step must update its database <em>and</em> publish its event atomically — use the <strong>transactional outbox</strong>: write the event to an outbox table in the same local transaction, then relay it to the broker. Consumers must be <strong>idempotent</strong>, because events can be delivered more than once. Compensations must be designed up front: "refund payment", "release stock", "cancel order" — and some actions (sending an email) cannot be undone, so place them at the end.`,
      },
    ],
    examples: [
      {
        caption: 'Choreography: event flow for placing an order',
        code: `Happy path
  Order      : create order (PENDING)           ──▶ OrderCreated
  Inventory  : reserve stock                    ──▶ StockReserved
  Payment    : charge card                      ──▶ PaymentCompleted
  Order      : mark order CONFIRMED             ──▶ OrderConfirmed ──▶ Notification: email

Payment fails
  Payment    : charge declined                  ──▶ PaymentFailed
  Inventory  : release reserved stock           (compensation)
  Order      : mark order CANCELLED             (compensation) ──▶ OrderCancelled ──▶ Notification`,
        output: '(Each arrow is a local transaction plus an event; no service ever locks another service\'s data.)',
      },
      {
        caption: 'Transactional outbox: saving state and event atomically',
        code: `@Entity
@Table(name = "outbox")
public class OutboxEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    String aggregateId;
    String type;
    @Column(columnDefinition = "text") String payload;
    Instant createdAt = Instant.now();
    boolean published;
    // constructors, getters, markPublished()
}

@Service
public class OrderService {

    private final OrderRepository orders;
    private final OutboxRepository outbox;
    private final JsonMapper json;

    public OrderService(OrderRepository orders, OutboxRepository outbox, JsonMapper json) {
        this.orders = orders;
        this.outbox = outbox;
        this.json = json;
    }

    @Transactional        // order row and outbox row commit together, or not at all
    public Order create(CreateOrder cmd) {
        Order order = orders.save(Order.pending(cmd));
        outbox.save(new OutboxEvent(order.getNumber(), "OrderCreated",
            json.writeValueAsString(new OrderCreated(order.getNumber(), cmd.lines(), cmd.total()))));
        return order;
    }
}

@Component
public class OutboxRelay {

    private final OutboxRepository outbox;
    private final KafkaTemplate<String, String> kafka;

    public OutboxRelay(OutboxRepository outbox, KafkaTemplate<String, String> kafka) {
        this.outbox = outbox;
        this.kafka = kafka;
    }

    @Scheduled(fixedDelay = 500)
    @SchedulerLock(name = "outboxRelay")
    @Transactional
    public void publish() {
        for (OutboxEvent e : outbox.findTop100ByPublishedFalseOrderByIdAsc()) {
            kafka.send("orders." + e.getType(), e.getAggregateId(), e.getPayload()).join();
            e.markPublished();
        }
    }
}`,
        output: `order WN-10231 saved + outbox row (OrderCreated) in one commit
OutboxRelay: published OrderCreated for WN-10231 to orders.OrderCreated
(if Kafka is down, the row stays unpublished and is retried — no lost events)`,
      },
      {
        caption: 'Orchestration: a saga state machine in the Order Service',
        code: `public enum SagaStep { RESERVING_STOCK, CHARGING_PAYMENT, COMPLETED, COMPENSATING, CANCELLED }

@Component
public class PlaceOrderSaga {

    private final SagaRepository sagas;
    private final CommandPublisher commands;   // publishes commands via the outbox

    public PlaceOrderSaga(SagaRepository sagas, CommandPublisher commands) {
        this.sagas = sagas;
        this.commands = commands;
    }

    @Transactional
    public void start(Order order) {
        sagas.save(new SagaState(order.getNumber(), SagaStep.RESERVING_STOCK));
        commands.send("inventory.reserve", new ReserveStock(order.getNumber(), order.lines()));
    }

    @KafkaListener(topics = "inventory.replies", groupId = "order-saga")
    @Transactional
    public void onStockReply(StockReply reply) {
        SagaState saga = sagas.findById(reply.orderId()).orElseThrow();
        if (saga.getStep() != SagaStep.RESERVING_STOCK) return;            // idempotent: ignore duplicates
        if (reply.success()) {
            saga.setStep(SagaStep.CHARGING_PAYMENT);
            commands.send("payment.charge", new ChargePayment(reply.orderId(), saga.getTotal()));
        } else {
            saga.setStep(SagaStep.CANCELLED);
            commands.send("order.cancel", new CancelOrder(reply.orderId(), "Out of stock"));
        }
    }

    @KafkaListener(topics = "payment.replies", groupId = "order-saga")
    @Transactional
    public void onPaymentReply(PaymentReply reply) {
        SagaState saga = sagas.findById(reply.orderId()).orElseThrow();
        if (saga.getStep() != SagaStep.CHARGING_PAYMENT) return;
        if (reply.success()) {
            saga.setStep(SagaStep.COMPLETED);
            commands.send("order.confirm", new ConfirmOrder(reply.orderId()));
        } else {
            saga.setStep(SagaStep.COMPENSATING);
            commands.send("inventory.release", new ReleaseStock(reply.orderId()));   // compensation
            commands.send("order.cancel", new CancelOrder(reply.orderId(), "Payment declined"));
        }
    }
}`,
        output: `WN-10231: RESERVING_STOCK -> CHARGING_PAYMENT -> COMPLETED
WN-10232: RESERVING_STOCK -> CHARGING_PAYMENT -> COMPENSATING (stock released, order cancelled: Payment declined)`,
      },
    ],
    commonMistakes: [
      'Trying to use one @Transactional across service boundaries — it only covers the local database.',
      'Publishing events directly after commit without an outbox, losing events when the broker is unavailable.',
      'Forgetting compensating actions until a failure happens in production.',
      'Non-idempotent saga steps that double-charge or double-reserve on redelivery.',
      'Performing irreversible actions (emails, shipping) early in the saga before later steps can fail.',
    ],
    keyPoints: [
      'Microservices avoid global transactions; sagas coordinate a series of local transactions.',
      'Choreography uses events between services; orchestration uses a central coordinator.',
      'Every step needs a compensating action for failures after it.',
      'The transactional outbox makes "update database + publish event" reliable.',
      'All saga participants must be idempotent; place irreversible steps last.',
    ],
  },
}
