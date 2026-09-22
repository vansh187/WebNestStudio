// Spring Security, Cloud, and Microservices module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content23SecurityCloud = {
  'spring-security-fundamentals': {
    title: 'Spring Security Fundamentals',
    intro: `Spring Security is a filter-chain-based framework that sits in front of every incoming request to handle two related but distinct questions: <strong>authentication</strong> ("who are you?") and <strong>authorization</strong> ("are you allowed to do this?"). It plugs into Spring Boot with sensible defaults — by default, adding the starter dependency alone secures every endpoint and generates a random login password on startup — and is then customized to fit the application's real login and access-control rules.`,
    sections: [
      {
        heading: 'The Security Filter Chain',
        body: `Before a request ever reaches a <code>@Controller</code>, it passes through a chain of servlet filters that Spring Security installs. These filters handle tasks like checking for an authenticated session, validating credentials on a login attempt, applying CSRF protection, and ultimately deciding whether the request is allowed to proceed to the controller at all.`,
      },
      {
        heading: 'Configuring Access Rules',
        body: `A <code>SecurityFilterChain</code> bean declares which URL patterns require authentication, which require a specific role, and which are open to everyone — evaluated top to bottom, with the first matching rule winning, so rules are typically ordered from most specific to least specific.`,
        list: [
          '<code>.permitAll()</code> — no authentication required (login page, public assets, health checks).',
          '<code>.authenticated()</code> — any logged-in user, regardless of role.',
          '<code>.hasRole("ADMIN")</code> — requires a specific role.',
          '<code>.hasAnyRole("ADMIN", "MANAGER")</code> — requires at least one of several roles.',
        ],
      },
      {
        heading: 'Password Hashing',
        body: `Passwords must never be stored in plain text. <code>PasswordEncoder</code> (Spring Security's standard, <code>BCryptPasswordEncoder</code>) hashes a password with a built-in random salt before it's persisted, and verifying a login attempt re-hashes the submitted password with the same salt and compares the results — the plain password itself is never stored or compared directly.`,
      },
      {
        heading: 'UserDetailsService — Loading Users',
        body: `Spring Security doesn't know how your users are stored — that's your application's job. Implementing <code>UserDetailsService</code> with one method, <code>loadUserByUsername</code>, is how you plug your own user table (via a repository) into Spring Security's authentication process.`,
      },
    ],
    examples: [
      {
        caption: 'Form login configuration with role-based access rules and a custom user lookup',
        code: `@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
          .authorizeHttpRequests(auth -> auth
              .requestMatchers("/", "/login", "/register", "/css/**").permitAll()
              .requestMatchers("/admin/**").hasRole("ADMIN")
              .anyRequest().authenticated())
          .formLogin(form -> form.loginPage("/login").permitAll())
          .logout(logout -> logout.logoutSuccessUrl("/"));
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

@Service
public class AppUserDetailsService implements UserDetailsService {
    @Autowired private UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) {
        User u = userRepo.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("No such user: " + username));
        return org.springframework.security.core.userdetails.User
            .withUsername(u.getUsername())
            .password(u.getPasswordHash())     // already BCrypt-hashed in the database
            .roles(u.getRole())
            .build();
    }
}`,
        output: `POST /login (wrong password) -> 401 Unauthorized
GET  /admin/users (no ADMIN role) -> 403 Forbidden`,
      },
    ],
    commonMistakes: [
      'Storing passwords in plain text or with a weak, unsalted hash instead of BCrypt (or a similarly designed password hash).',
      'Ordering .requestMatchers() rules so a broad rule (like anyRequest().authenticated()) comes before a more specific permitAll() rule it would otherwise shadow.',
      'Comparing raw passwords directly in application code instead of delegating comparison to PasswordEncoder.matches().',
      'Forgetting that hasRole("ADMIN") expects the role stored without the "ROLE_" prefix — Spring Security adds that prefix internally.',
    ],
    keyPoints: [
      'Spring Security intercepts every request through a filter chain before it reaches your controllers.',
      'authorizeHttpRequests rules are evaluated in order; put specific rules before broader catch-all rules.',
      'Passwords are always stored hashed (BCryptPasswordEncoder), never in plain text.',
      'UserDetailsService is the plug-in point connecting your own user storage to Spring Security\'s authentication flow.',
    ],
  },

  'securing-rest-apis-with-jwt': {
    title: 'Securing REST APIs with JWT',
    intro: `Form-based login relies on a server-side session, identified by a cookie — convenient for a browser-rendered app, but awkward for a REST API consumed by mobile apps, single-page apps, or other services, especially once you need to scale to multiple server instances that don't share session state. <strong>JWT (JSON Web Token)</strong>-based authentication solves this by making the API fully stateless: the server issues a signed token on login, and the client sends that token on every subsequent request instead of relying on a server-side session.`,
    sections: [
      {
        heading: 'What a JWT Actually Contains',
        body: `A JWT is three Base64URL-encoded segments separated by dots: a header (the signing algorithm), a payload (claims — typically the username, roles, and an expiration time), and a signature (computed from the header and payload using a secret key only the server knows). Because the signature can be verified without a database lookup, validating a token is fast and requires no shared server-side state.`,
      },
      {
        heading: 'The Stateless Auth Flow',
        list: [
          '1. Client sends credentials to a login endpoint.',
          '2. Server verifies them and returns a signed JWT (not a session cookie).',
          '3. Client stores the token and sends it on every subsequent request in the <code>Authorization: Bearer &lt;token&gt;</code> header.',
          '4. A custom filter on the server validates the token\'s signature and expiration on each request, and if valid, sets the authenticated user for that request — with no session lookup needed.',
        ],
      },
      {
        heading: 'Why Statelessness Matters',
        body: `Because no session state is kept on the server, any instance of the application (behind a load balancer, or across many microservice replicas) can validate any request's token independently — there's nothing to keep "sticky" to one particular server. This is why JWT is the near-default choice for authenticating REST APIs and microservices, as opposed to the session-cookie approach used for classic server-rendered web apps.`,
      },
    ],
    examples: [
      {
        caption: 'A JWT authentication filter plugged into the Spring Security filter chain',
        code: `@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtService.isValid(token)) {
                String username = jwtService.extractUsername(token);
                var authToken = new UsernamePasswordAuthenticationToken(username, null,
                    jwtService.extractAuthorities(token));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(req, res);      // continue regardless — unauthenticated requests are
    }                                   // rejected later by authorizeHttpRequests rules
}

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
        http
          .csrf(csrf -> csrf.disable())                              // not needed for stateless token auth
          .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
          .authorizeHttpRequests(auth -> auth
              .requestMatchers("/api/auth/**").permitAll()
              .anyRequest().authenticated())
          .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}`,
        output: `POST /api/auth/login -> 200 OK  {"token":"eyJhbGciOi..."}
GET  /api/students (Authorization: Bearer eyJhbGciOi...) -> 200 OK`,
      },
    ],
    commonMistakes: [
      'Storing a JWT in localStorage in a browser app without care — it becomes readable by any JavaScript on the page, making XSS more dangerous; an httpOnly cookie is often safer for browser clients.',
      'Never expiring tokens, or setting an excessively long expiration, which turns a stolen token into a long-lived credential.',
      'Forgetting SessionCreationPolicy.STATELESS, leaving Spring Security to also create a server-side session alongside JWT, defeating the point of a stateless API.',
      'Putting sensitive data (like a plain password or full personal details) inside the JWT payload — it is signed, not encrypted, and readable by anyone who has the token.',
    ],
    keyPoints: [
      'A JWT is a signed, self-contained token (header + payload + signature) verifiable without a server-side session lookup.',
      'The stateless flow: login returns a token, and the client resends it on every request via the Authorization header.',
      'Statelessness lets any server instance validate a request independently, which is essential for scaling and microservices.',
      'JWT payloads are signed but not encrypted — never put secrets inside them.',
    ],
  },

  'microservices-architecture-fundamentals': {
    title: 'Microservices Architecture Fundamentals',
    intro: `A monolith packages an entire application — every feature, every module — as one deployable unit sharing one codebase and usually one database. <strong>Microservices</strong> split that single application into a set of small, independently deployable services, each owning its own data and communicating with the others over the network, typically via REST or asynchronous messaging.`,
    sections: [
      {
        heading: 'Why Split a Monolith Up',
        list: [
          '<strong>Independent deployability</strong> — a team can ship changes to one service without redeploying (or even understanding) the rest of the system.',
          '<strong>Fault isolation</strong> — a bug or outage in one service doesn\'t necessarily take the entire application down, if failures are handled gracefully (see resilience patterns).',
          '<strong>Independent scaling</strong> — a service under heavy load can be scaled out on its own, without over-provisioning parts of the system that don\'t need it.',
          '<strong>Technology flexibility</strong> — different services can use different languages, frameworks, or even database types, chosen to fit that service\'s specific needs.',
        ],
      },
      {
        heading: 'The Real Costs',
        list: [
          '<strong>Network unreliability</strong> — a local method call in a monolith becomes a network call that can time out, fail, or arrive slowly, and code must handle that explicitly.',
          '<strong>Distributed data consistency</strong> — with each service owning its own database, there\'s no single transaction spanning multiple services; consistency across services has to be designed for deliberately (e.g. eventual consistency via events).',
          '<strong>Operational complexity</strong> — many more independently deployed processes means more infrastructure to run: service discovery, centralized logging, distributed tracing, and API gateways all become necessary rather than optional.',
          '<strong>Harder end-to-end testing</strong> — verifying a single user flow may require several services running together and communicating correctly.',
        ],
      },
      {
        heading: 'Microservices vs. SOA',
        body: `Service-Oriented Architecture (SOA) predates microservices and shares the goal of splitting a system into services, but typically centers on a shared Enterprise Service Bus (ESB) that routes and often transforms messages between larger, coarser-grained services, frequently with a shared database. Microservices favor smaller, independently deployable services, decentralized data ownership (each service owns its own database), and lightweight communication — usually plain HTTP/REST or a message broker — rather than a heavyweight central bus.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal microservice — its own Spring Boot app, its own database, exposing one focused capability',
        code: `// currency-exchange-service — a small, independently deployable Spring Boot app
@RestController
public class CurrencyExchangeController {

    @Autowired private ExchangeRateRepository repo;

    @GetMapping("/currency-exchange/from/{from}/to/{to}")
    public CurrencyExchange retrieve(@PathVariable String from, @PathVariable String to) {
        return repo.findByFromAndTo(from, to)
            .orElseThrow(() -> new IllegalArgumentException("No rate for " + from + "->" + to));
    }
}

// application.properties — this service owns its own database entirely
// spring.datasource.url=jdbc:h2:mem:exchange
// server.port=8000

// A separate service (currency-conversion-service, its own app, its own port)
// calls this one over HTTP rather than sharing its database or its code.`,
        output: `GET http://localhost:8000/currency-exchange/from/USD/to/INR
{"from":"USD","to":"INR","conversionMultiple":83.20}`,
      },
    ],
    commonMistakes: [
      'Splitting a system into "microservices" that still share one database, which reintroduces tight coupling and defeats much of the point of splitting them up.',
      'Making services too fine-grained too early, multiplying operational overhead (deployments, monitoring, network calls) without a real corresponding benefit.',
      'Assuming a network call between services will always succeed instantly, and not designing for timeouts, retries, or partial failure.',
      'Adopting microservices for a small application or team where the added operational complexity outweighs any benefit — a well-structured monolith is often the right starting point.',
    ],
    keyPoints: [
      'Microservices split an application into small, independently deployable services, each owning its own data.',
      'Benefits: independent deployment/scaling, fault isolation, technology flexibility.',
      'Costs: network unreliability, distributed data consistency, and significantly more operational complexity.',
      'Microservices favor decentralized data and lightweight HTTP/messaging communication over SOA\'s typically shared ESB and larger services.',
    ],
  },

  'service-discovery-and-api-gateways-with-spring-cloud': {
    title: 'Service Discovery and API Gateways with Spring Cloud',
    intro: `Once an application is split into many independently deployed services, two new problems appear immediately: how does one service find the current network address of another (which can change as instances scale up, down, or restart), and how do external clients reach dozens of services without needing to know about each one individually? Spring Cloud provides standard solutions to both.`,
    sections: [
      {
        heading: 'Service Discovery with Eureka',
        body: `Hard-coding a service's URL breaks the moment that service is redeployed on a different host or port, or scaled to multiple instances. <strong>Eureka</strong> is a naming server: every microservice registers itself with Eureka on startup (and sends periodic heartbeats to prove it's still alive), and other services look it up <em>by name</em> rather than by a fixed address, letting instances come and go freely without any hardcoded URLs anywhere.`,
      },
      {
        heading: 'Calling Other Services with Feign',
        body: `<strong>Feign</strong> is a declarative HTTP client: instead of manually building requests with <code>RestTemplate</code> or <code>WebClient</code>, you declare an interface annotated with the target service's name and the endpoints it exposes, and Spring generates a working implementation at runtime — including, when combined with Eureka, resolving the target service's current address automatically and load-balancing across its instances.`,
      },
      {
        heading: 'The API Gateway',
        body: `Rather than external clients calling dozens of individual microservices directly, all traffic is routed through a single <strong>API Gateway</strong> (Spring Cloud Gateway, or historically Netflix Zuul), which forwards each request to the correct backend service based on its path. Because every request passes through this one place, it's also the natural location for cross-cutting concerns that would otherwise need to be duplicated in every service: authentication, rate limiting, and centralized logging.`,
      },
    ],
    examples: [
      {
        caption: 'Registering with Eureka and calling another service through a declarative Feign client',
        code: `// Eureka server — a dedicated, separate Spring Boot app
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) { SpringApplication.run(EurekaServerApplication.class, args); }
}

// Any microservice registers itself simply by having this annotation + the Eureka client dependency
@SpringBootApplication
@EnableDiscoveryClient
public class CurrencyConversionApplication { }

// A declarative client — looks up "currency-exchange-service" via Eureka, load-balances automatically
@FeignClient(name = "currency-exchange-service")
public interface CurrencyExchangeProxy {
    @GetMapping("/currency-exchange/from/{from}/to/{to}")
    CurrencyExchange retrieve(@PathVariable String from, @PathVariable String to);
}

@RestController
public class CurrencyConversionController {
    @Autowired private CurrencyExchangeProxy proxy;

    @GetMapping("/currency-conversion/from/{from}/to/{to}/quantity/{qty}")
    public CurrencyExchange convert(@PathVariable String from, @PathVariable String to, @PathVariable BigDecimal qty) {
        CurrencyExchange rate = proxy.retrieve(from, to);      // no hardcoded host:port anywhere
        return rate.withTotal(rate.getConversionMultiple().multiply(qty));
    }
}`,
        output: `GET /currency-conversion/from/USD/to/INR/quantity/10
{"from":"USD","to":"INR","conversionMultiple":83.20,"total":832.00}`,
      },
    ],
    commonMistakes: [
      'Hardcoding a downstream service\'s host and port instead of registering it with Eureka and calling it by name.',
      'Putting real business logic inside the API gateway — a gateway should route and handle cross-cutting concerns, not domain logic.',
      'Forgetting that a service must send Eureka regular heartbeats to stay registered — a crashed instance that stops heartbeating is eventually evicted automatically.',
      'Exposing every microservice\'s port directly to the public internet instead of funneling external traffic exclusively through the gateway.',
    ],
    keyPoints: [
      'Eureka lets services register themselves by name and be discovered dynamically, instead of relying on hardcoded addresses.',
      'Feign provides a declarative, interface-based HTTP client that integrates with Eureka for automatic discovery and load balancing.',
      'An API Gateway is the single entry point for external traffic, routing to backend services and centralizing cross-cutting concerns.',
      'Services should never be hardwired to each other\'s specific host and port.',
    ],
  },

  'resilience-circuit-breakers-and-distributed-tracing': {
    title: 'Resilience: Circuit Breakers and Distributed Tracing',
    intro: `In a monolith, a slow internal method call is rarely catastrophic. In a microservices architecture, one slow or failing downstream service can cause every caller waiting on it to pile up requests and eventually run out of resources themselves — a single point of failure cascading outward. Resilience patterns exist specifically to contain that kind of failure, and distributed tracing exists to make failures (and slowness) across many services actually diagnosable.`,
    sections: [
      {
        heading: 'The Circuit Breaker Pattern',
        body: `A circuit breaker wraps a call to a downstream service and tracks its recent failure rate. While failures stay below a threshold, the circuit is "closed" and calls proceed normally. Once failures cross that threshold, the circuit "opens": further calls fail immediately (without even attempting the network call) and are routed to a fallback instead, giving the struggling downstream service room to recover instead of being hit with a continuous flood of retries. After a cooldown period, the circuit moves to "half-open," letting a small number of trial calls through to test whether the downstream service has recovered.`,
      },
      {
        heading: 'Fallbacks — Degrading Gracefully',
        body: `A fallback method supplies a reasonable default or cached response when the real call can't be made — for example, returning a cached exchange rate, or a "results temporarily unavailable" message rather than crashing the whole request. This turns a hard failure into a degraded but still-functional user experience.`,
      },
      {
        heading: 'Distributed Tracing',
        body: `One user-facing request can fan out across many microservices. Without tracing, a slow or failing request looks like a mystery — which of the five services involved was actually the problem? Distributed tracing (typically Spring Cloud Sleuth generating trace/span IDs, shipped to a collector like Zipkin) tags every hop of a request's journey with a shared trace ID, so the entire path — and the time spent in each service — can be viewed together in one place, often reported asynchronously through a message broker like RabbitMQ so tracing itself never slows down the real request.`,
      },
    ],
    examples: [
      {
        caption: 'A circuit breaker with a fallback, using Resilience4j',
        code: `@Service
public class CurrencyConversionService {

    @Autowired private CurrencyExchangeProxy proxy;

    @CircuitBreaker(name = "currencyExchange", fallbackMethod = "fallback")
    public CurrencyExchange getExchange(String from, String to) {
        return proxy.retrieve(from, to);        // the real, potentially-failing network call
    }

    // Signature must match the original method, plus a Throwable parameter
    public CurrencyExchange fallback(String from, String to, Throwable t) {
        return new CurrencyExchange(from, to, BigDecimal.ONE, "Using fallback rate — service unavailable");
    }
}

# application.properties
resilience4j.circuitbreaker.instances.currencyExchange.failure-rate-threshold=50
resilience4j.circuitbreaker.instances.currencyExchange.sliding-window-size=10
resilience4j.circuitbreaker.instances.currencyExchange.wait-duration-in-open-state=10s`,
        output: `// While currency-exchange-service is down:
GET /currency-conversion/... -> 200 OK
{"from":"USD","to":"INR","conversionMultiple":1,"note":"Using fallback rate — service unavailable"}`,
      },
    ],
    commonMistakes: [
      'Retrying a failing downstream call indefinitely instead of opening a circuit breaker, amplifying load on an already-struggling service.',
      'Writing a fallback that silently returns success-looking data with no indication it\'s degraded, hiding a real outage from monitoring and from users.',
      'Deploying microservices without any distributed tracing, then trying to debug a slow, multi-service request purely from separate, uncorrelated service logs.',
      'Setting circuit breaker thresholds so sensitive that transient, harmless blips trip the circuit unnecessarily.',
    ],
    keyPoints: [
      'A circuit breaker stops calling a failing downstream service after too many failures, protecting both the caller and the struggling service.',
      'Fallback methods let a request degrade gracefully instead of failing outright when a circuit is open.',
      'Distributed tracing tags a request with a shared trace ID across every microservice it touches, making cross-service debugging feasible.',
      'Tracing data is typically shipped asynchronously (e.g. via RabbitMQ to Zipkin) so it never slows down the real request.',
    ],
  },
}
