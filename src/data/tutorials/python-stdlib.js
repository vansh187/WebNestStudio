// Python course — standard modules, packaging, exceptions, logging and file
// format lessons. Keys are slugs matching topics in codelabDefaults.js.
export const pythonStdlib = {
  'math-random-and-statistics-modules': {
    title: 'The math, random and statistics Modules',
    intro: `Three standard modules cover most everyday numeric work. <code>math</code> provides mathematical functions and constants, <code>random</code> generates pseudo-random numbers and random choices (for simulations, games, sampling and shuffling), and <code>statistics</code> computes averages, spread and other descriptive statistics without installing any library.

This lesson tours each module with practical examples, and explains when to use the <code>secrets</code> module instead of <code>random</code>.`,
    sections: [
      {
        heading: 'The math Module',
        body: `Constants <code>math.pi</code>, <code>math.e</code>, <code>math.tau</code>, <code>math.inf</code> and <code>math.nan</code>; rounding with <code>floor</code>, <code>ceil</code>, <code>trunc</code>; powers and logs with <code>sqrt</code>, <code>isqrt</code>, <code>pow</code>, <code>exp</code>, <code>log</code>, <code>log10</code>, <code>log2</code>; trigonometry with <code>sin</code>, <code>cos</code>, <code>tan</code>, <code>radians</code>, <code>degrees</code>, <code>hypot</code>; number theory with <code>factorial</code>, <code>gcd</code>, <code>lcm</code>, <code>comb</code>, <code>perm</code>; and <code>isclose</code>, <code>fsum</code> (accurate float sums) and <code>prod</code>.`,
      },
      {
        heading: 'The random Module',
        body: `<code>random()</code> gives a float in [0, 1); <code>uniform(a, b)</code> a float in a range; <code>randint(a, b)</code> an integer including both ends; <code>randrange(start, stop, step)</code>; <code>choice(seq)</code> one item; <code>choices(seq, weights, k)</code> with replacement; <code>sample(seq, k)</code> without replacement; <code>shuffle(list)</code> in place; <code>gauss(mu, sigma)</code> normally distributed values. <code>random.seed(n)</code> makes results reproducible — essential for tests and experiments.`,
      },
      {
        heading: 'random vs secrets',
        body: `<code>random</code> is predictable by design and must never be used for passwords, tokens or OTPs. Use the <code>secrets</code> module: <code>secrets.token_urlsafe()</code>, <code>secrets.token_hex()</code>, <code>secrets.choice()</code>, <code>secrets.randbelow()</code>.`,
      },
      {
        heading: 'The statistics Module',
        body: `<code>mean</code>, <code>fmean</code>, <code>median</code>, <code>median_low</code>/<code>median_high</code>, <code>mode</code>, <code>multimode</code>, <code>stdev</code> and <code>variance</code> (sample), <code>pstdev</code> and <code>pvariance</code> (population), <code>quantiles</code>, <code>correlation</code> and <code>linear_regression</code>. For large datasets, NumPy and pandas are faster, but <code>statistics</code> is perfect for small data and scripts.`,
      },
    ],
    examples: [
      {
        caption: 'The math module',
        code: `import math

print(math.pi, math.e, math.inf > 10**100)
print(math.floor(-2.5), math.ceil(-2.5), math.trunc(-2.5))
print(math.sqrt(2), math.isqrt(17), math.pow(2, 0.5))
print(math.log(math.e), math.log10(1000), math.log2(1024), math.log(8, 2))
print(round(math.cos(math.radians(60)), 3), math.degrees(math.pi), math.hypot(3, 4))
print(math.factorial(6), math.gcd(48, 18), math.lcm(4, 10), math.comb(5, 2), math.perm(5, 2))
print(0.1 + 0.2 + 0.3, math.fsum([0.1, 0.2, 0.3]), math.prod([2, 3, 4]))`,
        output: `3.141592653589793 2.718281828459045 True
-3 -2 -2
1.4142135623730951 4 1.4142135623730951
1.0 3.0 10.0 3.0
0.5 180.0 5.0
720 6 20 10 20
0.6000000000000001 0.6 24`,
      },
      {
        caption: 'The random module with a fixed seed',
        code: `import random

random.seed(42)
print(round(random.random(), 4), round(random.uniform(1, 10), 2))
print(random.randint(1, 6), random.randrange(0, 100, 5))
colors = ["red", "green", "blue", "yellow"]
print(random.choice(colors))
print(random.choices(colors, weights=[5, 1, 1, 1], k=4))
print(random.sample(range(1, 50), 6))
deck = list(range(1, 11))
random.shuffle(deck)
print(deck)`,
        output: `0.6394 1.23
3 35
green
['red', 'red', 'green', 'red']
[38, 28, 3, 2, 6, 14]
[3, 6, 8, 10, 7, 2, 5, 1, 9, 4]`,
      },
      {
        caption: 'Secure tokens with secrets',
        code: `import secrets
import string

token = secrets.token_urlsafe(16)
otp = "".join(secrets.choice(string.digits) for _ in range(6))
print(len(token) > 16, len(otp), otp.isdigit())
print(len(secrets.token_hex(8)), 0 <= secrets.randbelow(10) < 10)`,
        output: `True 6 True
16 True`,
      },
      {
        caption: 'The statistics module',
        code: `import statistics as st

marks = [72, 85, 90, 66, 85, 78, 95, 85]
print(st.mean(marks), st.median(marks), st.mode(marks), st.multimode([1, 1, 2, 2, 3]))
print(round(st.stdev(marks), 2), round(st.pstdev(marks), 2), round(st.variance(marks), 2))
print(st.quantiles(marks, n=4))

hours = [1, 2, 3, 4, 5]
scores = [52, 60, 68, 71, 82]
print(round(st.correlation(hours, scores), 3))
slope, intercept = st.linear_regression(hours, scores)
print(round(slope, 2), round(intercept, 2), "predicted for 6h:", round(slope * 6 + intercept, 1))`,
        output: `82 85.0 85 [1, 2]
9.5 8.89 90.29
[73.5, 85.0, 88.75]
0.989
7.1 45.3 predicted for 6h: 87.9`,
      },
    ],
    commonMistakes: [
      'Using random to generate passwords, OTPs or tokens — use secrets.',
      'Forgetting that randint(a, b) includes b while randrange(a, b) excludes it.',
      'Using mean on skewed data (salaries) where median is more representative.',
      'Confusing stdev (sample) with pstdev (population).',
    ],
    keyPoints: [
      'math: constants, rounding, powers/logs, trigonometry, factorial/gcd/comb, fsum/prod/isclose.',
      'random: random, uniform, randint, choice, choices, sample, shuffle; seed for reproducibility.',
      'secrets: cryptographically secure tokens and choices.',
      'statistics: mean, median, mode, stdev/variance, quantiles, correlation, linear_regression.',
    ],
  },

  'os-sys-and-pathlib': {
    title: 'The os, sys and pathlib Modules',
    intro: `Scripts constantly interact with their environment: reading environment variables, listing and creating folders, building file paths that work on Windows and Linux, checking the Python version, or exiting with an error code. The <code>os</code>, <code>sys</code> and <code>pathlib</code> modules handle all of this, and <code>shutil</code> adds high-level copying and moving.

This lesson covers each module's most useful features, with a strong recommendation to use <code>pathlib</code> for paths in new code.`,
    sections: [
      {
        heading: 'pathlib: Object-Oriented Paths',
        body: `<code>Path</code> objects represent file-system paths. Join them with <code>/</code>, read parts with <code>.name</code>, <code>.stem</code>, <code>.suffix</code>, <code>.parent</code>, check with <code>.exists()</code>, <code>.is_file()</code>, <code>.is_dir()</code>, create with <code>.mkdir(parents=True, exist_ok=True)</code>, read and write with <code>.read_text()</code>/<code>.write_text()</code>, and search with <code>.glob("*.csv")</code> and <code>.rglob()</code>. Paths automatically use the right separator for the operating system.`,
      },
      {
        heading: 'The os Module',
        body: `<code>os.environ</code> and <code>os.getenv("KEY", default)</code> read environment variables (the standard place for configuration and secrets). <code>os.getcwd()</code>, <code>os.chdir()</code>, <code>os.listdir()</code>, <code>os.makedirs()</code>, <code>os.remove()</code>, <code>os.rename()</code> and <code>os.walk()</code> work with the file system; <code>os.path</code> contains older path helpers; <code>os.cpu_count()</code> and <code>os.getpid()</code> give system information.`,
      },
      {
        heading: 'The sys Module',
        body: `<code>sys.argv</code> holds command-line arguments; <code>sys.exit(code)</code> ends the program with an exit status; <code>sys.version</code> and <code>sys.version_info</code> identify the interpreter; <code>sys.platform</code> the operating system; <code>sys.path</code> the module search path; <code>sys.stdin</code>, <code>sys.stdout</code> and <code>sys.stderr</code> the standard streams; <code>sys.getsizeof()</code> an object's memory size.`,
      },
      {
        heading: 'shutil',
        body: `<code>shutil.copy()</code>, <code>copytree()</code>, <code>move()</code>, <code>rmtree()</code> (delete a folder and everything in it — carefully!), <code>make_archive()</code> for zip files, and <code>disk_usage()</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Working with paths using pathlib',
        code: `from pathlib import Path

base = Path("demo_project")
(base / "data").mkdir(parents=True, exist_ok=True)
(base / "data" / "students.csv").write_text("name,marks\\nAsha,91\\n")
(base / "data" / "notes.txt").write_text("hello")
(base / "README.md").write_text("# Demo")

report = base / "data" / "students.csv"
print(report.name, report.stem, report.suffix, report.parent.name)
print(report.exists(), report.is_file(), (base / "data").is_dir())
print(report.read_text().splitlines())
print(sorted(p.name for p in base.rglob("*.*")))
print(sorted(p.name for p in (base / "data").glob("*.csv")))`,
        output: `students.csv students .csv data
True True True
['name,marks', 'Asha,91']
['README.md', 'notes.txt', 'students.csv']
['students.csv']`,
      },
      {
        caption: 'Environment variables and directory walking with os',
        code: `import os

os.environ["APP_MODE"] = "development"
print(os.getenv("APP_MODE"), os.getenv("DB_PASSWORD", "not set"))

os.makedirs("walk_demo/a/b", exist_ok=True)
for name in ["walk_demo/top.txt", "walk_demo/a/mid.txt", "walk_demo/a/b/deep.txt"]:
    with open(name, "w") as f:
        f.write("x")

for folder, subfolders, files in sorted(os.walk("walk_demo")):
    print(folder.replace(os.sep, "/"), sorted(subfolders), files)
print(os.path.join("data", "2026", "report.csv").replace(os.sep, "/"))
print(os.path.splitext("photo.jpeg"), os.path.basename("/tmp/a/b.txt"))`,
        output: `development not set
walk_demo ['a'] ['top.txt']
walk_demo/a ['b'] ['mid.txt']
walk_demo/a/b [] ['deep.txt']
data/2026/report.csv
('photo', '.jpeg') b.txt`,
      },
      {
        caption: 'The sys module',
        code: `import sys

print(sys.version_info >= (3, 8), type(sys.argv).__name__)
print(sys.getsizeof([]) < sys.getsizeof([1, 2, 3]))
print("stdout and stderr:", sys.stdout is not None, sys.stderr is not None)
print("errors are written to", sys.stderr.name)

def main():
    if len(sys.argv) > 5:
        sys.exit("too many arguments")
    print("argv ok")
main()`,
        output: `True list
True
stdout and stderr: True True
errors are written to <stderr>
argv ok`,
      },
      {
        caption: 'Copying, moving, archiving and deleting with shutil',
        code: `import shutil
from pathlib import Path

src = Path("shutil_demo/src")
src.mkdir(parents=True, exist_ok=True)
(src / "a.txt").write_text("A")
shutil.copy(src / "a.txt", src / "a_copy.txt")
shutil.copytree(src, "shutil_demo/backup", dirs_exist_ok=True)
shutil.move("shutil_demo/src/a_copy.txt", "shutil_demo/moved.txt")
archive = shutil.make_archive("shutil_demo/backup_zip", "zip", "shutil_demo/backup")
print(sorted(p.name for p in Path("shutil_demo").iterdir()))
print(Path(archive).suffix)
shutil.rmtree("shutil_demo")
print(Path("shutil_demo").exists())`,
        output: `['backup', 'backup_zip.zip', 'moved.txt', 'src']
.zip
False`,
      },
    ],
    commonMistakes: [
      'Building paths with string concatenation and hard-coded "\\\\" or "/" separators.',
      'Hard-coding secrets instead of reading them from environment variables.',
      'Using shutil.rmtree on a path built from user input without checks.',
      'Assuming the current working directory is the script\'s folder; use Path(__file__).parent.',
    ],
    keyPoints: [
      'pathlib.Path: join with /, inspect name/stem/suffix/parent, read/write text, glob files.',
      'os: environment variables, directories, walking trees, system info.',
      'sys: argv, exit, version, platform, path and standard streams.',
      'shutil: copy, copytree, move, rmtree, make_archive.',
    ],
  },

  'command-line-arguments': {
    title: 'Command-Line Arguments in Python',
    intro: `Command-line tools take their input as arguments: <code>python resize.py photo.jpg --width 800 --quality 90</code>. Python exposes raw arguments through <code>sys.argv</code>, and the standard <code>argparse</code> module turns them into a professional interface with types, defaults, validation, help text and sub-commands — no extra libraries needed.

This lesson covers <code>sys.argv</code>, <code>argparse</code> positional and optional arguments, flags, choices, multiple values and sub-commands, and mentions popular third-party alternatives.`,
    sections: [
      {
        heading: 'sys.argv',
        body: `<code>sys.argv</code> is a list of strings: <code>argv[0]</code> is the script name and the rest are the arguments as typed. It is fine for tiny scripts, but you must convert types, check counts and write help messages yourself.`,
      },
      {
        heading: 'argparse Basics',
        body: `Create an <code>ArgumentParser</code>, declare arguments with <code>add_argument</code>, and call <code>parse_args()</code>. Positional arguments are required and ordered; optional ones start with <code>--</code> (and can have short forms like <code>-w</code>). Options include <code>type=int</code>, <code>default</code>, <code>required=True</code>, <code>choices=[...]</code>, <code>nargs="+"</code> for several values, and <code>action="store_true"</code> for flags. <code>--help</code> is generated automatically, and invalid input produces a clear error with exit code 2.`,
      },
      {
        heading: 'Sub-commands and Alternatives',
        body: `<code>add_subparsers()</code> creates git-style commands (<code>tool add</code>, <code>tool list</code>). For larger CLIs, third-party libraries such as <strong>Typer</strong> (built on type hints, by the creator of FastAPI) and <strong>Click</strong> offer decorators and richer features.`,
      },
    ],
    examples: [
      {
        caption: 'Reading raw arguments with sys.argv',
        code: `# greet.py
import sys

if len(sys.argv) < 2:
    print("usage: python greet.py NAME [TIMES]")
    sys.exit(1)

name = sys.argv[1]
times = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for _ in range(times):
    print(f"Hello, {name}!")

# $ python greet.py Asha 2`,
        output: `Hello, Asha!
Hello, Asha!`,
        runnable: false,
      },
      {
        caption: 'A complete argparse interface (parsing a sample argument list)',
        code: `import argparse

parser = argparse.ArgumentParser(description="Resize images for the website.")
parser.add_argument("files", nargs="+", help="image files to resize")
parser.add_argument("-w", "--width", type=int, default=800, help="target width in pixels")
parser.add_argument("--format", choices=["jpg", "png", "webp"], default="webp")
parser.add_argument("-v", "--verbose", action="store_true", help="print details")

# In a real script: args = parser.parse_args()  (reads sys.argv)
args = parser.parse_args(["a.jpg", "b.png", "--width", "1200", "-v"])
print(args)
print(args.files, args.width + 100, args.format, args.verbose)

try:
    parser.parse_args(["a.jpg", "--format", "gif"])
except SystemExit as e:
    print("exit code:", e.code)`,
        output: `Namespace(files=['a.jpg', 'b.png'], width=1200, format='webp', verbose=True)
['a.jpg', 'b.png'] 1300 webp True
usage: main.py [-h] [-w WIDTH] [--format {jpg,png,webp}] [-v] files [files ...]
main.py: error: argument --format: invalid choice: 'gif' (choose from jpg, png, webp)
exit code: 2`,
        runnable: false,
      },
      {
        caption: 'Sub-commands like git',
        code: `import argparse

parser = argparse.ArgumentParser(prog="todo")
sub = parser.add_subparsers(dest="command", required=True)

add = sub.add_parser("add", help="add a task")
add.add_argument("title")
add.add_argument("--priority", type=int, default=2)

sub.add_parser("list", help="list tasks")

for argv in (["add", "Learn argparse", "--priority", "1"], ["list"]):
    args = parser.parse_args(argv)
    if args.command == "add":
        print(f"added {args.title!r} with priority {args.priority}")
    elif args.command == "list":
        print("listing tasks...")`,
        output: `added 'Learn argparse' with priority 1
listing tasks...`,
      },
    ],
    commonMistakes: [
      'Indexing sys.argv without checking its length (IndexError).',
      'Forgetting that every sys.argv value is a string.',
      'Writing custom help and validation that argparse provides for free.',
      'Using positional arguments for optional settings instead of --options.',
    ],
    keyPoints: [
      'sys.argv is a list of strings; argv[0] is the script name.',
      'argparse adds types, defaults, choices, flags, nargs and automatic --help.',
      'Invalid arguments exit with code 2 and a helpful message.',
      'Sub-parsers create multi-command tools; Typer and Click are popular alternatives.',
    ],
  },

  'pip-and-dependency-management': {
    title: 'pip and Dependency Management',
    intro: `Most real Python projects depend on third-party packages from PyPI — requests, pandas, FastAPI, SQLAlchemy. Installing them correctly, keeping versions reproducible across machines, and isolating each project's dependencies are essential professional skills.

This lesson covers pip commands, requirements files, version specifiers, <code>pyproject.toml</code>, and modern tools such as <strong>uv</strong> and Poetry, building on the virtual environments lesson.`,
    sections: [
      {
        heading: 'pip Basics',
        body: `Always run pip as <code>python -m pip</code> so it installs into the interpreter you are using, and always inside an activated virtual environment. Key commands: <code>install</code>, <code>install --upgrade</code>, <code>uninstall</code>, <code>list</code>, <code>show</code>, <code>freeze</code>, and <code>install -r requirements.txt</code>.`,
      },
      {
        heading: 'Versions and Requirements Files',
        body: `Version specifiers: <code>==2.32.3</code> (exact), <code>&gt;=2.30</code>, <code>~=2.32</code> (compatible release: at least 2.32, below 3.0), <code>&lt;3</code>. A <code>requirements.txt</code> lists dependencies one per line. Applications should pin exact versions (a "lock") so every deployment gets identical packages; libraries should declare looser ranges.`,
      },
      {
        heading: 'pyproject.toml',
        body: `<code>pyproject.toml</code> is the standard project configuration file: project name, version, Python requirement, dependencies, optional groups (dev, test) and tool settings (Ruff, pytest, mypy). Tools like uv, Poetry, Hatch and pip itself understand it.`,
      },
      {
        heading: 'uv and Poetry',
        body: `<strong>uv</strong> (by Astral) is a very fast, all-in-one tool: it installs Python versions, creates virtual environments, adds dependencies to <code>pyproject.toml</code>, writes a lock file (<code>uv.lock</code>) and runs commands — <code>uv init</code>, <code>uv add fastapi</code>, <code>uv run app.py</code>. <strong>Poetry</strong> offers a similar workflow. Either is a big improvement over manual pip + requirements files for team projects.`,
      },
    ],
    examples: [
      {
        caption: 'Everyday pip commands (inside an activated virtual environment)',
        code: `python -m pip install requests
python -m pip install "fastapi[standard]==0.118.0"
python -m pip install --upgrade requests
python -m pip show requests
python -m pip list --outdated
python -m pip uninstall requests
python -m pip freeze > requirements.txt
python -m pip install -r requirements.txt`,
        output: `Successfully installed requests-2.32.x certifi-... charset-normalizer-... idna-... urllib3-...
Name: requests
Version: 2.32.x
Summary: Python HTTP for Humans.
Requires: certifi, charset-normalizer, idna, urllib3`,
        runnable: false,
      },
      {
        caption: 'A requirements file and a pyproject.toml',
        code: `# requirements.txt (application: pinned versions)
fastapi==0.118.0
uvicorn==0.37.0
sqlalchemy==2.0.43
python-dotenv==1.1.1

# pyproject.toml
[project]
name = "webnest-api"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi[standard]>=0.115",
    "sqlalchemy~=2.0",
]

[dependency-groups]
dev = ["pytest>=8", "ruff>=0.6"]

[tool.ruff]
line-length = 100`,
        output: '(Pin exact versions for deployable apps; declare ranges in libraries.)',
        runnable: false,
      },
      {
        caption: 'A modern workflow with uv',
        code: `# install uv once: https://docs.astral.sh/uv/  (e.g. pip install uv)
uv init webnest-api
cd webnest-api
uv add "fastapi[standard]" sqlalchemy
uv add --dev pytest ruff
uv run fastapi dev main.py        # runs inside the project's managed .venv
uv lock                           # writes uv.lock with exact versions
uv sync                           # recreate the exact environment on another machine`,
        output: `Initialized project webnest-api
Resolved 38 packages in 412ms
Installed 38 packages in 96ms`,
        runnable: false,
      },
      {
        caption: 'Checking installed package versions from code',
        code: `from importlib.metadata import version, PackageNotFoundError

for package in ["pip", "surely-not-installed-package"]:
    try:
        print(package, "->", "installed" if version(package) else "?")
    except PackageNotFoundError:
        print(package, "-> not installed")`,
        output: `pip -> installed
surely-not-installed-package -> not installed`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Installing packages globally instead of in a virtual environment.',
      'Running pip from a different Python than the project uses; use python -m pip.',
      'Deploying with unpinned dependencies, so a new release breaks production.',
      'Committing the .venv folder to Git instead of requirements/lock files.',
    ],
    keyPoints: [
      'Use python -m pip inside a virtual environment.',
      'Version specifiers: ==, >=, ~=, <; pin exact versions for applications.',
      'requirements.txt lists dependencies; pyproject.toml is the modern project file.',
      'uv (and Poetry) manage environments, dependencies and lock files in one tool.',
    ],
  },

  'handling-multiple-exceptions-and-finally': {
    title: 'Handling Multiple Exceptions, else and finally',
    intro: `Real code can fail in several ways at once: a file might be missing, contain invalid numbers, or the network might time out. Python's <code>try</code> statement lets you handle each error type differently, run code only when nothing failed (<code>else</code>), and always run cleanup (<code>finally</code>). Python 3.11 also added exception groups for handling several errors raised together.

This lesson covers catching multiple exceptions, the order of <code>except</code> blocks, exception hierarchies, <code>else</code>, <code>finally</code>, and <code>except*</code> with <code>ExceptionGroup</code>.`,
    sections: [
      {
        heading: 'Several except Blocks',
        body: `A <code>try</code> can have many <code>except</code> clauses; Python uses the <strong>first</strong> one whose type matches (including subclasses). Put specific exceptions before general ones — <code>FileNotFoundError</code> before <code>OSError</code>, and a broad <code>Exception</code> (if any) last. Bind the exception with <code>as e</code> to inspect its message.`,
      },
      {
        heading: 'Catching Several Types in One Clause',
        body: `Use a tuple to handle different exceptions the same way: <code>except (ValueError, TypeError) as e:</code>. Avoid bare <code>except:</code>, which also catches <code>KeyboardInterrupt</code> and <code>SystemExit</code>.`,
      },
      {
        heading: 'else and finally',
        body: `The <code>else</code> block runs only if the <code>try</code> block raised nothing — put code there that should run on success but whose own errors you do not want caught by the <code>except</code> clauses. The <code>finally</code> block always runs: after success, after a handled error, after an unhandled error, and even after <code>return</code> — ideal for releasing resources (though <code>with</code> is usually cleaner).`,
      },
      {
        heading: 'Exception Groups and except*',
        body: `When several independent tasks fail at once (for example in <code>asyncio.TaskGroup</code>), Python raises an <code>ExceptionGroup</code>. <code>except* ValueError</code> handles all <code>ValueError</code>s in the group while letting other types continue to other <code>except*</code> clauses.`,
      },
    ],
    examples: [
      {
        caption: 'Different handling for different errors',
        code: `def average_from(values, divisor_text):
    try:
        numbers = [int(v) for v in values]
        divisor = int(divisor_text)
        return sum(numbers) / divisor
    except ZeroDivisionError:
        return "cannot divide by zero"
    except ValueError as e:
        return f"bad number: {e}"
    except TypeError:
        return "values must be a list of strings"

print(average_from(["10", "20"], "2"))
print(average_from(["10", "20"], "0"))
print(average_from(["10", "x"], "2"))
print(average_from(None, "2"))`,
        output: `15.0
cannot divide by zero
bad number: invalid literal for int() with base 10: 'x'
values must be a list of strings`,
      },
      {
        caption: 'One clause for several types, and why order matters',
        code: `def parse(value):
    try:
        return int(value)
    except (ValueError, TypeError) as e:
        return f"{type(e).__name__}: cannot parse {value!r}"

print(parse("7"), "|", parse("seven"), "|", parse(None))

def read_config(path):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:            # specific first
        return "config missing, using defaults"
    except OSError as e:                 # more general afterwards
        return f"OS error: {e}"

print(read_config("does_not_exist.ini"))
print(issubclass(FileNotFoundError, OSError))`,
        output: `7 | ValueError: cannot parse 'seven' | TypeError: cannot parse None
config missing, using defaults
True`,
      },
      {
        caption: 'try / except / else / finally flow',
        code: `def divide(a, b):
    print(f"-- divide({a}, {b})")
    try:
        result = a / b
    except ZeroDivisionError:
        print("except: division by zero")
        return None
    else:
        print("else: success, result =", result)
        return result
    finally:
        print("finally: always runs")

divide(10, 2)
divide(1, 0)`,
        output: `-- divide(10, 2)
else: success, result = 5.0
finally: always runs
-- divide(1, 0)
except: division by zero
finally: always runs`,
      },
      {
        caption: 'ExceptionGroup and except*',
        code: `def validate(order):
    errors = []
    if order.get("qty", 0) <= 0:
        errors.append(ValueError("quantity must be positive"))
    if "@" not in order.get("email", ""):
        errors.append(ValueError("invalid email"))
    if not isinstance(order.get("price"), (int, float)):
        errors.append(TypeError("price must be a number"))
    if errors:
        raise ExceptionGroup("order is invalid", errors)

try:
    validate({"qty": 0, "email": "asha", "price": "free"})
except* ValueError as group:
    for e in group.exceptions:
        print("value problem:", e)
except* TypeError as group:
    for e in group.exceptions:
        print("type problem:", e)`,
        output: `value problem: quantity must be positive
value problem: invalid email
type problem: price must be a number`,
      },
    ],
    commonMistakes: [
      'Catching Exception first, so specific handlers below it never run.',
      'Using bare except:, which also swallows KeyboardInterrupt and SystemExit.',
      'Putting too much code inside try, catching errors you did not intend to handle — use else.',
      'Returning from finally, which silently discards exceptions.',
    ],
    keyPoints: [
      'Python runs the first matching except clause; order from specific to general.',
      'Catch several types with a tuple: except (A, B) as e.',
      'else runs only on success; finally always runs.',
      'ExceptionGroup + except* handle multiple simultaneous errors (3.11+).',
    ],
  },

  'raising-and-custom-exceptions': {
    title: 'Raising Exceptions and Custom Exceptions',
    intro: `Handling errors is half the story; the other half is <strong>signalling</strong> them clearly. When a function receives invalid input or cannot do its job, it should raise an exception with a precise type and a helpful message, rather than returning <code>None</code> or <code>-1</code> that callers might ignore.

This lesson covers the <code>raise</code> statement, re-raising, exception chaining with <code>raise ... from</code>, designing custom exception hierarchies for your application, adding data to exceptions, and notes with <code>add_note()</code>.`,
    sections: [
      {
        heading: 'raise',
        body: `<code>raise ValueError("age must be positive")</code> stops the function and sends the exception up the call stack until something handles it. Choose the most fitting built-in type: <code>ValueError</code> (right type, bad value), <code>TypeError</code> (wrong type), <code>KeyError</code>, <code>LookupError</code>, <code>PermissionError</code>, <code>NotImplementedError</code>, <code>RuntimeError</code>. A bare <code>raise</code> inside an <code>except</code> block re-raises the current exception after, for example, logging it.`,
      },
      {
        heading: 'Exception Chaining',
        body: `When you catch a low-level error and raise a higher-level one, write <code>raise NewError(...) from original</code>. The traceback then shows both, with "The above exception was the direct cause of the following exception". Use <code>from None</code> to hide an irrelevant original error.`,
      },
      {
        heading: 'Custom Exceptions',
        body: `Define your own exceptions by subclassing <code>Exception</code>. A good pattern is one base class for your application (<code>ShopError</code>) with specific subclasses (<code>OutOfStockError</code>, <code>PaymentDeclinedError</code>). Callers can then catch a specific error or all errors from your code at once. Custom exceptions can carry extra attributes such as an order id or an error code for API responses.`,
      },
      {
        heading: 'Adding Context with add_note()',
        body: `Since Python 3.11, <code>exception.add_note("...")</code> attaches extra context that appears in the traceback — useful when re-raising errors while processing a particular file or record.`,
      },
    ],
    examples: [
      {
        caption: 'Raising built-in exceptions with clear messages',
        code: `def set_age(age):
    if not isinstance(age, int):
        raise TypeError(f"age must be an int, got {type(age).__name__}")
    if not 0 <= age <= 130:
        raise ValueError(f"age must be between 0 and 130, got {age}")
    return age

for value in [25, -3, "25"]:
    try:
        print("ok:", set_age(value))
    except (TypeError, ValueError) as e:
        print(f"{type(e).__name__}: {e}")`,
        output: `ok: 25
ValueError: age must be between 0 and 130, got -3
TypeError: age must be an int, got str`,
      },
      {
        caption: 'Re-raising and exception chaining with from',
        code: `import json

class ConfigError(Exception):
    pass

def load_config(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ConfigError("config file is not valid JSON") from e

try:
    load_config("{bad json")
except ConfigError as e:
    print("error:", e)
    print("caused by:", type(e.__cause__).__name__, "-", e.__cause__.msg)

def risky():
    try:
        1 / 0
    except ZeroDivisionError:
        print("logging the problem, then re-raising")
        raise

try:
    risky()
except ZeroDivisionError as e:
    print("caller received:", e)`,
        output: `error: config file is not valid JSON
caused by: JSONDecodeError - Expecting property name enclosed in double quotes
logging the problem, then re-raising
caller received: division by zero`,
      },
      {
        caption: 'A custom exception hierarchy with extra data',
        code: `class ShopError(Exception):
    """Base class for all shop errors."""

class OutOfStockError(ShopError):
    def __init__(self, item, requested, available):
        super().__init__(f"only {available} {item}(s) left, {requested} requested")
        self.item, self.requested, self.available = item, requested, available

class PaymentDeclinedError(ShopError):
    def __init__(self, reason, code="CARD_DECLINED"):
        super().__init__(reason)
        self.code = code

stock = {"hoodie": 2}

def buy(item, qty, card_ok=True):
    if stock.get(item, 0) < qty:
        raise OutOfStockError(item, qty, stock.get(item, 0))
    if not card_ok:
        raise PaymentDeclinedError("insufficient balance")
    stock[item] -= qty
    return "order placed"

for args in [("hoodie", 1), ("hoodie", 5), ("hoodie", 1, False)]:
    try:
        print(buy(*args))
    except OutOfStockError as e:
        print("stock:", e, "| available =", e.available)
    except ShopError as e:
        print(f"shop error [{getattr(e, 'code', '-')}]:", e)`,
        output: `order placed
stock: only 1 hoodie(s) left, 5 requested | available = 1
shop error [CARD_DECLINED]: insufficient balance`,
      },
      {
        caption: 'Adding context with add_note()',
        code: `rows = ["10", "20", "abc", "40"]
try:
    for line_no, row in enumerate(rows, start=1):
        try:
            int(row)
        except ValueError as e:
            e.add_note(f"while processing line {line_no} of marks.csv")
            raise
except ValueError as e:
    print(e)
    print(e.__notes__)`,
        output: `invalid literal for int() with base 10: 'abc'
['while processing line 3 of marks.csv']`,
      },
    ],
    commonMistakes: [
      'Returning None or -1 for errors instead of raising, so failures go unnoticed.',
      'Raising the generic Exception instead of a specific type.',
      'Raising a new exception inside except without "from", losing or confusing the original cause.',
      'Deriving custom exceptions from BaseException instead of Exception.',
    ],
    keyPoints: [
      'raise SpecificError("clear message") signals problems precisely.',
      'A bare raise re-raises the current exception.',
      'raise New(...) from original chains exceptions and keeps the cause.',
      'Build custom exception hierarchies from Exception, with extra attributes when useful.',
      'add_note() attaches extra context (3.11+).',
    ],
  },

  'built-in-exceptions-reference': {
    title: 'Python Built-in Exceptions Reference',
    intro: `Python raises specific built-in exceptions for different problems, organised in a class hierarchy under <code>BaseException</code>. Recognising them quickly — and knowing which one to catch or raise — makes debugging faster and error handling more precise.

This reference lists the exceptions you will meet most often, explains what causes each one, and shows code that triggers and handles them.`,
    sections: [
      {
        heading: 'The Hierarchy',
        body: `<code>BaseException</code> is the root. Directly under it are <code>SystemExit</code>, <code>KeyboardInterrupt</code> and <code>GeneratorExit</code>, which normal code should not catch. Everything else derives from <code>Exception</code>, grouped into families such as <code>ArithmeticError</code> (<code>ZeroDivisionError</code>, <code>OverflowError</code>), <code>LookupError</code> (<code>IndexError</code>, <code>KeyError</code>) and <code>OSError</code> (<code>FileNotFoundError</code>, <code>PermissionError</code>, <code>TimeoutError</code>, <code>ConnectionError</code>...). Catching a family catches all its members.`,
      },
      {
        heading: 'Most Common Exceptions',
        body: `The ones you will see daily:`,
        list: [
          '<code>SyntaxError</code> / <code>IndentationError</code> — code cannot be parsed.',
          '<code>NameError</code> — a name is not defined (typo or missing import).',
          '<code>TypeError</code> — operation on the wrong type, or wrong number of arguments.',
          '<code>ValueError</code> — right type, invalid value (<code>int("abc")</code>).',
          '<code>AttributeError</code> — object has no such attribute or method.',
          '<code>IndexError</code> — sequence index out of range; <code>KeyError</code> — missing dict key.',
          '<code>ZeroDivisionError</code>, <code>OverflowError</code> — arithmetic problems.',
          '<code>FileNotFoundError</code>, <code>PermissionError</code>, <code>IsADirectoryError</code> — file system problems.',
          '<code>ImportError</code> / <code>ModuleNotFoundError</code> — import failures.',
          '<code>StopIteration</code> — iterator exhausted; <code>RecursionError</code> — too deep recursion.',
          '<code>AssertionError</code>, <code>NotImplementedError</code>, <code>RuntimeError</code>, <code>MemoryError</code>, <code>UnicodeDecodeError</code>.',
        ],
      },
      {
        heading: 'Reading Tracebacks',
        body: `Read a traceback from the <strong>bottom up</strong>: the last line shows the exception type and message; the lines above show the chain of calls, with the most recent call last. Modern Python versions underline the exact failing expression and suggest fixes such as "Did you mean: 'append'?".`,
      },
    ],
    examples: [
      {
        caption: 'Triggering and naming common exceptions',
        code: `import math

tests = [
    lambda: undefined_variable,
    lambda: "5" + 5,
    lambda: int("abc"),
    lambda: [1, 2, 3][10],
    lambda: {"a": 1}["b"],
    lambda: 10 / 0,
    lambda: "text".push("x"),
    lambda: open("missing_file.txt"),
    lambda: __import__("not_a_real_module"),
    lambda: next(iter([])),
    lambda: math.exp(1000),
    lambda: b"\\xff".decode("utf-8"),
]
for test in tests:
    try:
        test()
    except Exception as e:
        # OSError numbers differ between platforms, so show only the message
        message = f"{e.strerror}: {e.filename!r}" if isinstance(e, OSError) else e
        print(f"{type(e).__name__:<20} {message}")`,
        output: `NameError            name 'undefined_variable' is not defined
TypeError            can only concatenate str (not "int") to str
ValueError           invalid literal for int() with base 10: 'abc'
IndexError           list index out of range
KeyError             'b'
ZeroDivisionError    division by zero
AttributeError       'str' object has no attribute 'push'
FileNotFoundError    No such file or directory: 'missing_file.txt'
ModuleNotFoundError  No module named 'not_a_real_module'
StopIteration
OverflowError        math range error
UnicodeDecodeError   'utf-8' codec can't decode byte 0xff in position 0: invalid start byte`,
      },
      {
        caption: 'Catching exception families and inspecting the hierarchy',
        code: `def safe_get(container, key):
    try:
        return container[key]
    except LookupError as e:              # covers IndexError and KeyError
        return f"missing ({type(e).__name__})"

print(safe_get([1, 2], 5), safe_get({"a": 1}, "z"), safe_get("abc", 1))

for exc in (IndexError, KeyError, FileNotFoundError, ZeroDivisionError, KeyboardInterrupt):
    print(exc.__name__, "->", " > ".join(c.__name__ for c in exc.__mro__[1:-1]))`,
        output: `missing (IndexError) missing (KeyError) b
IndexError -> LookupError > Exception > BaseException
KeyError -> LookupError > Exception > BaseException
FileNotFoundError -> OSError > Exception > BaseException
ZeroDivisionError -> ArithmeticError > Exception > BaseException
KeyboardInterrupt -> BaseException`,
      },
      {
        caption: 'Printing a full traceback without crashing',
        code: `import traceback

def level_two():
    return {"user": None}["user"]["name"]

def level_one():
    return level_two()

try:
    level_one()
except TypeError:
    lines = traceback.format_exc().strip().splitlines()
    print(lines[0])
    print(lines[-1])`,
        output: `Traceback (most recent call last):
TypeError: 'NoneType' object is not subscriptable`,
      },
    ],
    commonMistakes: [
      'Catching BaseException or using bare except, which traps Ctrl+C and sys.exit().',
      'Reading tracebacks from the top instead of the last line.',
      'Catching Exception everywhere, hiding the specific type you should handle.',
      'Confusing TypeError (wrong type) with ValueError (right type, bad value).',
    ],
    keyPoints: [
      'All normal exceptions derive from Exception; SystemExit and KeyboardInterrupt do not.',
      'Families: ArithmeticError, LookupError, OSError — catch a family to handle all members.',
      'Know the common ones: NameError, TypeError, ValueError, AttributeError, IndexError, KeyError, FileNotFoundError...',
      'Read tracebacks bottom-up; the traceback module formats them in code.',
    ],
  },

  'assertions-and-debugging': {
    title: 'Assertions and Debugging in Python',
    intro: `Bugs are inevitable; finding them quickly is a skill. Python gives you <code>assert</code> statements to check assumptions while developing, a built-in debugger (<code>pdb</code>, started with <code>breakpoint()</code>), IDE debuggers with breakpoints and variable inspection, and helpful tools for tracing and timing code.

This lesson covers assertions and their limits, a systematic debugging process, <code>pdb</code> commands, IDE debugging, and quick diagnostic techniques.`,
    sections: [
      {
        heading: 'The assert Statement',
        body: `<code>assert condition, "message"</code> raises <code>AssertionError</code> if the condition is false. Use it for internal invariants that should never be false if the code is correct ("the discount is never above 100%") and in tests (pytest uses plain <code>assert</code>). Do <strong>not</strong> use assert to validate user input or enforce security: Python removes all asserts when run with <code>-O</code> (optimised mode).`,
      },
      {
        heading: 'A Debugging Process',
        body: `Reproduce the bug reliably with the smallest input; read the full traceback; form a hypothesis; inspect actual values (print, logging or debugger) to confirm or reject it; fix the cause, not the symptom; then add a test so the bug never returns. Explaining the code to someone else (or a rubber duck) is surprisingly effective.`,
      },
      {
        heading: 'pdb and breakpoint()',
        body: `Call <code>breakpoint()</code> anywhere to pause and open the interactive debugger. Useful commands: <code>n</code> (next line), <code>s</code> (step into), <code>c</code> (continue), <code>l</code> (list code), <code>p expr</code> (print), <code>pp</code> (pretty print), <code>w</code> (where — stack trace), <code>u</code>/<code>d</code> (move up/down the stack), <code>b line</code> (set breakpoint), <code>q</code> (quit). <code>python -m pdb script.py</code> starts a script under the debugger.`,
      },
      {
        heading: 'IDE Debuggers and Quick Tools',
        body: `VS Code and PyCharm offer visual breakpoints, conditional breakpoints, watch expressions and step-through execution. For quick checks, <code>print(f"{value=}")</code> shows a variable with its name, <code>pprint</code> formats nested data, <code>traceback.print_exc()</code> prints the current exception, and <code>time.perf_counter()</code> measures slow sections.`,
      },
    ],
    examples: [
      {
        caption: 'Assertions for internal invariants',
        code: `def apply_discount(price, percent):
    assert 0 <= percent <= 100, f"invalid discount {percent}%"
    discounted = price * (100 - percent) / 100
    assert 0 <= discounted <= price, "discount produced an impossible price"
    return discounted

print(apply_discount(1000, 20))
try:
    apply_discount(1000, 150)
except AssertionError as e:
    print("AssertionError:", e)`,
        output: `800.0
AssertionError: invalid discount 150%`,
      },
      {
        caption: 'Finding a bug by inspecting values',
        code: `from pprint import pprint

def average_marks(students):
    total = 0
    for s in students:
        total += s["marks"]
    print(f"{total=} {len(students)=}")          # quick inspection
    return total / len(students)

students = [{"name": "Asha", "marks": 90}, {"name": "Ravi", "marks": 70}]
print(average_marks(students))

data = {"course": "Python", "students": students, "tags": ["beginner", "backend"]}
pprint(data, width=60)`,
        output: `total=160 len(students)=2
80.0
{'course': 'Python',
 'students': [{'marks': 90, 'name': 'Asha'},
              {'marks': 70, 'name': 'Ravi'}],
 'tags': ['beginner', 'backend']}`,
      },
      {
        caption: 'Using the pdb debugger',
        code: `def calculate_total(items):
    total = 0
    for price, qty in items:
        breakpoint()            # execution pauses here
        total += price * qty
    return total

calculate_total([(100, 2), (50, 3)])

# In the (Pdb) prompt:
# (Pdb) p price, qty         -> (100, 2)
# (Pdb) p total              -> 0
# (Pdb) n                    -> runs the next line
# (Pdb) p total              -> 200
# (Pdb) c                    -> continue to the next breakpoint
# (Pdb) q                    -> quit`,
        output: `> main.py(5)calculate_total()
-> total += price * qty
(Pdb) p price, qty
(100, 2)`,
        runnable: false,
      },
      {
        caption: 'Timing a slow section',
        code: `import time

start = time.perf_counter()
squares = [n * n for n in range(1_000_000)]
elapsed = time.perf_counter() - start
print(len(squares), "squares computed in under a second:", elapsed < 1)`,
        output: `1000000 squares computed in under a second: True`,
      },
    ],
    commonMistakes: [
      'Using assert to validate user input or permissions — asserts disappear with python -O.',
      'Writing assert (condition, "message") with parentheses — a non-empty tuple is always true.',
      'Changing code randomly until the bug disappears instead of confirming the cause.',
      'Leaving breakpoint() or debug prints in committed code.',
    ],
    keyPoints: [
      'assert checks internal assumptions during development and in tests, not user input.',
      'Debug systematically: reproduce, read the traceback, hypothesise, inspect, fix, test.',
      'breakpoint() opens pdb: n, s, c, p, l, w, q.',
      'IDE debuggers, f"{x=}", pprint and perf_counter speed up diagnosis.',
    ],
  },

  logging: {
    title: 'Logging in Python',
    intro: `<code>print()</code> is fine while learning, but real applications need logs that have timestamps and severity levels, can be switched on and off per module, go to files or monitoring systems, and never crash the program. Python's built-in <code>logging</code> module provides all of this and is used by virtually every framework, including FastAPI, Django and Flask.

This lesson covers log levels, basic configuration, named loggers, formatting, handlers for files and rotation, logging exceptions, structured JSON logs, and configuration with <code>dictConfig</code>.`,
    sections: [
      {
        heading: 'Log Levels',
        body: `Five standard levels in increasing severity: <code>DEBUG</code> (detailed diagnostics), <code>INFO</code> (normal events: "order placed"), <code>WARNING</code> (unexpected but handled: "retrying payment"), <code>ERROR</code> (an operation failed) and <code>CRITICAL</code> (the application cannot continue). A logger only outputs messages at or above its configured level; the default is WARNING.`,
      },
      {
        heading: 'Loggers, Handlers and Formatters',
        body: `Create a logger per module with <code>logging.getLogger(__name__)</code>; names form a hierarchy (<code>shop.payments</code> is a child of <code>shop</code>), so you can tune levels per package. <strong>Handlers</strong> decide where records go (<code>StreamHandler</code> for the console, <code>FileHandler</code>, <code>RotatingFileHandler</code>, <code>TimedRotatingFileHandler</code>), and <strong>formatters</strong> decide how they look (<code>%(asctime)s %(levelname)s %(name)s %(message)s</code>).`,
      },
      {
        heading: 'Good Logging Practice',
        body: `Configure logging once, at the application's entry point, never in library modules. Pass values as arguments (<code>log.info("user %s logged in", user)</code>) so formatting only happens when the message is emitted. Use <code>log.exception()</code> inside <code>except</code> blocks to include the traceback. Never log passwords, tokens or full card numbers. In production, JSON (structured) logs are easier to search in tools like Elasticsearch, Loki or CloudWatch.`,
      },
    ],
    examples: [
      {
        caption: 'Levels and basic configuration',
        code: `import logging
import sys

logging.basicConfig(level=logging.INFO, stream=sys.stdout,
                    format="%(levelname)-8s %(name)s: %(message)s",
                    force=True)   # replace handlers left over from an earlier run
log = logging.getLogger("shop")

log.debug("cart contents: %s", ["pen"])      # below INFO: not shown
log.info("order %s placed by %s", "WN-101", "asha")
log.warning("payment slow, retrying (attempt %d)", 2)
log.error("payment failed for order %s", "WN-102")
log.critical("database unreachable")`,
        output: `INFO     shop: order WN-101 placed by asha
WARNING  shop: payment slow, retrying (attempt 2)
ERROR    shop: payment failed for order WN-102
CRITICAL shop: database unreachable`,
      },
      {
        caption: 'Named loggers, per-module levels and logging exceptions',
        code: `import logging
import sys

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("[%(levelname)s] %(name)s - %(message)s"))
root = logging.getLogger()
root.addHandler(handler)
root.setLevel(logging.WARNING)

logging.getLogger("shop.payments").setLevel(logging.DEBUG)   # verbose for one package

logging.getLogger("shop.catalog").info("catalog loaded")      # suppressed (WARNING level)
pay_log = logging.getLogger("shop.payments")
pay_log.debug("calling gateway")

try:
    1 / 0
except ZeroDivisionError:
    pay_log.exception("fee calculation failed")`,
        output: `[DEBUG] shop.payments - calling gateway
[ERROR] shop.payments - fee calculation failed
Traceback (most recent call last):
  File "main.py", line 16, in <module>
    1 / 0
    ~~^~~
ZeroDivisionError: division by zero`,
        runnable: false,
      },
      {
        caption: 'Rotating log files and dictConfig',
        code: `import logging
import logging.config

logging.config.dictConfig({
    "version": 1,
    "formatters": {
        "detailed": {"format": "%(asctime)s %(levelname)s %(name)s: %(message)s"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "detailed", "level": "INFO"},
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "app.log",
            "maxBytes": 1_000_000,       # rotate at ~1 MB
            "backupCount": 5,            # keep app.log.1 ... app.log.5
            "formatter": "detailed",
            "level": "DEBUG",
        },
    },
    "root": {"handlers": ["console", "file"], "level": "DEBUG"},
})

log = logging.getLogger("webnest")
log.info("application started")
log.debug("this detail goes only to app.log")`,
        output: `2026-09-27 10:15:02,118 INFO webnest: application started
(app.log contains both the INFO and the DEBUG line)`,
        runnable: false,
      },
      {
        caption: 'Structured JSON logs with a custom formatter',
        code: `import json
import logging
import sys

class JsonFormatter(logging.Formatter):
    def format(self, record):
        entry = {"level": record.levelname, "logger": record.name, "message": record.getMessage()}
        entry.update(getattr(record, "context", {}))
        return json.dumps(entry)

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JsonFormatter())
log = logging.getLogger("api")
log.handlers.clear()          # avoid duplicate lines if this code runs twice
log.addHandler(handler)
log.setLevel(logging.INFO)
log.propagate = False

log.info("order placed", extra={"context": {"order_id": "WN-101", "amount": 2999}})`,
        output: `{"level": "INFO", "logger": "api", "message": "order placed", "order_id": "WN-101", "amount": 2999}`,
      },
    ],
    commonMistakes: [
      'Using print() for diagnostics in applications instead of logging.',
      'Calling logging.basicConfig inside library modules.',
      'Formatting messages with f-strings in hot paths; pass arguments instead.',
      'Logging secrets or personal data.',
      'Catching exceptions and logging only str(e), losing the traceback — use log.exception().',
    ],
    keyPoints: [
      'Levels: DEBUG < INFO < WARNING < ERROR < CRITICAL; default level is WARNING.',
      'Use logging.getLogger(__name__) per module; configure once at startup.',
      'Handlers send records to console/files (with rotation); formatters shape output.',
      'log.exception() records tracebacks; JSON formatters give structured logs.',
      'dictConfig centralises logging configuration.',
    ],
  },

  'csv-files': {
    title: 'Reading and Writing CSV Files in Python',
    intro: `CSV (comma-separated values) is the universal exchange format for tabular data: exports from Excel and Google Sheets, bank statements, database dumps, reports. Python's built-in <code>csv</code> module reads and writes CSV correctly — handling quoted fields, commas inside values, and different delimiters — which naive <code>split(",")</code> code gets wrong.

This lesson covers <code>csv.reader</code> and <code>csv.writer</code>, the dictionary-based <code>DictReader</code> and <code>DictWriter</code>, delimiters and quoting, encodings for Excel, processing large files, and when to use pandas instead.`,
    sections: [
      {
        heading: 'reader and writer',
        body: `Open the file with <code>newline=""</code> (required by the csv module to handle line endings correctly) and an explicit <code>encoding</code>. <code>csv.reader(f)</code> yields each row as a list of strings; <code>csv.writer(f)</code> writes rows with <code>writerow()</code> and <code>writerows()</code>, quoting values that contain commas or quotes automatically. Remember that all values come back as strings — convert numbers yourself.`,
      },
      {
        heading: 'DictReader and DictWriter',
        body: `<code>DictReader</code> uses the header row as keys, giving you <code>row["email"]</code> instead of <code>row[2]</code> — robust against column reordering. <code>DictWriter(f, fieldnames=[...])</code> writes dictionaries; call <code>writeheader()</code> first. <code>extrasaction="ignore"</code> skips dict keys that are not columns.`,
      },
      {
        heading: 'Dialects, Delimiters and Encodings',
        body: `Use <code>delimiter=";"</code> or <code>"\\t"</code> for semicolon- or tab-separated files, and <code>quoting=csv.QUOTE_ALL</code> or <code>QUOTE_NONNUMERIC</code> to control quoting. Excel on Windows opens UTF-8 CSV files correctly when written with <code>encoding="utf-8-sig"</code> (UTF-8 with a BOM) — important for names and the ₹ symbol.`,
      },
      {
        heading: 'Large Files and pandas',
        body: `The csv module streams row by row, so it handles files larger than memory. For analysis — grouping, filtering, joining — <code>pandas.read_csv()</code> is more convenient (see the pandas lesson).`,
      },
    ],
    examples: [
      {
        caption: 'Writing and reading with csv.writer and csv.reader',
        code: `import csv

rows = [
    ["name", "city", "marks"],
    ["Asha", "Pune", 91],
    ["Ravi Kumar", "New Delhi, India", 72],
    ['Meera "M"', "Mumbai", 88],
]
with open("students.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerows(rows)

print(open("students.csv", encoding="utf-8").read())

with open("students.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)
    for name, city, marks in reader:
        print(f"{name:<12} {city:<18} {int(marks) + 5}")`,
        output: `name,city,marks
Asha,Pune,91
Ravi Kumar,"New Delhi, India",72
"Meera ""M""",Mumbai,88

Asha         Pune               96
Ravi Kumar   New Delhi, India   77
Meera "M"    Mumbai             93`,
      },
      {
        caption: 'DictReader and DictWriter',
        code: `import csv

orders = [
    {"order_id": "WN-1", "customer": "Asha", "amount": 2999, "internal_note": "vip"},
    {"order_id": "WN-2", "customer": "Ravi", "amount": 499, "internal_note": ""},
]
with open("orders.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["order_id", "customer", "amount"], extrasaction="ignore")
    writer.writeheader()
    writer.writerows(orders)

with open("orders.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    print(reader.fieldnames)
    total = 0
    for row in reader:
        total += int(row["amount"])
        print(row["order_id"], row["customer"])
print("total:", total)`,
        output: `['order_id', 'customer', 'amount']
WN-1 Asha
WN-2 Ravi
total: 3498`,
      },
      {
        caption: 'Semicolons, tabs, quoting and Excel-friendly UTF-8',
        code: `import csv

with open("prices_eu.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, delimiter=";", quoting=csv.QUOTE_NONNUMERIC)
    w.writerow(["item", "price"])
    w.writerow(["Kaffee", 3.5])
print(open("prices_eu.csv", encoding="utf-8").read().strip())

with open("report_excel.csv", "w", newline="", encoding="utf-8-sig") as f:
    csv.writer(f).writerow(["Course", "Price"])
with open("report_excel.csv", "rb") as f:
    print(f.read()[:3])

tsv = "name\\tmarks\\nAsha\\t91\\n"
print(list(csv.reader(tsv.splitlines(), delimiter="\\t")))`,
        output: `"item";"price"
"Kaffee";3.5
b'\\xef\\xbb\\xbf'
[['name', 'marks'], ['Asha', '91']]`,
      },
    ],
    commonMistakes: [
      'Splitting lines on "," manually, which breaks on quoted fields containing commas.',
      'Opening files without newline="", producing blank lines between rows on Windows.',
      'Forgetting that every value read from CSV is a string.',
      'Writing UTF-8 without a BOM and seeing garbled characters when opening in Excel.',
    ],
    keyPoints: [
      'Open CSV files with newline="" and an explicit encoding.',
      'csv.reader/writer handle quoting and embedded commas correctly.',
      'DictReader/DictWriter work with column names instead of positions.',
      'Set delimiter and quoting for other formats; utf-8-sig for Excel.',
      'Use pandas.read_csv for analysis-heavy work.',
    ],
  },

  'excel-files': {
    title: 'Reading and Writing Excel Files in Python',
    intro: `Excel workbooks are everywhere in business: sales reports, attendance sheets, price lists, invoices. Python can read and write <code>.xlsx</code> files directly, automating hours of manual spreadsheet work. The <strong>openpyxl</strong> library gives cell-level control — formulas, formatting, multiple sheets, charts — while <strong>pandas</strong> reads and writes whole tables in one line.

This lesson covers creating workbooks, writing and reading cells and rows, formulas and styles, multiple sheets, reading data into Python structures, and using pandas with Excel.`,
    sections: [
      {
        heading: 'Installing the Libraries',
        body: `Install with <code>pip install openpyxl pandas</code>. openpyxl handles the modern <code>.xlsx</code> format; pandas uses openpyxl under the hood for Excel files. (Old <code>.xls</code> files need the <code>xlrd</code> package.)`,
      },
      {
        heading: 'Workbooks, Sheets and Cells with openpyxl',
        body: `<code>Workbook()</code> creates a new workbook and <code>load_workbook(path)</code> opens one. A workbook contains worksheets (<code>wb.active</code>, <code>wb["Sheet name"]</code>, <code>wb.create_sheet()</code>). Access cells as <code>ws["B2"]</code> or <code>ws.cell(row=2, column=2)</code>, append whole rows with <code>ws.append([...])</code>, and iterate with <code>ws.iter_rows(min_row=2, values_only=True)</code>. Cells can hold formulas (<code>"=SUM(C2:C10)"</code>), and <code>load_workbook(path, data_only=True)</code> reads the values Excel last calculated.`,
      },
      {
        heading: 'Formatting',
        body: `<code>openpyxl.styles</code> provides <code>Font</code>, <code>PatternFill</code>, <code>Alignment</code> and <code>Border</code>; <code>cell.number_format</code> sets formats such as <code>"#,##0.00"</code>; <code>ws.column_dimensions["A"].width</code> sets widths; <code>ws.freeze_panes = "A2"</code> freezes the header row.`,
      },
      {
        heading: 'pandas for Whole Tables',
        body: `<code>pd.read_excel("file.xlsx", sheet_name="Sales")</code> loads a sheet into a DataFrame; <code>df.to_excel("out.xlsx", index=False)</code> writes one; <code>pd.ExcelWriter</code> writes several DataFrames to different sheets. Use pandas for analysis and openpyxl for precise formatting.`,
      },
    ],
    examples: [
      {
        caption: 'Creating a formatted Excel report with openpyxl',
        code: `from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
ws = wb.active
ws.title = "Sales"

ws.append(["Product", "Units", "Price", "Revenue"])
data = [("Python course", 120, 2999), ("SQL course", 80, 1999), ("Workbook", 300, 499)]
for row, (product, units, price) in enumerate(data, start=2):
    ws.append([product, units, price, f"=B{row}*C{row}"])
ws.append(["Total", "=SUM(B2:B4)", None, "=SUM(D2:D4)"])

header_fill = PatternFill("solid", fgColor="1F4E78")
for cell in ws[1]:
    cell.font = Font(bold=True, color="FFFFFF")
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center")
for col in ("C", "D"):
    for cell in ws[col][1:]:
        cell.number_format = "#,##0.00"
ws.column_dimensions["A"].width = 18
ws.freeze_panes = "A2"

wb.save("sales_report.xlsx")
print("saved", ws.max_row, "rows x", ws.max_column, "columns")`,
        output: `saved 5 rows x 4 columns`,
        runnable: false,
      },
      {
        caption: 'Reading data from an existing workbook',
        code: `from openpyxl import load_workbook

wb = load_workbook("sales_report.xlsx")
ws = wb["Sales"]
print(wb.sheetnames, ws["A2"].value, ws.cell(row=2, column=2).value)

for product, units, price, revenue in ws.iter_rows(min_row=2, max_row=4, values_only=True):
    print(f"{product:<14} {units:>4} x {price:>5} (formula: {revenue})")

# Add a second sheet and save
summary = wb.create_sheet("Summary")
summary["A1"] = "Best seller"
summary["B1"] = max(ws.iter_rows(min_row=2, max_row=4, values_only=True), key=lambda r: r[1])[0]
wb.save("sales_report.xlsx")
print(wb.sheetnames)`,
        output: `['Sales'] Python course 120
Python course   120 x  2999 (formula: =B2*C2)
SQL course       80 x  1999 (formula: =B3*C3)
Workbook        300 x   499 (formula: =B4*C4)
['Sales', 'Summary']`,
        runnable: false,
      },
      {
        caption: 'Reading and writing Excel with pandas',
        code: `import pandas as pd

df = pd.DataFrame({
    "student": ["Asha", "Ravi", "Meera", "Kiran"],
    "course": ["Python", "Python", "SQL", "SQL"],
    "marks": [91, 72, 88, 65],
})

with pd.ExcelWriter("results.xlsx") as writer:
    df.to_excel(writer, sheet_name="All", index=False)
    df.groupby("course", as_index=False)["marks"].mean().to_excel(writer, sheet_name="Averages", index=False)

sheets = pd.read_excel("results.xlsx", sheet_name=None)     # dict of all sheets
print(list(sheets))
print(sheets["Averages"])`,
        output: `['All', 'Averages']
   course  marks
0  Python   81.5
1     SQL   76.5`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Expecting openpyxl to calculate formulas — it stores them; Excel calculates them when the file is opened.',
      'Reading formula cells without data_only=True and getting "=SUM(...)" instead of values.',
      'Trying to open .xls files with openpyxl (use xlrd or convert to .xlsx).',
      'Keeping the file open in Excel while Python tries to save it (PermissionError on Windows).',
    ],
    keyPoints: [
      'pip install openpyxl pandas to work with .xlsx files.',
      'openpyxl: Workbook/load_workbook, sheets, cells, append, iter_rows, formulas, styles.',
      'Use number formats, column widths and freeze panes for professional reports.',
      'pandas read_excel/to_excel/ExcelWriter handle whole tables and multiple sheets.',
    ],
  },
}
