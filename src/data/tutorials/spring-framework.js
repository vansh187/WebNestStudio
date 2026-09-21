// Spring Framework module — hand-written lesson content.
// Keys are fixed slugs for the Spring Framework learning module.
export const springFrameworkContent = {
  'ioc-and-dependency-injection': {
    title: 'IoC and Dependency Injection in Spring',
    intro: `Inversion of Control (IoC) is the central design principle behind the Spring Framework. In a traditional program, an object creates and manages the objects it depends on — a service class might call "new OrderRepository()" directly inside its own constructor. IoC flips this: the object no longer creates its dependencies; instead, some external container creates them and hands them to the object. Spring's IoC container is that external mechanism, and Dependency Injection (DI) is the specific technique it uses to supply those dependencies.

The benefit is not just less "new" typing — it is decoupling. When a class receives its collaborators from outside rather than constructing them itself, it becomes trivial to swap implementations (a real payment gateway for a test double), configure behavior differently per environment, and unit test classes in isolation. Spring's container reads configuration (annotations or XML), builds a graph of objects called beans, wires their dependencies together, and manages their entire lifecycle.`,
    sections: [
      {
        heading: 'The IoC Container',
        body: `Spring's IoC container is responsible for instantiating, configuring, and assembling beans. It reads metadata — typically Java annotations like <code>@Component</code> and <code>@Autowired</code>, or older XML bean definitions — to know what objects to create and how they depend on one another. The two main container interfaces are <code>BeanFactory</code> (the basic container) and <code>ApplicationContext</code> (the more feature-rich container almost every real application uses). Once the container starts, it builds the entire dependency graph up front for singleton beans, resolving each dependency before the object is considered ready to use.`,
      },
      {
        heading: 'Constructor Injection',
        body: `Constructor injection supplies dependencies as arguments to the class's constructor. Spring's team and documentation recommend this as the default choice because it lets fields be declared <code>final</code>, guarantees the object is never in a partially-constructed, dependency-less state, and makes required dependencies explicit and impossible to forget. With a single constructor, <code>@Autowired</code> is not even required — Spring infers it automatically.`,
      },
      {
        heading: 'Setter Injection',
        body: `Setter injection supplies dependencies through public setter methods after the object has been constructed with a no-argument (or partial) constructor. This is useful for optional dependencies that have a sensible default, or when a dependency needs to be reconfigured after construction. The tradeoff is that the object can briefly exist in an incomplete state before all setters are called.`,
      },
      {
        heading: 'Field Injection',
        body: `Field injection applies <code>@Autowired</code> directly to a class field, letting Spring set it via reflection. It looks the shortest to write, but it is now widely discouraged: fields cannot be made <code>final</code>, the class cannot be instantiated normally outside a Spring container (making plain unit tests harder), and missing dependencies only surface at runtime rather than at compile or object-construction time.`,
        list: [
          '<strong>Constructor injection</strong> — required dependencies, immutable fields, best testability.',
          '<strong>Setter injection</strong> — optional dependencies, reconfigurable after construction.',
          '<strong>Field injection</strong> — most concise, but hurts testability and hides missing dependencies until runtime.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Constructor injection wiring a service to a repository',
        code: `import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Repository
class OrderRepository {
    String findLatestOrderId() {
        return "ORD-1042";
    }
}

@Service
class OrderService {

    private final OrderRepository orderRepository;

    // A single constructor means @Autowired is optional here,
    // but Spring still performs constructor injection automatically.
    @Autowired
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public void printLatestOrder() {
        System.out.println("Latest order: " + orderRepository.findLatestOrderId());
    }
}`,
        output: `Spring creates the OrderRepository bean first, injects it into OrderService's constructor,
and calling printLatestOrder() prints: "Latest order: ORD-1042"`,
      },
      {
        caption: 'Setter injection for an optional dependency',
        code: `import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
class NotificationService {

    private EmailSender emailSender;

    @Autowired(required = false)
    public void setEmailSender(EmailSender emailSender) {
        this.emailSender = emailSender;
    }

    public void notifyUser(String message) {
        if (emailSender != null) {
            emailSender.send(message);
        } else {
            System.out.println("No email sender configured, skipping: " + message);
        }
    }
}`,
        output: `If no EmailSender bean exists in the context, notifyUser("Order shipped") prints:
"No email sender configured, skipping: Order shipped"`,
      },
    ],
    commonMistakes: [
      'Overusing field injection with @Autowired directly on fields, which makes classes impossible to construct with plain "new" in unit tests without reflection.',
      'Creating circular dependencies (Bean A needs Bean B, Bean B needs Bean A) via constructor injection, which fails at startup rather than lazily resolving.',
      'Forgetting that constructor injection requires Spring to manage the object — manually instantiating a class with "new" bypasses the container and injects nothing.',
      'Mixing multiple constructors without marking the intended one with @Autowired, leaving Spring unable to decide which constructor to use.',
    ],
    keyPoints: [
      'IoC means the container creates and wires objects, instead of objects creating their own dependencies.',
      'Constructor injection is the recommended default: immutable, explicit, and fully testable without a container.',
      'Setter injection suits optional dependencies; field injection is easiest to write but weakest for testing.',
      'The IoC container resolves the full dependency graph based on annotations or XML metadata before beans are used.',
    ],
  },

  beans: {
    title: 'Spring Beans',
    intro: `A "bean" in Spring is simply an object that the IoC container instantiates, configures, and manages on your behalf, as opposed to an object you create yourself with "new". Beans are the fundamental building blocks of a Spring application — controllers, services, repositories, and configuration objects are all beans once the container is responsible for their lifecycle.

Spring identifies which classes should become beans primarily through stereotype annotations, and it controls how many instances of a bean exist and how long they live through bean scopes. Understanding both of these — stereotypes and scopes — is essential before touching more advanced Spring features, because nearly everything else in the framework (AOP, transactions, MVC controllers) operates on beans that the container already manages.`,
    sections: [
      {
        heading: 'Stereotype Annotations',
        body: `Spring provides several specialized annotations that mark a class as a candidate for auto-detection and registration as a bean. All of them are built on top of the generic <code>@Component</code> annotation, but using the more specific one communicates intent and, for some, adds extra behavior.`,
        list: [
          '<code>@Component</code> — the generic stereotype; any class annotated with it becomes a bean during component scanning.',
          '<code>@Service</code> — marks a class that holds business logic; semantically identical to @Component but clarifies the layer.',
          '<code>@Repository</code> — marks a data-access class; Spring also translates its persistence-related exceptions into Spring\'s unchecked DataAccessException hierarchy.',
          '<code>@Controller</code> / <code>@RestController</code> — marks a class as a Spring MVC web endpoint handler; @RestController combines @Controller with @ResponseBody.',
        ],
      },
      {
        heading: 'Bean Scopes',
        body: `A bean's scope determines how many instances of it the container creates and how long each instance lives. The two scopes used in the vast majority of applications are <code>singleton</code> and <code>prototype</code>.`,
        list: [
          '<strong>singleton</strong> (default) — exactly one shared instance per Spring container, created once and reused for every injection point.',
          '<strong>prototype</strong> — a brand-new instance is created every time the bean is requested from the container or injected elsewhere.',
          'Web-aware scopes also exist — <code>request</code>, <code>session</code>, and <code>application</code> — but only apply in a web application context.',
        ],
      },
      {
        heading: 'Declaring Scope Explicitly',
        body: `Scope is set with the <code>@Scope</code> annotation, most commonly <code>@Scope("singleton")</code> or <code>@Scope("prototype")</code>, applied on the same class as the stereotype annotation. Because singleton beans are shared, they must be designed to be stateless or thread-safe; prototype beans are safer for holding request-specific mutable state, but the container does not manage their destruction callbacks the way it does for singletons.`,
      },
    ],
    examples: [
      {
        caption: 'A singleton service bean and a prototype bean requested twice',
        code: `import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
@Scope("prototype")
class ShoppingCart {
    // Each injection/lookup gets a new instance.
}

@Service
class CheckoutService {
    // Default scope is singleton: one shared instance for the whole app.
}

@Configuration
@ComponentScan(basePackages = "com.webnest.beansdemo")
class AppConfig { }

public class BeanScopeDemo {
    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

        ShoppingCart cart1 = context.getBean(ShoppingCart.class);
        ShoppingCart cart2 = context.getBean(ShoppingCart.class);
        System.out.println("Prototype beans equal? " + (cart1 == cart2));

        CheckoutService service1 = context.getBean(CheckoutService.class);
        CheckoutService service2 = context.getBean(CheckoutService.class);
        System.out.println("Singleton beans equal? " + (service1 == service2));
    }
}`,
        output: `Prototype beans equal? false
Singleton beans equal? true`,
      },
    ],
    commonMistakes: [
      'Assuming @Service, @Repository, and @Controller behave completely differently from @Component — functionally they are almost the same, differing mainly in semantics and (for @Repository) exception translation.',
      'Injecting a prototype-scoped bean into a singleton bean directly and expecting a fresh instance on every use — the singleton only receives the prototype once, at its own creation, unless a proxy or ObjectFactory/Provider is used.',
      'Storing per-request mutable state in a singleton bean\'s fields, causing data to leak between unrelated requests or threads.',
      'Forgetting that prototype beans do not get their @PreDestroy lifecycle callback invoked automatically by the container — cleanup must be handled manually.',
    ],
    keyPoints: [
      '@Component, @Service, @Repository, and @Controller/@RestController are stereotype annotations that register a class as a Spring bean.',
      'Singleton is the default scope: one instance shared across the entire container.',
      'Prototype scope creates a new instance on every request for that bean.',
      'Singleton beans must be stateless or thread-safe since they are shared across the whole application.',
    ],
  },

  'application-context': {
    title: 'ApplicationContext vs BeanFactory',
    intro: `Every Spring application is backed by a container that holds and manages beans. Spring actually offers two levels of container abstraction: the low-level <code>BeanFactory</code> interface, and the more capable <code>ApplicationContext</code> interface that extends it. Nearly every real Spring application — and certainly every Spring Boot application — uses an ApplicationContext, but understanding the distinction clarifies what the container is actually doing under the hood.

BeanFactory represents the most basic form of IoC container: it can create beans and resolve their dependencies, but that's essentially all it does, and it uses lazy initialization by default. ApplicationContext builds on top of BeanFactory and adds enterprise-level services — event publishing, internationalization support, AOP integration, environment/property abstraction, and eager initialization of singleton beans at startup — which is why it is the standard choice in practice.`,
    sections: [
      {
        heading: 'BeanFactory — the Core Container',
        body: `<code>BeanFactory</code> is the root interface for accessing a Spring IoC container. It provides basic dependency injection capability and lazily initializes beans — meaning a bean is not actually created until it is first requested via <code>getBean()</code>. This lazy behavior can be useful for very resource-constrained environments, but it also means configuration errors in a bean definition might not surface until much later in the application's life, when that specific bean is finally requested.`,
      },
      {
        heading: 'ApplicationContext — the Full-Featured Container',
        body: `<code>ApplicationContext</code> extends BeanFactory and adds capabilities that almost every non-trivial application needs: automatic BeanPostProcessor and BeanFactoryPostProcessor registration, message resolution for internationalization (i18n), an event publication mechanism (<code>ApplicationEventPublisher</code>), and access to the Environment abstraction for reading properties and active profiles. Crucially, ApplicationContext eagerly instantiates all singleton beans at startup, which surfaces configuration problems immediately rather than at some unpredictable later point.`,
        list: [
          '<code>ClassPathXmlApplicationContext</code> — loads XML bean definitions from the classpath (legacy XML-based configuration).',
          '<code>AnnotationConfigApplicationContext</code> — loads beans from Java @Configuration classes, the standard approach in modern Spring.',
          '<code>WebApplicationContext</code> — a specialization used within web applications, tied to the servlet lifecycle; Spring Boot configures this automatically.',
        ],
      },
      {
        heading: 'Why ApplicationContext Is the Practical Default',
        body: `In real projects you almost never instantiate a raw BeanFactory directly. Spring Boot's <code>SpringApplication.run()</code>, for instance, builds and returns a fully configured ApplicationContext behind the scenes. The eager singleton instantiation, built-in event system, and environment/profile support make ApplicationContext the correct choice for anything beyond an educational example of the bare container.`,
      },
    ],
    examples: [
      {
        caption: 'Bootstrapping an ApplicationContext from Java configuration',
        code: `import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class AppConfig {
    @Bean
    public GreetingService greetingService() {
        return new GreetingService("Welcome to Spring");
    }
}

class GreetingService {
    private final String message;
    GreetingService(String message) { this.message = message; }
    void greet() { System.out.println(message); }
}

public class ContextDemo {
    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        // Singleton beans, including greetingService, are already created by this point.
        GreetingService service = context.getBean(GreetingService.class);
        service.greet();
    }
}`,
        output: 'Welcome to Spring',
      },
    ],
    commonMistakes: [
      'Assuming BeanFactory and ApplicationContext behave identically regarding initialization timing — BeanFactory is lazy by default, ApplicationContext eagerly creates singletons at startup.',
      'Manually instantiating BeanFactory in a modern application instead of relying on ApplicationContext (or Spring Boot\'s auto-configured context), losing event handling, i18n, and environment support.',
      'Forgetting to close a manually created ApplicationContext (via try-with-resources or context.close()) in a standalone application, leaving resources like connection pools unreleased.',
      'Confusing WebApplicationContext with a plain ApplicationContext when working with servlet-scoped beans (request/session scope), which only work inside a genuine web context.',
    ],
    keyPoints: [
      'BeanFactory is the basic IoC container: lazy bean initialization, minimal features.',
      'ApplicationContext extends BeanFactory and adds events, i18n, environment/profile support, and eager singleton initialization.',
      'AnnotationConfigApplicationContext is the standard way to bootstrap a context from Java @Configuration classes.',
      'Spring Boot always wires up an ApplicationContext (a WebApplicationContext for web apps) automatically.',
    ],
  },

  'component-scanning': {
    title: 'Component Scanning with @ComponentScan',
    intro: `Component scanning is the mechanism Spring uses to automatically discover classes annotated with stereotype annotations (@Component, @Service, @Repository, @Controller) and register them as beans, without you having to declare each one manually with a <code>@Bean</code> method. Instead of writing explicit bean definitions for every class, you annotate the classes themselves and tell Spring which packages to scan.

This "convention over configuration" approach is what makes modern Spring applications concise. The <code>@ComponentScan</code> annotation, usually placed on a <code>@Configuration</code> class, drives this discovery process, and choosing the right base package(s) is important both for correctness (finding all the beans you actually need) and for startup performance (not scanning far more of the classpath than necessary).`,
    sections: [
      {
        heading: 'How @ComponentScan Works',
        body: `When the container starts, <code>@ComponentScan</code> tells Spring to walk the specified package(s) and their sub-packages, looking for classes annotated with @Component or any annotation that is itself meta-annotated with @Component (which is how @Service, @Repository, and @Controller are recognized). Each matching class is registered as a bean definition, and its scope, dependencies, and lifecycle are then managed exactly like any other bean.`,
      },
      {
        heading: 'Specifying Base Packages',
        body: `Without arguments, <code>@ComponentScan</code> scans the package of the class it's declared on, plus all sub-packages. In many small projects this is exactly what's wanted, since the main configuration/application class often sits at the root of the project's package tree — which is precisely why Spring Boot's <code>@SpringBootApplication</code> (which includes @ComponentScan) works "automatically" as long as your classes live under the main class's package.`,
        list: [
          '<code>@ComponentScan</code> — scans the current package and sub-packages by default.',
          '<code>@ComponentScan("com.webnest.app")</code> — scans a single named base package explicitly.',
          '<code>@ComponentScan(basePackages = {"com.webnest.service", "com.webnest.repository"})</code> — scans multiple explicit base packages.',
          '<code>@ComponentScan(basePackageClasses = OrderService.class)</code> — a type-safe alternative that scans the package containing that class, refactor-safe against package renames.',
        ],
      },
      {
        heading: 'Common Pitfalls with Package Placement',
        body: `If a @Component-annotated class lives outside the scanned base package(s), Spring simply never finds it — no error is thrown, the bean is just silently absent from the context, and any attempt to @Autowired it elsewhere fails with a "NoSuchBeanDefinitionException" or a similar wiring failure. This is one of the most common real-world Spring bugs, especially after refactoring package structures.`,
      },
    ],
    examples: [
      {
        caption: 'Explicit multi-package component scanning',
        code: `import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

// com.webnest.service.PricingService
@Service
class PricingService {
    double applyTax(double amount) {
        return amount * 1.08;
    }
}

@Configuration
@ComponentScan(basePackages = {"com.webnest.service", "com.webnest.repository"})
class AppConfig { }

public class ScanDemo {
    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        PricingService pricing = context.getBean(PricingService.class);
        System.out.println(pricing.applyTax(100.0));
    }
}`,
        output: '108.0',
      },
    ],
    commonMistakes: [
      'Placing a @Component/@Service/@Repository class in a package outside the scanned base packages, resulting in a silent missing-bean error at injection time rather than at the class declaration.',
      'Scanning an overly broad base package (e.g. the entire "com" root) which slows startup and can accidentally pick up unrelated or test-only components.',
      'Forgetting that @ComponentScan with no arguments only scans the package of the annotated class and its sub-packages, not the whole project.',
      'Relying on @ComponentScan while also expecting classes annotated only with plain @Bean-producing methods elsewhere to be picked up automatically — @Bean methods still require their @Configuration class to be scanned or explicitly registered.',
    ],
    keyPoints: [
      '@ComponentScan automatically discovers and registers classes carrying stereotype annotations as beans.',
      'By default it scans the package of the annotated class and everything beneath it.',
      'basePackages (strings) and basePackageClasses (type-safe) let you target specific package trees explicitly.',
      'A component outside the scanned packages is silently skipped — no compile or startup error, just a missing bean.',
    ],
  },

  configuration: {
    title: 'Spring Configuration: Java Config vs XML Config',
    intro: `Every Spring application needs a way to tell the container what beans to create and how they relate to each other. Historically, Spring used verbose XML files for this. Modern Spring strongly favors Java-based configuration using the <code>@Configuration</code> and <code>@Bean</code> annotations, which lets you define beans with ordinary, type-checked Java code instead of XML markup.

Both approaches ultimately produce the same result — a populated IoC container — so understanding XML configuration still matters for reading legacy codebases, but nearly all new Spring and Spring Boot projects are written entirely with Java configuration (often combined with component scanning so most beans need no explicit @Bean method at all).`,
    sections: [
      {
        heading: 'Java Configuration with @Configuration and @Bean',
        body: `A class annotated with <code>@Configuration</code> is itself treated as a source of bean definitions. Each method inside it annotated with <code>@Bean</code> tells Spring: "call this method, and register whatever it returns as a bean, named after the method by default." Spring processes @Configuration classes specially (via CGLIB proxying) so that calling one @Bean method from another within the same class still returns the same singleton instance rather than creating a duplicate object.`,
      },
      {
        heading: 'XML-Based Configuration',
        body: `In XML configuration, beans are declared inside a <code>&lt;beans&gt;</code> root element using <code>&lt;bean id="..." class="..."&gt;</code> tags, with dependencies wired using nested <code>&lt;constructor-arg&gt;</code> or <code>&lt;property&gt;</code> elements. This style predates annotations and is still found in older enterprise codebases, loaded via <code>ClassPathXmlApplicationContext</code>. It has no compile-time type checking — a typo in a class name or property is only caught when the context starts.`,
        list: [
          'Java config: type-safe, refactor-friendly, supports full IDE navigation and debugging.',
          'XML config: no recompilation needed to change wiring, but no compile-time safety and more verbose.',
          'Both can be mixed via @ImportResource to load legacy XML into a Java-configured application.',
        ],
      },
      {
        heading: 'Choosing Between Explicit @Bean Methods and Component Scanning',
        body: `Use @Bean methods inside @Configuration classes for objects you don't own or can't annotate directly — third-party library classes, or beans that need conditional/complex construction logic. Use stereotype annotations (@Component, @Service, etc.) with @ComponentScan for your own application classes, since it removes the need for a separate @Bean method per class. Most real Spring applications use a combination of both.`,
      },
    ],
    examples: [
      {
        caption: 'Java-based configuration with two related @Bean methods',
        code: `import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

class DataSourceConfig {
    String url;
    DataSourceConfig(String url) { this.url = url; }
}

class UserRepository {
    private final DataSourceConfig dataSourceConfig;
    UserRepository(DataSourceConfig dataSourceConfig) { this.dataSourceConfig = dataSourceConfig; }
    void connect() { System.out.println("Connecting to " + dataSourceConfig.url); }
}

@Configuration
class AppConfig {

    @Bean
    public DataSourceConfig dataSourceConfig() {
        return new DataSourceConfig("jdbc:h2:mem:webnest");
    }

    @Bean
    public UserRepository userRepository() {
        // Calling dataSourceConfig() here returns the SAME singleton instance,
        // not a new one, because @Configuration classes are CGLIB-proxied.
        return new UserRepository(dataSourceConfig());
    }
}

public class JavaConfigDemo {
    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        context.getBean(UserRepository.class).connect();
    }
}`,
        output: 'Connecting to jdbc:h2:mem:webnest',
      },
    ],
    commonMistakes: [
      'Calling a @Bean method with plain Java semantics in mind and assuming it creates a new object each time — inside an @Configuration class it is intercepted to return the existing singleton.',
      'Forgetting the class-name/property typos in XML configuration are only caught at context startup, not at compile time, unlike Java @Bean methods.',
      'Mixing @Component-scanned beans and manually defined @Bean beans of the same type without a qualifier, causing an ambiguous dependency error.',
      'Annotating a @Configuration class\'s @Bean methods as private or final, which breaks the CGLIB proxying Spring relies on for singleton correctness.',
    ],
    keyPoints: [
      '@Configuration + @Bean is the modern, type-safe way to declare beans in Java code.',
      'XML configuration (<bean> tags loaded via ClassPathXmlApplicationContext) is the legacy approach, still seen in older codebases.',
      '@Configuration classes are proxied so that inter-method @Bean calls still return the same singleton instance.',
      'Use @Bean for third-party or conditionally constructed objects; use stereotype annotations + @ComponentScan for your own classes.',
    ],
  },

  'bean-lifecycle': {
    title: 'Spring Bean Lifecycle',
    intro: `A Spring bean does not simply appear fully formed — the container walks it through a well-defined sequence of steps from instantiation to eventual destruction. Understanding this lifecycle matters whenever a bean needs to perform setup work after all its dependencies are injected (like opening a connection pool) or cleanup work before the application shuts down (like closing that pool).

Spring exposes several ways to hook into this lifecycle: the <code>@PostConstruct</code> and <code>@PreDestroy</code> annotations (the modern, framework-agnostic approach from Jakarta/Java EE), and the <code>InitializingBean</code> and <code>DisposableBean</code> interfaces (Spring's original, interface-based approach). Both accomplish the same goal, but differ in how tightly they couple your class to the Spring API.`,
    sections: [
      {
        heading: 'The Full Lifecycle Sequence',
        body: `In broad strokes, the container: (1) instantiates the bean by calling its constructor, (2) populates its properties via dependency injection, (3) calls any <code>Aware</code> interface methods (like BeanNameAware) if implemented, (4) invokes BeanPostProcessor "before initialization" callbacks, (5) calls the initialization callback (@PostConstruct or afterPropertiesSet()), (6) invokes BeanPostProcessor "after initialization" callbacks, and finally the bean is ready for use. On container shutdown, destruction callbacks (@PreDestroy or destroy()) run in reverse.`,
      },
      {
        heading: '@PostConstruct and @PreDestroy',
        body: `<code>@PostConstruct</code> marks a method to be run once, right after dependency injection is complete, making it the ideal place for setup logic that depends on injected collaborators being available. <code>@PreDestroy</code> marks a method to run just before the container destroys the bean (for singleton beans, this happens on graceful context shutdown). These annotations come from the Jakarta Annotations specification, not Spring itself, which keeps the annotated class portable across frameworks.`,
      },
      {
        heading: 'InitializingBean and DisposableBean',
        body: `Implementing <code>InitializingBean</code> requires overriding <code>afterPropertiesSet()</code>, called at the same point in the lifecycle as @PostConstruct. Implementing <code>DisposableBean</code> requires overriding <code>destroy()</code>, called at the same point as @PreDestroy. These interfaces tie the class directly to Spring's API, which is why @PostConstruct/@PreDestroy are generally preferred in modern code — but the interface approach avoids any dependency on annotation processing and can be marginally faster since Spring checks the interface directly instead of scanning for annotations.`,
        list: [
          '<code>@PostConstruct</code> / <code>@PreDestroy</code> — annotation-based, framework-agnostic, the common modern choice.',
          '<code>InitializingBean.afterPropertiesSet()</code> / <code>DisposableBean.destroy()</code> — interface-based, tightly coupled to Spring.',
          'Prototype-scoped beans receive initialization callbacks but NOT destruction callbacks from the container automatically.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A bean using both @PostConstruct/@PreDestroy and the Spring lifecycle interfaces',
        code: `import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

class ConnectionPool implements InitializingBean, DisposableBean {

    @PostConstruct
    public void openPool() {
        System.out.println("1. @PostConstruct: pool opened");
    }

    @Override
    public void afterPropertiesSet() {
        System.out.println("2. InitializingBean: afterPropertiesSet");
    }

    @PreDestroy
    public void closePool() {
        System.out.println("3. @PreDestroy: pool closing");
    }

    @Override
    public void destroy() {
        System.out.println("4. DisposableBean: destroy");
    }
}

@Configuration
class AppConfig {
    @Bean
    public ConnectionPool connectionPool() {
        return new ConnectionPool();
    }
}

public class LifecycleDemo {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context =
            new AnnotationConfigApplicationContext(AppConfig.class);
        context.close(); // triggers destruction callbacks
    }
}`,
        output: `1. @PostConstruct: pool opened
2. InitializingBean: afterPropertiesSet
3. @PreDestroy: pool closing
4. DisposableBean: destroy`,
      },
    ],
    commonMistakes: [
      'Expecting @PreDestroy or destroy() to run for prototype-scoped beans — Spring does not track prototype beans after handing them out, so it never calls their destruction callbacks.',
      'Doing dependency-dependent setup work inside the constructor instead of @PostConstruct — at constructor time, injected fields set via setter injection may not yet be populated.',
      'Forgetting to call context.close() (or use try-with-resources / a shutdown hook) in a standalone application, so @PreDestroy callbacks never fire.',
      'Assuming @PostConstruct runs before dependency injection completes — it actually runs after all dependencies have been set.',
    ],
    keyPoints: [
      'Lifecycle order: construct, inject dependencies, run init callbacks, use the bean, run destroy callbacks on shutdown.',
      '@PostConstruct/@PreDestroy are the modern, framework-agnostic hooks; InitializingBean/DisposableBean are Spring-specific interfaces achieving the same result.',
      'Destruction callbacks only run automatically for singleton-scoped beans, not prototype-scoped ones.',
      'Calling context.close() (or a JVM shutdown hook) is required to trigger destroy callbacks in a standalone app.',
    ],
  },

  profiles: {
    title: 'Spring Profiles',
    intro: `Real applications behave differently depending on where they run — a development machine, a test environment, or production. Spring Profiles let you tag beans and configuration so that only the ones matching the currently active profile are registered in the container, making it possible to swap entire sets of beans (like a mock email service in dev versus a real SMTP client in production) without touching code.

A profile is nothing more than a named label. You mark beans or configuration classes with <code>@Profile("name")</code>, and then activate one or more profiles at startup through a property, environment variable, or command-line argument. Beans with no @Profile annotation are always active regardless of which profiles are set.`,
    sections: [
      {
        heading: 'Declaring Profile-Specific Beans',
        body: `<code>@Profile</code> can be placed on an individual @Bean method, on an entire @Configuration class, or on a @Component/@Service class. When the annotated element's profile does not match any currently active profile, Spring simply skips registering that bean — it does not exist in the container at all, so attempting to autowire it elsewhere without a matching alternative will fail.`,
        list: [
          '<code>@Profile("dev")</code> — bean is only registered when the "dev" profile is active.',
          '<code>@Profile("!prod")</code> — bean is registered whenever "prod" is NOT active (profile negation).',
          '<code>@Profile({"dev", "test"})</code> — bean is registered if either "dev" or "test" is active.',
        ],
      },
      {
        heading: 'Activating Profiles',
        body: `Profiles are activated via the <code>spring.profiles.active</code> property, which can be set as a JVM argument (<code>-Dspring.profiles.active=dev</code>), an environment variable, a property in application.properties/yml (in Spring Boot), or programmatically on the context's Environment before refresh. Multiple profiles can be active simultaneously, comma-separated, and all beans matching any of the active profiles are registered together.`,
      },
      {
        heading: 'Typical Use Cases',
        body: `Common patterns include swapping a real payment gateway or email client for a stub/mock implementation in "dev" or "test" profiles, pointing at different database connection settings per environment, or enabling verbose debug logging beans only outside "prod". Profiles keep environment-specific wiring in the codebase in a controlled, explicit way rather than relying on scattered if-checks.`,
      },
    ],
    examples: [
      {
        caption: 'Two mutually exclusive beans selected by active profile',
        code: `import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

interface EmailSender {
    void send(String message);
}

@Configuration
class EmailConfig {

    @Bean
    @Profile("dev")
    public EmailSender devEmailSender() {
        return message -> System.out.println("[DEV] Would send email: " + message);
    }

    @Bean
    @Profile("prod")
    public EmailSender prodEmailSender() {
        return message -> System.out.println("[PROD] Sending real email: " + message);
    }
}

public class ProfileDemo {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.getEnvironment().setActiveProfiles("dev");
        context.register(EmailConfig.class);
        context.refresh();

        EmailSender sender = context.getBean(EmailSender.class);
        sender.send("Order confirmation");
    }
}`,
        output: '[DEV] Would send email: Order confirmation',
      },
    ],
    commonMistakes: [
      'Forgetting to activate any profile, then being confused when a @Profile("dev")-only bean is missing from the context — no profile active means no profile-restricted beans are registered.',
      'Defining two beans of the same type under different profiles but forgetting one of them for the "default" (no-profile) case, causing startup failures in environments where no profile is set.',
      'Activating conflicting profiles simultaneously (e.g. "dev" and "prod" together) and getting duplicate or ambiguous bean definitions of the same type.',
      'Using @Profile on individual @Bean methods inconsistently with the surrounding @Configuration class\'s own @Profile, leading to confusing partial activation.',
    ],
    keyPoints: [
      '@Profile("name") restricts a bean or configuration class to only be active when that profile is active.',
      'Profiles are activated via spring.profiles.active (JVM arg, env var, or Boot property), and multiple can be active at once.',
      'Beans without any @Profile annotation are always registered, regardless of active profiles.',
      'Profiles are commonly used to swap environment-specific implementations like mail senders or data sources.',
    ],
  },

  events: {
    title: 'Spring Application Events',
    intro: `Spring includes a built-in publish-subscribe event mechanism that lets beans communicate without being directly coupled to one another. One part of the application publishes an event describing something that happened — an order was placed, a user registered — and any number of other beans can listen for that event and react, without the publisher knowing or caring who is listening.

This is built around three pieces: an event class extending <code>ApplicationEvent</code> (or, since Spring 4.2, any arbitrary POJO), the <code>ApplicationEventPublisher</code> interface used to publish events, and listeners that either implement <code>ApplicationListener&lt;T&gt;</code> or, more commonly today, use the <code>@EventListener</code> annotation on a plain method.`,
    sections: [
      {
        heading: 'Publishing Events',
        body: `Any bean can publish an event by having an <code>ApplicationEventPublisher</code> injected (ApplicationContext itself implements this interface) and calling <code>publishEvent(event)</code>. By default, event delivery to listeners is synchronous and happens on the same thread as the publisher, meaning the publish() call blocks until every matching listener has finished handling the event — unless a listener is explicitly marked <code>@Async</code>.`,
      },
      {
        heading: 'Listening with @EventListener',
        body: `The simplest way to listen for an event is annotating a method with <code>@EventListener</code> and typing its single parameter as the event class. Spring automatically registers this method as a listener for events of that exact type (and subtypes). This avoids implementing the more verbose <code>ApplicationListener&lt;T&gt;</code> interface, though that interface remains a valid, type-safe alternative that some codebases still prefer.`,
        list: [
          '<code>@EventListener</code> on a method — modern, concise, supports conditional matching via SpEL (<code>condition = "..."</code>).',
          '<code>ApplicationListener&lt;MyEvent&gt;</code> implemented on a bean — the original, interface-based approach.',
          'Custom events since Spring 4.2 no longer need to extend ApplicationEvent — any object can be published and listened for.',
        ],
      },
      {
        heading: 'Built-in Framework Events',
        body: `Spring publishes several of its own lifecycle events that application code can listen for, including <code>ContextRefreshedEvent</code> (fired once the ApplicationContext is fully initialized), <code>ContextClosedEvent</code> (fired on shutdown), and <code>ContextStartedEvent</code>/<code>ContextStoppedEvent</code>. Listening for <code>ContextRefreshedEvent</code> is a common way to run startup logic only once the entire bean graph is guaranteed to be ready.`,
      },
    ],
    examples: [
      {
        caption: 'Publishing a custom OrderPlacedEvent and reacting to it with @EventListener',
        code: `import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

class OrderPlacedEvent {
    final String orderId;
    OrderPlacedEvent(String orderId) { this.orderId = orderId; }
}

@Component
class OrderService {
    private final ApplicationEventPublisher publisher;
    OrderService(ApplicationEventPublisher publisher) { this.publisher = publisher; }

    void placeOrder(String orderId) {
        System.out.println("Order placed: " + orderId);
        publisher.publishEvent(new OrderPlacedEvent(orderId));
    }
}

@Component
class InventoryListener {
    @EventListener
    public void onOrderPlaced(OrderPlacedEvent event) {
        System.out.println("Inventory: reserving stock for " + event.orderId);
    }
}

@Configuration
@ComponentScan(basePackages = "com.webnest.events")
class AppConfig { }

public class EventDemo {
    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        context.getBean(OrderService.class).placeOrder("ORD-2001");
    }
}`,
        output: `Order placed: ORD-2001
Inventory: reserving stock for ORD-2001`,
      },
    ],
    commonMistakes: [
      'Assuming event listeners run asynchronously by default — without @Async, publishEvent() blocks until every listener finishes.',
      'Publishing an event before all listener beans exist (e.g. too early in the startup sequence), so some listeners never receive it.',
      'Letting an exception thrown inside one @EventListener silently abort delivery to other listeners, since synchronous publication propagates exceptions back to the publisher.',
      'Overusing the event system for simple direct method calls between two tightly related beans, adding indirection where a plain method call would be clearer.',
    ],
    keyPoints: [
      'Events decouple publishers from listeners: the publisher does not know who (if anyone) is listening.',
      '@EventListener on a method is the modern way to subscribe; ApplicationListener<T> is the older interface-based way.',
      'Event delivery is synchronous and on the same thread by default, unless the listener is marked @Async.',
      'Since Spring 4.2, any POJO can be an event — extending ApplicationEvent is no longer required.',
    ],
  },

  'resource-handling': {
    title: 'Resource Handling in Spring',
    intro: `Applications frequently need to read files — configuration files, templates, data files — from various locations: the classpath, the filesystem, a URL, or even inside a JAR. Java's own APIs for this differ depending on the source, which makes portable code awkward. Spring solves this with the <code>Resource</code> abstraction: a single interface that represents a handle to a resource, regardless of where that resource physically lives.

Rather than writing separate code paths for "a file on disk" versus "a file bundled inside the JAR on the classpath," Spring code can depend on the <code>Resource</code> interface and let Spring choose (or be told) the concrete implementation, making resource-loading logic portable across environments and packaging formats.`,
    sections: [
      {
        heading: 'The Resource Interface and Its Implementations',
        body: `<code>org.springframework.core.io.Resource</code> defines methods like <code>getInputStream()</code>, <code>exists()</code>, <code>getFilename()</code>, and <code>getURL()</code>. Spring ships several concrete implementations, each suited to a different resource origin.`,
        list: [
          '<code>ClassPathResource</code> — loads a resource from the classpath (e.g. a file packaged inside src/main/resources), the most common choice for bundled config/templates.',
          '<code>FileSystemResource</code> — loads a resource from an absolute or relative filesystem path outside the packaged application.',
          '<code>UrlResource</code> — wraps a java.net.URL, letting you load resources over HTTP, FTP, or other URL-addressable protocols.',
          '<code>ByteArrayResource</code> — wraps an in-memory byte array as a Resource, useful for testing or dynamically generated content.',
        ],
      },
      {
        heading: 'Injecting Resources with @Value',
        body: `Instead of manually constructing a Resource implementation, Spring lets you inject one directly using <code>@Value("classpath:data.txt")</code> or <code>@Value("file:/etc/app/config.properties")</code> on a field of type Resource. The prefix ("classpath:", "file:", "http:") tells Spring which Resource implementation to create, keeping the calling code identical regardless of source.`,
      },
      {
        heading: 'ResourceLoader and ResourcePatternResolver',
        body: `Every ApplicationContext implements <code>ResourceLoader</code>, exposing a <code>getResource(String location)</code> method that resolves a location string using the same prefix conventions as @Value. For loading multiple resources matching a pattern (e.g. all ".xml" files in a directory), Spring provides <code>ResourcePatternResolver</code>, which supports Ant-style wildcards like <code>classpath*:config/*.xml</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Reading a classpath resource injected with @Value',
        code: `import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

class GreetingLoader {

    @Value("classpath:greeting.txt")
    private Resource greetingResource;

    String readGreeting() throws Exception {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(greetingResource.getInputStream(), StandardCharsets.UTF_8))) {
            return reader.readLine();
        }
    }
}

@Configuration
class AppConfig {
    @Bean
    public GreetingLoader greetingLoader() {
        return new GreetingLoader();
    }
}

public class ResourceDemo {
    public static void main(String[] args) throws Exception {
        // Assumes src/main/resources/greeting.txt contains: Hello from a Spring Resource!
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        System.out.println(context.getBean(GreetingLoader.class).readGreeting());
    }
}`,
        output: 'Hello from a Spring Resource!',
      },
    ],
    commonMistakes: [
      'Hardcoding an absolute filesystem path for a resource that is actually bundled on the classpath, breaking as soon as the app is packaged into a JAR.',
      'Forgetting the "classpath:" or "file:" prefix in @Value or getResource(), causing Spring to resolve the location using the ApplicationContext\'s default strategy instead of the intended one.',
      'Not closing the InputStream obtained from a Resource, leaking file handles under sustained load.',
      'Assuming ClassPathResource.getFile() always works — it throws FileNotFoundException when the resource is packaged inside a JAR, since a JAR entry has no plain filesystem File representation.',
    ],
    keyPoints: [
      'Resource is Spring\'s unified abstraction for reading data regardless of its physical location.',
      'ClassPathResource, FileSystemResource, and UrlResource are the most commonly used implementations.',
      '@Value("classpath:...") or "file:..." lets Spring inject the right Resource implementation automatically based on the prefix.',
      'ApplicationContext itself is a ResourceLoader, exposing getResource(location) for programmatic lookups.',
    ],
  },

  'spring-mvc': {
    title: 'Spring MVC Fundamentals',
    intro: `Spring MVC is Spring's web framework for building request-driven web applications and REST APIs, built around the classic Model-View-Controller pattern. A central component called the <code>DispatcherServlet</code> receives every incoming HTTP request and delegates it to the appropriate handler method, based on URL mappings you declare with annotations.

Rather than writing raw servlets, you write plain Java classes annotated with <code>@Controller</code> (or <code>@RestController</code> for APIs that return data directly rather than rendering a view), and annotate individual methods with request-mapping annotations that describe which HTTP method and URL pattern they handle. Spring MVC then takes care of binding request parameters, invoking the method, and converting the return value into an HTTP response.`,
    sections: [
      {
        heading: 'The Request Flow Through DispatcherServlet',
        body: `Every request first hits the <code>DispatcherServlet</code>, which acts as the "front controller." It consults a <code>HandlerMapping</code> to find which controller method matches the request's URL and HTTP method, invokes that method (resolving its arguments — path variables, request parameters, request bodies — along the way), and then hands the return value to a <code>HandlerAdapter</code> and, for @Controller classes returning view names, a <code>ViewResolver</code> to render the final response. For @RestController classes, the return value is instead serialized directly (typically to JSON) via an <code>HttpMessageConverter</code>.`,
      },
      {
        heading: '@Controller vs @RestController',
        body: `<code>@Controller</code> marks a class as a traditional MVC controller whose methods typically return a view name (a template to render, such as a Thymeleaf page) unless a method is separately annotated with <code>@ResponseBody</code>. <code>@RestController</code> is a convenience annotation equal to <code>@Controller</code> + <code>@ResponseBody</code> applied to every method — its methods return data (objects, strings) that Spring serializes directly into the HTTP response body, making it the standard choice for REST APIs.`,
      },
      {
        heading: 'Mapping Requests',
        body: `<code>@RequestMapping</code> is the general-purpose annotation for mapping a URL (and optionally an HTTP method) to a handler method or class. Shortcut annotations built on top of it are preferred for readability in modern code.`,
        list: [
          '<code>@GetMapping("/orders/{id}")</code> — handles HTTP GET requests, commonly paired with <code>@PathVariable</code> to extract "{id}" from the URL.',
          '<code>@PostMapping("/orders")</code> — handles HTTP POST requests, typically paired with <code>@RequestBody</code> to deserialize the JSON request body into a Java object.',
          '<code>@PutMapping</code> / <code>@DeleteMapping</code> / <code>@PatchMapping</code> — handle the corresponding HTTP verbs with the same pattern.',
          '<code>@RequestParam</code> — binds an individual query string parameter to a method argument.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A REST controller handling GET and POST requests for orders',
        code: `import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/orders")
class OrderController {

    private final Map<String, String> orders = new ConcurrentHashMap<>();

    @GetMapping("/{id}")
    public String getOrder(@PathVariable String id) {
        return orders.getOrDefault(id, "Order not found: " + id);
    }

    @PostMapping
    public String createOrder(@RequestBody Map<String, String> payload) {
        String id = payload.get("id");
        orders.put(id, "Order " + id + " created for " + payload.get("customer"));
        return "Created order " + id;
    }
}
// A GET to /api/orders/ORD-5 before creation returns: "Order not found: ORD-5"
// A POST to /api/orders with body {"id":"ORD-5","customer":"Asha"} returns: "Created order ORD-5"`,
        output: `GET /api/orders/ORD-5  -> "Order not found: ORD-5"
POST /api/orders {"id":"ORD-5","customer":"Asha"} -> "Created order ORD-5"
GET /api/orders/ORD-5 (after POST) -> "Order ORD-5 created for Asha"`,
      },
    ],
    commonMistakes: [
      'Using @Controller when @RestController was intended, then being confused why the returned String is treated as a view name to resolve instead of raw response text (a "view not found" error appears instead of the expected JSON/text body).',
      'Forgetting @RequestBody on a method parameter that should be deserialized from the JSON request body, causing Spring to instead look for it as a request parameter.',
      'Mismatching the HTTP method annotation (e.g. using @GetMapping for an operation that mutates state), which also has semantic and caching implications beyond just Spring wiring.',
      'Not scoping @RequestMapping\'s base path on the class, leading to inconsistent or duplicated path prefixes across handler methods.',
    ],
    keyPoints: [
      'DispatcherServlet is the front controller that routes every incoming request to the matching handler method.',
      '@RestController = @Controller + @ResponseBody, returning data directly instead of a view name.',
      '@GetMapping, @PostMapping, @PutMapping, and @DeleteMapping are HTTP-verb-specific shortcuts for @RequestMapping.',
      '@PathVariable extracts values from the URL path; @RequestBody deserializes the request body; @RequestParam reads query parameters.',
    ],
  },

  validation: {
    title: 'Validation in Spring',
    intro: `Accepting user input safely means checking it before it reaches business logic — verifying required fields are present, numbers fall within acceptable ranges, and formats (like email addresses) are correct. Spring integrates tightly with the Bean Validation specification (Jakarta Validation, implemented by Hibernate Validator) so that these rules can be declared directly on a model class using annotations, instead of being scattered through hand-written if-checks.

By annotating a request model's fields with constraints like <code>@NotNull</code> and <code>@Size</code>, then marking the controller method's parameter with <code>@Valid</code>, Spring automatically validates the incoming data before your handler method body even runs, and collects any violations into a <code>BindingResult</code> object your method can inspect.`,
    sections: [
      {
        heading: 'Common Bean Validation Constraints',
        body: `These annotations live on the fields of a model/DTO class and describe the rules that field's value must satisfy.`,
        list: [
          '<code>@NotNull</code> — the value must not be null (but an empty string or empty collection is still allowed).',
          '<code>@NotBlank</code> — for Strings specifically: must not be null and must contain at least one non-whitespace character.',
          '<code>@Size(min=, max=)</code> — restricts the length of a String or the size of a collection.',
          '<code>@Min</code> / <code>@Max</code> — restricts a numeric value to a range.',
          '<code>@Email</code> — validates that a String is a syntactically well-formed email address.',
        ],
      },
      {
        heading: 'Triggering Validation with @Valid',
        body: `Placing <code>@Valid</code> before a <code>@RequestBody</code> parameter in a controller method tells Spring to run Bean Validation on the deserialized object before the method executes. If a <code>BindingResult</code> parameter immediately follows the validated parameter in the method signature, Spring captures any violations into it instead of throwing an exception, letting your code decide how to respond (e.g. return a 400 with details). Without a BindingResult parameter, a failed validation instead throws a <code>MethodArgumentNotValidException</code>, which by default Spring MVC turns into an HTTP 400 response automatically.`,
      },
      {
        heading: 'Inspecting BindingResult',
        body: `<code>BindingResult</code> exposes <code>hasErrors()</code> to check if any constraint was violated, and <code>getFieldErrors()</code> or <code>getAllErrors()</code> to retrieve the specific violations, each of which reports the offending field name and the associated message. This makes it possible to build a precise, field-by-field error response rather than a single generic failure message.`,
      },
    ],
    examples: [
      {
        caption: 'Validating a request body with @Valid and reporting field errors via BindingResult',
        code: `import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

class SignupRequest {
    @NotBlank(message = "name is required")
    public String name;

    @Email(message = "email must be valid")
    public String email;

    @Min(value = 18, message = "must be at least 18")
    public int age;
}

@RestController
class SignupController {

    @PostMapping("/signup")
    public String signup(@Valid @RequestBody SignupRequest request, BindingResult result) {
        if (result.hasErrors()) {
            String errors = result.getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
            return "Validation failed: " + errors;
        }
        return "Signed up: " + request.name;
    }
}
// POST /signup with {"name":"","email":"not-an-email","age":15}`,
        output: 'Validation failed: name is required, email must be valid, must be at least 18',
      },
    ],
    commonMistakes: [
      'Forgetting @Valid entirely — Bean Validation constraint annotations on a model class do nothing on their own unless a controller explicitly triggers validation.',
      'Placing BindingResult somewhere other than immediately after the validated @RequestBody/@ModelAttribute parameter — Spring only recognizes it if it directly follows the validated argument.',
      'Confusing @NotNull with @NotBlank on a String field — @NotNull still allows an empty string ("") to pass, which is rarely what\'s intended for required text input.',
      'Not handling the case where BindingResult is omitted, then being surprised by an uncaught MethodArgumentNotValidException instead of a controlled error response.',
    ],
    keyPoints: [
      'Bean Validation annotations (@NotNull, @NotBlank, @Size, @Email, @Min/@Max) declare constraints directly on model fields.',
      '@Valid on a controller parameter triggers validation before the handler method body runs.',
      'A BindingResult parameter placed right after the validated argument captures violations instead of throwing an exception.',
      'Without BindingResult, a validation failure throws MethodArgumentNotValidException, which Spring MVC maps to an HTTP 400 by default.',
    ],
  },

  'exception-handling': {
    title: 'Exception Handling in Spring MVC',
    intro: `Web applications need a consistent way to turn unexpected errors and business exceptions into meaningful HTTP responses, instead of leaking raw stack traces to clients or handling errors with repetitive try-catch blocks in every controller method. Spring MVC provides <code>@ExceptionHandler</code> and <code>@ControllerAdvice</code> specifically for this purpose.

<code>@ExceptionHandler</code> lets a method declare which exception type it handles, and Spring routes any matching exception thrown during request processing to that method instead of letting it propagate as an unhandled 500 error. <code>@ControllerAdvice</code> takes this a step further by letting those handler methods apply globally, across every controller in the application, instead of being duplicated in each one.`,
    sections: [
      {
        heading: '@ExceptionHandler on a Single Controller',
        body: `A method annotated with <code>@ExceptionHandler(SomeException.class)</code>, placed inside a controller class, intercepts that exception type whenever it's thrown by any handler method in that same controller. The exception method can accept the exception instance as a parameter, and its return value is processed exactly like a normal handler's return value — a String view name for @Controller, or serialized response data for @RestController (typically paired with <code>@ResponseStatus</code> or wrapped in a <code>ResponseEntity</code> to control the HTTP status code returned).`,
      },
      {
        heading: '@ControllerAdvice for Global Exception Handling',
        body: `A class annotated with <code>@ControllerAdvice</code> (or <code>@RestControllerAdvice</code>, which adds @ResponseBody) centralizes exception handling across every controller in the application. Its <code>@ExceptionHandler</code> methods act as a global fallback: if a specific controller doesn't handle a given exception itself, Spring checks matching @ExceptionHandler methods in any @ControllerAdvice class. This keeps error-handling logic in one place instead of duplicating it across every controller.`,
      },
      {
        heading: 'Controlling the HTTP Response',
        body: `Returning a <code>ResponseEntity&lt;T&gt;</code> from an exception handler method gives full control over both the status code and body of the error response. Alternatively, <code>@ResponseStatus</code> on the handler method (or directly on a custom exception class) declares a fixed HTTP status Spring should use whenever that exception is handled, which is simpler when the mapping between exception type and status code never varies.`,
        list: [
          '<code>@ExceptionHandler</code> — declares which exception type a method handles.',
          '<code>@ControllerAdvice</code> / <code>@RestControllerAdvice</code> — applies exception handlers globally across all controllers.',
          '<code>ResponseEntity</code> — lets a handler set the exact status code and body of the error response.',
          '<code>@ResponseStatus</code> — declares a fixed status code for an exception type or handler method.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A global exception handler mapping a custom exception to HTTP 404',
        code: `import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

class OrderNotFoundException extends RuntimeException {
    OrderNotFoundException(String id) {
        super("Order not found: " + id);
    }
}

@RestController
class OrderController {
    @GetMapping("/orders/{id}")
    public String getOrder(@PathVariable String id) {
        if (!id.equals("ORD-1")) {
            throw new OrderNotFoundException(id);
        }
        return "Order ORD-1 details";
    }
}

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(OrderNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", ex.getMessage()));
    }
}
// GET /orders/ORD-99`,
        output: `HTTP 404 Not Found
Body: {"error": "Order not found: ORD-99"}`,
      },
    ],
    commonMistakes: [
      'Defining an @ExceptionHandler for a specific exception type inside one controller and expecting it to also catch that exception thrown in other controllers — local handlers only apply within their own class unless moved to a @ControllerAdvice.',
      'Returning a plain object (not wrapped in ResponseEntity) from an exception handler and forgetting the response defaults to HTTP 200, even though logically it represents an error.',
      'Catching an overly broad exception type like Exception.class in @ExceptionHandler, accidentally swallowing unrelated errors and masking real bugs.',
      'Forgetting @RestControllerAdvice vs @ControllerAdvice — using plain @ControllerAdvice with a REST API means the handler methods need an explicit @ResponseBody or they will be treated as view names.',
    ],
    keyPoints: [
      '@ExceptionHandler methods intercept specific exception types thrown during request handling, replacing a generic 500 error.',
      '@ControllerAdvice (or @RestControllerAdvice) centralizes exception handling across all controllers instead of duplicating it per class.',
      'ResponseEntity gives full control over the error response\'s status code and body; @ResponseStatus is simpler for fixed mappings.',
      'A local @ExceptionHandler in a controller takes precedence over a global one in @ControllerAdvice for that same controller.',
    ],
  },

  aop: {
    title: 'Aspect-Oriented Programming (AOP) in Spring',
    intro: `Some concerns in an application — logging, security checks, transaction management, performance monitoring — don't belong to any single class's core responsibility, yet they need to run before, after, or around many different methods scattered across the codebase. Writing this logic manually inside every method leads to duplicated, tangled code. Aspect-Oriented Programming (AOP) solves this by letting you define such "cross-cutting concerns" once, in one place, and have them automatically applied wherever they're needed.

Spring AOP implements this using proxies: when a bean matches an aspect's criteria, Spring wraps it in a dynamically generated proxy object that intercepts method calls, runs the aspect's advice code at the right point, and then delegates to the real method. All of this is configured declaratively using the <code>@Aspect</code> annotation and a small set of advice annotations.`,
    sections: [
      {
        heading: 'Core AOP Vocabulary',
        body: `A few terms recur constantly in AOP and are worth knowing precisely.`,
        list: [
          '<strong>Aspect</strong> — a module (a class annotated <code>@Aspect</code>) that encapsulates a cross-cutting concern like logging.',
          '<strong>Join point</strong> — a specific point during execution, such as a method call, where an aspect could apply.',
          '<strong>Pointcut</strong> — an expression that selects which join points (which methods) an aspect\'s advice applies to.',
          '<strong>Advice</strong> — the actual action taken at a matched join point (e.g. logging before the method runs).',
        ],
      },
      {
        heading: 'Types of Advice',
        body: `Spring supports several advice annotations, each describing when relative to the target method the advice code runs.`,
        list: [
          '<code>@Before</code> — runs before the matched method executes; cannot prevent the method from running (unless it throws).',
          '<code>@After</code> — runs after the method completes, regardless of whether it returned normally or threw an exception (like a finally block).',
          '<code>@AfterReturning</code> — runs only after the method completes successfully, with access to its return value.',
          '<code>@AfterThrowing</code> — runs only if the method throws an exception, with access to that exception.',
          '<code>@Around</code> — wraps the entire method call, and can inspect/modify arguments, skip the call, alter the return value, or measure execution time; it must explicitly call <code>joinPoint.proceed()</code> to invoke the real method.',
        ],
      },
      {
        heading: 'Writing Pointcut Expressions',
        body: `Pointcuts are written using AspectJ expression syntax, most commonly the <code>execution()</code> designator, which matches method signatures by pattern: <code>execution(* com.webnest.service.*.*(..))</code> matches any method, with any return type and any arguments, on any class directly inside the com.webnest.service package. Pointcuts can also match by annotation, e.g. <code>@annotation(org.springframework.transaction.annotation.Transactional)</code> to target methods carrying a specific annotation.`,
      },
    ],
    examples: [
      {
        caption: 'A logging aspect wrapping all service-layer methods with @Around advice',
        code: `import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Aspect
@Component
class LoggingAspect {

    @Around("execution(* com.webnest.service.*.*(..))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        System.out.println("Entering: " + joinPoint.getSignature());
        Object result = joinPoint.proceed(); // invokes the real method
        long duration = System.currentTimeMillis() - start;
        System.out.println("Exiting: " + joinPoint.getSignature() + " (" + duration + "ms)");
        return result;
    }
}

@Service
class PricingService {
    double calculateTotal(double amount) {
        return amount * 1.1;
    }
}

@EnableAspectJAutoProxy
class AopConfig { }
// Calling pricingService.calculateTotal(100.0) through the Spring-managed proxy`,
        output: `Entering: double com.webnest.service.PricingService.calculateTotal(double)
Exiting: double com.webnest.service.PricingService.calculateTotal(double) (0ms)`,
      },
    ],
    commonMistakes: [
      'Forgetting to call joinPoint.proceed() inside an @Around advice — the target method never actually executes, and any return value expected by the caller is missing.',
      'Calling a method on "this" from within the same class and expecting an aspect to intercept it — Spring AOP proxies only intercept calls made from outside the object, not internal self-invocations.',
      'Writing an overly broad pointcut expression (e.g. matching an entire base package) that unintentionally wraps unrelated methods, adding overhead or unexpected logging noise.',
      'Forgetting @EnableAspectJAutoProxy (or the Spring Boot auto-configuration equivalent) in a plain Spring application, so @Aspect classes are registered as beans but never actually applied as proxies.',
    ],
    keyPoints: [
      'AOP separates cross-cutting concerns (logging, security, transactions) from core business logic using aspects.',
      '@Aspect classes declare advice methods; pointcut expressions choose which methods the advice applies to.',
      '@Before, @After, @AfterReturning, @AfterThrowing, and @Around cover every timing relative to the target method.',
      'Spring AOP works via proxies, so self-invocation (a method calling another method on the same object) bypasses the proxy and skips advice.',
    ],
  },

  'spring-data-fundamentals': {
    title: 'Spring Data Fundamentals',
    intro: `Writing data-access code by hand — opening connections, building SQL, mapping result sets to objects — is repetitive and error-prone. Spring Data eliminates most of this boilerplate by letting you define a Java interface describing the operations you need, and having Spring generate a working implementation automatically at runtime, based purely on the interface's method names and generic type parameters.

The core building blocks are <code>CrudRepository</code>, which provides basic create/read/update/delete operations, and <code>JpaRepository</code> (part of Spring Data JPA), which extends CrudRepository with JPA-specific and pagination/sorting capabilities. You simply declare an interface extending one of these, parameterized by your entity type and its ID type, and Spring Data supplies the implementation without you writing a single line of SQL for common operations.`,
    sections: [
      {
        heading: 'CrudRepository — the Base Contract',
        body: `<code>CrudRepository&lt;T, ID&gt;</code> defines generic methods like <code>save(entity)</code>, <code>findById(id)</code>, <code>findAll()</code>, <code>count()</code>, and <code>deleteById(id)</code>. Any interface extending it, annotated with the entity and its ID type, immediately gets working implementations of all of these methods — Spring Data generates a proxy class at startup that implements the interface against the configured data store.`,
      },
      {
        heading: 'JpaRepository — JPA-Specific Extensions',
        body: `<code>JpaRepository&lt;T, ID&gt;</code> extends both CrudRepository and PagingAndSortingRepository, adding JPA-specific conveniences like <code>saveAndFlush()</code> (immediately synchronizing changes to the database rather than waiting for the persistence context to flush later) and batch-oriented methods. Its inherited pagination support (<code>findAll(Pageable pageable)</code>) is essential for any endpoint returning large result sets in pages rather than all at once.`,
      },
      {
        heading: 'Derived Query Methods',
        body: `Spring Data can generate a query just from a method's name, following a naming convention it parses at startup. A method named <code>findByLastNameAndAgeGreaterThan(String lastName, int age)</code> is automatically translated into the equivalent query, with no implementation code required. For cases the naming convention can't express cleanly, the <code>@Query</code> annotation lets you write a JPQL (or native SQL) query explicitly on the method.`,
        list: [
          '<code>findBy...</code> — generates a SELECT query filtered by the named fields.',
          '<code>countBy...</code> / <code>existsBy...</code> — generate COUNT/EXISTS queries with the same field-matching convention.',
          '<code>deleteBy...</code> — generates a DELETE query matching the named fields.',
          '<code>@Query("SELECT u FROM User u WHERE u.email = :email")</code> — an explicit JPQL query for cases the naming convention can\'t express.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A JpaRepository interface with a derived query method',
        code: `import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Entity
class Customer {
    @Id
    Long id;
    String lastName;
    int age;
}

interface CustomerRepository extends JpaRepository<Customer, Long> {
    // No implementation needed — Spring Data generates the query from the method name.
    List<Customer> findByLastNameAndAgeGreaterThan(String lastName, int age);
}

@Service
class CustomerService {
    private final CustomerRepository repository;
    CustomerService(CustomerRepository repository) { this.repository = repository; }

    List<Customer> findAdultsNamed(String lastName) {
        return repository.findByLastNameAndAgeGreaterThan(lastName, 18);
    }
}
// Assuming the database contains customers with lastName "Sharma" aged 15, 22, and 30`,
        output: 'findAdultsNamed("Sharma") returns a List<Customer> containing the two customers aged 22 and 30, generated SQL: SELECT * FROM customer WHERE last_name = ? AND age > ?',
      },
    ],
    commonMistakes: [
      'Misspelling a field name in a derived query method (e.g. "findByLastnam" instead of "findByLastName"), causing a startup failure because Spring Data cannot match it to an entity property.',
      'Assuming CrudRepository provides pagination out of the box — pagination and sorting require extending PagingAndSortingRepository or JpaRepository instead.',
      'Writing overly long, hard-to-read derived method names for complex queries instead of switching to an explicit @Query for clarity.',
      'Calling saveAndFlush() habitually instead of save(), unnecessarily forcing a database round-trip on every call when the default flush timing would have been fine.',
    ],
    keyPoints: [
      'Spring Data generates a working repository implementation from an interface, with no manual DAO code required.',
      'CrudRepository provides basic CRUD operations; JpaRepository adds JPA-specific features plus pagination and sorting.',
      'Derived query methods are generated purely from a method\'s name following Spring Data\'s naming convention.',
      '@Query lets you write explicit JPQL/native SQL when a query cannot be cleanly expressed as a method name.',
    ],
  },

  transactions: {
    title: 'Transaction Management with @Transactional',
    intro: `Many operations need to succeed or fail as a single unit — transferring money between two accounts, for example, must either update both balances or update neither. Spring's declarative transaction management lets you express this requirement with a single annotation, <code>@Transactional</code>, instead of manually managing commit and rollback calls around your database code.

Under the hood, Spring wraps an annotated method (or every method of an annotated class) in a proxy that starts a transaction before the method runs, commits it if the method completes normally, and rolls it back if the method throws a runtime exception. This declarative approach keeps transaction boundaries visible and consistent without scattering try-catch-rollback logic throughout the codebase.`,
    sections: [
      {
        heading: 'How @Transactional Works',
        body: `Placing <code>@Transactional</code> on a method (most commonly a service-layer method that calls one or more repository methods) tells Spring's proxy to begin a transaction just before the method executes, and to commit that transaction once the method returns successfully. If the method throws an unchecked (RuntimeException or Error) exception, the proxy rolls the transaction back automatically. By default, checked exceptions do NOT trigger a rollback unless explicitly configured to.`,
      },
      {
        heading: 'Propagation Basics',
        body: `Propagation controls how a transactional method behaves when it is called from within another method that is already running inside a transaction.`,
        list: [
          '<code>REQUIRED</code> (default) — joins the existing transaction if one is active, or starts a new one if not.',
          '<code>REQUIRES_NEW</code> — always suspends any existing transaction and starts a brand-new, independent one.',
          '<code>SUPPORTS</code> — joins an existing transaction if present, but runs non-transactionally if none exists.',
          '<code>MANDATORY</code> — requires an existing transaction to already be active, and throws an exception if none is found.',
        ],
      },
      {
        heading: 'Controlling Rollback Behavior',
        body: `The default rollback rule (unchecked exceptions trigger rollback, checked exceptions do not) can be overridden with <code>rollbackFor</code> and <code>noRollbackFor</code> attributes on @Transactional, e.g. <code>@Transactional(rollbackFor = Exception.class)</code> to force a rollback even for checked exceptions. Other useful attributes include <code>readOnly = true</code>, which hints to the underlying persistence provider that no writes will occur (enabling potential optimizations), and <code>timeout</code>, which aborts the transaction if it runs too long.`,
      },
    ],
    examples: [
      {
        caption: 'A money-transfer method that rolls back both updates if either fails',
        code: `import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Repository
class AccountRepository {
    void debit(String accountId, double amount) {
        System.out.println("Debited " + amount + " from " + accountId);
    }
    void credit(String accountId, double amount) {
        System.out.println("Credited " + amount + " to " + accountId);
        if (accountId.equals("ACC-BAD")) {
            throw new RuntimeException("Account frozen, cannot credit");
        }
    }
}

@Service
class TransferService {
    private final AccountRepository accountRepository;
    TransferService(AccountRepository accountRepository) { this.accountRepository = accountRepository; }

    @Transactional
    public void transfer(String fromAccount, String toAccount, double amount) {
        accountRepository.debit(fromAccount, amount);
        accountRepository.credit(toAccount, amount); // throws for ACC-BAD
        // If credit() throws, Spring's proxy rolls back the whole transaction,
        // so the debit() above is also undone at the database level.
    }
}
// transferService.transfer("ACC-100", "ACC-BAD", 500.0)`,
        output: `Debited 500.0 from ACC-100
Credited 500.0 to ACC-BAD
RuntimeException: Account frozen, cannot credit
(Transaction rolled back — the debit from ACC-100 is undone in the database)`,
      },
    ],
    commonMistakes: [
      'Assuming @Transactional rolls back on any exception — by default only unchecked exceptions (RuntimeException/Error) trigger rollback; checked exceptions require rollbackFor to be set explicitly.',
      'Calling a @Transactional method from another method in the same class (self-invocation) and expecting the transaction to start — like other Spring proxy-based features, this bypasses the proxy entirely.',
      'Marking a read-heavy method readOnly = true but then performing a write inside it, leading to inconsistent or provider-dependent behavior.',
      'Overusing REQUIRES_NEW without understanding it suspends the outer transaction, which can create partial commits if the outer transaction later fails.',
    ],
    keyPoints: [
      '@Transactional wraps a method in a proxy that begins a transaction before it runs and commits or rolls back based on the outcome.',
      'By default, only unchecked exceptions trigger an automatic rollback; use rollbackFor to include checked exceptions.',
      'REQUIRED (default) joins an existing transaction or starts one; REQUIRES_NEW always starts an independent transaction.',
      'Self-invocation within the same class bypasses the transactional proxy entirely, just like with Spring AOP in general.',
    ],
  },

  testing: {
    title: 'Testing Spring Applications',
    intro: `Spring applications benefit from tests at several levels: fast, isolated unit tests that don't touch the framework at all, and integration tests that load some or all of a real Spring ApplicationContext to verify beans wire together and behave correctly end-to-end. The Spring ecosystem — most visibly through Spring Boot's testing support — provides dedicated annotations for each of these levels so you aren't forced to choose only one style.

<code>@SpringBootTest</code> is the most common integration-testing entry point in Spring Boot applications: it boots a real (or near-real) ApplicationContext for the test, letting you autowire actual beans and exercise real wiring. <code>@MockBean</code> complements this by letting you replace a specific bean in that context with a Mockito mock, which is useful for isolating the class under test from a slow or external collaborator (like a payment gateway) while still testing everything else through a genuine Spring context.`,
    sections: [
      {
        heading: '@SpringBootTest — Full or Sliced Integration Tests',
        body: `Annotating a test class with <code>@SpringBootTest</code> tells Spring Boot's test support to search for a <code>@SpringBootApplication</code>-annotated class and use it to build a full ApplicationContext for the test, exactly as it would for the running application. This is the most realistic form of test, exercising real bean wiring, configuration, and (optionally, via <code>webEnvironment</code>) an actual embedded web server. Because it boots the entire context, it is also the slowest style of test, so it's typically reserved for a smaller number of true end-to-end checks rather than every test case.`,
      },
      {
        heading: '@MockBean — Replacing a Bean with a Mock',
        body: `<code>@MockBean</code>, applied to a field inside a test class, tells Spring's test context to replace whatever real bean of that type exists in the ApplicationContext with a Mockito mock for the duration of that test. This lets you test a service class through a genuine Spring context while stubbing out a specific dependency (an external API client, an email sender) so the test doesn't depend on that dependency's real, possibly slow or unreliable, behavior.`,
      },
      {
        heading: 'Working Directly with ApplicationContext in Tests',
        body: `For lower-level verification — confirming that a particular bean exists, is of the expected type, or was wired correctly — tests can inject the <code>ApplicationContext</code> itself and call <code>getBean()</code> directly. This is useful for configuration-focused tests (e.g. verifying a @Profile-guarded bean is or isn't present under a given profile) without needing the full weight of testing actual business logic through the beans.`,
        list: [
          '<code>@SpringBootTest</code> — loads a full ApplicationContext for realistic integration testing (part of the broader Spring ecosystem\'s testing support, most commonly used in Spring Boot projects).',
          '<code>@MockBean</code> — replaces a real bean in the test context with a Mockito mock.',
          'Plain JUnit + Mockito (no Spring annotations at all) remains the right choice for pure unit tests of a class with manually constructed dependencies.',
          '<code>@DataJpaTest</code>, <code>@WebMvcTest</code>, and other "slice" annotations load only the portion of the context relevant to one layer, for faster, more focused tests.',
        ],
      },
    ],
    examples: [
      {
        caption: 'An integration test using @SpringBootTest and @MockBean to isolate an external dependency',
        code: `import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

interface PaymentGateway {
    boolean charge(double amount);
}

class CheckoutService {
    private final PaymentGateway paymentGateway;
    CheckoutService(PaymentGateway paymentGateway) { this.paymentGateway = paymentGateway; }

    String checkout(double amount) {
        return paymentGateway.charge(amount) ? "Payment successful" : "Payment declined";
    }
}

@SpringBootTest
class CheckoutServiceTest {

    @Autowired
    private CheckoutService checkoutService;

    @MockBean
    private PaymentGateway paymentGateway; // replaces the real gateway bean with a mock

    @Test
    void checkoutSucceedsWhenGatewayApproves() {
        when(paymentGateway.charge(99.99)).thenReturn(true);
        String result = checkoutService.checkout(99.99);
        assertEquals("Payment successful", result);
    }
}`,
        output: 'Test passes: checkoutService.checkout(99.99) returns "Payment successful" because the mocked PaymentGateway was stubbed to return true, with no real payment network call made.',
      },
    ],
    commonMistakes: [
      'Using @SpringBootTest for every single test class, resulting in a slow test suite that boots a full context repeatedly instead of using faster slice tests (@WebMvcTest, @DataJpaTest) or plain unit tests where appropriate.',
      'Forgetting that @MockBean replaces the bean for the whole test context, which can hide real integration issues that would only surface with the actual dependency wired in.',
      'Mixing manual Mockito.mock() creation with @MockBean inconsistently, leading to confusion about which mock instance is actually injected into the Spring context.',
      'Not resetting or re-stubbing a @MockBean between test methods when its behavior needs to differ per test, causing stale stubbed behavior to leak across tests.',
    ],
    keyPoints: [
      '@SpringBootTest loads a real (or near-real) ApplicationContext for realistic integration testing, at the cost of slower test execution.',
      '@MockBean swaps a specific bean in the test context for a Mockito mock, isolating the class under test from a chosen dependency.',
      'Slice test annotations (@WebMvcTest, @DataJpaTest) load only the relevant portion of the context for faster, layer-focused tests.',
      'Plain unit tests without any Spring annotations remain appropriate when a class\'s dependencies can be constructed and mocked manually.',
    ],
  },
}
