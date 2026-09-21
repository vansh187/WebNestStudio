// JavaScript module B — DOM, browser APIs, and asynchronous JavaScript.
// Keys are slugs matching the topic list in the site's tutorial navigation.
export const javascriptContentB = {
  'dom': {
    title: 'The Document Object Model (DOM)',
    intro: `When a browser loads an HTML page, it doesn't just display the raw markup — it builds an in-memory tree structure called the Document Object Model (DOM). Every tag becomes a node in that tree, and JavaScript can read, modify, add, or remove those nodes at any time, which is what makes web pages interactive rather than static.

The DOM is not part of the JavaScript language itself; it's a browser-provided API. That's why DOM code only runs in a browser environment (not in Node.js by default) and why the global object you interact with is <code>document</code>, which represents the entire loaded page.`,
    sections: [
      {
        heading: 'The DOM Tree',
        body: `The DOM models a page as a hierarchy: <code>document</code> is the root, it contains the <code>&lt;html&gt;</code> element, which contains <code>&lt;head&gt;</code> and <code>&lt;body&gt;</code>, and so on down to individual text nodes. Each node has relationships you can traverse programmatically.`,
        list: [
          '<code>parentElement</code> / <code>parentNode</code> — the containing element.',
          '<code>children</code> — a live collection of child elements (ignores text nodes).',
          '<code>childNodes</code> — all child nodes, including text and comment nodes.',
          '<code>nextElementSibling</code> / <code>previousElementSibling</code> — adjacent elements at the same level.',
        ],
      },
      {
        heading: 'Selecting Elements',
        body: `Modern JavaScript almost always uses <code>document.querySelector()</code> and <code>document.querySelectorAll()</code> because they accept any CSS selector, which is far more flexible than the older <code>getElementById</code> or <code>getElementsByClassName</code>. <code>querySelector</code> returns the first match (or <code>null</code>), while <code>querySelectorAll</code> returns a static <code>NodeList</code> of every match.`,
        list: [
          '<code>document.getElementById(\'id\')</code> — fastest, but only matches by id.',
          '<code>document.querySelector(\'.card > h2\')</code> — first match for any CSS selector.',
          '<code>document.querySelectorAll(\'li.active\')</code> — a NodeList you can loop with <code>forEach</code>.',
        ],
      },
      {
        heading: 'Creating and Modifying Elements',
        body: `You build new DOM content with <code>document.createElement()</code>, set its content or attributes, and attach it to the tree with methods like <code>appendChild()</code>, <code>append()</code>, or <code>before()</code>/<code>after()</code>. Existing elements are updated through properties like <code>textContent</code> (plain text, safe from HTML injection), <code>innerHTML</code> (parses a string as markup — use with caution on untrusted input), <code>classList</code> (add/remove/toggle CSS classes), and <code>setAttribute()</code>/<code>getAttribute()</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Selecting an element and updating its content and class',
        code: `// HTML: <ul id="task-list"><li class="task">Buy milk</li></ul>

const list = document.querySelector('#task-list');
const firstItem = list.querySelector('.task');

firstItem.textContent = 'Buy milk and eggs';
firstItem.classList.add('done');

console.log(firstItem.outerHTML);`,
        output: `<li class="task done">Buy milk and eggs</li>`,
      },
      {
        caption: 'Creating a new element and appending it to the tree',
        code: `const list = document.querySelector('#task-list');

const newItem = document.createElement('li');
newItem.textContent = 'Walk the dog';
newItem.classList.add('task');

list.appendChild(newItem);

console.log(list.children.length);`,
        output: '2',
      },
    ],
    commonMistakes: [
      'Using <code>innerHTML</code> to insert user-provided text, which can introduce cross-site scripting (XSS) if the text contains HTML/script tags — use <code>textContent</code> for plain text instead.',
      'Assuming <code>querySelectorAll()</code> returns an array — it returns a NodeList, which supports <code>forEach</code> but not array methods like <code>map()</code> or <code>filter()</code> without converting it first (<code>Array.from(nodeList)</code>).',
      'Running DOM-selecting code before the page has finished parsing, so <code>querySelector</code> returns <code>null</code> for elements that don\'t exist yet — placing scripts at the end of <code>&lt;body&gt;</code> or using <code>DOMContentLoaded</code> avoids this.',
      'Calling <code>getElementsByClassName</code> or <code>getElementsByTagName</code> and forgetting the result is a *live* HTMLCollection, which changes automatically as the DOM changes, unlike the static NodeList from <code>querySelectorAll</code>.',
    ],
    keyPoints: [
      'The DOM is a tree representation of the page that JavaScript can read and mutate at runtime.',
      '<code>querySelector</code>/<code>querySelectorAll</code> accept full CSS selectors and are the modern default for finding elements.',
      'Use <code>textContent</code> for safe plain text and <code>innerHTML</code> only for trusted markup.',
      'New elements are built with <code>createElement()</code> and attached with methods like <code>appendChild()</code>.',
    ],
  },

  'events': {
    title: 'Events and Event Handling',
    intro: `Events are how the browser tells your JavaScript that something happened — a click, a keypress, a page load, a form submission, a network response. Almost all interactivity on the web is built by listening for events and reacting to them.

Understanding not just how to attach a listener, but how events travel through the DOM (capturing and bubbling), unlocks powerful patterns like event delegation that make code both simpler and more efficient.`,
    sections: [
      {
        heading: 'addEventListener and the Event Object',
        body: `<code>element.addEventListener('click', handler)</code> registers a function to run whenever that event fires on that element. Unlike the older <code>onclick = handler</code> style, <code>addEventListener</code> allows multiple listeners on the same event without overwriting each other, and it accepts an options object (<code>{ once: true, capture: true, passive: true }</code>). Every handler receives an <code>event</code> object describing what happened — <code>event.target</code> (the actual element that triggered it), <code>event.type</code>, <code>event.preventDefault()</code> (stops the default browser action, like following a link), and <code>event.stopPropagation()</code> (stops the event from continuing to travel).`,
      },
      {
        heading: 'Bubbling and Capturing',
        body: `When an event fires on an element, it doesn't just affect that element — it travels through the DOM tree in two phases. The <strong>capturing</strong> phase goes from the <code>document</code> down to the target element; the <strong>bubbling</strong> phase then goes back up from the target to the <code>document</code>. By default, <code>addEventListener</code> listens during the bubbling phase; passing <code>{ capture: true }</code> listens during capturing instead. This is why a click on a button inside a <code>div</code> also triggers click listeners on that <code>div</code> and on <code>document</code>, unless <code>stopPropagation()</code> is called.`,
      },
      {
        heading: 'Event Delegation',
        body: `Instead of attaching a listener to every individual list item, button, or row (which is wasteful and doesn't work for elements added later), you attach a single listener to a stable parent element and use <code>event.target</code> to figure out which child was actually interacted with. This relies entirely on bubbling and is a standard performance and maintainability pattern for dynamic lists.`,
        list: [
          'Fewer listeners registered — better memory and setup performance for large lists.',
          'Automatically works for elements added to the DOM later, since the listener lives on the parent.',
          'Requires checking <code>event.target</code> (or <code>event.target.closest(selector)</code>) to identify the actual element clicked.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Basic click listener with the event object',
        code: `const button = document.querySelector('#save-btn');

button.addEventListener('click', (event) => {
  event.preventDefault();
  console.log('Clicked element:', event.target.tagName);
  console.log('Event type:', event.type);
});`,
        output: `Clicked element: BUTTON
Event type: click`,
      },
      {
        caption: 'Event delegation on a list, handling clicks on any current or future item',
        code: `const list = document.querySelector('#task-list');

list.addEventListener('click', (event) => {
  const item = event.target.closest('.task');
  if (!item) return; // click was on the list itself, not an item

  item.classList.toggle('done');
  console.log('Toggled:', item.textContent);
});

// Even an item added later, e.g. list.appendChild(newLi),
// is handled correctly because the listener is on 'list', not each item.`,
        output: `Toggled: Buy milk and eggs`,
      },
    ],
    commonMistakes: [
      'Attaching a separate listener to every list item and forgetting to attach one to items added dynamically afterward — event delegation solves this by listening on the parent.',
      'Confusing <code>event.target</code> (the exact element the event originated on) with <code>event.currentTarget</code> (the element the listener is actually attached to) inside a delegated handler.',
      'Forgetting to call <code>event.preventDefault()</code> on a form submit handler, causing an unwanted full-page reload/navigation.',
      'Assuming <code>stopPropagation()</code> also prevents the default browser action — it only stops the event from bubbling/capturing further; <code>preventDefault()</code> is the one that cancels default behavior.',
    ],
    keyPoints: [
      '<code>addEventListener</code> supports multiple handlers per event and accepts options like <code>{ once: true }</code>.',
      'Events travel through capturing (top-down) then bubbling (bottom-up) phases; listeners default to the bubbling phase.',
      'Event delegation attaches one listener to a parent and uses <code>event.target</code> to identify the actual source, which scales to dynamic content.',
      '<code>preventDefault()</code> cancels default browser behavior; <code>stopPropagation()</code> stops the event from traveling further.',
    ],
  },

  'modules': {
    title: 'JavaScript Modules (import/export)',
    intro: `As applications grow, keeping all code in a single file becomes unmanageable. ES Modules (introduced in ES2015 and now natively supported in browsers and Node.js) let you split code across files and explicitly declare what each file shares with others using <code>export</code> and what it needs from others using <code>import</code>.

Modules are automatically executed in strict mode, have their own top-level scope (variables don't leak into the global scope), and are only evaluated once no matter how many times they're imported.`,
    sections: [
      {
        heading: 'Named Exports and Imports',
        body: `A module can export multiple named values — functions, classes, constants — using <code>export</code> in front of a declaration, or a single <code>export { a, b, c }</code> statement. The importing file must use the exact same names (or rename them with <code>as</code>) inside curly braces: <code>import { a, b } from './module.js'</code>.`,
      },
      {
        heading: 'Default Exports',
        body: `Each module may additionally have one <code>export default</code>, typically used for the "main" thing a file provides (a single class or component). Importing a default export doesn't use curly braces, and the local name can be anything you choose: <code>import MyThing from './module.js'</code>. A file can mix one default export with several named exports.`,
      },
      {
        heading: 'Practical Usage',
        body: `In the browser, modules are loaded with <code>&lt;script type="module" src="main.js"&gt;&lt;/script&gt;</code>, which automatically defers execution and enforces CORS rules on cross-origin imports. In Node.js, modules are used either via <code>.mjs</code> files or by setting <code>"type": "module"</code> in <code>package.json</code>. Import paths for local files must be relative (starting with <code>./</code> or <code>../</code>) and typically include the file extension.`,
      },
    ],
    examples: [
      {
        caption: 'Named exports and a default export in one module, then imported',
        code: `// math.js
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export default function multiply(a, b) {
  return a * b;
}

// main.js
import multiply, { PI, add } from './math.js';

console.log(add(2, 3));
console.log(multiply(4, 5));
console.log(PI);`,
        output: `5
20
3.14159`,
      },
      {
        caption: 'Renaming an import to avoid a naming collision',
        code: `// logger.js
export function log(message) {
  console.log('[APP]', message);
}

// main.js
import { log as appLog } from './logger.js';

appLog('Server started');`,
        output: `[APP] Server started`,
      },
    ],
    commonMistakes: [
      'Mixing up default and named export syntax — forgetting curly braces for named imports, or adding them by mistake for a default import.',
      'Trying to have more than one <code>export default</code> in the same file, which is a syntax error.',
      'Forgetting the file extension in relative import paths in the browser (<code>import x from \'./utils\'</code> instead of <code>\'./utils.js\'</code>), which fails since browsers don\'t auto-resolve extensions the way bundlers do.',
      'Loading a module script without <code>type="module"</code> on the <code>&lt;script&gt;</code> tag, so <code>import</code>/<code>export</code> throw a syntax error.',
    ],
    keyPoints: [
      'A module can have any number of named exports plus at most one default export.',
      'Named imports must match exported names (or be renamed with <code>as</code>); default imports can use any local name.',
      'Modules run in strict mode with their own scope and are evaluated only once even if imported from multiple places.',
      'Browsers need <code>&lt;script type="module"&gt;</code>; Node.js needs <code>.mjs</code> or <code>"type": "module"</code> in package.json.',
    ],
  },

  'local-storage': {
    title: 'Web Storage: localStorage and sessionStorage',
    intro: `Browsers give JavaScript two simple key-value storage mechanisms that persist data on the user's machine without needing a server: <code>localStorage</code> and <code>sessionStorage</code>. Both share the same API, but they differ in how long data survives.

These APIs only store strings, so storing structured data (objects, arrays) requires manual serialization with <code>JSON.stringify()</code> and deserialization with <code>JSON.parse()</code>.`,
    sections: [
      {
        heading: 'localStorage vs sessionStorage',
        body: `<code>localStorage</code> persists data with no expiration date — it survives page reloads, browser restarts, and even system reboots, until explicitly cleared by code or the user. <code>sessionStorage</code> persists only for the duration of the page session — it's cleared automatically when the tab is closed (but survives a page reload within the same tab). Both are scoped per-origin (protocol + domain + port), so one site cannot read another site's storage.`,
      },
      {
        heading: 'The Core API',
        body: `Both objects expose the same four methods, plus a <code>length</code> property.`,
        list: [
          '<code>setItem(key, value)</code> — stores a value under a key (value is coerced to a string).',
          '<code>getItem(key)</code> — retrieves the stored string, or <code>null</code> if the key doesn\'t exist.',
          '<code>removeItem(key)</code> — deletes a single key.',
          '<code>clear()</code> — removes everything stored for that origin.',
        ],
      },
      {
        heading: 'Storing Objects with JSON',
        body: `Because storage only holds strings, storing an object directly (<code>localStorage.setItem('user', userObj)</code>) will store the literal text <code>"[object Object]"</code> instead of the data. The correct pattern is to serialize before storing and parse after reading, and to guard against missing keys or malformed JSON.`,
      },
    ],
    examples: [
      {
        caption: 'Storing and retrieving a simple string value with localStorage',
        code: `localStorage.setItem('theme', 'dark');

const savedTheme = localStorage.getItem('theme');
console.log(savedTheme);

localStorage.removeItem('theme');
console.log(localStorage.getItem('theme'));`,
        output: `dark
null`,
      },
      {
        caption: 'Serializing an object to JSON before storing, and parsing it back',
        code: `const user = { name: 'Asha', age: 28, roles: ['admin', 'editor'] };

localStorage.setItem('user', JSON.stringify(user));

const raw = localStorage.getItem('user');
const restoredUser = raw ? JSON.parse(raw) : null;

console.log(restoredUser.name, restoredUser.roles.join(', '));`,
        output: `Asha admin, editor`,
      },
    ],
    commonMistakes: [
      'Storing an object or array directly without <code>JSON.stringify()</code>, resulting in the useless string "[object Object]" being saved.',
      'Calling <code>JSON.parse()</code> on a key that might not exist, which throws because <code>getItem()</code> returned <code>null</code> — always check for <code>null</code> before parsing.',
      'Assuming localStorage is secure or encrypted — it is plain text, readable by any script running on the same origin, so it should never hold sensitive data like passwords or raw tokens.',
      'Confusing sessionStorage\'s lifetime — it survives a page reload/refresh, but not closing the tab; it is not "cleared as soon as you navigate."',
    ],
    keyPoints: [
      'localStorage persists indefinitely per-origin; sessionStorage is cleared when the tab closes.',
      'Both store only strings — use <code>JSON.stringify</code>/<code>JSON.parse</code> to save and restore objects or arrays.',
      'The core API is the same for both: <code>setItem</code>, <code>getItem</code>, <code>removeItem</code>, <code>clear</code>.',
      'Never store sensitive data in Web Storage — it is plain text and accessible to any script on the same origin.',
    ],
  },

  'promises': {
    title: 'JavaScript Promises',
    intro: `A Promise is an object representing the eventual result of an asynchronous operation — something that hasn't finished yet, like a network request, a file read, or a timer. Before Promises, asynchronous code relied on nested callbacks, which became difficult to read and error-prone as operations chained together ("callback hell").

A Promise gives asynchronous code a predictable shape: it starts in one state and settles into exactly one of two final states, and you attach handlers that run once that settlement happens.`,
    sections: [
      {
        heading: 'The Three States',
        body: `Every Promise is in exactly one of three states at any moment.`,
        list: [
          '<strong>Pending</strong> — the initial state; the operation hasn\'t completed yet.',
          '<strong>Fulfilled</strong> — the operation completed successfully, producing a value.',
          '<strong>Rejected</strong> — the operation failed, producing a reason (usually an Error).',
        ],
      },
      {
        heading: '.then, .catch, and .finally',
        body: `<code>.then(onFulfilled, onRejected)</code> registers callbacks for success and (optionally) failure. <code>.catch(onRejected)</code> is shorthand for <code>.then(undefined, onRejected)</code> and is the conventional way to handle errors at the end of a chain. <code>.finally(callback)</code> runs regardless of whether the Promise fulfilled or rejected, useful for cleanup like hiding a loading spinner. Because <code>.then()</code> always returns a new Promise, these calls chain together, and each <code>.then()</code> receives the value returned by the previous one.`,
      },
      {
        heading: 'Combining Promises with Promise.all',
        body: `<code>Promise.all(iterable)</code> takes an array of Promises and returns a single Promise that fulfills with an array of all their results, but only once every input Promise has fulfilled — and it rejects immediately if any single one rejects. This is the standard tool for running independent async operations in parallel rather than awaiting them one at a time. Related methods include <code>Promise.allSettled()</code> (waits for all, never rejects, reports each outcome) and <code>Promise.race()</code> (settles as soon as the first input settles).`,
      },
    ],
    examples: [
      {
        caption: 'A basic Promise chain with .then, .catch, and .finally',
        code: `function fetchUserAge(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 1) {
        resolve(28);
      } else {
        reject(new Error('User not found'));
      }
    }, 100);
  });
}

fetchUserAge(1)
  .then((age) => {
    console.log('Age is', age);
    return age * 2;
  })
  .then((doubled) => console.log('Doubled:', doubled))
  .catch((err) => console.error('Failed:', err.message))
  .finally(() => console.log('Request finished'));`,
        output: `Age is 28
Doubled: 56
Request finished`,
      },
      {
        caption: 'Running independent async operations in parallel with Promise.all',
        code: `const delay = (value, ms) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

Promise.all([delay('users', 50), delay('posts', 30), delay('comments', 10)])
  .then((results) => console.log(results))
  .catch((err) => console.error(err));`,
        output: `[ 'users', 'posts', 'comments' ]`,
      },
    ],
    commonMistakes: [
      'Forgetting to add a <code>.catch()</code> at the end of a Promise chain, which results in silent or unhandled promise rejections.',
      'Nesting <code>.then()</code> calls inside each other instead of returning a value and chaining flatly — this recreates the "callback hell" Promises were meant to fix.',
      'Using <code>Promise.all()</code> when one failure shouldn\'t cancel the rest — <code>Promise.allSettled()</code> is the correct choice when you want every result regardless of individual failures.',
      'Forgetting that <code>.then()</code>\'s callback must return a value (or another Promise) to pass data down the chain — an implicit <code>undefined</code> return breaks the chain\'s data flow.',
    ],
    keyPoints: [
      'A Promise is pending, then settles exactly once into either fulfilled or rejected.',
      '<code>.then()</code> handles success, <code>.catch()</code> handles failure, and <code>.finally()</code> always runs for cleanup.',
      'Promise chains work because <code>.then()</code> returns a new Promise, letting values flow down the chain.',
      '<code>Promise.all()</code> runs Promises in parallel and rejects fast; <code>Promise.allSettled()</code> waits for all outcomes without short-circuiting.',
    ],
  },

  'async-await': {
    title: 'Async/Await in JavaScript',
    intro: `<code>async</code>/<code>await</code> is syntax introduced in ES2017 that lets you write asynchronous code that reads like synchronous code, while still being built entirely on top of Promises. It doesn't replace Promises — it's "syntactic sugar" over them, making Promise-based code easier to write and reason about, especially when several async steps depend on each other.

Any function marked <code>async</code> automatically returns a Promise, and inside it, the <code>await</code> keyword pauses execution of that function (without blocking the rest of the program) until the awaited Promise settles.`,
    sections: [
      {
        heading: 'How await Relates to Promises',
        body: `<code>await somePromise</code> is roughly equivalent to calling <code>.then()</code> on that Promise and continuing the function with the resolved value — except it looks like a normal, blocking assignment. If the awaited Promise rejects, <code>await</code> throws that rejection as a regular JavaScript exception at that line, which is why <code>try/catch</code> becomes the natural way to handle async errors instead of <code>.catch()</code> chains.`,
      },
      {
        heading: 'Error Handling with try/catch',
        body: `Wrapping <code>await</code> expressions in a <code>try</code> block lets you catch failures exactly where synchronous code would: <code>try { const data = await fetchData(); } catch (err) { /* handle it */ }</code>. Without a surrounding <code>try/catch</code>, a rejected <code>await</code> propagates up as a rejected Promise from the <code>async</code> function itself, which the caller must then handle.`,
      },
      {
        heading: 'Sequential vs Parallel Awaiting',
        body: `Awaiting one operation after another inside a loop or a sequence of statements runs them one at a time, which is correct when each step depends on the previous result, but wasteful when they're independent. To run independent async calls concurrently while still using <code>await</code>, start all the Promises first (without awaiting immediately) and then await <code>Promise.all()</code> on them together.`,
      },
    ],
    examples: [
      {
        caption: 'An async function with await and try/catch, alongside synchronous code',
        code: `function fetchUserAge(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      id === 1 ? resolve(28) : reject(new Error('User not found'));
    }, 100);
  });
}

async function printUserInfo(id) {
  console.log('Start fetching...');
  try {
    const age = await fetchUserAge(id);
    console.log('Age is', age);
  } catch (err) {
    console.error('Failed:', err.message);
  }
  console.log('Done.');
}

printUserInfo(1);
console.log('This logs before "Age is 28" because await does not block.');`,
        output: `Start fetching...
This logs before "Age is 28" because await does not block.
Age is 28
Done.`,
      },
      {
        caption: 'Sequential awaits vs concurrent awaits with Promise.all',
        code: `const delay = (label, ms) =>
  new Promise((resolve) => setTimeout(() => resolve(label), ms));

async function sequential() {
  const a = await delay('A', 100); // waits 100ms
  const b = await delay('B', 100); // then waits another 100ms
  console.log(a, b, '- sequential took ~200ms total');
}

async function concurrent() {
  const pA = delay('A', 100); // both start immediately
  const pB = delay('B', 100);
  const [a, b] = await Promise.all([pA, pB]); // waits ~100ms total
  console.log(a, b, '- concurrent took ~100ms total');
}

sequential();
concurrent();`,
        output: `A B - concurrent took ~100ms total
A B - sequential took ~200ms total`,
      },
    ],
    commonMistakes: [
      'Marking a function <code>async</code> but forgetting that it always returns a Promise, then trying to use its return value directly instead of awaiting or chaining it.',
      'Awaiting independent operations one after another instead of starting them together and awaiting <code>Promise.all()</code>, which needlessly slows down the total time.',
      'Forgetting <code>try/catch</code> around <code>await</code>, letting a rejected Promise crash an unhandled path or silently reject the enclosing async function.',
      'Using <code>await</code> outside of an <code>async</code> function (in older environments without top-level await support), which is a syntax error.',
    ],
    keyPoints: [
      'async functions always return a Promise; await pauses only that function, not the whole program.',
      'await is syntactic sugar over <code>.then()</code> — a rejected awaited Promise throws, so try/catch is the standard error-handling pattern.',
      'Sequential awaits run one after another; starting Promises first and awaiting <code>Promise.all()</code> runs them concurrently.',
      'async/await does not replace Promises — every async function is still built on the Promise mechanism underneath.',
    ],
  },

  'fetch': {
    title: 'The Fetch API',
    intro: `The Fetch API is the modern, Promise-based way to make HTTP requests from JavaScript — replacing the older, callback-based <code>XMLHttpRequest</code>. A single call to <code>fetch(url)</code> returns a Promise that resolves to a <code>Response</code> object once the server has responded with headers, even before the body has fully arrived.

Because <code>fetch()</code> returns a Promise, it pairs naturally with <code>.then()</code> chains or <code>async</code>/<code>await</code>, and reading the actual response body is itself an additional asynchronous step.`,
    sections: [
      {
        heading: 'A Basic GET Request',
        body: `<code>fetch(url)</code> defaults to a GET request. The resolved <code>Response</code> object doesn't contain the parsed data directly — you call a method like <code>response.json()</code> (or <code>.text()</code>, <code>.blob()</code>) to read and parse the body, and that method also returns a Promise, since reading the full body can take time.`,
      },
      {
        heading: 'Checking response.ok',
        body: `A critical detail: <code>fetch()</code>'s Promise only rejects on network failure (like no internet connection or a DNS error) — it does NOT reject for HTTP error statuses like 404 or 500. The response still resolves successfully, just with <code>response.ok === false</code> and <code>response.status</code> set to the error code. Correct code always checks <code>response.ok</code> before treating the response as usable data, and throws manually if it isn't.`,
      },
      {
        heading: 'Making a POST Request',
        body: `To send data, pass a second options object specifying the method, headers, and a body. JSON payloads need both <code>JSON.stringify()</code> on the body and a <code>Content-Type: application/json</code> header so the server parses it correctly.`,
        list: [
          '<code>method</code> — \'GET\' (default), \'POST\', \'PUT\', \'DELETE\', etc.',
          '<code>headers</code> — an object of request headers, e.g. <code>{ \'Content-Type\': \'application/json\' }</code>.',
          '<code>body</code> — the request payload, typically <code>JSON.stringify(data)</code> for JSON APIs.',
        ],
      },
    ],
    examples: [
      {
        caption: 'A GET request with proper response.ok checking',
        code: `async function getUser(id) {
  const response = await fetch(\`https://api.example.com/users/\${id}\`);

  if (!response.ok) {
    throw new Error(\`Request failed with status \${response.status}\`);
  }

  const user = await response.json();
  return user;
}

getUser(42)
  .then((user) => console.log('Fetched:', user.name))
  .catch((err) => console.error('Error:', err.message));

// If the server returns 404, response.ok is false and the manual
// throw runs, producing: "Error: Request failed with status 404"`,
        output: `Fetched: Asha Verma`,
      },
      {
        caption: 'A POST request sending a JSON body',
        code: `async function createUser(newUser) {
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser),
  });

  if (!response.ok) {
    throw new Error(\`Create failed with status \${response.status}\`);
  }

  return response.json();
}

createUser({ name: 'Rahul', age: 31 }).then((created) =>
  console.log('Created user with id:', created.id)
);`,
        output: `Created user with id: 108`,
      },
    ],
    commonMistakes: [
      'Assuming <code>fetch()</code> rejects on a 404 or 500 response — it only rejects on network failure; you must manually check <code>response.ok</code> or <code>response.status</code>.',
      'Forgetting to <code>await</code> (or chain <code>.then()</code> on) <code>response.json()</code>, which is itself asynchronous and returns a Promise, not the parsed data directly.',
      'Sending a JSON body without setting the <code>Content-Type: application/json</code> header, causing the server to misinterpret or reject the payload.',
      'Forgetting <code>JSON.stringify()</code> on the request body, sending "[object Object]" as literal text instead of valid JSON.',
    ],
    keyPoints: [
      '<code>fetch(url)</code> returns a Promise resolving to a Response once headers arrive; reading the body (<code>.json()</code>, <code>.text()</code>) is a separate async step.',
      '<code>fetch()</code>\'s Promise only rejects on network errors — always check <code>response.ok</code>/<code>response.status</code> for HTTP-level failures.',
      'POST/PUT requests need a <code>method</code>, a <code>Content-Type</code> header, and a <code>JSON.stringify()</code>-encoded body for JSON APIs.',
      'fetch pairs naturally with async/await for readable request/response handling.',
    ],
  },

  'error-handling': {
    title: 'Error Handling in JavaScript',
    intro: `Errors are inevitable — a network call fails, a user enters invalid input, a value is unexpectedly <code>null</code>. JavaScript provides <code>try/catch/finally</code> for handling exceptions gracefully instead of letting them crash the whole program, along with the built-in <code>Error</code> object (and subclasses) for describing what went wrong.

Writing deliberate error handling — rather than just hoping errors don't happen — is what separates fragile scripts from resilient applications.`,
    sections: [
      {
        heading: 'try, catch, and finally',
        body: `Code that might throw goes inside a <code>try</code> block. If an exception occurs, execution immediately jumps to the matching <code>catch (error) { ... }</code> block, skipping the rest of the <code>try</code> block. The optional <code>finally</code> block runs afterward no matter what happened — whether the <code>try</code> succeeded, an error was caught, or even if the <code>catch</code> block itself re-threw — making it the right place for cleanup like closing a connection or hiding a spinner.`,
      },
      {
        heading: 'Throwing Custom Error Objects',
        body: `You can throw any value with <code>throw</code>, but convention (and good debugging) means throwing <code>Error</code> objects, which capture a <code>message</code>, a <code>name</code>, and a <code>stack</code> trace. For domain-specific failures, it's common to create custom error classes that extend <code>Error</code>, so calling code can distinguish error types (e.g. <code>ValidationError</code> vs <code>NetworkError</code>) using <code>instanceof</code>.`,
      },
      {
        heading: 'Error Boundaries as a Concept',
        body: `An "error boundary" is a deliberate point in an application where errors are caught and handled gracefully instead of letting them propagate all the way up and crash the app or leave the UI in a broken state. In frameworks like React, this is a literal component type; conceptually, in any JavaScript app, it means wrapping risky operations (rendering, async calls, third-party code) in try/catch at strategic boundaries, logging or reporting the error, and showing a fallback rather than a blank or frozen screen.`,
      },
    ],
    examples: [
      {
        caption: 'try/catch/finally with a custom Error subclass',
        code: `class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function setAge(age) {
  if (age < 0) {
    throw new ValidationError('Age cannot be negative');
  }
  return age;
}

try {
  setAge(-5);
} catch (err) {
  if (err instanceof ValidationError) {
    console.error('Validation problem:', err.message);
  } else {
    console.error('Unexpected error:', err.message);
  }
} finally {
  console.log('Validation attempt complete.');
}`,
        output: `Validation problem: Age cannot be negative
Validation attempt complete.`,
      },
      {
        caption: 'A conceptual error boundary function wrapping risky async work',
        code: `async function withErrorBoundary(operation, fallbackValue) {
  try {
    return await operation();
  } catch (err) {
    console.error('Caught at boundary:', err.message);
    return fallbackValue; // app keeps running with a safe default
  }
}

async function loadSettings() {
  throw new Error('Settings service unreachable');
}

withErrorBoundary(loadSettings, { theme: 'default' }).then((settings) =>
  console.log('Using settings:', settings)
);`,
        output: `Caught at boundary: Settings service unreachable
Using settings: { theme: 'default' }`,
      },
    ],
    commonMistakes: [
      'Throwing plain strings or objects instead of <code>Error</code> instances, losing the automatically captured stack trace that makes debugging much easier.',
      'Wrapping code in try/catch and then silently swallowing the error (an empty <code>catch</code> block) instead of logging it or handling it meaningfully — this hides real bugs.',
      'Forgetting that <code>catch</code> only catches synchronous errors and errors from awaited Promises inside the try block — an unhandled rejection in an unawaited async call elsewhere will not be caught.',
      'Using <code>finally</code> to return a value, which silently overrides any value returned or error thrown inside the <code>try</code>/<code>catch</code> — a subtle and confusing bug.',
    ],
    keyPoints: [
      '<code>try/catch/finally</code> lets code recover from exceptions instead of crashing; <code>finally</code> always runs for cleanup.',
      'Prefer throwing <code>Error</code> objects (or custom subclasses) over raw strings, since they carry a message, name, and stack trace.',
      'Custom error classes let calling code distinguish error types with <code>instanceof</code>.',
      'An error boundary is a deliberate catch point that keeps the rest of an application usable when one part fails.',
    ],
  },

  'debugging': {
    title: 'Debugging JavaScript',
    intro: `Writing correct code the first time is rare — real development is a cycle of writing, running, observing what actually happened, and correcting course. Debugging is the disciplined version of that cycle, and JavaScript developers have two main toolsets for it: the <code>console</code> object for quick, low-friction inspection, and the browser's DevTools for deeper, interactive investigation.

Learning to debug efficiently — rather than sprinkling <code>console.log</code> everywhere and guessing — is one of the highest-leverage skills a JavaScript developer can build.`,
    sections: [
      {
        heading: 'Console Methods Beyond console.log',
        body: `The console object offers several methods purpose-built for different kinds of output, and using the right one makes logs far easier to scan.`,
        list: [
          '<code>console.warn()</code> — logs with a yellow warning style, for non-fatal issues worth noticing.',
          '<code>console.error()</code> — logs with a red error style and includes a stack trace, for actual failures.',
          '<code>console.table(data)</code> — renders an array of objects as a readable table, ideal for inspecting lists of records at a glance.',
          '<code>console.group()</code> / <code>console.groupEnd()</code> — visually nests related log lines so they can be collapsed together.',
        ],
      },
      {
        heading: 'Breakpoints and Stepping Through Code',
        body: `A breakpoint pauses code execution at a specific line, letting you inspect variables at that exact moment rather than guessing from logs after the fact. You can set a breakpoint by clicking a line number in the browser DevTools' Sources panel, or directly in code with the <code>debugger;</code> statement, which pauses execution automatically whenever DevTools is open. Once paused, you can step over, into, or out of function calls, and watch how variable values change line by line.`,
      },
      {
        heading: 'Browser DevTools Basics',
        body: `Every major browser ships built-in developer tools (opened with F12 or right-click → Inspect). The <strong>Console</strong> panel runs JavaScript live against the current page and shows log output. The <strong>Sources</strong> panel shows your actual script files, lets you set breakpoints, and shows the call stack and local variables when paused. The <strong>Network</strong> panel shows every request the page makes, including status codes, timing, and response bodies — essential for debugging fetch calls and APIs. The <strong>Elements</strong> panel shows the live DOM tree and lets you inspect or edit it directly.`,
      },
    ],
    examples: [
      {
        caption: 'Using console.table, console.warn, and console.group for clearer output',
        code: `const users = [
  { id: 1, name: 'Asha', age: 28 },
  { id: 2, name: 'Rahul', age: 31 },
];

console.group('User Report');
console.table(users);

users.forEach((user) => {
  if (user.age < 18) {
    console.warn(\`\${user.name} is a minor\`);
  }
});
console.groupEnd();`,
        output: `User Report
  ┌─────────┬────┬───────┬─────┐
  │ (index) │ id │ name  │ age │
  ├─────────┼────┼───────┼─────┤
  │    0    │ 1  │'Asha' │ 28  │
  │    1    │ 2  │'Rahul'│ 31  │
  └─────────┴────┴───────┴─────┘
  (no warnings logged, since both users are adults)`,
      },
      {
        caption: 'Pausing execution with the debugger statement to inspect state',
        code: `function calculateTotal(cart) {
  let total = 0;
  for (const item of cart) {
    debugger; // execution pauses here whenever DevTools is open
    total += item.price * item.quantity;
  }
  return total;
}

calculateTotal([
  { price: 10, quantity: 2 },
  { price: 5, quantity: 3 },
]);
// With DevTools closed, "debugger" is simply ignored and the
// function runs straight through, returning 35.`,
        output: '35',
      },
    ],
    commonMistakes: [
      'Relying only on <code>console.log</code> for everything, missing how much faster <code>console.table</code> or a real breakpoint can make inspecting arrays of objects or complex state.',
      'Leaving <code>debugger;</code> statements or stray <code>console.log</code> calls committed in production code, which can leak information or hurt performance.',
      'Not checking the Network panel when a <code>fetch()</code> call "does nothing" — the request may be failing, being blocked by CORS, or returning an error status that silent code isn\'t surfacing.',
      'Reading a stack trace top-to-bottom instead of starting from the top (most recent call) to trace back to where the error actually originated.',
    ],
    keyPoints: [
      'Use <code>console.warn</code>, <code>console.error</code>, <code>console.table</code>, and <code>console.group</code> for clearer, more purposeful logging than plain <code>console.log</code>.',
      'Breakpoints (set in DevTools or via the <code>debugger;</code> statement) pause execution so you can inspect real state, which is often faster than guessing from logs.',
      'The Sources panel debugs code, the Network panel debugs requests, and the Elements panel debugs the live DOM.',
      'Remove <code>debugger;</code> statements and diagnostic logs before shipping to production.',
    ],
  },

  'testing-fundamentals': {
    title: 'Testing Fundamentals in JavaScript',
    intro: `Automated tests are code that checks whether other code behaves correctly, run automatically instead of manually clicking through an application after every change. They catch regressions early, document expected behavior, and give developers confidence to refactor without fear of silently breaking something.

Modern JavaScript testing typically uses a test runner and assertion library like Jest or Vitest, both of which share a very similar API and philosophy.`,
    sections: [
      {
        heading: 'The Arrange-Act-Assert Pattern',
        body: `Most well-written tests follow a simple three-part structure, regardless of the testing library used.`,
        list: [
          '<strong>Arrange</strong> — set up the inputs, initial state, or objects the test needs.',
          '<strong>Act</strong> — call the function or perform the action being tested.',
          '<strong>Assert</strong> — check that the actual result matches the expected result.',
        ],
      },
      {
        heading: 'Writing a Simple Test',
        body: `In Jest or Vitest, tests are grouped in <code>describe()</code> blocks and individual cases are written with <code>test()</code> (or its alias <code>it()</code>). Inside a test, <code>expect(actualValue)</code> returns a set of "matcher" methods like <code>.toBe()</code>, <code>.toEqual()</code>, or <code>.toThrow()</code> to assert the expected outcome. A test file is typically run automatically by the test runner whenever code changes, or as part of continuous integration before code is merged.`,
      },
      {
        heading: 'What Makes a Good Unit Test',
        body: `A good unit test is isolated (it tests one function or unit of behavior, not the whole application), deterministic (it produces the same result every run, with no reliance on real time, network calls, or random values unless explicitly controlled), and readable (its name and structure make clear what behavior is being verified and why it might fail).`,
      },
    ],
    examples: [
      {
        caption: 'A simple function and a Jest/Vitest-style test using Arrange-Act-Assert',
        code: `// sum.js
export function sum(a, b) {
  return a + b;
}

// sum.test.js
import { sum } from './sum.js';

describe('sum()', () => {
  test('adds two positive numbers correctly', () => {
    // Arrange
    const a = 2;
    const b = 3;

    // Act
    const result = sum(a, b);

    // Assert
    expect(result).toBe(5);
  });

  test('adds negative numbers correctly', () => {
    expect(sum(-2, -3)).toBe(-5);
  });
});

// Running "npx vitest" (or "npx jest") would report:`,
        output: `PASS  sum.test.js
  sum()
    ✓ adds two positive numbers correctly
    ✓ adds negative numbers correctly

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total`,
      },
      {
        caption: 'Testing that a function throws an error under invalid input',
        code: `// validateAge.js
export function validateAge(age) {
  if (age < 0) {
    throw new Error('Age cannot be negative');
  }
  return age;
}

// validateAge.test.js
import { validateAge } from './validateAge.js';

test('throws an error for a negative age', () => {
  expect(() => validateAge(-1)).toThrow('Age cannot be negative');
});

test('returns the age when valid', () => {
  expect(validateAge(28)).toBe(28);
});`,
        output: `PASS  validateAge.test.js
  ✓ throws an error for a negative age
  ✓ returns the age when valid

Tests: 2 passed, 2 total`,
      },
    ],
    commonMistakes: [
      'Writing tests that depend on execution order or shared mutable state between tests, causing failures that only appear depending on which tests ran first.',
      'Testing implementation details (internal variable names, private helper calls) instead of observable behavior, which makes tests break on harmless refactors.',
      'Forgetting to test the "unhappy path" — invalid input, thrown errors, edge cases like empty arrays or zero — and only covering the obvious success case.',
      'Wrapping <code>expect(fn())</code> around a call expected to throw, instead of <code>expect(() => fn()).toThrow()</code> — calling the throwing function outside the assertion crashes the test itself rather than being caught by the matcher.',
    ],
    keyPoints: [
      'Arrange-Act-Assert is the standard structure for a clear, readable test: set up input, perform the action, check the result.',
      'Jest and Vitest share a similar API: <code>describe()</code> groups tests, <code>test()</code>/<code>it()</code> defines one, and <code>expect().toBe()</code> (and other matchers) asserts outcomes.',
      'Good unit tests are isolated, deterministic, and readable enough to explain what behavior would break if they failed.',
      'Cover both the expected ("happy path") behavior and error/edge cases, not just the simplest successful scenario.',
    ],
  },
}
