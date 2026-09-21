// PostgreSQL module — hand-written lesson content.
// Keys are slugs matching the PostgreSQL topics list.
export const postgresqlContent = {
  'postgresql-setup-concepts': {
    title: 'PostgreSQL Setup Concepts: Server, psql, and Databases',
    intro: `PostgreSQL is a client-server relational database system. A single running process, the PostgreSQL server (postgres), listens on a port (5432 by default) and manages one or more databases, handling every connection, query, and transaction. To work with it, you use a client — most commonly psql, the official interactive command-line client that ships with every PostgreSQL installation.

Before writing a single query, you need to understand the connection model: a client connects to a specific database on a specific server using a host, port, username, and database name. Everything you do afterward — creating tables, running queries, managing permissions — happens inside the context of that one database.`,
    sections: [
      {
        heading: 'Connecting with psql',
        body: `You typically connect with a command like <code>psql -h localhost -p 5432 -U postgres -d mydb</code>, or simply <code>psql mydb</code> if defaults are configured. Once connected, psql gives you an interactive prompt (<code>mydb=#</code>) where you can type SQL statements ending in a semicolon, or special "meta-commands" that start with a backslash and are handled by psql itself rather than sent to the server.`,
      },
      {
        heading: 'Essential Meta-Commands',
        body: `Meta-commands are how you explore a database's structure quickly without writing SQL against system catalogs by hand.`,
        list: [
          '<code>\\l</code> — list all databases on the server.',
          '<code>\\c dbname</code> — connect to a different database.',
          '<code>\\dt</code> — list all tables in the current schema.',
          '<code>\\d tablename</code> — describe a table: columns, types, indexes, constraints, and foreign keys.',
          '<code>\\dn</code> — list schemas in the current database.',
          '<code>\\du</code> — list roles (users/groups) and their attributes.',
          '<code>\\q</code> — quit psql.',
        ],
      },
      {
        heading: 'Databases Are Isolated',
        body: `A PostgreSQL server can host many databases, but a single connection can only query one database at a time — there is no cross-database JOIN like there is cross-schema. Every fresh install includes a default <code>postgres</code> database (used for administrative connections) and typically a <code>template1</code> database that new databases are cloned from when you run <code>CREATE DATABASE</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Connecting, creating a database, and inspecting it with meta-commands',
        code: `-- From the terminal:
-- psql -U postgres

CREATE DATABASE bookstore;
\\c bookstore

CREATE TABLE authors (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

\\dt
\\d authors`,
        output: `CREATE DATABASE
You are now connected to database "bookstore" as user "postgres".
CREATE TABLE

         List of relations
 Schema |  Name   | Type  |  Owner
--------+---------+-------+----------
 public | authors | table | postgres

                                     Table "public.authors"
 Column |  Type   | Collation | Nullable |              Default
--------+---------+-----------+----------+------------------------------------
 id     | integer |           | not null | nextval('authors_id_seq'::regclass)
 name   | text    |           | not null |
Indexes:
    "authors_pkey" PRIMARY KEY, btree (id)`,
      },
    ],
    commonMistakes: [
      'Running CREATE TABLE against the wrong database because you forgot to \\c into the intended one first — psql\'s prompt always shows the current database name, so check it.',
      'Confusing a PostgreSQL "database" with a "schema" — they are different levels of isolation, and \\dt only shows tables in schemas on your current search_path within the current database.',
      'Trying to query another database directly in a plain SQL statement — PostgreSQL requires a new connection (or an extension like dblink/postgres_fdw) to reach another database.',
      'Forgetting the terminating semicolon in psql, which leaves the prompt waiting on a continuation line ("mydb-#") instead of running the statement.',
    ],
    keyPoints: [
      'PostgreSQL follows a client-server model; psql is the standard interactive client.',
      'A server hosts multiple databases, but one connection queries only one database at a time.',
      '\\dt lists tables, \\d tablename describes one table in full, and \\l lists all databases.',
      'Meta-commands (backslash commands) are handled by psql itself, not sent to the server as SQL.',
    ],
  },

  'data-types': {
    title: 'PostgreSQL Data Types',
    intro: `PostgreSQL has one of the richest type systems of any relational database. Beyond the standard SQL numeric, text, and date types, it offers native UUID, JSON/JSONB, array, and range types, plus the ability to define your own custom types. Choosing the right type up front avoids painful migrations and subtle correctness bugs later, especially around money and time.

The two areas where beginners most often pick the wrong type are numeric precision (using floating-point types for currency) and timestamps (ignoring time zones). Both mistakes are easy to avoid once you understand what PostgreSQL actually offers.`,
    sections: [
      {
        heading: 'Text and Character Types',
        body: `PostgreSQL provides <code>CHAR(n)</code> (fixed-length, blank-padded), <code>VARCHAR(n)</code> (variable-length with a limit), and <code>TEXT</code> (variable-length, unlimited). Unlike some databases, PostgreSQL has no meaningful performance difference between these — internally they use the same storage. Because of this, idiomatic PostgreSQL style favors <code>TEXT</code> for almost everything, adding a <code>CHECK</code> constraint if you truly need to cap a length, rather than reaching for <code>VARCHAR(n)</code> out of habit.`,
      },
      {
        heading: 'Numeric Types: NUMERIC vs. FLOAT',
        body: `<code>INTEGER</code> and <code>BIGINT</code> handle whole numbers. For decimals, PostgreSQL gives you two fundamentally different families: <code>REAL</code>/<code>DOUBLE PRECISION</code> (binary floating-point, fast but inexact) and <code>NUMERIC(precision, scale)</code> (exact, arbitrary-precision decimal). This distinction matters enormously for money: floating-point types cannot represent values like 0.10 exactly in binary, so repeated arithmetic accumulates rounding error. <code>NUMERIC</code> stores digits exactly as specified, which is why every serious application uses <code>NUMERIC(10,2)</code> or similar for prices, balances, and any financial calculation — never <code>FLOAT</code> or <code>REAL</code>.`,
      },
      {
        heading: 'Date/Time, Boolean, and UUID',
        body: `PostgreSQL distinguishes <code>TIMESTAMP</code> (no time zone, stores a naive wall-clock value) from <code>TIMESTAMPTZ</code> (stores the instant in UTC internally and converts to the session's time zone on display). For almost any application that could ever run across time zones, <code>TIMESTAMPTZ</code> is the correct default — it avoids an entire class of "which time zone was this in" bugs. <code>BOOLEAN</code> is a true first-class type (<code>TRUE</code>/<code>FALSE</code>/<code>NULL</code>), not an integer alias. <code>UUID</code> is a native 128-bit type, commonly used for primary keys in distributed systems or when IDs must not be sequentially guessable; generate values with <code>gen_random_uuid()</code> (from the built-in pgcrypto-free <code>pgcrypto</code> or, in modern PostgreSQL, the core <code>uuid-ossp</code>/pgcrypto functions).`,
      },
    ],
    examples: [
      {
        caption: 'A table demonstrating correct type choices, including NUMERIC for money',
        code: `CREATE TABLE orders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer    TEXT NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    is_paid     BOOLEAN NOT NULL DEFAULT FALSE,
    placed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO orders (customer, total_price)
VALUES ('Ravi Shah', 149.99);

SELECT customer, total_price, is_paid, placed_at FROM orders;`,
        output: `INSERT 0 1
   customer   | total_price | is_paid |           placed_at
--------------+-------------+---------+-------------------------------
 Ravi Shah    |      149.99 | f       | 2026-09-21 10:32:07.481212+00`,
      },
      {
        caption: 'Why FLOAT is unsafe for money, compared with NUMERIC',
        code: `SELECT
    0.1::float8 + 0.2::float8            AS float_sum,
    0.1::numeric(4,2) + 0.2::numeric(4,2) AS numeric_sum;`,
        output: `     float_sum      | numeric_sum
---------------------+-------------
 0.30000000000000004 |        0.30`,
      },
    ],
    commonMistakes: [
      'Using FLOAT or REAL for prices or account balances, which introduces binary rounding error into financial calculations.',
      'Choosing TIMESTAMP instead of TIMESTAMPTZ, then getting inconsistent results once the application or its users span more than one time zone.',
      'Adding VARCHAR(n) length limits everywhere out of habit from other databases, when PostgreSQL treats TEXT and VARCHAR identically in storage and performance.',
      'Storing boolean-like flags as INTEGER (0/1) instead of using the native BOOLEAN type, losing clarity and constraint checking.',
    ],
    keyPoints: [
      'TEXT, VARCHAR(n), and CHAR(n) perform identically in PostgreSQL; TEXT is the idiomatic default.',
      'NUMERIC(precision, scale) is exact and required for money; FLOAT/REAL are binary approximations and unsuitable for currency.',
      'TIMESTAMPTZ stores an absolute instant in UTC and should be the default over the time-zone-naive TIMESTAMP.',
      'PostgreSQL has native BOOLEAN and UUID types — prefer them over integer workarounds.',
    ],
  },

  schemas: {
    title: 'Schemas in PostgreSQL',
    intro: `In PostgreSQL, a schema is a namespace inside a database that groups tables, views, functions, and other objects together. This is a level of organization that sits between the database itself and individual objects — a single database can contain many schemas, and the same table name (like "users") can exist in two different schemas without conflict.

Schemas are frequently confused with databases by newcomers, but they serve a different purpose: they let you organize objects within one database (for example, separating "app" data from "reporting" views or "audit" logs) rather than isolating entirely separate databases from each other.`,
    sections: [
      {
        heading: 'The public Schema',
        body: `Every new PostgreSQL database is created with a default schema named <code>public</code>. When you run <code>CREATE TABLE authors (...)</code> without specifying a schema, PostgreSQL creates it as <code>public.authors</code>. This is why beginners rarely notice schemas at all — everything quietly lives in <code>public</code> until a project grows large enough to need separation.`,
      },
      {
        heading: 'Creating and Using Schemas',
        body: `You create a schema with <code>CREATE SCHEMA schema_name;</code> and reference objects inside it with dot notation, such as <code>reporting.monthly_sales</code>. This lets teams logically separate concerns — for example, an <code>auth</code> schema for user/session tables, an <code>app</code> schema for business data, and an <code>audit</code> schema for change logs — all within a single database, with permissions grantable per schema.`,
      },
      {
        heading: 'search_path and Name Resolution',
        body: `When you write an unqualified table name like <code>SELECT * FROM orders</code>, PostgreSQL looks through the schemas listed in the <code>search_path</code> setting, in order, until it finds a matching table. The default search_path is typically <code>"$user", public</code>. You can view or change it with <code>SHOW search_path;</code> and <code>SET search_path TO app, public;</code>. Understanding search_path matters because it silently determines which of several same-named tables in different schemas actually gets queried.`,
      },
    ],
    examples: [
      {
        caption: 'Creating a schema and controlling search_path',
        code: `CREATE SCHEMA reporting;

CREATE TABLE reporting.monthly_sales (
    month       DATE PRIMARY KEY,
    total_sales NUMERIC(12,2)
);

SHOW search_path;

SET search_path TO reporting, public;
SELECT * FROM monthly_sales;  -- resolves to reporting.monthly_sales`,
        output: `CREATE SCHEMA
CREATE TABLE
   search_path
-----------------
 "$user", public
SET
 month | total_sales
-------+-------------
(0 rows)`,
      },
    ],
    commonMistakes: [
      'Assuming CREATE SCHEMA creates a new database — a schema is a namespace inside the current database, not a separate database.',
      'Relying on unqualified table names across schemas without checking search_path, then querying the wrong table entirely when two schemas both have a table with that name.',
      'Never granting schema-level USAGE privilege to a role, then wondering why a user with table-level GRANTs still cannot see the objects inside a non-public schema.',
      'Putting everything in public indefinitely on a growing project, making permissions and object discovery harder than they need to be.',
    ],
    keyPoints: [
      'A schema is a namespace within a database; a database can hold many schemas.',
      'public is the default schema every new database starts with.',
      'search_path determines which schema an unqualified object name resolves to.',
      'Schemas are commonly used to separate concerns (app, auth, reporting) and to scope permissions cleanly.',
    ],
  },

  'sequences-identity': {
    title: 'Sequences, SERIAL, and GENERATED IDENTITY Columns',
    intro: `Most tables need a column that auto-generates a unique, incrementing number for each new row — a surrogate primary key. PostgreSQL implements this using sequence objects: standalone counters that hand out the next number on demand, independent of any table.

Over the years PostgreSQL has offered two ways to attach a sequence to a column: the older SERIAL pseudo-type, and the SQL-standard GENERATED AS IDENTITY syntax introduced in PostgreSQL 10. Modern code should prefer identity columns, but you will see SERIAL constantly in existing codebases and tutorials.`,
    sections: [
      {
        heading: 'SERIAL and BIGSERIAL (Legacy)',
        body: `<code>SERIAL</code> is shorthand that PostgreSQL expands, behind the scenes, into an <code>INTEGER</code> column, a backing sequence (e.g. <code>tablename_columnname_seq</code>), and a <code>DEFAULT nextval('tablename_columnname_seq')</code>. <code>BIGSERIAL</code> does the same with <code>BIGINT</code>. It works, but it is not a true type — it is a convenience macro, and because the sequence is a separate object, ownership and dependency management can get confusing (for example, dumping/restoring or copying schemas can lose the link between column and sequence if done manually).`,
      },
      {
        heading: 'GENERATED ... AS IDENTITY (Modern)',
        body: `The SQL-standard approach declares intent explicitly: <code>id INTEGER GENERATED ALWAYS AS IDENTITY</code> or <code>GENERATED BY DEFAULT AS IDENTITY</code>. <code>ALWAYS</code> means the database controls the value and rejects an explicit INSERT into that column unless you use <code>OVERRIDING SYSTEM VALUE</code>; <code>BY DEFAULT</code> allows an explicit value to be provided, falling back to the sequence otherwise. Identity columns are the recommended modern approach because they are properly tracked as part of the column's definition by PostgreSQL's catalog and tooling, rather than being an implicit side effect.`,
      },
      {
        heading: 'Working with the Underlying Sequence',
        body: `Whichever syntax you use, you can inspect and control the sequence directly: <code>currval()</code> returns the last value obtained in the current session, <code>nextval()</code> advances and returns the next value, and <code>setval()</code> resets the counter (useful after bulk-loading data with explicit IDs). Sequences are also useful standalone, unattached to any column, whenever you need a globally increasing counter.`,
      },
    ],
    examples: [
      {
        caption: 'SERIAL vs. the modern GENERATED ALWAYS AS IDENTITY syntax',
        code: `-- Legacy style
CREATE TABLE legacy_customers (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Modern, SQL-standard style
CREATE TABLE customers (
    id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL
);

INSERT INTO customers (name) VALUES ('Meera Nair'), ('Aditya Rao');
SELECT * FROM customers;`,
        output: `CREATE TABLE
CREATE TABLE
INSERT 0 2
 id |    name
----+-------------
  1 | Meera Nair
  2 | Aditya Rao`,
      },
    ],
    commonMistakes: [
      'Trying to INSERT an explicit value into a GENERATED ALWAYS AS IDENTITY column without OVERRIDING SYSTEM VALUE, and being surprised by the resulting error.',
      'Forgetting to bump the sequence with setval() after bulk-loading rows with explicit IDs, causing the next auto-generated INSERT to collide with an existing primary key.',
      'Assuming SERIAL creates a true data type — it is INTEGER (or BIGINT for BIGSERIAL) plus a sequence and default, which shows up as "integer" in \\d output, not "serial".',
      'Choosing SERIAL/INTEGER identity for a very high-write table expected to exceed about two billion rows, instead of BIGSERIAL/BIGINT, and hitting the range limit later.',
    ],
    keyPoints: [
      'SERIAL/BIGSERIAL are legacy shorthand for an integer column plus a backing sequence and default.',
      'GENERATED ALWAYS/BY DEFAULT AS IDENTITY is the modern, SQL-standard way to auto-generate primary key values.',
      'ALWAYS rejects explicit inserts unless overridden; BY DEFAULT allows them.',
      'Sequences can be inspected and controlled directly with nextval(), currval(), and setval().',
    ],
  },

  'json-jsonb': {
    title: 'JSON and JSONB in PostgreSQL',
    intro: `PostgreSQL can store semi-structured data directly in a column using two related types: <code>JSON</code> and <code>JSONB</code>. This lets you combine the strong guarantees of a relational schema with the flexibility of a document store for fields that genuinely vary in shape — settings blobs, event payloads, third-party API responses — without resorting to a separate NoSQL database.

The two types look similar on the surface but store data very differently, and that difference has real consequences for performance and what operations are efficient.`,
    sections: [
      {
        heading: 'JSON vs. JSONB',
        body: `<code>JSON</code> stores an exact textual copy of the input, including whitespace and key order, and re-parses it every time it is queried. <code>JSONB</code> ("JSON binary") parses the input once at write time into a decomposed binary format, discarding insignificant whitespace and duplicate keys. JSONB is slightly slower to insert but substantially faster to query, and — critically — it is the only one of the two that can be indexed efficiently. For nearly every real application, JSONB is the correct choice; plain JSON is mainly useful when you must preserve the exact original text.`,
      },
      {
        heading: 'Querying with -> and ->>',
        body: `The <code>-></code> operator extracts a field as JSON/JSONB (preserving type), while <code>->></code> extracts it as text. For nested access you chain them, using <code>->></code> only on the final step if you want a text result: <code>data->'address'->>'city'</code>. The <code>#></code> and <code>#>></code> operators do the same thing with a path array, which is handy for deeply nested or dynamic paths: <code>data #>> '{address,city}'</code>.`,
      },
      {
        heading: 'Containment and Indexing',
        body: `JSONB supports the <code>@></code> ("contains") and <code>?</code> ("has key") operators, which let you ask questions like "does this document contain this sub-object" or "does this object have this key" directly. These operators can use a <code>GIN</code> index built on the JSONB column, making containment queries fast even over millions of rows — something plain JSON cannot do.`,
      },
    ],
    examples: [
      {
        caption: 'Storing and querying JSONB with -> and ->>',
        code: `CREATE TABLE events (
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payload JSONB NOT NULL
);

INSERT INTO events (payload) VALUES
('{"type": "signup", "user": {"id": 42, "plan": "pro"}}');

SELECT
    payload->>'type'          AS event_type,
    payload->'user'->>'plan'  AS plan
FROM events;`,
        output: ` event_type | plan
------------+------
 signup     | pro`,
      },
      {
        caption: 'Containment query accelerated by a GIN index',
        code: `CREATE INDEX idx_events_payload ON events USING GIN (payload);

SELECT id FROM events
WHERE payload @> '{"user": {"plan": "pro"}}';`,
        output: `CREATE INDEX
 id
----
  1`,
      },
    ],
    commonMistakes: [
      'Defaulting to JSON instead of JSONB, then discovering it cannot be indexed efficiently and re-parses on every read.',
      'Using ->> when a nested JSON/JSONB result (not text) is needed for further chaining, breaking the chain of -> operators.',
      'Storing data as JSONB that is actually always the same shape — a case where real columns with proper types and constraints would be simpler, faster, and safer to query.',
      'Forgetting to create a GIN index before relying on @> or ? containment queries at scale, resulting in slow sequential scans.',
    ],
    keyPoints: [
      'JSON preserves exact text and re-parses on read; JSONB stores a parsed binary form and is faster to query.',
      '-> returns JSON/JSONB, ->> returns text; #> and #>> do the same via a path array.',
      'JSONB supports @> (contains) and ? (has key), which can be indexed with GIN for fast containment search.',
      'JSONB is the default choice for semi-structured data; use JSON only when exact text preservation is required.',
    ],
  },

  arrays: {
    title: 'Array Columns in PostgreSQL',
    intro: `Unlike most relational databases, PostgreSQL supports native array columns — a single column can hold an ordered list of values of any base type, such as <code>TEXT[]</code>, <code>INTEGER[]</code>, or even arrays of a composite type. This can be a convenient way to store small, unordered-enough collections (like tags) without introducing a separate join table.

Arrays are powerful but easy to overuse. They work best for simple, denormalized lists that are always read and written together with their parent row, not for data you need to query, join, or update independently.`,
    sections: [
      {
        heading: 'Declaring and Inserting Arrays',
        body: `You declare an array column by appending square brackets to a type: <code>tags TEXT[]</code>. Array literals use curly braces in SQL: <code>'{"postgres","sql","database"}'</code>, or you can build them with the <code>ARRAY[...]</code> constructor: <code>ARRAY['postgres', 'sql', 'database']</code>. Elements are accessed with 1-based indexing, e.g. <code>tags[1]</code>.`,
      },
      {
        heading: 'Querying with ANY() and unnest()',
        body: `To check whether a value exists anywhere in an array, use <code>value = ANY(array_column)</code>, which is the array equivalent of <code>IN</code>. To turn an array into a set of rows — for example, to JOIN against it, aggregate over it, or filter with normal WHERE clauses per element — use <code>unnest(array_column)</code>, which expands each element into its own row.`,
      },
      {
        heading: 'When Arrays Are (and Aren\'t) the Right Choice',
        body: `Arrays are appropriate for small, denormalized, order-sensitive lists that belong wholly to one row, such as a list of tags on a blog post or a set of allowed statuses. They become the wrong choice once you need to query "which rows reference this specific tag" efficiently at scale without an index, enforce referential integrity on the elements (foreign keys cannot target elements inside an array), or frequently add/remove individual elements — a proper join table (post_id, tag_id) is more relationally correct for those cases.`,
      },
    ],
    examples: [
      {
        caption: 'Creating an array column, inserting, and querying with ANY()',
        code: `CREATE TABLE posts (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    tags  TEXT[] DEFAULT '{}'
);

INSERT INTO posts (title, tags)
VALUES ('Intro to PostgreSQL', ARRAY['postgres', 'sql', 'database']);

SELECT title FROM posts WHERE 'sql' = ANY(tags);`,
        output: `CREATE TABLE
INSERT 0 1
        title
----------------------
 Intro to PostgreSQL`,
      },
      {
        caption: 'Expanding an array column into rows with unnest()',
        code: `SELECT title, unnest(tags) AS tag FROM posts;`,
        output: `        title         |   tag
----------------------+----------
 Intro to PostgreSQL  | postgres
 Intro to PostgreSQL  | sql
 Intro to PostgreSQL  | database`,
      },
    ],
    commonMistakes: [
      'Using arrays to model a genuine one-to-many relationship that needs its own foreign keys, indexing per element, or independent updates — a join table fits better.',
      'Forgetting PostgreSQL array indexing starts at 1, not 0, when porting logic from most programming languages.',
      'Writing WHERE array_column = value instead of value = ANY(array_column), which compares against the whole array rather than checking membership.',
      'Not adding a GIN index on an array column that is frequently searched with ANY() or the overlap operator (&&) at scale, leading to slow sequential scans.',
    ],
    keyPoints: [
      'PostgreSQL supports native array columns for any base type, declared with type[].',
      'value = ANY(array_column) checks membership; unnest() expands an array into rows for joins and aggregation.',
      'Arrays suit small, denormalized, whole-row-owned lists — not relationships needing independent integrity or indexing.',
      'A GIN index can accelerate array containment/overlap queries at scale.',
    ],
  },

  'practical-schema-design': {
    title: 'Practical Schema Design: Normalizing vs. Using JSONB',
    intro: `Real schema design is a series of trade-offs, not a single "correct" answer. PostgreSQL gives you both a traditional relational toolbox (tables, foreign keys, normalization) and flexible document-style tools (JSONB, arrays), and the skill of a good schema designer is knowing when to reach for each.

This topic works through a concrete example — a product catalog — to show how the types and structures covered so far (NUMERIC, TIMESTAMPTZ, JSONB, arrays, foreign keys) come together into one coherent, defensible design.`,
    sections: [
      {
        heading: 'When to Normalize',
        body: `Normalize into separate tables with foreign keys whenever data needs independent identity, needs to be queried or joined on its own, must enforce referential integrity, or is shared across many parent rows. A "category" that products belong to, a "customer" that places many "orders," or "order line items" that reference both an order and a product are classic normalization candidates — each deserves its own table with a primary key and foreign keys linking them.`,
      },
      {
        heading: 'When JSONB (or Arrays) Are Appropriate',
        body: `Reach for JSONB when the shape of the data genuinely varies per row and is not queried by its internal fields in performance-critical ways — for example, a product's variable "attributes" (a laptop has RAM and screen size; a T-shirt has size and color), or a flexible "metadata" bag for future extensibility. Use a plain array column for short, denormalized lists that always belong entirely to one row, like search tags. The rule of thumb: if you find yourself writing frequent WHERE clauses or JOINs against a specific JSONB key, that key is a strong candidate to become a real, indexed column instead.`,
      },
      {
        heading: 'Combining Both in One Table',
        body: `Most production schemas blend both approaches deliberately: core, universally-present, frequently-queried fields become typed columns with constraints (id, name, price, created_at); a small number of foreign keys capture true relationships (category_id referencing categories); and a JSONB column absorbs the genuinely variable, less-frequently-queried extras. This keeps common queries fast and simple while still allowing flexibility where it earns its cost.`,
      },
    ],
    examples: [
      {
        caption: 'A product catalog blending normalized columns, a foreign key, and JSONB for variable attributes',
        code: `CREATE TABLE categories (
    id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE products (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name        TEXT NOT NULL,
    price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    tags        TEXT[] DEFAULT '{}',
    attributes  JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO categories (name) VALUES ('Laptops');
INSERT INTO products (category_id, name, price, tags, attributes)
VALUES (1, 'UltraBook 14', 999.00, ARRAY['electronics','sale'],
        '{"ram_gb": 16, "screen_inches": 14}');`,
        output: `CREATE TABLE
CREATE TABLE
INSERT 0 1
INSERT 0 1`,
      },
    ],
    commonMistakes: [
      'Putting every column into a single JSONB "data" blob for flexibility, losing type checking, foreign keys, and efficient indexing on fields queried constantly.',
      'Over-normalizing genuinely variable, rarely-queried attributes into dozens of nullable columns instead of using JSONB, resulting in a wide, sparse table.',
      'Storing a true relationship (like which category a product belongs to) as a JSONB field or array instead of a foreign key, losing referential integrity.',
      'Not revisiting the design as query patterns emerge — a JSONB key that becomes a common filter condition should usually be promoted to a real, indexed column.',
    ],
    keyPoints: [
      'Normalize data that needs independent identity, joins, or referential integrity.',
      'Use JSONB for genuinely variable, rarely-filtered attributes; use arrays for small denormalized lists owned by one row.',
      'A frequently-queried JSONB key is a signal to promote that field into a real typed column.',
      'Good schemas deliberately mix normalized columns, foreign keys, and JSONB rather than picking one approach exclusively.',
    ],
  },

  indexes: {
    title: 'Indexes in PostgreSQL: B-tree, GIN, and GiST',
    intro: `An index is a separate data structure that lets PostgreSQL find rows matching a condition without scanning the entire table. Choosing the right index type for the right kind of query and data is one of the highest-leverage skills in database work — the wrong index (or no index) can turn a millisecond query into one that takes seconds.

PostgreSQL supports several index types, each optimized for a different access pattern. The three you will use most often are B-tree (the default, for equality and ranges), GIN (for values containing multiple elements, like JSONB and arrays), and GiST (for geometric, range, and full-text search scenarios).`,
    sections: [
      {
        heading: 'B-tree: The Default, General-Purpose Index',
        body: `<code>CREATE INDEX idx_name ON table(column);</code> creates a B-tree index by default. B-tree indexes excel at equality (<code>=</code>), range comparisons (<code>&lt;, &gt;, BETWEEN</code>), and sorting (<code>ORDER BY</code>), which covers the vast majority of everyday query filtering. Primary keys and unique constraints are automatically backed by a B-tree index.`,
      },
      {
        heading: 'GIN: Indexing "Contains Multiple Values" Data',
        body: `A Generalized Inverted Index (<code>GIN</code>) is built for columns where each value effectively contains many searchable "elements" — JSONB documents, arrays, and full-text search vectors (<code>tsvector</code>). GIN builds an index entry per element rather than per row, which is exactly what makes containment queries like <code>@></code> on JSONB or <code>&&</code> (overlap) on arrays fast. GIN indexes are slower to update than B-tree but much faster for these containment-style lookups.`,
      },
      {
        heading: 'GiST: Indexing Geometric and Range-Like Data',
        body: `A Generalized Search Tree (<code>GiST</code>) index supports more exotic notions of "nearest" or "overlapping" that a strict ordering (like B-tree) cannot express well — geometric data (points, boxes), range types (<code>tsrange</code>, <code>int4range</code>), and full-text search are common use cases. GiST is also the index type behind PostgreSQL's exclusion constraints, which can enforce, for example, that no two date ranges in a bookings table overlap.`,
      },
      {
        heading: 'Choosing the Right Index',
        body: `As a practical rule: use B-tree by default for ordinary WHERE/ORDER BY columns; reach for GIN when the column is JSONB, an array, or a full-text tsvector and you filter with containment operators; reach for GiST for geometric/range data or exclusion constraints. Always verify an index is actually being used with <code>EXPLAIN</code> — an unused index still costs write performance and disk space.`,
      },
    ],
    examples: [
      {
        caption: 'B-tree index for a common equality/range filter',
        code: `CREATE INDEX idx_products_price ON products(price);

EXPLAIN SELECT * FROM products WHERE price < 500;`,
        output: `                        QUERY PLAN
------------------------------------------------------------
 Index Scan using idx_products_price on products
   Index Cond: (price < '500'::numeric)`,
      },
      {
        caption: 'GIN index enabling a fast JSONB containment query',
        code: `CREATE INDEX idx_products_attrs ON products USING GIN (attributes);

EXPLAIN SELECT * FROM products WHERE attributes @> '{"ram_gb": 16}';`,
        output: `                          QUERY PLAN
---------------------------------------------------------------
 Bitmap Heap Scan on products
   Recheck Cond: (attributes @> '{"ram_gb": 16}'::jsonb)
   ->  Bitmap Index Scan on idx_products_attrs`,
      },
    ],
    commonMistakes: [
      'Creating a plain B-tree index on a JSONB or array column and expecting containment queries (@>, &&) to use it — those need GIN.',
      'Adding indexes to every column "just in case," which slows down every INSERT/UPDATE without necessarily speeding up reads that never filter on those columns.',
      'Forgetting to run EXPLAIN to confirm an index is actually chosen by the planner — a low-selectivity index (e.g. on a boolean column) is often ignored in favor of a sequential scan.',
      'Indexing a column used only with functions or expressions (like LOWER(email)) with a plain index instead of a matching expression index, so the index is silently never used.',
    ],
    keyPoints: [
      'B-tree is the default index type, ideal for equality, ranges, and ORDER BY.',
      'GIN indexes containment-style data: JSONB, arrays, and full-text search vectors.',
      'GiST supports geometric data, range types, and exclusion constraints.',
      'Always confirm index usage with EXPLAIN rather than assuming an index will be picked up.',
    ],
  },

  ctes: {
    title: 'Common Table Expressions (CTEs) in PostgreSQL',
    intro: `A Common Table Expression, written with a <code>WITH</code> clause, lets you name a subquery and reference it as if it were a temporary table for the rest of the statement. CTEs exist primarily to make complex SQL readable: instead of nesting subqueries three levels deep, you can break a query into named, sequential steps that read almost like a small program.

Beyond readability, PostgreSQL also supports recursive CTEs, which can express queries that would otherwise be impossible in plain SQL — such as walking a tree or graph structure of arbitrary depth.`,
    sections: [
      {
        heading: 'Basic WITH Clause Syntax',
        body: `<code>WITH cte_name AS (SELECT ...) SELECT ... FROM cte_name;</code> You can define multiple CTEs in one WITH clause, separated by commas, and later CTEs can reference earlier ones. This turns a deeply nested query into a readable sequence of clearly named steps, each of which can also be tested independently by simply running just that subquery.`,
      },
      {
        heading: 'Recursive CTEs',
        body: `A recursive CTE uses <code>WITH RECURSIVE name AS (base_case UNION ALL recursive_case)</code>. The base case produces the starting rows; the recursive case refers back to the CTE itself and keeps running, accumulating results, until it produces no more new rows. This is the standard way to query hierarchical data, such as an employee-to-manager reporting chain or a category tree with arbitrary nesting depth.`,
      },
      {
        heading: 'CTEs vs. Subqueries: Readability, Not Always Performance',
        body: `In modern PostgreSQL (12 and later), a non-recursive CTE is generally inlined into the main query by the planner just like a subquery would be, unless it is referenced multiple times, is recursive, or you explicitly force materialization with <code>MATERIALIZED</code>. So the main reason to reach for a CTE today is clarity of expression, not a guaranteed performance difference — though <code>MATERIALIZED</code> is available when you specifically want the CTE computed once and reused.`,
      },
    ],
    examples: [
      {
        caption: 'A readable multi-step query using WITH',
        code: `WITH expensive_products AS (
    SELECT id, name, price
    FROM products
    WHERE price > 500
),
by_category AS (
    SELECT category_id, COUNT(*) AS expensive_count
    FROM products
    JOIN expensive_products USING (id)
    GROUP BY category_id
)
SELECT c.name, b.expensive_count
FROM by_category b
JOIN categories c ON c.id = b.category_id;`,
        output: `   name   | expensive_count
----------+-----------------
 Laptops  |               1`,
      },
      {
        caption: 'A recursive CTE walking an employee reporting chain',
        code: `WITH RECURSIVE reports_to (id, name, manager_id, depth) AS (
    SELECT id, name, manager_id, 0
    FROM employees
    WHERE manager_id IS NULL          -- base case: the top of the chain
    UNION ALL
    SELECT e.id, e.name, e.manager_id, r.depth + 1
    FROM employees e
    JOIN reports_to r ON e.manager_id = r.id
)
SELECT * FROM reports_to ORDER BY depth;`,
        output: ` id |   name   | manager_id | depth
----+----------+------------+-------
  1 | Priya    |            |     0
  2 | Karan    |          1 |     1
  3 | Sanya    |          2 |     2`,
      },
    ],
    commonMistakes: [
      'Writing a recursive CTE without a terminating condition in the base case (or a naturally shrinking recursive step), causing it to loop until it hits the recursion limit.',
      'Assuming a CTE always materializes and acts as a performance-isolating boundary — since PostgreSQL 12, non-recursive CTEs are usually inlined and optimized like ordinary subqueries.',
      'Referencing a later CTE from an earlier one, which is not allowed — CTEs in a WITH clause can only reference ones defined before them (except within WITH RECURSIVE\'s own self-reference).',
      'Forgetting UNION ALL (not UNION) in a recursive CTE, which adds an unnecessary and potentially expensive duplicate-elimination step on every iteration.',
    ],
    keyPoints: [
      'WITH defines named, reusable subqueries that make complex SQL easier to read and reason about.',
      'WITH RECURSIVE enables querying hierarchical/graph-like data such as org charts or category trees.',
      'Since PostgreSQL 12, non-recursive CTEs are typically inlined by the planner unless referenced multiple times or marked MATERIALIZED.',
      'Recursive CTEs need a well-formed base case and recursive case using UNION ALL to avoid infinite loops.',
    ],
  },

  'window-functions': {
    title: 'Window Functions: ROW_NUMBER, RANK, and PARTITION BY',
    intro: `Window functions perform a calculation across a set of rows related to the current row — without collapsing those rows into a single output row the way GROUP BY does. This lets you compute rankings, running totals, and per-group comparisons while still returning every original row, which is something a plain aggregate query cannot do.

The syntax always follows the same shape: a function call followed by an <code>OVER (...)</code> clause that defines the "window" — optionally partitioned into groups and ordered within each group.`,
    sections: [
      {
        heading: 'ROW_NUMBER, RANK, and DENSE_RANK',
        body: `<code>ROW_NUMBER()</code> assigns a strictly increasing, unique number to each row within its window, even if values tie. <code>RANK()</code> assigns the same rank to tied rows but then skips the next rank number(s) (1, 2, 2, 4). <code>DENSE_RANK()</code> also gives tied rows the same rank but never skips a number (1, 2, 2, 3). Choosing between them depends on whether gaps after ties are meaningful for your use case.`,
      },
      {
        heading: 'PARTITION BY: Resetting the Window per Group',
        body: `<code>PARTITION BY column</code> inside the OVER clause restarts the window function's calculation independently for each distinct value of that column — for example, ranking products within each category separately rather than across the whole table. Without PARTITION BY, the window spans the entire result set. You combine it with <code>ORDER BY</code> inside the same OVER clause to control the ranking order within each partition.`,
      },
      {
        heading: 'A Concrete Ranking Example',
        body: `A very common real-world pattern is "top N per group" — for example, the two highest-priced products in each category. Window functions make this a single clean query: rank products within each category by price, then filter on that rank in an outer query (since window functions cannot be used directly inside a WHERE clause).`,
      },
    ],
    examples: [
      {
        caption: 'Ranking products by price within each category using PARTITION BY',
        code: `SELECT
    name,
    category_id,
    price,
    RANK() OVER (PARTITION BY category_id ORDER BY price DESC) AS price_rank
FROM products;`,
        output: `      name       | category_id | price  | price_rank
------------------+-------------+--------+------------
 UltraBook 14     |           1 | 999.00 |          1
 Budget Laptop    |           1 | 399.00 |          2
 Wireless Mouse   |           2 |  29.99 |          1`,
      },
      {
        caption: 'Top 2 most expensive products per category using ROW_NUMBER in a CTE',
        code: `WITH ranked AS (
    SELECT name, category_id, price,
           ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rn
    FROM products
)
SELECT name, category_id, price FROM ranked WHERE rn <= 2;`,
        output: `      name       | category_id | price
------------------+-------------+--------
 UltraBook 14     |           1 | 999.00
 Budget Laptop    |           1 | 399.00
 Wireless Mouse   |           2 |  29.99`,
      },
    ],
    commonMistakes: [
      'Trying to filter directly on a window function in a WHERE clause (e.g. "WHERE RANK() = 1") — window functions are evaluated after WHERE, so you must wrap the query in a CTE or subquery and filter in the outer query.',
      'Using RANK() when DENSE_RANK() (or vice versa) was actually intended, producing unexpected gaps or lack thereof after tied values.',
      'Forgetting PARTITION BY entirely and getting a single global ranking when a per-group ranking was intended.',
      'Confusing window functions with GROUP BY aggregates — window functions keep every row in the output, while GROUP BY collapses rows into one per group.',
    ],
    keyPoints: [
      'Window functions compute per-row values across a related set of rows without collapsing the result set.',
      'ROW_NUMBER gives unique sequential numbers; RANK skips numbers after ties; DENSE_RANK does not skip.',
      'PARTITION BY restarts the window calculation independently for each group; ORDER BY controls ranking order within it.',
      'To filter on a window function\'s result, wrap the query in a CTE or subquery, since window functions cannot appear in WHERE directly.',
    ],
  },

  functions: {
    title: 'Writing Functions in PostgreSQL with PL/pgSQL',
    intro: `PostgreSQL lets you write server-side functions that execute inside the database itself, close to the data. The default and most widely used procedural language for this is PL/pgSQL, which extends plain SQL with variables, conditionals, loops, and exception handling — similar in spirit to a small imperative programming language embedded in SQL.

Functions are useful for encapsulating business logic that should always run consistently regardless of which application or client touches the database, for building reusable calculations, and for powering triggers.`,
    sections: [
      {
        heading: 'Anatomy of a PL/pgSQL Function',
        body: `A function is created with <code>CREATE FUNCTION name(parameters) RETURNS return_type AS $$ ... $$ LANGUAGE plpgsql;</code>. The <code>$$</code> pair is "dollar quoting," which lets you write a multi-line function body without escaping internal quotes. Inside, a <code>DECLARE</code> section (optional) defines local variables, and a <code>BEGIN ... END;</code> block holds the executable logic, ending with a <code>RETURN</code> statement for the declared return type.`,
      },
      {
        heading: 'Parameters, Logic, and Control Flow',
        body: `Function parameters are referenced directly by name inside the body. PL/pgSQL supports <code>IF/ELSIF/ELSE</code>, <code>LOOP</code>/<code>WHILE</code>/<code>FOR</code>, and can run ordinary SQL statements (SELECT INTO a variable, INSERT, UPDATE) as part of its logic — meaning a function can both compute a value and have side effects on the database.`,
      },
      {
        heading: 'Calling a Function',
        body: `Once created, a function is called like any built-in function: <code>SELECT function_name(arg1, arg2);</code>. Functions can also be used inside larger queries, as default values for columns, or attached to triggers so they run automatically on INSERT/UPDATE/DELETE.`,
      },
    ],
    examples: [
      {
        caption: 'A PL/pgSQL function that applies a capped discount to a price',
        code: `CREATE FUNCTION apply_discount(price NUMERIC, discount NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
    capped NUMERIC;
BEGIN
    IF discount > 0.5 THEN
        capped := 0.5;
    ELSE
        capped := discount;
    END IF;

    RETURN price - (price * capped);
END;
$$ LANGUAGE plpgsql;

SELECT apply_discount(100.00, 0.75);`,
        output: ` apply_discount
-----------------
           50.00`,
      },
    ],
    commonMistakes: [
      'Forgetting the LANGUAGE plpgsql clause at the end of CREATE FUNCTION, which the parser needs to know how to interpret the function body.',
      'Using = instead of := for variable assignment inside a PL/pgSQL block — plain SQL comparison and assignment look different in PL/pgSQL.',
      'Not handling the case where a SELECT INTO a variable returns no rows, leaving the variable NULL and causing confusing downstream errors rather than an explicit check.',
      'Writing complex, performance-critical logic entirely in PL/pgSQL loops row-by-row when an equivalent set-based SQL query would run far faster.',
    ],
    keyPoints: [
      'PL/pgSQL is PostgreSQL\'s default procedural language for writing server-side functions.',
      'Dollar quoting ($$ ... $$) lets a function body span multiple lines without escaping quotes.',
      'Functions support DECLARE for local variables and BEGIN/END blocks with conditionals, loops, and embedded SQL.',
      'Functions are called like built-ins and can also back triggers, defaults, or computed columns.',
    ],
  },

  transactions: {
    title: 'Transactions and SAVEPOINT in PostgreSQL',
    intro: `A transaction groups one or more SQL statements into a single all-or-nothing unit of work. PostgreSQL guarantees full ACID compliance: either every statement in the transaction succeeds and is made permanent with <code>COMMIT</code>, or none of them take effect, undone entirely with <code>ROLLBACK</code>. This is essential whenever multiple related changes must succeed or fail together — such as debiting one account and crediting another.

PostgreSQL also has a distinctive behavior worth knowing: once any statement inside a transaction produces an error, the entire transaction is marked as aborted, and every subsequent statement is rejected until you issue a ROLLBACK — even statements that would otherwise have succeeded.`,
    sections: [
      {
        heading: 'BEGIN, COMMIT, and ROLLBACK',
        body: `A transaction starts with <code>BEGIN;</code> (or <code>START TRANSACTION;</code>), after which every statement is provisional. <code>COMMIT;</code> makes all of those changes permanent and visible to other connections. <code>ROLLBACK;</code> discards every change made since BEGIN, as if none of it had happened. Outside of an explicit BEGIN, PostgreSQL runs every individual statement in its own implicit transaction, which is why a single INSERT without BEGIN is already atomic on its own.`,
      },
      {
        heading: 'The "Aborted Transaction" Behavior',
        body: `If any statement inside a BEGIN block raises an error, PostgreSQL puts the whole transaction into an aborted state. You will see the error <code>current transaction is aborted, commands ignored until end of transaction block</code> for every further statement, even valid ones, until you run ROLLBACK. This surprises developers coming from databases with more forgiving error handling, and it is precisely why SAVEPOINT exists.`,
      },
      {
        heading: 'SAVEPOINT: Partial Rollback',
        body: `<code>SAVEPOINT name;</code> marks a point inside a transaction that you can roll back to without discarding the entire transaction. <code>ROLLBACK TO SAVEPOINT name;</code> undoes everything since that savepoint (and clears the aborted state, if the error happened after it) while keeping earlier work in the transaction intact. <code>RELEASE SAVEPOINT name;</code> discards the savepoint once you no longer need to roll back to it. This is especially useful for handling an expected failure in one step of a larger transaction — such as attempting an INSERT that might violate a unique constraint — without losing everything else already done in that transaction.`,
      },
    ],
    examples: [
      {
        caption: 'A transaction transferring funds between two accounts atomically',
        code: `BEGIN;

UPDATE accounts SET balance = balance - 200 WHERE id = 1;
UPDATE accounts SET balance = balance + 200 WHERE id = 2;

COMMIT;`,
        output: `BEGIN
UPDATE 1
UPDATE 1
COMMIT`,
      },
      {
        caption: 'Using SAVEPOINT to recover from an expected error mid-transaction',
        code: `BEGIN;

INSERT INTO categories (name) VALUES ('Books');

SAVEPOINT before_duplicate;
INSERT INTO categories (name) VALUES ('Laptops'); -- violates UNIQUE, fails
ROLLBACK TO SAVEPOINT before_duplicate;

INSERT INTO categories (name) VALUES ('Stationery');

COMMIT;`,
        output: `BEGIN
INSERT 0 1
SAVEPOINT
ERROR:  duplicate key value violates unique constraint "categories_name_key"
ROLLBACK
INSERT 0 1
COMMIT`,
      },
    ],
    commonMistakes: [
      'Continuing to run statements after an error inside a transaction without a prior SAVEPOINT, then being confused by "current transaction is aborted" errors on every subsequent statement.',
      'Forgetting to COMMIT (or explicitly ROLLBACK) an open transaction, leaving it idle and holding locks that block other connections.',
      'Assuming SAVEPOINT alone is enough without ROLLBACK TO SAVEPOINT — creating a savepoint does nothing by itself; it only marks a point you can return to.',
      'Treating a multi-statement operation as "probably fine without BEGIN," when a failure partway through leaves the database in an inconsistent, partially-applied state.',
    ],
    keyPoints: [
      'BEGIN...COMMIT/ROLLBACK groups statements into one atomic, all-or-nothing unit of work.',
      'Once a statement inside a transaction errors, PostgreSQL aborts the entire transaction until ROLLBACK is issued.',
      'SAVEPOINT lets you roll back part of a transaction without discarding everything already done.',
      'Outside an explicit transaction, every individual statement runs in its own implicit transaction.',
    ],
  },

  'roles-permissions': {
    title: 'Roles and Permissions in PostgreSQL',
    intro: `PostgreSQL uses a single unified concept called a "role" to represent both users and groups — there is no separate USER object distinct from ROLE. A role can log in (acting as a user), can be granted to other roles (acting as a group), or both. Managing roles and the privileges granted to them is how PostgreSQL controls who can do what to which objects.`,
    sections: [
      {
        heading: 'Creating Roles',
        body: `<code>CREATE ROLE role_name LOGIN PASSWORD 'secret';</code> creates a role that can connect to the database (the <code>LOGIN</code> attribute is what distinguishes a "user-like" role from a pure group). <code>CREATE ROLE app_readers;</code> without LOGIN creates a group-like role meant only to hold and distribute a set of privileges. Other useful attributes include <code>SUPERUSER</code>, <code>CREATEDB</code>, and <code>CREATEROLE</code>, granted sparingly.`,
      },
      {
        heading: 'GRANT and REVOKE',
        body: `Privileges on specific objects are given with <code>GRANT privilege ON object TO role;</code> — for example, <code>GRANT SELECT, INSERT ON orders TO app_writer;</code>. <code>REVOKE</code> removes a previously granted privilege using the same shape: <code>REVOKE INSERT ON orders FROM app_writer;</code>. Common object-level privileges include SELECT, INSERT, UPDATE, DELETE for tables, and USAGE for schemas and sequences (needed alongside table grants for a role to actually reach objects inside a non-public schema or use identity/sequence-backed columns).`,
      },
      {
        heading: 'Role Inheritance and Group Membership',
        body: `A role can be granted membership in another role with <code>GRANT group_role TO member_role;</code>. By default, a member role automatically inherits (uses) the privileges of any role it belongs to, without needing to explicitly switch — this is controlled by the <code>INHERIT</code>/<code>NOINHERIT</code> attribute. This makes it practical to define privilege sets once on a group role (like <code>app_readers</code> with SELECT on all app tables) and simply add or remove individual login roles from that group as staff change, rather than re-granting privileges one by one.`,
      },
    ],
    examples: [
      {
        caption: 'Creating a group role, a login role, and granting privileges through membership',
        code: `CREATE ROLE app_readers;
GRANT USAGE ON SCHEMA public TO app_readers;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readers;

CREATE ROLE analyst LOGIN PASSWORD 'S3curePass!';
GRANT app_readers TO analyst;

-- 'analyst' can now SELECT from every table in public via inherited membership`,
        output: `CREATE ROLE
GRANT
GRANT
CREATE ROLE
GRANT ROLE`,
      },
    ],
    commonMistakes: [
      'Granting privileges directly to individual login roles one at a time instead of via a group role, making onboarding/offboarding staff error-prone.',
      'Forgetting GRANT USAGE ON SCHEMA when granting table privileges in a non-public schema — without schema USAGE, table grants alone still leave the role unable to see the objects.',
      'Creating a role with NOLOGIN and then being confused why a client cannot connect as that role — NOLOGIN roles are meant purely as privilege groups.',
      'Over-granting SUPERUSER to application roles for convenience, bypassing all permission checks and defeating the purpose of fine-grained GRANTs.',
    ],
    keyPoints: [
      'PostgreSQL uses one unified "role" concept for both users (LOGIN roles) and groups.',
      'GRANT and REVOKE control specific privileges (SELECT, INSERT, USAGE, etc.) on specific objects.',
      'Role membership (GRANT role TO role) combined with INHERIT lets member roles automatically use a group\'s privileges.',
      'Schema-level USAGE is required in addition to table-level grants for non-public schemas.',
    ],
  },

  'explain-plans': {
    title: 'Reading Query Plans with EXPLAIN in PostgreSQL',
    intro: `<code>EXPLAIN</code> shows you the execution plan PostgreSQL's query planner has chosen for a statement — which scan methods, join strategies, and orderings it will use — without actually running the query. Adding <code>ANALYZE</code> actually executes the statement and reports real timing and row counts alongside the planner's estimates, making it the single most important tool for diagnosing why a query is slow.`,
    sections: [
      {
        heading: 'EXPLAIN vs. EXPLAIN ANALYZE',
        body: `Plain <code>EXPLAIN SELECT ...;</code> only estimates cost and row counts based on table statistics — it never actually executes the query, which makes it safe to run even on statements with side effects like UPDATE or DELETE. <code>EXPLAIN ANALYZE SELECT ...;</code> actually runs the query and reports real elapsed time and actual row counts per plan node, letting you compare "estimated rows" against "actual rows" — a large mismatch there is one of the most common signals of stale table statistics or a poor plan choice.`,
      },
      {
        heading: 'Adding BUFFERS for I/O Visibility',
        body: `<code>EXPLAIN (ANALYZE, BUFFERS) SELECT ...;</code> additionally reports how many disk buffers were hit in cache versus read from disk for each plan node. A high number of "read" (as opposed to "hit") buffers on a hot, frequently-run query can point to a table that doesn't fit comfortably in memory or an index that isn't being leveraged effectively.`,
      },
      {
        heading: 'Reading the Plan Tree',
        body: `A plan is a tree of nodes, read from the innermost (bottom) node outward. Common node types include <code>Seq Scan</code> (reads the whole table — fine for small tables, a red flag on large ones without a matching WHERE-friendly index), <code>Index Scan</code> / <code>Index Only Scan</code> (uses an index to jump directly to matching rows), and join nodes like <code>Nested Loop</code>, <code>Hash Join</code>, and <code>Merge Join</code>, each suited to different table sizes and join conditions. Each node reports estimated cost (arbitrary planner units), estimated rows, and — with ANALYZE — actual time and actual rows.`,
      },
    ],
    examples: [
      {
        caption: 'EXPLAIN ANALYZE, BUFFERS revealing an index scan with real timing',
        code: `EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM products WHERE category_id = 1 ORDER BY price DESC;`,
        output: `                                                    QUERY PLAN
--------------------------------------------------------------------------------------------------------------
 Sort  (cost=8.32..8.35 rows=12 width=64) (actual time=0.041..0.042 rows=2 loops=1)
   Sort Key: price DESC
   Buffers: shared hit=3
   ->  Index Scan using idx_products_category on products (cost=0.15..8.10 rows=12 width=64)
                                                  (actual time=0.020..0.022 rows=2 loops=1)
         Index Cond: (category_id = 1)
         Buffers: shared hit=3
 Planning Time: 0.112 ms
 Execution Time: 0.061 ms`,
      },
    ],
    commonMistakes: [
      'Running plain EXPLAIN and treating estimated rows as ground truth — only EXPLAIN ANALYZE shows what actually happened, and large estimate/actual gaps signal outdated statistics.',
      'Running EXPLAIN ANALYZE on a destructive statement (UPDATE/DELETE) in production without wrapping it in a transaction and rolling back — ANALYZE genuinely executes the statement.',
      'Seeing a Seq Scan and assuming it is always bad — on a small table, or when most rows match the condition anyway, a sequential scan can legitimately be the fastest option.',
      'Ignoring the Buffers output and focusing only on Execution Time, missing that a query is slow specifically because it is reading heavily from disk rather than cache.',
    ],
    keyPoints: [
      'EXPLAIN shows the planner\'s estimated plan without executing; EXPLAIN ANALYZE actually runs the query and reports real timings.',
      'EXPLAIN (ANALYZE, BUFFERS) additionally shows cache hits versus disk reads per plan node.',
      'Plans are trees read from the innermost node outward; Seq Scan, Index Scan, and join node types each imply different strategies.',
      'A large gap between estimated and actual row counts is a strong signal of stale statistics or a suboptimal plan.',
    ],
  },

  'performance-basics': {
    title: 'PostgreSQL Performance Basics: VACUUM, ANALYZE, and Connection Pooling',
    intro: `Beyond indexing and query plans, PostgreSQL has a few operational fundamentals that keep it running efficiently over time: routine maintenance via VACUUM and ANALYZE, and managing how client connections reach the server. Both matter more as an application grows, and both are frequently overlooked until performance quietly degrades.`,
    sections: [
      {
        heading: 'Why VACUUM Is Necessary',
        body: `PostgreSQL uses a storage strategy called MVCC (Multi-Version Concurrency Control): an UPDATE or DELETE does not immediately erase the old row version, it marks it as "dead" so that other concurrent transactions reading it still see a consistent snapshot. Over time, dead row versions accumulate as table "bloat," wasting disk space and slowing scans. <code>VACUUM</code> reclaims that space for reuse (without necessarily shrinking the file on disk, unlike <code>VACUUM FULL</code>, which rewrites the whole table and requires a stronger lock).`,
      },
      {
        heading: 'ANALYZE and the Query Planner',
        body: `<code>ANALYZE</code> collects statistics about the distribution of values in each column — how many distinct values, how common each is, roughly how the data is sorted — and stores them for the query planner to use when estimating plan costs. Outdated statistics (for example, after a large bulk load) are a common cause of the planner choosing a poor plan, since its row-count estimates become inaccurate. PostgreSQL runs both VACUUM and ANALYZE automatically in the background via <strong>autovacuum</strong>, but understanding what it does helps you diagnose when its defaults need tuning for a specific heavily-written table.`,
      },
      {
        heading: 'Connection Pooling with PgBouncer',
        body: `Each PostgreSQL connection is a full operating-system process with meaningful memory overhead, so PostgreSQL handles at most a few hundred to low thousands of concurrent connections comfortably. Applications that open (and often leak) many short-lived connections — common with serverless functions or large web fleets — benefit from a connection pooler like <strong>PgBouncer</strong> sitting between the application and PostgreSQL. PgBouncer maintains a small pool of real server connections and multiplexes many client connections onto them, dramatically reducing the load a spiky application places on the database itself.`,
      },
    ],
    examples: [
      {
        caption: 'Running VACUUM and ANALYZE, and checking a table\'s dead tuple count',
        code: `VACUUM ANALYZE products;

SELECT relname, n_dead_tup, n_live_tup
FROM pg_stat_user_tables
WHERE relname = 'products';`,
        output: `VACUUM
   relname  | n_dead_tup | n_live_tup
------------+------------+------------
 products   |          0 |          3`,
      },
    ],
    commonMistakes: [
      'Disabling autovacuum on a busy table "to reduce overhead," causing dead tuple bloat and progressively slower sequential scans over time.',
      'Running VACUUM FULL on a large, actively used table during peak hours — it takes an exclusive lock that blocks reads and writes for its duration.',
      'Forgetting to run ANALYZE after a large bulk data load, leaving the planner with stale statistics and a higher chance of choosing a poor plan.',
      'Letting every application instance open its own uncapped pool of direct PostgreSQL connections instead of routing through a pooler like PgBouncer, eventually exhausting max_connections.',
    ],
    keyPoints: [
      'MVCC means UPDATE/DELETE leave dead row versions behind; VACUUM reclaims that space for reuse.',
      'ANALYZE refreshes the statistics the query planner relies on to estimate costs and choose plans.',
      'Autovacuum runs both automatically in the background, but heavily-written tables sometimes need tuned settings.',
      'A connection pooler like PgBouncer reduces overhead from many short-lived or spiky client connections.',
    ],
  },

  'backup-restore-concepts': {
    title: 'Backup and Restore Concepts: pg_dump and pg_restore',
    intro: `A database with no backup strategy is one hardware failure or mistaken DELETE away from permanent data loss. PostgreSQL supports two fundamentally different approaches to backups — logical and physical — and understanding the difference determines which tool is right for a given recovery scenario.`,
    sections: [
      {
        heading: 'Logical vs. Physical Backups',
        body: `A <strong>logical backup</strong> captures the data as a sequence of SQL statements (or an equivalent portable format) that can recreate the schema and rows — it is database-version-and-platform independent, human-inspectable in plain SQL form, and lets you restore a single table or database rather than everything at once. A <strong>physical backup</strong> copies the actual data files PostgreSQL stores on disk (via tools like <code>pg_basebackup</code>, or filesystem/volume snapshots), producing an exact byte-for-byte copy that restores much faster for very large databases but must be restored to a compatible PostgreSQL version and architecture, and generally restores the entire cluster rather than one table.`,
      },
      {
        heading: 'pg_dump and pg_restore',
        body: `<code>pg_dump dbname > backup.sql</code> produces a logical, plain-SQL dump of one database. Using the <code>-Fc</code> (custom format) flag instead produces a compressed, non-plain-text archive that supports selective and parallel restore: <code>pg_dump -Fc dbname > backup.dump</code>. <code>pg_restore -d newdb backup.dump</code> then rebuilds the database from that custom-format archive, and importantly, pg_restore can selectively restore just one table or schema from the archive with <code>-t tablename</code>, something a plain SQL dump makes far more tedious.`,
      },
      {
        heading: 'Choosing an Approach',
        body: `Logical backups (pg_dump) are the right default for most applications: they are simple, portable across PostgreSQL versions, and support fine-grained restores. Physical backups (pg_basebackup plus continuous WAL archiving) become necessary for very large databases where minimizing downtime and restore time matters, and they enable point-in-time recovery — replaying the write-ahead log to restore the database to any specific moment, not just the moment the backup was taken.`,
      },
    ],
    examples: [
      {
        caption: 'Creating a compressed logical backup and restoring it into a new database',
        code: `-- Create a custom-format dump (from the terminal, not psql)
-- pg_dump -Fc -d bookstore -f bookstore.dump

-- Create an empty target database, then restore into it
-- createdb bookstore_restored
-- pg_restore -d bookstore_restored bookstore.dump`,
        output: `pg_dump: dumping contents of table "public.authors"
pg_restore: creating TABLE "public.authors"
pg_restore: creating CONSTRAINT "authors_pkey"
-- restored database now matches the source at dump time`,
      },
    ],
    commonMistakes: [
      'Relying only on plain-text pg_dump output for a very large database, missing out on the parallel restore and selective-table restore that the custom (-Fc) format enables.',
      'Assuming a physical backup (data directory copy or filesystem snapshot) can be restored onto a different PostgreSQL major version — physical backups are tied to a specific version and platform, unlike logical dumps.',
      'Never testing a restore until an actual emergency, discovering only then that the backup file is corrupted, incomplete, or missing required extensions/roles.',
      'Treating a single full pg_dump as sufficient for point-in-time recovery — recovering to an arbitrary moment (not just the dump\'s snapshot time) requires continuous WAL archiving with a physical base backup.',
    ],
    keyPoints: [
      'Logical backups (pg_dump) store portable SQL/data and allow selective, version-flexible restores.',
      'Physical backups copy raw data files, restoring faster for huge databases but tied to a compatible PostgreSQL version.',
      'pg_dump\'s custom format (-Fc) enables compression, parallel dumps, and selective restore via pg_restore.',
      'Point-in-time recovery requires physical base backups combined with continuous WAL archiving, not logical dumps alone.',
    ],
  },
}
