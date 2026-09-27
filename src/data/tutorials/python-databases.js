// Python course — database connectivity: sqlite3, MySQL, PostgreSQL,
// SQLAlchemy and MongoDB. Keys are slugs matching topics in codelabDefaults.js.
export const pythonDatabases = {
  'database-connectivity-with-sqlite3': {
    title: 'Database Connectivity with sqlite3',
    intro: `Almost every real application stores its data in a database. Python talks to relational databases through a common interface called the <strong>DB-API 2.0</strong> (PEP 249): you open a <em>connection</em>, create a <em>cursor</em>, <em>execute</em> SQL, <em>fetch</em> results, <em>commit</em> changes, and <em>close</em> the connection. Once you know this pattern with one database, you know it for MySQL, PostgreSQL, SQL Server and Oracle too.

The easiest place to learn it is <strong>SQLite</strong>, a complete SQL database stored in a single file. The <code>sqlite3</code> module is part of the standard library, so there is nothing to install and no server to run — which also means every example in this lesson runs right here in the browser.`,
    sections: [
      {
        heading: 'The DB-API Workflow',
        list: [
          '<code>conn = sqlite3.connect("shop.db")</code> — open (or create) a database file; <code>":memory:"</code> creates a temporary in-memory database.',
          '<code>cur = conn.cursor()</code> — a cursor executes statements and holds results. <code>conn.execute()</code> is a shortcut that creates one for you.',
          '<code>cur.execute(sql, params)</code> runs one statement; <code>cur.executemany(sql, rows)</code> runs it for every row.',
          '<code>fetchone()</code>, <code>fetchmany(n)</code> and <code>fetchall()</code> read results — or simply loop over the cursor.',
          '<code>conn.commit()</code> saves changes, <code>conn.rollback()</code> discards them, <code>conn.close()</code> releases the connection.',
        ],
      },
      {
        heading: 'Placeholders, Not String Formatting',
        body: `Always pass values separately from the SQL: <code>execute("SELECT * FROM users WHERE id = ?", (user_id,))</code>. sqlite3 uses <code>?</code> (positional) or <code>:name</code> (named) placeholders; MySQL and PostgreSQL drivers use <code>%s</code> and <code>%(name)s</code>. The driver sends the values safely, which prevents SQL injection and handles quoting and types for you. Note the trailing comma in <code>(user_id,)</code> — parameters must be a sequence, and <code>(user_id)</code> is just a number in brackets.`,
      },
      {
        heading: 'Rows, Types and Connections as Context Managers',
        body: `By default rows come back as tuples. Set <code>conn.row_factory = sqlite3.Row</code> to access columns by name as well as by position. SQLite maps Python <code>None</code>, <code>int</code>, <code>float</code>, <code>str</code> and <code>bytes</code> to NULL, INTEGER, REAL, TEXT and BLOB. Using the connection in a <code>with conn:</code> block wraps it in a transaction — commit on success, rollback on an exception — but does <em>not</em> close it; use <code>contextlib.closing()</code> or call <code>close()</code> yourself.`,
      },
    ],
    examples: [
      {
        caption: 'Connect, create a table, insert and query',
        code: `import sqlite3

conn = sqlite3.connect(":memory:")        # use "school.db" for a file on disk
cur = conn.cursor()
cur.execute("""
    CREATE TABLE students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        course TEXT NOT NULL,
        marks INTEGER CHECK (marks BETWEEN 0 AND 100)
    )
""")
cur.execute("INSERT INTO students (name, course, marks) VALUES (?, ?, ?)", ("Asha", "Python", 91))
print("new id:", cur.lastrowid)
conn.commit()

cur.execute("SELECT id, name, course, marks FROM students")
print(cur.fetchall())
print([column[0] for column in cur.description])
conn.close()`,
        output: `new id: 1
[(1, 'Asha', 'Python', 91)]
['id', 'name', 'course', 'marks']`,
      },
      {
        caption: 'executemany, the fetch methods and sqlite3.Row',
        code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL)")
conn.executemany("INSERT INTO products (name, category, price) VALUES (?, ?, ?)", [
    ("Pen", "stationery", 20.0),
    ("Notebook", "stationery", 60.0),
    ("Headphones", "electronics", 1499.0),
    ("Mouse", "electronics", 699.0),
    ("Backpack", "bags", 1250.0),
])
conn.commit()

cur = conn.execute("SELECT name, price FROM products ORDER BY price DESC")
print(cur.fetchone())
print(cur.fetchmany(2))
print(cur.fetchall())                      # whatever is left

conn.row_factory = sqlite3.Row             # rows now support row["column"]
query = """SELECT category, COUNT(*) AS items, ROUND(AVG(price), 1) AS avg_price
           FROM products GROUP BY category ORDER BY category"""
for row in conn.execute(query):
    print(row["category"], row["items"], row["avg_price"])
conn.close()`,
        output: `('Headphones', 1499.0)
[('Backpack', 1250.0), ('Mouse', 699.0)]
[('Notebook', 60.0), ('Pen', 20.0)]
bags 1 1250.0
electronics 2 1099.0
stationery 2 40.0`,
      },
      {
        caption: 'A database file, named placeholders and context managers',
        code: `import sqlite3
from contextlib import closing

with closing(sqlite3.connect("library.db")) as conn:     # closing() calls conn.close()
    with conn:                                         # commit on success, rollback on error
        conn.execute("DROP TABLE IF EXISTS books")
        conn.execute("CREATE TABLE books (code TEXT PRIMARY KEY, title TEXT, year INTEGER)")
        conn.execute("INSERT INTO books VALUES (:code, :title, :year)",
                     {"code": "BK-001", "title": "Learning Python Basics", "year": 2026})

# A new connection sees the data because it was committed to the file.
with closing(sqlite3.connect("library.db")) as conn:
    print(conn.execute("SELECT title, year FROM books").fetchone())
    print(conn.execute("SELECT COUNT(*) FROM books").fetchone()[0], "book(s) stored")`,
        output: `('Learning Python Basics', 2026)
1 book(s) stored`,
      },
    ],
    commonMistakes: [
      'Building SQL with f-strings or + instead of placeholders, opening the door to SQL injection.',
      'Writing (value) instead of (value,) for a single parameter.',
      'Forgetting conn.commit(), so inserts and updates silently disappear when the program ends.',
      'Assuming with conn: closes the connection — it only commits or rolls back.',
      'Calling fetchall() on huge result sets instead of iterating over the cursor.',
    ],
    keyPoints: [
      'DB-API pattern: connect → cursor → execute → fetch → commit → close.',
      'sqlite3 is built in; ":memory:" gives a throwaway database, a file name gives a persistent one.',
      'Always use placeholders (? or :name in sqlite3) for values.',
      'fetchone, fetchmany and fetchall read results; cursors are also iterable.',
      'sqlite3.Row gives name-based column access; with conn: manages the transaction.',
    ],
  },

  'crud-operations-with-sqlite3': {
    title: 'CRUD Operations with sqlite3',
    intro: `<strong>CRUD</strong> — Create, Read, Update, Delete — is the core of most database-backed programs, from a to-do app to an e-commerce back end. In this lesson you will write small, reusable functions for each operation, check how many rows a statement affected, and learn the patterns for filtering, searching, <code>IN</code> lists, sorting and pagination without ever building unsafe SQL.`,
    sections: [
      {
        heading: 'The Four Operations',
        body: `<strong>Create</strong> uses <code>INSERT</code>; <code>cursor.lastrowid</code> gives the new row's id. <strong>Read</strong> uses <code>SELECT</code> with <code>WHERE</code>, <code>ORDER BY</code> and <code>LIMIT</code>. <strong>Update</strong> uses <code>UPDATE ... SET ... WHERE</code> and <strong>Delete</strong> uses <code>DELETE FROM ... WHERE</code>; both report the number of affected rows in <code>cursor.rowcount</code>, which tells you whether the record existed. Never run <code>UPDATE</code> or <code>DELETE</code> without a <code>WHERE</code> clause unless you really mean every row.`,
      },
      {
        heading: 'Dynamic Queries Done Safely',
        body: `Placeholders can only stand for <em>values</em>. For a search term, put the wildcards in the value: <code>("%" + term + "%",)</code>. For an <code>IN</code> list, generate one <code>?</code> per item and pass the items as parameters. Table and column names cannot be parameters, so when the user chooses a sort column, map their choice through a whitelist dictionary of allowed columns instead of inserting their text into the SQL.`,
      },
    ],
    examples: [
      {
        caption: 'Create, read, update and delete functions',
        code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("""CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    salary INTEGER NOT NULL
)""")

def create(name, department, salary):
    with conn:
        cur = conn.execute("INSERT INTO employees (name, department, salary) VALUES (?, ?, ?)",
                           (name, department, salary))
    return cur.lastrowid

def read(emp_id):
    row = conn.execute("SELECT * FROM employees WHERE id = ?", (emp_id,)).fetchone()
    return dict(row) if row else None

def update_salary(emp_id, new_salary):
    with conn:
        cur = conn.execute("UPDATE employees SET salary = ? WHERE id = ?", (new_salary, emp_id))
    return cur.rowcount

def delete(emp_id):
    with conn:
        cur = conn.execute("DELETE FROM employees WHERE id = ?", (emp_id,))
    return cur.rowcount

asha = create("Asha", "Engineering", 90000)
ravi = create("Ravi", "Sales", 55000)
meera = create("Meera", "Engineering", 82000)

print(read(asha))
print("updated rows:", update_salary(ravi, 60000), read(ravi)["salary"])
print("deleted rows:", delete(meera), "| after delete:", read(meera))
print("deleting again:", delete(meera))`,
        output: `{'id': 1, 'name': 'Asha', 'department': 'Engineering', 'salary': 90000}
updated rows: 1 60000
deleted rows: 1 | after delete: None
deleting again: 0`,
      },
      {
        caption: 'Searching, IN lists, whitelisted sorting and pagination',
        code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, price INTEGER)")
conn.executemany("INSERT INTO books (title, author, price) VALUES (?, ?, ?)", [
    ("Python Crash Notes", "Asha", 450),
    ("Deep Python", "Ravi", 899),
    ("SQL for Beginners", "Meera", 350),
    ("Python Testing", "Asha", 599),
    ("Data with Pandas", "Kiran", 750),
])

term = "python"                                      # LIKE is case-insensitive for ASCII
print(conn.execute("SELECT title FROM books WHERE title LIKE ? ORDER BY title",
                   (f"%{term}%",)).fetchall())

authors = ["Asha", "Kiran"]
placeholders = ", ".join("?" for _ in authors)       # "?, ?" — values are still parameters
query = f"SELECT title, author FROM books WHERE author IN ({placeholders}) ORDER BY id"
print(conn.execute(query, authors).fetchall())

def page(number, size=2, sort="price"):
    allowed = {"price": "price", "title": "title"}   # column names cannot be parameters
    column = allowed.get(sort, "id")
    return conn.execute(f"SELECT title, price FROM books ORDER BY {column} LIMIT ? OFFSET ?",
                        (size, (number - 1) * size)).fetchall()

print(page(1))
print(page(2))
print(page(1, sort="price; DROP TABLE books"))       # unknown choice falls back to id`,
        output: `[('Deep Python',), ('Python Crash Notes',), ('Python Testing',)]
[('Python Crash Notes', 'Asha'), ('Python Testing', 'Asha'), ('Data with Pandas', 'Kiran')]
[('SQL for Beginners', 350), ('Python Crash Notes', 450)]
[('Python Testing', 599), ('Data with Pandas', 750)]
[('Python Crash Notes', 450), ('Deep Python', 899)]`,
      },
      {
        caption: 'A small repository class with a dataclass model',
        code: `import sqlite3
from dataclasses import dataclass

@dataclass
class Task:
    title: str
    done: bool = False
    id: int | None = None

class TaskRepository:
    def __init__(self, conn):
        self.conn = conn
        conn.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL, done INTEGER NOT NULL)")

    def add(self, task):
        with self.conn:
            task.id = self.conn.execute("INSERT INTO tasks (title, done) VALUES (?, ?)",
                                        (task.title, int(task.done))).lastrowid
        return task

    def all(self, only_open=False):
        sql = "SELECT id, title, done FROM tasks" + (" WHERE done = 0" if only_open else "") + " ORDER BY id"
        return [Task(title, bool(done), id_) for id_, title, done in self.conn.execute(sql)]

    def complete(self, task_id):
        with self.conn:
            return self.conn.execute("UPDATE tasks SET done = 1 WHERE id = ?", (task_id,)).rowcount == 1

repo = TaskRepository(sqlite3.connect(":memory:"))
for title in ["Buy milk", "Write report", "Call Ravi"]:
    repo.add(Task(title))
print(repo.complete(2), repo.complete(99))
for task in repo.all(only_open=True):
    print(task)`,
        output: `True False
Task(title='Buy milk', done=False, id=1)
Task(title='Call Ravi', done=False, id=3)`,
      },
    ],
    commonMistakes: [
      'Running UPDATE or DELETE without a WHERE clause and changing every row.',
      'Not checking rowcount, so updates to non-existent records fail silently.',
      'Putting % wildcards in the SQL string instead of in the parameter value.',
      'Inserting user-chosen column names straight into SQL instead of using a whitelist.',
      'Using LIMIT/OFFSET pagination without ORDER BY, which gives unpredictable pages.',
    ],
    keyPoints: [
      'INSERT → lastrowid; UPDATE/DELETE → rowcount tells you how many rows changed.',
      'Wildcards for LIKE belong in the parameter value.',
      'Generate one placeholder per item for IN lists.',
      'Whitelist identifiers such as sort columns — they cannot be parameters.',
      'Wrapping SQL in small functions or a repository class keeps the rest of the code clean.',
    ],
  },

  'transactions-and-sql-injection': {
    title: 'Transactions and Preventing SQL Injection',
    intro: `Two topics separate toy database code from production code. <strong>Transactions</strong> make a group of statements succeed or fail together — money must never leave one account without arriving in the other. <strong>SQL injection</strong> is one of the most common and damaging security bugs: when user input is pasted into SQL, an attacker can change what the query does.

This lesson shows both problems happening, then fixes them, and covers the database exception hierarchy you use to handle errors.`,
    sections: [
      {
        heading: 'How SQL Injection Works',
        body: `If a login query is built as <code>f"... WHERE username = '{name}'"</code> and someone types <code>nobody' OR '1'='1</code>, the quote ends the string early and the rest becomes SQL — the condition is now always true. Attackers can use the same trick to read other tables or delete data. The fix is simple and absolute: <strong>always pass values as parameters</strong>. The driver then treats the input purely as data, whatever characters it contains.`,
      },
      {
        heading: 'Transactions and ACID',
        body: `A transaction groups statements into one unit that is <strong>A</strong>tomic (all or nothing), <strong>C</strong>onsistent (constraints hold), <strong>I</strong>solated (others do not see half-finished work) and <strong>D</strong>urable (committed data survives crashes). In Python DB-API drivers, a transaction starts automatically with the first data-changing statement and ends with <code>commit()</code> or <code>rollback()</code>. <code>with conn:</code> does this for you: commit if the block succeeds, rollback if it raises.`,
      },
      {
        heading: 'Database Exceptions',
        body: `DB-API drivers share an exception hierarchy under <code>Error</code> → <code>DatabaseError</code>: <code>IntegrityError</code> (constraint violations — duplicate keys, NULLs, CHECK, foreign keys), <code>OperationalError</code> (bad table names, locked database, lost connection), <code>ProgrammingError</code> (wrong number of parameters, closed cursor) and <code>DataError</code>. Catch the specific ones you can handle, roll back, and let the rest propagate.`,
      },
    ],
    examples: [
      {
        caption: 'SQL injection, and the parameterised fix',
        code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (username TEXT, password_hash TEXT, is_admin INTEGER)")
conn.executemany("INSERT INTO users VALUES (?, ?, ?)", [("asha", "h1", 1), ("ravi", "h2", 0)])

user_input = "nobody' OR '1'='1"

unsafe = f"SELECT username FROM users WHERE username = '{user_input}'"
print("query:", unsafe)
print("unsafe result:", conn.execute(unsafe).fetchall())      # every user leaks

safe = conn.execute("SELECT username FROM users WHERE username = ?", (user_input,)).fetchall()
print("safe result:", safe)                                    # treated as a plain name`,
        output: `query: SELECT username FROM users WHERE username = 'nobody' OR '1'='1'
unsafe result: [('asha',), ('ravi',)]
safe result: []`,
      },
      {
        caption: 'An all-or-nothing money transfer',
        code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER NOT NULL CHECK (balance >= 0))")
conn.executemany("INSERT INTO accounts VALUES (?, ?)", [("asha", 1000), ("ravi", 200)])
conn.commit()

def transfer(sender, receiver, amount):
    try:
        with conn:                          # one transaction: both updates or neither
            conn.execute("UPDATE accounts SET balance = balance + ? WHERE name = ?", (amount, receiver))
            conn.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", (amount, sender))
        print(f"transferred {amount} from {sender} to {receiver}")
    except sqlite3.IntegrityError as e:
        print(f"transfer of {amount} failed and was rolled back ({e})")

def balances():
    return dict(conn.execute("SELECT name, balance FROM accounts ORDER BY name"))

transfer("asha", "ravi", 300)
print(balances())
transfer("ravi", "asha", 900)               # ravi has only 500: the credit to asha is undone
print(balances())`,
        output: `transferred 300 from asha to ravi
{'asha': 700, 'ravi': 500}
transfer of 900 failed and was rolled back (CHECK constraint failed: balance >= 0)
{'asha': 700, 'ravi': 500}`,
      },
      {
        caption: 'Handling IntegrityError and OperationalError',
        code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, item TEXT NOT NULL)")
conn.execute("INSERT INTO orders VALUES (1, 'book')")
conn.commit()

attempts = [
    ("missing value", "INSERT INTO orders (item) VALUES (?)", (None,)),
    ("duplicate key", "INSERT INTO orders (id, item) VALUES (?, ?)", (1, "pen")),
    ("typo in table", "INSERT INTO ordrs (item) VALUES (?)", ("pen",)),
    ("valid insert", "INSERT INTO orders (item) VALUES (?)", ("lamp",)),
]
for label, sql, params in attempts:
    try:
        conn.execute(sql, params)
        conn.commit()
        print(f"{label:<14} saved")
    except sqlite3.IntegrityError as e:
        conn.rollback()
        print(f"{label:<14} IntegrityError: {e}")
    except sqlite3.OperationalError as e:
        conn.rollback()
        print(f"{label:<14} OperationalError: {e}")

print(conn.execute("SELECT id, item FROM orders").fetchall())
print(issubclass(sqlite3.IntegrityError, sqlite3.DatabaseError), issubclass(sqlite3.DatabaseError, sqlite3.Error))`,
        output: `missing value  IntegrityError: NOT NULL constraint failed: orders.item
duplicate key  IntegrityError: UNIQUE constraint failed: orders.id
typo in table  OperationalError: no such table: ordrs
valid insert   saved
[(1, 'book'), (2, 'lamp')]
True True`,
      },
    ],
    commonMistakes: [
      'Escaping quotes by hand instead of using parameters — escaping is easy to get wrong.',
      'Committing after each statement of a multi-step operation, so a failure leaves half-applied changes.',
      'Catching every exception and continuing without rolling back.',
      'Relying on the application to enforce rules the database could enforce with constraints (NOT NULL, UNIQUE, CHECK, FOREIGN KEY).',
      'Keeping transactions open while waiting for user input or network calls, which holds locks.',
    ],
    keyPoints: [
      'Never put user input into SQL text; pass it as parameters.',
      'A transaction is all-or-nothing; with conn: commits on success and rolls back on error.',
      'Database constraints plus transactions keep data consistent even when code fails.',
      'Catch IntegrityError / OperationalError specifically and roll back.',
      'Keep transactions short.',
    ],
  },

  'connecting-to-mysql': {
    title: 'Connecting Python to MySQL',
    intro: `MySQL is one of the most widely used database servers for web applications. Python connects to it with a driver package — the official <strong>mysql-connector-python</strong> from Oracle, or the pure-Python <strong>PyMySQL</strong>. Both follow the DB-API you learned with sqlite3, so the code looks almost the same; the main differences are connection settings, the <code>%s</code> placeholder style, and running a separate server.

<em>These examples need a running MySQL server and the driver installed, so run them on your own computer.</em>`,
    sections: [
      {
        heading: 'Setup',
        list: [
          'Install MySQL Server (or run it with Docker: <code>docker run -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 mysql:8.4</code>).',
          'Create a database and a dedicated user: <code>CREATE DATABASE shop; CREATE USER \'shop_app\'@\'%\' IDENTIFIED BY \'...\'; GRANT ALL ON shop.* TO \'shop_app\'@\'%\';</code>',
          'Install the driver into your virtual environment: <code>pip install mysql-connector-python</code> (or <code>pip install pymysql</code>).',
          'Keep the password out of your code — read it from an environment variable or a secrets manager.',
        ],
      },
      {
        heading: 'Differences from sqlite3',
        body: `Placeholders are <code>%s</code> (or <code>%(name)s</code>) for every type — never use Python's <code>%</code> operator yourself. Autocommit is off by default, so call <code>conn.commit()</code>. <code>conn.cursor(dictionary=True)</code> returns rows as dictionaries. <code>AUTO_INCREMENT</code> ids are available from <code>cursor.lastrowid</code>. For web applications, use a <strong>connection pool</strong> so requests reuse connections instead of opening a new one each time.`,
      },
    ],
    examples: [
      {
        caption: 'Connecting and handling connection errors',
        code: `# pip install mysql-connector-python
import os
import mysql.connector
from mysql.connector import errorcode

config = {
    "host": "localhost",
    "port": 3306,
    "user": "shop_app",
    "password": os.environ["DB_PASSWORD"],     # never hard-code passwords
    "database": "shop",
}

try:
    conn = mysql.connector.connect(**config)
except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Wrong user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print(err)
else:
    print("connected:", conn.is_connected(), "| server version:", conn.get_server_info())
    conn.close()`,
        output: `connected: True | server version: 8.4.2`,
        runnable: false,
      },
      {
        caption: 'Create a table and perform CRUD with %s placeholders',
        code: `import os
import mysql.connector

conn = mysql.connector.connect(host="localhost", user="shop_app",
                               password=os.environ["DB_PASSWORD"], database="shop")
cur = conn.cursor(dictionary=True)             # rows as dicts

cur.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        city VARCHAR(50)
    )
""")

cur.execute("INSERT INTO customers (name, email, city) VALUES (%s, %s, %s)",
            ("Asha", "asha@example.com", "Pune"))
print("new id:", cur.lastrowid)
cur.executemany("INSERT INTO customers (name, email, city) VALUES (%s, %s, %s)", [
    ("Ravi", "ravi@example.com", "Mumbai"),
    ("Meera", "meera@example.com", "Pune"),
])
conn.commit()                                  # autocommit is off by default

cur.execute("SELECT id, name, city FROM customers WHERE city = %s ORDER BY name", ("Pune",))
for row in cur.fetchall():
    print(row)

cur.execute("UPDATE customers SET city = %s WHERE email = %s", ("Nagpur", "ravi@example.com"))
print("updated:", cur.rowcount)
cur.execute("DELETE FROM customers WHERE email = %s", ("meera@example.com",))
print("deleted:", cur.rowcount)
conn.commit()

cur.close()
conn.close()`,
        output: `new id: 1
{'id': 1, 'name': 'Asha', 'city': 'Pune'}
{'id': 3, 'name': 'Meera', 'city': 'Pune'}
updated: 1
deleted: 1`,
        runnable: false,
      },
      {
        caption: 'Transactions with a connection pool',
        code: `import os
import mysql.connector
from mysql.connector import pooling

pool = pooling.MySQLConnectionPool(
    pool_name="shop_pool",
    pool_size=5,
    host="localhost",
    user="shop_app",
    password=os.environ["DB_PASSWORD"],
    database="shop",
)

def place_order(customer_id, items):
    conn = pool.get_connection()
    try:
        conn.start_transaction()
        cur = conn.cursor()
        cur.execute("INSERT INTO orders (customer_id) VALUES (%s)", (customer_id,))
        order_id = cur.lastrowid
        cur.executemany(
            "INSERT INTO order_items (order_id, product, quantity) VALUES (%s, %s, %s)",
            [(order_id, product, qty) for product, qty in items],
        )
        conn.commit()                  # the order and all its items, or nothing
        return order_id
    except mysql.connector.Error:
        conn.rollback()
        raise
    finally:
        conn.close()                   # returns the connection to the pool

print("order", place_order(1, [("Pen", 3), ("Notebook", 2)]), "placed")`,
        output: `order 101 placed`,
        runnable: false,
      },
      {
        caption: 'The same queries with PyMySQL',
        code: `# pip install pymysql
import os
import pymysql

conn = pymysql.connect(host="localhost", user="shop_app", password=os.environ["DB_PASSWORD"],
                       database="shop", cursorclass=pymysql.cursors.DictCursor)
with conn:
    with conn.cursor() as cur:
        cur.execute("SELECT name, city FROM customers WHERE id = %s", (1,))
        print(cur.fetchone())`,
        output: `{'name': 'Asha', 'city': 'Pune'}`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Using ? placeholders (sqlite3 style) with MySQL drivers, which expect %s.',
      'Formatting values into the query with % or f-strings instead of passing them as the second argument.',
      'Forgetting conn.commit() because autocommit is off.',
      'Hard-coding database passwords in source code or committing them to Git.',
      'Opening a new connection for every request in a web app instead of using a pool.',
    ],
    keyPoints: [
      'mysql-connector-python and PyMySQL are DB-API drivers for MySQL.',
      'Use %s / %(name)s placeholders and pass values separately.',
      'Commit explicitly; roll back on errors.',
      'cursor(dictionary=True) or DictCursor returns rows as dictionaries.',
      'Use connection pooling and environment variables for credentials in real applications.',
    ],
  },

  'connecting-to-postgresql': {
    title: 'Connecting Python to PostgreSQL',
    intro: `PostgreSQL is a powerful open-source database known for correctness, rich data types (JSONB, arrays, ranges) and advanced SQL. The modern Python driver is <strong>psycopg 3</strong> (package <code>psycopg</code>); its predecessor <strong>psycopg2</strong> is still found in many existing projects and has a very similar API.

This lesson shows how to connect, run queries with parameters, get rows as dictionaries, use <code>RETURNING</code>, manage transactions, handle specific PostgreSQL errors, and use a connection pool.

<em>These examples need a running PostgreSQL server, so run them on your own computer.</em>`,
    sections: [
      {
        heading: 'Setup',
        list: [
          'Run PostgreSQL locally or with Docker: <code>docker run -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:17</code>.',
          'Install the driver: <code>pip install "psycopg[binary]"</code>, and <code>pip install psycopg-pool</code> for pooling.',
          'Connect with a connection string (DSN) such as <code>postgresql://user:password@localhost:5432/dbname</code>, usually read from a <code>DATABASE_URL</code> environment variable.',
        ],
      },
      {
        heading: 'psycopg 3 Essentials',
        body: `<code>with psycopg.connect(dsn) as conn:</code> commits when the block succeeds, rolls back on an exception, and closes the connection. <code>conn.execute()</code> is a shortcut that creates a cursor. Placeholders are <code>%s</code> or <code>%(name)s</code>. Pass <code>row_factory=dict_row</code> to receive dictionaries. <code>INSERT ... RETURNING id</code> returns generated values in the same round-trip. <code>with conn.transaction():</code> creates an explicit transaction block (or a savepoint when nested). Specific errors live in <code>psycopg.errors</code>, for example <code>UniqueViolation</code> and <code>ForeignKeyViolation</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Connect, create, insert with RETURNING, and query as dictionaries',
        code: `# pip install "psycopg[binary]"
import os
import psycopg
from psycopg.rows import dict_row

DSN = os.environ.get("DATABASE_URL", "postgresql://shop_app:secret@localhost:5432/shop")

with psycopg.connect(DSN, row_factory=dict_row) as conn:      # commits and closes at the end
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                title TEXT NOT NULL,
                done BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        """)
        cur.execute("INSERT INTO tasks (title) VALUES (%s) RETURNING id", ("Write report",))
        print("new id:", cur.fetchone()["id"])

        cur.executemany("INSERT INTO tasks (title) VALUES (%s)", [("Review PR",), ("Deploy",)])
        cur.execute("UPDATE tasks SET done = true WHERE title = %(title)s", {"title": "Review PR"})

        cur.execute("SELECT id, title, done FROM tasks ORDER BY id")
        for row in cur:
            print(row)`,
        output: `new id: 1
{'id': 1, 'title': 'Write report', 'done': False}
{'id': 2, 'title': 'Review PR', 'done': True}
{'id': 3, 'title': 'Deploy', 'done': False}`,
        runnable: false,
      },
      {
        caption: 'Transactions and catching a UniqueViolation',
        code: `import os
import psycopg
from psycopg import errors

DSN = os.environ["DATABASE_URL"]

with psycopg.connect(DSN) as conn:
    conn.execute("CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT NOT NULL)")
    try:
        with conn.transaction():                     # both inserts or neither
            conn.execute("INSERT INTO users VALUES (%s, %s)", ("asha@example.com", "Asha"))
            conn.execute("INSERT INTO users VALUES (%s, %s)", ("asha@example.com", "Asha again"))
    except errors.UniqueViolation as e:
        print("rolled back:", e.diag.message_primary)

    print("users stored:", conn.execute("SELECT count(*) FROM users").fetchone()[0])`,
        output: `rolled back: duplicate key value violates unique constraint "users_pkey"
users stored: 0`,
        runnable: false,
      },
      {
        caption: 'PostgreSQL types: JSONB and arrays map to Python dicts and lists',
        code: `import os
import psycopg
from psycopg.types.json import Jsonb

with psycopg.connect(os.environ["DATABASE_URL"]) as conn:
    conn.execute("""CREATE TEMP TABLE products (
        name TEXT, tags TEXT[], specs JSONB)""")
    conn.execute("INSERT INTO products VALUES (%s, %s, %s)",
                 ("Laptop", ["electronics", "office"], Jsonb({"ram_gb": 16, "ssd_gb": 512})))
    name, tags, specs = conn.execute(
        "SELECT name, tags, specs FROM products WHERE %s = ANY(tags)", ("office",)).fetchone()
    print(name, tags, specs["ram_gb"], type(specs).__name__)`,
        output: `Laptop ['electronics', 'office'] 16 dict`,
        runnable: false,
      },
      {
        caption: 'A connection pool for web applications',
        code: `# pip install psycopg-pool
import os
from psycopg_pool import ConnectionPool

pool = ConnectionPool(os.environ["DATABASE_URL"], min_size=2, max_size=10, open=True)

def count_open_tasks():
    with pool.connection() as conn:          # borrowed from the pool, returned afterwards
        return conn.execute("SELECT count(*) FROM tasks WHERE NOT done").fetchone()[0]

print("open tasks:", count_open_tasks())
pool.close()`,
        output: `open tasks: 2`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Mixing up psycopg (version 3) and psycopg2 examples — imports and some APIs differ.',
      'Using ? placeholders; psycopg expects %s or %(name)s.',
      'Catching a database error and continuing to use the connection without rolling back (PostgreSQL then rejects every command in the failed transaction).',
      'Passing a Python dict for a JSONB column without wrapping it in Jsonb().',
      'Creating a new connection for every web request instead of using psycopg_pool.',
    ],
    keyPoints: [
      'psycopg 3 is the modern PostgreSQL driver; with psycopg.connect(...) commits and closes.',
      'Use %s / %(name)s placeholders, and RETURNING to get generated ids.',
      'row_factory=dict_row gives dictionaries; arrays become lists and JSONB becomes dicts.',
      'conn.transaction() groups statements; psycopg.errors has specific exception classes.',
      'Use a ConnectionPool in long-running applications.',
    ],
  },

  'sqlalchemy-orm': {
    title: 'SQLAlchemy Core and ORM',
    intro: `Writing SQL by hand is fine for small scripts, but larger applications benefit from <strong>SQLAlchemy</strong>, the most popular Python database toolkit. It has two layers: <strong>Core</strong>, a Pythonic way to build and run SQL against any database, and the <strong>ORM</strong> (Object-Relational Mapper), which maps database tables to Python classes so you work with objects instead of rows.

The same code runs on SQLite, PostgreSQL, MySQL, SQL Server and Oracle — only the connection URL changes. This lesson uses the modern SQLAlchemy 2.0 style with type-annotated models. FastAPI, Flask and many other frameworks are commonly paired with SQLAlchemy.

<em>SQLAlchemy is not available in the browser runner; install it with <code>pip install sqlalchemy</code> and run the examples locally. They use SQLite, so no server is needed.</em>`,
    sections: [
      {
        heading: 'Engine, Connection and Session',
        body: `<code>create_engine(url)</code> creates an <strong>engine</strong> that manages a pool of connections. URLs look like <code>sqlite:///app.db</code>, <code>postgresql+psycopg://user:pass@host/db</code> or <code>mysql+pymysql://user:pass@host/db</code>. With Core you use <code>engine.connect()</code> / <code>engine.begin()</code> and <code>text()</code> or <code>select()</code>. With the ORM you use a <strong>Session</strong>: it tracks the objects you add or change and writes them to the database when you <code>commit()</code>.`,
      },
      {
        heading: 'Declaring Models',
        body: `Models subclass a <code>DeclarativeBase</code>. Each attribute is annotated with <code>Mapped[type]</code> and optionally configured with <code>mapped_column()</code> (primary keys, lengths, uniqueness, foreign keys). <code>relationship()</code> links models, for example one author to many books, with <code>back_populates</code> keeping both sides in sync. <code>Base.metadata.create_all(engine)</code> creates the tables; in real projects, use <strong>Alembic</strong> migrations to evolve the schema.`,
      },
      {
        heading: 'Querying',
        body: `Build queries with <code>select(Model).where(...).order_by(...).limit(...)</code> and run them with <code>session.scalars(query)</code> (model objects) or <code>session.execute(query)</code> (rows). <code>.one()</code>, <code>.first()</code> and <code>.all()</code> fetch results; <code>session.get(Model, id)</code> loads by primary key. Joins and aggregates use <code>.join()</code>, <code>.group_by()</code> and <code>func.count()</code> / <code>func.sum()</code>. Values are always sent as bound parameters, so SQLAlchemy queries are safe from SQL injection.`,
      },
    ],
    examples: [
      {
        caption: 'SQLAlchemy Core: engine, text() and bound parameters',
        code: `# pip install sqlalchemy
from sqlalchemy import create_engine, text

engine = create_engine("sqlite:///:memory:")
# PostgreSQL: create_engine("postgresql+psycopg://user:password@localhost:5432/shop")
# MySQL:      create_engine("mysql+pymysql://user:password@localhost:3306/shop")

with engine.begin() as conn:                     # begin() commits at the end of the block
    conn.execute(text("CREATE TABLE stores (city TEXT, revenue INTEGER)"))
    conn.execute(text("INSERT INTO stores VALUES (:city, :revenue)"), [
        {"city": "Pune", "revenue": 820000},
        {"city": "Nashik", "revenue": 310000},
        {"city": "Nagpur", "revenue": 540000},
    ])

with engine.connect() as conn:
    result = conn.execute(text("SELECT city, revenue FROM stores WHERE revenue > :minimum ORDER BY revenue DESC"),
                          {"minimum": 400000})
    for row in result:
        print(row.city, row.revenue)`,
        output: `Pune 820000
Nagpur 540000`,
        runnable: false,
      },
      {
        caption: 'ORM models, relationships and full CRUD',
        code: `from sqlalchemy import create_engine, select, func, String, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session

class Base(DeclarativeBase):
    pass

class Author(Base):
    __tablename__ = "authors"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    books: Mapped[list["Book"]] = relationship(back_populates="author", cascade="all, delete-orphan")

    def __repr__(self):
        return f"Author({self.name!r})"

class Book(Base):
    __tablename__ = "books"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    price: Mapped[int]
    author_id: Mapped[int] = mapped_column(ForeignKey("authors.id"))
    author: Mapped[Author] = relationship(back_populates="books")

    def __repr__(self):
        return f"Book({self.title!r}, {self.price})"

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    # Create
    asha = Author(name="Asha", books=[Book(title="Python Basics", price=450),
                                      Book(title="Python Testing", price=599)])
    ravi = Author(name="Ravi", books=[Book(title="Deep Python", price=899)])
    session.add_all([asha, ravi])
    session.commit()
    print("ids:", asha.id, ravi.id)

    # Read
    book = session.scalars(select(Book).where(Book.title == "Deep Python")).one()
    print(book, "by", book.author.name)

    # Update: change the attribute, then commit
    book.price = 799
    session.commit()

    cheap = session.scalars(select(Book).where(Book.price < 700).order_by(Book.price)).all()
    print(cheap)

    stats = session.execute(
        select(Author.name, func.count(Book.id), func.sum(Book.price))
        .join(Author.books)
        .group_by(Author.name)
        .order_by(Author.name)
    ).all()
    print(stats)

    # Delete: the cascade removes Asha's books too
    session.delete(asha)
    session.commit()
    print(session.scalars(select(Book)).all())`,
        output: `ids: 1 2
Book('Deep Python', 899) by Ravi
[Book('Python Basics', 450), Book('Python Testing', 599)]
[('Asha', 2, 1049), ('Ravi', 1, 799)]
[Book('Deep Python', 799)]`,
        runnable: false,
      },
      {
        caption: 'A session factory, get(), and rolling back on errors',
        code: `from sqlalchemy import create_engine, String
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)          # create once, reuse everywhere

def register(email):
    with SessionLocal() as session:
        try:
            user = User(email=email)
            session.add(user)
            session.commit()
            return f"registered {email} as user {user.id}"
        except IntegrityError:
            session.rollback()
            return f"{email} is already registered"

print(register("asha@example.com"))
print(register("asha@example.com"))
with SessionLocal() as session:
    print(session.get(User, 1).email, session.get(User, 99))`,
        output: `registered asha@example.com as user 1
asha@example.com is already registered
asha@example.com None`,
        runnable: false,
      },
      {
        caption: 'Schema migrations with Alembic',
        code: `pip install alembic
alembic init migrations                 # creates alembic.ini and migrations/
# set sqlalchemy.url in alembic.ini and target_metadata = Base.metadata in migrations/env.py
alembic revision --autogenerate -m "create authors and books"
alembic upgrade head                    # apply all migrations
alembic downgrade -1                    # undo the last one`,
        output: `INFO  [alembic.runtime.migration] Running upgrade  -> 3f2a1c9d8e7b, create authors and books`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Mixing the legacy 1.x query API (session.query) with 2.0-style select() without understanding the difference.',
      'Forgetting session.commit(), so changes are lost when the session closes.',
      'Triggering the "N+1 queries" problem by accessing relationships in a loop — use selectinload() or joinedload().',
      'Using create_all() to change existing tables; it only creates missing tables — use Alembic migrations.',
      'Sharing one Session across threads or web requests instead of one session per unit of work.',
    ],
    keyPoints: [
      'SQLAlchemy Core builds and runs SQL; the ORM maps tables to classes.',
      'create_engine(url) works with SQLite, PostgreSQL, MySQL and more — only the URL changes.',
      'Declare models with DeclarativeBase, Mapped[...] and mapped_column(); link them with relationship().',
      'Query with select(...) and session.scalars()/execute(); commit to save changes.',
      'Use sessionmaker for sessions and Alembic for schema migrations.',
    ],
  },

  'mongodb-with-pymongo': {
    title: 'MongoDB with PyMongo',
    intro: `Not every database uses tables. <strong>MongoDB</strong> is a popular <em>document</em> database: it stores JSON-like documents in <em>collections</em>, and documents in the same collection can have different fields. This suits data with a flexible or nested shape — product catalogues, user profiles, event logs.

Python talks to MongoDB with the official <strong>PyMongo</strong> driver, and documents are simply Python dictionaries. This lesson covers connecting, inserting, querying with filters and projections, updating, deleting, indexes and the aggregation pipeline.

<em>These examples need a MongoDB server (for example <code>docker run -p 27017:27017 mongo:8</code>) and <code>pip install pymongo</code>, so run them on your own computer.</em>`,
    sections: [
      {
        heading: 'Documents, Collections and Queries',
        body: `A <strong>document</strong> is a dict; every document gets a unique <code>_id</code> (an <code>ObjectId</code>) unless you supply one. A <strong>collection</strong> groups documents, and a <strong>database</strong> groups collections — both are created automatically on first insert. Queries are dicts too: <code>{"price": {"$gt": 100}}</code> means price &gt; 100. Common operators are <code>$eq</code>, <code>$ne</code>, <code>$gt</code>, <code>$gte</code>, <code>$lt</code>, <code>$lte</code>, <code>$in</code>, <code>$and</code>, <code>$or</code> and <code>$regex</code>. A <strong>projection</strong> such as <code>{"_id": 0, "name": 1}</code> chooses which fields to return.`,
      },
      {
        heading: 'Updates, Indexes and Aggregation',
        body: `Updates use operators: <code>$set</code> changes fields, <code>$inc</code> adds to numbers, <code>$push</code> appends to arrays, <code>$unset</code> removes fields. <code>upsert=True</code> inserts when nothing matches. Indexes (<code>create_index</code>) make queries fast and can enforce uniqueness. The <strong>aggregation pipeline</strong> is a list of stages — <code>$match</code>, <code>$group</code>, <code>$sort</code>, <code>$project</code>, <code>$lookup</code> — similar to SQL's WHERE, GROUP BY, ORDER BY and JOIN.`,
      },
    ],
    examples: [
      {
        caption: 'Connect, insert and query documents',
        code: `# pip install pymongo
from pymongo import MongoClient, DESCENDING

client = MongoClient("mongodb://localhost:27017/")
db = client["shop"]
products = db["products"]
products.delete_many({})                         # start fresh for the demo

result = products.insert_one({"name": "Pen", "price": 20, "tags": ["stationery"]})
print("inserted id type:", type(result.inserted_id).__name__)

products.insert_many([
    {"name": "Headphones", "price": 1499, "tags": ["electronics", "audio"]},
    {"name": "Mouse", "price": 699, "tags": ["electronics"], "wireless": True},
    {"name": "Notebook", "price": 60, "tags": ["stationery"]},
])

print(products.find_one({"name": "Mouse"}, {"_id": 0}))
for doc in products.find({"price": {"$gt": 100}}, {"_id": 0, "name": 1, "price": 1}).sort("price", DESCENDING):
    print(doc)
print("electronics:", products.count_documents({"tags": "electronics"}))`,
        output: `inserted id type: ObjectId
{'name': 'Mouse', 'price': 699, 'tags': ['electronics'], 'wireless': True}
{'name': 'Headphones', 'price': 1499}
{'name': 'Mouse', 'price': 699}
electronics: 2`,
        runnable: false,
      },
      {
        caption: 'Update, upsert and delete',
        code: `from pymongo import MongoClient

products = MongoClient("mongodb://localhost:27017/")["shop"]["products"]

res = products.update_one({"name": "Pen"}, {"$set": {"price": 25}, "$push": {"tags": "sale"}})
print("matched:", res.matched_count, "modified:", res.modified_count)

res = products.update_many({"tags": "electronics"}, {"$inc": {"price": -100}})
print("discounted:", res.modified_count)

res = products.update_one({"name": "Stapler"}, {"$set": {"price": 120}}, upsert=True)
print("upserted new id:", res.upserted_id is not None)

res = products.delete_many({"price": {"$lt": 70}})
print("deleted:", res.deleted_count)
print(sorted(p["name"] for p in products.find()))`,
        output: `matched: 1 modified: 1
discounted: 2
upserted new id: True
deleted: 2
['Headphones', 'Mouse', 'Stapler']`,
        runnable: false,
      },
      {
        caption: 'Indexes and the aggregation pipeline',
        code: `from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError

db = MongoClient("mongodb://localhost:27017/")["shop"]
orders = db["orders"]
orders.drop()

orders.create_index([("order_no", ASCENDING)], unique=True)
orders.insert_many([
    {"order_no": 1, "city": "Pune", "total": 1200},
    {"order_no": 2, "city": "Mumbai", "total": 800},
    {"order_no": 3, "city": "Pune", "total": 450},
    {"order_no": 4, "city": "Mumbai", "total": 2300},
])
try:
    orders.insert_one({"order_no": 1, "city": "Delhi", "total": 99})
except DuplicateKeyError:
    print("order_no 1 already exists")

pipeline = [
    {"$match": {"total": {"$gte": 500}}},
    {"$group": {"_id": "$city", "orders": {"$sum": 1}, "revenue": {"$sum": "$total"}}},
    {"$sort": {"revenue": -1}},
]
for row in orders.aggregate(pipeline):
    print(row)`,
        output: `order_no 1 already exists
{'_id': 'Mumbai', 'orders': 2, 'revenue': 3100}
{'_id': 'Pune', 'orders': 1, 'revenue': 1200}`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Expecting schema enforcement by default — MongoDB accepts documents with typos in field names unless you add validation.',
      'Forgetting $set in an update and accidentally trying to replace the whole document.',
      'Querying large collections on fields without an index.',
      'Printing ObjectId values and comparing them with strings — convert with str() or ObjectId().',
      'Building queries from raw user input objects, which allows operator injection (e.g. {"$ne": null}).',
    ],
    keyPoints: [
      'MongoDB stores documents (dicts) in collections; PyMongo is the official driver.',
      'insert_one/insert_many, find/find_one, update_one/update_many, delete_one/delete_many.',
      'Queries and updates are dicts with operators such as $gt, $in, $set, $inc and $push.',
      'Indexes speed up queries and can enforce uniqueness.',
      'The aggregation pipeline ($match, $group, $sort, $lookup) handles reporting and joins.',
    ],
  },
}
