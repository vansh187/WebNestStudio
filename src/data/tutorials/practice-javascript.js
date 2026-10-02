// Practice blocks for the JavaScript course. Merged onto the lesson entries in index.js by
// slug, so the lesson prose files stay unchanged.
// The playground runs an exercise as script.js beside a small page that contains a <main>
// element with an <h1>, a <p> and a <button>, and shows console.log output in its console.
// Exercises that print follow the "Expected output:" convention (one <code> per line), and
// avoid alert(), localStorage and real network calls, which the sandboxed preview blocks.
export const practiceJavascript = {
  'setting-up-a-javascript-environment': {
    whyItMatters: `JavaScript runs in two places: in the browser, where it drives web pages, and in Node.js, where it runs servers and build tools. The quickest way to learn it is to type a line and see the result at once, which is exactly what the console gives you. Being comfortable there is the first step to everything else.`,
    exercise: {
      prompt: `Print a greeting, then print the result of a calculation to confirm that multiplication is done before addition.

Expected output: <code>Hello, JavaScript</code> then <code>14</code>`,
      starterCode: `// TODO: log the text "Hello, JavaScript"

// TODO: log the result of 2 + 3 * 4`,
      hints: [
        '<code>console.log(value)</code> prints a value to the console.',
        'Text goes in quotation marks; a calculation does not.',
      ],
      solution: `console.log("Hello, JavaScript");

console.log(2 + 3 * 4);`,
    },
    quiz: [
      {
        question: 'What is Node.js?',
        options: ['A web browser', 'A code editor', 'A runtime that executes JavaScript outside the browser', 'A JavaScript framework for user interfaces'],
        answer: 2,
        explanation: 'It is built on the V8 engine and is used for servers, scripts and tooling.',
      },
      {
        question: 'Which command runs a file named <code>app.js</code> with Node.js?',
        options: ['js app.js', 'run app.js', 'npm app.js', 'node app.js'],
        answer: 3,
        explanation: 'npm is the package manager; node is the runtime.',
      },
      {
        question: 'What is npm used for?',
        options: ['Installing and managing JavaScript packages', 'Styling pages', 'Writing HTML', 'Debugging in the browser'],
        answer: 0,
        explanation: 'It reads the project\'s dependencies from package.json.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between JavaScript in the browser and in Node.js?',
        answer: `The language is the same, but the surroundings differ. A browser provides the DOM, <code>window</code>, <code>document</code>, <code>fetch</code> and storage, and restricts access to the user's computer for security. Node.js has no DOM; it provides access to the file system, the network, processes and operating system through its own modules. Code that uses only the core language runs in both.`,
      },
      {
        question: 'What is package.json?',
        answer: `It is the manifest of a JavaScript project. It records the project's name and version, the packages it depends on and their version ranges, and named scripts such as <code>start</code>, <code>build</code> and <code>test</code> that are run with <code>npm run</code>. Running <code>npm install</code> reads it and downloads the dependencies into <code>node_modules</code>.`,
      },
    ],
  },

  'syntax': {
    whyItMatters: `JavaScript inserts missing semicolons for you, and in one situation it inserts one where you did not want it: directly after <code>return</code>. The code is valid, runs without a syntax error and silently returns <code>undefined</code>. Knowing the basic rules of statements and semicolons saves you from this class of quiet bug.`,
    exercise: {
      prompt: `The function is meant to return an object, but because the object starts on the line after <code>return</code>, JavaScript ends the statement there and the function returns <code>undefined</code>. Fix it.

Expected output: <code>Asha</code>`,
      starterCode: `function getUser() {
  return
  {
    name: "Asha"
  };
}

console.log(getUser().name);`,
      hints: [
        'A line break directly after <code>return</code> ends the statement.',
        'Start the object on the same line: <code>return {</code>.',
      ],
      solution: `function getUser() {
  return {
    name: "Asha"
  };
}

console.log(getUser().name);`,
    },
    quiz: [
      {
        question: 'Is JavaScript case-sensitive?',
        options: ['No', 'Yes; total and Total are different names', 'Only in strict mode', 'Only for keywords'],
        answer: 1,
        explanation: 'Variable names, function names and keywords are all case-sensitive.',
      },
      {
        question: 'How is a single-line comment written?',
        options: ['&lt;!-- comment --&gt;', '# comment', '// comment', '-- comment'],
        answer: 2,
        explanation: 'A multi-line comment is written between /* and */.',
      },
      {
        question: 'What does automatic semicolon insertion do?',
        options: ['Removes semicolons from the code', 'Reports an error for every missing semicolon', 'Formats the code', 'Adds semicolons where the parser decides a statement has ended'],
        answer: 3,
        explanation: 'It usually does what you intend, with a few traps such as a line break after return.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a statement and an expression?',
        answer: `An expression produces a value: <code>2 + 3</code>, <code>user.name</code>, a function call. A statement performs an action: a variable declaration, an <code>if</code>, a loop, a <code>return</code>. An expression can be used wherever a value is expected; a statement cannot. This is why the conditional operator, which is an expression, can appear inside a template literal or an argument list, while an <code>if</code> statement cannot.`,
      },
      {
        question: 'Should you write semicolons in JavaScript?',
        answer: `They are optional in most places because of automatic semicolon insertion, but the rules have exceptions: a line starting with <code>(</code>, <code>[</code> or a template literal is joined to the previous line, and a line break after <code>return</code> ends the statement. Either style works if applied consistently. Most teams settle the question with a formatter such as Prettier, which adds or removes them automatically.`,
      },
    ],
  },

  'variables': {
    whyItMatters: `There are three ways to declare a variable in JavaScript, and choosing the wrong one causes real bugs: <code>var</code> leaks out of blocks and can be used before it is assigned. Modern code uses <code>const</code> by default and <code>let</code> when a value must change, and interviewers ask about the differences in nearly every JavaScript interview.`,
    exercise: {
      prompt: `The code fails because <code>total</code> is declared with <code>const</code> but is changed, and the loop counter declared with <code>var</code> remains visible after the loop. Choose the right keyword for each so that the total is printed and the counter no longer exists outside the loop.

Expected output: <code>6</code> then <code>undefined</code>`,
      starterCode: `const total = 0;

for (var i = 1; i <= 3; i++) {
  total += i;
}

console.log(total);
console.log(typeof i); // should print "undefined": i must not exist out here`,
      hints: [
        'A value that is reassigned must be declared with <code>let</code>.',
        '<code>let</code> is scoped to the block, so a loop counter declared with it does not exist after the loop.',
      ],
      solution: `let total = 0;

for (let i = 1; i <= 3; i++) {
  total += i;
}

console.log(total);
console.log(typeof i); // should print "undefined": i must not exist out here`,
    },
    quiz: [
      {
        question: 'What happens when a <code>const</code> variable is reassigned?',
        options: ['A TypeError is thrown', 'The new value is stored', 'The assignment is ignored silently', 'It becomes a let'],
        answer: 0,
        explanation: 'A const binding cannot be reassigned after it is initialised.',
      },
      {
        question: 'Given <code>const user = { name: "Asha" };</code> is <code>user.name = "Ravi";</code> allowed?',
        options: ['No, const makes the object immutable', 'Yes; const prevents reassigning the variable, not changing the object', 'Only in strict mode', 'It throws a SyntaxError'],
        answer: 1,
        explanation: 'To make an object itself unchangeable, use Object.freeze.',
      },
      {
        question: 'What does <code>console.log(x); var x = 5;</code> print?',
        options: ['It throws a ReferenceError', '5', 'undefined', 'null'],
        answer: 2,
        explanation: 'The var declaration is hoisted, but the assignment stays where it is.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the differences between var, let and const?',
        answer: `<code>var</code> is function-scoped, is hoisted and initialised to <code>undefined</code>, and can be redeclared. <code>let</code> and <code>const</code> are block-scoped, are hoisted but cannot be used before their declaration, and cannot be redeclared in the same scope. <code>let</code> can be reassigned; <code>const</code> cannot, and must be given a value when declared. Use <code>const</code> by default and <code>let</code> only when the value changes.`,
      },
      {
        question: 'What is the temporal dead zone?',
        answer: `It is the part of a block between its start and the line where a <code>let</code> or <code>const</code> variable is declared. The variable exists in that region, because the declaration is hoisted, but reading or writing it throws a <code>ReferenceError</code>. This catches the mistake of using a variable before it has a value, which <code>var</code> allows silently by returning <code>undefined</code>.`,
      },
    ],
  },

  'types': {
    whyItMatters: `JavaScript converts between types automatically, and the results are sometimes surprising: <code>"5" + 1</code> is <code>"51"</code> but <code>"5" - 1</code> is <code>4</code>. Add the fact that <code>typeof null</code> reports <code>"object"</code>, and type checks become a common source of bugs. Knowing the types and using strict equality avoids most of them.`,
    exercise: {
      prompt: `<code>typeof</code> reports <code>"object"</code> for plain objects, for arrays and for <code>null</code>. Write <code>isPlainObject</code>, which returns <code>true</code> only for a real object that is neither <code>null</code> nor an array.

Expected output: <code>true</code>, <code>false</code>, <code>false</code>, <code>false</code> (one per line)`,
      starterCode: `function isPlainObject(value) {
  // TODO: true only for a non-null object that is not an array
}

console.log(isPlainObject({ name: "Asha" }));
console.log(isPlainObject(null));
console.log(isPlainObject([1, 2, 3]));
console.log(isPlainObject("text"));`,
      hints: [
        'Check <code>typeof value === "object"</code> first, then rule out <code>null</code> with <code>value !== null</code>.',
        '<code>Array.isArray(value)</code> is the reliable test for an array.',
      ],
      solution: `function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

console.log(isPlainObject({ name: "Asha" }));
console.log(isPlainObject(null));
console.log(isPlainObject([1, 2, 3]));
console.log(isPlainObject("text"));`,
    },
    quiz: [
      {
        question: 'What does <code>typeof null</code> return?',
        options: ['"null"', '"undefined"', '"boolean"', '"object"'],
        answer: 3,
        explanation: 'It is a long-standing quirk of the language. Test for null with value === null.',
      },
      {
        question: 'What is the result of <code>"5" + 1</code>?',
        options: ['"51"', 'NaN', 'A TypeError', '6'],
        answer: 0,
        explanation: 'With +, if either operand is a string the other is converted to a string and they are joined.',
      },
      {
        question: 'What does <code>0 == ""</code> evaluate to, and <code>0 === ""</code>?',
        options: ['false, then false', 'true, then false', 'true, then true', 'false, then true'],
        answer: 1,
        explanation: '== converts the empty string to 0 before comparing. === compares without converting.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between == and ===?',
        answer: `<code>===</code>, strict equality, is true only when both operands have the same type and the same value. <code>==</code>, loose equality, first converts the operands to a common type, which gives results such as <code>"1" == 1</code> and <code>null == undefined</code> being true. Because those conversions are hard to remember, <code>===</code> is used almost always. Objects are compared by reference with both operators.`,
      },
      {
        question: 'What is the difference between null and undefined?',
        answer: `<code>undefined</code> is what JavaScript gives a variable that has been declared but not assigned, a missing property, or a function that returns nothing. <code>null</code> is a value a programmer assigns on purpose to mean "no value". They are loosely equal to each other but not strictly equal, and <code>typeof</code> returns <code>"undefined"</code> for one and <code>"object"</code> for the other.`,
      },
    ],
  },

  'functions': {
    whyItMatters: `Functions are the unit of reuse in JavaScript, and they are also values: they are passed to event listeners, array methods and promises all the time. The three ways of writing them behave differently in small but important ways, and arrow functions in particular are in almost every line of modern code.`,
    exercise: {
      prompt: `Write an arrow function <code>greet</code> whose <code>name</code> parameter defaults to <code>friend</code>, and a function <code>sum</code> that accepts any number of arguments and returns their total.

Expected output: <code>Hello, friend!</code>, <code>Hello, Asha!</code>, <code>6</code> (one per line)`,
      starterCode: `// TODO: arrow function greet with a default parameter

// TODO: function sum using a rest parameter

console.log(greet());
console.log(greet("Asha"));
console.log(sum(1, 2, 3));`,
      hints: [
        'A default value is written in the parameter list: <code>(name = "friend") =&gt; ...</code>.',
        'A rest parameter, <code>...numbers</code>, collects the arguments into an array, which <code>reduce</code> can add up.',
      ],
      solution: `const greet = (name = "friend") => "Hello, " + name + "!";

function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

console.log(greet());
console.log(greet("Asha"));
console.log(sum(1, 2, 3));`,
    },
    quiz: [
      {
        question: 'Which kind of function can be called before the line where it is written?',
        options: ['An arrow function', 'A function expression', 'A function declaration', 'None of them'],
        answer: 2,
        explanation: 'Function declarations are hoisted together with their body.',
      },
      {
        question: 'What does a function return when it has no <code>return</code> statement?',
        options: ['null', 'An empty string', '0', 'undefined'],
        answer: 3,
        explanation: 'Every call produces a value; without return it is undefined.',
      },
      {
        question: 'How does an arrow function treat <code>this</code>?',
        options: ['It has no this of its own and uses the one from the surrounding code', 'It creates its own this', 'this is always undefined', 'It sets this to the global object'],
        answer: 0,
        explanation: 'This is why arrow functions suit callbacks inside methods, and do not suit object methods themselves.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the differences between an arrow function and a regular function?',
        answer: `An arrow function has no <code>this</code> of its own; it uses the <code>this</code> of the code that surrounds it. It also has no <code>arguments</code> object, cannot be used as a constructor with <code>new</code>, and is not hoisted, since it is assigned to a variable. A regular function gets its <code>this</code> from how it is called. Arrow functions are shorter and suit callbacks; regular functions are used for methods and constructors.`,
      },
      {
        question: 'What is the difference between a function declaration and a function expression?',
        answer: `A declaration, <code>function name() {}</code>, is hoisted in full, so it can be called anywhere in its scope, even above where it is written. An expression assigns a function to a variable, <code>const name = function () {}</code>; only the variable follows the hoisting rules of <code>let</code>, <code>const</code> or <code>var</code>, so the function cannot be called before that line runs.`,
      },
    ],
  },

  'arrays-objects': {
    whyItMatters: `Data from an API arrives as arrays of objects, and turning it into what the page needs is the daily work of front-end development. <code>map</code>, <code>filter</code> and <code>reduce</code>, with destructuring and the spread operator, replace most loops and are the style in which React code is written.`,
    exercise: {
      prompt: `From the list of products, print the names of those that cost more than 100, joined with a comma and a space. Then print the total of all prices. Then use destructuring to take the name and price of the first product and print them on one line.

Expected output: <code>bag, book</code>, <code>612</code>, <code>pen 12</code> (one per line)`,
      starterCode: `const products = [
  { name: "pen", price: 12 },
  { name: "bag", price: 450 },
  { name: "book", price: 150 },
];

// TODO: names of products over 100, joined with ", "

// TODO: total of all prices

// TODO: destructure name and price from the first product and log them`,
      hints: [
        'Chain <code>filter</code> and <code>map</code>, then call <code>join(", ")</code>.',
        '<code>reduce((sum, p) =&gt; sum + p.price, 0)</code> adds the prices, and <code>const { name, price } = products[0]</code> destructures.',
      ],
      solution: `const products = [
  { name: "pen", price: 12 },
  { name: "bag", price: 450 },
  { name: "book", price: 150 },
];

const expensive = products.filter((p) => p.price > 100).map((p) => p.name);
console.log(expensive.join(", "));

const total = products.reduce((sum, p) => sum + p.price, 0);
console.log(total);

const { name, price } = products[0];
console.log(name + " " + price);`,
    },
    quiz: [
      {
        question: 'What does <code>map</code> return?',
        options: ['The original array, modified', 'A new array of the same length, holding the result of the function for each item', 'undefined', 'A single value'],
        answer: 1,
        explanation: 'map does not change the original array.',
      },
      {
        question: 'What is the difference between <code>forEach</code> and <code>map</code>?',
        options: ['forEach returns undefined and is used for side effects; map returns a new array', 'There is none', 'forEach is faster', 'map changes the original array'],
        answer: 0,
        explanation: 'Use map when you need the transformed values, forEach when you only need to do something for each item.',
      },
      {
        question: 'What does <code>const copy = [...items];</code> create?',
        options: ['A second name for the same array', 'A deep copy', 'A string', 'A new array containing the same elements: a shallow copy'],
        answer: 3,
        explanation: 'Objects inside the array are still shared between the two arrays.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Explain map, filter and reduce.',
        answer: `<code>map</code> applies a function to every element and returns a new array of the results, the same length as the original. <code>filter</code> returns a new array with only the elements for which the function returns true. <code>reduce</code> combines all the elements into a single value, carrying an accumulator from one call to the next. None of them changes the original array, and they can be chained.`,
      },
      {
        question: 'What is the difference between a shallow copy and a deep copy?',
        answer: `A shallow copy, made with the spread operator or <code>Object.assign</code>, creates a new outer object or array, but nested objects are still shared with the original, so changing one changes both. A deep copy duplicates every level. <code>structuredClone(value)</code> makes a deep copy of most data; the older <code>JSON.parse(JSON.stringify(value))</code> works for plain data but loses dates, functions and <code>undefined</code>.`,
      },
    ],
  },

  'scope': {
    whyItMatters: `Scope decides where a variable can be seen. A function that accidentally changes a variable outside itself produces bugs that appear far from their cause. Understanding scope is what lets you keep data private to the code that needs it, and it is the foundation for closures.`,
    exercise: {
      prompt: `Calling <code>show</code> overwrites the outer variable, because the function assigns to it instead of declaring its own. Change the function so that it uses a local variable and the outer one keeps its value.

Expected output: <code>inner</code> then <code>outer</code>`,
      starterCode: `let message = "outer";

function show() {
  message = "inner";
  console.log(message);
}

show();
console.log(message);`,
      hints: [
        'Without a declaration, the assignment looks outward and finds the outer variable.',
        'Declaring <code>const message</code> inside the function creates a separate, local variable that shadows the outer one.',
      ],
      solution: `let message = "outer";

function show() {
  const message = "inner";
  console.log(message);
}

show();
console.log(message);`,
    },
    quiz: [
      {
        question: 'Where can a variable declared with <code>let</code> inside an <code>if</code> block be used?',
        options: ['Only inside that block', 'Anywhere in the file', 'Anywhere in the enclosing function', 'Only after the block'],
        answer: 0,
        explanation: 'let and const are block-scoped.',
      },
      {
        question: 'When code uses a name, where does JavaScript look for it first?',
        options: ['The global scope', 'The current scope, then each enclosing scope outward', 'The window object', 'The most recently run function'],
        answer: 1,
        explanation: 'This outward search is called the scope chain.',
      },
      {
        question: 'What is variable shadowing?',
        options: ['Deleting a variable', 'Declaring a variable twice in one scope', 'An inner scope declaring a variable with the same name as one in an outer scope', 'Using a variable before declaring it'],
        answer: 2,
        explanation: 'Inside the inner scope the name refers to the inner variable; the outer one is untouched.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What kinds of scope does JavaScript have?',
        answer: `Global scope, for names declared outside any function or block. Function scope, for names declared inside a function, including with <code>var</code>. Block scope, for names declared with <code>let</code> or <code>const</code> inside braces, such as a loop or an <code>if</code>. Module scope, where top-level names in a module are private to that module unless exported. JavaScript is lexically scoped: what a function can see is decided by where it is written.`,
      },
      {
        question: 'Why are global variables discouraged?',
        answer: `Any code anywhere can read or change a global, so it is hard to know what depends on it or what modified it. Two scripts that pick the same global name overwrite each other. Globals also make functions harder to test and reuse, since they depend on state outside themselves. Keeping variables in the smallest scope that needs them, and using modules, avoids these problems.`,
      },
    ],
  },

  'closures': {
    whyItMatters: `A closure is a function that remembers the variables around it after the outer function has finished. Every event handler, timer callback and React hook relies on this. It is also the single most asked concept in JavaScript interviews, so being able to explain it with a small example is worth the practice.`,
    exercise: {
      prompt: `Write <code>makeCounter</code>, which returns a function. Each call of the returned function increases a private count and returns it. Two counters made by separate calls must not affect each other.

Expected output: <code>1</code>, <code>2</code>, <code>1</code> (one per line)`,
      starterCode: `function makeCounter() {
  // TODO: a private variable, and a returned function that increases and returns it
}

const first = makeCounter();
console.log(first());
console.log(first());

const second = makeCounter();
console.log(second());`,
      hints: [
        'Declare <code>let count = 0</code> inside <code>makeCounter</code>, outside the returned function.',
        'The returned function can still read and change <code>count</code> after <code>makeCounter</code> has returned.',
      ],
      solution: `function makeCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

const first = makeCounter();
console.log(first());
console.log(first());

const second = makeCounter();
console.log(second());`,
    },
    quiz: [
      {
        question: 'What is a closure?',
        options: ['A function with no parameters', 'A way to end a program', 'A function that has finished running', 'A function together with the variables of the scope in which it was created'],
        answer: 3,
        explanation: 'The function keeps access to those variables for as long as it exists.',
      },
      {
        question: 'What do three timers created in <code>for (var i = 0; i &lt; 3; i++) setTimeout(() =&gt; console.log(i), 0)</code> print?',
        options: ['3, 3, 3', '0, 1, 2', '0, 0, 0', '2, 2, 2'],
        answer: 0,
        explanation: 'There is one shared i, and it is 3 by the time the callbacks run. With let, each iteration gets its own i and the output is 0, 1, 2.',
      },
      {
        question: 'What is a common practical use of closures?',
        options: ['Making code run faster', 'Keeping data private to a function, such as a counter or a cache', 'Avoiding the use of functions', 'Declaring global variables'],
        answer: 1,
        explanation: 'The enclosed variables cannot be reached from outside except through the returned function.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Explain closures with an example.',
        answer: `A closure is formed when a function is defined inside another and keeps access to the outer function's variables after the outer function has returned. In a counter, <code>makeCounter</code> declares <code>count</code> and returns a function that increments it. The returned function still sees <code>count</code>, and nothing else can reach it, so the value is private. Each call to <code>makeCounter</code> creates a separate <code>count</code>.`,
      },
      {
        question: 'Can closures cause memory problems?',
        answer: `Yes. Variables captured by a closure cannot be garbage-collected while the closure itself is still reachable. An event listener or timer that is never removed keeps everything it closes over alive, including large objects or DOM elements that are no longer on the page. The remedy is to remove listeners and clear timers when they are no longer needed.`,
      },
    ],
  },

  'classes': {
    whyItMatters: `Classes are the standard way to define objects that share behaviour, and you will meet them in libraries, in back-end frameworks such as NestJS, and in older React code. They are a cleaner syntax over JavaScript's prototype system, and understanding that connection is a frequent interview topic.`,
    exercise: {
      prompt: `Write a class <code>Animal</code> whose constructor stores a name, with a method <code>speak</code>. Write a class <code>Dog</code> that extends it and overrides <code>speak</code> to return the name followed by <code> barks</code>.

Expected output: <code>Rex barks</code> then <code>true</code>`,
      starterCode: `// TODO: class Animal with a constructor(name) and speak()

// TODO: class Dog extends Animal, overriding speak()

const dog = new Dog("Rex");
console.log(dog.speak());
console.log(dog instanceof Animal);`,
      hints: [
        'The subclass is declared with <code>class Dog extends Animal</code>. It inherits the constructor, so it does not need its own.',
        'Inside a method, the name is read as <code>this.name</code>.',
      ],
      solution: `class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return this.name + " makes a sound";
  }
}

class Dog extends Animal {
  speak() {
    return this.name + " barks";
  }
}

const dog = new Dog("Rex");
console.log(dog.speak());
console.log(dog instanceof Animal);`,
    },
    quiz: [
      {
        question: 'In a subclass constructor, what must happen before <code>this</code> is used?',
        options: ['Nothing', 'A return statement', 'The class must be exported', 'super() must be called'],
        answer: 3,
        explanation: 'super() runs the parent constructor, which creates the object.',
      },
      {
        question: 'Where are the methods of a class stored?',
        options: ['In the constructor', 'Copied onto each instance', 'In the global scope', 'On the prototype, shared by all instances'],
        answer: 3,
        explanation: 'Each instance looks the method up through its prototype.',
      },
      {
        question: 'What does the <code>static</code> keyword do to a method?',
        options: ['Attaches it to the class itself, not to its instances', 'Makes it faster', 'Prevents it from being overridden', 'Makes it private'],
        answer: 0,
        explanation: 'It is called as ClassName.method(), not on an object.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Are JavaScript classes the same as classes in Java?',
        answer: `No. They look similar, but JavaScript classes are syntax over prototypes. A class is a function, its methods are properties of its <code>prototype</code> object, and an instance finds a method by following its prototype chain at runtime. Inheritance with <code>extends</code> links one prototype to another. The class syntax adds conveniences such as <code>super</code>, static members and private fields written with <code>#</code>.`,
      },
      {
        question: 'What is the prototype chain?',
        answer: `Every object has an internal link to another object, its prototype. When a property is read and the object does not have it, JavaScript looks at the prototype, then at that object's prototype, and so on until it finds the property or reaches <code>null</code>. This chain is how objects inherit methods: an array finds <code>map</code> on <code>Array.prototype</code>, and <code>toString</code> further up on <code>Object.prototype</code>.`,
      },
    ],
  },

  'modern-es-features': {
    whyItMatters: `Code written since 2015 looks very different from older JavaScript. Template literals, optional chaining and nullish coalescing remove whole categories of clumsy checks, and they appear on almost every line of a current codebase. Without them you can neither read modern code nor write it concisely.`,
    exercise: {
      prompt: `Using modern syntax: read the city of a user whose <code>address</code> is missing, falling back to <code>Unknown</code>, without the code throwing; read a count that is legitimately <code>0</code>, falling back to <code>10</code> only when it is <code>null</code> or <code>undefined</code>; and build a greeting with a template literal.

Expected output: <code>Unknown</code>, <code>0</code>, <code>Hello, Asha!</code> (one per line)`,
      starterCode: `const user = { name: "Asha" }; // no address property
const settings = { count: 0 };

// TODO: the user's city, or "Unknown" (optional chaining and ??)

// TODO: settings.count, or 10 only if it is null or undefined

// TODO: "Hello, Asha!" using a template literal`,
      hints: [
        '<code>user.address?.city</code> gives <code>undefined</code> instead of throwing when <code>address</code> is missing.',
        '<code>??</code> falls back only for <code>null</code> and <code>undefined</code>, while <code>||</code> would also replace <code>0</code>.',
      ],
      solution: `const user = { name: "Asha" }; // no address property
const settings = { count: 0 };

console.log(user.address?.city ?? "Unknown");

console.log(settings.count ?? 10);

console.log(\`Hello, \${user.name}!\`);`,
    },
    quiz: [
      {
        question: 'What does <code>user?.profile?.name</code> return when <code>user</code> is <code>null</code>?',
        options: ['It throws a TypeError', 'undefined', 'null', 'An empty string'],
        answer: 1,
        explanation: 'Optional chaining stops and yields undefined as soon as it meets null or undefined.',
      },
      {
        question: 'What is the difference between <code>0 || 5</code> and <code>0 ?? 5</code>?',
        options: ['Both give 5', 'Both give 0', 'The first gives 5 and the second gives 0', 'The first gives 0 and the second gives 5'],
        answer: 2,
        explanation: '|| replaces any falsy value; ?? replaces only null and undefined.',
      },
      {
        question: 'Which characters delimit a template literal?',
        options: ['Angle brackets', 'Single quotes', 'Double quotes', 'Backticks'],
        answer: 3,
        explanation: 'Inside it, an expression is written as ${...}, and the text may span several lines.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between || and ?? for default values?',
        answer: `<code>a || b</code> returns <code>b</code> whenever <code>a</code> is falsy, which includes <code>0</code>, an empty string and <code>false</code> as well as <code>null</code> and <code>undefined</code>. <code>a ?? b</code> returns <code>b</code> only when <code>a</code> is <code>null</code> or <code>undefined</code>. Use <code>??</code> when zero, an empty string or false are valid values that should be kept.`,
      },
      {
        question: 'Name some important features added in ES6 and later.',
        answer: `<code>let</code> and <code>const</code>, arrow functions, template literals, destructuring, default and rest parameters, the spread operator, classes, modules with <code>import</code> and <code>export</code>, promises, and <code>Map</code> and <code>Set</code> came with ES6 in 2015. Later versions added <code>async</code> and <code>await</code>, optional chaining, nullish coalescing, and array methods such as <code>includes</code>, <code>flat</code> and <code>at</code>.`,
      },
    ],
  },

  'event-loop-concepts': {
    whyItMatters: `JavaScript runs on a single thread, yet it handles timers, clicks and network responses without freezing. The event loop is how. It explains why a <code>setTimeout</code> of zero does not run immediately and why a long calculation locks the page, and predicting the order of output is a classic interview exercise.`,
    exercise: {
      prompt: `Replace each <code>0</code> placeholder with one of the numbers 1 to 4, each used once, so that the program prints them in ascending order. Work out the order from the rules: synchronous code first, then microtasks, then timers.

Expected output: <code>1</code>, <code>2</code>, <code>3</code>, <code>4</code> (one per line)`,
      starterCode: `console.log(0); // TODO

setTimeout(() => console.log(0), 0); // TODO

Promise.resolve().then(() => console.log(0)); // TODO

console.log(0); // TODO`,
      hints: [
        'The two plain <code>console.log</code> calls run first, in the order they are written.',
        'A promise callback is a microtask and runs before a timer callback, even a timer of 0 milliseconds.',
      ],
      solution: `console.log(1);

setTimeout(() => console.log(4), 0);

Promise.resolve().then(() => console.log(3));

console.log(2);`,
    },
    quiz: [
      {
        question: 'How many things can JavaScript execute at the same moment on its main thread?',
        options: ['One', 'Two', 'Unlimited', 'As many as there are CPU cores'],
        answer: 0,
        explanation: 'There is a single call stack. Waiting is handed to the browser or to Node.js.',
      },
      {
        question: 'Which runs first once the current synchronous code has finished?',
        options: ['Timer callbacks', 'Microtasks, such as promise callbacks', 'Click handlers', 'Whichever was created first'],
        answer: 1,
        explanation: 'The whole microtask queue is emptied before the next task is taken.',
      },
      {
        question: 'What happens to the page while a long synchronous loop is running?',
        options: ['The loop runs in the background', 'It keeps working normally', 'It cannot respond to clicks or repaint until the loop ends', 'The browser splits the loop across threads'],
        answer: 2,
        explanation: 'Nothing else can use the call stack until the current code finishes.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How does the event loop work?',
        answer: `JavaScript has one call stack and runs one piece of code at a time. Operations that wait, such as timers and network requests, are handled outside the stack by the browser or Node.js; when one completes, its callback is placed in a queue. The event loop checks whether the stack is empty, runs all pending microtasks, and then takes the next task from the task queue and runs it to completion. Then it repeats.`,
      },
      {
        question: 'What is the difference between microtasks and macrotasks?',
        answer: `Microtasks are callbacks of promises, including the code after an <code>await</code>, and those queued with <code>queueMicrotask</code>. Macrotasks, also called tasks, are timer callbacks, user events and I/O callbacks. After each task finishes, the entire microtask queue is drained before the next task starts or the page is rendered. That is why a resolved promise's callback runs before a <code>setTimeout</code> of zero.`,
      },
    ],
  },

  'dom': {
    whyItMatters: `The DOM is the page as JavaScript sees it: a tree of objects that can be read and changed. Every interactive feature, from showing an error message to building a list from API data, comes down to selecting elements and modifying them. Frameworks do this for you, but they do it through the same DOM.`,
    exercise: {
      prompt: `Using the DOM, change the text of the heading to <code>DOM practice</code>, add the class <code>highlight</code> to the paragraph, and create a new paragraph containing <code>Added by JavaScript</code> and append it to <code>main</code>.

Expected result: the heading reads DOM practice, and a new paragraph appears at the bottom of the page.`,
      starterCode: `// The page contains: <main> with an <h1>, a <p> and a <button>

// TODO: change the heading text

// TODO: add the class "highlight" to the existing paragraph

// TODO: create a paragraph with the text "Added by JavaScript" and append it to main`,
      hints: [
        '<code>document.querySelector("h1")</code> returns the first matching element, and <code>textContent</code> sets its text.',
        'Create with <code>document.createElement("p")</code>, then attach it with <code>append</code>.',
      ],
      solution: `// The page contains: <main> with an <h1>, a <p> and a <button>

document.querySelector("h1").textContent = "DOM practice";

document.querySelector("p").classList.add("highlight");

const paragraph = document.createElement("p");
paragraph.textContent = "Added by JavaScript";
document.querySelector("main").append(paragraph);`,
    },
    quiz: [
      {
        question: 'What does <code>document.querySelectorAll(".item")</code> return?',
        options: ['The first matching element', 'An array', 'A string of HTML', 'A NodeList of every matching element'],
        answer: 3,
        explanation: 'A NodeList can be looped over with forEach, but it is not an array.',
      },
      {
        question: 'Why is <code>textContent</code> safer than <code>innerHTML</code> for showing text typed by a user?',
        options: ['It treats the value as plain text, so any markup in it is not executed', 'It is faster to type', 'It supports more browsers', 'innerHTML cannot show text'],
        answer: 0,
        explanation: 'Putting untrusted input into innerHTML can run an attacker\'s script: cross-site scripting.',
      },
      {
        question: 'What does <code>document.querySelector("#menu")</code> return when no element matches?',
        options: ['undefined', 'null', 'It throws an error', 'An empty NodeList'],
        answer: 1,
        explanation: 'Using the result without checking is the cause of "cannot read properties of null".',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the DOM?',
        answer: `The Document Object Model is the browser's representation of a page as a tree of objects, one for each element, attribute and piece of text. It is built from the HTML when the page loads. JavaScript uses the DOM API to find nodes, read and change their content, attributes and styles, add and remove nodes, and listen for events. Changing the DOM changes what is shown on screen.`,
      },
      {
        question: 'What is the difference between innerHTML, textContent and innerText?',
        answer: `<code>innerHTML</code> reads or sets the content as HTML, so tags in the string become elements; it must never be given untrusted input. <code>textContent</code> reads or sets the raw text of the node and all its descendants, treating everything as text. <code>innerText</code> returns only the text that is visibly rendered, taking CSS into account, which makes it slower. For plain text, <code>textContent</code> is the usual choice.`,
      },
    ],
  },

  'events': {
    whyItMatters: `A web page does nothing until the user acts: clicks, types, scrolls, submits. Events are how code responds. Event delegation, where one listener on a parent handles all its children, is how lists of any length are handled efficiently, and how events travel through the page is a standard interview question.`,
    exercise: {
      prompt: `Count clicks on the button and show the count in the paragraph as <code>Clicked 1 times</code>, <code>Clicked 2 times</code> and so on. Attach a single listener to <code>main</code> and act only when the element that was clicked is the button.

Expected result: clicking the button updates the paragraph; clicking the heading or the paragraph does nothing.`,
      starterCode: `// The page contains: <main> with an <h1>, a <p> and a <button>

let count = 0;
const main = document.querySelector("main");
const output = document.querySelector("p");

// TODO: one click listener on main that reacts only to clicks on the button`,
      hints: [
        '<code>event.target</code> is the element that was actually clicked.',
        '<code>event.target.matches("button")</code> tests whether that element is a button.',
      ],
      solution: `// The page contains: <main> with an <h1>, a <p> and a <button>

let count = 0;
const main = document.querySelector("main");
const output = document.querySelector("p");

main.addEventListener("click", (event) => {
  if (!event.target.matches("button")) return;
  count += 1;
  output.textContent = "Clicked " + count + " times";
});`,
    },
    quiz: [
      {
        question: 'What is event bubbling?',
        options: ['An event being cancelled', 'An event firing twice', 'An event travelling from the target element up through its ancestors', 'An event travelling from the document down to the target'],
        answer: 2,
        explanation: 'The downward journey is the capturing phase, which listeners can opt into.',
      },
      {
        question: 'What does <code>event.preventDefault()</code> do?',
        options: ['Stops the event from reaching other elements', 'Removes the listener', 'Reloads the page', 'Stops the browser\'s default action, such as following a link or submitting a form'],
        answer: 3,
        explanation: 'Stopping propagation is a separate method, event.stopPropagation().',
      },
      {
        question: 'Why is <code>addEventListener</code> preferred to an <code>onclick</code> attribute in the HTML?',
        options: ['It keeps behaviour out of the markup and allows several listeners on one element', 'It is the only one that works', 'It runs faster', 'It prevents bubbling'],
        answer: 0,
        explanation: 'Listeners can also be removed again with removeEventListener.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is event delegation and why use it?',
        answer: `Instead of attaching a listener to every child element, one listener is attached to a common ancestor. Because events bubble, a click on any child reaches the ancestor, where <code>event.target</code> identifies which child was clicked. It uses one listener in place of hundreds, and it works for children added later, since no listener has to be attached to them. It is the standard way to handle lists and tables.`,
      },
      {
        question: 'What is the difference between event.target and event.currentTarget?',
        answer: `<code>event.target</code> is the element on which the event originated, the one the user actually clicked. <code>event.currentTarget</code> is the element whose listener is currently running. With a listener on a list and a click on one of its items, <code>target</code> is the item and <code>currentTarget</code> is the list. They are the same only when the listener is on the element that was clicked.`,
      },
    ],
  },

  'modules': {
    whyItMatters: `Real applications are split across many files, and modules are how those files share code without polluting the global scope. Every React, Vue or Node.js project is built from <code>import</code> and <code>export</code> statements. Knowing named and default exports is necessary to read the first line of almost any modern source file.`,
    exercise: {
      prompt: `In a project the module would be a separate file. Here its source is held in a string and loaded with a dynamic <code>import()</code> so that the exercise runs in one file. Add the <code>export</code> keywords so that <code>PI</code> and <code>area</code> are named exports and <code>describe</code> is the default export, then log each of them.

Expected output: <code>3.14</code>, <code>12.56</code>, <code>circle tools</code> (one per line)`,
      starterCode: `// TODO: add "export" (and "export default") to the three declarations
const source =
  "const PI = 3.14;" +
  "function area(r) { return PI * r * r; }" +
  "function describe() { return 'circle tools'; }";

import("data:text/javascript," + encodeURIComponent(source)).then((module) => {
  // TODO: log the named export PI
  // TODO: log area(2)
  // TODO: log the result of calling the default export
});`,
      hints: [
        'A named export is written <code>export const PI = ...</code>, and the default export <code>export default function describe() { ... }</code>.',
        'On the module object, named exports are properties with their own names, and the default export is the property <code>default</code>.',
      ],
      solution: `const source =
  "export const PI = 3.14;" +
  "export function area(r) { return PI * r * r; }" +
  "export default function describe() { return 'circle tools'; }";

import("data:text/javascript," + encodeURIComponent(source)).then((module) => {
  console.log(module.PI);
  console.log(module.area(2));
  console.log(module.default());
});`,
    },
    quiz: [
      {
        question: 'How many default exports can one module have?',
        options: ['None', 'Two', 'Any number', 'One'],
        answer: 3,
        explanation: 'A module can have one default export and any number of named exports.',
      },
      {
        question: 'How is a named export called <code>add</code> imported?',
        options: ['require add from "./math.js"', 'import add from "./math.js"', 'import { add } from "./math.js"', 'include add "./math.js"'],
        answer: 2,
        explanation: 'Named imports use braces and must match the exported name. A default import has no braces.',
      },
      {
        question: 'How do you rename an import to avoid a clash with a local name?',
        options: ['import { add = sum } from "./math.js"', 'It cannot be renamed', 'import { add: sum } from "./math.js"', 'import { add as sum } from "./math.js"'],
        answer: 3,
        explanation: 'The as keyword gives the import a different local name.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between named and default exports?',
        answer: `A module can have many named exports, each imported by its exact name inside braces: <code>import { add, subtract } from "./math.js"</code>. It can have one default export, imported without braces under any name the importer chooses: <code>import calculate from "./math.js"</code>. Named exports give consistent names across a codebase and better editor support; default exports suit a module whose purpose is one main thing.`,
      },
      {
        question: 'What is the difference between ES modules and CommonJS?',
        answer: `ES modules are the standard of the language: <code>import</code> and <code>export</code>, resolved statically before the code runs, which allows tools to remove unused code, and supported by browsers and Node.js. CommonJS is the older Node.js system: <code>require()</code> and <code>module.exports</code>, loaded synchronously at runtime. New code uses ES modules; CommonJS is still found in many existing Node.js packages.`,
      },
    ],
  },

  'local-storage': {
    whyItMatters: `A dark-mode choice, a shopping cart or a half-written form should survive a page reload. <code>localStorage</code> keeps small pieces of data in the browser with a very simple API. Its two traps are that it stores only strings, and that it is never the place for anything secret.`,
    exercise: {
      prompt: `The playground preview does not allow real storage, so a stand-in object with the same <code>getItem</code> and <code>setItem</code> methods is provided; the code is identical with <code>localStorage</code>. Write <code>savePrefs</code>, which stores an object under the key <code>prefs</code>, and <code>loadPrefs</code>, which returns the stored object, or <code>{ theme: "light" }</code> when nothing is stored.

Expected output: <code>light</code>, <code>dark</code>, <code>string</code> (one per line)`,
      starterCode: `// Stand-in for localStorage, with the same two methods
const storage = {
  data: {},
  getItem(key) { return key in this.data ? this.data[key] : null; },
  setItem(key, value) { this.data[key] = String(value); },
};

function savePrefs(prefs) {
  // TODO: store the object as JSON under the key "prefs"
}

function loadPrefs() {
  // TODO: return the stored object, or { theme: "light" } if there is none
}

console.log(loadPrefs().theme);
savePrefs({ theme: "dark" });
console.log(loadPrefs().theme);
console.log(typeof storage.getItem("prefs"));`,
      hints: [
        'Storage holds only strings, so convert with <code>JSON.stringify</code> when saving and <code>JSON.parse</code> when loading.',
        '<code>getItem</code> returns <code>null</code> for a key that has not been set.',
      ],
      solution: `// Stand-in for localStorage, with the same two methods
const storage = {
  data: {},
  getItem(key) { return key in this.data ? this.data[key] : null; },
  setItem(key, value) { this.data[key] = String(value); },
};

function savePrefs(prefs) {
  storage.setItem("prefs", JSON.stringify(prefs));
}

function loadPrefs() {
  const raw = storage.getItem("prefs");
  return raw ? JSON.parse(raw) : { theme: "light" };
}

console.log(loadPrefs().theme);
savePrefs({ theme: "dark" });
console.log(loadPrefs().theme);
console.log(typeof storage.getItem("prefs"));`,
    },
    quiz: [
      {
        question: 'What type of value does <code>localStorage</code> store?',
        options: ['Only strings', 'Only numbers', 'Any JavaScript value', 'Only objects'],
        answer: 0,
        explanation: 'Other values are converted to strings, so objects must be saved as JSON.',
      },
      {
        question: 'What is the difference between <code>localStorage</code> and <code>sessionStorage</code>?',
        options: ['localStorage persists until it is cleared; sessionStorage is cleared when the tab is closed', 'sessionStorage is larger', 'localStorage is sent to the server', 'There is none'],
        answer: 0,
        explanation: 'sessionStorage is also separate for each tab.',
      },
      {
        question: 'What does <code>localStorage.getItem("missing")</code> return?',
        options: ['undefined', 'An empty string', 'null', 'It throws an error'],
        answer: 2,
        explanation: 'Check for null before parsing or using the value.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the differences between localStorage, sessionStorage and cookies?',
        answer: `<code>localStorage</code> holds about 5 MB per origin, has no expiry, and is shared by all tabs of the same origin. <code>sessionStorage</code> has the same API but lasts only for the life of one tab. Cookies are limited to about 4 KB each, can be given an expiry, and are sent to the server with every request, which is why they are used for sessions. Cookies can also be marked <code>HttpOnly</code> so that JavaScript cannot read them.`,
      },
      {
        question: 'Why should authentication tokens not be kept in localStorage?',
        answer: `Any JavaScript running on the page can read <code>localStorage</code>, so a single cross-site scripting flaw, or a compromised third-party script, lets an attacker steal the token and impersonate the user. A cookie marked <code>HttpOnly</code>, <code>Secure</code> and <code>SameSite</code> cannot be read by scripts and is the safer place for session tokens. <code>localStorage</code> is for non-sensitive preferences and cached data.`,
      },
    ],
  },

  'promises': {
    whyItMatters: `Anything that takes time in JavaScript, such as a network request, a timer or reading a file, gives back a promise: an object standing for a result that is not ready yet. Promises replaced deeply nested callbacks, and <code>async</code> and <code>await</code> are built directly on top of them, so they cannot be skipped.`,
    exercise: {
      prompt: `Write <code>delay</code>, which returns a promise that resolves with the given value after the given number of milliseconds. The code below then handles a rejected promise with <code>catch</code> and <code>finally</code>, and waits for two delays together with <code>Promise.all</code>.

Expected output: <code>boom</code>, <code>done</code>, <code>ab</code> (one per line)`,
      starterCode: `function delay(ms, value) {
  // TODO: return a promise that resolves with value after ms milliseconds
}

Promise.reject(new Error("boom"))
  .catch((error) => console.log(error.message))
  .finally(() => console.log("done"));

Promise.all([delay(20, "a"), delay(10, "b")])
  .then((values) => console.log(values.join("")));`,
      hints: [
        'A promise is created with <code>new Promise((resolve) =&gt; { ... })</code>.',
        'Inside it, <code>setTimeout(() =&gt; resolve(value), ms)</code> resolves the promise after the delay.',
      ],
      solution: `function delay(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

Promise.reject(new Error("boom"))
  .catch((error) => console.log(error.message))
  .finally(() => console.log("done"));

Promise.all([delay(20, "a"), delay(10, "b")])
  .then((values) => console.log(values.join("")));`,
    },
    quiz: [
      {
        question: 'What are the three states of a promise?',
        options: ['Open, closed, failed', 'Waiting, active, complete', 'Start, running, done', 'Pending, fulfilled, rejected'],
        answer: 3,
        explanation: 'A promise starts pending and settles once, as either fulfilled or rejected.',
      },
      {
        question: 'In what order does <code>Promise.all</code> return its results?',
        options: ['The order of the promises in the input array', 'Random order', 'The order in which the promises finished', 'Alphabetical order'],
        answer: 0,
        explanation: 'The order of the array is kept, whichever promise settles first.',
      },
      {
        question: 'What happens to <code>Promise.all</code> if one of its promises rejects?',
        options: ['It ignores that promise', 'It rejects immediately with that error', 'It waits for the others and returns partial results', 'It retries the failed promise'],
        answer: 1,
        explanation: 'Use Promise.allSettled to wait for every promise and get each outcome.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a promise and what problem does it solve?',
        answer: `A promise is an object representing the eventual result of an asynchronous operation. It is pending at first and later becomes fulfilled with a value or rejected with an error. Handlers are attached with <code>then</code>, <code>catch</code> and <code>finally</code>, and because each returns a new promise they can be chained. Promises replaced nested callbacks, known as callback hell, with a flat chain and a single place to handle errors.`,
      },
      {
        question: 'What is the difference between Promise.all, allSettled, race and any?',
        answer: `<code>Promise.all</code> fulfils with an array of all the values, or rejects as soon as one promise rejects. <code>Promise.allSettled</code> always waits for every promise and reports the outcome of each. <code>Promise.race</code> settles as soon as the first promise settles, whether it fulfils or rejects. <code>Promise.any</code> fulfils with the first promise to fulfil and rejects only if all of them reject.`,
      },
    ],
  },

  'async-await': {
    whyItMatters: `<code>async</code> and <code>await</code> let asynchronous code be written top to bottom like ordinary code, with normal <code>try</code> and <code>catch</code> for errors. It is the form in which almost all API calls are written today. One common mistake is awaiting independent operations one after another when they could run together, which doubles the waiting time.`,
    exercise: {
      prompt: `<code>fetchUser</code> is a stand-in for an API call: it resolves with a user for id 1 and rejects for any other id. Write the async function <code>loadName</code>, which returns the user's name, or the text <code>not found</code> when the request fails.

Expected output: <code>Asha</code> then <code>not found</code>`,
      starterCode: `function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 1) resolve({ id: 1, name: "Asha" });
      else reject(new Error("no such user"));
    }, 10);
  });
}

async function loadName(id) {
  // TODO: await fetchUser(id) and return the name; return "not found" on failure
}

async function main() {
  console.log(await loadName(1));
  console.log(await loadName(2));
}

main();`,
      hints: [
        'Put the <code>await</code> inside a <code>try</code> block; a rejected promise is thrown as an exception at the <code>await</code>.',
        'Return <code>"not found"</code> from the <code>catch</code> block.',
      ],
      solution: `function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 1) resolve({ id: 1, name: "Asha" });
      else reject(new Error("no such user"));
    }, 10);
  });
}

async function loadName(id) {
  try {
    const user = await fetchUser(id);
    return user.name;
  } catch (error) {
    return "not found";
  }
}

async function main() {
  console.log(await loadName(1));
  console.log(await loadName(2));
}

main();`,
    },
    quiz: [
      {
        question: 'What does an <code>async</code> function always return?',
        options: ['undefined', 'A callback', 'A promise', 'The value directly'],
        answer: 2,
        explanation: 'A returned value becomes the fulfilled value of that promise.',
      },
      {
        question: 'What does <code>await</code> do?',
        options: ['Cancels the promise', 'Blocks the whole program', 'Creates a new thread', 'Pauses the async function until the promise settles, without blocking the rest of the program'],
        answer: 3,
        explanation: 'Other code, such as event handlers, keeps running while the function is paused.',
      },
      {
        question: 'Two independent requests each take one second. How should they be awaited to finish in about one second?',
        options: ['await Promise.all([first(), second()])', 'await first(); await second();', 'first(); second();', 'await first() + second()'],
        answer: 0,
        explanation: 'Awaiting them one after the other takes about two seconds.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do async and await relate to promises?',
        answer: `They are syntax built on promises. An <code>async</code> function always returns a promise. <code>await</code> pauses the function until the promise it is given settles, then gives back the fulfilled value or throws the rejection as an exception, which <code>try</code> and <code>catch</code> can handle. The code after an <code>await</code> behaves like the callback of a <code>then</code>. The result reads like synchronous code.`,
      },
      {
        question: 'What are common mistakes with async and await?',
        answer: `Forgetting <code>await</code>, so that a promise is used where its value was intended. Awaiting independent operations in sequence instead of with <code>Promise.all</code>. Using <code>await</code> inside <code>forEach</code>, which does not wait; a <code>for...of</code> loop or <code>Promise.all</code> with <code>map</code> is needed. And leaving out error handling, so that a rejection goes unhandled.`,
      },
    ],
  },

  'fetch': {
    whyItMatters: `<code>fetch</code> is how a web page talks to a server: loading data, submitting forms, calling APIs. Its biggest surprise is that an error response such as 404 or 500 does not reject the promise, so code that skips the status check happily processes an error page as if it were data.`,
    exercise: {
      prompt: `<code>fakeFetch</code> behaves like <code>fetch</code> but needs no network: it resolves with a response object that has <code>ok</code>, <code>status</code> and a <code>json()</code> method. Write <code>getJson</code>, which returns the parsed body when the response is ok and otherwise throws an error whose message is <code>HTTP </code> followed by the status.

Expected output: <code>Asha</code> then <code>HTTP 404</code>`,
      starterCode: `function fakeFetch(url) {
  const found = url === "/users/1";
  return Promise.resolve({
    ok: found,
    status: found ? 200 : 404,
    json: () => Promise.resolve(found ? { name: "Asha" } : {}),
  });
}

async function getJson(url) {
  // TODO: call fakeFetch, throw "HTTP <status>" if the response is not ok,
  //       otherwise return the parsed JSON
}

async function main() {
  const user = await getJson("/users/1");
  console.log(user.name);

  try {
    await getJson("/users/99");
  } catch (error) {
    console.log(error.message);
  }
}

main();`,
      hints: [
        'Test <code>response.ok</code> before reading the body.',
        '<code>response.json()</code> returns a promise, so it must be awaited too.',
      ],
      solution: `function fakeFetch(url) {
  const found = url === "/users/1";
  return Promise.resolve({
    ok: found,
    status: found ? 200 : 404,
    json: () => Promise.resolve(found ? { name: "Asha" } : {}),
  });
}

async function getJson(url) {
  const response = await fakeFetch(url);
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }
  return await response.json();
}

async function main() {
  const user = await getJson("/users/1");
  console.log(user.name);

  try {
    await getJson("/users/99");
  } catch (error) {
    console.log(error.message);
  }
}

main();`,
    },
    quiz: [
      {
        question: 'The server responds with status 404. What happens to the promise returned by <code>fetch</code>?',
        options: ['It rejects', 'It fulfils with a response whose ok property is false', 'It stays pending', 'It retries the request'],
        answer: 1,
        explanation: 'fetch rejects only for network failures. The status must be checked by the code.',
      },
      {
        question: 'What does <code>response.json()</code> return?',
        options: ['A JSON string', 'The parsed object directly', 'A promise that resolves with the parsed body', 'The status code'],
        answer: 2,
        explanation: 'Reading the body is asynchronous, so it needs its own await.',
      },
      {
        question: 'How is JSON sent in the body of a POST request with <code>fetch</code>?',
        options: ['body: data', 'data: JSON.parse(data)', 'json: data', 'body: JSON.stringify(data), with a Content-Type header of application/json'],
        answer: 3,
        explanation: 'The body must be a string, and the header tells the server how to read it.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you handle errors correctly with fetch?',
        answer: `Two kinds of failure need handling. A network failure, such as no connection or a blocked request, rejects the promise and is caught with <code>try</code> and <code>catch</code>. An HTTP error status, such as 404 or 500, does not reject: the promise fulfils, so the code must check <code>response.ok</code> or <code>response.status</code> and throw an error itself. Only after that check should the body be parsed.`,
      },
      {
        question: 'What is CORS?',
        answer: `Cross-Origin Resource Sharing is the browser mechanism that controls requests from a page to a different origin. By default the browser blocks a script from reading such a response. The server allows it by sending headers such as <code>Access-Control-Allow-Origin</code> naming the permitted origins. For some requests the browser first sends an <code>OPTIONS</code> preflight to ask permission. CORS is configured on the server and cannot be bypassed from front-end code.`,
      },
    ],
  },

  'error-handling': {
    whyItMatters: `Errors will happen: bad input, failed requests, unexpected data. Code that does not handle them shows the user a blank or frozen page. Handling them well means catching what you can recover from, reporting the rest clearly, and never swallowing an error silently so that the problem becomes invisible.`,
    exercise: {
      prompt: `Define a <code>ValidationError</code> class that extends <code>Error</code> and sets its <code>name</code>. Write <code>parseAge</code>, which converts text to a number and throws a <code>ValidationError</code> with the message <code>age must be a number</code> when the text is not numeric. The code below catches the error and always prints <code>done</code> at the end.

Expected output: <code>25</code>, <code>ValidationError: age must be a number</code>, <code>done</code> (one per line)`,
      starterCode: `// TODO: class ValidationError extends Error, with name "ValidationError"

function parseAge(text) {
  // TODO: return the number, or throw a ValidationError if it is not a number
}

try {
  console.log(parseAge("25"));
  console.log(parseAge("abc"));
} catch (error) {
  console.log(error.name + ": " + error.message);
} finally {
  console.log("done");
}`,
      hints: [
        'In the constructor, call <code>super(message)</code> and then set <code>this.name = "ValidationError"</code>.',
        '<code>Number("abc")</code> gives <code>NaN</code>, which is detected with <code>Number.isNaN</code>.',
      ],
      solution: `class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function parseAge(text) {
  const age = Number(text);
  if (Number.isNaN(age)) {
    throw new ValidationError("age must be a number");
  }
  return age;
}

try {
  console.log(parseAge("25"));
  console.log(parseAge("abc"));
} catch (error) {
  console.log(error.name + ": " + error.message);
} finally {
  console.log("done");
}`,
    },
    quiz: [
      {
        question: 'When does a <code>finally</code> block run?',
        options: ['Always, whether or not an error was thrown', 'Only when an error was thrown', 'Only when no error was thrown', 'Only if there is no catch block'],
        answer: 0,
        explanation: 'It is used for clean-up such as hiding a loading indicator.',
      },
      {
        question: 'Can a <code>try...catch</code> around a <code>setTimeout</code> call catch an error thrown inside the timer\'s callback?',
        options: ['Yes', 'No; the callback runs later, after the try block has finished', 'Only in Node.js', 'Only for TypeErrors'],
        answer: 1,
        explanation: 'The error has to be handled inside the callback, or the code written with promises and await.',
      },
      {
        question: 'What should be thrown when something goes wrong?',
        options: ['A number', 'A string', 'An Error object, or an instance of a subclass of Error', 'null'],
        answer: 2,
        explanation: 'An Error carries a message and a stack trace, which a plain string does not.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you handle errors in asynchronous code?',
        answer: `With promises, attach a <code>catch</code> handler to the end of the chain. With <code>async</code> and <code>await</code>, wrap the awaited calls in <code>try</code> and <code>catch</code>, because a rejected promise is thrown at the <code>await</code>. A plain <code>try</code> block does not catch errors thrown later inside callbacks. Unhandled rejections can be observed globally with the <code>unhandledrejection</code> event, as a last line of defence for logging.`,
      },
      {
        question: 'Why create custom error classes?',
        answer: `They let the calling code tell kinds of failure apart with <code>instanceof</code> or the <code>name</code> property, and respond differently: show a message for a validation error, retry a network error, report an unexpected one. A custom error can also carry extra data, such as a field name or a status code. Extending <code>Error</code> keeps the message and stack trace.`,
      },
    ],
  },

  'debugging': {
    whyItMatters: `Developers spend far more time finding out why code misbehaves than writing it. Guessing and scattering <code>console.log</code> everywhere works slowly; a breakpoint that pauses the program and shows every variable works fast. Debugging methodically is one of the clearest differences between a beginner and an experienced developer.`,
    exercise: {
      prompt: `<code>average</code> should return 20 for the numbers 10, 20 and 30, but it prints <code>NaN</code>. Find the bug by logging the value of <code>total</code> on each pass, or by pausing with <code>debugger</code>, and fix it.

Expected output: <code>20</code>`,
      starterCode: `function average(numbers) {
  let total = 0;
  for (let i = 0; i <= numbers.length; i++) {
    total += numbers[i];
  }
  return total / numbers.length;
}

console.log(average([10, 20, 30]));`,
      hints: [
        'On the last pass, <code>numbers[i]</code> is <code>undefined</code>, and adding <code>undefined</code> to a number gives <code>NaN</code>.',
        'The last valid index is <code>numbers.length - 1</code>, so the condition should use <code>&lt;</code>.',
      ],
      solution: `function average(numbers) {
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total / numbers.length;
}

console.log(average([10, 20, 30]));`,
    },
    quiz: [
      {
        question: 'What does the <code>debugger</code> statement do when DevTools is open?',
        options: ['Prints the stack trace', 'Deletes all breakpoints', 'Restarts the script', 'Pauses execution at that line, like a breakpoint'],
        answer: 3,
        explanation: 'With DevTools closed it has no effect.',
      },
      {
        question: 'Which console method displays an array of objects as a table?',
        options: ['console.table', 'console.grid', 'console.list', 'console.dir'],
        answer: 0,
        explanation: 'It is much easier to scan than nested log output.',
      },
      {
        question: 'While paused at a breakpoint, what does "Step over" do?',
        options: ['Skips the rest of the function', 'Runs the current line and pauses at the next one, without entering functions it calls', 'Removes the breakpoint', 'Restarts the page'],
        answer: 1,
        explanation: '"Step into" enters the called function, and "Step out" finishes the current one.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How do you debug a JavaScript problem?',
        answer: `Reproduce it reliably and read the error message and stack trace in the Console. Form a guess about the cause and test it: set a breakpoint in the Sources panel just before the failure, step through the code, and compare the actual values of variables with the ones expected. Check the Network panel if data from a server is involved. Narrow the problem down until the first wrong value is found, then fix the cause.`,
      },
      {
        question: 'When would you use a breakpoint instead of console.log?',
        answer: `<code>console.log</code> is quick for confirming a single value. A breakpoint is better when the cause is unknown: it pauses the program and exposes every variable in scope and the whole call stack, lets you step line by line, and needs no code change or reload for each new question. Conditional breakpoints pause only when an expression is true, which helps inside loops.`,
      },
    ],
  },

  'testing-fundamentals': {
    whyItMatters: `A change that fixes one thing often breaks another, and without tests nobody notices until a user does. Automated tests check the behaviour of code in seconds, every time it changes. Teams expect code to come with tests, and writing testable functions makes the code itself simpler.`,
    exercise: {
      prompt: `A tiny test runner is provided: <code>test</code> runs a function and prints PASS or FAIL, and <code>expectEqual</code> throws when two values differ. Write <code>isEven</code>, and two tests for it that follow the arrange, act, assert pattern.

Expected output: <code>PASS isEven returns true for 4</code> then <code>PASS isEven returns false for 7</code>`,
      starterCode: `function test(name, fn) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (error) {
    console.log("FAIL " + name + ": " + error.message);
  }
}

function expectEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error("expected " + expected + " but got " + actual);
  }
}

function isEven(number) {
  // TODO
}

// TODO: test "isEven returns true for 4"

// TODO: test "isEven returns false for 7"`,
      hints: [
        'A number is even when <code>number % 2 === 0</code>.',
        'Each test calls the function with an input and passes the result to <code>expectEqual</code> with the expected value.',
      ],
      solution: `function test(name, fn) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (error) {
    console.log("FAIL " + name + ": " + error.message);
  }
}

function expectEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error("expected " + expected + " but got " + actual);
  }
}

function isEven(number) {
  return number % 2 === 0;
}

test("isEven returns true for 4", () => {
  const input = 4;
  const result = isEven(input);
  expectEqual(result, true);
});

test("isEven returns false for 7", () => {
  const input = 7;
  const result = isEven(input);
  expectEqual(result, false);
});`,
    },
    quiz: [
      {
        question: 'What are the three steps of the Arrange-Act-Assert pattern?',
        options: ['Write, run, deploy', 'Import, export, test', 'Set up the inputs, call the code under test, check the result', 'Plan, code, review'],
        answer: 2,
        explanation: 'Keeping the three steps distinct makes a test easy to read.',
      },
      {
        question: 'What does a unit test check?',
        options: ['The visual design', 'The whole application running in a browser', 'The speed of the server', 'One small piece of code, such as a function, in isolation'],
        answer: 3,
        explanation: 'Tests of several parts working together are integration tests; tests of full user journeys are end-to-end tests.',
      },
      {
        question: 'Which is a sign of a good unit test?',
        options: ['It depends on the test that ran before it', 'It needs a network connection', 'It is fast, independent of other tests and gives the same result every time', 'It checks many unrelated things at once'],
        answer: 2,
        explanation: 'A test that sometimes passes and sometimes fails cannot be trusted.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between unit, integration and end-to-end tests?',
        answer: `A unit test checks one function or component in isolation; it is fast and pinpoints failures. An integration test checks that several units work together, such as a component with its API layer. An end-to-end test drives the whole application through a real browser as a user would; it gives the most confidence but is the slowest and the most fragile. A healthy test suite has many unit tests, fewer integration tests and a small number of end-to-end tests.`,
      },
      {
        question: 'What is a mock and when is it used?',
        answer: `A mock is a stand-in for a real dependency, such as an API client, a database or a timer, that returns controlled values and records how it was called. It lets a unit test run quickly and predictably without the network, and makes it possible to simulate failures. Over-mocking is a risk: a test that mocks everything can pass while the real pieces do not fit together.`,
      },
    ],
  },

  'introduction-to-typescript': {
    whyItMatters: `TypeScript adds types to JavaScript and checks them before the code runs, which catches misspelled properties, missing arguments and <code>undefined</code> values while you type. Most new front-end and Node.js projects use it, and most job listings for JavaScript roles now ask for it.`,
    exercise: {
      runnable: false,
      prompt: `This exercise is TypeScript, so it needs the TypeScript compiler or an online TypeScript playground; the JavaScript playground here cannot run it. Declare an interface <code>Product</code> with a <code>name</code> that is a string and a <code>price</code> that is a number. Write a function <code>total</code> that takes an array of products and returns a number. Then see what the compiler says about the commented-out call.

Expected result: the program prints <code>162</code>, and uncommenting the last line gives a compile-time error because <code>price</code> is a string.`,
      starterCode: `// TODO: interface Product

// TODO: function total(items) with type annotations for the parameter and the return value

console.log(total([{ name: "pen", price: 12 }, { name: "book", price: 150 }]));

// console.log(total([{ name: "bag", price: "450" }]));`,
      hints: [
        'An interface lists property names and types: <code>interface Product { name: string; price: number; }</code>.',
        'An array of products is written <code>Product[]</code>, and the return type follows the parameter list after a colon.',
      ],
      solution: `interface Product {
  name: string;
  price: number;
}

function total(items: Product[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

console.log(total([{ name: "pen", price: 12 }, { name: "book", price: 150 }]));

// console.log(total([{ name: "bag", price: "450" }]));`,
    },
    quiz: [
      {
        question: 'What happens to TypeScript code before a browser runs it?',
        options: ['The browser runs it directly', 'It is compiled to JavaScript, with the types removed', 'It is converted to WebAssembly', 'It is interpreted by Node.js only'],
        answer: 1,
        explanation: 'Types exist only while the code is being written and compiled.',
      },
      {
        question: 'When are TypeScript type errors reported?',
        options: ['Only in production', 'Only when the faulty line runs', 'At compile time, before the code runs', 'Never; types are comments'],
        answer: 2,
        explanation: 'The editor also shows them as you type.',
      },
      {
        question: 'How is a function parameter given a type?',
        options: ['function greet(string name)', 'function greet(name as string)', 'function greet(name = string)', 'function greet(name: string)'],
        answer: 3,
        explanation: 'The type follows the name after a colon.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the benefits of TypeScript over JavaScript?',
        answer: `It finds type errors before the code runs: wrong argument types, misspelled property names, values that may be <code>undefined</code>. Types serve as documentation that cannot go out of date, and they give editors accurate autocompletion and safe refactoring. In large codebases and teams this greatly reduces bugs. The costs are a build step and some extra code to write.`,
      },
      {
        question: 'What is the difference between an interface and a type alias?',
        answer: `Both can describe the shape of an object. An <code>interface</code> can be extended with <code>extends</code> and can be declared more than once, with the declarations merged. A <code>type</code> alias can name any type, including unions, intersections, tuples and primitives, which an interface cannot. A common convention is interfaces for object shapes and type aliases for unions and everything else.`,
      },
    ],
  },
}
