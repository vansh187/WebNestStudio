// Database and SQL module — hand-written lesson content, Part A.
// Keys are slugs used by the topics list for this module.
export const databaseSqlContentA = {
  'database-fundamentals': {
    title: 'Database Fundamentals',
    intro: `A database is an organized collection of data that is stored, managed, and retrieved electronically, and a Database Management System (DBMS) is the software layer that sits between an application and that stored data. Instead of an application reading and writing raw files directly, it talks to a DBMS, which handles storage, retrieval, concurrent access, security, and consistency on the application's behalf.

Before DBMSs became standard, applications stored data in flat files (plain text or binary files), and every program that needed the data had to implement its own logic for searching, updating, and preventing corruption when two processes wrote at once. This led to duplicated logic, inconsistent data, and fragile systems. A DBMS solves this once, centrally, so every application built on top of it inherits reliable data handling for free.`,
    sections: [
      {
        heading: 'What a DBMS Actually Does',
        body: `A DBMS provides a defined set of guarantees and services so that applications do not need to reinvent them.`,
        list: [
          '<strong>Data storage and retrieval</strong> — organizes data on disk and provides efficient ways to find it (indexes, query optimization).',
          '<strong>Concurrency control</strong> — allows many users or processes to read and write data at the same time without corrupting it.',
          '<strong>Data integrity</strong> — enforces rules (constraints) so invalid data cannot be saved, such as a negative age or a duplicate email.',
          '<strong>Security and access control</strong> — restricts which users or applications can read or modify which data.',
          '<strong>Backup and recovery</strong> — protects against data loss from crashes, power failure, or hardware faults.',
        ],
      },
      {
        heading: 'Relational Databases and SQL',
        body: `A relational database organizes data into tables made of rows and columns, based on the relational model proposed by E. F. Codd in 1970. SQL (Structured Query Language) is the standard language used to define, query, and manipulate data in a relational database. Popular relational database systems include PostgreSQL, MySQL, Microsoft SQL Server, and Oracle Database — all of them understand a large common core of standard SQL, even though each adds its own extensions.`,
      },
      {
        heading: 'SQL Databases vs. NoSQL Databases',
        body: `SQL (relational) databases enforce a fixed schema — every row in a table has the same columns and column types — and they excel at representing structured data with clear relationships, using SQL to query across tables. NoSQL databases (such as document, key-value, or graph databases) relax or remove the fixed schema, trading some consistency guarantees for flexibility and horizontal scalability. Neither is universally "better" — relational databases are usually the right default for data with clear structure and relationships, such as orders, customers, and inventory, while NoSQL options often fit unstructured or extremely high-volume data better.`,
      },
    ],
    examples: [
      {
        caption: 'Creating a simple table and inserting a row using standard SQL',
        code: `CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50)
);

INSERT INTO employees (id, name, department)
VALUES (1, 'Asha Rao', 'Engineering');

SELECT * FROM employees;`,
        output: 'Returns 1 row: (1, Asha Rao, Engineering)',
      },
    ],
    commonMistakes: [
      'Treating "database" and "DBMS" as the same thing — the database is the data itself; the DBMS is the software that manages it.',
      'Assuming SQL only works with one specific product — standard SQL syntax (CREATE TABLE, SELECT, INSERT) works, with minor variations, across PostgreSQL, MySQL, SQL Server, and Oracle.',
      'Choosing a NoSQL database purely because it sounds more modern, without evaluating whether the data actually has a clear relational structure.',
    ],
    keyPoints: [
      'A DBMS manages storage, retrieval, concurrency, integrity, and security so applications do not implement these themselves.',
      'Relational databases store data in tables of rows and columns and are queried using SQL.',
      'SQL databases enforce a fixed schema; NoSQL databases trade schema rigidity for flexibility and scale.',
    ],
  },

  'relational-model': {
    title: 'The Relational Model',
    intro: `The relational model, introduced by E. F. Codd, represents all data as relations — what SQL calls tables. Every relational database, regardless of vendor, is built on this same mathematical foundation, which is why SQL concepts transfer cleanly between PostgreSQL, MySQL, and other systems.

Understanding the relational model as "sets of tuples," rather than just "tables that look like spreadsheets," explains why SQL behaves the way it does: why row order is not guaranteed unless you explicitly sort, why duplicate rows are technically allowed but usually avoided, and why joining tables is a first-class, efficient operation rather than a workaround.`,
    sections: [
      {
        heading: 'Relations, Tuples, and Attributes',
        body: `In relational theory, a "relation" is a table, a "tuple" is a row, and an "attribute" is a column. Formally, a relation is a set of tuples that all share the same attributes (columns) and types. This is why every row in a SQL table must have a value (or NULL) for every defined column — the structure is uniform by definition, unlike a loosely structured document format.`,
      },
      {
        heading: 'Set-Based Thinking',
        body: `SQL is fundamentally set-based, not row-by-row like traditional procedural code. A query such as <code>SELECT * FROM orders WHERE total > 100</code> describes the set of rows you want, not a loop that inspects rows one at a time. The database engine decides how to actually retrieve that set efficiently. This is a mental shift for programmers used to for-loops: instead of writing "for each row, check the condition," you describe the condition and let the engine figure out the best access path.`,
      },
      {
        heading: 'No Guaranteed Order Without ORDER BY',
        body: `Because a relation is mathematically a set (or in SQL's practical implementation, a multiset that allows duplicates), there is no inherent row order. A query without an explicit <code>ORDER BY</code> clause may return rows in any order the engine finds convenient, and that order can change between runs, even without any data changes. Relying on unspecified order is one of the most common relational-model misunderstandings among beginners.`,
      },
    ],
    examples: [
      {
        caption: 'The same logical relation, queried as a set rather than iterated row by row',
        code: `SELECT name, department
FROM employees
WHERE department = 'Engineering'
ORDER BY name;`,
        output: "Returns 2 rows, ordered by name: ('Asha Rao', 'Engineering'), ('Meera Iyer', 'Engineering')",
      },
    ],
    commonMistakes: [
      'Assuming SELECT results come back in insertion order or "table order" — without ORDER BY, order is not guaranteed.',
      'Writing SQL like a procedural loop ("for each customer, then check...") instead of expressing the desired result set directly.',
      'Confusing a relation (a table definition with columns and types) with a specific set of rows currently stored in it — the structure and the data are different concepts.',
    ],
    keyPoints: [
      'A relation is a table, a tuple is a row, and an attribute is a column — the same relational vocabulary underlies every relational database.',
      'SQL is set-based: queries describe the result set, not a step-by-step retrieval procedure.',
      'Row order is never guaranteed unless an ORDER BY clause is used explicitly.',
    ],
  },

  'tables-rows-columns': {
    title: 'Tables, Rows, and Columns',
    intro: `A table is the basic structural unit of a relational database: it defines a fixed set of named, typed columns, and stores data as rows that each provide one value (or NULL) per column. Designing a table well — choosing the right columns and the right data type for each one — is one of the most consequential decisions in building a database-backed application.`,
    sections: [
      {
        heading: 'Defining a Table\'s Structure',
        body: `A table is created with <code>CREATE TABLE</code>, listing each column's name and data type. Once created, every row inserted into that table must conform to this structure: it must provide a value for every NOT NULL column, and every value must match (or be convertible to) its column's declared type.`,
      },
      {
        heading: 'Common SQL Data Types',
        body: `Choosing an appropriate type for each column keeps data both valid and efficient to store and query.`,
        list: [
          '<code>INTEGER</code> / <code>BIGINT</code> — whole numbers, commonly used for IDs and counts.',
          '<code>VARCHAR(n)</code> / <code>TEXT</code> — variable-length text, with VARCHAR(n) capping the length.',
          '<code>DECIMAL(p, s)</code> / <code>NUMERIC(p, s)</code> — exact fixed-precision numbers, essential for money.',
          '<code>DATE</code> / <code>TIMESTAMP</code> — calendar dates, and dates combined with a time component.',
          '<code>BOOLEAN</code> — true/false values (some databases emulate this with a small integer).',
        ],
      },
      {
        heading: 'Rows as Records',
        body: `Each row represents one complete record — one employee, one order, one product. A well-designed table keeps every row describing exactly one kind of "thing"; mixing unrelated kinds of records in a single table (for example, storing both customers and products in one generic table) breaks the relational model and makes queries and constraints far harder to write correctly.`,
      },
    ],
    examples: [
      {
        caption: 'Defining a products table with appropriate data types, then inserting rows',
        code: `CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    created_at DATE DEFAULT CURRENT_DATE
);

INSERT INTO products (id, name, price) VALUES
    (1, 'Wireless Mouse', 19.99),
    (2, 'Mechanical Keyboard', 79.50);

SELECT id, name, price FROM products;`,
        output: "Returns 2 rows: (1, 'Wireless Mouse', 19.99), (2, 'Mechanical Keyboard', 79.50)",
      },
    ],
    commonMistakes: [
      'Using VARCHAR/TEXT for prices instead of DECIMAL/NUMERIC, which leads to rounding errors in floating-point arithmetic.',
      'Choosing an unnecessarily large type (e.g., BIGINT for a small lookup table) or an unnecessarily restrictive one (e.g., VARCHAR(10) for names), causing wasted space or truncated data.',
      'Cramming multiple unrelated entities (like customers and orders) into a single wide table instead of splitting them into separate, properly related tables.',
    ],
    keyPoints: [
      'A table defines named, typed columns; every row must conform to that structure.',
      'Picking the right data type (DECIMAL for money, DATE/TIMESTAMP for dates) prevents subtle bugs and wasted storage.',
      'Each row should represent exactly one instance of one clearly defined entity.',
    ],
  },

  keys: {
    title: 'Keys: Primary, Foreign, and Composite',
    intro: `Keys are how a relational database uniquely identifies rows and links related tables together. Without keys, there is no reliable way to say "this row" versus "that row," nor any way to connect an order to the customer who placed it. Keys are the backbone of both data integrity and the ability to join tables meaningfully.`,
    sections: [
      {
        heading: 'Primary Keys',
        body: `A primary key is one column (or a combination of columns) that uniquely identifies every row in a table. A primary key column is implicitly <code>NOT NULL</code> and must be unique across all rows. Every table should have exactly one primary key, and most database engines automatically create an index on it to make lookups by that key fast.`,
      },
      {
        heading: 'Foreign Keys',
        body: `A foreign key is a column in one table that references the primary key of another table, establishing a relationship between them. For example, an <code>orders</code> table might have a <code>customer_id</code> column that is a foreign key referencing <code>customers.id</code>. The database enforces referential integrity: it will reject an insert that references a customer_id that doesn't exist, and by default it will also reject deleting a customer who still has orders (unless cascading behavior is configured).`,
      },
      {
        heading: 'Composite Keys',
        body: `A composite key is a primary (or unique) key made of two or more columns together, used when no single column is unique on its own. A common example is a join table like <code>enrollments(student_id, course_id)</code>, where the combination of student and course is unique even though neither column alone is.`,
      },
      {
        heading: 'Surrogate Keys vs. Natural Keys',
        body: `A natural key is an existing real-world attribute used as the primary key, such as an email address or a national ID number. A surrogate key is an artificial, meaningless identifier — typically an auto-incrementing integer or a UUID — introduced purely to serve as a stable primary key. Surrogate keys are generally preferred in practice because natural keys can change over time (a person can change their email) or turn out not to be as unique as assumed, which would force painful changes to every foreign key referencing them.`,
      },
    ],
    examples: [
      {
        caption: 'A primary key, a foreign key, and a composite key together',
        code: `CREATE TABLE customers (
    id INTEGER PRIMARY KEY,           -- surrogate key
    email VARCHAR(150) UNIQUE NOT NULL -- natural candidate key, kept unique but not primary
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id), -- foreign key
    order_date DATE NOT NULL
);

CREATE TABLE order_items (
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (order_id, product_id)  -- composite key
);`,
        output: 'All three CREATE TABLE statements succeed; order_items enforces one row per (order_id, product_id) pair.',
      },
    ],
    commonMistakes: [
      'Using a "natural" identifier like email or phone number as a primary key, then struggling when that value legitimately needs to change.',
      'Forgetting to index foreign key columns, which are frequently used in JOIN conditions and WHERE filters, causing slow queries as tables grow.',
      'Trying to insert a foreign key value that doesn\'t exist in the referenced table and being surprised by a constraint violation error.',
      'Believing a table can have multiple primary keys instead of one primary key that may itself be composed of multiple columns.',
    ],
    keyPoints: [
      'A primary key uniquely and non-null identifies each row in a table.',
      'A foreign key references another table\'s primary key and enforces referential integrity between them.',
      'A composite key combines two or more columns when no single column is unique on its own.',
      'Surrogate keys (auto-generated, meaningless) are usually safer long-term than natural keys (real-world values that can change).',
    ],
  },

  constraints: {
    title: 'SQL Constraints',
    intro: `Constraints are rules attached to columns or tables that the database enforces automatically, rejecting any INSERT or UPDATE that would violate them. Constraints move data-validation logic out of individual applications and into the database itself, so the rule can never be bypassed no matter which application or script writes the data.`,
    sections: [
      {
        heading: 'Column-Level Constraints',
        body: `These constraints apply to a single column's values.`,
        list: [
          '<code>NOT NULL</code> — the column must always have a value; NULL is rejected.',
          '<code>UNIQUE</code> — no two rows may share the same value in this column (NULLs are typically exempt).',
          '<code>CHECK (condition)</code> — every value must satisfy a boolean expression, e.g. <code>CHECK (price >= 0)</code>.',
          '<code>DEFAULT value</code> — supplies a value automatically when none is provided in an INSERT.',
        ],
      },
      {
        heading: 'Table-Level Constraints',
        body: `<code>PRIMARY KEY</code> and <code>FOREIGN KEY</code> can also be declared at the table level, which is required when they span multiple columns (a composite key) or when adding the constraint to an existing table after it was created. A <code>FOREIGN KEY</code> constraint can specify behavior on deletion of the referenced row, such as <code>ON DELETE CASCADE</code> (delete dependent rows automatically) or <code>ON DELETE RESTRICT</code> (block the deletion while dependents exist).`,
      },
      {
        heading: 'Why Constraints Matter',
        body: `Without constraints, invalid data — a negative price, a duplicate username, an order pointing to a nonexistent customer — can silently enter the database through any bug in any application, script, or manual data fix. Constraints act as a last line of defense that holds regardless of which code path writes the data, catching mistakes at the moment they happen rather than as a corrupted row discovered weeks later.`,
      },
    ],
    examples: [
      {
        caption: 'Combining NOT NULL, UNIQUE, CHECK, DEFAULT, and FOREIGN KEY on one table',
        code: `CREATE TABLE accounts (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    referred_by INTEGER REFERENCES accounts(id) ON DELETE SET NULL
);

INSERT INTO accounts (id, username) VALUES (1, 'asha_r');

INSERT INTO accounts (id, username, balance) VALUES (2, 'asha_r', 50.00);
-- fails: username must be UNIQUE`,
        output: 'First INSERT succeeds (balance defaults to 0.00). Second INSERT is rejected: duplicate value violates unique constraint on username.',
      },
    ],
    commonMistakes: [
      'Assuming application-level validation (e.g., in a web form) is enough and skipping database constraints — any other script, migration, or bug can still insert bad data directly.',
      'Forgetting that a UNIQUE constraint usually allows multiple NULLs, since NULL is not considered equal to another NULL.',
      'Adding a CHECK constraint that references another table\'s data — CHECK can only validate values within the same row, not cross-table rules.',
      'Deleting a referenced row without considering ON DELETE behavior, causing an unexpected foreign key violation or unwanted cascading deletes.',
    ],
    keyPoints: [
      'NOT NULL, UNIQUE, CHECK, and DEFAULT are the core column-level constraints for enforcing data validity.',
      'PRIMARY KEY and FOREIGN KEY constraints enforce identity and relationships between tables.',
      'ON DELETE CASCADE/RESTRICT/SET NULL controls what happens to dependent rows when a referenced row is deleted.',
      'Constraints enforce rules at the database level, independent of which application or script writes the data.',
    ],
  },

  normalization: {
    title: 'Database Normalization (1NF, 2NF, 3NF)',
    intro: `Normalization is the process of organizing tables to reduce data redundancy and prevent update, insert, and delete anomalies. It works by progressively splitting data into smaller, well-defined tables connected by foreign keys, following a series of increasingly strict rules called "normal forms."

An anomaly is a symptom of poor design: for example, if a customer's address is repeated on every one of their orders, updating that address means updating many rows — and if even one is missed, the data becomes contradictory. Normalization eliminates this by storing each fact in exactly one place.`,
    sections: [
      {
        heading: 'First Normal Form (1NF)',
        body: `A table is in 1NF when every column holds a single, atomic value (no lists or repeating groups packed into one field) and each row is uniquely identifiable. A column like <code>phone_numbers = '555-1111, 555-2222'</code> violates 1NF because it stores multiple values in one field, making it impossible to search or index individual numbers properly.`,
      },
      {
        heading: 'Second Normal Form (2NF)',
        body: `A table is in 2NF when it is already in 1NF and every non-key column depends on the entire primary key, not just part of it. This rule only matters for tables with a composite primary key; if a column depends on only one part of that composite key, it should be moved to a separate table.`,
      },
      {
        heading: 'Third Normal Form (3NF)',
        body: `A table is in 3NF when it is already in 2NF and every non-key column depends only on the primary key — not on another non-key column. If column B's value can be derived from column A (both non-key), such as deriving a department's manager name from a department name stored redundantly, that dependency should be factored into its own table.`,
      },
      {
        heading: 'A Concrete Before/After Example',
        body: `Consider a single unnormalized <code>orders</code> table storing <code>order_id, customer_name, customer_email, product_name, product_price</code>. If the same customer places two orders, their name and email are duplicated across rows — an update anomaly (changing an email requires updating multiple rows) and an insert anomaly (you cannot record a customer until they place an order). Normalizing splits this into <code>customers(id, name, email)</code>, <code>products(id, name, price)</code>, and <code>orders(id, customer_id, product_id, order_date)</code>, so each fact about a customer or product is stored exactly once and simply referenced by foreign key.`,
      },
    ],
    examples: [
      {
        caption: 'Un-normalized table (left implied) refactored into 3NF tables',
        code: `-- Normalized structure after fixing the redundancy described above
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    order_date DATE NOT NULL
);`,
        output: 'Three tables created; a customer\'s email now exists in exactly one row regardless of how many orders they place.',
      },
    ],
    commonMistakes: [
      'Storing comma-separated lists in a single column (e.g., "tags = red,large,sale") instead of a separate related table — this violates 1NF.',
      'Over-normalizing to the point that simple reports require joining ten or more tables, hurting both readability and performance — some controlled denormalization is a legitimate trade-off, not automatically wrong.',
      'Leaving a derived or duplicated column (like a customer\'s full address repeated on every order) that should have been moved to its own referenced table.',
      'Assuming normalization is only an academic exercise — unnormalized designs cause real update/insert/delete anomalies in production data.',
    ],
    keyPoints: [
      '1NF requires atomic column values and no repeating groups.',
      '2NF requires non-key columns to depend on the whole composite primary key, not part of it.',
      '3NF requires non-key columns to depend only on the primary key, not on other non-key columns.',
      'Normalization eliminates redundancy and the update/insert/delete anomalies it causes, at the cost of requiring more joins to reassemble data.',
    ],
  },

  'er-modelling': {
    title: 'Entity-Relationship (ER) Modelling',
    intro: `Entity-Relationship (ER) modelling is a technique for designing a database's structure before writing any SQL, by identifying the real-world "things" a system needs to track, the facts about each thing, and how they relate to one another. An ER diagram is the visual expression of this model, and it typically becomes the direct blueprint for a set of CREATE TABLE statements.`,
    sections: [
      {
        heading: 'Entities and Attributes',
        body: `An entity is a distinct real-world object or concept the database needs to store data about — for example, Customer, Product, or Order. An attribute is a property of an entity, such as a Customer's name and email, or a Product's price. In the relational model, an entity typically becomes a table, and its attributes become that table's columns.`,
      },
      {
        heading: 'Relationships',
        body: `A relationship describes how two entities are associated — for example, a Customer "places" an Order, or a Student "enrolls in" a Course. Relationships are what foreign keys implement physically once the model is turned into tables.`,
      },
      {
        heading: 'Cardinality: One-to-Many and Many-to-Many',
        body: `Cardinality describes how many instances of one entity can relate to how many instances of another.`,
        list: [
          '<strong>One-to-many (1:N)</strong> — one Customer can place many Orders, but each Order belongs to exactly one Customer. Implemented with a foreign key on the "many" side (orders.customer_id).',
          '<strong>Many-to-many (M:N)</strong> — one Student can enroll in many Courses, and one Course can have many Students. This cannot be represented with a single foreign key; it requires a separate join (junction) table, such as enrollments(student_id, course_id), with a composite key.',
          '<strong>One-to-one (1:1)</strong> — one entity instance relates to exactly one instance of another, such as one Employee having exactly one dedicated ParkingSpot; less common, usually implemented with a unique foreign key.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Turning a one-to-many and a many-to-many relationship into tables',
        code: `-- One-to-many: one customer -> many orders
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id)
);

-- Many-to-many: students <-> courses, via a junction table
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    title VARCHAR(120) NOT NULL
);

CREATE TABLE enrollments (
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    PRIMARY KEY (student_id, course_id)
);`,
        output: 'Five tables created; enrollments resolves the many-to-many relationship between students and courses.',
      },
    ],
    commonMistakes: [
      'Trying to implement a many-to-many relationship by adding a foreign key column directly to one of the two entity tables — a single foreign key column can only express "many-to-one," so a junction table is required instead.',
      'Confusing an entity (Customer, in general) with an instance of that entity (one specific customer row) when drawing the diagram.',
      'Skipping ER modelling for anything beyond a trivial schema and going straight to CREATE TABLE, which often produces missing relationships or duplicated data that has to be refactored later.',
      'Forgetting that the "one" side of a one-to-many relationship never stores the foreign key — the "many" side does (orders references customers, not the reverse).',
    ],
    keyPoints: [
      'Entities become tables, and attributes become columns.',
      'Relationships describe associations between entities and are physically implemented with foreign keys.',
      'One-to-many relationships use a single foreign key on the "many" side; many-to-many relationships require a junction table with a composite key.',
      'ER modelling before writing SQL catches structural mistakes early, when they are cheap to fix.',
    ],
  },

  'sql-crud': {
    title: 'SQL CRUD Operations',
    intro: `CRUD stands for Create, Read, Update, and Delete — the four fundamental operations every application performs on stored data. In SQL, these map directly to four core statements: <code>INSERT</code>, <code>SELECT</code>, <code>UPDATE</code>, and <code>DELETE</code>. Mastering these four statements covers the majority of day-to-day database work.`,
    sections: [
      {
        heading: 'INSERT — Creating Rows',
        body: `<code>INSERT INTO table (columns...) VALUES (values...)</code> adds one or more new rows. Listing column names explicitly (rather than relying on column order) makes statements resilient to future schema changes and easier to read.`,
      },
      {
        heading: 'SELECT — Reading Rows',
        body: `<code>SELECT columns FROM table WHERE condition</code> retrieves rows. <code>SELECT *</code> retrieves every column, but naming specific columns is generally preferred in real applications since it avoids pulling unnecessary data and breaking if columns are later added.`,
      },
      {
        heading: 'UPDATE and DELETE — Modifying and Removing Rows',
        body: `<code>UPDATE table SET column = value WHERE condition</code> modifies existing rows that match the condition. <code>DELETE FROM table WHERE condition</code> removes matching rows entirely. In both statements, the <code>WHERE</code> clause is what limits the effect to specific rows — omitting it applies the change to every row in the table, which is one of the most damaging mistakes possible in SQL.`,
      },
    ],
    examples: [
      {
        caption: 'A full CRUD cycle against an employees table',
        code: `INSERT INTO employees (id, name, department, salary)
VALUES (1, 'Rohit Sharma', 'Sales', 55000);

SELECT id, name, salary FROM employees WHERE department = 'Sales';

UPDATE employees SET salary = 60000 WHERE id = 1;

DELETE FROM employees WHERE id = 1;`,
        output: "INSERT adds 1 row. SELECT returns 1 row: (1, 'Rohit Sharma', 55000). UPDATE changes 1 row. DELETE removes 1 row.",
      },
      {
        caption: 'Inserting multiple rows in a single statement',
        code: `INSERT INTO products (id, name, price) VALUES
    (1, 'Notebook', 4.50),
    (2, 'Pen', 1.20),
    (3, 'Stapler', 6.75);`,
        output: 'Inserts 3 rows in one statement.',
      },
    ],
    commonMistakes: [
      'Running UPDATE or DELETE without a WHERE clause, which affects every single row in the table — always test the matching condition with a SELECT first.',
      'Relying on positional VALUES without naming columns, which silently inserts data into the wrong columns if the table structure changes.',
      'Forgetting that UPDATE and DELETE are not automatically reversible outside a transaction — without a surrounding transaction and a chance to ROLLBACK, the change is permanent once committed.',
      'Using SELECT * in application code, which can break the application when new columns are added to the table later.',
    ],
    keyPoints: [
      'CRUD maps directly to INSERT (create), SELECT (read), UPDATE (update), and DELETE (delete).',
      'Explicitly naming columns in INSERT and SELECT makes statements safer and more readable.',
      'The WHERE clause in UPDATE and DELETE is what limits changes to specific rows — omitting it affects the entire table.',
    ],
  },

  filtering: {
    title: 'Filtering Data with WHERE',
    intro: `The <code>WHERE</code> clause filters which rows a <code>SELECT</code>, <code>UPDATE</code>, or <code>DELETE</code> statement affects, evaluating a boolean condition against each row and keeping only the rows where it evaluates to true. Precise filtering is one of the most frequently used SQL skills, and combining conditions correctly is essential to getting the right result set.`,
    sections: [
      {
        heading: 'Comparison Operators',
        body: `Standard comparison operators — <code>= != (or <>) > < >= <=</code> — compare a column against a value or another column. Comparing against NULL with <code>=</code> never returns true; NULL comparisons require the special <code>IS NULL</code> or <code>IS NOT NULL</code> operators instead.`,
      },
      {
        heading: 'Combining Conditions: AND, OR, IN, BETWEEN',
        body: `Multiple conditions combine with <code>AND</code> (all must be true) and <code>OR</code> (at least one must be true); parentheses control precedence when mixing them. <code>IN (value1, value2, ...)</code> checks membership in a list, replacing a long chain of OR comparisons on the same column. <code>BETWEEN low AND high</code> checks an inclusive range, equivalent to <code>column >= low AND column <= high</code>.`,
      },
      {
        heading: 'Pattern Matching with LIKE',
        body: `<code>LIKE</code> performs simple pattern matching on text using two wildcards: <code>%</code> matches any sequence of characters (including none), and <code>_</code> matches exactly one character. For example, <code>name LIKE 'A%'</code> matches any name starting with "A," and <code>code LIKE 'A_1'</code> matches a three-character code starting with "A" and ending with "1."`,
      },
    ],
    examples: [
      {
        caption: 'Combining AND, IN, and LIKE in one filtered query',
        code: `SELECT name, department, salary
FROM employees
WHERE department IN ('Engineering', 'Sales')
  AND salary BETWEEN 50000 AND 90000
  AND name LIKE 'A%';`,
        output: "Returns 1 row: ('Asha Rao', 'Engineering', 72000)",
      },
      {
        caption: 'Filtering with OR and checking for NULL correctly',
        code: `SELECT id, name, department
FROM employees
WHERE department = 'Sales' OR department IS NULL;`,
        output: "Returns 2 rows: (2, 'Rohit Sharma', 'Sales'), (5, 'Meera Iyer', NULL)",
      },
    ],
    commonMistakes: [
      'Writing "column = NULL" instead of "column IS NULL" — equality comparisons with NULL always evaluate to unknown, never true.',
      'Mixing AND and OR without parentheses, producing a condition that groups differently than intended (e.g., "WHERE dept = \'Sales\' OR dept = \'HR\' AND salary > 50000").',
      'Using a leading wildcard in LIKE (e.g., "LIKE \'%son\'") and being surprised it cannot use a standard index efficiently on large tables.',
      'Writing a long chain of "column = x OR column = y OR column = z" instead of the more readable and often faster "column IN (x, y, z)".',
    ],
    keyPoints: [
      'WHERE filters rows using comparison operators, and NULL requires IS NULL / IS NOT NULL rather than = or !=.',
      'AND requires all conditions to be true; OR requires at least one; parentheses control how they combine.',
      'IN checks list membership and BETWEEN checks an inclusive range, both as shorthand for longer OR/comparison chains.',
      'LIKE performs pattern matching using % (any sequence) and _ (single character) wildcards.',
    ],
  },

  joins: {
    title: 'SQL Joins: INNER and LEFT JOIN',
    intro: `A join combines rows from two or more tables based on a related column between them, most often a foreign key matching a primary key. Joins are what let a normalized database — split into small, non-redundant tables — be reassembled back into the combined view an application or report actually needs.`,
    sections: [
      {
        heading: 'INNER JOIN',
        body: `<code>INNER JOIN</code> returns only the rows that have a match in both tables. If a row in the left table has no corresponding row in the right table (based on the join condition), that row is excluded entirely from the result. INNER JOIN is the default and most commonly used join type when you only care about complete, matched pairs.`,
      },
      {
        heading: 'LEFT JOIN (LEFT OUTER JOIN)',
        body: `<code>LEFT JOIN</code> returns every row from the left table, whether or not it has a match in the right table. When there is no match, the columns from the right table are filled with NULL for that row. This makes LEFT JOIN the right tool whenever you need to include "rows with nothing related yet" — for example, listing every customer including those who have never placed an order.`,
      },
      {
        heading: 'The Practical Difference in Results',
        body: `Given a <code>customers</code> table and an <code>orders</code> table, an INNER JOIN between them returns only customers who have placed at least one order — a customer with zero orders simply disappears from the result. A LEFT JOIN from customers to orders returns every customer, and for any customer with no orders, the order columns appear as NULL instead of the customer row being dropped. Choosing the wrong join type is a very common source of "missing rows" bugs in reports.`,
      },
    ],
    examples: [
      {
        caption: 'INNER JOIN drops customers with no orders',
        code: `SELECT c.name, o.id AS order_id
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id;`,
        output: "Returns 2 rows: ('Asha Rao', 101), ('Rohit Sharma', 102) — a customer named 'Meera Iyer' with zero orders does not appear.",
      },
      {
        caption: 'LEFT JOIN keeps every customer, using NULL for unmatched orders',
        code: `SELECT c.name, o.id AS order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;`,
        output: "Returns 3 rows: ('Asha Rao', 101), ('Rohit Sharma', 102), ('Meera Iyer', NULL) — Meera now appears with a NULL order_id.",
      },
    ],
    commonMistakes: [
      'Using INNER JOIN when the goal is "show everything, including things with no related rows" — this silently drops unmatched rows instead of showing them.',
      'Forgetting the ON condition (or writing an incorrect one), which can produce a cross join-like explosion of unintended row combinations.',
      'Filtering on a right-table column in the WHERE clause after a LEFT JOIN (e.g., "WHERE o.status = \'shipped\'") without accounting for NULLs, which can inadvertently turn the LEFT JOIN back into behaving like an INNER JOIN.',
      'Assuming JOIN always means INNER JOIN in every database — always specify the join type explicitly for clarity, since relying on defaults reduces readability.',
    ],
    keyPoints: [
      'INNER JOIN returns only rows with matches in both tables; unmatched rows are excluded.',
      'LEFT JOIN returns all rows from the left table, filling unmatched right-table columns with NULL.',
      'The join condition (ON clause) defines which columns must match between the two tables.',
      'Choosing INNER vs. LEFT JOIN changes which rows appear in the result, not just how they are formatted.',
    ],
  },

  grouping: {
    title: 'Grouping Data with GROUP BY',
    intro: `<code>GROUP BY</code> collapses multiple rows sharing the same value in one or more columns into a single summary row per group, typically paired with aggregate functions like <code>COUNT</code>, <code>SUM</code>, and <code>AVG</code> to compute a statistic for each group. This is the foundation of virtually every reporting and analytics query: totals by category, counts by status, averages by region.`,
    sections: [
      {
        heading: 'Aggregate Functions',
        body: `Aggregate functions compute a single value from a set of rows.`,
        list: [
          '<code>COUNT(*)</code> — number of rows in the group; <code>COUNT(column)</code> counts non-NULL values only.',
          '<code>SUM(column)</code> — total of a numeric column across the group.',
          '<code>AVG(column)</code> — average of a numeric column across the group.',
          '<code>MIN(column)</code> / <code>MAX(column)</code> — smallest and largest value in the group.',
        ],
      },
      {
        heading: 'How GROUP BY Works',
        body: `<code>GROUP BY column</code> partitions the rows into groups sharing the same value in that column, and every column named in the SELECT list must either appear in the GROUP BY clause or be wrapped in an aggregate function — a database will reject a query that mixes a raw, non-aggregated column with GROUP BY unless it is one of the grouping columns.`,
      },
      {
        heading: 'HAVING vs. WHERE',
        body: `<code>WHERE</code> filters individual rows before grouping happens, while <code>HAVING</code> filters entire groups after aggregation, based on the result of an aggregate function. You cannot write <code>WHERE COUNT(*) > 5</code> because COUNT does not exist yet at the row-filtering stage — that condition belongs in HAVING, applied after the grouping and aggregation are computed.`,
      },
    ],
    examples: [
      {
        caption: 'Counting and summing per department',
        code: `SELECT department, COUNT(*) AS employee_count, AVG(salary) AS avg_salary
FROM employees
GROUP BY department;`,
        output: "Returns 2 rows: ('Engineering', 2, 68000.00), ('Sales', 1, 55000.00)",
      },
      {
        caption: 'Using HAVING to filter groups after aggregation',
        code: `SELECT department, COUNT(*) AS employee_count
FROM employees
GROUP BY department
HAVING COUNT(*) > 1;`,
        output: "Returns 1 row: ('Engineering', 2) — Sales is excluded because its count of 1 does not satisfy HAVING COUNT(*) > 1.",
      },
    ],
    commonMistakes: [
      'Using WHERE to try to filter on an aggregate value (e.g., "WHERE COUNT(*) > 5") instead of HAVING, which causes a syntax/semantic error.',
      'Selecting a raw column that is not in the GROUP BY clause and not wrapped in an aggregate function, leading to an error or (in more permissive databases) an arbitrary, unpredictable value from the group.',
      'Confusing COUNT(*) (counts all rows) with COUNT(column) (counts only non-NULL values in that column) and getting different totals than expected.',
      'Applying HAVING conditions that could have been applied earlier as WHERE, which forces the database to aggregate rows that could have been filtered out first, hurting performance.',
    ],
    keyPoints: [
      'GROUP BY collapses rows sharing the same value(s) into one summary row per group, used with aggregate functions like COUNT, SUM, and AVG.',
      'Every non-aggregated column in SELECT must appear in the GROUP BY clause.',
      'WHERE filters rows before grouping; HAVING filters groups after aggregation.',
      'Filter as much as possible with WHERE before grouping, and reserve HAVING for conditions on the aggregated result itself.',
    ],
  },

  subqueries: {
    title: 'SQL Subqueries',
    intro: `A subquery is a complete SELECT statement nested inside another SQL statement, used to compute an intermediate result that the outer query then filters, joins against, or selects from. Subqueries let you express multi-step logic — "find the average, then find rows above it" — in a single SQL statement.`,
    sections: [
      {
        heading: 'Scalar Subqueries',
        body: `A scalar subquery returns exactly one row and one column — a single value — and can be used anywhere a single value is expected, such as in a comparison inside WHERE or as a computed column in SELECT. For example, comparing a salary against the company-wide average salary computed by a nested SELECT AVG(salary).`,
      },
      {
        heading: 'Correlated Subqueries',
        body: `A correlated subquery references a column from the outer query, so it is logically re-evaluated once for each row the outer query processes, rather than computed just once. This makes it possible to express per-row comparisons, such as "find employees earning more than the average salary in their own department" (as opposed to the company-wide average).`,
      },
      {
        heading: 'Subquery in WHERE vs. Subquery in FROM',
        body: `A subquery in <code>WHERE</code> (often with <code>IN</code>, <code>EXISTS</code>, or a comparison operator) filters which outer rows qualify. A subquery in <code>FROM</code> (sometimes called a derived table or inline view) is treated as a temporary, named table that the outer query can select from and join against just like any real table — useful for pre-aggregating or pre-filtering data before the outer query works with it.`,
      },
    ],
    examples: [
      {
        caption: 'A scalar subquery in WHERE, comparing each salary to the overall average',
        code: `SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);`,
        output: "Returns 1 row: ('Asha Rao', 72000) — assuming the overall average salary is 65000.",
      },
      {
        caption: 'A subquery used in the FROM clause as a derived table',
        code: `SELECT dept_summary.department, dept_summary.avg_salary
FROM (
    SELECT department, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department
) AS dept_summary
WHERE dept_summary.avg_salary > 60000;`,
        output: "Returns 1 row: ('Engineering', 68000.00)",
      },
    ],
    commonMistakes: [
      'Writing a subquery expected to return one value but that can actually return multiple rows, causing a runtime error when used with "=" instead of IN or a set-aware operator.',
      'Using a correlated subquery inefficiently on very large tables without realizing it may be logically re-executed once per outer row, which can be far slower than an equivalent JOIN.',
      'Forgetting to alias a derived table (subquery in FROM) — most databases require every subquery in FROM to have a name.',
      'Reaching for a subquery when a simple JOIN or aggregate query would express the same logic more clearly and often faster.',
    ],
    keyPoints: [
      'A scalar subquery returns a single value and can be used wherever a single value is expected.',
      'A correlated subquery references the outer query\'s columns and is conceptually evaluated per outer row.',
      'Subqueries can appear in WHERE (to filter rows) or in FROM (as a named derived table to select and join against).',
      'Many subqueries can be rewritten as JOINs or aggregate queries, sometimes with better performance and readability.',
    ],
  },

  views: {
    title: 'SQL Views',
    intro: `A view is a stored, named SQL query that behaves like a virtual table: you can <code>SELECT</code> from it just like a real table, but it has no data of its own — every time it is queried, the database runs the underlying query fresh against the real, underlying tables. Views are a way to package a complex or frequently repeated query behind a simple, reusable name.`,
    sections: [
      {
        heading: 'Creating and Using a View',
        body: `<code>CREATE VIEW view_name AS SELECT ...</code> defines a view. Once created, it can be queried exactly like a table: <code>SELECT * FROM view_name</code>. Because a view is just a saved query definition, it always reflects the current state of the underlying tables — it is never "stale" the way a manually copied table would be.`,
      },
      {
        heading: 'Simplifying Complex Queries',
        body: `A view is especially useful when several parts of an application repeatedly need the same complicated join or aggregation. Instead of duplicating a ten-line query with multiple joins in every report and every application module, that logic is written once inside a view, and every consumer simply selects from the view by name — improving both consistency and maintainability.`,
      },
      {
        heading: 'Restricting Access with Views',
        body: `A view can also expose only a subset of columns or rows from an underlying table, which is a common way to restrict what certain users or applications can see. For example, a view over an <code>employees</code> table might omit the <code>salary</code> column entirely, so that users granted access only to the view can never see compensation data, even though the full data still exists in the underlying table.`,
      },
    ],
    examples: [
      {
        caption: 'Creating a view that hides sensitive columns and simplifies a join',
        code: `CREATE VIEW employee_directory AS
SELECT e.id, e.name, e.department, d.location
FROM employees e
JOIN departments d ON d.name = e.department;

SELECT * FROM employee_directory WHERE department = 'Engineering';`,
        output: "Returns 2 rows: (1, 'Asha Rao', 'Engineering', 'Bangalore'), (3, 'Meera Iyer', 'Engineering', 'Bangalore') — salary is never exposed, since it is not selected in the view.",
      },
    ],
    commonMistakes: [
      'Assuming a view stores a physical copy of data — a standard (non-materialized) view re-runs its underlying query on every access and always reflects live data.',
      'Expecting a view to speed up a slow query automatically — a plain view does not cache results; a separate materialized view is needed for that, and it must be refreshed to stay current.',
      'Building deeply nested views (views selecting from other views selecting from other views) that become difficult to reason about and slow to query.',
      'Relying on a view alone for security without also setting proper database permissions — a user with direct access to the underlying tables can bypass the view entirely.',
    ],
    keyPoints: [
      'A view is a saved, named SELECT query that can be queried like a virtual table, with no data of its own.',
      'Views simplify repeated complex joins or aggregations by giving them a single reusable name.',
      'Views can restrict access by exposing only specific columns or rows from underlying tables.',
      'A standard view always reflects live data because it re-executes its query on every access; it is not a cached copy.',
    ],
  },
}
