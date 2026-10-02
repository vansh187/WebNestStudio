// Practice blocks for the Database & SQL course. Merged onto the lesson entries in
// index.js by slug, so the lesson prose files stay unchanged.
// The playground runs a SQL exercise on SQLite, one statement at a time, and prints each
// result as "column | column" lines. Exercises therefore use standard SQL that works on
// SQLite as well as PostgreSQL and MySQL, and give explicit ids in every INSERT.
// Exercises that need a real server (two sessions, roles, stored procedures) are marked
// runnable: false and describe the result in words.
export const practiceDatabaseSql = {
  'setting-up-a-local-database-for-practice': {
    whyItMatters: `SQL is learned by typing queries and reading what comes back, not by reading about it. A database you can experiment in freely, and break without consequences, is the most useful tool you can have while learning. The same create, insert and select cycle you run here is what every later lesson builds on.`,
    exercise: {
      prompt: `Create a table named <code>students</code> with an integer <code>id</code> as primary key and a text <code>name</code>. Insert two students, Asha and Ravi. Then count the rows, naming the result column <code>total</code>.

Expected output: <code>total</code> then <code>2</code>`,
      starterCode: `-- TODO: create the students table

-- TODO: insert Asha (id 1) and Ravi (id 2)

-- TODO: count the rows as "total"`,
      hints: [
        'A column is declared as name, type and constraints: <code>id INTEGER PRIMARY KEY</code>.',
        'A result column is named with <code>AS</code>: <code>SELECT COUNT(*) AS total FROM students</code>.',
      ],
      solution: `CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT
);

INSERT INTO students (id, name) VALUES (1, 'Asha'), (2, 'Ravi');

SELECT COUNT(*) AS total FROM students;`,
    },
    quiz: [
      {
        question: 'What is <code>psql</code>?',
        options: ['A graphical database designer', 'The command-line client for PostgreSQL', 'A programming language', 'A backup format'],
        answer: 1,
        explanation: 'It connects to a PostgreSQL server and runs SQL typed at its prompt.',
      },
      {
        question: 'Which statement creates a new, empty database?',
        options: ['NEW DATABASE shop;', 'MAKE DATABASE shop;', 'CREATE DATABASE shop;', 'ADD DATABASE shop;'],
        answer: 2,
        explanation: 'Tables are then created inside it with CREATE TABLE.',
      },
      {
        question: 'Why practise on a local database instead of a shared one?',
        options: ['You can experiment and make mistakes without affecting anyone else\'s data', 'Local databases are faster for production', 'SQL only works locally', 'Shared databases do not support SELECT'],
        answer: 0,
        explanation: 'A practice database can be dropped and recreated at any time.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a database server and a database client?',
        answer: `The server is the program that stores the data, enforces the rules and executes queries; PostgreSQL and MySQL are servers. A client is any program that connects to it and sends SQL: a command-line tool such as <code>psql</code>, a graphical tool such as DBeaver or pgAdmin, or your application through a driver. Many clients can be connected to one server at the same time.`,
      },
      {
        question: 'What is the difference between a database, a schema and a table?',
        answer: `A table holds rows of one kind of data, such as customers. A schema is a named group of tables and other objects inside a database; PostgreSQL puts tables in the <code>public</code> schema by default. A database is the top-level container that holds schemas and is what a client connects to. In MySQL the words schema and database mean the same thing.`,
      },
    ],
  },

  'database-fundamentals': {
    whyItMatters: `Almost every application you will build stores its data in a database: users, orders, messages, payments. A database keeps that data safe when the program stops, lets many users work at once, and answers questions about the data quickly. SQL is the language for talking to it, and it has stayed essentially the same for decades.`,
    exercise: {
      prompt: `Create a <code>books</code> table with an integer primary key <code>id</code>, a <code>title</code> that cannot be empty, and a numeric <code>price</code>. Insert two books: Clean Code at 450 and SQL Basics at 90. Then select the titles of the books that cost more than 100.

Expected output: <code>title</code> then <code>Clean Code</code>`,
      starterCode: `-- TODO: create the books table (id, title, price)

-- TODO: insert the two books

-- TODO: select the title of each book priced above 100`,
      hints: [
        '<code>NOT NULL</code> after the column type makes a value mandatory.',
        'Rows are filtered with a <code>WHERE</code> clause: <code>WHERE price &gt; 100</code>.',
      ],
      solution: `CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER
);

INSERT INTO books (id, title, price) VALUES (1, 'Clean Code', 450), (2, 'SQL Basics', 90);

SELECT title FROM books WHERE price > 100;`,
    },
    quiz: [
      {
        question: 'What does SQL stand for?',
        options: ['Simple Query Logic', 'Standard Question Language', 'Sequential Query Layer', 'Structured Query Language'],
        answer: 3,
        explanation: 'It is the standard language for relational databases.',
      },
      {
        question: 'Which of these is a relational database?',
        options: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
        answer: 0,
        explanation: 'MongoDB is a document store, Redis a key-value store and Elasticsearch a search engine.',
      },
      {
        question: 'What is the main job of a DBMS?',
        options: ['To design web pages', 'To store data and manage access to it safely and efficiently', 'To compile programs', 'To send email'],
        answer: 1,
        explanation: 'It handles storage, queries, concurrent users, security and recovery after a crash.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between SQL and NoSQL databases?',
        answer: `SQL, or relational, databases store data in tables with a fixed schema, relate tables through keys, and support joins and transactions with strong consistency. NoSQL covers several other models: documents, key-value pairs, wide columns and graphs. They usually have flexible schemas and scale out across servers easily, often with weaker consistency guarantees. Relational databases suit structured, related data; NoSQL suits flexible or very high-volume data with simple access patterns.`,
      },
      {
        question: 'Why use a database instead of files?',
        answer: `A database lets many users read and write at the same time without corrupting data, finds rows quickly through indexes instead of scanning everything, enforces rules such as uniqueness and required values, groups changes into transactions that either complete fully or not at all, controls who may see what, and recovers cleanly after a crash. Plain files give none of this without a great deal of extra code.`,
      },
    ],
  },

  'relational-model': {
    whyItMatters: `SQL works on whole sets of rows at once, not on one row at a time. People coming from programming languages reach for loops and are surprised that rows have no fixed order. Thinking in sets is the shift that makes SQL feel natural, and it is why one short statement can update a million rows.`,
    exercise: {
      prompt: `The rows were inserted in the order Zoya, Asha, Ravi. A table has no guaranteed order, so write a query that returns the names in alphabetical order explicitly. Then raise every salary by 1000 with a single statement, and return the total of all salaries as <code>total</code>.

Expected output: <code>name</code>, <code>Asha</code>, <code>Ravi</code>, <code>Zoya</code>, <code>total</code>, <code>153000</code> (one per line)`,
      starterCode: `CREATE TABLE staff (id INTEGER PRIMARY KEY, name TEXT, salary INTEGER);
INSERT INTO staff (id, name, salary) VALUES (1, 'Zoya', 60000), (2, 'Asha', 50000), (3, 'Ravi', 40000);

-- TODO: the names in alphabetical order

-- TODO: one statement that raises every salary by 1000

-- TODO: the sum of all salaries as "total"`,
      hints: [
        'Order is requested with <code>ORDER BY name</code>.',
        'An <code>UPDATE</code> with no <code>WHERE</code> clause applies to every row: <code>SET salary = salary + 1000</code>.',
      ],
      solution: `CREATE TABLE staff (id INTEGER PRIMARY KEY, name TEXT, salary INTEGER);
INSERT INTO staff (id, name, salary) VALUES (1, 'Zoya', 60000), (2, 'Asha', 50000), (3, 'Ravi', 40000);

SELECT name FROM staff ORDER BY name;

UPDATE staff SET salary = salary + 1000;

SELECT SUM(salary) AS total FROM staff;`,
    },
    quiz: [
      {
        question: 'In the relational model, what is a "relation"?',
        options: ['A link between two tables', 'A foreign key', 'A table', 'A query'],
        answer: 2,
        explanation: 'A relation is a table, a tuple is a row, and an attribute is a column.',
      },
      {
        question: 'In what order does <code>SELECT * FROM users;</code> return rows?',
        options: ['Always in insertion order', 'No order is guaranteed without ORDER BY', 'Always sorted by id', 'Alphabetical order'],
        answer: 1,
        explanation: 'The database may return rows in whatever order is cheapest, and that can change.',
      },
      {
        question: 'How do you give every product a 10% price increase?',
        options: ['Loop over the rows in the application and update each one', 'Run one INSERT per product', 'It cannot be done in SQL', 'One UPDATE statement that sets price = price * 1.10'],
        answer: 3,
        explanation: 'SQL statements operate on the whole set of matching rows.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What does it mean that SQL is declarative?',
        answer: `In a declarative language you state what result you want, not the steps to compute it. A query says which rows and columns are needed; the database's query planner decides how to get them: which indexes to use, in which order to join tables, and so on. This is why the same query can become faster after an index is added, with no change to the SQL.`,
      },
      {
        question: 'What is set-based thinking in SQL?',
        answer: `It means expressing an operation as something done to a whole set of rows at once, instead of processing rows one by one in a loop. An <code>UPDATE</code> with a <code>WHERE</code> clause, or a join between two tables, describes all the affected rows in one statement. Set-based statements are shorter and much faster than row-by-row processing, because the database can optimise the whole operation.`,
      },
    ],
  },

  'tables-rows-columns': {
    whyItMatters: `A table definition is a promise about the data: which columns exist and what kind of value each may hold. Choosing the right type prevents invalid data, such as text in a price column, and affects storage and speed. A poor choice made at the start, such as storing dates as text, is painful to correct once the table is full.`,
    exercise: {
      prompt: `Create a <code>products</code> table with these columns: an integer primary key <code>id</code>; a <code>name</code> of up to 100 characters that is required; an integer <code>price</code>; a boolean <code>in_stock</code>; and a date <code>added_on</code>. Insert the two rows given in the comments, then select the name and price of the products that are in stock.

Expected output: <code>name | price</code> then <code>Pen | 12</code>`,
      starterCode: `-- TODO: create the products table

-- TODO: insert (1, 'Pen', 12, TRUE, '2026-01-15') and (2, 'Bag', 450, FALSE, '2026-02-01')

-- TODO: name and price of the products that are in stock`,
      hints: [
        'The types are <code>INTEGER</code>, <code>VARCHAR(100)</code>, <code>BOOLEAN</code> and <code>DATE</code>.',
        'Filter with <code>WHERE in_stock = TRUE</code>.',
      ],
      solution: `CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price INTEGER,
  in_stock BOOLEAN,
  added_on DATE
);

INSERT INTO products (id, name, price, in_stock, added_on) VALUES
  (1, 'Pen', 12, TRUE, '2026-01-15'),
  (2, 'Bag', 450, FALSE, '2026-02-01');

SELECT name, price FROM products WHERE in_stock = TRUE;`,
    },
    quiz: [
      {
        question: 'Which type should store an amount of money exactly?',
        options: ['DECIMAL (also called NUMERIC)', 'FLOAT', 'TEXT', 'BOOLEAN'],
        answer: 0,
        explanation: 'Floating-point types store approximations and produce rounding errors in money calculations.',
      },
      {
        question: 'What does <code>VARCHAR(50)</code> mean?',
        options: ['Exactly 50 characters, padded with spaces', 'A number up to 50', 'Text of up to 50 characters', '50 separate columns'],
        answer: 2,
        explanation: 'CHAR(50) is the fixed-length type that pads shorter values.',
      },
      {
        question: 'What does one row of a table represent?',
        options: ['A data type', 'A category of information', 'A rule on the data', 'One record: a single entity such as one customer'],
        answer: 3,
        explanation: 'Columns describe the attributes, and each row holds the values for one item.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between CHAR and VARCHAR?',
        answer: `<code>CHAR(n)</code> is fixed length: every value occupies <code>n</code> characters, and shorter values are padded with spaces. <code>VARCHAR(n)</code> is variable length: it stores only the characters given, up to a maximum of <code>n</code>. <code>CHAR</code> suits values that always have the same length, such as a two-letter country code; <code>VARCHAR</code> suits names, emails and most other text.`,
      },
      {
        question: 'Why should dates not be stored as text?',
        answer: `Text does not validate, so <code>'2026-13-45'</code> or <code>'tomorrow'</code> would be accepted. Text sorts and compares as characters, which gives wrong results unless every value has exactly the same format. Date functions, such as adding a month or finding the difference between two dates, do not work on it, and indexes are less useful. A <code>DATE</code> or <code>TIMESTAMP</code> column avoids all of this.`,
      },
    ],
  },

  'keys': {
    whyItMatters: `Keys are what make a relational database relational. A primary key identifies each row, and a foreign key links a row in one table to a row in another and stops the link from pointing at nothing. Without them, a database fills up with duplicate records and orders that belong to customers who do not exist.`,
    exercise: {
      prompt: `Create a <code>customers</code> table with a primary key, and an <code>orders</code> table whose <code>customer_id</code> is a foreign key to it. Insert customer 1, Asha. Insert an order for customer 1, then try to insert an order for customer 99, who does not exist; the database must reject it. Finally count the orders as <code>total</code>.

Expected output: <code>total</code> then <code>1</code>`,
      starterCode: `-- TODO: customers (id primary key, name)

-- TODO: orders (id primary key, customer_id referencing customers, product)

INSERT INTO customers (id, name) VALUES (1, 'Asha');
INSERT INTO orders (id, customer_id, product) VALUES (1, 1, 'pen');
INSERT INTO orders (id, customer_id, product) VALUES (2, 99, 'bag');

SELECT COUNT(*) AS total FROM orders;`,
      hints: [
        'A foreign key is declared on the column: <code>customer_id INTEGER REFERENCES customers(id)</code>.',
        'The third insert should fail with a foreign key error, leaving one order.',
      ],
      solution: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  product TEXT
);

INSERT INTO customers (id, name) VALUES (1, 'Asha');
INSERT INTO orders (id, customer_id, product) VALUES (1, 1, 'pen');
INSERT INTO orders (id, customer_id, product) VALUES (2, 99, 'bag');

SELECT COUNT(*) AS total FROM orders;`,
    },
    quiz: [
      {
        question: 'Which two properties must a primary key have?',
        options: ['Numeric and sorted', 'Unique and not null', 'Text and indexed', 'Short and encrypted'],
        answer: 1,
        explanation: 'Every row must have a value, and no two rows may share one.',
      },
      {
        question: 'What does a foreign key guarantee?',
        options: ['That the column is unique', 'That the column is never null', 'That the table is sorted', 'That each value matches an existing row in the referenced table'],
        answer: 3,
        explanation: 'This is called referential integrity.',
      },
      {
        question: 'What is a composite key?',
        options: ['A key made of two or more columns together', 'A key that is encrypted', 'A key shared by two tables', 'A key generated by the database'],
        answer: 0,
        explanation: 'A junction table for a many-to-many relationship commonly uses one.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a primary key and a unique key?',
        answer: `Both enforce uniqueness. A table can have only one primary key, and its columns cannot contain <code>NULL</code>; it is the main identifier of a row and the usual target of foreign keys. A table can have several unique constraints, and their columns may allow <code>NULL</code>. A typical table has a primary key on <code>id</code> and a unique constraint on something like <code>email</code>.`,
      },
      {
        question: 'What is the difference between a natural key and a surrogate key?',
        answer: `A natural key is a value with real-world meaning that happens to be unique, such as an email address or a national identity number. A surrogate key is an artificial identifier with no meaning, such as an auto-incremented integer or a UUID. Surrogate keys are usually preferred as primary keys because real-world values can change or turn out not to be unique; the natural key is then protected with a unique constraint.`,
      },
    ],
  },

  'constraints': {
    whyItMatters: `Application code has bugs, and data arrives from imports, scripts and other services that skip your checks entirely. Constraints are rules the database itself enforces on every write, whoever makes it. They are the last and most reliable line of defence for the correctness of your data.`,
    exercise: {
      prompt: `Create an <code>accounts</code> table in which <code>email</code> is required and unique, <code>balance</code> can never be negative, and <code>status</code> defaults to <code>active</code>. The three inserts below should then behave as follows: the first succeeds, the second is rejected as a duplicate email, and the third is rejected for its negative balance.

Expected output: <code>email | balance | status</code> then <code>asha@example.com | 100 | active</code>`,
      starterCode: `-- TODO: accounts (id, email, balance, status) with the constraints described

INSERT INTO accounts (id, email, balance) VALUES (1, 'asha@example.com', 100);
INSERT INTO accounts (id, email, balance) VALUES (2, 'asha@example.com', 50);
INSERT INTO accounts (id, email, balance) VALUES (3, 'ravi@example.com', -20);

SELECT email, balance, status FROM accounts;`,
      hints: [
        'Use <code>NOT NULL UNIQUE</code> on the email and <code>CHECK (balance &gt;= 0)</code> on the balance.',
        'A default is written <code>DEFAULT \'active\'</code> after the column type.',
      ],
      solution: `CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  balance INTEGER NOT NULL CHECK (balance >= 0),
  status TEXT NOT NULL DEFAULT 'active'
);

INSERT INTO accounts (id, email, balance) VALUES (1, 'asha@example.com', 100);
INSERT INTO accounts (id, email, balance) VALUES (2, 'asha@example.com', 50);
INSERT INTO accounts (id, email, balance) VALUES (3, 'ravi@example.com', -20);

SELECT email, balance, status FROM accounts;`,
    },
    quiz: [
      {
        question: 'Which constraint rejects a row whose <code>age</code> is below 18?',
        options: ['UNIQUE', 'DEFAULT 18', 'CHECK (age >= 18)', 'NOT NULL'],
        answer: 2,
        explanation: 'A CHECK constraint evaluates a condition for every inserted or updated row.',
      },
      {
        question: 'What does <code>DEFAULT</code> do?',
        options: ['Supplies a value when an INSERT does not give one for the column', 'Rejects NULL values', 'Makes the column unique', 'Sorts the column'],
        answer: 0,
        explanation: 'An explicit value in the INSERT overrides the default.',
      },
      {
        question: 'Where is the most reliable place to enforce a rule such as "email must be unique"?',
        options: ['In the front-end form', 'In a comment', 'In the application code only', 'In the database, as a constraint'],
        answer: 3,
        explanation: 'Two simultaneous requests can both pass an application check; only the database can guarantee uniqueness.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What kinds of constraint does SQL provide?',
        answer: `<code>NOT NULL</code> requires a value. <code>UNIQUE</code> forbids duplicate values. <code>PRIMARY KEY</code> combines the two and identifies the row. <code>FOREIGN KEY</code> requires the value to exist in another table. <code>CHECK</code> requires a condition to be true for the row. <code>DEFAULT</code>, though not strictly a constraint, supplies a value when none is given.`,
      },
      {
        question: 'If the application already validates the data, why add constraints?',
        answer: `Because the application is not the only way data gets in. Bugs, direct SQL fixes, import scripts, background jobs and other services all write to the database without passing through the same validation. Some rules, such as uniqueness, cannot be enforced reliably from application code at all when requests run concurrently. Constraints guarantee the rule for every write, and they also document it.`,
      },
    ],
  },

  'normalization': {
    whyItMatters: `When the same fact is stored in several rows, sooner or later the copies disagree: a customer's city is updated in one row and not in another. Normalization organises tables so that each fact is stored once. It is the theory behind good schema design and a guaranteed topic in database interviews.`,
    exercise: {
      prompt: `<code>orders_flat</code> repeats each customer's name and city on every order. Normalise it: create a <code>customers</code> table holding each customer once, and an <code>orders</code> table that refers to the customer by id. Fill both from the flat table, then count the rows of each.

Expected output: <code>customers</code>, <code>2</code>, <code>orders</code>, <code>3</code> (one per line)`,
      starterCode: `CREATE TABLE orders_flat (order_id INTEGER, customer_name TEXT, customer_city TEXT, product TEXT);
INSERT INTO orders_flat VALUES
  (1, 'Asha', 'Pune', 'pen'),
  (2, 'Asha', 'Pune', 'book'),
  (3, 'Ravi', 'Delhi', 'bag');

-- TODO: create customers (id, name, city) and fill it with each distinct customer

-- TODO: create orders (id, customer_id, product) and fill it from the flat table

SELECT COUNT(*) AS customers FROM customers;
SELECT COUNT(*) AS orders FROM orders;`,
      hints: [
        '<code>INSERT INTO ... SELECT ... GROUP BY customer_name, customer_city</code> copies each customer once; <code>MIN(order_id)</code> is a convenient unique id for each.',
        'To fill <code>orders</code>, join the flat table to <code>customers</code> on the name to find each customer\'s id.',
      ],
      solution: `CREATE TABLE orders_flat (order_id INTEGER, customer_name TEXT, customer_city TEXT, product TEXT);
INSERT INTO orders_flat VALUES
  (1, 'Asha', 'Pune', 'pen'),
  (2, 'Asha', 'Pune', 'book'),
  (3, 'Ravi', 'Delhi', 'bag');

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT
);

INSERT INTO customers (id, name, city)
SELECT MIN(order_id), customer_name, customer_city
FROM orders_flat
GROUP BY customer_name, customer_city;

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  product TEXT
);

INSERT INTO orders (id, customer_id, product)
SELECT f.order_id, c.id, f.product
FROM orders_flat f
JOIN customers c ON c.name = f.customer_name;

SELECT COUNT(*) AS customers FROM customers;
SELECT COUNT(*) AS orders FROM orders;`,
    },
    quiz: [
      {
        question: 'Which table violates first normal form?',
        options: ['A table with a primary key', 'A table with a column holding several phone numbers separated by commas', 'A table with two columns', 'A table with a foreign key'],
        answer: 1,
        explanation: '1NF requires each column to hold a single, atomic value.',
      },
      {
        question: 'What is the main purpose of normalization?',
        options: ['To make queries shorter', 'To use fewer tables', 'To remove redundancy, so that each fact is stored once and cannot become inconsistent', 'To encrypt the data'],
        answer: 2,
        explanation: 'It prevents update, insert and delete anomalies.',
      },
      {
        question: 'What does third normal form forbid?',
        options: ['A non-key column that depends on another non-key column', 'Foreign keys', 'NULL values', 'More than three tables'],
        answer: 0,
        explanation: 'For example, storing both zip_code and city in an orders table, where city depends on zip_code.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Explain first, second and third normal form.',
        answer: `First normal form: every column holds a single value, with no lists or repeating groups, and each row is unique. Second normal form: the table is in 1NF, and every non-key column depends on the whole primary key, not on part of a composite key. Third normal form: the table is in 2NF, and no non-key column depends on another non-key column. A common summary is that every non-key column must depend on the key, the whole key, and nothing but the key.`,
      },
      {
        question: 'What is denormalization and when is it justified?',
        answer: `Denormalization deliberately stores redundant data, such as a customer's name copied onto each order or a precomputed total, to avoid joins or calculations at read time. It is justified when reads greatly outnumber writes and a measured performance problem cannot be solved with indexes or caching, as in reporting tables. The price is that the copies must be kept in step, so it should be a conscious trade and not a starting point.`,
      },
    ],
  },

  'er-modelling': {
    whyItMatters: `Before writing any SQL you have to decide which tables exist and how they connect. ER modelling is that step: naming the things the system deals with and the relationships between them. A mistake here, such as treating a many-to-many relationship as one-to-many, means rebuilding tables later, when they are full of data.`,
    exercise: {
      prompt: `A student can take many courses and a course has many students. Model this with a junction table <code>enrollments</code> whose primary key is the pair of ids, each a foreign key. Then, using the data provided, list the titles of the courses Asha takes, in alphabetical order.

Expected output: <code>title</code>, <code>HTML</code>, <code>Python</code> (one per line)`,
      starterCode: `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT);

-- TODO: create enrollments (student_id, course_id) with a composite primary key

INSERT INTO students (id, name) VALUES (1, 'Asha'), (2, 'Ravi');
INSERT INTO courses (id, title) VALUES (1, 'Python'), (2, 'HTML'), (3, 'SQL');
INSERT INTO enrollments (student_id, course_id) VALUES (1, 1), (1, 2), (2, 3);

-- TODO: the titles of Asha's courses, in alphabetical order`,
      hints: [
        'A composite key is declared at the end of the table: <code>PRIMARY KEY (student_id, course_id)</code>.',
        'Join <code>students</code> to <code>enrollments</code> and <code>enrollments</code> to <code>courses</code>, then filter on the name.',
      ],
      solution: `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT);

CREATE TABLE enrollments (
  student_id INTEGER NOT NULL REFERENCES students(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  PRIMARY KEY (student_id, course_id)
);

INSERT INTO students (id, name) VALUES (1, 'Asha'), (2, 'Ravi');
INSERT INTO courses (id, title) VALUES (1, 'Python'), (2, 'HTML'), (3, 'SQL');
INSERT INTO enrollments (student_id, course_id) VALUES (1, 1), (1, 2), (2, 3);

SELECT c.title
FROM students s
JOIN enrollments e ON e.student_id = s.id
JOIN courses c ON c.id = e.course_id
WHERE s.name = 'Asha'
ORDER BY c.title;`,
    },
    quiz: [
      {
        question: 'In a one-to-many relationship between customers and orders, where does the foreign key go?',
        options: ['In the customers table', 'In both tables', 'In a third table', 'In the orders table, the "many" side'],
        answer: 3,
        explanation: 'Each order stores the id of the one customer it belongs to.',
      },
      {
        question: 'How is a many-to-many relationship implemented?',
        options: ['With a junction table holding a foreign key to each side', 'With a foreign key in one of the two tables', 'With a comma-separated list of ids in a column', 'It cannot be implemented'],
        answer: 0,
        explanation: 'Each row of the junction table records one pairing.',
      },
      {
        question: 'In an ER diagram, what is an entity?',
        options: ['A relationship between tables', 'A thing the system stores data about, such as a customer', 'A data type', 'A query'],
        answer: 1,
        explanation: 'Entities usually become tables, and their attributes become columns.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the types of relationship between tables?',
        answer: `One-to-one: each row in one table relates to at most one row in the other, such as a user and a user profile; implemented with a foreign key that is also unique. One-to-many: one row relates to many rows in the other, such as a customer and orders; the foreign key goes on the many side. Many-to-many: rows on each side relate to many on the other, such as students and courses; implemented with a junction table.`,
      },
      {
        question: 'How do you go from requirements to a database schema?',
        answer: `Identify the entities, the nouns the system has to remember, and the attributes of each. Identify the relationships between them and the cardinality of each: one-to-one, one-to-many or many-to-many. Draw this as an ER diagram. Then turn entities into tables, attributes into columns with types and constraints, and relationships into foreign keys or junction tables. Finally check the result against the normal forms.`,
      },
    ],
  },

  'sql-crud': {
    whyItMatters: `Create, read, update and delete are the four things every application does with data: registering, viewing a profile, editing it, closing the account. These four statements are the SQL you will write most, and a forgotten <code>WHERE</code> clause on an update or delete is one of the classic ways to damage a production database.`,
    exercise: {
      prompt: `Insert three employees: Asha earning 50000, Ravi earning 40000 and Zoya earning 60000. Raise Ravi's salary to 45000. Delete Zoya. Then list the names and salaries of the remaining employees, ordered by name.

Expected output: <code>name | salary</code>, <code>Asha | 50000</code>, <code>Ravi | 45000</code> (one per line)`,
      starterCode: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, salary INTEGER);

-- TODO: insert Asha (1), Ravi (2) and Zoya (3)

-- TODO: set Ravi's salary to 45000

-- TODO: delete Zoya

-- TODO: name and salary of everyone, ordered by name`,
      hints: [
        'Several rows can be inserted in one statement, separated by commas after <code>VALUES</code>.',
        'Both <code>UPDATE</code> and <code>DELETE</code> need a <code>WHERE</code> clause, or they affect every row.',
      ],
      solution: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, salary INTEGER);

INSERT INTO employees (id, name, salary) VALUES
  (1, 'Asha', 50000),
  (2, 'Ravi', 40000),
  (3, 'Zoya', 60000);

UPDATE employees SET salary = 45000 WHERE name = 'Ravi';

DELETE FROM employees WHERE name = 'Zoya';

SELECT name, salary FROM employees ORDER BY name;`,
    },
    quiz: [
      {
        question: 'What does <code>DELETE FROM orders;</code> do?',
        options: ['Deletes the orders table', 'Deletes the first row', 'Deletes every row in the table', 'Nothing, without a WHERE clause'],
        answer: 2,
        explanation: 'The table itself remains. DROP TABLE removes the table.',
      },
      {
        question: 'Which statement changes existing rows?',
        options: ['UPDATE', 'INSERT', 'ALTER', 'SELECT'],
        answer: 0,
        explanation: 'ALTER changes the structure of a table, not its rows.',
      },
      {
        question: 'Why is <code>SELECT *</code> discouraged in application code?',
        options: ['It is invalid SQL', 'It returns only one row', 'It cannot be used with WHERE', 'It fetches columns that are not needed and breaks when the table\'s columns change'],
        answer: 3,
        explanation: 'Naming the columns keeps the query stable and transfers less data.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between DELETE, TRUNCATE and DROP?',
        answer: `<code>DELETE</code> removes the rows that match a <code>WHERE</code> clause, one by one; it can be rolled back and fires triggers. <code>TRUNCATE</code> removes all rows of a table at once, much faster, and typically resets identity counters; it cannot filter rows. <code>DROP TABLE</code> removes the table itself, its structure as well as its data.`,
      },
      {
        question: 'How do you protect yourself from a wrong UPDATE or DELETE?',
        answer: `Run the same <code>WHERE</code> clause in a <code>SELECT</code> first to see exactly which rows will be affected. Execute the change inside a transaction, check the number of rows reported, and commit only if it is what was expected; otherwise roll back. On important systems, take a backup first and use an account whose permissions are limited to what the task needs.`,
      },
    ],
  },

  'filtering': {
    whyItMatters: `A table may hold millions of rows, and a query is useful only when it returns the right ones. The <code>WHERE</code> clause does that work. Its traps, especially how <code>NULL</code> behaves and how <code>AND</code> and <code>OR</code> combine, produce queries that run without error and quietly return the wrong rows.`,
    exercise: {
      prompt: `Write two queries. First: the names of employees in the IT or HR department who earn more than 40000 and whose name starts with A. Second: the names of employees who have no manager.

Expected output: <code>name</code>, <code>Asha</code>, <code>name</code>, <code>Zoya</code> (one per line)`,
      starterCode: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER, manager_id INTEGER);
INSERT INTO employees (id, name, department, salary, manager_id) VALUES
  (1, 'Asha', 'IT', 50000, 3),
  (2, 'Amit', 'Sales', 60000, 3),
  (3, 'Zoya', 'HR', 70000, NULL),
  (4, 'Anil', 'IT', 35000, 1);

-- TODO: IT or HR, salary above 40000, name starting with A

-- TODO: employees with no manager`,
      hints: [
        'Use <code>IN (\'IT\', \'HR\')</code> for the list and <code>LIKE \'A%\'</code> for the pattern.',
        'A missing value is tested with <code>IS NULL</code>, never with <code>= NULL</code>.',
      ],
      solution: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER, manager_id INTEGER);
INSERT INTO employees (id, name, department, salary, manager_id) VALUES
  (1, 'Asha', 'IT', 50000, 3),
  (2, 'Amit', 'Sales', 60000, 3),
  (3, 'Zoya', 'HR', 70000, NULL),
  (4, 'Anil', 'IT', 35000, 1);

SELECT name
FROM employees
WHERE department IN ('IT', 'HR')
  AND salary > 40000
  AND name LIKE 'A%';

SELECT name FROM employees WHERE manager_id IS NULL;`,
    },
    quiz: [
      {
        question: 'What does <code>WHERE manager_id = NULL</code> return?',
        options: ['The rows where manager_id is null', 'No rows, because a comparison with NULL is never true', 'All rows', 'A syntax error'],
        answer: 1,
        explanation: 'NULL means unknown, so the comparison is unknown too. Use IS NULL.',
      },
      {
        question: 'In a <code>LIKE</code> pattern, what does <code>%</code> match?',
        options: ['Exactly one character', 'A literal percent sign', 'Only digits', 'Any sequence of zero or more characters'],
        answer: 3,
        explanation: 'The underscore, _, matches exactly one character.',
      },
      {
        question: 'How is <code>a OR b AND c</code> evaluated?',
        options: ['As a OR (b AND c), because AND binds more tightly', 'As (a OR b) AND c', 'Left to right', 'It is a syntax error'],
        answer: 0,
        explanation: 'Use parentheses whenever AND and OR are mixed, to make the intention explicit.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How does NULL behave in comparisons?',
        answer: `<code>NULL</code> means the value is unknown, so any comparison with it, including <code>= NULL</code> and <code>&lt;&gt; NULL</code>, gives unknown and not true, and the row is filtered out. It is tested only with <code>IS NULL</code> and <code>IS NOT NULL</code>. A consequence is that <code>WHERE status &lt;&gt; 'active'</code> does not return rows whose status is null, and <code>NOT IN</code> with a list that contains a null returns no rows at all.`,
      },
      {
        question: 'What is the difference between WHERE and HAVING?',
        answer: `<code>WHERE</code> filters individual rows before any grouping takes place and cannot refer to aggregate functions. <code>HAVING</code> filters groups after <code>GROUP BY</code> has formed them and is where conditions on aggregates go, such as <code>HAVING COUNT(*) &gt; 5</code>. Filtering in <code>WHERE</code> whenever possible is more efficient, because fewer rows reach the grouping step.`,
      },
    ],
  },

  'joins': {
    whyItMatters: `Normalised data is spread across tables, and joins are how it is put back together: orders with their customers, students with their courses. Joins are the heart of SQL and the topic interviewers test most. The classic mistake is an inner join that silently drops rows that have no match.`,
    exercise: {
      prompt: `List every customer with the products they have ordered. A customer with no orders must still appear, with <code>NULL</code> as the product. Order the result by customer name and then by product.

Expected output: <code>name | product</code>, <code>Asha | book</code>, <code>Asha | pen</code>, <code>Ravi | NULL</code> (one per line)`,
      starterCode: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), product TEXT);
INSERT INTO customers (id, name) VALUES (1, 'Asha'), (2, 'Ravi');
INSERT INTO orders (id, customer_id, product) VALUES (1, 1, 'pen'), (2, 1, 'book');

-- TODO: every customer with their products, including customers with no orders`,
      hints: [
        'An inner join would leave Ravi out, because he has no matching order.',
        '<code>LEFT JOIN</code> keeps every row of the left table and fills the right-hand columns with <code>NULL</code> where there is no match.',
      ],
      solution: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), product TEXT);
INSERT INTO customers (id, name) VALUES (1, 'Asha'), (2, 'Ravi');
INSERT INTO orders (id, customer_id, product) VALUES (1, 1, 'pen'), (2, 1, 'book');

SELECT c.name, o.product
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
ORDER BY c.name, o.product;`,
    },
    quiz: [
      {
        question: 'Which rows does an <code>INNER JOIN</code> return?',
        options: ['All rows from both tables', 'All rows from the left table', 'Only the rows that have a match in both tables', 'Only the rows without a match'],
        answer: 2,
        explanation: 'Rows on either side with no partner are left out.',
      },
      {
        question: 'How do you find customers who have never placed an order?',
        options: ['LEFT JOIN orders and keep the rows where the order id IS NULL', 'INNER JOIN orders', 'SELECT DISTINCT customers', 'CROSS JOIN orders'],
        answer: 0,
        explanation: 'The unmatched customers are exactly those with NULL on the orders side.',
      },
      {
        question: 'What happens when a join is written without any join condition?',
        options: ['An error is raised', 'Only matching rows are returned', 'No rows are returned', 'Every row of one table is paired with every row of the other'],
        answer: 3,
        explanation: 'This is a Cartesian product, or cross join: 1,000 rows by 1,000 rows gives a million.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Explain the different types of join.',
        answer: `<code>INNER JOIN</code> returns only rows with a match in both tables. <code>LEFT JOIN</code> returns every row of the left table, with <code>NULL</code> in the right-hand columns where there is no match. <code>RIGHT JOIN</code> is the mirror image. <code>FULL OUTER JOIN</code> returns all rows from both sides, matched where possible. <code>CROSS JOIN</code> pairs every row with every row. A self join joins a table to itself, for example employees to their managers.`,
      },
      {
        question: 'In a LEFT JOIN, what is the difference between a condition in ON and one in WHERE?',
        answer: `A condition in <code>ON</code> decides which right-hand rows match; left-hand rows with no match are still returned, with nulls. A condition in <code>WHERE</code> is applied after the join to the combined rows, so a filter there on a right-hand column removes the rows that have nulls, which turns the left join into an inner join in effect. To keep unmatched rows, conditions on the right-hand table belong in <code>ON</code>.`,
      },
    ],
  },

  'grouping': {
    whyItMatters: `Reports are questions about groups: sales per month, average salary per department, number of orders per customer. <code>GROUP BY</code> with aggregate functions answers them in one query. The difference between <code>WHERE</code> and <code>HAVING</code> is one of the most frequently asked SQL interview questions.`,
    exercise: {
      prompt: `For each department, return the department, the number of staff as <code>staff</code> and the total salary as <code>total</code>, but only for departments that have at least two employees.

Expected output: <code>department | staff | total</code> then <code>IT | 2 | 110000</code>`,
      starterCode: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
INSERT INTO employees (id, name, department, salary) VALUES
  (1, 'Asha', 'IT', 50000),
  (2, 'Ravi', 'IT', 60000),
  (3, 'Zoya', 'HR', 70000);

-- TODO: department, number of staff and total salary, for departments with 2 or more staff`,
      hints: [
        '<code>COUNT(*)</code> counts the rows of each group and <code>SUM(salary)</code> totals them.',
        'A condition on a group goes in <code>HAVING</code>, after <code>GROUP BY</code>.',
      ],
      solution: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
INSERT INTO employees (id, name, department, salary) VALUES
  (1, 'Asha', 'IT', 50000),
  (2, 'Ravi', 'IT', 60000),
  (3, 'Zoya', 'HR', 70000);

SELECT department, COUNT(*) AS staff, SUM(salary) AS total
FROM employees
GROUP BY department
HAVING COUNT(*) >= 2;`,
    },
    quiz: [
      {
        question: 'What is the difference between <code>COUNT(*)</code> and <code>COUNT(email)</code>?',
        options: ['There is none', 'COUNT(*) counts all rows; COUNT(email) counts only rows where email is not null', 'COUNT(email) counts distinct emails', 'COUNT(*) ignores duplicates'],
        answer: 1,
        explanation: 'Aggregate functions other than COUNT(*) skip NULL values.',
      },
      {
        question: 'Which clause filters groups after aggregation?',
        options: ['WHERE', 'ORDER BY', 'HAVING', 'LIMIT'],
        answer: 2,
        explanation: 'WHERE runs before grouping and cannot use aggregate functions.',
      },
      {
        question: 'In a query with <code>GROUP BY department</code>, which columns may appear in the <code>SELECT</code> list?',
        options: ['The grouped columns and aggregate functions', 'Any column of the table', 'Only aggregate functions', 'Only the primary key'],
        answer: 0,
        explanation: 'A column that is neither grouped nor aggregated has no single value for the group.',
      },
    ],
    interviewQuestions: [
      {
        question: 'In what order are the clauses of a SELECT statement processed?',
        answer: `Logically: <code>FROM</code> and the joins build the rows; <code>WHERE</code> filters them; <code>GROUP BY</code> forms groups; <code>HAVING</code> filters the groups; <code>SELECT</code> computes the output columns; <code>DISTINCT</code> removes duplicates; <code>ORDER BY</code> sorts; and <code>LIMIT</code> cuts the result. This order explains why a column alias defined in <code>SELECT</code> cannot be used in <code>WHERE</code>, and why aggregates are not allowed there.`,
      },
      {
        question: 'How would you find duplicate values in a column?',
        answer: `Group by the column and keep the groups with more than one row: <code>SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) &gt; 1</code>. The result lists each duplicated value and how many times it occurs. To see the full rows, join that result back to the table or use a window function such as <code>ROW_NUMBER()</code> partitioned by the column.`,
      },
    ],
  },

  'subqueries': {
    whyItMatters: `Some questions need the answer to another question first: who earns more than the average, which customers have ordered a particular product. A subquery puts one query inside another to express that directly. Knowing when a subquery is the clearest tool, and when a join does the same job better, is part of writing good SQL.`,
    exercise: {
      prompt: `Return the names of the employees who earn more than the average salary of all employees.

Expected output: <code>name</code> then <code>Ravi</code>`,
      starterCode: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, salary INTEGER);
INSERT INTO employees (id, name, salary) VALUES
  (1, 'Asha', 50000),
  (2, 'Ravi', 60000),
  (3, 'Zoya', 40000);

-- TODO: names of employees earning more than the average salary`,
      hints: [
        'The average is itself a query: <code>SELECT AVG(salary) FROM employees</code>.',
        'Put that query in parentheses on the right-hand side of the comparison in <code>WHERE</code>.',
      ],
      solution: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, salary INTEGER);
INSERT INTO employees (id, name, salary) VALUES
  (1, 'Asha', 50000),
  (2, 'Ravi', 60000),
  (3, 'Zoya', 40000);

SELECT name
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);`,
    },
    quiz: [
      {
        question: 'What is a scalar subquery?',
        options: ['A subquery that returns a table', 'A subquery in the FROM clause', 'A subquery that runs twice', 'A subquery that returns exactly one value'],
        answer: 3,
        explanation: 'It can be used wherever a single value is allowed, such as in a comparison.',
      },
      {
        question: 'What makes a subquery "correlated"?',
        options: ['It refers to a column of the outer query, so it is evaluated for each outer row', 'It uses a join', 'It returns several columns', 'It is written in the FROM clause'],
        answer: 0,
        explanation: 'A non-correlated subquery can be run once, by itself.',
      },
      {
        question: 'Which operator tests whether a subquery returns at least one row?',
        options: ['IN', 'EXISTS', 'ANY', 'LIKE'],
        answer: 1,
        explanation: 'EXISTS stops as soon as it finds one matching row.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a subquery and a join?',
        answer: `A join combines columns from several tables into one result. A subquery uses the result of one query inside another, as a value, a list or a derived table. Many questions can be written either way; a join is needed when columns from both tables must appear in the output, while a subquery is often clearer for "is there a matching row" or "compare with an aggregate". Modern query planners frequently execute the two forms in the same way.`,
      },
      {
        question: 'How would you find the second highest salary?',
        answer: `One way is a subquery: <code>SELECT MAX(salary) FROM employees WHERE salary &lt; (SELECT MAX(salary) FROM employees)</code>. Another is to sort the distinct salaries in descending order and skip one: <code>SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1</code>. With window functions, <code>DENSE_RANK() OVER (ORDER BY salary DESC)</code> gives a rank that generalises to the Nth highest.`,
      },
    ],
  },

  'views': {
    whyItMatters: `A view is a saved query that can be used like a table. It lets a complicated join be written once and reused by name, and it lets you give someone access to part of a table, hiding columns such as password hashes or salaries. Reporting tools and permission schemes rely on views heavily.`,
    exercise: {
      prompt: `Create a view named <code>active_users</code> that shows only the <code>id</code> and <code>name</code> of users whose <code>active</code> flag is true, leaving out the password column. Then select the names from the view.

Expected output: <code>name</code> then <code>Asha</code>`,
      starterCode: `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, password_hash TEXT, active BOOLEAN);
INSERT INTO users (id, name, password_hash, active) VALUES
  (1, 'Asha', 'x9f2', TRUE),
  (2, 'Ravi', 'k3p8', FALSE);

-- TODO: create the view active_users (id and name of active users)

-- TODO: select the names from the view`,
      hints: [
        'The syntax is <code>CREATE VIEW name AS SELECT ...</code>.',
        'A view is queried exactly like a table: <code>SELECT name FROM active_users</code>.',
      ],
      solution: `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, password_hash TEXT, active BOOLEAN);
INSERT INTO users (id, name, password_hash, active) VALUES
  (1, 'Asha', 'x9f2', TRUE),
  (2, 'Ravi', 'k3p8', FALSE);

CREATE VIEW active_users AS
SELECT id, name
FROM users
WHERE active = TRUE;

SELECT name FROM active_users;`,
    },
    quiz: [
      {
        question: 'Does an ordinary view store its own copy of the data?',
        options: ['Yes, it is a snapshot', 'Yes, but only the first 1,000 rows', 'No; it stores only the query, which runs each time the view is used', 'Only if the table has an index'],
        answer: 2,
        explanation: 'A materialized view is the kind that stores the result.',
      },
      {
        question: 'How can a view improve security?',
        options: ['It encrypts the table', 'Users can be given access to the view, which exposes only chosen columns and rows, and not to the underlying table', 'It hides the database from the network', 'It disables SELECT'],
        answer: 1,
        explanation: 'The view acts as a restricted window onto the data.',
      },
      {
        question: 'A row is added to the underlying table. What does the view show next time it is queried?',
        options: ['The new row, if it meets the view\'s conditions', 'The old data until the view is recreated', 'An error', 'Nothing'],
        answer: 0,
        explanation: 'The view\'s query runs against the current data.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a view and why use one?',
        answer: `A view is a named query stored in the database that behaves like a virtual table. It simplifies complex queries by hiding joins and calculations behind a name, gives applications a stable interface even when the underlying tables change, and restricts access by exposing only certain columns or rows. It stores no data of its own, so it always reflects the current contents of its tables.`,
      },
      {
        question: 'What is the difference between a view and a materialized view?',
        answer: `An ordinary view runs its query every time it is used, so it is always up to date and costs as much as the query does. A materialized view stores the result physically, so reading it is fast, but the data is as old as the last refresh and must be refreshed explicitly or on a schedule. Materialized views suit expensive aggregations over data that does not need to be current to the second.`,
      },
    ],
  },

  'indexes': {
    whyItMatters: `A query that takes ten seconds on a large table can take ten milliseconds with the right index. An index is the first thing to check when a query is slow, and the most common fix. It is not free, though: every index slows down writes, so knowing where to add one, and where not to, is a core skill.`,
    exercise: {
      prompt: `Orders are looked up by customer constantly. Create an index named <code>idx_orders_customer</code> on <code>customer_id</code>, and a composite index named <code>idx_orders_customer_status</code> on <code>customer_id</code> and <code>status</code>. Then run the query the indexes are meant to serve: the ids of customer 1's paid orders, in order.

Expected output: <code>id</code>, <code>1</code>, <code>3</code> (one per line)`,
      starterCode: `CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT);
INSERT INTO orders (id, customer_id, status) VALUES
  (1, 1, 'paid'),
  (2, 2, 'paid'),
  (3, 1, 'paid'),
  (4, 1, 'pending');

-- TODO: index on customer_id

-- TODO: composite index on customer_id and status

-- TODO: ids of customer 1's paid orders, ordered by id`,
      hints: [
        'The syntax is <code>CREATE INDEX index_name ON table_name (column)</code>.',
        'A composite index lists its columns in order, separated by commas.',
      ],
      solution: `CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT);
INSERT INTO orders (id, customer_id, status) VALUES
  (1, 1, 'paid'),
  (2, 2, 'paid'),
  (3, 1, 'paid'),
  (4, 1, 'pending');

CREATE INDEX idx_orders_customer ON orders (customer_id);

CREATE INDEX idx_orders_customer_status ON orders (customer_id, status);

SELECT id
FROM orders
WHERE customer_id = 1 AND status = 'paid'
ORDER BY id;`,
    },
    quiz: [
      {
        question: 'What is the cost of adding an index?',
        options: ['Reads become slower', 'The table can no longer be updated', 'Queries must be rewritten', 'Inserts, updates and deletes become slower, and the index takes disk space'],
        answer: 3,
        explanation: 'Every write has to update each index on the table as well.',
      },
      {
        question: 'A composite index is on <code>(last_name, first_name)</code>. Which filter can use it efficiently?',
        options: ['WHERE first_name = \'Asha\'', 'WHERE last_name = \'Rao\'', 'WHERE age = 30', 'None of them'],
        answer: 1,
        explanation: 'A composite index is usable from its leftmost column onwards.',
      },
      {
        question: 'Which data structure do most database indexes use?',
        options: ['A B-tree', 'A linked list', 'A stack', 'A plain array'],
        answer: 0,
        explanation: 'It keeps the keys sorted and finds a value in a small number of steps, even in a huge table.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is an index and how does it speed up a query?',
        answer: `An index is a separate, sorted structure, usually a B-tree, that maps the values of one or more columns to the locations of the matching rows. Without it, the database reads every row of the table to find matches, which is a full table scan. With it, the database walks the tree to the value in a number of steps proportional to the logarithm of the table size and reads only the matching rows.`,
      },
      {
        question: 'Which columns should be indexed, and which should not?',
        answer: `Index columns that appear often in <code>WHERE</code> conditions, join conditions and <code>ORDER BY</code>, and foreign key columns. Columns with many distinct values benefit most. Avoid indexing columns with very few distinct values, such as a boolean, small tables, and columns that are rarely used for searching. Tables that are written far more than they are read should have few indexes, since each one slows every write.`,
      },
    ],
  },

  'transactions': {
    whyItMatters: `Moving money between two accounts takes two updates, and a crash between them would destroy money. A transaction makes the two updates a single unit: both happen or neither does. Any operation that changes more than one row in a way that must stay consistent needs one.`,
    exercise: {
      prompt: `Transfer 30 from account A to account B inside a transaction and commit it. Then start a second transaction that moves 500 from A to B, and roll it back because A cannot afford it. Finally list the balances.

Expected output: <code>name | balance</code>, <code>A | 70</code>, <code>B | 80</code> (one per line)`,
      starterCode: `CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER);
INSERT INTO accounts (name, balance) VALUES ('A', 100), ('B', 50);

-- TODO: a transaction that moves 30 from A to B, then commits

-- TODO: a transaction that moves 500 from A to B, then rolls back

SELECT name, balance FROM accounts ORDER BY name;`,
      hints: [
        'A transaction starts with <code>BEGIN</code> and ends with <code>COMMIT</code> or <code>ROLLBACK</code>.',
        'Each transfer is two <code>UPDATE</code> statements: one subtracting from A and one adding to B.',
      ],
      solution: `CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER);
INSERT INTO accounts (name, balance) VALUES ('A', 100), ('B', 50);

BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE name = 'A';
UPDATE accounts SET balance = balance + 30 WHERE name = 'B';
COMMIT;

BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE name = 'A';
UPDATE accounts SET balance = balance + 500 WHERE name = 'B';
ROLLBACK;

SELECT name, balance FROM accounts ORDER BY name;`,
    },
    quiz: [
      {
        question: 'What does <code>ROLLBACK</code> do?',
        options: ['Saves the changes permanently', 'Deletes the table', 'Undoes every change made since the transaction began', 'Restarts the database'],
        answer: 2,
        explanation: 'The data returns to the state it was in at BEGIN.',
      },
      {
        question: 'When do the changes of a transaction become permanent and visible to others?',
        options: ['At COMMIT', 'As each statement runs', 'When the connection closes', 'At BEGIN'],
        answer: 0,
        explanation: 'Until then they can still be rolled back.',
      },
      {
        question: 'A connection is lost in the middle of a transaction, before <code>COMMIT</code>. What happens to its changes?',
        options: ['They are committed', 'Half of them are kept', 'The table is locked for ever', 'They are rolled back'],
        answer: 3,
        explanation: 'An unfinished transaction is never applied.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a transaction?',
        answer: `A transaction is a sequence of statements that the database treats as one unit of work. Either all of them take effect, when the transaction is committed, or none do, when it is rolled back. It is opened with <code>BEGIN</code> and closed with <code>COMMIT</code> or <code>ROLLBACK</code>. Transactions keep data consistent when an operation needs several changes that must succeed together, such as a transfer or placing an order.`,
      },
      {
        question: 'What is a savepoint?',
        answer: `A savepoint is a named marker inside a transaction. <code>SAVEPOINT name</code> creates it, and <code>ROLLBACK TO name</code> undoes everything done after it while keeping the earlier work and leaving the transaction open. It allows part of a transaction to be retried or abandoned without giving up the whole thing.`,
      },
    ],
  },

  'acid': {
    whyItMatters: `ACID is the set of four guarantees that make a database trustworthy with data that matters: money, orders, medical records. Each letter rules out a particular kind of disaster. It is asked in almost every back-end interview, and understanding it explains why relational databases are still the default for critical data.`,
    exercise: {
      prompt: `The <code>CHECK</code> constraint forbids a negative balance. Inside one transaction, add 500 to B and then try to take 500 from A, which has only 100; the second update is rejected. Roll the transaction back so that the first update is undone as well, and print the total of both balances as <code>total</code>.

Expected output: <code>total</code> then <code>150</code>`,
      starterCode: `CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER CHECK (balance >= 0));
INSERT INTO accounts (name, balance) VALUES ('A', 100), ('B', 50);

-- TODO: begin, add 500 to B, subtract 500 from A (this fails), roll back

SELECT SUM(balance) AS total FROM accounts;`,
      hints: [
        'The failed update is the consistency rule at work: the database refuses a state that breaks a constraint.',
        'The <code>ROLLBACK</code> is atomicity: the credit to B, which did succeed, is undone with everything else.',
      ],
      solution: `CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER CHECK (balance >= 0));
INSERT INTO accounts (name, balance) VALUES ('A', 100), ('B', 50);

BEGIN;
UPDATE accounts SET balance = balance + 500 WHERE name = 'B';
UPDATE accounts SET balance = balance - 500 WHERE name = 'A';
ROLLBACK;

SELECT SUM(balance) AS total FROM accounts;`,
    },
    quiz: [
      {
        question: 'Which ACID property means "all of the transaction or none of it"?',
        options: ['Consistency', 'Atomicity', 'Isolation', 'Durability'],
        answer: 1,
        explanation: 'A transaction cannot be left half applied.',
      },
      {
        question: 'Which property guarantees that committed data survives a power failure?',
        options: ['Durability', 'Atomicity', 'Consistency', 'Isolation'],
        answer: 0,
        explanation: 'The database writes the change to durable storage before confirming the commit.',
      },
      {
        question: 'What does isolation provide?',
        options: ['Encryption of the data', 'Faster queries', 'Backup of each row', 'Transactions running at the same time do not see each other\'s unfinished changes'],
        answer: 3,
        explanation: 'How strictly this is enforced depends on the isolation level.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Explain the ACID properties.',
        answer: `Atomicity: a transaction is all or nothing; if any part fails, everything is undone. Consistency: a transaction takes the database from one valid state to another, with every constraint still satisfied. Isolation: concurrent transactions do not interfere, and each behaves as though it ran alone, to the degree set by the isolation level. Durability: once a transaction is committed, its changes survive crashes and power loss.`,
      },
      {
        question: 'How does a database achieve durability?',
        answer: `Through a write-ahead log. Before a commit is confirmed, a record of the changes is written to a log file on disk and flushed. The actual table files can be updated later. If the server crashes, on restart it replays the log to reapply committed changes and discards those of transactions that never committed. Replication to other servers and backups protect against losing the disk itself.`,
      },
    ],
  },

  'isolation': {
    whyItMatters: `When two users change the same data at the same moment, the result depends on how strictly the database keeps their transactions apart. Too little isolation gives wrong results, such as two people buying the last item; too much slows everything down. Choosing a level, and knowing your database's default, is part of building any system with concurrent users.`,
    exercise: {
      runnable: false,
      prompt: `This exercise needs a real database server and two connections, so it cannot run in the playground. In PostgreSQL, write a transaction that runs at the REPEATABLE READ level and reads the balance of account 1 twice, so that both reads are guaranteed to return the same value even if another session commits a change in between.

Expected result: both SELECT statements return the same balance; at the default READ COMMITTED level the second could differ.`,
      starterCode: `-- TODO: begin a transaction

-- TODO: set the isolation level to REPEATABLE READ

-- TODO: read the balance of account 1

-- (another session updates and commits the balance here)

-- TODO: read the balance again, then commit`,
      hints: [
        'The level is set with <code>SET TRANSACTION ISOLATION LEVEL REPEATABLE READ</code>, as the first statement after <code>BEGIN</code>.',
        'It must come before any query in the transaction.',
      ],
      solution: `BEGIN;

SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT balance FROM accounts WHERE id = 1;

-- (another session updates and commits the balance here)

SELECT balance FROM accounts WHERE id = 1;

COMMIT;`,
    },
    quiz: [
      {
        question: 'What is a dirty read?',
        options: ['Reading a row twice and getting different values', 'Reading rows in the wrong order', 'Reading data that another transaction has changed but not yet committed', 'Reading a deleted table'],
        answer: 2,
        explanation: 'If that other transaction rolls back, the value that was read never really existed.',
      },
      {
        question: 'Which isolation level is the strictest?',
        options: ['SERIALIZABLE', 'READ COMMITTED', 'READ UNCOMMITTED', 'REPEATABLE READ'],
        answer: 0,
        explanation: 'The result is the same as if the transactions had run one after another.',
      },
      {
        question: 'What is the default isolation level in PostgreSQL?',
        options: ['READ UNCOMMITTED', 'REPEATABLE READ', 'SERIALIZABLE', 'READ COMMITTED'],
        answer: 3,
        explanation: 'MySQL\'s InnoDB engine defaults to REPEATABLE READ.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the read phenomena that isolation levels prevent?',
        answer: `A dirty read is seeing another transaction's uncommitted change. A non-repeatable read is reading the same row twice in one transaction and getting different values, because another transaction committed a change in between. A phantom read is running the same query twice and getting a different set of rows, because another transaction inserted or deleted rows that match.`,
      },
      {
        question: 'Describe the four standard isolation levels.',
        answer: `READ UNCOMMITTED permits dirty reads. READ COMMITTED shows only committed data, but the same row may change between two reads. REPEATABLE READ guarantees that rows already read will not change within the transaction; the standard still allows phantoms at this level. SERIALIZABLE prevents all three phenomena and behaves as if transactions ran one at a time. Stricter levels mean more blocking or more transactions that must be retried.`,
      },
    ],
  },

  'locking-concepts': {
    whyItMatters: `Locks are how a database stops two transactions from overwriting each other. They also cause the hardest production problems: queries that hang while waiting for a lock, and deadlocks in which two transactions wait for each other for ever. Understanding them is what lets you diagnose a system that "sometimes just freezes".`,
    exercise: {
      runnable: false,
      prompt: `This exercise needs a real database server, so it cannot run in the playground. Write a PostgreSQL transaction that transfers 100 from account 1 to account 2 safely under concurrency: lock both rows first with a single <code>SELECT ... FOR UPDATE</code> that takes them in id order, then make the two updates and commit.

Expected result: two sessions running this transaction at once cannot deadlock, because both request the row locks in the same order.`,
      starterCode: `BEGIN;

-- TODO: lock the rows for accounts 1 and 2, in id order

-- TODO: subtract 100 from account 1

-- TODO: add 100 to account 2

COMMIT;`,
      hints: [
        '<code>SELECT ... FOR UPDATE</code> takes an exclusive lock on each row it returns, held until the transaction ends.',
        'Adding <code>ORDER BY id</code> makes every session lock the rows in the same order.',
      ],
      solution: `BEGIN;

SELECT id, balance
FROM accounts
WHERE id IN (1, 2)
ORDER BY id
FOR UPDATE;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;

UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;`,
    },
    quiz: [
      {
        question: 'What is a deadlock?',
        options: ['A query that returns no rows', 'Two transactions each waiting for a lock that the other holds', 'A table with no index', 'A transaction that takes a long time'],
        answer: 1,
        explanation: 'Neither can continue, so the database detects the cycle and aborts one of them.',
      },
      {
        question: 'How do a shared lock and an exclusive lock differ?',
        options: ['Many transactions can hold a shared lock on the same data at once; an exclusive lock can be held by only one', 'A shared lock is for writing', 'An exclusive lock allows other writers', 'There is no difference'],
        answer: 0,
        explanation: 'Shared locks are taken for reading and exclusive locks for writing.',
      },
      {
        question: 'Which practice reduces deadlocks?',
        options: ['Using longer transactions', 'Removing all indexes', 'Accessing tables and rows in the same order in every transaction', 'Disabling transactions'],
        answer: 2,
        explanation: 'If everyone acquires locks in one order, a waiting cycle cannot form.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a deadlock and how can it be prevented or handled?',
        answer: `A deadlock occurs when two or more transactions each hold a lock that another needs, so none can proceed. The database detects this and aborts one transaction with an error. Deadlocks are made rare by acquiring locks in a consistent order, keeping transactions short, and touching as few rows as possible. Since they cannot be eliminated entirely, the application should catch the error and retry the transaction.`,
      },
      {
        question: 'What is the difference between optimistic and pessimistic locking?',
        answer: `Pessimistic locking takes a lock when the data is read, for example with <code>SELECT ... FOR UPDATE</code>, so that nobody else can change it until the transaction ends; it suits data with frequent conflicts. Optimistic locking takes no lock: each row has a version number, and the update includes <code>WHERE version = ?</code>; if no row is updated, someone else changed it first and the operation is retried. It suits data where conflicts are rare.`,
      },
    ],
  },

  'query-optimization': {
    whyItMatters: `A query that is fast on a hundred rows in development can bring a site down on ten million in production. Optimisation is the skill of finding out why a query is slow and fixing the cause. The N+1 problem alone, which is easy to create with an ORM, is behind a large share of slow pages.`,
    exercise: {
      prompt: `An application lists books by running one query for the books and then a separate query for the author of each book, which is the N+1 problem. Replace all of that with a single query that returns each book's title with its author's name, ordered by title.

Expected output: <code>title | author</code>, <code>Clean Code | Robert Martin</code>, <code>Refactoring | Martin Fowler</code> (one per line)`,
      starterCode: `CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER REFERENCES authors(id));
INSERT INTO authors (id, name) VALUES (1, 'Robert Martin'), (2, 'Martin Fowler');
INSERT INTO books (id, title, author_id) VALUES (1, 'Clean Code', 1), (2, 'Refactoring', 2);

-- The slow way: SELECT * FROM books, then for each book
-- SELECT name FROM authors WHERE id = <author_id>

-- TODO: one query returning title and author name, ordered by title`,
      hints: [
        'Join <code>books</code> to <code>authors</code> on <code>author_id</code>.',
        'Name the second column with <code>AS author</code>.',
      ],
      solution: `CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER REFERENCES authors(id));
INSERT INTO authors (id, name) VALUES (1, 'Robert Martin'), (2, 'Martin Fowler');
INSERT INTO books (id, title, author_id) VALUES (1, 'Clean Code', 1), (2, 'Refactoring', 2);

SELECT b.title, a.name AS author
FROM books b
JOIN authors a ON a.id = b.author_id
ORDER BY b.title;`,
    },
    quiz: [
      {
        question: 'What does <code>EXPLAIN</code> show?',
        options: ['The data in the table', 'The definition of the table', 'The users connected to the database', 'The plan the database will use to execute the query'],
        answer: 3,
        explanation: 'EXPLAIN ANALYZE also runs the query and reports the actual times and row counts.',
      },
      {
        question: 'In a query plan, what does a sequential scan (full table scan) mean?',
        options: ['The database reads every row of the table', 'An index was used', 'The query was cached', 'The table is empty'],
        answer: 0,
        explanation: 'On a large table with a selective filter, it usually signals a missing index.',
      },
      {
        question: 'Why can <code>WHERE LOWER(email) = \'a@b.com\'</code> not use an ordinary index on <code>email</code>?',
        options: ['LOWER is not valid SQL', 'Indexes only work with numbers', 'The index stores the original values, not the result of the function', 'Email columns cannot be indexed'],
        answer: 2,
        explanation: 'An index on the expression LOWER(email) solves it.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you approach a slow query?',
        answer: `Run it with <code>EXPLAIN ANALYZE</code> and read the plan: look for full table scans on large tables, large differences between estimated and actual row counts, and expensive sorts or joins. Then address the cause: add or adjust an index for the filter and join columns, rewrite conditions that prevent index use, select only the columns needed, and limit the rows returned. Measure again after each change to confirm that it helped.`,
      },
      {
        question: 'What is the N+1 query problem?',
        answer: `It happens when code runs one query to fetch a list of N rows and then one further query per row to fetch related data, making N+1 queries where one or two would do. Each query is fast, but the total, with a network round trip for each, is slow. It is common with ORMs that load related objects lazily. The fix is to fetch the related data in the same query with a join, or in one extra query using <code>IN</code>, which ORMs call eager loading.`,
      },
    ],
  },

  'stored-procedures-concepts': {
    whyItMatters: `Stored procedures and functions put logic inside the database, where it runs next to the data. Banks and large enterprises use them heavily, so you are likely to read and maintain them. They can cut network round trips and centralise rules, at the cost of logic that is harder to version and test than application code.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL's function syntax, so it cannot run in the playground. Write a function <code>order_total</code> that takes an order id and returns the total value of that order, calculated as the sum of quantity multiplied by unit price over its rows in <code>order_items</code>. Then call it for order 1.

Expected result: the SELECT returns one row with the total for order 1.`,
      starterCode: `-- order_items(order_id, quantity, unit_price)

-- TODO: create the function order_total(p_order_id) returning a numeric total

-- TODO: call it for order 1`,
      hints: [
        'A simple function can be written in SQL: <code>CREATE FUNCTION name(args) RETURNS type LANGUAGE sql AS $$ ... $$</code>.',
        'A function is called inside a query: <code>SELECT order_total(1)</code>.',
      ],
      solution: `-- order_items(order_id, quantity, unit_price)

CREATE FUNCTION order_total(p_order_id INTEGER)
RETURNS NUMERIC
LANGUAGE sql
AS $$
  SELECT COALESCE(SUM(quantity * unit_price), 0)
  FROM order_items
  WHERE order_id = p_order_id;
$$;

SELECT order_total(1);`,
    },
    quiz: [
      {
        question: 'What is the main difference between a function and a procedure?',
        options: ['There is none', 'A function returns a value and can be used in a query; a procedure is run with CALL and need not return one', 'A procedure must return a value', 'A function cannot take parameters'],
        answer: 1,
        explanation: 'In PostgreSQL a procedure can also commit or roll back inside its body, which a function cannot.',
      },
      {
        question: 'What is a benefit of a stored procedure?',
        options: ['It makes the database smaller', 'It removes the need for indexes', 'It replaces transactions', 'Several statements run on the server in one call, saving network round trips'],
        answer: 3,
        explanation: 'It can also be the only way an account is allowed to change certain data.',
      },
      {
        question: 'What is a drawback of putting business logic in stored procedures?',
        options: ['The logic is harder to version, test and move to another database', 'They cannot use SQL', 'They are always slower', 'They cannot take parameters'],
        answer: 0,
        explanation: 'Procedure languages differ between database products.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a stored procedure and why would you use one?',
        answer: `A stored procedure is a named routine saved in the database that runs a sequence of statements, with parameters and control flow. Reasons to use one: several statements execute in a single call, which reduces network traffic; rules implemented there apply to every application that uses the database; and access can be granted to the procedure without granting it on the tables. The costs are that the logic is separate from the application code and is specific to one database product.`,
      },
      {
        question: 'What is a trigger?',
        answer: `A trigger is a routine the database runs automatically when a specified event occurs on a table: before or after an insert, update or delete. Triggers are used for audit logs, for keeping derived values in step, and for enforcing rules too complex for a constraint. Because they run invisibly, they can make behaviour hard to follow and slow down writes, so they are used sparingly.`,
      },
    ],
  },

  'security': {
    whyItMatters: `The database holds what attackers want most: customer records, passwords, payment details. SQL injection has caused some of the largest data breaches on record, and it is entirely preventable. An application account that can do only what the application needs limits the damage when something else goes wrong.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL roles, so it cannot run in the playground. Create a login role <code>app_reader</code> for a reporting tool that may read the <code>customers</code> and <code>orders</code> tables and nothing else. It must not be able to insert, update or delete. Then show the parameterised form of the query that looks up a customer by email, as an application would send it.

Expected result: connected as app_reader, a SELECT on customers succeeds and a DELETE is refused with a permission error.`,
      starterCode: `-- TODO: create the role app_reader with a password, able to log in

-- TODO: grant it read access to customers and orders only

-- TODO: the lookup by email, written with a placeholder instead of the value`,
      hints: [
        'A role that can connect is created with <code>CREATE ROLE name LOGIN PASSWORD \'...\'</code>.',
        'Read access is <code>GRANT SELECT ON table TO role</code>. In PostgreSQL a placeholder is written <code>$1</code>.',
      ],
      solution: `CREATE ROLE app_reader LOGIN PASSWORD 'use-a-long-random-password';

GRANT SELECT ON customers, orders TO app_reader;

-- Sent by the application as a prepared statement; the email travels separately as data.
SELECT id, name FROM customers WHERE email = $1;`,
    },
    quiz: [
      {
        question: 'What causes SQL injection?',
        options: ['Using too many indexes', 'Slow queries', 'Building a query by inserting user input directly into the SQL text', 'Using transactions'],
        answer: 2,
        explanation: 'The input can then change the meaning of the statement.',
      },
      {
        question: 'What is the correct defence against SQL injection?',
        options: ['Parameterised queries, which send values separately from the SQL', 'Hiding the error messages', 'Checking the length of the input', 'Using POST instead of GET'],
        answer: 0,
        explanation: 'A value sent as a parameter is always treated as data, never as SQL.',
      },
      {
        question: 'What does the principle of least privilege mean for a database account?',
        options: ['Every account should be an administrator', 'It should have only the permissions its task requires', 'Passwords should be short', 'Accounts should be shared between applications'],
        answer: 1,
        explanation: 'If the account is compromised, the attacker can do no more than the account could.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is SQL injection and how do you prevent it?',
        answer: `SQL injection is an attack in which input supplied by a user is treated as part of an SQL statement, because the application built the statement by joining strings. Entering <code>' OR '1'='1</code> into a login form, for example, can make the <code>WHERE</code> clause true for every row. The prevention is to use parameterised queries or prepared statements, in which the SQL and the values are sent separately. Least-privilege accounts limit the damage if a flaw remains.`,
      },
      {
        question: 'How should passwords be stored in a database?',
        answer: `Never as plain text and never with reversible encryption. Each password is hashed with a slow algorithm designed for passwords, such as Argon2, bcrypt or scrypt, with a unique random salt per user, and only the hash is stored. At login the submitted password is hashed in the same way and compared. If the table is stolen, the attacker still has to guess each password separately, and the slowness of the algorithm makes that expensive.`,
      },
    ],
  },
}
