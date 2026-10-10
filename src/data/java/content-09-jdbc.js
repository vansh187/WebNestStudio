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
          'H2 in memory (no server needed, handy for learning and tests): <code>jdbc:h2:mem:inventory</code>',
        ],
      },
      {
        heading: 'Getting the Driver onto the Classpath',
        body: `<code>DriverManager</code> is part of the JDK, but the drivers are not. Each database vendor ships its driver as a jar: <code>org.postgresql:postgresql</code>, <code>com.mysql:mysql-connector-j</code>, <code>com.h2database:h2</code> and so on. Add it as a Maven or Gradle dependency, or pass it with <code>-cp</code> when running from the command line. Since JDBC 4.0 (Java 6) every driver jar registers itself through the <code>ServiceLoader</code> mechanism, so the old <code>Class.forName("org.postgresql.Driver")</code> line you still see in many tutorials is no longer needed. You can check which drivers were found with <code>DriverManager.drivers()</code>: with the H2 jar on the classpath it lists <code>org.h2.Driver</code>, and without it the list is empty.`,
      },
      {
        heading: 'Obtaining a Connection',
        body: `<code>DriverManager.getConnection(url, user, password)</code> asks each registered driver, in turn, whether it accepts the given URL; the first driver that says yes opens a physical network connection to the database and wraps it as a <code>Connection</code> object. This call is relatively expensive — it typically involves a TCP handshake, authentication, and session setup on the server — which is one reason applications avoid opening a fresh connection for every single query (see connection pooling). If no registered driver accepts the URL, you get <code>SQLException: No suitable driver found for ...</code>. That message means either the driver jar is missing from the classpath or the URL is misspelled; it never means the database is down.`,
      },
      {
        heading: 'Reading Connection Errors',
        body: `Every <code>SQLException</code> carries more than a message. <code>getSQLState()</code> returns a five-character code defined by the SQL standard, and <code>getErrorCode()</code> a vendor-specific number. The first two characters of the SQLState tell you the category, which is the same across databases and therefore safe to check in code:`,
        list: [
          '<code>08xxx</code>: connection problems, such as a server that cannot be reached or a URL no driver accepts (<code>08001</code>).',
          '<code>28xxx</code>: authentication failed, for example a wrong user name or password (<code>28000</code>).',
          '<code>42xxx</code>: syntax errors or unknown tables and columns, which you will meet once queries start running.',
        ],
      },
      {
        heading: 'Always Use try-with-resources',
        body: `<code>Connection</code>, along with <code>Statement</code> and <code>ResultSet</code>, implements <code>AutoCloseable</code>. Wrapping them in a try-with-resources statement guarantees they are closed — releasing the underlying socket and any server-side session resources — even if an exception is thrown while the query runs. Relying on manually calling <code>close()</code> in a <code>finally</code> block is more verbose and easier to get wrong (for example, forgetting to close a ResultSet before its Statement).`,
      },
      {
        heading: 'Keeping Credentials out of the Code',
        body: `A password written into a <code>.java</code> file ends up in version control, in every copy of the repository and in the compiled class. Read connection details from the environment instead, for example <code>System.getenv("DB_URL")</code>, or from a properties file that is not committed. In frameworks such as Spring Boot this is handled for you through <code>spring.datasource.*</code> properties, and the framework uses a connection pool rather than <code>DriverManager</code> directly.`,
      },
    ],
    examples: [
      {
        caption: 'Opening and safely closing a connection with try-with-resources (run with the H2 2.4.240 jar: java -cp h2.jar ConnectDemo.java)',
        code: `import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConnectDemo {
    // For PostgreSQL: "jdbc:postgresql://localhost:5432/inventory" plus the postgresql jar
    private static final String URL = "jdbc:h2:mem:inventory";
    private static final String USER = "sa";
    private static final String PASSWORD = "";

    public static void main(String[] args) {
        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD)) {
            DatabaseMetaData meta = conn.getMetaData();
            System.out.println("Connected to: " + meta.getDatabaseProductName()
                    + " " + meta.getDatabaseProductVersion());
            System.out.println("Driver: " + meta.getDriverName() + " " + meta.getDriverVersion());
            System.out.println("Catalog: " + conn.getCatalog());
            System.out.println("Auto-commit enabled: " + conn.getAutoCommit());
            System.out.println("Valid: " + conn.isValid(2));   // pings, waits at most 2 s
        } catch (SQLException e) {
            System.out.println("Connection failed: " + e.getMessage());
        }
        // conn.close() is called automatically here, even on exception
    }
}`,
        output: `Connected to: H2 2.4.240 (2025-09-22)
Driver: H2 JDBC Driver 2.4.240 (2025-09-22)
Catalog: INVENTORY
Auto-commit enabled: true
Valid: true`,
      },
      {
        caption: 'What the two most common connection errors look like',
        code: `// 1. A typo in the subprotocol (h3 instead of h2)
try (Connection conn = DriverManager.getConnection("jdbc:h3:mem:inventory", "sa", "")) {
    System.out.println("connected?");
} catch (SQLException e) {
    System.out.println("Typo: " + e.getMessage() + " (SQLState " + e.getSQLState() + ")");
}

// 2. A wrong password for a database that exists
try (Connection c1 = DriverManager.getConnection("jdbc:h2:mem:shop;DB_CLOSE_DELAY=-1", "admin", "right");
     Connection c2 = DriverManager.getConnection("jdbc:h2:mem:shop", "admin", "wrong")) {
    System.out.println("connected?");
} catch (SQLException e) {
    System.out.println("Wrong password: " + e.getMessage()
            + " (SQLState " + e.getSQLState() + ")");
}`,
        output: `Typo: No suitable driver found for jdbc:h3:mem:inventory (SQLState 08001)
Wrong password: Wrong user name or password [28000-240] (SQLState 28000)`,
      },
    ],
    commonMistakes: [
      'Hardcoding the JDBC URL, username, and password directly in source code instead of externalizing them into configuration.',
      'Mistyping the JDBC URL subprotocol (e.g. "jdbc:mysqll://...") and getting a confusing "No suitable driver" error instead of a clear typo message.',
      'Not closing connections (or not using try-with-resources), which exhausts the database\'s max_connections limit under load.',
      'Assuming getConnection() is cheap enough to call once per query in a hot path — it is not, which is why pooling exists.',
      'Forgetting to add the driver jar as a dependency, then searching for a database problem when the error says "No suitable driver".',
      'Matching on exception message text, which differs between databases and driver versions, instead of on getSQLState().',
    ],
    keyPoints: [
      'JDBC URLs follow the pattern jdbc:<subprotocol>://host:port/database, with vendor-specific details after that.',
      'Driver jars register themselves automatically (JDBC 4.0+); Class.forName() is no longer required.',
      'DriverManager.getConnection(url, user, password) opens a real network connection and returns a Connection object.',
      '"No suitable driver" means a missing driver jar or a misspelled URL; SQLState 08xxx is a connection problem and 28xxx a login problem.',
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
      {
        heading: 'execute, executeQuery and executeUpdate',
        body: `All three statement types offer the same three ways to run SQL, and picking the right one makes the code say what it expects:`,
        list: [
          '<code>executeQuery()</code> for a SELECT. It returns a <code>ResultSet</code>, and throws an exception if the SQL does not produce one.',
          '<code>executeUpdate()</code> for INSERT, UPDATE, DELETE and DDL. It returns the number of rows changed, which is worth checking: an UPDATE that returns 0 usually means the WHERE clause matched nothing, for example because the ID does not exist.',
          '<code>execute()</code> when you do not know in advance, or for stored procedures. It returns <code>true</code> if the first result is a ResultSet; read it with <code>getResultSet()</code> or the count with <code>getUpdateCount()</code>.',
        ],
      },
      {
        heading: 'What Placeholders Can and Cannot Replace',
        body: `A <code>?</code> stands for a <em>value</em> only: a string, a number, a date. It cannot stand for a table name, a column name, a keyword such as <code>ASC</code>/<code>DESC</code>, or a list of values in <code>IN (?)</code>. When those parts must vary, for example a "sort by" option chosen by the user, never paste the user's text into the SQL. Check it against a fixed list of allowed values instead (<code>Map.of("price", "price", "name", "name")</code>) and use only the value from your own list. For <code>IN</code> lists, generate one <code>?</code> per element and bind each one.`,
      },
      {
        heading: 'Batching Many Inserts',
        body: `Inserting 10,000 rows with 10,000 separate <code>executeUpdate()</code> calls means 10,000 round trips to the database. <code>PreparedStatement</code> can collect rows with <code>addBatch()</code> and send them together with <code>executeBatch()</code>, which returns one update count per row. Combined with a transaction (covered in the transactions lesson), batching is usually the single biggest speed-up for bulk loads.`,
      },
    ],
    examples: [
      {
        caption: 'Why string concatenation is dangerous, and how PreparedStatement fixes it (run with java -cp h2.jar InjectionDemo.java)',
        code: `import java.sql.*;

public class InjectionDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection conn = DriverManager.getConnection("jdbc:h2:mem:shop", "sa", "")) {
            try (Statement st = conn.createStatement()) {   // Statement is fine for fixed SQL
                st.execute("CREATE TABLE users (id INT PRIMARY KEY, username VARCHAR(40), role VARCHAR(20))");
                st.execute("INSERT INTO users VALUES (1, 'admin', 'ADMIN'), (2, 'asha', 'USER'), (3, 'ravi', 'USER')");
            }

            String username = "admin' OR '1'='1";   // what an attacker types into a login form

            // UNSAFE: the input becomes part of the SQL text
            String unsafeSql = "SELECT username, role FROM users WHERE username = '" + username + "'";
            System.out.println("SQL sent: " + unsafeSql);
            try (Statement st = conn.createStatement();
                 ResultSet rs = st.executeQuery(unsafeSql)) {
                int rows = 0;
                while (rs.next()) {
                    rows++;
                    System.out.println("  " + rs.getString("username") + " (" + rs.getString("role") + ")");
                }
                System.out.println("Statement rows: " + rows);
            }

            // SAFE: the input is bound as one value
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT username, role FROM users WHERE username = ?")) {
                ps.setString(1, username);
                try (ResultSet rs = ps.executeQuery()) {
                    int rows = 0;
                    while (rs.next()) rows++;
                    System.out.println("PreparedStatement rows: " + rows);
                }
                ps.setString(1, "asha");          // same statement, new value
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    System.out.println("Reused for 'asha': " + rs.getString("role"));
                }
            }

            // executeUpdate returns the number of rows changed
            try (PreparedStatement ps = conn.prepareStatement("UPDATE users SET role = ? WHERE role = ?")) {
                ps.setString(1, "MEMBER");
                ps.setString(2, "USER");
                System.out.println("Rows updated: " + ps.executeUpdate());
            }

            // Parameter positions start at 1
            try (PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?")) {
                ps.setInt(0, 1);
            } catch (SQLException e) {
                System.out.println("setInt(0, ..): " + e.getMessage());
            }
        }
    }
}`,
        output: `SQL sent: SELECT username, role FROM users WHERE username = 'admin' OR '1'='1'
  admin (ADMIN)
  asha (USER)
  ravi (USER)
Statement rows: 3
PreparedStatement rows: 0
Reused for 'asha': USER
Rows updated: 2
setInt(0, ..): Invalid value "0" for parameter "parameterIndex" [90008-240]`,
      },
      {
        caption: 'Calling a stored procedure with IN and OUT parameters (HSQLDB 2.7.4: java -cp hsqldb.jar ProcedureDemo.java)',
        code: `import java.sql.*;

public class ProcedureDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection conn = DriverManager.getConnection("jdbc:hsqldb:mem:shop", "SA", "")) {
            try (Statement st = conn.createStatement()) {
                st.execute("CREATE TABLE orders (id INT PRIMARY KEY, user_id INT, total DECIMAL(10,2))");
                st.execute("INSERT INTO orders VALUES (1, 1042, 59.99), (2, 1042, 15.00), (3, 7, 99.00), (4, 1042, 25.01)");
                st.execute("""
                    CREATE PROCEDURE get_order_stats(IN p_user INT, OUT p_count INT, OUT p_spent DECIMAL(10,2))
                    READS SQL DATA
                    BEGIN ATOMIC
                        SELECT COUNT(*), COALESCE(SUM(total), 0) INTO p_count, p_spent
                        FROM orders WHERE user_id = p_user;
                    END""");
            }

            try (CallableStatement cs = conn.prepareCall("{call get_order_stats(?, ?, ?)}")) {
                cs.setInt(1, 1042);                                  // IN
                cs.registerOutParameter(2, Types.INTEGER);           // OUT
                cs.registerOutParameter(3, Types.DECIMAL);           // OUT
                cs.execute();
                System.out.println("Orders for user 1042: " + cs.getInt(2));
                System.out.println("Total spent: " + cs.getBigDecimal(3));
            }
        }
    }
}`,
        output: `Orders for user 1042: 3
Total spent: 100.00

(The CREATE PROCEDURE syntax differs between databases; the Java side,
 {call ...}, setInt and registerOutParameter, stays the same.)`,
      },
    ],
    commonMistakes: [
      'Building SQL by concatenating user input into a Statement, which is the single most common cause of SQL injection vulnerabilities.',
      'Forgetting that PreparedStatement parameter indices are 1-based, not 0-based.',
      'Reusing a PreparedStatement across unrelated queries by trying to change its SQL text — you must create a new PreparedStatement for different SQL.',
      'Skipping registerOutParameter() because one driver tolerated it. The JDBC specification requires it, HSQLDB happens to return the value anyway, and other drivers throw, so the code breaks when the database changes.',
      'Trying to bind a table name, column name or sort direction with ?. Placeholders only take values; check such parts against an allow-list instead.',
      'Ignoring the count returned by executeUpdate(), so an UPDATE that matched no rows is treated as a success.',
    ],
    keyPoints: [
      'Statement executes raw SQL with no parameters and no injection protection — use it only for static, trusted SQL.',
      'PreparedStatement uses ? placeholders and typed setters, is precompiled for reuse, and is the safe default for any query with dynamic values.',
      'CallableStatement extends PreparedStatement to invoke stored procedures, supporting IN, OUT, and INOUT parameters.',
      'Never build SQL with string concatenation from untrusted input — always parameterize it.',
      'executeQuery() returns a ResultSet, executeUpdate() a row count, and execute() a boolean saying which kind of result came back.',
      'addBatch()/executeBatch() sends many parameter sets in one round trip.',
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
        body: `Sometimes you need to inspect a query's shape without knowing its columns in advance — for example, writing a generic table-printing utility. <code>ResultSetMetaData</code>, obtained via <code>rs.getMetaData()</code>, exposes information like <code>getColumnCount()</code>, <code>getColumnLabel(i)</code> (the alias if the query used <code>AS</code>, otherwise the name), and <code>getColumnTypeName(i)</code>, letting you iterate over a result set's structure generically instead of hardcoding column names.`,
      },
      {
        heading: 'NULL Values and wasNull()',
        body: `SQL has <code>NULL</code>, but Java's primitive types do not. When a column is NULL, <code>getInt()</code> returns <code>0</code>, <code>getDouble()</code> returns <code>0.0</code> and <code>getBoolean()</code> returns <code>false</code>, so a missing stock count looks exactly like "out of stock". Call <code>rs.wasNull()</code> right after the getter to tell the two apart, or read the value as an object, <code>rs.getObject("stock", Integer.class)</code>, which returns <code>null</code>. Getters for object types such as <code>getString()</code> and <code>getBigDecimal()</code> return <code>null</code> directly.`,
      },
      {
        heading: 'Choosing the Right Getter for Money and Dates',
        body: `Use <code>getBigDecimal()</code> for prices and other exact decimal values. <code>getDouble()</code> converts to binary floating point, so a stored 0.1 cannot be represented exactly and sums drift. For dates and times, JDBC 4.2 drivers support the <code>java.time</code> types directly: <code>rs.getObject("added", LocalDate.class)</code> for a DATE column and <code>LocalDateTime</code> or <code>OffsetDateTime</code> for timestamps. That is clearer than the old <code>java.sql.Date</code> and <code>java.sql.Timestamp</code> classes. When binding parameters, the matching call is <code>ps.setObject(i, localDate)</code>.`,
      },
      {
        heading: 'Scrollable Result Sets',
        body: `If you really need to move backward or jump to a row, ask for a scrollable result set when creating the statement: <code>conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY)</code>. It adds <code>previous()</code>, <code>first()</code>, <code>last()</code>, <code>absolute(n)</code> and <code>getRow()</code>. Most applications never need this: the driver may have to buffer the whole result, and copying rows into a <code>List</code> of your own objects is usually simpler. For paging, use <code>LIMIT</code>/<code>OFFSET</code> (or <code>FETCH FIRST</code>) in the SQL instead.`,
      },
    ],
    examples: [
      {
        caption: 'Reading rows, metadata, NULLs, BigDecimal and LocalDate (H2 2.4.240: java -cp h2.jar RsDemo.java)',
        code: `// Table: products(id INT, name VARCHAR, price DECIMAL(8,2), stock INT, added DATE)
// Rows:  1 USB Cable 9.99 120 | 2 Mechanical Keyboard 59.99 35
//        3 Mouse Pad 12.50 NULL | 4 27-inch Monitor 189.00 8

String sql = "SELECT id, name, price, stock, added FROM products WHERE price > ? ORDER BY price";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setBigDecimal(1, new BigDecimal("10"));
    try (ResultSet rs = ps.executeQuery()) {
        ResultSetMetaData meta = rs.getMetaData();
        System.out.print("Columns: " + meta.getColumnCount() + " ->");
        for (int i = 1; i <= meta.getColumnCount(); i++) {
            System.out.print(" " + meta.getColumnLabel(i) + ":" + meta.getColumnTypeName(i));
        }
        System.out.println();

        while (rs.next()) {
            int id = rs.getInt("id");
            String name = rs.getString("name");
            BigDecimal price = rs.getBigDecimal("price");
            int stock = rs.getInt("stock");
            boolean stockMissing = rs.wasNull();          // was that 0 really NULL?
            LocalDate added = rs.getObject("added", LocalDate.class);
            System.out.printf("#%d %-20s %7s  stock=%s  added=%s%n",
                    id, name, price, stockMissing ? "unknown" : stock, added);
        }
    }
}`,
        output: `Columns: 5 -> ID:INTEGER NAME:CHARACTER VARYING PRICE:DECIMAL STOCK:INTEGER ADDED:DATE
#3 Mouse Pad              12.50  stock=unknown  added=2026-03-20
#2 Mechanical Keyboard    59.99  stock=35  added=2026-03-02
#4 27-inch Monitor       189.00  stock=8  added=2026-05-11`,
      },
      {
        caption: 'The four cursor mistakes, and what a scrollable ResultSet allows',
        code: `try (Statement st = conn.createStatement();
     ResultSet rs = st.executeQuery("SELECT name FROM products")) {
    try { rs.getString("name"); }                     // 1. no next() yet
    catch (SQLException e) { System.out.println("before next(): " + e.getMessage()); }
    rs.next();
    try { rs.previous(); }                            // 2. forward-only by default
    catch (SQLException e) { System.out.println("previous() on forward-only: " + e.getMessage()); }
    try { rs.getString("nme"); }                      // 3. typo in the column name
    catch (SQLException e) { System.out.println("wrong column: " + e.getMessage()); }
}

ResultSet leaked;
try (Statement st = conn.createStatement()) {
    leaked = st.executeQuery("SELECT name FROM products");
}                                                     // statement closed here
try { leaked.next(); }                                // 4. used after close
catch (SQLException e) { System.out.println("after statement closed: " + e.getMessage()); }

try (Statement st = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
     ResultSet rs = st.executeQuery("SELECT name FROM products ORDER BY id")) {
    rs.last();      System.out.println("last row #" + rs.getRow() + ": " + rs.getString(1));
    rs.absolute(2); System.out.println("row 2: " + rs.getString(1));
    rs.previous();  System.out.println("previous: " + rs.getString(1));
}`,
        output: `before next(): No data is available [2000-240]
previous() on forward-only: The result set is not scrollable and can not be reset. You may need to use conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ..). [90128-240]
wrong column: Column "nme" not found [42122-240]
after statement closed: The object is already closed [90007-240]
last row #4: 27-inch Monitor
row 2: Mechanical Keyboard
previous: USB Cable`,
      },
    ],
    commonMistakes: [
      'Calling a getter before the first rs.next(), when the cursor is still positioned before row one — this throws a SQLException.',
      'Trying to move the cursor backward or re-read a previous row on a default (forward-only) ResultSet, which only supports moving forward with next().',
      'Using a ResultSet after its Statement or Connection has been closed — a closed ResultSet cannot be read from.',
      'Mixing up column index and column name overloads inconsistently, making code harder to maintain when the query changes.',
      'Treating the 0 returned by getInt() as a real value when the column was NULL; check wasNull() or use getObject(column, Integer.class).',
      'Reading prices with getDouble(), which brings floating-point rounding errors into money calculations; use getBigDecimal().',
      'Returning a ResultSet from a method whose try-with-resources closes the statement; copy the rows into objects before returning.',
    ],
    keyPoints: [
      'ResultSet is a forward-moving cursor by default; next() advances it and returns false once rows are exhausted.',
      'Typed getters (getInt, getString, getBigDecimal, etc.) read the current row by column name or 1-based index.',
      'Primitive getters turn NULL into 0 or false; wasNull() or getObject(col, Type.class) tells you the value was missing.',
      'getObject(col, LocalDate.class) and other java.time types are the modern way to read dates and timestamps.',
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
      {
        heading: 'Not Every Failure Is an Exception',
        body: `An UPDATE whose WHERE clause matches nothing is not an error in SQL. Transferring money to account 99, which does not exist, runs both statements without any exception: the debit changes one row, the credit changes zero, and a naive transfer commits, so the money simply disappears. Check the count returned by <code>executeUpdate()</code> and throw when it is not what the operation needs, so the rollback path runs. Database constraints help as well: a <code>CHECK (balance &gt;= 0)</code> turns an overdraft into an exception instead of a negative balance.`,
      },
      {
        heading: 'Savepoints: Undoing Part of a Transaction',
        body: `Sometimes only the last step of a transaction is optional. <code>conn.setSavepoint("name")</code> marks a point inside the open transaction, and <code>conn.rollback(savepoint)</code> undoes everything done after that mark while keeping what came before it. The transaction is still open afterwards, so you still have to call <code>commit()</code>. A typical use is a batch import where one bad record should be skipped without throwing away the records that were already processed.`,
      },
      {
        heading: 'Isolation Levels in Brief',
        body: `While your transaction is open, other connections are working too. The isolation level decides how much of their uncommitted or newly committed work you can see. JDBC defines four levels, from <code>TRANSACTION_READ_UNCOMMITTED</code> to <code>TRANSACTION_SERIALIZABLE</code>, and you set one with <code>conn.setTransactionIsolation(...)</code>. Most databases, including PostgreSQL, Oracle, SQL Server and H2, default to <code>READ_COMMITTED</code>: you never see another transaction's uncommitted changes, but re-reading a row later in the same transaction can return a newer value. MySQL's InnoDB defaults to <code>REPEATABLE_READ</code>. Raise the level only where a calculation really depends on data not changing underneath it, because higher levels mean more locking or more retries.`,
      },
    ],
    examples: [
      {
        caption: 'Why auto-commit is dangerous for a two-step change (H2 2.4.240)',
        code: `// accounts: Asha = 500.00, Ravi = 100.00, with CHECK (balance >= 0)
// Auto-commit is on (the default). Credit first, then debit 800 from Asha:
update(conn, "UPDATE accounts SET balance = balance + ? WHERE id = ?", "800.00", 2);
update(conn, "UPDATE accounts SET balance = balance - ? WHERE id = ?", "800.00", 1); // violates the CHECK`,
        output: `start: Asha=500.00  Ravi=100.00
failed: Check constraint violation: "CONSTRAINT_AF: "; SQL statement: ...
after auto-commit failure: Asha=500.00  Ravi=900.00

(The credit was committed on its own before the debit failed:
 800.00 was created out of nothing.)`,
      },
      {
        caption: 'A funds transfer that must be atomic across two UPDATE statements',
        code: `static void transfer(Connection conn, int from, int to, BigDecimal amount) throws SQLException {
    boolean oldAutoCommit = conn.getAutoCommit();
    conn.setAutoCommit(false);
    try (PreparedStatement debit = conn.prepareStatement(
                 "UPDATE accounts SET balance = balance - ? WHERE id = ?");
         PreparedStatement credit = conn.prepareStatement(
                 "UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
        debit.setBigDecimal(1, amount);
        debit.setInt(2, from);
        if (debit.executeUpdate() != 1) throw new SQLException("No account " + from);

        credit.setBigDecimal(1, amount);
        credit.setInt(2, to);
        if (credit.executeUpdate() != 1) throw new SQLException("No account " + to);

        conn.commit();
        System.out.println("Transfer of " + amount + " committed.");
    } catch (SQLException e) {
        conn.rollback();
        System.out.println("Transfer of " + amount + " rolled back: " + e.getMessage());
        throw e;
    } finally {
        conn.setAutoCommit(oldAutoCommit);    // leave the connection as we found it
    }
}

// Starting from Asha=500.00, Ravi=100.00:
transfer(conn, 1, 2, new BigDecimal("200.00"));
transfer(conn, 1, 2, new BigDecimal("800.00"));   // more than Asha has
transfer(conn, 1, 99, new BigDecimal("50.00"));   // account 99 does not exist`,
        output: `Transfer of 200.00 committed.
after transfer 200: Asha=300.00  Ravi=300.00
Transfer of 800.00 rolled back: Check constraint violation: "CONSTRAINT_AF: "; SQL statement: ...
after failed transfer 800: Asha=300.00  Ravi=300.00
Transfer of 50.00 rolled back: No account 99
after transfer to missing account: Asha=300.00  Ravi=300.00`,
      },
      {
        caption: 'Rolling back to a savepoint',
        code: `conn.setAutoCommit(false);
try (Statement st = conn.createStatement()) {
    st.executeUpdate("UPDATE accounts SET balance = balance - 10 WHERE id = 1");   // monthly fee
    Savepoint afterFee = conn.setSavepoint("after_fee");
    try {
        st.executeUpdate("INSERT INTO audit_log VALUES ('fee charged')");
        st.executeUpdate("UPDATE accounts SET balance = balance - 1000 WHERE id = 1"); // too big
    } catch (SQLException e) {
        System.out.println("Purchase failed: " + e.getMessage());
        conn.rollback(afterFee);      // undo only what came after the savepoint
    }
    conn.commit();                    // the fee is still part of the transaction
}
conn.setAutoCommit(true);`,
        output: `Purchase failed: Check constraint violation ...
Balance: 290.00
Audit rows: 0

(Balance started at 300.00. The fee survived the partial rollback; the audit
 row was written after the savepoint, so it was undone together with the purchase.)`,
      },
    ],
    commonMistakes: [
      'Leaving auto-commit on for a multi-statement operation, so a failure midway leaves the database partially updated.',
      'Calling commit() without a surrounding try/catch, so a failed statement never triggers a rollback and the transaction hangs open.',
      'Forgetting to reset setAutoCommit(true) before returning a pooled connection, which silently affects the next code that borrows it.',
      'Assuming rollback() undoes changes already committed by a previous, separate transaction — rollback only affects the current open transaction.',
      'Ignoring the row count from executeUpdate(), so an update that matched no rows is committed as if it worked.',
      'Using double for money in the SQL parameters; bind BigDecimal with setBigDecimal().',
      'Forgetting to commit() after rolling back to a savepoint, which leaves the rest of the transaction open.',
    ],
    keyPoints: [
      'By default a JDBC Connection auto-commits every statement as its own transaction.',
      'setAutoCommit(false) groups subsequent statements into one manual transaction.',
      'commit() makes all pending statements permanent; rollback() undoes all of them.',
      'Multi-statement operations that must be all-or-nothing require manual transaction control, not auto-commit.',
      'Check executeUpdate() counts and use constraints so logical failures also reach the rollback path.',
      'Savepoints undo part of a transaction; the transaction stays open until commit() or rollback().',
      'READ_COMMITTED is the default isolation level in most databases; MySQL InnoDB uses REPEATABLE_READ.',
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
