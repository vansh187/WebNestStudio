// Python course — web development with FastAPI, part 2: databases, authentication,
// middleware/background tasks/WebSockets, testing, deployment, and Flask basics.
// Keys are slugs matching topics in codelabDefaults.js.
export const pythonFastapiB = {
  'fastapi-with-a-database': {
    title: 'Building a CRUD API with FastAPI and SQLAlchemy',
    intro: `Real APIs store data in a database. This lesson combines everything so far — path and query parameters, Pydantic models, response models, status codes and dependencies — with the <strong>SQLAlchemy ORM</strong> from the Database Connectivity module to build a complete CRUD API for a task tracker.

You will see the standard structure used in production FastAPI projects: an engine and a session dependency, ORM models for tables, separate Pydantic <em>schemas</em> for input and output, and endpoints that translate between them. The example uses SQLite, but switching to PostgreSQL or MySQL only means changing the database URL.`,
    sections: [
      {
        heading: 'The Moving Parts',
        list: [
          '<strong>Engine</strong> — <code>create_engine(DATABASE_URL)</code>, created once. SQLite needs <code>connect_args={"check_same_thread": False}</code> because FastAPI may use the session from another thread.',
          '<strong>Session dependency</strong> — a <code>yield</code> dependency that opens a <code>Session</code> per request and always closes it.',
          '<strong>ORM models</strong> — classes mapped to tables (<code>models.py</code>).',
          '<strong>Schemas</strong> — Pydantic models for requests and responses (<code>schemas.py</code>): <code>TaskCreate</code>, <code>TaskUpdate</code>, <code>TaskOut</code>.',
          '<strong>from_attributes</strong> — <code>model_config = ConfigDict(from_attributes=True)</code> lets a response schema read attributes straight from an ORM object.',
        ],
      },
      {
        heading: 'Endpoint Patterns',
        body: `<strong>Create</strong>: build an ORM object from <code>payload.model_dump()</code>, <code>add</code>, <code>commit</code>, <code>refresh</code> (to load generated ids and defaults) and return it with 201. <strong>Read one</strong>: <code>session.get(Model, id)</code>, raising 404 when it is <code>None</code>. <strong>List</strong>: <code>select()</code> with filters, <code>order_by</code>, <code>offset</code> and <code>limit</code>. <strong>Update</strong>: apply <code>model_dump(exclude_unset=True)</code> with <code>setattr</code>. <strong>Delete</strong>: <code>session.delete()</code> and return 204. Catch <code>IntegrityError</code> to turn duplicate values into 409 Conflict.`,
      },
      {
        heading: 'Async Drivers and SQLModel',
        body: `This lesson uses synchronous SQLAlchemy in plain <code>def</code> endpoints, which FastAPI runs in a thread pool — simple and perfectly fast for most apps. For very high concurrency you can use SQLAlchemy's asyncio extension (<code>create_async_engine</code>, <code>AsyncSession</code>) with async drivers such as <code>asyncpg</code> or <code>aiosqlite</code> in <code>async def</code> endpoints. <strong>SQLModel</strong>, by FastAPI's author, merges SQLAlchemy models and Pydantic schemas into one class — convenient for small projects.`,
      },
    ],
    examples: [
      {
        caption: 'A complete task-tracker CRUD API',
        code: `from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.testclient import TestClient
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import String, create_engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column
from sqlalchemy.pool import StaticPool

# --- database.py ---------------------------------------------------------
DATABASE_URL = "sqlite://"            # in-memory; use "sqlite:///tasks.db" or a PostgreSQL URL
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)

class Base(DeclarativeBase):
    pass

def get_session():
    with Session(engine) as session:  # closed automatically after the response
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

# --- models.py -------------------------------------------------------------
class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), unique=True)
    priority: Mapped[int] = mapped_column(default=3)
    done: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

Base.metadata.create_all(engine)

# --- schemas.py ------------------------------------------------------------
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    priority: int = Field(default=3, ge=1, le=5)

class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    priority: int | None = Field(default=None, ge=1, le=5)
    done: bool | None = None

class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)   # read from ORM objects
    id: int
    title: str
    priority: int
    done: bool

# --- main.py ---------------------------------------------------------------
app = FastAPI(title="Tasks API")

def get_task_or_404(session: Session, task_id: int) -> Task:
    task = session.get(Task, task_id)
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@app.post("/tasks", status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, session: SessionDep) -> TaskOut:
    task = Task(**payload.model_dump())
    session.add(task)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, detail="A task with this title already exists")
    session.refresh(task)
    return task

@app.get("/tasks")
def list_tasks(session: SessionDep, done: bool | None = None,
               offset: Annotated[int, Query(ge=0)] = 0,
               limit: Annotated[int, Query(ge=1, le=100)] = 20) -> list[TaskOut]:
    query = select(Task).order_by(Task.priority, Task.id)
    if done is not None:
        query = query.where(Task.done == done)
    return session.scalars(query.offset(offset).limit(limit)).all()

@app.get("/tasks/{task_id}")
def read_task(task_id: int, session: SessionDep) -> TaskOut:
    return get_task_or_404(session, task_id)

@app.patch("/tasks/{task_id}")
def update_task(task_id: int, changes: TaskUpdate, session: SessionDep) -> TaskOut:
    task = get_task_or_404(session, task_id)
    for field, value in changes.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    session.commit()
    session.refresh(task)
    return task

@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, session: SessionDep):
    session.delete(get_task_or_404(session, task_id))
    session.commit()

# --- trying it out ---------------------------------------------------------
client = TestClient(app)
for title, priority in [("Write report", 2), ("Review PR", 1), ("Plan sprint", 3)]:
    print(client.post("/tasks", json={"title": title, "priority": priority}).json())
print(client.post("/tasks", json={"title": "Review PR"}).status_code)
print(client.patch("/tasks/2", json={"done": True}).json())
print([t["title"] for t in client.get("/tasks").json()])
print([t["title"] for t in client.get("/tasks?done=false").json()])
print(client.delete("/tasks/3").status_code, client.get("/tasks/3").json())`,
        output: `{'id': 1, 'title': 'Write report', 'priority': 2, 'done': False}
{'id': 2, 'title': 'Review PR', 'priority': 1, 'done': False}
{'id': 3, 'title': 'Plan sprint', 'priority': 3, 'done': False}
409
{'id': 2, 'title': 'Review PR', 'priority': 1, 'done': True}
['Review PR', 'Write report', 'Plan sprint']
['Write report', 'Plan sprint']
204 {'detail': 'Task not found'}`,
        runnable: false,
      },
      {
        caption: 'Switching databases is a one-line change',
        code: `# .env
DATABASE_URL=postgresql+psycopg://tasks_app:secret@localhost:5432/tasks

# database.py
import os
from sqlalchemy import create_engine

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///tasks.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)`,
        output: `(no output — the rest of the application is unchanged)`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Creating a global Session shared by all requests instead of one session per request via a dependency.',
      'Returning ORM objects without from_attributes=True in the response schema.',
      'Forgetting session.refresh() after commit and returning objects without generated ids or defaults.',
      'Using the same Pydantic model for create, update and output.',
      'Calling Base.metadata.create_all() to change existing tables in production — use Alembic migrations.',
    ],
    keyPoints: [
      'Engine once, Session per request through a yield dependency.',
      'ORM models describe tables; Pydantic schemas describe the API.',
      'from_attributes=True lets response models read ORM objects.',
      'CRUD: add/commit/refresh, session.get, select with filters and pagination, setattr updates, delete.',
      'Translate database errors (IntegrityError) into proper HTTP status codes.',
    ],
  },

  'authentication-with-oauth2-and-jwt': {
    title: 'Authentication with OAuth2 and JWT',
    intro: `Most APIs must know <em>who</em> is calling. The standard approach for FastAPI APIs is <strong>token authentication</strong>: the user logs in once with a username and password, receives a signed <strong>JSON Web Token (JWT)</strong>, and sends it with every later request in the <code>Authorization: Bearer &lt;token&gt;</code> header.

This lesson builds that flow step by step: hashing passwords safely, issuing and verifying JWTs, a <code>get_current_user</code> dependency that protects endpoints, and role-based permissions.`,
    sections: [
      {
        heading: 'Password Hashing',
        body: `Never store passwords, only <strong>password hashes</strong> made with a slow, salted algorithm designed for passwords — Argon2 or bcrypt, never plain SHA-256 or MD5. The <code>pwdlib</code> library (<code>pip install "pwdlib[argon2]"</code>) provides <code>PasswordHash.recommended()</code> with <code>hash()</code> and <code>verify()</code>. Each hash includes its own random salt, so the same password hashes differently every time.`,
      },
      {
        heading: 'JSON Web Tokens',
        body: `A JWT has three base64url parts separated by dots: a header, a payload of <em>claims</em> (<code>sub</code> — the user, <code>exp</code> — expiry time, plus anything you add such as a role) and a signature. The server signs it with a secret key (<code>pip install pyjwt</code>, <code>jwt.encode(payload, SECRET_KEY, algorithm="HS256")</code>), so it can later verify with <code>jwt.decode()</code> that the token is genuine and unexpired without a database lookup. The payload is only encoded, <em>not encrypted</em> — never put secrets in it. Keep tokens short-lived and the secret key in an environment variable.`,
      },
      {
        heading: 'OAuth2 Password Flow in FastAPI',
        body: `<code>OAuth2PasswordRequestForm</code> reads <code>username</code> and <code>password</code> from a form-encoded login request (so the <strong>Authorize</strong> button in <code>/docs</code> works). <code>OAuth2PasswordBearer(tokenUrl="token")</code> is a dependency that extracts the bearer token from the header and returns 401 when it is missing. A <code>get_current_user</code> dependency decodes the token and loads the user; endpoints simply declare <code>user: CurrentUser</code>. Always answer bad credentials with the same vague message so attackers cannot tell which part was wrong.`,
      },
    ],
    examples: [
      {
        caption: 'Hashing and verifying passwords with pwdlib',
        code: `# pip install "pwdlib[argon2]"
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()        # Argon2 with safe defaults

first = password_hash.hash("s3cret!")
second = password_hash.hash("s3cret!")
print(first.split("$")[1], len(first) > 60)       # algorithm name, long hash
print("same password, different hashes:", first != second)
print(password_hash.verify("s3cret!", first), password_hash.verify("wrong", first))`,
        output: `argon2id True
same password, different hashes: True
True False`,
        runnable: false,
      },
      {
        caption: 'Login, JWT access tokens and protected endpoints',
        code: `import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.testclient import TestClient
from pwdlib import PasswordHash
from pydantic import BaseModel

SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-use-a-long-random-value")
ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 30

password_hash = PasswordHash.recommended()
USERS = {   # normally a database table
    "asha": {"username": "asha", "full_name": "Asha Rao", "role": "admin",
             "hashed_password": password_hash.hash("asha-pass")},
    "ravi": {"username": "ravi", "full_name": "Ravi Kumar", "role": "member",
             "hashed_password": password_hash.hash("ravi-pass")},
}

class User(BaseModel):
    username: str
    full_name: str
    role: str

def create_access_token(username: str, minutes: int = ACCESS_TOKEN_MINUTES) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    return jwt.encode({"sub": username, "exp": expires}, SECRET_KEY, algorithm=ALGORITHM)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    unauthorized = HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials",
                                 headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Token expired",
                            headers={"WWW-Authenticate": "Bearer"})
    except jwt.InvalidTokenError:
        raise unauthorized
    user = USERS.get(payload.get("sub"))
    if user is None:
        raise unauthorized
    return User(**user)

CurrentUser = Annotated[User, Depends(get_current_user)]

def require_admin(user: CurrentUser) -> User:
    if user.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Admins only")
    return user

app = FastAPI()

@app.post("/token")
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = USERS.get(form.username)
    if not user or not password_hash.verify(form.password, user["hashed_password"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password",
                            headers={"WWW-Authenticate": "Bearer"})
    return {"access_token": create_access_token(user["username"]), "token_type": "bearer"}

@app.get("/users/me")
def read_me(user: CurrentUser) -> User:
    return user

@app.get("/admin/reports")
def reports(admin: Annotated[User, Depends(require_admin)]):
    return {"generated_for": admin.username, "open_orders": 12}

client = TestClient(app)
print(client.post("/token", data={"username": "asha", "password": "nope"}).json())

token = client.post("/token", data={"username": "asha", "password": "asha-pass"}).json()
print(token["token_type"], token["access_token"].count(".") + 1, "parts")
auth = {"Authorization": f"Bearer {token['access_token']}"}
print(client.get("/users/me", headers=auth).json())
print(client.get("/admin/reports", headers=auth).json())

ravi = client.post("/token", data={"username": "ravi", "password": "ravi-pass"}).json()["access_token"]
print(client.get("/admin/reports", headers={"Authorization": f"Bearer {ravi}"}).json())

print(client.get("/users/me").json())
print(client.get("/users/me", headers={"Authorization": "Bearer not-a-real-token"}).json())
expired = create_access_token("asha", minutes=-1)
print(client.get("/users/me", headers={"Authorization": f"Bearer {expired}"}).json())`,
        output: `{'detail': 'Incorrect username or password'}
bearer 3 parts
{'username': 'asha', 'full_name': 'Asha Rao', 'role': 'admin'}
{'generated_for': 'asha', 'open_orders': 12}
{'detail': 'Admins only'}
{'detail': 'Not authenticated'}
{'detail': 'Could not validate credentials'}
{'detail': 'Token expired'}`,
        runnable: false,
      },
      {
        caption: 'What is inside a JWT (encoded, not encrypted)',
        code: `import base64
import json
import jwt

token = jwt.encode({"sub": "asha", "role": "admin"}, "secret-key", algorithm="HS256")
header, payload, signature = token.split(".")

def b64decode(part):
    return json.loads(base64.urlsafe_b64decode(part + "=" * (-len(part) % 4)))

print(b64decode(header))
print(b64decode(payload))                       # anyone can read the claims
print(jwt.decode(token, "secret-key", algorithms=["HS256"]))
try:
    jwt.decode(token, "wrong-key", algorithms=["HS256"])
except jwt.InvalidSignatureError as e:
    print("InvalidSignatureError:", e)`,
        output: `{'alg': 'HS256', 'typ': 'JWT'}
{'sub': 'asha', 'role': 'admin'}
{'sub': 'asha', 'role': 'admin'}
InvalidSignatureError: Signature verification failed`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Storing plain-text passwords or fast hashes (MD5/SHA-256) instead of Argon2 or bcrypt.',
      'Hard-coding the JWT secret in source code; load it from the environment and make it long and random.',
      'Putting sensitive data in the JWT payload — it is readable by anyone.',
      'Issuing tokens that never expire.',
      'Revealing whether the username or the password was wrong.',
      'Checking permissions inside each endpoint instead of in reusable dependencies.',
    ],
    keyPoints: [
      'Hash passwords with pwdlib (Argon2) — hash() to store, verify() to check.',
      'A JWT carries signed claims (sub, exp, role); jwt.decode verifies signature and expiry.',
      'OAuth2PasswordRequestForm handles login; OAuth2PasswordBearer extracts the bearer token.',
      'get_current_user as a dependency protects any endpoint; role dependencies add authorisation.',
      'Use 401 for missing/invalid credentials and 403 for insufficient permissions.',
    ],
  },

  'middleware-background-tasks-and-websockets': {
    title: 'Middleware, CORS, Background Tasks, Lifespan and WebSockets',
    intro: `Beyond individual endpoints, a production API needs behaviour that wraps every request (logging, timing, security headers), permission for browser front ends on other domains to call it (<strong>CORS</strong>), work that continues after the response is sent (<strong>background tasks</strong>), resources created at start-up and released at shutdown (<strong>lifespan</strong>), and sometimes real-time two-way communication (<strong>WebSockets</strong>). FastAPI supports all of these.`,
    sections: [
      {
        heading: 'Middleware and CORS',
        body: `A middleware is a function that sees every request before it reaches an endpoint and every response on its way out: <code>@app.middleware("http")</code> with <code>async def</code> that calls <code>await call_next(request)</code>. Use it for timing, request ids, logging and headers. Browsers block JavaScript on <code>https://myshop.com</code> from calling <code>https://api.myshop.com</code> unless the API allows that origin; add <code>CORSMiddleware</code> with an explicit <code>allow_origins</code> list (avoid <code>"*"</code> together with credentials).`,
      },
      {
        heading: 'Background Tasks and Lifespan',
        body: `Declare a <code>BackgroundTasks</code> parameter and call <code>background_tasks.add_task(func, *args)</code>; the task runs after the response has been sent — good for sending emails or writing audit logs. For heavy or critical jobs use a real task queue (Celery, RQ, arq). A <strong>lifespan</strong> function decorated with <code>@asynccontextmanager</code> runs code before the app starts serving (load a model, open a connection pool) and after <code>yield</code> at shutdown; pass it with <code>FastAPI(lifespan=lifespan)</code>.`,
      },
      {
        heading: 'WebSockets',
        body: `HTTP is request–response; a <strong>WebSocket</strong> keeps one connection open so both sides can send messages at any time — chats, live dashboards, notifications, multiplayer games. <code>@app.websocket("/ws")</code> receives a <code>WebSocket</code>; call <code>await websocket.accept()</code>, then loop on <code>receive_text()</code>/<code>send_text()</code> (or the JSON variants) and handle <code>WebSocketDisconnect</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Timing middleware and CORS',
        code: `import time
import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://webnest.example", "http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.middleware("http")
async def add_request_info(request: Request, call_next):
    started = time.perf_counter()
    response = await call_next(request)             # run the endpoint
    response.headers["X-Request-ID"] = str(uuid.uuid4())
    response.headers["X-Process-Time-ms"] = f"{(time.perf_counter() - started) * 1000:.1f}"
    return response

@app.get("/books")
def books():
    return ["Python Basics"]

client = TestClient(app)
r = client.get("/books", headers={"Origin": "https://webnest.example"})
print(r.json(), "X-Request-ID" in r.headers, "X-Process-Time-ms" in r.headers)
print("allowed origin:", r.headers.get("access-control-allow-origin"))

preflight = client.options("/books", headers={"Origin": "https://evil.example",
                                              "Access-Control-Request-Method": "GET"})
print("preflight from unknown origin:", preflight.status_code, preflight.headers.get("access-control-allow-origin"))`,
        output: `['Python Basics'] True True
allowed origin: https://webnest.example
preflight from unknown origin: 400 None`,
        runnable: false,
      },
      {
        caption: 'Background tasks and the lifespan handler',
        code: `from contextlib import asynccontextmanager
from fastapi import BackgroundTasks, FastAPI
from fastapi.testclient import TestClient

events = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    events.append("startup: open connection pool, load settings")
    app.state.greeting = "Welcome"
    yield                                         # the application serves requests here
    events.append("shutdown: close connection pool")

app = FastAPI(lifespan=lifespan)

def send_welcome_email(email: str):
    events.append(f"email sent to {email}")      # runs after the response is returned

@app.post("/signup")
def signup(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_welcome_email, email)
    events.append("response ready")
    return {"message": f"{app.state.greeting}, {email}!"}

with TestClient(app) as client:                   # the with block triggers lifespan events
    print(client.post("/signup?email=asha@example.com").json())
for event in events:
    print(event)`,
        output: `{'message': 'Welcome, asha@example.com!'}
startup: open connection pool, load settings
response ready
email sent to asha@example.com
shutdown: close connection pool`,
        runnable: false,
      },
      {
        caption: 'A WebSocket chat endpoint',
        code: `from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.testclient import TestClient

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, message: dict):
        for ws in self.active:
            await ws.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{username}")
async def chat(websocket: WebSocket, username: str):
    await manager.connect(websocket)
    try:
        while True:
            text = await websocket.receive_text()
            await manager.broadcast({"from": username, "text": text, "online": len(manager.active)})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

client = TestClient(app)
with client.websocket_connect("/ws/asha") as asha:
    with client.websocket_connect("/ws/ravi") as ravi:
        asha.send_text("Hi Ravi!")
        print("asha sees:", asha.receive_json())
        print("ravi sees:", ravi.receive_json())
        ravi.send_text("Hello!")
        print("asha sees:", asha.receive_json())`,
        output: `asha sees: {'from': 'asha', 'text': 'Hi Ravi!', 'online': 2}
ravi sees: {'from': 'asha', 'text': 'Hi Ravi!', 'online': 2}
asha sees: {'from': 'ravi', 'text': 'Hello!', 'online': 2}`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Allowing every origin with allow_origins=["*"] in production, especially with credentials.',
      'Doing slow, blocking work in middleware, which delays every request.',
      'Using BackgroundTasks for long or must-not-fail jobs instead of a proper task queue.',
      'Using the deprecated @app.on_event("startup") instead of a lifespan handler.',
      'Not handling WebSocketDisconnect, leaving dead connections in the list.',
    ],
    keyPoints: [
      'Middleware wraps every request/response: timing, logging, request ids, headers.',
      'CORSMiddleware lists exactly which front-end origins may call the API.',
      'BackgroundTasks run small jobs after the response is sent.',
      'A lifespan context manager handles start-up and shutdown resources.',
      'WebSockets give real-time two-way communication with accept/receive/send.',
    ],
  },

  'testing-fastapi-applications': {
    title: 'Testing FastAPI Applications',
    intro: `Automated tests let you change an API with confidence. FastAPI apps are easy to test: <code>TestClient</code> (built on HTTPX) sends requests straight to the app without starting a server, <strong>pytest</strong> runs the tests, and <code>app.dependency_overrides</code> swaps real dependencies — the database, the current user, external services — for test versions.

This lesson shows a typical project test suite with fixtures, a separate test database, authentication overrides and parametrised tests.`,
    sections: [
      {
        heading: 'The Basics',
        body: `Install <code>pytest</code> (HTTPX is already included in <code>fastapi[standard]</code>). Put tests in files named <code>test_*.py</code> with functions named <code>test_*</code>, create <code>client = TestClient(app)</code>, send requests with <code>client.get/post/patch/delete</code>, and <code>assert</code> on <code>response.status_code</code> and <code>response.json()</code>. Run <code>pytest -q</code>. Test the unhappy paths too: 404s, 401s, 409s and validation errors are part of your API contract.`,
      },
      {
        heading: 'Fixtures and Dependency Overrides',
        body: `pytest <strong>fixtures</strong> prepare what tests need and clean up afterwards; a fixture with <code>yield</code> works like a FastAPI yield dependency. <code>app.dependency_overrides[get_session] = get_test_session</code> makes every endpoint use a fresh in-memory test database, and <code>app.dependency_overrides[get_current_user] = lambda: fake_user</code> skips real authentication. Clear the overrides after each test so tests stay independent. For async code, <code>httpx.AsyncClient</code> with <code>ASGITransport</code> and <code>pytest-anyio</code> or <code>pytest-asyncio</code> let tests themselves be async.`,
      },
    ],
    examples: [
      {
        caption: 'test_api.py — fixtures, overrides and parametrised tests',
        code: `# test_api.py      run with:  pytest -q
from typing import Annotated

import pytest
from fastapi import Depends, FastAPI, HTTPException
from fastapi.testclient import TestClient

# ---- the application under test (normally imported from app.main) ----
app = FastAPI()

def get_store():                        # the "database" dependency
    raise RuntimeError("real database not available in tests")

def get_current_user():                 # the auth dependency
    raise HTTPException(401, "Not authenticated")

Store = Annotated[dict, Depends(get_store)]
User = Annotated[str, Depends(get_current_user)]

@app.post("/notes", status_code=201)
def create_note(text: str, store: Store, user: User):
    note_id = len(store) + 1
    store[note_id] = {"text": text, "owner": user}
    return {"id": note_id, **store[note_id]}

@app.get("/notes/{note_id}")
def read_note(note_id: int, store: Store, user: User):
    if note_id not in store:
        raise HTTPException(404, "Note not found")
    return store[note_id]

# ---- tests ----
@pytest.fixture
def store():
    return {}

@pytest.fixture
def client(store):
    app.dependency_overrides[get_store] = lambda: store
    app.dependency_overrides[get_current_user] = lambda: "asha"
    yield TestClient(app)
    app.dependency_overrides.clear()        # keep tests independent

def test_create_and_read_note(client):
    created = client.post("/notes?text=Buy milk")
    assert created.status_code == 201
    assert created.json() == {"id": 1, "text": "Buy milk", "owner": "asha"}
    assert client.get("/notes/1").json()["text"] == "Buy milk"

def test_missing_note_returns_404(client):
    response = client.get("/notes/99")
    assert response.status_code == 404
    assert response.json() == {"detail": "Note not found"}

def test_requires_authentication(store):
    app.dependency_overrides[get_store] = lambda: store    # no user override this time
    response = TestClient(app).post("/notes?text=x")
    app.dependency_overrides.clear()
    assert response.status_code == 401

@pytest.mark.parametrize("url, expected", [
    ("/notes/abc", 422),        # invalid path parameter
    ("/notes", 405),            # GET not allowed on the collection
])
def test_bad_requests(client, url, expected):
    assert client.get(url).status_code == expected`,
        output: `.....                                                                    [100%]
5 passed in 0.21s`,
        runnable: false,
      },
      {
        caption: 'Testing asynchronously with httpx.AsyncClient',
        code: `# pip install pytest anyio
import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

app = FastAPI()

@app.get("/ping")
async def ping():
    return {"pong": True}

@pytest.mark.anyio
async def test_ping():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/ping")
    assert response.json() == {"pong": True}`,
        output: `.                                                                        [100%]
1 passed in 0.05s`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Testing against the real production or development database.',
      'Forgetting to clear dependency_overrides, so one test changes the behaviour of the next.',
      'Only testing the happy path and never checking 401, 404, 409 and 422 responses.',
      'Sharing state between tests through module-level variables instead of fixtures.',
      'Starting a real server with uvicorn for tests when TestClient can call the app directly.',
    ],
    keyPoints: [
      'TestClient sends requests to the app in-process; pytest runs and reports the tests.',
      'Fixtures prepare clients, databases and data, and clean up with yield.',
      'app.dependency_overrides swaps databases, users and external services in tests.',
      'Parametrised tests cover many inputs and error cases compactly.',
      'httpx.AsyncClient with ASGITransport tests async code from async tests.',
    ],
  },

  'deploying-fastapi-applications': {
    title: 'Configuring and Deploying FastAPI Applications',
    intro: `An API only becomes useful once it runs somewhere others can reach it. This lesson covers the path from laptop to production: managing configuration with environment variables and <strong>pydantic-settings</strong>, running with the production server, using multiple worker processes, packaging the app in a <strong>Docker</strong> image, and the checklist of things to get right — HTTPS, secrets, logging, health checks and database migrations.`,
    sections: [
      {
        heading: 'Configuration with pydantic-settings',
        body: `Settings that differ between environments — database URL, secret keys, allowed origins, debug flags — belong in environment variables, not in code (the <em>twelve-factor</em> approach). <code>pydantic-settings</code> (<code>pip install pydantic-settings</code>) reads them into a typed, validated <code>BaseSettings</code> class, optionally from a <code>.env</code> file during development. Missing required settings fail fast at start-up, and wrong types are rejected. Never commit <code>.env</code> files containing real secrets.`,
      },
      {
        heading: 'Running in Production',
        body: `<code>fastapi run main.py</code> (or <code>uvicorn main:app --host 0.0.0.0 --port 8000</code>) starts the production server without auto-reload. Add <code>--workers 4</code> to run several processes and use several CPU cores; in Kubernetes, you usually run one process per container and scale the number of containers instead. Put the app behind a reverse proxy or load balancer (Nginx, Traefik, a cloud load balancer) that terminates HTTPS, and pass <code>--proxy-headers</code> so FastAPI sees the real client address and scheme.`,
      },
      {
        heading: 'Production Checklist',
        list: [
          'Secrets from environment variables or a secrets manager; debug off.',
          'HTTPS everywhere; strict CORS origins.',
          'Structured logging and a <code>/health</code> endpoint for load balancers and orchestrators.',
          'Database migrations (Alembic) run as a deployment step, never create_all() on a live database.',
          'Pinned dependency versions, a small non-root Docker image, and automated tests in CI.',
          'Popular hosts: any VPS with Docker, Render, Railway, Fly.io, Google Cloud Run, AWS (ECS, App Runner, Lambda with Mangum) and Azure Container Apps.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Typed settings from environment variables',
        code: `# config.py      pip install pydantic-settings
import os
from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_")

    app_name: str = "Webnest API"
    debug: bool = False
    database_url: str = "sqlite:///app.db"
    secret_key: str = Field(min_length=32)                 # required: no default
    allowed_origins: list[str] = ["http://localhost:5173"]

@lru_cache                                                  # read the environment once
def get_settings() -> Settings:
    return Settings()

# Simulating the environment a server would provide:
os.environ["APP_SECRET_KEY"] = "x" * 40
os.environ["APP_DEBUG"] = "true"
os.environ["APP_ALLOWED_ORIGINS"] = '["https://webnest.example"]'

settings = get_settings()
print(settings.app_name, settings.debug, settings.database_url)
print(settings.allowed_origins, len(settings.secret_key))

os.environ["APP_SECRET_KEY"] = "too-short"
try:
    Settings()
except Exception as e:
    print(type(e).__name__, "-", e.errors()[0]["msg"])`,
        output: `Webnest API True sqlite:///app.db
['https://webnest.example'] 40
ValidationError - String should have at least 32 characters`,
        runnable: false,
      },
      {
        caption: 'Production commands',
        code: `pip freeze > requirements.txt                 # or use uv / Poetry lock files

fastapi run app/main.py --port 8000           # production server, no reload
fastapi run app/main.py --workers 4           # four worker processes

# Equivalent with Uvicorn directly, behind a reverse proxy:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --proxy-headers

alembic upgrade head                          # apply database migrations before starting`,
        output: `INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started parent process [1]
INFO:     Started server process [8]
INFO:     Started server process [9]
INFO:     Started server process [10]
INFO:     Started server process [11]
INFO:     Application startup complete.`,
        runnable: false,
      },
      {
        caption: 'A Dockerfile for a FastAPI application',
        code: `# Dockerfile
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /code

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD ["fastapi", "run", "app/main.py", "--port", "8000", "--proxy-headers"]

# Build and run:
#   docker build -t webnest-api .
#   docker run -p 8000:8000 --env-file .env webnest-api`,
        output: `Successfully tagged webnest-api:latest
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Running fastapi dev / --reload in production.',
      'Committing .env files or hard-coding secrets in the Docker image.',
      'Running containers as root and shipping huge images with build tools included.',
      'Creating tables with create_all() on a production database instead of running migrations.',
      'Forgetting --proxy-headers behind a proxy, so generated URLs use http instead of https.',
    ],
    keyPoints: [
      'Keep configuration in environment variables; pydantic-settings validates it.',
      'fastapi run (or uvicorn) serves production traffic; --workers uses more CPU cores.',
      'Terminate HTTPS at a reverse proxy or load balancer.',
      'Docker packages the app and its dependencies into a reproducible image.',
      'Add health checks, logging, migrations and CI tests to every deployment.',
    ],
  },

  'flask-basics': {
    title: 'Flask Basics',
    intro: `<strong>Flask</strong> is Python's classic micro-framework. It gives you routing, request and response handling, HTML templating with Jinja2 and a development server — and leaves everything else (database, forms, authentication) to extensions you choose. It is simple, flexible and still used by a huge number of applications, so every Python web developer should be able to read and write Flask code.

This lesson covers routes and URL variables, handling requests and returning JSON, templates, blueprints and testing — and compares Flask with FastAPI so you can choose between them.`,
    sections: [
      {
        heading: 'Core Concepts',
        body: `Create an app with <code>app = Flask(__name__)</code> and map URLs to <em>view functions</em> with <code>@app.route("/path")</code> or the shortcuts <code>@app.get</code> and <code>@app.post</code>. URL variables use converters: <code>/books/&lt;int:book_id&gt;</code>. The global <code>request</code> object holds <code>request.args</code> (query string), <code>request.form</code>, <code>request.get_json()</code> and headers. Return a string, a dict (converted to JSON), a <code>(body, status)</code> tuple, or use <code>jsonify()</code>, <code>redirect()</code> and <code>abort(404)</code>. Run with <code>flask --app app run --debug</code>.`,
      },
      {
        heading: 'Templates and Blueprints',
        body: `<code>render_template("page.html", **context)</code> renders Jinja2 templates from the <code>templates/</code> folder: <code>{{ variable }}</code> prints (auto-escaped against XSS), <code>{% for %}</code> and <code>{% if %}</code> control output, and <code>{% extends "base.html" %}</code> shares layouts. <strong>Blueprints</strong> group related routes, like FastAPI's APIRouter, and are registered with <code>app.register_blueprint(bp, url_prefix="/api")</code>.`,
      },
      {
        heading: 'Flask or FastAPI?',
        list: [
          '<strong>FastAPI</strong> — JSON APIs, automatic validation and docs from type hints, async support, high performance.',
          '<strong>Flask</strong> — server-rendered websites and small services, a mature extension ecosystem (Flask-SQLAlchemy, Flask-Login, Flask-WTF), very little magic.',
          '<strong>Django</strong> — large, full-featured websites needing an admin panel, ORM, auth and more out of the box.',
          'Flask validates nothing by itself; add Pydantic or marshmallow when you need input validation.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Routes, URL variables, query strings and JSON',
        code: `# app.py      pip install flask      run: flask --app app run --debug
from flask import Flask, abort, jsonify, request

app = Flask(__name__)
books = {1: {"title": "Python Basics", "price": 450}, 2: {"title": "Deep Python", "price": 899}}

@app.get("/")
def home():
    return "<h1>Webnest Books</h1>"

@app.get("/books")
def list_books():
    max_price = request.args.get("max_price", type=int)      # ?max_price=500
    result = [{"id": i, **b} for i, b in books.items() if max_price is None or b["price"] <= max_price]
    return jsonify(result)

@app.get("/books/<int:book_id>")
def get_book(book_id):
    if book_id not in books:
        abort(404, description="Book not found")
    return books[book_id]                                   # dicts become JSON

@app.post("/books")
def add_book():
    data = request.get_json()
    if not data or "title" not in data:
        return {"error": "title is required"}, 400
    book_id = max(books) + 1
    books[book_id] = {"title": data["title"], "price": data.get("price", 0)}
    return {"id": book_id, **books[book_id]}, 201

client = app.test_client()                                  # Flask's built-in test client
print(client.get("/").data.decode())
print(client.get("/books?max_price=500").get_json())
print(client.get("/books/2").get_json(), client.get("/books/9").status_code)
r = client.post("/books", json={"title": "SQL Basics", "price": 350})
print(r.status_code, r.get_json())
print(client.post("/books", json={"price": 10}).get_json())`,
        output: `<h1>Webnest Books</h1>
[{'id': 1, 'price': 450, 'title': 'Python Basics'}]
{'price': 899, 'title': 'Deep Python'} 404
201 {'id': 3, 'price': 350, 'title': 'SQL Basics'}
{'error': 'title is required'}`,
        runnable: false,
      },
      {
        caption: 'Jinja2 templates, blueprints and error handlers',
        code: `from flask import Blueprint, Flask, render_template_string

# templates/books.html (inlined here with render_template_string)
PAGE = """<h2>{{ heading }}</h2>
<ul>{% for book in books %}
  <li>{{ book.title }}{% if book.price < 500 %} (budget){% endif %}</li>{% endfor %}
</ul>"""

shop = Blueprint("shop", __name__)
BOOKS = [{"title": "Python Basics", "price": 450}, {"title": "<script>alert(1)</script>", "price": 999}]

@shop.get("/books")
def books_page():
    return render_template_string(PAGE, heading="All books", books=BOOKS)

app = Flask(__name__)
app.register_blueprint(shop, url_prefix="/shop")

@app.errorhandler(404)
def not_found(error):
    return {"error": "not found"}, 404

client = app.test_client()
print(client.get("/shop/books").data.decode())               # note the escaped <script>
print(client.get("/nowhere").get_json())`,
        output: `<h2>All books</h2>
<ul>
  <li>Python Basics (budget)</li>
  <li>&lt;script&gt;alert(1)&lt;/script&gt;</li>
</ul>
{'error': 'not found'}`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Running the development server (flask run --debug) in production — use Gunicorn or Waitress.',
      'Trusting request.get_json() data without validating it.',
      'Marking user content as safe in templates, which disables escaping and allows XSS.',
      'Keeping all routes in one file instead of using blueprints.',
      'Forgetting to set a strong SECRET_KEY when using sessions.',
    ],
    keyPoints: [
      'Flask maps routes to view functions; request holds args, form, JSON and headers.',
      'Return strings, dicts, (body, status) tuples, or use jsonify, redirect and abort.',
      'Jinja2 templates auto-escape output and support loops, conditions and inheritance.',
      'Blueprints organise routes; app.test_client() tests them.',
      'Choose FastAPI for typed JSON APIs, Flask for flexible small apps and server-rendered pages, Django for full-featured sites.',
    ],
  },
}
