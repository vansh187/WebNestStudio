// Introductions shown at the top of each course hub (/learn/:slug), above the
// roadmap. Each one says who the course is for, what it covers and how to use it,
// in 150–250 words. Keep them in step with the course's modules in
// codelabDefaults.js, and only mention exercises and quizzes for courses whose
// lessons all have them.

export const COURSE_INTROS = {
  'java-core': {
    audience: 'This course is for complete beginners who want to learn Java properly, students preparing for exams and placement interviews, and developers moving to Java from another language. You need no programming experience, only a computer where you can install a JDK. The lessons use Java 17.',
    covers: 'It starts with how Java code is compiled and run on the JVM, then works through variables, operators, control flow, arrays and strings. The largest part of the course is object-oriented programming: classes, constructors, inheritance, polymorphism, abstraction, interfaces and encapsulation. After that come exception handling, multithreading, memory management, the Collections Framework, Java 8 features such as lambdas and streams, file I/O, and short modules on networking, reflection and classic algorithms.',
    howToUse: 'Every lesson explains one topic with runnable examples and their real output, then lists common mistakes and ends with an exercise, a short quiz and interview questions. Follow the milestones in order if you are new, or search the roadmap below for a single topic. When you finish, continue with Advanced Java or Spring Boot.',
  },
  'advanced-java': {
    audience: 'This course is for developers who already know core Java, including classes, collections and exceptions, and want to build server-side applications. It suits final-year students, interns starting backend work and anyone preparing for Java backend interviews.',
    covers: 'It begins with JDBC: drivers, connections, Statement and PreparedStatement, ResultSet, transactions and connection pooling. Next come Servlets and JSP, the request and response model that every Java web framework is built on, including sessions, filters and the MVC pattern. The Hibernate module covers entity mapping, relationships, inheritance strategies, caching, HQL and the Criteria API. The last two modules cover networking, reflection, annotations, enums and NIO, then engineering practice: design patterns, Maven and Gradle, logging, JUnit and Mockito, and packaging applications as JAR and WAR files.',
    howToUse: 'Each lesson pairs the explanation with code examples, and the JDBC lessons can be run against an in-memory H2 database with no server to install. Take the modules in order, because Hibernate builds on JDBC and JSP builds on Servlets. Spring is taught in its own Spring Framework and Spring Boot courses, which are the natural next step.',
  },
  'spring-framework': {
    audience: 'This course is for Java developers who want to understand how Spring works underneath Spring Boot. It assumes you are comfortable with core Java and object-oriented programming; knowing a little about web applications helps but is not required.',
    covers: 'The first module is a practical setup guide: installing the JDK, Maven or Gradle and an IDE on Windows, macOS or Linux, creating a project with Spring Initializr, and running and packaging your first Spring and Spring Boot applications. The core of the course is the Spring container: inversion of control, dependency injection, beans and their scopes, the application context, component scanning and Java configuration. Later modules cover the bean lifecycle, profiles, events and resources, then Spring MVC, validation, exception handling and aspect-oriented programming, and finally Spring Data, transactions, testing and an overview of reactive programming. Examples target Spring Framework 7.',
    howToUse: 'Work through the setup module first so every later example runs on your machine. Once the container concepts are clear, the Spring Boot course shows how Boot configures the same pieces for you automatically.',
  },
  'spring-boot': {
    audience: 'This course is for Java developers who want to build real backend services with Spring Boot, from a first REST API to secured, tested and deployed applications. You should know core Java; the Spring Framework course is a useful companion but not a requirement.',
    covers: 'You start by creating and configuring a Spring Boot project, then build REST APIs with validation, error handling and API documentation. The data modules cover Spring Data JPA, Hibernate mapping, pagination, transactions, caching and Redis. Spring Security covers authentication, authorization and JWT-based APIs. Further modules cover Spring AI, messaging and asynchronous processing, reactive Spring, testing, logging, Actuator and observability, Docker and deployment, and microservices with Spring Cloud. The course ends with a capstone project and interview preparation. Examples are written for Spring Boot 4.1 and Java 17 or later.',
    howToUse: 'If you are new to Spring Boot, follow the first three milestones in order, because the later modules assume you can already create a project, build an endpoint and save data. Experienced developers can jump straight to a topic such as security or deployment from the roadmap below.',
  },
  python: {
    audience: 'This course is for beginners learning to program for the first time, students who need Python for college or data work, and developers adding Python to their toolkit. No prior experience is needed.',
    covers: 'It starts with installing Python and writing your first programs, then covers variables, data types, control flow, strings and the core data structures: lists, tuples, sets and dictionaries. Next come functions, object-oriented programming, modules and packages, exception handling and debugging, and working with files and databases. Later modules cover decorators, generators and other advanced features, classic programs, building web APIs with FastAPI, data analysis with NumPy and pandas, and an introduction to machine learning.',
    howToUse: 'Every lesson includes runnable examples with their output, common mistakes, an exercise, a quiz and interview questions. Beginners should follow the milestones in order; the FastAPI, data analysis and machine learning modules can be taken in any order once you are comfortable with functions and classes.',
  },
  html: {
    audience: 'This course is for anyone starting web development, including students, designers who want to write their own markup, and backend developers who need to build clean pages. No experience is needed beyond using a browser and a text editor.',
    covers: 'You begin by setting up an editor and the browser developer tools, then learn how an HTML document is structured: semantic elements, headings, links and metadata in the head. The content module covers images, lists, tables, audio and video, and embedding other pages with iframes. You then build forms with the right input types and built-in validation. The final module covers accessibility, SEO basics, best practices for publishing pages and an introduction to web components.',
    howToUse: 'Each lesson has examples you can edit in the browser, plus common mistakes, an exercise, a quiz and interview questions. Learn HTML first, then continue with the CSS course to style your pages and the JavaScript course to make them interactive.',
  },
  css: {
    audience: 'This course is for learners who know basic HTML and want to style pages with confidence, and for developers who can make CSS work but want to understand why it works. You only need a browser and an editor.',
    covers: 'It begins with a working setup and the foundations: selectors, the cascade, specificity, the box model, units and typography. The layout module covers positioning, the display property, Flexbox, Grid, responsive design and media queries. You then learn custom properties, transitions, transforms, animations and pseudo-classes and pseudo-elements. The last module covers how to organise CSS in larger projects, accessibility and container queries.',
    howToUse: 'Every lesson includes live examples, common mistakes, an exercise, a quiz and interview questions. Layout is where most people get stuck, so spend extra time on the Flexbox and Grid lessons and try their exercises before moving on. Keep the browser developer tools open while you work, because the Styles and Computed panels show exactly which rule won and why.',
  },
  javascript: {
    audience: 'This course is for learners who know basic HTML and CSS and want to make web pages interactive, and for developers from other languages who need modern JavaScript. No prior JavaScript is needed.',
    covers: 'You start by setting up a JavaScript environment, then cover syntax, variables, types, functions, arrays and objects. The runtime module explains scope, closures, classes, modern ES features and how the event loop works. In the browser you work with the DOM, events, modules and local storage. The async module covers promises, async and await, fetching data from APIs and error handling, and the final module covers debugging, testing fundamentals and an introduction to TypeScript.',
    howToUse: 'Each lesson has runnable examples, common mistakes, an exercise, a quiz and interview questions. Make sure closures and the event loop are clear before the async lessons, then move on to the React course. Try small experiments in the browser console as you read; it needs no setup and points to the exact line when something goes wrong.',
  },
  react: {
    audience: 'This course is for developers who are comfortable with JavaScript, including functions, arrays, objects and promises, and want to build user interfaces with React. It also suits backend developers who need to work on a React front end.',
    covers: 'It starts with setting up a React project and the basics: JSX, components, props, state, events, conditional rendering and rendering lists with keys. Next come forms and hooks, including useEffect, useMemo and useCallback, and writing your own custom hooks. The architecture module covers context, routing, calling APIs and approaches to state management. The final module covers performance, error boundaries, testing, deployment and using TypeScript with React.',
    howToUse: 'Every lesson includes examples, common mistakes, an exercise, a quiz and interview questions. Build a small app of your own alongside the course and add each new idea to it, because React concepts stick best when you use them in one growing project. The React Developer Tools browser extension lets you inspect each component\'s props and state while you work.',
  },
  'database-sql': {
    audience: 'This course is for anyone who needs to store and query data: students taking a database course, developers who use an ORM but want to understand the SQL underneath, and analysts moving beyond spreadsheets. No database experience is needed.',
    covers: 'You begin by setting up a local database for practice, then learn how relational databases work: tables, rows and columns, primary and foreign keys, and constraints. A short module on schema design covers normalization and entity-relationship modelling. The querying module covers inserting, reading, updating and deleting data, filtering, joins, grouping, subqueries and views. Later modules cover indexes, transactions, ACID, isolation levels, locking and query optimization, then stored procedures and database security.',
    howToUse: 'Each lesson has SQL examples with their results, common mistakes, an exercise, a quiz and interview questions. Type the queries yourself instead of copying them. When you are comfortable with joins and indexes, continue with the PostgreSQL or Database Design course.',
  },
  postgresql: {
    audience: 'This course is for developers who already know basic SQL and want to use PostgreSQL well in real applications. If SELECT, JOIN and GROUP BY are new to you, take the Database and SQL course first. It is also useful if you have worked with MySQL or another database and want to learn what PostgreSQL does differently.',
    covers: 'It starts with setting up PostgreSQL and its data types, schemas, sequences and identity columns. The data modelling module covers JSON and JSONB, arrays and practical schema design. The query module covers index types, common table expressions, window functions and writing your own functions. The final module covers transactions, roles and permissions, reading EXPLAIN plans, performance basics and backup and restore.',
    howToUse: 'Every lesson includes examples, common mistakes, an exercise, a quiz and interview questions. Run the examples in your own PostgreSQL database, and use EXPLAIN on your own queries once you reach the performance lessons, because seeing a plan change is the fastest way to understand indexes.',
  },
  'database-design': {
    audience: 'This course is for developers who can write SQL and now need to design the database for a new application, and for students working on a project or a system-design interview. Familiarity with tables, keys and joins is assumed.',
    covers: 'It starts with tools for drawing entity-relationship diagrams and a step-by-step workflow from written requirements to a schema: finding entities, relationships and cardinality. The schema quality module covers when to normalize and when to denormalize, naming standards and data integrity. Operational design covers audit fields, soft deletes, versioning and planning migrations. The final module covers indexing strategy and designing databases that serve APIs at scale.',
    howToUse: 'Each lesson includes worked examples, common mistakes, an exercise, a quiz and interview questions. Pick a project you know, such as a shop or a college portal, and design its schema step by step as you go through the lessons. By the end you should be able to explain why every table, key and index in your design exists, which is what reviewers and interviewers ask about.',
  },
}

export function getCourseIntro(slug) {
  return COURSE_INTROS[slug] || null
}
