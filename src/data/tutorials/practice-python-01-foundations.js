// Practice blocks for the first four Python modules: Getting Started, Variables and Data
// Types, Control Flow, and Strings. Merged onto the lesson entries in index.js by slug,
// so the lesson prose files stay unchanged.
// Exercises do not call input(), so they give the same output on every run.
export const practicePythonFoundations = {
  'introduction-to-python': {
    whyItMatters: `Python is the usual first language for automation, data analysis, machine learning and web back ends, and it is one of the most requested skills in job listings. Knowing what kind of language it is, and where it is strong and weak, helps you decide when it is the right tool and explains much of what you will see in the rest of this course.`,
    exercise: {
      prompt: `Python was first released in 1991. Store that year in a variable, work out how old the language is in 2026, and print the result in a sentence.

Expected output: <code>Python is 35 years old</code>`,
      starterCode: `released = 1991
current_year = 2026

# TODO: calculate the age and print the sentence`,
      hints: [
        'Subtract one year from the other and store the result in a variable.',
        'An f-string puts a value inside text: <code>f"Python is {age} years old"</code>.',
      ],
      solution: `released = 1991
current_year = 2026

age = current_year - released
print(f"Python is {age} years old")`,
    },
    quiz: [
      {
        question: 'What does it mean that Python is dynamically typed?',
        options: ['Variables must be declared with a type', 'The type belongs to the value, and a name can later refer to a value of another type', 'Python has no types', 'Types are checked before the program runs'],
        answer: 1,
        explanation: 'No type is declared for a variable. The type is checked while the program runs.',
      },
      {
        question: 'Who created Python?',
        options: ['James Gosling', 'Dennis Ritchie', 'Guido van Rossum', 'Brendan Eich'],
        answer: 2,
        explanation: 'Guido van Rossum released the first version in 1991.',
      },
      {
        question: 'Which is a known weakness of Python?',
        options: ['It has very few libraries', 'It only runs on Linux', 'It cannot be used for web development', 'Pure Python code runs more slowly than compiled languages such as C or Java'],
        answer: 3,
        explanation: 'The cost is usually offset by libraries written in C, such as NumPy, and by faster development.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the main features of Python?',
        answer: `Python is interpreted, dynamically typed and designed to be easy to read. It supports procedural, object-oriented and functional styles, manages memory automatically, and comes with a large standard library. A very large collection of third-party packages is available from PyPI.`,
      },
      {
        question: 'Is Python compiled or interpreted?',
        answer: `Both steps happen. The standard implementation, CPython, first compiles the source code to bytecode, which may be cached in <code>.pyc</code> files, and then its virtual machine interprets that bytecode. Because there is no separate compile step for the programmer and the bytecode is not machine code, Python is described as an interpreted language.`,
      },
    ],
  },

  'setting-up-the-python-environment': {
    whyItMatters: `A surprising number of early problems are not about code at all: the wrong Python version runs, a package installs into a different interpreter, or the command is not found. Knowing how to check which interpreter you are using and how to run a file removes these problems before they waste your time.`,
    exercise: {
      prompt: `Write a script that prints the major version number of the Python that is running it, and then whether that Python is version 3.8 or newer.

Expected output: <code>3</code> then <code>True</code>`,
      starterCode: `import sys

# TODO: print the major version number
# TODO: print whether the version is at least 3.8`,
      hints: [
        '<code>sys.version_info</code> holds the version as numbers, and <code>sys.version_info.major</code> is the first of them.',
        'It can be compared with a tuple: <code>sys.version_info &gt;= (3, 8)</code>.',
      ],
      solution: `import sys

print(sys.version_info.major)
print(sys.version_info >= (3, 8))`,
    },
    quiz: [
      {
        question: 'Which command shows the installed Python version?',
        options: ['python --version', 'python version()', 'python -run', 'pip version python'],
        answer: 0,
        explanation: 'On macOS and Linux the command is often python3 --version.',
      },
      {
        question: 'What is the REPL?',
        options: ['A package installer', 'An interactive prompt that runs each line as you type it', 'A code formatter', 'A type of file'],
        answer: 1,
        explanation: 'It reads a line, evaluates it, prints the result and waits for the next one.',
      },
      {
        question: 'How do you run a saved file named <code>app.py</code>?',
        options: ['run app.py', 'app.py --python', 'python app.py', 'import app.py'],
        answer: 2,
        explanation: 'The interpreter is given the file name as its argument.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a virtual environment and why use one?',
        answer: `A virtual environment is a folder that holds its own Python interpreter and its own installed packages, separate from the system-wide installation. Each project gets its own, so two projects can depend on different versions of the same package without conflict, and the list of packages a project needs can be recorded and recreated on another machine. It is created with <code>python -m venv .venv</code>.`,
      },
      {
        question: 'What is the difference between running a script and using the REPL?',
        answer: `A script is a saved <code>.py</code> file that the interpreter runs from top to bottom; it is how real programs are written and kept. The REPL runs one statement at a time and shows the result of each expression immediately, which is useful for trying something out, but nothing typed there is saved.`,
      },
    ],
  },

  'python-ides-and-tools': {
    whyItMatters: `The editor, debugger and linter you use decide how quickly you find mistakes. A debugger shows the value of every variable at the line where the program goes wrong, which is far faster than guessing. These tools are part of working professionally, and employers expect you to be comfortable with them.`,
    exercise: {
      prompt: `The function should return the average of the numbers, but it returns the wrong answer. Step through it with a debugger, or add <code>print</code> calls inside the loop, to find the faulty line, and fix it.

Expected output: <code>20.0</code>`,
      starterCode: `def average(values):
    total = 0
    for value in values:
        total = value
    return total / len(values)


print(average([10, 20, 30]))`,
      hints: [
        'Watch <code>total</code> on each pass through the loop. It should grow, but it is replaced each time.',
        'Adding to a variable is written <code>total += value</code>.',
      ],
      solution: `def average(values):
    total = 0
    for value in values:
        total += value
    return total / len(values)


print(average([10, 20, 30]))`,
    },
    quiz: [
      {
        question: 'Which tool is best suited to exploring data step by step, with charts shown beside the code?',
        options: ['A compiler', 'The Windows command prompt', 'A linter', 'A Jupyter notebook'],
        answer: 3,
        explanation: 'A notebook runs code in cells and keeps each result below its cell.',
      },
      {
        question: 'What does a linter such as Ruff do?',
        options: ['Reports likely mistakes and style problems without running the code', 'Runs the program faster', 'Installs packages', 'Creates virtual environments'],
        answer: 0,
        explanation: 'It reads the source and flags problems such as unused variables and undefined names.',
      },
      {
        question: 'Which interpreter should an IDE be set to use for a project?',
        options: ['Any Python on the machine', 'The one inside the project\'s virtual environment', 'The newest one available', 'It does not matter'],
        answer: 1,
        explanation: 'Otherwise the IDE cannot see the packages installed for that project.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you debug a Python program?',
        answer: `Set a breakpoint on the line of interest and run the program in the debugger of the IDE, then step through line by line while inspecting the variables and the call stack. Without an IDE, calling the built-in <code>breakpoint()</code> starts the <code>pdb</code> debugger at that line. Reading the traceback from the bottom up is the first step, since it names the exception and the line that raised it.`,
      },
      {
        question: 'What is the difference between a linter and a formatter?',
        answer: `A formatter rewrites the layout of the code — spacing, line length, quotes — so that it is consistent, without changing what it does. A linter analyses the code and reports possible errors and bad practices, such as an unused import or a name that is never defined. Teams usually run both automatically.`,
      },
    ],
  },

  'hello-world-program': {
    whyItMatters: `<code>print()</code> is the first function you learn and one you never stop using: it is the quickest way to see what a program is doing. Its <code>sep</code> and <code>end</code> options, and the <code>main()</code> pattern shown in this lesson, appear in nearly every Python file you will read.`,
    exercise: {
      prompt: `Using the <code>sep</code> and <code>end</code> parameters of <code>print()</code>, print a date from three separate values, and then print two messages on the same line with two separate <code>print</code> calls.

Expected output: <code>2026-10-02</code> then <code>Loading... done</code>`,
      starterCode: `# TODO: print "2026", "10" and "02" joined by hyphens, using one print call

# TODO: print "Loading" and "done" with two print calls so they appear on one line`,
      hints: [
        '<code>sep</code> sets what is placed between the values: <code>print("a", "b", sep="-")</code>.',
        '<code>end</code> replaces the line break that <code>print</code> normally adds: <code>print("Loading", end="... ")</code>.',
      ],
      solution: `print("2026", "10", "02", sep="-")

print("Loading", end="... ")
print("done")`,
    },
    quiz: [
      {
        question: 'What does <code>print("a", "b")</code> display?',
        options: ['ab', 'a,b', 'a b', '("a", "b")'],
        answer: 2,
        explanation: 'The default separator between values is one space.',
      },
      {
        question: 'What does <code>print()</code> add after its output by default?',
        options: ['Nothing', 'A space', 'A full stop', 'A line break'],
        answer: 3,
        explanation: 'The default value of end is a newline character.',
      },
      {
        question: 'When is the code under <code>if __name__ == "__main__":</code> executed?',
        options: ['Only when the file is run directly, not when it is imported', 'Always', 'Only when the file is imported', 'Never'],
        answer: 0,
        explanation: 'A file that is run directly has __name__ set to "__main__". An imported file has its module name.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the purpose of if __name__ == "__main__"?',
        answer: `Python sets the variable <code>__name__</code> to <code>"__main__"</code> in the file that is run directly, and to the module's name in a file that is imported. Putting the start-up code under this check means it runs when the file is executed as a program but not when another file imports it to reuse its functions.`,
      },
      {
        question: 'Which parameters does print() accept besides the values to print?',
        answer: `<code>sep</code> is the text placed between values and defaults to a space. <code>end</code> is the text added at the end and defaults to a newline. <code>file</code> is where the output is written and defaults to standard output, and <code>flush</code> forces the output to be written immediately.`,
      },
    ],
  },

  'syntax': {
    whyItMatters: `In most languages indentation is a matter of style. In Python it is part of the grammar: it decides which statements belong to a loop, a function or an <code>if</code>. A line indented one level too far, or not far enough, changes what the program does or stops it from running, so this is the first rule to get right.`,
    exercise: {
      prompt: `The program should add up the numbers and print the total once, but it stops with an <code>IndentationError</code>. Fix the indentation.

Expected output: <code>6</code>`,
      starterCode: `total = 0
for number in [1, 2, 3]:
total += number
print(total)`,
      hints: [
        'The line that should repeat must be indented under the <code>for</code> line.',
        'Leave <code>print(total)</code> with no indentation, so it runs once after the loop has finished.',
      ],
      solution: `total = 0
for number in [1, 2, 3]:
    total += number
print(total)`,
    },
    quiz: [
      {
        question: 'How does Python know which statements are inside a loop?',
        options: ['Curly braces', 'Their indentation', 'A semicolon after each one', 'The keyword end'],
        answer: 1,
        explanation: 'The statements indented under the line ending with a colon form its block.',
      },
      {
        question: 'How many spaces per indentation level does the PEP 8 style guide recommend?',
        options: ['2', '8', '4', 'One tab'],
        answer: 2,
        explanation: 'Four spaces per level is the standard used by almost all Python code.',
      },
      {
        question: 'Is a semicolon needed at the end of a Python statement?',
        options: ['Yes, always', 'Only after print', 'Only inside functions', 'No; a statement ends at the end of the line'],
        answer: 3,
        explanation: 'A semicolon may separate two statements on one line, but this is rarely done.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How does Python use indentation?',
        answer: `A line ending with a colon, such as an <code>if</code>, <code>for</code>, <code>def</code> or <code>class</code> line, starts a block, and the lines indented beneath it belong to that block. The block ends at the first line indented less. All lines of one block must use the same indentation; inconsistent indentation raises <code>IndentationError</code>.`,
      },
      {
        question: 'What is PEP 8?',
        answer: `PEP 8 is the official style guide for Python code. It covers layout and naming: four spaces per indentation level, a limit on line length, <code>snake_case</code> for functions and variables, <code>PascalCase</code> for classes and upper case for constants. Following it makes code look familiar to any Python developer, and formatters such as Black and Ruff apply it automatically.`,
      },
    ],
  },

  'keywords-and-identifiers': {
    whyItMatters: `Names are most of what you write in a program. The rules for a valid name are simple, but breaking them gives confusing errors, and reusing a built-in name such as <code>list</code> or <code>sum</code> silently breaks code further down. Following the naming conventions also makes your code read like the libraries you use.`,
    exercise: {
      prompt: `For each name in the list, print the name followed by <code>True</code> if it can be used as a variable name and <code>False</code> if it cannot. A usable name is a valid identifier that is not a keyword.

Expected output: <code>total_price True</code>, <code>2nd_place False</code>, <code>class False</code>, <code>_hidden True</code> (one per line)`,
      starterCode: `import keyword

names = ["total_price", "2nd_place", "class", "_hidden"]

for name in names:
    # TODO: work out whether the name is usable, and print the name and the result
    pass`,
      hints: [
        '<code>name.isidentifier()</code> checks the spelling rules, and <code>keyword.iskeyword(name)</code> checks whether the word is reserved.',
        'Combine them: <code>name.isidentifier() and not keyword.iskeyword(name)</code>.',
      ],
      solution: `import keyword

names = ["total_price", "2nd_place", "class", "_hidden"]

for name in names:
    usable = name.isidentifier() and not keyword.iskeyword(name)
    print(name, usable)`,
    },
    quiz: [
      {
        question: 'Which of these is a valid variable name?',
        options: ['_count', 'my-name', '2fast', 'for'],
        answer: 0,
        explanation: 'A name may start with an underscore. It may not start with a digit, contain a hyphen, or be a keyword.',
      },
      {
        question: 'Which naming style does PEP 8 recommend for a class?',
        options: ['snake_case', 'PascalCase', 'UPPER_CASE', 'camelCase'],
        answer: 1,
        explanation: 'Classes use PascalCase, functions and variables use snake_case, and constants use UPPER_CASE.',
      },
      {
        question: 'What is the effect of writing <code>list = [1, 2, 3]</code>?',
        options: ['The name list now refers to your data, so the built-in list() can no longer be called by that name', 'A syntax error', 'Nothing unusual', 'The built-in is renamed'],
        answer: 0,
        explanation: 'This is called shadowing a built-in. A later call such as list("abc") fails with TypeError.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a keyword and an identifier?',
        answer: `A keyword is a word reserved by the language with a fixed meaning, such as <code>if</code>, <code>for</code>, <code>class</code> and <code>return</code>; it cannot be used as a name. An identifier is a name chosen by the programmer for a variable, function, class or module. It must start with a letter or underscore, continue with letters, digits or underscores, and is case-sensitive.`,
      },
      {
        question: 'What do a leading underscore and a double leading underscore mean in a name?',
        answer: `A single leading underscore, as in <code>_helper</code>, is a convention meaning "internal, do not rely on this from outside"; Python does not enforce it. A double leading underscore inside a class, as in <code>__balance</code>, triggers name mangling: the attribute is stored as <code>_ClassName__balance</code>, which avoids accidental clashes in subclasses. Names with double underscores on both sides, such as <code>__init__</code>, are special methods defined by the language.`,
      },
    ],
  },

  'comments-and-docstrings': {
    whyItMatters: `Code is read far more often than it is written, often by you some months later. A comment that explains why something is done saves that reader from working it out again, and a docstring is what an editor shows when someone hovers over your function. Both are part of writing code that other people can use.`,
    exercise: {
      prompt: `Add a docstring to the function so that the first <code>print</code> shows it, and complete the function so that the second <code>print</code> shows the area.

Expected output: <code>Return the area of a rectangle.</code> then <code>12</code>`,
      starterCode: `def area(width, height):
    # TODO: add the docstring "Return the area of a rectangle."
    # TODO: return the area
    pass


print(area.__doc__)
print(area(3, 4))`,
      hints: [
        'A docstring is a string written as the first statement inside the function, usually in triple quotes.',
        'A comment starting with <code>#</code> is not a docstring and is not stored in <code>__doc__</code>.',
      ],
      solution: `def area(width, height):
    """Return the area of a rectangle."""
    return width * height


print(area.__doc__)
print(area(3, 4))`,
    },
    quiz: [
      {
        question: 'Where does Python store the docstring of a function?',
        options: ['In a separate file', 'In the __name__ attribute', 'It is discarded', 'In the function\'s __doc__ attribute'],
        answer: 3,
        explanation: 'help() and editors read the text from __doc__.',
      },
      {
        question: 'How is a comment spanning several lines normally written?',
        options: ['With a # at the start of each line', 'Between /* and */', 'Between &lt;!-- and --&gt;', 'With // on each line'],
        answer: 0,
        explanation: 'Python has no block-comment syntax. Each line starts with #.',
      },
      {
        question: 'Which comment is the most useful?',
        options: ['# add 1 to i', '# retry three times because the payment API sometimes times out', '# loop over the list', '# this is a variable'],
        answer: 1,
        explanation: 'It gives the reason, which cannot be read from the code. The others repeat what the code already says.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a comment and a docstring?',
        answer: `A comment starts with <code>#</code>, is ignored by the interpreter, and is for people reading the source. A docstring is a string placed as the first statement of a module, class or function. Python keeps it in the object's <code>__doc__</code> attribute, so it is available at runtime to <code>help()</code>, editors and documentation generators.`,
      },
      {
        question: 'How can you read the documentation of a function from within Python?',
        answer: `Call <code>help(function)</code>, which prints the signature and the docstring, or read <code>function.__doc__</code> directly. In the REPL this is the quickest way to check how a built-in or library function is used.`,
      },
    ],
  },

  'input-and-output': {
    whyItMatters: `Nearly every program takes some input and shows some result. Two things catch every beginner: <code>input()</code> always gives back text, even when the user types a number, and output usually needs formatting to be readable. Both are solved with a few standard idioms.`,
    exercise: {
      prompt: `The variable <code>line</code> holds text in the form that <code>input()</code> would return if the user typed three numbers. Convert them to integers and print their sum, and their average to two decimal places.

Expected output: <code>Sum: 12</code> then <code>Average: 4.00</code>`,
      starterCode: `line = "3 4 5"  # what input() would return

# TODO: split the line and convert each part to an int
# TODO: print the sum
# TODO: print the average with two decimal places`,
      hints: [
        '<code>line.split()</code> gives a list of strings, and <code>map(int, ...)</code> converts each one.',
        'In an f-string, <code>{value:.2f}</code> shows two decimal places.',
      ],
      solution: `line = "3 4 5"  # what input() would return

numbers = list(map(int, line.split()))

total = sum(numbers)
print(f"Sum: {total}")
print(f"Average: {total / len(numbers):.2f}")`,
    },
    quiz: [
      {
        question: 'The user types <code>25</code> in response to <code>age = input()</code>. What is the type of <code>age</code>?',
        options: ['int', 'str', 'float', 'It depends on what was typed'],
        answer: 1,
        explanation: 'input() always returns a string. Convert it with int() or float().',
      },
      {
        question: 'What does <code>int("3.5")</code> do?',
        options: ['Returns 3', 'Returns 4', 'Returns 3.5', 'Raises ValueError'],
        answer: 3,
        explanation: 'int() accepts only text that is a whole number. Use float("3.5") first.',
      },
      {
        question: 'What does <code>f"{3.14159:.2f}"</code> produce?',
        options: ['3.14', '3.14159', '3.1', '03.14'],
        answer: 0,
        explanation: '.2f formats the number with two digits after the decimal point.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you read several numbers typed on one line?',
        answer: `Read the line, split it on whitespace and convert each piece: <code>numbers = list(map(int, input().split()))</code>. When the count is known, the values can be unpacked directly: <code>a, b = map(int, input().split())</code>.`,
      },
      {
        question: 'How do you make sure the user enters a valid number?',
        answer: `Ask inside a loop and attempt the conversion in a <code>try</code> block. If <code>int()</code> raises <code>ValueError</code>, show a message and ask again; when the conversion succeeds, leave the loop with <code>break</code>. Input from a user should never be assumed to be valid.`,
      },
    ],
  },

  'variables': {
    whyItMatters: `A variable in Python is a name attached to an object, not a box that holds a value. That one idea explains why no types are declared, why two names can refer to the same list, and why swapping two values takes a single line. It is the basis for understanding everything that follows about mutable and immutable data.`,
    exercise: {
      prompt: `Swap the values of the two variables without using a third variable, then print them.

Expected output: <code>10 5</code>`,
      starterCode: `a = 5
b = 10

# TODO: swap a and b in one line

print(a, b)`,
      hints: [
        'Python can assign to several names at once: <code>x, y = 1, 2</code>.',
        'The right-hand side is evaluated in full before anything is assigned, so <code>a, b = b, a</code> swaps them.',
      ],
      solution: `a = 5
b = 10

a, b = b, a

print(a, b)`,
    },
    quiz: [
      {
        question: 'Is this valid Python? <code>x = 5</code> followed by <code>x = "five"</code>',
        options: ['No, the type cannot change', 'Yes; the name simply refers to a new object of a different type', 'Only with a cast', 'Only inside a function'],
        answer: 1,
        explanation: 'The type belongs to the object, not to the name.',
      },
      {
        question: 'After <code>a = b = []</code> and <code>a.append(1)</code>, what is <code>b</code>?',
        options: ['[]', 'An error occurs', 'None', '[1]'],
        answer: 3,
        explanation: 'Both names refer to the same list, so a change through one is visible through the other.',
      },
      {
        question: 'Which name follows the PEP 8 convention for a variable?',
        options: ['UserName', 'userName', 'USERNAME', 'user_name'],
        answer: 3,
        explanation: 'Variables and functions use lower-case words joined by underscores.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between static and dynamic typing?',
        answer: `In a statically typed language such as Java, each variable is declared with a type, and the compiler rejects code that assigns a value of another type. In a dynamically typed language such as Python, a variable has no declared type; the value carries the type, and type errors appear when the offending line runs. Type hints can be added to Python code and checked by tools, but the interpreter does not enforce them.`,
      },
      {
        question: 'What happens in memory when you write b = a in Python?',
        answer: `No data is copied. The name <code>b</code> is bound to the same object that <code>a</code> refers to. For immutable objects such as numbers and strings this makes no practical difference, but for a mutable object such as a list, changing it through one name changes what the other name sees. A separate list requires an explicit copy, for example <code>b = a.copy()</code>.`,
      },
    ],
  },

  'data-types': {
    whyItMatters: `What you are allowed to do with a value depends on its type: you can add two numbers, but adding a number to text is an error. Many beginner bugs come from having a string where a number was expected. Being able to check a type quickly, and knowing the handful of built-in types, lets you read error messages and fix them.`,
    exercise: {
      prompt: `Print the name of the type of each value in the list, one per line.

Expected output: <code>int</code>, <code>float</code>, <code>str</code>, <code>bool</code>, <code>NoneType</code> (one per line)`,
      starterCode: `values = [42, 3.14, "hi", True, None]

for value in values:
    # TODO: print the name of the value's type
    pass`,
      hints: [
        '<code>type(value)</code> returns the type object.',
        'The plain name of a type is in its <code>__name__</code> attribute.',
      ],
      solution: `values = [42, 3.14, "hi", True, None]

for value in values:
    print(type(value).__name__)`,
    },
    quiz: [
      {
        question: 'What is the type of <code>1 + 2.0</code>?',
        options: ['float', 'int', 'str', 'It raises an error'],
        answer: 0,
        explanation: 'When an int and a float are combined, the result is a float.',
      },
      {
        question: 'What does <code>isinstance(True, int)</code> return?',
        options: ['It raises an error', 'False', 'None', 'True'],
        answer: 3,
        explanation: 'bool is a subclass of int, and True behaves as 1.',
      },
      {
        question: 'What does <code>None == False</code> evaluate to?',
        options: ['False', 'True', 'None', 'It raises an error'],
        answer: 0,
        explanation: 'None is falsy in a condition, but it is a distinct value and is equal only to itself.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between type() and isinstance()?',
        answer: `<code>type(x)</code> returns the exact class of the object. <code>isinstance(x, SomeClass)</code> returns true if the object is of that class or of any subclass, and it can test several classes at once with a tuple. <code>isinstance</code> is preferred for checks because code that works for a class should normally work for its subclasses too.`,
      },
      {
        question: 'Which built-in types are mutable and which are immutable?',
        answer: `Immutable types cannot be changed after creation: <code>int</code>, <code>float</code>, <code>bool</code>, <code>str</code>, <code>tuple</code> and <code>frozenset</code>. Mutable types can be changed in place: <code>list</code>, <code>dict</code> and <code>set</code>. The distinction matters when objects are shared between names or passed to functions, and only immutable objects can be dictionary keys.`,
      },
    ],
  },

  'literals': {
    whyItMatters: `A literal is a value written directly in the code, and Python has several ways to write the same kind of value. You will meet hexadecimal numbers in colour codes and file permissions, underscores in large numbers, and raw strings in file paths and regular expressions. Recognising these forms stops them from looking like mistakes.`,
    exercise: {
      prompt: `Print the sum of a binary, a hexadecimal and an octal number, then a large number written with underscores, then a Windows path written as a raw string.

Expected output: <code>56</code>, <code>1000000</code>, <code>C:\\new</code> (one per line)`,
      starterCode: `# TODO: print the sum of binary 1010, hexadecimal 1F and octal 17

# TODO: print one million, written with underscores for readability

# TODO: print the path C:\\new using a raw string`,
      hints: [
        'The prefixes are <code>0b</code> for binary, <code>0x</code> for hexadecimal and <code>0o</code> for octal.',
        'Without the <code>r</code> prefix, <code>\\n</code> inside a string is a line break.',
      ],
      solution: `print(0b1010 + 0x1F + 0o17)

print(1_000_000)

print(r"C:\\new")`,
    },
    quiz: [
      {
        question: 'What does <code>{}</code> create?',
        options: ['An empty set', 'An empty tuple', 'An empty list', 'An empty dictionary'],
        answer: 3,
        explanation: 'An empty set is written set().',
      },
      {
        question: 'What is the value of <code>0x10</code>?',
        options: ['16', '10', '2', '8'],
        answer: 0,
        explanation: 'The 0x prefix means hexadecimal, and 10 in base 16 is sixteen.',
      },
      {
        question: 'What is the effect of the underscores in <code>1_000_000</code>?',
        options: ['None; they only make the number easier to read', 'They multiply the parts', 'They make it a string', 'They cause a syntax error'],
        answer: 0,
        explanation: 'Underscores between digits are ignored by Python.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a raw string and when is it used?',
        answer: `A raw string is written with an <code>r</code> before the opening quote, and in it a backslash is an ordinary character, not the start of an escape sequence. It is used for regular expressions and Windows file paths, where backslashes are frequent and would otherwise each need to be doubled.`,
      },
      {
        question: 'What is the difference between a str literal and a bytes literal?',
        answer: `A <code>str</code>, written <code>"text"</code>, is a sequence of Unicode characters. A <code>bytes</code> object, written <code>b"text"</code>, is a sequence of raw bytes, each a number from 0 to 255. Files opened in binary mode and network connections deal in bytes; <code>encode()</code> converts a string to bytes and <code>decode()</code> converts back.`,
      },
    ],
  },

  'numbers-and-math': {
    whyItMatters: `Calculations involving money, measurements and percentages are in almost every application, and two behaviours surprise newcomers: the difference between <code>/</code> and <code>//</code>, and the small errors of floating-point arithmetic. A billing program that gets either wrong produces incorrect totals.`,
    exercise: {
      prompt: `Convert 135 minutes into hours and remaining minutes and print the result. Then add 0.1 and 0.2 exactly, using <code>Decimal</code>, and print the sum.

Expected output: <code>2 h 15 min</code> then <code>0.3</code>`,
      starterCode: `from decimal import Decimal

total_minutes = 135

# TODO: work out the hours and the remaining minutes, and print them as "2 h 15 min"

# TODO: add 0.1 and 0.2 using Decimal and print the result`,
      hints: [
        '<code>divmod(a, b)</code> returns the result of <code>a // b</code> and of <code>a % b</code> together.',
        'Create each <code>Decimal</code> from a string, as in <code>Decimal("0.1")</code>, not from a float.',
      ],
      solution: `from decimal import Decimal

total_minutes = 135

hours, minutes = divmod(total_minutes, 60)
print(f"{hours} h {minutes} min")

print(Decimal("0.1") + Decimal("0.2"))`,
    },
    quiz: [
      {
        question: 'What is the result of <code>7 / 2</code>?',
        options: ['3', '3.5', '4', '3.0'],
        answer: 1,
        explanation: 'The / operator always returns a float. Use // for whole-number division.',
      },
      {
        question: 'What is the result of <code>-7 // 2</code>?',
        options: ['-3', '-3.5', '-4', '3'],
        answer: 2,
        explanation: 'Floor division rounds down towards negative infinity, so -3.5 becomes -4.',
      },
      {
        question: 'What does <code>round(2.5)</code> return?',
        options: ['3', '2.0', '2.5', '2'],
        answer: 3,
        explanation: 'Python rounds a value exactly halfway to the nearest even number.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why is 0.1 + 0.2 not equal to 0.3 in Python?',
        answer: `Floats are stored in binary, and most decimal fractions, including 0.1 and 0.2, have no exact binary representation, so each is stored as a very close approximation. Their sum is <code>0.30000000000000004</code>. To compare floats use <code>math.isclose()</code>, and for money use <code>decimal.Decimal</code> created from strings, which is exact.`,
      },
      {
        question: 'What is the difference between /, // and %?',
        answer: `<code>/</code> is true division and always returns a float. <code>//</code> is floor division: it returns the quotient rounded down to a whole number. <code>%</code> returns the remainder, which has the same sign as the divisor. <code>divmod(a, b)</code> returns the last two together.`,
      },
    ],
  },

  'booleans-and-none': {
    whyItMatters: `Every <code>if</code> and <code>while</code> depends on whether a value counts as true or false, and in Python any value can be used as a condition. Knowing which values are falsy lets you write short, natural checks such as <code>if items:</code>, and knowing how to test for <code>None</code> correctly avoids a subtle class of bugs.`,
    exercise: {
      prompt: `Write a function that returns the name it is given, or <code>Guest</code> when the name is an empty string or <code>None</code>. Use the <code>or</code> operator, not an <code>if</code> statement.

Expected output: <code>Asha</code>, <code>Guest</code>, <code>Guest</code> (one per line)`,
      starterCode: `def display_name(name):
    # TODO: return the name, or "Guest" if the name is empty or None
    pass


print(display_name("Asha"))
print(display_name(""))
print(display_name(None))`,
      hints: [
        'An empty string and <code>None</code> are both falsy.',
        '<code>a or b</code> gives <code>a</code> if it is truthy, and otherwise <code>b</code>.',
      ],
      solution: `def display_name(name):
    return name or "Guest"


print(display_name("Asha"))
print(display_name(""))
print(display_name(None))`,
    },
    quiz: [
      {
        question: 'Which of these values is truthy?',
        options: ['"0"', '""', '[]', '0'],
        answer: 0,
        explanation: 'A string is falsy only when it is empty. "0" contains one character.',
      },
      {
        question: 'What is the recommended way to test whether <code>x</code> is <code>None</code>?',
        options: ['x == None', 'x is None', 'not x', 'x = None'],
        answer: 1,
        explanation: 'There is only one None object, so identity is the correct test. "not x" is also true for 0 and for empty collections.',
      },
      {
        question: 'What does <code>[] or "empty"</code> evaluate to?',
        options: ['[]', 'True', '"empty"', 'False'],
        answer: 2,
        explanation: 'or returns its first truthy operand, or the last operand if none is truthy.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Which values are considered false in Python?',
        answer: `<code>False</code>, <code>None</code>, zero of any numeric type, and empty containers and strings: <code>""</code>, <code>[]</code>, <code>()</code>, <code>{}</code>, <code>set()</code> and <code>range(0)</code>. Everything else is true. An object of your own class is true unless it defines <code>__bool__</code> or <code>__len__</code> to say otherwise.`,
      },
      {
        question: 'What is short-circuit evaluation?',
        answer: `<code>and</code> and <code>or</code> evaluate their right-hand operand only when needed. <code>a and b</code> stops and returns <code>a</code> if <code>a</code> is falsy; <code>a or b</code> stops and returns <code>a</code> if <code>a</code> is truthy. This makes guards such as <code>if user and user.is_active:</code> safe, because the second part is not evaluated when <code>user</code> is <code>None</code>.`,
      },
    ],
  },

  'type-casting': {
    whyItMatters: `Data arrives as text: from <code>input()</code>, from files, from web forms and from APIs. Before it can be used in a calculation it has to be converted, and the conversion can fail when the text is not what you expected. Handling that failure is the difference between a program that reports a problem and one that crashes.`,
    exercise: {
      prompt: `Write a function that converts text to an integer and returns a default value when the text is not a valid whole number.

Expected output: <code>42</code>, <code>0</code>, <code>7</code> (one per line)`,
      starterCode: `def to_int(text, default=0):
    # TODO: return the text converted to an int, or the default if that fails
    pass


print(to_int("42"))
print(to_int("4x"))
print(to_int("  7 "))`,
      hints: [
        '<code>int()</code> raises <code>ValueError</code> for text that is not a whole number.',
        '<code>int()</code> already ignores spaces before and after the digits.',
      ],
      solution: `def to_int(text, default=0):
    try:
        return int(text)
    except ValueError:
        return default


print(to_int("42"))
print(to_int("4x"))
print(to_int("  7 "))`,
    },
    quiz: [
      {
        question: 'What does <code>int(3.9)</code> return?',
        options: ['4', 'It raises an error', '3.9', '3'],
        answer: 3,
        explanation: 'int() cuts off the fractional part. It does not round.',
      },
      {
        question: 'What does <code>bool("False")</code> return?',
        options: ['False', 'True', 'None', 'It raises an error'],
        answer: 1,
        explanation: 'Any non-empty string is truthy, whatever its text says.',
      },
      {
        question: 'What does <code>"5" + 5</code> do?',
        options: ['Returns 10', 'Raises TypeError', 'Returns "55"', 'Returns "10"'],
        answer: 1,
        explanation: 'Python does not convert between text and numbers automatically. Convert one side explicitly.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between implicit and explicit type conversion?',
        answer: `Implicit conversion is done by Python without being asked, and only where no information is lost: an <code>int</code> combined with a <code>float</code> becomes a <code>float</code>. Explicit conversion, or casting, is requested by the programmer with a function such as <code>int()</code>, <code>float()</code>, <code>str()</code> or <code>list()</code>. Python never converts between strings and numbers implicitly.`,
      },
      {
        question: 'How do you convert the string "ff" to the number 255?',
        answer: `Pass the base as the second argument: <code>int("ff", 16)</code>. The same works for binary with base 2 and octal with base 8. In the other direction, <code>hex()</code>, <code>bin()</code> and <code>oct()</code> return the text form of a number in those bases.`,
      },
    ],
  },

  'operators': {
    whyItMatters: `Operators are how conditions and calculations are written, and a few of Python's behave differently from other languages: <code>and</code> and <code>or</code> are words, comparisons can be chained, and <code>is</code> is not the same as <code>==</code>. Mixing up the last pair is a classic bug that works in testing and fails later.`,
    exercise: {
      prompt: `Write a function that returns <code>True</code> for a leap year. A year is a leap year if it is divisible by 4, except that years divisible by 100 are leap years only if they are also divisible by 400.

Expected output: <code>True</code>, <code>False</code>, <code>True</code> (one per line)`,
      starterCode: `def is_leap(year):
    # TODO: return True if the year is a leap year
    pass


print(is_leap(2024))
print(is_leap(1900))
print(is_leap(2000))`,
      hints: [
        '<code>year % 4 == 0</code> is true when the year is divisible by 4.',
        'Combine the rules: divisible by 4 <code>and</code> (not divisible by 100 <code>or</code> divisible by 400).',
      ],
      solution: `def is_leap(year):
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)


print(is_leap(2024))
print(is_leap(1900))
print(is_leap(2000))`,
    },
    quiz: [
      {
        question: 'What is the value of <code>2 ** 3 ** 2</code>?',
        options: ['64', '36', '512', '12'],
        answer: 2,
        explanation: 'Exponentiation is evaluated from right to left: 3 ** 2 is 9, and 2 ** 9 is 512.',
      },
      {
        question: 'What is the value of <code>-7 % 3</code>?',
        options: ['-1', '1', '-2', '2'],
        answer: 3,
        explanation: 'In Python the remainder takes the sign of the divisor: -7 is 3 × (-3) + 2.',
      },
      {
        question: 'What does <code>1 &lt; 5 &lt; 3</code> evaluate to?',
        options: ['False', 'True', 'It raises an error', '1'],
        answer: 0,
        explanation: 'A chained comparison means 1 < 5 and 5 < 3, and the second part is false.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between == and is?',
        answer: `<code>==</code> compares values: two different list objects with the same contents are equal. <code>is</code> compares identity: it is true only when both names refer to the very same object. Use <code>==</code> for values and reserve <code>is</code> for <code>None</code>, <code>True</code> and <code>False</code>. Small integers and some strings are cached by the interpreter, so <code>is</code> may appear to work for them, but that must not be relied on.`,
      },
      {
        question: 'What do the and and or operators return?',
        answer: `They return one of their operands, not necessarily <code>True</code> or <code>False</code>. <code>a and b</code> returns <code>a</code> if it is falsy, otherwise <code>b</code>. <code>a or b</code> returns <code>a</code> if it is truthy, otherwise <code>b</code>. This is why <code>name or "Guest"</code> works as a way of supplying a default.`,
      },
    ],
  },

  'control-flow': {
    whyItMatters: `Without conditions and loops a program can only run the same statements once, in order. Deciding what to do and repeating work are what make it useful, and every later topic, from processing a list to handling web requests, is built from <code>if</code>, <code>for</code> and <code>while</code>.`,
    exercise: {
      prompt: `Using one loop over the numbers 1 to 20, work out the sum of the even numbers and count how many numbers are divisible by 3. Print both.

Expected output: <code>110</code> then <code>6</code>`,
      starterCode: `even_sum = 0
divisible_by_three = 0

# TODO: loop over the numbers 1 to 20 and update both variables

print(even_sum)
print(divisible_by_three)`,
      hints: [
        '<code>range(1, 21)</code> produces 1 to 20; the end value is not included.',
        'A number is even when <code>number % 2 == 0</code>. Use two separate <code>if</code> statements, since a number can satisfy both tests.',
      ],
      solution: `even_sum = 0
divisible_by_three = 0

for number in range(1, 21):
    if number % 2 == 0:
        even_sum += number
    if number % 3 == 0:
        divisible_by_three += 1

print(even_sum)
print(divisible_by_three)`,
    },
    quiz: [
      {
        question: 'Which numbers does <code>range(5)</code> produce?',
        options: ['1 to 5', '0 to 4', '0 to 5', '1 to 4'],
        answer: 1,
        explanation: 'range starts at 0 by default and stops before the end value.',
      },
      {
        question: 'In an <code>if / elif / else</code> chain, how many branches can run?',
        options: ['All whose conditions are true', 'At most one', 'Exactly two', 'None'],
        answer: 1,
        explanation: 'The first branch whose condition is true runs, and the rest are skipped.',
      },
      {
        question: 'What does the walrus operator <code>:=</code> do?',
        options: ['Compares two values', 'Divides and assigns', 'Declares a constant', 'Assigns a value to a name as part of an expression'],
        answer: 3,
        explanation: 'It allows a value to be stored and tested in the same line, for example in a while condition.',
      },
    ],
    interviewQuestions: [
      {
        question: 'When would you use a while loop instead of a for loop?',
        answer: `A <code>for</code> loop is used to go through the items of a collection or a known range. A <code>while</code> loop is used when the number of repetitions is not known in advance and depends on a condition: waiting for valid input, retrying an operation, or reading until there is no more data.`,
      },
      {
        question: 'What does range() return?',
        answer: `It returns a <code>range</code> object, not a list. The object produces its numbers one at a time when looped over, so <code>range(1_000_000)</code> uses almost no memory. It supports <code>len()</code>, indexing and <code>in</code>, and <code>list(range(5))</code> converts it to a list when one is needed.`,
      },
    ],
  },

  'conditional-statements-and-match': {
    whyItMatters: `Business rules are conditions: discounts by order size, access by role, grades by score. Writing them so that they are correct and still readable when there are ten of them is a real skill. Guard clauses and <code>match</code> are the tools that keep such code from becoming a deep nest of <code>if</code> statements.`,
    exercise: {
      prompt: `Write a function that returns a grade for a score: <code>A</code> for 90 or more, <code>B</code> for 75 or more, <code>C</code> for 50 or more, and <code>F</code> otherwise.

Expected output: <code>A</code>, <code>B</code>, <code>F</code> (one per line)`,
      starterCode: `def grade(score):
    # TODO: return "A", "B", "C" or "F"
    pass


print(grade(92))
print(grade(75))
print(grade(40))`,
      hints: [
        'Test the highest boundary first, then use <code>elif</code> for each lower one.',
        'Because the conditions are checked in order, <code>elif score &gt;= 75</code> is only reached when the score is below 90.',
      ],
      solution: `def grade(score):
    if score >= 90:
        return "A"
    elif score >= 75:
        return "B"
    elif score >= 50:
        return "C"
    else:
        return "F"


print(grade(92))
print(grade(75))
print(grade(40))`,
    },
    quiz: [
      {
        question: 'Which is a valid conditional expression?',
        options: ['x = b if a else c', 'x = a ? b : c', 'x = if a then b else c', 'x = a and then b'],
        answer: 0,
        explanation: 'The value comes first, then the condition, then the alternative.',
      },
      {
        question: 'In a <code>match</code> statement, what does <code>case _:</code> do?',
        options: ['Matches only an underscore', 'Matches anything; it is the default case', 'Ends the match', 'Raises an error'],
        answer: 1,
        explanation: 'The underscore is a wildcard and is placed last.',
      },
      {
        question: 'From which Python version is <code>match</code> available?',
        options: ['2.7', '3.6', '3.10', '3.12'],
        answer: 2,
        explanation: 'Structural pattern matching was added in Python 3.10.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Does Python have a switch statement?',
        answer: `Since Python 3.10 it has <code>match</code>, which is more powerful than a traditional switch: besides comparing with fixed values, a case can describe the shape of a list, dictionary or object and extract parts of it. In earlier versions the same job is done with an <code>if / elif</code> chain or with a dictionary that maps each value to a function.`,
      },
      {
        question: 'What is a guard clause?',
        answer: `A guard clause is a check at the start of a function that handles an invalid or special case and returns at once. With the special cases dealt with first, the main logic follows without being nested inside several <code>if</code> blocks, which makes the function easier to read.`,
      },
    ],
  },

  'loops-for-and-while': {
    whyItMatters: `Python's <code>for</code> loop goes through the items of a collection directly, without index arithmetic, and <code>enumerate</code> and <code>zip</code> cover the cases where you need a position or two lists at once. Using them is what makes code look like Python and not like another language translated word for word.`,
    exercise: {
      prompt: `Print each student's position, name and score. Use <code>enumerate</code> for the position and <code>zip</code> to pair each name with its score.

Expected output: <code>1. Asha - 82</code> then <code>2. Ravi - 91</code>`,
      starterCode: `names = ["Asha", "Ravi"]
scores = [82, 91]

# TODO: loop over the names and scores together, with a position starting at 1`,
      hints: [
        '<code>zip(names, scores)</code> yields pairs such as <code>("Asha", 82)</code>.',
        '<code>enumerate(..., start=1)</code> adds a counter. Unpack with <code>for position, (name, score) in ...</code>.',
      ],
      solution: `names = ["Asha", "Ravi"]
scores = [82, 91]

for position, (name, score) in enumerate(zip(names, scores), start=1):
    print(f"{position}. {name} - {score}")`,
    },
    quiz: [
      {
        question: 'Which numbers does <code>range(2, 10, 3)</code> produce?',
        options: ['2, 5, 8, 11', '2, 3, 4', '3, 6, 9', '2, 5, 8'],
        answer: 3,
        explanation: 'It starts at 2 and adds 3 each time, stopping before 10.',
      },
      {
        question: 'When does the <code>else</code> block of a loop run?',
        options: ['When the loop finishes without reaching a break', 'When the loop body raises an error', 'Every time round the loop', 'Only when the loop never runs'],
        answer: 0,
        explanation: 'It is skipped only when the loop is ended by break.',
      },
      {
        question: 'What does <code>zip([1, 2, 3], ["a", "b"])</code> yield?',
        options: ['Three pairs, the last with None', 'Two pairs; it stops at the shorter input', 'An error', 'Five single items'],
        answer: 1,
        explanation: 'zip stops as soon as one of its inputs runs out.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why is enumerate() preferred over range(len(items))?',
        answer: `<code>enumerate(items)</code> gives the index and the item together, so the loop body does not need to look the item up with <code>items[i]</code>. It is shorter, harder to get wrong, and works with any iterable, including ones that have no length or cannot be indexed.`,
      },
      {
        question: 'What is the use of the else clause on a loop?',
        answer: `It runs when the loop ends normally and is skipped when the loop is left with <code>break</code>. The typical use is a search: the loop breaks when the item is found, and the <code>else</code> block handles the case where it was not found, without needing a separate flag variable.`,
      },
    ],
  },

  'break-continue-and-pass': {
    whyItMatters: `Loops rarely run from the first item to the last without exception. You stop as soon as you have found what you were looking for, and you skip items that do not apply. <code>break</code> and <code>continue</code> express both directly, and they keep a loop from doing work that is no longer needed.`,
    exercise: {
      prompt: `Use <code>break</code> to print the first number in the first list that is divisible by 7. Then use <code>continue</code> to add up only the positive numbers in the second list, and print the total.

Expected output: <code>14</code> then <code>16</code>`,
      starterCode: `numbers = [3, 10, 14, 21, 5]

# TODO: print the first number divisible by 7, then stop looking

values = [4, -2, 7, -1, 5]
total = 0

# TODO: add up the values, skipping the negative ones with continue

print(total)`,
      hints: [
        'After printing the number, <code>break</code> ends the loop, so 21 is never reached.',
        '<code>continue</code> jumps to the next item, so the line that adds to the total is skipped for negative values.',
      ],
      solution: `numbers = [3, 10, 14, 21, 5]

for number in numbers:
    if number % 7 == 0:
        print(number)
        break

values = [4, -2, 7, -1, 5]
total = 0

for value in values:
    if value < 0:
        continue
    total += value

print(total)`,
    },
    quiz: [
      {
        question: 'In a loop inside another loop, what does <code>break</code> in the inner loop do?',
        options: ['Ends both loops', 'Ends the program', 'Ends only the inner loop', 'Skips one iteration'],
        answer: 2,
        explanation: 'break leaves the innermost loop that contains it. The outer loop carries on.',
      },
      {
        question: 'What does <code>pass</code> do?',
        options: ['Skips to the next iteration', 'Nothing; it fills a place where a statement is required', 'Exits the function', 'Raises an error'],
        answer: 1,
        explanation: 'It is used for an empty function, class or block that will be filled in later.',
      },
      {
        question: 'What does <code>continue</code> do?',
        options: ['Ends the loop', 'Does nothing', 'Restarts the loop from the beginning', 'Skips the rest of the current iteration and moves to the next one'],
        answer: 3,
        explanation: 'The loop itself goes on with the next item.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between break, continue and pass?',
        answer: `<code>break</code> ends the nearest enclosing loop immediately. <code>continue</code> ends only the current pass through the loop and goes on to the next item. <code>pass</code> does nothing at all; it exists because Python requires at least one statement in a block.`,
      },
      {
        question: 'How do you exit from several nested loops at once?',
        answer: `Python has no labelled break. The cleanest way is to put the loops in a function and use <code>return</code>, which leaves all of them. The alternatives are a flag variable that each outer loop checks, or raising and catching an exception, both of which are harder to read.`,
      },
    ],
  },

  'strings': {
    whyItMatters: `Names, messages, file contents, web pages and API responses are all text, so string handling is in every program. Slicing, splitting and joining are the operations used most, and because strings cannot be changed in place, knowing that each operation returns a new string prevents a very common mistake.`,
    exercise: {
      prompt: `Starting from the text below, print the number of words it contains, then the word <code>Python</code> reversed, then the words joined with hyphens.

Expected output: <code>3</code>, <code>nohtyP</code>, <code>Hello,-Python-World</code> (one per line)`,
      starterCode: `text = "  Hello, Python World  "

# TODO: split the text into words and print how many there are
# TODO: print the second word reversed
# TODO: print the words joined with "-"`,
      hints: [
        '<code>text.split()</code> with no argument splits on any whitespace and ignores the spaces at the ends.',
        'The slice <code>[::-1]</code> gives a reversed copy, and <code>"-".join(words)</code> joins a list of strings.',
      ],
      solution: `text = "  Hello, Python World  "

words = text.split()
print(len(words))
print(words[1][::-1])
print("-".join(words))`,
    },
    quiz: [
      {
        question: 'What happens when you run <code>s = "cat"</code> and then <code>s[0] = "b"</code>?',
        options: ['s becomes "bat"', 's becomes "b"', 'TypeError is raised, because strings are immutable', 'Nothing happens'],
        answer: 2,
        explanation: 'A string cannot be changed in place. Build a new one, for example "b" + s[1:].',
      },
      {
        question: 'What is the value of <code>"python"[-1]</code>?',
        options: ['p', 'n', 'o', 'It raises an error'],
        answer: 1,
        explanation: 'Negative indexes count from the end, so -1 is the last character.',
      },
      {
        question: 'What is the value of <code>"python"[1:4]</code>?',
        options: ['pyt', 'ytho', 'yth', 'pyth'],
        answer: 2,
        explanation: 'A slice includes the start index and stops before the end index: positions 1, 2 and 3.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you reverse a string in Python?',
        answer: `Use a slice with a step of -1: <code>text[::-1]</code>. It returns a new string with the characters in reverse order. <code>"".join(reversed(text))</code> does the same. There is no <code>reverse()</code> method on strings, because they are immutable.`,
      },
      {
        question: 'Why is join() preferred to + for building a string in a loop?',
        answer: `Strings are immutable, so each <code>+</code> creates a new string and copies everything built so far; doing this repeatedly in a loop becomes slow for many pieces. Collecting the pieces in a list and calling <code>"".join(pieces)</code> once builds the result in a single pass.`,
      },
    ],
  },

  'string-methods-reference': {
    whyItMatters: `Most text processing does not need a regular expression. The built-in string methods can clean, search, split and test text, and knowing what is available saves you from writing loops for things that are one method call. Cleaning user input and parsing lines of a file are everyday uses.`,
    exercise: {
      prompt: `Write a function that returns <code>True</code> if the text is a palindrome, ignoring upper and lower case and ignoring anything that is not a letter or a digit.

Expected output: <code>True</code> then <code>False</code>`,
      starterCode: `def is_palindrome(text):
    # TODO: keep only letters and digits, in lower case
    # TODO: return whether the result reads the same in both directions
    pass


print(is_palindrome("A man, a plan, a canal: Panama"))
print(is_palindrome("Python"))`,
      hints: [
        '<code>ch.isalnum()</code> is true for letters and digits, and <code>ch.lower()</code> gives the lower-case character.',
        'Join the kept characters into a string and compare it with its reverse, <code>cleaned[::-1]</code>.',
      ],
      solution: `def is_palindrome(text):
    cleaned = "".join(ch.lower() for ch in text if ch.isalnum())
    return cleaned == cleaned[::-1]


print(is_palindrome("A man, a plan, a canal: Panama"))
print(is_palindrome("Python"))`,
    },
    quiz: [
      {
        question: 'What does <code>"hello".find("z")</code> return?',
        options: ['None', 'It raises ValueError', '0', '-1'],
        answer: 3,
        explanation: 'find() returns -1 when the text is not found. index() raises ValueError in the same case.',
      },
      {
        question: 'What does <code>"hello world".title()</code> return?',
        options: ['Hello World', 'Hello world', 'HELLO WORLD', 'hello World'],
        answer: 0,
        explanation: 'title() capitalises the first letter of each word.',
      },
      {
        question: 'After <code>name = " asha "</code> and <code>name.strip()</code> on a line by itself, what is <code>name</code>?',
        options: ['"asha"', '" asha "', '"asha "', 'None'],
        answer: 1,
        explanation: 'String methods return a new string. The result must be assigned, as in name = name.strip().',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between find() and index()?',
        answer: `Both return the position of the first occurrence of a substring. When the substring is not present, <code>find()</code> returns <code>-1</code> and <code>index()</code> raises <code>ValueError</code>. To test only whether the text is present, the <code>in</code> operator is clearer than either.`,
      },
      {
        question: 'What is the difference between split() and partition()?',
        answer: `<code>split(sep)</code> breaks the string at every occurrence of the separator and returns a list of any length. <code>partition(sep)</code> breaks it at the first occurrence only and always returns three parts: the text before, the separator, and the text after. <code>partition</code> is convenient for a "key=value" line, since the result can always be unpacked into three names.`,
      },
    ],
  },

  'string-formatting': {
    whyItMatters: `Output meant for people has to be formatted: money with two decimal places, large numbers with separators, percentages, columns that line up. F-strings do all of this inside the string itself, and they are what you will see in current Python code, in log messages and reports alike.`,
    exercise: {
      prompt: `Print three formatted values: a receipt line with the item name padded with dots to 8 characters and the total padded with dots to 8 characters with two decimals; a large number with thousands separators and two decimals; and a ratio as a percentage with one decimal.

Expected output: <code>Pen........37.50</code>, <code>1,234,567.89</code>, <code>25.6%</code> (one per line)`,
      starterCode: `item = "Pen"
quantity = 3
price = 12.5

# TODO: print the item left-aligned and the total (quantity * price) right-aligned,
#       each in a width of 8, using "." as the fill character

# TODO: print 1234567.891 with thousands separators and two decimals

# TODO: print 0.256 as a percentage with one decimal`,
      hints: [
        'A format specification is written as fill, alignment, width: <code>{item:.&lt;8}</code> and <code>{total:.&gt;8.2f}</code>.',
        '<code>,</code> adds thousands separators and <code>%</code> multiplies by 100 and adds the sign: <code>{value:,.2f}</code>, <code>{ratio:.1%}</code>.',
      ],
      solution: `item = "Pen"
quantity = 3
price = 12.5

total = quantity * price
print(f"{item:.<8}{total:.>8.2f}")

print(f"{1234567.891:,.2f}")

print(f"{0.256:.1%}")`,
    },
    quiz: [
      {
        question: 'What does <code>f"{5:03d}"</code> produce?',
        options: ['5', '500', '005', '5.00'],
        answer: 2,
        explanation: 'The number is padded with zeros to a width of three.',
      },
      {
        question: 'With <code>x = 5</code>, what does <code>f"{x=}"</code> produce?',
        options: ['5', 'x', '{x=}', 'x=5'],
        answer: 3,
        explanation: 'The = form shows the expression and its value, which is useful for quick debugging.',
      },
      {
        question: 'How is a literal brace written inside an f-string?',
        options: ['By doubling it: {{ and }}', 'With a backslash before it', 'It cannot be done', 'With a % sign before it'],
        answer: 0,
        explanation: 'A doubled brace is printed as a single brace.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the ways to format a string in Python, and which is preferred?',
        answer: `There are three. The <code>%</code> operator, as in <code>"%s is %d" % (name, age)</code>, is the oldest. <code>str.format()</code>, as in <code>"{} is {}".format(name, age)</code>, is useful when the template is stored separately from the values. F-strings, as in <code>f"{name} is {age}"</code>, are the preferred form in current code: they are the most readable and the fastest, and they accept any expression inside the braces.`,
      },
      {
        question: 'Why should an f-string not be used to build an SQL query from user input?',
        answer: `The user's text becomes part of the query itself, so a crafted value can change what the query does; this is SQL injection. The query should contain placeholders, and the values should be passed separately to the database driver, which keeps them as data. The same caution applies to shell commands and HTML.`,
      },
    ],
  },
}
