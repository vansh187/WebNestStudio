import { summarize } from '../lib/seo.js'
import { JAVA_LANGUAGE } from './codingLanguages.js'
export const JAVA_FILES = [{ name: 'Main.java', language: 'java', content: JAVA_LANGUAGE.defaultSnippet }]
export const WEB_FILES = [
  { name: 'index.html', language: 'html', content: '<main class="app">\n  <h1>Hello Webnest</h1>\n  <p>Edit the files, then run the preview.</p>\n  <button id="action">Click me</button>\n</main>' },
  { name: 'style.css', language: 'css', content: 'body {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  background: #f8fafc;\n  color: #111827;\n}\n\n.app {\n  max-width: 420px;\n  padding: 2rem;\n  border: 1px solid #dbe3ef;\n  border-radius: 8px;\n  background: white;\n}\n\nbutton {\n  border: 0;\n  border-radius: 8px;\n  padding: 0.75rem 1rem;\n  background: #111827;\n  color: white;\n  font-weight: 700;\n}' },
  { name: 'script.js', language: 'javascript', content: 'document.getElementById("action")?.addEventListener("click", () => {\n  console.log("Button clicked from Webnest CodeLab");\n});' },
]

export const PYTHON_FILES = [
  { name: 'main.py', language: 'python', content: 'print("Hello, Webnest!")\n' },
]

export const CODELAB_TRACKS = [
  { id: 'web', label: 'Web Development', runner: 'iframe' },
  { id: 'python', label: 'Python', runner: 'pyodide' },
]

import { JAVA_LESSON_CONTENT, JAVA_CORE_MODULES, ADVANCED_JAVA_MODULES } from './java/index.js'
import { TUTORIALS_BY_COURSE } from './tutorials/index.js'
import { renderLessonContent, firstExampleCode } from './lessons/render.js'

const TUTORIAL_LANGUAGE_LABEL = {
  java: 'Java',
  python: 'Python',
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  sql: 'SQL',
}

const TUTORIAL_CONTENT = {
  'java-core': JAVA_LESSON_CONTENT,
  'advanced-java': JAVA_LESSON_CONTENT,
  ...TUTORIALS_BY_COURSE,
}

export const SAMPLE_PROBLEMS = [
  {
    id: 'prob_python_sum',
    slug: 'python-list-sum',
    title: 'List Sum',
    track: 'python',
    language: 'python',
    difficulty: 'easy',
    topics: ['lists', 'loops'],
    points: 20,
    status: 'not_started',
    statement: 'Read space-separated numbers from input and print their sum.',
    starter_files: [{ name: 'main.py', language: 'python', content: 'nums = input().split()\nprint(sum(map(int, nums)))\n' }],
    examples: [{ input: '1 2 3\n', expected_output: '6\n' }],
    public_tests: [{ id: 'tc_public_1', input: '1 2 3\n', expected_output: '6\n', weight: 1 }],
  },
  {
    id: 'prob_web_card',
    slug: 'web-profile-card',
    title: 'Profile Card',
    track: 'web',
    language: 'web',
    difficulty: 'easy',
    topics: ['html', 'css'],
    points: 15,
    status: 'not_started',
    statement: 'Create a small profile card with a name, short bio, and a button.',
    starter_files: WEB_FILES,
    examples: [],
    public_tests: [],
  },
]

const STATIC_COURSE_DEFINITIONS = [
  {
    slug: 'java-core',
    title: 'Java - Core',
    level: 'basic to advanced',
    language: 'java',
    description: 'Complete Java foundation from syntax and JVM concepts to OOP, collections, streams, multithreading, testing, and production-ready habits.',
    sample: 'class Main {\n  public static void main(String[] args) {\n    String name = "Webnest";\n    int score = 95;\n    System.out.println(name + ": " + score);\n  }\n}\n',
    modules: JAVA_CORE_MODULES,
  },
  {
    slug: 'advanced-java',
    title: 'Advanced Java',
    level: 'intermediate to advanced',
    language: 'java',
    description: 'Server-side Java concepts for database access, web applications, deployment, concurrency, patterns, builds, logging, and testing.',
    sample: 'try (Connection connection = dataSource.getConnection()) {\n  PreparedStatement stmt = connection.prepareStatement("select id, name from users where active = ?");\n  stmt.setBoolean(1, true);\n  ResultSet rs = stmt.executeQuery();\n}\n',
    modules: ADVANCED_JAVA_MODULES,
  },
  {
    slug: 'spring-framework',
    title: 'Spring Framework',
    level: 'intermediate to advanced',
    language: 'java',
    description: 'Core Spring for dependency injection, application architecture, MVC, validation, AOP, transactions, data access, and tests.',
    sample: '@Service\nclass InvoiceService {\n  private final InvoiceRepository repository;\n\n  InvoiceService(InvoiceRepository repository) {\n    this.repository = repository;\n  }\n}\n',
    modules: [
      ['Getting Started and Installation', ['Spring Framework Overview and Modules', 'Installing the JDK on Windows, macOS and Linux', 'Installing Maven and Gradle', 'Setting Up Your IDE for Spring', 'Setting up a Spring project', 'Creating a Project with Spring Initializr', 'Your First Spring Application', 'Your First Spring Boot Web Application', 'Running, Packaging and Troubleshooting Spring Applications']],
      ['Spring Container', ['IoC and Dependency Injection', 'beans', 'application context', 'component scanning', 'configuration']],
      ['Bean and Runtime Management', ['bean lifecycle', 'profiles', 'events', 'resource handling']],
      ['Web and Cross-Cutting Concerns', ['Spring MVC', 'validation', 'exception handling', 'AOP']],
      ['Data and Quality', ['Spring Data fundamentals', 'transactions', 'testing', 'Spring reactive programming overview']],
    ],
  },
  {
    slug: 'spring-boot',
    title: 'Spring Boot',
    level: 'intermediate to advanced',
    language: 'java',
    description: 'Practical Spring Boot for REST APIs, configuration, data persistence, validation, security concepts, observability, testing, Docker, and deployment.',
    sample: '@RestController\n@RequestMapping("/api/users")\nclass UserController {\n  @GetMapping\n  List<UserDto> listUsers() {\n    return List.of(new UserDto("Asha"));\n  }\n}\n',
    modules: [
      ['Getting Started with Spring Boot', ['Spring vs Spring Boot vs Spring MVC', 'Project setup', 'What is new in Spring Boot 4', 'Dependency management and the starter parent', 'starters', 'Spring Boot annotations reference', 'auto-configuration', 'configuration properties', 'Application properties and common settings', 'profiles', 'Spring Boot DevTools', 'Application startup: runners and lifecycle events', 'Multi-module projects', 'Packaging and deployment: JAR, WAR and external Tomcat', 'Creating a custom starter']],
      ['Aspect-Oriented Programming (AOP)', ['Aspect-oriented programming (AOP) with Spring Boot', 'AOP advice types: before, after, around, after returning and after throwing']],
      ['Building REST APIs and Web Apps', ['REST APIs', 'Request mapping and parameters', 'DTOs', 'JSON with Jackson 3', 'validation', 'exception handling', 'File upload and download', 'API versioning', 'Filters and interceptors', 'Content negotiation: JSON and XML', 'Filtering API responses: static and dynamic', 'Internationalization (i18n)', 'Spring HATEOAS', 'OpenAPI', 'Server-side rendering with Thymeleaf', 'REST API best practices and the Richardson Maturity Model']],
      ['Calling Other Services', ['RestClient', 'HTTP service clients with @HttpExchange']],
      ['Data Access and Persistence', ['Spring Data JPA', 'H2 database and a complete CRUD application', 'Connecting to PostgreSQL and MySQL', 'Hibernate', 'Entity relationships in depth', 'Custom queries and projections', 'pagination', 'Transactions in Spring Boot', 'Database migrations with Flyway and Liquibase', 'Solving the N+1 problem', 'Auditing, optimistic locking and soft deletes', 'JdbcClient and Spring Data JDBC', 'Spring Data MongoDB']],
      ['Caching and Redis', ['Caching with Spring Cache', 'Redis with Spring Boot']],
      ['Spring Security', ['security concepts', 'JWT concepts', 'Spring Security architecture and the filter chain', 'Authentication with users and roles', 'Password encoding', 'Authorization rules and method security', 'JWT authentication with OAuth2 Resource Server', 'OAuth2 login with Google and GitHub', 'Spring Authorization Server', 'CSRF and CORS in Spring Security', 'Passkeys and one-time token login', 'Testing secured endpoints', 'Security hardening checklist']],
      ['Spring AI', ['Introduction to Spring AI', 'ChatClient and prompt templates', 'Structured output', 'Chat memory', 'Tool calling', 'Embeddings and vector stores', 'Retrieval Augmented Generation (RAG)', 'Model Context Protocol (MCP) servers and clients', 'Running local models with Ollama', 'Testing and observing AI applications']],
      ['Messaging and Async Processing', ['Async processing with @Async', 'Scheduling tasks with @Scheduled', 'Spring application events', 'Apache Kafka with Spring Boot', 'RabbitMQ with Spring Boot', 'Sending email', 'WebSockets and STOMP']],
      ['Reactive Spring Boot', ['Reactive programming with Project Reactor', 'Spring WebFlux', 'WebClient', 'R2DBC: reactive database access']],
      ['Testing Spring Boot Applications', ['testing', 'Unit testing with JUnit and Mockito', 'Web layer tests with @WebMvcTest', 'Data layer tests with @DataJpaTest', 'Integration tests with Testcontainers']],
      ['Production Readiness and Observability', ['Actuator', 'Health checks, readiness and liveness probes', 'logging', 'Structured logging', 'Metrics with Micrometer and Prometheus', 'Distributed tracing with OpenTelemetry', 'Resilience: retries, rate limits and circuit breakers', 'Virtual threads in Spring Boot', 'production configuration']],
      ['Deployment', ['Docker/deployment concepts', 'Building container images with Buildpacks', 'Spring Boot 3 and GraalVM native images', 'Deploying to Kubernetes', 'CI/CD with GitHub Actions']],
      ['Microservices with Spring Cloud', ['Microservices architecture with Spring Boot', 'Centralized configuration with Spring Cloud Config', 'Service discovery with Eureka and load balancing', 'API gateway with Spring Cloud Gateway', 'Event-driven microservices with Spring Cloud Stream', 'Distributed transactions and the saga pattern']],
      ['Advanced Spring Boot', ['Modular monoliths with Spring Modulith', 'Batch processing with Spring Batch', 'GraphQL with Spring Boot', 'gRPC with Spring Boot']],
      ['Projects and Interview Preparation', ['Capstone project: building a production-ready course platform API', 'Spring Boot interview questions and answers']],
    ],
  },
  {
    slug: 'python',
    title: 'Python',
    level: 'basic to advanced',
    language: 'python',
    description: 'Python from syntax and data structures to OOP, modules, decorators, testing, JSON, APIs, virtual environments, and introductory data handling.',
    sample: 'name = "Webnest"\nscore = 95\nprint(f"{name}: {score}")\n',
    modules: [
      ['Getting Started with Python', ['Introduction to Python', 'Setting up the Python environment', 'Python IDEs and tools', 'Hello World program', 'Syntax', 'Keywords and identifiers', 'Comments and docstrings', 'Input and output']],
      ['Variables and Data Types', ['variables', 'data types', 'Literals', 'Numbers and math', 'Booleans and None', 'Type casting', 'operators']],
      ['Control Flow', ['control flow', 'Conditional statements and match', 'Loops: for and while', 'break, continue and pass']],
      ['Strings', ['strings', 'String methods reference', 'String formatting']],
      ['Data Structures', ['lists/tuples/sets/dictionaries', 'Lists and list methods', 'Tuples and tuple methods', 'Sets and set methods', 'Dictionaries and dictionary methods', 'Choosing the right data structure', 'comprehensions', 'Arrays, stacks and queues', 'The collections module']],
      ['Functions', ['functions', 'Function arguments', 'Lambda functions', 'Higher-order functions: map, filter and reduce', 'Recursion', 'Scope, closures and namespaces', 'Built-in functions reference']],
      ['Object-Oriented Programming', ['OOP', 'Classes and objects', 'Constructors and the __init__ method', 'Instance, class and static methods', 'Inheritance', 'Polymorphism and method overriding', 'Method overloading in Python', 'Encapsulation and access modifiers', 'Abstraction and abstract base classes', 'Magic methods and operator overloading', 'Properties and descriptors', 'Dataclasses', 'Enums', 'Composition vs inheritance', 'Design patterns in Python']],
      ['Modules and Packages', ['modules', 'packages', 'standard library', 'math, random and statistics modules', 'os, sys and pathlib', 'Command-line arguments', 'virtual environments', 'pip and dependency management']],
      ['Exception Handling and Debugging', ['exceptions', 'Handling multiple exceptions and finally', 'Raising and custom exceptions', 'Built-in exceptions reference', 'Assertions and debugging', 'Logging']],
      ['File Handling', ['files', 'CSV files', 'Excel files', 'JSON', 'context managers']],
      ['Database Connectivity', ['Database connectivity with sqlite3', 'CRUD operations with sqlite3', 'Transactions and SQL injection', 'Connecting to MySQL', 'Connecting to PostgreSQL', 'SQLAlchemy ORM', 'MongoDB with PyMongo']],
      ['Advanced Language Features', ['iterators/generators', 'decorators', 'type hints', 'itertools and functools', 'Regular expressions', 'Date and time', 'async programming with asyncio', 'Multithreading', 'Multiprocessing']],
      ['Algorithms and Classic Programs', ['Searching algorithms', 'Sorting algorithms', 'Classic Python programs']],
      ['Practical Python', ['testing', 'HTTP/API basics', 'introductory data handling']],
      ['Web Development with FastAPI', ['Introduction to FastAPI', 'Path and query parameters', 'Request body and Pydantic models', 'Response models, status codes and errors', 'Dependency injection and routers', 'FastAPI with a database', 'Authentication with OAuth2 and JWT', 'Middleware, background tasks and WebSockets', 'Testing FastAPI applications', 'Deploying FastAPI applications', 'Flask basics']],
      ['Data Analysis with NumPy and pandas', ['Introduction to NumPy', 'NumPy indexing and array operations', 'NumPy for math, statistics and linear algebra', 'Introduction to pandas', 'Selecting and filtering data with pandas', 'Cleaning data with pandas', 'Grouping, merging and pivoting in pandas', 'Data visualization with matplotlib', 'Exploratory data analysis project']],
      ['Machine Learning Basics', ['Introduction to machine learning', 'Linear regression with scikit-learn', 'Classification with scikit-learn', 'Data preprocessing and pipelines', 'Model evaluation and hyperparameter tuning', 'Clustering with k-means', 'Saving and deploying ML models']],
    ],
  },
  {
    slug: 'html',
    title: 'HTML',
    level: 'basic to advanced',
    language: 'html',
    description: 'Semantic HTML for accessible, searchable, well-structured web pages, forms, media, metadata, iframes, and SEO-ready documents.',
    sample: '<main>\n  <h1>Webnest Studio</h1>\n  <p>Build accessible web pages with semantic HTML.</p>\n  <a href="/learn">Start learning</a>\n</main>\n',
    modules: [
      ['Document Structure', ['Setting up your editor and browser DevTools', 'Document structure', 'semantic HTML', 'headings', 'links', 'metadata']],
      ['Content Elements', ['images', 'lists', 'tables', 'media', 'iframe concepts']],
      ['Forms and Inputs', ['forms', 'inputs', 'validation']],
      ['Quality and Publishing', ['accessibility', 'SEO basics', 'best practices', 'web components basics']],
    ],
  },
  {
    slug: 'css',
    title: 'CSS',
    level: 'basic to advanced',
    language: 'css',
    description: 'CSS from selectors and the box model to responsive layouts, Flexbox, Grid, animation, architecture, and accessibility.',
    sample: '.card {\n  display: grid;\n  gap: 12px;\n  max-width: 420px;\n  padding: 24px;\n  border: 1px solid #dbe3ef;\n  border-radius: 8px;\n}\n',
    modules: [
      ['CSS Foundations', ['Setting up a CSS workflow', 'Selectors', 'cascade', 'specificity', 'box model', 'units', 'typography']],
      ['Layout Systems', ['positioning', 'display', 'Flexbox', 'Grid', 'responsive design', 'media queries']],
      ['Design Tokens and Motion', ['variables', 'transitions', 'transforms', 'animations', 'pseudo classes/elements']],
      ['Maintainable CSS', ['architecture', 'accessibility', 'container queries']],
    ],
  },
  {
    slug: 'javascript',
    title: 'JavaScript',
    level: 'basic to advanced',
    language: 'javascript',
    description: 'JavaScript for dynamic UIs, browser APIs, async programming, modules, storage, debugging, classes, and testing fundamentals.',
    sample: 'const name = "Webnest";\nconst score = 95;\nconsole.log(`${name}: ${score}`);\n',
    modules: [
      ['Language Basics', ['Setting up a JavaScript environment', 'Syntax', 'variables', 'types', 'functions', 'arrays/objects']],
      ['Runtime Concepts', ['scope', 'closures', 'classes', 'modern ES features', 'event loop concepts']],
      ['Browser Programming', ['DOM', 'events', 'modules', 'local storage']],
      ['Async and APIs', ['promises', 'async/await', 'fetch', 'error handling']],
      ['Professional JavaScript', ['debugging', 'testing fundamentals', 'introduction to TypeScript']],
    ],
  },
  {
    slug: 'react',
    title: 'React',
    level: 'basic to advanced',
    language: 'javascript',
    description: 'React from JSX and components to hooks, routing, API integration, state management concepts, performance, error boundaries, testing, and deployment.',
    sample: 'function WelcomeCard({ name }) {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>Hello {name}: {count}</button>;\n}\n',
    modules: [
      ['React Basics', ['Setting up a React project', 'JSX', 'components', 'props', 'state', 'events', 'conditional rendering', 'lists/keys']],
      ['Forms and Hooks', ['forms', 'hooks', 'useEffect', 'useMemo/useCallback concepts', 'custom hooks']],
      ['App Architecture', ['context', 'routing', 'API integration', 'state management concepts']],
      ['Production React', ['performance', 'error boundaries', 'testing', 'deployment', 'TypeScript in React']],
    ],
  },
  {
    slug: 'database-sql',
    title: 'Database and SQL',
    level: 'basic to advanced',
    language: 'sql',
    description: 'Relational database fundamentals, SQL querying, schema design, joins, indexes, transactions, security, and optimization.',
    sample: 'select department, count(*) as total_users\nfrom users\nwhere active = true\ngroup by department\norder by total_users desc;\n',
    modules: [
      ['Database Foundations', ['Setting up a local database for practice', 'Database fundamentals', 'relational model', 'tables/rows/columns', 'keys', 'constraints']],
      ['Schema Thinking', ['normalization', 'ER modelling']],
      ['SQL Querying', ['SQL CRUD', 'filtering', 'joins', 'grouping', 'subqueries', 'views']],
      ['Performance and Reliability', ['indexes', 'transactions', 'ACID', 'isolation', 'locking concepts', 'query optimization']],
      ['Advanced and Secure SQL', ['stored procedures concepts', 'security']],
    ],
  },
  {
    slug: 'postgresql',
    title: 'PostgreSQL',
    level: 'intermediate to advanced',
    language: 'sql',
    description: 'PostgreSQL-specific schema design, data types, JSONB, arrays, indexes, CTEs, window functions, transactions, roles, plans, and backup concepts.',
    sample: 'with active_users as (\n  select id, name, created_at from users where active = true\n)\nselect name, row_number() over (order by created_at) as signup_rank\nfrom active_users;\n',
    modules: [
      ['PostgreSQL Foundations', ['PostgreSQL setup concepts', 'data types', 'schemas', 'sequences/identity']],
      ['PostgreSQL Data Modeling', ['JSON/JSONB', 'arrays', 'practical schema design']],
      ['Query Power Tools', ['indexes', 'CTEs', 'window functions', 'functions']],
      ['Operations and Security', ['transactions', 'roles/permissions', 'explain plans', 'performance basics', 'backup/restore concepts']],
    ],
  },
  {
    slug: 'database-design',
    title: 'Database Design',
    level: 'basic to advanced',
    language: 'sql',
    description: 'Requirement-to-schema design for reliable, scalable, API-oriented databases with integrity, migrations, indexing, auditability, and clear naming.',
    sample: 'create table orders (\n  id bigserial primary key,\n  user_id bigint not null references users(id),\n  status text not null,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n',
    modules: [
      ['From Requirements to Model', ['Tools for database design (ERD software)', 'Requirement-to-schema workflow', 'entities', 'relationships', 'cardinality']],
      ['Schema Quality', ['normalization/denormalization trade-offs', 'naming standards', 'data integrity']],
      ['Operational Design', ['audit fields', 'soft delete', 'versioning', 'migration strategy']],
      ['Scale and API Design', ['indexing strategy', 'scalable API-oriented database design']],
    ],
  },
]

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function lessonId(courseSlug, topic) {
  return `lesson_${courseSlug.replaceAll('-', '_')}_${slugify(topic).replaceAll('-', '_')}`
}

function codeBlock(code) {
  return String(code || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function topicExample(course, topic) {
  const t = topic.toLowerCase()
  if (course.language === 'python') {
    if (t.includes('function')) return 'def greet(name):\n    return f"Hello, {name}"\n\nprint(greet("Webnest"))\n'
    if (t.includes('list') || t.includes('dictionary') || t.includes('data')) return 'student = {"name": "Asha", "scores": [90, 95, 98]}\nprint(student["name"], max(student["scores"]))\n'
    if (t.includes('file')) return 'with open("notes.txt", "w", encoding="utf-8") as file:\n    file.write("Learn deeply")\n'
    return course.sample
  }
  if (course.language === 'java' && t.includes('database connectivity')) {
    return 'try (Connection connection = DriverManager.getConnection(url, username, password);\n     PreparedStatement statement = connection.prepareStatement("select id, name from users where active = ?")) {\n  statement.setBoolean(1, true);\n  try (ResultSet resultSet = statement.executeQuery()) {\n    while (resultSet.next()) {\n      System.out.println(resultSet.getLong("id") + " " + resultSet.getString("name"));\n    }\n  }\n}\n'
  }
  if (course.language === 'javascript') {
    if (t.includes('react') || course.slug === 'react') return course.sample
    if (t.includes('async') || t.includes('promise') || t.includes('fetch')) return 'async function loadUser() {\n  const response = await fetch("/api/users/1");\n  if (!response.ok) throw new Error("Request failed");\n  return response.json();\n}\n'
    if (t.includes('dom') || t.includes('event')) return 'document.querySelector("button")?.addEventListener("click", () => {\n  console.log("Clicked");\n});\n'
    return course.sample
  }
  if (course.language === 'sql') {
    if (t.includes('join')) return 'select orders.id, users.name\nfrom orders\njoin users on users.id = orders.user_id;\n'
    if (t.includes('index')) return 'create index idx_orders_user_created on orders(user_id, created_at desc);\n'
    if (t.includes('transaction')) return 'begin;\nupdate accounts set balance = balance - 100 where id = 1;\nupdate accounts set balance = balance + 100 where id = 2;\ncommit;\n'
    return course.sample
  }
  if (course.language === 'html') return course.sample
  if (course.language === 'css') return course.sample
  return course.sample
}

function detailFor(course, topic) {
  const t = topic.toLowerCase()
  const base = `${topic} is a required part of ${course.title} because it changes how you read, write, debug, and design real software. Learn the concept first, then the syntax, then the trade-offs. A senior developer does not memorize isolated commands; they understand when a feature is useful, what failure modes it has, and how it affects maintainability, performance, security, and teamwork.`
  if (t.includes('oop') || t.includes('class') || t.includes('inheritance') || t.includes('polymorphism') || t.includes('abstraction') || t.includes('interface')) {
    return `${base} In object-oriented work, focus on responsibility boundaries: what data an object owns, what behavior it exposes, and what details it hides. Good OOP reduces coupling; poor OOP creates large objects, deep inheritance, and fragile code. Prefer clear composition, small interfaces, and names that describe business meaning.`
  }
  if (t.includes('transaction') || t.includes('acid') || t.includes('isolation') || t.includes('locking')) {
    return `${base} Transaction topics are about correctness when many users or processes change data at the same time. Study atomicity, rollback behavior, isolation levels, lock duration, deadlocks, retries, and idempotency. In production, transaction design protects money, inventory, permissions, orders, and any data that must not drift.`
  }
  if (t.includes('security') || t.includes('jwt') || t.includes('roles') || t.includes('permissions')) {
    return `${base} Security topics must be learned defensively. Understand authentication, authorization, trust boundaries, token lifetime, least privilege, input validation, sensitive logging, and failure messages. A feature is not complete until unauthorized users cannot access or mutate protected data.`
  }
  if (t.includes('testing') || t.includes('debugging')) {
    return `${base} Testing and debugging are feedback systems. Learn how to isolate behavior, create small reproducible cases, assert outcomes, and read errors calmly. Strong tests describe the contract of the code; good debugging narrows the search space instead of guessing randomly.`
  }
  if (t.includes('api') || t.includes('rest') || t.includes('http') || t.includes('fetch') || t.includes('servlet') || t.includes('mvc')) {
    return `${base} API and web topics are about contracts between clients and servers. Pay attention to request shape, response shape, status codes, validation, pagination, errors, authentication, versioning, and observability. A good API is predictable, documented, and hard to misuse.`
  }
  if (t.includes('database connectivity') || t.includes('jdbc')) {
    return `${base} Database connectivity is the bridge between application logic and durable data. Learn how connections are opened, reused, closed, and protected. Use parameterized statements instead of string-built SQL, understand transaction boundaries, handle checked exceptions cleanly, and keep database code separated from UI or controller code. In production Java, connection pooling, timeouts, retries, migrations, logging, and safe credential management matter as much as the query itself.`
  }
  if (t.includes('index') || t.includes('performance') || t.includes('optimization') || t.includes('explain')) {
    return `${base} Performance topics require measurement before conclusions. Learn what work the runtime or database is doing, how data is accessed, what can be cached, and what makes operations expensive. Indexes, query plans, rendering performance, memory use, and network timing should be understood with evidence, not assumptions.`
  }
  if (t.includes('async') || t.includes('promise') || t.includes('concurrency') || t.includes('thread') || t.includes('multithreading')) {
    return `${base} Concurrency and async topics are about work that does not happen in a simple straight line. Study scheduling, shared state, race conditions, cancellation, timeouts, backpressure, and error propagation. The goal is responsive software that remains predictable under load.`
  }
  if (t.includes('schema') || t.includes('normalization') || t.includes('relationship') || t.includes('entity') || t.includes('cardinality')) {
    return `${base} Data modeling topics turn real-world requirements into durable structure. Identify entities, relationships, ownership, uniqueness, optional fields, lifecycle, history, and reporting needs. Good schema design prevents invalid states instead of relying only on application code to clean them up later.`
  }
  if (t.includes('accessibility') || t.includes('semantic') || t.includes('seo') || t.includes('metadata')) {
    return `${base} Web quality topics affect real users and discoverability. Semantic structure helps assistive technology, search engines, maintainers, and automated tests. Think in document meaning first, then visual appearance, and verify that keyboard and screen-reader users can complete the same tasks.`
  }
  if (t.includes('layout') || t.includes('grid') || t.includes('flexbox') || t.includes('responsive') || t.includes('media quer')) {
    return `${base} Layout topics are about designing rules that survive different screen sizes and content lengths. Use constraints, spacing systems, wrapping behavior, and internal scrolling deliberately. A professional layout does not depend on one perfect viewport or one perfect amount of text.`
  }
  return base
}

function createLesson(course, moduleTitle, topic, order) {
  const richEntry = TUTORIAL_CONTENT[course.slug]?.[slugify(topic)]
  const example = richEntry ? firstExampleCode(richEntry) : topicExample(course, topic)
  const body = richEntry
    ? renderLessonContent(richEntry, `${course.title} Tutorial`, TUTORIAL_LANGUAGE_LABEL[course.language] || course.language)
    : `<h1>${topic}</h1><p>${detailFor(course, topic)}</p><h3>What to understand</h3><ul><li>The purpose of ${topic} in ${course.title} projects.</li><li>The basic syntax or structure used to apply it.</li><li>How it connects to the surrounding topics in ${moduleTitle}.</li><li>Common mistakes, edge cases, and debugging signals.</li><li>How experienced developers use it in production-quality code.</li></ul><h3>How to study it</h3><p>Start with a tiny example, change one thing at a time, predict the output, then run or reason through the result. After that, apply it inside a small feature: validation, a reusable helper, a database query, a page section, an API endpoint, or a UI component.</p><h3>Practical example</h3><pre><code>${codeBlock(example)}</code></pre><h3>Common mistakes</h3><ul><li>Learning syntax without understanding the problem it solves.</li><li>Ignoring names, formatting, and error cases.</li><li>Copying examples without changing inputs and observing behavior.</li><li>Skipping documentation for boundary cases and production constraints.</li></ul><h3>Professional checklist</h3><ul><li>Can you explain ${topic} in simple words?</li><li>Can you write a small example without copying?</li><li>Can you identify when not to use it?</li><li>Can you debug the most likely failure?</li><li>Can you connect it to code quality, testing, and maintainability?</li></ul>`
  return {
    id: lessonId(course.slug, topic),
    course_slug: course.slug,
    title: topic,
    module_title: moduleTitle,
    language: course.language,
    seo_title: `${topic} - ${course.title}`,
    description: summarize(`${topic}: ${richEntry?.intro || detailFor(course, topic)}`),
    indexable: Boolean(richEntry),
    examples: richEntry?.examples || [],
    // An exercise marked runnable: false needs tools the playground does not have.
    exercise_starter: richEntry?.exercise?.runnable === false ? '' : richEntry?.exercise?.starterCode || '',
    order,
    content: { format: 'html', body },
    resources: [{ type: 'code', language: course.language, content: example }],
    practice: course.slug === 'python'
      ? [{ type: 'problem', slug: 'python-list-sum', title: 'List Sum' }]
      : ['html', 'css'].includes(course.slug)
        ? [{ type: 'problem', slug: 'web-profile-card', title: 'Profile Card' }]
        : [],
    progress: { status: 'not_started', completed_percent: 0, bookmarked: false, note: '' },
  }
}

const LESSON_GROUPS = Object.fromEntries(
  STATIC_COURSE_DEFINITIONS.map((course) => {
    let order = 0
    const lessons = course.modules.flatMap(([moduleTitle, topics]) => topics.map((topic) => createLesson(course, moduleTitle, topic, order += 1)))
    return [course.slug, lessons]
  }),
)

export const SAMPLE_COURSES = STATIC_COURSE_DEFINITIONS.map((course) => ({
  id: `course_${course.slug.replaceAll('-', '_')}`,
  slug: course.slug,
  title: course.title,
  level: course.level,
  description: course.description,
  lessons_count: LESSON_GROUPS[course.slug].length,
  completion_percent: 0,
  modules: course.modules.map(([moduleTitle, topics], moduleIndex) => ({
    id: `mod_${course.slug.replaceAll('-', '_')}_${slugify(moduleTitle)}`,
    title: moduleTitle,
    order: moduleIndex + 1,
    completion_percent: 0,
    lessons: topics.map((topic, index) => ({
      id: lessonId(course.slug, topic),
      title: topic,
      order: index + 1,
      status: 'not_started',
    })),
  })),
}))

const LESSON_MAP = Object.fromEntries(
  Object.values(LESSON_GROUPS).flat().map((lesson) => [lesson.id, lesson]),
)

LESSON_MAP.lesson_python_overview = LESSON_MAP.lesson_python_syntax
LESSON_MAP.lesson_python_input = LESSON_MAP.lesson_python_http_api_basics
LESSON_MAP.lesson_java_overview = LESSON_MAP.lesson_java_core_history_and_features_of_java

export const SAMPLE_LESSONS = LESSON_MAP

export function cloneFiles(files, fallback = PYTHON_FILES) {
  const source = Array.isArray(files) && files.length ? files : fallback
  return source.map((file) => ({
    name: String(file?.name || 'main.txt'),
    language: String(file?.language || 'plaintext'),
    content: String(file?.content || ''),
  }))
}
