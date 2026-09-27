// Python course — strings, data structures and functions lessons.
// Keys are slugs matching topics in codelabDefaults.js. Examples without
// `runnable: false` run in Webnest Codelab and `output` is the exact output.
export const pythonStructures = {
  'string-methods-reference': {
    title: 'Python String Methods Reference',
    intro: `Strings are the most used data type in almost every program — names, emails, messages, file contents, API responses. Python's <code>str</code> type comes with over 40 built-in methods for changing case, searching, testing content, splitting, joining, trimming, padding and replacing text.

This lesson is a complete, example-driven reference to the string methods, grouped by what they do. Remember that strings are <strong>immutable</strong>: every method returns a <em>new</em> string and leaves the original unchanged.`,
    sections: [
      {
        heading: 'Case Conversion',
        body: `<code>upper()</code>, <code>lower()</code>, <code>capitalize()</code> (first character upper, rest lower), <code>title()</code> (each word capitalised), <code>swapcase()</code> and <code>casefold()</code> (an aggressive lowercase for case-insensitive comparison, handling characters like German "ß").`,
      },
      {
        heading: 'Searching and Counting',
        body: `<code>find(sub, start, end)</code> returns the lowest index or <code>-1</code>; <code>rfind()</code> searches from the right. <code>index()</code> and <code>rindex()</code> do the same but raise <code>ValueError</code> when not found. <code>count(sub)</code> counts non-overlapping occurrences; <code>startswith()</code> and <code>endswith()</code> accept a string or a tuple of strings.`,
      },
      {
        heading: 'Testing Content (is... methods)',
        body: `<code>isalpha()</code>, <code>isdigit()</code>, <code>isdecimal()</code>, <code>isnumeric()</code>, <code>isalnum()</code>, <code>isspace()</code>, <code>islower()</code>, <code>isupper()</code>, <code>istitle()</code>, <code>isidentifier()</code>, <code>isprintable()</code> and <code>isascii()</code> return <code>True</code> or <code>False</code>. <code>isdecimal()</code> accepts only 0–9 style digits, <code>isdigit()</code> also accepts superscripts, and <code>isnumeric()</code> also accepts characters like "½".`,
      },
      {
        heading: 'Splitting, Joining and Partitioning',
        body: `<code>split(sep, maxsplit)</code> and <code>rsplit()</code> break a string into a list (no separator means "any whitespace"); <code>splitlines()</code> splits on line breaks; <code>partition(sep)</code> and <code>rpartition(sep)</code> return a 3-tuple (before, sep, after); <code>sep.join(iterable)</code> glues strings together.`,
      },
      {
        heading: 'Trimming, Padding and Alignment',
        body: `<code>strip()</code>, <code>lstrip()</code>, <code>rstrip()</code> remove whitespace (or given characters); <code>removeprefix()</code> and <code>removesuffix()</code> remove an exact prefix/suffix. <code>center(width, fill)</code>, <code>ljust()</code>, <code>rjust()</code> pad to a width; <code>zfill(width)</code> pads numbers with zeros; <code>expandtabs(n)</code> replaces tabs with spaces.`,
      },
      {
        heading: 'Replacing, Translating and Encoding',
        body: `<code>replace(old, new, count)</code> replaces substrings; <code>maketrans()</code> + <code>translate()</code> replace or delete many single characters at once; <code>encode(encoding)</code> converts text to bytes (and <code>bytes.decode()</code> reverses it); <code>format()</code> and <code>format_map()</code> fill templates.`,
      },
    ],
    examples: [
      {
        caption: 'Case methods',
        code: `s = "python PROGRAMMING is fun"
print(s.upper())
print(s.lower())
print(s.capitalize())
print(s.title())
print(s.swapcase())
print("Straße".casefold() == "STRASSE".casefold())`,
        output: `PYTHON PROGRAMMING IS FUN
python programming is fun
Python programming is fun
Python Programming Is Fun
PYTHON programming IS FUN
True`,
      },
      {
        caption: 'Searching and counting',
        code: `text = "banana bandana"
print(text.find("an"), text.rfind("an"), text.find("xyz"))
print(text.index("band"))
print(text.count("an"), text.count("a", 0, 6))
print(text.startswith("ban"), text.endswith(("na", "xy")))
try:
    text.index("xyz")
except ValueError as e:
    print("ValueError:", e)`,
        output: `1 11 -1
7
4 3
True True
ValueError: substring not found`,
      },
      {
        caption: 'Testing content with is... methods',
        code: `tests = ["Python", "2026", "abc123", "   ", "Hello World", "user_name", "½", "²"]
for t in tests:
    print(f"{t!r:14} alpha={t.isalpha()!s:5} decimal={t.isdecimal()!s:5} "
          f"digit={t.isdigit()!s:5} numeric={t.isnumeric()!s:5} alnum={t.isalnum()!s:5} "
          f"space={t.isspace()!s:5} title={t.istitle()!s:5} ident={t.isidentifier()}")`,
        output: `'Python'       alpha=True  decimal=False digit=False numeric=False alnum=True  space=False title=True  ident=True
'2026'         alpha=False decimal=True  digit=True  numeric=True  alnum=True  space=False title=False ident=False
'abc123'       alpha=False decimal=False digit=False numeric=False alnum=True  space=False title=False ident=True
'   '          alpha=False decimal=False digit=False numeric=False alnum=False space=True  title=False ident=False
'Hello World'  alpha=False decimal=False digit=False numeric=False alnum=False space=False title=True  ident=False
'user_name'    alpha=False decimal=False digit=False numeric=False alnum=False space=False title=False ident=True
'½'            alpha=False decimal=False digit=False numeric=True  alnum=True  space=False title=False ident=False
'²'            alpha=False decimal=False digit=True  numeric=True  alnum=True  space=False title=False ident=False`,
      },
      {
        caption: 'split, rsplit, splitlines, partition, rpartition and join',
        code: `csv = "asha,24,Pune,India"
print(csv.split(","))
print(csv.split(",", 1))
print(csv.rsplit(",", 1))
print("  many   spaces here ".split())
print("line1\\nline2\\r\\nline3".splitlines())
print("user@webnest.in".partition("@"))
print("archive.tar.gz".rpartition("."))
print(" | ".join(["Python", "Java", "SQL"]))
print("-".join("2026"))`,
        output: `['asha', '24', 'Pune', 'India']
['asha', '24,Pune,India']
['asha,24,Pune', 'India']
['many', 'spaces', 'here']
['line1', 'line2', 'line3']
('user', '@', 'webnest.in')
('archive.tar', '.', 'gz')
Python | Java | SQL
2-0-2-6`,
      },
      {
        caption: 'Trimming, prefixes, padding and alignment',
        code: `raw = "   hello world   "
print(repr(raw.strip()), repr(raw.lstrip()), repr(raw.rstrip()))
print("xxhixx".strip("x"))
print("INV-1042".removeprefix("INV-"), "report.pdf".removesuffix(".pdf"))
print("[" + "Menu".center(12, "*") + "]")
print("[" + "Left".ljust(8) + "]", "[" + "Right".rjust(8) + "]")
print("42".zfill(5), "-42".zfill(5))
print(repr("a\\tb".expandtabs(4)))`,
        output: `'hello world' 'hello world   ' '   hello world'
hi
1042 report
[****Menu****]
[Left    ] [   Right]
00042 -0042
'a   b'`,
      },
      {
        caption: 'replace, translate, encode and format',
        code: `msg = "I like Java. Java is great."
print(msg.replace("Java", "Python"))
print(msg.replace("Java", "Python", 1))

table = str.maketrans("aeiou", "AEIOU", "!?")
print("hello world!?".translate(table))

data = "₹500".encode("utf-8")
print(data, data.decode("utf-8"))
print("{} scored {:.1f}%".format("Asha", 91.456))
print("{name} is {age}".format_map({"name": "Ravi", "age": 30}))
print("Hello\\tWorld".isprintable(), "abc".isascii(), "café".isascii())`,
        output: `I like Python. Python is great.
I like Python. Java is great.
hEllO wOrld
b'\\xe2\\x82\\xb9500' ₹500
Asha scored 91.5%
Ravi is 30
False True False`,
      },
    ],
    commonMistakes: [
      'Calling s.upper() and expecting s to change — strings are immutable; assign the result.',
      'Using find() and forgetting it returns -1 (which is a valid negative index!) when not found.',
      'Using isdigit() to validate that text is a normal integer; isdecimal() is stricter, and int() in try/except is safest.',
      'Using strip("abc") expecting to remove the substring "abc" — it removes any of those characters; use removeprefix/removesuffix.',
      'Building strings in a loop with += instead of collecting parts and using join().',
    ],
    keyPoints: [
      'Every string method returns a new string; the original is unchanged.',
      'Case: upper, lower, capitalize, title, swapcase, casefold.',
      'Search: find/rfind (-1), index/rindex (ValueError), count, startswith, endswith.',
      'Tests: isalpha, isdigit, isdecimal, isnumeric, isalnum, isspace, istitle, isidentifier...',
      'split/rsplit/splitlines/partition break text; join combines; strip/pad/zfill/replace/translate transform it.',
    ],
  },

  'string-formatting': {
    title: 'String Formatting in Python',
    intro: `Turning values into well-presented text is something every program does: invoices, reports, log messages, emails, table output. Python offers three formatting systems — f-strings (the modern standard), <code>str.format()</code>, and the old <code>%</code> operator — plus <code>string.Template</code> for user-supplied templates.

This lesson covers all of them with the format specification mini-language: widths, alignment, precision, thousands separators, percentages, dates, number bases and debugging with <code>=</code>.`,
    sections: [
      {
        heading: 'f-Strings',
        body: `Prefix a string with <code>f</code> and put expressions in braces: <code>f"{name} is {age + 1}"</code>. Any expression works, including method calls and conditional expressions. Since Python 3.12 you can reuse the same quote type inside the braces and write multi-line expressions. Use <code>{{</code> and <code>}}</code> for literal braces.`,
      },
      {
        heading: 'The Format Specification Mini-Language',
        body: `After a colon, a format spec controls output: <code>[[fill]align][sign][width][,][.precision][type]</code>.`,
        list: [
          'Alignment: <code>&lt;</code> left, <code>&gt;</code> right, <code>^</code> centre, with an optional fill character (<code>{x:*^10}</code>).',
          'Numbers: <code>.2f</code> fixed decimals, <code>,</code> or <code>_</code> thousands separators, <code>+</code> always show sign, <code>e</code> scientific, <code>%</code> percentage.',
          'Integers in other bases: <code>b</code> binary, <code>o</code> octal, <code>x</code>/<code>X</code> hex, <code>#</code> adds a prefix; <code>08</code> pads with zeros.',
          'Dates: datetime objects accept strftime codes, e.g. <code>{today:%d %b %Y}</code>.',
          'Conversions: <code>!r</code> uses repr(), <code>!s</code> uses str(); <code>{x=}</code> shows the expression and value.',
        ],
      },
      {
        heading: 'str.format(), % and Template',
        body: `<code>"{} scored {:.1f}".format(name, score)</code> uses the same mini-language and is useful when the template is stored separately from the values. The <code>%</code> operator (<code>"%s is %d" % (name, age)</code>) is legacy but still appears in older code and logging. <code>string.Template("Hello $name")</code> is the safe choice when end users write templates, because it cannot evaluate arbitrary expressions.`,
      },
    ],
    examples: [
      {
        caption: 'f-string expressions and literal braces',
        code: `name, marks = "Asha", [78, 92, 85]
print(f"{name} has {len(marks)} marks, best {max(marks)}")
print(f"Average: {sum(marks) / len(marks):.2f}")
print(f"{name.upper()} {'passed' if min(marks) >= 40 else 'failed'}")
print(f"Set literal looks like {{1, 2}}")`,
        output: `Asha has 3 marks, best 92
Average: 85.00
ASHA passed
Set literal looks like {1, 2}`,
      },
      {
        caption: 'Width, alignment, numbers, bases and dates',
        code: `from datetime import date

print(f"|{'left':<10}|{'right':>10}|{'mid':^10}|{'fill':*^10}|")
print(f"{1234567.891:,.2f}  {1234567:_}  {-42:+}  {42:+}")
print(f"{0.4567:.1%}  {12345.678:.2e}  {7:03d}")
print(f"{255:b} {255:o} {255:x} {255:X} {255:#x} {5:08b}")
d = date(2026, 9, 27)
print(f"{d:%d %B %Y} | {d:%a %d/%m/%y}")
value = 3.14159
print(f"{value=:.2f}  {name!r}" if (name := "Ravi") else "")`,
        output: `|left      |     right|   mid    |***fill***|
1,234,567.89  1_234_567  -42  +42
45.7%  1.23e+04  007
11111111 377 ff FF 0xff 00000101
27 September 2026 | Sun 27/09/26
value=3.14  'Ravi'`,
      },
      {
        caption: 'str.format(), % formatting and string.Template',
        code: `from string import Template

template = "{name:<8}|{score:>6.1f}|{grade:^5}"
for row in [("Asha", 91.456, "A"), ("Ravi", 67.0, "C")]:
    print(template.format(name=row[0], score=row[1], grade=row[2]))

print("%s is %d years old and %.1f%% done" % ("Meera", 24, 87.25))

t = Template("Dear $name, your order $$\${amount} has shipped.")
print(t.substitute(name="Asha", amount="2,999"))
print(Template("Hi $name, $missing").safe_substitute(name="Ravi"))`,
        output: `Asha    |  91.5|  A
Ravi    |  67.0|  C
Meera is 24 years old and 87.2% done
Dear Asha, your order $2,999 has shipped.
Hi Ravi, $missing`,
      },
    ],
    commonMistakes: [
      'Concatenating with + and str() instead of using f-strings.',
      'Formatting money as {x:.2} (2 significant digits) instead of {x:.2f} (2 decimals).',
      'Letting users supply str.format() templates, which can access object attributes; use string.Template.',
      'Forgetting to double braces ({{ }}) when a literal brace is needed in an f-string.',
    ],
    keyPoints: [
      'f-strings are the modern, fastest, most readable way to format.',
      'Format specs control fill/alignment, width, separators, precision, type, base and dates.',
      '{x=} and !r help with debugging output.',
      'str.format() suits stored templates; % is legacy; string.Template is safe for user templates.',
    ],
  },

  'lists-and-list-methods': {
    title: 'Python Lists and List Methods',
    intro: `A list is an ordered, mutable collection that can hold any mix of values and grow or shrink as needed. It is the workhorse data structure in Python: shopping carts, rows from a file, search results, queues of work.

This lesson covers creating lists, indexing and slicing, modifying lists, every list method — <code>append</code>, <code>extend</code>, <code>insert</code>, <code>remove</code>, <code>pop</code>, <code>clear</code>, <code>index</code>, <code>count</code>, <code>sort</code>, <code>reverse</code>, <code>copy</code> — and the difference between shallow and deep copies.`,
    sections: [
      {
        heading: 'Creating, Indexing and Slicing',
        body: `Create lists with brackets <code>[1, 2, 3]</code>, <code>list(iterable)</code> or comprehensions. Indexes start at 0; negative indexes count from the end (<code>items[-1]</code> is the last item). Slices <code>items[start:stop:step]</code> return new lists; <code>items[::-1]</code> is a reversed copy. Lists can be nested to form tables.`,
      },
      {
        heading: 'Adding and Removing Items',
        body: `<code>append(x)</code> adds one item at the end; <code>extend(iterable)</code> adds many; <code>insert(i, x)</code> inserts at a position. <code>remove(x)</code> deletes the first matching value (ValueError if absent); <code>pop(i)</code> removes and returns an item (the last by default); <code>clear()</code> empties the list; <code>del items[i]</code> or <code>del items[a:b]</code> deletes by index or slice.`,
      },
      {
        heading: 'Searching, Counting and Sorting',
        body: `<code>index(x)</code> returns the first position of a value; <code>count(x)</code> counts occurrences; <code>x in items</code> tests membership. <code>sort()</code> sorts in place (with <code>key=</code> and <code>reverse=True</code>) and returns <code>None</code>; the built-in <code>sorted()</code> returns a new list. <code>reverse()</code> reverses in place.`,
      },
      {
        heading: 'Copying Lists',
        body: `<code>b = a</code> does not copy — both names refer to the same list. <code>a.copy()</code>, <code>a[:]</code> and <code>list(a)</code> make a <strong>shallow</strong> copy: a new outer list whose inner objects are shared. For nested lists, use <code>copy.deepcopy()</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Indexing, slicing and nested lists',
        code: `nums = [10, 20, 30, 40, 50, 60]
print(nums[0], nums[-1], nums[2:5], nums[:3], nums[::2], nums[::-1])

matrix = [[1, 2, 3], [4, 5, 6]]
print(matrix[1][2], [row[0] for row in matrix])
print(len(nums), 30 in nums, min(nums), max(nums), sum(nums))`,
        output: `10 60 [30, 40, 50] [10, 20, 30] [10, 30, 50] [60, 50, 40, 30, 20, 10]
6 [1, 4]
6 True 10 60 210`,
      },
      {
        caption: 'Every list method',
        code: `cart = ["pen", "book"]
cart.append("bag");              print("append :", cart)
cart.extend(["ink", "pen"]);     print("extend :", cart)
cart.insert(1, "ruler");         print("insert :", cart)
cart.remove("pen");              print("remove :", cart)
last = cart.pop();               print("pop    :", last, cart)
first = cart.pop(0);             print("pop(0) :", first, cart)
print("index  :", cart.index("bag"), "count:", cart.count("ink"))
cart.sort();                     print("sort   :", cart)
cart.sort(key=len, reverse=True); print("sort key:", cart)
cart.reverse();                  print("reverse:", cart)
backup = cart.copy()
cart.clear();                    print("clear  :", cart, "backup:", backup)`,
        output: `append : ['pen', 'book', 'bag']
extend : ['pen', 'book', 'bag', 'ink', 'pen']
insert : ['pen', 'ruler', 'book', 'bag', 'ink', 'pen']
remove : ['ruler', 'book', 'bag', 'ink', 'pen']
pop    : pen ['ruler', 'book', 'bag', 'ink']
pop(0) : ruler ['book', 'bag', 'ink']
index  : 1 count: 1
sort   : ['bag', 'book', 'ink']
sort key: ['book', 'bag', 'ink']
reverse: ['ink', 'bag', 'book']
clear  : [] backup: ['ink', 'bag', 'book']`,
      },
      {
        caption: 'sort() vs sorted(), sorting records, and slice assignment',
        code: `students = [("Asha", 91), ("Ravi", 72), ("Meera", 91), ("Kiran", 85)]
ranked = sorted(students, key=lambda s: (-s[1], s[0]))
print(ranked)
print(students[0])              # original unchanged

nums = [5, 3, 8]
print(nums.sort())              # sort() returns None!
print(nums)

letters = list("abcdef")
letters[1:3] = ["X", "Y", "Z"]
del letters[-2:]
print(letters)`,
        output: `[('Asha', 91), ('Meera', 91), ('Kiran', 85), ('Ravi', 72)]
('Asha', 91)
None
[3, 5, 8]
['a', 'X', 'Y', 'Z', 'd']`,
      },
      {
        caption: 'Aliasing, shallow copy and deep copy',
        code: `import copy

a = [[1, 2], [3, 4]]
alias = a
shallow = a.copy()
deep = copy.deepcopy(a)

a[0].append(99)
a.append([5])
print("alias  :", alias)
print("shallow:", shallow)
print("deep   :", deep)`,
        output: `alias  : [[1, 2, 99], [3, 4], [5]]
shallow: [[1, 2, 99], [3, 4]]
deep   : [[1, 2], [3, 4]]`,
      },
    ],
    commonMistakes: [
      'Writing items = items.sort(), which sets items to None.',
      'Using append(list) when you meant extend(list), creating a nested list.',
      'Assuming b = a copies the list.',
      'Creating a grid with [[0] * 3] * 3, which repeats the same inner list three times.',
      'Removing items while looping over the same list, which skips elements.',
    ],
    keyPoints: [
      'Lists are ordered, mutable and allow duplicates and mixed types.',
      'Indexing and slicing (including negative indexes and steps) read and copy parts.',
      'append/extend/insert add; remove/pop/clear/del delete; index/count search.',
      'sort() sorts in place and returns None; sorted() returns a new list.',
      'copy() is shallow; use copy.deepcopy for nested structures.',
    ],
  },

  'tuples-and-tuple-methods': {
    title: 'Python Tuples and Tuple Methods',
    intro: `A tuple is an ordered, <strong>immutable</strong> sequence. Once created, its items cannot be added, removed or replaced. That makes tuples ideal for fixed records (coordinates, RGB colours, database rows), for returning several values from a function, and as dictionary keys or set members.

This lesson covers creating tuples, the single-item tuple gotcha, packing and unpacking, the two tuple methods <code>count()</code> and <code>index()</code>, named tuples, and how tuples differ from lists.`,
    sections: [
      {
        heading: 'Creating Tuples',
        body: `Tuples are written with commas, usually in parentheses: <code>(3, 4)</code>. The comma makes the tuple, not the parentheses — so a single-item tuple needs a trailing comma: <code>("x",)</code>. <code>()</code> is the empty tuple and <code>tuple(iterable)</code> converts other sequences.`,
      },
      {
        heading: 'Packing, Unpacking and Swapping',
        body: `<code>point = 3, 4</code> packs values into a tuple; <code>x, y = point</code> unpacks them. The star collects the rest: <code>first, *rest = scores</code>. Functions return multiple values as a tuple. Swapping two variables is simply <code>a, b = b, a</code>.`,
      },
      {
        heading: 'Tuple Methods and Operations',
        body: `Tuples have just two methods: <code>count(x)</code> and <code>index(x)</code>. They support indexing, slicing, <code>len()</code>, <code>in</code>, concatenation with <code>+</code>, repetition with <code>*</code>, and comparison (item by item). A tuple is immutable, but if it contains a mutable object such as a list, that inner list can still change.`,
      },
      {
        heading: 'Why Use Tuples',
        body: `Tuples signal "this data should not change", protect against accidental modification, use slightly less memory than lists, and are <strong>hashable</strong> (if their items are), so they can be dictionary keys: <code>distances[("Pune", "Mumbai")] = 150</code>. For records with named fields, use <code>collections.namedtuple</code> or <code>typing.NamedTuple</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Creating tuples and the single-item gotcha',
        code: `point = (3, 4)
colors = "red", "green", "blue"
single = ("python",)
not_a_tuple = ("python")
print(type(point), type(colors), type(single), type(not_a_tuple))
print(tuple([1, 2, 3]), tuple("abc"), ())`,
        output: `<class 'tuple'> <class 'tuple'> <class 'tuple'> <class 'str'>
(1, 2, 3) ('a', 'b', 'c') ()`,
      },
      {
        caption: 'Unpacking, star unpacking, swapping and multiple return values',
        code: `def min_max_avg(values):
    return min(values), max(values), sum(values) / len(values)

low, high, avg = min_max_avg([72, 88, 95, 61])
print(low, high, avg)

first, *middle, last = [1, 2, 3, 4, 5]
print(first, middle, last)

a, b = 10, 20
a, b = b, a
print(a, b)

for name, (lat, lon) in [("Pune", (18.52, 73.86)), ("Delhi", (28.61, 77.21))]:
    print(f"{name}: {lat}, {lon}")`,
        output: `61 95 79.0
1 [2, 3, 4] 5
20 10
Pune: 18.52, 73.86
Delhi: 28.61, 77.21`,
      },
      {
        caption: 'count(), index(), operations and immutability',
        code: `t = (1, 2, 3, 2, 2, 4)
print(t.count(2), t.index(3), t[1:4], len(t), 4 in t)
print((1, 2) + (3,), ("ab",) * 3, (1, 2, 3) < (1, 3))

try:
    t[0] = 100
except TypeError as e:
    print("TypeError:", e)

record = ("Asha", [90, 85])
record[1].append(99)          # the inner list is still mutable
print(record)

distances = {("Pune", "Mumbai"): 150}
print(distances[("Pune", "Mumbai")])`,
        output: `3 2 (2, 3, 2) 6 True
(1, 2, 3) ('ab', 'ab', 'ab') True
TypeError: 'tuple' object does not support item assignment
('Asha', [90, 85, 99])
150`,
      },
      {
        caption: 'Named tuples for readable records',
        code: `from collections import namedtuple
from typing import NamedTuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p, p.x, p[1], p._asdict())

class Student(NamedTuple):
    name: str
    score: int = 0

s = Student("Ravi", 88)
print(s, s.name, s._replace(score=92))`,
        output: `Point(x=3, y=4) 3 4 {'x': 3, 'y': 4}
Student(name='Ravi', score=88) Ravi Student(name='Ravi', score=92)`,
      },
    ],
    commonMistakes: [
      'Writing ("item") for a one-item tuple — it is just a string; add a trailing comma.',
      'Trying to append to or modify a tuple.',
      'Assuming a tuple containing a list is fully immutable.',
      'Using tuples for records with many fields accessed by index instead of namedtuple/NamedTuple.',
    ],
    keyPoints: [
      'Tuples are ordered and immutable; the comma creates them.',
      'Packing/unpacking, star unpacking and swaps make tuples convenient.',
      'Only two methods: count() and index().',
      'Hashable tuples can be dict keys and set members.',
      'namedtuple / NamedTuple add field names to tuples.',
    ],
  },

  'sets-and-set-methods': {
    title: 'Python Sets and Set Methods',
    intro: `A set is an unordered collection of <strong>unique</strong>, hashable items. Sets remove duplicates automatically, test membership in constant time, and support mathematical operations like union, intersection and difference — perfect for "which students attended both classes?" or "which tags are new?".

This lesson covers creating sets, every set method, set operators, frozensets, and when sets outperform lists.`,
    sections: [
      {
        heading: 'Creating Sets',
        body: `Use braces with values <code>{1, 2, 3}</code> or <code>set(iterable)</code>. <code>{}</code> is an empty <em>dict</em>, so an empty set is <code>set()</code>. Items must be hashable — numbers, strings, tuples are fine; lists and dicts are not. Sets have no order and no indexing.`,
      },
      {
        heading: 'Adding and Removing',
        body: `<code>add(x)</code> adds one item; <code>update(iterable)</code> adds many. <code>remove(x)</code> raises <code>KeyError</code> if missing, <code>discard(x)</code> does not; <code>pop()</code> removes and returns an arbitrary item; <code>clear()</code> empties the set; <code>copy()</code> makes a shallow copy.`,
      },
      {
        heading: 'Set Algebra',
        body: `Each operation has a method and an operator: <code>union</code> (<code>|</code>), <code>intersection</code> (<code>&amp;</code>), <code>difference</code> (<code>-</code>), <code>symmetric_difference</code> (<code>^</code>). The <code>_update</code> versions (<code>intersection_update</code>, <code>difference_update</code>, <code>symmetric_difference_update</code>, and <code>|=</code>, <code>&amp;=</code>...) modify the set in place. <code>issubset</code> (<code>&lt;=</code>), <code>issuperset</code> (<code>&gt;=</code>) and <code>isdisjoint</code> compare sets.`,
      },
      {
        heading: 'frozenset and Performance',
        body: `A <code>frozenset</code> is an immutable, hashable set that can be a dict key or an element of another set. Membership tests (<code>x in s</code>) on sets are O(1) on average versus O(n) for lists — for large collections this is dramatically faster.`,
      },
    ],
    examples: [
      {
        caption: 'Creating sets and removing duplicates',
        code: `tags = {"python", "web", "python", "api"}
print(sorted(tags), len(tags))
emails = ["a@x.in", "b@x.in", "a@x.in"]
print(sorted(set(emails)))
print(type({}), type(set()))
print(sorted(set("mississippi")))`,
        output: `['api', 'python', 'web'] 3
['a@x.in', 'b@x.in']
<class 'dict'> <class 'set'>
['i', 'm', 'p', 's']`,
      },
      {
        caption: 'Adding and removing items',
        code: `s = {1, 2, 3}
s.add(4)
s.update([5, 6], {7})
print(sorted(s))
s.remove(7)
s.discard(100)             # no error
print(sorted(s))
try:
    s.remove(100)
except KeyError as e:
    print("KeyError:", e)
backup = s.copy()
item = s.pop()
s.clear()
print(len(s), len(backup), item in backup)`,
        output: `[1, 2, 3, 4, 5, 6, 7]
[1, 2, 3, 4, 5, 6]
KeyError: 100
0 6 True`,
      },
      {
        caption: 'Union, intersection, difference and symmetric difference',
        code: `monday = {"Asha", "Ravi", "Meera", "Kiran"}
tuesday = {"Ravi", "Kiran", "John"}

print("either day :", sorted(monday | tuesday))
print("both days  :", sorted(monday & tuesday))
print("only Monday:", sorted(monday - tuesday))
print("one day    :", sorted(monday ^ tuesday))
print(sorted(monday.union(tuesday, {"Zoya"})))

team = {"Ravi", "Kiran"}
print(team <= monday, monday >= team, team.isdisjoint({"John"}))

pending = {"a", "b", "c"}
pending.difference_update({"b"})
pending.intersection_update({"a", "c", "z"})
pending.symmetric_difference_update({"c", "d"})
print(sorted(pending))`,
        output: `either day : ['Asha', 'John', 'Kiran', 'Meera', 'Ravi']
both days  : ['Kiran', 'Ravi']
only Monday: ['Asha', 'Meera']
one day    : ['Asha', 'John', 'Meera']
['Asha', 'John', 'Kiran', 'Meera', 'Ravi', 'Zoya']
True True True
['a', 'd']`,
      },
      {
        caption: 'frozenset and fast membership',
        code: `import time

vowels = frozenset("aeiou")
print("e" in vowels, {vowels: "vowel set"}[vowels])

big_list = list(range(1_000_000))
big_set = set(big_list)
start = time.perf_counter(); 999_999 in big_list; t_list = time.perf_counter() - start
start = time.perf_counter(); 999_999 in big_set; t_set = time.perf_counter() - start
print("set lookup faster:", t_set < t_list)`,
        output: `True vowel set
set lookup faster: True`,
      },
    ],
    commonMistakes: [
      'Writing {} for an empty set.',
      'Expecting sets to keep insertion order or support indexing.',
      'Adding lists to a set (TypeError: unhashable type) — convert to tuples.',
      'Using remove() for items that may be missing instead of discard().',
    ],
    keyPoints: [
      'Sets hold unique hashable items with no order.',
      'add/update add; remove (KeyError), discard (safe), pop, clear remove.',
      'union |, intersection &, difference -, symmetric_difference ^, plus _update variants.',
      'issubset, issuperset and isdisjoint compare sets.',
      'frozenset is immutable and hashable; set membership is O(1).',
    ],
  },

  'dictionaries-and-dictionary-methods': {
    title: 'Python Dictionaries and Dictionary Methods',
    intro: `A dictionary maps <strong>keys</strong> to <strong>values</strong>: a student id to a name, a product code to a price, a word to its count. Lookups by key are fast (O(1) on average), dictionaries keep insertion order (since Python 3.7), and JSON data from APIs maps directly onto them.

This lesson covers creating dictionaries, reading and updating values safely, every dictionary method — <code>get</code>, <code>keys</code>, <code>values</code>, <code>items</code>, <code>update</code>, <code>pop</code>, <code>popitem</code>, <code>setdefault</code>, <code>fromkeys</code>, <code>clear</code>, <code>copy</code> — merging, dict comprehensions and nested dictionaries.`,
    sections: [
      {
        heading: 'Creating and Accessing',
        body: `Create with braces <code>{"name": "Asha", "age": 24}</code>, <code>dict(name="Asha")</code>, <code>dict(zip(keys, values))</code> or a comprehension. Keys must be hashable and unique; values can be anything. <code>d[key]</code> raises <code>KeyError</code> for missing keys, while <code>d.get(key, default)</code> returns a default. Assigning <code>d[key] = value</code> adds or updates.`,
      },
      {
        heading: 'The Methods',
        body: `Every dict method:`,
        list: [
          '<code>get(k, default)</code> — safe read.',
          '<code>keys()</code>, <code>values()</code>, <code>items()</code> — live views for iteration.',
          '<code>update(other)</code> — merge in another dict or key/value pairs; <code>d1 | d2</code> and <code>d1 |= d2</code> also merge (3.9+).',
          '<code>pop(k, default)</code> — remove and return a value; <code>popitem()</code> removes the last inserted pair.',
          '<code>setdefault(k, default)</code> — return the value, inserting the default if the key is missing.',
          '<code>fromkeys(keys, value)</code> — class method creating a dict with the same value for each key.',
          '<code>clear()</code> — remove everything; <code>copy()</code> — shallow copy.',
        ],
      },
      {
        heading: 'Iterating and Transforming',
        body: `Iterating a dict yields keys; use <code>.items()</code> for key/value pairs. Dict comprehensions build or filter dictionaries in one expression. Sort by value with <code>sorted(d.items(), key=lambda kv: kv[1])</code>. Do not add or remove keys while iterating over a dict.`,
      },
      {
        heading: 'Nested Dictionaries',
        body: `Real data is often nested — an API response with a user containing an address containing a city. Access with chained keys (<code>data["user"]["address"]["city"]</code>) or safely with chained <code>get</code> calls. For counting and grouping, <code>collections.Counter</code> and <code>defaultdict</code> (see the collections lesson) are even more convenient.`,
      },
    ],
    examples: [
      {
        caption: 'Creating, reading, adding and updating',
        code: `student = {"name": "Asha", "age": 24, "courses": ["Python"]}
print(student["name"], student.get("city"), student.get("city", "Unknown"))
student["city"] = "Pune"
student["age"] += 1
student["courses"].append("SQL")
print(student)
print(dict(zip(["a", "b"], [1, 2])), dict(x=1, y=2))
try:
    student["email"]
except KeyError as e:
    print("KeyError:", e)`,
        output: `Asha None Unknown
{'name': 'Asha', 'age': 25, 'courses': ['Python', 'SQL'], 'city': 'Pune'}
{'a': 1, 'b': 2} {'x': 1, 'y': 2}
KeyError: 'email'`,
      },
      {
        caption: 'Every dictionary method',
        code: `prices = {"pen": 10, "book": 250}
print(list(prices.keys()), list(prices.values()), list(prices.items()))

prices.update({"bag": 899, "pen": 12})
print("update    :", prices)
removed = prices.pop("book")
print("pop       :", removed, prices, prices.pop("lamp", "not found"))
print("popitem   :", prices.popitem(), prices)
print("setdefault:", prices.setdefault("ink", 40), prices.setdefault("pen", 99), prices)
print("fromkeys  :", dict.fromkeys(["a", "b", "c"], 0))
copy_ = prices.copy()
prices.clear()
print("clear     :", prices, "copy:", copy_)
print("merge     :", {"a": 1, "b": 2} | {"b": 3, "c": 4})`,
        output: `['pen', 'book'] [10, 250] [('pen', 10), ('book', 250)]
update    : {'pen': 12, 'book': 250, 'bag': 899}
pop       : 250 {'pen': 12, 'bag': 899} not found
popitem   : ('bag', 899) {'pen': 12}
setdefault: 40 12 {'pen': 12, 'ink': 40}
fromkeys  : {'a': 0, 'b': 0, 'c': 0}
clear     : {} copy: {'pen': 12, 'ink': 40}
merge     : {'a': 1, 'b': 3, 'c': 4}`,
      },
      {
        caption: 'Iterating, sorting by value, comprehensions and grouping',
        code: `scores = {"Asha": 91, "Ravi": 72, "Meera": 88, "Kiran": 65}
for name, score in scores.items():
    print(f"{name}: {score}")

top = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:2]
print("Top 2:", top)

passed = {n: s for n, s in scores.items() if s >= 70}
print(passed)

words = ["apple", "avocado", "banana", "blueberry", "cherry"]
groups = {}
for w in words:
    groups.setdefault(w[0], []).append(w)
print(groups)`,
        output: `Asha: 91
Ravi: 72
Meera: 88
Kiran: 65
Top 2: [('Asha', 91), ('Meera', 88)]
{'Asha': 91, 'Ravi': 72, 'Meera': 88}
{'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}`,
      },
      {
        caption: 'Nested dictionaries (like JSON from an API)',
        code: `response = {
    "user": {"id": 7, "name": "Asha", "address": {"city": "Pune", "pin": "411001"}},
    "orders": [{"id": 101, "total": 2999}, {"id": 102, "total": 499}],
}
print(response["user"]["address"]["city"])
print(response.get("user", {}).get("phone", {}).get("mobile", "no phone"))
print(sum(o["total"] for o in response["orders"]))`,
        output: `Pune
no phone
3498`,
      },
    ],
    commonMistakes: [
      'Using d[key] for keys that might be missing instead of d.get(key).',
      'Using mutable objects (lists) as keys.',
      'Changing a dict\'s size while iterating over it (RuntimeError).',
      'Using dict.fromkeys(keys, []) — every key shares the same list.',
      'Assuming copy() deep-copies nested values.',
    ],
    keyPoints: [
      'Dicts map unique hashable keys to values and keep insertion order.',
      'get() reads safely; assignment adds or updates.',
      'keys/values/items views, update or |, pop/popitem, setdefault, fromkeys, clear, copy.',
      'Dict comprehensions build and filter dictionaries concisely.',
      'Nested dicts mirror JSON; chain get() for safe access.',
    ],
  },

  'choosing-the-right-data-structure': {
    title: 'List vs Tuple vs Set vs Dictionary',
    intro: `Python's four built-in collections overlap, and choosing the right one affects correctness, readability and speed. Should a list of emails be a list or a set? Should a record be a tuple or a dict? This lesson compares lists, tuples, sets and dictionaries side by side — mutability, ordering, duplicates, access patterns and performance — with guidelines and examples for choosing.`,
    sections: [
      {
        heading: 'Side-by-Side Comparison',
        body: `The key properties of each collection:`,
        list: [
          '<strong>List</strong> <code>[1, 2]</code> — ordered, mutable, duplicates allowed, access by index. Use for sequences that change.',
          '<strong>Tuple</strong> <code>(1, 2)</code> — ordered, immutable, duplicates allowed, hashable. Use for fixed records and dict keys.',
          '<strong>Set</strong> <code>{1, 2}</code> — unordered, mutable, unique items, fast membership. Use for uniqueness and set algebra.',
          '<strong>Dict</strong> <code>{"a": 1}</code> — ordered by insertion, mutable, unique keys, fast lookup by key. Use for mappings and records with named fields.',
        ],
      },
      {
        heading: 'Performance',
        body: `Membership tests (<code>x in c</code>) are O(n) for lists and tuples but O(1) average for sets and dict keys. Appending to a list is O(1), inserting at the front is O(n) (use <code>collections.deque</code>). Tuples are slightly smaller and faster to create than lists.`,
      },
      {
        heading: 'Rules of Thumb',
        body: `Ordered items that change → list. Fixed group of values → tuple (or NamedTuple/dataclass for named fields). "Is this item present?" or "remove duplicates" → set. "Look up X by Y" → dict. List vs dict: if you often search a list for an item by an id, convert it to a dict keyed by id.`,
      },
    ],
    examples: [
      {
        caption: 'The same data in four structures',
        code: `marks_list = [88, 72, 88, 95]
marks_tuple = (88, 72, 88, 95)
marks_set = {88, 72, 88, 95}
marks_dict = {"Asha": 88, "Ravi": 72, "Meera": 88, "Kiran": 95}

print(marks_list[0], marks_tuple[-1], sorted(marks_set), marks_dict["Kiran"])
print(len(marks_list), len(marks_tuple), len(marks_set), len(marks_dict))

marks_list.append(60)
marks_set.add(60)
marks_dict["Zoya"] = 60
print(marks_list, sorted(marks_set), marks_dict)`,
        output: `88 95 [72, 88, 95] 95
4 4 3 4
[88, 72, 88, 95, 60] [60, 72, 88, 95] {'Asha': 88, 'Ravi': 72, 'Meera': 88, 'Kiran': 95, 'Zoya': 60}`,
      },
      {
        caption: 'Replacing slow list searches with a dict',
        code: `users = [{"id": i, "name": f"user{i}"} for i in range(1, 50_001)]

def find_in_list(user_id):
    for u in users:
        if u["id"] == user_id:
            return u

users_by_id = {u["id"]: u for u in users}

print(find_in_list(49_999)["name"])
print(users_by_id[49_999]["name"])      # O(1) instead of scanning 50,000 items`,
        output: `user49999
user49999`,
      },
    ],
    commonMistakes: [
      'Using a list for membership checks on large data instead of a set.',
      'Using parallel lists (names[], ages[]) instead of a list of dicts or dataclasses.',
      'Choosing a tuple for data that needs to change, then converting back and forth.',
      'Relying on set ordering.',
    ],
    keyPoints: [
      'List: ordered, mutable. Tuple: ordered, immutable. Set: unique, unordered. Dict: key → value.',
      'Sets and dicts give O(1) membership/lookup; lists and tuples O(n).',
      'Use tuples for fixed records and dict keys; dicts for lookups by key.',
      'Choose by access pattern: by position, by membership, or by key.',
    ],
  },

  'arrays-stacks-and-queues': {
    title: 'Arrays, Stacks and Queues in Python',
    intro: `Classic data structures appear constantly in real programs and coding interviews: <strong>arrays</strong> of numbers, <strong>stacks</strong> (last in, first out) for undo and expression parsing, and <strong>queues</strong> (first in, first out) for task processing and breadth-first search. Python has no separate "array" keyword, but it gives you efficient tools for all of them.

This lesson covers the <code>array</code> module, implementing stacks with lists, queues with <code>collections.deque</code>, priority queues with <code>heapq</code>, and the thread-safe <code>queue</code> module.`,
    sections: [
      {
        heading: 'The array Module',
        body: `<code>array.array(typecode, items)</code> stores numbers of one type compactly, like arrays in C — for example <code>'i'</code> for signed ints and <code>'d'</code> for doubles. It uses much less memory than a list of Python ints. For numerical computing, NumPy arrays (see the NumPy lesson) are the more powerful choice.`,
      },
      {
        heading: 'Stacks (LIFO)',
        body: `A list is a perfect stack: <code>append()</code> pushes and <code>pop()</code> pops from the end, both O(1). Stacks power undo history, browser back buttons, matching brackets and depth-first search.`,
      },
      {
        heading: 'Queues (FIFO)',
        body: `Do not use <code>list.pop(0)</code> for queues — it is O(n) because every item shifts. <code>collections.deque</code> supports O(1) <code>append</code> and <code>popleft</code> at both ends, and a <code>maxlen</code> for bounded buffers.`,
      },
      {
        heading: 'Priority Queues and Thread-Safe Queues',
        body: `<code>heapq</code> turns a list into a min-heap: <code>heappush</code> and <code>heappop</code> always return the smallest item in O(log n) — ideal for scheduling by priority and Dijkstra's algorithm. <code>queue.Queue</code>, <code>LifoQueue</code> and <code>PriorityQueue</code> add locking for producer/consumer threads.`,
      },
    ],
    examples: [
      {
        caption: 'The array module',
        code: `from array import array
import sys

temps = array("d", [21.5, 23.0, 19.8])
temps.append(25.1)
temps.extend([18.0, 22.4])
print(temps, temps[1], len(temps))
print(max(temps), round(sum(temps) / len(temps), 2))

ints = array("h", range(1000))                # "h" = 2-byte signed integers
print(sys.getsizeof(ints) < sys.getsizeof(list(range(1000))))
try:
    ints.append(3.5)
except TypeError as e:
    print("TypeError:", e)`,
        output: `array('d', [21.5, 23.0, 19.8, 25.1, 18.0, 22.4]) 23.0 6
25.1 21.63
True
TypeError: 'float' object cannot be interpreted as an integer`,
      },
      {
        caption: 'Stack: checking balanced brackets',
        code: `def balanced(expression):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in expression:
        if ch in "([{":
            stack.append(ch)                 # push
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:   # pop
                return False
    return not stack

for e in ["(a + b) * [c]", "{[()]}", "(]", "((x)"]:
    print(e, "->", balanced(e))`,
        output: `(a + b) * [c] -> True
{[()]} -> True
(] -> False
((x) -> False`,
      },
      {
        caption: 'Queue with deque, and a bounded recent-items buffer',
        code: `from collections import deque

tasks = deque(["email", "report", "backup"])
tasks.append("cleanup")
print("processing", tasks.popleft())
print("processing", tasks.popleft())
print("remaining", list(tasks))

recent = deque(maxlen=3)
for page in ["home", "courses", "python", "fastapi", "pricing"]:
    recent.append(page)
print("last 3 pages:", list(recent))
recent.rotate(1)
print(list(recent))`,
        output: `processing email
processing report
remaining ['backup', 'cleanup']
last 3 pages: ['python', 'fastapi', 'pricing']
['pricing', 'python', 'fastapi']`,
      },
      {
        caption: 'Priority queue with heapq',
        code: `import heapq

tickets = []
heapq.heappush(tickets, (3, "Change avatar"))
heapq.heappush(tickets, (1, "Payment failed"))
heapq.heappush(tickets, (2, "Cannot log in"))
while tickets:
    priority, title = heapq.heappop(tickets)
    print(priority, title)

print(heapq.nlargest(2, [40, 10, 90, 70]), heapq.nsmallest(2, [40, 10, 90, 70]))`,
        output: `1 Payment failed
2 Cannot log in
3 Change avatar
[90, 70] [10, 40]`,
      },
    ],
    commonMistakes: [
      'Using list.pop(0) or insert(0, x) for queues — O(n); use deque.',
      'Expecting heapq to be a max-heap — it is a min-heap; negate priorities for max.',
      'Mixing types in array.array, which only accepts its declared type.',
      'Using plain lists shared between threads instead of queue.Queue.',
    ],
    keyPoints: [
      'array.array stores same-typed numbers compactly.',
      'Lists are efficient stacks with append/pop.',
      'collections.deque is the right queue: O(1) append/popleft, optional maxlen.',
      'heapq provides priority queues (min-heap).',
      'queue.Queue is thread-safe for producer/consumer code.',
    ],
  },

  'the-collections-module': {
    title: 'The collections Module',
    intro: `The <code>collections</code> module provides specialised containers that make common tasks shorter and faster than with plain dicts and lists: counting things, grouping items, fixed records with names, double-ended queues, chaining configuration layers, and more.

This lesson covers <code>Counter</code>, <code>defaultdict</code>, <code>OrderedDict</code>, <code>deque</code>, <code>namedtuple</code>, <code>ChainMap</code>, and the <code>UserDict</code>/<code>UserList</code> base classes, each with a practical example.`,
    sections: [
      {
        heading: 'Counter',
        body: `<code>Counter(iterable)</code> counts hashable items. <code>most_common(n)</code> returns the top items, missing keys count as 0, and counters support <code>+</code>, <code>-</code>, <code>&amp;</code> and <code>|</code>. Perfect for word frequencies, votes, and inventory.`,
      },
      {
        heading: 'defaultdict',
        body: `<code>defaultdict(factory)</code> creates a missing key's value automatically by calling the factory: <code>defaultdict(list)</code> for grouping, <code>defaultdict(int)</code> for counting, <code>defaultdict(set)</code> for unique grouping. No more <code>if key not in d</code> checks.`,
      },
      {
        heading: 'OrderedDict, deque, namedtuple, ChainMap',
        body: `<code>OrderedDict</code> remembers order (like dict) and adds <code>move_to_end()</code> and order-sensitive equality — handy for LRU caches. <code>deque</code> is the double-ended queue. <code>namedtuple</code> makes tuple records with field names. <code>ChainMap</code> searches several dicts in order — e.g. command-line options, then environment, then defaults — without copying them.`,
      },
      {
        heading: 'UserDict and UserList',
        body: `To create your own dict-like or list-like class, subclass <code>UserDict</code> or <code>UserList</code>: they route all operations through your overridden methods, which is more reliable than subclassing the built-in <code>dict</code> directly.`,
      },
    ],
    examples: [
      {
        caption: 'Counter for frequencies',
        code: `from collections import Counter

text = "the quick brown fox jumps over the lazy dog the end"
words = Counter(text.split())
print(words.most_common(2))
print(words["the"], words["cat"])

votes = Counter(["python", "java", "python", "go", "python", "java"])
print(votes)
stock = Counter(pens=10, books=4)
sold = Counter(pens=3, books=4)
print(stock - sold, sorted((stock + sold).elements())[:3])`,
        output: `[('the', 3), ('quick', 1)]
3 0
Counter({'python': 3, 'java': 2, 'go': 1})
Counter({'pens': 7}) ['books', 'books', 'books']`,
      },
      {
        caption: 'defaultdict for grouping and counting',
        code: `from collections import defaultdict

orders = [("Asha", "pen"), ("Ravi", "book"), ("Asha", "bag"), ("Asha", "pen")]
by_customer = defaultdict(list)
unique_items = defaultdict(set)
counts = defaultdict(int)
for customer, item in orders:
    by_customer[customer].append(item)
    unique_items[customer].add(item)
    counts[customer] += 1

print(dict(by_customer))
print({k: sorted(v) for k, v in unique_items.items()})
print(dict(counts))`,
        output: `{'Asha': ['pen', 'bag', 'pen'], 'Ravi': ['book']}
{'Asha': ['bag', 'pen'], 'Ravi': ['book']}
{'Asha': 3, 'Ravi': 1}`,
      },
      {
        caption: 'OrderedDict as an LRU cache, and ChainMap for layered settings',
        code: `from collections import OrderedDict, ChainMap

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return None
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)     # evict least recently used

cache = LRUCache(2)
cache.put("a", 1); cache.put("b", 2); cache.get("a"); cache.put("c", 3)
print(list(cache.data))

defaults = {"theme": "light", "language": "en", "page_size": 20}
env = {"language": "hi"}
cli = {"page_size": 50}
settings = ChainMap(cli, env, defaults)
print(settings["theme"], settings["language"], settings["page_size"])`,
        output: `['a', 'c']
light hi 50`,
      },
      {
        caption: 'UserDict: a dictionary with case-insensitive keys',
        code: `from collections import UserDict

class CaseInsensitiveDict(UserDict):
    def __setitem__(self, key, value):
        super().__setitem__(key.lower(), value)

    def __getitem__(self, key):
        return super().__getitem__(key.lower())

headers = CaseInsensitiveDict()
headers["Content-Type"] = "application/json"
print(headers["content-type"], headers["CONTENT-TYPE"], dict(headers))`,
        output: `application/json application/json {'content-type': 'application/json'}`,
      },
    ],
    commonMistakes: [
      'Writing manual counting loops instead of Counter.',
      'Checking "if key not in d: d[key] = []" everywhere instead of defaultdict(list).',
      'Printing a defaultdict and being surprised that simply reading a missing key created it.',
      'Subclassing dict and overriding __setitem__, which update() and the constructor bypass; use UserDict.',
    ],
    keyPoints: [
      'Counter counts items and finds the most common.',
      'defaultdict creates missing values automatically (list, int, set...).',
      'OrderedDict adds move_to_end/popitem(last=False) for LRU-style logic.',
      'deque, namedtuple and ChainMap cover queues, records and layered lookups.',
      'UserDict/UserList are the safe bases for custom containers.',
    ],
  },

  'function-arguments': {
    title: 'Function Arguments in Python',
    intro: `Python functions have one of the most flexible parameter systems of any language: positional and keyword arguments, default values, variable numbers of arguments with <code>*args</code> and <code>**kwargs</code>, keyword-only and positional-only parameters, and argument unpacking at the call site.

This lesson covers every kind of parameter, the order they must appear in, the mutable-default-argument trap, and how to design clear function signatures.`,
    sections: [
      {
        heading: 'Positional, Keyword and Default Arguments',
        body: `Arguments can be passed by position (<code>area(3, 4)</code>) or by name (<code>area(width=3, height=4)</code>), and keyword arguments can come in any order. Parameters with default values (<code>def greet(name, greeting="Hello")</code>) become optional. Parameters with defaults must come after those without.`,
      },
      {
        heading: '*args and **kwargs',
        body: `<code>*args</code> collects extra positional arguments into a tuple; <code>**kwargs</code> collects extra keyword arguments into a dict. They let functions accept any number of values and are used for wrappers and decorators that pass arguments through. The names are conventions — only the stars matter.`,
      },
      {
        heading: 'Keyword-Only and Positional-Only Parameters',
        body: `Parameters after <code>*</code> (or after <code>*args</code>) are <strong>keyword-only</strong>: callers must name them, which makes calls like <code>send(email, retry=True)</code> self-documenting. Parameters before <code>/</code> are <strong>positional-only</strong>: callers cannot use their names, which lets you rename them later. The full order is: positional-only, <code>/</code>, normal, <code>*args</code> or <code>*</code>, keyword-only, <code>**kwargs</code>.`,
      },
      {
        heading: 'Unpacking and the Mutable Default Trap',
        body: `At the call site, <code>*sequence</code> spreads items as positional arguments and <code>**mapping</code> spreads a dict as keyword arguments. Default values are evaluated <strong>once</strong>, when the function is defined — so a default like <code>items=[]</code> is shared between calls. Use <code>None</code> as the default and create the list inside the function.`,
      },
    ],
    examples: [
      {
        caption: 'Positional, keyword and default arguments',
        code: `def order_summary(item, quantity=1, price=100.0, currency="INR"):
    return f"{quantity} x {item} = {quantity * price:.2f} {currency}"

print(order_summary("pen"))
print(order_summary("book", 3, 250))
print(order_summary("bag", price=899, quantity=2))
print(order_summary(currency="USD", item="mug", price=9.5))`,
        output: `1 x pen = 100.00 INR
3 x book = 750.00 INR
2 x bag = 1798.00 INR
1 x mug = 9.50 USD`,
      },
      {
        caption: '*args and **kwargs',
        code: `def total(*numbers):
    print("numbers is a", type(numbers).__name__, numbers)
    return sum(numbers)

def create_user(username, **details):
    print("details is a", type(details).__name__, details)
    return {"username": username, **details}

print(total(10, 20, 30))
print(create_user("asha", city="Pune", age=24))

def log_call(func, *args, **kwargs):
    print(f"calling {func.__name__} with {args} {kwargs}")
    return func(*args, **kwargs)

print(log_call(round, 3.14159, ndigits=2))`,
        output: `numbers is a tuple (10, 20, 30)
60
details is a dict {'city': 'Pune', 'age': 24}
{'username': 'asha', 'city': 'Pune', 'age': 24}
calling round with (3.14159,) {'ndigits': 2}
3.14`,
      },
      {
        caption: 'Keyword-only and positional-only parameters',
        code: `def send_email(to, subject, /, *, cc=None, urgent=False):
    return f"to={to} subject={subject} cc={cc} urgent={urgent}"

print(send_email("a@x.in", "Hi", urgent=True))

try:
    send_email("a@x.in", "Hi", None, True)
except TypeError as e:
    print("TypeError:", e)

try:
    send_email(to="a@x.in", subject="Hi")
except TypeError as e:
    print("TypeError:", e)`,
        output: `to=a@x.in subject=Hi cc=None urgent=True
TypeError: send_email() takes 2 positional arguments but 4 were given
TypeError: send_email() got some positional-only arguments passed as keyword arguments: 'to, subject'`,
      },
      {
        caption: 'Argument unpacking and the mutable default trap',
        code: `def point(x, y, z=0):
    return (x, y, z)

coords = [1, 2, 3]
options = {"x": 5, "y": 6}
print(point(*coords), point(**options))

def add_item_bad(item, cart=[]):
    cart.append(item)
    return cart

def add_item_good(item, cart=None):
    if cart is None:
        cart = []
    cart.append(item)
    return cart

print(add_item_bad("pen"), add_item_bad("book"))
print(add_item_good("pen"), add_item_good("book"))`,
        output: `(1, 2, 3) (5, 6, 0)
['pen', 'book'] ['pen', 'book']
['pen'] ['book']`,
      },
    ],
    commonMistakes: [
      'Using a mutable default argument like [] or {}.',
      'Putting a parameter without a default after one with a default (SyntaxError).',
      'Passing boolean flags positionally (send(x, True, False)) — make them keyword-only.',
      'Overusing **kwargs so that nobody can tell what a function accepts.',
    ],
    keyPoints: [
      'Arguments can be positional or keyword; defaults make parameters optional.',
      '*args collects extra positionals (tuple); **kwargs extra keywords (dict).',
      'Parameters after * are keyword-only; before / are positional-only.',
      '*seq and **dict unpack arguments at the call site.',
      'Use None, not [] or {}, as a default for mutable values.',
    ],
  },

  'lambda-functions': {
    title: 'Lambda Functions in Python',
    intro: `A lambda is a small anonymous function written in a single expression: <code>lambda x: x * 2</code>. Lambdas are most useful as short "key" or callback functions passed to other functions — sorting by a field, filtering, mapping — where defining a full named function would be overkill.

This lesson covers lambda syntax, using lambdas with <code>sorted</code>, <code>min</code>/<code>max</code>, <code>map</code> and <code>filter</code>, lambdas in dictionaries as simple dispatch tables, the late-binding pitfall, and when to prefer a regular <code>def</code>.`,
    sections: [
      {
        heading: 'Syntax',
        body: `<code>lambda parameters: expression</code> creates a function object that returns the expression's value. It can take any number of parameters (including defaults and <code>*args</code>) but must be a single expression — no statements, no assignments (except the walrus operator), no multiple lines. <code>square = lambda x: x ** 2</code> works but PEP 8 recommends <code>def</code> when you give the function a name.`,
      },
      {
        heading: 'Where Lambdas Shine',
        body: `As arguments to higher-order functions: <code>sorted(people, key=lambda p: p["age"])</code>, <code>max(products, key=lambda p: p.price)</code>, <code>filter(lambda n: n % 2, numbers)</code>, event handlers in GUI code (<code>command=lambda: save(file)</code>), and small dispatch dictionaries mapping names to operations.`,
      },
      {
        heading: 'Late Binding in Loops',
        body: `A lambda created in a loop looks up loop variables when it is <em>called</em>, not when it is created, so all of them see the final value. Capture the current value with a default argument: <code>lambda i=i: i</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Basic lambdas',
        code: `add = lambda a, b: a + b
greet = lambda name="friend": f"Hello, {name}!"
is_even = lambda n: n % 2 == 0

print(add(3, 4), greet(), greet("Asha"), is_even(10))
print((lambda x: x ** 3)(4))`,
        output: `7 Hello, friend! Hello, Asha! True
64`,
      },
      {
        caption: 'Sorting and choosing with key functions',
        code: `products = [
    {"name": "Laptop", "price": 55000, "rating": 4.5},
    {"name": "Mouse", "price": 700, "rating": 4.8},
    {"name": "Keyboard", "price": 1500, "rating": 4.1},
]
by_price = sorted(products, key=lambda p: p["price"])
print([p["name"] for p in by_price])
print(max(products, key=lambda p: p["rating"])["name"])
print(sorted(["banana", "Apple", "cherry"], key=lambda s: s.lower()))
print(sorted([(1, "b"), (1, "a"), (0, "z")], key=lambda t: (t[0], t[1])))`,
        output: `['Mouse', 'Keyboard', 'Laptop']
Mouse
['Apple', 'banana', 'cherry']
[(0, 'z'), (1, 'a'), (1, 'b')]`,
      },
      {
        caption: 'map, filter and a dispatch table',
        code: `numbers = [1, 2, 3, 4, 5, 6]
print(list(map(lambda n: n * n, numbers)))
print(list(filter(lambda n: n % 2 == 0, numbers)))

operations = {
    "+": lambda a, b: a + b,
    "-": lambda a, b: a - b,
    "*": lambda a, b: a * b,
    "/": lambda a, b: a / b if b else "cannot divide by zero",
}
for op in "+-*/":
    print(f"8 {op} 2 =", operations[op](8, 2))
print(operations["/"](1, 0))`,
        output: `[1, 4, 9, 16, 25, 36]
[2, 4, 6]
8 + 2 = 10
8 - 2 = 6
8 * 2 = 16
8 / 2 = 4.0
cannot divide by zero`,
      },
      {
        caption: 'The late-binding pitfall and its fix',
        code: `buggy = [lambda: i for i in range(3)]
fixed = [lambda i=i: i for i in range(3)]
print([f() for f in buggy])
print([f() for f in fixed])`,
        output: `[2, 2, 2]
[0, 1, 2]`,
      },
    ],
    commonMistakes: [
      'Assigning lambdas to names instead of using def (PEP 8 recommends def).',
      'Cramming complex logic into a lambda instead of writing a readable function.',
      'Late binding in loops: capture loop variables with a default argument.',
      'Using map/filter with lambdas where a comprehension is clearer.',
    ],
    keyPoints: [
      'lambda args: expression creates a small anonymous function.',
      'Lambdas are ideal as key functions and short callbacks.',
      'They are limited to one expression.',
      'Capture loop variables with default arguments to avoid late binding.',
      'Prefer def for anything named, reused or non-trivial.',
    ],
  },

  'higher-order-functions-map-filter-and-reduce': {
    title: 'Higher-Order Functions: map, filter and reduce',
    intro: `In Python, functions are first-class objects: you can store them in variables, pass them as arguments and return them from other functions. A <strong>higher-order function</strong> takes or returns a function. This enables a functional programming style built on three classic tools — <code>map</code>, <code>filter</code> and <code>reduce</code> — plus <code>sorted</code>, <code>any</code>, <code>all</code> and function factories.

This lesson shows functions as values, the three classic tools, how they compare with comprehensions, and how to write your own higher-order functions.`,
    sections: [
      {
        heading: 'Functions as Values',
        body: `A function name without parentheses refers to the function object itself: <code>f = len</code> then <code>f("abc")</code>. You can put functions in lists and dicts, pass them to other functions, and return new functions from functions (closures). Decorators are built on exactly this.`,
      },
      {
        heading: 'map, filter and reduce',
        body: `<code>map(func, iterable, ...)</code> applies a function to every item (and can walk several iterables in parallel). <code>filter(func, iterable)</code> keeps items where the function returns truthy (<code>filter(None, items)</code> removes falsy items). <code>functools.reduce(func, iterable, initial)</code> combines items into one value by repeatedly applying a two-argument function. <code>map</code> and <code>filter</code> return lazy iterators — wrap in <code>list()</code> to see all results.`,
      },
      {
        heading: 'Comprehensions vs map/filter',
        body: `<code>[x * 2 for x in nums if x &gt; 0]</code> is often clearer than <code>list(map(lambda x: x * 2, filter(lambda x: x &gt; 0, nums)))</code>. Use <code>map</code> when you already have a named function (<code>map(str.strip, lines)</code>, <code>map(int, parts)</code>), and prefer built-ins like <code>sum</code>, <code>max</code>, <code>any</code> and <code>all</code> over <code>reduce</code> when they fit.`,
      },
    ],
    examples: [
      {
        caption: 'Functions as values and functions that return functions',
        code: `def shout(text):
    return text.upper() + "!"

def whisper(text):
    return text.lower() + "..."

def speak(style, message):
    return style(message)

print(speak(shout, "hello"), speak(whisper, "HELLO"))

def make_multiplier(factor):
    def multiply(n):
        return n * factor
    return multiply

double, triple = make_multiplier(2), make_multiplier(3)
print(double(5), triple(5))
handlers = [shout, whisper, len]
print([h("Python") for h in handlers])`,
        output: `HELLO! hello...
10 15
['PYTHON!', 'python...', 6]`,
      },
      {
        caption: 'map, filter and reduce',
        code: `from functools import reduce
import operator

prices = ["120", " 45 ", "300", "abc", "15"]
cleaned = list(filter(str.isdigit, map(str.strip, prices)))
numbers = list(map(int, cleaned))
print(cleaned, numbers)

with_gst = list(map(lambda p: round(p * 1.18, 2), numbers))
print(with_gst)

print(list(map(lambda a, b: a * b, [1, 2, 3], [10, 20, 30])))
print(list(filter(None, [0, "", "x", None, 5, []])))

print(reduce(operator.add, numbers), reduce(operator.mul, [1, 2, 3, 4], 1))
print(reduce(lambda acc, n: acc if acc > n else n, numbers))`,
        output: `['120', '45', '300', '15'] [120, 45, 300, 15]
[141.6, 53.1, 354.0, 17.7]
[10, 40, 90]
['x', 5]
480 24
300`,
      },
      {
        caption: 'Comprehension equivalents and any/all',
        code: `nums = [3, -1, 8, 0, -7, 12]
print(list(map(lambda x: x * 2, filter(lambda x: x > 0, nums))))
print([x * 2 for x in nums if x > 0])

marks = [78, 92, 45, 66]
print(any(m < 50 for m in marks), all(m >= 40 for m in marks))
print(sum(marks) / len(marks), max(marks))`,
        output: `[6, 16, 24]
[6, 16, 24]
True True
70.25 92`,
      },
    ],
    commonMistakes: [
      'Printing map(...) and seeing <map object> — convert to a list.',
      'Iterating a map/filter object twice; it is exhausted after the first pass.',
      'Using reduce where sum(), max() or "".join() is clearer.',
      'Calling the function when passing it (key=len() instead of key=len).',
    ],
    keyPoints: [
      'Functions are first-class: store, pass and return them.',
      'map transforms, filter selects, reduce combines.',
      'map and filter return lazy, single-use iterators.',
      'Comprehensions and built-ins (sum, any, all, max) are often more readable.',
    ],
  },

  recursion: {
    title: 'Recursion in Python',
    intro: `A recursive function solves a problem by calling itself on a smaller version of the same problem. Many problems are naturally recursive: factorials, walking nested folders or JSON, tree and graph traversal, divide-and-conquer sorting, generating permutations.

This lesson covers base cases and recursive cases, how the call stack works, Python's recursion limit, memoization with <code>functools.lru_cache</code>, recursion over nested data, and when an iterative solution is better.`,
    sections: [
      {
        heading: 'Base Case and Recursive Case',
        body: `Every recursive function needs a <strong>base case</strong> that returns without recursing, and a <strong>recursive case</strong> that moves toward it. Missing or unreachable base cases cause infinite recursion, which Python stops with <code>RecursionError</code>.`,
      },
      {
        heading: 'The Call Stack and the Recursion Limit',
        body: `Each call gets its own frame on the call stack with its own local variables. Python limits the depth (1000 frames by default, see <code>sys.getrecursionlimit()</code>) and does not optimise tail calls, so very deep recursion should be rewritten as a loop.`,
      },
      {
        heading: 'Memoization',
        body: `Naive recursive Fibonacci recomputes the same values exponentially many times. Caching results — <strong>memoization</strong> — with <code>@functools.lru_cache</code> or <code>@functools.cache</code> turns it into a linear-time algorithm with one line.`,
      },
    ],
    examples: [
      {
        caption: 'Factorial, sum of digits and power',
        code: `def factorial(n):
    if n <= 1:            # base case
        return 1
    return n * factorial(n - 1)   # recursive case

def digit_sum(n):
    return n if n < 10 else n % 10 + digit_sum(n // 10)

def power(base, exp):
    if exp == 0:
        return 1
    half = power(base, exp // 2)
    return half * half * (base if exp % 2 else 1)

print(factorial(5), digit_sum(98765), power(2, 30))`,
        output: `120 35 1073741824`,
      },
      {
        caption: 'Memoized Fibonacci and the recursion limit',
        code: `import sys
from functools import lru_cache

calls = 0
def fib_slow(n):
    global calls
    calls += 1
    return n if n < 2 else fib_slow(n - 1) + fib_slow(n - 2)

@lru_cache(maxsize=None)
def fib_fast(n):
    return n if n < 2 else fib_fast(n - 1) + fib_fast(n - 2)

print(fib_slow(20), "calls:", calls)
print(fib_fast(90))
print(fib_fast.cache_info().misses, "distinct values computed")
print("limit:", sys.getrecursionlimit())

def countdown(n):
    return countdown(n - 1)          # no base case!
try:
    countdown(5)
except RecursionError as e:
    print("RecursionError:", e)`,
        output: `6765 calls: 21891
2880067194370816120
91 distinct values computed
limit: 1000
RecursionError: maximum recursion depth exceeded`,
      },
      {
        caption: 'Recursion over nested data and permutations',
        code: `def flatten(items):
    result = []
    for item in items:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

def count_keys(data):
    if isinstance(data, dict):
        return len(data) + sum(count_keys(v) for v in data.values())
    if isinstance(data, list):
        return sum(count_keys(v) for v in data)
    return 0

def permutations(s):
    if len(s) <= 1:
        return [s]
    return [ch + p for i, ch in enumerate(s) for p in permutations(s[:i] + s[i + 1:])]

print(flatten([1, [2, [3, [4, 5]]], 6]))
print(count_keys({"a": 1, "b": {"c": 2, "d": [{"e": 3}]}}))
print(permutations("abc"))`,
        output: `[1, 2, 3, 4, 5, 6]
5
['abc', 'acb', 'bac', 'bca', 'cab', 'cba']`,
      },
    ],
    commonMistakes: [
      'Forgetting the base case or never moving toward it.',
      'Using naive recursion for overlapping subproblems without memoization.',
      'Recursing thousands of levels deep in Python instead of using a loop.',
      'Raising the recursion limit with sys.setrecursionlimit to hide a design problem.',
    ],
    keyPoints: [
      'Recursion needs a base case and a recursive case that shrinks the problem.',
      'Each call has its own stack frame; Python\'s default depth limit is 1000.',
      '@lru_cache / @cache memoize results to avoid repeated work.',
      'Recursion suits nested data, trees and divide-and-conquer; loops suit deep linear repetition.',
    ],
  },

  'scope-closures-and-namespaces': {
    title: 'Scope, Closures and Namespaces',
    intro: `When Python sees a name like <code>total</code>, which variable does it mean — one inside the function, one in an enclosing function, a module-level one, or a built-in? The answer follows the <strong>LEGB rule</strong>. Understanding scope explains the <code>global</code> and <code>nonlocal</code> keywords, closures (functions that remember variables from where they were created), and the famous <code>UnboundLocalError</code>.`,
    sections: [
      {
        heading: 'Namespaces and the LEGB Rule',
        body: `A namespace maps names to objects. Python looks names up in four scopes, in order: <strong>L</strong>ocal (inside the current function), <strong>E</strong>nclosing (outer functions), <strong>G</strong>lobal (module level) and <strong>B</strong>uilt-in (<code>len</code>, <code>print</code>...). <code>locals()</code> and <code>globals()</code> return the current namespaces as dicts.`,
      },
      {
        heading: 'global and nonlocal',
        body: `Assigning to a name inside a function makes it local to that function for the whole function body. To assign to a module-level variable, declare <code>global name</code>; to assign to a variable of an enclosing function, declare <code>nonlocal name</code>. Global state makes code hard to test — prefer passing values in and returning results.`,
      },
      {
        heading: 'Closures',
        body: `A closure is an inner function that remembers variables from its enclosing scope even after the outer function has returned. Closures create function factories (<code>make_multiplier(3)</code>), stateful counters without classes, and are the mechanism behind decorators.`,
      },
    ],
    examples: [
      {
        caption: 'The LEGB lookup order',
        code: `x = "global"

def outer():
    x = "enclosing"
    def inner():
        x = "local"
        print("inner sees:", x)
    inner()
    print("outer sees:", x)

outer()
print("module sees:", x)
print("built-in len:", len("abc"))`,
        output: `inner sees: local
outer sees: enclosing
module sees: global
built-in len: 3`,
      },
      {
        caption: 'UnboundLocalError, global and nonlocal',
        code: `counter = 0

def broken():
    counter += 1          # assignment makes counter local -> error

def increment():
    global counter
    counter += 1

try:
    broken()
except UnboundLocalError as e:
    print("UnboundLocalError:", e)

increment(); increment()
print("counter:", counter)

def make_counter():
    count = 0
    def next_value():
        nonlocal count
        count += 1
        return count
    return next_value

tick = make_counter()
print(tick(), tick(), tick())`,
        output: `UnboundLocalError: cannot access local variable 'counter' where it is not associated with a value
counter: 2
1 2 3`,
      },
      {
        caption: 'Closures remember their environment',
        code: `def make_discount(percent):
    def apply(price):
        return round(price * (1 - percent / 100), 2)
    return apply

festival = make_discount(20)
student = make_discount(50)
print(festival(1000), student(1000))
print(festival.__closure__[0].cell_contents)

def running_average():
    values = []
    def add(v):
        values.append(v)
        return sum(values) / len(values)
    return add

avg = running_average()
print(avg(10), avg(20), avg(60))`,
        output: `800.0 500.0
20
10.0 15.0 30.0`,
      },
    ],
    commonMistakes: [
      'Reading a global and then assigning to it in the same function without "global", causing UnboundLocalError.',
      'Using global variables for state that should be passed as arguments or stored in objects.',
      'Forgetting nonlocal when updating an enclosing variable from an inner function.',
      'Shadowing built-ins (list, max, id) in a scope and breaking later code.',
    ],
    keyPoints: [
      'Names resolve in LEGB order: Local, Enclosing, Global, Built-in.',
      'Assignment inside a function creates a local unless declared global or nonlocal.',
      'Closures capture enclosing variables and keep them alive.',
      'Closures enable function factories, stateful callables and decorators.',
    ],
  },

  'built-in-functions-reference': {
    title: 'Python Built-in Functions Reference',
    intro: `Python ships with about 70 built-in functions that are always available without importing anything. You have already used <code>print</code>, <code>len</code> and <code>range</code>; the rest cover type conversion, math, iteration, object inspection, input/output and dynamic code execution.

This reference groups every commonly used built-in by purpose — <code>abs</code>, <code>all</code>, <code>any</code>, <code>ascii</code>, <code>bin</code>, <code>bool</code>, <code>bytearray</code>, <code>bytes</code>, <code>callable</code>, <code>chr</code>, <code>compile</code>, <code>complex</code>, <code>delattr</code>, <code>dict</code>, <code>dir</code>, <code>divmod</code>, <code>enumerate</code>, <code>eval</code>, <code>exec</code>, <code>filter</code>, <code>float</code>, <code>format</code>, <code>frozenset</code>, <code>getattr</code>, <code>globals</code>, <code>hasattr</code>, <code>hash</code>, <code>help</code>, <code>hex</code>, <code>id</code>, <code>input</code>, <code>int</code>, <code>isinstance</code>, <code>issubclass</code>, <code>iter</code>, <code>len</code>, <code>list</code>, <code>locals</code>, <code>map</code>, <code>max</code>, <code>memoryview</code>, <code>min</code>, <code>next</code>, <code>object</code>, <code>oct</code>, <code>open</code>, <code>ord</code>, <code>pow</code>, <code>print</code>, <code>range</code>, <code>repr</code>, <code>reversed</code>, <code>round</code>, <code>set</code>, <code>setattr</code>, <code>slice</code>, <code>sorted</code>, <code>str</code>, <code>sum</code>, <code>tuple</code>, <code>type</code>, <code>vars</code> and <code>zip</code> — with runnable examples for each group.`,
    sections: [
      {
        heading: 'Numbers and Math',
        body: `<code>abs()</code> absolute value; <code>round(x, n)</code> rounding (banker's rounding); <code>pow(b, e, mod)</code> power with optional modulus; <code>divmod(a, b)</code> quotient and remainder; <code>min()</code>, <code>max()</code>, <code>sum()</code> with optional <code>key</code>/<code>default</code>/<code>start</code>; <code>bin()</code>, <code>oct()</code>, <code>hex()</code> base strings; <code>complex()</code> complex numbers.`,
      },
      {
        heading: 'Type Construction and Conversion',
        body: `<code>int()</code>, <code>float()</code>, <code>str()</code>, <code>bool()</code>, <code>list()</code>, <code>tuple()</code>, <code>set()</code>, <code>frozenset()</code>, <code>dict()</code>, <code>bytes()</code> (immutable), <code>bytearray()</code> (mutable bytes), <code>memoryview()</code> (zero-copy view of binary data), <code>chr()</code>/<code>ord()</code> for characters, <code>ascii()</code> and <code>repr()</code> for printable representations, <code>format(value, spec)</code> for formatting, and <code>object()</code> for a plain base object.`,
      },
      {
        heading: 'Iteration Helpers',
        body: `<code>range()</code>, <code>enumerate()</code>, <code>zip()</code> (with <code>strict=True</code> to catch uneven lengths), <code>reversed()</code>, <code>sorted()</code>, <code>map()</code>, <code>filter()</code>, <code>iter()</code> and <code>next()</code> (manual iteration, with a default), <code>all()</code> and <code>any()</code>, <code>len()</code>, and <code>slice()</code> objects for reusable slices.`,
      },
      {
        heading: 'Objects and Introspection',
        body: `<code>type()</code> and <code>isinstance()</code>/<code>issubclass()</code> check types; <code>id()</code> gives an object's identity; <code>hash()</code> its hash; <code>callable()</code> tests if it can be called; <code>dir()</code> lists attributes; <code>vars()</code> returns <code>__dict__</code>; <code>getattr()</code>, <code>setattr()</code>, <code>hasattr()</code>, <code>delattr()</code> work with attributes by name; <code>globals()</code> and <code>locals()</code> return namespaces; <code>help()</code> shows documentation.`,
      },
      {
        heading: 'I/O and Dynamic Execution',
        body: `<code>print()</code> and <code>input()</code> for console I/O; <code>open()</code> for files. <code>eval()</code> evaluates an expression string, <code>exec()</code> executes statements, and <code>compile()</code> turns source into a code object. <strong>Never</strong> pass untrusted input to <code>eval</code> or <code>exec</code> — it can run any code; use <code>ast.literal_eval</code> to parse literals safely.`,
      },
    ],
    examples: [
      {
        caption: 'Numbers and math built-ins',
        code: `print(abs(-7.5), round(2.675, 2), round(1234.5, -2))
print(pow(2, 10), pow(2, 10, 1000), divmod(47, 5))
print(min(4, 9, 1), max([3, 8, 2]), min([], default="empty"))
print(sum([1, 2, 3]), sum([[1], [2]], start=[]))
print(max(["pear", "fig", "banana"], key=len))
print(bin(10), oct(64), hex(255), complex(2, -3))`,
        output: `7.5 2.67 1200.0
1024 24 (9, 2)
1 8 empty
6 [1, 2]
banana
0b1010 0o100 0xff (2-3j)`,
      },
      {
        caption: 'Type construction and conversion built-ins',
        code: `print(int("42"), float("2.5"), str(99), bool([]))
print(list("hi"), tuple({1: "a"}), sorted(set([3, 1, 3])), frozenset([1, 2]))
print(dict(a=1), dict([("b", 2)]))
print(bytes("₹5", "utf-8"), bytearray(b"abc"))
ba = bytearray(b"hello"); ba[0] = ord("j"); print(ba)
mv = memoryview(b"abcdef"); print(mv[1:4].tobytes(), len(mv))
print(chr(65), ord("a"), ascii("café ₹"), repr("line\\n"))
print(format(1234.5678, ",.2f"), format(0.25, ".0%"), format(10, "08b"))
print(type(object()).__name__)`,
        output: `42 2.5 99 False
['h', 'i'] (1,) [1, 3] frozenset({1, 2})
{'a': 1} {'b': 2}
b'\\xe2\\x82\\xb95' bytearray(b'abc')
bytearray(b'jello')
b'bcd' 6
A 97 'caf\\xe9 \\u20b9' 'line\\n'
1,234.57 25% 00001010
object`,
      },
      {
        caption: 'Iteration built-ins',
        code: `letters = ["a", "b", "c"]
print(list(range(2, 11, 3)), list(enumerate(letters, 1)))
print(list(zip(letters, [1, 2, 3])), list(reversed(letters)))
print(sorted([3, 1, 2], reverse=True))
print(list(map(str.upper, letters)), list(filter(lambda c: c != "b", letters)))

it = iter([10, 20])
print(next(it), next(it), next(it, "done"))
print(all([1, 2, 3]), any([0, 0, 1]), len({"a": 1, "b": 2}))

last_two = slice(-2, None)
print([1, 2, 3, 4][last_two], "python"[last_two])
try:
    list(zip([1, 2], [1], strict=True))
except ValueError as e:
    print("ValueError:", e)`,
        output: `[2, 5, 8] [(1, 'a'), (2, 'b'), (3, 'c')]
[('a', 1), ('b', 2), ('c', 3)] ['c', 'b', 'a']
[3, 2, 1]
['A', 'B', 'C'] ['a', 'c']
10 20 done
True True 2
[3, 4] on
ValueError: zip() argument 2 is shorter than argument 1`,
      },
      {
        caption: 'Object and introspection built-ins',
        code: `class Course:
    platform = "Webnest"
    def __init__(self, title):
        self.title = title

c = Course("Python")
print(type(c).__name__, isinstance(c, Course), issubclass(bool, int))
print(callable(Course), callable(c), callable(len))
print(vars(c), hasattr(c, "title"), getattr(c, "price", 0))
setattr(c, "price", 2999)
print(c.price)
delattr(c, "price")
print(hasattr(c, "price"))
print([name for name in dir(c) if not name.startswith("_")])
a = [1]
b = a
print(id(a) == id(b), hash("abc") == hash("abc"), hash((1, 2)) == hash((1, 2)))
print("Course" in globals())

def show_locals():
    x, y = 1, 2
    return locals()
print(show_locals())`,
        output: `Course True True
True False True
{'title': 'Python'} True 0
2999
False
['platform', 'title']
True True True
True
{'x': 1, 'y': 2}`,
      },
      {
        caption: 'eval, exec, compile and the safe alternative',
        code: `import ast

print(eval("2 + 3 * 4"))
exec("result = sum(range(5))\\nprint('exec result:', result)")
code = compile("x * 2", "<string>", "eval")
print(eval(code, {"x": 21}))

user_text = "[1, 2, {'a': 3}]"
print(ast.literal_eval(user_text))
try:
    ast.literal_eval("__import__('os').getcwd()")
except ValueError as e:
    print("literal_eval refused unsafe input")`,
        output: `14
exec result: 10
42
[1, 2, {'a': 3}]
literal_eval refused unsafe input`,
      },
    ],
    commonMistakes: [
      'Calling eval() or exec() on user input — a serious security vulnerability.',
      'Shadowing built-ins by naming variables list, dict, sum, max, id, type or input.',
      'Using type(x) == SomeClass instead of isinstance(x, SomeClass), which ignores subclasses.',
      'Forgetting that map, filter, zip, reversed and enumerate return one-shot iterators.',
    ],
    keyPoints: [
      'Built-ins are always available: math, conversion, iteration, introspection, I/O.',
      'min/max/sorted accept key functions; sum accepts start; next accepts a default.',
      'getattr/setattr/hasattr/delattr and vars/dir enable dynamic attribute access.',
      'isinstance respects inheritance; callable tests whether something can be called.',
      'Avoid eval/exec on untrusted input; use ast.literal_eval for literals.',
    ],
  },
}
