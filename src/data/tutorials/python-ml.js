// Python course — machine learning basics with scikit-learn.
// Keys are slugs matching topics in codelabDefaults.js.
export const pythonMl = {
  'introduction-to-machine-learning': {
    title: 'Introduction to Machine Learning',
    intro: `In ordinary programming you write the rules: <em>if the amount is over 50,000 and the country is new, flag the payment</em>. In <strong>machine learning (ML)</strong> you give the computer examples — thousands of past payments labelled "fraud" or "not fraud" — and an algorithm <em>learns</em> the rules from the data, then applies them to new cases it has never seen.

ML powers spam filters, recommendations, price estimates, medical image screening, speech recognition and large language models. This lesson explains the core ideas and vocabulary, the types of machine learning, the standard workflow, and trains your first models with <strong>scikit-learn</strong>, Python's most widely used library for classical ML (<code>pip install scikit-learn</code>).`,
    sections: [
      {
        heading: 'Key Vocabulary',
        list: [
          '<strong>Dataset</strong> — a table of examples (rows). <strong>Features</strong> (<code>X</code>) are the input columns; the <strong>target</strong> or <strong>label</strong> (<code>y</code>) is what we want to predict.',
          '<strong>Model</strong> — a mathematical function with adjustable parameters. <strong>Training</strong> (<code>fit</code>) adjusts them to match the examples; <strong>prediction</strong> (<code>predict</code>) applies the model to new inputs.',
          '<strong>Training set</strong> vs <strong>test set</strong> — we train on one part of the data and measure on data the model has never seen, to estimate real-world performance.',
          '<strong>Overfitting</strong> — memorising the training data (great training score, poor test score). <strong>Underfitting</strong> — a model too simple to capture the pattern.',
        ],
      },
      {
        heading: 'Types of Machine Learning',
        list: [
          '<strong>Supervised learning</strong> — learn from labelled examples. <em>Regression</em> predicts a number (house price, delivery time); <em>classification</em> predicts a category (spam/not spam, disease type).',
          '<strong>Unsupervised learning</strong> — find structure in unlabelled data: <em>clustering</em> (customer segments), dimensionality reduction, anomaly detection.',
          '<strong>Reinforcement learning</strong> — an agent learns by trial and reward (games, robotics).',
          '<strong>Deep learning</strong> — neural networks with many layers (PyTorch, TensorFlow) for images, audio and text; large language models are deep learning at huge scale.',
        ],
      },
      {
        heading: 'The ML Workflow and scikit-learn',
        body: `A typical project: define the problem and metric → collect and explore data → clean and prepare features → split into training and test sets → train candidate models → evaluate and tune → deploy and monitor. scikit-learn gives every algorithm the same interface: create an <em>estimator</em> (<code>model = LinearRegression()</code>), <code>model.fit(X_train, y_train)</code>, then <code>model.predict(X_new)</code> and <code>model.score(X_test, y_test)</code>. Learn the pattern once and you can try dozens of algorithms by changing one line.`,
      },
    ],
    examples: [
      {
        caption: 'Your first model: predicting marks from study hours',
        code: `# pip install scikit-learn
import numpy as np
from sklearn.linear_model import LinearRegression

hours = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])   # features: 2-D (rows x columns)
marks = np.array([35, 45, 50, 58, 65, 72, 80, 88])             # target: 1-D

model = LinearRegression()
model.fit(hours, marks)                                        # learn from examples

print(f"learned rule: marks = {model.coef_[0]:.2f} * hours + {model.intercept_:.2f}")
print("predictions for 2.5, 6 and 9 hours:", model.predict([[2.5], [6], [9]]).round(1))
print("R^2 on the training data:", round(model.score(hours, marks), 3))`,
        output: `learned rule: marks = 7.37 * hours + 28.46
predictions for 2.5, 6 and 9 hours: [46.9 72.7 94.8]
R^2 on the training data: 0.998`,
        runnable: false,
      },
      {
        caption: 'Train/test split and a first classifier on the Iris dataset',
        code: `import pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

iris = load_iris(as_frame=True)                 # 150 flowers, 4 measurements, 3 species
X, y = iris.data, iris.target
print(X.shape, iris.target_names.tolist())
print(X.head(3))

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)   # keep class balance in both parts
print("train:", X_train.shape[0], "test:", X_test.shape[0])

model = KNeighborsClassifier(n_neighbors=5)
model.fit(X_train, y_train)
print("test accuracy:", round(model.score(X_test, y_test), 3))

new_flower = [[5.9, 3.0, 5.1, 1.8]]              # sepal/petal length and width in cm
prediction = model.predict(pd.DataFrame(new_flower, columns=X.columns))[0]
print("predicted species:", iris.target_names[prediction])`,
        output: `(150, 4) ['setosa', 'versicolor', 'virginica']
   sepal length (cm)  sepal width (cm)  petal length (cm)  petal width (cm)
0                5.1               3.5                1.4               0.2
1                4.9               3.0                1.4               0.2
2                4.7               3.2                1.3               0.2
train: 112 test: 38
test accuracy: 0.974
predicted species: virginica`,
        runnable: false,
      },
      {
        caption: 'Overfitting in action: training vs test accuracy',
        code: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

print("depth  train  test")
for depth in [1, 2, 3, 5, 10, None]:
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
    print(f"{str(depth):>5}  {tree.score(X_train, y_train):.3f}  {tree.score(X_test, y_test):.3f}")
# An unlimited tree memorises the training data (1.000) but does not do better on new data.`,
        output: `depth  train  test
    1  0.932  0.889
    2  0.942  0.906
    3  0.980  0.901
    5  0.997  0.912
   10  1.000  0.906
 None  1.000  0.906`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Evaluating a model on the same data it was trained on and trusting the score.',
      'Passing a 1-D array as X — scikit-learn expects a 2-D table of shape (samples, features).',
      'Forgetting random_state, so splits and results change on every run.',
      'Reaching for complex models before trying a simple baseline.',
      'Treating ML as magic: bad or biased data produces bad or biased models.',
    ],
    keyPoints: [
      'ML learns rules from examples: features X, target y.',
      'Supervised (regression, classification) vs unsupervised (clustering) learning.',
      'Always hold out a test set; train_test_split with random_state and stratify.',
      'Every scikit-learn estimator uses fit, predict and score.',
      'Watch for overfitting: a big gap between training and test scores.',
    ],
  },

  'linear-regression-with-scikit-learn': {
    title: 'Regression: Predicting Numbers with Linear Regression',
    intro: `<strong>Regression</strong> predicts a continuous number: a house price, tomorrow's demand, a delivery time. <strong>Linear regression</strong> is the classic starting point: it fits the line (or, with several features, the flat surface) <code>y = w1·x1 + w2·x2 + … + b</code> that minimises the squared prediction errors. It is fast, easy to interpret — each coefficient says how much the prediction changes per unit of a feature — and a strong baseline to beat.

This lesson predicts house prices from several features, evaluates the model with MAE, RMSE and R², interprets the coefficients, adds polynomial features for curved relationships, and compares with a tree-based model.`,
    sections: [
      {
        heading: 'Regression Metrics',
        list: [
          '<strong>MAE</strong> (mean absolute error) — average size of the errors, in the target\'s units. Easy to explain: "off by Rs 2.1 lakh on average".',
          '<strong>RMSE</strong> (root mean squared error) — like MAE but punishes large errors more.',
          '<strong>R²</strong> (coefficient of determination) — share of the variation explained: 1.0 is perfect, 0 is no better than always predicting the mean, and it can be negative.',
          'Always compare against a <strong>baseline</strong>, such as predicting the average price for every house.',
        ],
      },
      {
        heading: 'Beyond Straight Lines',
        body: `If the relationship curves, <code>PolynomialFeatures</code> adds squared and interaction terms so a linear model can fit curves. <strong>Regularised</strong> versions — <code>Ridge</code> and <code>Lasso</code> — shrink coefficients to reduce overfitting when there are many features. Tree ensembles such as <code>RandomForestRegressor</code> and <code>HistGradientBoostingRegressor</code> capture non-linear patterns and interactions automatically and are often the most accurate choice on tabular data, at the cost of interpretability.`,
      },
    ],
    examples: [
      {
        caption: 'Predicting house prices with several features',
        code: `import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(42)
n = 500
houses = pd.DataFrame({
    "area_sqft": rng.integers(500, 3000, n),
    "bedrooms": rng.integers(1, 5, n),
    "age_years": rng.integers(0, 40, n),
    "distance_km": rng.uniform(1, 25, n).round(1),
})
# The "true" price formula (in lakh Rs) plus noise — in real life this is unknown.
houses["price_lakh"] = (0.045 * houses["area_sqft"] + 4 * houses["bedrooms"]
                        - 0.6 * houses["age_years"] - 1.5 * houses["distance_km"]
                        + 20 + rng.normal(0, 6, n)).round(1)

X = houses.drop(columns="price_lakh")
y = houses["price_lakh"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=1)

model = LinearRegression().fit(X_train, y_train)
predictions = model.predict(X_test)

print("MAE :", round(mean_absolute_error(y_test, predictions), 2), "lakh")
print("RMSE:", round(mean_squared_error(y_test, predictions) ** 0.5, 2), "lakh")
print("R^2 :", round(r2_score(y_test, predictions), 3))
print("baseline MAE (always predict the mean):", round((y_test - y_train.mean()).abs().mean(), 2))

for feature, weight in zip(X.columns, model.coef_):
    print(f"{feature:<12} {weight:+.3f} lakh per unit")
new_house = pd.DataFrame([{"area_sqft": 1200, "bedrooms": 2, "age_years": 5, "distance_km": 8}])
print("estimate for a new house:", model.predict(new_house).round(1)[0], "lakh")`,
        output: `MAE : 4.47 lakh
RMSE: 5.65 lakh
R^2 : 0.972
baseline MAE (always predict the mean): 28.11
area_sqft    +0.045 lakh per unit
bedrooms     +3.797 lakh per unit
age_years    -0.586 lakh per unit
distance_km  -1.464 lakh per unit
estimate for a new house: 66.5 lakh`,
        runnable: false,
      },
      {
        caption: 'Curved relationships: polynomial features vs a straight line',
        code: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

rng = np.random.default_rng(0)
speed = np.linspace(10, 120, 60).reshape(-1, 1)                 # km/h
fuel = 0.002 * (speed.ravel() - 60) ** 2 + 5 + rng.normal(0, 0.3, 60)   # U-shaped curve

straight = LinearRegression().fit(speed, fuel)
curve = make_pipeline(PolynomialFeatures(degree=2), LinearRegression()).fit(speed, fuel)

print("straight line R^2:", round(r2_score(fuel, straight.predict(speed)), 3))
print("degree-2 curve R^2:", round(r2_score(fuel, curve.predict(speed)), 3))
print("most efficient speed ~", int(speed[curve.predict(speed).argmin()][0]), "km/h")`,
        output: `straight line R^2: 0.121
degree-2 curve R^2: 0.982
most efficient speed ~ 60 km/h`,
        runnable: false,
      },
      {
        caption: 'Comparing linear models with a random forest on real data',
        code: `from sklearn.datasets import load_diabetes
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

X, y = load_diabetes(return_X_y=True, as_frame=True)   # disease progression after one year
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=7)

models = {
    "LinearRegression": LinearRegression(),
    "Ridge(alpha=1)": Ridge(alpha=1.0),
    "RandomForest": RandomForestRegressor(n_estimators=300, random_state=7),
}
for name, model in models.items():
    model.fit(X_train, y_train)
    print(f"{name:<17} MAE={mean_absolute_error(y_test, model.predict(X_test)):.1f}  R^2={model.score(X_test, y_test):.3f}")

forest = models["RandomForest"]
top = sorted(zip(forest.feature_importances_, X.columns), reverse=True)[:3]
print("most important features:", [(name, round(float(imp), 2)) for imp, name in top])
# Here the simple linear model wins: always compare against simple baselines.`,
        output: `LinearRegression  MAE=41.9  R^2=0.503
Ridge(alpha=1)    MAE=47.1  R^2=0.457
RandomForest      MAE=44.0  R^2=0.484
most important features: [('s5', 0.28), ('bmi', 0.28), ('bp', 0.11)]`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Reporting R² alone without an error in real units (MAE/RMSE) and a baseline.',
      'Interpreting coefficients of features on very different scales as importance without scaling.',
      'Extrapolating far outside the range of the training data.',
      'Using a high polynomial degree and overfitting wildly.',
      'Assuming a linear model is wrong just because a complex one scores slightly higher — interpretability matters.',
    ],
    keyPoints: [
      'Regression predicts numbers; LinearRegression fits y = Σ wᵢxᵢ + b.',
      'Evaluate with MAE, RMSE and R² on a test set, compared to a baseline.',
      'Coefficients explain how each feature moves the prediction.',
      'PolynomialFeatures handles curves; Ridge/Lasso regularise.',
      'Tree ensembles are strong non-linear alternatives on tabular data.',
    ],
  },

  'classification-with-scikit-learn': {
    title: 'Classification: Predicting Categories',
    intro: `<strong>Classification</strong> predicts a category: will this customer churn, is this email spam, is this tumour benign or malignant, which digit is in this image? This lesson uses scikit-learn's built-in breast cancer dataset (569 tumours, 30 measurements, labelled malignant or benign) to train and compare the most common classifiers — logistic regression, k-nearest neighbours, decision trees and random forests — and to evaluate them properly with the confusion matrix, precision, recall and F1, and probability thresholds.`,
    sections: [
      {
        heading: 'Common Classifiers',
        list: [
          '<strong>LogisticRegression</strong> — despite its name, a linear classifier that outputs probabilities; fast, interpretable, a great baseline (scale the features).',
          '<strong>KNeighborsClassifier</strong> — predicts the majority class of the k most similar training examples (needs scaling).',
          '<strong>DecisionTreeClassifier</strong> — a flowchart of yes/no questions; easy to explain but overfits unless limited.',
          '<strong>RandomForestClassifier</strong> / <strong>HistGradientBoostingClassifier</strong> — ensembles of many trees; usually the most accurate on tabular data.',
          '<strong>SVC</strong> (support vector machine) and <strong>GaussianNB</strong> (naive Bayes, popular for text) are other classics.',
        ],
      },
      {
        heading: 'Beyond Accuracy',
        body: `Accuracy can mislead: if 95% of transactions are genuine, a model that always says "genuine" is 95% accurate and useless. The <strong>confusion matrix</strong> counts true positives, false positives, true negatives and false negatives. <strong>Precision</strong> = of the cases predicted positive, how many were right; <strong>recall</strong> = of the real positives, how many we caught; <strong>F1</strong> balances the two. Which matters more depends on the cost of each mistake — missing a cancer (false negative) is far worse than an extra test (false positive). <code>predict_proba</code> gives probabilities, and moving the decision threshold trades precision for recall.`,
      },
    ],
    examples: [
      {
        caption: 'Comparing four classifiers',
        code: `from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

data = load_breast_cancer(as_frame=True)
X, y = data.data, data.target                    # target: 0 = malignant, 1 = benign
print(X.shape, dict(zip(data.target_names.tolist(), y.value_counts().sort_index().tolist())))

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

models = {
    "Logistic regression": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "k-nearest neighbours": make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=7)),
    "Decision tree": DecisionTreeClassifier(max_depth=4, random_state=42),
    "Random forest": RandomForestClassifier(n_estimators=300, random_state=42),
}
for name, model in models.items():
    model.fit(X_train, y_train)
    print(f"{name:<22} train={model.score(X_train, y_train):.3f}  test={model.score(X_test, y_test):.3f}")`,
        output: `(569, 30) {'malignant': 212, 'benign': 357}
Logistic regression    train=0.988  test=0.986
k-nearest neighbours   train=0.974  test=0.979
Decision tree          train=0.988  test=0.944
Random forest          train=1.000  test=0.958`,
        runnable: false,
      },
      {
        caption: 'Confusion matrix, precision, recall and the classification report',
        code: `from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.25, random_state=42, stratify=data.target)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)
predicted = model.predict(X_test)

print(confusion_matrix(y_test, predicted))      # rows: actual, columns: predicted
print(classification_report(y_test, predicted, target_names=data.target_names, digits=3))`,
        output: `[[52  1]
 [ 1 89]]
              precision    recall  f1-score   support

   malignant      0.981     0.981     0.981        53
      benign      0.989     0.989     0.989        90

    accuracy                          0.986       143
   macro avg      0.985     0.985     0.985       143
weighted avg      0.986     0.986     0.986       143`,
        runnable: false,
      },
      {
        caption: 'Probabilities and moving the decision threshold',
        code: `import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

data = load_breast_cancer()
y = 1 - data.target                              # make "malignant" the positive class (1)
X_train, X_test, y_train, y_test = train_test_split(data.data, y, test_size=0.25, random_state=42, stratify=y)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)

probabilities = model.predict_proba(X_test)[:, 1]       # probability of malignant
print("first five probabilities:", probabilities[:5].round(3))

print("threshold  precision  recall  flagged")
for threshold in [0.5, 0.3, 0.1]:
    flagged = (probabilities >= threshold).astype(int)
    print(f"{threshold:>9}  {precision_score(y_test, flagged):>9.3f}  {recall_score(y_test, flagged):>6.3f}  {flagged.sum():>7}")
# A lower threshold catches more malignant cases (higher recall) at the cost of more false alarms.`,
        output: `first five probabilities: [0.999 0.004 1.    0.    0.035]
threshold  precision  recall  flagged
      0.5      0.980   0.925       50
      0.3      0.981   0.962       52
      0.1      0.897   0.981       58`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Judging a classifier by accuracy on imbalanced data.',
      'Not scaling features for logistic regression, KNN and SVMs.',
      'Forgetting stratify=y, so rare classes are missing from the test set.',
      'Always using the default 0.5 threshold when mistakes have very different costs.',
      'Letting an unlimited decision tree memorise the training set.',
    ],
    keyPoints: [
      'Classification predicts categories; start with logistic regression as a baseline.',
      'Tree ensembles (random forest, gradient boosting) are strong on tabular data.',
      'Use the confusion matrix, precision, recall and F1 — not just accuracy.',
      'predict_proba plus a chosen threshold matches the model to the real costs of errors.',
      'Scale features for distance- and gradient-based models.',
    ],
  },

  'data-preprocessing-and-pipelines': {
    title: 'Data Preprocessing and Pipelines',
    intro: `Models need numbers without gaps, but real data has missing values, text categories and features on wildly different scales. <strong>Preprocessing</strong> fixes this: imputing missing values, encoding categories, scaling numbers. scikit-learn's <strong>Pipeline</strong> and <strong>ColumnTransformer</strong> chain these steps with the model into one object that is trained, evaluated, tuned and saved as a unit.

Pipelines also prevent <strong>data leakage</strong> — accidentally letting information from the test set influence training — one of the most common reasons models look great in development and fail in production.`,
    sections: [
      {
        heading: 'Transformers',
        list: [
          '<code>SimpleImputer(strategy="median")</code> — fill missing numbers; <code>strategy="most_frequent"</code> for categories.',
          '<code>StandardScaler</code> — rescale to mean 0 and standard deviation 1; <code>MinMaxScaler</code> — rescale to 0–1.',
          '<code>OneHotEncoder(handle_unknown="ignore")</code> — one 0/1 column per category; unseen categories at prediction time are safely ignored.',
          '<code>OrdinalEncoder</code> — for ordered categories such as small &lt; medium &lt; large.',
          'Transformers learn from data with <code>fit</code> (e.g. the median) and apply it with <code>transform</code>.',
        ],
      },
      {
        heading: 'Pipelines and Data Leakage',
        body: `If you scale or impute using statistics of the <em>whole</em> dataset before splitting, the test set has leaked into training and your score is optimistic. A <code>Pipeline</code> fits every step only on the training data and reuses what it learned on the test data and new data. <code>ColumnTransformer</code> applies different steps to different columns (numeric vs categorical). The whole pipeline behaves like one estimator: <code>fit</code>, <code>predict</code>, <code>score</code>, cross-validation and grid search all work on it.`,
      },
    ],
    examples: [
      {
        caption: 'Encoding, scaling and imputing by hand (to see what happens)',
        code: `import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

df = pd.DataFrame({"age": [25, 32, np.nan, 51], "plan": ["basic", "pro", "basic", "enterprise"]})

imputer = SimpleImputer(strategy="median")
ages = imputer.fit_transform(df[["age"]])
print("median learned:", imputer.statistics_, "->", ages.ravel())

scaler = StandardScaler()
print("scaled:", scaler.fit_transform(ages).ravel().round(2))

encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
print(encoder.fit_transform(df[["plan"]]))
print(encoder.get_feature_names_out())
print(encoder.transform(pd.DataFrame({"plan": ["premium"]})))     # unseen category -> all zeros`,
        output: `median learned: [32.] -> [25. 32. 32. 51.]
scaled: [-1.03 -0.31 -0.31  1.65]
[[1. 0. 0.]
 [0. 0. 1.]
 [1. 0. 0.]
 [0. 1. 0.]]
['plan_basic' 'plan_enterprise' 'plan_pro']
[[0. 0. 0.]]`,
        runnable: false,
      },
      {
        caption: 'A full ColumnTransformer + Pipeline for customer churn',
        code: `import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

rng = np.random.default_rng(5)
n = 800
customers = pd.DataFrame({
    "tenure_months": rng.integers(1, 72, n).astype(float),
    "monthly_fee": rng.uniform(199, 1499, n).round(0),
    "support_calls": rng.poisson(2, n),
    "plan": rng.choice(["basic", "pro", "enterprise"], n, p=[0.5, 0.35, 0.15]),
    "payment": rng.choice(["card", "upi", "invoice"], n),
})
risk = (-0.05 * customers["tenure_months"] + 0.4 * customers["support_calls"]
        + 0.001 * customers["monthly_fee"] + (customers["plan"] == "basic") * 0.8)
customers["churned"] = (risk + rng.normal(0, 0.8, n) > 0.9).astype(int)
customers.loc[rng.choice(n, 40, replace=False), "tenure_months"] = np.nan   # missing values
print(customers.head(3))
print("churn rate:", customers["churned"].mean().round(3))

X = customers.drop(columns="churned")
y = customers["churned"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

numeric = ["tenure_months", "monthly_fee", "support_calls"]
categorical = ["plan", "payment"]
preprocess = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric),
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
])

for name, model in [("logistic", LogisticRegression(max_iter=1000)),
                    ("forest", RandomForestClassifier(n_estimators=300, random_state=0))]:
    pipeline = Pipeline([("prep", preprocess), ("model", model)])
    pipeline.fit(X_train, y_train)                    # imputer/scaler learn from training data only
    print(f"{name:<9} test accuracy = {pipeline.score(X_test, y_test):.3f}")

new_customer = pd.DataFrame([{"tenure_months": np.nan, "monthly_fee": 999, "support_calls": 6,
                              "plan": "basic", "payment": "invoice"}])
print("churn probability:", pipeline.predict_proba(new_customer)[0, 1].round(2))
print(list(pipeline.named_steps["prep"].get_feature_names_out())[:5])`,
        output: `   tenure_months  monthly_fee  support_calls   plan payment  churned
0           48.0        361.0              1    pro     upi        0
1           58.0        659.0              2    pro    card        0
2            2.0        622.0              1  basic    card        1
churn rate: 0.344
logistic  test accuracy = 0.850
forest    test accuracy = 0.815
churn probability: 0.77
['num__tenure_months', 'num__monthly_fee', 'num__support_calls', 'cat__plan_basic', 'cat__plan_enterprise']`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Scaling or imputing the whole dataset before train_test_split (data leakage).',
      'Label-encoding unordered categories as 0, 1, 2, implying an order that does not exist.',
      'Crashing in production on a new category because the encoder was not created with handle_unknown="ignore".',
      'Applying different preprocessing code in training and in production — save and reuse the pipeline.',
      'Scaling features for tree-based models, which do not need it (harmless, but unnecessary).',
    ],
    keyPoints: [
      'Impute missing values, one-hot encode categories and scale numbers.',
      'fit learns from training data; transform applies it anywhere.',
      'ColumnTransformer sends each column group through its own steps.',
      'A Pipeline bundles preprocessing and model into one estimator and prevents leakage.',
      'The same fitted pipeline is used for evaluation and production predictions.',
    ],
  },

  'model-evaluation-and-hyperparameter-tuning': {
    title: 'Model Evaluation, Cross-Validation and Hyperparameter Tuning',
    intro: `A single train/test split gives one noisy estimate: a lucky or unlucky split can change the score by several points. <strong>Cross-validation</strong> gives a more reliable estimate by training and testing several times on different splits. Models also have <strong>hyperparameters</strong> — settings you choose before training, such as a tree's maximum depth or the number of neighbours — and choosing them well can make a big difference.

This lesson covers k-fold cross-validation, choosing metrics, grid and randomised search, the three-way split between training, validation and test data, and ROC AUC.`,
    sections: [
      {
        heading: 'Cross-Validation',
        body: `In <strong>k-fold cross-validation</strong> the data is split into k parts (folds); the model is trained on k−1 folds and tested on the remaining one, k times, and the scores are averaged. <code>cross_val_score(model, X, y, cv=5, scoring="f1")</code> does it in one line; <code>StratifiedKFold</code> keeps class proportions in every fold and is the default for classifiers. Report the mean <em>and</em> the standard deviation. For time-ordered data use <code>TimeSeriesSplit</code> so the model never trains on the future.`,
      },
      {
        heading: 'Hyperparameter Search',
        body: `<code>GridSearchCV</code> tries every combination in a grid of settings with cross-validation and keeps the best; <code>RandomizedSearchCV</code> samples combinations and is better when the grid is large. With pipelines, name parameters as <code>step__parameter</code> (e.g. <code>model__max_depth</code>). Tune on the training data only and keep the test set untouched until the very end — otherwise you are tuning to the test set and your final score is optimistic.`,
      },
      {
        heading: 'ROC and AUC',
        body: `For probabilistic classifiers the <strong>ROC curve</strong> plots the true positive rate against the false positive rate at every threshold, and the <strong>AUC</strong> (area under the curve) summarises it: 0.5 is random guessing, 1.0 is perfect. AUC measures how well the model ranks positives above negatives regardless of the threshold, which makes it useful for comparing models.`,
      },
    ],
    examples: [
      {
        caption: 'Cross-validation versus a single split',
        code: `from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))

single = []
for seed in range(5):                            # the single-split score depends on luck
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=seed, stratify=y)
    single.append(round(model.fit(X_tr, y_tr).score(X_te, y_te), 3))
print("single splits:", single)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
scores = cross_val_score(model, X, y, cv=cv)
print("5-fold scores:", scores.round(3))
print(f"accuracy = {scores.mean():.3f} +/- {scores.std():.3f}")
print("F1:", cross_val_score(model, X, y, cv=cv, scoring="f1").mean().round(3),
      "| ROC AUC:", cross_val_score(model, X, y, cv=cv, scoring="roc_auc").mean().round(3))`,
        output: `single splits: [0.982, 0.991, 0.982, 0.974, 0.974]
5-fold scores: [0.956 0.974 0.982 1.    0.982]
accuracy = 0.979 +/- 0.014
F1: 0.983 | ROC AUC: 0.995`,
        runnable: false,
      },
      {
        caption: 'Tuning a pipeline with GridSearchCV and a final test',
        code: `from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import GridSearchCV, train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

grid = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid={"n_estimators": [100, 300], "max_depth": [3, 6, None], "min_samples_leaf": [1, 5]},
    cv=5,
    scoring="roc_auc",
    n_jobs=-1,
)
grid.fit(X_train, y_train)                        # 12 combinations x 5 folds = 60 fits
print("best parameters:", grid.best_params_)
print("best CV ROC AUC:", round(grid.best_score_, 4))

best = grid.best_estimator_                       # already refitted on all training data
print("test ROC AUC   :", round(roc_auc_score(y_test, best.predict_proba(X_test)[:, 1]), 4))
print("test accuracy  :", round(best.score(X_test, y_test), 3))`,
        output: `best parameters: {'max_depth': 6, 'min_samples_leaf': 5, 'n_estimators': 300}
best CV ROC AUC: 0.9889
test ROC AUC   : 0.9917
test accuracy  : 0.956`,
        runnable: false,
      },
      {
        caption: 'Validation curve: finding the sweet spot between under- and overfitting',
        code: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import validation_curve
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
k_values = [1, 3, 5, 9, 15, 25, 51]
train_scores, valid_scores = validation_curve(
    make_pipeline(StandardScaler(), KNeighborsClassifier()), X, y,
    param_name="kneighborsclassifier__n_neighbors", param_range=k_values, cv=5)

print("  k  train  valid")
for k, tr, va in zip(k_values, train_scores.mean(axis=1), valid_scores.mean(axis=1)):
    print(f"{k:>3}  {tr:.3f}  {va:.3f}")
# k=1 memorises (train 1.000); very large k underfits; the best validation score lies in between.`,
        output: `  k  train  valid
  1  1.000  0.954
  3  0.982  0.960
  5  0.974  0.965
  9  0.971  0.967
 15  0.967  0.961
 25  0.956  0.953
 51  0.951  0.951`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Tuning hyperparameters on the test set and then reporting the test score as unbiased.',
      'Reporting a single split score without cross-validation or a standard deviation.',
      'Using ordinary k-fold on time series, letting the model peek at the future.',
      'Huge grids that take hours when RandomizedSearchCV would find a good setting faster.',
      'Optimising a metric that does not reflect the business goal.',
    ],
    keyPoints: [
      'cross_val_score with (Stratified)KFold gives a reliable mean ± std estimate.',
      'Hyperparameters are chosen, not learned; search them with GridSearchCV/RandomizedSearchCV.',
      'In pipelines, refer to parameters as step__parameter.',
      'Keep a final test set untouched until the very end.',
      'ROC AUC compares classifiers independently of the threshold.',
    ],
  },

  'clustering-with-k-means': {
    title: 'Unsupervised Learning: Clustering with k-Means',
    intro: `Sometimes there is no label to predict — you want to discover structure. <strong>Clustering</strong> groups similar examples together: customer segments for marketing, similar documents, store locations with similar demand, unusual behaviour that fits no group.

<strong>k-means</strong> is the most widely used clustering algorithm. You choose the number of clusters k; it places k centres, assigns every point to its nearest centre, moves each centre to the mean of its points, and repeats until nothing changes. This lesson covers k-means, choosing k with the elbow method and silhouette score, and a customer segmentation example.`,
    sections: [
      {
        heading: 'Using k-means Well',
        body: `k-means uses distances, so <strong>scale the features</strong> first — otherwise income in rupees drowns out age in years. Set <code>random_state</code> for reproducible results (<code>n_init</code> reruns with different starting centres and keeps the best). k-means finds round, similar-sized clusters; for irregular shapes or noise, <code>DBSCAN</code> or hierarchical clustering (<code>AgglomerativeClustering</code>) may fit better.`,
      },
      {
        heading: 'Choosing k',
        body: `The <strong>elbow method</strong> plots <code>inertia_</code> (total squared distance of points to their centres) for several k; it always decreases, but the "elbow" where improvement slows suggests a good k. The <strong>silhouette score</strong> (−1 to 1) measures how well each point fits its own cluster compared with the nearest other cluster; higher is better. Finally, clusters must make sense to people — describe each one with <code>groupby</code> means and give it a name.`,
      },
    ],
    examples: [
      {
        caption: 'k-means on simple 2-D data, with the elbow and silhouette scores',
        code: `from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
from sklearn.metrics import silhouette_score

X, true_groups = make_blobs(n_samples=300, centers=4, cluster_std=0.8, random_state=7)

print(" k   inertia  silhouette")
for k in range(2, 7):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    print(f"{k:>2}  {km.inertia_:>8.1f}  {silhouette_score(X, km.labels_):.3f}")

best = KMeans(n_clusters=4, n_init=10, random_state=0).fit(X)
print("cluster sizes:", sorted([int((best.labels_ == c).sum()) for c in range(4)]))
print("centres:", best.cluster_centers_.round(1).tolist())
print("new points go to clusters:", best.predict([[0, 0], [-8, 8]]))`,
        output: ` k   inertia  silhouette
 2    8867.6  0.605
 3    2313.8  0.786
 4     365.6  0.846
 5     327.1  0.735
 6     293.0  0.595
cluster sizes: [75, 75, 75, 75]
centres: [[9.5, 0.6], [-1.3, 4.5], [0.1, -8.7], [-8.4, 5.5]]
new points go to clusters: [1 3]`,
        runnable: false,
      },
      {
        caption: 'Customer segmentation with scaled features',
        code: `import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(11)
def group(n, orders, spend, days):
    return pd.DataFrame({"orders_per_year": rng.normal(orders, 2, n).clip(1).round(),
                         "avg_order_value": rng.normal(spend, 150, n).clip(100).round(),
                         "days_since_last_order": rng.normal(days, 10, n).clip(1).round()})
customers = pd.concat([group(120, 4, 600, 120),    # occasional shoppers
                       group(80, 24, 900, 10),     # loyal regulars
                       group(40, 6, 3500, 30)],    # big spenders
                      ignore_index=True)

model = make_pipeline(StandardScaler(), KMeans(n_clusters=3, n_init=10, random_state=0))
customers["segment"] = model.fit_predict(customers)

profile = customers.groupby("segment").agg(
    customers=("orders_per_year", "size"),
    orders=("orders_per_year", "mean"),
    order_value=("avg_order_value", "mean"),
    recency_days=("days_since_last_order", "mean"),
).round(0).sort_values("order_value")
print(profile)

names = dict(zip(profile.index, ["Occasional", "Loyal regulars", "Big spenders"]))
print(customers["segment"].map(names).value_counts().to_dict())`,
        output: `         customers  orders  order_value  recency_days
segment
1              120     4.0        596.0         121.0
0               80    24.0        900.0          10.0
2               40     6.0       3475.0          33.0
{'Occasional': 120, 'Loyal regulars': 80, 'Big spenders': 40}`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Clustering unscaled features, so one large-valued column dominates.',
      'Picking k without checking the elbow, silhouette or whether the clusters make business sense.',
      'Treating cluster numbers as meaningful labels — they are arbitrary and can change between runs.',
      'Using k-means for elongated or irregular clusters where DBSCAN fits better.',
      'Forgetting that k-means is sensitive to outliers.',
    ],
    keyPoints: [
      'Clustering finds groups in unlabelled data; k-means is the standard starting point.',
      'Scale features and set random_state/n_init.',
      'Choose k with the elbow (inertia) and silhouette score, then sanity-check the groups.',
      'Profile clusters with groupby to turn them into named, actionable segments.',
      'DBSCAN and hierarchical clustering handle other cluster shapes.',
    ],
  },

  'saving-and-deploying-ml-models': {
    title: 'Saving, Serving and Next Steps in Machine Learning',
    intro: `A model is only useful when it can make predictions for real users. This final lesson shows how to save a trained pipeline with <strong>joblib</strong>, load it in another program, and serve predictions from a <strong>FastAPI</strong> endpoint — combining this module with the web module. It ends with the practices that keep models trustworthy in production and a roadmap into deep learning and working with large language models.`,
    sections: [
      {
        heading: 'Saving and Loading Models',
        body: `<code>joblib.dump(pipeline, "model.joblib")</code> saves the whole fitted pipeline — preprocessing and model — and <code>joblib.load()</code> restores it. Save the pipeline, not only the model, so production applies exactly the same preprocessing. Record the scikit-learn version and training date alongside it: loading a model with a different library version is not guaranteed to work. Only load model files you trust — joblib/pickle files can execute code when loaded. For cross-language serving, formats such as ONNX (<code>skl2onnx</code>) are an alternative.`,
      },
      {
        heading: 'ML in Production',
        list: [
          'Load the model once at start-up (a FastAPI lifespan handler), not on every request.',
          'Validate inputs with a Pydantic model that mirrors the training features.',
          'Log predictions and, later, the true outcomes to measure real-world accuracy.',
          'Watch for <strong>data drift</strong> — when incoming data stops looking like the training data — and retrain regularly.',
          'Check models for bias across groups of users before and after deployment.',
        ],
      },
      {
        heading: 'Where to Go Next',
        list: [
          '<strong>Gradient boosting libraries</strong> — XGBoost, LightGBM, CatBoost: top performers on tabular data.',
          '<strong>Deep learning</strong> — PyTorch (most popular in research and industry) or TensorFlow/Keras for images, audio, text and time series.',
          '<strong>Large language models</strong> — calling LLM APIs from Python, embeddings for semantic search, retrieval-augmented generation (RAG) and agents.',
          '<strong>MLOps</strong> — experiment tracking (MLflow), model registries, automated retraining and monitoring.',
          'Practice on real datasets (Kaggle, UCI Machine Learning Repository) and build end-to-end projects.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Training, saving and loading a pipeline with joblib',
        code: `# train_model.py
import json
import joblib
import sklearn
from datetime import date
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

iris = load_iris(as_frame=True)
pipeline = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
pipeline.fit(iris.data, iris.target)

joblib.dump(pipeline, "iris_model.joblib")
metadata = {"sklearn_version": sklearn.__version__, "trained_on": str(date(2026, 9, 28)),
            "features": list(iris.data.columns), "classes": iris.target_names.tolist()}
json.dump(metadata, open("iris_model.json", "w"), indent=2)
print("saved model with features:", metadata["features"])

# later, in another program
loaded = joblib.load("iris_model.joblib")
sample = iris.data.iloc[[0, 75, 140]]
print("predictions:", [metadata["classes"][i] for i in loaded.predict(sample)])
print("same as original:", (loaded.predict(sample) == pipeline.predict(sample)).all())`,
        output: `saved model with features: ['sepal length (cm)', 'sepal width (cm)', 'petal length (cm)', 'petal width (cm)']
predictions: ['setosa', 'versicolor', 'virginica']
same as original: True`,
        runnable: false,
      },
      {
        caption: 'Serving predictions with FastAPI',
        code: `# app.py  (run with: fastapi dev app.py)
from contextlib import asynccontextmanager

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

CLASSES = ["setosa", "versicolor", "virginica"]
ml = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    ml["model"] = joblib.load("iris_model.joblib")      # load once at start-up
    yield
    ml.clear()

app = FastAPI(title="Iris classifier", lifespan=lifespan)

class Flower(BaseModel):
    sepal_length: float = Field(gt=0, le=10)
    sepal_width: float = Field(gt=0, le=10)
    petal_length: float = Field(gt=0, le=10)
    petal_width: float = Field(gt=0, le=10)

@app.post("/predict")
def predict(flower: Flower):
    row = pd.DataFrame([[flower.sepal_length, flower.sepal_width, flower.petal_length, flower.petal_width]],
                       columns=["sepal length (cm)", "sepal width (cm)", "petal length (cm)", "petal width (cm)"])
    probabilities = ml["model"].predict_proba(row)[0]
    best = int(probabilities.argmax())
    return {"species": CLASSES[best], "confidence": round(float(probabilities[best]), 3)}

with TestClient(app) as client:
    print(client.post("/predict", json={"sepal_length": 5.1, "sepal_width": 3.5,
                                        "petal_length": 1.4, "petal_width": 0.2}).json())
    print(client.post("/predict", json={"sepal_length": 6.7, "sepal_width": 3.0,
                                        "petal_length": 5.2, "petal_width": 2.3}).json())
    print(client.post("/predict", json={"sepal_length": -1, "sepal_width": 3.0,
                                        "petal_length": 5.2, "petal_width": 2.3}).status_code)`,
        output: `{'species': 'setosa', 'confidence': 0.985}
{'species': 'virginica', 'confidence': 0.961}
422`,
        runnable: false,
      },
    ],
    commonMistakes: [
      'Saving only the model and re-implementing preprocessing differently in production.',
      'Loading the model inside the request handler, making every prediction slow.',
      'Loading joblib/pickle files from untrusted sources.',
      'Deploying once and never checking accuracy or data drift again.',
      'Ignoring library versions, so a saved model fails to load after an upgrade.',
    ],
    keyPoints: [
      'joblib.dump/load save and restore complete fitted pipelines.',
      'Store metadata: library version, features, classes and training date.',
      'Serve models from FastAPI: load once in lifespan, validate inputs with Pydantic.',
      'Monitor predictions, drift and fairness; retrain as data changes.',
      'Next steps: gradient boosting, PyTorch deep learning, LLM applications and MLOps.',
    ],
  },
}
