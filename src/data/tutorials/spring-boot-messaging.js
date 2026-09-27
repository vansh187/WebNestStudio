// Spring Boot course — async processing and messaging lessons (Spring Boot 4,
// Spring for Apache Kafka 4, Spring AMQP 4). Keys are slugs matching the
// messaging module topics in codelabDefaults.js.
export const springBootMessaging = {
  'async-processing-with-async': {
    title: 'Async Processing with @Async',
    intro: `Some work should not make the user wait: sending a welcome email, generating a PDF, resizing an uploaded image, calling a slow partner API whose result is not needed for the response. Running such work on another thread keeps requests fast.

Spring's <code>@Async</code> annotation runs a method on a background thread pool with a single line of code. This lesson covers enabling async execution, return types and <code>CompletableFuture</code>, running several calls in parallel, configuring the executor Spring Boot provides (including virtual threads), handling exceptions, and propagating context such as the logged-in user and correlation ids to background threads.`,
    sections: [
      {
        heading: 'Enabling @Async',
        body: `Add <code>@EnableAsync</code> to a configuration class. A public method annotated with <code>@Async</code>, called from another bean, then returns immediately while its body runs on a thread from Spring Boot's auto-configured <code>applicationTaskExecutor</code>. As with transactions, it works through proxies: self-invocation and private methods run synchronously.`,
      },
      {
        heading: 'Return Types',
        body: `An <code>@Async</code> method may return <code>void</code> (fire and forget) or a <code>CompletableFuture&lt;T&gt;</code> so the caller can wait for, combine or react to the result. <code>CompletableFuture.allOf(...)</code> runs several independent calls in parallel and waits for all of them — a common way to cut response time when a page needs data from three slow services.`,
      },
      {
        heading: 'The Executor',
        body: `Spring Boot configures a <code>ThreadPoolTaskExecutor</code> with 8 core threads and an unbounded queue by default; tune it with <code>spring.task.execution.pool.*</code>. An unbounded queue hides overload, so set a queue capacity and max size for production. With <code>spring.threads.virtual.enabled=true</code> (Java 21+), Spring Boot uses a virtual-thread executor instead, which suits I/O-heavy tasks. You can define additional named executors and pick one with <code>@Async("reportExecutor")</code>.`,
      },
      {
        heading: 'Exceptions and Context Propagation',
        body: `Exceptions from <code>void</code> async methods never reach the caller; handle them with an <code>AsyncUncaughtExceptionHandler</code> or they are only logged. For <code>CompletableFuture</code> methods the exception completes the future exceptionally. Thread-bound context — the <code>SecurityContext</code>, logging MDC, transactions — does <strong>not</strong> travel to the new thread automatically. Spring Boot applies any <code>TaskDecorator</code> bean to its executors, which is where you copy MDC values; <code>DelegatingSecurityContextAsyncTaskExecutor</code> carries the security context.`,
      },
      {
        heading: 'When @Async Is Not Enough',
        body: `@Async work lives only in memory: if the application restarts, queued tasks are lost, and there is no retry. For work that must not be lost — payment processing, order fulfilment — publish a message to a broker (Kafka, RabbitMQ) or use a job framework instead.`,
      },
    ],
    examples: [
      {
        caption: 'Fire-and-forget email and parallel calls with CompletableFuture',
        code: `@Configuration
@EnableAsync
public class AsyncConfig {}

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Async
    public void sendWelcomeEmail(String email) {
        log.info("Sending welcome email to {} on {}", email, Thread.currentThread().getName());
        sleep(2000);                                     // simulate slow SMTP
        log.info("Email sent to {}", email);
    }
}

@Service
public class DashboardService {

    private final StatsClient stats;

    public DashboardService(StatsClient stats) {
        this.stats = stats;
    }

    public Dashboard load(String userId) {
        CompletableFuture<Progress> progress = stats.progress(userId);        // each @Async, ~1s
        CompletableFuture<List<Badge>> badges = stats.badges(userId);
        CompletableFuture<List<Course>> recs = stats.recommendations(userId);

        CompletableFuture.allOf(progress, badges, recs).join();
        return new Dashboard(progress.join(), badges.join(), recs.join());
    }
}

@Service
public class StatsClient {
    @Async
    public CompletableFuture<Progress> progress(String userId) {
        return CompletableFuture.completedFuture(callRemoteProgressApi(userId));
    }
    // badges(...) and recommendations(...) are similar
}`,
        output: `POST /api/register -> 201 in 45 ms
INFO [task-1] Sending welcome email to asha@webnest.in on task-1
INFO [task-1] Email sent to asha@webnest.in          (2 s later, user already has the response)

GET /api/dashboard -> 200 in ~1.05 s (three 1 s calls in parallel instead of 3 s sequentially)`,
      },
      {
        caption: 'Configuring the executor, or switching to virtual threads',
        code: `# application.yml — bounded platform-thread pool
spring:
  task:
    execution:
      thread-name-prefix: async-
      pool:
        core-size: 8
        max-size: 32
        queue-capacity: 500
      shutdown:
        await-termination: true
        await-termination-period: 30s

# or, on Java 21+, use virtual threads for all task execution
spring:
  threads:
    virtual:
      enabled: true`,
        output: `INFO [async-3] Sending welcome email ...
(with virtual threads: INFO [async-12] ... — each task on a cheap virtual thread)`,
      },
      {
        caption: 'Handling exceptions and propagating MDC and security context',
        code: `@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    private static final Logger log = LoggerFactory.getLogger(AsyncConfig.class);

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) ->
            log.error("Async method {} failed with params {}", method.getName(), params, ex);
    }

    // Spring Boot applies this decorator to the auto-configured executor
    @Bean
    TaskDecorator contextCopyingDecorator() {
        return runnable -> {
            Map<String, String> mdc = MDC.getCopyOfContextMap();
            SecurityContext security = SecurityContextHolder.getContext();
            return () -> {
                try {
                    if (mdc != null) MDC.setContextMap(mdc);
                    SecurityContextHolder.setContext(security);
                    runnable.run();
                } finally {
                    MDC.clear();
                    SecurityContextHolder.clearContext();
                }
            };
        };
    }
}`,
        output: `INFO  [3b1f6c2e] [async-2] Generating report for asha@webnest.in   (correlation id and user carried over)
ERROR AsyncConfig : Async method sendWelcomeEmail failed with params [bad@] MailSendException: Invalid address`,
      },
    ],
    commonMistakes: [
      'Calling an @Async method from the same class and expecting it to run in the background.',
      'Forgetting @EnableAsync, so every @Async method silently runs synchronously.',
      'Using @Async for business-critical work that must survive restarts; use a message broker instead.',
      'Leaving the default unbounded queue in production, hiding overload until memory runs out.',
      'Expecting SecurityContextHolder or MDC values inside async methods without a TaskDecorator.',
    ],
    keyPoints: [
      '@EnableAsync + @Async runs methods on Spring Boot\'s applicationTaskExecutor.',
      'Return CompletableFuture to compose results and run independent calls in parallel.',
      'Tune spring.task.execution.pool.* or enable virtual threads with spring.threads.virtual.enabled.',
      'Handle void-method exceptions with AsyncUncaughtExceptionHandler.',
      'Propagate MDC and security context with a TaskDecorator bean.',
    ],
  },

  'scheduling-tasks-with-scheduled': {
    title: 'Scheduling Tasks with @Scheduled',
    intro: `Applications are full of recurring jobs: cancel unpaid orders every 15 minutes, send a daily digest at 8 AM, refresh exchange rates every hour, purge expired tokens at night, generate monthly invoices on the first of the month. Spring's <code>@Scheduled</code> annotation turns any bean method into such a job.

This lesson covers fixed-rate, fixed-delay and cron schedules, time zones, externalising schedules to configuration, the scheduler thread pool, avoiding duplicate runs when several instances are deployed (ShedLock), and testing scheduled logic.`,
    sections: [
      {
        heading: 'Enabling Scheduling',
        body: `Add <code>@EnableScheduling</code> to a configuration class and annotate methods with <code>@Scheduled</code>. Scheduled methods must return <code>void</code> and take no arguments. Spring Boot auto-configures a <code>ThreadPoolTaskScheduler</code> with <strong>one thread</strong> by default, so a slow job delays all others — increase <code>spring.task.scheduling.pool.size</code> or enable virtual threads.`,
      },
      {
        heading: 'Schedule Types',
        body: `Choose the trigger that matches the job:`,
        list: [
          '<code>fixedRate</code> — start every N time units, measured from the start of the previous run (may overlap in intent if runs are slow; the single-threaded scheduler prevents actual overlap).',
          '<code>fixedDelay</code> — wait N time units after the previous run <em>finishes</em>; the usual choice for polling.',
          '<code>initialDelay</code> — delay the first run after startup.',
          '<code>cron</code> — calendar-based schedules with six fields: second, minute, hour, day of month, month, day of week. Macros such as <code>@daily</code> and <code>@hourly</code> are supported.',
          '<code>zone</code> — the time zone for cron expressions; always set it explicitly for business schedules.',
        ],
      },
      {
        heading: 'Externalising Schedules',
        body: `Hard-coded schedules require a redeploy to change. Use placeholders — <code>@Scheduled(cron = "\${jobs.digest.cron}")</code> — and set values per environment. The special value <code>"-"</code> disables a cron job, which is handy for turning jobs off in tests or on certain instances.`,
      },
      {
        heading: 'Multiple Instances: Run Once, Not N Times',
        body: `Every instance of your application runs its own scheduler. With three pods, a nightly invoice job runs three times — usually a serious bug. Use a distributed lock such as <strong>ShedLock</strong>, which records locks in your database (or Redis) so only one instance executes each run. For heavy, restartable batch work, consider Spring Batch or a dedicated job scheduler.`,
      },
      {
        heading: 'Keep Jobs Thin and Testable',
        body: `Put the job's logic in a normal service method and keep the <code>@Scheduled</code> method as a one-line trigger. Test the service directly with a fixed <code>Clock</code>; you should never need to wait for a real schedule in a test.`,
      },
    ],
    examples: [
      {
        caption: 'Fixed delay, fixed rate and cron jobs',
        code: `@Configuration
@EnableScheduling
public class SchedulingConfig {}

@Component
public class ShopJobs {

    private static final Logger log = LoggerFactory.getLogger(ShopJobs.class);
    private final OrderCleanupService cleanup;
    private final RatesService rates;
    private final DigestService digest;

    public ShopJobs(OrderCleanupService cleanup, RatesService rates, DigestService digest) {
        this.cleanup = cleanup;
        this.rates = rates;
        this.digest = digest;
    }

    // 15 minutes after the previous run finished
    @Scheduled(fixedDelay = 15, initialDelay = 1, timeUnit = TimeUnit.MINUTES)
    public void cancelUnpaidOrders() {
        int n = cleanup.cancelOrdersUnpaidFor(Duration.ofHours(2));
        log.info("Cancelled {} unpaid orders", n);
    }

    // every hour, measured from the start of each run
    @Scheduled(fixedRate = 1, timeUnit = TimeUnit.HOURS)
    public void refreshRates() {
        rates.refresh();
    }

    // 08:00 every weekday, Indian time
    @Scheduled(cron = "0 0 8 * * MON-FRI", zone = "Asia/Kolkata")
    public void sendDailyDigest() {
        digest.sendToAllSubscribers();
    }
}`,
        output: `10:01:00 INFO [scheduling-1] ShopJobs : Cancelled 3 unpaid orders
10:16:02 INFO [scheduling-1] ShopJobs : Cancelled 0 unpaid orders
08:00:00 IST (Mon-Fri) daily digest sent`,
      },
      {
        caption: 'Cron expression cheat sheet and configurable schedules',
        code: `# second minute hour day-of-month month day-of-week
#   "0 */5 * * * *"        every 5 minutes
#   "0 30 2 * * *"         every day at 02:30
#   "0 0 9 1 * *"          09:00 on the 1st of every month
#   "0 0 18 * * FRI"       every Friday at 18:00
#   "0 0 0 L * *"          midnight on the last day of every month
#   "@daily"               once a day at midnight

# application.yml
jobs:
  invoices:
    cron: "0 0 1 1 * *"      # 01:00 on the 1st of each month
spring:
  task:
    scheduling:
      pool:
        size: 4

@Scheduled(cron = "\${jobs.invoices.cron}", zone = "Asia/Kolkata")
public void generateMonthlyInvoices() {
    invoiceService.generateFor(YearMonth.now(ZoneId.of("Asia/Kolkata")).minusMonths(1));
}

# application-test.yml — disable the job in tests
jobs:
  invoices:
    cron: "-"`,
        output: `(Changing jobs.invoices.cron in the environment reschedules the job without code changes.)`,
      },
      {
        caption: 'Running a job on only one instance with ShedLock',
        code: `<dependency>
    <groupId>net.javacrumbs.shedlock</groupId>
    <artifactId>shedlock-spring</artifactId>
    <version>6.10.0</version>
</dependency>
<dependency>
    <groupId>net.javacrumbs.shedlock</groupId>
    <artifactId>shedlock-provider-jdbc-template</artifactId>
    <version>6.10.0</version>
</dependency>

-- Flyway migration
create table shedlock (
    name       varchar(64)  primary key,
    lock_until timestamp    not null,
    locked_at  timestamp    not null,
    locked_by  varchar(255) not null
);

@Configuration
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "10m")
public class LockConfig {

    @Bean
    LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(JdbcTemplateLockProvider.Configuration.builder()
            .withJdbcTemplate(new JdbcTemplate(dataSource))
            .usingDbTime()
            .build());
    }
}

@Scheduled(cron = "0 0 1 1 * *", zone = "Asia/Kolkata")
@SchedulerLock(name = "monthlyInvoices", lockAtLeastFor = "1m", lockAtMostFor = "30m")
public void generateMonthlyInvoices() { ... }`,
        output: `pod-a: Generated 1,284 invoices for 2026-08
pod-b: (skipped — lock "monthlyInvoices" held by pod-a)
pod-c: (skipped — lock "monthlyInvoices" held by pod-a)`,
      },
    ],
    commonMistakes: [
      'Deploying several instances without a distributed lock, so every job runs once per instance.',
      'Leaving the scheduler pool at one thread while a long job blocks all other schedules.',
      'Writing cron expressions with five fields (Unix style); Spring expects six, starting with seconds.',
      'Omitting the zone attribute, so jobs shift when servers run in UTC.',
      'Putting all business logic inside the @Scheduled method, making it hard to test without waiting.',
    ],
    keyPoints: [
      '@EnableScheduling + @Scheduled turns bean methods into recurring jobs.',
      'Use fixedDelay for polling, fixedRate for regular intervals and cron (6 fields) with zone for calendar schedules.',
      'Externalise schedules with placeholders; "-" disables a cron job.',
      'Increase spring.task.scheduling.pool.size when you have several jobs.',
      'Use ShedLock or a similar lock so jobs run on only one instance.',
    ],
  },

  'spring-application-events': {
    title: 'Spring Application Events',
    intro: `When a student completes a course, several things should happen: issue a certificate, send a congratulations email, update the leaderboard, notify the instructor. If <code>CourseService</code> calls all of those services directly, it becomes coupled to every feature that cares about course completion, and each new feature means editing it again.

Application events decouple this. The service publishes a <code>CourseCompletedEvent</code>, and any number of listeners react independently. This lesson covers publishing events, synchronous and asynchronous listeners, ordering and conditions, transaction-bound listeners, and when to move from in-process events to a message broker or Spring Modulith's event publication registry.`,
    sections: [
      {
        heading: 'Publishing Events',
        body: `Any object can be an event — a Java record is ideal. Inject <code>ApplicationEventPublisher</code> and call <code>publishEvent(new CourseCompletedEvent(...))</code>. Name events in the past tense (something that has happened) and include the data listeners typically need, such as ids and key values, rather than whole mutable entities.`,
      },
      {
        heading: 'Listening with @EventListener',
        body: `Annotate a bean method with <code>@EventListener</code>; its parameter type decides which events it receives. By default listeners run <strong>synchronously</strong> on the publisher's thread and inside its transaction, in an order you can control with <code>@Order</code>. An exception thrown by a synchronous listener propagates back to the publisher. A <code>condition</code> attribute with SpEL filters events, and a listener method can return a new event to publish a follow-up.`,
      },
      {
        heading: 'Asynchronous Listeners',
        body: `Add <code>@Async</code> (with <code>@EnableAsync</code>) to run a listener on a background thread, so slow reactions such as sending email do not delay the user's request and failures do not affect the publisher.`,
      },
      {
        heading: 'Transaction-Bound Listeners',
        body: `<code>@TransactionalEventListener</code> delays the listener until the publisher's transaction reaches a phase — <code>AFTER_COMMIT</code> by default, or <code>AFTER_ROLLBACK</code>, <code>AFTER_COMPLETION</code>, <code>BEFORE_COMMIT</code>. This guarantees you never email a certificate for a completion that was rolled back. If the listener itself needs to write to the database, give it its own transaction with <code>@Transactional(propagation = REQUIRES_NEW)</code>.`,
      },
      {
        heading: 'Limits and Next Steps',
        body: `In-process events vanish if the application crashes between commit and listener execution. When reliability matters, use Spring Modulith's <strong>event publication registry</strong>, which stores events in the database and retries incomplete ones, or publish to an external broker using the transactional outbox pattern. Events that other services must receive belong in Kafka or RabbitMQ.`,
      },
    ],
    examples: [
      {
        caption: 'Publishing an event and reacting in independent listeners',
        code: `public record CourseCompletedEvent(Long studentId, String studentEmail, String courseSlug, Instant completedAt) {}

@Service
public class ProgressService {

    private final EnrollmentRepository enrollments;
    private final ApplicationEventPublisher events;

    public ProgressService(EnrollmentRepository enrollments, ApplicationEventPublisher events) {
        this.enrollments = enrollments;
        this.events = events;
    }

    @Transactional
    public void completeLesson(Long enrollmentId, Long lessonId) {
        Enrollment e = enrollments.findById(enrollmentId).orElseThrow();
        e.markLessonDone(lessonId);
        if (e.isCourseComplete()) {
            events.publishEvent(new CourseCompletedEvent(e.getStudentId(), e.getStudentEmail(),
                e.getCourseSlug(), Instant.now()));
        }
    }
}

@Component
class CertificateListener {
    @TransactionalEventListener                      // AFTER_COMMIT
    void issue(CourseCompletedEvent e) {
        System.out.println("Certificate issued for " + e.courseSlug() + " to student " + e.studentId());
    }
}

@Component
class CongratulationsEmailListener {
    @Async
    @TransactionalEventListener
    void email(CourseCompletedEvent e) {
        System.out.println("Emailing " + e.studentEmail() + " on " + Thread.currentThread().getName());
    }
}

@Component
class LeaderboardListener {
    @EventListener(condition = "#e.courseSlug() == 'spring-boot'")
    void bonus(CourseCompletedEvent e) {
        System.out.println("+500 points for completing Spring Boot");
    }
}`,
        output: `+500 points for completing Spring Boot                 (synchronous, inside the transaction)
-- transaction commits --
Certificate issued for spring-boot to student 7
Emailing asha@webnest.in on task-2                      (async, after commit)`,
      },
      {
        caption: 'Chaining events and listener ordering',
        code: `public record CertificateIssuedEvent(Long studentId, String certificateNo) {}

@Component
class CertificateListener {

    // Returning an object publishes it as a new event
    @EventListener
    @Order(1)
    CertificateIssuedEvent issue(CourseCompletedEvent e) {
        String no = "WN-" + e.studentId() + "-" + e.courseSlug().toUpperCase();
        return new CertificateIssuedEvent(e.studentId(), no);
    }
}

@Component
class LinkedInShareListener {
    @EventListener
    void suggestShare(CertificateIssuedEvent e) {
        System.out.println("Suggest sharing certificate " + e.certificateNo());
    }
}`,
        output: `Suggest sharing certificate WN-7-SPRING-BOOT`,
      },
      {
        caption: 'Testing that an event is published',
        code: `@SpringBootTest
@RecordApplicationEvents
class ProgressServiceTest {

    @Autowired ProgressService progress;
    @Autowired ApplicationEvents events;

    @Test
    void publishesCompletionWhenLastLessonIsDone() {
        progress.completeLesson(1L, 60L);

        assertThat(events.stream(CourseCompletedEvent.class))
            .singleElement()
            .extracting(CourseCompletedEvent::courseSlug)
            .isEqualTo("spring-boot");
    }
}`,
        output: `ProgressServiceTest > publishesCompletionWhenLastLessonIsDone() PASSED`,
      },
    ],
    commonMistakes: [
      'Sending emails or calling external APIs from plain @EventListener methods inside a transaction that may still roll back.',
      'Expecting @TransactionalEventListener to fire when no transaction is active (it is skipped unless fallbackExecution = true).',
      'Publishing JPA entities as events, then reading lazy associations in async listeners after the session is closed.',
      'Letting a failing synchronous listener break the main business operation unintentionally.',
      'Using in-process events for cross-service communication; they never leave the JVM.',
    ],
    keyPoints: [
      'ApplicationEventPublisher publishes events; @EventListener methods receive them by type.',
      'Listeners run synchronously by default; add @Async for background execution.',
      '@TransactionalEventListener runs after commit (or another phase) to avoid acting on rolled-back data.',
      'Use conditions, @Order and returned events for filtering, ordering and chaining.',
      'For guaranteed delivery use Spring Modulith\'s event registry or a message broker.',
    ],
  },

  'apache-kafka-with-spring-boot': {
    title: 'Apache Kafka with Spring Boot',
    intro: `Apache Kafka is the backbone of event-driven architectures at companies of every size. It is a distributed, durable log: producers append events to <strong>topics</strong>, and any number of consumer groups read them at their own pace, even days later. Order placed, payment received, lesson completed — each becomes an event other services react to without calling each other directly.

Spring for Apache Kafka, auto-configured by <code>spring-boot-starter-kafka</code> in Spring Boot 4, gives you <code>KafkaTemplate</code> for sending and <code>@KafkaListener</code> for consuming. This lesson covers Kafka's core concepts, running Kafka locally, producing and consuming JSON events with Jackson 3 serializers, keys and partitions, error handling with retries and dead-letter topics, and testing with Testcontainers.`,
    sections: [
      {
        heading: 'Kafka Concepts',
        body: `The vocabulary you need:`,
        list: [
          '<strong>Topic</strong> — a named stream of events, split into <strong>partitions</strong> for parallelism.',
          '<strong>Key</strong> — events with the same key always go to the same partition, so they are processed in order (e.g. all events for order 42).',
          '<strong>Offset</strong> — the position of an event in a partition; consumers commit offsets to remember progress.',
          '<strong>Consumer group</strong> — instances sharing a group id split the partitions between them; different groups each get every event.',
          '<strong>Retention</strong> — events stay for a configured time (days) or forever with compaction, regardless of whether they were consumed.',
        ],
      },
      {
        heading: 'Producing Events',
        body: `<code>KafkaTemplate.send(topic, key, value)</code> returns a <code>CompletableFuture&lt;SendResult&gt;</code>. Configure serializers in <code>spring.kafka.producer.*</code>: <code>StringSerializer</code> for keys and, in Spring Boot 4, <code>JacksonJsonSerializer</code> (Jackson 3) for JSON values. For reliability set <code>acks=all</code> and keep idempotence enabled (the default in modern Kafka clients), so retries never create duplicates within a partition.`,
      },
      {
        heading: 'Consuming Events',
        body: `<code>@KafkaListener(topics = "orders", groupId = "email-service")</code> on a bean method receives deserialised events. Spring manages polling, threading and offset commits. Increase <code>concurrency</code> to use more consumer threads (up to the number of partitions). Kafka delivers <strong>at least once</strong>: after a crash, an event may be redelivered, so listeners must be <strong>idempotent</strong> — processing the same event twice must be harmless.`,
      },
      {
        heading: 'Error Handling, Retries and Dead Letters',
        body: `When a listener throws, Spring's <code>DefaultErrorHandler</code> retries with a back-off and, after the last attempt, can hand the record to a <code>DeadLetterPublishingRecoverer</code> that sends it to <code>&lt;topic&gt;-dlt</code> so one bad message does not block the partition forever. <code>@RetryableTopic</code> offers non-blocking retries through separate retry topics. Deserialisation errors need the <code>ErrorHandlingDeserializer</code> wrapper, otherwise a malformed message causes an endless failure loop.`,
      },
      {
        heading: 'Transactional Outbox',
        body: `Writing to the database and then sending to Kafka is not atomic: the send can fail after the commit, or succeed before a rollback. The robust pattern is the <strong>transactional outbox</strong>: store the event in an outbox table in the same database transaction, and let a separate process (a scheduled publisher, Debezium CDC, or Spring Modulith's externalised events) publish it to Kafka.`,
      },
    ],
    examples: [
      {
        caption: 'Running Kafka locally and configuring Spring Boot',
        code: `# compose.yaml — single-node Kafka in KRaft mode (no ZooKeeper)
services:
  kafka:
    image: apache/kafka:4.1.0
    ports:
      - "9092:9092"

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-kafka</artifactId>
</dependency>

# application.yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JacksonJsonSerializer
      acks: all
    consumer:
      group-id: webnest-shop
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.ErrorHandlingDeserializer
      properties:
        spring.deserializer.value.delegate.class: org.springframework.kafka.support.serializer.JacksonJsonDeserializer
        spring.json.trusted.packages: com.webnest.shop.events`,
        output: `Kafka version: 4.1.0
[Producer clientId=producer-1] Cluster ID: 5L6g3nShT-eMCtK--X86sw`,
      },
      {
        caption: 'Declaring a topic and producing events with a key',
        code: `public record OrderPlaced(String orderId, String customerEmail, BigDecimal total, Instant placedAt) {}

@Configuration
public class TopicConfig {
    @Bean
    NewTopic ordersTopic() {
        return TopicBuilder.name("orders.placed").partitions(6).replicas(1).build();
    }
}

@Service
public class OrderEventsProducer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventsProducer.class);
    private final KafkaTemplate<String, OrderPlaced> kafka;

    public OrderEventsProducer(KafkaTemplate<String, OrderPlaced> kafka) {
        this.kafka = kafka;
    }

    public void publish(OrderPlaced event) {
        kafka.send("orders.placed", event.orderId(), event)          // key = orderId keeps per-order ordering
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish {}", event.orderId(), ex);
                } else {
                    RecordMetadata m = result.getRecordMetadata();
                    log.info("Published {} to partition {} offset {}", event.orderId(), m.partition(), m.offset());
                }
            });
    }
}`,
        output: `INFO Published WN-10231 to partition 3 offset 0
INFO Published WN-10232 to partition 1 offset 0
INFO Published WN-10231 to partition 3 offset 1   (same key -> same partition)`,
      },
      {
        caption: 'Idempotent consumers in two independent consumer groups',
        code: `@Component
public class ConfirmationEmailConsumer {

    private final ProcessedEventRepository processed;
    private final MailService mail;

    public ConfirmationEmailConsumer(ProcessedEventRepository processed, MailService mail) {
        this.processed = processed;
        this.mail = mail;
    }

    @KafkaListener(topics = "orders.placed", groupId = "email-service", concurrency = "3")
    @Transactional
    public void onOrderPlaced(OrderPlaced event, @Header(KafkaHeaders.RECEIVED_PARTITION) int partition) {
        if (!processed.markIfNew("email:" + event.orderId())) {
            return;                                     // duplicate delivery — already handled
        }
        mail.sendOrderConfirmation(event.customerEmail(), event.orderId(), event.total());
    }
}

@Component
public class AnalyticsConsumer {
    @KafkaListener(topics = "orders.placed", groupId = "analytics-service")
    public void record(OrderPlaced event) {
        System.out.println("Revenue +" + event.total() + " at " + event.placedAt());
    }
}`,
        output: `email-service     : confirmation sent for WN-10231
analytics-service : Revenue +2999.00 at 2026-09-27T10:12:03Z
(both groups receive every event; within a group partitions are shared across 3 threads)`,
      },
      {
        caption: 'Retries with back-off and a dead-letter topic',
        code: `@Configuration
public class KafkaErrorConfig {

    @Bean
    DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(template);
        ExponentialBackOff backOff = new ExponentialBackOff(1000, 2.0);
        backOff.setMaxElapsedTime(10_000);                 // ~4 attempts over 10 s
        DefaultErrorHandler handler = new DefaultErrorHandler(recoverer, backOff);
        handler.addNotRetryableExceptions(ValidationException.class);   // pointless to retry
        return handler;
    }
}

@KafkaListener(topics = "orders.placed.dlt", groupId = "dlt-monitor")
public void deadLetters(OrderPlaced event,
                        @Header(KafkaHeaders.DLT_EXCEPTION_MESSAGE) String error) {
    log.error("Order event {} dead-lettered: {}", event.orderId(), error);
}`,
        output: `WARN  Retrying record orders.placed-3@7 (attempt 2) after SmtpTimeoutException
WARN  Retrying record orders.placed-3@7 (attempt 3)
ERROR Order event WN-10240 dead-lettered: Listener failed; SmtpTimeoutException: connect timed out
(the partition continues with the next record)`,
      },
      {
        caption: 'Integration test with a Kafka container',
        code: `@SpringBootTest
@Testcontainers
class OrderEventsIT {

    @Container
    @ServiceConnection
    static KafkaContainer kafka = new KafkaContainer("apache/kafka:4.1.0");

    @Autowired OrderEventsProducer producer;
    @MockitoBean MailService mail;

    @Test
    void emailIsSentWhenOrderIsPlaced() {
        producer.publish(new OrderPlaced("WN-1", "asha@webnest.in", new BigDecimal("2999"), Instant.now()));

        await().atMost(Duration.ofSeconds(10)).untilAsserted(() ->
            verify(mail).sendOrderConfirmation("asha@webnest.in", "WN-1", new BigDecimal("2999")));
    }
}`,
        output: `Container apache/kafka:4.1.0 started
OrderEventsIT > emailIsSentWhenOrderIsPlaced() PASSED (4.8 s)`,
      },
    ],
    commonMistakes: [
      'Depending only on spring-kafka in Spring Boot 4 instead of spring-boot-starter-kafka, losing auto-configuration.',
      'Using the Jackson 2 based JsonSerializer/JsonDeserializer in Boot 4 instead of JacksonJsonSerializer/JacksonJsonDeserializer.',
      'Writing non-idempotent consumers; redelivery after a crash then double-charges or double-emails.',
      'Sending events without a key when ordering per entity matters.',
      'Publishing to Kafka inside a database transaction and assuming both succeed or fail together; use an outbox.',
    ],
    keyPoints: [
      'Kafka stores events durably in partitioned topics; consumer groups read independently.',
      'spring-boot-starter-kafka provides KafkaTemplate and @KafkaListener with spring.kafka.* configuration.',
      'Use keys for per-entity ordering and acks=all with idempotent producers for reliability.',
      'Consumers must be idempotent; use DefaultErrorHandler with back-off and dead-letter topics.',
      'Use the transactional outbox for consistent database + Kafka updates, and test with KafkaContainer.',
    ],
  },

  'rabbitmq-with-spring-boot': {
    title: 'RabbitMQ with Spring Boot',
    intro: `RabbitMQ is a mature, widely deployed message broker built around queues and flexible routing. Where Kafka is a durable log for event streams, RabbitMQ shines at <strong>task distribution</strong> and <strong>routing</strong>: send a job to a queue and exactly one worker processes it; route messages by type or pattern to different queues; delay, prioritise, and dead-letter messages.

Spring AMQP, auto-configured by <code>spring-boot-starter-amqp</code>, gives you <code>RabbitTemplate</code> for sending and <code>@RabbitListener</code> for consuming. This lesson explains exchanges, queues and bindings, declares them in code, sends and receives JSON messages with Jackson 3, handles failures with retries and dead-letter queues, and implements request/reply.`,
    sections: [
      {
        heading: 'Exchanges, Queues and Bindings',
        body: `Producers never send directly to a queue; they publish to an <strong>exchange</strong> with a <strong>routing key</strong>. <strong>Bindings</strong> connect exchanges to queues with rules. Exchange types decide how routing works:`,
        list: [
          '<strong>Direct</strong> — deliver to queues whose binding key equals the routing key exactly.',
          '<strong>Topic</strong> — pattern matching on dot-separated keys: <code>order.*.created</code>, <code>order.#</code>.',
          '<strong>Fanout</strong> — broadcast to every bound queue, ignoring the key.',
          '<strong>Headers</strong> — route on message headers instead of the key.',
        ],
      },
      {
        heading: 'Declaring the Topology',
        body: `Declare <code>Queue</code>, <code>Exchange</code> and <code>Binding</code> beans (or use <code>QueueBuilder</code>/<code>ExchangeBuilder</code>/<code>BindingBuilder</code>). Spring's <code>RabbitAdmin</code> creates them on the broker at startup if they do not exist. Make queues durable so they survive broker restarts, and send persistent messages (the default in Spring AMQP).`,
      },
      {
        heading: 'Sending and Receiving JSON',
        body: `Register a <code>JacksonJsonMessageConverter</code> bean (the Jackson 3 converter in Spring AMQP 4; <code>Jackson2JsonMessageConverter</code> is deprecated) and Spring Boot applies it to both <code>RabbitTemplate</code> and listener containers. <code>convertAndSend(exchange, routingKey, object)</code> sends; a <code>@RabbitListener(queues = ...)</code> method with a typed parameter receives. Several instances listening to the same queue act as competing consumers — each message goes to one of them.`,
      },
      {
        heading: 'Acknowledgements, Retries and Dead Letters',
        body: `By default Spring acknowledges a message after the listener returns successfully and rejects it when the listener throws. Configure <code>spring.rabbitmq.listener.simple.retry.*</code> for in-process retries with back-off, and give the queue a <strong>dead-letter exchange</strong> so messages that still fail are moved to a DLQ instead of being redelivered forever. Throwing <code>AmqpRejectAndDontRequeueException</code> sends a message straight to the DLQ.`,
      },
      {
        heading: 'RabbitMQ or Kafka?',
        body: `Choose RabbitMQ for work queues, complex routing, per-message TTL and priority, and request/reply. Choose Kafka for high-throughput event streams, replaying history, and many independent consumers of the same events. Many systems use both.`,
      },
    ],
    examples: [
      {
        caption: 'Setup and topology declaration',
        code: `# compose.yaml
services:
  rabbitmq:
    image: rabbitmq:4-management
    ports:
      - "5672"
      - "15672:15672"      # management UI: http://localhost:15672 (guest/guest)

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE = "webnest.orders";
    public static final String INVOICE_QUEUE = "invoices.generate";

    @Bean
    TopicExchange ordersExchange() {
        return ExchangeBuilder.topicExchange(EXCHANGE).durable(true).build();
    }

    @Bean
    Queue invoiceQueue() {
        return QueueBuilder.durable(INVOICE_QUEUE)
            .deadLetterExchange("")                      // default exchange
            .deadLetterRoutingKey(INVOICE_QUEUE + ".dlq")
            .build();
    }

    @Bean
    Queue invoiceDlq() {
        return QueueBuilder.durable(INVOICE_QUEUE + ".dlq").build();
    }

    @Bean
    Binding invoiceBinding(Queue invoiceQueue, TopicExchange ordersExchange) {
        return BindingBuilder.bind(invoiceQueue).to(ordersExchange).with("order.*.paid");
    }

    @Bean
    MessageConverter jsonConverter() {
        return new JacksonJsonMessageConverter();
    }
}`,
        output: `Created exchange webnest.orders (topic), queues invoices.generate and invoices.generate.dlq, binding order.*.paid`,
      },
      {
        caption: 'Producer and competing consumers',
        code: `public record OrderPaid(String orderId, String customerEmail, BigDecimal amount) {}

@Service
public class PaymentEvents {

    private final RabbitTemplate rabbit;

    public PaymentEvents(RabbitTemplate rabbit) {
        this.rabbit = rabbit;
    }

    public void orderPaid(OrderPaid event, String channel) {
        // routing key like "order.web.paid" or "order.mobile.paid"
        rabbit.convertAndSend(RabbitConfig.EXCHANGE, "order." + channel + ".paid", event);
    }
}

@Component
public class InvoiceWorker {

    private static final Logger log = LoggerFactory.getLogger(InvoiceWorker.class);

    @RabbitListener(queues = RabbitConfig.INVOICE_QUEUE, concurrency = "2-5")
    public void generate(OrderPaid event) {
        log.info("Generating invoice for {} ({})", event.orderId(), event.amount());
        // ... create PDF, store it, email it
    }
}`,
        output: `orderPaid(WN-10231, "web")    -> routed by "order.web.paid" to invoices.generate
[worker-1] Generating invoice for WN-10231 (2999.00)
orderPaid(WN-10232, "mobile") -> routed by "order.mobile.paid"
[worker-2] Generating invoice for WN-10232 (1499.00)`,
      },
      {
        caption: 'Listener retries, then dead-lettering',
        code: `# application.yml
spring:
  rabbitmq:
    listener:
      simple:
        retry:
          enabled: true
          max-attempts: 4
          initial-interval: 1s
          multiplier: 2
        default-requeue-rejected: false     # after retries: dead-letter instead of requeue

@RabbitListener(queues = "invoices.generate.dlq")
public void inspect(OrderPaid failed, @Header(name = "x-death", required = false) List<Map<String, ?>> death) {
    log.error("Invoice for {} failed permanently; death info {}", failed.orderId(), death);
}`,
        output: `WARN  Retry 1/4 for WN-10240: PdfRenderingException
WARN  Retry 2/4 ...
ERROR Invoice for WN-10240 failed permanently; death info [{reason=rejected, queue=invoices.generate, count=1}]`,
      },
      {
        caption: 'Request/reply: synchronous RPC over RabbitMQ',
        code: `public record PriceQuote(String sku, BigDecimal price) {}

@Component
class PricingServer {
    @RabbitListener(queues = "pricing.requests")
    PriceQuote quote(String sku) {                        // return value is sent as the reply
        return new PriceQuote(sku, pricing.currentPrice(sku));
    }
}

// client
PriceQuote q = rabbit.convertSendAndReceiveAsType("", "pricing.requests", "HD-NAVY-M",
        new ParameterizedTypeReference<PriceQuote>() {});`,
        output: `PriceQuote[sku=HD-NAVY-M, price=1299.00]   (reply received via a temporary reply queue)`,
      },
    ],
    commonMistakes: [
      'Letting a failing message requeue forever, blocking the queue and burning CPU; configure retries and a dead-letter queue.',
      'Using the default Java serialization message converter instead of JSON, making messages unreadable to other languages.',
      'Declaring non-durable queues for important work, losing messages when the broker restarts.',
      'Assuming exactly-once delivery; consumers must be idempotent because redelivery can happen.',
      'Using RabbitMQ as a long-term event store; consumed messages are removed from the queue.',
    ],
    keyPoints: [
      'Producers publish to exchanges; bindings route messages to queues (direct, topic, fanout, headers).',
      'spring-boot-starter-amqp auto-configures RabbitTemplate and @RabbitListener containers.',
      'Use JacksonJsonMessageConverter (Jackson 3) for JSON messages in Spring AMQP 4.',
      'Configure listener retries plus dead-letter exchanges for failed messages.',
      'Pick RabbitMQ for task queues and routing, Kafka for replayable event streams.',
    ],
  },

  'sending-email': {
    title: 'Sending Email with Spring Boot',
    intro: `Email is still the primary channel for account verification, password resets, receipts, notifications and newsletters. Spring Boot makes sending email straightforward with <code>JavaMailSender</code>, but production email also needs HTML templates, attachments, asynchronous sending, a safe local test setup, and good deliverability.

This lesson covers configuring SMTP (Gmail, Amazon SES, SendGrid, Mailgun), sending plain-text and HTML emails, rendering templates with Thymeleaf, adding attachments and inline images, testing locally with Mailpit, and practices that keep your emails out of spam folders.`,
    sections: [
      {
        heading: 'Configuration',
        body: `Add <code>spring-boot-starter-mail</code> and set <code>spring.mail.host</code>, <code>port</code>, <code>username</code>, <code>password</code> and the TLS properties. Spring Boot then auto-configures a <code>JavaMailSender</code>. For Gmail you must use an app password, not your account password; transactional email providers (Amazon SES, SendGrid, Mailgun, Postmark) are the better choice for production volume and deliverability.`,
      },
      {
        heading: 'Simple and MIME Messages',
        body: `<code>SimpleMailMessage</code> covers plain-text emails. For HTML, attachments and inline images, create a <code>MimeMessage</code> and fill it with <code>MimeMessageHelper</code> in multipart mode. Always include a plain-text alternative alongside HTML; some clients and spam filters prefer it.`,
      },
      {
        heading: 'Templates',
        body: `Building HTML in Java strings is unmaintainable. Use Thymeleaf's <code>TemplateEngine</code> to render <code>templates/email/*.html</code> with a <code>Context</code> of variables, then pass the rendered HTML to the helper. Email HTML should use simple table layouts and inline styles, because many clients ignore external CSS.`,
      },
      {
        heading: 'Asynchronous and Reliable Sending',
        body: `SMTP calls take hundreds of milliseconds or more and can fail. Send from an <code>@Async</code> method or a message queue so user requests stay fast, send only after the database transaction commits (<code>@TransactionalEventListener</code>), and retry transient failures. For critical emails, record them in an outbox table and track delivery status.`,
      },
      {
        heading: 'Deliverability',
        body: `Configure SPF, DKIM and DMARC DNS records for your sending domain, send from a consistent address on your own domain, include an unsubscribe link in marketing email, and never send from a <code>no-reply@gmail.com</code>-style address. Monitor bounces and complaints through your provider.`,
      },
    ],
    examples: [
      {
        caption: 'Configuration with Mailpit for local testing',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

# compose.yaml — Mailpit catches all mail locally (web UI on http://localhost:8025)
services:
  mailpit:
    image: axllent/mailpit
    ports:
      - "1025:1025"
      - "8025:8025"

# application.yml (development)
spring:
  mail:
    host: localhost
    port: 1025

# application-prod.yml (e.g. Amazon SES SMTP)
spring:
  mail:
    host: email-smtp.ap-south-1.amazonaws.com
    port: 587
    username: \${SMTP_USER}
    password: \${SMTP_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
      mail.smtp.connectiontimeout: 5000
      mail.smtp.timeout: 5000`,
        output: `(Every email sent in development appears in the Mailpit inbox at http://localhost:8025 — nothing reaches real users.)`,
      },
      {
        caption: 'Plain text and HTML emails with an attachment',
        code: `@Service
public class MailService {

    private final JavaMailSender mailSender;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPlain(String to, String subject, String text) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom("Webnest Studio <hello@webneststudio.co.in>");
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);
        mailSender.send(msg);
    }

    public void sendInvoice(String to, String orderId, String html, byte[] pdf) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");  // multipart
        helper.setFrom("Webnest Studio <billing@webneststudio.co.in>");
        helper.setTo(to);
        helper.setSubject("Your invoice for order " + orderId);
        helper.setText("Your invoice is attached.", html);          // plain-text + HTML alternatives
        helper.addInline("logo", new ClassPathResource("static/img/logo.png"));
        helper.addAttachment("invoice-" + orderId + ".pdf", new ByteArrayResource(pdf), "application/pdf");
        mailSender.send(message);
    }
}`,
        output: `Mailpit inbox:
From: Webnest Studio <billing@webneststudio.co.in>
Subject: Your invoice for order WN-10231
Attachments: invoice-WN-10231.pdf (48 KB), inline logo.png`,
      },
      {
        caption: 'Thymeleaf email templates sent asynchronously after commit',
        code: `<!-- templates/email/welcome.html -->
<html xmlns:th="http://www.thymeleaf.org">
<body style="font-family: Arial, sans-serif">
  <table width="600" cellpadding="16">
    <tr><td>
      <h2 th:text="|Welcome, \${name}!|">Welcome!</h2>
      <p>Your first course is ready:</p>
      <a th:href="\${courseUrl}" style="background:#d4a017;color:#000;padding:10px 16px;text-decoration:none">
        Start learning
      </a>
    </td></tr>
  </table>
</body>
</html>

@Component
public class WelcomeEmailListener {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templates;

    public WelcomeEmailListener(JavaMailSender mailSender, SpringTemplateEngine templates) {
        this.mailSender = mailSender;
        this.templates = templates;
    }

    @Async
    @TransactionalEventListener
    public void onRegistered(UserRegisteredEvent e) throws MessagingException {
        Context ctx = new Context(Locale.ENGLISH);
        ctx.setVariable("name", e.name());
        ctx.setVariable("courseUrl", "https://www.webneststudio.co.in/learn/java-core");
        String html = templates.process("email/welcome", ctx);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(e.email());
        helper.setSubject("Welcome to Webnest Studio");
        helper.setText("Welcome, " + e.name() + "! Start learning: https://www.webneststudio.co.in/learn", html);
        mailSender.send(message);
    }
}`,
        output: `POST /api/auth/register -> 201 in 38 ms
(after commit, on task-3) welcome email rendered and sent to asha@webnest.in`,
      },
    ],
    commonMistakes: [
      'Sending email synchronously inside the request, making sign-up slow and failing it when SMTP is down.',
      'Sending emails inside a transaction that may roll back, so users receive emails for actions that never happened.',
      'Hard-coding SMTP passwords in application.yml.',
      'Using a real SMTP server during development and accidentally emailing real customers; use Mailpit.',
      'Sending HTML only without a plain-text part and without SPF/DKIM, hurting deliverability.',
    ],
    keyPoints: [
      'spring-boot-starter-mail auto-configures JavaMailSender from spring.mail.* properties.',
      'Use SimpleMailMessage for text; MimeMessageHelper for HTML, attachments and inline images.',
      'Render HTML emails with Thymeleaf templates and include a plain-text alternative.',
      'Send asynchronously and after commit; retry transient failures.',
      'Test with Mailpit locally and configure SPF, DKIM and DMARC in production.',
    ],
  },

  'websockets-and-stomp': {
    title: 'WebSockets and STOMP',
    intro: `HTTP is request/response: the server can only answer when the client asks. Chat, live notifications, collaborative editing, live dashboards and multiplayer quizzes need the server to <strong>push</strong> updates the moment something happens. WebSockets provide a persistent, two-way connection between browser and server for exactly this.

Spring Boot supports raw WebSockets, but most applications use <strong>STOMP</strong>, a simple messaging protocol on top of WebSocket that adds destinations, subscriptions and message routing. This lesson builds a live class chat and per-user notifications with <code>@EnableWebSocketMessageBroker</code>, <code>@MessageMapping</code> and <code>SimpMessagingTemplate</code>, secures it, and scales it across instances with an external broker.`,
    sections: [
      {
        heading: 'WebSocket, STOMP and SSE',
        body: `A WebSocket starts as an HTTP request that is "upgraded" to a long-lived TCP connection. STOMP frames on top of it carry a destination such as <code>/topic/class.42</code>, so the server can route messages much like a message broker. If you only need <strong>server → client</strong> updates (notifications, progress bars, streaming AI answers), <strong>Server-Sent Events</strong> over plain HTTP are simpler and work through all proxies; choose WebSockets when clients also send frequent messages.`,
      },
      {
        heading: 'Configuring the Message Broker',
        body: `With <code>spring-boot-starter-websocket</code>, implement <code>WebSocketMessageBrokerConfigurer</code> on a class annotated with <code>@EnableWebSocketMessageBroker</code>. Register a STOMP endpoint (e.g. <code>/ws</code>) that clients connect to, set the application destination prefix (<code>/app</code>) for messages handled by your controllers, and enable a simple in-memory broker for <code>/topic</code> (broadcast) and <code>/queue</code> (per-user) destinations.`,
      },
      {
        heading: 'Handling and Sending Messages',
        body: `<code>@MessageMapping("/chat.send")</code> handles messages sent by clients to <code>/app/chat.send</code>; <code>@SendTo("/topic/chat")</code> broadcasts the return value. <code>SimpMessagingTemplate</code> sends from anywhere in your code — a service, a Kafka listener, a scheduled job — with <code>convertAndSend(destination, payload)</code> or <code>convertAndSendToUser(user, "/queue/notifications", payload)</code> for a single user.`,
      },
      {
        heading: 'Security',
        body: `The WebSocket handshake is an HTTP request, so Spring Security authenticates it like any other (session cookie or token). Authorize individual STOMP messages and subscriptions with <code>@EnableWebSocketSecurity</code> and an <code>AuthorizationManager&lt;Message&lt;?&gt;&gt;</code> bean — for example, only enrolled students may subscribe to a class topic. Restrict allowed origins on the endpoint.`,
      },
      {
        heading: 'Scaling Out',
        body: `The simple broker lives in one JVM: a user connected to instance A does not receive messages sent on instance B. For multiple instances, use <code>enableStompBrokerRelay</code> with RabbitMQ's STOMP plugin (or ActiveMQ) so all instances share one broker.`,
      },
    ],
    examples: [
      {
        caption: 'Broker configuration',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("https://www.webneststudio.co.in", "http://localhost:5173");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");     // client -> @MessageMapping
        registry.enableSimpleBroker("/topic", "/queue");        // server -> subscribers
        registry.setUserDestinationPrefix("/user");
    }
}`,
        output: `Started WebSocket endpoint /ws; simple broker for [/topic, /queue]`,
      },
      {
        caption: 'Chat controller and server-initiated notifications',
        code: `public record ChatMessage(String from, String text, Instant sentAt) {}
public record IncomingChat(String text) {}

@Controller
public class ClassChatController {

    // client sends to /app/class/42/chat ; everyone subscribed to /topic/class/42 receives it
    @MessageMapping("/class/{classId}/chat")
    @SendTo("/topic/class/{classId}")
    public ChatMessage chat(@DestinationVariable long classId, IncomingChat in, Principal user) {
        return new ChatMessage(user.getName(), HtmlUtils.htmlEscape(in.text()), Instant.now());
    }
}

@Service
public class GradeNotifier {

    private final SimpMessagingTemplate messaging;

    public GradeNotifier(SimpMessagingTemplate messaging) {
        this.messaging = messaging;
    }

    // called from anywhere, e.g. after an instructor grades an assignment
    public void notifyGraded(String studentUsername, String assignment, int score) {
        messaging.convertAndSendToUser(studentUsername, "/queue/notifications",
            Map.of("type", "GRADED", "assignment", assignment, "score", score));
    }
}`,
        output: `asha sends {"text":"Is @Transactional needed here?"} to /app/class/42/chat
-> all 31 subscribers of /topic/class/42 receive {"from":"asha","text":"Is @Transactional needed here?","sentAt":"..."}

notifyGraded("asha", "JPA homework", 92)
-> only asha's browser receives {"type":"GRADED","assignment":"JPA homework","score":92}`,
      },
      {
        caption: 'Browser client with @stomp/stompjs',
        code: `// npm install @stomp/stompjs
import { Client } from '@stomp/stompjs';

const client = new Client({
  brokerURL: 'wss://www.webneststudio.co.in/ws',
  reconnectDelay: 5000,
  onConnect: () => {
    client.subscribe('/topic/class/42', (frame) => {
      const msg = JSON.parse(frame.body);
      console.log(msg.from + ': ' + msg.text);
    });
    client.subscribe('/user/queue/notifications', (frame) => {
      console.log('Notification', JSON.parse(frame.body));
    });
  },
});
client.activate();

function send(text) {
  client.publish({ destination: '/app/class/42/chat', body: JSON.stringify({ text }) });
}`,
        output: `asha: Is @Transactional needed here?
Notification {type: 'GRADED', assignment: 'JPA homework', score: 92}`,
      },
      {
        caption: 'Authorizing subscriptions and messages',
        code: `@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig {

    @Bean
    AuthorizationManager<Message<?>> messageAuthorization(
            MessageMatcherDelegatingAuthorizationManager.Builder messages) {
        return messages
            .nullDestMatcher().authenticated()                          // CONNECT, DISCONNECT
            .simpSubscribeDestMatchers("/topic/class/*").hasRole("STUDENT")
            .simpDestMatchers("/app/**").authenticated()
            .simpSubscribeDestMatchers("/user/queue/**").authenticated()
            .anyMessage().denyAll()
            .build();
    }
}`,
        output: `Anonymous SUBSCRIBE /topic/class/42 -> ERROR frame: Access denied
Student   SUBSCRIBE /topic/class/42 -> subscribed`,
      },
    ],
    commonMistakes: [
      'Using WebSockets for one-way server updates where Server-Sent Events would be simpler.',
      'Broadcasting user-supplied text without escaping, enabling stored XSS in every connected browser.',
      'Relying on the simple broker with multiple instances, so users on different instances miss messages.',
      'Leaving setAllowedOrigins("*") on authenticated endpoints.',
      'Forgetting that load balancers and proxies must be configured to allow WebSocket upgrades and long idle connections.',
    ],
    keyPoints: [
      'WebSockets give persistent two-way connections; STOMP adds destinations and subscriptions.',
      '@EnableWebSocketMessageBroker configures endpoints, /app prefixes and /topic and /queue brokers.',
      '@MessageMapping + @SendTo handle client messages; SimpMessagingTemplate pushes from anywhere.',
      'Secure the handshake with Spring Security and messages with @EnableWebSocketSecurity.',
      'Use a broker relay (e.g. RabbitMQ STOMP) to scale across instances.',
    ],
  },
}
