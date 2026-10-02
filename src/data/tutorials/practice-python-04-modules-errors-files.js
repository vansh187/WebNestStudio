// Practice blocks for the Python Modules and Packages, Exception Handling and Debugging,
// and File Handling modules. Merged onto the lesson entries in index.js by slug, so the
// lesson prose files stay unchanged.
// File exercises work in a temporary folder or in memory and leave nothing behind.
export const practicePythonModulesErrorsFiles = {
  'modules': {
    whyItMatters: `No real program is a single file. Modules are how code is split into files and reused, and every <code>import</code> line you write depends on how Python finds and loads them. Most "No module named ..." errors, and code that runs unexpectedly when a file is imported, are explained by the few rules in this lesson.`,
    exercise: {
      prompt: `Use three forms of import: import one name from <code>math</code>, import <code>statistics</code> under the alias <code>stats</code>, and then print the name of the current module.

Expected output: <code>12.0</code>, <code>4</code>, <code>__main__</code> (one per line)`,
      starterCode: `# TODO: import sqrt from the math module
# TODO: import the statistics module with the alias stats

# TODO: print the square root of 144
# TODO: print the mean of [2, 4, 6]
# TODO: print the value of __name__`,
      hints: [
        'The forms are <code>from math import sqrt</code> and <code>import statistics as stats</code>.',
        'A file that is run directly has <code>__name__</code> equal to <code>"__main__"</code>.',
      ],
      solution: `from math import sqrt
import statistics as stats

print(sqrt(144))
print(stats.mean([2, 4, 6]))
print(__name__)`,
    },
    quiz: [
      {
        question: 'A module is imported in three different files of the same program. How many times does its top-level code run?',
        options: ['Three times', 'Never', 'Once; later imports reuse the loaded module', 'Once per function call'],
        answer: 2,
        explanation: 'The loaded module is kept in sys.modules and reused.',
      },
      {
        question: 'Why is <code>from module import *</code> discouraged?',
        options: ['It is slower', 'It imports nothing', 'It does not work in Python 3', 'It brings in every public name, which can silently replace names you already have'],
        answer: 3,
        explanation: 'It also hides where each name came from.',
      },
      {
        question: 'Which list holds the folders that Python searches for modules?',
        options: ['sys.path', 'os.path', 'sys.modules', 'PATH'],
        answer: 0,
        explanation: 'It starts with the folder of the script, then the standard library and installed packages.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What happens when Python executes an import statement?',
        answer: `Python first checks <code>sys.modules</code>; if the module is already loaded, that object is reused. Otherwise it searches the folders in <code>sys.path</code>, runs the module's code from top to bottom once, stores the resulting module object in <code>sys.modules</code>, and binds a name to it in the importing file.`,
      },
      {
        question: 'What is the difference between "import module" and "from module import name"?',
        answer: `<code>import module</code> binds the module itself, and its contents are used as <code>module.name</code>, which shows where each name comes from. <code>from module import name</code> binds that one name directly in the current file, so it is used without a prefix. The whole module is loaded in both cases; only the names made available differ.`,
      },
    ],
  },

  'packages': {
    whyItMatters: `Once a project has more than a handful of files, they are grouped into folders, and those folders are packages. Every library you install is a package, and import lines such as <code>from app.services.email import send</code> describe a path through one. Understanding the layout is what lets you organise your own project and fix import errors in it.`,
    exercise: {
      prompt: `<code>urllib</code> is a package in the standard library and <code>parse</code> is a module inside it. Import <code>urlparse</code> from that module with an absolute import, parse the address below, and print its host and its path. Then print the full dotted name of the module that <code>urlparse</code> comes from.

Expected output: <code>example.com</code>, <code>/docs</code>, <code>urllib.parse</code> (one per line)`,
      starterCode: `# TODO: import urlparse from the parse module of the urllib package

address = "https://example.com/docs?page=2"

# TODO: parse the address and print its netloc and its path
# TODO: print urlparse.__module__`,
      hints: [
        'The import is <code>from urllib.parse import urlparse</code>: package, then module, then name.',
        'The result of <code>urlparse</code> has the attributes <code>netloc</code> and <code>path</code>.',
      ],
      solution: `from urllib.parse import urlparse

address = "https://example.com/docs?page=2"

parts = urlparse(address)
print(parts.netloc)
print(parts.path)
print(urlparse.__module__)`,
    },
    quiz: [
      {
        question: 'What is the traditional role of <code>__init__.py</code> in a folder?',
        options: ['It stores settings', 'It marks the folder as a package and runs when the package is imported', 'It is the entry point of the program', 'It lists the dependencies'],
        answer: 1,
        explanation: 'It may be empty, or it can expose selected names from the modules inside.',
      },
      {
        question: 'Inside a package, what does <code>from . import utils</code> mean?',
        options: ['Import utils from the standard library', 'Import everything', 'Import the utils module from the same package', 'Import from the parent folder of the project'],
        answer: 2,
        explanation: 'A single dot means the current package; two dots mean its parent.',
      },
      {
        question: 'Which style of import does PEP 8 recommend in general?',
        options: ['Relative imports', 'Imports inside functions', 'Star imports', 'Absolute imports'],
        answer: 3,
        explanation: 'An absolute import states the full path and reads the same wherever the file is.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a module and a package?',
        answer: `A module is a single <code>.py</code> file. A package is a folder of modules, and possibly of further packages, usually containing an <code>__init__.py</code> file. Packages give a project a hierarchy, so that modules are addressed with dotted names such as <code>shop.orders.models</code>.`,
      },
      {
        question: 'What is the difference between absolute and relative imports?',
        answer: `An absolute import gives the full path from the top of the project or from an installed package, as in <code>from shop.orders import models</code>. A relative import starts from the current package and uses dots, as in <code>from . import models</code> or <code>from ..utils import helper</code>. Relative imports work only inside a package and fail in a file that is run directly as a script.`,
      },
    ],
  },

  'standard-library': {
    whyItMatters: `Python's standard library covers dates, files, JSON, HTTP, random numbers, counting and much more, with nothing to install. Checking it before writing your own code or adding a dependency saves time and avoids bugs. Knowing roughly what it contains is one of the things that separates experienced Python developers from beginners.`,
    exercise: {
      prompt: `Use <code>datetime</code> to print the date 30 days after 31 January 2026. Then use <code>itertools</code> to print every pair that can be chosen from three letters.

Expected output: <code>2026-03-02</code> then <code>[('a', 'b'), ('a', 'c'), ('b', 'c')]</code>`,
      starterCode: `from datetime import date, timedelta
from itertools import combinations

start = date(2026, 1, 31)
# TODO: print the date 30 days after start

letters = ["a", "b", "c"]
# TODO: print a list of all pairs of letters`,
      hints: [
        'Adding a <code>timedelta(days=30)</code> to a date gives a new date.',
        '<code>combinations(letters, 2)</code> yields the pairs; wrap it in <code>list()</code> to print them.',
      ],
      solution: `from datetime import date, timedelta
from itertools import combinations

start = date(2026, 1, 31)
print(start + timedelta(days=30))

letters = ["a", "b", "c"]
print(list(combinations(letters, 2)))`,
    },
    quiz: [
      {
        question: 'What does the phrase "batteries included" say about Python?',
        options: ['It ships with a large standard library ready to use', 'It needs no electricity', 'It includes a database server', 'It cannot use external packages'],
        answer: 0,
        explanation: 'Many common tasks need no third-party package.',
      },
      {
        question: 'Which module would you use to work with dates and times?',
        options: ['time_utils', 'datetime', 'calendar_api', 'os'],
        answer: 1,
        explanation: 'It provides date, time, datetime and timedelta.',
      },
      {
        question: 'How do you use a standard library module?',
        options: ['Install it with pip first', 'Download it from GitHub', 'Import it; it is already installed with Python', 'Enable it in the settings'],
        answer: 2,
        explanation: 'Only third-party packages need to be installed.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Which standard library modules do you use most often?',
        answer: `A good answer names several with what they are for: <code>os</code>, <code>sys</code> and <code>pathlib</code> for the system and file paths; <code>datetime</code> for dates; <code>json</code> and <code>csv</code> for data formats; <code>collections</code> and <code>itertools</code> for data handling; <code>re</code> for regular expressions; <code>logging</code> for logs; and <code>unittest</code> for tests.`,
      },
      {
        question: 'What is the itertools module for?',
        answer: `It provides fast, memory-efficient building blocks for working with iterables. <code>chain</code> joins iterables, <code>islice</code> takes part of one, <code>groupby</code> groups consecutive items, and <code>product</code>, <code>permutations</code> and <code>combinations</code> generate arrangements. They all return iterators, so values are produced only as they are consumed.`,
      },
    ],
  },

  'math-random-and-statistics-modules': {
    whyItMatters: `Rounding a price up, drawing a random sample, and calculating an average or a median come up in billing, games, testing and data analysis. These three modules cover them. One point is critical for security: the <code>random</code> module must never be used for passwords or tokens.`,
    exercise: {
      prompt: `Print 4.2 rounded up, 4.8 rounded down and the greatest common divisor of 12 and 18 on one line. Then print the median of the list. Finally, show that seeding the random generator with the same value gives the same number again.

Expected output: <code>5 4 6</code>, <code>3</code>, <code>True</code> (one per line)`,
      starterCode: `import math
import random
import statistics

# TODO: print ceil of 4.2, floor of 4.8 and gcd of 12 and 18 on one line

values = [3, 1, 4, 1, 5]
# TODO: print the median of values

# TODO: seed with 1 and draw a number, seed with 1 again and draw another,
#       then print whether the two numbers are equal`,
      hints: [
        'The functions are <code>math.ceil</code>, <code>math.floor</code> and <code>math.gcd</code>.',
        'Call <code>random.seed(1)</code> before each <code>random.random()</code>.',
      ],
      solution: `import math
import random
import statistics

print(math.ceil(4.2), math.floor(4.8), math.gcd(12, 18))

values = [3, 1, 4, 1, 5]
print(statistics.median(values))

random.seed(1)
first = random.random()
random.seed(1)
second = random.random()
print(first == second)`,
    },
    quiz: [
      {
        question: 'Which module should generate a password-reset token?',
        options: ['random', 'statistics', 'math', 'secrets'],
        answer: 3,
        explanation: 'secrets uses a source of randomness that is safe for security purposes. random is predictable.',
      },
      {
        question: 'What does <code>math.sqrt(16)</code> return?',
        options: ['4.0', '4', '8', '(4, -4)'],
        answer: 0,
        explanation: 'math.sqrt always returns a float.',
      },
      {
        question: 'What is the purpose of <code>random.seed(42)</code>?',
        options: ['To make the numbers more random', 'To make the sequence of random numbers repeatable', 'To limit numbers to 42', 'To make random secure'],
        answer: 1,
        explanation: 'The same seed gives the same sequence, which is useful in tests and experiments.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between the random and secrets modules?',
        answer: `<code>random</code> uses a fast pseudo-random algorithm whose output can be reproduced with a seed and, given enough output, predicted. It is right for simulations, games and sampling. <code>secrets</code> draws from the operating system's secure source and is meant for passwords, tokens and keys, where the values must be impossible to guess.`,
      },
      {
        question: 'What is the difference between mean, median and mode?',
        answer: `The mean is the sum of the values divided by their number. The median is the middle value when they are sorted, or the average of the two middle values. The mode is the value that occurs most often. The median is less affected by extreme values, which is why it is used for figures such as salaries. All three are in the <code>statistics</code> module.`,
      },
    ],
  },

  'os-sys-and-pathlib': {
    whyItMatters: `Scripts that organise files, read configuration from environment variables or process every file in a folder all depend on these modules. Building paths by joining strings with slashes breaks on a different operating system; <code>pathlib</code> handles the differences and is the standard in current Python code.`,
    exercise: {
      prompt: `Using <code>pathlib</code>, print the file name of the path, its extension, the name of the folder that contains it, and the name the file would have with a <code>.json</code> extension. <code>PurePosixPath</code> is used so that the result is the same on every operating system.

Expected output: <code>sales.csv</code>, <code>.csv</code>, <code>reports</code>, <code>sales.json</code> (one per line)`,
      starterCode: `from pathlib import PurePosixPath

path = PurePosixPath("/home/asha/reports/sales.csv")

# TODO: print the file name
# TODO: print the extension
# TODO: print the name of the parent folder
# TODO: print the file name with the extension changed to .json`,
      hints: [
        'The attributes are <code>name</code>, <code>suffix</code> and <code>parent</code>.',
        '<code>path.with_suffix(".json")</code> returns a new path; take its <code>name</code>.',
      ],
      solution: `from pathlib import PurePosixPath

path = PurePosixPath("/home/asha/reports/sales.csv")

print(path.name)
print(path.suffix)
print(path.parent.name)
print(path.with_suffix(".json").name)`,
    },
    quiz: [
      {
        question: 'How are two parts of a path joined with <code>pathlib</code>?',
        options: ['With the + operator', 'With a comma', 'With the / operator', 'With join()'],
        answer: 2,
        explanation: 'For example, Path("data") / "report.csv".',
      },
      {
        question: 'What does <code>os.environ.get("API_KEY")</code> return when the variable is not set?',
        options: ['It raises KeyError', 'None', 'An empty string', 'False'],
        answer: 1,
        explanation: 'os.environ["API_KEY"] would raise KeyError. get() can also take a default.',
      },
      {
        question: 'What is in <code>sys.argv[0]</code>?',
        options: ['The first argument given by the user', 'The current folder', 'The Python version', 'The name of the script being run'],
        answer: 3,
        explanation: 'The user\'s arguments start at index 1.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why is pathlib preferred to os.path?',
        answer: `<code>os.path</code> is a set of functions that work on strings, so code becomes nested calls such as <code>os.path.join(os.path.dirname(p), "x")</code>. <code>pathlib</code> represents a path as an object with attributes and methods: <code>p.parent / "x"</code>, <code>p.suffix</code>, <code>p.exists()</code>, <code>p.read_text()</code>. It is easier to read, handles the separators of each operating system, and is accepted by the functions of the standard library.`,
      },
      {
        question: 'How should a program read secrets such as API keys?',
        answer: `From environment variables, not from the source code, so they are not committed to version control and can differ between machines. <code>os.environ.get("NAME")</code> reads one and returns <code>None</code> if it is missing; the program should check for that and stop with a clear message. In development the variables are often loaded from a <code>.env</code> file that is excluded from version control.`,
      },
    ],
  },

  'command-line-arguments': {
    whyItMatters: `Scripts become useful tools when they accept options: which file to process, how many times to retry, whether to print extra detail. <code>argparse</code> converts and checks the arguments, reports mistakes clearly and writes the <code>--help</code> text for you. Scheduled jobs and deployment scripts are run this way.`,
    exercise: {
      prompt: `Build an argument parser with a <code>--name</code> option and a <code>--times</code> option that is an integer with a default of 1. Parse the sample argument list given in the code, then print the greeting that many times.

Expected output: <code>Hello, Asha!</code> then <code>Hello, Asha!</code>`,
      starterCode: `import argparse

parser = argparse.ArgumentParser()
# TODO: add the --name option
# TODO: add the --times option (an int, default 1)

# A list is passed here so the result does not depend on how the script is started.
args = parser.parse_args(["--name", "Asha", "--times", "2"])

# TODO: print "Hello, <name>!" args.times times`,
      hints: [
        '<code>parser.add_argument("--times", type=int, default=1)</code> converts the text to an integer.',
        'The parsed values are attributes of the result: <code>args.name</code> and <code>args.times</code>.',
      ],
      solution: `import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--name")
parser.add_argument("--times", type=int, default=1)

# A list is passed here so the result does not depend on how the script is started.
args = parser.parse_args(["--name", "Asha", "--times", "2"])

for _ in range(args.times):
    print(f"Hello, {args.name}!")`,
    },
    quiz: [
      {
        question: 'What type are the items of <code>sys.argv</code>?',
        options: ['str', 'int', 'They depend on what was typed', 'bytes'],
        answer: 0,
        explanation: 'Every argument arrives as text and must be converted if a number is needed.',
      },
      {
        question: 'What does <code>argparse</code> provide without any extra code?',
        options: ['A graphical window', 'A --help option listing the arguments', 'Automatic logging', 'A configuration file'],
        answer: 1,
        explanation: 'The help text is built from the arguments you define.',
      },
      {
        question: 'In <code>argparse</code>, how is an optional argument distinguished from a positional one?',
        options: ['By its type', 'By its position in the code', 'Its name starts with - or --', 'By a required=False flag only'],
        answer: 2,
        explanation: 'A name without dashes is positional and must be given.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between sys.argv and argparse?',
        answer: `<code>sys.argv</code> is the raw list of strings from the command line, with the script name first; everything else is up to you. <code>argparse</code> is built on top of it: you declare the arguments, and it parses them, converts types, applies defaults, rejects invalid input with a clear message and generates help text. <code>sys.argv</code> is enough for one simple argument; <code>argparse</code> is used for anything more.`,
      },
      {
        question: 'How would you add a flag such as --verbose that takes no value?',
        answer: `Declare it with <code>action="store_true"</code>: <code>parser.add_argument("--verbose", action="store_true")</code>. The attribute is <code>False</code> by default and becomes <code>True</code> when the flag is present on the command line.`,
      },
    ],
  },

  'virtual-environments': {
    whyItMatters: `Two projects on one machine often need different versions of the same package, and installing everything into the system Python eventually breaks one of them. A virtual environment gives each project its own set of packages. Creating one is the first step in every real Python project, and it is assumed in every team and every deployment guide.`,
    exercise: {
      prompt: `Write the terminal commands, in order, to set up a new project: create a virtual environment named <code>.venv</code>, activate it, install the <code>requests</code> package, and save the list of installed packages to <code>requirements.txt</code>. These are shell commands, not Python code. Give the activation command for both Windows and macOS/Linux.`,
      starterCode: `# 1. create the virtual environment

# 2. activate it (Windows PowerShell)
#    activate it (macOS / Linux)

# 3. install requests

# 4. save the installed packages to requirements.txt`,
      hints: [
        'The environment is created by the <code>venv</code> module, run with <code>python -m</code>.',
        '<code>pip freeze</code> prints the installed packages with their versions; <code>&gt;</code> sends that output to a file.',
      ],
      solution: `# 1. create the virtual environment
python -m venv .venv

# 2. activate it (Windows PowerShell)
.venv\\Scripts\\Activate.ps1
#    activate it (macOS / Linux)
source .venv/bin/activate

# 3. install requests
pip install requests

# 4. save the installed packages to requirements.txt
pip freeze > requirements.txt`,
    },
    quiz: [
      {
        question: 'What problem does a virtual environment solve?',
        options: ['Slow code', 'Running out of memory', 'Syntax errors', 'Projects needing different versions of the same package'],
        answer: 3,
        explanation: 'Each environment has its own installed packages.',
      },
      {
        question: 'Which command creates a virtual environment in the folder <code>.venv</code>?',
        options: ['python -m venv .venv', 'pip install venv', 'python create .venv', 'venv new .venv'],
        answer: 0,
        explanation: 'venv is part of the standard library.',
      },
      {
        question: 'Should the <code>.venv</code> folder be committed to Git?',
        options: ['Yes, always', 'No; commit requirements.txt and recreate the environment from it', 'Only on Windows', 'Only for small projects'],
        answer: 1,
        explanation: 'The folder is large and specific to one machine. It is added to .gitignore.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a virtual environment and how does it work?',
        answer: `It is a folder containing a Python interpreter, or a link to one, and its own <code>site-packages</code> folder for installed packages. Activating it puts its folder first on the <code>PATH</code>, so <code>python</code> and <code>pip</code> refer to that environment. Packages installed while it is active go into it and do not affect other projects or the system Python.`,
      },
      {
        question: 'How do you reproduce a project\'s environment on another machine?',
        answer: `Record the dependencies with their versions in a file, traditionally <code>requirements.txt</code> written by <code>pip freeze</code>. On the other machine, create a new virtual environment, activate it and run <code>pip install -r requirements.txt</code>. Tools such as uv and Poetry do the same with a lock file that pins every package exactly.`,
      },
    ],
  },

  'pip-and-dependency-management': {
    whyItMatters: `Almost every project depends on packages from PyPI, and "it works on my machine" is usually a dependency problem: a different version is installed somewhere else. Stating exactly which versions a project needs makes builds repeatable, and it is the first thing checked when a deployment fails.`,
    exercise: {
      prompt: `The list holds lines from a requirements file. For each line, print the package name followed by <code>pinned</code> if it fixes an exact version with <code>==</code>, or <code>not pinned</code> otherwise.

Expected output: <code>requests pinned</code>, <code>flask not pinned</code>, <code>pytest not pinned</code> (one per line)`,
      starterCode: `requirements = ["requests==2.32.0", "flask>=3.0", "pytest"]

for line in requirements:
    # TODO: find the package name (the text before any of ==, >=)
    # TODO: print the name and "pinned" or "not pinned"
    pass`,
      hints: [
        'A line is pinned when it contains <code>==</code>.',
        'Replace <code>&gt;=</code> with <code>==</code> first, then <code>split("==")[0]</code> gives the name in every case.',
      ],
      solution: `requirements = ["requests==2.32.0", "flask>=3.0", "pytest"]

for line in requirements:
    name = line.replace(">=", "==").split("==")[0]
    status = "pinned" if "==" in line else "not pinned"
    print(name, status)`,
    },
    quiz: [
      {
        question: 'What does <code>pip install requests==2.32.0</code> do?',
        options: ['Installs the newest version', 'Installs any version above 2.32.0', 'Installs exactly version 2.32.0', 'Removes the package'],
        answer: 2,
        explanation: 'The == operator pins an exact version.',
      },
      {
        question: 'Which command installs every package listed in a requirements file?',
        options: ['pip install requirements.txt', 'pip run requirements.txt', 'pip freeze requirements.txt', 'pip install -r requirements.txt'],
        answer: 3,
        explanation: 'The -r option tells pip to read the package list from a file.',
      },
      {
        question: 'Which file is the modern standard place for a project\'s metadata and dependencies?',
        options: ['pyproject.toml', 'setup.cfg', 'package.json', 'Pipfile.txt'],
        answer: 0,
        explanation: 'pip, uv, Poetry and other tools all read it.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why should dependency versions be pinned?',
        answer: `Without a fixed version, <code>pip</code> installs whatever is newest at the time, so the same project can receive different code on different days or machines, and a new release of a dependency can break it without any change of your own. Pinning exact versions, in a requirements file or a lock file, makes every install identical and every build repeatable.`,
      },
      {
        question: 'What is the difference between requirements.txt and pyproject.toml?',
        answer: `<code>requirements.txt</code> is a plain list of packages for <code>pip</code> to install, usually with exact versions. <code>pyproject.toml</code> is a structured file that describes the project itself: its name, version, the Python versions it supports, its dependencies as acceptable ranges, and the configuration of its tools. Modern tools combine it with a lock file that records the exact versions installed.`,
      },
    ],
  },

  'exceptions': {
    whyItMatters: `Files go missing, users type letters where numbers are expected, and networks fail. A program that does not handle these stops with a traceback; one that does can report the problem and carry on. Exception handling is how Python code deals with everything that can go wrong at runtime, and every production program relies on it.`,
    exercise: {
      prompt: `Write <code>safe_divide</code>. It returns the result of the division, or <code>None</code> when the divisor is zero, and in both cases prints <code>done</code> before returning.

Expected output: <code>done</code>, <code>5.0</code>, <code>done</code>, <code>None</code> (one per line)`,
      starterCode: `def safe_divide(a, b):
    # TODO: try the division and return the result
    # TODO: return None if a ZeroDivisionError occurs
    # TODO: print "done" in every case
    pass


print(safe_divide(10, 2))
print(safe_divide(10, 0))`,
      hints: [
        'Catch the specific exception: <code>except ZeroDivisionError:</code>.',
        'A <code>finally</code> block runs whether or not an exception occurred, even when the <code>try</code> block returns.',
      ],
      solution: `def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None
    finally:
        print("done")


print(safe_divide(10, 2))
print(safe_divide(10, 0))`,
    },
    quiz: [
      {
        question: 'When does the <code>else</code> block of a <code>try</code> statement run?',
        options: ['When an exception occurred', 'When no exception occurred in the try block', 'Always', 'Never'],
        answer: 1,
        explanation: 'It holds the code that should run only after the try block has succeeded.',
      },
      {
        question: 'When does the <code>finally</code> block run?',
        options: ['Only after an exception', 'Only when there was no exception', 'In every case', 'Only if there is no except block'],
        answer: 2,
        explanation: 'It is used for clean-up, such as closing a file or a connection.',
      },
      {
        question: 'Why is a bare <code>except:</code> a bad idea?',
        options: ['It is a syntax error', 'It only catches ValueError', 'It is slow', 'It catches everything, including Ctrl+C and real bugs, and hides them'],
        answer: 3,
        explanation: 'Catch the specific exceptions you expect and can handle.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Explain try, except, else and finally.',
        answer: `The <code>try</code> block holds the code that may fail. An <code>except</code> block runs when a matching exception is raised in it. The <code>else</code> block runs only if no exception was raised. The <code>finally</code> block runs in every case, whether there was an exception or not and even if the function returns, and is used to release resources.`,
      },
      {
        question: 'What is the difference between a syntax error and an exception?',
        answer: `A syntax error means the code is not valid Python, for example a missing colon; it is found before the program starts and nothing runs. An exception is raised while a syntactically correct program is running, for example dividing by zero or opening a missing file. Exceptions can be caught and handled with <code>try</code>; a syntax error must be corrected in the source.`,
      },
    ],
  },

  'handling-multiple-exceptions-and-finally': {
    whyItMatters: `One operation can fail in several different ways, and each may need a different response: a missing value might get a default, while an invalid one should be reported. Handling each case separately, in the right order, is what makes error handling precise instead of a single catch-all that hides problems.`,
    exercise: {
      prompt: `Write <code>parse</code>, which reads <code>data[key]</code> and converts it to an integer. It returns the number, or the text <code>missing</code> when the key is absent, or <code>not a number</code> when the value cannot be converted.

Expected output: <code>30</code>, <code>not a number</code>, <code>missing</code> (one per line)`,
      starterCode: `def parse(data, key):
    # TODO: return int(data[key]), handling KeyError and ValueError separately
    pass


print(parse({"age": "30"}, "age"))
print(parse({"age": "x"}, "age"))
print(parse({}, "age"))`,
      hints: [
        'A missing key raises <code>KeyError</code>; text that is not a number raises <code>ValueError</code>.',
        'Write one <code>except</code> block for each, with its own return value.',
      ],
      solution: `def parse(data, key):
    try:
        return int(data[key])
    except KeyError:
        return "missing"
    except ValueError:
        return "not a number"


print(parse({"age": "30"}, "age"))
print(parse({"age": "x"}, "age"))
print(parse({}, "age"))`,
    },
    quiz: [
      {
        question: 'How do you handle two exception types with the same code?',
        options: ['except (ValueError, TypeError):', 'except ValueError, TypeError:', 'except ValueError or TypeError:', 'except [ValueError, TypeError]:'],
        answer: 0,
        explanation: 'The types are given as a tuple in parentheses.',
      },
      {
        question: 'An <code>except Exception:</code> block is written before an <code>except ValueError:</code> block. What happens when a ValueError is raised?',
        options: ['The ValueError block runs', 'The Exception block runs; the ValueError block can never be reached', 'Both run', 'A syntax error'],
        answer: 1,
        explanation: 'The first matching block wins, so specific exceptions must come before general ones.',
      },
      {
        question: 'A <code>try</code> block returns 1 and its <code>finally</code> block returns 2. What does the function return?',
        options: ['1', 'It raises an error', 'None', '2'],
        answer: 3,
        explanation: 'A return in finally overrides the earlier one, which is why returning from finally is avoided.',
      },
    ],
    interviewQuestions: [
      {
        question: 'In what order should except blocks be written?',
        answer: `From the most specific exception to the most general. Python uses the first <code>except</code> block whose type matches, and a parent class matches all its subclasses, so a general block such as <code>except Exception</code> placed first would catch everything and the specific blocks after it would never run.`,
      },
      {
        question: 'What are exception groups and except*?',
        answer: `Added in Python 3.11, an <code>ExceptionGroup</code> bundles several exceptions that happened together, which occurs when tasks run concurrently and more than one fails. <code>except*</code> handles the members of a group by type: each <code>except*</code> block receives the matching exceptions, and any that are not handled continue to propagate.`,
      },
    ],
  },

  'raising-and-custom-exceptions': {
    whyItMatters: `Your own functions also need to report problems. Returning <code>None</code> or <code>-1</code> for an error is easy to ignore and leads to failures far from the cause; raising an exception cannot be missed. Custom exception classes let callers handle your errors by name and carry the details needed to respond.`,
    exercise: {
      prompt: `Define a custom exception <code>InsufficientFunds</code> that stores the balance and the amount requested. <code>withdraw</code> should raise it when the amount exceeds the balance. The caller catches it and prints how much is missing, then whether the error is an <code>Exception</code>.

Expected output: <code>Short by 50</code> then <code>True</code>`,
      starterCode: `# TODO: class InsufficientFunds(Exception) storing balance and amount


def withdraw(balance, amount):
    # TODO: raise InsufficientFunds when amount > balance
    return balance - amount


try:
    withdraw(100, 150)
except InsufficientFunds as error:
    print(f"Short by {error.amount - error.balance}")
    print(isinstance(error, Exception))`,
      hints: [
        'Give the class an <code>__init__(self, balance, amount)</code> that stores both and calls <code>super().__init__(...)</code> with a message.',
        'Raise it with <code>raise InsufficientFunds(balance, amount)</code>.',
      ],
      solution: `class InsufficientFunds(Exception):
    def __init__(self, balance, amount):
        super().__init__(f"cannot withdraw {amount} from {balance}")
        self.balance = balance
        self.amount = amount


def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFunds(balance, amount)
    return balance - amount


try:
    withdraw(100, 150)
except InsufficientFunds as error:
    print(f"Short by {error.amount - error.balance}")
    print(isinstance(error, Exception))`,
    },
    quiz: [
      {
        question: 'Which class should a custom exception inherit from?',
        options: ['BaseException', 'Error', 'object', 'Exception'],
        answer: 3,
        explanation: 'BaseException is reserved for things like KeyboardInterrupt and SystemExit.',
      },
      {
        question: 'What does a bare <code>raise</code> inside an <code>except</code> block do?',
        options: ['Raises a new empty exception', 'Re-raises the exception that is being handled', 'Ends the program silently', 'Nothing'],
        answer: 1,
        explanation: 'It is used to log an error and still let it propagate.',
      },
      {
        question: 'What does <code>raise AppError("failed") from original</code> do?',
        options: ['Discards the original exception', 'Records the original as the cause, so both appear in the traceback', 'Raises both at once', 'It is a syntax error'],
        answer: 1,
        explanation: 'The original is stored in the __cause__ attribute of the new exception.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why create custom exception classes?',
        answer: `They let callers catch the errors of your code specifically, without also catching unrelated ones, and they can carry extra data such as an error code or the offending value. A library usually defines one base exception and derives the others from it, so a caller can catch a single case or everything the library raises with one <code>except</code>.`,
      },
      {
        question: 'What is exception chaining?',
        answer: `When an exception is raised while another is being handled, Python links them. <code>raise NewError(...) from original</code> does this explicitly and sets <code>__cause__</code>, and the traceback shows both with "The above exception was the direct cause". It is used to convert a low-level error, such as a database error, into one that is meaningful to the caller without losing the original details.`,
      },
    ],
  },

  'built-in-exceptions-reference': {
    whyItMatters: `The name of an exception tells you what kind of mistake happened before you read anything else: <code>KeyError</code> means a missing dictionary key, <code>TypeError</code> the wrong kind of value. Knowing the common ones and how they are related lets you read a traceback quickly and catch exactly the right class.`,
    exercise: {
      prompt: `Each function in the list fails with a different built-in exception. Call each one, catch the exception, and print the name of its class.

Expected output: <code>ValueError</code>, <code>IndexError</code>, <code>KeyError</code>, <code>ZeroDivisionError</code>, <code>TypeError</code> (one per line)`,
      starterCode: `operations = [
    lambda: int("x"),
    lambda: [1][5],
    lambda: {}["k"],
    lambda: 1 / 0,
    lambda: "a" + 1,
]

for operation in operations:
    # TODO: call the operation, catch the exception and print its class name
    pass`,
      hints: [
        '<code>except Exception as error:</code> catches all five and gives you the exception object.',
        'The class name is <code>type(error).__name__</code>.',
      ],
      solution: `operations = [
    lambda: int("x"),
    lambda: [1][5],
    lambda: {}["k"],
    lambda: 1 / 0,
    lambda: "a" + 1,
]

for operation in operations:
    try:
        operation()
    except Exception as error:
        print(type(error).__name__)`,
    },
    quiz: [
      {
        question: 'Which exception is raised by <code>len(5)</code>?',
        options: ['ValueError', 'AttributeError', 'TypeError', 'IndexError'],
        answer: 2,
        explanation: 'TypeError means the operation does not apply to a value of that type.',
      },
      {
        question: 'Which class is the common parent of <code>KeyError</code> and <code>IndexError</code>?',
        options: ['ValueError', 'RuntimeError', 'ArithmeticError', 'LookupError'],
        answer: 3,
        explanation: 'Catching LookupError handles a failed lookup in either a dictionary or a sequence.',
      },
      {
        question: 'In a traceback, where is the line that raised the exception?',
        options: ['At the bottom, just above the error message', 'At the top', 'It is not shown', 'In the middle'],
        answer: 0,
        explanation: 'A traceback lists the calls from the outermost to the innermost, so it is read from the bottom up.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between Exception and BaseException?',
        answer: `<code>BaseException</code> is the root of the whole hierarchy. Directly under it are <code>SystemExit</code>, <code>KeyboardInterrupt</code> and <code>GeneratorExit</code>, which signal that the program is being asked to stop, and <code>Exception</code>, the parent of all ordinary errors. Code should catch <code>Exception</code> or something more specific, so that Ctrl+C and <code>sys.exit()</code> still work.`,
      },
      {
        question: 'What is the difference between ValueError and TypeError?',
        answer: `<code>TypeError</code> is raised when a value is of the wrong type for the operation, as in <code>"a" + 1</code>. <code>ValueError</code> is raised when the type is acceptable but the value is not, as in <code>int("abc")</code>, where a string is allowed but this particular string is not a number.`,
      },
    ],
  },

  'assertions-and-debugging': {
    whyItMatters: `Much of a developer's time goes on finding out why code does not do what was intended. A systematic method — reproduce the problem, read the traceback, inspect the values, narrow the search — is faster than changing things at random. Assertions help by stopping the program at the first moment an assumption turns out to be false.`,
    exercise: {
      prompt: `Write <code>average</code>, which uses an <code>assert</code> to state that the list must not be empty, with the message <code>empty list</code>. The second call triggers the assertion, which is caught and its message printed.

Expected output: <code>3.0</code> then <code>empty list</code>`,
      starterCode: `def average(values):
    # TODO: assert that values is not empty, with the message "empty list"
    return sum(values) / len(values)


print(average([2, 4]))

try:
    average([])
except AssertionError as error:
    print(error)`,
      hints: [
        'The form is <code>assert condition, "message"</code>.',
        'An empty list is falsy, so the condition can be just <code>values</code> or <code>len(values) &gt; 0</code>.',
      ],
      solution: `def average(values):
    assert len(values) > 0, "empty list"
    return sum(values) / len(values)


print(average([2, 4]))

try:
    average([])
except AssertionError as error:
    print(error)`,
    },
    quiz: [
      {
        question: 'What happens to <code>assert</code> statements when Python is run with the <code>-O</code> option?',
        options: ['They become errors', 'They are removed and never checked', 'They run twice', 'They are logged'],
        answer: 1,
        explanation: 'This is why assertions must not be used for checks the program depends on.',
      },
      {
        question: 'Should <code>assert</code> be used to validate input from a user?',
        options: ['Yes, it is the standard way', 'Only for numbers', 'No; use an if statement and raise a proper exception', 'Only in production'],
        answer: 2,
        explanation: 'Assertions document conditions that should never be false if the code is correct.',
      },
      {
        question: 'What does the built-in <code>breakpoint()</code> do?',
        options: ['Ends the program', 'Clears the screen', 'Prints the traceback', 'Pauses the program and opens the debugger at that line'],
        answer: 3,
        explanation: 'By default it starts pdb, where variables can be inspected and the code stepped through.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between assert and raising an exception?',
        answer: `An <code>assert</code> checks something that must be true if the program itself is correct; a failure means there is a bug. It can be switched off, so the program must not depend on it. Raising an exception handles conditions that can legitimately occur at runtime, such as invalid input or a missing file, and is always active. Use exceptions for anything coming from outside the code.`,
      },
      {
        question: 'How do you approach debugging a problem?',
        answer: `Reproduce it reliably with the smallest input possible. Read the traceback from the bottom to find the failing line and the exception. Form a guess about the cause and check it by inspecting values with a debugger or print statements, narrowing down where the actual values first differ from the expected ones. Fix the cause, not the symptom, and add a test that would have caught the bug.`,
      },
    ],
  },

  'logging': {
    whyItMatters: `When something goes wrong on a server at night, the logs are the only record of what happened. <code>print</code> statements cannot be filtered by importance, switched off, or sent to a file without editing the code; <code>logging</code> does all of that through configuration. Every production Python application uses it.`,
    exercise: {
      prompt: `Configure logging to write to standard output, at level <code>INFO</code>, in the format <code>LEVEL:message</code>. Then log one message at each of the levels debug, info and warning. The debug message must not appear.

Expected output: <code>INFO:started</code> then <code>WARNING:disk almost full</code>`,
      starterCode: `import logging
import sys

# TODO: call logging.basicConfig with stream, level and format

logging.debug("details for developers")
logging.info("started")
logging.warning("disk almost full")`,
      hints: [
        'The arguments are <code>stream=sys.stdout</code>, <code>level=logging.INFO</code> and <code>format="%(levelname)s:%(message)s"</code>.',
        'Add <code>force=True</code> so that the configuration replaces any that already exists.',
      ],
      solution: `import logging
import sys

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(levelname)s:%(message)s",
    force=True,
)

logging.debug("details for developers")
logging.info("started")
logging.warning("disk almost full")`,
    },
    quiz: [
      {
        question: 'With no configuration, which is the lowest level that is displayed?',
        options: ['WARNING', 'INFO', 'DEBUG', 'ERROR'],
        answer: 0,
        explanation: 'The default level is WARNING, so debug and info messages are not shown.',
      },
      {
        question: 'Which is the correct order of the levels, from least to most severe?',
        options: ['INFO, DEBUG, WARNING, ERROR, CRITICAL', 'DEBUG, INFO, WARNING, ERROR, CRITICAL', 'DEBUG, WARNING, INFO, ERROR, CRITICAL', 'WARNING, INFO, DEBUG, CRITICAL, ERROR'],
        answer: 1,
        explanation: 'A logger shows messages at its own level and above.',
      },
      {
        question: 'What does <code>logger.exception("failed")</code> add to the log, when called in an <code>except</code> block?',
        options: ['Nothing extra', 'A new exception', 'The time only', 'The full traceback of the current exception'],
        answer: 3,
        explanation: 'It logs at ERROR level and includes the traceback.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why use logging instead of print?',
        answer: `Log messages have a level, so detailed messages can be turned on during development and off in production without changing the code. Output can go to the console, to files that rotate, or to a monitoring system, and each line can include the time, the module and the level automatically. <code>print</code> offers none of this and has to be removed or edited by hand.`,
      },
      {
        question: 'What are loggers, handlers and formatters?',
        answer: `A logger is the object code calls to record a message; each module usually gets its own with <code>logging.getLogger(__name__)</code>. A handler decides where records go, such as the console or a file. A formatter decides how each record is laid out as text. A logger can have several handlers, each with its own level and format.`,
      },
    ],
  },

  'files': {
    whyItMatters: `Programs keep data between runs by writing it to files: reports, exports, configuration, logs. The rules are few, but mistakes are costly: opening a file in the wrong mode erases it, and forgetting to close it can lose data. The <code>with</code> statement shown in this lesson is the form used in all professional code.`,
    exercise: {
      prompt: `In a temporary folder, write three lines to a text file, read them back, and print how many lines there are and the first line. Then append a fourth line and print the new number of lines.

Expected output: <code>3</code>, <code>first</code>, <code>4</code> (one per line)`,
      starterCode: `import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as folder:
    path = Path(folder) / "notes.txt"

    # TODO: write the lines "first", "second" and "third" to the file

    # TODO: read the lines back, print how many there are and the first one

    # TODO: append the line "fourth", read the file again and print the line count
    pass`,
      hints: [
        'Mode <code>"w"</code> creates or overwrites the file, and mode <code>"a"</code> adds to the end.',
        '<code>file.read().splitlines()</code> gives the lines without their line breaks.',
      ],
      solution: `import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as folder:
    path = Path(folder) / "notes.txt"

    with open(path, "w") as file:
        file.write("first\\nsecond\\nthird\\n")

    with open(path) as file:
        lines = file.read().splitlines()
    print(len(lines))
    print(lines[0])

    with open(path, "a") as file:
        file.write("fourth\\n")

    with open(path) as file:
        print(len(file.read().splitlines()))`,
    },
    quiz: [
      {
        question: 'What happens when an existing file is opened with mode <code>"w"</code>?',
        options: ['New text is added at the end', 'It is opened read-only', 'An error is raised', 'Its contents are erased'],
        answer: 3,
        explanation: 'Use "a" to add to a file, or "x" to fail if the file already exists.',
      },
      {
        question: 'What does the <code>with</code> statement guarantee for a file?',
        options: ['That the file is closed when the block ends, even if an error occurs', 'That the file exists', 'That the file is read faster', 'That the file cannot be changed'],
        answer: 0,
        explanation: 'Closing also makes sure that buffered data is written.',
      },
      {
        question: 'What is the most memory-efficient way to process a very large text file?',
        options: ['file.read()', 'Looping over the file object, one line at a time', 'file.readlines()', 'Opening it twice'],
        answer: 1,
        explanation: 'read() and readlines() load the whole file into memory.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the main file modes in Python?',
        answer: `<code>"r"</code> reads and is the default; the file must exist. <code>"w"</code> writes, creating the file or erasing its contents. <code>"a"</code> appends to the end. <code>"x"</code> creates a new file and fails if it exists. Adding <code>"b"</code> opens the file in binary mode, for images and other non-text data, and adding <code>"+"</code> allows both reading and writing.`,
      },
      {
        question: 'Why should you pass encoding="utf-8" when opening a text file?',
        answer: `Without it, Python uses the default encoding of the platform, which has differed between operating systems, so a file written on one machine could be read incorrectly on another, or fail with <code>UnicodeDecodeError</code>. Stating the encoding makes the behaviour the same everywhere. UTF-8 is the standard choice.`,
      },
    ],
  },

  'csv-files': {
    whyItMatters: `CSV is the common format for moving table data between spreadsheets, databases and programs: bank statements, exported reports, product lists. It looks simple enough to parse by splitting on commas, until a value contains a comma or a quotation mark. The <code>csv</code> module handles those cases correctly.`,
    exercise: {
      prompt: `The CSV text is read from memory here in place of a file. Use <code>csv.DictReader</code> to print the name of each student who scored more than 85, and then the total of all scores.

Expected output: <code>Ravi</code> then <code>173</code>`,
      starterCode: `import csv
import io

text = "name,score\\nAsha,82\\nRavi,91\\n"
file = io.StringIO(text)  # behaves like an open file

total = 0

# TODO: read the rows with csv.DictReader
# TODO: print the name when the score is above 85, and add every score to total

print(total)`,
      hints: [
        'Each row from <code>DictReader</code> is a dictionary keyed by the header row.',
        'Values read from CSV are strings, so convert the score with <code>int()</code>.',
      ],
      solution: `import csv
import io

text = "name,score\\nAsha,82\\nRavi,91\\n"
file = io.StringIO(text)  # behaves like an open file

total = 0

for row in csv.DictReader(file):
    score = int(row["score"])
    if score > 85:
        print(row["name"])
    total += score

print(total)`,
    },
    quiz: [
      {
        question: 'What type are the values read by <code>csv.reader</code>?',
        options: ['Numbers when the text looks like a number', 'Always floats', 'Always strings', 'Bytes'],
        answer: 2,
        explanation: 'The csv module does no conversion. Numbers must be converted explicitly.',
      },
      {
        question: 'Where does <code>csv.DictReader</code> get its keys from by default?',
        options: ['They must be supplied', 'The column numbers', 'The file name', 'The first row of the file'],
        answer: 3,
        explanation: 'The header row provides the field names.',
      },
      {
        question: 'Why is a file opened with <code>newline=""</code> when it is passed to the csv module?',
        options: ['So that the csv module controls line endings and no blank rows appear on Windows', 'To make it faster', 'To skip the header', 'To allow commas in values'],
        answer: 0,
        explanation: 'This is the form recommended in the documentation for both reading and writing.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why use the csv module instead of line.split(",")?',
        answer: `A value may itself contain a comma, a quotation mark or a line break, in which case it is enclosed in quotes: <code>"Sharma, Asha",82</code>. Splitting on commas breaks such a value into two. The <code>csv</code> module follows the quoting rules, and handles other delimiters and dialects, when both reading and writing.`,
      },
      {
        question: 'How would you process a CSV file that is too large to fit in memory?',
        answer: `Iterate over the reader, which yields one row at a time, and keep only running results such as totals or counts, never a list of all rows. With pandas, <code>read_csv(..., chunksize=n)</code> returns the file in pieces of <code>n</code> rows that are processed one after another.`,
      },
    ],
  },

  'excel-files': {
    whyItMatters: `A great deal of business data lives in Excel workbooks, and producing or reading them automatically is one of the most requested uses of Python in offices: monthly reports, data clean-up, combining sheets. A script that does in seconds what takes someone an hour by hand is an easy way to show the value of programming.`,
    exercise: {
      prompt: `Using <code>openpyxl</code>, which must be installed with <code>pip install openpyxl</code>, create a workbook with a sheet named <code>Sales</code> that has a header row and two data rows, and save it. Then load the file again and print the total of the <code>Amount</code> column.

Expected output: <code>570</code>`,
      starterCode: `from openpyxl import Workbook, load_workbook

workbook = Workbook()
sheet = workbook.active
# TODO: name the sheet "Sales"
# TODO: append the rows ["Item", "Amount"], ["Pen", 120] and ["Book", 450]
# TODO: save the workbook as sales.xlsx

# TODO: load sales.xlsx, read the Amount column (skipping the header) and print its total`,
      hints: [
        '<code>sheet.append([...])</code> adds a row, and <code>workbook.save("sales.xlsx")</code> writes the file.',
        '<code>sheet.iter_rows(min_row=2, values_only=True)</code> yields each data row as a tuple of values.',
      ],
      solution: `from openpyxl import Workbook, load_workbook

workbook = Workbook()
sheet = workbook.active
sheet.title = "Sales"
sheet.append(["Item", "Amount"])
sheet.append(["Pen", 120])
sheet.append(["Book", 450])
workbook.save("sales.xlsx")

loaded = load_workbook("sales.xlsx")["Sales"]
total = sum(row[1] for row in loaded.iter_rows(min_row=2, values_only=True))
print(total)`,
    },
    quiz: [
      {
        question: 'Which library is commonly used to read and write <code>.xlsx</code> files cell by cell?',
        options: ['csv', 'openpyxl', 'json', 'pickle'],
        answer: 1,
        explanation: 'It is a third-party package and is installed with pip.',
      },
      {
        question: 'In openpyxl, what does <code>sheet["B2"].value</code> give?',
        options: ['The address of the cell', 'The whole of column B', 'The content of cell B2', 'The formatting of the cell'],
        answer: 2,
        explanation: 'A cell object also has attributes for its font, fill and number format.',
      },
      {
        question: 'Which pandas function reads a sheet of an Excel file into a DataFrame?',
        options: ['pd.load_excel', 'pd.excel', 'pd.open_xlsx', 'pd.read_excel'],
        answer: 3,
        explanation: 'pandas uses openpyxl underneath for .xlsx files.',
      },
    ],
    interviewQuestions: [
      {
        question: 'When would you use openpyxl and when pandas for Excel files?',
        answer: `Use openpyxl when you need control over individual cells: formatting, formulas, column widths, several sheets, or changing an existing workbook while keeping its layout. Use pandas when the sheet is a table of data to be filtered, grouped or combined: <code>read_excel</code> loads it into a DataFrame and <code>to_excel</code> writes one back. The two are often used together.`,
      },
      {
        question: 'What is the difference between a CSV file and an Excel file?',
        answer: `A CSV file is plain text containing one table, with no types, formatting or formulas, and any program can read it. An Excel <code>.xlsx</code> file is a compressed set of XML files that can hold several sheets, typed cells, formulas, formatting and charts, and needs a library to read. CSV is preferred for exchanging data between programs; Excel is used when people will work with the file.`,
      },
    ],
  },

  'json': {
    whyItMatters: `JSON is the format in which web APIs send and receive data, and it is also widely used for configuration files. Every time a Python program talks to a web service, it converts dictionaries to JSON text and back. The mapping between the two is close, but the few differences are worth knowing before they cause a bug.`,
    exercise: {
      prompt: `Convert the dictionary to a JSON string and print it. Then parse the JSON text given below and print the Python type of its <code>price</code> and the value of its <code>tags</code>.

Expected output: <code>{"name": "Asha", "skills": ["python", "sql"], "active": true}</code> then <code>float None</code>`,
      starterCode: `import json

user = {"name": "Asha", "skills": ["python", "sql"], "active": True}
# TODO: print the dictionary as a JSON string

text = '{"price": 12.5, "tags": null}'
# TODO: parse the text, then print the type name of price and the value of tags`,
      hints: [
        '<code>json.dumps(obj)</code> returns a string and <code>json.loads(text)</code> returns Python objects.',
        'JSON <code>true</code> and <code>null</code> correspond to Python <code>True</code> and <code>None</code>.',
      ],
      solution: `import json

user = {"name": "Asha", "skills": ["python", "sql"], "active": True}
print(json.dumps(user))

text = '{"price": 12.5, "tags": null}'
data = json.loads(text)
print(type(data["price"]).__name__, data["tags"])`,
    },
    quiz: [
      {
        question: 'What is the difference between <code>json.dump</code> and <code>json.dumps</code>?',
        options: ['There is none', 'dump writes to a file object; dumps returns a string', 'dumps writes to a file; dump returns a string', 'dump is for lists only'],
        answer: 1,
        explanation: 'The "s" stands for string. load and loads differ in the same way.',
      },
      {
        question: 'What does the JSON value <code>null</code> become in Python?',
        options: ['"null"', 'None', '0', 'False'],
        answer: 1,
        explanation: 'Likewise true and false become True and False.',
      },
      {
        question: 'A Python tuple is converted to JSON and back. What type is it afterwards?',
        options: ['tuple', 'list', 'dict', 'str'],
        answer: 1,
        explanation: 'JSON has only arrays, which are read back as lists.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do Python types map to JSON?',
        answer: `A <code>dict</code> becomes an object, a <code>list</code> or <code>tuple</code> an array, a <code>str</code> a string, <code>int</code> and <code>float</code> a number, <code>True</code> and <code>False</code> become <code>true</code> and <code>false</code>, and <code>None</code> becomes <code>null</code>. Dictionary keys must be strings in JSON, so other keys are converted to strings. Sets, dates and custom objects have no JSON form and raise <code>TypeError</code>.`,
      },
      {
        question: 'How do you serialise a datetime or a custom object to JSON?',
        answer: `Pass a function as the <code>default</code> argument of <code>json.dumps</code>. It is called for any object the encoder does not know and must return something serialisable, for example <code>obj.isoformat()</code> for a date or a dictionary of the object's fields. When reading the JSON back, the reverse conversion has to be done explicitly.`,
      },
    ],
  },

  'context-managers': {
    whyItMatters: `Files, database connections, locks and network sockets must all be released when you have finished with them, including when an error interrupts the code. The <code>with</code> statement guarantees it. Writing your own context manager lets you give the same guarantee for anything that has a set-up and a clean-up step.`,
    exercise: {
      prompt: `Using <code>contextlib.contextmanager</code>, write a context manager <code>tag</code> that prints an opening tag before the block runs and a closing tag after it.

Expected output: <code>&lt;b&gt;</code>, <code>hello</code>, <code>&lt;/b&gt;</code> (one per line)`,
      starterCode: `from contextlib import contextmanager


# TODO: a context manager tag(name) that prints <name>, runs the block, then prints </name>


with tag("b"):
    print("hello")`,
      hints: [
        'Decorate a generator function with <code>@contextmanager</code>. The code before <code>yield</code> runs on entry and the code after it on exit.',
        'Put the <code>yield</code> in a <code>try</code> block and the closing print in <code>finally</code>, so it runs even if the block raises.',
      ],
      solution: `from contextlib import contextmanager


@contextmanager
def tag(name):
    print(f"<{name}>")
    try:
        yield
    finally:
        print(f"</{name}>")


with tag("b"):
    print("hello")`,
    },
    quiz: [
      {
        question: 'Which two methods does a class need in order to be used in a <code>with</code> statement?',
        options: ['__open__ and __close__', '__start__ and __stop__', '__enter__ and __exit__', '__init__ and __del__'],
        answer: 2,
        explanation: '__enter__ runs at the start of the block and __exit__ at the end.',
      },
      {
        question: 'Is <code>__exit__</code> called when the block raises an exception?',
        options: ['No', 'Only if there is an except block', 'Only for ValueError', 'Yes; it receives the details of the exception'],
        answer: 3,
        explanation: 'That is what makes the clean-up reliable.',
      },
      {
        question: 'What happens if <code>__exit__</code> returns <code>True</code>?',
        options: ['The block runs again', 'The exception raised in the block is suppressed', 'The program exits', 'Nothing'],
        answer: 1,
        explanation: 'Returning a falsy value lets the exception continue to propagate.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a context manager?',
        answer: `An object that defines what happens on entering and on leaving a <code>with</code> block, through its <code>__enter__</code> and <code>__exit__</code> methods. It is used wherever a resource is acquired and must be released: files, locks, database transactions, temporary changes of settings. The release happens even if the block raises an exception.`,
      },
      {
        question: 'What are the two ways to write a context manager?',
        answer: `As a class with <code>__enter__</code>, which returns the value bound by <code>as</code>, and <code>__exit__</code>, which performs the clean-up. Or as a generator function decorated with <code>@contextlib.contextmanager</code>: the code before <code>yield</code> is the set-up, the yielded value is bound by <code>as</code>, and the code after it, placed in a <code>finally</code> block, is the clean-up. The generator form is shorter for simple cases.`,
      },
    ],
  },
}
