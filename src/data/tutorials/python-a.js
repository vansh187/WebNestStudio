// Python Basics module — hand-written lesson content.
// Keys are topic slugs used throughout the Python learning module.
export const pythonContentA = {
  'syntax': {
    title: 'Python Syntax Basics',
    intro: `Python's syntax was deliberately designed to read almost like plain English while still being precise enough for a computer to execute. Unlike languages such as Java or C, Python does not use curly braces {} to mark blocks of code, and it does not require a semicolon at the end of every statement. Instead, Python uses indentation itself as part of the language's grammar.

This design choice — sometimes called the "off-side rule" — forces every Python program to be visually organized, which is one reason Python is popular for teaching, scripting, and data work. Learning to read and write correct indentation is the very first skill every Python programmer needs, because a misplaced space can change what your program does or stop it from running at all.`,
    sections: [
      {
        heading: 'Indentation Defines Blocks',
        body: `In Python, a colon (:) at the end of a line — after an if, for, while, def, class, or similar statement — signals that an indented block follows. All statements in that block must be indented by the same amount, conventionally four spaces. There are no braces to open or close a block; the indentation level itself marks where the block starts and ends.`,
        list: [
          'A block begins right after a line ending in a colon (:).',
          'Every line in the block must use consistent indentation (spaces are recommended; mixing tabs and spaces raises a TabError).',
          'Reducing the indentation level ends the block and returns control to the enclosing level.',
        ],
      },
      {
        heading: 'No Semicolons or Braces Required',
        body: `Python statements normally end at the end of the physical line — no semicolon is needed. A semicolon can technically be used to place multiple statements on one line, but this is discouraged by Python's style guide (PEP 8) because it hurts readability. Similarly, there are no braces {} anywhere in Python's control-flow syntax; parentheses () are used only for function calls, tuples, and grouping expressions.`,
      },
      {
        heading: 'The Python Interpreter',
        body: `Python is an interpreted language: source code in a .py file is read and executed line by line by the Python interpreter (CPython is the standard, most widely used implementation), rather than being compiled ahead of time into a standalone native executable. You can run a script with "python filename.py" from a terminal, or run Python interactively using the REPL (Read-Eval-Print Loop) by simply typing "python" or "python3", which lets you test expressions one at a time and see results immediately.`,
      },
      {
        heading: 'Comments',
        body: `A single-line comment starts with a hash symbol (#) and continues to the end of the line; the interpreter ignores everything after it. Python has no dedicated multi-line comment syntax, but a triple-quoted string (''' ... ''' or """ ... """) that is not assigned to anything is commonly used as a block comment, and the same triple-quoted syntax is also used for docstrings that document functions, classes, and modules.`,
      },
    ],
    examples: [
      {
        caption: 'Indentation-based blocks compared to a flat statement',
        code: `age = 20

# Comment: check whether age qualifies as an adult
if age >= 18:
    print("You are an adult")
    print("You can vote")
else:
    print("You are a minor")

print("This line always runs, regardless of the if/else")`,
        output: `You are an adult
You can vote
This line always runs, regardless of the if/else`,
      },
      {
        caption: 'Inconsistent indentation raises an IndentationError',
        code: `if True:
    print("First line indented with 4 spaces")
   print("Second line indented with only 3 spaces")`,
        output: `  File "<stdin>", line 3
    print("Second line indented with only 3 spaces")
                                                     ^
IndentationError: unindent does not match any outer indentation level`,
      },
    ],
    commonMistakes: [
      'Mixing tabs and spaces in the same block, which raises a TabError in Python 3 even if the code looks aligned in some editors.',
      'Forgetting the colon (:) at the end of an if, for, while, or def line — this raises a SyntaxError.',
      'Assuming indentation amount does not matter as long as it is "some" indentation — every line in the same block must match exactly.',
      'Writing multiple unrelated statements on one line with semicolons out of habit from other languages, which goes against PEP 8 style.',
    ],
    keyPoints: [
      'Python uses indentation, not braces, to define code blocks — indentation is part of the syntax, not just style.',
      'Statements end at the end of the line; semicolons are optional and rarely used.',
      'Python code runs through an interpreter (commonly CPython), either as a script or interactively via the REPL.',
      'Comments start with #; triple-quoted strings are used for docstrings and block-style comments.',
    ],
  },

  'variables': {
    title: 'Python Variables',
    intro: `A variable in Python is a name that refers to a value stored in memory. Unlike statically typed languages, Python does not require you to declare a variable's type in advance — you simply assign a value to a name, and Python figures out the type automatically at runtime. This is called dynamic typing.

Because variables in Python are really just labels pointing to objects, the same name can be reassigned to a value of a completely different type later in the program. This flexibility is powerful, but it also means naming variables clearly and consistently matters more in Python than in languages where the type is fixed by a declaration.`,
    sections: [
      {
        heading: 'Dynamic Typing',
        body: `When you write "x = 5", Python creates an integer object with value 5 and makes the name x refer to it. If you later write "x = \\"hello\\"", the name x now refers to a string object instead — no error occurs, and no type declaration was ever needed. The type is a property of the object, not of the variable name itself, which is why Python is described as "dynamically typed."`,
      },
      {
        heading: 'Variable Naming Rules',
        body: `Variable names in Python must start with a letter (a-z, A-Z) or an underscore (_), followed by any combination of letters, digits, and underscores. Names are case-sensitive (age and Age are different variables), and they cannot be a reserved keyword such as if, for, class, or return. By convention (PEP 8), variable names use lowercase words separated by underscores (snake_case), such as total_price or user_name.`,
        list: [
          'Valid: age, _count, user_name, total2',
          'Invalid: 2total (starts with a digit), user-name (hyphen not allowed), class (reserved keyword)',
          'Convention: use snake_case for variables and functions; UPPER_CASE for constants.',
        ],
      },
      {
        heading: 'Multiple Assignment',
        body: `Python allows several convenient assignment patterns in a single line. You can assign the same value to multiple names at once (a = b = c = 0), or assign different values to multiple names in one statement by unpacking a sequence (x, y, z = 1, 2, 3). This unpacking form also enables the classic one-line variable swap, "a, b = b, a", without needing a temporary variable.`,
      },
    ],
    examples: [
      {
        caption: 'Dynamic typing and multiple assignment',
        code: `x = 5
print(type(x), x)

x = "hello"
print(type(x), x)

a, b, c = 1, 2, 3
print(a, b, c)

a, b = b, a
print(a, b)`,
        output: `<class 'int'> 5
<class 'str'> hello
1 2 3
2 1`,
      },
    ],
    commonMistakes: [
      'Trying to use a variable before it has been assigned a value, which raises a NameError.',
      'Using a reserved keyword like "class" or "list" as a variable name, or shadowing a built-in name like "str" or "list" by accident.',
      'Assuming a variable "remembers" its original type after reassignment — Python variables have no fixed type; only the object they point to has a type.',
      'Starting a variable name with a digit or using invalid characters like hyphens or spaces.',
    ],
    keyPoints: [
      'Python variables are dynamically typed: no type declaration is required, and a name can be reassigned to a different type.',
      'Names must start with a letter or underscore, contain only letters/digits/underscores, and cannot be reserved keywords.',
      'PEP 8 convention is snake_case for variable names.',
      'Multiple assignment (a, b = 1, 2) and swapping (a, b = b, a) are idiomatic Python patterns.',
    ],
  },

  'data-types': {
    title: 'Python Data Types',
    intro: `Every value in Python has a type, and that type determines what operations are valid on it and how it behaves. Python's built-in data types cover whole numbers, decimal numbers, text, true/false logic, and the special "no value" marker, along with more advanced numeric and collection types.

Because Python is dynamically typed, you rarely declare types explicitly, but understanding exactly which type a value has is essential for avoiding subtle bugs — especially when mixing numbers and text, or comparing values of different types.`,
    sections: [
      {
        heading: 'Core Built-in Types',
        body: `Python provides several fundamental data types that cover the vast majority of everyday programming needs.`,
        list: [
          '<code>int</code> — whole numbers of arbitrary size, e.g. 42, -7, 1_000_000 (Python ints do not overflow like fixed-size integers in other languages).',
          '<code>float</code> — decimal (floating-point) numbers, e.g. 3.14, -0.5, 2.0.',
          '<code>str</code> — text, written in single, double, or triple quotes, e.g. "hello", \'Python\'.',
          '<code>bool</code> — the values True or False, used for logical conditions.',
          '<code>None</code> — a special singleton value representing "no value" or "nothing here," similar to null in other languages.',
          '<code>complex</code> — numbers with a real and imaginary part, written like 3+4j, used mainly in scientific computing.',
        ],
      },
      {
        heading: 'Checking Types at Runtime',
        body: `Because types are not declared, Python gives you two built-in tools to inspect them. <code>type(value)</code> returns the exact type of a value, which is useful for debugging and quick inspection. <code>isinstance(value, Type)</code> checks whether a value is an instance of a given type (or one of several types passed as a tuple), and is generally preferred in real code because it also correctly recognizes subclasses.`,
      },
      {
        heading: 'Implicit and Explicit Conversion',
        body: `Python automatically converts (promotes) an int to a float when the two are combined in an arithmetic expression, such as 3 + 2.0 producing 5.0. Converting between unrelated types — such as text to a number — must be done explicitly using functions like int(), float(), and str(), and will raise a ValueError if the text cannot be interpreted as that type.`,
      },
    ],
    examples: [
      {
        caption: 'Inspecting types with type() and isinstance()',
        code: `age = 25
price = 19.99
name = "Alice"
is_member = True
address = None

print(type(age), type(price), type(name), type(is_member), type(address))
print(isinstance(age, int))
print(isinstance(price, (int, float)))
print(int("42") + 8)
print(str(3.14) + " is pi rounded")`,
        output: `<class 'int'> <class 'float'> <class 'str'> <class 'bool'> <class 'NoneType'>
True
True
50
3.14 is pi rounded`,
      },
    ],
    commonMistakes: [
      'Trying to combine a string and a number with + directly (e.g. "Age: " + 25), which raises a TypeError — the number must be converted with str() first.',
      'Using type(x) == int for type checks instead of isinstance(x, int), which fails to account for subclasses like bool (which is technically a subclass of int).',
      'Assuming int() on a non-numeric string like int("abc") will return 0 instead of raising a ValueError.',
      'Confusing None with False, 0, or an empty string — None specifically means "no value," and while all of these are "falsy," they are not equal to None.',
    ],
    keyPoints: [
      'Core built-in types: int, float, str, bool, None, and complex.',
      'type() reports the exact type; isinstance() checks membership, including subclasses, and is preferred for type checks.',
      'Numeric types mix automatically in expressions (int + float -> float); other conversions must be explicit.',
      'None is a distinct singleton value meaning "no value," not the same as 0, False, or an empty string.',
    ],
  },

  'operators': {
    title: 'Python Operators',
    intro: `Operators are symbols that tell Python to perform a specific computation or comparison on one or more values. Python groups operators into families — arithmetic, comparison, and logical — and each family has its own rules and behaviors that are important to get exactly right.

One area where Python differs noticeably from many other languages is division: Python has two distinct division operators, one that always returns a float-style result and one that always rounds down to a whole number, and mixing them up is a very common source of bugs.`,
    sections: [
      {
        heading: 'Arithmetic Operators',
        body: `Python supports the standard arithmetic operators: <code>+</code> (addition), <code>-</code> (subtraction), <code>*</code> (multiplication), <code>/</code> (true division, always returns a float), <code>//</code> (floor division, rounds down to the nearest whole number), <code>%</code> (modulus, the remainder after division), and <code>**</code> (exponentiation, e.g. 2 ** 3 is 8). Floor division and modulus both follow the sign of the divisor, which can produce results that surprise programmers coming from other languages when negative numbers are involved.`,
      },
      {
        heading: 'Comparison Operators',
        body: `Comparison operators — <code>== != > < >= <=</code> — compare two values and always produce a bool (True or False). <code>==</code> checks for equality of value, not identity; to check whether two names refer to the literally same object in memory, Python provides a separate keyword, <code>is</code>.`,
      },
      {
        heading: 'Logical Operators',
        body: `Python spells out its logical operators as words rather than symbols: <code>and</code>, <code>or</code>, and <code>not</code>. Like most languages, <code>and</code> and <code>or</code> short-circuit — Python stops evaluating as soon as the overall result is determined, which matters when the right-hand expression has a side effect or could raise an error.`,
      },
    ],
    examples: [
      {
        caption: 'True division vs. floor division, modulus, and exponentiation',
        code: `print(7 / 2)     # true division, always float
print(7 // 2)    # floor division, rounds down
print(7 % 2)     # modulus/remainder
print(2 ** 5)    # exponentiation
print(-7 // 2)   # floor division rounds toward negative infinity
print(-7 % 2)    # follows the sign of the divisor`,
        output: `3.5
3
1
32
-4
1`,
      },
      {
        caption: 'Short-circuit logical operators and comparison chaining',
        code: `age = 20
has_id = False

print(age >= 18 and has_id)
print(age >= 18 or has_id)
print(not has_id)

# Python allows chained comparisons
print(1 < age < 65)`,
        output: `False
True
True
True`,
      },
    ],
    commonMistakes: [
      'Using / when floor division (//) was intended, producing an unexpected float where a whole number was needed (or vice versa).',
      'Forgetting that -7 // 2 is -4, not -3 — Python floor division always rounds toward negative infinity, not toward zero.',
      'Using == to check whether two variables point to the exact same object instead of the "is" operator, or vice versa.',
      'Writing "if x = 5:" out of habit from other languages — Python uses = only for assignment and == for comparison; using = in a condition is a SyntaxError.',
    ],
    keyPoints: [
      '/ always returns a float (true division); // performs floor division and rounds toward negative infinity.',
      '% returns the remainder and follows the sign of the divisor; ** performs exponentiation.',
      'Logical operators are the words and, or, not, and and/or short-circuit evaluation.',
      'Use == for value equality and "is" for object identity — they are not interchangeable.',
    ],
  },

  'control-flow': {
    title: 'Python Control Flow: Conditionals and Loops',
    intro: `Control flow statements determine the order in which a program's instructions execute — whether a block runs at all, and how many times it repeats. Python provides conditional branching with if/elif/else, and two looping constructs: for loops (for iterating over a known sequence) and while loops (for repeating while a condition holds).

Because Python has no switch statement in most of its history, if/elif chains carry more weight than in some other languages, and Python's for loop is fundamentally different from a C-style counting loop — it iterates directly over the items of any iterable rather than manually managing an index.`,
    sections: [
      {
        heading: 'if / elif / else',
        body: `An if statement evaluates a condition; if it is truthy, its indented block runs. Any number of elif ("else if") branches can follow to check additional conditions in order, and an optional final else branch runs only if none of the previous conditions matched. Only the first matching branch executes — Python does not fall through to later branches the way some other languages' switch statements can.`,
      },
      {
        heading: 'for Loops and range()',
        body: `A for loop in Python iterates directly over the elements of an iterable — a string, list, tuple, dictionary, or any other iterable object — assigning each element to the loop variable in turn. To loop a specific number of times or generate a numeric sequence, Python provides the built-in <code>range()</code> function: range(5) produces 0 through 4, range(2, 10) produces 2 through 9, and range(0, 10, 2) produces 0, 2, 4, 6, 8 (start, stop, step).`,
      },
      {
        heading: 'while Loops and break / continue',
        body: `A while loop repeats its block as long as its condition remains truthy, and is best suited to situations where the number of iterations is not known in advance. Inside any loop, <code>break</code> immediately exits the loop entirely, while <code>continue</code> skips the rest of the current iteration and moves on to the next one.`,
      },
      {
        heading: 'The Walrus Operator',
        body: `Python 3.8 introduced the walrus operator, <code>:=</code>, which assigns a value to a name as part of a larger expression, rather than requiring a separate assignment statement first. It is most often used to avoid computing or calling something twice, for example inside a while loop's condition: <code>while (line := input()) != "quit":</code> assigns and tests line in one step.`,
      },
    ],
    examples: [
      {
        caption: 'if/elif/else grading logic, plus a for loop using range()',
        code: `score = 82

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print("Grade:", grade)

for i in range(0, 10, 2):
    if i == 6:
        continue
    print(i)`,
        output: `Grade: B
0
2
4
8`,
      },
      {
        caption: 'A while loop with break, and the walrus operator',
        code: `count = 0
while True:
    count += 1
    if count > 3:
        break
    print("count is", count)

numbers = [1, 2, 3, 4, 5]
total = 0
i = 0
while (n := numbers[i]) < 5:
    total += n
    i += 1
print("total before hitting 5:", total)`,
        output: `count is 1
count is 2
count is 3
total before hitting 5: 10`,
      },
    ],
    commonMistakes: [
      'Forgetting that range(stop) is exclusive of stop — range(5) gives 0 through 4, not 0 through 5.',
      'Writing an infinite while loop by forgetting to update the loop\'s condition variable inside the block.',
      'Confusing break (exits the loop entirely) with continue (skips only the current iteration).',
      'Overusing the walrus operator in places where a plain assignment on its own line would be clearer.',
    ],
    keyPoints: [
      'if/elif/else runs at most one matching branch; there is no automatic fall-through between branches.',
      'for loops iterate directly over an iterable; range() generates numeric sequences for counting loops.',
      'while loops repeat based on a condition and are suited to cases where the iteration count is not known ahead of time.',
      'break exits a loop entirely, continue skips to the next iteration, and := (walrus) assigns within an expression.',
    ],
  },

  'functions': {
    title: 'Python Functions',
    intro: `A function is a named, reusable block of code that performs a specific task. Functions let you avoid repeating yourself, organize a program into logical pieces, and give each piece a clear name and purpose. In Python, functions are defined with the <code>def</code> keyword and are themselves first-class objects — they can be assigned to variables, passed as arguments, and returned from other functions.

Python's function syntax also supports flexible argument handling that goes well beyond a fixed parameter list, including default values and mechanisms for accepting an arbitrary number of arguments, which makes Python functions unusually adaptable compared to many statically typed languages.`,
    sections: [
      {
        heading: 'Defining Functions and return',
        body: `A function is defined with <code>def function_name(parameters):</code> followed by an indented block. The <code>return</code> statement sends a value back to the caller and immediately exits the function; a function with no explicit return statement (or a bare "return") returns None automatically. Parameters listed in the def line become local variables inside the function body.`,
      },
      {
        heading: 'Default Arguments',
        body: `A parameter can be given a default value in the function definition, e.g. <code>def greet(name, greeting="Hello"):</code>. If the caller omits that argument, the default is used; if the caller supplies it, the supplied value overrides the default. Default argument values are evaluated only once, when the function is defined — using a mutable default like a list can lead to a well-known and surprising bug.`,
      },
      {
        heading: '*args and **kwargs',
        body: `To accept an arbitrary number of positional arguments, a parameter prefixed with a single asterisk, <code>*args</code>, collects any extra positional arguments into a tuple. To accept an arbitrary number of keyword arguments, a parameter prefixed with two asterisks, <code>**kwargs</code>, collects them into a dictionary of name-value pairs. These are commonly combined with regular parameters to build flexible, general-purpose functions.`,
      },
      {
        heading: 'Docstrings',
        body: `A docstring is a string literal — typically triple-quoted — placed as the very first statement inside a function, class, or module, describing what it does. Unlike an ordinary comment, a docstring is stored by Python as the object's <code>__doc__</code> attribute and can be retrieved at runtime with <code>help(function_name)</code> or <code>function_name.__doc__</code>, which is why writing clear docstrings matters for any code others will use.`,
      },
    ],
    examples: [
      {
        caption: 'Default arguments, *args, and **kwargs together',
        code: `def describe_pet(name, species="dog", *tags, **details):
    """Print a description of a pet using flexible arguments."""
    print(f"{name} is a {species}.")
    if tags:
        print("Tags:", ", ".join(tags))
    for key, value in details.items():
        print(f"{key}: {value}")

describe_pet("Rex")
describe_pet("Milo", "cat", "friendly", "indoor", age=3, color="black")`,
        output: `Rex is a dog.
Milo is a cat.
Tags: friendly, indoor
age: 3
color: black`,
      },
      {
        caption: 'A function with a return value and a docstring',
        code: `def area_of_circle(radius):
    """Return the area of a circle given its radius."""
    pi = 3.14159
    return pi * radius ** 2

result = area_of_circle(4)
print(result)
print(area_of_circle.__doc__)`,
        output: `50.26544
Return the area of a circle given its radius.`,
      },
    ],
    commonMistakes: [
      'Using a mutable object like a list or dict as a default argument value, which is shared across all calls instead of being freshly created each time.',
      'Forgetting that a function without a return statement returns None, and then trying to use that None as if it were a meaningful result.',
      'Mixing up the order of parameters — positional parameters, then *args, then keyword-only/default parameters, then **kwargs — which causes a SyntaxError if arranged incorrectly.',
      'Writing an ordinary comment instead of a proper triple-quoted docstring as the first line of a function meant to be documented.',
    ],
    keyPoints: [
      'Functions are defined with def and can return a value with return; no return means the function returns None.',
      'Default argument values let callers omit certain arguments, but mutable defaults are evaluated once and shared — a classic pitfall.',
      '*args collects extra positional arguments into a tuple; **kwargs collects extra keyword arguments into a dictionary.',
      'A triple-quoted docstring as the first statement in a function documents it and is accessible via help() or __doc__.',
    ],
  },

  'lists-tuples-sets-dictionaries': {
    title: 'Python Lists, Tuples, Sets, and Dictionaries',
    intro: `Python provides four core built-in collection types, and choosing the right one is one of the most practical skills in the language. Lists and dictionaries are mutable and extremely common for everyday data manipulation; tuples are immutable and useful for fixed groupings of values; sets are unordered collections optimized for membership testing and eliminating duplicates.

Understanding exactly which of these types can be changed after creation — and which cannot — prevents an entire category of bugs, especially when a collection is passed around and modified in multiple places in a program.`,
    sections: [
      {
        heading: 'Lists — Ordered and Mutable',
        body: `A list is an ordered, mutable collection written with square brackets, e.g. [1, 2, 3]. You can add, remove, or change elements after creation using methods like append(), remove(), insert(), and pop(), or by assigning directly to an index. Lists can hold mixed types and can be nested inside one another.`,
      },
      {
        heading: 'Tuples — Ordered and Immutable',
        body: `A tuple is an ordered, immutable collection written with parentheses, e.g. (1, 2, 3). Once created, a tuple's contents cannot be changed, added to, or removed — attempting to do so raises a TypeError. Tuples are commonly used for fixed groupings of related values (like coordinates) and as dictionary keys, since they are hashable as long as their contents are hashable, unlike lists.`,
      },
      {
        heading: 'Sets — Unordered and Unique',
        body: `A set is an unordered collection of unique, hashable elements, written with curly braces, e.g. {1, 2, 3}, or created from another iterable with set(). Sets automatically discard duplicates and support fast membership testing (x in my_set) and mathematical set operations like union (|), intersection (&), and difference (-). Sets are mutable, but their elements must themselves be immutable/hashable.`,
      },
      {
        heading: 'Dictionaries — Key-Value Pairs',
        body: `A dictionary maps unique keys to values, written with curly braces containing key: value pairs, e.g. {"name": "Alice", "age": 30}. Dictionaries are mutable — you can add, update, or delete key-value pairs after creation — and since Python 3.7, they preserve insertion order. Values are accessed by key rather than by numeric position: my_dict["name"] rather than my_dict[0].`,
      },
      {
        heading: 'Indexing and Slicing',
        body: `Lists and tuples (both ordered sequences) support indexing with square brackets, where index 0 is the first element and -1 is the last. Slicing with the syntax [start:stop:step] extracts a sub-sequence without modifying the original — start is inclusive, stop is exclusive, and step controls the interval (a negative step reverses direction). Sets and dictionaries, being unordered by concept, do not support indexing or slicing.`,
      },
    ],
    examples: [
      {
        caption: 'Mutability differences between a list and a tuple',
        code: `fruits = ["apple", "banana", "cherry"]
fruits.append("date")
fruits[0] = "avocado"
print(fruits)

coordinates = (10, 20)
try:
    coordinates[0] = 99
except TypeError as e:
    print("Error:", e)`,
        output: `['avocado', 'banana', 'cherry', 'date']
Error: 'tuple' object does not support item assignment`,
      },
      {
        caption: 'Sets for uniqueness, dictionaries for key-based lookup, and slicing',
        code: `numbers = [1, 2, 2, 3, 3, 3, 4]
unique_numbers = set(numbers)
print(unique_numbers)

person = {"name": "Sam", "age": 25}
person["city"] = "Austin"
print(person)

letters = ["a", "b", "c", "d", "e"]
print(letters[1:4])
print(letters[::-1])`,
        output: `{1, 2, 3, 4}
{'name': 'Sam', 'age': 25, 'city': 'Austin'}
['b', 'c', 'd']
['e', 'd', 'c', 'b', 'a']`,
      },
    ],
    commonMistakes: [
      'Trying to modify a tuple in place (e.g. my_tuple[0] = 5), forgetting that tuples are immutable and raise a TypeError.',
      'Assuming a set preserves insertion order or supports indexing — sets are unordered and do not support my_set[0].',
      'Accessing a dictionary key that does not exist with square brackets and getting a KeyError, instead of using .get(key, default) for a safe lookup.',
      'Confusing slice bounds — forgetting that the stop index in a slice is exclusive, so letters[1:4] returns indices 1, 2, and 3, not 4.',
    ],
    keyPoints: [
      'Lists ([]) are ordered and mutable; tuples (()) are ordered and immutable.',
      'Sets ({}) store unique, unordered, hashable elements and support fast membership tests and set algebra.',
      'Dictionaries ({key: value}) map unique keys to values and preserve insertion order since Python 3.7.',
      'Indexing and slicing ([start:stop:step]) work on ordered sequences like lists, tuples, and strings, but not on sets or dictionaries.',
    ],
  },

  'comprehensions': {
    title: 'Python Comprehensions and Generator Expressions',
    intro: `Comprehensions are a concise, expressive way to build a new list, dictionary, or set from an existing iterable, in a single readable line instead of a multi-line for loop with an accumulator variable. They are one of the most distinctively "Pythonic" features of the language.

Closely related is the generator expression, which uses similar syntax but produces values lazily, one at a time, instead of building the entire collection in memory at once — an important distinction when working with large or infinite sequences.`,
    sections: [
      {
        heading: 'List Comprehensions',
        body: `A list comprehension has the form <code>[expression for item in iterable if condition]</code>, where the "if condition" part is optional. It produces a new list by evaluating the expression once for every item in the iterable that satisfies the condition. This replaces the common pattern of creating an empty list and calling .append() inside a for loop.`,
      },
      {
        heading: 'Dictionary and Set Comprehensions',
        body: `The same pattern extends to dictionaries and sets using curly braces. A dictionary comprehension, <code>{key_expr: value_expr for item in iterable}</code>, builds a new dictionary. A set comprehension, <code>{expression for item in iterable}</code>, builds a new set and automatically removes duplicates, just like the set() constructor would.`,
      },
      {
        heading: 'Generator Expressions',
        body: `A generator expression looks almost identical to a list comprehension but uses parentheses instead of square brackets: <code>(expression for item in iterable)</code>. Rather than building the whole result in memory immediately, it returns a generator object that produces each value on demand as you iterate over it, which makes it far more memory-efficient for large datasets or when you only need to consume the values once.`,
      },
    ],
    examples: [
      {
        caption: 'List, dictionary, and set comprehensions',
        code: `numbers = [1, 2, 3, 4, 5, 6]

squares = [n ** 2 for n in numbers]
print(squares)

evens_only = [n for n in numbers if n % 2 == 0]
print(evens_only)

square_map = {n: n ** 2 for n in numbers}
print(square_map)

remainders = {n % 3 for n in numbers}
print(remainders)`,
        output: `[1, 4, 9, 16, 25, 36]
[2, 4, 6]
{1: 1, 2: 4, 3: 9, 4: 16, 5: 25, 6: 36}
{0, 1, 2}`,
      },
      {
        caption: 'A generator expression computes values lazily',
        code: `numbers = [1, 2, 3, 4, 5]

gen = (n ** 2 for n in numbers)
print(type(gen))
print(sum(gen))          # generator is consumed here
print(sum(gen))          # already exhausted, nothing left`,
        output: `<class 'generator'>
55
0`,
      },
    ],
    commonMistakes: [
      'Writing an overly complex comprehension with several nested loops and conditions, which becomes harder to read than a plain for loop — comprehensions should stay simple.',
      'Trying to reuse a generator expression after it has already been fully consumed, forgetting that a generator can only be iterated once.',
      'Confusing a set comprehension {x for x in ...} with a dictionary comprehension {k: v for ...} — the presence of a colon is what makes it a dictionary.',
      'Using a list comprehension purely for its side effects (like calling print inside it) instead of using a plain for loop, which wastes the memory of building a throwaway list.',
    ],
    keyPoints: [
      'List comprehensions [expr for item in iterable if cond] build a new list concisely from an existing iterable.',
      'The same bracket-swap pattern produces dictionary ({k: v for ...}) and set ({expr for ...}) comprehensions.',
      'Generator expressions (expr for item in iterable) use parentheses and produce values lazily, saving memory.',
      'A generator can only be iterated through once; after it is exhausted, it yields nothing further.',
    ],
  },

  'strings': {
    title: 'Python Strings',
    intro: `Strings are one of the most frequently used data types in Python, representing sequences of text characters. Python strings are immutable, meaning that once created, a string's characters cannot be changed in place — any operation that appears to "modify" a string actually creates and returns a brand-new string.

Python offers rich, readable tools for building and manipulating text, from the modern f-string syntax for embedding expressions directly into text, to a large set of built-in string methods for searching, splitting, joining, and cleaning up text data.`,
    sections: [
      {
        heading: 'f-strings',
        body: `Formatted string literals, or f-strings, are written by placing an "f" before the opening quote, and they let you embed any expression directly inside curly braces: <code>f"Hello, {name}! You are {age} years old."</code>. The expression inside the braces is evaluated at runtime and converted to its string form automatically, and f-strings also support format specifiers for things like decimal precision, e.g. <code>f"{price:.2f}"</code>.`,
      },
      {
        heading: 'Indexing and Slicing Strings',
        body: `Since a string is an ordered sequence of characters, it supports the same indexing and slicing rules as a list: <code>text[0]</code> gets the first character, <code>text[-1]</code> gets the last, and <code>text[2:5]</code> extracts a substring from index 2 up to (but not including) index 5. Because strings are immutable, slicing always returns a new string rather than a view into the original.`,
      },
      {
        heading: 'Common String Methods',
        body: `Python strings come with many useful built-in methods, all of which return a new string or value rather than modifying the original.`,
        list: [
          '<code>split(sep)</code> — breaks a string into a list of substrings using sep as the delimiter (whitespace by default).',
          '<code>join(iterable)</code> — the reverse of split; joins the elements of an iterable of strings using the original string as the separator, e.g. ", ".join(["a", "b", "c"]).',
          '<code>strip()</code> — removes leading and trailing whitespace (or specified characters) from a string; lstrip() and rstrip() trim only one side.',
          '<code>format()</code> — an older but still-used way to embed values into a string, e.g. "{} is {} years old".format(name, age).',
          '<code>upper()</code>, <code>lower()</code>, <code>replace(old, new)</code>, and <code>startswith()</code>/<code>endswith()</code> round out the most commonly used methods.',
        ],
      },
    ],
    examples: [
      {
        caption: 'f-strings, indexing, and slicing',
        code: `name = "Priya"
age = 29
price = 49.5

print(f"Hello, {name}! You are {age} years old.")
print(f"Price: {price:.2f}")

text = "Programming"
print(text[0], text[-1])
print(text[3:7])
print(text[::-1])`,
        output: `Hello, Priya! You are 29 years old.
Price: 49.50
P g
gram
gnimmargorP`,
      },
      {
        caption: 'split, join, and strip in action',
        code: `sentence = "  the quick brown fox  "
cleaned = sentence.strip()
print(f"'{cleaned}'")

words = cleaned.split()
print(words)

joined = "-".join(words)
print(joined)

print("Python".upper())
print("Python".replace("y", "Y"))`,
        output: `'the quick brown fox'
['the', 'quick', 'brown', 'fox']
the-quick-brown-fox
PYTHON
PYthon`,
      },
    ],
    commonMistakes: [
      'Trying to modify a string in place, such as text[0] = "P", forgetting that strings are immutable and this raises a TypeError.',
      'Calling a string method and forgetting to capture its return value, since methods like strip() and replace() return a new string rather than changing the original.',
      'Forgetting that slicing\'s stop index is exclusive, leading to off-by-one substrings.',
      'Mixing up split() (string to list) and join() (list to string), or calling join() on the list instead of on the separator string.',
    ],
    keyPoints: [
      'Python strings are immutable; every "modifying" operation returns a new string.',
      'f-strings (f"...{expr}...") are the modern, readable way to embed expressions and formatting into text.',
      'Strings support indexing and slicing just like lists, since they are ordered sequences of characters.',
      'split(), join(), strip(), and format() are among the most commonly used string methods for real-world text processing.',
    ],
  },

  'files': {
    title: 'Python File Handling',
    intro: `Reading from and writing to files lets a Python program persist data beyond a single run, or process data that already exists on disk. Python's built-in <code>open()</code> function is the entry point for all file operations, returning a file object that supports reading, writing, and iteration.

The recommended way to work with files in Python is the <code>with</code> statement, which guarantees the file is properly closed as soon as the block finishes — even if an error occurs partway through — without requiring you to remember to call close() manually.`,
    sections: [
      {
        heading: 'Opening Files and Modes',
        body: `<code>open(filename, mode)</code> opens a file and returns a file object. The mode string controls how the file is accessed.`,
        list: [
          '<code>"r"</code> — read (default); the file must already exist, or a FileNotFoundError is raised.',
          '<code>"w"</code> — write; creates the file if it does not exist, and completely overwrites (truncates) it if it does.',
          '<code>"a"</code> — append; creates the file if it does not exist, and adds new content to the end without erasing what is already there.',
          '<code>"r+"</code> — read and write, without truncating the existing content.',
          'Adding "b" to any mode (e.g. "rb", "wb") opens the file in binary mode instead of text mode.',
        ],
      },
      {
        heading: 'The with Statement (Context Manager)',
        body: `Writing <code>with open("data.txt", "r") as f:</code> opens the file and binds it to the name f for the duration of the indented block. When the block ends — normally or due to an exception — Python automatically calls f.close() for you. This pattern is strongly preferred over manually calling open() and close(), because a forgotten close() can leave a file locked or its buffered writes unflushed.`,
      },
      {
        heading: 'Reading and Writing Content',
        body: `Inside a "with" block opened for reading, <code>f.read()</code> returns the entire file's contents as one string, <code>f.readline()</code> reads a single line at a time, and <code>f.readlines()</code> returns a list of all lines; you can also iterate directly over the file object line by line with a for loop, which is the most memory-efficient option for large files. For writing, <code>f.write(text)</code> writes a string to the file (it does not add a newline automatically, unlike print()).`,
      },
    ],
    examples: [
      {
        caption: 'Writing to a file, then reading it back line by line',
        code: `with open("notes.txt", "w") as f:
    f.write("First line\\n")
    f.write("Second line\\n")
    f.write("Third line\\n")

with open("notes.txt", "r") as f:
    for line in f:
        print(line.strip())`,
        output: `First line
Second line
Third line`,
      },
      {
        caption: 'Appending to an existing file and reading the full contents at once',
        code: `with open("notes.txt", "a") as f:
    f.write("Fourth line\\n")

with open("notes.txt", "r") as f:
    contents = f.read()

print(contents)`,
        output: `First line
Second line
Third line
Fourth line
`,
      },
    ],
    commonMistakes: [
      'Opening a file with mode "w" when "a" (append) was intended, which silently erases the file\'s previous contents.',
      'Forgetting to use "with" and manually calling open()/close(), then leaking a file handle when an exception occurs before close() is reached.',
      'Not stripping the trailing newline character when reading lines, leading to unexpected blank lines or formatting when printing them.',
      'Trying to open a file for reading ("r") that does not yet exist, resulting in a FileNotFoundError instead of an empty result.',
    ],
    keyPoints: [
      'open(filename, mode) returns a file object; common modes are "r" (read), "w" (overwrite), and "a" (append).',
      'The "with" statement (a context manager) automatically closes the file when the block ends, even if an error occurs.',
      'read() returns the whole file as one string; readlines() returns a list of lines; iterating the file object directly is most memory-efficient.',
      'write() does not add a newline automatically — include "\\n" explicitly when writing multiple lines.',
    ],
  },

  'json': {
    title: 'Working with JSON in Python',
    intro: `JSON (JavaScript Object Notation) is a lightweight, text-based data format widely used for storing configuration data and exchanging information between programs — especially over the web via APIs. Python's built-in <code>json</code> module provides a direct, well-defined mapping between JSON text and native Python data structures.

Because JSON's structure (objects, arrays, strings, numbers, booleans, and null) maps almost one-to-one onto Python's own dictionaries, lists, strings, numbers, booleans, and None, converting between the two formats is usually simple and predictable.`,
    sections: [
      {
        heading: 'Converting Python to JSON: json.dumps()',
        body: `<code>json.dumps(obj)</code> serializes a Python object into a JSON-formatted string. It accepts useful keyword arguments such as <code>indent=4</code> for pretty-printed, human-readable output, and <code>sort_keys=True</code> to order dictionary keys alphabetically. To write JSON directly to a file instead of returning a string, use <code>json.dump(obj, file)</code>.`,
      },
      {
        heading: 'Converting JSON to Python: json.loads()',
        body: `<code>json.loads(text)</code> parses a JSON-formatted string and returns the equivalent Python object. To read JSON directly from an already-open file object instead of a string, use <code>json.load(file)</code>. If the text is not valid JSON, both functions raise a <code>json.JSONDecodeError</code>.`,
      },
      {
        heading: 'The Type Mapping Between JSON and Python',
        body: `Understanding exactly how types translate in each direction avoids confusion when working with parsed data.`,
        list: [
          'JSON object {} ↔ Python dict',
          'JSON array [] ↔ Python list',
          'JSON string "..." ↔ Python str',
          'JSON number (integer or decimal) ↔ Python int or float',
          'JSON true / false ↔ Python True / False',
          'JSON null ↔ Python None',
        ],
      },
    ],
    examples: [
      {
        caption: 'Serializing a Python dictionary to a JSON string',
        code: `import json

person = {
    "name": "Elena",
    "age": 31,
    "is_member": True,
    "languages": ["Python", "SQL"],
    "manager": None,
}

json_text = json.dumps(person, indent=2)
print(json_text)`,
        output: `{
  "name": "Elena",
  "age": 31,
  "is_member": true,
  "languages": [
    "Python",
    "SQL"
  ],
  "manager": null
}`,
      },
      {
        caption: 'Parsing a JSON string back into Python objects',
        code: `import json

data = '{"name": "Elena", "age": 31, "languages": ["Python", "SQL"]}'
parsed = json.loads(data)

print(type(parsed))
print(parsed["name"])
print(parsed["languages"][0])
print(parsed["age"] + 1)`,
        output: `<class 'dict'>
Elena
Python
32`,
      },
    ],
    commonMistakes: [
      'Confusing JSON\'s true/false/null with Python\'s True/False/None when hand-writing JSON text — JSON requires the lowercase forms.',
      'Trying to serialize a Python object that json.dumps() does not know how to handle (like a custom class instance or a set), which raises a TypeError unless a custom encoder is supplied.',
      'Assuming json.loads() returns the exact same object identities or key order guarantees across all Python/JSON tooling, rather than just an equivalent structure.',
      'Forgetting that JSON keys are always strings — a Python dict with integer keys will have those keys converted to strings when serialized.',
    ],
    keyPoints: [
      'json.dumps() converts a Python object to a JSON string; json.loads() parses a JSON string back into Python objects.',
      'json.dump()/json.load() do the same conversions directly with an open file, instead of an in-memory string.',
      'JSON objects map to dicts, arrays map to lists, and true/false/null map to True/False/None.',
      'Invalid JSON text raises a json.JSONDecodeError when parsed with loads() or load().',
    ],
  },

  'introductory-data-handling': {
    title: 'Introduction to Data Handling in Python',
    intro: `Beyond writing individual scripts, one of Python's most common real-world uses is working with structured data — reading it in, examining it, filtering it, and summarizing it. This is the foundation for everything from simple reporting scripts to full data-analysis pipelines built on libraries like pandas.

Even without any external libraries, Python's own core toolkit — lists of dictionaries, comprehensions, loops, and built-in functions like sum(), len(), and sorted() — is already enough to explore and summarize a small dataset, and understanding this "plain Python" foundation makes it much easier to learn data-focused libraries later.`,
    sections: [
      {
        heading: 'Representing Structured Data as a List of Dictionaries',
        body: `A very common and natural way to represent a small table of records in plain Python is as a list of dictionaries, where each dictionary is one record (like one row) and its keys are the field names (like column headers). This mirrors exactly how data typically arrives from a JSON API or a parsed CSV file, which is why it is a natural starting point before reaching for a dedicated data library.`,
      },
      {
        heading: 'Iterating and Filtering Records',
        body: `A plain for loop over a list of dictionaries lets you inspect, filter, or transform each record. Combined with an if condition, this is enough to answer questions like "which records match a certain criterion," and a list comprehension can express the same filtering operation in a single concise line.`,
      },
      {
        heading: 'Summarizing Data with Built-in Functions',
        body: `Python's built-in functions <code>sum()</code>, <code>len()</code>, <code>max()</code>, <code>min()</code>, and <code>sorted()</code> cover many basic summary tasks without needing any external library: computing totals and averages, counting records, finding extremes, and ordering data by a chosen field (using the <code>key=</code> argument to sort by a dictionary value, often combined with a lambda expression).`,
      },
    ],
    examples: [
      {
        caption: 'Filtering and summarizing a list of dictionaries representing sales records',
        code: `sales = [
    {"product": "Widget", "units": 12, "price": 9.5},
    {"product": "Gadget", "units": 5, "price": 25.0},
    {"product": "Widget", "units": 8, "price": 9.5},
    {"product": "Gizmo", "units": 20, "price": 3.25},
]

total_units = sum(item["units"] for item in sales)
print("Total units sold:", total_units)

widget_sales = [item for item in sales if item["product"] == "Widget"]
print("Widget records:", widget_sales)

total_revenue = sum(item["units"] * item["price"] for item in sales)
print(f"Total revenue: {total_revenue:.2f}")`,
        output: `Total units sold: 45
Widget records: [{'product': 'Widget', 'units': 12, 'price': 9.5}, {'product': 'Widget', 'units': 8, 'price': 9.5}]
Total revenue: 317.50`,
      },
      {
        caption: 'Sorting records by a field and finding the top result',
        code: `sales = [
    {"product": "Widget", "units": 12},
    {"product": "Gadget", "units": 5},
    {"product": "Gizmo", "units": 20},
]

sorted_by_units = sorted(sales, key=lambda item: item["units"], reverse=True)
for record in sorted_by_units:
    print(record["product"], record["units"])

best_seller = max(sales, key=lambda item: item["units"])
print("Best seller:", best_seller["product"])`,
        output: `Gizmo 20
Widget 12
Gadget 5
Best seller: Gizmo`,
      },
    ],
    commonMistakes: [
      'Trying to sum or average a field without first checking that every record actually contains that key, causing a KeyError on incomplete data.',
      'Forgetting that sorted() returns a new list and does not sort a list of dictionaries in place, unless list.sort() is used instead.',
      'Using max()/min() without a key= argument on a list of dictionaries, which tries to compare the dictionaries themselves and raises a TypeError.',
      'Writing a manual loop with a running total for something a single sum() or a comprehension already expresses more clearly and safely.',
    ],
    keyPoints: [
      'A list of dictionaries is a natural, dependency-free way to represent tabular/structured data in Python.',
      'Plain for loops and list comprehensions are enough to filter and transform records before reaching for external libraries.',
      'sum(), len(), max(), min(), and sorted() (often paired with a key=lambda) cover most basic data-summary tasks.',
      'This plain-Python approach is the on-ramp to dedicated data libraries like pandas, which automate the same ideas at scale.',
    ],
  },
}
