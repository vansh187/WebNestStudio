// Python Basics module (Part B) — hand-written lesson content.
// Keys are fixed topic slugs used directly by the site's routing/lookup logic.
export const pythonContentB = {
  modules: {
    title: 'Python Modules and the import Statement',
    intro: `A module in Python is simply a file ending in ".py" that contains functions, classes, and variables you want to reuse. The moment you save a Python file, you have created a module — there is no special syntax needed to "declare" one, unlike some other languages that require explicit module keywords.

Modules exist to solve a very practical problem: as programs grow, keeping everything in one file becomes unmanageable. Splitting code into modules lets you organize related functionality together, reuse code across multiple programs without copy-pasting, and keep each file focused on a single responsibility.`,
    sections: [
      {
        heading: 'The import Statement',
        body: `Python offers several forms of the import statement, and each has a slightly different effect on your namespace.`,
        list: [
          '<code>import module_name</code> — imports the whole module; you access its contents with <code>module_name.thing</code>.',
          '<code>import module_name as alias</code> — imports the module under a shorter name, commonly seen as <code>import numpy as np</code>.',
          '<code>from module_name import thing</code> — imports one specific name directly into your namespace, so you can call it without the module prefix.',
          '<code>from module_name import *</code> — imports everything public from the module; generally discouraged because it makes it unclear where a name came from and can silently overwrite existing names.',
        ],
      },
      {
        heading: 'The Module Search Path',
        body: `When you write <code>import something</code>, Python does not search your entire filesystem — it searches a specific, ordered list of locations stored in <code>sys.path</code>. This list includes the directory of the script being run, the directories listed in the <code>PYTHONPATH</code> environment variable, and the standard library's installation directories. Python checks each location in order and uses the first matching module it finds, which is why a file you accidentally name the same as a standard library module (like naming your own script "math.py") can "shadow" the real one and cause confusing errors.`,
      },
      {
        heading: 'if __name__ == "__main__":',
        body: `Every module has a built-in variable called <code>__name__</code>. When a file is run directly (e.g. <code>python script.py</code>), Python sets <code>__name__</code> to the string <code>"__main__"</code> for that file. When the same file is instead imported by another module, <code>__name__</code> is set to the module's actual name instead. This lets you write code that only runs when the file is executed directly — such as test code or a command-line entry point — while still allowing the file's functions and classes to be safely imported elsewhere without that code running.`,
      },
    ],
    examples: [
      {
        caption: 'A reusable module with a guarded entry point',
        code: `# file: mathutils.py
def square(n):
    return n * n

def cube(n):
    return n * n * n

if __name__ == "__main__":
    # This block only runs when mathutils.py is executed directly,
    # not when another file imports it.
    print("Testing mathutils module:")
    print(square(4))
    print(cube(3))`,
        output: `Testing mathutils module:
16
27`,
      },
      {
        caption: 'Importing that same module from another file (the guarded block does not run)',
        code: `# file: main.py
import mathutils
from mathutils import cube as cb

print(mathutils.square(5))
print(cb(2))
print(__name__)`,
        output: `25
8
__main__`,
      },
    ],
    commonMistakes: [
      'Naming a personal script the same as a standard library module (e.g. "random.py" or "email.py"), which shadows the real module and causes baffling import errors.',
      'Using "from module import *" in real projects, making it unclear which module a given name actually came from and risking silent name collisions.',
      'Forgetting the "if __name__ == \'__main__\':" guard, so test or demo code runs automatically every time the file is imported elsewhere.',
      'Assuming "import module_name" re-reads the file every time it is imported — Python actually caches modules in sys.modules after the first import, so top-level code in a module runs only once per process.',
    ],
    keyPoints: [
      'Any .py file is automatically a module; no special declaration syntax is required.',
      'import, import ... as, and from ... import ... each affect your namespace differently.',
      'Python resolves imports using sys.path, checking the script directory, PYTHONPATH, and the standard library in order.',
      '__name__ equals "__main__" only when a file is run directly, which is the basis of the standard entry-point guard.',
    ],
  },

  packages: {
    title: 'Python Packages and Project Structure',
    intro: `A package is a way of grouping related modules together under a common namespace, using the filesystem's directory structure. Where a module is a single .py file, a package is a directory containing multiple modules (and possibly sub-packages), which lets large projects stay organized as they grow beyond what a handful of flat files can manage.

Packages also give you dotted import paths, like <code>import requests.adapters</code> or <code>from django.db import models</code>, which make it immediately clear where functionality lives within a large codebase.`,
    sections: [
      {
        heading: 'The Role of __init__.py',
        body: `Historically, any directory containing an <code>__init__.py</code> file was treated by Python as a regular package. That file can be completely empty — its mere presence used to be what told Python "treat this folder as a package, not just a random directory." Since Python 3.3, "namespace packages" allow directories without <code>__init__.py</code> to work as packages too, but including an explicit <code>__init__.py</code> is still the clearer, more common, and more predictable approach, especially for anything you intend to distribute. The file is also a natural place to run package-level setup code or to explicitly control what a <code>from package import *</code> exposes, using an <code>__all__</code> list.`,
      },
      {
        heading: 'A Typical Package Layout',
        body: `A simple package structure for a project called "shop" might look like this, with each subdirectory representing a sub-package.`,
        list: [
          '<code>shop/__init__.py</code> — marks shop as a package, may re-export commonly used names.',
          '<code>shop/models.py</code> — a module inside the package.',
          '<code>shop/orders/__init__.py</code> — a nested sub-package.',
          '<code>shop/orders/checkout.py</code> — a module inside the sub-package, imported as <code>shop.orders.checkout</code>.',
        ],
      },
      {
        heading: 'Relative vs Absolute Imports',
        body: `An absolute import spells out the full path from the project's top-level package, such as <code>from shop.orders import checkout</code>. A relative import instead uses leading dots to describe a module's location relative to the current one — a single dot (<code>.</code>) means "the current package," and two dots (<code>..</code>) mean "the parent package," as in <code>from . import models</code> or <code>from ..utils import helpers</code>. Absolute imports are generally preferred in application code because they are unambiguous and easy to search for, while relative imports are common inside packages that are meant to be self-contained and movable as a unit. Critically, relative imports only work inside a package that was itself imported — you cannot run a file containing relative imports directly as a script.`,
      },
    ],
    examples: [
      {
        caption: 'Package structure with absolute and relative imports',
        code: `# Project layout:
# shop/
#   __init__.py
#   models.py
#   orders/
#     __init__.py
#     checkout.py

# --- shop/models.py ---
class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

# --- shop/orders/checkout.py ---
from ..models import Product   # relative import: go up one package to models

def total_price(products):
    return sum(p.price for p in products)

# --- run_shop.py at the project root ---
from shop.models import Product          # absolute import
from shop.orders.checkout import total_price

cart = [Product("Book", 15.0), Product("Pen", 2.5)]
print(total_price(cart))`,
        output: '17.5',
      },
    ],
    commonMistakes: [
      'Trying to run a module containing relative imports directly with "python checkout.py", which fails because relative imports require the file to be part of an imported package, not the __main__ script.',
      'Forgetting __init__.py in older codebases or tooling that assumes regular packages, leading to "module not found" errors even though the directory and files clearly exist.',
      'Creating circular imports between two modules that each import from the other at the top level, which raises an ImportError partway through initialization.',
      'Confusing a package (a directory of modules) with a distribution/library installed via pip — a single pip-installed library can contain many packages and modules internally.',
    ],
    keyPoints: [
      'A package is a directory of modules, traditionally marked with an __init__.py file.',
      'Namespace packages (no __init__.py) exist since Python 3.3 but explicit __init__.py remains the clearer convention.',
      'Absolute imports spell out the full dotted path; relative imports use leading dots relative to the current package.',
      'Relative imports only work when a module is imported as part of a package, never when run directly as a script.',
    ],
  },

  'standard-library': {
    title: 'A Tour of the Python Standard Library',
    intro: `One of Python's biggest practical advantages is its extensive standard library — the collection of modules that ship with every Python installation, requiring no extra "pip install" step. This is often summarized as Python coming with "batteries included." Knowing what already exists in the standard library saves you from reinventing common functionality or reaching for a third-party dependency unnecessarily.

This tour covers a handful of the most frequently used standard library modules: <code>os</code>, <code>sys</code>, <code>datetime</code>, <code>collections</code>, and <code>itertools</code>. Each deserves a full reference on its own, but a working familiarity with what each one is for will cover the majority of everyday scripting needs.`,
    sections: [
      {
        heading: 'os and sys — Operating System and Interpreter Access',
        body: `The <code>os</code> module provides a portable way to interact with the operating system: reading and setting environment variables (<code>os.environ</code>), joining file paths correctly across platforms (<code>os.path.join</code>), listing directory contents (<code>os.listdir</code>), and creating or removing directories. The <code>sys</code> module, by contrast, exposes details about the Python interpreter itself and the running program — <code>sys.argv</code> holds command-line arguments, <code>sys.path</code> is the module search path described earlier, and <code>sys.exit()</code> terminates the program with a given exit code.`,
      },
      {
        heading: 'datetime — Dates, Times, and Durations',
        body: `The <code>datetime</code> module provides classes for representing dates (<code>date</code>), times (<code>time</code>), and combined date-times (<code>datetime</code>), along with a <code>timedelta</code> class for representing durations and doing date arithmetic. <code>datetime.now()</code> gets the current local date and time, and calling <code>.strftime(format_string)</code> on any datetime object formats it into a human-readable string.`,
      },
      {
        heading: 'collections — Specialized Container Types',
        body: `Beyond the built-in list, dict, set, and tuple, the <code>collections</code> module provides specialized alternatives: <code>Counter</code> tallies occurrences of items in an iterable, <code>defaultdict</code> supplies an automatic default value for missing keys so you don't need to check for existence first, <code>namedtuple</code> creates lightweight, immutable objects with named fields, and <code>deque</code> is a double-ended queue optimized for fast appends and pops from both ends.`,
      },
      {
        heading: 'itertools — Efficient Iteration Building Blocks',
        body: `The <code>itertools</code> module provides fast, memory-efficient functions for working with iterators. <code>itertools.chain</code> joins multiple iterables into one logical sequence, <code>itertools.permutations</code> and <code>itertools.combinations</code> generate arrangements of elements, and <code>itertools.count</code> produces an infinite counting sequence. These functions return iterators (computed lazily, one item at a time) rather than fully built lists, which matters a great deal for performance on large datasets.`,
      },
    ],
    examples: [
      {
        caption: 'os, datetime, and sys together',
        code: `import os
import sys
from datetime import datetime

print(os.path.join("data", "reports", "2026.csv"))
print(len(sys.argv) >= 1)  # sys.argv always has at least the script name
now = datetime(2026, 9, 21, 14, 30)
print(now.strftime("%Y-%m-%d %H:%M"))`,
        output: `data/reports/2026.csv
True
2026-09-21 14:30`,
      },
      {
        caption: 'collections.Counter and itertools.combinations',
        code: `from collections import Counter
from itertools import combinations

words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counts = Counter(words)
print(counts.most_common(2))

items = ["a", "b", "c"]
pairs = list(combinations(items, 2))
print(pairs)`,
        output: `[('apple', 3), ('banana', 2)]
[('a', 'b'), ('a', 'c'), ('b', 'c')]`,
      },
    ],
    commonMistakes: [
      'Manually joining file paths with string concatenation and "/" instead of os.path.join (or pathlib), which breaks on Windows-style paths.',
      'Using a plain dict and checking "if key in dict" before every increment, instead of using collections.Counter or defaultdict to simplify the logic.',
      'Forgetting that itertools functions return lazy iterators, then trying to check their length with len() or index into them directly — you usually need to wrap them in list() first.',
      'Parsing dates with manual string slicing instead of datetime.strptime, leading to fragile code that breaks on unexpected formats.',
    ],
    keyPoints: [
      'The standard library ships with every Python install — "batteries included" — no pip install required.',
      'os and sys handle operating system interaction and interpreter/runtime details, respectively.',
      'datetime models dates, times, and durations, with strftime/strptime for formatting and parsing.',
      'collections and itertools provide specialized, efficient alternatives to hand-rolled data structures and loops.',
    ],
  },

  'virtual-environments': {
    title: 'Python Virtual Environments and Dependency Management',
    intro: `A virtual environment is an isolated Python installation that keeps one project's dependencies separate from every other project's dependencies, and separate from the system-wide Python installation. Without virtual environments, installing package versions for one project can silently break another project that needs a different, conflicting version of the same package — a problem often called "dependency hell."

Isolating dependencies per project also makes your work reproducible: anyone who clones your project can create an identical environment from a requirements file, rather than guessing which package versions you happened to have installed globally.`,
    sections: [
      {
        heading: 'Creating and Activating a Virtual Environment with venv',
        body: `Python includes the <code>venv</code> module in its standard library specifically for this purpose. Running <code>python -m venv env</code> creates a new directory named "env" containing a private copy of the Python interpreter and its own <code>site-packages</code> folder for installed libraries. You then "activate" it — on macOS/Linux with <code>source env/bin/activate</code>, on Windows with <code>env\\Scripts\\activate</code> — which changes your shell so that "python" and "pip" point to the environment's private copies instead of the system-wide ones. Deactivating with <code>deactivate</code> returns you to the system environment.`,
      },
      {
        heading: 'Installing Packages with pip',
        body: `<code>pip</code> is Python's standard package installer, and it always installs into whichever Python environment is currently active. <code>pip install requests</code> downloads and installs the "requests" library and its dependencies from the Python Package Index (PyPI). <code>pip install requests==2.31.0</code> pins an exact version, which matters for reproducibility since newer versions can introduce breaking changes.`,
      },
      {
        heading: 'requirements.txt',
        body: `A <code>requirements.txt</code> file lists a project's dependencies, typically one package per line with an exact or minimum version, such as <code>requests==2.31.0</code>. Running <code>pip freeze > requirements.txt</code> captures everything currently installed in the active environment into this format, and <code>pip install -r requirements.txt</code> installs everything listed in the file in one command — this is exactly how a teammate or a deployment server recreates your environment reliably.`,
      },
    ],
    examples: [
      {
        caption: 'Full workflow: create, activate, install, and freeze dependencies',
        code: `# Create a virtual environment named "env"
python -m venv env

# Activate it (macOS/Linux)
source env/bin/activate

# Activate it (Windows)
env\\Scripts\\activate

# Install project dependencies into the isolated environment
pip install requests flask

# Record exact installed versions for reproducibility
pip freeze > requirements.txt

# Later, on another machine, recreate the same environment:
pip install -r requirements.txt`,
        output: `# requirements.txt contents after freeze, e.g.:
# flask==3.0.3
# requests==2.31.0
# (plus any transitive dependencies)`,
      },
    ],
    commonMistakes: [
      'Installing packages globally with pip instead of inside an activated virtual environment, gradually polluting the system Python with unrelated project dependencies.',
      'Forgetting to activate the virtual environment before running pip install, so packages end up installed in the wrong (usually system) interpreter.',
      'Committing the entire virtual environment directory (e.g. "env/") to version control instead of just requirements.txt — this bloats the repository and is not portable across operating systems.',
      'Never pinning versions in requirements.txt, so "pip install -r requirements.txt" installs different package versions over time and reproduces different behavior on different machines.',
    ],
    keyPoints: [
      'Virtual environments isolate each project\'s dependencies from the system Python and from each other.',
      'python -m venv creates an environment; source env/bin/activate (or env\\Scripts\\activate on Windows) activates it.',
      'pip installs into whichever environment is currently active, so activation order matters.',
      'requirements.txt (built with pip freeze) makes a project\'s exact dependencies reproducible on any machine.',
    ],
  },

  exceptions: {
    title: 'Exception Handling in Python',
    intro: `An exception is an event that disrupts the normal flow of a program's instructions, typically raised when an error occurs — dividing by zero, accessing a missing dictionary key, or opening a file that doesn't exist. Rather than letting an unhandled exception crash the program with a traceback, Python lets you anticipate and handle specific error conditions gracefully using try/except blocks.

Exception handling is not just for "true" errors, either. It is also Python's standard mechanism for signaling and reacting to any exceptional condition your own code needs to communicate, through custom exception classes.`,
    sections: [
      {
        heading: 'try, except, else, and finally',
        body: `A full exception-handling block has four parts, each with a distinct purpose.`,
        list: [
          '<code>try</code> — contains the code that might raise an exception.',
          '<code>except ExceptionType:</code> — runs only if that specific exception type (or a subclass of it) was raised in the try block; you can have multiple except clauses to handle different error types differently.',
          '<code>else</code> — runs only if the try block completed with no exception at all; useful for code that should run only on success, without being part of what is guarded by except.',
          '<code>finally</code> — always runs, whether an exception occurred or not, and even if the exception was not caught; commonly used for cleanup like closing files or network connections.',
        ],
      },
      {
        heading: 'Raising Exceptions',
        body: `You raise an exception explicitly with the <code>raise</code> keyword, either raising a built-in exception type like <code>ValueError("message")</code> or re-raising a caught exception with a bare <code>raise</code> inside an except block (which preserves the original traceback). Raising early with a clear message, rather than letting invalid data propagate silently, makes bugs far easier to diagnose.`,
      },
      {
        heading: 'Custom Exception Classes',
        body: `For application-specific error conditions, you can define your own exception class by inheriting from <code>Exception</code> (or a more specific built-in exception). This lets calling code catch exactly your application's errors — such as <code>InsufficientFundsError</code> — separately from generic Python errors, and lets you attach extra data (like an account balance) to the exception object itself.`,
      },
    ],
    examples: [
      {
        caption: 'try/except/else/finally handling multiple error types',
        code: `def safe_divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        print("Cannot divide by zero.")
        return None
    except TypeError:
        print("Both arguments must be numbers.")
        return None
    else:
        print("Division succeeded.")
        return result
    finally:
        print("safe_divide finished.")

print(safe_divide(10, 2))
print(safe_divide(10, 0))`,
        output: `Division succeeded.
safe_divide finished.
5.0
Cannot divide by zero.
safe_divide finished.
None`,
      },
      {
        caption: 'A custom exception class carrying extra data',
        code: `class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        super().__init__(f"Cannot withdraw {amount}; balance is only {balance}")
        self.balance = balance
        self.amount = amount

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount

try:
    withdraw(100, 250)
except InsufficientFundsError as e:
    print(str(e))
    print(e.balance, e.amount)`,
        output: `Cannot withdraw 250; balance is only 100
100 250`,
      },
    ],
    commonMistakes: [
      'Writing a bare "except:" with no exception type, which silently catches everything — including typos and keyboard interrupts — and hides real bugs.',
      'Putting too much code inside a single try block, making it unclear which line actually raised the exception that was caught.',
      'Forgetting that finally runs even after a return statement inside try or except, which can be surprising when finally also contains a return that overrides the earlier one.',
      'Creating a custom exception but forgetting to call super().__init__(message), losing the readable string representation when the exception is printed.',
    ],
    keyPoints: [
      'try/except/else/finally each serve a distinct role: guarded code, error handling, success-only code, and always-run cleanup.',
      'raise creates a new exception; a bare "raise" inside except re-raises the current one with its original traceback intact.',
      'Custom exceptions inherit from Exception (or a subclass) and let calling code catch application-specific errors precisely.',
      'Avoid bare except clauses — always catch the most specific exception type that applies.',
    ],
  },

  oop: {
    title: 'Object-Oriented Programming in Python',
    intro: `Object-oriented programming (OOP) models a program as a collection of objects, each bundling together data (attributes) and behavior (methods) that operate on that data. Python supports OOP fully, and while it doesn't force you to use classes for everything the way some languages do, classes are central to how most non-trivial Python code — including nearly the entire standard library — is organized.

Understanding classes, instances, inheritance, and Python's special "dunder" (double-underscore) methods is the foundation for reading and writing idiomatic Python at any real scale.`,
    sections: [
      {
        heading: 'Classes, __init__, and self',
        body: `A class is a blueprint for creating objects; each object created from it is called an instance. The <code>__init__</code> method is a special method automatically called when a new instance is created — it's where you typically set up initial attribute values. Every instance method's first parameter is conventionally named <code>self</code>, and it refers to the specific instance the method was called on; Python passes it automatically, so <code>obj.method(arg)</code> is really calling <code>ClassName.method(obj, arg)</code> behind the scenes.`,
      },
      {
        heading: 'Inheritance',
        body: `A class can inherit from another class by listing it in parentheses after the class name, as in <code>class Dog(Animal):</code>. The subclass (Dog) automatically gets all the attributes and methods of the superclass (Animal) and can override any of them, or extend the parent's behavior by calling <code>super().__init__(...)</code> or <code>super().method(...)</code> from within its own definition. This lets you share common behavior across related classes while still specializing individual ones.`,
      },
      {
        heading: 'Dunder (Magic) Methods',
        body: `Methods surrounded by double underscores, like <code>__init__</code>, integrate a class with Python's built-in syntax and functions rather than requiring special-case code. Defining <code>__str__</code> controls what <code>print(obj)</code> and <code>str(obj)</code> display; <code>__repr__</code> controls the unambiguous developer-facing representation shown in a debugger or REPL. Defining <code>__eq__</code> controls what <code>==</code> means for your objects (by default, two instances are only equal if they are literally the same object in memory). Other common dunder methods include <code>__len__</code> (for <code>len(obj)</code>), <code>__lt__</code> (for <code>&lt;</code> comparisons), and <code>__add__</code> (for <code>+</code>).`,
      },
    ],
    examples: [
      {
        caption: 'A class hierarchy using __init__, inheritance, and super()',
        code: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound."

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)   # reuse Animal's setup logic
        self.breed = breed

    def speak(self):             # override the parent's method
        return f"{self.name} barks."

generic = Animal("Creature")
rex = Dog("Rex", "Labrador")
print(generic.speak())
print(rex.speak())
print(rex.breed)`,
        output: `Creature makes a sound.
Rex barks.
Labrador`,
      },
      {
        caption: '__str__ and __eq__ for readable printing and value-based comparison',
        code: `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"Point({self.x}, {self.y})"

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

p1 = Point(1, 2)
p2 = Point(1, 2)
print(p1)
print(p1 == p2)      # uses __eq__, compares values, not identity
print(p1 is p2)      # identity check, always False for separate objects`,
        output: `Point(1, 2)
True
False`,
      },
    ],
    commonMistakes: [
      'Forgetting "self" as the first parameter of an instance method, causing a TypeError about the number of arguments when the method is called.',
      'Using "==" and expecting value equality before defining __eq__ — by default it falls back to identity comparison ("is"), which is almost never what you want for custom objects.',
      'Forgetting to call super().__init__() in a subclass, so inherited attributes set up by the parent class are never actually initialized.',
      'Defining __str__ but expecting it to also control the REPL/debugger representation — that is __repr__\'s job, and defining only one of them can produce inconsistent output.',
    ],
    keyPoints: [
      'A class is a blueprint; an instance is a concrete object created from it via __init__.',
      'self refers to the specific instance a method is operating on, and Python passes it automatically.',
      'Inheritance lets a subclass reuse and override a superclass\'s behavior, often via super().',
      'Dunder methods like __str__, __eq__, and __len__ integrate custom classes with Python\'s built-in syntax.',
    ],
  },

  'iterators-generators': {
    title: 'Python Iterators and Generators',
    intro: `Iteration — processing a sequence of values one at a time — is one of the most common patterns in programming, and Python formalizes it through the iterator protocol. Understanding this protocol explains what actually happens under the hood every time you write a "for" loop, and it opens the door to generators, which let you produce sequences of values lazily instead of building them all in memory up front.

This distinction matters enormously for performance: a generator that produces a billion values one at a time uses a small, constant amount of memory, while a list holding a billion values does not.`,
    sections: [
      {
        heading: 'The Iterator Protocol: __iter__ and __next__',
        body: `An "iterable" is any object you can loop over — it implements <code>__iter__</code>, which returns an "iterator." An iterator implements <code>__next__</code>, which returns the next value each time it's called, and raises the built-in <code>StopIteration</code> exception once there are no more values left. A "for" loop is essentially syntactic sugar: it calls <code>iter(obj)</code> once to get an iterator, then repeatedly calls <code>next()</code> on it until <code>StopIteration</code> is raised, at which point the loop ends cleanly.`,
      },
      {
        heading: 'Generator Functions and yield',
        body: `Writing a full class with <code>__iter__</code> and <code>__next__</code> just to produce a sequence of values is verbose. A generator function is a much simpler shortcut: any function containing the <code>yield</code> keyword automatically becomes a generator function, and calling it returns a generator object (which already satisfies the iterator protocol) rather than running the function body immediately. Each call to <code>next()</code> resumes the function from exactly where it last paused at a <code>yield</code>, runs until the next <code>yield</code> (or the function ends), and returns that yielded value.`,
      },
      {
        heading: 'Memory Efficiency: Generators vs Lists',
        body: `A list comprehension like <code>[x * x for x in range(10_000_000)]</code> builds the entire list of ten million values in memory before you can use any of them. A generator expression, written with parentheses instead of brackets — <code>(x * x for x in range(10_000_000))</code> — or an equivalent generator function, computes each value only when it's requested and never holds the whole sequence in memory at once. This "lazy evaluation" is exactly why functions like <code>range()</code> in Python 3, and many standard library iteration tools, are designed around the iterator protocol rather than returning full lists.`,
      },
    ],
    examples: [
      {
        caption: 'A custom iterator implemented with __iter__ and __next__',
        code: `class CountDown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

for number in CountDown(3):
    print(number)`,
        output: `3
2
1`,
      },
      {
        caption: 'A generator function using yield, compared to a list-building equivalent',
        code: `def countdown_gen(start):
    current = start
    while current > 0:
        yield current
        current -= 1

gen = countdown_gen(3)
print(next(gen))
print(next(gen))
print(list(gen))       # exhausts the remaining values

import sys
list_version = [x for x in range(100000)]
gen_version = (x for x in range(100000))
print(sys.getsizeof(list_version) > sys.getsizeof(gen_version))`,
        output: `3
2
[1]
True`,
      },
    ],
    commonMistakes: [
      'Trying to reuse an exhausted generator — once a generator has raised StopIteration, it stays exhausted and must be recreated, not reset.',
      'Calling len() on a generator, which fails because generators do not know their total length in advance without being fully consumed.',
      'Building a huge list with a list comprehension when a generator expression would do, wasting memory on data that is only ever processed one item at a time.',
      'Forgetting that a generator function\'s body does not execute at all until the first call to next() (or the first iteration of a for loop) — calling the function alone just creates the generator object.',
    ],
    keyPoints: [
      'An iterable implements __iter__ (returns an iterator); an iterator implements __next__ (returns values, then raises StopIteration).',
      'A for loop is sugar for calling iter() once and next() repeatedly until StopIteration.',
      'Any function containing yield is a generator function; calling it returns a generator without running the body immediately.',
      'Generators compute values lazily and use constant memory, unlike lists which hold every value at once.',
    ],
  },

  decorators: {
    title: 'Python Decorators',
    intro: `A decorator is a function that takes another function (or class) as input and returns a modified or wrapped version of it, without permanently changing the original function's source code. Decorators are Python's way of cleanly separating "what a function does" from "extra behavior applied around every call to it," such as logging, timing, access control, or caching.

Decorators rely on the fact that functions are first-class objects in Python — they can be passed around, stored in variables, and returned from other functions just like any other value. The <code>@decorator_name</code> syntax placed above a function definition is simply shorthand for <code>function = decorator_name(function)</code>.`,
    sections: [
      {
        heading: 'Writing a Basic Decorator',
        body: `A decorator is typically written as a function that defines an inner "wrapper" function, calls the original function from inside that wrapper, and returns the wrapper. Because the wrapper usually needs to accept whatever arguments the original function accepts, it's conventional to define it as <code>def wrapper(*args, **kwargs):</code>, which forwards any positional and keyword arguments through to the wrapped function unchanged.`,
      },
      {
        heading: 'functools.wraps',
        body: `Without extra care, wrapping a function replaces its <code>__name__</code>, <code>__doc__</code>, and other metadata with the wrapper function's own metadata — which makes debugging and introspection confusing, since <code>help(my_function)</code> would describe "wrapper" instead of the real function. The standard library's <code>functools.wraps</code> decorator, applied to the inner wrapper function, copies this metadata over from the original function automatically, and is considered a best practice for any decorator you write.`,
      },
      {
        heading: 'A Practical Example: Timing a Function',
        body: `One of the most common real-world uses of a decorator is measuring how long a function takes to run, without modifying the function's own code at all — you record a start time before calling the wrapped function, call it, record an end time, and print or log the difference. The same pattern applies to logging (recording that a function was called and with what arguments) or to enforcing access control (checking a permission before allowing the wrapped function to run at all).`,
      },
    ],
    examples: [
      {
        caption: 'A timing decorator using functools.wraps',
        code: `import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f} seconds")
        return result
    return wrapper

@timer
def slow_square(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

result = slow_square(1000000)
print(result)
print(slow_square.__name__)  # thanks to @wraps, this is "slow_square", not "wrapper"`,
        output: `slow_square took 0.0421 seconds
333332833333500000
slow_square`,
      },
      {
        caption: 'A logging decorator that reports arguments and return values',
        code: `from functools import wraps

def log_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

@log_calls
def add(a, b):
    return a + b

add(3, 4)`,
        output: `Calling add with args=(3, 4), kwargs={}
add returned 7`,
      },
    ],
    commonMistakes: [
      'Forgetting *args and **kwargs in the wrapper function, which breaks the decorator for any function that takes arguments different from what was hardcoded.',
      'Omitting @functools.wraps, which silently replaces the wrapped function\'s __name__ and docstring, breaking introspection tools and confusing debugging output.',
      'Forgetting that the wrapper must actually call and return the result of the original function — otherwise the decorated function silently stops returning a value.',
      'Applying multiple decorators and misunderstanding their order — decorators closest to the function run first when the function is called, but are applied (wrapped) last when the file is loaded.',
    ],
    keyPoints: [
      'A decorator takes a function and returns a (usually wrapped) function; @decorator is shorthand for func = decorator(func).',
      'Wrapper functions should accept *args and **kwargs to transparently forward arguments to the original function.',
      'functools.wraps preserves the original function\'s __name__, __doc__, and other metadata on the wrapper.',
      'Common real-world uses include timing, logging, caching, and access control around existing functions.',
    ],
  },

  'context-managers': {
    title: 'Python Context Managers and the with Statement',
    intro: `A context manager is an object that defines what should happen when entering and leaving a block of code, and it is used through the <code>with</code> statement. The most common example is file handling: <code>with open("file.txt") as f:</code> guarantees the file gets closed automatically when the block ends, even if an exception occurs inside it — something that's easy to forget when managing a file handle manually with try/finally.

Context managers exist to make "setup, use, then guaranteed cleanup" patterns concise and reliable, wherever that pattern applies: files, network connections, database transactions, locks, or temporarily changed settings.`,
    sections: [
      {
        heading: 'The with Statement and __enter__/__exit__',
        body: `Any object that defines both <code>__enter__</code> and <code>__exit__</code> methods can be used with the <code>with</code> statement. When the <code>with</code> block begins, Python calls <code>__enter__</code>, and whatever it returns is bound to the variable after <code>as</code> (if present). When the block ends — normally or due to an exception — Python calls <code>__exit__</code>, passing it details about any exception that occurred (or three <code>None</code> values if the block completed normally). If <code>__exit__</code> returns <code>True</code>, any exception that occurred inside the block is suppressed; if it returns a falsy value (the default), the exception propagates normally after cleanup runs.`,
      },
      {
        heading: 'Writing a Context Manager with contextlib.contextmanager',
        body: `Writing a full class with <code>__enter__</code> and <code>__exit__</code> is sometimes more ceremony than necessary for a simple case. The <code>contextlib.contextmanager</code> decorator lets you write a context manager as a single generator function instead: code before the <code>yield</code> statement acts as <code>__enter__</code>, the yielded value becomes what's bound after <code>as</code>, and code after the <code>yield</code> (typically inside a <code>finally</code> block) acts as <code>__exit__</code>, running even if the caller's code inside the <code>with</code> block raises an exception.`,
      },
      {
        heading: 'Why This Matters for Resource Safety',
        body: `Resources like open files, network sockets, and database connections are typically limited and must be explicitly released. Relying on a programmer to remember a matching "close" call every time is fragile — an exception raised between "open" and "close" would skip the cleanup entirely unless it's wrapped in try/finally. Context managers move that responsibility into the object itself, so correct cleanup happens automatically every time the <code>with</code> block is used, regardless of how the block exits.`,
      },
    ],
    examples: [
      {
        caption: 'A class-based context manager with __enter__ and __exit__',
        code: `class ManagedFile:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode

    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_value, traceback):
        self.file.close()
        print("File closed automatically.")
        return False  # do not suppress exceptions

with ManagedFile("notes.txt", "w") as f:
    f.write("Hello, context managers!")
print("Block finished.")`,
        output: `File closed automatically.
Block finished.`,
      },
      {
        caption: 'The same behavior written with contextlib.contextmanager',
        code: `from contextlib import contextmanager

@contextmanager
def managed_file(filename, mode):
    f = open(filename, mode)
    try:
        yield f          # code before yield = __enter__, f is bound to "as f"
    finally:
        f.close()        # code after yield = __exit__, always runs
        print("File closed automatically.")

with managed_file("notes.txt", "w") as f:
    f.write("Hello again!")
print("Block finished.")`,
        output: `File closed automatically.
Block finished.`,
      },
    ],
    commonMistakes: [
      'Manually calling open() and close() without try/finally, so an exception between the two calls leaves the file (or other resource) unreleased.',
      'Forgetting the try/finally inside a contextlib.contextmanager generator, so cleanup after yield never runs if the with block raises an exception.',
      'Returning True from __exit__ unintentionally, which silently swallows exceptions that should have propagated and been visible.',
      'Assuming a with block\'s variable ("as f") still contains a fully open, usable resource after the block ends — it has already been cleaned up by __exit__.',
    ],
    keyPoints: [
      'The with statement guarantees cleanup by calling __enter__ on entry and __exit__ on exit, even when an exception occurs.',
      '__exit__ receives exception details and can suppress the exception by returning True (the default, falsy return, lets it propagate).',
      'contextlib.contextmanager turns a single generator function into a context manager: code before yield is setup, code after (in finally) is cleanup.',
      'Context managers make resource cleanup automatic and reliable, replacing manual and error-prone try/finally patterns.',
    ],
  },

  testing: {
    title: 'Testing Python Code with unittest and pytest',
    intro: `Automated tests are code that verifies your other code behaves correctly, run repeatedly and automatically rather than checked by hand every time. Python ships with a built-in testing framework called <code>unittest</code>, and the third-party <code>pytest</code> package has become the de facto standard for most modern Python projects because of its simpler syntax and richer features.

Writing tests catches regressions early — when a change to one part of a codebase accidentally breaks another part — and serves as executable documentation of how a function is actually supposed to behave.`,
    sections: [
      {
        heading: 'assert Statements — The Foundation of Testing',
        body: `At its core, a test checks that some condition is true, and Python's built-in <code>assert</code> statement does exactly that: <code>assert condition, "optional message"</code> does nothing if the condition is true, and raises an <code>AssertionError</code> (with the optional message) if it's false. Both <code>unittest</code> and <code>pytest</code> build on this same fundamental idea, just with more structure and better failure reporting around it.`,
      },
      {
        heading: 'Writing Tests with unittest',
        body: `<code>unittest</code> is class-based: you subclass <code>unittest.TestCase</code> and write methods whose names start with <code>test_</code>. Instead of plain <code>assert</code>, TestCase provides methods like <code>self.assertEqual(a, b)</code>, <code>self.assertTrue(x)</code>, and <code>self.assertRaises(ExceptionType)</code>, which produce clearer failure messages than a bare assert would. Running <code>python -m unittest</code> from a project's root automatically discovers and runs any file matching the pattern <code>test_*.py</code> containing TestCase subclasses.`,
      },
      {
        heading: 'Writing Tests with pytest',
        body: `<code>pytest</code> lets you write tests as plain functions (no class or special base class required) using ordinary <code>assert</code> statements — it rewrites assertions internally to produce detailed, readable failure output showing exactly which values didn't match. Like unittest, it automatically discovers test files (again, files and functions named <code>test_*</code> or <code>*_test</code> by default) and runs them when you invoke the <code>pytest</code> command in a project directory, without needing to import or register each test file manually.`,
      },
    ],
    examples: [
      {
        caption: 'The function under test and equivalent unittest and pytest tests',
        code: `# file: calculator.py
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b


# file: test_calculator_unittest.py
import unittest
from calculator import add, divide

class TestCalculator(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)

    def test_divide_by_zero_raises(self):
        with self.assertRaises(ValueError):
            divide(10, 0)

if __name__ == "__main__":
    unittest.main()


# file: test_calculator_pytest.py
from calculator import add, divide
import pytest

def test_add():
    assert add(2, 3) == 5

def test_divide_by_zero_raises():
    with pytest.raises(ValueError):
        divide(10, 0)

# Run with: python -m unittest        (discovers test_calculator_unittest.py)
# Run with: pytest                    (discovers test_calculator_pytest.py)`,
        output: `----------------------------------------------------------------------
Ran 2 tests in 0.001s

OK
================= 2 passed in 0.01s =================`,
      },
    ],
    commonMistakes: [
      'Naming test files or functions without the "test_" prefix (or "_test" suffix), causing automatic test discovery to silently skip them.',
      'Using a bare assert with no message inside a large test, making it hard to tell which specific check failed when a test fails.',
      'Writing tests that depend on execution order or on state left behind by a previous test, causing tests to pass or fail unpredictably depending on how they are run.',
      'Testing only the "happy path" and never checking that invalid input correctly raises the expected exception.',
    ],
    keyPoints: [
      'assert is the underlying mechanism both unittest and pytest build on: it raises AssertionError when a condition is false.',
      'unittest is class-based (subclass TestCase, methods named test_*) and ships in the standard library.',
      'pytest allows plain functions with ordinary assert statements and produces detailed failure diffs automatically.',
      'Both frameworks auto-discover test files and functions following a test_*/*_test naming convention.',
    ],
  },

  'http-api-basics': {
    title: 'HTTP and API Basics in Python with requests',
    intro: `Most modern applications need to talk to other systems over the internet, and HTTP is the protocol almost all of that communication happens over. Python's third-party <code>requests</code> library is the most widely used tool for making HTTP calls because it wraps the lower-level built-in <code>urllib</code> module in a much simpler, more readable interface — installed with <code>pip install requests</code>.

Understanding a handful of core ideas — HTTP methods, status codes, and JSON — is enough to consume the vast majority of web APIs you'll encounter.`,
    sections: [
      {
        heading: 'GET and POST Requests',
        body: `A <code>GET</code> request retrieves data from a server and should not change anything on the server side — it's what happens whenever you visit a webpage or fetch data from an API endpoint. A <code>POST</code> request sends data to a server, typically to create or modify something, such as submitting a form or creating a new record. With <code>requests</code>, these look like <code>requests.get(url, params={...})</code> for query parameters and <code>requests.post(url, json={...})</code> for sending a JSON request body.`,
      },
      {
        heading: 'Status Codes',
        body: `Every HTTP response includes a numeric status code summarizing what happened. Codes in the 200s mean success (<code>200 OK</code> is the most common). Codes in the 300s indicate redirection. Codes in the 400s mean the client made a bad request (<code>404 Not Found</code>, <code>401 Unauthorized</code>, <code>400 Bad Request</code>). Codes in the 500s mean the server itself failed while processing an otherwise valid request. Checking <code>response.status_code</code>, or calling <code>response.raise_for_status()</code> (which raises an exception for 4xx/5xx responses), is essential before trusting a response's contents.`,
      },
      {
        heading: 'Parsing JSON Responses',
        body: `Most modern web APIs return data formatted as JSON (JavaScript Object Notation), a lightweight text format that maps naturally onto Python dictionaries and lists. Calling <code>response.json()</code> on a requests response object parses the JSON body and returns it as native Python data structures, ready to use directly — no manual string parsing required. If the fallback <code>urllib</code> module is used instead of requests, you would need to manually decode the response bytes and pass them through Python's built-in <code>json.loads()</code> function to get the same result.`,
      },
    ],
    examples: [
      {
        caption: 'A GET request with query parameters and JSON parsing',
        code: `import requests

response = requests.get(
    "https://api.example.com/users",
    params={"active": "true", "limit": 2}
)

response.raise_for_status()  # raises an exception for 4xx/5xx responses
data = response.json()

print(response.status_code)
print(type(data))
print(data)`,
        output: `200
<class 'list'>
[{'id': 1, 'name': 'Asha', 'active': True}, {'id': 2, 'name': 'Ravi', 'active': True}]`,
      },
      {
        caption: 'A POST request sending JSON, and the urllib fallback for comparison',
        code: `import requests

# --- Using requests (typical, third-party) ---
payload = {"title": "New Task", "done": False}
response = requests.post("https://api.example.com/tasks", json=payload)
print(response.status_code)
print(response.json())

# --- Using urllib (standard library fallback, no installation needed) ---
import json
import urllib.request

data_bytes = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    "https://api.example.com/tasks",
    data=data_bytes,
    headers={"Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read().decode("utf-8"))
    print(result)`,
        output: `201
{'id': 42, 'title': 'New Task', 'done': False}
{'id': 42, 'title': 'New Task', 'done': False}`,
      },
    ],
    commonMistakes: [
      'Assuming a request succeeded just because it didn\'t raise a connection error, without checking response.status_code or calling raise_for_status() — a 404 or 500 response is still a "successful" HTTP round trip from requests\' point of view.',
      'Calling response.json() on a response that isn\'t actually JSON (such as an HTML error page), which raises a decoding error instead of the expected dictionary.',
      'Passing a dictionary to the "data" parameter when a JSON body was intended — requests.post(url, data={...}) form-encodes the payload, while requests.post(url, json={...}) sends it as a proper JSON body with the correct Content-Type header.',
      'Hardcoding API keys or tokens directly into request code instead of reading them from environment variables or a configuration file.',
    ],
    keyPoints: [
      'GET retrieves data without side effects; POST sends data, typically to create or change something on the server.',
      'HTTP status codes summarize the outcome: 2xx success, 3xx redirect, 4xx client error, 5xx server error.',
      'requests.get/post plus response.json() is the standard, simple pattern for consuming JSON APIs in Python.',
      'urllib is the built-in fallback when requests (a third-party dependency) is not installed or allowed.',
    ],
  },
}
