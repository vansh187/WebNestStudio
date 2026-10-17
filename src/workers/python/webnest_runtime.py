"""Runs a learner's FastAPI project inside Pyodide (see apiRuntime.worker.js).

The worker writes the workspace with write_project(), imports it with load_app(), then sends
each HTTP request through request(). Every function returns JSON text, so the worker never
has to manage Python proxies.
"""
import asyncio
import concurrent.futures
import contextlib
import importlib
import inspect
import json
import os
import shutil
import sqlite3
import sys
import time
import traceback
import types

APP_ROOT = "/app"
PACKAGE_DIR = APP_ROOT + "/app/"
DATA_DIR = "/data"
DB_PATH = DATA_DIR + "/app.db"
MAX_ROWS = 500
LAYERS = ("api", "services", "repositories", "schemas", "core", "models")
AVAILABLE = "the Python standard library, FastAPI, Pydantic, SQLAlchemy, bcrypt and PyJWT"

_app = None
_trace = None
_debug_breakpoints = set()
_debug_pause_bridge = None
_debug_step = None
_original_connect = sqlite3.connect


# ------------------------------------------------------------------ setup
def _patch_threads():
    """Pyodide has no threads. FastAPI runs sync endpoints and dependencies through
    anyio.to_thread.run_sync, so run them inline instead."""
    import anyio.to_thread

    async def run_sync(func, *args, abandon_on_cancel=False, cancellable=None, limiter=None):
        return func(*args)

    anyio.to_thread.run_sync = run_sync


class _NoIOSelector:
    """Stands in for a selector: there are no sockets to watch, only timers."""

    def select(self, timeout=None):
        if timeout:
            time.sleep(min(timeout, 0.05))
        return []

    def close(self):
        pass


class _InlineLoop(asyncio.BaseEventLoop):
    """A socket-free event loop that can run to completion from synchronous code.
    Pyodide's own loop cannot block, and the standard loops need sockets."""

    def __init__(self):
        super().__init__()
        self._selector = _NoIOSelector()

    def _process_events(self, event_list):
        pass

    def _write_to_self(self):
        pass


class _TaskStatus:
    def __init__(self):
        self.done = False
        self.value = None

    def started(self, value=None):
        self.done = True
        self.value = value


PORTAL_DEADLINE_SECONDS = 10


class _LoopFuture(concurrent.futures.Future):
    """A future whose result() runs the private loop until the task finishes. A plain
    concurrent future would wait for another thread that does not exist."""

    def __init__(self, portal):
        super().__init__()
        self._portal = portal

    def result(self, timeout=None):
        if not self.done():
            self._portal.drive_until(self.done)
        return super().result(0)

    def exception(self, timeout=None):
        if not self.done():
            self._portal.drive_until(self.done)
        return super().exception(0)


_shared_loop = None


def _portal_loop():
    # One loop for every portal: with real threads each portal's loop keeps running in
    # the background, so tasks from several TestClient sessions (two websocket users
    # chatting) must all make progress whenever any of them is driven.
    global _shared_loop
    if _shared_loop is None or _shared_loop.is_closed():
        _shared_loop = _InlineLoop()
    return _shared_loop


class _InlinePortal:
    """Replaces anyio's BlockingPortal, which runs the event loop in a second thread.
    Starlette's TestClient only needs call, start_task_soon and start_task, so run them
    on a private loop in the same thread instead."""

    def __init__(self):
        self.loop = _portal_loop()
        self.tasks = set()

    def _run(self, func, args, kwargs=None):
        async def runner():
            result = func(*args, **(kwargs or {}))
            if inspect.isawaitable(result):
                result = await result
            return result
        return runner()

    def _block(self, awaitable):
        # Pyodide always reports its own loop as running, which run_until_complete
        # refuses. Hide it while the private loop runs, then put it back.
        async def guarded():
            try:
                return await asyncio.wait_for(awaitable, PORTAL_DEADLINE_SECONDS)
            except asyncio.TimeoutError:
                raise TimeoutError(
                    f"TestClient waited more than {PORTAL_DEADLINE_SECONDS} seconds for the app"
                ) from None

        previous = asyncio.events._get_running_loop()
        asyncio.events._set_running_loop(None)
        try:
            return self.loop.run_until_complete(guarded())
        finally:
            asyncio.events._set_running_loop(previous)

    def call(self, func, *args):
        return self._block(self._run(func, args))

    def drive_until(self, condition):
        async def wait():
            deadline = time.monotonic() + PORTAL_DEADLINE_SECONDS
            while not condition():
                if time.monotonic() > deadline:
                    raise TimeoutError("TestClient waited too long for the app to respond")
                await asyncio.sleep(0)

        self._block(wait())

    def _schedule(self, func, args, kwargs=None):
        future = _LoopFuture(self)
        task = self.loop.create_task(self._run(func, args, kwargs))
        self.tasks.add(task)

        def done(finished):
            self.tasks.discard(finished)
            if finished.cancelled():
                future.cancel()
            elif finished.exception() is not None:
                future.set_exception(finished.exception())
            else:
                future.set_result(finished.result())

        task.add_done_callback(done)
        return future

    def start_task_soon(self, func, *args, name=None):
        return self._schedule(func, args)

    def start_task(self, func, *args, name=None):
        status = _TaskStatus()
        future = self._schedule(func, args, {"task_status": status})

        self.drive_until(lambda: status.done or future.done())
        if future.done() and future.exception() is not None:
            raise future.exception()
        return future, status.value

    def close(self):
        pending = list(self.tasks)
        for task in pending:
            task.cancel()

        async def drain():
            await asyncio.gather(*pending, return_exceptions=True)

        if pending:
            self._block(drain())


@contextlib.contextmanager
def _inline_blocking_portal(*args, **kwargs):
    portal = _InlinePortal()
    try:
        yield portal
    finally:
        portal.close()


def _patch_test_client():
    """Lets lesson code use fastapi.testclient.TestClient in the browser."""
    import anyio.from_thread

    anyio.from_thread.start_blocking_portal = _inline_blocking_portal


def _stub_uvicorn():
    stub = types.ModuleType("uvicorn")

    def run(*args, **kwargs):
        print("[webnest] uvicorn.run() skipped: your API already runs inside the browser.")

    stub.run = run
    sys.modules["uvicorn"] = stub


def _install_webnest_db():
    """`import webnest_db; webnest_db.connect()` opens the playground database. Later
    phases point it at other databases without changing learner code."""
    module = types.ModuleType("webnest_db")

    def connect():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    module.connect = connect
    module.DB_PATH = DB_PATH
    sys.modules["webnest_db"] = module


def setup():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.chdir(DATA_DIR)  # so sqlite3.connect("app.db") in learner code finds the same file
    _patch_threads()
    _patch_test_client()
    _stub_uvicorn()
    _install_webnest_db()
    _install_monitoring()
    sqlite3.connect = _traced_connect
    if APP_ROOT not in sys.path:
        sys.path.insert(0, APP_ROOT)
    return json.dumps({"ok": True})


# ------------------------------------------------------------------ errors
def _short_path(filename):
    return filename[len(APP_ROOT) + 1:] if filename.startswith(PACKAGE_DIR) else filename


def format_error(error):
    """A traceback that shows only the learner's own files, plus the error itself."""
    frames = [
        f'  File "{_short_path(frame.filename)}", line {frame.lineno}, in {frame.name}\n    {(frame.line or "").strip()}'
        for frame in traceback.extract_tb(error.__traceback__)
        if frame.filename.startswith(PACKAGE_DIR)
    ]
    message = "".join(traceback.format_exception_only(type(error), error)).strip()
    if isinstance(error, SyntaxError) and error.filename:
        message = message.replace(error.filename, _short_path(error.filename))
    if isinstance(error, ModuleNotFoundError) and not (error.name or "").startswith("app"):
        message += f"\nOnly {AVAILABLE} are available in the playground."
    head = "Traceback (most recent call last):\n" + "\n".join(frames) + "\n" if frames else ""
    return head + message


# ------------------------------------------------------------------ tracing
def layer_of(filename):
    if not filename.startswith(PACKAGE_DIR):
        return None
    rel = filename[len(PACKAGE_DIR):]
    head = rel.split("/", 1)[0]
    if head in LAYERS:
        return head
    return rel[:-3] if rel.endswith(".py") else rel


class Trace:
    def __init__(self):
        self.started = time.perf_counter()
        self.calls = []
        self.sql = []
        self.stack = []
        self.by_frame = {}

    def now(self):
        return round((time.perf_counter() - self.started) * 1000, 2)


_TOOL = getattr(getattr(sys, "monitoring", None), "PROFILER_ID", None)
_events = None


def _is_user_code(code):
    return code.co_filename.startswith(PACKAGE_DIR) and not code.co_name.startswith("<")


def _on_start(code, offset):
    if not _is_user_code(code):
        return sys.monitoring.DISABLE
    trace = _trace
    if trace is not None:
        index = len(trace.calls)
        trace.calls.append({
            "fn": code.co_qualname,
            "file": _short_path(code.co_filename),
            "line": code.co_firstlineno,
            "layer": layer_of(code.co_filename),
            "depth": len(trace.stack),
            "start": trace.now(),
            "ms": None,
            "error": None,
        })
        trace.by_frame[id(sys._getframe(1))] = index
        trace.stack.append(index)
    return None


def _on_line(code, line_number):
    """Pause the worker at a requested user breakpoint or next step location."""
    global _debug_step
    if not _is_user_code(code):
        return sys.monitoring.DISABLE
    bridge = _debug_pause_bridge
    if bridge is None:
        return None
    frame = sys._getframe(1)
    filename = _short_path(code.co_filename)
    frame_id = id(frame)
    depth = 0
    parent = frame.f_back
    while parent is not None and parent.f_code.co_filename.startswith(PACKAGE_DIR):
        depth += 1
        parent = parent.f_back
    mode, target_id, target_depth = _debug_step or (None, None, None)
    should_step = (
        mode == "into"
        or (mode == "over" and (frame_id == target_id or depth < target_depth))
        or (mode == "out" and depth < target_depth)
    )
    if (filename, int(line_number)) not in _debug_breakpoints and not should_step:
        return None
    _debug_step = None
    local_values = {}
    for name, value in list(frame.f_locals.items())[:30]:
        try:
            rendered = repr(value)
        except Exception:
            rendered = "<unavailable>"
        local_values[name] = rendered[:300]
    command = bridge(filename, int(line_number), json.dumps(local_values), depth)
    if command == 1:
        _debug_step = ("into", frame_id, depth)
    elif command == 2:
        _debug_step = ("over", frame_id, depth)
    elif command == 3:
        _debug_step = ("out", frame_id, depth)
    return None


def _finish(frame, error=None):
    trace = _trace
    if trace is None:
        return
    index = trace.by_frame.pop(id(frame), None)
    if index is None:
        return
    call = trace.calls[index]
    call["ms"] = round(trace.now() - call["start"], 2)
    if error is not None:
        call["error"] = type(error).__name__
    if index in trace.stack:
        trace.stack.remove(index)


def _on_return(code, offset, retval):
    if not _is_user_code(code):
        return sys.monitoring.DISABLE
    _finish(sys._getframe(1))
    return None


def _on_unwind(code, offset, exc):
    # PY_UNWIND cannot be disabled per code object, so filter here.
    if _is_user_code(code):
        _finish(sys._getframe(1), exc)
    return None


def _on_yield(code, offset, retval):
    # A paused generator dependency (get_db) or coroutine stays open, but it is no longer
    # the caller of whatever runs next.
    if not _is_user_code(code):
        return sys.monitoring.DISABLE
    trace = _trace
    if trace is not None:
        index = trace.by_frame.get(id(sys._getframe(1)))
        if index is not None and index in trace.stack:
            trace.stack.remove(index)
    return None


def _install_monitoring():
    global _events
    if _TOOL is None or _events is not None:
        return
    mon = sys.monitoring
    mon.use_tool_id(_TOOL, "webnest-trace")
    mon.register_callback(_TOOL, mon.events.PY_START, _on_start)
    mon.register_callback(_TOOL, mon.events.LINE, _on_line)
    mon.register_callback(_TOOL, mon.events.PY_RETURN, _on_return)
    mon.register_callback(_TOOL, mon.events.PY_UNWIND, _on_unwind)
    mon.register_callback(_TOOL, mon.events.PY_YIELD, _on_yield)
    # LINE is added per request, only while debugging (see request()): a callback on every
    # line of user code would slow down every normal request.
    _events = mon.events.PY_START | mon.events.PY_RETURN | mon.events.PY_UNWIND | mon.events.PY_YIELD


def configure_debugger(breakpoints_json, pause_bridge=None):
    """Install breakpoints for one request. pause_bridge blocks the worker at a stop."""
    global _debug_breakpoints, _debug_pause_bridge, _debug_step
    try:
        pairs = json.loads(breakpoints_json or "[]")
        _debug_breakpoints = {(str(item["file"]), int(item["line"])) for item in pairs}
    except (TypeError, ValueError, KeyError, json.JSONDecodeError):
        _debug_breakpoints = set()
    _debug_pause_bridge = pause_bridge
    _debug_step = None


def _record_sql(statement):
    trace = _trace
    if trace is None:
        return
    text = " ".join(str(statement).split())
    upper = text.upper()
    if upper in ("BEGIN", "COMMIT", "ROLLBACK") or upper.startswith(("PRAGMA", "BEGIN ", "SAVEPOINT", "RELEASE")):
        return
    caller = trace.stack[-1] if trace.stack else None
    trace.sql.append({
        "sql": text[:2000],
        "at": trace.now(),
        "call": caller,
        "layer": trace.calls[caller]["layer"] if caller is not None else None,
    })


def _traced_connect(*args, **kwargs):
    conn = _original_connect(*args, **kwargs)
    conn.set_trace_callback(_record_sql)
    return conn




# ------------------------------------------------------------------ project
def _error(message, **extra):
    return json.dumps({"ok": False, "error": message, **extra})


def write_project(files_json):
    """Replace /app with the workspace's Python files (other files stay in the editor)."""
    try:
        files = json.loads(files_json)
    except (TypeError, json.JSONDecodeError) as error:
        return _error(f"The project files could not be read: {error}")
    try:
        shutil.rmtree(APP_ROOT, ignore_errors=True)
        os.makedirs(APP_ROOT, exist_ok=True)
        for item in files:
            name = item.get("name") if isinstance(item, dict) else None
            if not isinstance(name, str):
                continue
            target = os.path.normpath(os.path.join(APP_ROOT, name))
            if not target.startswith(APP_ROOT + "/"):
                continue  # never write outside /app
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, "w", encoding="utf-8") as handle:
                handle.write(str(item.get("content") or ""))
    except OSError as error:
        return _error(f"Could not write the project files: {error}")
    return json.dumps({"ok": True})


def load_app():
    """Import app.main and find the FastAPI instance. Returns the OpenAPI document."""
    global _app
    from fastapi import FastAPI

    for name in list(sys.modules):
        if name == "app" or name.startswith("app."):
            del sys.modules[name]
    importlib.invalidate_caches()
    _app = None
    try:
        module = importlib.import_module("app.main")
        candidate = getattr(module, "app", None)
        if not isinstance(candidate, FastAPI):
            candidate = next((value for value in vars(module).values() if isinstance(value, FastAPI)), None)
        if candidate is None:
            return _error("app/main.py must create a FastAPI instance, for example: app = FastAPI()")
        schema = candidate.openapi()
    except ModuleNotFoundError as error:
        if error.name in ("app", "app.main"):
            return _error("app/main.py is missing. The backend needs it to create the FastAPI app.")
        return _error(format_error(error))
    except Exception as error:  # noqa: BLE001 - any error in the learner's code is reported, not raised
        return _error(format_error(error))
    _app = candidate
    try:
        return json.dumps({"ok": True, "openapi": schema}, default=str)
    except (TypeError, ValueError) as error:
        return _error(f"The API loaded, but its OpenAPI description could not be built: {error}")


async def request(spec_json):
    """Send one HTTP request to the loaded app through ASGI, without a network."""
    global _trace
    import httpx

    if _app is None:
        return json.dumps({"status": 0, "error": "Run the project first so the API is loaded."})
    try:
        spec = json.loads(spec_json)
        if not isinstance(spec, dict):
            raise ValueError("the request must be an object")
    except (TypeError, ValueError) as error:  # json.JSONDecodeError is a ValueError
        return json.dumps({"status": 0, "error": f"The request could not be read: {error}"})
    body = spec.get("body")
    content = body.encode("utf-8") if isinstance(body, str) and body != "" else None
    _trace = Trace()
    if _events is not None:
        events = _events | sys.monitoring.events.LINE if _debug_pause_bridge is not None else _events
        sys.monitoring.set_events(_TOOL, events)
    started = time.perf_counter()
    result = {}
    try:
        transport = httpx.ASGITransport(app=_app)
        async with httpx.AsyncClient(transport=transport, base_url="http://localhost:8000") as client:
            response = await client.request(
                str(spec.get("method") or "GET"),
                str(spec.get("path") or "/"),
                headers=spec.get("headers") or None,
                content=content,
            )
        result = {
            "status": response.status_code,
            "reason": response.reason_phrase,
            "headers": list(response.headers.multi_items()),
            "body": response.text,
        }
    except httpx.InvalidURL as error:
        result = {"status": 0, "error": f"Invalid path: {error}"}
    except Exception as error:  # noqa: BLE001 - an unhandled exception in the learner's endpoint is a 500
        detail = format_error(error)
        print(detail, file=sys.stderr)
        result = {
            "status": 500,
            "reason": "Internal Server Error",
            "headers": [["content-type", "text/plain; charset=utf-8"]],
            "body": "Internal Server Error",
            "error": detail,
        }
    finally:
        if _events is not None:
            sys.monitoring.set_events(_TOOL, 0)
        trace, _trace = _trace, None
        configure_debugger("[]", None)
    result["ms"] = round((time.perf_counter() - started) * 1000, 2)
    result["trace"] = {"calls": trace.calls, "sql": trace.sql}
    return json.dumps(result, default=str)


# ------------------------------------------------------------------ database
def split_sql(script):
    """Split a SQL script into (line_number, statement) pairs."""
    statements = []
    buffer = []
    start_line = None
    for number, line in enumerate(str(script or "").splitlines(), start=1):
        if start_line is None:
            if not line.strip() or line.strip().startswith("--"):
                continue
            start_line = number
        buffer.append(line)
        candidate = "\n".join(buffer)
        if sqlite3.complete_statement(candidate):
            statements.append((start_line, candidate.strip()))
            buffer = []
            start_line = None
    if buffer and "\n".join(buffer).strip():
        statements.append((start_line, "\n".join(buffer).strip()))
    return statements


def _connect():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = _original_connect(DB_PATH, isolation_level=None, timeout=5)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _quote(name):
    return '"' + str(name).replace('"', '""') + '"'


def _clear(conn):
    """Empty the database in place. Deleting the file instead would leave the learner's
    open connections (a SQLAlchemy pool, a module-level connection) writing to a file
    that no longer exists, so their changes would vanish from the Database tab."""
    conn.execute("PRAGMA foreign_keys = OFF")
    try:
        objects = conn.execute(
            "SELECT type, name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' AND type IN ('view', 'table')"
        ).fetchall()
        for kind, name in sorted(objects, key=lambda item: item[0] != "view"):  # views first
            conn.execute(f"DROP {kind.upper()} IF EXISTS {_quote(name)}")
        try:
            conn.execute("DELETE FROM sqlite_sequence")  # restart AUTOINCREMENT ids
        except sqlite3.OperationalError:
            pass  # no AUTOINCREMENT table was ever created
        try:
            conn.execute("VACUUM")
        except sqlite3.OperationalError:
            pass  # another connection is busy; the space is reclaimed later
    finally:
        conn.execute("PRAGMA foreign_keys = ON")


def table_count():
    try:
        conn = _connect()
    except (OSError, sqlite3.Error):
        return 0
    try:
        return conn.execute(
            "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
        ).fetchone()[0]
    except sqlite3.DatabaseError:
        return 0  # not a valid database file; Run will rebuild it from schema.sql
    finally:
        conn.close()


def apply_schema(script, rebuild=False):
    """Run schema.sql in one transaction. Rebuild empties the database first."""
    try:
        conn = _connect()
    except (OSError, sqlite3.Error) as error:
        return _error(f"Could not open the database: {error}", line=0, applied=0)
    done = 0
    try:
        if rebuild:
            _clear(conn)
        conn.execute("BEGIN")
        for line, statement in split_sql(script):
            if statement.upper().startswith("PRAGMA"):
                continue  # foreign keys are already on; PRAGMAs are no-ops inside a transaction
            try:
                conn.execute(statement)
            except sqlite3.Error as error:
                conn.execute("ROLLBACK")
                return json.dumps({"ok": False, "line": line, "statement": statement[:500],
                                   "error": str(error), "applied": 0})
            done += 1
        conn.execute("COMMIT")
        return json.dumps({"ok": True, "applied": done})
    except sqlite3.Error as error:
        if conn.in_transaction:
            conn.execute("ROLLBACK")
        return _error(str(error), line=0, applied=0)
    finally:
        conn.close()


def run_sql(script):
    """SQL console: run one or more statements and return the last result set."""
    result = {"columns": [], "rows": [], "rowcount": 0, "truncated": False, "statements": 0}
    try:
        conn = _connect()
    except (OSError, sqlite3.Error) as error:
        result.update({"error": f"Could not open the database: {error}", "line": 0})
        return json.dumps(result)
    try:
        for line, statement in split_sql(script):
            try:
                cursor = conn.execute(statement)
                rows = cursor.fetchmany(MAX_ROWS + 1) if cursor.description else None
            except sqlite3.Error as error:
                if conn.in_transaction:
                    conn.execute("ROLLBACK")  # a failed batch inserts nothing
                result.update({"error": str(error), "line": line})
                return json.dumps(result, default=str)
            result["statements"] += 1
            if rows is not None:
                result["columns"] = [column[0] for column in cursor.description]
                result["truncated"] = len(rows) > MAX_ROWS
                result["rows"] = [list(row) for row in rows[:MAX_ROWS]]
                result["rowcount"] = len(result["rows"])
            else:
                result["columns"], result["rows"] = [], []
                result["rowcount"] = cursor.rowcount
        return json.dumps(result, default=str)
    finally:
        conn.close()


def describe_schema():
    try:
        conn = _connect()
    except (OSError, sqlite3.Error) as error:
        return json.dumps({"tables": [], "error": str(error)})
    try:
        tables = []
        found = conn.execute(
            "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").fetchall()
        for name, create_sql in found:
            quoted = _quote(name)
            columns = [
                {"name": c[1], "type": c[2], "notnull": bool(c[3]), "default": c[4], "pk": c[5]}
                for c in conn.execute(f"PRAGMA table_info({quoted})")
            ]
            fks = [
                {"column": f[3], "table": f[2], "to": f[4], "on_delete": f[6]}
                for f in conn.execute(f"PRAGMA foreign_key_list({quoted})")
            ]
            indexes = []
            for idx in conn.execute(f"PRAGMA index_list({quoted})"):
                cols = [i[2] for i in conn.execute(f"PRAGMA index_info({_quote(idx[1])})")]
                indexes.append({"name": idx[1], "unique": bool(idx[2]), "origin": idx[3], "columns": cols})
            rows = conn.execute(f"SELECT COUNT(*) FROM {quoted}").fetchone()[0]
            tables.append({"name": name, "sql": create_sql, "columns": columns, "foreignKeys": fks,
                           "indexes": indexes, "rows": rows})
        return json.dumps({"tables": tables}, default=str)
    except sqlite3.Error as error:
        return json.dumps({"tables": [], "error": str(error)})
    finally:
        conn.close()


def reset_database():
    """Delete every table, view and row, keeping the same file (see _clear)."""
    try:
        conn = _connect()
    except (OSError, sqlite3.Error) as error:
        return _error(f"Could not open the database: {error}")
    try:
        _clear(conn)
        return json.dumps({"ok": True})
    except sqlite3.DatabaseError:
        # The file is not a valid database at all, so nothing can be holding it open usefully.
        conn.close()
        try:
            os.remove(DB_PATH)
        except FileNotFoundError:
            pass
        except OSError as error:
            return _error(f"Could not delete the database: {error}")
        return json.dumps({"ok": True})
    finally:
        conn.close()
