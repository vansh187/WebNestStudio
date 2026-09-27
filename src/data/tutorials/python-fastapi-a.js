// Python course — web development with FastAPI, part 1: introduction, parameters,
// request bodies, responses and errors, dependencies and routers.
// Keys are slugs matching topics in codelabDefaults.js.
export const pythonFastapiA = {
  'introduction-to-fastapi': {
    title: 'Introduction to FastAPI',
    intro: `<strong>FastAPI</strong> is a modern Python framework for building web APIs — the back ends that mobile apps, React front ends and other services talk to. You describe each endpoint with an ordinary Python function and type hints; FastAPI uses those hints to parse and validate requests, convert responses to JSON, and generate interactive documentation automatically.

It is fast to write, fast to run (it is built on the ASGI toolkit <strong>Starlette</strong> and the validation library <strong>Pydantic</strong>), and has become one of the most popular Python web frameworks alongside Django and Flask. This lesson explains how web APIs work, sets up a project, builds a first API and explores the automatic docs.`,
    sections: [
      {
        heading: 'How a Web API Works',
        body: `A client sends an <strong>HTTP request</strong> with a <em>method</em> (<code>GET</code> read, <code>POST</code> create, <code>PUT</code>/<code>PATCH</code> update, <code>DELETE</code> remove), a <em>path</em> such as <code>/books/42</code>, optional <em>query parameters</em> (<code>?page=2</code>), <em>headers</em> and sometimes a JSON <em>body</em>. The server replies with a <strong>status code</strong> (200 OK, 201 Created, 404 Not Found, 422 validation error, 500 server error), headers and usually a JSON body. A <strong>REST</strong> API organises these around resources: <code>GET /books</code>, <code>POST /books</code>, <code>GET /books/42</code>, <code>DELETE /books/42</code>.`,
      },
      {
        heading: 'Python Web Frameworks',
        list: [
          '<strong>FastAPI</strong> — APIs first, type-hint driven, async support, automatic OpenAPI docs.',
          '<strong>Flask</strong> — a small, flexible micro-framework; you choose the extras.',
          '<strong>Django</strong> — "batteries included": ORM, admin site, auth, templates; ideal for full websites.',
          'Older frameworks use <strong>WSGI</strong> (one request per worker thread); FastAPI uses <strong>ASGI</strong>, which also supports <code>async</code>, WebSockets and long-lived connections.',
        ],
      },
      {
        heading: 'Setting Up and Running',
        body: `Create a virtual environment and run <code>pip install "fastapi[standard]"</code>, which installs FastAPI plus the Uvicorn server and the <code>fastapi</code> command-line tool. <code>fastapi dev main.py</code> starts a development server with auto-reload at <code>http://127.0.0.1:8000</code>; <code>fastapi run main.py</code> starts it for production. Visit <code>/docs</code> for the interactive Swagger UI, where you can try every endpoint, <code>/redoc</code> for reference docs, and <code>/openapi.json</code> for the machine-readable OpenAPI schema.`,
      },
      {
        heading: 'Path Operations',
        body: `An endpoint is a <strong>path operation</strong>: a decorator naming the HTTP method and path — <code>@app.get("/")</code>, <code>@app.post("/books")</code> — above a function that returns data. Return a dict, list, number, string, Pydantic model or dataclass and FastAPI converts it to JSON. Functions can be plain <code>def</code> (FastAPI runs them in a thread pool) or <code>async def</code> (when you <code>await</code> async libraries). In these lessons, <code>TestClient</code> sends requests to the app directly, so each example prints real responses without starting a server.`,
      },
    ],
    examples: [
      {
        caption: 'Install FastAPI and run the development server',
        code: `python -m venv .venv
.venv\\Scripts\\activate            # Windows  (macOS/Linux: source .venv/bin/activate)
pip install "fastapi[standard]"

fastapi dev main.py                # auto-reloading development server
# Open http://127.0.0.1:8000/docs  -> interactive Swagger UI
# Open http://127.0.0.1:8000/redoc -> ReDoc reference documentation

curl http://127.0.0.1:8000/`,
        output: `INFO     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO     Started reloader process using WatchFiles
{"message":"Hello from FastAPI"}`,
        runnable: false,
      },
      {
        caption: 'A first API (main.py) called with TestClient',
        code: `# main.py
import asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI(title="Webnest Bookstore API", version="1.0.0")

@app.get("/")
def home():
    return {"message": "Hello from FastAPI"}

@app.get("/books")
def list_books():
    return [{"id": 1, "title": "Python Basics"}, {"id": 2, "title": "Deep Python"}]

@app.get("/slow")
async def slow():
    await asyncio.sleep(0.1)          # e.g. waiting for another service
    return {"done": True}

client = TestClient(app)              # sends requests straight to the app
response = client.get("/")
print(response.status_code, response.json())
print(response.headers["content-type"])
print(client.get("/books").json())
print(client.get("/slow").json())
missing = client.get("/authors")
print(missing.status_code, missing.json())`,
        output: `200 {'message': 'Hello from FastAPI'}
application/json
[{'id': 1, 'title': 'Python Basics'}, {'id': 2, 'title': 'Deep Python'}]
{'done': True}
404 {'detail': 'Not Found'}`,
        runnable: false,
      },
      {
        caption: 'The automatically generated OpenAPI schema',
        code: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI(title="Webnest Bookstore API", version="1.0.0")

@app.get("/books", summary="List all books", tags=["books"])
def list_books():
    """Return every book in the catalogue."""
    return []

@app.post("/books", tags=["books"])
def create_book():
    return {}

schema = TestClient(app).get("/openapi.json").json()
print(schema["openapi"], "|", schema["info"])
for path, operations in schema["paths"].items():
    for method, details in operations.items():
        print(method.upper(), path, "->", details["summary"], details["tags"])`,
        output: `3.1.0 | {'title': 'Webnest Bookstore API', 'version': '1.0.0'}
GET /books -> List all books ['books']
POST /books -> Create Book ['books']`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Installing plain "fastapi" and then missing the fastapi CLI and Uvicorn — install "fastapi[standard]".',
      'Using fastapi dev (auto-reload, debug-friendly) in production instead of fastapi run.',
      'Declaring async def endpoints and then calling blocking code (time.sleep, requests, a sync DB driver) inside them, which stalls the server.',
      'Naming the file fastapi.py, which shadows the real package.',
      'Returning objects FastAPI cannot serialise (open files, custom classes without a model).',
    ],
    keyPoints: [
      'FastAPI builds APIs from type-hinted functions and validates everything automatically.',
      'Path operations: @app.get/post/put/patch/delete("/path") above a function that returns data.',
      'fastapi dev main.py for development; /docs and /redoc give free interactive documentation.',
      'Use async def only with awaitable libraries; plain def is fine and runs in a thread pool.',
      'TestClient calls the app directly — ideal for learning and for automated tests.',
    ],
  },

  'path-and-query-parameters': {
    title: 'Path and Query Parameters in FastAPI',
    intro: `Most endpoints need input. The simplest inputs come from the URL itself: <strong>path parameters</strong> identify a specific resource (<code>/books/42</code>) and <strong>query parameters</strong> filter, sort or paginate (<code>/books?author=asha&page=2</code>).

In FastAPI you declare both as ordinary function parameters. The type hints do the work: <code>book_id: int</code> converts <code>"42"</code> to <code>42</code> and rejects <code>"abc"</code> with a clear 422 error. This lesson covers path parameters, enums, query parameters with defaults and optional values, lists, and declarative validation with <code>Path()</code> and <code>Query()</code>.`,
    sections: [
      {
        heading: 'Path Parameters',
        body: `Put the name in braces in the path and add a parameter with the same name: <code>@app.get("/books/{book_id}")</code> with <code>def get_book(book_id: int)</code>. An <code>Enum</code> type restricts a parameter to fixed values and shows them as a dropdown in <code>/docs</code>. The special form <code>{file_path:path}</code> captures the rest of the URL, including slashes. Order matters: declare fixed paths such as <code>/users/me</code> before <code>/users/{user_id}</code>, because the first match wins.`,
      },
      {
        heading: 'Query Parameters',
        body: `Any function parameter that is not in the path is a query parameter. With a default value it is optional (<code>page: int = 1</code>); without one it is required; <code>str | None = None</code> makes it truly optional. <code>bool</code> parameters accept <code>true/false</code>, <code>1/0</code>, <code>yes/no</code> and <code>on/off</code>. A <code>list[str]</code> query parameter collects repeated keys such as <code>?tag=new&tag=sale</code>.`,
      },
      {
        heading: 'Validation with Annotated, Path and Query',
        body: `Add rules with <code>Annotated[type, Query(...)]</code> or <code>Annotated[type, Path(...)]</code>: numeric limits <code>gt</code>, <code>ge</code>, <code>lt</code>, <code>le</code>; string limits <code>min_length</code>, <code>max_length</code> and <code>pattern</code>; plus <code>alias</code>, <code>description</code> and <code>deprecated</code> for the docs. Invalid input never reaches your function — FastAPI answers with <strong>422 Unprocessable Content</strong> and a JSON list describing exactly which parameter failed and why.`,
      },
    ],
    examples: [
      {
        caption: 'Path parameters, type conversion, enums and path captures',
        code: `from enum import Enum
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()
BOOKS = {1: "Python Basics", 2: "Deep Python", 3: "SQL for Beginners"}

class Category(str, Enum):
    python = "python"
    sql = "sql"

@app.get("/books/{book_id}")
def get_book(book_id: int):                     # "2" in the URL becomes the int 2
    return {"id": book_id, "title": BOOKS.get(book_id)}

@app.get("/categories/{category}")
def by_category(category: Category):
    return {"category": category, "is_python": category is Category.python}

@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    return {"path": file_path}

client = TestClient(app)
print(client.get("/books/2").json())
bad = client.get("/books/abc")
print(bad.status_code, bad.json()["detail"][0]["msg"])
print(client.get("/categories/sql").json())
print(client.get("/categories/java").status_code)
print(client.get("/files/reports/2026/sales.csv").json())`,
        output: `{'id': 2, 'title': 'Deep Python'}
422 Input should be a valid integer, unable to parse string as an integer
{'category': 'sql', 'is_python': False}
422
{'path': 'reports/2026/sales.csv'}`,
        runnable: false,
      },
      {
        caption: 'Query parameters: required, optional, defaults, booleans and lists',
        code: `from fastapi import FastAPI, Query
from fastapi.testclient import TestClient
from typing import Annotated

app = FastAPI()

@app.get("/books")
def list_books(
    author: str | None = None,          # optional
    page: int = 1,                      # optional with a default
    in_stock: bool = False,
    tag: Annotated[list[str] | None, Query()] = None,   # ?tag=a&tag=b
):
    return {"author": author, "page": page, "in_stock": in_stock, "tags": tag}

@app.get("/convert")
def convert(amount: float, currency: str):   # both required
    rates = {"usd": 0.012, "eur": 0.011}
    return {"inr": amount, currency: round(amount * rates[currency], 2)}

client = TestClient(app)
print(client.get("/books").json())
print(client.get("/books?author=asha&page=3&in_stock=yes&tag=new&tag=sale").json())
print(client.get("/convert", params={"amount": 1000, "currency": "usd"}).json())
missing = client.get("/convert?amount=1000")
print(missing.status_code, missing.json()["detail"][0]["loc"], missing.json()["detail"][0]["msg"])`,
        output: `{'author': None, 'page': 1, 'in_stock': False, 'tags': None}
{'author': 'asha', 'page': 3, 'in_stock': True, 'tags': ['new', 'sale']}
{'inr': 1000.0, 'usd': 12.0}
422 ['query', 'currency'] Field required`,
        runnable: false,
      },
      {
        caption: 'Declarative validation with Annotated, Query and Path',
        code: `from typing import Annotated
from fastapi import FastAPI, Path, Query
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/search")
def search(
    q: Annotated[str, Query(min_length=2, max_length=50, description="Search text")],
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 10,
    sort: Annotated[str, Query(pattern="^(price|title|rating)$")] = "title",
):
    return {"q": q, "page": page, "size": size, "sort": sort}

@app.get("/books/{book_id}/reviews")
def reviews(book_id: Annotated[int, Path(gt=0, title="Book id")], limit: int = 5):
    return {"book_id": book_id, "limit": limit}

client = TestClient(app)
print(client.get("/search?q=python&page=2&sort=price").json())
for url in ["/search?q=p", "/search?q=python&size=500", "/search?q=python&sort=name", "/books/0/reviews"]:
    error = client.get(url).json()["detail"][0]
    print(url, "->", error["msg"])`,
        output: `{'q': 'python', 'page': 2, 'size': 10, 'sort': 'price'}
/search?q=p -> String should have at least 2 characters
/search?q=python&size=500 -> Input should be less than or equal to 100
/search?q=python&sort=name -> String should match pattern '^(price|title|rating)$'
/books/0/reviews -> Input should be greater than 0`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Declaring /users/{user_id} before /users/me, so "me" is treated as an id and fails validation.',
      'Using a mutable default like tags: list = [] instead of Annotated[list[str] | None, Query()] = None.',
      'Validating inputs by hand inside the function instead of using Query/Path constraints.',
      'Putting identifiers in query strings and filters in paths — paths identify, queries refine.',
      'Forgetting that every path and query value arrives as text; without a type hint it stays a string.',
    ],
    keyPoints: [
      'Path parameters: {name} in the path plus a matching function parameter.',
      'Other parameters are query parameters; defaults make them optional.',
      'Type hints convert and validate: int, float, bool, Enum, list[str].',
      'Annotated with Query()/Path() adds limits such as ge, le, min_length and pattern.',
      'Invalid input gets an automatic 422 response describing the problem.',
    ],
  },

  'request-body-and-pydantic-models': {
    title: 'Request Bodies and Pydantic Models',
    intro: `When a client creates or updates data it sends a JSON <strong>request body</strong>. FastAPI reads bodies through <strong>Pydantic models</strong>: classes that declare the expected fields and their types. Pydantic parses the JSON, converts types (a string <code>"2026-09-27"</code> becomes a <code>date</code>), checks every rule, and hands your function a fully validated Python object — or returns a detailed 422 error without ever calling it.

This lesson covers defining models, field constraints, nested models, custom validators, combining body, path and query parameters, and partial updates with <code>PATCH</code>.`,
    sections: [
      {
        heading: 'Defining a Model',
        body: `Subclass <code>pydantic.BaseModel</code> and annotate fields. Fields without defaults are required; <code>str | None = None</code> is optional. <code>Field()</code> adds constraints (<code>gt</code>, <code>ge</code>, <code>min_length</code>, <code>max_length</code>, <code>pattern</code>), defaults, aliases, descriptions and examples. Models can contain lists, dicts, other models, <code>datetime</code>, <code>Decimal</code>, <code>Enum</code> and more. A parameter typed as a model is read from the body; simple types stay path or query parameters.`,
      },
      {
        heading: 'Validators and Useful Methods',
        body: `<code>@field_validator("name")</code> checks or transforms one field; <code>@model_validator(mode="after")</code> checks rules involving several fields (for example "end date after start date"). Raise <code>ValueError</code> with a helpful message to reject a value. Useful methods: <code>model_dump()</code> (to a dict), <code>model_dump_json()</code>, <code>model_validate(data)</code> (from a dict), <code>model_copy(update=...)</code>, and <code>model_dump(exclude_unset=True)</code>, which returns only the fields the client actually sent — the key to PATCH updates. <code>model_config = ConfigDict(extra="forbid")</code> rejects unknown fields.`,
      },
      {
        heading: 'PUT vs PATCH',
        body: `<strong>PUT</strong> replaces the whole resource, so its model has the same required fields as creation. <strong>PATCH</strong> changes only some fields, so its model makes every field optional; merge <code>model_dump(exclude_unset=True)</code> into the stored data so omitted fields keep their current values.`,
      },
    ],
    examples: [
      {
        caption: 'Create and update books with Pydantic models',
        code: `from datetime import date
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field, field_validator

app = FastAPI()
books = {}

class BookIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: str
    price: float = Field(gt=0, description="Price in rupees")
    tags: list[str] = []
    published: date | None = None

    @field_validator("title", "author")
    @classmethod
    def tidy(cls, value: str) -> str:
        return " ".join(value.split())            # trim and collapse spaces

class BookPatch(BaseModel):                       # every field optional for PATCH
    title: str | None = None
    price: float | None = Field(default=None, gt=0)
    tags: list[str] | None = None

@app.post("/books", status_code=201)
def create_book(book: BookIn):
    book_id = len(books) + 1
    books[book_id] = book.model_dump()
    return {"id": book_id, **books[book_id]}

@app.patch("/books/{book_id}")
def patch_book(book_id: int, changes: BookPatch):
    books[book_id].update(changes.model_dump(exclude_unset=True))
    return {"id": book_id, **books[book_id]}

client = TestClient(app)
r = client.post("/books", json={"title": "  Python   Basics ", "author": "Asha",
                                "price": "450", "published": "2026-01-15"})
print(r.status_code, r.json())
print(client.patch("/books/1", json={"price": 399, "tags": ["sale"]}).json())`,
        output: `201 {'id': 1, 'title': 'Python Basics', 'author': 'Asha', 'price': 450.0, 'tags': [], 'published': '2026-01-15'}
{'id': 1, 'title': 'Python Basics', 'author': 'Asha', 'price': 399.0, 'tags': ['sale'], 'published': '2026-01-15'}`,
        runnable: false,
      },
      {
        caption: 'Nested models, model validators and readable validation errors',
        code: `from datetime import date
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, ConfigDict, Field, model_validator

app = FastAPI()

class Address(BaseModel):
    city: str
    pincode: str = Field(min_length=6, max_length=6)

class OrderItem(BaseModel):
    product: str
    quantity: int = Field(ge=1, le=20)
    unit_price: float = Field(gt=0)

class Order(BaseModel):
    model_config = ConfigDict(extra="forbid")     # unknown fields are errors
    customer: str
    address: Address
    items: list[OrderItem] = Field(min_length=1)
    order_date: date
    delivery_date: date

    @model_validator(mode="after")
    def delivery_after_order(self):
        if self.delivery_date < self.order_date:
            raise ValueError("delivery_date must be on or after order_date")
        return self

@app.post("/orders")
def place_order(order: Order):
    total = sum(item.quantity * item.unit_price for item in order.items)
    return {"customer": order.customer, "city": order.address.city, "total": total}

client = TestClient(app)
good = {
    "customer": "Ravi", "address": {"city": "Pune", "pincode": "411001"},
    "items": [{"product": "Pen", "quantity": 3, "unit_price": 20},
              {"product": "Notebook", "quantity": 2, "unit_price": 60}],
    "order_date": "2026-09-27", "delivery_date": "2026-09-30",
}
print(client.post("/orders", json=good).json())

bad = {**good, "address": {"city": "Pune", "pincode": "41"},
       "items": [{"product": "Pen", "quantity": 0, "unit_price": 20}], "coupon": "FREE"}
response = client.post("/orders", json=bad)
print(response.status_code)
for error in response.json()["detail"]:
    print(".".join(str(part) for part in error["loc"]), "->", error["msg"])

# Model validators run only after every field is valid:
dates_only = {**good, "delivery_date": "2026-09-01"}
print(client.post("/orders", json=dates_only).json()["detail"][0]["msg"])`,
        output: `{'customer': 'Ravi', 'city': 'Pune', 'total': 180.0}
422
body.address.pincode -> String should have at least 6 characters
body.items.0.quantity -> Input should be greater than or equal to 1
body.coupon -> Extra inputs are not permitted
Value error, delivery_date must be on or after order_date`,
        runnable: false,
      },
      {
        caption: 'Body, path and query parameters together',
        code: `from typing import Annotated
from fastapi import Body, FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()

class Review(BaseModel):
    rating: int
    comment: str = ""

@app.put("/books/{book_id}/reviews/{user}")
def upsert_review(
    book_id: int,                              # path
    user: str,                                 # path
    review: Review,                            # body (a model)
    notify: bool = False,                      # query
    source: Annotated[str, Body()] = "web",    # extra single value read from the body
):
    return {"book_id": book_id, "user": user, "review": review, "notify": notify, "source": source}

client = TestClient(app)
body = {"review": {"rating": 5, "comment": "Clear and practical"}, "source": "mobile"}
print(client.put("/books/7/reviews/asha?notify=true", json=body).json())`,
        output: `{'book_id': 7, 'user': 'asha', 'review': {'rating': 5, 'comment': 'Clear and practical'}, 'notify': True, 'source': 'mobile'}`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Reading request.json() by hand instead of declaring a Pydantic model.',
      'Using the creation model for PATCH, which forces clients to resend every field.',
      'Calling model_dump() without exclude_unset=True in a PATCH and overwriting data with defaults.',
      'Accepting unknown fields silently when typos should be rejected — use extra="forbid" where appropriate.',
      'Validating cross-field rules in the endpoint instead of in a model_validator.',
    ],
    keyPoints: [
      'A parameter typed as a Pydantic model is read from the JSON body and fully validated.',
      'Field() adds constraints; field_validator and model_validator add custom rules.',
      'Nested models and lists of models describe complex JSON precisely.',
      'Errors come back as 422 with the location and message of every problem.',
      'PATCH: optional fields + model_dump(exclude_unset=True).',
    ],
  },

  'response-models-status-codes-and-errors': {
    title: 'Response Models, Status Codes and Error Handling',
    intro: `A good API is predictable about what it returns. FastAPI lets you declare the <strong>response model</strong> of each endpoint so that output is validated, documented and — importantly — filtered, which stops internal fields such as password hashes from leaking. You also choose the right <strong>status code</strong> for each outcome and turn failures into clean JSON errors with <code>HTTPException</code> and custom exception handlers.`,
    sections: [
      {
        heading: 'Response Models',
        body: `Declare the return type (<code>-&gt; UserOut</code>) or pass <code>response_model=UserOut</code>. FastAPI converts whatever you return into that model, drops fields that are not in it, validates the result and documents it in <code>/docs</code>. A common pattern is three models per resource: <code>UserCreate</code> (input with password), <code>UserInDB</code> (stored, with the hash) and <code>UserOut</code> (public). Use <code>list[UserOut]</code> for collections and <code>response_model_exclude_none=True</code> to omit empty fields.`,
      },
      {
        heading: 'Status Codes',
        list: [
          '<code>200 OK</code> — successful read or update (the default).',
          '<code>201 Created</code> — a new resource was created: <code>@app.post(..., status_code=201)</code>.',
          '<code>204 No Content</code> — success with no body, typical for DELETE.',
          '<code>400 Bad Request</code>, <code>401 Unauthorized</code>, <code>403 Forbidden</code>, <code>404 Not Found</code>, <code>409 Conflict</code> — client errors you raise yourself.',
          '<code>422 Unprocessable Content</code> — automatic validation errors. <code>500</code> — unhandled server errors.',
          'Use the named constants in <code>fastapi.status</code>, e.g. <code>status.HTTP_404_NOT_FOUND</code>, for readability.',
        ],
      },
      {
        heading: 'Raising and Handling Errors',
        body: `<code>raise HTTPException(status_code=404, detail="Book not found")</code> stops the request and returns <code>{"detail": "Book not found"}</code>; <code>headers=</code> can add headers. For domain errors, define your own exception classes and register a handler with <code>@app.exception_handler(MyError)</code> that returns a <code>JSONResponse</code> — your business code stays free of HTTP details. You can also customise the format of validation errors by handling <code>RequestValidationError</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Filtering sensitive fields with response models',
        code: `import hashlib
from fastapi import FastAPI, status
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()
users = []

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str

@app.post("/users", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate) -> UserOut:
    stored = {
        "id": len(users) + 1,
        "username": user.username,
        "email": user.email,
        "password_hash": hashlib.sha256(user.password.encode()).hexdigest(),  # demo only
        "is_admin": False,
    }
    users.append(stored)
    return stored              # extra keys are filtered out by UserOut

@app.get("/users", response_model=list[UserOut])
def list_users():
    return users

client = TestClient(app)
r = client.post("/users", json={"username": "asha", "email": "asha@example.com", "password": "s3cret!"})
print(r.status_code, r.json())
print(client.get("/users").json())`,
        output: `201 {'id': 1, 'username': 'asha', 'email': 'asha@example.com'}
[{'id': 1, 'username': 'asha', 'email': 'asha@example.com'}]`,
        runnable: false,
      },
      {
        caption: 'HTTPException, 204 responses and custom headers',
        code: `from fastapi import FastAPI, HTTPException, Response, status
from fastapi.testclient import TestClient

app = FastAPI()
books = {1: "Python Basics", 2: "Deep Python"}

@app.get("/books/{book_id}")
def get_book(book_id: int):
    if book_id not in books:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Book {book_id} not found")
    return {"id": book_id, "title": books[book_id]}

@app.post("/books", status_code=status.HTTP_201_CREATED)
def add_book(title: str, response: Response):
    if title in books.values():
        raise HTTPException(status.HTTP_409_CONFLICT, detail="A book with this title already exists")
    book_id = max(books) + 1
    books[book_id] = title
    response.headers["Location"] = f"/books/{book_id}"
    return {"id": book_id, "title": title}

@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int):
    if books.pop(book_id, None) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Book not found")

client = TestClient(app)
print(client.get("/books/1").json())
r = client.get("/books/9")
print(r.status_code, r.json())
r = client.post("/books?title=SQL Basics")
print(r.status_code, r.json(), r.headers["location"])
print(client.post("/books?title=Deep Python").json())
r = client.delete("/books/2")
print(r.status_code, repr(r.text))
print(client.delete("/books/2").status_code)`,
        output: `{'id': 1, 'title': 'Python Basics'}
404 {'detail': 'Book 9 not found'}
201 {'id': 3, 'title': 'SQL Basics'} /books/3
{'detail': 'A book with this title already exists'}
204 ''
404`,
        runnable: false,
      },
      {
        caption: 'Custom exceptions with exception handlers',
        code: `from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient

class InsufficientStock(Exception):
    def __init__(self, product, available):
        self.product = product
        self.available = available

app = FastAPI()
STOCK = {"pen": 5, "lamp": 0}

@app.exception_handler(InsufficientStock)
async def stock_handler(request: Request, exc: InsufficientStock):
    return JSONResponse(status_code=409, content={
        "error": "insufficient_stock", "product": exc.product, "available": exc.available,
    })

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    fields = [".".join(str(p) for p in e["loc"][1:]) for e in exc.errors()]
    return JSONResponse(status_code=422, content={"error": "invalid_input", "fields": fields})

def reserve(product, quantity):               # business logic: no HTTP details here
    if STOCK.get(product, 0) < quantity:
        raise InsufficientStock(product, STOCK.get(product, 0))
    STOCK[product] -= quantity
    return STOCK[product]

@app.post("/reserve/{product}")
def reserve_endpoint(product: str, quantity: int):
    return {"product": product, "left": reserve(product, quantity)}

client = TestClient(app)
print(client.post("/reserve/pen?quantity=2").json())
r = client.post("/reserve/lamp?quantity=1")
print(r.status_code, r.json())
r = client.post("/reserve/pen?quantity=lots")
print(r.status_code, r.json())`,
        output: `{'product': 'pen', 'left': 3}
409 {'error': 'insufficient_stock', 'product': 'lamp', 'available': 0}
422 {'error': 'invalid_input', 'fields': ['quantity']}`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Returning database rows directly without a response model and leaking password hashes or internal flags.',
      'Returning 200 for everything, or 500 for client mistakes.',
      'Returning an error dict with status 200 instead of raising HTTPException.',
      'Sending a body with 204 No Content responses.',
      'Scattering HTTP status logic through business code instead of using custom exceptions and handlers.',
    ],
    keyPoints: [
      'Response models validate, document and filter output — separate input and output models.',
      'Choose status codes deliberately: 201 for create, 204 for delete, 404/409 for client errors.',
      'HTTPException returns {"detail": ...} with the status you choose.',
      'Custom exceptions plus @app.exception_handler keep business logic independent of HTTP.',
      'RequestValidationError handlers let you customise 422 responses.',
    ],
  },

  'dependency-injection-and-routers': {
    title: 'Dependency Injection and APIRouter',
    intro: `Many endpoints need the same things: a database session, the current user, pagination settings, an API key check. FastAPI's <strong>dependency injection</strong> system lets you write that logic once as a function (or class) and ask for it with <code>Depends()</code>. FastAPI calls the dependency, passes the result into your endpoint, handles cleanup, and even documents the parameters the dependency needs.

As an application grows, <strong>APIRouter</strong> lets you split endpoints into modules — <code>books.py</code>, <code>users.py</code> — with shared prefixes, tags and dependencies. This lesson covers both.`,
    sections: [
      {
        heading: 'Depends()',
        body: `A dependency is any callable whose parameters FastAPI can fill (query parameters, headers, other dependencies…). Declare it with <code>Annotated[Type, Depends(func)]</code>; a type alias such as <code>Pagination = Annotated[dict, Depends(pagination)]</code> keeps signatures short. Dependencies can depend on other dependencies, forming a tree; within one request each dependency is called once and its result is cached. Classes work too — <code>Depends(MyClass)</code> calls the constructor.`,
      },
      {
        heading: 'Dependencies with yield',
        body: `A dependency that uses <code>yield</code> runs setup code, gives a value to the endpoint, and runs cleanup after the response is built — exactly what a database session or a file handle needs. Put cleanup in <code>finally</code> so it always runs. Dependencies can also raise <code>HTTPException</code>, which is how authentication and permission checks are usually implemented.`,
      },
      {
        heading: 'APIRouter and Project Structure',
        body: `Create <code>router = APIRouter(prefix="/books", tags=["books"])</code> in its own module, decorate endpoints with <code>@router.get(...)</code>, and add it to the app with <code>app.include_router(router)</code>. Routers and <code>include_router</code> accept <code>dependencies=[Depends(...)]</code> to protect a whole group of endpoints. A common layout is <code>app/main.py</code>, <code>app/routers/</code>, <code>app/schemas.py</code> (Pydantic models), <code>app/models.py</code> (database models), <code>app/dependencies.py</code> and <code>app/config.py</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Reusable dependencies: functions, classes and sub-dependencies',
        code: `from typing import Annotated
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.testclient import TestClient

app = FastAPI()
PRODUCTS = [f"product-{n:02d}" for n in range(1, 26)]

def pagination(page: Annotated[int, Query(ge=1)] = 1, size: Annotated[int, Query(ge=1, le=50)] = 10):
    return {"offset": (page - 1) * size, "limit": size}

Pagination = Annotated[dict, Depends(pagination)]

class SortOptions:                                   # a class used as a dependency
    def __init__(self, sort: str = "name", desc: bool = False):
        self.sort = sort
        self.desc = desc

def api_key(x_api_key: Annotated[str | None, Header()] = None):   # reads the X-API-Key header
    if x_api_key != "demo-key":
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return "partner-42"

def current_partner(partner_id: Annotated[str, Depends(api_key)]):   # depends on api_key
    return {"id": partner_id, "plan": "gold"}

@app.get("/products")
def list_products(page: Pagination, sorting: Annotated[SortOptions, Depends()]):
    items = sorted(PRODUCTS, reverse=sorting.desc)
    return items[page["offset"]: page["offset"] + page["limit"]]

@app.get("/partner/report")
def report(partner: Annotated[dict, Depends(current_partner)], page: Pagination):
    return {"partner": partner, "page": page}

client = TestClient(app)
print(client.get("/products?page=3&size=4").json())
print(client.get("/products?size=3&desc=true").json())
print(client.get("/partner/report").json())
print(client.get("/partner/report", headers={"X-API-Key": "demo-key"}).json())`,
        output: `['product-09', 'product-10', 'product-11', 'product-12']
['product-25', 'product-24', 'product-23']
{'detail': 'Invalid or missing API key'}
{'partner': {'id': 'partner-42', 'plan': 'gold'}, 'page': {'offset': 0, 'limit': 10}}`,
        runnable: false,
      },
      {
        caption: 'A yield dependency with setup and cleanup',
        code: `from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()
log = []

class FakeSession:
    def __init__(self):
        log.append("open session")
    def query(self, book_id):
        if book_id > 2:
            raise LookupError(book_id)
        return {"id": book_id, "title": ["Python Basics", "Deep Python"][book_id - 1]}
    def close(self):
        log.append("close session")

def get_session():
    session = FakeSession()
    try:
        yield session                     # the endpoint runs here
    finally:
        session.close()                   # always runs, even after errors

@app.get("/books/{book_id}")
def get_book(book_id: int, session: Annotated[FakeSession, Depends(get_session)]):
    try:
        return session.query(book_id)
    except LookupError:
        raise HTTPException(404, "Book not found")

client = TestClient(app)
print(client.get("/books/2").json())
print(client.get("/books/5").status_code)
print(log)`,
        output: `{'id': 2, 'title': 'Deep Python'}
404
['open session', 'close session', 'open session', 'close session']`,
        runnable: false,
      },
      {
        caption: 'Splitting an application with APIRouter',
        code: `from typing import Annotated
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException
from fastapi.testclient import TestClient

# app/dependencies.py
def require_admin(x_role: Annotated[str, Header()] = "user"):
    if x_role != "admin":
        raise HTTPException(403, "Admins only")

# app/routers/books.py
books_router = APIRouter(prefix="/books", tags=["books"])

@books_router.get("/")
def list_books():
    return ["Python Basics", "Deep Python"]

@books_router.get("/{book_id}")
def get_book(book_id: int):
    return {"id": book_id}

# app/routers/admin.py — every route here requires an admin
admin_router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])

@admin_router.get("/stats")
def stats():
    return {"books": 2, "users": 10}

# app/main.py
app = FastAPI()
app.include_router(books_router)
app.include_router(admin_router, prefix="/api")      # final path: /api/admin/stats

client = TestClient(app)
print(client.get("/books/").json(), client.get("/books/7").json())
print(client.get("/api/admin/stats").status_code)
print(client.get("/api/admin/stats", headers={"X-Role": "admin"}).json())
print(client.get("/admin/stats").status_code)                 # only mounted under /api`,
        output: `['Python Basics', 'Deep Python'] {'id': 7}
403
{'books': 2, 'users': 10}
404`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Creating database sessions or clients inside every endpoint instead of using a dependency.',
      'Forgetting try/finally in a yield dependency, so cleanup is skipped when the endpoint fails.',
      'Calling the dependency yourself (Depends(get_db())) instead of passing the function (Depends(get_db)).',
      'Putting all endpoints in one huge main.py instead of APIRouter modules.',
      'Repeating auth checks in each endpoint instead of router-level dependencies.',
    ],
    keyPoints: [
      'Depends() injects reusable logic: sessions, current user, pagination, permission checks.',
      'Dependencies can have their own parameters and sub-dependencies; results are cached per request.',
      'yield dependencies provide setup and guaranteed cleanup.',
      'APIRouter groups endpoints with a shared prefix, tags and dependencies.',
      'Annotated type aliases keep endpoint signatures short and consistent.',
    ],
  },
}
