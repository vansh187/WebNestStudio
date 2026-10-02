// Practice blocks for the Web Development with FastAPI module. Merged onto the lesson
// entries in index.js by slug, so the lesson prose files stay unchanged.
// Each exercise calls its own application through TestClient, so no server has to be
// started and the output is the same on every run. They need "pip install fastapi httpx".
export const practicePythonFastapi = {
  'introduction-to-fastapi': {
    whyItMatters: `Mobile apps, single-page web apps and other services all talk to a back end through an HTTP API. FastAPI is the most popular modern Python framework for building one: it is fast, it validates data from type hints, and it documents the API automatically. Back-end Python roles increasingly list it by name.`,
    exercise: {
      prompt: `Create a FastAPI application with a <code>GET /</code> endpoint that returns a message. The code at the bottom calls it with <code>TestClient</code> and prints the status code and the JSON body.

Expected output: <code>200</code> then <code>{'message': 'Hello, FastAPI'}</code>`,
      starterCode: `from fastapi import FastAPI
from fastapi.testclient import TestClient

# TODO: create the application
# TODO: add a GET "/" path operation that returns {"message": "Hello, FastAPI"}


client = TestClient(app)
response = client.get("/")
print(response.status_code)
print(response.json())`,
      hints: [
        'The application is <code>app = FastAPI()</code>, and a path operation is a function decorated with <code>@app.get("/")</code>.',
        'Return a dictionary; FastAPI converts it to JSON.',
      ],
      solution: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI"}


client = TestClient(app)
response = client.get("/")
print(response.status_code)
print(response.json())`,
    },
    quiz: [
      {
        question: 'Which command starts a FastAPI application in development?',
        options: ['python main.py', 'pip run main', 'fastapi dev main.py', 'flask run'],
        answer: 2,
        explanation: 'It runs the app with automatic reload. In production an ASGI server such as Uvicorn is run directly.',
      },
      {
        question: 'At which path does FastAPI serve interactive API documentation by default?',
        options: ['/api', '/swagger.json', '/help', '/docs'],
        answer: 3,
        explanation: 'It is generated from the OpenAPI schema, which is at /openapi.json.',
      },
      {
        question: 'What does a path operation function return to send JSON?',
        options: ['A Python dict, list or Pydantic model, which FastAPI serialises', 'A JSON string built by hand', 'An HTML page', 'Nothing'],
        answer: 0,
        explanation: 'Serialisation is handled by the framework.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is FastAPI and what are its main features?',
        answer: `FastAPI is a Python web framework for building APIs. It uses type hints to validate and convert request data through Pydantic, generates OpenAPI documentation and an interactive <code>/docs</code> page automatically, supports <code>async</code> endpoints, and has a dependency injection system. It runs on ASGI servers such as Uvicorn and is among the fastest Python frameworks.`,
      },
      {
        question: 'What is the difference between WSGI and ASGI?',
        answer: `WSGI is the older interface between Python web applications and servers; it is synchronous, handling one request per worker at a time, and is used by Flask and classic Django. ASGI is its asynchronous successor: it supports <code>async</code> code, many concurrent connections per worker, and long-lived connections such as WebSockets. FastAPI is an ASGI framework.`,
      },
    ],
  },

  'path-and-query-parameters': {
    whyItMatters: `Most API calls carry their input in the URL: which record, which page, which filter. FastAPI reads those values, converts them to the declared types and rejects invalid ones before your function runs, which removes a great deal of checking code and a common source of bugs and security problems.`,
    exercise: {
      prompt: `Add a <code>GET /items/{item_id}</code> endpoint. <code>item_id</code> is an integer path parameter and <code>limit</code> is an integer query parameter with a default of 10. Return both in a dictionary. The second call passes text where a number is required.

Expected output: <code>{'item_id': 5, 'limit': 2}</code> then <code>422</code>`,
      starterCode: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

# TODO: GET /items/{item_id} with item_id: int and limit: int = 10,
#       returning {"item_id": ..., "limit": ...}


client = TestClient(app)
print(client.get("/items/5?limit=2").json())
print(client.get("/items/abc").status_code)`,
      hints: [
        'A parameter named in the path, in braces, is a path parameter. Any other simple parameter is a query parameter.',
        'The type hints do the conversion and validation; no code is needed for the invalid case.',
      ],
      solution: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/items/{item_id}")
def read_item(item_id: int, limit: int = 10):
    return {"item_id": item_id, "limit": limit}


client = TestClient(app)
print(client.get("/items/5?limit=2").json())
print(client.get("/items/abc").status_code)`,
    },
    quiz: [
      {
        question: 'How does FastAPI decide that a function parameter is a query parameter?',
        options: ['It must be marked with @query', 'It is a simple type and its name is not in the path', 'It must have a default value', 'It must be a string'],
        answer: 1,
        explanation: 'A query parameter without a default is required; with a default it is optional.',
      },
      {
        question: 'Which status code does FastAPI return when a parameter fails validation?',
        options: ['400', '404', '422', '500'],
        answer: 2,
        explanation: 'The body lists each field that failed and why.',
      },
      {
        question: 'How do you require that a query parameter is at least 1?',
        options: ['With an if statement only', 'It cannot be done', 'int >= 1', 'Annotated[int, Query(ge=1)]'],
        answer: 3,
        explanation: 'Query and Path accept constraints such as ge, le, min_length and pattern.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a path parameter and a query parameter?',
        answer: `A path parameter is part of the URL path and identifies a specific resource, as in <code>/users/42</code>; it is always required. A query parameter comes after the <code>?</code>, as in <code>/users?page=2&amp;sort=name</code>, and is used for optional things such as filtering, sorting and pagination. In FastAPI the first is a function parameter whose name appears in the path, and the second is any other simple parameter.`,
      },
      {
        question: 'How does FastAPI validate request parameters?',
        answer: `From the type hints of the function. It converts the incoming text to the declared type and, if that fails or a constraint declared with <code>Path</code> or <code>Query</code> is broken, returns a 422 response describing the error without calling the function. The same declarations appear in the generated documentation.`,
      },
    ],
  },

  'request-body-and-pydantic-models': {
    whyItMatters: `Data sent to an API cannot be trusted: fields may be missing, of the wrong type or out of range. A Pydantic model states exactly what is acceptable, and FastAPI checks every request against it before your code runs. Pydantic is also used on its own for configuration and data processing, so the skill carries over.`,
    exercise: {
      prompt: `Define a <code>Book</code> model with a title and a price that must be greater than zero. Add a <code>POST /books</code> endpoint that stores the book and returns it with an id. The second request sends an invalid price.

Expected output: <code>{'id': 1, 'title': 'Dune', 'price': 9.5}</code> then <code>422</code>`,
      starterCode: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

app = FastAPI()
books = []

# TODO: class Book(BaseModel) with title: str and price: float greater than 0

# TODO: POST /books that appends the book and returns its fields plus an "id"


client = TestClient(app)
print(client.post("/books", json={"title": "Dune", "price": 9.5}).json())
print(client.post("/books", json={"title": "Dune", "price": -1}).status_code)`,
      hints: [
        'A constraint is declared with <code>Field</code>: <code>price: float = Field(gt=0)</code>.',
        '<code>book.model_dump()</code> returns the model as a dictionary, which can be merged with the id.',
      ],
      solution: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

app = FastAPI()
books = []


class Book(BaseModel):
    title: str
    price: float = Field(gt=0)


@app.post("/books")
def create_book(book: Book):
    books.append(book)
    return {"id": len(books), **book.model_dump()}


client = TestClient(app)
print(client.post("/books", json={"title": "Dune", "price": 9.5}).json())
print(client.post("/books", json={"title": "Dune", "price": -1}).status_code)`,
    },
    quiz: [
      {
        question: 'How does FastAPI know that a parameter should be read from the JSON body?',
        options: ['Its type is a Pydantic model', 'Its name is body', 'It has no default', 'It is the first parameter'],
        answer: 0,
        explanation: 'Simple types are taken from the path or the query string; models come from the body.',
      },
      {
        question: 'Which method converts a Pydantic v2 model to a dictionary?',
        options: ['to_dict()', 'model_dump()', 'as_dict()', 'json()'],
        answer: 1,
        explanation: 'model_dump_json() returns a JSON string instead.',
      },
      {
        question: 'What is the difference between PUT and PATCH?',
        options: ['There is none', 'PUT replaces the whole resource; PATCH changes only the fields that are sent', 'PATCH creates a resource', 'PUT is for deleting'],
        answer: 1,
        explanation: 'A PATCH model usually has every field optional.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is Pydantic and what role does it play in FastAPI?',
        answer: `Pydantic is a library that validates and converts data using classes with type hints. A model declares the fields, their types and constraints; creating an instance from raw data either yields a correctly typed object or raises a detailed validation error. FastAPI uses Pydantic models for request bodies and responses, so validation, conversion and the documentation of the data shapes all come from one declaration.`,
      },
      {
        question: 'How do you implement a partial update with PATCH?',
        answer: `Define a separate model in which every field is optional, with a default of <code>None</code>. In the endpoint, call <code>model_dump(exclude_unset=True)</code> to get only the fields the client actually sent, and apply those to the stored object. This distinguishes a field that was omitted from one deliberately set to <code>null</code>.`,
      },
    ],
  },

  'response-models-status-codes-and-errors': {
    whyItMatters: `What an API sends back is a contract with its clients. Returning the right status code tells them what happened, a response model guarantees that internal fields such as password hashes never leak, and consistent error responses let client code handle failures properly. These details separate a toy API from a professional one.`,
    exercise: {
      prompt: `Add two endpoints. <code>POST /users</code> accepts a name and a password, stores the user, responds with status 201 and returns only the name. <code>GET /users/{name}</code> returns the user's name, or a 404 error with the detail <code>User not found</code>.

Expected output: <code>201 {'name': 'asha'}</code> then <code>404 {'detail': 'User not found'}</code>`,
      starterCode: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()
users = {}


class UserIn(BaseModel):
    name: str
    password: str


class UserOut(BaseModel):
    name: str


# TODO: POST /users with response_model=UserOut and status_code=201
# TODO: GET /users/{name} with response_model=UserOut, raising HTTPException(404) if missing


client = TestClient(app)
response = client.post("/users", json={"name": "asha", "password": "secret"})
print(response.status_code, response.json())
response = client.get("/users/ravi")
print(response.status_code, response.json())`,
      hints: [
        'Both options go in the decorator: <code>@app.post("/users", response_model=UserOut, status_code=201)</code>.',
        'Raise the error with <code>raise HTTPException(status_code=404, detail="User not found")</code>.',
      ],
      solution: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()
users = {}


class UserIn(BaseModel):
    name: str
    password: str


class UserOut(BaseModel):
    name: str


@app.post("/users", response_model=UserOut, status_code=201)
def create_user(user: UserIn):
    users[user.name] = user
    return user


@app.get("/users/{name}", response_model=UserOut)
def read_user(name: str):
    if name not in users:
        raise HTTPException(status_code=404, detail="User not found")
    return users[name]


client = TestClient(app)
response = client.post("/users", json={"name": "asha", "password": "secret"})
print(response.status_code, response.json())
response = client.get("/users/ravi")
print(response.status_code, response.json())`,
    },
    quiz: [
      {
        question: 'Which status code should a successful POST that creates a resource return?',
        options: ['200', '302', '204', '201'],
        answer: 3,
        explanation: '201 means Created. 204 means success with no response body.',
      },
      {
        question: 'What does <code>response_model</code> do?',
        options: ['Filters and validates the data returned, so only the declared fields are sent', 'Validates the request', 'Sets the status code', 'Caches the response'],
        answer: 0,
        explanation: 'Fields not in the response model, such as a password, are removed.',
      },
      {
        question: 'How is an error response sent from inside a path operation?',
        options: ['return 404', 'raise HTTPException(status_code=404, detail="...")', 'print("error")', 'return None'],
        answer: 1,
        explanation: 'FastAPI converts the exception into a JSON response with that status.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why use separate models for input and output?',
        answer: `The data a client sends and the data the API returns are rarely the same. Input may include a password that must never be returned; output may include an id and timestamps that the client cannot set. Separate models make each direction explicit, and declaring the output model as <code>response_model</code> guarantees that only its fields leave the server, even if the function returns an object with more.`,
      },
      {
        question: 'What is the difference between 401 and 403?',
        answer: `401 Unauthorized means the request has no valid credentials: the client is not logged in, or its token is missing or expired, and it should authenticate. 403 Forbidden means the client is identified but is not allowed to perform this action, and authenticating again will not help.`,
      },
    ],
  },

  'dependency-injection-and-routers': {
    whyItMatters: `Database sessions, the current user, pagination settings and permission checks are needed by many endpoints. FastAPI's <code>Depends</code> lets you write each once and declare it where it is needed, and it is also what makes endpoints easy to test. Routers then split a growing application into files, which every real project has to do.`,
    exercise: {
      prompt: `Write a <code>pagination</code> dependency that reads <code>skip</code> and <code>limit</code> from the query string, with defaults of 0 and 10, and use it in <code>GET /items</code>. Then create a router with the prefix <code>/users</code>, add a <code>GET /me</code> endpoint to it, and include it in the application.

Expected output: <code>{'skip': 5, 'limit': 10}</code> then <code>{'user': 'me'}</code>`,
      starterCode: `from fastapi import APIRouter, Depends, FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


# TODO: def pagination(skip: int = 0, limit: int = 10) returning a dict

# TODO: GET /items that receives the dict through Depends and returns it

# TODO: an APIRouter with prefix "/users" and a GET "/me" returning {"user": "me"}
# TODO: include the router in the app


client = TestClient(app)
print(client.get("/items?skip=5").json())
print(client.get("/users/me").json())`,
      hints: [
        'A dependency is used as a default value: <code>def read_items(page: dict = Depends(pagination)):</code>.',
        'Create the router with <code>APIRouter(prefix="/users")</code> and add it with <code>app.include_router(router)</code>.',
      ],
      solution: `from fastapi import APIRouter, Depends, FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


def pagination(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}


@app.get("/items")
def read_items(page: dict = Depends(pagination)):
    return page


router = APIRouter(prefix="/users")


@router.get("/me")
def read_me():
    return {"user": "me"}


app.include_router(router)


client = TestClient(app)
print(client.get("/items?skip=5").json())
print(client.get("/users/me").json())`,
    },
    quiz: [
      {
        question: 'What does <code>Depends(get_db)</code> do in a parameter list?',
        options: ['Imports a module', 'Creates a database', 'Calls get_db for the request and passes its result to the function', 'Marks the parameter as optional'],
        answer: 2,
        explanation: 'The dependency can itself have parameters and other dependencies.',
      },
      {
        question: 'In a dependency written with <code>yield</code>, when does the code after the <code>yield</code> run?',
        options: ['Before the endpoint', 'Only on errors', 'Never', 'After the response has been produced, for clean-up'],
        answer: 3,
        explanation: 'This is how a database session is closed after each request.',
      },
      {
        question: 'What is <code>APIRouter</code> used for?',
        options: ['Grouping related endpoints so an application can be split across files', 'Load balancing', 'Routing emails', 'Caching'],
        answer: 0,
        explanation: 'Each router is added to the application with include_router.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is dependency injection in FastAPI?',
        answer: `An endpoint declares what it needs as parameters with <code>Depends(...)</code>, and FastAPI calls those functions for each request and supplies the results. Dependencies can depend on other dependencies, can read request data themselves, and can clean up after the response with <code>yield</code>. Shared logic such as authentication or a database session is written once and reused.`,
      },
      {
        question: 'How do dependencies help with testing?',
        answer: `Any dependency can be replaced through <code>app.dependency_overrides</code>. A test can substitute the function that provides the database session with one that uses a test database, or the function that returns the current user with one that returns a fixed user, without changing the application code or needing real credentials.`,
      },
    ],
  },

  'fastapi-with-a-database': {
    whyItMatters: `An API that keeps its data in a Python list loses everything when it restarts. Connecting endpoints to a database is the step that turns the examples so far into a real back end, and the create, list, read, update and delete endpoints built here are the pattern behind most business applications.`,
    exercise: {
      prompt: `Using the in-memory SQLite database that is already set up, add <code>POST /tasks</code>, which inserts a task and returns it with its id and status 201, and <code>GET /tasks</code>, which returns all tasks.

Expected output: <code>{'id': 1, 'title': 'write tests'}</code> then <code>[{'id': 1, 'title': 'write tests'}]</code>`,
      starterCode: `import sqlite3

from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

# check_same_thread=False lets the request handlers, which run in worker threads, share it
connection = sqlite3.connect(":memory:", check_same_thread=False)
connection.execute("CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT)")

app = FastAPI()


class TaskIn(BaseModel):
    title: str


# TODO: POST /tasks (status 201): insert the task and return {"id": ..., "title": ...}
# TODO: GET /tasks: return a list of {"id": ..., "title": ...} for every row


client = TestClient(app)
print(client.post("/tasks", json={"title": "write tests"}).json())
print(client.get("/tasks").json())`,
      hints: [
        'Insert with a placeholder and read the new id from <code>cursor.lastrowid</code>; commit afterwards.',
        'Build the list with a comprehension over <code>fetchall()</code>.',
      ],
      solution: `import sqlite3

from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

# check_same_thread=False lets the request handlers, which run in worker threads, share it
connection = sqlite3.connect(":memory:", check_same_thread=False)
connection.execute("CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT)")

app = FastAPI()


class TaskIn(BaseModel):
    title: str


@app.post("/tasks", status_code=201)
def create_task(task: TaskIn):
    cursor = connection.execute("INSERT INTO tasks (title) VALUES (?)", (task.title,))
    connection.commit()
    return {"id": cursor.lastrowid, "title": task.title}


@app.get("/tasks")
def list_tasks():
    rows = connection.execute("SELECT id, title FROM tasks ORDER BY id").fetchall()
    return [{"id": row[0], "title": row[1]} for row in rows]


client = TestClient(app)
print(client.post("/tasks", json={"title": "write tests"}).json())
print(client.get("/tasks").json())`,
    },
    quiz: [
      {
        question: 'How should a database session normally be given to an endpoint in FastAPI?',
        options: ['As a global variable used directly', 'Through a dependency that opens it and closes it after the request', 'By opening a new connection in every line', 'Through the URL'],
        answer: 1,
        explanation: 'A yield dependency guarantees the session is closed even when the endpoint fails.',
      },
      {
        question: 'Why are the Pydantic schema and the database model usually separate classes?',
        options: ['FastAPI requires it', 'To make the code longer', 'One describes what the API accepts and returns; the other describes how data is stored', 'They cannot share field names'],
        answer: 2,
        explanation: 'Keeping them apart lets the stored form and the public form change independently.',
      },
      {
        question: 'What should an endpoint return when the requested row does not exist?',
        options: ['An empty 200 response', 'null with status 201', 'A 500 error', 'A 404 error'],
        answer: 3,
        explanation: 'Check the result of the query and raise HTTPException(status_code=404).',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you manage database sessions in a FastAPI application?',
        answer: `Create the engine and a session factory once at start-up. Write a dependency that opens a session, yields it to the endpoint, and closes it in a <code>finally</code> block, and declare it in each endpoint with <code>Depends</code>. Every request then gets its own session, which is always released, and tests can override the dependency to use a different database.`,
      },
      {
        question: 'Should database endpoints be defined with def or async def?',
        answer: `It depends on the driver. With a blocking driver, such as the standard synchronous SQLAlchemy session, use <code>def</code>: FastAPI runs such endpoints in a thread pool, so they do not block the event loop. Use <code>async def</code> only with an asynchronous driver and <code>await</code>. Calling a blocking database function inside an <code>async def</code> endpoint stalls every other request.`,
      },
    ],
  },

  'authentication-with-oauth2-and-jwt': {
    whyItMatters: `Almost every API has to know who is calling it. Storing passwords wrongly or mishandling tokens leads to the kind of breach that makes the news, so the rules here — hash passwords, sign tokens, give them an expiry, keep secrets out of them — are among the most important things a back-end developer learns.`,
    exercise: {
      prompt: `Using the <code>PyJWT</code> library, create a token whose subject is <code>asha</code> and which expires in 30 minutes, decode it and print the subject. Then try to decode the same token with a different secret, and print <code>invalid token</code> when that fails.

Expected output: <code>asha</code> then <code>invalid token</code>`,
      starterCode: `from datetime import datetime, timedelta, timezone

import jwt

SECRET = "change-me-to-a-long-random-secret-value"
ALGORITHM = "HS256"

# TODO: build the payload with "sub" and "exp", and encode it into a token

# TODO: decode the token with SECRET and print the subject

# TODO: decode it with a different secret, catching jwt.InvalidTokenError`,
      hints: [
        'The expiry is a datetime: <code>datetime.now(timezone.utc) + timedelta(minutes=30)</code>.',
        '<code>jwt.decode(token, secret, algorithms=[ALGORITHM])</code> verifies the signature and the expiry, and raises an exception if either check fails.',
      ],
      solution: `from datetime import datetime, timedelta, timezone

import jwt

SECRET = "change-me-to-a-long-random-secret-value"
ALGORITHM = "HS256"

payload = {
    "sub": "asha",
    "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
}
token = jwt.encode(payload, SECRET, algorithm=ALGORITHM)

decoded = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
print(decoded["sub"])

try:
    jwt.decode(token, "a-completely-different-secret-value-here", algorithms=[ALGORITHM])
except jwt.InvalidTokenError:
    print("invalid token")`,
    },
    quiz: [
      {
        question: 'How should passwords be stored?',
        options: ['As a salted hash made by a password-hashing algorithm such as Argon2 or bcrypt', 'Encrypted with a key kept in the code', 'As plain text', 'Base64 encoded'],
        answer: 0,
        explanation: 'A hash cannot be reversed, and a salt makes identical passwords produce different hashes.',
      },
      {
        question: 'Can anyone who obtains a JWT read its payload?',
        options: ['No, it is encrypted', 'Yes; it is only encoded and signed, not encrypted', 'Only with the secret', 'Only the server'],
        answer: 1,
        explanation: 'Never put passwords or other secrets in a token.',
      },
      {
        question: 'What does the <code>exp</code> claim of a JWT do?',
        options: ['Names the user', 'Encrypts the token', 'Sets the time after which the token is rejected', 'Lists permissions'],
        answer: 2,
        explanation: 'Short-lived tokens limit the damage if one is stolen.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How does JWT authentication work?',
        answer: `The client sends a username and password to a login endpoint. The server verifies the password against its stored hash and returns a signed token containing the user's identity and an expiry time. The client sends that token in the <code>Authorization: Bearer</code> header of each later request. The server checks the signature and the expiry, and trusts the identity inside without looking up a session, so it stays stateless.`,
      },
      {
        question: 'What is the difference between authentication and authorisation?',
        answer: `Authentication establishes who the caller is, for example by checking a password or a token. Authorisation decides what that caller is allowed to do, for example whether this user may delete that record. Authentication comes first; a failure there is reported with 401, and a failure of authorisation with 403.`,
      },
    ],
  },

  'middleware-background-tasks-and-websockets': {
    whyItMatters: `Some things apply to every request, such as logging, timing and CORS headers, and middleware handles them in one place. Some work should not make the user wait, such as sending an email after sign-up. And some features, such as chat and live updates, need a connection that stays open. These three tools cover those needs.`,
    exercise: {
      prompt: `Add an HTTP middleware that sets the response header <code>X-App</code> to <code>demo</code> on every response, and a WebSocket endpoint at <code>/ws</code> that replies to one message with <code>echo: </code> followed by the text received.

Expected output: <code>demo</code> then <code>echo: hi</code>`,
      starterCode: `from fastapi import FastAPI, Request, WebSocket
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/")
def read_root():
    return {"ok": True}


# TODO: an http middleware that adds the header X-App: demo to the response

# TODO: a websocket endpoint at /ws that accepts, receives one text message
#       and sends back "echo: <text>"


client = TestClient(app)
print(client.get("/").headers["x-app"])

with client.websocket_connect("/ws") as websocket:
    websocket.send_text("hi")
    print(websocket.receive_text())`,
      hints: [
        'A middleware is <code>async def add_header(request: Request, call_next)</code>, decorated with <code>@app.middleware("http")</code>; it awaits <code>call_next(request)</code> to get the response.',
        'In the WebSocket function, call <code>await websocket.accept()</code> first, then <code>receive_text()</code> and <code>send_text()</code>.',
      ],
      solution: `from fastapi import FastAPI, Request, WebSocket
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/")
def read_root():
    return {"ok": True}


@app.middleware("http")
async def add_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-App"] = "demo"
    return response


@app.websocket("/ws")
async def echo(websocket: WebSocket):
    await websocket.accept()
    text = await websocket.receive_text()
    await websocket.send_text(f"echo: {text}")
    await websocket.close()


client = TestClient(app)
print(client.get("/").headers["x-app"])

with client.websocket_connect("/ws") as websocket:
    websocket.send_text("hi")
    print(websocket.receive_text())`,
    },
    quiz: [
      {
        question: 'What is middleware?',
        options: ['A database driver', 'A template engine', 'A kind of test', 'Code that runs for every request before and after the endpoint'],
        answer: 3,
        explanation: 'It can inspect the request, call the next handler and modify the response.',
      },
      {
        question: 'What problem does CORS middleware solve?',
        options: ['Browsers blocking a web page on one origin from calling an API on another', 'Slow queries', 'Password hashing', 'File uploads'],
        answer: 0,
        explanation: 'The API must state which origins are allowed to call it.',
      },
      {
        question: 'When does a function added with <code>BackgroundTasks</code> run?',
        options: ['Before the request is read', 'After the response has been sent to the client', 'In a separate server', 'Never, unless awaited'],
        answer: 1,
        explanation: 'The client does not wait for it. It suits short jobs such as sending an email.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is CORS and why does an API need to configure it?',
        answer: `Browsers enforce the same-origin policy: JavaScript on one origin may not read responses from another origin unless that server allows it. CORS is the mechanism for allowing it, through response headers naming the permitted origins, methods and headers. An API used by a front end on a different domain or port must send them, in FastAPI through <code>CORSMiddleware</code>. It is a browser protection and does not apply to server-to-server calls.`,
      },
      {
        question: 'How does a WebSocket differ from an ordinary HTTP request?',
        answer: `An HTTP request is one question and one answer, after which the exchange is over. A WebSocket starts as an HTTP request that is upgraded to a persistent connection, over which both the client and the server can send messages at any time. It is used for chat, notifications and live dashboards, where the server needs to push data without being asked.`,
      },
    ],
  },

  'testing-fastapi-applications': {
    whyItMatters: `An API is a contract, and tests are how you make sure a change has not broken it. FastAPI's <code>TestClient</code> calls the application in memory, with no server and no network, so a full test suite runs in seconds. Dependency overrides let tests replace the database or the logged-in user, which makes even protected endpoints easy to test.`,
    exercise: {
      prompt: `The endpoint returns the settings supplied by the <code>get_settings</code> dependency. Write one test that checks the normal response, and a second that overrides the dependency to return <code>{"env": "test"}</code>, checks the response, and removes the override afterwards.

Expected output: <code>2 passed</code>`,
      starterCode: `from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


def get_settings():
    return {"env": "prod"}


@app.get("/env")
def read_env(settings: dict = Depends(get_settings)):
    return settings


client = TestClient(app)


def test_default_env():
    # TODO: assert that GET /env returns {"env": "prod"}
    pass


def test_overridden_env():
    # TODO: override get_settings, assert the response, then clear the override
    pass


test_default_env()
test_overridden_env()
print("2 passed")`,
      hints: [
        'Overrides are set in a dictionary: <code>app.dependency_overrides[get_settings] = lambda: {"env": "test"}</code>.',
        'Clear the override in a <code>finally</code> block, so that it is removed even if the assertion fails.',
      ],
      solution: `from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

app = FastAPI()


def get_settings():
    return {"env": "prod"}


@app.get("/env")
def read_env(settings: dict = Depends(get_settings)):
    return settings


client = TestClient(app)


def test_default_env():
    assert client.get("/env").json() == {"env": "prod"}


def test_overridden_env():
    app.dependency_overrides[get_settings] = lambda: {"env": "test"}
    try:
        assert client.get("/env").json() == {"env": "test"}
    finally:
        app.dependency_overrides.clear()


test_default_env()
test_overridden_env()
print("2 passed")`,
    },
    quiz: [
      {
        question: 'Does <code>TestClient</code> need a running server?',
        options: ['Yes, on port 8000', 'Only for POST requests', 'No; it calls the application directly in the same process', 'Only on Linux'],
        answer: 2,
        explanation: 'This makes the tests fast and independent of the network.',
      },
      {
        question: 'What is <code>app.dependency_overrides</code> for?',
        options: ['Changing routes', 'Caching dependencies', 'Overriding status codes', 'Replacing a dependency with another function during tests'],
        answer: 3,
        explanation: 'It maps the original dependency function to its replacement.',
      },
      {
        question: 'What should an API test check besides the response body?',
        options: ['Nothing else', 'The status code', 'The server uptime', 'The Python version'],
        answer: 1,
        explanation: 'A wrong status code with a correct-looking body is still a bug.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you test a FastAPI endpoint that needs a database?',
        answer: `Override the dependency that provides the database session with one that uses a separate test database, such as an in-memory SQLite database or a temporary PostgreSQL schema, created in a pytest fixture and discarded afterwards. The endpoints then run unchanged against data the test controls, and the real database is never touched.`,
      },
      {
        question: 'How do you test endpoints that require authentication?',
        answer: `Either override the dependency that returns the current user so that it returns a fixed test user, which avoids tokens entirely, or log in through the real login endpoint in a fixture and send the token in the <code>Authorization</code> header. The first is simpler for most tests; the second is used to test the authentication flow itself. Tests should also check that a request without credentials is rejected with 401.`,
      },
    ],
  },

  'deploying-fastapi-applications': {
    whyItMatters: `An application that only runs on your laptop is not finished. Deployment means configuration that comes from the environment and not from the code, a production server with several workers, and a container that runs the same everywhere. Employers expect a back-end developer to be able to take an API all the way to production.`,
    exercise: {
      prompt: `Using <code>pydantic-settings</code>, which must be installed with <code>pip install pydantic-settings</code>, define a <code>Settings</code> class that reads <code>port</code> and <code>debug</code> from environment variables with the prefix <code>APP_</code>, with defaults of 8000 and <code>False</code>. The code sets one variable, so that value should replace the default while the other stays as it is.

Expected output: <code>9000 False</code>`,
      starterCode: `import os

from pydantic_settings import BaseSettings, SettingsConfigDict

os.environ["APP_PORT"] = "9000"  # normally set outside the program


# TODO: class Settings(BaseSettings) with the prefix APP_,
#       port: int = 8000 and debug: bool = False


settings = Settings()
print(settings.port, settings.debug)`,
      hints: [
        'The prefix is set with <code>model_config = SettingsConfigDict(env_prefix="APP_")</code>.',
        'The text "9000" from the environment is converted to an <code>int</code> because of the type hint.',
      ],
      solution: `import os

from pydantic_settings import BaseSettings, SettingsConfigDict

os.environ["APP_PORT"] = "9000"  # normally set outside the program


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_")

    port: int = 8000
    debug: bool = False


settings = Settings()
print(settings.port, settings.debug)`,
    },
    quiz: [
      {
        question: 'Where should secrets such as a database password come from in production?',
        options: ['The source code', 'Environment variables or a secrets manager', 'A comment in the README', 'The URL'],
        answer: 1,
        explanation: 'Secrets in the code end up in version control and are the same in every environment.',
      },
      {
        question: 'Why is the <code>--reload</code> option not used in production?',
        options: ['It is not supported', 'It disables HTTPS', 'It watches files and restarts the server, which costs performance and is meant for development', 'It deletes logs'],
        answer: 2,
        explanation: 'Production runs a fixed number of workers with no reloading.',
      },
      {
        question: 'What does a Dockerfile describe?',
        options: ['The database schema', 'The test plan', 'The API routes', 'How to build an image containing the application and everything it needs to run'],
        answer: 3,
        explanation: 'The same image runs unchanged on a laptop, a test server and in production.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you run a FastAPI application in production?',
        answer: `Run it with an ASGI server such as Uvicorn, with several worker processes so that all CPU cores are used, behind a reverse proxy or load balancer that terminates HTTPS. Configuration comes from environment variables. The application is usually packaged as a Docker image, and a health-check endpoint lets the platform restart it if it stops responding.`,
      },
      {
        question: 'How should configuration be handled across development, testing and production?',
        answer: `Keep the code identical in every environment and take everything that differs — database URL, secrets, debug flag, allowed origins — from environment variables. A typed settings class, such as one built on <code>pydantic-settings</code>, reads and validates them at start-up, so a missing or invalid value stops the application immediately with a clear error. A <code>.env</code> file may supply values in development and is never committed.`,
      },
    ],
  },

  'flask-basics': {
    whyItMatters: `Flask is the classic lightweight Python web framework, and a very large amount of existing code is written in it. You are likely to maintain a Flask application at some point, and comparing it with FastAPI is a common interview question. Its ideas of routes, request objects and templates are shared by nearly every web framework.`,
    exercise: {
      prompt: `Using Flask, which must be installed with <code>pip install flask</code>, create a route <code>/hello/&lt;name&gt;</code> that returns a JSON greeting. The greeting word comes from an optional query parameter named <code>greeting</code> and defaults to <code>Hello</code>. The code calls the route with Flask's test client.

Expected output: <code>{'message': 'Hello, Asha!'}</code> then <code>{'message': 'Hi, Asha!'}</code>`,
      starterCode: `from flask import Flask, jsonify, request

app = Flask(__name__)

# TODO: a GET route "/hello/<name>" that reads the optional query parameter "greeting"
#       and returns JSON such as {"message": "Hello, Asha!"}


client = app.test_client()
print(client.get("/hello/Asha").get_json())
print(client.get("/hello/Asha?greeting=Hi").get_json())`,
      hints: [
        'A URL variable in angle brackets becomes a parameter of the function: <code>def hello(name):</code>.',
        'Query parameters are read from <code>request.args.get("greeting", "Hello")</code>, and <code>jsonify(...)</code> builds the JSON response.',
      ],
      solution: `from flask import Flask, jsonify, request

app = Flask(__name__)


@app.get("/hello/<name>")
def hello(name):
    greeting = request.args.get("greeting", "Hello")
    return jsonify(message=f"{greeting}, {name}!")


client = app.test_client()
print(client.get("/hello/Asha").get_json())
print(client.get("/hello/Asha?greeting=Hi").get_json())`,
    },
    quiz: [
      {
        question: 'How does a Flask view function read query parameters?',
        options: ['From request.args', 'From its function parameters', 'From request.body', 'From app.config'],
        answer: 0,
        explanation: 'request is a global object that represents the current request.',
      },
      {
        question: 'Which template engine does Flask use to render HTML?',
        options: ['Mustache', 'Jinja2', 'JSX', 'Handlebars'],
        answer: 1,
        explanation: 'render_template fills a template with the values passed to it.',
      },
      {
        question: 'What is a Flask blueprint?',
        options: ['A database model', 'A deployment file', 'A group of routes that can be registered on the application, like a FastAPI router', 'A test fixture'],
        answer: 2,
        explanation: 'Blueprints split a large application into modules.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the main differences between Flask and FastAPI?',
        answer: `Flask is a minimal WSGI framework: it provides routing, the request object and templates, and leaves validation, documentation and async support to extensions. FastAPI is an ASGI framework designed for APIs: it validates input from type hints with Pydantic, generates OpenAPI documentation, supports <code>async</code> natively and has dependency injection built in. Flask suits server-rendered sites and simple services; FastAPI is the usual choice for new JSON APIs.`,
      },
      {
        question: 'How does Flask make the request object available without passing it as a parameter?',
        answer: `<code>request</code> is a proxy object bound to a context. When a request arrives, Flask pushes a request context for the worker handling it, and the proxy forwards attribute access to the request in the current context. Each thread or task sees its own request, although the name is imported globally. The same mechanism provides <code>session</code>, <code>g</code> and <code>current_app</code>.`,
      },
    ],
  },
}
