// Spring Boot course — additional RESTful service lessons (HATEOAS, i18n,
// content negotiation, response filtering, REST design best practices).
// Keys are slugs matching topics in codelabDefaults.js.
export const springBootRestExtras = {
  'spring-hateoas': {
    title: 'Hypermedia APIs with Spring HATEOAS',
    intro: `In most JSON APIs, clients hard-code every URL and every rule about what they are allowed to do next. HATEOAS — <em>Hypermedia As The Engine Of Application State</em> — takes a different approach: each response includes <strong>links</strong> to related resources and to the actions currently possible. An order that can still be cancelled includes a <code>cancel</code> link; a shipped order does not. Clients follow links instead of constructing URLs.

Spring HATEOAS makes building such responses straightforward. This lesson explains the idea, adds self and relation links with <code>WebMvcLinkBuilder</code>, builds collection responses, uses representation model assemblers to keep controllers clean, shows conditional links for state transitions, and discusses when hypermedia is worth it.`,
    sections: [
      {
        heading: 'Why Hypermedia',
        body: `Links make an API more self-describing and let the server evolve URLs without breaking clients that follow links. Conditional links move business rules ("can this order be cancelled?") to the server, so web and mobile clients stay consistent. HATEOAS is the top level of the Richardson Maturity Model (see the best-practices lesson). The trade-off is larger responses and more client logic to interpret links, so many internal APIs skip it while public, long-lived APIs benefit most.`,
      },
      {
        heading: 'Core Types',
        body: `Spring HATEOAS provides representation models that carry links:`,
        list: [
          '<code>EntityModel&lt;T&gt;</code> — wraps one object plus links.',
          '<code>CollectionModel&lt;T&gt;</code> — wraps a collection plus links.',
          '<code>PagedModel&lt;T&gt;</code> — a page of results with first/prev/next/last links (built with <code>PagedResourcesAssembler</code>).',
          '<code>Link</code> and <code>LinkRelation</code> — a URL with a relation name such as <code>self</code>, <code>orders</code> or <code>cancel</code>.',
          '<code>WebMvcLinkBuilder.linkTo(methodOn(Controller.class).method(args))</code> — builds links from controller methods, so URLs are never hard-coded.',
        ],
      },
      {
        heading: 'HAL: The Default Format',
        body: `Spring HATEOAS renders responses in <strong>HAL</strong> (<code>application/hal+json</code>): links appear under <code>_links</code> and embedded collections under <code>_embedded</code>. Other media types such as HAL-FORMS (which also describes the fields of available actions) can be enabled when needed.`,
      },
      {
        heading: 'Representation Model Assemblers',
        body: `Building links in every controller method gets repetitive. A <code>RepresentationModelAssembler</code> converts a domain object or DTO into an <code>EntityModel</code> with its links in one place, and is reused by all endpoints that return that type.`,
      },
    ],
    examples: [
      {
        caption: 'Dependency and a resource with self and related links',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-hateoas</artifactId>
</dependency>

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService users;

    public UserController(UserService users) {
        this.users = users;
    }

    @GetMapping("/{id}")
    public EntityModel<UserDto> get(@PathVariable Long id) {
        UserDto user = users.get(id);
        return EntityModel.of(user,
            linkTo(methodOn(UserController.class).get(id)).withSelfRel(),
            linkTo(methodOn(UserController.class).all()).withRel("users"),
            linkTo(methodOn(PostController.class).postsOf(id)).withRel("posts"));
    }

    @GetMapping
    public CollectionModel<EntityModel<UserDto>> all() {
        List<EntityModel<UserDto>> list = users.all().stream()
            .map(u -> EntityModel.of(u, linkTo(methodOn(UserController.class).get(u.id())).withSelfRel()))
            .toList();
        return CollectionModel.of(list, linkTo(methodOn(UserController.class).all()).withSelfRel());
    }
}`,
        output: `GET /api/users/7   Accept: application/hal+json
{
  "id": 7,
  "name": "Asha Rao",
  "_links": {
    "self":  { "href": "http://localhost:8080/api/users/7" },
    "users": { "href": "http://localhost:8080/api/users" },
    "posts": { "href": "http://localhost:8080/api/users/7/posts" }
  }
}`,
      },
      {
        caption: 'An assembler with conditional state-transition links',
        code: `@Component
public class OrderModelAssembler implements RepresentationModelAssembler<OrderDto, EntityModel<OrderDto>> {

    @Override
    public EntityModel<OrderDto> toModel(OrderDto order) {
        EntityModel<OrderDto> model = EntityModel.of(order,
            linkTo(methodOn(OrderController.class).get(order.id())).withSelfRel(),
            linkTo(methodOn(OrderController.class).all(null)).withRel("orders"));

        // Only offer actions that are valid in the current state
        if (order.status() == OrderStatus.PLACED) {
            model.add(linkTo(methodOn(OrderController.class).cancel(order.id())).withRel("cancel"));
            model.add(linkTo(methodOn(OrderController.class).pay(order.id())).withRel("pay"));
        }
        if (order.status() == OrderStatus.SHIPPED) {
            model.add(linkTo(methodOn(OrderController.class).track(order.id())).withRel("track"));
        }
        return model;
    }
}

@GetMapping("/{id}")
public EntityModel<OrderDto> get(@PathVariable Long id) {
    return assembler.toModel(orders.get(id));
}`,
        output: `Order 41 (PLACED):  "_links": { "self": {...}, "orders": {...}, "cancel": {...}, "pay": {...} }
Order 42 (SHIPPED): "_links": { "self": {...}, "orders": {...}, "track": {...} }
(The client shows a Cancel button only when a "cancel" link is present.)`,
      },
      {
        caption: 'Paged collections with navigation links',
        code: `@GetMapping
public PagedModel<EntityModel<OrderDto>> all(Pageable pageable) {
    Page<OrderDto> page = orders.page(pageable);
    return pagedAssembler.toModel(page, assembler);    // PagedResourcesAssembler<OrderDto> injected
}`,
        output: `GET /api/orders?page=1&size=2
{
  "_embedded": { "orderDtoList": [ {...}, {...} ] },
  "_links": {
    "first": { "href": "http://localhost:8080/api/orders?page=0&size=2" },
    "prev":  { "href": "http://localhost:8080/api/orders?page=0&size=2" },
    "self":  { "href": "http://localhost:8080/api/orders?page=1&size=2" },
    "next":  { "href": "http://localhost:8080/api/orders?page=2&size=2" },
    "last":  { "href": "http://localhost:8080/api/orders?page=9&size=2" }
  },
  "page": { "size": 2, "totalElements": 20, "totalPages": 10, "number": 1 }
}`,
      },
    ],
    commonMistakes: [
      'Hard-coding URLs in links instead of using linkTo(methodOn(...)), so links break when mappings change.',
      'Adding every possible action link regardless of state, defeating the purpose of conditional links.',
      'Forgetting forward-headers support behind a proxy, so links contain internal hostnames or http:// URLs.',
      'Adopting HATEOAS for a small internal API where clients will never use the links.',
      'Mixing HAL responses and plain JSON inconsistently across endpoints of the same API.',
    ],
    keyPoints: [
      'HATEOAS adds links to responses so clients discover related resources and allowed actions.',
      'spring-boot-starter-hateoas provides EntityModel, CollectionModel, PagedModel and WebMvcLinkBuilder.',
      'Responses use HAL by default: _links and _embedded.',
      'RepresentationModelAssembler centralises link creation; conditional links express state transitions.',
      'Use hypermedia for public, evolving APIs where its flexibility pays off.',
    ],
  },

  'internationalization-i18n': {
    title: 'Internationalization (i18n) in Spring Boot',
    intro: `India alone has dozens of languages, and a platform that serves learners in English, Hindi and Tamil reaches far more people. <strong>Internationalization</strong> (i18n) means designing your application so text, dates and numbers can be shown in the user's language and format without code changes; <strong>localization</strong> (l10n) is adding the actual translations.

Spring Boot supports i18n through <code>MessageSource</code> and locale resolution. This lesson covers message bundles, choosing the locale from the <code>Accept-Language</code> header or a user preference, translating API messages and validation errors, using messages in Thymeleaf, and formatting numbers, currencies and dates per locale.`,
    sections: [
      {
        heading: 'Message Bundles',
        body: `Put default texts in <code>src/main/resources/messages.properties</code> and translations in files named by locale: <code>messages_hi.properties</code>, <code>messages_ta.properties</code>. Spring Boot auto-configures a <code>MessageSource</code> when <code>messages.properties</code> exists. Keys are shared; values can contain placeholders <code>{0}</code>, <code>{1}</code> filled at runtime. Save files as UTF-8 (Spring Boot reads them as UTF-8 by default via <code>spring.messages.encoding</code>).`,
      },
      {
        heading: 'Resolving the Locale',
        body: `A <code>LocaleResolver</code> decides the current locale for each request. Spring Boot's default, <code>AcceptHeaderLocaleResolver</code>, uses the browser's <code>Accept-Language</code> header — ideal for REST APIs. For web apps where users pick a language, use a <code>CookieLocaleResolver</code> or <code>SessionLocaleResolver</code> with a <code>LocaleChangeInterceptor</code> that reads <code>?lang=hi</code>. In controllers and services, <code>LocaleContextHolder.getLocale()</code> or a <code>Locale</code> method parameter gives you the current locale.`,
      },
      {
        heading: 'Translating Validation and Error Messages',
        body: `Bean Validation messages can reference bundle keys: <code>@NotBlank(message = "{student.name.required}")</code>. Spring's <code>LocalValidatorFactoryBean</code> uses the same <code>MessageSource</code>, so validation errors come back in the user's language. <code>ProblemDetail</code> responses can also be localised: Spring MVC looks up keys such as <code>problemDetail.title.&lt;exception class&gt;</code> in the message source.`,
      },
      {
        heading: 'Formatting Numbers, Currency and Dates',
        body: `Translation is only half of i18n. The number one lakh twenty thousand is written <code>1,20,000.00</code> in India and <code>120,000.00</code> in the US; dates differ too. Use <code>NumberFormat.getCurrencyInstance(locale)</code> and <code>DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(locale)</code>, or Thymeleaf's <code>#numbers</code> and <code>#temporals</code> helpers, rather than hand-built strings. Store dates in UTC and convert for display.`,
      },
    ],
    examples: [
      {
        caption: 'Message bundles and configuration',
        code: `# src/main/resources/messages.properties (default, English)
greeting=Welcome, {0}!
course.enrolled=You are enrolled in {0}.
student.name.required=Name is required.

# messages_hi.properties (Hindi)
greeting=स्वागत है, {0}!
course.enrolled=आपने {0} में दाख़िला ले लिया है।
student.name.required=नाम आवश्यक है।

# messages_ta.properties (Tamil)
greeting=வரவேற்கிறோம், {0}!
course.enrolled=நீங்கள் {0} இல் சேர்ந்துள்ளீர்கள்.
student.name.required=பெயர் தேவை.

# application.properties
spring.messages.basename=messages
spring.messages.fallback-to-system-locale=false`,
        output: '(Spring Boot auto-configures a MessageSource from these files.)',
      },
      {
        caption: 'A REST endpoint that answers in the Accept-Language locale',
        code: `@RestController
public class GreetingController {

    private final MessageSource messages;

    public GreetingController(MessageSource messages) {
        this.messages = messages;
    }

    @GetMapping("/api/greeting")
    public Map<String, String> greet(@RequestParam String name, Locale locale) {
        return Map.of("message", messages.getMessage("greeting", new Object[] {name}, locale));
    }
}`,
        output: `curl -H "Accept-Language: en" "localhost:8080/api/greeting?name=Asha" -> {"message":"Welcome, Asha!"}
curl -H "Accept-Language: hi" "localhost:8080/api/greeting?name=Asha" -> {"message":"स्वागत है, Asha!"}
curl -H "Accept-Language: ta" "localhost:8080/api/greeting?name=Asha" -> {"message":"வரவேற்கிறோம், Asha!"}
curl -H "Accept-Language: fr" "localhost:8080/api/greeting?name=Asha" -> {"message":"Welcome, Asha!"}   (fallback to default bundle)`,
      },
      {
        caption: 'Localised validation errors and a user-selectable language for web pages',
        code: `public record StudentRequest(@NotBlank(message = "{student.name.required}") String name) {}

// POST /api/students with Accept-Language: hi and an empty name
// -> 400 with "नाम आवश्यक है।"

@Configuration
public class LocaleConfig implements WebMvcConfigurer {

    @Bean
    LocaleResolver localeResolver() {
        CookieLocaleResolver resolver = new CookieLocaleResolver("lang");
        resolver.setDefaultLocale(Locale.ENGLISH);
        return resolver;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang");               // /courses?lang=hi switches and remembers
        registry.addInterceptor(interceptor);
    }
}

<!-- Thymeleaf -->
<h1 th:text="#{greeting(\${user.name})}">Welcome!</h1>
<a th:href="@{''(lang=en)}">English</a> | <a th:href="@{''(lang=hi)}">हिन्दी</a>`,
        output: `GET /courses?lang=hi -> page rendered in Hindi, cookie lang=hi set
GET /courses          -> still Hindi (read from cookie)`,
      },
      {
        caption: 'Locale-aware number, currency and date formatting',
        code: `BigDecimal price = new BigDecimal("120000.50");
LocalDate date = LocalDate.of(2026, 9, 27);

for (Locale locale : List.of(Locale.of("en", "IN"), Locale.of("hi", "IN"), Locale.US, Locale.GERMANY)) {
    NumberFormat money = NumberFormat.getCurrencyInstance(locale);
    money.setCurrency(Currency.getInstance("INR"));
    String when = date.format(DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(locale));
    System.out.println(locale + " -> " + money.format(price) + " | " + when);
}`,
        output: `en_IN -> ₹1,20,000.50 | 27-Sept-2026
hi_IN -> ₹1,20,000.50 | 27 सित॰ 2026
en_US -> ₹120,000.50 | Sep 27, 2026
de_DE -> 120.000,50 ₹ | 27.09.2026`,
      },
    ],
    commonMistakes: [
      'Hard-coding user-facing strings in Java code or templates instead of message keys.',
      'Saving translation files in a non-UTF-8 encoding, producing garbled Hindi or Tamil text.',
      'Concatenating translated fragments ("You have " + n + " courses") instead of using placeholders, which breaks word order in other languages.',
      'Formatting currency and dates manually with a fixed pattern that is wrong for most locales.',
      'Leaving fallback-to-system-locale enabled, so the server\'s OS language unexpectedly becomes the fallback.',
    ],
    keyPoints: [
      'messages.properties plus messages_<locale>.properties hold translations; Spring Boot auto-configures MessageSource.',
      'AcceptHeaderLocaleResolver (default) suits APIs; Cookie/Session resolvers with LocaleChangeInterceptor suit web apps.',
      'Use {key} references in validation messages to localise errors.',
      'Use #{...} in Thymeleaf and MessageSource.getMessage in code, with placeholders for dynamic values.',
      'Format numbers, currency and dates with locale-aware formatters.',
    ],
  },

  'content-negotiation-json-and-xml': {
    title: 'Content Negotiation: JSON and XML',
    intro: `Most clients want JSON, but some — older enterprise systems, banking and government integrations, RSS consumers — expect XML. <strong>Content negotiation</strong> lets one endpoint return different representations of the same resource, chosen by the client's <code>Accept</code> header, and accept different formats in request bodies based on <code>Content-Type</code>.

This lesson shows how Spring MVC chooses a message converter, how to add XML support with Jackson's XML module, how to shape XML output, how to restrict or add media types per endpoint, and how the 406 and 415 errors arise.`,
    sections: [
      {
        heading: 'How Spring Chooses a Format',
        body: `For a <code>@RestController</code> return value, Spring MVC compares the client's <code>Accept</code> header with the media types that registered <code>HttpMessageConverter</code>s can produce (and the <code>produces</code> attribute of the mapping, if set), then picks the best match. For <code>@RequestBody</code>, it picks the converter that can read the request's <code>Content-Type</code>. If nothing matches the Accept header you get <strong>406 Not Acceptable</strong>; if nothing can read the body, <strong>415 Unsupported Media Type</strong>.`,
      },
      {
        heading: 'Adding XML Support',
        body: `Add <code>jackson-dataformat-xml</code> (the Jackson 3 artifact is <code>tools.jackson.dataformat:jackson-dataformat-xml</code>, version managed by Spring Boot). Spring Boot detects it and registers an XML converter automatically; the same DTOs now serialise to XML. Jackson XML annotations — <code>@JacksonXmlRootElement</code>, <code>@JacksonXmlProperty(isAttribute = true)</code>, <code>@JacksonXmlElementWrapper</code> — control element names, attributes and list wrapping. Spring Boot 4.1 also exposes XML factory customisation through <code>XmlFactoryBuilderCustomizer</code>.`,
      },
      {
        heading: 'Restricting Formats per Endpoint',
        body: `Use <code>produces</code> to limit an endpoint to certain formats (<code>produces = {APPLICATION_JSON_VALUE, APPLICATION_XML_VALUE}</code>) and <code>consumes</code> for accepted request formats. JSON is the default when a client sends no Accept header or <code>*/*</code> because the JSON converter is registered first.`,
      },
      {
        heading: 'Query Parameter or Extension Strategies',
        body: `Some clients cannot set headers (e.g. a link in a browser). You can enable a query parameter strategy such as <code>?format=xml</code> with <code>spring.mvc.contentnegotiation.favor-parameter=true</code>. Path extensions like <code>/users.xml</code> are no longer supported by default because they caused security and ambiguity problems.`,
      },
    ],
    examples: [
      {
        caption: 'Adding XML and returning both formats from one endpoint',
        code: `<dependency>
    <groupId>tools.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
</dependency>

@JacksonXmlRootElement(localName = "course")
public record CourseDto(
        @JacksonXmlProperty(isAttribute = true) String slug,
        String title,
        int lessons,
        @JacksonXmlElementWrapper(localName = "tags") @JacksonXmlProperty(localName = "tag") List<String> tags) {}

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @GetMapping(value = "/{slug}", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public CourseDto get(@PathVariable String slug) {
        return new CourseDto(slug, "Spring Boot", 100, List.of("java", "spring", "backend"));
    }
}`,
        output: `curl -H "Accept: application/json" localhost:8080/api/courses/spring-boot
{"slug":"spring-boot","title":"Spring Boot","lessons":100,"tags":["java","spring","backend"]}

curl -H "Accept: application/xml" localhost:8080/api/courses/spring-boot
<course slug="spring-boot"><title>Spring Boot</title><lessons>100</lessons><tags><tag>java</tag><tag>spring</tag><tag>backend</tag></tags></course>

curl -H "Accept: text/csv" localhost:8080/api/courses/spring-boot
-> 406 Not Acceptable`,
      },
      {
        caption: 'Accepting XML request bodies',
        code: `@PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
public ResponseEntity<CourseDto> create(@RequestBody CourseDto course) {
    return ResponseEntity.status(HttpStatus.CREATED).body(course);
}`,
        output: `curl -X POST -H "Content-Type: application/xml" -H "Accept: application/json" \\
     -d '<course slug="sql"><title>SQL</title><lessons>40</lessons><tags><tag>db</tag></tags></course>' \\
     localhost:8080/api/courses
-> 201 {"slug":"sql","title":"SQL","lessons":40,"tags":["db"]}

curl -X POST -H "Content-Type: text/plain" -d 'hello' localhost:8080/api/courses
-> 415 Unsupported Media Type`,
      },
      {
        caption: 'Choosing the format with a query parameter',
        code: `# application.yml
spring:
  mvc:
    contentnegotiation:
      favor-parameter: true
      parameter-name: format
      media-types:
        xml: application/xml
        json: application/json`,
        output: `GET /api/courses/spring-boot?format=xml  -> XML response
GET /api/courses/spring-boot?format=json -> JSON response`,
      },
    ],
    commonMistakes: [
      'Adding the Jackson 2 artifact com.fasterxml.jackson.dataformat:jackson-dataformat-xml to a Spring Boot 4 app instead of the tools.jackson one.',
      'Expecting XML without sending Accept: application/xml — JSON remains the default.',
      'Using path extensions (/users.xml), which are disabled by default in modern Spring MVC.',
      'Setting produces to XML only and breaking existing JSON clients.',
      'Forgetting that XML lists need wrapper configuration to produce the element structure clients expect.',
    ],
    keyPoints: [
      'Spring MVC picks message converters from the Accept and Content-Type headers.',
      'Adding jackson-dataformat-xml enables XML automatically for the same DTOs.',
      'Jackson XML annotations shape root elements, attributes and list wrappers.',
      'produces/consumes restrict formats; mismatches return 406 or 415.',
      'A query parameter strategy (?format=xml) helps clients that cannot set headers.',
    ],
  },

  'filtering-api-responses-static-and-dynamic': {
    title: 'Filtering API Responses: Static and Dynamic',
    intro: `A user entity may contain a password hash, internal notes and audit fields that must never leave the server, and different endpoints may need different subsets of the same data: a public profile shows the name and avatar, while the admin view also shows email and account status. Controlling which fields appear in a response is called <strong>filtering</strong>.

<strong>Static filtering</strong> removes fields everywhere, always. <strong>Dynamic filtering</strong> chooses fields per endpoint or per request. This lesson compares the approaches — Jackson annotations, <code>@JsonView</code>, separate DTOs, and client-selected fields — and explains why dedicated DTOs are usually the safest design.`,
    sections: [
      {
        heading: 'Static Filtering with Jackson Annotations',
        body: `<code>@JsonIgnore</code> on a field or <code>@JsonIgnoreProperties({"passwordHash", "internalNotes"})</code> on a class removes fields from every JSON response. <code>@JsonProperty(access = WRITE_ONLY)</code> accepts a field in requests but never writes it in responses — useful for a password on a registration DTO. Static filtering is simple and safe for fields that are never public.`,
      },
      {
        heading: 'Dynamic Filtering with @JsonView',
        body: `Define view marker interfaces (for example <code>Views.Public</code> and <code>Views.Admin extends Views.Public</code>), annotate fields with the view they belong to, and annotate controller methods with <code>@JsonView(Views.Public.class)</code>. Jackson then writes only fields in that view. One class serves several response shapes, chosen per endpoint.`,
      },
      {
        heading: 'Separate DTOs: The Recommended Default',
        body: `Dedicated response records — <code>PublicProfile</code>, <code>AdminUserView</code> — are explicit, type-safe and impossible to misconfigure: a field that is not in the record cannot leak. They also document the API contract clearly in OpenAPI. Prefer DTOs for anything security-sensitive; use <code>@JsonView</code> when many views share most fields.`,
      },
      {
        heading: 'Client-Selected Fields',
        body: `Some APIs let clients request only the fields they need: <code>?fields=id,name</code>. This reduces payload size for mobile clients. Implement it carefully with an allow-list of field names — never let clients request arbitrary properties of an entity — or consider GraphQL, which is designed for client-selected fields.`,
      },
    ],
    examples: [
      {
        caption: 'Static filtering',
        code: `@JsonIgnoreProperties({"internalNotes"})
public class UserAccount {
    private Long id;
    private String name;
    private String email;

    @JsonIgnore
    private String passwordHash;

    private String internalNotes;
    // getters
}

public record RegisterRequest(
        String email,
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) String password) {}`,
        output: `GET /api/users/7 -> {"id":7,"name":"Asha Rao","email":"asha@webnest.in"}
(passwordHash and internalNotes are never serialised)`,
      },
      {
        caption: 'Dynamic filtering with @JsonView',
        code: `public final class Views {
    public interface Public {}
    public interface Admin extends Public {}
    private Views() {}
}

public record UserView(
        @JsonView(Views.Public.class) Long id,
        @JsonView(Views.Public.class) String name,
        @JsonView(Views.Public.class) String avatarUrl,
        @JsonView(Views.Admin.class) String email,
        @JsonView(Views.Admin.class) String status,
        @JsonView(Views.Admin.class) Instant lastLogin) {}

@RestController
public class UserQueryController {

    @GetMapping("/api/users/{id}/profile")
    @JsonView(Views.Public.class)
    public UserView publicProfile(@PathVariable Long id) {
        return users.view(id);
    }

    @GetMapping("/api/admin/users/{id}")
    @JsonView(Views.Admin.class)
    @PreAuthorize("hasRole('ADMIN')")
    public UserView adminView(@PathVariable Long id) {
        return users.view(id);
    }
}`,
        output: `GET /api/users/7/profile   -> {"id":7,"name":"Asha Rao","avatarUrl":"/img/7.png"}
GET /api/admin/users/7     -> {"id":7,"name":"Asha Rao","avatarUrl":"/img/7.png","email":"asha@webnest.in","status":"ACTIVE","lastLogin":"2026-09-27T08:30:00Z"}`,
      },
      {
        caption: 'Explicit DTOs and an allow-listed ?fields parameter',
        code: `public record PublicProfile(Long id, String name, String avatarUrl) {}
public record AdminUserDetails(Long id, String name, String email, String status, Instant lastLogin) {}

private static final Set<String> ALLOWED = Set.of("id", "name", "email", "course", "progress");

@GetMapping("/api/students/{id}")
public Map<String, Object> student(@PathVariable Long id,
                                   @RequestParam(required = false) Set<String> fields) {
    Map<String, Object> full = studentService.asMap(id);        // id, name, email, course, progress
    if (fields == null || fields.isEmpty()) {
        return full;
    }
    Set<String> requested = new HashSet<>(fields);
    requested.retainAll(ALLOWED);                               // ignore anything not allow-listed
    Map<String, Object> result = new LinkedHashMap<>();
    requested.forEach(f -> result.put(f, full.get(f)));
    return result;
}`,
        output: `GET /api/students/3?fields=name,progress        -> {"name":"Meera","progress":64}
GET /api/students/3?fields=name,passwordHash    -> {"name":"Meera"}   (not allow-listed, ignored)`,
      },
    ],
    commonMistakes: [
      'Serialising JPA entities directly and relying on @JsonIgnore alone to hide sensitive fields — one missed annotation leaks data.',
      'Forgetting that fields without any @JsonView are included by default (unless DEFAULT_VIEW_INCLUSION is disabled).',
      'Letting clients choose arbitrary fields without an allow-list.',
      'Using the older MappingJacksonValue/SimpleBeanPropertyFilter approach from old tutorials, which is verbose and error-prone; prefer DTOs or @JsonView.',
      'Filtering in the response only, while still loading expensive data that is never returned.',
    ],
    keyPoints: [
      'Static filtering (@JsonIgnore, @JsonIgnoreProperties, WRITE_ONLY) hides fields everywhere.',
      '@JsonView selects field sets per endpoint from one class.',
      'Dedicated response DTOs are the safest and clearest way to control output.',
      'Client-selected fields need a strict allow-list; GraphQL is an alternative for heavy use.',
      'Never expose entities with secrets directly as JSON.',
    ],
  },

  'rest-api-best-practices-and-the-richardson-maturity-model': {
    title: 'REST API Best Practices and the Richardson Maturity Model',
    intro: `Anyone can return JSON from a URL. Designing an API that other developers find predictable, safe to evolve and pleasant to use takes deliberate choices about URLs, HTTP methods, status codes, errors, pagination, versioning and security. These choices matter more than the framework: a well-designed API outlives several implementations.

This lesson explains the Richardson Maturity Model — a useful way to judge how "RESTful" an API is — and then collects the REST best practices used by mature API teams, each illustrated with a Spring Boot example.`,
    sections: [
      {
        heading: 'The Richardson Maturity Model',
        body: `Leonard Richardson described four levels of REST maturity:`,
        list: [
          '<strong>Level 0 — The Swamp of POX</strong>: one URL, one method (usually POST) for everything, with the action in the body: <code>POST /api {"action":"getUser","id":7}</code>. This is RPC over HTTP.',
          '<strong>Level 1 — Resources</strong>: separate URLs per resource (<code>/users/7</code>, <code>/orders/41</code>), but still one HTTP method for all actions.',
          '<strong>Level 2 — HTTP Verbs</strong>: the correct methods and status codes — GET to read, POST to create (201), PUT/PATCH to update, DELETE to remove (204), 404 for missing resources. Most good production APIs live here.',
          '<strong>Level 3 — Hypermedia Controls (HATEOAS)</strong>: responses include links to related resources and available actions (see the HATEOAS lesson).',
        ],
      },
      {
        heading: 'Resource and URL Design',
        body: `Use nouns, not verbs: <code>/api/orders</code>, not <code>/api/getOrders</code>. Use plural collection names and ids for items: <code>/api/orders/41</code>. Express relationships with nesting only one level deep: <code>/api/users/7/orders</code>. Use lowercase, hyphen-separated paths. For operations that are not simple CRUD, model them as sub-resources or actions on a resource: <code>POST /api/orders/41/cancellation</code>.`,
      },
      {
        heading: 'Methods, Idempotency and Status Codes',
        body: `GET, PUT and DELETE must be <strong>idempotent</strong> — repeating them has the same effect as doing them once — and GET must be <strong>safe</strong> (no changes). POST is not idempotent; for payments and orders, accept an <code>Idempotency-Key</code> header so retries do not create duplicates. Use precise status codes: 200, 201 + <code>Location</code>, 202 for accepted async work, 204, 400 (validation), 401, 403, 404, 409 (conflict), 422, 429 (rate limited), 500/503.`,
      },
      {
        heading: 'Errors, Pagination, Filtering and Versioning',
        body: `Return errors in one consistent format — RFC 9457 <code>ProblemDetail</code> (built into Spring) — with a machine-readable type, a human-readable detail and field-level validation errors. Paginate every collection (<code>?page=0&amp;size=20&amp;sort=createdAt,desc</code>) and cap the page size. Use query parameters for filtering and searching. Evolve additively and version only for breaking changes (see the API versioning lesson).`,
      },
      {
        heading: 'Security, Performance and Documentation',
        body: `Always use HTTPS; authenticate with OAuth2/JWT or sessions, authorise every resource access including ownership; validate all input; rate-limit; never leak stack traces. Support caching with <code>ETag</code>/<code>Cache-Control</code> and compression. Document the API with OpenAPI (springdoc) including examples and error responses, and keep the documentation generated from code so it never drifts.`,
      },
    ],
    examples: [
      {
        caption: 'Level 0 vs Level 2: the same operations',
        code: `// Level 0 — RPC style, everything is POST /api
POST /api  {"action": "getOrder",    "id": 41}                 -> 200 {"ok": true,  "order": {...}}
POST /api  {"action": "cancelOrder", "id": 41}                 -> 200 {"ok": false, "error": "not found"}

// Level 2 — resources + HTTP verbs + status codes
GET    /api/orders/41                                          -> 200 {...}
POST   /api/orders            {"items": [...]}                 -> 201 Created, Location: /api/orders/42
PATCH  /api/orders/41         {"shippingAddress": {...}}       -> 200 {...}
POST   /api/orders/41/cancellation                             -> 202 Accepted
DELETE /api/orders/41/items/3                                  -> 204 No Content
GET    /api/orders/9999                                        -> 404 application/problem+json`,
        output: '(Level 2 lets HTTP clients, caches, proxies and monitoring tools understand the API without reading its body.)',
      },
      {
        caption: 'Consistent errors with ProblemDetail',
        code: `# application.yml — also turn Spring MVC's own errors into ProblemDetail
spring:
  mvc:
    problemdetails:
      enabled: true

@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    ProblemDetail notFound(OrderNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setType(URI.create("https://api.webnest.in/problems/order-not-found"));
        pd.setTitle("Order not found");
        pd.setProperty("orderId", ex.orderId());
        return pd;
    }
}`,
        output: `GET /api/orders/9999
HTTP/1.1 404
Content-Type: application/problem+json
{"type":"https://api.webnest.in/problems/order-not-found","title":"Order not found","status":404,
 "detail":"Order 9999 does not exist","instance":"/api/orders/9999","orderId":9999}`,
      },
      {
        caption: 'Idempotent POST with an Idempotency-Key and conditional GET with ETag',
        code: `@PostMapping("/api/payments")
public ResponseEntity<PaymentDto> pay(@RequestHeader("Idempotency-Key") String key,
                                      @Valid @RequestBody PaymentRequest req) {
    // returns the stored result if this key was already processed
    PaymentResult result = payments.processOnce(key, req);
    return ResponseEntity.status(result.created() ? HttpStatus.CREATED : HttpStatus.OK)
        .location(URI.create("/api/payments/" + result.payment().id()))
        .body(result.payment());
}

@GetMapping("/api/courses/{slug}")
public ResponseEntity<CourseDto> course(@PathVariable String slug, WebRequest request) {
    CourseDto course = courses.get(slug);
    String etag = "\\"" + course.version() + "\\"";
    if (request.checkNotModified(etag)) {
        return null;                                    // Spring sends 304 Not Modified
    }
    return ResponseEntity.ok().eTag(etag).cacheControl(CacheControl.maxAge(Duration.ofMinutes(5))).body(course);
}`,
        output: `POST /api/payments  Idempotency-Key: 9f1c...  -> 201 Created
POST /api/payments  Idempotency-Key: 9f1c...  -> 200 OK (same payment, no double charge)

GET /api/courses/spring-boot                         -> 200, ETag: "12"
GET /api/courses/spring-boot  If-None-Match: "12"    -> 304 Not Modified (no body)`,
      },
      {
        caption: 'A quick design checklist',
        code: `[ ] Nouns and plural collections: /api/orders, /api/orders/{id}
[ ] Correct methods; GET safe; PUT/DELETE idempotent; Idempotency-Key for critical POSTs
[ ] Precise status codes, 201 + Location on create, 204 on delete
[ ] ProblemDetail (application/problem+json) for every error, with field errors for validation
[ ] Pagination with a maximum page size on every collection
[ ] Filtering/sorting via query parameters with allow-listed fields
[ ] DTOs, never entities, in requests and responses
[ ] Authentication, per-resource authorization, input validation, rate limiting, HTTPS
[ ] ETag/Cache-Control where data is cacheable; compression on
[ ] Backward-compatible evolution; explicit versioning only for breaking changes
[ ] OpenAPI documentation generated from code, with examples
[ ] Correlation id header and structured logs for every request`,
        output: '(Review new endpoints against this list in code review.)',
      },
    ],
    commonMistakes: [
      'Verbs in URLs (/createOrder, /deleteUser) and POST for every operation — a Level 0/1 design.',
      'Returning 200 OK with {"success": false} for errors, hiding failures from HTTP clients and monitoring.',
      'Returning unbounded collections without pagination.',
      'Inconsistent error formats between endpoints and services.',
      'Breaking existing clients by renaming fields without versioning or a deprecation period.',
    ],
    keyPoints: [
      'Richardson levels: 0 single endpoint RPC, 1 resources, 2 HTTP verbs and status codes, 3 hypermedia.',
      'Aim for at least Level 2: nouns, correct methods, precise status codes.',
      'Use ProblemDetail for errors, pagination for collections, and DTOs for payloads.',
      'Make critical POSTs idempotent with an Idempotency-Key; use ETags for caching.',
      'Secure, document (OpenAPI) and evolve APIs backward-compatibly.',
    ],
  },
}
