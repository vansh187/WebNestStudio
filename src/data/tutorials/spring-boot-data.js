// Spring Boot course — data access series (Spring Boot 4, Spring Data 2025.1,
// Hibernate 7). Keys are slugs matching the topics listed under the data
// module in codelabDefaults.js.
export const springBootData = {
  'connecting-to-postgresql-and-mysql': {
    title: 'Connecting Spring Boot to PostgreSQL and MySQL',
    intro: `The H2 in-memory database is great for your first experiments, but real applications run on a production database such as PostgreSQL or MySQL. Spring Boot makes the switch mostly a matter of adding a JDBC driver and three properties — but a production-ready setup also needs a tuned connection pool, a sensible schema strategy, profiles per environment, and a way to run the database locally.

This lesson walks through connecting to PostgreSQL and MySQL, how Spring Boot builds the <code>DataSource</code> and HikariCP pool, which <code>spring.jpa</code> settings matter, why <code>ddl-auto=update</code> does not belong in production, and how Docker Compose support starts your database automatically in development.`,
    sections: [
      {
        heading: 'What Spring Boot Auto-Configures',
        body: `With <code>spring-boot-starter-data-jpa</code> (or <code>spring-boot-starter-jdbc</code>) and a JDBC driver on the classpath, Spring Boot creates a <code>DataSource</code> backed by <strong>HikariCP</strong>, the fastest and default connection pool, using the <code>spring.datasource.*</code> properties. With JPA it also creates the <code>EntityManagerFactory</code>, a <code>JpaTransactionManager</code>, and enables Spring Data repositories. Boot usually infers the driver class from the URL, so you rarely set <code>driver-class-name</code>.`,
      },
      {
        heading: 'Connection Pool Tuning',
        body: `Opening a database connection is expensive, so the pool keeps a set of open connections and lends them to requests. The most important settings are <code>maximum-pool-size</code> (default 10), <code>minimum-idle</code>, <code>connection-timeout</code> (how long a request waits for a free connection) and <code>max-lifetime</code> (should be shorter than the database's own idle timeout). A bigger pool is not automatically faster: a database with 8 CPU cores rarely benefits from more than ~20 active connections, and every application instance brings its own pool.`,
      },
      {
        heading: 'Schema Management: ddl-auto',
        body: `<code>spring.jpa.hibernate.ddl-auto</code> tells Hibernate whether to touch the schema: <code>create-drop</code> (default for embedded databases), <code>create</code>, <code>update</code>, <code>validate</code> or <code>none</code>. <code>update</code> is convenient while prototyping but dangerous in production — it never drops or renames columns, cannot migrate data, and makes changes nobody reviewed. In production use <code>validate</code> or <code>none</code> and manage the schema with Flyway or Liquibase (see the migrations lesson).`,
      },
      {
        heading: 'Environment-Specific Configuration',
        body: `Keep local defaults in <code>application.yml</code>, override them per environment with profiles (<code>application-prod.yml</code>) or environment variables (<code>SPRING_DATASOURCE_URL</code>, <code>SPRING_DATASOURCE_PASSWORD</code>). Passwords never go into committed files.`,
      },
      {
        heading: 'Running the Database Locally with Docker Compose',
        body: `Add <code>spring-boot-docker-compose</code> and a <code>compose.yaml</code> file. When you start the application in development, Spring Boot runs <code>docker compose up</code>, waits for the database, and creates a <strong>service connection</strong> — the datasource URL, username and password are configured from the container automatically, so you need no <code>spring.datasource</code> properties locally at all.`,
      },
    ],
    examples: [
      {
        caption: 'PostgreSQL: dependencies and application.yml',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/webnest
    username: webnest
    password: \${DB_PASSWORD}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 5s
      max-lifetime: 30m
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    properties:
      hibernate:
        jdbc:
          batch_size: 50
        order_inserts: true`,
        output: `HikariPool-1 - Starting...
HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@5e3a8624
HikariPool-1 - Start completed.
Initialized JPA EntityManagerFactory for persistence unit 'default'`,
      },
      {
        caption: 'MySQL: the same application with a different driver and URL',
        code: `<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/webnest?serverTimezone=UTC
    username: webnest
    password: \${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate`,
        output: `HikariPool-1 - Added connection com.mysql.cj.jdbc.ConnectionImpl@2b6f7a3c
(Hibernate detects the MySQL dialect automatically from the connection metadata.)`,
      },
      {
        caption: 'Docker Compose: start PostgreSQL automatically in development',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-docker-compose</artifactId>
    <optional>true</optional>
</dependency>

# compose.yaml (project root)
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: webnest
      POSTGRES_USER: webnest
      POSTGRES_PASSWORD: secret
    ports:
      - "5432"`,
        output: `Using Docker Compose file D:\\webnest-shop\\compose.yaml
Container webnest-shop-postgres-1  Started
(datasource configured from the running container — no spring.datasource properties needed locally)`,
      },
      {
        caption: 'Production overrides with a profile and environment variables',
        code: `# application-prod.yml
spring:
  datasource:
    url: \${DB_URL}
    username: \${DB_USER}
    password: \${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
  jpa:
    hibernate:
      ddl-auto: none
  docker:
    compose:
      enabled: false

# start command
java -jar shop.jar --spring.profiles.active=prod`,
        output: `The following 1 profile is active: "prod"
HikariPool-1 - Start completed.`,
      },
    ],
    commonMistakes: [
      'Using ddl-auto=update or create in production, which can silently drift or even drop the schema.',
      'Committing the database password in application.yml.',
      'Setting maximum-pool-size to 100+ "for performance", overwhelming the database when several instances start.',
      'Leaving spring.jpa.open-in-view enabled (the default), which keeps a connection-bound session open during view rendering and hides lazy-loading problems.',
      'Forgetting the JDBC driver dependency and getting "Failed to determine a suitable driver class".',
    ],
    keyPoints: [
      'A driver plus spring.datasource.url/username/password is enough for Spring Boot to build a HikariCP DataSource.',
      'Tune the pool conservatively; more connections is not automatically faster.',
      'Use ddl-auto=validate or none in production and manage schema changes with migrations.',
      'Profiles and environment variables separate local, test and production settings.',
      'spring-boot-docker-compose starts your database in development and wires the connection automatically.',
    ],
  },

  'entity-relationships-in-depth': {
    title: 'JPA Entity Relationships in Depth',
    intro: `Almost every domain model has relationships: a customer has orders, an order has line items, a student enrols in many courses and a course has many students. JPA lets you map these as object references, but the details — which side owns the foreign key, what cascades, what gets loaded when — decide whether your application is correct and fast or full of surprising bugs.

This lesson covers all four relationship types, owning and inverse sides, bidirectional helper methods, cascading and orphan removal, many-to-many with an explicit join entity, and how to implement <code>equals</code> and <code>hashCode</code> safely for entities.`,
    sections: [
      {
        heading: 'The Four Relationship Types',
        body: `JPA supports <code>@OneToOne</code>, <code>@OneToMany</code>, <code>@ManyToOne</code> and <code>@ManyToMany</code>. In a relational database, all of them are implemented with foreign keys, and many-to-many uses a join table. Model the relationship in the direction your code actually navigates; not every relationship needs to be bidirectional.`,
      },
      {
        heading: 'Owning Side and mappedBy',
        body: `In a bidirectional relationship, exactly one side <strong>owns</strong> the foreign key column — only changes to that side are written to the database. For one-to-many/many-to-one, the <code>@ManyToOne</code> side always owns it (it holds <code>@JoinColumn</code>). The other side declares <code>mappedBy</code> naming the owning field. If you only add an item to <code>order.getItems()</code> without setting <code>item.setOrder(order)</code>, nothing is saved. Helper methods such as <code>addItem()</code> keep both sides in sync.`,
      },
      {
        heading: 'Fetch Types',
        body: `<code>@ManyToOne</code> and <code>@OneToOne</code> default to <strong>EAGER</strong> fetching, which loads the related entity every time — often more than you need. Collections default to LAZY. A good rule is to make every association <code>FetchType.LAZY</code> and load what you need per use case with fetch joins or entity graphs (see the N+1 lesson).`,
      },
      {
        heading: 'Cascade and orphanRemoval',
        body: `<code>cascade = CascadeType.ALL</code> propagates persist, merge, remove and so on from parent to children: saving an order saves its new items. <code>orphanRemoval = true</code> deletes a child when it is removed from the parent's collection. Use both only for true composition — children that cannot exist without their parent (order → line items). Never cascade REMOVE from a many-to-one side (deleting an order must not delete the customer).`,
      },
      {
        heading: 'Many-to-Many: Prefer a Join Entity',
        body: `A plain <code>@ManyToMany</code> works when the link has no data of its own. As soon as you need extra columns — enrolment date, progress, role — replace it with an explicit entity (<code>Enrollment</code>) with two <code>@ManyToOne</code> associations. Real systems almost always end up needing that extra data. When you do use <code>@ManyToMany</code>, use a <code>Set</code>, not a <code>List</code>, to avoid inefficient delete-and-reinsert behaviour.`,
      },
      {
        heading: 'equals and hashCode for Entities',
        body: `Entities change identity when they are saved (the id goes from null to a value), which breaks <code>HashSet</code> membership if <code>hashCode</code> uses the id naïvely. Either use a natural business key that never changes (like an ISBN or email), or base equality on the id while returning a constant <code>hashCode</code> for the class. Never include lazy associations in <code>equals</code>, <code>hashCode</code> or <code>toString</code> — Lombok's <code>@Data</code> does exactly that and triggers lazy loading or infinite recursion.`,
      },
    ],
    examples: [
      {
        caption: 'Bidirectional one-to-many with helper methods, cascade and orphan removal',
        code: `@Entity
@Table(name = "orders")
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);       // keep the owning side in sync
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
    // getters...
}

@Entity
public class OrderItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id")      // owning side: holds the foreign key
    private Order order;

    private String product;
    private int quantity;
    // constructor, getters, setOrder...
}

// usage
Order order = new Order(customer);
order.addItem(new OrderItem("Spring Boot course", 1));
order.addItem(new OrderItem("Java workbook", 2));
orderRepository.save(order);          // cascades to both items`,
        output: `insert into orders (customer_id) values (?)
insert into order_item (order_id, product, quantity) values (?, ?, ?)
insert into order_item (order_id, product, quantity) values (?, ?, ?)`,
      },
      {
        caption: 'One-to-one with a shared primary key (@MapsId)',
        code: `@Entity
public class UserProfile {

    @Id
    private Long id;               // same value as the user's id

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private AppUser user;

    private String bio;
    private String avatarUrl;
}`,
        output: `create table user_profile (user_id bigint not null primary key, bio varchar(255), avatar_url varchar(255),
  foreign key (user_id) references app_users)`,
      },
      {
        caption: 'Many-to-many replaced by a join entity with extra data',
        code: `@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"}))
public class Enrollment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Course course;

    private LocalDate enrolledOn;
    private int progressPercent;

    protected Enrollment() {}

    public Enrollment(Student student, Course course) {
        this.student = student;
        this.course = course;
        this.enrolledOn = LocalDate.now();
    }
}

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentIdOrderByEnrolledOnDesc(Long studentId);
    long countByCourseId(Long courseId);
}`,
        output: `create table enrollment (id bigint generated by default as identity, enrolled_on date, progress_percent integer not null,
  course_id bigint not null, student_id bigint not null, primary key (id), unique (student_id, course_id))`,
      },
      {
        caption: 'Safe equals and hashCode for an entity',
        code: `@Entity
public class Course {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Course other)) return false;
        return id != null && id.equals(other.id);   // unsaved entities are only equal to themselves
    }

    @Override
    public int hashCode() {
        return Course.class.hashCode();             // constant: stays stable when the id is assigned
    }

    @Override
    public String toString() {
        return "Course{id=" + id + ", title='" + title + "'}";   // no lazy associations
    }
}`,
        output: `Set<Course> set = new HashSet<>();
set.add(course);            // id = null
courseRepository.save(course); // id = 7
set.contains(course)  -> true   (would be false if hashCode used the id)`,
      },
    ],
    commonMistakes: [
      'Updating only the inverse (mappedBy) side of a relationship and wondering why the foreign key is never saved.',
      'Leaving @ManyToOne at its default EAGER fetch, loading large object graphs on every query.',
      'Cascading REMOVE from child to parent, e.g. deleting an order deletes the customer.',
      'Using Lombok @Data or @EqualsAndHashCode on entities, triggering lazy loading and StackOverflowError through bidirectional toString.',
      'Using @ManyToMany with a List, which makes Hibernate delete and re-insert all rows on every change.',
    ],
    keyPoints: [
      'The @ManyToOne side owns the foreign key; the other side uses mappedBy.',
      'Keep both sides of a bidirectional association in sync with helper methods.',
      'Make associations LAZY and fetch what each use case needs explicitly.',
      'Use cascade ALL + orphanRemoval only for true parent-child composition.',
      'Model many-to-many links that carry data as a separate join entity.',
    ],
  },

  'custom-queries-and-projections': {
    title: 'Custom Queries, Projections and Specifications',
    intro: `Derived query methods like <code>findByEmail</code> cover the simple cases, but real screens need more: reports with aggregates, searches with optional filters, bulk updates, database-specific SQL, and responses that contain only a few columns instead of whole entities.

This lesson goes beyond the basics of Spring Data JPA: JPQL and native queries with <code>@Query</code>, modifying queries, interface and DTO (record) projections, dynamic filtering with Specifications, Query by Example, and scrolling through large result sets.`,
    sections: [
      {
        heading: 'JPQL with @Query',
        body: `JPQL looks like SQL but queries <strong>entities and their fields</strong>, not tables and columns. It is portable across databases and checked by Hibernate at startup — a typo in a JPQL query fails fast when the application starts. Use named parameters (<code>:status</code>) with <code>@Param</code> or rely on compiled parameter names. Never concatenate values into queries.`,
      },
      {
        heading: 'Native Queries',
        body: `<code>nativeQuery = true</code> sends raw SQL to the database. Use it for database-specific features — window functions, PostgreSQL JSON operators, full-text search, CTEs — that JPQL does not support. The trade-off is portability and weaker startup validation.`,
      },
      {
        heading: 'Modifying Queries',
        body: `Bulk <code>UPDATE</code> and <code>DELETE</code> queries need <code>@Modifying</code> and must run inside a transaction. They bypass the persistence context, so entities already loaded in memory become stale; set <code>clearAutomatically = true</code> to clear the context after the update.`,
      },
      {
        heading: 'Projections',
        body: `Loading full entities for a list screen wastes memory and bandwidth. A <strong>projection</strong> returns only the fields you need. <strong>Interface projections</strong> declare getters matching entity properties; Spring generates a proxy. <strong>DTO projections</strong> use a Java record whose constructor parameters match the selected values — the cleanest option for API responses. <strong>Dynamic projections</strong> let the caller pass the desired type as a <code>Class&lt;T&gt;</code> parameter.`,
      },
      {
        heading: 'Specifications for Dynamic Filters',
        body: `Search screens with many optional filters lead to an explosion of repository methods. <code>JpaSpecificationExecutor</code> lets you build a query from small reusable <code>Specification</code> objects combined with <code>and()</code>/<code>or()</code>, adding only the conditions the user actually supplied.`,
      },
      {
        heading: 'Query by Example and Scrolling',
        body: `Query by Example builds a query from a probe object: non-null fields become conditions. It suits simple admin searches. For iterating over millions of rows, <code>Window</code> results with <code>ScrollPosition</code> (keyset scrolling) are far more efficient than deep <code>OFFSET</code> pagination.`,
      },
    ],
    examples: [
      {
        caption: 'JPQL, native and modifying queries',
        code: `public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
        select o from Order o
        where o.customer.email = :email and o.status in :statuses
        order by o.createdAt desc
        """)
    List<Order> findForCustomer(String email, Collection<OrderStatus> statuses);

    @Query("select coalesce(sum(i.quantity * i.unitPrice), 0) from OrderItem i where i.order.createdAt >= :since")
    BigDecimal revenueSince(Instant since);

    // PostgreSQL-specific: monthly revenue with date_trunc
    @Query(value = """
        select to_char(date_trunc('month', o.created_at), 'YYYY-MM') as month,
               sum(i.quantity * i.unit_price) as revenue
        from orders o join order_item i on i.order_id = o.id
        group by 1 order by 1
        """, nativeQuery = true)
    List<Object[]> monthlyRevenue();

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("update Order o set o.status = 'CANCELLED' where o.status = 'PENDING' and o.createdAt < :cutoff")
    int cancelStalePendingOrders(Instant cutoff);
}`,
        output: `revenueSince(2026-09-01)          -> 184500.00
monthlyRevenue()                  -> [["2026-07", 120300.00], ["2026-08", 168900.00], ["2026-09", 184500.00]]
cancelStalePendingOrders(...)     -> 12  (rows updated)`,
      },
      {
        caption: 'Interface, record (DTO) and dynamic projections',
        code: `// Interface projection
public interface CourseTitleView {
    String getTitle();
    String getLevel();
}

// Record projection built with a JPQL constructor expression
public record CourseStats(String title, long students, double avgProgress) {}

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<CourseTitleView> findByPublishedTrueOrderByTitle();

    @Query("""
        select new com.webnest.shop.course.CourseStats(c.title, count(e), coalesce(avg(e.progressPercent), 0))
        from Course c left join Enrollment e on e.course = c
        group by c.title order by count(e) desc
        """)
    List<CourseStats> courseStats();

    // Caller chooses the projection type
    <T> List<T> findByLevel(String level, Class<T> type);
}

// usage
courseRepository.findByPublishedTrueOrderByTitle()
    .forEach(c -> System.out.println(c.getTitle() + " - " + c.getLevel()));
courseRepository.courseStats().forEach(System.out::println);
List<CourseTitleView> beginners = courseRepository.findByLevel("BEGINNER", CourseTitleView.class);`,
        output: `select c1_0.title, c1_0.level from course c1_0 where c1_0.published order by c1_0.title
Java Core - BEGINNER
Spring Boot - INTERMEDIATE

CourseStats[title=Spring Boot, students=1240, avgProgress=46.2]
CourseStats[title=Java Core, students=980, avgProgress=61.8]`,
      },
      {
        caption: 'Specifications for a search endpoint with optional filters',
        code: `public interface ProductRepository extends JpaRepository<Product, Long>,
                                           JpaSpecificationExecutor<Product> {}

public final class ProductSpecs {

    private ProductSpecs() {}

    public static Specification<Product> nameContains(String text) {
        return (root, query, cb) -> text == null ? null
            : cb.like(cb.lower(root.get("name")), "%" + text.toLowerCase() + "%");
    }

    public static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return null;
            if (min == null) return cb.le(root.get("price"), max);
            if (max == null) return cb.ge(root.get("price"), min);
            return cb.between(root.get("price"), min, max);
        };
    }

    public static Specification<Product> inCategory(String category) {
        return (root, query, cb) -> category == null ? null : cb.equal(root.get("category"), category);
    }
}

@GetMapping("/api/products/search")
public Page<Product> search(@RequestParam(required = false) String q,
                            @RequestParam(required = false) BigDecimal minPrice,
                            @RequestParam(required = false) BigDecimal maxPrice,
                            @RequestParam(required = false) String category,
                            Pageable pageable) {
    Specification<Product> spec = Specification.allOf(
        ProductSpecs.nameContains(q),
        ProductSpecs.priceBetween(minPrice, maxPrice),
        ProductSpecs.inCategory(category));
    return productRepository.findAll(spec, pageable);
}`,
        output: `GET /api/products/search?q=hoodie&maxPrice=1500
select ... from product p1_0 where lower(p1_0.name) like ? and p1_0.price<=? offset ? rows fetch first ? rows only

GET /api/products/search?category=books
select ... from product p1_0 where p1_0.category=? offset ? rows fetch first ? rows only`,
      },
      {
        caption: 'Query by Example and keyset scrolling',
        code: `// Query by Example: non-null fields of the probe become conditions
Customer probe = new Customer();
probe.setCity("Pune");
probe.setActive(true);
ExampleMatcher matcher = ExampleMatcher.matching().withIgnoreCase();
List<Customer> puneCustomers = customerRepository.findAll(Example.of(probe, matcher));

// Keyset scrolling through a large table without OFFSET
public interface OrderRepository extends JpaRepository<Order, Long> {
    Window<Order> findTop500ByStatusOrderByIdAsc(OrderStatus status, ScrollPosition position);
}

Window<Order> window = orderRepository.findTop500ByStatusOrderByIdAsc(
        OrderStatus.SHIPPED, ScrollPosition.keyset());
while (!window.isEmpty()) {
    window.forEach(invoiceService::archive);
    if (!window.hasNext()) break;
    window = orderRepository.findTop500ByStatusOrderByIdAsc(
        OrderStatus.SHIPPED, window.positionAt(window.size() - 1));
}`,
        output: `select ... from orders where status=? order by id fetch first 500 rows only
select ... from orders where status=? and id>? order by id fetch first 500 rows only
... (each batch uses "id > last seen id" instead of an ever-growing OFFSET)`,
      },
    ],
    commonMistakes: [
      'Concatenating request parameters into @Query strings, creating SQL/JPQL injection vulnerabilities.',
      'Writing SQL table/column names in a JPQL query (JPQL uses entity and field names).',
      'Forgetting @Modifying or @Transactional on bulk update queries, which throws at runtime.',
      'Returning entities with lazy associations directly as JSON instead of projecting to DTOs.',
      'Using OFFSET pagination to process millions of rows; later pages get slower and slower.',
    ],
    keyPoints: [
      '@Query supports portable JPQL and database-specific native SQL with named parameters.',
      'Bulk updates need @Modifying, a transaction, and usually clearAutomatically = true.',
      'Projections (interface, record, dynamic) load only the columns a use case needs.',
      'Specifications build dynamic WHERE clauses from optional filters cleanly.',
      'Query by Example suits simple searches; keyset scrolling suits large batch processing.',
    ],
  },

  'transactions-in-spring-boot': {
    title: 'Transactions in Spring Boot',
    intro: `A transaction groups several database operations so that they either all succeed or all fail. Transferring money, placing an order while reducing stock, or registering a user and their profile must never be left half-done. Spring's <code>@Transactional</code> makes this declarative — but it has rules about proxies, rollback and propagation that trip up even experienced developers.

This lesson explains how <code>@Transactional</code> works under the hood, which exceptions cause rollback, what propagation and isolation mean, why read-only transactions matter, the self-invocation trap, programmatic transactions with <code>TransactionTemplate</code>, and how to run code only after a transaction commits.`,
    sections: [
      {
        heading: 'How @Transactional Works',
        body: `Spring wraps beans that have <code>@Transactional</code> methods in a <strong>proxy</strong>. When another bean calls such a method, the proxy asks the <code>PlatformTransactionManager</code> (auto-configured as <code>JpaTransactionManager</code> with Spring Data JPA) to begin a transaction, calls your method, and commits — or rolls back if an exception escapes. Put <code>@Transactional</code> on <strong>service</strong> methods that represent one business operation, not on controllers or individual repository calls.`,
      },
      {
        heading: 'Rollback Rules',
        body: `By default Spring rolls back for <strong>unchecked</strong> exceptions (<code>RuntimeException</code> and <code>Error</code>) and <strong>commits</strong> for checked exceptions. This surprises many developers. Use <code>rollbackFor = Exception.class</code> when checked exceptions should roll back, or <code>noRollbackFor</code> for exceptions that are expected and harmless. Catching an exception inside the method and not rethrowing it means no rollback at all.`,
      },
      {
        heading: 'Propagation',
        body: `Propagation defines what happens when a transactional method calls another.`,
        list: [
          '<code>REQUIRED</code> (default) — join the existing transaction, or start one if none exists.',
          '<code>REQUIRES_NEW</code> — suspend the current transaction and run in a brand new one that commits independently. Useful for audit logs that must survive a rollback.',
          '<code>MANDATORY</code> — must be called inside an existing transaction, otherwise throw.',
          '<code>SUPPORTS</code>, <code>NOT_SUPPORTED</code>, <code>NEVER</code> — run with, without, or forbid a transaction.',
          '<code>NESTED</code> — a savepoint within the current transaction (JDBC only, not supported by JpaTransactionManager for JPA entities).',
        ],
      },
      {
        heading: 'Isolation and Read-Only',
        body: `Isolation levels (<code>READ_COMMITTED</code>, <code>REPEATABLE_READ</code>, <code>SERIALIZABLE</code>) control what concurrent transactions can see; the database default (READ_COMMITTED on PostgreSQL) is usually right, combined with optimistic locking for conflicting updates. <code>readOnly = true</code> tells Hibernate to skip dirty checking and lets the driver route to read replicas — use it for query-only service methods.`,
      },
      {
        heading: 'The Self-Invocation Trap',
        body: `Because transactions are applied by a proxy, calling a <code>@Transactional</code> method from another method <strong>in the same class</strong> (<code>this.doWork()</code>) bypasses the proxy, and the annotation is ignored. Move the method into a separate bean, or use <code>TransactionTemplate</code>. The same applies to private methods: annotations on them are never applied.`,
      },
      {
        heading: 'After-Commit Actions',
        body: `Sending an email or publishing a Kafka event from inside a transaction is risky: if the transaction later rolls back, the email is already sent. Publish an application event and handle it with <code>@TransactionalEventListener(phase = AFTER_COMMIT)</code> so side effects happen only after the data is safely committed.`,
      },
    ],
    examples: [
      {
        caption: 'A service method that must be all-or-nothing',
        code: `@Service
public class CheckoutService {

    private final OrderRepository orders;
    private final ProductRepository products;

    public CheckoutService(OrderRepository orders, ProductRepository products) {
        this.orders = orders;
        this.products = products;
    }

    @Transactional
    public Order placeOrder(Customer customer, Map<Long, Integer> quantities) {
        Order order = new Order(customer);
        quantities.forEach((productId, qty) -> {
            Product p = products.findById(productId).orElseThrow();
            if (p.getStock() < qty) {
                throw new OutOfStockException(p.getName());   // RuntimeException -> rollback
            }
            p.setStock(p.getStock() - qty);   // dirty checking: UPDATE at commit, no save() needed
            order.addItem(new OrderItem(p, qty));
        });
        return orders.save(order);
    }

    @Transactional(readOnly = true)
    public List<Order> history(String email) {
        return orders.findForCustomer(email, EnumSet.allOf(OrderStatus.class));
    }
}`,
        output: `placeOrder(asha, {1:2, 2:1})   -> COMMIT: 1 order, 2 items, 2 stock updates
placeOrder(asha, {1:2, 3:99})  -> OutOfStockException("Hoodie")
                                 ROLLBACK: stock of product 1 is NOT reduced, no order row created`,
      },
      {
        caption: 'Checked exceptions and rollbackFor',
        code: `@Transactional
public void importCsv(Path file) throws IOException {
    customers.save(new Customer("first"));
    Files.readAllLines(file);          // throws IOException (checked)
}
// -> IOException: the first customer IS committed (default: no rollback for checked exceptions)

@Transactional(rollbackFor = Exception.class)
public void importCsvSafely(Path file) throws IOException {
    customers.save(new Customer("first"));
    Files.readAllLines(file);
}
// -> IOException: everything rolled back`,
        output: `importCsv(missing.csv)        -> NoSuchFileException, 1 row committed (surprise!)
importCsvSafely(missing.csv)  -> NoSuchFileException, 0 rows committed`,
      },
      {
        caption: 'REQUIRES_NEW for an audit log that survives rollback',
        code: `@Service
public class AuditService {

    private final AuditRepository audit;

    public AuditService(AuditRepository audit) {
        this.audit = audit;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(String action, String user) {
        audit.save(new AuditEntry(action, user, Instant.now()));
    }
}

@Service
public class PaymentService {

    private final AuditService auditService;
    private final PaymentGateway gateway;

    public PaymentService(AuditService auditService, PaymentGateway gateway) {
        this.auditService = auditService;
        this.gateway = gateway;
    }

    @Transactional
    public void pay(Order order, String user) {
        auditService.record("PAYMENT_ATTEMPT order=" + order.getId(), user);  // separate bean -> proxy applies
        gateway.charge(order);   // throws PaymentDeclinedException
    }
}`,
        output: `pay(...) fails with PaymentDeclinedException
 -> payment transaction ROLLED BACK
 -> audit_entry "PAYMENT_ATTEMPT order=41" COMMITTED (independent transaction)`,
      },
      {
        caption: 'Self-invocation bug, TransactionTemplate, and after-commit events',
        code: `@Service
public class ReportService {

    public void generateAll() {
        for (Long id : ids()) {
            generateOne(id);   // BUG: self-call bypasses the proxy -> no transaction!
        }
    }

    @Transactional
    public void generateOne(Long id) { /* ... */ }
}

// Fix with TransactionTemplate: one transaction per item, explicit and visible
@Service
public class ReportServiceFixed {

    private final TransactionTemplate tx;

    public ReportServiceFixed(PlatformTransactionManager txManager) {
        this.tx = new TransactionTemplate(txManager);
    }

    public void generateAll(List<Long> ids) {
        ids.forEach(id -> tx.executeWithoutResult(status -> generateOne(id)));
    }

    private void generateOne(Long id) { /* ... */ }
}

// Send the confirmation email only after the order is committed
public record OrderPlacedEvent(Long orderId, String email) {}

@Transactional
public Order placeOrder(...) {
    Order saved = orders.save(order);
    events.publishEvent(new OrderPlacedEvent(saved.getId(), customer.getEmail()));
    return saved;
}

@Component
class OrderEmailListener {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void onPlaced(OrderPlacedEvent e) {
        mailService.sendConfirmation(e.email(), e.orderId());
    }
}`,
        output: `Order committed -> OrderEmailListener runs -> email sent
Order rolled back -> listener never runs -> no misleading email`,
      },
    ],
    commonMistakes: [
      'Annotating private methods or calling @Transactional methods from the same class; the proxy never sees the call.',
      'Assuming checked exceptions roll back the transaction — by default they commit.',
      'Catching an exception inside a transactional method and continuing, so the transaction commits partial work.',
      'Calling external services (HTTP, email) inside long transactions, holding database connections and locks for seconds.',
      'Putting @Transactional on controllers, which mixes web concerns with transaction boundaries.',
    ],
    keyPoints: [
      '@Transactional works through proxies: only external calls to public methods are intercepted.',
      'Default rollback happens for RuntimeException and Error; use rollbackFor for checked exceptions.',
      'REQUIRED joins an existing transaction; REQUIRES_NEW runs independently.',
      'Use readOnly = true for query-only methods.',
      'Trigger side effects after commit with @TransactionalEventListener.',
    ],
  },

  'database-migrations-with-flyway-and-liquibase': {
    title: 'Database Migrations with Flyway and Liquibase',
    intro: `Your schema evolves with your code: new tables, new columns, renamed fields, new indexes. On a developer laptop you can drop and recreate the database, but production data must be preserved and every environment must end up with exactly the same schema. <strong>Database migration tools</strong> solve this by keeping every schema change as a versioned script in source control and applying pending scripts automatically at startup.

Spring Boot integrates the two most popular tools, Flyway and Liquibase. In Spring Boot 4 you add them through dedicated starters (<code>spring-boot-starter-flyway</code>, <code>spring-boot-starter-liquibase</code>). This lesson covers both, with naming conventions, data migrations, safe changes for live systems, and testing.`,
    sections: [
      {
        heading: 'How Migration Tools Work',
        body: `The tool keeps a history table in your database (<code>flyway_schema_history</code> or <code>DATABASECHANGELOG</code>). At startup it compares the scripts in your project with that table and runs any new ones in order, recording each one and its checksum. Already applied scripts are never run again, and editing one is detected as a checksum mismatch. The rule is simple: <strong>never modify a migration that has been applied anywhere; add a new one</strong>.`,
      },
      {
        heading: 'Flyway',
        body: `Flyway uses plain SQL files in <code>src/main/resources/db/migration</code> named <code>V&lt;version&gt;__&lt;description&gt;.sql</code> — for example <code>V1__create_customers.sql</code>, <code>V2__add_phone_to_customers.sql</code>. Repeatable migrations (<code>R__refresh_views.sql</code>) rerun whenever their content changes, useful for views and functions. Java-based migrations are available for complex data changes. Many databases (PostgreSQL, MySQL, SQL Server, Oracle) need an extra Flyway module such as <code>flyway-database-postgresql</code>.`,
      },
      {
        heading: 'Liquibase',
        body: `Liquibase describes changes as <strong>changesets</strong> in YAML, XML, JSON or SQL, listed in a master changelog (<code>db/changelog/db.changelog-master.yaml</code>). Its database-independent change types (createTable, addColumn) let one changelog target several databases, and it supports automatic rollback for many change types. Choose Liquibase when you need multi-database support or rollbacks; choose Flyway for simplicity and plain SQL.`,
      },
      {
        heading: 'Hibernate and Migrations Together',
        body: `Once migrations own the schema, set <code>spring.jpa.hibernate.ddl-auto=validate</code>. Hibernate then checks at startup that entities match the tables created by your scripts and fails fast if someone forgot a migration.`,
      },
      {
        heading: 'Zero-Downtime Changes (Expand and Contract)',
        body: `During a rolling deployment, old and new versions of your application run against the same database at the same time. So never make a breaking change in one step. To rename a column: 1) add the new column, 2) deploy code that writes both and reads the new one, 3) backfill data, 4) deploy code that uses only the new column, 5) drop the old column in a later release. Add indexes concurrently on large PostgreSQL tables to avoid locking writes.`,
      },
    ],
    examples: [
      {
        caption: 'Flyway setup and the first migrations',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-flyway</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>

-- src/main/resources/db/migration/V1__create_customers.sql
create table customers (
    id          bigint generated by default as identity primary key,
    email       varchar(255) not null unique,
    full_name   varchar(200) not null,
    created_at  timestamp with time zone not null default now()
);

-- src/main/resources/db/migration/V2__create_orders.sql
create table orders (
    id           bigint generated by default as identity primary key,
    customer_id  bigint not null references customers(id),
    status       varchar(20) not null,
    created_at   timestamp with time zone not null default now()
);
create index idx_orders_customer on orders(customer_id);

-- src/main/resources/db/migration/V3__add_phone_to_customers.sql
alter table customers add column phone varchar(20);`,
        output: `Flyway Community Edition by Redgate
Database: jdbc:postgresql://localhost:5432/webnest (PostgreSQL 17.2)
Successfully validated 3 migrations
Current version of schema "public": << Empty Schema >>
Migrating schema "public" to version "1 - create customers"
Migrating schema "public" to version "2 - create orders"
Migrating schema "public" to version "3 - add phone to customers"
Successfully applied 3 migrations to schema "public", now at version v3`,
      },
      {
        caption: 'Flyway configuration and a data migration',
        code: `# application.yml
spring:
  flyway:
    locations: classpath:db/migration
    baseline-on-migrate: true   # for adopting Flyway on an existing database
  jpa:
    hibernate:
      ddl-auto: validate

-- V4__split_full_name.sql : expand step, keeps the old column for now
alter table customers add column first_name varchar(100);
alter table customers add column last_name  varchar(100);

update customers
set first_name = split_part(full_name, ' ', 1),
    last_name  = nullif(substr(full_name, length(split_part(full_name, ' ', 1)) + 2), '');`,
        output: `Migrating schema "public" to version "4 - split full name"
Successfully applied 1 migration to schema "public", now at version v4

select version, description, success from flyway_schema_history;
 1 | create customers        | t
 2 | create orders           | t
 3 | add phone to customers  | t
 4 | split full name         | t`,
      },
      {
        caption: 'Liquibase with a YAML changelog',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-liquibase</artifactId>
</dependency>

# src/main/resources/db/changelog/db.changelog-master.yaml
databaseChangeLog:
  - include:
      file: db/changelog/001-create-courses.yaml
  - include:
      file: db/changelog/002-add-price.yaml

# db/changelog/001-create-courses.yaml
databaseChangeLog:
  - changeSet:
      id: 001-create-courses
      author: webnest
      changes:
        - createTable:
            tableName: courses
            columns:
              - column: { name: id, type: bigint, autoIncrement: true, constraints: { primaryKey: true } }
              - column: { name: slug, type: varchar(100), constraints: { nullable: false, unique: true } }
              - column: { name: title, type: varchar(200), constraints: { nullable: false } }

# db/changelog/002-add-price.yaml
databaseChangeLog:
  - changeSet:
      id: 002-add-price
      author: webnest
      changes:
        - addColumn:
            tableName: courses
            columns:
              - column: { name: price, type: decimal(10,2), defaultValueNumeric: 0 }
      rollback:
        - dropColumn: { tableName: courses, columnName: price }`,
        output: `Liquibase: Running Changeset: db/changelog/001-create-courses.yaml::001-create-courses::webnest
Liquibase: Running Changeset: db/changelog/002-add-price.yaml::002-add-price::webnest
Liquibase: Update command completed successfully.`,
      },
      {
        caption: 'Testing migrations against a real database with Testcontainers',
        code: `@SpringBootTest
@Testcontainers
class MigrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17");

    @Autowired JdbcClient jdbc;

    @Test
    void allMigrationsApplyAndSchemaMatchesEntities() {
        // Context startup already ran Flyway and Hibernate 'validate'
        Integer applied = jdbc.sql("select count(*) from flyway_schema_history where success")
            .query(Integer.class).single();
        assertThat(applied).isGreaterThanOrEqualTo(4);
    }
}`,
        output: `MigrationTest > allMigrationsApplyAndSchemaMatchesEntities() PASSED
(Catches broken SQL and entity/schema mismatches before they reach production.)`,
      },
    ],
    commonMistakes: [
      'Editing a migration file after it has been applied, causing "Validate failed: Migration checksum mismatch" in every other environment.',
      'Keeping ddl-auto=update alongside Flyway, so Hibernate and Flyway both change the schema.',
      'Making breaking changes (rename/drop column) in one step during rolling deployments.',
      'In Spring Boot 4, adding only flyway-core without spring-boot-starter-flyway, so Flyway is not auto-configured.',
      'Forgetting the database-specific Flyway module (e.g. flyway-database-postgresql) and getting "Unsupported Database".',
    ],
    keyPoints: [
      'Migrations are versioned scripts in source control, applied automatically and recorded in a history table.',
      'Flyway: V<version>__<description>.sql in db/migration; Liquibase: changesets in a master changelog.',
      'In Spring Boot 4, use spring-boot-starter-flyway or spring-boot-starter-liquibase.',
      'Never edit applied migrations; set ddl-auto=validate so Hibernate checks the schema.',
      'Use expand-and-contract for zero-downtime schema changes and test migrations with Testcontainers.',
    ],
  },

  'solving-the-n-1-problem': {
    title: 'Solving the N+1 Query Problem',
    intro: `The N+1 problem is the most common performance bug in JPA applications. You load a list of 50 orders with one query, then your code (or Jackson, while serialising JSON) touches <code>order.getCustomer()</code> on each one, and Hibernate quietly runs 50 more queries. The page works fine in development with five rows and falls over in production with thousands.

This lesson shows how to detect N+1 queries, and the four main fixes: fetch joins, entity graphs, batch fetching, and DTO projections — along with the pagination pitfall of fetching collections.`,
    sections: [
      {
        heading: 'Why It Happens',
        body: `Lazy associations are loaded on first access. Loading N parent rows takes one query; accessing a lazy association on each parent takes one query per parent: N+1 in total. Eager fetching does not fix it — for JPQL queries Hibernate still loads EAGER associations with separate queries, and now it happens even when you did not need the data.`,
      },
      {
        heading: 'Detecting N+1 Queries',
        body: `Turn on SQL logging in development (<code>logging.level.org.hibernate.SQL=debug</code>) and watch for repeated identical queries. Hibernate statistics (<code>hibernate.generate_statistics=true</code>) report how many statements ran per session. In tests, you can assert the number of queries so regressions are caught automatically.`,
      },
      {
        heading: 'Fix 1: Fetch Join',
        body: `<code>join fetch</code> in JPQL loads the association in the same SQL query. It is explicit and efficient for to-one associations. Fetch-joining a <strong>collection</strong> multiplies rows, so combine it with <code>distinct</code> semantics (automatic in Hibernate 6+) and never with pagination — Hibernate would load everything and paginate in memory (it warns "firstResult/maxResults specified with collection fetch").`,
      },
      {
        heading: 'Fix 2: @EntityGraph',
        body: `<code>@EntityGraph(attributePaths = {"customer", "items"})</code> on a repository method tells Spring Data which associations to fetch, without writing JPQL. It works with derived query methods and is easy to vary per use case.`,
      },
      {
        heading: 'Fix 3: Batch Fetching',
        body: `Setting <code>hibernate.default_batch_fetch_size</code> (for example 50) makes Hibernate load lazy associations for many parents at once using <code>WHERE id IN (...)</code>. N+1 becomes 1 + N/50 queries with no code changes. It is a great global safety net, and the best fix for paginated lists that need collections.`,
      },
      {
        heading: 'Fix 4: DTO Projections',
        body: `For read-only screens, select exactly the columns you need into a record with a JPQL constructor expression or a native query. No entities, no lazy loading, no persistence context overhead — usually the fastest option of all.`,
      },
    ],
    examples: [
      {
        caption: 'The problem: 1 + N queries',
        code: `# application.yml (development only)
logging:
  level:
    org.hibernate.SQL: debug

@GetMapping("/api/orders")
public List<OrderSummary> list() {
    return orderRepository.findAll().stream()
        .map(o -> new OrderSummary(o.getId(), o.getCustomer().getEmail(), o.getItems().size()))
        .toList();
}`,
        output: `select o1_0.id, o1_0.customer_id, o1_0.status from orders o1_0
select c1_0.id, c1_0.email from customers c1_0 where c1_0.id=?
select i1_0.order_id, i1_0.id, ... from order_item i1_0 where i1_0.order_id=?
select c1_0.id, c1_0.email from customers c1_0 where c1_0.id=?
select i1_0.order_id, i1_0.id, ... from order_item i1_0 where i1_0.order_id=?
... (201 queries for 100 orders)`,
      },
      {
        caption: 'Fix with a fetch join and with an entity graph',
        code: `public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("select o from Order o join fetch o.customer join fetch o.items where o.status = :status")
    List<Order> findWithCustomerAndItems(OrderStatus status);

    @EntityGraph(attributePaths = {"customer", "items"})
    List<Order> findByCreatedAtAfter(Instant since);
}`,
        output: `select o1_0.id, c1_0.id, c1_0.email, i1_0.order_id, i1_0.id, i1_0.product, ...
from orders o1_0
join customers c1_0 on c1_0.id=o1_0.customer_id
join order_item i1_0 on o1_0.id=i1_0.order_id
where o1_0.status=?
(1 query for 100 orders)`,
      },
      {
        caption: 'Batch fetching for paginated lists',
        code: `# application.yml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 50

// Paginated query stays simple; associations are loaded in batches
Page<Order> page = orderRepository.findAll(PageRequest.of(0, 50, Sort.by("createdAt").descending()));
page.forEach(o -> System.out.println(o.getCustomer().getEmail() + " " + o.getItems().size()));`,
        output: `select ... from orders o1_0 order by o1_0.created_at desc offset ? rows fetch first ? rows only
select ... from customers c1_0 where c1_0.id in (?,?,?, ... ?)
select ... from order_item i1_0 where i1_0.order_id in (?,?,?, ... ?)
(3 queries for a page of 50 orders instead of 101)`,
      },
      {
        caption: 'The fastest read path: a record projection',
        code: `public record OrderSummary(Long id, String customerEmail, long itemCount) {}

@Query("""
    select new com.webnest.shop.order.OrderSummary(o.id, c.email, count(i))
    from Order o join o.customer c left join o.items i
    group by o.id, c.email
    order by o.id desc
    """)
List<OrderSummary> summaries();`,
        output: `select o1_0.id, c1_0.email, count(i1_0.id) from orders o1_0 join customers c1_0 on ... left join order_item i1_0 on ...
group by o1_0.id, c1_0.email order by o1_0.id desc
(1 query, only 3 columns, no entities in memory)`,
      },
    ],
    commonMistakes: [
      'Switching associations to FetchType.EAGER to "fix" lazy loading, which causes N+1 everywhere instead.',
      'Combining a collection fetch join with Pageable, forcing in-memory pagination of the whole table.',
      'Serialising entities directly to JSON, so Jackson triggers lazy loading for every association.',
      'Only testing with a handful of rows, where N+1 is invisible.',
      'Relying on open-in-view to avoid LazyInitializationException, which hides N+1 queries in the view layer.',
    ],
    keyPoints: [
      'N+1 = one query for parents plus one per parent for a lazy association.',
      'Detect it with SQL logging or Hibernate statistics, and guard against it in tests.',
      'Use join fetch or @EntityGraph to load needed associations in one query.',
      'default_batch_fetch_size turns N+1 into a few IN queries and works with pagination.',
      'DTO projections are the most efficient solution for read-only views.',
    ],
  },

  'auditing-optimistic-locking-and-soft-deletes': {
    title: 'Auditing, Optimistic Locking and Soft Deletes',
    intro: `Production data needs history and protection. Support staff ask "who changed this price and when?". Two admins edit the same product at the same time and one silently overwrites the other. A user deletes a record by mistake and wants it back. These are everyday requirements, and Spring Data JPA and Hibernate have built-in answers for each.

This lesson covers automatic audit fields with Spring Data auditing, preventing lost updates with optimistic locking (<code>@Version</code>), soft deletes with Hibernate's <code>@SoftDelete</code>, and full change history with Hibernate Envers.`,
    sections: [
      {
        heading: 'Spring Data JPA Auditing',
        body: `Annotate fields with <code>@CreatedDate</code>, <code>@LastModifiedDate</code>, <code>@CreatedBy</code> and <code>@LastModifiedBy</code>, add <code>@EntityListeners(AuditingEntityListener.class)</code> to the entity (or a shared <code>@MappedSuperclass</code>), and enable it with <code>@EnableJpaAuditing</code>. Provide an <code>AuditorAware</code> bean that returns the current user — typically from the Spring Security context — and the fields are filled automatically on insert and update.`,
      },
      {
        heading: 'Optimistic Locking with @Version',
        body: `Add a <code>@Version</code> field (a number or timestamp). Hibernate includes it in every UPDATE's WHERE clause and increments it. If another transaction changed the row in the meantime, zero rows match and Hibernate throws <code>OptimisticLockException</code> (Spring translates it to <code>ObjectOptimisticLockingFailureException</code>). Return <strong>409 Conflict</strong> to the client, who can reload and retry. This prevents lost updates without holding database locks.

For REST APIs, send the version to the client (for example as an ETag) and require it on updates, so conflicts are detected even across separate HTTP requests.`,
      },
      {
        heading: 'Pessimistic Locking',
        body: `When conflicts are frequent and retries are expensive — for example decrementing limited ticket stock — use <code>@Lock(LockModeType.PESSIMISTIC_WRITE)</code> on a repository method to issue <code>SELECT ... FOR UPDATE</code>. Other transactions wait until yours commits. Keep such transactions very short.`,
      },
      {
        heading: 'Soft Deletes',
        body: `A soft delete marks a row as deleted instead of removing it. Hibernate's <code>@SoftDelete</code> annotation turns <code>repository.delete(entity)</code> into an UPDATE that sets a <code>deleted</code> flag, and automatically filters deleted rows out of every query. Remember that unique constraints still see soft-deleted rows, and that data-protection laws may still require a real deletion of personal data.`,
      },
      {
        heading: 'Full History with Hibernate Envers',
        body: `Auditing fields only record the last change. <strong>Hibernate Envers</strong> (<code>@Audited</code>) records every version of an entity in <code>_AUD</code> tables with a revision number. Spring Data's <code>RevisionRepository</code> lets you query "what did this product look like last Tuesday?".`,
      },
    ],
    examples: [
      {
        caption: 'A reusable audited base class',
        code: `@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AuditedEntity {

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedDate
    private Instant updatedAt;

    @LastModifiedBy
    private String updatedBy;

    // getters
}

@Configuration
@EnableJpaAuditing
public class AuditingConfig {

    @Bean
    AuditorAware<String> auditorAware() {
        return () -> Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
            .filter(Authentication::isAuthenticated)
            .map(Authentication::getName)
            .or(() -> Optional.of("system"));
    }
}

@Entity
public class Product extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private BigDecimal price;
}`,
        output: `insert into product (created_at, created_by, updated_at, updated_by, name, price) values
  ('2026-09-27T09:12:00Z', 'admin@webnest.in', '2026-09-27T09:12:00Z', 'admin@webnest.in', 'Hoodie', 1299.00)
-- later, after another admin edits the price:
update product set price=1199.00, updated_at='2026-09-27T11:40:03Z', updated_by='ravi@webnest.in' where id=5`,
      },
      {
        caption: 'Optimistic locking and a 409 Conflict response',
        code: `@Entity
public class Product extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private BigDecimal price;

    @Version
    private long version;
}

public record UpdatePriceRequest(BigDecimal price, long version) {}

@PutMapping("/api/products/{id}/price")
@Transactional
public ProductDto updatePrice(@PathVariable Long id, @RequestBody UpdatePriceRequest req) {
    Product p = products.findById(id).orElseThrow();
    if (p.getVersion() != req.version()) {
        throw new ObjectOptimisticLockingFailureException(Product.class, id);
    }
    p.setPrice(req.price());
    return ProductDto.from(p);
}

@RestControllerAdvice
class ConflictHandler {
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    ProblemDetail conflict() {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        pd.setTitle("Edit conflict");
        pd.setDetail("This product was changed by someone else. Reload and try again.");
        return pd;
    }
}`,
        output: `update product set price=?, version=4, ... where id=5 and version=3

Admin A: PUT /api/products/5/price {"price":1199,"version":3} -> 200 (version now 4)
Admin B: PUT /api/products/5/price {"price":999, "version":3} -> 409 {"title":"Edit conflict","detail":"This product was changed by someone else. Reload and try again."}`,
      },
      {
        caption: 'Pessimistic lock for limited stock',
        code: `public interface TicketRepository extends JpaRepository<EventTicket, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from EventTicket t where t.id = :id")
    Optional<EventTicket> findForUpdate(Long id);
}

@Transactional
public void reserve(Long ticketId) {
    EventTicket t = tickets.findForUpdate(ticketId).orElseThrow();
    if (t.getRemaining() == 0) throw new SoldOutException();
    t.setRemaining(t.getRemaining() - 1);
}`,
        output: `select ... from event_ticket e1_0 where e1_0.id=? for no key update
(concurrent reservations wait in line; the count can never go below zero)`,
      },
      {
        caption: 'Soft delete with @SoftDelete and history with Envers',
        code: `@Entity
@SoftDelete                       // adds a boolean "deleted" column and filters it automatically
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String text;
    private int rating;
}

reviewRepository.deleteById(12L);
reviewRepository.findAll();       // review 12 no longer returned

// Envers: <dependency><groupId>org.hibernate.orm</groupId><artifactId>hibernate-envers</artifactId></dependency>
@Entity
@Audited
public class CoursePrice {
    @Id private Long courseId;
    private BigDecimal amount;
}

public interface CoursePriceRepository
        extends JpaRepository<CoursePrice, Long>, RevisionRepository<CoursePrice, Long, Integer> {}

@EnableJpaRepositories(repositoryFactoryBeanClass = EnversRevisionRepositoryFactoryBean.class)
@Configuration
class EnversConfig {}

coursePriceRepository.findRevisions(7L).forEach(r ->
    System.out.println("rev " + r.getRequiredRevisionNumber() + ": " + r.getEntity().getAmount()));`,
        output: `update review set deleted=true where id=? and deleted=false
select ... from review r1_0 where r1_0.deleted=false

rev 1: 2999.00
rev 4: 2499.00
rev 9: 1999.00`,
      },
    ],
    commonMistakes: [
      'Forgetting @EnableJpaAuditing or @EntityListeners, so audit fields stay null.',
      'Not exposing the @Version value to clients, so conflicting edits from two browser tabs still overwrite each other.',
      'Catching OptimisticLockException and retrying blindly, overwriting the other user\'s change anyway.',
      'Using pessimistic locks in long transactions, causing waiting threads and deadlocks.',
      'Assuming soft-deleted personal data satisfies a user\'s legal right to deletion.',
    ],
    keyPoints: [
      '@CreatedDate/@LastModifiedDate/@CreatedBy/@LastModifiedBy plus AuditorAware record who changed what and when.',
      '@Version enables optimistic locking; map conflicts to HTTP 409.',
      'Use PESSIMISTIC_WRITE locks sparingly for high-contention counters.',
      'Hibernate @SoftDelete marks rows deleted and hides them from queries automatically.',
      'Hibernate Envers keeps a full revision history queryable via RevisionRepository.',
    ],
  },

  'jdbcclient-and-spring-data-jdbc': {
    title: 'JdbcClient and Spring Data JDBC',
    intro: `JPA is powerful, but not every application needs a full ORM with a persistence context, lazy loading and dirty checking. Sometimes you want to write SQL yourself and map rows to records; sometimes you want repositories without the hidden magic. Spring offers two lighter options.

<code>JdbcClient</code> is a modern, fluent API for running SQL with named parameters and mapping results — the successor to direct <code>JdbcTemplate</code> use. <strong>Spring Data JDBC</strong> gives you repositories and aggregates with simple, predictable behaviour: every save is an immediate SQL statement and nothing is ever lazy-loaded. This lesson covers both and when to choose each over JPA.`,
    sections: [
      {
        heading: 'JdbcClient Basics',
        body: `Spring Boot auto-configures a <code>JdbcClient</code> bean whenever a DataSource exists. The fluent chain is <code>sql(...)</code> → <code>param(...)</code> → <code>query(...)</code> or <code>update()</code>. <code>query(MyRecord.class)</code> maps columns to record components by name (snake_case to camelCase), and <code>.single()</code>, <code>.optional()</code> and <code>.list()</code> choose the result shape. Parameters are always bound safely, never concatenated.`,
      },
      {
        heading: 'Inserts, Generated Keys and Batches',
        body: `<code>update()</code> returns the affected row count. Pass a <code>KeyHolder</code> to retrieve generated ids. For bulk inserts, <code>JdbcTemplate.batchUpdate</code> or <code>NamedParameterJdbcTemplate</code> remain available and are much faster than individual statements.`,
      },
      {
        heading: 'Spring Data JDBC and Aggregates',
        body: `Spring Data JDBC is built around Domain-Driven Design <strong>aggregates</strong>: an aggregate root (for example <code>Order</code>) and the entities it contains (<code>OrderLine</code>). Saving the root saves the whole aggregate; loading the root loads the whole aggregate. References to other aggregates are stored as ids (<code>AggregateReference&lt;Customer, Long&gt;</code>), not object links. There is no lazy loading, no caching and no dirty checking — what you call is what runs.`,
      },
      {
        heading: 'When to Choose What',
        body: `Use <strong>JPA</strong> for rich domain models with many relationships and when your team knows it well. Use <strong>Spring Data JDBC</strong> for simpler, aggregate-oriented models where predictability matters. Use <strong>JdbcClient</strong> for reporting queries, database-specific SQL, and performance-critical paths — it also mixes happily with JPA in the same application and transaction.`,
      },
    ],
    examples: [
      {
        caption: 'Querying and updating with JdbcClient',
        code: `public record CourseRow(Long id, String slug, String title, BigDecimal price) {}

@Repository
public class CourseQueries {

    private final JdbcClient jdbc;

    public CourseQueries(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<CourseRow> findCheaperThan(BigDecimal max) {
        return jdbc.sql("select id, slug, title, price from courses where price < :max order by price")
            .param("max", max)
            .query(CourseRow.class)
            .list();
    }

    public Optional<CourseRow> findBySlug(String slug) {
        return jdbc.sql("select id, slug, title, price from courses where slug = :slug")
            .param("slug", slug)
            .query(CourseRow.class)
            .optional();
    }

    public long create(String slug, String title, BigDecimal price) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.sql("insert into courses (slug, title, price) values (:slug, :title, :price)")
            .param("slug", slug)
            .param("title", title)
            .param("price", price)
            .update(keys, "id");
        return keys.getKeyAs(Long.class);
    }

    public int applyDiscount(int percent) {
        return jdbc.sql("update courses set price = round(price * (100 - :p) / 100.0, 2)")
            .param("p", percent)
            .update();
    }
}`,
        output: `findCheaperThan(2000) -> [CourseRow[id=3, slug=html, title=HTML, price=999.00], CourseRow[id=1, slug=java-core, title=Java - Core, price=1499.00]]
create("spring-ai", "Spring AI", 2999) -> 12
applyDiscount(10) -> 12 rows updated`,
      },
      {
        caption: 'Custom row mapping and aggregate queries',
        code: `public record RevenueByCourse(String title, long orders, BigDecimal revenue) {}

public List<RevenueByCourse> revenueReport(LocalDate from) {
    return jdbc.sql("""
            select c.title, count(o.id) as orders, sum(o.amount) as revenue
            from orders o join courses c on c.id = o.course_id
            where o.created_at >= :from
            group by c.title
            order by revenue desc
            """)
        .param("from", from)
        .query((rs, rowNum) -> new RevenueByCourse(
            rs.getString("title"), rs.getLong("orders"), rs.getBigDecimal("revenue")))
        .list();
}`,
        output: `RevenueByCourse[title=Spring Boot, orders=412, revenue=1235588.00]
RevenueByCourse[title=Java - Core, orders=390, revenue=584610.00]`,
      },
      {
        caption: 'Spring Data JDBC aggregate and repository',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jdbc</artifactId>
</dependency>

@Table("purchase_order")
public record PurchaseOrder(
        @Id Long id,
        AggregateReference<Customer, Long> customer,   // reference to another aggregate by id
        String status,
        @MappedCollection(idColumn = "purchase_order_id", keyColumn = "line_no")
        List<OrderLine> lines) {

    public PurchaseOrder withStatus(String newStatus) {
        return new PurchaseOrder(id, customer, newStatus, lines);
    }
}

@Table("order_line")
public record OrderLine(String product, int quantity) {}

public interface PurchaseOrderRepository extends ListCrudRepository<PurchaseOrder, Long> {

    List<PurchaseOrder> findByStatus(String status);

    @Modifying
    @Query("update purchase_order set status = :status where id = :id")
    boolean updateStatus(Long id, String status);
}

// usage
PurchaseOrder saved = repo.save(new PurchaseOrder(null, AggregateReference.to(7L), "NEW",
        List.of(new OrderLine("Spring Boot course", 1), new OrderLine("Workbook", 2))));
repo.save(saved.withStatus("PAID"));`,
        output: `INSERT INTO purchase_order (customer, status) VALUES (7, 'NEW')
INSERT INTO order_line (purchase_order_id, line_no, product, quantity) VALUES (1, 0, 'Spring Boot course', 1)
INSERT INTO order_line (purchase_order_id, line_no, product, quantity) VALUES (1, 1, 'Workbook', 2)
UPDATE purchase_order SET customer = 7, status = 'PAID' WHERE id = 1
DELETE FROM order_line WHERE purchase_order_id = 1
INSERT INTO order_line ... (lines are rewritten because the aggregate is saved as a whole)`,
      },
    ],
    commonMistakes: [
      'Concatenating values into SQL strings instead of using :named parameters.',
      'Expecting Spring Data JDBC to lazy-load or track changes like JPA; you must call save() explicitly.',
      'Modelling huge aggregates in Spring Data JDBC, so every save rewrites hundreds of child rows.',
      'Using .single() when zero rows are possible; use .optional() instead.',
      'Mixing JdbcClient writes with JPA entities in the same transaction without flushing, so JPA does not see changes yet.',
    ],
    keyPoints: [
      'JdbcClient is the fluent, auto-configured API for SQL with named parameters and record mapping.',
      'Use KeyHolder for generated keys and batch APIs for bulk inserts.',
      'Spring Data JDBC offers repositories for aggregates with predictable, explicit SQL.',
      'References between aggregates use AggregateReference ids, not object links.',
      'Choose JPA for rich models, Spring Data JDBC for simple aggregates, JdbcClient for custom SQL.',
    ],
  },

  'spring-data-mongodb': {
    title: 'Spring Data MongoDB',
    intro: `Not all data fits neatly into tables. Product catalogues where each category has different attributes, user activity feeds, content management systems and event logs are often a better fit for a <strong>document database</strong> such as MongoDB, which stores flexible JSON-like documents.

Spring Data MongoDB gives you the same repository programming model you know from JPA — derived queries, pagination, auditing — plus <code>MongoTemplate</code> for advanced queries and aggregation pipelines. This lesson covers modelling documents, repositories, queries, aggregations, indexes and testing with Testcontainers.`,
    sections: [
      {
        heading: 'Documents vs Rows',
        body: `A MongoDB <strong>document</strong> is a BSON (binary JSON) object stored in a <strong>collection</strong>. Documents in one collection can have different fields, and can embed arrays and sub-documents. Instead of joining tables, you usually <strong>embed</strong> data that is read together (an order's line items inside the order) and <strong>reference</strong> data that is shared or grows unbounded (the customer, by id). Design documents around your application's read patterns.`,
      },
      {
        heading: 'Setup and Mapping',
        body: `Add <code>spring-boot-starter-data-mongodb</code> and set <code>spring.mongodb.uri</code> (with Docker Compose or Testcontainers this is configured automatically). Annotate classes or records with <code>@Document</code>; use <code>@Id</code> for the identifier (a String maps to MongoDB's ObjectId), <code>@Field</code> to rename fields and <code>@Indexed</code> for indexes. Enable automatic index creation in development, and manage indexes explicitly in production.`,
      },
      {
        heading: 'Repositories and Queries',
        body: `<code>MongoRepository</code> supports CRUD, derived queries (<code>findByCategoryAndPriceLessThan</code>), paging and sorting. <code>@Query</code> accepts MongoDB JSON query syntax. For dynamic queries, updates of individual fields, and aggregations, inject <code>MongoTemplate</code> and use the <code>Query</code>, <code>Criteria</code>, <code>Update</code> and <code>Aggregation</code> builders.`,
      },
      {
        heading: 'Aggregation Pipelines',
        body: `MongoDB's aggregation framework processes documents through stages — <code>$match</code>, <code>$group</code>, <code>$sort</code>, <code>$project</code>, <code>$unwind</code>, <code>$lookup</code> — similar to SQL's WHERE, GROUP BY and JOIN. Spring's <code>Aggregation</code> API builds pipelines type-safely and maps results to records.`,
      },
      {
        heading: 'Transactions and Consistency',
        body: `Single-document writes in MongoDB are always atomic, which is why embedding related data is powerful. Multi-document transactions are supported on replica sets; enable them with a <code>MongoTransactionManager</code> bean and use <code>@Transactional</code> as usual — but design to need them rarely.`,
      },
    ],
    examples: [
      {
        caption: 'Setup and a document model with embedded data',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>

# application.yml
spring:
  mongodb:
    uri: mongodb://localhost:27017/webnest

@Document(collection = "products")
public record Product(
        @Id String id,
        @Indexed(unique = true) String sku,
        String name,
        String category,
        BigDecimal price,
        List<String> tags,
        Map<String, Object> attributes,     // flexible per-category attributes
        List<Review> reviews) {}            // embedded sub-documents

public record Review(String user, int rating, String comment, Instant createdAt) {}`,
        output: `db.products.findOne()
{ _id: ObjectId("66f6..."), sku: "HD-NAVY-M", name: "Webnest Hoodie", category: "apparel",
  price: Decimal128("1299.00"), tags: ["hoodie", "merch"],
  attributes: { size: "M", color: "navy" },
  reviews: [ { user: "asha", rating: 5, comment: "Very warm", createdAt: ISODate("2026-09-20T10:00:00Z") } ] }`,
      },
      {
        caption: 'Repository with derived queries, JSON @Query and paging',
        code: `public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findByCategoryAndPriceLessThanOrderByPriceAsc(String category, BigDecimal max);

    Page<Product> findByTagsContaining(String tag, Pageable pageable);

    @Query("{ 'attributes.color': ?0, 'price': { $lte: ?1 } }")
    List<Product> findByColorUpTo(String color, BigDecimal max);

    Optional<Product> findBySku(String sku);
}

productRepository.findByCategoryAndPriceLessThanOrderByPriceAsc("apparel", new BigDecimal("1500"))
    .forEach(p -> System.out.println(p.name() + " " + p.price()));`,
        output: `Webnest Cap 499.00
Webnest Tee 799.00
Webnest Hoodie 1299.00`,
      },
      {
        caption: 'MongoTemplate: partial updates and an aggregation pipeline',
        code: `@Service
public class ProductAnalytics {

    private final MongoTemplate mongo;

    public ProductAnalytics(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    // Append a review atomically without loading the whole document
    public void addReview(String sku, Review review) {
        mongo.updateFirst(
            Query.query(Criteria.where("sku").is(sku)),
            new Update().push("reviews", review),
            Product.class);
    }

    public record CategoryRating(String category, double avgRating, long reviews) {}

    public List<CategoryRating> ratingsByCategory() {
        Aggregation pipeline = Aggregation.newAggregation(
            Aggregation.unwind("reviews"),
            Aggregation.group("category")
                .avg("reviews.rating").as("avgRating")
                .count().as("reviews"),
            Aggregation.project("avgRating", "reviews").and("_id").as("category"),
            Aggregation.sort(Sort.Direction.DESC, "avgRating"));
        return mongo.aggregate(pipeline, "products", CategoryRating.class).getMappedResults();
    }
}`,
        output: `addReview("HD-NAVY-M", ...) -> db.products.updateOne({sku:"HD-NAVY-M"}, {$push:{reviews:{...}}})

ratingsByCategory()
[CategoryRating[category=books, avgRating=4.7, reviews=128],
 CategoryRating[category=apparel, avgRating=4.4, reviews=96]]`,
      },
      {
        caption: 'Integration test with a MongoDB container',
        code: `@DataMongoTest
@Testcontainers
class ProductRepositoryTest {

    @Container
    @ServiceConnection
    static MongoDBContainer mongo = new MongoDBContainer("mongo:8");

    @Autowired ProductRepository repository;

    @Test
    void findsByColorAndMaxPrice() {
        repository.save(new Product(null, "TEE-RED-S", "Tee", "apparel", new BigDecimal("799"),
            List.of("tee"), Map.of("color", "red"), List.of()));

        assertThat(repository.findByColorUpTo("red", new BigDecimal("1000")))
            .extracting(Product::sku)
            .containsExactly("TEE-RED-S");
    }
}`,
        output: `ProductRepositoryTest > findsByColorAndMaxPrice() PASSED`,
      },
    ],
    commonMistakes: [
      'Copying a relational schema into MongoDB with a collection per table and many manual "joins".',
      'Embedding arrays that grow without limit (e.g. every page view inside a user document), eventually hitting the 16 MB document limit.',
      'Relying on auto-index-creation in production instead of managing indexes deliberately.',
      'Loading, modifying and saving whole documents for small changes, causing lost updates; use MongoTemplate atomic updates.',
      'Storing money as double instead of BigDecimal/Decimal128.',
    ],
    keyPoints: [
      'MongoDB stores flexible documents; embed data read together and reference shared data by id.',
      'spring-boot-starter-data-mongodb gives MongoRepository with derived queries and paging.',
      'MongoTemplate handles dynamic queries, atomic partial updates and aggregation pipelines.',
      'Single-document writes are atomic; use multi-document transactions sparingly.',
      'Test with @DataMongoTest and a MongoDBContainer connected via @ServiceConnection.',
    ],
  },
}
