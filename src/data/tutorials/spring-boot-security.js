// Spring Boot course — Spring Security series (Spring Security 7 / Spring Boot 4).
// Keys are slugs matching the topics listed under the Spring Security module
// in codelabDefaults.js.
export const springBootSecurity = {
  'spring-security-architecture-and-the-filter-chain': {
    title: 'Spring Security Architecture and the Filter Chain',
    intro: `Before you can configure Spring Security confidently, you need a mental model of what actually happens to an HTTP request between the moment it reaches Tomcat and the moment it reaches your controller. Almost every "why is this returning 401?" or "why is my filter being skipped?" question is answered by understanding this pipeline.

This lesson walks through the moving parts of Spring Security 7: the servlet filter that bridges into Spring, the FilterChainProxy that picks a SecurityFilterChain, the ordered security filters inside that chain, the AuthenticationManager and AuthenticationProvider that verify credentials, and the SecurityContext that stores the result for the rest of the request.`,
    sections: [
      {
        heading: 'From the Servlet Container to Spring: DelegatingFilterProxy',
        body: `Tomcat knows nothing about Spring beans; it only knows servlet filters registered with it. Spring Boot registers a single servlet filter named <code>springSecurityFilterChain</code>, implemented by <code>DelegatingFilterProxy</code>. Its only job is to look up a Spring bean and delegate every request to it. That bean is <code>FilterChainProxy</code>, which is where Spring Security really starts.

This indirection lets Spring Security's filters be ordinary Spring beans: they can be injected with dependencies, created lazily, and configured with the normal <code>@Bean</code> mechanism.`,
      },
      {
        heading: 'FilterChainProxy and Multiple SecurityFilterChains',
        body: `<code>FilterChainProxy</code> holds a list of <code>SecurityFilterChain</code> objects. For each request it walks that list in order and uses the <strong>first</strong> chain whose request matcher matches. Only that one chain runs; the others are ignored for the request.

This means you can have completely different security for different parts of your application — for example, stateless JWT authentication for <code>/api/**</code> and form login with sessions for everything else. You declare one <code>SecurityFilterChain</code> bean per area and control order with <code>@Order</code>. A chain without <code>securityMatcher(...)</code> matches every request, so it must always come last.`,
      },
      {
        heading: 'The Ordered Security Filters',
        body: `Inside a chain, filters run in a fixed, well-defined order. You rarely write these filters yourself; the <code>HttpSecurity</code> DSL adds and configures them for you. The most important ones, in order, are:`,
        list: [
          '<code>DisableEncodeUrlFilter</code> — stops session ids leaking into URLs.',
          '<code>SecurityContextHolderFilter</code> — loads the SecurityContext (for example from the HTTP session) at the start of the request.',
          '<code>HeaderWriterFilter</code> — adds security headers such as X-Content-Type-Options, X-Frame-Options and Cache-Control.',
          '<code>CorsFilter</code> — handles CORS preflight requests before authentication runs.',
          '<code>CsrfFilter</code> — rejects state-changing requests that lack a valid CSRF token.',
          '<code>LogoutFilter</code> — handles the logout URL.',
          '<code>UsernamePasswordAuthenticationFilter</code> — processes form login submissions.',
          '<code>BearerTokenAuthenticationFilter</code> — reads and validates <code>Authorization: Bearer</code> tokens (OAuth2 resource server).',
          '<code>BasicAuthenticationFilter</code> — processes HTTP Basic credentials.',
          '<code>AnonymousAuthenticationFilter</code> — installs an anonymous Authentication if nobody authenticated yet.',
          '<code>ExceptionTranslationFilter</code> — turns AuthenticationException into 401/login redirects and AccessDeniedException into 403.',
          '<code>AuthorizationFilter</code> — the last filter; applies your <code>authorizeHttpRequests</code> rules.',
        ],
      },
      {
        heading: 'Authentication: AuthenticationManager and Providers',
        body: `Filters that read credentials do not check them themselves. They build an unauthenticated <code>Authentication</code> object (for example a <code>UsernamePasswordAuthenticationToken</code> holding username and raw password) and hand it to the <code>AuthenticationManager</code>. The standard implementation, <code>ProviderManager</code>, asks each configured <code>AuthenticationProvider</code> in turn whether it supports that token type.

For username/password logins, <code>DaoAuthenticationProvider</code> loads the user through your <code>UserDetailsService</code>, compares the password with the <code>PasswordEncoder</code>, checks the account is enabled and not locked, and returns an <strong>authenticated</strong> token containing the user's authorities. If anything fails, it throws an <code>AuthenticationException</code>.`,
      },
      {
        heading: 'SecurityContext and SecurityContextHolder',
        body: `A successful authentication is stored in a <code>SecurityContext</code>, which lives in the <code>SecurityContextHolder</code>. By default the holder uses a <code>ThreadLocal</code>, so any code running on the request thread — controllers, services, repositories — can ask "who is the current user?".

In controllers, prefer the <code>@AuthenticationPrincipal</code> annotation or an <code>Authentication</code> method parameter over calling <code>SecurityContextHolder</code> directly; it is easier to test and clearer to read. Remember that the context is thread-bound: work you hand to another thread (for example with <code>@Async</code>) does not see it unless you propagate it with <code>DelegatingSecurityContextExecutor</code> or a similar helper.`,
      },
      {
        heading: 'Debugging the Chain',
        body: `When a request behaves unexpectedly, turn on security logging. Setting <code>logging.level.org.springframework.security=TRACE</code> prints every filter the request passes through and the decision each one made. It is the single most useful tool for understanding 401 and 403 responses. Turn it off again in production because it is very verbose.`,
      },
    ],
    examples: [
      {
        caption: 'Two SecurityFilterChains: a stateless API chain and a browser chain',
        code: `package com.webnest.shop.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // Checked first: only requests under /api/** reach this chain
    @Bean
    @Order(1)
    SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/**")
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/health").permitAll()
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

    // No securityMatcher: catches everything else, so it must come last
    @Bean
    @Order(2)
    SecurityFilterChain webChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/css/**", "/login").permitAll()
                .anyRequest().authenticated())
            .formLogin(Customizer.withDefaults())
            .logout(Customizer.withDefaults());
        return http.build();
    }
}`,
        output: `GET /api/health            -> 200 (apiChain, permitAll)
GET /api/orders            -> 401 with WWW-Authenticate: Basic (apiChain)
GET /dashboard             -> 302 redirect to /login (webChain, form login)
POST /login (valid creds)  -> 302 redirect to /dashboard, JSESSIONID cookie set`,
      },
      {
        caption: 'Reading the current user in a controller',
        code: `import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MeController {

    @GetMapping("/api/me")
    public Map<String, Object> me(@AuthenticationPrincipal UserDetails user) {
        return Map.of(
            "username", user.getUsername(),
            "authorities", user.getAuthorities().stream().map(Object::toString).toList());
    }

    @GetMapping("/api/me/raw")
    public String raw(Authentication authentication) {
        return authentication.getName() + " authenticated=" + authentication.isAuthenticated();
    }
}`,
        output: `curl -u asha:secret123 http://localhost:8080/api/me
{"username":"asha","authorities":["ROLE_USER"]}

curl -u asha:secret123 http://localhost:8080/api/me/raw
asha authenticated=true`,
      },
      {
        caption: 'Tracing the filter chain while debugging (application.properties)',
        code: `# Prints every security filter a request passes through and why it was allowed or denied
logging.level.org.springframework.security=TRACE`,
        output: `Securing GET /api/orders
Invoking DisableEncodeUrlFilter (1/12)
Invoking SecurityContextHolderFilter (2/12)
Invoking HeaderWriterFilter (3/12)
...
Invoking AuthorizationFilter (12/12)
Sending AnonymousAuthenticationToken [Principal=anonymousUser] to authentication entry point since access is denied`,
      },
    ],
    commonMistakes: [
      'Declaring several SecurityFilterChain beans without securityMatcher() and @Order — the first chain matches every request and the others never run.',
      'Adding a custom filter as a @Component without realising Spring Boot also registers it with the servlet container, so it runs twice (once outside the security chain). Register it only through http.addFilterBefore(...) or disable the automatic registration with a FilterRegistrationBean.',
      'Reading SecurityContextHolder inside an @Async method or a new thread and getting null because the context is thread-local.',
      'Leaving TRACE security logging enabled in production, which floods logs and can expose request details.',
    ],
    keyPoints: [
      'DelegatingFilterProxy bridges the servlet container to the FilterChainProxy bean, which selects the first matching SecurityFilterChain.',
      'Each chain is an ordered list of filters; AuthorizationFilter runs last and applies your authorizeHttpRequests rules.',
      'Credentials are verified by AuthenticationManager → AuthenticationProvider → UserDetailsService + PasswordEncoder.',
      'The authenticated user lives in the thread-bound SecurityContext; use @AuthenticationPrincipal in controllers.',
      'logging.level.org.springframework.security=TRACE shows exactly why a request was allowed or rejected.',
    ],
  },

  'authentication-with-users-and-roles': {
    title: 'Authentication with Users and Roles',
    intro: `Spring Security needs to know two things to log someone in: how to find a user by username, and how to check their password. The first is the job of a <code>UserDetailsService</code>; the second is the job of a <code>PasswordEncoder</code>. Swap either one and the rest of the framework keeps working unchanged.

In this lesson you will start with in-memory users for prototypes, move to the built-in JDBC user store, and finish with the approach most real applications use: your own JPA <code>User</code> entity loaded through a custom <code>UserDetailsService</code>, plus a registration endpoint that stores hashed passwords.`,
    sections: [
      {
        heading: 'UserDetails, GrantedAuthority, Roles and Authorities',
        body: `<code>UserDetails</code> is Spring Security's view of a user: a username, a hashed password, a collection of <code>GrantedAuthority</code> objects, and flags for enabled/locked/expired. A <strong>GrantedAuthority</strong> is just a string permission such as <code>orders:read</code>. A <strong>role</strong> is an authority with the <code>ROLE_</code> prefix — <code>hasRole("ADMIN")</code> checks for the authority <code>ROLE_ADMIN</code>.

Use roles for coarse groups of users (USER, ADMIN) and fine-grained authorities for specific permissions (orders:refund). Many applications store roles in the database and expand them into authorities when the user is loaded.`,
      },
      {
        heading: 'In-Memory Users for Prototypes and Tests',
        body: `<code>InMemoryUserDetailsManager</code> keeps users in a map. It is perfect for demos, internal tools and tests, and completely unsuitable for real users because accounts disappear on restart and cannot be managed at runtime. Declaring a <code>UserDetailsService</code> bean also stops Spring Boot from generating its random default password.`,
      },
      {
        heading: 'JdbcUserDetailsManager',
        body: `<code>JdbcUserDetailsManager</code> reads users from two tables, <code>users</code> and <code>authorities</code>, with a schema Spring Security ships in <code>org/springframework/security/core/userdetails/jdbc/users.ddl</code>. It also implements create, update, delete and change-password operations. It is useful when you want a quick database-backed store and do not need your own user model.`,
      },
      {
        heading: 'A Custom UserDetailsService Backed by JPA',
        body: `Most applications already have a <code>User</code> entity with fields like email, full name and signup date. You implement <code>UserDetailsService.loadUserByUsername</code> to look the user up with a repository and convert it into a <code>UserDetails</code>. Spring Boot detects your single <code>UserDetailsService</code> bean and a <code>PasswordEncoder</code> bean, and automatically builds the <code>DaoAuthenticationProvider</code> for you.

Always throw <code>UsernameNotFoundException</code> when the user does not exist. Spring Security deliberately converts this into a generic "Bad credentials" error so attackers cannot discover which usernames exist.`,
      },
      {
        heading: 'Registering Users Safely',
        body: `A registration endpoint must validate input, reject duplicate usernames, hash the password with the <code>PasswordEncoder</code> before saving, and assign a default role. Never accept roles from the request body; a user who can send <code>"roles":["ADMIN"]</code> should not become an administrator.`,
      },
      {
        heading: 'Custom Login Endpoints for APIs',
        body: `Form login and HTTP Basic cover many cases, but single-page apps and mobile clients often POST JSON to <code>/api/auth/login</code>. You can inject the <code>AuthenticationManager</code> and call <code>authenticate()</code> yourself. On success you either save the context into the session (stateful) or issue a token (stateless; see the JWT lesson).`,
      },
    ],
    examples: [
      {
        caption: 'In-memory users with roles (prototype only)',
        code: `@Configuration
public class InMemoryUsersConfig {

    @Bean
    UserDetailsService users(PasswordEncoder encoder) {
        UserDetails asha = User.withUsername("asha")
            .password(encoder.encode("user123"))
            .roles("USER")
            .build();
        UserDetails admin = User.withUsername("admin")
            .password(encoder.encode("admin123"))
            .roles("USER", "ADMIN")
            .build();
        return new InMemoryUserDetailsManager(asha, admin);
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}`,
        output: `curl -u asha:user123 http://localhost:8080/api/me  -> 200 {"username":"asha","authorities":["ROLE_USER"]}
curl -u asha:wrong   http://localhost:8080/api/me  -> 401 Unauthorized`,
      },
      {
        caption: 'JPA entities for users and roles',
        code: `@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private boolean enabled = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "app_user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles = new HashSet<>();

    protected AppUser() {}

    public AppUser(String email, String passwordHash, Set<String> roles) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles;
    }

    // getters omitted for brevity
}

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}`,
        output: `Hibernate: create table app_users (id bigint generated by default as identity, email varchar(255) not null unique, enabled boolean not null, password_hash varchar(255) not null, primary key (id))
Hibernate: create table app_user_roles (user_id bigint not null, role varchar(255))`,
      },
      {
        caption: 'Custom UserDetailsService that loads users from the database',
        code: `@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final AppUserRepository users;

    public DatabaseUserDetailsService(AppUserRepository users) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = users.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new UsernameNotFoundException("No user " + email));

        return User.withUsername(user.getEmail())
            .password(user.getPasswordHash())
            .disabled(!user.isEnabled())
            .roles(user.getRoles().toArray(String[]::new))
            .build();
    }
}`,
        output: `curl -u asha@webnest.in:user123 http://localhost:8080/api/me
{"username":"asha@webnest.in","authorities":["ROLE_USER"]}`,
      },
      {
        caption: 'Registration and JSON login endpoints',
        code: `public record RegisterRequest(@Email @NotBlank String email,
                              @NotBlank @Size(min = 12, max = 128) String password) {}

public record LoginRequest(@NotBlank String email, @NotBlank String password) {}

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;

    public AuthController(AppUserRepository users, PasswordEncoder encoder,
                          AuthenticationManager authManager) {
        this.users = users;
        this.encoder = encoder;
        this.authManager = authManager;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest req) {
        if (users.existsByEmailIgnoreCase(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        // Role is decided by the server, never by the client
        users.save(new AppUser(req.email(), encoder.encode(req.password()), Set.of("USER")));
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
            UsernamePasswordAuthenticationToken.unauthenticated(req.email(), req.password()));
        return Map.of("user", auth.getName(), "authorities",
            auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
    }
}

// Expose the AuthenticationManager Spring Boot builds from your UserDetailsService
@Bean
AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
}`,
        output: `POST /api/auth/register {"email":"ravi@webnest.in","password":"correct-horse-battery"} -> 201 Created
POST /api/auth/register (same email again)                                          -> 409 Conflict
POST /api/auth/login {"email":"ravi@webnest.in","password":"correct-horse-battery"}  -> 200 {"user":"ravi@webnest.in","authorities":["ROLE_USER"]}
POST /api/auth/login (wrong password)                                               -> 401 Unauthorized`,
      },
    ],
    commonMistakes: [
      'Storing the raw password or calling encoder.encode() on every login instead of letting DaoAuthenticationProvider call encoder.matches().',
      'Revealing whether an account exists with messages like "user not found" versus "wrong password" — always return the same generic error.',
      'Accepting roles from the registration request body, which lets any user make themselves an administrator.',
      'Defining two UserDetailsService beans; Spring Boot then cannot choose one and does not auto-configure the authentication provider.',
      'Forgetting the ROLE_ prefix difference: roles("ADMIN") creates ROLE_ADMIN, while authorities("ADMIN") creates plain ADMIN, which hasRole("ADMIN") will not match.',
    ],
    keyPoints: [
      'UserDetailsService finds users; PasswordEncoder checks passwords; DaoAuthenticationProvider combines them.',
      'Roles are authorities prefixed with ROLE_; use authorities for fine-grained permissions.',
      'InMemoryUserDetailsManager is for prototypes and tests; real apps load users from a database.',
      'Registration must validate input, reject duplicates, hash passwords and assign roles on the server.',
      'Inject AuthenticationManager when you need a custom JSON login endpoint.',
    ],
  },

  'password-encoding': {
    title: 'Password Encoding and Hashing',
    intro: `A password database will eventually leak — through a backup, a SQL injection bug, or a misconfigured server. Password hashing is what decides whether that leak is an embarrassment or a disaster. Spring Security's <code>PasswordEncoder</code> abstraction makes the safe choice the easy one.

This lesson explains why passwords are hashed rather than encrypted, which algorithms Spring Security supports, why <code>DelegatingPasswordEncoder</code> with its <code>{id}</code> prefix is the recommended default, and how to upgrade old hashes to stronger ones automatically as users log in.`,
    sections: [
      {
        heading: 'Hashing, Not Encryption',
        body: `Encryption is reversible: whoever has the key can recover the original password. Hashing is one-way: you can check whether a password matches the hash, but you cannot get the password back. Applications never need the original password, only a yes/no answer to "does this match?", so hashing is always the right tool.

Fast hashes such as MD5 or SHA-256 are the wrong kind of hash for passwords. Attackers with a GPU can try billions of guesses per second against them. Password hashing algorithms are deliberately <strong>slow</strong> and add a random <strong>salt</strong> per password, so identical passwords produce different hashes and precomputed rainbow tables are useless.`,
      },
      {
        heading: 'Algorithms Supported by Spring Security',
        body: `Spring Security provides encoders for the modern adaptive algorithms. Each has a work factor you can raise over time as hardware gets faster.`,
        list: [
          '<code>BCryptPasswordEncoder</code> — the long-standing default. Strength (log rounds) defaults to 10; aim for a hash that takes roughly 250ms–1s on your servers. BCrypt only uses the first 72 bytes of a password.',
          '<code>Argon2PasswordEncoder</code> — winner of the Password Hashing Competition, memory-hard so GPU attacks are expensive. Requires the BouncyCastle library.',
          '<code>SCryptPasswordEncoder</code> — also memory-hard. Requires BouncyCastle.',
          '<code>Pbkdf2PasswordEncoder</code> — use when FIPS compliance is required.',
          '<code>NoOpPasswordEncoder</code> — stores plain text. Deprecated and only for legacy tests; never use it in real code.',
        ],
      },
      {
        heading: 'DelegatingPasswordEncoder and the {id} Prefix',
        body: `<code>PasswordEncoderFactories.createDelegatingPasswordEncoder()</code> returns an encoder that stores the algorithm name in front of each hash, for example <code>{bcrypt}$2a$10$...</code> or <code>{argon2@SpringSecurity_v5_8}$argon2id$...</code>. When checking a password it reads the prefix and delegates to the right algorithm.

This means you can change your default algorithm tomorrow without breaking existing users: old hashes still verify with their old algorithm, and new hashes use the new one.`,
      },
      {
        heading: 'Upgrading Hashes on Login',
        body: `<code>DaoAuthenticationProvider</code> asks the encoder <code>upgradeEncoding(hash)</code> after a successful login. If the answer is true and a <code>UserDetailsPasswordService</code> bean exists, Spring Security re-hashes the password the user just typed with the current algorithm and calls <code>updatePassword</code> so you can save it. Over a few months, active users migrate to the stronger hash without resetting their passwords.`,
      },
      {
        heading: 'Checking for Compromised Passwords',
        body: `Spring Security includes a <code>CompromisedPasswordChecker</code> API with a <code>HaveIBeenPwnedRestApiPasswordChecker</code> implementation. It sends only the first five characters of the password's SHA-1 hash to the Have I Been Pwned service (k-anonymity), so the real password never leaves your server. Use it on registration and password change to reject passwords that already appear in public breaches.`,
      },
    ],
    examples: [
      {
        caption: 'Encoding and matching passwords',
        code: `PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();

String hash1 = encoder.encode("correct-horse-battery");
String hash2 = encoder.encode("correct-horse-battery");

System.out.println(hash1);
System.out.println(hash2);
System.out.println("same hash? " + hash1.equals(hash2));
System.out.println("matches?   " + encoder.matches("correct-horse-battery", hash1));
System.out.println("wrong pwd? " + encoder.matches("wrong", hash1));`,
        output: `{bcrypt}$2a$10$8XJq1lZ0uXk9s2e5b3m1eOq7m0p2Qm0Y1l0ZkJfY5uS0dJ7cXo0yW
{bcrypt}$2a$10$Qm3rF1n2Lx8Hk5s0Tq9pUe2dYc1bN7aR4vW6zP0oK3jH8gS5fD2aC
same hash? false
matches?   true
wrong pwd? false`,
      },
      {
        caption: 'Choosing Argon2 as the default while still accepting old bcrypt hashes',
        code: `@Bean
PasswordEncoder passwordEncoder() {
    String defaultId = "argon2";
    Map<String, PasswordEncoder> encoders = new HashMap<>();
    encoders.put("argon2", Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8());
    encoders.put("bcrypt", new BCryptPasswordEncoder(12));
    return new DelegatingPasswordEncoder(defaultId, encoders);
}

// pom.xml — Argon2 needs BouncyCastle on the classpath
// <dependency>
//     <groupId>org.bouncycastle</groupId>
//     <artifactId>bcprov-jdk18on</artifactId>
// </dependency>`,
        output: `New hashes:      {argon2}$argon2id$v=19$m=16384,t=2,p=1$...
Old hashes:      {bcrypt}$2a$10$...  -> still verify correctly`,
      },
      {
        caption: 'Automatically upgrading old hashes when users log in',
        code: `@Service
public class DatabaseUserDetailsService implements UserDetailsService, UserDetailsPasswordService {

    private final AppUserRepository users;

    public DatabaseUserDetailsService(AppUserRepository users) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        AppUser u = users.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new UsernameNotFoundException(email));
        return User.withUsername(u.getEmail()).password(u.getPasswordHash())
            .roles(u.getRoles().toArray(String[]::new)).build();
    }

    // Called by Spring Security after a successful login when the stored hash is outdated
    @Override
    @Transactional
    public UserDetails updatePassword(UserDetails user, String newEncodedPassword) {
        AppUser u = users.findByEmailIgnoreCase(user.getUsername()).orElseThrow();
        u.setPasswordHash(newEncodedPassword);
        return User.withUserDetails(user).password(newEncodedPassword).build();
    }
}`,
        output: `Before login:  password_hash = {bcrypt}$2a$10$...
After login:   password_hash = {argon2}$argon2id$v=19$m=16384,t=2,p=1$...`,
      },
      {
        caption: 'Rejecting breached passwords at registration',
        code: `@Bean
CompromisedPasswordChecker compromisedPasswordChecker() {
    return new HaveIBeenPwnedRestApiPasswordChecker();
}

@PostMapping("/register")
public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
    if (compromisedPasswordChecker.check(req.password()).isCompromised()) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "This password appeared in a data breach. Choose another."));
    }
    // ... hash and save as usual
    return ResponseEntity.status(HttpStatus.CREATED).build();
}`,
        output: `POST /api/auth/register {"password":"password123"} -> 400 {"error":"This password appeared in a data breach. Choose another."}
POST /api/auth/register {"password":"violet-otter-canoe-47"} -> 201 Created`,
      },
    ],
    commonMistakes: [
      'Hashing passwords with SHA-256 or MD5 because they are "secure hashes" — they are far too fast for password storage.',
      'Comparing hashes with equals() instead of encoder.matches(); salted hashes of the same password are never equal.',
      'Creating new BCryptPasswordEncoder() in several places with different strengths instead of one PasswordEncoder bean.',
      'Storing hashes without the {id} prefix, which makes future algorithm migration painful.',
      'Setting a bcrypt strength so high (for example 16) that each login takes seconds and becomes a denial-of-service vector.',
    ],
    keyPoints: [
      'Passwords are hashed with slow, salted, adaptive algorithms — never encrypted and never fast-hashed.',
      'Use PasswordEncoderFactories.createDelegatingPasswordEncoder(); its {id} prefix enables painless algorithm changes.',
      'BCrypt is a solid default; Argon2 is the strongest widely available option.',
      'Implement UserDetailsPasswordService to upgrade old hashes transparently on login.',
      'CompromisedPasswordChecker blocks passwords known from public breaches without sending the password anywhere.',
    ],
  },

  'authorization-rules-and-method-security': {
    title: 'Authorization Rules and Method Security',
    intro: `Authentication tells you who the user is. Authorization decides what they may do — and it is where most real security bugs live. A missing check on one endpoint is enough for any logged-in user to read another customer's orders.

Spring Security gives you two complementary layers. <strong>URL-based rules</strong> in <code>authorizeHttpRequests</code> protect whole areas of the application. <strong>Method security</strong> with <code>@PreAuthorize</code> and <code>@PostAuthorize</code> protects individual service methods and can check ownership of specific records. This lesson covers both, plus custom authorization logic and role hierarchies.`,
    sections: [
      {
        heading: 'URL-Based Rules with authorizeHttpRequests',
        body: `Rules are evaluated <strong>top to bottom and the first match wins</strong>, so put specific rules before general ones and end with <code>anyRequest()</code>. In Spring Security 7, string patterns are matched with <code>PathPatternRequestMatcher</code> (the old <code>AntPathRequestMatcher</code> and <code>MvcRequestMatcher</code> were removed).`,
        list: [
          '<code>permitAll()</code> — anyone, including anonymous users.',
          '<code>authenticated()</code> — any logged-in user.',
          '<code>hasRole("ADMIN")</code> / <code>hasAnyRole("ADMIN","SUPPORT")</code> — checks ROLE_-prefixed authorities.',
          '<code>hasAuthority("orders:refund")</code> / <code>hasAnyAuthority(...)</code> — checks exact authority strings.',
          '<code>denyAll()</code> — nobody; useful as a safe final rule in locked-down apps.',
          '<code>access(AuthorizationManager)</code> — any custom logic you like.',
        ],
      },
      {
        heading: 'Enabling Method Security',
        body: `Add <code>@EnableMethodSecurity</code> to a configuration class. Spring then wraps your beans in proxies that check annotations before (or after) each method call. Because it uses proxies, the checks apply only to calls that come <strong>from another bean</strong>; a method calling another method on <code>this</code> bypasses the proxy.`,
        list: [
          '<code>@PreAuthorize("hasRole(\'ADMIN\')")</code> — checked before the method runs; the most common annotation.',
          '<code>@PostAuthorize("returnObject.owner == authentication.name")</code> — checked after, with access to the returned value.',
          '<code>@PreFilter</code> / <code>@PostFilter</code> — filter collections passed in or returned.',
          '<code>@Secured</code> and JSR-250 <code>@RolesAllowed</code> — simpler role-only annotations, enabled with attributes on @EnableMethodSecurity.',
        ],
      },
      {
        heading: 'Ownership Checks with SpEL and Beans',
        body: `The most important authorization rule in most applications is "users may only access their own data". SpEL expressions in <code>@PreAuthorize</code> can reference method parameters with <code>#name</code>, the current user with <code>authentication</code> or <code>principal</code>, and any Spring bean with <code>@beanName</code>. Moving complex checks into a dedicated bean keeps annotations readable and makes the logic unit-testable.`,
      },
      {
        heading: 'Custom AuthorizationManager',
        body: `For URL rules that need logic beyond roles — office hours, IP ranges, feature flags, tenant membership — implement <code>AuthorizationManager&lt;RequestAuthorizationContext&gt;</code> and plug it in with <code>.access(...)</code>. Its <code>authorize</code> method receives a supplier of the current Authentication and the request context, and returns an <code>AuthorizationDecision</code>.`,
      },
      {
        heading: 'Role Hierarchies',
        body: `Instead of giving an administrator every role explicitly, declare a <code>RoleHierarchy</code> bean such as <code>ADMIN &gt; STAFF &gt; USER</code>. Anyone with ROLE_ADMIN is then treated as also having ROLE_STAFF and ROLE_USER, for both URL rules and method security.`,
      },
      {
        heading: 'Returning 403 vs 404',
        body: `When a user asks for a record they do not own, a 403 confirms the record exists. For sensitive resources (medical records, private documents) many teams return 404 instead so that ids cannot be probed. Decide consistently and document it.`,
      },
    ],
    examples: [
      {
        caption: 'Ordered URL rules (most specific first)',
        code: `@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
            .requestMatchers("/api/orders/*/refund").hasAuthority("orders:refund")
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .httpBasic(Customizer.withDefaults());
    return http.build();
}`,
        output: `GET  /api/products/3          (anonymous) -> 200
POST /api/products            (ROLE_USER) -> 403 Forbidden
POST /api/orders/9/refund     (support user with orders:refund) -> 200
GET  /api/orders              (anonymous) -> 401 Unauthorized`,
      },
      {
        caption: 'Method security with ownership checks',
        code: `@Configuration
@EnableMethodSecurity
public class MethodSecurityConfig {}

@Service
public class OrderService {

    private final OrderRepository orders;

    public OrderService(OrderRepository orders) {
        this.orders = orders;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> findAll() {
        return orders.findAll();
    }

    // Users may only list their own orders; admins may list anyone's
    @PreAuthorize("#customerEmail == authentication.name or hasRole('ADMIN')")
    public List<Order> findForCustomer(String customerEmail) {
        return orders.findByCustomerEmail(customerEmail);
    }

    // Checked after loading, using the returned object
    @PostAuthorize("returnObject.customerEmail == authentication.name or hasRole('ADMIN')")
    public Order findById(Long id) {
        return orders.findById(id).orElseThrow();
    }

    // Removes items the caller may not see from the returned list
    @PostFilter("filterObject.visibleTo(authentication.name)")
    public List<Order> recent() {
        return new ArrayList<>(orders.findTop50ByOrderByCreatedAtDesc());
    }
}`,
        output: `asha calls findForCustomer("asha@webnest.in")  -> list of Asha's orders
asha calls findForCustomer("ravi@webnest.in")  -> AccessDeniedException -> HTTP 403
admin calls findForCustomer("ravi@webnest.in") -> list of Ravi's orders`,
      },
      {
        caption: 'Moving authorization logic into a testable bean',
        code: `@Component("orderAuth")
public class OrderAuthorization {

    private final OrderRepository orders;

    public OrderAuthorization(OrderRepository orders) {
        this.orders = orders;
    }

    public boolean canCancel(Long orderId, Authentication auth) {
        return orders.findById(orderId)
            .map(o -> o.getCustomerEmail().equals(auth.getName()) && o.getStatus() == OrderStatus.PLACED)
            .orElse(false);
    }
}

@PreAuthorize("@orderAuth.canCancel(#orderId, authentication)")
public void cancel(Long orderId) {
    // only reached when the caller owns an order that is still cancellable
}`,
        output: `DELETE /api/orders/41 (owner, status PLACED)   -> 204 No Content
DELETE /api/orders/41 (owner, status SHIPPED)  -> 403 Forbidden
DELETE /api/orders/41 (different user)         -> 403 Forbidden`,
      },
      {
        caption: 'Custom AuthorizationManager and role hierarchy',
        code: `// Allow the reports area only during office hours, and only for staff
public class OfficeHoursAuthorizationManager
        implements AuthorizationManager<RequestAuthorizationContext> {

    private final Clock clock;

    public OfficeHoursAuthorizationManager(Clock clock) {
        this.clock = clock;
    }

    @Override
    public AuthorizationResult authorize(Supplier<? extends Authentication> authentication,
                                         RequestAuthorizationContext context) {
        int hour = LocalTime.now(clock).getHour();
        boolean isStaff = authentication.get().getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));
        return new AuthorizationDecision(isStaff && hour >= 9 && hour < 18);
    }
}

@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/reports/**").access(new OfficeHoursAuthorizationManager(Clock.systemDefaultZone()))
        .anyRequest().authenticated());
    return http.build();
}

// ADMIN implies STAFF, which implies USER
@Bean
static RoleHierarchy roleHierarchy() {
    return RoleHierarchyImpl.withDefaultRolePrefix()
        .role("ADMIN").implies("STAFF")
        .role("STAFF").implies("USER")
        .build();
}`,
        output: `GET /api/reports/sales (ROLE_ADMIN, 11:00) -> 200 (ADMIN implies STAFF)
GET /api/reports/sales (ROLE_STAFF, 21:30) -> 403 Forbidden
GET /api/reports/sales (ROLE_USER,  11:00) -> 403 Forbidden`,
      },
    ],
    commonMistakes: [
      'Placing anyRequest().authenticated() before more specific rules — it matches first, so later rules never apply (Spring Security fails fast on this at startup).',
      'Protecting only the controller URL and forgetting that another endpoint calls the same service method without any check. Put ownership checks in the service layer.',
      'Expecting @PreAuthorize to work on a private method or on a self-call from the same class; proxies only intercept public calls from other beans.',
      'Checking only "is the user logged in?" and trusting the id in the URL — the classic IDOR (insecure direct object reference) vulnerability.',
      'Forgetting @EnableMethodSecurity, so every @PreAuthorize annotation is silently ignored.',
    ],
    keyPoints: [
      'authorizeHttpRequests rules are evaluated top-down; the first match wins, so order from specific to general.',
      '@EnableMethodSecurity activates @PreAuthorize, @PostAuthorize, @PreFilter and @PostFilter on bean methods.',
      'Ownership checks ("is this my order?") belong in the service layer, ideally in a dedicated authorization bean.',
      'Custom AuthorizationManager implementations handle rules that roles alone cannot express.',
      'RoleHierarchy lets higher roles inherit lower roles without duplicating assignments.',
    ],
  },

  'jwt-authentication-with-oauth2-resource-server': {
    title: 'JWT Authentication with OAuth2 Resource Server',
    intro: `The JWT concepts lesson showed a hand-written filter that parses tokens. In real projects you should not write that filter yourself: token parsing, signature verification, expiry checks, clock skew and error responses are subtle, and Spring Security already implements them correctly in its <strong>OAuth2 Resource Server</strong> support.

In this lesson you will build a complete stateless JWT setup with Spring Boot 4: a login endpoint that issues signed tokens with <code>JwtEncoder</code>, a resource server that validates them with <code>JwtDecoder</code>, mapping of claims to authorities, and configuration for validating tokens issued by an external identity provider such as Keycloak, Auth0 or Okta.`,
    sections: [
      {
        heading: 'The Starter and What It Configures',
        body: `Add <code>spring-boot-starter-security-oauth2-resource-server</code> (renamed from <code>spring-boot-starter-oauth2-resource-server</code> in Boot 4). When you call <code>http.oauth2ResourceServer(o -&gt; o.jwt(...))</code>, Spring Security adds a <code>BearerTokenAuthenticationFilter</code> that reads the <code>Authorization: Bearer</code> header, passes the token to a <code>JwtDecoder</code>, and — if valid — stores a <code>JwtAuthenticationToken</code> in the SecurityContext. Invalid or expired tokens produce a 401 with a <code>WWW-Authenticate: Bearer error="invalid_token"</code> header.`,
      },
      {
        heading: 'Symmetric vs Asymmetric Signing',
        body: `With <strong>HS256</strong> (HMAC) the same secret signs and verifies tokens. It is simple but every service that verifies tokens must hold the secret, and any of them could therefore also mint tokens. With <strong>RS256/ES256</strong> a private key signs and a public key verifies, so only the issuer can create tokens while any service can verify them. Use asymmetric keys whenever more than one service consumes the tokens, and load keys from a secret store — never commit them to source control.`,
      },
      {
        heading: 'Issuing Tokens with JwtEncoder',
        body: `If your application is its own token issuer, define a <code>JwtEncoder</code> bean (<code>NimbusJwtEncoder</code>) and build a <code>JwtClaimsSet</code> containing issuer, subject, issued-at, expiry and your custom claims (for example <code>scope</code> or <code>roles</code>). Keep access tokens short-lived — 5 to 15 minutes is common — and use refresh tokens or re-login for longer sessions.

For anything beyond a single application, prefer a dedicated authorization server (see the Spring Authorization Server lesson) rather than issuing tokens from your API.`,
      },
      {
        heading: 'Validating Tokens from an External Issuer',
        body: `When tokens come from Keycloak, Auth0, Okta, Azure Entra ID or Spring Authorization Server, you usually need only one property: <code>spring.security.oauth2.resourceserver.jwt.issuer-uri</code>. At startup Spring discovers the issuer's JWK Set URL from its OpenID configuration, downloads the public keys, and validates the signature, expiry and <code>iss</code> claim of every token. Add an audience check so tokens meant for other APIs are rejected.`,
      },
      {
        heading: 'Mapping Claims to Authorities',
        body: `By default, values in the <code>scope</code> or <code>scp</code> claim become authorities prefixed with <code>SCOPE_</code> — so a token with <code>scope: "orders.read"</code> grants <code>SCOPE_orders.read</code>. If your tokens carry roles in a different claim, configure a <code>JwtAuthenticationConverter</code> with a <code>JwtGrantedAuthoritiesConverter</code> pointing at that claim and a <code>ROLE_</code> prefix. Spring Boot 4.1 also offers <code>spring.security.oauth2.resourceserver.jwt.authorities-claim-expressions</code> to extract authorities from nested claims with SpEL.`,
      },
      {
        heading: 'Refresh Tokens and Logout',
        body: `JWT access tokens cannot be revoked once issued, which is why they must be short-lived. A refresh token — long-lived, stored server-side or in an HttpOnly cookie, rotated on every use — lets the client get new access tokens without re-entering a password. "Logout" then means deleting the refresh token; the access token simply expires within minutes.`,
      },
    ],
    examples: [
      {
        caption: 'pom.xml and application.yml for a self-issuing API',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security-oauth2-resource-server</artifactId>
</dependency>

# application.yml — keys are loaded from files/secrets, never committed
app:
  jwt:
    issuer: https://api.webnest.in
    ttl: 15m
    public-key: file:/run/secrets/jwt-public.pem
    private-key: file:/run/secrets/jwt-private.pem`,
        output: '(Generate a key pair for local development with: openssl genpkey -algorithm RSA -out jwt-private.pem -pkeyopt rsa_keygen_bits:2048 && openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem)',
      },
      {
        caption: 'Security configuration with JwtEncoder and JwtDecoder beans',
        code: `@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(String issuer, Duration ttl,
                           RSAPublicKey publicKey, RSAPrivateKey privateKey) {}

@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(JwtProperties.class)
public class JwtSecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/token").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .csrf(csrf -> csrf.disable());   // no cookies, so no CSRF risk
        return http.build();
    }

    @Bean
    JwtDecoder jwtDecoder(JwtProperties props) {
        return NimbusJwtDecoder.withPublicKey(props.publicKey()).build();
    }

    @Bean
    JwtEncoder jwtEncoder(JwtProperties props) {
        JWK jwk = new RSAKey.Builder(props.publicKey()).privateKey(props.privateKey()).build();
        return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(jwk)));
    }
}`,
        output: '(Spring Boot converts the PEM files referenced in app.jwt.public-key/private-key into RSAPublicKey/RSAPrivateKey automatically.)',
      },
      {
        caption: 'A token endpoint that authenticates the user and issues a JWT',
        code: `@RestController
@RequestMapping("/api/auth")
public class TokenController {

    private final AuthenticationManager authManager;
    private final JwtEncoder encoder;
    private final JwtProperties props;

    public TokenController(AuthenticationManager authManager, JwtEncoder encoder, JwtProperties props) {
        this.authManager = authManager;
        this.encoder = encoder;
        this.props = props;
    }

    public record TokenRequest(@NotBlank String username, @NotBlank String password) {}
    public record TokenResponse(String accessToken, long expiresIn) {}

    @PostMapping("/token")
    public TokenResponse token(@Valid @RequestBody TokenRequest req) {
        Authentication auth = authManager.authenticate(
            UsernamePasswordAuthenticationToken.unauthenticated(req.username(), req.password()));

        Instant now = Instant.now();
        String scope = auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .map(a -> a.replace("ROLE_", "").toLowerCase())
            .collect(Collectors.joining(" "));

        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer(props.issuer())
            .issuedAt(now)
            .expiresAt(now.plus(props.ttl()))
            .subject(auth.getName())
            .claim("scope", scope)
            .build();

        String token = encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        return new TokenResponse(token, props.ttl().toSeconds());
    }
}`,
        output: `curl -X POST localhost:8080/api/auth/token -H "Content-Type: application/json" \\
     -d '{"username":"asha","password":"user123"}'
{"accessToken":"eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS53ZWJuZXN0LmluIiwic3ViIjoiYXNoYSIsInNjb3BlIjoidXNlciJ9.kX3...","expiresIn":900}`,
      },
      {
        caption: 'Using the token and protecting endpoints with scopes',
        code: `@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_user')")
    public List<String> myOrders(@AuthenticationPrincipal Jwt jwt) {
        return List.of("Order #1001 for " + jwt.getSubject());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public void delete(@PathVariable Long id) { }
}`,
        output: `curl localhost:8080/api/orders -H "Authorization: Bearer eyJhbGciOi..."
["Order #1001 for asha"]

curl localhost:8080/api/orders          (no token)      -> 401, WWW-Authenticate: Bearer
curl ... (expired token)                                -> 401, error="invalid_token", error_description="Jwt expired at 2026-09-27T10:15:00Z"
curl -X DELETE ... (token with scope "user" only)       -> 403, error="insufficient_scope"`,
      },
      {
        caption: 'Validating tokens from Keycloak/Auth0 with audience check and role mapping',
        code: `# application.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://auth.webnest.in/realms/shop
          audiences: orders-api

// Map a "roles" claim to ROLE_ authorities instead of the default SCOPE_ mapping
@Bean
JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
    roles.setAuthoritiesClaimName("roles");
    roles.setAuthorityPrefix("ROLE_");

    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(roles);
    converter.setPrincipalClaimName("preferred_username");
    return converter;
}`,
        output: `Token payload: {"iss":"https://auth.webnest.in/realms/shop","aud":"orders-api","preferred_username":"asha","roles":["ADMIN"]}
Resulting Authentication: name=asha, authorities=[ROLE_ADMIN]
Token with aud "billing-api" -> 401 invalid_token (audience mismatch)`,
      },
    ],
    commonMistakes: [
      'Writing a custom JWT parsing filter instead of using oauth2ResourceServer().jwt(), and missing checks such as expiry, algorithm confusion or issuer validation.',
      'Hard-coding the signing secret in application.properties and committing it to Git.',
      'Issuing access tokens that last days or weeks; they cannot be revoked, so a stolen token stays valid.',
      'Forgetting that the default authority prefix is SCOPE_, then wondering why hasRole("ADMIN") never matches.',
      'Skipping the audience check, which lets a token issued for a different API be replayed against yours.',
    ],
    keyPoints: [
      'Use spring-boot-starter-security-oauth2-resource-server and oauth2ResourceServer(o -> o.jwt(...)) rather than a hand-written filter.',
      'JwtEncoder issues tokens; JwtDecoder validates signature, expiry and issuer on every request.',
      'For external identity providers, issuer-uri plus audiences is usually all the configuration you need.',
      'Scopes map to SCOPE_ authorities by default; customise with JwtAuthenticationConverter.',
      'Keep access tokens short-lived and use rotated refresh tokens for long sessions.',
    ],
  },

  'oauth2-login-with-google-and-github': {
    title: 'OAuth2 Login with Google and GitHub',
    intro: `"Sign in with Google" and "Sign in with GitHub" buttons are now expected on almost every consumer site. They remove password handling from your application entirely: the provider authenticates the user, and your app receives a verified identity.

Spring Security's OAuth2 Client support implements the full <strong>Authorization Code flow</strong> (with PKCE) and OpenID Connect for you. In this lesson you will register apps with Google and GitHub, configure Spring Boot with a few properties, read the logged-in user's details, link social accounts to your own user table, and call provider APIs on the user's behalf.`,
    sections: [
      {
        heading: 'How the Authorization Code Flow Works',
        body: `When the user clicks "Login with Google", the browser is redirected to Google with your client id, the requested scopes, a random <code>state</code> value and a PKCE challenge. The user signs in at Google and approves access. Google redirects back to <code>/login/oauth2/code/google</code> with a short-lived authorization <strong>code</strong>. Spring Security exchanges that code (plus the PKCE verifier and your client secret) for tokens in a server-to-server call, validates the ID token, loads the user's profile, and creates an authenticated session. Your code never sees the user's Google password.`,
      },
      {
        heading: 'OAuth2 vs OpenID Connect',
        body: `OAuth2 is an <strong>authorization</strong> protocol: it gives your app an access token to call APIs. OpenID Connect (OIDC) adds <strong>authentication</strong> on top: a signed ID token that states who the user is. Google supports OIDC, so you get an <code>OidcUser</code> with verified email and name. GitHub supports plain OAuth2, so Spring calls GitHub's user-info API and gives you an <code>OAuth2User</code> with GitHub's attributes.`,
      },
      {
        heading: 'Registering Your Application with Providers',
        body: `Each provider needs a client id and secret. The redirect URI you register must exactly match Spring's default pattern <code>{baseUrl}/login/oauth2/code/{registrationId}</code>.`,
        list: [
          'Google: Google Cloud Console → APIs & Services → Credentials → OAuth client ID → Web application. Redirect URI: <code>http://localhost:8080/login/oauth2/code/google</code>.',
          'GitHub: Settings → Developer settings → OAuth Apps → New OAuth App. Callback URL: <code>http://localhost:8080/login/oauth2/code/github</code>.',
          'Store secrets in environment variables or a secret manager, and register separate apps for development and production.',
        ],
      },
      {
        heading: 'Linking Social Logins to Your Own Users',
        body: `Most apps still need their own user record for orders, preferences and roles. Implement a custom <code>OAuth2UserService</code> (or <code>OidcUserService</code> for Google) that delegates to the default service, then finds or creates a local user by provider and provider user id, and returns a principal carrying your application's roles. Match on the provider's stable user id (<code>sub</code> for Google, <code>id</code> for GitHub), not on email alone, because emails can change and not every provider verifies them.`,
      },
      {
        heading: 'Calling Provider APIs with the Access Token',
        body: `The tokens returned by the provider are stored in an <code>OAuth2AuthorizedClient</code>. Inject it into a controller with <code>@RegisteredOAuth2AuthorizedClient("github")</code>, or configure a <code>RestClient</code> with <code>OAuth2ClientHttpRequestInterceptor</code> so that the access token is attached (and refreshed) automatically.`,
      },
    ],
    examples: [
      {
        caption: 'Dependencies and provider configuration',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security-oauth2-client</artifactId>
</dependency>

# application.yml — Google and GitHub are pre-defined providers,
# so only the client id and secret are required
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: \${GOOGLE_CLIENT_ID}
            client-secret: \${GOOGLE_CLIENT_SECRET}
            scope: openid, profile, email
          github:
            client-id: \${GITHUB_CLIENT_ID}
            client-secret: \${GITHUB_CLIENT_SECRET}
            scope: read:user, user:email`,
        output: '(Visiting http://localhost:8080/login now shows a generated page with "Google" and "GitHub" links.)',
      },
      {
        caption: 'Security configuration with a custom login page',
        code: `@Configuration
public class OAuthLoginConfig {

    @Bean
    SecurityFilterChain web(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/css/**", "/error").permitAll()
                .anyRequest().authenticated())
            .oauth2Login(oauth -> oauth
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard", true))
            .logout(logout -> logout.logoutSuccessUrl("/"));
        return http.build();
    }
}

<!-- templates/login.html (Thymeleaf) -->
<a href="/oauth2/authorization/google">Continue with Google</a>
<a href="/oauth2/authorization/github">Continue with GitHub</a>`,
        output: `GET /dashboard (not logged in) -> 302 /login
Click "Continue with GitHub"  -> 302 https://github.com/login/oauth/authorize?response_type=code&client_id=...&scope=read:user%20user:email&state=...
GitHub redirects back          -> /login/oauth2/code/github?code=...&state=... -> 302 /dashboard`,
      },
      {
        caption: 'Reading the logged-in user',
        code: `@Controller
public class DashboardController {

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal OAuth2User user, Model model) {
        // Google (OIDC) exposes "name" and "email"; GitHub exposes "login", "name", "avatar_url"
        model.addAttribute("name", user.getAttribute("name"));
        model.addAttribute("avatar", user.getAttribute("avatar_url"));
        return "dashboard";
    }

    @GetMapping("/api/me")
    @ResponseBody
    public Map<String, Object> me(OAuth2AuthenticationToken auth) {
        return Map.of(
            "provider", auth.getAuthorizedClientRegistrationId(),
            "name", auth.getName(),
            "attributes", auth.getPrincipal().getAttributes().keySet());
    }
}`,
        output: `GET /api/me (after GitHub login)
{"provider":"github","name":"1234567","attributes":["login","id","avatar_url","name","email", ...]}`,
      },
      {
        caption: 'Linking the social account to a local user with application roles',
        code: `@Service
public class LinkingOAuth2UserService extends DefaultOAuth2UserService {

    private final AppUserRepository users;

    public LinkingOAuth2UserService(AppUserRepository users) {
        this.users = users;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest request) {
        OAuth2User remote = super.loadUser(request);
        String provider = request.getClientRegistration().getRegistrationId();
        String providerId = String.valueOf(remote.getAttributes().get("id"));

        AppUser local = users.findByProviderAndProviderId(provider, providerId)
            .orElseGet(() -> users.save(AppUser.fromSocial(provider, providerId,
                remote.getAttribute("email"), remote.getAttribute("name"))));

        Set<GrantedAuthority> authorities = local.getRoles().stream()
            .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
            .collect(Collectors.toSet());

        return new DefaultOAuth2User(authorities, remote.getAttributes(), "id");
    }
}

// register it
.oauth2Login(oauth -> oauth.userInfoEndpoint(ui -> ui.userService(linkingOAuth2UserService)))`,
        output: `First GitHub login  -> INSERT INTO app_users (provider, provider_id, email, name, ...) VALUES ('github', '1234567', ...)
Second GitHub login -> existing user found, authorities=[ROLE_USER]`,
      },
      {
        caption: 'Calling the GitHub API on behalf of the user',
        code: `@GetMapping("/api/github/repos")
@ResponseBody
public String repos(@RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient client) {
    return RestClient.create("https://api.github.com")
        .get()
        .uri("/user/repos?per_page=5")
        .headers(h -> h.setBearerAuth(client.getAccessToken().getTokenValue()))
        .retrieve()
        .body(String.class);
}`,
        output: `[{"name":"spring-shop","private":false,...},{"name":"notes","private":true,...}]`,
      },
    ],
    commonMistakes: [
      'Registering a redirect URI that does not exactly match /login/oauth2/code/{registrationId}, causing a redirect_uri_mismatch error at the provider.',
      'Identifying users by email only; use the provider name plus the provider\'s stable user id.',
      'Committing client secrets to source control instead of using environment variables or a secret manager.',
      'Assuming every provider returns an email — GitHub hides it unless the user:email scope is granted and the email is public or fetched from /user/emails.',
      'Using OAuth2 login for a pure JSON API consumed by mobile apps; APIs should be resource servers that accept tokens, while the login flow runs in the client or a backend-for-frontend.',
    ],
    keyPoints: [
      'spring-boot-starter-security-oauth2-client plus client id/secret properties gives you a complete Authorization Code login flow.',
      'Google uses OpenID Connect (OidcUser); GitHub uses plain OAuth2 (OAuth2User from the user-info endpoint).',
      'Login links are /oauth2/authorization/{registrationId}; callbacks go to /login/oauth2/code/{registrationId}.',
      'Link social identities to local users in a custom OAuth2UserService to attach your own roles.',
      'Use OAuth2AuthorizedClient to call provider APIs with the user\'s access token.',
    ],
  },

  'spring-authorization-server': {
    title: 'Spring Authorization Server',
    intro: `As soon as you have several applications — a web front end, a mobile app, a few microservices — you do not want each one to handle passwords and issue its own tokens. You want one central <strong>authorization server</strong> that authenticates users and issues OAuth2 access tokens and OpenID Connect ID tokens, while every API simply validates those tokens.

Spring Authorization Server is the Spring team's implementation of that server. From Spring Security 7 it ships as part of Spring Security itself, and Spring Boot 4 configures it with <code>spring-boot-starter-security-oauth2-authorization-server</code>. This lesson builds a working authorization server, registers clients for user login and machine-to-machine access, and connects a resource server to it.`,
    sections: [
      {
        heading: 'Roles in an OAuth2 System',
        body: `Four parties take part in OAuth2, and it helps to name them precisely.`,
        list: [
          '<strong>Resource owner</strong> — the user who owns the data.',
          '<strong>Client</strong> — the application asking for access (a web app, SPA backend, mobile app or service).',
          '<strong>Authorization server</strong> — authenticates the user, asks for consent and issues tokens. This is what you build in this lesson.',
          '<strong>Resource server</strong> — the API that accepts access tokens (see the JWT resource server lesson).',
        ],
      },
      {
        heading: 'Which Grant Types to Use',
        body: `OAuth 2.1 and current best practice reduce the choice to a few flows. The <strong>authorization_code</strong> grant with PKCE is for anything involving a user (web, SPA via a backend-for-frontend, mobile). <strong>client_credentials</strong> is for service-to-service calls with no user. <strong>refresh_token</strong> renews access tokens. The old implicit and password grants are removed from Spring Security 7 and should not be used.`,
      },
      {
        heading: 'Endpoints the Server Exposes',
        body: `Once running, the server publishes standard endpoints that clients and resource servers discover automatically through <code>/.well-known/openid-configuration</code>:`,
        list: [
          '<code>/oauth2/authorize</code> — starts the user login/consent flow.',
          '<code>/oauth2/token</code> — exchanges codes, client credentials or refresh tokens for tokens.',
          '<code>/oauth2/jwks</code> — public keys resource servers use to verify token signatures.',
          '<code>/oauth2/introspect</code> and <code>/oauth2/revoke</code> — token introspection and revocation.',
          '<code>/userinfo</code> — OpenID Connect user information.',
        ],
      },
      {
        heading: 'Registered Clients and Persistence',
        body: `Each client application is a <code>RegisteredClient</code> with a client id, a hashed secret, allowed grant types, redirect URIs, scopes and token settings. For demos you can declare them in <code>application.yml</code> and Spring Boot builds an <code>InMemoryRegisteredClientRepository</code>. In production, use <code>JdbcRegisteredClientRepository</code>, <code>JdbcOAuth2AuthorizationService</code> and <code>JdbcOAuth2AuthorizationConsentService</code> so clients, issued tokens and consents survive restarts and scale across instances. Keep the signing keys stable across restarts too — if keys change, every issued token becomes invalid.`,
      },
      {
        heading: 'Customising Token Claims',
        body: `An <code>OAuth2TokenCustomizer&lt;JwtEncodingContext&gt;</code> bean lets you add claims to access or ID tokens — for example the user's roles, tenant id or subscription plan — so resource servers can make authorization decisions without calling back to the user database.`,
      },
    ],
    examples: [
      {
        caption: 'Authorization server with clients declared in configuration',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security-oauth2-authorization-server</artifactId>
</dependency>

# application.yml of auth-server (port 9000)
server:
  port: 9000
spring:
  security:
    user:
      name: asha
      password: "{noop}user123"      # demo only — use a real UserDetailsService
    oauth2:
      authorizationserver:
        issuer: http://localhost:9000
        client:
          web-app:
            registration:
              client-id: web-app
              client-secret: "{bcrypt}$2a$10$6hN5E3sQ8kK6f6YwQ2iY6eJ0b5n0m2J0yJ3dO6oQ3bHk8lE9uF0bK"
              client-authentication-methods: client_secret_basic
              authorization-grant-types: authorization_code, refresh_token
              redirect-uris: http://localhost:8080/login/oauth2/code/webnest
              scopes: openid, profile, orders.read
            require-authorization-consent: true
            require-proof-key: true
          reporting-service:
            registration:
              client-id: reporting-service
              client-secret: "{bcrypt}$2a$10$Vd1Wm9aYxJgYv6k1v0k5mO2nK7n8V1a0cS6oR2wQ1bT9uZ4pA3hXe"
              client-authentication-methods: client_secret_basic
              authorization-grant-types: client_credentials
              scopes: orders.read`,
        output: `GET http://localhost:9000/.well-known/openid-configuration
{"issuer":"http://localhost:9000","authorization_endpoint":"http://localhost:9000/oauth2/authorize","token_endpoint":"http://localhost:9000/oauth2/token","jwks_uri":"http://localhost:9000/oauth2/jwks", ...}`,
      },
      {
        caption: 'Machine-to-machine token with client_credentials',
        code: `curl -s -u reporting-service:reporting-secret \\
     -d "grant_type=client_credentials&scope=orders.read" \\
     http://localhost:9000/oauth2/token`,
        output: `{"access_token":"eyJraWQiOiI4YjY...","scope":"orders.read","token_type":"Bearer","expires_in":299}`,
      },
      {
        caption: 'Adding roles to access tokens and persisting clients in the database',
        code: `@Configuration
public class AuthServerConfig {

    // Put the user's roles into every access token
    @Bean
    OAuth2TokenCustomizer<JwtEncodingContext> rolesClaim() {
        return context -> {
            if (OAuth2TokenType.ACCESS_TOKEN.equals(context.getTokenType())
                    && context.getPrincipal() != null) {
                Set<String> roles = context.getPrincipal().getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("ROLE_"))
                    .map(a -> a.substring(5))
                    .collect(Collectors.toSet());
                context.getClaims().claim("roles", roles);
            }
        };
    }

    // Production: store clients, authorizations and consents in the database
    @Bean
    RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbc) {
        return new JdbcRegisteredClientRepository(jdbc);
    }

    @Bean
    OAuth2AuthorizationService authorizationService(JdbcTemplate jdbc,
                                                    RegisteredClientRepository clients) {
        return new JdbcOAuth2AuthorizationService(jdbc, clients);
    }

    @Bean
    OAuth2AuthorizationConsentService consentService(JdbcTemplate jdbc,
                                                     RegisteredClientRepository clients) {
        return new JdbcOAuth2AuthorizationConsentService(jdbc, clients);
    }
}`,
        output: `Decoded access token payload:
{"sub":"asha","aud":"web-app","scope":["openid","orders.read"],"roles":["USER"],"iss":"http://localhost:9000","exp":1790503200}`,
      },
      {
        caption: 'A web app logging in through the authorization server, and an API trusting it',
        code: `# web-app (port 8080) — OAuth2 client
spring:
  security:
    oauth2:
      client:
        registration:
          webnest:
            provider: webnest
            client-id: web-app
            client-secret: \${WEB_APP_SECRET}
            authorization-grant-type: authorization_code
            scope: openid, profile, orders.read
        provider:
          webnest:
            issuer-uri: http://localhost:9000

# orders-api (port 8081) — resource server
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:9000`,
        output: `Browser -> web-app /dashboard -> redirect to auth-server login -> consent screen -> back to web-app
web-app calls orders-api with the access token -> 200 OK (signature verified with keys from /oauth2/jwks)`,
      },
    ],
    commonMistakes: [
      'Generating a new RSA key pair on every startup, which silently invalidates all issued tokens after each deploy.',
      'Keeping registered clients and authorizations in memory in production; tokens and consents vanish on restart and do not work with more than one instance.',
      'Still using the password grant, which is removed in Spring Security 7 — use authorization_code with PKCE for users.',
      'Putting large or sensitive data into token claims; tokens are readable by anyone who holds them.',
      'Using http:// issuer URLs outside local development — tokens and codes must only travel over HTTPS.',
    ],
    keyPoints: [
      'Spring Authorization Server issues OAuth2 access tokens and OIDC ID tokens for all of your applications from one place.',
      'In Boot 4 add spring-boot-starter-security-oauth2-authorization-server; clients can be declared under spring.security.oauth2.authorizationserver.client.',
      'Use authorization_code + PKCE for users, client_credentials for services and refresh_token for renewal.',
      'Persist clients, authorizations and consents with the JDBC implementations and keep signing keys stable.',
      'OAuth2TokenCustomizer adds claims such as roles so resource servers can authorize locally.',
    ],
  },

  'csrf-and-cors-in-spring-security': {
    title: 'CSRF and CORS in Spring Security',
    intro: `CSRF and CORS are two of the most misunderstood settings in web security, and they are often "fixed" by disabling protections until an error goes away. Both exist because of how browsers automatically send cookies and enforce the same-origin policy.

This lesson explains what cross-site request forgery actually is, when CSRF protection is needed and when it is safe to turn off, how to make CSRF work with single-page applications, and how to configure CORS correctly so your React or Angular front end can call your Spring Boot API without opening it to every website on the internet.`,
    sections: [
      {
        heading: 'What CSRF Attacks Exploit',
        body: `Browsers attach cookies to every request to a site, no matter which page started the request. If a user is logged into <code>bank.example</code> with a session cookie and then visits a malicious page, that page can submit a hidden form to <code>bank.example/transfer</code> and the browser will include the session cookie. The bank sees a perfectly authenticated request the user never intended.

CSRF protection defends against this by requiring every state-changing request (POST, PUT, PATCH, DELETE) to include a secret token that the attacker's page cannot read. Spring Security enables this by default.`,
      },
      {
        heading: 'When You Need CSRF Protection',
        body: `The rule is simple: if the browser authenticates requests <strong>automatically</strong> — session cookies, remember-me cookies, HTTP Basic cached by the browser — you need CSRF protection. If every request carries a token that JavaScript must add explicitly, such as <code>Authorization: Bearer</code>, an attacker's page cannot forge it and CSRF protection can be disabled for those endpoints.

Storing a JWT in a cookie brings the CSRF risk straight back, because the browser sends that cookie automatically.`,
      },
      {
        heading: 'CSRF with Single-Page Applications',
        body: `A React app that uses session cookies needs to read the CSRF token and send it back in a header. Spring Security 6.3+ provides <code>csrf.spa()</code>, which stores the token in a readable <code>XSRF-TOKEN</code> cookie and accepts it in the <code>X-XSRF-TOKEN</code> header (the convention Axios and Angular already follow). Traditional server-rendered pages with Thymeleaf get the token inserted into forms automatically.`,
      },
      {
        heading: 'What CORS Is (and Is Not)',
        body: `The same-origin policy stops JavaScript on <code>https://app.webnest.in</code> from reading responses from <code>https://api.webnest.in</code>, because they are different origins. <strong>CORS</strong> (Cross-Origin Resource Sharing) is how the API tells the browser which other origins are allowed to read its responses. For non-simple requests (JSON bodies, custom headers, PUT/DELETE) the browser first sends an <code>OPTIONS</code> preflight request.

CORS is a browser feature, not an access-control mechanism. curl, Postman and server-to-server calls ignore it completely. It never replaces authentication or authorization.`,
      },
      {
        heading: 'Configuring CORS in Spring Security',
        body: `Because preflight requests carry no credentials, CORS must be handled <strong>before</strong> authentication; otherwise the preflight gets a 401 and the browser blocks the real request. Enable it with <code>http.cors(Customizer.withDefaults())</code>, which picks up a <code>CorsConfigurationSource</code> bean. List exact origins; never combine <code>allowCredentials(true)</code> with a wildcard origin.`,
      },
    ],
    examples: [
      {
        caption: 'Default CSRF protection with a Thymeleaf form',
        code: `<!-- Thymeleaf adds the hidden _csrf field automatically to th:action forms -->
<form th:action="@{/account/email}" method="post">
    <input type="email" name="email">
    <button type="submit">Update email</button>
</form>

<!-- Rendered HTML -->
<form action="/account/email" method="post">
    <input type="hidden" name="_csrf" value="f8e7c3a1-2b4d-4e6f-9a0b-1c2d3e4f5a6b"/>
    <input type="email" name="email">
    <button type="submit">Update email</button>
</form>`,
        output: `POST /account/email with valid _csrf       -> 302 /account (updated)
POST /account/email from evil.example page -> 403 Forbidden (Invalid CSRF token)`,
      },
      {
        caption: 'CSRF for a React SPA using session cookies',
        code: `@Bean
SecurityFilterChain spa(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults())
        .csrf(csrf -> csrf.spa());   // XSRF-TOKEN cookie + X-XSRF-TOKEN header
    return http.build();
}

// React side: axios reads the XSRF-TOKEN cookie and sends X-XSRF-TOKEN automatically
// axios.defaults.withCredentials = true;
// await axios.post('/api/profile', { displayName: 'Asha' });`,
        output: `Response header: Set-Cookie: XSRF-TOKEN=6c1f...; Path=/
Next request:    X-XSRF-TOKEN: 6c1f...  -> 200 OK`,
      },
      {
        caption: 'Stateless bearer-token API: CSRF off, CORS on for a known front end',
        code: `@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
    http
        .cors(Customizer.withDefaults())            // uses the CorsConfigurationSource bean
        .csrf(csrf -> csrf.disable())               // safe: auth is an explicit Bearer header, not a cookie
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()));
    return http.build();
}

@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://app.webnest.in", "http://localhost:5173"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setExposedHeaders(List.of("Location"));
    config.setMaxAge(Duration.ofHours(1));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}`,
        output: `OPTIONS /api/orders  Origin: https://app.webnest.in
-> 200, Access-Control-Allow-Origin: https://app.webnest.in, Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS

OPTIONS /api/orders  Origin: https://evil.example
-> 403 Invalid CORS request`,
      },
    ],
    commonMistakes: [
      'Disabling CSRF on an application that authenticates with session cookies, just to make a POST from Postman work.',
      'Storing a JWT in a cookie and disabling CSRF because "we use JWT" — cookie-borne tokens are sent automatically and are vulnerable to CSRF.',
      'Using allowedOrigins("*") together with allowCredentials(true); browsers reject it, and allowedOriginPatterns("*") with credentials exposes your API to every site.',
      'Adding @CrossOrigin on controllers but not http.cors(...), so preflight requests are rejected with 401 by Spring Security before reaching MVC.',
      'Treating CORS as security — any non-browser client can still call the API; authentication and authorization must still be enforced.',
    ],
    keyPoints: [
      'CSRF protection is needed whenever the browser sends credentials automatically (session or auth cookies).',
      'Stateless APIs that require an explicit Authorization header can safely disable CSRF.',
      'csrf.spa() makes CSRF work with React, Angular and Axios using the XSRF-TOKEN cookie and header.',
      'CORS tells browsers which origins may read responses; configure it with http.cors() and a CorsConfigurationSource.',
      'List exact allowed origins and never rely on CORS for access control.',
    ],
  },

  'passkeys-and-one-time-token-login': {
    title: 'Passkeys and One-Time Token Login',
    intro: `Passwords are the weakest part of most login systems: users reuse them, phishing sites steal them, and databases leak them. The industry is moving to <strong>passwordless</strong> authentication, and Spring Security now supports the two most common approaches out of the box.

<strong>Passkeys</strong> (WebAuthn) let users sign in with a fingerprint, face scan or device PIN, using a public/private key pair that never leaves their device and cannot be phished. <strong>One-time token (OTT) login</strong> — often called "magic links" — emails the user a single-use link. This lesson shows how to enable both in Spring Boot 4 with Spring Security 7.`,
    sections: [
      {
        heading: 'How Passkeys Work',
        body: `During <strong>registration</strong>, the user's device (phone, laptop, security key) creates a new key pair for your site. The private key stays in the device's secure hardware; your server stores only the public key and a credential id. During <strong>login</strong>, your server sends a random challenge, the device signs it after the user unlocks it with biometrics or a PIN, and the server verifies the signature with the stored public key.

Because the browser binds each credential to your exact domain (the "relying party id"), a look-alike phishing site cannot use it. There is no shared secret for attackers to steal from your database.`,
      },
      {
        heading: 'Enabling Passkeys in Spring Security',
        body: `Add the WebAuthn4J dependency and call <code>http.webAuthn(...)</code> with your relying party name, id and allowed origins. Spring Security then provides the registration page at <code>/webauthn/register</code>, the JavaScript and endpoints for the browser ceremony, and a "Sign in with a passkey" button on the default login page. Users must first log in another way (for example with a password or OTT) to register a passkey for their account.

For production, store credentials in the database using <code>JdbcPublicKeyCredentialUserEntityRepository</code> and <code>JdbcUserCredentialRepository</code>; the default in-memory stores lose all passkeys on restart.`,
      },
      {
        heading: 'One-Time Token Login',
        body: `With <code>http.oneTimeTokenLogin(...)</code>, the login page shows a "Send me a login link" form. Spring Security generates a random token that expires after five minutes by default and passes it to your <code>OneTimeTokenGenerationSuccessHandler</code>. Your handler is responsible for delivering the link — usually by email or SMS. When the user opens the link and submits it, the token is consumed and the user is logged in.

Use <code>JdbcOneTimeTokenService</code> in production so tokens work across multiple instances.`,
      },
      {
        heading: 'Multi-Factor Authentication',
        body: `Spring Security 7 adds first-class support for requiring more than one factor. You can declare which authorities a request needs — for example one granted by password login and one granted by OTT — and Spring Security will redirect users who have completed only one factor to complete the next. This lets you require a second factor for sensitive areas such as <code>/admin/**</code> without writing a custom flow.`,
      },
    ],
    examples: [
      {
        caption: 'Enabling passkeys',
        code: `<dependency>
    <groupId>com.webauthn4j</groupId>
    <artifactId>webauthn4j-core</artifactId>
    <!-- Spring Boot does not manage this version: use the one listed in the
         Spring Security "Passkeys" reference page for your release -->
    <version>\${webauthn4j.version}</version>
</dependency>

@Bean
SecurityFilterChain web(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/login/**", "/webauthn/**").permitAll()
            .anyRequest().authenticated())
        .formLogin(Customizer.withDefaults())
        .webAuthn(webAuthn -> webAuthn
            .rpName("Webnest Studio")
            .rpId("webneststudio.co.in")           // use "localhost" in development
            .allowedOrigins("https://www.webneststudio.co.in"));
    return http.build();
}

// Production storage for passkeys
@Bean
PublicKeyCredentialUserEntityRepository passkeyUsers(JdbcOperations jdbc) {
    return new JdbcPublicKeyCredentialUserEntityRepository(jdbc);
}

@Bean
UserCredentialRepository passkeyCredentials(JdbcOperations jdbc) {
    return new JdbcUserCredentialRepository(jdbc);
}`,
        output: `1. Log in with a password, then visit /webauthn/register -> "Register" -> Windows Hello / Touch ID prompt
2. Log out; on /login click "Sign in with a passkey" -> device prompt -> 302 / (authenticated, no password typed)`,
      },
      {
        caption: 'One-time token (magic link) login delivered by email',
        code: `@Bean
SecurityFilterChain web(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/login/**", "/ott/sent").permitAll()
            .anyRequest().authenticated())
        .formLogin(Customizer.withDefaults())
        .oneTimeTokenLogin(Customizer.withDefaults());
    return http.build();
}

@Component
public class MagicLinkSender implements OneTimeTokenGenerationSuccessHandler {

    private final JavaMailSender mail;
    private final RedirectStrategy redirect = new DefaultRedirectStrategy();

    public MagicLinkSender(JavaMailSender mail) {
        this.mail = mail;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       OneTimeToken token) throws IOException {
        String link = UriComponentsBuilder.fromUriString(UrlUtils.buildFullRequestUrl(request))
            .replacePath(request.getContextPath() + "/login/ott")
            .replaceQuery(null)
            .queryParam("token", token.getTokenValue())
            .toUriString();

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(token.getUsername());   // username is the user's email in this app
        msg.setSubject("Your Webnest login link");
        msg.setText("Sign in within 5 minutes: " + link);
        mail.send(msg);

        redirect.sendRedirect(request, response, "/ott/sent");
    }
}

@Bean
OneTimeTokenService oneTimeTokenService(JdbcOperations jdbc) {
    return new JdbcOneTimeTokenService(jdbc);   // survives restarts, works with multiple instances
}`,
        output: `POST /ott/generate username=asha@webnest.in -> 302 /ott/sent
Email: "Sign in within 5 minutes: https://www.webneststudio.co.in/login/ott?token=4f9c1e..."
Open link and submit -> 302 / (authenticated as asha@webnest.in)
Open the same link again -> 302 /login?error (token already used)`,
      },
    ],
    commonMistakes: [
      'Setting rpId to a different domain than the one users visit — browsers refuse to create or use the passkey.',
      'Testing passkeys over plain http on a non-localhost host; WebAuthn requires a secure context (HTTPS or localhost).',
      'Keeping passkeys or one-time tokens in the default in-memory stores in production.',
      'Revealing whether an email address has an account on the "send me a link" page; always show the same "check your inbox" message.',
      'Removing password login before users have registered passkeys, locking them out with no recovery path.',
    ],
    keyPoints: [
      'Passkeys use device-held private keys and domain-bound credentials, making them resistant to phishing and database leaks.',
      'http.webAuthn(...) adds passkey registration and login; store credentials with the JDBC repositories.',
      'http.oneTimeTokenLogin(...) adds magic-link login; you implement OneTimeTokenGenerationSuccessHandler to deliver the link.',
      'Spring Security 7 supports multi-factor requirements so sensitive areas can demand a second factor.',
      'Always provide a fallback and recovery path when introducing passwordless login.',
    ],
  },

  'testing-secured-endpoints': {
    title: 'Testing Secured Endpoints',
    intro: `Security configuration is code, and like all code it breaks — usually when someone adds a new endpoint or reorders a rule. The only reliable way to know that <code>/api/admin/**</code> really rejects ordinary users is an automated test that tries it.

Spring Security's test support lets you run requests as any user, with any roles, or with any JWT, without a real login flow. This lesson covers <code>@WithMockUser</code>, MockMvc request post-processors for users, JWTs, OAuth2 logins and CSRF tokens, and testing method security directly on services.`,
    sections: [
      {
        heading: 'Test Dependencies in Spring Boot 4',
        body: `Spring Boot 4 splits test support per technology. For a web API with security, add <code>spring-boot-starter-webmvc-test</code> and <code>spring-security-test</code> with test scope. <code>@WebMvcTest</code> loads only the web layer — controllers, advice, filters and your <code>SecurityFilterChain</code> — so security tests stay fast. Remember to <code>@Import</code> your security configuration class if it is not picked up automatically, and replace service dependencies with <code>@MockitoBean</code> (which replaced the removed <code>@MockBean</code>).`,
      },
      {
        heading: 'Choosing How to Represent the User',
        body: `Pick the tool that matches how your application authenticates.`,
        list: [
          '<code>@WithMockUser(roles = "ADMIN")</code> — annotation on the test method; creates a simple authenticated user.',
          '<code>@WithUserDetails("asha")</code> — loads a real user from your UserDetailsService bean.',
          '<code>.with(user("asha").roles("USER"))</code> — the same as @WithMockUser but per request.',
          '<code>.with(jwt().authorities(...))</code> — a JwtAuthenticationToken for resource servers; lets you set claims too.',
          '<code>.with(oauth2Login())</code> / <code>.with(oidcLogin())</code> — simulate social login.',
          '<code>.with(csrf())</code> — adds a valid CSRF token for POST/PUT/DELETE when CSRF is enabled.',
        ],
      },
      {
        heading: 'What to Assert',
        body: `For every protected area, test at least three cases: anonymous (expect 401 or a login redirect), authenticated without permission (expect 403), and authenticated with permission (expect success). Add tests for ownership rules ("user A cannot read user B's order") because those are the checks most often forgotten.`,
      },
      {
        heading: 'Testing Method Security Without HTTP',
        body: `<code>@PreAuthorize</code> rules on services can be tested with <code>@SpringBootTest</code> (or a small slice that includes the service and <code>@EnableMethodSecurity</code>) and <code>@WithMockUser</code>. Call the service method directly and assert that it either returns or throws <code>AccessDeniedException</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Test dependencies (pom.xml)',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webmvc-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>`,
        output: '(Versions are managed by the Spring Boot parent; no version tags needed.)',
      },
      {
        caption: 'Web-layer security tests with @WithMockUser and request post-processors',
        code: `import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminControllerSecurityTest {

    @Autowired MockMvc mvc;
    @MockitoBean ReportService reportService;

    @Test
    void anonymousUsersAreRejected() throws Exception {
        mvc.perform(get("/api/admin/reports")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void ordinaryUsersAreForbidden() throws Exception {
        mvc.perform(get("/api/admin/reports")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminsCanReadReports() throws Exception {
        when(reportService.summary()).thenReturn(new Summary(42));
        mvc.perform(get("/api/admin/reports"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.orders").value(42));
    }

    @Test
    void postWithoutCsrfTokenIsRejected() throws Exception {
        mvc.perform(post("/admin/settings").with(user("admin").roles("ADMIN")))
           .andExpect(status().isForbidden());
        mvc.perform(post("/admin/settings").with(user("admin").roles("ADMIN")).with(csrf()))
           .andExpect(status().is3xxRedirection());
    }
}`,
        output: `AdminControllerSecurityTest
  ✔ anonymousUsersAreRejected
  ✔ ordinaryUsersAreForbidden
  ✔ adminsCanReadReports
  ✔ postWithoutCsrfTokenIsRejected
Tests run: 4, Failures: 0`,
      },
      {
        caption: 'Testing a JWT resource server with claims and scopes',
        code: `@WebMvcTest(OrderController.class)
@Import(ResourceServerConfig.class)   // the SecurityFilterChain only, without the key-loading beans
class OrderControllerJwtTest {

    @Autowired MockMvc mvc;
    @MockitoBean JwtDecoder jwtDecoder;   // jwt() bypasses decoding, so no real keys are needed

    @Test
    void userScopeCanListOwnOrders() throws Exception {
        mvc.perform(get("/api/orders")
                .with(jwt().jwt(j -> j.subject("asha"))
                           .authorities(new SimpleGrantedAuthority("SCOPE_user"))))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0]").value("Order #1001 for asha"));
    }

    @Test
    void userScopeCannotDelete() throws Exception {
        mvc.perform(delete("/api/orders/5")
                .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_user"))))
           .andExpect(status().isForbidden());
    }
}`,
        output: `OrderControllerJwtTest
  ✔ userScopeCanListOwnOrders
  ✔ userScopeCannotDelete`,
      },
      {
        caption: 'Testing @PreAuthorize ownership rules on a service',
        code: `@SpringBootTest
class OrderServiceSecurityTest {

    @Autowired OrderService orderService;

    @Test
    @WithMockUser(username = "asha@webnest.in")
    void userCanReadOwnOrders() {
        assertThatNoException().isThrownBy(() -> orderService.findForCustomer("asha@webnest.in"));
    }

    @Test
    @WithMockUser(username = "asha@webnest.in")
    void userCannotReadSomeoneElsesOrders() {
        assertThatThrownBy(() -> orderService.findForCustomer("ravi@webnest.in"))
            .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void adminCanReadAnyOrders() {
        assertThatNoException().isThrownBy(() -> orderService.findForCustomer("ravi@webnest.in"));
    }
}`,
        output: `OrderServiceSecurityTest
  ✔ userCanReadOwnOrders
  ✔ userCannotReadSomeoneElsesOrders
  ✔ adminCanReadAnyOrders`,
      },
    ],
    commonMistakes: [
      'Testing only the "happy path" as an admin and never asserting that ordinary or anonymous users are rejected.',
      'Forgetting .with(csrf()) on POST tests and concluding that authorization is broken when the 403 actually comes from the CSRF filter.',
      'Using @WebMvcTest without importing the real SecurityConfig, so tests run against Spring Boot\'s default security instead of yours.',
      'Still using @MockBean, which was removed in Spring Boot 4 — use @MockitoBean.',
      'Using @WithMockUser(roles = "ROLE_ADMIN"); the roles attribute adds the prefix itself, so this produces ROLE_ROLE_ADMIN.',
    ],
    keyPoints: [
      'Add spring-security-test and the per-technology test starter such as spring-boot-starter-webmvc-test.',
      'Use @WithMockUser, user(), jwt(), oauth2Login() and csrf() to simulate any authentication state.',
      'For each protected area, test anonymous, forbidden and allowed cases.',
      'Test ownership rules on services directly and assert AccessDeniedException.',
      'Import your real security configuration into slice tests.',
    ],
  },

  'security-hardening-checklist': {
    title: 'Security Hardening Checklist for Spring Boot',
    intro: `Configuring authentication and authorization is only part of securing an application. Production incidents are just as often caused by an exposed Actuator endpoint, a verbose error page, a leaked secret, an outdated dependency or a missing rate limit.

This lesson collects the practical hardening steps experienced Spring Boot teams apply before going live, organised as a checklist you can run through for every service. Each item includes the configuration or code needed to implement it.`,
    sections: [
      {
        heading: 'Transport and Headers',
        body: `Serve everything over HTTPS, usually terminated at a load balancer. Set <code>server.forward-headers-strategy=framework</code> so Spring knows the original request was HTTPS, enable HSTS, and add a Content Security Policy for server-rendered pages. Spring Security already sends X-Content-Type-Options, X-Frame-Options and cache-control headers by default — do not disable them.`,
      },
      {
        heading: 'Secrets Management',
        body: `Never commit passwords, API keys or signing keys. Read them from environment variables, Kubernetes secrets, or a secret manager (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault) via <code>spring.config.import</code>. Rotate secrets regularly and immediately after anyone leaves the team or a leak is suspected. Add a secret scanner (GitHub secret scanning, gitleaks) to CI.`,
      },
      {
        heading: 'Actuator and Error Exposure',
        body: `Expose only the Actuator endpoints you need (typically health, info, prometheus), preferably on a separate management port that is not reachable from the internet, and require authentication for the rest. Never expose <code>env</code>, <code>heapdump</code> or <code>configprops</code> publicly — they can reveal secrets. Keep <code>server.error.include-stacktrace=never</code> and return <code>ProblemDetail</code> responses without internal details.`,
      },
      {
        heading: 'Input Handling',
        body: `Validate every request with Bean Validation, use parameterised queries (Spring Data and JdbcClient do this for you — never concatenate SQL), limit upload sizes, and encode output in templates (Thymeleaf escapes by default; avoid <code>th:utext</code> with user data). For outbound HTTP calls to user-supplied URLs, block internal addresses to prevent SSRF; Spring Boot 4.1 adds an <code>InetAddressFilter</code> for its HTTP clients.`,
      },
      {
        heading: 'Abuse Protection',
        body: `Login, registration, password reset and OTT endpoints need rate limiting to stop credential stuffing and enumeration. Use a gateway or a library such as Bucket4j, lock or slow down accounts after repeated failures, and log authentication events. Spring Security publishes <code>AuthenticationSuccessEvent</code> and <code>AbstractAuthenticationFailureEvent</code>, which you can listen to for auditing.`,
      },
      {
        heading: 'Dependencies and Supply Chain',
        body: `Most vulnerabilities in Java applications come from dependencies. Stay on a supported Spring Boot line, update patch versions promptly, and scan dependencies in CI with OWASP Dependency-Check, Snyk, GitHub Dependabot or similar. Generate an SBOM (Spring Boot exposes one via the <code>sbom</code> Actuator endpoint when you use the CycloneDX plugin) so you can quickly answer "are we affected?" when a new CVE is announced.`,
      },
    ],
    examples: [
      {
        caption: 'Production-oriented application.yml',
        code: `server:
  forward-headers-strategy: framework
  error:
    include-stacktrace: never
    include-message: never
  servlet:
    session:
      cookie:
        secure: true
        http-only: true
        same-site: lax

spring:
  config:
    import: optional:vault://        # secrets from HashiCorp Vault (spring-cloud-vault)
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 10MB

management:
  server:
    port: 9090                       # internal-only port
  endpoints:
    web:
      exposure:
        include: health, info, prometheus
  endpoint:
    health:
      show-details: when-authorized`,
        output: '(Actuator now answers only on port 9090, exposes three endpoints, and error responses no longer leak stack traces.)',
      },
      {
        caption: 'Security headers: HSTS and Content Security Policy',
        code: `@Bean
SecurityFilterChain web(HttpSecurity http) throws Exception {
    http
        .headers(headers -> headers
            .httpStrictTransportSecurity(hsts -> hsts
                .includeSubDomains(true)
                .maxAgeInSeconds(31536000))
            .contentSecurityPolicy(csp -> csp
                .policyDirectives("default-src 'self'; img-src 'self' data:; script-src 'self'; frame-ancestors 'none'"))
            .referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults());
    return http.build();
}`,
        output: `Strict-Transport-Security: max-age=31536000 ; includeSubDomains
Content-Security-Policy: default-src 'self'; img-src 'self' data:; script-src 'self'; frame-ancestors 'none'
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
X-Frame-Options: DENY`,
      },
      {
        caption: 'Auditing authentication failures',
        code: `@Component
public class AuthenticationAuditListener {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationAuditListener.class);

    @EventListener
    public void onSuccess(AuthenticationSuccessEvent event) {
        log.info("login_success user={}", event.getAuthentication().getName());
    }

    @EventListener
    public void onFailure(AbstractAuthenticationFailureEvent event) {
        // never log the submitted password
        log.warn("login_failure user={} reason={}",
            event.getAuthentication().getName(),
            event.getException().getClass().getSimpleName());
    }
}

// Spring Boot publishes these events automatically when this bean exists
@Bean
AuthenticationEventPublisher authenticationEventPublisher(ApplicationEventPublisher publisher) {
    return new DefaultAuthenticationEventPublisher(publisher);
}`,
        output: `INFO  login_success user=asha@webnest.in
WARN  login_failure user=asha@webnest.in reason=BadCredentialsException
WARN  login_failure user=admin reason=BadCredentialsException`,
      },
      {
        caption: 'Dependency vulnerability scanning in the Maven build',
        code: `<plugin>
    <groupId>org.owasp</groupId>
    <artifactId>dependency-check-maven</artifactId>
    <version>12.1.0</version>
    <configuration>
        <failBuildOnCVSS>7</failBuildOnCVSS>
    </configuration>
</plugin>

# run in CI
mvn org.owasp:dependency-check-maven:check`,
        output: `[INFO] Analysis Complete
[ERROR] One or more dependencies were identified with vulnerabilities that have a CVSS score greater than or equal to '7.0':
[ERROR] example-lib-1.2.3.jar: CVE-2026-XXXXX (8.1)
[INFO] BUILD FAILURE`,
      },
    ],
    commonMistakes: [
      'Setting management.endpoints.web.exposure.include=* in production, exposing env and heapdump to the internet.',
      'Printing secrets at startup or logging full request bodies that contain passwords or tokens.',
      'Forgetting forward-headers-strategy behind a proxy, so redirects and OAuth2 callback URLs use http:// instead of https://.',
      'Leaving login and password-reset endpoints without any rate limit.',
      'Staying on an end-of-life Spring Boot version that no longer receives security patches.',
    ],
    keyPoints: [
      'Enforce HTTPS, HSTS and a Content Security Policy; keep Spring Security\'s default headers.',
      'Load secrets from the environment or a secret manager, never from committed files.',
      'Expose only necessary Actuator endpoints, ideally on an internal management port.',
      'Validate input, use parameterised queries, limit uploads and guard against SSRF.',
      'Rate-limit authentication endpoints, audit login events and scan dependencies continuously.',
    ],
  },
}
