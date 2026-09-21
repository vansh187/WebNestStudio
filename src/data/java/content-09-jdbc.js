// JDBC module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content09Jdbc = {
  'jdbc-introduction-and-architecture': {
    title: 'JDBC Introduction and Architecture',
    intro: `JDBC (Java Database Connectivity) is the standard Java API that lets a Java application talk to a relational database — sending SQL statements and reading back results — without the application needing to know the low-level network protocol a particular database uses. It lives in the <code>java.sql</code> and <code>javax.sql</code> packages and has been part of the platform since Java 1.1.

The core idea behind JDBC is abstraction through interfaces. Your application code is written against interfaces like <code>Connection</code>, <code>Statement</code>, and <code>ResultSet</code>. The actual implementation of those interfaces is supplied by a database-specific driver (for example, the PostgreSQL or MySQL driver JAR). Because your code only depends on the JDBC interfaces, switching from one database vendor to another mostly means swapping the driver and the connection URL, not rewriting your data-access code.`,
    sections: [
      {
        heading: 'The JDBC API Layers',
        body: `JDBC is best understood as a small stack of cooperating pieces, each with one job.`,
        list: [
          '<strong>DriverManager</strong> — locates and loads an appropriate <code>Driver</code> implementation for a given JDBC URL and hands back a live <code>Connection</code>.',
          '<strong>Connection</strong> — represents an open session with a specific database; it creates <code>Statement</code> objects and controls transaction boundaries (commit/rollback).',
          '<strong>Statement / PreparedStatement / CallableStatement</strong> — represent SQL to be executed against the database over that connection.',
          '<strong>ResultSet</strong> — represents the tabular result of a query, exposed as a cursor you step through row by row.',
        ],
      },
      {
        heading: 'Two-Tier vs. Driver-Mediated Architecture',
        body: `In the common two-tier JDBC model, the Java application talks directly to the database through a driver — there is no separate middle-tier server involved in the JDBC call itself. The driver translates JDBC API calls into the database's native wire protocol, sends them over the network (or a local socket), and translates the database's response back into Java objects like <code>ResultSet</code> rows. This is why JDBC feels vendor-neutral in code but is always backed by a vendor-specific driver underneath.`,
      },
      {
        heading: 'Why JDBC Matters',
        body: `Almost every Java persistence technology — JPA/Hibernate, MyBatis, Spring's JdbcTemplate — is ultimately built on top of JDBC. Even when you use a higher-level framework, understanding the JDBC layer underneath explains connection pooling behavior, transaction semantics, and how SQL exceptions surface in your application.`,
      },
    ],
    examples: [
      {
        caption: 'The typical JDBC workflow: connect, execute, read, close',
        code: `import java.sql.*;

public class JdbcOverviewDemo {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:mysql://localhost:3306/store";
        try (Connection conn = DriverManager.getConnection(url, "app_user", "secret");
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT id, name FROM products")) {

            while (rs.next()) {
                System.out.println(rs.getInt("id") + " - " + rs.getString("name"));
            }
        }
    }
}`,
        output: `// Illustrative output (assumes a "products" table with sample rows):
1 - Wireless Mouse
2 - Mechanical Keyboard
3 - USB-C Hub`,
      },
    ],
    commonMistakes: [
      'Thinking JDBC itself is a database — JDBC is only the API/bridge; the actual database engine and driver do the real work.',
      'Forgetting to close Connection, Statement, and ResultSet objects, which leaks database resources over time (try-with-resources solves this).',
      'Assuming JDBC code is 100% portable across databases — the API is the same, but SQL dialect differences still require care.',
    ],
    keyPoints: [
      'JDBC is a standard API (java.sql, javax.sql) for connecting Java applications to relational databases.',
      'Core pieces: DriverManager, Connection, Statement family, and ResultSet.',
      'Vendor-specific drivers implement the JDBC interfaces and translate calls into the database wire protocol.',
      'Most higher-level Java persistence tools (JPA, Hibernate, Spring JDBC) sit on top of JDBC.',
    ],
  },

  'jdbc-drivers': {
    title: 'JDBC Drivers',
    intro: `A JDBC driver is the piece of software that implements the JDBC interfaces for a specific database, translating standard JDBC calls into that database's native communication protocol. The JDBC specification defines four historical categories of drivers, though in modern Java development you will almost always use just one of them.`,
    sections: [
      {
        heading: 'The Four Driver Types',
        body: `These types describe how a driver bridges Java code to the actual database engine.`,
        list: [
          '<strong>Type 1 — JDBC-ODBC Bridge</strong>: translates JDBC calls into ODBC calls, relying on an ODBC driver installed on the machine. It was bundled with early JDK versions but was removed from the JDK entirely (Java 8) because it required native ODBC binaries and had poor performance and portability.',
          '<strong>Type 2 — Native-API Driver</strong>: converts JDBC calls into calls on the database\'s native client-side library (a platform-specific binary, e.g. Oracle\'s OCI driver). Faster than Type 1 but still requires native libraries installed on every client machine, hurting portability.',
          '<strong>Type 3 — Network Protocol Driver</strong>: sends JDBC calls to a middleware server over a vendor-independent network protocol; that middle-tier server then translates the request into the database-specific protocol. This decouples the client from any native database library, but requires deploying and maintaining the middleware layer.',
          '<strong>Type 4 — Thin (Pure Java) Driver</strong>: implements the database\'s wire protocol directly in Java and talks straight to the database over a socket, with no native code and no middleware. This is what essentially every modern JDBC driver (MySQL Connector/J, PostgreSQL JDBC, Microsoft\'s mssql-jdbc, Oracle\'s ojdbc) is today.',
        ],
      },
      {
        heading: 'Why Type 4 Won',
        body: `Type 4 drivers are pure Java, meaning they run unmodified on any platform with a JVM — no native binaries to install, no middle-tier server to operate, and no ODBC configuration. This matches Java's "write once, run anywhere" philosophy and gives the best performance of the four options because there is only one translation step (JDBC calls to database wire protocol) instead of two or three. Because of this, when you add a dependency like <code>mysql-connector-j</code> or <code>postgresql</code> to your project today, you are adding a Type 4 driver.`,
      },
      {
        heading: 'Loading a Driver',
        body: `Since JDBC 4.0 (Java 6+), drivers that ship a <code>META-INF/services/java.sql.Driver</code> file are auto-registered via the ServiceLoader mechanism the moment their JAR is on the classpath — you no longer need to call <code>Class.forName("com.mysql.cj.jdbc.Driver")</code> manually, though you may still see that line in older tutorials and legacy code.`,
      },
    ],
    examples: [
      {
        caption: 'Adding a Type 4 driver dependency and letting it auto-register',
        code: `<!-- Maven dependency for the PostgreSQL Type 4 (thin) driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.3</version>
</dependency>

// No Class.forName(...) needed on modern JDBC — DriverManager
// discovers the driver automatically via META-INF/services.
Connection conn = DriverManager.getConnection(
    "jdbc:postgresql://localhost:5432/inventory", "app_user", "secret");
System.out.println("Connected: " + !conn.isClosed());`,
        output: 'Connected: true',
      },
    ],
    commonMistakes: [
      'Manually calling Class.forName() for a modern JDBC 4.0+ driver — it is unnecessary and often just legacy copy-paste.',
      'Confusing Type 3 (network protocol, uses middleware) with Type 4 (thin, direct to database) — Type 4 has no middle-tier server.',
      'Trying to use the JDBC-ODBC bridge on a modern JDK — it was removed starting with Java 8 and no longer exists.',
      'Forgetting to add the driver JAR as a dependency and getting "No suitable driver found for jdbc:..." at runtime.',
    ],
    keyPoints: [
      'Four driver types exist historically: Type 1 (JDBC-ODBC bridge, removed from the JDK), Type 2 (native-API), Type 3 (network protocol/middleware), and Type 4 (thin, pure Java).',
      'Type 4 drivers are the modern standard: pure Java, no native libraries, direct socket connection to the database.',
      'Since JDBC 4.0, drivers on the classpath auto-register via ServiceLoader — manual Class.forName() is generally unnecessary.',
    ],
  },

  'connecting-to-a-database-with-drivermanager': {
    title: 'Connecting to a Database with DriverManager',
    intro: `<code>DriverManager</code> is the entry point for obtaining a JDBC <code>Connection</code>. You give it a JDBC URL (which identifies the database type, host, port, and database name) along with credentials, and it returns a live connection backed by whichever registered driver claims to understand that URL.`,
    sections: [
      {
        heading: 'The JDBC URL Format',
        body: `A JDBC URL always starts with <code>jdbc:</code>, followed by a subprotocol identifying the database vendor, followed by vendor-specific connection details. The general shape is <code>jdbc:&lt;subprotocol&gt;://&lt;host&gt;:&lt;port&gt;/&lt;database&gt;?&lt;properties&gt;</code>.`,
        list: [
          'MySQL: <code>jdbc:mysql://localhost:3306/store?useSSL=false&serverTimezone=UTC</code>',
          'PostgreSQL: <code>jdbc:postgresql://localhost:5432/inventory</code>',
          'Oracle: <code>jdbc:oracle:thin:@localhost:1521:orcl</code>',
          'SQL Server: <code>jdbc:sqlserver://localhost:1433;databaseName=Sales</code>',
        ],
      },
      {
        heading: 'Obtaining a Connection',
        body: `<code>DriverManager.getConnection(url, user, password)</code> asks each registered driver, in turn, whether it accepts the given URL; the first driver that says yes opens a physical network connection to the database and wraps it as a <code>Connection</code> object. This call is relatively expensive — it typically involves a TCP handshake, authentication, and session setup on the server — which is one reason applications avoid opening a fresh connection for every single query (see connection pooling).`,
      },
      {
        heading: 'Always Use try-with-resources',
        body: `<code>Connection</code>, along with <code>Statement</code> and <code>ResultSet</code>, implements <code>AutoCloseable</code>. Wrapping them in a try-with-resources statement guarantees they are closed — releasing the underlying socket and any server-side session resources — even if an exception is thrown while the query runs. Relying on manually calling <code>close()</code> in a <code>finally</code> block is more verbose and easier to get wrong (for example, forgetting to close a ResultSet before its Statement).`,
      },
    ],
    examples: [
      {
        caption: 'Opening and safely closing a connection with try-with-resources',
        code: `import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConnectDemo {
    private static final String URL =
        "jdbc:postgresql://localhost:5432/inventory";
    private static final String USER = "app_user";
    private static final String PASSWORD = "secret";

    public static void main(String[] args) {
        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD)) {
            System.out.println("Connected to: " + conn.getCatalog());
            System.out.println("Auto-commit enabled: " + conn.getAutoCommit());
        } catch (SQLException e) {
            System.out.println("Connection failed: " + e.getMessage());
        }
        // conn.close() is called automatically here, even on exception
    }
}`,
        output: `// Illustrative — depends on a real PostgreSQL server running locally:
Connected to: inventory
Auto-commit enabled: true`,
      },
    ],
    commonMistakes: [
      'Hardcoding the JDBC URL, username, and password directly in source code instead of externalizing them into configuration.',
      'Mistyping the JDBC URL subprotocol (e.g. "jdbc:mysqll://...") and getting a confusing "No suitable driver" error instead of a clear typo message.',
      'Not closing connections (or not using try-with-resources), which exhausts the database\'s max_connections limit under load.',
      'Assuming getConnection() is cheap enough to call once per query in a hot path — it is not, which is why pooling exists.',
    ],
    keyPoints: [
      'JDBC URLs follow the pattern jdbc:<subprotocol>://host:port/database, with vendor-specific details after that.',
      'DriverManager.getConnection(url, user, password) opens a real network connection and returns a Connection object.',
      'Connection, Statement, and ResultSet are AutoCloseable — always manage them with try-with-resources.',
      'Opening a raw connection is relatively expensive, which motivates connection pooling in real applications.',
    ],
  },

  'statement-preparedstatement-and-callablestatement': {
    title: 'Statement, PreparedStatement, and CallableStatement',
    intro: `JDBC gives you three interfaces for sending SQL to the database, and choosing the right one is one of the most important decisions in any JDBC-based application — both for correctness and for security. Each is created from a <code>Connection</code> and each has a distinct purpose.`,
    sections: [
      {
        heading: 'Statement — Raw, Unparameterized SQL',
        body: `<code>Statement</code> executes a SQL string exactly as given. It has no concept of parameters, so any dynamic value must be concatenated directly into the SQL text. This makes <code>Statement</code> appropriate only for static SQL with no user-supplied values (e.g. DDL like <code>CREATE TABLE</code>). Concatenating user input into a Statement's SQL opens the door to SQL injection.`,
      },
      {
        heading: 'PreparedStatement — Parameterized and Precompiled',
        body: `<code>PreparedStatement</code> takes SQL containing <code>?</code> placeholders, which you bind with typed setter methods like <code>setString(1, value)</code> or <code>setInt(2, value)</code>. The database (or driver) can precompile the statement's execution plan once and reuse it across many executions with different parameter values, which is both faster for repeated queries and, critically, treats bound values strictly as data — never as executable SQL syntax. This eliminates SQL injection for anything passed through a parameter.`,
        list: [
          '<code>ps.setString(1, username)</code> — binds a String parameter at position 1.',
          '<code>ps.setInt(2, userId)</code> — binds an int parameter at position 2.',
          '<code>ps.executeQuery()</code> — runs a SELECT and returns a ResultSet.',
          '<code>ps.executeUpdate()</code> — runs an INSERT/UPDATE/DELETE and returns the affected row count.',
        ],
      },
      {
        heading: 'CallableStatement — Calling Stored Procedures',
        body: `<code>CallableStatement</code> is used to invoke a stored procedure or function already defined in the database, using JDBC's escape syntax: <code>{call procedureName(?, ?)}</code>. It extends <code>PreparedStatement</code>, so it supports IN parameters the same way, but it also supports OUT and INOUT parameters via <code>registerOutParameter(...)</code>, letting the database return values (or even a result set) beyond a normal query result.`,
      },
    ],
    examples: [
      {
        caption: 'Why string concatenation is dangerous, and how PreparedStatement fixes it',
        code: `// DANGEROUS: building SQL with string concatenation (Statement)
String username = "admin' OR '1'='1";
String unsafeSql = "SELECT * FROM users WHERE username = '" + username + "'";
// Resulting SQL sent to the database:
// SELECT * FROM users WHERE username = 'admin' OR '1'='1'
// This condition is always true, so it returns EVERY row in the table --
// a classic SQL injection bypassing the intended username filter.

// SAFE: PreparedStatement treats the input strictly as data, not SQL
String safeSql = "SELECT * FROM users WHERE username = ?";
try (PreparedStatement ps = conn.prepareStatement(safeSql)) {
    ps.setString(1, username); // the whole string is bound as one literal value
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            System.out.println(rs.getString("username"));
        }
    }
}
// The malicious string is compared literally against the username column
// and matches no real row, so no rows are returned.`,
        output: `// Statement version (unsafe): returns every row in "users" -- injection succeeds.
// PreparedStatement version (safe): returns zero rows, because no username
// literally equals "admin' OR '1'='1".`,
      },
      {
        caption: 'Calling a stored procedure with CallableStatement',
        code: `// Assumes a stored procedure: CREATE PROCEDURE get_total_orders(IN p_user INT, OUT p_total INT)
try (CallableStatement cs = conn.prepareCall("{call get_total_orders(?, ?)}")) {
    cs.setInt(1, 1042);
    cs.registerOutParameter(2, java.sql.Types.INTEGER);
    cs.execute();
    int total = cs.getInt(2);
    System.out.println("Total orders for user 1042: " + total);
}`,
        output: `// Illustrative — depends on the actual stored procedure and data:
Total orders for user 1042: 17`,
      },
    ],
    commonMistakes: [
      'Building SQL by concatenating user input into a Statement, which is the single most common cause of SQL injection vulnerabilities.',
      'Forgetting that PreparedStatement parameter indices are 1-based, not 0-based.',
      'Reusing a PreparedStatement across unrelated queries by trying to change its SQL text — you must create a new PreparedStatement for different SQL.',
      'Forgetting registerOutParameter() before executing a CallableStatement with OUT parameters, causing a runtime error when reading the result.',
    ],
    keyPoints: [
      'Statement executes raw SQL with no parameters and no injection protection — use it only for static, trusted SQL.',
      'PreparedStatement uses ? placeholders and typed setters, is precompiled for reuse, and is the safe default for any query with dynamic values.',
      'CallableStatement extends PreparedStatement to invoke stored procedures, supporting IN, OUT, and INOUT parameters.',
      'Never build SQL with string concatenation from untrusted input — always parameterize it.',
    ],
  },

  'working-with-resultset': {
    title: 'Working with ResultSet',
    intro: `A <code>ResultSet</code> represents the tabular data returned by a SQL query. It is not loaded into memory as one big collection you can index freely — it behaves like a cursor pointing to one row at a time, which you advance and read column by column.`,
    sections: [
      {
        heading: 'The Cursor Model',
        body: `Immediately after <code>executeQuery()</code> returns, the cursor is positioned before the first row. Calling <code>next()</code> moves it forward one row and returns <code>true</code> if a row exists there, or <code>false</code> once you have passed the last row. This is why every ResultSet loop follows the same shape: a <code>while (rs.next()) { ... }</code> loop that reads the current row's columns and then advances.`,
      },
      {
        heading: 'Reading Columns',
        body: `Typed getter methods retrieve a column's value from the current row, and each getter can be called either with a 1-based column index or with the column's name (or alias) as a String.`,
        list: [
          '<code>rs.getInt("id")</code> or <code>rs.getInt(1)</code> — reads an integer column.',
          '<code>rs.getString("name")</code> — reads a text column as a Java String.',
          '<code>rs.getLong("created_at_epoch")</code> — reads a large integer / epoch-style value.',
          '<code>rs.getDouble("price")</code>, <code>rs.getBoolean("active")</code>, <code>rs.getDate("order_date")</code> — other common typed accessors.',
        ],
      },
      {
        heading: 'ResultSetMetaData',
        body: `Sometimes you need to inspect a query's shape without knowing its columns in advance — for example, writing a generic table-printing utility. <code>ResultSetMetaData</code>, obtained via <code>rs.getMetaData()</code>, exposes information like <code>getColumnCount()</code>, <code>getColumnName(i)</code>, and <code>getColumnTypeName(i)</code>, letting you iterate over a result set's structure generically instead of hardcoding column names.`,
      },
    ],
    examples: [
      {
        caption: 'Iterating a ResultSet by column name, with basic metadata inspection',
        code: `String sql = "SELECT id, name, price FROM products WHERE price > ?";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setDouble(1, 20.0);
    try (ResultSet rs = ps.executeQuery()) {
        ResultSetMetaData meta = rs.getMetaData();
        System.out.println("Columns: " + meta.getColumnCount());

        while (rs.next()) {
            int id = rs.getInt("id");
            String name = rs.getString("name");
            double price = rs.getDouble("price");
            System.out.printf("#%d %s - $%.2f%n", id, name, price);
        }
    }
}`,
        output: `// Illustrative output for a "products" table:
Columns: 3
#2 Mechanical Keyboard - $59.99
#4 27-inch Monitor - $189.00`,
      },
    ],
    commonMistakes: [
      'Calling a getter before the first rs.next(), when the cursor is still positioned before row one — this throws a SQLException.',
      'Trying to move the cursor backward or re-read a previous row on a default (forward-only) ResultSet, which only supports moving forward with next().',
      'Using a ResultSet after its Statement or Connection has been closed — a closed ResultSet cannot be read from.',
      'Mixing up column index and column name overloads inconsistently, making code harder to maintain when the query changes.',
    ],
    keyPoints: [
      'ResultSet is a forward-moving cursor by default; next() advances it and returns false once rows are exhausted.',
      'Typed getters (getInt, getString, getDouble, etc.) read the current row by column name or 1-based index.',
      'ResultSetMetaData lets you inspect column count, names, and types generically, without hardcoding them.',
      'A ResultSet becomes unusable once its Statement or Connection is closed.',
    ],
  },

  'transactions-in-jdbc': {
    title: 'Transactions in JDBC',
    intro: `A transaction is a group of one or more SQL statements that must succeed or fail together as a single unit — for example, debiting one bank account and crediting another. JDBC gives you direct control over transaction boundaries through the <code>Connection</code> interface, letting you decide exactly when changes become permanent.`,
    sections: [
      {
        heading: 'Auto-Commit Mode',
        body: `By default, a JDBC <code>Connection</code> is in auto-commit mode: every individual SQL statement is committed to the database immediately after it executes, as its own implicit transaction. This is convenient for single, independent statements, but it is dangerous for a sequence of related statements — if the second statement fails after the first has already been auto-committed, the database is left in an inconsistent, partially-updated state.`,
      },
      {
        heading: 'Manual Transaction Control',
        body: `Calling <code>conn.setAutoCommit(false)</code> switches the connection into manual mode: statements you execute afterward are held as part of one open transaction until you explicitly call <code>conn.commit()</code> (making all of them permanent together) or <code>conn.rollback()</code> (undoing all of them as if none had happened). This is essential whenever multiple statements must succeed or fail as a single atomic unit.`,
        list: [
          '<code>conn.setAutoCommit(false)</code> — start a manual transaction.',
          '<code>conn.commit()</code> — make all statements since the last commit/rollback permanent.',
          '<code>conn.rollback()</code> — discard all statements since the last commit/rollback.',
          '<code>conn.setAutoCommit(true)</code> — return to auto-commit mode once the manual transaction is done, if reusing the connection.',
        ],
      },
      {
        heading: 'The Standard try/catch/rollback Pattern',
        body: `The conventional shape is: disable auto-commit, run the statements inside a try block, call <code>commit()</code> at the end of the try block if everything succeeded, and call <code>rollback()</code> in a catch block if any statement threw an exception. This guarantees the database never ends up with only half of a logically related change applied.`,
      },
    ],
    examples: [
      {
        caption: 'A funds transfer that must be atomic across two UPDATE statements',
        code: `public void transferFunds(Connection conn, int fromAccount, int toAccount, double amount)
        throws SQLException {
    try {
        conn.setAutoCommit(false);

        try (PreparedStatement debit = conn.prepareStatement(
                "UPDATE accounts SET balance = balance - ? WHERE id = ?")) {
            debit.setDouble(1, amount);
            debit.setInt(2, fromAccount);
            debit.executeUpdate();
        }

        try (PreparedStatement credit = conn.prepareStatement(
                "UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
            credit.setDouble(1, amount);
            credit.setInt(2, toAccount);
            credit.executeUpdate();
        }

        conn.commit();
        System.out.println("Transfer committed.");
    } catch (SQLException e) {
        conn.rollback();
        System.out.println("Transfer failed, rolled back: " + e.getMessage());
        throw e;
    } finally {
        conn.setAutoCommit(true);
    }
}`,
        output: `// Successful transfer:
Transfer committed.

// If the credit statement fails (e.g. invalid account id):
Transfer failed, rolled back: <driver-specific SQL error message>`,
      },
    ],
    commonMistakes: [
      'Leaving auto-commit on for a multi-statement operation, so a failure midway leaves the database partially updated.',
      'Calling commit() without a surrounding try/catch, so a failed statement never triggers a rollback and the transaction hangs open.',
      'Forgetting to reset setAutoCommit(true) before returning a pooled connection, which silently affects the next code that borrows it.',
      'Assuming rollback() undoes changes already committed by a previous, separate transaction — rollback only affects the current open transaction.',
    ],
    keyPoints: [
      'By default a JDBC Connection auto-commits every statement as its own transaction.',
      'setAutoCommit(false) groups subsequent statements into one manual transaction.',
      'commit() makes all pending statements permanent; rollback() undoes all of them.',
      'Multi-statement operations that must be all-or-nothing require manual transaction control, not auto-commit.',
    ],
  },

  'connection-pooling-concepts': {
    title: 'Connection Pooling Concepts',
    intro: `Opening a JDBC connection with <code>DriverManager.getConnection()</code> is not cheap: it involves a TCP handshake, authentication with the database server, and session setup on both sides. In an application handling many requests per second, opening and closing a brand-new physical connection for every single database call would overwhelm the database and add significant latency to every request. Connection pooling solves this by reusing a small set of already-open connections.`,
    sections: [
      {
        heading: 'The Core Idea: Reuse, Don\'t Recreate',
        body: `A connection pool maintains a fixed set of physical database connections that are opened once, kept alive, and lent out to application code on demand. When your code needs a connection, it borrows one from the pool instead of opening a new socket; when it is done, it returns the connection to the pool instead of physically closing it. The pool takes care of validating connections, closing ones that go stale, and opening new ones as needed within configured limits.`,
      },
      {
        heading: 'Key Pool Settings',
        body: `Every connection pool exposes a similar set of tuning knobs, because they all solve the same underlying resource-management problem.`,
        list: [
          '<strong>Minimum/initial pool size</strong> — how many connections are kept open even when idle, so requests don\'t wait for a fresh connection to spin up.',
          '<strong>Maximum pool size</strong> — the hard cap on simultaneous open connections, protecting the database from being overwhelmed by too many concurrent connections.',
          '<strong>Connection timeout</strong> — how long a thread will wait for a connection to become available before failing with an error.',
          '<strong>Idle timeout</strong> — how long an unused connection can sit in the pool before being closed and removed, freeing resources during low traffic.',
          '<strong>Validation / test-on-borrow</strong> — a lightweight check that a connection handed out is still alive, avoiding handing back one the database has already dropped.',
        ],
      },
      {
        heading: 'HikariCP — The Modern Standard',
        body: `HikariCP is the de facto standard JDBC connection pool in modern Java applications (it is Spring Boot's default pool). It is deliberately minimal and heavily optimized — small bytecode footprint, careful avoidance of unnecessary locking and object allocation — which makes it noticeably faster and lower-overhead than older pools like Apache DBCP or C3P0. In practice, you configure a <code>HikariDataSource</code> once at application startup with your JDBC URL, credentials, and pool-size settings, and then request connections from that <code>DataSource</code> instead of calling <code>DriverManager</code> directly throughout your code.`,
      },
    ],
    examples: [
      {
        caption: 'Configuring HikariCP and borrowing pooled connections',
        code: `import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import java.sql.Connection;

public class PoolDemo {
    public static void main(String[] args) throws Exception {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://localhost:5432/inventory");
        config.setUsername("app_user");
        config.setPassword("secret");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30_000);       // 30 seconds
        config.setConnectionTimeout(5_000);  // 5 seconds

        DataSource dataSource = new HikariDataSource(config);

        // Borrow a connection from the pool -- no new socket is opened here
        // if an idle pooled connection is already available.
        try (Connection conn = dataSource.getConnection()) {
            System.out.println("Borrowed pooled connection: " + !conn.isClosed());
        }
        // conn.close() here returns the connection to the pool instead of
        // physically closing the underlying socket.
    }
}`,
        output: `// Illustrative -- HikariCP also logs pool startup/shutdown to the console:
Borrowed pooled connection: true`,
      },
    ],
    commonMistakes: [
      'Calling DriverManager.getConnection() directly inside request-handling code instead of borrowing from a shared pool.',
      'Setting the maximum pool size far higher than the database\'s actual connection capacity, which can overwhelm the database instead of protecting it.',
      'Never closing borrowed connections, which leaks them out of the pool until it is exhausted and every request starts timing out.',
      'Assuming a larger pool always means better throughput — beyond a certain size, more pooled connections just add contention on the database without helping.',
    ],
    keyPoints: [
      'Opening a raw database connection is expensive; pooling amortizes that cost by reusing a set of already-open connections.',
      'Pools are tuned with settings like minimum idle, maximum pool size, connection timeout, and idle timeout.',
      'Borrowing/returning a pooled connection reuses the physical socket; close() returns it to the pool rather than closing it.',
      'HikariCP is the modern, high-performance default connection pool in the Java ecosystem, including Spring Boot.',
    ],
  },
}
