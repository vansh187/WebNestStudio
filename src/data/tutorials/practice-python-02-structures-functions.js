// Practice blocks for the Python Data Structures and Functions modules. Merged onto the
// lesson entries in index.js by slug, so the lesson prose files stay unchanged.
// Sets are sorted before printing so the output does not depend on hash order.
export const practicePythonStructuresFunctions = {
  'lists-tuples-sets-dictionaries': {
    whyItMatters: `Almost all data in a Python program sits in one of these four structures, and data from files, databases and APIs arrives as lists and dictionaries. Choosing between them is the first design decision in most functions, and each choice has consequences for what the code can do and how fast it runs.`,
    exercise: {
      prompt: `From the list of purchases, print the distinct items in alphabetical order, and then a dictionary that counts how many times each item was bought.

Expected output: <code>['bag', 'book', 'pen']</code> then <code>{'pen': 3, 'book': 2, 'bag': 1}</code>`,
      starterCode: `purchases = ["pen", "book", "pen", "bag", "book", "pen"]

# TODO: print the distinct items, sorted

# TODO: build a dictionary of item -> count, and print it`,
      hints: [
        '<code>set(purchases)</code> removes duplicates, and <code>sorted(...)</code> returns a sorted list.',
        '<code>counts.get(item, 0) + 1</code> gives the new count, whether or not the item has been seen before.',
      ],
      solution: `purchases = ["pen", "book", "pen", "bag", "book", "pen"]

print(sorted(set(purchases)))

counts = {}
for item in purchases:
    counts[item] = counts.get(item, 0) + 1
print(counts)`,
    },
    quiz: [
      {
        question: 'Which of these structures cannot be changed after it is created?',
        options: ['list', 'tuple', 'set', 'dict'],
        answer: 1,
        explanation: 'A tuple is immutable. The other three can be changed in place.',
      },
      {
        question: 'Which structure automatically removes duplicate values?',
        options: ['list', 'tuple', 'set', 'dict values'],
        answer: 2,
        explanation: 'A set holds each value at most once.',
      },
      {
        question: 'Which structure is designed for looking up a value by a name or an id?',
        options: ['list', 'tuple', 'set', 'dict'],
        answer: 3,
        explanation: 'A dictionary maps keys to values and finds a key without scanning.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a list and a tuple?',
        answer: `Both are ordered sequences that allow duplicates and indexing. A list is mutable: items can be added, removed and replaced. A tuple is immutable: once created it cannot change. Because of that a tuple can be used as a dictionary key or a set element, and it signals that the data is a fixed record, such as a pair of coordinates.`,
      },
      {
        question: 'When would you use a set instead of a list?',
        answer: `When only membership matters and duplicates are not wanted. Testing <code>x in a_set</code> takes roughly the same time whatever the size of the set, while <code>x in a_list</code> checks the items one by one. Sets also provide union, intersection and difference. A set has no order and cannot be indexed, and its elements must be hashable.`,
      },
    ],
  },

  'lists-and-list-methods': {
    whyItMatters: `The list is Python's general-purpose container and the structure you will use most. Two things cause most list bugs: methods such as <code>sort()</code> that change the list and return <code>None</code>, and two names that refer to the same list. Both are easy to avoid once you have seen them.`,
    exercise: {
      prompt: `The code is meant to keep <code>original</code> in its original order and produce a separate sorted list, but both names refer to the same list. Fix it so that the two lists are independent.

Expected output: <code>[3, 1, 2, 4]</code> then <code>[1, 2, 3]</code>`,
      starterCode: `original = [3, 1, 2]

ordered = original
ordered.sort()

original.append(4)

print(original)
print(ordered)`,
      hints: [
        '<code>ordered = original</code> does not copy the list; it gives the same list a second name.',
        '<code>sorted(original)</code> returns a new sorted list and leaves the original as it was.',
      ],
      solution: `original = [3, 1, 2]

ordered = sorted(original)

original.append(4)

print(original)
print(ordered)`,
    },
    quiz: [
      {
        question: 'What is <code>result</code> after <code>result = [3, 1, 2].sort()</code>?',
        options: ['[1, 2, 3]', 'None', '[3, 1, 2]', 'It raises an error'],
        answer: 1,
        explanation: 'sort() sorts the list in place and returns None. Use sorted() to get a new list.',
      },
      {
        question: 'What is <code>a</code> after <code>a = [1, 2]</code> and <code>a.append([3, 4])</code>?',
        options: ['[1, 2, [3, 4]]', '[1, 2, 3, 4]', '[[1, 2], [3, 4]]', 'It raises an error'],
        answer: 0,
        explanation: 'append adds its argument as one item. extend would add each element separately.',
      },
      {
        question: 'What does <code>items.pop()</code> do when called with no argument?',
        options: ['Removes and returns the first item', 'Removes and returns the last item', 'Removes every item', 'Returns the last item without removing it'],
        answer: 1,
        explanation: 'pop(i) removes the item at index i; the default is the last one.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between sort() and sorted()?',
        answer: `<code>list.sort()</code> is a method of lists that sorts the list in place and returns <code>None</code>. <code>sorted(iterable)</code> is a built-in function that accepts any iterable, leaves it unchanged and returns a new sorted list. Both accept <code>key</code> and <code>reverse</code> arguments, and both are stable.`,
      },
      {
        question: 'What is the difference between a shallow copy and a deep copy?',
        answer: `A shallow copy, made with <code>list.copy()</code>, <code>list(x)</code> or <code>x[:]</code>, creates a new outer list whose items are the same objects as in the original. If those items are themselves mutable, such as inner lists, a change to one is seen through both copies. <code>copy.deepcopy(x)</code> copies the nested objects as well, so the two structures share nothing.`,
      },
    ],
  },

  'tuples-and-tuple-methods': {
    whyItMatters: `Tuples are how Python returns several values from a function, how it swaps variables, and what <code>enumerate</code>, <code>zip</code> and <code>dict.items()</code> give you. You use them constantly, often without writing the parentheses, and unpacking them is one of the most convenient features of the language.`,
    exercise: {
      prompt: `Write a function that returns the smallest and the largest value of a list as a tuple, and unpack the result into two variables. Then use star unpacking to separate the first item of a list from the rest.

Expected output: <code>1 9</code> then <code>[2, 3, 4]</code>`,
      starterCode: `def min_max(values):
    # TODO: return the smallest and the largest value
    pass


# TODO: unpack the result for [4, 1, 9, 3] into two variables and print them

numbers = [1, 2, 3, 4]
# TODO: unpack numbers into "first" and a list "rest", and print rest`,
      hints: [
        'Returning two values separated by a comma returns a tuple: <code>return min(values), max(values)</code>.',
        'A starred name collects the remaining items: <code>first, *rest = numbers</code>.',
      ],
      solution: `def min_max(values):
    return min(values), max(values)


smallest, largest = min_max([4, 1, 9, 3])
print(smallest, largest)

numbers = [1, 2, 3, 4]
first, *rest = numbers
print(rest)`,
    },
    quiz: [
      {
        question: 'What is the type of <code>(5)</code>?',
        options: ['tuple', 'list', 'int', 'It is a syntax error'],
        answer: 2,
        explanation: 'Parentheses alone do not make a tuple. A one-item tuple needs a trailing comma: (5,).',
      },
      {
        question: 'Which methods does a tuple have?',
        options: ['append and remove', 'add and discard', 'sort and reverse', 'count and index'],
        answer: 3,
        explanation: 'A tuple cannot be changed, so it has only the two methods that read from it.',
      },
      {
        question: 'Given <code>t = (1, [2, 3])</code>, what does <code>t[1].append(4)</code> do?',
        options: ['Changes the inner list, so t is (1, [2, 3, 4])', 'Raises TypeError', 'Creates a new tuple', 'Nothing'],
        answer: 0,
        explanation: 'The tuple cannot be made to hold a different object, but a mutable object inside it can still change.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why use a tuple when a list can do everything a tuple can?',
        answer: `A tuple cannot be modified, which protects data that should stay fixed and makes the intent clear. Because it is immutable it is hashable, provided its elements are, so it can be a dictionary key or a set element, which a list cannot. Tuples also use slightly less memory than lists.`,
      },
      {
        question: 'What is a namedtuple?',
        answer: `<code>collections.namedtuple</code> creates a tuple type whose positions also have names, so a point can be read as <code>p.x</code> and <code>p.y</code> as well as <code>p[0]</code> and <code>p[1]</code>. It is as light as an ordinary tuple and immutable, and makes code that handles records easier to read. <code>typing.NamedTuple</code> is the class-based form with type hints.`,
      },
    ],
  },

  'sets-and-set-methods': {
    whyItMatters: `Questions such as "which customers bought both products?" or "which ids are in this file but not in that one?" are set operations. Writing them with sets takes one line and runs quickly; writing them with nested loops over lists is longer and becomes slow as the data grows.`,
    exercise: {
      prompt: `Two courses have the students shown below. Print the students who take both courses, then the students who take only Python, then the total number of different students. Sort the names before printing.

Expected output: <code>['Ravi']</code>, <code>['Asha', 'Zoya']</code>, <code>4</code> (one per line)`,
      starterCode: `python_course = {"Asha", "Ravi", "Zoya"}
java_course = {"Ravi", "Meera"}

# TODO: print the sorted names of students in both courses
# TODO: print the sorted names of students only in the Python course
# TODO: print how many different students there are in total`,
      hints: [
        '<code>a &amp; b</code> is the intersection, <code>a - b</code> the difference and <code>a | b</code> the union.',
        'A set has no order, so pass it to <code>sorted()</code> before printing.',
      ],
      solution: `python_course = {"Asha", "Ravi", "Zoya"}
java_course = {"Ravi", "Meera"}

print(sorted(python_course & java_course))
print(sorted(python_course - java_course))
print(len(python_course | java_course))`,
    },
    quiz: [
      {
        question: 'How is an empty set created?',
        options: ['{}', 'set()', '[]', '()'],
        answer: 1,
        explanation: '{} creates an empty dictionary.',
      },
      {
        question: 'What is the difference between <code>remove(x)</code> and <code>discard(x)</code> when <code>x</code> is not in the set?',
        options: ['There is none', 'remove raises KeyError; discard does nothing', 'discard raises KeyError; remove does nothing', 'Both raise an error'],
        answer: 1,
        explanation: 'Use discard when it does not matter whether the item was present.',
      },
      {
        question: 'Can a list be an element of a set?',
        options: ['Yes', 'Only inside a frozenset', 'Only an empty list', 'No; set elements must be hashable, and a list is not'],
        answer: 3,
        explanation: 'Use a tuple instead, which is hashable when its elements are.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How is a set implemented, and what does that mean for its performance?',
        answer: `A set is a hash table. The hash of each element decides where it is stored, so adding an element, removing one and testing membership all take roughly constant time on average, however large the set is. The consequences are that elements must be hashable and that a set has no defined order.`,
      },
      {
        question: 'What is a frozenset?',
        answer: `A <code>frozenset</code> is an immutable set. It supports the same reading operations and set algebra as a set, but has no methods that change it. Because it cannot change it is hashable, so it can be used as a dictionary key or as an element of another set.`,
      },
    ],
  },

  'dictionaries-and-dictionary-methods': {
    whyItMatters: `The dictionary is the most important data structure in Python. JSON from an API becomes dictionaries, a database row is naturally a dictionary, and keyword arguments and even objects' attributes are stored in them. Counting, grouping and looking things up by key are all dictionary tasks, and doing them fluently is a core skill.`,
    exercise: {
      prompt: `Group the words by their first letter, so that each letter maps to the list of words that start with it. Print the resulting dictionary.

Expected output: <code>{'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}</code>`,
      starterCode: `words = ["apple", "avocado", "banana", "blueberry", "cherry"]

groups = {}

# TODO: add each word to the list stored under its first letter

print(groups)`,
      hints: [
        'The first time a letter is seen, there is no list for it yet.',
        '<code>groups.setdefault(letter, [])</code> returns the existing list, or stores and returns a new empty one.',
      ],
      solution: `words = ["apple", "avocado", "banana", "blueberry", "cherry"]

groups = {}

for word in words:
    groups.setdefault(word[0], []).append(word)

print(groups)`,
    },
    quiz: [
      {
        question: 'What happens when <code>d["missing"]</code> is read and the key is not in the dictionary?',
        options: ['KeyError is raised', 'It returns None', 'It returns an empty string', 'The key is added'],
        answer: 0,
        explanation: 'Use d.get("missing") to get None, or a default, instead of an error.',
      },
      {
        question: 'Which of these can be used as a dictionary key?',
        options: ['[1, 2]', '(1, 2)', '{"a": 1}', '{1, 2}'],
        answer: 1,
        explanation: 'Keys must be hashable. A tuple of hashable values is; lists, dicts and sets are not.',
      },
      {
        question: 'In what order does a dictionary return its keys when it is iterated?',
        options: ['Sorted order', 'Random order', 'The order in which the keys were inserted', 'Reverse order'],
        answer: 2,
        explanation: 'Insertion order has been guaranteed since Python 3.7.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between d[key] and d.get(key)?',
        answer: `<code>d[key]</code> raises <code>KeyError</code> when the key is absent. <code>d.get(key)</code> returns <code>None</code> in that case, or a default given as the second argument, as in <code>d.get(key, 0)</code>. Use the square brackets when a missing key is a bug that should be noticed, and <code>get</code> when a missing key is expected.`,
      },
      {
        question: 'How do you loop over the keys and values of a dictionary?',
        answer: `Looping over the dictionary itself gives the keys. <code>d.values()</code> gives the values, and <code>d.items()</code> gives key-value pairs that can be unpacked: <code>for key, value in d.items():</code>. To loop in sorted order, wrap the call in <code>sorted()</code>. Keys must not be added or removed while looping over the dictionary.`,
      },
      {
        question: 'How does a dictionary find a key so quickly?',
        answer: `It is a hash table. The key's hash value is computed and used to go straight to the slot where the entry is stored, without examining the other entries, so a lookup takes about the same time for ten keys as for ten million. This is why keys must be hashable and must not change while they are in the dictionary.`,
      },
    ],
  },

  'choosing-the-right-data-structure': {
    whyItMatters: `The same task can take a millisecond or a minute depending on the structure that holds the data. Searching a list of a million items again and again is slow; a dictionary or a set answers the same question at once. Being able to explain the cost of an operation is what interviewers mean when they ask about time complexity.`,
    complexity: [
      { operation: 'list: read or write by index', average: 'O(1)', worst: 'O(1)' },
      { operation: 'list: <code>append</code>', average: 'O(1)', worst: 'O(n) when the list must grow' },
      { operation: 'list: <code>x in list</code>, <code>insert(0, x)</code>, <code>pop(0)</code>', average: 'O(n)', worst: 'O(n)' },
      { operation: 'dict or set: lookup, insert, delete', average: 'O(1)', worst: 'O(n)' },
      { operation: 'tuple: read by index', average: 'O(1)', worst: 'O(1)' },
    ],
    exercise: {
      prompt: `The users are stored as a list of <code>(id, name)</code> pairs, so finding one by id means scanning the list. Build a dictionary from id to name and use it to print the name of user 3. Then build a set of the ids and print whether id 7 is among them.

Expected output: <code>Zoya</code> then <code>False</code>`,
      starterCode: `users = [(1, "Asha"), (2, "Ravi"), (3, "Zoya")]

# TODO: build a dictionary {id: name} and print the name for id 3

# TODO: build a set of the ids and print whether 7 is in it`,
      hints: [
        '<code>dict(users)</code> turns a list of pairs into a dictionary.',
        'A set comprehension collects the ids: <code>{user_id for user_id, _ in users}</code>.',
      ],
      solution: `users = [(1, "Asha"), (2, "Ravi"), (3, "Zoya")]

names_by_id = dict(users)
print(names_by_id[3])

ids = {user_id for user_id, _ in users}
print(7 in ids)`,
    },
    quiz: [
      {
        question: 'You need to check many times whether a value has been seen before. Which structure is best?',
        options: ['list', 'tuple', 'string', 'set'],
        answer: 3,
        explanation: 'Membership in a set does not depend on its size. In a list, each check scans the items.',
      },
      {
        question: 'Which structure suits a record that must not change, such as a latitude and longitude?',
        options: ['tuple', 'list', 'set', 'dict'],
        answer: 0,
        explanation: 'A tuple is ordered and immutable.',
      },
      {
        question: 'Why is <code>items.insert(0, x)</code> slow on a large list?',
        options: ['It sorts the list', 'Every existing item has to move one place to the right', 'It copies the list twice', 'It is not slow'],
        answer: 1,
        explanation: 'For frequent additions at the front, collections.deque is the right structure.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the time complexity of the "in" operator for a list and for a set?',
        answer: `For a list it is O(n): in the worst case every element is compared. For a set or a dictionary it is O(1) on average, because the hash of the value leads directly to where it would be stored. When a membership test is repeated inside a loop, converting the list to a set first can change the whole operation from O(n²) to O(n).`,
      },
      {
        question: 'How do you decide which built-in structure to use?',
        answer: `Ask what the code needs. An ordered collection that changes: a list. A fixed group of values, or something to use as a key: a tuple. Uniqueness or fast membership tests: a set. Looking up a value by a key: a dictionary. If items are added and removed at both ends, use <code>collections.deque</code>.`,
      },
    ],
  },

  'comprehensions': {
    whyItMatters: `A comprehension builds a list, dictionary or set from another collection in a single readable line, and Python programmers use them everywhere in place of a loop with <code>append</code>. You need to read them comfortably to understand other people's code, and writing them well is one of the clearest signs of fluency in the language.`,
    exercise: {
      prompt: `Using comprehensions, print the squares of the even numbers from 1 to 10, then a dictionary mapping each word to its length, then the sum of the squares of 1 to 3 computed with a generator expression.

Expected output: <code>[4, 16, 36, 64, 100]</code>, <code>{'hi': 2, 'python': 6}</code>, <code>14</code> (one per line)`,
      starterCode: `# TODO: list comprehension: squares of the even numbers from 1 to 10

words = ["hi", "python"]
# TODO: dictionary comprehension: word -> length

# TODO: generator expression inside sum(): squares of 1, 2 and 3`,
      hints: [
        'The pattern is <code>[expression for item in iterable if condition]</code>.',
        'A dictionary comprehension uses braces and <code>key: value</code>. A generator expression can be passed straight to <code>sum(...)</code>.',
      ],
      solution: `print([n * n for n in range(1, 11) if n % 2 == 0])

words = ["hi", "python"]
print({word: len(word) for word in words})

print(sum(n * n for n in range(1, 4)))`,
    },
    quiz: [
      {
        question: 'What does <code>[x * 2 for x in range(3)]</code> produce?',
        options: ['[2, 4, 6]', '[0, 1, 2]', '[0, 2, 4]', '[1, 2, 3]'],
        answer: 2,
        explanation: 'range(3) gives 0, 1 and 2, and each is doubled.',
      },
      {
        question: 'What does <code>(x * 2 for x in range(3))</code> create?',
        options: ['A tuple', 'A list', 'A set', 'A generator, which produces values one at a time when asked'],
        answer: 3,
        explanation: 'Parentheses make a generator expression. Nothing is computed until it is iterated.',
      },
      {
        question: 'In a comprehension that filters, where is the <code>if</code> written?',
        options: ['After the for clause', 'Before the for', 'Outside the brackets', 'It cannot be filtered'],
        answer: 0,
        explanation: 'The filter goes at the end: [x for x in items if x > 0].',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a list comprehension and a generator expression?',
        answer: `A list comprehension, in square brackets, builds the whole list in memory immediately. A generator expression, in parentheses, creates an object that computes each value only when it is requested and keeps nothing afterwards. Use a generator for large or unbounded data, or when the result is consumed once, for example by <code>sum()</code> or <code>any()</code>; use a list when the values are needed more than once or need indexing.`,
      },
      {
        question: 'When should a comprehension not be used?',
        answer: `When it stops being easy to read: several nested loops, a complicated condition, or logic that needs more than one statement are clearer as an ordinary loop. A comprehension should also not be used only for its side effects, such as calling <code>print</code> for each item; that is what a <code>for</code> loop is for.`,
      },
    ],
  },

  'arrays-stacks-and-queues': {
    whyItMatters: `Undo history, the browser's back button and checking matching brackets are stacks. Print jobs, background tasks and requests waiting for a server are queues. Python has no separate stack or queue type in everyday use; you choose the right built-in structure, and choosing the wrong one makes a program slow.`,
    exercise: {
      prompt: `Use a <code>deque</code> as a queue: serve the first two customers, printing each name, and then print who is still waiting. Then use a list as a stack: push 1, 2 and 3 and print the value that comes off the top.

Expected output: <code>Asha</code>, <code>Ravi</code>, <code>['Zoya']</code>, <code>3</code> (one per line)`,
      starterCode: `from collections import deque

queue = deque(["Asha", "Ravi", "Zoya"])

# TODO: remove and print the first two customers
# TODO: print the remaining queue as a list

stack = []

# TODO: push 1, 2 and 3, then pop and print the top value`,
      hints: [
        '<code>queue.popleft()</code> removes and returns the item at the front.',
        'For a stack, <code>append</code> pushes and <code>pop()</code> removes the last item added.',
      ],
      solution: `from collections import deque

queue = deque(["Asha", "Ravi", "Zoya"])

print(queue.popleft())
print(queue.popleft())
print(list(queue))

stack = []

stack.append(1)
stack.append(2)
stack.append(3)
print(stack.pop())`,
    },
    quiz: [
      {
        question: 'In which order does a stack return its items?',
        options: ['First in, first out', 'Last in, first out', 'Sorted order', 'Random order'],
        answer: 1,
        explanation: 'The most recently added item is removed first.',
      },
      {
        question: 'Why is <code>list.pop(0)</code> a poor way to implement a queue?',
        options: ['It does not work', 'It removes the last item', 'Every remaining item is shifted one place, so it is O(n)', 'It returns None'],
        answer: 2,
        explanation: 'deque.popleft() does the same job in constant time.',
      },
      {
        question: 'Which item does <code>heapq.heappop(heap)</code> return?',
        options: ['The item added first', 'The item added last', 'The largest item', 'The smallest item'],
        answer: 3,
        explanation: 'heapq maintains a min-heap, which is how a priority queue is built.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you implement a stack and a queue in Python?',
        answer: `A stack is a list: <code>append()</code> pushes and <code>pop()</code> removes from the same end, both in constant time. A queue is a <code>collections.deque</code>: <code>append()</code> adds at the back and <code>popleft()</code> removes from the front, both in constant time. For passing work between threads, <code>queue.Queue</code> adds the necessary locking.`,
      },
      {
        question: 'What is a priority queue and how is one built in Python?',
        answer: `A priority queue always returns the item with the highest priority and not the oldest. The <code>heapq</code> module provides it on top of an ordinary list: <code>heappush</code> adds an item and <code>heappop</code> removes the smallest, each in O(log n). Items are usually tuples of <code>(priority, value)</code>, so that they are ordered by priority.`,
      },
    ],
  },

  'the-collections-module': {
    whyItMatters: `Counting things and grouping things are among the most common tasks in data processing, and the <code>collections</code> module turns each into one or two lines. <code>Counter</code> and <code>defaultdict</code> in particular remove a great deal of repetitive "if the key is not there yet" code and are used heavily in real projects and in coding interviews.`,
    exercise: {
      prompt: `Use a <code>Counter</code> to find the two most frequent words in the sentence. Then print the count of a word that does not appear at all.

Expected output: <code>[('the', 3), ('and', 2)]</code> then <code>0</code>`,
      starterCode: `from collections import Counter

sentence = "the cat and the hat and the bat"

# TODO: count the words and print the two most common
# TODO: print the count for "dog"`,
      hints: [
        '<code>Counter(sentence.split())</code> counts the items of the list.',
        '<code>most_common(2)</code> returns the top two as <code>(word, count)</code> pairs. A missing key gives 0, not an error.',
      ],
      solution: `from collections import Counter

sentence = "the cat and the hat and the bat"

counts = Counter(sentence.split())
print(counts.most_common(2))
print(counts["dog"])`,
    },
    quiz: [
      {
        question: 'What does a <code>Counter</code> return for a key it has never seen?',
        options: ['It raises KeyError', '0', 'None', 'An empty list'],
        answer: 1,
        explanation: 'A Counter treats missing items as having a count of zero.',
      },
      {
        question: 'With <code>d = defaultdict(list)</code>, what does <code>d["new"]</code> do?',
        options: ['Raises KeyError', 'Creates the key with an empty list and returns that list', 'Returns None', 'Returns the list type'],
        answer: 1,
        explanation: 'The factory is called to produce a default value, which is stored under the key.',
      },
      {
        question: 'What happens when a fourth item is appended to <code>deque(maxlen=3)</code> that already holds three?',
        options: ['An error is raised', 'The new item is ignored', 'The oldest item is dropped from the other end', 'The deque grows to four'],
        answer: 2,
        explanation: 'A bounded deque keeps only the most recent items, which suits a "last N" history.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a defaultdict and when would you use it?',
        answer: `A <code>defaultdict</code> is a dictionary that creates a value automatically the first time a missing key is accessed, using the factory given when it was created: <code>list</code> for grouping, <code>int</code> for counting, <code>set</code> for collecting unique values. It removes the need to check whether the key exists before appending or adding.`,
      },
      {
        question: 'How would you find the most common elements of a list?',
        answer: `Pass the list to <code>collections.Counter</code> and call <code>most_common(n)</code>, which returns the <code>n</code> most frequent items with their counts, in descending order. A Counter is a dictionary subclass, so individual counts can be read by key, and counters can be added and subtracted.`,
      },
    ],
  },

  'functions': {
    whyItMatters: `Functions are how a program is divided into named, reusable, testable pieces. Without them the same code is copied in several places, and a fix has to be made in each. Every library you use is a set of functions, and writing your own clearly is the main difference between a script and maintainable software.`,
    exercise: {
      prompt: `Write <code>greet</code>, which takes a name and an optional greeting that defaults to <code>Hello</code>, and <code>total</code>, which accepts any number of numbers and returns their sum.

Expected output: <code>Hello, Asha!</code>, <code>Welcome, Ravi!</code>, <code>6</code> (one per line)`,
      starterCode: `# TODO: define greet(name, greeting="Hello") that returns e.g. "Hello, Asha!"

# TODO: define total(*numbers) that returns the sum of its arguments


print(greet("Asha"))
print(greet("Ravi", greeting="Welcome"))
print(total(1, 2, 3))`,
      hints: [
        'A default value is written in the parameter list: <code>def greet(name, greeting="Hello"):</code>.',
        'Inside the function, <code>*numbers</code> is a tuple, so <code>sum(numbers)</code> adds its items.',
      ],
      solution: `def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"


def total(*numbers):
    return sum(numbers)


print(greet("Asha"))
print(greet("Ravi", greeting="Welcome"))
print(total(1, 2, 3))`,
    },
    quiz: [
      {
        question: 'What does a function return when it has no <code>return</code> statement?',
        options: ['0', 'None', 'An empty string', 'It raises an error'],
        answer: 1,
        explanation: 'Every function returns a value; without an explicit return it is None.',
      },
      {
        question: 'Inside <code>def f(*args):</code>, what type is <code>args</code>?',
        options: ['list', 'set', 'dict', 'tuple'],
        answer: 3,
        explanation: 'The extra positional arguments are collected into a tuple.',
      },
      {
        question: 'Inside <code>def f(**kwargs):</code>, what type is <code>kwargs</code>?',
        options: ['dict', 'tuple', 'list', 'set'],
        answer: 0,
        explanation: 'The extra keyword arguments are collected into a dictionary of name to value.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are *args and **kwargs?',
        answer: `They let a function accept a variable number of arguments. <code>*args</code> collects extra positional arguments into a tuple, and <code>**kwargs</code> collects extra keyword arguments into a dictionary. The names are a convention; the asterisks are what matter. They are used for functions such as <code>print</code> that take any number of values, and for wrappers that pass arguments on to another function.`,
      },
      {
        question: 'How does a Python function return more than one value?',
        answer: `It returns a tuple. <code>return a, b</code> packs the two values into one tuple, and the caller can unpack it with <code>x, y = function()</code>. For more than two or three values, a named tuple, a dataclass or a dictionary is clearer, because the caller does not have to remember the order.`,
      },
    ],
  },

  'function-arguments': {
    whyItMatters: `How arguments are passed decides how easy a function is to call correctly. Keyword arguments make calls readable, keyword-only parameters prevent mix-ups, and the mutable default argument is one of the best-known traps in Python: it works on the first call and gives wrong results afterwards.`,
    exercise: {
      prompt: `Each call should return a basket containing only the item passed in, but the default list is shared between calls, so the second call also contains the first item. Fix the function.

Expected output: <code>['pen']</code> then <code>['book']</code>`,
      starterCode: `def add_item(item, basket=[]):
    basket.append(item)
    return basket


print(add_item("pen"))
print(add_item("book"))`,
      hints: [
        'A default value is created once, when the function is defined, and reused on every call.',
        'Use <code>None</code> as the default and create a new list inside the function when it is <code>None</code>.',
      ],
      solution: `def add_item(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket


print(add_item("pen"))
print(add_item("book"))`,
    },
    quiz: [
      {
        question: 'When is the default value of a parameter evaluated?',
        options: ['On every call', 'Once, when the def statement runs', 'When the module is imported for the second time', 'Never'],
        answer: 1,
        explanation: 'This is why a mutable default such as a list is shared between calls.',
      },
      {
        question: 'In <code>def f(a, *, b):</code>, how must <code>b</code> be passed?',
        options: ['By position', 'It is optional', 'By keyword only', 'As a list'],
        answer: 2,
        explanation: 'Parameters after a bare * can only be given by name, as in f(1, b=2).',
      },
      {
        question: 'What does <code>f(*[1, 2, 3])</code> do?',
        options: ['Passes one list argument', 'Raises a syntax error', 'Multiplies the list', 'Passes three separate positional arguments'],
        answer: 3,
        explanation: 'The star unpacks a sequence into positional arguments. Two stars unpack a dictionary into keyword arguments.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why is a mutable default argument a problem?',
        answer: `The default object is created a single time, when the function is defined, and that one object is used for every call that does not supply the argument. If the function modifies it, for example by appending to a list, the change is still there on the next call. The standard fix is to use <code>None</code> as the default and create the list or dictionary inside the function.`,
      },
      {
        question: 'Is Python pass-by-value or pass-by-reference?',
        answer: `Neither term fits exactly; Python passes a reference to the object, sometimes called pass-by-object-reference. The parameter becomes another name for the same object. If the object is mutable and the function changes it in place, the caller sees the change. If the function assigns a new object to the parameter, only the local name changes and the caller is unaffected.`,
      },
    ],
  },

  'lambda-functions': {
    whyItMatters: `Sorting records by one of their fields, finding the cheapest item, or choosing the longest word all need a small function that says what to compare. A lambda writes that function at the place it is used. You will see lambdas mostly as the <code>key</code> argument of <code>sorted</code>, <code>min</code> and <code>max</code>.`,
    exercise: {
      prompt: `Each product is a <code>(name, price)</code> pair. Print the product names ordered from the most expensive to the cheapest, and then the name of the cheapest product. Use a lambda as the <code>key</code>.

Expected output: <code>['bag', 'book', 'pen']</code> then <code>pen</code>`,
      starterCode: `products = [("pen", 12), ("bag", 450), ("book", 150)]

# TODO: sort by price, highest first, and print just the names

# TODO: find the cheapest product and print its name`,
      hints: [
        '<code>key=lambda product: product[1]</code> tells <code>sorted</code> and <code>min</code> to compare by price.',
        '<code>reverse=True</code> sorts from high to low.',
      ],
      solution: `products = [("pen", 12), ("bag", 450), ("book", 150)]

by_price = sorted(products, key=lambda product: product[1], reverse=True)
print([name for name, price in by_price])

cheapest = min(products, key=lambda product: product[1])
print(cheapest[0])`,
    },
    quiz: [
      {
        question: 'What can the body of a lambda contain?',
        options: ['A single expression', 'Any number of statements', 'Only a return statement', 'Only arithmetic'],
        answer: 0,
        explanation: 'The value of that expression is returned automatically. Statements such as assignments or loops are not allowed.',
      },
      {
        question: 'What does <code>(lambda x, y: x + y)(2, 3)</code> evaluate to?',
        options: ['(2, 3)', '5', 'A function', 'It raises an error'],
        answer: 1,
        explanation: 'The lambda is defined and immediately called with 2 and 3.',
      },
      {
        question: 'What does <code>[f() for f in [lambda: i for i in range(3)]]</code> produce?',
        options: ['[0, 1, 2]', '[0, 0, 0]', '[2, 2, 2]', 'It raises an error'],
        answer: 2,
        explanation: 'Each lambda looks up i when it is called, and by then the loop has finished with i equal to 2.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a lambda and a function defined with def?',
        answer: `A lambda is an anonymous function limited to one expression, whose value it returns. A <code>def</code> function has a name, can contain any statements, and can have a docstring. Both create the same kind of function object. Use a lambda for a short function passed as an argument, and <code>def</code> for anything that deserves a name or more than one line.`,
      },
      {
        question: 'What is the late-binding problem with lambdas in a loop, and how is it fixed?',
        answer: `A lambda does not store the value of an outer variable when it is created; it looks the variable up when it is called. Lambdas created in a loop therefore all see the loop variable's final value. The fix is to capture the current value as a default argument, as in <code>lambda i=i: i</code>, because defaults are evaluated when the lambda is created.`,
      },
    ],
  },

  'higher-order-functions-map-filter-and-reduce': {
    whyItMatters: `In Python a function is a value: it can be stored, passed to another function and returned from one. This is the idea behind <code>sorted(key=...)</code>, decorators, callbacks and most frameworks. <code>map</code>, <code>filter</code> and <code>reduce</code> are the classic examples, and the same three ideas appear in every data-processing library.`,
    exercise: {
      prompt: `Starting from the list of prices, use <code>map</code> to add 10% to each price, <code>filter</code> to keep the new prices above 100, and <code>reduce</code> to add up all the new prices. Print each result.

Expected output: <code>[110, 275, 44]</code>, <code>[110, 275]</code>, <code>429</code> (one per line)`,
      starterCode: `from functools import reduce

prices = [100, 250, 40]

# TODO: map: each price plus 10% (use price * 110 // 100 to stay with whole numbers)
# TODO: filter: the new prices greater than 100
# TODO: reduce: the sum of the new prices`,
      hints: [
        '<code>map</code> and <code>filter</code> return iterators, so wrap them in <code>list()</code> to print the values.',
        '<code>reduce(lambda a, b: a + b, values)</code> combines the values two at a time into one result.',
      ],
      solution: `from functools import reduce

prices = [100, 250, 40]

with_tax = list(map(lambda price: price * 110 // 100, prices))
print(with_tax)

print(list(filter(lambda price: price > 100, with_tax)))

print(reduce(lambda a, b: a + b, with_tax))`,
    },
    quiz: [
      {
        question: 'What does <code>map(str, [1, 2])</code> return in Python 3?',
        options: ['A map object that produces the values when iterated', '[\'1\', \'2\']', '(\'1\', \'2\')', 'None'],
        answer: 0,
        explanation: 'map is lazy. Pass it to list() to get a list.',
      },
      {
        question: 'Where is <code>reduce</code> found?',
        options: ['In the functools module', 'It is a built-in', 'In the math module', 'In the itertools module'],
        answer: 0,
        explanation: 'It was moved out of the built-ins in Python 3 and is imported from functools.',
      },
      {
        question: 'What does <code>all([])</code> return?',
        options: ['It raises an error', 'False', 'None', 'True'],
        answer: 3,
        explanation: 'No element is false, so all() is true for an empty iterable. any([]) is false.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a higher-order function?',
        answer: `A function that takes another function as an argument, returns a function, or both. <code>map</code>, <code>filter</code> and <code>sorted</code> with a <code>key</code> take functions; a decorator takes a function and returns a new one. This is possible because functions in Python are ordinary objects.`,
      },
      {
        question: 'Should you use map and filter or a comprehension?',
        answer: `They do the same work. A comprehension is usually preferred because the transformation and the condition are written inline and no lambda is needed: <code>[p * 2 for p in prices if p &gt; 100]</code>. <code>map</code> reads well when an existing function is applied directly, as in <code>map(int, parts)</code>.`,
      },
    ],
  },

  'recursion': {
    whyItMatters: `Some data is nested to an unknown depth: folders inside folders, comments with replies, JSON inside JSON. A function that calls itself handles each level in the same way, however deep the data goes, and is the natural way to write tree and graph algorithms. Recursion is also a standard interview topic.`,
    exercise: {
      prompt: `Write a recursive <code>factorial</code> function. Then write a recursive <code>flatten</code> function that turns a list containing nested lists into one flat list.

Expected output: <code>120</code> then <code>[1, 2, 3, 4, 5]</code>`,
      starterCode: `def factorial(n):
    # TODO: base case, then the recursive case
    pass


def flatten(items):
    # TODO: for each item, flatten it if it is a list, otherwise keep it
    pass


print(factorial(5))
print(flatten([1, [2, [3, 4]], 5]))`,
      hints: [
        'The base case for factorial is <code>n &lt;= 1</code>, which returns 1. Otherwise return <code>n * factorial(n - 1)</code>.',
        'In <code>flatten</code>, use <code>isinstance(item, list)</code> to decide, and <code>result.extend(flatten(item))</code> for a nested list.',
      ],
      solution: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)


def flatten(items):
    result = []
    for item in items:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result


print(factorial(5))
print(flatten([1, [2, [3, 4]], 5]))`,
    },
    quiz: [
      {
        question: 'What happens when a recursive function has no base case?',
        options: ['It returns None', 'It runs forever without error', 'It runs until RecursionError is raised', 'It does not compile'],
        answer: 2,
        explanation: 'Python stops the calls when the recursion limit is exceeded.',
      },
      {
        question: 'About how deep can recursion go in Python by default?',
        options: ['100 calls', 'There is no limit', '1,000,000 calls', '1,000 calls'],
        answer: 3,
        explanation: 'The default limit is 1000 and can be read with sys.getrecursionlimit().',
      },
      {
        question: 'Which decorator stores the results of previous calls so they are not computed again?',
        options: ['@functools.lru_cache', '@staticmethod', '@property', '@classmethod'],
        answer: 0,
        explanation: 'Caching results in this way is called memoization.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the parts of a recursive function?',
        answer: `A base case, which returns a result directly without another call and so ends the recursion, and a recursive case, which calls the function again with an input that is closer to the base case. Each call must make progress towards the base case, or the recursion never ends.`,
      },
      {
        question: 'When is recursion a poor choice in Python?',
        answer: `When the depth can be large. Each call uses a stack frame, Python limits the depth to about a thousand calls, and it does not optimise tail calls, so a deep recursion fails where a loop would not. Recursion that recomputes the same values, as in a plain Fibonacci, is also very slow unless the results are cached. A simple linear repetition is better written as a loop.`,
      },
    ],
  },

  'scope-closures-and-namespaces': {
    whyItMatters: `Scope decides which variable a name refers to, and it is the cause of <code>UnboundLocalError</code>, one of the most puzzling errors for newcomers. Closures, which follow from the same rules, are how decorators and callbacks remember values. Understanding the LEGB rule turns these from mysteries into predictable behaviour.`,
    exercise: {
      prompt: `Write <code>make_counter</code>, which returns a function. Each time the returned function is called it returns the next number, starting at 1. Two counters made by separate calls must count independently.

Expected output: <code>1</code>, <code>2</code>, <code>1</code> (one per line)`,
      starterCode: `def make_counter():
    count = 0

    def counter():
        # TODO: increase count and return it
        pass

    return counter


first = make_counter()
print(first())
print(first())

second = make_counter()
print(second())`,
      hints: [
        'Assigning to <code>count</code> inside <code>counter</code> would create a new local variable.',
        'Declare <code>nonlocal count</code> first, so the assignment changes the variable of the enclosing function.',
      ],
      solution: `def make_counter():
    count = 0

    def counter():
        nonlocal count
        count += 1
        return count

    return counter


first = make_counter()
print(first())
print(first())

second = make_counter()
print(second())`,
    },
    quiz: [
      {
        question: 'In which order does Python search for a name?',
        options: ['Global, local, built-in, enclosing', 'Local, enclosing, global, built-in', 'Built-in, global, enclosing, local', 'Local, global, enclosing, built-in'],
        answer: 1,
        explanation: 'This is the LEGB rule.',
      },
      {
        question: 'A function contains <code>total += 1</code>, where <code>total</code> is a global variable and there is no <code>global</code> declaration. What happens when it runs?',
        options: ['The global is increased', 'UnboundLocalError is raised', 'A new global is created', 'Nothing'],
        answer: 1,
        explanation: 'The assignment makes total local to the function, and it is read before it has a value.',
      },
      {
        question: 'What is <code>nonlocal</code> used for?',
        options: ['To change a global variable', 'To import a name', 'To create a constant', 'To assign to a variable of an enclosing function'],
        answer: 3,
        explanation: 'global refers to the module level; nonlocal refers to the nearest enclosing function.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a closure?',
        answer: `A closure is a function that remembers variables from the enclosing function in which it was defined, even after that enclosing function has returned. Each call of the outer function creates a separate set of remembered variables. Closures are used to build functions with stored state, such as counters, and are the mechanism behind decorators.`,
      },
      {
        question: 'What is the difference between global and nonlocal?',
        answer: `Both allow a function to assign to a variable defined outside it. <code>global name</code> makes the name refer to the variable at module level. <code>nonlocal name</code> makes it refer to the variable in the nearest enclosing function, and that variable must already exist. Neither is needed just to read an outer variable, only to assign to it.`,
      },
    ],
  },

  'built-in-functions-reference': {
    whyItMatters: `Python comes with about seventy built-in functions that are always available without an import. Knowing them means not writing loops for things like the largest value, a total, or whether any item matches a condition. Experienced Python programmers reach for these first, and code that uses them is shorter and has fewer bugs.`,
    exercise: {
      prompt: `Using only built-in functions, print the highest and lowest score on one line, the average rounded to one decimal place, the scores sorted from high to low, and whether any score is below 60.

Expected output: <code>95 58</code>, <code>76.5</code>, <code>[95, 81, 72, 58]</code>, <code>True</code> (one per line)`,
      starterCode: `scores = [72, 95, 58, 81]

# TODO: print the highest and the lowest score
# TODO: print the average, rounded to one decimal place
# TODO: print the scores sorted from high to low
# TODO: print whether any score is below 60`,
      hints: [
        'The average is <code>sum(scores) / len(scores)</code>, and <code>round(value, 1)</code> keeps one decimal.',
        '<code>any(score &lt; 60 for score in scores)</code> is true if at least one score matches.',
      ],
      solution: `scores = [72, 95, 58, 81]

print(max(scores), min(scores))
print(round(sum(scores) / len(scores), 1))
print(sorted(scores, reverse=True))
print(any(score < 60 for score in scores))`,
    },
    quiz: [
      {
        question: 'What does <code>divmod(7, 2)</code> return?',
        options: ['(3, 1)', '3.5', '[3, 1]', '3'],
        answer: 0,
        explanation: 'It returns the quotient and the remainder together as a tuple.',
      },
      {
        question: 'What does <code>list(zip("ab", [1, 2]))</code> produce?',
        options: ['[\'a1\', \'b2\']', '[(\'a\', 1), (\'b\', 2)]', '[(\'a\', \'b\'), (1, 2)]', '[\'a\', \'b\', 1, 2]'],
        answer: 1,
        explanation: 'zip pairs the items that are in the same position.',
      },
      {
        question: 'Why should <code>eval()</code> not be used on text typed by a user?',
        options: ['It is slow', 'It only works on numbers', 'It runs the text as Python code, so the user could execute anything', 'It is deprecated'],
        answer: 2,
        explanation: 'To convert text containing a Python literal safely, use ast.literal_eval.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What do enumerate() and zip() do?',
        answer: `<code>enumerate(iterable)</code> yields pairs of an index and an item, so a loop has the position without a separate counter; <code>start=1</code> changes the first index. <code>zip(a, b)</code> yields tuples made of the items at the same position in each iterable, and stops at the shortest. Both are lazy and are normally used directly in a <code>for</code> loop.`,
      },
      {
        question: 'What is the difference between eval() and ast.literal_eval()?',
        answer: `<code>eval()</code> evaluates any Python expression in the string, including function calls, so with untrusted input it can run harmful code. <code>ast.literal_eval()</code> accepts only literals — numbers, strings, lists, tuples, dictionaries, sets, booleans and <code>None</code> — and raises an error for anything else, which makes it safe for turning text into data.`,
      },
    ],
  },
}
