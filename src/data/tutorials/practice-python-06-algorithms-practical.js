// Practice blocks for the Python Algorithms and Classic Programs and Practical Python
// modules. Merged onto the lesson entries in index.js by slug, so the lesson prose files
// stay unchanged. The HTTP exercise builds and reads requests without using the network.
export const practicePythonAlgorithmsPractical = {
  'searching-algorithms': {
    whyItMatters: `Finding an item in a collection is one of the most frequent operations in software, and the method chosen decides whether it takes twenty steps or a million. Binary search is the standard example of an algorithm that is fast because it discards half of the remaining data at each step, and it is asked for in a large share of coding interviews.`,
    complexity: [
      { operation: 'Linear search', average: 'O(n)', worst: 'O(n)' },
      { operation: 'Binary search (sorted data)', average: 'O(log n)', worst: 'O(log n)' },
      { operation: '<code>x in set</code> or dictionary lookup', average: 'O(1)', worst: 'O(n)' },
    ],
    exercise: {
      prompt: `Implement binary search on a sorted list, returning the index of the target or <code>-1</code> when it is not present. Then use the <code>bisect</code> module to print the position at which 25 would be inserted into a sorted list.

Expected output: <code>4</code>, <code>-1</code>, <code>2</code> (one per line)`,
      starterCode: `from bisect import bisect_left


def binary_search(items, target):
    low = 0
    high = len(items) - 1

    # TODO: while the range is not empty, compare the middle item with the target
    #       and continue in the left or the right half

    return -1


numbers = [2, 5, 8, 12, 16, 23, 38]
print(binary_search(numbers, 16))
print(binary_search(numbers, 7))

# TODO: print where 25 would be inserted in [10, 20, 30, 40]`,
      hints: [
        'The loop runs while <code>low &lt;= high</code>, with <code>mid = (low + high) // 2</code>.',
        'If the middle item is smaller than the target, set <code>low = mid + 1</code>; if larger, set <code>high = mid - 1</code>.',
      ],
      solution: `from bisect import bisect_left


def binary_search(items, target):
    low = 0
    high = len(items) - 1

    while low <= high:
        mid = (low + high) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1


numbers = [2, 5, 8, 12, 16, 23, 38]
print(binary_search(numbers, 16))
print(binary_search(numbers, 7))

print(bisect_left([10, 20, 30, 40], 25))`,
    },
    quiz: [
      {
        question: 'What must be true of a list before binary search can be used on it?',
        options: ['It must be sorted', 'It must have an even length', 'It must contain no duplicates', 'It must contain numbers'],
        answer: 0,
        explanation: 'Discarding half of the range is only valid when the items are in order.',
      },
      {
        question: 'About how many comparisons does binary search need, at most, for a million sorted items?',
        options: ['1,000', '20', '500,000', '1,000,000'],
        answer: 1,
        explanation: 'Each step halves the range, and 2 to the power 20 is just over a million.',
      },
      {
        question: 'Which standard library module provides binary search on a sorted list?',
        options: ['search', 'heapq', 'bisect', 'itertools'],
        answer: 2,
        explanation: 'bisect_left and bisect_right return the insertion point for a value.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Compare linear search and binary search.',
        answer: `Linear search checks each item in turn; it works on any data and takes O(n) time. Binary search repeatedly compares the middle item of the remaining range and discards the half that cannot contain the target; it takes O(log n) time but requires sorted data. If the data is searched once, sorting it first costs more than a linear scan, so binary search pays off when the data is already sorted or is searched many times.`,
      },
      {
        question: 'In Python, when would you not write either search by hand?',
        answer: `Nearly always. For membership tests and lookups by key, a <code>set</code> or <code>dict</code> gives O(1) average time. For a sorted list, the <code>bisect</code> module provides a tested binary search. For a single search of an unsorted list, <code>in</code> and <code>list.index()</code> do the linear scan in C. Writing the algorithm by hand is mostly an exercise and an interview task.`,
      },
    ],
  },

  'sorting-algorithms': {
    whyItMatters: `In real code you call <code>sorted()</code>, which is fast and well tested. The classic sorting algorithms are studied because they are the clearest way to learn how to analyse the cost of code, and because interviewers use them to see how you reason about loops and comparisons. Knowing that Python's sort is stable also explains how sorting by several fields works.`,
    complexity: [
      { operation: 'Bubble, selection and insertion sort', average: 'O(n²)', worst: 'O(n²)' },
      { operation: 'Merge sort and heap sort', average: 'O(n log n)', worst: 'O(n log n)' },
      { operation: 'Quick sort', average: 'O(n log n)', worst: 'O(n²)' },
      { operation: 'Timsort (<code>sorted</code>, <code>list.sort</code>)', average: 'O(n log n)', worst: 'O(n log n)' },
    ],
    exercise: {
      prompt: `Implement bubble sort as a function that returns a new sorted list. Then, using the built-in <code>sorted</code>, print the names of the people ordered by age and, for equal ages, by name.

Expected output: <code>[1, 2, 5, 9]</code> then <code>['Asha', 'Zoya', 'Ravi']</code>`,
      starterCode: `def bubble_sort(values):
    items = list(values)  # work on a copy
    # TODO: repeatedly swap neighbouring items that are in the wrong order
    return items


print(bubble_sort([5, 2, 9, 1]))

people = [("Ravi", 30), ("Zoya", 25), ("Asha", 25)]
# TODO: sort by age, then by name, and print just the names`,
      hints: [
        'Use two loops: the outer one counts the passes, the inner one compares <code>items[j]</code> with <code>items[j + 1]</code> and swaps them if needed.',
        'A <code>key</code> that returns a tuple sorts by several fields: <code>key=lambda person: (person[1], person[0])</code>.',
      ],
      solution: `def bubble_sort(values):
    items = list(values)  # work on a copy
    for end in range(len(items) - 1, 0, -1):
        for j in range(end):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
    return items


print(bubble_sort([5, 2, 9, 1]))

people = [("Ravi", 30), ("Zoya", 25), ("Asha", 25)]
ordered = sorted(people, key=lambda person: (person[1], person[0]))
print([name for name, age in ordered])`,
    },
    quiz: [
      {
        question: 'Which algorithm do <code>sorted()</code> and <code>list.sort()</code> use?',
        options: ['Quick sort', 'Heap sort', 'Bubble sort', 'Timsort'],
        answer: 3,
        explanation: 'Timsort is a hybrid of merge sort and insertion sort that is very fast on partly ordered data.',
      },
      {
        question: 'What does it mean that a sort is stable?',
        options: ['Items that compare as equal keep their original order', 'It never fails', 'It uses no extra memory', 'It always takes the same time'],
        answer: 0,
        explanation: 'Stability is what makes sorting by one field and then another work.',
      },
      {
        question: 'Which of these has the best worst-case running time?',
        options: ['Bubble sort', 'Merge sort', 'Insertion sort', 'Selection sort'],
        answer: 1,
        explanation: 'Merge sort is O(n log n) in every case; the other three are O(n²).',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you sort a list of records by more than one field in Python?',
        answer: `Give <code>sorted</code> a <code>key</code> that returns a tuple, for example <code>key=lambda r: (r.department, r.name)</code>; tuples are compared element by element. When the directions differ, such as salary descending and name ascending, either negate the numeric field in the tuple, or sort twice, first by the secondary key and then by the primary one, which works because the sort is stable.`,
      },
      {
        question: 'Why is quick sort O(n²) in the worst case, and how is that avoided?',
        answer: `Quick sort splits the data around a pivot. If the pivot is always the smallest or largest item, as happens with a first-element pivot on sorted input, one side of each split is empty, giving n levels of work on n items. Choosing the pivot at random or as the median of three samples makes this very unlikely. Merge sort and Timsort avoid the problem entirely, which is one reason Python uses Timsort.`,
      },
    ],
  },

  'classic-python-programs': {
    whyItMatters: `Prime numbers, Fibonacci, palindromes and anagrams are the warm-up questions of technical interviews and the standard exercises for building fluency. Each can be solved in several ways, and comparing those solutions teaches you to think about efficiency. Practising them until they are automatic leaves you free to think about the harder parts of an interview.`,
    exercise: {
      prompt: `Write three functions: <code>primes_up_to(n)</code>, which returns the list of primes up to and including n; <code>is_anagram(a, b)</code>, which says whether two words use exactly the same letters; and <code>second_largest(values)</code>, which returns the second largest distinct value.

Expected output: <code>[2, 3, 5, 7, 11, 13, 17, 19]</code>, <code>True</code>, <code>7</code> (one per line)`,
      starterCode: `def primes_up_to(n):
    # TODO: return a list of the prime numbers from 2 to n
    pass


def is_anagram(a, b):
    # TODO: return True if the two words contain the same letters
    pass


def second_largest(values):
    # TODO: return the second largest distinct value
    pass


print(primes_up_to(20))
print(is_anagram("listen", "silent"))
print(second_largest([4, 9, 9, 7]))`,
      hints: [
        'A number is prime if no number from 2 up to its square root divides it. <code>all(...)</code> expresses "no divisor found".',
        'Two words are anagrams when their sorted letters are equal. For the second largest, remove duplicates with <code>set</code> first.',
      ],
      solution: `def primes_up_to(n):
    primes = []
    for number in range(2, n + 1):
        if all(number % divisor != 0 for divisor in range(2, int(number ** 0.5) + 1)):
            primes.append(number)
    return primes


def is_anagram(a, b):
    return sorted(a) == sorted(b)


def second_largest(values):
    return sorted(set(values))[-2]


print(primes_up_to(20))
print(is_anagram("listen", "silent"))
print(second_largest([4, 9, 9, 7]))`,
    },
    quiz: [
      {
        question: 'To test whether n is prime, up to which number do divisors need to be checked?',
        options: ['n - 1', 'n / 2', 'The square root of n', '10'],
        answer: 2,
        explanation: 'If n has a divisor larger than its square root, it also has one smaller.',
      },
      {
        question: 'Why is a plain recursive Fibonacci function slow for large n?',
        options: ['Recursion is not allowed', 'Python cannot add large numbers', 'It uses too many variables', 'It recomputes the same values an enormous number of times'],
        answer: 3,
        explanation: 'A loop, or caching the results, makes it linear.',
      },
      {
        question: 'What is the simplest way to test whether a string is a palindrome?',
        options: ['text == text[::-1]', 'text.reverse() == text', 'text.sort() == text', 'len(text) % 2 == 0'],
        answer: 0,
        explanation: 'The slice gives a reversed copy, which is compared with the original.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How would you find all prime numbers up to n efficiently?',
        answer: `Use the Sieve of Eratosthenes. Create a list of booleans for 0 to n, all true except 0 and 1. For each number from 2 up to the square root of n that is still marked true, mark all its multiples as false. The numbers left marked true are the primes. It runs in O(n log log n), far faster than testing each number separately.`,
      },
      {
        question: 'How do you check whether two strings are anagrams, and what does it cost?',
        answer: `One way is to compare the sorted characters, <code>sorted(a) == sorted(b)</code>, which is O(n log n). A faster way is to count the characters with <code>collections.Counter</code> and compare the counts, which is O(n). In both cases, decide first whether case and spaces should be ignored and normalise the strings accordingly.`,
      },
    ],
  },

  'testing': {
    whyItMatters: `Code without tests can only be checked by running it by hand, and every change risks breaking something that used to work. Automated tests check it in seconds, every time. Writing tests is a standard part of professional development: most teams will not accept a change without them, and many interviews include a testing question.`,
    exercise: {
      prompt: `Write <code>slugify</code>, which turns a title into a lower-case string with hyphens in place of spaces, and two test functions for it in the pytest style, using <code>assert</code>. With pytest installed, the tests would be run with the <code>pytest</code> command; here they are called directly, and a message is printed if both pass.

Expected output: <code>2 passed</code>`,
      starterCode: `def slugify(title):
    # TODO: strip surrounding spaces, convert to lower case, replace spaces with hyphens
    pass


def test_replaces_spaces():
    # TODO: assert that "Hello World" becomes "hello-world"
    pass


def test_strips_outer_spaces():
    # TODO: assert that "  Python  " becomes "python"
    pass


test_replaces_spaces()
test_strips_outer_spaces()
print("2 passed")`,
      hints: [
        'Chain the string methods: <code>title.strip().lower().replace(" ", "-")</code>.',
        'A test is a plain <code>assert actual == expected</code>. A failing assert raises <code>AssertionError</code> and stops the program before the message is printed.',
      ],
      solution: `def slugify(title):
    return title.strip().lower().replace(" ", "-")


def test_replaces_spaces():
    assert slugify("Hello World") == "hello-world"


def test_strips_outer_spaces():
    assert slugify("  Python  ") == "python"


test_replaces_spaces()
test_strips_outer_spaces()
print("2 passed")`,
    },
    quiz: [
      {
        question: 'How does pytest discover test functions?',
        options: ['They must be registered in a list', 'By name: files named test_*.py and functions whose names start with test_', 'They must inherit from a class', 'By a special comment'],
        answer: 1,
        explanation: 'No registration is needed; following the naming convention is enough.',
      },
      {
        question: 'In <code>unittest</code>, which class do test classes inherit from?',
        options: ['unittest.Test', 'unittest.Suite', 'unittest.TestCase', 'object'],
        answer: 2,
        explanation: 'It provides the assert methods such as assertEqual.',
      },
      {
        question: 'What should a good unit test do?',
        options: ['Test the whole application at once', 'Print its results for a person to read', 'Connect to the production database', 'Check one behaviour, run quickly and not depend on other tests'],
        answer: 3,
        explanation: 'Independent tests can be run in any order and point directly at what is broken.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between unittest and pytest?',
        answer: `<code>unittest</code> is in the standard library and follows the class-based style of JUnit: tests are methods of a <code>TestCase</code> subclass and use methods such as <code>assertEqual</code>. <code>pytest</code> is a third-party tool in which tests are plain functions using the ordinary <code>assert</code> statement, with detailed failure messages, fixtures for set-up and parametrisation for running one test with many inputs. pytest can also run unittest tests and is the more common choice.`,
      },
      {
        question: 'What is a fixture?',
        answer: `A fixture provides something a test needs, such as a temporary file, a database connection or a prepared object, and cleans it up afterwards. In pytest it is a function decorated with <code>@pytest.fixture</code>, and a test receives it by naming it as a parameter. Fixtures keep set-up code out of the tests themselves and let it be shared.`,
      },
    ],
  },

  'http-api-basics': {
    whyItMatters: `Programs get weather data, take payments, send messages and talk to AI models by calling web APIs. The steps are always the same: build a URL with parameters, send a request, check the status code and parse the JSON that comes back. This lesson is the foundation for both using APIs and, later, building them with FastAPI.`,
    exercise: {
      prompt: `Without using the network, practise the three steps around a request. Build the full URL for a GET request with two query parameters. Parse the JSON body of a response and print the name inside it. Write <code>describe</code>, which classifies a status code as <code>success</code>, <code>client error</code> or <code>server error</code>.

Expected output: <code>https://api.example.com/users?page=2&amp;limit=10</code>, <code>Asha</code>, <code>client error</code> (one per line)`,
      starterCode: `import json
from urllib.parse import urlencode

base = "https://api.example.com/users"
params = {"page": 2, "limit": 10}
# TODO: print the full URL with the query string

body = '{"data": {"name": "Asha"}}'
# TODO: parse the body and print the name


def describe(status):
    # TODO: 200-299 -> "success", 400-499 -> "client error", 500-599 -> "server error"
    pass


print(describe(404))`,
      hints: [
        '<code>urlencode(params)</code> produces <code>page=2&amp;limit=10</code>; join it to the base with <code>?</code>.',
        'Chained comparisons are convenient here: <code>200 &lt;= status &lt; 300</code>.',
      ],
      solution: `import json
from urllib.parse import urlencode

base = "https://api.example.com/users"
params = {"page": 2, "limit": 10}
print(f"{base}?{urlencode(params)}")

body = '{"data": {"name": "Asha"}}'
print(json.loads(body)["data"]["name"])


def describe(status):
    if 200 <= status < 300:
        return "success"
    if 400 <= status < 500:
        return "client error"
    return "server error"


print(describe(404))`,
    },
    quiz: [
      {
        question: 'Which HTTP method is used to retrieve data without changing anything?',
        options: ['GET', 'POST', 'DELETE', 'PUT'],
        answer: 0,
        explanation: 'POST creates, PUT and PATCH update, and DELETE removes.',
      },
      {
        question: 'What does the status code 404 mean?',
        options: ['The request succeeded', 'The resource was not found', 'The server crashed', 'Authentication is required'],
        answer: 1,
        explanation: 'Codes from 400 to 499 indicate a problem with the request.',
      },
      {
        question: 'With the <code>requests</code> library, how is a JSON response body converted to Python objects?',
        options: ['response.text', 'response.data', 'response.json()', 'json(response)'],
        answer: 2,
        explanation: 'It parses the body and returns dictionaries and lists.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What do the classes of HTTP status codes mean?',
        answer: `2xx means success: 200 OK, 201 Created, 204 No Content. 3xx means redirection. 4xx means the client made a mistake: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found. 5xx means the server failed: 500 Internal Server Error, 503 Service Unavailable. A client should check the code before using the body.`,
      },
      {
        question: 'What should you always do when calling an external API from Python?',
        answer: `Set a timeout, because without one a request can hang indefinitely. Check the status, for example with <code>response.raise_for_status()</code>, before reading the body. Handle network exceptions. Keep API keys out of the code, in environment variables. For calls that may fail temporarily, retry a limited number of times with a growing delay.`,
      },
    ],
  },

  'introductory-data-handling': {
    whyItMatters: `Rows from a database, lines of a CSV file and JSON from an API all arrive in Python as a list of dictionaries. Filtering, totalling, sorting and finding the top record in that shape are the bread and butter of scripts and back-end code, and doing them well in plain Python is the foundation for moving on to pandas.`,
    exercise: {
      prompt: `From the list of sales records, print the total amount for the north region, the item with the largest amount, and the item names ordered from the largest amount to the smallest.

Expected output: <code>420</code>, <code>bag</code>, <code>['bag', 'book', 'pen']</code> (one per line)`,
      starterCode: `sales = [
    {"item": "pen", "region": "north", "amount": 120},
    {"item": "bag", "region": "south", "amount": 450},
    {"item": "book", "region": "north", "amount": 300},
]

# TODO: print the total amount for the north region
# TODO: print the item with the largest amount
# TODO: print the item names sorted by amount, largest first`,
      hints: [
        'A generator expression with a condition can be passed to <code>sum</code>.',
        '<code>max</code> and <code>sorted</code> both accept <code>key=lambda record: record["amount"]</code>.',
      ],
      solution: `sales = [
    {"item": "pen", "region": "north", "amount": 120},
    {"item": "bag", "region": "south", "amount": 450},
    {"item": "book", "region": "north", "amount": 300},
]

print(sum(record["amount"] for record in sales if record["region"] == "north"))

print(max(sales, key=lambda record: record["amount"])["item"])

ordered = sorted(sales, key=lambda record: record["amount"], reverse=True)
print([record["item"] for record in ordered])`,
    },
    quiz: [
      {
        question: 'Which structure most naturally represents a table of records in plain Python?',
        options: ['A string', 'A nested set', 'A set of tuples', 'A list of dictionaries'],
        answer: 3,
        explanation: 'Each dictionary is a row, and its keys are the column names.',
      },
      {
        question: 'How do you find the record with the highest value of one field?',
        options: ['max(records, key=lambda r: r["field"])', 'max(records)', 'records.max("field")', 'sorted(records)[0]'],
        answer: 0,
        explanation: 'Dictionaries cannot be compared directly, so a key function says what to compare.',
      },
      {
        question: 'What does <code>[r for r in records if r["active"]]</code> produce?',
        options: ['The number of active records', 'A new list containing only the active records', 'A dictionary', 'It modifies records in place'],
        answer: 1,
        explanation: 'The original list is unchanged.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How would you group a list of records by one field and total another in plain Python?',
        answer: `Use a dictionary keyed by the grouping field. With <code>collections.defaultdict(int)</code>, loop over the records and add each amount to <code>totals[record["region"]]</code>. The result maps each group to its total. The same pattern with <code>defaultdict(list)</code> collects the records of each group. pandas does this with <code>groupby</code> for larger data.`,
      },
      {
        question: 'When should you move from lists of dictionaries to pandas?',
        answer: `When the data grows large or the analysis involves grouping, joining tables, handling missing values or working with dates. pandas performs these operations on whole columns in optimised code, and expresses them in a line where plain Python needs loops. For small data and simple filters, plain Python is perfectly adequate and has no dependencies.`,
      },
    ],
  },
}
