// Python course — data analysis part 2: pandas selection, cleaning, grouping and
// merging, matplotlib visualisation, and an exploratory data analysis project.
// Keys are slugs matching topics in codelabDefaults.js.
export const pythonDataB = {
  'selecting-and-filtering-data-with-pandas': {
    title: 'Selecting, Filtering and Transforming Data with pandas',
    intro: `Most analysis questions start with "show me the rows where…" or "add a column that…". This lesson covers selecting columns, selecting rows by label with <code>loc</code> and by position with <code>iloc</code>, filtering with boolean conditions and <code>query()</code>, sorting, creating and modifying columns with vectorised expressions, <code>apply</code>/<code>map</code>, and the <code>.str</code> and <code>.dt</code> accessors for text and dates.`,
    sections: [
      {
        heading: 'loc and iloc',
        body: `<code>df.loc[rows, columns]</code> selects by <strong>label</strong> (index values and column names; slices include the end), and <code>df.iloc[rows, columns]</code> selects by <strong>position</strong> (0-based; slices exclude the end, like lists). Both accept single labels, lists, slices and boolean masks: <code>df.loc[df["price"] &gt; 500, ["product", "price"]]</code>. <code>set_index("column")</code> turns a column into the row labels and <code>reset_index()</code> turns it back.`,
      },
      {
        heading: 'Filtering and Sorting',
        body: `A condition on a column gives a boolean Series; use it to filter rows: <code>df[df["city"] == "Pune"]</code>. Combine with <code>&amp;</code>, <code>|</code> and <code>~</code>, wrapping each condition in parentheses. Helpers include <code>isin([...])</code>, <code>between(a, b)</code>, <code>str.contains()</code> and <code>isna()</code>. <code>df.query("price &gt; 500 and city == 'Pune'")</code> is a readable alternative. Sort with <code>sort_values("col", ascending=False)</code> (several columns allowed), and pick extremes with <code>nlargest</code>/<code>nsmallest</code>.`,
      },
      {
        heading: 'New Columns and Transformations',
        body: `Create columns with vectorised arithmetic (<code>df["revenue"] = df["quantity"] * df["unit_price"]</code>) or <code>assign()</code> for method chains. <code>np.where</code> and <code>pd.cut</code> create categories from numbers; <code>Series.map(dict)</code> translates values; <code>apply(func)</code> runs a Python function per element or row — flexible but slower, so prefer vectorised operations. <code>.str</code> offers string methods (<code>lower</code>, <code>strip</code>, <code>contains</code>, <code>split</code>) and <code>.dt</code> offers date parts (<code>year</code>, <code>month</code>, <code>day_name()</code>). With Copy-on-Write (the default in pandas 3) a filtered DataFrame never changes the original; assign with <code>df.loc[mask, "col"] = value</code> rather than chained indexing like <code>df[mask]["col"] = value</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Selecting columns and rows with [], loc and iloc',
        code: `import pandas as pd

df = pd.DataFrame({
    "product": ["Pen", "Notebook", "Backpack", "Mouse", "Lamp"],
    "category": ["stationery", "stationery", "bags", "electronics", "home"],
    "price": [20, 60, 1250, 699, 899],
    "stock": [500, 120, 8, 35, 0],
})
print(df["price"].tolist())
print(df[["product", "stock"]].head(2))

print(df.iloc[0])                          # first row as a Series
print(df.iloc[1:3, [0, 2]])                # rows 1-2, columns 0 and 2 (by position)

items = df.set_index("product")
print(items.loc["Mouse", "price"])         # by label
print(items.loc["Notebook":"Mouse", ["price", "stock"]])   # label slices include the end
print(items.loc[items["stock"] == 0].index.tolist())`,
        output: `[20, 60, 1250, 699, 899]
    product  stock
0       Pen    500
1  Notebook    120
product            Pen
category    stationery
price               20
stock              500
Name: 0, dtype: object
    product  price
1  Notebook     60
2  Backpack   1250
699
          price  stock
product
Notebook     60    120
Backpack   1250      8
Mouse       699     35
['Lamp']`,
        runnable: false,
      },
      {
        caption: 'Filtering with conditions, isin, between, query and sorting',
        code: `import pandas as pd

orders = pd.DataFrame({
    "order_id": [1, 2, 3, 4, 5, 6],
    "city": ["Pune", "Mumbai", "Pune", "Delhi", "Mumbai", "Pune"],
    "product": ["Pen", "Notebook", "Backpack", "Mouse", "Pen", "Lamp"],
    "amount": [200, 240, 1250, 1398, 500, 899],
})
print(orders[orders["amount"] > 800])
print(orders[(orders["city"] == "Pune") & (orders["amount"] < 1000)]["order_id"].tolist())
print(orders[orders["product"].isin(["Pen", "Lamp"])]["order_id"].tolist())
print(orders[orders["amount"].between(200, 500)]["order_id"].tolist())
print(orders[~(orders["city"] == "Pune")]["city"].unique().tolist())

limit = 700
print(orders.query("city == 'Mumbai' or amount > @limit")["order_id"].tolist())
print(orders.sort_values(["city", "amount"], ascending=[True, False])[["city", "amount"]])
print(orders.nlargest(2, "amount")[["product", "amount"]])`,
        output: `   order_id   city   product  amount
2         3   Pune  Backpack    1250
3         4  Delhi     Mouse    1398
5         6   Pune      Lamp     899
[1, 6]
[1, 5, 6]
[1, 2, 5]
['Mumbai', 'Delhi']
[2, 3, 4, 5, 6]
     city  amount
3   Delhi    1398
4  Mumbai     500
1  Mumbai     240
2    Pune    1250
5    Pune     899
0    Pune     200
    product  amount
3     Mouse    1398
2  Backpack    1250`,
        runnable: false,
      },
      {
        caption: 'New columns, map, cut, apply, and the .str and .dt accessors',
        code: `import numpy as np
import pandas as pd

sales = pd.DataFrame({
    "date": pd.to_datetime(["2026-01-05", "2026-01-17", "2026-02-02", "2026-02-20"]),
    "customer": ["  asha RAO", "Ravi kumar ", "meera iyer", "Kiran  Shah"],
    "quantity": [3, 1, 12, 5],
    "unit_price": [250, 1200, 40, 300],
    "state": ["MH", "KA", "MH", "GJ"],
})
sales["revenue"] = sales["quantity"] * sales["unit_price"]
sales["customer"] = sales["customer"].str.strip().str.split().str.join(" ").str.title()
sales["state_name"] = sales["state"].map({"MH": "Maharashtra", "KA": "Karnataka", "GJ": "Gujarat"})
sales["size"] = np.where(sales["revenue"] >= 1000, "large", "small")
sales["band"] = pd.cut(sales["revenue"], bins=[0, 500, 1000, 5000], labels=["low", "mid", "high"])
sales["month"] = sales["date"].dt.month_name()
sales["weekday"] = sales["date"].dt.day_name()
sales["initials"] = sales["customer"].apply(lambda name: "".join(part[0] for part in name.split()))
print(sales[["customer", "revenue", "state_name", "size", "band"]])
print(sales[["month", "weekday", "initials"]])

discounted = sales.assign(net=lambda d: d["revenue"] * 0.9).loc[:, ["customer", "net"]]
print(discounted)
# pandas 3 refuses to silently turn an int column into floats, so convert first:
sales["unit_price"] = sales["unit_price"].astype(float)
sales.loc[sales["state"] == "MH", "unit_price"] = sales["unit_price"] * 1.05   # loc, not chained []
print(sales["unit_price"].tolist())`,
        output: `     customer  revenue   state_name   size  band
0    Asha Rao      750  Maharashtra  small   mid
1  Ravi Kumar     1200    Karnataka  large  high
2  Meera Iyer      480  Maharashtra  small   low
3  Kiran Shah     1500      Gujarat  large  high
      month   weekday initials
0   January    Monday       AR
1   January  Saturday       RK
2  February    Monday       MI
3  February    Friday       KS
     customer     net
0    Asha Rao   675.0
1  Ravi Kumar  1080.0
2  Meera Iyer   432.0
3  Kiran Shah  1350.0
[262.5, 1200.0, 42.0, 300.0]`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Using and/or instead of & and | in filters, or leaving out the parentheses around conditions.',
      'Chained assignment such as df[df.x > 1]["y"] = 0 — with Copy-on-Write it never changes df; use df.loc[mask, "y"] = 0.',
      'Mixing up loc (labels, inclusive slices) and iloc (positions, exclusive slices).',
      'Assigning floats into part of an int column with loc — pandas 3 raises TypeError instead of silently converting; call astype(float) first.',
      'Using apply with a Python function for simple arithmetic that a vectorised expression does much faster.',
      'Forgetting that sort_values and most methods return a new DataFrame rather than changing the original.',
    ],
    keyPoints: [
      'df["col"] / df[["a", "b"]] select columns; loc selects by label and iloc by position.',
      'Boolean masks, isin, between and query filter rows.',
      'sort_values, nlargest and nsmallest order and rank data.',
      'Create columns with vectorised maths, assign, np.where, pd.cut, map and (sparingly) apply.',
      '.str and .dt give string and date operations on whole columns.',
    ],
  },

  'cleaning-data-with-pandas': {
    title: 'Cleaning Data with pandas',
    intro: `Real-world data is messy: missing values, duplicate rows, numbers stored as text, inconsistent spelling, dates in odd formats, impossible outliers. Analysts often say that 80% of the work is cleaning — and conclusions drawn from dirty data are simply wrong.

This lesson works through a deliberately messy dataset and fixes it step by step: detecting and handling missing values, removing duplicates, fixing types, standardising text, parsing dates, handling outliers, and renaming and reordering columns.`,
    sections: [
      {
        heading: 'Missing Values',
        body: `pandas marks missing data as <code>NaN</code>/<code>NaT</code>/<code>None</code> (shown as <code>NaN</code> or <code>&lt;NA&gt;</code>). Count them with <code>df.isna().sum()</code>. Then decide per column: <code>dropna()</code> removes rows (use <code>subset=</code> to consider only key columns), <code>fillna(value)</code> fills with a constant, the mean/median or the most common value, and <code>ffill()</code>/<code>bfill()</code> carry values forward/backward in time series. Record what you did — filling changes the data.`,
      },
      {
        heading: 'Duplicates, Types and Text',
        body: `<code>duplicated()</code> flags repeated rows and <code>drop_duplicates(subset=[...], keep="first")</code> removes them. Convert text to numbers with <code>pd.to_numeric(col, errors="coerce")</code> (bad values become NaN rather than crashing), dates with <code>pd.to_datetime(col, format=..., errors="coerce")</code>, and repeated labels with <code>astype("category")</code> to save memory. Clean text with <code>.str.strip()</code>, <code>.str.lower()</code>/<code>.title()</code> and <code>.str.replace()</code>, and unify spellings with <code>replace({...})</code>.`,
      },
      {
        heading: 'Outliers and Tidy Columns',
        body: `Check ranges with <code>describe()</code> and rules you know (ages between 0 and 120, no negative quantities). The <strong>IQR rule</strong> marks values below Q1 − 1.5×IQR or above Q3 + 1.5×IQR as possible outliers; decide whether they are errors to remove, values to cap (<code>clip</code>), or real extremes to keep. Finally, <code>rename(columns=...)</code> to consistent snake_case names, drop unused columns and <code>reset_index(drop=True)</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Inspecting a messy dataset',
        code: `import numpy as np
import pandas as pd

raw = pd.DataFrame({
    "Customer Name": [" Asha Rao", "ravi kumar", "Meera Iyer", "ravi kumar", "Kiran Shah", None],
    "City": ["pune", "Mumbai ", "PUNE", "Mumbai ", "Bengaluru", "Delhi"],
    "Order Date": ["2026-01-05", "2026-01-07", "not recorded", "2026-01-07", "2026-01-09", "2026-01-10"],
    "Amount": ["1,250", "480", "95000", "480", "n/a", "720"],
    "Age": [34, 29, np.nan, 29, 41, 250],
})
print(raw.dtypes)
print(raw.isna().sum())
print("duplicate rows:", raw.duplicated().sum())`,
        output: `Customer Name        str
City                 str
Order Date           str
Amount               str
Age              float64
dtype: object
Customer Name    1
City             0
Order Date       0
Amount           0
Age              1
dtype: int64
duplicate rows: 1`,
        runnable: false,
      },
      {
        caption: 'Cleaning it step by step',
        code: `import numpy as np
import pandas as pd

raw = pd.DataFrame({
    "Customer Name": [" Asha Rao", "ravi kumar", "Meera Iyer", "ravi kumar", "Kiran Shah", None],
    "City": ["pune", "Mumbai ", "PUNE", "Mumbai ", "Bengaluru", "Delhi"],
    "Order Date": ["2026-01-05", "2026-01-07", "not recorded", "2026-01-07", "2026-01-09", "2026-01-10"],
    "Amount": ["1,250", "480", "95000", "480", "n/a", "720"],
    "Age": [34, 29, np.nan, 29, 41, 250],
})

df = raw.rename(columns=lambda c: c.strip().lower().replace(" ", "_"))   # snake_case names
df = df.drop_duplicates()                                                 # 1 exact duplicate
df = df.dropna(subset=["customer_name"])                                  # no name -> unusable

df["customer_name"] = df["customer_name"].str.strip().str.title()
df["city"] = df["city"].str.strip().str.title()
df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")      # bad text -> NaT
df["amount"] = pd.to_numeric(df["amount"].str.replace(",", ""), errors="coerce")

df.loc[~df["age"].between(0, 120), "age"] = np.nan                       # impossible ages
df["age"] = df["age"].fillna(df["age"].median())
df["amount"] = df["amount"].fillna(df["amount"].median())
df = df.reset_index(drop=True)

print(df)
print(df.dtypes)`,
        output: `  customer_name       city order_date   amount   age
0      Asha Rao       Pune 2026-01-05   1250.0  34.0
1    Ravi Kumar     Mumbai 2026-01-07    480.0  29.0
2    Meera Iyer       Pune        NaT  95000.0  34.0
3    Kiran Shah  Bengaluru 2026-01-09   1250.0  41.0
customer_name               str
city                        str
order_date       datetime64[us]
amount                  float64
age                     float64
dtype: object`,
        runnable: false,
      },
      {
        caption: 'Detecting outliers with the IQR rule',
        code: `import pandas as pd

amounts = pd.Series([420, 480, 510, 530, 560, 600, 640, 700, 95000], name="amount")
q1, q3 = amounts.quantile([0.25, 0.75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(f"Q1={q1}, Q3={q3}, IQR={iqr}, fences=({low}, {high})")
print("outliers:", amounts[(amounts < low) | (amounts > high)].tolist())
print("mean with / without:", round(amounts.mean(), 1), round(amounts[amounts <= high].mean(), 1))
print("median is robust:", amounts.median())
print("capped:", amounts.clip(upper=high).tolist())`,
        output: `Q1=510.0, Q3=640.0, IQR=130.0, fences=(315.0, 835.0)
outliers: [95000]
mean with / without: 11048.9 555.0
median is robust: 560.0
capped: [420, 480, 510, 530, 560, 600, 640, 700, 835]`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Dropping every row with any missing value and losing most of the data.',
      'Filling missing values with the mean when the column has extreme outliers (the median is safer).',
      'Using astype(float) on dirty text and crashing, instead of pd.to_numeric(..., errors="coerce").',
      'Not standardising text, so "Pune", "pune " and "PUNE" become three different cities.',
      'Silently deleting outliers that are real — investigate before removing.',
    ],
    keyPoints: [
      'Start with dtypes, isna().sum(), duplicated() and describe().',
      'Handle missing data deliberately: dropna(subset=...), fillna, ffill/bfill.',
      'to_numeric and to_datetime with errors="coerce" convert dirty columns safely.',
      'Standardise text with .str methods and replace.',
      'Use the IQR rule and domain rules to find outliers; remove, cap or keep them consciously.',
    ],
  },

  'grouping-merging-and-pivoting-in-pandas': {
    title: 'Grouping, Merging, Pivoting and Time Series in pandas',
    intro: `The real power of pandas appears when you summarise and combine data: total revenue per city, average rating per product and month, orders joined to customers, a monthly sales table like an Excel pivot. This lesson covers <code>groupby</code> with aggregation, <code>merge</code> (SQL-style joins), <code>concat</code>, <code>pivot_table</code> and <code>crosstab</code>, reshaping with <code>melt</code>, and time-series resampling and rolling windows.`,
    sections: [
      {
        heading: 'groupby: Split, Apply, Combine',
        body: `<code>df.groupby("city")["revenue"].sum()</code> splits rows into groups by city, applies <code>sum</code> to each group's revenue and combines the results. Group by several columns with a list. <code>agg()</code> computes several statistics at once, and <strong>named aggregation</strong> — <code>agg(total=("revenue", "sum"), orders=("order_id", "count"))</code> — gives clean column names. <code>transform()</code> returns a result aligned to the original rows (e.g. each order's share of its city's total), and <code>filter()</code> keeps whole groups that satisfy a condition.`,
      },
      {
        heading: 'Combining DataFrames',
        body: `<code>pd.merge(left, right, on="key", how=...)</code> joins tables like SQL: <code>inner</code> (only matches), <code>left</code> (all left rows), <code>right</code> and <code>outer</code> (everything). Use <code>left_on</code>/<code>right_on</code> for differently named keys, <code>validate="many_to_one"</code> to catch unexpected duplicates, and <code>indicator=True</code> to see where each row came from. <code>pd.concat([df1, df2])</code> stacks tables with the same columns (e.g. monthly files).`,
      },
      {
        heading: 'Pivot Tables, Reshaping and Time Series',
        body: `<code>pivot_table(index="city", columns="month", values="revenue", aggfunc="sum", fill_value=0, margins=True)</code> builds a spreadsheet-style summary; <code>pd.crosstab</code> counts combinations. <code>melt</code> turns wide tables into long ones (one row per observation), which plotting and grouping prefer. With a datetime column, <code>resample("W")</code> or <code>resample("ME")</code> groups by week or month-end, <code>rolling(7).mean()</code> smooths daily data, and <code>pct_change()</code> gives growth rates.`,
      },
    ],
    examples: [
      {
        caption: 'groupby with agg, named aggregation, transform and filter',
        code: `import pandas as pd

orders = pd.DataFrame({
    "order_id": range(1, 9),
    "city": ["Pune", "Mumbai", "Pune", "Delhi", "Mumbai", "Pune", "Delhi", "Mumbai"],
    "category": ["books", "books", "electronics", "books", "electronics", "books", "electronics", "books"],
    "revenue": [450, 899, 1500, 350, 2200, 600, 999, 300],
})
print(orders.groupby("city")["revenue"].sum())
print(orders.groupby(["city", "category"])["revenue"].mean())

summary = orders.groupby("city").agg(
    orders=("order_id", "count"),
    total=("revenue", "sum"),
    average=("revenue", "mean"),
    biggest=("revenue", "max"),
).sort_values("total", ascending=False)
print(summary.round(1))

orders["share_of_city"] = (orders["revenue"] / orders.groupby("city")["revenue"].transform("sum")).round(2)
print(orders[["city", "revenue", "share_of_city"]].head(4))
print(orders.groupby("city").filter(lambda g: g["revenue"].sum() > 2000)["city"].unique().tolist())`,
        output: `city
Delhi     1349
Mumbai    3399
Pune      2550
Name: revenue, dtype: int64
city    category
Delhi   books           350.0
        electronics     999.0
Mumbai  books           599.5
        electronics    2200.0
Pune    books           525.0
        electronics    1500.0
Name: revenue, dtype: float64
        orders  total  average  biggest
city
Mumbai       3   3399   1133.0     2200
Pune         3   2550    850.0     1500
Delhi        2   1349    674.5      999
     city  revenue  share_of_city
0    Pune      450           0.18
1  Mumbai      899           0.26
2    Pune     1500           0.59
3   Delhi      350           0.26
['Pune', 'Mumbai']`,
        runnable: false,
      },
      {
        caption: 'Joining tables with merge and stacking with concat',
        code: `import pandas as pd

customers = pd.DataFrame({"customer_id": [1, 2, 3, 4],
                          "name": ["Asha", "Ravi", "Meera", "Kiran"],
                          "city": ["Pune", "Mumbai", "Pune", "Delhi"]})
orders = pd.DataFrame({"order_id": [101, 102, 103, 104, 105],
                       "customer_id": [1, 2, 1, 3, 9],          # customer 9 does not exist
                       "amount": [450, 899, 300, 1200, 75]})

inner = pd.merge(orders, customers, on="customer_id", how="inner")
print(inner[["order_id", "name", "amount"]])

left = pd.merge(orders, customers, on="customer_id", how="left", validate="many_to_one")
print(left[left["name"].isna()][["order_id", "customer_id"]])

outer = pd.merge(customers, orders, on="customer_id", how="outer", indicator=True)
print(outer["_merge"].value_counts().to_dict())

per_customer = inner.groupby("name", as_index=False)["amount"].sum()
print(per_customer)

january = pd.DataFrame({"month": ["Jan"] * 2, "sales": [100, 200]})
february = pd.DataFrame({"month": ["Feb"] * 2, "sales": [150, 250]})
print(pd.concat([january, february], ignore_index=True))`,
        output: `   order_id   name  amount
0       101   Asha     450
1       102   Ravi     899
2       103   Asha     300
3       104  Meera    1200
   order_id  customer_id
4       105            9
{'both': 4, 'left_only': 1, 'right_only': 1}
    name  amount
0   Asha     750
1  Meera    1200
2   Ravi     899
  month  sales
0   Jan    100
1   Jan    200
2   Feb    150
3   Feb    250`,
        runnable: false,
      },
      {
        caption: 'Pivot tables, crosstab, melt, resample and rolling',
        code: `import numpy as np
import pandas as pd

sales = pd.DataFrame({
    "month": ["Jan", "Jan", "Feb", "Feb", "Feb", "Mar", "Mar"],
    "city": ["Pune", "Mumbai", "Pune", "Mumbai", "Pune", "Mumbai", "Pune"],
    "revenue": [1000, 1500, 1200, 900, 300, 2000, 1100],
})
pivot = sales.pivot_table(index="city", columns="month", values="revenue",
                          aggfunc="sum", fill_value=0, margins=True, margins_name="Total")
print(pivot[["Jan", "Feb", "Mar", "Total"]])
print(pd.crosstab(sales["city"], sales["month"])[["Jan", "Feb", "Mar"]])

wide = pd.DataFrame({"student": ["Asha", "Ravi"], "maths": [91, 78], "science": [85, 88]})
long = wide.melt(id_vars="student", var_name="subject", value_name="score")
print(long)

rng = np.random.default_rng(1)
days = pd.date_range("2026-01-01", periods=28, freq="D")
daily = pd.Series(rng.integers(80, 120, size=28), index=days, name="visits")
print(daily.resample("W").sum())
print(daily.rolling(7).mean().dropna().round(1).head(3))
print(daily.resample("W").sum().pct_change().round(3).tolist())`,
        output: `month    Jan   Feb   Mar  Total
city
Mumbai  1500   900  2000   4400
Pune    1000  1500  1100   3600
Total   2500  2400  3100   8000
month   Jan  Feb  Mar
city
Mumbai    1    1    1
Pune      1    2    1
  student  subject  score
0    Asha    maths     91
1    Ravi    maths     78
2    Asha  science     85
3    Ravi  science     88
2026-01-04    426
2026-01-11    690
2026-01-18    691
2026-01-25    714
2026-02-01    302
Freq: W-SUN, Name: visits, dtype: int64
2026-01-07    100.6
2026-01-08    103.3
2026-01-09    101.7
Freq: D, Name: visits, dtype: float64
[nan, 0.62, 0.001, 0.033, -0.577]`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Forgetting as_index=False or reset_index() and then struggling with a grouped index.',
      'Merging on keys with duplicates on both sides and multiplying rows — use validate= to catch it.',
      'Using an inner join by default and silently losing unmatched rows.',
      'Resampling data whose date column is not a DatetimeIndex (set_index or on="date").',
      'Building summaries with loops over unique values instead of groupby.',
    ],
    keyPoints: [
      'groupby + agg summarises groups; named aggregation gives clean column names.',
      'transform aligns group results to rows; filter keeps whole groups.',
      'merge joins tables (inner/left/right/outer); concat stacks them.',
      'pivot_table and crosstab build spreadsheet-style summaries; melt makes data long.',
      'resample, rolling and pct_change analyse time series.',
    ],
  },

  'data-visualization-with-matplotlib': {
    title: 'Data Visualisation with matplotlib',
    intro: `A good chart reveals in seconds what a table hides: trends, comparisons, distributions and relationships. <strong>matplotlib</strong> is Python's foundational plotting library; pandas' <code>.plot()</code> and the statistical library <strong>seaborn</strong> are built on top of it.

This lesson covers the figure-and-axes model, the essential chart types (line, bar, scatter, histogram, pie and box plots), labelling and styling, multiple charts in one figure, plotting straight from pandas, and saving charts to files. Install with <code>pip install matplotlib</code>.`,
    sections: [
      {
        heading: 'Figures and Axes',
        body: `A <strong>Figure</strong> is the whole image; an <strong>Axes</strong> is one chart inside it with its own x/y axes. The recommended style is <code>fig, ax = plt.subplots()</code> and then calling methods on <code>ax</code>: <code>ax.plot</code>, <code>ax.bar</code>, <code>ax.set_title</code>, <code>ax.set_xlabel</code>, <code>ax.legend</code>. <code>plt.subplots(2, 2, figsize=(10, 8))</code> creates a grid of axes. Show the chart with <code>plt.show()</code> (a window, or inline in Jupyter) or save it with <code>fig.savefig("chart.png", dpi=150, bbox_inches="tight")</code>.`,
      },
      {
        heading: 'Choosing a Chart',
        list: [
          '<strong>Line</strong> (<code>plot</code>) — change over time.',
          '<strong>Bar</strong> (<code>bar</code>/<code>barh</code>) — comparing categories.',
          '<strong>Scatter</strong> (<code>scatter</code>) — relationship between two numeric variables.',
          '<strong>Histogram</strong> (<code>hist</code>) — distribution of one numeric variable.',
          '<strong>Box plot</strong> (<code>boxplot</code>) — median, spread and outliers across groups.',
          '<strong>Pie</strong> (<code>pie</code>) — parts of a whole; use sparingly, bars are usually easier to read.',
        ],
      },
      {
        heading: 'Clear Charts',
        body: `Always give a title, axis labels with units, and a legend when there is more than one series. Start bar charts at zero, avoid 3-D effects, keep colours meaningful, and annotate the key number (<code>ax.bar_label</code>, <code>ax.annotate</code>). pandas can plot directly — <code>df.plot(kind="bar", x="city", y="revenue", ax=ax)</code> — and seaborn (<code>pip install seaborn</code>) adds attractive statistical charts such as <code>sns.barplot</code>, <code>sns.histplot</code> and <code>sns.heatmap</code> with one line each.`,
      },
    ],
    examples: [
      {
        caption: 'Line and bar charts with labels, legend and annotations',
        code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
online = [120, 135, 150, 170, 165, 190]
store = [100, 98, 110, 105, 120, 118]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))

ax1.plot(months, online, marker="o", label="Online")
ax1.plot(months, store, marker="s", linestyle="--", label="Store")
ax1.set_title("Monthly sales (thousand Rs)")
ax1.set_xlabel("Month")
ax1.set_ylabel("Sales")
ax1.legend()
ax1.grid(alpha=0.3)

totals = [o + s for o, s in zip(online, store)]
bars = ax2.bar(months, totals, color="tab:green")
ax2.bar_label(bars)                           # value on top of each bar
ax2.set_title("Total sales")
ax2.set_ylim(0, max(totals) * 1.15)

fig.tight_layout()
fig.savefig("sales.png", dpi=150)
# plt.show()                                  # opens a window when run locally
print("saved sales.png with", len(fig.axes), "charts")
plt.close(fig)`,
        output: `saved sales.png with 2 charts`,
        runnable: false,
      },
      {
        caption: 'Scatter, histogram, box plot and pie in one figure',
        code: `import matplotlib.pyplot as plt
import numpy as np

rng = np.random.default_rng(3)
hours = rng.uniform(1, 10, 60)
marks = 30 + 6 * hours + rng.normal(0, 6, 60)

fig, axes = plt.subplots(2, 2, figsize=(10, 8))

axes[0, 0].scatter(hours, marks, alpha=0.7)
axes[0, 0].set(title="Study hours vs marks", xlabel="Hours", ylabel="Marks")

axes[0, 1].hist(marks, bins=10, edgecolor="white")
axes[0, 1].set(title="Distribution of marks", xlabel="Marks", ylabel="Students")

groups = [rng.normal(70, 8, 40), rng.normal(75, 5, 40), rng.normal(65, 12, 40)]
axes[1, 0].boxplot(groups, tick_labels=["Class A", "Class B", "Class C"])
axes[1, 0].set_title("Marks by class")

axes[1, 1].pie([45, 30, 25], labels=["Books", "Electronics", "Other"], autopct="%1.0f%%")
axes[1, 1].set_title("Revenue share")

fig.tight_layout()
fig.savefig("dashboard.png", dpi=120)
print("correlation:", np.corrcoef(hours, marks)[0, 1].round(2))
print("saved dashboard.png:", [ax.get_title() for ax in axes.flat])
plt.close(fig)`,
        output: `correlation: 0.93
saved dashboard.png: ['Study hours vs marks', 'Distribution of marks', 'Marks by class', 'Revenue share']`,
        runnable: false,
      },
      {
        caption: 'Plotting directly from pandas',
        code: `import matplotlib.pyplot as plt
import pandas as pd

df = pd.DataFrame({
    "city": ["Pune", "Mumbai", "Delhi", "Chennai"],
    "online": [420, 610, 380, 290],
    "store": [300, 450, 410, 260],
}).set_index("city")

fig, ax = plt.subplots(figsize=(7, 4))
df.plot(kind="bar", ax=ax, rot=0, title="Revenue by city and channel")
ax.set_ylabel("Revenue (thousand Rs)")
fig.tight_layout()
fig.savefig("channels.png")
print(df.sum(axis=1).sort_values(ascending=False).to_dict())
print("legend:", [text.get_text() for text in ax.get_legend().get_texts()])
plt.close(fig)`,
        output: `{'Mumbai': 1060, 'Delhi': 790, 'Pune': 720, 'Chennai': 550}
legend: ['online', 'store']`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Charts without a title, axis labels or units.',
      'Using a line chart for unordered categories, or a pie chart with many slices.',
      'Bar charts whose y-axis does not start at zero, exaggerating differences.',
      'Mixing the plt.* state-machine style and the ax.* object style in the same chart.',
      'Forgetting plt.close() when creating many figures in a loop, which uses more and more memory.',
    ],
    keyPoints: [
      'fig, ax = plt.subplots() then ax.plot/bar/scatter/hist/boxplot/pie.',
      'Pick the chart for the question: trend, comparison, relationship, distribution or share.',
      'Label everything; add legends and value labels where helpful.',
      'subplots creates grids; savefig writes PNG/SVG/PDF files.',
      'pandas .plot() and seaborn build on matplotlib for quick charts.',
    ],
  },

  'exploratory-data-analysis-project': {
    title: 'Project: Exploratory Data Analysis of Sales Data',
    intro: `This project brings the whole data module together in the workflow analysts use every day: <strong>load → inspect → clean → enrich → analyse → visualise → report</strong>. You will analyse a year of orders for an online store and answer business questions: How are sales trending? Which cities and categories matter most? Who are the best customers? Is there a best day to run promotions?

The dataset is generated with a fixed random seed so your results match the ones shown. Replace the generation step with <code>pd.read_csv("orders.csv", parse_dates=["date"])</code> to run the same analysis on real data.`,
    sections: [
      {
        heading: 'The EDA Workflow',
        list: [
          '<strong>Ask questions first</strong> — what decisions should this analysis support?',
          '<strong>Inspect</strong> — shape, types, missing values, duplicates, ranges.',
          '<strong>Clean and enrich</strong> — fix types and values, add derived columns such as revenue, month and weekday.',
          '<strong>Analyse</strong> — groupby summaries, rankings, trends and comparisons.',
          '<strong>Visualise</strong> — one clear chart per key finding.',
          '<strong>Report</strong> — a few plain-language conclusions backed by numbers, plus caveats about data quality.',
        ],
      },
      {
        heading: 'Going Further',
        body: `Turn the analysis into a reusable script or notebook, schedule it to regenerate the report monthly, or publish it as an interactive dashboard with <strong>Streamlit</strong> or Plotly Dash. The same cleaned DataFrame is also the starting point for machine learning — for example predicting next month's sales or which customers are likely to return.`,
      },
    ],
    examples: [
      {
        caption: 'Generating the dataset (replace with read_csv for real data)',
        code: `import numpy as np
import pandas as pd

rng = np.random.default_rng(2026)
n = 1200
products = pd.DataFrame({
    "product": ["Pen Set", "Notebook", "Backpack", "Headphones", "Mouse", "Desk Lamp"],
    "category": ["stationery", "stationery", "bags", "electronics", "electronics", "home"],
    "unit_price": [150, 60, 1250, 1999, 699, 899],
})
orders = pd.DataFrame({
    "order_id": np.arange(1, n + 1),
    "date": pd.to_datetime("2025-01-01") + pd.to_timedelta(rng.integers(0, 365, n), unit="D"),
    "customer_id": rng.integers(1, 301, n),
    "city": rng.choice(["Pune", "Mumbai", "Delhi", "Bengaluru"], n, p=[0.35, 0.3, 0.2, 0.15]),
    "product": rng.choice(products["product"], n, p=[0.25, 0.25, 0.1, 0.1, 0.2, 0.1]),
    "quantity": rng.integers(1, 5, n),
})
orders.loc[rng.choice(n, 15, replace=False), "quantity"] = np.nan    # some missing values
orders = pd.concat([orders, orders.sample(5, random_state=1)])        # some duplicates
orders.to_csv("orders.csv", index=False)
products.to_csv("products.csv", index=False)
print(orders.shape, orders["quantity"].isna().sum(), orders.duplicated().sum())`,
        output: `(1205, 6) 15 5`,
        runnable: false,
      },
      {
        caption: 'Cleaning, enriching and answering the business questions',
        code: `import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["date"])
products = pd.read_csv("products.csv")

# 1. Inspect and clean
print("raw:", orders.shape, "| missing quantity:", orders["quantity"].isna().sum(),
      "| duplicates:", orders.duplicated().sum())
orders = orders.drop_duplicates().dropna(subset=["quantity"])
orders["quantity"] = orders["quantity"].astype(int)

# 2. Enrich
df = orders.merge(products, on="product", how="left", validate="many_to_one")
df["revenue"] = df["quantity"] * df["unit_price"]
df["month"] = df["date"].dt.to_period("M")
df["weekday"] = df["date"].dt.day_name()
print("clean:", df.shape, "| total revenue: Rs", f"{df['revenue'].sum():,}")

# 3. Trend: monthly revenue and growth
monthly = df.groupby("month")["revenue"].sum()
print("best month:", monthly.idxmax(), "| worst month:", monthly.idxmin())

# 4. Where does revenue come from?
by_city = df.groupby("city")["revenue"].sum().sort_values(ascending=False)
print((by_city / by_city.sum() * 100).round(1).to_dict())
by_category = df.groupby("category").agg(orders=("order_id", "count"), revenue=("revenue", "sum"))
print(by_category.sort_values("revenue", ascending=False))

# 5. Best customers (top 5 by spend)
top = df.groupby("customer_id").agg(orders=("order_id", "count"), spend=("revenue", "sum")).nlargest(5, "spend")
print(top)
print("top 10% of customers bring",
      round(df.groupby("customer_id")["revenue"].sum().nlargest(30).sum() / df["revenue"].sum() * 100, 1), "% of revenue")

# 6. Best weekday for orders
print(df["weekday"].value_counts().head(3).to_dict())

df.to_csv("orders_clean.csv", index=False)`,
        output: `raw: (1205, 6) | missing quantity: 15 | duplicates: 5
clean: (1185, 11) | total revenue: Rs 1,830,625
best month: 2025-05 | worst month: 2025-08
{'Pune': 39.4, 'Mumbai': 28.0, 'Delhi': 16.8, 'Bengaluru': 15.8}
             orders  revenue
category
electronics     329   991865
bags            119   413750
home            118   269700
stationery      619   155310
             orders  spend
customer_id
47               10  25121
298               9  21290
110               5  20466
246               7  20336
31                8  20237
top 10% of customers bring 26.6 % of revenue
{'Sunday': 183, 'Friday': 180, 'Saturday': 168}`,
        runnable: false,
      },
      {
        caption: 'Visualising the findings in a one-page report',
        code: `import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv("orders_clean.csv", parse_dates=["date"])
monthly = df.set_index("date")["revenue"].resample("ME").sum()
by_city = df.groupby("city")["revenue"].sum().sort_values()
by_category = df.groupby("category")["revenue"].sum().sort_values()

fig, axes = plt.subplots(2, 2, figsize=(12, 8))
axes[0, 0].plot(monthly.index.strftime("%b"), monthly.values / 1000, marker="o")
axes[0, 0].set(title="Monthly revenue", ylabel="Revenue (thousand Rs)")
axes[0, 1].barh(by_city.index, by_city.values / 1000)
axes[0, 1].set(title="Revenue by city", xlabel="thousand Rs")
axes[1, 0].barh(by_category.index, by_category.values / 1000, color="tab:orange")
axes[1, 0].set(title="Revenue by category", xlabel="thousand Rs")
axes[1, 1].hist(df["revenue"], bins=20, edgecolor="white")
axes[1, 1].set(title="Order value distribution", xlabel="Rs per order", ylabel="Orders")
fig.suptitle("Store performance 2025", fontsize=14)
fig.tight_layout()
fig.savefig("sales_report.png", dpi=120)
plt.close(fig)

print("saved sales_report.png")
print("average order value: Rs", round(df["revenue"].mean()))
print("median order value:  Rs", round(df["revenue"].median()))`,
        output: `saved sales_report.png
average order value: Rs 1545
median order value:  Rs 600`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Jumping into charts before checking data quality.',
      'Reporting averages only, when medians or distributions tell a different story.',
      'Presenting many charts without stating what each one shows.',
      'Forgetting to note caveats such as removed rows or estimated values.',
      'Keeping analysis in an unrepeatable series of notebook cells instead of a script that can be rerun.',
    ],
    keyPoints: [
      'EDA workflow: questions → inspect → clean → enrich → analyse → visualise → report.',
      'merge adds reference data; derived columns (revenue, month, weekday) unlock analysis.',
      'groupby, nlargest and value_counts answer most business questions.',
      'A small set of clear charts communicates the findings.',
      'Save the cleaned data so later analysis and machine learning start from it.',
    ],
  },
}
