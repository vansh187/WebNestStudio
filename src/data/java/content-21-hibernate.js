// Hibernate ORM module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content21Hibernate = {
  'hibernate-introduction-and-architecture': {
    title: 'Hibernate Introduction and Architecture',
    intro: `With plain JDBC, every table needs hand-written SQL and manual code to copy each <code>ResultSet</code> row into a Java object — repetitive, easy to get wrong, and tedious to keep in sync as a schema evolves. Hibernate is an <strong>Object-Relational Mapping (ORM)</strong> framework: you describe how a Java class maps to a database table once, and Hibernate generates the SQL for you, tracks which objects have changed, and handles relationships, caching, and lazy loading automatically.

Hibernate implements the JPA (Java Persistence API) specification and sits on top of JDBC — it still ultimately opens a JDBC <code>Connection</code> and runs SQL, but your application code works with plain Java objects ("entities") instead of raw rows and columns.`,
    sections: [
      {
        heading: 'The Core Architecture',
        body: `Four objects cooperate to move data between your Java objects and the database.`,
        list: [
          '<strong>Configuration</strong> — reads <code>hibernate.cfg.xml</code> (or Spring Boot properties) to learn the database connection details, dialect, and which classes are mapped entities.',
          '<strong>SessionFactory</strong> — a heavyweight, thread-safe object built once per application from the Configuration; it is expensive to create, so you build exactly one and reuse it for the life of the app.',
          '<strong>Session</strong> — a lightweight, single-threaded unit of work opened from the SessionFactory for each logical operation (e.g. one request); it wraps a JDBC connection and is <em>not</em> safe to share across threads.',
          '<strong>Transaction</strong> — wraps one or more operations on a Session so they commit or roll back together.',
        ],
      },
      {
        heading: 'Entities and the Persistence Context',
        body: `A class annotated <code>@Entity</code> maps to a table; its fields map to columns. Once an object is loaded or saved through a Session, it becomes <em>managed</em> — Hibernate keeps it in the Session's first-level cache (the "persistence context") and automatically detects field changes, writing the necessary <code>UPDATE</code> statement when the transaction commits, without you calling any explicit "save changes" method.`,
      },
      {
        heading: 'Hibernate vs. Plain JDBC',
        body: `JDBC gives full control over SQL but requires manual mapping and manual change-tracking. Hibernate trades a little of that control for dramatically less boilerplate: relationships, inheritance, caching, and dirty-checking are handled by the framework. Most production Spring applications use Hibernate through <strong>Spring Data JPA</strong> (see the Spring Boot and REST APIs module), which adds repository interfaces on top of the same underlying Hibernate engine.`,
      },
    ],
    examples: [
      {
        caption: 'Minimal Hibernate configuration and a mapped entity',
        code: `<!-- hibernate.cfg.xml -->
<hibernate-configuration>
  <session-factory>
    <property name="hibernate.connection.driver_class">com.mysql.cj.jdbc.Driver</property>
    <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/school</property>
    <property name="hibernate.connection.username">root</property>
    <property name="hibernate.connection.password">password</property>
    <property name="hibernate.dialect">org.hibernate.dialect.MySQLDialect</property>
    <property name="hibernate.hbm2ddl.auto">update</property>
    <mapping class="com.webnest.Student"/>
  </session-factory>
</hibernate-configuration>

// Student.java
import jakarta.persistence.*;

@Entity
@Table(name = "student")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "name", nullable = false)
    private String name;

    private int marks;

    // getters and setters
}`,
        output: `// Startup log (abridged):
Hibernate: create table student (id integer not null auto_increment, name varchar(255) not null, marks integer, primary key (id))`,
      },
    ],
    commonMistakes: [
      'Creating a new SessionFactory for every request — it is expensive to build and is meant to be created once and reused for the application\'s lifetime.',
      'Sharing a single Session across multiple threads — Session is not thread-safe; open a new one per unit of work.',
      'Setting <code>hibernate.hbm2ddl.auto=update</code> in production, letting Hibernate silently alter the live schema instead of using a controlled migration tool.',
      'Forgetting a no-argument constructor on an entity class — Hibernate requires one to instantiate entities via reflection.',
    ],
    keyPoints: [
      'Hibernate is an ORM: it maps Java classes to tables and generates SQL automatically.',
      'SessionFactory is built once (heavyweight); Session is opened per unit of work (lightweight, single-threaded).',
      'A managed entity is dirty-checked automatically — Hibernate detects field changes and writes the UPDATE for you.',
      'Hibernate still runs on top of JDBC; it trades some manual control for far less boilerplate.',
    ],
  },

  'entity-mapping-and-configuration': {
    title: 'Entity Mapping and Configuration',
    intro: `Mapping is the process of telling Hibernate exactly how a Java class and its fields correspond to a database table and its columns. Modern Hibernate uses JPA annotations directly on the entity class, which keeps the mapping next to the code it describes instead of in a separate XML file.`,
    sections: [
      {
        heading: 'Core Mapping Annotations',
        body: `A handful of annotations cover the majority of real-world mapping needs.`,
        list: [
          '<code>@Entity</code> — marks a class as a persistent entity; it must have a no-argument constructor and a primary key field.',
          '<code>@Table(name = "...")</code> — maps the class to a specific table name (optional; defaults to the class name).',
          '<code>@Id</code> — designates the primary key field.',
          '<code>@GeneratedValue(strategy = GenerationType.IDENTITY)</code> — lets the database auto-generate the primary key (e.g. <code>AUTO_INCREMENT</code>); other strategies include <code>SEQUENCE</code> and <code>TABLE</code>.',
          '<code>@Column(name = "...", nullable = false, unique = true, length = 100)</code> — customizes how a field maps to its column.',
          '<code>@Transient</code> — marks a field that should <strong>not</strong> be persisted at all (e.g. a computed, in-memory-only value).',
          '<code>@Enumerated(EnumType.STRING)</code> — stores a Java enum as readable text rather than its ordinal integer, which is safer against future reordering of enum constants.',
        ],
      },
      {
        heading: 'Primary Key Generation Strategies',
        body: `<code>IDENTITY</code> delegates key generation entirely to the database's auto-increment column — simple, but it means Hibernate cannot batch inserts efficiently, since it must ask the database for the generated id after each insert. <code>SEQUENCE</code> uses a database sequence object to pre-allocate ids, which allows efficient batching and is generally preferred for high-throughput inserts on databases that support sequences (PostgreSQL, Oracle). <code>TABLE</code> emulates a sequence using an ordinary table and is the most portable but slowest option, used mainly when a database supports neither identity columns nor sequences.`,
      },
      {
        heading: 'hbm2ddl.auto — Schema Generation Modes',
        body: `This property controls whether Hibernate touches your schema at startup: <code>validate</code> only checks the schema matches the entities and fails fast if not (the safest for production); <code>update</code> adds missing tables/columns without dropping data (convenient in early development, risky in production); <code>create</code> drops and recreates the schema on every startup (useful for tests); <code>create-drop</code> does the same but also drops everything on shutdown. Production systems typically use <code>validate</code> and manage real schema changes with a migration tool like Flyway or Liquibase instead.`,
      },
    ],
    examples: [
      {
        caption: 'A fully annotated entity showing common mapping options',
        code: `import jakarta.persistence.*;

@Entity
@Table(name = "employee", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "emp_seq")
    @SequenceGenerator(name = "emp_seq", sequenceName = "employee_seq", allocationSize = 1)
    private long id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Transient
    private int yearsOfServiceComputedAtRuntime; // never persisted

    public enum Status { ACTIVE, ON_LEAVE, TERMINATED }

    // getters and setters
}`,
        output: `Hibernate: insert into employee (full_name, email, status, id) values (?, ?, ?, ?)`,
      },
    ],
    commonMistakes: [
      'Storing enums with the default (ordinal) mapping instead of @Enumerated(EnumType.STRING) — reordering enum constants later silently corrupts existing data.',
      'Leaving hbm2ddl.auto=update or create enabled against a production database, risking accidental data loss.',
      'Forgetting @Column(nullable = false) and relying only on Java-level validation, leaving the database itself able to store invalid nulls.',
      'Mapping a field that should be computed at runtime without @Transient, causing Hibernate to try to persist it.',
    ],
    keyPoints: [
      '@Entity, @Table, @Id, and @GeneratedValue are the essential annotations for mapping a class to a table.',
      'GenerationType.IDENTITY is simple but limits insert batching; SEQUENCE allows efficient batched inserts on databases that support it.',
      'Always map enums with EnumType.STRING to avoid data corruption if enum ordering changes.',
      'Use hbm2ddl.auto=validate (or a dedicated migration tool) in production instead of letting Hibernate auto-alter the schema.',
    ],
  },

  'hibernate-relationships-one-to-one-one-to-many-many-to-many': {
    title: 'Hibernate Relationships: One-to-One, One-to-Many, Many-to-Many',
    intro: `Real schemas are rarely single, isolated tables — an Employee belongs to a Department, an Order has many OrderItems, and Students enroll in many Courses. Hibernate maps each kind of relationship with a dedicated annotation, and correctly choosing the "owning side" and fetch behavior for each one has a real impact on both correctness and performance.`,
    sections: [
      {
        heading: 'The Four Relationship Types',
        list: [
          '<strong>@OneToOne</strong> — exactly one row relates to exactly one other row (e.g. Employee ↔ Passport). The owning side holds the foreign key.',
          '<strong>@OneToMany</strong> — one row relates to many rows on the other side (e.g. Department → Employees). Usually paired with a <code>@ManyToOne</code> on the child, which is the actual owning side that holds the foreign key.',
          '<strong>@ManyToOne</strong> — many rows relate to one row (e.g. Employee → Department). This side owns the relationship and stores the foreign key column via <code>@JoinColumn</code>.',
          '<strong>@ManyToMany</strong> — many rows on each side relate to many rows on the other (e.g. Student ↔ Course), implemented through a join table containing both foreign keys.',
        ],
      },
      {
        heading: 'mappedBy — Avoiding a Duplicate Foreign Key',
        body: `When a relationship is bidirectional (both sides have a reference to each other), only one side should actually own the foreign key column; the other side declares <code>mappedBy</code> to say "the foreign key already lives over there, I'm just the inverse view." Without this, Hibernate can create a redundant join table or an incorrect second foreign key column.`,
      },
      {
        heading: 'Fetch Type: LAZY vs. EAGER',
        body: `<code>FetchType.LAZY</code> defers loading the related entity/collection until it is actually accessed in code — the default for collections, and generally the right choice, since it avoids pulling in data you may never use. <code>FetchType.EAGER</code> loads the association immediately along with the parent — the default for single-valued <code>@ManyToOne</code>/<code>@OneToOne</code> associations, but it should be used carefully, since eagerly loading a chain of associations can pull in far more data than intended (and is the classic cause of the "N+1 select problem").`,
      },
    ],
    examples: [
      {
        caption: 'One-to-Many / Many-to-One (Department ↔ Employee) and Many-to-Many (Student ↔ Course)',
        code: `@Entity
public class Department {
    @Id @GeneratedValue private long id;
    private String name;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Employee> employees = new ArrayList<>();
}

@Entity
public class Employee {
    @Id @GeneratedValue private long id;
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)     // owning side — holds the foreign key
    @JoinColumn(name = "department_id")
    private Department department;
}

@Entity
public class Student {
    @Id @GeneratedValue private long id;
    private String name;

    @ManyToMany
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id"))
    private Set<Course> courses = new HashSet<>();
}

@Entity
public class Course {
    @Id @GeneratedValue private long id;
    private String title;

    @ManyToMany(mappedBy = "courses")
    private Set<Student> students = new HashSet<>();
}`,
        output: `Hibernate: create table student_course (student_id bigint not null, course_id bigint not null, primary key (student_id, course_id))`,
      },
    ],
    commonMistakes: [
      'Putting @OneToMany without mappedBy on both sides of a bidirectional relationship, causing Hibernate to generate an unwanted extra join table.',
      'Defaulting every @ManyToOne to FetchType.EAGER out of convenience, silently pulling extra rows on every query that touches the parent entity.',
      'Forgetting cascade behavior on a @OneToMany parent, leaving child rows orphaned (or blocking deletes with a foreign key constraint) when the parent is removed.',
      'Using a List instead of a Set for a @ManyToMany collection when duplicate entries would be meaningless — a Set enforces uniqueness at the Java level.',
    ],
    keyPoints: [
      'The side holding the foreign key (usually @ManyToOne) is the owning side; the other side uses mappedBy.',
      '@ManyToMany is implemented via a join table containing both foreign keys.',
      'LAZY loading is the safer default for collections; EAGER can cause unnecessary or excessive data loading.',
      'Cascade settings control whether operations on the parent (like delete) automatically apply to related children.',
    ],
  },

  'hibernate-inheritance-mapping-strategies': {
    title: 'Hibernate Inheritance Mapping Strategies',
    intro: `Java supports class inheritance, but relational tables don't have a native concept of "subclass." Hibernate offers three strategies for mapping a Java inheritance hierarchy onto tables, each with a different trade-off between query simplicity, storage normalization, and performance.`,
    sections: [
      {
        heading: 'Table Per Hierarchy (Single Table)',
        body: `The default strategy: one table holds every class in the hierarchy, with a <strong>discriminator column</strong> recording which subclass each row represents. It is the fastest option — reading or querying across the whole hierarchy never requires a join — but columns unique to a particular subclass must be nullable, since a row for one subclass leaves the other subclasses' columns empty.`,
      },
      {
        heading: 'Table Per Concrete Class',
        body: `Each concrete subclass gets its own table containing <em>all</em> of its fields, including ones inherited from the parent — nothing is shared or joined. This avoids nullable columns entirely, but querying across the whole hierarchy (e.g. "all Payments regardless of subtype") requires a <code>UNION</code> across every subclass table, and there is no shared table to hold a truly common identity.`,
      },
      {
        heading: 'Table Per Subclass (Joined)',
        body: `Each class — including the abstract parent — gets its own table holding only its own fields, linked to the parent's table by a shared primary key (a foreign key that is also the primary key). This is the most normalized option and avoids nullable columns, but reading a full subclass object requires a join across as many tables as there are levels in the hierarchy, which can be slower for deep hierarchies or wide queries across the whole tree.`,
      },
    ],
    examples: [
      {
        caption: 'Table Per Hierarchy with a discriminator column',
        code: `@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "payment_type")
public abstract class Payment {
    @Id @GeneratedValue private long id;
    private double amount;
}

@Entity
@DiscriminatorValue("CREDIT_CARD")
public class CreditCardPayment extends Payment {
    private String cardNumber;
}

@Entity
@DiscriminatorValue("UPI")
public class UpiPayment extends Payment {
    private String upiId;
}

// Table Per Subclass instead, just change the strategy:
// @Inheritance(strategy = InheritanceType.JOINED)

// Table Per Concrete Class instead:
// @Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)`,
        output: `Hibernate: create table payment (payment_type varchar(31) not null, id bigint not null, amount double, card_number varchar(255), upi_id varchar(255), primary key (id))`,
      },
    ],
    commonMistakes: [
      'Choosing Table Per Hierarchy for a hierarchy with many subclass-specific, mutually exclusive fields, resulting in a very wide table full of nulls.',
      'Choosing Table Per Concrete Class and then needing hierarchy-wide queries, which forces expensive UNION operations across every subclass table.',
      'Forgetting @DiscriminatorValue, leaving Hibernate to fall back on the class name, which can break if classes are renamed later.',
      'Assuming Table Per Subclass has no cost — the joins it requires do add query overhead compared to a single-table read.',
    ],
    keyPoints: [
      'Table Per Hierarchy (SINGLE_TABLE): one table, fastest reads, nullable subclass-specific columns.',
      'Table Per Concrete Class (TABLE_PER_CLASS): one table per subclass, no nulls, but hierarchy-wide queries need UNIONs.',
      'Table Per Subclass (JOINED): normalized, no nulls, but reads require joins across parent/child tables.',
      'Pick the strategy based on how wide/shared the hierarchy\'s fields are and how often you query across the whole hierarchy.',
    ],
  },

  'hibernate-caching-first-level-and-second-level': {
    title: 'Hibernate Caching: First-Level and Second-Level',
    intro: `Repeatedly hitting the database for data that hasn't changed is wasted work. Hibernate has two built-in caching layers that reduce redundant SQL, each operating at a different scope.`,
    sections: [
      {
        heading: 'First-Level Cache (Session Cache)',
        body: `Always on, and scoped to a single <code>Session</code>. Within one Session, calling <code>session.get(Student.class, 1)</code> twice only issues one SQL query — the second call returns the same managed object straight from the Session's internal cache, without touching the database again. This cache is cleared automatically when the Session closes, so it never leaks data between unrelated units of work.`,
      },
      {
        heading: 'Second-Level Cache (SessionFactory Cache)',
        body: `Optional, and scoped to the whole <code>SessionFactory</code> — shared across every Session in the application, so entities cached by one user's request can be reused by another's. It requires a caching provider (commonly Ehcache or Caffeine) and must be explicitly enabled per entity with <code>@Cacheable</code>. Because it's shared, entries need a clear invalidation strategy so stale data isn't served after an update — Hibernate handles this automatically for entities it manages, evicting or updating cached entries when they change through Hibernate itself.`,
      },
      {
        heading: 'Query Cache',
        body: `A companion to the second-level cache that caches the <em>results of specific queries</em> (a list of ids matching a WHERE clause), not just individual entities. It only becomes useful once the second-level cache is enabled, since the query cache stores entity ids and relies on the second-level cache to supply the actual entity data for those ids.`,
      },
    ],
    examples: [
      {
        caption: 'Enabling the second-level cache for an entity (with Ehcache as the provider)',
        code: `<!-- Maven dependencies: hibernate-jcache + ehcache -->

<!-- hibernate.cfg.xml -->
<property name="hibernate.cache.use_second_level_cache">true</property>
<property name="hibernate.cache.region.factory_class">org.hibernate.cache.jcache.JCacheRegionFactory</property>

import jakarta.persistence.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

@Entity
@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Student {
    @Id @GeneratedValue private long id;
    private String name;
}

// First session: hits the database, then populates the 2nd-level cache
Student s1 = session1.get(Student.class, 1);

// A completely different, later session: served from the 2nd-level cache, no SQL executed
Student s2 = session2.get(Student.class, 1);`,
        output: `Hibernate: select * from student where id=? (only on the first session's load)`,
      },
    ],
    commonMistakes: [
      'Assuming the second-level cache is on by default — it requires an explicit provider dependency, configuration, and @Cacheable on each entity.',
      'Caching frequently-updated entities aggressively, causing readers to see stale data more often than the performance gain is worth.',
      'Confusing the first-level (always-on, per-Session) cache with the second-level (opt-in, shared) cache when reasoning about staleness.',
      'Enabling the query cache without enabling the second-level cache first, which produces little benefit since the query cache only stores ids.',
    ],
    keyPoints: [
      'First-level cache is automatic, scoped to one Session, and cannot be disabled.',
      'Second-level cache is optional, shared across the whole SessionFactory, and needs a provider like Ehcache plus @Cacheable per entity.',
      'The query cache stores query result ids and depends on the second-level cache for the actual entity data.',
      'Cache aggressively-read, rarely-changed entities; avoid caching data that changes often.',
    ],
  },

  'hql-and-the-criteria-api': {
    title: 'HQL and the Criteria API',
    intro: `Hibernate offers two ways to write queries beyond simple <code>get()</code>-by-id lookups: HQL, a SQL-like query language that operates on entity names and fields instead of table and column names, and the Criteria API, a type-safe, programmatic way to build queries without writing any query language as a string at all.`,
    sections: [
      {
        heading: 'HQL — Hibernate Query Language',
        body: `HQL looks like SQL but is database-independent: you write <code>from Student s where s.marks > :min</code>, referencing the entity class name and its Java field names, and Hibernate translates it into the correct SQL dialect for whatever database is configured. This means the same HQL runs unchanged whether the underlying database is MySQL, PostgreSQL, or Oracle.`,
        list: [
          'Named/positional parameters (<code>:min</code> or <code>?1</code>) protect against SQL injection, exactly like a JDBC PreparedStatement.',
          'HQL supports joins, aggregate functions, GROUP BY, and subqueries, all expressed in terms of entities and their associations rather than raw tables.',
          'Named queries (<code>@NamedQuery</code>) let you predefine and reuse an HQL string by name instead of rebuilding the string in application code every time.',
        ],
      },
      {
        heading: 'The Criteria API — Type-Safe Query Building',
        body: `Instead of a query string, the Criteria API builds a query object-by-object using the JPA <code>CriteriaBuilder</code>. Because it's built from Java code rather than a string, mistakes like a misspelled field name are caught by the compiler instead of surfacing as a runtime exception — this matters most for queries whose filters are assembled dynamically (e.g. an advanced search screen with several optional filters).`,
      },
      {
        heading: 'When to Use Which',
        body: `HQL is usually more concise and readable for fixed, known-shape queries. The Criteria API earns its extra verbosity when a query's structure changes based on runtime conditions — for example, adding a WHERE clause only if the user actually provided that filter — since building that dynamically with string concatenation in HQL is error-prone, while Criteria composes predicates as ordinary Java objects.`,
      },
    ],
    examples: [
      {
        caption: 'The same query written in HQL and with the Criteria API',
        code: `// HQL
Query<Student> q = session.createQuery(
    "from Student s where s.marks > :min order by s.marks desc", Student.class);
q.setParameter("min", 80);
List<Student> toppers = q.list();

// Criteria API — equivalent, fully type-safe
CriteriaBuilder cb = session.getCriteriaBuilder();
CriteriaQuery<Student> cq = cb.createQuery(Student.class);
Root<Student> root = cq.from(Student.class);

cq.select(root)
  .where(cb.greaterThan(root.get("marks"), 80))
  .orderBy(cb.desc(root.get("marks")));

List<Student> toppersCriteria = session.createQuery(cq).getResultList();`,
        output: `Hibernate: select s1_0.id, s1_0.marks, s1_0.name from student s1_0 where s1_0.marks>? order by s1_0.marks desc`,
      },
    ],
    commonMistakes: [
      'Concatenating raw user input directly into an HQL string instead of using named/positional parameters, reintroducing an injection risk.',
      'Confusing HQL entity/field names with actual table/column names — HQL always refers to the Java class and field names, not the SQL schema.',
      'Reaching for the Criteria API for every simple query, adding unnecessary verbosity where a one-line HQL string would be clearer.',
      'Forgetting that HQL is case-sensitive on entity and field names (since they map to real Java identifiers), unlike SQL keywords.',
    ],
    keyPoints: [
      'HQL is a database-independent, entity-oriented query language similar in shape to SQL.',
      'Always use HQL parameters instead of string concatenation to avoid injection risks.',
      'The Criteria API builds queries as type-safe Java objects, catching mistakes at compile time.',
      'Prefer HQL for fixed queries; prefer Criteria for queries whose structure varies dynamically at runtime.',
    ],
  },
}
