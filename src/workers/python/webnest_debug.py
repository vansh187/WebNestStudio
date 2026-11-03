"""Debugger pieces shared by the FastAPI runtime (webnest_runtime.py) and the Python
playground (pyodideRunner.worker.js): how a value is shown in the Variables view, and the
playground's own stepping debugger.

Values are only read (items, model fields, __dict__), never computed, so looking at one
cannot run the learner's code."""

import json
import reprlib
import time
import runpy
import sys
import traceback
import types

try:  # Pyodide loads sqlite3 only when asked: the FastAPI runtime does, the playground does not.
    import sqlite3

    _SQLITE_ROW = sqlite3.Row
except ImportError:  # pragma: no cover - depends on the Pyodide packages loaded
    _SQLITE_ROW = None


_SNAP_DEPTH = 4  # levels below a variable that can be opened in the Variables view
_SNAP_CHILDREN = 50  # items shown per dict, list, tuple, set or object
_SNAP_NODES = 3000  # all values sent for one pause, so a huge object cannot stall the page
_SNAP_FRAMES = 12
_SNAP_REPR = 200
_LEAF_TYPES = (type(None), bool, int, float, complex, str, bytes, bytearray, range)
_OPAQUE_TYPES = (types.ModuleType, types.FunctionType, types.BuiltinFunctionType, types.MethodType, type)


class _BoundedRepr(reprlib.Repr):
    """repr() that stops early, so a 100k-row list costs the same as a short one on every
    step. Pydantic models and dataclasses are spelled from their fields, which keeps a
    model holding a huge list just as cheap."""

    def __init__(self):
        super().__init__()
        self.maxlevel = 3
        self.maxdict = self.maxlist = self.maxtuple = self.maxset = self.maxfrozenset = self.maxdeque = 12
        self.maxstring = self.maxother = _SNAP_REPR
        self.maxlong = 60

    def repr_instance(self, value, level):
        import dataclasses

        fields = getattr(type(value), "model_fields", None)
        if isinstance(fields, dict):
            names = list(fields)
        elif dataclasses.is_dataclass(value) and getattr(getattr(type(value), "__dataclass_params__", None), "repr", False):
            names = [field.name for field in dataclasses.fields(value) if field.repr]
        else:
            return super().repr_instance(value, level)
        if level <= 0:
            return f"{type(value).__name__}(...)"
        parts = [f"{name}={self.repr1(getattr(value, name, None), level - 1)}" for name in names[:self.maxdict]]
        if len(names) > self.maxdict:
            parts.append("...")
        return f"{type(value).__name__}({', '.join(parts)})"


_REPR = _BoundedRepr()


def _safe_repr(value):
    try:
        text = _REPR.repr(value)
    except Exception as error:  # noqa: BLE001 - a learner's broken __repr__ must not stop the debugger
        text = f"<repr failed: {type(error).__name__}>"
    return text if len(text) <= _SNAP_REPR else text[:_SNAP_REPR - 1] + "…"


def _set_children(value, limit):
    """Set members labelled by their own repr in sorted order, so a member keeps its label
    (and its changed-marking) when the set grows and its iteration order shifts."""
    import itertools

    members = list(value) if len(value) <= 2000 else list(itertools.islice(value, limit))
    labelled = sorted(((_safe_repr(item), item) for item in members), key=lambda pair: pair[0])
    return [(label, False, item) for label, item in labelled[:limit]]


def _children_of(value):
    """(name, is_attribute, value) for what the Variables view can open, or None for a leaf.

    Only stored data is read (items, model fields, __dict__), never properties, so looking
    at a value cannot run the learner's code or trigger a SQLAlchemy lazy load."""
    import collections.abc
    import dataclasses
    import itertools

    if isinstance(value, _LEAF_TYPES + _OPAQUE_TYPES):
        return None
    limit = _SNAP_CHILDREN
    if isinstance(value, collections.abc.Mapping):
        return [(_safe_repr(key), False, item) for key, item in itertools.islice(value.items(), limit)]
    if isinstance(value, (list, tuple, collections.deque)):
        return [(str(index), False, item) for index, item in enumerate(itertools.islice(value, limit))]
    if isinstance(value, (set, frozenset)):
        return _set_children(value, limit)
    if _SQLITE_ROW is not None and isinstance(value, _SQLITE_ROW):
        return [(_safe_repr(key), False, value[key]) for key in value.keys()[:limit]]
    fields = getattr(type(value), "model_fields", None)  # Pydantic v2 models
    if isinstance(fields, dict):
        return [(name, True, getattr(value, name, None)) for name in list(fields)[:limit]]
    if dataclasses.is_dataclass(value):
        return [(field.name, True, getattr(value, field.name, None)) for field in dataclasses.fields(value)[:limit]]
    attributes = getattr(value, "__dict__", None)
    if isinstance(attributes, dict):
        names = [name for name in attributes if not name.startswith("__") and name != "_sa_instance_state"]
        return [(name, True, attributes[name]) for name in names[:limit]]
    return None


def _snapshot(value, depth, budget):
    """One value as {t: type, r: repr, n: length, c: children, more: hidden children}."""
    budget[0] -= 1
    node = {"t": type(value).__name__, "r": _safe_repr(value)}
    try:
        node["n"] = len(value) if isinstance(value, (dict, list, tuple, set, frozenset, str, bytes)) else None
    except Exception:  # noqa: BLE001
        node["n"] = None
    try:
        children = _children_of(value)
    except Exception:  # noqa: BLE001 - an odd container is shown as its repr only
        children = None
    if children is None:
        return node
    node["c"] = []
    if depth >= _SNAP_DEPTH or budget[0] <= 0:
        node["cut"] = True  # too deep to send: the view shows the repr instead
        return node
    for name, is_attribute, child in children:
        if budget[0] <= 0:
            node["cut"] = True
            break
        item = _snapshot(child, depth + 1, budget)
        item["k"] = name
        if is_attribute:
            item["a"] = 1
        node["c"].append(item)
    total = node["n"] if node["n"] is not None and not isinstance(value, (str, bytes)) else None
    if total is not None and total > len(node["c"]):
        node["more"] = total - len(node["c"])
    return node


# ------------------------------------------------------------------ Python playground debugger
# The playground runs one file. It is written to PLAY_DIR, so the debugger can tell the
# learner's code from the standard library, and run with runpy. At a breakpoint, or after a
# step, `bridge(file, line, frames_json, depth)` blocks until the page answers with what to do
# next: 0 continue, 1 step into, 2 step over, 3 step out (see pyodideRunner.worker.js).
PLAY_DIR = "/home/pyodide/webnest_play/"
_TOOL = getattr(getattr(sys, "monitoring", None), "DEBUGGER_ID", None)

# Every frame of the learner's code is listed in the call stack; variables are sent for the
# innermost _SNAP_FRAMES only, so deep recursion stays cheap to show.
_PLAY_STACK_LIMIT = 200
# Calls recorded for the Execution trace, as the FastAPI debugger shows them.
_PLAY_CALL_LIMIT = 2000

_play_breakpoints = set()
_play_bridge = None
_play_step = None
_play_trace = None
_play_breakpoints_now = None


def _is_play_code(code):
    return code.co_filename.startswith(PLAY_DIR)


def _play_name(filename):
    return filename[len(PLAY_DIR):] if filename.startswith(PLAY_DIR) else filename


def _shown_at_module_level(value):
    # The module's own globals include imports, functions and classes; the Variables view
    # shows the learner's data, as VS Code does.
    return not isinstance(value, (types.ModuleType, types.FunctionType, types.BuiltinFunctionType, type))


def _play_frames(frame, line_number):
    """Like webnest_runtime._snapshot_frames, for the playground's file: innermost first. All
    of the learner's frames are listed (up to _PLAY_STACK_LIMIT); the outer ones beyond
    _SNAP_FRAMES carry no variables."""
    budget = [_SNAP_NODES]
    user_frames = []
    current = frame
    while current is not None:
        if _is_play_code(current.f_code):
            user_frames.append(current)
        current = current.f_back
    frames = []
    for index, current in enumerate(user_frames[:_PLAY_STACK_LIMIT]):
        code = current.f_code
        module_level = code.co_name == "<module>"
        variables = []
        try:
            items = list(current.f_locals.items()) if index < _SNAP_FRAMES else []
        except Exception:  # noqa: BLE001
            items = []
        for name, value in items:
            if name.startswith("__") or (module_level and not _shown_at_module_level(value)):
                continue
            item = _snapshot(value, 0, budget)
            item["k"] = name
            variables.append(item)
        frames.append({
            "fn": "<module>" if module_level else code.co_qualname,
            "file": _play_name(code.co_filename),
            "line": line_number if current is frame else current.f_lineno,
            "first": code.co_firstlineno,
            "level": len(user_frames) - 1 - index,
            "vars": variables,
        })
    return frames


def _play_on_line(code, line_number):
    global _play_step
    if not _is_play_code(code):
        return sys.monitoring.DISABLE
    bridge = _play_bridge
    if bridge is None:
        return None
    frame = sys._getframe(1)
    filename = _play_name(code.co_filename)
    frame_id = id(frame)
    depth = 0
    parent = frame.f_back
    while parent is not None:
        if _is_play_code(parent.f_code):
            depth += 1
        parent = parent.f_back
    mode, target_id, target_depth = _play_step or (None, None, None)
    should_step = (
        mode == "into"
        or (mode == "over" and (frame_id == target_id or depth < target_depth))
        or (mode == "out" and depth < target_depth)
    )
    if (filename, int(line_number)) not in _play_breakpoints and not should_step:
        return None
    _play_step = None
    frames = json.dumps(_play_frames(frame, int(line_number)), default=str)
    command = bridge(filename, int(line_number), frames, depth)
    # Breakpoints set or removed while paused count from here on, as in VS Code.
    if _play_breakpoints_now is not None:
        _play_set_breakpoints(_play_breakpoints_now())
    if command == 1:
        _play_step = ("into", frame_id, depth)
    elif command == 2:
        _play_step = ("over", frame_id, depth)
    elif command == 3:
        _play_step = ("out", frame_id, depth)
    return None


class _PlayTrace:
    """The calls of one debugged run, in the shape the FastAPI Execution trace shows:
    {fn, file, line, depth, start, ms, error}."""

    def __init__(self):
        self.started = time.perf_counter()
        self.calls = []
        self.open = {}
        self.truncated = False

    def now(self):
        return round((time.perf_counter() - self.started) * 1000, 2)


def _play_on_start(code, offset):
    if not _is_play_code(code):
        return sys.monitoring.DISABLE
    trace = _play_trace
    if trace is None or code.co_name == "<module>":
        return None
    if len(trace.calls) >= _PLAY_CALL_LIMIT:
        trace.truncated = True
        return None
    frame = sys._getframe(1)
    depth = 0
    parent = frame.f_back
    while parent is not None:
        if _is_play_code(parent.f_code) and parent.f_code.co_name != "<module>":
            depth += 1
        parent = parent.f_back
    trace.open[id(frame)] = len(trace.calls)
    trace.calls.append({
        "fn": code.co_qualname,
        "file": _play_name(code.co_filename),
        "line": code.co_firstlineno,
        "depth": depth,
        "start": trace.now(),
        "ms": None,
        "error": None,
    })
    return None


def _play_finish(error=None):
    trace = _play_trace
    if trace is None:
        return
    index = trace.open.pop(id(sys._getframe(2)), None)
    if index is None:
        return
    call = trace.calls[index]
    call["ms"] = round(trace.now() - call["start"], 2)
    if error is not None:
        call["error"] = type(error).__name__


def _play_on_return(code, offset, retval):
    if not _is_play_code(code):
        return sys.monitoring.DISABLE
    _play_finish()
    return None


def _play_on_unwind(code, offset, error):
    # PY_UNWIND cannot be switched off per code object, so filter here.
    if _is_play_code(code):
        _play_finish(error)
    return None


def _learner_traceback(error):
    """The traceback as Python prints it, without the debugger's and runpy's own frames."""
    frames = [frame for frame in traceback.extract_tb(error.__traceback__) if frame.filename.startswith(PLAY_DIR)]
    for frame in frames:
        frame.filename = _play_name(frame.filename)
    message = "".join(traceback.format_exception_only(type(error), error)).strip()
    if isinstance(error, SyntaxError) and error.filename:
        message = message.replace(error.filename, _play_name(error.filename))
    head = "Traceback (most recent call last):\n" + "".join(traceback.format_list(frames)) if frames else ""
    return head + message


def _play_set_breakpoints(text):
    """Replaces the breakpoints from JSON text; empty text keeps them as they are."""
    global _play_breakpoints
    if not text:
        return
    try:
        pairs = json.loads(text)
        _play_breakpoints = {(str(item["file"]), int(item["line"])) for item in pairs}
    except (TypeError, ValueError, KeyError, json.JSONDecodeError):
        pass


def debug_file(name, source, breakpoints_json, bridge, breakpoints_now=None):
    """Runs the playground's file under the debugger. `breakpoints_now()` returns the page's
    breakpoints as JSON after each pause ('' when unchanged). Returns JSON:
    {"ok": bool, "error": text, "trace": {"calls": [...], "truncated": bool}}."""
    global _play_breakpoints, _play_bridge, _play_step, _play_trace, _play_breakpoints_now
    import os

    if _TOOL is None:
        return json.dumps({"ok": False, "error": "This Python version cannot pause at breakpoints."})
    path = PLAY_DIR + name
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(source)
    _play_breakpoints = set()
    _play_set_breakpoints(breakpoints_json or "[]")
    _play_bridge = bridge
    _play_breakpoints_now = breakpoints_now
    _play_step = None
    _play_trace = _PlayTrace()
    mon = sys.monitoring
    if mon.get_tool(_TOOL) is None:
        mon.use_tool_id(_TOOL, "webnest-playground-debugger")
    mon.register_callback(_TOOL, mon.events.LINE, _play_on_line)
    mon.register_callback(_TOOL, mon.events.PY_START, _play_on_start)
    mon.register_callback(_TOOL, mon.events.PY_RETURN, _play_on_return)
    mon.register_callback(_TOOL, mon.events.PY_UNWIND, _play_on_unwind)
    mon.set_events(_TOOL, mon.events.LINE | mon.events.PY_START | mon.events.PY_RETURN | mon.events.PY_UNWIND)
    # Code objects switched off in an earlier run (DISABLE) are switched on again.
    mon.restart_events()
    outcome = {"ok": True}
    try:
        runpy.run_path(path, run_name="__main__")
    except SystemExit as stop:
        code = stop.code
        if code not in (None, 0):
            outcome = {"ok": False, "error": str(code) if not isinstance(code, int) else f"SystemExit: {code}"}
    except BaseException as error:  # noqa: BLE001 - the learner's error is the result, not a crash
        outcome = {"ok": False, "error": _learner_traceback(error)}
    finally:
        mon.set_events(_TOOL, 0)
        for event in (mon.events.LINE, mon.events.PY_START, mon.events.PY_RETURN, mon.events.PY_UNWIND):
            mon.register_callback(_TOOL, event, None)
        trace = _play_trace
        _play_bridge = None
        _play_breakpoints_now = None
        _play_step = None
        _play_trace = None
    outcome["trace"] = {"calls": trace.calls, "truncated": trace.truncated}
    return json.dumps(outcome, default=str)
