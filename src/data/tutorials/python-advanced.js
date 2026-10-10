// Python course — advanced language features, concurrency, and searching /
// sorting / classic programs. Keys are slugs matching topics in
// codelabDefaults.js.
export const pythonAdvanced = {
  'itertools-and-functools': {
    title: 'The itertools and functools Modules',
    intro: `<code>itertools</code> and <code>functools</code> are two standard-library modules that make functional-style Python concise and fast. <code>itertools</code> provides building blocks for efficient looping — infinite counters, chaining, grouping, slicing iterators, combinations and permutations — all lazily evaluated. <code>functools</code> provides tools for working with functions — caching, partial application, reduction, ordering and decorators.

This lesson walks through the most useful functions of both modules with practical examples.`,
    sections: [
      {
        heading: 'Infinite and Terminating Iterators',
        body: `<code>count(start, step)</code>, <code>cycle(iterable)</code> and <code>repeat(x, n)</code> generate values endlessly (combine with <code>islice</code> or <code>zip</code>). <code>chain()</code> joins iterables, <code>islice()</code> slices any iterator, <code>accumulate()</code> produces running totals, <code>takewhile()</code>/<code>dropwhile()</code> cut sequences by a condition, <code>compress()</code> filters by a selector, <code>pairwise()</code> yields overlapping pairs, <code>batched()</code> (3.12+) splits into fixed-size chunks, and <code>zip_longest()</code> pads uneven iterables.`,
      },
      {
        heading: 'Grouping and Combinatorics',
        body: `<code>groupby(iterable, key)</code> groups <em>consecutive</em> items with the same key, so sort by the key first. <code>product()</code> gives the Cartesian product (nested loops), <code>permutations()</code> ordered arrangements, <code>combinations()</code> unordered selections, and <code>combinations_with_replacement()</code>.`,
      },
      {
        heading: 'functools',
        body: `<code>lru_cache</code> and <code>cache</code> memoise function results; <code>partial()</code> pre-fills some arguments of a function; <code>reduce()</code> folds a sequence into one value; <code>wraps()</code> preserves metadata in decorators; <code>total_ordering</code> completes comparison methods; <code>cached_property</code> caches a computed attribute; <code>singledispatch</code> dispatches on type; <code>cmp_to_key</code> adapts old-style comparison functions for sorting.`,
      },
    ],
    examples: [
      {
        caption: 'Infinite iterators and iterator tools',
        code: `from itertools import count, cycle, repeat, islice, chain, accumulate, takewhile, dropwhile, compress, pairwise, batched, zip_longest

print(list(islice(count(100, 5), 4)))
print(list(zip(["Mon", "Tue", "Wed", "Thu"], cycle(["on-call", "off"]))))
print(list(repeat("ab", 3)))
print(list(chain([1, 2], (3,), "ab")))
print(list(accumulate([100, 250, -50, 400])))
print(list(takewhile(lambda x: x < 5, [1, 3, 6, 2])), list(dropwhile(lambda x: x < 5, [1, 3, 6, 2])))
print(list(compress("ABCDEF", [1, 0, 1, 0, 1, 1])))
print(list(pairwise([10, 13, 11, 20])))
print(list(batched(range(1, 8), 3)))
print(list(zip_longest("abc", [1, 2], fillvalue="-")))`,
        output: `[100, 105, 110, 115]
[('Mon', 'on-call'), ('Tue', 'off'), ('Wed', 'on-call'), ('Thu', 'off')]
['ab', 'ab', 'ab']
[1, 2, 3, 'a', 'b']
[100, 350, 300, 700]
[1, 3] [6, 2]
['A', 'C', 'E', 'F']
[(10, 13), (13, 11), (11, 20)]
[(1, 2, 3), (4, 5, 6), (7,)]
[('a', 1), ('b', 2), ('c', '-')]`,
      },
      {
        caption: 'groupby and combinatorics',
        code: `from itertools import groupby, product, permutations, combinations, combinations_with_replacement

sales = [("north", 100), ("south", 50), ("north", 70), ("south", 30), ("east", 90)]
sales.sort(key=lambda s: s[0])                     # groupby needs sorted input
for region, rows in groupby(sales, key=lambda s: s[0]):
    print(region, sum(amount for _, amount in rows))

print(list(product("AB", [1, 2])))
print(["".join(p) for p in permutations("abc", 2)])
print(list(combinations([1, 2, 3, 4], 2)))
print(len(list(combinations_with_replacement("xyz", 2))))`,
        output: `east 90
north 170
south 80
[('A', 1), ('A', 2), ('B', 1), ('B', 2)]
['ab', 'ac', 'ba', 'bc', 'ca', 'cb']
[(1, 2), (1, 3), (1, 4), (2, 3), (2, 4), (3, 4)]
6`,
      },
      {
        caption: 'functools: partial, reduce, lru_cache, cmp_to_key and wraps',
        code: `from functools import partial, reduce, lru_cache, cmp_to_key, wraps
import operator

def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)
print(square(7), cube(2))

print(reduce(operator.mul, range(1, 6)), reduce(lambda a, b: a + b, ["a", "b", "c"]))

@lru_cache(maxsize=128)
def slow_price(item):
    print(f"looking up {item}...")
    return len(item) * 100

print(slow_price("pen"), slow_price("pen"), slow_price.cache_info().hits)

def by_length_then_alpha(a, b):
    return (len(a) - len(b)) or ((a > b) - (a < b))

print(sorted(["kiwi", "fig", "apple", "date"], key=cmp_to_key(by_length_then_alpha)))

def shout(func):
    @wraps(func)
    def wrapper(*args):
        return func(*args).upper()
    return wrapper

@shout
def greet(name):
    """Return a greeting."""
    return f"hello {name}"

print(greet("asha"), greet.__name__, greet.__doc__)`,
        output: `49 8
120 abc
looking up pen...
300 300 1
['fig', 'date', 'kiwi', 'apple']
HELLO ASHA greet Return a greeting.`,
      },
    ],
    commonMistakes: [
      'Using groupby on unsorted data and getting several groups for the same key.',
      'Materialising huge combinatoric iterators with list() — they grow factorially.',
      'Caching functions with lru_cache whose arguments are unhashable (lists) or whose results change over time.',
      'Forgetting functools.wraps in decorators, losing the original name and docstring.',
    ],
    keyPoints: [
      'itertools gives lazy building blocks: count, cycle, chain, islice, accumulate, pairwise, batched...',
      'groupby groups consecutive items — sort by the key first.',
      'product, permutations and combinations generate combinatorial sequences.',
      'functools: partial, reduce, lru_cache/cache, wraps, total_ordering, cmp_to_key.',
    ],
  },

  'regular-expressions': {
    title: 'Regular Expressions in Python',
    intro: `A regular expression (regex) is a pattern that describes text: "a 6-digit PIN code", "an email address", "a date like 27-09-2026". Python's <code>re</code> module uses these patterns to search, validate, extract and replace text — tasks that would need many lines of string methods.

This lesson covers pattern syntax, the main <code>re</code> functions (<code>match</code>, <code>search</code>, <code>fullmatch</code>, <code>findall</code>, <code>finditer</code>, <code>sub</code>, <code>split</code>), groups and named groups, flags, compiling patterns, and practical validation and extraction examples.`,
    sections: [
      {
        heading: 'Pattern Syntax',
        body: `The essentials:`,
        list: [
          'Characters: <code>.</code> any character, <code>\\d</code> digit, <code>\\w</code> word character, <code>\\s</code> whitespace (capitals negate: <code>\\D</code>, <code>\\W</code>, <code>\\S</code>).',
          'Sets: <code>[aeiou]</code>, ranges <code>[a-z0-9]</code>, negation <code>[^0-9]</code>.',
          'Quantifiers: <code>*</code> (0+), <code>+</code> (1+), <code>?</code> (0 or 1), <code>{3}</code>, <code>{2,4}</code>; add <code>?</code> for non-greedy (<code>.*?</code>).',
          'Anchors: <code>^</code> start, <code>$</code> end, <code>\\b</code> word boundary.',
          'Groups: <code>( )</code> capture, <code>(?P&lt;name&gt; )</code> named, <code>(?: )</code> non-capturing, <code>|</code> alternation; lookarounds <code>(?= )</code>, <code>(?! )</code>.',
        ],
      },
      {
        heading: 'Raw Strings',
        body: `Always write patterns as raw strings — <code>r"\\d+"</code> — so Python does not interpret backslashes before the regex engine sees them.`,
      },
      {
        heading: 're Functions',
        body: `<code>re.search</code> finds the first match anywhere; <code>re.match</code> only at the start; <code>re.fullmatch</code> requires the whole string to match (best for validation). <code>re.findall</code> returns all matches (or groups) as a list; <code>re.finditer</code> yields match objects; <code>re.sub</code> replaces (the replacement can reference groups or be a function); <code>re.split</code> splits on a pattern. Match objects provide <code>group()</code>, <code>groups()</code>, <code>groupdict()</code>, <code>start()</code> and <code>end()</code>.`,
      },
      {
        heading: 'Flags and Compiling',
        body: `<code>re.IGNORECASE</code>, <code>re.MULTILINE</code> (<code>^</code>/<code>$</code> per line), <code>re.DOTALL</code> (<code>.</code> matches newlines) and <code>re.VERBOSE</code> (allow whitespace and comments in patterns). <code>re.compile(pattern)</code> creates a reusable pattern object — clearer when a pattern is used many times.`,
      },
    ],
    examples: [
      {
        caption: 'search, match, fullmatch, findall and finditer',
        code: `import re

text = "Order WN-1042 shipped on 2026-09-27; order WN-1043 on 2026-09-30."
print(re.search(r"WN-\\d+", text).group())
print(re.match(r"WN-\\d+", text), re.match(r"Order", text).group())
print(bool(re.fullmatch(r"\\d{6}", "411001")), bool(re.fullmatch(r"\\d{6}", "41100")))
print(re.findall(r"WN-(\\d+)", text))
print(re.findall(r"(\\d{4})-(\\d{2})-(\\d{2})", text))
for m in re.finditer(r"\\d{4}-\\d{2}-\\d{2}", text):
    print(m.group(), m.start(), m.end())`,
        output: `WN-1042
None Order
True False
['1042', '1043']
[('2026', '09', '27'), ('2026', '09', '30')]
2026-09-27 25 35
2026-09-30 54 64`,
      },
      {
        caption: 'Named groups, sub with backreferences and functions, split',
        code: `import re

log = "2026-09-27 10:15:02 ERROR payment failed user=asha amount=2999"
pattern = re.compile(r"(?P<date>\\S+) (?P<time>\\S+) (?P<level>[A-Z]+) (?P<msg>.*)")
m = pattern.match(log)
print(m.group("level"), "|", m.groupdict()["msg"])

print(re.sub(r"(\\d{4})-(\\d{2})-(\\d{2})", r"\\3/\\2/\\1", "Due 2026-09-27"))
print(re.sub(r"\\d{4}(?=\\d{4}$)", "****", "Card 1234567812345678"))
print(re.sub(r"\\d+", lambda m: str(int(m.group()) * 2), "3 pens and 10 books"))
print(re.split(r"[,;\\s]+", "python, java;  sql go"))
print(re.sub(r"\\s+", " ", "  too    many   spaces ").strip())`,
        output: `ERROR | payment failed user=asha amount=2999
Due 27/09/2026
Card 12345678****5678
6 pens and 20 books
['python', 'java', 'sql', 'go']
too many spaces`,
      },
      {
        caption: 'Validating common Indian and web formats',
        code: `import re

validators = {
    "email": re.compile(r"[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+"),
    "mobile": re.compile(r"(\\+91[\\s-]?)?[6-9]\\d{9}"),
    "pincode": re.compile(r"[1-9]\\d{5}"),
    "pan": re.compile(r"[A-Z]{5}\\d{4}[A-Z]"),
    "strong_password": re.compile(r"(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}"),
}
samples = {
    "email": ["asha@webnest.in", "bad@", "a.b+tag@mail.co.uk"],
    "mobile": ["9876543210", "+91 9876543210", "1234567890"],
    "pincode": ["411001", "011001"],
    "pan": ["ABCDE1234F", "ABCD1234F"],
    "strong_password": ["Passw0rd!", "password"],
}
for kind, values in samples.items():
    results = [f"{v}={'ok' if validators[kind].fullmatch(v) else 'no'}" for v in values]
    print(f"{kind:<16}", ", ".join(results))`,
        output: `email            asha@webnest.in=ok, bad@=no, a.b+tag@mail.co.uk=ok
mobile           9876543210=ok, +91 9876543210=ok, 1234567890=no
pincode          411001=ok, 011001=no
pan              ABCDE1234F=ok, ABCD1234F=no
strong_password  Passw0rd!=ok, password=no`,
      },
      {
        caption: 'Flags: IGNORECASE, MULTILINE, DOTALL and VERBOSE',
        code: `import re

print(re.findall(r"python", "Python PYTHON python", flags=re.IGNORECASE))
notes = "TODO: write tests\\nnote: fine\\nTODO: deploy"
print(re.findall(r"^TODO: (.*)$", notes, flags=re.MULTILINE))
html = "<p>line one\\nline two</p>"
print(re.search(r"<p>(.*)</p>", html), re.search(r"<p>(.*)</p>", html, re.DOTALL).group(1).split("\\n"))
print(re.findall(r"<.+?>", "<b>bold</b>"), re.findall(r"<.+>", "<b>bold</b>"))

price = re.compile(r"""
    (?P<currency>Rs\\.|₹)\\s*   # currency symbol
    (?P<amount>[\\d,]+)        # digits with commas
""", re.VERBOSE)
m = price.search("Total: ₹ 1,299 only")
print(m.group("currency"), int(m.group("amount").replace(",", "")))`,
        output: `['Python', 'PYTHON', 'python']
['write tests', 'deploy']
None ['line one', 'line two']
['<b>', '</b>'] ['<b>bold</b>']
₹ 1299`,
      },
    ],
    commonMistakes: [
      'Writing patterns without raw strings, so "\\b" becomes a backspace character.',
      'Using re.match when you meant re.search (match only checks the start).',
      'Validating with search instead of fullmatch, accepting strings that merely contain a valid part.',
      'Greedy .* swallowing too much — use non-greedy .*? or a more specific class.',
      'Parsing HTML or complex formats with regex instead of a proper parser.',
    ],
    keyPoints: [
      'Write patterns as raw strings: r"\\d+".',
      'search (anywhere), match (start), fullmatch (whole string), findall/finditer (all), sub, split.',
      'Groups, named groups and backreferences extract and rearrange text.',
      'Flags: IGNORECASE, MULTILINE, DOTALL, VERBOSE; compile reused patterns.',
    ],
  },

  'date-and-time': {
    title: 'Working with Dates and Times in Python',
    intro: `Dates and times appear in nearly every application: order timestamps, due dates, age calculations, subscription renewals, scheduling across time zones. Python's <code>datetime</code> module provides <code>date</code>, <code>time</code>, <code>datetime</code> and <code>timedelta</code> types, <code>zoneinfo</code> provides real time zones, and <code>calendar</code> and <code>time</code> cover the rest.

This lesson covers creating dates, formatting and parsing with <code>strftime</code>/<code>strptime</code> and ISO 8601, date arithmetic, time zones done correctly, and common business calculations.`,
    sections: [
      {
        heading: 'The Core Types',
        body: `<code>date(2026, 9, 27)</code> is a calendar date; <code>time(14, 30)</code> a time of day; <code>datetime(2026, 9, 27, 14, 30)</code> both; <code>timedelta(days=7, hours=3)</code> a duration. <code>date.today()</code> and <code>datetime.now()</code> give the current values. Objects are immutable — <code>replace()</code> returns a modified copy.`,
      },
      {
        heading: 'Formatting and Parsing',
        body: `<code>strftime(format)</code> turns a datetime into text and <code>datetime.strptime(text, format)</code> parses text. Common codes: <code>%Y</code> year, <code>%m</code> month, <code>%d</code> day, <code>%H</code>/<code>%I</code> hour (24/12), <code>%M</code> minute, <code>%S</code> second, <code>%p</code> AM/PM, <code>%A</code>/<code>%a</code> weekday name, <code>%B</code>/<code>%b</code> month name. For data exchange use ISO 8601: <code>isoformat()</code> and <code>fromisoformat()</code>.`,
      },
      {
        heading: 'Arithmetic',
        body: `Adding a <code>timedelta</code> moves a date; subtracting two dates gives a <code>timedelta</code> (<code>.days</code>, <code>.total_seconds()</code>). Dates compare with <code>&lt;</code> and <code>&gt;</code>. Months are not fixed-length, so "add one month" needs care — the third-party <code>python-dateutil</code> library provides <code>relativedelta</code> for that.`,
      },
      {
        heading: 'Time Zones',
        body: `A <strong>naive</strong> datetime has no time zone; an <strong>aware</strong> one does. Store and compute in UTC (<code>datetime.now(timezone.utc)</code>) and convert to local time only for display, using <code>zoneinfo.ZoneInfo("Asia/Kolkata")</code> and <code>astimezone()</code>. ZoneInfo handles daylight-saving rules correctly. Never compare naive and aware datetimes.`,
      },
    ],
    examples: [
      {
        caption: 'Creating dates, times, datetimes and durations',
        code: `from datetime import date, time, datetime, timedelta

d = date(2026, 9, 27)
t = time(14, 30, 15)
dt = datetime(2026, 9, 27, 14, 30)
print(d, t, dt)
print(d.year, d.month, d.day, d.weekday(), d.isoweekday(), d.strftime("%A"))
print(dt.date(), dt.time(), datetime.combine(d, t))
print(d.replace(year=2027), timedelta(days=1, hours=3).total_seconds())
print(type(date.today()).__name__, type(datetime.now()).__name__)`,
        output: `2026-09-27 14:30:15 2026-09-27 14:30:00
2026 9 27 6 7 Sunday
2026-09-27 14:30:00 2026-09-27 14:30:15
2027-09-27 97200.0
date datetime`,
      },
      {
        caption: 'Formatting with strftime and parsing with strptime and ISO 8601',
        code: `from datetime import datetime

dt = datetime(2026, 9, 27, 18, 5, 9)
print(dt.strftime("%d/%m/%Y %H:%M"))
print(dt.strftime("%a, %d %b %Y %I:%M %p"))
print(dt.strftime("%B %d, %Y"), dt.strftime("%Y%m%d"))

parsed = datetime.strptime("27-09-2026 06:30 PM", "%d-%m-%Y %I:%M %p")
print(parsed, parsed.hour)
iso = dt.isoformat()
print(iso, datetime.fromisoformat(iso) == dt)
try:
    datetime.strptime("2026/09/27", "%d-%m-%Y")
except ValueError as e:
    print("ValueError:", e)`,
        output: `27/09/2026 18:05
Sun, 27 Sep 2026 06:05 PM
September 27, 2026 20260927
2026-09-27 18:30:00 18
2026-09-27T18:05:09 True
ValueError: time data '2026/09/27' does not match format '%d-%m-%Y'`,
      },
      {
        caption: 'Date arithmetic: due dates, ages and countdowns',
        code: `from datetime import date, datetime, timedelta

order_day = date(2026, 9, 27)
print("delivery by", order_day + timedelta(days=5))
print("return window closes", order_day + timedelta(weeks=2))

def age(born, today):
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

print("age:", age(date(2001, 12, 15), date(2026, 9, 27)))

start = datetime(2026, 9, 27, 9, 15)
end = datetime(2026, 9, 28, 11, 45)
gap = end - start
print(gap, gap.days, gap.seconds // 3600, gap.total_seconds() / 3600)
print(date(2026, 10, 1) > order_day, (date(2026, 12, 31) - order_day).days, "days left in 2026")

d = date(2026, 9, 27)
while d.weekday() >= 5:              # move weekend dates to Monday
    d += timedelta(days=1)
print("next working day:", d)`,
        output: `delivery by 2026-10-02
return window closes 2026-10-11
age: 24
1 day, 2:30:00 1 2 26.5
True 95 days left in 2026
next working day: 2026-09-28`,
      },
      {
        caption: 'Time zones with zoneinfo',
        code: `from datetime import datetime, timezone
from zoneinfo import ZoneInfo

utc_time = datetime(2026, 9, 27, 12, 0, tzinfo=timezone.utc)
for city, zone in [("Pune", "Asia/Kolkata"), ("London", "Europe/London"), ("New York", "America/New_York")]:
    local = utc_time.astimezone(ZoneInfo(zone))
    print(f"{city:<9} {local:%Y-%m-%d %H:%M %Z (UTC%z)}")

meeting = datetime(2026, 12, 1, 10, 0, tzinfo=ZoneInfo("Europe/London"))
print("London 10:00 in India:", meeting.astimezone(ZoneInfo("Asia/Kolkata")).strftime("%H:%M"))

naive = datetime(2026, 9, 27, 12, 0)
try:
    naive < utc_time
except TypeError as e:
    print("TypeError:", e)`,
        output: `Pune      2026-09-27 17:30 IST (UTC+0530)
London    2026-09-27 13:00 BST (UTC+0100)
New York  2026-09-27 08:00 EDT (UTC-0400)
London 10:00 in India: 15:30
TypeError: can't compare offset-naive and offset-aware datetimes`,
        runnable: false,
      },
      {
        caption: 'The calendar and time modules',
        code: `import calendar
import time

print(calendar.month(2026, 9))
first_weekday, days = calendar.monthrange(2026, 2)   # weekday 0=Mon ... 6=Sun
print(calendar.isleap(2028), (int(first_weekday), days), calendar.day_name[0])
start = time.perf_counter()
time.sleep(0.1)
print("slept about", round(time.perf_counter() - start, 1), "seconds")
print(time.strftime("%Y", time.gmtime(0)))`,
        output: `   September 2026
Mo Tu We Th Fr Sa Su
    1  2  3  4  5  6
 7  8  9 10 11 12 13
14 15 16 17 18 19 20
21 22 23 24 25 26 27
28 29 30

True (6, 28) Monday
slept about 0.1 seconds
1970`,
      },
    ],
    commonMistakes: [
      'Storing local times without a time zone, causing bugs around daylight saving and in multi-region apps.',
      'Comparing naive and aware datetimes (TypeError).',
      'Mixing up %m (month) and %M (minute) in format strings.',
      'Adding 30 days to mean "one month".',
      'Using datetime.utcnow() (deprecated) instead of datetime.now(timezone.utc).',
    ],
    keyPoints: [
      'date, time, datetime and timedelta are the core types.',
      'strftime formats, strptime parses; use ISO 8601 for data exchange.',
      'Subtracting dates gives timedeltas; add timedeltas to move dates.',
      'Store UTC, convert with zoneinfo.ZoneInfo for display.',
      'calendar and time cover calendars, sleeping and precise timing.',
    ],
  },

  multithreading: {
    title: 'Multithreading in Python',
    intro: `Many programs spend most of their time waiting: for web pages to download, for API responses, for database queries, for files to be read. <strong>Threads</strong> let one program wait on many things at once, so twenty slow downloads take about as long as the slowest one instead of the sum of all of them.

This lesson covers the <code>threading</code> module, the high-level <code>concurrent.futures.ThreadPoolExecutor</code>, race conditions and locks, thread-safe queues for producer/consumer designs, and the Global Interpreter Lock (GIL) — including Python's new free-threaded builds.`,
    sections: [
      {
        heading: 'Threads and the GIL',
        body: `A thread is an independent flow of execution within a process; threads share memory. In standard CPython, the <strong>Global Interpreter Lock</strong> lets only one thread execute Python bytecode at a time, so threads do not speed up CPU-heavy pure-Python code — but the GIL is released while waiting for I/O, so threads are excellent for I/O-bound work. Python 3.13+ offers an optional free-threaded build without the GIL; for CPU-bound work today, use multiprocessing.`,
      },
      {
        heading: 'Creating Threads',
        body: `<code>threading.Thread(target=func, args=(...))</code> creates a thread, <code>start()</code> runs it and <code>join()</code> waits for it to finish. Daemon threads (<code>daemon=True</code>) are killed when the main program exits. In most code, prefer <code>ThreadPoolExecutor</code>: it reuses a pool of threads, returns results through futures, and propagates exceptions.`,
      },
      {
        heading: 'Race Conditions and Locks',
        body: `When threads modify shared data, operations like <code>count += 1</code> (read, add, write) can interleave and lose updates. Protect shared state with <code>threading.Lock</code> in a <code>with</code> block, or avoid sharing entirely by returning results and using thread-safe <code>queue.Queue</code>. Other primitives include <code>RLock</code>, <code>Semaphore</code> (limit concurrency), <code>Event</code> (signal between threads) and <code>Condition</code>.`,
      },
      {
        heading: 'Threads vs asyncio vs Processes',
        body: `Use <strong>threads</strong> for I/O-bound work with blocking libraries (requests, database drivers). Use <strong>asyncio</strong> for very high numbers of concurrent I/O operations with async libraries. Use <strong>processes</strong> for CPU-bound work.`,
      },
    ],
    examples: [
      {
        caption: 'Starting and joining threads',
        code: `import threading
import time

def download(name, seconds):
    time.sleep(seconds)                     # simulated network wait
    print(f"{name} done")                   # finishing order can vary between runs

start = time.perf_counter()
threads = [threading.Thread(target=download, args=(f"file{i}", 0.3)) for i in range(1, 4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
elapsed = time.perf_counter() - start
print(f"3 downloads in ~{elapsed:.1f}s (sequential would take ~0.9s)")`,
        output: `file1 done
file2 done
file3 done
3 downloads in ~0.3s (sequential would take ~0.9s)`,
        runnable: false,
      },
      {
        caption: 'ThreadPoolExecutor with results and exceptions',
        code: `from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def fetch_price(product):
    time.sleep(0.2)
    if product == "broken":
        raise ValueError("price service error")
    return product, len(product) * 100

products = ["pen", "notebook", "broken", "bag"]
with ThreadPoolExecutor(max_workers=4) as pool:
    futures = {pool.submit(fetch_price, p): p for p in products}
    results = {}
    for future in as_completed(futures):
        name = futures[future]
        try:
            product, price = future.result()
            results[product] = price
        except ValueError as e:
            results[name] = f"failed: {e}"

print(dict(sorted(results.items())))

with ThreadPoolExecutor() as pool:
    print(list(pool.map(str.upper, ["a", "b", "c"])))`,
        output: `{'bag': 300, 'broken': 'failed: price service error', 'notebook': 800, 'pen': 300}
['A', 'B', 'C']`,
        runnable: false,
      },
      {
        caption: 'A race condition and fixing it with a Lock',
        code: `import threading
import time

counter = 0
lock = threading.Lock()

def unsafe_increment(n):
    global counter
    for _ in range(n):
        value = counter
        time.sleep(0)  # give another thread a chance to run mid-update
        counter = value + 1

def safe_increment(n):
    global counter
    for _ in range(n):
        with lock:
            value = counter
            time.sleep(0)
            counter = value + 1

for worker in (unsafe_increment, safe_increment):
    counter = 0
    threads = [threading.Thread(target=worker, args=(10_000,)) for _ in range(4)]
    [t.start() for t in threads]
    [t.join() for t in threads]
    print(f"{worker.__name__}: {counter} (expected 40000)")

# Without time.sleep(0), CPython's GIL rarely switches threads between the read
# and the write, so the bug can hide for a long time. It is still a bug: real
# code does I/O or other work there, and that is when updates get lost.`,
        output: `unsafe_increment: 10296 (expected 40000)
safe_increment: 40000 (expected 40000)

(The unsafe total is different on every run. The locked total is always 40000.)`,
        runnable: false,
      },
      {
        caption: 'Producer/consumer with queue.Queue',
        code: `import queue
import threading

tasks = queue.Queue()
results = []

def worker(worker_id):
    while True:
        item = tasks.get()
        if item is None:              # sentinel: stop
            tasks.task_done()
            break
        results.append((item, item ** 2))
        tasks.task_done()

workers = [threading.Thread(target=worker, args=(i,)) for i in range(3)]
for w in workers:
    w.start()
for n in range(1, 7):
    tasks.put(n)
for _ in workers:
    tasks.put(None)
tasks.join()
print(sorted(results))`,
        output: `[(1, 1), (2, 4), (3, 9), (4, 16), (5, 25), (6, 36)]`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Using threads to speed up CPU-bound pure-Python code (the GIL prevents it) — use processes.',
      'Modifying shared variables from several threads without a lock.',
      'Forgetting join(), so the main program continues before workers finish.',
      'Swallowing exceptions in threads; ThreadPoolExecutor futures re-raise them with result().',
    ],
    keyPoints: [
      'Threads suit I/O-bound work; the GIL limits CPU-bound parallelism in standard CPython.',
      'ThreadPoolExecutor with submit/map/as_completed is the easiest API.',
      'Protect shared state with Lock, or avoid sharing and use queue.Queue.',
      'Choose threads, asyncio or processes based on the workload.',
    ],
  },

  multiprocessing: {
    title: 'Multiprocessing in Python',
    intro: `For CPU-heavy work — image processing, number crunching, parsing huge files, training simple models — threads do not help in standard Python because of the GIL. <strong>Processes</strong> do: each process has its own Python interpreter and memory, so several processes run truly in parallel on multiple CPU cores.

This lesson covers the <code>multiprocessing</code> module, <code>ProcessPoolExecutor</code>, why the <code>if __name__ == "__main__"</code> guard is mandatory, passing data between processes, shared state, and the costs to be aware of.`,
    sections: [
      {
        heading: 'Processes and Pools',
        body: `<code>multiprocessing.Process(target=func, args=...)</code> starts a separate process; <code>Pool</code> and the higher-level <code>concurrent.futures.ProcessPoolExecutor</code> distribute work across a pool of worker processes (by default one per CPU core, see <code>os.cpu_count()</code>). The API mirrors ThreadPoolExecutor: <code>submit()</code>, <code>map()</code> and futures.`,
      },
      {
        heading: 'The __main__ Guard',
        body: `On Windows and macOS, child processes are started by importing your main module again ("spawn"). Without <code>if __name__ == "__main__":</code> around the code that creates processes, each child would start new children endlessly. Functions sent to workers must be defined at module top level so they can be pickled.`,
      },
      {
        heading: 'Communication and Shared State',
        body: `Processes do not share memory by default; arguments and results are pickled and sent between them. <code>multiprocessing.Queue</code> and <code>Pipe</code> exchange messages; <code>Value</code>, <code>Array</code> and <code>Manager</code> provide shared state with locks. Prefer passing inputs and returning results over sharing state.`,
      },
      {
        heading: 'Costs and Alternatives',
        body: `Starting processes and pickling data takes time and memory, so parallelism pays off only when each task does substantial work. Send chunks of work (<code>chunksize</code>) rather than tiny tasks. For numeric work, NumPy's vectorised operations often beat manual multiprocessing; for large-scale data, tools like Dask or PySpark distribute work across machines.`,
      },
    ],
    examples: [
      {
        caption: 'Parallel CPU-bound work with ProcessPoolExecutor',
        code: `# primes.py  — run with: python primes.py
import math
import os
import time
from concurrent.futures import ProcessPoolExecutor

def count_primes(limit):
    count = 0
    for n in range(2, limit):
        if all(n % d for d in range(2, math.isqrt(n) + 1)):
            count += 1
    return count

if __name__ == "__main__":            # required for multiprocessing
    jobs = [150_000] * 8
    start = time.perf_counter()
    sequential = [count_primes(j) for j in jobs]
    t_seq = time.perf_counter() - start

    start = time.perf_counter()
    with ProcessPoolExecutor() as pool:
        parallel = list(pool.map(count_primes, jobs))
    t_par = time.perf_counter() - start

    print("cores:", os.cpu_count(), "same results:", sequential == parallel)
    print(f"sequential {t_seq:.1f}s, parallel {t_par:.1f}s")`,
        output: `cores: 8 same results: True
sequential 6.4s, parallel 1.3s`,
        runnable: false,
      },
      {
        caption: 'Process, Queue and a Pool with starmap',
        code: `from multiprocessing import Process, Queue, Pool

def producer(q):
    for i in range(3):
        q.put(f"message {i}")
    q.put(None)

def area(width, height):
    return width * height

if __name__ == "__main__":
    q = Queue()
    p = Process(target=producer, args=(q,))
    p.start()
    while (msg := q.get()) is not None:
        print("received", msg)
    p.join()

    with Pool(processes=4) as pool:
        print(pool.map(abs, [-1, -2, 3]))
        print(pool.starmap(area, [(2, 3), (4, 5), (6, 7)]))`,
        output: `received message 0
received message 1
received message 2
[1, 2, 3]
[6, 20, 42]`,
        runnable: false,
      },
      {
        caption: 'Shared counter with Value and a Lock',
        code: `from multiprocessing import Process, Value

def add_many(total, n):
    for _ in range(n):
        with total.get_lock():
            total.value += 1

if __name__ == "__main__":
    total = Value("i", 0)
    workers = [Process(target=add_many, args=(total, 10_000)) for _ in range(4)]
    for w in workers:
        w.start()
    for w in workers:
        w.join()
    print(total.value)`,
        output: `40000`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Omitting the if __name__ == "__main__" guard, causing errors or endless process creation on Windows/macOS.',
      'Parallelising tiny tasks where process start-up and pickling costs outweigh the benefit.',
      'Passing lambdas or nested functions to process pools (they cannot be pickled).',
      'Expecting global variables changed in a child process to change in the parent.',
    ],
    keyPoints: [
      'Processes bypass the GIL and run CPU-bound work in parallel on multiple cores.',
      'ProcessPoolExecutor / Pool distribute work; APIs mirror thread pools.',
      'Always guard process creation with if __name__ == "__main__".',
      'Data is pickled between processes; use Queue/Pipe/Value/Manager for communication.',
      'Parallelise substantial tasks; consider NumPy, Dask or PySpark for heavy data work.',
    ],
  },

  'searching-algorithms': {
    title: 'Searching Algorithms in Python',
    intro: `Searching — finding whether and where an item appears — is one of the most fundamental tasks in programming and a favourite interview topic. The right algorithm can make the difference between checking a million items and checking twenty.

This lesson implements and compares linear search, binary search (iterative and recursive), jump search and interpolation search, explains their time complexity, and shows Python's built-in tools (<code>in</code>, <code>index</code>, <code>bisect</code>, sets and dicts).`,
    sections: [
      {
        heading: 'Linear Search — O(n)',
        body: `Check each element in turn until you find the target. It works on any list, sorted or not, and is the right choice for small or unsorted data. Python's <code>in</code> operator and <code>list.index()</code> perform linear searches.`,
      },
      {
        heading: 'Binary Search — O(log n)',
        body: `On a <strong>sorted</strong> list, compare the target with the middle element and discard half of the remaining range each step. A million items need at most 20 comparisons. The standard <code>bisect</code> module provides <code>bisect_left</code>, <code>bisect_right</code> and <code>insort</code> for searching and inserting into sorted lists.`,
      },
      {
        heading: 'Jump and Interpolation Search',
        body: `<strong>Jump search</strong> jumps ahead in blocks of √n and then scans linearly — O(√n). <strong>Interpolation search</strong> estimates the position from the values (like opening a dictionary near "P" for "Python") — O(log log n) on uniformly distributed data, but O(n) in the worst case.`,
      },
      {
        heading: 'Choosing in Practice',
        body: `For repeated membership tests, a <code>set</code> or <code>dict</code> gives O(1) average lookups and beats every search algorithm. Use binary search when data is already sorted and you need ordering-based queries (e.g. "the first price above 500").`,
      },
    ],
    examples: [
      {
        caption: 'Linear search',
        code: `def linear_search(items, target):
    for index, value in enumerate(items):
        if value == target:
            return index
    return -1

marks = [72, 45, 91, 38, 66]
print(linear_search(marks, 91), linear_search(marks, 100))
print(91 in marks, marks.index(91))`,
        output: `2 -1
True 2`,
      },
      {
        caption: 'Binary search: iterative and recursive, with step counting',
        code: `def binary_search(items, target):
    low, high, steps = 0, len(items) - 1, 0
    while low <= high:
        steps += 1
        mid = (low + high) // 2
        if items[mid] == target:
            return mid, steps
        if items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1, steps

def binary_search_recursive(items, target, low=0, high=None):
    if high is None:
        high = len(items) - 1
    if low > high:
        return -1
    mid = (low + high) // 2
    if items[mid] == target:
        return mid
    if items[mid] < target:
        return binary_search_recursive(items, target, mid + 1, high)
    return binary_search_recursive(items, target, low, mid - 1)

data = list(range(0, 2_000_000, 2))          # one million sorted even numbers
print(binary_search(data, 1_234_568))
print(binary_search(data, 7))
print(binary_search_recursive([3, 8, 15, 21, 42], 21))`,
        output: `(617284, 17)
(-1, 20)
3`,
      },
      {
        caption: 'The bisect module',
        code: `import bisect

prices = [99, 199, 299, 499, 999, 1999]
print(bisect.bisect_left(prices, 499), bisect.bisect_right(prices, 499))
first_above_500 = prices[bisect.bisect_right(prices, 500)]
print("first price above 500:", first_above_500)
bisect.insort(prices, 650)
print(prices)

def grade(score, cutoffs=(40, 60, 75, 90), grades="FDCBA"):
    return grades[bisect.bisect(cutoffs, score)]
print([grade(s) for s in (33, 59, 60, 88, 95)])`,
        output: `3 4
first price above 500: 999
[99, 199, 299, 499, 650, 999, 1999]
['F', 'D', 'C', 'B', 'A']`,
      },
      {
        caption: 'Jump search and interpolation search',
        code: `import math

def jump_search(items, target):
    n = len(items)
    step = int(math.sqrt(n))
    prev = 0
    while prev < n and items[min(prev + step, n) - 1] < target:
        prev += step
    for i in range(prev, min(prev + step, n)):
        if items[i] == target:
            return i
    return -1

def interpolation_search(items, target):
    low, high = 0, len(items) - 1
    while low <= high and items[low] <= target <= items[high]:
        if items[high] == items[low]:
            return low if items[low] == target else -1
        pos = low + (target - items[low]) * (high - low) // (items[high] - items[low])
        if items[pos] == target:
            return pos
        if items[pos] < target:
            low = pos + 1
        else:
            high = pos - 1
    return -1

data = list(range(10, 1010, 10))
print(jump_search(data, 730), jump_search(data, 735))
print(interpolation_search(data, 730), interpolation_search(data, 5))`,
        output: `72 -1
72 -1`,
      },
    ],
    commonMistakes: [
      'Running binary search on unsorted data.',
      'Computing mid incorrectly or using low < high instead of low <= high, missing the last element.',
      'Sorting data just to do a single search — a linear search is cheaper for one lookup.',
      'Writing custom search loops where a set, dict or bisect is simpler and faster.',
    ],
    keyPoints: [
      'Linear search: O(n), works on any data.',
      'Binary search: O(log n), requires sorted data; bisect implements it.',
      'Jump search O(√n); interpolation search O(log log n) on uniform data.',
      'Sets and dicts give O(1) membership for repeated lookups.',
    ],
  },

  'sorting-algorithms': {
    title: 'Sorting Algorithms in Python',
    intro: `Sorting is everywhere — leaderboards, search results, reports — and sorting algorithms are the classic way to learn algorithmic thinking and complexity analysis. In real Python code you will almost always use the built-in <code>sorted()</code> and <code>list.sort()</code>, which use the highly optimised <strong>Timsort</strong>. Knowing how the classic algorithms work is still essential for interviews and for understanding performance.

This lesson implements bubble, selection, insertion, merge, quick and heap sort, explains Timsort, and compares their time complexity, stability and memory use.`,
    sections: [
      {
        heading: 'Simple O(n²) Sorts',
        body: `<strong>Bubble sort</strong> repeatedly swaps adjacent out-of-order items so the largest "bubbles" to the end; with an early-exit flag it is O(n) on already-sorted data. <strong>Selection sort</strong> repeatedly selects the smallest remaining item and puts it in place — always O(n²), but few swaps. <strong>Insertion sort</strong> builds a sorted prefix by inserting each new item into place — fast for small or nearly sorted lists, which is why Timsort uses it internally.`,
      },
      {
        heading: 'Efficient O(n log n) Sorts',
        body: `<strong>Merge sort</strong> splits the list in half, sorts each half recursively and merges them — always O(n log n), stable, but needs O(n) extra memory. <strong>Quick sort</strong> partitions around a pivot and sorts each side — O(n log n) on average, O(n²) in the worst case (mitigated by random pivots). <strong>Heap sort</strong> builds a heap and extracts the minimum repeatedly — O(n log n) with O(1) extra memory, but not stable.`,
      },
      {
        heading: 'Timsort: Python\'s Built-in Sort',
        body: `Timsort (created by Tim Peters for Python) finds already-ordered "runs" in the data, extends short runs with insertion sort, and merges runs efficiently. It is O(n log n) in the worst case, O(n) on sorted data, and <strong>stable</strong> — equal items keep their original order, which lets you sort by several keys in successive passes.`,
      },
      {
        heading: 'Comparison',
        body: `Summary of the algorithms:`,
        list: [
          'Bubble — best O(n), average/worst O(n²), stable, in place.',
          'Selection — O(n²) always, not stable, in place.',
          'Insertion — best O(n), worst O(n²), stable, in place.',
          'Merge — O(n log n) always, stable, O(n) extra memory.',
          'Quick — average O(n log n), worst O(n²), not stable, in place.',
          'Heap — O(n log n), not stable, in place.',
          'Timsort — best O(n), worst O(n log n), stable (Python\'s sorted/sort).',
        ],
      },
    ],
    examples: [
      {
        caption: 'Bubble, selection and insertion sort',
        code: `def bubble_sort(items):
    a = items[:]
    for end in range(len(a) - 1, 0, -1):
        swapped = False
        for i in range(end):
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]
                swapped = True
        if not swapped:
            break
    return a

def selection_sort(items):
    a = items[:]
    for i in range(len(a)):
        smallest = min(range(i, len(a)), key=a.__getitem__)
        a[i], a[smallest] = a[smallest], a[i]
    return a

def insertion_sort(items):
    a = items[:]
    for i in range(1, len(a)):
        current, j = a[i], i - 1
        while j >= 0 and a[j] > current:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = current
    return a

data = [64, 25, 12, 22, 11, 90, 5]
print(bubble_sort(data))
print(selection_sort(data))
print(insertion_sort(data))`,
        output: `[5, 11, 12, 22, 25, 64, 90]
[5, 11, 12, 22, 25, 64, 90]
[5, 11, 12, 22, 25, 64, 90]`,
      },
      {
        caption: 'Merge sort, quick sort and heap sort',
        code: `import heapq
import random

def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    merged, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    return merged + left[i:] + right[j:]

def quick_sort(a):
    if len(a) <= 1:
        return a
    pivot = random.choice(a)
    return (quick_sort([x for x in a if x < pivot])
            + [x for x in a if x == pivot]
            + quick_sort([x for x in a if x > pivot]))

def heap_sort(a):
    heap = a[:]
    heapq.heapify(heap)
    return [heapq.heappop(heap) for _ in range(len(heap))]

data = [38, 27, 43, 3, 9, 82, 10, 27]
print(merge_sort(data))
print(quick_sort(data))
print(heap_sort(data))`,
        output: `[3, 9, 10, 27, 27, 38, 43, 82]
[3, 9, 10, 27, 27, 38, 43, 82]
[3, 9, 10, 27, 27, 38, 43, 82]`,
      },
      {
        caption: 'Timsort in practice: stability and multi-key sorting',
        code: `students = [("Asha", "B", 88), ("Ravi", "A", 72), ("Meera", "B", 95), ("Kiran", "A", 72)]

# Stable sorting: sort by the secondary key first, then by the primary key
by_name = sorted(students, key=lambda s: s[0])
by_section_then_name = sorted(by_name, key=lambda s: s[1])
print([s[0] for s in by_section_then_name])

# Or in one pass with a tuple key: highest marks first, then name
ranked = sorted(students, key=lambda s: (-s[2], s[0]))
print([(s[0], s[2]) for s in ranked])`,
        output: `['Kiran', 'Ravi', 'Asha', 'Meera']
[('Meera', 95), ('Asha', 88), ('Kiran', 72), ('Ravi', 72)]`,
      },
      {
        caption: 'Comparing speed on the same data',
        code: `import random
import time

random.seed(1)
data = [random.randint(0, 10_000) for _ in range(3_000)]

def insertion_sort(items):
    a = items[:]
    for i in range(1, len(a)):
        current, j = a[i], i - 1
        while j >= 0 and a[j] > current:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = current
    return a

def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]

timings = {}
for name, fn in [("insertion O(n^2)", insertion_sort), ("merge O(n log n)", merge_sort), ("built-in Timsort", sorted)]:
    start = time.perf_counter()
    result = fn(data)
    timings[name] = time.perf_counter() - start
    assert result == sorted(data)

fastest = min(timings, key=timings.get)
print("all results correct; fastest:", fastest)
print("insertion slower than merge:", timings["insertion O(n^2)"] > timings["merge O(n log n)"])`,
        output: `all results correct; fastest: built-in Timsort
insertion slower than merge: True`,
      },
    ],
    commonMistakes: [
      'Implementing your own sort in production code instead of using sorted()/list.sort().',
      'Forgetting that list.sort() sorts in place and returns None.',
      'Using the first element as quick sort\'s pivot on already-sorted data, causing O(n²).',
      'Assuming all sorts are stable — selection, quick and heap sort are not.',
    ],
    keyPoints: [
      'Bubble, selection and insertion sort are O(n²); insertion is fast on nearly sorted data.',
      'Merge, quick and heap sort are O(n log n) (quick sort on average).',
      'Python uses Timsort: stable, O(n log n) worst case, O(n) on sorted data.',
      'Stability enables multi-key sorting; tuple keys do it in one pass.',
    ],
  },

  'classic-python-programs': {
    title: 'Classic Python Programs for Practice',
    intro: `Small, classic programs are the best way to build fluency and prepare for coding interviews and exams. Each one combines basics — loops, conditions, functions, recursion, data structures — into a complete solution.

This lesson solves the most commonly asked programs, several in more than one way: Fibonacci numbers (including the nth Fibonacci number), prime checks and the Sieve of Eratosthenes, palindromes, factorial, the second largest number in a list, Tower of Hanoi, Armstrong numbers, anagrams, reversing, GCD, FizzBuzz, and a simple pattern.`,
    sections: [
      {
        heading: 'How to Practise',
        body: `For each program: write it yourself before reading the solution; test edge cases (empty list, 0, 1, negative numbers, duplicates); then improve it — can you make it faster, shorter, or more readable? Compare an iterative and a recursive solution where both exist.`,
      },
      {
        heading: 'Complexity Matters',
        body: `Many of these programs have a naive solution and an efficient one: recursive Fibonacci is exponential, while the iterative version is linear; checking primes by testing every divisor is O(n), while testing up to √n is O(√n), and the Sieve finds all primes up to n in O(n log log n). Interviewers expect you to discuss this.`,
      },
    ],
    examples: [
      {
        caption: 'Fibonacci: first n numbers and the nth number (three ways)',
        code: `from functools import cache

def fibonacci_series(n):
    a, b, series = 0, 1, []
    for _ in range(n):
        series.append(a)
        a, b = b, a + b
    return series

def nth_fibonacci_iterative(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

@cache
def nth_fibonacci_recursive(n):
    return n if n < 2 else nth_fibonacci_recursive(n - 1) + nth_fibonacci_recursive(n - 2)

def fib_generator():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

print(fibonacci_series(10))
print(nth_fibonacci_iterative(50), nth_fibonacci_recursive(50))
gen = fib_generator()
print([next(gen) for _ in range(8)])`,
        output: `[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
12586269025 12586269025
[0, 1, 1, 2, 3, 5, 8, 13]`,
      },
      {
        caption: 'Primes: a single check and the Sieve of Eratosthenes',
        code: `import math

def is_prime(n):
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    return all(n % d for d in range(3, math.isqrt(n) + 1, 2))

def sieve(limit):
    is_p = [True] * (limit + 1)
    is_p[0:2] = [False, False]
    for n in range(2, math.isqrt(limit) + 1):
        if is_p[n]:
            is_p[n * n::n] = [False] * len(range(n * n, limit + 1, n))
    return [n for n, prime in enumerate(is_p) if prime]

print([n for n in range(20) if is_prime(n)])
print(is_prime(97), is_prime(1_000_003))
print(sieve(50))`,
        output: `[2, 3, 5, 7, 11, 13, 17, 19]
True True
[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]`,
      },
      {
        caption: 'Second largest number, palindromes, anagrams and reversing',
        code: `def second_largest(numbers):
    first = second = None
    for n in numbers:
        if first is None or n > first:
            first, second = n, first
        elif n != first and (second is None or n > second):
            second = n
    return second

def is_palindrome(text):
    cleaned = "".join(ch.lower() for ch in text if ch.isalnum())
    return cleaned == cleaned[::-1]

def are_anagrams(a, b):
    return sorted(a.replace(" ", "").lower()) == sorted(b.replace(" ", "").lower())

print(second_largest([10, 45, 32, 45, 8]), second_largest([5, 5]), sorted(set([10, 45, 32, 45, 8]))[-2])
print(is_palindrome("A man, a plan, a canal: Panama"), is_palindrome("Python"), str(12321) == str(12321)[::-1])
print(are_anagrams("Listen", "Silent"), are_anagrams("Dormitory", "Dirty room"), are_anagrams("abc", "abd"))
print("Webnest"[::-1], int(str(12345)[::-1]), " ".join(reversed("learn python daily".split())))`,
        output: `32 None 32
True False True
True True False
tsenbeW 54321 daily python learn`,
      },
      {
        caption: 'Tower of Hanoi',
        code: `def hanoi(n, source, target, spare, moves):
    if n == 0:
        return
    hanoi(n - 1, source, spare, target, moves)
    moves.append(f"Move disk {n} from {source} to {target}")
    hanoi(n - 1, spare, target, source, moves)

moves = []
hanoi(3, "A", "C", "B", moves)
print("\\n".join(moves))
print("total moves:", len(moves), "| formula 2^n - 1 =", 2 ** 3 - 1)`,
        output: `Move disk 1 from A to C
Move disk 2 from A to B
Move disk 1 from C to B
Move disk 3 from A to C
Move disk 1 from B to A
Move disk 2 from B to C
Move disk 1 from A to C
total moves: 7 | formula 2^n - 1 = 7`,
      },
      {
        caption: 'Factorial, Armstrong numbers, GCD, FizzBuzz and a pattern',
        code: `import math

def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

def is_armstrong(n):
    digits = str(n)
    return n == sum(int(d) ** len(digits) for d in digits)

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

print(factorial(10), math.factorial(10))
print([n for n in range(1, 1000) if is_armstrong(n) and n > 9])
print(gcd(84, 36), math.gcd(84, 36))
print(" ".join("FizzBuzz" if i % 15 == 0 else "Fizz" if i % 3 == 0 else "Buzz" if i % 5 == 0 else str(i) for i in range(1, 16)))
for row in range(1, 5):
    print(" " * (4 - row) + "*" * (2 * row - 1))`,
        output: `3628800 3628800
[153, 370, 371, 407]
12 12
1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz
   *
  ***
 *****
*******`,
      },
    ],
    commonMistakes: [
      'Using plain recursive Fibonacci for large n without memoization.',
      'Finding the second largest with sorted(nums)[-2], which fails with duplicates of the maximum.',
      'Checking primes by testing all divisors up to n instead of √n.',
      'Ignoring case, spaces and punctuation in palindrome and anagram checks.',
    ],
    keyPoints: [
      'Classic programs build fluency with loops, recursion and data structures.',
      'Prefer efficient versions: iterative/memoized Fibonacci, √n prime checks, the Sieve.',
      'Handle edge cases: duplicates, empty input, 0 and 1.',
      'Tower of Hanoi needs 2^n − 1 moves and is the classic recursion example.',
    ],
  },
}
