// Practice blocks for the Data Analysis with NumPy and pandas and Machine Learning Basics
// modules. Merged onto the lesson entries in index.js by slug, so the lesson prose files
// stay unchanged.
// The exercises print plain Python values (via tolist(), to_dict() and round()) so that
// the output does not depend on how a library version formats arrays and tables.
// The machine-learning exercises use tiny, cleanly separated data so the results are exact.
export const practicePythonDataMl = {
  'introduction-to-numpy': {
    whyItMatters: `NumPy is the foundation of the whole Python data stack: pandas, scikit-learn, Matplotlib and the deep-learning libraries all build on its arrays. An operation on a whole array runs in compiled code and is often a hundred times faster than a Python loop, which is what makes Python practical for numerical work.`,
    exercise: {
      prompt: `Create a NumPy array from the list, then print the array with every value doubled (as a list), the shape of the array, and its mean.

Expected output: <code>[2, 4, 6, 8]</code>, <code>(4,)</code>, <code>2.5</code> (one per line)`,
      starterCode: `import numpy as np

values = [1, 2, 3, 4]

# TODO: create an array from values
# TODO: print the doubled array as a list
# TODO: print the shape
# TODO: print the mean`,
      hints: [
        'Arithmetic applies to every element: <code>array * 2</code>. <code>tolist()</code> converts an array to a Python list.',
        'The shape is the attribute <code>array.shape</code>, and the mean is the method <code>array.mean()</code>.',
      ],
      solution: `import numpy as np

values = [1, 2, 3, 4]

array = np.array(values)
print((array * 2).tolist())
print(array.shape)
print(array.mean())`,
    },
    quiz: [
      {
        question: 'What is the result of <code>np.array([1, 2, 3]) + 10</code>?',
        options: ['An error', '16', 'array([1, 2, 3, 10])', 'array([11, 12, 13])'],
        answer: 3,
        explanation: 'The operation is applied to each element. With a Python list, + would join lists.',
      },
      {
        question: 'How does a NumPy array differ from a Python list?',
        options: ['It can hold mixed types efficiently', 'All its elements have the same type and are stored in one block of memory', 'It cannot be indexed', 'It is always two-dimensional'],
        answer: 1,
        explanation: 'That layout is what allows fast, vectorised operations.',
      },
      {
        question: 'What does <code>np.arange(0, 10, 2)</code> produce?',
        options: ['[0, 2, 4, 6, 8]', '[0, 10, 2]', '[2, 4, 6, 8, 10]', '[0, 1, 2]'],
        answer: 0,
        explanation: 'It works like range: start, stop (excluded) and step.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why is NumPy faster than plain Python lists for numerical work?',
        answer: `A list holds references to separate Python objects, and a loop over it checks the type of each element as it goes. A NumPy array holds raw values of one type in a contiguous block of memory, and operations on it run as loops in compiled C code. This is called vectorisation; it also uses much less memory per element.`,
      },
      {
        question: 'What are the shape and dtype of an array?',
        answer: `<code>shape</code> is a tuple giving the size of each dimension: <code>(3,)</code> for a one-dimensional array of three elements, <code>(2, 3)</code> for two rows and three columns. <code>dtype</code> is the type shared by all the elements, such as <code>int64</code> or <code>float64</code>. Mixing integers and floats in one array converts everything to float.`,
      },
    ],
  },

  'numpy-indexing-and-array-operations': {
    whyItMatters: `Selecting rows, columns and the values that meet a condition is what you do to data all day. NumPy's indexing, boolean masks and <code>axis</code> argument express these without loops, and pandas uses exactly the same ideas, so learning them here makes the next lessons much easier.`,
    exercise: {
      prompt: `For the 2 × 3 array below, print the element in the second row and third column, the first column as a list, the values greater than 3 as a list, and the sum of each column as a list.

Expected output: <code>6</code>, <code>[1, 4]</code>, <code>[4, 5, 6]</code>, <code>[5, 7, 9]</code> (one per line)`,
      starterCode: `import numpy as np

matrix = np.array([[1, 2, 3],
                   [4, 5, 6]])

# TODO: print the element in row 1, column 2 (counting from 0)
# TODO: print the first column as a list
# TODO: print the values greater than 3 as a list
# TODO: print the column sums as a list`,
      hints: [
        'Index with a row and a column: <code>matrix[1, 2]</code>. A colon selects everything along a dimension: <code>matrix[:, 0]</code>.',
        '<code>matrix[matrix &gt; 3]</code> keeps the values where the condition is true, and <code>sum(axis=0)</code> adds down each column.',
      ],
      solution: `import numpy as np

matrix = np.array([[1, 2, 3],
                   [4, 5, 6]])

print(matrix[1, 2])
print(matrix[:, 0].tolist())
print(matrix[matrix > 3].tolist())
print(matrix.sum(axis=0).tolist())`,
    },
    quiz: [
      {
        question: 'For a two-dimensional array, what does <code>sum(axis=1)</code> compute?',
        options: ['One sum for each column', 'One sum for each row', 'The sum of everything', 'The sum of the diagonal'],
        answer: 1,
        explanation: 'axis=1 collapses the columns, leaving one value per row. axis=0 gives one value per column.',
      },
      {
        question: 'What does <code>a[a &gt; 0]</code> return?',
        options: ['True or False', 'The number of positive elements', 'An array of the elements of a that are greater than 0', 'The indexes of positive elements'],
        answer: 2,
        explanation: 'The comparison makes a boolean mask, and indexing with it keeps the matching elements.',
      },
      {
        question: 'A slice of a NumPy array is modified. What happens to the original array?',
        options: ['Nothing; a slice is a copy', 'It is deleted', 'An error is raised', 'It changes too; a slice is a view of the same data'],
        answer: 3,
        explanation: 'Use .copy() when an independent array is needed. This differs from Python lists.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is broadcasting?',
        answer: `Broadcasting is the set of rules that lets NumPy combine arrays of different shapes without copying data. A scalar is applied to every element, and an array with a dimension of size 1 is stretched to match the other array along that dimension, so a row of three values can be added to each row of a 2 × 3 matrix. Shapes are compared from the last dimension, and each pair must be equal or contain a 1.`,
      },
      {
        question: 'What is the difference between a view and a copy?',
        answer: `A view is a new array object that looks at the same underlying data; basic slicing and <code>reshape</code> usually return views, so changing the view changes the original. A copy has its own data; boolean and fancy indexing return copies, and <code>.copy()</code> makes one explicitly. Views save memory, but an unintended one is a common cause of data being changed by accident.`,
      },
    ],
  },

  'numpy-for-math-statistics-and-linear-algebra': {
    whyItMatters: `Statistics, simulations and linear algebra are the mathematics behind data analysis and machine learning. NumPy provides them as tested, fast functions, so that solving a system of equations or computing a correlation is one call. Handling missing values correctly is part of the same toolkit and matters in every real dataset.`,
    exercise: {
      prompt: `Solve the pair of equations 2x + y = 5 and x + 3y = 10 with <code>np.linalg.solve</code> and print the solution rounded to 6 decimals as a list. Then print the matrix multiplied by the vector [1, 1], and the mean of a list that contains a missing value, ignoring that value.

Expected output: <code>[1.0, 3.0]</code>, <code>[3, 4]</code>, <code>2.0</code> (one per line)`,
      starterCode: `import numpy as np

coefficients = np.array([[2, 1],
                         [1, 3]])
constants = np.array([5, 10])

# TODO: solve for x and y, round to 6 decimals and print as a list

# TODO: print coefficients multiplied by the vector [1, 1], as a list

readings = np.array([1.0, np.nan, 3.0])
# TODO: print the mean of readings, ignoring the missing value`,
      hints: [
        '<code>np.linalg.solve(a, b)</code> returns the solution, and <code>np.round(result, 6)</code> removes tiny floating-point errors.',
        'Matrix multiplication uses the <code>@</code> operator. <code>np.nanmean</code> skips <code>nan</code> values.',
      ],
      solution: `import numpy as np

coefficients = np.array([[2, 1],
                         [1, 3]])
constants = np.array([5, 10])

solution = np.linalg.solve(coefficients, constants)
print(np.round(solution, 6).tolist())

print((coefficients @ np.array([1, 1])).tolist())

readings = np.array([1.0, np.nan, 3.0])
print(np.nanmean(readings))`,
    },
    quiz: [
      {
        question: 'What does <code>np.mean(np.array([1.0, np.nan, 3.0]))</code> return?',
        options: ['nan', '2.0', '1.33', 'It raises an error'],
        answer: 0,
        explanation: 'Any calculation that includes nan gives nan. Use np.nanmean to ignore it.',
      },
      {
        question: 'For two-dimensional arrays, what does <code>A @ B</code> compute?',
        options: ['Element-by-element multiplication', 'The matrix product', 'The sum', 'The transpose'],
        answer: 1,
        explanation: 'A * B multiplies element by element.',
      },
      {
        question: 'Why create random numbers with <code>np.random.default_rng(42)</code>?',
        options: ['It is faster', 'It produces whole numbers only', 'The seed makes the results repeatable', 'It is required for arrays'],
        answer: 2,
        explanation: 'A fixed seed gives the same numbers on every run, which makes results reproducible.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is NaN and how do you deal with it in NumPy?',
        answer: `NaN, "not a number", is a special floating-point value used to mark missing or undefined data. It propagates through calculations, and it is not equal to anything, including itself, so it is detected with <code>np.isnan()</code> and not with <code>==</code>. Functions such as <code>np.nanmean</code> and <code>np.nansum</code> ignore it, or the values can be removed or replaced using a boolean mask.`,
      },
      {
        question: 'What is the difference between * and @ for arrays?',
        answer: `<code>*</code> multiplies corresponding elements, so both arrays must have the same shape or be broadcastable. <code>@</code> performs matrix multiplication: each row of the first is combined with each column of the second, and the number of columns of the first must equal the number of rows of the second. They give different results and are not interchangeable.`,
      },
    ],
  },

  'introduction-to-pandas': {
    whyItMatters: `pandas is the standard tool for working with table data in Python: spreadsheets, CSV exports, database query results. It reads a file in one line and gives you a DataFrame you can filter, summarise and join. Almost every data analyst and data scientist role lists it as a requirement.`,
    exercise: {
      prompt: `Read the CSV text into a DataFrame (the text stands in for a file here). Print the shape of the DataFrame, the list of column names, and the mean of the score column.

Expected output: <code>(3, 2)</code>, <code>['name', 'score']</code>, <code>80.0</code> (one per line)`,
      starterCode: `import io

import pandas as pd

text = "name,score\\nAsha,70\\nRavi,80\\nZoya,90\\n"

# TODO: read the text with pd.read_csv (wrap it in io.StringIO)
# TODO: print the shape
# TODO: print the column names as a list
# TODO: print the mean of the score column`,
      hints: [
        '<code>pd.read_csv(io.StringIO(text))</code> treats the string as a file.',
        'The columns are <code>df.columns.tolist()</code>, and one column is selected with <code>df["score"]</code>.',
      ],
      solution: `import io

import pandas as pd

text = "name,score\\nAsha,70\\nRavi,80\\nZoya,90\\n"

df = pd.read_csv(io.StringIO(text))
print(df.shape)
print(df.columns.tolist())
print(df["score"].mean())`,
    },
    quiz: [
      {
        question: 'What is a pandas <code>Series</code>?',
        options: ['A whole table', 'A chart', 'A file format', 'A single labelled column of values'],
        answer: 3,
        explanation: 'A DataFrame is a collection of Series that share an index.',
      },
      {
        question: 'Which method shows the first five rows of a DataFrame?',
        options: ['df.head()', 'df.first()', 'df.top()', 'df.show()'],
        answer: 0,
        explanation: 'df.tail() shows the last five.',
      },
      {
        question: 'Which method gives the column types and the number of non-missing values in each column?',
        options: ['df.describe()', 'df.info()', 'df.shape', 'df.columns'],
        answer: 1,
        explanation: 'describe() gives summary statistics for the numeric columns.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a Series and a DataFrame?',
        answer: `A <code>Series</code> is a one-dimensional array of values with an index of labels, like one column. A <code>DataFrame</code> is a two-dimensional table with labelled rows and columns, in which each column is a Series and columns may have different types. Selecting one column of a DataFrame gives a Series.`,
      },
      {
        question: 'What do you look at first when you load a new dataset?',
        answer: `<code>df.shape</code> for its size, <code>df.head()</code> for a sample of the rows, <code>df.info()</code> for the column types and missing values, and <code>df.describe()</code> for the range and distribution of the numeric columns. These show at once whether columns were read with the wrong type, where data is missing and whether any values look implausible.`,
      },
    ],
  },

  'selecting-and-filtering-data-with-pandas': {
    whyItMatters: `Analysis starts with choosing the right rows and columns: the customers from one city, the orders above an amount, the most recent records. pandas does this with boolean conditions and with <code>loc</code> and <code>iloc</code>. The difference between those two, label and position, is a standard interview question.`,
    exercise: {
      prompt: `From the DataFrame, print the names of the students who scored more than 75 (as a list), the name in the first row by position, and the name of the student with the highest score, found by sorting.

Expected output: <code>['Ravi', 'Zoya']</code>, <code>Asha</code>, <code>Zoya</code> (one per line)`,
      starterCode: `import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ravi", "Zoya"],
    "city": ["Pune", "Delhi", "Pune"],
    "score": [70, 82, 91],
})

# TODO: print the names where score > 75, as a list
# TODO: print the name in the first row, using iloc
# TODO: sort by score from high to low and print the first name`,
      hints: [
        '<code>df.loc[df["score"] &gt; 75, "name"]</code> selects rows by a condition and one column by label.',
        '<code>df.sort_values("score", ascending=False)</code> returns a sorted DataFrame; take <code>.iloc[0]["name"]</code>.',
      ],
      solution: `import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ravi", "Zoya"],
    "city": ["Pune", "Delhi", "Pune"],
    "score": [70, 82, 91],
})

print(df.loc[df["score"] > 75, "name"].tolist())
print(df.iloc[0]["name"])
print(df.sort_values("score", ascending=False).iloc[0]["name"])`,
    },
    quiz: [
      {
        question: 'What is the difference between <code>loc</code> and <code>iloc</code>?',
        options: ['There is none', 'loc selects by label; iloc selects by integer position', 'iloc selects by label', 'loc is for columns only'],
        answer: 1,
        explanation: 'With loc a slice includes its end label; with iloc the end position is excluded.',
      },
      {
        question: 'How are two conditions combined when filtering a DataFrame?',
        options: ['With and / or', 'With +', 'With a comma', 'With &amp; and |, each condition in parentheses'],
        answer: 3,
        explanation: 'Python\'s and / or do not work element by element on a Series.',
      },
      {
        question: 'How do you select the rows whose city is one of several values?',
        options: ['df[df["city"].isin(["Pune", "Delhi"])]', 'df["city"] in ["Pune", "Delhi"]', 'df.filter("Pune", "Delhi")', 'df["Pune", "Delhi"]'],
        answer: 0,
        explanation: 'isin returns a boolean Series that is then used as the filter.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Explain loc and iloc.',
        answer: `<code>loc</code> selects by label: row index labels and column names, and it also accepts a boolean condition for the rows, as in <code>df.loc[df.age &gt; 30, "name"]</code>. <code>iloc</code> selects by integer position, counting from zero, like a Python list, as in <code>df.iloc[0:5, 0:2]</code>. A label slice with <code>loc</code> includes its end; a position slice with <code>iloc</code> does not.`,
      },
      {
        question: 'Why is apply() with a Python function often slow, and what is the alternative?',
        answer: `<code>apply</code> calls the Python function once for each row or value, so it runs at the speed of a Python loop. Vectorised operations work on whole columns in compiled code: arithmetic on columns, the <code>.str</code> and <code>.dt</code> accessors, <code>np.where</code> and <code>pd.cut</code>. They are usually many times faster, so <code>apply</code> should be kept for logic that cannot be expressed that way.`,
      },
    ],
  },

  'cleaning-data-with-pandas': {
    whyItMatters: `Real data is messy: values are missing, rows are duplicated, names have stray spaces and inconsistent capitals. Analysts commonly say that most of their time goes on cleaning. Results computed from dirty data are simply wrong, so being able to clean a dataset methodically is one of the most valuable practical skills in data work.`,
    exercise: {
      prompt: `Clean the DataFrame in three steps: remove the surrounding spaces from the names and give them a capital first letter; drop the duplicate rows; and fill the missing age with the median of the remaining ages. Then print the number of rows, the names and the ages.

Expected output: <code>3</code>, <code>['Asha', 'Ravi', 'Zoya']</code>, <code>[25.0, 30.0, 27.5]</code> (one per line)`,
      starterCode: `import pandas as pd

df = pd.DataFrame({
    "name": [" asha ", "Ravi", "Ravi", "Zoya"],
    "age": [25, 30, 30, None],
})

# TODO: strip the names and convert them to title case
# TODO: drop duplicate rows
# TODO: fill the missing age with the median age

print(len(df))
print(df["name"].tolist())
print(df["age"].tolist())`,
      hints: [
        'String methods are reached through <code>.str</code>: <code>df["name"].str.strip().str.title()</code>.',
        '<code>df.drop_duplicates()</code> returns a new DataFrame, and <code>df["age"].fillna(df["age"].median())</code> a new column; assign both back.',
      ],
      solution: `import pandas as pd

df = pd.DataFrame({
    "name": [" asha ", "Ravi", "Ravi", "Zoya"],
    "age": [25, 30, 30, None],
})

df["name"] = df["name"].str.strip().str.title()
df = df.drop_duplicates()
df["age"] = df["age"].fillna(df["age"].median())

print(len(df))
print(df["name"].tolist())
print(df["age"].tolist())`,
    },
    quiz: [
      {
        question: 'Which call counts the missing values in each column?',
        options: ['df.count()', 'df.isna().sum()', 'df.missing()', 'df.null()'],
        answer: 1,
        explanation: 'isna() marks each missing cell as True, and sum() counts the Trues in each column.',
      },
      {
        question: 'What does <code>df.dropna()</code> do by default?',
        options: ['Removes columns with missing values', 'Fills missing values with 0', 'Removes every row that has at least one missing value', 'Removes duplicates'],
        answer: 2,
        explanation: 'This can discard a great deal of data, so check how many rows would be lost first.',
      },
      {
        question: 'A numeric column was read as text because one cell contains "N/A". How do you convert it?',
        options: ['df["col"].astype(str)', 'It cannot be converted', 'df["col"].round()', 'pd.to_numeric(df["col"], errors="coerce")'],
        answer: 3,
        explanation: 'errors="coerce" turns values that cannot be converted into NaN.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you handle missing values?',
        answer: `First find out how many there are and why they are missing. Then choose: drop the rows or columns if few are affected and they are not important; fill with a fixed value, the median or the mean for numeric data, or the most frequent value for categories; or fill from neighbouring rows in a time series. The choice depends on the meaning of the data, and whatever is done should be recorded, because it affects the results.`,
      },
      {
        question: 'How would you detect outliers in a numeric column?',
        answer: `A common rule uses the interquartile range. Compute the first and third quartiles, Q1 and Q3, and the IQR as Q3 − Q1; values below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR are flagged. A box plot shows the same thing visually. An outlier is not automatically an error: it should be investigated before deciding whether to correct it, remove it or keep it.`,
      },
    ],
  },

  'grouping-merging-and-pivoting-in-pandas': {
    whyItMatters: `"Total sales per region", "average salary by department" and "orders joined with their customers" are the questions analysis exists to answer. <code>groupby</code> and <code>merge</code> are the pandas equivalents of SQL's GROUP BY and JOIN, and they are the operations interviewers most often ask candidates to write.`,
    exercise: {
      prompt: `Print the total amount for each region as a dictionary. Then merge the sales with the table of managers and print the manager responsible for the largest single sale.

Expected output: <code>{'north': 420, 'south': 450}</code> then <code>Ravi</code>`,
      starterCode: `import pandas as pd

sales = pd.DataFrame({
    "region": ["north", "south", "north"],
    "amount": [120, 450, 300],
})
managers = pd.DataFrame({
    "region": ["north", "south"],
    "manager": ["Asha", "Ravi"],
})

# TODO: group by region, total the amount, and print the result as a dictionary

# TODO: merge sales with managers on region,
#       then print the manager of the row with the largest amount`,
      hints: [
        '<code>sales.groupby("region")["amount"].sum()</code> gives a Series; <code>to_dict()</code> converts it.',
        'After <code>sales.merge(managers, on="region")</code>, <code>merged["amount"].idxmax()</code> gives the index of the largest amount.',
      ],
      solution: `import pandas as pd

sales = pd.DataFrame({
    "region": ["north", "south", "north"],
    "amount": [120, 450, 300],
})
managers = pd.DataFrame({
    "region": ["north", "south"],
    "manager": ["Asha", "Ravi"],
})

print(sales.groupby("region")["amount"].sum().to_dict())

merged = sales.merge(managers, on="region")
print(merged.loc[merged["amount"].idxmax(), "manager"])`,
    },
    quiz: [
      {
        question: 'Which three steps does <code>groupby</code> perform?',
        options: ['Split the rows into groups, apply a function to each, combine the results', 'Sort, filter, merge', 'Read, clean, write', 'Join, pivot, plot'],
        answer: 0,
        explanation: 'This is known as split-apply-combine.',
      },
      {
        question: 'What kind of join does <code>merge</code> perform by default?',
        options: ['Left', 'Inner', 'Outer', 'Cross'],
        answer: 1,
        explanation: 'Only rows whose key appears in both tables are kept. Use how="left" to keep every row of the left table.',
      },
      {
        question: 'What is the difference between <code>merge</code> and <code>concat</code>?',
        options: ['There is none', 'merge only works on Series', 'concat joins on keys', 'merge joins tables on matching key values; concat stacks tables on top of or beside each other'],
        answer: 3,
        explanation: 'concat is used to combine files that have the same columns.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the types of join available in merge?',
        answer: `<code>inner</code> keeps only the rows whose key is in both tables. <code>left</code> keeps every row of the left table, with missing values where the right has no match, and <code>right</code> does the reverse. <code>outer</code> keeps all rows from both. The type is chosen with the <code>how</code> argument, and the key with <code>on</code>, or with <code>left_on</code> and <code>right_on</code> when the column names differ.`,
      },
      {
        question: 'What is the difference between agg and transform after a groupby?',
        answer: `<code>agg</code> reduces each group to one row, so the result has one row per group; it is used for summaries such as totals and averages. <code>transform</code> returns a result with the same number of rows as the original, with each row receiving the value computed for its group; it is used to add a column such as each row's share of its group total.`,
      },
    ],
  },

  'data-visualization-with-matplotlib': {
    whyItMatters: `A chart shows in a second what a table of numbers hides: a trend, an outlier, a difference between groups. Matplotlib is the base plotting library of Python, and pandas and seaborn draw their charts through it. Presenting findings clearly is a core part of any data role, and a misleading chart is worse than none.`,
    exercise: {
      prompt: `Draw a bar chart of the sales figures, with a title and axis labels, and save it to memory as a PNG. To confirm the chart is set up correctly without looking at it, print the number of bars, the title and the label of the x-axis.

Expected output: <code>3</code>, <code>Sales by item</code>, <code>Item</code> (one per line)`,
      starterCode: `import io

import matplotlib

matplotlib.use("Agg")  # draw without opening a window
import matplotlib.pyplot as plt

items = ["pen", "bag", "book"]
amounts = [120, 450, 300]

fig, ax = plt.subplots()

# TODO: draw the bars, keeping the object that ax.bar returns
# TODO: set the title "Sales by item", the x label "Item" and the y label "Amount"
# TODO: save the figure to an io.BytesIO buffer in PNG format

# TODO: print the number of bars, the title and the x label`,
      hints: [
        'The methods are <code>ax.bar</code>, <code>ax.set_title</code>, <code>ax.set_xlabel</code> and <code>ax.set_ylabel</code>.',
        '<code>fig.savefig(buffer, format="png")</code> writes the image. The values are read back with <code>ax.get_title()</code> and <code>ax.get_xlabel()</code>.',
      ],
      solution: `import io

import matplotlib

matplotlib.use("Agg")  # draw without opening a window
import matplotlib.pyplot as plt

items = ["pen", "bag", "book"]
amounts = [120, 450, 300]

fig, ax = plt.subplots()

bars = ax.bar(items, amounts)
ax.set_title("Sales by item")
ax.set_xlabel("Item")
ax.set_ylabel("Amount")

buffer = io.BytesIO()
fig.savefig(buffer, format="png")

print(len(bars))
print(ax.get_title())
print(ax.get_xlabel())`,
    },
    quiz: [
      {
        question: 'Which chart best shows how a value changes over time?',
        options: ['Pie chart', 'Scatter plot', 'Histogram', 'Line chart'],
        answer: 3,
        explanation: 'A line connects the points in order and makes the trend visible.',
      },
      {
        question: 'Which chart shows the distribution of one numeric variable?',
        options: ['Histogram', 'Line chart', 'Pie chart', 'Bar chart of categories'],
        answer: 0,
        explanation: 'It groups the values into ranges and shows how many fall in each.',
      },
      {
        question: 'In <code>fig, ax = plt.subplots()</code>, what is <code>ax</code>?',
        options: ['The whole window', 'One plotting area, with its own axes, title and data', 'The data', 'The colour scheme'],
        answer: 1,
        explanation: 'A figure can contain several axes, arranged in a grid.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a Figure and an Axes in Matplotlib?',
        answer: `The <code>Figure</code> is the whole image or window. An <code>Axes</code> is a single plot inside it, with its own x and y axes, title, labels and plotted data. One figure can hold many axes, created with <code>plt.subplots(rows, columns)</code>. Calling methods on the axes object, the object-oriented style, is clearer than the <code>plt.</code> functions when there is more than one plot.`,
      },
      {
        question: 'How do you choose the right chart for your data?',
        answer: `By the question being asked. A line chart for change over time; a bar chart for comparing categories; a histogram or box plot for the distribution of one variable; a scatter plot for the relationship between two numeric variables. Pie charts are suitable only for a few parts of one whole. Every chart needs a title, labelled axes with units, and an honest scale.`,
      },
    ],
  },

  'exploratory-data-analysis-project': {
    whyItMatters: `This lesson joins the previous ones into the workflow used on every real dataset: load, inspect, clean, derive new columns, answer questions, present the findings. An exploratory analysis of a dataset you chose yourself is also the most common first project in a data portfolio, and a good one is something concrete to show an employer.`,
    exercise: {
      prompt: `Answer three business questions about the orders: the total revenue, the city with the highest total revenue, and the number of the month with the highest total revenue. Convert the date column to real dates first.

Expected output: <code>750</code>, <code>Delhi</code>, <code>2</code> (one per line)`,
      starterCode: `import pandas as pd

orders = pd.DataFrame({
    "city": ["Delhi", "Pune", "Delhi", "Pune"],
    "amount": [200, 150, 300, 100],
    "date": ["2026-01-05", "2026-01-20", "2026-02-11", "2026-02-15"],
})

# TODO: convert the date column with pd.to_datetime and add a "month" column

# TODO: print the total revenue
# TODO: print the city with the highest total revenue
# TODO: print the month number with the highest total revenue`,
      hints: [
        'After conversion, the month is <code>orders["date"].dt.month</code>.',
        '<code>groupby(...)["amount"].sum().idxmax()</code> returns the label of the group with the largest total.',
      ],
      solution: `import pandas as pd

orders = pd.DataFrame({
    "city": ["Delhi", "Pune", "Delhi", "Pune"],
    "amount": [200, 150, 300, 100],
    "date": ["2026-01-05", "2026-01-20", "2026-02-11", "2026-02-15"],
})

orders["date"] = pd.to_datetime(orders["date"])
orders["month"] = orders["date"].dt.month

print(orders["amount"].sum())
print(orders.groupby("city")["amount"].sum().idxmax())
print(int(orders.groupby("month")["amount"].sum().idxmax()))`,
    },
    quiz: [
      {
        question: 'What is the purpose of exploratory data analysis?',
        options: ['To train a model', 'To build a dashboard', 'To understand the data, find problems in it and form questions before any modelling', 'To delete outliers'],
        answer: 2,
        explanation: 'It reveals what the data contains and whether it can answer the question at hand.',
      },
      {
        question: 'Which step should come before calculating summary figures?',
        options: ['Publishing the results', 'Training a model', 'Drawing a pie chart', 'Checking and cleaning the data'],
        answer: 3,
        explanation: 'Duplicates, missing values and wrong types distort every figure computed afterwards.',
      },
      {
        question: 'Why convert a column of date strings with <code>pd.to_datetime</code>?',
        options: ['So that pandas can extract months and weekdays, sort correctly and resample by period', 'To make the file smaller', 'It is required for printing', 'To remove missing values'],
        answer: 0,
        explanation: 'As plain text, dates can only be compared as strings.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Describe the steps of an exploratory data analysis.',
        answer: `Understand the question and what each column means. Load the data and inspect its size, types and a sample of rows. Check quality: missing values, duplicates, impossible values and outliers, and clean them. Look at each variable separately, then at relationships between variables with grouping, correlation and charts. Derive new columns where useful. Finally, summarise the findings with supporting charts and state the limitations of the data.`,
      },
      {
        question: 'How would you present the findings of an analysis to a non-technical audience?',
        answer: `Lead with the conclusions and what they mean for the decision, not with the method. Use a few clear charts, each making one point, with plain titles and labelled axes. Give numbers in context, such as a change compared with last year, and be open about uncertainty and about what the data cannot show. Keep the code and the detailed tables for an appendix.`,
      },
    ],
  },

  'introduction-to-machine-learning': {
    whyItMatters: `Machine learning is how software makes predictions from examples: which emails are spam, what a house is worth, which customers may leave. Understanding the basic workflow of features, a target, training and testing lets you judge when it is the right tool and read what the rest of the field is talking about.`,
    exercise: {
      prompt: `Using scikit-learn, which must be installed with <code>pip install scikit-learn</code>, train a linear regression model on hours studied and marks obtained, and predict the marks for 5 hours of study. The data lies exactly on a straight line, so the prediction is exact.

Expected output: <code>100.0</code>`,
      starterCode: `from sklearn.linear_model import LinearRegression

hours = [[1], [2], [3], [4]]   # features: one column
marks = [20, 40, 60, 80]       # target

# TODO: create the model and fit it to the data
# TODO: predict the marks for 5 hours and print the value rounded to 1 decimal`,
      hints: [
        'Training is <code>model.fit(hours, marks)</code>.',
        '<code>model.predict([[5]])</code> returns an array with one value; take element 0 and round it.',
      ],
      solution: `from sklearn.linear_model import LinearRegression

hours = [[1], [2], [3], [4]]   # features: one column
marks = [20, 40, 60, 80]       # target

model = LinearRegression()
model.fit(hours, marks)

prediction = model.predict([[5]])
print(round(float(prediction[0]), 1))`,
    },
    quiz: [
      {
        question: 'In supervised learning, what does the training data contain?',
        options: ['Only inputs', 'Inputs together with the correct outputs', 'Only outputs', 'Random numbers'],
        answer: 1,
        explanation: 'The model learns the relationship between features and the known target.',
      },
      {
        question: 'Why is data split into a training set and a test set?',
        options: ['To make training faster', 'To remove outliers', 'To measure how the model performs on data it has not seen', 'Because scikit-learn requires it'],
        answer: 2,
        explanation: 'A score on the training data says nothing about performance on new data.',
      },
      {
        question: 'A model scores 100% on the training data and 60% on the test data. What is this called?',
        options: ['Underfitting', 'Clustering', 'Regularisation', 'Overfitting'],
        answer: 3,
        explanation: 'The model has memorised the training examples and does not generalise.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between supervised and unsupervised learning?',
        answer: `In supervised learning the training data includes the correct answer for each example, and the model learns to predict it: a number in regression, a category in classification. In unsupervised learning there are no answers; the algorithm finds structure in the data itself, such as groups of similar items in clustering or a simpler representation in dimensionality reduction.`,
      },
      {
        question: 'What are overfitting and underfitting?',
        answer: `An overfitted model is too complex for the data: it learns the noise in the training set and performs well there but badly on new data. An underfitted model is too simple to capture the pattern and performs badly on both. Overfitting is reduced with more data, a simpler model, regularisation or cross-validation; underfitting with a more capable model or better features.`,
      },
    ],
  },

  'linear-regression-with-scikit-learn': {
    whyItMatters: `Linear regression is the starting point for predicting a number: a price, a demand, a delivery time. It is fast, and its coefficients can be explained to a manager, which is why it is still used widely. It is also the baseline against which any more complicated model has to prove itself.`,
    exercise: {
      prompt: `Fit a linear regression to data generated by the rule y = 3x + 5. Print the coefficient and the intercept the model has learned, rounded to 2 decimals, and then the R² score of the model on the same data.

Expected output: <code>3.0 5.0</code> then <code>1.0</code>`,
      starterCode: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

x = [[0], [1], [2], [3]]
y = [5, 8, 11, 14]

# TODO: fit the model
# TODO: print the coefficient and the intercept, rounded to 2 decimals, on one line
# TODO: print the R² score of the predictions for x, rounded to 2 decimals`,
      hints: [
        'After fitting, the slope is <code>model.coef_[0]</code> and the constant is <code>model.intercept_</code>.',
        '<code>r2_score(y, model.predict(x))</code> compares the true values with the predictions.',
      ],
      solution: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

x = [[0], [1], [2], [3]]
y = [5, 8, 11, 14]

model = LinearRegression()
model.fit(x, y)

print(round(float(model.coef_[0]), 2), round(float(model.intercept_), 2))
print(round(float(r2_score(y, model.predict(x))), 2))`,
    },
    quiz: [
      {
        question: 'What does an R² score of 1.0 mean?',
        options: ['The model explains all the variation in the target', 'The model is useless', 'The model is overfitted by definition', 'There is one feature'],
        answer: 0,
        explanation: 'A score of 0 means the model does no better than always predicting the mean.',
      },
      {
        question: 'In which units is RMSE expressed?',
        options: ['It has no units', 'The same units as the target', 'Percent', 'The square of the target\'s units'],
        answer: 1,
        explanation: 'This makes it easy to interpret: an RMSE of 5,000 on house prices is an error of about 5,000.',
      },
      {
        question: 'What does a coefficient of a linear regression tell you?',
        options: ['The accuracy of the model', 'The number of rows', 'How much the prediction changes when that feature increases by one unit, the others staying fixed', 'The intercept'],
        answer: 2,
        explanation: 'This interpretability is one of the main strengths of linear models.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Which metrics are used to evaluate a regression model?',
        answer: `Mean absolute error, MAE, is the average size of the errors. Mean squared error, MSE, averages the squared errors, which penalises large mistakes more heavily; its square root, RMSE, is in the units of the target. R² is the share of the variation in the target that the model explains, with 1 being perfect. MAE and RMSE say how far off the predictions are; R² says how much better the model is than predicting the average.`,
      },
      {
        question: 'What are the assumptions and limits of linear regression?',
        answer: `It assumes that the target is roughly a straight-line combination of the features, that the errors are independent and of similar size across the range, and that the features are not strongly correlated with one another. It is sensitive to outliers and cannot capture curved relationships unless features such as squared terms are added. When these assumptions fail, tree-based models are a common alternative.`,
      },
    ],
  },

  'classification-with-scikit-learn': {
    whyItMatters: `Is this transaction fraudulent, will this customer cancel, which category does this document belong to? Predicting a category is the most common machine-learning task in business. Knowing how to judge a classifier properly matters as much as training it, because accuracy alone can be badly misleading.`,
    exercise: {
      prompt: `Train a k-nearest-neighbours classifier with 3 neighbours on the data, in which class 0 has small values and class 1 has large ones. Print the predicted classes for 2.5 and 10.5 as a list, and then the confusion matrix for the training data as a list of lists.

Expected output: <code>[0, 1]</code> then <code>[[3, 0], [0, 3]]</code>`,
      starterCode: `from sklearn.metrics import confusion_matrix
from sklearn.neighbors import KNeighborsClassifier

x = [[1], [2], [3], [10], [11], [12]]
y = [0, 0, 0, 1, 1, 1]

# TODO: create a KNeighborsClassifier with 3 neighbours and fit it
# TODO: print the predictions for [[2.5], [10.5]] as a list
# TODO: print the confusion matrix of y against the predictions for x, as a list`,
      hints: [
        'The number of neighbours is set with <code>KNeighborsClassifier(n_neighbors=3)</code>.',
        '<code>predict</code> and <code>confusion_matrix</code> return arrays; <code>tolist()</code> converts them.',
      ],
      solution: `from sklearn.metrics import confusion_matrix
from sklearn.neighbors import KNeighborsClassifier

x = [[1], [2], [3], [10], [11], [12]]
y = [0, 0, 0, 1, 1, 1]

model = KNeighborsClassifier(n_neighbors=3)
model.fit(x, y)

print(model.predict([[2.5], [10.5]]).tolist())
print(confusion_matrix(y, model.predict(x)).tolist())`,
    },
    quiz: [
      {
        question: 'Of 1,000 transactions, 10 are fraudulent. A model that predicts "not fraud" every time has what accuracy?',
        options: ['10%', '50%', '0%', '99%'],
        answer: 3,
        explanation: 'It is 99% accurate and finds no fraud at all, which is why accuracy is misleading for unbalanced classes.',
      },
      {
        question: 'What does recall measure?',
        options: ['Of the actual positives, how many the model found', 'Of the predicted positives, how many are correct', 'The share of all predictions that are correct', 'The training time'],
        answer: 0,
        explanation: 'Precision is the share of predicted positives that are correct. Recall matters when missing a positive is costly.',
      },
      {
        question: 'What does a confusion matrix show?',
        options: ['The features used', 'The counts of correct and incorrect predictions for each class', 'The training loss', 'The correlation between features'],
        answer: 1,
        explanation: 'It separates true positives, false positives, true negatives and false negatives.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between precision and recall?',
        answer: `Precision is the proportion of positive predictions that are correct: of the emails marked as spam, how many really are spam. Recall is the proportion of actual positives that were found: of all the spam, how much was caught. Raising one usually lowers the other. Precision matters most when a false alarm is costly; recall when a miss is costly, as in disease screening. The F1 score combines the two.`,
      },
      {
        question: 'How do you deal with an imbalanced dataset?',
        answer: `Stop relying on accuracy and use precision, recall, F1 or the area under the ROC curve. Keep the class proportions the same in the train and test sets with a stratified split. Then consider giving the rare class more weight in the model, oversampling it or undersampling the common class within the training data only, and adjusting the decision threshold to suit the cost of each kind of error.`,
      },
    ],
  },

  'data-preprocessing-and-pipelines': {
    whyItMatters: `Models need numbers on comparable scales with no gaps, and real data has text categories, missing values and columns that differ by orders of magnitude. Preprocessing fixes this, and a pipeline makes sure the same steps are applied in training and in prediction. Getting this wrong causes data leakage, the most common reason a model that looked excellent fails in production.`,
    exercise: {
      prompt: `Standardise the three values with <code>StandardScaler</code> and print them rounded to 2 decimals. One-hot encode the three colours and print the result. Then build a pipeline of a scaler and a 1-nearest-neighbour classifier, fit it, and print its predictions for 2 and 11.

Expected output: <code>[-1.22, 0.0, 1.22]</code>, <code>[[0.0, 1.0], [1.0, 0.0], [0.0, 1.0]]</code>, <code>[0, 1]</code> (one per line)`,
      starterCode: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

values = [[1.0], [2.0], [3.0]]
# TODO: scale the values and print them as a flat list rounded to 2 decimals

colours = [["red"], ["blue"], ["red"]]
# TODO: one-hot encode the colours (dense output) and print the result as a list

x = [[1], [2], [3], [10], [11], [12]]
y = [0, 0, 0, 1, 1, 1]
# TODO: make a pipeline of StandardScaler and KNeighborsClassifier(n_neighbors=1),
#       fit it and print the predictions for [[2], [11]] as a list`,
      hints: [
        '<code>fit_transform</code> learns the parameters and applies them. <code>ravel()</code> flattens a two-dimensional array.',
        'Pass <code>sparse_output=False</code> to <code>OneHotEncoder</code> to get an ordinary array. Categories are ordered alphabetically, so blue comes first.',
      ],
      solution: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

values = [[1.0], [2.0], [3.0]]
scaled = StandardScaler().fit_transform(values)
print([round(float(value), 2) for value in scaled.ravel()])

colours = [["red"], ["blue"], ["red"]]
encoded = OneHotEncoder(sparse_output=False).fit_transform(colours)
print(encoded.tolist())

x = [[1], [2], [3], [10], [11], [12]]
y = [0, 0, 0, 1, 1, 1]
pipeline = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=1))
pipeline.fit(x, y)
print(pipeline.predict([[2], [11]]).tolist())`,
    },
    quiz: [
      {
        question: 'What does <code>StandardScaler</code> do to a feature?',
        options: ['Scales it to between 0 and 1', 'Removes outliers', 'Rescales it to a mean of 0 and a standard deviation of 1', 'Converts it to text'],
        answer: 2,
        explanation: 'MinMaxScaler is the one that scales to a fixed range such as 0 to 1.',
      },
      {
        question: 'Why is one-hot encoding used for a category such as colour?',
        options: ['To save memory', 'To sort the data', 'To remove rare values', 'To turn categories into numbers without implying an order between them'],
        answer: 3,
        explanation: 'Coding red, green and blue as 1, 2 and 3 would suggest that blue is greater than red.',
      },
      {
        question: 'On which data should a scaler be fitted?',
        options: ['The training set only', 'The whole dataset', 'The test set only', 'It does not matter'],
        answer: 0,
        explanation: 'Fitting on all the data lets information from the test set leak into training.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is data leakage?',
        answer: `Leakage is when information that would not be available at prediction time is used in training, so the model's measured performance is better than it will be in real use. Common causes are fitting a scaler or imputer on the whole dataset before splitting, including a feature that is derived from the target, and letting future data into a time-based model. Splitting first and putting preprocessing inside a pipeline prevents the first kind.`,
      },
      {
        question: 'Why use a scikit-learn Pipeline?',
        answer: `A pipeline chains the preprocessing steps and the model into one object with a single <code>fit</code> and <code>predict</code>. The transformers are fitted only on the data passed to <code>fit</code>, so cross-validation and grid search apply them correctly within each fold and nothing leaks. The same steps are applied identically at prediction time, and the whole thing can be saved and deployed as one file.`,
      },
    ],
  },

  'model-evaluation-and-hyperparameter-tuning': {
    whyItMatters: `A single train-test split can make a model look better or worse than it is, purely by chance. Cross-validation gives a more reliable estimate, and a systematic search finds good settings for a model without guesswork. These are the techniques that separate a result you can trust from one that was simply lucky.`,
    exercise: {
      prompt: `Using the cleanly separated data below, print the mean accuracy of a 1-nearest-neighbour classifier under 3-fold cross-validation. Then use <code>GridSearchCV</code> to choose between 1 and 3 neighbours, and print the best parameters it finds.

Expected output: <code>1.0</code> then <code>{'n_neighbors': 1}</code>`,
      starterCode: `from sklearn.model_selection import GridSearchCV, cross_val_score
from sklearn.neighbors import KNeighborsClassifier

x = [[1], [2], [3], [4], [5], [6], [10], [11], [12], [13], [14], [15]]
y = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

# TODO: run 3-fold cross-validation for KNeighborsClassifier(n_neighbors=1)
#       and print the mean of the scores

# TODO: grid search over n_neighbors 1 and 3 with cv=3, fit it,
#       and print the best parameters`,
      hints: [
        '<code>cross_val_score(model, x, y, cv=3)</code> returns one score per fold.',
        'The grid is a dictionary: <code>{"n_neighbors": [1, 3]}</code>. After <code>fit</code>, read <code>search.best_params_</code>. When settings tie, the first one tried is kept.',
      ],
      solution: `from sklearn.model_selection import GridSearchCV, cross_val_score
from sklearn.neighbors import KNeighborsClassifier

x = [[1], [2], [3], [4], [5], [6], [10], [11], [12], [13], [14], [15]]
y = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

scores = cross_val_score(KNeighborsClassifier(n_neighbors=1), x, y, cv=3)
print(float(scores.mean()))

search = GridSearchCV(KNeighborsClassifier(), {"n_neighbors": [1, 3]}, cv=3)
search.fit(x, y)
print(search.best_params_)`,
    },
    quiz: [
      {
        question: 'In 5-fold cross-validation, how many times is the model trained?',
        options: ['Once', 'Five times', 'Ten times', 'Twenty-five times'],
        answer: 1,
        explanation: 'Each fold is used once for validation while the other four are used for training.',
      },
      {
        question: 'What is a hyperparameter?',
        options: ['A value the model learns from the data', 'The target column', 'A setting chosen before training, such as the number of neighbours or the depth of a tree', 'A kind of metric'],
        answer: 2,
        explanation: 'Coefficients and weights are parameters learned in training; hyperparameters control how that learning happens.',
      },
      {
        question: 'After choosing hyperparameters with cross-validation, on what should the final performance be reported?',
        options: ['The training set', 'The validation folds', 'A test set that was never used during tuning', 'Any of the above'],
        answer: 2,
        explanation: 'The tuning has adapted to the validation data, so only untouched data gives an honest estimate.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is cross-validation and why is it used?',
        answer: `The data is divided into k parts. The model is trained k times, each time on k − 1 parts and validated on the remaining one, and the scores are averaged. Every example is used for validation exactly once, so the estimate depends far less on how one particular split happened to fall, and the spread of the scores shows how stable the model is. It costs k times the training time.`,
      },
      {
        question: 'What is the difference between grid search and randomised search?',
        answer: `Grid search tries every combination of the listed hyperparameter values, which is thorough but grows very quickly as more parameters are added. Randomised search tries a fixed number of combinations drawn at random from given ranges; it covers a large space at a set cost and often finds settings that are as good, because usually only a few parameters matter. Both evaluate each candidate with cross-validation.`,
      },
    ],
  },

  'clustering-with-k-means': {
    whyItMatters: `Often there are no labels at all: nobody has marked which customers are similar. Clustering finds the groups in the data itself, and customer segmentation with k-means is one of the most widely used analyses in marketing. It is also the standard introduction to unsupervised learning.`,
    exercise: {
      prompt: `Run k-means with 2 clusters on the six points. Cluster numbers are arbitrary, so check the grouping without relying on them: print whether the first three points share a label, whether the last three share a label, and whether the two groups have different labels. Then print the cluster centres, rounded to 2 decimals and sorted.

Expected output: <code>True True True</code> then <code>[[1.33, 1.33], [10.33, 10.33]]</code>`,
      starterCode: `from sklearn.cluster import KMeans

points = [[1, 1], [1, 2], [2, 1], [10, 10], [10, 11], [11, 10]]

# TODO: fit KMeans with n_clusters=2, n_init=10 and random_state=0
# TODO: print the three checks on the labels, on one line
# TODO: print the centres, rounded to 2 decimals, as a sorted list`,
      hints: [
        'After fitting, the labels are in <code>model.labels_</code> and the centres in <code>model.cluster_centers_</code>.',
        '<code>len(set(labels[:3])) == 1</code> is true when the first three labels are all the same.',
      ],
      solution: `from sklearn.cluster import KMeans

points = [[1, 1], [1, 2], [2, 1], [10, 10], [10, 11], [11, 10]]

model = KMeans(n_clusters=2, n_init=10, random_state=0)
model.fit(points)

labels = model.labels_.tolist()
print(len(set(labels[:3])) == 1, len(set(labels[3:])) == 1, labels[0] != labels[3])

print(sorted(model.cluster_centers_.round(2).tolist()))`,
    },
    quiz: [
      {
        question: 'Does k-means need labelled data?',
        options: ['No; it is an unsupervised algorithm', 'Yes', 'Only for the first cluster', 'Only for the test set'],
        answer: 0,
        explanation: 'It groups points by distance, with no target column.',
      },
      {
        question: 'What must be chosen before k-means is run?',
        options: ['The labels', 'The number of clusters, k', 'The test size', 'The learning rate'],
        answer: 1,
        explanation: 'The elbow method and the silhouette score help to choose it.',
      },
      {
        question: 'Why should features be scaled before k-means?',
        options: ['To speed up printing', 'It requires integers', 'It uses distances, so a feature with large values would dominate the result', 'To remove duplicates'],
        answer: 2,
        explanation: 'Income in thousands would otherwise outweigh age in years.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How does the k-means algorithm work?',
        answer: `It starts with k initial centres. It then repeats two steps: assign every point to its nearest centre, and move each centre to the mean of the points assigned to it. This continues until the assignments stop changing. The result depends on the starting centres, so the algorithm is run several times with different starts and the best result, the one with the smallest total distance from points to their centres, is kept.`,
      },
      {
        question: 'How do you choose the number of clusters?',
        answer: `With the elbow method, k-means is run for a range of k and the within-cluster sum of squares is plotted; the point where the curve stops falling steeply suggests a value. The silhouette score measures how well each point fits its own cluster compared with the nearest other one, and the k with the highest average is preferred. The choice should also make sense for how the clusters will be used.`,
      },
    ],
  },

  'saving-and-deploying-ml-models': {
    whyItMatters: `A model in a notebook helps nobody. To be useful it has to be saved, loaded by an application and asked for predictions, usually through an API. This last step is where many projects stall, so being able to take a model from training to a working service makes you far more useful to a team.`,
    exercise: {
      prompt: `Train a linear regression model, save it to a file with <code>joblib</code>, load it back, and print whether the loaded model gives the same prediction as the original, followed by that prediction. A temporary folder is used so that nothing is left behind.

Expected output: <code>True</code> then <code>100.0</code>`,
      starterCode: `import tempfile
from pathlib import Path

import joblib
from sklearn.linear_model import LinearRegression

model = LinearRegression().fit([[1], [2], [3], [4]], [20, 40, 60, 80])

with tempfile.TemporaryDirectory() as folder:
    path = Path(folder) / "model.joblib"

    # TODO: save the model to path
    # TODO: load it back into a new variable

    # TODO: print whether both models predict the same value for [[5]]
    # TODO: print the loaded model's prediction, rounded to 1 decimal
    pass`,
      hints: [
        'The two functions are <code>joblib.dump(model, path)</code> and <code>joblib.load(path)</code>.',
        'Compare the first element of each prediction array, and round the value before printing it.',
      ],
      solution: `import tempfile
from pathlib import Path

import joblib
from sklearn.linear_model import LinearRegression

model = LinearRegression().fit([[1], [2], [3], [4]], [20, 40, 60, 80])

with tempfile.TemporaryDirectory() as folder:
    path = Path(folder) / "model.joblib"

    joblib.dump(model, path)
    loaded = joblib.load(path)

    original_prediction = model.predict([[5]])[0]
    loaded_prediction = loaded.predict([[5]])[0]
    print(bool(original_prediction == loaded_prediction))
    print(round(float(loaded_prediction), 1))`,
    },
    quiz: [
      {
        question: 'Which library is commonly used to save a scikit-learn model to a file?',
        options: ['json', 'sqlite3', 'csv', 'joblib'],
        answer: 3,
        explanation: 'It stores models containing large NumPy arrays efficiently.',
      },
      {
        question: 'Why should the whole pipeline be saved, and not only the model?',
        options: ['So that the same preprocessing is applied to new data at prediction time', 'To make the file larger', 'Because the model cannot be saved alone', 'To hide the code'],
        answer: 0,
        explanation: 'A model given unscaled or unencoded input produces wrong predictions.',
      },
      {
        question: 'Why should a model file from an untrusted source never be loaded?',
        options: ['It may be too large', 'Loading uses pickle, which can execute arbitrary code', 'It may be out of date', 'It will overwrite your model'],
        answer: 1,
        explanation: 'Only load model files that you or your team created.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you deploy a machine-learning model?',
        answer: `Train and save the full pipeline as a file. Build a small web service, for example with FastAPI, that loads the file once at start-up and exposes a prediction endpoint, validating the input with a schema. Package the service and its exact library versions in a container and run it like any other API. In production, log the inputs and predictions so that the model's behaviour can be monitored.`,
      },
      {
        question: 'What can go wrong with a model after it has been deployed?',
        answer: `The data it receives can drift away from the data it was trained on, as behaviour, prices or products change, so its accuracy declines without any error being raised. The library versions may differ from those used in training and make the saved file unloadable or subtly different. Inputs may arrive in an unexpected form. Monitoring the predictions, retraining on recent data and pinning versions address these.`,
      },
    ],
  },
}
