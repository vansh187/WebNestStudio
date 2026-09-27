// Python course — data analysis part 1: NumPy and an introduction to pandas.
// Keys are slugs matching topics in codelabDefaults.js.
export const pythonDataA = {
  'introduction-to-numpy': {
    title: 'Introduction to NumPy',
    intro: `<strong>NumPy</strong> (Numerical Python) is the foundation of data science in Python. pandas, matplotlib, scikit-learn, SciPy, PyTorch and TensorFlow are all built on — or interoperate with — its central object, the <strong>ndarray</strong>: a fast, fixed-type, n-dimensional array of numbers.

Why not just use lists? A Python list stores pointers to separate Python objects, so maths on a million numbers means a million slow Python-level operations. A NumPy array stores raw numbers in one contiguous block of memory and runs operations in optimised C code, typically <strong>10–100× faster</strong> and using far less memory. This lesson covers installing NumPy, creating arrays, their key attributes, data types, and the idea of <em>vectorised</em> operations.`,
    sections: [
      {
        heading: 'Installing and Importing',
        body: `Install with <code>pip install numpy</code> (it is also included in Anaconda). By universal convention it is imported as <code>import numpy as np</code>. Everything in this module can be run in a Jupyter notebook, VS Code, or as a normal script.`,
      },
      {
        heading: 'Creating Arrays',
        list: [
          '<code>np.array([1, 2, 3])</code> — from a list (nested lists give 2-D arrays).',
          '<code>np.zeros((2, 3))</code>, <code>np.ones(5)</code>, <code>np.full((2, 2), 7)</code>, <code>np.eye(3)</code> — filled arrays and the identity matrix.',
          '<code>np.arange(start, stop, step)</code> — like <code>range</code> but returns an array; <code>np.linspace(start, stop, num)</code> — evenly spaced values including the end point.',
          '<code>np.random.default_rng(seed)</code> — the modern random generator: <code>.integers()</code>, <code>.random()</code>, <code>.normal()</code>, <code>.choice()</code>.',
        ],
      },
      {
        heading: 'Attributes and Data Types',
        body: `Every array has a <code>shape</code> (size of each dimension, e.g. <code>(3, 4)</code> = 3 rows, 4 columns), <code>ndim</code> (number of dimensions), <code>size</code> (total elements), <code>dtype</code> (element type) and <code>itemsize</code>/<code>nbytes</code> (memory). All elements share one dtype: <code>int64</code>, <code>float64</code>, <code>bool</code>, <code>complex128</code>, fixed-width strings and more. Mixing ints and floats upcasts to float; convert explicitly with <code>astype()</code>. Choosing smaller types such as <code>float32</code> or <code>int8</code> can save a lot of memory on big data.`,
      },
      {
        heading: 'Vectorisation',
        body: `Arithmetic on arrays applies element by element without a Python loop: <code>prices * 1.18</code> adds 18% tax to every price, <code>a + b</code> adds two arrays position by position, and functions like <code>np.sqrt</code>, <code>np.exp</code> and <code>np.round</code> ("universal functions" or ufuncs) work on whole arrays. Writing code this way — <em>vectorised</em> — is the single most important NumPy habit.`,
      },
    ],
    examples: [
      {
        caption: 'Creating arrays and inspecting their attributes',
        code: `import numpy as np

marks = np.array([78, 92, 65, 88])
matrix = np.array([[1, 2, 3], [4, 5, 6]])
print(marks, marks.dtype, marks.shape, marks.ndim)
print(matrix)
print("shape:", matrix.shape, "size:", matrix.size, "bytes:", matrix.nbytes)

print(np.zeros((2, 3)))
print(np.ones(4, dtype=int), np.full(3, 7.5))
print(np.eye(3, dtype=int))
print(np.arange(0, 20, 5), np.linspace(0, 1, 5))

rng = np.random.default_rng(seed=42)          # same seed -> same "random" numbers
print(rng.integers(1, 7, size=5))              # five dice rolls
print(rng.normal(loc=170, scale=10, size=3).round(1))`,
        output: `[78 92 65 88] int64 (4,) 1
[[1 2 3]
 [4 5 6]]
shape: (2, 3) size: 6 bytes: 48
[[0. 0. 0.]
 [0. 0. 0.]]
[1 1 1 1] [7.5 7.5 7.5]
[[1 0 0]
 [0 1 0]
 [0 0 1]]
[ 0  5 10 15] [0.   0.25 0.5  0.75 1.  ]
[1 5 4 3 3]
[179.4 150.5 157. ]`,
        runnable: false,
      },
      {
        caption: 'Data types, upcasting and astype()',
        code: `import numpy as np

print(np.array([1, 2, 3]).dtype, np.array([1, 2.5]).dtype, np.array([True, False]).dtype)
print(np.array([1, 2, 3.7]))                   # ints upcast to float

prices = np.array(["199.5", "45", "1200"])
as_numbers = prices.astype(float)
print(prices.dtype, "->", as_numbers.dtype, as_numbers.sum())

big = np.arange(1_000_000, dtype=np.float64)
print(big.nbytes // 1_000_000, "MB as float64,", big.astype(np.float32).nbytes // 1_000_000, "MB as float32")
print(np.array([3.9, -3.9]).astype(int))       # astype(int) truncates toward zero`,
        output: `int64 float64 bool
[1.  2.  3.7]
<U5 -> float64 1444.5
8 MB as float64, 4 MB as float32
[ 3 -3]`,
        runnable: false,
      },
      {
        caption: 'Vectorised operations versus Python loops',
        code: `import time
import numpy as np

prices = np.array([120.0, 250.0, 99.0, 560.0])
quantities = np.array([3, 1, 10, 2])
print(prices * 1.18)                           # tax on every price
print(prices * quantities)                     # element-wise multiplication
print((prices * quantities).sum(), np.sqrt([16, 25, 81]))

numbers = list(range(2_000_000))
array = np.arange(2_000_000)

start = time.perf_counter()
squares_list = [n * n for n in numbers]
loop_time = time.perf_counter() - start

start = time.perf_counter()
squares_array = array * array
numpy_time = time.perf_counter() - start

print("same result:", squares_list[-1] == squares_array[-1])
print("NumPy faster:", numpy_time < loop_time)`,
        output: `[141.6  295.   116.82 660.8 ]
[ 360.  250.  990. 1120.]
2720.0 [4. 5. 9.]
same result: True
NumPy faster: True`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Looping over array elements in Python instead of using vectorised operations.',
      'Forgetting that all elements share one dtype, so np.array([1, "a"]) turns everything into strings.',
      'Confusing np.arange (step size, end excluded) with np.linspace (number of points, end included).',
      'Using the legacy np.random.seed/np.random.rand instead of the recommended np.random.default_rng().',
      'Expecting astype(int) to round — it truncates; use np.round first.',
    ],
    keyPoints: [
      'NumPy arrays are fast, compact, single-type, n-dimensional containers of numbers.',
      'Create arrays with array, zeros, ones, full, eye, arange, linspace and default_rng.',
      'shape, ndim, size and dtype describe an array; astype converts types.',
      'Vectorised operations apply to every element at once and are much faster than loops.',
      'NumPy is the base of pandas, matplotlib and scikit-learn.',
    ],
  },

  'numpy-indexing-and-array-operations': {
    title: 'NumPy Indexing, Broadcasting and Array Operations',
    intro: `Once data is in an array, you need to pick out parts of it, combine arrays, summarise them and change their shape. This lesson covers indexing and slicing in one and two dimensions, <strong>boolean masks</strong> (the NumPy way to filter), fancy indexing, aggregation along rows or columns with <code>axis</code>, <strong>broadcasting</strong> rules, reshaping and stacking, and the difference between <em>views</em> and <em>copies</em>.`,
    sections: [
      {
        heading: 'Indexing, Slicing and Masks',
        body: `One-dimensional arrays index like lists: <code>a[0]</code>, <code>a[-1]</code>, <code>a[2:5]</code>, <code>a[::2]</code>. Two-dimensional arrays take a row and a column: <code>m[1, 2]</code>, a whole row <code>m[0]</code>, a column <code>m[:, 1]</code>, a block <code>m[:2, 1:]</code>. A comparison such as <code>a &gt; 50</code> produces a boolean array — a <strong>mask</strong> — and <code>a[a &gt; 50]</code> selects matching elements. Combine conditions with <code>&amp;</code>, <code>|</code> and <code>~</code> (with parentheses), not <code>and</code>/<code>or</code>. <strong>Fancy indexing</strong> uses a list of positions: <code>a[[0, 3, 4]]</code>.`,
      },
      {
        heading: 'Aggregations and axis',
        body: `<code>sum</code>, <code>mean</code>, <code>median</code>, <code>std</code>, <code>min</code>, <code>max</code>, <code>argmin</code>/<code>argmax</code> (position of the extreme), <code>cumsum</code> and <code>percentile</code> summarise arrays. On a 2-D array, <code>axis=0</code> collapses the rows and gives one result <em>per column</em>; <code>axis=1</code> collapses the columns and gives one result <em>per row</em>. <code>np.where(condition, x, y)</code> chooses values element by element, <code>np.clip</code> limits values to a range, and <code>np.unique(..., return_counts=True)</code> counts distinct values.`,
      },
      {
        heading: 'Broadcasting, Reshaping and Views',
        body: `<strong>Broadcasting</strong> lets NumPy combine arrays of different shapes: dimensions are compared from the right, and each pair must be equal or one of them must be 1 (which is stretched). So a <code>(3, 4)</code> matrix minus a <code>(4,)</code> row subtracts that row from every row. <code>reshape</code> changes shape without changing data (<code>-1</code> means "work it out"); <code>ravel</code>/<code>flatten</code> make it 1-D; <code>.T</code> transposes; <code>concatenate</code>, <code>vstack</code> and <code>hstack</code> join arrays. Slices are <strong>views</strong> that share memory with the original — changing a view changes the original — so call <code>.copy()</code> when you need independent data. Boolean and fancy indexing always return copies.`,
      },
    ],
    examples: [
      {
        caption: 'Indexing, slicing, boolean masks and fancy indexing',
        code: `import numpy as np

temps = np.array([21, 25, 31, 28, 35, 19, 24])
print(temps[0], temps[-1], temps[2:5], temps[::3])
print(temps > 27)                              # a boolean mask
print(temps[temps > 27])                       # filter with the mask
print(temps[(temps > 20) & (temps < 30)])      # use & and |, with parentheses
print((temps > 30).sum(), "hot days")          # True counts as 1
print(temps[[0, 2, 4]])                        # fancy indexing

scores = np.array([[78, 92, 65],
                   [88, 71, 94],
                   [59, 85, 90]])
print(scores[1, 2], scores[0], scores[:, 1])
print(scores[:2, 1:])
scores[scores < 60] = 60                        # assign through a mask
print(scores[2])`,
        output: `21 24 [31 28 35] [21 28 24]
[False False  True  True  True False False]
[31 28 35]
[21 25 28 24]
2 hot days
[21 31 35]
94 [78 92 65] [92 71 85]
[[92 65]
 [71 94]]
[60 85 90]`,
        runnable: false,
      },
      {
        caption: 'Aggregations with axis, where, clip and unique',
        code: `import numpy as np

# rows = 3 students, columns = 4 subjects
scores = np.array([[78, 92, 65, 80],
                   [88, 71, 94, 60],
                   [59, 85, 90, 72]])
print("overall mean:", scores.mean().round(2))
print("per subject (axis=0):", scores.mean(axis=0).round(1))
print("per student (axis=1):", scores.sum(axis=1))
print("best subject per student:", scores.argmax(axis=1))
print("median, std:", np.median(scores), scores.std().round(2))
print("90th percentile:", np.percentile(scores, 90))
print(np.where(scores >= 75, "pass", "retry")[0])
print(np.clip(scores[1], 65, 90))
print(np.cumsum([100, 250, -50, 400]))

grades = np.array(["A", "B", "A", "C", "B", "A"])
values, counts = np.unique(grades, return_counts=True)
print(dict(zip(values.tolist(), counts.tolist())))`,
        output: `overall mean: 77.83
per subject (axis=0): [75.  82.7 83.  70.7]
per student (axis=1): [315 313 306]
best subject per student: [1 2 2]
median, std: 79.0 11.86
90th percentile: 91.8
['pass' 'pass' 'retry' 'pass']
[88 71 90 65]
[100 350 300 700]
{'A': 3, 'B': 2, 'C': 1}`,
        runnable: false,
      },
      {
        caption: 'Broadcasting, reshape, stacking and views vs copies',
        code: `import numpy as np

sales = np.array([[10, 20, 30, 40],
                  [15, 25, 35, 45],
                  [12, 22, 32, 42]])
column_means = sales.mean(axis=0)              # shape (4,)
print(sales - column_means)                    # (3, 4) - (4,) -> broadcast over rows
print((sales / sales.sum(axis=1, keepdims=True)).round(2))   # (3, 4) / (3, 1): share of each row

a = np.arange(12)
print(a.reshape(3, 4))
print(a.reshape(2, -1).shape, a.reshape(3, 4).T.shape)
print(np.vstack([[1, 2], [3, 4]]), np.hstack([[1, 2], [3, 4]]))

original = np.array([1, 2, 3, 4, 5])
view = original[1:4]
view[0] = 99                                   # changes the original too!
print(original)
safe = original[1:4].copy()
safe[0] = -1
print(original, safe)`,
        output: `[[-2.33333333 -2.33333333 -2.33333333 -2.33333333]
 [ 2.66666667  2.66666667  2.66666667  2.66666667]
 [-0.33333333 -0.33333333 -0.33333333 -0.33333333]]
[[0.1  0.2  0.3  0.4 ]
 [0.12 0.21 0.29 0.38]
 [0.11 0.2  0.3  0.39]]
[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]
(2, 6) (4, 3)
[[1 2]
 [3 4]] [1 2 3 4]
[ 1 99  3  4  5]
[ 1 99  3  4  5] [-1  3  4]`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Using and/or instead of & and | with arrays, or forgetting parentheses around each condition.',
      'Mixing up axis=0 (per column) and axis=1 (per row).',
      'Modifying a slice and being surprised the original array changed — slices are views.',
      'Broadcasting shape errors from arrays whose trailing dimensions do not match; use keepdims=True or reshape.',
      'Writing loops to count or filter when a mask and .sum() do it in one step.',
    ],
    keyPoints: [
      'Index with a[i], m[row, col], slices and : for whole rows/columns.',
      'Boolean masks filter and assign; fancy indexing picks arbitrary positions.',
      'axis=0 aggregates down columns, axis=1 across rows.',
      'Broadcasting stretches size-1 dimensions to combine different shapes.',
      'reshape/T/stack change layout; slices are views, so copy() when needed.',
    ],
  },

  'numpy-for-math-statistics-and-linear-algebra': {
    title: 'NumPy for Maths, Statistics and Linear Algebra',
    intro: `NumPy is also a complete numerical toolkit. This lesson covers the random number generator for simulations and sampling, descriptive statistics and correlation, sorting and searching, linear algebra (matrix multiplication, solving systems of equations, inverses), handling missing values with NaN, and saving and loading arrays — the maths you will meet again in machine learning.`,
    sections: [
      {
        heading: 'Random Numbers and Simulation',
        body: `Create a generator with <code>rng = np.random.default_rng(seed)</code>. Use <code>integers</code>, <code>random</code> (uniform 0–1), <code>normal</code>, <code>choice</code> (with <code>replace</code> and <code>p</code> for weights), <code>shuffle</code> and <code>permutation</code>. A fixed seed makes results reproducible — essential for experiments and machine learning. Simulations (Monte Carlo) estimate probabilities by generating many random trials at once with vectorised code.`,
      },
      {
        heading: 'Linear Algebra',
        body: `<code>A @ B</code> (or <code>np.dot</code>) is matrix multiplication, while <code>A * B</code> multiplies element-wise. <code>np.linalg</code> provides <code>solve</code> (solve <code>Ax = b</code>), <code>inv</code>, <code>det</code>, <code>norm</code>, <code>eig</code> and <code>lstsq</code> (least squares, the maths behind linear regression). Prefer <code>solve</code> to multiplying by an inverse: it is faster and more accurate.`,
      },
      {
        heading: 'NaN, Sorting and Saving',
        body: `Missing numeric values are represented by <code>np.nan</code>; any arithmetic with NaN gives NaN, so use <code>np.nanmean</code>, <code>np.nansum</code> and <code>np.isnan</code>. <code>np.sort</code> returns a sorted copy, <code>argsort</code> returns the order of indices (useful for ranking), and <code>np.searchsorted</code> finds insertion points. Save arrays with <code>np.save</code>/<code>np.load</code> (binary <code>.npy</code>) or <code>np.savetxt</code>/<code>np.loadtxt</code> for text.`,
      },
    ],
    examples: [
      {
        caption: 'Random sampling and a Monte Carlo simulation',
        code: `import numpy as np

rng = np.random.default_rng(seed=2026)
print(rng.choice(["heads", "tails"], size=6))
print(rng.choice(["red", "green", "blue"], size=5, p=[0.6, 0.3, 0.1]))
deck = np.arange(1, 11)
rng.shuffle(deck)
print(deck)

# Probability that two dice sum to 7 (exact answer: 1/6 = 0.1667)
rolls = rng.integers(1, 7, size=(1_000_000, 2))
print(round(np.mean(rolls.sum(axis=1) == 7), 3))

heights = rng.normal(loc=165, scale=8, size=10_000)
print(round(heights.mean(), 1), round(heights.std(), 1))
print("share taller than 180 cm:", round(np.mean(heights > 180), 3))`,
        output: `['tails' 'heads' 'heads' 'tails' 'heads' 'heads']
['red' 'red' 'green' 'blue' 'red']
[ 6  9  4  1  5  8 10  2  7  3]
0.166
164.9 8.0
share taller than 180 cm: 0.03`,
        runnable: false,
      },
      {
        caption: 'Statistics, correlation, NaN handling and ranking',
        code: `import numpy as np

hours = np.array([1, 2, 3, 4, 5, 6, 7, 8])
marks = np.array([35, 45, 50, 58, 65, 72, 80, 88])
print("mean:", marks.mean(), "median:", np.median(marks), "var:", marks.var().round(1))
print("correlation:", np.corrcoef(hours, marks)[0, 1].round(3))
slope, intercept = np.polyfit(hours, marks, deg=1)       # best straight line
print(f"marks = {slope:.2f} * hours + {intercept:.2f}")

readings = np.array([21.5, np.nan, 23.0, 22.1, np.nan])
print(readings.mean(), np.nanmean(readings).round(2), np.isnan(readings).sum(), "missing")

scores = np.array([72, 95, 64, 88])
order = np.argsort(scores)[::-1]                          # indices, highest first
print(np.sort(scores), order, scores[order])
print(np.searchsorted([100, 200, 500, 1000], 350))        # which price band`,
        output: `mean: 61.625 median: 61.5 var: 285.7
correlation: 0.999
marks = 7.37 * hours + 28.46
nan 22.2 2 missing
[64 72 88 95] [1 3 0 2] [95 88 72 64]
2`,
        runnable: false,
      },
      {
        caption: 'Matrix multiplication and solving equations',
        code: `import numpy as np

A = np.array([[2, 1],
              [1, 3]])
B = np.array([[1, 0],
              [4, 2]])
print(A * B)                   # element-wise
print(A @ B)                   # matrix product
print(np.linalg.det(A).round(2), np.linalg.inv(A).round(2).tolist())

# 3 pens + 2 notebooks = 160 ; 1 pen + 4 notebooks = 220 -> prices?
coefficients = np.array([[3, 2],
                         [1, 4]])
totals = np.array([160, 220])
pen, notebook = np.linalg.solve(coefficients, totals)
print(f"pen = {pen:.0f}, notebook = {notebook:.0f}")

np.save("prices.npy", np.array([pen, notebook]))
print(np.load("prices.npy"))
print(np.linalg.norm([3, 4]))  # length of a vector`,
        output: `[[2 0]
 [4 6]]
[[ 6  2]
 [13  6]]
5.0 [[0.6, -0.2], [-0.2, 0.4]]
pen = 20, notebook = 50
[20. 50.]
5.0`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Using * when you mean matrix multiplication (@).',
      'Computing inv(A) @ b instead of np.linalg.solve(A, b).',
      'Letting a single NaN turn every result into NaN — use nan-aware functions or clean the data.',
      'Forgetting to set a seed, making experiments impossible to reproduce.',
      'Comparing floats with == instead of np.isclose().',
    ],
    keyPoints: [
      'default_rng(seed) gives reproducible random numbers for sampling and simulation.',
      'mean, median, var, std, percentile, corrcoef and polyfit describe data.',
      '@ multiplies matrices; np.linalg solves systems, inverts and decomposes them.',
      'Handle NaN with isnan and nan-functions; sort with sort/argsort.',
      'Save arrays with np.save/np.load.',
    ],
  },

  'introduction-to-pandas': {
    title: 'Introduction to pandas: Series and DataFrames',
    intro: `<strong>pandas</strong> is the most important library for working with tabular data in Python — think of it as a programmable spreadsheet. It reads data from CSV, Excel, JSON, SQL databases and more into a <strong>DataFrame</strong>: a table with labelled columns (each with its own type) and a labelled row index. It then lets you inspect, clean, filter, transform, group, join and export that data in a few lines.

This lesson introduces the two core objects, <strong>Series</strong> and <strong>DataFrame</strong>, shows how to create them and load files, and how to take a first look at a new dataset. The examples use pandas 3, which enables Copy-on-Write and a dedicated string type by default.`,
    sections: [
      {
        heading: 'Series and DataFrame',
        body: `A <strong>Series</strong> is a one-dimensional labelled array — one column — with an <code>index</code> (labels), <code>values</code> and a <code>dtype</code>. A <strong>DataFrame</strong> is a collection of Series sharing the same index. Create one from a dict of lists (column by column), a list of dicts (row by row, like JSON records), or a NumPy array with column names. Selecting <code>df["price"]</code> returns a Series; <code>df[["name", "price"]]</code> returns a smaller DataFrame. Install with <code>pip install pandas</code> and import as <code>import pandas as pd</code>.`,
      },
      {
        heading: 'Reading and Writing Data',
        list: [
          '<code>pd.read_csv("sales.csv")</code> — options include <code>sep</code>, <code>usecols</code>, <code>dtype</code>, <code>parse_dates</code>, <code>index_col</code>, <code>na_values</code> and <code>nrows</code>.',
          '<code>pd.read_excel("report.xlsx", sheet_name="2026")</code> (needs <code>openpyxl</code>), <code>pd.read_json()</code>, <code>pd.read_sql(query, connection)</code>, <code>pd.read_parquet()</code>.',
          '<code>df.to_csv("out.csv", index=False)</code>, <code>to_excel</code>, <code>to_json(orient="records")</code>, <code>to_sql</code>, <code>to_parquet</code>.',
        ],
      },
      {
        heading: 'First Look at a Dataset',
        body: `<code>head(n)</code>/<code>tail(n)</code> show the first/last rows, <code>shape</code> gives (rows, columns), <code>columns</code> and <code>dtypes</code> list columns and types, <code>info()</code> summarises types, non-null counts and memory, <code>describe()</code> gives count, mean, std, min, quartiles and max for numeric columns, and <code>value_counts()</code> counts categories. Doing this first on every new dataset reveals wrong types, missing values and surprises before you analyse anything.`,
      },
    ],
    examples: [
      {
        caption: 'Creating Series and DataFrames',
        code: `import pandas as pd

prices = pd.Series([450, 899, 350], index=["Python Basics", "Deep Python", "SQL Basics"], name="price")
print(prices)
print(prices["Deep Python"], prices.mean(), prices.index.tolist())

# From a dict of columns
df = pd.DataFrame({
    "product": ["Pen", "Notebook", "Backpack", "Mouse"],
    "category": ["stationery", "stationery", "bags", "electronics"],
    "price": [20, 60, 1250, 699],
    "in_stock": [True, True, False, True],
})
print(df)
print(df.shape, list(df.columns))
print(df.dtypes)

# From a list of dicts (like JSON records)
orders = pd.DataFrame([{"id": 1, "total": 540.5}, {"id": 2, "total": 120.0}])
print(orders)`,
        output: `Python Basics    450
Deep Python      899
SQL Basics       350
Name: price, dtype: int64
899 566.3333333333334 ['Python Basics', 'Deep Python', 'SQL Basics']
    product     category  price  in_stock
0       Pen   stationery     20      True
1  Notebook   stationery     60      True
2  Backpack         bags   1250     False
3     Mouse  electronics    699      True
(4, 4) ['product', 'category', 'price', 'in_stock']
product       str
category      str
price       int64
in_stock     bool
dtype: object
   id  total
0   1  540.5
1   2  120.0`,
        runnable: false,
      },
      {
        caption: 'Reading a CSV and taking a first look',
        code: `import io
import pandas as pd

csv_text = """order_id,date,city,product,quantity,unit_price
1001,2026-01-05,Pune,Pen,10,20
1002,2026-01-05,Mumbai,Notebook,4,60
1003,2026-01-06,Pune,Backpack,1,1250
1004,2026-01-07,Delhi,Mouse,2,699
1005,2026-01-07,Mumbai,Pen,25,20
1006,2026-01-08,Pune,Notebook,,60
"""
# With a real file: pd.read_csv("sales.csv", parse_dates=["date"])
sales = pd.read_csv(io.StringIO(csv_text), parse_dates=["date"])

print(sales.head(3))
print(sales.shape)
sales.info()
print(sales.describe().round(1))
print(sales["city"].value_counts())`,
        output: `   order_id       date    city   product  quantity  unit_price
0      1001 2026-01-05    Pune       Pen      10.0          20
1      1002 2026-01-05  Mumbai  Notebook       4.0          60
2      1003 2026-01-06    Pune  Backpack       1.0        1250
(6, 6)
<class 'pandas.DataFrame'>
RangeIndex: 6 entries, 0 to 5
Data columns (total 6 columns):
 #   Column      Non-Null Count  Dtype
---  ------      --------------  -----
 0   order_id    6 non-null      int64
 1   date        6 non-null      datetime64[us]
 2   city        6 non-null      str
 3   product     6 non-null      str
 4   quantity    5 non-null      float64
 5   unit_price  6 non-null      int64
dtypes: datetime64[us](1), float64(1), int64(2), str(2)
memory usage: 420.0 bytes
       order_id                 date  quantity  unit_price
count       6.0                    6       5.0         6.0
mean     1003.5  2026-01-06 08:00:00       8.4       351.5
min      1001.0  2026-01-05 00:00:00       1.0        20.0
25%      1002.2  2026-01-05 06:00:00       2.0        30.0
50%      1003.5  2026-01-06 12:00:00       4.0        60.0
75%      1004.8  2026-01-07 00:00:00      10.0       539.2
max      1006.0  2026-01-08 00:00:00      25.0      1250.0
std         1.9                  NaN       9.9       513.4
city
Pune      3
Mumbai    2
Delhi     1
Name: count, dtype: int64`,
        runnable: false,
      },
      {
        caption: 'Writing data back out',
        code: `import pandas as pd

report = pd.DataFrame({"city": ["Pune", "Mumbai"], "revenue": [1890, 740]})
report.to_csv("report.csv", index=False)           # index=False: no extra index column
print(open("report.csv").read())
print(report.to_json(orient="records"))
print(pd.read_csv("report.csv").equals(report))`,
        output: `city,revenue
Pune,1890
Mumbai,740

[{"city":"Pune","revenue":1890},{"city":"Mumbai","revenue":740}]
True`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Forgetting index=False in to_csv and getting an unwanted "Unnamed: 0" column when reading it back.',
      'Not using parse_dates, so dates stay as text and date operations fail.',
      'Skipping info()/describe() and missing wrong types or missing values.',
      'Confusing df["col"] (a Series) with df[["col"]] (a DataFrame).',
      'Loading an entire huge file when usecols or nrows would do.',
    ],
    keyPoints: [
      'A Series is one labelled column; a DataFrame is a table of Series sharing an index.',
      'Create DataFrames from dicts of lists, lists of dicts or NumPy arrays.',
      'read_csv/read_excel/read_json/read_sql load data; to_csv and friends save it.',
      'head, shape, dtypes, info, describe and value_counts give a first look.',
      'pandas 3 uses Copy-on-Write and a dedicated string dtype by default.',
    ],
  },
}
