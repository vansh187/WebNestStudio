// JavaScript Basics module (Part A) — hand-written lesson content.
// Keys are fixed topic slugs used directly by the tutorials router/UI.
export const javascriptContentA = {
  syntax: {
    title: 'JavaScript Syntax',
    intro: `JavaScript syntax is the set of rules that determine how a valid JavaScript program is written and structured. Unlike languages such as Java or C#, JavaScript does not require a surrounding class or explicit entry point — a script is simply a sequence of statements that the JavaScript engine reads and executes from top to bottom.

Because JavaScript is loosely structured and forgiving in places (like optional semicolons), it is especially important to understand exactly what the engine does with your code, rather than relying on "it seems to work." Small syntax habits formed early — statement structure, semicolon usage, and commenting — carry through every other topic in the language.`,
    sections: [
      {
        heading: 'Statements and Expressions',
        body: `A JavaScript program is made of statements — instructions that the engine executes, such as declaring a variable, running a loop, or calling a function. An expression is anything that produces a value, such as 2 + 2 or "hello".toUpperCase(). Statements are often built from expressions: <code>let total = price * quantity;</code> is a statement containing the expression <code>price * quantity</code>.`,
        list: [
          'Statements end a "step" of execution: declarations, assignments, conditionals, loops, function calls.',
          'Expressions always evaluate to a value and can be nested inside other expressions or statements.',
          'Blocks of statements are grouped with curly braces <code>{ }</code>, used by functions, loops, and conditionals.',
        ],
      },
      {
        heading: 'Semicolons and Automatic Semicolon Insertion (ASI)',
        body: `JavaScript statements are conventionally ended with a semicolon, but the language includes a feature called Automatic Semicolon Insertion (ASI), which inserts semicolons for you in certain cases when you omit them. ASI is convenient but has sharp edges: it does not always insert a semicolon where you expect, particularly with <code>return</code> statements followed by a newline, or lines starting with <code>(</code> or <code>[</code> that can be misread as a continuation of the previous line. The safest professional practice is to write semicolons explicitly rather than rely on ASI.`,
      },
      {
        heading: 'Comments',
        body: `JavaScript supports single-line comments starting with <code>//</code>, which run to the end of the line, and multi-line comments wrapped in <code>/* ... */</code>, which can span several lines. Comments are ignored entirely by the engine and exist only to communicate intent to human readers.`,
      },
      {
        heading: 'Case Sensitivity and Whitespace',
        body: `JavaScript is case-sensitive, so <code>myValue</code> and <code>myvalue</code> are different identifiers. Whitespace (spaces, tabs, newlines) is generally insignificant between tokens and is used only for readability, except inside string literals where it is preserved exactly as written.`,
      },
    ],
    examples: [
      {
        caption: 'Statements, expressions, and a semicolon-omission pitfall caused by ASI',
        code: `function getValue() {
  return
  {
    value: 42
  };
}

console.log(getValue()); // ASI inserts a semicolon right after "return"

function getValueFixed() {
  return {
    value: 42
  };
}

console.log(getValueFixed());`,
        output: `undefined
{ value: 42 }`,
      },
      {
        caption: 'Single-line and multi-line comments alongside real statements',
        code: `// Calculate the total price for an order
const price = 25;
const quantity = 3;

/*
  Multiplying price by quantity gives the subtotal.
  Tax is added separately in a later step.
*/
const subtotal = price * quantity;
console.log(subtotal);`,
        output: '75',
      },
    ],
    commonMistakes: [
      'Putting a newline right after "return" when returning an object literal — ASI inserts a semicolon after "return", silently turning the function into one that returns undefined.',
      'Assuming semicolons are never needed because "JavaScript works fine without them" — ASI has documented edge cases that produce bugs which are hard to spot.',
      'Mixing tabs and spaces inconsistently, which does not break JavaScript syntax but makes code much harder to read and review.',
      'Forgetting that JavaScript is case-sensitive and accidentally declaring two different variables (e.g. "userName" and "username") instead of reusing one.',
    ],
    keyPoints: [
      'A JavaScript program is a sequence of statements built from expressions, executed top to bottom.',
      'Automatic Semicolon Insertion (ASI) can insert semicolons in unexpected places — write semicolons explicitly to avoid subtle bugs.',
      'JavaScript supports // single-line and /* ... */ multi-line comments, both ignored by the engine.',
      'JavaScript is case-sensitive; whitespace is insignificant outside of string literals.',
    ],
  },

  variables: {
    title: 'JavaScript Variables: var, let, and const',
    intro: `Variables are named containers for values that a program can create, read, and update. Modern JavaScript provides three ways to declare a variable — <code>var</code>, <code>let</code>, and <code>const</code> — and each behaves differently in terms of scope, hoisting, and whether reassignment is allowed.

Understanding the differences between these three keywords is one of the most important early steps in learning JavaScript, because using the wrong one is a frequent source of confusing bugs, especially inside loops and conditional blocks.`,
    sections: [
      {
        heading: 'var — Function-Scoped and Hoisted',
        body: `<code>var</code> is the original way to declare variables in JavaScript. A variable declared with <code>var</code> is scoped to the nearest enclosing function (or the global scope if declared outside any function) — not to the block (<code>{ }</code>) it appears in. <code>var</code> declarations are also "hoisted": the declaration is moved to the top of its scope during compilation, but the value is not, so the variable exists as <code>undefined</code> until the line where it is assigned actually runs.`,
      },
      {
        heading: 'let — Block-Scoped and Reassignable',
        body: `<code>let</code> declares a variable scoped to the nearest enclosing block, such as an <code>if</code> block, a <code>for</code> loop, or any pair of curly braces. Like <code>var</code>, a <code>let</code> variable can be reassigned after declaration, but unlike <code>var</code>, accessing it before its declaration line throws a ReferenceError rather than silently returning undefined — this gap is called the "temporal dead zone."`,
      },
      {
        heading: 'const — Block-Scoped and Not Reassignable',
        body: `<code>const</code> behaves exactly like <code>let</code> in terms of scoping and the temporal dead zone, but a <code>const</code> variable cannot be reassigned after its initial value is set, and it must be initialized at the point of declaration. Importantly, <code>const</code> only prevents reassigning the variable itself — if the value is an object or array, its contents can still be mutated.`,
      },
      {
        heading: 'Choosing Between Them',
        body: `Modern JavaScript style strongly favors <code>const</code> by default, switching to <code>let</code> only when a variable genuinely needs to be reassigned, and avoiding <code>var</code> almost entirely in new code because of its confusing function-scoping and hoisting behavior.`,
        list: [
          '<code>const</code> — default choice; value binding never changes.',
          '<code>let</code> — used when the variable will be reassigned, such as a loop counter or an accumulator.',
          '<code>var</code> — legacy keyword, generally avoided in modern code except when maintaining older codebases.',
        ],
      },
    ],
    examples: [
      {
        caption: 'var leaking out of a block versus let staying scoped to it',
        code: `if (true) {
  var leaked = "I am visible outside the block";
  let contained = "I am only visible inside the block";
}

console.log(leaked);
console.log(typeof contained);`,
        output: `I am visible outside the block
undefined`,
      },
      {
        caption: 'Hoisting behavior: var is undefined before assignment, let/const throw in the temporal dead zone',
        code: `console.log(hoistedVar); // no error, just undefined
var hoistedVar = "assigned later";

try {
  console.log(hoistedLet);
  let hoistedLet = "assigned later";
} catch (error) {
  console.log(error.message);
}

const PI = 3.14159;
// PI = 3; // Uncommenting this line throws: Assignment to constant variable.
console.log(PI);`,
        output: `undefined
Cannot access 'hoistedLet' before initialization
3.14159`,
      },
    ],
    commonMistakes: [
      'Declaring a loop counter with "var" inside a for loop and being surprised that all callbacks created in the loop see the same final value instead of a per-iteration value.',
      'Trying to reassign a "const" variable and being confused by the resulting TypeError, when "let" was actually the correct choice.',
      'Assuming "const" makes an object or array fully immutable — it only locks the variable binding, not the object\'s contents.',
      'Reading a "let" or "const" variable before its declaration line and not recognizing the resulting ReferenceError as the temporal dead zone.',
    ],
    keyPoints: [
      '"var" is function-scoped and hoisted with an undefined initial value; "let" and "const" are block-scoped.',
      '"let" and "const" are hoisted too, but remain inaccessible until their declaration line (the temporal dead zone).',
      '"const" prevents reassigning the variable, not mutating the object or array it refers to.',
      'Prefer "const" by default, "let" when reassignment is needed, and avoid "var" in new code.',
    ],
  },

  types: {
    title: 'JavaScript Data Types',
    intro: `Every value in JavaScript has a type, and JavaScript divides its types into two broad categories: primitive types and objects. Primitives are simple, immutable values compared by their actual value, while objects are more complex structures compared by reference.

JavaScript is also a dynamically typed language, meaning a variable's type is determined by the value it currently holds, not fixed at declaration — the same variable can hold a number at one point and a string later, and the engine adapts automatically.`,
    sections: [
      {
        heading: 'The Seven Primitive Types',
        body: `JavaScript has seven primitive types, each representing an immutable value.`,
        list: [
          '<code>string</code> — textual data, written in single quotes, double quotes, or backticks.',
          '<code>number</code> — both integers and floating-point numbers share this single type (e.g. 42, 3.14, -7).',
          '<code>boolean</code> — either <code>true</code> or <code>false</code>.',
          '<code>null</code> — represents the intentional absence of any value, typically set explicitly.',
          '<code>undefined</code> — represents a variable that has been declared but not yet assigned a value.',
          '<code>symbol</code> — a unique, unforgeable value often used as an object property key.',
          '<code>bigint</code> — represents integers of arbitrary size beyond the safe range of number, written with an "n" suffix (e.g. 123n).',
        ],
      },
      {
        heading: 'Objects: Everything Else',
        body: `Anything that is not one of the seven primitives is an object, including plain objects (<code>{}</code>), arrays, functions, dates, and regular expressions. Objects are mutable and are stored and compared by reference: two separately created objects with identical contents are not considered equal with <code>===</code>.`,
      },
      {
        heading: 'Checking Types with typeof',
        body: `The <code>typeof</code> operator returns a string identifying a value's type, such as <code>"string"</code>, <code>"number"</code>, or <code>"object"</code>. It has one famous quirk: <code>typeof null</code> returns <code>"object"</code>, a long-standing bug in the language that cannot be fixed without breaking existing code. To check specifically for an array, use <code>Array.isArray(value)</code> instead of <code>typeof</code>.`,
      },
      {
        heading: 'Equality: == versus ===',
        body: `<code>===</code> (strict equality) compares both value and type without converting either operand, and is the recommended default. <code>==</code> (loose equality) first performs type coercion if the operands have different types, which can produce surprising results, such as <code>0 == false</code> being <code>true</code>, or <code>"" == 0</code> being <code>true</code>. Using <code>===</code> and <code>!==</code> consistently avoids these coercion surprises.`,
      },
    ],
    examples: [
      {
        caption: 'typeof across primitives and objects, including the null quirk',
        code: `console.log(typeof "hello");
console.log(typeof 42);
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);       // famous quirk
console.log(typeof Symbol("id"));
console.log(typeof 10n);
console.log(typeof { a: 1 });
console.log(typeof [1, 2, 3]);  // arrays report "object" too
console.log(Array.isArray([1, 2, 3]));`,
        output: `string
number
boolean
undefined
object
symbol
bigint
object
object
true`,
      },
      {
        caption: 'Loose equality coercion versus strict equality',
        code: `console.log(0 == false);
console.log(0 === false);
console.log("" == 0);
console.log(null == undefined);
console.log(null === undefined);
console.log(NaN === NaN); // NaN is never equal to itself`,
        output: `true
false
true
true
false
false`,
      },
    ],
    commonMistakes: [
      'Assuming "typeof null" returns "null" — it actually returns "object", a legacy quirk of the language.',
      'Using "==" out of habit and being surprised by coercion results like "0 == false" or "\'\' == 0" being true.',
      'Comparing two objects or arrays with identical contents using "===" and expecting true — reference types compare by identity, not by content.',
      'Forgetting that "NaN === NaN" is false, and using "value === NaN" to test for NaN instead of "Number.isNaN(value)".',
    ],
    keyPoints: [
      'JavaScript has seven primitive types: string, number, boolean, null, undefined, symbol, and bigint; everything else is an object.',
      'typeof identifies primitive types reliably except for the historical "typeof null === \'object\'" quirk.',
      '=== compares value and type with no coercion; == coerces types first and can produce surprising results.',
      'Objects (including arrays and functions) are compared by reference, not by their contents.',
    ],
  },

  functions: {
    title: 'JavaScript Functions',
    intro: `Functions are reusable blocks of code that perform a task or compute a value. JavaScript treats functions as "first-class citizens," meaning they can be assigned to variables, passed as arguments, and returned from other functions — this flexibility underlies much of the language's power, from callbacks to modern array methods.

JavaScript offers three main ways to define a function: function declarations, function expressions, and arrow functions. Each has different rules around hoisting, the <code>this</code> keyword, and syntax, so choosing the right form matters as much as knowing the syntax itself.`,
    sections: [
      {
        heading: 'Function Declarations',
        body: `A function declaration uses the <code>function</code> keyword followed by a name: <code>function add(a, b) { return a + b; }</code>. Function declarations are fully hoisted, meaning they can be called earlier in the code than where they are written, because the entire function definition (not just the name) is made available at the top of its scope.`,
      },
      {
        heading: 'Function Expressions',
        body: `A function expression assigns a function to a variable: <code>const add = function(a, b) { return a + b; };</code>. Unlike declarations, function expressions are not hoisted with their definition — only the variable declaration is hoisted (following <code>var</code>/<code>let</code>/<code>const</code> rules), so calling the function before this line fails.`,
      },
      {
        heading: 'Arrow Functions',
        body: `Arrow functions use a shorter syntax: <code>const add = (a, b) => a + b;</code>. Beyond brevity, arrow functions do not bind their own <code>this</code> — they inherit <code>this</code> from the surrounding (lexical) scope, which makes them especially useful inside callbacks and array methods where a regular function's <code>this</code> would otherwise be reassigned unexpectedly. Arrow functions also cannot be used as constructors and have no <code>arguments</code> object of their own.`,
      },
      {
        heading: 'Default and Rest Parameters',
        body: `Default parameters let you specify a fallback value used when an argument is omitted or explicitly <code>undefined</code>: <code>function greet(name = "friend") { ... }</code>. Rest parameters collect any remaining arguments into a real array using <code>...</code>: <code>function sum(...numbers) { ... }</code> lets <code>sum(1, 2, 3)</code> receive <code>numbers</code> as <code>[1, 2, 3]</code>, replacing the older, array-like <code>arguments</code> object with an actual array that supports methods like <code>map</code> and <code>reduce</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Declaration, expression, and arrow function forms compared, including hoisting',
        code: `console.log(declared(2, 3)); // works: declarations are hoisted

function declared(a, b) {
  return a + b;
}

const expressed = function (a, b) {
  return a * b;
};

const arrowed = (a, b) => a - b;

console.log(expressed(4, 5));
console.log(arrowed(10, 4));`,
        output: `5
20
6`,
      },
      {
        caption: 'Default parameters and rest parameters working together',
        code: `function buildOrder(item = "widget", ...extras) {
  return \`Order: \${item} with extras [\${extras.join(", ")}]\`;
}

console.log(buildOrder());
console.log(buildOrder("gadget", "warranty", "gift wrap"));

function sumAll(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

console.log(sumAll(1, 2, 3, 4));`,
        output: `Order: widget with extras []
Order: gadget with extras [warranty, gift wrap]
10`,
      },
    ],
    commonMistakes: [
      'Calling a function expression before its declaration line, expecting it to be hoisted the same way a function declaration is.',
      'Using an arrow function as an object method that needs its own "this", then being confused when "this" refers to the outer scope instead of the object.',
      'Placing a rest parameter anywhere except last in the parameter list, which is a syntax error — only one rest parameter is allowed, and it must come last.',
      'Confusing default parameters with required validation — a default only applies when the argument is omitted or explicitly undefined, not for other falsy values like 0 or "".',
    ],
    keyPoints: [
      'Function declarations are fully hoisted; function expressions and arrow functions are not.',
      'Arrow functions inherit "this" lexically from their surrounding scope and cannot be used as constructors.',
      'Default parameters supply fallback values; rest parameters gather remaining arguments into a real array.',
      'Functions are first-class values in JavaScript: they can be stored in variables, passed around, and returned from other functions.',
    ],
  },

  'arrays-objects': {
    title: 'JavaScript Arrays and Objects',
    intro: `Arrays and objects are the two core structures JavaScript uses to group related data. Arrays are ordered collections indexed by number, ideal for lists of similar items; objects are unordered collections of key-value pairs, ideal for representing a single entity with named properties.

Modern JavaScript adds powerful tools for working with both: a rich set of array iteration methods, destructuring for pulling values out of structures concisely, and the spread operator for copying and combining them.`,
    sections: [
      {
        heading: 'Array Iteration Methods: map, filter, reduce, forEach',
        body: `These four methods are the backbone of modern array processing in JavaScript, and each has a distinct purpose.`,
        list: [
          '<code>forEach</code> — runs a function once per element for side effects (like logging); it always returns <code>undefined</code>.',
          '<code>map</code> — transforms each element and returns a new array of the same length containing the results.',
          '<code>filter</code> — returns a new array containing only the elements for which the callback returns true.',
          '<code>reduce</code> — combines all elements into a single accumulated value, using a callback that receives the running total and the current element.',
        ],
      },
      {
        heading: 'Object Literals',
        body: `An object literal groups related values under named keys: <code>const user = { name: "Ana", age: 30 };</code>. Properties are accessed with dot notation (<code>user.name</code>) or bracket notation (<code>user["name"]</code>), the latter being required when the key is dynamic or not a valid identifier.`,
      },
      {
        heading: 'Destructuring',
        body: `Destructuring lets you unpack values from arrays or properties from objects into distinct variables in one step. Array destructuring uses position: <code>const [first, second] = [10, 20];</code>. Object destructuring uses key names: <code>const { name, age } = user;</code>, and can rename or provide defaults: <code>const { name: userName = "Guest" } = user;</code>.`,
      },
      {
        heading: 'The Spread Operator',
        body: `The spread operator (<code>...</code>) expands an array or object into its individual elements or properties. It is commonly used to copy structures without mutating the original (<code>const copy = [...original];</code>), merge multiple arrays or objects (<code>const merged = { ...defaults, ...overrides };</code>), or pass an array's elements as individual function arguments.`,
      },
    ],
    examples: [
      {
        caption: 'map, filter, and reduce chained to process a list of prices',
        code: `const prices = [10, 25, 40, 15, 60];

const discounted = prices
  .filter((price) => price >= 20)
  .map((price) => price * 0.9);

const total = discounted.reduce((sum, price) => sum + price, 0);

console.log(discounted);
console.log(total);`,
        output: `[ 22.5, 36, 54 ]
112.5`,
      },
      {
        caption: 'Destructuring and the spread operator together',
        code: `const user = { name: "Ana", age: 30, city: "Lisbon" };
const { name, city, country = "Portugal" } = user;
console.log(name, city, country);

const [first, , third] = [1, 2, 3];
console.log(first, third);

const updatedUser = { ...user, age: 31 };
console.log(updatedUser);

const combined = [...[1, 2], ...[3, 4]];
console.log(combined);`,
        output: `Ana Lisbon Portugal
1 3
{ name: 'Ana', age: 31, city: 'Lisbon' }
[ 1, 2, 3, 4 ]`,
      },
    ],
    commonMistakes: [
      'Using "forEach" and expecting its return value to be a transformed array — forEach always returns undefined; use "map" instead.',
      'Forgetting to provide an initial value to "reduce" and getting incorrect results (or an error on an empty array) because the first element is used as the accumulator by default.',
      'Mutating an array or object directly with the spread operator, mistakenly believing spread performs a deep copy — it only creates a shallow copy, so nested objects are still shared by reference.',
      'Mismatching the order of destructured array variables and expecting them to match by name instead of position.',
    ],
    keyPoints: [
      'forEach performs side effects and returns undefined; map transforms; filter selects; reduce accumulates into one value.',
      'Object properties can be accessed with dot notation or bracket notation; bracket notation is required for dynamic keys.',
      'Destructuring unpacks array elements by position and object properties by key, and supports defaults and renaming.',
      'The spread operator creates shallow copies and merges arrays/objects; nested structures are still shared by reference.',
    ],
  },

  scope: {
    title: 'JavaScript Scope',
    intro: `Scope determines where in your code a variable is accessible. JavaScript has three levels of scope — global, function, and block — and understanding how they nest inside one another is essential for predicting which variable a piece of code will actually see.

Scope also explains many of the practical differences between <code>var</code> and <code>let</code>/<code>const</code> covered earlier: the keyword you choose determines which of these scoping rules applies to the variable you declare.`,
    sections: [
      {
        heading: 'Global Scope',
        body: `A variable declared outside of any function or block lives in the global scope and is accessible from anywhere in the program, including inside every function and block. Overusing global scope is generally discouraged, because it makes it easy for unrelated parts of a program to accidentally interfere with each other's data.`,
      },
      {
        heading: 'Function Scope',
        body: `A variable declared with <code>var</code> inside a function is scoped to that entire function, regardless of how many nested blocks (<code>if</code>, <code>for</code>, and so on) it passes through. This is why a <code>var</code> declared inside an <code>if</code> block is still visible after that block ends, as long as you remain inside the same function.`,
      },
      {
        heading: 'Block Scope',
        body: `A variable declared with <code>let</code> or <code>const</code> is scoped to the nearest enclosing pair of curly braces — an <code>if</code> block, a <code>for</code> loop body, or even a bare <code>{ }</code> block on its own. Once execution leaves that block, the variable no longer exists. This tighter scoping is one of the main reasons <code>let</code> and <code>const</code> replaced <code>var</code> in modern JavaScript: it prevents variables from silently "leaking" beyond the block where they logically belong.`,
      },
      {
        heading: 'Scope Chain and Shadowing',
        body: `When code refers to a variable, the engine looks for it in the current scope first, then walks outward through each enclosing scope until it finds it (or reaches the global scope and fails, throwing a ReferenceError). If an inner scope declares a variable with the same name as an outer one, the inner variable "shadows" the outer one for the rest of that inner scope.`,
      },
    ],
    examples: [
      {
        caption: 'var leaking through a block into function scope, versus let staying block-scoped',
        code: `function demoScope() {
  if (true) {
    var functionScoped = "visible in the whole function";
    let blockScoped = "visible only in this block";
    console.log(blockScoped);
  }
  console.log(functionScoped);
  try {
    console.log(blockScoped);
  } catch (error) {
    console.log(error.message);
  }
}

demoScope();`,
        output: `visible only in this block
visible in the whole function
blockScoped is not defined`,
      },
      {
        caption: 'Variable shadowing across nested scopes',
        code: `let message = "outer";

function showMessage() {
  let message = "inner";
  console.log(message); // finds the shadowing inner variable first
}

showMessage();
console.log(message); // outer variable is unaffected`,
        output: `inner
outer`,
      },
    ],
    commonMistakes: [
      'Declaring a variable with "var" inside an if block or loop and being surprised it is still accessible after the block ends.',
      'Assuming block scope applies to "var" the same way it applies to "let" and "const" — "var" only respects function boundaries, not block boundaries.',
      'Shadowing an outer variable unintentionally by reusing its name in a nested scope, causing confusing bugs when the wrong variable is updated.',
      'Relying on global variables for values that are only needed temporarily, increasing the risk of naming collisions across a large codebase.',
    ],
    keyPoints: [
      'JavaScript has global, function, and block scope; the declaration keyword determines which rules apply.',
      '"var" is function-scoped and ignores block boundaries; "let" and "const" are block-scoped.',
      'The scope chain resolves a variable by searching the current scope and then each enclosing scope outward.',
      'Shadowing occurs when an inner scope declares a variable with the same name as one in an outer scope.',
    ],
  },

  closures: {
    title: 'JavaScript Closures',
    intro: `A closure is created when a function "remembers" the variables from the scope in which it was defined, even after that outer scope has finished executing. Closures are not a special syntax you opt into — they happen automatically any time a function is defined inside another function and refers to that outer function's variables.

Closures are one of the most powerful and most misunderstood features of JavaScript. They enable patterns like data privacy, function factories, and memoization, and they explain why some variables in JavaScript seem to "stay alive" long after the function that created them has returned.`,
    sections: [
      {
        heading: 'How a Closure Forms',
        body: `When a function is defined, it keeps a reference to the scope it was created in — not just the values that existed at that moment, but a live link to the variables themselves. If that function is returned or passed elsewhere and called later, it still has access to those outer variables, and can even modify them, because the reference persists as long as the inner function exists.`,
      },
      {
        heading: 'Why Closures Matter: Data Privacy',
        body: `Closures let you create private state that cannot be accessed directly from outside a function, only through functions you deliberately expose. This mimics private fields long before JavaScript classes gained a native private-field syntax, and it remains a common and idiomatic pattern.`,
      },
      {
        heading: 'A Concrete Example: The Counter Pattern',
        body: `The classic closure example is a counter: an outer function declares a <code>count</code> variable and returns an inner function that increments and returns it. Each call to the outer function creates a brand-new, independent <code>count</code> variable and a brand-new closure over it, so multiple counters never interfere with each other.`,
      },
    ],
    examples: [
      {
        caption: 'A counter built entirely with a closure over a private variable',
        code: `function createCounter() {
  let count = 0; // private to this closure

  return function increment() {
    count += 1;
    return count;
  };
}

const counterA = createCounter();
const counterB = createCounter();

console.log(counterA()); // 1
console.log(counterA()); // 2
console.log(counterA()); // 3
console.log(counterB()); // 1 — independent closure, unaffected by counterA`,
        output: `1
2
3
1`,
      },
      {
        caption: 'Closures capturing a variable per loop iteration using let',
        code: `function makeGreeters() {
  const greeters = [];
  for (let i = 0; i < 3; i++) {
    greeters.push(() => \`Greeter #\${i}\`);
  }
  return greeters;
}

const greeters = makeGreeters();
console.log(greeters[0]());
console.log(greeters[1]());
console.log(greeters[2]());`,
        output: `Greeter #0
Greeter #1
Greeter #2`,
      },
    ],
    commonMistakes: [
      'Using "var" instead of "let" in a loop that creates closures, causing every closure to share the same final value of the loop variable instead of its own per-iteration value.',
      'Believing a closure captures a snapshot (copy) of a variable\'s value — it actually keeps a live reference, so later changes to the variable are visible inside the closure.',
      'Creating closures unnecessarily inside hot loops or frequently called functions, which can hold onto memory longer than needed if the outer variables are large.',
      'Assuming closures require special syntax — any nested function that references an outer variable already forms a closure automatically.',
    ],
    keyPoints: [
      'A closure is formed when an inner function retains access to variables from its enclosing (outer) scope after that scope has finished running.',
      'Closures give a live reference to outer variables, not a copied snapshot, so later changes are reflected inside the closure.',
      'Closures enable private state, since outer variables are only reachable through the functions that were deliberately returned or exposed.',
      'Each call to an outer function creates a fresh scope and a fresh, independent closure over its own variables.',
    ],
  },

  classes: {
    title: 'JavaScript Classes',
    intro: `Classes provide a cleaner, more familiar syntax for creating objects and setting up inheritance in JavaScript, introduced in ECMAScript 2015 (ES6). A class defines a blueprint: a constructor for initializing new instances, and methods those instances can call.

It is important to understand that JavaScript classes are primarily "syntactic sugar" over the language's existing prototype-based inheritance model — under the hood, class methods still live on a prototype object, exactly as they did before classes existed. Classes simply make that mechanism easier to read and write.`,
    sections: [
      {
        heading: 'Class Syntax, Constructor, and Methods',
        body: `A class is declared with the <code>class</code> keyword. The special <code>constructor</code> method runs automatically when a new instance is created with <code>new</code>, and is typically used to set initial property values. Any other method defined in the class body becomes available on every instance, without needing to be redefined for each one.`,
      },
      {
        heading: 'Inheritance with extends and super',
        body: `A class can inherit from another using <code>extends</code>, gaining access to the parent class's methods and properties. Inside a subclass's constructor, <code>super(...)</code> must be called before using <code>this</code>, because it runs the parent class's constructor to properly initialize the inherited part of the object. <code>super.methodName()</code> can also be used inside a method to call the parent class's version of that method.`,
      },
      {
        heading: 'Classes as Syntactic Sugar Over Prototypes',
        body: `Every JavaScript object has an internal link to another object called its prototype, and method lookups walk up this "prototype chain" when a property is not found directly on the object. When you write a class method, JavaScript places it on <code>ClassName.prototype</code>, exactly where a method manually attached with the older <code>Constructor.prototype.method = ...</code> pattern would go. <code>extends</code> similarly wires up the prototype chain between the parent and child classes. This means <code>typeof MyClass</code> is actually <code>"function"</code>, confirming that a class is still a function under the hood.`,
      },
    ],
    examples: [
      {
        caption: 'A base class and a subclass using extends and super',
        code: `class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return \`\${this.name} makes a sound.\`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // must run before using "this"
    this.breed = breed;
  }

  speak() {
    const base = super.speak();
    return \`\${base} Specifically, \${this.name} barks.\`;
  }
}

const genericAnimal = new Animal("Creature");
const dog = new Dog("Rex", "Labrador");

console.log(genericAnimal.speak());
console.log(dog.speak());
console.log(dog instanceof Animal);`,
        output: `Creature makes a sound.
Rex makes a sound. Specifically, Rex barks.
true`,
      },
      {
        caption: 'Confirming that a class method lives on the prototype, not on each instance',
        code: `class Counter {
  constructor() {
    this.count = 0;
  }
  increment() {
    this.count += 1;
    return this.count;
  }
}

const c1 = new Counter();
const c2 = new Counter();

console.log(c1.increment());
console.log(c1.increment());
console.log(c2.increment()); // independent instance state

console.log(Object.getPrototypeOf(c1) === Counter.prototype);
console.log(c1.increment === c2.increment); // same shared function on the prototype`,
        output: `1
2
1
true
true`,
      },
    ],
    commonMistakes: [
      'Forgetting to call "super(...)" as the first statement in a subclass constructor before referencing "this", which throws a ReferenceError.',
      'Trying to call a class without "new" (e.g. "MyClass()" instead of "new MyClass()") — classes cannot be invoked as plain functions and throw a TypeError.',
      'Assuming each instance gets its own independent copy of every method — methods are shared on the prototype, only instance properties (like those set in the constructor) are per-instance.',
      'Believing classes introduce an entirely new inheritance model — they are built on the same prototype chain that existed in JavaScript long before ES6 classes.',
    ],
    keyPoints: [
      'A class\'s constructor initializes new instances; other methods are defined once and shared through the prototype.',
      '"extends" sets up inheritance, and "super(...)" must run before "this" is used inside a subclass constructor.',
      'Classes are syntactic sugar over prototype-based inheritance — class methods live on ClassName.prototype.',
      'Classes must be instantiated with "new"; calling one directly as a function throws a TypeError.',
    ],
  },

  'modern-es-features': {
    title: 'Modern ES Features',
    intro: `Since ECMAScript 2015 (ES6), JavaScript has received a steady stream of quality-of-life features that make everyday code shorter, safer, and easier to read. Four of the most commonly used are template literals, optional chaining, the nullish coalescing operator, and destructuring.

These features do not change what JavaScript can compute — everything they do could be written with older syntax — but they remove significant boilerplate and reduce a whole category of bugs related to accessing missing or undefined data.`,
    sections: [
      {
        heading: 'Template Literals',
        body: `Template literals use backticks (<code>\`</code>) instead of quotes, and allow embedded expressions using <code>${'${'}expression}</code> syntax, along with real multi-line strings without concatenation. This replaces older, more error-prone string concatenation with <code>+</code>.`,
      },
      {
        heading: 'Optional Chaining (?.)',
        body: `Optional chaining lets you safely access a deeply nested property without manually checking every level for <code>null</code> or <code>undefined</code> first. If any part of the chain before <code>?.</code> is <code>null</code> or <code>undefined</code>, the whole expression short-circuits and evaluates to <code>undefined</code> instead of throwing a TypeError. It also works with method calls (<code>obj.method?.()</code>) and array-style access (<code>obj?.[key]</code>).`,
      },
      {
        heading: 'Nullish Coalescing (??)',
        body: `The nullish coalescing operator returns its right-hand side only when the left-hand side is <code>null</code> or <code>undefined</code> — unlike <code>||</code>, which also falls through for other falsy values like <code>0</code>, <code>""</code>, or <code>false</code>. This makes <code>??</code> the correct tool for supplying a default value while still allowing legitimate falsy values to be used as-is.`,
      },
      {
        heading: 'Array and Object Destructuring (Recap in Context)',
        body: `Destructuring, covered earlier alongside arrays and objects, is itself a modern ES feature that pairs naturally with the others here — for example, combining destructuring with default values and optional chaining lets you pull deeply nested, possibly missing data into clean local variables in a single expression.`,
      },
    ],
    examples: [
      {
        caption: 'Template literals versus string concatenation',
        code: `const name = "Maria";
const orders = 3;

const oldStyle = "Hello, " + name + "! You have " + orders + " orders.";
const newStyle = \`Hello, \${name}! You have \${orders} orders.\`;

console.log(oldStyle);
console.log(newStyle);
console.log(\`Multi-line:
Second line here.\`);`,
        output: `Hello, Maria! You have 3 orders.
Hello, Maria! You have 3 orders.
Multi-line:
Second line here.`,
      },
      {
        caption: 'Optional chaining and nullish coalescing preventing crashes on missing data',
        code: `const user = {
  name: "Diego",
  address: {
    city: "Madrid",
  },
};

console.log(user.address?.city);
console.log(user.contact?.email); // no "contact" property, no crash
console.log(user.getFullProfile?.()); // no such method, no crash

const settings = { volume: 0, brightness: null };
console.log(settings.volume ?? 50);      // 0 is a valid value, not replaced
console.log(settings.brightness ?? 50);  // null is replaced by the default
console.log(settings.volume || 50);      // || incorrectly treats 0 as "missing"`,
        output: `Madrid
undefined
undefined
0
50
50`,
      },
    ],
    commonMistakes: [
      'Using "||" to provide a default value for a number or boolean, which incorrectly replaces legitimate falsy values like 0 or false — "??" should be used instead.',
      'Chaining "?." past the point where a crash was actually expected behavior, silently hiding bugs that should have surfaced as errors during development.',
      'Forgetting that optional chaining short-circuits the entire expression, so a chained assignment or function call after "?." may not run at all if an earlier link is missing.',
      'Mixing template literal backticks with regular quotes inside the same string, forgetting that only backtick-delimited strings support ${...} interpolation.',
    ],
    keyPoints: [
      'Template literals (backticks) support embedded expressions with ${...} and real multi-line strings.',
      'Optional chaining (?.) safely short-circuits to undefined when accessing a property on null or undefined, avoiding manual checks.',
      'Nullish coalescing (??) supplies a default only for null/undefined, unlike || which also replaces other falsy values like 0 and "".',
      'These features reduce boilerplate and a whole class of "cannot read property of undefined" errors.',
    ],
  },

  'event-loop-concepts': {
    title: 'The JavaScript Event Loop',
    intro: `JavaScript runs on a single thread, meaning it can only execute one piece of code at a time. Yet JavaScript programs routinely handle timers, network requests, and user interactions that take time to complete, without freezing. The event loop is the mechanism that makes this possible, coordinating the call stack with queues of pending work.

Understanding the event loop is essential for predicting the actual order in which asynchronous code runs — especially the surprising fact that a <code>setTimeout</code> with a delay of 0 milliseconds still runs after all currently pending synchronous code, no matter how quick that delay sounds.`,
    sections: [
      {
        heading: 'The Call Stack',
        body: `The call stack is where JavaScript keeps track of function calls currently in progress. When a function is called, a new frame is pushed onto the stack; when it returns, its frame is popped off. Because there is only one call stack, JavaScript can only run one function to completion at a time — this is what "single-threaded" means in practice.`,
      },
      {
        heading: 'Web/Runtime APIs and the Queues',
        body: `Asynchronous operations like <code>setTimeout</code>, network requests, and DOM events are not handled directly by the JavaScript engine itself — they are handed off to APIs provided by the runtime environment (the browser or Node.js). When those operations complete, their callback functions are not run immediately; instead, they are placed into a queue to wait until the call stack is empty.`,
        list: [
          '<strong>Macrotask (task) queue</strong> — holds callbacks from sources like setTimeout, setInterval, and I/O events.',
          '<strong>Microtask queue</strong> — holds callbacks from Promises (.then/.catch/.finally) and queueMicrotask; it has higher priority than the macrotask queue.',
        ],
      },
      {
        heading: 'How the Event Loop Coordinates Everything',
        body: `The event loop continuously checks one simple condition: is the call stack empty? If it is, the event loop first drains the entire microtask queue (running every pending Promise callback, even ones queued by other microtasks), and only then takes the single oldest task from the macrotask queue and pushes it onto the call stack for execution. This cycle repeats indefinitely, which is why microtasks (Promises) always run before the next macrotask (like a setTimeout callback), even if the setTimeout was scheduled first.`,
      },
      {
        heading: 'Why setTimeout(fn, 0) Still Runs After Synchronous Code',
        body: `Calling <code>setTimeout(fn, 0)</code> does not run <code>fn</code> immediately — it schedules <code>fn</code> as a macrotask to run after at least 0 milliseconds, but crucially, only once the call stack is completely empty. Since all currently executing synchronous code occupies the call stack right up until it finishes, and the event loop will not even glance at the task queue while the stack is non-empty, every line of synchronous code (and every pending microtask) runs to completion first, no matter how small the requested delay was.`,
      },
    ],
    examples: [
      {
        caption: 'Execution order proving synchronous code, then microtasks, then macrotasks',
        code: `console.log("1: synchronous start");

setTimeout(() => {
  console.log("4: setTimeout (macrotask)");
}, 0);

Promise.resolve().then(() => {
  console.log("3: promise .then (microtask)");
});

console.log("2: synchronous end");`,
        output: `1: synchronous start
2: synchronous end
3: promise .then (microtask)
4: setTimeout (macrotask)`,
      },
      {
        caption: 'Multiple microtasks always fully drain before the next macrotask runs',
        code: `setTimeout(() => console.log("macrotask"), 0);

Promise.resolve()
  .then(() => {
    console.log("microtask 1");
    return Promise.resolve();
  })
  .then(() => console.log("microtask 2 (chained)"));

Promise.resolve().then(() => console.log("microtask 3"));

console.log("synchronous code");`,
        output: `synchronous code
microtask 1
microtask 3
microtask 2 (chained)
macrotask`,
      },
    ],
    commonMistakes: [
      'Assuming "setTimeout(fn, 0)" runs fn immediately, or before any synchronous code — it always waits for the call stack to clear first.',
      'Assuming a setTimeout scheduled before a Promise will run first, without accounting for the microtask queue\'s higher priority over the macrotask queue.',
      'Writing a long-running synchronous loop and being surprised that timers, network callbacks, and UI updates all appear "frozen" — nothing in either queue can run while the call stack is busy.',
      'Believing JavaScript is multi-threaded because it can "do multiple things at once" — the concurrency comes from the runtime\'s APIs and queues, not from multiple threads executing JavaScript simultaneously.',
    ],
    keyPoints: [
      'JavaScript executes on a single call stack, so only one function runs to completion at a time.',
      'Asynchronous work is handled by runtime APIs, which queue callbacks rather than running them immediately.',
      'The microtask queue (Promises) is always fully drained before the event loop picks the next macrotask (setTimeout, etc.).',
      'setTimeout(fn, 0) only guarantees fn runs after the current call stack is empty and all pending microtasks finish — not that it runs instantly.',
    ],
  },
}
