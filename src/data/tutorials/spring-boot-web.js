// Spring Boot course — web and HTTP client lessons (Spring Boot 4 /
// Spring Framework 7 / Jackson 3). Keys are slugs matching the topics in the
// API Development and Calling Other Services modules of codelabDefaults.js.
export const springBootWeb = {
  'request-mapping-and-parameters': {
    title: 'Request Mapping and Parameters',
    intro: `Every REST endpoint starts with two questions: which requests should reach this method, and how does data from the request get into Java variables? Spring MVC answers both with annotations — <code>@RequestMapping</code> and its shortcuts for routing, and a family of parameter annotations for binding path segments, query strings, headers, cookies and bodies.

This lesson is a complete reference to request mapping in Spring Boot 4: HTTP method shortcuts, URI patterns, path variables, query parameters with defaults and optional values, headers, cookies, request bodies, binding query parameters into objects, content negotiation with <code>consumes</code>/<code>produces</code>, and building responses with <code>ResponseEntity</code>.`,
    sections: [
      {
        heading: 'Routing Annotations',
        body: `<code>@RequestMapping</code> on a class sets a common path prefix. On methods, use the shortcuts <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@PatchMapping</code> and <code>@DeleteMapping</code>. Mappings can also be narrowed by <code>params</code>, <code>headers</code>, <code>consumes</code> (request Content-Type) and <code>produces</code> (response types the client accepts), and in Spring Framework 7 by <code>version</code> (see the API versioning lesson).`,
      },
      {
        heading: 'URI Patterns',
        body: `Spring MVC uses <code>PathPattern</code> matching. <code>/files/*</code> matches one path segment, <code>/files/**</code> matches any number of trailing segments, <code>{id}</code> captures a segment, <code>{id:\\d+}</code> captures a segment matching a regular expression, and <code>{*path}</code> captures the rest of the path. Trailing slashes are not matched by default: <code>/api/users/</code> does not match <code>/api/users</code>.`,
      },
      {
        heading: 'Binding Request Data',
        body: `Each annotation reads from a different part of the request:`,
        list: [
          '<code>@PathVariable</code> — a segment of the URL path, e.g. <code>/courses/{slug}</code>.',
          '<code>@RequestParam</code> — a query string or form parameter; supports <code>defaultValue</code>, <code>required = false</code>, <code>Optional</code>, and lists (<code>?tag=a&amp;tag=b</code>).',
          '<code>@RequestHeader</code> — an HTTP header such as <code>Accept-Language</code> or a custom <code>X-Request-Id</code>.',
          '<code>@CookieValue</code> — a cookie value.',
          '<code>@RequestBody</code> — the request body, converted from JSON by Jackson.',
          '<code>@ModelAttribute</code> (or no annotation) — binds many query parameters into one object or record, ideal for search filters.',
          '<code>HttpServletRequest</code>, <code>Principal</code>, <code>Locale</code>, <code>Pageable</code> — injected directly by type.',
        ],
      },
      {
        heading: 'Type Conversion',
        body: `Spring converts strings from the request into the declared parameter types: numbers, booleans, enums (by name), <code>UUID</code>, <code>LocalDate</code> (with <code>@DateTimeFormat(iso = ISO.DATE)</code> or the global <code>spring.mvc.format.date</code> property) and more. A conversion failure — <code>/orders/abc</code> for a <code>Long</code> id — produces a 400 Bad Request automatically.`,
      },
      {
        heading: 'Building Responses with ResponseEntity',
        body: `Returning an object gives 200 OK with a JSON body. Use <code>ResponseEntity</code> to control status, headers and body: <code>ResponseEntity.created(location).body(dto)</code> for 201, <code>ResponseEntity.noContent().build()</code> for 204, <code>ResponseEntity.ok().eTag(...)</code> for caching. <code>@ResponseStatus</code> on a method sets a fixed status for void methods.`,
      },
    ],
    examples: [
      {
        caption: 'Path variables, patterns and query parameters',
        code: `@RestController
@RequestMapping("/api/courses")
public class CourseController {

    // GET /api/courses?level=BEGINNER&tag=java&tag=oop&page=0
    @GetMapping
    public List<String> list(@RequestParam(required = false) Level level,
                             @RequestParam(defaultValue = "") List<String> tag,
                             @RequestParam(defaultValue = "0") int page) {
        return List.of("level=" + level, "tags=" + tag, "page=" + page);
    }

    // GET /api/courses/spring-boot
    @GetMapping("/{slug}")
    public String bySlug(@PathVariable String slug) {
        return "course " + slug;
    }

    // GET /api/courses/42/lessons/7   (numeric ids only)
    @GetMapping("/{courseId:\\\\d+}/lessons/{lessonId:\\\\d+}")
    public String lesson(@PathVariable long courseId, @PathVariable long lessonId) {
        return "course " + courseId + " lesson " + lessonId;
    }

    // GET /api/courses/files/images/2026/logo.png
    @GetMapping("/files/{*path}")
    public String file(@PathVariable String path) {
        return "file path = " + path;
    }
}`,
        output: `GET /api/courses?level=BEGINNER&tag=java&tag=oop  -> ["level=BEGINNER","tags=[java, oop]","page=0"]
GET /api/courses/spring-boot                       -> course spring-boot
GET /api/courses/42/lessons/7                      -> course 42 lesson 7
GET /api/courses/abc/lessons/7                     -> 404 (regex does not match)
GET /api/courses/files/images/2026/logo.png        -> file path = /images/2026/logo.png
GET /api/courses?level=EXPERT                      -> 400 Bad Request (not a Level enum value)`,
      },
      {
        caption: 'Headers, cookies, dates and binding query parameters into a record',
        code: `public record OrderSearch(String status,
                          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                          Integer minAmount) {}

@RestController
@RequestMapping("/api/orders")
public class OrderQueryController {

    // GET /api/orders/search?status=PAID&from=2026-09-01&to=2026-09-30&minAmount=500
    @GetMapping("/search")
    public OrderSearch search(OrderSearch criteria) {       // bound from query parameters
        return criteria;
    }

    @GetMapping("/whoami")
    public Map<String, Object> whoami(@RequestHeader("User-Agent") String userAgent,
                                      @RequestHeader(value = "X-Request-Id", required = false) String requestId,
                                      @CookieValue(value = "theme", defaultValue = "light") String theme,
                                      Locale locale) {
        return Map.of("userAgent", userAgent, "requestId", String.valueOf(requestId),
                      "theme", theme, "locale", locale.toLanguageTag());
    }
}`,
        output: `GET /api/orders/search?status=PAID&from=2026-09-01&to=2026-09-30&minAmount=500
{"status":"PAID","from":"2026-09-01","to":"2026-09-30","minAmount":500}

GET /api/orders/whoami  (Cookie: theme=dark, Accept-Language: hi-IN)
{"userAgent":"curl/8.9.1","requestId":"null","theme":"dark","locale":"hi-IN"}`,
      },
      {
        caption: 'Request bodies, consumes/produces and ResponseEntity',
        code: `public record CreateNoteRequest(@NotBlank String title, String body) {}
public record NoteDto(Long id, String title, String body) {}

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService notes;

    public NoteController(NoteService notes) {
        this.notes = notes;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NoteDto> create(@Valid @RequestBody CreateNoteRequest req,
                                          UriComponentsBuilder uri) {
        NoteDto saved = notes.create(req);
        URI location = uri.path("/api/notes/{id}").buildAndExpand(saved.id()).toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @GetMapping(value = "/{id}", produces = "text/markdown")
    public String asMarkdown(@PathVariable Long id) {
        NoteDto n = notes.get(id);
        return "# " + n.title() + "\\n\\n" + n.body();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notes.delete(id);
        return ResponseEntity.noContent().build();
    }
}`,
        output: `POST /api/notes  Content-Type: application/json  {"title":"JPA","body":"Use LAZY"}
-> 201 Created, Location: http://localhost:8080/api/notes/3, {"id":3,"title":"JPA","body":"Use LAZY"}

POST /api/notes  Content-Type: text/plain  -> 415 Unsupported Media Type
GET  /api/notes/3  Accept: text/markdown   -> "# JPA\\n\\nUse LAZY"
DELETE /api/notes/3                        -> 204 No Content`,
      },
    ],
    commonMistakes: [
      'Using @RequestParam for data that identifies a resource; resource ids belong in the path (/orders/42), filters in the query string.',
      'Declaring primitive int for an optional query parameter without a defaultValue, causing a 400 or IllegalStateException when it is missing.',
      'Forgetting @RequestBody on a POST parameter, so Spring tries to bind query parameters and every field is null.',
      'Expecting /api/users/ to match /api/users — trailing-slash matching is off by default since Spring Framework 6.',
      'Returning 200 OK for creation and deletion instead of 201 Created with a Location header and 204 No Content.',
    ],
    keyPoints: [
      'Use @GetMapping/@PostMapping/@PutMapping/@PatchMapping/@DeleteMapping with a class-level @RequestMapping prefix.',
      '@PathVariable, @RequestParam, @RequestHeader, @CookieValue and @RequestBody read different parts of the request.',
      'Bind many query parameters into a record for search endpoints.',
      'consumes and produces restrict mappings by content type; mismatches return 415 or 406.',
      'ResponseEntity controls status codes and headers such as Location.',
    ],
  },

  'json-with-jackson-3': {
    title: 'JSON with Jackson 3',
    intro: `Almost every Spring Boot API speaks JSON, and the library doing the work is Jackson. Spring Boot 4 moves to <strong>Jackson 3</strong>, a major version with a new package name (<code>tools.jackson</code>), immutable mappers built with builders, unchecked exceptions and better defaults. Jackson 2 is still available in a deprecated form to ease migration.

This lesson shows how Spring Boot configures Jackson, how to control JSON output with annotations, how to customise the mapper globally with properties and customizers, how to write custom serializers, and what changes when you migrate from Jackson 2.`,
    sections: [
      {
        heading: 'What Changed in Jackson 3',
        body: `Most core classes moved from <code>com.fasterxml.jackson</code> to <code>tools.jackson</code> (for example <code>tools.jackson.databind.json.JsonMapper</code>), but the annotations you use daily — <code>@JsonProperty</code>, <code>@JsonIgnore</code>, <code>@JsonInclude</code>, <code>@JsonFormat</code> — stay in <code>com.fasterxml.jackson.annotation</code>, so most model classes compile unchanged. <code>JsonMapper</code> is immutable and built with <code>JsonMapper.builder()</code>. Jackson exceptions are now unchecked (<code>JacksonException</code> extends <code>RuntimeException</code>). Java time types are supported out of the box and dates are written as ISO-8601 strings by default.`,
      },
      {
        heading: 'Spring Boot Integration',
        body: `Spring Boot auto-configures a <code>JsonMapper</code> bean used by Spring MVC, RestClient and WebClient. Customise it with <code>spring.jackson.*</code> properties or with a <code>JsonMapperBuilderCustomizer</code> bean (the Jackson 3 replacement for <code>Jackson2ObjectMapperBuilderCustomizer</code>). Custom serializers can be registered with <code>@JacksonComponent</code> (formerly <code>@JsonComponent</code>). Spring Boot keeps the helpful default of <strong>not</strong> failing on unknown JSON properties, so clients can send extra fields safely.`,
      },
      {
        heading: 'Controlling Output with Annotations',
        body: `Annotations on your DTOs shape the JSON contract:`,
        list: [
          '<code>@JsonProperty("full_name")</code> — rename a field in JSON.',
          '<code>@JsonIgnore</code> — never serialise a field (e.g. an internal flag).',
          '<code>@JsonInclude(JsonInclude.Include.NON_NULL)</code> — omit null fields.',
          '<code>@JsonFormat(pattern = "dd-MM-yyyy")</code> — custom date format for one field.',
          '<code>@JsonPropertyOrder</code>, <code>@JsonAlias</code>, <code>@JsonUnwrapped</code>, <code>@JsonView</code> — ordering, accepting old names, flattening, and per-endpoint field sets.',
          '<code>@JsonTypeInfo</code> + <code>@JsonSubTypes</code> — polymorphic JSON (e.g. different payment method types).',
        ],
      },
      {
        heading: 'DTOs Instead of Entities',
        body: `Serialising JPA entities directly couples your API to your database schema, triggers lazy loading, and can leak fields such as password hashes. Map entities to records designed for the API (see the DTOs lesson). Records work perfectly with Jackson 3 without any annotations.`,
      },
    ],
    examples: [
      {
        caption: 'A DTO shaped with Jackson annotations',
        code: `import com.fasterxml.jackson.annotation.*;   // annotations keep their old package

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"id", "fullName", "email"})
public record StudentDto(
        Long id,
        @JsonProperty("fullName") String name,
        String email,
        @JsonFormat(pattern = "dd-MM-yyyy") LocalDate joined,
        Instant lastLogin,
        String phone,
        @JsonIgnore String internalNotes) {}

@GetMapping("/api/students/{id}")
public StudentDto get(@PathVariable Long id) {
    return new StudentDto(id, "Asha Rao", "asha@webnest.in", LocalDate.of(2026, 1, 15),
        Instant.parse("2026-09-27T08:30:00Z"), null, "VIP support");
}`,
        output: `{"id":7,"fullName":"Asha Rao","email":"asha@webnest.in","joined":"15-01-2026","lastLogin":"2026-09-27T08:30:00Z"}
(phone omitted because it is null; internalNotes never serialised)`,
      },
      {
        caption: 'Global configuration with properties and a JsonMapperBuilderCustomizer',
        code: `# application.yml
spring:
  jackson:
    property-naming-strategy: SNAKE_CASE
    default-property-inclusion: non_null
    serialization:
      indent-output: true           # pretty-print (development only)

@Configuration
public class JacksonConfig {

    @Bean
    JsonMapperBuilderCustomizer jsonCustomizer() {
        return builder -> builder
            .enable(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES)
            .defaultTimeZone(TimeZone.getTimeZone("Asia/Kolkata"));
    }
}`,
        output: `{
  "id" : 7,
  "full_name" : "Asha Rao",
  "email" : "asha@webnest.in"
}`,
      },
      {
        caption: 'A custom serializer registered with @JacksonComponent',
        code: `// Serialise Money as {"amount":"1299.00","currency":"INR","display":"₹1,299.00"}
public record Money(BigDecimal amount, Currency currency) {}

@JacksonComponent
public class MoneyJson {

    public static class Serializer extends ValueSerializer<Money> {
        @Override
        public void serialize(Money value, JsonGenerator gen, SerializationContext ctxt) {
            NumberFormat fmt = NumberFormat.getCurrencyInstance(Locale.of("en", "IN"));
            fmt.setCurrency(value.currency());
            gen.writeStartObject();
            gen.writeStringProperty("amount", value.amount().setScale(2).toPlainString());
            gen.writeStringProperty("currency", value.currency().getCurrencyCode());
            gen.writeStringProperty("display", fmt.format(value.amount()));
            gen.writeEndObject();
        }
    }
}`,
        output: `{"price":{"amount":"1299.00","currency":"INR","display":"₹1,299.00"}}`,
      },
      {
        caption: 'Polymorphic JSON and using JsonMapper directly',
        code: `@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = CardPayment.class, name = "card"),
    @JsonSubTypes.Type(value = UpiPayment.class, name = "upi")
})
public sealed interface Payment permits CardPayment, UpiPayment {}
public record CardPayment(String last4, String network) implements Payment {}
public record UpiPayment(String vpa) implements Payment {}

@Component
public class PaymentParser {

    private final JsonMapper mapper;   // tools.jackson.databind.json.JsonMapper (auto-configured)

    public PaymentParser(JsonMapper mapper) {
        this.mapper = mapper;
    }

    public Payment parse(String json) {
        return mapper.readValue(json, Payment.class);   // no checked IOException in Jackson 3
    }
}

paymentParser.parse("""
    {"type": "upi", "vpa": "asha@okbank"}
    """);`,
        output: `UpiPayment[vpa=asha@okbank]`,
      },
    ],
    commonMistakes: [
      'Importing com.fasterxml.jackson.databind.ObjectMapper in a Spring Boot 4 app and getting a different (Jackson 2) mapper than Spring MVC uses; inject tools.jackson JsonMapper instead.',
      'Declaring a Jackson2ObjectMapperBuilderCustomizer in Boot 4 and wondering why it has no effect — use JsonMapperBuilderCustomizer.',
      'Returning JPA entities directly and leaking internal fields or triggering lazy-loading exceptions.',
      'Using the old spring.jackson.read.* / spring.jackson.write.* keys for JSON parser/generator features; in Spring Boot 4 they moved under spring.jackson.json.read.* and spring.jackson.json.write.*.',
      'Leaving indent-output enabled in production, increasing response size.',
    ],
    keyPoints: [
      'Spring Boot 4 uses Jackson 3: core classes live in tools.jackson, annotations stay in com.fasterxml.jackson.annotation.',
      'JsonMapper is immutable and built with builders; Jackson exceptions are unchecked.',
      'Configure with spring.jackson.* properties or a JsonMapperBuilderCustomizer bean.',
      'Use @JsonProperty, @JsonInclude, @JsonFormat and @JsonIgnore to define the JSON contract on DTOs.',
      '@JacksonComponent registers custom serializers; @JsonTypeInfo handles polymorphic JSON.',
    ],
  },

  'file-upload-and-download': {
    title: 'File Upload and Download',
    intro: `Profile pictures, assignment submissions, invoices, CSV imports and report exports — nearly every application moves files over HTTP. Doing it well means more than accepting a <code>MultipartFile</code>: you need size limits, content validation, safe file names, storage outside the web root (or in object storage), and efficient streaming for large downloads.

This lesson builds a complete file service in Spring Boot: multipart uploads with metadata, validation, storing files on disk or in S3-compatible storage, downloads with correct headers, inline previews versus attachments, and streaming large generated files.`,
    sections: [
      {
        heading: 'Multipart Uploads',
        body: `Browsers and clients upload files with <code>multipart/form-data</code>. Spring Boot configures multipart support automatically; your controller receives <code>MultipartFile</code> parameters via <code>@RequestParam</code> or <code>@RequestPart</code>. Use <code>@RequestPart</code> when a request combines a file with a JSON part (for example metadata). Configure limits with <code>spring.servlet.multipart.max-file-size</code> and <code>max-request-size</code>; the defaults are 1MB and 10MB.`,
      },
      {
        heading: 'Validating Uploads',
        body: `Never trust the client: the file name can contain <code>../</code> path traversal, the declared Content-Type can lie, and a ".jpg" can be an executable. Generate your own storage name (a UUID), check the extension against an allow-list, verify the actual content type (for example with Apache Tika), and enforce size limits. Store uploads outside any directory served as static content.`,
      },
      {
        heading: 'Where to Store Files',
        body: `Local disk is fine for a single server. As soon as you run more than one instance or deploy to containers, use object storage — Amazon S3, Google Cloud Storage, Azure Blob, or an S3-compatible service like MinIO or Cloudflare R2 — and keep only metadata (owner, original name, size, storage key) in your database. For private files, serve downloads through your application (with authorization checks) or generate short-lived pre-signed URLs.`,
      },
      {
        heading: 'Downloads',
        body: `Return a <code>ResponseEntity&lt;Resource&gt;</code> with <code>Content-Type</code>, <code>Content-Length</code> and a <code>Content-Disposition</code> header: <code>attachment</code> makes the browser download the file, <code>inline</code> displays it (PDFs, images). <code>ContentDisposition.attachment().filename(name, UTF_8)</code> encodes non-ASCII names correctly. Spring streams the resource without loading it fully into memory.`,
      },
      {
        heading: 'Streaming Generated Content',
        body: `For large exports generated on the fly (CSV of a million rows), return <code>StreamingResponseBody</code> and write to the output stream as you read from the database, so memory use stays constant.`,
      },
    ],
    examples: [
      {
        caption: 'Upload limits and a storage service',
        code: `# application.yml
spring:
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 6MB
app:
  storage:
    root: D:/webnest-uploads        # outside the project and static folders

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED = Set.of("png", "jpg", "jpeg", "pdf");
    private final Path root;

    public FileStorageService(@Value("\${app.storage.root}") Path root) throws IOException {
        this.root = Files.createDirectories(root);
    }

    public StoredFile store(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Empty file");
        String original = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String ext = StringUtils.getFilenameExtension(original);
        if (ext == null || !ALLOWED.contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("File type not allowed: " + original);
        }
        String key = UUID.randomUUID() + "." + ext.toLowerCase();   // never use the client's name on disk
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, root.resolve(key));
        }
        return new StoredFile(key, original, file.getSize(), file.getContentType());
    }

    public Resource load(String key) {
        Path path = root.resolve(key).normalize();
        if (!path.startsWith(root)) throw new SecurityException("Invalid path");
        return new FileSystemResource(path);
    }
}

public record StoredFile(String key, String originalName, long size, String contentType) {}`,
        output: '(Files are saved as e.g. D:/webnest-uploads/7f3c9a1e-....pdf while the original name is kept only as metadata.)',
      },
      {
        caption: 'Upload endpoints: single file and file plus JSON metadata',
        code: `public record AssignmentMeta(@NotBlank String title, Long courseId) {}

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService storage;

    public FileController(FileStorageService storage) {
        this.storage = storage;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StoredFile upload(@RequestParam("file") MultipartFile file) throws IOException {
        return storage.store(file);
    }

    @PostMapping(value = "/assignments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> submitAssignment(@RequestPart("meta") @Valid AssignmentMeta meta,
                                                @RequestPart("files") List<MultipartFile> files) throws IOException {
        List<StoredFile> stored = new ArrayList<>();
        for (MultipartFile f : files) stored.add(storage.store(f));
        return Map.of("title", meta.title(), "files", stored);
    }
}`,
        output: `curl -F "file=@notes.pdf" http://localhost:8080/api/files
{"key":"7f3c9a1e-5b2d-4c1a-9e8f-2a6b3c4d5e6f.pdf","originalName":"notes.pdf","size":184233,"contentType":"application/pdf"}

curl -F 'meta={"title":"JPA homework","courseId":3};type=application/json' \\
     -F "files=@a.pdf" -F "files=@b.png" http://localhost:8080/api/files/assignments
{"title":"JPA homework","files":[{...},{...}]}

curl -F "file=@virus.exe" ...   -> 400 File type not allowed: virus.exe
curl -F "file=@big-video.mp4" ... -> 413 Payload Too Large (MaxUploadSizeExceededException)`,
      },
      {
        caption: 'Downloading as attachment or inline preview',
        code: `@GetMapping("/{key}")
public ResponseEntity<Resource> download(@PathVariable String key,
                                         @RequestParam(defaultValue = "false") boolean inline) throws IOException {
    StoredFile meta = fileMetadataRepository.findByKey(key).orElseThrow();   // also check ownership here!
    Resource resource = storage.load(key);

    ContentDisposition disposition = (inline ? ContentDisposition.inline() : ContentDisposition.attachment())
        .filename(meta.originalName(), StandardCharsets.UTF_8)
        .build();

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(meta.contentType()))
        .contentLength(resource.contentLength())
        .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
        .body(resource);
}`,
        output: `GET /api/files/7f3c...pdf
Content-Type: application/pdf
Content-Length: 184233
Content-Disposition: attachment; filename="notes.pdf"

GET /api/files/7f3c...pdf?inline=true
Content-Disposition: inline; filename="notes.pdf"   (browser opens the PDF viewer)`,
      },
      {
        caption: 'Streaming a large CSV export',
        code: `@GetMapping("/api/reports/orders.csv")
public ResponseEntity<StreamingResponseBody> exportOrders() {
    StreamingResponseBody body = out -> {
        try (Writer w = new OutputStreamWriter(out, StandardCharsets.UTF_8);
             Stream<OrderRow> rows = orderRepository.streamAllForExport()) {   // @QueryHints fetch size
            w.write("id,customer,total,created_at\\n");
            rows.forEach(r -> {
                try {
                    w.write(r.id() + "," + r.customer() + "," + r.total() + "," + r.createdAt() + "\\n");
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            });
        }
    };
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\\"orders.csv\\"")
        .contentType(new MediaType("text", "csv"))
        .body(body);
}`,
        output: `curl -O http://localhost:8080/api/reports/orders.csv
(1,000,000 rows streamed; heap usage stays flat instead of building a 200 MB string)`,
      },
    ],
    commonMistakes: [
      'Saving files using the client-supplied file name, enabling path traversal (../../) and overwriting other users\' files.',
      'Trusting the Content-Type header or extension alone to decide whether a file is safe.',
      'Storing uploads inside src/main/resources/static or another publicly served folder.',
      'Keeping files on local disk in a multi-instance or container deployment where the next request hits a different instance.',
      'Serving private files without checking that the current user may access them.',
    ],
    keyPoints: [
      'Receive files as MultipartFile via @RequestParam or @RequestPart; configure spring.servlet.multipart limits.',
      'Generate your own storage keys, allow-list extensions and verify content.',
      'Use object storage (S3, GCS, Azure Blob, MinIO) for scalable deployments and keep metadata in the database.',
      'Return ResponseEntity<Resource> with ContentDisposition attachment or inline for downloads.',
      'Use StreamingResponseBody for large generated exports.',
    ],
  },

  'api-versioning': {
    title: 'API Versioning',
    intro: `Once other teams, mobile apps or customers depend on your API, you cannot change it freely. Renaming a field or changing a response shape breaks clients that have not updated yet — and mobile apps may stay on old versions for months. <strong>API versioning</strong> lets you introduce breaking changes as a new version while old clients keep working.

Spring Framework 7 adds first-class API versioning to Spring MVC and WebFlux, and Spring Boot 4 configures it with <code>spring.mvc.apiversion.*</code> properties. This lesson compares versioning strategies, shows the new <code>version</code> attribute on mappings, and covers defaults, supported versions, deprecation and how to avoid versioning at all when possible.`,
    sections: [
      {
        heading: 'Avoid Breaking Changes First',
        body: `Many changes need no new version: adding optional request fields, adding response fields (clients should ignore unknown fields), adding new endpoints. Breaking changes are removing or renaming fields, changing types or meanings, and making optional input required. Evolve additively where you can, and version only when you must.`,
      },
      {
        heading: 'Versioning Strategies',
        body: `There are four common places to put the version:`,
        list: [
          '<strong>Path segment</strong> — <code>/api/v2/orders</code>. Most visible and cache-friendly; widely used for public APIs.',
          '<strong>Request header</strong> — <code>X-API-Version: 2</code>. Keeps URLs stable; common for internal APIs.',
          '<strong>Query parameter</strong> — <code>/api/orders?version=2</code>. Easy to try in a browser.',
          '<strong>Media type</strong> — <code>Accept: application/vnd.webnest.v2+json</code>. Most "RESTful", least convenient.',
        ],
      },
      {
        heading: 'Spring Framework 7 Versioned Mappings',
        body: `Mapping annotations now have a <code>version</code> attribute: <code>@GetMapping(path = "/orders/{id}", version = "2")</code>. A version like <code>"1.1+"</code> is a <strong>baseline</strong>: it matches 1.1 and any later version unless a more specific mapping exists, so you only write new methods for endpoints that actually changed. Spring resolves the version from the request (header, query parameter, path segment or media type parameter), parses it, validates it against the supported versions, and picks the best matching handler.`,
      },
      {
        heading: 'Configuration',
        body: `In Spring Boot 4, set the strategy with properties such as <code>spring.mvc.apiversion.use.header=X-API-Version</code> and a default with <code>spring.mvc.apiversion.default</code>. For path-segment versioning or combined strategies, implement <code>WebMvcConfigurer.configureApiVersioning(ApiVersionConfigurer)</code>. Requests with an unsupported version are rejected with 400.`,
      },
      {
        heading: 'Deprecating Old Versions',
        body: `Announce retirement dates. Spring can add standard <code>Deprecation</code>, <code>Sunset</code> and <code>Link</code> response headers for deprecated versions through an <code>ApiVersionDeprecationHandler</code>, so client developers see warnings in their logs long before a version is removed. Monitor usage per version and remove it only when traffic has gone.`,
      },
    ],
    examples: [
      {
        caption: 'Header-based versioning configured with properties',
        code: `# application.yml
spring:
  mvc:
    apiversion:
      use:
        header: X-API-Version
      default: 1.0

public record OrderV1(Long id, String customerName, double total) {}
public record OrderV2(Long id, CustomerRef customer, Money total, String status) {}

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping(path = "/{id}", version = "1.0")
    public OrderV1 getV1(@PathVariable Long id) {
        return new OrderV1(id, "Asha Rao", 1299.0);
    }

    @GetMapping(path = "/{id}", version = "2.0")
    public OrderV2 getV2(@PathVariable Long id) {
        return new OrderV2(id, new CustomerRef(7L, "Asha Rao"), new Money(new BigDecimal("1299.00"), "INR"), "PAID");
    }

    // Unchanged endpoint: one method serves 1.0 and every later version
    @GetMapping(version = "1.0+")
    public List<Long> list() {
        return List.of(41L, 42L);
    }
}`,
        output: `GET /api/orders/42                         -> {"id":42,"customerName":"Asha Rao","total":1299.0}   (default 1.0)
GET /api/orders/42  X-API-Version: 2.0     -> {"id":42,"customer":{"id":7,"name":"Asha Rao"},"total":{"amount":1299.00,"currency":"INR"},"status":"PAID"}
GET /api/orders     X-API-Version: 2.0     -> [41,42]   (baseline 1.0+ mapping)
GET /api/orders/42  X-API-Version: 9.0     -> 400 Bad Request (unsupported version)`,
      },
      {
        caption: 'Path-segment versioning configured in code',
        code: `@Configuration
public class ApiVersionConfig implements WebMvcConfigurer {

    @Override
    public void configureApiVersioning(ApiVersionConfigurer configurer) {
        configurer
            .usePathSegment(1)                    // /api/{version}/... -> segment index 1
            .addSupportedVersions("1", "2")
            .setDefaultVersion("1");
    }
}

@RestController
@RequestMapping("/api/{version}/courses")
public class CourseController {

    @GetMapping(version = "1")
    public List<String> v1() {
        return List.of("Java Core", "Spring Boot");
    }

    @GetMapping(version = "2")
    public List<Map<String, Object>> v2() {
        return List.of(Map.of("title", "Java Core", "lessons", 60),
                       Map.of("title", "Spring Boot", "lessons", 100));
    }
}`,
        output: `GET /api/v1/courses -> ["Java Core","Spring Boot"]
GET /api/v2/courses -> [{"title":"Java Core","lessons":60},{"title":"Spring Boot","lessons":100}]`,
      },
      {
        caption: 'Calling a versioned API from RestClient',
        code: `RestClient client = RestClient.builder()
    .baseUrl("https://api.webnest.in")
    .apiVersionInserter(ApiVersionInserter.useHeader("X-API-Version"))
    .build();

OrderV2 order = client.get()
    .uri("/api/orders/{id}", 42)
    .apiVersion("2.0")
    .retrieve()
    .body(OrderV2.class);`,
        output: `GET https://api.webnest.in/api/orders/42
X-API-Version: 2.0`,
      },
    ],
    commonMistakes: [
      'Creating a new version for additive, non-breaking changes, multiplying code to maintain.',
      'Copying every controller for v2 instead of using baseline versions ("1.0+") for unchanged endpoints.',
      'Removing old versions without announcing deprecation or checking whether clients still use them.',
      'Mixing several versioning strategies inconsistently across services in the same organisation.',
      'Versioning internal service-layer classes as well — keep versions at the API edge and map to one domain model.',
    ],
    keyPoints: [
      'Prefer additive, backward-compatible changes; version only for breaking changes.',
      'Spring Framework 7 adds a version attribute to request mappings; "1.1+" means that version and later.',
      'Spring Boot 4 configures versioning with spring.mvc.apiversion.* (header, default version, and more).',
      'Use configureApiVersioning for path-segment or combined strategies and supported versions.',
      'Signal deprecation with Deprecation/Sunset headers and monitor usage before removal.',
    ],
  },

  'filters-and-interceptors': {
    title: 'Filters and Interceptors',
    intro: `Some logic applies to many requests: assigning a correlation id, logging request timing, checking an API key, adding response headers, rate limiting, or recording which tenant a request belongs to. Copying that code into every controller is error-prone. Spring Boot gives you two interception points for cross-cutting web concerns.

<strong>Servlet filters</strong> wrap every request at the servlet container level, before Spring MVC even picks a controller. <strong>HandlerInterceptors</strong> run inside Spring MVC, around a specific handler method, with knowledge of which controller was chosen. This lesson explains the difference, shows how to write and register both, how to order them, and how they relate to Spring Security's filter chain.`,
    sections: [
      {
        heading: 'Filters: The Outer Layer',
        body: `A filter implements <code>jakarta.servlet.Filter</code>, or more conveniently extends Spring's <code>OncePerRequestFilter</code>, which guarantees a single execution per request even with forwards and error dispatches. Filters see the raw request and response and can wrap or replace them, short-circuit the request, or run code after the rest of the chain completes. Declaring a filter as a <code>@Component</code> registers it for all URLs; use a <code>FilterRegistrationBean</code> to set URL patterns and order explicitly.`,
      },
      {
        heading: 'Interceptors: Inside Spring MVC',
        body: `A <code>HandlerInterceptor</code> has three callbacks: <code>preHandle</code> (before the controller; return false to stop), <code>postHandle</code> (after the controller, before view rendering) and <code>afterCompletion</code> (always, even after exceptions). Because it receives the chosen handler, it can read annotations on the controller method — perfect for custom annotations like <code>@RateLimited</code> or <code>@AuditAction</code>. Register interceptors in a <code>WebMvcConfigurer</code> with path patterns.`,
      },
      {
        heading: 'Choosing Between Them',
        body: `Use a <strong>filter</strong> for concerns that apply to every request regardless of framework — correlation ids, request logging, compression, CORS, security. Use an <strong>interceptor</strong> for concerns that depend on the matched handler or on MVC features — per-endpoint annotations, adding model attributes, controller-specific timing. For logic around your own beans rather than HTTP, use AOP.`,
      },
      {
        heading: 'Order and Spring Security',
        body: `Filters run in order of their <code>@Order</code> or registration order. Spring Security's chain is itself one filter with order <code>-100</code> by default (<code>SecurityProperties.DEFAULT_FILTER_ORDER</code>). A filter that must run before security — such as a correlation-id filter whose id should appear in security logs — needs a lower order value. A filter that needs the authenticated user must run after security, or be added into the security chain with <code>http.addFilterAfter(...)</code>.`,
      },
    ],
    examples: [
      {
        caption: 'A correlation-id filter that also feeds the logs (MDC)',
        code: `@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Correlation-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String id = Optional.ofNullable(request.getHeader(HEADER))
            .filter(h -> h.matches("[A-Za-z0-9-]{8,64}"))       // don't trust arbitrary input
            .orElse(UUID.randomUUID().toString());
        MDC.put("correlationId", id);
        response.setHeader(HEADER, id);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");   // threads are reused by the pool
        }
    }
}

# application.yml — include the id in every log line
logging:
  pattern:
    correlation: "[%X{correlationId:-}] "`,
        output: `curl -i http://localhost:8080/api/orders
X-Correlation-Id: 3b1f6c2e-8d7a-4f0e-9b5c-1a2d3e4f5a6b

2026-09-27T10:15:02 INFO [3b1f6c2e-8d7a-4f0e-9b5c-1a2d3e4f5a6b] OrderService : Listing orders for asha`,
      },
      {
        caption: 'Registering a filter for specific URLs with FilterRegistrationBean',
        code: `public class ApiKeyFilter extends OncePerRequestFilter {

    private final Set<String> validKeys;

    public ApiKeyFilter(Set<String> validKeys) {
        this.validKeys = validKeys;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String key = req.getHeader("X-API-Key");
        if (key == null || !validKeys.contains(key)) {
            res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid API key");
            return;                               // short-circuit: controller never runs
        }
        chain.doFilter(req, res);
    }
}

@Configuration
public class FilterConfig {

    @Bean
    FilterRegistrationBean<ApiKeyFilter> apiKeyFilter(@Value("\${partner.api-keys}") Set<String> keys) {
        FilterRegistrationBean<ApiKeyFilter> reg = new FilterRegistrationBean<>(new ApiKeyFilter(keys));
        reg.addUrlPatterns("/partner/*");
        reg.setOrder(1);
        return reg;
    }
}`,
        output: `GET /partner/catalog                          -> 401 Missing or invalid API key
GET /partner/catalog  X-API-Key: pk_live_123   -> 200 OK
GET /api/courses                               -> 200 OK (filter not applied)`,
      },
      {
        caption: 'An interceptor driven by a custom annotation',
        code: `@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Timed {
    long warnAboveMs() default 500;
}

@Component
public class TimingInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(TimingInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        req.setAttribute("startNanos", System.nanoTime());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
                                Object handler, Exception ex) {
        if (handler instanceof HandlerMethod hm && hm.hasMethodAnnotation(Timed.class)) {
            long ms = (System.nanoTime() - (long) req.getAttribute("startNanos")) / 1_000_000;
            Timed timed = hm.getMethodAnnotation(Timed.class);
            if (ms > timed.warnAboveMs()) {
                log.warn("Slow endpoint {}#{} took {} ms (status {})",
                    hm.getBeanType().getSimpleName(), hm.getMethod().getName(), ms, res.getStatus());
            }
        }
    }
}

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final TimingInterceptor timing;

    public WebConfig(TimingInterceptor timing) {
        this.timing = timing;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(timing).addPathPatterns("/api/**").excludePathPatterns("/api/health");
    }
}

@GetMapping("/api/reports/sales")
@Timed(warnAboveMs = 200)
public SalesReport sales() { return reportService.build(); }`,
        output: `WARN  TimingInterceptor : Slow endpoint ReportController#sales took 734 ms (status 200)`,
      },
    ],
    commonMistakes: [
      'Annotating a filter with @Component AND adding it to the Spring Security chain, so it runs twice.',
      'Forgetting to call chain.doFilter(), so every request hangs or returns an empty response.',
      'Not clearing MDC or ThreadLocal values in a finally block, leaking data into the next request on the same thread.',
      'Reading the request body in a filter without wrapping it (ContentCachingRequestWrapper), leaving the controller with an empty body.',
      'Putting authentication logic in a custom interceptor instead of using Spring Security.',
    ],
    keyPoints: [
      'Filters wrap every request at the servlet level; extend OncePerRequestFilter.',
      'Interceptors run inside Spring MVC with access to the selected handler and its annotations.',
      'Use FilterRegistrationBean for URL patterns and ordering; InterceptorRegistry for interceptor paths.',
      'Spring Security\'s filter chain runs at order -100; order your filters relative to it deliberately.',
      'Always clean up thread-bound state (MDC, ThreadLocal) in finally blocks.',
    ],
  },

  'server-side-rendering-with-thymeleaf': {
    title: 'Server-Side Rendering with Thymeleaf',
    intro: `Not every Spring Boot application is a JSON API behind a React front end. Admin panels, internal tools, dashboards, email templates and content sites are often faster to build — and better for SEO — as server-rendered HTML. <strong>Thymeleaf</strong> is the template engine Spring Boot supports best: its templates are valid HTML files that designers can open in a browser, enriched with <code>th:*</code> attributes.

This lesson builds a small course catalogue with Spring MVC and Thymeleaf: controllers returning views, expressions, loops and conditionals, reusable layout fragments, forms with validation errors, Spring Security integration, and the Post/Redirect/Get pattern.`,
    sections: [
      {
        heading: 'Setup and Conventions',
        body: `Add <code>spring-boot-starter-thymeleaf</code> alongside <code>spring-boot-starter-webmvc</code>. Templates live in <code>src/main/resources/templates</code> with the <code>.html</code> suffix; static files (CSS, JS, images) go in <code>src/main/resources/static</code>. A <code>@Controller</code> (not <code>@RestController</code>) method returns a view name such as <code>"courses/list"</code>, which resolves to <code>templates/courses/list.html</code>. Data passed through the <code>Model</code> is available in the template.`,
      },
      {
        heading: 'Expression Syntax',
        body: `The main expression types are:`,
        list: [
          '<code>${...}</code> — variable expressions: <code>${course.title}</code>.',
          '<code>*{...}</code> — selection expressions on the object chosen with <code>th:object</code>, used in forms.',
          '<code>@{...}</code> — link URLs with parameters: <code>@{/courses/{slug}(slug=${c.slug})}</code>.',
          '<code>#{...}</code> — messages from <code>messages.properties</code> for internationalisation.',
          '<code>~{...}</code> — fragment references for layouts.',
          'Attributes: <code>th:text</code> (escaped), <code>th:each</code>, <code>th:if</code>/<code>th:unless</code>, <code>th:href</code>, <code>th:field</code>, <code>th:classappend</code>, <code>th:replace</code>.',
        ],
      },
      {
        heading: 'Forms and Validation',
        body: `Bind a form to a backing object with <code>th:object</code> and <code>th:field</code>. In the controller, accept <code>@Valid @ModelAttribute</code> followed immediately by a <code>BindingResult</code>; if it has errors, return the form view again and Thymeleaf shows messages with <code>th:errors</code>. On success, <strong>redirect</strong> (Post/Redirect/Get) so refreshing the page does not resubmit the form, and use <code>RedirectAttributes</code> flash attributes for success messages.`,
      },
      {
        heading: 'Security and Escaping',
        body: `<code>th:text</code> escapes HTML, protecting you from XSS; <code>th:utext</code> does not and must never be used with user input. Forms rendered with <code>th:action</code> automatically include Spring Security's CSRF token. The <code>thymeleaf-extras-springsecurity6</code> dialect adds <code>sec:authorize</code> and <code>sec:authentication</code> to show content based on roles.`,
      },
      {
        heading: 'Development Tips',
        body: `Templates are cached in production. With Spring Boot DevTools, caching is disabled automatically, so changes appear on browser refresh. Keep templates simple: prepare data in the controller or a view model record rather than calling services from templates.`,
      },
    ],
    examples: [
      {
        caption: 'Controller returning views with model data',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>

@Controller
@RequestMapping("/courses")
public class CoursePageController {

    private final CourseService courses;

    public CoursePageController(CourseService courses) {
        this.courses = courses;
    }

    @GetMapping
    public String list(@RequestParam(required = false) String level, Model model) {
        model.addAttribute("courses", courses.findAll(level));
        model.addAttribute("level", level);
        return "courses/list";               // -> templates/courses/list.html
    }

    @GetMapping("/{slug}")
    public String detail(@PathVariable String slug, Model model) {
        model.addAttribute("course", courses.findBySlug(slug));
        return "courses/detail";
    }
}`,
        output: '(GET /courses renders templates/courses/list.html with the "courses" and "level" model attributes.)',
      },
      {
        caption: 'A template with layout fragment, loop, conditionals and links',
        code: `<!-- templates/fragments/layout.html -->
<header th:fragment="header">
    <a th:href="@{/}">Webnest Studio</a>
    <span sec:authorize="isAuthenticated()">Hi, <b sec:authentication="name">user</b></span>
    <a sec:authorize="hasRole('ADMIN')" th:href="@{/admin/courses/new}">New course</a>
</header>

<!-- templates/courses/list.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
<head>
    <title>Courses</title>
    <link rel="stylesheet" th:href="@{/css/site.css}">
</head>
<body>
<div th:replace="~{fragments/layout :: header}"></div>

<h1 th:text="\${level} ? 'Courses for ' + \${level} : 'All courses'">All courses</h1>

<p th:if="\${#lists.isEmpty(courses)}">No courses found.</p>

<ul>
    <li th:each="c, stat : \${courses}" th:classappend="\${stat.odd} ? 'odd'">
        <a th:href="@{/courses/{slug}(slug=\${c.slug})}" th:text="\${c.title}">Course title</a>
        <span th:text="|\${c.lessons} lessons · \${c.level}|">10 lessons</span>
        <strong th:unless="\${c.free}" th:text="\${#numbers.formatDecimal(c.price, 1, 2)}">0.00</strong>
    </li>
</ul>
</body>
</html>`,
        output: `<h1>All courses</h1>
<ul>
    <li class="odd"><a href="/courses/java-core">Java - Core</a> <span>60 lessons · BEGINNER</span> <strong>1499.00</strong></li>
    <li><a href="/courses/spring-boot">Spring Boot</a> <span>100 lessons · INTERMEDIATE</span> <strong>2999.00</strong></li>
</ul>`,
      },
      {
        caption: 'Form with validation errors and Post/Redirect/Get',
        code: `public class CourseForm {
    @NotBlank private String title;
    @Pattern(regexp = "[a-z0-9-]+", message = "lowercase letters, digits and dashes only")
    private String slug;
    @DecimalMin("0.0") private BigDecimal price;
    // getters and setters (Thymeleaf binds through JavaBean properties)
}

@Controller
@RequestMapping("/admin/courses")
public class AdminCourseController {

    @GetMapping("/new")
    public String form(Model model) {
        model.addAttribute("courseForm", new CourseForm());
        return "admin/course-form";
    }

    @PostMapping
    public String create(@Valid @ModelAttribute CourseForm courseForm, BindingResult errors,
                         RedirectAttributes redirect) {
        if (errors.hasErrors()) {
            return "admin/course-form";            // show the form again with messages
        }
        courseService.create(courseForm);
        redirect.addFlashAttribute("message", "Course created");
        return "redirect:/courses";                // PRG: a refresh won't resubmit
    }
}

<!-- templates/admin/course-form.html -->
<form th:action="@{/admin/courses}" th:object="\${courseForm}" method="post">
    <label>Title <input th:field="*{title}"></label>
    <p class="error" th:if="\${#fields.hasErrors('title')}" th:errors="*{title}"></p>

    <label>Slug <input th:field="*{slug}"></label>
    <p class="error" th:errors="*{slug}"></p>

    <label>Price <input th:field="*{price}" type="number" step="0.01"></label>
    <button type="submit">Save</button>
</form>`,
        output: `POST /admin/courses  title="" slug="Spring Boot!"
-> form re-rendered:
   <p class="error">must not be blank</p>
   <p class="error">lowercase letters, digits and dashes only</p>

POST /admin/courses  title="Spring AI" slug="spring-ai" price=2999
-> 302 /courses, flash message "Course created"`,
      },
    ],
    commonMistakes: [
      'Using @RestController for page controllers, so the view name is returned as plain text instead of rendering the template.',
      'Placing BindingResult anywhere other than directly after the @Valid parameter, causing a 400 error instead of showing the form.',
      'Using th:utext with user-supplied content, creating XSS vulnerabilities.',
      'Returning a view after a successful POST instead of redirecting, so browser refresh submits the form again.',
      'Calling repositories or services from templates instead of preparing data in the controller.',
    ],
    keyPoints: [
      'spring-boot-starter-thymeleaf renders templates from src/main/resources/templates.',
      '@Controller methods return view names; Model attributes are available as ${...} in templates.',
      'th:object/th:field bind forms; @Valid + BindingResult + th:errors display validation messages.',
      'Use Post/Redirect/Get with flash attributes after successful form submissions.',
      'th:text escapes output; forms get CSRF tokens automatically; sec:authorize shows role-based content.',
    ],
  },

  'restclient': {
    title: 'Calling REST APIs with RestClient',
    intro: `Modern applications constantly call other services: payment gateways, email providers, weather APIs, and your own microservices. Spring's <code>RestClient</code>, introduced in Spring Framework 6.1, is the recommended synchronous HTTP client for Spring MVC applications. It has a fluent API similar to WebClient but blocking, which pairs perfectly with virtual threads.

This lesson covers creating RestClient instances with Spring Boot's auto-configured builder, GET/POST/PUT/DELETE requests, path and query parameters, headers and authentication, reading responses and status codes, error handling, timeouts, logging interceptors, SSRF protection, and testing with <code>MockRestServiceServer</code>.`,
    sections: [
      {
        heading: 'RestClient vs RestTemplate vs WebClient',
        body: `<code>RestTemplate</code> is the classic client; it still works but is in maintenance mode and its many overloaded methods are awkward. <code>WebClient</code> is the reactive, non-blocking client for WebFlux applications. <code>RestClient</code> is the modern choice for everything else. It shares message converters and interceptors with the rest of Spring MVC and can be created from an existing RestTemplate configuration during migration.`,
      },
      {
        heading: 'The Auto-Configured Builder',
        body: `In Spring Boot 4, HTTP client support has its own starter: add <code>spring-boot-starter-restclient</code> (the web starter alone no longer brings it). Spring Boot then provides a prototype <code>RestClient.Builder</code> bean already configured with the application's JSON mapper, HTTP client settings and any <code>RestClientCustomizer</code> beans. Inject the builder, set a base URL and default headers, and build one RestClient per remote service. Global timeouts and redirects are configured with <code>spring.http.clients.*</code> properties.`,
      },
      {
        heading: 'Making Requests',
        body: `The chain is: method (<code>get()</code>, <code>post()</code>...) → <code>uri(...)</code> with templates and variables → optional <code>headers</code>, <code>contentType</code>, <code>body</code> → <code>retrieve()</code> → <code>body(Type.class)</code>, <code>toEntity(Type.class)</code> (with status and headers) or <code>toBodilessEntity()</code>. For generic types such as lists use <code>ParameterizedTypeReference</code>. <code>exchange(...)</code> gives full manual control over the response.`,
      },
      {
        heading: 'Error Handling',
        body: `By default <code>retrieve()</code> throws <code>HttpClientErrorException</code> for 4xx and <code>HttpServerErrorException</code> for 5xx responses. Use <code>onStatus(predicate, handler)</code> to translate specific statuses into your own exceptions — for example 404 into <code>Optional.empty()</code> or a <code>ProductNotFoundException</code>. Network failures and timeouts throw <code>ResourceAccessException</code>. Combine with retries (see the resilience lesson) for transient failures.`,
      },
      {
        heading: 'Timeouts and Security',
        body: `Always set connect and read timeouts; without them, a hung remote service can block your threads indefinitely. When URLs come from users (webhooks, link previews), protect against SSRF with Spring Boot 4.1's <code>InetAddressFilter</code>, which blocks requests to internal network addresses.`,
      },
    ],
    examples: [
      {
        caption: 'A client for an external API built from the auto-configured builder',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-restclient</artifactId>   <!-- new in Spring Boot 4 -->
</dependency>

# application.yml
spring:
  http:
    clients:
      connect-timeout: 2s
      read-timeout: 5s
github:
  base-url: https://api.github.com
  token: \${GITHUB_TOKEN}

public record GithubRepo(String name, @JsonProperty("stargazers_count") int stars, String language) {}

@Component
public class GithubClient {

    private final RestClient client;

    public GithubClient(RestClient.Builder builder,
                        @Value("\${github.base-url}") String baseUrl,
                        @Value("\${github.token}") String token) {
        this.client = builder
            .baseUrl(baseUrl)
            .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token)
            .build();
    }

    public List<GithubRepo> reposOf(String org) {
        return client.get()
            .uri(uri -> uri.path("/orgs/{org}/repos")
                .queryParam("sort", "updated")
                .queryParam("per_page", 5)
                .build(org))
            .retrieve()
            .body(new ParameterizedTypeReference<>() {});
    }
}`,
        output: `githubClient.reposOf("spring-projects")
[GithubRepo[name=spring-boot, stars=77000, language=Java],
 GithubRepo[name=spring-framework, stars=58000, language=Java], ...]`,
      },
      {
        caption: 'POST, PUT, DELETE and reading status and headers',
        code: `public record CreatePaymentRequest(long amountPaise, String currency, String orderRef) {}
public record Payment(String id, String status) {}

public Payment createPayment(CreatePaymentRequest req, String idempotencyKey) {
    ResponseEntity<Payment> response = client.post()
        .uri("/v1/payments")
        .contentType(MediaType.APPLICATION_JSON)
        .header("Idempotency-Key", idempotencyKey)
        .body(req)
        .retrieve()
        .toEntity(Payment.class);

    log.info("status={} location={}", response.getStatusCode(), response.getHeaders().getLocation());
    return response.getBody();
}

public void updateMetadata(String paymentId, Map<String, String> metadata) {
    client.put().uri("/v1/payments/{id}/metadata", paymentId)
        .body(metadata)
        .retrieve()
        .toBodilessEntity();
}

public void cancel(String paymentId) {
    client.delete().uri("/v1/payments/{id}", paymentId).retrieve().toBodilessEntity();
}`,
        output: `status=201 CREATED location=https://pay.example.com/v1/payments/pay_91x
Payment[id=pay_91x, status=CREATED]`,
      },
      {
        caption: 'Translating error statuses into domain results',
        code: `public Optional<Product> findProduct(long id) {
    try {
        return Optional.ofNullable(client.get()
            .uri("/products/{id}", id)
            .retrieve()
            .onStatus(status -> status.value() == 404, (request, response) -> {
                throw new ProductNotFoundException(id);
            })
            .onStatus(HttpStatusCode::is5xxServerError, (request, response) -> {
                throw new CatalogUnavailableException("Catalog returned " + response.getStatusCode());
            })
            .body(Product.class));
    } catch (ProductNotFoundException e) {
        return Optional.empty();
    } catch (ResourceAccessException e) {       // connection refused, timeout
        throw new CatalogUnavailableException("Catalog unreachable", e);
    }
}`,
        output: `findProduct(1)   -> Optional[Product[id=1, name=Hoodie]]
findProduct(999) -> Optional.empty
(catalog down)   -> CatalogUnavailableException: Catalog unreachable`,
      },
      {
        caption: 'A logging interceptor applied to all RestClients',
        code: `@Bean
RestClientCustomizer loggingCustomizer() {
    return builder -> builder.requestInterceptor((request, body, execution) -> {
        long start = System.nanoTime();
        ClientHttpResponse response = execution.execute(request, body);
        log.info("HTTP {} {} -> {} in {} ms", request.getMethod(), request.getURI(),
            response.getStatusCode().value(), (System.nanoTime() - start) / 1_000_000);
        return response;
    });
}`,
        output: `INFO  HTTP GET https://api.github.com/orgs/spring-projects/repos?sort=updated&per_page=5 -> 200 in 312 ms`,
      },
      {
        caption: 'Testing a client with MockRestServiceServer',
        code: `// test dependency: spring-boot-starter-restclient-test
@RestClientTest(GithubClient.class)
@TestPropertySource(properties = {"github.base-url=https://api.github.com", "github.token=test"})
class GithubClientTest {

    @Autowired GithubClient client;
    @Autowired MockRestServiceServer server;

    @Test
    void parsesRepositories() {
        server.expect(requestTo("https://api.github.com/orgs/webnest/repos?sort=updated&per_page=5"))
              .andExpect(header("Authorization", "Bearer test"))
              .andRespond(withSuccess("""
                  [{"name":"shop","stargazers_count":12,"language":"Java"}]
                  """, MediaType.APPLICATION_JSON));

        assertThat(client.reposOf("webnest"))
            .containsExactly(new GithubRepo("shop", 12, "Java"));
    }
}`,
        output: `GithubClientTest > parsesRepositories() PASSED (no real network call)`,
      },
    ],
    commonMistakes: [
      'Expecting RestClient.Builder to be injectable in Spring Boot 4 with only spring-boot-starter-webmvc; add spring-boot-starter-restclient.',
      'Creating RestClient.create() everywhere instead of using the auto-configured builder, losing shared JSON settings and customizers.',
      'Not setting connect and read timeouts, so a slow partner API exhausts your request threads.',
      'Building URLs by string concatenation with user input instead of URI templates, breaking encoding and enabling injection.',
      'Catching every exception and returning null, hiding outages from monitoring.',
      'Calling URLs supplied by users without SSRF protection.',
    ],
    keyPoints: [
      'RestClient is the modern synchronous HTTP client for Spring MVC applications.',
      'Inject the auto-configured RestClient.Builder and configure one client per remote service.',
      'retrieve().body(), toEntity() and toBodilessEntity() cover most response needs.',
      'Use onStatus to map HTTP errors to domain exceptions; set timeouts via spring.http.clients.*.',
      'Test clients with @RestClientTest and MockRestServiceServer.',
    ],
  },

  'http-service-clients-with-httpexchange': {
    title: 'HTTP Service Clients with @HttpExchange',
    intro: `Writing RestClient calls by hand for every endpoint of a remote API is repetitive. Spring's <strong>HTTP interface clients</strong> let you declare a Java interface with annotated methods — much like a Spring Data repository or Feign client — and Spring generates the implementation that makes the HTTP calls.

Spring Framework 7 and Spring Boot 4 make this a first-class feature: <code>@ImportHttpServices</code> registers interface clients as beans, groups them, and configures base URLs and timeouts from <code>spring.http.serviceclient.*</code> properties. This lesson builds typed clients for internal and external services, configures groups, adds authentication, and handles errors.`,
    sections: [
      {
        heading: 'Declaring an HTTP Interface',
        body: `Annotate an interface (or its methods) with <code>@HttpExchange</code> and methods with <code>@GetExchange</code>, <code>@PostExchange</code>, <code>@PutExchange</code>, <code>@PatchExchange</code> or <code>@DeleteExchange</code>. Method parameters use the same annotations you know from controllers: <code>@PathVariable</code>, <code>@RequestParam</code>, <code>@RequestHeader</code>, <code>@RequestBody</code>. Return types can be the body type, <code>ResponseEntity&lt;T&gt;</code>, <code>void</code>, or <code>Optional</code>-style wrappers via the adapter.`,
      },
      {
        heading: 'Registering Clients with @ImportHttpServices',
        body: `HTTP service clients are part of <code>spring-boot-starter-restclient</code> (or <code>spring-boot-starter-webclient</code> for reactive clients). <code>@ImportHttpServices(group = "catalog", types = CatalogClient.class)</code> (or <code>basePackages = ...</code>) creates a proxy bean for each interface, backed by a RestClient. Clients in the same <strong>group</strong> share configuration: <code>spring.http.serviceclient.catalog.base-url</code>, <code>connect-timeout</code>, <code>read-timeout</code> and default headers. You no longer need to write <code>HttpServiceProxyFactory</code> boilerplate for each client.`,
      },
      {
        heading: 'Customising Groups',
        body: `For authentication, interceptors or custom error handling per group, declare a <code>RestClientHttpServiceGroupConfigurer</code> bean. It receives every group and its RestClient builder, so you can add a bearer token interceptor to the "payments" group only, or an OAuth2 client credentials interceptor to all internal services.`,
      },
      {
        heading: 'Compared with OpenFeign',
        body: `Spring Cloud OpenFeign offered the same declarative style for years. HTTP interface clients are built into Spring Framework itself, use RestClient or WebClient underneath, work with virtual threads and reactive types, and need no extra dependency. For new code, prefer HTTP interface clients; Spring Cloud OpenFeign is in maintenance mode.`,
      },
    ],
    examples: [
      {
        caption: 'Declaring a typed client for a catalogue service',
        code: `public record Product(Long id, String name, BigDecimal price, int stock) {}
public record NewProduct(String name, BigDecimal price) {}

@HttpExchange("/api/products")
public interface CatalogClient {

    @GetExchange
    List<Product> list(@RequestParam(required = false) String category,
                       @RequestParam(defaultValue = "0") int page);

    @GetExchange("/{id}")
    Product get(@PathVariable long id);

    @PostExchange
    ResponseEntity<Product> create(@RequestBody NewProduct product);

    @PatchExchange("/{id}/stock")
    void adjustStock(@PathVariable long id, @RequestParam int delta,
                     @RequestHeader("X-Request-Id") String requestId);

    @DeleteExchange("/{id}")
    void delete(@PathVariable long id);
}`,
        output: '(No implementation class — Spring generates a proxy that turns each call into an HTTP request.)',
      },
      {
        caption: 'Registering groups and configuring them with properties',
        code: `@SpringBootApplication
@ImportHttpServices(group = "catalog", types = CatalogClient.class)
@ImportHttpServices(group = "payments", basePackages = "com.webnest.shop.clients.payments")
public class ShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}

# application.yml
spring:
  http:
    serviceclient:
      catalog:
        base-url: http://catalog-service:8081
        connect-timeout: 1s
        read-timeout: 3s
      payments:
        base-url: https://api.payments.example.com
        read-timeout: 10s`,
        output: `Registered HTTP service client beans: catalogClient (group catalog), paymentGatewayClient (group payments)`,
      },
      {
        caption: 'Using the client like any other bean',
        code: `@Service
public class CartService {

    private final CatalogClient catalog;

    public CartService(CatalogClient catalog) {
        this.catalog = catalog;
    }

    public CartLine addToCart(long productId, int qty) {
        Product p = catalog.get(productId);
        if (p.stock() < qty) {
            throw new OutOfStockException(p.name());
        }
        catalog.adjustStock(productId, -qty, UUID.randomUUID().toString());
        return new CartLine(p.id(), p.name(), qty, p.price());
    }
}`,
        output: `GET   http://catalog-service:8081/api/products/5
PATCH http://catalog-service:8081/api/products/5/stock?delta=-2   X-Request-Id: 0c9e...
CartLine[productId=5, name=Hoodie, quantity=2, unitPrice=1299.00]`,
      },
      {
        caption: 'Adding authentication and error handling to one group',
        code: `@Configuration(proxyBeanMethods = false)
public class HttpServiceGroupsConfig {

    @Bean
    RestClientHttpServiceGroupConfigurer groupConfigurer(@Value("\${payments.api-key}") String apiKey) {
        return groups -> groups
            .filterByName("payments")
            .forEachClient((group, builder) -> builder
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultStatusHandler(HttpStatusCode::is4xxClientError, (request, response) -> {
                    throw new PaymentRejectedException("Payment API returned " + response.getStatusCode());
                }));
    }
}`,
        output: `Calls through payment clients carry "Authorization: Bearer ..." and 4xx responses become PaymentRejectedException.
Catalog clients are unaffected.`,
      },
    ],
    commonMistakes: [
      'Hard-coding absolute URLs in @HttpExchange instead of configuring base-url per group, making environments hard to switch.',
      'Forgetting @ImportHttpServices, then getting "No qualifying bean of type CatalogClient".',
      'Sharing one group for services with very different timeout and auth requirements.',
      'Adding Spring Cloud OpenFeign to new projects when built-in HTTP interface clients cover the same need.',
      'Letting generic HttpClientErrorException leak into business code instead of mapping statuses to domain exceptions.',
    ],
    keyPoints: [
      'Declare remote APIs as interfaces with @HttpExchange and @GetExchange/@PostExchange/etc.',
      '@ImportHttpServices registers client beans, organised into groups.',
      'Configure base URLs and timeouts per group with spring.http.serviceclient.<group>.*.',
      'RestClientHttpServiceGroupConfigurer adds auth headers, interceptors and status handlers per group.',
      'Built-in HTTP interface clients are the modern replacement for OpenFeign.',
    ],
  },
}
