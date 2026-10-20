"""Checks _snapshot_frames in src/workers/python/webnest_runtime.py with plain CPython.

Run by tests/runtime-snapshot.test.mjs: prints one JSON object of results. This file is
treated as the learner's code (PACKAGE_DIR points at its folder)."""
import dataclasses
import json
import os
import sys
import time

sys.path.insert(0, sys.argv[1])
import webnest_runtime as rt  # noqa: E402

here = os.path.dirname(sys._getframe().f_code.co_filename) + os.sep
rt.PACKAGE_DIR = here
rt.APP_ROOT = os.path.dirname(here.rstrip(os.sep))
results = {}

try:
    from pydantic import BaseModel

    class Bag(BaseModel):
        name: str
        items: list[int]
except ImportError:  # pydantic is optional for this check
    Bag = None


@dataclasses.dataclass
class Point:
    x: int
    rows: list


class Watched:
    def __init__(self):
        self.value = 1

    @property
    def boom(self):
        results["property_read"] = True
        raise AssertionError("properties must not be read")


class Broken:
    def __repr__(self):
        raise RuntimeError("nope")


def snapshot():
    caller = sys._getframe(1)
    return rt._snapshot_frames(caller, caller.f_lineno)


def by_name(frame):
    return {item["k"]: item for item in frame["vars"]}


def big_values():
    rows = [(index, f"row {index}", {"n": index}) for index in range(100_000)]
    point = Point(1, rows)
    bag = Bag(name="b", items=list(range(100_000))) if Bag else None
    text = "x" * 1_000_000
    watched = Watched()
    broken = Broken()
    started = time.perf_counter()
    frames = snapshot()
    results["big_seconds"] = time.perf_counter() - started
    return frames


frames = big_values()
values = by_name(frames[0])
results["rows_n"] = values["rows"]["n"]
results["rows_shown"] = len(values["rows"]["c"])
results["rows_more"] = values["rows"].get("more")
results["max_repr"] = max(len(item["r"]) for item in values.values())
results["point_repr"] = values["point"]["r"][:40]
results["bag_repr"] = values["bag"]["r"][:40] if Bag else None
results["broken_repr"] = values["broken"]["r"]
results["watched_children"] = [child["k"] for child in values["watched"]["c"]]
results["payload_bytes"] = len(json.dumps(frames, default=str))


def set_labels():
    tags = {"pear", "apple", "fig"}
    first = [child["k"] for child in by_name(snapshot()[0])["tags"]["c"]]
    tags.add("banana")
    second = [child["k"] for child in by_name(snapshot()[0])["tags"]["c"]]
    return first, second


results["set_first"], results["set_second"] = set_labels()


def recurse(n):
    if n == 0:
        return snapshot()
    return recurse(n - 1)


deep = recurse(19)  # recurse x20, plus this module frame = 21 learner frames
results["deep_count"] = len(deep)
results["deep_levels"] = [frame["level"] for frame in deep]
results["deep_n"] = [by_name(frame).get("n", {}).get("r") for frame in deep]
results["property_read"] = results.get("property_read", False)
print(json.dumps(results))
