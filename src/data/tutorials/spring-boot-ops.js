// Spring Boot course — observability, resilience, performance and deployment
// lessons (Spring Boot 4). Keys are slugs matching topics in the Production
// Readiness and Deployment modules of codelabDefaults.js.
export const springBootOps = {
  'metrics-with-micrometer-and-prometheus': {
    title: 'Metrics with Micrometer and Prometheus',
    intro: `"Is the application healthy?" is not a yes/no question in production. You want to know how many requests per second it serves, how long they take at the 99th percentile, how many fail, how full the connection pool is, and how many orders were placed in the last hour. <strong>Metrics</strong> answer these questions continuously, and they drive dashboards and alerts.

Spring Boot uses <strong>Micrometer</strong>, a vendor-neutral metrics facade (think SLF4J for metrics), and exports to Prometheus, Datadog, New Relic, CloudWatch, OTLP and many others. This lesson covers built-in metrics, exposing them to Prometheus, creating custom counters, timers and gauges, the <code>@Timed</code> and <code>@Observed</code> annotations, tags and cardinality, and building Grafana dashboards and alerts.`,
    sections: [
      {
        heading: 'Built-in Metrics',
        body: `With Actuator on the classpath, Spring Boot records metrics automatically: HTTP server requests (<code>http.server.requests</code> with uri, method, status tags), HTTP client calls, JVM memory and GC, threads, CPU, HikariCP pool usage, Tomcat sessions, cache hit ratios, Spring Data repository calls, Kafka and RabbitMQ consumers, scheduled tasks, and application startup time. You get useful dashboards before writing any metric code.`,
      },
      {
        heading: 'Exporting to Prometheus',
        body: `Add <code>micrometer-registry-prometheus</code> and expose the <code>prometheus</code> Actuator endpoint. Prometheus scrapes <code>/actuator/prometheus</code> every few seconds and stores time series; Grafana visualises them. On Kubernetes, the Prometheus Operator discovers pods through annotations or ServiceMonitors. Alternatively, push metrics via OTLP to an OpenTelemetry collector.`,
      },
      {
        heading: 'Meter Types',
        body: `Micrometer offers a small set of meter types:`,
        list: [
          '<strong>Counter</strong> — a value that only increases: orders placed, emails sent, errors.',
          '<strong>Timer</strong> — count and duration of events, with percentiles and histograms: request latency, payment processing time.',
          '<strong>Gauge</strong> — a current value that goes up and down: queue size, active users, cache size.',
          '<strong>DistributionSummary</strong> — distribution of non-time values: order amounts, payload sizes.',
          '<strong>LongTaskTimer</strong> — currently running long tasks and their duration: batch jobs, report generation.',
        ],
      },
      {
        heading: 'Tags and Cardinality',
        body: `Tags (dimensions) let you slice metrics — by payment method, country, outcome. But every unique combination of tag values creates a separate time series. Never tag with unbounded values such as user id, order id, email or full URL with ids; that "cardinality explosion" can overwhelm Prometheus and your bill. Use a small, fixed set of values.`,
      },
      {
        heading: 'Observations',
        body: `Micrometer's Observation API (<code>@Observed</code> or <code>Observation.createNotStarted(...)</code>) instruments a piece of code once and produces <strong>both</strong> a timer metric and a tracing span. Spring itself uses observations for HTTP, data access and messaging, which is why metrics and traces line up in Spring Boot.`,
      },
    ],
    examples: [
      {
        caption: 'Exposing metrics to Prometheus',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>

# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health, info, prometheus
  metrics:
    tags:
      application: \${spring.application.name}     # common tag on every metric
    distribution:
      percentiles-histogram:
        http.server.requests: true                # enables p95/p99 in Prometheus`,
        output: `curl localhost:8080/actuator/prometheus | findstr http_server_requests
http_server_requests_seconds_count{application="webnest-shop",method="GET",outcome="SUCCESS",status="200",uri="/api/courses/{slug}"} 1842
http_server_requests_seconds_sum{...,uri="/api/courses/{slug}"} 41.27
hikaricp_connections_active{application="webnest-shop",pool="HikariPool-1"} 3`,
      },
      {
        caption: 'Custom counters, timers, gauges and distribution summaries',
        code: `@Service
public class CheckoutMetrics {

    private final Counter ordersPlaced;
    private final Timer paymentTimer;
    private final DistributionSummary orderAmount;
    private final MeterRegistry registry;

    public CheckoutMetrics(MeterRegistry registry, PendingOrderQueue queue) {
        this.registry = registry;
        this.ordersPlaced = Counter.builder("shop.orders.placed")
            .description("Orders successfully placed")
            .register(registry);
        this.paymentTimer = Timer.builder("shop.payment.duration")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);
        this.orderAmount = DistributionSummary.builder("shop.order.amount")
            .baseUnit("INR")
            .register(registry);
        Gauge.builder("shop.orders.pending", queue, PendingOrderQueue::size)
            .register(registry);
    }

    public void orderPlaced(BigDecimal amount, String paymentMethod) {
        ordersPlaced.increment();
        orderAmount.record(amount.doubleValue());
        // tag with a bounded set of values only
        registry.counter("shop.orders.by_method", "method", paymentMethod).increment();
    }

    public <T> T timePayment(Supplier<T> payment) {
        return paymentTimer.record(payment);
    }
}`,
        output: `shop_orders_placed_total{application="webnest-shop"} 412.0
shop_orders_by_method_total{method="upi"} 280.0
shop_orders_by_method_total{method="card"} 132.0
shop_payment_duration_seconds{quantile="0.99"} 1.84
shop_orders_pending 7.0`,
      },
      {
        caption: '@Observed for a metric and a trace span in one annotation',
        code: `@Configuration
public class ObservationConfig {
    @Bean
    ObservedAspect observedAspect(ObservationRegistry registry) {   // needs spring-boot-starter-aspectj
        return new ObservedAspect(registry);
    }
}

@Service
public class RecommendationService {

    @Observed(name = "recommendations.compute",
              contextualName = "compute-recommendations",
              lowCardinalityKeyValues = {"algorithm", "collaborative"})
    public List<Course> recommend(long studentId) {
        // ...
        return List.of();
    }
}`,
        output: `recommendations_compute_seconds_count{algorithm="collaborative",error="none"} 96
(and a span named "compute-recommendations" appears in the trace of each request)`,
      },
      {
        caption: 'Grafana queries and a Prometheus alert rule',
        code: `# p99 latency per endpoint over 5 minutes (PromQL)
histogram_quantile(0.99, sum by (le, uri) (rate(http_server_requests_seconds_bucket{application="webnest-shop"}[5m])))

# error rate
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
  / sum(rate(http_server_requests_seconds_count[5m]))

# alert.rules.yml
groups:
  - name: webnest-shop
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_server_requests_seconds_count{application="webnest-shop",status=~"5.."}[5m]))
            / sum(rate(http_server_requests_seconds_count{application="webnest-shop"}[5m])) > 0.05
        for: 10m
        labels:
          severity: page
        annotations:
          summary: "More than 5% of requests are failing"`,
        output: `Grafana panel: p99 /api/checkout = 820 ms, /api/courses/{slug} = 45 ms
Alert HighErrorRate FIRING after 10 minutes above 5%`,
      },
    ],
    commonMistakes: [
      'Tagging metrics with user ids, order ids or raw URLs, creating millions of time series.',
      'Exposing /actuator/prometheus publicly instead of on an internal port or network.',
      'Measuring only averages; latency problems show up in p95/p99 percentiles.',
      'Creating new meters on every call with different names instead of registering them once and reusing them.',
      'Collecting metrics but never defining alerts, so problems are only noticed by users.',
    ],
    keyPoints: [
      'Micrometer is the metrics facade; Spring Boot records HTTP, JVM, pool, cache and messaging metrics automatically.',
      'micrometer-registry-prometheus + the prometheus endpoint lets Prometheus scrape metrics.',
      'Use Counter, Timer, Gauge, DistributionSummary and LongTaskTimer for business metrics.',
      'Keep tag values bounded to avoid cardinality explosions.',
      '@Observed produces both metrics and tracing spans; build dashboards and alerts on top.',
    ],
  },

  'distributed-tracing-with-opentelemetry': {
    title: 'Distributed Tracing with OpenTelemetry',
    intro: `In a system of many services, one slow checkout request might pass through the gateway, the order service, the payment service, a database and Kafka. Logs from each service show fragments; metrics show that something is slow but not where. <strong>Distributed tracing</strong> follows each request across every service and shows a timeline of where the time went.

OpenTelemetry (OTel) is the industry standard for traces, metrics and logs. Spring Boot 4 provides <code>spring-boot-starter-opentelemetry</code>, which configures the OpenTelemetry SDK and Micrometer Tracing and exports over OTLP to backends such as Jaeger, Grafana Tempo, Zipkin, Honeycomb, Datadog or New Relic. This lesson covers traces and spans, setup, context propagation, trace ids in logs, custom spans, and sampling.`,
    sections: [
      {
        heading: 'Traces, Spans and Context',
        body: `A <strong>trace</strong> represents one request's whole journey and has a <strong>trace id</strong>. It consists of <strong>spans</strong> — timed operations such as "HTTP GET /api/orders", "SELECT orders" or "send to Kafka" — each with a span id, a parent, attributes and events. When a service calls another, the trace context travels in the W3C <code>traceparent</code> HTTP header (or message headers for Kafka/RabbitMQ), so the downstream spans join the same trace.`,
      },
      {
        heading: 'Setup in Spring Boot 4',
        body: `Add <code>spring-boot-starter-opentelemetry</code> and set the OTLP endpoint with <code>management.opentelemetry.tracing.export.otlp.endpoint</code>. Spring instruments incoming and outgoing HTTP (RestClient, WebClient, HTTP service clients built from Spring's builders), JDBC-level observations, Kafka, RabbitMQ and <code>@Observed</code> methods automatically. By default only 10% of requests are sampled; set <code>management.tracing.sampling.probability</code>.`,
      },
      {
        heading: 'Trace IDs in Logs',
        body: `When tracing is active, Spring Boot puts <code>traceId</code> and <code>spanId</code> into the logging MDC and includes them in log lines by default. You can jump from an error log to the full trace, or search all logs of one request across services — the single most useful debugging capability in microservices.`,
      },
      {
        heading: 'Custom Spans and Attributes',
        body: `Add detail with <code>@Observed</code>, the <code>Observation</code> API, or Micrometer's <code>Tracer</code> for manual spans. Add low-cardinality attributes (payment method, tenant tier) that help you filter traces. Never put secrets or personal data in span attributes.`,
      },
      {
        heading: 'Sampling in Production',
        body: `Recording 100% of traces is useful in development but expensive at high traffic. Common strategies: a fixed probability (e.g. 10%), or tail-based sampling in an OpenTelemetry Collector that keeps all error and slow traces and a fraction of the rest.`,
      },
    ],
    examples: [
      {
        caption: 'Dependencies, configuration and a local Jaeger',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-opentelemetry</artifactId>
</dependency>

# application.yml
spring:
  application:
    name: order-service
management:
  tracing:
    sampling:
      probability: 1.0            # 100% in development
  opentelemetry:
    tracing:
      export:
        otlp:
          endpoint: http://localhost:4318/v1/traces

# compose.yaml — Jaeger with an OTLP receiver and UI on :16686
services:
  jaeger:
    image: jaegertracing/jaeger:latest
    ports:
      - "16686:16686"
      - "4318:4318"`,
        output: `Open http://localhost:16686 -> Service: order-service -> Find Traces`,
      },
      {
        caption: 'Trace ids in logs across two services',
        code: `// order-service
@PostMapping("/api/orders")
public OrderDto place(@RequestBody PlaceOrder cmd) {
    log.info("Placing order for {}", cmd.customerEmail());
    PaymentResult payment = paymentClient.charge(cmd.total());   // HTTP service client -> payment-service
    return orders.save(cmd, payment);
}

// payment-service
@PostMapping("/api/payments")
public PaymentResult charge(@RequestBody ChargeRequest req) {
    log.info("Charging {}", req.amount());
    return gateway.charge(req);
}`,
        output: `order-service   INFO [order-service,6f1c2b9e4d3a8f7e1c2b9e4d3a8f7e1c,a1b2c3d4e5f60718] Placing order for asha@webnest.in
payment-service INFO [payment-service,6f1c2b9e4d3a8f7e1c2b9e4d3a8f7e1c,0918f7e6d5c4b3a2] Charging 2999.00
(same trace id in both services)`,
      },
      {
        caption: 'A custom span with attributes and events',
        code: `@Service
public class FraudCheckService {

    private final ObservationRegistry registry;

    public FraudCheckService(ObservationRegistry registry) {
        this.registry = registry;
    }

    public FraudScore check(Order order) {
        return Observation.createNotStarted("fraud.check", registry)
            .contextualName("fraud-check")
            .lowCardinalityKeyValue("payment.method", order.paymentMethod())
            .observe(() -> {
                FraudScore score = model.score(order);
                if (score.value() > 0.8) {
                    Span.current().addEvent("high-risk-order");   // OpenTelemetry API
                }
                return score;
            });
    }
}`,
        output: `Jaeger timeline for trace 6f1c2b9e...
POST /api/orders                       order-service     412 ms
 ├─ fraud-check                        order-service      38 ms  payment.method=card  event: high-risk-order
 ├─ POST /api/payments                 order-service →   290 ms
 │   └─ POST /api/payments             payment-service   281 ms
 │       └─ HTTP POST gateway.example  payment-service   255 ms   <- the slow part
 └─ INSERT orders                      order-service      12 ms`,
      },
    ],
    commonMistakes: [
      'Creating RestClient/WebClient instances with static create() methods instead of Spring\'s builders, so trace context is not propagated.',
      'Sampling 100% of production traffic and overwhelming the tracing backend and budget.',
      'Recording personal data, tokens or request bodies as span attributes.',
      'Losing trace context in @Async or manually created threads — use context-propagating executors.',
      'Setting up tracing but not including trace ids in logs, missing the easiest way to correlate.',
    ],
    keyPoints: [
      'A trace follows one request across services; spans are timed operations inside it.',
      'Spring Boot 4: spring-boot-starter-opentelemetry + management.opentelemetry.tracing.export.otlp.endpoint.',
      'Context propagates via W3C traceparent headers through Spring\'s HTTP clients and messaging.',
      'traceId and spanId appear in logs automatically for correlation.',
      'Tune management.tracing.sampling.probability and add spans with @Observed or the Observation API.',
    ],
  },

  'structured-logging': {
    title: 'Structured Logging in Spring Boot',
    intro: `Plain text logs are easy for humans to read on one screen, but in production logs from dozens of instances flow into systems like Elasticsearch, Loki, Graylog, Splunk or CloudWatch. There you want to search "all ERROR logs for tenant acme with traceId X", which requires each log line to be <strong>structured data</strong> — JSON with named fields — rather than free text.

Spring Boot has built-in structured logging: one property switches console or file output to JSON in the Elastic Common Schema (ECS), Graylog (GELF) or Logstash format. This lesson shows how to enable it, add custom fields and MDC context, log key-value pairs, and follow logging practices that make production debugging fast and safe.`,
    sections: [
      {
        heading: 'Enabling Structured Output',
        body: `Set <code>logging.structured.format.console</code> (and/or <code>logging.structured.format.file</code>) to <code>ecs</code>, <code>gelf</code> or <code>logstash</code>. Each log event becomes one JSON line with timestamp, level, logger, thread, message, service name, and — when tracing is active — trace and span ids. A common setup is human-readable logs locally and JSON in production, controlled by profile.`,
      },
      {
        heading: 'Adding Context',
        body: `Put request-wide context such as correlation id, tenant or user id in the <strong>MDC</strong> (for example in a filter); it is added to every JSON log line automatically. SLF4J's fluent API (<code>log.atInfo().addKeyValue("orderId", id).log(...)</code>) adds per-event fields. Static fields for every line (environment, region) come from <code>logging.structured.json.add.*</code>.`,
      },
      {
        heading: 'Logging Practices',
        body: `Good production logging is deliberate:`,
        list: [
          'Log events, not noise: one INFO line per important business action, DEBUG for details.',
          'Use placeholders (<code>log.info("Order {} placed", id)</code>) rather than string concatenation.',
          'Log exceptions once, where they are handled, with the stack trace as the last argument.',
          'Never log passwords, tokens, full card numbers or unnecessary personal data.',
          'Write logs to stdout in containers and let the platform ship them; avoid local files.',
          'Adjust levels at runtime through the <code>/actuator/loggers</code> endpoint when debugging.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Switching to JSON logs in production',
        code: `# application-prod.yml
logging:
  structured:
    format:
      console: ecs
    json:
      add:
        environment: production
        region: ap-south-1
  level:
    root: INFO
    com.webnest: INFO

@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public void place(Order order) {
        log.info("Order {} placed", order.getNumber());
    }
}`,
        output: `{"@timestamp":"2026-09-27T10:12:03.412Z","log":{"level":"INFO","logger":"com.webnest.shop.OrderService"},"process":{"pid":1,"thread":{"name":"tomcat-handler-12"}},"service":{"name":"webnest-shop"},"message":"Order WN-10231 placed","traceId":"6f1c2b9e4d3a8f7e1c2b9e4d3a8f7e1c","spanId":"a1b2c3d4e5f60718","environment":"production","region":"ap-south-1","ecs":{"version":"8.11"}}`,
      },
      {
        caption: 'Per-event key-value pairs and MDC context',
        code: `// In a filter: context for every log line of this request
MDC.put("tenant", tenantId);
MDC.put("userId", userId);
try {
    chain.doFilter(request, response);
} finally {
    MDC.remove("tenant");
    MDC.remove("userId");
}

// In business code: structured fields for one event (SLF4J 2 fluent API)
log.atInfo()
   .setMessage("Payment captured")
   .addKeyValue("orderId", order.getNumber())
   .addKeyValue("amount", order.getTotal())
   .addKeyValue("method", "upi")
   .log();`,
        output: `{"@timestamp":"...","log":{"level":"INFO",...},"message":"Payment captured","orderId":"WN-10231","amount":2999.00,"method":"upi","tenant":"acme","userId":"42",...}

Kibana / Loki query: message:"Payment captured" AND tenant:"acme" AND method:"upi"`,
      },
      {
        caption: 'Changing a log level at runtime',
        code: `# expose the loggers endpoint (internal network only)
management:
  endpoints:
    web:
      exposure:
        include: health, loggers

curl -X POST localhost:9090/actuator/loggers/com.webnest.shop.payment \\
     -H "Content-Type: application/json" -d '{"configuredLevel":"DEBUG"}'

curl localhost:9090/actuator/loggers/com.webnest.shop.payment`,
        output: `{"configuredLevel":"DEBUG","effectiveLevel":"DEBUG"}
(DEBUG logs for the payment package appear immediately, without a restart; set back to null afterwards)`,
      },
    ],
    commonMistakes: [
      'Building JSON log lines by hand with string concatenation instead of using structured logging.',
      'Logging the same exception at every layer, producing several stack traces per failure.',
      'Logging secrets, tokens or full request bodies.',
      'Putting high-volume DEBUG logs in production permanently, increasing cost and hiding important events.',
      'Forgetting to clear MDC values, leaking context into unrelated requests on reused threads.',
    ],
    keyPoints: [
      'logging.structured.format.console/file = ecs, gelf or logstash turns logs into JSON.',
      'MDC values and SLF4J key-value pairs become searchable fields.',
      'Trace and span ids are included automatically when tracing is enabled.',
      'Log meaningful events once, with placeholders, and never log secrets.',
      'Use /actuator/loggers to change levels at runtime while debugging.',
    ],
  },

  'resilience-retries-rate-limits-and-circuit-breakers': {
    title: 'Resilience: Retries, Concurrency Limits and Circuit Breakers',
    intro: `Every remote call eventually fails: a network blip, a deployment on the other side, a database failover, a rate-limited partner API. A resilient application expects this. It retries transient failures, stops hammering a service that is clearly down, limits how much concurrent load it sends, and degrades gracefully with fallbacks instead of failing completely.

Spring Framework 7 brings retry and concurrency limiting into core Spring with <code>@Retryable</code> and <code>@ConcurrencyLimit</code>, and circuit breakers come from Resilience4j (via Spring Cloud Circuit Breaker). This lesson covers each pattern, when to use it, how to configure it, and how to combine them safely.`,
    sections: [
      {
        heading: 'Retries with @Retryable',
        body: `Annotate a method with <code>@Retryable</code> and enable processing with <code>@EnableResilientMethods</code> on a configuration class. On an exception, Spring retries the call with a configurable <code>maxRetries</code>, <code>delay</code>, <code>multiplier</code> (exponential back-off), <code>maxDelay</code> and <code>jitter</code>. Restrict retries to transient failures with <code>includes</code>/<code>excludes</code>. The programmatic <code>RetryTemplate</code> in <code>org.springframework.core.retry</code> offers the same without annotations. This replaces the separate Spring Retry library for most uses.`,
      },
      {
        heading: 'When Not to Retry',
        body: `Only retry operations that are safe to repeat (idempotent) and failures that may succeed next time: timeouts, 503, connection resets. Do not retry 400 Bad Request, authentication failures or business rule violations. Beware of retry storms: if every layer retries 3 times, one failing call can become 27. Retry at one layer, with back-off and jitter.`,
      },
      {
        heading: 'Concurrency Limits and Bulkheads',
        body: `<code>@ConcurrencyLimit(n)</code> restricts how many threads may execute a method at once — a <strong>bulkhead</strong> that protects a fragile dependency (or your own resources) from being overwhelmed. It is especially important with virtual threads, where thousands of concurrent requests could otherwise all hit a small downstream service at the same moment.`,
      },
      {
        heading: 'Circuit Breakers',
        body: `A circuit breaker watches calls to a dependency. When the failure rate crosses a threshold, it <strong>opens</strong> and fails calls immediately (usually with a fallback) instead of waiting for timeouts, giving the dependency time to recover. After a wait it goes <strong>half-open</strong>, lets a few trial calls through, and closes again if they succeed. Use Resilience4j through <code>spring-cloud-starter-circuitbreaker-resilience4j</code> and the <code>CircuitBreakerFactory</code> abstraction, configured with <code>resilience4j.circuitbreaker.*</code> properties.`,
      },
      {
        heading: 'Timeouts and Fallbacks',
        body: `Every remote call needs a timeout — otherwise no other pattern helps. Fallbacks should be honest: cached or default data, a "try again later" response, or queuing the work for later — never silently pretending an operation succeeded.`,
      },
    ],
    examples: [
      {
        caption: '@Retryable with exponential back-off (Spring Framework 7)',
        code: `@SpringBootApplication
@EnableResilientMethods
public class ShopApplication { ... }

@Service
public class ExchangeRateClient {

    private static final Logger log = LoggerFactory.getLogger(ExchangeRateClient.class);
    private final RestClient client;

    public ExchangeRateClient(RestClient.Builder builder) {
        this.client = builder.baseUrl("https://rates.example.com").build();
    }

    @Retryable(includes = {ResourceAccessException.class, HttpServerErrorException.ServiceUnavailable.class},
               maxRetries = 3, delay = 200, multiplier = 2, maxDelay = 2000, jitter = 50)
    public Rates latest(String base) {
        log.info("Fetching rates for {}", base);
        return client.get().uri("/latest/{base}", base).retrieve().body(Rates.class);
    }
}`,
        output: `INFO Fetching rates for INR        -> 503 Service Unavailable
INFO Fetching rates for INR        (after ~200 ms) -> 503
INFO Fetching rates for INR        (after ~400 ms) -> 200 OK
(a 404 or 400 would not be retried)`,
      },
      {
        caption: 'Programmatic retries with RetryTemplate',
        code: `RetryPolicy policy = RetryPolicy.builder()
    .maxRetries(4)
    .delay(Duration.ofMillis(100))
    .multiplier(2)
    .includes(TransientDataAccessException.class)
    .build();

RetryTemplate retry = new RetryTemplate(policy);

Order saved = retry.execute(() -> orderRepository.save(order));`,
        output: `attempt 1 -> CannotAcquireLockException (transient)
attempt 2 -> success`,
      },
      {
        caption: 'Protecting a fragile dependency with @ConcurrencyLimit',
        code: `@Service
public class LegacyInvoiceClient {

    // The legacy system falls over above ~10 parallel requests
    @ConcurrencyLimit(10)
    public Invoice render(String orderId) {
        return legacy.renderInvoice(orderId);
    }
}`,
        output: `200 concurrent requests (virtual threads) -> at most 10 inside render() at any time; the rest wait their turn`,
      },
      {
        caption: 'Circuit breaker with fallback using Spring Cloud Circuit Breaker + Resilience4j',
        code: `<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
<!-- import spring-cloud-dependencies 2025.1.x BOM -->

# application.yml
resilience4j:
  circuitbreaker:
    instances:
      recommendations:
        sliding-window-size: 20
        failure-rate-threshold: 50           # open when 50% of the last 20 calls fail
        wait-duration-in-open-state: 30s
        permitted-number-of-calls-in-half-open-state: 3
  timelimiter:
    instances:
      recommendations:
        timeout-duration: 800ms

@Service
public class RecommendationsFacade {

    private final CircuitBreaker breaker;
    private final RecommendationsClient client;
    private final PopularCourses popular;

    public RecommendationsFacade(CircuitBreakerFactory<?, ?> factory,
                                 RecommendationsClient client, PopularCourses popular) {
        this.breaker = factory.create("recommendations");
        this.client = client;
        this.popular = popular;
    }

    public List<Course> forStudent(long studentId) {
        return breaker.run(
            () -> client.personalised(studentId),
            throwable -> popular.top10());            // honest fallback: popular courses
    }
}`,
        output: `calls 1-10: recommendations service timing out -> fallback popular.top10()
circuit OPEN  -> next calls return the fallback instantly (no 800 ms wait)
after 30 s: HALF_OPEN -> 3 trial calls succeed -> CLOSED again

GET /actuator/health
{"components":{"circuitBreakers":{"details":{"recommendations":{"status":"CIRCUIT_OPEN", ...}}}}}`,
      },
    ],
    commonMistakes: [
      'Retrying non-idempotent operations such as payments without an idempotency key.',
      'Retrying every exception, including validation and authentication errors.',
      'Retrying at every layer (client, service, gateway), multiplying load during an outage.',
      'Forgetting timeouts, so calls hang and circuit breakers never see failures quickly.',
      'Fallbacks that hide failures (returning "success") instead of degrading honestly.',
    ],
    keyPoints: [
      '@EnableResilientMethods + @Retryable give declarative retries with back-off in core Spring Framework 7.',
      'Retry only transient failures of idempotent operations, at one layer, with jitter.',
      '@ConcurrencyLimit acts as a bulkhead, crucial with virtual threads.',
      'Circuit breakers (Resilience4j via Spring Cloud Circuit Breaker) fail fast and allow recovery.',
      'Always combine with timeouts and honest fallbacks.',
    ],
  },

  'virtual-threads-in-spring-boot': {
    title: 'Virtual Threads in Spring Boot',
    intro: `For decades, Java servers used one operating-system thread per request. OS threads are expensive — each reserves about a megabyte of stack — so a server could run only a few hundred at once, and threads spent most of their time waiting for databases and HTTP calls. Reactive programming solved the scaling problem, at the cost of complex code.

<strong>Virtual threads</strong> (Java 21, Project Loom) are lightweight threads managed by the JVM: you can run millions of them, and when one blocks on I/O the JVM parks it and reuses the carrier thread. With one property Spring Boot runs Tomcat, <code>@Async</code>, scheduling and message listeners on virtual threads, so ordinary blocking code scales like reactive code. This lesson explains how they work, how to enable them, how to measure the benefit, and the pitfalls to avoid.`,
    sections: [
      {
        heading: 'How Virtual Threads Work',
        body: `A virtual thread runs on top of a small pool of <strong>carrier</strong> (platform) threads. When it performs blocking I/O — a JDBC query, an HTTP call, <code>Thread.sleep</code> — the JVM unmounts it from the carrier and mounts another virtual thread, then resumes the first when its data arrives. The code looks exactly like normal blocking code, stack traces and debuggers work as usual, and no callback style is needed.`,
      },
      {
        heading: 'Enabling in Spring Boot',
        body: `On Java 21 or newer, set <code>spring.threads.virtual.enabled=true</code>. Spring Boot then uses virtual threads for Tomcat and Jetty request handling, the <code>applicationTaskExecutor</code> (<code>@Async</code>, MVC async), the task scheduler, Kafka and RabbitMQ listener containers, and JDK-based HTTP clients. If the application has no other non-daemon threads, set <code>spring.main.keep-alive=true</code> so the JVM does not exit.`,
      },
      {
        heading: 'Where They Help — and Where They Do Not',
        body: `Virtual threads help <strong>I/O-bound</strong> workloads with many concurrent requests that spend time waiting: typical REST services calling databases and other APIs. They do not make CPU-bound work faster (image processing, heavy computation) — you still have the same number of cores. And they move the bottleneck: 10,000 concurrent requests can now all reach your database, whose connection pool of 20 becomes the limit. Keep pools sized sensibly and use <code>@ConcurrencyLimit</code> or semaphores to protect downstream systems.`,
      },
      {
        heading: 'Pitfalls',
        body: `Do not pool virtual threads — create them freely. Avoid <code>ThreadLocal</code> caches of expensive objects (each of a million threads would get its own). Before Java 24, blocking inside <code>synchronized</code> blocks "pinned" the virtual thread to its carrier and reduced scalability; Java 24 (JEP 491) largely removed this problem, which is one reason to run on a current JDK such as Java 25. Monitor pinning with <code>jdk.VirtualThreadPinned</code> JFR events if you use older JDKs.`,
      },
    ],
    examples: [
      {
        caption: 'Enabling virtual threads',
        code: `# application.yml  (Java 21+)
spring:
  threads:
    virtual:
      enabled: true

@RestController
public class ThreadInfoController {

    @GetMapping("/api/thread")
    public String thread() throws InterruptedException {
        Thread.sleep(1000);                       // simulated blocking I/O
        return Thread.currentThread().toString();
    }
}`,
        output: `curl localhost:8080/api/thread
VirtualThread[#94,tomcat-handler-3]/runnable@ForkJoinPool-1-worker-2`,
      },
      {
        caption: 'Measuring the difference under load',
        code: `# 2,000 concurrent requests to an endpoint that blocks 1 second (e.g. slow downstream API)
# using the "hey" load generator
hey -n 10000 -c 2000 http://localhost:8080/api/thread

# Run twice: spring.threads.virtual.enabled=false, then =true`,
        output: `Platform threads (Tomcat max 200):  Requests/sec ≈ 195    p99 ≈ 10.4 s
Virtual threads:                     Requests/sec ≈ 1,950  p99 ≈ 1.1 s
(Same code; only the property changed.)`,
      },
      {
        caption: 'Using virtual threads directly for parallel I/O',
        code: `public ProductPage load(long id) throws Exception {
    try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
        Future<Product> product = executor.submit(() -> catalog.get(id));
        Future<List<Review>> reviews = executor.submit(() -> reviewsClient.forProduct(id));
        Future<Stock> stock = executor.submit(() -> inventory.stock(id));
        return new ProductPage(product.get(), reviews.get(), stock.get());
    }   // close() waits for all tasks
}`,
        output: `catalog 180 ms, reviews 240 ms, stock 150 ms -> page built in ≈ 245 ms, plain blocking code, no reactive types`,
      },
      {
        caption: 'Protecting the database when concurrency jumps',
        code: `# The pool, not the thread count, is now the limit — size it for the database
spring:
  datasource:
    hikari:
      maximum-pool-size: 30
      connection-timeout: 3s        # fail fast instead of queuing forever

@Service
public class SearchService {

    @ConcurrencyLimit(30)            // at most 30 concurrent expensive searches
    public List<Course> fullTextSearch(String q) {
        return repository.search(q);
    }
}`,
        output: `Under 5,000 concurrent requests: database sees ≤ 30 connections; excess requests wait briefly or time out cleanly`,
      },
    ],
    commonMistakes: [
      'Expecting virtual threads to speed up CPU-bound work.',
      'Enabling virtual threads and then overwhelming the database or downstream services with unlimited concurrency.',
      'Pooling virtual threads in a fixed-size executor, which defeats their purpose.',
      'Running on Java 21 with heavy synchronized blocking and not checking for pinning (upgrade to Java 24+ where possible).',
      'Switching a simple MVC app to WebFlux purely for scalability when virtual threads would achieve it with less complexity.',
    ],
    keyPoints: [
      'Virtual threads are cheap JVM-managed threads that unmount while blocked on I/O.',
      'spring.threads.virtual.enabled=true switches Tomcat, @Async, scheduling and listeners to virtual threads.',
      'They boost I/O-bound throughput with ordinary blocking code, not CPU-bound work.',
      'Protect limited resources (DB pools, fragile APIs) with pool sizes and @ConcurrencyLimit.',
      'Prefer Java 24+ (e.g. Java 25) to avoid synchronized pinning issues.',
    ],
  },

  'health-checks-readiness-and-liveness-probes': {
    title: 'Health Checks, Readiness and Liveness Probes',
    intro: `Load balancers and orchestrators like Kubernetes constantly ask your application two different questions. <strong>Liveness</strong>: "Is this process broken beyond repair? Should I restart it?" <strong>Readiness</strong>: "Can this instance handle traffic right now? Should I send it requests?" Answering these correctly is what makes rolling deployments, autoscaling and self-healing work without dropped requests.

This lesson covers Actuator's health endpoint and indicators, custom health checks, liveness and readiness state, health groups, how Spring Boot exposes Kubernetes probes, and how graceful shutdown fits in.`,
    sections: [
      {
        heading: 'The Health Endpoint',
        body: `<code>/actuator/health</code> aggregates <code>HealthIndicator</code>s: Spring Boot adds indicators for the database, disk space, Redis, MongoDB, RabbitMQ, Kafka, mail server and more, depending on your dependencies. The overall status is UP only if all indicators are UP. Details are hidden by default; show them to authorised users with <code>management.endpoint.health.show-details=when-authorized</code>.`,
      },
      {
        heading: 'Liveness vs Readiness',
        body: `These must not be confused. <strong>Liveness</strong> should reflect only the application's internal state — a deadlock or a corrupted state that a restart would fix. It must <strong>not</strong> include the database: if the database is down, restarting every pod will not help and causes a restart storm. <strong>Readiness</strong> says whether the instance should receive traffic: false during startup, while warming caches, during shutdown, or when a critical dependency is unavailable.`,
      },
      {
        heading: 'Probes in Spring Boot',
        body: `Spring Boot exposes <code>/actuator/health/liveness</code> and <code>/actuator/health/readiness</code> health groups, automatically on Kubernetes or with <code>management.endpoint.health.probes.enabled=true</code>. Its <code>ApplicationAvailability</code> tracks <code>LivenessState</code> and <code>ReadinessState</code>: readiness becomes ACCEPTING_TRAFFIC only after runners have completed, and switches to REFUSING_TRAFFIC at the start of graceful shutdown. You can add indicators to a group or change state yourself by publishing an <code>AvailabilityChangeEvent</code>.`,
      },
      {
        heading: 'Custom Health Indicators',
        body: `Implement <code>HealthIndicator</code> (or <code>AbstractHealthIndicator</code>) to report the state of a dependency Spring Boot does not know about, such as a partner API or a licence server. Keep checks fast and cached — probes run every few seconds on every instance.`,
      },
    ],
    examples: [
      {
        caption: 'Configuration and endpoint output',
        code: `# application.yml
management:
  endpoint:
    health:
      show-details: when-authorized
      probes:
        enabled: true
      group:
        readiness:
          include: readinessState, db, redis      # ready only if DB and Redis are reachable
  endpoints:
    web:
      exposure:
        include: health`,
        output: `GET /actuator/health/liveness  -> 200 {"status":"UP"}
GET /actuator/health/readiness -> 200 {"status":"UP"}
(database stopped)
GET /actuator/health/readiness -> 503 {"status":"OUT_OF_SERVICE"}
GET /actuator/health/liveness  -> 200 {"status":"UP"}      (no pointless restart)`,
      },
      {
        caption: 'A custom health indicator for a partner API',
        code: `@Component("paymentGateway")
public class PaymentGatewayHealthIndicator implements HealthIndicator {

    private final RestClient client;

    public PaymentGatewayHealthIndicator(RestClient.Builder builder) {
        this.client = builder.baseUrl("https://pay.example.com").build();
    }

    @Override
    public Health health() {
        try {
            ResponseEntity<Void> r = client.get().uri("/health").retrieve().toBodilessEntity();
            return Health.up().withDetail("status", r.getStatusCode().value()).build();
        } catch (Exception e) {
            return Health.down(e).withDetail("endpoint", "https://pay.example.com/health").build();
        }
    }
}`,
        output: `GET /actuator/health (as admin)
{"status":"DOWN","components":{"db":{"status":"UP"},"diskSpace":{"status":"UP"},
 "paymentGateway":{"status":"DOWN","details":{"endpoint":"https://pay.example.com/health","error":"...Connection refused"}}}}`,
      },
      {
        caption: 'Refusing traffic while a cache warms up',
        code: `@Component
public class CacheWarmer {

    private final ApplicationEventPublisher events;
    private final CatalogCache cache;

    public CacheWarmer(ApplicationEventPublisher events, CatalogCache cache) {
        this.events = events;
        this.cache = cache;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void warm() {
        AvailabilityChangeEvent.publish(events, this, ReadinessState.REFUSING_TRAFFIC);
        cache.loadAll();                                   // takes ~20 s
        AvailabilityChangeEvent.publish(events, this, ReadinessState.ACCEPTING_TRAFFIC);
    }
}`,
        output: `0-20 s after start: /actuator/health/readiness -> 503 (Kubernetes sends no traffic)
after warm-up:      /actuator/health/readiness -> 200`,
      },
    ],
    commonMistakes: [
      'Including the database in the liveness probe, causing all pods to restart during a database outage.',
      'Pointing Kubernetes probes at /actuator/health instead of the separate liveness and readiness groups.',
      'Writing slow health checks that call expensive APIs on every probe.',
      'Showing full health details publicly, revealing infrastructure information.',
      'Ignoring readiness during startup, so traffic arrives before caches and connections are ready.',
    ],
    keyPoints: [
      '/actuator/health aggregates HealthIndicators for your dependencies.',
      'Liveness = restart if broken (internal state only); readiness = send traffic or not.',
      'Spring Boot exposes /actuator/health/liveness and /readiness groups for Kubernetes.',
      'Custom HealthIndicators report dependencies Spring Boot does not know.',
      'Publish AvailabilityChangeEvent to control readiness, e.g. during warm-up.',
    ],
  },

  'building-container-images-with-buildpacks': {
    title: 'Building Container Images with Buildpacks',
    intro: `Writing a good Dockerfile for a Java application is harder than it looks: choose a secure base image, use a JRE rather than a full JDK, run as a non-root user, split dependencies into layers for fast rebuilds, configure memory for containers, and keep everything patched. <strong>Cloud Native Buildpacks</strong> do all of this for you.

Spring Boot's Maven and Gradle plugins build an optimised OCI image with Paketo buildpacks using a single command — no Dockerfile required. This lesson covers building and running images, configuring the Java version and JVM options, publishing to a registry, native images with buildpacks, and when a hand-written Dockerfile still makes sense.`,
    sections: [
      {
        heading: 'What Buildpacks Do',
        body: `The buildpack detects a Spring Boot application, provides a supported JRE, extracts the jar into layers (dependencies, Spring Boot loader, snapshot dependencies, application classes) so that code changes only rebuild the small application layer, configures a memory calculator that sizes the heap to the container's limits, runs as a non-root user, and adds metadata such as an SBOM. The base images are regularly patched, and rebuilding picks up new security fixes.`,
      },
      {
        heading: 'Building an Image',
        body: `Run <code>mvn spring-boot:build-image</code> or <code>./gradlew bootBuildImage</code>. A Docker-compatible daemon (Docker Desktop, Podman) must be available. Configure the image name, the Java version (<code>BP_JVM_VERSION</code>), runtime JVM options (<code>BPE_DELIM_JAVA_TOOL_OPTIONS</code>/<code>JAVA_TOOL_OPTIONS</code>) and whether to publish in the plugin configuration or on the command line.`,
      },
      {
        heading: 'Dockerfile vs Buildpacks',
        body: `Buildpacks are the fastest path to a secure, efficient image and suit most services. A hand-written multi-stage Dockerfile (see the Docker lesson) gives complete control — useful when you need extra OS packages, a specific distroless base, or your platform standardises on Dockerfiles. Either way, use the extracted/layered jar layout and a JRE base.`,
      },
    ],
    examples: [
      {
        caption: 'Building and running the image',
        code: `mvn spring-boot:build-image -Dspring-boot.build-image.imageName=ghcr.io/webnest/shop:1.0.0

docker run --rm -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod --memory=768m ghcr.io/webnest/shop:1.0.0`,
        output: `[INFO] Building image 'ghcr.io/webnest/shop:1.0.0'
[INFO]  > Pulling builder image 'docker.io/paketobuildpacks/builder-noble-java-tiny:latest'
[INFO]     [creator]     Paketo Buildpack for BellSoft Liberica 11.x
[INFO]     [creator]       BellSoft Liberica JRE 21.0.x: Contributing to layer
[INFO]     [creator]     Paketo Buildpack for Spring Boot 5.x
[INFO]     [creator]       Creating slices from layers index: dependencies, spring-boot-loader, snapshot-dependencies, application
[INFO] Successfully built image 'ghcr.io/webnest/shop:1.0.0'

Calculated JVM Memory Configuration: -Xmx360M -XX:MaxMetaspaceSize=120M ... (Total Memory: 768M)
Started ShopApplication in 3.1 seconds`,
      },
      {
        caption: 'Configuring the image in pom.xml',
        code: `<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <image>
            <name>ghcr.io/webnest/\${project.artifactId}:\${project.version}</name>
            <env>
                <BP_JVM_VERSION>25</BP_JVM_VERSION>
                <BPE_DELIM_JAVA_TOOL_OPTIONS xml:space="preserve"> </BPE_DELIM_JAVA_TOOL_OPTIONS>
                <BPE_APPEND_JAVA_TOOL_OPTIONS>-XX:+UseZGC</BPE_APPEND_JAVA_TOOL_OPTIONS>
            </env>
            <publish>false</publish>
        </image>
        <docker>
            <publishRegistry>
                <username>\${env.REGISTRY_USER}</username>
                <password>\${env.REGISTRY_TOKEN}</password>
            </publishRegistry>
        </docker>
    </configuration>
</plugin>

# publish in CI
mvn spring-boot:build-image -Dspring-boot.build-image.publish=true`,
        output: `[INFO] Successfully built image 'ghcr.io/webnest/shop:1.0.0'
[INFO] Successfully published image 'ghcr.io/webnest/shop:1.0.0'`,
      },
      {
        caption: 'A GraalVM native image with buildpacks',
        code: `# Requires the native profile (included in spring-boot-starter-parent) and GraalVM-compatible code
mvn -Pnative spring-boot:build-image -Dspring-boot.build-image.imageName=ghcr.io/webnest/shop-native:1.0.0

docker run --rm -p 8080:8080 ghcr.io/webnest/shop-native:1.0.0`,
        output: `Started ShopApplication in 0.068 seconds (process running for 0.071)
(image contains a native executable, no JVM; build takes several minutes)`,
      },
      {
        caption: 'Rebuilding after a code change reuses dependency layers',
        code: `docker history ghcr.io/webnest/shop:1.0.1 --format "{{.Size}}\\t{{.CreatedBy}}"`,
        output: `2.1MB    application layer          <- only this changed
0B       snapshot-dependencies
420kB    spring-boot-loader
78MB     dependencies               (reused from the previous image)
...      JRE and base layers        (reused)`,
      },
    ],
    commonMistakes: [
      'Running containers without a memory limit, or with a heap larger than the limit, causing the kernel to kill the JVM.',
      'Shipping a full JDK and build tools in production images when a JRE suffices.',
      'Publishing images tagged only "latest", making rollbacks and audits difficult.',
      'Never rebuilding images, so base image security fixes are never picked up.',
      'Expecting build-image to work without a running Docker-compatible daemon.',
    ],
    keyPoints: [
      'mvn spring-boot:build-image / gradle bootBuildImage build OCI images with Paketo buildpacks.',
      'Buildpacks provide a patched JRE, layered jars, a container-aware memory calculator and non-root users.',
      'Configure the image name, Java version and JVM options in the plugin or on the command line.',
      'Use -Pnative with build-image for GraalVM native images.',
      'Tag images with versions and rebuild regularly for security patches.',
    ],
  },

  'deploying-to-kubernetes': {
    title: 'Deploying Spring Boot to Kubernetes',
    intro: `Kubernetes has become the standard platform for running containerised services: it schedules containers onto machines, restarts failed instances, scales on load, rolls out new versions without downtime, and manages configuration and secrets. Spring Boot is designed to work well there — health probes, graceful shutdown, externalised configuration and metrics all map directly onto Kubernetes features.

This lesson deploys a Spring Boot application with a Deployment, Service, ConfigMap and Secret, configures probes, resources and graceful shutdown for zero-downtime rollouts, adds autoscaling, and explains the settings that most often cause trouble.`,
    sections: [
      {
        heading: 'The Core Objects',
        body: `A <strong>Deployment</strong> declares how many replicas of your container to run and how to update them. A <strong>Service</strong> gives the pods a stable name and load-balances between them; an <strong>Ingress</strong> or Gateway exposes it outside the cluster. A <strong>ConfigMap</strong> holds non-secret configuration and a <strong>Secret</strong> holds credentials; both can be provided as environment variables or files that Spring Boot reads.`,
      },
      {
        heading: 'Configuration from ConfigMaps and Secrets',
        body: `Environment variables map to properties through relaxed binding (<code>SPRING_DATASOURCE_URL</code>). For many settings, mount a ConfigMap as files and import them with <code>spring.config.import=configtree:/etc/config/</code>, where each file name becomes a property. Spring Cloud Kubernetes can also read ConfigMaps directly, but plain environment variables and config trees are usually enough.`,
      },
      {
        heading: 'Probes, Resources and Shutdown',
        body: `Point the <code>livenessProbe</code> at <code>/actuator/health/liveness</code> and the <code>readinessProbe</code> at <code>/actuator/health/readiness</code>, with a <code>startupProbe</code> so slow startups are not killed. Set CPU and memory <code>requests</code> and <code>limits</code>; the JVM respects container memory limits, so size the heap with <code>-XX:MaxRAMPercentage</code>. For zero-downtime rollouts, Spring Boot's graceful shutdown and readiness state handle in-flight requests, and a short <code>preStop</code> sleep gives load balancers time to stop sending traffic before the app shuts down.`,
      },
      {
        heading: 'Scaling',
        body: `A <code>HorizontalPodAutoscaler</code> adds or removes replicas based on CPU or custom metrics (for example request rate from Prometheus). Because every replica runs its own scheduler, caches and connection pools, remember the multi-instance concerns covered earlier: ShedLock for scheduled jobs, Redis for shared caches and sessions, and database pool sizes multiplied by replica count.`,
      },
    ],
    examples: [
      {
        caption: 'Deployment with probes, resources, config and graceful shutdown',
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: webnest-shop
spec:
  replicas: 3
  selector:
    matchLabels: { app: webnest-shop }
  strategy:
    rollingUpdate: { maxUnavailable: 0, maxSurge: 1 }
  template:
    metadata:
      labels: { app: webnest-shop }
    spec:
      terminationGracePeriodSeconds: 45
      containers:
        - name: app
          image: ghcr.io/webnest/shop:1.0.0
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: prod
            - name: JAVA_TOOL_OPTIONS
              value: "-XX:MaxRAMPercentage=75"
            - name: SPRING_DATASOURCE_PASSWORD
              valueFrom:
                secretKeyRef: { name: shop-db, key: password }
          envFrom:
            - configMapRef: { name: shop-config }
          resources:
            requests: { cpu: 500m, memory: 768Mi }
            limits:   { memory: 768Mi }
          startupProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
            failureThreshold: 30
            periodSeconds: 2
          livenessProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
            periodSeconds: 10
          readinessProbe:
            httpGet: { path: /actuator/health/readiness, port: 8080 }
            periodSeconds: 5
          lifecycle:
            preStop:
              sleep: { seconds: 10 }      # let load balancers remove the pod first`,
        output: `kubectl apply -f deployment.yaml
deployment.apps/webnest-shop created
kubectl get pods
webnest-shop-7d9c6b5f4-2xkqp   1/1   Running   0   42s
webnest-shop-7d9c6b5f4-8mzvn   1/1   Running   0   42s
webnest-shop-7d9c6b5f4-tq4rw   1/1   Running   0   42s`,
      },
      {
        caption: 'ConfigMap, Secret, Service and Ingress',
        code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: shop-config
data:
  SPRING_DATASOURCE_URL: jdbc:postgresql://postgres.db.svc.cluster.local:5432/webnest
  SPRING_DATASOURCE_USERNAME: webnest
  LOGGING_STRUCTURED_FORMAT_CONSOLE: ecs
---
apiVersion: v1
kind: Secret
metadata:
  name: shop-db
type: Opaque
stringData:
  password: change-me          # in practice created by a secret manager / sealed secrets
---
apiVersion: v1
kind: Service
metadata:
  name: webnest-shop
spec:
  selector: { app: webnest-shop }
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webnest-shop
spec:
  rules:
    - host: shop.webneststudio.co.in
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: webnest-shop, port: { number: 80 } }`,
        output: `curl https://shop.webneststudio.co.in/actuator/health/readiness
{"status":"UP"}`,
      },
      {
        caption: 'Rolling update, rollback and autoscaling',
        code: `# Deploy a new version with zero downtime
kubectl set image deployment/webnest-shop app=ghcr.io/webnest/shop:1.1.0
kubectl rollout status deployment/webnest-shop

# Something wrong? Roll back
kubectl rollout undo deployment/webnest-shop

# Scale on CPU between 3 and 10 replicas
kubectl autoscale deployment webnest-shop --cpu-percent=70 --min=3 --max=10`,
        output: `Waiting for deployment "webnest-shop" rollout to finish: 1 of 3 updated replicas are available...
deployment "webnest-shop" successfully rolled out
horizontalpodautoscaler.autoscaling/webnest-shop autoscaled`,
      },
    ],
    commonMistakes: [
      'Using the database health check in the liveness probe, causing restart storms during database incidents.',
      'No startupProbe for a slow-starting app, so the liveness probe kills it before it finishes starting.',
      'Setting a memory limit but letting the JVM heap use all of it, leaving no room for metaspace and threads (OOMKilled).',
      'terminationGracePeriodSeconds shorter than Spring\'s shutdown timeout, cutting off in-flight requests.',
      'Storing secrets in ConfigMaps or committing Secret manifests with real passwords to Git.',
    ],
    keyPoints: [
      'Deployment + Service + Ingress run and expose the app; ConfigMaps and Secrets configure it.',
      'Liveness, readiness and startup probes map to Spring Boot\'s health groups.',
      'Set resources and MaxRAMPercentage so the JVM fits the container.',
      'Graceful shutdown + readiness + preStop give zero-downtime rolling updates.',
      'Autoscale with HPA and handle multi-instance concerns (locks, shared caches, pool sizes).',
    ],
  },

  'ci-cd-with-github-actions': {
    title: 'CI/CD for Spring Boot with GitHub Actions',
    intro: `Continuous integration means every push is automatically built and tested; continuous delivery means every passing build produces a deployable artifact — and, ideally, is deployed automatically. For a Spring Boot team, a good pipeline catches broken tests, vulnerable dependencies and failed migrations minutes after a push instead of days later in production.

This lesson builds a complete GitHub Actions pipeline for a Spring Boot project: build and test with Maven caching and Testcontainers, publish test reports, scan dependencies, build and push a container image, and deploy to Kubernetes with an approval step for production.`,
    sections: [
      {
        heading: 'Pipeline Stages',
        body: `A typical pipeline runs: <strong>build and unit tests</strong> on every push and pull request; <strong>integration tests</strong> with Testcontainers (GitHub-hosted Linux runners include Docker); <strong>quality and security checks</strong> — dependency vulnerability scanning, static analysis, code coverage; <strong>package</strong> a container image tagged with the commit SHA; and <strong>deploy</strong> to staging automatically and to production after approval.`,
      },
      {
        heading: 'Speed Matters',
        body: `A slow pipeline gets ignored. Cache the Maven or Gradle repository (<code>actions/setup-java</code> has built-in caching), run independent jobs in parallel, reuse the Spring test context across tests, and share Testcontainers containers. Aim for feedback on pull requests within 10 minutes.`,
      },
      {
        heading: 'Secrets and Environments',
        body: `Store registry tokens, cloud credentials and kubeconfig in GitHub <strong>secrets</strong>, never in the repository. Use GitHub <strong>environments</strong> ("staging", "production") with protection rules such as required reviewers, so production deployments need an explicit approval. Prefer short-lived OIDC credentials for cloud providers over long-lived keys.`,
      },
    ],
    examples: [
      {
        caption: 'Build and test on every push and pull request',
        code: `# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven

      - name: Build and test (unit + Testcontainers integration tests)
        run: ./mvnw -B verify

      - name: Publish test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-reports
          path: target/surefire-reports/`,
        output: `✓ build  (6m 12s)
  Tests run: 412, Failures: 0, Errors: 0, Skipped: 3
  Containers started: postgres:17, redis:8, apache/kafka:4.1.0`,
      },
      {
        caption: 'Security scanning and building/pushing the image',
        code: `  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '21', cache: maven }
      - name: Dependency vulnerability scan
        run: ./mvnw -B org.owasp:dependency-check-maven:check -DfailBuildOnCVSS=7

  image:
    needs: [build, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '21', cache: maven }
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - name: Build image with buildpacks and push
        run: |
          IMAGE=ghcr.io/\${{ github.repository }}:\${{ github.sha }}
          ./mvnw -B -DskipTests spring-boot:build-image -Dspring-boot.build-image.imageName=$IMAGE
          docker push $IMAGE`,
        output: `✓ security (3m 40s) — no vulnerabilities with CVSS >= 7
✓ image    (4m 05s) — pushed ghcr.io/webnest/shop:3f9c2e1`,
      },
      {
        caption: 'Deploying to staging automatically and production with approval',
        code: `  deploy-staging:
    needs: image
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: azure/setup-kubectl@v4
      - name: Deploy
        env:
          KUBECONFIG_DATA: \${{ secrets.STAGING_KUBECONFIG }}
        run: |
          echo "$KUBECONFIG_DATA" | base64 -d > kubeconfig
          kubectl --kubeconfig kubeconfig set image deployment/webnest-shop app=ghcr.io/\${{ github.repository }}:\${{ github.sha }}
          kubectl --kubeconfig kubeconfig rollout status deployment/webnest-shop --timeout=5m

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production          # requires reviewer approval in repository settings
    steps:
      - uses: azure/setup-kubectl@v4
      - name: Deploy
        env:
          KUBECONFIG_DATA: \${{ secrets.PROD_KUBECONFIG }}
        run: |
          echo "$KUBECONFIG_DATA" | base64 -d > kubeconfig
          kubectl --kubeconfig kubeconfig set image deployment/webnest-shop app=ghcr.io/\${{ github.repository }}:\${{ github.sha }}
          kubectl --kubeconfig kubeconfig rollout status deployment/webnest-shop --timeout=5m`,
        output: `✓ deploy-staging     (1m 20s)
⏸ deploy-production  waiting for approval from @webnest/leads
✓ deploy-production  (1m 31s) — approved by vansh`,
      },
    ],
    commonMistakes: [
      'Skipping integration tests in CI because "Docker is complicated" — GitHub-hosted runners support Testcontainers.',
      'Tagging images only with latest, making it impossible to know which commit is running.',
      'Storing credentials in workflow files instead of GitHub secrets.',
      'Deploying to production automatically with no approval or smoke test.',
      'Letting the pipeline grow to 40+ minutes, so developers stop waiting for it.',
    ],
    keyPoints: [
      'Build and test every push and pull request; include Testcontainers integration tests.',
      'Cache dependencies and parallelise jobs for fast feedback.',
      'Scan dependencies and fail on serious vulnerabilities.',
      'Build images tagged with the commit SHA and push to a registry.',
      'Deploy to staging automatically and to production through a protected environment.',
    ],
  },
}
