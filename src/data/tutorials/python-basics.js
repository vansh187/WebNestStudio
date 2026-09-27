// Python course — getting started, variables/types and control flow lessons.
// Keys are slugs matching topics in codelabDefaults.js. Examples without
// `runnable: false` run in Webnest Codelab (Pyodide) and their `output` is the
// exact program output.
export const pythonBasics = {
  'introduction-to-python': {
    title: 'Introduction to Python',
    intro: `Python is a high-level, general-purpose programming language known for its clean, readable syntax. Created by Guido van Rossum and first released in 1991, it has grown into one of the most popular languages in the world — the language of choice for data science, machine learning and AI, web back ends, automation, scripting, and teaching programming.

This lesson explains what Python is, its key features, its advantages and limitations, a short history of its versions, and the kinds of applications people build with it, so you know what you are learning and why it is worth your time.`,
    sections: [
      {
        heading: 'What Is Python?',
        body: `Python is an <strong>interpreted</strong>, <strong>dynamically typed</strong>, <strong>garbage-collected</strong> language that supports several programming styles: procedural, object-oriented and functional. You write source code in <code>.py</code> files; the Python interpreter compiles it to bytecode and executes it line by line, so there is no separate compile step. The reference implementation, CPython, is written in C; others include PyPy (a fast JIT-compiled Python) and MicroPython (for microcontrollers).`,
      },
      {
        heading: 'Key Features',
        body: `The features that make Python stand out:`,
        list: [
          '<strong>Readable syntax</strong> — indentation defines code blocks, so programs look clean and consistent.',
          '<strong>Interpreted and interactive</strong> — run code instantly in the REPL without compiling.',
          '<strong>Dynamically typed</strong> — variables do not need type declarations; optional type hints add safety.',
          '<strong>Batteries included</strong> — a large standard library for files, JSON, dates, networking, testing, and more.',
          '<strong>Huge ecosystem</strong> — over 500,000 packages on PyPI: NumPy, pandas, FastAPI, Django, PyTorch, scikit-learn...',
          '<strong>Cross-platform</strong> — the same code runs on Windows, macOS and Linux.',
          '<strong>Multi-paradigm</strong> — procedural, object-oriented and functional styles all work naturally.',
          '<strong>Free and open source</strong> — maintained by the Python Software Foundation and a large community.',
        ],
      },
      {
        heading: 'Advantages and Limitations',
        body: `Python lets you write working programs with far fewer lines than Java or C++, which makes it fast to learn and fast to develop with. Its libraries cover almost every domain. The trade-offs: pure Python code runs slower than compiled languages (performance-critical parts are usually written in C and wrapped, which is exactly what NumPy does); dynamic typing can hide bugs until runtime; and it is rarely used for mobile apps or browser front ends. For most business, data and automation work, developer speed matters more than raw execution speed.`,
      },
      {
        heading: 'A Short History',
        body: `Guido van Rossum began Python in the late 1980s and named it after the comedy group Monty Python. Python 2.0 (2000) added list comprehensions and garbage collection; <strong>Python 3.0</strong> (2008) cleaned up the language in backward-incompatible ways (for example <code>print</code> became a function). Python 2 reached end of life in 2020. Since then Python releases a new 3.x version every October: 3.10 added <code>match</code> statements, 3.11 and 3.12 brought large speed-ups and better error messages, 3.13 added an experimental free-threaded build and a new REPL, and 3.14 continued those improvements. Always learn and use Python 3.`,
      },
      {
        heading: 'What Is Python Used For?',
        body: `Common application areas:`,
        list: [
          '<strong>Web development and APIs</strong> — FastAPI, Django, Flask.',
          '<strong>Data science and analytics</strong> — NumPy, pandas, Matplotlib, Jupyter.',
          '<strong>Machine learning and AI</strong> — scikit-learn, PyTorch, TensorFlow, LLM applications.',
          '<strong>Automation and scripting</strong> — renaming files, scraping websites, sending reports, DevOps tooling.',
          '<strong>Data apps and dashboards</strong> — Streamlit.',
          '<strong>Desktop GUIs and games</strong> — Tkinter, PyQt, Pygame.',
          '<strong>Testing, security and scientific computing</strong> — pytest, penetration-testing tools, simulations.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Python in a few lines: a word counter',
        code: `text = "python is easy and python is powerful"

counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1

for word, count in sorted(counts.items()):
    print(word, count)`,
        output: `and 1
easy 1
is 2
powerful 1
python 2`,
      },
      {
        caption: 'Checking which Python version is running',
        code: `import sys
import platform

print("Python version:", platform.python_version())
print("Major version:", sys.version_info.major)
print("Is Python 3?", sys.version_info.major == 3)`,
        output: `Python version: 3.12.9
Major version: 3
Is Python 3? True`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Following Python 2 tutorials (print "hello" without parentheses, raw_input) — they do not work in Python 3.',
      'Assuming Python is only for beginners or scripts; it powers large production systems at many major companies.',
      'Expecting pure Python loops to be as fast as C; use libraries like NumPy for heavy numeric work.',
      'Confusing Python the language with Anaconda or Jupyter, which are distributions and tools built around it.',
    ],
    keyPoints: [
      'Python is an interpreted, dynamically typed, multi-paradigm language focused on readability.',
      'It has a large standard library and one of the biggest package ecosystems (PyPI).',
      'Python 3 is the only current version; new 3.x releases arrive every October.',
      'It is used for web back ends, data science, AI, automation, dashboards, GUIs and more.',
      'Its main trade-off is slower raw execution, offset by fast development and C-backed libraries.',
    ],
  },

  'python-ides-and-tools': {
    title: 'Python IDEs and Tools',
    intro: `You can write Python in any text editor, but a good editor or IDE (Integrated Development Environment) makes you far more productive: it highlights errors as you type, completes code, runs and debugs programs, and manages virtual environments.

This lesson compares the most popular tools — VS Code, PyCharm, Jupyter, IDLE, Thonny and online environments — shows how to run Python code in each style (script, REPL, notebook), and recommends a setup for beginners and professionals.`,
    sections: [
      {
        heading: 'Popular Editors and IDEs',
        body: `Each tool suits a different style of work:`,
        list: [
          '<strong>VS Code</strong> — free, lightweight editor; with the Python and Pylance extensions it offers IntelliSense, debugging, testing, Jupyter notebooks and environment selection. The most popular choice today.',
          '<strong>PyCharm</strong> — a full IDE by JetBrains with deep refactoring, database tools and Django/FastAPI support. The free version covers most needs.',
          '<strong>Jupyter Notebook / JupyterLab</strong> — mix code, output, charts and notes in cells; the standard for data analysis and teaching.',
          '<strong>IDLE</strong> — installed with Python; simple but limited.',
          '<strong>Thonny</strong> — a beginner-friendly IDE that shows variables and step-by-step execution.',
          '<strong>Online</strong> — Webnest Codelab, Google Colab (free notebooks with GPUs), Replit.',
        ],
      },
      {
        heading: 'Three Ways to Run Python',
        body: `<strong>Scripts</strong>: save code in <code>app.py</code> and run <code>python app.py</code>. <strong>REPL</strong> (interactive shell): type <code>python</code> and execute lines one by one — great for experiments. <strong>Notebooks</strong>: run cells in Jupyter and keep results next to the code — great for data exploration. Professional projects are scripts and packages; notebooks are for exploration and reporting.`,
      },
      {
        heading: 'Recommended Setup',
        body: `Install Python from python.org (or with a version manager), install VS Code with the Python extension, create a virtual environment per project, and add a formatter/linter such as <strong>Ruff</strong>. Learn a few debugger basics early: breakpoints, stepping, and watching variables will save you hours of <code>print</code> debugging.`,
      },
    ],
    examples: [
      {
        caption: 'Using the interactive REPL',
        code: `$ python
>>> 2 ** 10
1024
>>> name = "Webnest"
>>> name.upper()
'WEBNEST'
>>> help(len)          # built-in help for any object
>>> exit()`,
        output: `(The REPL evaluates each line immediately and prints the value of expressions.)`,
        runnable: false,
      },
      {
        caption: 'A script you can run and debug in any IDE',
        code: `def average(numbers):
    total = sum(numbers)          # set a breakpoint here in VS Code or PyCharm
    return total / len(numbers)

marks = [78, 92, 85]
print("Average:", round(average(marks), 2))`,
        output: `Average: 85.0`,
      },
    ],
    commonMistakes: [
      'Selecting the wrong interpreter in the IDE, so installed packages "cannot be found".',
      'Building whole applications in notebooks, where hidden cell order makes code hard to reuse and test.',
      'Using only print debugging and never learning breakpoints.',
      'Installing many IDE plugins that conflict instead of a small, reliable setup.',
    ],
    keyPoints: [
      'VS Code (with Python extension) and PyCharm are the most popular Python development tools.',
      'Jupyter notebooks are ideal for data exploration; scripts and packages for applications.',
      'Run Python as scripts, in the REPL, or in notebooks.',
      'Always select the project\'s virtual environment as the interpreter.',
      'Learn the debugger early; add a formatter/linter like Ruff.',
    ],
  },

  'hello-world-program': {
    title: 'Hello World Program in Python',
    intro: `Every programming journey starts with printing "Hello, World!". In Python this takes a single line, but the tiny program already teaches you how to write a source file, run it, and read the output — and how the <code>print()</code> function works.

In this lesson you will write Hello World in several ways, run it from a file and from the terminal, learn the main options of <code>print()</code>, and see how a real Python program is usually structured with a <code>main()</code> function.`,
    sections: [
      {
        heading: 'Your First Program',
        body: `Create a file named <code>hello.py</code> containing <code>print("Hello, World!")</code>, open a terminal in the same folder, and run <code>python hello.py</code> (or <code>python3 hello.py</code> on macOS/Linux). Python reads the file, executes the statement, and prints the text. No class, no main method, no semicolons are needed.`,
      },
      {
        heading: 'How print() Works',
        body: `<code>print()</code> converts its arguments to strings, separates them with a space and ends with a newline. The <code>sep</code> parameter changes the separator, <code>end</code> changes what is printed at the end, and <code>file</code> can send output to a file or <code>sys.stderr</code>. Strings can use single or double quotes.`,
      },
      {
        heading: 'The main() Convention',
        body: `Larger programs put their code in functions and call a <code>main()</code> function inside <code>if __name__ == "__main__":</code>. This block runs only when the file is executed directly, not when it is imported as a module by another file — a pattern you will see in almost every Python project.`,
      },
    ],
    examples: [
      {
        caption: 'Hello World',
        code: `print("Hello, World!")`,
        output: `Hello, World!`,
      },
      {
        caption: 'print() with several arguments, sep and end',
        code: `print("Hello", "Webnest", "Studio")
print("2026", "09", "27", sep="-")
print("Loading", end="...")
print("done")
print('Single quotes work too')`,
        output: `Hello Webnest Studio
2026-09-27
Loading...done
Single quotes work too`,
      },
      {
        caption: 'Structured Hello World with a main function',
        code: `def greet(name):
    return f"Hello, {name}! Welcome to Python."


def main():
    for name in ["Asha", "Ravi"]:
        print(greet(name))


if __name__ == "__main__":
    main()`,
        output: `Hello, Asha! Welcome to Python.
Hello, Ravi! Welcome to Python.`,
      },
      {
        caption: 'Running the program from the terminal',
        code: `# Windows
python hello.py

# macOS / Linux
python3 hello.py`,
        output: `Hello, World!`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Writing Print("Hello") — Python is case-sensitive and the function is print.',
      'Forgetting the quotes around text, so Python treats Hello as an undefined variable (NameError).',
      'Mixing quote types: "Hello\' is a syntax error.',
      'Running python hello.py from a different folder than the file is in.',
    ],
    keyPoints: [
      'print("Hello, World!") is a complete Python program.',
      'Run files with python file.py (python3 on macOS/Linux).',
      'print() accepts multiple values and the sep and end parameters.',
      'Real programs use a main() function guarded by if __name__ == "__main__".',
    ],
  },

  'keywords-and-identifiers': {
    title: 'Python Keywords and Identifiers',
    intro: `Every name in a Python program — variables, functions, classes, modules — is an <strong>identifier</strong>, and some words are reserved by the language itself as <strong>keywords</strong>. Knowing the rules for valid names, the list of keywords, and the naming conventions the Python community follows makes your code correct and instantly readable to other developers.`,
    sections: [
      {
        heading: 'Keywords',
        body: `Keywords have special meaning and cannot be used as names: <code>False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield</code>. Python also has <strong>soft keywords</strong> — <code>match</code>, <code>case</code>, <code>type</code> and <code>_</code> — that are keywords only in specific contexts, so they can still be used as ordinary names elsewhere. The <code>keyword</code> module lists them all.`,
      },
      {
        heading: 'Identifier Rules',
        body: `A valid identifier:`,
        list: [
          'Starts with a letter (a–z, A–Z, or Unicode letters) or an underscore <code>_</code>.',
          'Continues with letters, digits or underscores — no spaces, hyphens or symbols like <code>@ $ %</code>.',
          'Cannot start with a digit (<code>2nd_place</code> is invalid).',
          'Cannot be a keyword (<code>class</code>, <code>for</code>...).',
          'Is case-sensitive: <code>total</code>, <code>Total</code> and <code>TOTAL</code> are three different names.',
        ],
      },
      {
        heading: 'Naming Conventions (PEP 8)',
        body: `Beyond validity, follow PEP 8 so code looks familiar: <code>snake_case</code> for variables, functions and modules; <code>PascalCase</code> for classes; <code>UPPER_SNAKE_CASE</code> for constants; a leading underscore (<code>_internal</code>) for "private" names; and double leading underscores (<code>__secret</code>) trigger name mangling inside classes. Avoid shadowing built-ins such as <code>list</code>, <code>str</code>, <code>id</code> or <code>sum</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Listing keywords and checking identifiers',
        code: `import keyword

print("Number of keywords:", len(keyword.kwlist))
print("Soft keywords:", keyword.softkwlist)
print(keyword.iskeyword("for"), keyword.iskeyword("match"))

for name in ["total_marks", "_count", "2nd_place", "first-name", "class", "Café"]:
    valid = name.isidentifier() and not keyword.iskeyword(name)
    print(f"{name!r:15} valid identifier: {valid}")`,
        output: `Number of keywords: 35
Soft keywords: ['_', 'case', 'match', 'type']
True False
'total_marks'   valid identifier: True
'_count'        valid identifier: True
'2nd_place'     valid identifier: False
'first-name'    valid identifier: False
'class'         valid identifier: False
'Café'          valid identifier: True`,
      },
      {
        caption: 'Naming conventions in practice',
        code: `MAX_STUDENTS = 30                     # constant


class CourseEnrollment:              # class: PascalCase
    def __init__(self, course_name):
        self.course_name = course_name
        self._students = []           # "internal" by convention

    def add_student(self, student_name):   # method: snake_case
        if len(self._students) < MAX_STUDENTS:
            self._students.append(student_name)


enrollment = CourseEnrollment("Python")
enrollment.add_student("Asha")
print(enrollment.course_name, enrollment._students)`,
        output: `Python ['Asha']`,
      },
      {
        caption: 'Case sensitivity and shadowing a built-in',
        code: `score = 10
Score = 20
print(score, Score)

list = [3, 1, 2]          # shadows the built-in list() — avoid this!
try:
    print(list("abc"))
except TypeError as error:
    print("TypeError:", error)`,
        output: `10 20
TypeError: 'list' object is not callable`,
      },
    ],
    commonMistakes: [
      'Using hyphens in names (first-name), which Python reads as subtraction.',
      'Naming variables list, dict, str, id or input, which hides the built-in functions.',
      'Starting names with digits or using keywords such as class or from as variable names.',
      'Inconsistent naming (camelCase variables in a snake_case codebase).',
    ],
    keyPoints: [
      'Python has 35 keywords plus soft keywords (match, case, type, _).',
      'Identifiers start with a letter or underscore and contain only letters, digits and underscores.',
      'Identifiers are case-sensitive.',
      'Follow PEP 8: snake_case, PascalCase for classes, UPPER_CASE for constants.',
      'Never shadow built-in names.',
    ],
  },

  'comments-and-docstrings': {
    title: 'Comments and Docstrings in Python',
    intro: `Code is read far more often than it is written. <strong>Comments</strong> explain <em>why</em> code does something non-obvious, and <strong>docstrings</strong> document what modules, functions and classes do — and, unlike comments, they are available at runtime through <code>help()</code> and used by IDEs and documentation generators.

This lesson covers single-line and "multi-line" comments, docstring conventions for functions and classes, and how to write comments that help rather than clutter.`,
    sections: [
      {
        heading: 'Comments',
        body: `A comment starts with <code>#</code> and runs to the end of the line; Python ignores it. Python has no special multi-line comment syntax — use several <code>#</code> lines. (A bare triple-quoted string is sometimes used, but it is really a string expression, not a comment.) Inline comments should be separated from code by at least two spaces.`,
      },
      {
        heading: 'Docstrings',
        body: `A docstring is a string literal that is the first statement of a module, function, class or method. It is stored in the object's <code>__doc__</code> attribute and shown by <code>help()</code>. Use triple double quotes. The first line is a short summary; longer docstrings describe arguments, return values and exceptions — common styles are Google style and NumPy style.`,
      },
      {
        heading: 'Writing Good Comments',
        body: `Explain intent, business rules and surprising decisions ("Tax is rounded per item, as required by GST rules"), not what the code obviously does ("increment i"). Keep comments updated — a wrong comment is worse than none. Prefer clear names and small functions over explaining unclear code with comments.`,
      },
    ],
    examples: [
      {
        caption: 'Single-line, inline and block comments',
        code: `# Calculate the final price after discount and GST
price = 1000
discount = 0.10      # 10% festival discount

# GST is applied after the discount,
# as required on the invoice.
final_price = price * (1 - discount) * 1.18
print(round(final_price, 2))`,
        output: `1062.0`,
      },
      {
        caption: 'Function and class docstrings, read with help() and __doc__',
        code: `def bmi(weight_kg, height_m):
    """Return the body-mass index.

    Args:
        weight_kg: Weight in kilograms.
        height_m: Height in metres.

    Returns:
        The BMI rounded to one decimal place.
    """
    return round(weight_kg / height_m ** 2, 1)


class Student:
    """A learner enrolled on the Webnest platform."""


print(bmi(68, 1.75))
print(bmi.__doc__.splitlines()[0])
print(Student.__doc__)`,
        output: `22.2
Return the body-mass index.
A learner enrolled on the Webnest platform.`,
      },
    ],
    commonMistakes: [
      'Commenting every line with what the code already says.',
      'Leaving outdated comments after changing the code.',
      'Using triple-quoted strings everywhere as "comments" instead of #.',
      'Skipping docstrings on public functions and classes that others will use.',
    ],
    keyPoints: [
      '# starts a comment; use several # lines for multi-line comments.',
      'Docstrings are the first string in a module, function or class, stored in __doc__.',
      'help(obj) and IDEs display docstrings.',
      'Comment the why, not the what; keep comments accurate.',
    ],
  },

  'input-and-output': {
    title: 'Input and Output in Python',
    intro: `Most programs need to talk to the user: read values they type and show results in a readable way. Python's <code>input()</code> reads a line from the keyboard and <code>print()</code> writes to the screen, while f-strings and format specifiers make output look professional.

This lesson covers reading input and converting it to numbers, validating input, reading several values from one line, and formatting output with widths, alignment and decimal places.`,
    sections: [
      {
        heading: 'Reading Input',
        body: `<code>input(prompt)</code> shows the prompt, waits for the user to press Enter, and returns what they typed as a <strong>string</strong> — always a string, even if they typed digits. Convert it with <code>int()</code> or <code>float()</code>. Conversion of invalid text raises <code>ValueError</code>, so real programs validate input in a loop with <code>try</code>/<code>except</code>.`,
      },
      {
        heading: 'Multiple Values',
        body: `To read several values from one line, split the string: <code>a, b = input().split()</code>, and convert with <code>map(int, input().split())</code>. This pattern is common in coding challenges.`,
      },
      {
        heading: 'Formatting Output',
        body: `f-strings (<code>f"{value}"</code>) insert values into text. After a colon you can add a format specifier: <code>{price:.2f}</code> (two decimals), <code>{n:,}</code> (thousands separator), <code>{name:&lt;10}</code> / <code>{name:&gt;10}</code> / <code>{name:^10}</code> (left/right/centre align in 10 characters), <code>{ratio:.1%}</code> (percentage), and <code>{value=}</code> (prints the expression and its value, great for debugging).`,
      },
    ],
    examples: [
      {
        caption: 'Reading input and converting it',
        code: `name = input("Your name: ")
age = int(input("Your age: "))
print(f"Hello {name}, next year you will be {age + 1}.")`,
        stdin: 'Asha\n24\n',
        output: `Your name: Your age: Hello Asha, next year you will be 25.`,
      },
      {
        caption: 'Reading several numbers from one line',
        code: `a, b, c = map(int, input("Enter three marks: ").split())
print("Total:", a + b + c)
print("Average:", (a + b + c) / 3)`,
        stdin: '78 92 85\n',
        output: `Enter three marks: Total: 255
Average: 85.0`,
      },
      {
        caption: 'Validating input with a loop',
        code: `while True:
    text = input("Quantity (1-10): ")
    try:
        quantity = int(text)
    except ValueError:
        print(f"'{text}' is not a whole number.")
        continue
    if 1 <= quantity <= 10:
        break
    print("Please enter a number between 1 and 10.")

print("You ordered", quantity)`,
        stdin: 'five\n25\n3\n',
        output: `Quantity (1-10): 'five' is not a whole number.
Quantity (1-10): Please enter a number between 1 and 10.
Quantity (1-10): You ordered 3`,
      },
      {
        caption: 'Formatting a neat report',
        code: `items = [("Python course", 1, 2999), ("Workbook", 3, 499.5), ("Stickers", 10, 25)]

print(f"{'Item':<15}{'Qty':>5}{'Amount':>12}")
print("-" * 32)
total = 0
for name, qty, price in items:
    amount = qty * price
    total += amount
    print(f"{name:<15}{qty:>5}{amount:>12,.2f}")
print("-" * 32)
print(f"{'Total':<20}{total:>12,.2f}")
print(f"{0.1845:.1%} of students scored above 90")
print(f"{total=}")`,
        output: `Item             Qty      Amount
--------------------------------
Python course      1    2,999.00
Workbook           3    1,498.50
Stickers          10      250.00
--------------------------------
Total                   4,747.50
18.4% of students scored above 90
total=4747.5`,
      },
    ],
    commonMistakes: [
      'Doing arithmetic on input() without converting: "5" + "3" gives "53".',
      'Crashing on invalid input instead of validating with try/except.',
      'Using float for money and printing raw values like 0.30000000000000004 instead of formatting.',
      'Building output with + and str() everywhere instead of f-strings.',
    ],
    keyPoints: [
      'input() always returns a string; convert with int() or float().',
      'Validate input in a loop with try/except ValueError.',
      'map(int, input().split()) reads several numbers from one line.',
      'f-string format specifiers control decimals, alignment, separators and percentages.',
      'f"{expr=}" prints an expression and its value for quick debugging.',
    ],
  },

  literals: {
    title: 'Python Literals',
    intro: `A <strong>literal</strong> is a fixed value written directly in your code: <code>42</code>, <code>3.14</code>, <code>"hello"</code>, <code>True</code>, <code>None</code>, <code>[1, 2, 3]</code>. Knowing every kind of literal — and the special forms such as binary numbers, raw strings and byte strings — helps you write values exactly the way you mean them.`,
    sections: [
      {
        heading: 'Numeric Literals',
        body: `Integers can be written in decimal (<code>255</code>), binary (<code>0b11111111</code>), octal (<code>0o377</code>) or hexadecimal (<code>0xFF</code>); underscores improve readability (<code>1_000_000</code>). Floats use a decimal point or exponent (<code>2.5</code>, <code>6.02e23</code>). Complex numbers use a <code>j</code> suffix (<code>3 + 4j</code>).`,
      },
      {
        heading: 'String and Bytes Literals',
        body: `Strings use single, double or triple quotes (triple quotes span lines). Escape sequences such as <code>\\n</code> (newline) and <code>\\t</code> (tab) start with a backslash. Prefixes change meaning: <code>r"..."</code> raw strings keep backslashes literally (useful for regex and Windows paths), <code>f"..."</code> f-strings embed expressions, and <code>b"..."</code> creates bytes instead of text.`,
      },
      {
        heading: 'Boolean, None and Collection Literals',
        body: `<code>True</code> and <code>False</code> are the Boolean literals, and <code>None</code> represents "no value". Collection literals create lists <code>[1, 2]</code>, tuples <code>(1, 2)</code>, dictionaries <code>{"a": 1}</code> and sets <code>{1, 2}</code>; note that <code>{}</code> is an empty dict — an empty set is written <code>set()</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Numeric literals in different bases',
        code: `print(255, 0b11111111, 0o377, 0xFF)
print(1_000_000)
print(2.5, 6.02e23, 1.5e-3)
z = 3 + 4j
print(z, z.real, z.imag, abs(z))`,
        output: `255 255 255 255
1000000
2.5 6.02e+23 0.0015
(3+4j) 3.0 4.0 5.0`,
      },
      {
        caption: 'String, raw, bytes and multi-line literals',
        code: `print("Line one\\nLine two")
print("Name:\\tAsha")
print(r"C:\\new\\table")          # raw string: backslashes kept
print(b"hello", type(b"hello"))
poem = """Roses are red,
Python is great."""
print(poem)`,
        output: `Line one
Line two
Name:	Asha
C:\\new\\table
b'hello' <class 'bytes'>
Roses are red,
Python is great.`,
      },
      {
        caption: 'Boolean, None and collection literals',
        code: `print(True, False, None)
print(type([]), type(()), type({}), type(set()))
print({1, 2, 2, 3})
print({"course": "Python", "lessons": 130})`,
        output: `True False None
<class 'list'> <class 'tuple'> <class 'dict'> <class 'set'>
{1, 2, 3}
{'course': 'Python', 'lessons': 130}`,
      },
    ],
    commonMistakes: [
      'Writing Windows paths like "C:\\new\\file" without a raw string, so \\n becomes a newline.',
      'Using {} expecting an empty set — it is an empty dict.',
      'Writing true/false/none in lowercase; Python literals are True, False, None.',
      'Leading zeros in integers (007) are a syntax error; use 7 or 0o7.',
    ],
    keyPoints: [
      'Integers can be decimal, binary (0b), octal (0o) or hex (0x); underscores aid readability.',
      'Floats support exponents; complex numbers use j.',
      'String prefixes: r (raw), f (formatted), b (bytes); triple quotes span lines.',
      'True, False and None are literals; {} is an empty dict, set() an empty set.',
    ],
  },

  'numbers-and-math': {
    title: 'Numbers and Math in Python',
    intro: `Python has three built-in numeric types — <code>int</code>, <code>float</code> and <code>complex</code> — plus the <code>decimal</code> and <code>fractions</code> modules for exact arithmetic. Python integers have unlimited size, floats follow the IEEE 754 standard (with its famous rounding surprises), and the <code>math</code> module provides functions from square roots to trigonometry.

This lesson covers numeric types and operations, integer vs float division, rounding, float precision issues and how to handle money correctly.`,
    sections: [
      {
        heading: 'int, float and complex',
        body: `<code>int</code> holds whole numbers of any size — <code>2 ** 200</code> works without overflow. <code>float</code> holds decimal numbers with about 15–17 significant digits. <code>complex</code> holds numbers with a real and imaginary part. Mixing types promotes to the wider type: <code>int + float</code> gives a float.`,
      },
      {
        heading: 'Division and Rounding',
        body: `<code>/</code> always returns a float (<code>7 / 2 == 3.5</code>); <code>//</code> is floor division (<code>7 // 2 == 3</code>, <code>-7 // 2 == -4</code>); <code>%</code> gives the remainder and <code>divmod()</code> both at once. <code>round()</code> uses "banker's rounding" — halves round to the nearest even number, so <code>round(2.5) == 2</code>. Use <code>math.floor</code>, <code>math.ceil</code> and <code>math.trunc</code> for other rounding.`,
      },
      {
        heading: 'Float Precision and Money',
        body: `Floats are stored in binary, and many decimal fractions (like 0.1) cannot be represented exactly, so <code>0.1 + 0.2 != 0.3</code>. Compare floats with <code>math.isclose()</code>. For money, use <code>decimal.Decimal</code> created from strings, or store amounts as integer paise/cents. <code>fractions.Fraction</code> represents exact rational numbers.`,
      },
    ],
    examples: [
      {
        caption: 'Numeric types and operations',
        code: `print(type(10), type(3.5), type(2 + 3j))
print(2 ** 100)
print(7 / 2, 7 // 2, -7 // 2, 7 % 3, divmod(17, 5))
print(10 + 2.5)
print(abs(-8), pow(2, 5), pow(2, 5, 3))`,
        output: `<class 'int'> <class 'float'> <class 'complex'>
1267650600228229401496703205376
3.5 3 -4 1 (3, 2)
12.5
8 32 2`,
      },
      {
        caption: 'Rounding and the math module',
        code: `import math

print(round(3.14159, 2), round(2.5), round(3.5))
print(math.floor(4.7), math.ceil(4.2), math.trunc(-4.7))
print(math.sqrt(144), math.pi, math.factorial(5))
print(math.gcd(24, 36), math.lcm(4, 6))
print(round(math.sin(math.radians(30)), 2))`,
        output: `3.14 2 4
4 5 -4
12.0 3.141592653589793 120
12 12
0.5`,
      },
      {
        caption: 'Float precision and exact money with Decimal',
        code: `import math
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction

print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3, math.isclose(0.1 + 0.2, 0.3))

price = Decimal("19.99")
total = price * 3
print(total)
print((Decimal("2.675")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
print(Fraction(1, 3) + Fraction(1, 6))`,
        output: `0.30000000000000004
False True
59.97
2.68
1/2`,
      },
    ],
    commonMistakes: [
      'Comparing floats with == instead of math.isclose().',
      'Using float for currency calculations.',
      'Expecting round(2.5) to be 3 — Python rounds halves to even.',
      'Creating Decimal from a float (Decimal(0.1)) instead of a string, carrying the float error along.',
    ],
    keyPoints: [
      'int has unlimited size; float is IEEE 754; complex uses j.',
      '/ gives a float, // floors, % gives the remainder.',
      'round() uses banker\'s rounding; math has floor, ceil, trunc and more.',
      'Use math.isclose for float comparison and Decimal (from strings) for money.',
    ],
  },

  'booleans-and-none': {
    title: 'Booleans and None in Python',
    intro: `Every decision a program makes comes down to <code>True</code> or <code>False</code>. Python's <code>bool</code> type, the idea of <strong>truthiness</strong> (which values count as true or false), and the special <code>None</code> value that means "nothing here" appear in almost every line of real code.

This lesson covers Boolean values and operators, truthy and falsy values, short-circuit evaluation, and how to use and test for <code>None</code> correctly.`,
    sections: [
      {
        heading: 'The bool Type',
        body: `<code>bool</code> has exactly two values, <code>True</code> and <code>False</code>. Comparisons (<code>==</code>, <code>&lt;</code>, <code>in</code>...) produce Booleans, and <code>and</code>, <code>or</code> and <code>not</code> combine them. <code>bool</code> is a subclass of <code>int</code>: <code>True == 1</code> and <code>False == 0</code>, which is why <code>sum()</code> can count True values.`,
      },
      {
        heading: 'Truthy and Falsy Values',
        body: `In an <code>if</code> or <code>while</code>, any value can be tested. <strong>Falsy</strong> values are: <code>False</code>, <code>None</code>, <code>0</code>, <code>0.0</code>, empty strings, lists, tuples, dicts and sets. Everything else is <strong>truthy</strong>. So <code>if items:</code> means "if the list is not empty".`,
      },
      {
        heading: 'Short-Circuit Evaluation',
        body: `<code>and</code> stops at the first falsy operand and <code>or</code> stops at the first truthy one, and they return that operand itself, not necessarily a bool. This enables idioms like <code>name = user_input or "Guest"</code> and safe checks like <code>if user and user.is_admin</code>.`,
      },
      {
        heading: 'None',
        body: `<code>None</code> is the single object of type <code>NoneType</code>, representing "no value" — a missing result, an optional argument not given, a function that returns nothing. Test for it with <code>is None</code> / <code>is not None</code>, not <code>==</code>, and be careful not to confuse it with falsy values like 0 or empty strings.`,
      },
    ],
    examples: [
      {
        caption: 'Booleans, comparisons and bool as int',
        code: `age = 20
print(age >= 18, age == 21, "py" in "python")
print(True and False, True or False, not True)
print(True + True, isinstance(True, int))

marks = [45, 78, 90, 32, 66]
print("Passed:", sum(m >= 40 for m in marks))`,
        output: `True False True
False True False
2 True
Passed: 4`,
      },
      {
        caption: 'Truthy and falsy values',
        code: `values = [0, 7, "", "hi", [], [0], {}, None, 0.0, " "]
for v in values:
    print(f"{v!r:6} -> {bool(v)}")`,
        output: `0      -> False
7      -> True
''     -> False
'hi'   -> True
[]     -> False
[0]    -> True
{}     -> False
None   -> False
0.0    -> False
' '    -> True`,
      },
      {
        caption: 'Short-circuit idioms and None checks',
        code: `def find_user(email):
    users = {"asha@webnest.in": "Asha"}
    return users.get(email)          # None when not found

nickname = "" or "Guest"
print(nickname)

user = find_user("ravi@webnest.in")
if user is None:
    print("No such user")

count = 0
print("count is None?", count is None, "| count falsy?", not count)
print(None or 0 or "fallback")`,
        output: `Guest
No such user
count is None? False | count falsy? True
fallback`,
      },
    ],
    commonMistakes: [
      'Writing if x == None instead of if x is None.',
      'Using "if value:" when 0 or "" are valid values, accidentally treating them as missing.',
      'Writing true/false in lowercase.',
      'Expecting and/or to always return True/False — they return one of the operands.',
    ],
    keyPoints: [
      'bool has two values and is a subclass of int (True == 1).',
      'Falsy: False, None, 0, 0.0, and empty collections/strings; everything else is truthy.',
      'and/or short-circuit and return an operand; "x or default" is a common idiom.',
      'Test None with is / is not.',
    ],
  },

  'type-casting': {
    title: 'Type Casting and Type Conversion in Python',
    intro: `Data often arrives in the wrong type: numbers typed by a user are strings, values from a CSV file are strings, and sometimes you need a list from a string or a string from a number. <strong>Type conversion</strong> changes a value from one type to another.

Python performs some conversions automatically (<strong>implicit</strong>), and you perform others with functions like <code>int()</code>, <code>float()</code>, <code>str()</code>, <code>list()</code> and <code>bool()</code> (<strong>explicit</strong>, also called type casting). This lesson covers both, plus what happens when conversion fails.`,
    sections: [
      {
        heading: 'Implicit Conversion',
        body: `Python automatically widens numeric types in mixed arithmetic: <code>int + float</code> produces a float and <code>int + complex</code> a complex, so no precision is lost. It never silently converts between strings and numbers — <code>"5" + 3</code> raises <code>TypeError</code>.`,
      },
      {
        heading: 'Explicit Conversion Functions',
        body: `The main casting functions:`,
        list: [
          '<code>int(x)</code> — from float (truncates toward zero), from string of digits, or with a base: <code>int("ff", 16)</code>.',
          '<code>float(x)</code> — from int or numeric string, including <code>"1e3"</code>, <code>"inf"</code>, <code>"nan"</code>.',
          '<code>str(x)</code> — a readable string of any object.',
          '<code>bool(x)</code> — truthiness of any value.',
          '<code>list(x)</code>, <code>tuple(x)</code>, <code>set(x)</code>, <code>dict(pairs)</code> — between collection types.',
          '<code>chr(n)</code> / <code>ord(c)</code> — between characters and Unicode code points; <code>bin()</code>, <code>oct()</code>, <code>hex()</code> — integers to base strings.',
        ],
      },
      {
        heading: 'When Conversion Fails',
        body: `<code>int("12.5")</code> and <code>int("abc")</code> raise <code>ValueError</code>; <code>int(None)</code> raises <code>TypeError</code>. Wrap conversions of external data in <code>try</code>/<code>except</code>. To turn "12.5" into an int, convert to float first. Note that <code>bool("False")</code> is <code>True</code> because the string is not empty.`,
      },
    ],
    examples: [
      {
        caption: 'Implicit and explicit numeric conversions',
        code: `result = 10 + 2.5
print(result, type(result))

print(int(9.99), int(-9.99), int("42"), int("ff", 16), int("1010", 2))
print(float(7), float("3.5"), float("1e3"))
print(str(3.14) + " is pi")
print(int(float("12.5")))`,
        output: `12.5 <class 'float'>
9 -9 42 255 10
7.0 3.5 1000.0
3.14 is pi
12`,
      },
      {
        caption: 'Collections, characters and bases',
        code: `print(list("abc"), tuple([1, 2]), set([1, 1, 2]))
print(dict([("a", 1), ("b", 2)]))
print(ord("A"), chr(97), chr(8377))
print(bin(10), oct(10), hex(255))
print(bool("False"), bool(""), bool(0.0))`,
        output: `['a', 'b', 'c'] (1, 2) {1, 2}
{'a': 1, 'b': 2}
65 a ₹
0b1010 0o12 0xff
True False False`,
      },
      {
        caption: 'Safe conversion of user data',
        code: `def to_int(text, default=0):
    try:
        return int(text)
    except (ValueError, TypeError):
        return default

for raw in ["25", " 7 ", "12.5", "abc", None]:
    print(repr(raw), "->", to_int(raw))

try:
    print("5" + 3)
except TypeError as error:
    print("TypeError:", error)`,
        output: `'25' -> 25
' 7 ' -> 7
'12.5' -> 0
'abc' -> 0
None -> 0
TypeError: can only concatenate str (not "int") to str`,
      },
    ],
    commonMistakes: [
      'Expecting int("12.5") to work — convert with float() first.',
      'Expecting int(9.99) to round — it truncates to 9; use round() to round.',
      'Treating bool("False") as False.',
      'Not handling ValueError when converting user or file input.',
    ],
    keyPoints: [
      'Python implicitly widens numbers (int → float → complex) but never mixes str and numbers.',
      'int(), float(), str(), bool(), list(), tuple(), set(), dict() convert explicitly.',
      'int(x, base) parses binary/hex strings; bin/oct/hex format them.',
      'Invalid conversions raise ValueError or TypeError — catch them for external data.',
    ],
  },

  'conditional-statements-and-match': {
    title: 'Conditional Statements: if, elif, else and match',
    intro: `Programs make decisions constantly: is the user logged in, did the payment succeed, which discount applies? Python's <code>if</code>, <code>elif</code> and <code>else</code> statements run different code depending on conditions, the conditional expression puts a decision in a single line, and the <code>match</code> statement (Python 3.10+) matches values against patterns.

This lesson covers every form of conditional in Python with practical examples.`,
    sections: [
      {
        heading: 'if, elif and else',
        body: `An <code>if</code> block runs when its condition is truthy. Add any number of <code>elif</code> branches, checked top to bottom — the first truthy one runs and the rest are skipped — and an optional <code>else</code> for everything else. Blocks are defined by indentation (4 spaces). Conditions can be combined with <code>and</code>, <code>or</code> and <code>not</code>, and chained comparisons such as <code>0 &lt;= score &lt;= 100</code> read naturally.`,
      },
      {
        heading: 'Nested Conditions and Guard Clauses',
        body: `An <code>if</code> can contain another <code>if</code>, but deep nesting is hard to read. Prefer <strong>guard clauses</strong>: handle invalid cases first and <code>return</code> early, leaving the main logic un-indented.`,
      },
      {
        heading: 'Conditional Expressions',
        body: `The ternary form <code>value_if_true if condition else value_if_false</code> chooses between two values in one expression: <code>status = "adult" if age &gt;= 18 else "minor"</code>. Use it for simple choices only.`,
      },
      {
        heading: 'match-case (Structural Pattern Matching)',
        body: `<code>match</code> compares a value against <code>case</code> patterns: literal values, alternatives with <code>|</code>, the wildcard <code>_</code>, sequence patterns that unpack lists, mapping patterns for dicts, class patterns, and guards with <code>if</code>. It is more powerful than a switch statement in other languages and ideal for parsing commands or structured data.`,
      },
    ],
    examples: [
      {
        caption: 'Grading with if / elif / else',
        code: `def grade(score):
    if not 0 <= score <= 100:
        return "invalid"
    if score >= 90:
        return "A"
    elif score >= 75:
        return "B"
    elif score >= 50:
        return "C"
    else:
        return "F"

for s in [95, 80, 62, 30, 120]:
    print(s, grade(s))`,
        output: `95 A
80 B
62 C
30 F
120 invalid`,
      },
      {
        caption: 'Combined conditions, guard clauses and the ternary expression',
        code: `def ticket_price(age, is_student, day):
    if age < 0:
        return None                       # guard clause
    base = 0 if age < 5 else 200
    if (age >= 60 or is_student) and day != "Sunday":
        base *= 0.5
    return base

print(ticket_price(3, False, "Monday"))
print(ticket_price(21, True, "Monday"))
print(ticket_price(21, True, "Sunday"))
print(ticket_price(65, False, "Friday"))

n = 7
print("even" if n % 2 == 0 else "odd")`,
        output: `0
100.0
200
100.0
odd`,
      },
      {
        caption: 'match-case with literals, sequences, mappings and guards',
        code: `def handle(command):
    match command.split():
        case ["quit" | "exit"]:
            return "Goodbye"
        case ["add", item]:
            return f"Adding {item}"
        case ["add", item, qty] if qty.isdigit():
            return f"Adding {qty} x {item}"
        case ["remove", *items] if items:
            return f"Removing {', '.join(items)}"
        case _:
            return "Unknown command"

for c in ["add pen", "add pen 3", "remove pen book", "exit", "dance"]:
    print(handle(c))

def describe(event):
    match event:
        case {"type": "payment", "amount": amount} if amount > 10000:
            return f"Large payment: {amount}"
        case {"type": "payment", "amount": amount}:
            return f"Payment: {amount}"
        case {"type": "refund"}:
            return "Refund"
        case _:
            return "Other"

print(describe({"type": "payment", "amount": 25000}))
print(describe({"type": "payment", "amount": 500}))
print(describe({"type": "refund", "id": 7}))`,
        output: `Adding pen
Adding 3 x pen
Removing pen, book
Goodbye
Unknown command
Large payment: 25000
Payment: 500
Refund`,
      },
    ],
    commonMistakes: [
      'Using = instead of == in a condition (a SyntaxError in Python, which prevents the classic C bug).',
      'Ordering elif conditions wrongly, e.g. checking score >= 50 before score >= 90.',
      'Deeply nesting ifs instead of using guard clauses.',
      'Using match on Python versions older than 3.10.',
      'Forgetting the case _ fallback, so unmatched values silently do nothing.',
    ],
    keyPoints: [
      'if/elif/else checks conditions top to bottom and runs the first match.',
      'Chained comparisons like 0 <= x <= 100 and guard clauses keep code readable.',
      'x if cond else y is a one-line conditional expression.',
      'match-case supports literal, sequence, mapping and class patterns with guards (3.10+).',
    ],
  },

  'loops-for-and-while': {
    title: 'Loops in Python: for and while',
    intro: `Loops repeat work: process every order, retry until a download succeeds, read every line of a file. Python has two loop statements. The <code>for</code> loop iterates over the items of any iterable — lists, strings, ranges, dictionaries, files. The <code>while</code> loop repeats as long as a condition stays true.

This lesson covers both loops, <code>range()</code>, <code>enumerate()</code> and <code>zip()</code>, looping over dictionaries, nested loops, the loop <code>else</code> clause, and how to choose between <code>for</code> and <code>while</code>.`,
    sections: [
      {
        heading: 'The for Loop',
        body: `<code>for item in iterable:</code> runs the block once per item. It works with any iterable, not just numbers. <code>range(stop)</code>, <code>range(start, stop)</code> and <code>range(start, stop, step)</code> produce integer sequences (stop is exclusive). <code>enumerate()</code> gives index and item together; <code>zip()</code> walks several sequences in parallel; <code>reversed()</code> and <code>sorted()</code> change the order.`,
      },
      {
        heading: 'The while Loop',
        body: `<code>while condition:</code> repeats while the condition is truthy. Use it when you do not know in advance how many iterations are needed: reading until the user types "quit", retrying a network call, running a game loop. Make sure something inside the loop eventually makes the condition false, or you get an infinite loop.`,
      },
      {
        heading: 'Loop else',
        body: `A loop can have an <code>else</code> block that runs only if the loop finished <strong>without</strong> a <code>break</code>. It is handy for search loops: "look for the item; else report it was not found".`,
      },
      {
        heading: 'for vs while',
        body: `Use <code>for</code> when iterating over a collection or a known range — it cannot accidentally run forever and needs no manual counter. Use <code>while</code> for condition-driven repetition. Most Python loops are <code>for</code> loops; if you write <code>while i &lt; len(items)</code> with a manual index, a <code>for</code> loop is almost always cleaner.`,
      },
    ],
    examples: [
      {
        caption: 'for loops with range, enumerate and zip',
        code: `for i in range(1, 6):
    print(i, end=" ")
print()

for n in range(10, 0, -3):
    print(n, end=" ")
print()

fruits = ["mango", "apple", "banana"]
for index, fruit in enumerate(fruits, start=1):
    print(index, fruit)

names = ["Asha", "Ravi", "Meera"]
scores = [88, 72, 95]
for name, score in zip(names, scores):
    print(f"{name}: {score}")`,
        output: `1 2 3 4 5
10 7 4 1
1 mango
2 apple
3 banana
Asha: 88
Ravi: 72
Meera: 95`,
      },
      {
        caption: 'Looping over strings and dictionaries, and nested loops',
        code: `for ch in "Hi!":
    print(ch)

prices = {"pen": 10, "book": 250, "bag": 899}
for item, price in prices.items():
    print(f"{item:<5} Rs.{price}")

for row in range(1, 4):
    print(" ".join(str(row * col) for col in range(1, 4)))`,
        output: `H
i
!
pen   Rs.10
book  Rs.250
bag   Rs.899
1 2 3
2 4 6
3 6 9`,
      },
      {
        caption: 'while loops and the loop else clause',
        code: `balance = 1000
years = 0
while balance < 2000:
    balance *= 1.08
    years += 1
print(f"Doubled in {years} years: {balance:.2f}")

numbers = [4, 8, 15, 16, 23, 42]
target = 15
for position, n in enumerate(numbers):
    if n == target:
        print("Found at index", position)
        break
else:
    print("Not found")

for n in numbers:
    if n == 99:
        break
else:
    print("99 not found (loop finished without break)")`,
        output: `Doubled in 10 years: 2158.92
Found at index 2
99 not found (loop finished without break)`,
      },
    ],
    commonMistakes: [
      'Forgetting that range(1, 10) stops at 9.',
      'Modifying a list while iterating over it — iterate over a copy or build a new list.',
      'Writing while loops whose condition never becomes false.',
      'Using range(len(items)) and items[i] when enumerate() is clearer.',
      'Misunderstanding loop else: it runs when no break happened, not when the loop body never ran.',
    ],
    keyPoints: [
      'for iterates over any iterable; range() generates number sequences (stop exclusive).',
      'enumerate() gives indices, zip() pairs sequences, .items() walks dicts.',
      'while repeats while a condition is true — ensure it eventually ends.',
      'A loop\'s else runs only if the loop was not ended by break.',
      'Prefer for loops for collections; while for condition-driven repetition.',
    ],
  },

  'break-continue-and-pass': {
    title: 'break, continue and pass in Python',
    intro: `Sometimes a loop should stop early, skip an item, or do nothing at all for now. Python gives you three small statements for this: <code>break</code> exits the loop, <code>continue</code> skips to the next iteration, and <code>pass</code> is a placeholder that does nothing.

This lesson explains each statement, the difference between <code>break</code> and <code>continue</code>, how they behave in nested loops, and where <code>pass</code> is useful.`,
    sections: [
      {
        heading: 'break',
        body: `<code>break</code> immediately ends the innermost loop; execution continues after the loop, and any loop <code>else</code> block is skipped. Typical uses: stop searching once you find something, exit a <code>while True</code> loop when the user enters "quit".`,
      },
      {
        heading: 'continue',
        body: `<code>continue</code> skips the rest of the current iteration and jumps to the next one. It keeps loop bodies flat: filter out invalid items at the top with <code>if bad: continue</code> instead of wrapping the rest in an <code>if</code>.`,
      },
      {
        heading: 'pass',
        body: `<code>pass</code> does nothing. Python requires at least one statement in a block, so <code>pass</code> is used as a placeholder for functions or classes you will implement later, empty exception handlers (use rarely!), or minimal class definitions. <code>...</code> (Ellipsis) is often used the same way in stubs.`,
      },
      {
        heading: 'break vs continue in Nested Loops',
        body: `Both affect only the <strong>innermost</strong> loop. To exit several loops at once, move the loops into a function and <code>return</code>, or use a flag variable.`,
      },
    ],
    examples: [
      {
        caption: 'break and continue side by side',
        code: `print("break:")
for n in range(1, 10):
    if n == 5:
        break
    print(n, end=" ")
print()

print("continue:")
for n in range(1, 10):
    if n % 3 == 0:
        continue
    print(n, end=" ")
print()`,
        output: `break:
1 2 3 4
continue:
1 2 4 5 7 8`,
      },
      {
        caption: 'A menu loop with while True and break',
        code: `commands = ["add", "list", "oops", "quit", "never reached"]
cart = []
for cmd in commands:
    if cmd == "quit":
        print("Bye!")
        break
    if cmd not in ("add", "list"):
        print(f"Unknown command: {cmd}")
        continue
    if cmd == "add":
        cart.append("item")
    print(cmd, "->", cart)`,
        output: `add -> ['item']
list -> ['item']
Unknown command: oops
Bye!`,
      },
      {
        caption: 'pass as a placeholder, and exiting nested loops with return',
        code: `class PaymentGateway:
    pass                      # to be implemented later

def todo():
    pass

def find_pair(numbers, target):
    for i, a in enumerate(numbers):
        for b in numbers[i + 1:]:
            if a + b == target:
                return a, b      # leaves both loops
    return None

print(type(PaymentGateway()).__name__, todo())
print(find_pair([2, 7, 11, 15], 18))
print(find_pair([1, 2, 3], 100))`,
        output: `PaymentGateway None
(7, 11)
None`,
      },
    ],
    commonMistakes: [
      'Expecting break to exit all nested loops — it only exits the innermost one.',
      'Using continue in a while loop before incrementing the counter, creating an infinite loop.',
      'Using except: pass to silence errors, hiding real bugs.',
      'Confusing pass (do nothing, keep going) with continue (skip to the next iteration).',
    ],
    keyPoints: [
      'break exits the innermost loop and skips its else clause.',
      'continue skips the rest of the current iteration.',
      'pass is a no-op placeholder required where a statement is syntactically needed.',
      'Use a function with return to leave several nested loops at once.',
    ],
  },
}
