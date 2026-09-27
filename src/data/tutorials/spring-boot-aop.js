// Spring Boot course — Aspect-Oriented Programming lessons (Spring Boot 4,
// spring-boot-starter-aspectj). Keys are slugs matching the AOP module topics
// in codelabDefaults.js.
export const springBootAop = {
  'aspect-oriented-programming-aop-with-spring-boot': {
    title: 'Aspect-Oriented Programming (AOP) with Spring Boot',
    intro: `Some requirements cut across your whole application: log every service call, measure how long methods take, audit who changed what, check permissions, retry failed calls, translate exceptions. If you write that code inside every method, business logic drowns in repetition and a change to the logging format means editing hundreds of files. These are called <strong>cross-cutting concerns</strong>.

<strong>Aspect-Oriented Programming (AOP)</strong> lets you write a cross-cutting concern once, in an <strong>aspect</strong>, and declare <em>where</em> it applies. Spring itself uses AOP for <code>@Transactional</code>, <code>@Cacheable</code>, <code>@Async</code>, <code>@PreAuthorize</code> and <code>@Retryable</code>. In this lesson you will learn AOP terminology, set up Spring AOP in Spring Boot 4, write your first aspect, master pointcut expressions, and understand how Spring's proxy-based AOP works — including its limitations.`,
    sections: [
      {
        heading: 'AOP Terminology',
        body: `AOP has its own vocabulary. Once these terms click, the rest is straightforward:`,
        list: [
          '<strong>Aspect</strong> — a class that holds cross-cutting logic, annotated with <code>@Aspect</code> (e.g. <code>LoggingAspect</code>).',
          '<strong>Join point</strong> — a point during execution where an aspect can run. In Spring AOP this is always a <strong>method execution</strong> on a Spring bean.',
          '<strong>Advice</strong> — the code the aspect runs at a join point: before, after, after returning, after throwing, or around.',
          '<strong>Pointcut</strong> — an expression that selects join points, e.g. "all public methods in the service package".',
          '<strong>Target object</strong> — the bean being advised (your <code>OrderService</code>).',
          '<strong>Proxy</strong> — the object Spring creates around the target to run advice before/after delegating to it.',
          '<strong>Weaving</strong> — linking aspects with targets. Spring AOP weaves at runtime using proxies; full AspectJ can weave at compile or load time.',
        ],
      },
      {
        heading: 'Setting Up AOP in Spring Boot 4',
        body: `Add <code>spring-boot-starter-aspectj</code> (renamed from <code>spring-boot-starter-aop</code> in Spring Boot 4). It brings the AspectJ annotations and weaver library that Spring AOP uses to parse pointcut expressions, and Spring Boot enables <code>@EnableAspectJAutoProxy</code> automatically. Declare an aspect as a <code>@Component</code> with <code>@Aspect</code>, and Spring applies it to every matching bean at startup.`,
      },
      {
        heading: 'How Spring AOP Works: Proxies',
        body: `When a bean matches a pointcut, Spring does not modify its class. It creates a <strong>proxy</strong> — by default a CGLIB subclass in Spring Boot — and injects the proxy wherever the bean is needed. Calls go through the proxy, which runs the advice and then calls the real method.

This design has important consequences. Only <strong>Spring beans</strong> can be advised (not objects you create with <code>new</code>). Only method executions are join points (not field access or constructors). <strong>Self-invocation bypasses the proxy</strong>: if <code>placeOrder()</code> calls <code>this.validate()</code>, advice on <code>validate()</code> does not run. Final classes and final or private methods cannot be advised by CGLIB proxies. If you need any of these, full AspectJ weaving is the alternative — but for most applications Spring AOP is exactly enough.`,
      },
      {
        heading: 'Pointcut Expressions',
        body: `Pointcuts use the AspectJ expression language. The most useful designators are:`,
        list: [
          '<code>execution(* com.webnest.shop.service.*.*(..))</code> — any method of any class in the service package. Pattern: <code>execution(modifiers? returnType declaringType? methodName(params) throws?)</code>.',
          '<code>execution(public * *..*Service.find*(..))</code> — public methods starting with "find" in classes ending with "Service", in any package.',
          '<code>within(com.webnest.shop..*)</code> — every method of every type in a package and its sub-packages.',
          '<code>@annotation(com.webnest.shop.aop.LogExecutionTime)</code> — methods carrying a specific annotation (the cleanest, most explicit style).',
          '<code>@within(org.springframework.stereotype.Service)</code> — all methods of classes annotated with @Service.',
          '<code>bean(*Controller)</code> — beans whose name matches (Spring-specific).',
          '<code>args(java.lang.Long, ..)</code> — methods whose first argument is a Long; can also bind arguments to advice parameters.',
          'Combine with <code>&amp;&amp;</code>, <code>||</code> and <code>!</code>, and give reusable expressions a name with <code>@Pointcut</code>.',
        ],
      },
      {
        heading: 'When to Use AOP (and When Not To)',
        body: `AOP is ideal for concerns that are truly orthogonal to business logic and apply to many places: logging, metrics, auditing, security checks, retries, exception translation, multi-tenancy filters. Avoid hiding core business rules in aspects — a reader of <code>placeOrder()</code> should not need to discover that an aspect silently changes its result. Prefer annotation-based pointcuts (<code>@annotation(...)</code>) over broad package patterns so it is visible in the code which methods are affected.`,
      },
    ],
    examples: [
      {
        caption: 'Dependency (Spring Boot 4)',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aspectj</artifactId>   <!-- was spring-boot-starter-aop -->
</dependency>

// Gradle
implementation("org.springframework.boot:spring-boot-starter-aspectj")`,
        output: '(No @EnableAspectJAutoProxy needed — Spring Boot enables auto-proxying when AspectJ is on the classpath.)',
      },
      {
        caption: 'Your first aspect: log every service method call',
        code: `package com.webnest.shop.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Aspect
@Component
public class ServiceLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(ServiceLoggingAspect.class);

    @Before("execution(* com.webnest.shop.service.*.*(..))")
    public void logCall(JoinPoint joinPoint) {
        log.info("Calling {}.{} with {}",
            joinPoint.getSignature().getDeclaringType().getSimpleName(),
            joinPoint.getSignature().getName(),
            Arrays.toString(joinPoint.getArgs()));
    }
}

// A normal service — it contains no logging code at all
@Service
public class CourseService {
    public Course findBySlug(String slug) { ... }
    public Course enroll(Long studentId, String slug) { ... }
}`,
        output: `INFO ServiceLoggingAspect : Calling CourseService.findBySlug with [spring-boot]
INFO ServiceLoggingAspect : Calling CourseService.enroll with [7, spring-boot]`,
      },
      {
        caption: 'Reusable named pointcuts combined with && and ||',
        code: `@Aspect
@Component
public class Pointcuts {

    @Pointcut("within(com.webnest.shop.service..*)")
    public void inServiceLayer() {}

    @Pointcut("within(com.webnest.shop.web..*)")
    public void inWebLayer() {}

    @Pointcut("execution(* *..*Repository.delete*(..))")
    public void anyDelete() {}

    @Pointcut("@annotation(org.springframework.transaction.annotation.Transactional)")
    public void transactionalMethod() {}

    @Pointcut("inServiceLayer() && transactionalMethod()")
    public void transactionalService() {}
}

@Aspect
@Component
public class DeleteAuditAspect {

    // reference a pointcut declared in another class by its fully qualified name
    @Before("com.webnest.shop.aop.Pointcuts.anyDelete()")
    public void auditDelete(JoinPoint jp) {
        System.out.println("DELETE requested: " + jp.getSignature().toShortString()
            + " args=" + Arrays.toString(jp.getArgs()));
    }
}`,
        output: `DELETE requested: CourseRepository.deleteById(..) args=[12]`,
      },
      {
        caption: 'Seeing the proxy and the self-invocation limitation',
        code: `@Service
public class ReportService {

    public void generateAll() {
        System.out.println("generateAll");
        generateOne(1);          // self-call: goes to 'this', NOT through the proxy
    }

    public void generateOne(int id) {
        System.out.println("generateOne " + id);
    }
}

@Component
class ProxyDemo implements CommandLineRunner {

    private final ReportService reports;

    ProxyDemo(ReportService reports) {
        this.reports = reports;
    }

    @Override
    public void run(String... args) {
        System.out.println(reports.getClass().getName());
        reports.generateAll();   // advised
        reports.generateOne(2);  // advised
    }
}`,
        output: `com.webnest.shop.service.ReportService$$SpringCGLIB$$0
INFO Calling ReportService.generateAll with []
generateAll
generateOne 1                        <- no log line: self-invocation bypassed the proxy
INFO Calling ReportService.generateOne with [2]
generateOne 2`,
      },
    ],
    commonMistakes: [
      'Adding spring-boot-starter-aop in a Spring Boot 4 project — the starter is now spring-boot-starter-aspectj.',
      'Forgetting @Component on the @Aspect class, so Spring never registers the aspect.',
      'Expecting advice to run on self-invocations, private methods, final methods or objects created with new.',
      'Writing overly broad pointcuts like execution(* *(..)) that advise every bean, including Spring\'s own infrastructure, slowing startup and causing odd errors.',
      'Hiding important business rules in aspects where readers of the business code cannot see them.',
    ],
    keyPoints: [
      'AOP modularises cross-cutting concerns (logging, metrics, auditing, security) into aspects.',
      'Aspect = advice (what) + pointcut (where); in Spring AOP join points are bean method executions.',
      'Spring Boot 4 uses spring-boot-starter-aspectj; aspects are @Aspect @Component classes.',
      'Spring AOP is proxy-based: only external calls to public, non-final bean methods are advised.',
      'Prefer annotation-based pointcuts (@annotation) for explicit, readable targeting.',
    ],
  },

  'aop-advice-types-before-after-around-after-returning-and-after-throwing': {
    title: 'AOP Advice Types: Before, After, Around, After Returning and After Throwing',
    intro: `The advice type decides <strong>when</strong> your aspect code runs relative to the target method and <strong>what</strong> it can see or change. Spring AOP supports five kinds of advice, each suited to different jobs — from simply logging a call, to reading the return value, reacting to exceptions, or wrapping the whole call to measure time, retry, or cache results.

This lesson demonstrates each advice type with a runnable example on the same <code>BankAccountService</code>, then builds practical aspects you will use in real projects: an execution-time annotation, an audit aspect that records the logged-in user, and exception translation. It finishes with advice ordering when several aspects apply to the same method.`,
    sections: [
      {
        heading: 'The Five Advice Types',
        body: `Each advice annotation takes a pointcut expression:`,
        list: [
          '<code>@Before</code> — runs before the method. It can read arguments and can stop the call only by throwing an exception.',
          '<code>@AfterReturning(returning = "result")</code> — runs after the method returns normally; can read (not replace) the return value.',
          '<code>@AfterThrowing(throwing = "ex")</code> — runs when the method throws; can read the exception. The exception still propagates (unless another exception is thrown in its place).',
          '<code>@After</code> — runs after the method finishes, whether it returned or threw, like a <code>finally</code> block. It cannot see the result or exception.',
          '<code>@Around</code> — wraps the method. It receives a <code>ProceedingJoinPoint</code> and decides whether and when to call <code>proceed()</code>; it can change arguments, change the return value, catch exceptions, retry, or skip the call entirely.',
        ],
      },
      {
        heading: 'JoinPoint and ProceedingJoinPoint',
        body: `Every advice method can declare a <code>JoinPoint</code> parameter to inspect the call: <code>getSignature()</code> (method name and declaring type), <code>getArgs()</code> (argument values) and <code>getTarget()</code> (the real bean). <code>@Around</code> advice receives <code>ProceedingJoinPoint</code>, whose <code>proceed()</code> invokes the target method (or the next advice in the chain) and returns its result; <code>proceed(newArgs)</code> passes modified arguments.`,
      },
      {
        heading: 'Choosing the Right Advice',
        body: `Use the least powerful advice that does the job. Logging inputs: <code>@Before</code>. Logging results or publishing an event on success: <code>@AfterReturning</code>. Alerting on failures or translating exceptions: <code>@AfterThrowing</code>. Cleanup that must always run: <code>@After</code>. Timing, retries, caching, rate limiting, and anything that needs control over the invocation: <code>@Around</code>. <code>@Around</code> is the most flexible, but forgetting to call <code>proceed()</code> or to return its result silently breaks the target method.`,
      },
      {
        heading: 'Binding Arguments and Annotations',
        body: `Instead of reading <code>getArgs()</code> by index, bind values directly: <code>@Before("execution(* transfer(..)) &amp;&amp; args(from, to, amount)")</code> gives the advice typed parameters named <code>from</code>, <code>to</code> and <code>amount</code>. Likewise <code>@Around("@annotation(timed)")</code> binds the annotation instance so the advice can read its attributes.`,
      },
      {
        heading: 'Ordering Multiple Aspects',
        body: `When several aspects advise the same method, annotate aspect classes with <code>@Order</code>. The aspect with the <strong>lowest</strong> order value has the highest precedence: its "before" logic runs first and its "after" logic runs last — like nested layers of an onion. Spring's own <code>@Transactional</code> advice also takes part in this ordering, which matters if, for example, a retry aspect must wrap the transaction rather than run inside it.`,
      },
    ],
    examples: [
      {
        caption: 'The target service used in the examples',
        code: `@Service
public class BankAccountService {

    private final Map<String, BigDecimal> balances = new ConcurrentHashMap<>(Map.of(
        "ACC-1", new BigDecimal("5000"), "ACC-2", new BigDecimal("1200")));

    public BigDecimal balance(String account) {
        return balances.get(account);
    }

    public BigDecimal withdraw(String account, BigDecimal amount) {
        BigDecimal current = balances.get(account);
        if (current.compareTo(amount) < 0) {
            throw new InsufficientFundsException(account, amount);
        }
        BigDecimal updated = current.subtract(amount);
        balances.put(account, updated);
        return updated;
    }
}`,
        output: '(No logging, auditing or timing code — the aspects below add all of that.)',
      },
      {
        caption: 'All five advice types on the same method',
        code: `@Aspect
@Component
public class BankAdviceDemo {

    private static final String WITHDRAW = "execution(* com.webnest.bank.BankAccountService.withdraw(..))";

    @Before(WITHDRAW + " && args(account, amount)")
    public void before(String account, BigDecimal amount) {
        System.out.println("[Before] withdraw " + amount + " from " + account);
    }

    @AfterReturning(pointcut = WITHDRAW, returning = "newBalance")
    public void afterReturning(JoinPoint jp, BigDecimal newBalance) {
        System.out.println("[AfterReturning] new balance = " + newBalance);
    }

    @AfterThrowing(pointcut = WITHDRAW, throwing = "ex")
    public void afterThrowing(JoinPoint jp, InsufficientFundsException ex) {
        System.out.println("[AfterThrowing] " + ex.getMessage());
    }

    @After(WITHDRAW)
    public void after(JoinPoint jp) {
        System.out.println("[After] withdraw finished (success or failure)");
    }

    @Around(WITHDRAW)
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("[Around] before proceed");
        try {
            Object result = pjp.proceed();          // calls @Before advice, then the real method
            System.out.println("[Around] after proceed, result = " + result);
            return result;                          // must return the result!
        } catch (Throwable t) {
            System.out.println("[Around] caught " + t.getClass().getSimpleName() + ", rethrowing");
            throw t;
        }
    }
}

// calls
bank.withdraw("ACC-1", new BigDecimal("1000"));
bank.withdraw("ACC-2", new BigDecimal("9999"));`,
        output: `[Around] before proceed
[Before] withdraw 1000 from ACC-1
[AfterReturning] new balance = 4000
[After] withdraw finished (success or failure)
[Around] after proceed, result = 4000

[Around] before proceed
[Before] withdraw 9999 from ACC-2
[AfterThrowing] Insufficient funds in ACC-2 for 9999
[After] withdraw finished (success or failure)
[Around] caught InsufficientFundsException, rethrowing`,
      },
      {
        caption: '@Around in practice: a @LogExecutionTime annotation',
        code: `@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogExecutionTime {
    long warnAboveMs() default 500;
}

@Aspect
@Component
public class ExecutionTimeAspect {

    private static final Logger log = LoggerFactory.getLogger(ExecutionTimeAspect.class);

    @Around("@annotation(timed)")                 // binds the annotation instance
    public Object measure(ProceedingJoinPoint pjp, LogExecutionTime timed) throws Throwable {
        long start = System.nanoTime();
        try {
            return pjp.proceed();
        } finally {
            long ms = (System.nanoTime() - start) / 1_000_000;
            String method = pjp.getSignature().toShortString();
            if (ms > timed.warnAboveMs()) {
                log.warn("{} took {} ms (limit {} ms)", method, ms, timed.warnAboveMs());
            } else {
                log.info("{} took {} ms", method, ms);
            }
        }
    }
}

@Service
public class ReportService {
    @LogExecutionTime(warnAboveMs = 200)
    public SalesReport monthly(YearMonth month) { ... }
}`,
        output: `INFO  ExecutionTimeAspect : ReportService.monthly(..) took 84 ms
WARN  ExecutionTimeAspect : ReportService.monthly(..) took 912 ms (limit 200 ms)`,
      },
      {
        caption: '@AfterReturning for auditing with the logged-in user',
        code: `@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Audited {
    String action();
}

@Aspect
@Component
public class AuditAspect {

    private final AuditRepository audit;

    public AuditAspect(AuditRepository audit) {
        this.audit = audit;
    }

    @AfterReturning(pointcut = "@annotation(audited)", returning = "result")
    public void record(JoinPoint jp, Audited audited, Object result) {
        String user = Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
            .map(Authentication::getName).orElse("system");
        audit.save(new AuditEntry(audited.action(), user, Arrays.toString(jp.getArgs()), Instant.now()));
    }
}

@Service
public class CourseAdminService {
    @Audited(action = "COURSE_PRICE_CHANGED")
    @Transactional
    public Course changePrice(String slug, BigDecimal price) { ... }
}`,
        output: `select * from audit_entry;
 action               | username          | details              | created_at
 COURSE_PRICE_CHANGED | admin@webnest.in  | [spring-boot, 2499]  | 2026-09-27 11:02:44`,
      },
      {
        caption: '@AfterThrowing for exception translation, and aspect ordering',
        code: `// Translate low-level persistence errors from repositories into a domain exception
@Aspect
@Component
@Order(1)                                   // outermost
public class RepositoryExceptionAspect {

    @AfterThrowing(pointcut = "within(com.webnest.shop..*Repository+)", throwing = "ex")
    public void translate(JoinPoint jp, DataIntegrityViolationException ex) {
        throw new DuplicateResourceException("Conflict in " + jp.getSignature().getName(), ex);
    }
}

@Aspect
@Component
@Order(2)                                   // runs inside RepositoryExceptionAspect
public class RepositoryTimingAspect {

    @Around("within(com.webnest.shop..*Repository+)")
    public Object time(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.nanoTime();
        try {
            return pjp.proceed();
        } finally {
            System.out.println(pjp.getSignature().toShortString() + " " + (System.nanoTime() - start) / 1000 + " µs");
        }
    }
}`,
        output: `CourseRepository.save(..) 1840 µs
-> DuplicateResourceException: Conflict in save   (instead of a raw DataIntegrityViolationException)

Order of execution: Order(1) before → Order(2) before → method → Order(2) after → Order(1) after`,
      },
    ],
    commonMistakes: [
      'Forgetting to return the value of proceed() in @Around advice, so every advised method returns null.',
      'Swallowing exceptions in @Around advice (catching Throwable and not rethrowing), hiding real failures.',
      'Expecting @AfterThrowing to stop the exception — it only observes it unless you throw a different exception.',
      'Using @Around when @Before or @AfterReturning would do; more power means more ways to break the target.',
      'Declaring an advice parameter type (e.g. InsufficientFundsException) and being surprised it does not run for other exception types — the parameter type also filters.',
    ],
    keyPoints: [
      '@Before runs first; @AfterReturning sees the result; @AfterThrowing sees the exception; @After always runs.',
      '@Around wraps the call via ProceedingJoinPoint.proceed() and can change arguments, results or exceptions.',
      'Bind arguments with args(...) and annotations with @annotation(name) for typed advice parameters.',
      'Custom annotations + @Around/@AfterReturning give clean timing and auditing aspects.',
      'Order aspects with @Order: the lowest value is the outermost layer.',
    ],
  },
}
