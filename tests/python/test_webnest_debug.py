"""The Python playground debugger (src/workers/python/webnest_debug.py), run with CPython 3.12+
(the same sys.monitoring API as Pyodide) and a fake bridge in place of the page.
Run: python -m pytest tests/python"""

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

import pytest

pytestmark = pytest.mark.skipif(sys.version_info < (3, 12), reason="needs sys.monitoring (Python 3.12+)")

SOURCE = Path(__file__).resolve().parents[2] / "src" / "workers" / "python" / "webnest_debug.py"
spec = importlib.util.spec_from_file_location("webnest_debug", SOURCE)
debug = importlib.util.module_from_spec(spec)
spec.loader.exec_module(debug)
# A writable folder stands in for Pyodide's /home/pyodide.
debug.PLAY_DIR = tempfile.mkdtemp().replace("\\", "/") + "/webnest_play/"

PROGRAM = """\
import math

def square(n):
    result = n * n
    return result

def total(values):
    acc = 0
    for value in values:
        acc += square(value)
    return acc

numbers = [1, 2, 3]
print(total(numbers))
"""


class Bridge:
    """Records each stop and answers with the next command from `commands` (then continue)."""

    def __init__(self, commands=()):
        self.commands = list(commands)
        self.stops = []

    def __call__(self, file, line, frames, depth):
        self.stops.append({"file": file, "line": line, "frames": json.loads(frames), "depth": depth})
        return self.commands.pop(0) if self.commands else 0


def run(source, breakpoints, bridge):
    return json.loads(debug.debug_file("main.py", source, json.dumps(breakpoints), bridge))


def test_pauses_at_each_breakpoint_hit_with_variables_and_full_stack(capsys):
    bridge = Bridge()
    result = run(PROGRAM, [{"file": "main.py", "line": 4}], bridge)
    assert result["ok"] is True
    assert capsys.readouterr().out.strip() == "14"
    assert [stop["line"] for stop in bridge.stops] == [4, 4, 4]
    first = bridge.stops[0]
    assert [frame["fn"] for frame in first["frames"]] == ["square", "total", "<module>"]
    assert first["depth"] == 2
    square = first["frames"][0]
    assert {var["k"]: var["r"] for var in square["vars"]} == {"n": "1"}
    module = first["frames"][2]
    # Module level shows the learner's data, not imports or functions.
    assert [var["k"] for var in module["vars"]] == ["numbers"]
    assert module["vars"][0]["n"] == 3 and [c["r"] for c in module["vars"][0]["c"]] == ["1", "2", "3"]


def test_step_over_into_and_out():
    # Stop at line 9 (the for), then: step over (10), step into (square line 4), step out. Python
    # reports no new line for the rest of line 10, so step out stops at the loop's next line in total.
    bridge = Bridge([2, 1, 3])
    run(PROGRAM, [{"file": "main.py", "line": 9}], bridge)
    lines = [stop["line"] for stop in bridge.stops[:4]]
    assert lines == [9, 10, 4, 9]
    assert [stop["frames"][0]["fn"] for stop in bridge.stops[:4]] == ["total", "total", "square", "total"]


def test_execution_trace_lists_calls_with_depth_and_time():
    result = run(PROGRAM, [], Bridge())
    calls = result["trace"]["calls"]
    assert [(call["fn"], call["depth"]) for call in calls] == [("total", 0), ("square", 1), ("square", 1), ("square", 1)]
    assert all(call["ms"] is not None and call["error"] is None for call in calls)
    assert calls[0]["line"] == 7


def test_errors_show_only_the_learners_frames_and_mark_the_call():
    source = "def boom():\n    raise ValueError('bad')\n\nboom()\n"
    result = run(source, [], Bridge())
    assert result["ok"] is False
    assert 'File "main.py", line 2, in boom' in result["error"]
    assert "ValueError: bad" in result["error"]
    assert "runpy" not in result["error"] and "webnest_debug" not in result["error"]
    assert result["trace"]["calls"][0]["error"] == "ValueError"


def test_syntax_errors_and_exit_codes():
    assert "SyntaxError" in run("def broken(:\n", [], Bridge())["error"]
    assert run("import sys\nsys.exit(0)\n", [], Bridge())["ok"] is True
    assert run("import sys\nsys.exit(3)\n", [], Bridge())["error"] == "SystemExit: 3"


def test_deep_recursion_lists_every_frame_but_variables_only_for_the_innermost():
    source = "def down(n):\n    if n == 0:\n        return 0\n    return down(n - 1)\n\ndown(30)\n"
    bridge = Bridge()
    run(source, [{"file": "main.py", "line": 3}], bridge)
    frames = bridge.stops[0]["frames"]
    assert len(frames) == 32  # 31 calls of down() plus <module>
    assert frames[0]["vars"] and frames[0]["level"] == 31
    assert frames[debug._SNAP_FRAMES]["vars"] == []


def test_debugger_is_switched_off_after_a_run():
    run(PROGRAM, [{"file": "main.py", "line": 4}], Bridge())
    # A later run with no breakpoints never stops, and earlier DISABLEd code is re-enabled.
    bridge = Bridge()
    run(PROGRAM, [], bridge)
    assert bridge.stops == []
    bridge = Bridge()
    run(PROGRAM, [{"file": "main.py", "line": 4}], bridge)
    assert len(bridge.stops) == 3
    assert sys.monitoring.get_events(debug._TOOL) == 0


def test_breakpoints_changed_while_paused_count_from_the_next_step():
    bridge = Bridge()
    answers = ["[]"]  # after the first stop the page has removed every breakpoint
    result = json.loads(debug.debug_file("main.py", PROGRAM, json.dumps([{"file": "main.py", "line": 4}]), bridge, lambda: answers.pop(0) if answers else ""))
    assert result["ok"] is True
    assert [stop["line"] for stop in bridge.stops] == [4]
    # And a breakpoint added while paused stops the run later.
    bridge = Bridge()
    answers = [json.dumps([{"file": "main.py", "line": 9}, {"file": "main.py", "line": 14}])]
    json.loads(debug.debug_file("main.py", PROGRAM, json.dumps([{"file": "main.py", "line": 4}]), bridge, lambda: answers.pop(0) if answers else ""))
    assert [stop["line"] for stop in bridge.stops][:3] == [4, 9, 9]
