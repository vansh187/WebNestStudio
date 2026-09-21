// Database and SQL module (Part B) — hand-written lesson content.
// Keys are fixed topic slugs used by the tutorials navigation.
export const databaseSqlContentB = {
  indexes: {
    title: 'Database Indexes',
    intro: `An index is a separate data structure that a database maintains alongside a table so it can find rows without scanning every single one. Without an index, looking up a row by a value means the database engine reads the entire table from start to end — a "full table scan" — checking every row against your condition. On a table with a few hundred rows this is instant; on a table with fifty million rows it can take minutes.

Most relational databases implement indexes using a B-tree (balanced tree) structure. A B-tree keeps indexed values in sorted order across a tree of pages, so the engine can jump directly to the relevant branch instead of reading everything, in roughly logarithmic time rather than linear time. Some databases also offer hash indexes, full-text indexes, or specialized indexes (like GIN/GiST in PostgreSQL for JSON or geometric data), but the B-tree is the default and most common case you will encounter.`,
    sections: [
      {
        heading: 'How a B-Tree Index Speeds Up Reads',
        body: `Think of a B-tree index like the index at the back of a textbook: instead of reading every page to find "transactions", you look up "T" in the index and jump straight to the right pages. A database B-tree stores indexed column values in sorted order, with each node pointing to a range of child nodes. Searching for a value means comparing against a handful of nodes as you descend the tree, rather than comparing against every row. This is why an indexed lookup on a huge table can return in milliseconds while an unindexed lookup on the same table might take seconds or longer.`,
      },
      {
        heading: 'The Write-Side Cost',
        body: `Indexes are not free. Every time you INSERT, UPDATE, or DELETE a row, the database must also update every index that covers the changed columns, to keep the index's sorted structure consistent with the table's actual data. A table with five indexes means every write potentially touches six data structures instead of one. This is why indexing is a trade-off, not something to apply blindly to every column.`,
        list: [
          'Reads become faster — the engine can locate matching rows without scanning the whole table.',
          'Writes become slower — every INSERT/UPDATE/DELETE must also maintain each affected index.',
          'Storage grows — an index is extra data stored on disk, separate from the table itself.',
        ],
      },
      {
        heading: 'When to Add an Index',
        body: `Add an index on columns that are frequently used in WHERE clauses, JOIN conditions, ORDER BY clauses, or as foreign keys — especially on large, read-heavy tables. Avoid indexing columns that are rarely queried, columns on small tables (a full scan of 200 rows is already fast), or columns on tables with very heavy write traffic where the index-maintenance cost would outweigh the read benefit. Primary keys are indexed automatically by virtually every database; the real decision is about secondary indexes on other columns.`,
      },
    ],
    examples: [
      {
        caption: 'Creating an index on a frequently filtered column',
        code: `-- A users table with 5 million rows, frequently filtered by email during login
CREATE INDEX idx_users_email ON users (email);

-- This query now uses the index instead of scanning all 5 million rows
SELECT id, name, email
FROM users
WHERE email = 'asha@example.com';`,
        output: `id: 348221 | name: Asha Verma | email: asha@example.com
(1 row returned in ~2ms using idx_users_email, versus ~800ms with a full table scan)`,
      },
      {
        caption: 'A composite index supporting a common two-column filter',
        code: `-- Orders are frequently queried by customer_id and then filtered by status
CREATE INDEX idx_orders_customer_status ON orders (customer_id, status);

SELECT id, total_amount
FROM orders
WHERE customer_id = 1029 AND status = 'PENDING';`,
        output: `id: 88213 | total_amount: 149.99
id: 88450 | total_amount: 39.50
(2 rows returned quickly via idx_orders_customer_status)`,
      },
    ],
    commonMistakes: [
      'Adding an index to every column "just in case," which slows down every write and wastes storage without a matching read benefit.',
      'Expecting an index to help a query that filters on a function of the column (e.g. WHERE YEAR(created_at) = 2026) — a plain index cannot be used unless it is built to match the expression.',
      'Forgetting that column order matters in a composite (multi-column) index — an index on (customer_id, status) helps queries filtering by customer_id alone or by both columns, but does not help a query that filters only by status.',
      'Not indexing foreign key columns, which makes JOINs between related tables slow as both tables grow.',
    ],
    keyPoints: [
      'An index is a separate sorted structure (typically a B-tree) that lets the database find rows without scanning the whole table.',
      'Indexes speed up reads but slow down writes and use extra storage — every index must be maintained on INSERT, UPDATE, and DELETE.',
      'Add indexes to columns used in WHERE, JOIN, and ORDER BY on large, read-heavy tables; avoid over-indexing small or write-heavy tables.',
      'Composite index column order matters — it supports queries that filter on a matching left-to-right prefix of the indexed columns.',
    ],
  },

  transactions: {
    title: 'Database Transactions',
    intro: `A transaction is a group of one or more SQL statements that are executed as a single, indivisible unit of work. Either every statement in the transaction succeeds and its changes are saved permanently, or — if anything goes wrong — none of the statements take effect and the database is left exactly as it was before the transaction started.

This matters whenever an operation involves multiple related changes that must happen together. If only some of the changes were applied and the rest failed silently, the database would be left in an inconsistent state that doesn't correspond to any valid real-world outcome.`,
    sections: [
      {
        heading: 'BEGIN, COMMIT, and ROLLBACK',
        body: `A transaction is controlled with three commands. <code>BEGIN</code> (or <code>START TRANSACTION</code>) marks the start of a transaction block. <code>COMMIT</code> saves all changes made since BEGIN permanently to the database. <code>ROLLBACK</code> discards all changes made since BEGIN, as if none of the statements ever ran. Many databases also run every individual statement in its own implicit transaction by default (called "autocommit"), and BEGIN/COMMIT/ROLLBACK are how you opt out of that to group several statements together.`,
        list: [
          '<code>BEGIN</code> / <code>START TRANSACTION</code> — opens a transaction block.',
          '<code>COMMIT</code> — makes all changes in the transaction permanent and visible to other connections.',
          '<code>ROLLBACK</code> — undoes all changes made since BEGIN, restoring the prior state.',
        ],
      },
      {
        heading: 'Why Multi-Statement Operations Need Atomicity',
        body: `Consider transferring $100 from Account A to Account B. This requires two separate statements: subtract $100 from A, and add $100 to B. If the subtraction succeeds but the server crashes, the network drops, or a constraint fails before the addition runs, $100 has simply vanished from the system — it left A but never reached B. Wrapping both statements in a transaction guarantees that either both changes happen together or neither does, so the money is never lost or duplicated.`,
      },
      {
        heading: 'A Concrete Bank Transfer Example',
        body: `The pattern below is the classic illustration of why transactions exist: two UPDATE statements that must rise or fall together, with an explicit ROLLBACK if a business rule (insufficient funds) is violated partway through.`,
      },
    ],
    examples: [
      {
        caption: 'A safe bank transfer using an explicit transaction',
        code: `BEGIN;

UPDATE accounts
SET balance = balance - 100
WHERE account_id = 'A' AND balance >= 100;

UPDATE accounts
SET balance = balance + 100
WHERE account_id = 'B';

COMMIT;`,
        output: `UPDATE 1
UPDATE 1
COMMIT
(Account A is now $100 lower, Account B is $100 higher — both changes are visible together, or neither is.)`,
      },
      {
        caption: 'Rolling back when a business rule fails mid-transaction',
        code: `BEGIN;

UPDATE accounts SET balance = balance - 500 WHERE account_id = 'A';
-- Application checks the new balance and finds it went negative,
-- which violates the "no overdraft" business rule.

ROLLBACK;

-- Account A's balance is exactly what it was before BEGIN.
SELECT balance FROM accounts WHERE account_id = 'A';`,
        output: `ROLLBACK
balance: 250.00   -- unchanged, as if the UPDATE never ran`,
      },
    ],
    commonMistakes: [
      'Forgetting to COMMIT, leaving a transaction open and holding locks that block other connections until it times out or the session closes.',
      'Assuming a ROLLBACK undoes changes already committed by an earlier, separate transaction — ROLLBACK only affects statements since the current BEGIN.',
      'Doing the balance check in application code after the UPDATE without re-verifying inside the same transaction, allowing a race condition if two transfers run concurrently.',
      'Wrapping a single, independent statement in BEGIN/COMMIT for no reason — most databases already treat a lone statement as its own atomic transaction.',
    ],
    keyPoints: [
      'A transaction groups multiple statements so they either all succeed (COMMIT) or all fail together (ROLLBACK).',
      'BEGIN starts a transaction block; COMMIT makes its changes permanent; ROLLBACK discards them entirely.',
      'Multi-step operations like a bank transfer need transactions specifically to avoid a partial, inconsistent outcome (money leaving one account without arriving in another).',
    ],
  },

  acid: {
    title: 'ACID Properties in Databases',
    intro: `ACID is an acronym describing four guarantees that a reliable transactional database provides: Atomicity, Consistency, Isolation, and Durability. These properties are what let application developers reason about the database as a trustworthy source of truth even when hardware fails, multiple users act at the same time, or programs crash mid-operation.

Not every database system provides full ACID guarantees — some NoSQL systems trade some of these properties for higher performance or availability — but traditional relational databases like PostgreSQL, MySQL, and SQL Server are built around ACID as a core design principle.`,
    sections: [
      {
        heading: 'Atomicity — All or Nothing',
        body: `Atomicity guarantees that a transaction's statements are treated as a single unit: either all of them take effect, or none do. Scenario: a transaction inserts an order row and decrements product stock in two separate statements. If the server crashes after the insert but before the stock update, atomicity ensures the entire transaction is rolled back on recovery — you never end up with an order that was placed but never deducted from stock.`,
      },
      {
        heading: 'Consistency — Valid States Only',
        body: `Consistency guarantees that a transaction can only move the database from one valid state to another valid state, respecting all defined rules: constraints, foreign keys, unique indexes, and triggers. Scenario: a CHECK constraint requires that an account's balance never go below zero. If a transaction's UPDATE would violate that constraint, the database rejects the transaction rather than allowing the balance to become invalid, even temporarily.`,
      },
      {
        heading: 'Isolation — Concurrent Transactions Don\'t Interfere',
        body: `Isolation guarantees that concurrently running transactions do not see each other's uncommitted, in-progress changes, so each transaction behaves as if it were running alone. Scenario: two customers try to buy the last item in stock at the same instant. Proper isolation ensures the database serializes the effect of their transactions correctly rather than both reading "1 in stock" and both succeeding, which would oversell the item.`,
      },
      {
        heading: 'Durability — Committed Means Permanent',
        body: `Durability guarantees that once a transaction is committed, its changes survive any subsequent crash, power loss, or restart — the database has written the change to non-volatile storage (typically via a write-ahead log) before confirming success. Scenario: a payment transaction commits and the customer sees "Payment successful." A power outage hits the server one second later. Durability guarantees that payment record is still there when the server comes back up.`,
      },
    ],
    examples: [
      {
        caption: 'A transaction that demonstrates Atomicity and Consistency together',
        code: `BEGIN;

INSERT INTO orders (customer_id, product_id, quantity)
VALUES (501, 77, 1);

UPDATE products
SET stock = stock - 1
WHERE id = 77 AND stock > 0;  -- CHECK-style condition enforcing consistency

-- If the UPDATE affects 0 rows (stock was already 0), the application
-- issues a ROLLBACK instead of COMMIT, undoing the INSERT too.
COMMIT;`,
        output: `INSERT 0 1
UPDATE 1
COMMIT
(Order recorded and stock decremented together; if stock had been 0, both changes would be rolled back.)`,
      },
    ],
    commonMistakes: [
      'Assuming ACID means "no bugs are possible" — ACID guarantees the database\'s own integrity rules and transaction behavior, not correctness of your application logic.',
      'Confusing Consistency (valid data per constraints/rules) with Isolation (concurrent transactions not interfering) — they solve different problems.',
      'Believing all databases are fully ACID by default — many NoSQL and distributed systems deliberately relax one or more of these properties for scalability.',
      'Forgetting that Durability depends on the storage layer actually flushing to disk — some misconfigured setups (e.g. disabled write-ahead logging) can weaken this guarantee.',
    ],
    keyPoints: [
      'Atomicity: a transaction is all-or-nothing, never partially applied.',
      'Consistency: a transaction can only move the database between states that satisfy its constraints and rules.',
      'Isolation: concurrent transactions do not see each other\'s uncommitted changes.',
      'Durability: once committed, changes survive crashes and power loss.',
    ],
  },

  isolation: {
    title: 'Transaction Isolation Levels',
    intro: `Isolation is one of the four ACID properties, but it is not all-or-nothing — SQL defines four standard isolation levels that trade off consistency guarantees against performance. Stricter isolation prevents more anomalies but generally requires more locking or overhead, which can reduce concurrency (how many transactions can run at once without blocking each other).

Understanding isolation levels means understanding three specific anomalies they are designed to prevent: dirty reads, non-repeatable reads, and phantom reads.`,
    sections: [
      {
        heading: 'The Three Anomalies',
        body: `Each anomaly describes a specific way that concurrent transactions can produce surprising, incorrect-looking results if isolation is too weak.`,
        list: [
          '<strong>Dirty read</strong> — a transaction reads data that another transaction has written but not yet committed. If that other transaction rolls back, the first transaction acted on data that never actually existed.',
          '<strong>Non-repeatable read</strong> — a transaction reads the same row twice and gets different values, because another transaction committed an UPDATE to that row in between the two reads.',
          '<strong>Phantom read</strong> — a transaction re-runs the same query twice and gets a different set of rows (extra or missing rows), because another transaction committed an INSERT or DELETE matching the query\'s condition in between.',
        ],
      },
      {
        heading: 'The Four Standard Isolation Levels',
        body: `From weakest to strongest, each level prevents more anomalies than the one before it, at the cost of more restrictive concurrency control.`,
        list: [
          '<strong>Read Uncommitted</strong> — the weakest level; allows dirty reads, non-repeatable reads, and phantom reads. Rarely used in practice; mainly useful for approximate reporting where perfect accuracy isn\'t required.',
          '<strong>Read Committed</strong> — prevents dirty reads (you only ever see committed data), but non-repeatable reads and phantom reads can still occur. This is the default isolation level in PostgreSQL and Oracle.',
          '<strong>Repeatable Read</strong> — prevents dirty reads and non-repeatable reads (a row you\'ve already read will return the same values if read again), but phantom reads can still occur in the SQL standard\'s strict definition. This is the default isolation level in MySQL\'s InnoDB engine.',
          '<strong>Serializable</strong> — the strongest level; prevents dirty reads, non-repeatable reads, and phantom reads by making concurrent transactions behave as though they ran one after another in some serial order. It offers the strongest guarantees but has the highest risk of transactions being blocked or forced to retry.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Setting an isolation level explicitly for a transaction',
        code: `BEGIN;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SELECT COUNT(*) FROM seats WHERE flight_id = 42 AND is_booked = false;
-- Application decides there is a free seat and proceeds to book it

UPDATE seats SET is_booked = true
WHERE flight_id = 42 AND is_booked = false
LIMIT 1;

COMMIT;`,
        output: `count: 1
UPDATE 1
COMMIT
(Under SERIALIZABLE, a concurrent transaction attempting the same booking is forced to wait or retry, preventing two passengers from being assigned the same last seat.)`,
      },
      {
        caption: 'A non-repeatable read under Read Committed',
        code: `-- Transaction 1
BEGIN;
SELECT price FROM products WHERE id = 10;  -- returns 49.99

-- (Transaction 2, running concurrently, commits: UPDATE products SET price = 39.99 WHERE id = 10;)

SELECT price FROM products WHERE id = 10;  -- returns 39.99, a different value in the same transaction
COMMIT;`,
        output: `price: 49.99   -- first read
price: 39.99   -- second read, changed because another transaction committed in between`,
      },
    ],
    commonMistakes: [
      'Assuming "Serializable" is always the right choice — it maximizes correctness but can significantly reduce throughput under heavy concurrent load due to increased blocking and retries.',
      'Confusing Repeatable Read with "the query results never change" — it guarantees a previously read row stays the same, but the exact phantom-read guarantee varies by database implementation (MySQL\'s InnoDB Repeatable Read actually prevents phantom reads too, going beyond the SQL standard\'s minimum).',
      'Not realizing the default isolation level differs between database engines (Read Committed in PostgreSQL/Oracle vs. Repeatable Read in MySQL/InnoDB), which can cause the same application code to behave differently after a database migration.',
      'Using Read Uncommitted for anything beyond rough approximate reporting, since dirty reads can lead to acting on data that is later rolled back and never actually existed.',
    ],
    keyPoints: [
      'Three anomalies define isolation strength: dirty reads, non-repeatable reads, and phantom reads.',
      'Four standard levels, weakest to strongest: Read Uncommitted, Read Committed, Repeatable Read, Serializable.',
      'Stronger isolation prevents more anomalies but generally costs more concurrency and performance.',
      'Default isolation level varies by database — always check rather than assume.',
    ],
  },

  'locking-concepts': {
    title: 'Database Locking Concepts',
    intro: `Locking is the mechanism a database uses to control concurrent access to the same data, preventing two transactions from making conflicting changes at the same time. When a transaction needs to read or write a row, it may need to acquire a lock on that row first, and other transactions that need a conflicting lock on the same row must wait until it is released.

Locking is closely related to isolation levels — stricter isolation is typically implemented, in part, by holding locks for longer or acquiring them more broadly.`,
    sections: [
      {
        heading: 'Shared Locks vs. Exclusive Locks',
        body: `A <strong>shared lock</strong> (also called a read lock) allows a transaction to read a row, and multiple transactions can hold shared locks on the same row at the same time — reading doesn't conflict with other reading. An <strong>exclusive lock</strong> (also called a write lock) is required to modify a row (UPDATE, DELETE), and only one transaction can hold an exclusive lock on a given row at a time; it also blocks any other transaction from acquiring a shared lock on that row until it is released. This is why a long-running write can block readers, depending on the isolation level and locking strategy in use.`,
        list: [
          '<strong>Shared (S) lock</strong> — many transactions can hold it simultaneously; used for reads.',
          '<strong>Exclusive (X) lock</strong> — only one transaction can hold it; used for writes; blocks both shared and exclusive locks from others.',
        ],
      },
      {
        heading: 'Deadlocks',
        body: `A deadlock occurs when two (or more) transactions each hold a lock the other one needs, and neither can proceed. For example, Transaction A locks Row 1 and then tries to lock Row 2, while Transaction B has already locked Row 2 and is trying to lock Row 1 — each is waiting on the other forever. Databases detect this situation automatically and resolve it by choosing one transaction as the "deadlock victim," forcibly rolling it back with an error so the other can proceed. Applications should catch this error and retry the failed transaction.`,
      },
      {
        heading: 'Lock Timeouts',
        body: `Rather than waiting forever for a lock to become available, most databases support a lock timeout: if a transaction cannot acquire a needed lock within a configured period, it fails with a timeout error instead of blocking indefinitely. This protects the system from a single stuck or slow transaction freezing every other transaction that needs the same data. Applications typically handle a lock timeout the same way as a deadlock: catch it and retry, often with a short backoff delay.`,
      },
    ],
    examples: [
      {
        caption: 'A classic deadlock between two transactions',
        code: `-- Transaction A
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE account_id = 1;
-- ... then tries:
UPDATE accounts SET balance = balance + 50 WHERE account_id = 2;

-- Transaction B (running concurrently)
BEGIN;
UPDATE accounts SET balance = balance - 20 WHERE account_id = 2;
-- ... then tries:
UPDATE accounts SET balance = balance + 20 WHERE account_id = 1;`,
        output: `ERROR: deadlock detected
DETAIL: Process A waits for ShareLock on account_id 2; blocked by Process B.
Process B waits for ShareLock on account_id 1; blocked by Process A.
HINT: One transaction was automatically rolled back; the application should retry it.`,
      },
      {
        caption: 'Setting a lock timeout to fail fast instead of blocking indefinitely',
        code: `BEGIN;
SET LOCAL lock_timeout = '3s';

UPDATE inventory SET quantity = quantity - 1
WHERE product_id = 900;

COMMIT;`,
        output: `ERROR: canceling statement due to lock timeout
(If the row was locked by another transaction for more than 3 seconds, this UPDATE fails immediately instead of waiting indefinitely, and the application can retry.)`,
      },
    ],
    commonMistakes: [
      'Always locking rows in a different order across different parts of the application, which is the most common cause of avoidable deadlocks.',
      'Treating a deadlock error as a fatal bug instead of building retry logic around it — deadlocks are an expected, normal occurrence under concurrent load and are meant to be retried.',
      'Holding a transaction open (and its locks) for far longer than necessary, such as waiting on user input or an external API call mid-transaction, which blocks other transactions needlessly.',
      'Confusing row-level locks with table-level locks — some operations (like certain schema changes) escalate to locking an entire table, which is far more disruptive than a single row lock.',
    ],
    keyPoints: [
      'Shared locks allow concurrent reads; exclusive locks are needed for writes and block all other access to that row.',
      'A deadlock happens when transactions wait on each other in a cycle; the database detects it and rolls back one transaction automatically.',
      'Lock timeouts prevent a transaction from blocking forever waiting on a lock, failing fast instead so the application can retry.',
      'Keeping transactions short and locking rows in a consistent order across the application reduces both deadlocks and lock contention.',
    ],
  },

  'query-optimization': {
    title: 'SQL Query Optimization',
    intro: `Query optimization is the process of understanding how the database engine actually executes a query and adjusting the query, schema, or indexes so it runs faster. Two identical-looking queries can have wildly different performance depending on whether the engine can use an index, how many rows it has to examine, and how it joins tables together.

The starting point for almost all optimization work is asking the database to show you its execution plan — the actual step-by-step strategy it intends to use (or used) to answer a query.`,
    sections: [
      {
        heading: 'EXPLAIN and EXPLAIN ANALYZE',
        body: `<code>EXPLAIN</code> asks the database to show the execution plan it would use for a query — which indexes (if any) it plans to use, in what order it joins tables, and its estimated cost — without actually running the query. <code>EXPLAIN ANALYZE</code> goes further: it actually executes the query and reports the real number of rows processed and real time spent at each step, alongside the planned estimates. Comparing the estimated rows to the actual rows in EXPLAIN ANALYZE output is one of the fastest ways to spot a bad assumption the optimizer made, such as outdated table statistics.`,
      },
      {
        heading: 'Why an Index Isn\'t Used',
        body: `Having an index does not guarantee the database will use it. Common reasons an index gets skipped: the table is small enough that a full scan is actually cheaper than the overhead of using the index; the query applies a function or type conversion to the indexed column (e.g. <code>WHERE LOWER(email) = ...</code> against a plain index on email); a leading wildcard is used in a LIKE pattern (<code>LIKE '%gmail.com'</code> cannot use a standard B-tree index efficiently, while <code>LIKE 'asha%'</code> can); the query's WHERE clause doesn't match the leftmost columns of a composite index; or the table's statistics are stale, causing the optimizer to misjudge how selective the index actually is.`,
      },
      {
        heading: 'The N+1 Query Problem',
        body: `The N+1 problem is a very common performance bug, especially in applications using an ORM (object-relational mapper). It happens when code runs one query to fetch a list of N parent records, and then, for each of those N records, runs a separate query to fetch related data — resulting in 1 + N total queries instead of 2. For example, fetching 100 blog posts and then looping through them to fetch each post's author with a separate query results in 101 round trips to the database instead of a single JOIN or a single batched query.`,
      },
    ],
    examples: [
      {
        caption: 'Reading an EXPLAIN ANALYZE plan to confirm index usage',
        code: `EXPLAIN ANALYZE
SELECT id, name FROM customers WHERE email = 'asha@example.com';`,
        output: `Index Scan using idx_customers_email on customers
  (cost=0.42..8.44 rows=1 width=36)
  (actual time=0.031..0.033 rows=1 loops=1)
  Index Cond: (email = 'asha@example.com'::text)
Planning Time: 0.112 ms
Execution Time: 0.052 ms

-- Confirms the index is used (Index Scan, not Seq Scan) and estimated rows (1)
-- closely match actual rows (1) — a healthy, well-optimized plan.`,
      },
      {
        caption: 'Fixing an N+1 problem by replacing per-row queries with a single JOIN',
        code: `-- N+1 pattern: 1 query for posts, then N queries for authors (bad)
-- SELECT id, title, author_id FROM posts;
-- (then, for each post) SELECT name FROM authors WHERE id = ?;

-- Fixed: a single query using JOIN
SELECT p.id, p.title, a.name AS author_name
FROM posts p
JOIN authors a ON a.id = p.author_id;`,
        output: `id: 1 | title: 'Intro to Indexes'    | author_name: 'Asha Verma'
id: 2 | title: 'Understanding Joins'  | author_name: 'Rahul Mehta'
(2 rows returned in a single round trip instead of 1 + N separate queries)`,
      },
    ],
    commonMistakes: [
      'Optimizing a query without ever looking at its EXPLAIN plan — guessing at the bottleneck instead of measuring it directly.',
      'Adding an index and assuming it will automatically be used, without verifying with EXPLAIN that the optimizer actually chose it.',
      'Writing ORM code that loops over a result set and issues a new query per item, silently causing the N+1 problem, especially with lazy-loaded relationships.',
      "Wrapping an indexed column in a function in the WHERE clause (e.g. UPPER(name) = 'ASHA') without a matching functional/expression index, which forces a full scan.",
    ],
    keyPoints: [
      'EXPLAIN shows the planned execution strategy; EXPLAIN ANALYZE actually runs the query and reports real timing and row counts.',
      'An index can be skipped by the optimizer for many reasons: small table size, functions applied to the column, leading wildcards, mismatched composite index order, or stale statistics.',
      'The N+1 problem replaces one efficient query with 1 + N separate queries, usually fixed with a JOIN or a single batched query.',
      'Query optimization should always start from measured evidence (EXPLAIN ANALYZE), not assumptions about what "should" be fast.',
    ],
  },

  'stored-procedures-concepts': {
    title: 'Stored Procedures and Functions Concepts',
    intro: `A stored procedure (or function) is a named block of SQL and procedural logic that is saved inside the database itself and can be executed by calling its name, rather than sending the full SQL text from the application every time. Most major databases support them, though the exact syntax varies — PostgreSQL uses PL/pgSQL, SQL Server uses T-SQL, and Oracle uses PL/SQL.

Stored procedures and functions bring logic closer to the data, which can reduce network round trips and let the database enforce rules consistently no matter which application or tool is writing to it.`,
    sections: [
      {
        heading: 'CREATE PROCEDURE and CREATE FUNCTION',
        body: `<code>CREATE PROCEDURE</code> defines a named routine that performs an action — it can run multiple statements, including transactions, and is invoked with <code>CALL procedure_name(...)</code>. <code>CREATE FUNCTION</code> defines a named routine that computes and returns a value, and can typically be used directly inside a SQL expression, such as in a SELECT list or WHERE clause. The key practical difference: a function must return a value and is used as part of a larger query, while a procedure is invoked on its own and does not have to return anything.`,
      },
      {
        heading: 'When Server-Side Logic Makes Sense',
        body: `Stored procedures are a good fit when: the same multi-step logic needs to run identically from several different applications or tools, and you want to guarantee consistency rather than reimplementing it in each one; the operation involves many round trips between the application and database that could instead happen in one call, reducing network latency; or you need to enforce a business rule at the database level so it applies no matter what connects to the database. They are usually a poor fit when the logic changes frequently (stored procedures are harder to version-control and deploy than application code), when the team's tooling and expertise are centered on the application layer, or when portability across different database vendors matters, since procedural SQL dialects are not standardized.`,
        list: [
          'Good fit: shared logic across multiple applications, reducing round trips, enforcing rules centrally.',
          'Poor fit: rapidly changing logic, teams without strong database tooling, needing to stay portable across database vendors.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A stored procedure that performs a transfer as a single callable unit',
        code: `CREATE PROCEDURE transfer_funds(
    sender_id INT,
    receiver_id INT,
    amount DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE accounts SET balance = balance - amount WHERE account_id = sender_id;
    UPDATE accounts SET balance = balance + amount WHERE account_id = receiver_id;
END;
$$;

CALL transfer_funds(1, 2, 100.00);`,
        output: `CREATE PROCEDURE
CALL
(Both balance updates run as one server-side unit; any application that calls
transfer_funds gets the same guaranteed behavior without duplicating the logic.)`,
      },
      {
        caption: 'A function that computes and returns a value for use inside a query',
        code: `CREATE FUNCTION order_total(order_id INT)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
    total DECIMAL;
BEGIN
    SELECT SUM(price * quantity) INTO total
    FROM order_items
    WHERE order_items.order_id = order_id;
    RETURN total;
END;
$$;

SELECT id, order_total(id) AS total FROM orders WHERE id = 501;`,
        output: `id: 501 | total: 149.99`,
      },
    ],
    commonMistakes: [
      'Putting all business logic into stored procedures by default, making it hard to unit test, version, and review compared to logic kept in application code.',
      'Confusing a function (must return a value, usable inside SELECT/WHERE) with a procedure (invoked with CALL, not usable inline in an expression).',
      'Writing stored procedures full of vendor-specific syntax and then expecting easy migration to a different database engine later.',
      'Forgetting that stored procedure changes need their own review and deployment process, just like application code — they are not exempt from change management.',
    ],
    keyPoints: [
      'A stored procedure is a named, saved routine invoked with CALL; a stored function returns a value and can be used inside SQL expressions.',
      'Server-side logic reduces network round trips and centralizes rules so every application gets consistent behavior.',
      'Procedural SQL dialects (PL/pgSQL, T-SQL, PL/SQL) are vendor-specific and not portable across database engines.',
      'Reserve stored procedures for stable, shared, or performance-critical logic rather than rapidly changing business rules.',
    ],
  },

  security: {
    title: 'Database Security Fundamentals',
    intro: `Database security covers the practices that protect stored data from unauthorized access, tampering, and leakage. Because databases typically hold an organization's most sensitive information — customer records, payment details, credentials — security failures here tend to be far more damaging than in almost any other part of an application.

Three practical areas cover most of what a working developer needs to understand: preventing SQL injection, applying the principle of least privilege to database accounts, and encrypting sensitive data at the column level.`,
    sections: [
      {
        heading: 'SQL Injection',
        body: `SQL injection happens when untrusted input (typically from a user) is concatenated directly into a SQL query string, allowing an attacker to change the meaning of the query by injecting their own SQL. The fix is to always use parameterized queries (also called prepared statements), where the query structure and the data values are sent to the database separately — the database never interprets a parameter's contents as SQL syntax, no matter what it contains.`,
      },
      {
        heading: 'A Vulnerable Query vs. a Parameterized Query',
        body: `The difference is not stylistic — it is the entire security boundary between "user input" and "executable SQL."`,
      },
      {
        heading: 'Least-Privilege Database Users',
        body: `The principle of least privilege means every database account should have only the permissions it actually needs to do its job, and nothing more. An application's everyday database user should typically be able to SELECT, INSERT, UPDATE, and DELETE only in the specific tables it uses — it should not have permission to DROP tables, alter schema, or access unrelated tables. This limits the damage if that account's credentials are ever compromised (for example, through a SQL injection vulnerability or a leaked connection string): the attacker is confined to whatever that narrow account can do, rather than gaining full control of the database.`,
      },
      {
        heading: 'Encrypting Sensitive Columns',
        body: `Not all data needs the same protection, but fields like national ID numbers, payment card details, or health records often warrant encryption at the column level, in addition to standard access controls. Column-level (or "field-level") encryption means the value is stored in encrypted form in the database, and only application code holding the correct decryption key can turn it back into readable data — so even someone who gains direct read access to the database (through a backup leak, an over-permissioned account, or a misconfigured export) sees ciphertext instead of the raw sensitive value. This is a defense-in-depth measure: it doesn't replace access control, encryption in transit, or least privilege, but adds a further layer specifically for the most sensitive fields.`,
      },
    ],
    examples: [
      {
        caption: 'A SQL injection vulnerability versus a parameterized fix',
        code: `-- VULNERABLE: user input concatenated directly into the query string
-- If username is: admin' --
-- the query becomes: SELECT * FROM users WHERE username = 'admin' --' AND password = '...'
-- The "--" comments out the password check entirely, logging the attacker in as admin.
String query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";

-- SAFE: parameterized query — the database treats username/password strictly as data
SELECT * FROM users WHERE username = ? AND password = ?;
-- Executed with parameters bound separately, e.g. via a prepared statement:
-- stmt.setString(1, username); stmt.setString(2, password);`,
        output: `Vulnerable version: attacker logs in as admin without knowing the password.
Parameterized version: the literal string "admin' --" is compared as a whole
username value, matches no row, and login correctly fails.`,
      },
      {
        caption: 'Creating a least-privilege application database user',
        code: `-- Instead of using a superuser/admin account in the application, create a scoped one:
CREATE USER app_user WITH PASSWORD 'a-strong-generated-secret';

GRANT SELECT, INSERT, UPDATE, DELETE ON orders, order_items, customers TO app_user;
-- Deliberately no GRANT on other tables, and no DROP/ALTER/CREATE privileges at all.

REVOKE ALL ON payments_ledger FROM app_user;`,
        output: `CREATE ROLE
GRANT
REVOKE
(app_user can now read/write only the tables the application needs, and cannot
touch schema or the restricted payments_ledger table even if compromised.)`,
      },
    ],
    commonMistakes: [
      'Building SQL queries with string concatenation or string formatting instead of parameterized queries/prepared statements, leaving the application open to SQL injection.',
      'Running the application\'s everyday database connection as a superuser or owner account "for convenience," turning any injection or credential leak into full database compromise.',
      'Assuming encrypting the whole disk (encryption at rest) is sufficient for highly sensitive fields, when column-level encryption is what protects against misuse by anyone with ordinary query access.',
      'Trusting client-side validation alone to prevent malicious input, when all real protection against injection must happen at the query-construction layer on the server.',
    ],
    keyPoints: [
      'Always use parameterized queries/prepared statements instead of string-concatenating user input into SQL — this is the primary defense against SQL injection.',
      'Apply least privilege: application database accounts should hold only the permissions they need on only the tables they use.',
      'Encrypt especially sensitive columns (payment data, national IDs) at the field level as a defense-in-depth layer beyond access control.',
      'Database security requires multiple layers together — parameterization, least privilege, and encryption each cover different failure modes.',
    ],
  },
}
