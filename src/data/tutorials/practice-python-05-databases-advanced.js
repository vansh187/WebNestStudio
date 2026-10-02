// Practice blocks for the Python Database Connectivity and Advanced Language Features
// modules. Merged onto the lesson entries in index.js by slug, so the lesson prose files
// stay unchanged.
// The sqlite3 exercises use an in-memory database. The MySQL, PostgreSQL and MongoDB
// exercises need a running server, so their prompts describe the result in words.
export const practicePythonDatabasesAdvanced = {
  'database-connectivity-with-sqlite3': {
    whyItMatters: `Almost every application stores its data in a database, and Python talks to all the common ones through the same pattern: connect, get a cursor, execute SQL, fetch results, commit. <code>sqlite3</code> ships with Python and needs no server, so it is the easiest place to learn that pattern before applying it to MySQL or PostgreSQL.`,
    exercise: {
      prompt: `Using an in-memory SQLite database, create a <code>users</code> table, insert two users with placeholders, and print the number of rows and then the names in alphabetical order.

Expected output: <code>2</code> then <code>[('Asha',), ('Ravi',)]</code>`,
      starterCode: `import sqlite3

connection = sqlite3.connect(":memory:")
cursor = connection.cursor()

# TODO: create the table users(id INTEGER PRIMARY KEY, name TEXT)
# TODO: insert "Ravi" and "Asha" using ? placeholders, then commit

# TODO: print the number of rows
# TODO: print all names, ordered by name

connection.close()`,
      hints: [
        '<code>cursor.executemany("INSERT INTO users (name) VALUES (?)", [("Ravi",), ("Asha",)])</code> inserts both rows.',
        '<code>fetchone()[0]</code> reads a single value such as a count, and <code>fetchall()</code> returns a list of tuples.',
      ],
      solution: `import sqlite3

connection = sqlite3.connect(":memory:")
cursor = connection.cursor()

cursor.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
cursor.executemany("INSERT INTO users (name) VALUES (?)", [("Ravi",), ("Asha",)])
connection.commit()

cursor.execute("SELECT COUNT(*) FROM users")
print(cursor.fetchone()[0])

cursor.execute("SELECT name FROM users ORDER BY name")
print(cursor.fetchall())

connection.close()`,
    },
    quiz: [
      {
        question: 'Which placeholder does <code>sqlite3</code> use for values in a query?',
        options: ['%s', '?', '$1', '{}'],
        answer: 1,
        explanation: 'Named placeholders such as :name are also supported.',
      },
      {
        question: 'What does <code>sqlite3.connect(":memory:")</code> create?',
        options: ['A file named :memory:', 'A connection to a server', 'A temporary database held in RAM that disappears when the connection closes', 'A read-only database'],
        answer: 2,
        explanation: 'It is convenient for tests and examples.',
      },
      {
        question: 'What must be done after an INSERT for the change to be saved?',
        options: ['Nothing', 'Close the cursor', 'Call connection.commit()', 'Call cursor.save()'],
        answer: 2,
        explanation: 'Uncommitted changes are lost when the connection closes.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the Python DB-API?',
        answer: `It is a standard, defined in PEP 249, that database drivers follow, so that code for different databases looks the same. A driver provides <code>connect()</code>, which returns a connection; the connection provides <code>cursor()</code>, <code>commit()</code> and <code>rollback()</code>; and the cursor provides <code>execute()</code>, <code>executemany()</code> and the <code>fetch</code> methods. <code>sqlite3</code>, <code>mysql-connector</code> and <code>psycopg</code> all follow it.`,
      },
      {
        question: 'Why must values be passed with placeholders and not put into the SQL string?',
        answer: `When values are formatted into the string, text supplied by a user becomes part of the SQL and can change the meaning of the statement, which is SQL injection. With placeholders the driver sends the statement and the values separately, so a value is always treated as data. Placeholders also deal with quoting and type conversion correctly.`,
      },
    ],
  },

  'crud-operations-with-sqlite3': {
    whyItMatters: `Create, read, update and delete are the four operations behind almost every screen of an application: sign up, view a profile, edit it, remove it. Writing them as small, safe functions is the core of back-end work, and it is the same whether you later use raw SQL, an ORM or a web framework.`,
    exercise: {
      prompt: `Complete the three functions for a <code>products</code> table. The program adds two products, changes the price of the first, deletes the second and prints how many rows the delete removed, followed by the rows that remain.

Expected output: <code>1</code> then <code>[(1, 'pen', 12)]</code>`,
      starterCode: `import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER)")


def add_product(name, price):
    # TODO: insert a row and return its new id
    pass


def update_price(product_id, price):
    # TODO: change the price of one product
    pass


def delete_product(product_id):
    # TODO: delete one product and return how many rows were removed
    pass


pen_id = add_product("pen", 10)
book_id = add_product("book", 50)
update_price(pen_id, 12)
print(delete_product(book_id))
print(connection.execute("SELECT id, name, price FROM products").fetchall())`,
      hints: [
        'The cursor returned by <code>connection.execute(...)</code> has <code>lastrowid</code> after an INSERT and <code>rowcount</code> after an UPDATE or DELETE.',
        'Always include a <code>WHERE id = ?</code> clause in an UPDATE or DELETE, and commit after each change.',
      ],
      solution: `import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER)")


def add_product(name, price):
    cursor = connection.execute("INSERT INTO products (name, price) VALUES (?, ?)", (name, price))
    connection.commit()
    return cursor.lastrowid


def update_price(product_id, price):
    connection.execute("UPDATE products SET price = ? WHERE id = ?", (price, product_id))
    connection.commit()


def delete_product(product_id):
    cursor = connection.execute("DELETE FROM products WHERE id = ?", (product_id,))
    connection.commit()
    return cursor.rowcount


pen_id = add_product("pen", 10)
book_id = add_product("book", 50)
update_price(pen_id, 12)
print(delete_product(book_id))
print(connection.execute("SELECT id, name, price FROM products").fetchall())`,
    },
    quiz: [
      {
        question: 'Which SQL statements correspond to create, read, update and delete?',
        options: ['INSERT, SELECT, UPDATE, DELETE', 'CREATE, READ, UPDATE, DROP', 'ADD, GET, SET, REMOVE', 'INSERT, FETCH, ALTER, DELETE'],
        answer: 0,
        explanation: 'These four statements work on the rows of a table.',
      },
      {
        question: 'What does an UPDATE statement with no WHERE clause do?',
        options: ['Nothing', 'Changes every row in the table', 'Raises an error', 'Changes only the first row'],
        answer: 1,
        explanation: 'The same is true of DELETE. Always check the WHERE clause.',
      },
      {
        question: 'Can a placeholder be used for a column name, for example in ORDER BY?',
        options: ['Yes', 'Only in SQLite', 'No; placeholders are only for values, so the column must be checked against a list of allowed names', 'Only for numeric columns'],
        answer: 2,
        explanation: 'Checking against a fixed list of names is called whitelisting.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between fetchone(), fetchmany() and fetchall()?',
        answer: `<code>fetchone()</code> returns the next row, or <code>None</code> when there are no more. <code>fetchmany(n)</code> returns the next <code>n</code> rows as a list. <code>fetchall()</code> returns all remaining rows as a list, which can use a great deal of memory for a large result. A cursor can also be looped over directly, which reads the rows one at a time.`,
      },
      {
        question: 'How do you let a user choose the column to sort by without risking SQL injection?',
        answer: `A column name cannot be passed as a placeholder, so it must be put into the SQL text. To do that safely, compare the user's choice with a fixed set of permitted column names and use it only if it is in that set, falling back to a default otherwise. The user's text itself is never inserted into the query.`,
      },
    ],
  },

  'transactions-and-sql-injection': {
    whyItMatters: `SQL injection has been among the most damaging web vulnerabilities for decades, and it is prevented by one habit. Transactions matter just as much: a money transfer that takes from one account and then fails before adding to the other must leave no trace. Both topics are asked about in almost every back-end interview.`,
    exercise: {
      prompt: `Complete <code>transfer</code> so that both updates happen inside one transaction. If the source account does not have enough money, raise <code>ValueError</code>, and the update already made to the target account must be undone. The program attempts a transfer that is too large and then prints the balances, which must be unchanged.

Expected output: <code>transfer failed</code> then <code>[('A', 100), ('B', 50)]</code>`,
      starterCode: `import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER)")
connection.executemany("INSERT INTO accounts VALUES (?, ?)", [("A", 100), ("B", 50)])
connection.commit()


def transfer(source, target, amount):
    # TODO: inside "with connection:", add the amount to the target account,
    #       then read the source balance and raise ValueError if it is too small,
    #       then subtract the amount from the source account
    pass


try:
    transfer("A", "B", 500)
except ValueError:
    print("transfer failed")

print(connection.execute("SELECT name, balance FROM accounts ORDER BY name").fetchall())`,
      hints: [
        'Used as a context manager, a connection commits when the block ends normally and rolls back when the block raises an exception.',
        'Because the exception is raised inside the block, the earlier update to the target account is rolled back with it.',
      ],
      solution: `import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER)")
connection.executemany("INSERT INTO accounts VALUES (?, ?)", [("A", 100), ("B", 50)])
connection.commit()


def transfer(source, target, amount):
    with connection:
        connection.execute("UPDATE accounts SET balance = balance + ? WHERE name = ?", (amount, target))
        balance = connection.execute("SELECT balance FROM accounts WHERE name = ?", (source,)).fetchone()[0]
        if balance < amount:
            raise ValueError("insufficient funds")
        connection.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", (amount, source))


try:
    transfer("A", "B", 500)
except ValueError:
    print("transfer failed")

print(connection.execute("SELECT name, balance FROM accounts ORDER BY name").fetchall())`,
    },
    quiz: [
      {
        question: 'What makes a query vulnerable to SQL injection?',
        options: ['Using SELECT *', 'Not closing the connection', 'Using placeholders', 'Building the SQL text by inserting user input into the string'],
        answer: 3,
        explanation: 'The input can then end the intended statement and add SQL of its own.',
      },
      {
        question: 'What does the A in ACID stand for, and what does it mean?',
        options: ['Atomicity: all the changes in a transaction happen, or none do', 'Availability: the database is always online', 'Accuracy: values are rounded correctly', 'Authorisation: users must log in'],
        answer: 0,
        explanation: 'The other letters are consistency, isolation and durability.',
      },
      {
        question: 'What does <code>with connection:</code> do in sqlite3?',
        options: ['Closes the connection at the end', 'Commits if the block succeeds and rolls back if it raises; the connection stays open', 'Opens a new database', 'Locks the file permanently'],
        answer: 1,
        explanation: 'The connection must still be closed separately.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is SQL injection and how do you prevent it?',
        answer: `It is an attack in which input supplied by a user is interpreted as part of an SQL statement, because the program built the statement by joining strings. An attacker can then read or change data they should not reach, for example by entering <code>' OR '1'='1</code> as a password. The prevention is to use parameterised queries, where values are passed separately from the SQL, and never to format user input into a query.`,
      },
      {
        question: 'What is a transaction?',
        answer: `A transaction is a group of statements treated as a single unit: either all of them take effect, on commit, or none do, on rollback. It keeps the data consistent when an operation involves several changes that belong together, such as debiting one account and crediting another, and it isolates those changes from other users until they are committed.`,
      },
    ],
  },

  'connecting-to-mysql': {
    whyItMatters: `MySQL is one of the most widely deployed databases for web applications, and a Python service that reports on or updates an existing MySQL database is a common first job. The code follows the same DB-API pattern as <code>sqlite3</code>, with a few differences that cause errors if you do not know them.`,
    exercise: {
      prompt: `Using <code>mysql-connector-python</code>, insert a user into a <code>users(id, name, email)</code> table and read that user back by email. This needs a running MySQL server with a <code>shop</code> database, so replace the connection details with your own. When it works, the program prints a tuple containing the new user's id and name.`,
      starterCode: `import mysql.connector

connection = mysql.connector.connect(
    host="localhost", user="app", password="secret", database="shop"
)
cursor = connection.cursor()

# TODO: insert ("Asha", "asha@example.com") using placeholders, then commit

# TODO: select id and name for that email, and print the row

cursor.close()
connection.close()`,
      hints: [
        'MySQL drivers use <code>%s</code> as the placeholder for every type, not <code>?</code>.',
        'The values are still passed as a separate tuple; a single value needs a trailing comma: <code>("asha@example.com",)</code>.',
      ],
      solution: `import mysql.connector

connection = mysql.connector.connect(
    host="localhost", user="app", password="secret", database="shop"
)
cursor = connection.cursor()

cursor.execute(
    "INSERT INTO users (name, email) VALUES (%s, %s)",
    ("Asha", "asha@example.com"),
)
connection.commit()

cursor.execute("SELECT id, name FROM users WHERE email = %s", ("asha@example.com",))
print(cursor.fetchone())

cursor.close()
connection.close()`,
    },
    quiz: [
      {
        question: 'Which placeholder do the MySQL drivers use?',
        options: ['?', ':1', '%s', '@p'],
        answer: 2,
        explanation: 'It is %s for every type. It is not Python string formatting; the values are passed separately.',
      },
      {
        question: 'What is the main reason to use a connection pool in a web application?',
        options: ['To encrypt the data', 'To avoid writing SQL', 'To store query results', 'Opening a connection is slow, so a set of open connections is reused across requests'],
        answer: 3,
        explanation: 'A pool also limits how many connections the application can open.',
      },
      {
        question: 'How does MySQL differ from SQLite in the way it runs?',
        options: ['MySQL is a separate server that the program connects to with a host, user and password', 'MySQL is a file in the project folder', 'MySQL has no tables', 'MySQL cannot be used from Python'],
        answer: 0,
        explanation: 'SQLite is a library that reads and writes one local file.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you connect to MySQL from Python?',
        answer: `Install a driver such as <code>mysql-connector-python</code> or <code>PyMySQL</code>, call its <code>connect()</code> function with the host, user, password and database name, and then use a cursor to execute statements with <code>%s</code> placeholders. Changes must be committed. Credentials should come from environment variables or configuration, never from the source code.`,
      },
      {
        question: 'What is a connection pool?',
        answer: `A pool keeps a number of database connections open and lends one to each piece of code that needs it, taking it back afterwards. Establishing a connection involves a network handshake and authentication, so reusing connections is much faster than opening one per request, and the pool's size limit protects the database from being overloaded.`,
      },
    ],
  },

  'connecting-to-postgresql': {
    whyItMatters: `PostgreSQL is the default choice for new projects in much of the industry, valued for its reliability and its features such as JSON columns and arrays. <code>psycopg</code> is the standard driver, and it is what sits underneath SQLAlchemy and Django when they talk to PostgreSQL.`,
    exercise: {
      prompt: `Using <code>psycopg</code> (version 3), insert a row into a <code>users(id SERIAL PRIMARY KEY, name TEXT)</code> table and get the generated id back with <code>RETURNING</code>, then read the name for that id. This needs a running PostgreSQL server, so replace the connection string with your own. When it works, the program prints <code>Asha</code>.`,
      starterCode: `import psycopg

with psycopg.connect("dbname=shop user=app password=secret host=localhost") as connection:
    with connection.cursor() as cursor:
        # TODO: insert "Asha" and fetch the id produced by RETURNING id

        # TODO: select the name for that id and print it
        pass`,
      hints: [
        'Add <code>RETURNING id</code> to the INSERT, then call <code>cursor.fetchone()[0]</code>.',
        'The placeholder is <code>%s</code>. Leaving the <code>with</code> block commits the transaction.',
      ],
      solution: `import psycopg

with psycopg.connect("dbname=shop user=app password=secret host=localhost") as connection:
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO users (name) VALUES (%s) RETURNING id", ("Asha",))
        new_id = cursor.fetchone()[0]

        cursor.execute("SELECT name FROM users WHERE id = %s", (new_id,))
        print(cursor.fetchone()[0])`,
    },
    quiz: [
      {
        question: 'What does <code>RETURNING id</code> at the end of an INSERT do in PostgreSQL?',
        options: ['Rolls back the insert', 'Returns the id of the inserted row as a result', 'Renames the column', 'Checks whether the id exists'],
        answer: 1,
        explanation: 'It avoids a second query to find the generated key.',
      },
      {
        question: 'What happens when a psycopg 3 connection used in a <code>with</code> block exits without an error?',
        options: ['The transaction is committed and the connection is closed', 'The transaction is rolled back', 'Nothing', 'The database is dropped'],
        answer: 0,
        explanation: 'If the block raises an exception, the transaction is rolled back instead.',
      },
      {
        question: 'How does psycopg return a PostgreSQL <code>JSONB</code> value to Python?',
        options: ['As a string that must be parsed', 'It cannot be read', 'As bytes', 'As a Python dict or list'],
        answer: 3,
        explanation: 'PostgreSQL arrays likewise become Python lists.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you connect to PostgreSQL from Python?',
        answer: `With the <code>psycopg</code> driver. <code>psycopg.connect()</code> takes a connection string or keyword arguments and returns a connection; statements are run through a cursor with <code>%s</code> placeholders. Using the connection and cursor as context managers commits or rolls back and releases them automatically. Web applications use a connection pool from <code>psycopg_pool</code>.`,
      },
      {
        question: 'Why choose PostgreSQL over SQLite for a web application?',
        answer: `SQLite is a single file with one writer at a time, which suits local tools, tests and small sites. PostgreSQL is a server built for many simultaneous users: it handles concurrent writes, has user accounts and permissions, supports replication and backups while running, and offers richer types and indexing. It is the appropriate choice once several users or several application servers share the data.`,
      },
    ],
  },

  'sqlalchemy-orm': {
    whyItMatters: `Most Python applications do not write SQL by hand for every query. An ORM maps tables to classes and rows to objects, so data is handled as ordinary Python objects, and the same code runs on different databases. SQLAlchemy is the standard ORM outside Django and is the usual partner of FastAPI and Flask.`,
    exercise: {
      prompt: `Using SQLAlchemy 2, which must be installed with <code>pip install sqlalchemy</code>, define a <code>User</code> model, create its table in an in-memory SQLite database, add two users, and print their names in alphabetical order.

Expected output: <code>['Asha', 'Ravi']</code>`,
      starterCode: `from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column


class Base(DeclarativeBase):
    pass


# TODO: class User(Base) with __tablename__ "users", an integer primary key id
#       and a name column


engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    # TODO: add users named "Ravi" and "Asha", and commit
    # TODO: select the names ordered by name, and print them as a list
    pass`,
      hints: [
        'Columns are declared as <code>id: Mapped[int] = mapped_column(primary_key=True)</code>.',
        '<code>session.scalars(select(User.name).order_by(User.name)).all()</code> returns a list of the names.',
      ],
      solution: `from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))


engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add_all([User(name="Ravi"), User(name="Asha")])
    session.commit()

    names = session.scalars(select(User.name).order_by(User.name)).all()
    print(names)`,
    },
    quiz: [
      {
        question: 'What does an ORM do?',
        options: ['Maps database tables to classes and rows to objects', 'Replaces the database', 'Encrypts the data', 'Speeds up every query'],
        answer: 0,
        explanation: 'It generates the SQL from operations on objects.',
      },
      {
        question: 'In SQLAlchemy, which object tracks changes to objects and sends them to the database?',
        options: ['The Engine', 'The Session', 'The Model', 'The Metadata'],
        answer: 1,
        explanation: 'The engine manages connections; the session is the unit of work.',
      },
      {
        question: 'What is Alembic used for?',
        options: ['Testing queries', 'Connection pooling', 'Database schema migrations', 'Caching results'],
        answer: 2,
        explanation: 'It records each change to the schema as a versioned script that can be applied or reversed.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the advantages and disadvantages of an ORM?',
        answer: `Advantages: less repetitive SQL, queries built from Python objects, protection against SQL injection by default, the same code working across databases, and relationships between tables available as attributes. Disadvantages: it hides what SQL is actually run, so inefficient queries are easy to write without noticing; complex queries can be harder to express; and there is some overhead. Knowing SQL remains necessary.`,
      },
      {
        question: 'What is the N+1 query problem?',
        answer: `It happens when code loads a list of N objects with one query and then touches a related attribute on each, causing one more query per object: N+1 queries where one or two would do. It is slow and easy to miss, because the code looks innocent. The fix is to load the related data up front, in SQLAlchemy with options such as <code>selectinload</code> or <code>joinedload</code>.`,
      },
    ],
  },

  'mongodb-with-pymongo': {
    whyItMatters: `Not all data fits neatly into tables. MongoDB stores documents that look like Python dictionaries and may differ from one another, which suits product catalogues, logs and content. It is the most widely used document database, and working with it from Python uses dictionaries for both the data and the queries.`,
    exercise: {
      prompt: `Using <code>pymongo</code>, insert two products into a <code>products</code> collection, print the names of the products that cost more than 100, and then raise the price of the pen to 15. This needs a running MongoDB server. When it works, the program prints <code>{'name': 'bag'}</code>.`,
      starterCode: `from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
products = client["shop"]["products"]

# TODO: insert {"name": "pen", "price": 12} and {"name": "bag", "price": 450}

# TODO: find the products with a price greater than 100, returning only the name,
#       and print each document

# TODO: set the price of the pen to 15`,
      hints: [
        'A comparison is written as a nested dictionary: <code>{"price": {"$gt": 100}}</code>.',
        'The second argument of <code>find</code> chooses the fields: <code>{"_id": 0, "name": 1}</code>. An update uses <code>{"$set": {...}}</code>.',
      ],
      solution: `from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
products = client["shop"]["products"]

products.insert_many([
    {"name": "pen", "price": 12},
    {"name": "bag", "price": 450},
])

for document in products.find({"price": {"$gt": 100}}, {"_id": 0, "name": 1}):
    print(document)

products.update_one({"name": "pen"}, {"$set": {"price": 15}})`,
    },
    quiz: [
      {
        question: 'What is the MongoDB equivalent of a table?',
        options: ['A document', 'A cluster', 'A field', 'A collection'],
        answer: 3,
        explanation: 'A collection holds documents, which correspond roughly to rows.',
      },
      {
        question: 'What does <code>update_one(filter, {"$set": {"price": 15}})</code> change?',
        options: ['Only the price field of the first matching document', 'It replaces the whole document', 'Every document', 'Nothing unless upsert is set'],
        answer: 0,
        explanation: 'Without $set, the second argument would be rejected or would replace the document, depending on the method.',
      },
      {
        question: 'Which field does MongoDB add to every document that has none?',
        options: ['id', '_id', 'key', 'uuid'],
        answer: 1,
        explanation: 'It is the primary key, an ObjectId by default.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between SQL and NoSQL document databases?',
        answer: `A relational database stores rows in tables with a fixed schema and relates tables through keys and joins, with strong transactional guarantees. A document database such as MongoDB stores self-contained documents whose structure can vary, often embedding related data inside the document, which avoids joins and makes it easy to scale across servers. Relational databases suit highly related, consistent data; document databases suit flexible or nested data that is read as a whole.`,
      },
      {
        question: 'When should related data be embedded in a document and when referenced?',
        answer: `Embed data that belongs to the parent, is read together with it and is limited in size, such as the address of an order. Reference data, by storing its id, when it is shared by many documents, changes independently or can grow without limit, such as the customer of an order or the comments on a popular post. The decision is driven by how the application reads the data.`,
      },
    ],
  },

  'iterators-generators': {
    whyItMatters: `Every <code>for</code> loop in Python uses an iterator, and generators are the easy way to write one. A generator produces values one at a time and keeps nothing in memory, so it can process a file of any size or an endless stream. They are used throughout the standard library and are a favourite interview topic.`,
    exercise: {
      prompt: `Write two generator functions. <code>evens(limit)</code> yields the even numbers below the limit, and <code>countdown(n)</code> yields n, n-1, ... down to 1. The program prints the evens below 10, then takes one value from a countdown with <code>next</code>, then prints what is left.

Expected output: <code>[0, 2, 4, 6, 8]</code>, <code>3</code>, <code>[2, 1]</code> (one per line)`,
      starterCode: `def evens(limit):
    # TODO: yield each even number below limit
    pass


def countdown(n):
    # TODO: yield n, n - 1, ... 1
    pass


print(list(evens(10)))

timer = countdown(3)
print(next(timer))
print(list(timer))`,
      hints: [
        'A function becomes a generator as soon as its body contains <code>yield</code>.',
        'A generator remembers where it stopped, so <code>list(timer)</code> gives only the values not yet taken.',
      ],
      solution: `def evens(limit):
    for number in range(0, limit, 2):
        yield number


def countdown(n):
    while n > 0:
        yield n
        n -= 1


print(list(evens(10)))

timer = countdown(3)
print(next(timer))
print(list(timer))`,
    },
    quiz: [
      {
        question: 'Which exception signals that an iterator has no more values?',
        options: ['IndexError', 'EOFError', 'StopIteration', 'ValueError'],
        answer: 2,
        explanation: 'A for loop catches it automatically and ends.',
      },
      {
        question: 'A generator has been looped over completely. What does a second loop over the same generator produce?',
        options: ['The same values again', 'Nothing; a generator can be consumed only once', 'An error', 'The values in reverse'],
        answer: 1,
        explanation: 'Call the generator function again to get a fresh generator.',
      },
      {
        question: 'What is the main advantage of a generator over building a list?',
        options: ['It is always faster', 'It can be sorted in place', 'It can be indexed', 'Values are produced one at a time, so memory use stays small'],
        answer: 3,
        explanation: 'A list of a million items occupies memory for all of them; a generator holds one at a time.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between an iterable and an iterator?',
        answer: `An iterable is any object that can be looped over, such as a list, string or dictionary; it has an <code>__iter__</code> method that returns an iterator. An iterator is the object that does the stepping: it has a <code>__next__</code> method that returns the next value and raises <code>StopIteration</code> at the end. A list can be iterated many times, each time with a new iterator; an iterator is used up as it goes.`,
      },
      {
        question: 'What is the difference between yield and return?',
        answer: `<code>return</code> ends the function and hands back one value. <code>yield</code> hands back a value and pauses the function, keeping its local variables; the next request resumes it from the line after the <code>yield</code>. A function containing <code>yield</code> returns a generator when called and runs none of its body until the first value is requested.`,
      },
    ],
  },

  'decorators': {
    whyItMatters: `Decorators are everywhere in Python frameworks: <code>@app.get("/")</code> in FastAPI, <code>@pytest.fixture</code>, <code>@property</code>, <code>@login_required</code> in Django. They add behaviour such as logging, timing, caching or access checks to a function without touching its code. You cannot read modern Python without understanding the <code>@</code> line.`,
    exercise: {
      prompt: `Write a decorator <code>shout</code> that converts the text returned by a function to upper case. Use <code>functools.wraps</code> so that the decorated function keeps its original name.

Expected output: <code>HELLO, ASHA</code> then <code>greet</code>`,
      starterCode: `from functools import wraps


def shout(function):
    # TODO: define a wrapper that calls the function and returns the result in upper case
    # TODO: return the wrapper
    pass


@shout
def greet(name):
    return f"Hello, {name}"


print(greet("asha"))
print(greet.__name__)`,
      hints: [
        'The wrapper should accept <code>*args, **kwargs</code> and pass them on, so the decorator works with any function.',
        'Put <code>@wraps(function)</code> directly above the wrapper definition.',
      ],
      solution: `from functools import wraps


def shout(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        return function(*args, **kwargs).upper()

    return wrapper


@shout
def greet(name):
    return f"Hello, {name}"


print(greet("asha"))
print(greet.__name__)`,
    },
    quiz: [
      {
        question: 'What is <code>@timer</code> above <code>def work():</code> equivalent to?',
        options: ['work = timer(work)', 'timer.work()', 'timer = work', 'work(timer)'],
        answer: 0,
        explanation: 'The function is passed to the decorator and the name is rebound to what the decorator returns.',
      },
      {
        question: 'What does <code>functools.wraps</code> preserve?',
        options: ['The speed of the function', 'The name, docstring and other metadata of the original function', 'The return value', 'The arguments'],
        answer: 1,
        explanation: 'Without it, the decorated function reports the name of the wrapper.',
      },
      {
        question: 'When does the code of a decorator, outside its wrapper, run?',
        options: ['Each time the decorated function is called', 'Never', 'Once, when the decorated function is defined', 'When the program ends'],
        answer: 2,
        explanation: 'Only the wrapper runs on each call.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a decorator?',
        answer: `A decorator is a function that takes a function and returns another function, usually a wrapper that runs some code before or after calling the original. The <code>@name</code> syntax applies it at the point of definition. It works because functions are objects that can be passed around and because the wrapper is a closure that remembers the original function.`,
      },
      {
        question: 'How do you write a decorator that takes arguments, such as @retry(times=3)?',
        answer: `Add one more level. The outer function receives the arguments and returns the actual decorator; the decorator receives the function and returns the wrapper. So <code>retry(times=3)</code> is called first, and its result is then applied to the function. That makes three nested functions: one for the arguments, one for the function, and the wrapper.`,
      },
    ],
  },

  'type-hints': {
    whyItMatters: `Type hints state what a function expects and returns, and tools check them before the code runs. They catch a whole class of mistakes while you type, power the autocompletion in your editor, and are required by FastAPI and Pydantic, which read them to validate data. Most professional Python code written today is annotated.`,
    exercise: {
      prompt: `Add type hints to both functions. <code>find_user</code> takes a dictionary from <code>int</code> to <code>str</code> and an <code>int</code>, and returns a <code>str</code> or <code>None</code>. <code>double</code> takes and returns an <code>int</code>. The last line shows that Python itself does not enforce the hints.

Expected output: <code>Asha</code>, <code>None</code>, <code>abab</code> (one per line)`,
      starterCode: `# TODO: add type hints to the parameters and the return value
def find_user(users, user_id):
    return users.get(user_id)


# TODO: add type hints
def double(value):
    return value * 2


print(find_user({1: "Asha"}, 1))
print(find_user({1: "Asha"}, 2))
print(double("ab"))  # a type checker would report this call; Python runs it`,
      hints: [
        'A dictionary type is written <code>dict[int, str]</code>, and "str or None" is written <code>str | None</code>.',
        'The return type follows an arrow after the parameter list: <code>def f(x: int) -&gt; int:</code>.',
      ],
      solution: `def find_user(users: dict[int, str], user_id: int) -> str | None:
    return users.get(user_id)


def double(value: int) -> int:
    return value * 2


print(find_user({1: "Asha"}, 1))
print(find_user({1: "Asha"}, 2))
print(double("ab"))  # a type checker would report this call; Python runs it`,
    },
    quiz: [
      {
        question: 'Does Python check type hints when the program runs?',
        options: ['Yes, and it raises TypeError', 'Only in strict mode', 'Only for function parameters', 'No; they are checked by separate tools such as mypy'],
        answer: 3,
        explanation: 'The interpreter stores the hints but does not enforce them.',
      },
      {
        question: 'What does <code>Optional[str]</code> mean?',
        options: ['The value is a str or None', 'The parameter can be omitted', 'The value can be of any type', 'The string may be empty'],
        answer: 0,
        explanation: 'It is the same as str | None. It says nothing about whether an argument has a default.',
      },
      {
        question: 'How is "a list of integers" written as a type hint in current Python?',
        options: ['list(int)', 'list[int]', 'List<int>', 'int[]'],
        answer: 1,
        explanation: 'Built-in collection types have accepted square brackets since Python 3.9.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the benefits of type hints?',
        answer: `They document what a function takes and returns in a form that tools can verify. A type checker such as mypy or Pyright finds mismatched types, missing <code>None</code> checks and misspelled attributes without running the code. Editors use them for autocompletion and safe refactoring, and libraries such as Pydantic and FastAPI use them at runtime to validate and convert data.`,
      },
      {
        question: 'Are type hints enforced at runtime?',
        answer: `No. Python stores them in <code>__annotations__</code> and otherwise ignores them, so passing a string where an <code>int</code> is annotated raises no error by itself. Enforcement comes from running a static checker, or from libraries that read the annotations and validate values, as Pydantic does. Python remains dynamically typed.`,
      },
    ],
  },

  'itertools-and-functools': {
    whyItMatters: `These two modules are the standard toolkit for working with iterables and functions. <code>lru_cache</code> can turn a slow recursive function into a fast one with a single line, <code>partial</code> fixes some of a function's arguments, and the <code>itertools</code> functions replace many hand-written loops with tested, memory-efficient code.`,
    exercise: {
      prompt: `Use <code>chain</code> and <code>islice</code> to print the first three items of two lists joined together. Use <code>partial</code> to create a <code>square</code> function from <code>power</code>. Add <code>lru_cache</code> to <code>fib</code> so that <code>fib(30)</code> is computed quickly.

Expected output: <code>[1, 2, 3]</code>, <code>25</code>, <code>832040</code> (one per line)`,
      starterCode: `from functools import lru_cache, partial
from itertools import chain, islice

# TODO: print the first three items of [1, 2] followed by [3, 4]


def power(base, exponent):
    return base ** exponent


# TODO: create square from power using partial, and print square(5)


# TODO: add a cache to this function
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)


print(fib(30))`,
      hints: [
        '<code>islice(chain(a, b), 3)</code> yields the first three items; wrap it in <code>list()</code>.',
        '<code>partial(power, exponent=2)</code> returns a function that needs only the base. The cache is added with <code>@lru_cache(maxsize=None)</code>.',
      ],
      solution: `from functools import lru_cache, partial
from itertools import chain, islice

print(list(islice(chain([1, 2], [3, 4]), 3)))


def power(base, exponent):
    return base ** exponent


square = partial(power, exponent=2)
print(square(5))


@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)


print(fib(30))`,
    },
    quiz: [
      {
        question: 'What must be true of the data before <code>itertools.groupby</code> groups it correctly?',
        options: ['It must be a list', 'It must contain no duplicates', 'It must be sorted by the grouping key', 'It must be numeric'],
        answer: 2,
        explanation: 'groupby only groups items that are next to each other.',
      },
      {
        question: 'What restriction does <code>lru_cache</code> place on the arguments of the function?',
        options: ['They must be numbers', 'They must be strings', 'There must be exactly one', 'They must be hashable'],
        answer: 3,
        explanation: 'The arguments are used as a dictionary key, so a list argument raises TypeError.',
      },
      {
        question: 'What does <code>itertools.count(1)</code> produce?',
        options: ['An endless sequence 1, 2, 3, ...', 'The number 1', 'A list of one item', 'The number of items in an iterable'],
        answer: 0,
        explanation: 'It must be limited with islice, takewhile or a break.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What does functools.lru_cache do?',
        answer: `It wraps a function so that its results are stored by argument. A later call with the same arguments returns the stored result without running the function again. <code>maxsize</code> limits how many results are kept, discarding the least recently used. It suits functions that are pure, meaning the same input always gives the same output, and costly to compute.`,
      },
      {
        question: 'What is functools.partial used for?',
        answer: `It creates a new function from an existing one with some arguments already filled in. <code>partial(int, base=2)</code> is a function that parses binary strings. It is used to adapt a general function to a place that expects fewer arguments, such as a callback, and is often clearer than writing a lambda.`,
      },
    ],
  },

  'regular-expressions': {
    whyItMatters: `Validating an email address or phone number, pulling dates out of log lines and cleaning messy text are pattern-matching tasks. A regular expression describes the pattern in one line where string methods would need many. They are powerful and easy to get wrong, so knowing the basic syntax and the main functions of <code>re</code> matters.`,
    exercise: {
      prompt: `Find every email address in the text. Then check whether each of two strings is a valid six-digit PIN code that does not start with 0, printing both results on one line. Finally replace every digit in a phone message with <code>#</code>.

Expected output: <code>['asha@example.com', 'ravi@test.org']</code>, <code>True False</code>, <code>Call #####</code> (one per line)`,
      starterCode: `import re

text = "Contact asha@example.com or ravi@test.org today"
# TODO: print a list of the email addresses in text

# TODO: print whether "110001" and "012345" are valid PIN codes, on one line

# TODO: print "Call 98765" with every digit replaced by "#"`,
      hints: [
        '<code>re.findall(pattern, text)</code> returns all matches. A simple email pattern is <code>r"[\\w.+-]+@[\\w-]+\\.[\\w.]+"</code>.',
        '<code>re.fullmatch(r"[1-9]\\d{5}", value)</code> matches only if the whole string fits; <code>re.sub(r"\\d", "#", text)</code> replaces each digit.',
      ],
      solution: `import re

text = "Contact asha@example.com or ravi@test.org today"
print(re.findall(r"[\\w.+-]+@[\\w-]+\\.[\\w.]+", text))

pin = r"[1-9]\\d{5}"
print(bool(re.fullmatch(pin, "110001")), bool(re.fullmatch(pin, "012345")))

print(re.sub(r"\\d", "#", "Call 98765"))`,
    },
    quiz: [
      {
        question: 'What is the difference between <code>re.match</code> and <code>re.search</code>?',
        options: ['There is none', 'search looks only at the start', 'match looks only at the start of the string; search looks anywhere in it', 'match returns a list'],
        answer: 2,
        explanation: 'fullmatch requires the whole string to match the pattern.',
      },
      {
        question: 'Why are patterns written as raw strings, such as <code>r"\\d+"</code>?',
        options: ['They run faster', 'It is required by the re module', 'So that backslashes reach the regex engine unchanged', 'To allow Unicode'],
        answer: 2,
        explanation: 'In a normal string, Python would process the backslash sequences first.',
      },
      {
        question: 'What does the pattern <code>\\d{3}</code> match?',
        options: ['The letter d three times', 'Up to three digits', 'Three or more digits', 'Exactly three digits'],
        answer: 3,
        explanation: '\\d is a digit and {3} repeats it exactly three times.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between greedy and lazy matching?',
        answer: `A greedy quantifier such as <code>.*</code> matches as much as it can while still allowing the rest of the pattern to match. Adding <code>?</code> makes it lazy, <code>.*?</code>, so it matches as little as possible. Applied to <code>&lt;b&gt;one&lt;/b&gt;&lt;b&gt;two&lt;/b&gt;</code>, the pattern <code>&lt;b&gt;.*&lt;/b&gt;</code> matches the whole text, while <code>&lt;b&gt;.*?&lt;/b&gt;</code> matches each pair of tags separately.`,
      },
      {
        question: 'When should you compile a regular expression?',
        answer: `<code>re.compile(pattern)</code> returns a pattern object whose methods can be called repeatedly. It is worth doing when the same pattern is used many times, for example on every line of a file, and it also lets the pattern be given a name and defined in one place. The <code>re</code> module caches recently used patterns, so for occasional use the plain functions are fine.`,
      },
    ],
  },

  'date-and-time': {
    whyItMatters: `Deadlines, bookings, logs and reports all depend on handling dates and times correctly, and mistakes with time zones are a notorious source of bugs. The <code>datetime</code> module covers parsing, formatting and arithmetic, and the habits taught here, such as storing times in UTC, apply to every system you will build.`,
    exercise: {
      prompt: `Parse the text into a <code>datetime</code>. Print it in the form <code>02 Oct 2026</code>, then the name of its weekday, then the number of days from that date until 25 December 2026.

Expected output: <code>02 Oct 2026</code>, <code>Friday</code>, <code>84</code> (one per line)`,
      starterCode: `from datetime import date, datetime

text = "2026-10-02 14:30"

# TODO: parse text into a datetime
# TODO: print it as day, short month name and year
# TODO: print the full name of the weekday
# TODO: print the number of days until 25 December 2026`,
      hints: [
        'Parse with <code>datetime.strptime(text, "%Y-%m-%d %H:%M")</code>. Format with <code>strftime</code>: <code>%d %b %Y</code> and <code>%A</code>.',
        'Subtracting two <code>date</code> objects gives a <code>timedelta</code>, whose <code>days</code> attribute is the answer.',
      ],
      solution: `from datetime import date, datetime

text = "2026-10-02 14:30"

moment = datetime.strptime(text, "%Y-%m-%d %H:%M")
print(moment.strftime("%d %b %Y"))
print(moment.strftime("%A"))
print((date(2026, 12, 25) - moment.date()).days)`,
    },
    quiz: [
      {
        question: 'Which method converts a string to a <code>datetime</code>?',
        options: ['strptime', 'strftime', 'isoformat', 'timestamp'],
        answer: 0,
        explanation: 'strptime parses text; strftime formats a datetime as text.',
      },
      {
        question: 'What is the result of subtracting one <code>datetime</code> from another?',
        options: ['An int', 'A timedelta', 'A datetime', 'A string'],
        answer: 1,
        explanation: 'A timedelta holds a duration in days, seconds and microseconds.',
      },
      {
        question: 'What is a naive datetime?',
        options: ['One created from a string', 'One with no date', 'One with no time zone information', 'One in UTC'],
        answer: 2,
        explanation: 'A datetime that carries a time zone is called aware.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between naive and aware datetimes?',
        answer: `A naive datetime has no time zone attached, so it does not identify a particular moment; "14:30" could be anywhere. An aware datetime carries a <code>tzinfo</code> and so refers to one exact instant. The two cannot be compared or subtracted. Aware datetimes are created with <code>datetime.now(timezone.utc)</code> or with a zone from <code>zoneinfo</code>.`,
      },
      {
        question: 'How should an application store and display times for users in different time zones?',
        answer: `Store every moment in UTC, as an aware datetime, and convert to the user's time zone only when displaying it. UTC has no daylight-saving changes, so stored values are unambiguous and can be compared directly. Conversion for display uses <code>astimezone()</code> with the user's zone from the <code>zoneinfo</code> module.`,
      },
    ],
  },

  'async-programming-with-asyncio': {
    whyItMatters: `A web server spends most of its time waiting: for a database, another API or the network. With <code>asyncio</code> a single thread can handle thousands of such waits at once, which is how FastAPI serves many requests efficiently. The <code>async</code> and <code>await</code> keywords are now part of everyday Python web development.`,
    exercise: {
      prompt: `Write a coroutine <code>fetch</code> that waits for the given delay and then returns the name in upper case. In <code>main</code>, run two of them at the same time with <code>asyncio.gather</code> and print the list of results.

Expected output: <code>['A', 'B']</code>`,
      starterCode: `import asyncio


async def fetch(name, delay):
    # TODO: wait for "delay" seconds without blocking, then return the name in upper case
    pass


async def main():
    # TODO: run fetch("a", 0.02) and fetch("b", 0.01) concurrently and print the results
    pass


asyncio.run(main())`,
      hints: [
        'The non-blocking wait is <code>await asyncio.sleep(delay)</code>.',
        '<code>await asyncio.gather(first, second)</code> returns the results in the order the coroutines were passed, not the order they finished.',
      ],
      solution: `import asyncio


async def fetch(name, delay):
    await asyncio.sleep(delay)
    return name.upper()


async def main():
    results = await asyncio.gather(fetch("a", 0.02), fetch("b", 0.01))
    print(results)


asyncio.run(main())`,
    },
    quiz: [
      {
        question: 'What does calling an <code>async def</code> function, without <code>await</code>, return?',
        options: ['Its result', 'A coroutine object; the body has not run yet', 'None', 'A thread'],
        answer: 1,
        explanation: 'The coroutine runs when it is awaited or scheduled on the event loop.',
      },
      {
        question: 'What happens if <code>time.sleep(5)</code> is called inside a coroutine?',
        options: ['The whole event loop is blocked for five seconds', 'Only that coroutine pauses', 'It raises an error', 'It is converted to asyncio.sleep'],
        answer: 0,
        explanation: 'Blocking calls stop every task. Use await asyncio.sleep, or run blocking code in a thread.',
      },
      {
        question: 'For which kind of work does <code>asyncio</code> give no benefit?',
        options: ['Many network requests', 'Heavy calculations that keep the CPU busy', 'Reading from several sockets', 'Waiting for database queries'],
        answer: 1,
        explanation: 'There is one thread, so a long calculation blocks everything. Use processes for CPU-bound work.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the event loop?',
        answer: `The event loop is the scheduler at the centre of <code>asyncio</code>. It runs one task until that task reaches an <code>await</code> on something that is not ready, such as a network response, then switches to another task that can make progress. When the awaited operation completes, the first task is resumed. All of this happens on one thread, so tasks cooperate by yielding at <code>await</code> points.`,
      },
      {
        question: 'What is the difference between asyncio and multithreading?',
        answer: `Both handle many I/O waits concurrently. With threads, the operating system switches between them at any moment, so shared data needs locks. With <code>asyncio</code>, there is one thread and a task gives up control only at an <code>await</code>, which makes shared state easier to reason about and allows far more simultaneous tasks than threads. The cost is that every library used must be asynchronous, and a blocking call stalls everything.`,
      },
    ],
  },

  'multithreading': {
    whyItMatters: `Threads let a program do several slow things at once, such as downloading many files or calling several APIs, without waiting for each in turn. They also introduce race conditions, bugs that appear only occasionally and are hard to reproduce. Interviewers ask about the GIL to see whether you understand what threads can and cannot speed up in Python.`,
    exercise: {
      prompt: `Use a <code>ThreadPoolExecutor</code> to square three numbers and print the results. Then start four threads that each add 1 to a shared counter 1,000 times, protecting the counter with a <code>Lock</code>, and print the final count.

Expected output: <code>[1, 4, 9]</code> then <code>4000</code>`,
      starterCode: `import threading
from concurrent.futures import ThreadPoolExecutor


def square(number):
    return number * number


# TODO: use a ThreadPoolExecutor and its map method to square [1, 2, 3], and print the list

counter = 0
lock = threading.Lock()


def add_many():
    global counter
    for _ in range(1000):
        # TODO: increase counter while holding the lock
        pass


# TODO: start four threads running add_many, wait for them all, and print counter`,
      hints: [
        '<code>executor.map(square, [1, 2, 3])</code> returns the results in the order of the inputs.',
        '<code>with lock:</code> acquires the lock and releases it at the end of the block. Call <code>join()</code> on each thread before printing.',
      ],
      solution: `import threading
from concurrent.futures import ThreadPoolExecutor


def square(number):
    return number * number


with ThreadPoolExecutor(max_workers=3) as executor:
    print(list(executor.map(square, [1, 2, 3])))

counter = 0
lock = threading.Lock()


def add_many():
    global counter
    for _ in range(1000):
        with lock:
            counter += 1


threads = [threading.Thread(target=add_many) for _ in range(4)]
for thread in threads:
    thread.start()
for thread in threads:
    thread.join()

print(counter)`,
    },
    quiz: [
      {
        question: 'What does the GIL do in CPython?',
        options: ['Makes threads run on separate CPU cores', 'Prevents the use of threads', 'Allows only one thread to execute Python bytecode at a time', 'Encrypts memory'],
        answer: 2,
        explanation: 'Threads therefore do not speed up pure-Python calculations.',
      },
      {
        question: 'For which kind of task are threads useful in Python?',
        options: ['CPU-bound calculations', 'Only GUI programs', 'Neither', 'I/O-bound work such as network requests and file access'],
        answer: 3,
        explanation: 'A thread releases the GIL while it waits for I/O, letting other threads run.',
      },
      {
        question: 'What is a race condition?',
        options: ['A bug where the result depends on the timing of threads that access shared data', 'Two threads finishing at the same time', 'A thread that runs too quickly', 'A deadlock'],
        answer: 0,
        explanation: 'It is prevented by protecting the shared data with a lock.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the Global Interpreter Lock?',
        answer: `The GIL is a lock in the standard CPython interpreter that lets only one thread run Python bytecode at any moment. It keeps the interpreter's memory management simple and safe, but it means threads cannot run Python code in parallel on several cores. Threads still help with I/O-bound work, because the GIL is released during blocking I/O. For CPU-bound work, multiple processes are used; recent CPython versions also offer an optional build without the GIL.`,
      },
      {
        question: 'How do you prevent a race condition?',
        answer: `Make sure that only one thread at a time can read and modify the shared data, by wrapping that code in a <code>threading.Lock</code> used with a <code>with</code> statement. Better still, avoid sharing mutable state: pass data between threads through a <code>queue.Queue</code>, which is thread-safe, or have each thread return its result to be combined afterwards.`,
      },
    ],
  },

  'multiprocessing': {
    whyItMatters: `When the work is calculation, not waiting — resizing images, analysing data, running simulations — threads do not help in Python, because of the GIL. Separate processes each have their own interpreter and can use every core of the machine. Knowing when to choose processes over threads is a standard interview question.`,
    exercise: {
      prompt: `Use a <code>ProcessPoolExecutor</code> to square the numbers 1 to 4 in separate processes and print the results. Put the code that starts the processes under the <code>__main__</code> guard.

Expected output: <code>[1, 4, 9, 16]</code>`,
      starterCode: `from concurrent.futures import ProcessPoolExecutor


def square(number):
    return number * number


# TODO: under the __main__ guard, create a ProcessPoolExecutor,
#       map square over [1, 2, 3, 4] and print the results as a list`,
      hints: [
        'The guard is <code>if __name__ == "__main__":</code>. Without it, on Windows and macOS each new process would start more processes.',
        '<code>executor.map</code> returns the results in the order of the inputs.',
      ],
      solution: `from concurrent.futures import ProcessPoolExecutor


def square(number):
    return number * number


if __name__ == "__main__":
    with ProcessPoolExecutor() as executor:
        print(list(executor.map(square, [1, 2, 3, 4])))`,
    },
    quiz: [
      {
        question: 'Why does multiprocessing code need the <code>if __name__ == "__main__":</code> guard?',
        options: ['It makes the code faster', 'New processes may import the main module, and without the guard they would start processes of their own', 'It is only a style rule', 'It enables the GIL'],
        answer: 1,
        explanation: 'This applies where processes are started by spawning, as on Windows and macOS.',
      },
      {
        question: 'Do separate processes share ordinary Python variables?',
        options: ['Yes', 'Only global variables', 'No; each process has its own memory', 'Only lists'],
        answer: 2,
        explanation: 'Data is passed between them through queues, pipes or special shared objects.',
      },
      {
        question: 'Which kind of work benefits most from multiprocessing?',
        options: ['Waiting for network responses', 'Printing to the screen', 'Reading a small file', 'CPU-bound calculations'],
        answer: 3,
        explanation: 'Each process runs on its own core, unaffected by the GIL of the others.',
      },
    ],
    interviewQuestions: [
      {
        question: 'When would you use multiprocessing instead of multithreading?',
        answer: `For CPU-bound work, where the program is busy calculating. Because of the GIL, threads in CPython cannot run Python code in parallel, but each process has its own interpreter and its own GIL, so processes use several cores at once. For I/O-bound work, threads or <code>asyncio</code> are better, since processes cost more to start and to communicate with.`,
      },
      {
        question: 'How do processes communicate with each other?',
        answer: `They do not share memory, so data is sent between them. A <code>multiprocessing.Queue</code> or <code>Pipe</code> passes objects, which are serialised with pickle on the way; the arguments and results of an executor's <code>map</code> travel the same way. For simple shared values there are <code>Value</code> and <code>Array</code>, used with a lock. Everything sent must be picklable.`,
      },
    ],
  },
}
