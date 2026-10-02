// Practice blocks for the PostgreSQL course. Merged onto the lesson entries in index.js by
// slug, so the lesson prose files stay unchanged.
// Most of this course is about features that exist only in PostgreSQL, so those exercises
// are marked runnable: false: they need a real PostgreSQL server and describe the result
// in words. The three that use standard SQL (CTEs, window functions, savepoints) run on
// SQLite in the playground and follow the "Expected output:" convention.
export const practicePostgresql = {
  'postgresql-setup-concepts': {
    whyItMatters: `PostgreSQL is the most widely recommended open-source database for new projects, and <code>psql</code> is the tool you will have on every server, whatever graphical client you prefer. A handful of its backslash commands are enough to find your way around any database you are handed.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses the <code>psql</code> client, so it needs a PostgreSQL installation and cannot run in the playground. Write the commands, in order, to: create a database named <code>shop</code>; connect to it; create a table <code>products</code> with an integer primary key <code>id</code> and a text <code>name</code>; list the tables; describe the <code>products</code> table; and quit.

Expected result: the list of tables shows products, and the description shows its two columns and the primary key index.`,
      starterCode: `-- 1. create the database shop

-- 2. connect to it

-- 3. create the products table

-- 4. list the tables

-- 5. describe products

-- 6. quit`,
      hints: [
        'SQL statements end with a semicolon; psql meta-commands start with a backslash and do not.',
        'The meta-commands are <code>\\c</code> to connect, <code>\\dt</code> to list tables, <code>\\d name</code> to describe one and <code>\\q</code> to quit.',
      ],
      solution: `-- 1. create the database shop
CREATE DATABASE shop;

-- 2. connect to it
\\c shop

-- 3. create the products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT
);

-- 4. list the tables
\\dt

-- 5. describe products
\\d products

-- 6. quit
\\q`,
    },
    quiz: [
      {
        question: 'Which psql meta-command lists the tables in the current database?',
        options: ['\\l', '\\dt', '\\c', '\\q'],
        answer: 1,
        explanation: '\\l lists databases, \\c connects to one, and \\q quits.',
      },
      {
        question: 'On which port does PostgreSQL listen by default?',
        options: ['5432', '3306', '8080', '27017'],
        answer: 0,
        explanation: '3306 is the default for MySQL and 27017 for MongoDB.',
      },
      {
        question: 'Can a single query join tables from two different PostgreSQL databases on the same server?',
        options: ['Yes, always', 'Only with SELECT *', 'Only inside a transaction', 'No; databases are isolated, and a connection sees only one of them'],
        answer: 3,
        explanation: 'Schemas inside one database are the usual way to separate groups of tables that must still be queried together.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What makes PostgreSQL different from other relational databases?',
        answer: `It is open source with a permissive licence, follows the SQL standard closely, and has an unusually rich feature set: JSONB for document data, arrays, range types, full-text search, several index types including GIN and GiST, window functions, common table expressions and transactional DDL. It can be extended with new types, functions and extensions such as PostGIS for geographic data. Its reliability under concurrency makes it a common default for new applications.`,
      },
      {
        question: 'Which psql commands do you use most?',
        answer: `<code>\\l</code> lists the databases and <code>\\c name</code> connects to one. <code>\\dt</code> lists tables, <code>\\d table</code> shows a table's columns, indexes and constraints, <code>\\dn</code> lists schemas and <code>\\du</code> lists roles. <code>\\x</code> switches to expanded output for wide rows, <code>\\timing</code> shows how long each query takes, <code>\\i file</code> runs a script, and <code>\\q</code> quits.`,
      },
    ],
  },

  'data-types': {
    whyItMatters: `PostgreSQL offers a richer set of types than most databases, and the right choice prevents whole categories of bugs: money that drifts by a paisa, timestamps that are wrong after a server moves time zone, identifiers that collide. Changing the type of a column on a large table later is slow and risky.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL types that SQLite does not have, so it needs a PostgreSQL server. Create a <code>payments</code> table with: a UUID primary key that the database generates; an <code>amount</code> stored exactly, with two decimal places; a required text <code>currency</code>; a boolean <code>refunded</code> that defaults to false; and a <code>paid_at</code> timestamp with time zone that defaults to the current time. Then insert a payment giving only the amount and currency, and return the whole row.

Expected result: one row, with a generated id, refunded false and paid_at set to the time of the insert.`,
      starterCode: `-- TODO: create the payments table

-- TODO: insert amount 499.99 in INR and return the inserted row`,
      hints: [
        'The types are <code>UUID</code>, <code>NUMERIC(12, 2)</code>, <code>TEXT</code>, <code>BOOLEAN</code> and <code>TIMESTAMPTZ</code>.',
        '<code>gen_random_uuid()</code> generates a UUID, <code>now()</code> gives the current time, and <code>RETURNING *</code> returns the inserted row.',
      ],
      solution: `CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL,
  refunded BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO payments (amount, currency)
VALUES (499.99, 'INR')
RETURNING *;`,
    },
    quiz: [
      {
        question: 'Which type should hold money in PostgreSQL?',
        options: ['REAL', 'DOUBLE PRECISION', 'NUMERIC', 'TEXT'],
        answer: 2,
        explanation: 'NUMERIC stores decimal values exactly. The floating-point types store approximations.',
      },
      {
        question: 'What is the practical difference between <code>TEXT</code> and <code>VARCHAR(n)</code> in PostgreSQL?',
        options: ['VARCHAR(n) enforces a maximum length; there is no performance difference', 'TEXT is much slower', 'TEXT cannot be indexed', 'VARCHAR(n) is stored as numbers'],
        answer: 0,
        explanation: 'Both are stored in the same way, so TEXT is the usual choice unless a length limit is a real rule.',
      },
      {
        question: 'What does <code>TIMESTAMPTZ</code> store?',
        options: ['The time and the name of the time zone', 'A time without a date', 'A text string', 'A single point in time, kept in UTC and shown in the session\'s time zone'],
        answer: 3,
        explanation: 'The original zone is not kept; the value is converted to UTC on the way in.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between TIMESTAMP and TIMESTAMPTZ?',
        answer: `<code>TIMESTAMP</code>, without time zone, stores a date and time exactly as given, with no notion of zone, so the same value means different moments to different readers. <code>TIMESTAMPTZ</code> converts the input to UTC for storage and converts it to the session's time zone for display, so it always identifies one exact moment. <code>TIMESTAMPTZ</code> is the right choice for recording when something happened.`,
      },
      {
        question: 'Why should money not be stored in a floating-point column?',
        answer: `Floating-point types store binary approximations, and most decimal fractions, such as 0.1, cannot be represented exactly. Sums and comparisons then come out slightly wrong: 0.1 plus 0.2 is not exactly 0.3. Over many transactions the errors accumulate and totals fail to reconcile. <code>NUMERIC</code> stores decimal digits exactly and gives correct arithmetic; the alternative is an integer count of the smallest unit.`,
      },
    ],
  },

  'schemas': {
    whyItMatters: `As a database grows, a single flat list of hundreds of tables becomes hard to manage. Schemas are namespaces inside a database: they group related tables, let two tables share a name, and are the unit on which permissions are commonly granted. Multi-tenant systems and applications with several modules use them constantly.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL schemas and <code>search_path</code>, so it needs a PostgreSQL server. Create a schema named <code>sales</code> and a table <code>orders</code> inside it. Insert a row using the fully qualified name. Then change the search path so that <code>sales</code> is searched first, and select from <code>orders</code> without the schema prefix.

Expected result: the final SELECT finds sales.orders without the prefix and returns the inserted row.`,
      starterCode: `-- TODO: create the schema sales

-- TODO: create sales.orders (id integer primary key, total numeric)

-- TODO: insert a row using the qualified name

-- TODO: put sales first in the search path

-- TODO: select from orders without the prefix`,
      hints: [
        'A table in a schema is written <code>schema_name.table_name</code>.',
        'The search path is set with <code>SET search_path TO sales, public</code>.',
      ],
      solution: `CREATE SCHEMA sales;

CREATE TABLE sales.orders (
  id INTEGER PRIMARY KEY,
  total NUMERIC(10, 2)
);

INSERT INTO sales.orders (id, total) VALUES (1, 250.00);

SET search_path TO sales, public;

SELECT id, total FROM orders;`,
    },
    quiz: [
      {
        question: 'In which schema is a table created when no schema is named, with the default settings?',
        options: ['public', 'pg_catalog', 'default', 'main'],
        answer: 0,
        explanation: 'It is the first schema in the default search path that exists.',
      },
      {
        question: 'What does <code>search_path</code> control?',
        options: ['Where data files are stored on disk', 'The order in which schemas are searched for an unqualified table name', 'The order of query results', 'The location of backups'],
        answer: 1,
        explanation: 'The first schema in the path that contains a matching name is used.',
      },
      {
        question: 'Can two tables with the same name exist in one database?',
        options: ['No, never', 'Only if they have different columns', 'Yes, if they are in different schemas', 'Only temporary tables'],
        answer: 2,
        explanation: 'A schema is a namespace, so sales.orders and archive.orders can coexist.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a schema in PostgreSQL and what is it used for?',
        answer: `A schema is a named namespace inside a database that holds tables, views, functions and other objects. Schemas organise a large database into logical groups, allow objects in different groups to share a name, separate the data of different tenants or applications, and serve as a unit for permissions through <code>GRANT ... ON SCHEMA</code>. Unlike separate databases, objects in different schemas can be joined in one query.`,
      },
      {
        question: 'What is the difference between a database and a schema in PostgreSQL?',
        answer: `A database is the top-level container to which a client connects; a connection cannot query across databases. A schema lives inside a database and groups objects; one query can use tables from several schemas. Separate databases give strong isolation; schemas give organisation and name separation while keeping the data queryable together.`,
      },
    ],
  },

  'sequences-identity': {
    whyItMatters: `Almost every table needs an id that the database assigns by itself. PostgreSQL has an older way of doing this, <code>SERIAL</code>, and a newer standard one, identity columns. Existing schemas are full of the first and new ones should use the second, so you need to recognise both and know how they differ.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL identity columns, so it needs a PostgreSQL server. Create a <code>customers</code> table whose <code>id</code> is a <code>BIGINT</code> identity column that the database always generates, and which is the primary key. Insert two customers without giving an id, returning the id each time.

Expected result: the two inserts return 1 and 2. An insert that supplies its own id would be rejected.`,
      starterCode: `-- TODO: customers (id generated always as identity, name)

-- TODO: insert 'Asha' and return the generated id

-- TODO: insert 'Ravi' and return the generated id`,
      hints: [
        'The column is declared <code>id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY</code>.',
        'The new value is returned with <code>RETURNING id</code>.',
      ],
      solution: `CREATE TABLE customers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO customers (name) VALUES ('Asha') RETURNING id;

INSERT INTO customers (name) VALUES ('Ravi') RETURNING id;`,
    },
    quiz: [
      {
        question: 'What is the difference between <code>GENERATED ALWAYS</code> and <code>GENERATED BY DEFAULT</code>?',
        options: ['There is none', 'BY DEFAULT generates random values', 'ALWAYS allows NULL', 'ALWAYS rejects a value supplied by the INSERT; BY DEFAULT uses the supplied value if there is one'],
        answer: 3,
        explanation: 'ALWAYS can still be overridden explicitly with OVERRIDING SYSTEM VALUE.',
      },
      {
        question: 'An insert takes id 5 from a sequence and its transaction is rolled back. What id does the next insert get?',
        options: ['5 again', '6; sequence values are not returned on rollback, so gaps are normal', '1', 'An error'],
        answer: 1,
        explanation: 'Sequences guarantee uniqueness, not a gap-free series.',
      },
      {
        question: 'Why is <code>BIGINT</code> often preferred to <code>INTEGER</code> for an id column?',
        options: ['An INTEGER runs out at about 2.1 billion, and changing the type of a large table later is painful', 'It is faster to insert', 'It uses less space', 'INTEGER cannot be a primary key'],
        answer: 0,
        explanation: 'The extra four bytes per row are a small price for never hitting the limit.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between SERIAL and an identity column?',
        answer: `<code>SERIAL</code> is a PostgreSQL shorthand that creates an integer column, a separate sequence and a default that reads from it; the sequence is only loosely tied to the column, and its permissions are managed separately. <code>GENERATED ... AS IDENTITY</code> is the SQL-standard form, available since PostgreSQL 10: the sequence belongs to the column, and <code>GENERATED ALWAYS</code> prevents values being supplied by accident. Identity columns are recommended for new tables.`,
      },
      {
        question: 'Can you rely on generated ids having no gaps?',
        answer: `No. A sequence value is consumed when it is requested and is not given back if the transaction rolls back or the insert fails, and sequences may also cache values that are lost on a restart. Ids are therefore unique and increasing but not consecutive. A business requirement for gap-free numbers, as for invoices in some jurisdictions, needs a separate, deliberately serialised numbering scheme.`,
      },
    ],
  },

  'json-jsonb': {
    whyItMatters: `Some data does not fit fixed columns: product attributes that differ by category, settings, payloads from other systems. <code>JSONB</code> stores such documents inside an ordinary table and lets you query and index them, giving much of the flexibility of a document database without leaving PostgreSQL.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL's JSONB type and operators, so it needs a PostgreSQL server. Create a <code>products</code> table with a <code>JSONB</code> column named <code>attributes</code>. Insert a pen whose attributes are colour blue and pack size 10, and a bag whose attributes are colour red. Write one query that returns the name and the colour, as text, of every product, and a second that finds the products whose attributes contain colour blue, using the containment operator.

Expected result: the first query returns Pen with blue and Bag with red; the second returns Pen.`,
      starterCode: `-- TODO: products (id, name, attributes jsonb)

-- TODO: insert the pen and the bag

-- TODO: name and colour (as text) of every product

-- TODO: products whose attributes contain {"color": "blue"}`,
      hints: [
        '<code>-&gt;&gt;</code> extracts a value as text: <code>attributes -&gt;&gt; \'color\'</code>.',
        'Containment is written <code>attributes @&gt; \'{"color": "blue"}\'</code>.',
      ],
      solution: `CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  attributes JSONB NOT NULL DEFAULT '{}'
);

INSERT INTO products (id, name, attributes) VALUES
  (1, 'Pen', '{"color": "blue", "pack_size": 10}'),
  (2, 'Bag', '{"color": "red"}');

SELECT name, attributes ->> 'color' AS color
FROM products;

SELECT name
FROM products
WHERE attributes @> '{"color": "blue"}';`,
    },
    quiz: [
      {
        question: 'What is the difference between the <code>-&gt;</code> and <code>-&gt;&gt;</code> operators?',
        options: ['There is none', '-> returns the value as JSON; ->> returns it as text', '->> returns JSON', '-> works only on arrays'],
        answer: 1,
        explanation: 'Use ->> when comparing with a text value or returning the value to an application.',
      },
      {
        question: 'Which index type speeds up JSONB containment queries with <code>@&gt;</code>?',
        options: ['B-tree', 'Hash', 'GIN', 'No index can'],
        answer: 2,
        explanation: 'A GIN index indexes the keys and values inside each document.',
      },
      {
        question: 'How does <code>JSONB</code> differ from <code>JSON</code>?',
        options: ['JSONB is stored in a parsed binary form, which is faster to query and can be indexed', 'JSONB keeps the original text exactly', 'JSON is faster to query', 'JSONB cannot hold arrays'],
        answer: 0,
        explanation: 'JSON keeps the exact text, including whitespace and key order, and is reparsed on every use.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between JSON and JSONB in PostgreSQL?',
        answer: `<code>JSON</code> stores the document as text exactly as received, preserving whitespace, key order and duplicate keys, and parses it each time it is queried. <code>JSONB</code> stores a decomposed binary form: slightly slower to write, but much faster to query, and it supports indexing and operators such as containment. It does not keep whitespace, key order or duplicate keys. <code>JSONB</code> is the right choice in almost every case.`,
      },
      {
        question: 'When should data go in a JSONB column and when in ordinary columns?',
        answer: `Use ordinary columns for data that every row has, that is filtered, joined or constrained, since columns have types, constraints, foreign keys and good statistics for the query planner. Use <code>JSONB</code> for attributes that vary from row to row, for sparse or evolving data, and for payloads stored as received. Putting core fields in JSON gives up integrity checks and makes queries slower and harder to write.`,
      },
    ],
  },

  'arrays': {
    whyItMatters: `PostgreSQL can store a list of values in a single column, which is convenient for small sets such as tags or the days a shop is open. Used in the right place it saves a table and a join. Used in the wrong place it brings back the problems that normalization exists to solve.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL arrays, so it needs a PostgreSQL server. Create an <code>articles</code> table with a text array column <code>tags</code>. Insert an article tagged sql and postgres, and another tagged python. Write a query that finds the titles of the articles tagged sql, and a second query that returns one row for each article and tag pair.

Expected result: the first query returns the first article; the second returns three rows.`,
      starterCode: `-- TODO: articles (id, title, tags text array)

-- TODO: insert the two articles

-- TODO: titles of the articles that have the tag 'sql'

-- TODO: one row per article and tag`,
      hints: [
        'An array literal is written <code>ARRAY[\'sql\', \'postgres\']</code>, and the column type is <code>TEXT[]</code>.',
        'Membership is tested with <code>\'sql\' = ANY(tags)</code>, and <code>unnest(tags)</code> expands an array into rows.',
      ],
      solution: `CREATE TABLE articles (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}'
);

INSERT INTO articles (id, title, tags) VALUES
  (1, 'Indexing basics', ARRAY['sql', 'postgres']),
  (2, 'Decorators', ARRAY['python']);

SELECT title
FROM articles
WHERE 'sql' = ANY(tags);

SELECT title, unnest(tags) AS tag
FROM articles;`,
    },
    quiz: [
      {
        question: 'At which index does a PostgreSQL array start by default?',
        options: ['0', '-1', 'It depends on the element type', '1'],
        answer: 3,
        explanation: 'tags[1] is the first element, unlike arrays in most programming languages.',
      },
      {
        question: 'What does <code>unnest(tags)</code> do?',
        options: ['Expands an array into one row per element', 'Sorts the array', 'Removes duplicates', 'Counts the elements'],
        answer: 0,
        explanation: 'array_agg does the reverse, collecting rows into an array.',
      },
      {
        question: 'When is an array column a poor choice?',
        options: ['For a short list of tags', 'When the elements need foreign keys, their own attributes, or are frequently joined and updated', 'For a list of weekdays', 'When the list is read as a whole'],
        answer: 1,
        explanation: 'That is a relationship, and it belongs in a separate table.',
      },
    ],
    interviewQuestions: [
      {
        question: 'When would you use an array column instead of a separate table?',
        answer: `When the list is small, belongs entirely to the row, is read and written together with it, and its elements are simple values with no attributes of their own: tags, a set of flags, a few labels. A separate table is right when the elements refer to other rows and need foreign keys, carry extra data, are queried or updated individually, or can grow without limit. Arrays cannot have foreign key constraints on their elements.`,
      },
      {
        question: 'How do you search efficiently inside an array column?',
        answer: `Create a GIN index on the column and use the array operators it supports: <code>@&gt;</code> for "contains these elements" and <code>&amp;&amp;</code> for "has any element in common". For example, <code>WHERE tags @&gt; ARRAY['sql']</code> can use the index. The form <code>'sql' = ANY(tags)</code> is convenient to write but does not use a GIN index.`,
      },
    ],
  },

  'practical-schema-design': {
    whyItMatters: `Real schemas are not purely relational or purely document-shaped. A product catalogue has fields that every product shares and attributes that depend on the category. Knowing how to combine normalised columns, foreign keys and a JSONB column in one table is how PostgreSQL is used in practice.`,
    exercise: {
      runnable: false,
      prompt: `This exercise combines foreign keys with JSONB, so it needs a PostgreSQL server. Design a <code>products</code> table for a catalogue: a generated id; a required name; an exact, positive price; a required foreign key to a <code>categories</code> table; and a JSONB column <code>attributes</code> for details that vary by category. Then write the query that lists the name and price of products in category 1 that cost less than 500.

Expected result: the table accepts products with different attributes while still enforcing the price rule and the category reference.`,
      starterCode: `CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- TODO: create the products table

-- TODO: name and price of products in category 1 costing less than 500`,
      hints: [
        'Shared, queryable facts get real columns with constraints; only the variable details go in <code>attributes</code>.',
        'The price rule is <code>NUMERIC(10, 2) NOT NULL CHECK (price &gt; 0)</code>.',
      ],
      solution: `CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  attributes JSONB NOT NULL DEFAULT '{}'
);

SELECT name, price
FROM products
WHERE category_id = 1 AND price < 500;`,
    },
    quiz: [
      {
        question: 'A value is present on every row and is used in <code>WHERE</code> clauses and joins. Where should it be stored?',
        options: ['Inside a JSONB document', 'In a text column as a comma-separated list', 'In its own typed column', 'In an array'],
        answer: 2,
        explanation: 'A real column can have a type, constraints, a foreign key and accurate planner statistics.',
      },
      {
        question: 'What is JSONB well suited to in a product catalogue?',
        options: ['The price', 'The primary key', 'The category reference', 'Attributes that differ from one category to another, such as screen size or fabric'],
        answer: 3,
        explanation: 'Otherwise the table would need a column for every possible attribute, mostly empty.',
      },
      {
        question: 'What does a relational column give you that a JSONB field does not?',
        options: ['Constraints such as NOT NULL, CHECK and foreign keys enforced by the database', 'The ability to store text', 'The ability to be read by SELECT', 'Storage on disk'],
        answer: 0,
        explanation: 'Rules inside a JSON document have to be enforced by the application or by extra CHECK expressions.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you decide between normalised tables and JSONB for a new feature?',
        answer: `Start with what is known and stable: entities with relationships, values that are filtered, sorted, joined or constrained go in normalised tables and typed columns. Use <code>JSONB</code> for the part that genuinely varies or is not yet understood, such as per-category attributes or settings. If a field inside the JSON later becomes important to queries, promote it to a real column. A hybrid table is common and perfectly sound.`,
      },
      {
        question: 'What are the risks of putting too much into JSONB?',
        answer: `The database cannot enforce types, required fields or references inside the document, so inconsistent data builds up. The planner has poor statistics about JSON contents, so query plans can be bad. Updating one field rewrites the whole document. Queries are more verbose and easier to get wrong. The schema still exists; it has merely moved, unchecked, into the application code.`,
      },
    ],
  },

  'indexes': {
    whyItMatters: `PostgreSQL has several kinds of index, each built for a different sort of question. A B-tree is useless for searching inside a JSON document, and a GIN index is useless for sorting by date. Picking the right type is the difference between an index that helps and one that is never used.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL index types, so it needs a PostgreSQL server. For the <code>events</code> table, create three indexes: a B-tree index for filtering and sorting by <code>created_at</code>; a GIN index so that containment queries on the JSONB column <code>payload</code> are fast; and a partial index on <code>user_id</code> that covers only unprocessed events.

Expected result: the query planner can use the first for date ranges, the second for payload @> queries and the third for finding a user's unprocessed events.`,
      starterCode: `CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TODO: B-tree index on created_at

-- TODO: GIN index on payload

-- TODO: partial index on user_id for rows where processed is false`,
      hints: [
        'B-tree is the default, so no type needs to be named. A GIN index is written <code>USING GIN (column)</code>.',
        'A partial index ends with a <code>WHERE</code> clause.',
      ],
      solution: `CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_created_at ON events (created_at);

CREATE INDEX idx_events_payload ON events USING GIN (payload);

CREATE INDEX idx_events_unprocessed ON events (user_id) WHERE processed = false;`,
    },
    quiz: [
      {
        question: 'Which index type does <code>CREATE INDEX</code> build when none is specified?',
        options: ['GIN', 'B-tree', 'GiST', 'Hash'],
        answer: 1,
        explanation: 'B-tree handles equality, ranges and sorting, which covers most queries.',
      },
      {
        question: 'Which index type suits JSONB documents, arrays and full-text search?',
        options: ['GIN', 'B-tree', 'BRIN', 'Hash'],
        answer: 0,
        explanation: 'GIN indexes the individual elements inside a composite value.',
      },
      {
        question: 'What does <code>CREATE INDEX CONCURRENTLY</code> do?',
        options: ['Builds several indexes at once', 'Builds the index faster', 'Makes the index unique', 'Builds the index without blocking writes to the table'],
        answer: 3,
        explanation: 'An ordinary CREATE INDEX blocks inserts, updates and deletes until it finishes.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What index types does PostgreSQL offer and when is each used?',
        answer: `B-tree, the default, for equality, range comparisons and sorting on ordinary values. GIN for values that contain many elements: JSONB, arrays and full-text search. GiST for geometric data, ranges and nearest-neighbour searches. BRIN for very large tables whose values follow the physical order of the rows, such as timestamps in an append-only log. Hash for equality only.`,
      },
      {
        question: 'What is a partial index and when is it useful?',
        answer: `A partial index covers only the rows that satisfy a <code>WHERE</code> condition given when it is created. It is smaller and cheaper to maintain than a full index and suits queries that always target a subset, such as unprocessed jobs or active users. It can also enforce uniqueness within a subset, for example a unique email among rows that are not soft-deleted. A query can use it only if its own condition implies the index condition.`,
      },
    ],
  },

  'ctes': {
    whyItMatters: `A query with subqueries nested four levels deep is correct and unreadable. A common table expression names each step and lets the query read from top to bottom. The recursive form does something plain SQL otherwise cannot: walk a hierarchy of unknown depth, such as a reporting chain or a category tree.`,
    exercise: {
      prompt: `Each employee has a <code>manager_id</code>. Using a recursive CTE, list Anil and then everyone above him in the reporting chain, from Anil up to the top.

Expected output: <code>name</code>, <code>Anil</code>, <code>Asha</code>, <code>Zoya</code> (one per line)`,
      starterCode: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);
INSERT INTO employees (id, name, manager_id) VALUES
  (1, 'Zoya', NULL),
  (2, 'Asha', 1),
  (3, 'Ravi', 1),
  (4, 'Anil', 2);

-- TODO: a recursive CTE that starts at Anil and follows manager_id upwards`,
      hints: [
        'The anchor part selects Anil, with a level of 1. The recursive part joins <code>employees</code> to the CTE on <code>e.id = chain.manager_id</code>.',
        'The two parts are combined with <code>UNION ALL</code>; ordering by the level gives the chain from the bottom up.',
      ],
      solution: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);
INSERT INTO employees (id, name, manager_id) VALUES
  (1, 'Zoya', NULL),
  (2, 'Asha', 1),
  (3, 'Ravi', 1),
  (4, 'Anil', 2);

WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 1 AS level
  FROM employees
  WHERE name = 'Anil'

  UNION ALL

  SELECT e.id, e.name, e.manager_id, chain.level + 1
  FROM employees e
  JOIN chain ON e.id = chain.manager_id
)
SELECT name
FROM chain
ORDER BY level;`,
    },
    quiz: [
      {
        question: 'Which keyword introduces a common table expression?',
        options: ['DEFINE', 'TEMP', 'WITH', 'USING'],
        answer: 2,
        explanation: 'WITH name AS (SELECT ...) defines it, and the main query follows.',
      },
      {
        question: 'What are the two parts of a recursive CTE?',
        options: ['A SELECT and an UPDATE', 'An anchor query and a recursive query that refers to the CTE itself, joined by UNION ALL', 'Two identical queries', 'A table and an index'],
        answer: 1,
        explanation: 'The recursion stops when the recursive part returns no new rows.',
      },
      {
        question: 'How long does a CTE exist?',
        options: ['Only for the single statement in which it is defined', 'Until the session ends', 'Permanently, like a view', 'Until the next commit'],
        answer: 0,
        explanation: 'For reuse across statements, a view or a temporary table is needed.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a CTE and why use one instead of a subquery?',
        answer: `A common table expression is a named result set defined with <code>WITH</code> at the start of a statement and used like a table in the query that follows. It makes a complex query readable by giving each step a name and letting the steps appear in order, and the same CTE can be referred to several times. A recursive CTE can also traverse hierarchies, which a subquery cannot.`,
      },
      {
        question: 'Are CTEs slower than subqueries in PostgreSQL?',
        answer: `Not since version 12. Before that, a CTE was always computed separately and acted as an optimisation barrier, so filters from the outer query could not be pushed into it. From PostgreSQL 12, a non-recursive CTE that is referenced once and has no side effects is inlined and optimised like a subquery. The old behaviour can be requested with <code>MATERIALIZED</code>, and prevented with <code>NOT MATERIALIZED</code>.`,
      },
    ],
  },

  'window-functions': {
    whyItMatters: `"The top three products in each category", "each sale as a percentage of its month's total" and "a running balance" all need a calculation across related rows without collapsing them. Window functions do exactly that. They replace clumsy self-joins and are a favourite of interviewers for data and back-end roles.`,
    exercise: {
      prompt: `Return the most expensive product in each category: the category, the product name and its price. Use <code>ROW_NUMBER()</code> partitioned by category, and order the final result by category.

Expected output: <code>category | name | price</code>, <code>books | Atlas | 900</code>, <code>pens | Gold pen | 300</code> (one per line)`,
      starterCode: `CREATE TABLE products (id INTEGER PRIMARY KEY, category TEXT, name TEXT, price INTEGER);
INSERT INTO products (id, category, name, price) VALUES
  (1, 'pens', 'Ball pen', 12),
  (2, 'pens', 'Gold pen', 300),
  (3, 'books', 'Atlas', 900),
  (4, 'books', 'Notebook', 60);

-- TODO: the most expensive product of each category`,
      hints: [
        'Number the rows inside each category: <code>ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC)</code>.',
        'A window function cannot be used in <code>WHERE</code>, so compute it in a CTE or subquery and filter on it outside.',
      ],
      solution: `CREATE TABLE products (id INTEGER PRIMARY KEY, category TEXT, name TEXT, price INTEGER);
INSERT INTO products (id, category, name, price) VALUES
  (1, 'pens', 'Ball pen', 12),
  (2, 'pens', 'Gold pen', 300),
  (3, 'books', 'Atlas', 900),
  (4, 'books', 'Notebook', 60);

WITH ranked AS (
  SELECT category, name, price,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS position
  FROM products
)
SELECT category, name, price
FROM ranked
WHERE position = 1
ORDER BY category;`,
    },
    quiz: [
      {
        question: 'How does a window function differ from <code>GROUP BY</code>?',
        options: ['It is the same thing', 'It can only count', 'It removes duplicate rows', 'It keeps every row and adds a value computed over related rows; GROUP BY collapses each group into one row'],
        answer: 3,
        explanation: 'The detail rows stay available beside the aggregate.',
      },
      {
        question: 'Three rows tie for first place. What do <code>RANK()</code> and <code>DENSE_RANK()</code> give the next row?',
        options: ['RANK gives 4; DENSE_RANK gives 2', 'Both give 2', 'Both give 4', 'RANK gives 2; DENSE_RANK gives 4'],
        answer: 0,
        explanation: 'RANK leaves gaps after ties, and DENSE_RANK does not. ROW_NUMBER gives every row a different number.',
      },
      {
        question: 'What does <code>PARTITION BY</code> do in an <code>OVER</code> clause?',
        options: ['Sorts the final result', 'Splits the rows into groups, and the function restarts for each group', 'Filters rows', 'Creates a new table'],
        answer: 1,
        explanation: 'Without it, the window is the whole result set.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a window function?',
        answer: `A window function computes a value for each row from a set of rows related to it, the window, defined by <code>OVER</code>. <code>PARTITION BY</code> divides the rows into groups and <code>ORDER BY</code> orders them within each group. Unlike an aggregate with <code>GROUP BY</code>, it does not reduce the number of rows. Examples are <code>ROW_NUMBER</code>, <code>RANK</code>, <code>LAG</code> and <code>LEAD</code>, and aggregates such as <code>SUM</code> used with <code>OVER</code> for running totals.`,
      },
      {
        question: 'How do you get the top N rows in each group?',
        answer: `Number the rows within each group with <code>ROW_NUMBER() OVER (PARTITION BY group_column ORDER BY sort_column DESC)</code> in a CTE or subquery, then filter the outer query to rows whose number is at most N. The filter has to be outside because window functions are evaluated after <code>WHERE</code>. Use <code>RANK</code> or <code>DENSE_RANK</code> instead when tied rows should all be included.`,
      },
    ],
  },

  'functions': {
    whyItMatters: `A function stores logic in the database so that every application and report uses the same calculation. PL/pgSQL adds variables, conditions and loops to SQL. You will meet such functions in mature systems, and they are what triggers are built from.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PL/pgSQL, so it needs a PostgreSQL server. Write a function <code>apply_discount</code> that takes a price and a percentage and returns the discounted price rounded to two decimals. The discount must be capped at 50 per cent, whatever percentage is passed. Then call it twice.

Expected result: apply_discount(200, 10) returns 180.00, and apply_discount(200, 80) returns 100.00 because of the cap.`,
      starterCode: `-- TODO: CREATE FUNCTION apply_discount(price numeric, percent numeric) RETURNS numeric

-- TODO: SELECT apply_discount(200, 10);
-- TODO: SELECT apply_discount(200, 80);`,
      hints: [
        'Variables are declared in a <code>DECLARE</code> section, and <code>LEAST(percent, 50)</code> applies the cap.',
        'The body is written between <code>BEGIN</code> and <code>END;</code>, and the result is returned with <code>RETURN</code>.',
      ],
      solution: `CREATE FUNCTION apply_discount(price NUMERIC, percent NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  effective_percent NUMERIC := LEAST(percent, 50);
BEGIN
  RETURN ROUND(price * (1 - effective_percent / 100), 2);
END;
$$;

SELECT apply_discount(200, 10);
SELECT apply_discount(200, 80);`,
    },
    quiz: [
      {
        question: 'What is PL/pgSQL?',
        options: ['A graphical tool', 'A backup format', 'PostgreSQL\'s procedural language, which adds variables and control flow to SQL', 'A type of index'],
        answer: 2,
        explanation: 'It is the language most PostgreSQL functions and triggers are written in.',
      },
      {
        question: 'What are the <code>$$</code> marks around a function body?',
        options: ['Dollar quoting, a way to write a string that may itself contain quotation marks', 'Currency formatting', 'A comment', 'A variable prefix'],
        answer: 0,
        explanation: 'The body is a string, and dollar quoting avoids having to escape every single quote inside it.',
      },
      {
        question: 'How is a function that returns a value used?',
        options: ['Only with CALL', 'Only from psql', 'Only inside triggers', 'Inside a query, for example SELECT apply_discount(200, 10)'],
        answer: 3,
        explanation: 'CALL is for procedures.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a function and a procedure in PostgreSQL?',
        answer: `A function returns a value or a set of rows and is called inside a query; it runs within the caller's transaction and cannot commit or roll back. A procedure, added in PostgreSQL 11, is run with <code>CALL</code>, does not return a value in the same way, and can commit or roll back inside its body, which makes it suitable for long batch jobs that work in several transactions.`,
      },
      {
        question: 'What do IMMUTABLE, STABLE and VOLATILE mean on a function?',
        answer: `They tell the planner how a function behaves. <code>IMMUTABLE</code>: the same arguments always give the same result and the function reads no data, so the call can be evaluated once and can be used in an index. <code>STABLE</code>: the result does not change within a single statement, though it may read tables. <code>VOLATILE</code>, the default: the result may change on every call or the function has side effects, so it is re-evaluated each time.`,
      },
    ],
  },

  'transactions': {
    whyItMatters: `PostgreSQL is stricter than some databases: after any error inside a transaction it refuses every further statement until you roll back. That protects your data and surprises newcomers. Savepoints are the tool for recovering from an expected error without throwing the whole transaction away.`,
    exercise: {
      prompt: `Inside one transaction, insert product 1. Then set a savepoint and try to insert a second row that reuses id 1, which fails. Roll back to the savepoint, insert product 2 instead, and commit. Count the rows.

Expected output: <code>total</code> then <code>2</code>`,
      starterCode: `CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL);

BEGIN;
INSERT INTO products (id, name) VALUES (1, 'Pen');

-- TODO: create a savepoint named before_second

INSERT INTO products (id, name) VALUES (1, 'Duplicate');

-- TODO: roll back to the savepoint

INSERT INTO products (id, name) VALUES (2, 'Bag');
COMMIT;

SELECT COUNT(*) AS total FROM products;`,
      hints: [
        'The statements are <code>SAVEPOINT name</code> and <code>ROLLBACK TO SAVEPOINT name</code>.',
        'Rolling back to a savepoint undoes only what happened after it and keeps the transaction open.',
      ],
      solution: `CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL);

BEGIN;
INSERT INTO products (id, name) VALUES (1, 'Pen');

SAVEPOINT before_second;

INSERT INTO products (id, name) VALUES (1, 'Duplicate');

ROLLBACK TO SAVEPOINT before_second;

INSERT INTO products (id, name) VALUES (2, 'Bag');
COMMIT;

SELECT COUNT(*) AS total FROM products;`,
    },
    quiz: [
      {
        question: 'In PostgreSQL, a statement fails inside a transaction. What happens to the statements that follow?',
        options: ['They run normally', 'They are rejected until the transaction is rolled back, or rolled back to a savepoint', 'The transaction commits automatically', 'The failed statement is retried'],
        answer: 1,
        explanation: 'The message is "current transaction is aborted, commands ignored until end of transaction block".',
      },
      {
        question: 'What does <code>ROLLBACK TO SAVEPOINT sp</code> do?',
        options: ['Ends the transaction', 'Commits the work so far', 'Undoes the work done after the savepoint and keeps the transaction open', 'Deletes the savepoint only'],
        answer: 2,
        explanation: 'Work done before the savepoint is kept.',
      },
      {
        question: 'Can <code>CREATE TABLE</code> be rolled back in PostgreSQL?',
        options: ['Yes; most DDL is transactional', 'No, DDL always commits immediately', 'Only for temporary tables', 'Only with a savepoint'],
        answer: 0,
        explanation: 'A migration can therefore be applied completely or not at all.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What happens after an error inside a PostgreSQL transaction?',
        answer: `The transaction enters an aborted state. Every further statement fails with "current transaction is aborted, commands ignored until end of transaction block" until the transaction is ended with <code>ROLLBACK</code>, or rolled back to a savepoint that was set before the error. Even <code>COMMIT</code> at that point performs a rollback. This guarantees that a partly failed transaction can never be committed by accident.`,
      },
      {
        question: 'What is transactional DDL and why is it valuable?',
        answer: `In PostgreSQL, statements that change the schema, such as <code>CREATE TABLE</code>, <code>ALTER TABLE</code> and <code>DROP INDEX</code>, take part in transactions and can be rolled back. A migration made of several schema changes can therefore be wrapped in one transaction: if any step fails, the database returns to its previous schema and is never left half migrated. Databases that commit implicitly on DDL cannot offer this.`,
      },
    ],
  },

  'roles-permissions': {
    whyItMatters: `Every connection to PostgreSQL acts as a role, and what that role may do is the main safeguard for your data. An application that connects as a superuser turns any bug or injection flaw into total loss. Granting each role only what it needs is one of the most effective security measures there is.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL roles, so it needs a PostgreSQL server. Create a group role <code>readonly</code> that cannot log in and may only read every table in the <code>public</code> schema. Then create a login role <code>report_user</code> with a password and make it a member of <code>readonly</code>, so that it receives those permissions through membership.

Expected result: connected as report_user, SELECT works on the tables of the public schema and INSERT, UPDATE and DELETE are refused.`,
      starterCode: `-- TODO: group role readonly, without login

-- TODO: let readonly use the public schema and read all its tables

-- TODO: login role report_user with a password

-- TODO: make report_user a member of readonly`,
      hints: [
        'A role needs <code>USAGE</code> on a schema before it can reach the tables inside it.',
        'Membership is granted with <code>GRANT readonly TO report_user</code>.',
      ],
      solution: `CREATE ROLE readonly NOLOGIN;

GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;

CREATE ROLE report_user LOGIN PASSWORD 'use-a-long-random-password';

GRANT readonly TO report_user;`,
    },
    quiz: [
      {
        question: 'In PostgreSQL, what is the difference between a user and a role?',
        options: ['They are stored in different databases', 'Users cannot own tables', 'Roles cannot have passwords', 'A user is simply a role that has the LOGIN attribute'],
        answer: 3,
        explanation: 'CREATE USER is the same as CREATE ROLE with LOGIN.',
      },
      {
        question: 'Which statement takes a permission away?',
        options: ['REVOKE', 'DENY', 'REMOVE', 'DROP'],
        answer: 0,
        explanation: 'REVOKE reverses a GRANT.',
      },
      {
        question: 'Does <code>GRANT SELECT ON ALL TABLES IN SCHEMA public</code> cover tables created afterwards?',
        options: ['Yes, automatically', 'No; it applies to the tables that exist now. ALTER DEFAULT PRIVILEGES covers future ones', 'Only for views', 'Only after a restart'],
        answer: 1,
        explanation: 'Forgetting this is a common reason a read-only account cannot see a new table.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you set up permissions for an application in PostgreSQL?',
        answer: `Create group roles for each kind of access, such as read-only and read-write, and grant privileges on the schema and its tables to those groups. Create a separate login role for each application or person and make it a member of the appropriate group. The application's role should have only the rights it needs, never superuser or ownership of the schema. <code>ALTER DEFAULT PRIVILEGES</code> extends the grants to tables created later.`,
      },
      {
        question: 'What is the principle of least privilege?',
        answer: `Every account should have the minimum permissions needed for its task and no more. A reporting tool gets read-only access to the tables it reports on; a web application gets data access but no right to alter the schema. If an account is compromised, by a leaked password or an injection flaw, the attacker is limited to what that account could do, which contains the damage.`,
      },
    ],
  },

  'explain-plans': {
    whyItMatters: `When a query is slow, guessing at the cause wastes hours. <code>EXPLAIN</code> shows exactly what PostgreSQL does: which tables it scans, which indexes it uses and where the time goes. Reading a plan is the core skill of database performance work.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL's EXPLAIN output, so it needs a PostgreSQL server. For a large <code>orders</code> table, write the command that shows the actual execution plan, with timings and buffer usage, of the query that finds the orders of customer 42. Then create the index that the plan will probably show to be missing, and run the same command again.

Expected result: the first plan shows a sequential scan over the whole table; after the index is created, the plan shows an index scan or bitmap index scan and a much lower execution time.`,
      starterCode: `-- TODO: show the real plan, with timing and buffers, for:
--       SELECT * FROM orders WHERE customer_id = 42;

-- TODO: create an index on orders.customer_id

-- TODO: show the plan again`,
      hints: [
        'The options are given in parentheses: <code>EXPLAIN (ANALYZE, BUFFERS)</code>.',
        '<code>ANALYZE</code> really executes the query, so take care with statements that change data.',
      ],
      solution: `EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 42;

CREATE INDEX idx_orders_customer_id ON orders (customer_id);

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 42;`,
    },
    quiz: [
      {
        question: 'What is the difference between <code>EXPLAIN</code> and <code>EXPLAIN ANALYZE</code>?',
        options: ['There is none', 'EXPLAIN runs the query twice', 'EXPLAIN shows the estimated plan without running the query; EXPLAIN ANALYZE runs it and shows actual times and row counts', 'EXPLAIN ANALYZE only works on SELECT'],
        answer: 2,
        explanation: 'Because ANALYZE executes the statement, an UPDATE or DELETE under it really changes data.',
      },
      {
        question: 'What does "Seq Scan" in a plan mean?',
        options: ['The table is read from start to end, row by row', 'An index was used', 'The rows were sorted', 'The query was cached'],
        answer: 0,
        explanation: 'It is normal for small tables and for queries that return most of the rows.',
      },
      {
        question: 'A plan shows an estimate of 10 rows where the actual number is 500,000. What does that suggest?',
        options: ['The index is corrupt', 'The query is wrong', 'The server needs more memory', 'The table\'s statistics are out of date, and ANALYZE should be run'],
        answer: 3,
        explanation: 'The planner chooses plans from its estimates, so a bad estimate often leads to a bad plan.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you read a PostgreSQL query plan?',
        answer: `A plan is a tree, and execution starts at the most indented nodes and flows upwards. Each node shows its type, such as Seq Scan, Index Scan, Hash Join or Sort, with an estimated cost and row count; with <code>ANALYZE</code> it also shows the actual time, rows and loops. Look for the node where most of the time is spent, for sequential scans on large tables with selective filters, and for large gaps between estimated and actual rows.`,
      },
      {
        question: 'Why might PostgreSQL not use an index that exists?',
        answer: `The planner may judge a sequential scan cheaper, which is right when the query returns a large share of the table or the table is small. The condition may not match the index: a function or cast applied to the column, a leading wildcard in <code>LIKE</code>, or a composite index whose leading column is not filtered. Outdated statistics can also mislead it. <code>EXPLAIN</code> shows what was chosen, and <code>ANALYZE</code> on the table refreshes the statistics.`,
      },
    ],
  },

  'performance-basics': {
    whyItMatters: `PostgreSQL never overwrites a row in place: an update writes a new version and leaves the old one behind. Without clean-up, tables grow and slow down however good the queries are. Vacuuming, statistics and connection pooling are the three things that keep a busy PostgreSQL database healthy.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL maintenance commands, so it needs a PostgreSQL server. For the <code>orders</code> table, write the command that reclaims dead rows and refreshes the planner's statistics in one go. Then write a query against the statistics view that shows the table's number of live rows, its number of dead rows, and when autovacuum last ran on it.

Expected result: after the VACUUM, the dead row count for orders is at or near zero.`,
      starterCode: `-- TODO: vacuum and analyze the orders table

-- TODO: live rows, dead rows and last autovacuum time for orders,
--       from pg_stat_user_tables`,
      hints: [
        'The two operations combine as <code>VACUUM (ANALYZE) table_name</code>.',
        'The columns are <code>n_live_tup</code>, <code>n_dead_tup</code> and <code>last_autovacuum</code>, filtered by <code>relname</code>.',
      ],
      solution: `VACUUM (ANALYZE) orders;

SELECT relname, n_live_tup, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables
WHERE relname = 'orders';`,
    },
    quiz: [
      {
        question: 'Why does PostgreSQL need <code>VACUUM</code>?',
        options: ['To back up the data', 'Updates and deletes leave old row versions behind, and VACUUM makes their space reusable', 'To rebuild indexes every night', 'To encrypt tables'],
        answer: 1,
        explanation: 'This is a consequence of MVCC, the mechanism that lets readers and writers work without blocking each other.',
      },
      {
        question: 'What does <code>ANALYZE</code> (the maintenance command) do?',
        options: ['Runs a query and shows its plan', 'Deletes dead rows', 'Collects statistics about the data, which the planner uses to choose query plans', 'Checks for corruption'],
        answer: 2,
        explanation: 'It is a different thing from the ANALYZE option of EXPLAIN.',
      },
      {
        question: 'Why is a connection pooler such as PgBouncer used?',
        options: ['Each PostgreSQL connection is a separate server process, so many connections are costly; a pooler shares a small number among many clients', 'It makes queries run faster', 'It replaces indexes', 'It stores backups'],
        answer: 0,
        explanation: 'Applications with many short-lived connections benefit most.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is MVCC and why does it make VACUUM necessary?',
        answer: `Multi-version concurrency control lets readers and writers work without blocking each other by keeping several versions of a row. An update writes a new version and marks the old one as expired; a delete only marks the row. The old versions, called dead tuples, remain in the table until no transaction can still see them. <code>VACUUM</code> then marks their space as reusable. Without it, tables and indexes bloat and queries slow down.`,
      },
      {
        question: 'What is the difference between VACUUM and VACUUM FULL?',
        answer: `Plain <code>VACUUM</code> marks the space of dead rows as reusable within the table, runs alongside normal reads and writes, and does not usually shrink the file on disk. <code>VACUUM FULL</code> rewrites the whole table into a new, compact file and returns the space to the operating system, but takes an exclusive lock that blocks all access while it runs. Autovacuum performs the plain form automatically; <code>VACUUM FULL</code> is reserved for severe bloat.`,
      },
    ],
  },

  'backup-restore-concepts': {
    whyItMatters: `Disks fail, people run a <code>DELETE</code> without a <code>WHERE</code>, and ransomware exists. A database without tested backups is one accident away from losing everything. Knowing how to take a backup, and above all having restored one, is a basic responsibility for anyone who runs a database.`,
    exercise: {
      runnable: false,
      prompt: `This exercise uses PostgreSQL's command-line tools, so it needs a PostgreSQL installation and is run in a terminal, not in the playground. Write the commands to: take a compressed, custom-format backup of the database <code>shop</code> into the file <code>shop.dump</code>; create an empty database named <code>shop_restored</code>; and restore the backup into it.

Expected result: shop_restored contains the same tables and data as shop.`,
      starterCode: `# 1. back up the database shop to shop.dump in custom format

# 2. create the empty database shop_restored

# 3. restore shop.dump into shop_restored`,
      hints: [
        'The custom format is chosen with <code>-Fc</code>, and the output file with <code>-f</code>.',
        'A custom-format file is restored with <code>pg_restore</code>, naming the target database with <code>-d</code>.',
      ],
      solution: `# 1. back up the database shop to shop.dump in custom format
pg_dump -Fc -d shop -f shop.dump

# 2. create the empty database shop_restored
createdb shop_restored

# 3. restore shop.dump into shop_restored
pg_restore -d shop_restored shop.dump`,
    },
    quiz: [
      {
        question: 'What kind of backup does <code>pg_dump</code> produce?',
        options: ['A physical copy of the data files', 'A snapshot of the disk', 'A replica server', 'A logical backup: the SQL statements or archive needed to recreate one database'],
        answer: 3,
        explanation: 'pg_basebackup is the tool that takes a physical copy of the whole cluster.',
      },
      {
        question: 'What does a physical backup combined with WAL archiving make possible?',
        options: ['Point-in-time recovery: restoring the database to any chosen moment', 'Faster queries', 'Smaller tables', 'Restoring a single table only'],
        answer: 0,
        explanation: 'The base backup is restored and the archived WAL is replayed up to the chosen time.',
      },
      {
        question: 'When can a backup be trusted?',
        options: ['As soon as the command finishes', 'Only after it has been restored successfully in a test', 'When the file is large', 'When it is stored on the same server'],
        answer: 1,
        explanation: 'An untested backup may be incomplete or unusable, and it should be stored away from the server.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between logical and physical backups?',
        answer: `A logical backup, made with <code>pg_dump</code>, exports the contents of a database as SQL or an archive. It is portable across versions and machines and can restore individual tables, but it is slow for large databases and reflects only the moment it was taken. A physical backup, made with <code>pg_basebackup</code>, copies the data files of the whole cluster. It is faster for large systems and, with archived WAL, allows recovery to any point in time.`,
      },
      {
        question: 'What makes a good backup strategy?',
        answer: `Automated, regular backups; copies kept in a different location from the database server; retention that matches how far back you may need to go; point-in-time recovery for systems where losing a day of data is unacceptable; and, most important, regular restore tests. Two numbers define the requirement: how much data the business can afford to lose, and how long it can afford to be down.`,
      },
    ],
  },
}
