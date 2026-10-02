// Practice blocks for the Database Design course. Merged onto the lesson entries in
// index.js by slug, so the lesson prose files stay unchanged.
// Exercises run on SQLite in the playground (see practice-database-sql.js for the
// conventions) and give explicit ids in every INSERT.
export const practiceDatabaseDesign = {
  'tools-for-database-design-erd-software': {
    whyItMatters: `A schema is far cheaper to change on a diagram than in a database full of data. Drawing the tables and their relationships first exposes missing entities and wrong relationships while they cost minutes to fix, and gives the team a picture to discuss. Diagrams written as text, such as DBML, can also be reviewed and versioned like code.`,
    exercise: {
      runnable: false,
      prompt: `This exercise is written in DBML, the text format used by dbdiagram.io, so it does not run in the playground; paste it into dbdiagram.io to see the diagram. Describe two tables: <code>users</code> with an integer primary key <code>id</code> and a unique, required <code>email</code>; and <code>posts</code> with an integer primary key <code>id</code>, a <code>title</code>, and a <code>user_id</code>. Then declare that many posts belong to one user.

Expected result: a diagram with two tables joined by a one-to-many line from users to posts.`,
      starterCode: `// TODO: Table users

// TODO: Table posts

// TODO: the reference from posts.user_id to users.id`,
      hints: [
        'Column settings go in square brackets: <code>id integer [pk]</code>, <code>email varchar [unique, not null]</code>.',
        'A many-to-one reference is written <code>Ref: posts.user_id &gt; users.id</code>.',
      ],
      solution: `Table users {
  id integer [pk]
  email varchar [unique, not null]
}

Table posts {
  id integer [pk]
  title varchar
  user_id integer [not null]
}

Ref: posts.user_id > users.id`,
    },
    quiz: [
      {
        question: 'What does an ER diagram show?',
        options: ['The speed of queries', 'The entities of a system, their attributes and the relationships between them', 'The rows stored in each table', 'The users connected to the database'],
        answer: 1,
        explanation: 'It is the design of the data, drawn before or alongside the tables.',
      },
      {
        question: 'Why draw the diagram before creating the tables?',
        options: ['Mistakes in the model are much cheaper to fix before data and code depend on them', 'The database requires it', 'Diagrams make queries faster', 'It replaces the need for constraints'],
        answer: 0,
        explanation: 'Changing a populated table means a migration and changes to every query that uses it.',
      },
      {
        question: 'What is an advantage of describing a schema as text, such as DBML?',
        options: ['It runs faster than SQL', 'It encrypts the schema', 'It needs no tables', 'It can be kept in version control and reviewed like code'],
        answer: 3,
        explanation: 'Changes to the design then show up as readable differences.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you approach designing a database for a new feature?',
        answer: `Start from the requirements and the questions the system must answer. List the entities and their attributes, then the relationships and their cardinality, and draw them as an ER diagram. Review the diagram with the people who know the domain, since they spot missing rules. Then convert it to tables with keys, types and constraints, check it against the normal forms, and add indexes for the known query patterns.`,
      },
      {
        question: 'What is the difference between a conceptual, a logical and a physical data model?',
        answer: `A conceptual model names the main entities and relationships in business terms, with no technical detail. A logical model adds attributes, keys and normalised structure, still independent of any product. A physical model is the actual implementation for one database: table and column names, data types, indexes, partitioning. Design moves from the first to the last.`,
      },
    ],
  },

  'requirement-to-schema-workflow': {
    whyItMatters: `Requirements arrive as sentences; a database needs tables. Translating one into the other is a skill, and the best test of a design is whether it can answer the questions the business will ask. A schema that cannot answer them is wrong, however tidy it looks.`,
    exercise: {
      prompt: `Requirement: "A library lends books to members. We must know which member currently has which book and when it was borrowed." Create three tables, <code>members</code>, <code>books</code> and <code>loans</code>, where a loan links a member to a book with a <code>borrowed_on</code> date. The data is then inserted for you. Answer the question the system must support: the name of the member who has the book titled Dune.

Expected output: <code>name</code> then <code>Asha</code>`,
      starterCode: `-- TODO: members (id, name), books (id, title),
--       loans (id, member_id, book_id, borrowed_on) with foreign keys

INSERT INTO members (id, name) VALUES (1, 'Asha'), (2, 'Ravi');
INSERT INTO books (id, title) VALUES (1, 'Dune'), (2, 'Emma');
INSERT INTO loans (id, member_id, book_id, borrowed_on) VALUES (1, 1, 1, '2026-03-01'), (2, 2, 2, '2026-03-02');

-- TODO: the name of the member who has the book titled 'Dune'`,
      hints: [
        'The nouns in the requirement become tables, and "lends" becomes the <code>loans</code> table that connects the other two.',
        'Join <code>members</code> to <code>loans</code> and <code>loans</code> to <code>books</code>, and filter on the title.',
      ],
      solution: `CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  book_id INTEGER NOT NULL REFERENCES books(id),
  borrowed_on DATE NOT NULL
);

INSERT INTO members (id, name) VALUES (1, 'Asha'), (2, 'Ravi');
INSERT INTO books (id, title) VALUES (1, 'Dune'), (2, 'Emma');
INSERT INTO loans (id, member_id, book_id, borrowed_on) VALUES (1, 1, 1, '2026-03-01'), (2, 2, 2, '2026-03-02');

SELECT m.name
FROM members m
JOIN loans l ON l.member_id = m.id
JOIN books b ON b.id = l.book_id
WHERE b.title = 'Dune';`,
    },
    quiz: [
      {
        question: 'In a requirement, what do the nouns usually become?',
        options: ['Indexes', 'Queries', 'Entities, and so tables', 'Constraints'],
        answer: 2,
        explanation: 'Verbs that connect two nouns usually become relationships.',
      },
      {
        question: 'What is a good test of whether a schema is right?',
        options: ['It can answer every question the system is required to answer', 'It has the fewest tables possible', 'Every column is indexed', 'It has no foreign keys'],
        answer: 0,
        explanation: 'Writing the important queries against the design reveals what is missing.',
      },
      {
        question: 'A requirement is ambiguous: can a book have more than one author? What should you do?',
        options: ['Assume the simplest case', 'Decide later, after the tables are built', 'Ignore authors', 'Ask, because the answer changes the structure of the tables'],
        answer: 3,
        explanation: 'One author is a foreign key; several authors need a junction table.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Describe your process for turning requirements into a schema.',
        answer: `Read the requirements and extract the entities and what must be stored about each. Identify the relationships and decide the cardinality of each, asking about anything ambiguous. Sketch the model, then write the queries the system must run and check that the model supports them. Convert the model to tables with keys, types and constraints, normalise it, and plan indexes around the queries.`,
      },
      {
        question: 'Why do ambiguities in requirements matter so much for database design?',
        answer: `Because the structure of the tables depends on the answers. Whether a customer can have several addresses, whether an order can be changed after payment, or whether history must be kept each produces a different schema. Code can be changed quickly; a table that already holds data needs a migration and changes wherever it is used, so resolving these questions before building is far cheaper.`,
      },
    ],
  },

  'entities': {
    whyItMatters: `The first design decision is what counts as a thing in its own right. Fold an address into the customer table and the day a customer needs a second address you are adding columns such as <code>address2_city</code>. Recognising a separate entity early keeps the model able to grow.`,
    exercise: {
      prompt: `A customer can have several addresses, so an address is an entity of its own and not a set of columns on the customer. Create an <code>addresses</code> table that belongs to a customer. The data is inserted for you. Then count Asha's addresses as <code>total</code>.

Expected output: <code>total</code> then <code>2</code>`,
      starterCode: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);

-- TODO: addresses (id, customer_id, city, kind) where customer_id refers to customers

INSERT INTO customers (id, name) VALUES (1, 'Asha'), (2, 'Ravi');
INSERT INTO addresses (id, customer_id, city, kind) VALUES
  (1, 1, 'Pune', 'home'),
  (2, 1, 'Mumbai', 'office'),
  (3, 2, 'Delhi', 'home');

-- TODO: count Asha's addresses as "total"`,
      hints: [
        'The foreign key goes in the table on the "many" side, which is <code>addresses</code>.',
        'Join the two tables and filter on the customer name, or filter <code>addresses</code> by a subquery for the id.',
      ],
      solution: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);

CREATE TABLE addresses (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  city TEXT NOT NULL,
  kind TEXT NOT NULL
);

INSERT INTO customers (id, name) VALUES (1, 'Asha'), (2, 'Ravi');
INSERT INTO addresses (id, customer_id, city, kind) VALUES
  (1, 1, 'Pune', 'home'),
  (2, 1, 'Mumbai', 'office'),
  (3, 2, 'Delhi', 'home');

SELECT COUNT(*) AS total
FROM addresses a
JOIN customers c ON c.id = a.customer_id
WHERE c.name = 'Asha';`,
    },
    quiz: [
      {
        question: 'What is the difference between an entity and an attribute?',
        options: ['An entity is a thing the system stores data about; an attribute is a property of that thing', 'There is none', 'An attribute is a table', 'An entity is always a number'],
        answer: 0,
        explanation: 'A customer is an entity; the customer\'s name is an attribute.',
      },
      {
        question: 'Which sign suggests that something should be its own entity?',
        options: ['It is a number', 'It has a short name', 'It is required', 'One parent can have several of it, or it has attributes of its own'],
        answer: 3,
        explanation: 'Phone numbers, addresses and order lines are typical examples.',
      },
      {
        question: 'What is a weak entity?',
        options: ['A table with no rows', 'An entity that cannot exist without its parent entity, such as an order line without its order', 'A table without indexes', 'An entity with only one attribute'],
        answer: 1,
        explanation: 'Its identity depends on the parent, and it is deleted when the parent is.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you decide whether something is an entity or an attribute?',
        answer: `Ask whether it can occur more than once for the same parent, whether it has properties of its own, and whether it has a life independent of the parent. If any answer is yes, it is an entity and gets its own table. A customer's date of birth is an attribute: one value, no properties. A customer's address is an entity: there may be several, and each has a street, a city and a type.`,
      },
      {
        question: 'What problems come from repeating columns such as phone1, phone2, phone3?',
        answer: `The number of values is fixed by the number of columns, so a fourth phone needs a schema change. Most rows leave some of the columns empty. Queries become awkward, since searching for a number means checking every column. It is a violation of first normal form. A separate table with one row per phone number removes all of these problems.`,
      },
    ],
  },

  'relationships': {
    whyItMatters: `A foreign key says how two tables are connected, and its delete rule says what happens to the children when the parent goes. Getting that rule wrong either blocks legitimate deletions or silently destroys data that should have been kept. It is a decision to make deliberately for every relationship.`,
    exercise: {
      prompt: `Order items cannot exist without their order. Create <code>order_items</code> so that deleting an order automatically deletes its items. The data is inserted and order 1 is then deleted. Count the items that remain as <code>remaining</code>.

Expected output: <code>remaining</code> then <code>0</code>`,
      starterCode: `CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT NOT NULL);

-- TODO: order_items (id, order_id, product) whose rows are deleted with their order

INSERT INTO orders (id, customer) VALUES (1, 'Asha');
INSERT INTO order_items (id, order_id, product) VALUES (1, 1, 'pen'), (2, 1, 'book');

DELETE FROM orders WHERE id = 1;

SELECT COUNT(*) AS remaining FROM order_items;`,
      hints: [
        'The referential action is written after the reference: <code>REFERENCES orders(id) ON DELETE CASCADE</code>.',
        'Without it, the delete would be refused, because the items still refer to the order.',
      ],
      solution: `CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT NOT NULL);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product TEXT NOT NULL
);

INSERT INTO orders (id, customer) VALUES (1, 'Asha');
INSERT INTO order_items (id, order_id, product) VALUES (1, 1, 'pen'), (2, 1, 'book');

DELETE FROM orders WHERE id = 1;

SELECT COUNT(*) AS remaining FROM order_items;`,
    },
    quiz: [
      {
        question: 'What does <code>ON DELETE CASCADE</code> do?',
        options: ['Blocks the deletion of the parent row', 'Sets the foreign key to NULL', 'Deletes the child rows when the parent row is deleted', 'Deletes the parent when a child is deleted'],
        answer: 2,
        explanation: 'It suits children that have no meaning without the parent.',
      },
      {
        question: 'How do you make a relationship mandatory, so that every order must have a customer?',
        options: ['Add an index', 'Declare the foreign key column NOT NULL', 'Use ON DELETE SET NULL', 'Make the column UNIQUE'],
        answer: 1,
        explanation: 'A nullable foreign key makes the relationship optional.',
      },
      {
        question: 'Which delete rule should protect a customer who has orders from being removed by accident?',
        options: ['ON DELETE RESTRICT (or NO ACTION)', 'ON DELETE CASCADE', 'ON DELETE SET DEFAULT', 'No foreign key at all'],
        answer: 0,
        explanation: 'The deletion is refused while child rows exist.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What referential actions are available on a foreign key?',
        answer: `<code>NO ACTION</code> and <code>RESTRICT</code> refuse to delete or update a parent row that still has children; this is the default. <code>CASCADE</code> applies the same deletion or key change to the children. <code>SET NULL</code> sets the foreign key in the children to null, keeping them without a parent. <code>SET DEFAULT</code> sets it to the column's default value. Each can be specified separately for <code>ON DELETE</code> and <code>ON UPDATE</code>.`,
      },
      {
        question: 'When is ON DELETE CASCADE dangerous?',
        answer: `When the children have value independent of the parent. Cascading from customers to orders would erase financial records when a customer is deleted, and a chain of cascades can remove far more than intended from a single statement. It is appropriate for true parts of the parent, such as order lines. For records that must be kept, use <code>RESTRICT</code>, or mark the parent as deleted without removing the row.`,
      },
    ],
  },

  'cardinality': {
    whyItMatters: `Cardinality is how many rows on one side can relate to how many on the other, and each case has exactly one correct table structure. Modelling a many-to-many relationship as one-to-many is among the most common design mistakes, and it shows up later as data that simply cannot be recorded.`,
    exercise: {
      prompt: `A user has at most one profile. Enforce that one-to-one relationship in the <code>profiles</code> table so that the second insert below, a second profile for user 1, is rejected. Then count the profiles.

Expected output: <code>profiles</code> then <code>1</code>`,
      starterCode: `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL);

-- TODO: profiles (id, user_id, bio) where each user can have only one profile

INSERT INTO users (id, name) VALUES (1, 'Asha');
INSERT INTO profiles (id, user_id, bio) VALUES (1, 1, 'Developer');
INSERT INTO profiles (id, user_id, bio) VALUES (2, 1, 'Second profile');

SELECT COUNT(*) AS profiles FROM profiles;`,
      hints: [
        'A foreign key alone allows many profiles per user.',
        'Adding <code>UNIQUE</code> to the foreign key column limits each user to one row.',
      ],
      solution: `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL);

CREATE TABLE profiles (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  bio TEXT
);

INSERT INTO users (id, name) VALUES (1, 'Asha');
INSERT INTO profiles (id, user_id, bio) VALUES (1, 1, 'Developer');
INSERT INTO profiles (id, user_id, bio) VALUES (2, 1, 'Second profile');

SELECT COUNT(*) AS profiles FROM profiles;`,
    },
    quiz: [
      {
        question: 'An author writes many posts, and each post has one author. Where does the foreign key go?',
        options: ['In the authors table', 'In a junction table', 'In both tables', 'In the posts table'],
        answer: 3,
        explanation: 'The foreign key is always on the "many" side of a one-to-many relationship.',
      },
      {
        question: 'How is a one-to-one relationship enforced?',
        options: ['With a foreign key that also has a UNIQUE constraint', 'With a junction table', 'With two foreign keys', 'It cannot be enforced'],
        answer: 0,
        explanation: 'The unique constraint stops a second child from pointing at the same parent.',
      },
      {
        question: 'Students take many courses and courses have many students. What is needed?',
        options: ['A course_id column in students', 'A third table with one row per student and course pair', 'A student_id column in courses', 'A list of ids in a text column'],
        answer: 1,
        explanation: 'A junction table turns one many-to-many relationship into two one-to-many relationships.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you model a many-to-many relationship?',
        answer: `With a junction table, also called a join or associative table. It has a foreign key to each of the two tables, and its primary key is usually the pair of those keys, which prevents the same pairing being recorded twice. The junction table can also carry attributes of the relationship itself, such as the date a student enrolled in a course or the grade obtained.`,
      },
      {
        question: 'When would you split a table into two with a one-to-one relationship?',
        answer: `When a group of columns is optional and usually empty, when it is large and rarely read, so that keeping it apart makes the main table smaller, or when it needs different access rules, such as sensitive personal details. The second table uses the first table's key as both its primary key and a foreign key. Otherwise a single table is simpler and avoids a join.`,
      },
    ],
  },

  'normalization-denormalization-trade-offs': {
    whyItMatters: `Normalised tables never contradict themselves, but reading from them can need many joins. Storing a calculated value, such as an order total, makes reads fast and adds the duty of keeping it correct. Knowing when that trade is worth making, and how to keep the copy honest, is real-world design.`,
    exercise: {
      prompt: `The <code>orders</code> table keeps a denormalised <code>total</code> so that listing orders needs no join. After the items are inserted, bring the stored total up to date by calculating it from <code>order_items</code>, then read it back.

Expected output: <code>total</code> then <code>174</code>`,
      starterCode: `CREATE TABLE orders (id INTEGER PRIMARY KEY, total INTEGER NOT NULL DEFAULT 0);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

INSERT INTO orders (id) VALUES (1);
INSERT INTO order_items (id, order_id, quantity, unit_price) VALUES (1, 1, 2, 12), (2, 1, 1, 150);

-- TODO: set orders.total to the sum of quantity * unit_price for that order

SELECT total FROM orders WHERE id = 1;`,
      hints: [
        'The new value can be a subquery: <code>SET total = (SELECT SUM(...) FROM order_items WHERE ...)</code>.',
        'Inside the subquery, compare <code>order_items.order_id</code> with <code>orders.id</code>.',
      ],
      solution: `CREATE TABLE orders (id INTEGER PRIMARY KEY, total INTEGER NOT NULL DEFAULT 0);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

INSERT INTO orders (id) VALUES (1);
INSERT INTO order_items (id, order_id, quantity, unit_price) VALUES (1, 1, 2, 12), (2, 1, 1, 150);

UPDATE orders
SET total = (
  SELECT SUM(quantity * unit_price)
  FROM order_items
  WHERE order_items.order_id = orders.id
)
WHERE id = 1;

SELECT total FROM orders WHERE id = 1;`,
    },
    quiz: [
      {
        question: 'What is the main risk of denormalization?',
        options: ['Queries become impossible', 'The table cannot be indexed', 'The redundant copy can become out of step with the source data', 'Foreign keys stop working'],
        answer: 2,
        explanation: 'Every write to the source must also update the copy.',
      },
      {
        question: 'What should a new schema start as?',
        options: ['Fully denormalised', 'Normalised, with denormalization added only where a measured problem justifies it', 'A single table', 'Without keys'],
        answer: 1,
        explanation: 'Premature denormalization adds complexity without a proven benefit.',
      },
      {
        question: 'Which workload benefits most from denormalization?',
        options: ['Reports and dashboards that are read constantly and written rarely', 'A table that is updated every second', 'A table with five rows', 'A table that is never read'],
        answer: 0,
        explanation: 'The cost of maintaining the copy is paid once per write and saved on every read.',
      },
    ],
    interviewQuestions: [
      {
        question: 'When would you denormalise, and how would you keep the data correct?',
        answer: `When a read path is too slow because of joins or aggregation, the problem has been measured, and indexes and caching have not solved it. Typical cases are a stored total, a counter of related rows, or a copied name. The copy is kept correct by updating it in the same transaction as the source, by a trigger, or by a scheduled job that recalculates it, and there should be a way to rebuild it from the source.`,
      },
      {
        question: 'Why store the unit price on an order item when the product already has a price?',
        answer: `Because they are different facts. The product's price is the current price and will change; the price on the order item is what the customer actually paid at that moment. Reading it from the product would silently rewrite every past order whenever the price changed. Copying it is not redundancy here but the recording of a historical value.`,
      },
    ],
  },

  'naming-standards': {
    whyItMatters: `Names in a schema last for years and are typed thousands of times. Inconsistent names, such as <code>custId</code> in one table and <code>customer_id</code> in another, cause wrong joins and constant lookups, and names that need quoting are a daily irritation. A convention applied everywhere makes a schema predictable enough to guess.`,
    exercise: {
      prompt: `The table below uses a reserved word as its name, mixed case, an abbreviation and a space, so every query has to quote the names. Rewrite the <code>CREATE TABLE</code> statement with consistent snake_case names: the table <code>orders</code> with the columns <code>id</code>, <code>customer_id</code> and <code>ordered_at</code>. The insert and select that follow then work as written.

Expected output: <code>id | customer_id | ordered_at</code> then <code>1 | 7 | 2026-01-15</code>`,
      starterCode: `CREATE TABLE "Order" (
  "OrderID" INTEGER PRIMARY KEY,
  "custId" INTEGER,
  "Order Date" TEXT
);

INSERT INTO orders (id, customer_id, ordered_at) VALUES (1, 7, '2026-01-15');

SELECT id, customer_id, ordered_at FROM orders;`,
      hints: [
        'Lower-case names with underscores never need quoting.',
        'A foreign key column is conventionally named after the table it refers to, plus <code>_id</code>.',
      ],
      solution: `CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  ordered_at TEXT
);

INSERT INTO orders (id, customer_id, ordered_at) VALUES (1, 7, '2026-01-15');

SELECT id, customer_id, ordered_at FROM orders;`,
    },
    quiz: [
      {
        question: 'Which naming style is the usual convention for tables and columns in SQL?',
        options: ['camelCase', 'PascalCase', 'UPPER CASE WITH SPACES', 'snake_case'],
        answer: 3,
        explanation: 'Many databases fold unquoted names to one case, so mixed case forces quoting.',
      },
      {
        question: 'Why avoid a table name such as <code>order</code> or <code>user</code>?',
        options: ['They are too short', 'They are reserved words and must be quoted in every query', 'They cannot have a primary key', 'They are case-sensitive'],
        answer: 1,
        explanation: 'The plural forms, orders and users, avoid the problem.',
      },
      {
        question: 'What is a good name for a foreign key that refers to the <code>customers</code> table?',
        options: ['customer_id', 'cid', 'fk1', 'customerRef'],
        answer: 0,
        explanation: 'The name states what it refers to and is the same in every table that has it.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What naming conventions do you follow in a database schema?',
        answer: `Lower-case snake_case for tables and columns. Table names either all plural or all singular, never mixed. A primary key named <code>id</code> and foreign keys named after the referenced table with <code>_id</code>. Booleans that read as questions, such as <code>is_active</code>. Timestamps ending in <code>_at</code> and dates in <code>_on</code>. No abbreviations that are not universal, and no reserved words. Above all, the same rule applied everywhere.`,
      },
      {
        question: 'Should table names be singular or plural?',
        answer: `Both are in common use and neither is wrong. Plural names, such as <code>orders</code>, read naturally because a table holds many rows and avoid reserved words such as <code>user</code> and <code>order</code>. Singular names, such as <code>order</code>, match the class names used by some ORMs. What matters is choosing one and applying it to every table, following the convention of the framework in use.`,
      },
    ],
  },

  'data-integrity': {
    whyItMatters: `Bad data is easy to let in and very hard to find and repair afterwards. A price of zero, a product with no name or a row pointing to a category that does not exist will each cause a failure somewhere far from where it entered. Rules written into the schema stop bad data at the door, whichever program is writing.`,
    exercise: {
      prompt: `Create a <code>products</code> table with four guards: <code>name</code> is required; <code>sku</code> is unique; <code>price</code> must be greater than zero; and <code>category_id</code> must refer to an existing category. Of the four inserts below, only the first is valid. Count the rows that were accepted.

Expected output: <code>total</code> then <code>1</code>`,
      starterCode: `CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO categories (id, name) VALUES (1, 'Stationery');

-- TODO: products (id, name, sku, price, category_id) with the four guards

INSERT INTO products (id, name, sku, price, category_id) VALUES (1, 'Pen', 'PEN-1', 12, 1);
INSERT INTO products (id, name, sku, price, category_id) VALUES (2, 'Pencil', 'PEN-1', 5, 1);
INSERT INTO products (id, name, sku, price, category_id) VALUES (3, 'Ruler', 'RUL-1', 0, 1);
INSERT INTO products (id, name, sku, price, category_id) VALUES (4, 'Bag', 'BAG-1', 450, 9);

SELECT COUNT(*) AS total FROM products;`,
      hints: [
        'The four guards are <code>NOT NULL</code>, <code>UNIQUE</code>, <code>CHECK (price &gt; 0)</code> and <code>REFERENCES categories(id)</code>.',
        'The second insert repeats a sku, the third has a price of zero and the fourth names a category that does not exist.',
      ],
      solution: `CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO categories (id, name) VALUES (1, 'Stationery');

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL CHECK (price > 0),
  category_id INTEGER NOT NULL REFERENCES categories(id)
);

INSERT INTO products (id, name, sku, price, category_id) VALUES (1, 'Pen', 'PEN-1', 12, 1);
INSERT INTO products (id, name, sku, price, category_id) VALUES (2, 'Pencil', 'PEN-1', 5, 1);
INSERT INTO products (id, name, sku, price, category_id) VALUES (3, 'Ruler', 'RUL-1', 0, 1);
INSERT INTO products (id, name, sku, price, category_id) VALUES (4, 'Bag', 'BAG-1', 450, 9);

SELECT COUNT(*) AS total FROM products;`,
    },
    quiz: [
      {
        question: 'What is an orphaned row?',
        options: ['A row with a NULL primary key', 'A child row whose foreign key points to a parent that no longer exists', 'A row with no columns', 'A duplicate row'],
        answer: 1,
        explanation: 'A foreign key constraint makes orphaned rows impossible.',
      },
      {
        question: 'Why should a column that is always required be declared <code>NOT NULL</code>?',
        options: ['It makes the column unique', 'It encrypts the column', 'The database then rejects any row that omits it, whichever program inserts the row', 'It creates an index'],
        answer: 2,
        explanation: 'Without it, a single buggy code path can leave gaps that break later queries.',
      },
      {
        question: 'Which constraint best expresses "a discount must be between 0 and 100"?',
        options: ['CHECK (discount BETWEEN 0 AND 100)', 'UNIQUE (discount)', 'DEFAULT 100', 'FOREIGN KEY (discount)'],
        answer: 0,
        explanation: 'A CHECK constraint holds a condition that every row must satisfy.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the types of data integrity?',
        answer: `Entity integrity: every row is uniquely identifiable, enforced by the primary key. Referential integrity: relationships between tables stay valid, enforced by foreign keys. Domain integrity: each column holds only acceptable values, enforced by data types, <code>NOT NULL</code>, <code>CHECK</code> and defaults. User-defined integrity covers business rules beyond these, enforced with constraints, triggers or application logic.`,
      },
      {
        question: 'Should validation live in the application or in the database?',
        answer: `In both, for different reasons. The application validates to give users immediate, friendly feedback. The database enforces the rules that must always hold, because applications have bugs and are not the only writers: scripts, imports and other services bypass them. Rules about the shape and consistency of the data belong in the schema; complex business workflows usually stay in the application.`,
      },
    ],
  },

  'audit-fields': {
    whyItMatters: `"When did this change, and who changed it?" is asked in every bug investigation, customer dispute and compliance review. If the answer was never recorded it cannot be recovered afterwards. A few standard columns on every table cost almost nothing and repeatedly save the day.`,
    exercise: {
      prompt: `Create an <code>articles</code> table with a <code>created_at</code> column that is filled in automatically with the current time and an <code>updated_at</code> column that starts empty. Insert an article, then update its title and set <code>updated_at</code> to the current time in the same statement. Finally check that both timestamps are set and that the update is not earlier than the creation.

Expected output: <code>has_created | updated_ok</code> then <code>1 | 1</code>`,
      starterCode: `-- TODO: articles (id, title, created_at filled automatically, updated_at)

INSERT INTO articles (id, title) VALUES (1, 'Draft');

-- TODO: change the title to 'Final' and set updated_at to the current time

SELECT created_at IS NOT NULL AS has_created, updated_at >= created_at AS updated_ok
FROM articles;`,
      hints: [
        'A default supplies the creation time: <code>created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP</code>.',
        'In the update, set two columns: <code>SET title = ..., updated_at = CURRENT_TIMESTAMP</code>.',
      ],
      solution: `CREATE TABLE articles (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

INSERT INTO articles (id, title) VALUES (1, 'Draft');

UPDATE articles
SET title = 'Final', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

SELECT created_at IS NOT NULL AS has_created, updated_at >= created_at AS updated_ok
FROM articles;`,
    },
    quiz: [
      {
        question: 'How is <code>created_at</code> best filled in?',
        options: ['By the user typing it', 'By a nightly job', 'It should be left NULL', 'By a column default of the current timestamp'],
        answer: 3,
        explanation: 'A default means no code path can forget it.',
      },
      {
        question: 'Why is a trigger often used for <code>updated_at</code>?',
        options: ['It sets the value on every update, even when the statement that made the change forgot to', 'Triggers are faster than updates', 'Defaults cannot be timestamps', 'It makes the column unique'],
        answer: 0,
        explanation: 'A default applies only on insert, so updates need another mechanism.',
      },
      {
        question: 'In which time zone should audit timestamps be stored?',
        options: ['The zone of the server', 'UTC', 'The zone of each user', 'It does not matter'],
        answer: 1,
        explanation: 'UTC is unambiguous; conversion to local time happens when the value is displayed.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What audit columns do you add to tables, and why?',
        answer: `<code>created_at</code> and <code>updated_at</code> record when a row was inserted and last changed; <code>created_by</code> and <code>updated_by</code> record which user or service did it. They answer questions during debugging, support, security review and compliance, and they are useful to the application itself, for sorting by recency or finding rows changed since the last synchronisation. They are cheap to add at the start and impossible to reconstruct later.`,
      },
      {
        question: 'Are audit columns enough to see the full history of a row?',
        answer: `No. They show only the time and author of the latest change, not what the previous values were or how many changes there have been. A full history needs an audit or history table that receives a row for every change, usually written by a trigger, or an event log. Audit columns cover the common question "when was this last touched"; history tables cover "what did it look like before".`,
      },
    ],
  },

  'soft-delete': {
    whyItMatters: `Users delete things by mistake, and businesses often must keep records that have been "removed". Marking a row as deleted instead of erasing it allows recovery and preserves history. The pattern has costs, though: every query has to remember to exclude deleted rows, and unique constraints need extra thought.`,
    exercise: {
      prompt: `Add soft delete to the <code>users</code> table: a <code>deleted_at</code> column, and a unique index on <code>email</code> that applies only to rows that are not deleted, so that the address can be reused. Soft-delete Asha, then register a new user with the same email. Count the active users, and then all rows.

Expected output: <code>active</code>, <code>1</code>, <code>total</code>, <code>2</code> (one per line)`,
      starterCode: `-- TODO: users (id, email, deleted_at)

-- TODO: a unique index on email that covers only rows where deleted_at IS NULL

INSERT INTO users (id, email) VALUES (1, 'asha@example.com');

-- TODO: soft-delete user 1 by setting deleted_at to the current time

INSERT INTO users (id, email) VALUES (2, 'asha@example.com');

SELECT COUNT(*) AS active FROM users WHERE deleted_at IS NULL;
SELECT COUNT(*) AS total FROM users;`,
      hints: [
        'A partial index has a <code>WHERE</code> clause: <code>CREATE UNIQUE INDEX ... ON users (email) WHERE deleted_at IS NULL</code>.',
        'A soft delete is an <code>UPDATE</code>, not a <code>DELETE</code>.',
      ],
      solution: `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  deleted_at TIMESTAMP
);

CREATE UNIQUE INDEX users_email_active ON users (email) WHERE deleted_at IS NULL;

INSERT INTO users (id, email) VALUES (1, 'asha@example.com');

UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = 1;

INSERT INTO users (id, email) VALUES (2, 'asha@example.com');

SELECT COUNT(*) AS active FROM users WHERE deleted_at IS NULL;
SELECT COUNT(*) AS total FROM users;`,
    },
    quiz: [
      {
        question: 'What is a soft delete?',
        options: ['Deleting a row slowly', 'Deleting only some columns', 'Marking a row as deleted, for example with a deleted_at timestamp, without removing it', 'Deleting from a backup'],
        answer: 2,
        explanation: 'The row stays in the table and can be restored.',
      },
      {
        question: 'What is the main ongoing cost of soft delete?',
        options: ['Every query must exclude the deleted rows, and forgetting to do so shows deleted data', 'Rows can never be read again', 'Indexes stop working', 'Transactions are disabled'],
        answer: 0,
        explanation: 'A view of the active rows, or a default filter in the ORM, reduces the risk.',
      },
      {
        question: 'Why does a plain <code>UNIQUE</code> constraint on email cause trouble with soft delete?',
        options: ['It is slow', 'A soft-deleted row still holds the email, so the address cannot be registered again', 'It allows duplicates', 'It deletes the row'],
        answer: 1,
        explanation: 'A partial unique index restricted to the rows that are not deleted solves it.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the trade-offs of soft delete compared with hard delete?',
        answer: `Soft delete allows recovery from mistakes, keeps history and references intact, and supports audits. Its costs are that every query must filter out deleted rows, tables and indexes grow with data nobody sees, unique constraints need partial indexes, and foreign keys no longer prevent references to a "deleted" parent. Hard delete is simpler and keeps tables small, but the data is gone.`,
      },
      {
        question: 'How does soft delete interact with privacy laws such as the GDPR?',
        answer: `A soft-deleted row still contains the personal data, so it does not satisfy a request for erasure. When a person exercises that right, the data has to be truly removed or irreversibly anonymised, including in backups according to the retention policy. A common design soft-deletes first for a short recovery period and then permanently deletes or anonymises the row with a scheduled job.`,
      },
    ],
  },

  'versioning': {
    whyItMatters: `Prices change, addresses change, and contracts are amended, yet an invoice from last March must still show last March's price. If a row is simply overwritten, the earlier value is gone. Versioning records how data changed over time, which reporting, auditing and dispute resolution all depend on.`,
    exercise: {
      prompt: `Each row of <code>product_prices</code> is one version of a price with the dates between which it applied; the current version has no end date. Write the query that returns the price of product 1 that was in effect on 15 March 2026.

Expected output: <code>price</code> then <code>120</code>`,
      starterCode: `CREATE TABLE product_prices (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  price INTEGER NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE
);

INSERT INTO product_prices (id, product_id, price, valid_from, valid_to) VALUES
  (1, 1, 100, '2026-01-01', '2026-03-01'),
  (2, 1, 120, '2026-03-01', '2026-06-01'),
  (3, 1, 135, '2026-06-01', NULL);

-- TODO: the price of product 1 in effect on 2026-03-15`,
      hints: [
        'The date must be on or after <code>valid_from</code> and before <code>valid_to</code>.',
        'The current version has a null <code>valid_to</code>, so allow for it: <code>(valid_to IS NULL OR \'2026-03-15\' &lt; valid_to)</code>.',
      ],
      solution: `CREATE TABLE product_prices (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  price INTEGER NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE
);

INSERT INTO product_prices (id, product_id, price, valid_from, valid_to) VALUES
  (1, 1, 100, '2026-01-01', '2026-03-01'),
  (2, 1, 120, '2026-03-01', '2026-06-01'),
  (3, 1, 135, '2026-06-01', NULL);

SELECT price
FROM product_prices
WHERE product_id = 1
  AND valid_from <= '2026-03-15'
  AND (valid_to IS NULL OR '2026-03-15' < valid_to);`,
    },
    quiz: [
      {
        question: 'What is lost when a price is changed with a plain <code>UPDATE</code>?',
        options: ['Nothing', 'The primary key', 'The index', 'The previous price'],
        answer: 3,
        explanation: 'An update overwrites the value, so the history disappears unless it is recorded elsewhere.',
      },
      {
        question: 'In an effective-dated table, how is the current version usually identified?',
        options: ['Its valid_to is NULL (or a far-future date)', 'It has the lowest id', 'It is in a separate database', 'It has valid_from set to NULL'],
        answer: 0,
        explanation: 'An open-ended range means "still in effect".',
      },
      {
        question: 'What does a history (audit) table contain?',
        options: ['Only the current rows', 'A copy of each row as it was before or after every change, with the time of the change', 'The table definitions', 'Deleted indexes'],
        answer: 1,
        explanation: 'The main table stays simple, and the history is consulted only when needed.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What approaches are there for keeping the history of data?',
        answer: `A history table: the main table holds the current row and each change writes the old or new version to a separate table, usually by trigger. Effective dating: every version is a row in the same table with a validity range, and a query picks the version for a given date. Event sourcing: the changes themselves are stored as an append-only log and the current state is derived from it. The choice depends on how often history is queried.`,
      },
      {
        question: 'Why use a half-open date range, from inclusive to exclusive?',
        answer: `With <code>valid_from &lt;= date AND date &lt; valid_to</code>, one version ends at exactly the moment the next begins, so every instant belongs to exactly one version, with no gap and no overlap. With both ends inclusive, the boundary day would match two versions, or the end would have to be "the day before", which fails for timestamps. Half-open ranges avoid these edge cases.`,
      },
    ],
  },

  'migration-strategy': {
    whyItMatters: `A live database cannot be dropped and recreated; its structure has to change while the application keeps running and the data stays safe. Renaming a column in one step breaks every running copy of the code that still uses the old name. Staged, reversible migrations are how teams change schemas without downtime.`,
    exercise: {
      prompt: `Rename <code>customers.name</code> to <code>full_name</code> in the safe, staged way, as three separate steps: add the new column; copy the existing values into it; and, once nothing uses the old column any more, drop it. Then read the new column.

Expected output: <code>full_name</code> then <code>Asha Rao</code>`,
      starterCode: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO customers (id, name) VALUES (1, 'Asha Rao');

-- TODO: migration 1: add the column full_name

-- TODO: migration 2: backfill full_name from name

-- TODO: migration 3 (after the application has switched over): drop the column name

SELECT full_name FROM customers;`,
      hints: [
        'Columns are added and removed with <code>ALTER TABLE ... ADD COLUMN</code> and <code>ALTER TABLE ... DROP COLUMN</code>.',
        'The backfill is an <code>UPDATE</code> that sets one column from the other.',
      ],
      solution: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO customers (id, name) VALUES (1, 'Asha Rao');

ALTER TABLE customers ADD COLUMN full_name TEXT;

UPDATE customers SET full_name = name;

ALTER TABLE customers DROP COLUMN name;

SELECT full_name FROM customers;`,
    },
    quiz: [
      {
        question: 'Which change is safe to deploy without coordinating with the application?',
        options: ['Dropping a column', 'Renaming a table', 'Adding a new nullable column', 'Changing a column\'s type'],
        answer: 2,
        explanation: 'Existing code does not know about the new column and is unaffected by it.',
      },
      {
        question: 'What is a "down" migration?',
        options: ['The script that reverses a migration', 'A migration that failed', 'A migration that deletes the database', 'A migration run on a slow server'],
        answer: 0,
        explanation: 'It allows a deployment to be rolled back.',
      },
      {
        question: 'Why is renaming a column in a single step risky on a live system?',
        options: ['The rename is slow', 'The data is lost', 'It breaks the indexes', 'Application code still running with the old name fails immediately'],
        answer: 3,
        explanation: 'During a deployment, old and new versions of the code run at the same time.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you make a breaking schema change without downtime?',
        answer: `With the expand-and-contract pattern. Expand: add the new column or table alongside the old one. Deploy code that writes to both and backfill the existing rows. Switch reads to the new structure. Contract: once no deployed code uses the old structure, remove it in a later migration. Each step is compatible with the code versions running at that moment, so nothing breaks at any point.`,
      },
      {
        question: 'What is a migration tool and why use one?',
        answer: `A migration tool, such as Flyway, Liquibase, Alembic or the one built into a framework, keeps schema changes as ordered, versioned files in the code repository and records in the database which have been applied. Every environment can then be brought to the same schema by running the pending migrations in order. Changes are reviewed like code, are repeatable, and can be reversed.`,
      },
    ],
  },

  'indexing-strategy': {
    whyItMatters: `Indexes decide whether a query takes milliseconds or seconds, and they are designed from the queries the application actually runs, not from guesses. An index on the wrong columns, or with the columns in the wrong order, is dead weight that slows every write and helps nothing.`,
    exercise: {
      prompt: `The application's most frequent query lists one customer's orders, newest first. Create a composite index named <code>idx_orders_customer_created</code> designed for exactly that query, with the columns in the right order. Then run the query for customer 1, returning the two newest order ids.

Expected output: <code>id</code>, <code>3</code>, <code>1</code> (one per line)`,
      starterCode: `CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, created_at DATE NOT NULL);
INSERT INTO orders (id, customer_id, created_at) VALUES
  (1, 1, '2026-02-10'),
  (2, 2, '2026-02-11'),
  (3, 1, '2026-03-05'),
  (4, 1, '2026-01-20');

-- TODO: the composite index for "orders of one customer, newest first"

-- TODO: the ids of customer 1's two newest orders`,
      hints: [
        'Put the column used for equality first and the column used for sorting second: <code>(customer_id, created_at)</code>.',
        'The query filters on <code>customer_id</code>, sorts by <code>created_at DESC</code> and takes <code>LIMIT 2</code>.',
      ],
      solution: `CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, created_at DATE NOT NULL);
INSERT INTO orders (id, customer_id, created_at) VALUES
  (1, 1, '2026-02-10'),
  (2, 2, '2026-02-11'),
  (3, 1, '2026-03-05'),
  (4, 1, '2026-01-20');

CREATE INDEX idx_orders_customer_created ON orders (customer_id, created_at);

SELECT id
FROM orders
WHERE customer_id = 1
ORDER BY created_at DESC
LIMIT 2;`,
    },
    quiz: [
      {
        question: 'For a query with <code>WHERE status = ? ORDER BY created_at</code>, which composite index fits best?',
        options: ['(created_at, status)', '(status, created_at)', '(id, status)', 'Two separate single-column indexes'],
        answer: 1,
        explanation: 'The equality column comes first, so the matching rows are already in created_at order.',
      },
      {
        question: 'What should guide the choice of indexes?',
        options: ['The queries the application actually runs', 'Indexing every column', 'The alphabetical order of the columns', 'The size of the server'],
        answer: 0,
        explanation: 'An index that no query uses only costs storage and write time.',
      },
      {
        question: 'What does every additional index cost?',
        options: ['Slower reads', 'Fewer rows', 'Weaker constraints', 'Slower inserts, updates and deletes, and more storage'],
        answer: 3,
        explanation: 'Each write must also maintain every index on the table.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you decide the order of columns in a composite index?',
        answer: `Put the columns compared with equality first, then the column used for a range condition or for sorting. An index is usable only from its leftmost column, so <code>(customer_id, created_at)</code> serves a filter on <code>customer_id</code> alone, or on both, but not on <code>created_at</code> alone. Among equality columns, the more selective one usually goes first. The order should follow the most important queries.`,
      },
      {
        question: 'What is a covering index?',
        answer: `An index that contains every column a query needs, so the database can answer from the index alone without reading the table rows, which is called an index-only scan. Extra columns can be added to the key, or, in PostgreSQL and SQL Server, attached with <code>INCLUDE</code>. It speeds up frequent queries that read a few columns, at the cost of a larger index.`,
      },
    ],
  },

  'scalable-api-oriented-database-design': {
    whyItMatters: `An API that lists records page by page looks fine with a hundred rows and collapses with ten million if the pages are fetched the naive way. Exposing sequential ids also tells competitors how many customers you have and invites people to guess other users' records. Both are decisions made in the schema.`,
    exercise: {
      prompt: `Rows have an internal numeric <code>id</code> and a separate <code>public_id</code> that the API exposes. Fetch the next page with keyset pagination: the client has already seen rows up to id 2, and the page size is 2. Return the <code>id</code> and <code>public_id</code> of the next page.

Expected output: <code>id | public_id</code>, <code>3 | c</code>, <code>4 | d</code> (one per line)`,
      starterCode: `CREATE TABLE articles (id INTEGER PRIMARY KEY, public_id TEXT NOT NULL UNIQUE, title TEXT);
INSERT INTO articles (id, public_id, title) VALUES
  (1, 'a', 'One'), (2, 'b', 'Two'), (3, 'c', 'Three'), (4, 'd', 'Four'), (5, 'e', 'Five');

-- TODO: the next page of 2 rows after id 2, using keyset pagination (no OFFSET)`,
      hints: [
        'Keyset pagination filters on the last value seen: <code>WHERE id &gt; 2</code>.',
        'Sort by the same column and take the page size with <code>LIMIT 2</code>.',
      ],
      solution: `CREATE TABLE articles (id INTEGER PRIMARY KEY, public_id TEXT NOT NULL UNIQUE, title TEXT);
INSERT INTO articles (id, public_id, title) VALUES
  (1, 'a', 'One'), (2, 'b', 'Two'), (3, 'c', 'Three'), (4, 'd', 'Four'), (5, 'e', 'Five');

SELECT id, public_id
FROM articles
WHERE id > 2
ORDER BY id
LIMIT 2;`,
    },
    quiz: [
      {
        question: 'Why does <code>OFFSET 1000000 LIMIT 20</code> become slow?',
        options: ['OFFSET is not supported on large tables', 'LIMIT must be larger than OFFSET', 'The database must read and discard a million rows before returning 20', 'It locks the table'],
        answer: 2,
        explanation: 'The cost grows with the page number.',
      },
      {
        question: 'How does keyset (cursor) pagination find the next page?',
        options: ['It filters on the last value seen, such as WHERE id > last_id, and uses the index to jump there', 'It counts all the rows', 'It caches every page', 'It uses a larger OFFSET'],
        answer: 0,
        explanation: 'Each page costs the same, however deep it is.',
      },
      {
        question: 'Why expose a random public identifier, such as a UUID, instead of a sequential id?',
        options: ['It is shorter', 'It sorts better', 'It is required by SQL', 'Sequential ids reveal how many records exist and make other records easy to guess'],
        answer: 3,
        explanation: 'The internal numeric key can still be used for joins.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Compare offset pagination with keyset pagination.',
        answer: `Offset pagination, <code>LIMIT n OFFSET m</code>, is simple and lets a client jump to any page, but the database reads and throws away all the skipped rows, so deep pages are slow, and rows inserted or deleted between requests cause items to be repeated or missed. Keyset pagination filters on the last value seen and uses an index, so every page is equally fast and stable under changes, but the client can only move to the next or previous page.`,
      },
      {
        question: 'What are the trade-offs of UUIDs compared with auto-increment integers as keys?',
        answer: `Integers are small, fast to compare and index, and naturally ordered, but they reveal volumes, are guessable, and need a central generator. UUIDs can be generated anywhere without coordination and are not guessable, but they take 16 bytes, and fully random ones scatter inserts across the index, which hurts write performance. Time-ordered UUIDs, such as version 7, reduce that cost. A common design uses an integer internally and a UUID as the public identifier.`,
      },
    ],
  },
}
