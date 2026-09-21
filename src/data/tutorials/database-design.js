// Database Design module — hand-written lesson content.
// Keys are slugs used directly as topic identifiers in the Database Design course.
export const databaseDesignContent = {
  'requirement-to-schema-workflow': {
    title: 'Requirement-to-Schema Workflow',
    intro: `Database design is not something you start by opening a modeling tool and dragging tables onto a canvas. It starts with a plain-language business requirement, and the job of a designer is to translate that requirement into a precise, unambiguous schema without losing or inventing meaning along the way. Every table, column, and constraint you eventually write should trace back to something a stakeholder actually said or something the system genuinely needs.

This translation happens in repeatable stages: gather the requirement, extract the nouns and verbs it implies, group them into entities and relationships, decide on cardinality and constraints, and only then write the DDL (Data Definition Language) that creates the physical schema. Skipping stages is how you end up with schemas that "sort of" work until an edge case — a customer with two addresses, an order with no payment yet — breaks the assumptions baked into the tables.`,
    sections: [
      {
        heading: 'The Five-Stage Workflow',
        body: `A disciplined design process moves through the same stages regardless of the domain, whether you are modeling an e-commerce store or a hospital scheduling system.`,
        list: [
          '<strong>1. Capture the requirement in plain language</strong> — e.g. "Customers place orders. Each order contains one or more products, and each product has a price and a stock quantity."',
          '<strong>2. Identify entities</strong> — nouns that represent things the business needs to remember: Customer, Order, Product.',
          '<strong>3. Identify relationships and cardinality</strong> — how entities connect and how many of one relate to how many of another (a customer places many orders; an order contains many products, and a product can appear on many orders).',
          '<strong>4. Define attributes and constraints</strong> — what data each entity holds, which fields are required, which must be unique, and which reference other entities.',
          '<strong>5. Translate to DDL and validate against real queries</strong> — write the CREATE TABLE statements, then mentally (or actually) run the application\'s most common queries against the design to confirm it can answer them without contortion.',
        ],
      },
      {
        heading: 'Working Backward from Questions the System Must Answer',
        body: `A requirement sentence tells you what the business does, but it rarely tells you what questions the application needs to answer quickly. "Show me all orders a customer placed in the last 30 days" or "what is the total revenue per product this month" are the real tests of a schema. As you move through the workflow, keep a running list of the queries the application will need, because a schema that satisfies the requirement narrative but cannot answer these questions efficiently will need to be reworked before it reaches production — better to catch that during design than after data has accumulated in a live table.`,
      },
      {
        heading: 'Requirement Ambiguity Is a Design Problem, Not a Detail to Skip',
        body: `Real requirements are almost always incomplete. "Each order contains one or more products" says nothing about whether the same product can appear twice on one order at different quantities, or whether an order can exist with zero products while it is still a draft. A designer's job is to surface these ambiguities and get them resolved — either by asking the stakeholder or by making an explicit, documented assumption — before they get silently encoded as an accidental constraint in the schema.`,
      },
    ],
    examples: [
      {
        caption: 'From a one-sentence requirement to a first-pass schema',
        code: `-- Requirement: "Customers place orders. Each order contains one or more
-- products, and each product has a price and a stock quantity."

-- Step 2 & 3 identified entities: Customer, Order, Product
-- Step 3 identified relationships: Customer 1---* Order, Order *---* Product

-- Step 5: translate to DDL
CREATE TABLE customers (
    id            BIGINT PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE products (
    id            BIGINT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    unit_price    DECIMAL(10, 2) NOT NULL,
    stock_qty     INT NOT NULL DEFAULT 0
);

CREATE TABLE orders (
    id            BIGINT PRIMARY KEY,
    customer_id   BIGINT NOT NULL REFERENCES customers(id),
    placed_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many between orders and products needs a join table (see topic 4)
CREATE TABLE order_items (
    order_id      BIGINT NOT NULL REFERENCES orders(id),
    product_id    BIGINT NOT NULL REFERENCES products(id),
    quantity      INT NOT NULL CHECK (quantity > 0),
    unit_price    DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);`,
        output: `Four tables created: customers, products, orders, order_items.
Each customer can have many orders (customer_id foreign key on orders).
Each order can contain many products, and each product can appear on many
orders, resolved through the order_items join table. unit_price is copied
onto order_items so historical orders keep the price at time of purchase
even if products.unit_price changes later.`,
      },
    ],
    commonMistakes: [
      'Jumping straight to tables and columns without first writing down entities and relationships in plain language, which leads to structures that mirror the wording of one sentence rather than the actual business rules.',
      'Treating the first draft of a requirement as complete and final, instead of probing for the ambiguous cases (optional relationships, duplicate items, cancellations) that always surface later.',
      'Designing the schema without listing the queries the application needs to run, resulting in a technically correct model that requires expensive joins or app-side workarounds for common operations.',
      'Confusing a requirement document\'s wording with the schema\'s naming — copying phrases like "list of products" directly into a single denormalized column instead of recognizing it as a relationship.',
    ],
    keyPoints: [
      'Schema design follows a repeatable path: requirement → entities → relationships/cardinality → attributes/constraints → DDL.',
      'Every table and column should be traceable back to a real requirement or a real, known query — not guessed.',
      'Keep a running list of the queries the application must answer; a schema is only correct if it can answer them efficiently.',
      'Ambiguity in requirements should be resolved explicitly and documented, not silently encoded as an accidental constraint.',
    ],
  },

  entities: {
    title: 'Identifying Entities in Database Design',
    intro: `An entity is a distinct "thing" the business needs to store information about — something with its own identity that exists independently of other things. In a requirement statement, entities usually show up as nouns: customer, order, product, invoice, employee. Recognizing which nouns deserve to become their own table, and which are just attributes of another entity, is one of the first and most consequential decisions in database design.

Getting this wrong in either direction causes real damage. Turning every noun into a table produces a needlessly fragmented schema full of one-row lookup tables. Failing to split out a genuine entity — for example, storing "shipping address" as a single text column on the customer table instead of its own Address entity — makes it impossible to support customers with multiple addresses later without a disruptive rewrite.`,
    sections: [
      {
        heading: 'Entities vs. Attributes',
        body: `The test for "is this an entity or just an attribute" is whether the thing has its own identity, its own attributes, and potentially its own relationships to other things. A customer's email address is an attribute — it has no meaning or lifecycle independent of the customer. A customer's shipping address, on the other hand, often deserves to be its own entity: it can be reused across orders, a customer can have several, and it has its own structure (street, city, postal code) worth naming as a unit.`,
        list: [
          '<strong>Entity signal</strong>: the thing can exist, be created, or be referenced independently ("this address," "this product," "this employee").',
          '<strong>Entity signal</strong>: multiple instances can belong to the same parent (a customer can have many addresses, many payment methods).',
          '<strong>Attribute signal</strong>: the value only ever describes one specific parent and has no independent meaning (a customer\'s date of birth, a product\'s color).',
          '<strong>Attribute signal</strong>: the value is a simple scalar with no internal structure worth breaking out (a boolean flag, a single price).',
        ],
      },
      {
        heading: 'Strong Entities vs. Weak Entities',
        body: `A strong entity has its own unique identifier and can exist independently — Customer, Product, Employee. A weak entity depends on another entity for its identity and typically cannot exist without it — an OrderLineItem has no meaning without its parent Order, and its uniqueness is often defined in terms of the parent (order_id + line_number). Recognizing weak entities early tells you that a foreign key to the parent should usually be part of the primary key, or at minimum a NOT NULL, non-optional column.`,
      },
      {
        heading: 'Naming and Attribute Inventory',
        body: `Once an entity is identified, list every attribute it needs, and for each one note its data type, whether it is required, and whether it should be unique. This attribute inventory becomes the column list for the CREATE TABLE statement, and doing it deliberately — rather than adding columns reactively as features are built — keeps entities focused on a single, coherent concept instead of accumulating unrelated fields over time.`,
      },
    ],
    examples: [
      {
        caption: 'Recognizing a hidden entity (Address) instead of flattening it into Customer',
        code: `-- Weak first pass: address flattened directly onto the customer
-- CREATE TABLE customers (
--     id BIGINT PRIMARY KEY,
--     full_name VARCHAR(150),
--     shipping_street VARCHAR(200),
--     shipping_city VARCHAR(100),
--     shipping_postal_code VARCHAR(20)
-- );
-- Problem: cannot support a second shipping address or a separate
-- billing address without adding more duplicate columns.

-- Better: Address recognized as its own entity
CREATE TABLE customers (
    id          BIGINT PRIMARY KEY,
    full_name   VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE addresses (
    id           BIGINT PRIMARY KEY,
    customer_id  BIGINT NOT NULL REFERENCES customers(id),
    address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('billing', 'shipping')),
    street       VARCHAR(200) NOT NULL,
    city         VARCHAR(100) NOT NULL,
    postal_code  VARCHAR(20) NOT NULL
);`,
        output: `A customer can now have zero, one, or many address rows, each tagged as
billing or shipping, without any change to the customers table. Adding a
second shipping address is just inserting another row in addresses, not
a schema migration.`,
      },
    ],
    commonMistakes: [
      'Flattening a one-to-many concept (multiple addresses, multiple phone numbers) into repeated columns like address_1, address_2 instead of recognizing it as its own entity.',
      'Turning every simple attribute into a separate one-column lookup table "for flexibility," which adds unnecessary joins without a real reuse or independence benefit.',
      'Failing to identify weak entities (line items, order history events) and giving them a primary key with no real relationship to their owning entity.',
      'Naming an entity after the requirement\'s wording rather than the concept it represents, producing tables like "ThingsCustomersBuy" instead of "orders" or "order_items".',
    ],
    keyPoints: [
      'An entity has its own identity and can be created, referenced, or repeated independently; an attribute only describes one specific parent.',
      'Weak entities depend on a parent entity for identity and usually carry the parent\'s foreign key as part of their own uniqueness.',
      'Recognizing hidden entities (like Address) early avoids painful schema rewrites when the business later needs "more than one" of something.',
      'Build a deliberate attribute inventory per entity rather than adding columns reactively as features are requested.',
    ],
  },

  relationships: {
    title: 'Modeling Relationships Between Entities',
    intro: `Once entities are identified, the next question is how they connect to each other. A relationship captures a real-world association — a customer places orders, an employee manages a department, a product belongs to a category — and in a relational database, every relationship must ultimately be expressed through foreign keys or, for many-to-many associations, through an entire join table.

Relationships are not optional decoration on top of entities; they are where most of the actual design difficulty lives. Getting entities right is usually straightforward once you know the domain, but deciding how those entities reference each other — including what happens when a referenced row is deleted, and whether a relationship is optional or mandatory — is where schemas succeed or quietly accumulate bad data.`,
    sections: [
      {
        heading: 'From Sentence to Foreign Key',
        body: `A relationship in a requirement sentence usually has a direction and an owner. "Each order belongs to one customer" tells you the foreign key lives on the orders table (orders.customer_id references customers.id) — the "many" side of a one-to-many relationship always holds the foreign key pointing to the "one" side. Getting the direction backwards (putting a customer_id-like column on the wrong table) is a common early mistake that becomes obvious only once you try to model a customer with more than one order.`,
      },
      {
        heading: 'Mandatory vs. Optional Relationships',
        body: `A relationship is mandatory if a row cannot exist without it — an order_items row makes no sense without an order, so order_id should be NOT NULL. A relationship is optional if the association can be absent — a customer may or may not have an assigned account manager, so account_manager_id can allow NULL. Deciding this explicitly, column by column, prevents both false NOT NULL constraints that block legitimate data entry and false nullable columns that let genuinely required links go missing.`,
      },
      {
        heading: 'Referential Actions: What Happens on Delete or Update',
        body: `Every foreign key needs an explicit policy for what happens when the referenced row is deleted or its key changes: ON DELETE CASCADE (delete dependents automatically), ON DELETE RESTRICT (block the delete if dependents exist), or ON DELETE SET NULL (clear the reference but keep the dependent row). Choosing this deliberately — rather than accepting a database default you haven\'t checked — is part of relationship design, not an afterthought: deleting a customer should probably not silently cascade-delete years of order history.`,
        list: [
          '<strong>CASCADE</strong> — appropriate for true ownership, e.g. deleting an order should delete its order_items.',
          '<strong>RESTRICT / NO ACTION</strong> — appropriate when the dependent data must be preserved or archived first, e.g. blocking deletion of a product that appears in past orders.',
          '<strong>SET NULL</strong> — appropriate for optional associations, e.g. clearing assigned_employee_id if that employee record is removed.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A one-to-many relationship with an explicit, deliberate referential action',
        code: `CREATE TABLE departments (
    id    BIGINT PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE employees (
    id             BIGINT PRIMARY KEY,
    full_name      VARCHAR(150) NOT NULL,
    department_id  BIGINT NULL REFERENCES departments(id) ON DELETE SET NULL,
    manager_id     BIGINT NULL REFERENCES employees(id) ON DELETE SET NULL
);`,
        output: `employees.department_id is a mandatory-looking but actually optional
relationship: an employee can be unassigned to any department. If a
department is deleted, ON DELETE SET NULL clears department_id on its
employees rather than deleting the employee rows or blocking the delete.
manager_id is a self-referencing relationship (an employee can manage
other employees) with the same "orphan gracefully" policy.`,
      },
    ],
    commonMistakes: [
      'Putting the foreign key on the "one" side of a one-to-many relationship instead of the "many" side, making it impossible for one parent to have multiple children.',
      'Leaving every foreign key nullable "just in case," instead of deciding per relationship whether the association is truly mandatory or optional.',
      'Accepting the database\'s default referential action without thinking about it, resulting in either accidental cascading deletes of important history or blocked deletes that surprise the application.',
      'Modeling a relationship only in application code (fetching related rows manually by matching values) instead of declaring it as a real foreign key constraint the database can enforce.',
    ],
    keyPoints: [
      'The "many" side of a one-to-many relationship holds the foreign key that points to the "one" side.',
      'Every relationship should be explicitly classified as mandatory (NOT NULL foreign key) or optional (nullable foreign key).',
      'Referential actions (CASCADE, RESTRICT, SET NULL) must be chosen deliberately based on whether the dependent data represents true ownership or a loose association.',
      'Relationships belong in the database as enforced foreign key constraints, not only as an implicit convention in application code.',
    ],
  },

  cardinality: {
    title: 'Relationship Cardinality in Database Design',
    intro: `Cardinality describes how many instances of one entity can be associated with how many instances of another. Every relationship in a schema is one of three basic shapes — one-to-one, one-to-many, or many-to-many — and the shape determines exactly how the relationship must be implemented physically: as a foreign key on one side, a foreign key on the "many" side, or an entirely separate join table.

Getting cardinality wrong is one of the most expensive mistakes to fix later, because it usually means the physical structure of a table needs to change, not just a constraint. Deciding cardinality correctly during design — by asking "can there be more than one?" in both directions — avoids that rework.`,
    sections: [
      {
        heading: 'One-to-One',
        body: `A one-to-one relationship means each row in table A relates to at most one row in table B, and vice versa. It is implemented by putting a foreign key with a UNIQUE constraint on one of the two tables (often the one that is optional or less frequently accessed). One-to-one relationships are commonly used to split a large or sensitive table — for example, separating rarely-needed profile details or sensitive data from a frequently-queried core users table.`,
      },
      {
        heading: 'One-to-Many',
        body: `A one-to-many relationship means one row in table A can relate to many rows in table B, but each row in table B relates to only one row in table A. This is the most common relationship shape (one customer has many orders, one department has many employees) and is implemented with a plain foreign key on the "many" side, as described in the relationships topic.`,
      },
      {
        heading: 'Many-to-Many and the Join Table',
        body: `A many-to-many relationship means rows on both sides can relate to multiple rows on the other side — one order can contain many products, and one product can appear on many orders. Relational databases cannot express many-to-many directly with a single foreign key; it must be resolved with a join table (also called an associative or junction table) that holds a foreign key to each side, and typically uses the combination of both as its composite primary key.`,
        list: [
          '<strong>One-to-one</strong>: FK with UNIQUE constraint on one side (e.g. users.id ↔ user_profiles.user_id UNIQUE).',
          '<strong>One-to-many</strong>: plain FK on the "many" side (e.g. orders.customer_id).',
          '<strong>Many-to-many</strong>: a join table with FKs to both sides (e.g. order_items with order_id and product_id).',
        ],
      },
    ],
    examples: [
      {
        caption: 'All three cardinalities modeled in one schema: users↔profile, author↔posts, students↔courses',
        code: `-- One-to-one: each user has exactly one extended profile
CREATE TABLE users (
    id     BIGINT PRIMARY KEY,
    email  VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE user_profiles (
    user_id    BIGINT PRIMARY KEY REFERENCES users(id),
    bio        TEXT,
    avatar_url VARCHAR(500)
);

-- One-to-many: one author writes many posts
CREATE TABLE posts (
    id         BIGINT PRIMARY KEY,
    author_id  BIGINT NOT NULL REFERENCES users(id),
    title      VARCHAR(200) NOT NULL
);

-- Many-to-many: students enroll in many courses, courses have many students
CREATE TABLE students (
    id    BIGINT PRIMARY KEY,
    name  VARCHAR(150) NOT NULL
);

CREATE TABLE courses (
    id    BIGINT PRIMARY KEY,
    title VARCHAR(150) NOT NULL
);

CREATE TABLE enrollments (
    student_id  BIGINT NOT NULL REFERENCES students(id),
    course_id   BIGINT NOT NULL REFERENCES courses(id),
    enrolled_on DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (student_id, course_id)
);`,
        output: `user_profiles.user_id being both the primary key and a foreign key
enforces exactly one profile per user (one-to-one). posts.author_id
allows an author to have many posts, but each post has exactly one
author (one-to-many). enrollments resolves the many-to-many between
students and courses; the composite primary key (student_id, course_id)
prevents the same student from enrolling in the same course twice.`,
      },
    ],
    commonMistakes: [
      'Trying to model a many-to-many relationship with a single foreign key on one of the two tables, which can only express one-to-many.',
      'Forgetting the UNIQUE constraint on a one-to-one foreign key, which silently allows it to become a one-to-many relationship.',
      'Storing a comma-separated list of related IDs in a single column instead of creating a proper join table, which breaks referential integrity and makes queries and indexing painful.',
      'Not adding extra attributes (like enrolled_on, or order line quantity) that belong to the relationship itself, rather than to either entity, onto the join table.',
    ],
    keyPoints: [
      'One-to-one uses a foreign key with a UNIQUE constraint; one-to-many uses a plain foreign key on the "many" side.',
      'Many-to-many relationships require a join table with foreign keys to both entities, since a single foreign key column cannot express them.',
      'A composite primary key on the join table (both foreign keys together) prevents duplicate associations.',
      'Attributes that describe the relationship itself (quantity, enrollment date, price at time of purchase) belong on the join table, not on either entity.',
    ],
  },

  'normalization-denormalization-trade-offs': {
    title: 'Normalization and Denormalization Trade-offs',
    intro: `Normalization is the process of organizing tables so that each piece of information is stored in exactly one place, eliminating redundancy and the update anomalies that come with it. The standard normal forms — 1NF (atomic columns, no repeating groups), 2NF (no partial dependency on part of a composite key), and 3NF (no non-key column depending on another non-key column) — give a structured way to reach a design where data has a single source of truth.

Normalization is the right default, but it is not free: a fully normalized schema often requires more joins to answer a single business question, and at high read volume those joins can become the bottleneck. Denormalization — deliberately reintroducing redundancy to speed up reads — is a legitimate design tool, but only when applied consciously to a specific, measured performance problem, with a clear plan for how the duplicated data stays consistent.`,
    sections: [
      {
        heading: 'Why Normalize First',
        body: `A normalized schema means updating a customer\'s email address touches exactly one row, and every part of the system that reads it sees the same value. Without normalization, the same fact (a product\'s current price, a customer\'s current address) can be copied into many tables, and those copies inevitably drift out of sync as the data changes over time — an update anomaly. Designing normalized first, then denormalizing selectively, keeps the default behavior of the schema correct and only trades correctness for speed where you have explicitly decided it is worth it.`,
      },
      {
        heading: 'When Normalization Hurts Read Performance',
        body: `Consider an orders list page that needs to show, per order, the customer name, the number of items, and the order total. In a fully normalized schema this requires joining orders to customers and aggregating order_items for every single row shown — fine at low volume, but expensive when the page is loaded thousands of times per minute or the tables grow into the tens of millions of rows. Recomputing an aggregate (like a total) on every read is wasted work if the underlying line items rarely change once an order is placed.`,
      },
      {
        heading: 'Deliberate Denormalization: a Stored Total',
        body: `A common, well-understood denormalization is storing a computed value — like order_total — directly on the orders table instead of recalculating SUM(quantity * unit_price) from order_items on every read. This trades a small amount of duplicated, derivable data for avoiding a join-and-aggregate on a hot read path. The trade-off only works if you also decide, explicitly, how the stored total stays correct: recomputed in the same transaction that inserts or updates order_items, or maintained through a trigger, so it never silently drifts from the true sum of the line items.`,
        list: [
          '<strong>Normalize by default</strong> for anything that is written more than it is read, or where consistency matters more than raw read speed (financial records, inventory counts).',
          '<strong>Consider denormalizing</strong> only after profiling shows a specific, frequently-run query is expensive because of joins or aggregation.',
          '<strong>Always pair denormalization with a consistency plan</strong> — a transaction, trigger, or scheduled job that keeps the duplicated value accurate.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Storing a denormalized order_total alongside the normalized order_items detail',
        code: `CREATE TABLE orders (
    id            BIGINT PRIMARY KEY,
    customer_id   BIGINT NOT NULL REFERENCES customers(id),
    placed_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Denormalized, derivable field: kept in sync by the app/trigger below.
    order_total   DECIMAL(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE order_items (
    order_id    BIGINT NOT NULL REFERENCES orders(id),
    product_id  BIGINT NOT NULL REFERENCES products(id),
    quantity    INT NOT NULL CHECK (quantity > 0),
    unit_price  DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

-- Consistency plan: recompute order_total whenever order_items changes.
CREATE OR REPLACE FUNCTION recalc_order_total() RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET order_total = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM order_items
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalc_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION recalc_order_total();`,
        output: `The orders list page can now read order_total directly with zero joins
or aggregation. order_items remains the normalized source of truth for
line-level detail (used on the order detail page). The trigger guarantees
order_total is recalculated automatically any time a line item is added,
changed, or removed, so the denormalized value never drifts.`,
      },
    ],
    commonMistakes: [
      'Denormalizing preemptively, before any real query has been shown to be slow, which adds consistency risk for no measured benefit.',
      'Storing a computed value redundantly without a mechanism (trigger, transaction, scheduled job) to keep it in sync, letting it silently become stale.',
      'Over-normalizing to 3NF or beyond even for small, rarely-changing lookup data where the extra joins add complexity without a meaningful correctness benefit.',
      'Treating normalization and denormalization as a one-time, whole-schema decision rather than a targeted choice made table by table, and query by query.',
    ],
    keyPoints: [
      'Normalization (1NF/2NF/3NF) eliminates redundancy and update anomalies by keeping each fact in exactly one place — it should be the default.',
      'Fully normalized schemas can require expensive joins and aggregation on hot read paths at scale.',
      'Denormalization deliberately duplicates or precomputes data (like a stored order_total) to speed up reads, and should be applied only where measured need justifies it.',
      'Every denormalized field needs an explicit plan — a trigger, transaction, or job — to keep it consistent with its source of truth.',
    ],
  },

  'naming-standards': {
    title: 'Database Naming Standards and Conventions',
    intro: `Naming conventions feel like a minor stylistic choice until a schema grows past a handful of tables, at which point inconsistency becomes a genuine source of bugs and wasted time — developers guessing whether a table is called "order" or "orders," whether a column is "createdAt" or "created_at," or whether a foreign key is "customer" or "customer_id." A consistent naming standard, decided once and enforced everywhere, removes an entire category of friction and mistakes.

There is no single naming scheme that is objectively "correct" across every database engine and team, but the value comes from picking one scheme and applying it without exception, so that every table, column, and constraint in the schema can be guessed correctly without checking documentation.`,
    sections: [
      {
        heading: 'Singular vs. Plural Table Names',
        body: `Some conventions name tables after the singular entity (customer, order); others use the plural, treating a table as a collection of rows (customers, orders). Plural naming is the more common convention in modern relational schemas because a table literally holds many rows of that entity, and it avoids awkward phrasing in join-table names like order_items rather than order_item_item. Whichever you choose, apply it to every table without exception — no mixing "customer" and "orders" in the same schema.`,
      },
      {
        heading: 'snake_case vs. camelCase, and Reserved Words',
        body: `snake_case (all lowercase, words separated by underscores: created_at, unit_price) is the dominant convention for SQL identifiers because SQL itself is case-insensitive by default in most engines unless identifiers are quoted, and mixing case reliably causes cross-platform and cross-tool inconsistencies. Column and table names should also avoid reserved SQL keywords (order, user, group) as bare identifiers, since they force awkward quoting everywhere they are referenced; prefer orders, users, user_group or purchase_order instead.`,
      },
      {
        heading: 'Consistent Foreign Key and Primary Key Naming',
        body: `A foreign key column should be named after the singular referenced entity plus _id: customer_id, product_id, department_id. A primary key is almost always simply id, which combined with the foreign key convention above means a self-explanatory join is always table_a.id = table_b.table_a_singular_id. Consistency here means anyone reading unfamiliar SQL can correctly guess join conditions without opening the schema documentation.`,
        list: [
          '<strong>Tables</strong>: plural, snake_case — customers, order_items, product_categories.',
          '<strong>Primary keys</strong>: id, consistently, on every table.',
          '<strong>Foreign keys</strong>: singular_entity_id — customer_id, product_id.',
          '<strong>Booleans</strong>: prefixed is_/has_ — is_active, has_discount.',
          '<strong>Timestamps</strong>: suffixed _at — created_at, updated_at, deleted_at.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Consistent naming applied end to end across a small schema',
        code: `CREATE TABLE product_categories (
    id          BIGINT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
    id           BIGINT PRIMARY KEY,
    category_id  BIGINT NOT NULL REFERENCES product_categories(id),
    name         VARCHAR(150) NOT NULL,
    unit_price   DECIMAL(10, 2) NOT NULL,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Anyone reading this join can predict it without documentation:
SELECT p.name, c.name AS category_name
FROM products p
JOIN product_categories c ON p.category_id = c.id
WHERE p.is_active = TRUE;`,
        output: `Table names are plural snake_case, the primary key is always "id", the
foreign key category_id predictably matches product_categories.id, the
boolean uses an is_ prefix, and both timestamps use the _at suffix. A
developer unfamiliar with this exact schema can still write the join
above correctly on the first try.`,
      },
    ],
    commonMistakes: [
      'Mixing singular and plural table names across the same schema (customer next to orders), forcing developers to memorize exceptions instead of applying a rule.',
      'Using a reserved SQL keyword as a bare table or column name (order, user, group), which then requires quoting everywhere it is referenced.',
      'Naming foreign keys inconsistently (sometimes customer_id, sometimes cust_fk, sometimes just customer), making joins impossible to guess without checking the schema.',
      'Mixing camelCase and snake_case within the same database, which becomes especially painful on case-sensitive platforms or when identifiers are quoted inconsistently.',
    ],
    keyPoints: [
      'Pick one convention for table pluralization and casing (commonly plural, snake_case) and apply it without exception across the whole schema.',
      'Avoid bare reserved SQL keywords as identifiers to prevent forced quoting throughout the codebase.',
      'Standardize primary keys as id and foreign keys as singular_entity_id so joins are predictable without documentation.',
      'Consistency matters more than which specific convention is chosen — the value comes from zero exceptions, not from the "best" style.',
    ],
  },

  'data-integrity': {
    title: 'Enforcing Data Integrity in Database Design',
    intro: `Data integrity means the database itself refuses to store data that violates the rules of the business, rather than relying entirely on application code to check those rules before every insert or update. Application-level validation is useful for giving users friendly error messages, but it is not a substitute for database-level constraints, because application code can have bugs, can be bypassed by a second application or a direct database script, and can simply be forgotten in one code path out of many.

Designing for data integrity means treating NOT NULL, foreign keys, UNIQUE, and CHECK constraints as first-class design decisions made table by table and column by column — not an afterthought bolted on after the schema is "working."`,
    sections: [
      {
        heading: 'NOT NULL: Making Required Fields Actually Required',
        body: `Every column should be explicitly decided as required or optional; NOT NULL is the mechanism that turns "this should always have a value" from a comment or a hope into an enforced guarantee. A column left nullable by default, without a decision, is the single most common source of "why is this field empty in production" bugs — because eventually some code path, some import script, or some manual fix will skip setting it.`,
      },
      {
        heading: 'Foreign Keys: Preventing Orphaned and Invalid References',
        body: `A foreign key constraint guarantees that a value like orders.customer_id can never point to a customer that does not exist. Without this constraint enforced at the database level, a bug or a race condition in application code can insert an order referencing a deleted or nonexistent customer, and that broken reference then corrupts every report or join that assumes the relationship is valid.`,
      },
      {
        heading: 'UNIQUE and CHECK: Guarding Business Rules Directly in the Schema',
        body: `UNIQUE constraints prevent duplicate values where the business requires exactly one (one email per customer account, one SKU per product). CHECK constraints enforce rules about the value itself, independent of other rows — a quantity must be greater than zero, a discount percentage must be between 0 and 100, a status column must be one of a fixed set of values. These guardrails catch bad data at the moment it is written, which is far cheaper than discovering and cleaning it up after it has spread through reports and downstream systems.`,
        list: [
          '<strong>NOT NULL</strong> — a value must always be present.',
          '<strong>FOREIGN KEY</strong> — a value must reference an existing row in another table.',
          '<strong>UNIQUE</strong> — no two rows may share the same value (or combination of values).',
          '<strong>CHECK</strong> — a value must satisfy a specific condition (range, set of allowed values, sign).',
        ],
      },
    ],
    examples: [
      {
        caption: 'A products table with layered integrity guardrails',
        code: `CREATE TABLE products (
    id           BIGINT PRIMARY KEY,
    sku          VARCHAR(50) NOT NULL UNIQUE,
    name         VARCHAR(150) NOT NULL,
    unit_price   DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    stock_qty    INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    status       VARCHAR(20) NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'discontinued', 'out_of_stock')),
    category_id  BIGINT NOT NULL REFERENCES product_categories(id)
);

-- These inserts are rejected by the database itself, before any
-- application code even runs:
-- INSERT INTO products (id, sku, name, unit_price, category_id)
--   VALUES (1, NULL, 'Widget', 9.99, 1);              -- NOT NULL violation on sku
-- INSERT INTO products (id, sku, name, unit_price, category_id)
--   VALUES (2, 'SKU-1', 'Widget', -5.00, 1);           -- CHECK violation on unit_price
-- INSERT INTO products (id, sku, name, unit_price, category_id)
--   VALUES (3, 'SKU-1', 'Widget', 9.99, 999);          -- FK violation, category 999 doesn't exist`,
        output: `Each commented insert fails with a distinct, specific database error
(NOT NULL violation, CHECK constraint violation, foreign key violation)
rather than silently storing invalid data. Valid rows must have a
non-null unique SKU, a non-negative price, non-negative stock, a status
from the fixed allowed set, and a category that actually exists.`,
      },
    ],
    commonMistakes: [
      'Relying solely on application-level validation and leaving the corresponding database columns nullable or unconstrained, so a second application, script, or bug can bypass the rule entirely.',
      'Adding a foreign key column without an actual FOREIGN KEY constraint, which allows orphaned or invalid references to accumulate silently.',
      'Using a free-text VARCHAR column for a value that should be restricted to a fixed set of options, instead of a CHECK constraint (or enum type), allowing typos like "actve" to sit undetected in production data.',
      'Adding constraints only after a data quality problem has already occurred in production, instead of designing them in from the first migration.',
    ],
    keyPoints: [
      'Database-level constraints (NOT NULL, FOREIGN KEY, UNIQUE, CHECK) enforce rules that application code alone cannot guarantee, since app code can have bugs or be bypassed.',
      'Every column should have an explicit required/optional decision expressed as NOT NULL or nullable, not left nullable by default.',
      'Foreign keys prevent orphaned references; UNIQUE prevents duplicates; CHECK enforces valid ranges and allowed value sets.',
      'Catching bad data at write time with constraints is far cheaper than discovering and cleaning it after it has spread downstream.',
    ],
  },

  'audit-fields': {
    title: 'Audit Fields in Database Design',
    intro: `Audit fields are standard columns added to tables purely to answer "who changed this, and when" — separate from the business data itself. The most common set is created_at, updated_at, and created_by (sometimes updated_by as well), and they earn their place on nearly every table in a production schema because they are cheap to add and disproportionately valuable when something needs to be debugged, disputed, or reported on later.

Without audit fields, answering a question like "was this price always wrong, or did someone change it yesterday" requires guesswork or external logs that may not exist. With them, the answer is a single query against the table itself.`,
    sections: [
      {
        heading: 'created_at and updated_at',
        body: `created_at records the exact moment a row was inserted and should never change afterward; updated_at records the most recent modification and should be refreshed on every update. Both should default to the current timestamp at insert time, and updated_at is best maintained automatically (via a trigger or an ORM hook) rather than relying on every application code path to remember to set it manually — a single forgotten update statement anywhere in the codebase otherwise leaves it stale.`,
      },
      {
        heading: 'created_by and updated_by',
        body: `In any system with more than one user or service capable of writing data, created_by (and often updated_by) records which user, account, or service performed the write. This is essential for accountability in collaborative systems — knowing which staff member adjusted a price, which admin deleted a record, or which background job wrote a batch of rows — and it is far harder to reconstruct after the fact than to capture at write time.`,
      },
      {
        heading: 'Why Audit Fields Matter Beyond Debugging',
        body: `Audit fields support far more than developer debugging: customer support needs created_at to confirm when an order was placed, finance needs updated_at and updated_by to investigate a disputed price change, and compliance requirements in many industries mandate a traceable record of who modified sensitive data. Because retrofitting audit fields onto a live table with years of existing rows means those historical rows will have incomplete or null audit data, it is far cheaper to include these columns from the very first migration of a table than to add them later.`,
        list: [
          '<strong>created_at</strong> — TIMESTAMP, set once at insert, never modified afterward.',
          '<strong>updated_at</strong> — TIMESTAMP, refreshed automatically on every update.',
          '<strong>created_by</strong> — references the user/service that inserted the row.',
          '<strong>updated_by</strong> — references the user/service that made the most recent change.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A table with a full audit field set, and a trigger keeping updated_at accurate',
        code: `CREATE TABLE invoices (
    id           BIGINT PRIMARY KEY,
    customer_id  BIGINT NOT NULL REFERENCES customers(id),
    amount       DECIMAL(12, 2) NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by   BIGINT NOT NULL REFERENCES users(id),
    updated_by   BIGINT NOT NULL REFERENCES users(id)
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION set_updated_at();`,
        output: `Inserting a row stamps created_at and updated_at with the same
timestamp and records the inserting user via created_by. Any later
UPDATE to the row automatically refreshes updated_at through the
trigger regardless of which application code path performed the
update, so it can never be accidentally left stale.`,
      },
    ],
    commonMistakes: [
      'Relying on application code to manually set updated_at on every update statement, which inevitably gets forgotten in at least one code path.',
      'Adding audit fields only after a dispute or incident has already made their absence a problem, leaving historical rows with incomplete audit data.',
      'Recording created_by/updated_by as a plain text name instead of a foreign key to the users table, making the audit trail unreliable if a user is later renamed or deleted.',
      'Confusing updated_at (last modification time) with created_at (never-changing insert time) and updating the wrong one, or updating both on every write.',
    ],
    keyPoints: [
      'created_at and updated_at are cheap, standard columns that let anyone answer "when was this written or changed" directly from the table.',
      'created_by and updated_by provide accountability in any system where more than one user or service can write data.',
      'updated_at should be maintained automatically (trigger or ORM hook), not manually, so it is never accidentally skipped.',
      'Add audit fields from a table\'s first migration — retrofitting them later leaves historical rows with incomplete data.',
    ],
  },

  'soft-delete': {
    title: 'Soft Delete Pattern in Database Design',
    intro: `A soft delete marks a row as deleted without physically removing it from the table, typically through an is_deleted boolean or a deleted_at timestamp column, so the data still exists in the database but is excluded from normal application queries. This is a deliberate alternative to a hard delete (an actual DELETE statement that permanently removes the row), and choosing between the two is a real design decision with meaningful trade-offs, not just a style preference.

Soft delete is common in production systems because deleted data is very often needed again — for recovery from a mistaken deletion, for audit and compliance requirements, for historical reporting, or because other rows still reference the "deleted" row through foreign keys and cannot simply lose that reference.`,
    sections: [
      {
        heading: 'The deleted_at Pattern',
        body: `A nullable deleted_at TIMESTAMP column is generally preferable to a plain is_deleted boolean, because it captures both the fact of deletion and exactly when it happened, at no extra storage cost. Every query that should only see "live" rows adds a WHERE deleted_at IS NULL clause (often wrapped in a view or an ORM default scope so it isn\'t forgotten), and "deleting" a row becomes an UPDATE that sets deleted_at to the current timestamp instead of a DELETE.`,
      },
      {
        heading: 'Trade-offs vs. Hard Delete',
        body: `Soft delete preserves recoverability, audit history, and referential integrity for rows still referenced elsewhere, but it comes at a real cost: every query in the application must consistently remember to filter out soft-deleted rows, unique constraints become more complicated (a deleted user\'s email should probably be reusable by a new signup, but a plain UNIQUE constraint on email would block that), and the table grows indefinitely since nothing is ever actually removed. Hard delete is simpler and keeps tables smaller, but it is permanent, breaks any foreign keys still pointing at the row (unless cascaded), and destroys any audit trail of what used to exist.`,
        list: [
          '<strong>Choose soft delete</strong> when data must be recoverable, when compliance or audit rules require history, or when other tables reference the row.',
          '<strong>Choose hard delete</strong> for genuinely transient or sensitive data (e.g. expired session tokens, data under a legal "right to erasure" requirement) where retention itself is the risk.',
          '<strong>Hybrid approach</strong>: soft delete immediately, then a scheduled job permanently purges rows past a defined retention period.',
        ],
      },
      {
        heading: 'Handling Uniqueness and Foreign Keys with Soft Delete',
        body: `A plain UNIQUE constraint on a column like email breaks the moment a soft-deleted row exists with that email, since the constraint doesn\'t know the row is "gone." Many databases support a partial unique index (UNIQUE ... WHERE deleted_at IS NULL) that enforces uniqueness only among live rows, which is the correct fix. Foreign keys pointing at soft-deleted rows also need a deliberate policy: the application typically must still be able to display an order placed by a since-deleted customer, so the customer record is kept (soft-deleted) rather than hard-deleted out from under existing orders.`,
      },
    ],
    examples: [
      {
        caption: 'Soft delete with a partial unique index so the email can be reused after deletion',
        code: `CREATE TABLE customers (
    id          BIGINT PRIMARY KEY,
    full_name   VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    deleted_at  TIMESTAMP NULL
);

-- Enforce uniqueness only among live (non-deleted) rows
CREATE UNIQUE INDEX uq_customers_email_live
    ON customers (email)
    WHERE deleted_at IS NULL;

-- "Deleting" a customer is an UPDATE, not a DELETE
UPDATE customers SET deleted_at = CURRENT_TIMESTAMP WHERE id = 42;

-- Every normal application query filters out soft-deleted rows
SELECT id, full_name, email FROM customers WHERE deleted_at IS NULL;`,
        output: `Customer id 42 remains physically in the table (its orders and other
references stay valid), but disappears from normal application queries.
Because the unique index only covers rows where deleted_at IS NULL, a
new customer can sign up again later with the same email address that
the deleted account used, without a constraint violation.`,
      },
    ],
    commonMistakes: [
      'Adding an is_deleted or deleted_at column without a partial unique index, then discovering that a soft-deleted row\'s unique email/username permanently blocks new signups with the same value.',
      'Forgetting to add "WHERE deleted_at IS NULL" in some queries or reports, causing soft-deleted rows to reappear inconsistently across the application.',
      'Choosing soft delete for every table by default, including high-volume transient data, causing tables to grow indefinitely and slowing down queries and indexes over time.',
      'Hard-deleting a row that other tables still reference via foreign key, either causing a constraint violation or an unwanted cascade that removes historical data.',
    ],
    keyPoints: [
      'Soft delete marks a row as deleted (commonly via a nullable deleted_at timestamp) instead of physically removing it, keeping the data recoverable and preserving references from other tables.',
      'Every application query must consistently exclude soft-deleted rows, usually enforced through a view or ORM default scope so it is never forgotten.',
      'Unique constraints on soft-deletable tables should typically be partial indexes scoped to live rows, so values can be reused after deletion.',
      'Soft delete is not free — it requires an explicit retention/purge strategy or tables grow indefinitely, and hard delete remains appropriate for transient or legally-required-to-erase data.',
    ],
  },

  versioning: {
    title: 'Data Versioning in Database Design',
    intro: `Versioning means keeping a history of how a row changed over time, rather than only ever storing its current state. Many business domains genuinely need this: a contract that was amended three times, a product price that changed across a year, an employee\'s salary history, or any record where "what was true at this point in the past" is itself a valid and necessary question to answer.

Without a versioning strategy, an UPDATE statement permanently overwrites the previous value, and once that happens the old value is gone unless it happened to be captured somewhere else (an application log, a backup). Designing versioning into the schema up front means the history is a first-class, queryable part of the data model instead of something reconstructed after the fact from incomplete logs.`,
    sections: [
      {
        heading: 'When Versioning Is Actually Needed',
        body: `Not every table needs history — a user\'s current avatar URL rarely needs a version trail. Versioning earns its complexity when the business genuinely asks "what was X at time T," when past values have legal or contractual significance (pricing at the time an order was placed, terms at the time a contract was signed), or when auditors or regulators require a full change history rather than just a current snapshot.`,
      },
      {
        heading: 'Pattern 1: A History/Audit Table',
        body: `The most common approach keeps a "live" table with only the current state, plus a parallel history table that receives a copy of the old row (usually via a trigger) every time the live row is updated. This keeps the common case — reading current data — simple and fast, while still preserving a full history for the less frequent case of needing to look back.`,
      },
      {
        heading: 'Pattern 2: Row Versioning with an Effective Date Range',
        body: `An alternative, often used for pricing or contract terms, stores every version as its own row in the same table, each tagged with a valid_from and valid_to (or valid_from and is_current) range, rather than overwriting anything. Querying "what was the price on this date" becomes a straightforward range lookup, and querying "what is the current price" becomes a filter for the currently active row. This pattern avoids a separate history table but requires every query to be conscious of the versioning columns.`,
        list: [
          '<strong>History table pattern</strong>: simple current-state table + separate audit table populated by triggers; best when history is read occasionally.',
          '<strong>Effective-dated row pattern</strong>: every version is a full row with a validity range in the same table; best when "what was true on date X" is a frequent, first-class query.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Effective-dated pricing: every price version is its own row with a validity range',
        code: `CREATE TABLE product_prices (
    id          BIGINT PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products(id),
    price       DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    valid_from  TIMESTAMP NOT NULL,
    valid_to    TIMESTAMP NULL  -- NULL means "still current"
);

-- The price that was active on a specific past date
SELECT price
FROM product_prices
WHERE product_id = 501
  AND valid_from <= '2026-03-15'
  AND (valid_to IS NULL OR valid_to > '2026-03-15');

-- Closing out the old price and opening a new one (done in one transaction)
UPDATE product_prices
SET valid_to = CURRENT_TIMESTAMP
WHERE product_id = 501 AND valid_to IS NULL;

INSERT INTO product_prices (id, product_id, price, valid_from, valid_to)
VALUES (9021, 501, 24.99, CURRENT_TIMESTAMP, NULL);`,
        output: `Every historical price for product 501 remains queryable by date range.
The "current price" query is simply the row where valid_to IS NULL.
Changing the price never overwrites history — it closes the old row's
validity range and inserts a new row, so an order placed last month can
still be shown with the price that was actually in effect that day.`,
      },
    ],
    commonMistakes: [
      'Overwriting a value with a plain UPDATE on a table where the business genuinely needs "what was this on date X," permanently destroying history that cannot be reconstructed later.',
      'Adding a history/audit table but forgetting to populate it consistently from every code path that updates the live table, instead of enforcing it with a trigger.',
      'Applying full effective-dated versioning to every table by default, adding unnecessary query complexity to data that never actually needs a history.',
      'Forgetting to close the previous version\'s valid_to when inserting a new version, leaving two "current" rows active for the same entity at once.',
    ],
    keyPoints: [
      'Versioning is needed when past states of data are themselves meaningful — legally, contractually, or for audit and reporting — not for every table by default.',
      'A history/audit table (populated by triggers) keeps the common current-state read fast while preserving full history.',
      'Effective-dated rows (valid_from/valid_to) make "what was true on date X" a straightforward range query, at the cost of extra query complexity everywhere.',
      'Any versioning pattern needs a reliable mechanism (trigger or a single transactional code path) so history can never be silently skipped.',
    ],
  },

  'migration-strategy': {
    title: 'Migration Strategy for Evolving Database Schemas',
    intro: `A migration is a controlled, scripted change to a database schema — adding a column, creating a table, changing a constraint — applied in a specific order so that every environment (a developer\'s machine, staging, production) ends up with the exact same schema history. Because a production database keeps running and serving traffic while a schema evolves, migration strategy is really about answering one question: how do you change the shape of the data underneath a live application without breaking it?

The core discipline is favoring additive, backward-compatible changes over destructive ones, and sequencing any genuinely breaking change across multiple deploys so the application and the database are never out of sync in a way that causes errors.`,
    sections: [
      {
        heading: 'Additive Changes First',
        body: `Adding a new nullable column, adding a new table, or adding a new index are all changes that old application code can safely ignore — they don\'t break anything currently running. This is why the safe default in schema evolution is to prefer additive changes: introduce the new column or table alongside the old structure, deploy application code that can use it, and only remove or rename the old structure in a later, separate migration once nothing depends on it anymore.`,
      },
      {
        heading: 'Handling Genuinely Breaking Changes Safely',
        body: `Some changes are inherently breaking — renaming a column, making a nullable column NOT NULL, dropping a column still read by running code. These need to be split into safe stages instead of a single destructive migration: for a rename, add the new column, backfill it from the old one, deploy application code that writes to both and reads from the new one, then in a later migration drop the old column once no code references it. This staged approach means at every single point in the rollout, both the old and new application code can run against the current schema without errors — important because deployments are rarely instantaneous across every server.`,
        list: [
          '<strong>Safe/additive</strong>: add nullable column, add table, add index, add a new constraint that existing data already satisfies.',
          '<strong>Needs staging</strong>: rename column/table, change a column\'s type, make a column NOT NULL, drop a column or table.',
          '<strong>Rule of thumb</strong>: a migration is safe if the previous version of the application still runs correctly against the new schema.',
        ],
      },
      {
        heading: 'Up and Down Migrations, and Migration Tools',
        body: `Tools like Flyway, Liquibase, and Prisma Migrate manage migrations as an ordered, version-controlled sequence of scripts, each one recorded in a migrations table inside the database itself so the tool always knows exactly which migrations have already run. Each migration conceptually has an "up" (apply the change) and often a "down" (reverse it) — though in practice, rolling forward with a new corrective migration is usually safer in production than rolling back, since a "down" migration can destroy data that was written after the "up" ran. Migrations should be small, single-purpose, and never edited after they have run in any shared environment; a mistake is fixed with a new migration, not by rewriting history.`,
      },
    ],
    examples: [
      {
        caption: 'A safe, staged rename of customers.name to customers.full_name across three migrations',
        code: `-- Migration 001: add the new column, additive and safe
ALTER TABLE customers ADD COLUMN full_name VARCHAR(150);

-- Migration 002: backfill existing rows, then have the app write to both
-- columns during the transition (application code change, not shown)
UPDATE customers SET full_name = name WHERE full_name IS NULL;
ALTER TABLE customers ALTER COLUMN full_name SET NOT NULL;

-- Migration 003 (run only after all app instances read/write full_name
-- exclusively, confirmed by deploy, monitoring, and time elapsed):
ALTER TABLE customers DROP COLUMN name;`,
        output: `At every point between these three migrations, both the old application
code (still using "name") and the new application code (using
"full_name") can run without errors, because migration 001 only adds a
column and migration 002 populates it without touching "name". Only
migration 003, run well after the rollout is confirmed complete, removes
the old column.`,
      },
    ],
    commonMistakes: [
      'Renaming or dropping a column in a single migration deployed at the same time as the application code change, causing errors for any server still running the old code during the rollout window.',
      'Editing or deleting an already-applied migration file instead of writing a new corrective migration, which desyncs the migration history across environments.',
      'Treating a "down" migration as a safe undo button in production, when it can silently discard real data written after the "up" migration ran.',
      'Making a bulk data change and a schema structure change in the same migration script, making it hard to reason about or roll forward from if either half fails.',
    ],
    keyPoints: [
      'Prefer additive, backward-compatible migrations (new nullable columns, new tables) so both old and new application code keep working during a rollout.',
      'Genuinely breaking changes (renames, NOT NULL, drops) should be staged across multiple migrations and deploys, never done in one destructive step.',
      'Migration tools (Flyway, Liquibase, Prisma Migrate) track applied migrations in the database itself, in strict order, so every environment converges on the same schema.',
      'Fix a mistake with a new forward migration rather than editing or rolling back an already-applied one in a shared environment.',
    ],
  },

  'indexing-strategy': {
    title: 'Indexing Strategy in Database Design',
    intro: `An index is a data structure the database maintains alongside a table specifically to make certain lookups fast, at the cost of extra storage and slightly slower writes (since every index must also be updated whenever the underlying row changes). Indexing strategy means deciding, deliberately, which columns and column combinations deserve an index based on how the application actually queries the data — not by indexing every column defensively, and not by leaving performance-critical queries unindexed and hoping the table stays small.

A schema can be perfectly normalized and fully constraint-correct and still perform badly in production if its indexes don\'t match its real query patterns. Indexing is where schema design meets actual, measured application behavior.`,
    sections: [
      {
        heading: 'Index Around Real Query Patterns, Not Guesses',
        body: `The right index for a table depends entirely on what WHERE clauses, JOIN conditions, and ORDER BY clauses the application actually runs against it. A foreign key column used constantly in joins (orders.customer_id) almost always deserves an index; a column that is only ever read as part of a full row fetch by primary key usually does not need one of its own. The starting point for indexing decisions should be the list of real queries gathered during the requirement-to-schema workflow, not a blanket rule like "index every column."`,
      },
      {
        heading: 'Composite Indexes and Column Order',
        body: `A composite (multi-column) index is built on more than one column together, and the order of those columns matters enormously: a composite index on (customer_id, placed_at) can efficiently serve a query filtering on customer_id alone, or on customer_id and placed_at together, but it cannot efficiently serve a query that filters on placed_at alone, because the index is physically sorted by customer_id first. The general rule is to put the column used for equality filtering (customer_id = ?) before the column used for range filtering or sorting (placed_at > ? or ORDER BY placed_at).`,
      },
      {
        heading: 'The Cost Side of Indexing',
        body: `Every index speeds up the reads it matches, but slows down every INSERT, UPDATE, and DELETE on that table slightly, because the index must be updated too, and it consumes additional disk space. A table with ten indexes "just in case" pays that write cost ten times over on every insert, for indexes that may serve queries the application never actually runs. Indexing strategy is therefore a genuine trade-off decision, revisited as query patterns are learned or change, not a one-time exhaustive pass.`,
        list: [
          '<strong>Index</strong>: foreign key columns used in joins, columns in frequent WHERE equality/range filters, columns used for sorting on hot pages.',
          '<strong>Be selective about indexing</strong>: low-cardinality columns (like a boolean) rarely benefit from a standalone index.',
          '<strong>Composite index order</strong>: equality-filtered columns first, then range-filtered or sorted columns.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A composite index designed around a real, known query pattern',
        code: `-- Known application query: "show a customer's orders, most recent first"
-- SELECT * FROM orders
-- WHERE customer_id = ?
-- ORDER BY placed_at DESC;

CREATE TABLE orders (
    id           BIGINT PRIMARY KEY,
    customer_id  BIGINT NOT NULL REFERENCES customers(id),
    placed_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status       VARCHAR(20) NOT NULL DEFAULT 'pending'
);

-- customer_id first (equality filter), placed_at second (sort/range)
CREATE INDEX idx_orders_customer_placed_at ON orders (customer_id, placed_at DESC);

-- This index also serves "customer_id = ? alone" efficiently, but does
-- NOT efficiently serve a query that filters on placed_at without
-- customer_id, since the index is sorted by customer_id first.`,
        output: `The known query — filter by customer_id, sort by placed_at descending —
can be satisfied directly from the index without a separate sort step
or a full table scan. A different query that only filters on placed_at
(e.g. "all orders placed today across all customers") would need its
own separate index on placed_at alone to be efficient.`,
      },
    ],
    commonMistakes: [
      'Adding an index to every column "just in case," which slows down every write on the table without necessarily speeding up any real query.',
      'Building a composite index with columns in the wrong order (range/sort column first, equality column second), which prevents the index from being used efficiently for the actual query pattern.',
      'Indexing a low-cardinality column alone (like a boolean is_active), which rarely narrows a search enough to be worth the index\'s write overhead.',
      'Designing indexes from guesses about future queries instead of the concrete query list gathered during the requirement-to-schema workflow.',
    ],
    keyPoints: [
      'Indexes should be chosen based on the application\'s actual, known query patterns — not applied defensively to every column.',
      'Composite index column order matters: put equality-filtered columns before range-filtered or sorted columns.',
      'Every index has a write and storage cost, so indexing is a deliberate trade-off, not a free performance upgrade.',
      'Foreign key columns used in frequent joins are strong default candidates for indexing; low-cardinality columns usually are not.',
    ],
  },

  'scalable-api-oriented-database-design': {
    title: 'Scalable, API-Oriented Database Design',
    intro: `A schema that will primarily be accessed through a REST or GraphQL API has design pressures beyond correctness and normalization: the shapes of data the API needs to serve efficiently, at scale, under real traffic, become a design input in their own right. A table can be perfectly modeled relationally and still make for a slow, chatty, or hard-to-paginate API if its structure doesn\'t anticipate how the API layer will actually read from it.

Designing for API consumption means thinking about pagination from the start, keeping the "hot path" — the handful of endpoints hit constantly, like a list or feed endpoint — free of expensive joins, and choosing keys and identifiers that work well as opaque values crossing a network boundary.`,
    sections: [
      {
        heading: 'Pagination-Friendly Keys',
        body: `Offset-based pagination (LIMIT 20 OFFSET 1000) gets progressively slower as the offset grows, because the database still has to scan and discard all the skipped rows. Keyset (cursor-based) pagination — filtering on WHERE id > :last_seen_id ORDER BY id LIMIT 20 — stays fast regardless of how deep into the result set a client pages, because it uses an indexed column directly instead of counting through skipped rows. This means the schema should have a naturally ordered, indexed column (an auto-incrementing id, or a created_at plus a tiebreaker id) available for every list endpoint, since keyset pagination depends on it.`,
      },
      {
        heading: 'Avoiding Chatty Joins on Hot Paths',
        body: `An endpoint like GET /orders/:id that a client calls constantly should be designed so the database can answer it with one efficient query, not a cascade of separate round trips or an expensive multi-table join chain executed on every single request. This is where the earlier denormalization discussion becomes directly relevant to API design: storing a computed order_total, or embedding a small, rarely-changing snapshot of data (like the customer\'s name at time of order) directly on the orders row, can turn a hot endpoint from a multi-join query into a single-table lookup.`,
      },
      {
        heading: 'Designing Identifiers for a Public API Boundary',
        body: `An internal auto-incrementing integer primary key is efficient for the database but can leak information across an API boundary — sequential IDs let a client guess how many total rows exist or enumerate other users\' resources by simply incrementing a number in a URL. A common pattern is keeping the efficient integer as the internal primary key for joins and indexing, while exposing a separate, non-guessable public identifier (a UUID or a short random string) in the API responses and URLs.`,
        list: [
          '<strong>Keyset pagination</strong>: paginate on an indexed, ordered column (id or created_at + id), not OFFSET.',
          '<strong>Hot-path denormalization</strong>: precompute or embed data on frequently-hit endpoints to avoid repeated joins per request.',
          '<strong>Internal vs. public identifiers</strong>: keep an efficient internal integer PK, expose a separate UUID/public_id externally.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A table designed for a paginated, public-facing API: keyset pagination and a separate public identifier',
        code: `CREATE TABLE orders (
    id            BIGINT PRIMARY KEY,              -- internal, sequential, used for joins/indexes
    public_id     UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE, -- exposed in the API/URLs
    customer_id   BIGINT NOT NULL REFERENCES customers(id),
    customer_name VARCHAR(150) NOT NULL,            -- snapshot, avoids a join on the hot read path
    order_total   DECIMAL(12, 2) NOT NULL,          -- precomputed, avoids aggregating line items
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_created_at_id ON orders (created_at, id);

-- API list endpoint: GET /orders?after=2026-09-01T00:00:00Z&after_id=48291
SELECT public_id, customer_name, order_total, created_at
FROM orders
WHERE (created_at, id) > ('2026-09-01T00:00:00Z', 48291)
ORDER BY created_at, id
LIMIT 20;

-- API detail endpoint: GET /orders/{public_id} — single-table lookup,
-- no join needed to render the response.
SELECT public_id, customer_name, order_total, created_at
FROM orders WHERE public_id = 'b3f1...';`,
        output: `The list endpoint stays equally fast on page 1 or page 1000, since it
seeks directly via the (created_at, id) index instead of scanning and
discarding skipped rows. The detail endpoint returns everything the API
response needs from a single table with no join. The URL exposes only
the random public_id, so clients cannot guess adjacent order IDs or
infer total order volume from a sequential integer.`,
      },
    ],
    commonMistakes: [
      'Using OFFSET-based pagination on a large, frequently-paged table, causing steadily degrading response times as clients page deeper into results.',
      'Exposing the internal sequential primary key directly in API URLs, letting clients enumerate or estimate the volume of other resources.',
      'Designing a detail endpoint that requires three or four joins on every single request, instead of denormalizing the small set of fields that endpoint actually needs.',
      'Forgetting to index the exact column(s) used for keyset pagination, which forces a full scan even though the query looks efficient.',
    ],
    keyPoints: [
      'Keyset (cursor-based) pagination on an indexed, ordered column stays fast at any depth, unlike OFFSET-based pagination which degrades as the offset grows.',
      'Hot-path API endpoints benefit from deliberate denormalization (precomputed totals, embedded snapshots) to avoid repeated expensive joins per request.',
      'Keep an efficient internal integer primary key for database joins and indexing, but expose a separate non-sequential public identifier (UUID) across the API boundary.',
      'API-oriented design treats the application\'s actual endpoints and traffic patterns as first-class schema design inputs, not just an afterthought layered on top of a "correct" relational model.',
    ],
  },
}
